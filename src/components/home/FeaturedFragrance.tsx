'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, ArrowRight, Sparkles } from 'lucide-react';
import { ProductData } from '@/types';
import { useCart } from '@/context/CartContext';

interface FeaturedFragranceProps {
  products: ProductData[];
}

export default function FeaturedFragrance({ products }: FeaturedFragranceProps) {
  const { addToCart, setIsCartOpen } = useCart();

  // Find Abrar or Oud Nocturne or first featured product
  const heroProduct =
    products.find((p) => p.slug === 'abrar') ||
    products.find((p) => p.slug === 'oud-nocturne') ||
    products[0];

  if (!heroProduct) return null;

  const flaconImg =
    heroProduct.images && heroProduct.images[0]
      ? heroProduct.images[0]
      : 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1200';

  const topNotes = heroProduct.topNotes && heroProduct.topNotes.length > 0 ? heroProduct.topNotes : ['Aged Agarwood', 'Midnight Bergamot'];
  const heartNotes = heroProduct.heartNotes && heroProduct.heartNotes.length > 0 ? heroProduct.heartNotes : ['Bulgarian Damask Rose', 'Smoked Birch', 'Amber Resin'];
  const baseNotes = heroProduct.baseNotes && heroProduct.baseNotes.length > 0 ? heroProduct.baseNotes : ['Madagascar Vanilla', 'Atlas Cedarwood', 'Imperial Musk'];

  const handleAdd = () => {
    addToCart({
      productId: heroProduct.id,
      productName: heroProduct.name,
      slug: heroProduct.slug,
      price: heroProduct.salePrice && heroProduct.salePrice < heroProduct.price ? heroProduct.salePrice : heroProduct.price,
      productImage: flaconImg,
      volume: heroProduct.volume || '100ml',
      quantity: 1,
    });
    setIsCartOpen(true);
  };

  return (
    <section className="py-28 sm:py-36 px-6 sm:px-8 bg-espresso-950 border-b border-white/5 relative overflow-hidden">
      {/* Warm amber lighting halo */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[35rem] h-[35rem] bg-amberGlow-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Left: Cinematic Flacon Visual */}
        <div className="relative aspect-[4/5] bg-noir-950 border border-white/10 overflow-hidden shadow-2xl group">
          <Image
            src={flaconImg}
            alt={heroProduct.name}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-center brightness-[0.88] contrast-[1.08] transition-transform duration-1000 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-noir-950/80 via-transparent to-noir-950/30" />

          <div className="absolute top-6 left-6 px-3.5 py-1.5 bg-noir-950/85 backdrop-blur-md border border-gold-400/30 text-[9px] uppercase tracking-[0.3em] text-gold-300 font-light flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-gold-400" />
            <span>Featured Flacon</span>
          </div>
        </div>

        {/* Right: Editorial Dossier & Olfactory Pyramid */}
        <div className="space-y-8">
          <div className="space-y-3">
            <span className="text-[10px] uppercase tracking-[0.4em] text-gold-400 font-light block">
              Maison Masterpiece &bull; {heroProduct.volume || '100ML'} Extrait
            </span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-ivory-100 font-normal tracking-[0.03em]">
              {heroProduct.name}
            </h2>
            <p className="text-sm sm:text-base text-ivory-300 font-light leading-relaxed tracking-wider pt-2">
              {heroProduct.description ||
                'Distilled from decades-aged wild Cambodian agarwood and midnight damascena rose. An olfactory monument to stillness, sovereign presence, and eternal remembrance.'}
            </p>
          </div>

          {/* Olfactory Pyramid Architecture */}
          <div className="space-y-4 p-6 bg-noir-900/60 border border-white/10">
            <div className="text-[9.5px] uppercase tracking-[0.3em] text-gold-400/80 border-b border-white/10 pb-2">
              Olfactory Architecture (32% Extrait Concentration)
            </div>

            <div className="grid grid-cols-3 gap-4 pt-1">
              <div>
                <span className="block text-[8.5px] uppercase tracking-[0.2em] text-ivory-400">
                  Top Accord
                </span>
                <span className="block text-xs font-serif text-ivory-100 mt-1">
                  {topNotes.join(', ')}
                </span>
              </div>
              <div>
                <span className="block text-[8.5px] uppercase tracking-[0.2em] text-ivory-400">
                  Heart Accord
                </span>
                <span className="block text-xs font-serif text-ivory-100 mt-1">
                  {heartNotes.join(', ')}
                </span>
              </div>
              <div>
                <span className="block text-[8.5px] uppercase tracking-[0.2em] text-ivory-400">
                  Base Accord
                </span>
                <span className="block text-xs font-serif text-ivory-100 mt-1">
                  {baseNotes.join(', ')}
                </span>
              </div>
            </div>
          </div>

          {/* Price & Actions */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="space-y-0.5">
              <span className="text-[9px] uppercase tracking-widest text-ivory-400/70 block">
                Bespoke Acquisition
              </span>
              <span className="text-2xl font-serif text-ivory-100">
                ${heroProduct.salePrice && heroProduct.salePrice < heroProduct.price ? heroProduct.salePrice : heroProduct.price}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
              <button
                onClick={handleAdd}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-gold-400 hover:bg-gold-300 text-noir-950 px-8 py-4 text-xs uppercase tracking-[0.22em] font-semibold transition-all duration-300 shadow-luxury btn-luxury"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>ADD TO BAG</span>
              </button>

              <Link
                href={`/products/${heroProduct.slug}`}
                className="inline-flex items-center justify-center gap-2 px-6 py-4 border border-white/20 hover:border-gold-400/70 text-ivory-200 hover:text-gold-300 text-xs uppercase tracking-[0.2em] font-medium transition-colors"
                aria-label="View Product Details"
              >
                <span>VIEW PRODUCT</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
