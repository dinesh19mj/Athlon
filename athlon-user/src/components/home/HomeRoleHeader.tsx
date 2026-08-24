'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  SlidersHorizontal,
  X,
  User,
  Shield,
  Trophy,
  GraduationCap,
  Landmark,
  MapPin,
  LayoutGrid,
} from 'lucide-react';
import { useWorkspaceStore, Organization } from '@/lib/store/useWorkspaceStore';

/* ─── Upward Arch Surrounding Strictly The Heading Section ───────────────── */

function ActiveHeadingUpwardArch() {
  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-visible">
      {/* Top subtle radiant glow */}
      <div
        className="absolute inset-0 rounded-t-2xl opacity-40 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 0%, var(--athlon-primary-soft), transparent 80%)',
        }}
      />
      {/* Single seamless connected line extending to both ends */}
      <svg
        className="w-full h-full overflow-visible"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <path
          d="M -3000 100 L -18 100 C -6 100 0 92 0 80 L 0 18 C 0 6 6 0 18 0 L 82 0 C 94 0 100 6 100 18 L 100 80 C 100 92 106 100 118 100 L 3000 100"
          fill="none"
          stroke="var(--athlon-primary)"
          strokeWidth="1.8"
          vectorEffect="non-scaling-stroke"
          style={{
            filter: 'drop-shadow(0 0 6px var(--athlon-primary-glow))',
          }}
        />
      </svg>
    </div>
  );
}

/* ─── HomeRoleHeader Component ───────────────────────────────────────────── */

interface HomeRoleHeaderProps {
  activeRole?: string;
  onSelectRole?: (role: string) => void;
  organizations?: Organization[];
  onAddClick?: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onFilterClick?: () => void;
  showSearch?: boolean;
}

