import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await verifyAdminSession();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin credentials required.' },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await req.json();
    const { name, slug, subtitle, description, heroImage, isFeatured, featured, status } = body;

    const collection = await prisma.collection.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(subtitle !== undefined && { subtitle }),
        ...(description !== undefined && { description }),
        ...(heroImage !== undefined && { heroImage }),
        ...(featured !== undefined && { featured: Boolean(featured) }),
        ...(isFeatured !== undefined && { featured: Boolean(isFeatured) }),
        ...(status !== undefined && { status }),
      },
    });

    return NextResponse.json({
      success: true,
      collection: { ...collection, isFeatured: collection.featured },
    });
  } catch (error: any) {
    console.error('Error updating collection:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await verifyAdminSession();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin credentials required.' },
        { status: 401 }
      );
    }

    const { id } = params;
    await prisma.collection.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Collection deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting collection:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
