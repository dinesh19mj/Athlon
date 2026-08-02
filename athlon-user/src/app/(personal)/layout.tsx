'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Home, Trophy, CalendarDays, Bell, User, LogOut, Menu, Settings, Activity } from 'lucide-react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import ContextSwitcher from '@/components/ContextSwitcher';

export default function PersonalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { logout } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
      <aside className="dark w-64 border-r border-white/10 bg-[#121824] flex-col hidden md:flex z-50 relative overflow-y-auto">
        <div className="p-4 border-b border-white/10 sticky top-0 bg-[#121824] z-10 space-y-4">
          <Image src="/athlon-logo-3.png" alt="Athlon Logo" width={120} height={32} className="object-contain w-auto h-10" />
          <ContextSwitcher />
        </div>
        
        <nav className="dark flex-1 p-4 space-y-2">
          <div className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 px-3">Personal Space</div>
          {baseNavItems.map((item) => {
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
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-foreground/10 sticky bottom-0 bg-[#121824] z-10">
          <button
            onClick={() => {
              logout();
              window.location.href = '/';
            }}
            className="flex items-center gap-3 text-foreground/50 hover:text-[#3B82F6] transition-colors w-full px-3 py-2"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
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
      <nav className="dark md:hidden fixed bottom-0 left-0 right-0 h-20 bg-[#0A0F1A]/95 backdrop-blur-xl border-t border-white/10 z-50 px-6 flex items-center justify-between">
        <Link href="/home" className={`flex flex-col items-center gap-1 w-16 transition-opacity ${pathname === '/home' ? 'opacity-100' : 'opacity-50 hover:opacity-100'}`}>
          <Home className={`w-6 h-6 ${pathname === '/home' ? 'text-[#3B82F6]' : 'text-white'}`} />
          <span className={`text-[9px] font-bold ${pathname === '/home' ? 'text-[#3B82F6]' : 'text-white'}`}>Home</span>
        </Link>

        <Link href="/home/tournaments" className={`flex flex-col items-center gap-1 w-16 transition-opacity ${pathname === '/home/tournaments' ? 'opacity-100' : 'opacity-50 hover:opacity-100'}`}>
          <Trophy className={`w-6 h-6 ${pathname === '/home/tournaments' ? 'text-[#3B82F6]' : 'text-white'}`} />
          <span className={`text-[9px] font-bold ${pathname === '/home/tournaments' ? 'text-[#3B82F6]' : 'text-white'}`}>Events</span>
        </Link>

        {/* Elevated Center + Button */}
        <div className="relative -top-6 flex items-center justify-center">
          <Link href="/match-setup" className="w-16 h-16 rounded-full bg-[#3B82F6] text-black shadow-[0_8px_30px_rgba(204,255,0,0.4)] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform border-4 border-[#0A0F1A]">
            <img src="/umpire.png" alt="Umpire" className="w-8 h-8 object-contain drop-shadow-md" />
          </Link>
        </div>

        <Link href="/home/notifications" className={`flex flex-col items-center gap-1 w-16 transition-opacity ${pathname === '/home/notifications' ? 'opacity-100' : 'opacity-50 hover:opacity-100'}`}>
          <Bell className={`w-6 h-6 ${pathname === '/home/notifications' ? 'text-[#3B82F6]' : 'text-white'}`} />
          <span className={`text-[9px] font-bold ${pathname === '/home/notifications' ? 'text-[#3B82F6]' : 'text-white'}`}>Alerts</span>
        </Link>

        <Link href="/profile" className={`flex flex-col items-center gap-1 w-16 transition-opacity ${pathname === '/profile' ? 'opacity-100' : 'opacity-50 hover:opacity-100'}`}>
          <User className={`w-6 h-6 ${pathname === '/profile' ? 'text-[#3B82F6]' : 'text-white'}`} />
          <span className={`text-[9px] font-bold ${pathname === '/profile' ? 'text-[#3B82F6]' : 'text-white'}`}>Profile</span>
        </Link>
      </nav>
    </div>
  );
}
