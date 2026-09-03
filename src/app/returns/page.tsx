import React from 'react';
import Link from 'next/link';
import { RotateCcw, ArrowLeft, CheckCircle2, Shield } from 'lucide-react';

export const metadata = {
  title: 'Simple Returns | FRAGREA Haute Parfumerie',
  description: 'Shop with confidence with our easy return process. Fragrea client returns policy and procedure.',
};

export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-noir-950 text-ivory-100 py-20 px-6 sm:px-8 animate-fade-in">
      <div className="max-w-3xl mx-auto space-y-12">
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-ivory-400 hover:text-gold-300 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Maison</span>
          </Link>
        </div>

        {/* Header */}
        <div className="space-y-4">
          <span className="text-[10.5px] uppercase tracking-[0.4em] text-gold-400 font-light block">
            Client Confidence
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif text-ivory-100 font-normal tracking-[0.04em]">
            Simple Returns
          </h1>
          <div className="w-12 h-px bg-gold-400/40" />
          <p className="font-serif italic text-base sm:text-lg text-ivory-300 font-light">
            &ldquo;Shop with confidence with our easy return process.&rdquo;
          </p>
        </div>

        {/* Content Dossier */}
        <div className="bg-noir-900/70 border border-white/10 p-8 sm:p-10 shadow-luxury space-y-8 text-xs sm:text-sm text-ivory-300 font-light leading-relaxed font-sans">
          <div className="space-y-3">
            <h2 className="text-xs sm:text-sm uppercase tracking-[0.25em] text-gold-400 font-medium font-sans">
              Our Scent Assurance
            </h2>
            <p>
              We want you to explore your new fragrance with peace of mind. We recommend testing your creation using the accompanying discovery vial before unsealing the main obsidian flacon box.
            </p>
          </div>

          <div className="space-y-3 pt-6 border-t border-white/5">
            <h2 className="text-xs sm:text-sm uppercase tracking-[0.25em] text-gold-400 font-medium font-sans">
              14-Day Return Window
            </h2>
            <p>
              Unopened flacons in their original cellophane packaging and intact seal may be returned within 14 days of delivery.
            </p>
          </div>

          <div className="space-y-3 pt-6 border-t border-white/5">
            <h2 className="text-xs sm:text-sm uppercase tracking-[0.25em] text-gold-400 font-medium font-sans">
              Initiating a Return
            </h2>
            <p>
              To initiate a return or exchange, navigate to your{' '}
              <Link href="/orders" className="text-gold-300 underline underline-offset-4 hover:text-gold-200">
                Order Area
              </Link>{' '}
              or contact our concierge with your order number. Our team will guide you through the simple return process.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="text-center pt-4">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-gold-400 hover:bg-gold-300 text-noir-950 px-8 py-3.5 text-xs uppercase tracking-[0.24em] font-medium transition-colors shadow-luxury"
          >
            <span>Return to Shop</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
