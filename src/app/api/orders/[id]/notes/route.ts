import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await verifyAdminSession();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin credentials required to view internal notes.' },
        { status: 401 }
      );
    }

    const { id } = params;
    const order = await prisma.order.findFirst({
      where: { OR: [{ id }, { orderNumber: id }] },
    });

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    const notes = await prisma.orderNote.findMany({
      where: { orderId: order.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, notes });
  } catch (error: any) {
    console.error('Error fetching order notes:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await verifyAdminSession();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin credentials required to add internal notes.' },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await req.json();
    const { note } = body;

    if (!note || !note.trim()) {
      return NextResponse.json(
        { success: false, error: 'Note text cannot be empty.' },
        { status: 400 }
      );
    }

    const order = await prisma.order.findFirst({
      where: { OR: [{ id }, { orderNumber: id }] },
    });

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    const createdNote = await prisma.orderNote.create({
      data: {
        orderId: order.id,
        adminName: admin.name || admin.email || 'Maison Administrator',
        note: note.trim(),
        isInternal: true,
      },
    });

    return NextResponse.json({ success: true, note: createdNote }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating order note:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
