'use client';

import React, { useState, useEffect } from 'react';
import {
  History,
  Shield,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Activity,
  Calendar,
  User,
} from 'lucide-react';
import { AdminService, PlatformAdminAuditLogItem, PageResponse } from '@/lib/api/admin';

export default function AdminAuditLogsPage() {
  const [logsPage, setLogsPage] = useState<PageResponse<PlatformAdminAuditLogItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await AdminService.getAuditLogs({ page, size: 20 });
      if (res?.data) {
        setLogsPage(res.data);
      }
    } catch (err) {
      console.error('Failed to load audit logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const getActionBadge = (action: string) => {
    if (action.includes('APPROVED') || action.includes('ACTIVAT')) {
      return (
        <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/25 text-[9.5px] font-black uppercase">
          {action}
        </span>
      );
    }
    if (action.includes('SUSPEND') || action.includes('REJECT')) {
      return (
        <span className="px-2 py-0.5 rounded-full bg-red-500/15 text-red-500 border border-red-500/25 text-[9.5px] font-black uppercase">
          {action}
        </span>
      );
    }
    return (
      <span
        className="px-2 py-0.5 rounded-full border text-[9.5px] font-black uppercase"
        style={{
          backgroundColor: 'rgba(var(--primary-rgb, 16), 0.12)',
          borderColor: 'rgba(var(--primary-rgb, 16), 0.25)',
          color: 'var(--athlon-primary)',
        }}
      >
        {action}
      </span>
    );
  };

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
              <History className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1
                  className="text-base font-black uppercase tracking-tight truncate leading-none"
                  style={{ color: 'var(--athlon-text)' }}
                >
                  Audit Trail
                </h1>
                <span
                  className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md border shrink-0"
                  style={{
                    backgroundColor: 'rgba(var(--primary-rgb, 16), 0.1)',
                    borderColor: 'rgba(var(--primary-rgb, 16), 0.25)',
                    color: 'var(--athlon-primary)',
                  }}
                >
                  {logsPage?.totalElements ?? 0}
                </span>
              </div>
              <p
                className="text-[10px] truncate mt-0.5"
                style={{ color: 'var(--athlon-text-muted)' }}
              >
                Immutable platform governance logs
              </p>
            </div>
          </div>

          <button
            onClick={fetchLogs}
            disabled={loading}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95 shadow-xs shrink-0 disabled:opacity-50"
            style={{
              backgroundColor: 'var(--athlon-surface)',
              borderColor: 'var(--athlon-border)',
              color: 'var(--athlon-text)',
            }}
            title="Refresh Logs"
            aria-label="Refresh"
          >
            <RefreshCw
              className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`}
              style={{ color: 'var(--athlon-primary)' }}
            />
            <span>Sync</span>
          </button>
        </div>

        {/* Mobile Audit Cards List */}
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
              <p className="text-xs font-semibold" style={{ color: 'var(--athlon-text-muted)' }}>
                Loading audit trail...
              </p>
            </div>
          ) : !logsPage?.content || logsPage.content.length === 0 ? (
            <div
              className="p-8 rounded-2xl border text-center space-y-2"
              style={{
                backgroundColor: 'var(--athlon-card)',
                borderColor: 'var(--athlon-border)',
              }}
            >
              <History className="w-6 h-6 mx-auto opacity-40" style={{ color: 'var(--athlon-text-muted)' }} />
              <p className="text-xs font-semibold" style={{ color: 'var(--athlon-text-muted)' }}>
                No administrative audit actions recorded yet.
              </p>
            </div>
          ) : (
            logsPage.content.map((log) => (
              <div
                key={log.auditUuid || log.auditId}
                className="p-3.5 rounded-2xl border space-y-2.5 shadow-xs"
                style={{
                  backgroundColor: 'var(--athlon-card)',
                  borderColor: 'var(--athlon-border)',
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  {getActionBadge(log.action)}
                  <span
                    className="text-[9.5px] font-mono"
                    style={{ color: 'var(--athlon-text-muted)' }}
                  >
                    {log.createdAt ? new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold" style={{ color: 'var(--athlon-text)' }}>
                      {log.entityType}
                    </span>
                    <span className="font-mono text-[10px]" style={{ color: 'var(--athlon-text-muted)' }}>
                      {log.entityId}
                    </span>
                  </div>

                  <p className="text-[11px] leading-relaxed" style={{ color: 'var(--athlon-text-muted)' }}>
                    {log.reason || 'Standard administrative operation'}
                  </p>
                </div>

                <div
                  className="pt-2 border-t flex items-center justify-between text-[9.5px]"
                  style={{
                    borderColor: 'var(--athlon-border)',
                    color: 'var(--athlon-text-muted)',
                  }}
                >
                  <span className="truncate max-w-[170px]">
                    By: {log.adminEmail || 'admin@athlon.co.in'}
                  </span>
                  <span className="font-mono">{log.requestIp || '127.0.0.1'}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Mobile Pagination */}
        {logsPage && logsPage.totalPages > 1 && (
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
                {logsPage.number + 1}
              </span>{' '}
              of{' '}
              <span className="font-bold" style={{ color: 'var(--athlon-text)' }}>
                {logsPage.totalPages}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={logsPage.number === 0}
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
                onClick={() => setPage((p) => Math.min(logsPage.totalPages - 1, p + 1))}
                disabled={logsPage.number >= logsPage.totalPages - 1}
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
                Platform Audit Trail
              </h1>
              <span
                className="px-2 py-0.5 rounded-full border text-xs font-bold"
                style={{
                  backgroundColor: 'rgba(var(--primary-rgb, 16), 0.1)',
                  borderColor: 'rgba(var(--primary-rgb, 16), 0.25)',
                  color: 'var(--athlon-primary)',
                }}
              >
                {logsPage?.totalElements ?? 0} Recorded Actions
              </span>
            </div>
            <p className="text-xs sm:text-sm" style={{ color: 'var(--athlon-text-muted)' }}>
              Immutable log of all administrative actions, user account suspensions, plan updates, and entitlement grants.
            </p>
          </div>

          <button
            onClick={fetchLogs}
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
            Refresh Logs
          </button>
        </div>

        {/* Table */}
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
                  <th className="py-3.5 px-4">Action</th>
                  <th className="py-3.5 px-4">Entity Target</th>
                  <th className="py-3.5 px-4">Admin Operator</th>
                  <th className="py-3.5 px-4">Reason / Notes</th>
                  <th className="py-3.5 px-4">IP Address</th>
                  <th className="py-3.5 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody
                className="divide-y"
                style={{ borderColor: 'var(--athlon-border)' }}
              >
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-12 text-center"
                      style={{ color: 'var(--athlon-text-muted)' }}
                    >
                      <RefreshCw
                        className="w-5 h-5 mx-auto mb-2 animate-spin"
                        style={{ color: 'var(--athlon-primary)' }}
                      />
                      Loading audit trail...
                    </td>
                  </tr>
                ) : !logsPage?.content || logsPage.content.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-12 text-center"
                      style={{ color: 'var(--athlon-text-muted)' }}
                    >
                      No administrative audit actions recorded yet.
                    </td>
                  </tr>
                ) : (
                  logsPage.content.map((log) => (
                    <tr
                      key={log.auditUuid || log.auditId}
                      className="hover:bg-black/5 dark:hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-3.5 px-4">{getActionBadge(log.action)}</td>

                      <td className="py-3.5 px-4">
                        <div
                          className="font-bold"
                          style={{ color: 'var(--athlon-text)' }}
                        >
                          {log.entityType}
                        </div>
                        <div
                          className="text-[10px] font-mono mt-0.5 truncate max-w-[130px]"
                          style={{ color: 'var(--athlon-text-muted)' }}
                        >
                          {log.entityId}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div
                          className="font-medium"
                          style={{ color: 'var(--athlon-text)' }}
                        >
                          {log.adminEmail || 'admin@athlon.co.in'}
                        </div>
                        <div
                          className="text-[10px]"
                          style={{ color: 'var(--athlon-text-muted)' }}
                        >
                          ID #{log.adminUserId}
                        </div>
                      </td>

                      <td
                        className="py-3.5 px-4 max-w-xs truncate"
                        style={{ color: 'var(--athlon-text)' }}
                      >
                        {log.reason || 'Standard administrative operation'}
                      </td>

                      <td
                        className="py-3.5 px-4 font-mono text-[11px]"
                        style={{ color: 'var(--athlon-text-muted)' }}
                      >
                        {log.requestIp || '127.0.0.1'}
                      </td>

                      <td
                        className="py-3.5 px-4 text-[11px] whitespace-nowrap"
                        style={{ color: 'var(--athlon-text-muted)' }}
                      >
                        {log.createdAt ? new Date(log.createdAt).toLocaleString() : 'N/A'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {logsPage && logsPage.totalPages > 1 && (
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
                  {logsPage.number + 1}
                </span>{' '}
                of{' '}
                <span className="font-bold" style={{ color: 'var(--athlon-text)' }}>
                  {logsPage.totalPages}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={logsPage.number === 0}
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
                  onClick={() => setPage((p) => Math.min(logsPage.totalPages - 1, p + 1))}
                  disabled={logsPage.number >= logsPage.totalPages - 1}
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
    </div>
  );
}
