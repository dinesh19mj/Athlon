import React, { useState } from 'react';
import { Player } from '@/lib/store/useMatchStore';

interface BowlerSelectModalProps {
  isOpen: boolean;
  bowlingTeam: Player[];
  onConfirm: (bowlerId: string) => void;
}

export default function BowlerSelectModal({
  isOpen,
  bowlingTeam,
  onConfirm
}: BowlerSelectModalProps) {
  const [bowlerId, setBowlerId] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 font-sans antialiased">
      <div className="bg-[#27272a] border border-white/10 rounded-xl w-full max-w-xs shadow-2xl flex flex-col p-6 gap-6">
        <div>
          <h2 className="text-xl font-bold text-white">Select Next Bowler</h2>
          <p className="text-xs text-gray-400 mt-1">Please select the bowler for the new over.</p>
        </div>

        <div>
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

        <button 
          onClick={() => onConfirm(bowlerId)}
          disabled={!bowlerId}
          className="w-full py-3 rounded-lg bg-white text-black text-sm font-bold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Confirm Bowler
        </button>
      </div>
    </div>
  );
}
