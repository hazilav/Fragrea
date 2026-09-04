'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Play, Sparkles, ArrowRight, X } from 'lucide-react';

interface SlideData {
  id: string;
  number: string;
  label: string;
  title1: string;
  title2: string;
  description: string;
  image: string;
  flaconName: string;
  flaconSubtitle: string;
  slug: string;
}

const SLIDES: SlideData[] = [
  {
    id: '01',
    number: '01',
    label: 'CRAFTING',
    title1: 'TIMELESS',
    title2: 'ELEGANCE',
    description:
      'Discover the art of fine fragrance, where every flacon tells a story of luxury, passion, and perfection.',
    image: '/images/hero/hero-flacon-main.jpg',
    flaconName: 'AURÉLIA',
    flaconSubtitle: 'Extrait de Parfum • 30% Pure Oil',
    slug: 'aamee',
  },
  {
    id: '02',
    number: '02',
    label: 'MAISON ARCHIVE',
    title1: 'SOVEREIGN',
    title2: 'PRESENCE',
    description:
      'Rare botanical accords, cold-macerated in French obsidian flacons to achieve unparalleled depth and longevity.',
    image: '/images/hero/hero-flacon-02.jpg',
    flaconName: 'AURUM NOCTURNE',
    flaconSubtitle: 'Rare Cambodian Agarwood & Smoked Resins',
    slug: 'kiswah',
  },
  {
    id: '03',
    number: '03',
    label: 'HAUTE PARFUMERIE',
    title1: 'OUD',
    title2: 'SOUVERAIN',
    description:
      'Precious aged agarwood distilled with royal night-blooming jasmine and dark smoked leather.',
    image: '/images/hero/hero-flacon-03.jpg',
    flaconName: 'OUD SOUVERAIN',
    flaconSubtitle: 'Single-Distillate Vintage Reserve',
    slug: 'abrar',
  },
  {
    id: '04',
    number: '04',
    label: 'PRIVATE RESERVE',
    title1: 'IMPERIAL',
    title2: 'ÉCLAT D’OR',
    description:
      'A majestic alchemy of Florentine iris, golden saffron, and velvet amber crafted to linger indefinitely.',
    image: '/images/hero/hero-flacon-04.jpg',
    flaconName: 'IMPERIAL D’OR',
    flaconSubtitle: 'Pure Extrait de Parfum 100ml',
    slug: 'qalb',
  },
];

