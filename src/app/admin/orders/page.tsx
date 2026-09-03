'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Search,
  Filter,
  ShoppingBag,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  Eye,
  X,
  Gift,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Calendar,
  CreditCard,
  FileText,
  Send,
  RotateCcw,
  AlertTriangle,
  MapPin,
  Mail,
  Phone,
  User,
  ShieldCheck,
  PackageCheck,
  ExternalLink,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/formatters';

interface OrderItemRecord {
  id: string;
  productId?: string;
  productName: string;
  productSku: string;
  productImage?: string;
  size: string;
  unitPrice: number;
  discount: number;
  quantity: number;
  totalPrice: number;
  product?: {
    images?: { url: string }[];
  };
}

interface PaymentRecord {
  id: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: string; // PENDING, AUTHORIZED, CAPTURED, PAID, FAILED, REFUNDED
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}

interface ShipmentRecord {
  id: string;
  carrier: string;
  trackingNumber?: string;
  trackingUrl?: string;
  status: string;
  dispatchedAt?: string;
  deliveredAt?: string;
}

interface TimelineRecord {
  id: string;
  status: string;
  title: string;
  note?: string;
  actor: string;
  createdAt: string;
}

interface NoteRecord {
  id: string;
  adminName: string;
  note: string;
  createdAt: string;
}

interface NotificationRecord {
  id: string;
  recipient: string;
  type: string;
  subject: string;
  message: string;
  status: string;
  sentAt: string;
}

