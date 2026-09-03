import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminSession } from '@/lib/auth';
import { sendCustomerNotification } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

function getStatusTitle(status: string): string {
  switch (status) {
    case 'PENDING':
      return 'Order Placed';
    case 'CONFIRMED':
      return 'Order Confirmed';
    case 'PROCESSING':
      return 'Commission in Atelier Preparation';
    case 'SHIPPED':
      return 'Dispatched via Private Courier';
    case 'DELIVERED':
      return 'Safely Delivered to Patron';
    case 'CANCELLED':
      return 'Commission Cancelled';
    case 'REFUNDED':
      return 'Settlement Refund Processed';
    default:
      return `Status: ${status}`;
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(req.url);
    const clientEmail = searchParams.get('email');

    const admin = await verifyAdminSession();

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
      include: {
        items: {
          include: {
            product: {
              include: { images: true },
            },
          },
        },
        shippingAddress: true,
        billingAddress: true,
        payments: true,
        shipment: true,
        customer: true,
        coupon: true,
        timeline: { orderBy: { createdAt: 'asc' } },
        adminNotes: { orderBy: { createdAt: 'desc' } },
        notifications: { orderBy: { sentAt: 'desc' } },
      },
    });

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    // User Data Privacy Isolation:
    // If not an admin, requester must match the order's customerEmail
    // AND internal admin notes must NOT be leaked to customers
    if (!admin) {
      if (!clientEmail || clientEmail.toLowerCase() !== order.customerEmail.toLowerCase()) {
        return NextResponse.json(
          { success: false, error: 'Access forbidden. You cannot view another customer’s private order.' },
          { status: 403 }
        );
      }
      // Strip internal admin notes for client-side view
      (order as any).adminNotes = [];
    }

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error('Error fetching order:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Admin-Only Operation Guard
    const admin = await verifyAdminSession();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin credentials required to modify orders.' },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await req.json();
    const {
      status,
      specialInstructions,
      shipmentStatus,
      trackingNumber,
      carrier,
      adminNote,
      cancellationReason,
    } = body;

    const order = await prisma.order.findFirst({
      where: { OR: [{ id }, { orderNumber: id }] },
      include: { items: true, shipment: true, payments: true },
    });

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    const VALID_STATUSES = [
      'PENDING',
      'CONFIRMED',
      'PROCESSING',
      'SHIPPED',
      'DELIVERED',
      'CANCELLED',
      'REFUNDED',
    ];

    const nextStatus = status ? status.toUpperCase() : undefined;
    if (nextStatus && !VALID_STATUSES.includes(nextStatus)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid status '${status}'. Must be one of: ${VALID_STATUSES.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Restore inventory if cancelling or refunding an active order
    if (
      nextStatus &&
      ['CANCELLED', 'REFUNDED'].includes(nextStatus) &&
      !['CANCELLED', 'REFUNDED'].includes(order.status)
    ) {
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
    }

    // Update order record
    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        ...(nextStatus && { status: nextStatus }),
        ...(specialInstructions !== undefined && { specialInstructions }),
      },
      include: {
        items: true,
        shipment: true,
        shippingAddress: true,
        payments: true,
        timeline: true,
        adminNotes: true,
        notifications: true,
      },
    });

    // Update shipment if provided or infer from status
    const effectiveShipStatus = shipmentStatus || (nextStatus === 'SHIPPED' ? 'SHIPPED' : nextStatus === 'DELIVERED' ? 'DELIVERED' : undefined);
    if (effectiveShipStatus || trackingNumber || carrier) {
      await prisma.shipping.upsert({
        where: { orderId: order.id },
        create: {
          orderId: order.id,
          carrier: carrier || 'White-Glove Private Courier',
          status: effectiveShipStatus || 'PROCESSING',
          trackingNumber: trackingNumber || null,
          dispatchedAt: effectiveShipStatus === 'SHIPPED' ? new Date() : null,
          deliveredAt: effectiveShipStatus === 'DELIVERED' ? new Date() : null,
        },
        update: {
          ...(carrier && { carrier }),
          ...(effectiveShipStatus && { status: effectiveShipStatus }),
          ...(trackingNumber && { trackingNumber }),
          ...(effectiveShipStatus === 'SHIPPED' && { dispatchedAt: new Date() }),
          ...(effectiveShipStatus === 'DELIVERED' && { deliveredAt: new Date() }),
        },
      });
    }

    // Add Timeline Event if status changed
    if (nextStatus && nextStatus !== order.status) {
      await prisma.orderTimeline.create({
        data: {
          orderId: order.id,
          status: nextStatus,
          title: getStatusTitle(nextStatus),
          note: adminNote || `Status updated from ${order.status} to ${nextStatus}`,
          actor: 'ADMIN',
        },
      });

      // Dispatch appropriate Customer Notification
      if (nextStatus === 'CONFIRMED') {
        await sendCustomerNotification({
          orderId: order.id,
          orderNumber: order.orderNumber,
          customerEmail: order.customerEmail,
          customerName: order.customerName,
          type: 'ORDER_CONFIRMED',
        });
      } else if (nextStatus === 'PROCESSING') {
        await sendCustomerNotification({
          orderId: order.id,
          orderNumber: order.orderNumber,
          customerEmail: order.customerEmail,
          customerName: order.customerName,
          type: 'ORDER_PROCESSING',
        });
      } else if (nextStatus === 'SHIPPED') {
        await sendCustomerNotification({
          orderId: order.id,
          orderNumber: order.orderNumber,
          customerEmail: order.customerEmail,
          customerName: order.customerName,
          type: 'ORDER_SHIPPED',
          metadata: {
            carrier: carrier || order.shipment?.carrier || 'White-Glove Private Courier',
            trackingNumber: trackingNumber || order.shipment?.trackingNumber || undefined,
          },
        });
      } else if (nextStatus === 'DELIVERED') {
        await sendCustomerNotification({
          orderId: order.id,
          orderNumber: order.orderNumber,
          customerEmail: order.customerEmail,
          customerName: order.customerName,
          type: 'ORDER_DELIVERED',
        });
      } else if (nextStatus === 'CANCELLED') {
        await sendCustomerNotification({
          orderId: order.id,
          orderNumber: order.orderNumber,
          customerEmail: order.customerEmail,
          customerName: order.customerName,
          type: 'ORDER_CANCELLED',
          metadata: { cancellationReason },
        });
      } else if (nextStatus === 'REFUNDED') {
        await sendCustomerNotification({
          orderId: order.id,
          orderNumber: order.orderNumber,
          customerEmail: order.customerEmail,
          customerName: order.customerName,
          type: 'ORDER_REFUNDED',
          metadata: { refundAmount: order.total },
        });
      }
    }

    // Refresh order with new timeline, shipment, and notes
    const finalOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        items: true,
        shipment: true,
        shippingAddress: true,
        payments: true,
        timeline: { orderBy: { createdAt: 'asc' } },
        adminNotes: { orderBy: { createdAt: 'desc' } },
        notifications: { orderBy: { sentAt: 'desc' } },
      },
    });

    return NextResponse.json({ success: true, order: finalOrder });
  } catch (error: any) {
    console.error('Error updating order:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
