'use client';

import React from 'react';
import Link from 'next/link';
import { Plus, Sparkles } from 'lucide-react';
import { useAthlonTheme } from '@/hooks/use-athlon-theme';

export interface Athlon3DFABProps {
  onClick?: () => void;
  href?: string;
  label?: string;
  icon?: React.ReactNode;
  className?: string;
  title?: string;
  ariaLabel?: string;
  showSparkle?: boolean;
}

export function Athlon3DFAB({
  onClick,
  href,
  label,
  icon,
  className = 'fixed bottom-24 right-5 md:bottom-8 md:right-8 z-40',
  title = 'Add New',
  ariaLabel,
  showSparkle = true,
}: Athlon3DFABProps) {
  let themeMode: 'light' | 'dark' = 'dark';
  try {
    const themeCtx = useAthlonTheme();
    if (themeCtx) {
      themeMode = themeCtx.mode;
    }
  } catch {
    // fallback if outside AthlonThemeProvider
  }

  const resolvedAriaLabel = ariaLabel || label || title;

  const content = (
    <div className={`flex items-center gap-2.5 group ${className}`}>
      {/* Hover Tooltip Label */}
      {label && (
        <span
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-black text-foreground shadow-xl backdrop-blur-md opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-200 pointer-events-none"
          style={{
            backgroundColor: 'var(--athlon-card)',
            borderColor: 'var(--athlon-border)',
          }}
        >
          {showSparkle && <Sparkles className="w-3.5 h-3.5 text-primary" />}
          <span>{label}</span>
        </span>
      )}

      {/* 3D Floating Action Button */}
      <div
        className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 active:scale-95 hover:-translate-y-1 focus:outline-none border-[3.5px] overflow-hidden group/btn"
        style={{
          backgroundColor: 'var(--athlon-primary)',
          borderColor: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.28)' : 'rgba(255, 255, 255, 0.9)',
          boxShadow:
            themeMode === 'dark'
              ? '0 12px 28px -4px var(--athlon-primary-glow), 0 6px 16px rgba(0, 0, 0, 0.75), inset 0 3px 5px rgba(255, 255, 255, 0.5), inset 0 -4px 6px rgba(0, 0, 0, 0.5)'
              : '0 12px 28px -4px var(--athlon-primary-glow), 0 6px 16px rgba(0, 0, 0, 0.18), inset 0 3px 5px rgba(255, 255, 255, 0.9), inset 0 -4px 6px rgba(0, 0, 0, 0.15)',
        }}
        title={title}
        aria-label={resolvedAriaLabel}
      >
        {/* Ambient Glow Aura */}
        <div className="absolute -inset-1 rounded-full bg-primary/30 blur-lg group-hover/btn:bg-primary/55 transition-all" />

        {/* 3D Top Specular Glass Reflection Arc */}
        <div className="absolute inset-x-1 top-0 h-[48%] rounded-t-full bg-gradient-to-b from-white/60 via-white/20 to-transparent pointer-events-none" />

        {/* 3D Upper-Left Specular Glint Spot */}
        <div className="absolute top-2 left-2.5 w-3.5 h-2 rounded-full bg-white/75 rotate-[-35deg] blur-[0.3px] pointer-events-none" />

        {/* 3D Bottom Depth Underside */}
        <div className="absolute inset-x-2 bottom-0.5 h-3 rounded-b-full bg-black/30 blur-[1px] pointer-events-none" />

        {/* Dynamic Icon with 3D Emboss */}
        {icon ? (
          <div
            className="relative z-10 transition-transform duration-300 group-hover/btn:scale-110 flex items-center justify-center text-black"
            style={{
              filter: 'drop-shadow(0 1px 1px rgba(255, 255, 255, 0.45)) drop-shadow(0 -1px 1px rgba(0, 0, 0, 0.35))',
            }}
          >
            {icon}
          </div>
        ) : (
          <Plus
            className="w-7 h-7 sm:w-8 sm:h-8 stroke-[3.5] text-black relative z-10 transition-transform duration-300 group-hover/btn:rotate-90 group-hover/btn:scale-110"
            style={{
              filter: 'drop-shadow(0 1px 1px rgba(255, 255, 255, 0.45)) drop-shadow(0 -1px 1px rgba(0, 0, 0, 0.35))',
            }}
          />
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="focus:outline-none">
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className="focus:outline-none border-0 p-0 bg-transparent">
      {content}
    </button>
  );
}