export default function Hero() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);

  const activeSlide = SLIDES[currentSlideIndex];

  // Auto-advance slides every 8 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % SLIDES.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-[92vh] lg:min-h-[calc(100vh-100px)] flex items-center overflow-hidden bg-noir-950 select-none">
      {/* ============================================================ */}
      {/* 1. BACKGROUND PHOTOGRAPHY WITH SMOOTH CROSSFADE */}
      {/* ============================================================ */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {SLIDES.map((slide, idx) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentSlideIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <Image
              src={slide.image}
              alt={`${slide.title1} ${slide.title2} - Fragrea Haute Parfumerie`}
              fill
              priority={idx === 0}
              sizes="100vw"
              className="object-cover object-center lg:object-[center_right] brightness-[0.78] contrast-[1.08] transform-gpu"
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
              }}
            />
          </div>
        ))}

        {/* Chiaroscuro & Cinematic Vignette Overlays */}
        {/* Deep shadow on left half to give typography maximum contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-noir-950 via-noir-950/70 to-transparent w-full sm:w-3/4 lg:w-3/5" />
        {/* Soft bottom gradient to merge into signature section */}
        <div className="absolute inset-0 bg-gradient-to-t from-noir-950 via-transparent to-noir-950/40" />

        {/* Subtle warm golden ambient radial glow */}
        <div
          className="absolute top-1/3 right-1/4 w-[38rem] h-[38rem] rounded-full pointer-events-none transform-gpu"
          style={{
            background:
              'radial-gradient(circle, rgba(212, 175, 55, 0.12) 0%, rgba(212, 158, 106, 0.04) 45%, transparent 70%)',
            transform: 'translate3d(0, 0, 0)',
          }}
        />
      </div>

      {/* ============================================================ */}
      {/* 2. MAIN HERO CONTENT (LEFT ALIGNED LIKE REFERENCE) */}
      {/* ============================================================ */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 w-full pt-28 sm:pt-32 lg:pt-36 pb-20 sm:pb-28">
        <div className="max-w-xl lg:max-w-2xl space-y-6 sm:space-y-7">
          {/* Top Label: CRAFTING */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] sm:text-xs font-sans uppercase tracking-[0.45em] text-gold-400 font-light block">
              {activeSlide.label}
            </span>
          </div>

          {/* Majestic Hero Headline: TIMELESS ELEGANCE */}
          <div className="space-y-1">
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-serif font-normal tracking-[0.04em] leading-[1.04] text-ivory-100">
              <span className="block drop-shadow-sm">{activeSlide.title1}</span>
              <span className="block italic text-gold-300 font-light drop-shadow-sm">
                {activeSlide.title2}
              </span>
            </h1>
          </div>

          {/* Decorative Gold Sparkle / Diamond Ornament */}
          <div className="flex items-center gap-2 pt-1 text-gold-400/80">
            <span className="text-xs">✦</span>
          </div>

          {/* Subtitle Description */}
          <p className="text-sm sm:text-base md:text-lg text-ivory-200/90 font-serif italic tracking-wide leading-relaxed max-w-lg font-light">
            &ldquo;{activeSlide.description}&rdquo;
          </p>

          {/* Outlined Button: EXPLORE COLLECTION */}
          <div className="pt-2 sm:pt-4">
            <Link
              href="/collections"
              className="inline-block border border-gold-400/70 hover:border-gold-300 text-ivory-100 hover:text-gold-200 px-8 sm:px-10 py-3.5 sm:py-4 text-[11px] sm:text-xs uppercase tracking-[0.28em] font-sans font-medium transition-all duration-300 hover:bg-gold-400/10 shadow-luxury group"
            >
              <span className="inline-flex items-center gap-3">
                <span>EXPLORE COLLECTION</span>
                <ArrowRight className="w-3.5 h-3.5 text-gold-400 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. BOTTOM-LEFT PAGINATION / SLIDER CONTROLS (01, 02, 03, 04) */}
      {/* ============================================================ */}
      <div className="absolute bottom-8 sm:bottom-12 left-6 sm:left-12 z-20 hidden sm:flex flex-col gap-3 font-mono text-xs">
        {SLIDES.map((slide, idx) => {
          const isActive = idx === currentSlideIndex;
          return (
            <button
              key={slide.id}
              onClick={() => setCurrentSlideIndex(idx)}
              className={`flex items-center gap-3 transition-all duration-300 text-left py-1 group ${
                isActive ? 'text-gold-300 font-bold' : 'text-ivory-400/60 hover:text-ivory-200'
              }`}
              aria-label={`Go to slide ${slide.number} - ${slide.title1}`}
            >
              <span className="text-xs tracking-wider">{slide.number}</span>
              {isActive && (
                <div className="flex items-center gap-1.5 animate-in fade-in duration-300">
                  <span className="w-8 sm:w-10 h-px bg-gold-400 block" />
                  <span className="text-[9px] text-gold-400">✦</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* ============================================================ */}
      {/* 4. BOTTOM-RIGHT STORY ACTION: ( > ) WATCH OUR STORY */}
      {/* ============================================================ */}
      <div className="absolute bottom-8 sm:bottom-12 right-6 sm:right-12 z-20">
        <button
          onClick={() => setIsStoryModalOpen(true)}
          className="flex items-center gap-3.5 text-ivory-200 hover:text-gold-300 transition-all duration-300 group py-2 select-none"
          aria-label="Watch our story"
        >
          {/* Circular Outlined Play Button */}
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-white/25 group-hover:border-gold-400/80 flex items-center justify-center transition-all duration-300 bg-noir-950/40 group-hover:bg-gold-400/10 shadow-lg">
            <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold-300 ml-0.5 transition-transform duration-300 group-hover:scale-110" />
          </div>

          {/* Text Label */}
          <span className="text-[10.5px] sm:text-xs uppercase tracking-[0.26em] font-sans font-light">
            WATCH OUR STORY
          </span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* 5. LUXURY ATELIER STORY MODAL */}
      {/* ============================================================ */}
      {isStoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative max-w-2xl w-full bg-noir-950 border border-gold-400/30 p-8 sm:p-12 shadow-2xl space-y-6">
            <button
              onClick={() => setIsStoryModalOpen(false)}
              className="absolute top-5 right-5 text-ivory-300 hover:text-gold-300 transition-colors p-1"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-[0.35em] text-gold-400 font-light block">
                MAISON ATELIER PRIVÉ
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif text-ivory-100">
                The Heritage of Fragrea
              </h3>
            </div>

            <p className="font-serif italic text-ivory-300 leading-relaxed text-sm sm:text-base">
              &ldquo;Founded in the pursuit of olfactory perfection, Maison Fragrea distills the finest raw materials from Grasse and Arabia. Each composition undergoes 60 days of cold maceration inside dark obsidian flacons to create sovereign fragrances crafted to be remembered.&rdquo;
            </p>

            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <Link
                href="/about"
                onClick={() => setIsStoryModalOpen(false)}
                className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-gold-300 hover:text-gold-200"
              >
                <span>Read Full Brand Memoir</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <Link
                href="/collections"
                onClick={() => setIsStoryModalOpen(false)}
                className="w-full sm:w-auto bg-gold-400 hover:bg-gold-300 text-noir-950 px-6 py-2.5 text-xs uppercase tracking-[0.2em] font-medium text-center transition-colors"
              >
                Explore Flacons
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
