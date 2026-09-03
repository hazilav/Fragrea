'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Ticket, Trash2, Check, X, Percent, DollarSign, AlertCircle } from 'lucide-react';
import { CouponData } from '@/types';
import { formatCurrency } from '@/lib/formatters';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<CouponData[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    discountType: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED_AMOUNT',
    discountValue: '10',
    minOrderAmount: '200',
    usageLimit: '50',
    isActive: true,
  });

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/coupons');
      const data = await res.json();
      if (data.success) {
        setCoupons(data.coupons);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');

    if (!formData.code.trim()) {
      setErrorMsg('Code is required');
      setSaving(false);
      return;
    }

    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: formData.code.trim().toUpperCase(),
          discountType: formData.discountType,
          discountValue: parseFloat(formData.discountValue),
          minOrderAmount: formData.minOrderAmount ? parseFloat(formData.minOrderAmount) : null,
          usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
          isActive: formData.isActive,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        loadCoupons();
        setFormData({
          code: '',
          discountType: 'PERCENTAGE',
          discountValue: '10',
          minOrderAmount: '200',
          usageLimit: '50',
          isActive: true,
        });
      } else {
        setErrorMsg(data.error || 'Failed to create coupon');
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-[10px] uppercase tracking-[0.35em] text-gold-400 font-medium">
            Promotional Allocations
          </span>
          <h1 className="text-3xl font-serif text-ivory-100 font-normal">
            Coupons &amp; Private Offers
          </h1>
          <p className="text-xs text-ivory-400 font-light mt-1">
            Manage promotional privileges and discount allocations for Maison patrons.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 bg-gold-400 hover:bg-gold-300 text-noir-950 px-6 py-3 text-xs uppercase tracking-widest font-medium transition-colors shadow-luxury btn-luxury self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Coupon</span>
        </button>
      </div>

      {/* Coupons Table */}
      <div className="bg-noir-900 border border-white/10 rounded-sm overflow-hidden shadow-luxury">
        {loading ? (
          <div className="py-24 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs uppercase tracking-widest text-ivory-400">
              Examining Register...
            </p>
          </div>
        ) : coupons.length === 0 ? (
          <div className="py-20 text-center space-y-3 p-6">
            <Ticket className="w-8 h-8 text-gold-400/60 mx-auto" />
            <p className="text-sm font-serif text-ivory-200">No Active Promotional Codes</p>
            <p className="text-xs text-ivory-400 font-light">
              Create a coupon code to grant private discounts to distinguished patrons.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-noir-950 text-ivory-400 uppercase tracking-widest text-[10px]">
                  <th className="py-4 px-4">Coupon Code</th>
                  <th className="py-4 px-4">Discount</th>
                  <th className="py-4 px-4">Min. Order</th>
                  <th className="py-4 px-4">Redemptions</th>
                  <th className="py-4 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4">
                      <span className="font-mono text-xs text-gold-300 font-bold bg-espresso-950 px-2.5 py-1 border border-gold-dim">
                        {c.code}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-ivory-100 font-medium">
                      {c.discountType === 'PERCENTAGE'
                        ? `${c.discountValue}% Off`
                        : formatCurrency(c.discountValue) + ' Off'}
                    </td>
                    <td className="py-4 px-4 text-ivory-300">
                      {c.minOrderAmount ? formatCurrency(c.minOrderAmount) : 'No Minimum'}
                    </td>
                    <td className="py-4 px-4 text-ivory-400 font-mono">
                      {c.usedCount} {c.usageLimit ? `/ ${c.usageLimit}` : 'Uses'}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-semibold rounded-sm border ${
                          c.isActive
                            ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400'
                            : 'bg-red-950/60 border-red-500/40 text-red-400'
                        }`}
                      >
                        {c.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE COUPON MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-md bg-noir-950 border border-gold-dim text-ivory-100 p-6 rounded-sm shadow-luxury space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="font-serif text-xl text-ivory-100">Create Promotional Code</h3>
              <button onClick={() => setModalOpen(false)} className="text-ivory-400 hover:text-ivory-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-ivory-300 block mb-1.5">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MAISONVIP"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full bg-noir-900 border border-white/10 px-3 py-2 text-xs text-ivory-100 font-mono focus:outline-none focus:border-gold-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-ivory-300 block mb-1.5">
                    Discount Type
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e) =>
                      setFormData({ ...formData, discountType: e.target.value as any })
                    }
                    className="w-full bg-noir-900 border border-white/10 px-3 py-2 text-xs text-ivory-100 focus:outline-none focus:border-gold-400"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED_AMOUNT">Fixed Amount ($)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest text-ivory-300 block mb-1.5">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    className="w-full bg-noir-900 border border-white/10 px-3 py-2 text-xs text-ivory-100 font-mono focus:outline-none focus:border-gold-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-ivory-300 block mb-1.5">
                    Min. Order Amount ($)
                  </label>
                  <input
                    type="number"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                    className="w-full bg-noir-900 border border-white/10 px-3 py-2 text-xs text-ivory-100 font-mono focus:outline-none focus:border-gold-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest text-ivory-300 block mb-1.5">
                    Usage Limit
                  </label>
                  <input
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    className="w-full bg-noir-900 border border-white/10 px-3 py-2 text-xs text-ivory-100 font-mono focus:outline-none focus:border-gold-400"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="couponActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 accent-gold-400"
                />
                <label htmlFor="couponActive" className="text-xs text-ivory-200">
                  Activate code immediately upon generation
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-white/10 text-xs uppercase tracking-wider text-ivory-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-gold-400 hover:bg-gold-300 text-noir-950 text-xs uppercase tracking-wider font-semibold btn-luxury"
                >
                  {saving ? 'Generating...' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
