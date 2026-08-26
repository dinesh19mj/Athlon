'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Settings, Palette, User, Sparkles } from 'lucide-react';
import { ThemeSelector } from '@/components/theme';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useAthlonTheme } from '@/hooks/use-athlon-theme';

export default function PersonalSettingsPage() {
  const { userEmail } = useAuthStore();
  const { theme } = useAthlonTheme();
  const c = theme.colors;

  return (
    <div className="min-h-screen w-full bg-background text-foreground font-sans pb-24 overflow-y-auto selection:bg-primary selection:text-black">
      {/* Top Sticky Navbar */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-4 sm:px-6 py-4 backdrop-blur-xl border-b"
        style={{
          backgroundColor: 'rgba(10, 15, 29, 0.85)',
          borderColor: 'var(--athlon-border)',
        }}
      >
        <div className="flex items-center gap-3">
          <Link
            href="/profile"
            className="p-2 -ml-2 text-foreground/70 hover:text-primary transition-colors rounded-xl hover:bg-white/5 active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-base sm:text-lg font-black uppercase tracking-wider text-foreground">
              Appearance &amp; Settings
            </h1>
            <span className="text-[10.5px] font-medium text-foreground/40 block -mt-0.5">
              Personal Design Studio
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full shadow-sm"
            style={{ backgroundColor: c.primary, boxShadow: `0 0 10px ${c.primaryGlow}` }}
          />
          <span className="text-xs font-bold text-foreground/70 hidden sm:inline">
            {theme.name}
          </span>
        </div>
      </header>

      {/* Main Single-Page Studio Content */}
      <main className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-in fade-in duration-300">
        
        {/* Studio Subheading */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight flex items-center gap-2.5">
              <Palette className="w-6 h-6 text-primary" /> Appearance Studio
            </h2>
            <p className="text-xs text-foreground/50 mt-0.5">
              Customize your accent color palette and 2D/3D graphics mode in real-time.
            </p>
          </div>
        </div>

        {/* Master Theme & Icon Mode Studio */}
        <ThemeSelector />

        {/* Account Info Pill */}
        <section
          className="rounded-[20px] p-4 border backdrop-blur-md flex items-center justify-between gap-3 shadow-sm"
          style={{
            backgroundColor: c.surface,
            borderColor: c.border,
          }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center border shrink-0"
              style={{ backgroundColor: c.card, borderColor: c.border }}
            >
              <User className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-black text-foreground">Logged-in Account</div>
              <div className="text-[11px] text-foreground/50 truncate font-mono">{userEmail || 'athlete@athlon.com'}</div>
            </div>
          </div>

          <span className="text-[9.5px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
            Active
          </span>
        </section>

      </main>
    </div>
  );
}
