'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, ArrowRight, RotateCcw, ShoppingBag } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { useCart } from '@/context/CartContext';

interface Recommendation {
  slug: string;
  name: string;
  subtitle: string;
  price: number;
  image: string;
  family: string;
  reason: string;
}

export default function ScentFinderQuiz() {
  const { addToCart } = useCart();
  const [step, setStep] = useState(1);
  const [mood, setMood] = useState<string>('');
  const [occasion, setOccasion] = useState<string>('');
  const [character, setCharacter] = useState<string>('');

  const calculateRecommendation = (): Recommendation => {
    if (mood === 'nocturnal' || character === 'smoky') {
      return {
        slug: 'oud-nocturne',
        name: 'Oud Nocturne',
        subtitle: 'Shadowed Cambodian Agarwood & Smoked Incense',
        price: 340,
        image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=800',
        family: 'Woody Oriental',
        reason: 'Your preference for nocturnal mystery and smoldering presence makes this aged agarwood composition your ideal sovereign signature.',
      };
    } else if (mood === 'warm' || character === 'amber') {
      return {
        slug: 'ambre-celeste',
        name: 'Ambre Céleste',
        subtitle: 'Golden Moroccan Labdanum & Royal Benzoin',
        price: 260,
        image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=800',
        family: 'Warm Amber',
        reason: 'Your taste for molten warmth, royal benzoin, and golden hours captured in crystal harmonizes perfectly with Ambre Céleste.',
      };
    } else if (mood === 'floral' || character === 'velvet') {
      return {
        slug: 'rose-velours',
        name: 'Rose Velours',
        subtitle: 'Midnight Damask Rose, Suede & Black Pepper',
        price: 310,
        image: 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?q=80&w=800',
        family: 'Dark Floral',
        reason: 'A velvet crimson rose infused with coffee and Tuscan suede satisfies your desire for intoxicating floral couture.',
      };
    } else {
      return {
        slug: 'santal-imperial',
        name: 'Santal Impérial',
        subtitle: 'Sacred Mysore Sandalwood & Creamy Cashmeran',
        price: 320,
        image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=800',
        family: 'Woody Creamy',
        reason: 'Understated aristocratic luxury and creamy cardamom depth whisper quiet authority in any room you enter.',
      };
    }
  };

  const handleReset = () => {
    setStep(1);
    setMood('');
    setOccasion('');
    setCharacter('');
  };

  const rec = calculateRecommendation();

  return (
    <section className="py-24 bg-noir-950 border-b border-gold-dim">
      <div className="max-w-4xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 text-gold-400 text-[10px] uppercase tracking-[0.3em]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Signature Scent Discovery</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif text-ivory-100 font-normal">
            Find Your Maison Signature
          </h2>
          <p className="text-xs text-ivory-400 font-light max-w-md mx-auto">
            Answer three brief questions to unveil the creation engineered for your skin chemistry and aesthetic presence.
          </p>
        </div>

        {/* Quiz Container */}
        <div className="bg-noir-900 border border-gold-dim p-8 md:p-12 shadow-luxury relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-60 h-60 bg-gold-400/5 rounded-full blur-3xl pointer-events-none" />

          {step === 1 && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-widest text-gold-400">Question 01 of 03</span>
                <h3 className="text-xl font-serif text-ivory-100">
                  What atmospheric aura do you wish to project?
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { id: 'nocturnal', label: 'Nocturnal & Enigmatic', desc: 'Smoldering incense, aged oud, shadowy presence' },
                  { id: 'aristocratic', label: 'Aristocratic & Quiet Luxury', desc: 'Creamy Mysore sandalwood, crisp cardamom' },
                  { id: 'warm', label: 'Molten & Luminous Amber', desc: 'Golden resins, honeyed benzoin, solar warmth' },
                  { id: 'floral', label: 'Dark Velvet & Sensual', desc: 'Midnight Damask rose, soft Tuscan suede' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setMood(opt.id);
                      setStep(2);
                    }}
                    className="text-left p-5 bg-noir-950 border border-white/10 hover:border-gold-400 hover:bg-gold-400/5 transition-all group"
                  >
                    <span className="block text-sm font-serif text-ivory-200 group-hover:text-gold-300">
                      {opt.label}
                    </span>
                    <span className="block text-xs text-ivory-400 font-light mt-1">
                      {opt.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-widest text-gold-400">Question 02 of 03</span>
                <h3 className="text-xl font-serif text-ivory-100">
                  In what setting will this extrait command the space?
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { id: 'evening', label: 'Midnight Galas & Private Lounges', desc: 'Hours between dusk and dawn' },
                  { id: 'daily', label: 'Everyday Signature of Power', desc: 'Boardrooms, galleries, and daytime meetings' },
                  { id: 'intimate', label: 'Intimate Closures & Cloistered Chambers', desc: 'Subtle, skin-to-skin whispers' },
                  { id: 'special', label: 'Ceremonial & Rare Occasions', desc: 'When an unforgettable memory is forged' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setOccasion(opt.id);
                      setStep(3);
                    }}
                    className="text-left p-5 bg-noir-950 border border-white/10 hover:border-gold-400 hover:bg-gold-400/5 transition-all group"
                  >
                    <span className="block text-sm font-serif text-ivory-200 group-hover:text-gold-300">
                      {opt.label}
                    </span>
                    <span className="block text-xs text-ivory-400 font-light mt-1">
                      {opt.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-widest text-gold-400">Question 03 of 03</span>
                <h3 className="text-xl font-serif text-ivory-100">
                  Which botanical base accord resonates most deeply?
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { id: 'smoky', label: 'Smoked Woods & Agarwood', desc: 'Heavy density, resins, birch tar' },
                  { id: 'creamy', label: 'Sandalwood & White Cashmere', desc: 'Smooth, silken, powdery depth' },
                  { id: 'amber', label: 'Ambergris, Vanilla & Labdanum', desc: 'Golden balsamic radiant warmth' },
                  { id: 'velvet', label: 'Leather, Suede & Dark Florals', desc: 'Seductive tactile elegance' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setCharacter(opt.id);
                      setStep(4);
                    }}
                    className="text-left p-5 bg-noir-950 border border-white/10 hover:border-gold-400 hover:bg-gold-400/5 transition-all group"
                  >
                    <span className="block text-sm font-serif text-ivory-200 group-hover:text-gold-300">
                      {opt.label}
                    </span>
                    <span className="block text-xs text-ivory-400 font-light mt-1">
                      {opt.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-8 animate-in zoom-in-95 duration-500">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-gold-400 font-medium">
                    The Curators&apos; Verdict
                  </span>
                  <h3 className="text-2xl font-serif text-ivory-100">Your Signature Flacon</h3>
                </div>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 text-xs text-ivory-400 hover:text-gold-300 transition-colors uppercase tracking-wider"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restart</span>
                </button>
              </div>

              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="relative w-48 h-60 bg-noir-950 border border-gold-dim shrink-0 overflow-hidden">
                  <Image
                    src={rec.image}
                    alt={rec.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-noir-950/80 to-transparent" />
                </div>

                <div className="flex-1 space-y-4 text-left">
                  <span className="text-[10px] uppercase tracking-widest text-gold-400 block">
                    {rec.family} &bull; Extrait de Parfum
                  </span>
                  <h4 className="text-3xl font-serif text-ivory-100">{rec.name}</h4>
                  <p className="text-xs text-gold-300 italic">{rec.subtitle}</p>
                  <p className="text-xs text-ivory-300 font-light leading-relaxed">
                    {rec.reason}
                  </p>
                  <div className="font-serif text-xl text-ivory-100">
                    {formatCurrency(rec.price)}
                  </div>

                  <div className="pt-2 flex flex-wrap gap-4">
                    <Link
                      href={`/product/${rec.slug}`}
                      className="inline-flex items-center gap-2 bg-gold-400 hover:bg-gold-300 text-noir-950 px-6 py-3 text-xs uppercase tracking-widest font-medium transition-colors"
                    >
                      <span>Inspect Creation</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      onClick={() =>
                        addToCart({
                          productId: rec.slug,
                          productName: rec.name,
                          productImage: rec.image,
                          price: rec.price,
                          volume: '100 ml / 3.4 FL. OZ.',
                          slug: rec.slug,
                          quantity: 1,
                        })
                      }
                      className="inline-flex items-center gap-2 border border-gold-400/50 hover:bg-gold-400/10 text-ivory-100 px-6 py-3 text-xs uppercase tracking-widest font-medium transition-colors"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-gold-400" />
                      <span>Reserve Flacon</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
