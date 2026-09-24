'use client';

import React, { useId } from 'react';
import { useAthlonTheme } from '@/providers/athlon-theme-provider';

export interface SportCardSkeletonBackgroundProps {
  sport?: string;
  className?: string;
  showEnergyRail?: boolean;
  opacity?: number;
}

export function SportCardSkeletonBackground({
  sport = '',
  className = '',
  showEnergyRail = true,
  opacity,
}: SportCardSkeletonBackgroundProps) {
  const uniqueId = useId().replace(/:/g, '');
  const beamGradId = `sportCardBeam_${uniqueId}`;

  const { mode } = useAthlonTheme();
  const isDark = mode !== 'light';

  // ── Mode-Aware Color Mapping ──
  // Light theme: uses selected theme color (vibrant & clean on light card)
  // Dark theme: uses card's slate-grey palette (avoids green glare, high contrast for card contents)
  const strokeColor = isDark ? '#64748B' : 'var(--sport-skel-stroke, var(--athlon-primary))';
  const fillColor = isDark ? 'rgba(255, 255, 255, 0.04)' : 'var(--sport-skel-fill, var(--athlon-primary-soft, rgba(84, 172, 104, 0.15)))';
  const fillSolidColor = isDark ? '#475569' : 'var(--sport-skel-fill-solid, var(--athlon-primary))';
  const textColor = isDark ? '#94A3B8' : 'var(--sport-skel-text, var(--athlon-primary))';
  const dotColor = isDark ? '#475569' : 'var(--sport-skel-dot, var(--athlon-primary))';
  const dotOpacity = isDark ? 0.28 : 0.14;
  const turfColor = isDark ? '#1E293B' : 'var(--sport-skel-turf, var(--athlon-primary))';
  const turfOpacity = isDark ? 0.08 : 0.035;
  const railColor = isDark ? '#475569' : 'var(--sport-skel-rail, var(--athlon-primary))';
  const railOpacity = isDark ? 0.45 : 0.75;
  const beamColor = isDark ? '#475569' : 'var(--sport-skel-beam, var(--athlon-primary))';
  const beamOpacity = isDark ? 0.18 : 0.25;
  const haloBg1 = isDark
    ? 'radial-gradient(circle, rgba(255, 255, 255, 0.06) 0%, transparent 70%)'
    : 'var(--sport-skel-halo-1, radial-gradient(circle, var(--athlon-primary) 0%, rgba(52, 211, 153, 0.3) 40%, transparent 75%))';
  const haloOpacity1 = isDark ? 0.12 : 0.35;
  const haloBg2 = isDark
    ? 'radial-gradient(circle, rgba(255, 255, 255, 0.03) 0%, transparent 70%)'
    : 'var(--sport-skel-halo-2, radial-gradient(circle, var(--athlon-primary-light, #54AC68) 0%, rgba(34, 197, 94, 0.2) 50%, transparent 80%))';
  const haloOpacity2 = isDark ? 0.06 : 0.18;
  const sparkColor = isDark ? '#64748B' : 'var(--sport-skel-spark, var(--athlon-primary))';
  const sparkOpacity = isDark ? 0.35 : 0.6;

  const normalized = (sport || '').toUpperCase();
  const isCricket = normalized.includes('CRICKET');
  const isFootball = normalized.includes('FOOTBALL') || normalized.includes('SOCCER');
  const isVolleyball = normalized.includes('VOLLEY');
  const isBasketball = normalized.includes('BASKET');
  const isTennis = normalized.includes('TENNIS') || normalized.includes('PICKLE');
  const isBadminton =
    normalized.includes('BADMINTON') ||
    normalized.includes('SHUTTLE') ||
    normalized.includes('DOUBLES') ||
    normalized.includes('SINGLES') ||
    (!isCricket && !isFootball && !isVolleyball && !isBasketball && !isTennis);

  return (
    <div
      className={`absolute inset-0 pointer-events-none select-none overflow-hidden z-0 ${isDark ? 'sport-skel-dark' : 'sport-skel-light'} ${className}`}
      style={{ opacity: opacity ?? 1 }}
      aria-hidden="true"
    >
      {/* 1. Top Edge Accent Rail */}
      {showEnergyRail && (
        <div
          className="absolute top-0 inset-x-0 h-[2px] pointer-events-none z-10"
          style={{
            opacity: railOpacity,
            background: `linear-gradient(90deg, transparent 0%, ${railColor} 50%, transparent 100%)`,
          }}
        />
      )}

      {/* 2. Stadium Floodlight Spotlight Beams & Halos */}
      <div
        className="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl pointer-events-none z-0"
        style={{
          background: haloBg1,
          opacity: haloOpacity1,
        }}
      />
      <div
        className="absolute -bottom-12 -left-12 w-44 h-44 rounded-full blur-3xl pointer-events-none z-0"
        style={{
          background: haloBg2,
          opacity: haloOpacity2,
        }}
      />

      {/* 3. Tech Dot-Matrix Pattern with Precision Radial Vignette Fade */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `radial-gradient(circle, ${dotColor} 1.2px, transparent 1.2px)`,
          backgroundSize: '16px 16px',
          opacity: dotOpacity,
          maskImage: 'radial-gradient(ellipse 85% 85% at 75% 25%, black 20%, transparent 80%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 85% 85% at 75% 25%, black 20%, transparent 80%)',
        }}
      />

      {/* 4. Diagonal Athletic Turf / Carbon Speed Texture */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, ${turfColor} 0, ${turfColor} 1px, transparent 0, transparent 12px)`,
          opacity: turfOpacity,
        }}
      />

      {/* 5. Comprehensive Vector Wireframe Skeleton SVGs */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden z-0"
        viewBox="0 0 360 220"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={beamGradId} x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={beamColor} stopOpacity="0.32" />
            <stop offset="100%" stopColor={beamColor} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Stadium Floodlight Cones */}
        <polygon
          points="340,-20 200,240 250,240 370,-20"
          fill={`url(#${beamGradId})`}
          style={{ opacity: beamOpacity }}
        />

        {/* ── SPORT SPECIFIC WIREFRAME SKELETONS ── */}

        {/* ─── CASE A: BADMINTON SKELETON ─── */}
        {isBadminton && (
          <g>
            {/* 1. Full Isometric 3D Badminton Court with Center Net Line & Service Boxes */}
            <g transform="translate(18, 105)" opacity="0.35" stroke={strokeColor}>
              {/* Outer boundary polygon */}
              <polygon points="0,55 85,16 170,55 85,94" fill="none" strokeWidth="1.2" />
              {/* Center dividing net line and net posts */}
              <line x1="85" y1="16" x2="85" y2="94" strokeWidth="1.6" />
              <line x1="85" y1="12" x2="85" y2="16" strokeWidth="2.2" strokeLinecap="round" />
              <line x1="85" y1="94" x2="85" y2="98" strokeWidth="2.2" strokeLinecap="round" />
              {/* Short service lines */}
              <line x1="62" y1="27" x2="62" y2="83" strokeWidth="0.8" strokeDasharray="3 2" />
              <line x1="108" y1="27" x2="108" y2="83" strokeWidth="0.8" strokeDasharray="3 2" />
              {/* Center service lines */}
              <line x1="14" y1="49" x2="62" y2="49" strokeWidth="0.75" />
              <line x1="108" y1="61" x2="156" y2="61" strokeWidth="0.75" />
              {/* Doubles long service line / tramline */}
              <line x1="8" y1="51" x2="162" y2="51" strokeWidth="0.65" opacity="0.65" />
              {/* Technical court dimension marker */}
              <text x="75" y="108" fill={textColor} fontSize="6" fontFamily="monospace" opacity="0.6">
                13.4M × 6.1M
              </text>
            </g>

            {/* 2. Isometric Tournament Badminton Racket Skeleton */}
            <g transform="translate(36, 48) rotate(-26)" opacity="0.38" stroke={strokeColor}>
              {/* Head rim */}
              <ellipse cx="0" cy="0" rx="16" ry="22" fill="none" strokeWidth="1.3" />
              <ellipse cx="0" cy="0" rx="14.5" ry="20.5" fill="none" strokeWidth="0.5" opacity="0.7" />
              {/* String matrix */}
              <line x1="-10" y1="-13" x2="-10" y2="13" strokeWidth="0.5" />
              <line x1="-5" y1="-19" x2="-5" y2="19" strokeWidth="0.5" />
              <line x1="0" y1="-22" x2="0" y2="22" strokeWidth="0.6" />
              <line x1="5" y1="-19" x2="5" y2="19" strokeWidth="0.5" />
              <line x1="10" y1="-13" x2="10" y2="13" strokeWidth="0.5" />
              <line x1="-13" y1="-11" x2="13" y2="-11" strokeWidth="0.5" />
              <line x1="-15" y1="-5.5" x2="15" y2="-5.5" strokeWidth="0.5" />
              <line x1="-16" y1="0" x2="16" y2="0" strokeWidth="0.6" />
              <line x1="-15" y1="5.5" x2="15" y2="5.5" strokeWidth="0.5" />
              <line x1="-13" y1="11" x2="13" y2="11" strokeWidth="0.5" />
              {/* T-joint & Shaft */}
              <polygon points="-4,21 4,21 1.5,28 -1.5,28" fill={fillColor} strokeWidth="0.9" />
              <line x1="0" y1="28" x2="0" y2="58" strokeWidth="1.5" />
              {/* Handle */}
              <rect x="-2.5" y="58" width="5" height="24" rx="1" strokeWidth="1" />
              <line x1="-2.5" y1="64" x2="2.5" y2="65" strokeWidth="0.5" />
              <line x1="-2.5" y1="70" x2="2.5" y2="71" strokeWidth="0.5" />
              <line x1="-2.5" y1="76" x2="2.5" y2="77" strokeWidth="0.5" />
            </g>

            {/* 3. Detailed Tournament Feather Shuttlecock Skeleton */}
            <g transform="translate(255, 34) rotate(26) scale(0.85)" opacity="0.45" stroke={strokeColor}>
              {/* Flight velocity wake arcs */}
              <path d="M -16 6 Q -28 12 -38 14" fill="none" strokeWidth="0.75" strokeDasharray="3 3" opacity="0.45" />
              <path d="M -14 0 Q -26 5 -34 6" fill="none" strokeWidth="0.65" strokeDasharray="2 3" opacity="0.35" />
              {/* Feather cone flared contours */}
              <path d="M -5 7 C -7 -2 -11 -12 -16 -23" fill="none" strokeWidth="1.2" />
              <path d="M 5 7 C 7 -2 11 -12 16 -23" fill="none" strokeWidth="1.2" />
              {/* 16 Overlapping Feather Shafts (Rachis spines) */}
              <line x1="0" y1="7" x2="0" y2="-24.5" strokeWidth="0.8" />
              <line x1="-1.8" y1="7" x2="-3.2" y2="-24.2" strokeWidth="0.65" />
              <line x1="1.8" y1="7" x2="3.2" y2="-24.2" strokeWidth="0.65" />
              <line x1="-3.5" y1="7" x2="-6.8" y2="-24" strokeWidth="0.65" />
              <line x1="3.5" y1="7" x2="6.8" y2="-24" strokeWidth="0.65" />
              <line x1="-4.6" y1="7" x2="-11" y2="-23.6" strokeWidth="0.65" />
              <line x1="4.6" y1="7" x2="11" y2="-23.6" strokeWidth="0.65" />
              {/* Scalloped crown feather tips */}
              <path
                d="M -16 -23 C -15.5 -26.5 -12.5 -26.5 -11 -23.5 C -10 -27 -7 -27 -5.5 -24 C -4.5 -27.5 -1.5 -27.5 0 -24.5 C 1.5 -27.5 4.5 -27.5 5.5 -24 C 7 -27 10 -27 11 -23.5 C 12.5 -26.5 15.5 -26.5 16 -23"
                fill="none"
                strokeWidth="0.9"
                strokeLinecap="round"
              />
              {/* Twin circumferential binding threads */}
              <ellipse cx="0" cy="-6" rx="8.5" ry="2" fill="none" strokeWidth="0.9" strokeDasharray="2 1.5" />
              <ellipse cx="0" cy="-14.5" rx="12.2" ry="2.6" fill="none" strokeWidth="0.9" strokeDasharray="2.5 1.5" />
              {/* Cork base collar & rounded dome */}
              <rect x="-5" y="7" width="10" height="3" rx="0.5" fill={fillColor} strokeWidth="0.9" />
              <path d="M -5 10 C -5 15.5 5 15.5 5 10 Z" fill={fillColor} strokeWidth="1.1" />
            </g>
          </g>
        )}

        {/* ─── CASE B: CRICKET SKELETON ─── */}
        {isCricket && (
          <g>
            {/* 1. Full 22-Yard Cricket Pitch & Crease Geometry */}
            <g transform="translate(35, 100)" opacity="0.35" stroke={strokeColor}>
              {/* 30-yard fielding oval boundary ellipse */}
              <ellipse cx="85" cy="50" rx="115" ry="58" fill="none" strokeWidth="0.75" strokeDasharray="4 3" opacity="0.45" />
              {/* Pitch strip rectangle */}
              <polygon points="25,50 85,20 145,50 85,80" fill="none" strokeWidth="1.2" />
              <line x1="55" y1="35" x2="115" y2="65" strokeWidth="0.6" strokeDasharray="2 2" />
              {/* Bowling & Popping Creases at Both Ends */}
              <line x1="38" y1="44" x2="52" y2="58" strokeWidth="1" />
              <line x1="34" y1="42" x2="48" y2="56" strokeWidth="0.75" strokeDasharray="2 1" />
              <line x1="118" y1="42" x2="132" y2="56" strokeWidth="1" />
              <line x1="122" y1="44" x2="136" y2="58" strokeWidth="0.75" strokeDasharray="2 1" />
              {/* Pitch distance technical marker */}
              <text x="68" y="94" fill={textColor} fontSize="6" fontFamily="monospace" opacity="0.6">
                PITCH: 20.12M (22 YDS)
              </text>
            </g>

            {/* 2. 3D Wicket Stumps & Bails Wireframe */}
            <g transform="translate(270, 38)" opacity="0.4" stroke={strokeColor}>
              {/* Stumps shadow / base plate */}
              <ellipse cx="14" cy="52" rx="18" ry="4" fill="none" strokeWidth="0.6" strokeDasharray="2 2" />
              {/* 3 Vertical Stumps (Off, Middle, Leg) */}
              <rect x="2" y="8" width="3.5" height="42" rx="0.8" fill="none" strokeWidth="0.9" />
              <rect x="12" y="8" width="3.5" height="42" rx="0.8" fill="none" strokeWidth="0.9" />
              <rect x="22" y="8" width="3.5" height="42" rx="0.8" fill="none" strokeWidth="0.9" />
              {/* Stumps top groove notches */}
              <line x1="1" y1="8" x2="6.5" y2="8" strokeWidth="1.2" />
              <line x1="11" y1="8" x2="16.5" y2="8" strokeWidth="1.2" />
              <line x1="21" y1="8" x2="26.5" y2="8" strokeWidth="1.2" />
              {/* Two Cross Bails */}
              <rect x="2" y="5.5" width="11" height="2" rx="0.5" fill={fillColor} strokeWidth="0.8" />
              <rect x="14" y="5.5" width="11" height="2" rx="0.5" fill={fillColor} strokeWidth="0.8" />
              {/* Stumps ground spikes */}
              <line x1="3.5" y1="50" x2="3.5" y2="56" strokeWidth="1" />
              <line x1="13.5" y1="50" x2="13.5" y2="56" strokeWidth="1" />
              <line x1="23.5" y1="50" x2="23.5" y2="56" strokeWidth="1" />
            </g>

            {/* 3. Modern Cricket Bat Profile & Raised Seam Ball */}
            <g transform="translate(32, 28) rotate(-32)" opacity="0.38" stroke={strokeColor}>
              {/* Rubber spiral grip handle */}
              <rect x="-2" y="0" width="4" height="26" rx="1.5" strokeWidth="1" />
              <line x1="-2" y1="6" x2="2" y2="6.5" strokeWidth="0.6" />
              <line x1="-2" y1="12" x2="2" y2="12.5" strokeWidth="0.6" />
              <line x1="-2" y1="18" x2="2" y2="18.5" strokeWidth="0.6" />
              {/* Spliced transition shoulder */}
              <path d="M -2 26 Q -6 32 -7 38 L 7 38 Q 6 32 2 26 Z" fill="none" strokeWidth="1" />
              {/* English Willow blade with prominent spine ridge */}
              <path d="M -7 38 L -7 96 Q 0 100 7 96 L 7 38 Z" fill="none" strokeWidth="1.2" />
              <line x1="0" y1="38" x2="0" y2="94" strokeWidth="0.8" strokeDasharray="3 1" />
            </g>

            {/* 4. Raised Seam Cricket Ball Wireframe */}
            <g transform="translate(195, 26)" opacity="0.4" stroke={strokeColor}>
              <circle cx="0" cy="0" r="14" fill="none" strokeWidth="1.2" />
              {/* Raised seam ellipse with stitched chevrons */}
              <ellipse cx="0" cy="0" rx="14" ry="4.5" fill="none" strokeWidth="0.9" />
              <path d="M -12 0 L -10 1 M -8 -1 L -6 1 M -4 -1 L -2 1 M 0 -1 L 2 1 M 4 -1 L 6 1 M 8 -1 L 10 1" strokeWidth="0.75" />
              {/* Speed radar speed readout */}
              <rect x="-18" y="18" width="36" height="11" rx="2" fill="none" strokeWidth="0.75" strokeDasharray="2 1" />
              <text x="0" y="26" fill={textColor} fontSize="5.5" fontFamily="monospace" textAnchor="middle" opacity="0.8">
                142 KM/H
              </text>
            </g>
          </g>
        )}

        {/* ─── CASE C: FOOTBALL / SOCCER SKELETON ─── */}
        {isFootball && (
          <g>
            {/* 1. Full Isometric 3D Football Pitch */}
            <g transform="translate(25, 95)" opacity="0.35" stroke={strokeColor}>
              {/* Pitch outer perimeter */}
              <polygon points="0,48 85,6 170,48 85,90" fill="none" strokeWidth="1.2" />
              {/* Halfway line */}
              <line x1="42.5" y1="27" x2="127.5" y2="69" strokeWidth="1" />
              {/* Center circle and spot */}
              <ellipse cx="85" cy="48" rx="22" ry="11" fill="none" strokeWidth="0.9" />
              <circle cx="85" cy="48" r="1.5" fill={fillSolidColor} stroke="none" />
              {/* Left Penalty Box & Goal Area */}
              <polygon points="14,41 42,27 54,33 26,47" fill="none" strokeWidth="0.8" />
              <polygon points="6,45 20,38 26,41 12,48" fill="none" strokeWidth="0.65" />
              {/* Right Penalty Box & Goal Area */}
              <polygon points="144,61 116,47 128,53 156,67" fill="none" strokeWidth="0.8" />
              <polygon points="152,65 138,58 144,61 158,68" fill="none" strokeWidth="0.65" />
              {/* Technical pitch dimension marker */}
              <text x="75" y="104" fill={textColor} fontSize="6" fontFamily="monospace" opacity="0.6">
                105M × 68M
              </text>
            </g>

            {/* 2. 3D Goalpost with Hexagonal Net Mesh Wireframe */}
            <g transform="translate(245, 34)" opacity="0.38" stroke={strokeColor}>
              {/* Front goalpost frame */}
              <rect x="0" y="0" width="46" height="28" fill="none" strokeWidth="1.4" />
              {/* Depth support stanchions and rear ground bar */}
              <line x1="0" y1="0" x2="-14" y2="10" strokeWidth="1" />
              <line x1="46" y1="0" x2="32" y2="10" strokeWidth="1" />
              <line x1="0" y1="28" x2="-14" y2="34" strokeWidth="1" />
              <line x1="46" y1="28" x2="32" y2="34" strokeWidth="1" />
              <line x1="-14" y1="10" x2="32" y2="10" strokeWidth="0.9" />
              <line x1="-14" y1="34" x2="32" y2="34" strokeWidth="0.9" />
              {/* Hexagonal / Diamond net netting lines */}
              <line x1="-14" y1="18" x2="32" y2="18" strokeWidth="0.5" strokeDasharray="3 2" />
              <line x1="-14" y1="26" x2="32" y2="26" strokeWidth="0.5" strokeDasharray="3 2" />
              <line x1="-5" y1="10" x2="-5" y2="34" strokeWidth="0.5" strokeDasharray="3 2" />
              <line x1="8" y1="10" x2="8" y2="34" strokeWidth="0.5" strokeDasharray="3 2" />
              <line x1="20" y1="10" x2="20" y2="34" strokeWidth="0.5" strokeDasharray="3 2" />
            </g>

            {/* 3. Classic 32-Panel Truncated Icosahedron Football */}
            <g transform="translate(185, 28)" opacity="0.42" stroke={strokeColor}>
              <circle cx="0" cy="0" r="15" fill="none" strokeWidth="1.2" />
              {/* Central regular pentagon */}
              <polygon points="0,-4 4,-1 2,4 -2,4 -4,-1" fill={fillColor} strokeWidth="0.9" />
              {/* Surrounding hexagon radiating seam lines */}
              <line x1="0" y1="-4" x2="0" y2="-15" strokeWidth="0.8" />
              <line x1="4" y1="-1" x2="14" y2="-4" strokeWidth="0.8" />
              <line x1="2" y1="4" x2="9" y2="12" strokeWidth="0.8" />
              <line x1="-2" y1="4" x2="-9" y2="12" strokeWidth="0.8" />
              <line x1="-4" y1="-1" x2="-14" y2="-4" strokeWidth="0.8" />
              {/* Outer adjacent pentagon hints */}
              <path d="M 0 -15 L 7 -13 L 14 -4" fill="none" strokeWidth="0.7" strokeDasharray="2 1" />
              <path d="M -14 -4 L -7 -13 L 0 -15" fill="none" strokeWidth="0.7" strokeDasharray="2 1" />
            </g>
          </g>
        )}

        {/* ─── CASE D: VOLLEYBALL SKELETON ─── */}
        {isVolleyball && (
          <g>
            {/* 1. Full Isometric 3D Volleyball Court */}
            <g transform="translate(25, 95)" opacity="0.35" stroke={strokeColor}>
              {/* 18m x 9m court boundary */}
              <polygon points="0,50 85,12 170,50 85,88" fill="none" strokeWidth="1.2" />
              {/* Center dividing net line */}
              <line x1="85" y1="12" x2="85" y2="88" strokeWidth="1.6" />
              {/* 3m front-zone attack lines (10-foot lines) */}
              <line x1="56" y1="25" x2="56" y2="75" strokeWidth="0.9" strokeDasharray="3 2" />
              <line x1="114" y1="25" x2="114" y2="75" strokeWidth="0.9" strokeDasharray="3 2" />
              {/* Technical court dimension marker */}
              <text x="75" y="102" fill={textColor} fontSize="6" fontFamily="monospace" opacity="0.6">
                18M × 9M (3M ATTACK LINE)
              </text>
            </g>

            {/* 2. High Volleyball Net with Vertical Red/White Antennae Rods */}
            <g transform="translate(130, 48)" opacity="0.38" stroke={strokeColor}>
              {/* Two sturdy posts with winch cables */}
              <line x1="0" y1="5" x2="0" y2="48" strokeWidth="2.2" strokeLinecap="round" />
              <line x1="85" y1="5" x2="85" y2="48" strokeWidth="2.2" strokeLinecap="round" />
              {/* Top and bottom net horizontal bands */}
              <line x1="0" y1="8" x2="85" y2="8" strokeWidth="1.6" />
              <line x1="0" y1="28" x2="85" y2="28" strokeWidth="1.2" />
              {/* Square net mesh grid */}
              <line x1="0" y1="14" x2="85" y2="14" strokeWidth="0.5" strokeDasharray="2 2" />
              <line x1="0" y1="21" x2="85" y2="21" strokeWidth="0.5" strokeDasharray="2 2" />
              <line x1="20" y1="8" x2="20" y2="28" strokeWidth="0.5" strokeDasharray="2 2" />
              <line x1="42" y1="8" x2="42" y2="28" strokeWidth="0.5" strokeDasharray="2 2" />
              <line x1="64" y1="8" x2="64" y2="28" strokeWidth="0.5" strokeDasharray="2 2" />
              {/* Two vertical antennae rising above net */}
              <line x1="8" y1="-8" x2="8" y2="28" strokeWidth="1.4" strokeLinecap="round" />
              <line x1="77" y1="-8" x2="77" y2="28" strokeWidth="1.4" strokeLinecap="round" />
            </g>

            {/* 3. 18-Panel Curved Wave Volleyball Sphere */}
            <g transform="translate(265, 30)" opacity="0.42" stroke={strokeColor}>
              <circle cx="0" cy="0" r="15" fill="none" strokeWidth="1.2" />
              {/* Characteristic tri-strip spiral wave seams */}
              <path d="M -15 0 C -8 -7 8 -7 15 0" fill="none" strokeWidth="0.9" />
              <path d="M -15 0 C -8 7 8 7 15 0" fill="none" strokeWidth="0.9" />
              <path d="M 0 -15 C -7 -8 -7 8 0 15" fill="none" strokeWidth="0.9" />
              <path d="M 0 -15 C 7 -8 7 8 0 15" fill="none" strokeWidth="0.9" />
              {/* Spike trajectory arrow */}
              <path d="M -22 -12 L -14 -6 L -16 -4" fill="none" strokeWidth="0.9" />
            </g>
          </g>
        )}

        {/* ─── CASE E: BASKETBALL SKELETON ─── */}
        {isBasketball && (
          <g>
            {/* 1. Isometric Basketball Half-Court */}
            <g transform="translate(25, 95)" opacity="0.35" stroke={strokeColor}>
              <polygon points="0,50 85,12 170,50 85,88" fill="none" strokeWidth="1.2" />
              {/* The Key / Paint */}
              <polygon points="62,38 85,28 108,38 85,48" fill="none" strokeWidth="0.9" />
              {/* Free-throw circle */}
              <ellipse cx="85" cy="48" rx="16" ry="8" fill="none" strokeWidth="0.8" strokeDasharray="3 2" />
              {/* 3-Point Arc curve */}
              <path d="M 30 46 C 45 22 125 22 140 46" fill="none" strokeWidth="1" />
            </g>

            {/* 2. Basketball Backboard & Hoop Wireframe */}
            <g transform="translate(260, 32)" opacity="0.4" stroke={strokeColor}>
              {/* Backboard glass */}
              <rect x="0" y="0" width="36" height="24" rx="1.5" fill="none" strokeWidth="1.3" />
              <rect x="10" y="8" width="16" height="12" fill="none" strokeWidth="0.75" />
              {/* Rim and Net */}
              <ellipse cx="18" cy="20" rx="7" ry="2.5" fill="none" strokeWidth="1.2" />
              <path d="M 11 20 L 14 30 L 22 30 L 25 20" fill="none" strokeWidth="0.75" strokeDasharray="2 1" />
            </g>

            {/* 3. 8-Panel Basketball Sphere */}
            <g transform="translate(180, 26)" opacity="0.42" stroke={strokeColor}>
              <circle cx="0" cy="0" r="14" fill="none" strokeWidth="1.2" />
              <line x1="-14" y1="0" x2="14" y2="0" strokeWidth="0.9" />
              <line x1="0" y1="-14" x2="0" y2="14" strokeWidth="0.9" />
              <path d="M -10 -10 C -4 -4 -4 4 -10 10" fill="none" strokeWidth="0.8" />
              <path d="M 10 -10 C 4 -4 4 4 10 10" fill="none" strokeWidth="0.8" />
            </g>
          </g>
        )}

        {/* ─── CASE F: TENNIS / GENERAL / MULTI-SPORT SKELETON (Image 1 Signature Hero Pattern) ─── */}
        {!isBadminton && !isCricket && !isFootball && !isVolleyball && !isBasketball && (
          <g>
            {/* 1. Multi-tier Stadium Arena Bowl Skeleton */}
            <g opacity="0.32" stroke={strokeColor}>
              <ellipse cx="295" cy="55" rx="120" ry="72" fill="none" strokeWidth="1.2" strokeDasharray="3 3" />
              <ellipse cx="295" cy="55" rx="100" ry="60" fill="none" strokeWidth="0.8" opacity="0.6" />
              <ellipse cx="295" cy="55" rx="82" ry="48" fill="none" strokeWidth="1" />
              <ellipse cx="295" cy="55" rx="66" ry="38" fill="none" strokeWidth="0.75" strokeDasharray="2 2" />
              {/* Stadium Radial Truss Ribs */}
              <line x1="295" y1="55" x2="175" y2="55" strokeWidth="0.75" opacity="0.4" />
              <line x1="295" y1="55" x2="200" y2="15" strokeWidth="0.75" opacity="0.5" />
              <line x1="295" y1="55" x2="245" y2="-10" strokeWidth="0.75" opacity="0.5" />
              <line x1="295" y1="55" x2="345" y2="-10" strokeWidth="0.75" opacity="0.5" />
              <line x1="295" y1="55" x2="390" y2="15" strokeWidth="0.75" opacity="0.5" />
              <line x1="295" y1="55" x2="385" y2="95" strokeWidth="0.75" opacity="0.5" />
            </g>

            {/* 2. Isometric Multi-Sport Turf Pitch */}
            <g transform="translate(18, 120)" opacity="0.28" stroke={strokeColor}>
              <polygon points="0,25 90,-20 180,25 90,70" fill="none" strokeWidth="1.2" />
              <line x1="45" y1="2" x2="135" y2="48" strokeWidth="0.9" />
              <ellipse cx="90" cy="25" rx="18" ry="9" fill="none" strokeWidth="0.8" />
              <circle cx="90" cy="25" r="1.5" fill={fillSolidColor} stroke="none" />
            </g>

            {/* 3. Running Track Curved Velocity Lanes */}
            <g opacity="0.28" stroke={strokeColor}>
              <ellipse cx="320" cy="40" rx="145" ry="110" fill="none" strokeWidth="0.8" strokeDasharray="4 4" />
              <ellipse cx="320" cy="40" rx="180" ry="135" fill="none" strokeWidth="1" />
              <ellipse cx="320" cy="40" rx="215" ry="160" fill="none" strokeWidth="0.8" strokeDasharray="2 2" />
            </g>

            {/* 4. Equipment Wireframe (Ball Orbit) */}
            <g transform="translate(240, 36)" opacity="0.35" stroke={strokeColor}>
              <circle cx="0" cy="0" r="14" fill="none" strokeWidth="1.2" />
              <path d="M -14 0 A 14 14 0 0 1 14 0" fill="none" strokeWidth="0.8" />
              <path d="M 0 -14 A 14 14 0 0 1 0 14" fill="none" strokeWidth="0.8" />
              <path d="M -10 -10 C -3 -3, -3 3, -10 10" fill="none" strokeWidth="0.8" strokeDasharray="2 1" />
              <path d="M 10 -10 C 3 -3, 3 3, 10 10" fill="none" strokeWidth="0.8" strokeDasharray="2 1" />
            </g>
          </g>
        )}

        {/* ─── UNIVERSAL TECHNICAL RETICLES & COORDINATE TICKS ─── */}
        <g stroke={strokeColor} opacity="0.32">
          {/* Top-Right Velocity Chevrons */}
          <g transform="translate(305, 14)" strokeWidth="1.5" strokeLinecap="round">
            <line x1="0" y1="0" x2="5" y2="8" />
            <line x1="5" y1="8" x2="0" y2="16" />
            <line x1="7" y1="0" x2="12" y2="8" />
            <line x1="12" y1="8" x2="7" y2="16" />
            <line x1="14" y1="0" x2="19" y2="8" />
            <line x1="19" y1="8" x2="14" y2="16" />
          </g>

          {/* Precision Crosshairs & Corner Angle Brackets */}
          <path d="M 12 12 L 18 12 M 12 12 L 12 18" strokeWidth="1.2" />
          <path d="M 348 208 L 342 208 M 348 208 L 348 202" strokeWidth="1.2" />
          <path d="M 335 150 L 345 150 M 340 145 L 340 155" strokeWidth="0.9" />
          <path d="M 28 205 L 36 205 M 32 201 L 32 209" strokeWidth="0.8" />
        </g>
      </svg>

      {/* 6. Tiny Pulsing Starlight / Stadium Spark Particles */}
      <div
        className="absolute top-6 right-20 w-1.5 h-1.5 rounded-full blur-[0.5px] pointer-events-none z-0"
        style={{
          backgroundColor: sparkColor,
          opacity: sparkOpacity,
        }}
      />
      <div
        className="absolute top-24 right-6 w-1.5 h-1.5 rounded-full blur-[0.5px] pointer-events-none z-0"
        style={{
          backgroundColor: sparkColor,
          opacity: isDark ? 0.15 : 0.4,
        }}
      />
      <div
        className="absolute bottom-10 left-16 w-1 h-1 rounded-full blur-[0.5px] pointer-events-none z-0"
        style={{
          backgroundColor: sparkColor,
          opacity: isDark ? 0.15 : 0.5,
        }}
      />

      {/* 7. Top Specular Arc Light Shimmer */}
      <div className="absolute inset-x-0 top-0 h-[35%] bg-gradient-to-b from-white/[0.10] dark:from-white/[0.04] via-transparent to-transparent pointer-events-none z-0" />
    </div>
  );
}
