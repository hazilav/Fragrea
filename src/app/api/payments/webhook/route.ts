import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getPaymentService } from '@/lib/payments/factory';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const headers: Record<string, string> = {};
    req.headers.forEach((val, key) => {
      headers[key] = val;
    });

    const paymentService = getPaymentService();
    const result = await paymentService.handleWebhook(payload, headers);

    if (!result.handled) {
      return NextResponse.json(
        { success: false, error: result.error || 'Webhook unhandled' },
        { status: 400 }
      );
    }

    // Reconcile order payment status if captured
    if (result.status === 'CAPTURED' && (result.orderId || result.transactionId)) {
      const order = await prisma.order.findFirst({
        where: result.orderId
          ? { id: result.orderId }
          : { payments: { some: { transactionId: result.transactionId } } },
        include: { payments: true },
      });

      if (order) {
        await prisma.payment.updateMany({
          where: { orderId: order.id },
          data: { status: 'CAPTURED', transactionId: result.transactionId },
        });

        await prisma.order.update({
          where: { id: order.id },
          data: { status: 'CONFIRMED' },
        });
      }
    }

    return NextResponse.json({ success: true, event: result.event });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
