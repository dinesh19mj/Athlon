'use client';

import React from 'react';
import Link from 'next/link';
import { MoreHorizontal } from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
  sport: string;
  iconType: 'all' | 'badminton' | 'cricket' | 'football' | 'tennis' | 'pickleball' | 'basketball' | 'more';
}

const CATEGORIES: CategoryItem[] = [
  { id: 'All', name: 'All', sport: 'All', iconType: 'all' },
  { id: 'Badminton', name: 'Badminton', sport: 'Badminton', iconType: 'badminton' },
  { id: 'Cricket', name: 'Cricket', sport: 'Cricket', iconType: 'cricket' },
  { id: 'Football', name: 'Football', sport: 'Football', iconType: 'football' },
  { id: 'Tennis', name: 'Tennis', sport: 'Tennis', iconType: 'tennis' },
  { id: 'Pickleball', name: 'Pickleball', sport: 'Pickleball', iconType: 'pickleball' },
  { id: 'Basketball', name: 'Basketball', sport: 'Basketball', iconType: 'basketball' },
  { id: 'More', name: 'More', sport: 'More', iconType: 'more' },
];

function Sport3DIcon({ type, isSelected }: { type: CategoryItem['iconType']; isSelected: boolean }) {
  switch (type) {
    case 'all':
      return (
        <svg viewBox="0 0 32 32" fill="none" className="w-6 h-6 transition-transform duration-300 group-hover:scale-110">
          <defs>
            <linearGradient id="allTileGrad1" x1="0" y1="0" x2="10" y2="10" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={isSelected ? '#FFFFFF' : 'var(--athlon-primary-light, #54AC68)'} />
              <stop offset="100%" stopColor={isSelected ? '#D1FAE5' : 'var(--athlon-primary, #22C55E)'} />
            </linearGradient>
            <linearGradient id="allTileGrad2" x1="0" y1="0" x2="10" y2="10" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={isSelected ? '#ECFDF5' : '#38BDF8'} />
              <stop offset="100%" stopColor={isSelected ? '#A7F3D0' : '#0284C7'} />
            </linearGradient>
          </defs>
          <rect x="5" y="5" width="9" height="9" rx="3" fill="url(#allTileGrad1)" stroke={isSelected ? '#047857' : 'rgba(255,255,255,0.3)'} strokeWidth="1" />
          <rect x="18" y="5" width="9" height="9" rx="3" fill="url(#allTileGrad2)" stroke={isSelected ? '#047857' : 'rgba(255,255,255,0.3)'} strokeWidth="1" />
          <rect x="5" y="18" width="9" height="9" rx="3" fill="url(#allTileGrad2)" stroke={isSelected ? '#047857' : 'rgba(255,255,255,0.3)'} strokeWidth="1" />
          <rect x="18" y="18" width="9" height="9" rx="3" fill="url(#allTileGrad1)" stroke={isSelected ? '#047857' : 'rgba(255,255,255,0.3)'} strokeWidth="1" />
          <circle cx="9.5" cy="9.5" r="1.5" fill={isSelected ? '#064E3B' : '#FFFFFF'} opacity="0.9" />
          <circle cx="22.5" cy="9.5" r="1.5" fill={isSelected ? '#064E3B' : '#FFFFFF'} opacity="0.9" />
          <circle cx="9.5" cy="22.5" r="1.5" fill={isSelected ? '#064E3B' : '#FFFFFF'} opacity="0.9" />
          <circle cx="22.5" cy="22.5" r="1.5" fill={isSelected ? '#064E3B' : '#FFFFFF'} opacity="0.9" />
        </svg>
      );

    case 'badminton':
      return (
        <svg viewBox="0 0 36 36" fill="none" className="w-7 h-7 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-12">
          <defs>
            {/* 3D Cork Sphere Gradient */}
            <radialGradient id="shuttleCork3D" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="45%" stopColor="#F8FAFC" />
              <stop offset="85%" stopColor="#CBD5E1" />
              <stop offset="100%" stopColor="#64748B" />
            </radialGradient>

            {/* Feathers Cone Gradient */}
            <linearGradient id="shuttleFeatherCone" x1="0" y1="4" x2="0" y2="24" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="50%" stopColor="#F1F5F9" />
              <stop offset="85%" stopColor="#E2E8F0" />
              <stop offset="100%" stopColor="#94A3B8" />
            </linearGradient>

            {/* Accent Collar Ribbon */}
            <linearGradient id="shuttleCollar" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#06B6D4" />
              <stop offset="50%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
          </defs>

          {/* Contact Drop Shadow */}
          <ellipse cx="18" cy="33" rx="10" ry="2" fill="rgba(0,0,0,0.4)" />

          {/* 3D Shuttlecock Body Angled Dynamically */}
          <g transform="translate(18, 18) rotate(-35) translate(-18, -18)">
            {/* Outer Feather Cone Flare */}
            <path
              d="M10 5 C9 5 8 6 9 8 L14 22 C14.5 23 15.5 24 16.5 24 L19.5 24 C20.5 24 21.5 23 22 22 L27 8 C28 6 27 5 26 5 C24 5.5 22 6 18 6 C14 6 12 5.5 10 5 Z"
              fill="url(#shuttleFeatherCone)"
              stroke="rgba(255,255,255,0.7)"
              strokeWidth="0.8"
            />

            {/* Feather Shaft Spines */}
            <line x1="11" y1="6" x2="15.5" y2="22" stroke="#94A3B8" strokeWidth="0.8" opacity="0.8" />
            <line x1="14.5" y1="6" x2="16.5" y2="22" stroke="#CBD5E1" strokeWidth="0.8" opacity="0.9" />
            <line x1="18" y1="6" x2="18" y2="22" stroke="#FFFFFF" strokeWidth="1" />
            <line x1="21.5" y1="6" x2="19.5" y2="22" stroke="#CBD5E1" strokeWidth="0.8" opacity="0.9" />
            <line x1="25" y1="6" x2="20.5" y2="22" stroke="#94A3B8" strokeWidth="0.8" opacity="0.8" />

            {/* Upper & Lower Binding Thread Rings */}
            <path d="M10.8 11 Q18 13.5 25.2 11" stroke="#38BDF8" strokeWidth="0.9" fill="none" opacity="0.9" />
            <path d="M12.5 16.5 Q18 18.5 23.5 16.5" stroke="#38BDF8" strokeWidth="0.9" fill="none" opacity="0.9" />

            {/* Top Scalloped Feather Crown Rim */}
            <path
              d="M10 5 C11 4 12 4.5 13 5.5 C14 4 15 4.5 16 5.8 C17 4 18 4 19 5.8 C20 4.5 21 4 22 5.5 C23 4.5 24 4 25 5 C26 5 26.5 6 26 7 L10 7 C9.5 6 10 5 10 5 Z"
              fill="#FFFFFF"
            />

            {/* Pro Ribbon Band above Cork */}
            <rect x="14.2" y="21.5" width="7.6" height="2.8" rx="1" fill="url(#shuttleCollar)" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />

            {/* 3D Rounded Cork Dome Base */}
            <path
              d="M14.2 23.5 C14.2 27.5 16 30 18 30 C20 30 21.8 27.5 21.8 23.5 Z"
              fill="url(#shuttleCork3D)"
              stroke="rgba(255,255,255,0.6)"
              strokeWidth="0.7"
            />
            {/* Cork Specular Highlight */}
            <ellipse cx="16.5" cy="25.5" rx="1.5" ry="2" fill="#FFFFFF" opacity="0.8" transform="rotate(-15 16.5 25.5)" />
          </g>
        </svg>
      );

    case 'cricket':
      return (
        <svg viewBox="0 0 36 36" fill="none" className="w-7 h-7 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
          <defs>
            <linearGradient id="cricketBladeGrad" x1="12" y1="12" x2="22" y2="32" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FEF3C7" />
              <stop offset="35%" stopColor="#FDE68A" />
              <stop offset="75%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#78350F" />
            </linearGradient>
            <linearGradient id="cricketGripGrad" x1="15" y1="2" x2="19" y2="12" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#A855F7" />
              <stop offset="50%" stopColor="#7E22CE" />
              <stop offset="100%" stopColor="#3B0764" />
            </linearGradient>
            <linearGradient id="cricketBall3D" x1="2" y1="2" x2="10" y2="10" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FF6B6B" />
              <stop offset="45%" stopColor="#DC2626" />
              <stop offset="85%" stopColor="#7F1D1D" />
              <stop offset="100%" stopColor="#450A0A" />
            </linearGradient>
          </defs>
          {/* Shadow */}
          <ellipse cx="18" cy="33" rx="10" ry="2" fill="rgba(0,0,0,0.4)" />
          {/* Bat */}
          <g transform="rotate(-30 18 18) translate(0, -1)">
            {/* Rubber Grip Handle */}
            <rect x="16.5" y="2" width="3.2" height="9" rx="1.5" fill="url(#cricketGripGrad)" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />
            <line x1="16.5" y1="4.5" x2="19.7" y2="4.5" stroke="#FFFFFF" opacity="0.6" strokeWidth="0.6" />
            <line x1="16.5" y1="7.5" x2="19.7" y2="7.5" stroke="#FFFFFF" opacity="0.6" strokeWidth="0.6" />
            {/* Wooden Willow Blade */}
            <path d="M14.5 11 C14.5 11 14.8 28 15 30 C15.2 31.8 21 31.8 21.2 30 C21.4 28 21.7 11 21.7 11 Z" fill="url(#cricketBladeGrad)" stroke="#B45309" strokeWidth="0.8" />
            {/* Spine Center Ridge Highlight */}
            <path d="M18.1 11.5 L18.1 30" stroke="#FFFBEB" strokeWidth="0.9" opacity="0.85" strokeLinecap="round" />
          </g>
          {/* 3D Seamed Leather Ball */}
          <g transform="translate(23, 21)">
            <circle cx="5" cy="5" r="5" fill="url(#cricketBall3D)" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
            <path d="M1.2 3.8 Q5 5 8.8 6.2" stroke="#FFFFFF" strokeWidth="0.9" strokeDasharray="1.2 0.8" opacity="0.9" />
          </g>
        </svg>
      );

    case 'football':
      return (
        <svg viewBox="0 0 36 36" fill="none" className="w-7 h-7 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
          <defs>
            <radialGradient id="soccerSphereGrad" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="45%" stopColor="#F1F5F9" />
              <stop offset="80%" stopColor="#94A3B8" />
              <stop offset="100%" stopColor="#334155" />
            </radialGradient>
            <linearGradient id="soccerPentagonGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="60%" stopColor="#1E40AF" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>
          </defs>
          {/* Shadow */}
          <ellipse cx="18" cy="33" rx="10" ry="2" fill="rgba(0,0,0,0.4)" />
          {/* Main Ball Sphere */}
          <circle cx="18" cy="17" r="13" fill="url(#soccerSphereGrad)" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
          {/* Center Royal Blue Pentagon */}
          <polygon points="18,12.5 21.8,15.2 20.3,19.5 15.7,19.5 14.2,15.2" fill="url(#soccerPentagonGrad)" stroke="#60A5FA" strokeWidth="0.5" />
          {/* Seam Lines */}
          <line x1="18" y1="12.5" x2="18" y2="7" stroke="#475569" strokeWidth="0.9" />
          <line x1="21.8" y1="15.2" x2="27.5" y2="12.5" stroke="#475569" strokeWidth="0.9" />
          <line x1="20.3" y1="19.5" x2="24.5" y2="24.5" stroke="#475569" strokeWidth="0.9" />
          <line x1="15.7" y1="19.5" x2="11.5" y2="24.5" stroke="#475569" strokeWidth="0.9" />
          <line x1="14.2" y1="15.2" x2="8.5" y2="12.5" stroke="#475569" strokeWidth="0.9" />
          {/* Outer Perimeter Pentagons */}
          <polygon points="16,6.5 20,6.5 21,4.5 15,4.5" fill="url(#soccerPentagonGrad)" />
          <polygon points="27.5,12 30.5,14.5 29.5,17.5 26.5,15" fill="url(#soccerPentagonGrad)" />
          <polygon points="24.5,25 26.5,28 23.5,29.5 22.5,26.5" fill="url(#soccerPentagonGrad)" />
          <polygon points="11.5,25 13.5,26.5 12.5,29.5 9.5,28" fill="url(#soccerPentagonGrad)" />
          <polygon points="8.5,12 9.5,15 6.5,17.5 5.5,14.5" fill="url(#soccerPentagonGrad)" />
          {/* Top Specular Arc */}
          <path d="M10 10 A 13 13 0 0 1 24 9" stroke="#FFFFFF" strokeWidth="1.2" opacity="0.75" strokeLinecap="round" />
        </svg>
      );

    case 'tennis':
      return (
        <svg viewBox="0 0 36 36" fill="none" className="w-7 h-7 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
          <defs>
            <linearGradient id="tennisRacketGrad" x1="6" y1="4" x2="24" y2="26" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#F43F5E" />
              <stop offset="50%" stopColor="#BE123C" />
              <stop offset="100%" stopColor="#4C0519" />
            </linearGradient>
            <radialGradient id="tennisBall3D" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="45%" stopColor="#A3E635" />
              <stop offset="85%" stopColor="#65A30D" />
              <stop offset="100%" stopColor="#365314" />
            </radialGradient>
          </defs>
          {/* Shadow */}
          <ellipse cx="18" cy="33" rx="10" ry="2" fill="rgba(0,0,0,0.4)" />
          {/* Racket */}
          <g transform="rotate(-32 16 16) translate(0, -1)">
            <ellipse cx="14" cy="11.5" rx="8" ry="10.5" stroke="url(#tennisRacketGrad)" strokeWidth="2.2" fill="rgba(244, 63, 94, 0.12)" />
            {/* Strings */}
            <line x1="8.5" y1="9" x2="19.5" y2="9" stroke="#FECDD3" strokeWidth="0.65" opacity="0.8" />
            <line x1="7.5" y1="12" x2="20.5" y2="12" stroke="#FECDD3" strokeWidth="0.65" opacity="0.8" />
            <line x1="9" y1="15" x2="19" y2="15" stroke="#FECDD3" strokeWidth="0.65" opacity="0.8" />
            <line x1="11.5" y1="3" x2="11.5" y2="20" stroke="#FECDD3" strokeWidth="0.65" opacity="0.8" />
            <line x1="14" y1="2" x2="14" y2="21" stroke="#FECDD3" strokeWidth="0.65" opacity="0.8" />
            <line x1="16.5" y1="3" x2="16.5" y2="20" stroke="#FECDD3" strokeWidth="0.65" opacity="0.8" />
            {/* Throat & Handle */}
            <path d="M11 21.5 L13 25 L15 25 L17 21.5" stroke="url(#tennisRacketGrad)" strokeWidth="1.8" fill="none" />
            <rect x="12.8" y="25" width="2.4" height="8.5" rx="1" fill="#1E293B" stroke="url(#tennisRacketGrad)" strokeWidth="0.6" />
            <rect x="12.3" y="31.5" width="3.4" height="2" rx="0.5" fill="#FDA4AF" />
          </g>
          {/* 3D Optic Yellow Ball */}
          <g transform="translate(23, 20)">
            <circle cx="5" cy="5" r="5" fill="url(#tennisBall3D)" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />
            <path d="M1.5 2.5 C4.5 4 4.5 6 1.5 7.5" stroke="#FFFFFF" strokeWidth="0.9" fill="none" opacity="0.9" strokeLinecap="round" />
            <path d="M8.5 2.5 C5.5 4 5.5 6 8.5 7.5" stroke="#FFFFFF" strokeWidth="0.9" fill="none" opacity="0.9" strokeLinecap="round" />
          </g>
        </svg>
      );

    case 'pickleball':
      return (
        <svg viewBox="0 0 36 36" fill="none" className="w-7 h-7 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
          <defs>
            <linearGradient id="picklePaddleGrad" x1="8" y1="6" x2="24" y2="26" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="50%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#78350F" />
            </linearGradient>
            <radialGradient id="pickleBallGrad" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="60%" stopColor="#EAB308" />
              <stop offset="100%" stopColor="#854D0E" />
            </radialGradient>
          </defs>
          {/* Shadow */}
          <ellipse cx="18" cy="33" rx="10" ry="2" fill="rgba(0,0,0,0.4)" />
          {/* Paddle */}
          <g transform="rotate(-25 16 16)">
            <rect x="8" y="4" width="13" height="17" rx="4" fill="url(#picklePaddleGrad)" stroke="#FEF3C7" strokeWidth="0.9" />
            <path d="M11 6 H18" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.6" strokeLinecap="round" />
            <rect x="12.5" y="21" width="4" height="9" rx="1.2" fill="#0F172A" stroke="#D97706" strokeWidth="0.6" />
            <line x1="12.5" y1="24" x2="16.5" y2="24" stroke="#FFF" opacity="0.4" strokeWidth="0.6" />
            <line x1="12.5" y1="27" x2="16.5" y2="27" stroke="#FFF" opacity="0.4" strokeWidth="0.6" />
          </g>
          {/* Perforated Wiffle Ball */}
          <g transform="translate(23, 19)">
            <circle cx="5" cy="5" r="5" fill="url(#pickleBallGrad)" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />
            <circle cx="3.5" cy="3.5" r="0.9" fill="#713F12" />
            <circle cx="6.5" cy="3.5" r="0.9" fill="#713F12" />
            <circle cx="5" cy="5.5" r="0.9" fill="#713F12" />
            <circle cx="3.5" cy="7.2" r="0.9" fill="#713F12" />
            <circle cx="6.5" cy="7.2" r="0.9" fill="#713F12" />
          </g>
        </svg>
      );

    case 'basketball':
      return (
        <svg viewBox="0 0 36 36" fill="none" className="w-7 h-7 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
          <defs>
            <radialGradient id="bballSphere" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#FDBA74" />
              <stop offset="40%" stopColor="#EA580C" />
              <stop offset="85%" stopColor="#9A3412" />
              <stop offset="100%" stopColor="#431407" />
            </radialGradient>
          </defs>
          {/* Shadow */}
          <ellipse cx="18" cy="33" rx="10" ry="2" fill="rgba(0,0,0,0.4)" />
          {/* Ball */}
          <circle cx="18" cy="17" r="13" fill="url(#bballSphere)" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" />
          {/* Black Ribs */}
          <line x1="5" y1="17" x2="31" y2="17" stroke="#18181B" strokeWidth="1.2" />
          <line x1="18" y1="4" x2="18" y2="30" stroke="#18181B" strokeWidth="1.2" />
          <path d="M10 6 C15 11 15 23 10 28" stroke="#18181B" strokeWidth="1.2" fill="none" />
          <path d="M26 6 C21 11 21 23 26 28" stroke="#18181B" strokeWidth="1.2" fill="none" />
          {/* Top Specular Arc */}
          <path d="M10 10 A 13 13 0 0 1 24 9" stroke="#FFFFFF" strokeWidth="1.2" opacity="0.6" strokeLinecap="round" />
        </svg>
      );

    default:
      return null;
  }
}

