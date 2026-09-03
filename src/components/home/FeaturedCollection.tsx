import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { CollectionData } from '@/types';

interface FeaturedCollectionProps {
  collections: CollectionData[];
}

export default function FeaturedCollection({ collections }: FeaturedCollectionProps) {
  return (
    <section className="py-24 max-w-7xl mx-auto px-6 space-y-16">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6">
        <div className="space-y-3">
          <span className="text-[10px] uppercase tracking-[0.3em] text-gold-400 font-medium">
            Maison Chapters
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-ivory-100 font-normal">
            Featured Collections
          </h2>
          <div className="w-12 h-px bg-gold-400/50" />
          <p className="text-xs text-ivory-400 font-light max-w-md leading-relaxed">
            Three distinct chapters of haute parfumerie, bound by rare botanicals, smoky ambers, and aged agarwood.
          </p>
        </div>

        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-gold-400 hover:text-gold-200 transition-colors font-medium group"
        >
          <span>View All Flacons</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Grid of 3 Collections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {collections.slice(0, 3).map((col, idx) => (
          <Link
            key={col.slug}
            href={`/collection/${col.slug}`}
            className="group relative h-[480px] bg-noir-900 border border-white/10 hover:border-gold-dim overflow-hidden flex flex-col justify-end p-8 transition-all duration-700"
          >
            {/* Background Image with slow zoom */}
            <Image
              src={col.heroImage || 'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?q=80&w=1400'}
              alt={col.name}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105 brightness-[0.42] group-hover:brightness-[0.55]"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-noir-950 via-noir-950/60 to-transparent" />

            {/* Roman Numerals / Chapter Tag */}
            <div className="absolute top-6 right-6 font-serif text-2xl text-gold-400/30 font-light">
              0{idx + 1}
            </div>

            {/* Content */}
            <div className="relative z-10 space-y-3">
              <span className="text-[10px] uppercase tracking-widest text-gold-400 font-light block">
                Chapter 0{idx + 1}
              </span>
              <h3 className="font-serif text-2xl text-ivory-100 group-hover:text-gold-200 transition-colors">
                {col.name}
              </h3>
              <p className="text-xs text-ivory-300 font-light line-clamp-2 leading-relaxed">
                {col.description}
              </p>
              <div className="pt-2 flex items-center gap-2 text-[11px] uppercase tracking-widest text-gold-400 group-hover:text-gold-300 font-medium">
                <span>Explore Chapter Flacons</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
