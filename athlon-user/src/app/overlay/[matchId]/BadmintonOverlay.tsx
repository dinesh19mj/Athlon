'use client';

import React, { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';
import { ScoringService } from '@/lib/api/scoring';
import { MatchState, Team } from '@/lib/store/useMatchStore';

export default function BadmintonOverlay({ params }: { params: Promise<{ matchId: string }> }) {
  const [matchId, setMatchId] = useState<string | null>(null);
  const [state, setState] = useState<MatchState | null>(null);

  useEffect(() => {
    params.then(p => setMatchId(p.matchId));
  }, [params]);

  useEffect(() => {
    if (!matchId) return;

    const fetchState = async () => {
      try {
        const res = await ScoringService.getState(matchId as string);
        if (res && res.data && res.data.scoreMeta) {
          setState(res.data.scoreMeta);
        }
      } catch (err) {
        console.error('Failed to fetch overlay state', err);
      }
    };

    fetchState();
    const interval = setInterval(fetchState, 1000);
    return () => clearInterval(interval);
  }, [matchId]);

  if (!state || !state.config) return null;

  const { config, games, currentGameIndex, teamsFlipped } = state;
  const currentGame = games[currentGameIndex];

  if (!currentGame) return null;

  const isServeA = currentGame.currentServer === 'A';
  const isServeB = currentGame.currentServer === 'B';
  const isOfficial = true; // Derived from match type if available

  const teamAThemeClass = !teamsFlipped ? 'text-primary' : 'text-[#3B82F6]';
  const teamADotClass = !teamsFlipped ? 'bg-primary shadow-[0_0_8px_var(--athlon-primary)]' : 'bg-[#3B82F6] shadow-[0_0_8px_#3B82F6]';

  const teamBThemeClass = teamsFlipped ? 'text-primary' : 'text-[#3B82F6]';
  const teamBDotClass = teamsFlipped ? 'bg-primary shadow-[0_0_8px_var(--athlon-primary)]' : 'bg-[#3B82F6] shadow-[0_0_8px_#3B82F6]';

  return (
    <div className="min-h-screen bg-transparent p-8 font-sans antialiased text-foreground selection:bg-transparent relative w-full overflow-hidden">

      {/* Logo: Top Right */}
      <div className="absolute top-8 right-8 z-30">
        <img src="/athlon-logo.png" alt="Athlon Sports" className="h-20 object-contain drop-shadow-xl" />
      </div>

      {/* Scorecard: Top Left */}
      <div className="absolute top-8 left-8 flex flex-col items-start relative mt-2 w-full max-w-[440px] z-20">


        <div className={`w-full bg-surface rounded-2xl py-1 shadow-2xl border border-foreground/5 relative overflow-hidden flex flex-col gap-1`}>
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-b from-[#8B5CF6] to-[#3B82F6] opacity-80" />

          <div className={`flex items-center justify-between relative pl-10 pr-4 py-1`}>
            <div className="flex items-center gap-3">
              <span className="text-foreground/40 font-mono text-xs absolute left-3">-</span>
              <div className="w-4 h-4 rounded-full bg-foreground/20 flex items-center justify-center overflow-hidden shrink-0">
                <div className="w-full h-1/3 bg-[#FF9933]" />
                <div className="w-full h-1/3 bg-white" />
                <div className="w-full h-1/3 bg-[#138808]" />
                <div className="absolute w-1.5 h-1.5 rounded-full border border-[#000080]" />
              </div>
              <span className="text-[15px] font-medium text-foreground/90 truncate">{config.teamA.join(' / ')}</span>
            </div>
            <div className="flex items-center gap-3">
              {isServeA ? <div className={`w-2.5 h-2.5 rounded-full ${teamADotClass}`} /> : <div className="w-2.5 h-2.5" />}
              <div className="flex items-center gap-3">
                {Array.from({ length: config.bestOfSets }).map((_, i) => {
                  const g = games[i];
                  if (!g && i > currentGameIndex) return <span key={i} className="text-lg font-medium w-6 text-right text-foreground/20">-</span>;
                  return (
                    <span key={i} className={`text-lg font-medium w-6 text-right ${i === currentGameIndex ? teamAThemeClass : 'text-foreground/80'}`}>
                      {g ? g.scoreA : 0}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="h-[1px] w-full bg-foreground/5 pl-10" />

          <div className={`flex items-center justify-between relative pl-10 pr-4 py-1`}>
            <div className="flex items-center gap-3">
              <span className="text-foreground/40 font-mono text-xs absolute left-3">-</span>
              <div className="w-4 h-4 rounded-full bg-foreground/20 flex items-center justify-center overflow-hidden shrink-0">
                <div className="w-full h-1/3 bg-[#FF9933]" />
                <div className="w-full h-1/3 bg-white" />
                <div className="w-full h-1/3 bg-[#138808]" />
                <div className="absolute w-1.5 h-1.5 rounded-full border border-[#000080]" />
              </div>
              <span className="text-[15px] font-medium text-foreground/90 truncate">{config.teamB.join(' / ')}</span>
            </div>
            <div className="flex items-center gap-3">
              {isServeB ? <div className={`w-2.5 h-2.5 rounded-full ${teamBDotClass}`} /> : <div className="w-2.5 h-2.5" />}
              <div className="flex items-center gap-3">
                {Array.from({ length: config.bestOfSets }).map((_, i) => {
                  const g = games[i];
                  if (!g && i > currentGameIndex) return <span key={i} className="text-lg font-medium w-6 text-right text-foreground/20">-</span>;
                  return (
                    <span key={i} className={`text-lg font-medium w-6 text-right ${i === currentGameIndex ? teamBThemeClass : 'text-foreground/80'}`}>
                      {g ? g.scoreB : 0}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
