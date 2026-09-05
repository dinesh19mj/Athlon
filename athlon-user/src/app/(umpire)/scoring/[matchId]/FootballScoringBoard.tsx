'use client';

import { useFootballStore, Team } from '@/lib/store/useFootballStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { Trophy, Clock, Users, Camera, Cast, Activity, Target, Flag, AlertTriangle, AlertCircle, PlayCircle, PauseCircle, Palette } from 'lucide-react';
import Link from 'next/link';

import RosterModal from '../components/RosterModal';
import FootballGoalModal from '../components/FootballGoalModal';
import FootballCardModal from '../components/FootballCardModal';
import FootballSubModal from '../components/FootballSubModal';
import { ThemeModal } from '@/components/theme/ThemeModal';

export default function FootballScoringBoard() {
  const router = useRouter();
  const store = useFootballStore();
  
  const [isRosterOpen, setIsRosterOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<'goal' | 'card' | 'sub' | null>(null);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

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
    <div className="flex flex-col h-[100dvh] bg-background text-foreground overflow-hidden font-sans select-none">
      
      {/* Header Info */}
      <header className="px-4 py-3 flex items-center justify-between border-b border-foreground/10 bg-surface/90 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="px-2 py-0.5 bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 rounded-md text-xs font-black uppercase tracking-wider">
            live
          </div>
          <span className="text-xs font-bold text-foreground/50">
            {getHalfString(store.currentHalf)} • {store.config.playersPerTeam}v{store.config.playersPerTeam}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsThemeModalOpen(true)} title="Choose Theme" className="p-2 rounded-xl text-primary hover:bg-foreground/5 transition-colors"><Palette className="w-5 h-5" /></button>
          <button onClick={() => setIsRosterOpen(true)} className="p-2 rounded-xl text-foreground/70 hover:text-foreground hover:bg-foreground/5 transition-colors"><Users className="w-5 h-5" /></button>
        </div>
      </header>

      {/* Main Score Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-3xl mx-auto w-full">
        
        {/* Score Card */}
        <div className="bg-surface rounded-2xl border border-foreground/10 p-6 flex flex-col items-center shadow-sm">
          <div className="flex items-center justify-between w-full mb-4">
            <div className="text-lg font-black text-primary w-1/3 text-right truncate pr-4">{store.config.teamA}</div>
            <div className="flex items-center gap-4 text-5xl font-black tabular-nums text-foreground">
              <span>{store.goalsA}</span>
              <span className="text-foreground/20">—</span>
              <span>{store.goalsB}</span>
            </div>
            <div className="text-lg font-black text-foreground/70 w-1/3 text-left truncate pl-4">{store.config.teamB}</div>
          </div>
          
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl font-black tabular-nums tracking-wider text-foreground font-mono">{timeStr}</span>
            {suggestedStoppage > 0 && (
              <span className="text-lg font-bold text-amber-500 font-mono">+{suggestedStoppage}</span>
            )}
          </div>

          <div className="flex gap-3">
            {(!store.isTimerRunning && store.matchStartTime === null) ? (
              <button 
                onClick={store.startHalf}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-black uppercase tracking-wider transition-colors active:scale-95"
              >
                <PlayCircle className="w-4 h-4" /> Start Half
              </button>
            ) : (
              <button 
                onClick={store.togglePause}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-foreground/10 bg-surface hover:bg-foreground/5 text-foreground text-xs font-black uppercase tracking-wider transition-colors active:scale-95"
              >
                {store.isTimerRunning ? <PauseCircle className="w-4 h-4 text-amber-500" /> : <PlayCircle className="w-4 h-4 text-emerald-500" />}
                {store.isTimerRunning ? 'Pause Clock' : 'Resume Clock'}
              </button>
            )}
            
            <button 
              onClick={store.endHalf}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-black uppercase tracking-wider transition-colors active:scale-95"
            >
              End Half
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          
          {/* Left Stats: Possession, Shots */}
          <div className="bg-surface rounded-2xl border border-foreground/10 p-4 space-y-4 shadow-sm">
            <div>
              <div className="text-[10px] text-foreground/45 font-black uppercase tracking-wider mb-2">Possession</div>
              <div className="flex items-center justify-between mb-2 text-xs font-black">
                <span className="text-primary">{store.possessionA}%</span>
                <span className="text-foreground/70">{store.possessionB}%</span>
              </div>
              <div className="h-2 flex rounded-full overflow-hidden bg-foreground/10">
                <div 
                  className="bg-primary h-full transition-all duration-500"
                  style={{ width: `${store.possessionA}%` }}
                />
              </div>
              <div className="flex justify-between mt-2">
                 <button onClick={() => store.setPossession(store.possessionA + 1)} className="text-xs text-foreground/60 hover:text-foreground px-2 py-1 bg-foreground/5 rounded-lg font-bold">+</button>
                 <button onClick={() => store.setPossession(store.possessionA - 1)} className="text-xs text-foreground/60 hover:text-foreground px-2 py-1 bg-foreground/5 rounded-lg font-bold">-</button>
              </div>
            </div>

            <div className="flex justify-between text-xs text-foreground/70 pt-2 border-t border-foreground/5">
              <span className="font-bold">Shots {store.shotsA} ({store.shotsOnTargetA} on)</span>
              <span className="font-bold">{store.shotsB} ({store.shotsOnTargetB} on)</span>
            </div>
          </div>

          {/* Right Stats: Cards, Fouls, Corners */}
          <div className="bg-surface rounded-2xl border border-foreground/10 p-4 flex flex-col justify-between shadow-sm">
            <div className="text-[10px] text-foreground/45 font-black uppercase tracking-wider mb-2">Cards / Fouls</div>
            
            <div className="flex justify-between items-center mb-2 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-4 bg-amber-500 rounded-sm" />
                <span className="font-bold text-foreground">{store.yellowCardsA}</span>
              </div>
              <span className="font-bold text-foreground/60">Fouls {store.foulsA}</span>
            </div>

            <div className="flex justify-between items-center mb-2 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-4 bg-rose-500 rounded-sm" />
                <span className="font-bold text-foreground">{store.redCardsA}</span>
              </div>
              <span className="font-bold text-foreground/60">Fouls {store.foulsB}</span>
            </div>

            <div className="flex justify-between text-xs text-foreground/50 font-bold pt-2 border-t border-foreground/5">
              <span>Corners {store.cornersA}</span>
              <span>{store.cornersB}</span>
            </div>
          </div>
        </div>

        {/* Action Pad */}
        <div className="mt-auto pt-4">
          <div className="grid grid-cols-3 gap-2.5 mb-2.5">
            <button 
              onClick={() => setActiveModal('goal')}
              className="flex flex-col items-center justify-center gap-1.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 p-3.5 rounded-2xl font-black uppercase text-xs hover:bg-emerald-500/25 active:scale-95 transition-all shadow-sm"
            >
              <Target className="w-5 h-5" /> Goal
            </button>
            <button 
              onClick={() => setActiveModal('card')}
              className="flex flex-col items-center justify-center gap-1.5 bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 p-3.5 rounded-2xl font-black uppercase text-xs hover:bg-amber-500/25 active:scale-95 transition-all shadow-sm"
            >
               <div className="w-4 h-5 bg-amber-500 rounded-sm" /> Card
            </button>
            <button 
              onClick={() => setActiveModal('sub')}
              className="flex flex-col items-center justify-center gap-1.5 bg-surface border border-foreground/10 text-foreground p-3.5 rounded-2xl font-black uppercase text-xs hover:bg-foreground/5 active:scale-95 transition-all shadow-sm"
            >
              <Activity className="w-5 h-5 text-primary" /> Sub
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2 mb-2.5">
            <button onClick={() => {
               store.incrementStat('A', 'corners');
               store.addMatchEvent({ timeStr, team: 'A', type: 'Corner', details: 'Corner kick' });
            }} className="bg-surface border border-foreground/10 text-foreground/80 py-2.5 rounded-xl text-xs font-bold hover:bg-foreground/5 active:scale-95 transition-colors">Corner</button>
            <button onClick={() => {
               store.incrementStat('A', 'fouls');
               store.addMatchEvent({ timeStr, team: 'A', type: 'Foul', details: 'Foul' });
            }} className="bg-surface border border-foreground/10 text-foreground/80 py-2.5 rounded-xl text-xs font-bold hover:bg-foreground/5 active:scale-95 transition-colors">Foul</button>
            <button onClick={() => {
               store.addMatchEvent({ timeStr, team: 'A', type: 'Offside', details: 'Offside' });
            }} className="bg-surface border border-foreground/10 text-foreground/80 py-2.5 rounded-xl text-xs font-bold hover:bg-foreground/5 active:scale-95 transition-colors">Offside</button>
            <button onClick={() => {
               store.addMatchEvent({ timeStr, team: 'A', type: 'Penalty', details: 'Penalty awarded' });
            }} className="bg-surface border border-foreground/10 text-foreground/80 py-2.5 rounded-xl text-xs font-bold hover:bg-foreground/5 active:scale-95 transition-colors">Penalty</button>
          </div>

          <button 
            onClick={() => {
              setIsVarReview(!isVarReview);
              store.addMatchEvent({ timeStr, team: null, type: 'VAR', details: isVarReview ? 'VAR review completed' : 'VAR review started' });
              if (!isVarReview && store.isTimerRunning) store.togglePause();
            }}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-wider border transition-colors ${
              isVarReview ? 'bg-rose-500/20 border-rose-500 text-rose-600 dark:text-rose-400 animate-pulse' : 'bg-surface border-foreground/10 text-foreground/60 hover:text-foreground hover:bg-foreground/5'
            }`}
          >
            <Camera className="w-4 h-4" /> VAR Review
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
      
      {/* Theme Modal */}
      <ThemeModal open={isThemeModalOpen} onClose={() => setIsThemeModalOpen(false)} />
    </div>
  );
}
