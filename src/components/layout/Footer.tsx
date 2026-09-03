'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Package, Sparkles, Shield, CheckCircle2 } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-espresso-950 text-ivory-200 border-t border-gold-dim">
      {/* 3 Maison Service Guarantees */}
      <div className="border-b border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4 p-4">
            <div className="w-12 h-12 rounded-full border border-gold-400/30 flex items-center justify-center text-gold-400 shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-widest text-ivory-100 font-medium mb-1">
                White-Glove Delivery
              </h4>
              <p className="text-xs text-ivory-400 leading-relaxed font-light">
                Complimentary climate-controlled courier with signature required on every bottle.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-4 p-4">
            <div className="w-12 h-12 rounded-full border border-gold-400/30 flex items-center justify-center text-gold-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-widest text-ivory-100 font-medium mb-1">
                The Discovery Ritual
              </h4>
              <p className="text-xs text-ivory-400 leading-relaxed font-light">
                Two complimentary 2ml extrait samples accompany each creation for testing on skin.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-4 p-4">
            <div className="w-12 h-12 rounded-full border border-gold-400/30 flex items-center justify-center text-gold-400 shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-widest text-ivory-100 font-medium mb-1">
                Certified Provenance
              </h4>
              <p className="text-xs text-ivory-400 leading-relaxed font-light">
                Hand-numbered certificate of authenticity sealed with the Maison seal.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Story */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-5 gap-12">
        {/* Brand Column */}
        <div className="md:col-span-2 space-y-4">
          <Link href="/" className="inline-block group" aria-label="FRAGREA Home">
            <div className="relative w-44 h-10">
              <Image
                src="/images/logo/fragrea-logo-white.png"
                alt="FRAGREA"
                fill
                sizes="176px"
                className="object-contain object-left transition-opacity duration-300 group-hover:opacity-90"
              />
            </div>
            <span className="text-[8.5px] tracking-[0.45em] uppercase text-gold-400 font-light mt-1 block font-sans">
              PERFUMES
            </span>
          </Link>
          <p className="text-xs text-ivory-400 leading-relaxed max-w-sm font-light font-sans">
            Founded in the pursuit of liquid sovereignty. Rare wild agarwood, royal resins,
            and nocturnal botanicals bottled in UV-protective obsidian glass.
          </p>
          <div className="pt-1 text-[11px] text-ivory-500 tracking-wider font-sans">
            18 Rue de la Paix, 75002 Paris &bull; 740 Madison Avenue, New York
          </div>
        </div>

        {/* Collections */}
        <div>
          <h5 className="text-[11px] uppercase tracking-widest text-gold-400 font-semibold mb-5">
            The Collections
          </h5>
          <ul className="space-y-3 text-xs font-light text-ivory-300">
            <li>
              <Link href="/collections" className="hover:text-gold-300 transition-colors font-medium text-gold-300">
                All Anthologies &rarr;
              </Link>
            </li>
            <li>
              <Link href="/collection/the-nocturne-series" className="hover:text-gold-300 transition-colors">
                The Nocturne Series
              </Link>
            </li>
            <li>
              <Link href="/collection/private-reserve" className="hover:text-gold-300 transition-colors">
                Private Reserve
              </Link>
            </li>
            <li>
              <Link href="/collection/lor-dorient" className="hover:text-gold-300 transition-colors">
                L&apos;Or d&apos;Orient
              </Link>
            </li>
            <li>
              <Link href="/shop" className="hover:text-gold-300 transition-colors">
                All Extraits Archive
              </Link>
            </li>
          </ul>
        </div>

        {/* The House & Services */}
        <div>
          <h5 className="text-[11px] uppercase tracking-widest text-gold-400 font-semibold mb-5">
            The Maison
          </h5>
          <ul className="space-y-3 text-xs font-light text-ivory-300">
            <li>
              <Link href="/about" className="hover:text-gold-300 transition-colors">
                Our Story &amp; Heritage
              </Link>
            </li>
            <li>
              <Link href="/discover" className="hover:text-gold-300 transition-colors">
                Notes Index &amp; Discovery
              </Link>
            </li>
            <li>
              <Link href="/orders" className="hover:text-gold-300 transition-colors">
                Track Your Order
              </Link>
            </li>
            <li>
              <Link href="/account" className="hover:text-gold-300 transition-colors">
                Patron Account Portal
              </Link>
            </li>
          </ul>
        </div>

        {/* Private Register */}
        <div>
          <h5 className="text-[11px] uppercase tracking-widest text-gold-400 font-semibold mb-5">
            The Inner Circle
          </h5>
          <p className="text-xs text-ivory-400 mb-4 font-light leading-relaxed">
            Receive private allocations, invitation-only harvest releases, and olfactory essays.
          </p>

          {subscribed ? (
            <div className="flex items-center gap-2 text-gold-300 text-xs py-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>You are inscribed in our register.</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="space-y-2">
              <input
                type="email"
                required
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-noir-900 border border-white/10 text-xs px-3 py-2.5 text-ivory-100 placeholder:text-ivory-500 focus:outline-none focus:border-gold-400"
              />
              <button
                type="submit"
                className="w-full bg-gold-400 hover:bg-gold-300 text-noir-950 text-[11px] uppercase tracking-widest py-2.5 font-medium transition-colors btn-luxury"
              >
                Request Invitation
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-white/5 py-8 px-6 text-center text-[10px] text-ivory-500 uppercase tracking-widest font-sans">
        &copy; {new Date().getFullYear()} FRAGREA Perfumes. All Rights Reserved. Crafted for Connoisseurs.
      </div>
    </footer>
  );
}
