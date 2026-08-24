'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useParams, useRouter } from 'next/navigation';
import { 
  Home, Trophy, CalendarDays, Bell, User, LogOut, Menu, Settings, 
  Activity, Users, Building, MapPin, Grid, BarChart3, CreditCard, Video 
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import ContextSwitcher from '@/components/ContextSwitcher';

export default function OrganizationLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const { logout } = useAuthStore();
  const { activeWorkspaceId, setActiveWorkspace, getActiveOrganization, organizations } = useWorkspaceStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const orgId = (params?.orgId as string) || '';
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Sync route with store on load
  useEffect(() => {
    if (orgId && activeWorkspaceId !== orgId) {
      setActiveWorkspace(orgId);
    }
  }, [orgId, activeWorkspaceId, setActiveWorkspace]);

  // Robust activeOrg resolver: check by URL param, activeWorkspaceId, or default fallback
  const activeOrg = organizations.find((o) => o.id === orgId) ||
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

  // Determine which nav links to show based on org type
  const getNavItems = () => {
    const base = [
      { name: 'Dashboard', href: `/org/${orgId}/dashboard`, icon: BarChart3 },
    ];

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
        { name: 'Finances', href: `/org/${orgId}/finances`, icon: CreditCard },
      ];
    }
    return base;
  };

  const navItems = getNavItems();

  const Icon0 = navItems[0]?.icon;
  const Icon1 = navItems[1]?.icon;
  const Icon2 = navItems[2]?.icon;

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Desktop Sidebar */}
      <aside className="w-64 border-r flex-col hidden md:flex z-50 relative overflow-y-auto" style={{ backgroundColor: 'var(--athlon-sidebar)', borderColor: 'var(--athlon-border)' }}>
        <div className="p-4 border-b sticky top-0 z-10 space-y-4" style={{ backgroundColor: 'var(--athlon-sidebar)', borderColor: 'var(--athlon-border)' }}>
          <Image src="/athlon-logo-3.png" alt="Athlon Logo" width={120} height={32} className="object-contain w-auto h-10 opacity-70 hover:opacity-100 transition-opacity" />
          <ContextSwitcher />
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-widest mb-2 px-3" style={{ color: 'var(--athlon-text-muted)' }}>{activeOrg.name} Tools</div>
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
                style={{
                  backgroundColor: isActive ? 'var(--athlon-navigation-hover)' : 'transparent',
                  color: isActive ? 'var(--athlon-navigation-active)' : 'var(--athlon-text-secondary)',
                }}
              >
                <item.icon className="w-5 h-5" style={{ color: 'var(--athlon-primary)' }} />
                <span className="font-medium text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t sticky bottom-0 z-10" style={{ backgroundColor: 'var(--athlon-sidebar)', borderColor: 'var(--athlon-border)' }}>
          <Link href={`/org/${orgId}/settings`} className="flex items-center gap-3 transition-colors w-full px-3 py-2 rounded-lg hover:bg-white/5" style={{ color: 'var(--athlon-text-muted)' }}>
            <Settings className="w-5 h-5" style={{ color: 'var(--athlon-primary)' }} />
            <span className="font-medium">Org Settings</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto bg-background md:pb-0 pb-16">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 h-20 backdrop-blur-xl border-t z-50 px-6 flex items-center justify-between"
        style={{ backgroundColor: 'var(--athlon-navigation)', borderColor: 'var(--athlon-border)' }}
      >
        {/* Item 1 */}
        {navItems[0] && Icon0 && (
          <Link href={navItems[0].href} className={`flex flex-col items-center gap-1 w-16 transition-opacity ${pathname === navItems[0].href ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}>
            <Icon0 className="w-6 h-6" style={{ color: 'var(--athlon-primary)' }} />
            <span className="text-[9px] font-bold" style={{ color: pathname === navItems[0].href ? 'var(--athlon-navigation-active)' : 'var(--athlon-text-muted)' }}>{navItems[0].name}</span>
          </Link>
        )}

        {/* Item 2 */}
        {navItems[1] && Icon1 && (
          <Link href={navItems[1].href} className={`flex flex-col items-center gap-1 w-16 transition-opacity ${pathname === navItems[1].href ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}>
            <Icon1 className="w-6 h-6" style={{ color: 'var(--athlon-primary)' }} />
            <span className="text-[9px] font-bold" style={{ color: pathname === navItems[1].href ? 'var(--athlon-navigation-active)' : 'var(--athlon-text-muted)' }}>{navItems[1].name}</span>
          </Link>
        )}

        {/* Elevated Center Button */}
        <div className="relative -top-6 flex items-center justify-center">
          <Link
            href="/match-setup"
            className="w-16 h-16 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-transform border-4"
            style={{
              backgroundColor: 'var(--athlon-primary)',
              color: 'var(--athlon-primary-foreground)',
              borderColor: 'var(--athlon-navigation)',
              boxShadow: '0 8px 30px var(--athlon-glow)',
            }}
          >
            <img src="/umpire.png" alt="Umpire" className="w-8 h-8 object-contain drop-shadow-md" />
          </Link>
        </div>

        {/* Item 3 */}
        {navItems[2] && Icon2 && (
          <Link href={navItems[2].href} className={`flex flex-col items-center gap-1 w-16 transition-opacity ${pathname === navItems[2].href ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}>
            <Icon2 className="w-6 h-6" style={{ color: 'var(--athlon-primary)' }} />
            <span className="text-[9px] font-bold" style={{ color: pathname === navItems[2].href ? 'var(--athlon-navigation-active)' : 'var(--athlon-text-muted)' }}>{navItems[2].name}</span>
          </Link>
        )}

        {/* Profile */}
        <Link href="/profile" className={`flex flex-col items-center gap-1 w-16 transition-opacity ${pathname === '/profile' ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}>
          <User className="w-6 h-6" style={{ color: 'var(--athlon-primary)' }} />
          <span className="text-[9px] font-bold" style={{ color: pathname === '/profile' ? 'var(--athlon-navigation-active)' : 'var(--athlon-text-muted)' }}>Profile</span>
        </Link>
      </nav>
    </div>
  );
}
