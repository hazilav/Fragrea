'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { ProductData } from '@/types';
import { formatCurrency } from '@/lib/formatters';

interface DiscoverYourFragranceProps {
  products: ProductData[];
}

interface CategoryDefinition {
  id: string;
  label: string;
  subtitle: string;
  productSlugs: string[];
}

const CATEGORIES: CategoryDefinition[] = [
  {
    id: 'signatures',
    label: 'Signatures',
    subtitle: 'The defining sovereign compositions of Maison Fragrea.',
    productSlugs: ['aamee', 'kiswah'],
  },
  {
    id: 'oud-prive',
    label: 'Oud Prive',
    subtitle: 'Precious aged agarwood distilled with royal resins and dark leather.',
    productSlugs: ['ali', 'abrar'],
  },
  {
    id: 'iconic-of-arabia',
    label: 'Iconic of Arabia',
    subtitle: 'Evocative extraits inspired by Arabian botanical heritage and night blooms.',
    productSlugs: ['qalb', 'qismat'],
  },
  {
    id: 'royal-heritage',
    label: 'Royal Heritage',
    subtitle: 'Classic haute parfumerie accords elevated to pure extrait concentration.',
    productSlugs: ['fougere', 'le-cuir'],
  },
];

export default function DiscoverYourFragrance({ products }: DiscoverYourFragranceProps) {
  const [activeCategoryId, setActiveCategoryId] = useState<string>('signatures');

  const activeCategory =
    CATEGORIES.find((c) => c.id === activeCategoryId) || CATEGORIES[0];

  // Dynamically filter products matching the active category
  const matchingProducts = products.filter((p) => {
    const normSlug = (p.slug || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const normName = (p.name || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');

    return activeCategory.productSlugs.some((target) => {
      const normTarget = target.toLowerCase().replace(/[^a-z0-9]/g, '');
      return normSlug === normTarget || normName === normTarget || normSlug.includes(normTarget) || normName.includes(normTarget);
    });
  });

  return (
    <section id="discover" className="py-28 sm:py-36 px-6 sm:px-8 bg-noir-950 border-b border-white/5 relative overflow-hidden">
      {/* Ambient background lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[40rem] h-[40rem] bg-amberGlow-500/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-16 relative z-10">
        {/* ============================================================ */}
        {/* SECTION HEADER */}
        {/* ============================================================ */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="text-[10.5px] sm:text-xs uppercase tracking-[0.45em] text-gold-400 font-light block">
            Olfactory Architecture
          </span>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif text-ivory-100 font-normal tracking-[0.06em]">
            FIND YOUR FRAGRANCE
          </h2>
          <div className="w-12 h-px bg-gold-400/40 mx-auto my-2" />
          <p className="text-sm sm:text-base md:text-lg text-ivory-300 font-light font-serif italic tracking-wide">
            &ldquo;Explore the characters, notes and moods that define the Fragrea collection.&rdquo;
          </p>
        </div>

        {/* ============================================================ */}
        {/* SIMPLE CATEGORY SELECTOR TABS */}
        {/* ============================================================ */}
        <div className="space-y-4 text-center">
          <div className="inline-flex flex-wrap items-center justify-center p-1.5 bg-noir-900/90 border border-white/10 shadow-luxury gap-1.5 sm:gap-2 select-none">
            {CATEGORIES.map((cat) => {
              const isActive = cat.id === activeCategoryId;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategoryId(cat.id)}
                  className={`px-5 sm:px-8 py-3 text-xs sm:text-[13px] uppercase tracking-[0.24em] transition-all duration-400 font-medium ${
                    isActive
                      ? 'bg-gold-400 text-noir-950 font-semibold shadow-luxury scale-[1.02]'
                      : 'text-ivory-300 hover:text-gold-300 hover:bg-white/[0.03]'
                  }`}
                  aria-selected={isActive}
                  role="tab"
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Subtitle describing the active category */}
          <p className="text-xs sm:text-sm text-ivory-400 font-light tracking-wide transition-opacity duration-300 min-h-[20px]">
            {activeCategory.subtitle}
          </p>
        </div>

        {/* ============================================================ */}
        {/* DYNAMIC PRODUCT TILES WITH SUBTLE TRANSITION */}
        {/* ============================================================ */}
        <div
          key={activeCategoryId}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 animate-fade-in"
        >
          {matchingProducts.map((p) => {
            const primaryImg =
              p.images?.[0] ||
              'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1200';
            const displayPrice =
              p.salePrice && p.salePrice < p.price ? p.salePrice : p.price;
            const shortCharacter =
              p.shortDescription ||
              (p as any).baseDescription ||
              p.olfactoryFamily ||
              'Extrait de Parfum 30% Oil';

            return (
              <div
                key={p.id}
                className="group bg-noir-900/70 border border-white/10 hover:border-gold-400/40 p-6 sm:p-8 flex flex-col justify-between transition-all duration-700 shadow-luxury"
              >
                {/* Product Image with subtle hover zoom */}
                <Link
                  href={`/product/${p.slug}`}
                  className="relative aspect-[4/5] bg-noir-950 overflow-hidden block border border-white/5"
                >
                  <Image
                    src={primaryImg}
                    alt={p.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover object-center brightness-[0.88] contrast-[1.08] transition-transform duration-1000 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-noir-950 via-transparent to-transparent opacity-80" />

                  {/* Discrete Concentration */}
                  <div className="absolute top-3.5 left-3.5 px-3 py-1 bg-noir-950/85 backdrop-blur-md border border-white/10 text-[8.5px] uppercase tracking-[0.25em] text-gold-300 font-light">
                    {p.volume || p.size || '100ML EXTRAIT'}
                  </div>
                </Link>

                {/* Information Dossier */}
                <div className="pt-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-baseline justify-between gap-4">
                      {/* Name */}
                      <Link
                        href={`/product/${p.slug}`}
                        className="font-serif text-2xl sm:text-3xl text-ivory-100 group-hover:text-gold-300 transition-colors duration-300 tracking-wider"
                      >
                        {p.name}
                      </Link>

                      {/* Price */}
                      <span className="font-serif text-lg text-gold-300 font-medium">
                        {formatCurrency(displayPrice)}
                      </span>
                    </div>

                    {/* Short Character */}
                    <p className="text-xs sm:text-sm text-ivory-300 font-light tracking-wide leading-relaxed pt-1">
                      {shortCharacter}
                    </p>
                  </div>

                  {/* Action CTA: VIEW FRAGRANCE */}
                  <div className="pt-4 border-t border-white/10">
                    <Link
                      href={`/product/${p.slug}`}
                      className="w-full py-3.5 px-6 bg-noir-950 hover:bg-gold-400 hover:text-noir-950 border border-white/15 hover:border-gold-400 text-xs uppercase tracking-[0.24em] font-medium text-ivory-200 transition-all duration-300 flex items-center justify-center gap-2 group/btn shadow-md"
                    >
                      <span>VIEW FRAGRANCE</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1.5 transition-transform duration-300" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ============================================================ */}
        {/* FOOTER LINK */}
        {/* ============================================================ */}
        <div className="text-center pt-4">
          <Link
            href="/discover"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-gold-400 hover:text-gold-300 transition-colors font-medium group"
          >
            <span>DISCOVER THE COMPLETE OLFACTORY INDEX</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform duration-300" />
          </Link>
        </div>
      </div>
    </section>
  );
}
