'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Package,
  MapPin,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Eye,
  X,
  Truck,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/formatters';

type AccountSection = 'PROFILE' | 'MY ORDERS' | 'ADDRESS' | 'LOG OUT';

export interface OrderItem {
  id: string;
  productName: string;
  productImage?: string | null;
  productSku?: string;
  size: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  slug?: string;
}

export interface OrderRecord {
  id: string;
  orderNumber: string;
  date: string;
  status: string;
  paymentStatus: string;
  subtotal: number;
  shippingFee: number;
  total: number;
  totalAmount?: number;
  itemCount: number;
  items: OrderItem[];
  shippingAddress: {
    recipientName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

export interface CustomerProfile {
  id?: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  totalOrders: number;
  totalSpent: number;
  defaultAddress?: any;
}

interface AccountClientProps {
  initialCustomer: CustomerProfile | null;
  initialOrders: OrderRecord[];
}

export default function AccountClient({
  initialCustomer,
  initialOrders,
}: AccountClientProps) {
  const router = useRouter();
  const [customer, setCustomer] = useState<CustomerProfile | null>(initialCustomer);
  const [orders, setOrders] = useState<OrderRecord[]>(initialOrders);
  const [activeSection, setActiveSection] = useState<AccountSection>('MY ORDERS');

  // Auth form states (for unauthenticated view)
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authFirstName, setAuthFirstName] = useState('');
  const [authLastName, setAuthLastName] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Orders sub-filter ('ALL' | 'CURRENT' | 'PREVIOUS')
  const [ordersFilter, setOrdersFilter] = useState<'ALL' | 'CURRENT' | 'PREVIOUS'>('ALL');

  // Selected order for detailed modal
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);

  // Profile edit states
  const [editFirstName, setEditFirstName] = useState(initialCustomer?.firstName || '');
  const [editLastName, setEditLastName] = useState(initialCustomer?.lastName || '');
  const [editPhone, setEditPhone] = useState(initialCustomer?.phone || '');
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  // Address edit states
  const [addressStreet, setAddressStreet] = useState(
    initialCustomer?.defaultAddress?.addressLine1 || ''
  );
  const [addressApartment, setAddressApartment] = useState(
    initialCustomer?.defaultAddress?.addressLine2 || ''
  );
  const [addressCity, setAddressCity] = useState(
    initialCustomer?.defaultAddress?.city || ''
  );
  const [addressState, setAddressState] = useState(
    initialCustomer?.defaultAddress?.state || ''
  );
  const [addressPostal, setAddressPostal] = useState(
    initialCustomer?.defaultAddress?.postalCode || ''
  );
  const [addressCountry, setAddressCountry] = useState(
    initialCustomer?.defaultAddress?.country || 'United States'
  );
  const [addressSuccessMsg, setAddressSuccessMsg] = useState('');

  // Handle Sign In / Register
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      const payload =
        authMode === 'signin'
          ? { action: 'login', email: authEmail, password: authPassword }
          : {
              action: 'register',
              email: authEmail,
              password: authPassword,
              firstName: authFirstName,
              lastName: authLastName,
              phone: authPhone,
            };

