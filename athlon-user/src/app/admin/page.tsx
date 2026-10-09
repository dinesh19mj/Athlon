'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Building2,
  Package,
  FileCheck2,
  Trophy,
  ArrowUpRight,
  RefreshCw,
  ShieldCheck,
  Activity,
  AlertCircle,
  TrendingUp,
  Layers,
  CreditCard,
  History,
  BarChart3,
  ChevronRight,
  Shield,
  Sparkles,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';
import { AdminService, AdminDashboardStats } from '@/lib/api/admin';
import { TournamentService } from '@/lib/api/tournaments';
import { useAthlonTheme } from '@/hooks/use-athlon-theme';
import { Athlon3DIcon } from '@/components/common/Athlon3DIcon';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [tournamentsCount, setTournamentsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { theme, mode } = useAthlonTheme();

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, tourRes] = await Promise.allSettled([
        AdminService.getDashboardStats(),
        TournamentService.getAll(),
      ]);

      let enrichedStats: AdminDashboardStats | null = null;
      if (statsRes.status === 'fulfilled' && statsRes.value?.data) {
        enrichedStats = { ...statsRes.value.data };
      }

      let count = 0;
      if (tourRes.status === 'fulfilled' && tourRes.value) {
        const val = tourRes.value as any;
        const list = Array.isArray(val) ? val : (Array.isArray(val?.data) ? val.data : []);
        count = list.length;
      }
      setTournamentsCount(count);

      if (enrichedStats) {
        if (!enrichedStats.totalTournaments || enrichedStats.totalTournaments === 0) {
          enrichedStats.totalTournaments = count;
        }
        setStats(enrichedStats);
      } else if (count > 0) {
        setStats({
          totalUsers: 0,
          activeUsers: 0,
          suspendedUsers: 0,
          totalOrganizations: 0,
          activeOrganizations: 0,
          organizationsByType: {},
          totalPackages: 0,
          activeSubscriptions: 0,
          pendingSubscriptionRequests: 0,
          totalTournaments: count,
        });
      }
    } catch (err: any) {
      console.error('Failed to load admin stats:', err);
      setError(err?.message || 'Could not load platform statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const orgTypes = [
    { type: 'CLUB', label: 'Clubs', color: 'text-emerald-500', barBg: 'bg-emerald-500' },
    { type: 'ACADEMY', label: 'Academies', color: 'text-blue-500', barBg: 'bg-blue-500' },
    { type: 'COURT', label: 'Venues', color: 'text-rose-500', barBg: 'bg-rose-500' },
    { type: 'ORGANIZER', label: 'Organizers', color: 'text-amber-500', barBg: 'bg-amber-500' },
    { type: 'COACH', label: 'Coaches', color: 'text-cyan-500', barBg: 'bg-cyan-500' },
  ];

  const totalCategorized = orgTypes.reduce((acc, t) => acc + (stats?.organizationsByType?.[t.type] || 0), 0) || 1;

  const platformModules = [
    { label: 'Users', icon3d: 'members' as const, href: '/admin/users' },
    { label: 'Orgs', icon3d: 'academies' as const, href: '/admin/organizations' },
    { label: 'Tournaments', icon3d: 'tournaments' as const, href: '/admin/tournaments' },
    { label: 'Sports', icon3d: 'sports' as const, href: '/admin/sports' },
    { label: 'Packages', icon3d: 'pricing' as const, href: '/admin/subscriptions/plans' },
    {
      label: 'Approvals',
      icon3d: 'registered' as const,
      href: '/admin/subscriptions/requests',
      badge: (stats?.pendingSubscriptionRequests ?? 0) > 0 ? `${stats?.pendingSubscriptionRequests}` : undefined,
    },
    { label: 'Payments', icon3d: 'finances' as const, href: '/admin/payments' },
    { label: 'App Modules', icon3d: 'setup' as const, href: '/admin/modules' },
    { label: 'Audit Logs', icon3d: 'audit-logs' as const, href: '/admin/audit-logs' },
    { label: 'Reports', icon3d: 'reports' as const, href: '/admin/reports' },
  ];

  return (
    <>
      {/* ─────────────────────────────────────────────────────────────
          MOBILE VIEW (max-width: md) — WORKSPACE DESIGN LANGUAGE
          Adapts dynamically to Light/Dark Mode & User's Selected Theme
          ───────────────────────────────────────────────────────────── */}
      <div className="block md:hidden space-y-4 pb-12">
        {/* 1. Compact Header Bar (~36px height) */}
        <div className="flex items-center justify-between px-0.5 pt-1">
          <div className="flex items-center gap-2 min-w-0">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <h1 
              className="text-base font-black uppercase tracking-tight truncate leading-none"
              style={{ color: 'var(--athlon-text)' }}
            >
              Control Center
            </h1>
            <span 
              className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md border shrink-0"
              style={{
                backgroundColor: 'var(--athlon-surface)',
                borderColor: 'var(--athlon-border)',
                color: 'var(--athlon-primary)',
              }}
            >
              Admin
            </span>
          </div>

          <button
            onClick={fetchStats}
            disabled={loading}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95 shadow-xs shrink-0 disabled:opacity-50"
            style={{
              backgroundColor: 'var(--athlon-surface)',
              borderColor: 'var(--athlon-border)',
              color: 'var(--athlon-text)',
            }}
            title="Sync Platform Telemetry"
            aria-label="Sync"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} style={{ color: 'var(--athlon-primary)' }} />
            <span>Sync</span>
          </button>
        </div>

        {error && (
          <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/25 flex items-center gap-2 text-red-500 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="truncate">{error}</span>
          </div>
        )}

        {/* 2. Space-Efficient 2x2 KPI Micro-Tiles (~105px total height) */}
        <div className="grid grid-cols-2 gap-2">
          {/* Card 1: Users */}
          <Link
            href="/admin/users"
            className="p-2.5 rounded-2xl border transition-all active:scale-[0.97] shadow-xs flex items-center justify-between group overflow-hidden"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/25 text-blue-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Users className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div 
                  className="text-[9.5px] font-bold uppercase tracking-wider leading-none"
                  style={{ color: 'var(--athlon-text-muted)' }}
                >
                  Users
                </div>
                <div 
                  className="text-lg font-black font-mono leading-tight mt-0.5"
                  style={{ color: 'var(--athlon-text)' }}
                >
                  {loading ? '...' : (stats?.totalUsers ?? 0)}
                </div>
              </div>
            </div>
            <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-md shrink-0">
              {stats?.activeUsers ?? 0} act
            </span>
          </Link>

          {/* Card 2: Organizations */}
          <Link
            href="/admin/organizations"
            className="p-2.5 rounded-2xl border transition-all active:scale-[0.97] shadow-xs flex items-center justify-between group overflow-hidden"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div 
                  className="text-[9.5px] font-bold uppercase tracking-wider leading-none"
                  style={{ color: 'var(--athlon-text-muted)' }}
                >
                  Orgs
                </div>
                <div 
                  className="text-lg font-black font-mono leading-tight mt-0.5"
                  style={{ color: 'var(--athlon-text)' }}
                >
                  {loading ? '...' : (stats?.totalOrganizations ?? 0)}
                </div>
              </div>
            </div>
            <span className="text-[9px] font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-md shrink-0">
              {stats?.activeOrganizations ?? 0} live
            </span>
          </Link>

          {/* Card 3: Subscriptions */}
          <Link
            href="/admin/subscriptions/plans"
            className="p-2.5 rounded-2xl border transition-all active:scale-[0.97] shadow-xs flex items-center justify-between group overflow-hidden"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Package className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div 
                  className="text-[9.5px] font-bold uppercase tracking-wider leading-none"
                  style={{ color: 'var(--athlon-text-muted)' }}
                >
                  Plans
                </div>
                <div 
                  className="text-lg font-black font-mono leading-tight mt-0.5"
                  style={{ color: 'var(--athlon-text)' }}
                >
                  {loading ? '...' : (stats?.activeSubscriptions ?? 0)}
                </div>
              </div>
            </div>
            <span 
              className="text-[9px] font-bold px-1.5 py-0.5 rounded-md shrink-0"
              style={{
                backgroundColor: 'rgba(var(--primary-rgb, 16), 0.1)',
                color: 'var(--athlon-primary)',
              }}
            >
              {stats?.totalPackages ?? 0} pkgs
            </span>
          </Link>

          {/* Card 4: Approvals */}
          <Link
            href="/admin/subscriptions/requests"
            className="p-2.5 rounded-2xl border transition-all active:scale-[0.97] shadow-xs flex items-center justify-between group overflow-hidden"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/25 text-purple-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <FileCheck2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div 
                  className="text-[9.5px] font-bold uppercase tracking-wider leading-none"
                  style={{ color: 'var(--athlon-text-muted)' }}
                >
                  Approvals
                </div>
                <div 
                  className="text-lg font-black font-mono leading-tight mt-0.5"
                  style={{ color: 'var(--athlon-text)' }}
                >
                  {loading ? '...' : (stats?.pendingSubscriptionRequests ?? 0)}
                </div>
              </div>
            </div>
            {(stats?.pendingSubscriptionRequests ?? 0) > 0 ? (
              <span className="text-[9px] font-black text-amber-500 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 rounded-md shrink-0 animate-pulse">
                review
              </span>
            ) : (
              <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-md shrink-0">
                clear
              </span>
            )}
          </Link>
        </div>

        {/* 3. Action Alert if Approvals Pending */}
        {(stats?.pendingSubscriptionRequests ?? 0) > 0 && (
          <Link
            href="/admin/subscriptions/requests"
            className="flex items-center justify-between p-3 rounded-2xl border transition-all active:scale-[0.98] shadow-sm"
            style={{
              backgroundColor: 'rgba(245, 158, 11, 0.08)',
              borderColor: 'rgba(245, 158, 11, 0.3)',
            }}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                <FileCheck2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-black text-amber-500 uppercase tracking-wide">
                  {stats?.pendingSubscriptionRequests} Pending Approvals
                </div>
                <div
                  className="text-[10px] truncate"
                  style={{ color: 'var(--athlon-text-muted)' }}
                >
                  Manual payment proofs require verification
                </div>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-amber-500 shrink-0" />
          </Link>
        )}

        {/* 4. Platform Modules & Tools (Workspace Horizontal Scroll Design - No Container) */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-0.5">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--athlon-primary)' }} />
              <h2
                className="text-[11px] font-black uppercase tracking-wider"
                style={{ color: 'var(--athlon-text)' }}
              >
                Platform Modules &amp; Tools
              </h2>
            </div>
            <span
              className="text-[9.5px] font-bold uppercase tracking-wider"
              style={{ color: 'var(--athlon-text-muted)' }}
            >
              {platformModules.length} Services
            </span>
          </div>

          <div className="flex items-start gap-3 overflow-x-auto pb-2 pt-1 hide-scrollbar snap-x snap-mandatory">
            {platformModules.map((mod) => (
              <Link
                key={mod.href}
                href={mod.href}
                className="flex flex-col items-center gap-1.5 shrink-0 snap-start w-[calc((100%-36px)/4)] sm:w-[72px] group cursor-pointer"
              >
                <div
                  className="relative w-[66px] h-[66px] sm:w-[72px] sm:h-[72px] max-w-full rounded-[18px] flex flex-col items-center justify-center transition-all shadow-md hover:scale-105 active:scale-95 border"
                  style={{
                    backgroundColor: 'var(--athlon-surface)',
                    borderColor: 'var(--athlon-border)',
                  }}
                >
                  <Athlon3DIcon type={mod.icon3d} size={36} active={true} />
                  {mod.badge && (
                    <div className="absolute -top-1.5 -right-1 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-black text-[7.5px] font-black uppercase tracking-wider shadow-md border border-amber-300">
                      {mod.badge}
                    </div>
                  )}
                </div>
                <span
                  className="text-[11px] font-bold text-center transition-colors group-hover:text-primary w-full truncate leading-tight"
                  style={{ color: 'var(--athlon-text-secondary)' }}
                >
                  {mod.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* 5. Workspace Distribution Card (Tenant Verticals) */}
        <div
          className="rounded-2xl p-4 border space-y-3 shadow-sm"
          style={{
            backgroundColor: 'var(--athlon-card)',
            borderColor: 'var(--athlon-border)',
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div
                className="text-xs font-black uppercase tracking-wider"
                style={{ color: 'var(--athlon-text)' }}
              >
                Workspace Distribution
              </div>
              <div
                className="text-[10px]"
                style={{ color: 'var(--athlon-text-muted)' }}
              >
                Active tenant organizations across sport verticals
              </div>
            </div>
            <Link
              href="/admin/organizations"
              className="text-[11px] font-bold flex items-center gap-1 hover:underline"
              style={{ color: 'var(--athlon-primary)' }}
            >
              Manage <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Segmented Distribution Bar */}
          <div className="h-2 w-full rounded-full bg-black/10 dark:bg-white/10 overflow-hidden flex">
            {orgTypes.map((item) => {
              const count = stats?.organizationsByType?.[item.type] || 0;
              const pct = (count / totalCategorized) * 100;
              if (pct <= 0) return null;
              return (
                <div
                  key={item.type}
                  className={`h-full ${item.barBg} transition-all`}
                  style={{ width: `${pct}%` }}
                  title={`${item.label}: ${count}`}
                />
              );
            })}
          </div>

          {/* Vertical Counts Grid */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            {orgTypes.map((item) => {
              const count = stats?.organizationsByType?.[item.type] || 0;
              return (
                <div
                  key={item.type}
                  className="p-2.5 rounded-xl border flex flex-col justify-between"
                  style={{
                    backgroundColor: 'var(--athlon-surface)',
                    borderColor: 'var(--athlon-border)',
                  }}
                >
                  <div className={`text-base font-black ${item.color}`}>
                    {loading ? '-' : count}
                  </div>
                  <div
                    className="text-[10px] font-bold truncate mt-0.5"
                    style={{ color: 'var(--athlon-text-muted)' }}
                  >
                    {item.label}
                  </div>
                </div>
              );
            })}

            {/* Tournaments Metric Tile */}
            <Link
              href="/admin/tournaments"
              className="p-2.5 rounded-xl border flex flex-col justify-between transition-all active:scale-95 group hover:border-purple-500/40"
              style={{
                backgroundColor: 'var(--athlon-surface)',
                borderColor: 'var(--athlon-border)',
              }}
            >
              <div className="text-base font-black text-purple-500 flex items-center justify-between">
                <span>{loading ? '-' : ((stats?.totalTournaments ?? tournamentsCount) || tournamentsCount)}</span>
                <ArrowUpRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity text-purple-500" />
              </div>
              <div
                className="text-[10px] font-bold truncate mt-0.5"
                style={{ color: 'var(--athlon-text-muted)' }}
              >
                Tournaments
              </div>
            </Link>
          </div>
        </div>

        {/* 6. Platform Gateway Telemetry Footer Strip */}
        <div
          className="p-3 rounded-2xl border flex items-center justify-between text-[11px]"
          style={{
            backgroundColor: 'var(--athlon-surface)',
            borderColor: 'var(--athlon-border)',
          }}
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span
              className="font-bold text-[10px] uppercase tracking-wider"
              style={{ color: 'var(--athlon-text)' }}
            >
              Platform Operational
            </span>
          </div>
          <span
            className="text-[10px] font-mono font-bold"
            style={{ color: 'var(--athlon-text-muted)' }}
          >
            v1.0 Live Gateway
          </span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          DESKTOP VIEW (min-width: md)
          Adapts dynamically to Light/Dark Mode & User's Selected Theme
          ───────────────────────────────────────────────────────────── */}
      <div className="hidden md:block space-y-8">
        {/* Top Banner / Heading */}
        <div
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b"
          style={{ borderColor: 'var(--athlon-border)' }}
        >
          <div>
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border shadow-sm"
              style={{
                backgroundColor: 'var(--athlon-surface)',
                borderColor: 'var(--athlon-border)',
                color: 'var(--athlon-primary)',
              }}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Platform Telemetry
            </div>
            <h1
              className="text-2xl sm:text-3xl font-black uppercase tracking-tight"
              style={{ color: 'var(--athlon-text)' }}
            >
              Super Admin Control Center
            </h1>
            <p
              className="text-xs sm:text-sm mt-1"
              style={{ color: 'var(--athlon-text-muted)' }}
            >
              Centralized platform metrics, organization approvals, and subscription lifecycle management.
            </p>
          </div>

          <button
            onClick={fetchStats}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider border transition-all active:scale-95 self-start sm:self-auto disabled:opacity-50 shadow-sm hover:opacity-90"
            style={{
              backgroundColor: 'var(--athlon-surface)',
              borderColor: 'var(--athlon-border)',
              color: 'var(--athlon-text)',
            }}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} style={{ color: 'var(--athlon-primary)' }} />
            <span>Refresh Stats</span>
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/25 flex items-center gap-3 text-red-500 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Primary KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Metric 1: Users */}
          <Link
            href="/admin/users"
            className="p-5 rounded-2xl border transition-all relative overflow-hidden group shadow-sm block hover:shadow-md"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: 'var(--athlon-text-muted)' }}
              >
                Registered Users
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div
              className="text-3xl font-black tracking-tight"
              style={{ color: 'var(--athlon-text)' }}
            >
              {loading ? '...' : (stats?.totalUsers ?? 0)}
            </div>
            <div className="flex items-center gap-2 mt-2 text-[11px]">
              <span className="text-emerald-500 font-bold">{stats?.activeUsers ?? 0} Active</span>
              <span style={{ color: 'var(--athlon-text-muted)' }}>•</span>
              <span style={{ color: 'var(--athlon-text-muted)' }}>{stats?.suspendedUsers ?? 0} Suspended</span>
            </div>
          </Link>

          {/* Metric 2: Organizations */}
          <Link
            href="/admin/organizations"
            className="p-5 rounded-2xl border transition-all relative overflow-hidden group shadow-sm block hover:shadow-md"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: 'var(--athlon-text-muted)' }}
              >
                Organizations
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div
              className="text-3xl font-black tracking-tight"
              style={{ color: 'var(--athlon-text)' }}
            >
              {loading ? '...' : (stats?.totalOrganizations ?? 0)}
            </div>
            <div className="flex items-center gap-2 mt-2 text-[11px]">
              <span className="text-emerald-500 font-bold">{stats?.activeOrganizations ?? 0} Operational</span>
              <span style={{ color: 'var(--athlon-text-muted)' }}>•</span>
              <span style={{ color: 'var(--athlon-text-muted)' }}>All Modules</span>
            </div>
          </Link>

          {/* Metric 3: Active Subscriptions */}
          <Link
            href="/admin/subscriptions/plans"
            className="p-5 rounded-2xl border transition-all relative overflow-hidden group shadow-sm block hover:shadow-md"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: 'var(--athlon-text-muted)' }}
              >
                Active Subscriptions
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div
              className="text-3xl font-black tracking-tight"
              style={{ color: 'var(--athlon-text)' }}
            >
              {loading ? '...' : (stats?.activeSubscriptions ?? 0)}
            </div>
            <div className="flex items-center gap-2 mt-2 text-[11px]">
              <span style={{ color: 'var(--athlon-primary)' }} className="font-bold">
                {stats?.totalPackages ?? 0} Packages Available
              </span>
            </div>
          </Link>

          {/* Metric 4: Pending Approvals */}
          <Link
            href="/admin/subscriptions/requests"
            className="p-5 rounded-2xl border transition-all relative overflow-hidden group shadow-sm block hover:shadow-md"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: 'var(--athlon-text-muted)' }}
              >
                Pending Requests
              </span>
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                <FileCheck2 className="w-4 h-4" />
              </div>
            </div>
            <div
              className="text-3xl font-black tracking-tight"
              style={{ color: 'var(--athlon-text)' }}
            >
              {loading ? '...' : (stats?.pendingSubscriptionRequests ?? 0)}
            </div>
            <div className="flex items-center gap-2 mt-2 text-[11px]">
              <span className={stats?.pendingSubscriptionRequests ? 'text-amber-500 font-bold' : 'text-emerald-500 font-medium'}>
                {stats?.pendingSubscriptionRequests ? 'Requires verification' : 'Up to date'}
              </span>
            </div>
          </Link>
        </div>

        {/* Platform Modules & Tools (Workspace Horizontal Scroll Design - No Container) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" style={{ color: 'var(--athlon-primary)' }} />
              <h2
                className="text-xs font-black uppercase tracking-wider"
                style={{ color: 'var(--athlon-text)' }}
              >
                Platform Modules &amp; Tools
              </h2>
            </div>
            <span
              className="text-[10px] font-bold uppercase tracking-wider"
              style={{ color: 'var(--athlon-text-muted)' }}
            >
              {platformModules.length} Services
            </span>
          </div>

          <div className="flex items-start gap-4 overflow-x-auto pb-3 pt-1 hide-scrollbar snap-x snap-mandatory">
            {platformModules.map((mod) => (
              <Link
                key={mod.href}
                href={mod.href}
                className="flex flex-col items-center gap-2 shrink-0 snap-start w-[84px] group cursor-pointer"
              >
                <div
                  className="relative w-[70px] h-[70px] rounded-[20px] flex flex-col items-center justify-center transition-all shadow-md hover:scale-105 active:scale-95 border hover:border-primary/50"
                  style={{
                    backgroundColor: 'var(--athlon-surface)',
                    borderColor: 'var(--athlon-border)',
                  }}
                >
                  <Athlon3DIcon type={mod.icon3d} size={36} active={true} />
                  {mod.badge && (
                    <div className="absolute -top-1.5 -right-1 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-black text-[7.5px] font-black uppercase tracking-wider shadow-md border border-amber-300">
                      {mod.badge}
                    </div>
                  )}
                </div>
                <span
                  className="text-xs font-bold text-center transition-colors group-hover:text-primary w-full truncate leading-tight"
                  style={{ color: 'var(--athlon-text-secondary)' }}
                >
                  {mod.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Organization Breakdown Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div
            className="lg:col-span-2 p-6 rounded-2xl border space-y-5 shadow-sm"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2
                  className="text-base font-black uppercase tracking-wider"
                  style={{ color: 'var(--athlon-text)' }}
                >
                  Workspace Distribution
                </h2>
                <p
                  className="text-xs"
                  style={{ color: 'var(--athlon-text-muted)' }}
                >
                  Tenant organizations active across sport verticals
                </p>
              </div>
              <Link
                href="/admin/organizations"
                className="text-xs font-bold hover:underline flex items-center gap-1"
                style={{ color: 'var(--athlon-primary)' }}
              >
                Manage Orgs <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              {[
                { type: 'CLUB', label: 'Sports Clubs', color: 'text-emerald-500' },
                { type: 'ACADEMY', label: 'Academies', color: 'text-blue-500' },
                { type: 'COURT', label: 'Venues & Courts', color: 'text-rose-500' },
                { type: 'VENUE', label: 'Venue Managers', color: 'text-pink-500' },
                { type: 'ORGANIZER', label: 'Organizers', color: 'text-amber-500' },
                { type: 'COACH', label: 'Coaches', color: 'text-cyan-500' },
              ].map((item) => {
                const count = stats?.organizationsByType?.[item.type] || 0;
                return (
                  <div
                    key={item.type}
                    className="p-4 rounded-xl border shadow-xs"
                    style={{
                      backgroundColor: 'var(--athlon-surface)',
                      borderColor: 'var(--athlon-border)',
                    }}
                  >
                    <div className={`text-xl font-black ${item.color}`}>
                      {loading ? '-' : count}
                    </div>
                    <div
                      className="text-xs font-medium mt-1"
                      style={{ color: 'var(--athlon-text-muted)' }}
                    >
                      {item.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Operations Strip */}
          <div
            className="p-6 rounded-2xl border space-y-4 shadow-sm"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <h2
              className="text-base font-black uppercase tracking-wider"
              style={{ color: 'var(--athlon-text)' }}
            >
              Quick Actions
            </h2>
            <div className="space-y-2.5">
              <Link
                href="/admin/subscriptions/plans"
                className="flex items-center justify-between p-3.5 rounded-xl border transition-all group"
                style={{
                  backgroundColor: 'var(--athlon-surface)',
                  borderColor: 'var(--athlon-border)',
                }}
              >
                <div className="flex items-center gap-3">
                  <Package className="w-4 h-4" style={{ color: 'var(--athlon-primary)' }} />
                  <div>
                    <div className="text-xs font-bold" style={{ color: 'var(--athlon-text)' }}>Subscription Packages</div>
                    <div className="text-[10px]" style={{ color: 'var(--athlon-text-muted)' }}>Configure tiers and limits</div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 transition-colors group-hover:translate-x-0.5" style={{ color: 'var(--athlon-text-muted)' }} />
              </Link>

              <Link
                href="/admin/subscriptions/requests"
                className="flex items-center justify-between p-3.5 rounded-xl border transition-all group"
                style={{
                  backgroundColor: 'var(--athlon-surface)',
                  borderColor: 'var(--athlon-border)',
                }}
              >
                <div className="flex items-center gap-3">
                  <FileCheck2 className="w-4 h-4 text-amber-500" />
                  <div>
                    <div className="text-xs font-bold" style={{ color: 'var(--athlon-text)' }}>Pending Approvals</div>
                    <div className="text-[10px]" style={{ color: 'var(--athlon-text-muted)' }}>Review manual payment proofs</div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 transition-colors group-hover:translate-x-0.5" style={{ color: 'var(--athlon-text-muted)' }} />
              </Link>

              <Link
                href="/admin/users"
                className="flex items-center justify-between p-3.5 rounded-xl border transition-all group"
                style={{
                  backgroundColor: 'var(--athlon-surface)',
                  borderColor: 'var(--athlon-border)',
                }}
              >
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-blue-500" />
                  <div>
                    <div className="text-xs font-bold" style={{ color: 'var(--athlon-text)' }}>User Management</div>
                    <div className="text-[10px]" style={{ color: 'var(--athlon-text-muted)' }}>Inspect accounts &amp; suspension</div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 transition-colors group-hover:translate-x-0.5" style={{ color: 'var(--athlon-text-muted)' }} />
              </Link>

              <Link
                href="/admin/audit-logs"
                className="flex items-center justify-between p-3.5 rounded-xl border transition-all group"
                style={{
                  backgroundColor: 'var(--athlon-surface)',
                  borderColor: 'var(--athlon-border)',
                }}
              >
                <div className="flex items-center gap-3">
                  <Activity className="w-4 h-4 text-emerald-500" />
                  <div>
                    <div className="text-xs font-bold" style={{ color: 'var(--athlon-text)' }}>Platform Audit Log</div>
                    <div className="text-[10px]" style={{ color: 'var(--athlon-text-muted)' }}>Review security &amp; write operations</div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 transition-colors group-hover:translate-x-0.5" style={{ color: 'var(--athlon-text-muted)' }} />
              </Link>
              <Link
                href="/admin/modules"
                className="flex items-center justify-between p-3.5 rounded-xl border transition-all group"
                style={{
                  backgroundColor: 'var(--athlon-surface)',
                  borderColor: 'var(--athlon-border)',
                }}
              >
                <div className="flex items-center gap-3">
                  <SlidersHorizontal className="w-4 h-4 text-purple-400" />
                  <div>
                    <div className="text-xs font-bold" style={{ color: 'var(--athlon-text)' }}>App Module Configs</div>
                    <div className="text-[10px]" style={{ color: 'var(--athlon-text-muted)' }}>Dynamically toggle platform modes</div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 transition-colors group-hover:translate-x-0.5" style={{ color: 'var(--athlon-text-muted)' }} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
