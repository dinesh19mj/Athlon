'use client';

import React from 'react';
import type { AthlonTheme } from '@/config/theme';
import { Trophy, Activity, Check } from 'lucide-react';

interface ThemePreviewProps {
  theme: AthlonTheme;
  isSelected?: boolean;
}

export function ThemePreview({ theme, isSelected }: ThemePreviewProps) {
  const c = theme.colors;

  return (
    <div
      style={{
        backgroundColor: c.card,
        borderColor: isSelected ? c.primary : c.border,
        boxShadow: isSelected ? `0 0 20px ${c.glow}` : 'none',
      }}
      className="relative rounded-2xl p-4 border transition-all duration-300 overflow-hidden"
    >
      {/* Selected indicator strip */}
      {isSelected && (
        <div
          className="absolute top-0 left-0 right-0 h-0.5"
          style={{ background: `linear-gradient(90deg, transparent, ${c.primary}, transparent)` }}
        />
      )}

      {/* Theme name + swatch + checkmark */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-full shadow-sm"
            style={{ backgroundColor: c.primary, boxShadow: `0 0 8px ${c.primaryGlow}` }}
          />
          <span className="text-sm font-bold tracking-tight" style={{ color: c.text }}>
            {theme.name}
          </span>
        </div>
        {isSelected && (
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-black shadow-sm"
            style={{ backgroundColor: c.primary, color: c.primaryForeground }}
          >
            <Check className="w-3.5 h-3.5" />
          </div>
        )}
      </div>

      {/* Mini Mock Interface */}
      <div
        className="rounded-xl p-3 space-y-2.5"
        style={{ backgroundColor: c.surface, border: `1px solid ${c.borderSubtle}` }}
      >
        {/* Mock card row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-3.5 h-3.5" style={{ color: c.icon }} />
            <span className="text-[11px] font-semibold truncate max-w-[90px]" style={{ color: c.textSecondary }}>
              Championship
            </span>
          </div>
          {/* Live — always red */}
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1"
            style={{ backgroundColor: 'rgba(255,69,58,0.15)', color: '#FF453A', border: '1px solid rgba(255,69,58,0.3)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF453A] animate-pulse inline-block" />
            LIVE
          </span>
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[9px]" style={{ color: c.textMuted }}>
            <span>Win Rate</span>
            <span style={{ color: c.primary }} className="font-bold">78%</span>
          </div>
          <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: c.cardElevated }}>
            <div className="h-full rounded-full" style={{ width: '78%', backgroundColor: c.primary }} />
          </div>
        </div>

        {/* Mock CTA */}
        <div
          className="w-full py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 select-none"
          style={{ backgroundColor: c.primary, color: c.primaryForeground }}
        >
          <Activity className="w-3 h-3" />
          Register Now
        </div>
      </div>

      {/* Description */}
      {theme.description && (
        <p className="text-[10px] mt-2 truncate" style={{ color: c.textMuted }}>
          {theme.description}
        </p>
      )}
    </div>
  );
}
