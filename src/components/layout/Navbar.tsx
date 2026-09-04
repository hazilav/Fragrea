'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Search, Heart, User, Menu, X, Calendar } from 'lucide-react';
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
    { label: 'ABOUT US', href: '/about', isActive: pathname === '/about' },
    { label: 'SERVICES', href: '/shipping', isActive: pathname === '/shipping' },
    { label: 'CONTACT', href: '/returns', isActive: pathname === '/returns' },
  ];

  return (
    <header
      className={`sticky top-0 z-50 backdrop-blur-xl transition-all duration-300 ease-out border-b ${
        isScrolled
          ? 'bg-noir-950/85 border-white/10 shadow-2xl shadow-black/80'
          : 'bg-noir-950/40 border-white/5'
      }`}
      style={{
        WebkitBackdropFilter: 'blur(20px)',
        backdropFilter: 'blur(20px)',
        WebkitBackfaceVisibility: 'hidden',
        backfaceVisibility: 'hidden',
        transform: 'translateZ(0)',
      }}
    >
      {/* ============================================================ */}
      {/* 1. TOP UTILITY BAR (As seen in the luxury reference image) */}
      {/* LEFT: EXCLUSIVE COLLECTION + TIMELESS ELEGANCE */}
      {/* RIGHT: [ BOOK APPOINTMENT ] | Search | Wishlist | Bag */}
      {/* ============================================================ */}
      <div className="border-b border-white/5 bg-black/20 hidden sm:block">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-2.5 flex items-center justify-between text-xs">
          {/* Top Left Tagline */}
          <div className="flex items-center gap-2 select-none">
            <span className="text-[10px] sm:text-[10.5px] uppercase tracking-[0.35em] text-gold-300/90 font-light font-sans">
              EXCLUSIVE COLLECTION + TIMELESS ELEGANCE
            </span>
          </div>

          {/* Top Right Actions: Book Appointment + Icons */}
          <div className="flex items-center gap-5 sm:gap-6">
            {/* Book Appointment CTA Button */}
            <Link
              href="/about"
              className="inline-flex items-center gap-1.5 text-[10px] sm:text-[10.5px] uppercase tracking-[0.22em] text-ivory-200 hover:text-gold-300 border border-white/20 hover:border-gold-400/80 px-4 py-1.5 transition-all duration-300 font-sans font-medium hover:bg-gold-400/5 select-none"
            >
              <span>BOOK APPOINTMENT</span>
            </Link>

            {/* Quick Action Line Icons */}
            <div className="flex items-center gap-4 text-ivory-200">
              {/* Search */}
              <Link
                href="/discover"
                className="hover:text-gold-300 transition-colors p-1"
                aria-label="Search Collection"
                title="Search"
              >
                <Search className="w-4 h-4" strokeWidth={1.3} />
              </Link>

              {/* Wishlist / Favorites */}
              <Link
                href="/shop"
                className="hover:text-gold-300 transition-colors p-1"
                aria-label="Wishlist & Favorites"
                title="Wishlist"
              >
                <Heart className="w-4 h-4" strokeWidth={1.3} />
              </Link>

              {/* Shopping Bag */}
              <Link
                href="/cart"
                className="hover:text-gold-300 transition-colors p-1 relative"
                aria-label="Shopping Bag"
                title="Shopping Bag"
              >
                <ShoppingBag className="w-4 h-4" strokeWidth={1.3} />
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-gold-400 text-noir-950 text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. MAIN NAVIGATION HEADER */}
      {/* LEFT: Fragrea Logo + Tagline PERFUMES */}
      {/* CENTER / RIGHT: HOME | SHOP | COLLECTIONS | ABOUT US | SERVICES | CONTACT */}
      {/* ============================================================ */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-3.5 sm:py-4">
        {/* DESKTOP (lg and up) */}
        <div className="hidden lg:flex items-center justify-between">
          {/* LEFT: FRAGREA Logo */}
          <Link
            href="/"
            className="inline-block group py-1 select-none"
            aria-label="FRAGREA Home"
          >
            <div className="flex flex-col items-start">
              <div className="relative w-36 sm:w-44 h-8 sm:h-9">
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

          {/* RIGHT: Navigation Links */}
          <nav
            className="flex items-center gap-7 xl:gap-9 select-none"
            aria-label="Main Navigation"
          >
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`relative text-[11px] tracking-[0.22em] uppercase py-1 transition-colors duration-300 font-sans ${
                  link.isActive
                    ? 'text-gold-300 font-semibold'
                    : 'text-ivory-200/90 hover:text-gold-300 font-medium'
                }`}
              >
                <span>{link.label}</span>
                <span
                  className={`absolute bottom-0 left-0 h-[1px] bg-gold-400 transition-all duration-300 ease-out ${
                    link.isActive ? 'w-full' : 'w-0 hover:w-full'
                  }`}
                />
              </Link>
            ))}

            {/* Account Icon */}
            <Link
              href="/account"
              className="ml-2 text-ivory-200 hover:text-gold-300 transition-colors p-1"
              aria-label="Account"
              title="Account"
            >
              <User className="w-4 h-4" strokeWidth={1.3} />
            </Link>
          </nav>
        </div>

        {/* MOBILE (lg:hidden) */}
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

          {/* Right: Search, Wishlist & Bag Icons */}
          <div className="flex items-center gap-1.5 -mr-2">
            <Link
              href="/discover"
              className="text-ivory-200 p-2 hover:text-gold-300 transition-colors"
              aria-label="Search"
            >
              <Search className="w-4 h-4" strokeWidth={1.25} />
            </Link>

            <Link
              href="/shop"
              className="text-ivory-200 p-2 hover:text-gold-300 transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="w-4 h-4" strokeWidth={1.25} />
            </Link>

            <Link
              href="/cart"
              className="text-ivory-100 p-2 hover:text-gold-300 transition-colors relative"
              aria-label="Shopping Bag"
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
          <div className="text-[10px] uppercase tracking-[0.3em] text-gold-400 font-light pb-2 border-b border-white/5">
            EXCLUSIVE COLLECTION + TIMELESS ELEGANCE
          </div>

          <nav className="flex flex-col gap-3 text-xs uppercase tracking-[0.25em]">
            {navLinks.map((link) => (
              <Link
                key={`mobile-${link.label}`}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`py-2 border-b border-white/5 transition-colors font-medium flex items-center justify-between ${
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

            {/* Book Appointment Mobile CTA */}
            <Link
              href="/about"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-gold-300 hover:text-gold-200 py-3 border border-gold-400/40 text-center tracking-[0.25em] font-medium mt-2 bg-gold-400/10"
            >
              BOOK APPOINTMENT
            </Link>

            {/* Account Quick Link */}
            <Link
              href="/account"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-ivory-200 hover:text-gold-300 py-2.5 border-b border-white/5 transition-colors font-medium flex items-center gap-2.5"
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
