'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useVolleyballStore, Team } from '../../../../lib/store/useVolleyballStore';
import { Wifi, Battery, Signal, Circle, RotateCcw, Flag, Camera, Cast, Users, Undo2, Palette } from 'lucide-react';
import VolleyballPointModal from '../components/VolleyballPointModal';
import VolleyballSubModal from '../components/VolleyballSubModal';
import VolleyballTimeoutModal from '../components/VolleyballTimeoutModal';
import { ThemeModal } from '@/components/theme/ThemeModal';

export default function VolleyballScoringBoard({ matchId }: { matchId: string }) {
  const router = useRouter();
  const store = useVolleyballStore();
  const [mounted, setMounted] = useState(false);

  const [activeModal, setActiveModal] = useState<'point' | 'sub' | 'timeout' | null>(null);
  const [activeTeam, setActiveTeam] = useState<Team>('A');
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!store.config) {
      router.push('/match-setup');
    }
  }, [store.config, router]);

  if (!mounted || !store.config) return null;

  const teamA = store.config.teamA || 'Team A';
  const teamB = store.config.teamB || 'Team B';

  const isDecidingSet = store.currentSet === store.config.bestOfSets;
  const targetPoints = isDecidingSet ? 15 : store.config.pointsPerSet;
  const hardCap = isDecidingSet ? 20 : 30;

  let setPointFlag: string | null = null;
  if ((store.pointsA >= targetPoints - 1 && store.pointsA > store.pointsB) || store.pointsA === hardCap - 1) {
    const isMatchPoint = store.setsA === Math.ceil(store.config.bestOfSets / 2) - 1;
    setPointFlag = `${isMatchPoint ? 'match point' : 'set point'} — ${teamA}`;
  } else if ((store.pointsB >= targetPoints - 1 && store.pointsB > store.pointsA) || store.pointsB === hardCap - 1) {
    const isMatchPoint = store.setsB === Math.ceil(store.config.bestOfSets / 2) - 1;
    setPointFlag = `${isMatchPoint ? 'match point' : 'set point'} — ${teamB}`;
  }

  const handlePointClick = (team: Team) => {
    setActiveTeam(team);
    setActiveModal('point');
  };

  const handleSubClick = () => {
    setActiveTeam('A');
    setActiveModal('sub');
  };

  const handleTimeoutClick = () => {
    setActiveTeam('A');
    setActiveModal('timeout');
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-background text-foreground overflow-hidden font-sans select-none">
      
      {/* Top Header */}
      <header className="px-4 py-3 flex items-center justify-between border-b border-foreground/10 bg-surface/90 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2">
          <div className="px-2 py-0.5 bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 rounded-md text-xs font-black uppercase tracking-wider">
            live
          </div>
          <span className="text-xs font-bold text-foreground/50">
            Best of {store.config.bestOfSets} • 6v6
          </span>
        </div>
        <div className="flex items-center gap-2 text-foreground/70">
          <button onClick={() => setIsThemeModalOpen(true)} title="Choose Theme" className="p-2 rounded-xl hover:bg-foreground/5 text-primary transition-colors">
            <Palette className="w-5 h-5" />
          </button>
          <button onClick={() => {}} className="p-2 rounded-xl hover:bg-foreground/5 text-foreground/70 hover:text-foreground transition-colors">
            <Users className="w-5 h-5" />
          </button>
          <button onClick={() => store.undoLastAction()} className="p-2 rounded-xl hover:bg-foreground/5 text-foreground/70 hover:text-foreground transition-colors">
            <Undo2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 overflow-y-auto w-full">
        <div className="max-w-2xl mx-auto w-full h-full flex flex-col pb-8 pt-4 space-y-4 px-4">
          
          {/* Main Score Area */}
          <div className="bg-surface border border-foreground/10 rounded-2xl p-6 relative flex flex-col items-center justify-center min-h-[220px] shadow-sm">
            {setPointFlag && (
              <div className="absolute top-4 text-amber-500 text-xs font-black uppercase tracking-wider">
                {setPointFlag}
              </div>
            )}
            
            <div className="w-full flex items-center justify-between">
              <div className="w-1/3 flex items-center justify-end gap-2 pr-4">
                <span className={`text-base font-black uppercase ${store.servingTeam === 'A' ? 'text-primary' : 'text-foreground/70'} truncate`}>
                  {teamA}
                </span>
                {store.servingTeam === 'A' && <Circle className="w-2.5 h-2.5 fill-primary text-primary shrink-0 animate-pulse" />}
              </div>
              
              <div className="w-1/3 flex items-center justify-center gap-4 text-5xl font-black tabular-nums tracking-tighter text-foreground shrink-0 font-mono">
                <span>{store.pointsA}</span>
                <span className="text-foreground/20">—</span>
                <span>{store.pointsB}</span>
              </div>
              
              <div className="w-1/3 flex items-center justify-start gap-2 pl-4">
                {store.servingTeam === 'B' && <Circle className="w-2.5 h-2.5 fill-primary text-primary shrink-0 animate-pulse" />}
                <span className={`text-base font-black uppercase ${store.servingTeam === 'B' ? 'text-primary' : 'text-foreground/70'} truncate`}>
                  {teamB}
                </span>
              </div>
            </div>

            <div className="absolute bottom-4 text-xs text-foreground/45 font-bold uppercase tracking-wider">
              Sets {store.setsA} — {store.setsB} · Set {store.currentSet}
            </div>
          </div>

          {/* Previous Sets Strip */}
          {store.currentSet > 1 && (
            <div className="flex gap-2.5 overflow-x-auto hide-scrollbar">
              {store.setScores.map((score, idx) => (
                <div key={idx} className="flex flex-col items-center min-w-[60px] bg-surface rounded-xl py-2 px-3 border border-foreground/10 shadow-sm">
                  <span className="text-[10px] text-foreground/40 font-bold uppercase mb-0.5">Set {idx + 1}</span>
                  <span className="text-xs font-black font-mono">{score.pointsA}–{score.pointsB}</span>
                </div>
              ))}
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Team A Details */}
            <div className="bg-surface border border-foreground/10 rounded-2xl p-4 flex flex-col gap-2.5 shadow-sm">
              <span className="text-[10px] font-black text-foreground/45 uppercase tracking-wider truncate">{teamA}</span>
              <div className="flex justify-between items-center text-xs">
                <span className="text-foreground/60 font-bold">Timeouts</span>
                <span className="font-bold text-foreground font-mono">{store.timeoutsA} / 2 left</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-foreground/60 font-bold">Subs</span>
                <span className="font-bold text-foreground font-mono">{store.subsUsedA} / 6 used</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-foreground/60 font-bold">Rotation</span>
                <span className="font-bold text-foreground font-mono">Pos {store.rotationPosA}</span>
              </div>
            </div>

            {/* Team B Details */}
            <div className="bg-surface border border-foreground/10 rounded-2xl p-4 flex flex-col gap-2.5 shadow-sm">
              <span className="text-[10px] font-black text-foreground/45 uppercase tracking-wider truncate">{teamB}</span>
              <div className="flex justify-between items-center text-xs">
                <span className="text-foreground/60 font-bold">Timeouts</span>
                <span className="font-bold text-foreground font-mono">{store.timeoutsB} / 2 left</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-foreground/60 font-bold">Subs</span>
                <span className="font-bold text-foreground font-mono">{store.subsUsedB} / 6 used</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-foreground/60 font-bold">Rotation</span>
                <span className="font-bold text-foreground font-mono">Pos {store.rotationPosB}</span>
              </div>
            </div>
          </div>

          {/* Action Pad */}
          <div className="flex flex-col gap-3 mt-auto pt-2">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handlePointClick('A')}
                className="bg-primary/15 border border-primary/30 text-primary py-5 rounded-2xl text-base font-black hover:bg-primary/25 active:scale-95 transition-all shadow-sm truncate px-2 uppercase"
              >
                Point · {teamA}
              </button>
              <button
                onClick={() => handlePointClick('B')}
                className="bg-surface border border-foreground/10 text-foreground py-5 rounded-2xl text-base font-black hover:bg-foreground/5 active:scale-95 transition-all shadow-sm truncate px-2 uppercase"
              >
                Point · {teamB}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <button
                onClick={handleTimeoutClick}
                className="bg-surface border border-foreground/10 text-foreground/80 py-3 rounded-xl text-xs font-bold hover:bg-foreground/5 transition-all flex flex-col items-center gap-1 active:scale-95"
              >
                <RotateCcw className="w-4 h-4 mb-0.5" />
                Timeout
              </button>
              <button
                onClick={handleSubClick}
                className="bg-surface border border-foreground/10 text-foreground/80 py-3 rounded-xl text-xs font-bold hover:bg-foreground/5 transition-all flex flex-col items-center gap-1 active:scale-95"
              >
                <Users className="w-4 h-4 mb-0.5" />
                Sub
              </button>
              <button
                onClick={() => store.undoLastAction()}
                className="bg-surface border border-foreground/10 text-foreground/80 py-3 rounded-xl text-xs font-bold hover:bg-foreground/5 transition-all flex flex-col items-center gap-1 active:scale-95"
              >
                <Undo2 className="w-4 h-4 mb-0.5" />
                Undo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <VolleyballPointModal
        matchId={matchId}
        isOpen={activeModal === 'point'}
        onClose={() => setActiveModal(null)}
        team={activeTeam}
      />
      <VolleyballSubModal
        matchId={matchId}
        isOpen={activeModal === 'sub'}
        onClose={() => setActiveModal(null)}
        defaultTeam={activeTeam}
      />
      <VolleyballTimeoutModal
        matchId={matchId}
        isOpen={activeModal === 'timeout'}
        onClose={() => setActiveModal(null)}
        team={activeTeam}
      />

      {/* Theme Modal */}
      <ThemeModal open={isThemeModalOpen} onClose={() => setIsThemeModalOpen(false)} />
    </div>
  );
}
