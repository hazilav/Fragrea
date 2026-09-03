import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  ArrowLeft,
  ShoppingBag,
  Shield,
  Sparkles,
} from 'lucide-react';
import prisma from '@/lib/prisma';
import { formatCurrency, formatDate } from '@/lib/formatters';

export const dynamic = 'force-dynamic';

async function getOrderData(idOrNumber: string) {
  try {
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: idOrNumber },
          { orderNumber: idOrNumber },
        ],
      },
      include: {
        items: true,
        shippingAddress: true,
        payments: true,
        shipment: true,
        timeline: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    return order;
  } catch (error) {
    console.error('Error loading order:', error);
    return null;
  }
}

const TIMELINE_STAGES = [
  { key: 'PENDING', label: 'ORDER PLACED', description: 'Commission logged in vault registry' },
  { key: 'CONFIRMED', label: 'CONFIRMED', description: 'Flacon allocation verified' },
  { key: 'PROCESSING', label: 'PROCESSING', description: 'Sealed into silk-lined obsidian coffret' },
  { key: 'SHIPPED', label: 'SHIPPED', description: 'Dispatched with climate-controlled courier' },
  { key: 'DELIVERED', label: 'DELIVERED', description: 'Successfully handed over to patron' },
];

function getStageIndex(status: string): number {
  const normalized = status.toUpperCase();
  if (normalized === 'DELIVERED') return 4;
  if (normalized === 'SHIPPED') return 3;
  if (normalized === 'PROCESSING') return 2;
  if (normalized === 'CONFIRMED') return 1;
  return 0;
}

