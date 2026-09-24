'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShoppingBag,
  LayoutGrid,
  Plus,
  Heart,
  Store,
} from 'lucide-react';
import { useAthlonTheme } from '@/hooks/use-athlon-theme';

export function MarketBottomNav() {
  const pathname = usePathname();
  const { themeKey } = useAthlonTheme();

  const isMarketHome = pathname === '/market';
  const isCategories = pathname?.startsWith('/market/categories');
  const isSell = pathname?.startsWith('/market/sell');
  const isWishlist = pathname?.startsWith('/market/wishlist');
  const isMyMarket = pathname?.startsWith('/market/my') || pathname?.startsWith('/market/manage');

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 h-16 backdrop-blur-xl border-t z-40 px-4 flex items-center justify-around max-w-lg mx-auto fixed-bottom-nav"
      style={{
        backgroundColor: 'var(--athlon-navigation, #070D0A)',
        borderColor: 'var(--athlon-border, rgba(255, 255, 255, 0.08))',
        transform: 'translate3d(0, 0, 0)',
        WebkitTransform: 'translate3d(0, 0, 0)',
      }}
    >
      {/* 1. Market Home */}
      <Link
        href="/market"
        className={`flex flex-col items-center justify-center gap-0.5 w-14 group transition-opacity ${
          isMarketHome ? 'opacity-100' : 'opacity-70 hover:opacity-100'
        }`}
      >
        <ShoppingBag
          className={`w-5 h-5 transition-transform group-hover:scale-110 ${
            isMarketHome ? 'text-primary' : 'text-foreground/60'
          }`}
          style={{ color: isMarketHome ? 'var(--athlon-primary)' : 'var(--athlon-icon-muted, rgba(255, 255, 255, 0.6))' }}
          strokeWidth={isMarketHome ? 2.5 : 2}
        />
        <span
          className={`text-[10px] font-bold leading-tight tracking-tight ${
            isMarketHome ? 'text-primary' : ''
          }`}
          style={{ color: isMarketHome ? 'var(--athlon-primary)' : 'var(--athlon-text-muted, rgba(255, 255, 255, 0.5))' }}
        >
          Market
        </span>
      </Link>

      {/* 2. Categories */}
      <Link
        href="/market/categories"
        className={`flex flex-col items-center justify-center gap-0.5 w-14 group transition-opacity ${
          isCategories ? 'opacity-100' : 'opacity-70 hover:opacity-100'
        }`}
      >
        <LayoutGrid
          className={`w-5 h-5 transition-transform group-hover:scale-110 ${
            isCategories ? 'text-primary' : 'text-foreground/60'
          }`}
          style={{ color: isCategories ? 'var(--athlon-primary)' : 'var(--athlon-icon-muted, rgba(255, 255, 255, 0.6))' }}
          strokeWidth={isCategories ? 2.5 : 2}
        />
        <span
          className={`text-[10px] font-bold leading-tight tracking-tight ${
            isCategories ? 'text-primary' : ''
          }`}
          style={{ color: isCategories ? 'var(--athlon-primary)' : 'var(--athlon-text-muted, rgba(255, 255, 255, 0.5))' }}
        >
          Categories
        </span>
      </Link>

      {/* 3. Prominent Elevated Circular SELL Button */}
      <div className="relative -top-5 flex items-center justify-center">
        <Link
          href="/market/sell"
          className="w-[56px] h-[56px] rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all border-[3.5px] group relative overflow-hidden shadow-2xl"
          style={{
            backgroundColor: 'var(--athlon-primary, #22C55E)',
            borderColor: 'var(--athlon-navigation, #070D0A)',
            boxShadow:
              '0 8px 24px -2px var(--athlon-primary-glow, rgba(34, 197, 94, 0.5)), 0 4px 12px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.45), inset 0 -3px 6px rgba(0,0,0,0.3)',
          }}
          aria-label="Sell on Athlon Market"
        >
          {/* Glass Specular Highlight Arc */}
          <div className="absolute inset-x-1 top-0 h-[45%] rounded-t-full bg-gradient-to-b from-white/45 via-white/10 to-transparent pointer-events-none" />

          <Plus
            className="w-7 h-7 text-black drop-shadow-[0_1px_2px_rgba(255,255,255,0.5)] relative z-10 transition-transform group-hover:rotate-90 group-hover:scale-110"
            strokeWidth={3}
          />
        </Link>
      </div>

      {/* 4. Wishlist */}
      <Link
        href="/market/wishlist"
        className={`flex flex-col items-center justify-center gap-0.5 w-14 group transition-opacity ${
          isWishlist ? 'opacity-100' : 'opacity-70 hover:opacity-100'
        }`}
      >
        <Heart
          className={`w-5 h-5 transition-transform group-hover:scale-110 ${
            isWishlist ? 'text-primary fill-primary' : 'text-foreground/60'
          }`}
          style={{
            color: isWishlist ? 'var(--athlon-primary)' : 'var(--athlon-icon-muted, rgba(255, 255, 255, 0.6))',
            fill: isWishlist ? 'var(--athlon-primary)' : 'none',
          }}
          strokeWidth={isWishlist ? 2.5 : 2}
        />
        <span
          className={`text-[10px] font-bold leading-tight tracking-tight ${
            isWishlist ? 'text-primary' : ''
          }`}
          style={{ color: isWishlist ? 'var(--athlon-primary)' : 'var(--athlon-text-muted, rgba(255, 255, 255, 0.5))' }}
        >
          Wishlist
        </span>
      </Link>

      {/* 5. My Market */}
      <Link
        href="/market/my"
        className={`flex flex-col items-center justify-center gap-0.5 w-14 group transition-opacity ${
          isMyMarket ? 'opacity-100' : 'opacity-70 hover:opacity-100'
        }`}
      >
        <Store
          className={`w-5 h-5 transition-transform group-hover:scale-110 ${
            isMyMarket ? 'text-primary' : 'text-foreground/60'
          }`}
          style={{ color: isMyMarket ? 'var(--athlon-primary)' : 'var(--athlon-icon-muted, rgba(255, 255, 255, 0.6))' }}
          strokeWidth={isMyMarket ? 2.5 : 2}
        />
        <span
          className={`text-[10px] font-bold leading-tight tracking-tight ${
            isMyMarket ? 'text-primary' : ''
          }`}
          style={{ color: isMyMarket ? 'var(--athlon-primary)' : 'var(--athlon-text-muted, rgba(255, 255, 255, 0.5))' }}
        >
          My Market
        </span>
      </Link>
    </nav>
  );
}

export default MarketBottomNav;
