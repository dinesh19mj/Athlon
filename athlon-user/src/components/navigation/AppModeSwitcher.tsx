'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Trophy, ShoppingBag, Sparkles } from 'lucide-react';
import { useAppModeStore } from '@/lib/store/useAppModeStore';
import { useAuthStore } from '@/lib/store/useAuthStore';

interface AppModeSwitcherProps {
  className?: string;
  showNotifications?: boolean; // Retained for backwards-compatibility; notification icon removed per user design request
}

export function AppModeSwitcher({
  className = '',
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

  return (
    <div className={`w-full flex items-center justify-center select-none ${className}`}>
      {/* ─── Modern Fluid Capsule Segment Control ─── */}
      <div
        role="tablist"
        aria-label="Section Selector"
        className="relative w-full max-w-sm sm:max-w-md p-1.5 rounded-full flex items-center backdrop-blur-xl transition-all duration-300 bg-slate-100/90 dark:bg-[#0C1511]/90 border border-slate-200/80 dark:border-emerald-500/20 shadow-[inset_0_1px_3px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)]"
      >
        {/* Animated Fluid Gliding Indicator */}
        <div
          className={`absolute top-1.5 bottom-1.5 rounded-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] bg-white dark:bg-[#14231B] border border-black/[0.04] dark:border-emerald-500/35 shadow-[0_4px_14px_-2px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.04)] dark:shadow-[0_0_18px_-2px_rgba(34,197,94,0.3)] ${
            isAthlon
              ? 'left-1.5 w-[calc(50%-6px)]'
              : 'left-[calc(50%+3px)] w-[calc(50%-6px)]'
          }`}
        />

        {/* 🏆 ATHLON MODE TAB */}
        <button
          type="button"
          role="tab"
          aria-selected={isAthlon}
          onClick={handleSelectAthlon}
          className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-full transition-all duration-200 cursor-pointer active:scale-[0.98] ${
            isAthlon
              ? 'text-slate-900 dark:text-white font-black'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium'
          }`}
          aria-label="Switch to Athlon Sports Mode"
        >
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
              isAthlon
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 scale-105 shadow-xs'
                : 'bg-black/5 dark:bg-white/5 text-slate-400 dark:text-slate-500'
            }`}
          >
            <Trophy
              className="w-3.5 h-3.5 shrink-0"
              strokeWidth={isAthlon ? 2.5 : 2}
            />
          </div>

          <div className="flex items-center gap-1.5 leading-none">
            <span className={`text-[13px] tracking-tight ${isAthlon ? 'font-black' : 'font-semibold'}`}>
              ATHLON
            </span>
            {isAthlon && (
              <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                PLAY
              </span>
            )}
          </div>
        </button>

        {/* 🛍 MARKET MODE TAB */}
        <button
          type="button"
          role="tab"
          aria-selected={isMarket}
          onClick={handleSelectMarket}
          className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-full transition-all duration-200 cursor-pointer active:scale-[0.98] ${
            isMarket
              ? 'text-slate-900 dark:text-white font-black'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium'
          }`}
          aria-label="Switch to Athlon Market Mode"
        >
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
              isMarket
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 scale-105 shadow-xs'
                : 'bg-black/5 dark:bg-white/5 text-slate-400 dark:text-slate-500'
            }`}
          >
            <ShoppingBag
              className="w-3.5 h-3.5 shrink-0"
              strokeWidth={isMarket ? 2.5 : 2}
            />
          </div>

          <div className="flex items-center gap-1.5 leading-none">
            <span className={`text-[13px] tracking-tight ${isMarket ? 'font-black text-emerald-600 dark:text-emerald-400' : 'font-semibold'}`}>
              MARKET
            </span>
            {isMarket ? (
              <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                GEAR
              </span>
            ) : (
              <span className="hidden sm:inline-block text-[9px] font-bold text-emerald-600/70 dark:text-emerald-400/70 uppercase tracking-wider">
                SHOP
              </span>
            )}
          </div>
        </button>
      </div>
    </div>
  );
}

export default AppModeSwitcher;
