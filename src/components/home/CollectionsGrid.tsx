import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { CollectionData } from '@/types';

interface CollectionsGridProps {
  collections: CollectionData[];
}

export default function CollectionsGrid({ collections }: CollectionsGridProps) {
  return (
    <section className="py-24 bg-espresso-950/60 border-y border-gold-dim">
      <div className="max-w-7xl mx-auto px-6 space-y-16">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-[10px] uppercase tracking-[0.3em] text-gold-400 font-medium">
            Curated Chapters
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-ivory-100 font-normal">
            The Three Collections
          </h2>
          <div className="w-12 h-px bg-gold-400/40 mx-auto" />
          <p className="text-xs text-ivory-400 font-light leading-relaxed">
            Each collection represents a distinct olfactory realm, bound by rare botanicals and aged resin accords.
          </p>
        </div>

        {/* Collections Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {collections.map((col, idx) => (
            <Link
              key={col.id || col.slug}
              href={`/shop?collection=${col.slug}`}
              className="group relative h-[480px] overflow-hidden bg-noir-900 border border-white/10 hover:border-gold-dim transition-all duration-500 flex flex-col justify-end p-8"
            >
              {/* Background photography */}
              <Image
                src={col.heroImage || 'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?q=80&w=1400'}
                alt={col.name}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 group-hover:brightness-90 brightness-[0.45]"
              />

              {/* Gradient overlay for readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-noir-950 via-noir-950/70 to-transparent" />

              {/* Numbering Watermark */}
              <div className="absolute top-6 right-6 font-serif text-3xl text-gold-400/20 font-light">
                0{idx + 1}
              </div>

              {/* Content */}
              <div className="relative z-10 space-y-3">
                <span className="text-[10px] uppercase tracking-widest text-gold-400 font-light block">
                  Haute Archive
                </span>
                <h3 className="font-serif text-2xl text-ivory-100 group-hover:text-gold-200 transition-colors">
                  {col.name}
                </h3>
                <p className="text-xs text-ivory-300 font-light line-clamp-2 leading-relaxed">
                  {col.description}
                </p>
                <div className="pt-2 flex items-center gap-2 text-[11px] uppercase tracking-widest text-gold-400 group-hover:text-gold-300 font-medium">
                  <span>Explore Flacons</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
