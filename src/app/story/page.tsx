import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Droplets, ShieldCheck, Flame, Sparkles } from 'lucide-react';

export const metadata = {
  title: 'Our Story & Heritage | FRAGREA Haute Parfumerie',
  description:
    'Discover the philosophy, craftsmanship, and artisanal cold extraction rituals of FRAGREA Haute Parfumerie.',
};

export default function StoryPage() {
  return (
    <div className="min-h-screen bg-noir-950 text-ivory-100 py-16 animate-fade-in">
      <div className="max-w-5xl mx-auto px-6 space-y-24">
        {/* Editorial Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto pt-6">
          <span className="text-[10px] uppercase tracking-[0.35em] text-gold-400 font-medium">
            Maison Monograph
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif text-ivory-100 font-normal leading-tight">
            The Architecture <br />
            <span className="italic text-gold-300 font-light">of Liquid Sovereignty</span>
          </h1>
          <div className="w-16 h-px bg-gold-400/50 mx-auto" />
          <p className="text-xs sm:text-sm text-ivory-300 font-light leading-relaxed">
            FRAGREA was founded not to replicate fleeting fashion trends, but to restore the sacred ritual
            of haute parfumerie: raw natural extractions, uncompromising cold maturation, and sovereign presence.
          </p>
        </div>

        {/* Hero Visual */}
        <div className="relative aspect-[16/9] w-full bg-noir-900 border border-gold-dim overflow-hidden shadow-luxury">
          <Image
            src="https://images.unsplash.com/photo-1563178406-4cdc2923acbc?q=80&w=1600&auto=format&fit=crop"
            alt="The FRAGREA Grasse Distillation Laboratory"
            fill
            priority
            className="object-cover brightness-[0.45] contrast-[1.1]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-noir-950 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6 max-w-md">
            <span className="text-[10px] uppercase tracking-widest text-gold-400 font-medium block">
              Grasse Laboratory, France
            </span>
            <p className="font-serif text-base text-ivory-100 italic">
              Where precious natural distillations mature in silence for six lunar cycles.
            </p>
          </div>
        </div>

        {/* 3 House Pillars */}
        <div id="craft" className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 bg-noir-900 border border-white/5 space-y-4 hover:border-gold-dim transition-colors">
            <div className="w-10 h-10 rounded-full border border-gold-400/30 flex items-center justify-center text-gold-400">
              <Droplets className="w-5 h-5" />
            </div>
            <span className="text-2xl font-serif text-gold-400 font-light block">01</span>
            <h3 className="font-serif text-xl text-ivory-100">Unadulterated Extrait</h3>
            <p className="text-xs text-ivory-400 font-light leading-relaxed">
              While mass market formulas calibrate perfume oil at 12% to 15%, FRAGREA creates exclusively in Extrait de Parfum potencies—never below 28% and reaching up to 34% pure essential oils.
            </p>
          </div>

          <div className="p-8 bg-noir-900 border border-gold-dim space-y-4 shadow-amber-glow">
            <div className="w-10 h-10 rounded-full border border-gold-400/30 flex items-center justify-center text-gold-300">
              <Flame className="w-5 h-5" />
            </div>
            <span className="text-2xl font-serif text-gold-300 font-light block">02</span>
            <h3 className="font-serif text-xl text-ivory-100">180-Day Cold Maceration</h3>
            <p className="text-xs text-ivory-400 font-light leading-relaxed">
              We never apply artificial heating to accelerate distillation. Each batch undergoes a strict 180-day cold rest in sealed stainless steel chambers to allow volatile and heavy chords to naturally fuse.
            </p>
          </div>

          <div className="p-8 bg-noir-900 border border-white/5 space-y-4 hover:border-gold-dim transition-colors">
            <div className="w-10 h-10 rounded-full border border-gold-400/30 flex items-center justify-center text-gold-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-2xl font-serif text-gold-400 font-light block">03</span>
            <h3 className="font-serif text-xl text-ivory-100">Obsidian Glass Flacons</h3>
            <p className="text-xs text-ivory-400 font-light leading-relaxed">
              Light degrades delicate raw botanicals. Our heavy black flacons block 100% of ambient ultraviolet radiation, preserving the sovereign formula for decades on your vanity.
            </p>
          </div>
        </div>

        {/* Narrative Split */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center border-t border-white/10 pt-16">
          <div className="space-y-4">
            <span className="text-[10px] uppercase tracking-[0.3em] text-gold-400 font-medium">
              Sourcing & Harvest
            </span>
            <h2 className="text-3xl font-serif text-ivory-100 leading-snug">
              Botanical Sovereignty & Rare Distillations
            </h2>
            <p className="text-xs sm:text-sm text-ivory-300 font-light leading-relaxed">
              Our perfumers travel across ancient fragrance trade routes. We secure aged wild Cambodian agarwood
              from Koh Kong, high-elevation mountain Damask roses from Saudi Arabia, three-year cured Florentine
              iris pallida butter, and natural oceanic ambergris.
            </p>
            <p className="text-xs sm:text-sm text-ivory-300 font-light leading-relaxed">
              Every bottle is hand-poured, hand-inspected, and individually numbered before departing our Grasse workshop.
            </p>
          </div>

          <div className="relative aspect-[4/5] bg-noir-900 border border-gold-dim overflow-hidden shadow-luxury">
            <Image
              src="https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=1200&auto=format&fit=crop"
              alt="Artisanal perfume glass flacon"
              fill
              className="object-cover brightness-[0.55]"
            />
          </div>
        </div>

        {/* Fragrance Layering Guide */}
        <div id="layering" className="border-t border-gold-dim pt-16 space-y-10">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-[10px] uppercase tracking-[0.3em] text-gold-400 font-medium">
              Connoisseur Ritual
            </span>
            <h2 className="text-3xl font-serif text-ivory-100">
              The Art of Layering
            </h2>
            <p className="text-xs text-ivory-400 font-light">
              Create an unforgettable bespoke sillage by pairing complementary creations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 bg-espresso-950/70 border border-white/5 space-y-3">
              <span className="text-xs uppercase tracking-widest text-gold-400 block font-medium">
                The Shadowed Velvet Accord
              </span>
              <h4 className="font-serif text-lg text-ivory-100">
                Oud Nocturne + Rose Velours
              </h4>
              <p className="text-xs text-ivory-300 font-light leading-relaxed">
                Apply one pulse of Oud Nocturne to the collarbone, followed immediately by two light sprays of Rose Velours on wrists. The dark agarwood provides a smoldering anchor upon which crimson rose petals and soft Tuscan suede float with intoxicating mystery.
              </p>
            </div>

            <div className="p-8 bg-espresso-950/70 border border-white/5 space-y-3">
              <span className="text-xs uppercase tracking-widest text-gold-400 block font-medium">
                The Molten Majesty Accord
              </span>
              <h4 className="font-serif text-lg text-ivory-100">
                Santal Impérial + Ambre Céleste
              </h4>
              <p className="text-xs text-ivory-300 font-light leading-relaxed">
                The creamy sacred Mysore sandalwood of Santal Impérial tempers the golden resin and honey of Ambre Céleste, resulting in an aristocratic warmth that commands reverence without shouting.
              </p>
            </div>
          </div>
        </div>

        {/* Closing CTA */}
        <div className="text-center border-t border-white/10 pt-16 space-y-6">
          <h3 className="font-serif text-3xl text-ivory-100">
            Select Your Signature Extrait
          </h3>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-gold-400 hover:bg-gold-300 text-noir-950 px-8 py-4 text-xs uppercase tracking-widest font-medium transition-colors shadow-luxury btn-luxury"
          >
            <span>Explore The Complete Archive</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
