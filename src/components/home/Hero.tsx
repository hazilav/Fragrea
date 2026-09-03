'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Compass } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-[92vh] lg:min-h-[98vh] flex items-center justify-center overflow-hidden bg-noir-950">
      {/* ============================================================ */}
      {/* 1. CINEMATIC BACKGROUND: LUXURY PERFUME PHOTOGRAPHY & SHADOWS */}
      {/* ============================================================ */}
      <div className="absolute inset-0 z-0 overflow-hidden select-none pointer-events-none">
        {/* Cinematic Flacon Image with Slow Drift */}
        <Image
          src="https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=2160&auto=format&fit=crop"
          alt="FRAGREA Haute Parfumerie Flacon"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center brightness-[0.42] contrast-[1.2] scale-105 animate-slow-drift motion-reduce:transform-none motion-reduce:animate-none"
        />

        {/* Dramatic Chiaroscuro Overlays: Deep Black & Espresso */}
        <div className="absolute inset-0 bg-gradient-to-t from-noir-950 via-noir-950/50 to-noir-950/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-noir-950/80 via-transparent to-noir-950/80" />
        <div className="absolute inset-0 bg-espresso-950/30 mix-blend-multiply" />

        {/* Soft Ambient Amber Lighting Movement */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[38rem] h-[38rem] bg-amberGlow-500/15 rounded-full blur-[150px] animate-slow-glow motion-reduce:animate-none" />
        <div className="absolute -top-24 right-1/4 w-80 h-80 bg-gold-400/10 rounded-full blur-[120px] pointer-events-none" />
      </div>

      {/* ============================================================ */}
      {/* 2. MINIMALIST LUXURY EDITORIAL CONTENT */}
      {/* ============================================================ */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-8 py-20 text-center space-y-8 sm:space-y-10">
        {/* Brandmark / Maison Identifier with subtle fade-up */}
        <div className="animate-reveal-up motion-reduce:animate-none">
          <span className="inline-block text-xs sm:text-sm font-sans uppercase tracking-[0.45em] text-gold-300 font-light select-none">
            FRAGREA
          </span>
          <div className="w-8 h-px bg-gold-400/30 mx-auto mt-2" />
        </div>

        {/* Primary Campaign Headline */}
        <div className="space-y-2 animate-reveal-up delay-200 motion-reduce:animate-none">
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-serif text-ivory-100 font-normal tracking-[0.05em] leading-[1.08]">
            FRAGRANCE CRAFTED <br />
            <span className="italic font-light text-ivory-200">TO BE REMEMBERED.</span>
          </h1>
        </div>

        {/* Poetic Essence Subtitle */}
        <div className="max-w-2xl mx-auto animate-reveal-up delay-400 motion-reduce:animate-none">
          <p className="text-sm sm:text-base md:text-xl text-ivory-300 font-light font-serif italic tracking-wide leading-relaxed">
            &ldquo;Distinct compositions, created with depth, character and presence.&rdquo;
          </p>
        </div>

        {/* Call-to-Actions (Fade-in) */}
        <div className="pt-4 sm:pt-6 flex flex-col sm:flex-row items-center justify-center gap-5 animate-fade-in delay-600 motion-reduce:animate-none">
          {/* Primary CTA */}
          <Link
            href="/collections"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-gold-400 hover:bg-gold-300 text-noir-950 px-10 py-4 text-xs uppercase tracking-[0.24em] font-semibold transition-all duration-300 shadow-luxury hover:shadow-gold-subtle group btn-luxury"
          >
            <span>DISCOVER THE COLLECTION</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>

          {/* Secondary Subtle Link */}
          <Link
            href="/about"
            className="inline-flex items-center justify-center gap-2 text-xs uppercase tracking-[0.24em] text-ivory-300 hover:text-gold-300 transition-colors duration-300 py-3 px-4 group select-none"
          >
            <span>EXPLORE FRAGREA</span>
            <ArrowRight className="w-3.5 h-3.5 text-gold-400/70 group-hover:text-gold-300 group-hover:translate-x-1 transition-all duration-300" />
          </Link>
        </div>
      </div>

      {/* Atmospheric bottom gradient transition to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-noir-950 to-transparent pointer-events-none z-10" />
    </section>
  );
}
