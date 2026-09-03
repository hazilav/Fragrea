'use client';

import React, { useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { ProductData } from '@/types';
import ProductCard from '@/components/ui/ProductCard';

interface FragranceCharacterSectionProps {
  products: ProductData[];
}

interface CharacterCategory {
  id: string;
  name: string;
  subtitle: string;
  accords: string;
  filterSlug: string[];
}

const CHARACTERS: CharacterCategory[] = [
  {
    id: 'nocturnal',
    name: 'Nocturnal & Enigmatic',
    subtitle: 'Smoldering incense, aged Cambodian agarwood, birch tar & dark leather',
    accords: 'Oud &bull; Frankincense &bull; Birch Tar &bull; Saffron',
    filterSlug: ['oud-nocturne', 'cuir-tabac'],
  },
  {
    id: 'aristocratic',
    name: 'Aristocratic & Creamy',
    subtitle: 'Sacred Mysore sandalwood, cracked cardamom & crystalline cashmeran',
    accords: 'Mysore Sandalwood &bull; Cashmeran &bull; Cardamom',
    filterSlug: ['santal-imperial'],
  },
  {
    id: 'amber',
    name: 'Molten Amber & Solar',
    subtitle: 'Golden Moroccan labdanum, royal Siam benzoin, honeycomb & sun-salt',
    accords: 'Labdanum &bull; Benzoin &bull; Honeycomb &bull; Orange Blossom',
    filterSlug: ['ambre-celeste', 'neroli-renaissance'],
  },
  {
    id: 'floral',
    name: 'Dark Velvet Florals',
    subtitle: 'Nocturnal Damask roses dipped in black pepper, coffee absolu & suede',
    accords: 'Damask Rose &bull; Roasted Coffee &bull; Tuscan Suede',
    filterSlug: ['rose-velours'],
  },
  {
    id: 'earthy',
    name: 'Earthy Aristocracy',
    subtitle: 'Smoky Haitian vetiver roots, green bergamot & 3-year cured Florentine iris',
    accords: 'Haitian Vetiver &bull; Iris Pallida &bull; Bergamot',
    filterSlug: ['vetiver-solaire', 'iris-dor'],
  },
];

export default function FragranceCharacterSection({
  products,
}: FragranceCharacterSectionProps) {
  const [activeCharId, setActiveCharId] = useState('nocturnal');

  const activeChar = CHARACTERS.find((c) => c.id === activeCharId) || CHARACTERS[0];

  const matchingProducts = products.filter((p) =>
    activeChar.filterSlug.includes(p.slug)
  );

  return (
    <section id="character" className="py-28 bg-noir-900 border-b border-gold-dim">
      <div className="max-w-7xl mx-auto px-6 space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-[10px] uppercase tracking-[0.35em] text-gold-400 font-medium">
            Olfactory Taxonomy
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-ivory-100 font-normal">
            Discover by Fragrance Character
          </h2>
          <div className="w-12 h-px bg-gold-400/50 mx-auto" />
          <p className="text-xs text-ivory-400 font-light leading-relaxed">
            Every creation is defined by a sovereign temperament. Select an olfactory personality to reveal
            the harmonious extraits distilled for your skin.
          </p>
        </div>

        {/* Character Navigation Tabs */}
        <div className="flex justify-center overflow-x-auto pb-2">
          <div className="inline-flex gap-2 p-1.5 bg-noir-950 border border-gold-dim rounded-sm">
            {CHARACTERS.map((char) => (
              <button
                key={char.id}
                onClick={() => setActiveCharId(char.id)}
                className={`px-5 py-2.5 text-xs uppercase tracking-widest font-medium transition-all duration-300 shrink-0 ${
                  activeCharId === char.id
                    ? 'bg-gold-400 text-noir-950 shadow-gold-subtle'
                    : 'text-ivory-400 hover:text-ivory-100'
                }`}
              >
                {char.name.split('&')[0].trim()}
              </button>
            ))}
          </div>
        </div>

        {/* Active Character Atmospheric Banner */}
        <div className="text-center max-w-xl mx-auto space-y-2 p-6 bg-espresso-950/60 border border-white/5 animate-fade-in">
          <h3 className="font-serif text-2xl text-ivory-100">{activeChar.name}</h3>
          <p className="text-xs text-gold-300 italic font-light">{activeChar.subtitle}</p>
          <div
            className="text-[11px] text-ivory-400 font-mono tracking-wider pt-1"
            dangerouslySetInnerHTML={{ __html: activeChar.accords }}
          />
        </div>

        {/* Matching Flacons Display */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
          {matchingProducts.length > 0 ? (
            matchingProducts.map((p) => <ProductCard key={p.id} product={p} />)
          ) : (
            <div className="col-span-full py-12 text-center text-xs text-ivory-400">
              No flacons matched this filter.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
