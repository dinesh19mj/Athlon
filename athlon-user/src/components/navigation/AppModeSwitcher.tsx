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
  const [, setMounted] = useState(false);

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
      {/* ─── EXACT REPLICA OF USER REFERENCE IMAGE ─── */}
      <div className="relative w-full max-w-[490px] h-[70px] sm:h-[72px] rounded-full overflow-hidden flex items-center bg-white shadow-[0_0_40px_-5px_rgba(0,255,128,0.3),0_10px_25px_-5px_rgba(0,0,0,0.08)] border border-white/90">
        
        {/* ═══ 3D GLOWING JADE ACTIVE POD (SVG WITH DIAGONAL SLASH & LASER RIM) ═══ */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] z-0"
          viewBox="0 0 490 70"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Deep Jade Gradient */}
            <linearGradient id="exactJadeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#022817" />
              <stop offset="35%" stopColor="#043B22" />
              <stop offset="70%" stopColor="#032B18" />
              <stop offset="100%" stopColor="#01170D" />
            </linearGradient>

            {/* Glowing Neon Laser Rim Gradient */}
            <linearGradient id="exactNeonRim" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00FF80" />
              <stop offset="50%" stopColor="#39FF14" />
              <stop offset="100%" stopColor="#00E676" />
            </linearGradient>

            {/* Bevel Highlight Gradient */}
            <linearGradient id="bevelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
              <stop offset="50%" stopColor="#C8FFDC" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#00FF80" stopOpacity="0.5" />
            </linearGradient>

            {/* Laser Rim Ambient Aura Filter */}
            <filter id="laserAura" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#00FF80" floodOpacity="0.95" />
              <feDropShadow dx="0" dy="0" stdDeviation="7" floodColor="#00E676" floodOpacity="0.6" />
            </filter>

            {/* 3D Drop Shadow Cast onto White Pill */}
            <filter id="podShadow" x="-10%" y="-10%" width="130%" height="130%">
              <feDropShadow dx="3" dy="1" stdDeviation="5" floodColor="#000000" floodOpacity="0.22" />
            </filter>
          </defs>

          {/* Active Pod Solid Body with Drop Shadow */}
          <path
            d={
              isAthlon
                ? 'M 35,0 L 248,0 C 258,0 264,5 268,13 L 306,59 C 310,67 306,70 296,70 L 35,70 A 35,35 0 0,1 35,0 Z'
                : 'M 455,0 L 242,0 C 232,0 226,5 222,13 L 184,59 C 180,67 184,70 194,70 L 455,70 A 35,35 0 0,0 455,0 Z'
            }
            fill="url(#exactJadeGrad)"
            filter="url(#podShadow)"
            className="transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
          />

          {/* Glowing Neon Laser Rim Outline */}
          <path
            d={
              isAthlon
                ? 'M 35,0 L 248,0 C 258,0 264,5 268,13 L 306,59 C 310,67 306,70 296,70 L 35,70 A 35,35 0 0,1 35,0 Z'
                : 'M 455,0 L 242,0 C 232,0 226,5 222,13 L 184,59 C 180,67 184,70 194,70 L 455,70 A 35,35 0 0,0 455,0 Z'
            }
            stroke="url(#exactNeonRim)"
            strokeWidth="2.5"
            fill="none"
            filter="url(#laserAura)"
            className="transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
          />

          {/* Specular Metallic / Glass Bevel Along Diagonal Slash */}
          <path
            d={
              isAthlon
                ? 'M 248,0 C 258,0 264,5 268,13 L 306,59 C 310,67 306,70 296,70'
                : 'M 242,0 C 232,0 226,5 222,13 L 184,59 C 180,67 184,70 194,70'
            }
            stroke="url(#bevelGrad)"
            strokeWidth="2.4"
            strokeLinecap="round"
            fill="none"
            className="transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
          />

          {/* Intense Laser Light Beam along Horizontal Edge */}
          <path
            d={isAthlon ? 'M 35,70 L 296,70' : 'M 194,70 L 455,70'}
            stroke="#00FF80"
            strokeWidth="3.2"
            strokeLinecap="round"
            filter="url(#laserAura)"
            className="transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
          />
          <path
            d={isAthlon ? 'M 35,0 L 248,0' : 'M 242,0 L 455,0'}
            stroke="#00FF80"
            strokeWidth="2.2"
            strokeLinecap="round"
            filter="url(#laserAura)"
            className="transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
          />

          {/* ═══ ATHLETE ARTWORK VECTOR (RENDERED IN SVG FOR RAZOR SHARPNESS) ═══ */}
          {isAthlon && (
            <g className="transition-opacity duration-300">
              {/* Dynamic Neon Green Speed Trails */}
              <path d="M 170,68 C 200,50 230,35 270,18" stroke="#34D399" strokeWidth="2.6" fill="none" opacity="0.45" />
              <path d="M 155,70 C 190,56 240,42 285,28" stroke="#10B981" strokeWidth="1.8" fill="none" opacity="0.32" />
              <path d="M 180,38 C 190,24 205,16 220,12" stroke="#6EE7B7" strokeWidth="1.5" fill="none" opacity="0.5" />

              {/* Athletic Silhouette Figure */}
              {/* Head */}
              <circle cx="232" cy="40" r="5" fill="#34D399" opacity="0.88" />
              {/* Torso & Chest with green highlights */}
              <path d="M 226,45 L 238,45 L 236,65 L 228,70 L 222,65 Z" fill="#22C55E" opacity="0.75" />
              {/* Right Arm raised with Badminton Racket */}
              <path d="M 226,46 L 208,34 L 196,24" stroke="#4ADE80" strokeWidth="3.2" strokeLinecap="round" fill="none" opacity="0.88" />
              {/* Racket Handle & Oval Head with Cross Strings */}
              <line x1="196" y1="24" x2="190" y2="12" stroke="#86EFAC" strokeWidth="1.8" strokeLinecap="round" />
              <ellipse cx="187" cy="8" rx="6.5" ry="8.5" transform="rotate(-15 187 8)" stroke="#86EFAC" strokeWidth="1.8" fill="rgba(110,231,183,0.12)" />
              <line x1="183" y1="8" x2="191" y2="8" stroke="#86EFAC" strokeWidth="0.8" opacity="0.7" />
              <line x1="187" y1="4" x2="187" y2="12" stroke="#86EFAC" strokeWidth="0.8" opacity="0.7" />
              {/* Left Arm extended for athletic balance */}
              <path d="M 238,47 L 258,40 L 278,35" stroke="#4ADE80" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.82" />

              {/* Flying Shuttlecock */}
              <g transform="translate(216, 12) rotate(22) scale(0.68)">
                <path d="M 0,12 L 6,0 L 12,12 Z" fill="#E6FFFA" opacity="0.92" />
                <ellipse cx="6" cy="13" rx="3.5" ry="2.2" fill="#FFFFFF" opacity="0.98" />
              </g>
            </g>
          )}

          {/* ═══ MARKET ACTIVE ARTWORK (MIRRORED FOR MARKET MODE) ═══ */}
          {isMarket && (
            <g className="transition-opacity duration-300">
              <path d="M 320,68 C 290,50 260,35 220,18" stroke="#34D399" strokeWidth="2.6" fill="none" opacity="0.45" />
              <path d="M 335,70 C 300,56 250,42 205,28" stroke="#10B981" strokeWidth="1.8" fill="none" opacity="0.32" />
              {/* Shopping Energy Arcs */}
              <circle cx="258" cy="40" r="5" fill="#34D399" opacity="0.88" />
              <path d="M 264,45 L 252,45 L 254,65 L 262,70 L 268,65 Z" fill="#22C55E" opacity="0.75" />
            </g>
          )}
        </svg>

        {/* ═══ ATHLON OPTION (LEFT) ═══ */}
        <button
          type="button"
          onClick={handleSelectAthlon}
          className="relative z-10 w-1/2 h-full flex items-center justify-start pl-3 sm:pl-4 pr-1 gap-2.5 sm:gap-3 cursor-pointer active:scale-[0.98] transition-transform overflow-hidden"
          aria-label="Switch to Athlon"
        >
          {/* Athlon Left Icon: 3D Glass Marble when Active, Mint Badge when Inactive */}
          {isAthlon ? (
            <div className="relative w-[48px] h-[48px] rounded-full shrink-0 flex items-center justify-center overflow-hidden border border-white/50 shadow-[0_0_16px_rgba(0,255,128,0.7),inset_0_2px_4px_rgba(255,255,255,0.8),inset_0_-3px_5px_rgba(0,0,0,0.6)] bg-gradient-to-b from-white/35 via-emerald-500/20 to-black/70 backdrop-blur-md">
              {/* Crescent Specular Reflection */}
              <div className="absolute top-1 left-2 right-2 h-3.5 rounded-full bg-gradient-to-b from-white/95 via-white/40 to-transparent pointer-events-none" />

              {/* Glowing Trophy Icon with Centered Star */}
              <svg className="w-6 h-6 z-10 text-[#00FF80] drop-shadow-[0_0_8px_rgba(0,255,128,0.9)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                <path d="M4 22h16" />
                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                {/* Center Star in Cup */}
                <polygon points="12 5.5 12.8 7.2 14.7 7.4 13.3 8.7 13.7 10.6 12 9.7 10.3 10.6 10.7 8.7 9.3 7.4 11.2 7.2" fill="#FFFFFF" stroke="none" />
              </svg>
            </div>
          ) : (
            <div className="w-[44px] h-[44px] rounded-full shrink-0 flex items-center justify-center bg-[#E8F6EE] border border-emerald-500/10">
              <svg className="w-5 h-5 text-[#064E3B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                <path d="M4 22h16" />
                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                <polygon points="12 5.5 12.8 7.2 14.7 7.4 13.3 8.7 13.7 10.6 12 9.7 10.3 10.6 10.7 8.7 9.3 7.4 11.2 7.2" fill="currentColor" stroke="none" />
              </svg>
            </div>
          )}

          {/* Text Block */}
          <div className="flex flex-col text-left leading-none min-w-0 z-10">
            <span
              className={`text-[16px] sm:text-[17px] tracking-wide transition-colors duration-300 font-black ${
                isAthlon ? 'text-white' : 'text-[#064E3B]'
              }`}
            >
              ATHLON
            </span>
            <span
              className={`text-[11.5px] sm:text-[12px] font-medium mt-1 transition-colors duration-300 ${
                isAthlon ? 'text-[#86EFAC]' : 'text-[#64748B]'
              }`}
            >
              Play • Compete
            </span>
            {/* Glowing White Underline Capsule (Active State Only) */}
            {isAthlon && (
              <div className="h-[3.5px] w-[54px] rounded-full mt-1.5 bg-white shadow-[0_0_8px_#ffffff,0_0_15px_#00FF80] transition-all duration-300" />
            )}
          </div>
        </button>

        {/* ═══ MARKET OPTION (RIGHT) ═══ */}
        <button
          type="button"
          onClick={handleSelectMarket}
          className="relative z-10 w-1/2 h-full flex items-center justify-start pl-6 sm:pl-8 pr-2 gap-2.5 sm:gap-3 cursor-pointer active:scale-[0.98] transition-transform overflow-hidden"
          aria-label="Switch to Market"
        >
          {/* Market Icon: Soft Mint Circle when Inactive, 3D Glass Marble when Active */}
          {isMarket ? (
            <div className="relative w-[48px] h-[48px] rounded-full shrink-0 flex items-center justify-center overflow-hidden border border-white/50 shadow-[0_0_16px_rgba(0,255,128,0.7),inset_0_2px_4px_rgba(255,255,255,0.8),inset_0_-3px_5px_rgba(0,0,0,0.6)] bg-gradient-to-b from-white/35 via-emerald-500/20 to-black/70 backdrop-blur-md">
              <div className="absolute top-1 left-2 right-2 h-3.5 rounded-full bg-gradient-to-b from-white/95 via-white/40 to-transparent pointer-events-none" />

              {/* Glowing Shopping Bag Icon */}
              <svg className="w-6 h-6 z-10 text-[#00FF80] drop-shadow-[0_0_8px_rgba(0,255,128,0.9)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
                <path d="M10 14c.8.6 1.8.8 2 .8s1.2-.2 2-.8" strokeWidth="1.8" />
              </svg>
            </div>
          ) : (
            <div className="w-[44px] h-[44px] rounded-full shrink-0 flex items-center justify-center bg-[#E8F6EE] border border-emerald-500/10">
              <svg className="w-5 h-5 text-[#064E3B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
              className={`text-[16px] sm:text-[17px] tracking-wide transition-colors duration-300 font-black ${
                isMarket ? 'text-white' : 'text-[#064E3B]'
              }`}
            >
              MARKET
            </span>
            <span
              className={`text-[11.5px] sm:text-[12px] font-medium mt-1 transition-colors duration-300 ${
                isMarket ? 'text-[#86EFAC]' : 'text-[#64748B]'
              }`}
            >
              Buy • Sell
            </span>
            {/* Glowing White Underline Capsule (Active State Only) */}
            {isMarket && (
              <div className="h-[3.5px] w-[54px] rounded-full mt-1.5 bg-white shadow-[0_0_8px_#ffffff,0_0_15px_#00FF80] transition-all duration-300" />
            )}
          </div>

          {/* Tilted 3D Shopping Cart Watermark Artwork (Positioned at Far Right with Speed Streaks) */}
          {!isMarket && (
            <div className="absolute right-3 top-0 bottom-0 flex items-center pointer-events-none opacity-85">
              <svg className="w-16 h-12 text-[#9EC5B2]" viewBox="0 0 100 80" fill="none" stroke="currentColor">
                {/* Dynamic Speed Streaks behind Cart */}
                <path d="M 8,56 L 24,56" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
                <path d="M 14,46 L 28,46" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
                <path d="M 18,36 L 26,36" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
                {/* 3D Wireframe Cart */}
                <path d="M 24,18 L 34,18 L 46,52 L 80,52 L 90,26 L 38,26" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="48" cy="65" r="5" fill="currentColor" stroke="none" />
                <circle cx="78" cy="65" r="5" fill="currentColor" stroke="none" />
              </svg>
            </div>
          )}
        </button>

      </div>
    </div>
  );
}

export default AppModeSwitcher;
