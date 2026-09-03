import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Droplets, ShieldCheck, Flame } from 'lucide-react';

export default function ArtisanalCraftSection() {
  return (
    <section className="py-24 bg-espresso-950/90 border-t border-gold-dim">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Visual Column */}
        <div className="relative">
          <div className="relative aspect-[4/5] w-full bg-noir-950 border border-gold-dim overflow-hidden shadow-luxury">
            <Image
              src="https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1200&auto=format&fit=crop"
              alt="Artisanal perfume craftsmanship"
              fill
              className="object-cover brightness-[0.55] contrast-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-noir-950/90 via-transparent to-transparent" />
          </div>

          {/* Floating Luxury Detail Card */}
          <div className="absolute -bottom-8 -right-4 sm:right-6 bg-noir-900/95 border border-gold-400/30 p-6 backdrop-blur-md max-w-xs shadow-luxury space-y-2">
            <span className="text-[9px] uppercase tracking-widest text-gold-400 font-semibold block">
              Maison Standard
            </span>
            <p className="font-serif text-sm text-ivory-100 italic leading-snug">
              &ldquo;We do not bottle until the molecular harmony has matured for six moons in darkness.&rdquo;
            </p>
            <span className="text-[10px] text-ivory-400 font-light block">
              &mdash; Master Nez, Grasse Laboratory
            </span>
          </div>
        </div>

        {/* Text Narrative Column */}
        <div className="space-y-8">
          <div className="space-y-3">
            <span className="text-[10px] uppercase tracking-[0.3em] text-gold-400 font-medium">
              The Alchemy of Time
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-ivory-100 font-normal leading-tight">
              Artisanal Distillation <br />
              <span className="italic text-gold-300 font-light">& The Cold Maceration Ritual</span>
            </h2>
            <div className="w-16 h-px bg-gold-400/50" />
          </div>

          <p className="text-xs sm:text-sm text-ivory-300 font-light leading-relaxed">
            In an era of rushed synthetic formulas, FRAGREA remains dedicated to the slow arts of haute parfumerie.
            Our master distillers source rare wild-harvested agarwood from Cambodia, high-elevation Damask roses from
            Taif, and three-year aged rhizomes of Florentine iris pallida.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
            <div className="space-y-2 border-l border-gold-400/30 pl-4">
              <div className="flex items-center gap-2 text-gold-400 text-xs font-serif">
                <Droplets className="w-4 h-4" />
                <span>Extrait Potency</span>
              </div>
              <p className="text-xs text-ivory-400 font-light leading-relaxed">
                Concentrations ranging between 28% to 34% pure perfume oil for unprecedented sillage.
              </p>
            </div>

            <div className="space-y-2 border-l border-gold-400/30 pl-4">
              <div className="flex items-center gap-2 text-gold-400 text-xs font-serif">
                <Flame className="w-4 h-4" />
                <span>Obsidian Flacons</span>
              </div>
              <p className="text-xs text-ivory-400 font-light leading-relaxed">
                Heavy, UV-blocking black crystal with precision magnetic caps to protect fragile botanicals from light degradation.
              </p>
            </div>
          </div>

          <div className="pt-4">
            <Link
              href="/about"
              className="inline-flex items-center gap-3 text-xs uppercase tracking-widest text-gold-400 hover:text-gold-200 font-medium transition-colors group"
            >
              <span>Read The Maison Monograph</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
