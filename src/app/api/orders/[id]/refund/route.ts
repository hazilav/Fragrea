import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminSession } from '@/lib/auth';
import { getPaymentService } from '@/lib/payments/factory';
import { sendCustomerNotification } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await verifyAdminSession();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin credentials required to issue refunds.' },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await req.json().catch(() => ({}));
    const { reason, amount } = body;

    const order = await prisma.order.findFirst({
      where: { OR: [{ id }, { orderNumber: id }] },
      include: { payments: true, items: true },
    });

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    if (order.status === 'REFUNDED') {
      return NextResponse.json(
        { success: false, error: 'This order has already been refunded.' },
        { status: 400 }
      );
    }

    const refundAmount = amount ? parseFloat(amount) : order.total;
    const payment = order.payments.find((p) => p.status === 'CAPTURED' || p.status === 'PAID') || order.payments[0];

    // Process refund through payment abstraction layer
    if (payment && payment.transactionId) {
      const paymentService = getPaymentService();
      const refundResult = await paymentService.refundPayment({
        transactionId: payment.transactionId,
        orderId: order.orderNumber,
        amount: refundAmount,
        reason: reason || 'Admin requested order refund',
      });

      if (!refundResult.success) {
        return NextResponse.json(
          {
            success: false,
            error: refundResult.error || 'Payment gateway declined refund processing.',
          },
          { status: 400 }
        );
      }
    }

    // 1. Update Payment status
    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'REFUNDED' },
      });
    }

    // 2. Restore Stock Inventory
    for (const item of order.items) {
      if (item.productId) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stockQuantity: { increment: item.quantity } },
        });
        await prisma.inventory.updateMany({
          where: { productId: item.productId },
          data: { quantity: { increment: item.quantity } },
        });
      }
    }

    // 3. Update Order status to REFUNDED
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: { status: 'REFUNDED' },
      include: {
        payments: true,
        items: true,
        shipment: true,
        timeline: { orderBy: { createdAt: 'asc' } },
        adminNotes: { orderBy: { createdAt: 'desc' } },
        notifications: { orderBy: { sentAt: 'desc' } },
      },
    });

    // 4. Add Order Timeline entry
    await prisma.orderTimeline.create({
      data: {
        orderId: order.id,
        status: 'REFUNDED',
        title: 'Settlement Refund Processed',
        note: `Refund of $${refundAmount.toFixed(2)} executed by ${admin.name || 'Admin'}${reason ? `: ${reason}` : ''}`,
        actor: 'ADMIN',
      },
    });

    // 5. Dispatch Customer Notification
    await sendCustomerNotification({
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerEmail: order.customerEmail,
      customerName: order.customerName,
      type: 'ORDER_REFUNDED',
      metadata: { refundAmount },
    });

    return NextResponse.json({
      success: true,
      message: 'Refund executed successfully and inventory repatriated to archive.',
      order: updatedOrder,
    });
  } catch (error: any) {
    console.error('Refund processing error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
