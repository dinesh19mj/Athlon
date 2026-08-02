import React, { useState } from 'react';
import { Player } from '@/lib/store/useMatchStore';

interface LineupModalProps {
  isOpen: boolean;
  battingTeam: Player[];
  bowlingTeam: Player[];
  onConfirm: (strikerId: string, nonStrikerId: string, bowlerId: string) => void;
}

export default function LineupModal({
  isOpen,
  battingTeam,
  bowlingTeam,
  onConfirm
}: LineupModalProps) {
  const [strikerId, setStrikerId] = useState('');
  const [nonStrikerId, setNonStrikerId] = useState('');
  const [bowlerId, setBowlerId] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 font-sans antialiased">
      <div className="bg-[#27272a] border border-white/10 rounded-xl w-full max-w-sm shadow-2xl flex flex-col p-6 gap-6">
        <div>
          <h2 className="text-xl font-bold text-white">Select Opening Players</h2>
          <p className="text-xs text-gray-400 mt-1">Please select the opening batters and bowler to begin.</p>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Striker</label>
            <select
              value={strikerId}
              onChange={(e) => setStrikerId(e.target.value)}
              className="w-full bg-[#18181b] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#3b82f6]/50"
            >
              <option value="" disabled>Select Striker</option>
              {battingTeam.filter(p => p.id !== nonStrikerId).map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-2 block">Non-Striker</label>
            <select
              value={nonStrikerId}
              onChange={(e) => setNonStrikerId(e.target.value)}
              className="w-full bg-[#18181b] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#3b82f6]/50"
            >
              <option value="" disabled>Select Non-Striker</option>
              {battingTeam.filter(p => p.id !== strikerId).map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-2 block">Opening Bowler</label>
            <select
              value={bowlerId}
              onChange={(e) => setBowlerId(e.target.value)}
              className="w-full bg-[#18181b] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#3b82f6]/50"
            >
              <option value="" disabled>Select Bowler</option>
              {bowlingTeam.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        <button 
          onClick={() => onConfirm(strikerId, nonStrikerId, bowlerId)}
          disabled={!strikerId || !nonStrikerId || !bowlerId}
          className="w-full py-3 mt-2 rounded-lg bg-white text-black text-sm font-bold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Start Innings
        </button>
      </div>
    </div>
  );
}