interface FullOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
  currency: string;
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  taxAmount: number;
  total: number;
  giftWrap: boolean;
  sampleChoices?: string;
  specialInstructions?: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItemRecord[];
  payments: PaymentRecord[];
  shipment?: ShipmentRecord;
  shippingAddress?: {
    address1: string;
    address2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
  timeline?: TimelineRecord[];
  adminNotes?: NoteRecord[];
  notifications?: NotificationRecord[];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<FullOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1, limit: 10 });

  // Filters & Sorting
  const [search, setSearch] = useState('');
  const [orderStatus, setOrderStatus] = useState('ALL');
  const [paymentStatus, setPaymentStatus] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Order Details Modal
  const [selectedOrder, setSelectedOrder] = useState<FullOrder | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'timeline' | 'notes' | 'notifications'>('details');

  // Confirmation Modal
  const [confirmAction, setConfirmAction] = useState<{
    type: 'CONFIRM' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCEL' | 'REFUND';
    title: string;
    description: string;
    actionButtonText: string;
    variant: 'gold' | 'danger';
    requiresInput?: 'tracking' | 'cancellationReason' | 'refundReason';
  } | null>(null);

  // Form states for modal actions
  const [actionTrackingNumber, setActionTrackingNumber] = useState('');
  const [actionCarrier, setActionCarrier] = useState('White-Glove Private Courier');
  const [actionReason, setActionReason] = useState('');
  const [actionProcessing, setActionProcessing] = useState(false);
  const [newInternalNote, setNewInternalNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  const fetchOrders = async (pageToFetch = pagination.page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (orderStatus !== 'ALL') params.set('orderStatus', orderStatus);
      if (paymentStatus !== 'ALL') params.set('paymentStatus', paymentStatus);
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);
      params.set('sortBy', sortBy);
      params.set('sortOrder', sortOrder);
      params.set('page', pageToFetch.toString());
      params.set('limit', pagination.limit.toString());

      const res = await fetch(`/api/orders?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
        if (data.pagination) {
          setPagination(data.pagination);
        }
      }
    } catch (e) {
      console.error('Error fetching orders:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(1);
  }, [orderStatus, paymentStatus, sortBy, sortOrder, startDate, endDate]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders(1);
  };

  const handleOpenOrder = async (orderId: string) => {
    setDetailsLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      const data = await res.json();
      if (data.success) {
        setSelectedOrder(data.order);
        setActiveTab('details');
      }
    } catch (e) {
      console.error('Error opening order:', e);
    } finally {
      setDetailsLoading(false);
    }
  };

  const executeStatusChange = async (newStatus: string, extraPayload: any = {}) => {
    if (!selectedOrder) return;
    setActionProcessing(true);
    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          ...extraPayload,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedOrder(data.order);
        setOrders((prev) => prev.map((o) => (o.id === data.order.id ? data.order : o)));
        setConfirmAction(null);
        setActionTrackingNumber('');
        setActionReason('');
      } else {
        alert(data.error || 'Failed to update order status.');
      }
    } catch (e: any) {
      console.error(e);
      alert(e.message || 'An error occurred while updating status.');
    } finally {
      setActionProcessing(false);
    }
  };

  const executeRefund = async () => {
    if (!selectedOrder) return;
    setActionProcessing(true);
    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: actionReason,
          amount: selectedOrder.total,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedOrder(data.order);
        setOrders((prev) => prev.map((o) => (o.id === data.order.id ? data.order : o)));
        setConfirmAction(null);
        setActionReason('');
      } else {
        alert(data.error || 'Failed to process refund.');
      }
    } catch (e: any) {
      console.error(e);
      alert(e.message || 'An error occurred during refund processing.');
    } finally {
      setActionProcessing(false);
    }
  };

  const handleAddInternalNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !newInternalNote.trim()) return;
    setSavingNote(true);
    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: newInternalNote }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedOrder({
          ...selectedOrder,
          adminNotes: [data.note, ...(selectedOrder.adminNotes || [])],
        });
        setNewInternalNote('');
      }
    } catch (e) {
      console.error('Error adding note:', e);
    } finally {
      setSavingNote(false);
    }
  };

  const normalizePaymentStatus = (payments: PaymentRecord[] = []) => {
    if (!payments || payments.length === 0) return 'PENDING';
    const primary = payments[0];
    if (primary.status === 'CAPTURED' || primary.status === 'PAID') return 'PAID';
    if (primary.status === 'REFUNDED') return 'REFUNDED';
    if (primary.status === 'FAILED') return 'FAILED';
    return 'PENDING';
  };

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30';
      case 'PROCESSING':
        return 'bg-blue-950/60 text-blue-400 border-blue-500/30';
      case 'SHIPPED':
        return 'bg-amber-950/60 text-amber-400 border-amber-500/30';
      case 'DELIVERED':
        return 'bg-gold-400/10 text-gold-300 border-gold-400/40';
      case 'CANCELLED':
        return 'bg-rose-950/60 text-rose-400 border-rose-500/30';
      case 'REFUNDED':
        return 'bg-purple-950/60 text-purple-400 border-purple-500/30';
      case 'PENDING':
      default:
        return 'bg-stone-900 text-stone-300 border-stone-700';
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
      case 'CAPTURED':
        return 'bg-emerald-950/50 text-emerald-300 border-emerald-500/30';
      case 'REFUNDED':
        return 'bg-purple-950/50 text-purple-300 border-purple-500/30';
      case 'FAILED':
        return 'bg-rose-950/50 text-rose-300 border-rose-500/30';
      case 'PENDING':
      default:
        return 'bg-amber-950/40 text-amber-300 border-amber-500/30';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-gold-400 font-medium">
            Commission Dispatch & Clearing
          </span>
          <h1 className="text-3xl font-serif text-ivory-100">Order Management</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchOrders(pagination.page)}
            className="text-xs uppercase tracking-widest px-4 py-2 border border-white/10 hover:border-gold-400/40 text-ivory-200 transition-colors"
          >
            Refresh Vault Ledger
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-noir-900 border border-white/10 p-5 space-y-4">
        {/* Top Row: Search & Order Status Tabs */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-lg">
            <input
              type="text"
              placeholder="Search by Order #, Patron Name, Email, Phone, or Flacon..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-noir-950 border border-white/10 px-4 py-2.5 pl-10 text-xs text-ivory-100 placeholder:text-ivory-400/40 focus:outline-none focus:border-gold-400"
            />
            <Search className="w-4 h-4 text-ivory-400/50 absolute left-3 top-3" />
          </form>

          {/* Quick Order Status Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            {[
              'ALL',
              'PENDING',
              'CONFIRMED',
              'PROCESSING',
              'SHIPPED',
              'DELIVERED',
              'CANCELLED',
              'REFUNDED',
            ].map((s) => (
              <button
                key={s}
                onClick={() => setOrderStatus(s)}
                className={`text-[10px] uppercase tracking-widest px-3 py-1.5 whitespace-nowrap transition-colors border ${
                  orderStatus === s
                    ? 'bg-gold-400 text-noir-950 border-gold-400 font-medium'
                    : 'bg-noir-950 text-ivory-400 border-white/5 hover:border-white/20'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Second Row: Detailed Multi-Dimensional Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-white/5 text-xs">
          {/* Payment Status Dropdown */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-ivory-400">Payment Status</label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="w-full bg-noir-950 border border-white/10 px-3 py-2 text-ivory-200 focus:outline-none focus:border-gold-400 text-xs"
            >
              <option value="ALL">All Payments</option>
              <option value="PAID">Paid (Captured)</option>
              <option value="PENDING">Pending Settlement</option>
              <option value="FAILED">Declined / Failed</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </div>

          {/* Date From */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-ivory-400">From Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-noir-950 border border-white/10 px-3 py-1.5 text-ivory-200 focus:outline-none focus:border-gold-400 text-xs"
            />
          </div>

          {/* Date To */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-ivory-400">To Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-noir-950 border border-white/10 px-3 py-1.5 text-ivory-200 focus:outline-none focus:border-gold-400 text-xs"
            />
          </div>

          {/* Sorting */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-ivory-400">Sort By</label>
            <div className="flex items-center gap-1">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 bg-noir-950 border border-white/10 px-3 py-2 text-ivory-200 focus:outline-none focus:border-gold-400 text-xs"
              >
                <option value="createdAt">Order Date</option>
                <option value="total">Total Value</option>
                <option value="orderNumber">Order Number</option>
                <option value="status">Order Status</option>
              </select>
              <button
                type="button"
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                className="p-2 bg-noir-950 border border-white/10 text-ivory-300 hover:border-gold-400"
                title={`Sort ${sortOrder === 'desc' ? 'Ascending' : 'Descending'}`}
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-noir-900 border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-[10px] uppercase tracking-[0.2em] text-ivory-400/60 bg-noir-950/80">
                <th className="py-4 px-6 font-medium">Order ID</th>
                <th className="py-4 px-6 font-medium">Customer</th>
                <th className="py-4 px-6 font-medium">Date</th>
                <th className="py-4 px-6 font-medium">Items</th>
                <th className="py-4 px-6 font-medium">Total</th>
                <th className="py-4 px-6 font-medium">Payment status</th>
                <th className="py-4 px-6 font-medium">Order status</th>
                <th className="py-4 px-6 font-medium">Last updated</th>
                <th className="py-4 px-6 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs text-ivory-200">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-ivory-400 font-light">
                    Consulting fragrance archives and dispatch ledger...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-ivory-400 font-light">
                    No commissions matched the selected filter criteria.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const paymentNormalized = normalizePaymentStatus(order.payments);
                  const itemsSummary = order.items.map((i) => `${i.productName} (x${i.quantity})`).join(', ');

                  return (
                    <tr key={order.id} className="hover:bg-white/[0.02] transition-colors group">
                      {/* Order ID */}
                      <td className="py-4 px-6 font-mono font-medium text-gold-300">
                        {order.orderNumber}
                      </td>

                      {/* Customer */}
                      <td className="py-4 px-6">
                        <div className="font-medium text-ivory-100">{order.customerName}</div>
                        <div className="text-[11px] text-ivory-400">{order.customerEmail}</div>
                        <div className="text-[10px] text-ivory-400/60">
                          {order.shippingAddress?.phone || order.customerPhone || '—'}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-6 text-ivory-400 whitespace-nowrap">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="py-4 px-6 max-w-xs truncate" title={itemsSummary}>
                        <div className="truncate text-ivory-300 font-light">{itemsSummary}</div>
                        <span className="text-[10px] text-ivory-400/60">
                          {order.items.length} {order.items.length === 1 ? 'line item' : 'line items'}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-medium text-ivory-100 whitespace-nowrap">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span
                          className={`text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-sm border ${getPaymentStatusBadge(
                            paymentNormalized
                          )}`}
                        >
                          {paymentNormalized}
                        </span>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span
                          className={`text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-sm border font-medium ${getOrderStatusBadge(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-ivory-400/60 whitespace-nowrap text-[11px]">
                        {formatDate(order.updatedAt)}
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleOpenOrder(order.id)}
                          className="inline-flex items-center gap-1.5 text-xs text-gold-400 hover:text-gold-300 px-3 py-1.5 border border-gold-400/30 hover:border-gold-400 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-white/10 bg-noir-950/60 text-xs text-ivory-400">
          <div>
            Showing{' '}
            <span className="text-ivory-100 font-medium">
              {orders.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0}
            </span>{' '}
            to{' '}
            <span className="text-ivory-100 font-medium">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{' '}
            of <span className="text-ivory-100 font-medium">{pagination.total}</span> commissions
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchOrders(pagination.page - 1)}
              disabled={pagination.page <= 1 || loading}
              className="p-2 border border-white/10 disabled:opacity-30 hover:border-gold-400 transition-colors text-ivory-200"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 text-ivory-200">
              Page {pagination.page} of {pagination.totalPages || 1}
            </span>
            <button
              onClick={() => fetchOrders(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages || loading}
              className="p-2 border border-white/10 disabled:opacity-30 hover:border-gold-400 transition-colors text-ivory-200"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* ORDER DETAILS MODAL / DRAWER */}
      {/* ============================================================ */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="bg-noir-900 border border-white/15 w-full max-w-5xl my-8 p-6 sm:p-8 space-y-6 shadow-2xl relative">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-5">
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-xl sm:text-2xl font-serif text-ivory-100">
                    Order {selectedOrder.orderNumber}
                  </span>
                  <span
                    className={`text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-sm border font-medium ${getOrderStatusBadge(
                      selectedOrder.status
                    )}`}
                  >
                    {selectedOrder.status}
                  </span>
                </div>
                <p className="text-xs text-ivory-400 mt-1">
                  Placed on {formatDate(selectedOrder.createdAt)} • Curated for{' '}
                  <span className="text-gold-300 font-medium">{selectedOrder.customerName}</span>
                </p>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-ivory-400 hover:text-white hover:bg-white/5 rounded-sm transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-4 border-b border-white/10 text-xs uppercase tracking-widest pb-2">
              <button
                onClick={() => setActiveTab('details')}
                className={`pb-2 transition-colors border-b-2 font-medium ${
                  activeTab === 'details'
                    ? 'border-gold-400 text-gold-300'
                    : 'border-transparent text-ivory-400 hover:text-ivory-200'
                }`}
              >
                Order Dossier
              </button>
              <button
                onClick={() => setActiveTab('timeline')}
                className={`pb-2 transition-colors border-b-2 font-medium ${
                  activeTab === 'timeline'
                    ? 'border-gold-400 text-gold-300'
                    : 'border-transparent text-ivory-400 hover:text-ivory-200'
                }`}
              >
                Visual Timeline ({selectedOrder.timeline?.length || 1})
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`pb-2 transition-colors border-b-2 font-medium ${
                  activeTab === 'notes'
                    ? 'border-gold-400 text-gold-300'
                    : 'border-transparent text-ivory-400 hover:text-ivory-200'
                }`}
              >
                Internal Notes ({selectedOrder.adminNotes?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`pb-2 transition-colors border-b-2 font-medium ${
                  activeTab === 'notifications'
                    ? 'border-gold-400 text-gold-300'
                    : 'border-transparent text-ivory-400 hover:text-ivory-200'
                }`}
              >
                Customer Notifications ({selectedOrder.notifications?.length || 0})
              </button>
            </div>

            {/* ================= TAB 1: ORDER DOSSIER ================= */}
            {activeTab === 'details' && (
              <div className="space-y-6">
                {/* 3-Column Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Customer Information */}
                  <div className="bg-noir-950 border border-white/10 p-4 space-y-3">
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gold-400 font-medium">
                      <User className="w-3.5 h-3.5" /> Patron Information
                    </div>
                    <div className="text-xs space-y-1">
                      <div className="font-serif text-ivory-100 text-sm">{selectedOrder.customerName}</div>
                      <div className="text-ivory-400 flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-gold-400/60" /> {selectedOrder.customerEmail}
                      </div>
                      <div className="text-ivory-400 flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-gold-400/60" />{' '}
                        {selectedOrder.shippingAddress?.phone || selectedOrder.customerPhone || 'Not provided'}
                      </div>
                    </div>
                  </div>

                  {/* Shipping Information */}
                  <div className="bg-noir-950 border border-white/10 p-4 space-y-3">
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gold-400 font-medium">
                      <MapPin className="w-3.5 h-3.5" /> Shipping Address
                    </div>
                    <div className="text-xs text-ivory-300 space-y-0.5">
                      <div>{selectedOrder.shippingAddress?.address1 || 'Private Cellar Delivery'}</div>
                      {selectedOrder.shippingAddress?.address2 && (
                        <div>{selectedOrder.shippingAddress.address2}</div>
                      )}
                      <div>
                        {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}{' '}
                        {selectedOrder.shippingAddress?.postalCode}
                      </div>
                      <div className="text-ivory-400 font-medium">
                        {selectedOrder.shippingAddress?.country || 'International'}
                      </div>
                    </div>
                  </div>

                  {/* Payment Information */}
                  <div className="bg-noir-950 border border-white/10 p-4 space-y-3">
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gold-400 font-medium">
                      <CreditCard className="w-3.5 h-3.5" /> Payment Clearing
                    </div>
                    <div className="text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-ivory-400">Method:</span>
                        <span className="text-ivory-100 font-medium">
                          {selectedOrder.payments?.[0]?.paymentMethod || 'Credit Card'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-ivory-400">Clearing Status:</span>
                        <span
                          className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-sm border ${getPaymentStatusBadge(
                            normalizePaymentStatus(selectedOrder.payments)
                          )}`}
                        >
                          {normalizePaymentStatus(selectedOrder.payments)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-ivory-400">Reference:</span>
                        <span className="font-mono text-[10px] text-gold-300 truncate max-w-[140px]" title={selectedOrder.payments?.[0]?.transactionId || 'None'}>
                          {selectedOrder.payments?.[0]?.transactionId || 'Awaiting'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-ivory-400">Settled:</span>
                        <span className="text-[11px] text-ivory-400">
                          {selectedOrder.payments?.[0]?.createdAt ? formatDate(selectedOrder.payments[0].createdAt) : 'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Courier & Tracking Bar */}
                <div className="bg-noir-950/60 border border-white/10 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <Truck className="w-4 h-4 text-gold-400" />
                    <div>
                      <span className="text-ivory-400">Courier Service: </span>
                      <span className="text-ivory-100 font-medium">
                        {selectedOrder.shipment?.carrier || 'White-Glove Private Courier'}
                      </span>
                      {selectedOrder.shipment?.trackingNumber && (
                        <span className="ml-3 font-mono text-gold-300">
                          Tracking: {selectedOrder.shipment.trackingNumber}
                        </span>
                      )}
                    </div>
                  </div>
                  {selectedOrder.giftWrap && (
                    <div className="flex items-center gap-1 text-[11px] text-gold-300 bg-espresso-950 px-2.5 py-1 border border-gold-dim">
                      <Gift className="w-3 h-3 text-gold-400" /> Complimentary Archival Gift Wrapping
                    </div>
                  )}
                </div>

                {/* Line Items Table */}
                <div className="bg-noir-950 border border-white/10 overflow-hidden">
                  <div className="p-3 border-b border-white/10 text-[10px] uppercase tracking-widest text-gold-400 font-medium">
                    Commission Line Items
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-white/5 text-[10px] uppercase tracking-widest text-ivory-400/60 bg-noir-900/50">
                          <th className="py-3 px-4">Item</th>
                          <th className="py-3 px-4">SKU</th>
                          <th className="py-3 px-4">Size</th>
                          <th className="py-3 px-4 text-center">Qty</th>
                          <th className="py-3 px-4 text-right">Unit Price</th>
                          <th className="py-3 px-4 text-right">Discount</th>
                          <th className="py-3 px-4 text-right">Line Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-ivory-200">
                        {selectedOrder.items.map((item) => {
                          const imgUrl = item.productImage || item.product?.images?.[0]?.url || '/images/perfume-placeholder.jpg';
                          return (
                            <tr key={item.id} className="hover:bg-white/[0.02]">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-noir-900 border border-white/10 flex-shrink-0 relative overflow-hidden">
                                    <Image
                                      src={imgUrl}
                                      alt={item.productName}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                  <div>
                                    <div className="font-serif font-medium text-ivory-100">{item.productName}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4 font-mono text-[10px] text-ivory-400">{item.productSku}</td>
                              <td className="py-3 px-4 text-ivory-300">{item.size}</td>
                              <td className="py-3 px-4 text-center font-medium">{item.quantity}</td>
                              <td className="py-3 px-4 text-right text-ivory-300">{formatCurrency(item.unitPrice)}</td>
                              <td className="py-3 px-4 text-right text-gold-400/80">
                                {item.discount > 0 ? `-${formatCurrency(item.discount)}` : '—'}
                              </td>
                              <td className="py-3 px-4 text-right font-medium text-ivory-100">
                                {formatCurrency(item.totalPrice)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Financial Summary Ledger */}
                  <div className="p-4 bg-noir-900/60 border-t border-white/10 flex justify-end">
                    <div className="w-full max-w-xs space-y-1.5 text-xs">
                      <div className="flex justify-between text-ivory-400">
                        <span>Subtotal</span>
                        <span className="text-ivory-200">{formatCurrency(selectedOrder.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-ivory-400">
                        <span>Private Courier Shipping</span>
                        <span className="text-ivory-200">
                          {selectedOrder.shippingFee === 0 ? 'Complimentary' : formatCurrency(selectedOrder.shippingFee)}
                        </span>
                      </div>
                      {selectedOrder.discountAmount > 0 && (
                        <div className="flex justify-between text-gold-400">
                          <span>Privilege Discount</span>
                          <span>-{formatCurrency(selectedOrder.discountAmount)}</span>
                        </div>
                      )}
                      {selectedOrder.taxAmount > 0 && (
                        <div className="flex justify-between text-ivory-400">
                          <span>Estimated Tax</span>
                          <span className="text-ivory-200">{formatCurrency(selectedOrder.taxAmount)}</span>
                        </div>
                      )}
                      <div className="pt-2 border-t border-white/10 flex justify-between font-serif text-sm font-medium text-ivory-100">
                        <span>Grand Total</span>
                        <span className="text-gold-300">{formatCurrency(selectedOrder.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Admin Actions Bar */}
                <div className="bg-noir-950 border border-gold-dim p-4 space-y-3">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-gold-400 font-medium">
                    Maison Executive Actions
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {/* Confirm Order */}
                    {selectedOrder.status === 'PENDING' && (
                      <button
                        onClick={() =>
                          setConfirmAction({
                            type: 'CONFIRM',
                            title: 'Confirm Order Reservation',
                            description: `Are you sure you wish to confirm commission ${selectedOrder.orderNumber}? This will trigger patron confirmation dispatch.`,
                            actionButtonText: 'Confirm Commission',
                            variant: 'gold',
                          })
                        }
                        className="px-3.5 py-2 bg-gold-400 hover:bg-gold-300 text-noir-950 font-medium transition-colors"
                      >
                        Confirm Order
                      </button>
                    )}

                    {/* Mark as Processing */}
                    {['PENDING', 'CONFIRMED'].includes(selectedOrder.status) && (
                      <button
                        onClick={() =>
                          setConfirmAction({
                            type: 'PROCESSING',
                            title: 'Transition to Atelier Preparation',
                            description: `Mark commission ${selectedOrder.orderNumber} as Processing? The atelier will begin blending and maceration packaging.`,
                            actionButtonText: 'Begin Processing',
                            variant: 'gold',
                          })
                        }
                        className="px-3.5 py-2 border border-gold-400/40 hover:border-gold-400 text-gold-300 hover:bg-gold-400/10 transition-colors"
                      >
                        Mark as Processing
                      </button>
                    )}

                    {/* Mark as Shipped */}
                    {['CONFIRMED', 'PROCESSING'].includes(selectedOrder.status) && (
                      <button
                        onClick={() =>
                          setConfirmAction({
                            type: 'SHIPPED',
                            title: 'Dispatch via Private Courier',
                            description: `Discharging commission ${selectedOrder.orderNumber} from vault archives. Please provide tracking consignment code.`,
                            actionButtonText: 'Authorize Dispatch',
                            variant: 'gold',
                            requiresInput: 'tracking',
                          })
                        }
                        className="px-3.5 py-2 border border-blue-400/40 hover:border-blue-400 text-blue-300 hover:bg-blue-400/10 transition-colors"
                      >
                        Mark as Shipped
                      </button>
                    )}

                    {/* Mark as Delivered */}
                    {selectedOrder.status === 'SHIPPED' && (
                      <button
                        onClick={() =>
                          setConfirmAction({
                            type: 'DELIVERED',
                            title: 'Confirm Consignment Delivery',
                            description: `Mark commission ${selectedOrder.orderNumber} as Safely Delivered to patron? This marks the lifecycle as fulfilled.`,
                            actionButtonText: 'Mark Delivered',
                            variant: 'gold',
                          })
                        }
                        className="px-3.5 py-2 border border-emerald-400/40 hover:border-emerald-400 text-emerald-300 hover:bg-emerald-400/10 transition-colors"
                      >
                        Mark as Delivered
                      </button>
                    )}

                    {/* Cancel Order */}
                    {!['DELIVERED', 'CANCELLED', 'REFUNDED'].includes(selectedOrder.status) && (
                      <button
                        onClick={() =>
                          setConfirmAction({
                            type: 'CANCEL',
                            title: 'Cancel Order Reservation',
                            description: `Are you sure you wish to cancel commission ${selectedOrder.orderNumber}? Reserved stock will be automatically repatriated to the archive inventory.`,
                            actionButtonText: 'Cancel Order & Repatriate Stock',
                            variant: 'danger',
                            requiresInput: 'cancellationReason',
                          })
                        }
                        className="px-3.5 py-2 border border-rose-500/40 hover:border-rose-500 text-rose-300 hover:bg-rose-500/10 transition-colors"
                      >
                        Cancel Order
                      </button>
                    )}

                    {/* Process Refund */}
                    {['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(selectedOrder.status) &&
                      normalizePaymentStatus(selectedOrder.payments) === 'PAID' && (
                        <button
                          onClick={() =>
                            setConfirmAction({
                              type: 'REFUND',
                              title: 'Process Full Financial Refund',
                              description: `Execute gateway settlement refund of ${formatCurrency(
                                selectedOrder.total
                              )} for ${selectedOrder.orderNumber}? This will reverse the payment and restore stock.`,
                              actionButtonText: 'Process Settlement Refund',
                              variant: 'danger',
                              requiresInput: 'refundReason',
                            })
                          }
                          className="px-3.5 py-2 border border-purple-400/40 hover:border-purple-400 text-purple-300 hover:bg-purple-400/10 transition-colors flex items-center gap-1.5"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Process Refund
                        </button>
                      )}
                  </div>
                </div>
              </div>
            )}

            {/* ================= TAB 2: VISUAL ORDER TIMELINE ================= */}
            {activeTab === 'timeline' && (
              <div className="space-y-6">
                <div className="text-xs text-ivory-400">
                  Track every stage of commission fulfillment. Each event is recorded with an immutable timestamp.
                </div>

                {/* Linear Visual Progress Steps */}
                <div className="bg-noir-950 p-6 border border-white/10">
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
                    {[
                      { step: 'Order placed', key: 'PENDING' },
                      { step: 'Payment confirmed', key: 'PAID' },
                      { step: 'Order confirmed', key: 'CONFIRMED' },
                      { step: 'Processing', key: 'PROCESSING' },
                      { step: 'Shipped', key: 'SHIPPED' },
                      { step: 'Delivered', key: 'DELIVERED' },
                    ].map((st, idx) => {
                      const isCompleted =
                        selectedOrder.timeline?.some((t) => t.status === st.key) ||
                        (st.key === 'PAID' && normalizePaymentStatus(selectedOrder.payments) === 'PAID') ||
                        (st.key === 'PENDING') ||
                        (st.key === 'CONFIRMED' && ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(selectedOrder.status)) ||
                        (st.key === 'PROCESSING' && ['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(selectedOrder.status)) ||
                        (st.key === 'SHIPPED' && ['SHIPPED', 'DELIVERED'].includes(selectedOrder.status)) ||
                        (st.key === 'DELIVERED' && selectedOrder.status === 'DELIVERED');

                      const timelineEntry = selectedOrder.timeline?.find((t) => t.status === st.key);

                      return (
                        <div key={st.key} className="space-y-2 flex flex-col items-center">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-serif border ${
                              isCompleted
                                ? 'bg-gold-400 text-noir-950 border-gold-300'
                                : 'bg-noir-900 text-ivory-400/40 border-white/10'
                            }`}
                          >
                            {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                          </div>
                          <div className={`text-[11px] font-medium ${isCompleted ? 'text-ivory-100' : 'text-ivory-400/40'}`}>
                            {st.step}
                          </div>
                          {timelineEntry && (
                            <div className="text-[10px] text-gold-400/80 font-mono">
                              {formatDate(timelineEntry.createdAt)}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Detailed Timeline Event Stream */}
                <div className="space-y-4">
                  <div className="text-[10px] uppercase tracking-widest text-gold-400 font-medium">
                    Lifecycle Event Stream
                  </div>
                  <div className="space-y-3">
                    {selectedOrder.timeline?.map((t) => (
                      <div
                        key={t.id}
                        className="bg-noir-950 border border-white/5 p-3.5 flex items-start justify-between gap-4 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="font-medium text-ivory-100 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-gold-400" />
                            {t.title}
                          </div>
                          {t.note && <div className="text-ivory-400 font-light pl-4">{t.note}</div>}
                          <div className="text-[10px] text-ivory-400/60 pl-4">Actor: {t.actor}</div>
                        </div>
                        <div className="text-[11px] text-ivory-400/80 whitespace-nowrap font-mono">
                          {formatDate(t.createdAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ================= TAB 3: INTERNAL ADMIN NOTES ================= */}
            {activeTab === 'notes' && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 p-3 bg-espresso-950/60 border border-gold-dim text-xs text-gold-300">
                  <ShieldCheck className="w-4 h-4 text-gold-400 flex-shrink-0" />
                  <span>
                    <strong>Private Maison Notes</strong>: Visible strictly to authorized administrative staff. These notes are never surfaced to patrons.
                  </span>
                </div>

                {/* Add Note Form */}
                <form onSubmit={handleAddInternalNote} className="space-y-3 bg-noir-950 p-4 border border-white/10">
                  <label className="text-[10px] uppercase tracking-widest text-gold-400 font-medium">
                    Append Internal Observation / Instructions
                  </label>
                  <textarea
                    rows={3}
                    value={newInternalNote}
                    onChange={(e) => setNewInternalNote(e.target.value)}
                    placeholder="e.g. Patron requested extra sample of Solstice. Verified concierge delivery time slot..."
                    className="w-full bg-noir-900 border border-white/10 p-3 text-xs text-ivory-100 placeholder:text-ivory-400/40 focus:outline-none focus:border-gold-400"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={savingNote || !newInternalNote.trim()}
                      className="px-4 py-2 text-xs uppercase tracking-widest bg-gold-400 hover:bg-gold-300 text-noir-950 font-medium disabled:opacity-30 transition-colors"
                    >
                      {savingNote ? 'Recording...' : 'Record Note'}
                    </button>
                  </div>
                </form>

                {/* List of Existing Notes */}
                <div className="space-y-3">
                  {selectedOrder.adminNotes && selectedOrder.adminNotes.length > 0 ? (
                    selectedOrder.adminNotes.map((note) => (
                      <div
                        key={note.id}
                        className="bg-noir-950 border border-white/5 p-4 space-y-1.5 text-xs"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-gold-300 font-medium">{note.adminName}</span>
                          <span className="text-ivory-400/60 font-mono">{formatDate(note.createdAt)}</span>
                        </div>
                        <div className="text-ivory-200 font-light whitespace-pre-wrap">{note.note}</div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-xs text-ivory-400 font-light bg-noir-950 border border-white/5">
                      No internal notes recorded for this commission yet.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ================= TAB 4: CUSTOMER NOTIFICATIONS ================= */}
            {activeTab === 'notifications' && (
              <div className="space-y-4">
                <div className="text-xs text-ivory-400">
                  Log of automated emails and notifications dispatched directly to patron{' '}
                  <span className="text-ivory-200">{selectedOrder.customerEmail}</span>.
                </div>

                <div className="space-y-3">
                  {selectedOrder.notifications && selectedOrder.notifications.length > 0 ? (
                    selectedOrder.notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className="bg-noir-950 border border-white/10 p-4 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-gold-400/10 text-gold-300 border border-gold-400/30">
                              {notif.type}
                            </span>
                            <span className="font-serif font-medium text-ivory-100">{notif.subject}</span>
                          </div>
                          <span className="text-ivory-400/60 font-mono text-[11px]">
                            {formatDate(notif.sentAt)}
                          </span>
                        </div>
                        <div className="bg-noir-900 p-3 text-ivory-300 font-mono text-[11px] whitespace-pre-wrap border border-white/5">
                          {notif.message}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-xs text-ivory-400 font-light bg-noir-950 border border-white/5">
                      No notification dispatches recorded.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* CONFIRMATION MODAL FOR CRITICAL ACTIONS */}
      {/* ============================================================ */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-noir-900 border border-white/20 p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              {confirmAction.variant === 'danger' ? (
                <div className="w-10 h-10 rounded-full bg-rose-950/60 border border-rose-500/40 flex items-center justify-center text-rose-400 flex-shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-gold-400/20 border border-gold-400/40 flex items-center justify-center text-gold-300 flex-shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
              )}
              <div>
                <h3 className="text-base font-serif text-ivory-100">{confirmAction.title}</h3>
                <span className="text-[10px] uppercase tracking-widest text-gold-400">Confirmation Required</span>
              </div>
            </div>

            <p className="text-xs text-ivory-300 font-light leading-relaxed">
              {confirmAction.description}
            </p>

            {/* Tracking Number Input if Required */}
            {confirmAction.requiresInput === 'tracking' && (
              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-ivory-400">Carrier</label>
                  <input
                    type="text"
                    value={actionCarrier}
                    onChange={(e) => setActionCarrier(e.target.value)}
                    className="w-full bg-noir-950 border border-white/10 px-3 py-2 text-xs text-ivory-100 focus:outline-none focus:border-gold-400 mt-1"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-ivory-400">Tracking Number / Consignment ID</label>
                  <input
                    type="text"
                    placeholder="e.g. WG-FRG-2026-8899"
                    value={actionTrackingNumber}
                    onChange={(e) => setActionTrackingNumber(e.target.value)}
                    className="w-full bg-noir-950 border border-white/10 px-3 py-2 text-xs text-ivory-100 focus:outline-none focus:border-gold-400 mt-1"
                  />
                </div>
              </div>
            )}

            {/* Cancellation or Refund Reason Input */}
            {(confirmAction.requiresInput === 'cancellationReason' ||
              confirmAction.requiresInput === 'refundReason') && (
              <div className="pt-2">
                <label className="text-[10px] uppercase tracking-widest text-ivory-400">
                  Reason for {confirmAction.requiresInput === 'refundReason' ? 'Settlement Refund' : 'Cancellation'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Patron request / Vault reallocation"
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  className="w-full bg-noir-950 border border-white/10 px-3 py-2 text-xs text-ivory-100 focus:outline-none focus:border-gold-400 mt-1"
                />
              </div>
            )}

            {/* Actions Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                disabled={actionProcessing}
                className="px-4 py-2 text-xs text-ivory-300 hover:text-white border border-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionProcessing}
                onClick={() => {
                  if (confirmAction.type === 'REFUND') {
                    executeRefund();
                  } else {
                    let newStatus = 'CONFIRMED';
                    let extra: any = {};
                    if (confirmAction.type === 'PROCESSING') newStatus = 'PROCESSING';
                    if (confirmAction.type === 'SHIPPED') {
                      newStatus = 'SHIPPED';
                      extra = { carrier: actionCarrier, trackingNumber: actionTrackingNumber };
                    }
                    if (confirmAction.type === 'DELIVERED') newStatus = 'DELIVERED';
                    if (confirmAction.type === 'CANCEL') {
                      newStatus = 'CANCELLED';
                      extra = { cancellationReason: actionReason };
                    }
                    executeStatusChange(newStatus, extra);
                  }
                }}
                className={`px-4 py-2 text-xs uppercase tracking-widest font-medium transition-colors ${
                  confirmAction.variant === 'danger'
                    ? 'bg-rose-700 hover:bg-rose-600 text-white'
                    : 'bg-gold-400 hover:bg-gold-300 text-noir-950'
                }`}
              >
                {actionProcessing ? 'Processing...' : confirmAction.actionButtonText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
