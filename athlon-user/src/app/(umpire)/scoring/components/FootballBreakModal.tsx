'use client';

import { useState, useEffect } from 'react';
import { useFootballStore } from '@/lib/store/useFootballStore';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Users, 
  Clock, 
  Shield, 
  ChevronRight,
  Sparkles,
  Zap,
  Activity,
  Plus,
  Minus,
  CheckCircle2
} from 'lucide-react';

interface FootballBreakModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRoster: () => void;
  onStartNextHalf: () => void;
  onResumePreviousHalf: () => void;
}

export default function FootballBreakModal({
  isOpen,
  onClose,
  onOpenRoster,
  onStartNextHalf,
  onResumePreviousHalf
}: FootballBreakModalProps) {
  const store = useFootballStore();

  const halfMinutes = store.config?.halfLengthMinutes || 15;
  const defaultBreakMinutes = halfMinutes <= 10 ? 5 : halfMinutes <= 25 ? 10 : 15;

  // Halftime break countdown
  const [breakSecondsLeft, setBreakSecondsLeft] = useState(defaultBreakMinutes * 60);
  const [isBreakTimerActive, setIsBreakTimerActive] = useState(true);

  // Sync default when opening
  useEffect(() => {
    if (isOpen) {
      setBreakSecondsLeft(defaultBreakMinutes * 60);
      setIsBreakTimerActive(true);
    }
  }, [isOpen, defaultBreakMinutes]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOpen && isBreakTimerActive && breakSecondsLeft > 0) {
      interval = setInterval(() => {
        setBreakSecondsLeft((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, isBreakTimerActive, breakSecondsLeft]);

  if (!isOpen) return null;

  const teamAName = store.config?.teamA || 'Team A';
  const teamBName = store.config?.teamB || 'Team B';
  const maxSubs = store.config?.subsPerTeam || 5;

  const teamAGoals = store.matchEvents.filter(e => e.type === 'Goal' && e.team === 'A');
  const teamBGoals = store.matchEvents.filter(e => e.type === 'Goal' && e.team === 'B');
  const teamAPenalties = store.matchEvents.filter(e => e.type === 'Penalty' && e.team === 'A');
  const teamBPenalties = store.matchEvents.filter(e => e.type === 'Penalty' && e.team === 'B');

  const formatBreakTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatMatchMinute = (rawTime: string) => {
    if (!rawTime) return '';
    if (rawTime.includes('+')) {
      const [regularPart, stoppagePart] = rawTime.split('+');
      const [regM, regS] = (regularPart || '0:0').split(':').map(Number);
      const [stopM, stopS] = (stoppagePart || '0:0').split(':').map(Number);
      const regMin = Math.ceil(((regM || 0) * 60 + (regS || 0)) / 60) || (regM || 0);
      const stopMin = Math.ceil(((stopM || 0) * 60 + (stopS || 0)) / 60) || 1;
      return `${regMin}+${stopMin}'`;
    }
    const parts = rawTime.split(':').map(Number);
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      const totalSecs = parts[0] * 60 + parts[1];
      if (totalSecs === 0) return "1'";
      const min = Math.ceil(totalSecs / 60);
      return `${min}'`;
    }
    return rawTime.endsWith("'") ? rawTime : `${rawTime}'`;
  };

  const getBreakTitle = () => {
    if (store.currentHalf === 2) return 'Half-Time Break';
    if (store.currentHalf === 3) return 'Full-Time / ET Break';
    if (store.currentHalf === 4) return 'Extra-Time Half-Time Break';
    return 'Match Break';
  };

  const getNextHalfLabel = () => {
    if (store.currentHalf === 2) return 'Start 2nd Half (Kickoff)';
    if (store.currentHalf === 3) return 'Start Extra Time (ET 1)';
    if (store.currentHalf === 4) return 'Start ET 2nd Half';
    return 'Start Next Half';
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-card rounded-3xl w-full max-w-lg border border-border p-4 sm:p-5 shadow-2xl space-y-4 max-h-[92dvh] overflow-y-auto relative animate-in zoom-in-95 duration-200">
        
        {/* Header Badge */}
        <div className="flex items-center justify-between border-b border-border pb-3 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 text-lg shadow-sm">
              ⏸️
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                {breakSecondsLeft === 0 ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    Break Finished
                  </span>
                ) : isBreakTimerActive ? (
                  <span className="text-amber-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                    Break In Progress
                  </span>
                ) : (
                  <span className="text-text-muted flex items-center gap-1">
                    <Pause className="w-3 h-3" />
                    Break Paused
                  </span>
                )}
              </div>
              <h2 className="text-base sm:text-lg font-black text-foreground uppercase tracking-wide">
                {getBreakTitle()}
              </h2>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl bg-surface border border-border text-text-muted hover:text-foreground text-xs font-bold transition-all"
            title="Minimize break card to view scoring board"
          >
            ✕
          </button>
        </div>

        {/* 1. Score Showcase */}
        <div className="bg-surface/80 rounded-2xl p-3.5 border border-border/80 shadow-inner relative z-10 space-y-2.5">
          <div className="flex items-center justify-between">
            {/* Team A */}
            <div className="text-left flex-1 truncate pr-2">
              <div className="font-black text-xs sm:text-sm text-primary truncate">{teamAName}</div>
              <div className="text-[10px] text-text-muted font-bold mt-0.5">
                {store.yellowCardsA > 0 && <span className="text-amber-400 mr-1">🟨{store.yellowCardsA}</span>}
                {store.redCardsA > 0 && <span className="text-rose-400 mr-1">🟥{store.redCardsA}</span>}
                <span>{store.subsUsedA}/{maxSubs} sub</span>
              </div>
            </div>

            {/* Digital Score */}
            <div className="flex items-center gap-2 px-3">
              <span className="text-3xl sm:text-4xl font-black font-mono text-foreground">{store.goalsA}</span>
              <span className="text-text-muted/40 font-light text-xl">—</span>
              <span className="text-3xl sm:text-4xl font-black font-mono text-foreground">{store.goalsB}</span>
            </div>

            {/* Team B */}
            <div className="text-right flex-1 truncate pl-2">
              <div className="font-black text-xs sm:text-sm text-foreground truncate">{teamBName}</div>
              <div className="text-[10px] text-text-muted font-bold mt-0.5">
                {store.yellowCardsB > 0 && <span className="text-amber-400 mr-1">🟨{store.yellowCardsB}</span>}
                {store.redCardsB > 0 && <span className="text-rose-400 mr-1">🟥{store.redCardsB}</span>}
                <span>{store.subsUsedB}/{maxSubs} sub</span>
              </div>
            </div>
          </div>

          {/* Goal Scorers & Penalty Details */}
          {(teamAGoals.length > 0 || teamBGoals.length > 0 || teamAPenalties.length > 0 || teamBPenalties.length > 0) && (
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/40 text-[11px]">
              {/* Team A Goals / Penalties */}
              <div className="space-y-1 text-left">
                {teamAGoals.map((g) => (
                  <div key={g.id} className="text-foreground font-bold flex items-center gap-1.5 flex-wrap">
                    <span>⚽</span>
                    <span className="text-text-muted font-mono">{formatMatchMinute(g.timeStr)}</span>
                    <span className="truncate">{g.scorerName || g.details}</span>
                    {g.goalType === 'Penalty' && <span className="text-[8px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-400 font-black border border-amber-500/30">PEN</span>}
                    {g.goalType === 'Own Goal' && <span className="text-[8px] px-1 py-0.2 rounded bg-rose-500/20 text-rose-400 font-black border border-rose-500/30">OG</span>}
                    {g.goalType === 'Penalty' && g.foulingPlayerName && (
                      <span className="text-[9px] text-rose-400 font-normal w-full pl-4">
                        ↳ Foul by: {g.foulingPlayerName}
                      </span>
                    )}
                  </div>
                ))}
                {teamAPenalties.filter(p => p.penaltyOutcome && p.penaltyOutcome !== 'Scored').map((p) => (
                  <div key={p.id} className="text-rose-400 text-[10px] font-semibold flex items-center gap-1.5 flex-wrap">
                    <span>❌</span>
                    <span className="font-mono">{formatMatchMinute(p.timeStr)}</span>
                    <span className="truncate">{p.details}</span>
                  </div>
                ))}
              </div>

              {/* Team B Goals / Penalties */}
              <div className="space-y-1 text-right">
                {teamBGoals.map((g) => (
                  <div key={g.id} className="text-foreground font-bold flex items-center justify-end gap-1.5 flex-wrap">
                    {g.goalType === 'Penalty' && <span className="text-[8px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-400 font-black border border-amber-500/30">PEN</span>}
                    {g.goalType === 'Own Goal' && <span className="text-[8px] px-1 py-0.2 rounded bg-rose-500/20 text-rose-400 font-black border border-rose-500/30">OG</span>}
                    <span className="truncate">{g.scorerName || g.details}</span>
                    <span className="text-text-muted font-mono">{formatMatchMinute(g.timeStr)}</span>
                    <span>⚽</span>
                    {g.goalType === 'Penalty' && g.foulingPlayerName && (
                      <span className="text-[9px] text-rose-400 font-normal w-full text-right pr-4">
                        Foul by: {g.foulingPlayerName} ↲
                      </span>
                    )}
                  </div>
                ))}
                {teamBPenalties.filter(p => p.penaltyOutcome && p.penaltyOutcome !== 'Scored').map((p) => (
                  <div key={p.id} className="text-rose-400 text-[10px] font-semibold flex items-center justify-end gap-1.5 flex-wrap">
                    <span className="truncate">{p.details}</span>
                    <span className="font-mono">{formatMatchMinute(p.timeStr)}</span>
                    <span>❌</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 2. Break Interval Countdown Timer Card */}
        <div className="bg-surface border border-border rounded-2xl p-3 space-y-2 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-surface border border-border flex items-center justify-center text-amber-400">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Break Timer</div>
                <div className={`font-mono font-black text-xl ${breakSecondsLeft === 0 ? 'text-emerald-400' : 'text-foreground'}`}>
                  {formatBreakTime(breakSecondsLeft)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setBreakSecondsLeft(prev => Math.max(0, prev - 60))}
                className="p-1.5 rounded-lg bg-surface border border-border text-text-muted hover:text-foreground text-[10px] font-bold"
                title="-1 min"
              >
                -1m
              </button>
              <button
                onClick={() => setIsBreakTimerActive(prev => !prev)}
                className={`p-1.5 rounded-lg border text-xs font-black transition-all ${
                  isBreakTimerActive ? 'bg-amber-400 text-black border-amber-400' : 'bg-surface border-border text-foreground'
                }`}
                title={isBreakTimerActive ? 'Pause Break Timer' : 'Resume Break Timer'}
              >
                {isBreakTimerActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setBreakSecondsLeft(prev => prev + 60)}
                className="p-1.5 rounded-lg bg-surface border border-border text-text-muted hover:text-foreground text-[10px] font-bold"
                title="+1 min"
              >
                +1m
              </button>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 pt-1 border-t border-border/50 text-[10px]">
            <span className="text-text-muted font-bold text-[9px] uppercase tracking-wider mr-1">Preset:</span>
            {[2, 5, 10, 15].map((mins) => (
              <button
                key={mins}
                onClick={() => {
                  setBreakSecondsLeft(mins * 60);
                  setIsBreakTimerActive(true);
                }}
                className={`px-2 py-0.5 rounded-md font-black border transition-all ${
                  breakSecondsLeft === mins * 60 
                    ? 'bg-amber-400 text-black border-amber-400' 
                    : 'bg-surface border-border text-text-muted hover:text-foreground'
                }`}
              >
                {mins}m
              </button>
            ))}
          </div>
        </div>

        {/* 3. Halftime Key Statistics */}
        <div className="bg-surface/50 rounded-2xl p-3 border border-border space-y-2.5 relative z-10 text-xs">
          <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-text-muted pb-1 border-b border-border/50">
            <span className="text-primary truncate max-w-[100px]">{teamAName}</span>
            <span className="text-foreground">Match Statistics</span>
            <span className="text-foreground truncate max-w-[100px] text-right">{teamBName}</span>
          </div>

          {/* Possession Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-bold font-mono">
              <span className="text-primary">{store.possessionA}%</span>
              <span className="text-[10px] text-text-muted uppercase font-sans">Possession</span>
              <span className="text-foreground">{store.possessionB}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden bg-surface flex border border-border/50">
              <div className="bg-primary h-full transition-all duration-300" style={{ width: `${store.possessionA}%` }} />
              <div className="bg-foreground/30 h-full transition-all duration-300" style={{ width: `${store.possessionB}%` }} />
            </div>
          </div>

          {/* Detailed stats comparison rows */}
          <div className="grid grid-cols-3 gap-y-1.5 text-center items-center font-mono text-[11px] pt-1">
            <span className="font-bold text-primary">{store.shotsA} ({store.shotsOnTargetA})</span>
            <span className="text-[10px] text-text-muted uppercase font-sans font-semibold">Shots (Target)</span>
            <span className="font-bold text-foreground">{store.shotsB} ({store.shotsOnTargetB})</span>

            <span className="font-bold text-primary">{store.cornersA}</span>
            <span className="text-[10px] text-text-muted uppercase font-sans font-semibold">Corners</span>
            <span className="font-bold text-foreground">{store.cornersB}</span>

            <span className="font-bold text-primary">{store.foulsA}</span>
            <span className="text-[10px] text-text-muted uppercase font-sans font-semibold">Fouls</span>
            <span className="font-bold text-foreground">{store.foulsB}</span>

            <span className="font-bold text-primary">🟨 {store.yellowCardsA}  🟥 {store.redCardsA}</span>
            <span className="text-[10px] text-text-muted uppercase font-sans font-semibold">Cards</span>
            <span className="font-bold text-foreground">🟨 {store.yellowCardsB}  🟥 {store.redCardsB}</span>
          </div>
        </div>

        {/* 4. Action Buttons */}
        <div className="space-y-2 pt-1 relative z-10">
          <button
            onClick={onStartNextHalf}
            className="w-full py-3.5 px-4 rounded-2xl bg-emerald-500 text-black font-black text-xs uppercase tracking-wider hover:bg-emerald-400 active:scale-[0.98] transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-current" />
            {getNextHalfLabel()}
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onOpenRoster}
              className="py-2.5 rounded-xl bg-surface border border-border text-foreground font-bold text-xs hover:bg-surface-hover active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5 text-primary" />
              Halftime Lineup / Subs
            </button>

            <button
              onClick={onResumePreviousHalf}
              className="py-2.5 rounded-xl bg-surface border border-border text-text-muted hover:text-foreground font-bold text-xs hover:bg-surface-hover active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Resume / Add 1st Half Time
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
