'use client';

import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  RefreshCw,
  CheckCircle2,
  Check,
  AlertCircle,
  X,
  Sparkles,
} from 'lucide-react';
import { AdminService, SubscriptionPackageItem } from '@/lib/api/admin';

export default function AdminSubscriptionPlansPage() {
  const [packages, setPackages] = useState<SubscriptionPackageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('999');
  const [durationMonths, setDurationMonths] = useState('1');
  const [features, setFeatures] = useState('Tournament Management, Live Scoring, Up to 64 Teams');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const res = await AdminService.getAllPackages();
      if (res?.data) {
        setPackages(res.data);
      }
    } catch (err) {
      console.error('Failed to load packages', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleCreatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Package name is required');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      await AdminService.createPackage({
        name: name.trim(),
        description: description.trim() || undefined,
        price: parseFloat(price) || 0,
        durationMonths: parseInt(durationMonths) || 1,
        features: features.trim() || undefined,
      });

      setIsCreateModalOpen(false);
      setName('');
      setDescription('');
      setPrice('999');
      setDurationMonths('1');
      fetchPackages();
    } catch (err: any) {
      console.error('Failed to create package', err);
      setFormError(err?.message || 'Failed to create subscription package');
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
              <Package className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1
                  className="text-base font-black uppercase tracking-tight truncate leading-none"
                  style={{ color: 'var(--athlon-text)' }}
                >
                  Packages
                </h1>
                <span
                  className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md border shrink-0"
                  style={{
                    backgroundColor: 'rgba(var(--primary-rgb, 16), 0.1)',
                    borderColor: 'rgba(var(--primary-rgb, 16), 0.25)',
                    color: 'var(--athlon-primary)',
                  }}
                >
                  {packages.length}
                </span>
              </div>
              <p
                className="text-[10px] truncate mt-0.5"
                style={{ color: 'var(--athlon-text-muted)' }}
              >
                Tiers, pricing &amp; feature limits
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchPackages}
              disabled={loading}
              className="p-2 rounded-xl border text-[10px] font-bold uppercase transition-all active:scale-95 shadow-xs shrink-0 disabled:opacity-50"
              style={{
                backgroundColor: 'var(--athlon-surface)',
                borderColor: 'var(--athlon-border)',
                color: 'var(--athlon-text)',
              }}
              title="Refresh Packages"
              aria-label="Refresh"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`}
                style={{ color: 'var(--athlon-primary)' }}
              />
            </button>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 shadow-md"
              style={{
                backgroundColor: 'var(--athlon-primary)',
                color: '#000000',
              }}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New</span>
            </button>
          </div>
        </div>

        {/* Mobile Packages Cards */}
        <div className="space-y-3">
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
                Loading subscription plans...
              </p>
            </div>
          ) : packages.length === 0 ? (
            <div
              className="p-8 rounded-2xl border text-center space-y-2"
              style={{
                backgroundColor: 'var(--athlon-card)',
                borderColor: 'var(--athlon-border)',
              }}
            >
              <Package className="w-6 h-6 mx-auto opacity-40" style={{ color: 'var(--athlon-text-muted)' }} />
              <p className="text-xs font-semibold" style={{ color: 'var(--athlon-text-muted)' }}>
                No subscription packages configured yet.
              </p>
            </div>
          ) : (
            packages.map((pkg) => (
              <div
                key={pkg.uuid}
                className="p-4 rounded-2xl border space-y-3 shadow-xs"
                style={{
                  backgroundColor: 'var(--athlon-card)',
                  borderColor: 'var(--athlon-border)',
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-xl border flex items-center justify-center font-bold"
                      style={{
                        backgroundColor: 'var(--athlon-surface)',
                        borderColor: 'var(--athlon-border)',
                        color: 'var(--athlon-primary)',
                      }}
                    >
                      <Package className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xs" style={{ color: 'var(--athlon-text)' }}>
                        {pkg.name}
                      </h3>
                      <div className="text-[10px] font-mono" style={{ color: 'var(--athlon-text-muted)' }}>
                        {pkg.durationMonths} {pkg.durationMonths === 1 ? 'Month' : 'Months'} Tier
                      </div>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/25 text-[9px] font-black uppercase">
                    Active
                  </span>
                </div>

                <div className="flex items-baseline gap-1 pt-1">
                  <span className="text-2xl font-black" style={{ color: 'var(--athlon-text)' }}>
                    ₹{pkg.price}
                  </span>
                  <span className="text-[10px] font-semibold" style={{ color: 'var(--athlon-text-muted)' }}>
                    / {pkg.durationMonths} mo
                  </span>
                </div>

                {pkg.description && (
                  <p className="text-[11px] line-clamp-2" style={{ color: 'var(--athlon-text-muted)' }}>
                    {pkg.description}
                  </p>
                )}

                {pkg.features && (
                  <div
                    className="pt-2 border-t space-y-1 text-[10px]"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    {pkg.features.split(',').map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-1.5" style={{ color: 'var(--athlon-text)' }}>
                        <Check className="w-3 h-3 shrink-0" style={{ color: 'var(--athlon-primary)' }} />
                        <span className="truncate">{feat.trim()}</span>
                      </div>
                    ))}
                  </div>
                )}
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
        {/* Page Header */}
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
                Subscription Packages
              </h1>
              <span
                className="px-2 py-0.5 rounded-full border text-xs font-bold"
                style={{
                  backgroundColor: 'rgba(var(--primary-rgb, 16), 0.1)',
                  borderColor: 'rgba(var(--primary-rgb, 16), 0.25)',
                  color: 'var(--athlon-primary)',
                }}
              >
                {packages.length} Plans
              </span>
            </div>
            <p className="text-xs sm:text-sm" style={{ color: 'var(--athlon-text-muted)' }}>
              Configure platform subscription tiers, billing periods, and entitlement feature limits.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchPackages}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all disabled:opacity-50 hover:opacity-90"
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

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md transition-all active:scale-95 hover:opacity-90"
              style={{
                backgroundColor: 'var(--athlon-primary)',
                color: '#000000',
              }}
            >
              <Plus className="w-4 h-4" />
              New Package
            </button>
          </div>
        </div>

        {/* Package Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading ? (
            <div
              className="col-span-full py-16 text-center"
              style={{ color: 'var(--athlon-text-muted)' }}
            >
              <RefreshCw
                className="w-6 h-6 mx-auto mb-2 animate-spin"
                style={{ color: 'var(--athlon-primary)' }}
              />
              Loading subscription plans...
            </div>
          ) : packages.length === 0 ? (
            <div
              className="col-span-full py-16 text-center"
              style={{ color: 'var(--athlon-text-muted)' }}
            >
              No subscription packages configured yet.
            </div>
          ) : (
            packages.map((pkg) => (
              <div
                key={pkg.uuid}
                className="p-6 rounded-2xl border transition-all flex flex-col justify-between shadow-xl relative overflow-hidden group hover:border-primary/50"
                style={{
                  backgroundColor: 'var(--athlon-card)',
                  borderColor: 'var(--athlon-border)',
                }}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div
                      className="w-10 h-10 rounded-xl border flex items-center justify-center group-hover:scale-105 transition-transform"
                      style={{
                        backgroundColor: 'var(--athlon-surface)',
                        borderColor: 'var(--athlon-border)',
                        color: 'var(--athlon-primary)',
                      }}
                    >
                      <Package className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/25 text-[10px] font-black uppercase">
                      Active Plan
                    </span>
                  </div>

                  <div>
                    <h3
                      className="text-lg font-black"
                      style={{ color: 'var(--athlon-text)' }}
                    >
                      {pkg.name}
                    </h3>
                    <p
                      className="text-xs mt-1 line-clamp-2"
                      style={{ color: 'var(--athlon-text-muted)' }}
                    >
                      {pkg.description || 'Full platform capabilities for active sports organizations.'}
                    </p>
                  </div>

                  <div className="pt-2 flex items-baseline gap-1">
                    <span
                      className="text-3xl font-black"
                      style={{ color: 'var(--athlon-text)' }}
                    >
                      ₹{pkg.price}
                    </span>
                    <span
                      className="text-xs font-bold"
                      style={{ color: 'var(--athlon-text-muted)' }}
                    >
                      / {pkg.durationMonths} {pkg.durationMonths === 1 ? 'Month' : 'Months'}
                    </span>
                  </div>

                  {/* Features breakdown */}
                  {pkg.features && (
                    <div
                      className="pt-3 border-t space-y-2"
                      style={{ borderColor: 'var(--athlon-border)' }}
                    >
                      <div
                        className="text-[10px] font-extrabold uppercase tracking-wider"
                        style={{ color: 'var(--athlon-text-muted)' }}
                      >
                        Entitlements
                      </div>
                      <div className="space-y-1.5">
                        {pkg.features.split(',').map((feat, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 text-xs"
                            style={{ color: 'var(--athlon-text)' }}
                          >
                            <Check
                              className="w-3.5 h-3.5 shrink-0"
                              style={{ color: 'var(--athlon-primary)' }}
                            />
                            <span className="truncate">{feat.trim()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div
                  className="pt-6 text-[10px] font-mono flex items-center justify-between"
                  style={{ color: 'var(--athlon-text-muted)' }}
                >
                  <span>UUID: {pkg.uuid.substring(0, 8)}...</span>
                  <span>Tier Plan</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          CREATE PACKAGE MODAL (Shared Mobile & Desktop)
          ───────────────────────────────────────────────────────────── */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className="max-w-lg w-full border rounded-2xl p-6 shadow-2xl space-y-5"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <div
              className="flex items-center justify-between pb-3 border-b"
              style={{ borderColor: 'var(--athlon-border)' }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-xl border flex items-center justify-center"
                  style={{
                    backgroundColor: 'var(--athlon-surface)',
                    borderColor: 'var(--athlon-border)',
                    color: 'var(--athlon-primary)',
                  }}
                >
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3
                    className="text-sm font-black uppercase"
                    style={{ color: 'var(--athlon-text)' }}
                  >
                    Create Subscription Package
                  </h3>
                  <p
                    className="text-xs"
                    style={{ color: 'var(--athlon-text-muted)' }}
                  >
                    Add a new organization plan tier
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-lg transition-colors hover:opacity-80"
                style={{ color: 'var(--athlon-text-muted)' }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePackage} className="space-y-4">
              <div>
                <label
                  className="text-[11px] font-bold uppercase tracking-wider block mb-1"
                  style={{ color: 'var(--athlon-text-muted)' }}
                >
                  Plan Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="E.g., Organizer Pro Tier, Academy Standard"
                  className="w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none transition-colors"
                  style={{
                    backgroundColor: 'var(--athlon-surface)',
                    borderColor: 'var(--athlon-border)',
                    color: 'var(--athlon-text)',
                  }}
                />
              </div>

              <div>
                <label
                  className="text-[11px] font-bold uppercase tracking-wider block mb-1"
                  style={{ color: 'var(--athlon-text-muted)' }}
                >
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short description of this package..."
                  className="w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none resize-none h-18 transition-colors"
                  style={{
                    backgroundColor: 'var(--athlon-surface)',
                    borderColor: 'var(--athlon-border)',
                    color: 'var(--athlon-text)',
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className="text-[11px] font-bold uppercase tracking-wider block mb-1"
                    style={{ color: 'var(--athlon-text-muted)' }}
                  >
                    Price (INR) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none transition-colors"
                    style={{
                      backgroundColor: 'var(--athlon-surface)',
                      borderColor: 'var(--athlon-border)',
                      color: 'var(--athlon-text)',
                    }}
                  />
                </div>

                <div>
                  <label
                    className="text-[11px] font-bold uppercase tracking-wider block mb-1"
                    style={{ color: 'var(--athlon-text-muted)' }}
                  >
                    Duration (Months) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="120"
                    value={durationMonths}
                    onChange={(e) => setDurationMonths(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none transition-colors"
                    style={{
                      backgroundColor: 'var(--athlon-surface)',
                      borderColor: 'var(--athlon-border)',
                      color: 'var(--athlon-text)',
                    }}
                  />
                </div>
              </div>

              <div>
                <label
                  className="text-[11px] font-bold uppercase tracking-wider block mb-1"
                  style={{ color: 'var(--athlon-text-muted)' }}
                >
                  Features &amp; Entitlements (Comma separated)
                </label>
                <textarea
                  value={features}
                  onChange={(e) => setFeatures(e.target.value)}
                  placeholder="E.g., Tournament Management, Live Scoring, Up to 64 Teams"
                  className="w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none resize-none h-20 transition-colors"
                  style={{
                    backgroundColor: 'var(--athlon-surface)',
                    borderColor: 'var(--athlon-border)',
                    color: 'var(--athlon-text)',
                  }}
                />
              </div>

              {formError && (
                <div className="text-xs text-red-500 bg-red-500/10 p-2.5 rounded-lg border border-red-500/20">
                  {formError}
                </div>
              )}

              <div
                className="flex items-center justify-end gap-2.5 pt-3 border-t"
                style={{ borderColor: 'var(--athlon-border)' }}
              >
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
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
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md hover:opacity-90 transition-all"
                  style={{
                    backgroundColor: 'var(--athlon-primary)',
                    color: '#000000',
                  }}
                >
                  {submitting ? 'Creating...' : 'Create Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
