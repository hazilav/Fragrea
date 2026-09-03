import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminSession } from '@/lib/auth';
import { parseJsonSafe } from '@/lib/formatters';
import { getStorageService } from '@/lib/storage/factory';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        collection: true,
        images: { orderBy: { displayOrder: 'asc' } },
        inventory: true,
        productNotes: {
          include: { fragranceNote: true },
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    const imageUrls = product.images.map((img) => img.url);
    const top = parseJsonSafe<string[]>(product.topNotes, []);
    const heart = parseJsonSafe<string[]>(product.heartNotes, []);
    const base = parseJsonSafe<string[]>(product.baseNotes, []);

    const formatted = {
      ...product,
      stock: product.inventory ? product.inventory.quantity : product.stockQuantity,
      stockQuantity: product.inventory ? product.inventory.quantity : product.stockQuantity,
      isFeatured: product.featured,
      isPublished: product.status === 'ACTIVE',
      isSale: Boolean(product.salePrice && product.salePrice < product.price),
      subtitle: product.shortDescription || '',
      volume: product.size,
      concentration: 'Extrait de Parfum (30% Oil)',
      gender: 'Unisex',
      rating: 4.96,
      olfactoryFamily: product.shortDescription?.includes('Oud')
        ? 'Woody Oriental'
        : product.shortDescription?.includes('Sandalwood')
        ? 'Woody Creamy'
        : product.shortDescription?.includes('Labdanum')
        ? 'Warm Amber'
        : product.shortDescription?.includes('Rose')
        ? 'Dark Floral'
        : product.shortDescription?.includes('Tobacco')
        ? 'Leather & Tobacco'
        : product.shortDescription?.includes('Iris')
        ? 'Powdery Woody'
        : product.shortDescription?.includes('Vetiver')
        ? 'Earthy Fresh'
        : 'Luminous Floral',
      longevity: '14 - 18 Hours',
      sillage: 'Sovereign & Magnetic',
      images: imageUrls.length > 0 ? imageUrls : ['https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1200'],
      topNotes: top,
      heartNotes: heart,
      baseNotes: base,
    };

    return NextResponse.json({ success: true, product: formatted });
  } catch (error: any) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Admin Authorization Guard
    const admin = await verifyAdminSession();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin credentials required.' },
        { status: 401 }
      );
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        {
          success: false,
          error:
            'MySQL database is not connected on Vercel. Please add DATABASE_URL in Vercel Project Settings (Settings > Environment Variables).',
        },
        { status: 503 }
      );
    }

    const { id } = params;
    const body = await req.json();

    const existing = await prisma.product.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.sku !== undefined) updateData.sku = body.sku;
    if (body.shortDescription !== undefined) updateData.shortDescription = body.shortDescription;
    if (body.subtitle !== undefined) updateData.shortDescription = body.subtitle;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.price !== undefined) updateData.price = parseFloat(body.price);
    if (body.salePrice !== undefined) {
      updateData.salePrice = body.salePrice ? parseFloat(body.salePrice) : null;
    }
    if (body.currency !== undefined) updateData.currency = body.currency;
    if (body.size !== undefined) updateData.size = body.size;
    if (body.volume !== undefined) updateData.size = body.volume;
    if (body.stockQuantity !== undefined) updateData.stockQuantity = parseInt(body.stockQuantity);
    if (body.stock !== undefined) updateData.stockQuantity = parseInt(body.stock);
    if (body.status !== undefined) updateData.status = body.status;
    if (body.isPublished !== undefined) updateData.status = body.isPublished ? 'ACTIVE' : 'DRAFT';
    if (body.featured !== undefined) updateData.featured = Boolean(body.featured);
    if (body.isFeatured !== undefined) updateData.featured = Boolean(body.isFeatured);
    if (body.newArrival !== undefined) updateData.newArrival = Boolean(body.newArrival);
    if (body.collectionId !== undefined) updateData.collectionId = body.collectionId || null;
    if (body.baseDescription !== undefined) updateData.baseDescription = body.baseDescription;

    if (body.topNotes !== undefined) {
      updateData.topNotes = JSON.stringify(Array.isArray(body.topNotes) ? body.topNotes : []);
    }
    if (body.heartNotes !== undefined) {
      updateData.heartNotes = JSON.stringify(Array.isArray(body.heartNotes) ? body.heartNotes : []);
    }
    if (body.baseNotes !== undefined) {
      updateData.baseNotes = JSON.stringify(Array.isArray(body.baseNotes) ? body.baseNotes : []);
    }

    const updated = await prisma.product.update({
      where: { id: existing.id },
      data: updateData,
      include: {
        collection: true,
        images: true,
        inventory: true,
      },
    });

    // Update inventory ledger if stock was updated
    if (updateData.stockQuantity !== undefined) {
      await prisma.inventory.upsert({
        where: { productId: existing.id },
        create: {
          productId: existing.id,
          quantity: updateData.stockQuantity,
          reservedQuantity: 0,
        },
        update: {
          quantity: updateData.stockQuantity,
        },
      });
    }

    // Synchronize product images if provided
    if (Array.isArray(body.images)) {
      await prisma.productImage.deleteMany({
        where: { productId: existing.id },
      });
      if (body.images.length > 0) {
        await prisma.productImage.createMany({
          data: body.images.map((url: string, idx: number) => ({
            productId: existing.id,
            url: typeof url === 'string' ? url : (url as any).url,
            isPrimary: idx === 0,
            displayOrder: idx + 1,
            altText: `${existing.name} Flacon Image ${idx + 1}`,
          })),
        });
      }
    }

    return NextResponse.json({ success: true, product: updated });
  } catch (error: any) {
    console.error('Error updating product:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Admin Authorization Guard
    const admin = await verifyAdminSession();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin credentials required.' },
        { status: 401 }
      );
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        {
          success: false,
          error:
            'MySQL database is not connected on Vercel. Please add DATABASE_URL in Vercel Project Settings (Settings > Environment Variables).',
        },
        { status: 503 }
      );
    }

    const { id } = params;
    const existing = await prisma.product.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: { images: true },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    // Clean up binary image assets from Image Storage
    const storageService = getStorageService();
    for (const img of existing.images) {
      if (img.url && img.url.startsWith('/uploads/')) {
        await storageService.delete(img.url);
      }
    }

    await prisma.product.delete({ where: { id: existing.id } });
    return NextResponse.json({ success: true, message: 'Product retired from archive and storage freed' });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
