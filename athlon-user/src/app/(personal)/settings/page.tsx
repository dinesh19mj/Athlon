'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Settings, Palette, Bell, ShieldCheck as ShieldAlert, Moon, User } from 'lucide-react';
import { ThemeSelector } from '@/components/theme';
import { useAuthStore } from '@/lib/store/useAuthStore';

export default function PersonalSettingsPage() {
  const { userEmail } = useAuthStore();

  return (
    <div className="min-h-screen w-full bg-background text-foreground font-sans pb-24 overflow-y-auto selection:bg-primary selection:text-black">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-4 bg-background/90 backdrop-blur-md border-b border-foreground/5">
        <div className="flex items-center gap-3">
          <Link href="/profile" className="p-2 -ml-2 text-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-lg font-bold uppercase tracking-wider">Settings</h1>
        </div>
      </header>

      <main className="w-full max-w-2xl mx-auto px-4 flex flex-col gap-6 pt-6 animate-in fade-in duration-300">
        {/* Settings Header */}
        <div>
          <h2 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2.5">
            <Settings className="w-7 h-7 text-primary" /> Application Settings
          </h2>
          <p className="text-xs text-text-muted mt-1">
            Manage your appearance, theme, and account preferences.
          </p>
        </div>

        {/* Appearance & Accent Theme */}
        <section className="bg-surface border border-border rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <Palette className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-black uppercase tracking-wider text-foreground">
              Appearance & Accent Theme
            </h3>
          </div>
          <ThemeSelector showPreviews={true} />
        </section>

        {/* Account Info */}
        <section className="bg-surface border border-border rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <User className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-black uppercase tracking-wider text-foreground">
              Account
            </h3>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <div className="text-sm font-bold text-foreground">Logged in Email</div>
              <div className="text-xs text-text-muted mt-0.5">{userEmail || 'user@athlon.com'}</div>
            </div>
            <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
              Active
            </span>
          </div>
        </section>
      </main>
    </div>
  );
}
