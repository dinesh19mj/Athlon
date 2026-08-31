'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useParams, useRouter } from 'next/navigation';
import {
  Home,
  Trophy,
  CalendarDays,
  Bell,
  User,
  LogOut,
  Menu,
  Settings,
  Activity,
  Users,
  Building,
  MapPin,
  Grid,
  BarChart3,
  CreditCard,
  Video,
  PanelLeftClose,
  PanelLeftOpen,
  Shield,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import ContextSwitcher from '@/components/ContextSwitcher';
import { Athlon3DIcon, Athlon3DIconProps } from '@/components/common/Athlon3DIcon';

function getOrg3DIconType(name: string): Athlon3DIconProps['type'] {
  const n = name.toLowerCase();
  if (n.includes('tournament') || n.includes('event') || n.includes('cup') || n.includes('league')) return 'tournaments';
  if (n.includes('live') || n.includes('stream') || n.includes('broadcast') || n.includes('video')) return 'livestream';
  if (n.includes('student') || n.includes('pupil')) return 'students';
  if (n.includes('coach') || n.includes('trainer')) return 'coaches';
  if (n.includes('member') || n.includes('staff') || n.includes('squad') || n.includes('team')) return 'members';
  if (n.includes('attendance') || n.includes('check-in') || n.includes('roll')) return 'attendance';
  if (n.includes('schedule') || n.includes('calendar') || n.includes('slot') || n.includes('booking')) return 'schedule';
  if (n.includes('performance') || n.includes('telemetry') || n.includes('analytic')) return 'performance';
  if (n.includes('match') || n.includes('fixture') || n.includes('sparring')) return 'matches';
  if (n.includes('setup') || n.includes('console') || n.includes('officiat')) return 'setup';
  if (n.includes('umpire') || n.includes('referee')) return 'umpire';
  if (n.includes('leaderboard') || n.includes('rank') || n.includes('standing') || n.includes('result')) return 'rankings';
  if (n.includes('inventory') || n.includes('equipment') || n.includes('shuttle') || n.includes('gear')) return 'inventory';
  if (n.includes('finance') || n.includes('fee') || n.includes('billing') || n.includes('payout') || n.includes('revenue') || n.includes('card')) return 'finances';
  if (n.includes('facility') || n.includes('infrastructure') || n.includes('district') || n.includes('court') || n.includes('map') || n.includes('venue')) return 'facilities';
  if (n.includes('setting') || n.includes('config')) return 'settings';
  if (n.includes('registration') || n.includes('register') || n.includes('approv') || n.includes('entry') || n.includes('pass')) return 'registered';
  if (n.includes('academ') || n.includes('club')) return 'academies';
  return 'home';
}

export default function OrganizationLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const { logout } = useAuthStore();
  const { activeWorkspaceId, setActiveWorkspace, getActiveOrganization, organizations, personalProfile } =
    useWorkspaceStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const orgId = (params?.orgId as string) || '';
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem('athlon_org_sidebar_collapsed');
    if (saved !== null) {
      setIsSidebarCollapsed(saved === 'true');
    }
  }, []);

  const toggleSidebar = () => {
    const nextState = !isSidebarCollapsed;
    setIsSidebarCollapsed(nextState);
    localStorage.setItem('athlon_org_sidebar_collapsed', String(nextState));
  };

  // Sync route with store on load
  useEffect(() => {
    if (orgId && activeWorkspaceId !== orgId) {
      setActiveWorkspace(orgId);
    }
  }, [orgId, activeWorkspaceId, setActiveWorkspace]);

  // Robust activeOrg resolver: check by URL param, activeWorkspaceId, or default fallback
  const activeOrg =
    organizations.find((o) => o.id === orgId) ||
    getActiveOrganization() ||
    (organizations.length > 0 ? organizations[0] : { id: orgId || 'matrix-org', name: 'Matrix', type: 'ORGANIZER' as const });

  // Close mobile menu on scroll
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

  if (!isMounted) return <div className="h-screen w-full bg-background animate-pulse" />;

  // 1. Original Mobile Navigation Resolver (100% UNTOUCHED)
  const getNavItems = () => {
    const base = [{ name: 'Dashboard', href: `/org/${orgId}/dashboard`, icon: BarChart3 }];

    if (activeOrg.type === 'ORGANIZER') {
      return [
        ...base,
        { name: 'Live Stream', href: `/org/${orgId}/livestream`, icon: Video },
        { name: 'Tournaments', href: `/org/${orgId}/tournaments`, icon: Trophy },
        { name: 'Registrations', href: `/org/${orgId}/registrations`, icon: Users },
        { name: 'Results', href: `/org/${orgId}/results`, icon: Activity },
      ];
    }
    if (activeOrg.type === 'ACADEMY') {
      return [
        ...base,
        { name: 'Students', href: `/org/${orgId}/students`, icon: Users },
        { name: 'Coaches', href: `/org/${orgId}/coaches`, icon: User },
        { name: 'Attendance', href: `/org/${orgId}/attendance`, icon: CalendarDays },
        { name: 'Fees', href: `/org/${orgId}/fees`, icon: CreditCard },
      ];
    }
    if (activeOrg.type === 'ASSOCIATION') {
      return [
        ...base,
        { name: 'Districts', href: `/org/${orgId}/districts`, icon: MapPin },
        { name: 'Academies', href: `/org/${orgId}/academies`, icon: Building },
        { name: 'Approvals', href: `/org/${orgId}/approvals`, icon: Bell },
      ];
    }
    if (activeOrg.type === 'CLUB') {
      return [
        ...base,
        { name: 'Members', href: `/org/${orgId}/members`, icon: Users },
        { name: 'Matches', href: `/org/${orgId}/matches`, icon: Activity },
        { name: 'Attendance', href: `/org/${orgId}/attendance`, icon: CalendarDays },
        { name: 'Inventory', href: `/org/${orgId}/inventory`, icon: Grid },
        { name: 'Finances', href: `/org/${orgId}/finances`, icon: CreditCard },
        { name: 'Analytics', href: `/org/${orgId}/analytics`, icon: TrendingUp },
      ];
    }
    return base;
  };

  const navItems = getNavItems();
  const Icon0 = navItems[0]?.icon;
  const Icon1 = navItems[1]?.icon;
  const Icon2 = navItems[2]?.icon;

  // 2. Desktop Navigation Sections (Structured with categories like Personal Hub)
  const navSections = [
    {
      title: 'Navigation',
      items: [{ name: 'Dashboard', href: `/org/${orgId}/dashboard`, icon: BarChart3, badge: null, isLive: false }],
    },
    {
      title: `${activeOrg.name} Hub`,
      items: navItems.slice(1).map((item) => ({
        ...item,
        badge: item.name === 'Live Stream' ? 'Live' : null,
        isLive: item.name === 'Live Stream',
      })),
    },
    {
      title: 'Settings',
      items: [
        { name: 'Org Profile', href: `/org/${orgId}/profile`, icon: Building, badge: null, isLive: false },
      ],
    },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* ══════════════════════════════════════════════════════════════════════
          DESKTOP SIDEBAR - MATCHING EXACT PERSONAL / USER DASHBOARD DESIGN
         ══════════════════════════════════════════════════════════════════════ */}
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
              <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-black text-sm shrink-0 shadow-md shadow-primary/20 bg-primary">
                <Shield className="w-5 h-5 fill-black text-black" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-black tracking-wider uppercase text-foreground leading-none">
                  ATHLON
                </div>
                <div className="text-[10px] font-bold text-primary tracking-widest uppercase mt-0.5">
                  {activeOrg.type} HUB
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
              title={activeOrg.name}
            >
              {activeOrg.logo ? (
                <img src={activeOrg.logo} alt={activeOrg.name} className="w-full h-full object-cover" />
              ) : (
                <span className="font-black text-xs text-primary">{activeOrg.name.charAt(0)}</span>
              )}
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto hide-scrollbar">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1.5">
              {!isSidebarCollapsed && (
                <div className="px-3 text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-2 truncate">
                  {section.title}
                </div>
              )}

              {section.items.map((item) => {
                const isActive =
                  pathname === item.href || (item.href !== `/org/${orgId}/dashboard` && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    title={isSidebarCollapsed ? item.name : undefined}
                    className={`flex items-center rounded-2xl transition-all font-bold text-xs group relative ${
                      isSidebarCollapsed ? 'justify-center p-3.5' : 'justify-between px-3.5 py-3'
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

        {/* Quick Link to Personal Portal */}
        {!isSidebarCollapsed && (
          <div className="px-4 py-2">
            <Link
              href="/home"
              className="w-full p-3 rounded-2xl border bg-gradient-to-r from-primary/10 to-emerald-500/10 hover:from-primary/20 hover:to-emerald-500/20 border-primary/30 flex items-center justify-between text-left transition-all shadow-md group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary text-black flex items-center justify-center font-black shrink-0 shadow-md shadow-primary/30">
                  <Home className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-black text-foreground">Athlete Portal</div>
                  <div className="text-[10px] text-foreground/50 truncate">Personal Dashboard</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        )}

        {/* User / Org Footer Profile & Logout */}
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
            <Link
              href={`/org/${orgId}/profile`}
              className="flex items-center gap-2.5 min-w-0 flex-1 hover:opacity-80 transition-opacity group"
            >
              <div
                className="w-9 h-9 rounded-xl overflow-hidden border bg-black/40 flex items-center justify-center shrink-0 group-hover:border-primary/50 transition-colors"
                style={{ borderColor: 'var(--athlon-border)' }}
              >
                {activeOrg.logo ? (
                  <img src={activeOrg.logo} alt={activeOrg.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-black text-xs text-primary">{activeOrg.name.charAt(0)}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-black text-foreground truncate group-hover:text-primary transition-colors">{activeOrg.name}</div>
                <div className="text-[10px] font-mono text-primary truncate">{activeOrg.type} Profile →</div>
              </div>
            </Link>
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

      {/* ══════════════════════════════════════════════════════════════════════
          MAIN CONTENT AREA
         ══════════════════════════════════════════════════════════════════════ */}
      <main className="flex-1 overflow-auto bg-background md:pb-0 pb-16">{children}</main>

      {/* ══════════════════════════════════════════════════════════════════════
          MOBILE BOTTOM NAV
         ══════════════════════════════════════════════════════════════════════ */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 h-20 backdrop-blur-xl border-t z-40 px-5 flex items-center justify-between max-w-lg mx-auto"
        style={{ backgroundColor: 'var(--athlon-navigation)', borderColor: 'var(--athlon-border)' }}
      >
        {/* Item 1 */}
        {navItems[0] && (
          <Link
            href={navItems[0].href}
            className={`flex flex-col items-center gap-0.5 w-16 group transition-opacity ${
              pathname === navItems[0].href ? 'opacity-100' : 'opacity-80 hover:opacity-100'
            }`}
          >
            <Athlon3DIcon type="home" size={32} active={pathname === navItems[0].href} />
            <span
              className={`text-[9.5px] font-bold leading-tight ${
                pathname === navItems[0].href ? 'text-primary' : ''
              }`}
              style={{ color: pathname === navItems[0].href ? undefined : 'var(--athlon-text-muted)' }}
            >
              {navItems[0].name}
            </span>
          </Link>
        )}

        {/* Item 2 */}
        {navItems[1] && (
          <Link
            href={navItems[1].href}
            className={`flex flex-col items-center gap-0.5 w-16 group transition-opacity ${
              pathname === navItems[1].href ? 'opacity-100' : 'opacity-80 hover:opacity-100'
            }`}
          >
            <Athlon3DIcon
              type={getOrg3DIconType(navItems[1].name)}
              size={32}
              active={pathname === navItems[1].href}
            />
            <span
              className={`text-[9.5px] font-bold leading-tight ${
                pathname === navItems[1].href ? 'text-primary' : ''
              }`}
              style={{ color: pathname === navItems[1].href ? undefined : 'var(--athlon-text-muted)' }}
            >
              {navItems[1].name}
            </span>
          </Link>
        )}

        {/* 3D Circular Elevated Umpire Button */}
        <div className="relative -top-5 flex items-center justify-center">
          <Link
            href="/match-setup"
            className="w-[60px] h-[60px] rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all border-[3.5px] group relative overflow-hidden shadow-2xl"
            style={{
              backgroundColor: 'var(--athlon-primary)',
              borderColor: 'var(--athlon-navigation)',
              boxShadow: '0 10px 25px -2px var(--athlon-primary-glow), 0 4px 12px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.45), inset 0 -3px 6px rgba(0,0,0,0.3)',
            }}
          >
            {/* 3D Glass Specular Reflection Arc */}
            <div className="absolute inset-x-1 top-0 h-[45%] rounded-t-full bg-gradient-to-b from-white/40 via-white/10 to-transparent pointer-events-none" />

            <img
              src="/umpire.png"
              alt="Umpire"
              className="w-8 h-8 object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.45)] relative z-10 transition-transform group-hover:scale-110 group-active:scale-95"
            />
          </Link>
        </div>

        {/* Item 3 */}
        {navItems[2] && (
          <Link
            href={navItems[2].href}
            className={`flex flex-col items-center gap-0.5 w-16 group transition-opacity ${
              pathname === navItems[2].href ? 'opacity-100' : 'opacity-80 hover:opacity-100'
            }`}
          >
            <Athlon3DIcon
              type={getOrg3DIconType(navItems[2].name)}
              size={32}
              active={pathname === navItems[2].href}
            />
            <span
              className={`text-[9.5px] font-bold leading-tight ${
                pathname === navItems[2].href ? 'text-primary' : ''
              }`}
              style={{ color: pathname === navItems[2].href ? undefined : 'var(--athlon-text-muted)' }}
            >
              {navItems[2].name}
            </span>
          </Link>
        )}

        {/* Profile */}
        <Link
          href={`/org/${orgId}/profile`}
          className={`flex flex-col items-center gap-0.5 w-16 group transition-opacity ${
            pathname === `/org/${orgId}/profile` ? 'opacity-100' : 'opacity-80 hover:opacity-100'
          }`}
        >
          <Athlon3DIcon type="profile" size={32} active={pathname === `/org/${orgId}/profile`} />
          <span
            className={`text-[9.5px] font-bold leading-tight ${
              pathname === `/org/${orgId}/profile` ? 'text-primary' : ''
            }`}
            style={{ color: pathname === `/org/${orgId}/profile` ? undefined : 'var(--athlon-text-muted)' }}
          >
            Profile
          </span>
        </Link>
      </nav>
    </div>
  );
}
