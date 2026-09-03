'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { ProductData } from '@/types';
import { useCart } from '@/context/CartContext';

interface NewArrivalsBestsellersProps {
  products: ProductData[];
}

export default function NewArrivalsBestsellers({ products }: NewArrivalsBestsellersProps) {
  const { addToCart, setIsCartOpen } = useCart();
  const [activeTab, setActiveTab] = useState<'BESTSELLERS' | 'NEW_ARRIVALS' | 'ALL'>('BESTSELLERS');

  const displayedProducts = products.filter((p) => {
    if (activeTab === 'BESTSELLERS') return p.isFeatured;
    if (activeTab === 'NEW_ARRIVALS') return (p as any).newArrival;
    return true;
  });

  const handleQuickAdd = (e: React.MouseEvent, p: ProductData) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      productId: p.id,
      productName: p.name,
      slug: p.slug,
      price: p.salePrice && p.salePrice < p.price ? p.salePrice : p.price,
      productImage: p.images && p.images[0] ? p.images[0] : 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1200',
      volume: p.volume || '100ml',
      quantity: 1,
    });
    setIsCartOpen(true);
  };

  return (
    <section className="py-28 sm:py-36 px-6 sm:px-8 bg-espresso-950 border-b border-white/5 relative">
      <div className="max-w-7xl mx-auto space-y-14">
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="text-[10px] uppercase tracking-[0.38em] text-gold-400 font-light block">
            Curated Formulations
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-ivory-100 font-normal tracking-[0.04em]">
            New Arrivals &amp; Bestsellers
          </h2>
          <p className="text-xs sm:text-sm text-ivory-300 font-light leading-relaxed tracking-wider">
            Our most revered compositions and newly unsealed cellar reserves.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center justify-center gap-3 sm:gap-6 select-none border-b border-white/10 pb-4 max-w-lg mx-auto">
          <button
            onClick={() => setActiveTab('BESTSELLERS')}
            className={`text-xs uppercase tracking-[0.24em] pb-2 transition-all relative ${
              activeTab === 'BESTSELLERS'
                ? 'text-gold-300 font-medium'
                : 'text-ivory-400 hover:text-ivory-200'
            }`}
          >
            <span>Bestsellers</span>
            {activeTab === 'BESTSELLERS' && (
              <span className="absolute bottom-0 left-0 w-full h-[1px] bg-gold-400" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('NEW_ARRIVALS')}
            className={`text-xs uppercase tracking-[0.24em] pb-2 transition-all relative ${
              activeTab === 'NEW_ARRIVALS'
                ? 'text-gold-300 font-medium'
                : 'text-ivory-400 hover:text-ivory-200'
            }`}
          >
            <span>New Arrivals</span>
            {activeTab === 'NEW_ARRIVALS' && (
              <span className="absolute bottom-0 left-0 w-full h-[1px] bg-gold-400" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('ALL')}
            className={`text-xs uppercase tracking-[0.24em] pb-2 transition-all relative ${
              activeTab === 'ALL'
                ? 'text-gold-300 font-medium'
                : 'text-ivory-400 hover:text-ivory-200'
            }`}
          >
            <span>All Flacons</span>
            {activeTab === 'ALL' && (
              <span className="absolute bottom-0 left-0 w-full h-[1px] bg-gold-400" />
            )}
          </button>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {(displayedProducts.length > 0 ? displayedProducts : products).slice(0, 6).map((p) => {
            const primaryImg =
              p.images && p.images[0]
                ? p.images[0]
                : 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1200';

            return (
              <div
                key={p.id}
                className="group flex flex-col bg-noir-900/60 border border-white/10 hover:border-gold-400/40 transition-all duration-500 overflow-hidden shadow-luxury"
              >
                {/* Image Container with Hover Scale */}
                <Link href={`/products/${p.slug}`} className="relative aspect-[4/5] overflow-hidden bg-noir-950 block">
                  <Image
                    src={primaryImg}
                    alt={p.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover object-center brightness-[0.88] contrast-[1.05] transition-transform duration-1000 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-noir-950 via-transparent to-transparent opacity-80" />

                  {/* Status Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                    {(p as any).newArrival && (
                      <span className="px-2.5 py-0.5 bg-gold-400/90 text-noir-950 text-[8.5px] uppercase tracking-[0.2em] font-semibold">
                        New Reserve
                      </span>
                    )}
                    {p.isFeatured && !(p as any).newArrival && (
                      <span className="px-2.5 py-0.5 bg-noir-950/80 backdrop-blur-md border border-gold-400/30 text-gold-300 text-[8.5px] uppercase tracking-[0.2em] font-light">
                        Maison Icon
                      </span>
                    )}
                  </div>

                  {/* Quick Add Button */}
                  <button
                    onClick={(e) => handleQuickAdd(e, p)}
                    className="absolute bottom-4 right-4 p-3 bg-gold-400 hover:bg-gold-300 text-noir-950 shadow-luxury transition-all duration-300 opacity-90 group-hover:opacity-100 group-hover:scale-105"
                    aria-label={`Add ${p.name} to Shopping Bag`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                  </button>
                </Link>

                {/* Information Card */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4 bg-noir-900/80">
                  <div className="space-y-1.5">
                    <span className="text-[9.5px] uppercase tracking-[0.25em] text-gold-400/80 font-light block truncate">
                      {p.olfactoryFamily || '30%+ Extrait de Parfum'}
                    </span>
                    <Link
                      href={`/products/${p.slug}`}
                      className="block font-serif text-2xl text-ivory-100 group-hover:text-gold-300 transition-colors truncate"
                    >
                      {p.name}
                    </Link>
                    <p className="text-xs text-ivory-400 font-light line-clamp-2 leading-relaxed">
                      {p.shortDescription || p.subtitle || 'Rare botanicals aged in French obsidian crystal.'}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-serif text-ivory-100">
                        ${p.salePrice && p.salePrice < p.price ? p.salePrice : p.price}
                      </span>
                      {p.salePrice && p.salePrice < p.price && (
                        <span className="text-xs text-ivory-400/60 line-through">
                          ${p.price}
                        </span>
                      )}
                    </div>

                    <Link
                      href={`/products/${p.slug}`}
                      className="text-xs uppercase tracking-[0.2em] text-ivory-200 group-hover:text-gold-300 transition-colors flex items-center gap-1.5"
                    >
                      <span>VIEW PRODUCT</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* View Complete Collection */}
        <div className="text-center pt-4">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-3 bg-gold-400 hover:bg-gold-300 text-noir-950 px-9 py-4 text-xs uppercase tracking-[0.24em] font-semibold transition-all duration-300 shadow-luxury btn-luxury"
          >
            <span>SHOP NOW</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
