import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { CheckCircle2, ArrowRight, ShoppingBag, Truck } from 'lucide-react';
import prisma from '@/lib/prisma';
import { formatCurrency, formatDate } from '@/lib/formatters';

export const dynamic = 'force-dynamic';

async function getOrder(orderNumber: string) {
  try {
    const order = await prisma.order.findFirst({
      where: {
        OR: [{ orderNumber }, { id: orderNumber }],
      },
      include: {
        items: true,
        shippingAddress: true,
        shipment: true,
      },
    });
    return order;
  } catch (error) {
    console.error('Error loading order for confirmation:', error);
    return null;
  }
}

export default async function OrderSuccessPage({
  params,
}: {
  params: { orderNumber: string };
}) {
  const order = await getOrder(params.orderNumber);

  if (!order) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-noir-950 text-ivory-100 py-16 px-6 sm:px-8 animate-fade-in">
      <div className="max-w-3xl mx-auto space-y-12">
        {/* ============================================================ */}
        {/* CELEBRATION HEADER */}
        {/* ============================================================ */}
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-gold-400/10 border border-gold-400 mx-auto flex items-center justify-center text-gold-400 shadow-luxury">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.4em] text-gold-400 font-light block">
            Maison Allocation Confirmed
          </span>

          <h1 className="text-3xl sm:text-5xl font-serif text-ivory-100 font-normal tracking-[0.04em]">
            ORDER CONFIRMED
          </h1>

          <p className="text-base sm:text-lg font-serif italic text-ivory-300 font-light tracking-wide max-w-md mx-auto">
            &ldquo;Thank you for choosing Fragrea.&rdquo;
          </p>

          <p className="text-xs text-ivory-400 font-light leading-relaxed max-w-lg mx-auto pt-1">
            Your flacon reservation has been entered into the preparation register. A formal dispatch confirmation has been transmitted to{' '}
            <strong className="text-ivory-200 font-medium">{order.customerEmail}</strong>.
          </p>
        </div>

        {/* ============================================================ */}
        {/* OFFICIAL ORDER DOSSIER */}
        {/* ============================================================ */}
        <div className="bg-noir-900/80 border border-white/10 p-8 sm:p-10 shadow-luxury space-y-8">
          {/* Order Identification & Status */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-white/10 pb-6">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-ivory-400 block">
                Order Number
              </span>
              <span className="font-mono text-xl sm:text-2xl text-gold-300 tracking-wider font-medium">
                {order.orderNumber}
              </span>
              <span className="text-xs text-ivory-500 block mt-0.5">
                {formatDate(order.createdAt)}
              </span>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] uppercase tracking-widest text-ivory-400 block">
                Current Status
              </span>
              <span className="inline-block mt-1 px-3 py-1 bg-gold-400/15 border border-gold-400/40 text-gold-300 text-[10px] uppercase tracking-widest font-semibold">
                {order.status}
              </span>
            </div>
          </div>

          {/* Ordered Flacons */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-[0.25em] text-gold-400 font-medium">
              Items Ordered ({order.items.length})
            </h3>

            <div className="divide-y divide-white/5 space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 pt-4 first:pt-0 items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-20 bg-noir-950 border border-white/10 shrink-0 overflow-hidden">
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
                      <h4 className="font-serif text-base text-ivory-100">{item.productName}</h4>
                      <p className="text-[10px] text-gold-400 uppercase tracking-wider mt-0.5">
                        {item.size} &bull; Qty: {item.quantity}
                      </p>
                      <p className="text-xs text-ivory-400 mt-0.5">
                        Unit: {formatCurrency(item.unitPrice)}
                      </p>
                    </div>
                  </div>

                  <span className="font-serif text-base text-ivory-100 font-medium">
                    {formatCurrency(item.totalPrice)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery & Settlement Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 border-t border-white/10 pt-6 text-xs">
            {/* Delivery Information */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-widest text-gold-400 block font-medium">
                Delivery Information
              </span>
              <p className="text-ivory-100 font-medium text-sm">{order.customerName}</p>
              {order.shippingAddress ? (
                <div className="text-ivory-300 font-light space-y-0.5">
                  <p>{order.shippingAddress.addressLine1}</p>
                  {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                    {order.shippingAddress.postalCode}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                  {order.shippingAddress.phone && (
                    <p className="pt-1.5 text-ivory-400 font-mono">Tel: {order.shippingAddress.phone}</p>
                  )}
                  <p className="pt-1 text-gold-300/90 text-[11px]">
                    &bull; Insured Private White-Glove Courier
                  </p>
                </div>
              ) : (
                <p className="text-ivory-400 font-light">Courier destination on file.</p>
              )}
            </div>

            {/* Total Financial Summary */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-widest text-gold-400 block font-medium">
                Settlement Total
              </span>
              <div className="space-y-1.5 text-ivory-300">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-ivory-100 font-medium">{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Private Courier</span>
                  <span className="text-gold-300">
                    {order.shippingFee === 0 ? 'Complimentary' : formatCurrency(order.shippingFee)}
                  </span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Privilege Code</span>
                    <span>-{formatCurrency(order.discountAmount)}</span>
                  </div>
                )}
                <div className="border-t border-white/10 pt-3 flex justify-between items-baseline text-sm font-serif text-ivory-100">
                  <span>Total</span>
                  <span className="text-gold-300 font-medium text-xl">
                    {formatCurrency(order.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* BUTTONS: TRACK ORDER & CONTINUE SHOPPING */}
        {/* ============================================================ */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-2">
          {/* TRACK ORDER -> /orders/[id] */}
          <Link
            href={`/orders/${order.orderNumber}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-gold-400 hover:bg-gold-300 text-noir-950 px-9 py-4 text-xs uppercase tracking-[0.24em] font-semibold transition-all shadow-luxury btn-luxury"
          >
            <Truck className="w-4 h-4" />
            <span>TRACK ORDER</span>
          </Link>

          {/* CONTINUE SHOPPING -> /shop */}
          <Link
            href="/shop"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 border border-white/20 hover:border-gold-400 text-ivory-200 hover:text-gold-300 px-9 py-4 text-xs uppercase tracking-[0.24em] font-medium transition-colors bg-noir-900/60"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>CONTINUE SHOPPING</span>
          </Link>
        </div>

        {/* Patron Link to Orders Archive */}
        <div className="text-center pt-2">
          <Link
            href="/orders"
            className="text-xs uppercase tracking-[0.2em] text-ivory-400 hover:text-gold-300 transition-colors"
          >
            View All Your Commissions in Orders Ledger &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
