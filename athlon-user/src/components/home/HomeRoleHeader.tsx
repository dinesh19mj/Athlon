'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  SlidersHorizontal,
  X,
  Plus,
} from 'lucide-react';
import { useWorkspaceStore, Organization } from '@/lib/store/useWorkspaceStore';
import { Athlon3DIcon } from '@/components/common/Athlon3DIcon';

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

  const getOrg3DType = (type: string) => {
    if (type === 'ORGANIZER') return 'tournaments';
    if (type === 'CLUB') return 'members';
    if (type === 'ACADEMY') return 'students';
    if (type === 'ASSOCIATION') return 'rankings';
    if (type === 'COURT') return 'facilities';
    return 'academies';
  };

  const isPlayerActive = currentActiveRole === 'PLAYER' || currentActiveRole === 'PERSONAL';

  return (
    <div className="w-full space-y-3 select-none">
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

      {/* ─── 2. SLEEK HORIZONTAL ROLE SEGMENTED DOCK ─── */}
      <div className="flex items-center gap-2 w-full relative">
        {/* Scrollable track for Me & Organizations with smooth curve fade toward Add Org */}
        <div
          className="flex-1 flex items-center gap-2 overflow-x-auto pb-1 pr-3 hide-scrollbar -mx-1 px-1 min-w-0"
          style={{
            maskImage: 'linear-gradient(to right, black 0%, black calc(100% - 28px), transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to right, black 0%, black calc(100% - 28px), transparent 100%)',
          }}
        >
          {/* 👤 PLAYER (ME) PILL */}
          <button
            onClick={() => handleRoleClick('PLAYER')}
            className={`shrink-0 flex items-center gap-2.5 px-3.5 py-2 h-[42px] rounded-full border transition-all duration-200 active:scale-95 cursor-pointer ${isPlayerActive
              ? 'border-primary shadow-[0_4px_16px_var(--athlon-primary-glow)] bg-surface'
              : 'border-border hover:border-primary/40 bg-card hover:bg-surface text-foreground/80 hover:text-foreground'
              }`}
            style={{
              backgroundColor: isPlayerActive ? 'var(--athlon-surface)' : 'var(--athlon-card)',
              borderColor: isPlayerActive ? 'var(--athlon-primary)' : 'var(--athlon-border)',
            }}
          >
            <div className="w-6 h-6 flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110">
              <Athlon3DIcon type="profile" size={24} active={isPlayerActive} />
            </div>

            <div className="flex items-center gap-1.5 leading-none">
              <span
                className={`text-xs font-black tracking-tight ${isPlayerActive ? 'text-primary' : 'text-foreground'
                  }`}
              >
                Me
              </span>
              <span className="text-[10px] text-foreground/60 dark:text-foreground/50 font-medium">
                • Player
              </span>
            </div>

            {isPlayerActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_6px_var(--athlon-primary)] ml-0.5" />
            )}
          </button>

          {/* 🏢 ORGANIZATIONS PILLS */}
          {orgsList.map((org) => {
            const isOrgActive = currentActiveRole === org.id;
            const org3DIconType = getOrg3DType(org.type);
            const roleLabel = getOrgRoleLabel(org.type);

            return (
              <button
                key={org.id}
                onClick={() => handleRoleClick(org.id)}
                className={`shrink-0 flex items-center gap-2.5 px-3.5 py-2 h-[42px] rounded-full border transition-all duration-200 active:scale-95 cursor-pointer max-w-[200px] ${isOrgActive
                  ? 'border-primary shadow-[0_4px_16px_var(--athlon-primary-glow)] bg-surface'
                  : 'border-border hover:border-primary/40 bg-card hover:bg-surface text-foreground/80 hover:text-foreground'
                  }`}
                style={{
                  backgroundColor: isOrgActive ? 'var(--athlon-surface)' : 'var(--athlon-card)',
                  borderColor: isOrgActive ? 'var(--athlon-primary)' : 'var(--athlon-border)',
                }}
              >
                <div className="w-6 h-6 flex items-center justify-center shrink-0 transition-transform duration-200">
                  <Athlon3DIcon type={org3DIconType} size={24} active={isOrgActive} />
                </div>

                <div className="flex items-center gap-1.5 leading-none min-w-0">
                  <span
                    className={`text-xs font-black tracking-tight truncate ${isOrgActive ? 'text-primary' : 'text-foreground'
                      }`}
                    title={org.name}
                  >
                    {org.name}
                  </span>
                  <span className="text-[10px] text-foreground/60 dark:text-foreground/50 font-medium shrink-0">
                    • {roleLabel}
                  </span>
                </div>

                {isOrgActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_6px_var(--athlon-primary)] ml-0.5 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* ➕ ADD NEW HUB BUTTON (Stable / Fixed position matching size) */}
        <div className="shrink-0 pb-1">
          <button
            onClick={onAddClick || (() => { router.push('/subscription'); })}
            className="flex items-center justify-center w-[42px] h-[42px] rounded-full border border-dashed border-border hover:border-primary/50 text-foreground/80 hover:text-primary hover:bg-primary/5 bg-card transition-all duration-200 active:scale-95 text-xs font-bold cursor-pointer shrink-0 shadow-sm"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
            title="Add Organization"
            aria-label="Add Organization"
          >
            <Plus className="w-4 h-4 text-primary" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
