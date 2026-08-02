import React, { useState, useEffect } from 'react';
import { useVolleyballStore, Team } from '../../../../lib/store/useVolleyballStore';
import { X, Check } from 'lucide-react';

interface VolleyballSubModalProps {
  matchId: string;
  isOpen: boolean;
  onClose: () => void;
  defaultTeam?: Team;
}

export default function VolleyballSubModal({ matchId, isOpen, onClose, defaultTeam = 'A' }: VolleyballSubModalProps) {
  const store = useVolleyballStore();
  const [team, setTeam] = useState<Team>(defaultTeam);
  const [rotationPos, setRotationPos] = useState<number>(1);
  const [playerOffId, setPlayerOffId] = useState<string>('');
  const [playerOnId, setPlayerOnId] = useState<string>('');
  const [isLibero, setIsLibero] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTeam(defaultTeam);
      setRotationPos(1);
      setPlayerOffId('');
      setPlayerOnId('');
      setIsLibero(false);
    }
  }, [isOpen, defaultTeam]);

  if (!isOpen) return null;

  const players = team === 'A' ? store.playersA : store.playersB;
  const onFieldPlayers = players.filter(p => p.onField);
  const offFieldPlayers = players.filter(p => !p.onField);
  const subsUsed = team === 'A' ? store.subsUsedA : store.subsUsedB;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerOffId || !playerOnId) return;
    
    store.addSubstitutionDetailed(team, playerOffId, playerOnId, isLibero);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1C1C1E] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-sm font-black text-white/90">Substitution</h2>
          <button onClick={onClose} className="p-2 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 pt-4 pb-2 text-xs text-white/50">
          set {store.currentSet} · score {store.pointsA}–{store.pointsB} · subs used team {team}: {subsUsed}/6
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 pt-2">
          {/* Team Selection */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-2">Team</label>
            <div className="flex bg-[#2C2C2E] border border-white/10 rounded-xl p-1">
              <button
                type="button"
                onClick={() => setTeam('A')}
                className={`flex-1 py-3 rounded-lg text-xs font-bold transition-all ${
                  team === 'A' ? 'bg-[#3C3C3E] text-blue-400 shadow-md border border-white/5' : 'text-white/40 hover:text-white'
                }`}
              >
                {store.config?.teamA || 'Team A'}
              </button>
              <button
                type="button"
                onClick={() => setTeam('B')}
                className={`flex-1 py-3 rounded-lg text-xs font-bold transition-all ${
                  team === 'B' ? 'bg-[#3C3C3E] text-white shadow-md border border-white/5' : 'text-white/40 hover:text-white'
                }`}
              >
                {store.config?.teamB || 'Team B'}
              </button>
            </div>
          </div>

          {/* Rotation Position */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-2">Rotation Position</label>
            <div className="grid grid-cols-6 gap-2">
              {[1, 2, 3, 4, 5, 6].map((pos) => (
                <button
                  key={pos}
                  type="button"
                  onClick={() => setRotationPos(pos)}
                  className={`py-3 rounded-lg border text-xs font-bold transition-all ${
                    rotationPos === pos
                      ? 'bg-[#3C3C3E] border-blue-400/50 text-blue-400'
                      : 'bg-[#2C2C2E] border-white/5 text-white/40 hover:text-white'
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>

          {/* Players */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-2">Player Off</label>
              <select
                value={playerOffId}
                onChange={(e) => setPlayerOffId(e.target.value)}
                className="w-full bg-[#2C2C2E] border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-blue-500"
                required
              >
                <option value="">Select player</option>
                {onFieldPlayers.map(p => (
                  <option key={p.id} value={p.id}>{p.name} {p.jerseyNumber ? `(#${p.jerseyNumber})` : ''}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-2">Player On</label>
              <select
                value={playerOnId}
                onChange={(e) => setPlayerOnId(e.target.value)}
                className="w-full bg-[#2C2C2E] border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-blue-500"
                required
              >
                <option value="">Select player</option>
                {offFieldPlayers.map(p => (
                  <option key={p.id} value={p.id}>{p.name} {p.jerseyNumber ? `(#${p.jerseyNumber})` : ''}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Libero toggle */}
          <label className="flex items-center gap-3 p-4 bg-[#2C2C2E] border border-white/5 rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={isLibero}
              onChange={(e) => setIsLibero(e.target.checked)}
              className="w-5 h-5 rounded border-white/20 bg-black/50 text-blue-500 focus:ring-0 focus:ring-offset-0"
            />
            <span className="text-xs text-white/60">Libero swaps don't count against the 6-sub limit</span>
          </label>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-[#2C2C2E] text-white/70 py-4 rounded-xl text-sm font-bold hover:bg-[#3C3C3E] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!playerOffId || !playerOnId}
              className="flex-1 bg-white text-black py-4 rounded-xl text-sm font-black hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Confirm Sub
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
