'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  Search,
  CheckCircle2,
  XCircle,
  Package,
  Calendar,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  UserCheck,
  X,
  Mail,
  Clock,
  Sparkles,
} from 'lucide-react';
import { AdminService, AdminOrganizationItem, PageResponse } from '@/lib/api/admin';

const ORG_TYPES = [
  { key: 'ALL', label: 'All Modules' },
  { key: 'CLUB', label: 'Clubs' },
  { key: 'ACADEMY', label: 'Academies' },
  { key: 'COURT', label: 'Venues' },
  { key: 'ORGANIZER', label: 'Organizers' },
  { key: 'COACH', label: 'Coaches' },
];

export default function AdminOrganizationsPage() {
  const [orgsPage, setOrgsPage] = useState<PageResponse<AdminOrganizationItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED'>('ALL');
  const [page, setPage] = useState(0);

  // Status Action Modal
  const [selectedOrg, setSelectedOrg] = useState<AdminOrganizationItem | null>(null);
  const [statusAction, setStatusAction] = useState<'SUSPEND' | 'ACTIVATE' | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const statusParam = statusFilter === 'ACTIVE' ? 1 : statusFilter === 'SUSPENDED' ? 0 : undefined;
      const typeParam = typeFilter === 'ALL' ? undefined : typeFilter;
      const res = await AdminService.getOrganizations({
        search: search.trim() || undefined,
        type: typeParam,
        status: statusParam,
        page,
        size: 10,
      });
      if (res?.data) {
        setOrgsPage(res.data);
      }
    } catch (err) {
      console.error('Failed to load organizations', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, [page, typeFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchOrganizations();
  };

  const handleConfirmStatusChange = async () => {
    if (!selectedOrg || !statusAction) return;
    setSubmittingAction(true);
    setActionError(null);
    try {
      const targetStatus = statusAction === 'ACTIVATE' ? 'ACTIVE' : 'SUSPENDED';
      await AdminService.updateOrganizationStatus(selectedOrg.organizationUuid, targetStatus, actionReason);
      setSelectedOrg(null);
      setStatusAction(null);
      setActionReason('');
      fetchOrganizations();
    } catch (err: any) {
      console.error('Status update failed', err);
      setActionError(err?.message || 'Failed to update organization status.');
    } finally {
      setSubmittingAction(false);
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'ACADEMY':
        return <span className="px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-500 border border-blue-500/25 text-[10px] font-black uppercase">Academy</span>;
      case 'CLUB':
        return <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/25 text-[10px] font-black uppercase">Club</span>;
      case 'COURT':
      case 'VENUE':
        return <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-500 border border-rose-500/25 text-[10px] font-black uppercase">Venue</span>;
      case 'ORGANIZER':
        return <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/25 text-[10px] font-black uppercase">Organizer</span>;
      case 'COACH':
        return <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-500 border border-cyan-500/25 text-[10px] font-black uppercase">Coach</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full bg-gray-500/15 text-gray-500 border border-gray-500/25 text-[10px] font-black uppercase">{type}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* ─────────────────────────────────────────────────────────────
          MOBILE VIEW (max-width: md) — WORKSPACE DESIGN LANGUAGE
          Adapts dynamically to Light/Dark Mode & User's Selected Theme
          ───────────────────────────────────────────────────────────── */}
      <div className="block md:hidden space-y-4 pb-10">
        {/* 1. Mobile Compact Header */}
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
              <Building2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1
                  className="text-base font-black uppercase tracking-tight truncate leading-none"
                  style={{ color: 'var(--athlon-text)' }}
                >
                  Workspaces
                </h1>
                <span
                  className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md border shrink-0"
                  style={{
                    backgroundColor: 'rgba(var(--primary-rgb, 16), 0.1)',
                    borderColor: 'rgba(var(--primary-rgb, 16), 0.25)',
                    color: 'var(--athlon-primary)',
                  }}
                >
                  {orgsPage?.totalElements ?? 0}
                </span>
              </div>
              <p
                className="text-[10px] truncate mt-0.5"
                style={{ color: 'var(--athlon-text-muted)' }}
              >
                Tenant organizations &amp; facilities
              </p>
            </div>
          </div>

          <button
            onClick={fetchOrganizations}
            disabled={loading}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95 shadow-xs shrink-0 disabled:opacity-50"
            style={{
              backgroundColor: 'var(--athlon-surface)',
              borderColor: 'var(--athlon-border)',
              color: 'var(--athlon-text)',
            }}
            title="Refresh Workspaces"
            aria-label="Refresh"
          >
            <RefreshCw
              className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`}
              style={{ color: 'var(--athlon-primary)' }}
            />
            <span>Sync</span>
          </button>
        </div>

        {/* 2. Mobile Search Input, Status Tabs & Module Pills */}
        <div
          className="p-3 rounded-2xl border space-y-2.5 shadow-xs"
          style={{
            backgroundColor: 'var(--athlon-card)',
            borderColor: 'var(--athlon-border)',
          }}
        >
          {/* Search Field */}
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search
              className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--athlon-text-muted)' }}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by organization..."
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
                onClick={() => {
                  setSearch('');
                  setPage(0);
                  setTimeout(fetchOrganizations, 0);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-md hover:opacity-75"
                style={{ color: 'var(--athlon-text-muted)' }}
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </form>

          {/* Status Segmented Tabs */}
          <div
            className="flex items-center p-1 rounded-xl border gap-1"
            style={{
              backgroundColor: 'var(--athlon-surface)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            {(['ALL', 'ACTIVE', 'SUSPENDED'] as const).map((tab) => {
              const isActive = statusFilter === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setStatusFilter(tab);
                    setPage(0);
                  }}
                  className="flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all text-center"
                  style={
                    isActive
                      ? {
                          backgroundColor: 'var(--athlon-primary)',
                          color: '#000000',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                        }
                      : {
                          color: 'var(--athlon-text-muted)',
                        }
                  }
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* Horizontal Module Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 pt-1 scrollbar-none">
            {ORG_TYPES.map((t) => {
              const isActive = typeFilter === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => {
                    setTypeFilter(t.key);
                    setPage(0);
                  }}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap border transition-all shrink-0"
                  style={
                    isActive
                      ? {
                          backgroundColor: 'var(--athlon-surface)',
                          borderColor: 'var(--athlon-primary)',
                          color: 'var(--athlon-primary)',
                        }
                      : {
                          backgroundColor: 'transparent',
                          borderColor: 'var(--athlon-border)',
                          color: 'var(--athlon-text-muted)',
                        }
                  }
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Mobile Organization Cards List */}
        <div className="space-y-2.5">
          {loading ? (
            <div
              className="p-8 rounded-2xl border text-center space-y-2"
              style={{
                backgroundColor: 'var(--athlon-card)',
                borderColor: 'var(--athlon-border)',
              }}
            >
              <RefreshCw
                className="w-5 h-5 mx-auto animate-spin"
                style={{ color: 'var(--athlon-primary)' }}
              />
              <p
                className="text-xs font-semibold"
                style={{ color: 'var(--athlon-text-muted)' }}
              >
                Loading workspaces...
              </p>
            </div>
          ) : !orgsPage?.content || orgsPage.content.length === 0 ? (
            <div
              className="p-8 rounded-2xl border text-center space-y-2"
              style={{
                backgroundColor: 'var(--athlon-card)',
                borderColor: 'var(--athlon-border)',
              }}
            >
              <Building2
                className="w-6 h-6 mx-auto opacity-40"
                style={{ color: 'var(--athlon-text-muted)' }}
              />
              <p
                className="text-xs font-semibold"
                style={{ color: 'var(--athlon-text-muted)' }}
              >
                No organizations found matching query.
              </p>
            </div>
          ) : (
            orgsPage.content.map((org) => {
              const isSuspended = org.isActive === 0;

              return (
                <div
                  key={org.organizationUuid}
                  className="p-3.5 rounded-2xl border space-y-3 shadow-xs transition-all"
                  style={{
                    backgroundColor: 'var(--athlon-card)',
                    borderColor: 'var(--athlon-border)',
                  }}
                >
                  {/* Card Header: Avatar, Name & Status */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-9 h-9 rounded-xl border flex items-center justify-center font-bold text-xs uppercase shrink-0"
                        style={{
                          backgroundColor: 'var(--athlon-surface)',
                          borderColor: 'var(--athlon-border)',
                          color: 'var(--athlon-text)',
                        }}
                      >
                        {org.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div
                          className="font-bold text-xs truncate leading-tight"
                          style={{ color: 'var(--athlon-text)' }}
                        >
                          {org.name}
                        </div>
                        <div
                          className="text-[9.5px] font-mono truncate mt-0.5"
                          style={{ color: 'var(--athlon-text-muted)' }}
                        >
                          {org.organizationUuid}
                        </div>
                      </div>
                    </div>

                    {/* Status Pill */}
                    {isSuspended ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/15 text-red-500 border border-red-500/25 text-[9.5px] font-bold uppercase shrink-0">
                        <XCircle className="w-2.5 h-2.5" /> Suspended
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/25 text-[9.5px] font-bold uppercase shrink-0">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Active
                      </span>
                    )}
                  </div>

                  {/* Card Meta Row: Module Type, Owner & Plan */}
                  <div
                    className="pt-2 border-t flex flex-wrap items-center justify-between gap-2 text-[10px]"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      {getTypeBadge(org.type)}
                      {org.ownerEmail && (
                        <span
                          className="inline-flex items-center gap-1 text-[10px] truncate max-w-[140px]"
                          style={{ color: 'var(--athlon-text-muted)' }}
                        >
                          <Mail className="w-3 h-3 shrink-0" />
                          <span className="truncate">{org.ownerEmail}</span>
                        </span>
                      )}
                    </div>

                    {/* Plan indicator */}
                    {org.activePackageName ? (
                      <div
                        className="inline-flex items-center gap-1 font-bold text-[10px]"
                        style={{ color: 'var(--athlon-primary)' }}
                      >
                        <Package className="w-3 h-3" />
                        <span>{org.activePackageName}</span>
                      </div>
                    ) : (
                      <span
                        className="text-[9.5px] italic"
                        style={{ color: 'var(--athlon-text-muted)' }}
                      >
                        Free / No Plan
                      </span>
                    )}
                  </div>

                  {/* Card Action Row */}
                  <div
                    className="pt-2 border-t flex items-center justify-end"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    {isSuspended ? (
                      <button
                        onClick={() => {
                          setSelectedOrg(org);
                          setStatusAction('ACTIVATE');
                        }}
                        className="w-full py-1.5 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        Reactivate Workspace
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedOrg(org);
                          setStatusAction('SUSPEND');
                        }}
                        className="w-full py-1.5 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
                      >
                        <ShieldAlert className="w-3 h-3" />
                        Suspend Workspace
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 4. Mobile Pagination */}
        {orgsPage && orgsPage.totalPages > 1 && (
          <div
            className="flex items-center justify-between p-3 rounded-2xl border text-xs"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
              color: 'var(--athlon-text-muted)',
            }}
          >
            <div>
              Page{' '}
              <span className="font-bold" style={{ color: 'var(--athlon-text)' }}>
                {orgsPage.number + 1}
              </span>{' '}
              of{' '}
              <span className="font-bold" style={{ color: 'var(--athlon-text)' }}>
                {orgsPage.totalPages}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={orgsPage.number === 0}
                className="p-1.5 rounded-lg border transition-all disabled:opacity-30 disabled:pointer-events-none"
                style={{
                  backgroundColor: 'var(--athlon-surface)',
                  borderColor: 'var(--athlon-border)',
                  color: 'var(--athlon-text)',
                }}
                aria-label="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(orgsPage.totalPages - 1, p + 1))}
                disabled={orgsPage.number >= orgsPage.totalPages - 1}
                className="p-1.5 rounded-lg border transition-all disabled:opacity-30 disabled:pointer-events-none"
                style={{
                  backgroundColor: 'var(--athlon-surface)',
                  borderColor: 'var(--athlon-border)',
                  color: 'var(--athlon-text)',
                }}
                aria-label="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          DESKTOP VIEW (min-width: md) — UNCHANGED DESKTOP DESIGN
          Dynamically styled with Athlon theme tokens
          ───────────────────────────────────────────────────────────── */}
      <div className="hidden md:block space-y-6">
        {/* Header */}
        <div
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b"
          style={{ borderColor: 'var(--athlon-border)' }}
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1
                className="text-2xl font-black uppercase tracking-tight"
                style={{ color: 'var(--athlon-text)' }}
              >
                Organization Management
              </h1>
              <span
                className="px-2 py-0.5 rounded-full border text-xs font-bold"
                style={{
                  backgroundColor: 'rgba(var(--primary-rgb, 16), 0.1)',
                  borderColor: 'rgba(var(--primary-rgb, 16), 0.25)',
                  color: 'var(--athlon-primary)',
                }}
              >
                {orgsPage?.totalElements ?? 0} Workspaces
              </span>
            </div>
            <p className="text-xs sm:text-sm" style={{ color: 'var(--athlon-text-muted)' }}>
              Tenant workspaces across clubs, academies, venues, organizers, and coaches.
            </p>
          </div>

          <button
            onClick={fetchOrganizations}
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
            Refresh
          </button>
        </div>

        {/* Filters Bar */}
        <div
          className="space-y-3 p-4 rounded-2xl border"
          style={{
            backgroundColor: 'var(--athlon-card)',
            borderColor: 'var(--athlon-border)',
          }}
        >
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
              <Search
                className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--athlon-text-muted)' }}
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by organization name..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border text-xs focus:outline-none transition-colors"
                style={{
                  backgroundColor: 'var(--athlon-surface)',
                  borderColor: 'var(--athlon-border)',
                  color: 'var(--athlon-text)',
                }}
              />
            </form>

            {/* Status Tabs */}
            <div
              className="flex items-center gap-1.5 p-1 rounded-xl border self-start md:self-auto"
              style={{
                backgroundColor: 'var(--athlon-surface)',
                borderColor: 'var(--athlon-border)',
              }}
            >
              {(['ALL', 'ACTIVE', 'SUSPENDED'] as const).map((tab) => {
                const isActive = statusFilter === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => {
                      setStatusFilter(tab);
                      setPage(0);
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
                    style={
                      isActive
                        ? {
                            backgroundColor: 'var(--athlon-primary)',
                            color: '#000000',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                          }
                        : {
                            color: 'var(--athlon-text-muted)',
                          }
                    }
                  >
                    {tab}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Type Pill Selector */}
          <div
            className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 border-t"
            style={{ borderColor: 'var(--athlon-border)' }}
          >
            {ORG_TYPES.map((t) => {
              const isActive = typeFilter === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => {
                    setTypeFilter(t.key);
                    setPage(0);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap border transition-all"
                  style={
                    isActive
                      ? {
                          backgroundColor: 'var(--athlon-surface)',
                          borderColor: 'var(--athlon-primary)',
                          color: 'var(--athlon-primary)',
                        }
                      : {
                          backgroundColor: 'transparent',
                          borderColor: 'transparent',
                          color: 'var(--athlon-text-muted)',
                        }
                  }
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Organizations Table */}
        <div
          className="rounded-2xl border overflow-hidden shadow-xl"
          style={{
            backgroundColor: 'var(--athlon-card)',
            borderColor: 'var(--athlon-border)',
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr
                  className="border-b uppercase font-black tracking-wider text-[11px]"
                  style={{
                    backgroundColor: 'var(--athlon-surface)',
                    borderColor: 'var(--athlon-border)',
                    color: 'var(--athlon-text-muted)',
                  }}
                >
                  <th className="py-3.5 px-4">Organization</th>
                  <th className="py-3.5 px-4">Module Type</th>
                  <th className="py-3.5 px-4">Owner</th>
                  <th className="py-3.5 px-4">Subscription Plan</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Created Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody
                className="divide-y"
                style={{ borderColor: 'var(--athlon-border)' }}
              >
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-12 text-center"
                      style={{ color: 'var(--athlon-text-muted)' }}
                    >
                      <RefreshCw
                        className="w-5 h-5 mx-auto mb-2 animate-spin"
                        style={{ color: 'var(--athlon-primary)' }}
                      />
                      Loading organizations...
                    </td>
                  </tr>
                ) : !orgsPage?.content || orgsPage.content.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-12 text-center"
                      style={{ color: 'var(--athlon-text-muted)' }}
                    >
                      No organizations found matching query.
                    </td>
                  </tr>
                ) : (
                  orgsPage.content.map((org) => {
                    const isSuspended = org.isActive === 0;

                    return (
                      <tr
                        key={org.organizationUuid}
                        className="hover:bg-black/5 dark:hover:bg-white/[0.02] transition-colors"
                      >
                        {/* Name & UUID */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-xl border flex items-center justify-center font-bold uppercase"
                              style={{
                                backgroundColor: 'var(--athlon-surface)',
                                borderColor: 'var(--athlon-border)',
                                color: 'var(--athlon-text)',
                              }}
                            >
                              {org.name.charAt(0)}
                            </div>
                            <div>
                              <div
                                className="font-bold leading-tight"
                                style={{ color: 'var(--athlon-text)' }}
                              >
                                {org.name}
                              </div>
                              <div
                                className="text-[10px] font-mono mt-0.5 truncate max-w-[180px]"
                                style={{ color: 'var(--athlon-text-muted)' }}
                              >
                                {org.organizationUuid}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Type Badge */}
                        <td className="py-3.5 px-4">{getTypeBadge(org.type)}</td>

                        {/* Owner Email */}
                        <td
                          className="py-3.5 px-4 font-medium"
                          style={{ color: 'var(--athlon-text)' }}
                        >
                          {org.ownerEmail || 'Unknown Owner'}
                        </td>

                        {/* Plan */}
                        <td className="py-3.5 px-4">
                          {org.activePackageName ? (
                            <div>
                              <div
                                className="inline-flex items-center gap-1 font-bold text-[11px]"
                                style={{ color: 'var(--athlon-primary)' }}
                              >
                                <Package className="w-3 h-3" /> {org.activePackageName}
                              </div>
                              {org.subscriptionExpiry && (
                                <div
                                  className="text-[10px] mt-0.5"
                                  style={{ color: 'var(--athlon-text-muted)' }}
                                >
                                  Exp: {new Date(org.subscriptionExpiry).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span
                              className="text-[10px] italic"
                              style={{ color: 'var(--athlon-text-muted)' }}
                            >
                              No Active Plan
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          {isSuspended ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/15 text-red-500 border border-red-500/25 text-[10px] font-bold uppercase">
                              <XCircle className="w-3 h-3" /> Suspended
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/25 text-[10px] font-bold uppercase">
                              <CheckCircle2 className="w-3 h-3" /> Active
                            </span>
                          )}
                        </td>

                        {/* Created */}
                        <td
                          className="py-3.5 px-4 text-[11px]"
                          style={{ color: 'var(--athlon-text-muted)' }}
                        >
                          {org.createdAt ? new Date(org.createdAt).toLocaleDateString() : 'N/A'}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isSuspended ? (
                              <button
                                onClick={() => {
                                  setSelectedOrg(org);
                                  setStatusAction('ACTIVATE');
                                }}
                                className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 text-[11px] font-bold transition-all"
                              >
                                Activate
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setSelectedOrg(org);
                                  setStatusAction('SUSPEND');
                                }}
                                className="px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 text-[11px] font-bold transition-all"
                              >
                                Suspend
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {orgsPage && orgsPage.totalPages > 1 && (
            <div
              className="flex items-center justify-between p-4 border-t text-xs"
              style={{
                borderColor: 'var(--athlon-border)',
                color: 'var(--athlon-text-muted)',
              }}
            >
              <div>
                Page{' '}
                <span className="font-bold" style={{ color: 'var(--athlon-text)' }}>
                  {orgsPage.number + 1}
                </span>{' '}
                of{' '}
                <span className="font-bold" style={{ color: 'var(--athlon-text)' }}>
                  {orgsPage.totalPages}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={orgsPage.number === 0}
                  className="p-1.5 rounded-lg border transition-all disabled:opacity-30 disabled:pointer-events-none hover:opacity-80"
                  style={{
                    backgroundColor: 'var(--athlon-surface)',
                    borderColor: 'var(--athlon-border)',
                    color: 'var(--athlon-text)',
                  }}
                  aria-label="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(orgsPage.totalPages - 1, p + 1))}
                  disabled={orgsPage.number >= orgsPage.totalPages - 1}
                  className="p-1.5 rounded-lg border transition-all disabled:opacity-30 disabled:pointer-events-none hover:opacity-80"
                  style={{
                    backgroundColor: 'var(--athlon-surface)',
                    borderColor: 'var(--athlon-border)',
                    color: 'var(--athlon-text)',
                  }}
                  aria-label="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          CONFIRMATION MODAL (Shared Mobile & Desktop)
          ───────────────────────────────────────────────────────────── */}
      {selectedOrg && statusAction && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className="max-w-md w-full border rounded-2xl p-6 shadow-2xl space-y-4"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  statusAction === 'SUSPEND'
                    ? 'bg-red-500/15 text-red-500 border border-red-500/30'
                    : 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                }`}
              >
                <Building2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3
                  className="text-sm font-black uppercase"
                  style={{ color: 'var(--athlon-text)' }}
                >
                  {statusAction === 'SUSPEND' ? 'Suspend Organization' : 'Reactivate Organization'}
                </h3>
                <p
                  className="text-xs truncate"
                  style={{ color: 'var(--athlon-text-muted)' }}
                >
                  {selectedOrg.name}
                </p>
              </div>
            </div>

            <p
              className="text-xs leading-relaxed"
              style={{ color: 'var(--athlon-text-muted)' }}
            >
              {statusAction === 'SUSPEND'
                ? 'Suspending this organization will pause its public listing, court bookings, and tournament activities. No data will be deleted.'
                : 'Reactivating this organization will restore its normal operations and module capabilities.'}
            </p>

            <div>
              <label
                className="text-[11px] font-bold uppercase tracking-wider block mb-1"
                style={{ color: 'var(--athlon-text-muted)' }}
              >
                Reason for Audit Log
              </label>
              <textarea
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="E.g., Incomplete documentation, compliance check completed..."
                className="w-full p-2.5 rounded-xl border text-xs focus:outline-none resize-none h-20 transition-colors"
                style={{
                  backgroundColor: 'var(--athlon-surface)',
                  borderColor: 'var(--athlon-border)',
                  color: 'var(--athlon-text)',
                }}
              />
            </div>

            {actionError && (
              <div className="text-xs text-red-500 bg-red-500/10 p-2.5 rounded-lg border border-red-500/20">
                {actionError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => {
                  setSelectedOrg(null);
                  setStatusAction(null);
                  setActionReason('');
                }}
                disabled={submittingAction}
                className="px-4 py-2 rounded-xl text-xs font-bold border transition-colors hover:opacity-80"
                style={{
                  backgroundColor: 'var(--athlon-surface)',
                  borderColor: 'var(--athlon-border)',
                  color: 'var(--athlon-text-muted)',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmStatusChange}
                disabled={submittingAction}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md ${
                  statusAction === 'SUSPEND'
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-emerald-500 text-black hover:bg-emerald-400'
                }`}
              >
                {submittingAction
                  ? 'Processing...'
                  : statusAction === 'SUSPEND'
                  ? 'Confirm Suspension'
                  : 'Confirm Activation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
