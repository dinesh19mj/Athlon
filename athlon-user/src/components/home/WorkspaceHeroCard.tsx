'use client';

import React from 'react';
import Link from 'next/link';
import {
  Trophy,
  Building2,
  Users,
  User,
  Plus,
  Calendar,
  Layers,
  Sparkles,
  Shield,
} from 'lucide-react';
import { Organization, WorkspaceType } from '@/lib/store/useWorkspaceStore';
import { useAthlonTheme } from '@/hooks/use-athlon-theme';

export interface WorkspaceHeroCardProps {
  activeRole: string; // 'PLAYER' or org ID
  activeOrg?: Organization;
  playerStats?: {
    totalMatches?: number;
    matchesWon?: number;
    winRate?: number;
  } | null;
  playerTournamentCount?: number;
  playerUpcomingMatchesCount?: number;
  organizerStats?: {
    activeTournaments: number;
    registeredPlayers: number;
    upcomingMatches: number;
  };
  otherOrgStats?: Record<string, number | string>;
  isDesktop?: boolean;
}

interface BottomPillar {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number; style?: React.CSSProperties }>;
  title: string;
  subtitle: string;
  href: string;
}

interface HeroDesignConfig {
  badge: string;
  rolePill: string;
  roleIcon: React.ComponentType<{ className?: string }>;
  headlineFirst: string;
  headlineHighlight: string;
  description: string;
  pillars: BottomPillar[];
}