export default function HomeRoleHeader({
  activeRole,
  onSelectRole,
  organizations: propOrganizations,
  onAddClick,
  searchQuery = '',
  onSearchChange,
  onFilterClick,
  showSearch = true,
}: HomeRoleHeaderProps) {
  const router = useRouter();
  const {
    activeWorkspaceId,
    organizations: storeOrganizations,
    setActiveWorkspace,
  } = useWorkspaceStore();

  const currentActiveRole = activeRole !== undefined
    ? activeRole
    : (activeWorkspaceId === 'PERSONAL' ? 'PLAYER' : activeWorkspaceId);

  const orgsList = (propOrganizations && propOrganizations.length > 0)
    ? propOrganizations
    : (storeOrganizations || []);

  const getRoleRoute = (targetOrgId: string) => {
    return `/org/${targetOrgId}/dashboard`;
  };

  const handleRoleClick = (role: string) => {
    if (onSelectRole) {
      onSelectRole(role);
      return;
    }

    if (role === 'PLAYER') {
      setActiveWorkspace('PERSONAL');
      router.push('/home');
    } else {
      setActiveWorkspace(role);
      router.push(getRoleRoute(role));
    }
  };

  const getOrgRoleLabel = (type: string) => {
    if (type === 'ORGANIZER') return 'Organizer';
    if (type === 'ACADEMY') return 'Academy';
    if (type === 'CLUB') return 'Club';
    if (type === 'COURT') return 'Venue';
    if (type === 'ASSOCIATION') return 'Association';
    return type;
  };

  const getOrgIcon = (type: string) => {
    const cls = 'w-6 h-6 transition-all duration-200';
    if (type === 'ORGANIZER') return <Trophy className={cls} strokeWidth={1.8} />;
    if (type === 'CLUB') return <Shield className={cls} strokeWidth={1.8} />;
    if (type === 'ACADEMY') return <GraduationCap className={cls} strokeWidth={1.8} />;
    if (type === 'ASSOCIATION') return <Landmark className={cls} strokeWidth={1.8} />;
    if (type === 'COURT') return <MapPin className={cls} strokeWidth={1.8} />;
    return <Shield className={cls} strokeWidth={1.8} />;
  };

  const isPlayerActive = currentActiveRole === 'PLAYER' || currentActiveRole === 'PERSONAL';

  return (
    <div className="w-full space-y-3">
      {/* ─── 1. OPTIONAL SEARCH BAR ─── */}
      {showSearch && (
        <div className="w-full">
          <div
            className="flex items-center px-4 py-3 rounded-2xl transition-all shadow-inner backdrop-blur-md group focus-within:ring-1 focus-within:ring-[var(--athlon-primary)]"
            style={{
              backgroundColor: 'var(--athlon-input)',
              borderColor: 'var(--athlon-border)',
              borderWidth: '1px',
              borderStyle: 'solid',
            }}
          >
            <div className="mr-3 shrink-0 transition-colors group-focus-within:text-[var(--athlon-primary)]" style={{ color: 'var(--athlon-icon-muted)' }}>
              <Search className="w-5 h-5" strokeWidth={2} />
            </div>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Search tournaments, players, clubs..."
              className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-white/30 tracking-normal"
              style={{ color: 'var(--athlon-text)' }}
            />

            {searchQuery && (
              <button
                onClick={() => onSearchChange?.('')}
                className="p-1 text-white/40 hover:text-white transition-colors mr-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <div className="w-px h-5 mx-2.5 bg-white/10 shrink-0" />

            <button
              onClick={onFilterClick}
              title="Filters"
              className="p-1 rounded-lg transition-all hover:scale-105 active:scale-95 shrink-0"
              style={{ color: 'var(--athlon-primary)' }}
            >
              <SlidersHorizontal className="w-5 h-5" strokeWidth={2} />
            </button>
          </div>
        </div>
      )}

      {/* ─── 2. CATEGORY ROLE NAVIGATION ─── */}
      <div className="relative pt-1 pb-1 overflow-x-clip">
        {/* Scrollable Categories Row */}
        <div className="flex items-end gap-1 sm:gap-2 overflow-x-auto pb-0 hide-scrollbar px-1">
          {/* PLAYER (ME) TAB */}
          <button
            onClick={() => handleRoleClick('PLAYER')}
            className="group relative flex-1 min-w-[78px] sm:min-w-[96px] max-w-[135px] flex flex-col items-center text-center select-none cursor-pointer active:scale-[0.98] transition-transform duration-150"
          >
            {/* Section 1: Icon (Placed Above) */}
            <div
              className="h-10 sm:h-11 w-full flex items-center justify-center relative z-20 transition-all duration-200"
              style={{
                color: isPlayerActive ? 'var(--athlon-primary)' : 'rgba(255, 255, 255, 0.65)',
              }}
            >
              <User
                className={`w-6 h-6 transition-transform duration-200 ${isPlayerActive
                    ? 'scale-110 drop-shadow-[0_0_8px_var(--athlon-primary-glow)]'
                    : 'group-hover:scale-105 group-hover:text-white'
                  }`}
                strokeWidth={1.8}
              />
            </div>

            {/* Section 2: Heading (Enclosed by Upward Arch when Active) */}
            <div className="relative w-full h-[46px] px-1.5 flex flex-col items-center justify-center transition-all z-20">
              {/* Upward Arch looping over the heading */}
              {isPlayerActive && <ActiveHeadingUpwardArch />}

              <span
                className="text-xs sm:text-[13px] font-bold tracking-tight leading-tight transition-colors truncate max-w-full relative z-30"
                style={{
                  color: isPlayerActive ? 'var(--athlon-primary)' : '#FFFFFF',
                  textShadow: isPlayerActive ? '0 0 10px var(--athlon-primary-glow)' : 'none',
                }}
              >
                Me
              </span>
              <span
                className="text-[10px] sm:text-[11px] font-normal tracking-tight leading-tight mt-0.5 transition-colors truncate max-w-full relative z-30"
                style={{
                  color: isPlayerActive ? 'var(--athlon-text-secondary, rgba(255, 255, 255, 0.75))' : 'var(--athlon-text-muted, rgba(255, 255, 255, 0.4))',
                }}
              >
                Player
              </span>
            </div>
          </button>

          {/* ORGANIZATIONS TABS */}
          {orgsList.map((org) => {
            const isOrgActive = currentActiveRole === org.id;
            return (
              <button
                key={org.id}
                onClick={() => handleRoleClick(org.id)}
                className="group relative flex-1 min-w-[78px] sm:min-w-[96px] max-w-[135px] flex flex-col items-center text-center select-none cursor-pointer active:scale-[0.98] transition-transform duration-150"
              >
                {/* Section 1: Icon (Placed Above) */}
                <div
                  className="h-10 sm:h-11 w-full flex items-center justify-center relative z-20 transition-all duration-200"
                  style={{
                    color: isOrgActive ? 'var(--athlon-primary)' : 'rgba(255, 255, 255, 0.65)',
                  }}
                >
                  <div
                    className={`transition-transform duration-200 ${isOrgActive
                        ? 'scale-110 drop-shadow-[0_0_8px_var(--athlon-primary-glow)]'
                        : 'group-hover:scale-105 group-hover:text-white'
                      }`}
                  >
                    {getOrgIcon(org.type)}
                  </div>
                </div>

                {/* Section 2: Heading (Enclosed by Upward Arch when Active) */}
                <div className="relative w-full h-[46px] px-1.5 flex flex-col items-center justify-center transition-all z-20">
                  {/* Upward Arch looping over the heading */}
                  {isOrgActive && <ActiveHeadingUpwardArch />}

                  <span
                    className="text-xs sm:text-[13px] font-bold tracking-tight leading-tight transition-colors truncate max-w-full relative z-30"
                    style={{
                      color: isOrgActive ? 'var(--athlon-primary)' : '#FFFFFF',
                      textShadow: isOrgActive ? '0 0 10px var(--athlon-primary-glow)' : 'none',
                    }}
                  >
                    {org.name}
                  </span>
                  <span
                    className="text-[10px] sm:text-[11px] font-normal tracking-tight leading-tight mt-0.5 transition-colors truncate max-w-full relative z-30"
                    style={{
                      color: isOrgActive ? 'var(--athlon-text-secondary, rgba(255, 255, 255, 0.75))' : 'var(--athlon-text-muted, rgba(255, 255, 255, 0.4))',
                    }}
                  >
                    {getOrgRoleLabel(org.type)}
                  </span>
                </div>
              </button>
            );
          })}

          {/* MORE / ADD ORG TAB */}
          <button
            onClick={onAddClick || (() => { router.push('/subscription'); })}
            className="group relative flex-1 min-w-[75px] sm:min-w-[90px] max-w-[125px] flex flex-col items-center text-center select-none cursor-pointer active:scale-[0.98] transition-transform duration-150"
          >
            {/* Section 1: Icon (Above) */}
            <div className="h-10 sm:h-11 w-full flex items-center justify-center relative z-20 text-white/60 group-hover:text-white transition-colors">
              <LayoutGrid className="w-6 h-6 group-hover:scale-105 transition-transform duration-150" strokeWidth={1.8} />
            </div>

            {/* Section 2: Heading */}
            <div className="relative w-full h-[46px] px-1.5 flex flex-col items-center justify-center transition-all z-20">
              <span className="text-xs sm:text-[13px] font-bold tracking-tight leading-tight text-white/80 group-hover:text-white transition-colors truncate max-w-full">
                More
              </span>
              <span className="text-[10px] sm:text-[11px] font-normal tracking-tight leading-tight mt-0.5 text-white/40 group-hover:text-white/60 transition-colors truncate max-w-full">
                Add +
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
