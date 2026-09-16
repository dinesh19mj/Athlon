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
    
    store.addSubstitutionDetailed(team, playerOffId, playerOnId, timeStr);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-card rounded-3xl w-full max-w-md shadow-2xl border border-border animate-in zoom-in-95 duration-200 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-surface/50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-xl">
              🔄
            </div>
            <div>
              <h2 className="text-lg font-black text-foreground uppercase tracking-wider">Player Substitution</h2>
              <p className="text-xs text-text-muted font-mono">
                {timeStr} • {store.currentHalf === 1 ? '1st Half' : store.currentHalf === 2 ? '2nd Half' : `Half ${store.currentHalf}`} • Subs: {subsUsed}/{maxSubs}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-text-muted hover:text-foreground rounded-xl hover:bg-surface transition-colors">
            ✕
          </button>
        </div>

        <div className="p-5 space-y-4">
          
          {/* Team Selection */}
          <div className="space-y-1.5">
            <label className="text-xs text-text-muted font-bold uppercase tracking-wider pl-1">Team</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { setTeam('A'); setPlayerOffId(''); setPlayerOnId(''); }}
                className={`py-3 px-3 rounded-2xl font-black text-xs uppercase tracking-wider border transition-all truncate ${team === 'A' ? 'bg-primary text-black border-primary shadow-sm' : 'bg-surface border-border text-foreground hover:bg-surface-hover'}`}
              >
                {store.config?.teamA || 'Team A'} ({store.subsUsedA}/{maxSubs})
              </button>
              <button
                onClick={() => { setTeam('B'); setPlayerOffId(''); setPlayerOnId(''); }}
                className={`py-3 px-3 rounded-2xl font-black text-xs uppercase tracking-wider border transition-all truncate ${team === 'B' ? 'bg-primary text-black border-primary shadow-sm' : 'bg-surface border-border text-foreground hover:bg-surface-hover'}`}
              >
                {store.config?.teamB || 'Team B'} ({store.subsUsedB}/{maxSubs})
              </button>
            </div>
          </div>

          {/* Player Off */}
          <div className="space-y-1.5">
            <label className="text-xs text-text-muted font-bold uppercase tracking-wider pl-1 flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-rose-500"></span> Player Coming Off
            </label>
            <select
              value={playerOffId}
              onChange={(e) => setPlayerOffId(e.target.value)}
              className="w-full bg-surface border border-border rounded-2xl px-4 py-3 text-foreground font-bold text-xs focus:outline-none focus:border-primary shadow-inner"
            >
              <option value="" disabled>Select Starting / On-field Player</option>
              {onFieldPlayers.map(p => (
                <option key={p.id} value={p.id}>{p.jerseyNumber ? `#${p.jerseyNumber} ` : ''}{p.name}</option>
              ))}
            </select>
          </div>

          {/* Player On */}
          <div className="space-y-1.5">
            <label className="text-xs text-text-muted font-bold uppercase tracking-wider pl-1 flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span> Player Coming On (Bench)
            </label>
            <select
              value={playerOnId}
              onChange={(e) => setPlayerOnId(e.target.value)}
              className="w-full bg-surface border border-border rounded-2xl px-4 py-3 text-foreground font-bold text-xs focus:outline-none focus:border-primary shadow-inner"
            >
              <option value="" disabled>Select Substitute from Bench</option>
              {benchPlayers.map(p => (
                <option key={p.id} value={p.id}>{p.jerseyNumber ? `#${p.jerseyNumber} ` : ''}{p.name}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Footer */}
        <div className="flex gap-2.5 p-5 border-t border-border bg-surface/30">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl font-bold text-xs bg-surface border border-border text-foreground hover:bg-surface-hover transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-[2] py-3 rounded-2xl font-black text-xs uppercase tracking-wider bg-cyan-500 text-black hover:bg-cyan-400 active:scale-[0.98] transition-all shadow-lg shadow-cyan-500/25"
          >
            Confirm Substitution
          </button>
        </div>

      </div>
    </div>
  );
}
