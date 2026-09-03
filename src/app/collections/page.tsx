import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Sparkles, Compass } from 'lucide-react';
import prisma from '@/lib/prisma';
import { formatCurrency } from '@/lib/formatters';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Anthologies & Collections | FRAGREA Haute Parfumerie',
  description:
    'Explore the sovereign anthologies of Maison FRAGREA. Each series is an olfactory chapter bottled in French obsidian glass at 30%+ extrait concentration.',
};

async function getCollectionsData() {
  try {
    const collections = await prisma.collection.findMany({
      where: { status: 'ACTIVE' },
      include: {
        products: {
          where: { status: 'ACTIVE' },
          include: {
            images: { orderBy: { displayOrder: 'asc' } },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
    return collections;
  } catch (error) {
    console.error('Error loading collections:', error);
    return [];
  }
}

export default async function CollectionsPage() {
  const collections = await getCollectionsData();

  return (
    <div className="min-h-screen bg-noir-950 text-ivory-100 py-16 px-6 sm:px-8 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-20">
        {/* Header Dossier */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="text-[10px] uppercase tracking-[0.4em] text-gold-400 font-light block">
            The Anthologies of the Maison
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif text-ivory-100 font-normal tracking-[0.04em]">
            Curated Collections
          </h1>
          <div className="w-12 h-px bg-gold-400/40 mx-auto" />
          <p className="text-xs sm:text-sm md:text-base text-ivory-300 font-light leading-relaxed tracking-wider">
            Each collection represents a distinct creative chapter in the Maison’s exploration of rare resins, aged woods, and nocturnal botanicals.
          </p>
        </div>

        {/* Collections Stack */}
        <div className="space-y-28">
          {collections.map((col, idx) => (
            <div
              key={col.id}
              className="border border-white/10 bg-noir-900/60 shadow-luxury overflow-hidden p-6 sm:p-10 lg:p-12 space-y-10"
            >
              {/* Collection Hero Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Left: Atmospheric Visual */}
                <div className="lg:col-span-6 relative aspect-[16/10] sm:aspect-[16/9] bg-noir-950 border border-white/10 overflow-hidden group">
                  <Image
                    src={
                      col.heroImage ||
                      'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1200'
                    }
                    alt={col.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover object-center brightness-[0.82] contrast-[1.08] transition-transform duration-1000 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-noir-950 via-transparent to-noir-950/30" />
                  <div className="absolute top-4 left-4 px-3 py-1 bg-noir-950/85 backdrop-blur-md border border-gold-400/30 text-[9px] uppercase tracking-[0.25em] text-gold-300 font-light">
                    Anthology 0{idx + 1}
                  </div>
                </div>

                {/* Right: Narrative Dossier */}
                <div className="lg:col-span-6 space-y-6 lg:pl-4">
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-gold-400/80 block">
                      {col.subtitle || 'Haute Parfumerie Extraits'}
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-serif text-ivory-100 font-normal">
                      {col.name}
                    </h2>
                    <p className="text-xs sm:text-sm text-ivory-300 font-light leading-relaxed tracking-wide pt-1">
                      {col.description ||
                        'Crafted under moonlit harvest in Grasse and stabilized through multi-month cold maceration. Sovereign perfumes of unparalleled depth and presence.'}
                    </p>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center gap-4">
                    <Link
                      href={`/collection/${col.slug}`}
                      className="inline-flex items-center gap-2.5 bg-gold-400 hover:bg-gold-300 text-noir-950 px-7 py-3.5 text-xs uppercase tracking-[0.22em] font-semibold transition-all shadow-luxury btn-luxury"
                    >
                      <span>Explore Anthology</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    <Link
                      href="/shop"
                      className="inline-flex items-center gap-2 px-6 py-3.5 border border-white/20 hover:border-gold-400 text-ivory-200 hover:text-gold-300 text-xs uppercase tracking-[0.2em] font-medium transition-colors"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>Shop Catalog</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Flacons in this collection */}
              {col.products && col.products.length > 0 && (
                <div className="pt-8 border-t border-white/10 space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-gold-400 font-medium">
                      Featured Flacons in this Series ({col.products.length})
                    </span>
                    <Link
                      href={`/collection/${col.slug}`}
                      className="text-[10.5px] uppercase tracking-widest text-ivory-400 hover:text-gold-300 transition-colors flex items-center gap-1"
                    >
                      <span>View All</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {col.products.slice(0, 4).map((product) => {
                      const img =
                        product.images?.[0]?.url ||
                        'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1200';
                      const displayPrice =
                        product.salePrice && product.salePrice < product.price
                          ? product.salePrice
                          : product.price;

                      return (
                        <div
                          key={product.id}
                          className="group bg-noir-950 border border-white/10 hover:border-gold-400/40 transition-all flex flex-col justify-between p-3.5 sm:p-4 space-y-3"
                        >
                          <Link
                            href={`/products/${product.slug}`}
                            className="relative aspect-[3/4] bg-noir-900 overflow-hidden block"
                          >
                            <Image
                              src={img}
                              alt={product.name}
                              fill
                              sizes="(max-width: 640px) 50vw, 25vw"
                              className="object-cover object-center brightness-[0.88] group-hover:scale-105 transition-transform duration-700"
                            />
                          </Link>

                          <div className="space-y-1">
                            <span className="text-[9px] uppercase tracking-wider text-gold-400/70 block truncate">
                              {product.size || '100ml Extrait'}
                            </span>
                            <Link
                              href={`/products/${product.slug}`}
                              className="block font-serif text-sm sm:text-base text-ivory-100 group-hover:text-gold-300 transition-colors truncate"
                            >
                              {product.name}
                            </Link>
                            <div className="text-xs font-serif text-gold-300">
                              {formatCurrency(displayPrice)}
                            </div>
                          </div>

                          <Link
                            href={`/products/${product.slug}`}
                            className="w-full text-center py-2 bg-noir-900 hover:bg-gold-400 hover:text-noir-950 border border-white/15 hover:border-gold-400 text-[10px] uppercase tracking-[0.2em] text-ivory-300 transition-colors block"
                          >
                            VIEW PRODUCT
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
