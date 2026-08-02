import React, { useState } from 'react';
import { useVolleyballStore, Team, MatchEvent } from '../../../../lib/store/useVolleyballStore';
import { Player } from '../../../../lib/store/useMatchStore';
import { X, Check } from 'lucide-react';

interface VolleyballPointModalProps {
  matchId: string;
  isOpen: boolean;
  onClose: () => void;
  team: Team;
}

export default function VolleyballPointModal({ matchId, isOpen, onClose, team }: VolleyballPointModalProps) {
  const store = useVolleyballStore();
  const [pointType, setPointType] = useState<MatchEvent['type']>('Kill');
  const [scorerId, setScorerId] = useState<string>('');

  if (!isOpen) return null;

  const players = team === 'A' ? store.playersA : store.playersB;
  const onFieldPlayers = players.filter(p => p.onField);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    store.addPointDetailed(team, pointType, scorerId || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1C1C1E] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-sm font-black text-white/90">
            Log Point — {team === 'A' ? store.config?.teamA : store.config?.teamB}
          </h2>
          <button onClick={onClose} className="p-2 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-2">Point Type</label>
            <div className="grid grid-cols-2 gap-2">
              {['Kill', 'Ace', 'Block', 'Opponent Error'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setPointType(type as MatchEvent['type'])}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                    pointType === type
                      ? 'bg-red-500/10 border-red-500 text-red-500'
                      : 'bg-[#2C2C2E] border-white/5 text-white/60 hover:bg-[#3C3C3E]'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {pointType !== 'Opponent Error' && (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-2">Scorer</label>
              <select
                value={scorerId}
                onChange={(e) => setScorerId(e.target.value)}
                className="w-full bg-[#2C2C2E] border border-white/10 rounded-xl p-4 text-sm font-bold text-white focus:outline-none focus:border-red-500 transition-colors"
                required
              >
                <option value="">Select player</option>
                {onFieldPlayers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.jerseyNumber ? `(#${p.jerseyNumber})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-white text-black font-black py-4 rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-white/90 active:scale-[0.98] transition-all"
            >
              <Check className="w-4 h-4" />
              Confirm Point
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
