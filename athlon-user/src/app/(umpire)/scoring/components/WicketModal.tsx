import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Player } from '@/lib/store/useMatchStore';

interface WicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  batterName: string;
  batterId: string;
  scoreStr: string;
  overStr: string;
  fieldingTeam: Player[];
  battingTeam: Player[];
  alreadyBattedIds: string[];
  strikerId: string | null;
  nonStrikerId: string | null;
  onConfirm: (type: string, nextBatterId: string, fielderId: string) => void;
}

const DISMISSAL_TYPES = ['bowled', 'caught', 'run out', 'stumped', 'lbw', 'hit wicket'];

export default function WicketModal({
  isOpen,
  onClose,
  batterName,
  batterId,
  scoreStr,
  overStr,
  fieldingTeam,
  battingTeam,
  alreadyBattedIds,
  strikerId,
  nonStrikerId,
  onConfirm,
}: WicketModalProps) {
  const [type, setType] = useState('bowled');
  const [fielderId, setFielderId] = useState('');
  const [nextBatterId, setNextBatterId] = useState('');

  if (!isOpen) return null;

  const requiresFielder = ['caught', 'run out', 'stumped'].includes(type);

  // Available batters: Not out, and not currently on the pitch
  const availableBatters = battingTeam.filter(
    (p) => !alreadyBattedIds.includes(p.id) && p.id !== strikerId && p.id !== nonStrikerId
  );

  const handleConfirm = () => {
    onConfirm(type, nextBatterId, fielderId);
    setType('bowled');
    setFielderId('');
    setNextBatterId('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 font-sans antialiased backdrop-blur-sm animate-in fade-in">
      <div className="bg-card border border-border rounded-3xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-border bg-surface/50">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-500">Wicket Fallen</span>
            <h2 className="text-base sm:text-lg font-extrabold text-foreground">Out — {batterName}</h2>
            <p className="text-[11px] text-text-muted mt-0.5">
              Score: {scoreStr} • Over: {overStr}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-text-muted hover:text-foreground hover:bg-surface transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
          {/* How Out */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary mb-2 block">
              Dismissal Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {DISMISSAL_TYPES.map((d) => (
                <button
                  key={d}
                  onClick={() => setType(d)}
                  className={`py-2 rounded-xl text-xs font-bold border transition capitalize ${
                    type === d
                      ? 'bg-rose-500/15 border-rose-500/50 text-rose-500 shadow-sm'
                      : 'bg-surface border-border text-text-secondary hover:text-foreground hover:bg-surface-hover'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Fielder */}
          <div>
            <label
              className={`text-[11px] font-bold uppercase tracking-wider block mb-1.5 ${
                requiresFielder ? 'text-text-secondary' : 'text-text-muted opacity-60'
              }`}
            >
              Fielder {requiresFielder ? '*' : '(Not required)'}
            </label>
            <select
              value={fielderId}
              onChange={(e) => setFielderId(e.target.value)}
              disabled={!requiresFielder}
              className="w-full bg-surface border border-border rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-foreground disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:border-primary transition"
            >
              <option value="">Select Fielder</option>
              {fieldingTeam.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Next Batter */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary mb-1.5 block">
              Next Batter *
            </label>
            <select
              value={nextBatterId}
              onChange={(e) => setNextBatterId(e.target.value)}
              className="w-full bg-surface border border-border rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary transition"
            >
              <option value="" disabled>
                Select Next Batter
              </option>
              {availableBatters.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
              <option value="none">End of Innings (All Out)</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-border bg-surface/50 flex items-center gap-2.5">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-border text-xs font-bold text-text-secondary hover:bg-surface transition"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!nextBatterId || (requiresFielder && !fielderId)}
            className="flex-1 py-2.5 rounded-xl bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            Confirm Wicket
          </button>
        </div>
      </div>
    </div>
  );
}
