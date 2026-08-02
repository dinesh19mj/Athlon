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
    // The user requested to track fouls. Let's just increment fouls if a card is given.
    store.incrementStat(team, 'fouls');

    onClose();
  };

  const cardColors = {
    'Yellow': { bg: 'bg-[#1a1c14]', border: 'border-[#4a4015]', text: 'text-[#e5a910]' },
    '2nd Yellow': { bg: 'bg-[#1a1c14]', border: 'border-[#4a4015]', text: 'text-[#e5a910]' },
    'Red': { bg: 'bg-[#1e1314]', border: 'border-[#5a1c1f]', text: 'text-[#e54545]' }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#2A2A2A] rounded-2xl w-full max-w-md shadow-2xl border border-white/5 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div>
            <h2 className="text-xl font-bold text-white">card</h2>
            <p className="text-sm text-white/50">{timeStr} • {store.currentHalf === 1 ? '1st half' : store.currentHalf === 2 ? '2nd half' : `Half ${store.currentHalf}`}</p>
          </div>
          <button onClick={onClose} className="p-2 text-white/50 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
            ✕
          </button>
        </div>

        <div className="p-5 space-y-5">
          
          {/* Card Type */}
          <div className="space-y-2">
            <label className="text-xs text-white/50 font-bold">card type</label>
            <div className="flex gap-2">
              {(['Yellow', '2nd Yellow', 'Red'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setCardType(type)}
                  className={`flex-1 py-3 rounded-lg text-sm font-bold border transition-all ${
                    cardType === type 
                      ? `${cardColors[type].bg} ${cardColors[type].border} ${cardColors[type].text}` 
                      : 'bg-transparent border-white/10 text-white/70 hover:bg-white/5'
                  }`}
                >
                  {type.toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Team Selection */}
          <div className="space-y-2">
            <label className="text-xs text-white/50 font-bold">team</label>
            <div className="flex gap-3">
              <button
                onClick={() => { setTeam('A'); setPlayerId(''); }}
                className={`flex-1 py-3 rounded-lg font-bold border transition-all ${team === 'A' ? 'bg-[#1a2332] border-[#2d4a77] text-[#4f8eff]' : 'bg-transparent border-white/10 text-white hover:bg-white/5'}`}
              >
                {store.config?.teamA || 'Team A'}
              </button>
              <button
                onClick={() => { setTeam('B'); setPlayerId(''); }}
                className={`flex-1 py-3 rounded-lg font-bold border transition-all ${team === 'B' ? 'bg-[#2d2d2d] border-white/30 text-white' : 'bg-transparent border-white/10 text-white/70 hover:bg-white/5'}`}
              >
                {store.config?.teamB || 'Team B'}
              </button>
            </div>
          </div>

          {/* Player */}
          <div className="space-y-2">
            <label className="text-xs text-white/50 font-bold">player</label>
            <select
              value={playerId}
              onChange={(e) => setPlayerId(e.target.value)}
              className="w-full bg-[#1c1c1c] border border-white/10 rounded-lg px-4 py-3 text-white font-bold focus:outline-none focus:border-white/30"
            >
              <option value="" disabled>select player</option>
              {onFieldPlayers.map(p => (
                <option key={p.id} value={p.id}>{p.jerseyNumber ? `${p.jerseyNumber} ` : ''}{p.name}</option>
              ))}
            </select>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <label className="text-xs text-white/50 font-bold">reason (optional)</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-[#1c1c1c] border border-white/10 rounded-lg px-4 py-3 text-white font-bold focus:outline-none focus:border-white/30"
            >
              <option value="">select reason</option>
              <option value="Foul">Foul</option>
              <option value="Unsporting Behavior">Unsporting Behavior</option>
              <option value="Dissent">Dissent</option>
              <option value="Time Wasting">Time Wasting</option>
              <option value="Handball">Handball</option>
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
            confirm card
          </button>
        </div>

      </div>
    </div>
  );
}
