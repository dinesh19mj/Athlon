'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import {
  ArrowLeft,
  Search,
  Tv,
  Trophy,
  Activity,
  Clock,
  Shield,
  Radio,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Medal,
  Calendar,
  Sparkles,
  Building2,
  Home,
  ArrowRight,
  X,
  Zap,
  Flame,
  Layers,
  RefreshCw,
  Gavel,
} from 'lucide-react';
import Link from 'next/link';
import { ScoreService, LiveScore } from '@/lib/api/scores';
import { TeamChampionshipService, TeamChampionship } from '@/lib/api/teamChampionship';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { Athlon3DIcon } from '@/components/common/Athlon3DIcon';

export default function LiveScorePage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [activeTab, setActiveTab] = useState<'live' | 'finished'>('live');
  const [liveScores, setLiveScores] = useState<LiveScore[]>([]);
  const [allScores, setAllScores] = useState<LiveScore[]>([]);
  const [liveAuctions, setLiveAuctions] = useState<TeamChampionship[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const liveTrackRef = useRef<HTMLDivElement>(null);
  const finishedTrackRef = useRef<HTMLDivElement>(null);

  const scrollTrack = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const amount = direction === 'left' ? -420 : 420;
      ref.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  const fetchScores = async () => {
    try {
      const [liveRes, allRes, champRes] = await Promise.all([
        ScoreService.getLive().catch(() => ({ data: [] })),
        ScoreService.getAll().catch(() => ({ data: [] })),
        TeamChampionshipService.getAllPublic().catch(() => []),
      ]);

      if (liveRes && liveRes.data) {
        setLiveScores(liveRes.data);
      }
      if (allRes && allRes.data) {
        setAllScores(allRes.data);
      }
      const champList = (Array.isArray(champRes) ? champRes : ((champRes as any)?.data || [])) as TeamChampionship[];
      setLiveAuctions(champList.filter((c: TeamChampionship) => c.stage === 'AUCTION_STAGE'));
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to load live/finished scores', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScores();
    const interval = setInterval(fetchScores, 5000);
    return () => clearInterval(interval);
  }, []);

  // Helper parser for score objects
  const parseMatchCard = (score: LiveScore) => {
    const meta = score.scoreMeta || {};
    const teamAName = meta.config?.teamAName || (meta.config?.teamA ? meta.config.teamA.join(' & ') : 'Team A');
    const teamBName = meta.config?.teamBName || (meta.config?.teamB ? meta.config.teamB.join(' & ') : 'Team B');
    const currentGameIndex = meta.currentGameIndex || 0;
    const games = meta.games || [];
    const currentGame = games[currentGameIndex] || {};
    const scoreA = currentGame.scoreA ?? (score.teamAScore || 0);
    const scoreB = currentGame.scoreB ?? (score.teamBScore || 0);

    const gamesWonA = games.filter((g: any) => g.winner === 'A').length;
    const gamesWonB = games.filter((g: any) => g.winner === 'B').length;

    const isFinished = score.isFinal === true || meta.isCompleted === true || gamesWonA >= 2 || gamesWonB >= 2;
    const matchWinner = isFinished ? (gamesWonA > gamesWonB ? teamAName : teamBName) : null;

    return {
      id: score.scoreId,
      matchUuid: score.matchUuid,
      tournament: meta.config?.tournamentName || 'Tournament Match',
      category: meta.config?.category || 'Doubles',
      court: meta.config?.courtName || 'Court 1',
      sport: meta.config?.sport || 'Badminton',
      player1: {
        name: teamAName,
        currentScore: scoreA,
        gamesWon: gamesWonA,
        avatar: teamAName.charAt(0),
        isWinner: isFinished && gamesWonA > gamesWonB,
      },
      player2: {
        name: teamBName,
        currentScore: scoreB,
        gamesWon: gamesWonB,
        avatar: teamBName.charAt(0),
        isWinner: isFinished && gamesWonB > gamesWonA,
      },
      status: isFinished ? 'Final Result' : `Game ${currentGameIndex + 1}`,
      isFinished,
      matchWinner,
      gamesList: games,
    };
  };

  const parsedLiveMatches = useMemo(() => liveScores.map(parseMatchCard), [liveScores]);

  const fallbackFinishedMatches = useMemo(
    () => [
      {
        id: 101,
        matchUuid: 'demo-finished-1',
        tournament: 'Bangalore Open Badminton Championship 2026',
        category: "Men's Singles • Quarter Final",
        court: 'Court 1 (Main Arena)',
        sport: 'Badminton',
        player1: { name: 'Arun Kumar', currentScore: 21, gamesWon: 2, avatar: 'A', isWinner: true },
        player2: { name: 'Rohan Sharma', currentScore: 18, gamesWon: 1, avatar: 'R', isWinner: false },
        status: 'Final Result',
        isFinished: true,
        matchWinner: 'Arun Kumar',
        gamesList: [{ scoreA: 21, scoreB: 18 }, { scoreA: 19, scoreB: 21 }, { scoreA: 21, scoreB: 16 }],
      },
      {
        id: 102,
        matchUuid: 'demo-finished-2',
        tournament: 'Bangalore Open Badminton Championship 2026',
        category: "Women's Singles • Semi Final",
        court: 'Court 2',
        sport: 'Badminton',
        player1: { name: 'Pooja Verma', currentScore: 21, gamesWon: 2, avatar: 'P', isWinner: true },
        player2: { name: 'Neha Reddy', currentScore: 14, gamesWon: 0, avatar: 'N', isWinner: false },
        status: 'Final Result',
        isFinished: true,
        matchWinner: 'Pooja Verma',
        gamesList: [{ scoreA: 21, scoreB: 14 }, { scoreA: 21, scoreB: 17 }],
      },
      {
        id: 103,
        matchUuid: 'demo-finished-3',
        tournament: 'Bangalore Open Badminton Championship 2026',
        category: "Men's Doubles • Round of 16",
        court: 'Court 3',
        sport: 'Badminton',
        player1: { name: 'Karthik & Vignesh', currentScore: 22, gamesWon: 2, avatar: 'K', isWinner: true },
        player2: { name: 'Deepak & Sanjay', currentScore: 20, gamesWon: 1, avatar: 'D', isWinner: false },
        status: 'Final Result',
        isFinished: true,
        matchWinner: 'Karthik & Vignesh',
        gamesList: [{ scoreA: 21, scoreB: 19 }, { scoreA: 18, scoreB: 21 }, { scoreA: 22, scoreB: 20 }],
      },
      {
        id: 104,
        matchUuid: 'demo-finished-4',
        tournament: 'State Corporate Shuttle League',
        category: 'Corporate Doubles • Final',
        court: 'Centre Court',
        sport: 'Badminton',
        player1: { name: 'Infosys Smashers', currentScore: 21, gamesWon: 2, avatar: 'I', isWinner: true },
        player2: { name: 'Wipro Titans', currentScore: 16, gamesWon: 0, avatar: 'W', isWinner: false },
        status: 'Final Result',
        isFinished: true,
        matchWinner: 'Infosys Smashers',
        gamesList: [{ scoreA: 21, scoreB: 16 }, { scoreA: 21, scoreB: 15 }],
      },
      {
        id: 105,
        matchUuid: 'demo-finished-5',
        tournament: 'State Corporate Shuttle League',
        category: 'Corporate Mixed Doubles',
        court: 'Court 4',
        sport: 'Badminton',
        player1: { name: 'TCS Thunder', currentScore: 21, gamesWon: 2, avatar: 'T', isWinner: true },
        player2: { name: 'Accenture Aces', currentScore: 19, gamesWon: 1, avatar: 'A', isWinner: false },
        status: 'Final Result',
        isFinished: true,
        matchWinner: 'TCS Thunder',
        gamesList: [{ scoreA: 17, scoreB: 21 }, { scoreA: 21, scoreB: 19 }, { scoreA: 21, scoreB: 18 }],
      },
      {
        id: 106,
        matchUuid: 'demo-finished-6',
        tournament: 'All-India Junior Super Series',
        category: 'Under-17 Boys Singles',
        court: 'Court 1',
        sport: 'Badminton',
        player1: { name: 'Siddharth M', currentScore: 21, gamesWon: 2, avatar: 'S', isWinner: true },
        player2: { name: 'Vikram Patel', currentScore: 12, gamesWon: 0, avatar: 'V', isWinner: false },
        status: 'Final Result',
        isFinished: true,
        matchWinner: 'Siddharth M',
        gamesList: [{ scoreA: 21, scoreB: 12 }, { scoreA: 21, scoreB: 13 }],
      },
      {
        id: 107,
        matchUuid: 'demo-finished-7',
        tournament: 'All-India Junior Super Series',
        category: 'Under-17 Girls Doubles',
        court: 'Court 2',
        sport: 'Badminton',
        player1: { name: 'Ananya & Shreya', currentScore: 21, gamesWon: 2, avatar: 'A', isWinner: true },
        player2: { name: 'Tanvi & Ritu', currentScore: 19, gamesWon: 1, avatar: 'T', isWinner: false },
        status: 'Final Result',
        isFinished: true,
        matchWinner: 'Ananya & Shreya',
        gamesList: [{ scoreA: 21, scoreB: 15 }, { scoreA: 19, scoreB: 21 }, { scoreA: 21, scoreB: 19 }],
      },
    ],
    []
  );

  const parsedFinishedMatches = useMemo(() => {
    const fromApi = allScores
      .map(parseMatchCard)
      .filter((m) => m.isFinished || !liveScores.some((l) => l.matchUuid === m.matchUuid));

    if (fromApi.length > 0) return fromApi;
    return fallbackFinishedMatches;
  }, [allScores, liveScores, fallbackFinishedMatches]);

  // Search filter
  const filterBySearch = (matches: ReturnType<typeof parseMatchCard>[]) => {
    if (!searchQuery.trim()) return matches;
    const q = searchQuery.toLowerCase();
    return matches.filter(
      (m) =>
        m.player1.name.toLowerCase().includes(q) ||
        m.player2.name.toLowerCase().includes(q) ||
        m.tournament.toLowerCase().includes(q) ||
        m.court.toLowerCase().includes(q)
    );
  };

  // Sort matches in descending order (newest/latest first)
  const displayedLiveMatches = useMemo(() => {
    const filtered = filterBySearch(parsedLiveMatches);
    return [...filtered].sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0));
  }, [parsedLiveMatches, searchQuery]);

  const displayedFinishedMatches = useMemo(() => {
    const filtered = filterBySearch(parsedFinishedMatches);
    return [...filtered].sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0));
  }, [parsedFinishedMatches, searchQuery]);

  // Group finished matches by tournament in descending order
  const finishedMatchesByTournament = useMemo(() => {
    const groups: { [tournamentName: string]: typeof displayedFinishedMatches } = {};
    displayedFinishedMatches.forEach((match) => {
      const tName = match.tournament || 'Championship Tournament';
      if (!groups[tName]) {
        groups[tName] = [];
      }
      groups[tName].push(match);
    });

    // Sort matches within each tournament group in descending order
    Object.keys(groups).forEach((key) => {
      groups[key].sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0));
    });

    return groups;
  }, [displayedFinishedMatches]);

  return (
    <div className="min-h-screen w-full bg-background text-foreground font-sans selection:bg-[#EF4444] selection:text-white">
      {/* ══════════════════════════════════════════════════════════════════════
          1. MOBILE VIEW ONLY (< md) - EXACT PRESERVED MOBILE EXPERIENCE
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="block md:hidden pb-24 overflow-y-auto">
        {/* Top Header */}
        <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-4 bg-background/90 backdrop-blur-md border-b border-foreground/5">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 -ml-2 text-foreground hover:text-red-500 transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-lg font-bold uppercase tracking-wider flex items-center gap-2">
              <Radio className="w-5 h-5 text-red-500 animate-pulse" />
              Match Center
            </h1>
          </div>
        </header>

        <main className="w-full max-w-lg mx-auto px-4 flex flex-col gap-6 pt-4">
          {/* Segmented Control: Live Now vs Finished Results */}
          <div
            className="flex p-1.5 rounded-2xl border grid grid-cols-2 gap-1"
            style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
          >
            <button
              onClick={() => setActiveTab('live')}
              className={`py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${activeTab === 'live'
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                  : 'text-foreground/50 hover:text-foreground hover:bg-white/5'
                }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${parsedLiveMatches.length > 0 ? 'bg-white animate-pulse' : 'bg-foreground/30'
                  }`}
              />
              <span>Live Now ({parsedLiveMatches.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('finished')}
              className={`py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${activeTab === 'finished'
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                  : 'text-foreground/50 hover:text-foreground hover:bg-white/5'
                }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Results ({parsedFinishedMatches.length})</span>
            </button>
          </div>

          {loading && (
            <div className="py-20 text-center text-foreground/50">
              <div className="w-8 h-8 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs font-bold uppercase tracking-wider">Loading match center...</p>
            </div>
          )}

          {/* Mobile LIVE TAB */}
          {!loading && activeTab === 'live' && (
            <div className="space-y-5 animate-in fade-in duration-300">
              {/* Live Player Auctions List */}
              {liveAuctions.map((champ) => (
                <section
                  key={champ.championshipUuid}
                  className="rounded-[24px] border p-5 shadow-2xl space-y-4 relative overflow-hidden bg-gradient-to-br from-red-500/10 via-transparent to-transparent"
                  style={{
                    backgroundColor: 'var(--athlon-card)',
                    borderColor: 'rgba(239, 68, 68, 0.4)',
                    boxShadow: '0 8px 30px rgba(239, 68, 68, 0.15)',
                  }}
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-rose-500 to-primary animate-pulse" />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                      <span className="text-red-500 font-black text-xs uppercase tracking-wider">LIVE PLAYER AUCTION</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 text-[10px] font-black uppercase">
                      BROADCASTING
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-black text-foreground tracking-tight">{champ.name}</h3>
                    <p className="text-xs text-foreground/60 mt-0.5">
                      {champ.location || champ.venue || 'Badminton Championship'} • Squad Floor Draft & Live Franchise Bids
                    </p>
                  </div>

                  <Link
                    href={`/home/team-championship/${champ.championshipUuid}/auction`}
                    className="w-full py-3 bg-gradient-to-r from-red-500 via-rose-500 to-primary text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-500/25 hover:brightness-110 active:scale-95 transition-all"
                  >
                    <Gavel className="w-4 h-4" />
                    <span>ENTER LIVE AUCTION FLOOR</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </section>
              ))}

              {displayedLiveMatches.length === 0 && liveAuctions.length === 0 ? (
                <div
                  className="rounded-2xl border border-dashed p-10 text-center"
                  style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                >
                  <Radio className="w-10 h-10 text-foreground/25 mx-auto mb-3" />
                  <p className="text-sm font-bold text-foreground mb-1">No Active Live Matches</p>
                  <p className="text-xs text-foreground/50 max-w-xs mx-auto mb-5">
                    Live scores will update here in real-time when an umpire launches a match scoreboard.
                  </p>
                  <button
                    onClick={() => setActiveTab('finished')}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-foreground text-xs font-bold rounded-xl border border-foreground/10 transition-colors"
                  >
                    View Finished Matches
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {displayedLiveMatches.map((match, idx) => (
                    <section
                      key={match.id || match.matchUuid || idx}
                      className="rounded-[24px] border p-5 shadow-xl space-y-4 relative overflow-hidden"
                      style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                    >
                      <div className="absolute top-0 left-0 right-0 h-1 bg-red-500 animate-pulse" />

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                          <span className="text-red-500 font-black text-xs tracking-wider">LIVE</span>
                          <span className="text-foreground/70 font-bold text-xs">{match.status}</span>
                        </div>
                        <span className="text-foreground/50 text-xs font-medium">{match.court}</span>
                      </div>

                      <div className="flex items-center justify-center">
                        <span className="px-3 py-1 bg-background rounded-full text-[10px] font-bold text-foreground/60 uppercase tracking-widest border border-foreground/5 text-center">
                          {match.tournament} • {match.category}
                        </span>
                      </div>

                      <div className="flex items-center justify-between px-2 py-2">
                        {/* Player 1 */}
                        <div className="flex flex-col items-center gap-2 max-w-[110px]">
                          <div className="w-14 h-14 rounded-full bg-gradient-to-b from-primary to-transparent p-[2px]">
                            <div className="w-full h-full rounded-full bg-background border-2 border-transparent overflow-hidden flex items-center justify-center">
                              <span className="text-lg font-black text-primary">{match.player1.avatar}</span>
                            </div>
                          </div>
                          <span className="font-bold text-xs tracking-wider uppercase text-center line-clamp-2 leading-tight">
                            {match.player1.name}
                          </span>
                          <span className="text-3xl font-black text-primary leading-none tabular-nums">
                            {match.player1.currentScore}
                          </span>
                        </div>

                        {/* VS & Games Won */}
                        <div className="flex flex-col items-center justify-center gap-2 shrink-0">
                          <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10 text-xs font-black font-mono">
                            {match.player1.gamesWon} - {match.player2.gamesWon}
                          </div>
                          <span className="text-[10px] font-extrabold uppercase tracking-widest text-foreground/40">
                            Games
                          </span>
                        </div>

                        {/* Player 2 */}
                        <div className="flex flex-col items-center gap-2 max-w-[110px]">
                          <div className="w-14 h-14 rounded-full bg-gradient-to-b from-white/20 to-transparent p-[2px]">
                            <div className="w-full h-full rounded-full bg-background border-2 border-transparent overflow-hidden flex items-center justify-center">
                              <span className="text-lg font-black text-foreground">{match.player2.avatar}</span>
                            </div>
                          </div>
                          <span className="font-bold text-xs tracking-wider uppercase text-center line-clamp-2 leading-tight">
                            {match.player2.name}
                          </span>
                          <span className="text-3xl font-black text-foreground leading-none tabular-nums">
                            {match.player2.currentScore}
                          </span>
                        </div>
                      </div>

                      <Link
                        href={`/live-score/${match.matchUuid}`}
                        className="w-full py-3 bg-red-500 text-white rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 hover:scale-[1.01] active:scale-95 transition-all"
                      >
                        WATCH LIVE STREAM & SCORING <Tv className="w-4 h-4" />
                      </Link>
                    </section>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Mobile FINISHED TAB */}
          {!loading && activeTab === 'finished' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {displayedFinishedMatches.length === 0 ? (
                <div
                  className="rounded-2xl border border-dashed p-10 text-center"
                  style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                >
                  <Trophy className="w-10 h-10 text-foreground/25 mx-auto mb-3" />
                  <p className="text-sm font-bold text-foreground mb-1">No Finished Matches Yet</p>
                  <p className="text-xs text-foreground/50 max-w-xs mx-auto">
                    Completed match summaries, final scores, and winner recaps will be listed here.
                  </p>
                </div>
              ) : (
                /* Grouped by Tournament - One horizontal scrolling track per tournament */
                <div className="space-y-6">
                  {Object.entries(finishedMatchesByTournament).map(([tournamentName, matches], tIdx) => (
                    <div key={tIdx} className="space-y-2.5">
                      {/* Tournament Header Strip */}
                      <div className="flex items-center justify-between px-0.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6 h-6 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                            <Trophy className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-xs font-black text-foreground truncate uppercase tracking-tight">
                              {tournamentName}
                            </h3>
                            <span className="text-[9.5px] font-bold text-foreground/50">
                              {matches.length} {matches.length === 1 ? 'match' : 'matches'} completed
                            </span>
                          </div>
                        </div>


                      </div>

                      {/* Horizontal Scrolling Match Results Track */}
                      <div className="flex items-stretch gap-3 overflow-x-auto pb-2 pt-0.5 snap-x scroll-px-3.5 hide-scrollbar -mx-4 px-4">
                        {matches.map((match, idx) => (
                          <Link
                            key={match.id || match.matchUuid || idx}
                            href={`/live-score/${match.matchUuid}`}
                            className="w-[82vw] sm:w-[310px] max-w-[330px] shrink-0 snap-start rounded-2xl border p-3.5 shadow-md flex flex-col justify-between transition-all hover:scale-[1.01] active:scale-[0.99] group relative overflow-hidden"
                            style={{
                              backgroundColor: 'var(--athlon-card)',
                              borderColor: 'var(--athlon-border)',
                            }}
                          >
                            {/* Top Accent line */}
                            <div className="h-[2px] w-full bg-primary absolute top-0 inset-x-0" />

                            <div className="space-y-2.5">
                              {/* Header: Category & Court */}
                              <div className="flex items-center justify-between text-[10px] gap-2 pt-0.5">
                                <span className="px-2 py-0.5 rounded-md font-bold bg-primary/10 text-primary border border-primary/20 truncate">
                                  {match.category}
                                </span>
                                <span className="text-foreground/50 font-bold truncate shrink-0">
                                  {match.court}
                                </span>
                              </div>

                              {/* Scores Pod */}
                              <div
                                className="p-2.5 rounded-xl border space-y-2"
                                style={{
                                  backgroundColor: 'var(--athlon-surface)',
                                  borderColor: 'var(--athlon-border)',
                                }}
                              >
                                {/* Team A */}
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <div className="w-5 h-5 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-[10px] text-primary shrink-0">
                                      {match.player1.avatar}
                                    </div>
                                    <span
                                      className={`text-xs truncate ${match.player1.isWinner ? 'text-foreground font-black' : 'text-foreground/70 font-semibold'
                                        }`}
                                    >
                                      {match.player1.name}
                                    </span>
                                    {match.player1.isWinner && (
                                      <Trophy className="w-3 h-3 text-primary shrink-0" />
                                    )}
                                  </div>
                                  <span
                                    className={`text-xs font-black font-mono tabular-nums ${match.player1.isWinner ? 'text-primary' : 'text-foreground/50'
                                      }`}
                                  >
                                    {match.player1.gamesWon}
                                  </span>
                                </div>

                                {/* Team B */}
                                <div
                                  className="flex items-center justify-between gap-2 border-t pt-1.5"
                                  style={{ borderColor: 'var(--athlon-border)' }}
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <div className="w-5 h-5 rounded-md bg-white/5 border border-white/10 flex items-center justify-center font-bold text-[10px] text-foreground/70 shrink-0">
                                      {match.player2.avatar}
                                    </div>
                                    <span
                                      className={`text-xs truncate ${match.player2.isWinner ? 'text-foreground font-black' : 'text-foreground/70 font-semibold'
                                        }`}
                                    >
                                      {match.player2.name}
                                    </span>
                                    {match.player2.isWinner && (
                                      <Trophy className="w-3 h-3 text-primary shrink-0" />
                                    )}
                                  </div>
                                  <span
                                    className={`text-xs font-black font-mono tabular-nums ${match.player2.isWinner ? 'text-primary' : 'text-foreground/50'
                                      }`}
                                  >
                                    {match.player2.gamesWon}
                                  </span>
                                </div>
                              </div>

                              {/* Sets Breakdown */}
                              {match.gamesList.length > 0 && (
                                <div className="flex items-center gap-1.5 flex-wrap text-[9px] text-foreground/60">
                                  <span className="font-bold uppercase text-foreground/40">Sets:</span>
                                  {match.gamesList.map((g: any, gIdx: number) => (
                                    <span
                                      key={gIdx}
                                      className="px-1.5 py-0.2 rounded bg-black/40 border border-foreground/10 font-mono font-bold text-foreground/80"
                                    >
                                      {g.scoreA ?? 0}-{g.scoreB ?? 0}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Footer CTA */}
                            <div
                              className="flex items-center justify-between pt-2 border-t mt-2 text-[10px]"
                              style={{ borderColor: 'var(--athlon-border)' }}
                            >
                              <span className="text-[9px] font-black uppercase tracking-wider text-primary">
                                Final Result
                              </span>
                              <span className="font-bold text-primary flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                                Scorecard <ChevronRight className="w-3 h-3" />
                              </span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>

        {/* Mobile Fixed Bottom Nav */}
        <nav
          className="fixed bottom-0 left-0 right-0 h-20 backdrop-blur-xl border-t z-50 px-5 flex items-center justify-between max-w-lg mx-auto"
          style={{ backgroundColor: 'var(--athlon-navigation)', borderColor: 'var(--athlon-border)' }}
        >
          <Link href="/" className="flex flex-col items-center gap-0.5 w-16 group opacity-80 hover:opacity-100 transition-opacity">
            <Athlon3DIcon type="home" size={32} active={false} />
            <span className="text-[9.5px] font-bold leading-tight" style={{ color: 'var(--athlon-text-muted)' }}>
              Home
            </span>
          </Link>

          <Link href="/tournaments" className="flex flex-col items-center gap-0.5 w-16 group opacity-80 hover:opacity-100 transition-opacity">
            <Athlon3DIcon type="tournaments" size={32} active={false} />
            <span className="text-[9.5px] font-bold leading-tight" style={{ color: 'var(--athlon-text-muted)' }}>
              Tournaments
            </span>
          </Link>

          {/* 3D Circular Elevated Umpire Button */}
          <div className="relative -top-5 flex items-center justify-center">
            <Link
              href="/match-setup"
              className="w-[60px] h-[60px] rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all border-[3.5px] group relative overflow-hidden shadow-2xl"
              style={{
                backgroundColor: 'var(--athlon-primary)',
                borderColor: 'var(--athlon-navigation)',
                boxShadow: '0 10px 25px -2px var(--athlon-primary-glow), 0 4px 12px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.45), inset 0 -3px 6px rgba(0,0,0,0.3)',
              }}
            >
              {/* 3D Glass Specular Reflection Arc */}
              <div className="absolute inset-x-1 top-0 h-[45%] rounded-t-full bg-gradient-to-b from-white/40 via-white/10 to-transparent pointer-events-none" />

              <img
                src="/umpire.png"
                alt="Umpire"
                className="w-8 h-8 object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.45)] relative z-10 transition-transform group-hover:scale-110 group-active:scale-95"
              />
            </Link>
          </div>

          <Link href="/academies" className="flex flex-col items-center gap-0.5 w-16 group opacity-80 hover:opacity-100 transition-opacity">
            <Athlon3DIcon type="academies" size={32} active={false} />
            <span className="text-[9.5px] font-bold leading-tight" style={{ color: 'var(--athlon-text-muted)' }}>
              Academy
            </span>
          </Link>

          <Link href={isAuthenticated ? '/home' : '/login'} className="flex flex-col items-center gap-0.5 w-16 group opacity-80 hover:opacity-100 transition-opacity">
            <Athlon3DIcon type="profile" size={32} active={false} />
            <span className="text-[9.5px] font-bold leading-tight" style={{ color: 'var(--athlon-text-muted)' }}>
              Profile
            </span>
          </Link>
        </nav>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          2. DESKTOP VIEW ONLY (hidden on mobile, visible on md and above)
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="hidden md:block">
        {/* Desktop Top Navbar (Only shown for unauthenticated landing visitors) */}
        {!isAuthenticated && (
          <header
            className="sticky top-0 z-50 w-full border-b backdrop-blur-xl bg-background/85 transition-all duration-300"
            style={{ borderColor: 'var(--athlon-border)' }}
          >
            <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
              {/* Brand Logo */}
              <Link href="/" className="flex items-center gap-3 group">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center text-red-400 group-hover:scale-105 transition-transform shadow-lg"
                  style={{
                    backgroundColor: 'var(--athlon-surface)',
                    border: '1px solid var(--athlon-border)',
                    boxShadow: '0 0 20px rgba(239, 68, 68, 0.2)',
                  }}
                >
                  <Radio className="w-5 h-5 text-red-500 animate-pulse" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-black tracking-tight text-foreground leading-none">
                    ATHLON
                  </span>
                  <span
                    className="text-[10px] font-mono font-bold tracking-widest uppercase leading-tight mt-0.5"
                    style={{ color: 'var(--athlon-primary)' }}
                  >
                    Sports Platform
                  </span>
                </div>
              </Link>

              {/* Center Navigation Links */}
              <nav className="flex items-center gap-1 bg-surface/40 p-1.5 rounded-2xl border border-foreground/5 backdrop-blur-md">
                <Link
                  href="/"
                  className="px-4 py-2 rounded-xl text-sm font-bold text-foreground/80 hover:text-foreground hover:bg-foreground/5 transition-all flex items-center gap-2"
                >
                  <Home className="w-4 h-4 text-primary" />
                  <span>Home</span>
                </Link>

                <Link
                  href="/tournaments"
                  className="px-4 py-2 rounded-xl text-sm font-bold text-foreground/80 hover:text-foreground hover:bg-foreground/5 transition-all flex items-center gap-2"
                >
                  <Trophy className="w-4 h-4 text-primary" />
                  <span>Tournaments</span>
                </Link>

                <Link
                  href="/academies"
                  className="px-4 py-2 rounded-xl text-sm font-bold text-foreground/80 hover:text-foreground hover:bg-foreground/5 transition-all flex items-center gap-2"
                >
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  <span>Academies</span>
                </Link>

                <Link
                  href="/live-score"
                  className="px-4 py-2 rounded-xl text-sm font-black bg-red-500 text-white transition-all flex items-center gap-2 shadow-lg shadow-red-500/25"
                >
                  <Radio className="w-4 h-4 text-white animate-pulse" />
                  <span>Live Arena</span>
                  {parsedLiveMatches.length > 0 && (
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  )}
                </Link>
              </nav>

              {/* Right Action CTAs */}
              <div className="flex items-center gap-3">
                <button
                  onClick={fetchScores}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border text-foreground/70 hover:text-foreground hover:bg-white/5 transition-all"
                  style={{ borderColor: 'var(--athlon-border)' }}
                  title="Refresh scores"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-primary" />
                  <span>Sync</span>
                </button>

                <div className="flex items-center gap-3">
                  <Link
                    href="/login"
                    className="text-sm font-bold px-4 py-2 rounded-xl text-foreground/80 hover:text-foreground hover:bg-foreground/5 transition-all"
                  >
                    Log In
                  </Link>

                  <Link
                    href="/login"
                    className="flex items-center gap-1.5 bg-primary text-black text-sm font-black px-5 py-2.5 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg"
                    style={{ boxShadow: '0 4px 20px var(--athlon-primary-glow)' }}
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </header>
        )}

        {/* Full-Width Live Match Arena Hero Banner */}
        <section
          className="relative w-full border-b overflow-hidden"
          style={{
            backgroundColor: 'var(--athlon-card)',
            borderColor: 'var(--athlon-border)',
          }}
        >
          {/* Ambient Radar & Lighting Effect */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <div className="absolute top-0 right-1/4 w-[500px] h-[300px] bg-red-500/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-1/4 w-[450px] h-[250px] bg-primary/10 rounded-full blur-[90px]" />
            <div
              className="absolute inset-0 opacity-[0.02]"
              style={{
                backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
                backgroundSize: '40px 40px',
              }}
            />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-10 lg:py-14 space-y-8">
            <div className="flex items-center justify-between gap-8">
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-red-500/10 border border-red-500/25 text-red-400">
                  <Radio className="w-4 h-4 text-red-500 animate-pulse" />
                  <span>Real-Time Courtside Radar • 5s Auto-Sync</span>
                </div>

                <h1 className="text-3xl lg:text-5xl font-black text-foreground tracking-tight leading-tight uppercase">
                  Live Match Arena &{' '}
                  <span className="bg-gradient-to-r from-red-500 via-amber-400 to-primary bg-clip-text text-transparent">
                    Scoresheets
                  </span>
                </h1>

                <p className="text-sm lg:text-base text-foreground/75 leading-relaxed">
                  Track live point-by-point scoring, set rallies, umpire calls, and courtside video streams across all active tournament matches in real-time.
                </p>
              </div>

              {/* 4 Metric Highlight Cards */}
              <div className="grid grid-cols-2 gap-3 shrink-0">
                <div
                  className="p-4 rounded-2xl border flex items-center gap-3 w-44"
                  style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                >
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                    <Radio className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-foreground/50">Live In-Play</span>
                    <div className="text-lg font-black text-red-400 font-mono">{parsedLiveMatches.length}</div>
                  </div>
                </div>

                <div
                  className="p-4 rounded-2xl border flex items-center gap-3 w-44"
                  style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-foreground/50">Finished</span>
                    <div className="text-lg font-black text-emerald-400 font-mono">{parsedFinishedMatches.length}</div>
                  </div>
                </div>

                <div
                  className="p-4 rounded-2xl border flex items-center gap-3 w-44"
                  style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-foreground/50">Sync Pulse</span>
                    <div className="text-xs font-black text-foreground font-mono">5s Live Polling</div>
                  </div>
                </div>

                <div
                  className="p-4 rounded-2xl border flex items-center gap-3 w-44"
                  style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <Tv className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-foreground/50">Stream Mode</span>
                    <div className="text-xs font-black text-blue-400 font-mono">HD Low Latency</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Desktop Filter & Search Dock */}
        <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8 space-y-8">
          <div
            className="p-4 rounded-[28px] border shadow-sm space-y-3.5"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <div className="flex items-center justify-between gap-4">
              {/* Row 1: Segmented Live vs Finished Switcher */}
              <div
                className="p-1 rounded-2xl border flex items-center gap-1.5"
                style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
              >
                <button
                  onClick={() => setActiveTab('live')}
                  className={`flex items-center gap-2 py-2 px-5 rounded-xl text-xs font-black transition-all ${activeTab === 'live'
                      ? 'bg-red-500 text-white shadow-lg shadow-red-500/25 scale-[1.01]'
                      : 'text-foreground/70 hover:text-foreground hover:bg-white/[0.04]'
                    }`}
                >
                  <Radio className={`w-3.5 h-3.5 ${parsedLiveMatches.length > 0 ? 'animate-pulse' : ''}`} />
                  <span>Live Matches In-Play</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-black shrink-0 ${activeTab === 'live' ? 'bg-black/20 text-white' : 'bg-white/10 text-foreground/50'
                      }`}
                  >
                    {parsedLiveMatches.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('finished')}
                  className={`flex items-center gap-2 py-2 px-5 rounded-xl text-xs font-black transition-all ${activeTab === 'finished'
                      ? 'bg-primary text-black shadow-md shadow-primary/20 scale-[1.01]'
                      : 'text-foreground/70 hover:text-foreground hover:bg-white/[0.04]'
                    }`}
                >
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Completed Results</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-black shrink-0 ${activeTab === 'finished' ? 'bg-black/20 text-black' : 'bg-white/10 text-foreground/50'
                      }`}
                  >
                    {parsedFinishedMatches.length}
                  </span>
                </button>
              </div>

              {/* Right Side: Search Bar + Horizontal Scroll Arrows */}
              <div className="flex items-center gap-3 shrink-0">
                {/* Interactive Search Bar */}
                <div className="relative w-72 shrink-0">
                  <Search className="w-4 h-4 text-foreground/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search player, tournament, court..."
                    className="w-full pl-10 pr-9 py-2 rounded-xl border text-xs font-medium focus:outline-none focus:border-red-500 transition-all placeholder:text-foreground/30"
                    style={{
                      backgroundColor: 'var(--athlon-surface)',
                      borderColor: 'var(--athlon-border)',
                      color: 'var(--athlon-text)',
                    }}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Left/Right Scroll Arrows */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => scrollTrack(activeTab === 'live' ? liveTrackRef : finishedTrackRef, 'left')}
                    className="w-9 h-9 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                    style={{ borderColor: 'var(--athlon-border)' }}
                    title="Scroll Left"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => scrollTrack(activeTab === 'live' ? liveTrackRef : finishedTrackRef, 'right')}
                    className="w-9 h-9 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                    style={{ borderColor: 'var(--athlon-border)' }}
                    title="Scroll Right"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Content Grid */}
          {loading ? (
            <div className="py-28 text-center text-foreground/50 text-xs font-bold uppercase tracking-widest flex flex-col items-center justify-center gap-3">
              <div className="w-9 h-9 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin" />
              <span>Connecting to courtside scoreboards...</span>
            </div>
          ) : activeTab === 'live' ? (
            displayedLiveMatches.length === 0 ? (
              <div
                className="py-24 px-8 rounded-[36px] border border-dashed flex flex-col items-center justify-center text-center"
                style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
              >
                <Radio className="w-12 h-12 text-foreground/30 mb-4" />
                <h3 className="text-xl font-black text-foreground mb-2">No Active Live Matches</h3>
                <p className="text-xs text-foreground/60 max-w-md mb-6 leading-relaxed">
                  {searchQuery
                    ? `No live matches matched "${searchQuery}". Try clearing your search.`
                    : 'Real-time scores will stream here immediately once an umpire starts a match.'}
                </p>
                <button
                  onClick={() => setActiveTab('finished')}
                  className="px-5 py-2.5 rounded-2xl bg-primary text-black font-black text-xs shadow-md"
                >
                  View Completed Matches
                </button>
              </div>
            ) : (
              <div className="relative">
                <div
                  ref={liveTrackRef}
                  className="flex items-stretch gap-6 overflow-x-auto pb-6 pt-2 snap-x snap-mandatory hide-scrollbar -mx-6 px-6 lg:-mx-8 lg:px-8"
                >
                  {displayedLiveMatches.map((match, idx) => (
                    <div
                      key={match.id || match.matchUuid || idx}
                      className="w-[360px] lg:w-[400px] shrink-0 snap-start group rounded-[28px] border overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl relative"
                      style={{
                        backgroundColor: 'var(--athlon-card)',
                        borderColor: 'var(--athlon-border)',
                      }}
                    >
                      {/* Glowing Red Active Bar */}
                      <div className="h-[3px] w-full bg-gradient-to-r from-red-500 via-amber-400 to-red-500 animate-pulse" />

                      <div className="p-6 space-y-5">
                        {/* Top Header Strip */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                            <span className="px-2.5 py-0.5 rounded-full bg-red-500/15 text-red-400 text-[10px] font-black uppercase tracking-wider border border-red-500/25">
                              LIVE • {match.status}
                            </span>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-lg bg-surface border border-foreground/10 text-[10px] font-bold text-foreground/70">
                            {match.court}
                          </span>
                        </div>

                        {/* Tournament & Category Tag */}
                        <div className="text-center">
                          <span className="px-3 py-1 bg-surface/80 rounded-full text-[10px] font-bold text-foreground/60 uppercase tracking-wider border border-foreground/5 inline-block truncate max-w-full">
                            {match.tournament} • {match.category}
                          </span>
                        </div>

                        {/* Head-to-Head Scoreboard Pod */}
                        <div
                          className="p-5 rounded-2xl border flex items-center justify-between gap-4"
                          style={{
                            backgroundColor: 'var(--athlon-surface)',
                            borderColor: 'var(--athlon-border)',
                          }}
                        >
                          {/* Player 1 */}
                          <div className="flex flex-col items-center gap-2 flex-1 min-w-0 text-center">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-center font-black text-primary text-base shadow-sm">
                              {match.player1.avatar}
                            </div>
                            <span className="text-xs font-black text-foreground line-clamp-1 leading-snug">
                              {match.player1.name}
                            </span>
                            <span className="text-3xl font-black text-primary font-mono tabular-nums leading-none">
                              {match.player1.currentScore}
                            </span>
                          </div>

                          {/* Sets Meter */}
                          <div className="flex flex-col items-center justify-center gap-1.5 px-3">
                            <span className="text-[9px] font-extrabold uppercase tracking-widest text-foreground/40">
                              Sets Won
                            </span>
                            <div className="px-3 py-1 rounded-xl bg-background border border-foreground/10 font-mono font-black text-xs text-foreground shadow-inner">
                              {match.player1.gamesWon} - {match.player2.gamesWon}
                            </div>
                            <span className="text-[9px] font-black text-red-400 uppercase tracking-widest animate-pulse">
                              IN PLAY
                            </span>
                          </div>

                          {/* Player 2 */}
                          <div className="flex flex-col items-center gap-2 flex-1 min-w-0 text-center">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/15 flex items-center justify-center font-black text-foreground text-base shadow-sm">
                              {match.player2.avatar}
                            </div>
                            <span className="text-xs font-black text-foreground line-clamp-1 leading-snug">
                              {match.player2.name}
                            </span>
                            <span className="text-3xl font-black text-foreground font-mono tabular-nums leading-none">
                              {match.player2.currentScore}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Action CTA */}
                      <div
                        className="p-4 border-t"
                        style={{
                          backgroundColor: 'rgba(0, 0, 0, 0.25)',
                          borderColor: 'var(--athlon-border)',
                        }}
                      >
                        <Link
                          href={`/live-score/${match.matchUuid}`}
                          className="w-full py-3 bg-red-500 text-white rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-500/25 hover:scale-[1.02] active:scale-95 transition-all"
                        >
                          <Tv className="w-4 h-4" />
                          <span>Watch Live Stream & Scoring</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          ) : (
            /* Finished Results Section - Grouped by Tournament on Desktop */
            displayedFinishedMatches.length === 0 ? (
              <div
                className="py-24 px-8 rounded-[36px] border border-dashed flex flex-col items-center justify-center text-center"
                style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
              >
                <Trophy className="w-12 h-12 text-foreground/30 mb-4" />
                <h3 className="text-xl font-black text-foreground mb-2">No Finished Matches Yet</h3>
                <p className="text-xs text-foreground/60 max-w-md mb-6 leading-relaxed">
                  Completed match summaries, final scores, and podium recaps will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-10">
                {Object.entries(finishedMatchesByTournament).map(([tournamentName, matches], tIdx) => (
                  <div key={tIdx} className="space-y-4">
                    {/* Tournament Header Strip */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center text-primary font-black shadow-sm">
                          <Trophy className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-base font-black text-foreground uppercase tracking-tight">
                            {tournamentName}
                          </h3>
                          <span className="text-xs font-bold text-foreground/50">
                            {matches.length} {matches.length === 1 ? 'match' : 'matches'} completed
                          </span>
                        </div>
                      </div>

                      <span className="text-xs font-bold text-foreground/40 uppercase tracking-widest flex items-center gap-1">
                        Horizontal Scroll <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>

                    {/* Horizontal Scrolling Track */}
                    <div className="flex items-stretch gap-6 overflow-x-auto pb-6 pt-1 snap-x snap-mandatory hide-scrollbar -mx-6 px-6 lg:-mx-8 lg:px-8">
                      {matches.map((match, idx) => (
                        <Link
                          key={match.id || match.matchUuid || idx}
                          href={`/live-score/${match.matchUuid}`}
                          className="w-[360px] lg:w-[380px] shrink-0 snap-start group rounded-[28px] border overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl relative"
                          style={{
                            backgroundColor: 'var(--athlon-card)',
                            borderColor: 'var(--athlon-border)',
                          }}
                        >
                          <div className="h-[3px] w-full bg-primary" />

                          <div className="p-5 space-y-4">
                            {/* Header */}
                            <div className="flex items-center justify-between">
                              <span className="px-2.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Final Result
                              </span>
                              <span className="text-[10px] uppercase font-bold text-foreground/45">
                                {match.category}
                              </span>
                            </div>

                            <div className="text-xs font-bold text-foreground/60 truncate">
                              {match.court}
                            </div>

                            {/* Score Rows */}
                            <div
                              className="p-4 rounded-2xl border space-y-3"
                              style={{
                                backgroundColor: 'var(--athlon-surface)',
                                borderColor: 'var(--athlon-border)',
                              }}
                            >
                              {/* Team A */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-xs text-primary shrink-0">
                                    {match.player1.avatar}
                                  </div>
                                  <span
                                    className={`text-xs font-black truncate max-w-[180px] ${match.player1.isWinner ? 'text-foreground font-black' : 'text-foreground/70'
                                      }`}
                                  >
                                    {match.player1.name}
                                  </span>
                                  {match.player1.isWinner && (
                                    <Trophy className="w-4 h-4 text-primary shrink-0" />
                                  )}
                                </div>

                                <span
                                  className={`text-base font-black font-mono tabular-nums ${match.player1.isWinner ? 'text-primary' : 'text-foreground/60'
                                    }`}
                                >
                                  {match.player1.gamesWon}
                                </span>
                              </div>

                              {/* Team B */}
                              <div
                                className="flex items-center justify-between border-t pt-3"
                                style={{ borderColor: 'var(--athlon-border-subtle)' }}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-bold text-xs text-foreground/70 shrink-0">
                                    {match.player2.avatar}
                                  </div>
                                  <span
                                    className={`text-xs font-black truncate max-w-[180px] ${match.player2.isWinner ? 'text-foreground font-black' : 'text-foreground/70'
                                      }`}
                                  >
                                    {match.player2.name}
                                  </span>
                                  {match.player2.isWinner && (
                                    <Trophy className="w-4 h-4 text-primary shrink-0" />
                                  )}
                                </div>

                                <span
                                  className={`text-base font-black font-mono tabular-nums ${match.player2.isWinner ? 'text-primary' : 'text-foreground/60'
                                    }`}
                                >
                                  {match.player2.gamesWon}
                                </span>
                              </div>
                            </div>

                            {/* Set Breakdown Chips */}
                            {match.gamesList.length > 0 && (
                              <div className="flex items-center gap-2 flex-wrap text-[10px] text-foreground/60">
                                <span className="font-extrabold uppercase tracking-wider text-foreground/40">Sets:</span>
                                {match.gamesList.map((g: any, gIdx: number) => (
                                  <span
                                    key={gIdx}
                                    className="px-2 py-0.5 rounded-lg bg-surface border border-foreground/10 font-mono font-bold"
                                  >
                                    {g.scoreA ?? 0} - {g.scoreB ?? 0}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          <div
                            className="p-3.5 px-6 border-t flex items-center justify-between text-xs"
                            style={{
                              backgroundColor: 'rgba(0, 0, 0, 0.25)',
                              borderColor: 'var(--athlon-border)',
                            }}
                          >
                            <span className="text-[11px] font-bold text-foreground/50">Match Summary</span>
                            <span className="text-primary font-black flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                              <span>View Scorecard</span>
                              <ChevronRight className="w-4 h-4" />
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </main>

        {/* Desktop Branded Footer */}
        <footer
          className="mt-20 border-t pt-12 pb-10 text-xs"
          style={{
            backgroundColor: 'var(--athlon-card)',
            borderColor: 'var(--athlon-border)',
          }}
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-500 font-black">
                  <Radio className="w-4 h-4" />
                </div>
                <span className="font-black text-foreground text-sm tracking-wide">ATHLON LIVE ARENA</span>
              </div>

              <div className="flex items-center gap-8 text-foreground/60 font-medium">
                <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                <Link href="/tournaments" className="hover:text-primary transition-colors">Tournaments</Link>
                <Link href="/academies" className="hover:text-primary transition-colors">Academies</Link>
                <Link href="/live-score" className="hover:text-red-400 transition-colors">Live Scoring</Link>
                <Link href="/login" className="hover:text-primary transition-colors">Organizer Hub</Link>
              </div>
            </div>

            <div className="border-t pt-6 flex items-center justify-between text-foreground/40 text-[11px]" style={{ borderColor: 'var(--athlon-border)' }}>
              <p>© 2026 Athlon Sports Platform. All rights reserved.</p>
              <p>Real-time tournament radar and scoring engine.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
