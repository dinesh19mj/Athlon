'use client';

import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Check,
  X,
  CreditCard,
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { AdminService, PlatformSubscriptionRequestItem, PageResponse } from '@/lib/api/admin';

export default function AdminSubscriptionRequestsPage() {
  const [requestsPage, setRequestsPage] = useState<PageResponse<PlatformSubscriptionRequestItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [page, setPage] = useState(0);

  // Approval Modal
  const [selectedReq, setSelectedReq] = useState<PlatformSubscriptionRequestItem | null>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const statusParam = statusFilter === 'ALL' ? undefined : statusFilter;
      const res = await AdminService.getSubscriptionRequests({
        status: statusParam,
        page,
        size: 10,
      });
      if (res?.data) {
        setRequestsPage(res.data);
      }
    } catch (err) {
      console.error('Failed to load subscription requests', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [page, statusFilter]);

  const handleConfirmAction = async () => {
    if (!selectedReq || !actionType) return;
    setSubmitting(true);
    setActionError(null);
    try {
      if (actionType === 'APPROVE') {
        await AdminService.approveSubscriptionRequest(selectedReq.requestUuid);
      } else {
        await AdminService.rejectSubscriptionRequest(selectedReq.requestUuid, rejectReason);
      }
      setSelectedReq(null);
      setActionType(null);
      setRejectReason('');
      fetchRequests();
    } catch (err: any) {
      console.error('Action failed', err);
      setActionError(err?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
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
              <FileCheck2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1
                  className="text-base font-black uppercase tracking-tight truncate leading-none"
                  style={{ color: 'var(--athlon-text)' }}
                >
                  Approvals
                </h1>
                <span
                  className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md border shrink-0"
                  style={{
                    backgroundColor: 'rgba(var(--primary-rgb, 16), 0.1)',
                    borderColor: 'rgba(var(--primary-rgb, 16), 0.25)',
                    color: 'var(--athlon-primary)',
                  }}
                >
                  {requestsPage?.totalElements ?? 0}
                </span>
              </div>
              <p
                className="text-[10px] truncate mt-0.5"
                style={{ color: 'var(--athlon-text-muted)' }}
              >
                Payment verification &amp; activation
              </p>
            </div>
          </div>

          <button
            onClick={fetchRequests}
            disabled={loading}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95 shadow-xs shrink-0 disabled:opacity-50"
            style={{
              backgroundColor: 'var(--athlon-surface)',
              borderColor: 'var(--athlon-border)',
              color: 'var(--athlon-text)',
            }}
            title="Refresh Requests"
            aria-label="Refresh"
          >
            <RefreshCw
              className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`}
              style={{ color: 'var(--athlon-primary)' }}
            />
            <span>Sync</span>
          </button>
        </div>

        {/* Status Segmented Tabs */}
        <div
          className="flex items-center p-1 rounded-xl border gap-1 shadow-xs"
          style={{
            backgroundColor: 'var(--athlon-card)',
            borderColor: 'var(--athlon-border)',
          }}
        >
          {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((tab) => {
            const isActive = statusFilter === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setStatusFilter(tab);
                  setPage(0);
                }}
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

        {/* Requests Mobile Cards */}
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
                Loading approval requests...
              </p>
            </div>
          ) : !requestsPage?.content || requestsPage.content.length === 0 ? (
            <div
              className="p-8 rounded-2xl border text-center space-y-2"
              style={{
                backgroundColor: 'var(--athlon-card)',
                borderColor: 'var(--athlon-border)',
              }}
            >
              <FileCheck2 className="w-6 h-6 mx-auto opacity-40" style={{ color: 'var(--athlon-text-muted)' }} />
              <p className="text-xs font-semibold" style={{ color: 'var(--athlon-text-muted)' }}>
                No subscription requests in status: {statusFilter}.
              </p>
            </div>
          ) : (
            requestsPage.content.map((req) => {
              const isPending = req.requestStatus === 'PENDING' || req.requestStatus === 'UNDER_REVIEW';
              const isApproved = req.requestStatus === 'APPROVED';

              return (
                <div
                  key={req.requestUuid}
                  className="p-3.5 rounded-2xl border space-y-3 shadow-xs"
                  style={{
                    backgroundColor: 'var(--athlon-card)',
                    borderColor: 'var(--athlon-border)',
                  }}
                >
                  {/* Top: Org & Status */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-8 h-8 rounded-xl border flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: 'rgba(168, 85, 247, 0.1)',
                          borderColor: 'rgba(168, 85, 247, 0.25)',
                          color: '#A855F7',
                        }}
                      >
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-xs truncate" style={{ color: 'var(--athlon-text)' }}>
                          Org #{req.organizationId}
                        </div>
                        <div className="text-[9.5px] font-mono truncate" style={{ color: 'var(--athlon-text-muted)' }}>
                          {req.organizationUuid}
                        </div>
                      </div>
                    </div>

                    {isPending ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/25 text-[9.5px] font-bold uppercase shrink-0">
                        <Clock className="w-2.5 h-2.5" /> Pending
                      </span>
                    ) : isApproved ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/25 text-[9.5px] font-bold uppercase shrink-0">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Approved
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/15 text-red-500 border border-red-500/25 text-[9.5px] font-bold uppercase shrink-0">
                        <XCircle className="w-2.5 h-2.5" /> Rejected
                      </span>
                    )}
                  </div>

                  {/* Middle: Amount & Method */}
                  <div
                    className="pt-2 border-t flex items-center justify-between text-xs"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <div>
                      <span className="font-black text-sm" style={{ color: 'var(--athlon-text)' }}>
                        ₹{req.amount}
                      </span>
                      <span className="text-[10px] ml-1 font-semibold" style={{ color: 'var(--athlon-text-muted)' }}>
                        ({req.billingPeriodMonths} mo)
                      </span>
                    </div>

                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[9.5px] font-bold"
                      style={{
                        backgroundColor: 'var(--athlon-surface)',
                        borderColor: 'var(--athlon-border)',
                        color: 'var(--athlon-text)',
                      }}
                    >
                      <CreditCard className="w-2.5 h-2.5" /> {req.paymentMethod}
                    </span>
                  </div>

                  {/* Payment Reference & Proof Link */}
                  {(req.paymentReference || req.paymentProofUrl) && (
                    <div
                      className="pt-1 text-[10px] flex items-center justify-between"
                      style={{ color: 'var(--athlon-text-muted)' }}
                    >
                      <span className="font-mono truncate max-w-[160px]">
                        Ref: {req.paymentReference || 'N/A'}
                      </span>
                      {req.paymentProofUrl && (
                        <a
                          href={req.paymentProofUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-bold hover:underline"
                          style={{ color: 'var(--athlon-primary)' }}
                        >
                          Evidence <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                  )}

                  {/* Bottom Actions if Pending */}
                  {isPending && (
                    <div
                      className="pt-2 border-t flex items-center gap-2"
                      style={{ borderColor: 'var(--athlon-border)' }}
                    >
                      <button
                        onClick={() => {
                          setSelectedReq(req);
                          setActionType('APPROVE');
                        }}
                        className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 shadow-sm active:scale-95"
                      >
                        <Check className="w-3 h-3" /> Approve
                      </button>
                      <button
                        onClick={() => {
                          setSelectedReq(req);
                          setActionType('REJECT');
                        }}
                        className="flex-1 py-1.5 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 active:scale-95"
                      >
                        <X className="w-3 h-3" /> Reject
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Mobile Pagination */}
        {requestsPage && requestsPage.totalPages > 1 && (
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
                {requestsPage.number + 1}
              </span>{' '}
              of{' '}
              <span className="font-bold" style={{ color: 'var(--athlon-text)' }}>
                {requestsPage.totalPages}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={requestsPage.number === 0}
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
                onClick={() => setPage((p) => Math.min(requestsPage.totalPages - 1, p + 1))}
                disabled={requestsPage.number >= requestsPage.totalPages - 1}
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
                Subscription Requests
              </h1>
              <span
                className="px-2 py-0.5 rounded-full border text-xs font-bold"
                style={{
                  backgroundColor: 'rgba(var(--primary-rgb, 16), 0.1)',
                  borderColor: 'rgba(var(--primary-rgb, 16), 0.25)',
                  color: 'var(--athlon-primary)',
                }}
              >
                {requestsPage?.totalElements ?? 0} Total
              </span>
            </div>
            <p className="text-xs sm:text-sm" style={{ color: 'var(--athlon-text-muted)' }}>
              Manual payment verification, transaction evidence inspection, and entitlement activations.
            </p>
          </div>

          <button
            onClick={fetchRequests}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all disabled:opacity-50 hover:opacity-90"
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

        {/* Status Filter Tabs */}
        <div
          className="flex items-center gap-1.5 p-1 rounded-xl border self-start"
          style={{
            backgroundColor: 'var(--athlon-surface)',
            borderColor: 'var(--athlon-border)',
          }}
        >
          {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((tab) => {
            const isActive = statusFilter === tab;
            return (
              <button
                key={tab}
                onClick={() => {
                  setStatusFilter(tab);
                  setPage(0);
                }}
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

        {/* Requests Table */}
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
                  <th className="py-3.5 px-4">Request / Org</th>
                  <th className="py-3.5 px-4">Billing / Amount</th>
                  <th className="py-3.5 px-4">Payment Method</th>
                  <th className="py-3.5 px-4">Payment Ref</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Requested On</th>
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
                      Loading requests...
                    </td>
                  </tr>
                ) : !requestsPage?.content || requestsPage.content.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-12 text-center"
                      style={{ color: 'var(--athlon-text-muted)' }}
                    >
                      No subscription requests found in status: {statusFilter}.
                    </td>
                  </tr>
                ) : (
                  requestsPage.content.map((req) => {
                    const isPending = req.requestStatus === 'PENDING' || req.requestStatus === 'UNDER_REVIEW';
                    const isApproved = req.requestStatus === 'APPROVED';

                    return (
                      <tr
                        key={req.requestUuid}
                        className="hover:bg-black/5 dark:hover:bg-white/[0.02] transition-colors"
                      >
                        {/* Org info */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-8 h-8 rounded-xl border flex items-center justify-center"
                              style={{
                                backgroundColor: 'rgba(168, 85, 247, 0.1)',
                                borderColor: 'rgba(168, 85, 247, 0.25)',
                                color: '#A855F7',
                              }}
                            >
                              <Building2 className="w-4 h-4" />
                            </div>
                            <div>
                              <div
                                className="font-bold leading-tight"
                                style={{ color: 'var(--athlon-text)' }}
                              >
                                Org #{req.organizationId}
                              </div>
                              <div
                                className="text-[10px] font-mono mt-0.5 truncate max-w-[150px]"
                                style={{ color: 'var(--athlon-text-muted)' }}
                              >
                                {req.organizationUuid}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Billing & Amount */}
                        <td className="py-3.5 px-4">
                          <div
                            className="font-bold text-[13px]"
                            style={{ color: 'var(--athlon-text)' }}
                          >
                            ₹{req.amount} {req.currency}
                          </div>
                          <div
                            className="text-[10px]"
                            style={{ color: 'var(--athlon-text-muted)' }}
                          >
                            {req.billingPeriodMonths} Month(s)
                          </div>
                        </td>

                        {/* Payment Method */}
                        <td className="py-3.5 px-4">
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold"
                            style={{
                              backgroundColor: 'var(--athlon-surface)',
                              borderColor: 'var(--athlon-border)',
                              color: 'var(--athlon-text)',
                            }}
                          >
                            <CreditCard className="w-2.5 h-2.5" /> {req.paymentMethod}
                          </span>
                        </td>

                        {/* Payment Ref */}
                        <td className="py-3.5 px-4">
                          <div
                            className="font-mono text-[11px] truncate max-w-[140px]"
                            style={{ color: 'var(--athlon-text)' }}
                          >
                            {req.paymentReference || 'N/A'}
                          </div>
                          {req.paymentProofUrl && (
                            <a
                              href={req.paymentProofUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] hover:underline mt-0.5 font-bold"
                              style={{ color: 'var(--athlon-primary)' }}
                            >
                              View Evidence <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          {isPending ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/25 text-[10px] font-bold uppercase">
                              <Clock className="w-3 h-3" /> Pending Review
                            </span>
                          ) : isApproved ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/25 text-[10px] font-bold uppercase">
                              <CheckCircle2 className="w-3 h-3" /> Approved
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/15 text-red-500 border border-red-500/25 text-[10px] font-bold uppercase">
                              <XCircle className="w-3 h-3" /> Rejected
                            </span>
                          )}
                        </td>

                        {/* Date */}
                        <td
                          className="py-3.5 px-4 text-[11px]"
                          style={{ color: 'var(--athlon-text-muted)' }}
                        >
                          {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'N/A'}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          {isPending ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setSelectedReq(req);
                                  setActionType('APPROVE');
                                }}
                                className="px-2.5 py-1 rounded-lg bg-emerald-500 text-black font-bold text-[11px] hover:bg-emerald-400 transition-colors shadow-sm"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedReq(req);
                                  setActionType('REJECT');
                                }}
                                className="px-2.5 py-1 rounded-lg bg-red-500/15 text-red-500 border border-red-500/30 font-bold text-[11px] hover:bg-red-500/25 transition-colors"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span
                              className="text-[10px] italic"
                              style={{ color: 'var(--athlon-text-muted)' }}
                            >
                              Completed
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {requestsPage && requestsPage.totalPages > 1 && (
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
                  {requestsPage.number + 1}
                </span>{' '}
                of{' '}
                <span className="font-bold" style={{ color: 'var(--athlon-text)' }}>
                  {requestsPage.totalPages}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={requestsPage.number === 0}
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
                  onClick={() => setPage((p) => Math.min(requestsPage.totalPages - 1, p + 1))}
                  disabled={requestsPage.number >= requestsPage.totalPages - 1}
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
      {selectedReq && actionType && (
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
                  actionType === 'APPROVE'
                    ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                    : 'bg-red-500/15 text-red-500 border border-red-500/30'
                }`}
              >
                {actionType === 'APPROVE' ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
              </div>
              <div className="min-w-0">
                <h3
                  className="text-sm font-black uppercase"
                  style={{ color: 'var(--athlon-text)' }}
                >
                  {actionType === 'APPROVE' ? 'Approve Subscription Request' : 'Reject Subscription Request'}
                </h3>
                <p
                  className="text-xs truncate"
                  style={{ color: 'var(--athlon-text-muted)' }}
                >
                  Org #{selectedReq.organizationId} • ₹{selectedReq.amount}
                </p>
              </div>
            </div>

            <p
              className="text-xs leading-relaxed"
              style={{ color: 'var(--athlon-text-muted)' }}
            >
              {actionType === 'APPROVE'
                ? 'Approving this request verifies the manual payment and activates the subscription entitlement for this organization immediately.'
                : 'Rejecting this request will mark the payment as unverified. Please provide a reason.'}
            </p>

            {actionType === 'REJECT' && (
              <div>
                <label
                  className="text-[11px] font-bold uppercase tracking-wider block mb-1"
                  style={{ color: 'var(--athlon-text-muted)' }}
                >
                  Rejection Reason *
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="E.g., Transaction ID not found on desk bank statement..."
                  className="w-full p-2.5 rounded-xl border text-xs focus:outline-none resize-none h-20 transition-colors"
                  style={{
                    backgroundColor: 'var(--athlon-surface)',
                    borderColor: 'var(--athlon-border)',
                    color: 'var(--athlon-text)',
                  }}
                />
              </div>
            )}

            {actionError && (
              <div className="text-xs text-red-500 bg-red-500/10 p-2.5 rounded-lg border border-red-500/20">
                {actionError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => {
                  setSelectedReq(null);
                  setActionType(null);
                  setRejectReason('');
                }}
                disabled={submitting}
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
                onClick={handleConfirmAction}
                disabled={submitting || (actionType === 'REJECT' && !rejectReason.trim())}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md ${
                  actionType === 'APPROVE'
                    ? 'bg-emerald-500 text-black hover:bg-emerald-400'
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
              >
                {submitting ? 'Processing...' : actionType === 'APPROVE' ? 'Confirm Approval' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
