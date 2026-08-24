'use client';

import React from 'react';
import { useAthlonTheme } from '@/hooks/use-athlon-theme';
import { ThemePreview } from './ThemePreview';
import { Palette } from 'lucide-react';
import type { AthlonTheme } from '@/config/theme';

interface ThemeSelectorProps {
  className?: string;
  showPreviews?: boolean;
}

export function ThemeSelector({ className = '', showPreviews = true }: ThemeSelectorProps) {
  const { theme: currentTheme, themeKey, setTheme, availableThemes } = useAthlonTheme();
  const c = currentTheme.colors;

  return (
    <div className={`space-y-6 ${className}`}>

      {/* Accent Theme Selector */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4" style={{ color: c.primary }} />
            <h3 className="text-sm font-black uppercase tracking-wider" style={{ color: c.text }}>
              Accent Theme
            </h3>
          </div>
          <span className="text-xs font-semibold" style={{ color: c.textMuted }}>
            Active: <span className="font-bold" style={{ color: c.primary }}>{currentTheme.name}</span>
          </span>
        </div>

        {/* Theme Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {availableThemes.map((theme: AthlonTheme) => {
            const isSelected = theme.key === themeKey;
            return showPreviews ? (
              <button
                key={theme.key}
                type="button"
                onClick={() => setTheme(theme.key)}
                className="text-left w-full transition-transform active:scale-[0.98] focus:outline-none focus-visible:ring-2 rounded-2xl"
                style={{ outlineColor: c.primary }}
              >
                <ThemePreview theme={theme} isSelected={isSelected} />
              </button>
            ) : (
              <button
                key={theme.key}
                type="button"
                onClick={() => setTheme(theme.key)}
                className="flex items-center justify-between p-4 rounded-2xl border transition-all text-left w-full"
                style={{
                  backgroundColor: isSelected ? theme.colors.card : c.surface,
                  borderColor: isSelected ? theme.colors.primary : c.border,
                  boxShadow: isSelected ? `0 0 16px ${theme.colors.glow}` : 'none',
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-5 h-5 rounded-full shadow-sm"
                    style={{ backgroundColor: theme.colors.primary, boxShadow: `0 0 8px ${theme.colors.primaryGlow}` }}
                  />
                  <div>
                    <div className="text-sm font-bold" style={{ color: c.text }}>{theme.name}</div>
                    {theme.key === 'algae' && (
                      <div className="text-[10px]" style={{ color: c.textMuted }}>Default</div>
                    )}
                  </div>
                </div>
                {isSelected && (
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black"
                    style={{ backgroundColor: theme.colors.primary, color: theme.colors.primaryForeground }}
                  >
                    ✓
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
