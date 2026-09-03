'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { CollectionData } from '@/types';

interface SignatureCollectionProps {
  collections: CollectionData[];
}

export default function SignatureCollection({ collections }: SignatureCollectionProps) {
  // Fallback signature collections if database ones are empty
  const defaultCollections = [
    {
      id: 'c1',
      name: 'The Nocturne Series',
      slug: 'the-nocturne-series',
      subtitle: 'Midnight Florals & Smoked Agarwood',
      description:
        'Born under the quietude of twilight. Hypnotic Bulgarian damascena rose immersed in aged wild Cambodian oud.',
      heroImage:
        'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?q=80&w=1400&auto=format&fit=crop',
    },
    {
      id: 'c2',
      name: 'Private Reserve',
      slug: 'private-reserve',
      subtitle: 'Cellar-Aged Vintage Extraits',
      description:
        'Reserved for sovereign connoisseurs. Matured for 180 days in temperature-shielded oak casks in Grasse.',
      heroImage:
        'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1400&auto=format&fit=crop',
    },
    {
      id: 'c3',
      name: "L'Or d'Orient",
      slug: 'lor-dorient',
      subtitle: 'Liquid Gold & Rare Frankincense',
      description:
        'Sacred royal resins, sparkling saffron threads, and warm solar amber distilled into an obsidian flacon.',
      heroImage:
        'https://images.unsplash.com/photo-1563178406-4cdc2923acbc?q=80&w=1400&auto=format&fit=crop',
    },
  ];

  const items = collections && collections.length > 0 ? collections : defaultCollections;

  return (
    <section id="signature" className="py-28 px-6 sm:px-8 bg-noir-950 border-b border-white/5 relative">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="text-[10px] uppercase tracking-[0.38em] text-gold-400 font-light block">
            Olfactory Anthologies
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-ivory-100 font-normal tracking-[0.04em]">
            Signature Collection
          </h2>
          <p className="text-xs sm:text-sm text-ivory-300 font-light leading-relaxed tracking-wider">
            Three distinct chapters of haute parfumerie, hand-blended with sovereign natural essences at extraordinary concentration.
          </p>
        </div>

        {/* Collection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
          {items.map((col, idx) => (
            <Link
              key={col.id || col.slug}
              href={`/collection/${col.slug}`}
              className="group flex flex-col bg-noir-900/60 border border-white/10 hover:border-gold-400/40 transition-all duration-500 overflow-hidden shadow-luxury"
            >
              {/* Image Container with Cinematic Zoom */}
              <div className="relative aspect-[4/5] overflow-hidden bg-noir-950">
                <Image
                  src={
                    col.heroImage ||
                    'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?q=80&w=1400&auto=format&fit=crop'
                  }
                  alt={col.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover object-center brightness-[0.85] contrast-[1.08] transition-transform duration-1000 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-noir-950 via-noir-950/30 to-transparent" />
                
                {/* Chapter Number Badge */}
                <div className="absolute top-5 left-5 px-3 py-1 bg-noir-950/80 backdrop-blur-md border border-white/10 text-[9px] uppercase tracking-[0.25em] text-gold-300 font-light">
                  Anthology 0{idx + 1}
                </div>
              </div>

              {/* Text Dossier */}
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
