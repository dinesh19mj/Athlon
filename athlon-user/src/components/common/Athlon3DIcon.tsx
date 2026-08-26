'use client';

import React from 'react';
import {
  Home,
  Trophy,
  Building,
  Calendar,
  Radio,
  User,
  UserCheck,
  ShieldCheck,
  Shield,
  BarChart3,
  Swords,
  ClipboardList,
  GraduationCap,
  Users,
  Activity,
  TrendingUp,
  CreditCard,
  Package,
  MapPin,
  Settings,
  Video,
  SlidersHorizontal,
} from 'lucide-react';
import { useAthlonTheme } from '@/hooks/use-athlon-theme';

export type Athlon3DIconType =
  | 'home'
  | 'tournaments'
  | 'academies'
  | 'bookings'
  | 'live-score'
  | 'profile'
  | 'umpire'
  | 'rankings'
  | 'matches'
  | 'registered'
  | 'students'
  | 'coaches'
  | 'members'
  | 'attendance'
  | 'schedule'
  | 'performance'
  | 'finances'
  | 'inventory'
  | 'facilities'
  | 'settings'
  | 'livestream'
  | 'setup';

export interface Athlon3DIconProps {
  type: Athlon3DIconType;
  className?: string;
  size?: number;
  active?: boolean;
  forceStyle?: '2d' | '3d';
}

function render2DIcon(type: Athlon3DIconType, active: boolean, size: number) {
  const strokeWidth = 1.5;
  const innerSize = Math.max(16, Math.round(size * 0.72));
  const style = { width: innerSize, height: innerSize, color: active ? 'var(--athlon-primary)' : 'currentColor' };

  switch (type) {
    case 'home':
      return <Home style={style} strokeWidth={strokeWidth} />;
    case 'tournaments':
      return <Trophy style={style} strokeWidth={strokeWidth} />;
    case 'academies':
      return <Building style={style} strokeWidth={strokeWidth} />;
    case 'bookings':
      return <Calendar style={style} strokeWidth={strokeWidth} />;
    case 'live-score':
      return <Radio style={style} strokeWidth={strokeWidth} />;
    case 'profile':
      return <User style={style} strokeWidth={strokeWidth} />;
    case 'umpire':
      return (
        <img
          src="/umpire.png"
          alt="Umpire"
          style={{ width: innerSize, height: innerSize }}
          className="object-contain drop-shadow-sm"
        />
      );
    case 'rankings':
      return <TrendingUp style={style} strokeWidth={strokeWidth} />;
    case 'matches':
      return <Activity style={style} strokeWidth={strokeWidth} />;
    case 'registered':
      return <ClipboardList style={style} strokeWidth={strokeWidth} />;
    case 'students':
      return <GraduationCap style={style} strokeWidth={strokeWidth} />;
    case 'coaches':
      return <UserCheck style={style} strokeWidth={strokeWidth} />;
    case 'members':
      return <Users style={style} strokeWidth={strokeWidth} />;
    case 'attendance':
      return <ClipboardList style={style} strokeWidth={strokeWidth} />;
    case 'schedule':
      return <Calendar style={style} strokeWidth={strokeWidth} />;
    case 'performance':
      return <TrendingUp style={style} strokeWidth={strokeWidth} />;
    case 'finances':
      return <CreditCard style={style} strokeWidth={strokeWidth} />;
    case 'inventory':
      return <Package style={style} strokeWidth={strokeWidth} />;
    case 'facilities':
      return <MapPin style={style} strokeWidth={strokeWidth} />;
    case 'settings':
      return <Settings style={style} strokeWidth={strokeWidth} />;
    case 'livestream':
      return <Video style={style} strokeWidth={strokeWidth} />;
    case 'setup':
      return <SlidersHorizontal style={style} strokeWidth={strokeWidth} />;
    default:
      return <Shield style={style} strokeWidth={strokeWidth} />;
  }
}

