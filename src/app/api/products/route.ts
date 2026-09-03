import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminSession } from '@/lib/auth';
import { validateProduct } from '@/lib/validations';
import { parseJsonSafe } from '@/lib/formatters';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const collectionSlug = searchParams.get('collection');
    const family = searchParams.get('family');
    const featured = searchParams.get('featured');
    const sort = searchParams.get('sort') || 'featured';
    const includeDrafts = searchParams.get('includeDrafts') === 'true';

    const where: any = {};

    if (!includeDrafts) {
      where.status = 'ACTIVE';
    }

    if (featured === 'true') {
      where.featured = true;
    }

    if (collectionSlug && collectionSlug !== 'all') {
      where.collection = {
        slug: collectionSlug,
      };
    }

    if (family && family !== 'all') {
      where.OR = [
        { description: { contains: family } },
        { shortDescription: { contains: family } },
        { baseDescription: { contains: family } },
        { topNotes: { contains: family } },
        { heartNotes: { contains: family } },
        { baseNotes: { contains: family } },
      ];
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
        { shortDescription: { contains: search } },
        { description: { contains: search } },
        { topNotes: { contains: search } },
        { heartNotes: { contains: search } },
        { baseNotes: { contains: search } },
      ];
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price-asc') orderBy = { price: 'asc' };
    else if (sort === 'price-desc') orderBy = { price: 'desc' };
    else if (sort === 'featured') orderBy = [{ featured: 'desc' }, { createdAt: 'desc' }];
    else if (sort === 'newest') orderBy = { newArrival: 'desc' };

    const products = await prisma.product.findMany({
      where,
      include: {
        collection: true,
        images: { orderBy: { displayOrder: 'asc' } },
        productNotes: {
          include: { fragranceNote: true },
          orderBy: { displayOrder: 'asc' },
        },
        inventory: true,
      },
      orderBy,
    });

    const formatted = products.map((p) => {
      // Map relational images to array of strings for client ease
      const imageUrls = p.images.map((img) => img.url);

      // Map relational notes or parse JSON strings
      const top = parseJsonSafe<string[]>(p.topNotes, []);
      const heart = parseJsonSafe<string[]>(p.heartNotes, []);
      const base = parseJsonSafe<string[]>(p.baseNotes, []);

      return {
        ...p,
        stock: p.inventory ? p.inventory.quantity : p.stockQuantity,
        stockQuantity: p.inventory ? p.inventory.quantity : p.stockQuantity,
        isFeatured: p.featured,
        isPublished: p.status === 'ACTIVE',
        isSale: Boolean(p.salePrice && p.salePrice < p.price),
        subtitle: p.shortDescription || '',
        olfactoryFamily: p.shortDescription?.includes('Oud')
          ? 'Woody Oriental'
          : p.shortDescription?.includes('Sandalwood')
          ? 'Woody Creamy'
          : p.shortDescription?.includes('Labdanum')
          ? 'Warm Amber'
          : p.shortDescription?.includes('Rose')
          ? 'Dark Floral'
          : p.shortDescription?.includes('Tobacco')
          ? 'Leather & Tobacco'
          : p.shortDescription?.includes('Iris')
          ? 'Powdery Woody'
          : p.shortDescription?.includes('Vetiver')
          ? 'Earthy Fresh'
          : 'Luminous Floral',
        longevity: '14 - 18 Hours',
        sillage: 'Sovereign & Magnetic',
        volume: p.size,
        concentration: 'Extrait de Parfum (30% Oil)',
        gender: 'Unisex',
        rating: 4.94,
        images: imageUrls.length > 0 ? imageUrls : ['https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1200'],
        topNotes: top,
        heartNotes: heart,
        baseNotes: base,
      };
    });

    return NextResponse.json({ success: true, count: formatted.length, products: formatted });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // 1. Admin Authorization Guard
    const admin = await verifyAdminSession();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin credentials required.' },
        { status: 401 }
      );
    }

    const body = await req.json();

    // 2. Server-Side Validation
    const validation = validateProduct(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    const {
      name,
      slug,
      sku,
      shortDescription,
      description,
      price,
      salePrice,
      currency,
      size,
      stockQuantity,
      status,
      featured,
      newArrival,
      collectionId,
      topNotes,
      heartNotes,
      baseNotes,
      baseDescription,
      images,
    } = body;

    const productSlug =
      slug ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    const productSku = sku || `FRG-EXT-${Math.floor(100 + Math.random() * 900)}`;

    const existingSlug = await prisma.product.findUnique({ where: { slug: productSlug } });
    if (existingSlug) {
      return NextResponse.json(
        { success: false, error: `Product slug '${productSlug}' already in use.` },
        { status: 400 }
      );
    }

    const stock = stockQuantity ? parseInt(stockQuantity) : 10;

    const created = await prisma.product.create({
      data: {
        name,
        slug: productSlug,
        sku: productSku,
        shortDescription: shortDescription || '',
        description: description || '',
        price: parseFloat(price),
        salePrice: salePrice ? parseFloat(salePrice) : null,
        currency: currency || 'USD',
        size: size || '100 ml / 3.4 FL. OZ.',
        stockQuantity: stock,
        status: status || 'ACTIVE',
        featured: Boolean(featured),
        newArrival: Boolean(newArrival),
        collectionId: collectionId || null,
        topNotes: JSON.stringify(Array.isArray(topNotes) ? topNotes : []),
        heartNotes: JSON.stringify(Array.isArray(heartNotes) ? heartNotes : []),
        baseNotes: JSON.stringify(Array.isArray(baseNotes) ? baseNotes : []),
        baseDescription: baseDescription || '',
        inventory: {
          create: {
            quantity: stock,
            reservedQuantity: 0,
            lowStockThreshold: 5,
            batchNumber: `BAT-${new Date().getFullYear()}-${productSku.slice(-3)}`,
          },
        },
        images: {
          create: Array.isArray(images)
            ? images.map((img: any, idx: number) => ({
                url: typeof img === 'string' ? img : (img.url || ''),
                altText: (typeof img === 'object' && img.altText) ? img.altText : `${name} Bottle`,
                isPrimary: (typeof img === 'object' && img.isPrimary !== undefined) ? Boolean(img.isPrimary) : idx === 0,
                displayOrder: (typeof img === 'object' && img.displayOrder !== undefined) ? img.displayOrder : idx + 1,
              }))
            : [],
        },
      },
      include: {
        images: true,
        inventory: true,
        collection: true,
      },
    });

    return NextResponse.json({ success: true, product: created });
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
