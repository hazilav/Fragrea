'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Users,
  Ticket,
  Settings,
  LogOut,
  ExternalLink,
  ShieldCheck,
  Menu,
  X,
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/admin/login';
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(!isLoginPage);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isLoginPage) return;
    fetch('/api/admin/auth')
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated) {
          router.push('/admin/login');
        } else {
          setCheckingAuth(false);
        }
      })
      .catch(() => {
        router.push('/admin/login');
      });
  }, [pathname, isLoginPage, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-noir-950 flex items-center justify-center text-ivory-400 font-serif text-sm">
        Authenticating Maison Credentials...
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' });
      router.push('/admin/login');
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  const navLinks = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/products', label: 'Products', icon: Package },
    { href: '/admin/collections', label: 'Collections', icon: Layers },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
    { href: '/admin/customers', label: 'Customers', icon: Users },
    { href: '/admin/coupons', label: 'Coupons', icon: Ticket },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-noir-950 text-ivory-100 flex flex-col md:flex-row">
      {/* Mobile Top Navigation Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-noir-900 border-b border-gold-dim">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="font-serif text-lg tracking-[0.2em] text-ivory-100">FRAGREA</span>
          <span className="text-[9px] uppercase tracking-widest text-gold-400 font-semibold px-2 py-0.5 border border-gold-dim">
            Admin
          </span>
        </Link>
        <button
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="text-ivory-300 p-1"
        >
          {mobileNavOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Luxury Admin Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-noir-900 border-r border-gold-dim flex flex-col justify-between p-6 transition-transform duration-300 md:static md:translate-x-0 ${
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-8">
          {/* Brand & Portal Badge */}
          <div>
            <Link href="/" className="inline-block group">
              <span className="font-serif text-2xl tracking-[0.25em] text-ivory-100 group-hover:text-gold-300 transition-colors block">
                FRAGREA
              </span>
              <span className="text-[9px] uppercase tracking-[0.35em] text-gold-400 font-light block mt-0.5">
                Maison Management
              </span>
            </Link>
          </div>

          {/* Main Navigation */}
          <nav className="space-y-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/admin'
                  ? pathname === '/admin'
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-3 text-xs uppercase tracking-widest font-medium transition-all ${
                    isActive
                      ? 'bg-gold-400/15 border-r-2 border-gold-400 text-gold-300'
                      : 'text-ivory-400 hover:text-ivory-100 hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-gold-400' : 'text-ivory-500'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions & Session Info */}
        <div className="space-y-4 pt-6 border-t border-white/10">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between text-xs text-ivory-400 hover:text-gold-300 transition-colors uppercase tracking-wider py-1"
          >
            <span>Live Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gold-400/20 border border-gold-400 flex items-center justify-center text-[10px] text-gold-300 font-bold">
                AD
              </div>
              <div>
                <span className="text-xs text-ivory-200 block leading-tight">Master Admin</span>
                <span className="text-[9px] text-ivory-500 block leading-tight">Super User</span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="text-ivory-500 hover:text-red-400 transition-colors p-1.5"
              title="Logout Session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Admin Content Stage */}
      <main className="flex-1 overflow-y-auto bg-noir-950 p-6 md:p-10">
        <div className="max-w-7xl mx-auto space-y-8">{children}</div>
      </main>
    </div>
  );
}
