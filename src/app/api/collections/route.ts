import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const collections = await prisma.collection.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = collections.map((c) => ({
      ...c,
      isFeatured: c.featured,
    }));

    return NextResponse.json({ success: true, collections: formatted });
  } catch (error: any) {
    console.error('Error fetching collections:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Admin Authorization Guard
    const admin = await verifyAdminSession();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin credentials required.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, slug, subtitle, description, heroImage, isFeatured, featured, status } = body;

    if (!name) {
      return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 });
    }

    const colSlug =
      slug ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    const collection = await prisma.collection.create({
      data: {
        name,
        slug: colSlug,
        subtitle: subtitle || '',
        description: description || '',
        heroImage: heroImage || 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1200',
        featured: isFeatured !== undefined ? Boolean(isFeatured) : Boolean(featured),
        status: status || 'ACTIVE',
      },
    });

    return NextResponse.json({
      success: true,
      collection: { ...collection, isFeatured: collection.featured },
    });
  } catch (error: any) {
    console.error('Error creating collection:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
