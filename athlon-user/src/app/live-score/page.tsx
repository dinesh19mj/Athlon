'use client';

import { ArrowLeft, Search, Tv, User, Activity, Clock } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function LiveScorePage() {
  const liveMatches = [
    {
      id: 1,
      tournament: 'State Championship 2026',
      category: 'Men Singles • Semi Final',
      court: 'Court 1',
      player1: { name: 'Arjun K.', score: 21, games: 1, avatar: 'A' },
      player2: { name: 'Rahul S.', score: 18, games: 0, avatar: 'R' },
      status: 'Game 2',
      duration: '42m'
    },
    {
      id: 2,
      tournament: 'Bangalore Open',
      category: 'Women Doubles • Final',
      court: 'Court 3',
      player1: { name: 'Sneha & Priya', score: 15, games: 1, avatar: 'S' },
      player2: { name: 'Anjali & Neha', score: 21, games: 1, avatar: 'A' },
      status: 'Game 3',
      duration: '1h 12m'
    },
    {
      id: 3,
      tournament: 'Elite Club Tournament',
      category: 'Mixed Doubles • Quarter Final',
      court: 'Court 2',
      player1: { name: 'Vikram & Pooja', score: 9, games: 0, avatar: 'V' },
      player2: { name: 'Karthik & Riya', score: 11, games: 0, avatar: 'K' },
      status: 'Game 1',
      duration: '14m'
    }
  ];

  return (
    <div className="min-h-screen w-full bg-background text-foreground font-sans pb-24 overflow-y-auto selection:bg-[#EF4444] selection:text-white">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-4 bg-background/90 backdrop-blur-md border-b border-foreground/5">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 -ml-2 text-foreground hover:text-red-500 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-lg font-bold uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Live Scores
          </h1>
        </div>
        
        <button className="p-2 -mr-2 text-foreground hover:text-red-500 transition-colors">
          <Search className="w-5 h-5" />
        </button>
      </header>

      <main className="w-full max-w-lg mx-auto px-4 flex flex-col gap-6 pt-4">

        {/* Featured Live Match (Hero) */}
        {liveMatches[0] && (
          <section className="relative w-full rounded-[24px] overflow-hidden bg-surface border border-red-500/30 shadow-[0_10px_40px_rgba(239,68,68,0.15)] group cursor-pointer p-5">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent pointer-events-none" />
            
            <div className="relative z-10 flex items-center justify-between mb-4 border-b border-foreground/10 pb-3">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">{liveMatches[0].tournament}</span>
                <span className="text-xs text-foreground/70">{liveMatches[0].category}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-500 text-[10px] font-black tracking-wider uppercase border border-red-500/20 flex items-center gap-1">
                  <Activity className="w-3 h-3" /> {liveMatches[0].status}
                </span>
                <span className="text-[10px] text-foreground/50 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {liveMatches[0].duration}
                </span>
              </div>
            </div>

            <div className="relative z-10 flex items-center justify-between px-2 py-4">
              {/* Player 1 */}
              <div className="flex flex-col items-center gap-3 w-1/3">
                <div className="w-16 h-16 rounded-full bg-gradient-to-b from-red-500 to-transparent p-[2px] shadow-lg shadow-red-500/20">
                  <div className="w-full h-full rounded-full bg-surface border-2 border-transparent flex items-center justify-center">
                    <span className="text-xl font-black text-foreground">{liveMatches[0].player1.avatar}</span>
                  </div>
                </div>
                <span className="font-bold text-sm tracking-wider uppercase text-center leading-tight h-10">{liveMatches[0].player1.name}</span>
                <span className="text-5xl font-black text-red-500 leading-none tabular-nums">{liveMatches[0].player1.score}</span>
                <span className="text-xs font-bold text-foreground/50">GAMES: {liveMatches[0].player1.games}</span>
              </div>

              {/* VS */}
              <div className="flex flex-col items-center justify-center shrink-0 w-1/3">
                <div className="w-10 h-10 rounded-full bg-background border border-foreground/10 flex items-center justify-center mb-2 shadow-inner">
                  <span className="text-foreground/50 font-black text-xs uppercase">VS</span>
                </div>
                <div className="px-3 py-1 bg-background rounded-full border border-foreground/5">
                  <span className="text-[10px] font-bold text-foreground/70 uppercase tracking-widest">{liveMatches[0].court}</span>
                </div>
              </div>

              {/* Player 2 */}
              <div className="flex flex-col items-center gap-3 w-1/3">
                <div className="w-16 h-16 rounded-full bg-gradient-to-b from-white/20 to-transparent p-[2px]">
                  <div className="w-full h-full rounded-full bg-surface border-2 border-transparent flex items-center justify-center">
                    <span className="text-xl font-black text-foreground">{liveMatches[0].player2.avatar}</span>
                  </div>
                </div>
                <span className="font-bold text-sm tracking-wider uppercase text-center leading-tight h-10">{liveMatches[0].player2.name}</span>
                <span className="text-5xl font-black text-foreground leading-none tabular-nums">{liveMatches[0].player2.score}</span>
                <span className="text-xs font-bold text-foreground/50">GAMES: {liveMatches[0].player2.games}</span>
              </div>
            </div>
            
            <button className="relative z-10 w-full mt-4 py-3.5 bg-red-500 rounded-xl text-white font-black text-sm flex items-center justify-center gap-2 hover:bg-red-600 transition-colors shadow-[0_5px_15px_rgba(239,68,68,0.3)]">
              WATCH STREAM <Tv className="w-4 h-4" />
            </button>
          </section>
        )}

        {/* Other Live Matches List */}
        <section>
          <div className="flex items-center justify-between mb-4 mt-2">
            <h3 className="text-xs font-bold text-foreground/50 tracking-wider uppercase">More Live Matches</h3>
            <span className="text-[10px] font-bold bg-surface px-2 py-1 rounded-full text-foreground/70 border border-foreground/5">
              {liveMatches.length - 1} ACTIVE
            </span>
          </div>
          
          <div className="flex flex-col gap-4">
            {liveMatches.slice(1).map((match) => (
              <div key={match.id} className="bg-surface border border-foreground/5 hover:border-foreground/20 rounded-[20px] p-4 flex flex-col transition-colors shadow-lg cursor-pointer group">
                
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    {match.status}
                  </span>
                  <span className="text-[10px] font-medium text-foreground/50">{match.category}</span>
                </div>

                <div className="flex flex-col gap-3">
                  {/* Team 1 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-background border border-foreground/10 flex items-center justify-center shrink-0">
                        <span className="font-bold text-xs">{match.player1.avatar}</span>
                      </div>
                      <span className="font-bold text-sm text-foreground">{match.player1.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-bold text-foreground/40 w-4 text-center">{match.player1.games}</span>
                      <span className="font-black text-xl text-foreground w-8 text-right tabular-nums">{match.player1.score}</span>
                    </div>
                  </div>

                  {/* Team 2 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-background border border-foreground/10 flex items-center justify-center shrink-0">
                        <span className="font-bold text-xs">{match.player2.avatar}</span>
                      </div>
                      <span className="font-bold text-sm text-foreground">{match.player2.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-bold text-foreground/40 w-4 text-center">{match.player2.games}</span>
                      <span className="font-black text-xl text-foreground w-8 text-right tabular-nums">{match.player2.score}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-foreground/5 flex items-center justify-between">
                  <span className="text-[10px] text-foreground/50">{match.tournament} • {match.court}</span>
                  <span className="text-[10px] font-bold text-[#3B82F6] group-hover:underline">VIEW DETAILS</span>
                </div>

              </div>
            ))}
          </div>
        </section>

      </main>

      <style dangerouslySetInnerHTML={{__html: `
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
