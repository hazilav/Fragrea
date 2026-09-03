'use client';

import React from 'react';
import Image from 'next/image';

const FEATURES = [
  {
    num: '01',
    title: 'CRAFTED WITH CHARACTER',
    quote: 'Distinct compositions designed to leave an impression.',
    detail:
      'Formulated outside mass trends, each perfume possesses an unmistakable silhouette that evolves organically over skin.',
    image:
      'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?q=80&w=800&auto=format&fit=crop',
    alt: 'Artisanal extraction and perfume compounding',
  },
  {
    num: '02',
    title: 'QUALITY INGREDIENTS',
    quote: 'Thoughtfully selected ingredients with depth and balance.',
    detail:
      'Wild Cambodian agarwood, centifolia rose, and aged resins sourced directly from private nocturnal harvests in Grasse and the Levant.',
    image:
      'https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=800&auto=format&fit=crop',
    alt: 'Botanical ingredients gathered at dawn',
  },
  {
    num: '03',
    title: 'MADE TO LAST',
    quote: 'Fragrance created with lasting presence in mind.',
    detail:
      'Compounded at 30%+ pure extrait strength and matured for 120 days to ensure exceptional longevity and a persistent sillage.',
    image:
      'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?q=80&w=800&auto=format&fit=crop',
    alt: 'Cold maceration and obsidian flacon preservation',
  },
  {
    num: '04',
    title: 'A DISTINCT IDENTITY',
    quote: 'Modern fragrance rooted in character, confidence and restraint.',
    detail:
      'Quiet luxury that commands attention through depth and sophistication rather than loud synthetic projections.',
    image:
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=800&auto=format&fit=crop',
    alt: 'Obsidian flacon reflecting amber warmth',
  },
];

export default function WhyFragreaSection() {
  return (
    <section className="py-28 sm:py-36 px-6 sm:px-8 bg-noir-950 border-b border-white/5 relative">
      <div className="max-w-7xl mx-auto space-y-20">
        {/* ============================================================ */}
        {/* SECTION HEADER */}
        {/* ============================================================ */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="text-[10.5px] sm:text-xs uppercase tracking-[0.45em] text-gold-400 font-light block">
            The Haute Parfumerie Philosophy
          </span>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif text-ivory-100 font-normal tracking-[0.06em]">
            THE FRAGREA DIFFERENCE
          </h2>
          <div className="w-12 h-px bg-gold-400/40 mx-auto my-2" />
          <p className="text-xs sm:text-sm text-ivory-300 font-light leading-relaxed tracking-wider">
            Modern French high perfumery founded upon patience, raw botanical integrity, and lasting presence.
          </p>
        </div>

        {/* ============================================================ */}
        {/* EDITORIAL BLOCKS (NO CHEAP ICONS — TYPOGRAPHY & PHOTOGRAPHY) */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-8">
          {FEATURES.map((item) => (
            <div
              key={item.title}
              className="group flex flex-col bg-noir-900/70 border border-white/10 hover:border-gold-400/40 transition-all duration-700 overflow-hidden shadow-luxury"
            >
              {/* Cinematic Editorial Photography Header */}
              <div className="relative aspect-[16/10] bg-noir-950 overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  className="object-cover object-center brightness-[0.78] contrast-[1.12] transition-transform duration-1000 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-noir-900 via-transparent to-transparent opacity-90" />
                <div className="absolute top-4 left-4 px-2.5 py-1 bg-noir-950/85 backdrop-blur-md border border-white/10 text-[9px] font-mono text-gold-300">
                  {item.num}
                </div>
              </div>

              {/* Editorial Typography Body */}
              <div className="p-7 sm:p-8 flex-1 flex flex-col justify-between space-y-4 bg-noir-900/90">
                <div className="space-y-3">
                  <h3 className="font-sans text-xs sm:text-sm uppercase tracking-[0.24em] text-ivory-100 font-medium group-hover:text-gold-300 transition-colors duration-300">
                    {item.title}
                  </h3>
                  <p className="font-serif italic text-sm sm:text-base text-gold-300/90 leading-relaxed font-light">
                    &ldquo;{item.quote}&rdquo;
                  </p>
                  <p className="text-xs text-ivory-400 font-light leading-relaxed pt-1">
                    {item.detail}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/5 text-[9px] uppercase tracking-[0.28em] text-ivory-500 font-light">
                  Maison Guarantee
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
