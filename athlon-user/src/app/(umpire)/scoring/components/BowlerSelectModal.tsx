import React, { useState, useEffect } from 'react';
import { Player } from '@/lib/store/useMatchStore';

interface BowlerSelectModalProps {
  isOpen: boolean;
  bowlingTeam: Player[];
  onConfirm: (bowlerId: string) => void;
}

export default function BowlerSelectModal({
  isOpen,
  bowlingTeam,
  onConfirm,
}: BowlerSelectModalProps) {
  const [bowlerId, setBowlerId] = useState('');

  useEffect(() => {
    if (isOpen && bowlingTeam.length > 0) {
      setBowlerId(bowlingTeam[0]?.id || '');
    }
  }, [isOpen, bowlingTeam]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 font-sans antialiased backdrop-blur-sm animate-in fade-in">
      <div className="bg-card border border-border rounded-3xl w-full max-w-xs shadow-2xl flex flex-col p-6 gap-5 animate-in zoom-in-95">
        <div>
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center mb-2 text-xl font-bold">
            🎯
          </div>
          <h2 className="text-lg font-extrabold text-foreground">Select Next Bowler</h2>
          <p className="text-xs text-text-muted mt-0.5">Please choose the bowler for the new over.</p>
        </div>

        <div>
          <select
            value={bowlerId}
            onChange={(e) => setBowlerId(e.target.value)}
            className="w-full bg-surface border border-border rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary transition"
          >
            <option value="" disabled>
              Select Bowler
            </option>
            {bowlingTeam.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => onConfirm(bowlerId)}
          disabled={!bowlerId}
          className="w-full py-3 rounded-2xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary-hover transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
        >
          Confirm Bowler
        </button>
      </div>
    </div>
  );
}
