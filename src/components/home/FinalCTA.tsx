'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function FinalCTA() {
  return (
    <section className="py-20 sm:py-24 md:py-28 bg-noir-950 border-t border-white/5 relative overflow-hidden text-center select-none">
      {/* Subtle Amber Glow Ambient Backing */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[35rem] h-[20rem] bg-amberGlow-500/10 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-3xl mx-auto px-6 space-y-8 relative z-10">
        {/* Eyebrow */}
        <span className="text-[10px] sm:text-[10.5px] uppercase tracking-[0.45em] text-gold-400 font-light block">
          The World of Fragrea
        </span>

        {/* Headline */}
        <div className="space-y-3">
          <h2 className="text-3xl sm:text-5xl font-serif text-ivory-100 font-normal tracking-[0.04em] leading-tight">
            BEGIN YOUR <br />
            <span className="italic text-gold-300">OLFACTORY JOURNEY.</span>
          </h2>
          <div className="w-12 h-px bg-gold-400/40 mx-auto my-2" />
          <p className="text-xs sm:text-sm text-ivory-300 font-light max-w-lg mx-auto leading-relaxed tracking-wider font-sans">
            Explore sovereign compositions, crafted with depth in Grasse and preserved in obsidian crystal.
          </p>
        </div>

        {/* Action Controls: SHOP & DISCOVER */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            href="/shop"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-gold-400 hover:bg-gold-300 text-noir-950 px-8 py-3.5 text-xs uppercase tracking-[0.24em] font-medium transition-all duration-300 shadow-luxury"
          >
            <span>Explore All Fragrances</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/about"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 border border-white/20 hover:border-gold-400 text-ivory-200 hover:text-gold-300 px-8 py-3.5 text-xs uppercase tracking-[0.24em] font-medium transition-all duration-300 bg-noir-900/60"
          >
            <span>Discover The House</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
