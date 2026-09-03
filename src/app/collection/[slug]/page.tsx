import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import prisma from '@/lib/prisma';
import { parseJsonSafe } from '@/lib/formatters';
import { ProductData } from '@/types';
import ProductCard from '@/components/ui/ProductCard';

export const dynamic = 'force-dynamic';

async function getCollectionData(slug: string) {
  try {
    const collection = await prisma.collection.findUnique({
      where: { slug },
      include: {
        products: {
          where: { status: 'ACTIVE' },
          include: {
            collection: true,
            images: { orderBy: { displayOrder: 'asc' } },
            inventory: true,
          },
          orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
        },
      },
    });

    if (!collection) return null;

    const formattedProducts: ProductData[] = collection.products.map((p) => {
      const imageUrls = p.images.map((img) => img.url);

      return {
        ...p,
        stock: p.inventory ? p.inventory.quantity : p.stockQuantity,
        stockQuantity: p.inventory ? p.inventory.quantity : p.stockQuantity,
        isFeatured: p.featured,
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
        collection: {
          id: collection.id,
          name: collection.name,
          slug: collection.slug,
          subtitle: collection.subtitle,
          description: collection.description,
          heroImage: collection.heroImage,
          featured: collection.featured,
          status: collection.status,
        },
      };
    });

    return { collection, products: formattedProducts };
  } catch (err) {
    console.error(`Error fetching collection by slug (${slug}):`, err);
    return null;
  }
}

export default async function CollectionPage({
  params,
}: {
  params: { slug: string };
}) {
  const data = await getCollectionData(params.slug);

  if (!data) {
    notFound();
  }

  const { collection, products } = data;

  return (
    <div className="min-h-screen bg-noir-950 text-ivory-100 py-12 animate-fade-in font-sans">
      {/* Breadcrumb Navigation */}
      <div className="max-w-7xl mx-auto px-6 mb-8">
        <nav className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-ivory-400">
          <Link href="/" className="hover:text-gold-300 transition-colors">
            Maison
          </Link>
          <ChevronRight className="w-3 h-3 text-gold-dim" />
          <Link href="/collections" className="hover:text-gold-300 transition-colors">
            Collections
          </Link>
          <ChevronRight className="w-3 h-3 text-gold-dim" />
          <span className="text-gold-400 font-medium">{collection.name}</span>
        </nav>
      </div>

      {/* Atmospheric Collection Hero */}
      <div className="relative min-h-[460px] flex items-center justify-center overflow-hidden border-y border-gold-dim bg-noir-900 mb-16">
        <Image
          src={collection.heroImage || 'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?q=80&w=1400'}
          alt={collection.name}
          fill
          priority
          className="object-cover brightness-[0.38] contrast-[1.1] scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-noir-950 via-noir-950/60 to-transparent" />

        <div className="relative z-10 max-w-3xl mx-auto px-6 py-20 text-center space-y-4">
          <span className="text-[10px] uppercase tracking-[0.35em] text-gold-400 font-medium block">
            House Chapter Archive
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif text-ivory-100 font-normal">
            {collection.name}
          </h1>
          <p className="text-sm text-gold-300 italic font-light max-w-xl mx-auto">
            {collection.subtitle}
          </p>
          <div className="w-16 h-px bg-gold-400/50 mx-auto" />
          <p className="text-xs sm:text-sm text-ivory-300 font-light max-w-xl mx-auto leading-relaxed">
            {collection.description}
          </p>
        </div>
      </div>

      {/* Products in Collection Grid */}
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <span className="text-xs uppercase tracking-widest text-ivory-400">
            {products.length} {products.length === 1 ? 'Flacon' : 'Flacons'} in this Chapter
          </span>
          <Link
            href="/collections"
            className="text-xs uppercase tracking-widest text-gold-400 hover:text-gold-200"
          >
            &larr; View All Chapters
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
