'use client';

import { useFootballStore, Team } from '@/lib/store/useFootballStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { Trophy, Clock, Users, Camera, Cast, Activity, Target, Flag, AlertTriangle, AlertCircle, PlayCircle, PauseCircle } from 'lucide-react';
import Link from 'next/link';

import RosterModal from '../components/RosterModal';
import FootballGoalModal from '../components/FootballGoalModal';
import FootballCardModal from '../components/FootballCardModal';
import FootballSubModal from '../components/FootballSubModal';

export default function FootballScoringBoard() {
  const router = useRouter();
  const store = useFootballStore();
  
  const [isRosterOpen, setIsRosterOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<'goal' | 'card' | 'sub' | null>(null);

  // Timer logic
  const [displaySeconds, setDisplaySeconds] = useState(0);
  const [suggestedStoppage, setSuggestedStoppage] = useState(0);
  const [isVarReview, setIsVarReview] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    const updateTimer = () => {
      if (!store.matchStartTime) {
        setDisplaySeconds(store.elapsedSecondsAtStart);
        return;
      }

      const now = Date.now();
      let activeElapsed = 0;
      let totalPausedMs = 0;
      
      // Calculate active time
      let lastStart = store.matchStartTime;
      store.pausePeriods.forEach(p => {
        if (p.end) {
          activeElapsed += (p.start - lastStart);
          totalPausedMs += (p.end - p.start);
          lastStart = p.end;
        } else {
          activeElapsed += (p.start - lastStart);
          totalPausedMs += (now - p.start);
        }
      });
      
      if (store.isTimerRunning) {
        activeElapsed += (now - lastStart);
      }
      
      const newElapsedSecs = store.elapsedSecondsAtStart + Math.floor(activeElapsed / 1000);
      setDisplaySeconds(newElapsedSecs);
      
      // Calculate stoppage suggestion in minutes
      setSuggestedStoppage(Math.round(totalPausedMs / 60000));
    };

    updateTimer(); // Initial call
    
    if (store.isTimerRunning || store.pausePeriods.some(p => !p.end)) {
      interval = setInterval(updateTimer, 1000);
    }
    
    return () => clearInterval(interval);
  }, [store.matchStartTime, store.isTimerRunning, store.pausePeriods, store.elapsedSecondsAtStart]);

  if (!store.config) {
    return (
      <div className="flex flex-col items-center justify-center h-[100dvh] bg-background text-foreground p-6 text-center">
        <h1 className="text-3xl font-bold mb-4">No Match Active</h1>
        <p className="text-foreground/60 mb-8">Please configure a match first.</p>
        <Link href="/match-setup" className="bg-red-500 text-white font-bold py-3 px-8 rounded-xl hover:opacity-90 transition-transform">
          Setup Match
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
      case 1: return '1st half';
      case 2: return '2nd half';
      case 3: return 'ET 1st half';
      case 4: return 'ET 2nd half';
      default: return 'Half';
    }
  };

  const handleCopyOBSUrl = () => {
    if (!store.config) return;
    const url = `${window.location.origin}/overlay/${store.config.id}`;
    navigator.clipboard.writeText(url).then(() => {
      alert('OBS Overlay URL copied to clipboard!');
    });
  };

  const timeStr = formatTime(displaySeconds);

  return (
    <div className="flex flex-col h-[100dvh] bg-[#141414] text-white overflow-hidden font-sans select-none">
      
      {/* Header Info */}
      <header className="px-4 py-3 flex items-center justify-between border-b border-white/5 bg-[#1a1a1a] shrink-0">
        <div className="flex items-center gap-3">
          <div className="px-2 py-1 bg-red-500/20 text-red-500 rounded text-xs font-bold uppercase tracking-widest">
            live
          </div>
          <span className="text-sm font-bold text-white/70">
            {getHalfString(store.currentHalf)} • {store.config.playersPerTeam} v {store.config.playersPerTeam}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => window.open(`/stream/${store.config?.id}`, '_blank')} className="text-white/50 hover:text-white transition-colors"><Camera className="w-5 h-5" /></button>
          <button onClick={handleCopyOBSUrl} className="text-white/50 hover:text-white transition-colors"><Cast className="w-5 h-5" /></button>
          <button onClick={() => setIsRosterOpen(true)} className="text-white/50 hover:text-white transition-colors"><Users className="w-5 h-5" /></button>
        </div>
      </header>

      {/* Main Score Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-3xl mx-auto w-full">
        
        {/* Score Card */}
        <div className="bg-[#1e1e1e] rounded-2xl border border-white/5 p-6 flex flex-col items-center">
          <div className="flex items-center justify-between w-full mb-4">
            <div className="text-lg font-bold text-[#e87070] w-1/3 text-right truncate pr-4">{store.config.teamA}</div>
            <div className="flex items-center gap-4 text-5xl font-black tabular-nums">
              <span>{store.goalsA}</span>
              <span className="text-white/30">—</span>
              <span>{store.goalsB}</span>
            </div>
            <div className="text-lg font-bold text-white/70 w-1/3 text-left truncate pl-4">{store.config.teamB}</div>
          </div>
          
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl font-bold tabular-nums tracking-wider">{timeStr}</span>
            {suggestedStoppage > 0 && (
              <span className="text-xl font-bold text-[#e5a910]">+{suggestedStoppage}</span>
            )}
          </div>

          <div className="flex gap-3">
            {(!store.isTimerRunning && store.matchStartTime === null) ? (
              <button 
                onClick={store.startHalf}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-sm font-bold transition-colors"
              >
                <PlayCircle className="w-4 h-4" /> start half
              </button>
            ) : (
              <button 
                onClick={store.togglePause}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-sm font-bold transition-colors"
              >
                {store.isTimerRunning ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                {store.isTimerRunning ? 'pause clock' : 'resume clock'}
              </button>
            )}
            
            <button 
              onClick={store.endHalf}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-sm font-bold transition-colors"
            >
              end half
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          
          {/* Left Stats: Possession, Shots */}
          <div className="bg-[#1e1e1e] rounded-2xl border border-white/5 p-5 space-y-5">
            <div>
              <div className="text-xs text-white/50 font-bold mb-2">possession</div>
              <div className="flex items-center justify-between mb-2 text-sm font-bold">
                <span>{store.possessionA}%</span>
                <span>{store.possessionB}%</span>
              </div>
              <div className="h-2 flex rounded-full overflow-hidden bg-[#2d2d2d]">
                <div 
                  className="bg-[#e87070] h-full transition-all duration-500"
                  style={{ width: `${store.possessionA}%` }}
                />
              </div>
              <div className="flex justify-between mt-2">
                 <button onClick={() => store.setPossession(store.possessionA + 1)} className="text-xs text-white/30 hover:text-white px-2 py-1 bg-white/5 rounded">+</button>
                 <button onClick={() => store.setPossession(store.possessionA - 1)} className="text-xs text-white/30 hover:text-white px-2 py-1 bg-white/5 rounded">-</button>
              </div>
            </div>

            <div className="flex justify-between text-sm text-white/70">
              <span className="font-bold">shots {store.shotsA} ({store.shotsOnTargetA} on)</span>
              <span className="font-bold">{store.shotsB} ({store.shotsOnTargetB} on)</span>
            </div>
          </div>

          {/* Right Stats: Cards, Fouls, Corners */}
          <div className="bg-[#1e1e1e] rounded-2xl border border-white/5 p-5 flex flex-col justify-between">
            <div className="text-xs text-white/50 font-bold mb-3">cards / fouls</div>
            
            <div className="flex justify-between items-center mb-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-4 bg-[#e5a910] rounded-sm" />
                <span className="font-bold">{store.yellowCardsA}</span>
              </div>
              <span className="font-bold text-white/70">fouls {store.foulsA}</span>
            </div>

            <div className="flex justify-between items-center mb-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-4 bg-[#e5a910] rounded-sm flex items-center justify-center text-[8px] font-black text-black">2</div>
                <div className="w-3 h-4 bg-[#e54545] rounded-sm ml-1" />
                <span className="font-bold">{store.redCardsA}</span>
              </div>
              <span className="font-bold text-white/70">fouls {store.foulsB}</span>
            </div>

            <div className="flex justify-between text-sm text-white/50 font-bold pt-2 border-t border-white/5">
              <span>corners {store.cornersA}</span>
              <span>{store.cornersB}</span>
            </div>
          </div>
        </div>

        {/* Match Events */}
        <div className="text-xs text-white/40 font-bold uppercase tracking-widest mt-6 mb-2">
          match events
        </div>
        <div className="space-y-3 max-h-32 overflow-y-auto">
          {store.matchEvents.slice().reverse().map(ev => (
            <div key={ev.id} className="flex items-start gap-4 text-sm">
              <span className="text-white/50 w-12 shrink-0">{ev.timeStr}</span>
              
              {ev.type === 'Goal' && <Target className="w-4 h-4 text-blue-400 mt-0.5" />}
              {ev.type === 'Yellow' && <div className="w-3.5 h-4.5 bg-[#e5a910] rounded-sm shrink-0 mt-0.5" />}
              {ev.type === 'Red' && <div className="w-3.5 h-4.5 bg-[#e54545] rounded-sm shrink-0 mt-0.5" />}
              {ev.type === 'Half' && <Clock className="w-4 h-4 text-white/50 mt-0.5" />}
              {ev.type === 'Sub' && <Activity className="w-4 h-4 text-green-400 mt-0.5" />}
              {['Foul', 'Corner', 'Offside', 'Penalty', 'VAR'].includes(ev.type) && <AlertCircle className="w-4 h-4 text-white/50 mt-0.5" />}
              
              <span className="text-white/90">
                {ev.details}
              </span>
            </div>
          ))}
        </div>

        {/* Action Pad */}
        <div className="mt-auto pt-6">
          <div className="grid grid-cols-3 gap-3 mb-3">
            <button 
              onClick={() => setActiveModal('goal')}
              className="flex flex-col items-center justify-center gap-2 bg-[#1a2318] border border-[#2b4a24] text-[#4ea336] p-4 rounded-xl font-bold hover:bg-[#202d1d] transition-colors"
            >
              <Target className="w-5 h-5" /> goal
            </button>
            <button 
              onClick={() => setActiveModal('card')}
              className="flex flex-col items-center justify-center gap-2 bg-[#2a2215] border border-[#524122] text-[#e5a910] p-4 rounded-xl font-bold hover:bg-[#322818] transition-colors"
            >
               <div className="w-4 h-5 bg-[#e5a910] rounded-sm" /> card
            </button>
            <button 
              onClick={() => setActiveModal('sub')}
              className="flex flex-col items-center justify-center gap-2 bg-[#1c1c1c] border border-white/10 text-white p-4 rounded-xl font-bold hover:bg-white/5 transition-colors"
            >
              <Activity className="w-5 h-5" /> sub
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2 mb-3">
            <button onClick={() => {
               store.incrementStat('A', 'corners');
               store.addMatchEvent({ timeStr, team: 'A', type: 'Corner', details: 'Corner kick' });
            }} className="bg-[#1c1c1c] border border-white/5 text-white/70 py-3 rounded-lg text-xs font-bold hover:bg-white/5 transition-colors">corner</button>
            <button onClick={() => {
               store.incrementStat('A', 'fouls');
               store.addMatchEvent({ timeStr, team: 'A', type: 'Foul', details: 'Foul' });
            }} className="bg-[#1c1c1c] border border-white/5 text-white/70 py-3 rounded-lg text-xs font-bold hover:bg-white/5 transition-colors">foul</button>
            <button onClick={() => {
               store.addMatchEvent({ timeStr, team: 'A', type: 'Offside', details: 'Offside' });
            }} className="bg-[#1c1c1c] border border-white/5 text-white/70 py-3 rounded-lg text-xs font-bold hover:bg-white/5 transition-colors">offside</button>
            <button onClick={() => {
               store.addMatchEvent({ timeStr, team: 'A', type: 'Penalty', details: 'Penalty awarded' });
            }} className="bg-[#1c1c1c] border border-white/5 text-white/70 py-3 rounded-lg text-xs font-bold hover:bg-white/5 transition-colors">penalty</button>
          </div>

          <button 
            onClick={() => {
              setIsVarReview(!isVarReview);
              store.addMatchEvent({ timeStr, team: null, type: 'VAR', details: isVarReview ? 'VAR review completed' : 'VAR review started' });
              if (!isVarReview && store.isTimerRunning) store.togglePause();
            }}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold border transition-colors ${
              isVarReview ? 'bg-[#5a1c1f] border-[#e54545] text-white animate-pulse' : 'bg-[#1c1c1c] border-white/5 text-white/50 hover:text-white/90 hover:bg-white/5'
            }`}
          >
            <Camera className="w-4 h-4" /> VAR review
          </button>
        </div>

      </div>

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
      
      {activeModal === 'goal' && <FootballGoalModal onClose={() => setActiveModal(null)} timeStr={timeStr} />}
      {activeModal === 'card' && <FootballCardModal onClose={() => setActiveModal(null)} timeStr={timeStr} />}
      {activeModal === 'sub' && <FootballSubModal onClose={() => setActiveModal(null)} timeStr={timeStr} />}
      
    </div>
  );
}
