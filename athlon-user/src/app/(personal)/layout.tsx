'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Trophy,
  Activity,
  Bell,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Radio,
  Sparkles,
  Shield,
  PanelLeftClose,
  PanelLeftOpen,
  Layers,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { usePracticeMatchStore } from '@/lib/store/usePracticeMatchStore';
import ContextSwitcher from '@/components/ContextSwitcher';
import { Athlon3DIcon } from '@/components/common/Athlon3DIcon';

export default function PersonalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { logout, isAuthenticated } = useAuthStore();
  const { personalProfile } = useWorkspaceStore();
  const { records } = usePracticeMatchStore();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('athlon_sidebar_collapsed');
    if (saved !== null) {
      setIsSidebarCollapsed(saved === 'true');
    }
  }, []);

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('athlon_sidebar_collapsed', String(next));
      return next;
    });
  };

  const activeMatches = records.filter((r) => r.status === 'live');
  const hasLiveMatch = activeMatches.length > 0;

  useEffect(() => {
    const handleScroll = () => {
      if (isMenuOpen) setIsMenuOpen(false);
    };

    if (isMenuOpen) {
      window.addEventListener('scroll', handleScroll, { passive: true, capture: true });
      window.addEventListener('touchmove', handleScroll, { passive: true, capture: true });
    }

    return () => {
      window.removeEventListener('scroll', handleScroll, { capture: true });
      window.removeEventListener('touchmove', handleScroll, { capture: true });
    };
  }, [isMenuOpen]);

  const navSections = [
    {
      title: 'Navigation',
      items: [
        { name: 'Dashboard', href: '/home', icon: Home, badge: null },
        { name: 'My Events', href: '/home/tournaments', icon: Trophy, badge: null },
        { name: 'Live Scores', href: '/live-score', icon: Radio, badge: 'Live', isLive: true },
      ],
    },
    {
      title: 'Athlete Hub',
      items: [
        // { name: 'Rankings', href: '/home/rankings', icon: TrendingUp, badge: null }, // Commented out for now
        { name: 'My Matches', href: '/home/matches', icon: Layers, badge: null },
        { name: 'Alerts', href: '/home/notifications', icon: Bell, badge: null },
        { name: 'My Profile', href: '/profile', icon: User, badge: null },
      ],
    },
  ];

  // Dynamic destination URLs depending on whether the user is logged in
  const isAuth = mounted && isAuthenticated;
  const homeHref = isAuth ? '/home' : '/';
  const eventsHref = isAuth ? '/home/tournaments' : '/tournaments';
  const alertsHref = isAuth ? '/home/notifications' : '/login?redirect=/home/notifications';
  const profileHref = isAuth ? '/profile' : '/login?redirect=/profile';

  const isHomeActive = isAuth ? pathname === '/home' : pathname === '/';
  const isEventsActive =
    pathname === eventsHref ||
    pathname.startsWith('/home/tournaments') ||
    pathname.startsWith('/home/team-championship') ||
    pathname.startsWith('/tournaments');
  const isAlertsActive = pathname === '/home/notifications';
  const isProfileActive = pathname === '/profile';

  const hideBottomNav =
    (pathname.startsWith('/home/tournaments/') && pathname !== '/home/tournaments') ||
    (pathname.startsWith('/home/team-championship/') && pathname !== '/home/team-championship') ||
    (pathname.startsWith('/live-score/') && pathname !== '/live-score') ||
    pathname.startsWith('/setup-workspace');

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* ══════════════════════════════════════════════════════════════════════
          DESKTOP SIDEBAR (Collapsible, Stylish, No Logo Image)
         ══════════════════════════════════════════════════════════════════════ */}
      {mounted && isAuthenticated && (
        <aside
          className={`hidden md:flex flex-col h-full border-r relative z-40 transition-all duration-300 ease-in-out select-none shadow-2xl ${
            isSidebarCollapsed ? 'w-20' : 'w-72'
          }`}
          style={{
            backgroundColor: 'var(--athlon-sidebar)',
            borderColor: 'var(--athlon-border)',
          }}
        >
          {/* Header Strip with Athlon Brand Emblem & Collapse Toggle */}
          <div
            className={`p-4 border-b flex items-center transition-all ${
              isSidebarCollapsed ? 'justify-center flex-col gap-3 px-2' : 'justify-between'
            }`}
            style={{ borderColor: 'var(--athlon-border)' }}
          >
            {!isSidebarCollapsed ? (
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-black text-sm shrink-0 shadow-md shadow-primary/20 bg-primary"
                >
                  <Shield className="w-5 h-5 fill-black text-black" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-black tracking-wider uppercase text-foreground leading-none">
                    ATHLON
                  </div>
                  <div className="text-[10px] font-bold text-primary tracking-widest uppercase mt-0.5">
                    SPORTS HUB
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-black text-sm shadow-md shadow-primary/20 bg-primary"
                title="Athlon Sports"
              >
                <Shield className="w-5 h-5 fill-black text-black" />
              </div>
            )}

            {/* Toggle Button */}
            <button
              onClick={toggleSidebar}
              title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              className="p-2 rounded-xl border text-foreground/60 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
              style={{ borderColor: 'var(--athlon-border)' }}
            >
              {isSidebarCollapsed ? (
                <PanelLeftOpen className="w-4 h-4 text-primary" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Workspace Switcher (Expanded only, or compact avatar in collapsed) */}
          {!isSidebarCollapsed ? (
            <div className="px-4 pt-4 pb-2">
              <ContextSwitcher />
            </div>
          ) : (
            <div className="p-3 border-b flex justify-center" style={{ borderColor: 'var(--athlon-border)' }}>
              <div
                className="w-10 h-10 rounded-xl overflow-hidden border flex items-center justify-center bg-black/40 shadow-inner"
                style={{ borderColor: 'var(--athlon-border)' }}
                title={personalProfile?.name || 'Personal Space'}
              >
                <img
                  src={personalProfile?.avatar || '/placeholder.png'}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Navigation Items */}
          <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto hide-scrollbar">
            {navSections.map((section, idx) => (
              <div key={idx} className="space-y-1.5">
                {!isSidebarCollapsed && (
                  <div className="px-3 text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-2">
                    {section.title}
                  </div>
                )}

                {section.items.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/home' && pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      title={isSidebarCollapsed ? item.name : undefined}
                      className={`flex items-center rounded-2xl transition-all font-bold text-xs group relative ${
                        isSidebarCollapsed
                          ? 'justify-center p-3.5'
                          : 'justify-between px-3.5 py-3'
                      } ${
                        isActive
                          ? 'bg-primary/15 text-primary border border-primary/30 shadow-md shadow-primary/5 font-black'
                          : 'text-foreground/70 hover:text-foreground hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon
                          className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                            isActive ? 'text-primary' : 'text-foreground/60'
                          }`}
                        />
                        {!isSidebarCollapsed && <span>{item.name}</span>}
                      </div>

                      {!isSidebarCollapsed && item.badge && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                            item.isLive
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'
                              : 'bg-primary/10 text-primary border border-primary/20'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}

                      {isSidebarCollapsed && isActive && (
                        <div className="absolute right-1 top-1/2 -translate-y-1/2 w-1 h-5 rounded-full bg-primary" />
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* User Footer Profile & Logout */}
          <div
            className={`p-3 border-t flex items-center ${
              isSidebarCollapsed ? 'flex-col gap-3 justify-center' : 'justify-between gap-3'
            }`}
            style={{
              backgroundColor: 'var(--athlon-sidebar)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            {!isSidebarCollapsed && (
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="w-9 h-9 rounded-xl overflow-hidden border bg-black/40 flex items-center justify-center shrink-0" style={{ borderColor: 'var(--athlon-border)' }}>
                  <img
                    src={personalProfile?.avatar || '/placeholder.png'}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-black text-foreground truncate">
                    {personalProfile?.name || 'Athlete'}
                  </div>
                  <div className="text-[10px] font-mono text-primary truncate">1200 Rating</div>
                </div>
              </div>
            )}

            <button
              onClick={() => {
                logout();
                window.location.href = '/';
              }}
              title="Logout"
              className={`rounded-xl border text-foreground/50 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/30 active:scale-95 transition-all flex items-center justify-center ${
                isSidebarCollapsed ? 'p-2.5 w-full' : 'p-2'
              }`}
              style={{ borderColor: 'var(--athlon-border)' }}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <main className={`flex-1 overflow-auto bg-background md:pb-0 ${hideBottomNav ? 'pb-0' : 'pb-16'}`}>{children}</main>

      {/* Mobile Bottom Nav */}
      {!hideBottomNav && (
        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 h-20 backdrop-blur-xl border-t z-40 px-5 flex items-center justify-between max-w-lg mx-auto"
          style={{ backgroundColor: 'var(--athlon-navigation)', borderColor: 'var(--athlon-border)' }}
        >
        <Link
          href={homeHref}
          className={`flex flex-col items-center gap-0.5 w-16 group transition-opacity ${
            isHomeActive ? 'opacity-100' : 'opacity-80 hover:opacity-100'
          }`}
        >
          <Athlon3DIcon type="home" size={32} active={isHomeActive} />
          <span
            className={`text-[9.5px] font-bold leading-tight ${isHomeActive ? 'text-primary' : ''}`}
            style={{ color: isHomeActive ? undefined : 'var(--athlon-text-muted)' }}
          >
            Home
          </span>
        </Link>

        <Link
          href={eventsHref}
          className={`flex flex-col items-center gap-0.5 w-16 group transition-opacity ${
            isEventsActive ? 'opacity-100' : 'opacity-80 hover:opacity-100'
          }`}
        >
          <Athlon3DIcon type="tournaments" size={32} active={isEventsActive} />
          <span
            className={`text-[9.5px] font-bold leading-tight ${isEventsActive ? 'text-primary' : ''}`}
            style={{ color: isEventsActive ? undefined : 'var(--athlon-text-muted)' }}
          >
            Events
          </span>
        </Link>

        {/* 3D Circular Elevated Umpire Button */}
        <div className="relative -top-5 flex items-center justify-center">
          <Link
            href="/practice"
            className="w-[60px] h-[60px] rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all border-[3.5px] group relative overflow-hidden shadow-2xl"
            style={{
              backgroundColor: 'var(--athlon-primary)',
              borderColor: 'var(--athlon-navigation)',
              boxShadow: hasLiveMatch
                ? '0 10px 28px rgba(239, 68, 68, 0.7), inset 0 2px 4px rgba(255,255,255,0.45), inset 0 -3px 6px rgba(0,0,0,0.3)'
                : '0 10px 25px -2px var(--athlon-primary-glow), 0 4px 12px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.45), inset 0 -3px 6px rgba(0,0,0,0.3)',
            }}
          >
            {/* 3D Glass Specular Reflection Arc */}
            <div className="absolute inset-x-1 top-0 h-[45%] rounded-t-full bg-gradient-to-b from-white/40 via-white/10 to-transparent pointer-events-none" />

            <img
              src="/umpire.png"
              alt="Umpire"
              className="w-8 h-8 object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.45)] relative z-10 transition-transform group-hover:scale-110 group-active:scale-95"
            />

            {hasLiveMatch && (
              <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-red-500 border-2 border-background animate-ping z-20" />
            )}
            {hasLiveMatch && (
              <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-red-500 border-2 border-background z-20" />
            )}
          </Link>
        </div>

        <Link
          href="/live-score"
          className={`flex flex-col items-center gap-0.5 w-16 group transition-opacity ${
            pathname.startsWith('/live-score') ? 'opacity-100' : 'opacity-80 hover:opacity-100'
          }`}
        >
          <Athlon3DIcon type="live-score" size={32} active={pathname.startsWith('/live-score')} />
          <span
            className={`text-[9.5px] font-bold leading-tight ${pathname.startsWith('/live-score') ? 'text-red-400' : ''}`}
            style={{ color: pathname.startsWith('/live-score') ? undefined : 'var(--athlon-text-muted)' }}
          >
            Live
          </span>
        </Link>

        <Link
          href={profileHref}
          className={`flex flex-col items-center gap-0.5 w-16 group transition-opacity ${
            isProfileActive ? 'opacity-100' : 'opacity-80 hover:opacity-100'
          }`}
        >
          <Athlon3DIcon type="profile" size={32} active={isProfileActive} />
          <span
            className={`text-[9.5px] font-bold leading-tight ${isProfileActive ? 'text-primary' : ''}`}
            style={{ color: isProfileActive ? undefined : 'var(--athlon-text-muted)' }}
          >
            Profile
          </span>
        </Link>
      </nav>
      )}
    </div>
  );
}
