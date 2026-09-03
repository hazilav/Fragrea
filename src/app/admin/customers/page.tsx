'use client';

import React, { useState, useEffect } from 'react';
import { Search, Users, Mail, Phone, MapPin, DollarSign } from 'lucide-react';
import { CustomerData } from '@/types';
import { formatCurrency, formatDate } from '@/lib/formatters';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      let url = '/api/customers';
      if (search.trim()) url += `?search=${encodeURIComponent(search.trim())}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setCustomers(data.customers);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCustomers();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-gold-400 font-medium">
            Private Patron Register
          </span>
          <h1 className="text-3xl font-serif text-ivory-100">Customer Directory</h1>
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="bg-noir-900 border border-white/10 p-4 flex gap-3 max-w-md">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-ivory-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by patron name, email, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-noir-950 border border-white/10 pl-9 pr-3 py-2 text-xs text-ivory-100 placeholder:text-ivory-500 focus:outline-none focus:border-gold-400"
          />
        </div>
        <button
          type="submit"
          className="bg-gold-400 hover:bg-gold-300 text-noir-950 px-4 py-2 text-xs uppercase tracking-wider font-medium"
        >
          Search
        </button>
      </form>

      {/* Customers Table */}
      <div className="bg-noir-900 border border-white/10 overflow-hidden shadow-luxury">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-[10px] uppercase tracking-widest text-gold-400 bg-espresso-950/60">
                <th className="py-3.5 px-4">Patron / Connoisseur</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Residence</th>
                <th className="py-3.5 px-4">Total Allocations</th>
                <th className="py-3.5 px-4">Lifetime Spend</th>
                <th className="py-3.5 px-4">Registered Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-ivory-400">
                    Loading patron directory...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-ivory-500">
                    No patrons registered under this search.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gold-400/20 border border-gold-400/50 flex items-center justify-center text-gold-300 font-serif text-sm">
                          {(c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'P').charAt(0)}
                        </div>
                        <div>
                          <span className="font-serif text-sm text-ivory-100 block font-medium">
                            {c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-ivory-300 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-gold-400" />
                        <span>{c.email}</span>
                      </div>
                      {c.phone && (
                        <div className="flex items-center gap-1.5 text-ivory-500 text-[11px]">
                          <Phone className="w-3 h-3" />
                          <span>{c.phone}</span>
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-4 text-ivory-300">
                      {c.city ? (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-gold-400 shrink-0" />
                          <span>
                            {c.city}, {c.country}
                          </span>
                        </div>
                      ) : (
                        <span className="text-ivory-600">&mdash;</span>
                      )}
                    </td>

                    <td className="py-4 px-4 font-mono">
                      <span className="px-2 py-0.5 border border-white/10 bg-noir-950">
                        {c.totalOrders} {c.totalOrders === 1 ? 'order' : 'orders'}
                      </span>
                    </td>

                    <td className="py-4 px-4 font-serif text-sm text-gold-300 font-medium">
                      {formatCurrency(c.totalSpent)}
                    </td>

                    <td className="py-4 px-4 text-[11px] text-ivory-500">
                      {formatDate(c.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