interface MarketCategoryPillsProps {
  selectedSport: string;
  onSelectSport: (sport: string) => void;
  className?: string;
}

export function MarketCategoryPills({
  selectedSport,
  onSelectSport,
  className = '',
}: MarketCategoryPillsProps) {
  return (
    <div className={`w-full overflow-x-auto hide-scrollbar select-none -mx-4 px-4 ${className}`}>
      <div className="flex items-center gap-3.5 sm:gap-5 min-w-max pb-2 pt-1">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedSport.toLowerCase() === cat.sport.toLowerCase();

          if (cat.iconType === 'more') {
            return (
              <Link
                key={cat.id}
                href="/market/search"
                className="flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-300 group-hover:scale-105 active:scale-95 shadow-md relative overflow-hidden backdrop-blur-md"
                  style={{
                    backgroundColor: 'var(--athlon-card, #111A15)',
                    borderColor: 'var(--athlon-border, rgba(255, 255, 255, 0.08))',
                    boxShadow: '0 8px 20px -4px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.1)',
                  }}
                >
                  <div className="absolute inset-x-0 top-0 h-[40%] bg-gradient-to-b from-white/[0.08] to-transparent pointer-events-none" />
                  <MoreHorizontal className="w-6 h-6 text-foreground/60 group-hover:text-primary transition-colors" />
                </div>
                <span className="text-[11px] font-bold text-foreground/60 group-hover:text-foreground">
                  More
                </span>
              </Link>
            );
          }

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectSport(cat.sport)}
              className="flex flex-col items-center gap-1.5 group cursor-pointer active:scale-95 transition-transform"
            >
              {/* 3D Round Pod Button */}
              <div
                className={`
                  w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-300 relative overflow-hidden backdrop-blur-md
                  ${
                    isSelected
                      ? 'scale-105 shadow-xl'
                      : 'hover:scale-105 hover:border-primary/40'
                  }
                `}
                style={
                  isSelected
                    ? {
                        background:
                          'radial-gradient(circle at 35% 25%, var(--athlon-primary-light, #54AC68) 0%, var(--athlon-primary, #349650) 48%, var(--athlon-primary-dark, #0d381c) 85%, #021208 100%)',
                        borderColor: 'var(--athlon-primary)',
                        boxShadow:
                          '0 0 24px -2px var(--athlon-primary-glow), 0 10px 24px -4px rgba(0,0,0,0.8), inset 0 2px 4px rgba(255,255,255,0.5), inset 0 -4px 8px rgba(0,0,0,0.7)',
                      }
                    : {
                        backgroundColor: 'var(--athlon-card, #111A15)',
                        borderColor: 'var(--athlon-border, rgba(255, 255, 255, 0.08))',
                        boxShadow:
                          '0 8px 20px -4px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.1)',
                      }
                }
              >
                {/* Specular Top Glass Highlight Arc */}
                <div
                  className={`absolute inset-x-1 top-0 h-[42%] rounded-t-xl pointer-events-none ${
                    isSelected
                      ? 'bg-gradient-to-b from-white/40 via-white/10 to-transparent'
                      : 'bg-gradient-to-b from-white/[0.08] to-transparent'
                  }`}
                />

                <Sport3DIcon type={cat.iconType} isSelected={isSelected} />
              </div>

              {/* Label & Active Dot Indicator */}
              <div className="flex items-center gap-1">
                {isSelected && (
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{
                      backgroundColor: 'var(--athlon-primary)',
                      boxShadow: '0 0 6px var(--athlon-primary)',
                    }}
                  />
                )}
                <span
                  className={`text-[11px] font-extrabold tracking-tight transition-colors ${
                    isSelected
                      ? 'text-primary drop-shadow-[0_0_8px_var(--athlon-primary-glow)]'
                      : 'text-foreground/70 group-hover:text-foreground'
                  }`}
                  style={{ color: isSelected ? 'var(--athlon-primary)' : undefined }}
                >
                  {cat.name}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default MarketCategoryPills;
