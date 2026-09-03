'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Search, User, Menu, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function Navbar() {
  const pathname = usePathname();
  const { totalItems } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { label: 'HOME', href: '/', isActive: pathname === '/' },
    { label: 'SHOP', href: '/shop', isActive: pathname === '/shop' },
    {
      label: 'COLLECTIONS',
      href: '/collections',
      isActive: pathname.startsWith('/collection'),
    },
    { label: 'ABOUT', href: '/about', isActive: pathname === '/about' },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ease-out ${
        isScrolled
          ? 'bg-noir-950/98 backdrop-blur-md border-b border-white/10 shadow-2xl shadow-black/80 py-4'
          : 'bg-noir-950/35 backdrop-blur-sm border-b border-white/5 py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* ============================================================ */}
        {/* DESKTOP HEADER (lg and up) */}
        {/* LEFT: FRAGREA logo image + tagline PERFUMES */}
        {/* CENTER: HOME | SHOP | COLLECTIONS | ABOUT */}
        {/* RIGHT: Search icon | Account icon | Bag icon (NO TEXT LABELS) */}
        {/* ============================================================ */}
        <div className="hidden lg:flex items-center justify-between">
          {/* LEFT: FRAGREA Logo */}
          <div className="flex-1 flex items-center justify-start">
            <Link
              href="/"
              className="inline-block group py-1 select-none"
              aria-label="FRAGREA Home"
            >
              <div className="flex flex-col items-start">
                <div className="relative w-36 sm:w-44 h-8 sm:h-10">
                  <Image
                    src="/images/logo/fragrea-logo-white.png"
                    alt="FRAGREA"
                    fill
                    priority
                    sizes="(max-width: 640px) 144px, 176px"
                    className="object-contain object-left transition-opacity duration-300 group-hover:opacity-90"
                  />
                </div>
                <span className="text-[7.5px] sm:text-[8px] uppercase tracking-[0.45em] text-gold-400/90 font-light mt-1 group-hover:text-gold-300 transition-colors duration-300 font-sans">
                  PERFUMES
                </span>
              </div>
            </Link>
          </div>

          {/* CENTER: HOME | SHOP | COLLECTIONS | ABOUT */}
          <nav
            className="flex items-center gap-8 xl:gap-12 select-none"
            aria-label="Main Navigation"
          >
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`relative text-[11px] font-medium tracking-[0.25em] uppercase py-1 transition-colors duration-300 font-sans group ${
                  link.isActive
                    ? 'text-gold-300 font-semibold'
                    : 'text-ivory-200 hover:text-gold-300'
                }`}
              >
                <span>{link.label}</span>
                <span
                  className={`absolute bottom-0 left-0 h-[1px] bg-gold-400 transition-all duration-300 ease-out ${
                    link.isActive ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}
                />
              </Link>
            ))}
          </nav>

          {/* RIGHT: Search icon | Account/Profile icon | Bag icon */}
          <div className="flex-1 flex items-center justify-end gap-5 xl:gap-6 select-none">
            {/* 1. SEARCH ICON ONLY */}
            <Link
              href="/discover"
              className="p-2 text-ivory-200 hover:text-gold-300 transition-colors duration-300"
              aria-label="Search Fragrance Catalog"
              title="Search"
            >
              <Search className="w-[18px] h-[18px]" strokeWidth={1.25} />
            </Link>

            {/* 2. ACCOUNT / PROFILE ICON ONLY */}
            <Link
              href="/account"
              className="p-2 text-ivory-200 hover:text-gold-300 transition-colors duration-300"
              aria-label="Patron Account Portal"
              title="Account"
            >
              <User className="w-[18px] h-[18px]" strokeWidth={1.25} />
            </Link>

            {/* 3. BAG ICON ONLY */}
            <Link
              href="/cart"
              className="p-2 text-ivory-100 hover:text-gold-300 transition-colors duration-300 relative"
              aria-label="Shopping Bag"
              title="Bag"
            >
              <div className="relative">
                <ShoppingBag className="w-[18px] h-[18px]" strokeWidth={1.25} />
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-gold-400 text-noir-950 text-[8.5px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-md">
                    {totalItems}
                  </span>
                )}
              </div>
            </Link>
          </div>
        </div>

        {/* ============================================================ */}
        {/* MOBILE HEADER (lg:hidden) */}
        {/* Left: Menu icon | Center: FRAGREA logo + PERFUMES | Right: Search, Account & Bag icons */}
        {/* ============================================================ */}
        <div className="flex lg:hidden items-center justify-between">
          {/* Left: Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-ivory-100 p-2 -ml-2 hover:text-gold-300 transition-colors"
            aria-label={isMobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" strokeWidth={1.25} /> : <Menu className="w-5 h-5" strokeWidth={1.25} />}
          </button>

          {/* Center: FRAGREA Logo */}
          <div className="text-center">
            <Link
              href="/"
              className="inline-block py-1"
              aria-label="FRAGREA Home"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="flex flex-col items-center">
                <div className="relative w-28 h-7">
                  <Image
                    src="/images/logo/fragrea-logo-white.png"
                    alt="FRAGREA"
                    fill
                    priority
                    sizes="112px"
                    className="object-contain object-center"
                  />
                </div>
                <span className="text-[6.5px] uppercase tracking-[0.45em] text-gold-400/90 font-light mt-0.5 font-sans">
                  PERFUMES
                </span>
              </div>
            </Link>
          </div>

          {/* Right: Search, Account & Bag Icons (No text labels) */}
          <div className="flex items-center gap-2 -mr-2">
            {/* Search Icon */}
            <Link
              href="/discover"
              className="text-ivory-200 p-2 hover:text-gold-300 transition-colors"
              aria-label="Search Catalog"
              title="Search"
            >
              <Search className="w-4 h-4" strokeWidth={1.25} />
            </Link>

            {/* Account Icon */}
            <Link
              href="/account"
              className="text-ivory-200 p-2 hover:text-gold-300 transition-colors"
              aria-label="Patron Account"
              title="Account"
            >
              <User className="w-4 h-4" strokeWidth={1.25} />
            </Link>

            {/* Bag Icon */}
            <Link
              href="/cart"
              className="text-ivory-100 p-2 hover:text-gold-300 transition-colors relative"
              aria-label="Shopping Bag"
              title="Bag"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4" strokeWidth={1.25} />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1.5 bg-gold-400 text-noir-950 text-[8px] font-bold w-3 h-3 rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MOBILE NAVIGATION DRAWER */}
      {/* ============================================================ */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-noir-950/98 backdrop-blur-2xl px-8 py-8 flex flex-col gap-6 animate-in slide-in-from-top-4 duration-300 shadow-2xl font-sans">
          <nav className="flex flex-col gap-4 text-xs uppercase tracking-[0.25em]">
            {navLinks.map((link) => (
              <Link
                key={`mobile-${link.label}`}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`py-2.5 border-b border-white/5 transition-colors font-medium flex items-center justify-between ${
                  link.isActive
                    ? 'text-gold-300 font-semibold'
                    : 'text-ivory-100 hover:text-gold-300'
                }`}
              >
                <span>{link.label}</span>
                {link.isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-gold-400" />
                )}
              </Link>
            ))}

            {/* Account Quick Link */}
            <Link
              href="/account"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-ivory-200 hover:text-gold-300 py-2.5 border-b border-white/5 transition-colors font-medium flex items-center gap-2.5 pt-4"
            >
              <User className="w-4 h-4 text-gold-400" strokeWidth={1.25} />
              <span>Patron Portal</span>
            </Link>

            {/* Shopping Bag Quick Link */}
            <Link
              href="/cart"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-gold-300 hover:text-gold-200 py-2.5 flex items-center justify-between font-medium"
            >
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-4 h-4 text-gold-400" strokeWidth={1.25} />
                <span>Shopping Bag</span>
              </div>
              {totalItems > 0 && (
                <span className="text-[10px] font-mono bg-gold-400 text-noir-950 px-2 py-0.5 rounded-full font-bold">
                  {totalItems}
                </span>
              )}
            </Link>
          </nav>

          <div className="pt-4 border-t border-white/10 text-[10px] text-ivory-400/60 tracking-wider">
            FRAGREA PERFUMES &bull; Grasse &bull; Paris
          </div>
        </div>
      )}
    </header>
  );
}
