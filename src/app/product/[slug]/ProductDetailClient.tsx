'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Check,
  ChevronRight,
  Plus,
  Minus,
  Sparkles,
  ShieldCheck,
  Truck,
  RotateCcw,
  Zap,
  Layers,
  Award,
} from 'lucide-react';
import { ProductData } from '@/types';
import { formatCurrency } from '@/lib/formatters';
import { useCart } from '@/context/CartContext';

interface ProductDetailClientProps {
  product: ProductData;
  related: ProductData[];
}

export default function ProductDetailClient({
  product,
  related,
}: ProductDetailClientProps) {
  const router = useRouter();
  const { addToCart } = useCart();

  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [selectedVolume, setSelectedVolume] = useState<'100ml' | '50ml'>('100ml');
  const [quantity, setQuantity] = useState(1);
  const [showAddedConfirmation, setShowAddedConfirmation] = useState(false);

  // Stock status evaluation
  const stockCount = product.stockQuantity ?? product.stock ?? 10;
  const isOutOfStock = stockCount <= 0 || product.status === 'ARCHIVED';

  // Dynamic pricing based on volume (50ml is 65% of 100ml)
  const basePrice = product.isSale && product.salePrice ? product.salePrice : product.price;
  const currentPrice = selectedVolume === '100ml' ? basePrice : Math.round(basePrice * 0.65);
  const regularPrice = selectedVolume === '100ml' ? product.price : Math.round(product.price * 0.65);
  const currentSize =
    selectedVolume === '100ml'
      ? product.size || '100 ml / 3.4 FL. OZ.'
      : '50 ml / 1.7 FL. OZ.';

  const images: string[] =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : ['https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1200'];

  const handleAddToCart = () => {
    if (isOutOfStock) return;

    addToCart({
      productId: product.id,
      productName: product.name,
      productImage: images[0],
      price: currentPrice,
      volume: currentSize,
      slug: product.slug,
      quantity,
    });

    // Show confirmation message without forcing customer to leave page
    setShowAddedConfirmation(true);
    setTimeout(() => {
      setShowAddedConfirmation(false);
    }, 4000);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;

    addToCart({
      productId: product.id,
      productName: product.name,
      productImage: images[0],
      price: currentPrice,
      volume: currentSize,
      slug: product.slug,
      quantity,
    });

    router.push('/checkout');
  };

  const topNotes =
    product.topNotes && product.topNotes.length > 0
      ? product.topNotes
      : ['Calabrian Bergamot', 'Cracked Cardamom'];
  const heartNotes =
    product.heartNotes && product.heartNotes.length > 0
      ? product.heartNotes
      : ['Taif Damask Rose', 'Smoked Birch Accord'];
  const baseNotes =
    product.baseNotes && product.baseNotes.length > 0
      ? product.baseNotes
      : ['Cambodian Agarwood (Oud)', 'Bourbon Vanilla Bean'];

  return (
    <div className="min-h-screen bg-noir-950 text-ivory-100 py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-24">
        {/* ============================================================ */}
        {/* BREADCRUMB NAVIGATION */}
        {/* ============================================================ */}
        <nav className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-ivory-400/70 select-none">
          <Link href="/" className="hover:text-gold-300 transition-colors">
            Maison
          </Link>
          <ChevronRight className="w-3 h-3 text-gold-dim" />
          <Link href="/shop" className="hover:text-gold-300 transition-colors">
            Shop
          </Link>
          {product.collection && (
            <>
              <ChevronRight className="w-3 h-3 text-gold-dim" />
              <Link
                href={`/collection/${product.collection.slug}`}
                className="hover:text-gold-300 transition-colors truncate max-w-[140px] sm:max-w-none"
              >
                {product.collection.name}
              </Link>
            </>
          )}
          <ChevronRight className="w-3 h-3 text-gold-dim" />
          <span className="text-gold-300 font-medium truncate">{product.name}</span>
        </nav>

        {/* ============================================================ */}
        {/* DESKTOP SPLIT: LEFT GALLERY | RIGHT PURCHASE DOSSIER */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* ---------------------------------------------------------- */}
          {/* LEFT: Large Product Image Gallery */}
          {/* ---------------------------------------------------------- */}
          <div className="lg:col-span-7 space-y-4">
            {/* Primary Large Image Stage */}
            <div className="relative aspect-[4/5] w-full bg-noir-900 border border-white/10 overflow-hidden shadow-2xl group">
              <Image
                src={images[selectedImageIdx] || images[0]}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 58vw"
                className="object-cover object-center brightness-[0.92] contrast-[1.05] transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-noir-950/40 via-transparent to-transparent pointer-events-none" />

              {/* Status Badges Overlay */}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10 pointer-events-none">
                {isOutOfStock ? (
                  <span className="px-3 py-1 bg-noir-950/90 border border-white/20 text-ivory-300 text-[9px] uppercase tracking-widest font-medium">
                    SOLD OUT
                  </span>
                ) : (product as any).newArrival ? (
                  <span className="px-3 py-1 bg-gold-400 text-noir-950 text-[9px] uppercase tracking-widest font-bold">
                    NEW
                  </span>
                ) : product.isFeatured ? (
                  <span className="px-3 py-1 bg-noir-950/85 backdrop-blur-md border border-gold-400/40 text-gold-300 text-[9px] uppercase tracking-widest font-light">
                    FEATURED
                  </span>
                ) : null}
              </div>
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIdx(idx)}
                    className={`relative w-20 sm:w-24 aspect-[4/5] bg-noir-900 border transition-all duration-300 overflow-hidden shrink-0 ${
                      selectedImageIdx === idx
                        ? 'border-gold-400 ring-1 ring-gold-400'
                        : 'border-white/10 opacity-60 hover:opacity-100'
                    }`}
                    aria-label={`View image ${idx + 1}`}
                  >
                    <Image src={img} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ---------------------------------------------------------- */}
          {/* RIGHT: Product Name, Description, Pricing & Purchase CTAs */}
          {/* ---------------------------------------------------------- */}
          <div className="lg:col-span-5 space-y-6">
            {/* Product Name & Short Character */}
            <div className="space-y-2 border-b border-white/10 pb-6">
              <span className="text-[10px] uppercase tracking-[0.3em] text-gold-400 font-light block">
                {product.olfactoryFamily || 'Extrait de Parfum &bull; 30%+ Oil'}
              </span>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-ivory-100 font-normal tracking-[0.03em]">
                {product.name}
              </h1>

              {/* Short Fragrance Description */}
              <p className="text-xs sm:text-sm text-ivory-300 font-light leading-relaxed pt-1">
                {product.shortDescription ||
                  product.subtitle ||
                  'A distinct composition created with depth, character and sovereign presence.'}
              </p>

              {/* Price */}
              <div className="pt-3 flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-serif text-ivory-100">
                  {formatCurrency(currentPrice)}
                </span>
                {product.isSale && product.salePrice && product.salePrice < product.price && (
                  <span className="text-sm text-ivory-400/50 line-through">
                    {formatCurrency(regularPrice)}
                  </span>
                )}
                <span className="text-[10px] uppercase tracking-widest text-gold-400/80 font-light ml-1">
                  Complimentary Courier Included
                </span>
              </div>
            </div>

            {/* Size Selector */}
            <div className="space-y-2.5">
              <span className="text-[10px] uppercase tracking-[0.25em] text-ivory-400 block">
                Size / Volume:
              </span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedVolume('100ml')}
                  className={`p-3 border text-left transition-all ${
                    selectedVolume === '100ml'
                      ? 'border-gold-400 bg-gold-400/10 text-gold-300'
                      : 'border-white/10 bg-noir-900/60 text-ivory-400 hover:border-white/20'
                  }`}
                >
                  <span className="block text-xs font-serif text-ivory-100">
                    {product.size || '100 ml / 3.4 FL. OZ.'}
                  </span>
                  <span className="block text-[9.5px] text-gold-400/80 uppercase tracking-wider mt-0.5">
                    Signature Flacon
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedVolume('50ml')}
                  className={`p-3 border text-left transition-all ${
                    selectedVolume === '50ml'
                      ? 'border-gold-400 bg-gold-400/10 text-gold-300'
                      : 'border-white/10 bg-noir-900/60 text-ivory-400 hover:border-white/20'
                  }`}
                >
                  <span className="block text-xs font-serif text-ivory-100">
                    50 ml / 1.7 FL. OZ.
                  </span>
                  <span className="block text-[9.5px] text-gold-400/80 uppercase tracking-wider mt-0.5">
                    Travel Flacon
                  </span>
                </button>
              </div>
            </div>

            {/* Availability / Stock Status */}
            <div className="space-y-2 py-1">
              <div className="text-xs flex items-center gap-2 select-none">
                {isOutOfStock ? (
                  <div className="flex items-center gap-2 text-red-400 font-medium">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="uppercase tracking-[0.2em] text-[10.5px]">SOLD OUT</span>
                  </div>
                ) : stockCount <= 5 ? (
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    <span className="text-amber-300 font-medium text-xs tracking-wider">
                      IN STOCK &bull; Only {stockCount} left
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-emerald-400 font-medium text-xs tracking-wider">
                      IN STOCK
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-[0.25em] text-ivory-400 block">
                Quantity:
              </span>
              <div className="flex items-center border border-white/15 bg-noir-900 w-36 px-3 py-1.5">
                <button
                  type="button"
                  disabled={isOutOfStock || quantity <= 1}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="text-ivory-400 hover:text-gold-300 p-1 disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="flex-1 text-center text-xs font-mono font-medium text-ivory-100">
                  {quantity}
                </span>
                <button
                  type="button"
                  disabled={isOutOfStock || quantity >= stockCount}
                  onClick={() => setQuantity(quantity + 1)}
                  className="text-ivory-400 hover:text-gold-300 p-1 disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Action CTAs */}
            <div className="space-y-3 pt-2">
              {/* PRIMARY CTA: ADD TO BAG */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="w-full flex items-center justify-center gap-3 bg-gold-400 hover:bg-gold-300 text-noir-950 py-4 px-8 text-xs uppercase tracking-[0.22em] font-semibold transition-all shadow-luxury hover:shadow-gold-subtle disabled:opacity-40 disabled:cursor-not-allowed btn-luxury"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>
                  {isOutOfStock ? 'SOLD OUT' : `ADD TO BAG • ${formatCurrency(currentPrice * quantity)}`}
                </span>
              </button>

              {/* SECONDARY CTA: BUY NOW */}
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="w-full flex items-center justify-center gap-2 border border-gold-400/80 hover:bg-gold-400 hover:text-noir-950 text-gold-300 py-3.5 px-8 text-xs uppercase tracking-[0.22em] font-medium transition-all shadow-gold-subtle disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>BUY NOW</span>
              </button>

              {/* Small Confirmation Message on Add to Cart */}
              {showAddedConfirmation && (
                <div className="p-3.5 bg-noir-900 border border-gold-400/60 text-gold-300 text-xs tracking-wider flex items-center justify-between animate-reveal-up shadow-lg">
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-gold-400" />
                    <span>Added to your bag.</span>
                  </div>
                  <Link
                    href="/checkout"
                    className="underline text-[11px] uppercase tracking-widest text-ivory-200 hover:text-gold-300"
                  >
                    View Bag
                  </Link>
                </div>
              )}
            </div>

            {/* Reassurance Features */}
            <div className="pt-4 border-t border-white/10 grid grid-cols-2 gap-3 text-xs text-ivory-400 font-light">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-gold-400 shrink-0" />
                <span>White-glove delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-gold-400 shrink-0" />
                <span>Two 2ml vials included</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-gold-400 shrink-0" />
                <span>UV-shielding obsidian</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-gold-400 shrink-0" />
                <span>30-day sealed returns</span>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* BELOW: CLEAN ORGANIZED SECTIONS / ACCORDIONS */}
        {/* ============================================================ */}
        <div className="border-t border-white/10 pt-16 space-y-16">
          {/* Section 1: ABOUT THE FRAGRANCE */}
          <div className="space-y-4 max-w-4xl">
            <span className="text-[10px] uppercase tracking-[0.35em] text-gold-400 font-light block">
              Inspiration &amp; Story
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif text-ivory-100 font-normal">
              ABOUT THE FRAGRANCE
            </h2>
            <p className="text-xs sm:text-sm text-ivory-300 font-light leading-relaxed tracking-wider">
              {product.description ||
                'Formulated without compromise, this extrait is an intimate work of high olfactory art. Sourced from rare seasonal harvests and aged for 180 days in temperature-shielded chambers in Grasse, it reveals a profound sillage that lingers in quiet remembrance.'}
            </p>
          </div>

          {/* Section 2: FRAGRANCE CHARACTER */}
          <div className="space-y-6 max-w-4xl border-t border-white/10 pt-12">
            <span className="text-[10px] uppercase tracking-[0.35em] text-gold-400 font-light block">
              Olfactory Identity
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif text-ivory-100 font-normal">
              FRAGRANCE CHARACTER
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              <div className="p-4 bg-noir-900/60 border border-white/10">
                <span className="text-[9px] uppercase tracking-widest text-ivory-400/70 block">
                  Family
                </span>
                <span className="text-xs sm:text-sm font-serif text-ivory-100 mt-1 block">
                  {product.olfactoryFamily || 'Woody Oriental'}
                </span>
              </div>

              <div className="p-4 bg-noir-900/60 border border-white/10">
                <span className="text-[9px] uppercase tracking-widest text-ivory-400/70 block">
                  Concentration
                </span>
                <span className="text-xs sm:text-sm font-serif text-ivory-100 mt-1 block">
                  {product.concentration || '30%+ Extrait'}
                </span>
              </div>

              <div className="p-4 bg-noir-900/60 border border-white/10">
                <span className="text-[9px] uppercase tracking-widest text-ivory-400/70 block">
                  Longevity
                </span>
                <span className="text-xs sm:text-sm font-serif text-ivory-100 mt-1 block">
                  {product.longevity || '14 - 18 Hours'}
                </span>
              </div>

              <div className="p-4 bg-noir-900/60 border border-white/10">
                <span className="text-[9px] uppercase tracking-widest text-ivory-400/70 block">
                  Sillage
                </span>
                <span className="text-xs sm:text-sm font-serif text-ivory-100 mt-1 block">
                  {product.sillage || 'Sovereign & Magnetic'}
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: TOP NOTES / HEART NOTES / BASE NOTES */}
          <div className="space-y-6 border-t border-white/10 pt-12">
            <span className="text-[10px] uppercase tracking-[0.35em] text-gold-400 font-light block">
              Olfactory Pyramid
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif text-ivory-100 font-normal">
              FRAGRANCE ACCORDS
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              {/* TOP NOTES */}
              <div className="p-6 bg-noir-900/60 border border-white/10 space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-[11px] uppercase tracking-[0.25em] text-gold-300 font-serif">
                    TOP NOTES
                  </span>
                  <span className="text-[9px] text-ivory-400/60">0 - 30 Mins</span>
                </div>
                <div className="space-y-1.5 pt-1">
                  {topNotes.map((note) => (
                    <span
                      key={note}
                      className="inline-block mr-2 mb-2 text-xs bg-noir-950 border border-gold-dim text-ivory-200 px-3 py-1"
                    >
                      {note}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-ivory-400 font-light leading-relaxed">
                  The initial luminous impression that greets the senses upon application.
                </p>
              </div>

              {/* HEART NOTES */}
              <div className="p-6 bg-noir-900/60 border border-gold-400/40 space-y-3 shadow-gold-subtle">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-[11px] uppercase tracking-[0.25em] text-gold-400 font-serif">
                    HEART NOTES
                  </span>
                  <span className="text-[9px] text-ivory-400/60">30 Mins - 4 Hours</span>
                </div>
                <div className="space-y-1.5 pt-1">
                  {heartNotes.map((note) => (
                    <span
                      key={note}
                      className="inline-block mr-2 mb-2 text-xs bg-noir-950 border border-gold-400/40 text-gold-300 px-3 py-1 font-medium"
                    >
                      {note}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-ivory-400 font-light leading-relaxed">
                  The emotional soul of the perfume, unfolding with deep floral and spice absolutes.
                </p>
              </div>

              {/* BASE NOTES */}
              <div className="p-6 bg-noir-900/60 border border-white/10 space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-[11px] uppercase tracking-[0.25em] text-gold-300 font-serif">
                    BASE NOTES
                  </span>
                  <span className="text-[9px] text-ivory-400/60">4 - 20+ Hours</span>
                </div>
                <div className="space-y-1.5 pt-1">
                  {baseNotes.map((note) => (
                    <span
                      key={note}
                      className="inline-block mr-2 mb-2 text-xs bg-noir-950 border border-gold-dim text-ivory-200 px-3 py-1"
                    >
                      {note}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-ivory-400 font-light leading-relaxed">
                  The enduring sovereign foundation that anchors itself to pulse points and memory.
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: PRODUCT DETAILS */}
          <div className="space-y-6 max-w-4xl border-t border-white/10 pt-12">
            <span className="text-[10px] uppercase tracking-[0.35em] text-gold-400 font-light block">
              Vessel &amp; Formulation
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif text-ivory-100 font-normal">
              PRODUCT DETAILS
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-noir-900/50 border border-white/10 space-y-1">
                <span className="text-[9.5px] uppercase tracking-widest text-gold-400 block">
                  Origin &amp; Distillation
                </span>
                <p className="text-ivory-300 font-light">
                  Compounded and aged in Grasse, France using natural harvest absolutes.
                </p>
              </div>

              <div className="p-4 bg-noir-900/50 border border-white/10 space-y-1">
                <span className="text-[9.5px] uppercase tracking-widest text-gold-400 block">
                  Flacon Craft
                </span>
                <p className="text-ivory-300 font-light">
                  Heavyweight French obsidian crystal glass engineered to block ultraviolet light.
                </p>
              </div>

              <div className="p-4 bg-noir-900/50 border border-white/10 space-y-1">
                <span className="text-[9.5px] uppercase tracking-widest text-gold-400 block">
                  Maceration Period
                </span>
                <p className="text-ivory-300 font-light">
                  Cold aged for 180 days in temperature-shielded chambers to coalesce accords.
                </p>
              </div>

              <div className="p-4 bg-noir-900/50 border border-white/10 space-y-1">
                <span className="text-[9.5px] uppercase tracking-widest text-gold-400 block">
                  Coffret Presentation
                </span>
                <p className="text-ivory-300 font-light">
                  Hand-numbered edition encased in a silk-lined noir presentation box.
                </p>
              </div>
            </div>
          </div>

          {/* Section 5: DELIVERY & RETURNS */}
          <div className="space-y-6 max-w-4xl border-t border-white/10 pt-12">
            <span className="text-[10px] uppercase tracking-[0.35em] text-gold-400 font-light block">
              White-Glove Standard
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif text-ivory-100 font-normal">
              DELIVERY &amp; RETURNS
            </h2>
            <div className="space-y-4 text-xs text-ivory-300 font-light leading-relaxed">
              <div className="flex items-start gap-3">
                <Truck className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                <p>
                  <strong className="text-ivory-100 font-medium">Complimentary Courier:</strong>{' '}
                  All orders are dispatched via insured white-glove private courier with full temperature monitoring.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                <p>
                  <strong className="text-ivory-100 font-medium">Try Before Opening:</strong>{' '}
                  Every numbered flacon arrives accompanied by two complimentary 2ml discovery vials. Test the sample vial on your skin first.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <RotateCcw className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                <p>
                  <strong className="text-ivory-100 font-medium">30-Day Returns:</strong>{' '}
                  If the fragrance does not suit you, return the sealed, unopened obsidian flacon within 30 days for a complete refund.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
