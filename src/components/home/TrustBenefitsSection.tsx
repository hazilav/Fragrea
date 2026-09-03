'use client';

import React from 'react';
import Link from 'next/link';
import { LucideIcon, Truck, RotateCcw, ShieldCheck, PackageCheck } from 'lucide-react';

interface BenefitItem {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  href?: string;
}

const BENEFITS: BenefitItem[] = [
  {
    id: 'delivery',
    title: 'Reliable Delivery',
    description: 'Carefully packed and delivered to your door.',
    icon: Truck,
    href: '/shipping',
  },
  {
    id: 'returns',
    title: 'Simple Returns',
    description: 'Shop with confidence with our easy return process.',
    icon: RotateCcw,
    href: '/returns',
  },
  {
    id: 'security',
    title: 'Safe & Secure Payment',
    description: 'Your checkout is protected with secure payment processing.',
    icon: ShieldCheck,
    // Secure Checkout does not need a page link
  },
  {
    id: 'tracking',
    title: 'Track Your Order',
    description: 'Stay updated from order confirmation to delivery.',
    icon: PackageCheck,
    href: '/orders',
  },
];

export default function TrustBenefitsSection() {
  return (
    <section
      aria-label="Maison Trust & Service Standards"
      className="py-14 sm:py-16 md:py-20 px-6 sm:px-8 bg-noir-950 border-b border-white/5 relative select-none"
    >
      <div className="max-w-7xl mx-auto">
        {/* ============================================================ */}
        {/* 4 EQUAL COLUMNS ON DESKTOP, 2x2 ON TABLET & MOBILE */}
        {/* ============================================================ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-6 sm:gap-x-10 lg:gap-x-12">
          {BENEFITS.map((item) => {
            const Icon = item.icon;

            const content = (
              <div className="group flex flex-col items-center text-center space-y-3 sm:space-y-3.5 transition-all duration-300 cursor-pointer">
                {/* Minimal line-style icon with subtle hover lift */}
                <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-ivory-300 group-hover:text-gold-300 transition-all duration-300">
                  <Icon
                    className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 group-hover:-translate-y-0.5"
                    strokeWidth={1.25}
                  />
                </div>

                {/* Typography: Small, medium-weight uppercase Montserrat */}
                <div className="space-y-1.5 max-w-[220px]">
                  <h3 className="text-[11.5px] sm:text-xs uppercase tracking-[0.22em] font-medium font-sans text-ivory-100 group-hover:text-gold-300 transition-colors duration-300">
                    {item.title}
                  </h3>
                  {/* Smaller, lighter-weight Montserrat */}
                  <p className="text-[10.5px] sm:text-xs text-ivory-400 font-light font-sans leading-relaxed tracking-wide group-hover:text-ivory-200 transition-colors duration-300">
                    {item.description}
                  </p>
                </div>
              </div>
            );

            if (item.href) {
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className="focus:outline-none focus-visible:ring-1 focus-visible:ring-gold-400"
                  aria-label={`${item.title} - ${item.description}`}
                >
                  {content}
                </Link>
              );
            }

            return (
              <div key={item.id} className="cursor-default">
                {content}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
