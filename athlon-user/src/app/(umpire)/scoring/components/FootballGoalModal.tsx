'use client';

import { useState } from 'react';
import { Player } from '@/lib/store/useMatchStore';
import { useFootballStore } from '@/lib/store/useFootballStore';

interface FootballGoalModalProps {
  onClose: () => void;
  timeStr: string;
  initialTeam?: 'A' | 'B';
  initialGoalType?: 'Open Play' | 'Penalty' | 'Own Goal';
  isPenaltyMode?: boolean;
}

export default function FootballGoalModal({
  onClose,
  timeStr,
  initialTeam = 'A',
  initialGoalType = 'Open Play',
  isPenaltyMode = false
}: FootballGoalModalProps) {
  const store = useFootballStore();
  
  const [team, setTeam] = useState<'A' | 'B'>(initialTeam);
  const [scorerId, setScorerId] = useState<string>('');
  const [assistId, setAssistId] = useState<string>('');
  const [goalType, setGoalType] = useState<'Open Play' | 'Penalty' | 'Own Goal'>(
    isPenaltyMode ? 'Penalty' : initialGoalType
  );
  const [penaltyOutcome, setPenaltyOutcome] = useState<'Scored' | 'Missed' | 'Saved'>('Scored');
  const [foulingPlayerId, setFoulingPlayerId] = useState<string>('');
  const [penaltyReason, setPenaltyReason] = useState<string>('Foul in Box');
  const [customReason, setCustomReason] = useState<string>('');

  const teamName = team === 'A' ? (store.config?.teamA || 'Team A') : (store.config?.teamB || 'Team B');
  const opposingTeamKey = team === 'A' ? 'B' : 'A';
  const opposingTeamName = opposingTeamKey === 'A' ? (store.config?.teamA || 'Team A') : (store.config?.teamB || 'Team B');

  const players = team === 'A' ? store.playersA : store.playersB;
  const opposingPlayers = team === 'A' ? store.playersB : store.playersA;
  
  // For own goals, the team receiving the points is the ONE SELECTED (team).
  // But the player scoring it is actually from the OPPOSING team.
  const scorerPlayers = goalType === 'Own Goal' 
    ? (team === 'A' ? store.playersB : store.playersA) 
    : players;

  const onFieldScorers = scorerPlayers.filter(p => p.onField !== false);
  const onFieldAssists = players.filter(p => p.onField !== false);
  const onFieldOpponents = opposingPlayers.filter(p => p.onField !== false);

  const handleSubmit = () => {
    if (!scorerId) {
      alert(isPenaltyMode || goalType === 'Penalty' ? 'Please select the penalty taker' : 'Please select a scorer');
      return;
    }

    const finalReason = penaltyReason === 'Other' ? (customReason.trim() || 'Penalty Infringement') : penaltyReason;

    if (goalType === 'Penalty') {
      store.recordPenaltyAttempt(
        team, 
        scorerId, 
        penaltyOutcome, 
        timeStr, 
        foulingPlayerId || undefined, 
        finalReason
      );
    } else {
      store.addGoalDetailed(team, scorerId, assistId || undefined, goalType, timeStr);
      // Log shots for non-OG
      if (goalType !== 'Own Goal') {
        store.incrementStat(team, 'shots');
        store.incrementStat(team, 'shotsOnTarget');
      }
    }
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-card rounded-3xl w-full max-w-md shadow-2xl border border-border animate-in zoom-in-95 duration-200 overflow-hidden max-h-[94dvh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border bg-surface/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-xl">
              {isPenaltyMode || goalType === 'Penalty' ? '🥅' : '⚽'}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-foreground uppercase tracking-wider">
                {isPenaltyMode ? 'Record Penalty Kick' : 'Record Goal'}
              </h2>
              <p className="text-xs text-text-muted font-mono">{timeStr} • {store.currentHalf === 1 ? '1st Half' : store.currentHalf === 2 ? '2nd Half' : `Half ${store.currentHalf}`}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-text-muted hover:text-foreground rounded-xl hover:bg-surface transition-colors">
            ✕
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-3.5 overflow-y-auto flex-1">
          {/* Team Selection */}
          <div className="space-y-1.5">
            <label className="text-xs text-text-muted font-bold uppercase tracking-wider pl-1">
              {isPenaltyMode || goalType === 'Penalty' ? 'Awarded Team (Penalty Takers)' : 'Scoring Team'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => { setTeam('A'); setScorerId(''); setAssistId(''); setFoulingPlayerId(''); }}
                className={`py-2.5 px-3 rounded-2xl font-black text-xs uppercase tracking-wider border transition-all truncate ${team === 'A' ? 'bg-primary text-black border-primary shadow-sm' : 'bg-surface border-border text-foreground hover:bg-surface-hover'}`}
              >
                {store.config?.teamA || 'Team A'}
              </button>
              <button
                type="button"
                onClick={() => { setTeam('B'); setScorerId(''); setAssistId(''); setFoulingPlayerId(''); }}
                className={`py-2.5 px-3 rounded-2xl font-black text-xs uppercase tracking-wider border transition-all truncate ${team === 'B' ? 'bg-primary text-black border-primary shadow-sm' : 'bg-surface border-border text-foreground hover:bg-surface-hover'}`}
              >
                {store.config?.teamB || 'Team B'}
              </button>
            </div>
          </div>

          {/* Goal Type (if not in forced penalty mode) */}
          {!isPenaltyMode ? (
            <div className="space-y-1.5">
              <label className="text-xs text-text-muted font-bold uppercase tracking-wider pl-1">Goal Type</label>
              <div className="grid grid-cols-3 gap-2">
                {(['Open Play', 'Penalty', 'Own Goal'] as const).map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setGoalType(type);
                      setScorerId('');
                      setAssistId('');
                      setFoulingPlayerId('');
                    }}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${goalType === type ? 'bg-foreground text-background border-foreground font-black' : 'bg-surface border-border text-text-secondary hover:text-foreground'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {/* Penalty Outcome Selector if Penalty */}
          {goalType === 'Penalty' && (
            <div className="space-y-1.5 bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-2xl">
              <label className="text-[11px] text-amber-400 font-black uppercase tracking-wider pl-1">
                Penalty Kick Result
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { key: 'Scored', label: '⚽ Scored (Goal)', color: 'bg-emerald-500 text-black font-black border-emerald-500' },
                  { key: 'Saved', label: '🧤 Saved (GK)', color: 'bg-amber-400 text-black font-black border-amber-400' },
                  { key: 'Missed', label: '❌ Missed Off Target', color: 'bg-rose-500 text-white font-black border-rose-500' },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setPenaltyOutcome(opt.key as any)}
                    className={`py-2 px-1 text-[11px] rounded-xl font-bold border transition-all text-center ${
                      penaltyOutcome === opt.key ? opt.color : 'bg-surface border-border text-text-muted hover:text-foreground'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Scorer / Penalty Taker */}
          <div className="space-y-1.5">
            <label className="text-xs text-text-muted font-bold uppercase tracking-wider pl-1">
              {goalType === 'Own Goal' 
                ? 'Own Goal By (Opponent Player)' 
                : goalType === 'Penalty'
                ? `Penalty Taker (${teamName})`
                : 'Goal Scorer'}
            </label>
            <select
              value={scorerId}
              onChange={(e) => setScorerId(e.target.value)}
              className="w-full bg-surface border border-border rounded-2xl px-3.5 py-2.5 text-foreground font-bold text-xs focus:outline-none focus:border-primary shadow-inner"
            >
              <option value="" disabled>
                {goalType === 'Penalty' ? 'Select Penalty Taker' : 'Select Goal Scorer'}
              </option>
              {onFieldScorers.map(p => (
                <option key={p.id} value={p.id}>{p.jerseyNumber ? `#${p.jerseyNumber} ` : ''}{p.name}</option>
              ))}
            </select>
          </div>

          {/* Penalty Specific Fields: Cause Player & Reason */}
          {goalType === 'Penalty' && (
            <div className="space-y-3 bg-surface/70 border border-border/80 p-3 rounded-2xl">
              {/* Fouling / Conceding Player */}
              <div className="space-y-1.5">
                <label className="text-xs text-rose-400 font-black uppercase tracking-wider pl-1 flex items-center gap-1.5">
                  <span>⚠️</span> Player Who Caused Penalty ({opposingTeamName})
                </label>
                <select
                  value={foulingPlayerId}
                  onChange={(e) => setFoulingPlayerId(e.target.value)}
                  className="w-full bg-surface border border-rose-500/30 rounded-2xl px-3.5 py-2.5 text-foreground font-bold text-xs focus:outline-none focus:border-rose-500 shadow-inner"
                >
                  <option value="">Select offending player (Optional)</option>
                  {onFieldOpponents.map(p => (
                    <option key={p.id} value={p.id}>{p.jerseyNumber ? `#${p.jerseyNumber} ` : ''}{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Penalty Infringement Cause */}
              <div className="space-y-1.5">
                <label className="text-xs text-text-muted font-bold uppercase tracking-wider pl-1">
                  Penalty Infringement Cause
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {['Foul in Box', 'Handball', 'Tripping / Tackle', 'Shirt Pull', 'Dangerous Play', 'Other'].map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setPenaltyReason(r)}
                      className={`py-1.5 px-1.5 rounded-xl text-[10px] font-bold border transition-all truncate text-center ${
                        penaltyReason === r 
                          ? 'bg-primary text-black border-primary font-black shadow-sm' 
                          : 'bg-surface border-border text-text-muted hover:text-foreground'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                {penaltyReason === 'Other' && (
                  <input
                    type="text"
                    placeholder="Describe penalty reason..."
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-foreground font-bold focus:outline-none focus:border-primary mt-1"
                  />
                )}
              </div>
            </div>
          )}

          {/* Assist (Only for Open Play goals) */}
          {goalType === 'Open Play' && (
            <div className="space-y-1.5">
              <label className="text-xs text-text-muted font-bold uppercase tracking-wider pl-1">Assist (Optional)</label>
              <select
                value={assistId}
                onChange={(e) => setAssistId(e.target.value)}
                className="w-full bg-surface border border-border rounded-2xl px-3.5 py-2.5 text-foreground font-bold text-xs focus:outline-none focus:border-primary shadow-inner"
              >
                <option value="">No Assist (Solo Effort)</option>
                {onFieldAssists.map(p => (
                  <option key={p.id} value={p.id} disabled={p.id === scorerId}>{p.jerseyNumber ? `#${p.jerseyNumber} ` : ''}{p.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2.5 p-4 sm:p-5 border-t border-border bg-surface/40 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl font-bold text-xs bg-surface border border-border text-foreground hover:bg-surface-hover transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className={`flex-[2] py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-lg ${
              goalType === 'Penalty' && penaltyOutcome !== 'Scored'
                ? 'bg-rose-500 text-white hover:bg-rose-400 shadow-rose-500/25'
                : 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-emerald-500/25'
            }`}
          >
            {goalType === 'Penalty' && penaltyOutcome === 'Saved' 
              ? 'Record Penalty Saved'
              : goalType === 'Penalty' && penaltyOutcome === 'Missed'
              ? 'Record Penalty Missed'
              : 'Confirm Goal'}
          </button>
        </div>

      </div>
    </div>
  );
}
