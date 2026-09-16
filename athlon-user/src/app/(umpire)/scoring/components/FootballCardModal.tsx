import { useState } from 'react';
import { useFootballStore } from '@/lib/store/useFootballStore';

interface FootballCardModalProps {
  onClose: () => void;
  timeStr: string;
}

export default function FootballCardModal({ onClose, timeStr }: FootballCardModalProps) {
  const store = useFootballStore();
  
  const [team, setTeam] = useState<'A' | 'B'>('A');
  const [playerId, setPlayerId] = useState<string>('');
  const [cardType, setCardType] = useState<'Yellow' | '2nd Yellow' | 'Red'>('Yellow');
  const [reason, setReason] = useState<string>('');

  const players = team === 'A' ? store.playersA : store.playersB;
  const onFieldPlayers = players.filter(p => p.onField !== false);

  const handleSubmit = () => {
    if (!playerId) {
      alert('Please select a player');
      return;
    }
    
    store.addCardDetailed(team, playerId, cardType, reason, timeStr);
    store.incrementStat(team, 'fouls');
    onClose();
  };

  const cardConfig = {
    'Yellow': { bg: 'bg-amber-500/15', border: 'border-amber-500/50', text: 'text-amber-400', badge: 'bg-amber-400 text-black', icon: '🟨' },
    '2nd Yellow': { bg: 'bg-amber-600/15', border: 'border-amber-600/50', text: 'text-amber-400', badge: 'bg-amber-500 text-black', icon: '🟨🟨' },
    'Red': { bg: 'bg-rose-500/15', border: 'border-rose-500/50', text: 'text-rose-400', badge: 'bg-rose-500 text-white', icon: '🟥' }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-card rounded-3xl w-full max-w-md shadow-2xl border border-border animate-in zoom-in-95 duration-200 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-surface/50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-xl">
              {cardConfig[cardType].icon}
            </div>
            <div>
              <h2 className="text-lg font-black text-foreground uppercase tracking-wider">Issue Card</h2>
              <p className="text-xs text-text-muted font-mono">{timeStr} • {store.currentHalf === 1 ? '1st Half' : store.currentHalf === 2 ? '2nd Half' : `Half ${store.currentHalf}`}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-text-muted hover:text-foreground rounded-xl hover:bg-surface transition-colors">
            ✕
          </button>
        </div>

        <div className="p-5 space-y-4">
          
          {/* Card Type */}
          <div className="space-y-1.5">
            <label className="text-xs text-text-muted font-bold uppercase tracking-wider pl-1">Card Severity</label>
            <div className="grid grid-cols-3 gap-2">
              {(['Yellow', '2nd Yellow', 'Red'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setCardType(type)}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    cardType === type 
                      ? `${cardConfig[type].bg} ${cardConfig[type].border} ${cardConfig[type].text} font-black shadow-sm` 
                      : 'bg-surface border-border text-text-secondary hover:text-foreground'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Team Selection */}
          <div className="space-y-1.5">
            <label className="text-xs text-text-muted font-bold uppercase tracking-wider pl-1">Target Team</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { setTeam('A'); setPlayerId(''); }}
                className={`py-3 px-3 rounded-2xl font-black text-xs uppercase tracking-wider border transition-all truncate ${team === 'A' ? 'bg-primary text-black border-primary shadow-sm' : 'bg-surface border-border text-foreground hover:bg-surface-hover'}`}
              >
                {store.config?.teamA || 'Team A'}
              </button>
              <button
                onClick={() => { setTeam('B'); setPlayerId(''); }}
                className={`py-3 px-3 rounded-2xl font-black text-xs uppercase tracking-wider border transition-all truncate ${team === 'B' ? 'bg-primary text-black border-primary shadow-sm' : 'bg-surface border-border text-foreground hover:bg-surface-hover'}`}
              >
                {store.config?.teamB || 'Team B'}
              </button>
            </div>
          </div>

          {/* Player */}
          <div className="space-y-1.5">
            <label className="text-xs text-text-muted font-bold uppercase tracking-wider pl-1">Offending Player</label>
            <select
              value={playerId}
              onChange={(e) => setPlayerId(e.target.value)}
              className="w-full bg-surface border border-border rounded-2xl px-4 py-3 text-foreground font-bold text-xs focus:outline-none focus:border-primary shadow-inner"
            >
              <option value="" disabled>Select Player</option>
              {onFieldPlayers.map(p => (
                <option key={p.id} value={p.id}>{p.jerseyNumber ? `#${p.jerseyNumber} ` : ''}{p.name}</option>
              ))}
            </select>
          </div>

          {/* Reason */}
          <div className="space-y-1.5">
            <label className="text-xs text-text-muted font-bold uppercase tracking-wider pl-1">Reason (Optional)</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-surface border border-border rounded-2xl px-4 py-3 text-foreground font-bold text-xs focus:outline-none focus:border-primary shadow-inner"
            >
              <option value="">Select Reason / Infraction</option>
              <option value="Tactical / Reckless Foul">Tactical / Reckless Foul</option>
              <option value="Unsporting Behavior">Unsporting Behavior</option>
              <option value="Dissent towards Referee">Dissent towards Referee</option>
              <option value="Delaying the Restart">Delaying the Restart</option>
              <option value="Deliberate Handball">Deliberate Handball</option>
              <option value="Violent Conduct / Dangerous Play">Violent Conduct / Dangerous Play</option>
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
            className={`flex-[2] py-3 rounded-2xl font-black text-xs uppercase tracking-wider text-black transition-all shadow-lg ${
              cardType === 'Red' ? 'bg-rose-500 text-white hover:bg-rose-400 shadow-rose-500/25' : 'bg-amber-400 hover:bg-amber-300 shadow-amber-400/25'
            }`}
          >
            Confirm Card
          </button>
        </div>

      </div>
    </div>
  );
}
