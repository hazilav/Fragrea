import React from 'react';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { parseJsonSafe } from '@/lib/formatters';
import { ProductData } from '@/types';
import ProductDetailClient from './ProductDetailClient';

export const dynamic = 'force-dynamic';

export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findFirst({
    where: {
      OR: [{ slug }, { id: slug }],
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

  if (!product) return null;

  // Also fetch 3 companion fragrances for layering recommendations
  const related = await prisma.product.findMany({
    where: {
      id: { not: product.id },
      status: 'ACTIVE',
    },
    include: {
      images: { orderBy: { displayOrder: 'asc' } },
      inventory: true,
    },
    take: 3,
  });

  const imageUrls = product.images.map((img) => img.url);

  // Extract notes from direct JSON fields or relationally joined ProductNotes
  const dbTop = parseJsonSafe<string[]>(product.topNotes, []);
  const dbHeart = parseJsonSafe<string[]>(product.heartNotes, []);
  const dbBase = parseJsonSafe<string[]>(product.baseNotes, []);

  const relTop = product.productNotes
    ?.filter((pn) => pn.noteType === 'TOP')
    .map((pn) => pn.fragranceNote.name) || [];
  const relHeart = product.productNotes
    ?.filter((pn) => pn.noteType === 'HEART')
    .map((pn) => pn.fragranceNote.name) || [];
  const relBase = product.productNotes
    ?.filter((pn) => pn.noteType === 'BASE')
    .map((pn) => pn.fragranceNote.name) || [];

  const topNotes = dbTop.length > 0 ? dbTop : relTop;
  const heartNotes = dbHeart.length > 0 ? dbHeart : relHeart;
  const baseNotes = dbBase.length > 0 ? dbBase : relBase;

  const desc = (product.shortDescription || '') + ' ' + (product.description || '');

  const olfactoryFamily =
    (product as any).olfactoryFamily ||
    (desc.includes('Oud') || desc.includes('Agarwood')
      ? 'Woody Oriental'
      : desc.includes('Sandalwood') || desc.includes('Santal')
      ? 'Woody Creamy'
      : desc.includes('Amber') || desc.includes('Labdanum')
      ? 'Warm Amber'
      : desc.includes('Rose')
      ? 'Dark Floral'
      : desc.includes('Tobacco') || desc.includes('Leather') || desc.includes('Cuir')
      ? 'Leather & Tobacco'
      : desc.includes('Iris') || desc.includes('Orris')
      ? 'Powdery Woody'
      : desc.includes('Vetiver')
      ? 'Earthy Fresh'
      : desc.includes('Néroli') || desc.includes('Bergamot') || desc.includes('Citrus')
      ? 'Citrus Aromatic'
      : 'Woody Oriental');

  const stockLevel = product.inventory ? product.inventory.quantity : product.stockQuantity;

  const formattedProduct: ProductData = {
    ...product,
    stock: stockLevel,
    stockQuantity: stockLevel,
    isFeatured: product.featured,
    isPublished: product.status === 'ACTIVE',
    isSale: Boolean(product.salePrice && product.salePrice < product.price),
    subtitle: product.shortDescription || '',
    volume: product.size,
    concentration: 'Extrait de Parfum (30% Oil)',
    gender: 'Unisex',
    rating: 4.96,
    olfactoryFamily,
    longevity: '14 - 18 Hours',
    sillage: 'Sovereign & Magnetic',
    images:
      imageUrls.length > 0
        ? imageUrls
        : ['https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1200'],
    topNotes: topNotes.length > 0 ? topNotes : ['Calabrian Bergamot', 'Cracked Cardamom'],
    heartNotes: heartNotes.length > 0 ? heartNotes : ['Taif Rose Absolu'],
    baseNotes: baseNotes.length > 0 ? baseNotes : ['Cambodian Agarwood (Oud)', 'Bourbon Vanilla Bean'],
    collection: product.collection
      ? {
          id: product.collection.id,
          name: product.collection.name,
          slug: product.collection.slug,
          subtitle: product.collection.subtitle,
          description: product.collection.description,
          heroImage: product.collection.heroImage,
          featured: product.collection.featured,
          status: product.collection.status,
        }
      : null,
  };

  const formattedRelated: ProductData[] = related.map((r) => {
    const rImages = r.images.map((img) => img.url);
    const rStock = r.inventory ? r.inventory.quantity : r.stockQuantity;
    return {
      ...r,
      stock: rStock,
      stockQuantity: rStock,
      isFeatured: r.featured,
      isPublished: r.status === 'ACTIVE',
      isSale: Boolean(r.salePrice && r.salePrice < r.price),
      subtitle: r.shortDescription || '',
      volume: r.size,
      concentration: 'Extrait de Parfum (30% Oil)',
      gender: 'Unisex',
      rating: 4.94,
      olfactoryFamily: 'Woody Oriental',
      images:
        rImages.length > 0
          ? rImages
          : ['https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1200'],
      topNotes: parseJsonSafe<string[]>(r.topNotes, []),
      heartNotes: parseJsonSafe<string[]>(r.heartNotes, []),
      baseNotes: parseJsonSafe<string[]>(r.baseNotes, []),
    };
  });

  return { product: formattedProduct, related: formattedRelated };
}

export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const data = await getProductBySlug(params.slug);

  if (!data) {
    notFound();
  }

  return <ProductDetailClient product={data.product} related={data.related} />;
}
