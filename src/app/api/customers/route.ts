import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Admin Authorization Guard: Customer directory is confidential
    const admin = await verifyAdminSession();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin credentials required.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');

    const where: any = {};
    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const customers = await prisma.customer.findMany({
      where,
      include: {
        addresses: true,
      },
      orderBy: { totalSpent: 'desc' },
    });

    const formatted = customers.map((c) => ({
      id: c.id,
      email: c.email,
      name: `${c.firstName} ${c.lastName}`.trim(),
      phone: c.phone,
      totalOrders: c.totalOrders,
      totalSpent: c.totalSpent,
      city: c.addresses[0]?.city || null,
      country: c.addresses[0]?.country || null,
      createdAt: c.createdAt,
    }));

    return NextResponse.json({ success: true, customers: formatted });
  } catch (error: any) {
    console.error('Error fetching customers:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
