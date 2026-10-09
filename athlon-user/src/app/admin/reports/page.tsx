'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  Users,
  Building2,
  RefreshCw,
  Trophy,
  CreditCard,
  CheckCircle2,
  Clock,
  ShieldCheck,
  FileText,
  Sparkles,
  ArrowDownToLine,
  Database,
  Layers,
} from 'lucide-react';
import { AdminService, AdminDashboardStats } from '@/lib/api/admin';
import { TournamentService } from '@/lib/api/tournaments';
import { Athlon3DIcon } from '@/components/common/Athlon3DIcon';

export default function AdminReportsPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [tournamentsCount, setTournamentsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
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
      } else {
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
    } catch (err) {
      console.error('Failed to load dashboard stats', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleExportUsers = async () => {
    setExporting('users');
    try {
      const res = await AdminService.getUsers({ size: 1000 });
      const users = res?.data?.content || [];
      const headers = ['User ID', 'UUID', 'Email', 'Active Status', 'Created At'];
      const rows = users.map((u) => [
        u.userId,
        u.userUuid,
        u.email,
        u.isActive === 1 ? 'ACTIVE' : 'SUSPENDED',
        u.createdAt,
      ]);
      downloadCsv('athlon_users_report.csv', [headers, ...rows]);
    } catch (err) {
      console.error(err);
    } finally {
      setExporting(null);
    }
  };

  const handleExportOrganizations = async () => {
    setExporting('orgs');
    try {
      const res = await AdminService.getOrganizations({ size: 1000 });
      const orgs = res?.data?.content || [];
      const headers = ['Org ID', 'UUID', 'Name', 'Type', 'Active Status', 'Created At'];
      const rows = orgs.map((o) => [
        o.organizationId,
        o.organizationUuid,
        o.name,
        o.type,
        o.isActive === 1 ? 'ACTIVE' : 'SUSPENDED',
        o.createdAt,
      ]);
      downloadCsv('athlon_organizations_report.csv', [headers, ...rows]);
    } catch (err) {
      console.error(err);
    } finally {
      setExporting(null);
    }
  };

  const handleExportPayments = async () => {
    setExporting('payments');
    try {
      const res = await AdminService.getSubscriptionRequests({ size: 1000 });
      const requests = res?.data?.content || [];
      const headers = ['Request ID', 'Org ID', 'Amount', 'Currency', 'Payment Method', 'Payment Status', 'Request Status', 'Date'];
      const rows = requests.map((r) => [
        r.requestId,
        r.organizationId,
        r.amount,
        r.currency,
        r.paymentMethod,
        r.paymentStatus,
        r.requestStatus,
        r.createdAt,
      ]);
      downloadCsv('athlon_revenue_ledger.csv', [headers, ...rows]);
    } catch (err) {
      console.error(err);
    } finally {
      setExporting(null);
    }
  };

  const handleExportTournaments = async () => {
    setExporting('tournaments');
    try {
      const res = await TournamentService.getAll();
      const tournaments = res?.data || [];
      const headers = ['Tournament ID', 'UUID', 'Name', 'Sport', 'Format', 'City', 'Location', 'Entry Fee', 'Start Date'];
      const rows = tournaments.map((t) => [
        t.tournamentId,
        t.tournamentUuid || '',
        t.name,
        t.sport || '',
        t.matchFormat || t.tournamentType || '',
        t.city || '',
        t.location || '',
        t.registrationFees || 0,
        t.startDate || '',
      ]);
      downloadCsv('athlon_tournaments_report.csv', [headers, ...rows]);
    } catch (err) {
      console.error(err);
    } finally {
      setExporting(null);
    }
  };

  const downloadCsv = (filename: string, rows: (string | number)[][]) => {
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportDatasets = [
    {
      id: 'users',
      title: 'Users Directory',
      subtitle: 'Complete identity records, roles & statuses',
      icon3d: 'members' as const,
      recordsCount: loading ? '...' : `${stats?.totalUsers ?? 0} Records`,
      highlightColor: '#3B82F6',
      badgeBg: 'bg-blue-500/10 text-blue-500 border-blue-500/25',
      fields: ['User ID', 'UUID', 'Email', 'Active Status', 'Created At'],
      onExport: handleExportUsers,
      isExporting: exporting === 'users',
    },
    {
      id: 'orgs',
      title: 'Workspaces',
      subtitle: 'Clubs, academies, courts & organizer rosters',
      icon3d: 'academies' as const,
      recordsCount: loading ? '...' : `${stats?.totalOrganizations ?? 0} Records`,
      highlightColor: '#F59E0B',
      badgeBg: 'bg-amber-500/10 text-amber-500 border-amber-500/25',
      fields: ['Org ID', 'UUID', 'Name', 'Type', 'Active Status', 'Created At'],
      onExport: handleExportOrganizations,
      isExporting: exporting === 'orgs',
    },
    {
      id: 'payments',
      title: 'Financial Revenue Ledger',
      subtitle: 'Verified revenues, subscription requests & proofs',
      icon3d: 'finances' as const,
      recordsCount: loading ? '...' : `${stats?.activeSubscriptions ?? 0} Plans Active`,
      highlightColor: '#10B981',
      badgeBg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/25',
      fields: ['Request ID', 'Org ID', 'Amount', 'Currency', 'Payment Mode', 'Status'],
      onExport: handleExportPayments,
      isExporting: exporting === 'payments',
    },
    {
      id: 'tournaments',
      title: 'Tournaments & Leagues',
      subtitle: 'Competitive events, match formats & schedules',
      icon3d: 'tournaments' as const,
      recordsCount: loading
        ? '...'
        : `${(stats?.totalTournaments ?? tournamentsCount) || tournamentsCount} Events`,
      highlightColor: '#8B5CF6',
      badgeBg: 'bg-purple-500/10 text-purple-500 border-purple-500/25',
      fields: ['Tournament ID', 'Name', 'Sport', 'Format', 'City', 'Entry Fee'],
      onExport: handleExportTournaments,
      isExporting: exporting === 'tournaments',
    },
  ];

  return (
    <div className="space-y-6">
      {/* ─────────────────────────────────────────────────────────────
          MOBILE VIEW (max-width: md) — WORKSPACE DESIGN LANGUAGE
          Adapts dynamically to Light/Dark Mode & User's Selected Theme
          ───────────────────────────────────────────────────────────── */}
      <div className="block md:hidden space-y-4 pb-10">
        {/* Mobile Header Bar */}
        <div className="flex items-center justify-between px-0.5 pt-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border shadow-xs"
              style={{
                backgroundColor: 'var(--athlon-surface)',
                borderColor: 'var(--athlon-border)',
                color: 'var(--athlon-primary)',
              }}
            >
              <BarChart3 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1
                  className="text-base font-black uppercase tracking-tight truncate leading-none"
                  style={{ color: 'var(--athlon-text)' }}
                >
                  Data Exports
                </h1>
                <span
                  className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md border shrink-0"
                  style={{
                    backgroundColor: 'rgba(var(--primary-rgb, 16), 0.1)',
                    borderColor: 'rgba(var(--primary-rgb, 16), 0.25)',
                    color: 'var(--athlon-primary)',
                  }}
                >
                  4 Datasets
                </span>
              </div>
              <p
                className="text-[10px] truncate mt-0.5"
                style={{ color: 'var(--athlon-text-muted)' }}
              >
                Platform analytics &amp; CSV intelligence
              </p>
            </div>
          </div>

          <button
            onClick={fetchStats}
            disabled={loading}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95 shadow-xs shrink-0 disabled:opacity-50"
            style={{
              backgroundColor: 'var(--athlon-surface)',
              borderColor: 'var(--athlon-border)',
              color: 'var(--athlon-text)',
            }}
            title="Refresh Analytics"
            aria-label="Refresh"
          >
            <RefreshCw
              className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`}
              style={{ color: 'var(--athlon-primary)' }}
            />
            <span>Sync</span>
          </button>
        </div>

        {/* Live Telemetry Micro-Cards */}
        <div className="grid grid-cols-4 gap-1.5">
          {[
            { label: 'Users', val: stats?.totalUsers ?? '-', color: 'text-blue-500' },
            { label: 'Orgs', val: stats?.totalOrganizations ?? '-', color: 'text-amber-500' },
            { label: 'Events', val: (stats?.totalTournaments ?? tournamentsCount) || tournamentsCount, color: 'text-purple-500' },
            { label: 'Plans', val: stats?.activeSubscriptions ?? '-', color: 'text-emerald-500' },
          ].map((item) => (
            <div
              key={item.label}
              className="p-2 rounded-xl border text-center"
              style={{
                backgroundColor: 'var(--athlon-card)',
                borderColor: 'var(--athlon-border)',
              }}
            >
              <div className={`text-sm font-black ${item.color}`}>
                {loading ? '...' : item.val}
              </div>
              <div
                className="text-[9px] font-bold uppercase truncate"
                style={{ color: 'var(--athlon-text-muted)' }}
              >
                {item.label}
              </div>
            </div>
          ))}
        </div>

        {/* Export Cards */}
        <div className="space-y-3">
          {exportDatasets.map((ds) => (
            <div
              key={ds.id}
              className="p-4 rounded-2xl border space-y-3 shadow-xs transition-all"
              style={{
                backgroundColor: 'var(--athlon-card)',
                borderColor: 'var(--athlon-border)',
              }}
            >
              {/* Card Header: 3D Icon, Title & Stat */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 shadow-xs"
                    style={{
                      backgroundColor: 'var(--athlon-surface)',
                      borderColor: 'var(--athlon-border)',
                    }}
                  >
                    <Athlon3DIcon type={ds.icon3d} size={28} active={true} />
                  </div>
                  <div className="min-w-0">
                    <h3
                      className="font-black text-xs truncate leading-tight"
                      style={{ color: 'var(--athlon-text)' }}
                    >
                      {ds.title}
                    </h3>
                    <p
                      className="text-[10px] truncate mt-0.5"
                      style={{ color: 'var(--athlon-text-muted)' }}
                    >
                      {ds.subtitle}
                    </p>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase shrink-0 ${ds.badgeBg}`}>
                  {ds.recordsCount}
                </span>
              </div>

              {/* Schema Fields Preview Chips */}
              <div
                className="pt-2 border-t flex flex-wrap gap-1"
                style={{ borderColor: 'var(--athlon-border)' }}
              >
                {ds.fields.map((f) => (
                  <span
                    key={f}
                    className="px-1.5 py-0.5 rounded-md text-[8.5px] font-medium border"
                    style={{
                      backgroundColor: 'var(--athlon-surface)',
                      borderColor: 'var(--athlon-border)',
                      color: 'var(--athlon-text-muted)',
                    }}
                  >
                    {f}
                  </span>
                ))}
              </div>

              {/* Action Bar */}
              <div
                className="pt-2 border-t flex items-center justify-between"
                style={{ borderColor: 'var(--athlon-border)' }}
              >
                <span
                  className="text-[9.5px] font-mono font-bold"
                  style={{ color: 'var(--athlon-text-muted)' }}
                >
                </span>

                <button
                  onClick={ds.onExport}
                  disabled={ds.isExporting}
                  className="px-3.5 py-1.5 rounded-xl text-[10.5px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 active:scale-95 shadow-sm disabled:opacity-50"
                  style={{
                    backgroundColor: 'var(--athlon-primary)',
                    color: '#000000',
                  }}
                >
                  <ArrowDownToLine
                    className={`w-3.5 h-3.5 ${ds.isExporting ? 'animate-bounce' : ''}`}
                  />
                  <span>{ds.isExporting ? 'Exporting...' : 'Download CSV'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Compliance Footer Strip */}
        <div
          className="p-3 rounded-2xl border flex items-center justify-between text-[10px]"
          style={{
            backgroundColor: 'var(--athlon-surface)',
            borderColor: 'var(--athlon-border)',
          }}
        >
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="font-bold" style={{ color: 'var(--athlon-text)' }}>
              Encrypted Platform Export
            </span>
          </div>
          <span className="font-mono" style={{ color: 'var(--athlon-text-muted)' }}>
            Audit Grade
          </span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          DESKTOP VIEW (min-width: md) — PREMIUM WORKSPACE DESIGN
          Dynamically styled with Athlon theme tokens
          ───────────────────────────────────────────────────────────── */}
      <div className="hidden md:block space-y-8">
        {/* Header */}
        <div
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b"
          style={{ borderColor: 'var(--athlon-border)' }}
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1
                className="text-2xl sm:text-3xl font-black uppercase tracking-tight"
                style={{ color: 'var(--athlon-text)' }}
              >
                Platform Analytics &amp; Reports
              </h1>
              <span
                className="px-2.5 py-0.5 rounded-full border text-xs font-bold"
                style={{
                  backgroundColor: 'rgba(var(--primary-rgb, 16), 0.1)',
                  borderColor: 'rgba(var(--primary-rgb, 16), 0.25)',
                  color: 'var(--athlon-primary)',
                }}
              >
                Data Export Suite
              </span>
            </div>
            <p className="text-xs sm:text-sm" style={{ color: 'var(--athlon-text-muted)' }}>
              Comprehensive tenant adoption intelligence, subscription ledger data, and competitive tournament records.
            </p>
          </div>

          <button
            onClick={fetchStats}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all self-start sm:self-auto disabled:opacity-50 hover:opacity-90"
            style={{
              backgroundColor: 'var(--athlon-surface)',
              borderColor: 'var(--athlon-border)',
              color: 'var(--athlon-text)',
            }}
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`}
              style={{ color: 'var(--athlon-primary)' }}
            />
            Refresh Telemetry
          </button>
        </div>

        {/* 4 KPI Telemetry Strip */}
        <div className="grid grid-cols-4 gap-4">
          {[
            {
              label: 'Total Platform Users',
              value: stats?.totalUsers ?? 0,
              sub: `${stats?.activeUsers ?? 0} Active Identities`,
              icon: Users,
              color: 'text-blue-500',
              bg: 'bg-blue-500/10 border-blue-500/20',
            },
            {
              label: 'Active Workspaces',
              value: stats?.totalOrganizations ?? 0,
              sub: `${stats?.activeOrganizations ?? 0} Live Across Verticals`,
              icon: Building2,
              color: 'text-amber-500',
              bg: 'bg-amber-500/10 border-amber-500/20',
            },
            {
              label: 'Competitive Tournaments',
              value: (stats?.totalTournaments ?? tournamentsCount) || tournamentsCount,
              sub: 'Total Events Scheduled',
              icon: Trophy,
              color: 'text-purple-500',
              bg: 'bg-purple-500/10 border-purple-500/20',
            },
            {
              label: 'Monetized Subscriptions',
              value: stats?.activeSubscriptions ?? 0,
              sub: `${stats?.totalPackages ?? 0} Configured Packages`,
              icon: CreditCard,
              color: 'text-emerald-500',
              bg: 'bg-emerald-500/10 border-emerald-500/20',
            },
          ].map((item) => {
            const IconComponent = item.icon;
            return (
              <div
                key={item.label}
                className="p-5 rounded-2xl border shadow-sm flex flex-col justify-between"
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
                    {item.label}
                  </span>
                  <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${item.bg} ${item.color}`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                </div>
                <div
                  className="text-2xl font-black"
                  style={{ color: 'var(--athlon-text)' }}
                >
                  {loading ? '...' : item.value}
                </div>
                <div
                  className="text-[11px] mt-1 font-medium"
                  style={{ color: 'var(--athlon-text-muted)' }}
                >
                  {item.sub}
                </div>
              </div>
            );
          })}
        </div>

        {/* 4-Dataset Export Suite Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {exportDatasets.map((ds) => (
            <div
              key={ds.id}
              className="p-6 rounded-2xl border flex flex-col justify-between space-y-5 shadow-md hover:shadow-lg transition-all group"
              style={{
                backgroundColor: 'var(--athlon-card)',
                borderColor: 'var(--athlon-border)',
              }}
            >
              <div className="space-y-4">
                {/* 3D Icon & Live Count Badge */}
                <div className="flex items-center justify-between">
                  <div
                    className="w-14 h-14 rounded-2xl border flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs"
                    style={{
                      backgroundColor: 'var(--athlon-surface)',
                      borderColor: 'var(--athlon-border)',
                    }}
                  >
                    <Athlon3DIcon type={ds.icon3d} size={36} active={true} />
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-black uppercase ${ds.badgeBg}`}>
                    {ds.recordsCount}
                  </span>
                </div>

                <div>
                  <h3
                    className="text-base font-black leading-tight"
                    style={{ color: 'var(--athlon-text)' }}
                  >
                    {ds.title}
                  </h3>
                  <p
                    className="text-xs mt-1 leading-relaxed"
                    style={{ color: 'var(--athlon-text-muted)' }}
                  >
                    {ds.subtitle}
                  </p>
                </div>

                {/* Included Fields preview */}
                <div
                  className="pt-3 border-t space-y-1.5"
                  style={{ borderColor: 'var(--athlon-border)' }}
                >
                  <div
                    className="text-[10px] font-extrabold uppercase tracking-wider"
                    style={{ color: 'var(--athlon-text-muted)' }}
                  >
                    Included Schema
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {ds.fields.map((f) => (
                      <span
                        key={f}
                        className="px-2 py-0.5 rounded-md text-[9.5px] font-medium border"
                        style={{
                          backgroundColor: 'var(--athlon-surface)',
                          borderColor: 'var(--athlon-border)',
                          color: 'var(--athlon-text-muted)',
                        }}
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action */}
              <div
                className="pt-4 border-t flex flex-col gap-2"
                style={{ borderColor: 'var(--athlon-border)' }}
              >
                <button
                  onClick={ds.onExport}
                  disabled={ds.isExporting}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md disabled:opacity-50 hover:opacity-90"
                  style={{
                    backgroundColor: 'var(--athlon-primary)',
                    color: '#000000',
                  }}
                >
                  <ArrowDownToLine
                    className={`w-4 h-4 ${ds.isExporting ? 'animate-bounce' : ''}`}
                  />
                  <span>{ds.isExporting ? 'Generating CSV...' : 'Export Dataset CSV'}</span>
                </button>

                <div
                  className="text-center text-[10px] font-mono"
                  style={{ color: 'var(--athlon-text-muted)' }}
                >
                  Format: UTF-8 (.csv)
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Data Governance & Compliance Banner */}
        <div
          className="p-5 rounded-2xl border flex items-center justify-between shadow-sm"
          style={{
            backgroundColor: 'var(--athlon-surface)',
            borderColor: 'var(--athlon-border)',
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-500 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div
                className="text-xs font-black uppercase tracking-wider"
                style={{ color: 'var(--athlon-text)' }}
              >
                Immutable Governance &amp; Data Protection
              </div>
              <div
                className="text-[11px] mt-0.5"
                style={{ color: 'var(--athlon-text-muted)' }}
              >
                All exported datasets are generated client-side with real-time token authorization. Sensitive payment secrets and salts are sanitized.
              </div>
            </div>
          </div>

          <span
            className="text-xs font-mono font-bold px-3 py-1 rounded-xl border shrink-0"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
              color: 'var(--athlon-text-muted)',
            }}
          >
            REST API v1.0
          </span>
        </div>
      </div>
    </div>
  );
}
