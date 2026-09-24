'use client';

import React, { useEffect, useState } from 'react';
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

  const { lastAthlonPath, setApplicationMode, setLastAthlonPath } = useAppModeStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const isMarket = pathname?.startsWith('/market') ?? false;
  const isAthlon = !isMarket;

  useEffect(() => {
    setMounted(true);
  }, []);

  /**
   * Remember the last ATHLON route whenever browsing within Athlon mode.
   */
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
    const target =
      lastAthlonPath && !lastAthlonPath.startsWith('/market')
        ? lastAthlonPath
        : isAuthenticated
          ? '/home'
          : '/';

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
      {/* ═══ ULTRA-MODERN LUXURY COCKPIT CHASSIS ═══ */}
      <div
        className={`
          relative w-full max-w-[470px] sm:max-w-[490px] h-[70px] sm:h-[74px] p-[5px]
          rounded-[26px] flex items-center justify-between
          bg-[#070d0f]/90 backdrop-blur-2xl
          border border-white/[0.09]
          transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${
            isAthlon
              ? 'shadow-[0_12px_45px_-8px_rgba(0,255,128,0.22),0_0_0_1px_rgba(0,255,128,0.15),inset_0_1px_1px_rgba(255,255,255,0.15)]'
              : 'shadow-[0_12px_45px_-8px_rgba(16,185,129,0.22),0_0_0_1px_rgba(16,185,129,0.18),inset_0_1px_1px_rgba(255,255,255,0.15)]'
          }
        `}
      >
        {/* Subtle Cockpit HUD Ambient Background Grid & Sheen */}
        <div className="absolute inset-0 rounded-[25px] overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.02] via-transparent to-white/[0.04]" />
          <div className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="absolute bottom-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
        </div>

        {/* ═══ FLOATING 3D ACTIVE SLIDER POD ═══ */}
        <div
          className={`
            absolute top-[5px] bottom-[5px] w-[calc(50%-5px)] rounded-[21px]
            pointer-events-none transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
            z-0 overflow-hidden
            ${
              isAthlon
                ? 'translate-x-0 bg-gradient-to-b from-emerald-500/[0.22] via-emerald-950/[0.55] to-black/85 border border-emerald-400/40 shadow-[0_0_28px_rgba(0,255,128,0.3),inset_0_1px_2px_rgba(255,255,255,0.35),inset_0_-2px_6px_rgba(0,0,0,0.8)]'
                : 'translate-x-[calc(100%+0px)] bg-gradient-to-b from-teal-500/[0.22] via-emerald-950/[0.55] to-black/85 border border-teal-400/40 shadow-[0_0_28px_rgba(20,184,166,0.3),inset_0_1px_2px_rgba(255,255,255,0.35),inset_0_-2px_6px_rgba(0,0,0,0.8)]'
            }
          `}
        >
          {/* Laser Bevel Rim on the active slider */}
          <div className="absolute top-0 left-4 right-4 h-[1.5px] bg-gradient-to-r from-transparent via-emerald-300 to-transparent opacity-80" />
          <div className="absolute bottom-0 left-6 right-6 h-[1.5px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
          {/* Ambient Internal Glow Orb */}
          <div
            className={`
              absolute -top-6 left-1/2 -translate-x-1/2 w-32 h-16 rounded-full blur-xl pointer-events-none
              ${isAthlon ? 'bg-emerald-400/30' : 'bg-teal-400/30'}
            `}
          />
        </div>

        {/* ═══ ATHLON BAY (LEFT) ═══ */}
        <button
          type="button"
          onClick={handleSelectAthlon}
          className="group relative z-10 w-1/2 h-full flex items-center justify-between px-2.5 sm:px-3.5 cursor-pointer rounded-[21px] active:scale-[0.985] transition-all duration-300"
          aria-label="Switch to Athlon Mode"
          aria-current={isAthlon ? 'page' : undefined}
        >
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            {/* 3D Glass Icon Chamber */}
            <div
              className={`
                relative w-[44px] h-[44px] sm:w-[48px] sm:h-[48px] rounded-[16px] sm:rounded-[18px] shrink-0
                flex items-center justify-center overflow-hidden transition-all duration-500
                ${
                  isAthlon
                    ? 'bg-gradient-to-br from-white/30 via-emerald-500/25 to-black/80 border border-white/50 shadow-[0_0_18px_rgba(0,255,128,0.55),inset_0_2px_4px_rgba(255,255,255,0.7),inset_0_-3px_5px_rgba(0,0,0,0.7)] backdrop-blur-md'
                    : 'bg-white/[0.04] border border-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] group-hover:bg-white/[0.07] group-hover:border-white/[0.14]'
                }
              `}
            >
              {/* Top Glass Specular Arc */}
              {isAthlon && (
                <div className="absolute top-1 left-1.5 right-1.5 h-3 rounded-full bg-gradient-to-b from-white/90 via-white/30 to-transparent pointer-events-none" />
              )}

              {/* Glowing Trophy Hologram */}
              <svg
                className={`w-[22px] h-[22px] sm:w-[24px] sm:h-[24px] transition-all duration-300 ${
                  isAthlon
                    ? 'text-[#00FF80] drop-shadow-[0_0_8px_rgba(0,255,128,0.95)]'
                    : 'text-slate-400 group-hover:text-slate-200'
                }`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                <path d="M4 22h16" />
                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                {/* 5-pointed Star inside Cup */}
                <polygon
                  points="12 5.5 12.8 7.2 14.7 7.4 13.3 8.7 13.7 10.6 12 9.7 10.3 10.6 10.7 8.7 9.3 7.4 11.2 7.2"
                  fill={isAthlon ? '#FFFFFF' : 'currentColor'}
                  stroke="none"
                />
              </svg>
            </div>

            {/* Typography Stack */}
            <div className="flex flex-col text-left leading-none min-w-0">
              <span
                className={`text-[15px] sm:text-[16px] font-black tracking-[0.12em] transition-colors duration-300 ${
                  isAthlon
                    ? 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]'
                    : 'text-slate-400 group-hover:text-slate-200'
                }`}
              >
                ATHLON
              </span>
              <div className="flex items-center gap-1.5 mt-1.5">
                {isAthlon && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00FF80] shadow-[0_0_6px_#00FF80] animate-pulse" />
                )}
                <span
                  className={`text-[10.5px] sm:text-[11px] font-medium tracking-wide transition-colors duration-300 ${
                    isAthlon ? 'text-emerald-300 font-semibold' : 'text-slate-500 group-hover:text-slate-400'
                  }`}
                >
                  Play • Compete
                </span>
              </div>
              {/* Active Laser Underline Capsule */}
              {isAthlon && (
                <div className="h-[2.5px] w-[50px] rounded-full mt-1.5 bg-gradient-to-r from-white via-[#00FF80] to-emerald-400 shadow-[0_0_8px_#00FF80] transition-all duration-300" />
              )}
            </div>
          </div>

          {/* Micro Telemetry Tag */}
          <div className="hidden sm:flex flex-col items-end pr-1 opacity-40 pointer-events-none font-mono text-[8px] tracking-widest text-slate-300">
            <span>01</span>
            <span className={isAthlon ? 'text-emerald-400' : ''}>ARENA</span>
          </div>
        </button>

        {/* Center Precision Cockpit Divider (Visible When Transitioning) */}
        <div className="h-6 w-[1px] bg-gradient-to-b from-transparent via-white/10 to-transparent pointer-events-none z-10" />

        {/* ═══ MARKET BAY (RIGHT) ═══ */}
        <button
          type="button"
          onClick={handleSelectMarket}
          className="group relative z-10 w-1/2 h-full flex items-center justify-between px-2.5 sm:px-3.5 cursor-pointer rounded-[21px] active:scale-[0.985] transition-all duration-300"
          aria-label="Switch to Market Mode"
          aria-current={isMarket ? 'page' : undefined}
        >
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            {/* 3D Glass Icon Chamber */}
            <div
              className={`
                relative w-[44px] h-[44px] sm:w-[48px] sm:h-[48px] rounded-[16px] sm:rounded-[18px] shrink-0
                flex items-center justify-center overflow-hidden transition-all duration-500
                ${
                  isMarket
                    ? 'bg-gradient-to-br from-white/30 via-teal-500/25 to-black/80 border border-white/50 shadow-[0_0_18px_rgba(20,184,166,0.55),inset_0_2px_4px_rgba(255,255,255,0.7),inset_0_-3px_5px_rgba(0,0,0,0.7)] backdrop-blur-md'
                    : 'bg-white/[0.04] border border-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] group-hover:bg-white/[0.07] group-hover:border-white/[0.14]'
                }
              `}
            >
              {isMarket && (
                <div className="absolute top-1 left-1.5 right-1.5 h-3 rounded-full bg-gradient-to-b from-white/90 via-white/30 to-transparent pointer-events-none" />
              )}

              {/* Glowing Market Tote / Vault Icon */}
              <svg
                className={`w-[22px] h-[22px] sm:w-[24px] sm:h-[24px] transition-all duration-300 ${
                  isMarket
                    ? 'text-[#2DD4BF] drop-shadow-[0_0_8px_rgba(45,212,191,0.95)]'
                    : 'text-slate-400 group-hover:text-slate-200'
                }`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
                <path d="M10 14c.8.6 1.8.8 2 .8s1.2-.2 2-.8" strokeWidth="1.8" />
              </svg>
            </div>

            {/* Typography Stack */}
            <div className="flex flex-col text-left leading-none min-w-0">
              <span
                className={`text-[15px] sm:text-[16px] font-black tracking-[0.12em] transition-colors duration-300 ${
                  isMarket
                    ? 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]'
                    : 'text-slate-400 group-hover:text-slate-200'
                }`}
              >
                MARKET
              </span>
              <div className="flex items-center gap-1.5 mt-1.5">
                {isMarket && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2DD4BF] shadow-[0_0_6px_#2DD4BF] animate-pulse" />
                )}
                <span
                  className={`text-[10.5px] sm:text-[11px] font-medium tracking-wide transition-colors duration-300 ${
                    isMarket ? 'text-teal-300 font-semibold' : 'text-slate-500 group-hover:text-slate-400'
                  }`}
                >
                  Buy • Sell
                </span>
              </div>
              {/* Active Laser Underline Capsule */}
              {isMarket && (
                <div className="h-[2.5px] w-[50px] rounded-full mt-1.5 bg-gradient-to-r from-white via-[#2DD4BF] to-teal-400 shadow-[0_0_8px_#2DD4BF] transition-all duration-300" />
              )}
            </div>
          </div>

          {/* Micro Telemetry Tag */}
          <div className="hidden sm:flex flex-col items-end pr-1 opacity-40 pointer-events-none font-mono text-[8px] tracking-widest text-slate-300">
            <span>02</span>
            <span className={isMarket ? 'text-teal-400' : ''}>EXCHANGE</span>
          </div>
        </button>
      </div>
    </div>
  );
}

export default AppModeSwitcher;