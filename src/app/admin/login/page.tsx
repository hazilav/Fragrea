'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, ArrowRight, KeyRound } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrUsername, password }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Authentication rejected');
      }

      router.push('/admin');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-noir-950 flex flex-col justify-center items-center p-6 text-ivory-100">
      <div className="w-full max-w-md space-y-8">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-block group">
            <span className="text-3xl font-serif tracking-[0.3em] block text-ivory-100 group-hover:text-gold-300 transition-colors">
              FRAGREA
            </span>
            <span className="text-[10px] uppercase tracking-[0.4em] text-gold-400 font-light mt-1 block">
              Maison Admin Portal
            </span>
          </Link>
          <p className="text-xs text-ivory-400 font-light">
            Authorized administrative access for catalog, inventory, and order dispatch.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-noir-900 border border-gold-dim p-8 md:p-10 shadow-luxury space-y-6">
          <div className="flex items-center gap-2 text-gold-400 text-xs uppercase tracking-wider font-medium border-b border-white/10 pb-4">
            <Lock className="w-4 h-4" />
            <span>Store Master Security Gate</span>
          </div>

          {error && (
            <div className="bg-red-950/60 border border-red-500/40 text-red-200 text-xs p-3.5 rounded-sm leading-relaxed">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-ivory-300 block">
                Username or Email
              </label>
              <input
                type="text"
                required
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                placeholder="admin@fragrea.com"
                className="w-full bg-noir-950 border border-white/15 px-3.5 py-2.5 text-xs text-ivory-100 focus:border-gold-400 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] uppercase tracking-wider text-ivory-300 block">
                  Master Password
                </label>
                <Link
                  href="/admin/forgot-password"
                  className="text-[10px] text-gold-400 hover:text-gold-300 transition-colors uppercase tracking-wider flex items-center gap-1"
                >
                  <KeyRound className="w-3 h-3" />
                  <span>Forgot Password?</span>
                </Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-noir-950 border border-white/15 px-3.5 py-2.5 text-xs text-ivory-100 focus:border-gold-400 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gold-400 hover:bg-gold-300 text-noir-950 py-3.5 text-xs uppercase tracking-widest font-medium transition-colors shadow-luxury disabled:opacity-50 mt-6"
            >
              {loading ? (
                <span>Authenticating Credentials...</span>
              ) : (
                <>
                  <span>Enter Maison Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="text-xs uppercase tracking-widest text-ivory-500 hover:text-gold-400 transition-colors font-light"
          >
            &larr; Return to Customer Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
