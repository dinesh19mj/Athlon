'use client';

import React, { useEffect, useState, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { useAppModeStore } from '@/lib/store/useAppModeStore';
import { useAuthStore } from '@/lib/store/useAuthStore';

interface AppModeSwitcherProps {
  className?: string;
  showNotifications?: boolean;
}

export function AppModeSwitcher({ className = '' }: AppModeSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    lastAthlonPath,
    setApplicationMode,
    setLastAthlonPath,
    showModeSwitcher,
    athlonActive,
    marketActive,
    fetchModuleConfig,
    isConfigLoaded,
  } = useAppModeStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const isMarket = pathname?.startsWith('/market') ?? false;
  const isAthlon = !isMarket;

  // Fetch backend dynamic module enablement configuration
  useEffect(() => {
    setMounted(true);
    fetchModuleConfig();
  }, [fetchModuleConfig]);

  /**
   * Remember the last ATHLON route whenever browsing within Athlon mode.
   */
  useEffect(() => {
    if (pathname && !pathname.startsWith('/market')) {
      setLastAthlonPath(pathname);
    }
  }, [pathname, setLastAthlonPath]);

  // Enforce route enforcement if only one module is active
  useEffect(() => {
    if (!isConfigLoaded) return;
    if (athlonActive && !marketActive && isMarket) {
      router.replace('/home');
    } else if (
      !athlonActive &&
      marketActive &&
      isAthlon &&
      pathname !== '/login' &&
      pathname !== '/register' &&
      pathname !== '/'
    ) {
      router.replace('/market');
    }
  }, [isConfigLoaded, athlonActive, marketActive, isMarket, isAthlon, pathname, router]);

  // If only one app mode is active (ATHLON only or MARKET only), do not render the switcher
  if (!showModeSwitcher) {
    return null;
  }

  const handleSelectAthlon = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (isAthlon) {
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    setApplicationMode('ATHLON');
    const target =
      lastAthlonPath && !lastAthlonPath.startsWith('/market')
        ? lastAthlonPath
        : isAuthenticated
          ? '/home'
          : '/';

    router.push(target);
  };

  const handleSelectMarket = (e?: React.MouseEvent) => {
    e?.stopPropagation();
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
    <div
      ref={containerRef}
      className={`w-full flex items-center justify-center select-none transition-all duration-300 ${className}`}
    >
      {/* ══════════════════════════════════════════════════════════════════════
          HOTSTAR DUAL-MODE BRAND SWITCHER (ATHLON vs MARKET)
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="w-full max-w-[420px] flex items-center gap-2 sm:gap-2.5 px-1 sm:px-0">
        {/* ═══ ATHLON BAY ═══ */}
        <button
          type="button"
          onClick={handleSelectAthlon}
          suppressHydrationWarning
          className={`
            relative flex-1 h-[42px] sm:h-[46px] rounded-[15px] sm:rounded-[17px]
            flex items-center justify-center gap-2.5 sm:gap-3 px-3.5 sm:px-4 cursor-pointer
            text-[12.5px] sm:text-[13.5px] uppercase
            transition-all duration-300 ease-out active:scale-[0.96]
            overflow-hidden group
            ${isAthlon ? 'app-mode-active-pill' : 'app-mode-inactive-pill'}
          `}
          aria-label="Switch to Athlon"
          aria-current={isAthlon ? 'page' : undefined}
        >
          {/* Top Glass Specular Arc Sheen */}
          <div className="absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-white/25 to-transparent pointer-events-none rounded-t-[15px]" />

          {/* Original Athlon Trophy Icon */}
          <svg
            className={`w-[17px] h-[17px] sm:w-[19px] sm:h-[19px] shrink-0 transition-all duration-300 group-hover:scale-115 ${
              isAthlon
                ? 'text-white scale-105'
                : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white'
            }`}
            style={
              isAthlon
                ? {
                    filter: 'drop-shadow(0 0 8px var(--athlon-primary, #54AC68))',
                  }
                : undefined
            }
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
            <path d="M4 22h16" />
            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
            <polygon
              points="12 5.5 12.8 7.2 14.7 7.4 13.3 8.7 13.7 10.6 12 9.7 10.3 10.6 10.7 8.7 9.3 7.4 11.2 7.2"
              fill="currentColor"
              stroke="none"
            />
          </svg>

          <span
            className={`truncate transition-all uppercase leading-none ${
              isAthlon
                ? 'font-black tracking-[0.12em] text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]'
                : 'font-bold tracking-[0.10em] text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white'
            }`}
          >
            ATHLON
          </span>
        </button>

        {/* ═══ MARKET BAY ═══ */}
        <button
          type="button"
          onClick={handleSelectMarket}
          suppressHydrationWarning
          className={`
            relative flex-1 h-[42px] sm:h-[46px] rounded-[15px] sm:rounded-[17px]
            flex items-center justify-center gap-2.5 sm:gap-3 px-3.5 sm:px-4 cursor-pointer
            text-[12.5px] sm:text-[13.5px] uppercase
            transition-all duration-300 ease-out active:scale-[0.96]
            overflow-hidden group
            ${isMarket ? 'app-mode-active-pill' : 'app-mode-inactive-pill'}
          `}
          aria-label="Switch to Market"
          aria-current={isMarket ? 'page' : undefined}
        >
          {/* Top Glass Specular Arc Sheen */}
          <div className="absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-white/30 to-transparent pointer-events-none rounded-t-[15px]" />

          {/* Original Market Tote / Bag Icon */}
          <svg
            className={`w-[17px] h-[17px] sm:w-[19px] sm:h-[19px] shrink-0 transition-all duration-300 group-hover:scale-115 ${
              isMarket
                ? 'text-white scale-105'
                : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white'
            }`}
            style={
              isMarket
                ? {
                    filter: 'drop-shadow(0 0 8px var(--athlon-primary, #54AC68))',
                  }
                : undefined
            }
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
            <path d="M3 6h18" />
            <path d="M16 10a4 4 0 0 1-8 0" />
            <path d="M10 14c.8.6 1.8.8 2 .8s1.2-.2 2-.8" strokeWidth="1.8" />
          </svg>

          <span
            className={`truncate transition-all uppercase leading-none ${
              isMarket
                ? 'font-black tracking-[0.12em] text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]'
                : 'font-bold tracking-[0.10em] text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white'
            }`}
          >
            MARKET
          </span>
        </button>
      </div>
    </div>
  );
}

export default AppModeSwitcher;