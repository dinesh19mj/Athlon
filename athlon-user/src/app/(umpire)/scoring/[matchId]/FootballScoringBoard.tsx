'use client';

import { useFootballStore, Team, MatchEvent } from '@/lib/store/useFootballStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  Trophy, 
  Users, 
  Camera, 
  Activity, 
  Target, 
  Flag, 
  AlertTriangle, 
  PlayCircle, 
  PauseCircle, 
  Palette, 
  RotateCcw, 
  ChevronRight, 
  Plus, 
  Minus, 
  ArrowLeft, 
  RefreshCw, 
  Shield, 
  Zap, 
  Clock, 
  Flame,
  CheckCircle2,
  X,
  History,
  SlidersHorizontal,
  Settings
} from 'lucide-react';
import Link from 'next/link';

import RosterModal from '../components/RosterModal';
import FootballGoalModal from '../components/FootballGoalModal';
import FootballCardModal from '../components/FootballCardModal';
import FootballSubModal from '../components/FootballSubModal';
import FootballBreakModal from '../components/FootballBreakModal';
import { ThemeModal } from '@/components/theme/ThemeModal';

export default function FootballScoringBoard() {
  const router = useRouter();
  const store = useFootballStore();
  
  const [isRosterOpen, setIsRosterOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<'goal' | 'card' | 'sub' | 'penalty' | null>(null);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [isCustomTimeModalOpen, setIsCustomTimeModalOpen] = useState(false);
  const [customAddedMinutes, setCustomAddedMinutes] = useState<number>(3);
  
  const [isBreakModalOpen, setIsBreakModalOpen] = useState(false);
  const [isStoppagePromptOpen, setIsStoppagePromptOpen] = useState(false);
  const [promptedRegularHalf, setPromptedRegularHalf] = useState<number | null>(null);
  const [stoppageFinishedHalf, setStoppageFinishedHalf] = useState<number | null>(null);
  
  const [selectedTeam, setSelectedTeam] = useState<'A' | 'B'>('A');
  const [addedStoppage, setAddedStoppage] = useState(store.addedStoppageMinutes || 0);
  const [isVarReview, setIsVarReview] = useState(false);
  const [showEndMatchConfirm, setShowEndMatchConfirm] = useState(false);

  // Deterministic and rock-solid Football Timer
  const [displaySeconds, setDisplaySeconds] = useState(
    store.accumulatedActiveSeconds ?? store.elapsedSecondsAtStart ?? 0
  );

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    const updateTimer = () => {
      let currentSecs = store.accumulatedActiveSeconds ?? store.elapsedSecondsAtStart ?? 0;
      if (store.isTimerRunning && store.lastResumedTimestamp) {
        currentSecs += Math.floor((Date.now() - store.lastResumedTimestamp) / 1000);
      }
      setDisplaySeconds(currentSecs);
    };

    updateTimer();
    
    if (store.isTimerRunning) {
      interval = setInterval(updateTimer, 500);
    }
    
    return () => clearInterval(interval);
  }, [
    store.accumulatedActiveSeconds, 
    store.lastResumedTimestamp, 
    store.isTimerRunning, 
    store.elapsedSecondsAtStart
  ]);

  // Automated Half-Time, Stoppage & Break detection
  useEffect(() => {
    if (!store.config || store.isMatchOver || store.isHalftimeBreak) return;

    const halfLenMinutes = store.config.halfLengthMinutes || 15;
    const currentHalfTargetSecs = store.currentHalf * halfLenMinutes * 60;
    const activeStoppage = store.addedStoppageMinutes || 0;
    const stoppageSecs = activeStoppage * 60;

    // 1. Regular Half Time Reached without extra time set yet -> Prompt Umpire
    if (
      store.isTimerRunning &&
      displaySeconds >= currentHalfTargetSecs &&
      activeStoppage === 0 &&
      promptedRegularHalf !== store.currentHalf
    ) {
      setPromptedRegularHalf(store.currentHalf);
      store.togglePause();
      setIsStoppagePromptOpen(true);
    }

    // 2. Extra/Penalty Stoppage Time Finished -> Auto Break Card
    if (
      store.isTimerRunning &&
      activeStoppage > 0 &&
      displaySeconds >= (currentHalfTargetSecs + stoppageSecs) &&
      stoppageFinishedHalf !== store.currentHalf
    ) {
      setStoppageFinishedHalf(store.currentHalf);
      if (store.currentHalf === 1) {
        // Auto finish 1st half and trigger Break Card!
        store.endHalf();
        setAddedStoppage(0);
        setIsBreakModalOpen(true);
      } else if (store.currentHalf >= 2) {
        // Conclude 2nd half / Extra time
        if (store.isTimerRunning) {
          store.togglePause();
        }
        setShowEndMatchConfirm(true);
      }
    }
  }, [
    displaySeconds, 
    store.isTimerRunning, 
    store.currentHalf, 
    store.addedStoppageMinutes, 
    promptedRegularHalf, 
    stoppageFinishedHalf, 
    store.config, 
    store.isMatchOver,
    store.isHalftimeBreak
  ]);

  if (!store.config) {
    return (
      <div className="flex flex-col items-center justify-center h-[100dvh] bg-background text-foreground p-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center text-3xl mb-4 shadow-lg">
          ⚽
        </div>
        <h1 className="text-2xl font-black mb-2 uppercase tracking-wide">No Match Active</h1>
        <p className="text-text-muted text-sm mb-6 max-w-sm">Please initialize a football match from the setup hub to begin live scoring.</p>
        <Link href="/practice" className="bg-primary text-black font-black py-3 px-8 rounded-2xl hover:opacity-90 active:scale-95 transition-all text-xs uppercase tracking-wider shadow-lg shadow-primary/25">
          Go to Match Hub
        </Link>
      </div>
    );
  }

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getHalfString = (half: number) => {
    switch (half) {
      case 1: return '1st Half';
      case 2: return '2nd Half';
      case 3: return 'ET 1st Half';
      case 4: return 'ET 2nd Half';
      default: return `Half ${half}`;
    }
  };

  const halfLengthMinutes = store.config.halfLengthMinutes || 15;
  const currentHalfExpectedTargetSecs = store.currentHalf * halfLengthMinutes * 60;
  const isOverRegularTime = displaySeconds > currentHalfExpectedTargetSecs;
  const currentStoppageElapsedSecs = isOverRegularTime ? (displaySeconds - currentHalfExpectedTargetSecs) : 0;
  const stoppageMinutesAllocated = store.addedStoppageMinutes || addedStoppage || 0;
  const stoppageTargetSecs = stoppageMinutesAllocated * 60;

  const timeStr = isOverRegularTime 
    ? `${formatTime(currentHalfExpectedTargetSecs)}+${formatTime(currentStoppageElapsedSecs)}`
    : formatTime(displaySeconds);

  const maxSubs = store.config.subsPerTeam || 5;

  const teamAName = store.config.teamA || 'Team A';
  const teamBName = store.config.teamB || 'Team B';

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

  // Filter Goal and Penalty events for both teams
  const teamAGoals = store.matchEvents.filter(e => e.type === 'Goal' && e.team === 'A');
  const teamBGoals = store.matchEvents.filter(e => e.type === 'Goal' && e.team === 'B');
  const teamAPenalties = store.matchEvents.filter(e => e.type === 'Penalty' && e.team === 'A');
  const teamBPenalties = store.matchEvents.filter(e => e.type === 'Penalty' && e.team === 'B');
  const teamAPenaltyMisses = teamAPenalties.filter(e => e.penaltyOutcome && e.penaltyOutcome !== 'Scored');
  const teamBPenaltyMisses = teamBPenalties.filter(e => e.penaltyOutcome && e.penaltyOutcome !== 'Scored');
  const offsidesA = store.matchEvents.filter(e => e.type === 'Offside' && e.team === 'A').length;
  const offsidesB = store.matchEvents.filter(e => e.type === 'Offside' && e.team === 'B').length;

  const getTeamName = (teamKey: Team | null) => {
    if (teamKey === 'A') return teamAName;
    if (teamKey === 'B') return teamBName;
    return 'Official';
  };

  const handleQuickStat = (stat: 'corners' | 'fouls' | 'shots' | 'shotsOnTarget' | 'offside' | 'penalty') => {
    const targetTeam = selectedTeam;
    const targetName = targetTeam === 'A' ? teamAName : teamBName;

    if (stat === 'corners') {
      store.incrementStat(targetTeam, 'corners');
      store.addMatchEvent({ timeStr, team: targetTeam, type: 'Corner', details: `Corner for ${targetName}` });
    } else if (stat === 'fouls') {
      store.incrementStat(targetTeam, 'fouls');
      store.addMatchEvent({ timeStr, team: targetTeam, type: 'Foul', details: `Foul by ${targetName}` });
    } else if (stat === 'shots') {
      store.incrementStat(targetTeam, 'shots');
      store.addMatchEvent({ timeStr, team: targetTeam, type: 'Goal', details: `Shot off target (${targetName})` });
    } else if (stat === 'shotsOnTarget') {
      store.incrementStat(targetTeam, 'shots');
      store.incrementStat(targetTeam, 'shotsOnTarget');
      store.addMatchEvent({ timeStr, team: targetTeam, type: 'Goal', details: `Shot on target saved (${targetName})` });
    } else if (stat === 'offside') {
      store.addMatchEvent({ timeStr, team: targetTeam, type: 'Offside', details: `Offside flag (${targetName})` });
    } else if (stat === 'penalty') {
      setActiveModal('penalty');
    }
  };

  const handleApplyCustomAddedTime = () => {
    setAddedStoppage(customAddedMinutes);
    store.setAddedStoppageMinutes(customAddedMinutes);
    store.addMatchEvent({
      timeStr,
      team: null,
      type: 'VAR',
      details: `+${customAddedMinutes}' added stoppage/penalty time for ${getHalfString(store.currentHalf)}`
    });
    setIsCustomTimeModalOpen(false);
  };

  const winnerName = 
    store.winner === 'A' 
      ? teamAName 
      : store.winner === 'B' 
      ? teamBName 
      : store.winner === 'Draw' 
      ? 'Match Drawn' 
      : null;

  return (
    <div className="h-[100dvh] max-h-[100dvh] w-full bg-background text-foreground flex flex-col justify-between p-2.5 sm:p-3.5 select-none overflow-hidden font-sans">
      
      {/* 1. Header (Ultra-Compact) */}
      <header className="flex items-center justify-between shrink-0 py-0.5 px-1">
        <div className="flex items-center gap-2">
          <Link 
            href="/practice" 
            className="p-1.5 rounded-xl bg-surface border border-border text-foreground hover:bg-surface-hover active:scale-95 transition-all"
            title="Return to Hub"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          
          <div className="flex items-center gap-1.5">
            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border ${
              store.isTimerRunning 
                ? 'bg-rose-500/15 border-rose-500/40 text-rose-500 animate-pulse' 
                : store.isMatchOver
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                : store.isHalftimeBreak
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-400 animate-pulse'
                : 'bg-amber-500/15 border-amber-500/40 text-amber-400'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${store.isTimerRunning ? 'bg-rose-500 animate-ping' : store.isMatchOver ? 'bg-emerald-500' : 'bg-amber-400'}`}></span>
              {store.isMatchOver ? 'Full Time' : store.isHalftimeBreak ? 'Half-Time Break' : store.isTimerRunning ? 'Live' : 'Paused'}
            </span>
            
            <span className="text-[11px] font-bold text-text-muted">
              {getHalfString(store.currentHalf)} ({halfLengthMinutes}m half) • {store.config.playersPerTeam}v{store.config.playersPerTeam}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button 
            onClick={() => setIsCustomTimeModalOpen(true)}
            title="Add Custom Stoppage/Penalty Time"
            className="p-1.5 rounded-xl bg-surface border border-border text-text-secondary hover:text-foreground active:scale-95 transition-all flex items-center gap-1 text-[10px] font-black"
          >
            <Clock className="w-3.5 h-3.5 text-primary" />
            <span className="hidden sm:inline">Added Time</span>
          </button>

          <button 
            onClick={store.undoLastAction}
            title="Undo"
            className="p-1.5 rounded-xl bg-surface border border-border text-text-secondary hover:text-foreground active:scale-95 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          
          <button 
            onClick={() => setIsRosterOpen(true)}
            title="Lineups"
            className="p-1.5 rounded-xl bg-surface border border-border text-text-secondary hover:text-foreground active:scale-95 transition-all"
          >
            <Users className="w-4 h-4" />
          </button>

          <button 
            onClick={() => setIsThemeModalOpen(true)}
            title="Theme" 
            className="p-1.5 rounded-xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 active:scale-95 transition-all"
          >
            <Palette className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. Hero Scoreboard & Clock Management Card (Fixed height) */}
      <section className="bg-card rounded-2xl border border-border p-3 sm:p-3.5 shadow-md flex flex-col justify-between shrink-0 space-y-2 relative overflow-hidden">
        
        {/* Teams & Score Row */}
        <div className="flex items-center justify-between gap-2">
          
          {/* Team A */}
          <div 
            onClick={() => setSelectedTeam('A')}
            className={`flex-1 flex flex-col items-end text-right cursor-pointer p-1.5 rounded-xl transition-all ${
              selectedTeam === 'A' ? 'bg-primary/10 border border-primary/30 ring-1 ring-primary/20' : 'hover:bg-surface/50'
            }`}
          >
            <div className="font-black text-xs sm:text-sm text-primary truncate max-w-[120px] sm:max-w-[160px]">
              {teamAName}
            </div>
            <div className="text-[10px] text-text-muted font-bold">
              {store.yellowCardsA > 0 && <span className="text-amber-400 mr-1">🟨{store.yellowCardsA}</span>}
              {store.redCardsA > 0 && <span className="text-rose-400 mr-1">🟥{store.redCardsA}</span>}
              <span>({store.subsUsedA}/{maxSubs} sub)</span>
            </div>

            {/* Team A Goal Scorers & Penalty Info */}
            {teamAGoals.length > 0 && (
              <div className="mt-1 flex flex-col items-end space-y-0.5 text-[10px] font-bold text-foreground">
                {teamAGoals.map((g) => (
                  <div key={g.id} className="flex items-center gap-1 flex-wrap justify-end">
                    <span className="text-text-muted font-mono text-[9px]">{formatMatchMinute(g.timeStr)}</span>
                    {g.goalType === 'Penalty' && (
                      <span className="text-[8px] px-1 py-0.2 bg-amber-500/20 text-amber-400 rounded font-black border border-amber-500/30">PEN</span>
                    )}
                    {g.goalType === 'Own Goal' && (
                      <span className="text-[8px] px-1 py-0.2 bg-rose-500/20 text-rose-400 rounded font-black border border-rose-500/30">OG</span>
                    )}
                    <span className="truncate max-w-[80px] sm:max-w-[110px]">{g.scorerName || 'Goal'}</span>
                    {g.assistName && <span className="text-[8px] text-text-muted hidden sm:inline">({g.assistName})</span>}
                    {g.goalType === 'Penalty' && g.foulingPlayerName && (
                      <span className="text-[8px] text-rose-400 hidden sm:inline">(Foul: {g.foulingPlayerName})</span>
                    )}
                    <span>⚽</span>
                  </div>
                ))}
              </div>
            )}
            {teamAPenaltyMisses.length > 0 && (
              <div className="mt-0.5 flex flex-col items-end space-y-0.5 text-[9px] font-bold text-rose-400">
                {teamAPenaltyMisses.map((p) => (
                  <div key={p.id} className="flex items-center gap-1 flex-wrap justify-end">
                    <span className="text-text-muted font-mono text-[8px]">{formatMatchMinute(p.timeStr)}</span>
                    <span className="px-1 py-0.2 bg-rose-500/15 text-rose-400 rounded text-[8px] font-black border border-rose-500/30">
                      {p.penaltyOutcome === 'Saved' ? 'PEN SAVED' : 'PEN MISSED'}
                    </span>
                    <span className="truncate max-w-[70px] sm:max-w-[90px]">{p.scorerName || 'Taker'}</span>
                    {p.foulingPlayerName && (
                      <span className="text-[8px] text-text-muted hidden sm:inline">({p.foulingPlayerName})</span>
                    )}
                    <span>❌</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Center Digital Score */}
          <div className="flex items-center justify-center gap-2 font-mono font-black text-3xl sm:text-4xl text-foreground px-2">
            <span className={store.goalsA > store.goalsB ? 'text-primary' : 'text-foreground'}>{store.goalsA}</span>
            <span className="text-text-muted/30 font-light text-xl sm:text-2xl">—</span>
            <span className={store.goalsB > store.goalsA ? 'text-primary' : 'text-foreground'}>{store.goalsB}</span>
          </div>

          {/* Team B */}
          <div 
            onClick={() => setSelectedTeam('B')}
            className={`flex-1 flex flex-col items-start text-left cursor-pointer p-1.5 rounded-xl transition-all ${
              selectedTeam === 'B' ? 'bg-primary/10 border border-primary/30 ring-1 ring-primary/20' : 'hover:bg-surface/50'
            }`}
          >
            <div className="font-black text-xs sm:text-sm text-foreground truncate max-w-[120px] sm:max-w-[160px]">
              {teamBName}
            </div>
            <div className="text-[10px] text-text-muted font-bold">
              {store.yellowCardsB > 0 && <span className="text-amber-400 mr-1">🟨{store.yellowCardsB}</span>}
              {store.redCardsB > 0 && <span className="text-rose-400 mr-1">🟥{store.redCardsB}</span>}
              <span>({store.subsUsedB}/{maxSubs} sub)</span>
            </div>

            {/* Team B Goal Scorers & Penalty Info */}
            {teamBGoals.length > 0 && (
              <div className="mt-1 flex flex-col items-start space-y-0.5 text-[10px] font-bold text-foreground">
                {teamBGoals.map((g) => (
                  <div key={g.id} className="flex items-center gap-1 flex-wrap justify-start">
                    <span>⚽</span>
                    <span className="truncate max-w-[80px] sm:max-w-[110px]">{g.scorerName || 'Goal'}</span>
                    {g.assistName && <span className="text-[8px] text-text-muted hidden sm:inline">({g.assistName})</span>}
                    {g.goalType === 'Penalty' && g.foulingPlayerName && (
                      <span className="text-[8px] text-rose-400 hidden sm:inline">(Foul: {g.foulingPlayerName})</span>
                    )}
                    {g.goalType === 'Penalty' && (
                      <span className="text-[8px] px-1 py-0.2 bg-amber-500/20 text-amber-400 rounded font-black border border-amber-500/30">PEN</span>
                    )}
                    {g.goalType === 'Own Goal' && (
                      <span className="text-[8px] px-1 py-0.2 bg-rose-500/20 text-rose-400 rounded font-black border border-rose-500/30">OG</span>
                    )}
                    <span className="text-text-muted font-mono text-[9px]">{formatMatchMinute(g.timeStr)}</span>
                  </div>
                ))}
              </div>
            )}
            {teamBPenaltyMisses.length > 0 && (
              <div className="mt-0.5 flex flex-col items-start space-y-0.5 text-[9px] font-bold text-rose-400">
                {teamBPenaltyMisses.map((p) => (
                  <div key={p.id} className="flex items-center gap-1 flex-wrap justify-start">
                    <span>❌</span>
                    <span className="truncate max-w-[70px] sm:max-w-[90px]">{p.scorerName || 'Taker'}</span>
                    {p.foulingPlayerName && (
                      <span className="text-[8px] text-text-muted hidden sm:inline">({p.foulingPlayerName})</span>
                    )}
                    <span className="px-1 py-0.2 bg-rose-500/15 text-rose-400 rounded text-[8px] font-black border border-rose-500/30">
                      {p.penaltyOutcome === 'Saved' ? 'PEN SAVED' : 'PEN MISSED'}
                    </span>
                    <span className="text-text-muted font-mono text-[8px]">{formatMatchMinute(p.timeStr)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Center Clock + Stoppage row */}
        <div className="flex flex-col items-center justify-center gap-1.5">
          <div className="flex items-center gap-2">
            {isOverRegularTime ? (
              <div className="flex items-baseline gap-1 font-mono font-black">
                <span className="text-xl sm:text-2xl text-foreground">
                  {formatTime(currentHalfExpectedTargetSecs)}
                </span>
                <span className="text-xl sm:text-2xl text-amber-400 font-black animate-pulse">
                  +{formatTime(currentStoppageElapsedSecs)}
                </span>
              </div>
            ) : (
              <span className="font-mono font-black text-xl sm:text-2xl tracking-wider text-foreground">
                {formatTime(displaySeconds)}
              </span>
            )}

            {stoppageMinutesAllocated > 0 && (
              <span className="text-[11px] font-black text-amber-400 bg-amber-500/15 px-1.5 py-0.5 rounded-md border border-amber-500/30 animate-pulse flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-400" />
                +{stoppageMinutesAllocated}&apos;
              </span>
            )}

            <span className="text-[10px] text-text-muted font-mono font-bold">
              / {formatTime(currentHalfExpectedTargetSecs)}
            </span>
          </div>

          {/* If currently in extra time, show live running stoppage breakdown */}
          {isOverRegularTime && stoppageMinutesAllocated > 0 && (
            <div className="flex items-center gap-1.5 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-xl text-[10px] text-amber-400 font-bold animate-in fade-in">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
              <span>Running Added Time: <strong className="font-mono text-foreground font-black">+{formatTime(currentStoppageElapsedSecs)}</strong> / {formatTime(stoppageTargetSecs)} (+{stoppageMinutesAllocated}&apos;)</span>
            </div>
          )}

          {/* Stoppage / Extra Added Time Quick Selector Bar inside Scoreboard */}
          <div className="flex items-center gap-1 bg-surface/70 border border-border/60 px-2 py-0.5 rounded-xl text-[10px]">
            <span className="font-bold text-text-muted text-[10px] mr-0.5">Extra Time:</span>
            {[1, 2, 3, 5].map((m) => (
              <button
                key={m}
                onClick={() => {
                  const nextVal = stoppageMinutesAllocated === m ? 0 : m;
                  setAddedStoppage(nextVal);
                  store.setAddedStoppageMinutes(nextVal);
                  if (nextVal > 0) {
                    store.addMatchEvent({
                      timeStr,
                      team: null,
                      type: 'VAR',
                      details: `+${nextVal}' added stoppage/penalty time for ${getHalfString(store.currentHalf)}`
                    });
                  }
                }}
                className={`px-1.5 py-0.5 rounded text-[10px] font-black transition-all ${
                  stoppageMinutesAllocated === m ? 'bg-primary text-black' : 'hover:bg-surface text-text-muted'
                }`}
              >
                +{m}&apos;
              </button>
            ))}
            <button
              onClick={() => setIsCustomTimeModalOpen(true)}
              className="px-1.5 py-0.5 rounded text-[10px] font-black bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 active:scale-95"
            >
              +Custom
            </button>
          </div>
        </div>

        {/* Timer Control Buttons */}
        <div className="flex items-center justify-between gap-1.5 pt-0.5">
          {store.isHalftimeBreak ? (
            <div className="flex items-center gap-2 w-full animate-in fade-in duration-200">
              <button 
                onClick={() => setIsBreakModalOpen(true)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[11px] font-black uppercase tracking-wider hover:bg-amber-500/25 active:scale-95 transition-all shadow-sm"
              >
                <Clock className="w-3.5 h-3.5" /> View Break Card
              </button>
              
              <button 
                onClick={() => {
                  setIsBreakModalOpen(false);
                  setAddedStoppage(0);
                  store.setAddedStoppageMinutes(0);
                  store.startHalf();
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-500 text-black text-[11px] font-black uppercase tracking-wider hover:bg-emerald-400 active:scale-95 transition-all shadow-md shadow-emerald-500/20"
              >
                <PlayCircle className="w-3.5 h-3.5" /> Start {getHalfString(store.currentHalf)}
              </button>
            </div>
          ) : (!store.isTimerRunning && store.matchStartTime === null) ? (
            <button 
              onClick={store.startHalf}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-500 text-black text-[11px] font-black uppercase tracking-wider hover:bg-emerald-400 active:scale-95 transition-all shadow-md shadow-emerald-500/20"
            >
              <PlayCircle className="w-3.5 h-3.5" /> Start {getHalfString(store.currentHalf)}
            </button>
          ) : (
            <button 
              onClick={store.togglePause}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all active:scale-95 shadow-md ${
                store.isTimerRunning 
                  ? 'bg-amber-400 text-black hover:bg-amber-300 shadow-amber-400/20' 
                  : 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-emerald-500/20'
              }`}
            >
              {store.isTimerRunning ? <PauseCircle className="w-3.5 h-3.5" /> : <PlayCircle className="w-3.5 h-3.5" />}
              {store.isTimerRunning ? 'Pause Clock' : 'Resume Clock'}
            </button>
          )}

          {!store.isHalftimeBreak && (
            <>
              <button 
                onClick={() => {
                  store.endHalf();
                  setAddedStoppage(0);
                  store.setAddedStoppageMinutes(0);
                  setIsBreakModalOpen(true);
                }}
                className="px-3 py-2 rounded-xl bg-surface border border-border text-text-secondary hover:text-foreground hover:bg-surface-hover text-[11px] font-bold uppercase tracking-wider transition-all active:scale-95"
              >
                End Half
              </button>

              <button 
                onClick={() => setShowEndMatchConfirm(true)}
                className="px-3 py-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 hover:bg-rose-500/25 text-[11px] font-black uppercase tracking-wider transition-all active:scale-95"
              >
                End Match
              </button>
            </>
          )}
        </div>

      </section>

      {/* 3. Tactical 2 Cards (Possession + Cards/Fouls) - Compact & Fixed */}
      <section className="grid grid-cols-2 gap-2 shrink-0">
        
        {/* Left Card: Possession & Shots */}
        <div className="bg-card rounded-2xl border border-border p-2.5 flex flex-col justify-between shadow-sm space-y-1.5">
          <div className="text-[10px] text-text-muted font-black uppercase tracking-wider">
            Possession
          </div>

          <div className="flex items-center justify-between text-xs font-black">
            <span className="text-primary">{store.possessionA}%</span>
            <span className="text-foreground">{store.possessionB}%</span>
          </div>

          <div className="h-2 rounded-full overflow-hidden bg-surface flex border border-border/60">
            <div 
              className="bg-primary h-full transition-all duration-300"
              style={{ width: `${store.possessionA}%` }}
            />
            <div 
              className="bg-foreground/30 h-full transition-all duration-300"
              style={{ width: `${store.possessionB}%` }}
            />
          </div>

          <div className="flex items-center justify-between pt-0.5">
            <div className="flex gap-1">
              <button 
                onClick={() => store.setPossession(store.possessionA + 5)}
                className="px-2 py-0.5 rounded-lg bg-surface border border-border text-[10px] font-black text-primary hover:bg-surface-hover active:scale-95"
              >
                +
              </button>
              <button 
                onClick={() => store.setPossession(store.possessionA - 5)}
                className="px-2 py-0.5 rounded-lg bg-surface border border-border text-[10px] font-black text-foreground hover:bg-surface-hover active:scale-95"
              >
                -
              </button>
            </div>
            
            <div className="text-[10px] font-bold text-text-muted truncate">
              Shots {store.shotsA} ({store.shotsOnTargetA}) • {store.shotsB} ({store.shotsOnTargetB})
            </div>
          </div>
        </div>

        {/* Right Card: Cards, Fouls, Corners */}
        <div className="bg-card rounded-2xl border border-border p-2.5 flex flex-col justify-between shadow-sm space-y-1.5">
          <div className="text-[10px] text-text-muted font-black uppercase tracking-wider">
            Cards / Fouls
          </div>

          <div className="flex items-center justify-between text-[11px] font-bold">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-3.5 bg-amber-400 rounded-sm inline-block shadow-sm"></span>
              <span>{store.yellowCardsA} - {store.yellowCardsB}</span>
            </div>
            <span className="text-text-muted font-medium">Fouls {store.foulsA} - {store.foulsB}</span>
          </div>

          <div className="flex items-center justify-between text-[11px] font-bold">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-3.5 bg-rose-500 rounded-sm inline-block shadow-sm"></span>
              <span>{store.redCardsA} - {store.redCardsB}</span>
            </div>
            <span className="text-text-muted font-medium">Corners {store.cornersA} - {store.cornersB}</span>
          </div>

          <div className="flex items-center justify-between text-[10px] text-text-muted pt-0.5 border-t border-border/40">
            <span>Substitutions:</span>
            <span className="font-bold text-foreground">
              {store.subsUsedA}/{maxSubs} • {store.subsUsedB}/{maxSubs}
            </span>
          </div>
        </div>

      </section>

      {/* 4. Active Target Selector Pill */}
      <div className="flex items-center justify-between gap-2 bg-surface border border-border p-1 rounded-2xl shrink-0 shadow-sm">
        <button
          onClick={() => setSelectedTeam('A')}
          className={`flex-1 py-1.5 px-2 rounded-xl font-black text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all truncate ${
            selectedTeam === 'A' 
              ? 'bg-primary text-black shadow-sm' 
              : 'text-text-muted hover:text-foreground'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
          <span className="truncate">{teamAName} Action</span>
        </button>
        <button
          onClick={() => setSelectedTeam('B')}
          className={`flex-1 py-1.5 px-2 rounded-xl font-black text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all truncate ${
            selectedTeam === 'B' 
              ? 'bg-primary text-black shadow-sm' 
              : 'text-text-muted hover:text-foreground'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
          <span className="truncate">{teamBName} Action</span>
        </button>
      </div>

      {/* 5. Primary 3 Action Buttons (Goal, Card, Sub) */}
      <section className="grid grid-cols-3 gap-2 shrink-0">
        <button 
          onClick={() => setActiveModal('goal')}
          className="flex flex-col items-center justify-center gap-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 p-2.5 rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-emerald-500/25 active:scale-95 transition-all shadow-sm"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-500 text-black flex items-center justify-center text-lg shadow-sm">
            ⚽
          </div>
          <span>Goal</span>
        </button>

        <button 
          onClick={() => setActiveModal('card')}
          className="flex flex-col items-center justify-center gap-1 bg-amber-500/15 border border-amber-500/30 text-amber-400 p-2.5 rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-amber-500/25 active:scale-95 transition-all shadow-sm"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-400 text-black flex items-center justify-center text-lg shadow-sm">
            🟨
          </div>
          <span>Card</span>
        </button>

        <button 
          onClick={() => setActiveModal('sub')}
          className="flex flex-col items-center justify-center gap-1 bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 p-2.5 rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-cyan-500/25 active:scale-95 transition-all shadow-sm"
        >
          <div className="w-8 h-8 rounded-xl bg-cyan-400 text-black flex items-center justify-center text-lg shadow-sm">
            🔄
          </div>
          <span>Sub ({selectedTeam === 'A' ? store.subsUsedA : store.subsUsedB}/{maxSubs})</span>
        </button>
      </section>

      {/* 6. Secondary 4 Tactical Buttons */}
      <section className="grid grid-cols-4 gap-1.5 shrink-0">
        <button 
          onClick={() => handleQuickStat('corners')}
          className="p-2.5 rounded-xl bg-surface border border-border hover:bg-surface-hover text-foreground text-xs font-bold active:scale-95 transition-all flex flex-col items-center justify-center gap-0.5"
        >
          <span>🚩 Corner</span>
          <span className="text-[10px] text-primary font-mono font-black">{selectedTeam === 'A' ? store.cornersA : store.cornersB}</span>
        </button>

        <button 
          onClick={() => handleQuickStat('fouls')}
          className="p-2.5 rounded-xl bg-surface border border-border hover:bg-surface-hover text-foreground text-xs font-bold active:scale-95 transition-all flex flex-col items-center justify-center gap-0.5"
        >
          <span>⚠️ Foul</span>
          <span className="text-[10px] text-amber-400 font-mono font-black">{selectedTeam === 'A' ? store.foulsA : store.foulsB}</span>
        </button>

        <button 
          onClick={() => handleQuickStat('offside')}
          className="p-2.5 rounded-xl bg-surface border border-border hover:bg-surface-hover text-foreground text-xs font-bold active:scale-95 transition-all flex flex-col items-center justify-center gap-0.5"
        >
          <span>🚫 Offside</span>
          <span className="text-[10px] text-text-muted font-mono font-black">Flag</span>
        </button>

        <button 
          onClick={() => handleQuickStat('penalty')}
          className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 hover:bg-rose-500/20 text-xs font-black active:scale-95 transition-all flex flex-col items-center justify-center gap-0.5"
        >
          <span>🥅 Penalty</span>
          <span className="text-[10px] text-rose-400 font-mono font-black">Kick</span>
        </button>
      </section>

      {/* 7. Bottom Utility Bar (VAR Review & Timeline Drawer) */}
      <footer className="grid grid-cols-2 gap-2 shrink-0 pt-0.5">
        <button 
          onClick={() => {
            const next = !isVarReview;
            setIsVarReview(next);
            store.addMatchEvent({ 
              timeStr, 
              team: null, 
              type: 'VAR', 
              details: next ? 'VAR Review initiated' : 'VAR Review concluded' 
            });
            if (next && store.isTimerRunning) {
              store.togglePause();
            }
          }}
          className={`py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider border transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 ${
            isVarReview 
              ? 'bg-rose-500 text-white border-rose-600 animate-pulse' 
              : 'bg-surface border-border text-text-muted hover:text-foreground'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          {isVarReview ? 'Conclude VAR' : 'VAR Review'}
        </button>

        <button 
          onClick={() => setIsTimelineOpen(true)}
          className="py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider bg-surface border border-border text-text-muted hover:text-foreground transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
        >
          <History className="w-3.5 h-3.5 text-primary" />
          Timeline ({store.matchEvents.length})
        </button>
      </footer>

      {/* Stoppage / Extra / Penalty Time Expiry Prompt Modal */}
      {isStoppagePromptOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card rounded-3xl w-full max-w-sm border border-border p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                <div>
                  <div className="text-[10px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                    Regular Time Completed
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-wider">
                    {getHalfString(store.currentHalf)} ({formatTime(currentHalfExpectedTargetSecs)})
                  </h3>
                </div>
              </div>
              <button 
                onClick={() => setIsStoppagePromptOpen(false)}
                className="p-1 rounded-xl text-text-muted hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-text-muted">
                Regular {halfLengthMinutes} minutes for <span className="text-primary font-bold">{getHalfString(store.currentHalf)}</span> have finished. Choose stoppage/penalty time to continue playing, or conclude half for break:
              </p>

              {/* Quick Stoppage Options */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-wider">
                  Set Extra / Penalty Time & Continue Clock
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[1, 2, 3, 5].map((m) => (
                    <button
                      key={m}
                      onClick={() => {
                        setAddedStoppage(m);
                        store.setAddedStoppageMinutes(m);
                        store.addMatchEvent({
                          timeStr,
                          team: null,
                          type: 'VAR',
                          details: `+${m}' added stoppage/penalty time for ${getHalfString(store.currentHalf)}`
                        });
                        setIsStoppagePromptOpen(false);
                        if (!store.isTimerRunning) {
                          store.togglePause();
                        }
                      }}
                      className="py-2.5 rounded-xl text-xs font-black bg-surface border border-border text-primary hover:bg-primary hover:text-black transition-all active:scale-95 flex flex-col items-center justify-center gap-0.5"
                    >
                      <span className="text-sm">+{m}</span>
                      <span className="text-[9px] opacity-75">min</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Input */}
              <button
                onClick={() => {
                  setIsStoppagePromptOpen(false);
                  setIsCustomTimeModalOpen(true);
                }}
                className="w-full py-2 rounded-xl bg-surface border border-border text-foreground font-bold text-xs hover:bg-surface-hover transition-all flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 text-primary" /> Custom Stoppage Minutes
              </button>
            </div>

            {/* Break / End Half Option */}
            <div className="pt-2 border-t border-border space-y-2">
              <button
                onClick={() => {
                  setIsStoppagePromptOpen(false);
                  if (store.currentHalf === 1) {
                    store.endHalf();
                    setAddedStoppage(0);
                    store.setAddedStoppageMinutes(0);
                    setIsBreakModalOpen(true);
                  } else {
                    setShowEndMatchConfirm(true);
                  }
                }}
                className="w-full py-3 rounded-2xl bg-amber-500 text-black font-black text-xs uppercase tracking-wider hover:bg-amber-400 active:scale-[0.98] transition-all shadow-md shadow-amber-500/25 flex items-center justify-center gap-1.5"
              >
                {store.currentHalf === 1 ? 'Finish 1st Half & Take Break' : 'Conclude Full Time'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Stoppage & Penalty Added Time Modal */}
      {isCustomTimeModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card rounded-3xl w-full max-w-sm border border-border p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <h3 className="text-sm font-black uppercase tracking-wider">Custom Added / Penalty Time</h3>
              </div>
              <button 
                onClick={() => setIsCustomTimeModalOpen(false)}
                className="p-1 rounded-xl text-text-muted hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-text-muted">
                Add extra injury, stoppage, or penalty shootout time for <span className="text-primary font-bold">{getHalfString(store.currentHalf)}</span>:
              </p>

              <div className="flex items-center justify-center gap-3 bg-surface p-3 rounded-2xl border border-border">
                <button
                  onClick={() => setCustomAddedMinutes(Math.max(1, customAddedMinutes - 1))}
                  className="w-10 h-10 rounded-xl bg-card border border-border text-foreground font-black text-base flex items-center justify-center active:scale-90"
                >
                  -
                </button>
                <div className="text-center">
                  <span className="font-mono font-black text-2xl text-primary">+{customAddedMinutes}</span>
                  <span className="text-xs text-text-muted font-bold block">Minutes</span>
                </div>
                <button
                  onClick={() => setCustomAddedMinutes(Math.min(30, customAddedMinutes + 1))}
                  className="w-10 h-10 rounded-xl bg-card border border-border text-foreground font-black text-base flex items-center justify-center active:scale-90"
                >
                  +
                </button>
              </div>

              {/* Quick Presets */}
              <div className="grid grid-cols-4 gap-1.5">
                {[2, 4, 6, 10].map(m => (
                  <button
                    key={m}
                    onClick={() => setCustomAddedMinutes(m)}
                    className={`py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      customAddedMinutes === m ? 'bg-primary text-black font-black border-primary' : 'bg-surface border-border text-text-muted hover:text-foreground'
                    }`}
                  >
                    +{m}m
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
              <button
                onClick={() => {
                  setAddedStoppage(0);
                  setIsCustomTimeModalOpen(false);
                }}
                className="py-2.5 rounded-xl bg-surface border border-border font-bold text-xs hover:bg-surface-hover"
              >
                Clear Added
              </button>
              <button
                onClick={handleApplyCustomAddedTime}
                className="py-2.5 rounded-xl bg-primary text-black font-black text-xs uppercase tracking-wider shadow-md shadow-primary/20 active:scale-95"
              >
                Apply +{customAddedMinutes}&apos;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Timeline Bottom Sheet / Modal */}
      {isTimelineOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex flex-col justify-end animate-in fade-in duration-200">
          <div className="bg-card rounded-t-3xl border-t border-border max-h-[80dvh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="p-4 border-b border-border flex items-center justify-between bg-surface/50">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                <h3 className="font-black text-sm uppercase tracking-wider">Match Event Timeline ({store.matchEvents.length})</h3>
              </div>
              <button 
                onClick={() => setIsTimelineOpen(false)}
                className="p-1.5 rounded-xl bg-surface text-text-muted hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-2 flex-1">
              {store.matchEvents.length === 0 ? (
                <div className="text-center py-12 text-text-muted text-xs">
                  No events logged yet.
                </div>
              ) : (
                [...store.matchEvents].reverse().map((ev) => (
                  <div 
                    key={ev.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-surface border border-border text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-black text-[10px] px-1.5 py-0.5 rounded bg-card border border-border">
                        {ev.timeStr}
                      </span>
                      <span className="text-sm">
                        {ev.type === 'Goal' ? '⚽' : ev.type === 'Yellow' ? '🟨' : ev.type === 'Red' ? '🟥' : ev.type === 'Sub' ? '🔄' : ev.type === 'Corner' ? '🚩' : ev.type === 'Foul' ? '⚠️' : ev.type === 'VAR' ? '📹' : '📢'}
                      </span>
                      <div>
                        <div className="font-bold text-foreground">{ev.details}</div>
                        {ev.team && <div className="text-[10px] text-text-muted">{getTeamName(ev.team)}</div>}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-text-muted uppercase">{ev.type}</span>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 border-t border-border bg-surface/30 flex gap-2">
              <button
                onClick={() => {
                  store.undoLastAction();
                }}
                disabled={store.matchEvents.length === 0}
                className="flex-1 py-2.5 rounded-xl bg-surface border border-border font-bold text-xs hover:bg-surface-hover disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Undo Last
              </button>
              <button
                onClick={() => setIsTimelineOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-primary text-black font-black text-xs uppercase"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal to End Match */}
      {showEndMatchConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card rounded-3xl w-full max-w-sm border border-border p-6 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 mx-auto flex items-center justify-center text-2xl shadow-lg">
              🏁
            </div>
            <div>
              <h3 className="text-lg font-black text-foreground uppercase tracking-wider">Conclude Match?</h3>
              <p className="text-xs text-text-muted mt-1">
                This will finalize full-time scores ({store.goalsA} - {store.goalsB}) and record result to device history.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setShowEndMatchConfirm(false)}
                className="py-3 rounded-2xl bg-surface border border-border font-bold text-xs hover:bg-surface-hover transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  store.endMatch();
                  setShowEndMatchConfirm(false);
                }}
                className="py-3 rounded-2xl bg-rose-500 text-white font-black text-xs uppercase tracking-wider hover:bg-rose-400 transition-all shadow-lg shadow-rose-500/25"
              >
                Finalize
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full-Time Winner / Result Modal */}
      {store.isMatchOver && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-300">
          <div className="bg-card rounded-3xl w-full max-w-md border border-border p-5 sm:p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[95dvh] relative">

            <div className="text-center space-y-1.5 pt-1">
              <div className="w-14 h-14 rounded-2xl bg-primary text-black mx-auto flex items-center justify-center shadow-md text-2xl font-black">
                <Trophy className="w-7 h-7" />
              </div>
              <div className="text-[10px] font-black uppercase tracking-widest text-primary">Match Concluded</div>
              <h2 className="text-xl sm:text-2xl font-black text-foreground uppercase tracking-wide">
                {winnerName === 'Match Drawn' ? 'Match Drawn!' : `${winnerName} Victory!`}
              </h2>
            </div>

            {/* Score Showcase */}
            <div className="bg-surface rounded-2xl p-3.5 border border-border flex items-center justify-between shadow-sm">
              <div className="text-center flex-1">
                <div className="font-black text-xs sm:text-sm text-foreground truncate">{teamAName}</div>
                <div className="text-3xl font-black text-primary mt-1 font-mono">{store.goalsA}</div>
              </div>
              <div className="font-bold text-text-muted text-xs uppercase px-3 tracking-widest">FT</div>
              <div className="text-center flex-1">
                <div className="font-black text-xs sm:text-sm text-foreground truncate">{teamBName}</div>
                <div className="text-3xl font-black text-foreground mt-1 font-mono">{store.goalsB}</div>
              </div>
            </div>

            {/* Goal Scorers & Penalty Summary for Both Teams */}
            <div className="grid grid-cols-2 gap-3 bg-surface border border-border p-3 rounded-2xl text-xs">
              {/* Team A Scorers */}
              <div className="space-y-1">
                <div className="text-[10px] font-black uppercase text-primary border-b border-border/50 pb-1 truncate">
                  {teamAName} Goals & Penalties
                </div>
                {teamAGoals.length === 0 && teamAPenaltyMisses.length === 0 ? (
                  <div className="text-[10px] text-text-muted italic pt-0.5">No goals/penalties</div>
                ) : (
                  <div className="space-y-1 pt-0.5">
                    {teamAGoals.map((g) => (
                      <div key={g.id} className="text-[11px] font-bold flex items-center gap-1 text-foreground flex-wrap">
                        <span>⚽</span>
                        <span className="truncate">{g.scorerName || 'Goal'}</span>
                        <span className="text-[10px] text-text-muted font-mono">{formatMatchMinute(g.timeStr)}</span>
                        {g.goalType === 'Penalty' && (
                          <span className="text-[8px] px-1 bg-amber-500/20 text-amber-400 rounded font-black border border-amber-500/30">PEN</span>
                        )}
                        {g.goalType === 'Own Goal' && (
                          <span className="text-[8px] px-1 bg-rose-500/20 text-rose-400 rounded font-black border border-rose-500/30">OG</span>
                        )}
                        {g.goalType === 'Penalty' && g.foulingPlayerName && (
                          <span className="text-[9px] text-rose-400 font-normal w-full pl-4">
                            ↳ Foul by: {g.foulingPlayerName} {g.penaltyReason ? `(${g.penaltyReason})` : ''}
                          </span>
                        )}
                      </div>
                    ))}
                    {teamAPenaltyMisses.map((p) => (
                      <div key={p.id} className="text-[10px] font-bold flex items-center gap-1 text-rose-400 flex-wrap">
                        <span>❌</span>
                        <span className="truncate">{p.scorerName || 'Taker'}</span>
                        <span className="text-[8px] text-rose-300">({p.penaltyOutcome})</span>
                        <span className="text-[9px] text-text-muted font-mono">{formatMatchMinute(p.timeStr)}</span>
                        {p.foulingPlayerName && (
                          <span className="text-[9px] text-text-muted font-normal w-full pl-4">
                            ↳ Foul by: {p.foulingPlayerName} {p.penaltyReason ? `(${p.penaltyReason})` : ''}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Team B Scorers */}
              <div className="space-y-1">
                <div className="text-[10px] font-black uppercase text-foreground border-b border-border/50 pb-1 truncate">
                  {teamBName} Goals & Penalties
                </div>
                {teamBGoals.length === 0 && teamBPenaltyMisses.length === 0 ? (
                  <div className="text-[10px] text-text-muted italic pt-0.5">No goals/penalties</div>
                ) : (
                  <div className="space-y-1 pt-0.5">
                    {teamBGoals.map((g) => (
                      <div key={g.id} className="text-[11px] font-bold flex items-center gap-1 text-foreground flex-wrap">
                        <span>⚽</span>
                        <span className="truncate">{g.scorerName || 'Goal'}</span>
                        <span className="text-[10px] text-text-muted font-mono">{formatMatchMinute(g.timeStr)}</span>
                        {g.goalType === 'Penalty' && (
                          <span className="text-[8px] px-1 bg-amber-500/20 text-amber-400 rounded font-black border border-amber-500/30">PEN</span>
                        )}
                        {g.goalType === 'Own Goal' && (
                          <span className="text-[8px] px-1 bg-rose-500/20 text-rose-400 rounded font-black border border-rose-500/30">OG</span>
                        )}
                        {g.goalType === 'Penalty' && g.foulingPlayerName && (
                          <span className="text-[9px] text-rose-400 font-normal w-full pl-4">
                            ↳ Foul by: {g.foulingPlayerName} {g.penaltyReason ? `(${g.penaltyReason})` : ''}
                          </span>
                        )}
                      </div>
                    ))}
                    {teamBPenaltyMisses.map((p) => (
                      <div key={p.id} className="text-[10px] font-bold flex items-center gap-1 text-rose-400 flex-wrap">
                        <span>❌</span>
                        <span className="truncate">{p.scorerName || 'Taker'}</span>
                        <span className="text-[8px] text-rose-300">({p.penaltyOutcome})</span>
                        <span className="text-[9px] text-text-muted font-mono">{formatMatchMinute(p.timeStr)}</span>
                        {p.foulingPlayerName && (
                          <span className="text-[9px] text-text-muted font-normal w-full pl-4">
                            ↳ Foul by: {p.foulingPlayerName} {p.penaltyReason ? `(${p.penaltyReason})` : ''}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Comprehensive Complete Stats Summary Table */}
            <div className="space-y-1.5 text-xs bg-surface p-3.5 rounded-2xl border border-border">
              <div className="grid grid-cols-3 text-text-muted pb-1.5 border-b border-border/60 font-black text-[10px] uppercase tracking-wider">
                <span className="text-left truncate">{teamAName}</span>
                <span className="text-center">Stats Summary</span>
                <span className="text-right truncate">{teamBName}</span>
              </div>

              {/* Possession */}
              <div className="grid grid-cols-3 items-center py-1 border-b border-border/30">
                <span className="font-mono font-bold text-left">{store.possessionA}%</span>
                <span className="text-text-muted font-sans text-[11px] text-center">Possession</span>
                <span className="font-mono font-bold text-right">{store.possessionB}%</span>
              </div>

              {/* Shots (On Target) */}
              <div className="grid grid-cols-3 items-center py-1 border-b border-border/30">
                <span className="font-mono font-bold text-left">{store.shotsA} ({store.shotsOnTargetA})</span>
                <span className="text-text-muted font-sans text-[11px] text-center">Shots (Target)</span>
                <span className="font-mono font-bold text-right">{store.shotsB} ({store.shotsOnTargetB})</span>
              </div>

              {/* Corners */}
              <div className="grid grid-cols-3 items-center py-1 border-b border-border/30">
                <span className="font-mono font-bold text-left">{store.cornersA}</span>
                <span className="text-text-muted font-sans text-[11px] text-center">Corners</span>
                <span className="font-mono font-bold text-right">{store.cornersB}</span>
              </div>

              {/* Fouls */}
              <div className="grid grid-cols-3 items-center py-1 border-b border-border/30">
                <span className="font-mono font-bold text-left">{store.foulsA}</span>
                <span className="text-text-muted font-sans text-[11px] text-center">Fouls</span>
                <span className="font-mono font-bold text-right">{store.foulsB}</span>
              </div>

              {/* Yellow Cards */}
              <div className="grid grid-cols-3 items-center py-1 border-b border-border/30">
                <span className="font-mono font-bold text-left text-amber-400">🟨 {store.yellowCardsA}</span>
                <span className="text-text-muted font-sans text-[11px] text-center">Yellow Cards</span>
                <span className="font-mono font-bold text-right text-amber-400">{store.yellowCardsB} 🟨</span>
              </div>

              {/* Red Cards */}
              <div className="grid grid-cols-3 items-center py-1 border-b border-border/30">
                <span className="font-mono font-bold text-left text-rose-400">🟥 {store.redCardsA}</span>
                <span className="text-text-muted font-sans text-[11px] text-center">Red Cards</span>
                <span className="font-mono font-bold text-right text-rose-400">{store.redCardsB} 🟥</span>
              </div>

              {/* Offsides */}
              <div className="grid grid-cols-3 items-center py-1 border-b border-border/30">
                <span className="font-mono font-bold text-left">{offsidesA}</span>
                <span className="text-text-muted font-sans text-[11px] text-center">Offsides</span>
                <span className="font-mono font-bold text-right">{offsidesB}</span>
              </div>

              {/* Substitutions */}
              <div className="grid grid-cols-3 items-center py-1">
                <span className="font-mono font-bold text-left">{store.subsUsedA}/{maxSubs}</span>
                <span className="text-text-muted font-sans text-[11px] text-center">Substitutions</span>
                <span className="font-mono font-bold text-right">{store.subsUsedB}/{maxSubs}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                onClick={() => {
                  store.resetMatch();
                }}
                className="py-3.5 rounded-2xl bg-surface border border-border font-black text-xs uppercase tracking-wider text-foreground hover:bg-surface-hover active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-4 h-4" /> Rematch
              </button>
              <button
                onClick={() => router.push('/practice')}
                className="py-3.5 rounded-2xl bg-primary text-black font-black text-xs uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> Match Hub
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Roster Modal */}
      <RosterModal
        isOpen={isRosterOpen}
        onClose={() => setIsRosterOpen(false)}
        sport="Football"
        teamAName={store.config.teamA}
        teamBName={store.config.teamB}
        playersA={store.playersA}
        playersB={store.playersB}
        onSubstitute={store.substitutePlayer}
      />
      
      {/* Break Card Modal */}
      <FootballBreakModal
        isOpen={isBreakModalOpen}
        onClose={() => setIsBreakModalOpen(false)}
        onOpenRoster={() => setIsRosterOpen(true)}
        onStartNextHalf={() => {
          setIsBreakModalOpen(false);
          setAddedStoppage(0);
          store.setAddedStoppageMinutes(0);
          store.startHalf();
        }}
        onResumePreviousHalf={() => {
          setIsBreakModalOpen(false);
          store.resumePreviousHalf();
          setIsStoppagePromptOpen(true);
        }}
      />

      {/* Action Modals */}
      {(activeModal === 'goal' || activeModal === 'penalty') && (
        <FootballGoalModal 
          onClose={() => setActiveModal(null)} 
          timeStr={timeStr} 
          initialTeam={selectedTeam}
          isPenaltyMode={activeModal === 'penalty'}
        />
      )}
      {activeModal === 'card' && <FootballCardModal onClose={() => setActiveModal(null)} timeStr={timeStr} />}
      {activeModal === 'sub' && <FootballSubModal onClose={() => setActiveModal(null)} timeStr={timeStr} />}

      {/* Theme Customizer Modal */}
      <ThemeModal open={isThemeModalOpen} onClose={() => setIsThemeModalOpen(false)} />
    </div>
  );
}
