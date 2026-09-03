'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, ArrowRight, Sparkles, Droplet } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { useCart } from '@/context/CartContext';

export default function EditorialSpotlight() {
  const { addToCart } = useCart();

  const handleQuickAdd = () => {
    addToCart({
      productId: 'oud-nocturne',
      productName: 'Oud Nocturne',
      productImage: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1200',
      price: 340,
      volume: '100 ml / 3.4 FL. OZ.',
      slug: 'oud-nocturne',
      quantity: 1,
    });
  };

  return (
    <section className="py-28 bg-espresso-950/80 border-b border-gold-dim relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* Visual Column */}
        <div className="lg:col-span-6 relative">
          <div className="relative aspect-[4/5] w-full bg-noir-950 border border-gold-dim overflow-hidden shadow-luxury">
            <Image
              src="https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1200&auto=format&fit=crop"
              alt="Oud Nocturne Flagship Flacon"
              fill
              className="object-cover brightness-[0.55] contrast-[1.12] luxury-image-zoom"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-noir-950 via-transparent to-transparent pointer-events-none" />

            {/* Badge */}
            <div className="absolute top-5 left-5 bg-gold-400 text-noir-950 text-[10px] uppercase tracking-widest px-3 py-1 font-semibold">
              Maison Masterpiece No. 01
            </div>
          </div>
        </div>

        {/* Narrative & Notes Column */}
        <div className="lg:col-span-6 space-y-8">
          <div className="space-y-3">
            <span className="text-[10px] uppercase tracking-[0.35em] text-gold-400 font-medium">
              Editorial Spotlight
            </span>
            <h2 className="text-4xl sm:text-5xl font-serif text-ivory-100 font-normal">
              Oud Nocturne
            </h2>
            <p className="text-sm text-gold-300 italic font-light">
              Shadowed Cambodian Agarwood & Smoked Frankincense
            </p>
            <div className="w-16 h-px bg-gold-400/50" />
          </div>

          <p className="text-xs sm:text-sm text-ivory-300 font-light leading-relaxed">
            Distilled from twenty-year wild agarwood trees in Koh Kong, Oud Nocturne is our sovereign creation.
            As the top accord of cracked Guatemalan cardamom and bittersweet saffron recedes, smoldering Taif rose
            and frankincense unfold into a magnetic sillage of birch tar and bourbon vanilla.
          </p>

          {/* Olfactory Chords Breakdown */}
          <div className="grid grid-cols-3 gap-4 pt-2 border-t border-white/10">
            <div className="space-y-1">
              <span className="text-[9px] uppercase tracking-widest text-gold-400 block font-semibold">
                Tête &bull; Top
              </span>
              <p className="text-xs text-ivory-200 font-serif">Saffron Suede</p>
              <p className="text-[10px] text-ivory-400 font-light">Calabrian Bergamot</p>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] uppercase tracking-widest text-gold-400 block font-semibold">
                Cœur &bull; Heart
              </span>
              <p className="text-xs text-ivory-200 font-serif">Taif Rose Absolu</p>
              <p className="text-[10px] text-ivory-400 font-light">Smoked Incense</p>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] uppercase tracking-widest text-gold-400 block font-semibold">
                Fond &bull; Base
              </span>
              <p className="text-xs text-ivory-200 font-serif">Cambodian Oud</p>
              <p className="text-[10px] text-ivory-400 font-light">Bourbon Vanilla</p>
            </div>
          </div>

          {/* Price & Actions */}
          <div className="pt-4 flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="font-serif text-3xl text-ivory-100">
              {formatCurrency(340)}
              <span className="text-[10px] uppercase tracking-widest text-ivory-400 block font-sans font-light mt-0.5">
                100 ml Extrait (32% Oil)
              </span>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleQuickAdd}
                className="inline-flex items-center gap-2 bg-gold-400 hover:bg-gold-300 text-noir-950 px-6 py-3.5 text-xs uppercase tracking-widest font-medium transition-colors shadow-luxury btn-luxury"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Reserve Flacon</span>
              </button>

              <Link
                href="/product/oud-nocturne"
                className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-ivory-300 hover:text-gold-300 transition-colors"
              >
                <span>Read Full Monograph</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
