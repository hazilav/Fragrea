'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatCurrency } from '@/lib/formatters';

export default function CartDrawer() {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    subtotal,
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Dark backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Right-Side Slide-In Cart Drawer */}
      <div className="relative w-full max-w-md bg-noir-950 border-l border-white/10 text-ivory-100 h-full flex flex-col shadow-2xl z-10 animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-sm font-serif tracking-[0.25em] uppercase text-ivory-100">
              Your Shopping Bag
            </h2>
            <span className="text-[10px] uppercase tracking-widest text-gold-400">
              {items.length} {items.length === 1 ? 'Flacon' : 'Flacons'}
            </span>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="text-ivory-400 hover:text-ivory-100 p-2 transition-colors"
            aria-label="Close Shopping Bag"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Items List */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="text-center py-24 space-y-4">
              <div className="w-16 h-16 rounded-full border border-white/10 mx-auto flex items-center justify-center text-ivory-500">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <h3 className="font-serif text-lg text-ivory-200">Your bag is empty</h3>
              <p className="text-xs text-ivory-400 max-w-xs mx-auto leading-relaxed font-light">
                Explore the Fragrea collection and select your signature fragrance.
              </p>
              <div className="pt-4">
                <Link
                  href="/shop"
                  onClick={() => setIsCartOpen(false)}
                  className="inline-block text-xs uppercase tracking-widest bg-gold-400 hover:bg-gold-300 text-noir-950 px-6 py-3 font-medium transition-colors"
                >
                  Shop Fragrances
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6 divide-y divide-white/5">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.volume}`}
                  className="pt-6 first:pt-0 flex gap-4 items-start"
                >
                  {/* Product Image */}
                  <div className="relative w-20 h-24 bg-noir-900 border border-white/10 shrink-0 overflow-hidden">
                    <Image
                      src={
                        item.productImage ||
                        'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1200'
                      }
                      alt={item.productName}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 flex flex-col justify-between h-24">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        {/* Product Name */}
                        <Link
                          href={`/products/${item.slug}`}
                          onClick={() => setIsCartOpen(false)}
                          className="font-serif text-base text-ivory-100 hover:text-gold-300 transition-colors truncate"
                        >
                          {item.productName}
                        </Link>

                        {/* Remove */}
                        <button
                          onClick={() => removeFromCart(item.productId, item.volume)}
                          className="text-ivory-500 hover:text-red-400 transition-colors p-1"
                          aria-label={`Remove ${item.productName} from bag`}
                          title="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Size */}
                      <p className="text-[10px] uppercase tracking-widest text-gold-400 font-light mt-0.5">
                        {item.volume || '100ML'}
                      </p>
                    </div>

                    {/* Quantity Selector & Price */}
                    <div className="flex items-center justify-between">
                      {/* Quantity Selector */}
                      <div className="flex items-center border border-white/15 bg-noir-900">
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.volume, item.quantity - 1)
                          }
                          className="p-1.5 text-ivory-400 hover:text-gold-300 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs text-ivory-100 font-mono font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.volume, item.quantity + 1)
                          }
                          className="p-1.5 text-ivory-400 hover:text-gold-300 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Price */}
                      <span className="text-sm font-serif text-ivory-100">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-white/10 bg-noir-950 space-y-4">
            {/* SUBTOTAL */}
            <div className="flex justify-between items-center text-sm font-serif border-b border-white/5 pb-3">
              <span className="text-xs uppercase tracking-[0.2em] text-ivory-300 font-sans">
                SUBTOTAL
              </span>
              <span className="text-lg text-ivory-100 font-medium">
                {formatCurrency(subtotal)}
              </span>
            </div>

            {/* Action Buttons: VIEW BAG & CHECKOUT */}
            <div className="space-y-2.5 pt-1">
              <Link
                href="/checkout"
                onClick={() => setIsCartOpen(false)}
                className="w-full flex items-center justify-center gap-2 bg-gold-400 hover:bg-gold-300 text-noir-950 text-xs uppercase tracking-[0.22em] py-4 font-semibold transition-all shadow-luxury btn-luxury"
              >
                <span>CHECKOUT</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/cart"
                onClick={() => setIsCartOpen(false)}
                className="w-full flex items-center justify-center gap-2 border border-white/20 hover:border-gold-400 text-ivory-200 hover:text-gold-300 text-xs uppercase tracking-[0.22em] py-3 font-medium transition-colors"
              >
                <span>VIEW BAG</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
