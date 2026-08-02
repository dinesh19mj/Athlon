'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useVolleyballStore, Team } from '../../../../lib/store/useVolleyballStore';
import { Wifi, Battery, Signal, Circle, RotateCcw, Flag, Camera, Cast, Users, Undo2 } from 'lucide-react';
import VolleyballPointModal from '../components/VolleyballPointModal';
import VolleyballSubModal from '../components/VolleyballSubModal';
import VolleyballTimeoutModal from '../components/VolleyballTimeoutModal';

export default function VolleyballScoringBoard({ matchId }: { matchId: string }) {
  const router = useRouter();
  const store = useVolleyballStore();
  const [mounted, setMounted] = useState(false);

  const [activeModal, setActiveModal] = useState<'point' | 'sub' | 'timeout' | null>(null);
  const [activeTeam, setActiveTeam] = useState<Team>('A');

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
    <div className="flex flex-col h-[100dvh] bg-[#121212] text-white overflow-hidden font-sans select-none">
      
      {/* Top Header */}
      <header className="px-4 py-3 flex items-center justify-between border-b border-white/5 bg-[#18181b] shrink-0">
        <div className="flex items-center gap-2">
          <div className="px-2 py-0.5 bg-red-900/40 text-red-500 rounded text-xs font-medium tracking-wide">
            live
          </div>
          <span className="text-xs font-medium text-gray-400">
            best of {store.config.bestOfSets} • 6 v 6
          </span>
        </div>
        <div className="flex items-center gap-4 text-gray-400">
          <button onClick={() => {}} className="hover:text-white transition-colors">
            <Users className="w-5 h-5" />
          </button>
          <button onClick={() => store.undoLastAction()} className="hover:text-white transition-colors">
            <Undo2 className="w-5 h-5" />
          </button>
          <button onClick={() => window.open(`/stream/${store.config?.id}`, '_blank')} className="hover:text-white transition-colors">
            <Camera className="w-5 h-5" />
          </button>
          <button onClick={() => {}} className="hover:text-white transition-colors">
            <Cast className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 overflow-y-auto w-full">
        <div className="max-w-2xl mx-auto w-full h-full flex flex-col pb-8 pt-4 space-y-4 px-4">
          
          {/* Main Score Area */}
          <div className="bg-[#1C1C1E] border border-white/5 rounded-3xl p-6 relative flex flex-col items-center justify-center min-h-[220px]">
            {setPointFlag && (
              <div className="absolute top-4 text-orange-500 text-xs font-bold">
                {setPointFlag}
              </div>
            )}
            
            <div className="w-full flex items-center justify-between">
              <div className="w-1/3 flex items-center justify-end gap-2 pr-6">
                <span className={`text-lg font-bold ${store.servingTeam === 'A' ? 'text-red-400' : 'text-white/70'} truncate`}>
                  {teamA}
                </span>
                {store.servingTeam === 'A' && <Circle className="w-2 h-2 fill-green-500 text-green-500 shrink-0" />}
              </div>
              
              <div className="w-1/3 flex items-center justify-center gap-4 text-5xl font-black tabular-nums tracking-tighter shrink-0">
                <span>{store.pointsA}</span>
                <span className="text-white/30">—</span>
                <span>{store.pointsB}</span>
              </div>
              
              <div className="w-1/3 flex items-center justify-start gap-2 pl-6">
                {store.servingTeam === 'B' && <Circle className="w-2 h-2 fill-green-500 text-green-500 shrink-0" />}
                <span className={`text-lg font-bold ${store.servingTeam === 'B' ? 'text-white' : 'text-white/70'} truncate`}>
                  {teamB}
                </span>
              </div>
            </div>

            <div className="absolute bottom-4 text-xs text-white/40 font-bold">
              sets {store.setsA} — {store.setsB} · set {store.currentSet}
            </div>
          </div>

          {/* Previous Sets Strip */}
          {store.currentSet > 1 && (
            <div className="flex gap-4 overflow-x-auto hide-scrollbar">
              {store.setScores.map((score, idx) => (
                <div key={idx} className="flex flex-col items-center min-w-[60px] bg-[#1C1C1E]/50 rounded-xl py-2 px-4 border border-white/5">
                  <span className="text-[10px] text-white/40 font-bold mb-1">set {idx + 1}</span>
                  <span className="text-sm font-bold">{score.pointsA}–{score.pointsB}</span>
                </div>
              ))}
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Team A Details */}
            <div className="bg-[#1C1C1E] border border-white/5 rounded-2xl p-5 flex flex-col gap-3">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest truncate">{teamA}</span>
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/70 font-bold shrink-0">timeouts</span>
                <span className="font-bold whitespace-nowrap text-right">{store.timeoutsA} / 2 left</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/70 font-bold shrink-0">subs</span>
                <span className="font-bold whitespace-nowrap text-right">{store.subsUsedA} / 6 used</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/70 font-bold shrink-0">rotation</span>
                <span className="font-bold whitespace-nowrap text-right">pos {store.rotationPosA}</span>
              </div>
            </div>

            {/* Team B Details */}
            <div className="bg-[#1C1C1E] border border-white/5 rounded-2xl p-5 flex flex-col gap-3">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest truncate">{teamB}</span>
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/70 font-bold shrink-0">timeouts</span>
                <span className="font-bold whitespace-nowrap text-right">{store.timeoutsB} / 2 left</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/70 font-bold shrink-0">subs</span>
                <span className="font-bold whitespace-nowrap text-right">{store.subsUsedB} / 6 used</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/70 font-bold shrink-0">rotation</span>
                <span className="font-bold whitespace-nowrap text-right">pos {store.rotationPosB}</span>
              </div>
            </div>
          </div>

          {/* Recent Points Log */}
          <div className="flex flex-col gap-2 bg-[#1C1C1E]/50 border border-white/5 rounded-2xl p-4">
            <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-1">recent points</span>
            {store.recentPoints.slice(0, 3).map((event) => (
              <div key={event.id} className="text-sm text-white/70 font-medium">
                {event.scoreStr} — {event.details}
              </div>
            ))}
            {store.recentPoints.length === 0 && (
              <div className="text-sm text-white/30 italic">No points scored yet</div>
            )}
          </div>

          {/* Action Pad */}
          <div className="flex flex-col gap-4 mt-auto pt-4">
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handlePointClick('A')}
                className="bg-[#1C1C1E] border border-red-500/20 text-red-400 py-6 rounded-2xl text-lg font-black hover:bg-red-500/10 transition-all shadow-[0_0_15px_rgba(239,68,68,0.05)] truncate px-2"
              >
                point · {teamA}
              </button>
              <button
                onClick={() => handlePointClick('B')}
                className="bg-[#1C1C1E] border border-white/10 text-white py-6 rounded-2xl text-lg font-black hover:bg-white/5 transition-all truncate px-2"
              >
                point · {teamB}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={handleTimeoutClick}
                className="bg-[#1C1C1E] border border-white/5 text-white/70 py-4 rounded-xl text-sm font-bold hover:bg-[#2C2C2E] transition-all flex flex-col items-center gap-1"
              >
                <RotateCcw className="w-5 h-5 mb-1" />
                timeout
              </button>
              <button
                onClick={handleSubClick}
                className="bg-[#1C1C1E] border border-white/5 text-white/70 py-4 rounded-xl text-sm font-bold hover:bg-[#2C2C2E] transition-all flex flex-col items-center gap-1"
              >
                <RotateCcw className="w-5 h-5 mb-1" />
                sub
              </button>
              <button
                className="bg-[#1C1C1E] border border-white/5 text-white/70 py-4 rounded-xl text-sm font-bold hover:bg-[#2C2C2E] transition-all flex flex-col items-center gap-1 opacity-50 cursor-not-allowed"
              >
                <Flag className="w-5 h-5 mb-1" />
                challenge
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <button
                onClick={() => store.undoLastAction()}
                className="bg-[#1C1C1E] border border-white/5 text-white/70 py-4 rounded-xl text-sm font-bold hover:bg-[#2C2C2E] transition-all"
              >
                undo last point
              </button>
              <button
                onClick={() => {}} // End Set might need specific logic or confirmation
                className="bg-white text-black py-4 rounded-xl text-sm font-black hover:bg-white/90 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              >
                end set
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
    </div>
  );
}