export function Athlon3DIcon({ type, className = '', size = 38, active = true, forceStyle }: Athlon3DIconProps) {
  let themeIconStyle: '2d' | '3d' = '2d';
  try {
    const themeCtx = useAthlonTheme();
    themeIconStyle = themeCtx.iconStyle;
  } catch {
    // fallback if used outside AthlonThemeProvider
  }

  const effectiveStyle = forceStyle || themeIconStyle;
  const activeClass = active ? '' : 'opacity-65 grayscale-[30%]';

  if (effectiveStyle === '2d') {
    return (
      <div
        className={`relative flex items-center justify-center transition-all ${
          active ? 'filter drop-shadow-[0_2px_8px_var(--athlon-primary-glow)]' : ''
        } ${activeClass} ${className}`}
        style={{ width: size, height: size }}
      >
        {render2DIcon(type, active, size)}
      </div>
    );
  }

  switch (type) {
    case 'home':
      return (
        <div
          className={`relative flex items-center justify-center transition-all ${
            active ? 'filter drop-shadow-[0_4px_10px_var(--athlon-primary-glow)]' : ''
          } ${activeClass} ${className}`}
          style={{ width: size, height: size }}
        >
          <svg
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full overflow-visible transition-transform duration-300 group-hover:scale-110"
          >
            <defs>
              <linearGradient id="homeRoof" x1="12" y1="8" x2="36" y2="24" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
                <stop offset="30%" stopColor="var(--athlon-primary)" />
                <stop offset="85%" stopColor="var(--athlon-primary-dark, #008770)" />
                <stop offset="100%" stopColor="#042018" />
              </linearGradient>

              <linearGradient id="homeWalls" x1="12" y1="20" x2="36" y2="42" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="var(--athlon-surface-hover, #35424D)" />
                <stop offset="50%" stopColor="var(--athlon-card, #1B262E)" />
                <stop offset="100%" stopColor="#080D11" />
              </linearGradient>

              <linearGradient id="doorGlow" x1="20" y1="26" x2="28" y2="42" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="40%" stopColor="var(--athlon-primary)" />
                <stop offset="100%" stopColor="#021C16" />
              </linearGradient>
            </defs>

            {/* Base Drop Shadow */}
            <ellipse cx="24" cy="44" rx="14" ry="2.5" fill="rgba(0,0,0,0.4)" />

            {/* 3D Main Base House Wall */}
            <path
              d="M12 21L24 11L36 21V41C36 42.1 35.1 43 34 43H14C12.9 43 12 42.1 12 41V21Z"
              fill="url(#homeWalls)"
              stroke="var(--athlon-border)"
              strokeWidth="0.9"
            />

            {/* Chimney / Tower Pillar */}
            <path d="M30 11V16L34 19V11H30Z" fill="var(--athlon-card)" stroke="var(--athlon-border)" strokeWidth="0.8" />
            <rect x="30" y="10" width="4" height="2" rx="0.5" fill="var(--athlon-primary)" />

            {/* 3D Isometric Roof Overhang */}
            <path
              d="M8 22L24 8L40 22L37 24.5L24 12.5L11 24.5L8 22Z"
              fill="url(#homeRoof)"
            />

            {/* Specular Roof Ridge Light */}
            <path
              d="M10 21.5L24 9.5L38 21.5"
              stroke="#FFFFFF"
              strokeWidth="1.4"
              strokeLinecap="round"
              opacity="0.85"
            />

            {/* Glowing 3D Arch Doorway */}
            <path
              d="M19 43V31C19 28.2 21.2 26 24 26C26.8 26 29 28.2 29 31V43H19Z"
              fill="url(#doorGlow)"
            />
            <circle cx="26.5" cy="35" r="1" fill="#041812" />

            {/* Center Athlon Apex Shield / Star */}
            <circle cx="24" cy="19" r="2.8" fill="var(--athlon-surface)" stroke="var(--athlon-primary)" strokeWidth="1" />
            <circle cx="24" cy="19" r="1.3" fill="#FFFFFF" />
          </svg>
        </div>
      );

    case 'tournaments':
      return (
        <div
          className={`relative flex items-center justify-center transition-all ${
            active ? 'filter drop-shadow-[0_4px_10px_var(--athlon-primary-glow)]' : ''
          } ${activeClass} ${className}`}
          style={{ width: size, height: size }}
        >
          <svg
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full overflow-visible transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3"
          >
            <defs>
              <linearGradient id="trophyCup" x1="12" y1="6" x2="36" y2="28" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFF4B8" />
                <stop offset="25%" stopColor="var(--athlon-primary)" />
                <stop offset="70%" stopColor="var(--athlon-primary-dark, #00A389)" />
                <stop offset="100%" stopColor="#0B1E19" />
              </linearGradient>

              <linearGradient id="rimGlow" x1="24" y1="4" x2="24" y2="28" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
                <stop offset="50%" stopColor="var(--athlon-primary)" stopOpacity="0.6" />
                <stop offset="100%" stopColor="transparent" stopOpacity="0" />
              </linearGradient>

              <linearGradient id="baseGrad" x1="14" y1="36" x2="34" y2="44" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="var(--athlon-surface-hover, #2A363F)" />
                <stop offset="50%" stopColor="var(--athlon-card, #1A242B)" />
                <stop offset="100%" stopColor="#080D11" />
              </linearGradient>

              <linearGradient id="handleGrad" x1="6" y1="10" x2="16" y2="24" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFF8D6" />
                <stop offset="40%" stopColor="var(--athlon-primary)" />
                <stop offset="100%" stopColor="#04201A" />
              </linearGradient>
            </defs>

            {/* Ambient Base Shadow */}
            <ellipse cx="24" cy="44" rx="13" ry="2.5" fill="rgba(0,0,0,0.4)" />

            {/* Left 3D Handle */}
            <path
              d="M13 12C7.5 12 6 18 10 23C13 26.5 16 25 17 24"
              stroke="url(#handleGrad)"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
            <path
              d="M13 12C8.5 12 7.5 17 10.5 21"
              stroke="#FFFFFF"
              strokeWidth="0.8"
              strokeLinecap="round"
              opacity="0.8"
            />

            {/* Right 3D Handle */}
            <path
              d="M35 12C40.5 12 42 18 38 23C35 26.5 32 25 31 24"
              stroke="url(#handleGrad)"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
            <path
              d="M35 12C39.5 12 40.5 17 37.5 21"
              stroke="#FFFFFF"
              strokeWidth="0.8"
              strokeLinecap="round"
              opacity="0.8"
            />

            {/* 3D Pedestal Base Steps */}
            <path
              d="M14 40L16 35H32L34 40C34 41.5 32 43 24 43C16 43 14 41.5 14 40Z"
              fill="url(#baseGrad)"
              stroke="var(--athlon-border)"
              strokeWidth="0.8"
            />
            <ellipse cx="24" cy="35.5" rx="8" ry="1.8" fill="var(--athlon-primary)" opacity="0.8" />
            <rect x="21.5" y="27" width="5" height="9" rx="1.5" fill="url(#trophyCup)" />

            {/* Main Cup Body */}
            <path
              d="M13 8C13 6 15 5 24 5C33 5 35 6 35 8C35 18 31 28 24 28C17 28 13 18 13 8Z"
              fill="url(#trophyCup)"
            />

            {/* Top Rim Lip */}
            <ellipse cx="24" cy="8" rx="11" ry="3" fill="url(#rimGlow)" />
            <ellipse cx="24" cy="8" rx="9" ry="2" fill="#0A1C17" />

            {/* 3D Specular Highlight Arc */}
            <path
              d="M16 11C15.5 15 17 22 21 25"
              stroke="#FFFFFF"
              strokeWidth="1.8"
              strokeLinecap="round"
              opacity="0.75"
            />

            {/* Center Embossed Star */}
            <path
              d="M24 13.5L25.2 16.5L28.5 16.8L26 19L26.8 22.2L24 20.5L21.2 22.2L22 19L19.5 16.8L22.8 16.5L24 13.5Z"
              fill="#FFFFFF"
              opacity="0.95"
            />
          </svg>
        </div>
      );

    case 'academies':
      return (
        <div
          className={`relative flex items-center justify-center transition-all ${
            active ? 'filter drop-shadow-[0_4px_10px_var(--athlon-primary-glow)]' : ''
          } ${activeClass} ${className}`}
          style={{ width: size, height: size }}
        >
          <svg
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full overflow-visible transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
          >
            <defs>
              <linearGradient id="domeGrad" x1="10" y1="8" x2="38" y2="30" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
                <stop offset="30%" stopColor="var(--athlon-primary)" />
                <stop offset="80%" stopColor="var(--athlon-primary-dark, #008770)" />
                <stop offset="100%" stopColor="#0B1A16" />
              </linearGradient>

              <linearGradient id="wallGrad" x1="8" y1="24" x2="40" y2="42" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="var(--athlon-surface-hover, #37434D)" />
                <stop offset="50%" stopColor="var(--athlon-card, #1B262E)" />
                <stop offset="100%" stopColor="#091015" />
              </linearGradient>

              <linearGradient id="fieldGrad" x1="16" y1="20" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="var(--athlon-primary)" />
                <stop offset="100%" stopColor="#04221A" />
              </linearGradient>
            </defs>

            {/* Stadium Base Shadow */}
            <ellipse cx="24" cy="44" rx="16" ry="3" fill="rgba(0,0,0,0.45)" />

            {/* Outer Arena Colosseum Wall */}
            <path
              d="M7 26C7 22 14 18 24 18C34 18 41 22 41 26L39 39C39 42 32 44 24 44C16 44 9 42 9 39L7 26Z"
              fill="url(#wallGrad)"
              stroke="var(--athlon-border)"
              strokeWidth="0.8"
            />

            {/* Arena Columns */}
            <path d="M12 32V37" stroke="var(--athlon-primary)" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
            <path d="M18 34V39" stroke="var(--athlon-primary)" strokeWidth="1.8" strokeLinecap="round" opacity="0.9" />
            <path d="M24 35V40" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
            <path d="M30 34V39" stroke="var(--athlon-primary)" strokeWidth="1.8" strokeLinecap="round" opacity="0.9" />
            <path d="M36 32V37" stroke="var(--athlon-primary)" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />

            {/* Center Field Bowl */}
            <ellipse cx="24" cy="24" rx="15" ry="6" fill="url(#fieldGrad)" />
            <ellipse cx="24" cy="24" rx="12" ry="4" fill="#0A1713" stroke="var(--athlon-primary)" strokeWidth="0.7" opacity="0.8" />
            <line x1="24" y1="20" x2="24" y2="28" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.7" />

            {/* 3D Modern Suspended Glass Canopy */}
            <path
              d="M6 22C6 11 14 6 24 6C34 6 42 11 42 22C38 15 32 10 24 10C16 10 10 15 6 22Z"
              fill="url(#domeGrad)"
            />

            {/* Specular Roof Highlights */}
            <path
              d="M10 18C14 11 19 8 24 8C29 8 34 11 38 18"
              stroke="#FFFFFF"
              strokeWidth="1.2"
              strokeLinecap="round"
              opacity="0.85"
            />

            {/* Pinnacle Star */}
            <circle cx="24" cy="6" r="2" fill="#FFFFFF" />
          </svg>
        </div>
      );

    case 'bookings':
      return (
        <div
          className={`relative flex items-center justify-center transition-all ${
            active ? 'filter drop-shadow-[0_4px_10px_var(--athlon-primary-glow)]' : ''
          } ${activeClass} ${className}`}
          style={{ width: size, height: size }}
        >
          <svg
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full overflow-visible transition-transform duration-300 group-hover:scale-110"
          >
            <defs>
              <linearGradient id="calPad" x1="10" y1="12" x2="38" y2="42" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="var(--athlon-surface-hover, #333F48)" />
                <stop offset="50%" stopColor="var(--athlon-card, #1A252C)" />
                <stop offset="100%" stopColor="#080E12" />
              </linearGradient>

              <linearGradient id="racketGlow" x1="20" y1="6" x2="42" y2="28" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="40%" stopColor="var(--athlon-primary)" />
                <stop offset="100%" stopColor="var(--athlon-primary-dark, #007D67)" />
              </linearGradient>

              <linearGradient id="badgeGrad" x1="28" y1="24" x2="42" y2="38" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="60%" stopColor="var(--athlon-primary)" />
                <stop offset="100%" stopColor="#021C16" />
              </linearGradient>
            </defs>

            {/* Drop Shadow */}
            <ellipse cx="24" cy="44" rx="14" ry="2.5" fill="rgba(0,0,0,0.4)" />

            {/* Isometric Calendar Board */}
            <rect
              x="8"
              y="11"
              width="28"
              height="30"
              rx="6"
              fill="url(#calPad)"
              stroke="var(--athlon-border)"
              strokeWidth="1"
            />

            {/* Top Calendar Header Bar */}
            <path
              d="M8 17C8 13.6863 10.6863 11 14 11H30C33.3137 11 36 13.6863 36 17V19H8V17Z"
              fill="var(--athlon-primary)"
            />

            {/* Binder Rings */}
            <rect x="13" y="8" width="3" height="6" rx="1.5" fill="#FFFFFF" />
            <rect x="28" y="8" width="3" height="6" rx="1.5" fill="#FFFFFF" />

            {/* Calendar Slots Grid */}
            <rect x="12" y="23" width="5" height="4" rx="1.2" fill="var(--athlon-primary)" opacity="0.9" />
            <rect x="19" y="23" width="5" height="4" rx="1.2" fill="var(--athlon-surface)" />
            <rect x="26" y="23" width="5" height="4" rx="1.2" fill="var(--athlon-surface)" />
            <rect x="12" y="30" width="5" height="4" rx="1.2" fill="var(--athlon-surface)" />
            <rect x="19" y="30" width="5" height="4" rx="1.2" fill="var(--athlon-primary)" opacity="0.9" />
            <rect x="26" y="30" width="5" height="4" rx="1.2" fill="var(--athlon-surface)" />

            {/* 3D Floating Racket Head */}
            <circle
              cx="33"
              cy="18"
              r="9"
              stroke="url(#racketGlow)"
              strokeWidth="2.8"
              fill="#061914"
              opacity="0.95"
            />
            {/* Racket Strings */}
            <line x1="27" y1="18" x2="39" y2="18" stroke="var(--athlon-primary)" strokeWidth="0.8" opacity="0.6" />
            <line x1="33" y1="12" x2="33" y2="24" stroke="var(--athlon-primary)" strokeWidth="0.8" opacity="0.6" />

            {/* Racket Shaft */}
            <line x1="39" y1="24" x2="45" y2="30" stroke="url(#racketGlow)" strokeWidth="2.5" strokeLinecap="round" />

            {/* Floating 3D Checkmark Badge */}
            <circle cx="34" cy="34" r="7" fill="url(#badgeGrad)" />
            <path
              d="M31 34L33.2 36.2L37.5 31.8"
              stroke="#041510"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      );

    case 'live-score':
      return (
        <div
          className={`relative flex items-center justify-center transition-all ${
            active ? 'filter drop-shadow-[0_4px_10px_rgba(239,68,68,0.45)]' : ''
          } ${activeClass} ${className}`}
          style={{ width: size, height: size }}
        >
          <svg
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full overflow-visible transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
          >
            <defs>
              <linearGradient id="tvFrame" x1="8" y1="10" x2="40" y2="38" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#2A353E" />
                <stop offset="50%" stopColor="#141E24" />
                <stop offset="100%" stopColor="#080D11" />
              </linearGradient>

              <linearGradient id="tvScreen" x1="12" y1="14" x2="36" y2="34" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#1F0606" />
                <stop offset="50%" stopColor="#0B1318" />
                <stop offset="100%" stopColor="#02080B" />
              </linearGradient>

              <linearGradient id="redLive" x1="14" y1="16" x2="34" y2="30" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFA3A3" />
                <stop offset="40%" stopColor="#EF4444" />
                <stop offset="100%" stopColor="#7F1D1D" />
              </linearGradient>
            </defs>

            {/* Monitor Base Shadow */}
            <ellipse cx="24" cy="44" rx="14" ry="2.5" fill="rgba(0,0,0,0.5)" />

            {/* Stand Base */}
            <path d="M18 41C18 40 20 39 24 39C28 39 30 40 30 41L31 43H17L18 41Z" fill="#1C2730" />
            <rect x="22.5" y="35" width="3" height="5" fill="#2D3A44" />

            {/* 3D TV Box */}
            <rect
              x="6"
              y="11"
              width="36"
              height="25"
              rx="6"
              fill="url(#tvFrame)"
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="0.9"
            />

            {/* Screen */}
            <rect
              x="9"
              y="14"
              width="30"
              height="19"
              rx="4"
              fill="url(#tvScreen)"
              stroke="rgba(239, 68, 68, 0.4)"
              strokeWidth="0.8"
            />

            {/* Equalizer Bars */}
            <rect x="13" y="24" width="2" height="6" rx="1" fill="#EF4444" />
            <rect x="17" y="20" width="2" height="10" rx="1" fill="#EF4444" />
            <rect x="21" y="17" width="2" height="13" rx="1" fill="#EF4444" />
            <rect x="25" y="22" width="2" height="8" rx="1" fill="var(--athlon-primary)" />
            <rect x="29" y="19" width="2" height="11" rx="1" fill="var(--athlon-primary)" />
            <rect x="33" y="23" width="2" height="7" rx="1" fill="var(--athlon-primary)" />

            {/* Top Antenna with Pulsing Beacon */}
            <line x1="24" y1="11" x2="20" y2="4" stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="24" y1="11" x2="28" y2="4" stroke="var(--athlon-primary)" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="20" cy="4" r="2.2" fill="#EF4444" />
            <circle cx="28" cy="4" r="2.2" fill="var(--athlon-primary)" />

            {/* Live Indicator Pill on Screen */}
            <rect x="13" y="16" width="10" height="4" rx="2" fill="url(#redLive)" />
            <circle cx="15.5" cy="18" r="1" fill="#FFFFFF" />
          </svg>
        </div>
      );

    case 'profile':
      return (
        <div
          className={`relative flex items-center justify-center transition-all ${
            active ? 'filter drop-shadow-[0_4px_10px_var(--athlon-primary-glow)]' : ''
          } ${activeClass} ${className}`}
          style={{ width: size, height: size }}
        >
          <svg
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full overflow-visible transition-transform duration-300 group-hover:scale-110"
          >
            <defs>
              <linearGradient id="avatarCrest" x1="12" y1="6" x2="36" y2="40" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="35%" stopColor="var(--athlon-primary)" />
                <stop offset="85%" stopColor="var(--athlon-primary-dark, #008770)" />
                <stop offset="100%" stopColor="#041E17" />
              </linearGradient>

              <linearGradient id="crestShield" x1="10" y1="16" x2="38" y2="42" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="var(--athlon-surface-hover, #333F48)" />
                <stop offset="50%" stopColor="var(--athlon-card, #1A252C)" />
                <stop offset="100%" stopColor="#080E12" />
              </linearGradient>
            </defs>

            {/* Shadow */}
            <ellipse cx="24" cy="44" rx="13" ry="2.5" fill="rgba(0,0,0,0.4)" />

            {/* Athlete Shield Base */}
            <path
              d="M10 12L24 6L38 12V25C38 35 24 43 24 43C24 43 10 35 10 25V12Z"
              fill="url(#crestShield)"
              stroke="var(--athlon-border)"
              strokeWidth="1"
            />

            {/* Inner Glowing Shield Border */}
            <path
              d="M13 14.5L24 9.5L35 14.5V24C35 32 24 39 24 39C24 39 13 32 13 24V14.5Z"
              fill="none"
              stroke="var(--athlon-primary)"
              strokeWidth="1.2"
              opacity="0.8"
            />

            {/* 3D User Avatar Head */}
            <circle cx="24" cy="18" r="6" fill="url(#avatarCrest)" />
            <circle cx="24" cy="18" r="4.5" fill="#0A1813" />
            <circle cx="24" cy="18" r="2.8" fill="var(--athlon-primary)" />

            {/* 3D Athlete Shoulders / Torso */}
            <path
              d="M16 35C16 29.5 19.5 26.5 24 26.5C28.5 26.5 32 29.5 32 35C30 37.5 26.5 39 24 39C21.5 39 18 37.5 16 35Z"
              fill="url(#avatarCrest)"
            />

            {/* Center Star on Chest */}
            <circle cx="24" cy="31" r="1.5" fill="#FFFFFF" />
          </svg>
        </div>
      );

    case 'umpire':
      return (
        <div
          className={`relative flex items-center justify-center transition-all ${
            active ? 'filter drop-shadow-[0_6px_14px_var(--athlon-glow,var(--athlon-primary-glow))]' : ''
          } ${className}`}
          style={{ width: size, height: size }}
        >
          <svg
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full overflow-visible transition-transform duration-300 group-hover:scale-110"
          >
            <defs>
              <linearGradient id="whistleMetal" x1="10" y1="12" x2="38" y2="36" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="30%" stopColor="#E2E8F0" />
                <stop offset="70%" stopColor="var(--athlon-primary)" />
                <stop offset="100%" stopColor="#0B1A16" />
              </linearGradient>

              <linearGradient id="whistleRim" x1="12" y1="10" x2="28" y2="34" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#475569" />
              </linearGradient>
            </defs>

            {/* Shadow */}
            <ellipse cx="24" cy="44" rx="14" ry="2.5" fill="rgba(0,0,0,0.5)" />

            {/* 3D Referee Whistle Body */}
            <path
              d="M10 24C10 18.5 14.5 14 20 14C23.5 14 26.5 15.8 28.3 18.5L38 18.5C39.1 18.5 40 19.4 40 20.5V27.5C40 28.6 39.1 29.5 38 29.5L29 29.5C27 32.2 23.8 34 20 34C14.5 34 10 29.5 10 24Z"
              fill="url(#whistleMetal)"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="0.9"
            />

            {/* Whistle Air Vent Hole */}
            <rect x="23" y="16" width="4.5" height="7" rx="1.5" fill="#05120E" stroke="var(--athlon-primary)" strokeWidth="0.8" />

            {/* Whistle Loop Lanyard Hook */}
            <circle cx="12" cy="24" r="4.5" stroke="url(#whistleRim)" strokeWidth="2" fill="none" />

            {/* Sound Wave Neon Rays */}
            <path d="M42 20C44 22 44 26 42 28" stroke="var(--athlon-primary)" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M45 17C48 21 48 27 45 31" stroke="var(--athlon-primary)" strokeWidth="1.4" strokeLinecap="round" opacity="0.75" />
          </svg>
        </div>
      );

    case 'rankings':
      return (
        <div
          className={`relative flex items-center justify-center transition-all ${
            active ? 'filter drop-shadow-[0_4px_10px_var(--athlon-primary-glow)]' : ''
          } ${activeClass} ${className}`}
          style={{ width: size, height: size }}
        >
          <svg
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full overflow-visible transition-transform duration-300 group-hover:scale-110"
          >
            <defs>
              <linearGradient id="podium1" x1="18" y1="12" x2="30" y2="40" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="30%" stopColor="var(--athlon-primary)" />
                <stop offset="90%" stopColor="var(--athlon-primary-dark, #008770)" />
                <stop offset="100%" stopColor="#041F17" />
              </linearGradient>

              <linearGradient id="podium2" x1="6" y1="20" x2="18" y2="40" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#CBD5E1" />
                <stop offset="50%" stopColor="var(--athlon-card, #1E293B)" />
                <stop offset="100%" stopColor="#0F172A" />
              </linearGradient>

              <linearGradient id="podium3" x1="30" y1="24" x2="42" y2="40" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#E2E8F0" />
                <stop offset="50%" stopColor="var(--athlon-card, #1E293B)" />
                <stop offset="100%" stopColor="#0F172A" />
              </linearGradient>

              <linearGradient id="podiumCrown" x1="20" y1="4" x2="28" y2="16" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFFBEB" />
                <stop offset="40%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#B45309" />
              </linearGradient>
            </defs>

            {/* Base Drop Shadow */}
            <ellipse cx="24" cy="43" rx="18" ry="3" fill="rgba(0,0,0,0.5)" />

            {/* #2 Left Podium */}
            <path d="M6 22L18 22V40H6V22Z" fill="url(#podium2)" stroke="var(--athlon-border)" strokeWidth="0.8" />
            <path d="M6 22L12 18L18 22" fill="#E2E8F0" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" opacity="0.8" />
            <text x="12" y="34" fill="#94A3B8" fontSize="10" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">2</text>

            {/* #3 Right Podium */}
            <path d="M30 26L42 26V40H30V26Z" fill="url(#podium3)" stroke="var(--athlon-border)" strokeWidth="0.8" />
            <path d="M30 26L36 23L42 26" fill="#CBD5E1" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" opacity="0.8" />
            <text x="36" y="36" fill="#94A3B8" fontSize="9" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">3</text>

            {/* #1 Center Champion Podium */}
            <path d="M17 15L31 15V41H17V15Z" fill="url(#podium1)" stroke="var(--athlon-border)" strokeWidth="0.9" />
            <path d="M17 15L24 10L31 15" fill="#FFFFFF" stroke="var(--athlon-primary)" strokeWidth="1" opacity="0.9" />
            <text x="24" y="30" fill="#FFFFFF" fontSize="14" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">1</text>

            {/* Floating Gold Star above #1 */}
            <path
              d="M24 4L25.8 8.2L30.3 8.7L26.9 11.8L27.9 16.2L24 13.8L20.1 16.2L21.1 11.8L17.7 8.7L22.2 8.2L24 4Z"
              fill="url(#podiumCrown)"
              filter="drop-shadow(0 2px 5px rgba(245,158,11,0.6))"
            />
          </svg>
        </div>
      );

    case 'matches':
      return (
        <div
          className={`relative flex items-center justify-center transition-all ${
            active ? 'filter drop-shadow-[0_4px_10px_var(--athlon-primary-glow)]' : ''
          } ${activeClass} ${className}`}
          style={{ width: size, height: size }}
        >
          <svg
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full overflow-visible transition-transform duration-300 group-hover:scale-110"
          >
            <defs>
              <linearGradient id="racketGlow1" x1="8" y1="8" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="35%" stopColor="var(--athlon-primary)" />
                <stop offset="85%" stopColor="var(--athlon-primary-dark, #008770)" />
                <stop offset="100%" stopColor="#051D17" />
              </linearGradient>

              <linearGradient id="racketGlow2" x1="40" y1="8" x2="8" y2="40" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="35%" stopColor="#38BDF8" />
                <stop offset="85%" stopColor="#0284C7" />
                <stop offset="100%" stopColor="#082F49" />
              </linearGradient>

              <linearGradient id="shuttleHead" x1="22" y1="22" x2="26" y2="28" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="60%" stopColor="var(--athlon-primary)" />
                <stop offset="100%" stopColor="#041E17" />
              </linearGradient>
            </defs>

            {/* Base Drop Shadow */}
            <ellipse cx="24" cy="43" rx="16" ry="3" fill="rgba(0,0,0,0.5)" />

            {/* Racket 1 (Left to Right) */}
            <ellipse cx="16" cy="16" rx="9" ry="11" transform="rotate(-35 16 16)" fill="rgba(0,0,0,0.4)" stroke="url(#racketGlow1)" strokeWidth="2.2" />
            <line x1="22" y1="24" x2="38" y2="40" stroke="url(#racketGlow1)" strokeWidth="2.6" strokeLinecap="round" />
            <line x1="33" y1="35" x2="38" y2="40" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />

            {/* Racket 2 (Right to Left - Crossed) */}
            <ellipse cx="32" cy="16" rx="9" ry="11" transform="rotate(35 32 16)" fill="rgba(0,0,0,0.4)" stroke="url(#racketGlow2)" strokeWidth="2.2" />
            <line x1="26" y1="24" x2="10" y2="40" stroke="url(#racketGlow2)" strokeWidth="2.6" strokeLinecap="round" />
            <line x1="15" y1="35" x2="10" y2="40" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />

            {/* Glowing Center 3D Shuttlecock */}
            <path d="M20 18L24 25L28 18" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" opacity="0.9" />
            <path d="M18 19L24 26L30 19" fill="rgba(255,255,255,0.7)" />
            <circle cx="24" cy="27" r="3.2" fill="url(#shuttleHead)" stroke="#FFFFFF" strokeWidth="0.8" />

            {/* Lightning / Energy Spark */}
            <path d="M24 7L22 12H26L24 16" stroke="#FEF08A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      );

    case 'registered':
      return (
        <div
          className={`relative flex items-center justify-center transition-all ${
            active ? 'filter drop-shadow-[0_4px_10px_var(--athlon-primary-glow)]' : ''
          } ${activeClass} ${className}`}
          style={{ width: size, height: size }}
        >
          <svg
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full overflow-visible transition-transform duration-300 group-hover:scale-110"
          >
            <defs>
              <linearGradient id="badgeCard" x1="10" y1="8" x2="38" y2="42" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="15%" stopColor="var(--athlon-surface-hover, #334155)" />
                <stop offset="70%" stopColor="var(--athlon-card, #1E293B)" />
                <stop offset="100%" stopColor="#0B1322" />
              </linearGradient>

              <linearGradient id="badgeHeader" x1="12" y1="12" x2="36" y2="20" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="40%" stopColor="var(--athlon-primary)" />
                <stop offset="100%" stopColor="var(--athlon-primary-dark, #008770)" />
              </linearGradient>

              <linearGradient id="checkStamp" x1="26" y1="26" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#86EFAC" />
                <stop offset="50%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#065F46" />
              </linearGradient>
            </defs>

            {/* Base Drop Shadow */}
            <ellipse cx="24" cy="44" rx="14" ry="2.5" fill="rgba(0,0,0,0.45)" />

            {/* 3D Entry Pass Board */}
            <rect
              x="11"
              y="11"
              width="26"
              height="31"
              rx="4"
              fill="url(#badgeCard)"
              stroke="var(--athlon-border)"
              strokeWidth="1"
            />

            {/* Top Lanyard Clip & Slot */}
            <rect x="20" y="7" width="8" height="6" rx="2" fill="var(--athlon-card)" stroke="var(--athlon-border)" strokeWidth="0.8" />
            <circle cx="24" cy="10" r="1.5" fill="#FFFFFF" />
            <rect x="18" y="14" width="12" height="2" rx="1" fill="#0A101D" />

            {/* Badge Header Banner */}
            <rect x="14" y="18" width="20" height="4" rx="1" fill="url(#badgeHeader)" />

            {/* Text / Data Bar lines */}
            <rect x="14" y="25" width="12" height="2" rx="1" fill="rgba(255,255,255,0.4)" />
            <rect x="14" y="29" width="10" height="1.8" rx="0.9" fill="rgba(255,255,255,0.25)" />
            <rect x="14" y="33" width="8" height="1.8" rx="0.9" fill="rgba(255,255,255,0.2)" />

            {/* 3D Verified Checkmark Seal / Stamp */}
            <circle cx="32" cy="33" r="6.5" fill="url(#checkStamp)" stroke="#FFFFFF" strokeWidth="1" filter="drop-shadow(0 2px 5px rgba(16,185,129,0.5))" />
            <path
              d="M29 33L31.2 35.2L35 30.8"
              stroke="#FFFFFF"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      );

    case 'students':
      return (
        <div
          className={`relative flex items-center justify-center transition-all ${
            active ? 'filter drop-shadow-[0_4px_10px_var(--athlon-primary-glow)]' : ''
          } ${activeClass} ${className}`}
          style={{ width: size, height: size }}
        >
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full overflow-visible transition-transform duration-300 group-hover:scale-110">
            <defs>
              <linearGradient id="mortarboardGrad" x1="10" y1="8" x2="38" y2="28" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="30%" stopColor="var(--athlon-primary)" />
                <stop offset="85%" stopColor="var(--athlon-primary-dark, #008770)" />
                <stop offset="100%" stopColor="#041E17" />
              </linearGradient>
              <linearGradient id="diplomaGrad" x1="12" y1="30" x2="36" y2="42" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFFBEB" />
                <stop offset="50%" stopColor="#FEF08A" />
                <stop offset="100%" stopColor="#F59E0B" />
              </linearGradient>
            </defs>
            <ellipse cx="24" cy="43" rx="16" ry="2.5" fill="rgba(0,0,0,0.5)" />
            {/* 3D Mortarboard Rhombus Top */}
            <path d="M24 8L42 17L24 26L6 17L24 8Z" fill="url(#mortarboardGrad)" stroke="rgba(255,255,255,0.4)" strokeWidth="0.9" />
            <path d="M24 10L38 17L24 24L10 17L24 10Z" fill="none" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.6" />
            {/* Skull Cap base under mortarboard */}
            <path d="M14 21.5V29C14 33 18.5 35 24 35C29.5 35 34 33 34 29V21.5L24 26.5L14 21.5Z" fill="var(--athlon-card)" stroke="var(--athlon-border)" strokeWidth="0.8" />
            {/* Hanging Tassel */}
            <path d="M24 17L38 21V33" stroke="#F59E0B" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="38" cy="34" r="2.2" fill="#F59E0B" filter="drop-shadow(0 2px 4px rgba(245,158,11,0.6))" />
            {/* Rolled Diploma Scroll beneath */}
            <rect x="12" y="36" width="24" height="6" rx="3" fill="url(#diplomaGrad)" stroke="#B45309" strokeWidth="0.8" />
            <rect x="22" y="35" width="4" height="8" rx="1" fill="#EF4444" />
          </svg>
        </div>
      );

    case 'coaches':
      return (
        <div
          className={`relative flex items-center justify-center transition-all ${
            active ? 'filter drop-shadow-[0_4px_10px_var(--athlon-primary-glow)]' : ''
          } ${activeClass} ${className}`}
          style={{ width: size, height: size }}
        >
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full overflow-visible transition-transform duration-300 group-hover:scale-110">
            <defs>
              <linearGradient id="boardGrad" x1="10" y1="8" x2="38" y2="42" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#1E293B" />
                <stop offset="60%" stopColor="var(--athlon-card)" />
                <stop offset="100%" stopColor="#0B1322" />
              </linearGradient>
            </defs>
            <ellipse cx="24" cy="43" rx="14" ry="2.5" fill="rgba(0,0,0,0.5)" />
            {/* Tactical Board Base */}
            <rect x="10" y="8" width="28" height="34" rx="4" fill="url(#boardGrad)" stroke="var(--athlon-border)" strokeWidth="1" />
            {/* Top Metallic Clip */}
            <rect x="18" y="5" width="12" height="6" rx="2" fill="var(--athlon-primary)" stroke="#FFFFFF" strokeWidth="0.8" />
            {/* Tactical Gameplan Tactics (X's and O's & Arrows) */}
            <circle cx="17" cy="18" r="2.5" stroke="#38BDF8" strokeWidth="1.5" fill="none" />
            <path d="M28 16L32 20M32 16L28 20" stroke="#F87171" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M19 21C22 25 24 28 31 27" stroke="var(--athlon-primary)" strokeWidth="1.8" strokeDasharray="2.5 2" strokeLinecap="round" />
            <polygon points="32,27 28,24 28,29" fill="var(--athlon-primary)" />
            {/* Coach Whistle icon corner */}
            <circle cx="30" cy="35" r="4" fill="var(--athlon-primary)" filter="drop-shadow(0 2px 5px var(--athlon-primary-glow))" />
            <path d="M30 33V37M28 35H32" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      );

    case 'members':
      return (
        <div
          className={`relative flex items-center justify-center transition-all ${
            active ? 'filter drop-shadow-[0_4px_10px_var(--athlon-primary-glow)]' : ''
          } ${activeClass} ${className}`}
          style={{ width: size, height: size }}
        >
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full overflow-visible transition-transform duration-300 group-hover:scale-110">
            <defs>
              <linearGradient id="centerMember" x1="16" y1="12" x2="32" y2="40" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="40%" stopColor="var(--athlon-primary)" />
                <stop offset="100%" stopColor="var(--athlon-primary-dark, #008770)" />
              </linearGradient>
              <linearGradient id="sideMember" x1="6" y1="16" x2="22" y2="40" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#CBD5E1" />
                <stop offset="60%" stopColor="var(--athlon-card)" />
                <stop offset="100%" stopColor="#0B1322" />
              </linearGradient>
            </defs>
            <ellipse cx="24" cy="43" rx="16" ry="3" fill="rgba(0,0,0,0.5)" />
            {/* Left Member */}
            <circle cx="15" cy="18" r="4.5" fill="url(#sideMember)" stroke="var(--athlon-border)" strokeWidth="0.8" />
            <path d="M8 35C8 29.5 11 27 15 27C17.5 27 19.5 28.2 21 30" stroke="var(--athlon-border)" strokeWidth="1" fill="url(#sideMember)" />
            {/* Right Member */}
            <circle cx="33" cy="18" r="4.5" fill="url(#sideMember)" stroke="var(--athlon-border)" strokeWidth="0.8" />
            <path d="M40 35C40 29.5 37 27 33 27C30.5 27 28.5 28.2 27 30" stroke="var(--athlon-border)" strokeWidth="1" fill="url(#sideMember)" />
            {/* Center Leader (Elevated, Glowing) */}
            <circle cx="24" cy="14" r="5.5" fill="url(#centerMember)" stroke="#FFFFFF" strokeWidth="1" filter="drop-shadow(0 2px 6px var(--athlon-primary-glow))" />
            <path d="M16 38C16 30 20 28 24 28C28 28 32 30 32 38C29 40.5 27 41 24 41C21 41 19 40.5 16 38Z" fill="url(#centerMember)" stroke="#FFFFFF" strokeWidth="0.8" />
          </svg>
        </div>
      );

    case 'attendance':
      return (
        <div
          className={`relative flex items-center justify-center transition-all ${
            active ? 'filter drop-shadow-[0_4px_10px_var(--athlon-primary-glow)]' : ''
          } ${activeClass} ${className}`}
          style={{ width: size, height: size }}
        >
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full overflow-visible transition-transform duration-300 group-hover:scale-110">
            <defs>
              <linearGradient id="attendPad" x1="10" y1="8" x2="38" y2="42" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="20%" stopColor="var(--athlon-surface-hover, #334155)" />
                <stop offset="100%" stopColor="var(--athlon-card)" />
              </linearGradient>
              <linearGradient id="greenCheckBadge" x1="26" y1="24" x2="42" y2="40" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#86EFAC" />
                <stop offset="50%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#047857" />
              </linearGradient>
            </defs>
            <ellipse cx="24" cy="43" rx="14" ry="2.5" fill="rgba(0,0,0,0.5)" />
            {/* Clipboard Sheet */}
            <rect x="11" y="9" width="26" height="33" rx="4" fill="url(#attendPad)" stroke="var(--athlon-border)" strokeWidth="1" />
            <rect x="18" y="6" width="12" height="5" rx="2" fill="var(--athlon-primary)" stroke="#FFFFFF" strokeWidth="0.8" />
            {/* Checklist items with green ticks */}
            <rect x="15" y="16" width="4" height="4" rx="1" fill="#10B981" />
            <path d="M16 18L17 19L19.5 16.5" stroke="#000000" strokeWidth="1" strokeLinecap="round" />
            <rect x="22" y="17" width="11" height="2" rx="1" fill="rgba(255,255,255,0.4)" />

            <rect x="15" y="23" width="4" height="4" rx="1" fill="#10B981" />
            <path d="M16 25L17 26L19.5 23.5" stroke="#000000" strokeWidth="1" strokeLinecap="round" />
            <rect x="22" y="24" width="10" height="2" rx="1" fill="rgba(255,255,255,0.4)" />

            <rect x="15" y="30" width="4" height="4" rx="1" fill="#10B981" />
            <path d="M16 32L17 33L19.5 30.5" stroke="#000000" strokeWidth="1" strokeLinecap="round" />
            <rect x="22" y="31" width="8" height="2" rx="1" fill="rgba(255,255,255,0.3)" />

            {/* Glowing 3D Check Stamp */}
            <circle cx="34" cy="34" r="6" fill="url(#greenCheckBadge)" stroke="#FFFFFF" strokeWidth="1" filter="drop-shadow(0 2px 6px rgba(16,185,129,0.6))" />
            <path d="M31 34L33 36L37 32" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      );

    case 'schedule':
      return (
        <div
          className={`relative flex items-center justify-center transition-all ${
            active ? 'filter drop-shadow-[0_4px_10px_var(--athlon-primary-glow)]' : ''
          } ${activeClass} ${className}`}
          style={{ width: size, height: size }}
        >
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full overflow-visible transition-transform duration-300 group-hover:scale-110">
            <defs>
              <linearGradient id="calTop" x1="10" y1="8" x2="38" y2="16" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FB923C" />
                <stop offset="50%" stopColor="#EA580C" />
                <stop offset="100%" stopColor="#9A3412" />
              </linearGradient>
              <linearGradient id="clockDial" x1="26" y1="22" x2="42" y2="40" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="50%" stopColor="var(--athlon-primary)" />
                <stop offset="100%" stopColor="#041E17" />
              </linearGradient>
            </defs>
            <ellipse cx="24" cy="43" rx="15" ry="2.5" fill="rgba(0,0,0,0.5)" />
            {/* Calendar Body */}
            <rect x="9" y="10" width="30" height="30" rx="5" fill="var(--athlon-card)" stroke="var(--athlon-border)" strokeWidth="1" />
            {/* Orange Top Header */}
            <path d="M9 15C9 12.2 11.2 10 14 10H34C36.8 10 39 12.2 39 15V17H9V15Z" fill="url(#calTop)" />
            {/* Spiral Rings */}
            <rect x="15" y="7" width="3" height="6" rx="1.5" fill="#FFFFFF" />
            <rect x="30" y="7" width="3" height="6" rx="1.5" fill="#FFFFFF" />
            {/* Calendar grid dots */}
            <circle cx="15" cy="23" r="1.5" fill="rgba(255,255,255,0.4)" />
            <circle cx="21" cy="23" r="1.5" fill="rgba(255,255,255,0.4)" />
            <circle cx="15" cy="29" r="1.5" fill="rgba(255,255,255,0.4)" />
            <circle cx="21" cy="29" r="1.5" fill="rgba(255,255,255,0.4)" />
            {/* Overlapping 3D Clock on bottom right */}
            <circle cx="32" cy="31" r="8" fill="url(#clockDial)" stroke="#FFFFFF" strokeWidth="1.2" filter="drop-shadow(0 2px 6px rgba(0,0,0,0.5))" />
            <path d="M32 26V31L35 33" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" />
            <circle cx="32" cy="31" r="1" fill="#000000" />
          </svg>
        </div>
      );

    case 'performance':
      return (
        <div
          className={`relative flex items-center justify-center transition-all ${
            active ? 'filter drop-shadow-[0_4px_10px_var(--athlon-primary-glow)]' : ''
          } ${activeClass} ${className}`}
          style={{ width: size, height: size }}
        >
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full overflow-visible transition-transform duration-300 group-hover:scale-110">
            <defs>
              <linearGradient id="bar1" x1="10" y1="28" x2="16" y2="40" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#38BDF8" />
                <stop offset="100%" stopColor="#0284C7" />
              </linearGradient>
              <linearGradient id="bar2" x1="18" y1="20" x2="24" y2="40" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#818CF8" />
                <stop offset="100%" stopColor="#4F46E5" />
              </linearGradient>
              <linearGradient id="bar3" x1="26" y1="12" x2="32" y2="40" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="40%" stopColor="var(--athlon-primary)" />
                <stop offset="100%" stopColor="var(--athlon-primary-dark, #008770)" />
              </linearGradient>
            </defs>
            <ellipse cx="24" cy="43" rx="16" ry="2.5" fill="rgba(0,0,0,0.5)" />
            {/* 3D Vertical Metric Bars */}
            <rect x="10" y="27" width="6" height="13" rx="2" fill="url(#bar1)" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" />
            <rect x="19" y="19" width="6" height="21" rx="2" fill="url(#bar2)" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" />
            <rect x="28" y="11" width="6" height="29" rx="2" fill="url(#bar3)" stroke="#FFFFFF" strokeWidth="0.9" />
            {/* Ascending Neon Trend Arrow */}
            <path d="M8 32L19 22L27 26L39 10" stroke="#FDE047" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" filter="drop-shadow(0 2px 5px rgba(253,224,71,0.6))" />
            <polygon points="41,9 35,9 40,14" fill="#FDE047" />
          </svg>
        </div>
      );

    case 'finances':
      return (
        <div
          className={`relative flex items-center justify-center transition-all ${
            active ? 'filter drop-shadow-[0_4px_10px_var(--athlon-primary-glow)]' : ''
          } ${activeClass} ${className}`}
          style={{ width: size, height: size }}
        >
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full overflow-visible transition-transform duration-300 group-hover:scale-110">
            <defs>
              <linearGradient id="cardGrad" x1="6" y1="12" x2="38" y2="34" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="35%" stopColor="var(--athlon-primary)" />
                <stop offset="85%" stopColor="var(--athlon-primary-dark, #008770)" />
                <stop offset="100%" stopColor="#041E17" />
              </linearGradient>
              <linearGradient id="goldCoin" x1="24" y1="22" x2="42" y2="40" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FEF08A" />
                <stop offset="40%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#78350F" />
              </linearGradient>
            </defs>
            <ellipse cx="24" cy="43" rx="16" ry="2.5" fill="rgba(0,0,0,0.5)" />
            {/* 3D Floating Credit Card */}
            <rect x="7" y="12" width="30" height="20" rx="3.5" transform="rotate(-10 7 12)" fill="url(#cardGrad)" stroke="#FFFFFF" strokeWidth="0.9" filter="drop-shadow(0 4px 10px var(--athlon-primary-glow))" />
            <line x1="8" y1="19" x2="36" y2="14" stroke="#000000" strokeWidth="3" opacity="0.6" />
            <circle cx="16" cy="26" r="2.5" fill="#FEF08A" opacity="0.9" />
            <circle cx="20" cy="25" r="2.5" fill="#F87171" opacity="0.8" />
            {/* Stack of Gold Coins on bottom right */}
            <ellipse cx="33" cy="38" rx="8" ry="3" fill="#B45309" />
            <ellipse cx="33" cy="36" rx="8" ry="3" fill="#D97706" />
            <ellipse cx="33" cy="33" rx="8" ry="3" fill="url(#goldCoin)" stroke="#FFFFFF" strokeWidth="0.8" filter="drop-shadow(0 2px 5px rgba(245,158,11,0.6))" />
            <text x="33" y="35.5" fill="#78350F" fontSize="6.5" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">₹</text>
          </svg>
        </div>
      );

    case 'inventory':
      return (
        <div
          className={`relative flex items-center justify-center transition-all ${
            active ? 'filter drop-shadow-[0_4px_10px_var(--athlon-primary-glow)]' : ''
          } ${activeClass} ${className}`}
          style={{ width: size, height: size }}
        >
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full overflow-visible transition-transform duration-300 group-hover:scale-110">
            <defs>
              <linearGradient id="boxTop" x1="12" y1="12" x2="36" y2="24" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FED7AA" />
                <stop offset="50%" stopColor="#F97316" />
                <stop offset="100%" stopColor="#C2410C" />
              </linearGradient>
              <linearGradient id="boxSide" x1="12" y1="20" x2="36" y2="40" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="var(--athlon-card)" />
                <stop offset="100%" stopColor="#0B1322" />
              </linearGradient>
            </defs>
            <ellipse cx="24" cy="43" rx="15" ry="3" fill="rgba(0,0,0,0.5)" />
            {/* 3D Isometric Crate Body */}
            <path d="M10 21L24 28L38 21V35L24 42L10 35V21Z" fill="url(#boxSide)" stroke="var(--athlon-border)" strokeWidth="0.9" />
            <path d="M24 28V42" stroke="var(--athlon-border)" strokeWidth="1" />
            {/* Box Top Opening Flaps */}
            <path d="M10 21L24 14L38 21L24 28L10 21Z" fill="url(#boxTop)" stroke="#FFFFFF" strokeWidth="0.8" />
            {/* Shuttlecock popping out */}
            <circle cx="24" cy="12" r="3" fill="#FFFFFF" stroke="var(--athlon-primary)" strokeWidth="0.8" />
            <path d="M21 15L24 12L27 15" stroke="#FFFFFF" strokeWidth="1.2" />
          </svg>
        </div>
      );

    case 'facilities':
      return (
        <div
          className={`relative flex items-center justify-center transition-all ${
            active ? 'filter drop-shadow-[0_4px_10px_var(--athlon-primary-glow)]' : ''
          } ${activeClass} ${className}`}
          style={{ width: size, height: size }}
        >
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full overflow-visible transition-transform duration-300 group-hover:scale-110">
            <defs>
              <linearGradient id="pinGrad" x1="14" y1="8" x2="34" y2="38" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#F0ABFC" />
                <stop offset="40%" stopColor="#C026D3" />
                <stop offset="100%" stopColor="#701A75" />
              </linearGradient>
            </defs>
            {/* Radar Circular Rings */}
            <ellipse cx="24" cy="42" rx="14" ry="3" stroke="#C026D3" strokeWidth="1" opacity="0.5" />
            <ellipse cx="24" cy="42" rx="8" ry="2" stroke="var(--athlon-primary)" strokeWidth="1.2" opacity="0.8" />
            {/* 3D Map Pin Stadium Beacon */}
            <path d="M24 7C17.4 7 12 12.4 12 19C12 27 22 38 24 39C26 38 36 27 36 19C36 12.4 30.6 7 24 7Z" fill="url(#pinGrad)" stroke="#FFFFFF" strokeWidth="1" filter="drop-shadow(0 4px 10px rgba(192,38,211,0.5))" />
            {/* Center Stadium / Court Icon in Pin */}
            <circle cx="24" cy="18" r="6" fill="#FFFFFF" />
            <rect x="21" y="15" width="6" height="6" rx="1" fill="var(--athlon-primary)" />
            <line x1="24" y1="15" x2="24" y2="21" stroke="#FFFFFF" strokeWidth="0.8" />
          </svg>
        </div>
      );

    case 'settings':
      return (
        <div
          className={`relative flex items-center justify-center transition-all ${
            active ? 'filter drop-shadow-[0_4px_10px_var(--athlon-primary-glow)]' : ''
          } ${activeClass} ${className}`}
          style={{ width: size, height: size }}
        >
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full overflow-visible transition-transform duration-300 group-hover:scale-110">
            <defs>
              <linearGradient id="gearMain" x1="12" y1="12" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="30%" stopColor="#94A3B8" />
                <stop offset="70%" stopColor="var(--athlon-primary)" />
                <stop offset="100%" stopColor="#0B1915" />
              </linearGradient>
              <linearGradient id="gearSmall" x1="24" y1="24" x2="42" y2="42" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#E2E8F0" />
                <stop offset="50%" stopColor="var(--athlon-card)" />
                <stop offset="100%" stopColor="#0F172A" />
              </linearGradient>
            </defs>
            <ellipse cx="24" cy="43" rx="14" ry="2.5" fill="rgba(0,0,0,0.5)" />
            {/* Small Gear 2 (Bottom Right) */}
            <circle cx="34" cy="33" r="7" fill="url(#gearSmall)" stroke="var(--athlon-border)" strokeWidth="1" />
            <circle cx="34" cy="33" r="3" fill="#000000" />
            {/* Main Gear 1 (Center Top) */}
            <circle cx="21" cy="20" r="11" fill="url(#gearMain)" stroke="#FFFFFF" strokeWidth="1" filter="drop-shadow(0 3px 8px rgba(0,0,0,0.5))" />
            {/* Gear Teeth Cutouts */}
            <circle cx="21" cy="20" r="5" fill="#041E17" stroke="var(--athlon-primary)" strokeWidth="1.2" />
            <circle cx="21" cy="20" r="2.5" fill="#FFFFFF" />
          </svg>
        </div>
      );

    case 'livestream':
      return (
        <div
          className={`relative flex items-center justify-center transition-all ${
            active ? 'filter drop-shadow-[0_4px_10px_rgba(239,68,68,0.5)]' : ''
          } ${activeClass} ${className}`}
          style={{ width: size, height: size }}
        >
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full overflow-visible transition-transform duration-300 group-hover:scale-110">
            <defs>
              <linearGradient id="camBody" x1="8" y1="12" x2="32" y2="36" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="25%" stopColor="var(--athlon-surface-hover, #334155)" />
                <stop offset="80%" stopColor="var(--athlon-card)" />
                <stop offset="100%" stopColor="#0B1322" />
              </linearGradient>
              <linearGradient id="lensGrad" x1="30" y1="16" x2="42" y2="32" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#F87171" />
                <stop offset="50%" stopColor="#EF4444" />
                <stop offset="100%" stopColor="#7F1D1D" />
              </linearGradient>
            </defs>
            <ellipse cx="24" cy="43" rx="14" ry="2.5" fill="rgba(0,0,0,0.5)" />
            {/* Camera Main Body */}
            <rect x="8" y="16" width="22" height="18" rx="4" fill="url(#camBody)" stroke="var(--athlon-border)" strokeWidth="1" />
            {/* Top Tape Handle */}
            <path d="M12 16V12H26V16" stroke="var(--athlon-primary)" strokeWidth="2" strokeLinecap="round" />
            {/* Optical Cone Lens */}
            <path d="M30 20L40 14V36L30 30V20Z" fill="url(#lensGrad)" stroke="#FFFFFF" strokeWidth="0.8" filter="drop-shadow(0 2px 6px rgba(239,68,68,0.6))" />
            {/* Center Lens Glass */}
            <circle cx="19" cy="25" r="4.5" fill="#041E17" stroke="var(--athlon-primary)" strokeWidth="1" />
            <circle cx="19" cy="25" r="2" fill="#38BDF8" />
            {/* Red Blinking REC dot */}
            <circle cx="12" cy="20" r="1.8" fill="#EF4444" filter="drop-shadow(0 0 4px #EF4444)" />
          </svg>
        </div>
      );

    case 'setup':
      return (
        <div
          className={`relative flex items-center justify-center transition-all ${
            active ? 'filter drop-shadow-[0_4px_10px_rgba(245,158,11,0.5)]' : ''
          } ${activeClass} ${className}`}
          style={{ width: size, height: size }}
        >
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full overflow-visible transition-transform duration-300 group-hover:scale-110">
            <defs>
              <linearGradient id="consoleBody" x1="8" y1="12" x2="40" y2="38" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="20%" stopColor="var(--athlon-surface)" />
                <stop offset="80%" stopColor="var(--athlon-card)" />
                <stop offset="100%" stopColor="#0B1320" />
              </linearGradient>
              <linearGradient id="amberGold" x1="12" y1="14" x2="36" y2="34" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FDE68A" />
                <stop offset="50%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#B45309" />
              </linearGradient>
            </defs>
            <ellipse cx="24" cy="43" rx="14" ry="2.5" fill="rgba(0,0,0,0.5)" />
            {/* Console Base Plate */}
            <rect x="7" y="14" width="34" height="22" rx="5" fill="url(#consoleBody)" stroke="var(--athlon-border)" strokeWidth="1" />
            
            {/* 3 Slider Tracks */}
            <line x1="14" y1="19" x2="14" y2="31" stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeLinecap="round" />
            <line x1="24" y1="19" x2="24" y2="31" stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeLinecap="round" />
            <line x1="34" y1="19" x2="34" y2="31" stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeLinecap="round" />
            
            {/* Slider Faders / Knobs */}
            <rect x="11.5" y="21" width="5" height="4" rx="1.5" fill="url(#amberGold)" stroke="#FFFFFF" strokeWidth="0.8" filter="drop-shadow(0 1px 3px rgba(245,158,11,0.5))" />
            <rect x="21.5" y="26" width="5" height="4" rx="1.5" fill="var(--athlon-primary)" stroke="#FFFFFF" strokeWidth="0.8" filter="drop-shadow(0 1px 3px var(--athlon-primary-glow))" />
            <rect x="31.5" y="23" width="5" height="4" rx="1.5" fill="url(#amberGold)" stroke="#FFFFFF" strokeWidth="0.8" filter="drop-shadow(0 1px 3px rgba(245,158,11,0.5))" />

            {/* Top Indicator Status Light */}
            <circle cx="24" cy="11" r="2" fill="var(--athlon-primary)" filter="drop-shadow(0 0 5px var(--athlon-primary))" />
          </svg>
        </div>
      );
  }
}
