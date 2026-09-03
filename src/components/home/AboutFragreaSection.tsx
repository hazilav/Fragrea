'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function AboutFragreaSection() {
  return (
    <section className="py-28 sm:py-36 px-6 sm:px-8 bg-noir-950 border-b border-white/5 relative overflow-hidden">
      {/* Ambient warm espresso and cinematic amber lighting */}
      <div className="absolute top-1/2 -left-20 -translate-y-1/2 w-[34rem] h-[34rem] bg-amberGlow-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-espresso-950/40 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* ============================================================ */}
        {/* LEFT: Large Atmospheric Fragrea Image */}
        {/* ============================================================ */}
        <div className="lg:col-span-6 relative">
          <div className="relative aspect-[4/5] bg-espresso-950 border border-white/10 overflow-hidden shadow-luxury group">
            <Image
              src="https://images.unsplash.com/photo-1615397349754-cfa2066a298e?q=80&w=1400&auto=format&fit=crop"
              alt="The House of Fragrea Atelier and Cold Maceration"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center brightness-[0.84] contrast-[1.12] transition-transform duration-1000 ease-out group-hover:scale-105"
            />
            {/* Dark Chiaroscuro Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-noir-950 via-noir-950/25 to-transparent" />
            <div className="absolute inset-0 bg-espresso-950/20 mix-blend-multiply" />

            {/* Bottom Atmospheric Inscription */}
            <div className="absolute bottom-6 left-6 right-6 p-5 bg-noir-950/95 border border-white/15">
              <span className="text-[9px] uppercase tracking-[0.35em] text-gold-400 font-light block">
                Maison Grasse &bull; Atelier Privé
              </span>
              <p className="font-serif text-sm sm:text-base text-ivory-100 mt-0.5">
                Cold maceration in French obsidian flacons.
              </p>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* RIGHT: Heading, Brand Story, Philosophy & CTA */}
        {/* ============================================================ */}
        <div className="lg:col-span-6 space-y-8 lg:pl-4">
          <div className="space-y-3">
            {/* Heading */}
            <span className="text-[10.5px] sm:text-xs uppercase tracking-[0.45em] text-gold-400 font-light block">
              THE HOUSE OF FRAGREA
            </span>

            {/* Main Statement */}
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif text-ivory-100 font-normal tracking-[0.04em] leading-[1.1]">
              FRAGRANCE WITH <br />
              <span className="italic text-gold-300">PRESENCE.</span>
            </h2>

            <div className="w-12 h-px bg-gold-400/40 pt-1" />
          </div>

          {/* Supporting Copy */}
          <div className="space-y-4 text-sm sm:text-base text-ivory-300 font-light leading-relaxed tracking-wide">
            <p className="font-serif italic text-ivory-200 text-base sm:text-lg">
              &ldquo;Fragrea creates fragrances shaped by depth, character and lasting presence — compositions designed not simply to be worn, but to be remembered.&rdquo;
            </p>
            <p className="text-xs sm:text-sm text-ivory-400 font-light leading-relaxed">
              Born from a refusal to compromise on natural concentration, our extraits are compounded in Grasse with wild-harvested botanicals and cured through 120-day cold maceration. Each bottle is a sovereign personal signature.
            </p>
          </div>

          {/* Maison Essence Pillars */}
          <div className="grid grid-cols-2 gap-6 pt-2 border-t border-white/10 text-left">
            <div className="space-y-1">
              <span className="font-serif text-xl sm:text-2xl text-gold-300 block">30%+ Extrait</span>
              <span className="text-[9.5px] uppercase tracking-widest text-ivory-400 block font-light">
                Pure Extrait de Parfum
              </span>
            </div>
            <div className="space-y-1">
              <span className="font-serif text-xl sm:text-2xl text-gold-300 block">Obsidian Glass</span>
              <span className="text-[9.5px] uppercase tracking-widest text-ivory-400 block font-light">
                UV-Shielded Flacon
              </span>
            </div>
          </div>

          {/* Button: OUR STORY -> /about */}
          <div className="pt-2">
            <Link
              href="/about"
              className="inline-flex items-center gap-3 bg-gold-400 hover:bg-gold-300 text-noir-950 px-9 py-4 text-xs uppercase tracking-[0.24em] font-semibold transition-all duration-300 shadow-luxury hover:shadow-gold-subtle group btn-luxury"
            >
              <span>OUR STORY</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
