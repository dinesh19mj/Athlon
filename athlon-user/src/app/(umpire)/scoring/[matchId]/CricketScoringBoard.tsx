'use client';

import { useCricketStore } from '@/lib/store/useCricketStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Undo2, Users, Palette } from 'lucide-react';
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

  if (!store.config) {
    return (
      <div className="flex flex-col items-center justify-center h-[100dvh] bg-[#18181b] text-white p-6 text-center">
        <h1 className="text-3xl font-bold mb-4">No Match Active</h1>
        <p className="text-gray-400 mb-8">Please configure a match first.</p>
        <Link href="/umpire/setup" className="bg-[#ef4444] text-white font-bold py-3 px-8 rounded-xl hover:bg-red-600 transition-colors">
          Setup Match
        </Link>
      </div>
    );
  }

  const {
    config, runsA, wicketsA, validBallsA, runsB, wicketsB, validBallsB, 
    currentInnings, currentOverHistory, isMatchOver, playersA, playersB,
    strikerId, nonStrikerId, currentBowlerId, batterStats, bowlerStats, partnership, lastWicket
  } = store;

  const isA = currentInnings === 'A';
  const currentRuns = isA ? runsA : runsB;
  const currentWickets = isA ? wicketsA : wicketsB;
  const currentBalls = isA ? validBallsA : validBallsB;
  const currentOvers = Math.floor(currentBalls / 6);
  const currentOverBalls = currentBalls % 6;
  const crr = (currentRuns / (currentBalls / 6) || 0).toFixed(2);

  const targetRuns = isA ? null : runsA + 1;
  const targetBalls = isA ? null : (config.totalOvers * 6) - validBallsB;
  const rrr = !isA && targetRuns ? ((targetRuns - currentRuns) / (targetBalls! / 6) || 0).toFixed(2) : "—";

  const battingTeamPlayers = isA ? playersA : playersB;
  const bowlingTeamPlayers = isA ? playersB : playersA;

  const striker = battingTeamPlayers.find(p => p.id === strikerId);
  const nonStriker = battingTeamPlayers.find(p => p.id === nonStrikerId);
  const currentBowler = bowlingTeamPlayers.find(p => p.id === currentBowlerId);

  const strikerStats = strikerId ? batterStats[strikerId] || { runs: 0, balls: 0 } : null;
  const nonStrikerStats = nonStrikerId ? batterStats[nonStrikerId] || { runs: 0, balls: 0 } : null;
  const bowlerSt = currentBowlerId ? bowlerStats[currentBowlerId] || { balls: 0, maidens: 0, runs: 0, wickets: 0, wides: 0, noBalls: 0, byes: 0, legByes: 0 } : null;

  // Determine which auto-modal to show
  const needsLineup = Boolean(!isMatchOver && !strikerId && !nonStrikerId);
  const needsBowler = Boolean(!isMatchOver && strikerId && !currentBowlerId && !needsLineup);

  const handleCopyOBSUrl = () => {
    if (!config) return;
    const url = `${window.location.origin}/overlay/${config.id}`;
    navigator.clipboard.writeText(url).then(() => {
      alert('OBS Overlay URL copied to clipboard!\\n\\nPaste this into a Browser Source in OBS:\\n' + url);
    }).catch(err => {
      alert('Failed to copy: ' + url);
    });
  };

  const getAlreadyBattedIds = () => {
    // Players who have stats but are not current strikers
    return battingTeamPlayers.filter(p => batterStats[p.id] !== undefined).map(p => p.id);
  };

  // derived strings for the wicket modal
  const scoreStr = `${currentRuns}/${currentWickets}`;
  const overStr = `${currentOvers}.${currentOverBalls}`;

  return (
    <div className="flex flex-col h-[100dvh] bg-background text-foreground overflow-hidden font-sans select-none">
      
      {/* Top Bar */}
      <header className="px-4 py-3 flex items-center justify-between border-b border-foreground/10 bg-surface/90 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2">
          <div className="px-2 py-0.5 bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 rounded-md text-xs font-black uppercase tracking-wide">
            live
          </div>
          <span className="text-xs font-bold text-foreground/50">
            T{config.totalOvers} • {config.playersPerTeam}v{config.playersPerTeam}
          </span>
        </div>
        <div className="flex items-center gap-2 text-foreground/70">
          <button onClick={() => setIsThemeModalOpen(true)} title="Choose Theme" className="p-2 rounded-xl hover:bg-foreground/5 text-primary transition-colors">
            <Palette className="w-5 h-5" />
          </button>
          <button onClick={() => setIsRosterOpen(true)} className="p-2 rounded-xl hover:bg-foreground/5 text-foreground/70 hover:text-foreground transition-colors">
            <Users className="w-5 h-5" />
          </button>
          <button onClick={store.undoLastBall} className="p-2 rounded-xl hover:bg-foreground/5 text-foreground/70 hover:text-foreground transition-colors">
            <Undo2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Score Area */}
      <div className="flex-1 flex flex-col p-4 overflow-y-auto">
        
        {/* Score Box */}
        <div className="bg-surface rounded-2xl border border-foreground/10 p-5 flex flex-col items-center justify-center relative shadow-sm">
          <div className="text-xs text-foreground/50 mb-1 font-bold uppercase tracking-wider">
            Innings {isA ? '1' : '2'} • {isA ? config.teamA : config.teamB} Batting
          </div>
          <div className="flex items-center gap-4 my-2">
            <span className={isA ? "text-primary font-black text-sm uppercase" : "text-foreground/40 font-bold text-sm uppercase"}>{config.teamA}</span>
            <div className="flex items-baseline gap-1">
              <span className="text-6xl font-black tracking-tighter text-foreground">{currentRuns}</span>
              <span className="text-5xl font-black text-foreground/40">/{currentWickets}</span>
            </div>
            <span className={!isA ? "text-primary font-black text-sm uppercase" : "text-foreground/40 font-bold text-sm uppercase"}>{config.teamB}</span>
          </div>
          <div className="flex gap-6 text-xs font-bold text-foreground/60 mt-2">
            <span>Overs {currentOvers}.{currentOverBalls} / {config.totalOvers}.0</span>
            <span>CRR {crr}</span>
            <span className={targetRuns ? "text-foreground font-black" : "text-foreground/40"}>
              Target {targetRuns ? targetRuns : '—'}
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 mt-3">
          {/* Batting Card */}
          <div className="bg-surface rounded-2xl border border-foreground/10 p-4 shadow-sm flex flex-col justify-between">
            <div>
              <div className="text-[10px] text-foreground/45 font-black uppercase tracking-widest mb-2.5">Batting</div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-bold text-foreground text-sm truncate pr-1">{striker?.name || '—'} <span className="text-primary ml-0.5">*</span></span>
                <span className="font-black text-foreground font-mono text-sm shrink-0">{strikerStats?.runs || 0} <span className="text-foreground/40 text-xs font-normal">({strikerStats?.balls || 0})</span></span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-foreground/70 text-xs truncate pr-1">{nonStriker?.name || '—'}</span>
                <span className="font-bold text-foreground/70 font-mono text-xs shrink-0">{nonStrikerStats?.runs || 0} <span className="text-foreground/40 text-xs font-normal">({nonStrikerStats?.balls || 0})</span></span>
              </div>
            </div>
            <div className="text-[11px] font-bold text-foreground/50 mt-3 pt-2 border-t border-foreground/5">
              Partnership {partnership.runs} ({partnership.balls})
            </div>
          </div>

          {/* Bowling Card */}
          <div className="bg-surface rounded-2xl border border-foreground/10 p-4 shadow-sm flex flex-col justify-between">
            <div>
              <div className="text-[10px] text-foreground/45 font-black uppercase tracking-widest mb-2.5">Bowling</div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-foreground text-sm truncate pr-1">{currentBowler?.name || '—'}</span>
                <span className="font-black text-foreground font-mono text-xs tracking-wider tabular-nums shrink-0">
                  {bowlerSt ? `${Math.floor(bowlerSt.balls / 6)}.${bowlerSt.balls % 6}-${bowlerSt.maidens}-${bowlerSt.runs}-${bowlerSt.wickets}` : '0-0-0-0'}
                </span>
              </div>
              <div className="text-[11px] font-medium text-foreground/50 mt-1.5">
                Econ {bowlerSt && bowlerSt.balls > 0 ? ((bowlerSt.runs / bowlerSt.balls) * 6).toFixed(2) : '—'}
              </div>
            </div>
            <div className="text-[10.5px] text-foreground/45 mt-3 pt-2 border-t border-foreground/5 truncate">
              Extras {bowlerSt ? (bowlerSt.wides + bowlerSt.noBalls + bowlerSt.byes + bowlerSt.legByes) : 0} 
              <span className="ml-1">(wd {bowlerSt?.wides || 0}, nb {bowlerSt?.noBalls || 0})</span>
            </div>
          </div>
        </div>

        {/* This Over & Last Wicket */}
        <div className="flex items-center justify-between mt-4 px-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">This Over</span>
            <div className="flex gap-1.5 overflow-x-auto max-w-[200px] hide-scrollbar">
              {currentOverHistory.map((b, i) => {
                let label = b.runs.toString();
                if (b.extra === 'WD') label = 'wd';
                if (b.extra === 'NB') label = 'nb';
                if (b.extra === 'B') label = 'b';
                if (b.extra === 'LB') label = 'lb';
                if (b.isWicket) label = 'w';
                if (b.runs === 0 && !b.extra && !b.isWicket) label = '·';
                
                return (
                  <div key={i} className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border
                    ${b.isWicket ? 'bg-rose-500/15 border-rose-500/40 text-rose-600 dark:text-rose-400' : 
                      b.runs === 4 || b.runs === 6 ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400' : 'bg-surface border-foreground/10 text-foreground'}`}>
                    {label}
                  </div>
                )
              })}
              {currentOverHistory.length === 0 && (
                <div className="w-6 h-6 rounded-full border border-foreground/10 bg-surface flex items-center justify-center text-foreground/40 text-xs">·</div>
              )}
            </div>
          </div>
          <div className="text-[10.5px] font-bold text-foreground/40 uppercase tracking-widest text-right truncate pl-2">
            Last Wicket {lastWicket ? `${lastWicket.batterId} ${lastWicket.scoreAtWicket}` : '—'}
          </div>
        </div>
      </div>

      {/* Control Pad */}
      <div className="p-4 bg-surface/90 border-t border-foreground/10 pb-8 shrink-0 relative z-20 backdrop-blur-md">
        <div className="grid grid-cols-4 gap-2.5 max-w-lg mx-auto">
          {/* Row 1 */}
          <button onClick={() => store.addRun(0)} disabled={isMatchOver} className="h-13 bg-background border border-foreground/10 rounded-xl text-foreground font-black text-lg hover:bg-foreground/5 active:scale-95 transition-all disabled:opacity-30">0</button>
          <button onClick={() => store.addRun(1)} disabled={isMatchOver} className="h-13 bg-background border border-foreground/10 rounded-xl text-foreground font-black text-lg hover:bg-foreground/5 active:scale-95 transition-all disabled:opacity-30">1</button>
          <button onClick={() => store.addRun(2)} disabled={isMatchOver} className="h-13 bg-background border border-foreground/10 rounded-xl text-foreground font-black text-lg hover:bg-foreground/5 active:scale-95 transition-all disabled:opacity-30">2</button>
          <button onClick={() => store.addRun(3)} disabled={isMatchOver} className="h-13 bg-background border border-foreground/10 rounded-xl text-foreground font-black text-lg hover:bg-foreground/5 active:scale-95 transition-all disabled:opacity-30">3</button>
          
          {/* Row 2 */}
          <button onClick={() => store.addRun(4)} disabled={isMatchOver} className="col-span-2 h-13 bg-emerald-500/15 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 rounded-xl text-lg font-black hover:bg-emerald-500/25 active:scale-95 transition-all disabled:opacity-30">4</button>
          <button onClick={() => store.addRun(6)} disabled={isMatchOver} className="col-span-2 h-13 bg-emerald-500/15 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 rounded-xl text-lg font-black hover:bg-emerald-500/25 active:scale-95 transition-all disabled:opacity-30">6</button>

          {/* Row 3 (Extras) */}
          <button onClick={() => store.addExtra(0, 'WD')} disabled={isMatchOver} className="h-12 bg-amber-500/15 border border-amber-500/40 text-amber-600 dark:text-amber-400 rounded-xl text-xs font-black uppercase hover:bg-amber-500/25 active:scale-95 transition-all disabled:opacity-30">wd</button>
          <button onClick={() => store.addExtra(0, 'NB')} disabled={isMatchOver} className="h-12 bg-amber-500/15 border border-amber-500/40 text-amber-600 dark:text-amber-400 rounded-xl text-xs font-black uppercase hover:bg-amber-500/25 active:scale-95 transition-all disabled:opacity-30">nb</button>
          <button onClick={() => store.addExtra(1, 'B')} disabled={isMatchOver} className="h-12 bg-amber-500/15 border border-amber-500/40 text-amber-600 dark:text-amber-400 rounded-xl text-xs font-black uppercase hover:bg-amber-500/25 active:scale-95 transition-all disabled:opacity-30">bye</button>
          <button onClick={() => store.addExtra(1, 'LB')} disabled={isMatchOver} className="h-12 bg-amber-500/15 border border-amber-500/40 text-amber-600 dark:text-amber-400 rounded-xl text-xs font-black uppercase hover:bg-amber-500/25 active:scale-95 transition-all disabled:opacity-30">lb</button>

          {/* Row 4 */}
          <button onClick={() => store.swapStrike()} disabled={isMatchOver || (!strikerId || !nonStrikerId)} className="col-span-2 h-12 bg-background border border-foreground/10 text-foreground/80 rounded-xl text-xs font-black hover:bg-foreground/5 active:scale-95 transition-all disabled:opacity-30 flex items-center justify-center gap-1.5">
            ⇋ Swap Strike
          </button>
          <button onClick={() => setIsWicketModalOpen(true)} disabled={isMatchOver} className="col-span-2 h-12 bg-rose-500/15 border border-rose-500/40 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-black uppercase hover:bg-rose-500/25 active:scale-95 transition-all disabled:opacity-30">
            Wicket Out
          </button>
        </div>
      </div>

      {/* Modals */}
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
        batterName={striker?.name || 'Unknown'}
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

      {isMatchOver && (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center px-4 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[#18181b] border border-white/10 p-8 rounded-2xl flex flex-col items-center max-w-sm w-full">
            <h3 className="text-3xl font-black text-white uppercase tracking-widest">Match Over</h3>
            <p className="text-sm font-bold text-gray-400 mt-2">
              {runsA > runsB ? `${config.teamA} Wins!` : runsB > runsA ? `${config.teamB} Wins!` : 'Match Tied!'}
            </p>
            <button onClick={() => router.push('/')} className="mt-8 bg-white text-black text-sm font-bold w-full py-4 rounded-xl hover:bg-gray-200">
              Return to Home
            </button>
          </div>
        </div>
      )}

      {/* Theme Modal */}
      <ThemeModal open={isThemeModalOpen} onClose={() => setIsThemeModalOpen(false)} />
    </div>
  );
}
