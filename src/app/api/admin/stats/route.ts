import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const admin = await verifyAdminSession();
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const [
      orders,
      totalProducts,
      lowStockProducts,
      totalCustomers,
      recentOrders,
    ] = await Promise.all([
      prisma.order.findMany({ select: { total: true, status: true } }),
      prisma.product.count(),
      prisma.product.count({ where: { stockQuantity: { lte: 8 } } }),
      prisma.customer.count(),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          items: true,
        },
      }),
    ]);

    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => o.status === 'PENDING').length;

    return NextResponse.json({
      success: true,
      stats: {
        totalRevenue,
        totalOrders,
        pendingOrders,
        totalProducts,
        lowStockProducts,
        totalCustomers,
        recentOrders,
      },
    });
  } catch (error: any) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
