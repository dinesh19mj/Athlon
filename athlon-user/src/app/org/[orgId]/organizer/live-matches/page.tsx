'use client';

import { LiveMatchWidget } from '@/components/organizer/LiveMatchWidget';
import Link from 'next/link';
import { ExternalLink, Activity, Tv, ArrowLeft } from 'lucide-react';

const liveMatches = [
  { id: 'match-1', court: 'Court 1', teamA: 'Smith / Jones', teamB: 'Davis / Wilson' },
  { id: 'match-2', court: 'Court 2', teamA: 'Anderson / Lee', teamB: 'Taylor / Clark' },
  { id: 'match-3', court: 'Center Court', teamA: 'Williams / Brown', teamB: 'Johnson / Miller' },
];

export default function OrganizerLiveMatchesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans p-4 md:p-8 pb-32">
      
      {/* Header */}
      <header className="mb-6 mt-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/organizer" className="p-2 -ml-2 text-foreground/70 hover:text-foreground transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-20" />
            <Activity className="w-6 h-6 text-red-500 relative z-10" />
          </div>
          <h1 className="text-xl font-black uppercase tracking-wide">
            Live Matches
          </h1>
        </div>
        
        {/* Helper to open umpire view */}
        <Link 
          href="/scoring/match-1" 
          target="_blank"
          className="hidden md:flex bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 text-foreground font-bold py-2 px-4 rounded-xl items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all"
        >
          Open Umpire (Court 1) <ExternalLink className="w-4 h-4" />
        </Link>
      </header>

      {/* Mobile Umpire Link */}
      <div className="md:hidden mb-6">
        <Link 
          href="/scoring/match-1" 
          target="_blank"
          className="w-full flex bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 text-foreground font-bold py-3 px-4 rounded-xl items-center justify-center gap-2 active:scale-95 transition-all text-sm uppercase tracking-wider"
        >
          Open Umpire Link <ExternalLink className="w-4 h-4 text-foreground/50" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {liveMatches.map(match => (
          <div key={match.id} className="bg-surface border border-foreground/5 rounded-3xl p-5 shadow-xl relative overflow-hidden group">
            
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#1B9C56]/10 blur-3xl rounded-full" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-red-500 font-black text-xs tracking-widest uppercase">Live</span>
                </div>
                <span className="text-[#1B9C56] font-bold text-xs uppercase tracking-wider bg-[#1B9C56]/10 px-3 py-1 rounded-full border border-[#1B9C56]/20">
                  {match.court}
                </span>
              </div>

              {/* The LiveMatchWidget relies on Firebase for scores, so we just embed it inside our styled card */}
              <div className="bg-background rounded-2xl border border-foreground/5 p-4 mb-4">
                <LiveMatchWidget 
                  matchId={match.id}
                  courtName={match.court}
                  teamA={match.teamA}
                  teamB={match.teamB}
                />
              </div>
              
              <button className="w-full py-3 bg-foreground/5 hover:bg-foreground/10 border border-foreground/5 rounded-xl text-foreground font-bold text-xs tracking-widest uppercase flex items-center justify-center gap-2 transition-colors">
                BROADCAST FEED <Tv className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
