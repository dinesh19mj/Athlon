'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Search, Tv, User, Activity, Clock, Shield, Radio, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { ScoreService, LiveScore } from '@/lib/api/scores';

export default function LiveScorePage() {
  const [scores, setScores] = useState<LiveScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLiveScores = () => {
      ScoreService.getLive()
        .then((res: any) => {
          if (res && res.data) {
            setScores(res.data);
          }
        })
        .catch(err => console.error("Failed to load live scores", err))
        .finally(() => setLoading(false));
    };

    fetchLiveScores();
    const interval = setInterval(fetchLiveScores, 5000);
    return () => clearInterval(interval);
  }, []);

  const liveMatches = scores.map((score) => {
    const meta = score.scoreMeta || {};
    const teamAName = meta.config?.teamAName || (meta.config?.teamA ? meta.config.teamA.join(' & ') : 'Team A');
    const teamBName = meta.config?.teamBName || (meta.config?.teamB ? meta.config.teamB.join(' & ') : 'Team B');
    const currentGameIndex = meta.currentGameIndex || 0;
    const games = meta.games || [];
    const currentGame = games[currentGameIndex] || {};
    const scoreA = currentGame.scoreA ?? (score.teamAScore || 0);
    const scoreB = currentGame.scoreB ?? (score.teamBScore || 0);

    const gamesWonA = games.filter((g: any) => g.winner === 'A').length;
    const gamesWonB = games.filter((g: any) => g.winner === 'B').length;

    return {
      id: score.scoreId,
      matchUuid: score.matchUuid,
      tournament: meta.config?.tournamentName || 'Tournament Match',
      category: meta.config?.category || 'Doubles',
      court: meta.config?.courtName || 'Court 1',
      player1: { name: teamAName, score: scoreA, games: gamesWonA, avatar: teamAName.charAt(0) },
      player2: { name: teamBName, score: scoreB, games: gamesWonB, avatar: teamBName.charAt(0) },
      status: `Game ${currentGameIndex + 1}`,
      duration: 'LIVE'
    };
  });

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

        {loading && (
          <div className="py-20 text-center text-foreground/50">
            <div className="w-8 h-8 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-bold uppercase tracking-wider">Loading Live Scores...</p>
          </div>
        )}

        {!loading && liveMatches.length === 0 && (
          <div className="bg-surface border border-foreground/10 rounded-2xl p-12 text-center text-foreground/50">
            <Shield className="w-12 h-12 text-foreground/20 mx-auto mb-3" />
            <p className="text-base font-bold text-foreground mb-1">No Active Live Matches</p>
            <p className="text-xs text-foreground/60 max-w-sm mx-auto">
              When umpires start scoring matches live, real-time points and scores will appear here.
            </p>
          </div>
        )}

        {/* Featured Live Match (Hero) - Marketing Design */}
        {!loading && liveMatches[0] && (
          <section className="bg-surface border border-foreground/5 rounded-[24px] p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-red-500 font-bold text-xs tracking-wider">LIVE</span>
                <span className="text-foreground font-bold text-xs tracking-wider">MATCH</span>
              </div>
              <span className="text-foreground/50 text-xs font-medium">{liveMatches[0].court}</span>
            </div>

            <div className="flex items-center justify-center">
              <span className="px-3 py-1 bg-background rounded-full text-[10px] font-bold text-foreground/60 uppercase tracking-widest border border-foreground/5 text-center">
                {liveMatches[0].tournament} • {liveMatches[0].category}
              </span>
            </div>

            <div className="flex items-center justify-between px-2 py-2">
              {/* Player 1 */}
              <div className="flex flex-col items-center gap-2 max-w-[110px]">
                <div className="w-16 h-16 rounded-full bg-gradient-to-b from-[#1B9C56] to-transparent p-[2px]">
                  <div className="w-full h-full rounded-full bg-background border-2 border-transparent overflow-hidden flex items-center justify-center">
                    <span className="text-xl font-black text-[#1B9C56]">{liveMatches[0].player1.avatar}</span>
                  </div>
                </div>
                <span className="font-bold text-xs tracking-wider uppercase text-center line-clamp-2 leading-tight">{liveMatches[0].player1.name}</span>
                <span className="text-4xl font-black text-[#1B9C56] leading-none tabular-nums">{liveMatches[0].player1.score}</span>
              </div>

              {/* VS & Game Status */}
              <div className="flex flex-col items-center justify-center gap-2 shrink-0">
                <div className="w-10 h-10 rounded-full bg-background border border-foreground/10 flex items-center justify-center">
                  <span className="text-foreground/50 font-bold text-sm">VS</span>
                </div>
                <span className="px-2 py-0.5 bg-background border border-foreground/5 rounded text-[10px] font-bold text-foreground/50 uppercase tracking-wider">
                  {liveMatches[0].status}
                </span>
              </div>

              {/* Player 2 */}
              <div className="flex flex-col items-center gap-2 max-w-[110px]">
                <div className="w-16 h-16 rounded-full bg-gradient-to-b from-white/20 to-transparent p-[2px]">
                  <div className="w-full h-full rounded-full bg-background border-2 border-transparent overflow-hidden flex items-center justify-center">
                    <span className="text-xl font-black text-foreground">{liveMatches[0].player2.avatar}</span>
                  </div>
                </div>
                <span className="font-bold text-xs tracking-wider uppercase text-center line-clamp-2 leading-tight">{liveMatches[0].player2.name}</span>
                <span className="text-4xl font-black text-foreground leading-none tabular-nums">{liveMatches[0].player2.score}</span>
              </div>
            </div>

            <Link href={`/live-score/${liveMatches[0].matchUuid}`} className="w-full py-3.5 bg-[#1B9C56] rounded-xl text-foreground font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
              WATCH LIVE <Tv className="w-4 h-4" />
            </Link>
          </section>
        )}

        {/* Other Live Matches List */}
        {!loading && liveMatches.length > 1 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-foreground/50 tracking-wider uppercase">More Live Matches</h3>
              <span className="text-[10px] font-bold bg-surface px-2.5 py-1 rounded-full text-foreground/70 border border-foreground/5">
                {liveMatches.length - 1} ACTIVE
              </span>
            </div>
            
            <div className="flex flex-col gap-3">
              {liveMatches.slice(1).map((match) => (
                <div key={match.id} className="bg-surface border border-foreground/5 rounded-[24px] p-4 shadow-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-red-500 font-bold text-[10px] tracking-wider">LIVE</span>
                      <span className="text-foreground/60 text-[10px] font-bold">{match.status}</span>
                    </div>
                    <span className="text-foreground/50 text-[10px]">{match.court}</span>
                  </div>

                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-background border border-foreground/10 flex items-center justify-center shrink-0">
                        <span className="font-bold text-xs text-[#1B9C56]">{match.player1.avatar}</span>
                      </div>
                      <span className="font-bold text-xs text-foreground truncate">{match.player1.name}</span>
                    </div>
                    <span className="text-2xl font-black text-[#1B9C56] tabular-nums ml-2">{match.player1.score}</span>
                  </div>

                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-background border border-foreground/10 flex items-center justify-center shrink-0">
                        <span className="font-bold text-xs text-foreground">{match.player2.avatar}</span>
                      </div>
                      <span className="font-bold text-xs text-foreground truncate">{match.player2.name}</span>
                    </div>
                    <span className="text-2xl font-black text-foreground tabular-nums ml-2">{match.player2.score}</span>
                  </div>

                  <Link href={`/live-score/${match.matchUuid}`} className="w-full py-2.5 bg-[#1B9C56]/10 border border-[#1B9C56]/30 text-[#1B9C56] rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-[#1B9C56]/20 transition-colors">
                    WATCH LIVE <Tv className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

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
