'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShoppingBag,
  Heart,
  Store,
  LayoutGrid,
  Search,
  PlusCircle,
  Bell,
  SlidersHorizontal,
} from 'lucide-react';
import { AppModeSwitcher } from '@/components/navigation/AppModeSwitcher';
import { MarketBottomNav } from '@/components/navigation/MarketBottomNav';
import { useAuthStore } from '@/lib/store/useAuthStore';

export default function MarketLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen min-h-[100dvh] bg-background text-foreground flex flex-col relative selection:bg-primary selection:text-primary-foreground">
      {/* ══════════════════════════════════════════════════════════════════════
          1. DESKTOP TOP BAR (md and above)
         ══════════════════════════════════════════════════════════════════════ */}
      <header
        className="hidden md:block sticky top-0 z-40 w-full border-b backdrop-blur-xl transition-all"
        style={{
          backgroundColor: 'var(--athlon-navigation, rgba(7, 13, 10, 0.85))',
          borderColor: 'var(--athlon-border, rgba(255, 255, 255, 0.08))',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
          {/* Top-Level Mode Switcher */}
          <div className="w-80">
            <AppModeSwitcher showNotifications={false} />
          </div>

          {/* Search Quick Bar */}
          <div className="flex-1 max-w-lg">
            <Link
              href="/market/search"
              className="flex items-center px-4 py-2 rounded-full border transition-all text-sm group"
              style={{
                backgroundColor: 'var(--athlon-input, #0E1612)',
                borderColor: 'var(--athlon-border, rgba(255, 255, 255, 0.08))',
                color: 'var(--athlon-text-muted, #94A3B8)',
              }}
            >
              <Search className="w-4 h-4 mr-2.5 text-foreground/50 group-hover:text-primary transition-colors" />
              <span className="text-foreground/50 truncate">Search sports gear, brands, shops...</span>
            </Link>
          </div>

          {/* Desktop Market Actions */}
          <div className="flex items-center gap-4">
            <Link
              href="/market/categories"
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg transition-colors ${
                pathname.startsWith('/market/categories') ? 'text-primary' : 'text-foreground/70 hover:text-foreground'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Categories</span>
            </Link>

            <Link
              href="/market/wishlist"
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg transition-colors ${
                pathname.startsWith('/market/wishlist') ? 'text-primary' : 'text-foreground/70 hover:text-foreground'
              }`}
            >
              <Heart className="w-4 h-4" />
              <span>Wishlist</span>
            </Link>

            <Link
              href="/market/sell"
              className="flex items-center gap-1.5 text-xs font-black px-4 py-2 rounded-full bg-primary text-primary-foreground hover:opacity-90 active:scale-95 transition-all shadow-md"
              style={{
                backgroundColor: 'var(--athlon-primary)',
                color: 'var(--athlon-primary-foreground, #000)',
              }}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Sell Gear</span>
            </Link>

            <Link
              href="/market/my"
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg transition-colors ${
                pathname.startsWith('/market/my') ? 'text-primary' : 'text-foreground/70 hover:text-foreground'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>My Market</span>
            </Link>

            {/* Notification Bell */}
            <Link
              href={isAuthenticated ? '/home/notifications' : '/login?redirect=/home/notifications'}
              className="relative p-2 rounded-full border border-border hover:border-primary/50 text-foreground/70 hover:text-foreground transition-all"
              style={{
                backgroundColor: 'var(--athlon-card)',
                borderColor: 'var(--athlon-border)',
              }}
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-background animate-pulse" />
            </Link>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════════════════
          2. MAIN CONTENT AREA
         ══════════════════════════════════════════════════════════════════════ */}
      <main className="flex-1 w-full max-w-full pb-24 md:pb-12 overflow-x-hidden">
        {children}
      </main>

      {/* ══════════════════════════════════════════════════════════════════════
          3. PWA MOBILE BOTTOM NAVIGATION (hidden on md and above)
         ══════════════════════════════════════════════════════════════════════ */}
      <MarketBottomNav />
    </div>
  );
}