export default async function CustomerOrderTrackingPage({
  params,
}: {
  params: { id: string };
}) {
  const order = await getOrderData(params.id);

  if (!order) {
    notFound();
  }

  const currentStageIndex = getStageIndex(order.status);
  const isCancelled = order.status === 'CANCELLED';
  const isRefunded = order.status === 'REFUNDED';

  return (
    <div className="min-h-screen bg-noir-950 text-ivory-100 py-16 px-6 sm:px-8 animate-fade-in">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Back Link */}
        <div>
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-ivory-400 hover:text-gold-300 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Orders Ledger</span>
          </Link>
        </div>

        {/* Order Header */}
        <div className="border border-white/10 bg-noir-900/80 p-6 sm:p-8 shadow-luxury flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase tracking-[0.35em] text-gold-400 font-light block">
              Maison Allocation Tracking
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl text-ivory-100">
              Order {order.orderNumber}
            </h1>
            <p className="text-xs text-ivory-400 font-light">
              Registered on {formatDate(order.createdAt)} &bull; Recipient:{' '}
              <strong className="text-ivory-200 font-medium">{order.customerName}</strong>
            </p>
          </div>

          <div className="sm:text-right">
            <span className="text-[10px] uppercase tracking-widest text-ivory-400 block mb-1">
              Current Status
            </span>
            <span
              className={`inline-block px-3.5 py-1 text-xs uppercase tracking-widest font-semibold border ${
                order.status === 'DELIVERED'
                  ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                  : order.status === 'SHIPPED'
                  ? 'bg-gold-400/20 border-gold-400 text-gold-300'
                  : order.status === 'PROCESSING'
                  ? 'bg-amber-950/80 border-amber-500/40 text-amber-300'
                  : 'bg-noir-950 border-white/20 text-ivory-200'
              }`}
            >
              {order.status}
            </span>
          </div>
        </div>

        {/* 5-Step Visual Order Timeline */}
        <div className="border border-white/10 bg-noir-900/60 p-6 sm:p-8 shadow-luxury space-y-6">
          <div className="border-b border-white/10 pb-4 flex items-center justify-between">
            <h2 className="font-serif text-lg text-ivory-100 flex items-center gap-2.5 uppercase tracking-wider">
              <Clock className="w-4 h-4 text-gold-400" />
              <span>Visual Order Timeline</span>
            </h2>
            {order.shipment?.trackingNumber && (
              <span className="font-mono text-xs text-gold-300">
                Courier Tracking: {order.shipment.trackingNumber}
              </span>
            )}
          </div>

          {isCancelled || isRefunded ? (
            <div className="p-6 bg-red-950/40 border border-red-500/30 text-red-300 text-xs text-center">
              This commission was marked as <strong>{order.status}</strong>. Please contact concierge for details.
            </div>
          ) : (
            <div className="relative py-4">
              {/* Progress Line */}
              <div className="hidden md:block absolute top-1/2 left-8 right-8 h-0.5 bg-white/10 -translate-y-1/2 -z-0">
                <div
                  className="h-full bg-gold-400 transition-all duration-700"
                  style={{ width: `${(currentStageIndex / (TIMELINE_STAGES.length - 1)) * 100}%` }}
                />
              </div>

              {/* Step Circles */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative z-10">
                {TIMELINE_STAGES.map((stage, idx) => {
                  const isCompleted = idx <= currentStageIndex;
                  const isCurrent = idx === currentStageIndex;

                  return (
                    <div
                      key={stage.key}
                      className={`flex md:flex-col items-center md:text-center gap-4 md:gap-3 p-3 md:p-0 rounded-sm ${
                        isCurrent ? 'bg-white/[0.03] md:bg-transparent' : ''
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all shrink-0 ${
                          isCompleted
                            ? 'bg-gold-400 border-gold-400 text-noir-950 font-bold'
                            : 'bg-noir-950 border-white/20 text-ivory-500'
                        } ${isCurrent ? 'ring-4 ring-gold-400/25 shadow-gold-subtle' : ''}`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <span className="text-xs font-mono">{idx + 1}</span>
                        )}
                      </div>

                      <div className="space-y-1">
                        <span
                          className={`text-xs uppercase tracking-wider block font-medium ${
                            isCurrent
                              ? 'text-gold-300'
                              : isCompleted
                              ? 'text-ivory-100'
                              : 'text-ivory-500'
                          }`}
                        >
                          {stage.label}
                        </span>
                        <p className="text-[10.5px] text-ivory-400 font-light leading-snug">
                          {stage.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Ordered Flacons Line Items */}
        <div className="border border-white/10 bg-noir-900/60 p-6 sm:p-8 shadow-luxury space-y-6">
          <h2 className="font-serif text-lg text-ivory-100 uppercase tracking-wider border-b border-white/10 pb-4">
            Commission Flacons ({order.items.length})
          </h2>

          <div className="divide-y divide-white/5">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="relative w-14 h-18 bg-noir-950 border border-white/10 shrink-0 overflow-hidden">
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
                  <div>
                    <h3 className="font-serif text-base text-ivory-100">{item.productName}</h3>
                    <p className="text-[10.5px] text-gold-400 uppercase tracking-wider mt-0.5">
                      {item.size} &bull; Qty: {item.quantity}
                    </p>
                    <p className="text-xs text-ivory-400 mt-1">
                      Unit: {formatCurrency(item.unitPrice)}
                    </p>
                  </div>
                </div>

                <div className="font-serif text-base text-ivory-100 font-medium">
                  {formatCurrency(item.totalPrice)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Destination & Financial Ledger */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Destination */}
          <div className="border border-white/10 bg-noir-900/60 p-6 sm:p-8 shadow-luxury space-y-4 text-xs">
            <span className="text-[10px] uppercase tracking-[0.3em] text-gold-400 block font-medium">
              White-Glove Courier Destination
            </span>
            <p className="text-ivory-100 font-medium text-sm">{order.customerName}</p>
            {order.shippingAddress ? (
              <div className="text-ivory-300 font-light space-y-1">
                <p>{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                  {order.shippingAddress.postalCode}
                </p>
                <p>{order.shippingAddress.country}</p>
                {order.shippingAddress.phone && (
                  <p className="pt-2 text-ivory-400 font-mono">Tel: {order.shippingAddress.phone}</p>
                )}
              </div>
            ) : (
              <p className="text-ivory-400 font-light">Courier dispatch address on file.</p>
            )}
          </div>

          {/* Financial Breakdown */}
          <div className="border border-white/10 bg-noir-900/60 p-6 sm:p-8 shadow-luxury space-y-4 text-xs">
            <span className="text-[10px] uppercase tracking-[0.3em] text-gold-400 block font-medium">
              Settlement Ledger
            </span>
            <div className="space-y-2 text-ivory-300">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-ivory-100 font-medium">{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Private Courier Shipping</span>
                <span className="text-gold-300">
                  {order.shippingFee === 0 ? 'Complimentary' : formatCurrency(order.shippingFee)}
                </span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Privilege Discount</span>
                  <span>-{formatCurrency(order.discountAmount)}</span>
                </div>
              )}
              <div className="border-t border-white/10 pt-3 flex justify-between items-baseline text-sm font-serif text-ivory-100">
                <span>Grand Total</span>
                <span className="text-gold-300 font-medium text-xl">
                  {formatCurrency(order.total)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/shop"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-gold-400 hover:bg-gold-300 text-noir-950 px-8 py-4 text-xs uppercase tracking-[0.22em] font-semibold transition-all shadow-luxury btn-luxury"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>SHOP NOW</span>
          </Link>

          <Link
            href="/orders"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/20 hover:border-gold-400 text-ivory-200 hover:text-gold-300 text-xs uppercase tracking-[0.2em] font-medium transition-colors"
          >
            <span>VIEW ALL ORDERS</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
