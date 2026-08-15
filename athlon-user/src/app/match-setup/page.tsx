'use client';

import { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  MoreVertical,
  User,
  Users,
  ListOrdered,
  ClipboardList,
  Copy,
  Settings,
  ChevronDown,
  ChevronRight,
  Trophy,
  Activity,
} from 'lucide-react';
import { useMatchStore, GameCategory, Player } from '@/lib/store/useMatchStore';
import { useCricketStore } from '@/lib/store/useCricketStore';
import { useFootballStore } from '@/lib/store/useFootballStore';
import { useVolleyballStore } from '@/lib/store/useVolleyballStore';
import Image from 'next/image';

function MatchSetupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setupMatch = useMatchStore(state => state.setupMatch);

  const urlSport = searchParams.get('sport');
  const initialSport = urlSport || '';
  const urlCategory = searchParams.get('category');
  const initialCategory = urlCategory || 'Doubles';
  
  const initialTeamA = searchParams.get('teamA')?.split(',') || ['', ''];
  const initialTeamB = searchParams.get('teamB')?.split(',') || ['', ''];
  const initialTeamAName = searchParams.get('teamAName') || 'Team A';
  const initialTeamBName = searchParams.get('teamBName') || 'Team B';
  const isPreFilled = !!searchParams.get('teamA') || !!searchParams.get('teamB');

  const [activeTab, setActiveTab] = useState<'sport' | 'rules' | 'team1' | 'team2'>('sport');

  const [sport, setSport] = useState(initialSport);
  const [category, setCategory] = useState<GameCategory>(initialCategory as GameCategory);
  const [sets, setSets] = useState<number>(3);
  const [pointBreak, setPointBreak] = useState<number>(15);

  // Cricket specific config
  const [totalOvers, setTotalOvers] = useState<number>(10);
  const [playersPerTeam, setPlayersPerTeam] = useState<number>(11);
  const [tossWinner, setTossWinner] = useState<'A' | 'B'>('A');
  const [tossDecision, setTossDecision] = useState<'Batting' | 'Bowling'>('Batting');

  // Football specific config
  const [halfLengthMinutes, setHalfLengthMinutes] = useState<number>(45);
  const [footballPlayers, setFootballPlayers] = useState<number>(11);
  const [footballTossWinner, setFootballTossWinner] = useState<'A' | 'B'>('A');
  const [footballTossDecision, setFootballTossDecision] = useState<'Kickoff' | 'Side'>('Kickoff');

  // Volleyball specific config
  const [bestOfSets, setBestOfSets] = useState<3 | 5>(3);
  const [pointsPerSet, setPointsPerSet] = useState<number>(25);

  const [teamA, setTeamA] = useState<string[]>(initialTeamA);
  const [teamB, setTeamB] = useState<string[]>(initialTeamB);

  const [teamAPlayers, setTeamAPlayers] = useState<Player[]>([]);
  const [teamBPlayers, setTeamBPlayers] = useState<Player[]>([]);
  const [subsPerTeam, setSubsPerTeam] = useState<number>(3);

  useEffect(() => {
    let count = 0;
    if (sport === 'Cricket') count = playersPerTeam;
    else if (sport === 'Football') count = footballPlayers;
    else if (sport === 'Volleyball') count = 6;

    if (count > 0 && teamAPlayers.length !== count + subsPerTeam) {
      setTeamAPlayers(Array.from({ length: count + subsPerTeam }).map((_, i) => ({ id: `A-${Date.now()}-${i}`, name: '', position: '', jerseyNumber: '', onField: i < count })));
      setTeamBPlayers(Array.from({ length: count + subsPerTeam }).map((_, i) => ({ id: `B-${Date.now()}-${i}`, name: '', position: '', jerseyNumber: '', onField: i < count })));
    }
  }, [sport, playersPerTeam, footballPlayers, subsPerTeam]);

  const handlePlayerChange = (team: 'A' | 'B', index: number, field: 'name' | 'position' | 'jerseyNumber', value: string) => {
    if (team === 'A') {
      const newPlayers = [...teamAPlayers];
      newPlayers[index] = { ...newPlayers[index], [field]: value };
      setTeamAPlayers(newPlayers);
    } else {
      const newPlayers = [...teamBPlayers];
      newPlayers[index] = { ...newPlayers[index], [field]: value };
      setTeamBPlayers(newPlayers);
    }
  };

  const isDoubles = category?.includes('Doubles');

  const handleNext = () => {
    if (activeTab === 'sport') setActiveTab('rules');
    else if (activeTab === 'rules') setActiveTab('team1');
    else if (activeTab === 'team1') setActiveTab('team2');
    else handleStartMatch();
  };

  const handleStartMatch = () => {
    if (sport === 'Cricket') {
      const setupCricketMatch = useCricketStore.getState().setupMatch;
      setupCricketMatch({
        id: `match-${Date.now()}`,
        sport: 'Cricket',
        totalOvers,
        playersPerTeam,
        teamA: teamA[0] || 'Team A',
        teamB: teamB[0] || 'Team B',
        teamAPlayers,
        teamBPlayers,
        tossWinner,
        tossDecision,
      });
      router.push('/scoring/live?sport=Cricket');
      return;
    }

    if (sport === 'Football') {
      const setupFootballMatch = useFootballStore.getState().setupMatch;
      setupFootballMatch({
        id: `match-${Date.now()}`,
        sport: 'Football',
        halfLengthMinutes,
        playersPerTeam: footballPlayers,
        teamA: teamA[0] || 'Team A',
        teamB: teamB[0] || 'Team B',
        teamAPlayers,
        teamBPlayers,
        tossWinner: footballTossWinner,
        tossDecision: footballTossDecision as any,
      });
      router.push('/scoring/live?sport=Football');
      return;
    }

    if (sport === 'Volleyball') {
      const setupVolleyballMatch = useVolleyballStore.getState().setupMatch;
      setupVolleyballMatch({
        id: `match-${Date.now()}`,
        sport: 'Volleyball',
        bestOfSets,
        pointsPerSet,
        teamA: teamA[0] || 'Team A',
        teamB: teamB[0] || 'Team B',
        teamAPlayers,
        teamBPlayers,
      });
      router.push('/scoring/live?sport=Volleyball');
      return;
    }

    if (sport === 'Badminton') {
      const finalTeamA = isDoubles ? teamA : [teamA[0]];
      const finalTeamB = isDoubles ? teamB : [teamB[0]];

      if (!finalTeamA[0]) finalTeamA[0] = 'Player 1 (A)';
      if (isDoubles && !finalTeamA[1]) finalTeamA[1] = 'Player 2 (A)';
      if (!finalTeamB[0]) finalTeamB[0] = 'Player 1 (B)';
      if (isDoubles && !finalTeamB[1]) finalTeamB[1] = 'Player 2 (B)';

      setupMatch({
        id: searchParams.get('matchId') || `match-${Date.now()}`,
        category,
        bestOfSets: sets,
        pointBreak: pointBreak,
        teamA: finalTeamA,
        teamB: finalTeamB,
        teamAName: searchParams.get('teamAName') || undefined,
        teamBName: searchParams.get('teamBName') || undefined,
      });

      const categoryId = searchParams.get('categoryId');
      let url = '/scoring/live?sport=Badminton';
      if (searchParams.get('matchId')) {
          url = `/scoring/${searchParams.get('matchId')}?sport=Badminton${categoryId ? `&categoryId=${categoryId}` : ''}`;
      }
      router.push(url);
    }
  };

  const CustomSwitch = ({ checked, onChange }: { checked: boolean, onChange: (v: boolean) => void }) => (
    <div
      onClick={() => onChange(!checked)}
      className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors border border-foreground/5 shadow-inner ${checked ? 'bg-red-500/20 border-red-500/30' : 'bg-background'}`}
    >
      <div className={`w-4 h-4 rounded-full transition-transform shadow-lg ${checked ? 'translate-x-6 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]' : 'translate-x-0 bg-foreground/40'}`} />
    </div>
  );

  return (
    <div className="h-[100dvh] bg-background text-foreground font-sans flex flex-col relative overflow-hidden">

      {/* Ambient Red Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />

      {/* HEADER */}
      <header className="px-4 py-6 flex items-center justify-between shrink-0 relative z-10">
        <button onClick={() => router.back()} className="p-3 -ml-3 text-foreground/70 hover:text-foreground transition-colors bg-foreground/0 hover:bg-foreground/5 rounded-full">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex flex-col items-center">
          <h1 className="text-xl font-black uppercase tracking-widest text-foreground drop-shadow-md">Match Setup</h1>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Umpire Mode</span>
          </div>
        </div>
        <button className="p-3 -mr-3 text-foreground/70 hover:text-foreground transition-colors bg-foreground/0 hover:bg-foreground/5 rounded-full">
          <MoreVertical className="w-6 h-6" />
        </button>
      </header>

      {/* SEGMENTED TABS */}
      <div className="px-4 pb-6 shrink-0 relative z-10">
        <div className="flex bg-surface border border-foreground/5 p-1.5 rounded-2xl shadow-xl">
          <button
            onClick={() => setActiveTab('sport')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${activeTab === 'sport' ? 'bg-red-500 text-foreground shadow-[0_4px_20px_rgba(239,68,68,0.4)]' : 'text-foreground/40 hover:text-foreground hover:bg-foreground/5'}`}
          >
            Sport
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${activeTab === 'rules' ? 'bg-red-500 text-foreground shadow-[0_4px_20px_rgba(239,68,68,0.4)]' : 'text-foreground/40 hover:text-foreground hover:bg-foreground/5'}`}
          >
            Rules
          </button>
          <button
            onClick={() => setActiveTab('team1')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${activeTab === 'team1' ? 'bg-red-500 text-foreground shadow-[0_4px_20px_rgba(239,68,68,0.4)]' : 'text-foreground/40 hover:text-foreground hover:bg-foreground/5'}`}
          >
            {sport !== 'Badminton' ? 'Team 1' : isDoubles ? 'Team 1' : 'Player 1'}
          </button>
          <button
            onClick={() => setActiveTab('team2')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${activeTab === 'team2' ? 'bg-red-500 text-foreground shadow-[0_4px_20px_rgba(239,68,68,0.4)]' : 'text-foreground/40 hover:text-foreground hover:bg-foreground/5'}`}
          >
            {sport !== 'Badminton' ? 'Team 2' : isDoubles ? 'Team 2' : 'Player 2'}
          </button>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-y-auto px-4 pb-32 relative z-10 hide-scrollbar">

        {/* SPORT TAB */}
        {activeTab === 'sport' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Sport Selection */}
            <div className="space-y-3">
              <h2 className="text-[10px] font-black text-foreground/40 uppercase tracking-widest pl-2">Sport</h2>
              <div className="flex overflow-x-auto gap-4 sm:gap-6 pt-4 pb-4 -mx-4 px-4 hide-scrollbar snap-x snap-mandatory">
                {[
                  { name: 'Badminton', image: '/shuttle.png', shadow: 'shadow-cyan-500/20' },
                  { name: 'Football', image: '/football.png', shadow: 'shadow-emerald-500/20' },
                  { name: 'Cricket', image: '/cricket.png', shadow: 'shadow-orange-500/20' },
                  { name: 'Volleyball', image: '/volleyball.png', shadow: 'shadow-purple-500/20' }
                ].map((s) => (
                  <button
                    key={s.name}
                    onClick={() => {
                      if (urlSport) return;
                      setSport(s.name);
                      setActiveTab('rules');
                    }}
                    disabled={!!urlSport}
                    className={`flex flex-col items-center gap-3 outline-none group shrink-0 snap-center ${urlSport && urlSport !== s.name ? 'opacity-30 cursor-not-allowed' : ''}`}
                  >
                    <div className={`relative w-[68px] h-[68px] sm:w-[76px] sm:h-[76px] rounded-[18px] flex items-center justify-center transition-colors duration-200 shadow-sm bg-surface group-hover:bg-foreground/10 group-active:bg-foreground/15 border border-foreground/5 group-hover:border-foreground/20 group-active:border-foreground/30 ${sport === s.name ? 'ring-[1.5px] ring-foreground/20 bg-foreground/10' : ''}`}>
                      <div className="relative w-8 h-8 sm:w-10 sm:h-10">
                        <Image 
                          src={s.image} 
                          alt={s.name} 
                          fill 
                          className="object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.4)]"
                        />
                      </div>
                    </div>
                    <span className={`text-[10px] sm:text-[11px] font-black uppercase tracking-widest mt-0.5 transition-colors ${sport === s.name ? 'text-foreground' : 'text-foreground/40 group-hover:text-foreground/70'}`}>
                      {s.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* RULES TAB */}
        {activeTab === 'rules' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
            {sport === 'Badminton' ? (
              <>
                {/* Match Type (Singles vs Doubles) */}
                <div className="space-y-3">
                  <h2 className="text-[10px] font-black text-foreground/40 uppercase tracking-widest pl-2">Match Format</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => !urlCategory && setCategory('Singles')}
                      disabled={!!urlCategory}
                      className={`flex flex-col items-center justify-center gap-3 p-5 rounded-3xl border transition-all ${!isDoubles ? 'bg-surface border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.15)] scale-[1.02]' : 'bg-background border-foreground/5 hover:border-foreground/20 hover:bg-foreground/5'} ${urlCategory ? 'opacity-80 cursor-not-allowed' : ''}`}
                    >
                      <div className={`p-3 rounded-full ${!isDoubles ? 'bg-red-500/20 text-red-500' : 'bg-foreground/5 text-foreground/40'}`}>
                        <User className="w-6 h-6" />
                      </div>
                      <span className={`text-sm font-bold uppercase tracking-wide ${!isDoubles ? 'text-foreground' : 'text-foreground/40'}`}>Singles</span>
                    </button>
                    <button
                      onClick={() => !urlCategory && setCategory('Doubles')}
                      disabled={!!urlCategory}
                      className={`flex flex-col items-center justify-center gap-3 p-5 rounded-3xl border transition-all ${isDoubles ? 'bg-surface border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.15)] scale-[1.02]' : 'bg-background border-foreground/5 hover:border-foreground/20 hover:bg-foreground/5'} ${urlCategory ? 'opacity-80 cursor-not-allowed' : ''}`}
                    >
                      <div className={`p-3 rounded-full ${isDoubles ? 'bg-red-500/20 text-red-500' : 'bg-foreground/5 text-foreground/40'}`}>
                        <Users className="w-6 h-6" />
                      </div>
                      <span className={`text-sm font-bold uppercase tracking-wide ${isDoubles ? 'text-foreground' : 'text-foreground/40'}`}>Doubles</span>
                    </button>
                  </div>
                </div>

                {/* Rules & Configuration */}
                <div className="space-y-3">
                  <h2 className="text-[10px] font-black text-foreground/40 uppercase tracking-widest pl-2">Rules & Scoring</h2>

                  <div className="bg-surface border border-foreground/5 rounded-3xl overflow-hidden shadow-xl">

                    <div className="flex items-center justify-between p-5 border-b border-foreground/5 hover:bg-foreground/5 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-background rounded-xl border border-foreground/5">
                          <ListOrdered className="w-5 h-5 text-foreground/70" />
                        </div>
                        <span className="text-sm font-bold text-foreground/90">Max games (sets)</span>
                      </div>
                      <select
                        value={sets}
                        onChange={(e) => setSets(Number(e.target.value))}
                        className="bg-background border border-foreground/10 rounded-xl px-4 py-2 font-bold outline-none focus:ring-2 focus:ring-red-500/50"
                      >
                        {[1, 2, 3, 4, 5].map((i) => (
                          <option key={i} value={i}>{i}</option>
                        ))}
                      </select>
                    </div>

                    {/* Points Per Game */}
                    <div className="flex items-center justify-between p-5 hover:bg-foreground/5 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-background rounded-xl border border-foreground/5">
                          <Trophy className="w-5 h-5 text-foreground/70" />
                        </div>
                        <span className="text-sm font-bold text-foreground/90">Points per game</span>
                      </div>
                      <select
                        value={pointBreak}
                        onChange={(e) => setPointBreak(Number(e.target.value))}
                        className="bg-background border border-foreground/10 rounded-xl px-4 py-2 font-bold outline-none focus:ring-2 focus:ring-red-500/50"
                      >
                        {Array.from({ length: 30 }, (_, i) => i + 1).map((i) => (
                          <option key={i} value={i}>{i}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </>
            ) : sport === 'Cricket' ? (
              <div className="space-y-3">
                <h2 className="text-[10px] font-black text-foreground/40 uppercase tracking-widest pl-2">Cricket Rules</h2>

                <div className="bg-surface border border-foreground/5 rounded-3xl overflow-hidden shadow-xl">
                  {/* Total Overs */}
                  <div className="flex items-center justify-between p-5 border-b border-foreground/5 hover:bg-foreground/5 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-background rounded-xl border border-foreground/5">
                        <ListOrdered className="w-5 h-5 text-foreground/70" />
                      </div>
                      <span className="text-sm font-bold text-foreground/90">Total Overs</span>
                    </div>
                    <div className="relative">
                      <select
                        value={totalOvers}
                        onChange={(e) => setTotalOvers(Number(e.target.value))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      >
                        <option value={5}>5 Overs</option>
                        <option value={10}>10 Overs</option>
                        <option value={15}>15 Overs</option>
                        <option value={20}>T20 (20 Overs)</option>
                        <option value={50}>ODI (50 Overs)</option>
                      </select>
                      <div className="bg-background border border-foreground/10 rounded-xl px-4 py-2 flex items-center gap-4 pointer-events-none shadow-inner">
                        <span className="font-bold">{totalOvers}</span>
                        <ChevronDown className="w-4 h-4 text-foreground/50" />
                      </div>
                    </div>
                  </div>

                  {/* Players Per Team */}
                  <div className="flex items-center justify-between p-5 border-foreground/5 hover:bg-foreground/5 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-background rounded-xl border border-foreground/5">
                        <Users className="w-5 h-5 text-foreground/70" />
                      </div>
                      <span className="text-sm font-bold text-foreground/90">Players Per Team</span>
                    </div>
                    <div className="relative">
                      <select
                        value={playersPerTeam}
                        onChange={(e) => setPlayersPerTeam(Number(e.target.value))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      >
                        <option value={6}>6</option>
                        <option value={8}>8</option>
                        <option value={11}>11</option>
                      </select>
                      <div className="bg-background border border-foreground/10 rounded-xl px-4 py-2 flex items-center gap-4 pointer-events-none shadow-inner">
                        <span className="font-bold">{playersPerTeam}</span>
                        <ChevronDown className="w-4 h-4 text-foreground/50" />
                      </div>
                    </div>
                  </div>



                  {/* Substitutes */}
                  <div className="flex items-center justify-between p-5 border-t border-foreground/5 hover:bg-foreground/5 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-background rounded-xl border border-foreground/5">
                        <Users className="w-5 h-5 text-foreground/70" />
                      </div>
                      <span className="text-sm font-bold text-foreground/90">Bench Substitutes</span>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        value={subsPerTeam}
                        onChange={(e) => setSubsPerTeam(Number(e.target.value))}
                        className="w-20 bg-background border border-foreground/10 rounded-xl px-4 py-2 text-center font-bold focus:outline-none focus:border-red-500 shadow-inner"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : sport === 'Football' ? (
              <div className="space-y-3">
                <h2 className="text-[10px] font-black text-foreground/40 uppercase tracking-widest pl-2">Football Rules</h2>

                <div className="bg-surface border border-foreground/5 rounded-3xl overflow-hidden shadow-xl">
                  {/* Half Length */}
                  <div className="flex items-center justify-between p-5 border-b border-foreground/5 hover:bg-foreground/5 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-background rounded-xl border border-foreground/5">
                        <Activity className="w-5 h-5 text-foreground/70" />
                      </div>
                      <span className="text-sm font-bold text-foreground/90">Half Length (Mins)</span>
                    </div>
                    <div className="relative">
                      <select
                        value={halfLengthMinutes}
                        onChange={(e) => setHalfLengthMinutes(Number(e.target.value))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      >
                        <option value={10}>10 Mins</option>
                        <option value={30}>30 Mins</option>
                        <option value={45}>45 Mins</option>
                      </select>
                      <div className="bg-background border border-foreground/10 rounded-xl px-4 py-2 flex items-center gap-4 pointer-events-none shadow-inner">
                        <span className="font-bold">{halfLengthMinutes}</span>
                        <ChevronDown className="w-4 h-4 text-foreground/50" />
                      </div>
                    </div>
                  </div>

                  {/* Players Per Team */}
                  <div className="flex items-center justify-between p-5 border-foreground/5 hover:bg-foreground/5 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-background rounded-xl border border-foreground/5">
                        <Users className="w-5 h-5 text-foreground/70" />
                      </div>
                      <span className="text-sm font-bold text-foreground/90">Players Per Team</span>
                    </div>
                    <div className="relative">
                      <select
                        value={footballPlayers}
                        onChange={(e) => setFootballPlayers(Number(e.target.value))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      >
                        <option value={5}>5-a-side</option>
                        <option value={7}>7-a-side</option>
                        <option value={11}>11-a-side</option>
                      </select>
                      <div className="bg-background border border-foreground/10 rounded-xl px-4 py-2 flex items-center gap-4 pointer-events-none shadow-inner">
                        <span className="font-bold">{footballPlayers}</span>
                        <ChevronDown className="w-4 h-4 text-foreground/50" />
                      </div>
                    </div>
                  </div>
                  {/* Substitutes */}
                  <div className="flex items-center justify-between p-5 border-foreground/5 hover:bg-foreground/5 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-background rounded-xl border border-foreground/5">
                        <Users className="w-5 h-5 text-foreground/70" />
                      </div>
                      <span className="text-sm font-bold text-foreground/90">Bench Substitutes</span>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        value={subsPerTeam}
                        onChange={(e) => setSubsPerTeam(Number(e.target.value))}
                        className="w-20 bg-background border border-foreground/10 rounded-xl px-4 py-2 text-center font-bold focus:outline-none focus:border-red-500 shadow-inner"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : sport === 'Volleyball' ? (
              <div className="space-y-3">
                <h2 className="text-[10px] font-black text-foreground/40 uppercase tracking-widest pl-2">Volleyball Rules</h2>

                <div className="bg-surface border border-foreground/5 rounded-3xl overflow-hidden shadow-xl">
                  {/* Sets */}
                  <div className="flex items-center justify-between p-5 border-b border-foreground/5 hover:bg-foreground/5 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-background rounded-xl border border-foreground/5">
                        <ListOrdered className="w-5 h-5 text-foreground/70" />
                      </div>
                      <span className="text-sm font-bold text-foreground/90">Best of Sets</span>
                    </div>
                    <div className="relative">
                      <select
                        value={bestOfSets}
                        onChange={(e) => setBestOfSets(Number(e.target.value) as 3 | 5)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      >
                        <option value={3}>3 Sets</option>
                        <option value={5}>5 Sets</option>
                      </select>
                      <div className="bg-background border border-foreground/10 rounded-xl px-4 py-2 flex items-center gap-4 pointer-events-none shadow-inner">
                        <span className="font-bold">{bestOfSets}</span>
                        <ChevronDown className="w-4 h-4 text-foreground/50" />
                      </div>
                    </div>
                  </div>

                  {/* Points Per Set */}
                  <div className="flex items-center justify-between p-5 border-foreground/5 hover:bg-foreground/5 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-background rounded-xl border border-foreground/5">
                        <Trophy className="w-5 h-5 text-foreground/70" />
                      </div>
                      <span className="text-sm font-bold text-foreground/90">Points Per Set</span>
                    </div>
                    <div className="relative">
                      <select
                        value={pointsPerSet}
                        onChange={(e) => setPointsPerSet(Number(e.target.value))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      >
                        <option value={15}>15 Points</option>
                        <option value={21}>21 Points</option>
                        <option value={25}>25 Points</option>
                      </select>
                      <div className="bg-background border border-foreground/10 rounded-xl px-4 py-2 flex items-center gap-4 pointer-events-none shadow-inner">
                        <span className="font-bold">{pointsPerSet}</span>
                        <ChevronDown className="w-4 h-4 text-foreground/50" />
                      </div>
                    </div>
                  </div>
                  {/* Substitutes */}
                  <div className="flex items-center justify-between p-5 border-foreground/5 hover:bg-foreground/5 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-background rounded-xl border border-foreground/5">
                        <Users className="w-5 h-5 text-foreground/70" />
                      </div>
                      <span className="text-sm font-bold text-foreground/90">Bench Substitutes</span>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        value={subsPerTeam}
                        onChange={(e) => setSubsPerTeam(Number(e.target.value))}
                        className="w-20 bg-background border border-foreground/10 rounded-xl px-4 py-2 text-center font-bold focus:outline-none focus:border-red-500 shadow-inner"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-surface border border-foreground/5 rounded-3xl shadow-xl space-y-4">
                <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Settings className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-lg">{sport} Umpiring</h3>
                <p className="text-foreground/60 text-sm">
                  Full umpiring dashboard support for {sport} is coming in a future update! You can still continue to setup teams.
                </p>
              </div>
            )}

          </div>
        )}

        {/* TEAM 1 TAB */}
        {activeTab === 'team1' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="bg-surface border border-foreground/5 rounded-3xl p-6 shadow-xl">
              <h2 className="text-lg font-black uppercase tracking-wide mb-6 text-foreground drop-shadow-md">
                {sport !== 'Badminton' ? 'Team 1 Details' : isDoubles ? 'Team 1' : 'Player 1 Details'}
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] font-black text-foreground/40 uppercase tracking-widest mb-2 ml-1">
                    {sport !== 'Badminton' ? 'Team Name' : 'Player 1 Name'}
                  </label>
                  <input
                    type="text"
                    value={teamA[0]}
                    readOnly={isPreFilled}
                    onChange={(e) => setTeamA([e.target.value, teamA[1]])}
                    placeholder="Enter full name"
                    className={`w-full bg-background border border-foreground/10 rounded-2xl px-5 py-4 text-foreground font-bold focus:outline-none focus:border-red-500 focus:shadow-[0_0_15px_rgba(239,68,68,0.2)] transition-all placeholder-white/20 ${isPreFilled ? 'opacity-70 cursor-not-allowed' : ''}`}
                  />
                </div>
                {isDoubles && sport === 'Badminton' && (
                  <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                    <label className="block text-[10px] font-black text-foreground/40 uppercase tracking-widest mb-2 ml-1">Player 2 Name</label>
                    <input
                      type="text"
                      value={teamA[1]}
                      readOnly={isPreFilled}
                      onChange={(e) => setTeamA([teamA[0], e.target.value])}
                      placeholder="Enter full name"
                      className={`w-full bg-background border border-foreground/10 rounded-2xl px-5 py-4 text-foreground font-bold focus:outline-none focus:border-red-500 focus:shadow-[0_0_15px_rgba(239,68,68,0.2)] transition-all placeholder-white/20 ${isPreFilled ? 'opacity-70 cursor-not-allowed' : ''}`}
                    />
                  </div>
                )}
                {sport !== 'Badminton' && (
                  <div className="mt-6 border-t border-foreground/5 pt-6 space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-foreground/60 mb-4">Player Roster</h3>
                    {teamAPlayers.map((player, idx) => (
                      <div key={player.id} className="flex items-center gap-2 bg-background/50 p-2 rounded-2xl border border-foreground/5">
                        <div className="w-6 h-6 flex items-center justify-center bg-red-500/10 text-red-500 rounded-full text-[10px] font-black shrink-0">
                          {idx + 1}
                        </div>
                        <input
                          type="text"
                          value={player.jerseyNumber || ''}
                          onChange={(e) => handlePlayerChange('A', idx, 'jerseyNumber', e.target.value)}
                          placeholder="#"
                          className="w-12 bg-surface border border-foreground/10 rounded-xl px-2 py-1.5 text-xs text-center font-bold focus:outline-none focus:border-red-500 transition-all placeholder-foreground/20"
                        />
                        <input
                          type="text"
                          value={player.name}
                          onChange={(e) => handlePlayerChange('A', idx, 'name', e.target.value)}
                          placeholder="Player Name"
                          className="flex-1 bg-transparent border-none text-sm font-bold focus:outline-none focus:ring-0 placeholder-foreground/20 min-w-0"
                        />
                        <input
                          type="text"
                          value={player.position}
                          onChange={(e) => handlePlayerChange('A', idx, 'position', e.target.value)}
                          placeholder="Position"
                          className="w-20 bg-surface border border-foreground/10 rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:border-red-500 transition-all placeholder-foreground/20"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TEAM 2 TAB */}
        {activeTab === 'team2' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="bg-surface border border-foreground/5 rounded-3xl p-6 shadow-xl">
              <h2 className="text-lg font-black uppercase tracking-wide mb-6 text-foreground drop-shadow-md">
                {sport !== 'Badminton' ? 'Team 2 Details' : isDoubles ? 'Team 2' : 'Player 2 Details'}
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] font-black text-foreground/40 uppercase tracking-widest mb-2 ml-1">
                    {sport !== 'Badminton' ? 'Team Name' : 'Player 1 Name'}
                  </label>
                  <input
                    type="text"
                    value={teamB[0]}
                    readOnly={isPreFilled}
                    onChange={(e) => setTeamB([e.target.value, teamB[1]])}
                    placeholder="Enter full name"
                    className={`w-full bg-background border border-foreground/10 rounded-2xl px-5 py-4 text-foreground font-bold focus:outline-none focus:border-red-500 focus:shadow-[0_0_15px_rgba(239,68,68,0.2)] transition-all placeholder-white/20 ${isPreFilled ? 'opacity-70 cursor-not-allowed' : ''}`}
                  />
                </div>
                {isDoubles && sport === 'Badminton' && (
                  <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                    <label className="block text-[10px] font-black text-foreground/40 uppercase tracking-widest mb-2 ml-1">Player 2 Name</label>
                    <input
                      type="text"
                      value={teamB[1]}
                      readOnly={isPreFilled}
                      onChange={(e) => setTeamB([teamB[0], e.target.value])}
                      placeholder="Enter full name"
                      className={`w-full bg-background border border-foreground/10 rounded-2xl px-5 py-4 text-foreground font-bold focus:outline-none focus:border-red-500 focus:shadow-[0_0_15px_rgba(239,68,68,0.2)] transition-all placeholder-white/20 ${isPreFilled ? 'opacity-70 cursor-not-allowed' : ''}`}
                    />
                  </div>
                )}
                {sport !== 'Badminton' && (
                  <div className="mt-6 border-t border-foreground/5 pt-6 space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-foreground/60 mb-4">Player Roster</h3>
                    {teamBPlayers.map((player, idx) => (
                      <div key={player.id} className="flex items-center gap-2 bg-background/50 p-2 rounded-2xl border border-foreground/5">
                        <div className="w-6 h-6 flex items-center justify-center bg-red-500/10 text-red-500 rounded-full text-[10px] font-black shrink-0">
                          {idx + 1}
                        </div>
                        <input
                          type="text"
                          value={player.jerseyNumber || ''}
                          onChange={(e) => handlePlayerChange('B', idx, 'jerseyNumber', e.target.value)}
                          placeholder="#"
                          className="w-12 bg-surface border border-foreground/10 rounded-xl px-2 py-1.5 text-xs text-center font-bold focus:outline-none focus:border-red-500 transition-all placeholder-foreground/20"
                        />
                        <input
                          type="text"
                          value={player.name}
                          onChange={(e) => handlePlayerChange('B', idx, 'name', e.target.value)}
                          placeholder="Player Name"
                          className="flex-1 bg-transparent border-none text-sm font-bold focus:outline-none focus:ring-0 placeholder-foreground/20 min-w-0"
                        />
                        <input
                          type="text"
                          value={player.position}
                          onChange={(e) => handlePlayerChange('B', idx, 'position', e.target.value)}
                          placeholder="Position"
                          className="w-20 bg-surface border border-foreground/10 rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:border-red-500 transition-all placeholder-foreground/20"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {(sport === 'Cricket' || sport === 'Football') && (
              <div className="bg-surface border border-foreground/5 rounded-3xl p-6 shadow-xl mt-6">
                <h2 className="text-lg font-black uppercase tracking-wide mb-6 text-foreground drop-shadow-md">
                  Toss Details
                </h2>
                <div className="space-y-5">
                  <div>
                    <label className="block text-[10px] font-black text-foreground/40 uppercase tracking-widest mb-2 ml-1">
                      Toss Winner
                    </label>
                    <div className="relative">
                      <select
                        value={sport === 'Cricket' ? tossWinner : footballTossWinner}
                        onChange={(e) => sport === 'Cricket' ? setTossWinner(e.target.value as 'A' | 'B') : setFootballTossWinner(e.target.value as 'A' | 'B')}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      >
                        <option value="A">{teamA[0] || 'Team 1'}</option>
                        <option value="B">{teamB[0] || 'Team 2'}</option>
                      </select>
                      <div className="w-full bg-background border border-foreground/10 rounded-2xl px-5 py-4 flex items-center justify-between text-foreground font-bold shadow-inner">
                        <span>{(sport === 'Cricket' ? tossWinner : footballTossWinner) === 'A' ? (teamA[0] || 'Team 1') : (teamB[0] || 'Team 2')}</span>
                        <ChevronDown className="w-5 h-5 text-foreground/50" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-foreground/40 uppercase tracking-widest mb-2 ml-1">
                      Decision
                    </label>
                    <div className="relative">
                      <select
                        value={sport === 'Cricket' ? tossDecision : footballTossDecision}
                        onChange={(e) => sport === 'Cricket' ? setTossDecision(e.target.value as 'Batting' | 'Bowling') : setFootballTossDecision(e.target.value as 'Kickoff' | 'Side')}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      >
                        {sport === 'Cricket' ? (
                          <>
                            <option value="Batting">Batting</option>
                            <option value="Bowling">Bowling</option>
                          </>
                        ) : (
                          <>
                            <option value="Kickoff">Kickoff</option>
                            <option value="Side">Side</option>
                          </>
                        )}
                      </select>
                      <div className="w-full bg-background border border-foreground/10 rounded-2xl px-5 py-4 flex items-center justify-between text-foreground font-bold shadow-inner">
                        <span>{sport === 'Cricket' ? tossDecision : footballTossDecision}</span>
                        <ChevronDown className="w-5 h-5 text-foreground/50" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* FIXED BOTTOM ACTION BAR */}
      <div className="fixed bottom-20 md:bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-[#0A0F1A] via-[#0A0F1A]/95 to-[#0A0F1A]/0 backdrop-blur-sm pt-12 z-40">
        <button
          onClick={handleNext}
          className="w-full bg-red-500 text-foreground font-black uppercase tracking-widest py-4 rounded-2xl text-sm flex items-center justify-center gap-2 hover:bg-red-400 active:scale-[0.98] transition-all shadow-[0_10px_40px_rgba(239,68,68,0.3)] border border-red-400/50"
        >
          {activeTab === 'sport' ? 'Configure Rules' : activeTab === 'rules' ? 'Configure Team 1' : activeTab === 'team1' ? 'Configure Team 2' : 'Start Scoring Match'}
          {activeTab !== 'team2' ? <ChevronRight className="w-5 h-5 ml-1" /> : <Activity className="w-5 h-5 ml-1" />}
        </button>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}
export default function MatchSetupPage() { return <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}><MatchSetupContent /></Suspense>; }
