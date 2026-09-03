'use client';

import React from 'react';
import { Droplets, Clock, ShieldCheck, Sparkles, Gem, Award } from 'lucide-react';

export default function FragreaWorld() {
  const pillars = [
    {
      icon: Droplets,
      tag: 'CONCENTRATION',
      title: '30%+ Pure Extrait',
      description:
        'Never diluted to commercial eau de toilette. Every composition is hand-poured at extraordinary oil concentration for profound longevity and intimate sillage.',
    },
    {
      icon: Clock,
      tag: 'MATURATION',
      title: '180-Day Cellar Maceration',
      description:
        'Cold rested for six lunar cycles in dark, climate-controlled chambers in Grasse, allowing volatile and heavy aromatic molecules to marry permanently.',
    },
    {
      icon: Gem,
      tag: 'THE VESSEL',
      title: 'Obsidian Crystal Glass',
      description:
        'Custom-cast heavyweight black French glass engineered to block 100% of ultraviolet wavelengths, protecting living botanical essences for decades.',
    },
    {
      icon: Award,
      tag: 'INTEGRITY',
      title: 'Numbered Atelier Batches',
      description:
        'Every flacon is individually hand-filled, sealed with heavy brushed-gold brassware, and dispatched with an authenticated certificate of origin.',
    },
  ];

  return (
    <section className="py-28 sm:py-36 px-6 sm:px-8 bg-noir-950 border-b border-white/5 relative">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="text-[10px] uppercase tracking-[0.38em] text-gold-400 font-light block">
            Atelier &amp; Heritage
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-ivory-100 font-normal tracking-[0.04em]">
            The FRAGREA World
          </h2>
          <p className="text-xs sm:text-sm text-ivory-300 font-light leading-relaxed tracking-wider">
            Reclaiming the sovereign heritage of French haute parfumerie through uncompromising raw materials, patience, and sculptural craft.
          </p>
        </div>

        {/* 4 Architectural Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="p-8 bg-noir-900/60 border border-white/10 hover:border-gold-400/40 transition-all duration-500 flex flex-col justify-between space-y-6 shadow-luxury group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="p-3 bg-noir-950 border border-white/10 text-gold-400 group-hover:text-gold-300 group-hover:border-gold-400/40 transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[9px] uppercase tracking-[0.25em] text-ivory-400/60 font-light">
                      0{idx + 1}
                    </span>
                  </div>

                  <div className="space-y-2 pt-2">
                    <span className="text-[9px] uppercase tracking-[0.28em] text-gold-400 font-light block">
                      {pillar.tag}
                    </span>
                    <h3 className="font-serif text-xl text-ivory-100 group-hover:text-gold-300 transition-colors">
                      {pillar.title}
                    </h3>
                  </div>

                  <p className="text-xs text-ivory-400 font-light leading-relaxed">
                    {pillar.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/5 text-[9px] uppercase tracking-[0.2em] text-gold-400/60">
                  Grasse Provenance
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
