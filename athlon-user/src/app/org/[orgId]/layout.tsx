'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useParams, useRouter } from 'next/navigation';
import { 
  Home, Trophy, CalendarDays, Bell, User, LogOut, Menu, Settings, 
  Activity, Users, Building, MapPin, Grid, BarChart3, CreditCard 
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import ContextSwitcher from '@/components/ContextSwitcher';

export default function OrganizationLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const { logout } = useAuthStore();
  const { activeWorkspaceId, setActiveWorkspace, getActiveOrganization } = useWorkspaceStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const orgId = params?.orgId as string;
  const activeOrg = getActiveOrganization();

  // Sync route with store on load
  useEffect(() => {
    if (orgId && activeWorkspaceId !== orgId) {
      setActiveWorkspace(orgId);
    }
  }, [orgId, activeWorkspaceId, setActiveWorkspace]);

  // Fallback if organization doesn't exist (e.g. invalid URL)
  useEffect(() => {
    if (activeWorkspaceId !== 'PERSONAL' && !activeOrg) {
      router.push('/home');
    }
  }, [activeWorkspaceId, activeOrg, router]);

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

  if (!activeOrg) return null;

  // Determine which nav links to show based on org type
  const getNavItems = () => {
    const base = [
      { name: 'Dashboard', href: `/org/${orgId}/dashboard`, icon: BarChart3 },
    ];

    if (activeOrg.type === 'ORGANIZER') {
      return [
        ...base,
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
      <aside className="dark w-64 border-r border-white/10 bg-[#0A0F1A] flex-col hidden md:flex z-50 relative overflow-y-auto">
        <div className="p-4 border-b border-white/10 sticky top-0 bg-[#0A0F1A] z-10 space-y-4">
          <Image src="/athlon-logo-3.png" alt="Athlon Logo" width={120} height={32} className="object-contain w-auto h-10 opacity-70 hover:opacity-100 transition-opacity" />
          <ContextSwitcher />
        </div>
        
        <nav className="dark flex-1 p-4 space-y-2">
          <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 px-3">{activeOrg.name} Tools</div>
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-[#1B9C56]/10 text-[#1B9C56]'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-white/10 sticky bottom-0 bg-[#0A0F1A] z-10">
          <Link href={`/org/${orgId}/settings`} className="flex items-center gap-3 text-white/50 hover:text-white transition-colors w-full px-3 py-2">
            <Settings className="w-5 h-5" />
            <span className="font-medium">Org Settings</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto bg-background md:pb-0 pb-16">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="dark md:hidden fixed bottom-0 left-0 right-0 h-20 bg-[#0A0F1A]/95 backdrop-blur-xl border-t border-white/10 z-50 px-6 flex items-center justify-between">
        
        {/* Item 1 */}
        {navItems[0] && Icon0 && (
          <Link href={navItems[0].href} className={`flex flex-col items-center gap-1 w-16 transition-opacity ${pathname === navItems[0].href ? 'opacity-100' : 'opacity-50 hover:opacity-100'}`}>
            <Icon0 className={`w-6 h-6 ${pathname === navItems[0].href ? 'text-[#1B9C56]' : 'text-white'}`} />
            <span className={`text-[9px] font-bold ${pathname === navItems[0].href ? 'text-[#1B9C56]' : 'text-white'}`}>{navItems[0].name}</span>
          </Link>
        )}

        {/* Item 2 */}
        {navItems[1] && Icon1 && (
          <Link href={navItems[1].href} className={`flex flex-col items-center gap-1 w-16 transition-opacity ${pathname === navItems[1].href ? 'opacity-100' : 'opacity-50 hover:opacity-100'}`}>
            <Icon1 className={`w-6 h-6 ${pathname === navItems[1].href ? 'text-[#1B9C56]' : 'text-white'}`} />
            <span className={`text-[9px] font-bold ${pathname === navItems[1].href ? 'text-[#1B9C56]' : 'text-white'}`}>{navItems[1].name}</span>
          </Link>
        )}

        {/* Elevated Center + Button */}
        <div className="relative -top-6 flex items-center justify-center">
          <Link href="/match-setup" className="w-16 h-16 rounded-full bg-[#1B9C56] text-black shadow-[0_8px_30px_rgba(27,156,86,0.4)] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform border-4 border-[#0A0F1A]">
            <img src="/umpire.png" alt="Umpire" className="w-8 h-8 object-contain drop-shadow-md" />
          </Link>
        </div>

        {/* Item 3 */}
        {navItems[2] && Icon2 && (
          <Link href={navItems[2].href} className={`flex flex-col items-center gap-1 w-16 transition-opacity ${pathname === navItems[2].href ? 'opacity-100' : 'opacity-50 hover:opacity-100'}`}>
            <Icon2 className={`w-6 h-6 ${pathname === navItems[2].href ? 'text-[#1B9C56]' : 'text-white'}`} />
            <span className={`text-[9px] font-bold ${pathname === navItems[2].href ? 'text-[#1B9C56]' : 'text-white'}`}>{navItems[2].name}</span>
          </Link>
        )}

        {/* Profile (replacing Item 4 / Results) */}
        <Link href="/profile" className={`flex flex-col items-center gap-1 w-16 transition-opacity ${pathname === '/profile' ? 'opacity-100' : 'opacity-50 hover:opacity-100'}`}>
          <User className={`w-6 h-6 ${pathname === '/profile' ? 'text-[#1B9C56]' : 'text-white'}`} />
          <span className={`text-[9px] font-bold ${pathname === '/profile' ? 'text-[#1B9C56]' : 'text-white'}`}>Profile</span>
        </Link>
      </nav>
    </div>
  );
}
