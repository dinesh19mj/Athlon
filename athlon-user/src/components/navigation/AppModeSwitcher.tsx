'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Trophy, ShoppingBag, Bell } from 'lucide-react';
import Link from 'next/link';
import { useAppModeStore } from '@/lib/store/useAppModeStore';
import { useAuthStore } from '@/lib/store/useAuthStore';

interface AppModeSwitcherProps {
  className?: string;
  showNotifications?: boolean;
}

export function AppModeSwitcher({
  className = '',
  showNotifications = true,
}: AppModeSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  const { lastAthlonPath, setApplicationMode, setLastAthlonPath } = useAppModeStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isMarket = pathname?.startsWith('/market');
  const isAthlon = !isMarket;

  // Track the last visited ATHLON route whenever on an Athlon page
  useEffect(() => {
    if (pathname && !pathname.startsWith('/market')) {
      setLastAthlonPath(pathname);
    }
  }, [pathname, setLastAthlonPath]);

  const handleSelectAthlon = () => {
    if (isAthlon) {
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }
    setApplicationMode('ATHLON');
    const target = lastAthlonPath && !lastAthlonPath.startsWith('/market')
      ? lastAthlonPath
      : (isAuthenticated ? '/home' : '/');
    router.push(target);
  };

  const handleSelectMarket = () => {
    if (isMarket) {
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }
    // Remember current path before leaving Athlon mode
    if (pathname && !pathname.startsWith('/market')) {
      setLastAthlonPath(pathname);
    }
    setApplicationMode('MARKET');
    router.push('/market');
  };

  const notificationsHref = isAuthenticated ? '/home/notifications' : '/login?redirect=/home/notifications';

  return (
    <div className={`w-full flex items-center justify-between gap-3 select-none ${className}`}>
      {/* ─── Segmented Mode Pill Switcher ─── */}
      <div
        className="flex-1 max-w-sm flex items-center p-1 rounded-full border shadow-inner backdrop-blur-md transition-all"
        style={{
          backgroundColor: 'var(--athlon-surface, rgba(15, 23, 42, 0.75))',
          borderColor: 'var(--athlon-border, rgba(255, 255, 255, 0.08))',
        }}
      >
        {/* 🏆 ATHLON MODE BUTTON */}
        <button
          type="button"
          onClick={handleSelectAthlon}
          className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-full transition-all duration-200 cursor-pointer active:scale-95 ${
            isAthlon
              ? 'border shadow-md'
              : 'opacity-65 hover:opacity-90 border-transparent hover:bg-white/5'
          }`}
          style={{
            backgroundColor: isAthlon ? 'var(--athlon-card, #131E18)' : 'transparent',
            borderColor: isAthlon ? 'var(--athlon-primary, #22C55E)' : 'transparent',
            boxShadow: isAthlon
              ? '0 0 16px -2px var(--athlon-primary-glow, rgba(34, 197, 94, 0.35)), inset 0 1px 1px rgba(255, 255, 255, 0.15)'
              : 'none',
          }}
          aria-label="Switch to Athlon Sports Mode"
        >
          <Trophy
            className={`w-4 h-4 shrink-0 transition-colors ${
              isAthlon ? 'text-primary' : 'text-foreground/60'
            }`}
            style={{ color: isAthlon ? 'var(--athlon-primary)' : undefined }}
            strokeWidth={isAthlon ? 2.5 : 2}
          />
          <div className="flex flex-col text-left leading-none">
            <span
              className={`text-[12px] font-black tracking-tight ${
                isAthlon ? 'text-primary' : 'text-foreground'
              }`}
              style={{ color: isAthlon ? 'var(--athlon-primary)' : undefined }}
            >
              ATHLON
            </span>
            <span className="text-[9px] font-medium text-foreground/50 tracking-tight mt-0.5">
              Play • Compete
            </span>
          </div>
        </button>

        {/* 🛍 MARKET MODE BUTTON */}
        <button
          type="button"
          onClick={handleSelectMarket}
          className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-full transition-all duration-200 cursor-pointer active:scale-95 ${
            isMarket
              ? 'border shadow-md'
              : 'opacity-65 hover:opacity-90 border-transparent hover:bg-white/5'
          }`}
          style={{
            backgroundColor: isMarket ? 'var(--athlon-card, #131E18)' : 'transparent',
            borderColor: isMarket ? 'var(--athlon-primary, #22C55E)' : 'transparent',
            boxShadow: isMarket
              ? '0 0 16px -2px var(--athlon-primary-glow, rgba(34, 197, 94, 0.35)), inset 0 1px 1px rgba(255, 255, 255, 0.15)'
              : 'none',
          }}
          aria-label="Switch to Athlon Market Mode"
        >
          <ShoppingBag
            className={`w-4 h-4 shrink-0 transition-colors ${
              isMarket ? 'text-primary' : 'text-foreground/60'
            }`}
            style={{ color: isMarket ? 'var(--athlon-primary)' : undefined }}
            strokeWidth={isMarket ? 2.5 : 2}
          />
          <div className="flex flex-col text-left leading-none">
            <span
              className={`text-[12px] font-black tracking-tight ${
                isMarket ? 'text-primary' : 'text-foreground'
              }`}
              style={{ color: isMarket ? 'var(--athlon-primary)' : undefined }}
            >
              MARKET
            </span>
            <span className="text-[9px] font-medium text-foreground/50 tracking-tight mt-0.5">
              Buy • Sell
            </span>
          </div>
        </button>
      </div>

      {/* ─── Notification Bell ─── */}
      {showNotifications && (
        <Link
          href={notificationsHref}
          className="relative p-2.5 rounded-full border border-border hover:border-primary/50 bg-card hover:bg-surface text-foreground/80 hover:text-foreground transition-all duration-200 active:scale-95 shrink-0 shadow-sm"
          style={{
            backgroundColor: 'var(--athlon-card)',
            borderColor: 'var(--athlon-border)',
          }}
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4 text-foreground/80" strokeWidth={2} />
          {/* Notification Alert Dot */}
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 ring-2 ring-background animate-pulse" />
        </Link>
      )}
    </div>
  );
}

export default AppModeSwitcher;
