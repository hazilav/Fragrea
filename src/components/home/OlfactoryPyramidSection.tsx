'use client';

import React, { useState } from 'react';
import { Sparkles, Clock, Feather, ShieldAlert } from 'lucide-react';

export default function OlfactoryPyramidSection() {
  const [activeTier, setActiveTier] = useState<'top' | 'heart' | 'base'>('heart');

  const tiers = {
    top: {
      title: 'Tête (Top Notes)',
      evolution: 'First 15 - 30 Minutes',
      role: 'The Initial Enchantment',
      description:
        'The opening chord that awakens the senses upon first spray. Light, vibrant, and fleeting molecules that prepare the skin for deeper accords.',
      ingredients: [
        { name: 'Calabrian Bergamot', origin: 'Southern Italy', trait: 'Cold-pressed solar citrus with peppery sparkle' },
        { name: 'Saffron Suede', origin: 'Kashmir', trait: 'Golden spice with warm, bittersweet leather facets' },
        { name: 'Cracked Cardamom', origin: 'Guatemala', trait: 'Eucalyptus freshness and crystalline aromatic warmth' },
        { name: 'Bitter Petitgrain', origin: 'Paraguay', trait: 'Crisp woody citrus leaf with green herbal undertones' },
      ],
    },
    heart: {
      title: 'Cœur (Heart Notes)',
      evolution: '20 Minutes to 4 Hours',
      role: 'The Architectural Identity',
      description:
        'The true spirit and character of the extrait. As the top notes gently diffuse, the heart unfolds its opulent florals, aged woods, and sacred resins.',
      ingredients: [
        { name: 'Florentine Iris Pallida', origin: 'Tuscany, Italy', trait: '3-year aged rhizome butter with silvery violet elegance' },
        { name: 'Taif Rose Absolu', origin: 'Saudi Arabia', trait: 'High-altitude mountain rose, spicy, dark, and intoxicating' },
        { name: 'Mysore Sandalwood', origin: 'Karnataka, India', trait: 'Milky, sacred woody depth of ancient vintage' },
        { name: 'Smoked Frankincense', origin: 'Oman', trait: 'Royal Green Hojari resin tears with smoldering amber trails' },
      ],
    },
    base: {
      title: 'Fond (Base Notes)',
      evolution: '4 Hours to Beyond 24 Hours',
      role: 'The Eternal Soul & Sillage',
      description:
        'The foundational anchor that clings to garment fibers and warms with your body temperature. These heavy molecular weight resins determine unforgettable sillage.',
      ingredients: [
        { name: 'Cambodian Agarwood (Oud)', origin: 'Koh Kong, Cambodia', trait: 'Aged wild resin with medicinal leather & smoky honey' },
        { name: 'Raw Ambergris', origin: 'Atlantic Coast', trait: 'Oceanic mineral sweetness providing radiant diffusion' },
        { name: 'Bourbon Vanilla Bean', origin: 'Madagascar', trait: 'Dark, woody, balsamic sweetness without sugary synthetic tones' },
        { name: 'Tuscan Suede Accord', origin: 'Florence, Italy', trait: 'Supple leather notes reminiscent of bespoke vintage boots' },
      ],
    },
  };

  const current = tiers[activeTier];

  return (
    <section className="py-24 bg-noir-900 border-b border-gold-dim">
      <div className="max-w-7xl mx-auto px-6 space-y-16">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-[10px] uppercase tracking-[0.3em] text-gold-400 font-medium">
            The Craft of Extraction
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-ivory-100 font-normal">
            The Olfactory Pyramid
          </h2>
          <div className="w-12 h-px bg-gold-400/40 mx-auto" />
          <p className="text-xs text-ivory-400 font-light leading-relaxed">
            True luxury perfumery does not remain static. It travels through time across three distinct
            harmonic movements on the skin.
          </p>
        </div>

        {/* Tier Selector Buttons */}
        <div className="flex justify-center">
          <div className="inline-flex p-1 bg-noir-950 border border-gold-dim rounded-sm">
            {(['top', 'heart', 'base'] as const).map((tier) => (
              <button
                key={tier}
                onClick={() => setActiveTier(tier)}
                className={`px-6 py-2.5 text-xs uppercase tracking-widest font-medium transition-all ${
                  activeTier === tier
                    ? 'bg-gold-400 text-noir-950 shadow-sm'
                    : 'text-ivory-400 hover:text-ivory-100'
                }`}
              >
                {tier === 'top' ? 'Top (Tête)' : tier === 'heart' ? 'Heart (Cœur)' : 'Base (Fond)'}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Pyramid Display */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center bg-espresso-950/40 border border-white/5 p-8 lg:p-12">
          {/* Visual Triangle Representation */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center space-y-3">
            {/* Top Tier Segment */}
            <div
              onClick={() => setActiveTier('top')}
              className={`w-32 h-16 clip-trapezoid flex flex-col items-center justify-center cursor-pointer transition-all duration-300 border ${
                activeTier === 'top'
                  ? 'bg-gold-400/20 border-gold-400 text-gold-300 shadow-gold-subtle scale-105'
                  : 'bg-noir-850/80 border-white/10 text-ivory-400 hover:border-gold-dim'
              }`}
            >
              <span className="text-[10px] uppercase tracking-widest font-semibold">Tête</span>
              <span className="text-[9px] opacity-70">Top Notes</span>
            </div>

            {/* Heart Tier Segment */}
            <div
              onClick={() => setActiveTier('heart')}
              className={`w-48 h-20 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 border ${
                activeTier === 'heart'
                  ? 'bg-gold-400/20 border-gold-400 text-gold-300 shadow-gold-subtle scale-105'
                  : 'bg-noir-850/80 border-white/10 text-ivory-400 hover:border-gold-dim'
              }`}
            >
              <span className="text-[11px] uppercase tracking-widest font-semibold">Cœur</span>
              <span className="text-[9px] opacity-70">Heart Notes</span>
            </div>

            {/* Base Tier Segment */}
            <div
              onClick={() => setActiveTier('base')}
              className={`w-64 h-24 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 border ${
                activeTier === 'base'
                  ? 'bg-gold-400/20 border-gold-400 text-gold-300 shadow-gold-subtle scale-105'
                  : 'bg-noir-850/80 border-white/10 text-ivory-400 hover:border-gold-dim'
              }`}
            >
              <span className="text-[12px] uppercase tracking-widest font-semibold">Fond</span>
              <span className="text-[9px] opacity-70">Base Notes (Soul)</span>
            </div>
          </div>

          {/* Details Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-gold-400 text-xs tracking-widest uppercase">
                <Clock className="w-4 h-4" />
                <span>{current.evolution}</span>
                <span className="text-white/20">&bull;</span>
                <span className="text-ivory-300">{current.role}</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-serif text-ivory-100">
                {current.title}
              </h3>
              <p className="text-xs text-ivory-300 font-light leading-relaxed">
                {current.description}
              </p>
            </div>

            {/* Signature Ingredients List */}
            <div className="space-y-3 pt-4 border-t border-white/10">
              <span className="text-[10px] uppercase tracking-widest text-gold-400 font-medium block">
                Signature House Absolutes & Accords:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {current.ingredients.map((ing) => (
                  <div key={ing.name} className="p-3.5 bg-noir-950/80 border border-white/5 space-y-1">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs font-serif text-ivory-100">{ing.name}</span>
                      <span className="text-[9px] text-gold-400/80 uppercase tracking-wider">
                        {ing.origin}
                      </span>
                    </div>
                    <p className="text-[11px] text-ivory-400 font-light leading-snug">
                      {ing.trait}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
