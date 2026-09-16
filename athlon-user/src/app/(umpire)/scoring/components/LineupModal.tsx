import React, { useState, useEffect } from 'react';
import { Player } from '@/lib/store/useMatchStore';
import { Users, Shield, Award } from 'lucide-react';

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
  onConfirm,
}: LineupModalProps) {
  const [strikerId, setStrikerId] = useState('');
  const [nonStrikerId, setNonStrikerId] = useState('');
  const [bowlerId, setBowlerId] = useState('');

  // Reset or preselect when opened
  useEffect(() => {
    if (isOpen) {
      const p1 = battingTeam[0]?.id || '';
      const p2 = battingTeam[1]?.id || '';
      const b1 = bowlingTeam[0]?.id || '';
      setStrikerId(p1);
      setNonStrikerId(p2 !== p1 ? p2 : '');
      setBowlerId(b1);
    }
  }, [isOpen, battingTeam, bowlingTeam]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 font-sans antialiased backdrop-blur-sm animate-in fade-in">
      <div className="bg-card border border-border rounded-3xl w-full max-w-sm shadow-2xl flex flex-col p-6 gap-5 animate-in zoom-in-95">
        <div>
          <div className="w-10 h-10 rounded-2xl bg-primary/20 text-primary flex items-center justify-center mb-2 text-xl font-bold">
            🏏
          </div>
          <h2 className="text-lg font-extrabold text-foreground">Select Opening Players</h2>
          <p className="text-xs text-text-muted mt-0.5">Choose opening batters and the bowler to begin.</p>
        </div>

        <div className="flex flex-col gap-3.5">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary mb-1.5 block">
              Striker (On Strike) *
            </label>
            <select
              value={strikerId}
              onChange={(e) => setStrikerId(e.target.value)}
              className="w-full bg-surface border border-border rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary transition"
            >
              <option value="" disabled>
                Select Striker
              </option>
              {battingTeam
                .filter((p) => p.id !== nonStrikerId)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary mb-1.5 block">
              Non-Striker (Runner) *
            </label>
            <select
              value={nonStrikerId}
              onChange={(e) => setNonStrikerId(e.target.value)}
              className="w-full bg-surface border border-border rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary transition"
            >
              <option value="" disabled>
                Select Non-Striker
              </option>
              {battingTeam
                .filter((p) => p.id !== strikerId)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary mb-1.5 block">
              Opening Bowler *
            </label>
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
        </div>

        <button
          onClick={() => onConfirm(strikerId, nonStrikerId, bowlerId)}
          disabled={!strikerId || !nonStrikerId || !bowlerId || strikerId === nonStrikerId}
          className="w-full py-3 mt-1 rounded-2xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary-hover transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
        >
          Start Innings
        </button>
      </div>
    </div>
  );
}
