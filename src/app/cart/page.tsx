'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Trash2,
  Plus,
  Minus,
  Gift,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
  ArrowLeft,
  Tag,
  AlertCircle,
  Check,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatCurrency } from '@/lib/formatters';

const SAMPLE_OPTIONS = [
  'Oud Nocturne (2ml Vial)',
  'Santal Impérial (2ml Vial)',
  'Ambre Céleste (2ml Vial)',
  'Rose Velours (2ml Vial)',
  'Cuir Tabac (2ml Vial)',
  'Abrar (2ml Vial)',
];

export default function FullCartPage() {
  const {
    items,
    removeFromCart,
    updateQuantity,
    subtotal,
    shipping,
    tax,
    total,
    warnings,
    clearWarnings,
    isValidating,
    giftWrap,
    setGiftWrap,
    selectedSamples,
    toggleSample,
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState<{
    code: string;
    discountType: string;
    discountValue: number;
    amount: number;
  } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [checkingCoupon, setCheckingCoupon] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setCheckingCoupon(true);
    setCouponError('');

    try {
      const res = await fetch(`/api/coupons?code=${encodeURIComponent(couponCode.trim().toUpperCase())}`);
      const data = await res.json();

      if (data.success && data.coupon) {
        const c = data.coupon;
        if (c.minOrderAmount && subtotal < c.minOrderAmount) {
          setCouponError(`Minimum order amount of ${formatCurrency(c.minOrderAmount)} required.`);
          return;
        }

        const discountAmount =
          c.discountType === 'PERCENTAGE'
            ? Math.round((subtotal * c.discountValue) / 100)
            : Math.min(c.discountValue, subtotal);

        setCouponApplied({
          code: c.code,
          discountType: c.discountType,
          discountValue: c.discountValue,
          amount: discountAmount,
        });
        setCouponCode('');
      } else {
        setCouponError(data.error || 'Invalid or expired promotional privilege.');
      }
    } catch (err: any) {
      setCouponError(err.message || 'Error validating code.');
    } finally {
      setCheckingCoupon(false);
    }
  };

  const finalDiscount = couponApplied ? couponApplied.amount : 0;
  const finalTotal = Math.max(0, (total || subtotal + shipping + tax) - finalDiscount);

  return (
    <div className="min-h-screen bg-noir-950 text-ivory-100 py-12 px-6">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Page Header */}
        <div className="border-b border-white/10 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase tracking-[0.35em] text-gold-400 font-medium block">
              Maison Bag &bull; Cellar Allocations
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-ivory-100 mt-1">
              Your Flacon Selection
            </h1>
            <p className="text-xs text-ivory-400 font-light mt-1">
              Review your reserved extraits before white-glove packaging and insured dispatch.
            </p>
          </div>

          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-ivory-400 hover:text-gold-300 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Continue Discovering</span>
          </Link>
        </div>

        {/* Server Validation Warnings Banner */}
        {warnings.length > 0 && (
          <div className="p-4 bg-amber-950/80 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-between animate-fade-in rounded-sm">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <span className="font-semibold block uppercase tracking-wider text-[10px] text-amber-400">
                  Inventory Notice
                </span>
                <span className="text-xs">{warnings.join(' ')}</span>
              </div>
            </div>
            <button onClick={clearWarnings} className="text-amber-400 hover:text-amber-100 p-1">
              Dismiss
            </button>
          </div>
        )}

        {items.length === 0 ? (
          /* Empty Bag State */
          <div className="py-24 text-center space-y-6 max-w-md mx-auto border border-white/5 bg-noir-900/60 p-8 rounded-sm">
            <div className="w-16 h-16 rounded-full border border-gold-dim mx-auto flex items-center justify-center text-gold-400 bg-espresso-950/60">
              <Sparkles className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-serif text-ivory-100">Your Bag is Empty</h2>
              <p className="text-xs text-ivory-400 font-light leading-relaxed">
                Explore our catalog of hand-macerated extraits de parfum, bottled at 30% oil concentration in Grasse.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 bg-gold-400 hover:bg-gold-300 text-noir-950 px-8 py-3.5 text-xs uppercase tracking-widest font-semibold transition-colors shadow-luxury btn-luxury"
              >
                <span>SHOP NOW</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          /* Populated Cart Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Column: Line Items Table & Extras */}
            <div className="lg:col-span-8 space-y-8">
              {/* Products Table */}
              <div className="bg-noir-900 border border-white/10 rounded-sm overflow-hidden shadow-luxury">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-white/10 bg-noir-950 text-ivory-400 uppercase tracking-widest text-[10px]">
                        <th className="py-4 px-6">Flacon Extrait</th>
                        <th className="py-4 px-4">Price</th>
                        <th className="py-4 px-4 text-center">Quantity</th>
                        <th className="py-4 px-4 text-right">Subtotal</th>
                        <th className="py-4 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {items.map((item) => (
                        <tr key={`${item.productId}-${item.volume}`} className="hover:bg-white/5 transition-colors">
                          {/* Product Image & Title */}
                          <td className="py-5 px-6">
                            <div className="flex items-center gap-4">
                              <div className="relative w-16 h-20 bg-noir-850 border border-white/10 shrink-0 overflow-hidden rounded-sm">
                                {item.productImage ? (
                                  <Image
                                    src={item.productImage}
                                    alt={item.productName}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-xs text-ivory-500">
                                    FRG
                                  </div>
                                )}
                              </div>
                              <div>
                                <Link
                                  href={`/products/${item.slug}`}
                                  className="font-serif text-sm text-ivory-100 hover:text-gold-300 font-medium transition-colors block"
                                >
                                  {item.productName}
                                </Link>
                                <span className="text-[10px] uppercase tracking-widest text-gold-400 block mt-0.5">
                                  {item.volume}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Unit Price */}
                          <td className="py-5 px-4 font-serif text-sm text-ivory-200">
                            {formatCurrency(item.price)}
                          </td>

                          {/* Quantity Stepper */}
                          <td className="py-5 px-4 text-center">
                            <div className="inline-flex items-center border border-white/15 bg-noir-950 rounded-sm">
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(item.productId, item.volume, item.quantity - 1)
                                }
                                className="p-2 text-ivory-400 hover:text-gold-300 transition-colors"
                                title="Decrease Quantity"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-8 text-center text-xs text-ivory-100 font-medium font-mono">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(item.productId, item.volume, item.quantity + 1)
                                }
                                className="p-2 text-ivory-400 hover:text-gold-300 transition-colors"
                                title="Increase Quantity"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </td>

                          {/* Line Total */}
                          <td className="py-5 px-4 text-right font-serif text-sm text-gold-300 font-medium">
                            {formatCurrency(item.price * item.quantity)}
                          </td>

                          {/* Remove button */}
                          <td className="py-5 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.productId, item.volume)}
                              className="text-ivory-500 hover:text-red-400 p-2 transition-colors"
                              title="Remove Flacon"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Complimentary Samples Selection */}
              <div className="p-6 bg-noir-900 border border-white/10 rounded-sm space-y-4 shadow-luxury">
                <div className="flex items-center gap-2 text-gold-400 text-xs tracking-wider uppercase font-semibold">
                  <Sparkles className="w-4 h-4" />
                  <span>Choose Two Complimentary 2ml Travel Extraits</span>
                </div>
                <p className="text-xs text-ivory-400 font-light leading-relaxed">
                  Every flacon order is accompanied by two 2ml travel extraits in gold-embossed glass vials. Select your preference:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {SAMPLE_OPTIONS.map((sample) => {
                    const isSelected = selectedSamples.includes(sample);
                    return (
                      <label
                        key={sample}
                        onClick={() => toggleSample(sample)}
                        className={`flex items-center gap-3 p-3 text-xs border rounded-sm transition-all cursor-pointer ${
                          isSelected
                            ? 'border-gold-400 bg-gold-400/10 text-gold-200'
                            : 'border-white/5 bg-noir-950 text-ivory-400 hover:border-white/20'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          readOnly
                          className="accent-gold-400 w-4 h-4"
                        />
                        <span className="font-light">{sample}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Luxury Gift Packaging Option */}
              <div className="p-6 bg-noir-900 border border-white/10 rounded-sm flex items-center justify-between gap-4 shadow-luxury">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full border border-gold-dim flex items-center justify-center text-gold-400 bg-espresso-950/60 shrink-0">
                    <Gift className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-wider text-ivory-100 font-serif block">
                      Maison Noir Luxury Gift Presentation
                    </span>
                    <span className="text-[11px] text-ivory-400 font-light block mt-0.5">
                      Hand-tied black grosgrain ribbon, wax seal crest &amp; blank handwritten note card.
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={giftWrap}
                  onChange={(e) => setGiftWrap(e.target.checked)}
                  className="accent-gold-400 w-5 h-5 cursor-pointer shrink-0"
                />
              </div>
            </div>

            {/* Right Column: Order Summary Card */}
            <div className="lg:col-span-4 space-y-6">
              <div className="p-6 bg-noir-900 border border-gold-dim rounded-sm shadow-luxury space-y-6">
                <h3 className="font-serif text-lg tracking-wider text-ivory-100 uppercase border-b border-white/10 pb-3">
                  Summary of Allocations
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between text-ivory-300">
                    <span>Subtotal</span>
                    <span className="font-serif text-sm text-ivory-100">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>

                  <div className="flex justify-between text-ivory-300">
                    <span>White-Glove Shipping</span>
                    <span className="text-gold-400 uppercase tracking-wider text-[11px]">
                      {shipping === 0 ? 'Complimentary' : formatCurrency(shipping)}
                    </span>
                  </div>

                  <div className="flex justify-between text-ivory-300">
                    <span>Estimated Luxury Duty &amp; Tax</span>
                    <span className="text-ivory-200">{formatCurrency(tax)}</span>
                  </div>

                  {couponApplied && (
                    <div className="flex justify-between text-emerald-400 pt-1 border-t border-white/5">
                      <span>Privilege Code ({couponApplied.code})</span>
                      <span>-{formatCurrency(couponApplied.amount)}</span>
                    </div>
                  )}

                  <div className="border-t border-white/10 pt-4 flex justify-between items-baseline text-ivory-100">
                    <span className="font-serif text-base">Total Due</span>
                    <span className="font-serif text-2xl text-gold-300 font-medium">
                      {formatCurrency(finalTotal)}
                    </span>
                  </div>
                </div>

                {/* Promotional Privilege Code Entry */}
                <form onSubmit={handleApplyCoupon} className="space-y-2 pt-2 border-t border-white/10">
                  <label className="text-[10px] uppercase tracking-widest text-ivory-400 block font-medium">
                    Have a Privilege Code?
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. MAISON10"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="w-full bg-noir-950 border border-white/10 px-3 py-2 text-xs text-ivory-100 font-mono placeholder:text-ivory-500 focus:outline-none focus:border-gold-400"
                    />
                    <button
                      type="submit"
                      disabled={checkingCoupon || !couponCode.trim()}
                      className="px-4 py-2 bg-noir-850 border border-gold-dim hover:bg-gold-400 hover:text-noir-950 text-gold-300 text-xs uppercase tracking-wider transition-colors disabled:opacity-40"
                    >
                      {checkingCoupon ? '...' : 'Apply'}
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-[11px] text-red-400 font-light">{couponError}</p>
                  )}
                  {couponApplied && (
                    <p className="text-[11px] text-emerald-400 font-light flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      Privilege code applied successfully.
                    </p>
                  )}
                </form>

                {/* Checkout CTA */}
                <div className="space-y-3 pt-2">
                  <Link
                    href="/checkout"
                    className="w-full flex items-center justify-center gap-2 bg-gold-400 hover:bg-gold-300 text-noir-950 py-4 px-6 text-xs uppercase tracking-[0.22em] font-semibold transition-colors shadow-luxury btn-luxury group"
                  >
                    <span>CHECKOUT</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <div className="space-y-2 pt-4 border-t border-white/5 text-[11px] text-ivory-400 font-light">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                      <span>End-to-End SSL Encrypted &amp; Fraud Protected</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Truck className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                      <span>Complimentary insured courier on orders over $250</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
