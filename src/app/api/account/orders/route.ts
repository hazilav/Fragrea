import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyCustomerSession } from '@/lib/customerAuth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await verifyCustomerSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please sign in to view your orders.' },
        { status: 401 }
      );
    }

    // STRICT CUSTOMER ISOLATION:
    // Only return orders matched by the customer's userId or verified email
    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { userId: session.userId },
          { customerId: session.customerId },
          { customerEmail: session.email },
        ],
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        shippingAddress: true,
        payments: {
          select: {
            id: true,
            status: true,
            paymentMethod: true,
            amount: true,
            createdAt: true,
          },
        },
        timeline: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedOrders = orders.map((o) => {
      // Determine overall payment status
      const latestPayment = o.payments[0];
      const paymentStatus = latestPayment ? latestPayment.status : 'PENDING';

      return {
        id: o.id,
        orderNumber: o.orderNumber,
        date: o.createdAt,
        status: o.status, // Pending, Confirmed, Processing, Shipped, Delivered, Cancelled, Refunded
        paymentStatus,
        subtotal: o.subtotal,
        shippingFee: o.shippingFee,
        total: o.total,
        totalAmount: o.total,
        itemCount: o.items.reduce((sum, item) => sum + item.quantity, 0),
        items: o.items.map((i) => ({
          id: i.id,
          productName: i.productName,
          productImage: i.productImage,
          productSku: i.productSku,
          size: i.size,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          totalPrice: i.totalPrice,
          slug: i.product?.slug || '',
        })),
        shippingAddress: o.shippingAddress
          ? {
              recipientName: `${o.shippingAddress.firstName} ${o.shippingAddress.lastName}`,
              addressLine1: o.shippingAddress.addressLine1,
              addressLine2: o.shippingAddress.addressLine2,
              city: o.shippingAddress.city,
              state: o.shippingAddress.state,
              postalCode: o.shippingAddress.postalCode,
              country: o.shippingAddress.country,
            }
          : {
              recipientName: o.customerName,
              addressLine1: 'Vault White-Glove Dispatch',
              city: '',
              state: '',
              postalCode: '',
              country: 'United States',
            },
        timeline: o.timeline,
      };
    });

    return NextResponse.json({ success: true, orders: formattedOrders });
  } catch (error: any) {
    console.error('Customer Orders Fetch Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve your order archives.' },
      { status: 500 }
    );
  }
}
