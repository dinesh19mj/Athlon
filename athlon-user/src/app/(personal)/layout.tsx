'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Home, Trophy, CalendarDays, Bell, User, LogOut, Menu, Settings, Activity } from 'lucide-react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { usePracticeMatchStore } from '@/lib/store/usePracticeMatchStore';
import ContextSwitcher from '@/components/ContextSwitcher';
import PracticeMatchDrawer from '@/components/home/PracticeMatchDrawer';

export default function PersonalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { logout } = useAuthStore();
  const { records } = usePracticeMatchStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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

  const baseNavItems = [
    { name: 'Home', href: '/home', icon: Home },
    { name: 'My Events', href: '/home/tournaments', icon: Trophy },
    { name: 'Match Setup', href: '/match-setup', icon: Activity },
    { name: 'Notifications', href: '/home/notifications', icon: Bell },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Desktop Sidebar */}
      <aside className="w-64 border-r border-border flex-col hidden md:flex z-50 relative overflow-y-auto" style={{ backgroundColor: 'var(--athlon-sidebar)', borderColor: 'var(--athlon-border)' }}>
        <div className="p-4 border-b border-border sticky top-0 z-10 space-y-4" style={{ backgroundColor: 'var(--athlon-sidebar)', borderColor: 'var(--athlon-border)' }}>
          <Image src="/athlon-logo-3.png" alt="Athlon Logo" width={120} height={32} className="object-contain w-auto h-10" />
          <ContextSwitcher />
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider mb-2 px-3" style={{ color: 'var(--athlon-text-muted)' }}>Personal Space</div>
          {baseNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const isMatchSetup = item.name === 'Match Setup';
            
            if (isMatchSetup) {
              return (
                <button
                  key={item.name}
                  onClick={() => setIsDrawerOpen(true)}
                  className="flex items-center justify-between w-full px-3 py-2 rounded-lg transition-colors text-left"
                  style={{
                    backgroundColor: isActive ? 'var(--athlon-navigation-hover)' : 'transparent',
                    color: isActive ? 'var(--athlon-navigation-active)' : 'var(--athlon-text-secondary)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5" style={{ color: 'var(--athlon-primary)' }} />
                    <span className="font-medium">{item.name}</span>
                  </div>
                  {hasLiveMatch && (
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  )}
                </button>
              );
            }

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
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t sticky bottom-0 z-10" style={{ backgroundColor: 'var(--athlon-sidebar)', borderColor: 'var(--athlon-border)' }}>
          <button
            onClick={() => {
              logout();
              window.location.href = '/';
            }}
            className="flex items-center gap-3 transition-colors w-full px-3 py-2 rounded-lg hover:bg-white/5"
            style={{ color: 'var(--athlon-text-muted)' }}
          >
            <LogOut className="w-5 h-5" style={{ color: 'var(--athlon-primary)' }} />
            <span className="font-medium">Logout</span>
          </button>
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
        <Link href="/home" className={`flex flex-col items-center gap-1 w-16 transition-opacity ${pathname === '/home' ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}>
          <Home className="w-6 h-6" style={{ color: 'var(--athlon-primary)' }} />
          <span className="text-[9px] font-bold" style={{ color: pathname === '/home' ? 'var(--athlon-navigation-active)' : 'var(--athlon-text-muted)' }}>Home</span>
        </Link>

        <Link href="/home/tournaments" className={`flex flex-col items-center gap-1 w-16 transition-opacity ${pathname === '/home/tournaments' ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}>
          <Trophy className="w-6 h-6" style={{ color: 'var(--athlon-primary)' }} />
          <span className="text-[9px] font-bold" style={{ color: pathname === '/home/tournaments' ? 'var(--athlon-navigation-active)' : 'var(--athlon-text-muted)' }}>Events</span>
        </Link>

        {/* Elevated Center Button */}
        <div className="relative -top-6 flex items-center justify-center">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="w-16 h-16 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-transform border-4 relative"
            style={{
              backgroundColor: 'var(--athlon-primary)',
              color: 'var(--athlon-primary-foreground)',
              borderColor: 'var(--athlon-navigation)',
              boxShadow: hasLiveMatch ? '0 8px 30px rgba(239, 68, 68, 0.6)' : '0 8px 30px var(--athlon-glow)',
            }}
          >
            <img src="/umpire.png" alt="Umpire" className="w-8 h-8 object-contain drop-shadow-md" />
            {hasLiveMatch && (
              <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-red-500 border-2 border-background animate-ping" />
            )}
            {hasLiveMatch && (
              <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-red-500 border-2 border-background" />
            )}
          </button>
        </div>

        <Link href="/home/notifications" className={`flex flex-col items-center gap-1 w-16 transition-opacity ${pathname === '/home/notifications' ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}>
          <Bell className="w-6 h-6" style={{ color: 'var(--athlon-primary)' }} />
          <span className="text-[9px] font-bold" style={{ color: pathname === '/home/notifications' ? 'var(--athlon-navigation-active)' : 'var(--athlon-text-muted)' }}>Alerts</span>
        </Link>

        <Link href="/profile" className={`flex flex-col items-center gap-1 w-16 transition-opacity ${pathname === '/profile' ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}>
          <User className="w-6 h-6" style={{ color: 'var(--athlon-primary)' }} />
          <span className="text-[9px] font-bold" style={{ color: pathname === '/profile' ? 'var(--athlon-navigation-active)' : 'var(--athlon-text-muted)' }}>Profile</span>
        </Link>
      </nav>

      {/* Practice Match Drawer */}
      <PracticeMatchDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
}