export default function WorkspaceHeroCard({
  activeRole,
  activeOrg,
  isDesktop = false,
}: WorkspaceHeroCardProps) {
  const isPlayer = activeRole === 'PLAYER' || activeRole === 'PERSONAL';
  const orgType: WorkspaceType | undefined = activeOrg?.type;
  const orgId = activeOrg?.id || (activeRole !== 'PLAYER' ? activeRole : '');

  const config: HeroDesignConfig = React.useMemo(() => {
    if (isPlayer) {
      return {
        badge: 'PLAYER ZONE',
        rolePill: 'ATHLETE',
        roleIcon: User,
        headlineFirst: 'PLAY TODAY.',
        headlineHighlight: 'GROW TOMORROW.',
        description: 'Discover tournaments, book courts, compete with players and track your progress.',
        pillars: [
          {
            icon: Trophy,
            title: 'COMPETE',
            subtitle: 'Join tournaments',
            href: '/tournaments',
          },
          {
            icon: Building2,
            title: 'PLAY',
            subtitle: 'Book courts',
            href: '/venues',
          },
          {
            icon: Users,
            title: 'CONNECT',
            subtitle: 'Meet community',
            href: '/sessions',
          },
        ],
      };
    }

    if (orgType === 'ORGANIZER' || !orgType) {
      return {
        badge: 'ORGANIZER',
        rolePill: activeOrg?.name || 'ORGANIZER',
        roleIcon: Trophy,
        headlineFirst: 'CREATE EVENTS.',
        headlineHighlight: 'BUILD CHAMPIONS.',
        description: 'Host premier tournaments, manage player registrations, schedule fixtures and conduct live scoring.',
        pillars: [
          {
            icon: Plus,
            title: 'CREATE',
            subtitle: 'Setup events',
            href: orgId ? `/org/${orgId}/tournaments/create` : '/tournaments',
          },
          {
            icon: Layers,
            title: 'MANAGE',
            subtitle: 'Tournaments',
            href: orgId ? `/org/${orgId}/tournaments` : '/tournaments',
          },
          {
            icon: Users,
            title: 'ENGAGE',
            subtitle: 'Community',
            href: orgId ? `/org/${orgId}/community-members` : '/home',
          },
        ],
      };
    }

    if (orgType === 'ACADEMY') {
      return {
        badge: 'ACADEMY',
        rolePill: activeOrg?.name || 'ACADEMY',
        roleIcon: Users,
        headlineFirst: 'TRAIN TALENT.',
        headlineHighlight: 'BUILD FUTURES.',
        description: 'Elite athlete coaching batches, student progression tracking, and academy admissions.',
        pillars: [
          {
            icon: Users,
            title: 'STUDENTS',
            subtitle: 'Manage trainees',
            href: orgId ? `/org/${orgId}/students` : '/home',
          },
          {
            icon: Calendar,
            title: 'BATCHES',
            subtitle: 'Training schedules',
            href: orgId ? `/org/${orgId}/batches` : '/home',
          },
          {
            icon: Sparkles,
            title: 'ADMISSIONS',
            subtitle: 'New enrollments',
            href: orgId ? `/org/${orgId}/admissions` : '/home',
          },
        ],
      };
    }

    if (orgType === 'COURT') {
      return {
        badge: 'VENUE',
        rolePill: activeOrg?.name || 'VENUE',
        roleIcon: Building2,
        headlineFirst: 'YOUR COURTS.',
        headlineHighlight: 'YOUR BUSINESS.',
        description: 'Smart turf slot scheduling, player reservations, and seamless facility operations.',
        pillars: [
          {
            icon: Building2,
            title: 'COURTS',
            subtitle: 'Turf management',
            href: orgId ? `/org/${orgId}/court` : '/venues',
          },
          {
            icon: Calendar,
            title: 'BOOKINGS',
            subtitle: 'Manage slots',
            href: orgId ? `/org/${orgId}/court` : '/venues',
          },
          {
            icon: Users,
            title: 'CUSTOMERS',
            subtitle: 'Player base',
            href: orgId ? `/org/${orgId}/dashboard` : '/home',
          },
        ],
      };
    }

    if (orgType === 'COMMUNITY') {
      return {
        badge: 'COMMUNITY',
        rolePill: activeOrg?.name || 'COMMUNITY',
        roleIcon: Users,
        headlineFirst: 'CONNECT ATHLETES.',
        headlineHighlight: 'GROW TOGETHER.',
        description: 'Host community sports sessions, create member polls, organize meetups and build athletic networks.',
        pillars: [
          {
            icon: Users,
            title: 'SESSIONS',
            subtitle: 'Pick-up games',
            href: orgId ? `/org/${orgId}/sessions` : '/sessions',
          },
          {
            icon: Sparkles,
            title: 'FEED',
            subtitle: 'Community posts',
            href: orgId ? `/org/${orgId}/feed` : '/communities',
          },
          {
            icon: Trophy,
            title: 'LEAGUES',
            subtitle: 'Community cups',
            href: orgId ? `/org/${orgId}/tournaments` : '/tournaments',
          },
        ],
      };
    }

    if (orgType === 'CLUB') {
      return {
        badge: 'CLUB',
        rolePill: activeOrg?.name || 'SPORTS CLUB',
        roleIcon: Shield,
        headlineFirst: 'ELEVATE SPORTS.',
        headlineHighlight: 'ACHIEVE EXCELLENCE.',
        description: 'Unified athletic management, event operations, team sparring, and sports performance tracking.',
        pillars: [
          {
            icon: Trophy,
            title: 'EVENTS',
            subtitle: 'Club tournaments',
            href: orgId ? `/org/${orgId}/tournaments` : '/tournaments',
          },
          {
            icon: Building2,
            title: 'FACILITIES',
            subtitle: 'Club courts',
            href: orgId ? `/org/${orgId}/court` : '/venues',
          },
          {
            icon: Users,
            title: 'ROSTER',
            subtitle: 'Club members',
            href: orgId ? `/org/${orgId}/members` : '/home',
          },
        ],
      };
    }

    if (orgType === 'COACH') {
      return {
        badge: 'COACH',
        rolePill: activeOrg?.name || 'COACH',
        roleIcon: User,
        headlineFirst: 'TRAIN CHAMPIONS.',
        headlineHighlight: 'SHAPE STARS.',
        description: 'Personalized training schedules, student progression tracking, and athletic mentorship.',
        pillars: [
          {
            icon: Users,
            title: 'TRAINEES',
            subtitle: 'Manage athletes',
            href: orgId ? `/org/${orgId}/dashboard` : '/home',
          },
          {
            icon: Calendar,
            title: 'SCHEDULE',
            subtitle: 'Daily training',
            href: orgId ? `/org/${orgId}/schedule` : '/home',
          },
          {
            icon: Sparkles,
            title: 'DRILLS',
            subtitle: 'Tactics & plans',
            href: orgId ? `/org/${orgId}/dashboard` : '/home',
          },
        ],
      };
    }

    if (orgType === 'ASSOCIATION') {
      return {
        badge: 'ASSOCIATION',
        rolePill: activeOrg?.name || 'ASSOCIATION',
        roleIcon: Trophy,
        headlineFirst: 'STATE SANCTIONED.',
        headlineHighlight: 'OFFICIAL RANKINGS.',
        description: 'Sanction official tournaments, manage state/district affiliations, and oversee athletic governance.',
        pillars: [
          {
            icon: Trophy,
            title: 'SANCTION',
            subtitle: 'State events',
            href: orgId ? `/org/${orgId}/tournaments` : '/tournaments',
          },
          {
            icon: Layers,
            title: 'DISTRICTS',
            subtitle: 'Affiliations',
            href: orgId ? `/org/${orgId}/districts` : '/home',
          },
          {
            icon: Users,
            title: 'OFFICIALS',
            subtitle: 'State roster',
            href: orgId ? `/org/${orgId}/members` : '/home',
          },
        ],
      };
    }

    // Fallback for other workspaces
    return {
      badge: 'WORKSPACE',
      rolePill: activeOrg?.name || 'WORKSPACE',
      roleIcon: Sparkles,
      headlineFirst: 'ELEVATE SPORTS.',
      headlineHighlight: 'ACHIEVE EXCELLENCE.',
      description: 'Unified athletic management, event operations, and sports performance tracking.',
      pillars: [
        {
          icon: Trophy,
          title: 'EVENTS',
          subtitle: 'Tournaments',
          href: orgId ? `/org/${orgId}/tournaments` : '/tournaments',
        },
        {
          icon: Building2,
          title: 'VENUES',
          subtitle: 'Court directory',
          href: '/venues',
        },
        {
          icon: Users,
          title: 'COMMUNITY',
          subtitle: 'Sports network',
          href: '/sessions',
        },
      ],
    };
  }, [isPlayer, orgType, orgId, activeOrg]);

  const RoleIcon = config.roleIcon;

  const { mode } = useAthlonTheme();
  const isDark = mode !== 'light';

  // ── Mode-Aware Background Layout Colors ──
  // Dark theme: matches the tournament card (second image) palette:
  // - stroke: #64748B (slate-500)
  // - dot pattern: #475569 (slate-600) with opacity 0.28
  // - turf texture: #1E293B (slate-800) with opacity 0.08
  // - rail: #475569 with opacity 0.45
  // - subtle specular halos (0 green glow)
  // Light theme: retains the vibrant market layout (green lines, rail, dots)
  const strokeColor = isDark ? '#64748B' : 'var(--athlon-primary)';
  const solidFillColor = isDark ? '#475569' : 'var(--athlon-primary)';
  const dotColor = isDark ? '#475569' : 'var(--athlon-primary)';
  const dotOpacity = isDark ? 0.28 : 0.16;
  const turfColor = isDark ? '#1E293B' : 'var(--athlon-primary)';
  const turfOpacity = isDark ? 0.08 : 0.035;
  const railColor = isDark ? '#475569' : 'var(--athlon-primary)';
  const railOpacity = isDark ? 0.45 : 0.4;

  return (
    <div
      className={`relative w-full h-full flex flex-col justify-between overflow-hidden select-none ${isDesktop ? 'p-5 md:p-6' : 'p-3.5 sm:p-4'
        }`}
      style={{
        backgroundColor: 'var(--athlon-card)',
        boxShadow:
          '0 12px 32px -6px var(--athlon-shadow, rgba(0, 0, 0, 0.15)), 0 0 0 1px var(--athlon-border), inset 0 1px 1px 0 rgba(255, 255, 255, 0.12)',
      }}
    >
      {/* ─── 1. TOP EDGE ENERGY RAIL ─── */}
      <div
        className="absolute top-0 inset-x-0 h-[2px] pointer-events-none z-0"
        style={{
          opacity: railOpacity,
          background: `linear-gradient(90deg, transparent 0%, ${railColor} 50%, transparent 100%)`,
        }}
      />

      {/* ─── 2. SUBTLE ARCHITECTURAL HALOS (Zero green haze in dark theme) ─── */}
      <div
        className="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.06) 0%, transparent 70%)',
          opacity: isDark ? 0.12 : 0,
        }}
      />
      <div
        className="absolute -bottom-12 -left-12 w-44 h-44 rounded-full blur-3xl pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.03) 0%, transparent 70%)',
          opacity: isDark ? 0.06 : 0,
        }}
      />

      {/* ─── 3. TECH DOT-MATRIX PATTERN WITH PRECISION FADE MASK ─── */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `radial-gradient(circle, ${dotColor} 1.2px, transparent 1.2px)`,
          backgroundSize: '16px 16px',
          opacity: dotOpacity,
          maskImage: 'radial-gradient(ellipse 85% 85% at 75% 25%, black 20%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse 85% 85% at 75% 25%, black 20%, transparent 80%)',
        }}
      />

      {/* ─── 4. DIAGONAL ATHLETIC TURF / CARBON SPEED TEXTURE ─── */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, ${turfColor} 0, ${turfColor} 1px, transparent 0, transparent 12px)`,
          opacity: turfOpacity,
        }}
      />

      {/* ─── 5. COMPREHENSIVE MULTI-SPORT ARENA, STADIUM & COURT WIREFRAME SKELETON ─── */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden z-0"
        viewBox="0 0 360 260"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Stadium Arena Bowl Architectural Skeleton */}
        <g opacity="0.32" stroke={strokeColor}>
          {/* Outer Grandstand Rim & Tiers */}
          <ellipse cx="295" cy="55" rx="120" ry="72" fill="none" strokeWidth="1.2" strokeDasharray="3 3" />
          <ellipse cx="295" cy="55" rx="100" ry="60" fill="none" strokeWidth="0.8" opacity="0.6" />
          <ellipse cx="295" cy="55" rx="82" ry="48" fill="none" strokeWidth="1" />
          <ellipse cx="295" cy="55" rx="66" ry="38" fill="none" strokeWidth="0.75" strokeDasharray="2 2" />

          {/* Stadium Radial Structural Truss Ribs */}
          <line x1="295" y1="55" x2="175" y2="55" strokeWidth="0.75" opacity="0.4" />
          <line x1="295" y1="55" x2="200" y2="15" strokeWidth="0.75" opacity="0.5" />
          <line x1="295" y1="55" x2="235" y2="-10" strokeWidth="0.75" opacity="0.5" />
          <line x1="295" y1="55" x2="295" y2="-17" strokeWidth="0.75" opacity="0.5" />
          <line x1="295" y1="55" x2="355" y2="-10" strokeWidth="0.75" opacity="0.5" />
          <line x1="295" y1="55" x2="390" y2="15" strokeWidth="0.75" opacity="0.5" />
          <line x1="295" y1="55" x2="415" y2="55" strokeWidth="0.75" opacity="0.4" />
          <line x1="295" y1="55" x2="390" y2="95" strokeWidth="0.75" opacity="0.5" />
          <line x1="295" y1="55" x2="355" y2="120" strokeWidth="0.75" opacity="0.5" />
          <line x1="295" y1="55" x2="295" y2="127" strokeWidth="0.75" opacity="0.5" />
          <line x1="295" y1="55" x2="235" y2="120" strokeWidth="0.75" opacity="0.5" />
          <line x1="295" y1="55" x2="200" y2="95" strokeWidth="0.75" opacity="0.5" />

          {/* Arena Floodlight Mast Skeleton Tower */}
          <g transform="translate(332, 2)">
            <polygon points="0,0 8,-12 16,0" fill="none" strokeWidth="1" />
            <line x1="4" y1="-6" x2="12" y2="-6" strokeWidth="0.7" />
            <circle cx="2" cy="-12" r="1.5" fill={solidFillColor} />
            <circle cx="8" cy="-15" r="1.5" fill={solidFillColor} />
            <circle cx="14" cy="-12" r="1.5" fill={solidFillColor} />
          </g>
        </g>

        {/* Isometric Court Skeleton (Badminton / Tennis) */}
        <g transform="translate(205, 52)" opacity="0.38" stroke={strokeColor}>
          <polygon points="15,40 85,0 150,35 80,75" fill="none" strokeWidth="1.2" />
          <line x1="22" y1="36" x2="87" y2="-1" strokeWidth="0.7" strokeDasharray="3 2" />
          <line x1="73" y1="71" x2="138" y2="34" strokeWidth="0.7" strokeDasharray="3 2" />
          <polygon points="50,20 115,55 115,44 50,9" fill="none" strokeWidth="1" />
          <line x1="62" y1="17" x2="62" y2="28" strokeWidth="0.6" />
          <line x1="74" y1="23" x2="74" y2="34" strokeWidth="0.6" />
          <line x1="86" y1="30" x2="86" y2="41" strokeWidth="0.6" />
          <line x1="98" y1="37" x2="98" y2="48" strokeWidth="0.6" />
          <line x1="110" y1="44" x2="110" y2="55" strokeWidth="0.6" />
          <line x1="50" y1="20" x2="50" y2="6" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="115" y1="55" x2="115" y2="41" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="32" y1="30" x2="67" y2="49" strokeWidth="0.7" />
          <line x1="97" y1="26" x2="132" y2="45" strokeWidth="0.7" />
          <line x1="50" y1="40" x2="115" y2="35" strokeWidth="0.7" />
        </g>

        {/* Football / Turf Pitch Skeleton */}
        <g transform="translate(18, 148)" opacity="0.22" stroke={strokeColor}>
          <rect x="0" y="0" width="130" height="75" rx="3" fill="none" strokeWidth="1" />
          <line x1="65" y1="0" x2="65" y2="75" strokeWidth="0.9" />
          <circle cx="65" cy="37.5" r="16" fill="none" strokeWidth="0.9" />
          <circle cx="65" cy="37.5" r="2" fill={solidFillColor} />
          <rect x="0" y="16" width="24" height="43" fill="none" strokeWidth="0.8" />
          <rect x="0" y="26" width="9" height="23" fill="none" strokeWidth="0.7" />
          <path d="M 24 30 A 10 10 0 0 1 24 45" fill="none" strokeWidth="0.75" />
          <rect x="106" y="16" width="24" height="43" fill="none" strokeWidth="0.8" />
          <rect x="121" y="26" width="9" height="23" fill="none" strokeWidth="0.7" />
          <path d="M 106 30 A 10 10 0 0 0 106 45" fill="none" strokeWidth="0.75" />
        </g>

        {/* Badminton Racket Wireframe Skeleton */}
        <g transform="translate(36, 62) rotate(-26)" opacity="0.38" stroke={strokeColor}>
          <ellipse cx="0" cy="0" rx="17" ry="23" fill="none" strokeWidth="1.4" />
          <ellipse cx="0" cy="0" rx="15.5" ry="21.5" fill="none" strokeWidth="0.6" opacity="0.7" />
          <line x1="-11" y1="-14" x2="-11" y2="14" strokeWidth="0.5" />
          <line x1="-5.5" y1="-20" x2="-5.5" y2="20" strokeWidth="0.5" />
          <line x1="0" y1="-23" x2="0" y2="23" strokeWidth="0.6" />
          <line x1="5.5" y1="-20" x2="5.5" y2="20" strokeWidth="0.5" />
          <line x1="11" y1="-14" x2="11" y2="14" strokeWidth="0.5" />
          <line x1="-14" y1="-12" x2="14" y2="-12" strokeWidth="0.5" />
          <line x1="-16" y1="-6" x2="16" y2="-6" strokeWidth="0.5" />
          <line x1="-17" y1="0" x2="17" y2="0" strokeWidth="0.6" />
          <line x1="-16" y1="6" x2="16" y2="6" strokeWidth="0.5" />
          <line x1="-14" y1="12" x2="14" y2="12" strokeWidth="0.5" />
          <polygon points="-4.5,22 4.5,22 1.5,30 -1.5,30" fill="none" strokeWidth="1" />
          <line x1="0" y1="30" x2="0" y2="60" strokeWidth="1.6" />
          <rect x="-3" y="60" width="6" height="26" rx="1.5" fill="none" strokeWidth="1.2" />
          <line x1="-3" y1="66" x2="3" y2="67" strokeWidth="0.6" />
          <line x1="-3" y1="72" x2="3" y2="73" strokeWidth="0.6" />
          <line x1="-3" y1="78" x2="3" y2="79" strokeWidth="0.6" />
          <rect x="-4" y="85" width="8" height="2.5" rx="0.8" fill={solidFillColor} strokeWidth="0.8" />
        </g>

        {/* Premium Aerodynamic Tournament Feather Shuttlecock */}
        <g transform="translate(170, 24) rotate(28) scale(0.7)" opacity="0.45" stroke={strokeColor}>
          <path d="M -16 6 Q -26 12 -34 14" fill="none" strokeWidth="0.75" strokeDasharray="3 3" opacity="0.45" />
          <path d="M -14 0 Q -24 5 -32 6" fill="none" strokeWidth="0.65" strokeDasharray="2 3" opacity="0.35" />
          <path d="M -5 7 C -7 -2 -11 -12 -16 -23" fill="none" strokeWidth="1.2" />
          <path d="M 5 7 C 7 -2 11 -12 16 -23" fill="none" strokeWidth="1.2" />
          <line x1="0" y1="7" x2="0" y2="-24.5" strokeWidth="0.8" />
          <line x1="-1.8" y1="7" x2="-3.2" y2="-24.2" strokeWidth="0.65" />
          <line x1="1.8" y1="7" x2="3.2" y2="-24.2" strokeWidth="0.65" />
          <line x1="-3.5" y1="7" x2="-6.8" y2="-24" strokeWidth="0.65" />
          <line x1="3.5" y1="7" x2="6.8" y2="-24" strokeWidth="0.65" />
          <line x1="-4.6" y1="7" x2="-11" y2="-23.6" strokeWidth="0.65" />
          <line x1="4.6" y1="7" x2="11" y2="-23.6" strokeWidth="0.65" />
          <path
            d="M -16 -23 C -15.5 -26.5 -12.5 -26.5 -11 -23.5 C -10 -27 -7 -27 -5.5 -24 C -4.5 -27.5 -1.5 -27.5 0 -24.5 C 1.5 -27.5 4.5 -27.5 5.5 -24 C 7 -27 10 -27 11 -23.5 C 12.5 -26.5 15.5 -26.5 16 -23"
            fill="none"
            strokeWidth="0.9"
            strokeLinecap="round"
          />
          <ellipse cx="0" cy="-23.5" rx="16" ry="3.2" fill="none" strokeWidth="0.5" strokeDasharray="3 2" opacity="0.6" />
          <ellipse cx="0" cy="-6" rx="8.5" ry="2" fill="none" strokeWidth="0.9" />
          <ellipse cx="0" cy="-6" rx="8.5" ry="2" fill="none" strokeWidth="0.9" strokeDasharray="2 1.5" />
          <ellipse cx="0" cy="-14.5" rx="12.2" ry="2.6" fill="none" strokeWidth="0.9" strokeDasharray="2.5 1.5" />
          <line x1="-12" y1="-14" x2="-14.5" y2="-19" strokeWidth="0.5" opacity="0.7" />
          <line x1="12" y1="-14" x2="14.5" y2="-19" strokeWidth="0.5" opacity="0.7" />
          <line x1="-8" y1="-6" x2="-10" y2="-10" strokeWidth="0.5" opacity="0.6" />
          <line x1="8" y1="-6" x2="10" y2="-10" strokeWidth="0.5" opacity="0.6" />
          <rect x="-5" y="7" width="10" height="3" rx="0.5" fill="none" strokeWidth="0.9" />
          <path d="M -5 10 C -5 15.5 5 15.5 5 10 Z" fill="none" strokeWidth="1.1" />
        </g>

        {/* Sports Ball Geodesic / Seam Skeleton */}
        <g transform="translate(230, 185)" opacity="0.25" stroke={strokeColor}>
          <circle cx="0" cy="0" r="16" fill="none" strokeWidth="1.2" />
          <path d="M -16 0 A 16 16 0 0 1 16 0" fill="none" strokeWidth="0.8" />
          <path d="M 0 -16 A 16 16 0 0 1 0 16" fill="none" strokeWidth="0.8" />
          <path d="M -11 -11 C -4 -4, -4 4, -11 11" fill="none" strokeWidth="0.8" strokeDasharray="2 1" />
          <path d="M 11 -11 C 4 -4, 4 4, 11 11" fill="none" strokeWidth="0.8" strokeDasharray="2 1" />
        </g>

        {/* Running Track Curved Velocity Lanes */}
        <g opacity="0.28" stroke={strokeColor}>
          <ellipse cx="320" cy="40" rx="145" ry="110" fill="none" strokeWidth="0.8" strokeDasharray="4 4" />
          <ellipse cx="320" cy="40" rx="180" ry="135" fill="none" strokeWidth="1" />
          <ellipse cx="320" cy="40" rx="215" ry="160" fill="none" strokeWidth="0.8" strokeDasharray="2 2" />
        </g>

        {/* Velocity Chevrons in Top-Right */}
        <g transform="translate(295, 14)" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" opacity="0.35">
          <line x1="0" y1="0" x2="6" y2="10" />
          <line x1="6" y1="10" x2="0" y2="20" />
          <line x1="8" y1="0" x2="14" y2="10" />
          <line x1="14" y1="10" x2="8" y2="20" />
          <line x1="16" y1="0" x2="22" y2="10" />
          <line x1="22" y1="10" x2="16" y2="20" />
        </g>

        {/* Technical Reticles & Grid Coordinates */}
        <path d="M 335 150 L 345 150 M 340 145 L 340 155" stroke={strokeColor} strokeWidth="1" opacity="0.3" />
        <path d="M 28 215 L 36 215 M 32 211 L 32 219" stroke={strokeColor} strokeWidth="0.8" opacity="0.25" />
        <path d="M 16 12 L 22 12 M 16 12 L 16 18" stroke={strokeColor} strokeWidth="1" opacity="0.35" />
        <path d="M 344 248 L 338 248 M 344 248 L 344 242" stroke={strokeColor} strokeWidth="1" opacity="0.35" />
      </svg>

      {/* ─── 6. TOP SPECULAR ARC LIGHT (Exact from Market Hero) ─── */}
      <div className="absolute inset-x-0 top-0 h-[38%] bg-gradient-to-b from-white/[0.12] dark:from-white/[0.04] via-transparent to-transparent pointer-events-none z-0" />

      {/* ─── 7. CARD CONTENT AREA (Design from Image 2) ─── */}
      <div className="relative z-10 flex flex-col justify-between h-full">
        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-2">
          {/* Status Badge with Live Pulsing Dot */}
          <div
            className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border backdrop-blur-md shadow-xs"
            style={{
              backgroundColor: 'var(--athlon-primary-soft)',
              borderColor: 'var(--athlon-primary)',
            }}
          >
            <span className="relative flex h-2 w-2">
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ backgroundColor: 'var(--athlon-primary)' }}
              />
              <span
                className="relative inline-flex rounded-full h-2 w-2"
                style={{ backgroundColor: 'var(--athlon-primary)' }}
              />
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider text-primary">
              {config.badge}
            </span>
          </div>

          {/* Role Pill with User / Org Icon */}
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border text-[9.5px] font-mono font-bold text-foreground bg-surface/80 backdrop-blur-md shadow-xs truncate max-w-[140px]"
            style={{ borderColor: 'var(--athlon-border)' }}
          >
            <RoleIcon className="w-3 h-3 text-primary shrink-0" />
            <span className="truncate uppercase">{config.rolePill}</span>
          </div>
        </div>

        {/* Center Main Area: Headline & Subtitle */}
        <div className="space-y-1 my-auto py-1">
          <h2 className="text-[17px] sm:text-[20px] md:text-[23px] font-black leading-[1.12] tracking-tight uppercase text-foreground">
            <span>{config.headlineFirst}</span>{' '}
            <span className="text-primary">
              {config.headlineHighlight}
            </span>
          </h2>
          <p className="text-[10.5px] sm:text-[11.5px] text-text-secondary font-medium leading-relaxed max-w-[95%]">
            {config.description}
          </p>
        </div>

        {/* ─── 8. BOTTOM 3-PILLAR NAVIGATION STRIP ─── */}
        <div
          className="grid grid-cols-3 divide-x pt-2 border-t backdrop-blur-xs"
          style={{ borderColor: 'var(--athlon-border)' }}
        >
          {config.pillars.map((pillar, idx) => {
            const PillarIcon = pillar.icon;
            return (
              <Link
                key={idx}
                href={pillar.href}
                className="flex items-center gap-1.5 sm:gap-2 px-1.5 sm:px-2 hover:opacity-80 active:scale-95 transition-all group"
                style={{ borderColor: 'var(--athlon-border)' }}
              >
                <div
                  className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg flex items-center justify-center shrink-0 border group-hover:border-primary/50 transition-colors"
                  style={{
                    backgroundColor: 'var(--athlon-primary-soft)',
                    borderColor: 'var(--athlon-primary)',
                  }}
                >
                  <PillarIcon className="w-3 h-3 text-primary" strokeWidth={2.2} />
                </div>
                <div className="min-w-0">
                  <div className="text-[8.5px] sm:text-[9.5px] font-black uppercase tracking-wider text-foreground group-hover:text-primary transition-colors truncate">
                    {pillar.title}
                  </div>
                  <div className="text-[7.5px] sm:text-[8px] font-medium text-text-muted truncate">
                    {pillar.subtitle}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
