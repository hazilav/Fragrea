import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getPaymentService } from '@/lib/payments/factory';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, transactionId, verificationToken } = body;

    if (!transactionId) {
      return NextResponse.json(
        { success: false, error: 'Transaction ID is required for verification.' },
        { status: 400 }
      );
    }

    // 1. Locate the Order and Payment records in the database
    const order = await prisma.order.findFirst({
      where: orderId ? { OR: [{ id: orderId }, { orderNumber: orderId }] } : undefined,
      include: { payments: true },
    });

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found.' }, { status: 404 });
    }

    const payment = order.payments.find((p) => p.transactionId === transactionId) || order.payments[0];

    // 2. CRITICAL SECURITY: Query the payment provider DIRECTLY on the server
    // Never trust frontend claims of success!
    const paymentService = getPaymentService();
    const verificationResult = await paymentService.verifyPayment({
      transactionId,
      orderId: order.orderNumber,
      verificationToken,
    });

    // 3. If Provider rejects verification or flags failure
    if (!verificationResult.isVerified || verificationResult.status !== 'CAPTURED') {
      if (payment) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'FAILED',
            gatewayResponse: JSON.stringify({
              error: verificationResult.error || 'Server-side verification declined',
              declinedAt: new Date(),
            }),
          },
        });
      }

      return NextResponse.json(
        {
          success: false,
          verified: false,
          error:
            verificationResult.error ||
            'Payment could not be verified server-side with the payment gateway.',
        },
        { status: 400 }
      );
    }

    // 4. ONLY upon confirmed provider verification: mark payment as CAPTURED and order as CONFIRMED
    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'CAPTURED',
          transactionId: verificationResult.transactionId,
          gatewayResponse: JSON.stringify(verificationResult.gatewayResponse || {}),
        },
      });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'CONFIRMED',
      },
      include: {
        payments: true,
        items: true,
      },
    });

    return NextResponse.json({
      success: true,
      verified: true,
      order: updatedOrder,
      paymentStatus: 'CAPTURED',
      provider: paymentService.providerName,
      transactionId: verificationResult.transactionId,
    });
  } catch (error: any) {
    console.error('Server-side payment verification error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
