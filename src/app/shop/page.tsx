import React from 'react';
import prisma from '@/lib/prisma';
import { parseJsonSafe } from '@/lib/formatters';
import { ProductData } from '@/types';
import ShopClient from '@/components/shop/ShopClient';

export const dynamic = 'force-dynamic';

async function getShopProducts(): Promise<ProductData[]> {
  try {
    const dbProducts = await prisma.product.findMany({
      where: { status: 'ACTIVE' },
      include: {
        collection: true,
        images: { orderBy: { displayOrder: 'asc' } },
        inventory: true,
      },
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
    });

    return dbProducts.map((p) => {
      const imageUrls = p.images.map((img) => img.url);

      return {
        ...p,
        stock: p.inventory ? p.inventory.quantity : p.stockQuantity,
        stockQuantity: p.inventory ? p.inventory.quantity : p.stockQuantity,
        isFeatured: p.featured,
        newArrival: (p as any).newArrival,
        isPublished: p.status === 'ACTIVE',
        isSale: Boolean(p.salePrice && p.salePrice < p.price),
        subtitle: p.shortDescription || '',
        volume: p.size,
        concentration: 'Extrait de Parfum (30% Oil)',
        gender: 'Unisex',
        rating: 4.95,
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
        images:
          imageUrls.length > 0
            ? imageUrls
            : ['https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1200'],
        topNotes: parseJsonSafe<string[]>(p.topNotes, []),
        heartNotes: parseJsonSafe<string[]>(p.heartNotes, []),
        baseNotes: parseJsonSafe<string[]>(p.baseNotes, []),
        collection: p.collection
          ? {
              id: p.collection.id,
              name: p.collection.name,
              slug: p.collection.slug,
              subtitle: p.collection.subtitle,
              description: p.collection.description,
              heroImage: p.collection.heroImage,
              featured: p.collection.featured,
              status: p.collection.status,
            }
          : null,
      };
    });
  } catch (error) {
    console.error('Error fetching shop products:', error);
    return [];
  }
}

export default async function ShopPage() {
  const products = await getShopProducts();

  return (
    <div className="min-h-screen bg-noir-950 text-ivory-100 py-14 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        {/* ============================================================ */}
        {/* EDITORIAL PAGE HEADER */}
        {/* ============================================================ */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="text-[10px] uppercase tracking-[0.42em] text-gold-400 font-light block select-none">
            Haute Parfumerie &bull; Grasse &bull; Paris
          </span>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif text-ivory-100 font-normal tracking-[0.05em]">
            SHOP FRAGRANCES
          </h1>
          <div className="w-12 h-px bg-gold-400/40 mx-auto" />
          <p className="text-xs sm:text-sm md:text-base text-ivory-300 font-light font-serif italic tracking-wide">
            &ldquo;Explore the Fragrea collection and find a fragrance that becomes yours.&rdquo;
          </p>
        </div>

        {/* ============================================================ */}
        {/* INTERACTIVE CONTROLS & PRODUCT GRID */}
        {/* ============================================================ */}
        <ShopClient initialProducts={products} />
      </div>
    </div>
  );
}
