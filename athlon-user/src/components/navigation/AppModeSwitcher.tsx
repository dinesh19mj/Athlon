'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Trophy, ShoppingBag, Sparkles, ArrowLeftRight, Zap } from 'lucide-react';
import { useAppModeStore } from '@/lib/store/useAppModeStore';
import { useAuthStore } from '@/lib/store/useAuthStore';

interface AppModeSwitcherProps {
  className?: string;
  showNotifications?: boolean;
}

export function AppModeSwitcher({ className = '' }: AppModeSwitcherProps) {
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
    if (pathname && !pathname.startsWith('/market')) {
      setLastAthlonPath(pathname);
    }
    setApplicationMode('MARKET');
    router.push('/market');
  };

  return (
    <div className={`w-full flex items-center justify-center select-none ${className}`}>
      {/* ─── ATHLON APEX DUAL-POD COCKPIT ─── */}
      <div className="w-full max-w-md flex items-center gap-2 p-1.5 rounded-[22px] bg-slate-200/40 dark:bg-black/40 backdrop-blur-xl border border-slate-300/40 dark:border-white/5 shadow-inner">
        
        {/* ═══ POD 1: ATHLON ARENA ═══ */}
        <button
          type="button"
          onClick={handleSelectAthlon}
          className={`group relative flex-1 flex items-center justify-between px-3 py-2 rounded-[18px] transition-all duration-300 cursor-pointer overflow-hidden ${
            isAthlon
              ? 'bg-white dark:bg-gradient-to-br dark:from-[#132219] dark:to-[#0c1611] text-slate-900 dark:text-white shadow-[0_8px_20px_-4px_rgba(34,197,94,0.2),0_2px_6px_rgba(0,0,0,0.04)] dark:shadow-[0_0_24px_-4px_rgba(34,197,94,0.35)] border border-emerald-500/30 dark:border-emerald-500/40 scale-[1.01]'
              : 'bg-white/40 dark:bg-white/[0.03] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/70 dark:hover:bg-white/[0.06] border border-transparent active:scale-[0.98]'
          }`}
          aria-label="Switch to Athlon Sports Mode"
        >
          {/* Active Top Edge Energy Neon Light */}
          {isAthlon && (
            <div className="absolute top-0 inset-x-3 h-[2px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-80" />
          )}

          <div className="flex items-center gap-2 min-w-0">
            {/* Trophy Icon with Radar Wave */}
            <div
              className={`relative w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 ${
                isAthlon
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 scale-105 shadow-xs'
                  : 'bg-black/5 dark:bg-white/5 text-slate-400 dark:text-slate-500 group-hover:scale-105'
              }`}
            >
              <Trophy className="w-4 h-4" strokeWidth={isAthlon ? 2.5 : 2} />
              {isAthlon && (
                <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
              )}
            </div>

            {/* Title & Status */}
            <div className="flex flex-col text-left leading-none min-w-0">
              <span className={`text-[13px] tracking-tight ${isAthlon ? 'font-black' : 'font-semibold'}`}>
                ATHLON
              </span>
              <span className={`text-[9px] tracking-wider uppercase font-bold mt-1 ${isAthlon ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
                {isAthlon ? 'ARENA' : 'SPORTS'}
              </span>
            </div>
          </div>

          {/* Active Pill Badge or Inactive Dot */}
          {isAthlon ? (
            <div className="shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[9px] font-black tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              LIVE
            </div>
          ) : (
            <div className="shrink-0 w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-slate-400 transition-colors" />
          )}
        </button>

        {/* ═══ KINETIC NEXUS CONNECTOR ═══ */}
        <div className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-white/70 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 border border-slate-200/50 dark:border-white/10 shadow-xs">
          <ArrowLeftRight className="w-3 h-3 transition-transform duration-300 hover:rotate-180" strokeWidth={2.2} />
        </div>

        {/* ═══ POD 2: MARKET VAULT ═══ */}
        <button
          type="button"
          onClick={handleSelectMarket}
          className={`group relative flex-1 flex items-center justify-between px-3 py-2 rounded-[18px] transition-all duration-300 cursor-pointer overflow-hidden ${
            isMarket
              ? 'bg-white dark:bg-gradient-to-br dark:from-[#132219] dark:to-[#0c1611] text-slate-900 dark:text-white shadow-[0_8px_20px_-4px_rgba(34,197,94,0.2),0_2px_6px_rgba(0,0,0,0.04)] dark:shadow-[0_0_24px_-4px_rgba(34,197,94,0.35)] border border-emerald-500/30 dark:border-emerald-500/40 scale-[1.01]'
              : 'bg-white/40 dark:bg-white/[0.03] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/70 dark:hover:bg-white/[0.06] border border-transparent active:scale-[0.98]'
          }`}
          aria-label="Switch to Athlon Market Mode"
        >
          {/* Active Top Edge Energy Neon Light */}
          {isMarket && (
            <div className="absolute top-0 inset-x-3 h-[2px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-80" />
          )}

          <div className="flex items-center gap-2 min-w-0">
            {/* Shopping Bag Icon with Sparkle */}
            <div
              className={`relative w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 ${
                isMarket
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 scale-105 shadow-xs'
                  : 'bg-black/5 dark:bg-white/5 text-slate-400 dark:text-slate-500 group-hover:scale-105'
              }`}
            >
              <ShoppingBag className="w-4 h-4" strokeWidth={isMarket ? 2.5 : 2} />
              {isMarket && (
                <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
              )}
            </div>

            {/* Title & Status */}
            <div className="flex flex-col text-left leading-none min-w-0">
              <span className={`text-[13px] tracking-tight ${isMarket ? 'font-black text-emerald-600 dark:text-emerald-400' : 'font-semibold'}`}>
                MARKET
              </span>
              <span className={`text-[9px] tracking-wider uppercase font-bold mt-1 ${isMarket ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
                {isMarket ? 'PRO GEAR' : 'STORE'}
              </span>
            </div>
          </div>

          {/* Active Pill Badge or Inactive Dot */}
          {isMarket ? (
            <div className="shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[9px] font-black tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              HOT
            </div>
          ) : (
            <div className="shrink-0 w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-slate-400 transition-colors" />
          )}
        </button>

      </div>
    </div>
  );
}

export default AppModeSwitcher;
