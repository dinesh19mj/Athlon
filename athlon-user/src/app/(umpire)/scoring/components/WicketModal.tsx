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
  onConfirm
}: WicketModalProps) {
  const [type, setType] = useState('bowled');
  const [fielderId, setFielderId] = useState('');
  const [nextBatterId, setNextBatterId] = useState('');

  if (!isOpen) return null;

  const requiresFielder = ['caught', 'run out', 'stumped'].includes(type);

  // Available batters: Not out, and not currently on the pitch
  const availableBatters = battingTeam.filter(p => 
    !alreadyBattedIds.includes(p.id) && p.id !== strikerId && p.id !== nonStrikerId
  );

  const handleConfirm = () => {
    onConfirm(type, nextBatterId, fielderId);
    // Reset state for next time
    setType('bowled');
    setFielderId('');
    setNextBatterId('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 font-sans antialiased">
      <div className="bg-[#27272a] border border-white/10 rounded-xl w-full max-w-md shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div>
            <h2 className="text-xl font-bold text-white">wicket — {batterName}</h2>
            <p className="text-xs text-gray-400 mt-1">out at {overStr} • score {scoreStr}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-5">
          {/* How Out */}
          <div>
            <label className="text-xs text-gray-400 mb-2 block">how out</label>
            <div className="grid grid-cols-2 gap-3">
              {DISMISSAL_TYPES.map(d => (
                <button
                  key={d}
                  onClick={() => setType(d)}
                  className={`py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                    type === d 
                      ? 'bg-[#1e3a8a]/30 border-[#3b82f6]/50 text-[#60a5fa]' 
                      : 'bg-[#18181b] border-white/10 text-gray-300 hover:bg-white/5'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Fielder */}
          <div>
            <label className={`text-xs block mb-2 ${requiresFielder ? 'text-gray-400' : 'text-gray-600'}`}>
              fielder (if caught / run out / stumped)
            </label>
            <select
              value={fielderId}
              onChange={(e) => setFielderId(e.target.value)}
              disabled={!requiresFielder}
              className="w-full bg-[#18181b] border border-white/10 rounded-lg px-4 py-3 text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:border-[#3b82f6]/50"
            >
              <option value="" disabled>select fielder</option>
              {fieldingTeam.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Next Batter */}
          <div>
            <label className="text-xs text-gray-400 mb-2 block">next batter</label>
            <select
              value={nextBatterId}
              onChange={(e) => setNextBatterId(e.target.value)}
              className="w-full bg-[#18181b] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#3b82f6]/50"
            >
              <option value="" disabled>select next batter</option>
              {availableBatters.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
              {availableBatters.length === 0 && (
                <option value="none">End of Innings (All Out)</option>
              )}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-2 flex items-center gap-3">
          <button 
            onClick={onClose} 
            className="flex-1 py-3 rounded-lg border border-white/10 text-sm font-medium text-gray-300 hover:bg-white/5 transition-colors"
          >
            cancel
          </button>
          <button 
            onClick={handleConfirm}
            disabled={!nextBatterId || (requiresFielder && !fielderId)}
            className="flex-1 py-3 rounded-lg bg-white text-black text-sm font-bold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            confirm wicket
          </button>
        </div>
      </div>
    </div>
  );
}
