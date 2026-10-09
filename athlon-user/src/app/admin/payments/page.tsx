'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  Search,
  CheckCircle2,
  Clock,
  RefreshCw,
  TrendingUp,
  Building2,
  ShieldCheck,
} from 'lucide-react';
import { AdminService, PlatformSubscriptionRequestItem, PageResponse } from '@/lib/api/admin';

export default function AdminPaymentsPage() {
  const [paymentsPage, setPaymentsPage] = useState<PageResponse<PlatformSubscriptionRequestItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'VERIFIED' | 'PENDING'>('ALL');
  const [page, setPage] = useState(0);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await AdminService.getSubscriptionRequests({
        page,
        size: 10,
      });
      if (res?.data) {
        setPaymentsPage(res.data);
      }
    } catch (err) {
      console.error('Failed to load payments ledger', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [page]);

  const allRecords = paymentsPage?.content || [];
  const filteredRecords = allRecords.filter((p) => {
    if (statusFilter === 'VERIFIED') return p.paymentStatus === 'VERIFIED';
    if (statusFilter === 'PENDING') return p.paymentStatus === 'PENDING';
    return true;
  });

  const totalVerifiedVolume = allRecords
    .filter((p) => p.paymentStatus === 'VERIFIED')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const totalPendingVolume = allRecords
    .filter((p) => p.paymentStatus === 'PENDING')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

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
              <CreditCard className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1
                  className="text-base font-black uppercase tracking-tight truncate leading-none"
                  style={{ color: 'var(--athlon-text)' }}
                >
                  Payments
                </h1>
                <span
                  className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md border shrink-0"
                  style={{
                    backgroundColor: 'rgba(var(--primary-rgb, 16), 0.1)',
                    borderColor: 'rgba(var(--primary-rgb, 16), 0.25)',
                    color: 'var(--athlon-primary)',
                  }}
                >
                  {filteredRecords.length}
                </span>
              </div>
              <p
                className="text-[10px] truncate mt-0.5"
                style={{ color: 'var(--athlon-text-muted)' }}
              >
                Revenue &amp; settlement overview
              </p>
            </div>
          </div>

          <button
            onClick={fetchPayments}
            disabled={loading}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95 shadow-xs shrink-0 disabled:opacity-50"
            style={{
              backgroundColor: 'var(--athlon-surface)',
              borderColor: 'var(--athlon-border)',
              color: 'var(--athlon-text)',
            }}
            title="Refresh Payments"
            aria-label="Refresh"
          >
            <RefreshCw
              className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`}
              style={{ color: 'var(--athlon-primary)' }}
            />
            <span>Sync</span>
          </button>
        </div>

        {/* Mobile Mini KPI Matrix */}
        <div className="grid grid-cols-2 gap-2">
          <div
            className="p-3 rounded-2xl border space-y-1"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <div
              className="text-[9.5px] font-bold uppercase tracking-wider"
              style={{ color: 'var(--athlon-text-muted)' }}
            >
              Verified Revenue
            </div>
            <div className="text-lg font-black" style={{ color: 'var(--athlon-text)' }}>
              ₹{totalVerifiedVolume.toLocaleString()}
            </div>
            <div className="text-[9px] font-semibold text-emerald-500">Confirmed</div>
          </div>

          <div
            className="p-3 rounded-2xl border space-y-1"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <div
              className="text-[9.5px] font-bold uppercase tracking-wider"
              style={{ color: 'var(--athlon-text-muted)' }}
            >
              Pending In Queue
            </div>
            <div className="text-lg font-black" style={{ color: 'var(--athlon-text)' }}>
              ₹{totalPendingVolume.toLocaleString()}
            </div>
            <div className="text-[9px] font-semibold text-amber-500">Review Required</div>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div
          className="flex items-center p-1 rounded-xl border gap-1 shadow-xs"
          style={{
            backgroundColor: 'var(--athlon-card)',
            borderColor: 'var(--athlon-border)',
          }}
        >
          {(['ALL', 'VERIFIED', 'PENDING'] as const).map((tab) => {
            const isActive = statusFilter === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusFilter(tab)}
                className="flex-1 py-1.5 rounded-lg text-[9.5px] font-black uppercase tracking-wider transition-all text-center"
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

        {/* Mobile Payment Cards */}
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
                Loading payment records...
              </p>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div
              className="p-8 rounded-2xl border text-center space-y-2"
              style={{
                backgroundColor: 'var(--athlon-card)',
                borderColor: 'var(--athlon-border)',
              }}
            >
              <CreditCard className="w-6 h-6 mx-auto opacity-40" style={{ color: 'var(--athlon-text-muted)' }} />
              <p className="text-xs font-semibold" style={{ color: 'var(--athlon-text-muted)' }}>
                No transactions recorded in this status.
              </p>
            </div>
          ) : (
            filteredRecords.map((item) => (
              <div
                key={item.requestUuid}
                className="p-3.5 rounded-2xl border space-y-2.5 shadow-xs"
                style={{
                  backgroundColor: 'var(--athlon-card)',
                  borderColor: 'var(--athlon-border)',
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-8 h-8 rounded-xl border flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: 'var(--athlon-surface)',
                        borderColor: 'var(--athlon-border)',
                        color: 'var(--athlon-text)',
                      }}
                    >
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs truncate" style={{ color: 'var(--athlon-text)' }}>
                        Org #{item.organizationId}
                      </div>
                      <div className="text-[9.5px] font-mono truncate" style={{ color: 'var(--athlon-text-muted)' }}>
                        Ref: {item.paymentReference || 'N/A'}
                      </div>
                    </div>
                  </div>

                  {item.paymentStatus === 'VERIFIED' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/25 text-[9.5px] font-bold uppercase shrink-0">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/25 text-[9.5px] font-bold uppercase shrink-0">
                      <Clock className="w-2.5 h-2.5" /> Pending
                    </span>
                  )}
                </div>

                <div
                  className="pt-2 border-t flex items-center justify-between text-xs"
                  style={{ borderColor: 'var(--athlon-border)' }}
                >
                  <span className="font-black text-sm" style={{ color: 'var(--athlon-text)' }}>
                    ₹{item.amount} {item.currency}
                  </span>

                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[9.5px] font-bold"
                    style={{
                      backgroundColor: 'var(--athlon-surface)',
                      borderColor: 'var(--athlon-border)',
                      color: 'var(--athlon-text)',
                    }}
                  >
                    {item.paymentMethod}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
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
                Platform Payments Ledger
              </h1>
              <span
                className="px-2 py-0.5 rounded-full border text-xs font-bold"
                style={{
                  backgroundColor: 'rgba(var(--primary-rgb, 16), 0.1)',
                  borderColor: 'rgba(var(--primary-rgb, 16), 0.25)',
                  color: 'var(--athlon-primary)',
                }}
              >
                Financial Oversight
              </span>
            </div>
            <p className="text-xs sm:text-sm" style={{ color: 'var(--athlon-text-muted)' }}>
              Real-time ledger of verified subscription revenues and pending manual payment references.
            </p>
          </div>

          <button
            onClick={fetchPayments}
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

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            className="p-5 rounded-2xl border"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: 'var(--athlon-text-muted)' }}
              >
                Verified Revenue
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div
              className="text-2xl font-black"
              style={{ color: 'var(--athlon-text)' }}
            >
              ₹{totalVerifiedVolume.toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-500 font-bold mt-1">Confirmed &amp; Activated</div>
          </div>

          <div
            className="p-5 rounded-2xl border"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: 'var(--athlon-text-muted)' }}
              >
                Pending Verification
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div
              className="text-2xl font-black"
              style={{ color: 'var(--athlon-text)' }}
            >
              ₹{totalPendingVolume.toLocaleString()}
            </div>
            <div className="text-[11px] text-amber-500 font-bold mt-1">Manual References in Queue</div>
          </div>

          <div
            className="p-5 rounded-2xl border"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: 'var(--athlon-text-muted)' }}
              >
                Gateway Status
              </span>
              <div
                className="w-8 h-8 rounded-lg border flex items-center justify-center"
                style={{
                  backgroundColor: 'rgba(var(--primary-rgb, 16), 0.1)',
                  borderColor: 'rgba(var(--primary-rgb, 16), 0.25)',
                  color: 'var(--athlon-primary)',
                }}
              >
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div
              className="text-2xl font-black"
              style={{ color: 'var(--athlon-text)' }}
            >
              Razorpay &amp; UPI
            </div>
            <div
              className="text-[11px] font-bold mt-1"
              style={{ color: 'var(--athlon-text-muted)' }}
            >
              Idempotent Webhooks Active
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div
          className="flex items-center gap-1.5 p-1 rounded-xl border self-start"
          style={{
            backgroundColor: 'var(--athlon-surface)',
            borderColor: 'var(--athlon-border)',
          }}
        >
          {(['ALL', 'VERIFIED', 'PENDING'] as const).map((tab) => {
            const isActive = statusFilter === tab;
            return (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
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
                  <th className="py-3.5 px-4">Transaction / Org</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Payment Method</th>
                  <th className="py-3.5 px-4">Reference ID</th>
                  <th className="py-3.5 px-4">Verification Status</th>
                  <th className="py-3.5 px-4">Recorded Date</th>
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
                      Loading payment records...
                    </td>
                  </tr>
                ) : filteredRecords.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-12 text-center"
                      style={{ color: 'var(--athlon-text-muted)' }}
                    >
                      No transactions recorded in this status.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((item) => (
                    <tr
                      key={item.requestUuid}
                      className="hover:bg-black/5 dark:hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-8 h-8 rounded-xl border flex items-center justify-center"
                            style={{
                              backgroundColor: 'var(--athlon-surface)',
                              borderColor: 'var(--athlon-border)',
                              color: 'var(--athlon-text)',
                            }}
                          >
                            <CreditCard className="w-4 h-4" />
                          </div>
                          <div>
                            <div
                              className="font-bold leading-tight"
                              style={{ color: 'var(--athlon-text)' }}
                            >
                              Org #{item.organizationId}
                            </div>
                            <div
                              className="text-[10px] font-mono mt-0.5 truncate max-w-[150px]"
                              style={{ color: 'var(--athlon-text-muted)' }}
                            >
                              {item.requestUuid}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td
                        className="py-3.5 px-4 font-bold text-[13px]"
                        style={{ color: 'var(--athlon-text)' }}
                      >
                        ₹{item.amount} {item.currency}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className="px-2 py-0.5 rounded-full border text-[10px] font-semibold"
                          style={{
                            backgroundColor: 'var(--athlon-surface)',
                            borderColor: 'var(--athlon-border)',
                            color: 'var(--athlon-text)',
                          }}
                        >
                          {item.paymentMethod}
                        </span>
                      </td>

                      <td
                        className="py-3.5 px-4 font-mono text-[11px]"
                        style={{ color: 'var(--athlon-text-muted)' }}
                      >
                        {item.paymentReference || 'N/A'}
                      </td>

                      <td className="py-3.5 px-4">
                        {item.paymentStatus === 'VERIFIED' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/25 text-[10px] font-bold uppercase">
                            <CheckCircle2 className="w-3 h-3" /> Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/25 text-[10px] font-bold uppercase">
                            <Clock className="w-3 h-3" /> Pending Desk Verification
                          </span>
                        )}
                      </td>

                      <td
                        className="py-3.5 px-4 text-[11px]"
                        style={{ color: 'var(--athlon-text-muted)' }}
                      >
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