      const res = await fetch('/api/account/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Authentication failed');
      }

      router.refresh();
      // Reload orders & profile
      const [pRes, oRes] = await Promise.all([
        fetch('/api/account/auth'),
        fetch('/api/account/orders'),
      ]);
      const pData = await pRes.json();
      const oData = await oRes.json();
      if (pData.authenticated && pData.customer) {
        setCustomer(pData.customer);
        setEditFirstName(pData.customer.firstName);
        setEditLastName(pData.customer.lastName);
        setEditPhone(pData.customer.phone || '');
      }
      if (oData.success) {
        setOrders(oData.orders);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication error');
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await fetch('/api/account/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' }),
      });
      setCustomer(null);
      setOrders([]);
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Save profile updates
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccessMsg('');
    try {
      const res = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: editFirstName,
          lastName: editLastName,
          phone: editPhone,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setProfileSuccessMsg('Profile updated successfully.');
        router.refresh();
      }
    } catch (err) {
      console.error('Profile update failed:', err);
    }
  };

  // Save address updates
  const handleUpdateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressSuccessMsg('');
    try {
      const res = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: {
            addressLine1: addressStreet,
            apartment: addressApartment,
            city: addressCity,
            state: addressState,
            postalCode: addressPostal,
            country: addressCountry,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAddressSuccessMsg('Shipping address saved successfully.');
        router.refresh();
      }
    } catch (err) {
      console.error('Address update failed:', err);
    }
  };

  // Filter orders into Current vs Previous
  const filteredOrders = orders.filter((o) => {
    const isCurrent = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED'].includes(
      o.status.toUpperCase()
    );
    if (ordersFilter === 'CURRENT') return isCurrent;
    if (ordersFilter === 'PREVIOUS') return !isCurrent;
    return true;
  });

  // Visual Order Timeline steps
  const timelineSteps = [
    { key: 'PENDING', label: 'ORDER PLACED', desc: 'Order received into vault register' },
    { key: 'CONFIRMED', label: 'CONFIRMED', desc: 'Allocation reserved & authenticated' },
    { key: 'PROCESSING', label: 'PROCESSING', desc: 'Numbered flacon packaged in obsidian coffret' },
    { key: 'SHIPPED', label: 'SHIPPED', desc: 'Dispatched with climate-controlled courier' },
    { key: 'DELIVERED', label: 'DELIVERED', desc: 'Delivered securely into patron custody' },
  ];

  const getStepIndex = (status: string) => {
    const s = status.toUpperCase();
    if (s === 'PENDING') return 0;
    if (s === 'CONFIRMED') return 1;
    if (s === 'PROCESSING') return 2;
    if (s === 'SHIPPED') return 3;
    if (s === 'DELIVERED') return 4;
    return -1;
  };

  const getStatusBadge = (status: string) => {
    const s = status.toUpperCase();
    switch (s) {
      case 'DELIVERED':
        return 'bg-emerald-950/80 border-emerald-500/50 text-emerald-400';
      case 'SHIPPED':
        return 'bg-gold-400/10 border-gold-400/50 text-gold-300';
      case 'PROCESSING':
        return 'bg-amber-950/80 border-amber-500/50 text-amber-300';
      case 'CONFIRMED':
        return 'bg-blue-950/80 border-blue-500/50 text-blue-300';
      case 'CANCELLED':
      case 'REFUNDED':
        return 'bg-red-950/80 border-red-500/50 text-red-300';
      default:
        return 'bg-noir-900 border-white/20 text-ivory-300';
    }
  };

  // =========================================================================
  // UNAUTHENTICATED: SIGN IN / CREATE ACCOUNT VIEW
  // =========================================================================
  if (!customer) {
    return (
      <div className="min-h-screen bg-noir-950 text-ivory-100 py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-md mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-3">
            <span className="text-[10px] uppercase tracking-[0.35em] text-gold-400 font-light block">
              Maison Register &bull; Client Access
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif text-ivory-100 font-normal">
              {authMode === 'signin' ? 'SIGN IN' : 'CREATE ACCOUNT'}
            </h1>
            <p className="text-xs text-ivory-400 font-light leading-relaxed">
              {authMode === 'signin'
                ? 'Sign in to access your order history, tracked dispatches, and private concierge.'
                : 'Create an account to preserve your acquisitions and track your numbered flacons.'}
            </p>
          </div>

          {/* Toggle Tabs */}
          <div className="flex border border-white/10 p-1 bg-noir-900/60 select-none">
            <button
              type="button"
              onClick={() => {
                setAuthMode('signin');
                setAuthError('');
              }}
              className={`flex-1 py-2.5 text-xs uppercase tracking-[0.2em] font-medium transition-all ${
                authMode === 'signin'
                  ? 'bg-gold-400 text-noir-950 shadow-sm'
                  : 'text-ivory-400 hover:text-ivory-100'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setAuthError('');
              }}
              className={`flex-1 py-2.5 text-xs uppercase tracking-[0.2em] font-medium transition-all ${
                authMode === 'register'
                  ? 'bg-gold-400 text-noir-950 shadow-sm'
                  : 'text-ivory-400 hover:text-ivory-100'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error Banner */}
          {authError && (
            <div className="p-3 bg-red-950/80 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{authError}</span>
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleAuthSubmit}
            className="p-6 sm:p-8 bg-noir-900/80 border border-white/10 shadow-luxury space-y-4"
          >
            {authMode === 'register' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-ivory-400 mb-1.5">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={authFirstName}
                    onChange={(e) => setAuthFirstName(e.target.value)}
                    placeholder="Victoria"
                    className="w-full bg-noir-950 border border-white/15 px-3.5 py-2.5 text-xs text-ivory-100 focus:outline-none focus:border-gold-400 font-light"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-ivory-400 mb-1.5">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={authLastName}
                    onChange={(e) => setAuthLastName(e.target.value)}
                    placeholder="Sterling"
                    className="w-full bg-noir-950 border border-white/15 px-3.5 py-2.5 text-xs text-ivory-100 focus:outline-none focus:border-gold-400 font-light"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] text-ivory-400 mb-1.5">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="v.sterling@example.com"
                className="w-full bg-noir-950 border border-white/15 px-3.5 py-2.5 text-xs text-ivory-100 focus:outline-none focus:border-gold-400 font-light"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] text-ivory-400 mb-1.5">
                Password *
              </label>
              <input
                type="password"
                required
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-noir-950 border border-white/15 px-3.5 py-2.5 text-xs text-ivory-100 focus:outline-none focus:border-gold-400 font-light"
              />
            </div>

            {authMode === 'register' && (
              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] text-ivory-400 mb-1.5">
                  Telephone (Optional)
                </label>
                <input
                  type="tel"
                  value={authPhone}
                  onChange={(e) => setAuthPhone(e.target.value)}
                  placeholder="+1 (555) 019-2834"
                  className="w-full bg-noir-950 border border-white/15 px-3.5 py-2.5 text-xs text-ivory-100 focus:outline-none focus:border-gold-400 font-light"
                />
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3.5 bg-gold-400 hover:bg-gold-300 text-noir-950 text-xs uppercase tracking-[0.22em] font-semibold transition-colors disabled:opacity-50 btn-luxury"
              >
                {authLoading
                  ? 'Authenticating...'
                  : authMode === 'signin'
                  ? 'SIGN IN'
                  : 'CREATE ACCOUNT'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // =========================================================================
  // AUTHENTICATED: MY ACCOUNT DASHBOARD
  // =========================================================================
  return (
    <div className="min-h-screen bg-noir-950 text-ivory-100 py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
        {/* Page Title & Account Welcome */}
        <div className="border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-[0.35em] text-gold-400 font-light block">
              Maison Register &bull; Client Dossier
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-ivory-100 font-normal">
              MY ACCOUNT
            </h1>
            <p className="text-xs text-ivory-400 font-light">
              Welcome,{' '}
              <strong className="text-ivory-200 font-medium">
                {customer.firstName} {customer.lastName}
              </strong>{' '}
              ({customer.email})
            </p>
          </div>

          <div className="flex items-center gap-6 text-xs text-ivory-400 font-light">
            <div>
              <span className="text-[9px] uppercase tracking-widest text-gold-400 block">
                Acquisitions
              </span>
              <span className="text-ivory-100 font-serif text-base">{orders.length} Orders</span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div>
              <span className="text-[9px] uppercase tracking-widest text-gold-400 block">
                Total Value
              </span>
              <span className="text-ivory-100 font-serif text-base">
                {formatCurrency(
                  orders.reduce((acc, curr) => acc + (curr.total || curr.subtotal || 0), 0)
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Section Navigation Tabs: PROFILE | MY ORDERS | ADDRESS | LOG OUT */}
        <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-4 select-none">
          {(['PROFILE', 'MY ORDERS', 'ADDRESS', 'LOG OUT'] as AccountSection[]).map(
            (section) => {
              if (section === 'LOG OUT') {
                return (
                  <button
                    key={section}
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-[0.2em] text-ivory-400 hover:text-red-400 transition-colors ml-auto"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>LOG OUT</span>
                  </button>
                );
              }

              return (
                <button
                  key={section}
                  onClick={() => setActiveSection(section)}
                  className={`flex items-center gap-2 px-5 py-2.5 text-xs uppercase tracking-[0.2em] transition-all ${
                    activeSection === section
                      ? 'bg-gold-400 text-noir-950 font-semibold shadow-luxury'
                      : 'bg-noir-900/60 text-ivory-300 hover:text-gold-300 border border-white/10 hover:border-white/20'
                  }`}
                >
                  {section === 'PROFILE' && <User className="w-3.5 h-3.5" />}
                  {section === 'MY ORDERS' && <Package className="w-3.5 h-3.5" />}
                  {section === 'ADDRESS' && <MapPin className="w-3.5 h-3.5" />}
                  <span>{section}</span>
                </button>
              );
            }
          )}
        </div>

        {/* ================================================================= */}
        {/* SECTION 1: PROFILE */}
        {/* ================================================================= */}
        {activeSection === 'PROFILE' && (
          <div className="max-w-2xl space-y-8">
            <div className="p-6 sm:p-8 bg-noir-900/60 border border-white/10 space-y-6">
              <h2 className="font-serif text-xl text-ivory-100 border-b border-white/10 pb-3 flex items-center justify-between">
                <span>Personal Profile</span>
                <span className="text-xs uppercase tracking-widest text-gold-400 font-sans font-light">
                  Maison Member
                </span>
              </h2>

              {profileSuccessMsg && (
                <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{profileSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] text-ivory-400 mb-1.5">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={editFirstName}
                      onChange={(e) => setEditFirstName(e.target.value)}
                      className="w-full bg-noir-950 border border-white/15 px-3.5 py-2.5 text-xs text-ivory-100 focus:outline-none focus:border-gold-400 font-light"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] text-ivory-400 mb-1.5">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={editLastName}
                      onChange={(e) => setEditLastName(e.target.value)}
                      className="w-full bg-noir-950 border border-white/15 px-3.5 py-2.5 text-xs text-ivory-100 focus:outline-none focus:border-gold-400 font-light"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-ivory-400 mb-1.5">
                    Email Address (Immutable)
                  </label>
                  <input
                    type="email"
                    disabled
                    value={customer.email || ''}
                    className="w-full bg-noir-950/60 border border-white/10 px-3.5 py-2.5 text-xs text-ivory-500 cursor-not-allowed font-light"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-ivory-400 mb-1.5">
                    Telephone Number
                  </label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="+1 (555) 019-2834"
                    className="w-full bg-noir-950 border border-white/15 px-3.5 py-2.5 text-xs text-ivory-100 focus:outline-none focus:border-gold-400 font-light"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gold-400 hover:bg-gold-300 text-noir-950 text-xs uppercase tracking-[0.2em] font-semibold transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* SECTION 2: MY ORDERS */}
        {/* ================================================================= */}
        {activeSection === 'MY ORDERS' && (
          <div className="space-y-6">
            {/* Orders Sub-Filter */}
            <div className="flex items-center gap-3 text-xs select-none">
              <span className="text-[10px] uppercase tracking-[0.2em] text-ivory-400">
                Filter Orders:
              </span>
              {(['ALL', 'CURRENT', 'PREVIOUS'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setOrdersFilter(filter)}
                  className={`px-3.5 py-1.5 text-[10.5px] uppercase tracking-widest border transition-all ${
                    ordersFilter === filter
                      ? 'border-gold-400 bg-gold-400/10 text-gold-300'
                      : 'border-white/10 text-ivory-400 hover:border-white/20'
                  }`}
                >
                  {filter === 'ALL'
                    ? `All Orders (${orders.length})`
                    : filter === 'CURRENT'
                    ? 'Current Orders'
                    : 'Previous Orders'}
                </button>
              ))}
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
              <div className="text-center py-20 border border-white/10 bg-noir-900/40 p-12 space-y-4">
                <Package className="w-10 h-10 text-ivory-500 mx-auto" />
                <h3 className="font-serif text-lg text-ivory-200">No Orders Found</h3>
                <p className="text-xs text-ivory-400 font-light max-w-sm mx-auto">
                  {ordersFilter === 'CURRENT'
                    ? 'You have no active flacons currently en route.'
                    : ordersFilter === 'PREVIOUS'
                    ? 'You have no previous completed orders.'
                    : 'You have not placed any fragrance acquisitions yet.'}
                </p>
                <Link
                  href="/shop"
                  className="inline-block px-6 py-2.5 bg-gold-400 hover:bg-gold-300 text-noir-950 text-xs uppercase tracking-widest font-medium transition-colors"
                >
                  Explore Creations
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-5 sm:p-6 bg-noir-900/60 border border-white/10 hover:border-gold-400/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                  >
                    {/* Left: Order Info & Product Thumbnails */}
                    <div className="space-y-3 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-serif text-lg text-ivory-100 font-medium">
                          {order.orderNumber}
                        </span>
                        <span className="text-xs text-ivory-400 font-light">
                          &bull; {formatDate(order.date)}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 text-[9px] uppercase tracking-widest font-semibold border ${getStatusBadge(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </div>

                      {/* Products overview */}
                      <div className="flex items-center gap-4 overflow-x-auto py-1">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-2.5 shrink-0 bg-noir-950/60 border border-white/10 p-2 pr-3"
                          >
                            <div className="relative w-9 h-11 bg-noir-900 shrink-0 overflow-hidden">
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
                            <div className="text-xs">
                              <p className="font-serif text-ivory-100 font-medium truncate max-w-[130px]">
                                {item.productName}
                              </p>
                              <p className="text-[10px] text-ivory-400 font-mono">
                                Qty: {item.quantity} &bull; {item.size}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right: Total & VIEW ORDER Action */}
                    <div className="flex items-center justify-between md:flex-col md:items-end gap-3 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-white/5">
                      <div>
                        <span className="text-[9.5px] uppercase tracking-widest text-ivory-400 block text-left md:text-right">
                          Total
                        </span>
                        <span className="text-lg font-serif text-gold-300 font-medium">
                          {formatCurrency(order.total || order.subtotal)}
                        </span>
                      </div>

                      {/* Order Action Buttons: TRACK ORDER & VIEW ORDER */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          className="px-4 py-2.5 bg-gold-400 hover:bg-gold-300 text-noir-950 text-xs uppercase tracking-[0.2em] font-semibold transition-all flex items-center gap-1.5 shadow-luxury btn-luxury"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>TRACK ORDER</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          className="px-4 py-2.5 bg-noir-950 hover:bg-noir-900 text-ivory-200 hover:text-gold-300 border border-white/20 hover:border-gold-400 text-xs uppercase tracking-[0.2em] font-medium transition-all flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>VIEW ORDER</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* SECTION 3: ADDRESS */}
        {/* ================================================================= */}
        {activeSection === 'ADDRESS' && (
          <div className="max-w-2xl space-y-8">
            <div className="p-6 sm:p-8 bg-noir-900/60 border border-white/10 space-y-6">
              <h2 className="font-serif text-xl text-ivory-100 border-b border-white/10 pb-3 flex items-center justify-between">
                <span>Default Shipping Address</span>
                <span className="text-xs uppercase tracking-widest text-gold-400 font-sans font-light">
                  White-Glove Delivery
                </span>
              </h2>

              {addressSuccessMsg && (
                <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{addressSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleUpdateAddress} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-ivory-400 mb-1.5">
                    Country / Region
                  </label>
                  <select
                    value={addressCountry}
                    onChange={(e) => setAddressCountry(e.target.value)}
                    className="w-full bg-noir-950 border border-white/15 px-3.5 py-2.5 text-xs text-ivory-100 focus:outline-none focus:border-gold-400 cursor-pointer font-light"
                  >
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="France">France</option>
                    <option value="United Arab Emirates">United Arab Emirates</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-ivory-400 mb-1.5">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={addressStreet}
                    onChange={(e) => setAddressStreet(e.target.value)}
                    placeholder="740 Park Avenue"
                    className="w-full bg-noir-950 border border-white/15 px-3.5 py-2.5 text-xs text-ivory-100 focus:outline-none focus:border-gold-400 font-light"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-ivory-400 mb-1.5">
                    Apartment / Suite (Optional)
                  </label>
                  <input
                    type="text"
                    value={addressApartment}
                    onChange={(e) => setAddressApartment(e.target.value)}
                    placeholder="Penthouse B"
                    className="w-full bg-noir-950 border border-white/15 px-3.5 py-2.5 text-xs text-ivory-100 focus:outline-none focus:border-gold-400 font-light"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] text-ivory-400 mb-1.5">
                      City
                    </label>
                    <input
                      type="text"
                      value={addressCity}
                      onChange={(e) => setAddressCity(e.target.value)}
                      placeholder="New York"
                      className="w-full bg-noir-950 border border-white/15 px-3.5 py-2.5 text-xs text-ivory-100 focus:outline-none focus:border-gold-400 font-light"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] text-ivory-400 mb-1.5">
                      State
                    </label>
                    <input
                      type="text"
                      value={addressState}
                      onChange={(e) => setAddressState(e.target.value)}
                      placeholder="NY"
                      className="w-full bg-noir-950 border border-white/15 px-3.5 py-2.5 text-xs text-ivory-100 focus:outline-none focus:border-gold-400 font-light"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] text-ivory-400 mb-1.5">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      value={addressPostal}
                      onChange={(e) => setAddressPostal(e.target.value)}
                      placeholder="10021"
                      className="w-full bg-noir-950 border border-white/15 px-3.5 py-2.5 text-xs text-ivory-100 focus:outline-none focus:border-gold-400 font-light"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gold-400 hover:bg-gold-300 text-noir-950 text-xs uppercase tracking-[0.2em] font-semibold transition-colors"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* ORDER DETAILS MODAL WITH VISUAL ORDER TIMELINE */}
        {/* ================================================================= */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
            <div className="relative w-full max-w-3xl bg-noir-950 border border-white/15 text-ivory-100 shadow-2xl max-h-[90vh] flex flex-col">
              {/* Modal Header */}
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.3em] text-gold-400 font-light block">
                    Acquisition Dossier
                  </span>
                  <h2 className="text-xl sm:text-2xl font-serif text-ivory-100">
                    Order {selectedOrder.orderNumber}
                  </h2>
                  <span className="text-xs text-ivory-400 font-light">
                    Placed on {formatDate(selectedOrder.date)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 text-ivory-400 hover:text-ivory-100 transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">
                {/* -------------------------------------------------------- */}
                {/* VISUAL ORDER TIMELINE */}
                {/* -------------------------------------------------------- */}
                <div className="p-6 bg-noir-900/80 border border-white/10 space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-[0.25em] text-gold-400 font-medium">
                      Order Status Timeline
                    </span>
                    <span
                      className={`px-2.5 py-0.5 text-[9px] uppercase tracking-widest font-semibold border ${getStatusBadge(
                        selectedOrder.status
                      )}`}
                    >
                      {selectedOrder.status}
                    </span>
                  </div>

                  {/* Horizontal Timeline (Desktop) & Vertical (Mobile) */}
                  <div className="space-y-4">
                    {/* Desktop Step Bar */}
                    <div className="hidden sm:grid grid-cols-5 gap-2 relative">
                      {timelineSteps.map((step, idx) => {
                        const activeIdx = getStepIndex(selectedOrder.status);
                        const isCompleted = activeIdx >= idx;
                        const isCurrent = activeIdx === idx;

                        return (
                          <div key={step.key} className="flex flex-col items-center text-center space-y-2">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                                isCurrent
                                  ? 'bg-gold-400 text-noir-950 ring-4 ring-gold-400/20 font-bold'
                                  : isCompleted
                                  ? 'bg-emerald-500/20 border border-emerald-500/60 text-emerald-300'
                                  : 'bg-noir-950 border border-white/15 text-ivory-500'
                              }`}
                            >
                              {isCompleted && !isCurrent ? (
                                <CheckCircle2 className="w-4 h-4" />
                              ) : (
                                idx + 1
                              )}
                            </div>
                            <span
                              className={`text-[9.5px] uppercase tracking-[0.15em] leading-tight ${
                                isCurrent
                                  ? 'text-gold-300 font-semibold'
                                  : isCompleted
                                  ? 'text-ivory-200'
                                  : 'text-ivory-500'
                              }`}
                            >
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Mobile Timeline List */}
                    <div className="sm:hidden space-y-3">
                      {timelineSteps.map((step, idx) => {
                        const activeIdx = getStepIndex(selectedOrder.status);
                        const isCompleted = activeIdx >= idx;
                        const isCurrent = activeIdx === idx;

                        return (
                          <div
                            key={step.key}
                            className={`flex items-start gap-3 p-2.5 border ${
                              isCurrent
                                ? 'border-gold-400 bg-gold-400/10'
                                : isCompleted
                                ? 'border-emerald-500/30 bg-noir-950'
                                : 'border-white/5 opacity-50'
                            }`}
                          >
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] shrink-0 ${
                                isCurrent
                                  ? 'bg-gold-400 text-noir-950 font-bold'
                                  : isCompleted
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : 'border border-white/20 text-ivory-500'
                              }`}
                            >
                              {idx + 1}
                            </div>
                            <div>
                              <p
                                className={`text-xs uppercase tracking-wider font-medium ${
                                  isCurrent ? 'text-gold-300' : 'text-ivory-200'
                                }`}
                              >
                                {step.label}
                              </p>
                              <p className="text-[10px] text-ivory-400 font-light">{step.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanatory Message */}
                    <p className="text-[11px] text-ivory-400 font-light text-center border-t border-white/5 pt-3">
                      Current Stage:{' '}
                      <strong className="text-gold-300 font-medium">
                        {selectedOrder.status.toUpperCase()}
                      </strong>{' '}
                      &bull;{' '}
                      {timelineSteps.find(
                        (s) => s.key === selectedOrder.status.toUpperCase()
                      )?.desc || 'Order registered in our maison records.'}
                    </p>
                  </div>
                </div>

                {/* -------------------------------------------------------- */}
                {/* ORDER ITEMS & BREAKDOWN */}
                {/* -------------------------------------------------------- */}
                <div className="space-y-4">
                  <h3 className="font-serif text-base text-ivory-100 border-b border-white/10 pb-2">
                    Flacons in Order ({selectedOrder.items.length})
                  </h3>

                  <div className="divide-y divide-white/5">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="py-3 flex items-center gap-4">
                        <div className="relative w-14 h-16 bg-noir-900 border border-white/10 shrink-0 overflow-hidden">
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
                        <div className="flex-1 min-w-0">
                          <h4 className="font-serif text-sm text-ivory-100 font-medium truncate">
                            {item.productName}
                          </h4>
                          <p className="text-[10px] uppercase tracking-widest text-gold-400">
                            {item.size} &bull; Unit: {formatCurrency(item.unitPrice)}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs text-ivory-300 font-mono">Qty: {item.quantity}</p>
                          <p className="text-sm font-serif text-ivory-100 font-medium">
                            {formatCurrency(item.totalPrice || item.unitPrice * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* -------------------------------------------------------- */}
                {/* SHIPPING & PAYMENT DETAILS */}
                {/* -------------------------------------------------------- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Shipping Address */}
                  <div className="p-4 bg-noir-900/60 border border-white/10 space-y-1">
                    <span className="text-[9.5px] uppercase tracking-widest text-gold-400 block mb-1">
                      Shipping Address
                    </span>
                    <p className="text-ivory-100 font-medium">
                      {selectedOrder.shippingAddress.recipientName}
                    </p>
                    <p className="text-ivory-400 font-light">
                      {selectedOrder.shippingAddress.addressLine1}
                    </p>
                    {selectedOrder.shippingAddress.addressLine2 && (
                      <p className="text-ivory-400 font-light">
                        {selectedOrder.shippingAddress.addressLine2}
                      </p>
                    )}
                    <p className="text-ivory-400 font-light">
                      {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}{' '}
                      {selectedOrder.shippingAddress.postalCode}
                    </p>
                    <p className="text-ivory-400 font-light">
                      {selectedOrder.shippingAddress.country}
                    </p>
                  </div>

                  {/* Payment & Financial Summary */}
                  <div className="p-4 bg-noir-900/60 border border-white/10 space-y-2">
                    <span className="text-[9.5px] uppercase tracking-widest text-gold-400 block mb-1">
                      Payment &amp; Financial Summary
                    </span>
                    <div className="flex justify-between text-ivory-400 font-light">
                      <span>Payment Status</span>
                      <span className="text-emerald-400 font-medium uppercase tracking-wider text-[10px]">
                        {selectedOrder.paymentStatus}
                      </span>
                    </div>
                    <div className="flex justify-between text-ivory-400 font-light">
                      <span>Subtotal</span>
                      <span>{formatCurrency(selectedOrder.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-ivory-400 font-light">
                      <span>Shipping</span>
                      <span className="text-gold-400">Complimentary Courier</span>
                    </div>
                    <div className="flex justify-between text-ivory-100 font-serif pt-2 border-t border-white/10 text-sm">
                      <span>Total Amount</span>
                      <span className="text-gold-300 font-medium">
                        {formatCurrency(selectedOrder.total || selectedOrder.subtotal)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-white/10 bg-noir-950 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-6 py-2.5 bg-gold-400 hover:bg-gold-300 text-noir-950 text-xs uppercase tracking-widest font-semibold transition-colors"
                >
                  Close Dossier
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
