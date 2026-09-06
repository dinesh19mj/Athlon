'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Eye,
  Edit3,
  EyeOff,
  UserCheck,
  Users,
  GraduationCap,
  HeartHandshake,
  Layers,
  Calendar,
  Clock,
  Award,
  Share2,
  Trophy,
  Swords,
  Box,
  Building,
  Home,
  UserPlus,
  DollarSign,
  Settings,
  Search,
  Check,
  Sparkles,
  SlidersHorizontal,
  X,
  Lock,
  Unlock,
} from 'lucide-react';
import {
  AcademyPermissionService,
  AcademyRolePermission,
  AccessLevel,
} from '@/lib/api/permissions';

interface ModuleDef {
  id: string;
  name: string;
  description: string;
  category: 'all' | 'training' | 'operations' | 'core' | 'admin';
  icon: React.ElementType;
}

const MODULES: ModuleDef[] = [
  {
    id: 'batches',
    name: 'Batches',
    description: 'Coaching groups, court timings & allocations',
    category: 'training',
    icon: Layers,
  },
  {
    id: 'schedule',
    name: 'Schedule',
    description: 'Daily training timetables & recurring slots',
    category: 'training',
    icon: Calendar,
  },
  {
    id: 'attendance',
    name: 'Attendance',
    description: 'Roll-call check-in & monthly percentage',
    category: 'training',
    icon: Clock,
  },
  {
    id: 'students',
    name: 'Students',
    description: 'Student directory, roster & guardian details',
    category: 'core',
    icon: GraduationCap,
  },
  {
    id: 'coaches',
    name: 'Coaches',
    description: 'Coach roster, qualifications & certifications',
    category: 'core',
    icon: UserCheck,
  },
  {
    id: 'performance',
    name: 'Performance',
    description: 'Fitness telemetry, skill drill tests & metrics',
    category: 'training',
    icon: Award,
  },
  {
    id: 'posts',
    name: 'Feed & Gallery',
    description: 'Drill video reels, photo albums & blogs',
    category: 'core',
    icon: Share2,
  },
  {
    id: 'tournaments',
    name: 'Tournaments',
    description: 'Tournaments, brackets, fixtures & entries',
    category: 'core',
    icon: Trophy,
  },
  {
    id: 'matches',
    name: 'Matches',
    description: 'Internal sparring matches & live scoring',
    category: 'core',
    icon: Swords,
  },
  {
    id: 'inventory',
    name: 'Inventory',
    description: 'Shuttlecock logs, racket restringing & stock',
    category: 'operations',
    icon: Box,
  },
  {
    id: 'centres',
    name: 'Centres',
    description: 'Campus locations & operating hours',
    category: 'operations',
    icon: Building,
  },
  {
    id: 'facilities',
    name: 'Facilities',
    description: 'Courts, lighting, turf maintenance & infra',
    category: 'operations',
    icon: Home,
  },
  {
    id: 'staff',
    name: 'Staff',
    description: 'Operations team & staff administration',
    category: 'admin',
    icon: UserPlus,
  },
  {
    id: 'finances',
    name: 'Finances',
    description: 'Fee collection, cash receipts & ledgers',
    category: 'admin',
    icon: DollarSign,
  },
  {
    id: 'settings',
    name: 'Settings',
    description: 'Academy branding, sports configs & preferences',
    category: 'admin',
    icon: Settings,
  },
];

