'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  SlidersHorizontal,
  RefreshCw,
  Trophy,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Layers,
  Info,
  Check,
  RotateCcw,
  Save,
  Globe,
  LayoutGrid,
} from 'lucide-react';
import { MarketplaceApi, AppModuleConfig } from '@/lib/api/marketplace';
import { useAppModeStore, ApplicationMode } from '@/lib/store/useAppModeStore';
import { useAthlonTheme } from '@/hooks/use-athlon-theme';
import { Athlon3DIcon } from '@/components/common/Athlon3DIcon';

export default function AdminAppModulesPage() {
  const { theme, mode } = useAthlonTheme();
  const { fetchModuleConfig: syncStoreConfig } = useAppModeStore();

  const [config, setConfig] = useState<AppModuleConfig>({
    athlonActive: true,
    marketActive: true,
    defaultMode: 'ATHLON',
    showModeSwitcher: true,
    activeModes: ['ATHLON', 'MARKET'],
    description: 'Global application modules (Athlon & Market)',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [originalConfig, setOriginalConfig] = useState<AppModuleConfig | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => {
      setStatusMessage(null);
    }, 4500);
  };

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const data = await MarketplaceApi.getModuleConfig();
      setConfig(data);
      setOriginalConfig(data);
      setHasUnsavedChanges(false);
    } catch (err: any) {
      console.error('Failed to fetch module config:', err);
      showToast('error', 'Could not load module configurations from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  // Handle module toggle
  const handleToggleModule = (module: 'ATHLON' | 'MARKET') => {
    if (module === 'ATHLON') {
      const nextAthlon = !config.athlonActive;
      // Guardrail: At least one module must remain active
      if (!nextAthlon && !config.marketActive) {
        showToast('error', 'Safety Rule: At least one platform module must remain active.');
        return;
      }

      let nextDefault = config.defaultMode;
      if (!nextAthlon && config.defaultMode === 'ATHLON') {
        nextDefault = 'MARKET';
      }

      const updated: AppModuleConfig = {
        ...config,
        athlonActive: nextAthlon,
        defaultMode: nextDefault,
        showModeSwitcher: nextAthlon && config.marketActive,
        activeModes: nextAthlon && config.marketActive ? ['ATHLON', 'MARKET'] : nextAthlon ? ['ATHLON'] : ['MARKET'],
      };
      setConfig(updated);
      setHasUnsavedChanges(true);
    } else {
      const nextMarket = !config.marketActive;
      // Guardrail: At least one module must remain active
      if (!nextMarket && !config.athlonActive) {
        showToast('error', 'Safety Rule: At least one platform module must remain active.');
        return;
      }

      let nextDefault = config.defaultMode;
      if (!nextMarket && config.defaultMode === 'MARKET') {
        nextDefault = 'ATHLON';
      }

      const updated: AppModuleConfig = {
        ...config,
        marketActive: nextMarket,
        defaultMode: nextDefault,
        showModeSwitcher: config.athlonActive && nextMarket,
        activeModes: config.athlonActive && nextMarket ? ['ATHLON', 'MARKET'] : config.athlonActive ? ['ATHLON'] : ['MARKET'],
      };
      setConfig(updated);
      setHasUnsavedChanges(true);
    }
  };

  // Handle default landing mode selection
  const handleSelectDefaultMode = (newMode: 'ATHLON' | 'MARKET') => {
    if (newMode === 'ATHLON' && !config.athlonActive) {
      showToast('error', 'Cannot set Athlon as default while the module is disabled.');
      return;
    }
    if (newMode === 'MARKET' && !config.marketActive) {
      showToast('error', 'Cannot set Market as default while the module is disabled.');
      return;
    }

    setConfig((prev) => ({
      ...prev,
      defaultMode: newMode,
    }));
    setHasUnsavedChanges(true);
  };

  // Save changes to backend
  const handleSaveChanges = async () => {
    if (!config.athlonActive && !config.marketActive) {
      showToast('error', 'At least one module must remain active.');
      return;
    }

    setSaving(true);
    try {
      const saved = await MarketplaceApi.updateModuleConfig(config);
      setConfig(saved);
      setOriginalConfig(saved);
      setHasUnsavedChanges(false);

      // Refresh global store so user's shell updates immediately
      await syncStoreConfig();

      showToast('success', 'Application module configuration successfully updated and live!');
    } catch (err: any) {
      console.error('Failed to update module config:', err);
      showToast('error', err?.message || 'Failed to save module configurations.');
    } finally {
      setSaving(false);
    }
  };

  // Reset to factory defaults
  const handleResetDefaults = async () => {
    if (!window.confirm('Reset all module configurations to factory defaults (both Athlon and Market active)?')) {
      return;
    }

    setResetting(true);
    try {
      const reset = await MarketplaceApi.resetModuleConfig();
      setConfig(reset);
      setOriginalConfig(reset);
      setHasUnsavedChanges(false);

      await syncStoreConfig();
      showToast('success', 'Module configuration reset to default settings.');
    } catch (err: any) {
      console.error('Failed to reset module config:', err);
      showToast('error', 'Failed to reset configuration.');
    } finally {
      setResetting(false);
    }
  };

  const activeCount = (config.athlonActive ? 1 : 0) + (config.marketActive ? 1 : 0);

  return (
    <>
      {/* Toast Notification Banner (Shared across views) */}
      {statusMessage && (
        <div
          className={`fixed top-20 right-4 z-50 max-w-sm sm:max-w-md p-3.5 rounded-2xl border shadow-xl flex items-center gap-3 backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-200 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
              : 'bg-red-500/15 border-red-500/30 text-red-400'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
          )}
          <span className="text-xs font-semibold leading-snug flex-1">{statusMessage.text}</span>
          <button
            onClick={() => setStatusMessage(null)}
            className="p-1 rounded-lg hover:bg-black/20 text-current transition-colors text-xs opacity-70 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MOBILE VIEW (max-width: md) — WORKSPACE DESIGN LANGUAGE
          Clutter-free, ultra-clean, touch-optimized mobile redesign
          Removes bulky 4-KPI cards, verbose paragraphs, and fixes 
          bottom avatar overlap permanently.
          ───────────────────────────────────────────────────────────── */}
      <div className="block md:hidden space-y-3.5 pb-24">
        {/* 1. Sleek Compact Mobile Header */}
        <div className="flex items-center justify-between px-0.5 pt-1">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center border shadow-xs shrink-0"
              style={{
                backgroundColor: 'var(--athlon-surface)',
                borderColor: 'var(--athlon-border)',
                color: 'var(--athlon-primary)',
              }}
            >
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1
                  className="text-base font-black uppercase tracking-tight truncate leading-none"
                  style={{ color: 'var(--athlon-text)' }}
                >
                  App Modules
                </h1>
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              <div
                className="text-[10px] font-semibold leading-none mt-1 truncate"
                style={{ color: 'var(--athlon-text-muted)' }}
              >
                {activeCount === 2 ? 'Dual Active' : 'Single Active'} • Default: {config.defaultMode === 'ATHLON' ? 'Tournaments' : 'Market'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={fetchConfig}
              disabled={loading || saving}
              className="w-8 h-8 rounded-xl border flex items-center justify-center transition-all active:scale-95 shadow-xs disabled:opacity-50"
              style={{
                backgroundColor: 'var(--athlon-surface)',
                borderColor: 'var(--athlon-border)',
                color: 'var(--athlon-text)',
              }}
              title="Sync Telemetry"
              aria-label="Sync Telemetry"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} style={{ color: 'var(--athlon-primary)' }} />
            </button>
            <button
              onClick={handleResetDefaults}
              disabled={resetting || loading || saving}
              className="w-8 h-8 rounded-xl border flex items-center justify-center transition-all active:scale-95 shadow-xs disabled:opacity-50 text-zinc-400 hover:text-amber-400"
              style={{
                backgroundColor: 'var(--athlon-surface)',
                borderColor: 'var(--athlon-border)',
              }}
              title="Reset Defaults"
              aria-label="Reset Defaults"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* 2. Interactive Segmented Selector: Default Landing Mode */}
        <div
          className="p-3 rounded-2xl border space-y-2 shadow-xs"
          style={{
            backgroundColor: 'var(--athlon-card)',
            borderColor: 'var(--athlon-border)',
          }}
        >
          <div className="flex items-center justify-between">
            <span
              className="text-[10px] font-black uppercase tracking-wider"
              style={{ color: 'var(--athlon-text-muted)' }}
            >
              Default Entry Mode
            </span>
            <span
              className="text-[9px] font-bold px-1.5 py-0.5 rounded-md"
              style={{
                backgroundColor: config.defaultMode === 'ATHLON' ? 'rgba(var(--primary-rgb, 16), 0.12)' : 'rgba(245, 158, 11, 0.12)',
                color: config.defaultMode === 'ATHLON' ? 'var(--athlon-primary)' : '#f59e0b',
              }}
            >
              Route: {config.defaultMode === 'ATHLON' ? '/home' : '/market'}
            </span>
          </div>

          <div
            className="grid grid-cols-2 p-1 rounded-xl border gap-1"
            style={{
              backgroundColor: 'var(--athlon-surface)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <button
              type="button"
              onClick={() => handleSelectDefaultMode('ATHLON')}
              disabled={!config.athlonActive}
              className={`py-2 px-2 rounded-lg text-xs font-black uppercase tracking-wide flex items-center justify-center gap-1.5 transition-all ${
                config.defaultMode === 'ATHLON'
                  ? 'bg-primary text-black shadow-sm font-extrabold'
                  : 'text-zinc-400 hover:text-zinc-200'
              } ${!config.athlonActive ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer active:scale-95'}`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Athlon Hub</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectDefaultMode('MARKET')}
              disabled={!config.marketActive}
              className={`py-2 px-2 rounded-lg text-xs font-black uppercase tracking-wide flex items-center justify-center gap-1.5 transition-all ${
                config.defaultMode === 'MARKET'
                  ? 'bg-amber-500 text-black shadow-sm font-extrabold'
                  : 'text-zinc-400 hover:text-zinc-200'
              } ${!config.marketActive ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer active:scale-95'}`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Marketplace</span>
            </button>
          </div>
        </div>

        {/* 3. Sleek Mobile Module Card 1: Athlon Tournament Platform */}
        <div
          className={`p-3.5 rounded-2xl border transition-all shadow-xs ${
            config.athlonActive ? '' : 'opacity-60'
          }`}
          style={{
            backgroundColor: 'var(--athlon-card)',
            borderColor: config.athlonActive ? 'var(--athlon-border)' : 'rgba(239, 68, 68, 0.3)',
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center border shadow-xs shrink-0"
                style={{
                  backgroundColor: 'var(--athlon-surface)',
                  borderColor: 'var(--athlon-border)',
                }}
              >
                <Athlon3DIcon type="tournaments" size={26} active={config.athlonActive} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2
                    className="text-xs font-black uppercase tracking-tight truncate leading-tight"
                    style={{ color: 'var(--athlon-text)' }}
                  >
                    Athlon Platform
                  </h2>
                  {config.defaultMode === 'ATHLON' && (
                    <span
                      className="text-[8px] font-black uppercase tracking-wider px-1 py-0.2 rounded border shrink-0"
                      style={{
                        backgroundColor: 'rgba(var(--primary-rgb, 16), 0.1)',
                        borderColor: 'var(--athlon-primary)',
                        color: 'var(--athlon-primary)',
                      }}
                    >
                      Default
                    </span>
                  )}
                </div>
                <div
                  className="text-[10px] truncate"
                  style={{ color: 'var(--athlon-text-muted)' }}
                >
                  Tournaments, Fixtures &amp; Venues
                </div>
              </div>
            </div>

            {/* iOS Toggle */}
            <button
              type="button"
              onClick={() => handleToggleModule('ATHLON')}
              aria-label="Toggle Athlon Platform"
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none shadow-inner ${
                config.athlonActive ? 'bg-emerald-500' : 'bg-zinc-600/50 dark:bg-zinc-700/60'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  config.athlonActive ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Micro Features Strip + Actions */}
          <div
            className="mt-3 pt-2.5 border-t flex items-center justify-between gap-2"
            style={{ borderColor: 'var(--athlon-border)' }}
          >
            <div className="flex items-center gap-1.5 overflow-hidden">
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                  config.athlonActive ? 'text-emerald-500 bg-emerald-500/10' : 'text-zinc-500 bg-zinc-500/10'
                }`}
              >
                {config.athlonActive ? 'Active' : 'Disabled'}
              </span>
              <span className="text-[9px] truncate" style={{ color: 'var(--athlon-text-muted)' }}>
                • Fixtures, Clubs &amp; Live Score
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {config.athlonActive && config.defaultMode !== 'ATHLON' && (
                <button
                  onClick={() => handleSelectDefaultMode('ATHLON')}
                  className="text-[9px] font-bold px-2 py-1 rounded-lg border uppercase tracking-wider transition-all active:scale-95"
                  style={{
                    backgroundColor: 'var(--athlon-surface)',
                    borderColor: 'var(--athlon-border)',
                    color: 'var(--athlon-text-secondary)',
                  }}
                >
                  Set Default
                </button>
              )}
              <Link
                href="/home"
                target="_blank"
                className="text-[9px] font-bold px-2 py-1 rounded-lg border flex items-center gap-1 transition-all active:scale-95"
                style={{
                  backgroundColor: 'var(--athlon-surface)',
                  borderColor: 'var(--athlon-border)',
                  color: 'var(--athlon-primary)',
                }}
              >
                <span>Test</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* 4. Sleek Mobile Module Card 2: Athlon Sports Marketplace */}
        <div
          className={`p-3.5 rounded-2xl border transition-all shadow-xs ${
            config.marketActive ? '' : 'opacity-60'
          }`}
          style={{
            backgroundColor: 'var(--athlon-card)',
            borderColor: config.marketActive ? 'var(--athlon-border)' : 'rgba(239, 68, 68, 0.3)',
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center border shadow-xs shrink-0"
                style={{
                  backgroundColor: 'var(--athlon-surface)',
                  borderColor: 'var(--athlon-border)',
                }}
              >
                <Athlon3DIcon type="inventory" size={26} active={config.marketActive} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2
                    className="text-xs font-black uppercase tracking-tight truncate leading-tight"
                    style={{ color: 'var(--athlon-text)' }}
                  >
                    Sports Market
                  </h2>
                  {config.defaultMode === 'MARKET' && (
                    <span className="text-[8px] font-black uppercase tracking-wider px-1 py-0.2 rounded border bg-amber-500/10 border-amber-500/30 text-amber-500 shrink-0">
                      Default
                    </span>
                  )}
                </div>
                <div
                  className="text-[10px] truncate"
                  style={{ color: 'var(--athlon-text-muted)' }}
                >
                  Pro Shops &amp; Gear Trading
                </div>
              </div>
            </div>

            {/* iOS Toggle */}
            <button
              type="button"
              onClick={() => handleToggleModule('MARKET')}
              aria-label="Toggle Marketplace Platform"
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none shadow-inner ${
                config.marketActive ? 'bg-amber-500' : 'bg-zinc-600/50 dark:bg-zinc-700/60'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  config.marketActive ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Micro Features Strip + Actions */}
          <div
            className="mt-3 pt-2.5 border-t flex items-center justify-between gap-2"
            style={{ borderColor: 'var(--athlon-border)' }}
          >
            <div className="flex items-center gap-1.5 overflow-hidden">
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                  config.marketActive ? 'text-amber-500 bg-amber-500/10' : 'text-zinc-500 bg-zinc-500/10'
                }`}
              >
                {config.marketActive ? 'Active' : 'Disabled'}
              </span>
              <span className="text-[9px] truncate" style={{ color: 'var(--athlon-text-muted)' }}>
                • Pro Shops, Buy &amp; Sell
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {config.marketActive && config.defaultMode !== 'MARKET' && (
                <button
                  onClick={() => handleSelectDefaultMode('MARKET')}
                  className="text-[9px] font-bold px-2 py-1 rounded-lg border uppercase tracking-wider transition-all active:scale-95"
                  style={{
                    backgroundColor: 'var(--athlon-surface)',
                    borderColor: 'var(--athlon-border)',
                    color: 'var(--athlon-text-secondary)',
                  }}
                >
                  Set Default
                </button>
              )}
              <Link
                href="/market"
                target="_blank"
                className="text-[9px] font-bold px-2 py-1 rounded-lg border flex items-center gap-1 transition-all active:scale-95 text-amber-500"
                style={{
                  backgroundColor: 'var(--athlon-surface)',
                  borderColor: 'var(--athlon-border)',
                }}
              >
                <span>Test</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* 5. Compact Switcher Status Pill */}
        <div
          className="p-3 rounded-2xl border flex items-center justify-between text-[11px] shadow-xs"
          style={{
            backgroundColor: 'var(--athlon-surface)',
            borderColor: 'var(--athlon-border)',
          }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-[10.5px] uppercase tracking-wider" style={{ color: 'var(--athlon-text)' }}>
                Navbar Mode Switcher
              </div>
              <div className="text-[9.5px] truncate" style={{ color: 'var(--athlon-text-muted)' }}>
                {config.showModeSwitcher
                  ? 'Dual-mode toggle is visible in navbar'
                  : `Locked to ${config.athlonActive ? 'Athlon' : 'Marketplace'} (Switcher hidden)`}
              </div>
            </div>
          </div>

          <span
            className={`text-[9.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border shrink-0 ${
              config.showModeSwitcher
                ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                : 'text-zinc-400 border-zinc-700 bg-zinc-800/40'
            }`}
          >
            {config.showModeSwitcher ? 'Visible' : 'Hidden'}
          </span>
        </div>

        {/* 6. Mobile Safe In-Sync Indicator (when clean) */}
        {!hasUnsavedChanges && (
          <div
            className="p-2.5 rounded-xl border flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider shadow-xs"
            style={{
              backgroundColor: 'var(--athlon-surface)',
              borderColor: 'var(--athlon-border)',
              color: 'var(--athlon-text-muted)',
            }}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Module Configuration in Sync</span>
          </div>
        )}

        {/* 7. Mobile Floating Save Pill (appears only on unsaved modifications, avoiding avatar overlap) */}
        {hasUnsavedChanges && (
          <div className="fixed bottom-4 inset-x-3 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
            <div
              className="p-3 rounded-2xl border shadow-2xl backdrop-blur-xl flex items-center justify-between gap-2.5 max-w-md mx-auto"
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                borderColor: 'var(--athlon-primary)',
                boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.7), 0 0 15px -3px var(--athlon-primary-glow)',
              }}
            >
              <div className="flex items-center gap-2 min-w-0 pl-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
                <div className="min-w-0">
                  <div className="text-[11px] font-black uppercase tracking-wider text-white truncate">
                    Unsaved Changes
                  </div>
                  <div className="text-[9px] text-zinc-400 truncate">
                    Tap save to apply live
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => {
                    if (originalConfig) {
                      setConfig(originalConfig);
                      setHasUnsavedChanges(false);
                    }
                  }}
                  className="px-2.5 py-1.5 rounded-xl border border-zinc-700 bg-zinc-800/80 text-zinc-300 text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95"
                >
                  Discard
                </button>
                <button
                  onClick={handleSaveChanges}
                  disabled={saving}
                  className="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider text-black flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                  style={{
                    backgroundColor: 'var(--athlon-primary)',
                  }}
                >
                  <Save className={`w-3.5 h-3.5 ${saving ? 'animate-spin' : ''}`} />
                  <span>{saving ? 'Saving...' : 'Save'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          DESKTOP VIEW (min-width: md) — EXACT ORIGINAL DESIGN
          Completely preserved without any changes
          ───────────────────────────────────────────────────────────── */}
      <div className="hidden md:block space-y-6 pb-20">
        {/* 1. Header Bar with Compact Breadcrumb & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-0.5">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span
                className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border"
                style={{
                  backgroundColor: 'var(--athlon-surface)',
                  borderColor: 'var(--athlon-border)',
                  color: 'var(--athlon-primary)',
                }}
              >
                Platform Governance
              </span>
              <span
                className="text-[10px] font-mono font-bold"
                style={{ color: 'var(--athlon-text-muted)' }}
              >
                app_module_configs
              </span>
            </div>
            <h1
              className="text-lg sm:text-2xl font-black uppercase tracking-tight truncate"
              style={{ color: 'var(--athlon-text)' }}
            >
              App Module Controls
            </h1>
            <p
              className="text-xs mt-0.5 truncate"
              style={{ color: 'var(--athlon-text-muted)' }}
            >
              Dynamically enable, disable, and configure operational modes across the platform
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <button
              onClick={fetchConfig}
              disabled={loading || saving}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all active:scale-95 shadow-xs disabled:opacity-50"
              style={{
                backgroundColor: 'var(--athlon-surface)',
                borderColor: 'var(--athlon-border)',
                color: 'var(--athlon-text)',
              }}
              title="Reload Server State"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} style={{ color: 'var(--athlon-primary)' }} />
              <span>Sync</span>
            </button>

            <button
              onClick={handleResetDefaults}
              disabled={resetting || loading || saving}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all active:scale-95 shadow-xs disabled:opacity-50 hover:border-amber-500/50"
              style={{
                backgroundColor: 'var(--athlon-surface)',
                borderColor: 'var(--athlon-border)',
                color: 'var(--athlon-text-muted)',
              }}
              title="Reset to Factory Defaults"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Reset Defaults</span>
            </button>
          </div>
        </div>

        {/* 2. Micro-KPI Stats Strip (4 Columns) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          {/* Metric 1: Active Modules */}
          <div
            className="p-3 rounded-2xl border shadow-xs"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <div className="flex items-center justify-between">
              <span
                className="text-[9.5px] font-bold uppercase tracking-wider"
                style={{ color: 'var(--athlon-text-muted)' }}
              >
                Active Modules
              </span>
              <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Layers className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <div
                className="text-xl sm:text-2xl font-black font-mono leading-none"
                style={{ color: 'var(--athlon-text)' }}
              >
                {loading ? '...' : `${activeCount} / 2`}
              </div>
              <span
                className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                  activeCount === 2 ? 'text-emerald-500 bg-emerald-500/10' : 'text-amber-500 bg-amber-500/10'
                }`}
              >
                {activeCount === 2 ? 'Dual Active' : 'Single Active'}
              </span>
            </div>
          </div>

          {/* Metric 2: Mode Switcher Bar */}
          <div
            className="p-3 rounded-2xl border shadow-xs"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <div className="flex items-center justify-between">
              <span
                className="text-[9.5px] font-bold uppercase tracking-wider"
                style={{ color: 'var(--athlon-text-muted)' }}
              >
                Navbar Switcher
              </span>
              <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <div
                className="text-base sm:text-lg font-black uppercase leading-none"
                style={{ color: config.showModeSwitcher ? 'var(--athlon-primary)' : 'var(--athlon-text-muted)' }}
              >
                {config.showModeSwitcher ? 'Visible' : 'Hidden'}
              </div>
              <span className="text-[9px] font-medium" style={{ color: 'var(--athlon-text-muted)' }}>
                {config.showModeSwitcher ? 'Dual Mode Active' : 'Locked Single'}
              </span>
            </div>
          </div>

          {/* Metric 3: Default Landing Mode */}
          <div
            className="p-3 rounded-2xl border shadow-xs"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <div className="flex items-center justify-between">
              <span
                className="text-[9.5px] font-bold uppercase tracking-wider"
                style={{ color: 'var(--athlon-text-muted)' }}
              >
                Default Landing
              </span>
              <div className="w-6 h-6 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <Globe className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <div
                className="text-base sm:text-lg font-black uppercase leading-none"
                style={{ color: 'var(--athlon-text)' }}
              >
                {config.defaultMode}
              </div>
              <span
                className="text-[9px] font-bold px-1.5 py-0.2 rounded"
                style={{
                  backgroundColor: config.defaultMode === 'ATHLON' ? 'rgba(var(--primary-rgb, 16), 0.1)' : 'rgba(245, 158, 11, 0.1)',
                  color: config.defaultMode === 'ATHLON' ? 'var(--athlon-primary)' : '#f59e0b',
                }}
              >
                {config.defaultMode === 'ATHLON' ? 'Tournaments' : 'Marketplace'}
              </span>
            </div>
          </div>

          {/* Metric 4: Platform Operational Health */}
          <div
            className="p-3 rounded-2xl border shadow-xs"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <div className="flex items-center justify-between">
              <span
                className="text-[9.5px] font-bold uppercase tracking-wider"
                style={{ color: 'var(--athlon-text-muted)' }}
              >
                Telemetry Sync
              </span>
              <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <div className="text-base sm:text-lg font-black text-emerald-500 leading-none">
                Online
              </div>
              <span className="text-[9px] font-mono" style={{ color: 'var(--athlon-text-muted)' }}>
                v1.0 Live
              </span>
            </div>
          </div>
        </div>

        {/* Unsaved Changes Banner */}
        {hasUnsavedChanges && (
          <div
            className="p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md animate-in fade-in"
            style={{
              backgroundColor: 'rgba(var(--primary-rgb, 16), 0.08)',
              borderColor: 'var(--athlon-primary)',
            }}
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 shrink-0" style={{ color: 'var(--athlon-primary)' }} />
              <div>
                <div className="text-xs font-bold" style={{ color: 'var(--athlon-text)' }}>
                  You have unsaved module configuration changes
                </div>
                <div className="text-[10px]" style={{ color: 'var(--athlon-text-muted)' }}>
                  Click &quot;Save Configuration&quot; to apply your settings globally to all users.
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={() => {
                  if (originalConfig) {
                    setConfig(originalConfig);
                    setHasUnsavedChanges(false);
                  }
                }}
                className="px-3 py-1.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all hover:opacity-80"
                style={{
                  backgroundColor: 'var(--athlon-surface)',
                  borderColor: 'var(--athlon-border)',
                  color: 'var(--athlon-text-muted)',
                }}
              >
                Discard
              </button>
              <button
                onClick={handleSaveChanges}
                disabled={saving}
                className="px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider text-black flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                style={{
                  backgroundColor: 'var(--athlon-primary)',
                }}
              >
                <Save className={`w-3.5 h-3.5 ${saving ? 'animate-spin' : ''}`} />
                <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
              </button>
            </div>
          </div>
        )}

        {/* 3. The Two Core Application Modules */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-0.5">
            <div className="flex items-center gap-1.5">
              <LayoutGrid className="w-4 h-4" style={{ color: 'var(--athlon-primary)' }} />
              <h2
                className="text-xs font-black uppercase tracking-wider"
                style={{ color: 'var(--athlon-text)' }}
              >
                Platform Core Modules
              </h2>
            </div>
            <span
              className="text-[10px] font-bold uppercase tracking-wider"
              style={{ color: 'var(--athlon-text-muted)' }}
            >
              2 Registered Modules
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ─────────────────────────────────────────────────────────────
                MODULE 1: ATHLON TOURNAMENT PLATFORM
                ───────────────────────────────────────────────────────────── */}
            <div
              className={`rounded-2xl border p-4 sm:p-5 flex flex-col justify-between transition-all relative overflow-hidden group shadow-sm ${
                config.athlonActive ? '' : 'opacity-70'
              }`}
              style={{
                backgroundColor: 'var(--athlon-card)',
                borderColor: config.athlonActive ? 'var(--athlon-border)' : 'rgba(239, 68, 68, 0.3)',
              }}
            >
              <div className="space-y-4">
                {/* Top Row: Icon + Module Name + Toggle Switch */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center border shadow-inner group-hover:scale-105 transition-transform"
                      style={{
                        backgroundColor: 'var(--athlon-surface)',
                        borderColor: 'var(--athlon-border)',
                      }}
                    >
                      <Athlon3DIcon type="tournaments" size={32} active={config.athlonActive} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3
                          className="text-base font-black tracking-tight uppercase"
                          style={{ color: 'var(--athlon-text)' }}
                        >
                          Athlon Tournament Platform
                        </h3>
                        {config.defaultMode === 'ATHLON' && (
                          <span
                            className="text-[8.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border"
                            style={{
                              backgroundColor: 'rgba(var(--primary-rgb, 16), 0.1)',
                              borderColor: 'var(--athlon-primary)',
                              color: 'var(--athlon-primary)',
                            }}
                          >
                            Default
                          </span>
                        )}
                      </div>
                      <div
                        className="text-[11px] font-medium"
                        style={{ color: 'var(--athlon-text-muted)' }}
                      >
                        Core Sports &amp; Tournament Hub
                      </div>
                    </div>
                  </div>

                  {/* iOS-style animated toggle switch */}
                  <button
                    type="button"
                    onClick={() => handleToggleModule('ATHLON')}
                    aria-label="Toggle Athlon Platform"
                    className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none shadow-inner ${
                      config.athlonActive ? 'bg-emerald-500' : 'bg-zinc-600/40 dark:bg-zinc-700/60'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        config.athlonActive ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Description */}
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: 'var(--athlon-text-secondary)' }}
                >
                  Governs tournaments, fixtures, multi-category events, live court scoring, athlete profiles, academies, clubs, and venue bookings.
                </p>

                {/* Vertical Pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['Tournaments', 'Fixtures', 'Live Score', 'Academies', 'Clubs', 'Venues'].map((tag) => (
                    <span
                      key={tag}
                      className="text-[9.5px] font-semibold px-2 py-0.5 rounded-md border"
                      style={{
                        backgroundColor: 'var(--athlon-surface)',
                        borderColor: 'var(--athlon-border)',
                        color: 'var(--athlon-text-muted)',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Controls Strip */}
              <div
                className="mt-5 pt-4 border-t flex flex-wrap items-center justify-between gap-2"
                style={{ borderColor: 'var(--athlon-border)' }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      config.athlonActive ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-500'
                    }`}
                  />
                  <span
                    className={`text-[10.5px] font-bold uppercase tracking-wider ${
                      config.athlonActive ? 'text-emerald-500' : 'text-zinc-500'
                    }`}
                  >
                    {config.athlonActive ? 'Module Active' : 'Module Disabled'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {config.athlonActive && config.defaultMode !== 'ATHLON' && (
                    <button
                      onClick={() => handleSelectDefaultMode('ATHLON')}
                      className="text-[10px] font-bold px-2 py-1 rounded-lg border hover:border-primary/50 transition-colors uppercase tracking-wider"
                      style={{
                        backgroundColor: 'var(--athlon-surface)',
                        borderColor: 'var(--athlon-border)',
                        color: 'var(--athlon-text-secondary)',
                      }}
                    >
                      Set as Default
                    </button>
                  )}
                  <Link
                    href="/home"
                    target="_blank"
                    className="text-[10px] font-bold px-2 py-1 rounded-lg border flex items-center gap-1 transition-colors hover:opacity-80"
                    style={{
                      backgroundColor: 'var(--athlon-surface)',
                      borderColor: 'var(--athlon-border)',
                      color: 'var(--athlon-primary)',
                    }}
                  >
                    <span>Test Route</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* ─────────────────────────────────────────────────────────────
                MODULE 2: ATHLON SPORTS MARKETPLACE
                ───────────────────────────────────────────────────────────── */}
            <div
              className={`rounded-2xl border p-4 sm:p-5 flex flex-col justify-between transition-all relative overflow-hidden group shadow-sm ${
                config.marketActive ? '' : 'opacity-70'
              }`}
              style={{
                backgroundColor: 'var(--athlon-card)',
                borderColor: config.marketActive ? 'var(--athlon-border)' : 'rgba(239, 68, 68, 0.3)',
              }}
            >
              <div className="space-y-4">
                {/* Top Row: Icon + Module Name + Toggle Switch */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center border shadow-inner group-hover:scale-105 transition-transform"
                      style={{
                        backgroundColor: 'var(--athlon-surface)',
                        borderColor: 'var(--athlon-border)',
                      }}
                    >
                      <Athlon3DIcon type="inventory" size={32} active={config.marketActive} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3
                          className="text-base font-black tracking-tight uppercase"
                          style={{ color: 'var(--athlon-text)' }}
                        >
                          Athlon Sports Marketplace
                        </h3>
                        {config.defaultMode === 'MARKET' && (
                          <span className="text-[8.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border bg-amber-500/10 border-amber-500/30 text-amber-500">
                            Default
                          </span>
                        )}
                      </div>
                      <div
                        className="text-[11px] font-medium"
                        style={{ color: 'var(--athlon-text-muted)' }}
                      >
                        Pro Shops &amp; Gear Trading Hub
                      </div>
                    </div>
                  </div>

                  {/* iOS-style animated toggle switch */}
                  <button
                    type="button"
                    onClick={() => handleToggleModule('MARKET')}
                    aria-label="Toggle Marketplace Platform"
                    className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none shadow-inner ${
                      config.marketActive ? 'bg-amber-500' : 'bg-zinc-600/40 dark:bg-zinc-700/60'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        config.marketActive ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Description */}
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: 'var(--athlon-text-secondary)' }}
                >
                  Governs verified sports equipment stores, athlete peer-to-peer equipment sales, seller eligibility subscriptions, offer negotiations, and order checkouts.
                </p>

                {/* Vertical Pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['Equipment Pro Shops', 'Buy & Sell', 'Verified Gear', 'Offers & Bids', 'Orders'].map((tag) => (
                    <span
                      key={tag}
                      className="text-[9.5px] font-semibold px-2 py-0.5 rounded-md border"
                      style={{
                        backgroundColor: 'var(--athlon-surface)',
                        borderColor: 'var(--athlon-border)',
                        color: 'var(--athlon-text-muted)',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Controls Strip */}
              <div
                className="mt-5 pt-4 border-t flex flex-wrap items-center justify-between gap-2"
                style={{ borderColor: 'var(--athlon-border)' }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      config.marketActive ? 'bg-amber-500 animate-pulse' : 'bg-zinc-500'
                    }`}
                  />
                  <span
                    className={`text-[10.5px] font-bold uppercase tracking-wider ${
                      config.marketActive ? 'text-amber-500' : 'text-zinc-500'
                    }`}
                  >
                    {config.marketActive ? 'Module Active' : 'Module Disabled'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {config.marketActive && config.defaultMode !== 'MARKET' && (
                    <button
                      onClick={() => handleSelectDefaultMode('MARKET')}
                      className="text-[10px] font-bold px-2 py-1 rounded-lg border hover:border-amber-500/50 transition-colors uppercase tracking-wider"
                      style={{
                        backgroundColor: 'var(--athlon-surface)',
                        borderColor: 'var(--athlon-border)',
                        color: 'var(--athlon-text-secondary)',
                      }}
                    >
                      Set as Default
                    </button>
                  )}
                  <Link
                    href="/market"
                    target="_blank"
                    className="text-[10px] font-bold px-2 py-1 rounded-lg border flex items-center gap-1 transition-colors hover:opacity-80 text-amber-500"
                    style={{
                      backgroundColor: 'var(--athlon-surface)',
                      borderColor: 'var(--athlon-border)',
                    }}
                  >
                    <span>Test Route</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Platform Behavior & Default Landing Controls */}
        <div
          className="rounded-2xl border p-4 sm:p-6 space-y-5 shadow-sm"
          style={{
            backgroundColor: 'var(--athlon-card)',
            borderColor: 'var(--athlon-border)',
          }}
        >
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4" style={{ color: 'var(--athlon-primary)' }} />
            <div>
              <h2
                className="text-xs font-black uppercase tracking-wider"
                style={{ color: 'var(--athlon-text)' }}
              >
                Platform Operational Rules &amp; Landing Mode
              </h2>
              <p
                className="text-[11px]"
                style={{ color: 'var(--athlon-text-muted)' }}
              >
                Controls what users see upon initial visit or sign in
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Option A: Athlon Tournament Hub */}
            <button
              type="button"
              onClick={() => handleSelectDefaultMode('ATHLON')}
              disabled={!config.athlonActive}
              className={`p-4 rounded-xl border text-left transition-all relative ${
                config.defaultMode === 'ATHLON'
                  ? 'ring-2 shadow-md'
                  : 'hover:border-primary/40'
              } ${!config.athlonActive ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
              style={{
                backgroundColor: 'var(--athlon-surface)',
                borderColor: config.defaultMode === 'ATHLON' ? 'var(--athlon-primary)' : 'var(--athlon-border)',
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <div>
                    <div
                      className="text-xs font-black uppercase tracking-wider"
                      style={{ color: 'var(--athlon-text)' }}
                    >
                      Athlon Sports Hub (Default)
                    </div>
                    <div className="text-[10px]" style={{ color: 'var(--athlon-text-muted)' }}>
                      Landing route: <code>/home</code>
                    </div>
                  </div>
                </div>
                {config.defaultMode === 'ATHLON' && (
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-black"
                    style={{ backgroundColor: 'var(--athlon-primary)' }}
                  >
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </div>
              <p
                className="text-[11px] mt-2.5 leading-relaxed"
                style={{ color: 'var(--athlon-text-secondary)' }}
              >
                First-time and unauthenticated visitors will be guided directly to the Sports &amp; Tournament ecosystem.
              </p>
            </button>

            {/* Option B: Sports Marketplace */}
            <button
              type="button"
              onClick={() => handleSelectDefaultMode('MARKET')}
              disabled={!config.marketActive}
              className={`p-4 rounded-xl border text-left transition-all relative ${
                config.defaultMode === 'MARKET'
                  ? 'ring-2 ring-amber-500 shadow-md'
                  : 'hover:border-amber-500/40'
              } ${!config.marketActive ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
              style={{
                backgroundColor: 'var(--athlon-surface)',
                borderColor: config.defaultMode === 'MARKET' ? '#f59e0b' : 'var(--athlon-border)',
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <div
                      className="text-xs font-black uppercase tracking-wider"
                      style={{ color: 'var(--athlon-text)' }}
                    >
                      Sports Marketplace (Default)
                    </div>
                    <div className="text-[10px]" style={{ color: 'var(--athlon-text-muted)' }}>
                      Landing route: <code>/market</code>
                    </div>
                  </div>
                </div>
                {config.defaultMode === 'MARKET' && (
                  <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-black">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </div>
              <p
                className="text-[11px] mt-2.5 leading-relaxed"
                style={{ color: 'var(--athlon-text-secondary)' }}
              >
                First-time visitors will land directly on the equipment shop &amp; player gear trading marketplace.
              </p>
            </button>
          </div>

          {/* Live Navbar Switcher Simulation / Explanation */}
          <div
            className="p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            style={{
              backgroundColor: 'var(--athlon-surface)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <div className="flex items-start gap-2.5 min-w-0">
              <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold" style={{ color: 'var(--athlon-text)' }}>
                  Navbar Mode Switcher Behavior:
                </div>
                <div className="text-[11px] mt-0.5" style={{ color: 'var(--athlon-text-muted)' }}>
                  {config.showModeSwitcher
                    ? 'Both modules are active. The dual-mode switcher pill is automatically visible in the global navigation bar so users can seamlessly toggle between Tournaments and Market.'
                    : `Only ${config.athlonActive ? 'Athlon' : 'Marketplace'} is active. The navbar switcher is automatically hidden and users are locked to the enabled module.`}
                </div>
              </div>
            </div>

            {/* Interactive Simulated Switcher Pill */}
            <div
              className="flex items-center p-1 rounded-xl border self-start sm:self-auto shrink-0 shadow-inner"
              style={{
                backgroundColor: 'var(--athlon-card)',
                borderColor: 'var(--athlon-border)',
              }}
            >
              <div
                className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                  config.defaultMode === 'ATHLON'
                    ? 'bg-primary text-black shadow-sm'
                    : 'text-zinc-400'
                }`}
              >
                Athlon
              </div>
              <div
                className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                  config.defaultMode === 'MARKET'
                    ? 'bg-amber-500 text-black shadow-sm'
                    : 'text-zinc-400'
                }`}
              >
                Market
              </div>
            </div>
          </div>

          {/* Audit Description / Notes */}
          <div className="space-y-1.5 pt-1">
            <label
              htmlFor="configDescription"
              className="text-[11px] font-bold uppercase tracking-wider"
              style={{ color: 'var(--athlon-text-muted)' }}
            >
              Governance Notes / Change Audit Trail
            </label>
            <input
              id="configDescription"
              type="text"
              value={config.description || ''}
              onChange={(e) => {
                setConfig((prev) => ({ ...prev, description: e.target.value }));
                setHasUnsavedChanges(true);
              }}
              placeholder="e.g., Global application modules (Athlon & Market)"
              className="w-full px-3 py-2 rounded-xl border text-xs font-medium outline-none transition-colors focus:border-primary"
              style={{
                backgroundColor: 'var(--athlon-surface)',
                borderColor: 'var(--athlon-border)',
                color: 'var(--athlon-text)',
              }}
            />
          </div>
        </div>

        {/* 5. Sticky Bottom Action Toolbar (Desktop Only) */}
        <div
          className="fixed bottom-0 inset-x-0 z-40 p-3 sm:p-4 border-t backdrop-blur-xl flex items-center justify-between shadow-2xl"
          style={{
            backgroundColor: 'var(--athlon-surface)',
            borderColor: 'var(--athlon-border)',
          }}
        >
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                hasUnsavedChanges ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
              }`}
            />
            <span
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: 'var(--athlon-text)' }}
            >
              {hasUnsavedChanges ? 'Unsaved Modifications' : 'Configuration in Sync'}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {hasUnsavedChanges && (
              <button
                onClick={() => {
                  if (originalConfig) {
                    setConfig(originalConfig);
                    setHasUnsavedChanges(false);
                  }
                }}
                className="px-3 py-2 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all hover:opacity-80"
                style={{
                  backgroundColor: 'var(--athlon-card)',
                  borderColor: 'var(--athlon-border)',
                  color: 'var(--athlon-text-muted)',
                }}
              >
                Reset Form
              </button>
            )}

            <button
              onClick={handleSaveChanges}
              disabled={saving || !hasUnsavedChanges}
              className="px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-black flex items-center gap-2 shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: 'var(--athlon-primary)',
              }}
            >
              <Save className={`w-4 h-4 ${saving ? 'animate-spin' : ''}`} />
              <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
