'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import {
  Trophy,
  ShieldCheck,
  Building2,
  GraduationCap,
  ArrowLeft,
  Zap,
} from 'lucide-react';
import { Athlon3DIcon } from '@/components/common/Athlon3DIcon';
import { AuthCard } from '@/components/auth/AuthCard';

export default function LoginPage() {
  return (
    <div className="h-screen h-[100dvh] max-h-[100dvh] overflow-hidden flex flex-col lg:flex-row bg-background text-foreground selection:bg-primary/30 relative">
      {/* Ambient Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[340px] h-[340px] md:w-[500px] md:h-[500px] bg-primary/15 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute top-1/3 -right-24 w-72 h-72 bg-primary/10 rounded-full blur-[90px]" />
      </div>

      {/* Left side: Branding / Live Sports Experience (Desktop only, hidden on mobile) */}
      <div
        className="hidden lg:flex lg:w-5/12 h-full relative flex-col justify-between p-8 xl:p-12 overflow-hidden border-r z-10"
        style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
      >
        {/* Ambient Top Glow & Geometry Pattern */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute -top-20 -left-20 w-80 h-80 bg-primary/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-10 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-[90px]" />
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
              backgroundSize: '36px 36px',
            }}
          />
        </div>

        {/* 1. Brand Header */}
        <div className="relative z-10 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-primary group-hover:scale-105 transition-transform shadow-lg"
              style={{
                backgroundColor: 'var(--athlon-card)',
                border: '1px solid var(--athlon-border)',
                boxShadow: '0 0 20px var(--athlon-primary-soft)',
              }}
            >
              <Trophy className="w-5 h-5 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-foreground leading-none">
                ATHLON
              </span>
              <span
                className="text-[10px] font-mono font-bold tracking-widest uppercase leading-tight mt-0.5"
                style={{ color: 'var(--athlon-primary)' }}
              >
                Sports Platform
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-bold text-foreground/60 hover:text-foreground px-3 py-1.5 rounded-xl border border-transparent hover:border-foreground/10 hover:bg-white/5 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* 2. Hero Content */}
        <div className="relative z-10 max-w-lg space-y-6 my-auto py-6">
          {/* Athletic Headline */}
          <h1 className="text-4xl xl:text-5xl font-black text-foreground leading-[1.15] tracking-tight uppercase">
            The Sports Platform,{' '}
            <span className="bg-gradient-to-r from-primary via-emerald-400 to-amber-400 bg-clip-text text-transparent">
              Elevated.
            </span>
          </h1>

          <p className="text-sm xl:text-base text-foreground/70 leading-relaxed font-medium">
            Book top venues, manage coaching academies, run championships with real-time digital umpiring, and track athlete ratings on a unified platform.
          </p>

          {/* 4 Core Pillars Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <div
              className="p-3 rounded-2xl border flex items-center gap-2.5 shadow-xs transition-all hover:bg-white/[0.02]"
              style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
            >
              <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-black text-foreground truncate">Venues &amp; Turfs</div>
                <div className="text-[10.5px] text-foreground/50 truncate">Real-time Slot Booking</div>
              </div>
            </div>

            <div
              className="p-3 rounded-2xl border flex items-center gap-2.5 shadow-xs transition-all hover:bg-white/[0.02]"
              style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <Trophy className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-black text-foreground truncate">Tournaments</div>
                <div className="text-[10.5px] text-foreground/50 truncate">Live Digital Scoring</div>
              </div>
            </div>

            <div
              className="p-3 rounded-2xl border flex items-center gap-2.5 shadow-xs transition-all hover:bg-white/[0.02]"
              style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
            >
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-black text-foreground truncate">Academies</div>
                <div className="text-[10.5px] text-foreground/50 truncate">Rosters &amp; Fee Ledgers</div>
              </div>
            </div>

            <div
              className="p-3 rounded-2xl border flex items-center gap-2.5 shadow-xs transition-all hover:bg-white/[0.02]"
              style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
            >
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-black text-foreground truncate">Live Auctions</div>
                <div className="text-[10.5px] text-foreground/50 truncate">Player Bidding Console</div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Branded Footer */}
        <div
          className="relative z-10 pt-4 border-t flex items-center justify-between text-xs text-foreground/50"
          style={{ borderColor: 'var(--athlon-border)' }}
        >
          <span>© 2026 Athlon Sports Platform</span>
          <span className="flex items-center gap-1.5 font-bold text-foreground/70">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span>Encrypted &amp; Verified</span>
          </span>
        </div>
      </div>

      {/* Right side: Login / Create Account Card (Unified Image 1 & 2 design) */}
      <div className="w-full lg:w-7/12 h-full flex items-center justify-center px-4 py-4 sm:px-8 pb-20 lg:pb-0 relative z-10 overflow-y-auto safe-area-top">
        <Suspense
          fallback={
            <div className="w-full max-w-[440px] flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          }
        >
          <AuthCard defaultMode="login" />
        </Suspense>
      </div>

      {/* Floating Bottom Navigation Bar (Consistent with Mobile Experience) */}
      <nav
        className="fixed bottom-0 inset-x-0 h-16 backdrop-blur-xl border-t z-50 px-4 flex items-center justify-around max-w-lg mx-auto lg:hidden fixed-bottom-nav"
        style={{
          backgroundColor: 'var(--athlon-navigation)',
          borderColor: 'var(--athlon-border)',
          transform: 'translate3d(0, 0, 0)',
          WebkitTransform: 'translate3d(0, 0, 0)',
        }}
      >
        <Link href="/" className="flex flex-col items-center gap-0.5 w-14 group opacity-80 hover:opacity-100 transition-opacity">
          <Athlon3DIcon type="home" size={26} active={false} />
          <span className="text-[10px] font-bold leading-tight" style={{ color: 'var(--athlon-text-muted)' }}>
            Home
          </span>
        </Link>

        <Link href="/tournaments" className="flex flex-col items-center gap-0.5 w-14 group opacity-80 hover:opacity-100 transition-opacity">
          <Athlon3DIcon type="tournaments" size={26} active={false} />
          <span className="text-[10px] font-bold leading-tight" style={{ color: 'var(--athlon-text-muted)' }}>
            Events
          </span>
        </Link>

        {/* 3D Circular Elevated Umpire Button */}
        <div className="relative -top-4 flex items-center justify-center">
          <Link
            href="/practice"
            className="w-[52px] h-[52px] rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all border-[3px] group relative overflow-hidden shadow-xl"
            style={{
              backgroundColor: 'var(--athlon-primary)',
              borderColor: 'var(--athlon-navigation)',
              boxShadow: '0 8px 20px -2px var(--athlon-primary-glow), 0 4px 10px rgba(0,0,0,0.5)',
            }}
          >
            <div className="w-7 h-7 flex items-center justify-center">
              <Athlon3DIcon type="umpire" size={28} />
            </div>
          </Link>
        </div>

        <Link href="/live-score" className="flex flex-col items-center gap-0.5 w-14 group opacity-80 hover:opacity-100 transition-opacity">
          <Athlon3DIcon type="livestream" size={26} active={false} />
          <span className="text-[10px] font-bold leading-tight" style={{ color: 'var(--athlon-text-muted)' }}>
            Live
          </span>
        </Link>

        <Link href="/login" className="flex flex-col items-center gap-0.5 w-14 group opacity-100 transition-opacity">
          <Athlon3DIcon type="profile" size={26} active={true} />
          <span className="text-[10px] font-bold leading-tight text-primary">
            Sign In
          </span>
        </Link>
      </nav>
    </div>
  );
}
