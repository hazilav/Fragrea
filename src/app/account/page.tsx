import React from 'react';
import prisma from '@/lib/prisma';
import { verifyCustomerSession } from '@/lib/customerAuth';
import AccountClient, { CustomerProfile, OrderRecord } from '@/components/account/AccountClient';

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const session = await verifyCustomerSession();

  let initialCustomer: CustomerProfile | null = null;
  let initialOrders: OrderRecord[] = [];

  if (session) {
    initialCustomer = {
      userId: session.userId,
      email: session.email,
      firstName: session.firstName,
      lastName: session.lastName,
      phone: session.phone,
      totalOrders: session.totalOrders,
      totalSpent: session.totalSpent,
      defaultAddress: session.defaultAddress,
    };

    // Strictly fetch only this authenticated customer's orders
    const dbOrders = await prisma.order.findMany({
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
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    initialOrders = dbOrders.map((o) => {
      const latestPayment = o.payments[0];
      const paymentStatus = latestPayment ? latestPayment.status : 'PENDING';

      return {
        id: o.id,
        orderNumber: o.orderNumber,
        date: o.createdAt.toISOString(),
        status: o.status,
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
              addressLine2: o.shippingAddress.addressLine2 || undefined,
              city: o.shippingAddress.city,
              state: o.shippingAddress.state || '',
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
      };
    });
  }

  return (
    <AccountClient
      initialCustomer={initialCustomer}
      initialOrders={initialOrders}
    />
  );
}
