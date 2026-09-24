'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { useAppModeStore } from '@/lib/store/useAppModeStore';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useAthlonTheme } from '@/hooks/use-athlon-theme';

interface AppModeSwitcherProps {
  className?: string;
  showNotifications?: boolean;
}

export function AppModeSwitcher({ className = '' }: AppModeSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [, setMounted] = useState(false);

  // Theme integration: Reactively bind selected theme color and dark/light mode
  const { theme, mode, themeKey } = useAthlonTheme();
  const isDark = mode === 'dark';
  const primary = theme?.colors?.primary || '#54AC68';
  const primaryLight = theme?.colors?.primaryLight || primary;

  const { lastAthlonPath, setApplicationMode, setLastAthlonPath } = useAppModeStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const isMarket = pathname?.startsWith('/market') ?? false;
  const isAthlon = !isMarket;

  // Selected Theme Color Mapping for Mode Switcher
  // When Athlon is active, use the user's selected primary theme color.
  // When Market is active, use a theme-coordinated luxury exchange color.
  const activeColor = isAthlon
    ? primary
    : themeKey === 'algae'
      ? (isDark ? '#2DD4BF' : '#0D9488')
      : primary;

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
      {/* ═══ LUXURY COCKPIT CHASSIS (DYNAMIC LIGHT / DARK & THEME COLOR) ═══ */}
      <div
        className={`
          relative w-full max-w-[470px] sm:max-w-[490px] h-[70px] sm:h-[74px] p-[5px]
          rounded-[26px] flex items-center justify-between
          backdrop-blur-2xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${
            isDark
              ? 'bg-[#070d0f]/90 border border-white/[0.09]'
              : 'bg-white/85 border border-slate-200/90'
          }
        `}
        style={{
          boxShadow: isDark
            ? `0 14px 45px -8px ${activeColor}30, 0 0 0 1px ${activeColor}20, inset 0 1px 1px rgba(255, 255, 255, 0.15)`
            : `0 10px 32px -6px rgba(0, 0, 0, 0.07), 0 0 0 1px rgba(0, 0, 0, 0.03), 0 12px 35px -8px ${activeColor}25, inset 0 1px 1px rgba(255, 255, 255, 0.9)`,
        }}
      >
        {/* Subtle HUD Ambient Background Sheens */}
        <div className="absolute inset-0 rounded-[25px] overflow-hidden pointer-events-none">
          <div
            className={`absolute inset-0 ${
              isDark
                ? 'bg-gradient-to-tr from-white/[0.02] via-transparent to-white/[0.04]'
                : 'bg-gradient-to-tr from-black/[0.01] via-transparent to-black/[0.02]'
            }`}
          />
          <div
            className="absolute top-0 left-10 right-10 h-[1px]"
            style={{
              background: isDark
                ? 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)'
                : 'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.08) 50%, transparent 100%)',
            }}
          />
          <div
            className="absolute bottom-0 left-10 right-10 h-[1px]"
            style={{
              background: `linear-gradient(90deg, transparent 0%, ${activeColor}40 50%, transparent 100%)`,
            }}
          />
        </div>

        {/* ═══ FLOATING 3D ACTIVE SLIDER POD ═══ */}
        <div
          className={`
            absolute top-[5px] bottom-[5px] w-[calc(50%-5px)] rounded-[21px]
            pointer-events-none transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
            z-0 overflow-hidden
            ${isAthlon ? 'translate-x-0' : 'translate-x-[calc(100%+0px)]'}
          `}
          style={{
            background: isDark
              ? `linear-gradient(180deg, ${activeColor}35 0%, ${activeColor}12 45%, rgba(0, 0, 0, 0.85) 100%)`
              : `linear-gradient(180deg, #FFFFFF 0%, ${activeColor}0D 50%, #F8FAF9 100%)`,
            border: `1px solid ${activeColor}${isDark ? '55' : '45'}`,
            boxShadow: isDark
              ? `0 0 28px ${activeColor}30, inset 0 1px 2px rgba(255, 255, 255, 0.35), inset 0 -2px 6px rgba(0, 0, 0, 0.8)`
              : `0 4px 18px -2px rgba(0, 0, 0, 0.08), 0 0 24px -4px ${activeColor}28, inset 0 1px 1px #FFFFFF`,
          }}
        >
          {/* Laser Bevel Rim */}
          <div
            className="absolute top-0 left-4 right-4 h-[1.5px]"
            style={{
              background: `linear-gradient(90deg, transparent 0%, ${activeColor} 50%, transparent 100%)`,
              opacity: isDark ? 0.9 : 0.65,
            }}
          />
          <div
            className="absolute bottom-0 left-6 right-6 h-[1.5px]"
            style={{
              background: `linear-gradient(90deg, transparent 0%, ${activeColor}60 50%, transparent 100%)`,
            }}
          />
          {/* Ambient Internal Glow Orb */}
          <div
            className="absolute -top-6 left-1/2 -translate-x-1/2 w-32 h-16 rounded-full blur-xl pointer-events-none"
            style={{
              backgroundColor: `${activeColor}${isDark ? '35' : '20'}`,
            }}
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
                  !isAthlon
                    ? isDark
                      ? 'bg-white/[0.04] border border-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] group-hover:bg-white/[0.07] group-hover:border-white/[0.14]'
                      : 'bg-slate-100/80 border border-slate-200/90 shadow-[inset_0_1px_1px_rgba(0,0,0,0.04)] group-hover:bg-slate-200/70 group-hover:border-slate-300'
                    : ''
                }
              `}
              style={
                isAthlon
                  ? isDark
                    ? {
                        background: `linear-gradient(135deg, rgba(255,255,255,0.3) 0%, ${primary}35 50%, rgba(0,0,0,0.8) 100%)`,
                        border: '1px solid rgba(255, 255, 255, 0.5)',
                        boxShadow: `0 0 18px ${primary}60, inset 0 2px 4px rgba(255, 255, 255, 0.7), inset 0 -3px 5px rgba(0, 0, 0, 0.7)`,
                      }
                    : {
                        background: `linear-gradient(135deg, #FFFFFF 0%, ${primary}15 60%, ${primary}25 100%)`,
                        border: `1.5px solid ${primary}45`,
                        boxShadow: `0 4px 14px -2px ${primary}30, inset 0 2px 3px #FFFFFF`,
                      }
                  : undefined
              }
            >
              {/* Top Glass Specular Arc */}
              {isAthlon && (
                <div
                  className={`absolute top-1 left-1.5 right-1.5 h-3 rounded-full pointer-events-none ${
                    isDark
                      ? 'bg-gradient-to-b from-white/90 via-white/30 to-transparent'
                      : 'bg-gradient-to-b from-white/95 via-white/40 to-transparent'
                  }`}
                />
              )}

              {/* Trophy Icon with Selected Theme Color Glow */}
              <svg
                className="w-[22px] h-[22px] sm:w-[24px] sm:h-[24px] transition-all duration-300"
                style={{
                  color: isAthlon ? primary : isDark ? '#94A3B8' : '#64748B',
                  filter: isAthlon ? `drop-shadow(0 0 ${isDark ? '8px' : '4px'} ${primary})` : 'none',
                }}
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
                <polygon
                  points="12 5.5 12.8 7.2 14.7 7.4 13.3 8.7 13.7 10.6 12 9.7 10.3 10.6 10.7 8.7 9.3 7.4 11.2 7.2"
                  fill={isAthlon ? (isDark ? '#FFFFFF' : primary) : 'currentColor'}
                  stroke="none"
                />
              </svg>
            </div>

            {/* Typography Stack */}
            <div className="flex flex-col text-left leading-none min-w-0">
              <span
                className={`text-[15px] sm:text-[16px] font-black tracking-[0.12em] transition-colors duration-300 ${
                  isAthlon
                    ? isDark
                      ? 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]'
                      : 'text-slate-900 drop-shadow-[0_1px_1px_rgba(0,0,0,0.05)]'
                    : isDark
                      ? 'text-slate-400 group-hover:text-slate-200'
                      : 'text-slate-500 group-hover:text-slate-800'
                }`}
              >
                ATHLON
              </span>
              <div className="flex items-center gap-1.5 mt-1.5">
                {isAthlon && (
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{
                      backgroundColor: primary,
                      boxShadow: `0 0 6px ${primary}`,
                    }}
                  />
                )}
                <span
                  className={`text-[10.5px] sm:text-[11px] font-medium tracking-wide transition-colors duration-300 ${
                    isAthlon
                      ? 'font-semibold'
                      : isDark
                        ? 'text-slate-500 group-hover:text-slate-400'
                        : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                  style={isAthlon ? { color: isDark ? primaryLight : primary } : undefined}
                >
                  Play • Compete
                </span>
              </div>
              {/* Active Laser Underline Capsule */}
              {isAthlon && (
                <div
                  className="h-[2.5px] w-[50px] rounded-full mt-1.5 transition-all duration-300"
                  style={{
                    background: isDark
                      ? `linear-gradient(90deg, #FFFFFF, ${primary}, ${primaryLight})`
                      : `linear-gradient(90deg, ${primary}, ${primaryLight})`,
                    boxShadow: `0 0 8px ${primary}${isDark ? 'CC' : '88'}`,
                  }}
                />
              )}
            </div>
          </div>

          {/* Micro Telemetry Tag */}
          <div
            className={`hidden sm:flex flex-col items-end pr-1 pointer-events-none font-mono text-[8px] tracking-widest ${
              isDark ? 'text-slate-300 opacity-40' : 'text-slate-400 opacity-60'
            }`}
          >
            <span>01</span>
            <span style={isAthlon ? { color: primary, opacity: 1 } : undefined}>ARENA</span>
          </div>
        </button>

        {/* Center Precision Cockpit Divider (Visible When Transitioning) */}
        <div
          className="h-6 w-[1px] pointer-events-none z-10"
          style={{
            background: isDark
              ? 'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.12) 50%, transparent 100%)'
              : 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.12) 50%, transparent 100%)',
          }}
        />

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
                  !isMarket
                    ? isDark
                      ? 'bg-white/[0.04] border border-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] group-hover:bg-white/[0.07] group-hover:border-white/[0.14]'
                      : 'bg-slate-100/80 border border-slate-200/90 shadow-[inset_0_1px_1px_rgba(0,0,0,0.04)] group-hover:bg-slate-200/70 group-hover:border-slate-300'
                    : ''
                }
              `}
              style={
                isMarket
                  ? isDark
                    ? {
                        background: `linear-gradient(135deg, rgba(255,255,255,0.3) 0%, ${activeColor}35 50%, rgba(0,0,0,0.8) 100%)`,
                        border: '1px solid rgba(255, 255, 255, 0.5)',
                        boxShadow: `0 0 18px ${activeColor}60, inset 0 2px 4px rgba(255, 255, 255, 0.7), inset 0 -3px 5px rgba(0, 0, 0, 0.7)`,
                      }
                    : {
                        background: `linear-gradient(135deg, #FFFFFF 0%, ${activeColor}15 60%, ${activeColor}25 100%)`,
                        border: `1.5px solid ${activeColor}45`,
                        boxShadow: `0 4px 14px -2px ${activeColor}30, inset 0 2px 3px #FFFFFF`,
                      }
                  : undefined
              }
            >
              {isMarket && (
                <div
                  className={`absolute top-1 left-1.5 right-1.5 h-3 rounded-full pointer-events-none ${
                    isDark
                      ? 'bg-gradient-to-b from-white/90 via-white/30 to-transparent'
                      : 'bg-gradient-to-b from-white/95 via-white/40 to-transparent'
                  }`}
                />
              )}

              {/* Glowing Market Tote / Vault Icon */}
              <svg
                className="w-[22px] h-[22px] sm:w-[24px] sm:h-[24px] transition-all duration-300"
                style={{
                  color: isMarket ? activeColor : isDark ? '#94A3B8' : '#64748B',
                  filter: isMarket ? `drop-shadow(0 0 ${isDark ? '8px' : '4px'} ${activeColor})` : 'none',
                }}
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
                    ? isDark
                      ? 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]'
                      : 'text-slate-900 drop-shadow-[0_1px_1px_rgba(0,0,0,0.05)]'
                    : isDark
                      ? 'text-slate-400 group-hover:text-slate-200'
                      : 'text-slate-500 group-hover:text-slate-800'
                }`}
              >
                MARKET
              </span>
              <div className="flex items-center gap-1.5 mt-1.5">
                {isMarket && (
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{
                      backgroundColor: activeColor,
                      boxShadow: `0 0 6px ${activeColor}`,
                    }}
                  />
                )}
                <span
                  className={`text-[10.5px] sm:text-[11px] font-medium tracking-wide transition-colors duration-300 ${
                    isMarket
                      ? 'font-semibold'
                      : isDark
                        ? 'text-slate-500 group-hover:text-slate-400'
                        : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                  style={isMarket ? { color: isDark ? primaryLight : activeColor } : undefined}
                >
                  Buy • Sell
                </span>
              </div>
              {/* Active Laser Underline Capsule */}
              {isMarket && (
                <div
                  className="h-[2.5px] w-[50px] rounded-full mt-1.5 transition-all duration-300"
                  style={{
                    background: isDark
                      ? `linear-gradient(90deg, #FFFFFF, ${activeColor}, ${primaryLight})`
                      : `linear-gradient(90deg, ${activeColor}, ${primaryLight})`,
                    boxShadow: `0 0 8px ${activeColor}${isDark ? 'CC' : '88'}`,
                  }}
                />
              )}
            </div>
          </div>

          {/* Micro Telemetry Tag */}
          <div
            className={`hidden sm:flex flex-col items-end pr-1 pointer-events-none font-mono text-[8px] tracking-widest ${
              isDark ? 'text-slate-300 opacity-40' : 'text-slate-400 opacity-60'
            }`}
          >
            <span>02</span>
            <span style={isMarket ? { color: activeColor, opacity: 1 } : undefined}>EXCHANGE</span>
          </div>
        </button>
      </div>
    </div>
  );
}

export default AppModeSwitcher;