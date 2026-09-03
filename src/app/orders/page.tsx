'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Package, Search, Truck, Eye, ArrowRight, Sparkles, CheckCircle2, Shield } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/formatters';

export default function OrdersPage() {
  const router = useRouter();
  const [lookupOrderNumber, setLookupOrderNumber] = useState('');
  const [lookupEmail, setLookupEmail] = useState('');
  const [lookupError, setLookupError] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);

  const [customerOrders, setCustomerOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    async function loadAccountOrders() {
      setLoadingOrders(true);
      try {
        const res = await fetch('/api/account/orders');
        if (res.status === 200) {
          const data = await res.json();
          if (data.success && data.orders) {
            setCustomerOrders(data.orders);
            setIsAuthenticated(true);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingOrders(false);
      }
    }
    loadAccountOrders();
  }, []);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupOrderNumber.trim()) return;

    setLookupLoading(true);
    setLookupError('');

    try {
      const orderNum = lookupOrderNumber.trim().toUpperCase();
      // Test if order exists via public order confirmation or account route
      const res = await fetch(`/api/orders?search=${encodeURIComponent(orderNum)}`);
      // Or route directly to /orders/[id] where SSR fetches the order
      router.push(`/orders/${orderNum}`);
    } catch (err: any) {
      setLookupError('Order could not be located in our records. Please verify the order number.');
    } finally {
      setLookupLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-noir-950 text-ivory-100 py-16 px-6 sm:px-8 animate-fade-in">
      <div className="max-w-5xl mx-auto space-y-16">
        {/* Header Banner */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="text-[10px] uppercase tracking-[0.4em] text-gold-400 font-light block">
            Maison Vault &bull; Consignment Logistics
          </span>
          <h1 className="text-4xl sm:text-5xl font-serif text-ivory-100 font-normal tracking-[0.04em]">
            Track Your Order
          </h1>
          <div className="w-12 h-px bg-gold-400/40 mx-auto" />
          <p className="text-xs sm:text-sm text-ivory-300 font-light leading-relaxed tracking-wider">
            Monitor the hand-preparation, climate-controlled vault dispatch, and white-glove courier transit of your flacon allocations.
          </p>
        </div>

        {/* Quick Order Lookup Form */}
        <div className="bg-noir-900/80 border border-white/10 p-6 sm:p-8 shadow-luxury max-w-2xl mx-auto space-y-6">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <Search className="w-5 h-5 text-gold-400" />
            <h2 className="font-serif text-lg text-ivory-100 uppercase tracking-wider">
              Single Order Lookup
            </h2>
          </div>

          <form onSubmit={handleLookup} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] text-ivory-400 mb-1.5">
                Order Certificate Number *
              </label>
              <input
                type="text"
                required
                value={lookupOrderNumber}
                onChange={(e) => setLookupOrderNumber(e.target.value)}
                placeholder="e.g. FRG-2026-3773"
                className="w-full bg-noir-950 border border-white/15 px-4 py-3 text-xs text-ivory-100 font-mono focus:outline-none focus:border-gold-400 placeholder:text-ivory-600"
              />
            </div>

            {lookupError && (
              <p className="text-xs text-red-400 font-light">{lookupError}</p>
            )}

            <button
              type="submit"
              disabled={lookupLoading || !lookupOrderNumber.trim()}
              className="w-full bg-gold-400 hover:bg-gold-300 text-noir-950 py-3.5 px-6 text-xs uppercase tracking-[0.22em] font-semibold transition-all shadow-luxury btn-luxury disabled:opacity-50"
            >
              {lookupLoading ? 'Locating Commission...' : 'TRACK ORDER'}
            </button>
          </form>
        </div>

        {/* Authenticated Patron Orders Hub */}
        {isAuthenticated && customerOrders.length > 0 && (
          <div className="space-y-6 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl text-ivory-100">Your Recent Commissions</h2>
                <p className="text-xs text-ivory-400 font-light mt-0.5">
                  Orders linked to your authenticated patron profile.
                </p>
              </div>
              <Link
                href="/account"
                className="text-xs uppercase tracking-widest text-gold-400 hover:text-gold-300 transition-colors"
              >
                Go to Full Account &rarr;
              </Link>
            </div>

            <div className="space-y-4">
              {customerOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-noir-900/60 border border-white/10 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-gold-400/40 transition-all shadow-luxury"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-medium text-gold-300">
                        {order.orderNumber}
                      </span>
                      <span className="text-xs text-ivory-400">
                        &bull; {formatDate(order.createdAt)}
                      </span>
                      <span className="px-2.5 py-0.5 border border-gold-400/40 text-gold-300 text-[9px] uppercase tracking-widest font-semibold">
                        {order.status}
                      </span>
                    </div>

                    <div className="text-xs text-ivory-300 font-light">
                      {order.items?.map((i: any) => `${i.productName} (x${i.quantity})`).join(', ')}
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-4 shrink-0">
                    <span className="font-serif text-lg text-ivory-100">
                      {formatCurrency(order.total || order.subtotal)}
                    </span>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/orders/${order.orderNumber}`}
                        className="px-4 py-2.5 bg-gold-400 hover:bg-gold-300 text-noir-950 text-xs uppercase tracking-[0.2em] font-semibold transition-all flex items-center gap-1.5 shadow-luxury btn-luxury"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>TRACK ORDER</span>
                      </Link>
                      <Link
                        href={`/orders/${order.orderNumber}`}
                        className="px-4 py-2.5 bg-noir-950 hover:bg-noir-900 text-ivory-200 hover:text-gold-300 border border-white/20 hover:border-gold-400 text-xs uppercase tracking-[0.2em] font-medium transition-all flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>VIEW ORDER</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3 Maison Assurance Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-white/10 text-center">
          <div className="p-6 bg-noir-900/40 border border-white/5 space-y-2">
            <Truck className="w-6 h-6 text-gold-400 mx-auto" />
            <h3 className="font-serif text-sm text-ivory-100 uppercase tracking-wider">
              Private Courier Dispatch
            </h3>
            <p className="text-xs text-ivory-400 font-light leading-relaxed">
              Every parcel is sealed in tamper-proof obsidian packaging and insured for transit.
            </p>
          </div>

          <div className="p-6 bg-noir-900/40 border border-white/5 space-y-2">
            <Shield className="w-6 h-6 text-gold-400 mx-auto" />
            <h3 className="font-serif text-sm text-ivory-100 uppercase tracking-wider">
              Cold Vault Conditioning
            </h3>
            <p className="text-xs text-ivory-400 font-light leading-relaxed">
              Maintained at a constant 14°C to safeguard fragile organic flower absolutes.
            </p>
          </div>

          <div className="p-6 bg-noir-900/40 border border-white/5 space-y-2">
            <Sparkles className="w-6 h-6 text-gold-400 mx-auto" />
            <h3 className="font-serif text-sm text-ivory-100 uppercase tracking-wider">
              Hand-Signed Certificate
            </h3>
            <p className="text-xs text-ivory-400 font-light leading-relaxed">
              Accompanied by an embossed certificate of origin and maceration batch number.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
