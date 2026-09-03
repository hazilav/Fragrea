'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function EditorialStorySection() {
  return (
    <section className="py-28 sm:py-36 px-6 sm:px-8 bg-noir-950 border-b border-white/5 relative overflow-hidden">
      {/* Cinematic Ambient Lighting: Dark Espresso & Warm Amber */}
      <div className="absolute top-1/2 -right-24 -translate-y-1/2 w-[38rem] h-[38rem] bg-amberGlow-500/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute -bottom-20 left-10 w-96 h-96 bg-espresso-950/40 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* ============================================================ */}
          {/* LEFT: Large Cinematic Product Image */}
          {/* ============================================================ */}
          <div className="lg:col-span-7 relative">
            <div className="relative aspect-[4/5] sm:aspect-[16/11] lg:aspect-[4/5] bg-noir-900 border border-white/10 overflow-hidden shadow-luxury group">
              <Image
                src="https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1600&auto=format&fit=crop"
                alt="ABRAR Haute Parfumerie Flacon Campaign"
                fill
                sizes="(max-width: 1024px) 100vw, 58vw"
                className="object-cover object-center brightness-[0.84] contrast-[1.14] transition-transform duration-1000 ease-out group-hover:scale-105 luxury-image-zoom"
              />

              {/* Chiaroscuro Overlays & Vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-noir-950 via-transparent to-noir-950/20 opacity-85" />
              <div className="absolute inset-0 bg-gradient-to-r from-noir-950/30 via-transparent to-noir-950/60" />

              {/* Subtle Amber Glow on Hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-amberGlow-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

              {/* Discrete Maison Monogram Tag */}
              <div className="absolute top-5 left-5 px-3.5 py-1 bg-noir-950/95 border border-gold-400/30 text-[9px] uppercase tracking-[0.3em] text-gold-300 font-light">
                Maison Campaign &bull; Icon 01
              </div>

              {/* Bottom Inscription */}
              <div className="absolute bottom-6 left-6 right-6 p-5 bg-noir-950/95 border border-white/15 flex items-center justify-between">
                <div>
                  <span className="text-[8.5px] uppercase tracking-[0.3em] text-gold-400 font-medium block">
                    Extrait de Parfum
                  </span>
                  <span className="font-serif text-base sm:text-lg text-ivory-100 tracking-wider">
                    ABRAR &bull; 100ml
                  </span>
                </div>
                <span className="font-serif text-sm sm:text-base text-gold-300 font-medium">
                  $360
                </span>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* RIGHT: Editorial Content & Typography */}
          {/* ============================================================ */}
          <div className="lg:col-span-5 space-y-8 lg:pl-4">
            {/* Feature Label */}
            <div className="space-y-3">
              <span className="text-[10.5px] sm:text-xs uppercase tracking-[0.45em] text-gold-400 font-light block">
                FEATURED ICON &bull; ABRAR
              </span>

              {/* Headline */}
              <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif text-ivory-100 font-normal tracking-[0.06em] leading-[1.1]">
                MYSTERIOUS. <br />
                DEEP. <br />
                <span className="italic text-gold-300">UNFORGETTABLE.</span>
              </h2>

              <div className="w-12 h-px bg-gold-400/40 pt-1" />
            </div>

            {/* Description */}
            <div className="space-y-4">
              <p className="font-serif italic text-base sm:text-lg md:text-xl text-ivory-200 font-light leading-relaxed tracking-wide">
                &ldquo;A dark and sensual composition shaped by warm woods, smoky depth and unmistakable presence.&rdquo;
              </p>
              <p className="text-xs sm:text-sm text-ivory-400 font-light leading-relaxed tracking-wider">
                Distilled from thirty-year-old Cambodian agarwood heartwood, Abrar balances the intoxicating smoke of rare resins with the warmth of bourbon amber and wild mountain saffron. Formulated at pure 30%+ extrait strength to meld indelibly with skin.
              </p>
            </div>

            {/* Olfactory Accords Preview */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <span className="text-[9.5px] uppercase tracking-[0.3em] text-gold-400 font-medium block">
                Olfactory Composition
              </span>
              <div className="grid grid-cols-3 gap-3 text-xs text-ivory-300 font-light">
                <div>
                  <span className="text-[8.5px] uppercase tracking-widest text-ivory-500 block">Top</span>
                  <span className="truncate block font-serif text-sm">Kashmiri Saffron</span>
                </div>
                <div>
                  <span className="text-[8.5px] uppercase tracking-widest text-ivory-500 block">Heart</span>
                  <span className="truncate block font-serif text-sm">Smoked Oud</span>
                </div>
                <div>
                  <span className="text-[8.5px] uppercase tracking-widest text-ivory-500 block">Base</span>
                  <span className="truncate block font-serif text-sm">Bourbon Amber</span>
                </div>
              </div>
            </div>

            {/* Campaign CTA: DISCOVER ABRAR */}
            <div className="pt-2">
              <Link
                href="/product/abrar"
                className="inline-flex items-center gap-3 bg-gold-400 hover:bg-gold-300 text-noir-950 px-10 py-4 text-xs uppercase tracking-[0.24em] font-semibold transition-all duration-300 shadow-luxury hover:shadow-gold-subtle group btn-luxury"
              >
                <span>DISCOVER ABRAR</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
