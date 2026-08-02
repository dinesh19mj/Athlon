'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Activity, Trophy, LayoutDashboard, List, ArrowRight, Building2, PlusCircle } from 'lucide-react';
import { useAuthStore } from '@/lib/store/useAuthStore';

const quickActions = [
  { id: 'organizer/tournaments', label: 'Tournaments', icon: Trophy, color: 'text-[#1B9C56]' },
  { id: 'organizer/live-matches', label: 'Live Matches', icon: Activity, color: 'text-red-500' },
  { id: 'organizer/dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'text-blue-400' },
  { id: 'organizer/results', label: 'Results', icon: List, color: 'text-purple-400' },
];

const bgImages = [
  'https://images.unsplash.com/photo-1611252758110-6c9f2868853b?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1526685834827-2b0e6df23145?q=80&w=800&auto=format&fit=crop'
];

export default function OrganizerDashboardPage() {
  const [currentBg, setCurrentBg] = useState(0);
  const { userEmail } = useAuthStore();
  
  // Extract a friendly name from email if available (e.g. dinesh@... -> Dinesh)
  const displayName = userEmail 
    ? userEmail.split('@')[0].charAt(0).toUpperCase() + userEmail.split('@')[0].slice(1) 
    : 'Organizer';

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % bgImages.length);
    }, 4000); // Change image every 4 seconds
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-[calc(100vh-156px)] md:h-[calc(100vh-64px)] bg-background text-foreground font-sans p-4 md:p-8 overflow-hidden flex flex-col">
      
      {/* Header Area (App Style) */}
      <header className="mb-6 mt-2 flex items-center justify-between">
        <h1 className="text-xl font-black tracking-wide">
          Hi, {displayName} <span className="inline-block origin-bottom-right animate-[wave_2s_ease-in-out_infinite]">👋</span>
        </h1>
      </header>

      {/* Hero Banner Carousel (From Home Page) */}
      <section className="relative w-full min-h-[220px] rounded-[24px] overflow-hidden bg-background border border-foreground/10 shadow-[0_10px_40px_rgba(0,136,255,0.15)] mb-8">
        
        {/* Animated Background Images */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-background">
          {/* Base dark gradient to ensure text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#001122] via-[#001122]/90 to-[#001122]/40 z-10" />

          {bgImages.map((src, idx) => (
            <div 
              key={src}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                idx === currentBg ? 'opacity-50' : 'opacity-0'
              }`}
            >
              <img 
                src={src} 
                alt="Sports" 
                className="w-full h-full object-cover mix-blend-screen scale-105 animate-[slow-pan_20s_ease-in-out_infinite_alternate]" 
              />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#0A0F1A]" />
            </div>
          ))}
        </div>

        <div className="relative z-10 p-6 flex flex-col justify-center h-full w-full">
          <h1 className="text-[22px] sm:text-[24px] font-black leading-tight tracking-wide uppercase drop-shadow-lg">
            <span className="text-foreground">Host Events</span><br />
            <span className="text-[#1B9C56]">Build Champions</span>
          </h1>
          <p className="text-[11px] sm:text-xs text-foreground/80 mt-2 mb-5 max-w-[260px] leading-relaxed drop-shadow-md">
            Create Tournaments & Broadcast Live Scores<br />Everything you need to manage in one place!
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/organizer/tournaments" className="flex items-center justify-center gap-1.5 bg-[#1B9C56] text-[#0A0F1A] text-[10px] sm:text-[11px] font-black px-4 py-2.5 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(0,255,102,0.3)]">
              NEW TOURNAMENT <PlusCircle className="w-3.5 h-3.5" />
            </Link>
            <Link href="/organizer/dashboard" className="flex items-center justify-center gap-1.5 bg-black/40 backdrop-blur-md border border-foreground/20 text-foreground text-[10px] sm:text-[11px] font-bold px-4 py-2.5 rounded-xl hover:bg-foreground/10 transition-colors">
              <LayoutDashboard className="w-3.5 h-3.5 text-[#1B9C56]" /> VIEW ANALYTICS
            </Link>
          </div>
        </div>

        {/* Dots Indicator */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
          {bgImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentBg(idx)}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                idx === currentBg ? 'bg-[#1B9C56]' : 'bg-foreground/30 hover:bg-foreground/50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Quick Actions (Horizontal Scroll) */}
      <section className="flex items-center gap-3 overflow-x-auto pb-6 pt-1 snap-x scroll-px-4 hide-scrollbar -mx-4 px-4 md:mx-0">
        {quickActions.map((action) => (
          <Link href={`/${action.id}`} key={action.id} className="flex flex-col items-center gap-1.5 shrink-0 snap-start">
            <div className="w-[68px] h-[68px] rounded-[16px] bg-surface border border-foreground/5 hover:border-foreground/20 flex flex-col items-center justify-center transition-colors shadow-lg cursor-pointer">
              <action.icon className={`w-6 h-6 ${action.color}`} strokeWidth={1.5} />
            </div>
            <span className="text-[10px] font-medium text-foreground/80">{action.label}</span>
          </Link>
        ))}
      </section>



      {/* Global Style overrides */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes slow-pan {
          0% { transform: scale(1.05) translate(0, 0); }
          100% { transform: scale(1.15) translate(-2%, 2%); }
        }
        @keyframes wave {
          0% { transform: rotate(0.0deg) }
          10% { transform: rotate(14.0deg) }  /* The following five values can be played with to make the waving more or less extreme */
          20% { transform: rotate(-8.0deg) }
          30% { transform: rotate(14.0deg) }
          40% { transform: rotate(-4.0deg) }
          50% { transform: rotate(10.0deg) }
          60% { transform: rotate(0.0deg) }  /* Reset for the last half to pause */
          100% { transform: rotate(0.0deg) }
        }
      `}} />
    </div>
  );
}
