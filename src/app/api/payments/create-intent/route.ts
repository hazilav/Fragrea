import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getPaymentService } from '@/lib/payments/factory';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, paymentMethod = 'CREDIT_CARD' } = body;

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'Order ID is required.' }, { status: 400 });
    }

    const order = await prisma.order.findFirst({
      where: { OR: [{ id: orderId }, { orderNumber: orderId }] },
      include: { payments: true },
    });

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found.' }, { status: 404 });
    }

    // Check if already captured
    const alreadyCaptured = order.payments.some((p) => p.status === 'CAPTURED');
    if (alreadyCaptured) {
      return NextResponse.json(
        { success: false, error: 'Order is already settled and captured.' },
        { status: 400 }
      );
    }

    const paymentService = getPaymentService();

    const intentResult = await paymentService.createPaymentIntent({
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: order.total,
      currency: order.currency || 'USD',
      customerEmail: order.customerEmail,
      customerName: order.customerName,
      paymentMethod,
    });

    if (!intentResult.success) {
      return NextResponse.json(
        { success: false, error: intentResult.error || 'Failed to initialize payment intent' },
        { status: 400 }
      );
    }

    // Record or update payment record as PENDING
    const existingPayment = order.payments[0];
    if (existingPayment) {
      await prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          transactionId: intentResult.transactionId,
          status: 'PENDING',
          paymentMethod,
          gatewayResponse: JSON.stringify(intentResult.gatewayResponse || {}),
        },
      });
    } else {
      await prisma.payment.create({
        data: {
          orderId: order.id,
          amount: order.total,
          currency: order.currency || 'USD',
          paymentMethod,
          status: 'PENDING',
          transactionId: intentResult.transactionId,
          gatewayResponse: JSON.stringify(intentResult.gatewayResponse || {}),
        },
      });
    }

    return NextResponse.json({
      success: true,
      transactionId: intentResult.transactionId,
      clientSecret: intentResult.clientSecret,
      provider: paymentService.providerName,
      amount: intentResult.amount,
      currency: intentResult.currency,
    });
  } catch (error: any) {
    console.error('Payment intent error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
