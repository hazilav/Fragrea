'use client';

import React from 'react';

export default function BrandStatement() {
  return (
    <section className="py-28 sm:py-36 bg-espresso-950 border-b border-white/5 relative overflow-hidden text-center">
      {/* Soft warm amber glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[20rem] bg-amberGlow-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 space-y-10 relative z-10">
        <span className="text-[10px] uppercase tracking-[0.4em] text-gold-400 font-light block">
          The Maison Philosophy
        </span>

        <blockquote className="font-serif text-2xl sm:text-4xl md:text-5xl text-ivory-100 font-normal leading-[1.3] tracking-[0.02em]">
          &ldquo;Fragrance is not an ornament. It is an invisible architecture of presence, memory, and sovereign emotion.&rdquo;
        </blockquote>

        <div className="w-12 h-px bg-gold-400/40 mx-auto" />

        <p className="max-w-2xl mx-auto text-xs sm:text-sm md:text-base text-ivory-300 font-light leading-relaxed tracking-wider">
          Formulated without compromise. Hand-poured in Grasse at pure 30%+ extrait concentration, encased in ultraviolet-shielded obsidian crystal.
        </p>

        <span className="inline-block text-[11px] uppercase tracking-[0.3em] text-gold-300 font-light pt-2">
          Maison FRAGREA &bull; Grasse &amp; Paris
        </span>
      </div>
    </section>
  );
}
