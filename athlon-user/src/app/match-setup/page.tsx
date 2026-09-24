'use client';

import React, { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  User,
  Users,
  ListOrdered,
  Trophy,
  Activity,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Zap,
  Flame,
  Shield,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  Info,
} from 'lucide-react';
import { useMatchStore, GameCategory, Player } from '@/lib/store/useMatchStore';
import { useCricketStore } from '@/lib/store/useCricketStore';
import { useFootballStore } from '@/lib/store/useFootballStore';
import { useVolleyballStore } from '@/lib/store/useVolleyballStore';
import { usePracticeMatchStore } from '@/lib/store/usePracticeMatchStore';
import { MatchService } from '@/lib/api/matches';
import Image from 'next/image';

function MatchSetupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setupMatch = useMatchStore((state) => state.setupMatch);

  const matchIdParam = searchParams.get('matchId');

  useEffect(() => {
    if (matchIdParam && matchIdParam !== 'live' && !matchIdParam.startsWith('practice-')) {
      MatchService.getById(matchIdParam)
        .then((res: any) => {
          if (res?.data?.status === 'COMPLETED') {
            router.replace(`/live-score/${matchIdParam}`);
          }
        })
        .catch(() => { });
    }
  }, [matchIdParam, router]);

  const parseTeamPlayers = (raw?: string | null): string[] => {
    if (!raw) return ['', ''];
    const parts = raw
      .split(/\s*(?:\/|&|\+|,|\band\b)\s*/)
      .map((s) => s.trim())
      .filter(Boolean);
    return [parts[0] || '', parts[1] || ''];
  };

  const urlSport = searchParams.get('sport');
  const initialSport = urlSport || 'Badminton';
  const urlCategory = searchParams.get('category');
  const initialTeamA = parseTeamPlayers(searchParams.get('teamA') || searchParams.get('teamAName'));
  const initialTeamB = parseTeamPlayers(searchParams.get('teamB') || searchParams.get('teamBName'));
  const initialCategory = urlCategory || (initialTeamA[1] || initialTeamB[1] ? 'Doubles' : 'Doubles');
  const isFromUmpire = searchParams.get('fromUmpire') === 'true';

  const initialTeamAName = searchParams.get('teamAName') || (initialTeamA[0] ? (initialTeamA[1] ? `${initialTeamA[0]} / ${initialTeamA[1]}` : initialTeamA[0]) : 'Team A');
  const initialTeamBName = searchParams.get('teamBName') || (initialTeamB[0] ? (initialTeamB[1] ? `${initialTeamB[0]} / ${initialTeamB[1]}` : initialTeamB[0]) : 'Team B');
  const isPreFilled = !!searchParams.get('teamA') || !!searchParams.get('teamB');

  const [activeTab, setActiveTab] = useState<'sport' | 'rules' | 'team1' | 'team2'>(
    isFromUmpire || !!urlSport ? 'rules' : 'sport'
  );

  const [sport, setSport] = useState(initialSport);
  const [category, setCategory] = useState<GameCategory>(initialCategory as GameCategory);
  const [sets, setSets] = useState<number>(3);
  const [pointBreak, setPointBreak] = useState<number>(21);
  const [deuce, setDeuce] = useState<boolean>(false);
  const [maxPointCap, setMaxPointCap] = useState<number>(30);

  // Cricket specific config
  const [totalOvers, setTotalOvers] = useState<number>(5);
  const [playersPerTeam, setPlayersPerTeam] = useState<number>(6);
  const [tossWinner, setTossWinner] = useState<'A' | 'B'>('A');
  const [tossDecision, setTossDecision] = useState<'Batting' | 'Bowling'>('Batting');

  // Football specific config
  const [halfLengthMinutes, setHalfLengthMinutes] = useState<number>(15);
  const [footballPlayers, setFootballPlayers] = useState<number>(5);
  const [footballTossWinner, setFootballTossWinner] = useState<'A' | 'B'>('A');
  const [footballTossDecision, setFootballTossDecision] = useState<'Kickoff' | 'Side'>('Kickoff');

  // Volleyball specific config
  const [bestOfSets, setBestOfSets] = useState<3 | 5>(3);
  const [pointsPerSet, setPointsPerSet] = useState<number>(25);

  const [teamA, setTeamA] = useState<string[]>(initialTeamA);
  const [teamB, setTeamB] = useState<string[]>(initialTeamB);

  const [teamAPlayers, setTeamAPlayers] = useState<Player[]>([]);
  const [teamBPlayers, setTeamBPlayers] = useState<Player[]>([]);
  const [subsPerTeam, setSubsPerTeam] = useState<number>(2);

  useEffect(() => {
    let count = 0;
    if (sport === 'Cricket') count = playersPerTeam;
    else if (sport === 'Football') count = footballPlayers;
    else if (sport === 'Volleyball') count = 6;

    if (count > 0 && teamAPlayers.length !== count + subsPerTeam) {
      setTeamAPlayers(
        Array.from({ length: count + subsPerTeam }).map((_, i) => ({
          id: `A-${Date.now()}-${i}`,
          name: i === 0 && teamA[0] ? teamA[0] : `Player A${i + 1}`,
          position: '',
          jerseyNumber: String(i + 1),
          onField: i < count,
        }))
      );
      setTeamBPlayers(
        Array.from({ length: count + subsPerTeam }).map((_, i) => ({
          id: `B-${Date.now()}-${i}`,
          name: i === 0 && teamB[0] ? teamB[0] : `Player B${i + 1}`,
          position: '',
          jerseyNumber: String(i + 1),
          onField: i < count,
        }))
      );
    }
  }, [sport, playersPerTeam, footballPlayers, subsPerTeam, teamA, teamB]);

  const handlePlayerChange = (
    team: 'A' | 'B',
    index: number,
    field: 'name' | 'position' | 'jerseyNumber',
    value: string
  ) => {
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

  const handlePrev = () => {
    if (activeTab === 'team2') setActiveTab('team1');
    else if (activeTab === 'team1') setActiveTab('rules');
    else if (activeTab === 'rules') {
      if (!urlSport) setActiveTab('sport');
      else router.back();
    } else {
      router.back();
    }
  };

  const handleStartMatch = () => {
    if (sport === 'Cricket') {
      const matchId = `practice-${Date.now()}`;
      const setupCricketMatch = useCricketStore.getState().setupMatch;
      setupCricketMatch({
        id: matchId,
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
      if (!matchIdParam) {
        usePracticeMatchStore.getState().addRecord({
          id: matchId,
          sport: 'Cricket',
          category: `${totalOvers} Overs (${playersPerTeam}v${playersPerTeam})`,
          teamALabel: teamA[0] || 'Team A',
          teamBLabel: teamB[0] || 'Team B',
          createdAt: new Date().toISOString(),
          status: 'live',
          liveRoute: `/scoring/${matchId}?sport=Cricket&isPractice=true`,
        });
      }
      router.push(`/scoring/${matchId}?sport=Cricket&isPractice=true`);
      return;
    }

    if (sport === 'Football') {
      const matchId = `practice-${Date.now()}`;
      const setupFootballMatch = useFootballStore.getState().setupMatch;
      setupFootballMatch({
        id: matchId,
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
      if (!matchIdParam) {
        usePracticeMatchStore.getState().addRecord({
          id: matchId,
          sport: 'Football',
          category: `${halfLengthMinutes}m Half (${footballPlayers}v${footballPlayers})`,
          teamALabel: teamA[0] || 'Team A',
          teamBLabel: teamB[0] || 'Team B',
          createdAt: new Date().toISOString(),
          status: 'live',
          liveRoute: `/scoring/${matchId}?sport=Football&isPractice=true`,
        });
      }
      router.push(`/scoring/${matchId}?sport=Football&isPractice=true`);
      return;
    }

    if (sport === 'Volleyball') {
      const matchId = `practice-${Date.now()}`;
      const setupVolleyballMatch = useVolleyballStore.getState().setupMatch;
      setupVolleyballMatch({
        id: matchId,
        sport: 'Volleyball',
        bestOfSets,
        pointsPerSet,
        teamA: teamA[0] || 'Team A',
        teamB: teamB[0] || 'Team B',
        teamAPlayers,
        teamBPlayers,
      });
      if (!matchIdParam) {
        usePracticeMatchStore.getState().addRecord({
          id: matchId,
          sport: 'Volleyball',
          category: `Best of ${bestOfSets} (${pointsPerSet} Pts)`,
          teamALabel: teamA[0] || 'Team A',
          teamBLabel: teamB[0] || 'Team B',
          createdAt: new Date().toISOString(),
          status: 'live',
          liveRoute: `/scoring/${matchId}?sport=Volleyball&isPractice=true`,
        });
      }
      router.push(`/scoring/${matchId}?sport=Volleyball&isPractice=true`);
      return;
    }

    // Default Badminton
    {
      const finalTeamA = isDoubles ? teamA : [teamA[0]];
      const finalTeamB = isDoubles ? teamB : [teamB[0]];

      if (!finalTeamA[0]) finalTeamA[0] = 'Player 1 (A)';
      if (isDoubles && !finalTeamA[1]) finalTeamA[1] = 'Player 2 (A)';
      if (!finalTeamB[0]) finalTeamB[0] = 'Player 1 (B)';
      if (isDoubles && !finalTeamB[1]) finalTeamB[1] = 'Player 2 (B)';

      const generatedId = searchParams.get('matchId') || `practice-${Date.now()}`;

      setupMatch({
        id: generatedId,
        category,
        bestOfSets: sets as 1 | 2 | 3,
        pointBreak: pointBreak,
        deuce,
        maxPointCap: deuce ? maxPointCap : undefined,
        teamA: finalTeamA,
        teamB: finalTeamB,
        teamAName: searchParams.get('teamAName') || undefined,
        teamBName: searchParams.get('teamBName') || undefined,
        tournamentName: searchParams.get('tournamentName') || undefined,
        courtName: searchParams.get('courtName') || undefined,
        sportType: sport,
      });

      if (!matchIdParam) {
        usePracticeMatchStore.getState().addRecord({
          id: generatedId,
          sport: 'Badminton',
          category: `${category || 'Doubles'} • ${pointBreak} Pts${deuce ? ` (Deuce Cap ${maxPointCap})` : ''}`,
          teamALabel: isDoubles ? `${finalTeamA[0]} & ${finalTeamA[1]}` : finalTeamA[0],
          teamBLabel: isDoubles ? `${finalTeamB[0]} & ${finalTeamB[1]}` : finalTeamB[0],
          createdAt: new Date().toISOString(),
          status: 'live',
          scoreA: '0',
          scoreB: '0',
          liveRoute: `/scoring/${generatedId}?sport=Badminton&isPractice=true&deuce=${deuce}&maxPointCap=${maxPointCap}`,
        });
      }

      const categoryId = searchParams.get('categoryId');
      let url = `/scoring/${generatedId}?sport=Badminton&isPractice=true&deuce=${deuce}&maxPointCap=${maxPointCap}`;
      if (searchParams.get('matchId')) {
        url = `/scoring/${searchParams.get('matchId')}?sport=Badminton${categoryId ? `&categoryId=${categoryId}` : ''}&deuce=${deuce}&maxPointCap=${maxPointCap}`;
      }
      router.push(url);
    }
  };

  const sportsOptions = [
    {
      name: 'Badminton',
      icon: '🏸',
      desc: 'Rally Scoring • 1v1 / 2v2',
      badge: 'Voice Umpire',
    },
    {
      name: 'Cricket',
      icon: '🏏',
      desc: 'Box & Gully • Ball-by-Ball',
      badge: 'Scorecard',
    },
    {
      name: 'Football',
      icon: '⚽',
      desc: 'Futsal & Turf • Goals & Cards',
      badge: 'Live Timer',
    },
    {
      name: 'Volleyball',
      icon: '🏐',
      desc: 'Sets & Rotations • 25 Pts',
      badge: 'Rally Score',
    },
  ];

  const steps: { id: 'sport' | 'rules' | 'team1' | 'team2'; label: string; stepNumber: number }[] = [
    { id: 'sport', label: 'Sport', stepNumber: 1 },
    { id: 'rules', label: 'Rules', stepNumber: 2 },
    { id: 'team1', label: sport === 'Badminton' ? (isDoubles ? 'Side A' : 'Player 1') : 'Team 1', stepNumber: 3 },
    { id: 'team2', label: sport === 'Badminton' ? (isDoubles ? 'Side B' : 'Player 2') : 'Team 2', stepNumber: 4 },
  ];

  const currentStepIdx = steps.findIndex((s) => s.id === activeTab);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-primary/20 pb-24">

      {/* ══════════════════════════════════════════════════════════════════════
          1. STYLISH COMPACT MOBILE TOP BAR
         ══════════════════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-30 bg-surface/90 backdrop-blur-xl border-b border-foreground/10 px-4 py-2.5">
        <div className="max-w-md mx-auto flex items-center justify-between gap-2">
          <button
            onClick={handlePrev}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-foreground/5 transition-colors active:scale-95 cursor-pointer"
            title="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex flex-col items-center">
            <h1 className="text-xs font-black uppercase tracking-wider text-foreground">
              Match Setup
            </h1>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="w-1 h-1 rounded-full bg-primary animate-pulse" />
              <span className="text-[9px] font-bold text-primary uppercase tracking-widest">
                Digital Umpire Mode
              </span>
            </div>
          </div>

          <div className="px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-primary font-mono font-bold text-[10px]">
            {currentStepIdx + 1}/4
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════════════════
          2. STEP INDICATOR TABS (COMPACT THEME-ADAPTIVE)
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="max-w-md mx-auto w-full px-4 pt-2.5">
        {isFromUmpire ? (
          <div className="p-2.5 rounded-xl bg-surface border border-primary/30 flex items-center justify-between shadow-xs">
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-wider text-primary">
                Official Fixture
              </span>
              <span className="text-xs font-bold text-foreground mt-0.5">
                {initialTeamAName} <span className="text-primary font-black mx-1">VS</span> {initialTeamBName}
              </span>
            </div>
            <span className="px-2 py-0.5 bg-primary text-black font-black text-[9px] uppercase tracking-wider rounded-md shadow-xs">
              {sport}
            </span>
          </div>
        ) : (
          <div className="flex bg-surface/80 border border-foreground/10 p-1 rounded-xl shadow-xs gap-1">
            {steps.map((step, idx) => {
              const isActive = activeTab === step.id;
              const isPast = idx < currentStepIdx;
              return (
                <button
                  key={step.id}
                  onClick={() => setActiveTab(step.id)}
                  className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${isActive
                    ? 'bg-primary text-black shadow-xs'
                    : isPast
                      ? 'text-primary hover:bg-foreground/5'
                      : 'text-foreground/40 hover:text-foreground hover:bg-foreground/5'
                    }`}
                >
                  {isPast ? <CheckCircle2 className="w-2.5 h-2.5 text-primary" /> : null}
                  <span className="truncate">{step.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          3. CONTENT BODY AREA
         ══════════════════════════════════════════════════════════════════════ */}
      <main className="max-w-md mx-auto w-full px-4 pt-3 flex-1 space-y-3">

        {/* TAB 1: SPORT SELECTION */}
        {activeTab === 'sport' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="space-y-3">
              <h2 className="text-[11px] font-black text-foreground/50 uppercase tracking-widest pl-1">
                Sport
              </h2>

              <div className="grid grid-cols-4 gap-2.5 pt-1">
                {[
                  { name: 'Badminton', image: '/shuttle.png' },
                  { name: 'Football', image: '/football.png' },
                  { name: 'Cricket', image: '/cricket.png' },
                  { name: 'Volleyball', image: '/volleyball.png' },
                ].map((s) => {
                  const isSelected = sport === s.name;
                  return (
                    <button
                      key={s.name}
                      onClick={() => {
                        if (urlSport) return;
                        setSport(s.name);
                        setActiveTab('rules');
                      }}
                      disabled={!!urlSport}
                      className={`flex flex-col items-center gap-2.5 outline-none group ${urlSport && urlSport !== s.name ? 'opacity-30 cursor-not-allowed' : ''
                        }`}
                    >
                      <div
                        className={`relative w-full aspect-square rounded-[22px] flex items-center justify-center transition-all duration-200 shadow-md ${isSelected
                          ? 'bg-surface border-2 border-primary ring-2 ring-primary/30 shadow-primary/20 scale-[1.03]'
                          : 'bg-surface border border-foreground/10 hover:border-foreground/20 active:scale-95'
                          }`}
                      >
                        <div className="relative w-8 h-8 sm:w-10 sm:h-10">
                          <Image
                            src={s.image}
                            alt={s.name}
                            fill
                            className="object-contain drop-shadow-[0_3px_6px_rgba(0,0,0,0.25)]"
                          />
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider text-center transition-colors ${isSelected ? 'text-primary' : 'text-foreground/50 group-hover:text-foreground/80'
                          }`}
                      >
                        {s.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: RULES CONFIGURATION */}
        {activeTab === 'rules' && (
          <div className="space-y-3 animate-in fade-in duration-300">
            <div className="px-1">
              <h2 className="text-[10.5px] font-black uppercase tracking-wider text-foreground/50">
                {sport}  Rules &amp; Presets
              </h2>
            </div>

            {sport === 'Badminton' ? (
              <div className="space-y-2.5">
                {/* Format: Singles vs Doubles */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-foreground/50 pl-0.5">
                    Match Format
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['Singles', 'Doubles'] as GameCategory[]).map((fmt) => {
                      const isSelected = category === fmt;
                      return (
                        <button
                          key={fmt}
                          onClick={() => !urlCategory && setCategory(fmt)}
                          disabled={!!urlCategory}
                          className={`py-2 px-3 rounded-xl border transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer ${isSelected
                            ? 'bg-primary/10 border-primary ring-1 ring-primary/30 text-foreground'
                            : 'bg-surface border-foreground/10 text-foreground/60 hover:text-foreground'
                            } ${urlCategory ? 'opacity-80 cursor-not-allowed' : ''}`}
                        >
                          <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-primary text-black' : 'bg-foreground/5 text-foreground/40'}`}>
                            {fmt === 'Singles' ? <User className="w-3.5 h-3.5" /> : <Users className="w-3.5 h-3.5" />}
                          </div>
                          <span className="text-xs font-black uppercase tracking-wider">{fmt}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Points Per Set */}
                <div className="p-3 rounded-xl bg-surface border border-foreground/10 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                      <Trophy className="w-3.5 h-3.5 text-primary" /> Points Per Game
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                      {pointBreak} Points
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 pt-0.5">
                    {[11, 15, 21, 30].map((pts) => (
                      <button
                        key={pts}
                        onClick={() => setPointBreak(pts)}
                        className={`py-1.5 rounded-lg text-xs font-bold border transition-all active:scale-95 cursor-pointer ${pointBreak === pts
                          ? 'bg-primary text-black border-primary font-black shadow-xs'
                          : 'bg-background/60 hover:bg-background border-foreground/10 text-foreground/70'
                          }`}
                      >
                        {pts}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Max Games (Sets) */}
                <div className="p-3 rounded-xl bg-surface border border-foreground/10 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                      <ListOrdered className="w-3.5 h-3.5 text-primary" /> Best of Sets
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                      {sets} {sets === 1 ? 'Set' : 'Sets'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                    {[1, 3, 5].map((s) => (
                      <button
                        key={s}
                        onClick={() => setSets(s)}
                        className={`py-1.5 rounded-lg text-xs font-bold border transition-all active:scale-95 cursor-pointer ${sets === s
                          ? 'bg-primary text-black border-primary font-black shadow-xs'
                          : 'bg-background/60 hover:bg-background border-foreground/10 text-foreground/70'
                          }`}
                      >
                        {s} {s === 1 ? 'Game' : 'Games'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Deuce Selection (Only for Badminton) */}
                <div className="p-3 rounded-xl bg-surface border border-foreground/10 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-primary" /> Deuce (2-Point Lead)
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${deuce
                        ? 'bg-primary/10 text-primary border-primary/20'
                        : 'bg-foreground/5 text-foreground/50 border-foreground/10'
                        }`}
                    >
                      {deuce ? 'On' : 'Off'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                    <button
                      type="button"
                      onClick={() => setDeuce(false)}
                      className={`py-1.5 rounded-lg text-xs font-bold border transition-all active:scale-95 cursor-pointer ${!deuce
                        ? 'bg-primary text-black border-primary font-black shadow-xs'
                        : 'bg-background/60 hover:bg-background border-foreground/10 text-foreground/70'
                        }`}
                    >
                      Off
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeuce(true)}
                      className={`py-1.5 rounded-lg text-xs font-bold border transition-all active:scale-95 cursor-pointer ${deuce
                        ? 'bg-primary text-black border-primary font-black shadow-xs'
                        : 'bg-background/60 hover:bg-background border-foreground/10 text-foreground/70'
                        }`}
                    >
                      On
                    </button>
                  </div>

                  {deuce ? (
                    <div className="space-y-2 pt-1 border-t border-foreground/10 animate-in fade-in duration-200">
                      {/* Max Point Cap Provision */}
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-foreground flex items-center gap-1">
                          <Shield className="w-3 h-3 text-primary" /> Maximum Point Cap
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setMaxPointCap(Math.max(pointBreak + 1, maxPointCap - 1))}
                            className="w-6 h-6 rounded-md bg-background border border-foreground/10 text-foreground font-black text-xs flex items-center justify-center active:scale-90 cursor-pointer"
                            title="Decrease Cap"
                          >
                            -
                          </button>
                          <span className="min-w-8 text-center font-mono font-bold text-xs text-primary px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20">
                            {maxPointCap} Pts
                          </span>
                          <button
                            type="button"
                            onClick={() => setMaxPointCap(maxPointCap + 1)}
                            className="w-6 h-6 rounded-md bg-background border border-foreground/10 text-foreground font-black text-xs flex items-center justify-center active:scale-90 cursor-pointer"
                            title="Increase Cap"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Quick Point Cap Presets */}
                      <div className="grid grid-cols-4 gap-1">
                        {[20, 25, 30, 35].map((capVal) => (
                          <button
                            key={capVal}
                            type="button"
                            onClick={() => setMaxPointCap(capVal)}
                            className={`py-1 rounded-md text-[11px] font-bold border transition-all active:scale-95 cursor-pointer ${maxPointCap === capVal
                              ? 'bg-primary text-black border-primary font-black shadow-xs'
                              : 'bg-background/60 hover:bg-background border-foreground/10 text-foreground/70'
                              }`}
                          >
                            {capVal} Pts
                          </button>
                        ))}
                      </div>

                      <div className="flex items-start gap-1.5 text-[9.5px] text-foreground/60 bg-primary/5 border border-primary/15 rounded-lg p-2 mt-1">
                        <Info className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        <div className="leading-tight">
                          <span className="font-bold text-primary">Deuce Rule:</span> At {pointBreak - 1}-{pointBreak - 1}, play extends until a 2-point lead or max cap of <span className="font-bold text-foreground">{maxPointCap} points</span> (at {maxPointCap - 1}-{maxPointCap - 1}, next point wins outright).
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[9.5px] text-foreground/40 pl-0.5">
                      First to reach <span className="font-semibold text-foreground/60">{pointBreak} points</span> wins outright (no 2-point difference needed).
                    </div>
                  )}
                </div>
              </div>
            ) : sport === 'Cricket' ? (
              <div className="space-y-2.5">
                {/* Total Overs */}
                <div className="p-3 rounded-xl bg-surface border border-foreground/10 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                      <ListOrdered className="w-3.5 h-3.5 text-primary" /> Total Overs
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                      {totalOvers} Overs
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 pt-0.5">
                    {[2, 5, 10, 20].map((ov) => (
                      <button
                        key={ov}
                        onClick={() => setTotalOvers(ov)}
                        className={`py-1.5 rounded-lg text-xs font-bold border transition-all active:scale-95 cursor-pointer ${totalOvers === ov
                          ? 'bg-primary text-black border-primary font-black shadow-xs'
                          : 'bg-background/60 hover:bg-background border-foreground/10 text-foreground/70'
                          }`}
                      >
                        {ov} Ov
                      </button>
                    ))}
                  </div>
                </div>

                {/* Players Per Team */}
                <div className="p-3 rounded-xl bg-surface border border-foreground/10 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-primary" /> Players / Team
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                      {playersPerTeam}v{playersPerTeam}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 pt-0.5">
                    {[4, 6, 8, 11].map((p) => (
                      <button
                        key={p}
                        onClick={() => setPlayersPerTeam(p)}
                        className={`py-1.5 rounded-lg text-xs font-bold border transition-all active:scale-95 cursor-pointer ${playersPerTeam === p
                          ? 'bg-primary text-black border-primary font-black shadow-xs'
                          : 'bg-background/60 hover:bg-background border-foreground/10 text-foreground/70'
                          }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bench Substitutes */}
                <div className="p-3 rounded-xl bg-surface border border-foreground/10 flex items-center justify-between gap-3 shadow-xs">
                  <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-primary" /> Bench Substitutes
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setSubsPerTeam(Math.max(0, subsPerTeam - 1))}
                      className="w-7 h-7 rounded-lg bg-background border border-foreground/10 text-foreground font-black flex items-center justify-center active:scale-90 cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-5 text-center font-mono font-bold text-xs">{subsPerTeam}</span>
                    <button
                      onClick={() => setSubsPerTeam(subsPerTeam + 1)}
                      className="w-7 h-7 rounded-lg bg-background border border-foreground/10 text-foreground font-black flex items-center justify-center active:scale-90 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ) : sport === 'Football' ? (
              <div className="space-y-2.5">
                {/* Half Length */}
                <div className="p-3 rounded-xl bg-surface border border-foreground/10 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-primary" /> Half Duration
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                      {halfLengthMinutes} Mins
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-1 pt-0.5">
                    {[10, 15, 20, 45].map((half) => (
                      <button
                        key={half}
                        onClick={() => setHalfLengthMinutes(half)}
                        className={`py-1.5 rounded-lg text-xs font-bold border transition-all active:scale-95 cursor-pointer ${halfLengthMinutes === half
                          ? 'bg-primary text-black border-primary font-black shadow-xs'
                          : 'bg-background/60 hover:bg-background border-foreground/10 text-foreground/70'
                          }`}
                      >
                        {half}m
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        if ([10, 15, 20, 45].includes(halfLengthMinutes)) {
                          setHalfLengthMinutes(25);
                        }
                      }}
                      className={`py-1.5 rounded-lg text-xs font-bold border transition-all active:scale-95 cursor-pointer ${![10, 15, 20, 45].includes(halfLengthMinutes)
                        ? 'bg-primary text-black border-primary font-black shadow-xs'
                        : 'bg-background/60 hover:bg-background border-foreground/10 text-foreground/70'
                        }`}
                    >
                      Custom
                    </button>
                  </div>

                  {/* Custom Half Duration Input & Stepper */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-foreground/5">
                    <span className="text-[10px] font-bold text-text-muted">Custom Duration:</span>
                    <div className="flex items-center gap-1 bg-background border border-foreground/10 rounded-lg p-0.5">
                      <button
                        type="button"
                        onClick={() => setHalfLengthMinutes(Math.max(1, halfLengthMinutes - 1))}
                        className="w-6 h-6 rounded bg-surface border border-foreground/10 text-foreground font-black flex items-center justify-center active:scale-90 text-xs"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        max="120"
                        value={halfLengthMinutes}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          if (!isNaN(val) && val > 0) {
                            setHalfLengthMinutes(val);
                          }
                        }}
                        className="w-10 text-center bg-transparent text-xs font-mono font-bold text-foreground focus:outline-none"
                      />
                      <span className="text-[9px] text-text-muted font-bold pr-1">mins</span>
                      <button
                        type="button"
                        onClick={() => setHalfLengthMinutes(Math.min(120, halfLengthMinutes + 1))}
                        className="w-6 h-6 rounded bg-surface border border-foreground/10 text-foreground font-black flex items-center justify-center active:scale-90 text-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Football Players */}
                <div className="p-3 rounded-xl bg-surface border border-foreground/10 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-primary" /> Pitch Format
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                      {footballPlayers}v{footballPlayers}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                    {[5, 7, 11].map((p) => (
                      <button
                        key={p}
                        onClick={() => setFootballPlayers(p)}
                        className={`py-1.5 rounded-lg text-xs font-bold border transition-all active:scale-95 cursor-pointer ${footballPlayers === p
                          ? 'bg-primary text-black border-primary font-black shadow-xs'
                          : 'bg-background/60 hover:bg-background border-foreground/10 text-foreground/70'
                          }`}
                      >
                        {p}-a-side
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Volleyball */
              <div className="space-y-2.5">
                <div className="p-3 rounded-xl bg-surface border border-foreground/10 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                      <ListOrdered className="w-3.5 h-3.5 text-primary" /> Best of Sets
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                      Best of {bestOfSets}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                    {[3, 5].map((s) => (
                      <button
                        key={s}
                        onClick={() => setBestOfSets(s as 3 | 5)}
                        className={`py-1.5 rounded-lg text-xs font-bold border transition-all active:scale-95 cursor-pointer ${bestOfSets === s
                          ? 'bg-primary text-black border-primary font-black shadow-xs'
                          : 'bg-background/60 hover:bg-background border-foreground/10 text-foreground/70'
                          }`}
                      >
                        Best of {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-surface border border-foreground/10 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                      <Trophy className="w-3.5 h-3.5 text-primary" /> Points Per Set
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                      {pointsPerSet} Points
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                    {[15, 21, 25].map((pts) => (
                      <button
                        key={pts}
                        onClick={() => setPointsPerSet(pts)}
                        className={`py-1.5 rounded-lg text-xs font-bold border transition-all active:scale-95 cursor-pointer ${pointsPerSet === pts
                          ? 'bg-primary text-black border-primary font-black shadow-xs'
                          : 'bg-background/60 hover:bg-background border-foreground/10 text-foreground/70'
                          }`}
                      >
                        {pts} Pts
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: TEAM 1 DETAILS */}
        {activeTab === 'team1' && (
          <div className="space-y-3 animate-in fade-in duration-300">
            <div className="px-0.5">
              <h2 className="text-[11px] font-black uppercase tracking-wider text-foreground/50">
                {sport !== 'Badminton' ? 'Team 1 (Side A)' : isDoubles ? 'Side A (Doubles)' : 'Player 1 (Side A)'}
              </h2>
            </div>

            <div className="p-3.5 rounded-xl bg-surface border border-foreground/10 space-y-3 shadow-xs">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-foreground/50 block mb-1 pl-0.5">
                  {sport !== 'Badminton' ? 'Team Name' : 'Player 1 Name'}
                </label>
                <input
                  type="text"
                  value={teamA[0] || ''}
                  onChange={(e) => setTeamA([e.target.value, teamA[1] || ''])}
                  placeholder={sport === 'Badminton' ? 'e.g. Rahul S.' : 'e.g. Team Phoenix'}
                  className="w-full px-3 py-2.5 rounded-lg bg-background border border-foreground/10 text-foreground placeholder:text-foreground/30 text-xs font-bold focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              {isDoubles && sport === 'Badminton' && (
                <div className="animate-in fade-in duration-200">
                  <label className="text-[10px] font-black uppercase tracking-wider text-foreground/50 block mb-1 pl-0.5">
                    Partner / Player 2 Name
                  </label>
                  <input
                    type="text"
                    value={teamA[1] || ''}
                    onChange={(e) => setTeamA([teamA[0] || '', e.target.value])}
                    placeholder="e.g. Amit K."
                    className="w-full px-3 py-2.5 rounded-lg bg-background border border-foreground/10 text-foreground placeholder:text-foreground/30 text-xs font-bold focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              )}

              {sport !== 'Badminton' && (
                <div className="pt-2 border-t border-foreground/10 space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-foreground/50 block pl-0.5">
                    Player Roster ({teamAPlayers.length})
                  </span>
                  <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                    {teamAPlayers.map((player, idx) => (
                      <div key={player.id} className="flex items-center gap-2 bg-background p-1.5 px-2.5 rounded-lg border border-foreground/10">
                        <span className="w-5 text-center text-[11px] font-mono font-bold text-primary shrink-0">
                          #{idx + 1}
                        </span>
                        <input
                          type="text"
                          value={player.name}
                          onChange={(e) => handlePlayerChange('A', idx, 'name', e.target.value)}
                          placeholder={`Player ${idx + 1}`}
                          className="flex-1 bg-transparent border-none text-xs font-bold focus:outline-none placeholder:text-foreground/30 min-w-0"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: TEAM 2 DETAILS */}
        {activeTab === 'team2' && (
          <div className="space-y-3 animate-in fade-in duration-300">
            <div className="px-0.5">
              <h2 className="text-[11px] font-black uppercase tracking-wider text-foreground/50">
                {sport !== 'Badminton' ? 'Team 2 (Side B)' : isDoubles ? 'Side B (Doubles)' : 'Player 2 (Side B)'}
              </h2>
            </div>

            <div className="p-3.5 rounded-xl bg-surface border border-foreground/10 space-y-3 shadow-xs">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-foreground/50 block mb-1 pl-0.5">
                  {sport !== 'Badminton' ? 'Team Name' : 'Player 1 Name'}
                </label>
                <input
                  type="text"
                  value={teamB[0] || ''}
                  onChange={(e) => setTeamB([e.target.value, teamB[1] || ''])}
                  placeholder={sport === 'Badminton' ? 'e.g. Vikram K.' : 'e.g. Team Titans'}
                  className="w-full px-3 py-2.5 rounded-lg bg-background border border-foreground/10 text-foreground placeholder:text-foreground/30 text-xs font-bold focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              {isDoubles && sport === 'Badminton' && (
                <div className="animate-in fade-in duration-200">
                  <label className="text-[10px] font-black uppercase tracking-wider text-foreground/50 block mb-1 pl-0.5">
                    Partner / Player 2 Name
                  </label>
                  <input
                    type="text"
                    value={teamB[1] || ''}
                    onChange={(e) => setTeamB([teamB[0] || '', e.target.value])}
                    placeholder="e.g. Karthik R."
                    className="w-full px-3 py-2.5 rounded-lg bg-background border border-foreground/10 text-foreground placeholder:text-foreground/30 text-xs font-bold focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              )}

              {sport !== 'Badminton' && (
                <div className="pt-2 border-t border-foreground/10 space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-foreground/50 block pl-0.5">
                    Player Roster ({teamBPlayers.length})
                  </span>
                  <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                    {teamBPlayers.map((player, idx) => (
                      <div key={player.id} className="flex items-center gap-2 bg-background p-1.5 px-2.5 rounded-lg border border-foreground/10">
                        <span className="w-5 text-center text-[11px] font-mono font-bold text-amber-500 shrink-0">
                          #{idx + 1}
                        </span>
                        <input
                          type="text"
                          value={player.name}
                          onChange={(e) => handlePlayerChange('B', idx, 'name', e.target.value)}
                          placeholder={`Player ${idx + 1}`}
                          className="flex-1 bg-transparent border-none text-xs font-bold focus:outline-none placeholder:text-foreground/30 min-w-0"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Toss Details for Cricket & Football */}
            {(sport === 'Cricket' || sport === 'Football') && (
              <div className="p-3.5 rounded-xl bg-surface border border-foreground/10 space-y-2.5 shadow-xs">
                <div className="text-[11px] font-black uppercase tracking-wider text-foreground/50 pl-0.5">
                  Toss & Choice
                </div>

                <div className="space-y-2.5">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-foreground/50 block mb-1 pl-0.5">
                      Toss Won By
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => sport === 'Cricket' ? setTossWinner('A') : setFootballTossWinner('A')}
                        className={`py-2 px-2.5 rounded-lg text-xs font-bold border transition-all truncate ${(sport === 'Cricket' ? tossWinner : footballTossWinner) === 'A'
                          ? 'bg-primary text-black border-primary font-black'
                          : 'bg-background border-foreground/10 text-foreground/70'
                          }`}
                      >
                        {teamA[0] || 'Team A'}
                      </button>
                      <button
                        onClick={() => sport === 'Cricket' ? setTossWinner('B') : setFootballTossWinner('B')}
                        className={`py-2 px-2.5 rounded-lg text-xs font-bold border transition-all truncate ${(sport === 'Cricket' ? tossWinner : footballTossWinner) === 'B'
                          ? 'bg-primary text-black border-primary font-black'
                          : 'bg-background border-foreground/10 text-foreground/70'
                          }`}
                      >
                        {teamB[0] || 'Team B'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-foreground/50 block mb-1 pl-0.5">
                      Decision
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {sport === 'Cricket' ? (
                        <>
                          <button
                            onClick={() => setTossDecision('Batting')}
                            className={`py-2 px-2.5 rounded-lg text-xs font-bold border transition-all ${tossDecision === 'Batting'
                              ? 'bg-primary text-black border-primary font-black'
                              : 'bg-background border-foreground/10 text-foreground/70'
                              }`}
                          >
                            Batting First
                          </button>
                          <button
                            onClick={() => setTossDecision('Bowling')}
                            className={`py-2 px-2.5 rounded-lg text-xs font-bold border transition-all ${tossDecision === 'Bowling'
                              ? 'bg-primary text-black border-primary font-black'
                              : 'bg-background border-foreground/10 text-foreground/70'
                              }`}
                          >
                            Bowling First
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => setFootballTossDecision('Kickoff')}
                            className={`py-2 px-2.5 rounded-lg text-xs font-bold border transition-all ${footballTossDecision === 'Kickoff'
                              ? 'bg-primary text-black border-primary font-black'
                              : 'bg-background border-foreground/10 text-foreground/70'
                              }`}
                          >
                            Kickoff First
                          </button>
                          <button
                            onClick={() => setFootballTossDecision('Side')}
                            className={`py-2 px-2.5 rounded-lg text-xs font-bold border transition-all ${footballTossDecision === 'Side'
                              ? 'bg-primary text-black border-primary font-black'
                              : 'bg-background border-foreground/10 text-foreground/70'
                              }`}
                          >
                            Choose Side
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ══════════════════════════════════════════════════════════════════════
          4. SLEEK ELEVATED BOTTOM ACTION BAR (MOBILE-OPTIMIZED)
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pt-6 pb-8 bg-gradient-to-t from-background via-background/95 to-transparent z-40 pointer-events-none">
        <div className="max-w-sm mx-auto pointer-events-auto">
          <button
            onClick={handleNext}
            className="w-full h-11 px-4 rounded-xl bg-primary text-black font-black uppercase tracking-wider text-xs flex items-center justify-center gap-2 shadow-lg hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer"
            style={{
              boxShadow: '0 6px 20px -2px var(--athlon-primary-glow, rgba(16, 185, 129, 0.45)), 0 2px 8px rgba(0,0,0,0.2)',
            }}
          >
            <span>
              {activeTab === 'sport'
                ? 'Configure Rules'
                : activeTab === 'rules'
                  ? 'Set Team 1'
                  : activeTab === 'team1'
                    ? 'Set Team 2'
                    : 'Start Scoring Match'}
            </span>
            {activeTab !== 'team2' ? (
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            ) : (
              <Zap className="w-4 h-4 fill-black stroke-[2.5]" />
            )}
          </button>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `,
        }}
      />
    </div>
  );
}

export default function MatchSetupPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
      <MatchSetupContent />
    </Suspense>
  );
}
