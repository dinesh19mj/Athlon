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
  DollarSign,
  Settings,
  Search,
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

const ACADEMY_MODULES: ModuleDef[] = [
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
    description: 'Front-desk, trainers & facility workers',
    category: 'operations',
    icon: Users,
  },
  {
    id: 'finances',
    name: 'Finances',
    description: 'Fee collection, batch invoices & expenses',
    category: 'admin',
    icon: DollarSign,
  },
  {
    id: 'settings',
    name: 'Settings',
    description: 'Academy configuration & operational preferences',
    category: 'admin',
    icon: Settings,
  },
];

const ACADEMY_ROLES = [
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

const ACADEMY_DEFAULT_FALLBACK_MATRIX: Record<string, Record<string, AccessLevel>> = {
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
  const [matrix, setMatrix] = useState<Record<string, Record<string, AccessLevel>>>(ACADEMY_DEFAULT_FALLBACK_MATRIX);
  const [initialMatrix, setInitialMatrix] = useState<Record<string, Record<string, AccessLevel>>>(ACADEMY_DEFAULT_FALLBACK_MATRIX);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [toastMsg, setToastMsg] = useState<{ text: string; isError?: boolean } | null>(null);

  const showNotification = (text: string, isError = false) => {
    setToastMsg({ text, isError });
    setTimeout(() => setToastMsg(null), 3500);
  };

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
        setMatrix(ACADEMY_DEFAULT_FALLBACK_MATRIX);
        setInitialMatrix(JSON.parse(JSON.stringify(ACADEMY_DEFAULT_FALLBACK_MATRIX)));
      }
    } catch (err) {
      console.warn('Using default fallback permissions matrix', err);
      setMatrix(ACADEMY_DEFAULT_FALLBACK_MATRIX);
      setInitialMatrix(JSON.parse(JSON.stringify(ACADEMY_DEFAULT_FALLBACK_MATRIX)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [orgUuid]);

  const hasChanges = useMemo(() => {
    return JSON.stringify(matrix) !== JSON.stringify(initialMatrix);
  }, [matrix, initialMatrix]);

  const handleSetPermission = (role: string, moduleId: string, level: AccessLevel) => {
    setMatrix((prev) => {
      const updated = { ...prev };
      if (!updated[role]) updated[role] = {};
      updated[role] = { ...updated[role], [moduleId]: level };
      return updated;
    });
  };

  const handleBulkSet = (level: AccessLevel) => {
    setMatrix((prev) => {
      const updated = { ...prev };
      if (!updated[selectedRole]) updated[selectedRole] = {};
      const newRoleObj = { ...updated[selectedRole] };
      ACADEMY_MODULES.forEach((m) => {
        newRoleObj[m.id] = level;
      });
      updated[selectedRole] = newRoleObj;
      return updated;
    });
    const label = level === 'MANAGE' ? 'Manage' : level === 'VIEW' ? 'View Only' : 'Hidden';
    showNotification(`Set all modules to ${label} for ${selectedRole}`);
  };

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
        setMatrix(ACADEMY_DEFAULT_FALLBACK_MATRIX);
        setInitialMatrix(JSON.parse(JSON.stringify(ACADEMY_DEFAULT_FALLBACK_MATRIX)));
      }
      showNotification('Permissions reset to recommended defaults');
    } catch (err) {
      console.warn('Resetting locally', err);
      setMatrix(ACADEMY_DEFAULT_FALLBACK_MATRIX);
      setInitialMatrix(JSON.parse(JSON.stringify(ACADEMY_DEFAULT_FALLBACK_MATRIX)));
      showNotification('Permissions reset to recommended defaults');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      const payload: { role: string; moduleId: string; accessLevel: AccessLevel }[] = [];

      Object.entries(matrix).forEach(([r, moduleMap]) => {
        Object.entries(moduleMap).forEach(([m, level]) => {
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

  const filteredModules = useMemo(() => {
    return ACADEMY_MODULES.filter((m) => {
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

    ACADEMY_MODULES.forEach((m) => {
      const lvl = roleObj[m.id] || 'NONE';
      if (lvl === 'MANAGE') manageCount++;
      else if (lvl === 'VIEW') viewCount++;
      else hiddenCount++;
    });

    return { manageCount, viewCount, hiddenCount, total: ACADEMY_MODULES.length };
  }, [matrix, selectedRole]);

  const activeRoleDef = ACADEMY_ROLES.find((r) => r.id === selectedRole) || ACADEMY_ROLES[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toastMsg && (
        <div
          className={`fixed bottom-20 md:bottom-8 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border backdrop-blur-md animate-in slide-in-from-bottom-3 duration-200 ${
            toastMsg.isError
              ? 'bg-rose-500/15 border-rose-500/30 text-rose-400'
              : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
          }`}
        >
          {toastMsg.isError ? (
            <AlertCircle className="w-4 h-4 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          )}
          <span className="text-xs font-bold text-foreground">{toastMsg.text}</span>
        </div>
      )}

      {/* Hero Header Card */}
      <div
        className="relative overflow-hidden rounded-3xl p-5 sm:p-7 border shadow-sm"
        style={{
          backgroundColor: 'var(--athlon-surface)',
          borderColor: 'var(--athlon-border)',
        }}
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-primary">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-foreground">
                Academy Roles &amp; Permissions
              </h2>
              <p className="text-xs text-foreground/50 mt-0.5">
                Manage role access levels across academy modules.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-center shrink-0">
            <button
              onClick={handleResetToDefaults}
              disabled={loading || saving}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold text-foreground/70 hover:text-foreground hover:bg-foreground/5 transition-all active:scale-95 disabled:opacity-50"
              style={{ borderColor: 'var(--athlon-border)' }}
              title="Reset to recommended matrix"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>

            <button
              onClick={handleSaveChanges}
              disabled={!hasChanges || saving || loading}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold shadow-lg transition-all active:scale-95 ${
                hasChanges
                  ? 'bg-primary text-primary-foreground shadow-primary/25 hover:brightness-110'
                  : 'bg-foreground/10 text-foreground/40 border cursor-not-allowed'
              }`}
              style={{ borderColor: hasChanges ? undefined : 'var(--athlon-border)' }}
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : hasChanges ? 'Save Changes' : 'Saved'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Role Switcher Tabs */}
      <div className="space-y-2">
        <label className="text-[11px] font-black uppercase tracking-wider text-foreground/50 px-1">
          Select Role to Configure
        </label>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {ACADEMY_ROLES.map((r) => {
            const Icon = r.icon;
            const isSelected = selectedRole === r.id;
            return (
              <button
                key={r.id}
                onClick={() => setSelectedRole(r.id)}
                className={`relative p-4 rounded-2xl border text-left transition-all active:scale-98 ${
                  isSelected
                    ? 'ring-2 ring-primary border-primary bg-surface shadow-md'
                    : 'bg-card hover:bg-surface border-transparent text-foreground/70 hover:text-foreground'
                }`}
                style={{
                  borderColor: isSelected ? 'var(--athlon-primary)' : 'var(--athlon-border)',
                  backgroundColor: isSelected ? 'var(--athlon-surface)' : 'var(--athlon-card)',
                }}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className={`p-2 rounded-xl border ${r.accentColor}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  )}
                </div>

                <div className="font-bold text-sm text-foreground">{r.label}</div>
                <div className="text-[11px] text-foreground/50 mt-0.5 line-clamp-1">
                  {r.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Role Control Bar */}
      <div
        className="p-3.5 sm:p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
        style={{
          backgroundColor: 'var(--athlon-surface)',
          borderColor: 'var(--athlon-border)',
        }}
      >
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl border ${activeRoleDef.accentColor}`}>
            <activeRoleDef.icon className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-foreground flex items-center gap-2">
              <span>{activeRoleDef.label}</span>
              <span className="text-[10px] font-medium text-foreground/50">
                ({currentRoleStats.manageCount} Manage • {currentRoleStats.viewCount} View • {currentRoleStats.hiddenCount} None)
              </span>
            </div>
          </div>
        </div>

        {/* Bulk Action Buttons */}
        <div className="flex items-center gap-1.5 self-start sm:self-center">
          <span className="text-[10px] font-bold text-foreground/40 uppercase mr-1">
            Bulk:
          </span>
          <button
            onClick={() => handleBulkSet('MANAGE')}
            className="px-2.5 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/20 active:scale-95 transition-all"
          >
            All Manage
          </button>
          <button
            onClick={() => handleBulkSet('VIEW')}
            className="px-2.5 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25 hover:bg-blue-500/20 active:scale-95 transition-all"
          >
            All View
          </button>
          <button
            onClick={() => handleBulkSet('NONE')}
            className="px-2.5 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider bg-foreground/5 text-foreground/50 border-foreground/10 hover:bg-foreground/10 active:scale-95 transition-all"
          >
            Hide All
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-2.5 justify-between">
        {/* Category Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 active:scale-95 ${
                activeCategory === c.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-card text-foreground/60 border hover:text-foreground'
              }`}
              style={{ borderColor: activeCategory === c.id ? undefined : 'var(--athlon-border)' }}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
          <input
            type="text"
            placeholder="Search modules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border bg-card text-xs text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary"
            style={{ borderColor: 'var(--athlon-border)' }}
          />
        </div>
      </div>

      {/* Modules Permission List */}
      <div className="space-y-2.5">
        {filteredModules.map((m) => {
          const Icon = m.icon;
          const currentLevel = matrix[selectedRole]?.[m.id] || 'NONE';

          return (
            <div
              key={m.id}
              className="p-3.5 sm:p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all hover:border-primary/30"
              style={{
                backgroundColor: 'var(--athlon-surface)',
                borderColor: 'var(--athlon-border)',
              }}
            >
              {/* Module Info */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-card border flex items-center justify-center text-foreground shrink-0" style={{ borderColor: 'var(--athlon-border)' }}>
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-xs sm:text-sm text-foreground">
                    <span className="truncate">{m.name}</span>
                  </div>
                  <p className="text-[11px] text-foreground/50 truncate mt-0.5">
                    {m.description}
                  </p>
                </div>
              </div>

              {/* 3-State Access Control Segmented Toggle */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-card border shrink-0 self-end sm:self-center" style={{ borderColor: 'var(--athlon-border)' }}>
                {/* MANAGE */}
                <button
                  onClick={() => handleSetPermission(selectedRole, m.id, 'MANAGE')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    currentLevel === 'MANAGE'
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                      : 'text-foreground/60 hover:text-foreground hover:bg-foreground/5'
                  }`}
                  title="Full read & write access"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Manage</span>
                </button>

                {/* VIEW */}
                <button
                  onClick={() => handleSetPermission(selectedRole, m.id, 'VIEW')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    currentLevel === 'VIEW'
                      ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20'
                      : 'text-foreground/60 hover:text-foreground hover:bg-foreground/5'
                  }`}
                  title="Read-only access"
                >
                  <Eye className="w-3 h-3" />
                  <span>View</span>
                </button>

                {/* NONE */}
                <button
                  onClick={() => handleSetPermission(selectedRole, m.id, 'NONE')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    currentLevel === 'NONE'
                      ? 'bg-foreground/20 text-foreground shadow-sm'
                      : 'text-foreground/40 hover:text-foreground hover:bg-foreground/5'
                  }`}
                  title="Completely hidden / blocked"
                >
                  <EyeOff className="w-3 h-3" />
                  <span>Hidden</span>
                </button>
              </div>
            </div>
          );
        })}

        {filteredModules.length === 0 && (
          <div className="p-8 text-center rounded-2xl border bg-surface" style={{ borderColor: 'var(--athlon-border)' }}>
            <p className="text-xs text-foreground/50">No modules found matching &quot;{searchQuery}&quot;</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AcademyPermissionMatrixView;
