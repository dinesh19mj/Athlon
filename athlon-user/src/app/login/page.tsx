'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { Trophy, ShieldCheck } from 'lucide-react';
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

      {/* Left side: Branding/Visuals (Hidden on mobile) */}
      <div
        className="hidden lg:flex lg:w-5/12 h-full relative flex-col justify-between p-10 overflow-hidden border-r z-10"
        style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
      >
        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg">
            <Trophy className="w-5 h-5 text-black" />
          </div>
          <div>
            <Link href="/" className="text-2xl font-black tracking-tight text-foreground flex items-center gap-1.5">
              ATHLON <span className="text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">SPORTS</span>
            </Link>
          </div>
        </div>

        {/* Hero Copy */}
        <div className="relative z-10 max-w-md space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-foreground/5 border border-foreground/10 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_var(--athlon-primary)] animate-ping" />
            <span className="text-xs font-semibold text-foreground/80 tracking-wider uppercase">Live Scoring Platform</span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-black text-foreground leading-tight tracking-tight">
            The tournament experience, <span className="text-primary">elevated.</span>
          </h1>

          <p className="text-sm text-foreground/60 leading-relaxed">
            Join thousands of players and organizers running seamless tournaments, tracking real-time scores, and managing brackets on Athlon.
          </p>

          {/* Feature Highlights */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-foreground/[0.03] border border-foreground/10 backdrop-blur-sm">
              <div className="text-primary font-bold text-base mb-0.5">Real-time</div>
              <div className="text-xs text-foreground/60">Match &amp; Umpire Scoring</div>
            </div>
            <div className="p-3 rounded-xl bg-foreground/[0.03] border border-foreground/10 backdrop-blur-sm">
              <div className="text-primary font-bold text-base mb-0.5">Dynamic</div>
              <div className="text-xs text-foreground/60">Brackets &amp; Leaderboards</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex items-center justify-between text-xs text-foreground/40">
          <span>© 2026 Athlon Sports Platform</span>
          <span className="flex items-center gap-1.5 text-foreground/60">
            <ShieldCheck className="w-4 h-4 text-primary" /> Official Engine
          </span>
        </div>
      </div>

      {/* Right side: Login / Create Account Card (Unified Image 1 & 2 design) */}
      <div className="w-full lg:w-7/12 h-full flex items-center justify-center px-4 py-4 sm:px-8 pb-20 lg:pb-0 relative z-10 overflow-y-auto">
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
