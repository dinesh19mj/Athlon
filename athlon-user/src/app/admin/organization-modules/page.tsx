'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Layers,
  Plus,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Building2,
  Trophy,
  GraduationCap,
  Users,
  UserCheck,
  Compass,
  Landmark,
  Shield,
  Edit3,
  Trash2,
  Check,
  X,
  ExternalLink,
  Sliders,
  Sparkles,
  Lock,
  Globe,
  Tag,
  Calendar,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ArrowUpRight,
} from 'lucide-react';
import {
  OrganizationModuleApi,
  OrganizationModuleConfig,
  ModuleStatus,
  BadgeVariant,
  CreateOrgModulePayload,
  UpdateOrgModulePayload,
} from '@/lib/api/organizationModule';

const ICON_MAP: Record<string, React.ElementType> = {
  Landmark,
  Trophy,
  GraduationCap,
  Users,
  UserCheck,
  Compass,
  Building2,
  Shield,
  Globe,
  Sparkles,
};

const STATUS_CONFIG: Record<
  ModuleStatus,
  { label: string; bg: string; text: string; border: string; icon: React.ElementType }
> = {
  ACTIVE: {
    label: 'Live / Active',
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-500/30',
    icon: CheckCircle2,
  },
  BETA: {
    label: 'Beta / Soft Launch',
    bg: 'bg-blue-500/10 dark:bg-blue-500/15',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-500/30',
    icon: Clock,
  },
  COMING_SOON: {
    label: 'Coming Soon / Waitlist',
    bg: 'bg-amber-500/10 dark:bg-amber-500/15',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-500/30',
    icon: AlertTriangle,
  },
  DISABLED: {
    label: 'Disabled / Hidden',
    bg: 'bg-slate-500/10 dark:bg-slate-500/15',
    text: 'text-slate-600 dark:text-slate-400',
    border: 'border-slate-500/30',
    icon: XCircle,
  },
};

