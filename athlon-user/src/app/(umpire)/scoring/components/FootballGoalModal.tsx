import { useState } from 'react';
import { Player } from '@/lib/store/useMatchStore';
import { useFootballStore } from '@/lib/store/useFootballStore';

interface FootballGoalModalProps {
  onClose: () => void;
  timeStr: string;
}

export default function FootballGoalModal({ onClose, timeStr }: FootballGoalModalProps) {
  const store = useFootballStore();
  
  const [team, setTeam] = useState<'A' | 'B'>('A');
  const [scorerId, setScorerId] = useState<string>('');
  const [assistId, setAssistId] = useState<string>('');
  const [goalType, setGoalType] = useState<'Open Play' | 'Penalty' | 'Own Goal'>('Open Play');

  const teamName = team === 'A' ? (store.config?.teamA || 'Team A') : (store.config?.teamB || 'Team B');
  const players = team === 'A' ? store.playersA : store.playersB;
  
  // For own goals, the team receiving the points is the ONE SELECTED (team).
  // But the player scoring it is actually from the OPPOSING team.
  const scorerPlayers = goalType === 'Own Goal' 
    ? (team === 'A' ? store.playersB : store.playersA) 
    : players;

  const onFieldScorers = scorerPlayers.filter(p => p.onField !== false);
  const onFieldAssists = players.filter(p => p.onField !== false);

  const handleSubmit = () => {
    if (!scorerId) {
      alert('Please select a scorer');
      return;
    }
    store.addGoalDetailed(team, scorerId, assistId || undefined, goalType, timeStr);
    
    // Also log a shot on target for the team if it's not an OG
    if (goalType !== 'Own Goal') {
      store.incrementStat(team, 'shots');
      store.incrementStat(team, 'shotsOnTarget');
    }
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#2A2A2A] rounded-2xl w-full max-w-md shadow-2xl border border-white/5 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div>
            <h2 className="text-xl font-bold text-white">goal</h2>
            <p className="text-sm text-white/50">{timeStr} • {store.currentHalf === 1 ? '1st half' : store.currentHalf === 2 ? '2nd half' : `Half ${store.currentHalf}`}</p>
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
                onClick={() => { setTeam('A'); setScorerId(''); setAssistId(''); }}
                className={`flex-1 py-3 rounded-lg font-bold border transition-all ${team === 'A' ? 'bg-[#1a2332] border-[#2d4a77] text-[#4f8eff]' : 'bg-transparent border-white/10 text-white hover:bg-white/5'}`}
              >
                {store.config?.teamA || 'Team A'}
              </button>
              <button
                onClick={() => { setTeam('B'); setScorerId(''); setAssistId(''); }}
                className={`flex-1 py-3 rounded-lg font-bold border transition-all ${team === 'B' ? 'bg-[#2d2d2d] border-white/30 text-white' : 'bg-transparent border-white/10 text-white/70 hover:bg-white/5'}`}
              >
                {store.config?.teamB || 'Team B'}
              </button>
            </div>
          </div>

          {/* Scorer */}
          <div className="space-y-2">
            <label className="text-xs text-white/50 font-bold">scorer</label>
            <select
              value={scorerId}
              onChange={(e) => setScorerId(e.target.value)}
              className="w-full bg-[#1c1c1c] border border-white/10 rounded-lg px-4 py-3 text-white font-bold focus:outline-none focus:border-white/30"
            >
              <option value="" disabled>select scorer</option>
              {onFieldScorers.map(p => (
                <option key={p.id} value={p.id}>{p.jerseyNumber ? `${p.jerseyNumber} ` : ''}{p.name}</option>
              ))}
            </select>
          </div>

          {/* Assist */}
          {goalType !== 'Own Goal' && (
            <div className="space-y-2">
              <label className="text-xs text-white/50 font-bold">assist (optional)</label>
              <select
                value={assistId}
                onChange={(e) => setAssistId(e.target.value)}
                className="w-full bg-[#1c1c1c] border border-white/10 rounded-lg px-4 py-3 text-white font-bold focus:outline-none focus:border-white/30"
              >
                <option value="">no assist</option>
                {onFieldAssists.map(p => (
                  <option key={p.id} value={p.id} disabled={p.id === scorerId}>{p.jerseyNumber ? `${p.jerseyNumber} ` : ''}{p.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Goal Type */}
          <div className="space-y-2">
            <label className="text-xs text-white/50 font-bold">goal type</label>
            <div className="flex gap-2">
              {(['Open Play', 'Penalty', 'Own Goal'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => {
                    setGoalType(type);
                    setScorerId('');
                    setAssistId('');
                  }}
                  className={`flex-1 py-3 rounded-lg text-sm font-bold border transition-all ${goalType === type ? 'bg-[#1a2332] border-[#2d4a77] text-[#4f8eff]' : 'bg-transparent border-white/10 text-white/70 hover:bg-white/5'}`}
                >
                  {type.toLowerCase()}
                </button>
              ))}
            </div>
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
            confirm goal
          </button>
        </div>

      </div>
    </div>
  );
}
