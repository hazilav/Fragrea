'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import {
  ChevronLeft,
  CheckCircle2,
  Truck,
  RotateCcw,
  AlertTriangle,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Gift,
  ShieldCheck,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/formatters';

export default function AdminOrderDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${id}`);
      const data = await res.json();
      if (data.success) {
        setOrder(data.order);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchOrder();
  }, [id]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || !newNote.trim()) return;
    setSavingNote(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: newNote }),
      });
      const data = await res.json();
      if (data.success) {
        setOrder({
          ...order,
          adminNotes: [data.note, ...(order.adminNotes || [])],
        });
        setNewNote('');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingNote(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-ivory-400 font-light">
        Accessing commission archive dossier...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-24 text-center space-y-4">
        <h2 className="text-2xl font-serif text-ivory-100">Commission Not Found</h2>
        <Link
          href="/admin/orders"
          className="text-xs uppercase tracking-widest text-gold-400 hover:text-gold-300"
        >
          ← Return to Orders Ledger
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Back button & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-ivory-400 hover:text-gold-300 mb-2 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Return to Orders Ledger
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-serif text-ivory-100">Order {order.orderNumber}</h1>
            <span className="text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-sm border bg-gold-400/10 text-gold-300 border-gold-400/30 font-medium">
              {order.status}
            </span>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-noir-900 border border-white/10 p-5 space-y-2">
          <span className="text-[10px] uppercase tracking-widest text-gold-400 font-medium">
            Patron Information
          </span>
          <div className="font-serif text-ivory-100 text-base">{order.customerName}</div>
          <div className="text-xs text-ivory-400 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-gold-400" /> {order.customerEmail}
          </div>
          <div className="text-xs text-ivory-400 flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-gold-400" /> {order.shippingAddress?.phone || '—'}
          </div>
        </div>

        <div className="bg-noir-900 border border-white/10 p-5 space-y-2">
          <span className="text-[10px] uppercase tracking-widest text-gold-400 font-medium">
            Private Destination
          </span>
          <div className="text-xs text-ivory-300 space-y-1">
            <div>{order.shippingAddress?.address1}</div>
            <div>
              {order.shippingAddress?.city}, {order.shippingAddress?.state}{' '}
              {order.shippingAddress?.postalCode}
            </div>
            <div className="text-ivory-400 font-medium">{order.shippingAddress?.country}</div>
          </div>
        </div>

        <div className="bg-noir-900 border border-white/10 p-5 space-y-2">
          <span className="text-[10px] uppercase tracking-widest text-gold-400 font-medium">
            Payment & Settlement
          </span>
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-ivory-400">Method:</span>
              <span className="text-ivory-200 font-medium">{order.payments?.[0]?.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ivory-400">Status:</span>
              <span className="text-gold-300 font-medium">{order.payments?.[0]?.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ivory-400">Reference:</span>
              <span className="font-mono text-[10px] text-ivory-300">
                {order.payments?.[0]?.transactionId || 'Awaiting'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-noir-900 border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10 text-xs uppercase tracking-widest text-gold-400 font-medium">
          Commission Flacons
        </div>
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/5 text-[10px] uppercase tracking-widest text-ivory-400/60 bg-noir-950">
              <th className="py-3 px-6">Flacon</th>
              <th className="py-3 px-6">SKU</th>
              <th className="py-3 px-6">Size</th>
              <th className="py-3 px-6 text-center">Qty</th>
              <th className="py-3 px-6 text-right">Unit Price</th>
              <th className="py-3 px-6 text-right">Line Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-ivory-200">
            {order.items?.map((item: any) => (
              <tr key={item.id}>
                <td className="py-4 px-6 font-serif text-ivory-100 font-medium">
                  {item.productName}
                </td>
                <td className="py-4 px-6 font-mono text-[11px] text-ivory-400">{item.productSku}</td>
                <td className="py-4 px-6 text-ivory-300">{item.size}</td>
                <td className="py-4 px-6 text-center">{item.quantity}</td>
                <td className="py-4 px-6 text-right text-ivory-300">{formatCurrency(item.unitPrice)}</td>
                <td className="py-4 px-6 text-right font-medium text-ivory-100">
                  {formatCurrency(item.totalPrice)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="p-6 bg-noir-950/60 border-t border-white/10 flex justify-end">
          <div className="w-full max-w-xs space-y-2 text-xs">
            <div className="flex justify-between text-ivory-400">
              <span>Subtotal</span>
              <span className="text-ivory-200">{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-ivory-400">
              <span>Private Courier Shipping</span>
              <span className="text-ivory-200">{formatCurrency(order.shippingFee)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-gold-400">
                <span>Discount</span>
                <span>-{formatCurrency(order.discountAmount)}</span>
              </div>
            )}
            <div className="pt-2 border-t border-white/10 flex justify-between font-serif text-base text-ivory-100">
              <span>Grand Total</span>
              <span className="text-gold-300">{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Internal Admin Notes */}
      <div className="bg-noir-900 border border-white/10 p-6 space-y-4">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-gold-400 font-medium">
          <ShieldCheck className="w-4 h-4" /> Internal Administrative Notes
        </div>

        <form onSubmit={handleAddNote} className="space-y-3">
          <textarea
            rows={3}
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Record private observation or courier instruction..."
            className="w-full bg-noir-950 border border-white/10 p-3 text-xs text-ivory-100 focus:outline-none focus:border-gold-400"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={savingNote || !newNote.trim()}
              className="px-4 py-2 text-xs uppercase tracking-widest bg-gold-400 hover:bg-gold-300 text-noir-950 font-medium disabled:opacity-30 transition-colors"
            >
              {savingNote ? 'Recording...' : 'Record Note'}
            </button>
          </div>
        </form>

        <div className="space-y-3 pt-2">
          {order.adminNotes?.map((n: any) => (
            <div key={n.id} className="bg-noir-950 p-3.5 border border-white/5 text-xs space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-gold-300 font-medium">{n.adminName}</span>
                <span className="text-ivory-400/60 font-mono">{formatDate(n.createdAt)}</span>
              </div>
              <div className="text-ivory-200 font-light">{n.note}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