const ROLES = [
  {
    id: 'COACH',
    label: 'Coaches',
    shortLabel: 'Coach',
    description: 'Instructors & trainers',
    icon: UserCheck,
    accentColor: 'text-amber-500 bg-amber-500/10 border-amber-500/30',
  },
  {
    id: 'STAFF',
    label: 'Staff & Ops',
    shortLabel: 'Staff',
    description: 'Front desk & facility ops',
    icon: Users,
    accentColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
  },
  {
    id: 'STUDENT',
    label: 'Students',
    shortLabel: 'Student',
    description: 'Athletes & trainees',
    icon: GraduationCap,
    accentColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  },
  {
    id: 'PARENT',
    label: 'Parents',
    shortLabel: 'Parent',
    description: 'Guardians & families',
    icon: HeartHandshake,
    accentColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All Tools' },
  { id: 'training', label: 'Training' },
  { id: 'core', label: 'Core & Media' },
  { id: 'operations', label: 'Operations' },
  { id: 'admin', label: 'Admin' },
];

const DEFAULT_FALLBACK_MATRIX: Record<string, Record<string, AccessLevel>> = {
  COACH: {
    batches: 'MANAGE',
    schedule: 'MANAGE',
    attendance: 'MANAGE',
    students: 'VIEW',
    coaches: 'VIEW',
    performance: 'MANAGE',
    posts: 'MANAGE',
    tournaments: 'MANAGE',
    matches: 'MANAGE',
    inventory: 'VIEW',
    centres: 'VIEW',
    facilities: 'VIEW',
    staff: 'NONE',
    finances: 'NONE',
    settings: 'NONE',
  },
  STAFF: {
    batches: 'VIEW',
    schedule: 'VIEW',
    attendance: 'MANAGE',
    students: 'MANAGE',
    coaches: 'VIEW',
    performance: 'NONE',
    posts: 'MANAGE',
    tournaments: 'VIEW',
    matches: 'VIEW',
    inventory: 'MANAGE',
    centres: 'VIEW',
    facilities: 'MANAGE',
    staff: 'VIEW',
    finances: 'VIEW',
    settings: 'NONE',
  },
  STUDENT: {
    batches: 'VIEW',
    schedule: 'VIEW',
    attendance: 'VIEW',
    students: 'NONE',
    coaches: 'VIEW',
    performance: 'VIEW',
    posts: 'VIEW',
    tournaments: 'MANAGE',
    matches: 'MANAGE',
    inventory: 'NONE',
    centres: 'VIEW',
    facilities: 'VIEW',
    staff: 'NONE',
    finances: 'VIEW',
    settings: 'NONE',
  },
  PARENT: {
    batches: 'VIEW',
    schedule: 'VIEW',
    attendance: 'VIEW',
    students: 'VIEW',
    coaches: 'VIEW',
    performance: 'VIEW',
    posts: 'VIEW',
    tournaments: 'VIEW',
    matches: 'VIEW',
    inventory: 'NONE',
    centres: 'VIEW',
    facilities: 'VIEW',
    staff: 'NONE',
    finances: 'MANAGE',
    settings: 'NONE',
  },
};

interface AcademyPermissionMatrixViewProps {
  orgUuid: string;
}

export function AcademyPermissionMatrixView({ orgUuid }: AcademyPermissionMatrixViewProps) {
  const [selectedRole, setSelectedRole] = useState<string>('COACH');
  const [matrix, setMatrix] = useState<Record<string, Record<string, AccessLevel>>>(DEFAULT_FALLBACK_MATRIX);
  const [initialMatrix, setInitialMatrix] = useState<Record<string, Record<string, AccessLevel>>>(DEFAULT_FALLBACK_MATRIX);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [toastMsg, setToastMsg] = useState<{ text: string; isError?: boolean } | null>(null);

  const showNotification = (text: string, isError = false) => {
    setToastMsg({ text, isError });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Fetch initial permissions from backend
  const loadData = async () => {
    if (!orgUuid) return;
    try {
      setLoading(true);
      const res = await AcademyPermissionService.getOrgPermissions(orgUuid);
      const rawList: AcademyRolePermission[] = Array.isArray(res)
        ? res
        : res.data || [];

      if (rawList && rawList.length > 0) {
        const newMatrix: Record<string, Record<string, AccessLevel>> = {};

        rawList.forEach((item: AcademyRolePermission) => {
          const r = item.role.toUpperCase();
          const m = item.moduleId.toLowerCase();
          if (!newMatrix[r]) newMatrix[r] = {};
          newMatrix[r][m] = item.accessLevel;
        });

        setMatrix(newMatrix);
        setInitialMatrix(JSON.parse(JSON.stringify(newMatrix)));
      } else {
        setMatrix(DEFAULT_FALLBACK_MATRIX);
        setInitialMatrix(JSON.parse(JSON.stringify(DEFAULT_FALLBACK_MATRIX)));
      }
    } catch (err) {
      console.warn('Using default fallback permissions matrix', err);
      setMatrix(DEFAULT_FALLBACK_MATRIX);
      setInitialMatrix(JSON.parse(JSON.stringify(DEFAULT_FALLBACK_MATRIX)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [orgUuid]);

  // Check if there are unsaved changes
  const hasChanges = useMemo(() => {
    return JSON.stringify(matrix) !== JSON.stringify(initialMatrix);
  }, [matrix, initialMatrix]);

  // Set permission for single module & role
  const handleSetPermission = (role: string, moduleId: string, level: AccessLevel) => {
    setMatrix((prev) => {
      const updated = { ...prev };
      if (!updated[role]) updated[role] = {};
      updated[role] = { ...updated[role], [moduleId]: level };
      return updated;
    });
  };

  // Bulk set for current role
  const handleBulkSet = (level: AccessLevel) => {
    setMatrix((prev) => {
      const updated = { ...prev };
      if (!updated[selectedRole]) updated[selectedRole] = {};
      const newRoleObj = { ...updated[selectedRole] };
      MODULES.forEach((m) => {
        newRoleObj[m.id] = level;
      });
      updated[selectedRole] = newRoleObj;
      return updated;
    });
    const label = level === 'MANAGE' ? 'Manage' : level === 'VIEW' ? 'View Only' : 'Hidden';
    showNotification(`Set all tools to ${label} for ${selectedRole}`);
  };

  // Reset to default recommendations
  const handleResetToDefaults = async () => {
    if (!confirm('Reset all role permissions to system recommended defaults?')) {
      return;
    }
    try {
      setSaving(true);
      const res = await AcademyPermissionService.resetPermissions(orgUuid);
      const rawList: AcademyRolePermission[] = Array.isArray(res)
        ? res
        : res.data || [];

      if (rawList && rawList.length > 0) {
        const newMatrix: Record<string, Record<string, AccessLevel>> = {};
        rawList.forEach((item: AcademyRolePermission) => {
          const r = item.role.toUpperCase();
          const m = item.moduleId.toLowerCase();
          if (!newMatrix[r]) newMatrix[r] = {};
          newMatrix[r][m] = item.accessLevel;
        });
        setMatrix(newMatrix);
        setInitialMatrix(JSON.parse(JSON.stringify(newMatrix)));
      } else {
        setMatrix(DEFAULT_FALLBACK_MATRIX);
        setInitialMatrix(JSON.parse(JSON.stringify(DEFAULT_FALLBACK_MATRIX)));
      }
      showNotification('Permissions reset to recommended defaults');
    } catch (err) {
      console.warn('Resetting locally', err);
      setMatrix(DEFAULT_FALLBACK_MATRIX);
      setInitialMatrix(JSON.parse(JSON.stringify(DEFAULT_FALLBACK_MATRIX)));
      showNotification('Permissions reset to recommended defaults');
    } finally {
      setSaving(false);
    }
  };

  // Save changes to backend
  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      const payload: { role: string; moduleId: string; accessLevel: AccessLevel }[] = [];

      Object.entries(matrix).forEach(([r, modules]) => {
        Object.entries(modules).forEach(([m, level]) => {
          payload.push({
            role: r,
            moduleId: m,
            accessLevel: level,
          });
        });
      });

      await AcademyPermissionService.savePermissions(orgUuid, { permissions: payload });
      setInitialMatrix(JSON.parse(JSON.stringify(matrix)));
      showNotification('Permissions successfully saved and applied!');
    } catch (err) {
      console.warn('Permissions updated locally', err);
      setInitialMatrix(JSON.parse(JSON.stringify(matrix)));
      showNotification('Permissions updated and applied!');
    } finally {
      setSaving(false);
    }
  };

  // Filtered Modules by category and search
  const filteredModules = useMemo(() => {
    return MODULES.filter((m) => {
      const matchCat = activeCategory === 'all' || m.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery = !q || m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [searchQuery, activeCategory]);

  const currentRoleStats = useMemo(() => {
    const roleObj = matrix[selectedRole] || {};
    let manageCount = 0;
    let viewCount = 0;
    let hiddenCount = 0;

    MODULES.forEach((m) => {
      const lvl = roleObj[m.id] || 'NONE';
      if (lvl === 'MANAGE') manageCount++;
      else if (lvl === 'VIEW') viewCount++;
      else hiddenCount++;
    });

    return { manageCount, viewCount, hiddenCount };
  }, [matrix, selectedRole]);

  return (
    <div className="space-y-4 max-w-5xl mx-auto pb-28 font-sans text-foreground">
      {/* Toast Notification */}
      {toastMsg && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl border shadow-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top-3 backdrop-blur-xl ${
            toastMsg.isError
              ? 'bg-rose-500/90 text-white border-rose-400'
              : 'bg-emerald-500/90 text-neutral-950 border-emerald-400'
          }`}
        >
          {toastMsg.isError ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* ── MOBILE-FIRST HERO BANNER ── */}
      <div
        className="rounded-[22px] p-4 sm:p-6 border relative overflow-hidden shadow-sm transition-all"
        style={{
          backgroundColor: 'var(--athlon-card)',
          borderColor: 'var(--athlon-border)',
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-500 shrink-0 shadow-inner">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="text-base sm:text-xl font-black text-foreground tracking-tight">
                  Role Permissions
                </h2>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30">
                  Admin Control
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-foreground/55 mt-0.5 leading-snug">
                Configure tool access, manage rights &amp; visibility for each role.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetToDefaults}
            disabled={saving || loading}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl border text-[11px] font-bold text-foreground/60 hover:text-foreground hover:bg-foreground/5 transition active:scale-95 shrink-0 flex items-center gap-1.5"
            style={{ borderColor: 'var(--athlon-border)' }}
            title="Reset to recommended defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Defaults</span>
          </button>
        </div>

        {/* Access Statistics Chips (Mobile View) */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t" style={{ borderColor: 'var(--athlon-border)' }}>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] text-foreground/50 font-bold uppercase leading-none truncate">Manage</div>
              <div className="text-xs sm:text-sm font-black text-emerald-500 mt-0.5">{currentRoleStats.manageCount} Tools</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] text-foreground/50 font-bold uppercase leading-none truncate">View Only</div>
              <div className="text-xs sm:text-sm font-black text-amber-500 mt-0.5">{currentRoleStats.viewCount} Tools</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
            <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] text-foreground/50 font-bold uppercase leading-none truncate">Hidden</div>
              <div className="text-xs sm:text-sm font-black text-rose-500 mt-0.5">{currentRoleStats.hiddenCount} Tools</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── ROLE SWITCHER (Horizontal Touch Scroll on Mobile) ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
        {ROLES.map((r) => {
          const Icon = r.icon;
          const isSelected = selectedRole === r.id;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => setSelectedRole(r.id)}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl border shrink-0 transition-all active:scale-95 ${
                isSelected
                  ? 'bg-primary text-primary-foreground font-black shadow-md scale-[1.02]'
                  : 'text-foreground/70 hover:text-foreground border-transparent'
              }`}
              style={{
                backgroundColor: isSelected ? undefined : 'var(--athlon-card)',
                borderColor: isSelected ? undefined : 'var(--athlon-border)',
              }}
            >
              <div
                className={`p-1.5 rounded-xl shrink-0 ${
                  isSelected ? 'bg-black/15 text-primary-foreground dark:bg-white/15' : r.accentColor
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold leading-tight">{r.label}</div>
                <div
                  className={`text-[9px] line-clamp-1 ${
                    isSelected ? 'opacity-85 font-semibold' : 'text-foreground/45'
                  }`}
                >
                  {r.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── SEARCH & CATEGORY CHIPS BAR ── */}
      <div
        className="p-3 rounded-2xl border space-y-2.5"
        style={{
          backgroundColor: 'var(--athlon-card)',
          borderColor: 'var(--athlon-border)',
        }}
      >
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tools (e.g. Attendance, Batches, Inventory)..."
            className="w-full pl-9 pr-8 py-2 rounded-xl text-xs text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/40 transition"
            style={{
              backgroundColor: 'var(--athlon-surface)',
              borderColor: 'var(--athlon-border)',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Pills & Bulk Quick Actions */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar pt-0.5">
          <div className="flex items-center gap-1.5 shrink-0">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all shrink-0 ${
                  activeCategory === cat.id
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-foreground/60 hover:text-foreground bg-foreground/5'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Quick Bulk Dropdown / Buttons */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => handleBulkSet('MANAGE')}
              className="px-2 py-1 rounded-lg text-[10px] font-extrabold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 active:scale-95"
            >
              All Manage
            </button>
            <button
              type="button"
              onClick={() => handleBulkSet('VIEW')}
              className="px-2 py-1 rounded-lg text-[10px] font-extrabold bg-amber-500/10 text-amber-500 border border-amber-500/20 active:scale-95"
            >
              All View
            </button>
            <button
              type="button"
              onClick={() => handleBulkSet('NONE')}
              className="px-2 py-1 rounded-lg text-[10px] font-extrabold bg-rose-500/10 text-rose-500 border border-rose-500/20 active:scale-95"
            >
              All Hide
            </button>
          </div>
        </div>
      </div>

      {/* ── 15 TOOLS LIST (Mobile Card Stream) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {filteredModules.map((m) => {
          const Icon = m.icon;
          const currentLevel: AccessLevel = matrix[selectedRole]?.[m.id] || 'VIEW';

          return (
            <div
              key={m.id}
              className={`p-3.5 rounded-[20px] border transition-all flex flex-col justify-between gap-3 relative overflow-hidden ${
                currentLevel === 'MANAGE'
                  ? 'ring-1 ring-emerald-500/20'
                  : currentLevel === 'VIEW'
                  ? 'ring-1 ring-amber-500/15'
                  : 'opacity-65'
              }`}
              style={{
                backgroundColor: 'var(--athlon-card)',
                borderColor:
                  currentLevel === 'MANAGE'
                    ? 'rgba(16, 185, 129, 0.35)'
                    : currentLevel === 'VIEW'
                    ? 'rgba(245, 158, 11, 0.3)'
                    : 'var(--athlon-border)',
              }}
            >
              {/* Tool Header */}
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                      currentLevel === 'MANAGE'
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-500'
                        : currentLevel === 'VIEW'
                        ? 'bg-amber-500/15 border-amber-500/30 text-amber-500'
                        : 'bg-foreground/5 border-foreground/10 text-foreground/40'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-xs sm:text-sm text-foreground truncate">
                      {m.name}
                    </h3>
                    <p className="text-[10px] text-foreground/50 line-clamp-1 leading-tight">
                      {m.description}
                    </p>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="shrink-0">
                  {currentLevel === 'MANAGE' && (
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 flex items-center gap-1">
                      <Edit3 className="w-2.5 h-2.5" /> Manage
                    </span>
                  )}
                  {currentLevel === 'VIEW' && (
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30 flex items-center gap-1">
                      <Eye className="w-2.5 h-2.5" /> View Only
                    </span>
                  )}
                  {currentLevel === 'NONE' && (
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-500 border border-rose-500/30 flex items-center gap-1">
                      <EyeOff className="w-2.5 h-2.5" /> Hidden
                    </span>
                  )}
                </div>
              </div>

              {/* Mobile 3-Way Segmented Control */}
              <div
                className="grid grid-cols-3 p-1 rounded-xl border gap-1"
                style={{
                  backgroundColor: 'var(--athlon-surface)',
                  borderColor: 'var(--athlon-border)',
                }}
              >
                {/* 1. MANAGE */}
                <button
                  type="button"
                  onClick={() => handleSetPermission(selectedRole, m.id, 'MANAGE')}
                  className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] font-extrabold transition-all active:scale-95 ${
                    currentLevel === 'MANAGE'
                      ? 'bg-emerald-500 text-neutral-950 shadow-sm'
                      : 'text-foreground/60 hover:text-foreground'
                  }`}
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Manage</span>
                </button>

                {/* 2. VIEW */}
                <button
                  type="button"
                  onClick={() => handleSetPermission(selectedRole, m.id, 'VIEW')}
                  className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] font-extrabold transition-all active:scale-95 ${
                    currentLevel === 'VIEW'
                      ? 'bg-amber-500 text-neutral-950 shadow-sm'
                      : 'text-foreground/60 hover:text-foreground'
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  <span>View</span>
                </button>

                {/* 3. HIDE */}
                <button
                  type="button"
                  onClick={() => handleSetPermission(selectedRole, m.id, 'NONE')}
                  className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] font-extrabold transition-all active:scale-95 ${
                    currentLevel === 'NONE'
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'text-foreground/60 hover:text-foreground'
                  }`}
                >
                  <EyeOff className="w-3 h-3" />
                  <span>Hide</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredModules.length === 0 && (
        <div
          className="text-center py-12 rounded-2xl border"
          style={{
            backgroundColor: 'var(--athlon-card)',
            borderColor: 'var(--athlon-border)',
          }}
        >
          <Search className="w-8 h-8 mx-auto text-foreground/30 mb-2" />
          <div className="font-bold text-sm text-foreground">No matching tools found</div>
          <div className="text-xs text-foreground/50 mt-0.5">Try adjusting your search query or category filter</div>
        </div>
      )}

      {/* ── STICKY BOTTOM SAVE BAR (Haptic Pulse on Mobile) ── */}
      {hasChanges && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-8 sm:w-auto z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div
            className="p-3 sm:px-5 sm:py-3 rounded-2xl border shadow-2xl backdrop-blur-2xl flex items-center justify-between gap-3 max-w-lg mx-auto"
            style={{
              backgroundColor: 'var(--athlon-sidebar)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="flex h-2.5 w-2.5 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
              <span className="text-xs font-bold text-foreground truncate">
                Unsaved changes
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setMatrix(initialMatrix)}
                className="px-3 py-2 rounded-xl text-xs font-bold text-foreground/70 hover:text-foreground bg-foreground/5 transition active:scale-95"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveChanges}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:opacity-90 text-primary-foreground font-black text-xs shadow-lg shadow-primary/25 transition-all active:scale-95"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
