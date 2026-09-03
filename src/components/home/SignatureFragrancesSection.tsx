'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Compass } from 'lucide-react';
import { ProductData } from '@/types';
import { formatCurrency } from '@/lib/formatters';

interface SignatureFragrancesSectionProps {
  products: ProductData[];
}

export default function SignatureFragrancesSection({ products }: SignatureFragrancesSectionProps) {
  // Target the signature icons or all active products up to 9
  // Prioritize the requested iconic creations if present
  const signatureOrder = [
    'aamee',
    'kiswah',
    'abrar',
    'qalb',
    'ali',
    'le-cuir',
    'fougere',
    'awqad',
    'qismat',
  ];

  const sortedProducts = [...products].sort((a, b) => {
    const indexA = signatureOrder.indexOf(a.slug);
    const indexB = signatureOrder.indexOf(b.slug);
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return 0;
  });

  const displayProducts = sortedProducts.slice(0, 9);

  return (
    <section id="signature" className="py-28 sm:py-36 px-6 sm:px-8 bg-noir-950 border-b border-white/5 relative">
      <div className="max-w-7xl mx-auto space-y-20 sm:space-y-24">
        {/* ============================================================ */}
        {/* SECTION HEADER */}
        {/* ============================================================ */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.45em] text-gold-400 font-light block">
            Maison Haute Parfumerie
          </span>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif text-ivory-100 font-normal tracking-[0.06em]">
            THE SIGNATURE COLLECTION
          </h2>
          <div className="w-12 h-px bg-gold-400/40 mx-auto my-3" />
          <p className="text-sm sm:text-base md:text-lg text-ivory-300 font-light font-serif italic tracking-wide">
            &ldquo;Distinct fragrances. Different characters. One house.&rdquo;
          </p>
        </div>

        {/* ============================================================ */}
        {/* LARGE EDITORIAL PRODUCT TILES GRID */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12">
          {displayProducts.map((p, idx) => {
            const primaryImg =
              p.images?.[0] ||
              'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1200';
            const displayPrice =
              p.salePrice && p.salePrice < p.price ? p.salePrice : p.price;
            const character =
              p.shortDescription ||
              (p as any).baseDescription ||
              p.olfactoryFamily ||
              'Extrait de Parfum 30% Oil';

            return (
              <div
                key={p.id}
                className="group flex flex-col bg-noir-900/70 border border-white/10 hover:border-gold-400/40 transition-all duration-700 overflow-hidden shadow-luxury relative"
              >
                {/* Large Editorial Photography with Hover Zoom & Soft Overlay */}
                <Link
                  href={`/product/${p.slug}`}
                  className="relative aspect-[4/5] overflow-hidden bg-noir-950 block"
                >
                  <Image
                    src={primaryImg}
                    alt={p.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover object-center brightness-[0.85] contrast-[1.08] transition-transform duration-1000 ease-out group-hover:scale-105"
                  />

                  {/* Dark Vignette & Soft Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-noir-950 via-transparent to-noir-950/20 opacity-80" />

                  {/* Soft Amber Light Movement on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-amberGlow-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                  {/* Discrete Flacon Concentration Badge */}
                  <div className="absolute top-4 left-4 px-3 py-1 bg-noir-950/90 border border-white/15 text-[8.5px] uppercase tracking-[0.25em] text-gold-300 font-light">
                    {p.volume || p.size || '100ml Extrait'}
                  </div>
                </Link>

                {/* Editorial Information Dossier */}
                <div className="p-7 sm:p-8 flex-1 flex flex-col justify-between space-y-6 bg-noir-900/80">
                  <div className="space-y-2">
                    <div className="flex items-baseline justify-between gap-4">
                      {/* Product Name */}
                      <Link
                        href={`/product/${p.slug}`}
                        className="font-serif text-2xl sm:text-3xl text-ivory-100 group-hover:text-gold-300 transition-colors duration-300 tracking-wider truncate block"
                      >
                        {p.name}
                      </Link>

                      {/* Price */}
                      <span className="font-serif text-base sm:text-lg text-gold-300 font-medium shrink-0">
                        {formatCurrency(displayPrice)}
                      </span>
                    </div>

                    {/* Fragrance Character */}
                    <p className="text-xs sm:text-sm text-ivory-300 font-light tracking-wide leading-relaxed line-clamp-2 pt-1">
                      {character}
                    </p>
                  </div>

                  {/* Interactive Action: DISCOVER FRAGRANCE */}
                  <div className="pt-4 border-t border-white/10">
                    <Link
                      href={`/product/${p.slug}`}
                      className="w-full py-3.5 px-6 bg-noir-950 hover:bg-gold-400 hover:text-noir-950 border border-white/15 hover:border-gold-400 text-xs uppercase tracking-[0.22em] font-medium text-ivory-200 transition-all duration-300 flex items-center justify-center gap-2 group/btn shadow-md"
                    >
                      <span>DISCOVER FRAGRANCE</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1.5 transition-transform duration-300" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ============================================================ */}
        {/* VIEW ALL FRAGRANCES LINK */}
        {/* ============================================================ */}
        <div className="text-center pt-6">
          <Link
            href="/shop"
            className="inline-flex items-center gap-3 text-xs sm:text-sm uppercase tracking-[0.28em] text-gold-400 hover:text-gold-300 transition-colors duration-300 font-medium group"
          >
            <span>VIEW ALL FRAGRANCES</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
          </Link>
        </div>
      </div>
    </section>
  );
}
