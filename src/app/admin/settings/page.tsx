'use client';

import React, { useState } from 'react';
import { Settings, Shield, Building, Truck, Sparkles, Check, Save } from 'lucide-react';

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    houseName: 'FRAGREA Haute Parfumerie',
    brandTagline: 'Haute Parfumerie Française • Distilled in Grasse',
    parisAddress: '18 Rue de la Paix, 75002 Paris, France',
    newYorkAddress: '740 Madison Avenue, New York, NY 10065',
    conciergeEmail: 'concierge@fragrea.com',
    defaultCurrency: 'USD',
    defaultCarrier: 'White-Glove Private Courier',
    complimentaryShipping: true,
    samplesPerOrder: '2',
    coldMacerationDays: '180',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-[10px] uppercase tracking-[0.35em] text-gold-400 font-medium">
            Maison Configuration
          </span>
          <h1 className="text-3xl font-serif text-ivory-100 font-normal">
            House Settings &amp; Parameters
          </h1>
          <p className="text-xs text-ivory-400 font-light mt-1">
            Configure global brand parameters, shipping policies, and atelier credentials.
          </p>
        </div>

        {saved && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-xs">
            <Check className="w-4 h-4" />
            <span>Parameters updated successfully</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-8 max-w-4xl">
        {/* House Identity */}
        <div className="p-6 bg-noir-900 border border-white/10 rounded-sm space-y-4">
          <div className="flex items-center gap-2 text-gold-400 text-xs uppercase tracking-widest font-semibold">
            <Building className="w-4 h-4" />
            <span>Maison Identity</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase tracking-widest text-ivory-400 block mb-1">
                House Brand Name
              </label>
              <input
                type="text"
                value={settings.houseName}
                onChange={(e) => setSettings({ ...settings, houseName: e.target.value })}
                className="w-full bg-noir-950 border border-white/10 px-3 py-2 text-xs text-ivory-100 focus:outline-none focus:border-gold-400"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-widest text-ivory-400 block mb-1">
                Concierge Contact Email
              </label>
              <input
                type="email"
                value={settings.conciergeEmail}
                onChange={(e) => setSettings({ ...settings, conciergeEmail: e.target.value })}
                className="w-full bg-noir-950 border border-white/10 px-3 py-2 text-xs text-ivory-100 focus:outline-none focus:border-gold-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase tracking-widest text-ivory-400 block mb-1">
                Paris Atelier Address
              </label>
              <input
                type="text"
                value={settings.parisAddress}
                onChange={(e) => setSettings({ ...settings, parisAddress: e.target.value })}
                className="w-full bg-noir-950 border border-white/10 px-3 py-2 text-xs text-ivory-100 focus:outline-none focus:border-gold-400"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-widest text-ivory-400 block mb-1">
                New York Maison Address
              </label>
              <input
                type="text"
                value={settings.newYorkAddress}
                onChange={(e) => setSettings({ ...settings, newYorkAddress: e.target.value })}
                className="w-full bg-noir-950 border border-white/10 px-3 py-2 text-xs text-ivory-100 focus:outline-none focus:border-gold-400"
              />
            </div>
          </div>
        </div>

        {/* Courier & Client Privileges */}
        <div className="p-6 bg-noir-900 border border-white/10 rounded-sm space-y-4">
          <div className="flex items-center gap-2 text-gold-400 text-xs uppercase tracking-widest font-semibold">
            <Truck className="w-4 h-4" />
            <span>Fulfillment &amp; Client Privileges</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] uppercase tracking-widest text-ivory-400 block mb-1">
                Courier Carrier Name
              </label>
              <input
                type="text"
                value={settings.defaultCarrier}
                onChange={(e) => setSettings({ ...settings, defaultCarrier: e.target.value })}
                className="w-full bg-noir-950 border border-white/10 px-3 py-2 text-xs text-ivory-100 focus:outline-none focus:border-gold-400"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-widest text-ivory-400 block mb-1">
                Complimentary 2ml Samples Per Order
              </label>
              <input
                type="number"
                value={settings.samplesPerOrder}
                onChange={(e) => setSettings({ ...settings, samplesPerOrder: e.target.value })}
                className="w-full bg-noir-950 border border-white/10 px-3 py-2 text-xs text-ivory-100 font-mono focus:outline-none focus:border-gold-400"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-widest text-ivory-400 block mb-1">
                Maceration Standard (Days)
              </label>
              <input
                type="number"
                value={settings.coldMacerationDays}
                onChange={(e) => setSettings({ ...settings, coldMacerationDays: e.target.value })}
                className="w-full bg-noir-950 border border-white/10 px-3 py-2 text-xs text-ivory-100 font-mono focus:outline-none focus:border-gold-400"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-gold-400 hover:bg-gold-300 text-noir-950 px-8 py-3 text-xs uppercase tracking-widest font-semibold transition-colors shadow-luxury btn-luxury"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
}
