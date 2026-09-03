'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { CollectionData } from '@/types';

interface CollectionsProductsSectionProps {
  collections: CollectionData[];
}

export default function CollectionsProductsSection({ collections }: CollectionsProductsSectionProps) {
  const displayCollections = collections.slice(0, 3);

  return (
    <section id="collections" className="py-28 sm:py-36 px-6 sm:px-8 bg-espresso-950 border-b border-white/5 relative">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
          <div>
            <span className="text-[10px] uppercase tracking-[0.4em] text-gold-400 font-light block">
              Maison Anthologies
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif text-ivory-100 font-normal tracking-[0.04em] mt-1">
              Curated Collections
            </h2>
          </div>
          <Link
            href="/collections"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-gold-400 hover:text-gold-300 transition-colors font-medium"
          >
            <span>VIEW ALL COLLECTIONS</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 3-Collection Visual Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {displayCollections.map((col, idx) => (
            <Link
              key={col.id}
              href={`/collection/${col.slug}`}
              className="group flex flex-col bg-noir-900 border border-white/10 hover:border-gold-400/40 transition-all duration-500 overflow-hidden shadow-luxury"
            >
              <div className="relative aspect-[4/5] bg-noir-950 overflow-hidden">
                <Image
                  src={
                    col.heroImage ||
                    'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1200'
                  }
                  alt={col.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover object-center brightness-[0.82] contrast-[1.08] transition-transform duration-1000 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-noir-950 via-noir-950/30 to-transparent" />
                <div className="absolute top-5 left-5 px-3 py-1 bg-noir-950/85 backdrop-blur-md border border-white/10 text-[9px] uppercase tracking-[0.25em] text-gold-300 font-light">
                  Anthology 0{idx + 1}
                </div>
              </div>

              <div className="p-8 flex-1 flex flex-col justify-between space-y-4 bg-noir-900/80">
                <div className="space-y-2">
                  <h3 className="font-serif text-2xl text-ivory-100 group-hover:text-gold-300 transition-colors">
                    {col.name}
                  </h3>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-gold-400/80 font-light">
                    {col.subtitle}
                  </p>
                  <p className="text-xs text-ivory-400 font-light leading-relaxed line-clamp-2 pt-1">
                    {col.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-ivory-200 group-hover:text-gold-300 transition-colors font-medium">
                  <span>DISCOVER</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
