import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Compass } from 'lucide-react';

export default function HeroBanner() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-noir-950">
      {/* Cinematic dark background photography with amber lighting */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?q=80&w=1920&auto=format&fit=crop"
          alt="FRAGREA Haute Parfumerie Flacon"
          fill
          priority
          className="object-cover object-center brightness-[0.38] contrast-[1.15] scale-105"
        />
        {/* Amber lighting and espresso vignetting */}
        <div className="absolute inset-0 bg-gradient-to-t from-noir-950 via-noir-950/60 to-transparent" />
        <div className="absolute inset-0 bg-radial-vignette opacity-70" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-28 text-center space-y-8">
        {/* House Heritage Creed */}
        <div className="inline-flex items-center gap-3 px-4 py-1.5 border border-gold-400/25 bg-noir-900/60 backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-amberGlow-500 animate-pulse" />
          <span className="text-[11px] uppercase tracking-[0.3em] text-gold-300 font-light">
            Maison de Haute Parfumerie &bull; Paris &bull; New York
          </span>
        </div>

        {/* Editorial Title */}
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-serif text-ivory-100 font-normal tracking-[0.06em] leading-[1.08]">
            Sovereign Scents <br />
            <span className="italic font-light text-gold-300">Bottled in Obsidian</span>
          </h1>
          <p className="max-w-2xl mx-auto text-xs sm:text-sm md:text-base text-ivory-300 font-light leading-relaxed tracking-wider">
            A rare synthesis of aged Cambodian agarwood, royal Florentine iris, and midnight botanicals.
            Hand-crafted in limited seasonal distillations at extraordinary extrait concentrations.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-5">
          <Link
            href="/shop?collection=the-nocturne-series"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-gold-400 hover:bg-gold-300 text-noir-950 px-8 py-4 text-xs uppercase tracking-widest font-medium transition-all duration-300 shadow-luxury group"
          >
            <span>The Nocturne Series</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/shop"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 border border-gold-400/40 hover:border-gold-300 hover:bg-gold-400/10 text-ivory-100 px-8 py-4 text-xs uppercase tracking-widest font-medium transition-all duration-300"
          >
            <Compass className="w-4 h-4 text-gold-400" />
            <span>Explore All Flacons</span>
          </Link>
        </div>

        {/* Architectural Pillars / Accolades */}
        <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-white/10 max-w-4xl mx-auto text-left">
          <div>
            <span className="block text-[10px] uppercase tracking-widest text-gold-400">Concentration</span>
            <span className="block text-sm font-serif text-ivory-200 mt-0.5">28% - 34% Extrait</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase tracking-widest text-gold-400">Maceration</span>
            <span className="block text-sm font-serif text-ivory-200 mt-0.5">180-Day Cold Rest</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase tracking-widest text-gold-400">Flacon Craft</span>
            <span className="block text-sm font-serif text-ivory-200 mt-0.5">French Obsidian Glass</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase tracking-widest text-gold-400">Delivery</span>
            <span className="block text-sm font-serif text-ivory-200 mt-0.5">White Glove Courier</span>
          </div>
        </div>
      </div>
    </section>
  );
}
