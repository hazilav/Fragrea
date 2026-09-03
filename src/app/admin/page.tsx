'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  AlertTriangle,
  ArrowRight,
  Plus,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { AdminStats } from '@/types';
import { formatCurrency, formatDate } from '@/lib/formatters';

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchStats();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-4">
        <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs uppercase tracking-widest text-ivory-400">
          Loading Maison Analytics...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Overview Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-gold-400 font-medium">
            Management Portal
          </span>
          <h1 className="text-3xl font-serif text-ivory-100">Executive Overview</h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products?action=new"
            className="inline-flex items-center gap-2 bg-gold-400 hover:bg-gold-300 text-noir-950 px-4 py-2.5 text-xs uppercase tracking-widest font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Flacon</span>
          </Link>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-2 border border-white/15 hover:border-gold-400 text-ivory-200 px-4 py-2.5 text-xs uppercase tracking-widest font-medium transition-colors"
          >
            <ShoppingBag className="w-4 h-4 text-gold-400" />
            <span>Manage Orders</span>
          </Link>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="bg-noir-900 border border-gold-dim p-6 space-y-2 shadow-amber-glow">
          <div className="flex items-center justify-between text-gold-400">
            <span className="text-[10px] uppercase tracking-widest font-medium">
              Gross Revenue
            </span>
            <DollarSign className="w-4 h-4" />
          </div>
          <div className="font-serif text-3xl text-ivory-100">
            {formatCurrency(stats?.totalRevenue || 0)}
          </div>
          <span className="text-[10px] text-ivory-400 block font-light">
            All settled client transactions
          </span>
        </div>

        {/* Total Orders */}
        <div className="bg-noir-900 border border-white/10 p-6 space-y-2">
          <div className="flex items-center justify-between text-gold-400">
            <span className="text-[10px] uppercase tracking-widest font-medium">
              Total Orders
            </span>
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div className="font-serif text-3xl text-ivory-100">
            {stats?.totalOrders || 0}
          </div>
          <div className="text-[10px] text-amberGlow-400 flex items-center gap-1 font-light">
            <Clock className="w-3 h-3" />
            <span>{stats?.pendingOrders || 0} pending preparation</span>
          </div>
        </div>

        {/* Total Products & Inventory */}
        <div className="bg-noir-900 border border-white/10 p-6 space-y-2">
          <div className="flex items-center justify-between text-gold-400">
            <span className="text-[10px] uppercase tracking-widest font-medium">
              Active Catalog
            </span>
            <Package className="w-4 h-4" />
          </div>
          <div className="font-serif text-3xl text-ivory-100">
            {stats?.totalProducts || 0} Flacons
          </div>
          {stats && stats.lowStockProducts > 0 ? (
            <div className="text-[10px] text-amber-400 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              <span>{stats.lowStockProducts} flacons low in stock</span>
            </div>
          ) : (
            <span className="text-[10px] text-emerald-400 block">Optimal inventory</span>
          )}
        </div>

        {/* Total Customers */}
        <div className="bg-noir-900 border border-white/10 p-6 space-y-2">
          <div className="flex items-center justify-between text-gold-400">
            <span className="text-[10px] uppercase tracking-widest font-medium">
              Client Register
            </span>
            <Users className="w-4 h-4" />
          </div>
          <div className="font-serif text-3xl text-ivory-100">
            {stats?.totalCustomers || 0} Connoisseurs
          </div>
          <span className="text-[10px] text-ivory-400 block font-light">
            Global patrons of the house
          </span>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-noir-900 border border-white/10 p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h3 className="font-serif text-xl text-ivory-100">Recent Allocations</h3>
            <p className="text-xs text-ivory-400 font-light">
              Latest client acquisitions awaiting fulfillment or in transit.
            </p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs uppercase tracking-widest text-gold-400 hover:text-gold-200"
          >
            All Orders &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-[10px] uppercase tracking-widest text-gold-400">
                <th className="py-3 px-4">Order Ref</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Destination</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                stats.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4 font-mono text-gold-300">
                      {order.orderNumber}
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-ivory-100 block font-medium">
                        {order.customerName}
                      </span>
                      <span className="text-ivory-500 text-[11px] block">
                        {order.customerEmail}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-ivory-300">
                      {order.city}, {order.country}
                    </td>
                    <td className="py-4 px-4 font-serif text-sm text-ivory-100">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 text-[9px] uppercase tracking-wider font-semibold border ${
                          order.status === 'DELIVERED'
                            ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                            : order.status === 'SHIPPED'
                            ? 'bg-blue-950/80 border-blue-500/40 text-blue-300'
                            : order.status === 'PROCESSING'
                            ? 'bg-amber-950/80 border-amber-500/40 text-amber-300'
                            : 'bg-noir-950 border-white/20 text-ivory-300'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      {order.status === 'PENDING' && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'PROCESSING')}
                          className="text-[10px] uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-1 hover:bg-amber-500/30"
                        >
                          Mark Processing
                        </button>
                      )}
                      {order.status === 'PROCESSING' && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'SHIPPED')}
                          className="text-[10px] uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/40 px-2.5 py-1 hover:bg-blue-500/30"
                        >
                          Mark Shipped
                        </button>
                      )}
                      {order.status === 'SHIPPED' && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'DELIVERED')}
                          className="text-[10px] uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 hover:bg-emerald-500/30"
                        >
                          Mark Delivered
                        </button>
                      )}
                      {order.status === 'DELIVERED' && (
                        <span className="text-[10px] text-emerald-400 flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Complete
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-ivory-500">
                    No orders recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
