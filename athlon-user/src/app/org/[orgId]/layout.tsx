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
                    ? 'bg-[#3B82F6]/10 text-[#3B82F6]'
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
        {/* Mobile Header */}
        <header className="dark md:hidden sticky top-0 z-50 flex items-center justify-between px-4 py-4 bg-[#0A0F1A]/90 backdrop-blur-md border-b border-white/10">
          <div className="flex items-center gap-2">
            <Image src="/athlon-logo-3.png" alt="Athlon" width={90} height={18} className="object-contain w-auto h-10" />
          </div>

          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 -mr-2 text-foreground hover:text-[#3B82F6] transition-colors"
            >
              <Menu className="w-6 h-6" strokeWidth={1.5} />
            </button>

            {isMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setIsMenuOpen(false)}
                />
                <div className="absolute right-0 top-12 w-64 bg-surface border border-foreground/10 rounded-xl shadow-2xl py-2 flex flex-col z-50 animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-4 py-2 border-b border-white/10 mb-2">
                    <ContextSwitcher />
                  </div>
                  
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      logout();
                      window.location.href = '/';
                    }}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors w-full text-left mt-1"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="dark md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0A0F1A]/95 backdrop-blur-xl border-t border-white/10 z-50 px-4 flex items-center justify-around">
        {navItems.slice(0, 4).map(item => {
           const isActive = pathname === item.href;
           return (
             <Link key={item.name} href={item.href} className={`flex flex-col items-center gap-1 w-16 transition-opacity ${isActive ? 'opacity-100' : 'opacity-50 hover:opacity-100'}`}>
               <item.icon className={`w-5 h-5 ${isActive ? 'text-[#3B82F6]' : 'text-white'}`} />
               <span className={`text-[9px] font-bold ${isActive ? 'text-[#3B82F6]' : 'text-white'}`}>{item.name}</span>
             </Link>
           );
        })}
      </nav>
    </div>
  );
}
