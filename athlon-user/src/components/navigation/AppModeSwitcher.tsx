'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
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
      {/* ─── EXACT REPLICA OF USER REFERENCE DESIGN ─── */}
      <div className="relative w-full max-w-[450px] h-[72px] rounded-full overflow-hidden flex items-center bg-white dark:bg-[#0E1713] border border-slate-200/80 dark:border-white/10 shadow-[0_10px_28px_-4px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)]">
        
        {/* ═══ 3D GLOWING JADE ACTIVE POD LAYER ═══ */}
        <div
          className={`absolute top-0 bottom-0 w-[55%] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] z-0 pointer-events-none ${
            isAthlon ? 'left-0' : 'left-[45%]'
          }`}
        >
          {/* Neon Green Outer Ambient Aura */}
          <div
            className={`absolute inset-0 rounded-full ${
              isAthlon
                ? 'shadow-[0_0_22px_4px_rgba(0,240,120,0.65),inset_0_0_12px_rgba(0,240,120,0.35)]'
                : 'shadow-[0_0_22px_4px_rgba(0,240,120,0.65),inset_0_0_12px_rgba(0,240,120,0.35)]'
            }`}
          />

          {/* SVG Jade Glass Body with Angled S-Wave and Specular Sheen */}
          <svg
            className="w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              {/* Deep Jade Body Gradient */}
              <linearGradient id="jadeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0B4228" />
                <stop offset="45%" stopColor="#052F1C" />
                <stop offset="100%" stopColor="#021C10" />
              </linearGradient>

              {/* Glossy Upper Highlight */}
              <linearGradient id="topSheen" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#00FF80" stopOpacity="0.8" />
                <stop offset="15%" stopColor="#00E676" stopOpacity="0.4" />
                <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.0" />
              </linearGradient>

              {/* Neon Bevel Glow along the Wave Edge */}
              <filter id="neonEdgeGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="1.5" dy="0" stdDeviation="1.5" floodColor="#00FF80" floodOpacity="0.8" />
              </filter>
            </defs>

            {/* S-Curve Pod Shape */}
            <path
              d={
                isAthlon
                  ? 'M 0,0 L 89,0 C 97,0 95,45 88,65 C 82,82 79,94 76,100 L 0,100 Z'
                  : 'M 100,0 L 11,0 C 3,0 5,45 12,65 C 18,82 21,94 24,100 L 100,100 Z'
              }
              fill="url(#jadeGradient)"
            />

            {/* Neon Border Edge Highlight Line */}
            <path
              d={
                isAthlon
                  ? 'M 89,0 C 97,0 95,45 88,65 C 82,82 79,94 76,100'
                  : 'M 11,0 C 3,0 5,45 12,65 C 18,82 21,94 24,100'
              }
              stroke="#00FF80"
              strokeWidth="2.5"
              fill="none"
              filter="url(#neonEdgeGlow)"
            />

            {/* Top Gloss Sheen Overlay */}
            <path
              d={
                isAthlon
                  ? 'M 0,0 L 89,0 C 97,0 95,45 88,65 C 82,82 79,94 76,100 L 0,100 Z'
                  : 'M 100,0 L 11,0 C 3,0 5,45 12,65 C 18,82 21,94 24,100 L 100,100 Z'
              }
              fill="url(#topSheen)"
            />
          </svg>
        </div>

        {/* ═══ ATHLON BUTTON (LEFT HALF) ═══ */}
        <button
          type="button"
          onClick={handleSelectAthlon}
          className="relative z-10 w-1/2 h-full flex items-center justify-start pl-3 sm:pl-3.5 pr-1 gap-2.5 cursor-pointer active:scale-[0.98] transition-transform overflow-hidden"
          aria-label="Switch to Athlon"
        >
          {/* Athlon Left: 3D Glass Sphere with Trophy */}
          {isAthlon ? (
            <div className="relative w-12 h-12 rounded-full shrink-0 flex items-center justify-center overflow-hidden border border-white/40 shadow-[inset_0_2px_5px_rgba(255,255,255,0.7),inset_0_-3px_6px_rgba(0,0,0,0.6),0_0_14px_rgba(0,255,128,0.5)] bg-gradient-to-b from-white/30 via-emerald-500/20 to-black/60 backdrop-blur-md">
              {/* Glass Top Crescent Specular Reflection */}
              <div className="absolute top-0.5 inset-x-2 h-3.5 bg-gradient-to-b from-white/80 to-transparent rounded-full opacity-80" />

              {/* Glowing Trophy Icon with Star */}
              <svg className="w-6 h-6 z-10 text-[#00E676] drop-shadow-[0_0_6px_rgba(0,255,128,0.8)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                <path d="M4 22h16" />
                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                <polygon points="12 5.5 12.8 7.2 14.7 7.4 13.3 8.7 13.7 10.6 12 9.7 10.3 10.6 10.7 8.7 9.3 7.4 11.2 7.2" fill="currentColor" stroke="none" />
              </svg>
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full shrink-0 flex items-center justify-center bg-[#E8F5EE] dark:bg-white/5 border border-emerald-500/10">
              <svg className="w-6 h-6 text-[#064E3B] dark:text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                <path d="M4 22h16" />
                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
              </svg>
            </div>
          )}

          {/* Text Block */}
          <div className="flex flex-col text-left leading-none min-w-0 z-10">
            <span
              className={`text-[15px] tracking-wide transition-colors duration-300 ${
                isAthlon
                  ? 'text-white font-black drop-shadow-xs'
                  : 'text-[#064E3B] dark:text-white font-black'
              }`}
            >
              ATHLON
            </span>
            <span
              className={`text-[11px] font-medium mt-1 transition-colors duration-300 ${
                isAthlon
                  ? 'text-emerald-100/90 font-semibold'
                  : 'text-slate-400 dark:text-slate-400'
              }`}
            >
              Play • Compete
            </span>
            {/* White Glowing Underline Indicator */}
            <div
              className={`h-[3.5px] rounded-full mt-1.5 transition-all duration-300 ${
                isAthlon
                  ? 'w-12 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] opacity-100'
                  : 'w-0 bg-transparent opacity-0'
              }`}
            />
          </div>

          {/* Athletic Player Silhouette Artwork on Active Athlon Pod */}
          {isAthlon && (
            <div className="absolute right-1 top-1 bottom-1 w-20 pointer-events-none opacity-45 flex items-center justify-center">
              <svg className="w-full h-full text-emerald-400" viewBox="0 0 100 100" fill="currentColor">
                {/* Dynamic Speed Swooshes */}
                <path d="M 20,80 Q 40,30 85,20" stroke="currentColor" strokeWidth="2.5" fill="none" opacity="0.6" />
                <path d="M 10,90 Q 50,40 90,35" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.4" />
                {/* Shuttlecock */}
                <path d="M 68,22 L 75,18 L 78,25 Z" opacity="0.85" />
                <circle cx="78" cy="18" r="2.5" opacity="0.9" />
                {/* Badminton Jumping Player Silhouette */}
                <circle cx="50" cy="46" r="4.5" />
                <path d="M 47,51 L 53,51 L 52,68 L 46,82 L 43,80 L 48,67 L 46,55 Z" />
                <path d="M 53,53 L 64,62 L 67,78 L 64,79 L 61,64 L 53,56 Z" />
                {/* Racket Arm & Racket */}
                <path d="M 47,52 L 40,42 L 36,30 L 38,29 L 42,40 L 49,50 Z" />
                <ellipse cx="33" cy="22" rx="4.5" ry="6.5" transform="rotate(-25 33 22)" stroke="currentColor" strokeWidth="1.5" fill="none" />
                <line x1="36" y1="28" x2="38" y2="32" stroke="currentColor" strokeWidth="1.2" />
              </svg>
            </div>
          )}
        </button>

        {/* ═══ MARKET BUTTON (RIGHT HALF) ═══ */}
        <button
          type="button"
          onClick={handleSelectMarket}
          className="relative z-10 w-1/2 h-full flex items-center justify-start pl-3 sm:pl-3.5 pr-1 gap-2.5 cursor-pointer active:scale-[0.98] transition-transform overflow-hidden"
          aria-label="Switch to Market"
        >
          {/* Market Icon: 3D Glass Sphere if Active, clean soft circle if Inactive */}
          {isMarket ? (
            <div className="relative w-12 h-12 rounded-full shrink-0 flex items-center justify-center overflow-hidden border border-white/40 shadow-[inset_0_2px_5px_rgba(255,255,255,0.7),inset_0_-3px_6px_rgba(0,0,0,0.6),0_0_14px_rgba(0,255,128,0.5)] bg-gradient-to-b from-white/30 via-emerald-500/20 to-black/60 backdrop-blur-md">
              <div className="absolute top-0.5 inset-x-2 h-3.5 bg-gradient-to-b from-white/80 to-transparent rounded-full opacity-80" />

              {/* Glowing Shopping Bag Icon with Handles and Smile */}
              <svg className="w-6 h-6 z-10 text-[#00E676] drop-shadow-[0_0_6px_rgba(0,255,128,0.8)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
                <path d="M10 14c.8.6 1.8.8 2 .8s1.2-.2 2-.8" strokeWidth="1.8" />
              </svg>
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full shrink-0 flex items-center justify-center bg-[#E8F5EE] dark:bg-white/5 border border-emerald-500/10">
              <svg className="w-6 h-6 text-[#064E3B] dark:text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
                <path d="M10 14c.8.6 1.8.8 2 .8s1.2-.2 2-.8" strokeWidth="1.8" />
              </svg>
            </div>
          )}

          {/* Text Block */}
          <div className="flex flex-col text-left leading-none min-w-0 z-10">
            <span
              className={`text-[15px] tracking-wide transition-colors duration-300 ${
                isMarket
                  ? 'text-white font-black drop-shadow-xs'
                  : 'text-[#064E3B] dark:text-white font-black'
              }`}
            >
              MARKET
            </span>
            <span
              className={`text-[11px] font-medium mt-1 transition-colors duration-300 ${
                isMarket
                  ? 'text-emerald-100/90 font-semibold'
                  : 'text-slate-400 dark:text-slate-400'
              }`}
            >
              Buy • Sell
            </span>
            {/* White Glowing Underline Indicator */}
            <div
              className={`h-[3.5px] rounded-full mt-1.5 transition-all duration-300 ${
                isMarket
                  ? 'w-12 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] opacity-100'
                  : 'w-0 bg-transparent opacity-0'
              }`}
            />
          </div>

          {/* Shopping Cart Watermark Artwork on the Inactive Market Side */}
          {!isMarket && (
            <div className="absolute right-2 top-2 bottom-2 w-20 pointer-events-none opacity-30 flex items-center justify-center">
              <svg className="w-full h-full text-slate-400 dark:text-slate-500" viewBox="0 0 100 100" fill="none" stroke="currentColor">
                {/* 3D Perspective Shopping Cart */}
                <path d="M 25,35 L 35,35 L 48,70 L 78,70 L 88,44 L 38,44" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="50" cy="80" r="4.5" fill="currentColor" />
                <circle cx="75" cy="80" r="4.5" fill="currentColor" />
                {/* Speed Lines */}
                <path d="M 12,65 L 28,65" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
                <path d="M 18,55 L 30,55" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
              </svg>
            </div>
          )}
        </button>

      </div>
    </div>
  );
}

export default AppModeSwitcher;
