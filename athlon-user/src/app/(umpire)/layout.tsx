'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Activity, LayoutDashboard, LogOut, Users, Settings, Plus, Home, UserCircle, Menu, User, Calendar } from 'lucide-react';
import { useAuthStore } from '@/lib/store/useAuthStore';

export default function UmpireLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { logout } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isScoringLive = pathname.includes('/scoring/');

  const navItems = [
    { name: 'Home', href: '/umpire', icon: LayoutDashboard },
    { name: 'Setup Match', href: '/match-setup', icon: Activity },
    { name: 'Schedule', href: '/umpire/schedule', icon: Calendar },
  ];

  return (
    <div className="flex h-screen bg-(--bg) text-(--text)">
      {/* Desktop Sidebar */}
      {!isScoringLive && (
        <aside className="dark w-64 border-r border-(--border) bg-(--surface) flex flex-col hidden md:flex">
          <div className="p-4 border-b border-(--border)">
            <Image src="/athlon-logo-3.png" alt="Athlon Logo" width={120} height={32} className="mb-4 object-contain w-auto h-10" />

            <div className="flex flex-col mt-4">
              <Link href="/profile" className="flex items-center gap-3 text-(--text-muted) hover:text-red-500 transition-colors p-2 -ml-2 rounded-lg hover:bg-white/5">
                <UserCircle className="w-5 h-5" />
                <span className="font-medium text-sm">View Profile</span>
              </Link>
            </div>
          </div>
          <nav className="dark flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive
                    ? 'bg-red-500/10 text-red-500'
                    : 'text-(--text-muted) hover:text-(--text) hover:bg-(--surface-elevated)'
                    }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              )
            })}
          </nav>
          <div className="p-4 border-t border-(--border)">
            <button
              onClick={() => {
                logout();
                window.location.href = '/';
              }}
              className="flex items-center gap-3 text-(--text-muted) hover:text-red-500 transition-colors w-full px-3 py-2"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <main className={`flex-1 overflow-auto bg-(--bg) ${isScoringLive ? '' : 'md:pb-0 pb-16'}`}>
        {/* Mobile Header (PWA Style - matches Home page) */}
        {!isScoringLive && (
          <header className="md:hidden sticky top-0 z-50 flex items-center justify-between px-4 py-4 bg-surface/90 backdrop-blur-md border-b border-border">
            <div className="flex items-center gap-2">
              <Image src="/athlon-logo-3.png" alt="Athlon" width={90} height={18} className="object-contain w-auto h-10" />
            </div>

            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 -mr-2 text-foreground hover:text-red-500 transition-colors"
              >
                <Menu className="w-6 h-6" strokeWidth={1.5} />
              </button>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <div className="absolute right-0 top-12 w-48 bg-surface border border-border rounded-xl shadow-2xl py-2 flex flex-col z-50 animate-in fade-in zoom-in-95 duration-200">
                  <Link href="/profile" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground hover:bg-foreground/5 transition-colors">
                    <User className="w-4 h-4 text-red-500" /> Profile
                  </Link>
                  <Link href="/settings" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground hover:bg-foreground/5 transition-colors">
                    <Settings className="w-4 h-4 text-foreground/70" /> Settings
                  </Link>
                  <div className="h-px bg-border my-1 mx-2" />
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      logout();
                      window.location.href = '/';
                    }}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors w-full text-left"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          </header>
        )}

        {children}
      </main>

      {/* Mobile Bottom Nav (PWA Style) */}
      {!isScoringLive && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-surface/95 backdrop-blur-xl border-t border-border z-50 px-6 flex items-center justify-between">
          <Link href="/umpire" className={`flex flex-col items-center gap-1 w-16 transition-opacity ${pathname === '/umpire' ? 'opacity-100' : 'opacity-50 hover:opacity-100'}`}>
            <Home className={`w-6 h-6 ${pathname === '/umpire' ? 'text-red-500' : 'text-foreground'}`} />
            <span className={`text-[9px] font-bold ${pathname === '/umpire' ? 'text-red-500' : 'text-foreground'}`}>Home</span>
          </Link>

          <Link href="/match-setup" className={`flex flex-col items-center gap-1 w-16 transition-opacity ${pathname === '/match-setup' ? 'opacity-100' : 'opacity-50 hover:opacity-100'}`}>
            <Activity className={`w-6 h-6 ${pathname === '/match-setup' ? 'text-red-500' : 'text-foreground'}`} />
            <span className={`text-[9px] font-bold ${pathname === '/match-setup' ? 'text-red-500' : 'text-foreground'}`}>Setup</span>
          </Link>

          {/* Elevated Center + Button */}
          <div className="relative -top-6 flex items-center justify-center">
            <Link href="/match-setup" className="w-16 h-16 rounded-full bg-red-500 text-white shadow-[0_8px_30px_rgba(255,59,48,0.4)] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform border-4 border-surface">
              <img src="/umpire.png" alt="Umpire" className="w-8 h-8 object-contain drop-shadow-md" />
            </Link>
          </div>

          <Link href="/umpire/schedule" className={`flex flex-col items-center gap-1 w-16 transition-opacity ${pathname === '/umpire/schedule' ? 'opacity-100' : 'opacity-50 hover:opacity-100'}`}>
            <Calendar className={`w-6 h-6 ${pathname === '/umpire/schedule' ? 'text-red-500' : 'text-foreground'}`} />
            <span className={`text-[9px] font-bold ${pathname === '/umpire/schedule' ? 'text-red-500' : 'text-foreground'}`}>Schedule</span>
          </Link>

          <Link href="/profile" className={`flex flex-col items-center gap-1 w-16 transition-opacity ${pathname === '/profile' ? 'opacity-100' : 'opacity-50 hover:opacity-100'}`}>
            <UserCircle className={`w-6 h-6 ${pathname === '/profile' ? 'text-red-500' : 'text-foreground'}`} />
            <span className={`text-[9px] font-bold ${pathname === '/profile' ? 'text-red-500' : 'text-foreground'}`}>Profile</span>
          </Link>
        </nav>
      )}
    </div>
  );
}
