'use client';

import { useCricketStore, Team } from '@/lib/store/useCricketStore';
import { Player } from '@/lib/store/useMatchStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Undo2,
  Users,
  Palette,
  MoreVertical,
  Trophy,
  RotateCcw,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Coffee,
  Play,
  Target,
  Shield,
  Award,
  Clock,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import RosterModal from '../components/RosterModal';
import WicketModal from '../components/WicketModal';
import LineupModal from '../components/LineupModal';
import BowlerSelectModal from '../components/BowlerSelectModal';
import { ThemeModal } from '@/components/theme/ThemeModal';

export default function CricketScoringBoard() {
  const router = useRouter();
  const store = useCricketStore();

  const [isRosterOpen, setIsRosterOpen] = useState(false);
  const [isWicketModalOpen, setIsWicketModalOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isEndInningsConfirmOpen, setIsEndInningsConfirmOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [breakTimer, setBreakTimer] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (store.isUmpireBreak && store.breakStartTime) {
      setBreakTimer(Math.floor((Date.now() - store.breakStartTime) / 1000));
      interval = setInterval(() => {
        setBreakTimer(Math.floor((Date.now() - store.breakStartTime!) / 1000));
      }, 1000);
    } else {
      setBreakTimer(0);
    }
    return () => clearInterval(interval);
  }, [store.isUmpireBreak, store.breakStartTime]);

  if (!store.config) {
    return (
      <div className="flex flex-col items-center justify-center h-[100dvh] bg-background text-foreground p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mb-4 text-3xl">
          🏏
        </div>
        <h1 className="text-2xl font-bold mb-2">No Match Configured</h1>
        <p className="text-xs text-text-muted mb-6">Please configure teams and match overs first.</p>
        <Link
          href="/match-setup?sport=Cricket"
          className="bg-primary text-primary-foreground font-bold py-3 px-6 rounded-xl hover:bg-primary-hover transition-colors text-sm"
        >
          Setup Cricket Match
        </Link>
      </div>
    );
  }

  const {
    config,
    runsA,
    wicketsA,
    validBallsA,
    runsB,
    wicketsB,
    validBallsB,
    firstInningsTeam,
    secondInningsTeam,
    innings,
    currentInnings,
    currentOverHistory,
    isMatchOver,
    isInningsBreak,
    isUmpireBreak,
    winner,
    winReason,
    playersA,
    playersB,
    strikerId,
    nonStrikerId,
    currentBowlerId,
    batterStats,
    bowlerStats,
    partnership,
    lastWicket,
  } = store;

  const isBattingA = currentInnings === 'A';
  const battingTeamName = isBattingA ? config.teamA : config.teamB;
  const bowlingTeamName = isBattingA ? config.teamB : config.teamA;

  const currentRuns = isBattingA ? runsA : runsB;
  const currentWickets = isBattingA ? wicketsA : wicketsB;
  const currentBalls = isBattingA ? validBallsA : validBallsB;
  const currentOvers = Math.floor(currentBalls / 6);
  const currentOverBalls = currentBalls % 6;
  const crr = currentBalls > 0 ? ((currentRuns / currentBalls) * 6).toFixed(2) : '0.00';

  // 1st Innings Data
  const firstInningsBattingName = firstInningsTeam === 'A' ? config.teamA : config.teamB;
  const firstInningsBowlingName = firstInningsTeam === 'A' ? config.teamB : config.teamA;
  const firstInningsRuns = firstInningsTeam === 'A' ? runsA : runsB;
  const firstInningsWickets = firstInningsTeam === 'A' ? wicketsA : wicketsB;
  const firstInningsBalls = firstInningsTeam === 'A' ? validBallsA : validBallsB;
  const firstInningsOvers = `${Math.floor(firstInningsBalls / 6)}.${firstInningsBalls % 6}`;
  const firstInningsCrr = firstInningsBalls > 0 ? ((firstInningsRuns / firstInningsBalls) * 6).toFixed(2) : '0.00';

  // 2nd Innings Data
  const secondInningsBattingName = secondInningsTeam === 'A' ? config.teamA : config.teamB;
  const secondInningsRuns = secondInningsTeam === 'A' ? runsA : runsB;
  const secondInningsWickets = secondInningsTeam === 'A' ? wicketsA : wicketsB;
  const secondInningsBalls = secondInningsTeam === 'A' ? validBallsA : validBallsB;
  const secondInningsOvers = `${Math.floor(secondInningsBalls / 6)}.${secondInningsBalls % 6}`;
  const secondInningsCrr = secondInningsBalls > 0 ? ((secondInningsRuns / secondInningsBalls) * 6).toFixed(2) : '0.00';

  // Target calculation for 2nd innings
  const targetRuns = firstInningsRuns + 1;
  const targetBalls = config.totalOvers * 6 - currentBalls;
  const runsNeeded = Math.max(0, targetRuns - currentRuns);
  const rrr =
    innings === 2 && targetBalls > 0
      ? ((runsNeeded / targetBalls) * 6).toFixed(2)
      : '—';

  const battingTeamPlayers = isBattingA ? playersA : playersB;
  const bowlingTeamPlayers = isBattingA ? playersB : playersA;

  const striker = battingTeamPlayers.find((p) => p.id === strikerId);
  const nonStriker = battingTeamPlayers.find((p) => p.id === nonStrikerId);
  const currentBowler = bowlingTeamPlayers.find((p) => p.id === currentBowlerId);

  const strikerStats = strikerId ? batterStats[strikerId] || { runs: 0, balls: 0 } : null;
  const nonStrikerStats = nonStrikerId ? batterStats[nonStrikerId] || { runs: 0, balls: 0 } : null;
  const bowlerSt = currentBowlerId
    ? bowlerStats[currentBowlerId] || {
        balls: 0,
        maidens: 0,
        runs: 0,
        wickets: 0,
        wides: 0,
        noBalls: 0,
        byes: 0,
        legByes: 0,
      }
    : null;

  // Determine which auto-modal to show (suppressed during break & innings break)
  const needsLineup = Boolean(!isMatchOver && !isInningsBreak && !isUmpireBreak && !strikerId && !nonStrikerId);
  const needsBowler = Boolean(!isMatchOver && !isInningsBreak && !isUmpireBreak && strikerId && !currentBowlerId && !needsLineup);

  const getAlreadyBattedIds = () => {
    return battingTeamPlayers.filter((p) => batterStats[p.id] !== undefined).map((p) => p.id);
  };

  interface TopBatter {
    player: Player;
    runs: number;
    balls: number;
  }

  interface TopBowler {
    player: Player;
    wickets: number;
    runs: number;
    balls: number;
  }

  // Helper to calculate top batter & bowler for any team
  const getTopBatter = (players: Player[]): TopBatter | null => {
    let top: TopBatter | null = null;
    players.forEach((p) => {
      const stats = batterStats[p.id];
      if (stats && stats.balls > 0) {
        if (!top || stats.runs > top.runs || (stats.runs === top.runs && stats.balls < top.balls)) {
          top = { player: p, runs: stats.runs, balls: stats.balls };
        }
      }
    });
    return top;
  };

  const getTopBowler = (players: Player[]): TopBowler | null => {
    let top: TopBowler | null = null;
    players.forEach((p) => {
      const stats = bowlerStats[p.id];
      if (stats && stats.balls > 0) {
        if (!top || stats.wickets > top.wickets || (stats.wickets === top.wickets && stats.runs < top.runs)) {
          top = { player: p, wickets: stats.wickets, runs: stats.runs, balls: stats.balls };
        }
      }
    });
    return top;
  };

  // Top performers for Innings 1 & 2
  const innings1BattingPlayers = firstInningsTeam === 'A' ? playersA : playersB;
  const innings1BowlingPlayers = firstInningsTeam === 'A' ? playersB : playersA;
  const topBatterInnings1 = getTopBatter(innings1BattingPlayers);
  const topBowlerInnings1 = getTopBowler(innings1BowlingPlayers);

  const innings2BattingPlayers = secondInningsTeam === 'A' ? playersA : playersB;
  const innings2BowlingPlayers = secondInningsTeam === 'A' ? playersB : playersA;
  const topBatterInnings2 = getTopBatter(innings2BattingPlayers);
  const topBowlerInnings2 = getTopBowler(innings2BowlingPlayers);

  const scoreStr = `${currentRuns}/${currentWickets}`;
  const overStr = `${currentOvers}.${currentOverBalls}`;

  const formatBreakTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-background text-foreground overflow-hidden font-sans select-none">
      {/* Top Bar */}
      <header className="px-3 sm:px-4 py-2.5 flex items-center justify-between border-b border-border bg-card/90 backdrop-blur-md shrink-0 z-30">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/practice')}
            className="p-1.5 rounded-xl hover:bg-surface text-text-muted hover:text-foreground transition-colors"
            title="Back to Vault"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="px-2 py-0.5 bg-rose-500/15 border border-rose-500/30 text-rose-500 rounded-md text-[10px] font-black uppercase tracking-wide">
            live
          </div>
          <span className="text-xs font-bold text-text-secondary truncate max-w-[130px] sm:max-w-none">
            {config.teamA} vs {config.teamB} • T{config.totalOvers}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Umpire Break / Timeout Provision Button */}
          <button
            onClick={() => store.toggleUmpireBreak()}
            title={isUmpireBreak ? 'Resume Match' : 'Call Umpire Break / Timeout'}
            className={`px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-bold border transition-all active:scale-95 ${
              isUmpireBreak
                ? 'bg-amber-500 text-black border-amber-400 animate-pulse shadow-md shadow-amber-500/20'
                : 'bg-surface hover:bg-surface-hover border-border text-text-secondary hover:text-foreground'
            }`}
          >
            <Coffee className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">{isUmpireBreak ? 'Break Active' : 'Break'}</span>
          </button>

          <button
            onClick={() => setIsThemeModalOpen(true)}
            title="Appearance Theme"
            className="p-2 rounded-xl hover:bg-surface text-primary transition-colors"
          >
            <Palette className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsRosterOpen(true)}
            title="Team Roster & Subs"
            className="p-2 rounded-xl hover:bg-surface text-text-secondary hover:text-foreground transition-colors"
          >
            <Users className="w-4 h-4" />
          </button>
          <button
            onClick={store.undoLastBall}
            disabled={isMatchOver || isInningsBreak}
            title="Undo Last Ball"
            className="p-2 rounded-xl hover:bg-surface text-text-secondary hover:text-foreground transition-colors disabled:opacity-30"
          >
            <Undo2 className="w-4 h-4" />
          </button>

          {/* Options Menu */}
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-xl hover:bg-surface text-text-secondary hover:text-foreground transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 top-10 w-48 bg-card border border-border rounded-2xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95">
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    store.toggleUmpireBreak();
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-bold rounded-xl text-foreground hover:bg-surface transition flex items-center gap-2"
                >
                  <Coffee className="w-3.5 h-3.5 text-amber-500" />
                  {isUmpireBreak ? 'Resume Match' : 'Call Drinks/Break'}
                </button>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsEndInningsConfirmOpen(true);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-bold rounded-xl text-amber-500 hover:bg-amber-500/10 transition"
                >
                  {innings === 1 ? 'End 1st Innings' : 'End Match Early'}
                </button>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    if (confirm('Reset entire match score?')) {
                      store.resetMatch();
                    }
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-bold rounded-xl text-rose-500 hover:bg-rose-500/10 transition"
                >
                  Reset Match
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Score Area */}
      <div className="flex-1 flex flex-col p-3 sm:p-4 overflow-y-auto space-y-3">
        {/* Score Box */}
        <div className="bg-card rounded-3xl border border-border p-4 sm:p-5 flex flex-col items-center justify-center relative shadow-sm">
          <div className="text-[11px] font-black uppercase tracking-wider text-primary mb-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Innings {innings} • {battingTeamName} Batting
          </div>

          <div className="flex items-center justify-center gap-3 sm:gap-6 my-1 w-full">
            <div className="text-right flex-1 truncate">
              <span
                className={`text-xs sm:text-sm font-black uppercase truncate block ${
                  isBattingA ? 'text-primary' : 'text-text-muted'
                }`}
              >
                {config.teamA}
              </span>
              <span className="text-[10px] font-bold text-text-muted">
                {runsA}/{wicketsA} ({Math.floor(validBallsA / 6)}.{validBallsA % 6})
              </span>
            </div>

            <div className="flex items-baseline gap-1 shrink-0 bg-surface px-4 py-2 rounded-2xl border border-border shadow-inner">
              <span className="text-4xl sm:text-5xl font-black tracking-tighter text-foreground">
                {currentRuns}
              </span>
              <span className="text-3xl sm:text-4xl font-black text-text-muted">
                /{currentWickets}
              </span>
            </div>

            <div className="text-left flex-1 truncate">
              <span
                className={`text-xs sm:text-sm font-black uppercase truncate block ${
                  !isBattingA ? 'text-primary' : 'text-text-muted'
                }`}
              >
                {config.teamB}
              </span>
              <span className="text-[10px] font-bold text-text-muted">
                {runsB}/{wicketsB} ({Math.floor(validBallsB / 6)}.{validBallsB % 6})
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 sm:gap-6 text-xs font-bold text-text-secondary mt-2 flex-wrap">
            <span>
              Overs {currentOvers}.{currentOverBalls} / {config.totalOvers}.0
            </span>
            <span>•</span>
            <span>CRR {crr}</span>
            {innings === 2 && (
              <>
                <span>•</span>
                <span className="text-primary font-black">
                  Need {runsNeeded} in {targetBalls}b (RRR {rrr})
                </span>
              </>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          {/* Batting Card */}
          <div className="bg-card rounded-2xl border border-border p-3 sm:p-3.5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="text-[10px] text-text-muted font-black uppercase tracking-widest mb-2 flex items-center justify-between">
                <span>Batting</span>
                <span className="text-primary font-bold">🏏</span>
              </div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-bold text-foreground text-xs sm:text-sm truncate pr-1">
                  {striker?.name || '—'}{' '}
                  <span className="text-primary ml-0.5 font-black">*</span>
                </span>
                <span className="font-black text-foreground font-mono text-xs sm:text-sm shrink-0">
                  {strikerStats?.runs || 0}{' '}
                  <span className="text-text-muted text-[10px] font-normal">
                    ({strikerStats?.balls || 0})
                  </span>
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-text-secondary text-xs truncate pr-1">
                  {nonStriker?.name || '—'}
                </span>
                <span className="font-bold text-text-secondary font-mono text-xs shrink-0">
                  {nonStrikerStats?.runs || 0}{' '}
                  <span className="text-text-muted text-[10px] font-normal">
                    ({nonStrikerStats?.balls || 0})
                  </span>
                </span>
              </div>
            </div>
            <div className="text-[10px] font-bold text-text-muted mt-2 pt-1.5 border-t border-border">
              Partnership: <span className="text-foreground">{partnership.runs}</span> ({partnership.balls}b)
            </div>
          </div>

          {/* Bowling Card */}
          <div className="bg-card rounded-2xl border border-border p-3 sm:p-3.5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="text-[10px] text-text-muted font-black uppercase tracking-widest mb-2 flex items-center justify-between">
                <span>Bowling</span>
                <span className="text-primary font-bold">🎯</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-foreground text-xs sm:text-sm truncate pr-1">
                  {currentBowler?.name || 'Select Bowler'}
                </span>
                <span className="font-black text-foreground font-mono text-xs tracking-wider tabular-nums shrink-0">
                  {bowlerSt
                    ? `${Math.floor(bowlerSt.balls / 6)}.${bowlerSt.balls % 6}-${bowlerSt.maidens}-${bowlerSt.runs}-${bowlerSt.wickets}`
                    : '0.0-0-0-0'}
                </span>
              </div>
              <div className="text-[10px] font-medium text-text-muted mt-1">
                Econ:{' '}
                <span className="font-bold text-foreground">
                  {bowlerSt && bowlerSt.balls > 0
                    ? ((bowlerSt.runs / bowlerSt.balls) * 6).toFixed(2)
                    : '—'}
                </span>
              </div>
            </div>
            <div className="text-[10px] text-text-muted mt-2 pt-1.5 border-t border-border truncate">
              Extras: {bowlerSt ? bowlerSt.wides + bowlerSt.noBalls + bowlerSt.byes + bowlerSt.legByes : 0} (wd {bowlerSt?.wides || 0}, nb {bowlerSt?.noBalls || 0})
            </div>
          </div>
        </div>

        {/* This Over & Last Wicket */}
        <div className="flex items-center justify-between px-1 bg-surface/50 p-2.5 rounded-2xl border border-border">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[10px] font-black text-text-muted uppercase tracking-wider shrink-0">
              This Over
            </span>
            <div className="flex gap-1.5 overflow-x-auto hide-scrollbar">
              {currentOverHistory.map((b, i) => {
                let label = b.runs.toString();
                if (b.extra === 'WD') label = 'wd';
                if (b.extra === 'NB') label = 'nb';
                if (b.extra === 'B') label = 'b';
                if (b.extra === 'LB') label = 'lb';
                if (b.isWicket) label = 'w';
                if (b.runs === 0 && !b.extra && !b.isWicket) label = '·';

                return (
                  <div
                    key={i}
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border shrink-0 ${
                      b.isWicket
                        ? 'bg-rose-500/15 border-rose-500/40 text-rose-500'
                        : b.runs === 4 || b.runs === 6
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-500'
                        : 'bg-card border-border text-foreground'
                    }`}
                  >
                    {label}
                  </div>
                );
              })}
              {currentOverHistory.length === 0 && (
                <div className="w-6 h-6 rounded-full border border-border bg-card flex items-center justify-center text-text-muted text-xs">
                  ·
                </div>
              )}
            </div>
          </div>
          <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider text-right truncate pl-2">
            Last Wkt:{' '}
            <span className="text-foreground">
              {lastWicket ? `${lastWicket.batterId} (${lastWicket.scoreAtWicket})` : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Control Keypad */}
      <div className="p-3 sm:p-4 bg-card/95 border-t border-border pb-6 sm:pb-8 shrink-0 relative z-20 backdrop-blur-md">
        <div className="grid grid-cols-4 gap-2 max-w-lg mx-auto">
          {/* Row 1: Runs 0, 1, 2, 3 */}
          <button
            onClick={() => store.addRun(0)}
            disabled={isMatchOver || isInningsBreak || isUmpireBreak || !strikerId || !currentBowlerId}
            className="h-12 bg-surface hover:bg-surface-hover active:scale-95 border border-border rounded-2xl text-foreground font-black text-lg transition disabled:opacity-30 shadow-sm"
          >
            0
          </button>
          <button
            onClick={() => store.addRun(1)}
            disabled={isMatchOver || isInningsBreak || isUmpireBreak || !strikerId || !currentBowlerId}
            className="h-12 bg-surface hover:bg-surface-hover active:scale-95 border border-border rounded-2xl text-foreground font-black text-lg transition disabled:opacity-30 shadow-sm"
          >
            1
          </button>
          <button
            onClick={() => store.addRun(2)}
            disabled={isMatchOver || isInningsBreak || isUmpireBreak || !strikerId || !currentBowlerId}
            className="h-12 bg-surface hover:bg-surface-hover active:scale-95 border border-border rounded-2xl text-foreground font-black text-lg transition disabled:opacity-30 shadow-sm"
          >
            2
          </button>
          <button
            onClick={() => store.addRun(3)}
            disabled={isMatchOver || isInningsBreak || isUmpireBreak || !strikerId || !currentBowlerId}
            className="h-12 bg-surface hover:bg-surface-hover active:scale-95 border border-border rounded-2xl text-foreground font-black text-lg transition disabled:opacity-30 shadow-sm"
          >
            3
          </button>

          {/* Row 2: Boundaries 4, 6 */}
          <button
            onClick={() => store.addRun(4)}
            disabled={isMatchOver || isInningsBreak || isUmpireBreak || !strikerId || !currentBowlerId}
            className="col-span-2 h-12 bg-emerald-500/15 hover:bg-emerald-500/25 active:scale-95 border border-emerald-500/40 text-emerald-500 rounded-2xl text-lg font-black transition disabled:opacity-30 shadow-sm flex items-center justify-center gap-1"
          >
            <span>FOUR</span>
            <span className="text-xs font-extrabold px-1.5 py-0.5 rounded bg-emerald-500/20">
              4
            </span>
          </button>
          <button
            onClick={() => store.addRun(6)}
            disabled={isMatchOver || isInningsBreak || isUmpireBreak || !strikerId || !currentBowlerId}
            className="col-span-2 h-12 bg-emerald-500/15 hover:bg-emerald-500/25 active:scale-95 border border-emerald-500/40 text-emerald-500 rounded-2xl text-lg font-black transition disabled:opacity-30 shadow-sm flex items-center justify-center gap-1"
          >
            <span>SIX</span>
            <span className="text-xs font-extrabold px-1.5 py-0.5 rounded bg-emerald-500/20">
              6
            </span>
          </button>

          {/* Row 3: Extras */}
          <button
            onClick={() => store.addExtra(0, 'WD')}
            disabled={isMatchOver || isInningsBreak || isUmpireBreak || !currentBowlerId}
            className="h-11 bg-amber-500/15 hover:bg-amber-500/25 active:scale-95 border border-amber-500/40 text-amber-500 rounded-xl text-xs font-black uppercase transition disabled:opacity-30 shadow-sm"
          >
            WD
          </button>
          <button
            onClick={() => store.addExtra(0, 'NB')}
            disabled={isMatchOver || isInningsBreak || isUmpireBreak || !currentBowlerId}
            className="h-11 bg-amber-500/15 hover:bg-amber-500/25 active:scale-95 border border-amber-500/40 text-amber-500 rounded-xl text-xs font-black uppercase transition disabled:opacity-30 shadow-sm"
          >
            NB
          </button>
          <button
            onClick={() => store.addExtra(1, 'B')}
            disabled={isMatchOver || isInningsBreak || isUmpireBreak || !currentBowlerId}
            className="h-11 bg-amber-500/15 hover:bg-amber-500/25 active:scale-95 border border-amber-500/40 text-amber-500 rounded-xl text-xs font-black uppercase transition disabled:opacity-30 shadow-sm"
          >
            BYE
          </button>
          <button
            onClick={() => store.addExtra(1, 'LB')}
            disabled={isMatchOver || isInningsBreak || isUmpireBreak || !currentBowlerId}
            className="h-11 bg-amber-500/15 hover:bg-amber-500/25 active:scale-95 border border-amber-500/40 text-amber-500 rounded-xl text-xs font-black uppercase transition disabled:opacity-30 shadow-sm"
          >
            LB
          </button>

          {/* Row 4: Swap Strike & Wicket */}
          <button
            onClick={() => store.swapStrike()}
            disabled={isMatchOver || isInningsBreak || isUmpireBreak || !strikerId || !nonStrikerId}
            className="col-span-2 h-11 bg-surface hover:bg-surface-hover active:scale-95 border border-border text-foreground rounded-xl text-xs font-bold transition disabled:opacity-30 shadow-sm flex items-center justify-center gap-1.5"
          >
            <span>⇋ Swap Strike</span>
          </button>
          <button
            onClick={() => setIsWicketModalOpen(true)}
            disabled={isMatchOver || isInningsBreak || isUmpireBreak || !strikerId || !currentBowlerId}
            className="col-span-2 h-11 bg-rose-500/15 hover:bg-rose-500/25 active:scale-95 border border-rose-500/40 text-rose-500 rounded-xl text-xs font-black uppercase transition disabled:opacity-30 shadow-sm flex items-center justify-center gap-1.5"
          >
            <span>Wicket Out</span>
          </button>
        </div>
      </div>

      {/* Lineup & Selection Modals */}
      <RosterModal
        isOpen={isRosterOpen}
        onClose={() => setIsRosterOpen(false)}
        sport="Cricket"
        teamAName={config.teamA}
        teamBName={config.teamB}
        playersA={playersA}
        playersB={playersB}
        onSubstitute={store.substitutePlayer}
      />

      <LineupModal
        isOpen={needsLineup}
        battingTeam={battingTeamPlayers}
        bowlingTeam={bowlingTeamPlayers}
        onConfirm={store.setMatchLineup}
      />

      <BowlerSelectModal
        isOpen={needsBowler}
        bowlingTeam={bowlingTeamPlayers}
        onConfirm={store.setBowler}
      />

      <WicketModal
        isOpen={isWicketModalOpen}
        onClose={() => setIsWicketModalOpen(false)}
        batterName={striker?.name || 'Batter'}
        batterId={striker?.id || ''}
        scoreStr={scoreStr}
        overStr={overStr}
        battingTeam={battingTeamPlayers}
        fieldingTeam={bowlingTeamPlayers}
        alreadyBattedIds={getAlreadyBattedIds()}
        strikerId={strikerId}
        nonStrikerId={nonStrikerId}
        onConfirm={(type, nextId, fielderId) => {
          store.addWicket(type, nextId, fielderId);
          setIsWicketModalOpen(false);
        }}
      />

      {/* End Innings Confirmation Modal */}
      {isEndInningsConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border p-6 rounded-3xl max-w-sm w-full shadow-2xl space-y-4 text-center">
            <h3 className="text-lg font-bold text-foreground">
              {innings === 1 ? 'End 1st Innings?' : 'End Match Early?'}
            </h3>
            <p className="text-xs text-text-muted">
              {innings === 1
                ? `This will conclude ${battingTeamName}'s batting at ${currentRuns}/${currentWickets} and set the target for ${bowlingTeamName}.`
                : 'This will declare the match finished and compute the final winner.'}
            </p>
            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setIsEndInningsConfirmOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-border text-xs font-bold text-text-secondary hover:bg-surface"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsEndInningsConfirmOpen(false);
                  store.endInnings();
                }}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 text-black text-xs font-bold hover:bg-amber-400"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          1. FIRST INNINGS BREAK CARD (Modal with summary & Start 2nd Innings button)
         ══════════════════════════════════════════════════════════════════════ */}
      {isInningsBreak && !isMatchOver && (
        <div className="fixed inset-0 z-[55] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-card border-2 border-primary/30 p-5 sm:p-6 rounded-3xl max-w-sm w-full shadow-[0_20px_50px_rgba(0,0,0,0.6)] space-y-4 text-center animate-in zoom-in-95">
            {/* Header Icon & Title */}
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center shadow-lg">
                <Target className="w-7 h-7" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 mt-1">
                Mid-Match Intermission
              </span>
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">
                1st Innings Break
              </h2>
            </div>

            {/* 1st Innings Score Summary Card */}
            <div className="bg-surface border border-border p-4 rounded-2xl text-left space-y-3">
              <div className="flex items-center justify-between border-b border-border/80 pb-2">
                <div>
                  <span className="text-[10px] font-black text-text-muted uppercase tracking-wider block">
                    1st Innings Score
                  </span>
                  <span className="text-sm font-bold text-foreground">
                    {firstInningsBattingName}
                  </span>
                </div>
                <div className="text-right font-mono">
                  <span className="text-xl font-black text-primary">
                    {firstInningsRuns}/{firstInningsWickets}
                  </span>
                  <span className="text-[10px] font-bold text-text-muted block">
                    ({firstInningsOvers} ov • CRR {firstInningsCrr})
                  </span>
                </div>
              </div>

              {/* Target Highlight */}
              <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">Target for {secondInningsBattingName}</span>
                <span className="text-base font-black text-primary font-mono">{targetRuns} runs</span>
              </div>

              {/* Key Highlights */}
              <div className="space-y-1.5 text-[11px]">
                {topBatterInnings1 && (
                  <div className="flex justify-between items-center text-text-secondary">
                    <span className="truncate pr-1">🏏 Top Batter: <strong className="text-foreground">{topBatterInnings1.player.name}</strong></span>
                    <span className="font-mono font-bold text-foreground shrink-0">{topBatterInnings1.runs} ({topBatterInnings1.balls}b)</span>
                  </div>
                )}
                {topBowlerInnings1 && (
                  <div className="flex justify-between items-center text-text-secondary">
                    <span className="truncate pr-1">🎯 Best Bowler: <strong className="text-foreground">{topBowlerInnings1.player.name}</strong></span>
                    <span className="font-mono font-bold text-foreground shrink-0">{topBowlerInnings1.wickets}/{topBowlerInnings1.runs}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Target Formula Subtitle */}
            <p className="text-xs font-bold text-text-muted">
              {secondInningsBattingName} needs <span className="text-primary font-black">{targetRuns} runs</span> in {config.totalOvers} overs ({((targetRuns / (config.totalOvers * 6)) * 6).toFixed(2)} RRR) to win.
            </p>

            {/* Start 2nd Innings Action Button */}
            <button
              onClick={() => store.startSecondInnings()}
              className="w-full py-3.5 px-4 rounded-2xl bg-primary text-black font-black text-xs uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
            >
              <span>Start 2nd Innings</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          2. UMPIRE BREAK / STRATEGIC TIMEOUT MODAL
         ══════════════════════════════════════════════════════════════════════ */}
      {isUmpireBreak && !isMatchOver && !isInningsBreak && (
        <div className="fixed inset-0 z-[55] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-card border-2 border-amber-500/40 p-6 rounded-3xl max-w-sm w-full shadow-2xl space-y-4 text-center animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center mx-auto shadow-lg animate-pulse">
              <Coffee className="w-7 h-7" />
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">
                Match Paused
              </span>
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight mt-0.5">
                Drinks & Umpire Break
              </h2>
            </div>

            {/* Timer HUD */}
            <div className="p-3 bg-surface rounded-2xl border border-border inline-flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold text-text-muted">Break Duration:</span>
              <span className="text-sm font-black font-mono text-foreground">{formatBreakTime(breakTimer)}</span>
            </div>

            {/* Current Match Snapshot */}
            <div className="bg-surface border border-border p-3.5 rounded-2xl text-left text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-foreground">Innings {innings}: {battingTeamName}</span>
                <span className="font-mono font-black text-primary">{scoreStr}</span>
              </div>
              <div className="flex justify-between items-center text-text-muted">
                <span>Overs Bowled: {overStr} / {config.totalOvers}.0</span>
                <span>CRR: {crr}</span>
              </div>
            </div>

            {/* Resume Button */}
            <button
              onClick={() => store.toggleUmpireBreak(false)}
              className="w-full py-3.5 rounded-2xl bg-amber-500 text-black font-black text-xs uppercase tracking-wider hover:bg-amber-400 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Resume Match</span>
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          3. REDESIGNED STYLISH MATCH RESULT / WINNING CARD (Innings-wise breakdown)
         ══════════════════════════════════════════════════════════════════════ */}
      {isMatchOver && (
        <div className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-[#10141f] border-2 border-emerald-500/30 p-5 sm:p-6 rounded-3xl flex flex-col items-center max-w-md w-full shadow-[0_25px_60px_rgba(0,0,0,0.8)] space-y-4 text-center animate-in zoom-in-95 relative overflow-hidden">
            {/* Top Glowing Ambient Accents */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-emerald-500/10 blur-3xl pointer-events-none rounded-full" />

            {/* Trophy & Result Badge */}
            <div className="relative">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.3)]">
                <Trophy className="w-8 h-8" />
              </div>
              <div className="absolute -top-1 -right-1 p-1 bg-amber-500 rounded-full text-black">
                <Sparkles className="w-3 h-3 fill-current" />
              </div>
            </div>

            <div>
              <span className="px-3 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-widest inline-block mb-1.5">
                Match Result
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {winner === 'TIE' ? 'Match Tied!' : winReason || 'Match Completed'}
              </h2>
            </div>

            {/* Innings-wise Detailed Cards */}
            <div className="w-full space-y-2.5 text-left">
              {/* 1st Innings Detailed Summary */}
              <div className="bg-[#171c2b] border border-border/60 p-3.5 rounded-2xl relative">
                <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-white/10 text-white/70 text-[9px] font-black uppercase tracking-wider">
                      1st Inn
                    </span>
                    <span className="font-black text-white text-sm truncate">
                      {firstInningsBattingName}
                    </span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-base font-black text-white">
                      {firstInningsRuns}/{firstInningsWickets}
                    </span>
                    <span className="text-[10px] text-white/50 block font-normal">
                      ({firstInningsOvers} ov)
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-white/70">
                  <div className="truncate">
                    <span className="text-[9px] uppercase tracking-wider text-white/40 block">Top Batter</span>
                    <span className="font-bold text-white truncate block">
                      {topBatterInnings1 ? `${topBatterInnings1.player.name} ${topBatterInnings1.runs}(${topBatterInnings1.balls})` : '—'}
                    </span>
                  </div>
                  <div className="truncate text-right">
                    <span className="text-[9px] uppercase tracking-wider text-white/40 block">Top Bowler</span>
                    <span className="font-bold text-white truncate block">
                      {topBowlerInnings1 ? `${topBowlerInnings1.player.name} ${topBowlerInnings1.wickets}/${topBowlerInnings1.runs}` : '—'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 2nd Innings Detailed Summary */}
              <div className="bg-[#171c2b] border border-border/60 p-3.5 rounded-2xl relative">
                <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-wider">
                      2nd Inn
                    </span>
                    <span className="font-black text-white text-sm truncate">
                      {secondInningsBattingName}
                    </span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-base font-black text-emerald-400">
                      {secondInningsRuns}/{secondInningsWickets}
                    </span>
                    <span className="text-[10px] text-white/50 block font-normal">
                      ({secondInningsOvers} ov)
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-white/70">
                  <div className="truncate">
                    <span className="text-[9px] uppercase tracking-wider text-white/40 block">Top Batter</span>
                    <span className="font-bold text-white truncate block">
                      {topBatterInnings2 ? `${topBatterInnings2.player.name} ${topBatterInnings2.runs}(${topBatterInnings2.balls})` : '—'}
                    </span>
                  </div>
                  <div className="truncate text-right">
                    <span className="text-[9px] uppercase tracking-wider text-white/40 block">Top Bowler</span>
                    <span className="font-bold text-white truncate block">
                      {topBowlerInnings2 ? `${topBowlerInnings2.player.name} ${topBowlerInnings2.wickets}/${topBowlerInnings2.runs}` : '—'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2.5 w-full pt-2">
              <button
                onClick={() => router.push('/practice')}
                className="w-full py-3.5 rounded-2xl bg-emerald-500 text-black text-xs font-black uppercase tracking-wider hover:bg-emerald-400 shadow-lg shadow-emerald-500/25 transition active:scale-95 flex items-center justify-center gap-2"
              >
                <span>Return to Device Vault</span>
              </button>
              <button
                onClick={() => store.resetMatch()}
                className="w-full py-3 rounded-2xl bg-[#1e2436] hover:bg-[#252c42] text-white text-xs font-bold border border-white/10 transition active:scale-95 flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Start Rematch</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Theme Modal */}
      <ThemeModal open={isThemeModalOpen} onClose={() => setIsThemeModalOpen(false)} />
    </div>
  );
}
