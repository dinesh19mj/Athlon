'use client';

import React from 'react';
import { useAthlonTheme } from '@/hooks/use-athlon-theme';
import {
  Palette,
  Layers,
  Sparkles,
  Check,
  RotateCcw,
  Trophy,
  Activity,
  Flame,
  Shield,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import type { AthlonTheme } from '@/config/theme';
import { Athlon3DIcon } from '@/components/common/Athlon3DIcon';

interface ThemeSelectorProps {
  className?: string;
  showPreviews?: boolean;
}

export function ThemeSelector({ className = '' }: ThemeSelectorProps) {
  const { theme: currentTheme, themeKey, setTheme, availableThemes, iconStyle, setIconStyle } = useAthlonTheme();
  const c = currentTheme.colors;

  const handleResetDefault = () => {
    setTheme('algae');
    setIconStyle('2d');
  };

  const isDefault = themeKey === 'algae' && iconStyle === '2d';

  return (
    <div className={`space-y-5 select-none ${className}`}>

      {/* ─── 1. LIVE STUDIO SIMULATOR (Real-Time Interactive Preview Stage) ─── */}
      <div
        className="rounded-[24px] p-4 sm:p-5 border relative overflow-hidden backdrop-blur-xl shadow-2xl transition-all duration-300"
        style={{
          backgroundColor: c.card,
          borderColor: c.borderStrong,
          boxShadow: `0 12px 36px -10px rgba(0,0,0,0.7), 0 0 24px -6px ${c.glow}`,
        }}
      >
        {/* Dynamic Theme Glow Halos */}
        <div
          className="absolute -right-12 -top-12 w-44 h-44 rounded-full blur-3xl pointer-events-none opacity-35 transition-all duration-500"
          style={{ backgroundColor: c.primary }}
        />
        <div
          className="absolute -left-12 -bottom-12 w-44 h-44 rounded-full blur-3xl pointer-events-none opacity-20 transition-all duration-500"
          style={{ backgroundColor: c.primary }}
        />

        {/* Live Simulator Header */}
        <div className="flex items-center justify-between gap-2 pb-3 mb-3.5 border-b border-white/[0.08] relative z-10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: c.primary }} />
            <span className="text-[10.5px] font-mono font-black uppercase tracking-widest" style={{ color: c.primary }}>
              LIVE THEME PREVIEW
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/5 border border-white/10" style={{ color: c.textSecondary }}>
              {currentTheme.name}
            </span>
            <span className="text-[9.5px] font-mono uppercase px-1.5 py-0.5 rounded-md border" style={{ backgroundColor: `${c.primary}15`, borderColor: `${c.primary}40`, color: c.primary }}>
              {iconStyle.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Live Mockup Elements (Robust 2-Column Equal Grid for Desktop & Mobile) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 items-stretch relative z-10">

          {/* Card 1: Live Mini Tournament Match Card */}
          <div
            className="rounded-2xl p-3.5 sm:p-4 border flex flex-col justify-between gap-3.5 shadow-inner h-full"
            style={{
              backgroundColor: c.surface,
              borderColor: c.border,
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-sm"
                  style={{ backgroundColor: c.card, borderColor: c.border }}
                >
                  <Athlon3DIcon type="tournaments" size={24} active={true} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-black truncate" style={{ color: c.text }}>
                    State Championship 2026
                  </div>
                  <div className="text-[10.5px] font-semibold truncate" style={{ color: c.textMuted }}>
                    Main Arena · Court 1
                  </div>
                </div>
              </div>

              {/* Live Match Pill */}
              <span className="shrink-0 text-[8.5px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                Live
              </span>
            </div>

            {/* Dynamic Progress Indicator */}
            <div className="space-y-1.5 bg-black/20 p-2.5 rounded-xl border border-white/[0.04]">
              <div className="flex justify-between text-[10px] font-bold">
                <span style={{ color: c.textMuted }}>Tournament Progression</span>
                <span style={{ color: c.primary }} className="font-mono font-extrabold">78%</span>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden bg-black/40 border border-white/5">
                <div
                  className="h-full rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: '78%', backgroundColor: c.primary, boxShadow: `0 0 10px ${c.primaryGlow}` }}
                />
              </div>
            </div>

            {/* Live Interactive CTA Button */}
            <div
              className="w-full py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-transform active:scale-95"
              style={{
                backgroundColor: c.primary,
                color: c.primaryForeground,
                boxShadow: `0 4px 14px ${c.primaryGlow}`,
              }}
            >
              <span>View Match Center</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 2: Live Navigation Dock Simulator */}
          <div
            className="rounded-2xl p-3.5 sm:p-4 border flex flex-col justify-between gap-3.5 shadow-inner h-full"
            style={{
              backgroundColor: c.surface,
              borderColor: c.border,
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-extrabold uppercase tracking-wider" style={{ color: c.textMuted }}>
                Dock &amp; Navigation Simulator
              </span>
              <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-white/5 text-white/60">
                {iconStyle === '2d' ? '2D Vector' : '3D Isometric'}
              </span>
            </div>

            {/* 4-Tab Equal Grid Dock (Never Wraps or Squishes) */}
            <div
              className="rounded-xl p-2.5 border shadow-inner grid grid-cols-4 items-center justify-items-center gap-1"
              style={{
                backgroundColor: c.navigationBackground,
                borderColor: c.border,
              }}
            >
              {/* Tab 1 */}
              <div className="flex flex-col items-center justify-center gap-0.5 w-full">
                <Athlon3DIcon type="home" size={22} active={true} />
                <span className="text-[8.5px] font-extrabold whitespace-nowrap" style={{ color: c.primary }}>Home</span>
              </div>

              {/* Tab 2 */}
              <div className="flex flex-col items-center justify-center gap-0.5 w-full opacity-60">
                <Athlon3DIcon type="tournaments" size={22} active={false} />
                <span className="text-[8.5px] font-bold whitespace-nowrap" style={{ color: c.textMuted }}>Events</span>
              </div>

              {/* Tab 3: Elevated Center Umpire 3D */}
              <div className="flex flex-col items-center justify-center w-full">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center border shadow-md"
                  style={{
                    backgroundColor: c.primary,
                    borderColor: c.navigationBackground,
                  }}
                >
                  <img src="/umpire.png" alt="Umpire" className="w-4.5 h-4.5 object-contain" />
                </div>
              </div>

              {/* Tab 4 */}
              <div className="flex flex-col items-center justify-center gap-0.5 w-full opacity-60">
                <Athlon3DIcon type="profile" size={22} active={false} />
                <span className="text-[8.5px] font-bold whitespace-nowrap" style={{ color: c.textMuted }}>Profile</span>
              </div>
            </div>

            {/* Theme Telemetry Details Pill */}
            <div
              className="p-2.5 rounded-xl border flex items-center justify-between text-xs"
              style={{ backgroundColor: c.card, borderColor: c.border }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: c.primary, boxShadow: `0 0 6px ${c.primaryGlow}` }}
                />
                <span className="text-[11px] font-bold truncate" style={{ color: c.text }}>
                  {currentTheme.name}
                </span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/5" style={{ color: c.primary }}>
                Active
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* ─── 2. ICON GRAPHICS MODE SELECTOR (2D vs 3D) ─── */}
      <div
        className="rounded-[22px] p-4 border backdrop-blur-xl"
        style={{
          backgroundColor: c.card,
          borderColor: c.border,
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4" style={{ color: c.primary }} />
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider" style={{ color: c.text }}>
              Icon Graphics
            </h3>
          </div>
          <span className="text-[11px] font-bold" style={{ color: c.textMuted }}>
            Active: <span className="uppercase" style={{ color: c.primary }}>{iconStyle}</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

          {/* 2D Classic Option (Default) */}
          <button
            type="button"
            onClick={() => setIconStyle('2d')}
            className={`p-3.5 rounded-2xl border transition-all text-left relative overflow-hidden flex items-center justify-between cursor-pointer group active:scale-[0.98] ${iconStyle === '2d' ? 'shadow-lg' : 'hover:bg-white/[0.03]'
              }`}
            style={{
              backgroundColor: iconStyle === '2d' ? c.surface : 'transparent',
              borderColor: iconStyle === '2d' ? c.primary : c.border,
              boxShadow: iconStyle === '2d' ? `0 4px 18px -4px ${c.glow}` : 'none',
            }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 transition-transform group-hover:scale-105"
                style={{ backgroundColor: c.card, borderColor: c.border }}
              >
                <Athlon3DIcon type="tournaments" size={26} forceStyle="2d" active={true} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs sm:text-sm font-black" style={{ color: c.text }}>2D Classic</span>
                  <span className="text-[8.5px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-white/10 text-white/70 border border-white/15">Default</span>
                </div>
                <p className="text-[10.5px] font-medium truncate mt-0.5" style={{ color: c.textMuted }}>
                  Minimal flat line vector styling (1.5px)
                </p>
              </div>
            </div>
            {iconStyle === '2d' && (
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 shadow-sm ml-2"
                style={{ backgroundColor: c.primary, color: c.primaryForeground }}
              >
                <Check className="w-3 h-3" strokeWidth={3} />
              </div>
            )}
          </button>

          {/* 3D Isometric Option */}
          <button
            type="button"
            onClick={() => setIconStyle('3d')}
            className={`p-3.5 rounded-2xl border transition-all text-left relative overflow-hidden flex items-center justify-between cursor-pointer group active:scale-[0.98] ${iconStyle === '3d' ? 'shadow-lg' : 'hover:bg-white/[0.03]'
              }`}
            style={{
              backgroundColor: iconStyle === '3d' ? c.surface : 'transparent',
              borderColor: iconStyle === '3d' ? c.primary : c.border,
              boxShadow: iconStyle === '3d' ? `0 4px 18px -4px ${c.glow}` : 'none',
            }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 transition-transform group-hover:scale-105"
                style={{ backgroundColor: c.card, borderColor: c.border }}
              >
                <Athlon3DIcon type="tournaments" size={26} forceStyle="3d" active={true} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs sm:text-sm font-black" style={{ color: c.text }}>3D Isometric</span>
                  <span className="text-[8.5px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">Pro 3D</span>
                </div>
                <p className="text-[10.5px] font-medium truncate mt-0.5" style={{ color: c.textMuted }}>
                  Rich isometric graphics with depth
                </p>
              </div>
            </div>
            {iconStyle === '3d' && (
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 shadow-sm ml-2"
                style={{ backgroundColor: c.primary, color: c.primaryForeground }}
              >
                <Check className="w-3 h-3" strokeWidth={3} />
              </div>
            )}
          </button>

        </div>
      </div>

      {/* ─── 3. ACCENT COLOR PALETTES GRID ─── */}
      <div
        className="rounded-[22px] p-4 border backdrop-blur-xl"
        style={{
          backgroundColor: c.card,
          borderColor: c.border,
        }}
      >
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4" style={{ color: c.primary }} />
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider" style={{ color: c.text }}>
              Theme
            </h3>
          </div>
          <span className="text-[11px] font-bold" style={{ color: c.textMuted }}>
            <span className="font-extrabold" style={{ color: c.primary }}>{currentTheme.name}</span>
          </span>
        </div>

        {/* 6 Theme Cards Grid (1 Clean Row of 6 on Desktop, 3 on Tablet, 2 on Mobile) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
          {availableThemes.map((t: AthlonTheme) => {
            const isSelected = t.key === themeKey;
            const tc = t.colors;

            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTheme(t.key)}
                className={`p-3 rounded-2xl border text-left transition-all duration-200 relative overflow-hidden group active:scale-[0.97] cursor-pointer flex flex-col justify-between gap-3 ${isSelected ? 'shadow-lg ring-1' : 'hover:bg-white/[0.04]'
                  }`}
                style={{
                  backgroundColor: isSelected ? tc.surface : c.surface,
                  borderColor: isSelected ? tc.primary : c.border,
                  outlineColor: tc.primary,
                  boxShadow: isSelected ? `0 6px 20px -4px ${tc.glow}` : 'none',
                }}
              >
                {/* Top: Swatch Orb + Check Icon */}
                <div className="flex items-center justify-between">
                  <div className="relative">
                    <div
                      className="w-7 h-7 rounded-full shadow-md transition-transform duration-200 group-hover:scale-110 flex items-center justify-center"
                      style={{
                        backgroundColor: tc.primary,
                        boxShadow: `0 0 12px ${tc.primaryGlow}`,
                      }}
                    >
                      <div className="w-2.5 h-2.5 rounded-full bg-white/40 blur-[1px]" />
                    </div>
                  </div>

                  {isSelected && (
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shadow-sm"
                      style={{ backgroundColor: tc.primary, color: tc.primaryForeground }}
                    >
                      <Check className="w-3 h-3" strokeWidth={3} />
                    </div>
                  )}
                </div>

                {/* Bottom: Theme Name */}
                <div className="flex items-center justify-between gap-1">
                  <div className="text-xs font-black tracking-tight truncate" style={{ color: c.text }}>
                    {t.name}
                  </div>
                  {t.key === 'algae' && (
                    <span className="text-[8px] font-extrabold uppercase px-1 py-0.5 rounded bg-white/10 text-white/60 shrink-0">
                      Default
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── 4. SUMMARY & RESET FOOTER ─── */}
      <div className="flex items-center justify-between pt-1 text-xs px-1">
        <div className="flex items-center gap-1.5 text-foreground/50">
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.primary }} />
          <span>Theme changes are applied in real-time across your workspace.</span>
        </div>

        {!isDefault && (
          <button
            type="button"
            onClick={handleResetDefault}
            className="flex items-center gap-1 font-bold text-foreground/60 hover:text-primary transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-white/5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
        )}
      </div>

    </div>
  );
}
