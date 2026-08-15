'use client';

import { useState, useEffect } from 'react';
import {
  Menu, LogIn, ArrowRight, Building2, Trophy, Building,
  CalendarDays, BarChart2, Radio, Wallet, ChevronRight,
  Swords, CalendarCheck, CreditCard, LineChart, Award,
  Home, User, Plus, Tv, UserCircle
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { ScoreService, LiveScore } from '@/lib/api/scores';

export function MarketingPageClient() {
  const [activeTab, setActiveTab] = useState('home');
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const [liveScores, setLiveScores] = useState<LiveScore[]>([]);

  useEffect(() => {
    const fetchLiveScores = () => {
      ScoreService.getLive()
        .then((res: any) => {
          if (res && res.data) {
            setLiveScores(res.data);
          }
        })
        .catch(err => console.error("Failed to load live scores in marketing client", err));
    };

    fetchLiveScores();
    const interval = setInterval(fetchLiveScores, 5000);
    return () => clearInterval(interval);
  }, []);

  const currentLive = liveScores[0];
  const meta = currentLive?.scoreMeta || {};
  const teamAName = meta.config?.teamAName || (meta.config?.teamA ? meta.config.teamA.join(' & ') : 'Team A');
  const teamBName = meta.config?.teamBName || (meta.config?.teamB ? meta.config.teamB.join(' & ') : 'Team B');
  const currentGameIndex = meta.currentGameIndex || 0;
  const games = meta.games || [];
  const currentGame = games[currentGameIndex] || {};
  const scoreA = currentGame.scoreA ?? (currentLive?.teamAScore || 0);
  const scoreB = currentGame.scoreB ?? (currentLive?.teamBScore || 0);
  const tournamentName = meta.config?.tournamentName || 'Tournament Match';
  const category = meta.config?.category || 'Doubles';
  const courtName = meta.config?.courtName || 'Court 1';

  const topCategories = [
    { id: 'tournaments', label: 'Tournaments', icon: Trophy, color: 'text-green-400' },
    { id: 'academies', label: 'Academies', icon: Building, color: 'text-purple-400' },
    { id: 'bookings', label: 'Bookings', icon: CalendarDays, color: 'text-orange-400' },
    { id: 'rankings', label: 'Rankings', icon: BarChart2, color: 'text-blue-400' },
    { id: 'live-score', label: 'Live Score', icon: Tv, color: 'text-red-400' },
    { id: 'wallet', label: 'Wallet', icon: Wallet, color: 'text-cyan-400' },
    { id: 'practice', label: 'Practice Match', icon: Swords, color: 'text-green-400' },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck, color: 'text-purple-400' },
    { id: 'performance', label: 'Performance', icon: LineChart, color: 'text-blue-400' },
    { id: 'achievements', label: 'Achievements', icon: Award, color: 'text-yellow-400' },
  ];

  return (
    <div className="min-h-screen w-full bg-background text-foreground font-sans pb-24 overflow-y-auto selection:bg-[#1B9C56] selection:text-black">


      {/* Main Container for Desktop Centering */}
      <main className="w-full max-w-lg mx-auto px-4 flex flex-col gap-6">

        {/* 2. Hero Banner Carousel */}
        <section className="relative w-full min-h-[220px] rounded-[24px] overflow-hidden bg-background border border-foreground/10 shadow-[0_10px_40px_rgba(0,136,255,0.15)] mt-2">

          {/* Video Background */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            {/* Base dark gradient to ensure text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#001122] via-[#001122]/90 to-transparent z-10" />

            <div className="absolute top-[-10%] right-[-5%] w-[60%] h-[120%] mix-blend-screen opacity-50">
              <video 
                autoPlay 
                loop 
                muted 
                playsInline 
                className="absolute inset-0 w-full h-full object-cover"
              >
                <source src="/athlon-background.mp4" type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#0A0F1A]" />
            </div>
          </div>

          <div className="relative z-10 p-6 flex flex-col justify-center h-full w-full">
            <h1 className="text-[22px] sm:text-[24px] font-black leading-tight tracking-wide uppercase drop-shadow-lg">
              <span className="text-foreground">Compete Today</span><br />
              <span className="text-[#1B9C56]">Champion Tomorrow</span>
            </h1>
            <p className="text-[11px] sm:text-xs text-foreground/80 mt-2 mb-5 max-w-[260px] leading-relaxed drop-shadow-md">
              Football, Cricket, Badminton & more!<br />Tournaments & Live Scores in one place.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/tournaments" className="flex items-center justify-center gap-1.5 bg-[#1B9C56] text-[#0A0F1A] text-[10px] sm:text-[11px] font-black px-4 py-2.5 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(0,255,102,0.3)]">
                JOIN TOURNAMENT <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link href="/academies" className="flex items-center justify-center gap-1.5 bg-black/40 backdrop-blur-md border border-foreground/20 text-foreground text-[10px] sm:text-[11px] font-bold px-4 py-2.5 rounded-xl hover:bg-foreground/10 transition-colors">
                <Building2 className="w-3.5 h-3.5 text-[#1B9C56]" /> FIND ACADEMY
              </Link>
            </div>
          </div>


        </section>

        {/* 3. Primary Categories (Horizontal Scroll) */}
        <section className="flex items-center gap-3 overflow-x-auto pb-6 pt-1 snap-x scroll-px-4 hide-scrollbar -mx-4 px-4">
          {topCategories.map((cat) => (
            <Link href={`/${cat.id}`} key={cat.id} className="flex flex-col items-center gap-1.5 shrink-0 snap-start">
              <div className="w-[68px] h-[68px] rounded-[16px] bg-surface border border-foreground/5 hover:border-foreground/20 flex flex-col items-center justify-center transition-colors shadow-lg cursor-pointer">
                <cat.icon className={`w-6 h-6 ${cat.color}`} strokeWidth={1.5} />
              </div>
              <span className="text-[10px] font-medium text-foreground/80">{cat.label}</span>
            </Link>
          ))}
        </section>

        {/* 4. Live Match Card */}
        {liveScores.length > 0 ? (
          <section className="bg-surface border border-foreground/5 rounded-[24px] p-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-red-500 font-bold text-xs tracking-wider">LIVE</span>
                <span className="text-foreground font-bold text-xs tracking-wider">MATCH</span>
              </div>
              <span className="text-foreground/50 text-xs">{courtName}</span>
            </div>

            <div className="flex items-center justify-center mb-6">
              <span className="px-3 py-1 bg-background rounded-full text-[10px] font-bold text-foreground/60 uppercase tracking-widest border border-foreground/5 text-center">
                {tournamentName} • {category}
              </span>
            </div>

            <div className="flex items-center justify-between px-2 mb-6">
              {/* Player 1 */}
              <div className="flex flex-col items-center gap-2 max-w-[110px]">
                <div className="w-16 h-16 rounded-full bg-gradient-to-b from-[#1B9C56] to-transparent p-[2px]">
                  <div className="w-full h-full rounded-full bg-background border-2 border-transparent overflow-hidden flex items-center justify-center">
                    <span className="text-xl font-black text-[#1B9C56]">{teamAName.charAt(0)}</span>
                  </div>
                </div>
                <span className="font-bold text-xs tracking-wider uppercase text-center line-clamp-2 leading-tight">{teamAName}</span>
                <span className="text-4xl font-black text-[#1B9C56] leading-none tabular-nums">{scoreA}</span>
              </div>

              {/* VS */}
              <div className="flex flex-col items-center justify-center gap-2 mt-4 shrink-0">
                <div className="w-10 h-10 rounded-full bg-background border border-foreground/10 flex items-center justify-center">
                  <span className="text-foreground/50 font-bold text-sm">VS</span>
                </div>
                <span className="px-2 py-0.5 bg-background border border-foreground/5 rounded text-[10px] font-bold text-foreground/50 uppercase tracking-wider">
                  Game {currentGameIndex + 1}
                </span>
              </div>

              {/* Player 2 */}
              <div className="flex flex-col items-center gap-2 max-w-[110px]">
                <div className="w-16 h-16 rounded-full bg-gradient-to-b from-white/20 to-transparent p-[2px]">
                  <div className="w-full h-full rounded-full bg-background border-2 border-transparent overflow-hidden flex items-center justify-center">
                    <span className="text-xl font-black text-foreground">{teamBName.charAt(0)}</span>
                  </div>
                </div>
                <span className="font-bold text-xs tracking-wider uppercase text-center line-clamp-2 leading-tight">{teamBName}</span>
                <span className="text-4xl font-black text-foreground leading-none tabular-nums">{scoreB}</span>
              </div>
            </div>

            <Link href={`/live-score/${currentLive.matchUuid}`} className="w-full py-3.5 bg-[#1B9C56] rounded-xl text-foreground font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
              WATCH LIVE <Tv className="w-4 h-4" />
            </Link>
          </section>
        ) : (
          <section className="bg-surface border border-foreground/5 rounded-[24px] p-6 shadow-xl text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-foreground/30" />
              <span className="text-foreground/50 font-bold text-xs tracking-wider uppercase">No Active Live Matches</span>
            </div>
            <p className="text-xs text-foreground/50">Live match scores will appear here automatically when an umpire starts scoring.</p>
          </section>
        )}
      </main>

      {/* (Removed Subscription Packages) */}

      {/* 7. Floating Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-background/95 backdrop-blur-xl border-t border-foreground/10 z-50 px-6 flex items-center justify-between max-w-lg mx-auto">
        <Link href="/" className="flex flex-col items-center gap-1 w-16">
          <Home className="w-6 h-6 text-[#1B9C56]" />
          <span className="text-[9px] font-bold text-[#1B9C56]">Home</span>
        </Link>

        <Link href="/tournaments" className="flex flex-col items-center gap-1 w-16 opacity-50 hover:opacity-100 transition-opacity">
          <Trophy className="w-6 h-6 text-foreground" />
          <span className="text-[9px] font-bold text-foreground">Tournaments</span>
        </Link>

        {/* Elevated Center + Button */}
        <div className="relative -top-6 flex items-center justify-center">
          <Link href="/match-setup" className="w-16 h-16 rounded-full bg-[#1B9C56] text-black shadow-[0_8px_30px_rgba(0,255,102,0.4)] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform border-4 border-[#0A0F1A]">
            <img src="/umpire.png" alt="Umpire" className="w-8 h-8 object-contain drop-shadow-md" />
          </Link>
        </div>

        <Link href="/academies" className="flex flex-col items-center gap-1 w-16 opacity-50 hover:opacity-100 transition-opacity">
          <Building className="w-6 h-6 text-foreground" />
          <span className="text-[9px] font-bold text-foreground">Academy</span>
        </Link>

        <Link href={isAuthenticated ? "/profile" : "/login"} className="flex flex-col items-center gap-1 w-16 opacity-50 hover:opacity-100 transition-opacity">
          <User className="w-6 h-6 text-foreground" />
          <span className="text-[9px] font-bold text-foreground">Profile</span>
        </Link>
      </nav>

      {/* Global Style overrides for hiding scrollbars but keeping functionality */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}
