'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Shield,
  LayoutDashboard,
  Users,
  Building2,
  Package,
  FileCheck2,
  CreditCard,
  Trophy,
  Dumbbell,
  History,
  BarChart3,
  ArrowLeft,
  LogOut,
  ChevronRight,
  Sparkles,
  Layers,
  Palette,
  SlidersHorizontal,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useAthlonTheme } from '@/hooks/use-athlon-theme';
import { ThemeModal } from '@/components/theme';

interface AdminNavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

interface AdminNavGroup {
  group: string;
  items: AdminNavItem[];
}

const NAV_GROUPS: AdminNavGroup[] = [
  {
    group: 'Overview',
    items: [
      { name: 'Platform Dashboard', href: '/admin', icon: LayoutDashboard },
    ],
  },
  {
    group: 'Directory',
    items: [
      { name: 'Users', href: '/admin/users', icon: Users },
      { name: 'Organizations', href: '/admin/organizations', icon: Building2 },
      { name: 'Tournaments', href: '/admin/tournaments', icon: Trophy },
      { name: 'Sports Catalog', href: '/admin/sports', icon: Dumbbell },
    ],
  },
  {
    group: 'Subscriptions & Billing',
    items: [
      { name: 'Subscription Packages', href: '/admin/subscriptions/plans', icon: Package },
      { name: 'Approval Requests', href: '/admin/subscriptions/requests', icon: FileCheck2 },
      { name: 'Payments Ledger', href: '/admin/payments', icon: CreditCard },
    ],
  },
  {
    group: 'Platform Governance',
    items: [
      { name: 'App Modules', href: '/admin/modules', icon: SlidersHorizontal },
      { name: 'Audit Logs', href: '/admin/audit-logs', icon: History },
      { name: 'Reports & Analytics', href: '/admin/reports', icon: BarChart3 },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, userEmail, role, isSuperAdmin, logout } = useAuthStore();
  const { themeKey, mode, toggleMode } = useAthlonTheme();

  const [mounted, setMounted] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Admin access validation
  const authorized = mounted && isAuthenticated && (role === 'PLATFORM_SUPER_ADMIN' || isSuperAdmin());

  if (mounted && !authorized) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6"
        style={{
          backgroundColor: 'var(--athlon-background)',
          color: 'var(--athlon-text)',
        }}
      >
        <div
          className="max-w-md w-full border rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden"
          style={{
            backgroundColor: 'var(--athlon-card)',
            borderColor: 'var(--athlon-border)',
          }}
        >
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-500 via-amber-500 to-red-500" />
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500">
            <Shield className="w-8 h-8" />
          </div>
          <h2
            className="text-xl font-black uppercase tracking-wider mb-2"
            style={{ color: 'var(--athlon-text)' }}
          >
            Platform Admin Restricted
          </h2>
          <p
            className="text-sm leading-relaxed mb-6"
            style={{ color: 'var(--athlon-text-muted)' }}
          >
            Access to the ATHLON Super Admin module requires verified platform-level credentials (<code className="text-xs px-2 py-0.5 rounded font-mono border" style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)', color: 'var(--athlon-primary)' }}>PLATFORM_SUPER_ADMIN</code>).
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push('/login?redirect=/admin')}
              className="w-full py-3 px-4 rounded-xl font-bold bg-primary text-black hover:opacity-90 transition-all text-sm uppercase tracking-wide shadow-md"
            >
              Sign In with Admin Account
            </button>
            <button
              onClick={() => router.push('/home')}
              className="w-full py-2.5 px-4 rounded-xl font-medium border transition-all text-sm hover:opacity-80"
              style={{
                backgroundColor: 'var(--athlon-surface)',
                borderColor: 'var(--athlon-border)',
                color: 'var(--athlon-text-muted)',
              }}
            >
              Return to Sports Hub
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex flex-col antialiased selection:bg-primary/30"
      style={{
        backgroundColor: 'var(--athlon-background)',
        color: 'var(--athlon-text)',
      }}
    >
      {/* Top Banner / Navbar */}
      <header 
        className="h-16 border-b backdrop-blur-xl sticky top-0 z-50 flex items-center justify-between px-3 sm:px-6 lg:px-8"
        style={{
          backgroundColor: 'var(--athlon-surface)',
          borderColor: 'var(--athlon-border)',
        }}
      >
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link href="/admin" className="flex items-center gap-2 sm:gap-2.5 group min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-primary flex items-center justify-center font-black text-black text-sm shadow-md shadow-primary/20 transition-transform group-hover:scale-105 shrink-0">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 fill-black text-black" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-sm sm:text-base font-black tracking-wider uppercase leading-none truncate">ATHLON</span>
                <span className="text-[9px] sm:text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-primary/15 text-primary border border-primary/30 tracking-widest shrink-0">
                  SUPER ADMIN
                </span>
              </div>
              <span className="text-[9px] sm:text-[10px] font-bold text-muted-foreground tracking-wider uppercase block truncate">Platform Operations</span>
            </div>
          </Link>
        </div>

        {/* Right Header Strip: Return to Hub & User Info */}
        {/* Right Header Strip: Theme Toggle, Return to Hub & User Info */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Theme Selector Trigger */}
          <button
            onClick={() => setIsThemeModalOpen(true)}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border transition-all active:scale-95 shadow-xs flex items-center gap-1.5 shrink-0 hover:opacity-85"
            style={{
              backgroundColor: 'var(--athlon-surface)',
              borderColor: 'var(--athlon-border)',
              color: 'var(--athlon-text)',
            }}
            title="Appearance & Theme"
            aria-label="Theme Selector"
          >
            <Palette className="w-4 h-4" style={{ color: 'var(--athlon-primary)' }} />
            <span className="hidden sm:inline text-xs font-bold" style={{ color: 'var(--athlon-text)' }}>
              Theme
            </span>
          </button>

          <Link
            href="/profile"
            className="flex items-center gap-1.5 sm:gap-2 text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 border border-primary/25 px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors shadow-sm shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Return to Sports Hub</span>
            <span className="sm:hidden text-[11px]">Hub</span>
          </Link>

          <div className="hidden sm:flex items-center gap-2 pl-3 border-l" style={{ borderColor: 'var(--athlon-border)' }}>
            <div className="text-right">
              <div className="text-xs font-bold leading-tight truncate max-w-[150px]" style={{ color: 'var(--athlon-text)' }}>
                {userEmail || 'Admin User'}
              </div>
              <div className="text-[10px] text-primary font-semibold uppercase">Super Admin</div>
            </div>
            <button
              onClick={() => {
                logout();
                router.push('/login');
              }}
              className="p-2 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Administrative Layout with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside 
          className="hidden lg:flex w-64 border-r flex-col justify-between p-4 overflow-y-auto"
          style={{
            backgroundColor: 'var(--athlon-surface)',
            borderColor: 'var(--athlon-border)',
          }}
        >
          <div className="space-y-6">
            {NAV_GROUPS.map((group) => (
              <div key={group.group} className="space-y-1">
                <div className="text-[11px] font-black uppercase tracking-wider text-muted-foreground px-3 mb-2">
                  {group.group}
                </div>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-primary text-black shadow-md shadow-primary/20'
                          : 'text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-muted-foreground'}`} />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-black/30">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="pt-4 border-t text-[11px] text-muted-foreground flex items-center justify-between" style={{ borderColor: 'var(--athlon-border)' }}>
            <span>Platform v1.0</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Gateway
            </span>
          </div>
        </aside>

        {/* Admin Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Appearance & Accent Theme Selector Modal */}
      <ThemeModal open={isThemeModalOpen} onClose={() => setIsThemeModalOpen(false)} />
    </div>
  );
}
