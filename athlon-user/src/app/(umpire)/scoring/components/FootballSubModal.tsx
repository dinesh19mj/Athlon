import { useState } from 'react';
import { useFootballStore } from '@/lib/store/useFootballStore';

interface FootballSubModalProps {
  onClose: () => void;
  timeStr: string;
}

export default function FootballSubModal({ onClose, timeStr }: FootballSubModalProps) {
  const store = useFootballStore();
  
  const [team, setTeam] = useState<'A' | 'B'>('A');
  const [playerOffId, setPlayerOffId] = useState<string>('');
  const [playerOnId, setPlayerOnId] = useState<string>('');

  const players = team === 'A' ? store.playersA : store.playersB;
  const subsUsed = team === 'A' ? store.subsUsedA : store.subsUsedB;
  const maxSubs = store.config?.subsPerTeam || 5;

  const onFieldPlayers = players.filter(p => p.onField !== false);
  const benchPlayers = players.filter(p => p.onField === false);

  const handleSubmit = () => {
    if (!playerOffId || !playerOnId) {
      alert('Please select both players');
      return;
    }
    
    // In many amateur rules they allow rolling subs, but if the limit is reached we might warn.
    // For now we just log it and the UI will show 6/5 if they exceed it (as a visual indicator).
    
    store.addSubstitutionDetailed(team, playerOffId, playerOnId, timeStr);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#2A2A2A] rounded-2xl w-full max-w-md shadow-2xl border border-white/5 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div>
            <h2 className="text-xl font-bold text-white">substitution</h2>
            <p className="text-sm text-white/50">{timeStr} • {store.currentHalf === 1 ? '1st half' : store.currentHalf === 2 ? '2nd half' : `Half ${store.currentHalf}`} • subs used: {team === 'A' ? store.config?.teamA || 'Team A' : store.config?.teamB || 'Team B'} {subsUsed}/{maxSubs}</p>
          </div>
          <button onClick={onClose} className="p-2 text-white/50 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
            ✕
          </button>
        </div>

        <div className="p-5 space-y-5">
          
          {/* Team Selection */}
          <div className="space-y-2">
            <label className="text-xs text-white/50 font-bold">team</label>
            <div className="flex gap-3">
              <button
                onClick={() => { setTeam('A'); setPlayerOffId(''); setPlayerOnId(''); }}
                className={`flex-1 py-3 rounded-lg font-bold border transition-all ${team === 'A' ? 'bg-[#1a2332] border-[#2d4a77] text-[#4f8eff]' : 'bg-transparent border-white/10 text-white hover:bg-white/5'}`}
              >
                {store.config?.teamA || 'Team A'}
              </button>
              <button
                onClick={() => { setTeam('B'); setPlayerOffId(''); setPlayerOnId(''); }}
                className={`flex-1 py-3 rounded-lg font-bold border transition-all ${team === 'B' ? 'bg-[#2d2d2d] border-white/30 text-white' : 'bg-transparent border-white/10 text-white/70 hover:bg-white/5'}`}
              >
                {store.config?.teamB || 'Team B'}
              </button>
            </div>
          </div>

          {/* Player Off */}
          <div className="space-y-2">
            <label className="text-xs text-white/50 font-bold">player off</label>
            <select
              value={playerOffId}
              onChange={(e) => setPlayerOffId(e.target.value)}
              className="w-full bg-[#1c1c1c] border border-white/10 rounded-lg px-4 py-3 text-white font-bold focus:outline-none focus:border-white/30"
            >
              <option value="" disabled>select player</option>
              {onFieldPlayers.map(p => (
                <option key={p.id} value={p.id}>{p.jerseyNumber ? `${p.jerseyNumber} ` : ''}{p.name}</option>
              ))}
            </select>
          </div>

          {/* Player On */}
          <div className="space-y-2">
            <label className="text-xs text-white/50 font-bold">player on</label>
            <select
              value={playerOnId}
              onChange={(e) => setPlayerOnId(e.target.value)}
              className="w-full bg-[#1c1c1c] border border-white/10 rounded-lg px-4 py-3 text-white font-bold focus:outline-none focus:border-white/30"
            >
              <option value="" disabled>select player</option>
              {benchPlayers.map(p => (
                <option key={p.id} value={p.id}>{p.jerseyNumber ? `${p.jerseyNumber} ` : ''}{p.name}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Footer */}
        <div className="flex gap-3 p-5 border-t border-white/5 bg-black/20 rounded-b-2xl">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 rounded-xl font-bold bg-transparent border border-white/10 text-white hover:bg-white/5 transition-all"
          >
            cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-[2] py-3.5 rounded-xl font-bold bg-white text-black hover:bg-white/90 active:scale-[0.98] transition-all"
          >
            confirm sub
          </button>
        </div>

      </div>
    </div>
  );
}
