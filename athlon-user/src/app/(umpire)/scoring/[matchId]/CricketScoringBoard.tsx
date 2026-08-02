'use client';

import { useCricketStore } from '@/lib/store/useCricketStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Undo2, Users, Camera, Cast } from 'lucide-react';
import Link from 'next/link';
import RosterModal from '../components/RosterModal';
import WicketModal from '../components/WicketModal';
import LineupModal from '../components/LineupModal';
import BowlerSelectModal from '../components/BowlerSelectModal';

export default function CricketScoringBoard() {
  const router = useRouter();
  const store = useCricketStore();
  
  const [isRosterOpen, setIsRosterOpen] = useState(false);
  const [isWicketModalOpen, setIsWicketModalOpen] = useState(false);

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
    <div className="flex flex-col h-[100dvh] bg-[#18181b] text-white overflow-hidden font-sans select-none">
      
      {/* Top Bar */}
      <header className="px-4 py-3 flex items-center justify-between border-b border-white/5 bg-[#18181b] shrink-0">
        <div className="flex items-center gap-2">
          <div className="px-2 py-0.5 bg-red-900/40 text-red-500 rounded text-xs font-medium tracking-wide">
            live
          </div>
          <span className="text-xs font-medium text-gray-400">
            T{config.totalOvers} • {config.playersPerTeam} players • match
          </span>
        </div>
        <div className="flex items-center gap-4 text-gray-400">
          <button onClick={() => setIsRosterOpen(true)} className="hover:text-white transition-colors">
            <Users className="w-5 h-5" />
          </button>
          <button onClick={store.undoLastBall} className="hover:text-white transition-colors">
            <Undo2 className="w-5 h-5" />
          </button>
          <button onClick={() => window.open(`/stream/${store.config?.id}`, '_blank')} className="hover:text-white transition-colors">
            <Camera className="w-5 h-5" />
          </button>
          <button onClick={handleCopyOBSUrl} className="hover:text-white transition-colors">
            <Cast className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Score Area */}
      <div className="flex-1 flex flex-col p-4 overflow-y-auto">
        
        {/* Score Box */}
        <div className="bg-[#27272a] rounded-xl border border-white/5 p-4 flex flex-col items-center justify-center relative shadow-lg">
          <div className="text-xs text-gray-400 mb-1 font-medium">
            innings {isA ? '1' : '2'} • team {isA ? 'A' : 'B'} batting
          </div>
          <div className="flex items-center gap-4 my-2">
            <span className={isA ? "text-red-400 font-bold" : "text-gray-400 font-medium"}>team A</span>
            <div className="flex items-baseline gap-1">
              <span className="text-6xl font-bold tracking-tighter">{currentRuns}</span>
              <span className="text-6xl font-bold text-gray-400">/{currentWickets}</span>
            </div>
            <span className={!isA ? "text-red-400 font-bold" : "text-gray-400 font-medium"}>team B</span>
          </div>
          <div className="flex gap-6 text-sm font-medium text-gray-300 mt-2">
            <span>overs {currentOvers}.{currentOverBalls} / {config.totalOvers}.0</span>
            <span>crr {crr}</span>
            <span className={targetRuns ? "text-white" : "text-gray-500"}>
              target {targetRuns ? targetRuns : '—'}
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          {/* Batting Card */}
          <div className="bg-[#27272a] rounded-xl border border-white/5 p-4 shadow-lg flex flex-col justify-between">
            <div>
              <div className="text-[11px] text-gray-400 uppercase tracking-widest mb-3">batting</div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-white text-base">{striker?.name || '—'} <span className="text-gray-400 ml-1">*</span></span>
                <span className="font-bold text-white">{strikerStats?.runs || 0} <span className="text-gray-400 font-medium text-sm">({strikerStats?.balls || 0})</span></span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-300 text-sm">{nonStriker?.name || '—'}</span>
                <span className="font-medium text-gray-300 text-sm">{nonStrikerStats?.runs || 0} <span className="text-gray-500">({nonStrikerStats?.balls || 0})</span></span>
              </div>
            </div>
            <div className="text-xs text-gray-400 mt-4">
              partnership {partnership.runs} ({partnership.balls})
            </div>
          </div>

          {/* Bowling Card */}
          <div className="bg-[#27272a] rounded-xl border border-white/5 p-4 shadow-lg flex flex-col justify-between">
            <div>
              <div className="text-[11px] text-gray-400 uppercase tracking-widest mb-3">bowling</div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-white text-base truncate pr-2">{currentBowler?.name || '—'}</span>
                <span className="font-bold text-white tracking-wider tabular-nums shrink-0">
                  {bowlerSt ? `${Math.floor(bowlerSt.balls / 6)}.${bowlerSt.balls % 6}-${bowlerSt.maidens}-${bowlerSt.runs}-${bowlerSt.wickets}` : '0-0-0-0'}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                this over economy {bowlerSt && bowlerSt.balls > 0 ? ((bowlerSt.runs / bowlerSt.balls) * 6).toFixed(2) : '—'}
              </div>
            </div>
            <div className="text-[11px] text-gray-500 mt-4">
              extras {bowlerSt ? (bowlerSt.wides + bowlerSt.noBalls + bowlerSt.byes + bowlerSt.legByes) : 0} 
              <span className="ml-1">(wd {bowlerSt?.wides || 0}, nb {bowlerSt?.noBalls || 0}, b {bowlerSt?.byes || 0}, lb {bowlerSt?.legByes || 0})</span>
            </div>
          </div>
        </div>

        {/* This Over & Last Wicket */}
        <div className="flex items-center justify-between mt-6 px-2">
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-gray-400 uppercase tracking-widest">this over</span>
            <div className="flex gap-1.5 overflow-x-auto max-w-[200px] no-scrollbar">
              {currentOverHistory.map((b, i) => {
                let label = b.runs.toString();
                if (b.extra === 'WD') label = 'wd';
                if (b.extra === 'NB') label = 'nb';
                if (b.extra === 'B') label = 'b';
                if (b.extra === 'LB') label = 'lb';
                if (b.isWicket) label = 'w';
                if (b.runs === 0 && !b.extra && !b.isWicket) label = '·';
                
                return (
                  <div key={i} className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border border-white/10
                    ${b.isWicket ? 'bg-red-900/50 text-red-400' : 
                      b.runs === 4 || b.runs === 6 ? 'bg-green-900/50 text-green-400' : 'bg-[#27272a] text-gray-300'}`}>
                    {label}
                  </div>
                )
              })}
              {currentOverHistory.length === 0 && (
                <div className="w-6 h-6 rounded-full border border-white/10 bg-[#27272a] flex items-center justify-center text-gray-500 text-xs">·</div>
              )}
            </div>
          </div>
          <div className="text-[11px] text-gray-400 uppercase tracking-widest text-right truncate pl-4">
            last wicket {lastWicket ? `${lastWicket.batterId} ${lastWicket.scoreAtWicket}` : '—'}
          </div>
        </div>
      </div>

      {/* Control Pad */}
      <div className="p-4 bg-[#18181b] pb-8 shrink-0 relative z-20">
        <div className="grid grid-cols-4 gap-2.5 max-w-lg mx-auto">
          {/* Row 1 */}
          <button onClick={() => store.addRun(0)} disabled={isMatchOver} className="h-14 bg-[#27272a] border border-white/5 rounded-xl text-white font-bold text-xl hover:bg-white/10 active:scale-95 transition-all disabled:opacity-50">0</button>
          <button onClick={() => store.addRun(1)} disabled={isMatchOver} className="h-14 bg-[#27272a] border border-white/5 rounded-xl text-white font-bold text-xl hover:bg-white/10 active:scale-95 transition-all disabled:opacity-50">1</button>
          <button onClick={() => store.addRun(2)} disabled={isMatchOver} className="h-14 bg-[#27272a] border border-white/5 rounded-xl text-white font-bold text-xl hover:bg-white/10 active:scale-95 transition-all disabled:opacity-50">2</button>
          <button onClick={() => store.addRun(3)} disabled={isMatchOver} className="h-14 bg-[#27272a] border border-white/5 rounded-xl text-white font-bold text-xl hover:bg-white/10 active:scale-95 transition-all disabled:opacity-50">3</button>
          
          {/* Row 2 */}
          <button onClick={() => store.addRun(4)} disabled={isMatchOver} className="col-span-2 h-14 bg-[#142310]/50 border border-[#16a34a]/30 text-[#22c55e] rounded-xl text-xl font-bold hover:bg-[#142310] active:scale-95 transition-all disabled:opacity-50">4</button>
          <button onClick={() => store.addRun(6)} disabled={isMatchOver} className="col-span-2 h-14 bg-[#142310]/50 border border-[#16a34a]/30 text-[#22c55e] rounded-xl text-xl font-bold hover:bg-[#142310] active:scale-95 transition-all disabled:opacity-50">6</button>

          {/* Row 3 (Extras) */}
          <button onClick={() => store.addExtra(0, 'WD')} disabled={isMatchOver} className="h-14 bg-[#422006]/30 border border-[#d97706]/30 text-[#f59e0b] rounded-xl text-sm font-bold hover:bg-[#422006]/50 active:scale-95 transition-all disabled:opacity-50">wd</button>
          <button onClick={() => store.addExtra(0, 'NB')} disabled={isMatchOver} className="h-14 bg-[#422006]/30 border border-[#d97706]/30 text-[#f59e0b] rounded-xl text-sm font-bold hover:bg-[#422006]/50 active:scale-95 transition-all disabled:opacity-50">nb</button>
          <button onClick={() => store.addExtra(1, 'B')} disabled={isMatchOver} className="h-14 bg-[#422006]/30 border border-[#d97706]/30 text-[#f59e0b] rounded-xl text-sm font-bold hover:bg-[#422006]/50 active:scale-95 transition-all disabled:opacity-50">bye</button>
          <button onClick={() => store.addExtra(1, 'LB')} disabled={isMatchOver} className="h-14 bg-[#422006]/30 border border-[#d97706]/30 text-[#f59e0b] rounded-xl text-sm font-bold hover:bg-[#422006]/50 active:scale-95 transition-all disabled:opacity-50">lb</button>

          {/* Row 4 */}
          <button onClick={() => store.swapStrike()} disabled={isMatchOver || (!strikerId || !nonStrikerId)} className="col-span-2 h-14 bg-[#27272a] border border-white/5 text-gray-300 rounded-xl text-sm font-bold hover:bg-white/10 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            ⇋ swap strike
          </button>
          <button onClick={() => setIsWicketModalOpen(true)} disabled={isMatchOver} className="col-span-2 h-14 bg-[#450a0a]/50 border border-[#ef4444]/30 text-[#ef4444] rounded-xl text-sm font-bold hover:bg-[#450a0a] active:scale-95 transition-all disabled:opacity-50">
            out
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
    </div>
  );
}