const BADGE_VARIANTS: Record<BadgeVariant, { label: string; class: string }> = {
  emerald: { label: 'Emerald', class: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30' },
  blue: { label: 'Blue', class: 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30' },
  amber: { label: 'Amber', class: 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30' },
  purple: { label: 'Purple', class: 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30' },
  slate: { label: 'Slate', class: 'bg-slate-500/20 text-slate-700 dark:text-slate-300 border-slate-500/30' },
};

export default function AdminOrganizationModulesPage() {
  const [modules, setModules] = useState<OrganizationModuleConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | ModuleStatus>('ALL');
  const [actionLoadingKey, setActionLoadingKey] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Edit / Create Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedModule, setSelectedModule] = useState<OrganizationModuleConfig | null>(null);

  // Form states
  const [formKey, setFormKey] = useState('');
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formIcon, setFormIcon] = useState('Building2');
  const [formRoute, setFormRoute] = useState('');
  const [formStatus, setFormStatus] = useState<ModuleStatus>('ACTIVE');
  const [formBadgeText, setFormBadgeText] = useState('');
  const [formBadgeVariant, setFormBadgeVariant] = useState<BadgeVariant>('emerald');
  const [formWorkspaceCreation, setFormWorkspaceCreation] = useState(true);
  const [formShowPricing, setFormShowPricing] = useState(true);
  const [formShowDiscovery, setFormShowDiscovery] = useState(true);
  const [formMaintenanceMsg, setFormMaintenanceMsg] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadModules = async () => {
    setLoading(true);
    try {
      const data = await OrganizationModuleApi.getAllAdmin();
      setModules(data);
    } catch (err: any) {
      console.error('Failed to load organization modules:', err);
      showToast('error', 'Could not load organization modules from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadModules();
  }, []);

  // Filtered modules
  const filteredModules = useMemo(() => {
    return modules.filter((m) => {
      const matchSearch =
        m.displayName.toLowerCase().includes(search.toLowerCase()) ||
        m.moduleKey.toLowerCase().includes(search.toLowerCase()) ||
        m.categoryLabel.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || m.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [modules, search, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = modules.length;
    const active = modules.filter((m) => m.status === 'ACTIVE' && m.isEnabled).length;
    const beta = modules.filter((m) => m.status === 'BETA').length;
    const comingSoon = modules.filter((m) => m.status === 'COMING_SOON').length;
    const disabled = modules.filter((m) => m.status === 'DISABLED' || !m.isEnabled).length;
    return { total, active, beta, comingSoon, disabled };
  }, [modules]);

  // Quick Toggle Master Status
  const handleToggleModule = async (key: string) => {
    setActionLoadingKey(key);
    try {
      const updated = await OrganizationModuleApi.toggleStatus(key);
      setModules((prev) => prev.map((m) => (m.moduleKey === key ? updated : m)));
      showToast('success', `${updated.displayName} is now ${updated.isEnabled ? 'Enabled' : 'Disabled'}.`);
    } catch (err: any) {
      console.error('Failed to toggle module:', err);
      showToast('error', err?.data?.message || err?.message || 'Failed to toggle module status.');
    } finally {
      setActionLoadingKey(null);
    }
  };

  // Quick Change Lifecycle Status
  const handleStatusChange = async (key: string, newStatus: ModuleStatus) => {
    setActionLoadingKey(key);
    try {
      const isEnabled = newStatus !== 'DISABLED';
      const updated = await OrganizationModuleApi.update(key, { status: newStatus, isEnabled });
      setModules((prev) => prev.map((m) => (m.moduleKey === key ? updated : m)));
      showToast('success', `Status updated to ${STATUS_CONFIG[newStatus].label}.`);
    } catch (err: any) {
      console.error('Failed to update module status:', err);
      showToast('error', err?.data?.message || err?.message || 'Failed to change status.');
    } finally {
      setActionLoadingKey(null);
    }
  };

  // Quick Toggle Feature Flags
  const handleToggleFlag = async (
    key: string,
    field: 'allowWorkspaceCreation' | 'showInPricing' | 'showInDiscovery',
    currentVal: boolean
  ) => {
    setActionLoadingKey(key);
    try {
      const payload: UpdateOrgModulePayload = { [field]: !currentVal };
      const updated = await OrganizationModuleApi.update(key, payload);
      setModules((prev) => prev.map((m) => (m.moduleKey === key ? updated : m)));
      showToast('success', 'Feature flag updated.');
    } catch (err: any) {
      console.error('Failed to update flag:', err);
      showToast('error', 'Failed to update feature toggle.');
    } finally {
      setActionLoadingKey(null);
    }
  };

  // Delete Custom Module
  const handleDeleteModule = async (key: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete custom module "${name}" (${key})?`)) return;
    setActionLoadingKey(key);
    try {
      await OrganizationModuleApi.delete(key);
      setModules((prev) => prev.filter((m) => m.moduleKey !== key));
      showToast('success', `Module ${name} deleted successfully.`);
    } catch (err: any) {
      console.error('Failed to delete module:', err);
      showToast('error', err?.data?.message || err?.message || 'Cannot delete module.');
    } finally {
      setActionLoadingKey(null);
    }
  };

  // Open Modal for Edit
  const handleOpenEdit = (m: OrganizationModuleConfig) => {
    setSelectedModule(m);
    setModalMode('edit');
    setFormKey(m.moduleKey);
    setFormName(m.displayName);
    setFormCategory(m.categoryLabel);
    setFormDesc(m.description || '');
    setFormIcon(m.iconName || 'Building2');
    setFormRoute(m.routePrefix || '');
    setFormStatus(m.status);
    setFormBadgeText(m.badgeText || '');
    setFormBadgeVariant(m.badgeVariant || 'emerald');
    setFormWorkspaceCreation(m.allowWorkspaceCreation);
    setFormShowPricing(m.showInPricing);
    setFormShowDiscovery(m.showInDiscovery);
    setFormMaintenanceMsg(m.maintenanceMessage || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  // Open Modal for Create
  const handleOpenCreate = () => {
    setSelectedModule(null);
    setModalMode('create');
    setFormKey('');
    setFormName('');
    setFormCategory('Specialized Sports Operations');
    setFormDesc('');
    setFormIcon('Building2');
    setFormRoute('');
    setFormStatus('ACTIVE');
    setFormBadgeText('NEW');
    setFormBadgeVariant('emerald');
    setFormWorkspaceCreation(true);
    setFormShowPricing(true);
    setFormShowDiscovery(true);
    setFormMaintenanceMsg('');
    setFormError(null);
    setIsModalOpen(true);
  };

  // Handle Form Submit
  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (modalMode === 'create') {
      if (!formKey.trim()) {
        setFormError('Module Key is required.');
        return;
      }
      if (!/^[A-Za-z0-9_]+$/.test(formKey.trim())) {
        setFormError('Module Key must contain only uppercase letters, numbers, and underscores (e.g. FEDERATION).');
        return;
      }
    }
    if (!formName.trim()) {
      setFormError('Display Name is required.');
      return;
    }
    if (!formCategory.trim()) {
      setFormError('Category Label is required.');
      return;
    }

    try {
      if (modalMode === 'create') {
        const payload: CreateOrgModulePayload = {
          moduleKey: formKey.trim().toUpperCase(),
          displayName: formName.trim(),
          categoryLabel: formCategory.trim(),
          description: formDesc.trim() || undefined,
          iconName: formIcon,
          routePrefix: formRoute.trim() || `/${formKey.trim().toLowerCase()}`,
          status: formStatus,
          isEnabled: formStatus !== 'DISABLED',
          badgeText: formBadgeText.trim() || undefined,
          badgeVariant: formBadgeVariant,
          allowWorkspaceCreation: formWorkspaceCreation,
          showInPricing: formShowPricing,
          showInDiscovery: formShowDiscovery,
          maintenanceMessage: formMaintenanceMsg.trim() || undefined,
        };
        const created = await OrganizationModuleApi.create(payload);
        setModules((prev) => [...prev, created]);
        showToast('success', `New module "${created.displayName}" created successfully.`);
      } else {
        const payload: UpdateOrgModulePayload = {
          displayName: formName.trim(),
          categoryLabel: formCategory.trim(),
          description: formDesc.trim() || undefined,
          iconName: formIcon,
          routePrefix: formRoute.trim() || undefined,
          status: formStatus,
          isEnabled: formStatus !== 'DISABLED',
          badgeText: formBadgeText.trim() || undefined,
          badgeVariant: formBadgeVariant,
          allowWorkspaceCreation: formWorkspaceCreation,
          showInPricing: formShowPricing,
          showInDiscovery: formShowDiscovery,
          maintenanceMessage: formMaintenanceMsg.trim() || undefined,
        };
        const updated = await OrganizationModuleApi.update(selectedModule!.moduleKey, payload);
        setModules((prev) => prev.map((m) => (m.moduleKey === updated.moduleKey ? updated : m)));
        showToast('success', `Module "${updated.displayName}" updated successfully.`);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Failed to save module:', err);
      setFormError(err?.data?.message || err?.message || 'Failed to save module configuration.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ─── Toast Message ─────────────────────────────────────────────────── */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl border shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
              : 'bg-rose-950/90 border-rose-500/40 text-rose-200'
          }`}
        >
          {toastMessage.type === 'success' ? <Check className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
          <span className="text-sm font-semibold">{toastMessage.text}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MOBILE VIEW (max-width: md) — WORKSPACE DESIGN LANGUAGE
          Adapts dynamically to Light/Dark Mode & User's Selected Theme
          ───────────────────────────────────────────────────────────── */}
      <div className="block md:hidden space-y-3.5 pb-16">
        {/* 1. Mobile Compact Header */}
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border shadow-xs"
              style={{
                backgroundColor: 'var(--athlon-surface)',
                borderColor: 'var(--athlon-border)',
                color: 'var(--athlon-primary)',
              }}
            >
              <Layers className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1
                  className="text-base font-black uppercase tracking-tight truncate leading-none"
                  style={{ color: 'var(--athlon-text)' }}
                >
                  Org Verticals
                </h1>
                <span
                  className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md border shrink-0"
                  style={{
                    backgroundColor: 'rgba(var(--primary-rgb, 16), 0.1)',
                    borderColor: 'rgba(var(--primary-rgb, 16), 0.25)',
                    color: 'var(--athlon-primary)',
                  }}
                >
                  {modules.length}
                </span>
              </div>
              <p
                className="text-[10px] truncate mt-0.5"
                style={{ color: 'var(--athlon-text-muted)' }}
              >
                Dynamic modules &amp; rollout control
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={loadModules}
              disabled={loading}
              className="w-8 h-8 rounded-xl border flex items-center justify-center transition-all active:scale-95 shadow-xs disabled:opacity-50 cursor-pointer"
              style={{
                backgroundColor: 'var(--athlon-surface)',
                borderColor: 'var(--athlon-border)',
                color: 'var(--athlon-text)',
              }}
              title="Refresh Modules"
              aria-label="Refresh"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} style={{ color: 'var(--athlon-primary)' }} />
            </button>
            <button
              type="button"
              onClick={handleOpenCreate}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary text-black font-black text-xs uppercase tracking-wider shadow-md shadow-primary/20 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>New</span>
            </button>
          </div>
        </div>

        {/* 2. Mobile Metric Carousel / Telemetry Pods (Horizontal Snap-Scroll) */}
        <div className="flex items-stretch gap-2 overflow-x-auto pb-1 pt-0.5 hide-scrollbar snap-x snap-mandatory">
          {/* Total */}
          <div
            className="shrink-0 snap-start w-[105px] p-2.5 rounded-2xl border flex flex-col justify-between shadow-xs"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <span className="text-[9px] font-black uppercase tracking-wider" style={{ color: 'var(--athlon-text-muted)' }}>
              Total
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-xl font-black font-mono leading-none" style={{ color: 'var(--athlon-text)' }}>
                {stats.total}
              </span>
              <Layers className="w-3.5 h-3.5 opacity-40 text-foreground" />
            </div>
            <span className="text-[8px] font-bold text-text-muted mt-1">Verticals</span>
          </div>

          {/* Live Active */}
          <div className="shrink-0 snap-start w-[105px] p-2.5 rounded-2xl border flex flex-col justify-between shadow-xs bg-emerald-500/5 border-emerald-500/25">
            <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Live
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-xl font-black font-mono leading-none text-emerald-700 dark:text-emerald-300">
                {stats.active}
              </span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <span className="text-[8px] font-bold text-emerald-600/80 dark:text-emerald-400/80 mt-1">Open Signups</span>
          </div>

          {/* Beta */}
          <div className="shrink-0 snap-start w-[105px] p-2.5 rounded-2xl border flex flex-col justify-between shadow-xs bg-blue-500/5 border-blue-500/25">
            <span className="text-[9px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Beta
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-xl font-black font-mono leading-none text-blue-700 dark:text-blue-300">
                {stats.beta}
              </span>
              <Clock className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <span className="text-[8px] font-bold text-blue-600/80 dark:text-blue-400/80 mt-1">Soft Launch</span>
          </div>

          {/* Coming Soon */}
          <div className="shrink-0 snap-start w-[105px] p-2.5 rounded-2xl border flex flex-col justify-between shadow-xs bg-amber-500/5 border-amber-500/25">
            <span className="text-[9px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Soon
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-xl font-black font-mono leading-none text-amber-700 dark:text-amber-300">
                {stats.comingSoon}
              </span>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <span className="text-[8px] font-bold text-amber-600/80 dark:text-amber-400/80 mt-1">Waitlist Only</span>
          </div>

          {/* Disabled */}
          <div className="shrink-0 snap-start w-[105px] p-2.5 rounded-2xl border flex flex-col justify-between shadow-xs bg-slate-500/5 border-slate-500/25">
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Off
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-xl font-black font-mono leading-none text-slate-600 dark:text-slate-300">
                {stats.disabled}
              </span>
              <XCircle className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <span className="text-[8px] font-bold text-slate-500/80 mt-1">Disabled</span>
          </div>
        </div>

        {/* 3. Mobile Search & Quick Filter Bar */}
        <div
          className="p-3 rounded-2xl border space-y-2.5 shadow-xs"
          style={{
            backgroundColor: 'var(--athlon-card)',
            borderColor: 'var(--athlon-border)',
          }}
        >
          {/* Search Box */}
          <div className="relative w-full">
            <Search
              className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--athlon-text-muted)' }}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search vertical key, name, category..."
              className="w-full pl-9 pr-8 py-2 rounded-xl text-xs border focus:outline-none transition-colors"
              style={{
                backgroundColor: 'var(--athlon-surface)',
                borderColor: 'var(--athlon-border)',
                color: 'var(--athlon-text)',
              }}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-md hover:opacity-75 cursor-pointer"
                style={{ color: 'var(--athlon-text-muted)' }}
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Status Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 hide-scrollbar">
            {(['ALL', 'ACTIVE', 'BETA', 'COMING_SOON', 'DISABLED'] as const).map((st) => {
              const isActive = statusFilter === st;
              const count =
                st === 'ALL'
                  ? stats.total
                  : st === 'ACTIVE'
                  ? stats.active
                  : st === 'BETA'
                  ? stats.beta
                  : st === 'COMING_SOON'
                  ? stats.comingSoon
                  : stats.disabled;
              return (
                <button
                  key={`m-filter-${st}`}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`shrink-0 px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border flex items-center gap-1 active:scale-95 cursor-pointer ${
                    isActive
                      ? 'bg-primary text-black border-primary font-black shadow-sm shadow-primary/20 scale-[1.02]'
                      : 'bg-surface/80 border-border text-foreground/70 hover:border-primary/30'
                  }`}
                >
                  <span>{st === 'ALL' ? 'All' : st === 'COMING_SOON' ? 'Soon' : st}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive ? 'bg-black/20 text-black' : 'bg-foreground/10 text-foreground/60'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Mobile Module Cards List */}
        {loading ? (
          <div className="p-10 flex flex-col items-center justify-center text-center">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mb-2" />
            <span className="text-xs font-bold text-foreground">Syncing Verticals...</span>
          </div>
        ) : filteredModules.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-dashed border-border bg-card/40">
            <Layers className="w-8 h-8 text-text-muted mx-auto mb-2 opacity-40" />
            <h3 className="text-xs font-bold text-foreground">No matching verticals found</h3>
            <p className="text-[11px] text-text-muted mt-0.5">Try clearing the search query or status filter.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredModules.map((m) => {
              const IconComp = ICON_MAP[m.iconName || 'Building2'] || Building2;
              const statusInfo = STATUS_CONFIG[m.status] || STATUS_CONFIG.ACTIVE;
              const badgeVariantInfo = BADGE_VARIANTS[m.badgeVariant || 'emerald'];
              const isBusy = actionLoadingKey === m.moduleKey;

              return (
                <div
                  key={`mob-card-${m.moduleKey}`}
                  className={`relative rounded-[24px] border p-4 space-y-3 transition-all overflow-hidden shadow-xs backdrop-blur-md ${
                    m.isEnabled
                      ? 'border-border bg-card'
                      : 'border-border/60 opacity-70 bg-surface/40'
                  }`}
                  style={{
                    backgroundColor: 'var(--athlon-card)',
                    borderColor: 'var(--athlon-border)',
                  }}
                >
                  {/* Specular glare top sheen */}
                  <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-primary/10 via-primary/50 to-primary/10 pointer-events-none" />

                  {/* Header: Icon, Titles, Badges & Master Power Toggle */}
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 shadow-inner"
                        style={{
                          backgroundColor: 'var(--athlon-surface)',
                          borderColor: 'var(--athlon-border)',
                          color: 'var(--athlon-primary)',
                        }}
                      >
                        <IconComp className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="text-sm font-black text-foreground tracking-tight truncate leading-tight">
                            {m.displayName}
                          </h3>
                          {m.isSystemCore ? (
                            <span className="text-[8.5px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-md bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/25 shrink-0 flex items-center gap-0.5">
                              <Lock className="w-2.5 h-2.5" /> Core
                            </span>
                          ) : (
                            <span className="text-[8.5px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-md bg-blue-500/15 text-blue-600 dark:text-blue-300 border border-blue-500/25 shrink-0">
                              Custom
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <span className="text-[10px] font-bold text-text-muted truncate">
                            {m.categoryLabel}
                          </span>
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-surface border border-border text-text-secondary">
                            {m.moduleKey}
                          </span>
                          {m.badgeText && (
                            <span className={`text-[8.5px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded border ${badgeVariantInfo.class}`}>
                              {m.badgeText}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Master Power Toggle */}
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleToggleModule(m.moduleKey)}
                        className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer p-0.5 shrink-0 ${
                          m.isEnabled ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                        title={m.isEnabled ? 'Disable Module' : 'Enable Module'}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 ${
                            m.isEnabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                      <span className="text-[8px] font-mono font-bold uppercase text-text-muted">
                        {m.isEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>

                  {/* Description (if any) */}
                  {m.description && (
                    <p className="text-[11px] text-text-secondary line-clamp-2 leading-relaxed font-medium">
                      {m.description}
                    </p>
                  )}

                  {/* Rollout Lifecycle Status Selector (Compact Select) */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-bold text-text-muted uppercase tracking-wider">
                      <span>Rollout Lifecycle</span>
                      <span className={`text-[9px] px-2 py-0.2 rounded-full font-extrabold border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <div className="relative">
                      <select
                        value={m.status}
                        disabled={isBusy || !m.isEnabled}
                        onChange={(e) => handleStatusChange(m.moduleKey, e.target.value as ModuleStatus)}
                        className={`w-full appearance-none py-2 pl-3 pr-8 text-xs font-black rounded-xl border focus:outline-none cursor-pointer transition-all ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}
                      >
                        <option value="ACTIVE" className="bg-card text-foreground">🟢 Live &amp; Active (Open Creation)</option>
                        <option value="BETA" className="bg-card text-foreground">🔵 Beta / Soft Launch (Invite Only)</option>
                        <option value="COMING_SOON" className="bg-card text-foreground">🟡 Coming Soon (Waitlist &amp; Teaser)</option>
                        <option value="DISABLED" className="bg-card text-foreground">⚪ Disabled / Paused (Offline)</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                    </div>
                  </div>

                  {/* Tactile 3-Feature Switch Matrix */}
                  <div
                    className="p-2 rounded-2xl border grid grid-cols-3 divide-x text-center shadow-inner"
                    style={{
                      backgroundColor: 'var(--athlon-surface)',
                      borderColor: 'var(--athlon-border)',
                    }}
                  >
                    {/* 1. Workspaces */}
                    <button
                      type="button"
                      disabled={isBusy || !m.isEnabled || m.status === 'DISABLED'}
                      onClick={() => handleToggleFlag(m.moduleKey, 'allowWorkspaceCreation', m.allowWorkspaceCreation)}
                      className="px-1 flex flex-col items-center gap-1 active:scale-95 transition-transform cursor-pointer disabled:opacity-50"
                      title="Tap to toggle Workspace Creation"
                    >
                      <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider truncate w-full flex items-center justify-center gap-1">
                        <Building2 className="w-2.5 h-2.5 text-primary" /> Creation
                      </span>
                      <span
                        className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-md border ${
                          m.allowWorkspaceCreation
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
                        }`}
                      >
                        {m.allowWorkspaceCreation ? 'Open' : 'Paused'}
                      </span>
                    </button>

                    {/* 2. Pricing Visibility */}
                    <button
                      type="button"
                      disabled={isBusy || !m.isEnabled || m.status === 'DISABLED'}
                      onClick={() => handleToggleFlag(m.moduleKey, 'showInPricing', m.showInPricing)}
                      className="px-1 flex flex-col items-center gap-1 active:scale-95 transition-transform cursor-pointer disabled:opacity-50"
                      title="Tap to toggle Pricing Visibility"
                    >
                      <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider truncate w-full flex items-center justify-center gap-1">
                        <Tag className="w-2.5 h-2.5 text-primary" /> Pricing
                      </span>
                      <span
                        className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-md border ${
                          m.showInPricing
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                            : 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30'
                        }`}
                      >
                        {m.showInPricing ? 'Visible' : 'Hidden'}
                      </span>
                    </button>

                    {/* 3. Discovery Visibility */}
                    <button
                      type="button"
                      disabled={isBusy || !m.isEnabled || m.status === 'DISABLED'}
                      onClick={() => handleToggleFlag(m.moduleKey, 'showInDiscovery', m.showInDiscovery)}
                      className="px-1 flex flex-col items-center gap-1 active:scale-95 transition-transform cursor-pointer disabled:opacity-50"
                      title="Tap to toggle Discovery Visibility"
                    >
                      <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider truncate w-full flex items-center justify-center gap-1">
                        <Globe className="w-2.5 h-2.5 text-primary" /> Discovery
                      </span>
                      <span
                        className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-md border ${
                          m.showInDiscovery
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                            : 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30'
                        }`}
                      >
                        {m.showInDiscovery ? 'Live' : 'Hidden'}
                      </span>
                    </button>
                  </div>

                  {/* Maintenance / Waitlist banner warning if active */}
                  {m.maintenanceMessage && (
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-[10.5px] text-amber-700 dark:text-amber-300 flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span className="line-clamp-2 leading-snug">{m.maintenanceMessage}</span>
                    </div>
                  )}

                  {/* Mobile Actions Bottom Row */}
                  <div className="pt-0.5 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(m)}
                      className="flex-1 py-2 px-3 rounded-xl border hover:border-primary/40 text-foreground text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs"
                      style={{
                        backgroundColor: 'var(--athlon-surface)',
                        borderColor: 'var(--athlon-border)',
                      }}
                    >
                      <Sliders className="w-3.5 h-3.5 text-primary" />
                      <span>Configure Details</span>
                    </button>

                    {!m.isSystemCore && (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleDeleteModule(m.moduleKey, m.displayName)}
                        title="Delete Custom Module"
                        className="p-2 rounded-xl border border-rose-500/25 text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer shrink-0 active:scale-95"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          DESKTOP VIEW (min-width: md) — UNCHANGED DESKTOP DESIGN
          ───────────────────────────────────────────────────────────── */}
      <div className="hidden md:block space-y-6">
        {/* ─── Header ────────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
                Organization Modules
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-primary/15 text-primary border border-primary/25">
                  Dynamic Governance
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-text-muted mt-0.5">
                Control the launch lifecycle, public visibility, workspace creation, and rollouts across all organization verticals.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={loadModules}
            disabled={loading}
            className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl border border-border hover:bg-surface text-text-secondary text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Add New Module
          </button>
        </div>
      </div>

      {/* ─── Metric Strip ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl border border-border bg-card/60 backdrop-blur-sm">
          <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">Total Verticals</span>
          <span className="text-2xl font-black text-foreground mt-1 block">{stats.total}</span>
        </div>
        <div className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5">
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Live Modules
          </span>
          <span className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1 block">{stats.active}</span>
        </div>
        <div className="p-4 rounded-2xl border border-blue-500/20 bg-blue-500/5">
          <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Beta / Soft
          </span>
          <span className="text-2xl font-black text-blue-700 dark:text-blue-300 mt-1 block">{stats.beta}</span>
        </div>
        <div className="p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5">
          <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> Coming Soon
          </span>
          <span className="text-2xl font-black text-amber-700 dark:text-amber-300 mt-1 block">{stats.comingSoon}</span>
        </div>
        <div className="p-4 rounded-2xl border border-slate-500/20 bg-slate-500/5 col-span-2 sm:col-span-1">
          <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" /> Disabled
          </span>
          <span className="text-2xl font-black text-text-secondary mt-1 block">{stats.disabled}</span>
        </div>
      </div>

      {/* ─── Search & Status Filter Filter Bar ──────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl border border-border bg-card/40">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search modules, keys, or categories..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-surface border border-border focus:border-primary focus:outline-none text-foreground placeholder:text-text-muted"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 hide-scrollbar">
          {(['ALL', 'ACTIVE', 'BETA', 'COMING_SOON', 'DISABLED'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === st
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-surface hover:bg-surface-hover text-text-secondary border border-border'
              }`}
            >
              {st === 'ALL' ? 'All Modules' : STATUS_CONFIG[st].label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Modules Grid ──────────────────────────────────────────────────── */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center text-center">
          <div className="w-9 h-9 border-3 border-primary border-t-transparent rounded-full animate-spin mb-3" />
          <span className="text-sm font-bold text-foreground">Loading organization modules...</span>
          <span className="text-xs text-text-muted mt-0.5">Fetching registry from IDENTITYSERVICE</span>
        </div>
      ) : filteredModules.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-card/40">
          <Layers className="w-10 h-10 text-text-muted mx-auto mb-2 opacity-40" />
          <h3 className="text-sm font-bold text-foreground">No matching modules found</h3>
          <p className="text-xs text-text-muted mt-0.5">Try adjusting your search query or status filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredModules.map((m) => {
            const IconComp = ICON_MAP[m.iconName || 'Building2'] || Building2;
            const statusInfo = STATUS_CONFIG[m.status] || STATUS_CONFIG.ACTIVE;
            const badgeVariantInfo = BADGE_VARIANTS[m.badgeVariant || 'emerald'];
            const isBusy = actionLoadingKey === m.moduleKey;

            return (
              <div
                key={m.moduleKey}
                className={`relative rounded-3xl border transition-all duration-200 bg-card/80 backdrop-blur-md flex flex-col justify-between overflow-hidden ${
                  m.isEnabled
                    ? 'border-border hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5'
                    : 'border-border/60 opacity-70 bg-surface/40'
                }`}
              >
                {/* Top Sheen */}
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/20 via-primary/60 to-primary/20" />

                <div className="p-5 sm:p-6 space-y-4">
                  {/* Row 1: Icon, Module Name & Core Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-surface border border-border flex items-center justify-center text-primary shrink-0 shadow-inner">
                        <IconComp className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-black text-foreground tracking-tight">{m.displayName}</h3>
                          {m.isSystemCore && (
                            <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/25">
                              Core
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-semibold text-text-muted block mt-0.5">{m.categoryLabel}</span>
                      </div>
                    </div>

                    {/* Master Power Toggle */}
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleToggleModule(m.moduleKey)}
                      title={m.isEnabled ? 'Click to Disable Module' : 'Click to Enable Module'}
                      className={`relative w-12 h-6 rounded-full transition-colors duration-200 cursor-pointer shrink-0 p-0.5 ${
                        m.isEnabled ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-transform duration-200 shadow-md ${
                          m.isEnabled ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Module Key & Custom Badge Row */}
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-lg bg-surface border border-border text-text-secondary">
                      KEY: {m.moduleKey}
                    </span>
                    {m.routePrefix && (
                      <span className="font-mono text-[10px] text-text-muted px-2 py-0.5 rounded-lg bg-surface/50 border border-border">
                        {m.routePrefix}
                      </span>
                    )}
                    {m.badgeText && (
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg border ${badgeVariantInfo.class}`}>
                        {m.badgeText}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                    {m.description || 'No description provided for this vertical.'}
                  </p>

                  {/* Lifecycle Status Dropdown Selector */}
                  <div className="pt-2">
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">
                      Rollout Lifecycle Status
                    </span>
                    <select
                      value={m.status}
                      disabled={isBusy || !m.isEnabled}
                      onChange={(e) => handleStatusChange(m.moduleKey, e.target.value as ModuleStatus)}
                      className={`w-full py-2 px-3 text-xs font-bold rounded-xl border focus:outline-none cursor-pointer transition-all ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}
                    >
                      <option value="ACTIVE" className="bg-card text-foreground">🟢 Live & Active (Open Creation)</option>
                      <option value="BETA" className="bg-card text-foreground">🔵 Beta / Soft Launch (Invite Only)</option>
                      <option value="COMING_SOON" className="bg-card text-foreground">🟡 Coming Soon (Waitlist & Teaser)</option>
                      <option value="DISABLED" className="bg-card text-foreground">⚪ Disabled / Paused (Offline)</option>
                    </select>
                  </div>

                  {/* Feature Switches Grid */}
                  <div className="p-3 rounded-2xl bg-surface/70 border border-border space-y-2.5">
                    {/* Switch: Allow Workspace Creation */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-text-secondary flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-text-muted" />
                        Allow Workspace Creation
                      </span>
                      <button
                        type="button"
                        disabled={isBusy || !m.isEnabled || m.status === 'DISABLED'}
                        onClick={() => handleToggleFlag(m.moduleKey, 'allowWorkspaceCreation', m.allowWorkspaceCreation)}
                        className={`w-8 h-4.5 rounded-full transition-colors cursor-pointer relative p-0.5 ${
                          m.allowWorkspaceCreation ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                      >
                        <div
                          className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                            m.allowWorkspaceCreation ? 'translate-x-3.5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Switch: Show in Pricing */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-text-secondary flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-text-muted" />
                        Show on Pricing Tabs
                      </span>
                      <button
                        type="button"
                        disabled={isBusy || !m.isEnabled || m.status === 'DISABLED'}
                        onClick={() => handleToggleFlag(m.moduleKey, 'showInPricing', m.showInPricing)}
                        className={`w-8 h-4.5 rounded-full transition-colors cursor-pointer relative p-0.5 ${
                          m.showInPricing ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                      >
                        <div
                          className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                            m.showInPricing ? 'translate-x-3.5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Switch: Show in Discovery */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-text-secondary flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-text-muted" />
                        Show in Discovery & Home
                      </span>
                      <button
                        type="button"
                        disabled={isBusy || !m.isEnabled || m.status === 'DISABLED'}
                        onClick={() => handleToggleFlag(m.moduleKey, 'showInDiscovery', m.showInDiscovery)}
                        className={`w-8 h-4.5 rounded-full transition-colors cursor-pointer relative p-0.5 ${
                          m.showInDiscovery ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                      >
                        <div
                          className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                            m.showInDiscovery ? 'translate-x-3.5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Maintenance / Waitlist banner warning if active */}
                  {m.maintenanceMessage && (
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-[11px] text-amber-700 dark:text-amber-300 flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{m.maintenanceMessage}</span>
                    </div>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="px-5 py-3.5 bg-surface/50 border-t border-border flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(m)}
                    className="px-3 py-1.5 rounded-xl border border-border hover:bg-surface text-text-secondary hover:text-foreground text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-primary" />
                    Configure Details
                  </button>

                  {!m.isSystemCore ? (
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleDeleteModule(m.moduleKey, m.displayName)}
                      title="Delete Custom Module"
                      className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  ) : (
                    <span className="text-[10px] text-text-muted font-bold flex items-center gap-1" title="Core modules cannot be deleted">
                      <Lock className="w-3 h-3 text-text-muted" /> Core Locked
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>

      {/* ─── Create & Edit Modal ────────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            <div className="p-6 border-b border-border flex items-center justify-between sticky top-0 bg-card z-10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-primary/10 text-primary border border-primary/20">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-foreground">
                    {modalMode === 'create' ? 'Register New Organization Module' : `Configure: ${selectedModule?.displayName}`}
                  </h2>
                  <p className="text-xs text-text-muted">
                    {modalMode === 'create'
                      ? 'Add a brand-new vertical to the dynamic platform registry.'
                      : 'Customize public labels, branding badge, quotas, and messages.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-text-muted hover:text-foreground hover:bg-surface cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Module Key & Display Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-foreground block mb-1">
                    Module Key <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    disabled={modalMode === 'edit'}
                    value={formKey}
                    onChange={(e) => setFormKey(e.target.value.toUpperCase())}
                    placeholder="e.g. FEDERATION, ESPORTS"
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-foreground font-mono focus:border-primary focus:outline-none disabled:opacity-50"
                  />
                  <span className="text-[10px] text-text-muted mt-0.5 block">Unique uppercase identifier in database</span>
                </div>

                <div>
                  <label className="font-bold text-foreground block mb-1">
                    Display Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Sports Federation"
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-foreground focus:border-primary focus:outline-none"
                  />
                  <span className="text-[10px] text-text-muted mt-0.5 block">Visible to operators and athletes</span>
                </div>
              </div>

              {/* Category Label & Route Prefix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-foreground block mb-1">
                    Category Subtitle <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    placeholder="e.g. Governing Body & Sanctions"
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-foreground block mb-1">Route Path Prefix</label>
                  <input
                    type="text"
                    value={formRoute}
                    onChange={(e) => setFormRoute(e.target.value)}
                    placeholder="e.g. /federation"
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-border font-mono text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Icon & Lifecycle Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-foreground block mb-1">Brand Icon</label>
                  <select
                    value={formIcon}
                    onChange={(e) => setFormIcon(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-foreground focus:border-primary focus:outline-none cursor-pointer"
                  >
                    {Object.keys(ICON_MAP).map((ico) => (
                      <option key={ico} value={ico}>
                        {ico}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-foreground block mb-1">Launch Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as ModuleStatus)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-foreground focus:border-primary focus:outline-none cursor-pointer"
                  >
                    <option value="ACTIVE">🟢 Live / Active</option>
                    <option value="BETA">🔵 Beta / Soft Launch</option>
                    <option value="COMING_SOON">🟡 Coming Soon / Waitlist</option>
                    <option value="DISABLED">⚪ Disabled / Paused</option>
                  </select>
                </div>
              </div>

              {/* Badge Text & Variant */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-foreground block mb-1">Highlight Badge Text</label>
                  <input
                    type="text"
                    value={formBadgeText}
                    onChange={(e) => setFormBadgeText(e.target.value)}
                    placeholder="e.g. 30D FREE TRIAL, POPULAR, NEW"
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-foreground block mb-1">Badge Color Theme</label>
                  <select
                    value={formBadgeVariant}
                    onChange={(e) => setFormBadgeVariant(e.target.value as BadgeVariant)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-foreground focus:border-primary focus:outline-none cursor-pointer"
                  >
                    {Object.entries(BADGE_VARIANTS).map(([variant, info]) => (
                      <option key={variant} value={variant}>
                        {info.label} Accent
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="font-bold text-foreground block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Summary of this organization vertical's capabilities..."
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-foreground focus:border-primary focus:outline-none resize-none"
                />
              </div>

              {/* Maintenance / Waitlist Message */}
              <div>
                <label className="font-bold text-foreground block mb-1">
                  Waitlist / Maintenance Announcement (Optional)
                </label>
                <textarea
                  rows={2}
                  value={formMaintenanceMsg}
                  onChange={(e) => setFormMaintenanceMsg(e.target.value)}
                  placeholder="e.g. Registrations for this module will open next Monday. Join our early waitlist..."
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-foreground focus:border-primary focus:outline-none resize-none"
                />
              </div>

              {/* Granular Toggles */}
              <div className="p-3.5 rounded-2xl bg-surface/50 border border-border space-y-2">
                <span className="font-bold text-foreground block mb-1">Dynamic Surface Visibility</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formWorkspaceCreation}
                    onChange={(e) => setFormWorkspaceCreation(e.target.checked)}
                    className="rounded accent-primary w-4 h-4 cursor-pointer"
                  />
                  <span className="font-semibold text-text-secondary">Allow workspace creation & registrations</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formShowPricing}
                    onChange={(e) => setFormShowPricing(e.target.checked)}
                    className="rounded accent-primary w-4 h-4 cursor-pointer"
                  />
                  <span className="font-semibold text-text-secondary">Display pricing tier card in /home/subscription</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formShowDiscovery}
                    onChange={(e) => setFormShowDiscovery(e.target.checked)}
                    className="rounded accent-primary w-4 h-4 cursor-pointer"
                  />
                  <span className="font-semibold text-text-secondary">Display marketplace & home discovery cards</span>
                </label>
              </div>

              {/* Form Footer */}
              <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border hover:bg-surface text-text-secondary font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-black shadow-md shadow-primary/20 cursor-pointer"
                >
                  {modalMode === 'create' ? 'Register Module' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

