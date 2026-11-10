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
  Zap,
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
    <div className="h-[100dvh] md:min-h-screen w-full max-w-full overflow-hidden md:overflow-visible bg-background text-foreground flex flex-col relative selection:bg-primary selection:text-primary-foreground select-none">
      {/* ══════════════════════════════════════════════════════════════════════
          1. DESKTOP TOP BAR (md and above)
         ══════════════════════════════════════════════════════════════════════ */}
      <header
        className="hidden md:block sticky top-0 z-40 w-full border-b backdrop-blur-xl bg-background/85 transition-all duration-300"
        style={{
          backgroundColor: 'var(--athlon-navigation, rgba(7, 13, 10, 0.85))',
          borderColor: 'var(--athlon-border, rgba(255, 255, 255, 0.08))',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link href="/market" className="flex items-center gap-3 group shrink-0">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-primary group-hover:scale-105 transition-transform shadow-lg"
              style={{
                backgroundColor: 'var(--athlon-surface)',
                border: '1px solid var(--athlon-border)',
                boxShadow: '0 0 20px var(--athlon-primary-soft)',
              }}
            >
              <ShoppingBag className="w-5 h-5" style={{ color: 'var(--athlon-primary)' }} />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-foreground leading-none">
                ATHLON
              </span>
              <span
                className="text-[10px] font-mono font-bold tracking-widest uppercase leading-tight mt-0.5"
                style={{ color: 'var(--athlon-primary)' }}
              >
                Marketplace
              </span>
            </div>
          </Link>

          {/* Center Navigation Links in Capsule */}
          <nav className="flex items-center gap-1 bg-surface/40 p-1.5 rounded-2xl border border-foreground/5 backdrop-blur-md">
            <Link
              href="/market"
              className={`px-4 py-2 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${
                pathname === '/market'
                  ? 'shadow-sm'
                  : 'text-foreground/80 hover:text-foreground hover:bg-foreground/5'
              }`}
              style={
                pathname === '/market'
                  ? {
                      backgroundColor: 'var(--athlon-primary)',
                      color: 'var(--athlon-primary-foreground)',
                    }
                  : undefined
              }
            >
              <Store
                className="w-4 h-4"
                style={pathname === '/market' ? { color: 'var(--athlon-primary-foreground)' } : { color: 'var(--athlon-primary)' }}
              />
              <span>Market</span>
            </Link>

            <Link
              href="/market/categories"
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                pathname.startsWith('/market/categories')
                  ? 'shadow-sm'
                  : 'text-foreground/80 hover:text-foreground hover:bg-foreground/5'
              }`}
              style={
                pathname.startsWith('/market/categories')
                  ? {
                      backgroundColor: 'var(--athlon-primary)',
                      color: 'var(--athlon-primary-foreground)',
                    }
                  : undefined
              }
            >
              <LayoutGrid
                className="w-4 h-4"
                style={pathname.startsWith('/market/categories') ? { color: 'var(--athlon-primary-foreground)' } : { color: 'rgb(52, 211, 153)' }}
              />
              <span>Categories</span>
            </Link>

            <Link
              href="/market/plans"
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                pathname.startsWith('/market/plans')
                  ? 'shadow-sm'
                  : 'text-foreground/80 hover:text-foreground hover:bg-foreground/5'
              }`}
              style={
                pathname.startsWith('/market/plans')
                  ? {
                      backgroundColor: 'var(--athlon-primary)',
                      color: 'var(--athlon-primary-foreground)',
                    }
                  : undefined
              }
            >
              <Zap
                className="w-4 h-4"
                style={pathname.startsWith('/market/plans') ? { color: 'var(--athlon-primary-foreground)' } : { color: 'rgb(251, 191, 36)' }}
              />
              <span>Plans &amp; Passes</span>
            </Link>

            <Link
              href="/market/wishlist"
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                pathname.startsWith('/market/wishlist')
                  ? 'shadow-sm'
                  : 'text-foreground/80 hover:text-foreground hover:bg-foreground/5'
              }`}
              style={
                pathname.startsWith('/market/wishlist')
                  ? {
                      backgroundColor: 'var(--athlon-primary)',
                      color: 'var(--athlon-primary-foreground)',
                    }
                  : undefined
              }
            >
              <Heart
                className="w-4 h-4"
                style={pathname.startsWith('/market/wishlist') ? { color: 'var(--athlon-primary-foreground)' } : { color: 'rgb(251, 113, 133)' }}
              />
              <span>Wishlist</span>
            </Link>

            <Link
              href="/market/my"
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                pathname.startsWith('/market/my')
                  ? 'shadow-sm'
                  : 'text-foreground/80 hover:text-foreground hover:bg-foreground/5'
              }`}
              style={
                pathname.startsWith('/market/my')
                  ? {
                      backgroundColor: 'var(--athlon-primary)',
                      color: 'var(--athlon-primary-foreground)',
                    }
                  : undefined
              }
            >
              <Store
                className="w-4 h-4"
                style={pathname.startsWith('/market/my') ? { color: 'var(--athlon-primary-foreground)' } : { color: 'rgb(56, 189, 248)' }}
              />
              <span>My Market</span>
            </Link>
          </nav>

          {/* Desktop Right Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/market/search"
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border transition-all text-xs font-semibold group"
              style={{
                backgroundColor: 'var(--athlon-input, #0E1612)',
                borderColor: 'var(--athlon-border, rgba(255, 255, 255, 0.08))',
                color: 'var(--athlon-text-muted, #94A3B8)',
              }}
              title="Search market"
            >
              <Search className="w-4 h-4 text-foreground/50 group-hover:text-primary transition-colors" />
              <span className="hidden xl:inline text-foreground/50">Search gear...</span>
            </Link>

            <Link
              href="/market/sell"
              className="flex items-center gap-1.5 text-sm font-black px-5 py-2.5 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg"
              style={{
                backgroundColor: 'var(--athlon-primary)',
                color: 'var(--athlon-primary-foreground, #000)',
                boxShadow: '0 4px 20px var(--athlon-primary-glow)',
              }}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Sell Gear</span>
            </Link>

            {/* Notification Bell */}
            <Link
              href={isAuthenticated ? '/home/notifications' : '/login?redirect=/home/notifications'}
              className="relative p-2.5 rounded-2xl border hover:border-primary/50 text-foreground/70 hover:text-foreground transition-all"
              style={{
                backgroundColor: 'var(--athlon-card)',
                borderColor: 'var(--athlon-border)',
              }}
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 ring-2 ring-background animate-pulse" />
            </Link>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════════════════
          2. MAIN CONTENT AREA
         ══════════════════════════════════════════════════════════════════════ */}
      <main className="flex-1 w-full max-w-full h-full md:h-auto overflow-y-auto md:overflow-visible overscroll-none touch-pan-y pb-28 md:pb-12 hide-scrollbar">
        {children}
      </main>

      {/* ══════════════════════════════════════════════════════════════════════
          3. PWA MOBILE BOTTOM NAVIGATION (hidden on md and above)
         ══════════════════════════════════════════════════════════════════════ */}
      <MarketBottomNav />
    </div>
  );
}
