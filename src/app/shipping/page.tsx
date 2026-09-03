import React from 'react';
import Link from 'next/link';
import { Truck, ArrowLeft, ShieldCheck, Clock } from 'lucide-react';

export const metadata = {
  title: 'Reliable Delivery | FRAGREA Haute Parfumerie',
  description: 'Carefully packed and delivered to your door. Learn about Fragrea shipping, handling and white-glove courier dispatch.',
};

export default function ShippingPage() {
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
            Service & Logistics
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif text-ivory-100 font-normal tracking-[0.04em]">
            Reliable Delivery
          </h1>
          <div className="w-12 h-px bg-gold-400/40" />
          <p className="font-serif italic text-base sm:text-lg text-ivory-300 font-light">
            &ldquo;Carefully packed and delivered to your door.&rdquo;
          </p>
        </div>

        {/* Content Dossier */}
        <div className="bg-noir-900/70 border border-white/10 p-8 sm:p-10 shadow-luxury space-y-8 text-xs sm:text-sm text-ivory-300 font-light leading-relaxed font-sans">
          <div className="space-y-3">
            <h2 className="text-xs sm:text-sm uppercase tracking-[0.25em] text-gold-400 font-medium font-sans">
              Protective Packaging
            </h2>
            <p>
              Each Fragrea creation is housed in our custom UV-protective obsidian glass flacon, surrounded by custom shock-absorbing molded casing to protect delicate botanical oils during transit.
            </p>
          </div>

          <div className="space-y-3 pt-6 border-t border-white/5">
            <h2 className="text-xs sm:text-sm uppercase tracking-[0.25em] text-gold-400 font-medium font-sans">
              Courier Delivery
            </h2>
            <p>
              Orders are dispatched via reputable express couriers. Once your commission is fulfilled at our atelier, you will receive real-time courier tracking credentials via email.
            </p>
          </div>

          <div className="space-y-3 pt-6 border-t border-white/5">
            <h2 className="text-xs sm:text-sm uppercase tracking-[0.25em] text-gold-400 font-medium font-sans">
              Delivery Notifications &amp; Tracking
            </h2>
            <p>
              You can track your order status directly in your{' '}
              <Link href="/orders" className="text-gold-300 underline underline-offset-4 hover:text-gold-200">
                Order Tracking Area
              </Link>{' '}
              from confirmation to final doorstep delivery.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="text-center pt-4">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-gold-400 hover:bg-gold-300 text-noir-950 px-8 py-3.5 text-xs uppercase tracking-[0.24em] font-medium transition-colors shadow-luxury"
          >
            <span>Explore The Collection</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
