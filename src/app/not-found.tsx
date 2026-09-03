import React from 'react';
import Link from 'next/link';
import { Compass, ArrowLeft, Search, Sparkles } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] bg-noir-950 text-ivory-100 flex items-center justify-center px-6 py-24">
      <div className="max-w-xl w-full text-center space-y-8 animate-fade-in">
        {/* Maison Crest */}
        <div className="space-y-3">
          <div className="w-16 h-16 mx-auto rounded-full border border-gold-dim flex items-center justify-center text-gold-400 bg-espresso-950/60 shadow-amber-glow">
            <Compass className="w-7 h-7 stroke-[1.5] animate-spin-slow" />
          </div>
          <span className="text-[10px] uppercase tracking-[0.4em] text-gold-400 font-medium block">
            404 &bull; Olfactory Note Unfound
          </span>
          <h1 className="text-4xl sm:text-5xl font-serif text-ivory-100 font-normal">
            Flacon Not In Vault
          </h1>
          <p className="text-xs sm:text-sm text-ivory-400 font-light leading-relaxed max-w-md mx-auto">
            The vintage extrait you seek does not exist in the Maison register or has been permanently retired to our private formulation archives.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/shop"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gold-400 hover:bg-gold-300 text-noir-950 px-8 py-3.5 text-xs uppercase tracking-widest font-semibold transition-colors shadow-luxury btn-luxury"
          >
            <Sparkles className="w-4 h-4" />
            <span>Discover The Vault</span>
          </Link>

          <Link
            href="/search"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-white/15 hover:border-gold-400 text-ivory-200 hover:text-gold-300 px-8 py-3.5 text-xs uppercase tracking-widest font-light transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search Catalog</span>
          </Link>
        </div>

        {/* Maison Heritage Footnote */}
        <div className="pt-8 border-t border-white/5">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-wider text-ivory-500 hover:text-gold-400 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to FRAGREA Homepage</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
