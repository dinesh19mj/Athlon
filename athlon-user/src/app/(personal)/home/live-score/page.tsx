'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  ArrowRight,
  X,
  Zap,
  Flame,
  Layers,
  RefreshCw,
  Gavel,
  Tag,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { ScoreService, LiveScore, isTournamentScore } from '@/lib/api/scores';
import { TeamChampionshipService, TeamChampionship } from '@/lib/api/teamChampionship';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useAthlonTheme } from '@/hooks/use-athlon-theme';

export default function LoggedInLiveScorePage() {
  const router = useRouter();
  const { mode } = useAthlonTheme();
  const { isAuthenticated } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'live' | 'finished' | 'auctions'>('live');
  const [liveScores, setLiveScores] = useState<LiveScore[]>([]);
  const [allScores, setAllScores] = useState<LiveScore[]>([]);
  const [liveAuctions, setLiveAuctions] = useState<TeamChampionship[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchScores = async () => {
    try {
      const [liveRes, allRes, champRes] = await Promise.all([
        ScoreService.getLive().catch(() => ({ data: [] })),
        ScoreService.getAll().catch(() => ({ data: [] })),
        TeamChampionshipService.getAllPublic().catch(() => []),
      ]);

      if (liveRes && liveRes.data) {
        setLiveScores(liveRes.data.filter(isTournamentScore));
      }
      if (allRes && allRes.data) {
        setAllScores(allRes.data.filter(isTournamentScore));
      }
      const champList = (Array.isArray(champRes) ? champRes : ((champRes as any)?.data || [])) as TeamChampionship[];
      setLiveAuctions(
        champList.filter((c: TeamChampionship) => c.stage === 'AUCTION_STAGE' || c.stage === 'AUCTION_PAUSED')
      );
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to load live or finished scores:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchScores();
    const interval = setInterval(fetchScores, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchScores();
  };

  // Helper parser for match scorecards
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

  const parsedFinishedMatches = useMemo(() => {
    return allScores
      .map(parseMatchCard)
      .filter((m) => m.isFinished || !liveScores.some((l) => l.matchUuid === m.matchUuid));
  }, [allScores, liveScores]);

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

  const displayedLiveMatches = useMemo(() => {
    const filtered = filterBySearch(parsedLiveMatches);
    return [...filtered].sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0));
  }, [parsedLiveMatches, searchQuery]);

  const displayedFinishedMatches = useMemo(() => {
    const filtered = filterBySearch(parsedFinishedMatches);
    return [...filtered].sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0));
  }, [parsedFinishedMatches, searchQuery]);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-black">
      {/* ══════════════════════════════════════════════════════════════════════
          1. MOBILE VIEW ONLY (< md)
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="block md:hidden pb-24 overflow-y-auto">
        {/* Mobile Header */}
        <header className="px-4 py-3 border-b border-foreground/10 bg-surface/85 backdrop-blur-md sticky top-0 z-20 flex justify-between items-center safe-header">
          <div className="flex items-center gap-2.5">
            <Link
              href="/home"
              className="w-8 h-8 rounded-lg border border-foreground/10 flex items-center justify-center text-foreground/80 hover:text-foreground active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-sm font-black uppercase tracking-wide flex items-center gap-1.5 text-foreground">
                <Radio className="w-4 h-4 text-red-500 animate-pulse" /> Live Match Radar
              </h1>
              <p className="text-text-muted font-medium text-[10px] leading-tight">
                Real-time scores &amp; courtside streams
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleManualRefresh}
              disabled={refreshing}
              className="w-8 h-8 rounded-lg border border-foreground/10 flex items-center justify-center text-foreground/60 active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </header>

        {/* Mobile Search & Tabs */}
        <main className="p-3.5 space-y-3.5 max-w-lg mx-auto">
          {/* Search Bar */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl border text-xs"
            style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
          >
            <Search className="w-4 h-4 text-foreground/40 shrink-0" />
            <input
              type="text"
              placeholder="Search player, tournament, court..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs text-foreground placeholder:text-foreground/40 focus:outline-none w-full"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-foreground/40 p-0.5">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Segmented Controls */}
          <div
            className="flex p-1 rounded-xl border grid grid-cols-2 gap-1 shadow-xs"
            style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
          >
            <button
              onClick={() => setActiveTab('live')}
              className={`py-2 px-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 ${
                activeTab === 'live'
                  ? 'bg-red-500 text-white shadow-xs'
                  : 'text-foreground/60 hover:text-foreground hover:bg-white/5'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  displayedLiveMatches.length > 0 ? 'bg-white animate-pulse' : 'bg-foreground/30'
                }`}
              />
              <span>Live Now ({displayedLiveMatches.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('finished')}
              className={`py-2 px-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 ${
                activeTab === 'finished'
                  ? 'bg-primary text-black shadow-xs'
                  : 'text-foreground/60 hover:text-foreground hover:bg-white/5'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Results ({displayedFinishedMatches.length})</span>
            </button>
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="py-12 text-center text-foreground/50">
              <div className="w-7 h-7 border-3 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-2.5" />
              <p className="text-[11px] font-bold uppercase tracking-wider">Connecting to Match Radar...</p>
            </div>
          )}

          {/* Mobile Live Feed */}
          {!loading && activeTab === 'live' && (
            <div className="space-y-3.5 animate-in fade-in duration-300">
              {/* Live Auctions Bar if any */}
              {liveAuctions.map((champ) => (
                <div
                  key={champ.championshipUuid}
                  className="rounded-2xl border p-3.5 space-y-2 relative overflow-hidden bg-gradient-to-br from-red-500/10 via-transparent to-transparent shadow-xs"
                  style={{
                    backgroundColor: 'var(--athlon-card)',
                    borderColor: 'rgba(239, 68, 68, 0.4)',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-red-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                      Live Auction Floor
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 text-[8.5px] font-black uppercase">
                      Broadcasting
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-foreground">{champ.name}</h3>
                  <Link
                    href={`/home/team-championship/${champ.championshipUuid}/auction`}
                    className="w-full py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Gavel className="w-3.5 h-3.5" />
                    <span>Enter Live Auction Floor</span>
                  </Link>
                </div>
              ))}

              {displayedLiveMatches.length === 0 && liveAuctions.length === 0 ? (
                <div
                  className="rounded-2xl border p-8 text-center space-y-3 shadow-xs"
                  style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                >
                  <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mx-auto">
                    <Radio className="w-5 h-5 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-black text-foreground">No Matches Currently Live</p>
                    <p className="text-xs text-foreground/60 max-w-xs mx-auto">
                      Real-time umpire scoresheets and streams broadcast here as tournament rounds begin.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('finished')}
                    className="px-4 py-2 bg-primary text-black text-xs font-black rounded-xl uppercase tracking-wider"
                  >
                    View Completed Results ({displayedFinishedMatches.length})
                  </button>
                </div>
              ) : (
                displayedLiveMatches.map((match) => (
                  <div
                    key={match.id || match.matchUuid}
                    className="rounded-2xl border p-4 space-y-3 relative overflow-hidden shadow-xs"
                    style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                  >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-red-500 animate-pulse" />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-red-500 font-black text-xs">LIVE</span>
                        <span className="text-foreground/70 font-bold text-xs">{match.status}</span>
                      </div>
                      <span className="text-foreground/50 text-xs font-semibold">{match.court}</span>
                    </div>

                    <div className="text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold text-foreground/60 uppercase tracking-widest bg-surface border border-foreground/5">
                        {match.tournament} • {match.category}
                      </span>
                    </div>

                    {/* Head to head scoreboard */}
                    <div className="flex items-center justify-between px-2 py-1">
                      <div className="flex flex-col items-center gap-1 max-w-[100px]">
                        <span className="font-bold text-xs uppercase text-center line-clamp-1">
                          {match.player1.name}
                        </span>
                        <span className="text-2xl font-black text-primary font-mono tabular-nums">
                          {match.player1.currentScore}
                        </span>
                      </div>

                      <div className="flex flex-col items-center gap-0.5">
                        <div className="px-2 py-0.5 rounded-md bg-foreground/10 text-xs font-mono font-black">
                          {match.player1.gamesWon} - {match.player2.gamesWon}
                        </div>
                        <span className="text-[9px] font-bold text-foreground/40 uppercase">Games</span>
                      </div>

                      <div className="flex flex-col items-center gap-1 max-w-[100px]">
                        <span className="font-bold text-xs uppercase text-center line-clamp-1">
                          {match.player2.name}
                        </span>
                        <span className="text-2xl font-black text-foreground font-mono tabular-nums">
                          {match.player2.currentScore}
                        </span>
                      </div>
                    </div>

                    <Link
                      href={`/home/live-score/${match.matchUuid}`}
                      className="w-full py-2.5 bg-red-500 text-white rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all"
                    >
                      <span>Watch Live Stream &amp; Scoring</span>
                      <Tv className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Mobile Finished Results Feed */}
          {!loading && activeTab === 'finished' && (
            <div className="space-y-3.5 animate-in fade-in duration-300">
              {displayedFinishedMatches.length === 0 ? (
                <div
                  className="rounded-2xl border p-8 text-center space-y-2 shadow-xs"
                  style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                >
                  <Trophy className="w-10 h-10 text-foreground/30 mx-auto" />
                  <p className="text-sm font-black uppercase text-foreground">No Results Found</p>
                  <p className="text-xs text-foreground/60 max-w-xs mx-auto">
                    Completed tournament scorecards will be listed here.
                  </p>
                </div>
              ) : (
                displayedFinishedMatches.map((match) => (
                  <Link
                    key={match.id || match.matchUuid}
                    href={`/home/live-score/${match.matchUuid}`}
                    className="block p-4 rounded-2xl border space-y-3 shadow-xs hover:border-primary/40 transition-all"
                    style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                  >
                    <div className="flex items-center justify-between text-xs text-foreground/50">
                      <span className="font-bold truncate max-w-[200px]">{match.tournament}</span>
                      <span className="font-mono">{match.court}</span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-sm font-bold truncate ${
                            match.player1.isWinner ? 'text-primary font-black' : 'text-foreground'
                          }`}
                        >
                          {match.player1.name} {match.player1.isWinner ? '🏆' : ''}
                        </span>
                        <span className="font-mono font-bold text-sm text-foreground">
                          {match.player1.gamesWon}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span
                          className={`text-sm font-bold truncate ${
                            match.player2.isWinner ? 'text-primary font-black' : 'text-foreground'
                          }`}
                        >
                          {match.player2.name} {match.player2.isWinner ? '🏆' : ''}
                        </span>
                        <span className="font-mono font-bold text-sm text-foreground">
                          {match.player2.gamesWon}
                        </span>
                      </div>
                    </div>

                    {match.gamesList.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-foreground/5">
                        <span className="text-[10px] font-bold text-foreground/40 uppercase">Sets:</span>
                        {match.gamesList.map((g: any, gIdx: number) => (
                          <span
                            key={gIdx}
                            className="px-1.5 py-0.2 rounded bg-surface border border-foreground/10 text-[10px] font-mono font-bold"
                          >
                            {g.scoreA ?? 0}-{g.scoreB ?? 0}
                          </span>
                        ))}
                      </div>
                    )}
                  </Link>
                ))
              )}
            </div>
          )}
        </main>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          2. DESKTOP VIEW ONLY (hidden on mobile, visible on md and above)
             - TELEMETRY HUD + 3-COLUMN LIVE SCOREBOARD GRID (NO PUBLIC NAVBAR)
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="hidden md:block min-h-screen pb-24 bg-background">
        {/* Ambient Desktop Hero Banner & Telemetry HUD */}
        <section
          className="relative w-full border-b overflow-hidden"
          style={{
            backgroundColor: 'var(--athlon-surface)',
            borderColor: 'var(--athlon-border)',
          }}
        >
          {/* Subtle Ambient Radar Glows */}
          <div className="absolute top-0 right-1/4 w-[450px] h-[300px] bg-red-500/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-8 space-y-6">
            {/* Header + Telemetry Row */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Left Title Area */}
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center gap-2">
                  <Link
                    href="/home"
                    className="w-9 h-9 rounded-xl border flex items-center justify-center transition-all shadow-xs active:scale-95 shrink-0 hover:bg-white/5 cursor-pointer text-foreground/80 hover:text-foreground mr-1"
                    style={{
                      backgroundColor: 'var(--athlon-card)',
                      borderColor: 'var(--athlon-border)',
                    }}
                    title="Return to Athlete Workspace"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Link>

                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500/10 border border-red-500/25 text-red-400">
                    <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                    Courtside Match Radar &amp; Telemetry
                  </div>

                  <button
                    onClick={handleManualRefresh}
                    disabled={refreshing}
                    className="w-9 h-9 rounded-xl border flex items-center justify-center transition-all active:scale-95 cursor-pointer hover:bg-white/5"
                    style={{
                      backgroundColor: 'var(--athlon-card)',
                      borderColor: 'var(--athlon-border)',
                    }}
                    title="Sync real-time scoreboard"
                  >
                    <RefreshCw
                      className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-red-400' : 'text-primary'}`}
                    />
                  </button>
                </div>

                <h1 className="text-3xl lg:text-4xl font-black text-foreground tracking-tight uppercase">
                  Live Match Arena &amp; Scoresheets
                </h1>
                <p className="text-sm text-foreground/60 leading-relaxed font-medium">
                  Track real-time point-by-point scoring, set rallies, umpire decisions, and official match scorecards.
                </p>
              </div>

              {/* Right: 4 Telemetry HUD Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
                {/* Live In-Play */}
                <div
                  className="p-4 rounded-2xl border flex flex-col justify-between min-w-[130px] shadow-xs"
                  style={{
                    backgroundColor: 'var(--athlon-card)',
                    borderColor: displayedLiveMatches.length > 0 ? 'rgba(239, 68, 68, 0.4)' : 'var(--athlon-border)',
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-red-400">Live Now</span>
                    <Radio className="w-4 h-4 text-red-500 animate-pulse" />
                  </div>
                  <div className="text-2xl font-black font-mono text-red-400">{displayedLiveMatches.length}</div>
                  <span className="text-[10px] text-foreground/50 font-medium">Courts broadcasting</span>
                </div>

                {/* Final Results */}
                <div
                  className="p-4 rounded-2xl border flex flex-col justify-between min-w-[130px] shadow-xs"
                  style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">Results</span>
                    <Trophy className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-black font-mono text-foreground">{displayedFinishedMatches.length}</div>
                  <span className="text-[10px] text-foreground/50 font-medium">Official scorecards</span>
                </div>

                {/* Live Auctions */}
                <div
                  className="p-4 rounded-2xl border flex flex-col justify-between min-w-[130px] shadow-xs"
                  style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">Auctions</span>
                    <Gavel className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl font-black font-mono text-foreground">{liveAuctions.length}</div>
                  <span className="text-[10px] text-foreground/50 font-medium">Bidding floors open</span>
                </div>

                {/* Total Fixtures */}
                <div
                  className="p-4 rounded-2xl border flex flex-col justify-between min-w-[130px] shadow-xs"
                  style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-primary">Radar</span>
                    <Zap className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-2xl font-black font-mono text-foreground">{allScores.length}</div>
                  <span className="text-[10px] text-foreground/50 font-medium">5s auto-polling</span>
                </div>
              </div>
            </div>

            {/* Segmented Control & Live Search Toolbar */}
            <div className="pt-2 flex items-center justify-between gap-4 flex-wrap border-t border-foreground/5">
              {/* Tabs */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('live')}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 border ${
                    activeTab === 'live'
                      ? 'bg-red-500 text-white border-red-500 shadow-md shadow-red-500/20 scale-[1.02]'
                      : 'text-foreground/70 hover:text-foreground hover:bg-white/5'
                  }`}
                  style={{
                    backgroundColor: activeTab === 'live' ? undefined : 'var(--athlon-card)',
                    borderColor: activeTab === 'live' ? undefined : 'var(--athlon-border)',
                  }}
                >
                  <Radio className={`w-3.5 h-3.5 ${displayedLiveMatches.length > 0 ? 'animate-pulse' : ''}`} />
                  <span>Live Matches In-Play</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md font-bold ${
                      activeTab === 'live' ? 'bg-black/25 text-white' : 'bg-surface text-foreground/60'
                    }`}
                  >
                    {displayedLiveMatches.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('finished')}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 border ${
                    activeTab === 'finished'
                      ? 'bg-primary text-black border-primary shadow-sm shadow-primary/20 scale-[1.02]'
                      : 'text-foreground/70 hover:text-foreground hover:bg-white/5'
                  }`}
                  style={{
                    backgroundColor: activeTab === 'finished' ? 'var(--athlon-primary)' : 'var(--athlon-card)',
                    borderColor: activeTab === 'finished' ? 'var(--athlon-primary)' : 'var(--athlon-border)',
                  }}
                >
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Completed Results</span>
                  <span
                    className="text-[10px] font-mono px-1.5 py-0.2 rounded-md font-bold"
                    style={{
                      backgroundColor: activeTab === 'finished' ? 'rgba(0,0,0,0.2)' : 'var(--athlon-surface)',
                      color: activeTab === 'finished' ? '#000' : 'var(--athlon-text-muted)',
                    }}
                  >
                    {displayedFinishedMatches.length}
                  </span>
                </button>

                {liveAuctions.length > 0 && (
                  <button
                    onClick={() => setActiveTab('auctions')}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 border ${
                      activeTab === 'auctions'
                        ? 'bg-amber-500 text-black border-amber-500 shadow-sm shadow-amber-500/20 scale-[1.02]'
                        : 'text-foreground/70 hover:text-foreground hover:bg-white/5'
                    }`}
                    style={{
                      backgroundColor: activeTab === 'auctions' ? undefined : 'var(--athlon-card)',
                      borderColor: activeTab === 'auctions' ? undefined : 'var(--athlon-border)',
                    }}
                  >
                    <Gavel className="w-3.5 h-3.5" />
                    <span>Live Auctions</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md font-bold bg-black/20 text-black">
                      {liveAuctions.length}
                    </span>
                  </button>
                )}
              </div>

              {/* Search Bar */}
              <div
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl border w-72 shadow-xs transition-colors focus-within:border-red-500/50"
                style={{
                  backgroundColor: 'var(--athlon-card)',
                  borderColor: 'var(--athlon-border)',
                }}
              >
                <Search className="w-3.5 h-3.5 text-foreground/40 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search player, tournament, court..."
                  className="bg-transparent text-xs text-foreground placeholder:text-foreground/40 focus:outline-none w-full"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-foreground/40 hover:text-foreground p-0.5 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Desktop Main Content Feed */}
        <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8 space-y-8">
          {/* TAB 1: LIVE MATCHES */}
          {activeTab === 'live' && (
            <div className="space-y-6">
              {/* Live Auctions Banner if any */}
              {liveAuctions.map((champ) => (
                <div
                  key={champ.championshipUuid}
                  className="rounded-3xl border p-6 space-y-3 relative overflow-hidden bg-gradient-to-r from-red-500/15 via-transparent to-transparent shadow-sm"
                  style={{
                    backgroundColor: 'var(--athlon-card)',
                    borderColor: 'rgba(239, 68, 68, 0.4)',
                  }}
                >
                  <div className="h-1 w-full bg-gradient-to-r from-red-500 via-rose-500 to-amber-400 absolute top-0 left-0 right-0 animate-pulse" />

                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                        <span className="text-red-400 font-black text-xs uppercase tracking-wider">
                          LIVE PLAYER AUCTION FLOOR BROADCASTING
                        </span>
                      </div>
                      <h3 className="text-lg font-black text-foreground">{champ.name}</h3>
                      <p className="text-xs text-foreground/60">
                        {champ.location || champ.venue || 'Championship Tournament'} • Squad Bidding Floor &amp; Live Draft
                      </p>
                    </div>

                    <Link
                      href={`/home/team-championship/${champ.championshipUuid}/auction`}
                      className="px-5 py-2.5 bg-gradient-to-r from-red-500 via-rose-500 to-primary text-white font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-md shadow-red-500/25 hover:brightness-110 active:scale-95 transition-all"
                    >
                      <Gavel className="w-4 h-4" />
                      <span>Enter Live Auction Floor</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}

              {displayedLiveMatches.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayedLiveMatches.map((match) => (
                    <div
                      key={match.id || match.matchUuid}
                      className="p-6 rounded-3xl border relative overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition-all group"
                      style={{
                        backgroundColor: 'var(--athlon-card)',
                        borderColor: 'var(--athlon-border)',
                      }}
                    >
                      {/* Top Pulsing Live Accent Line */}
                      <div className="h-1 w-full bg-red-500 absolute top-0 left-0 right-0 animate-pulse" />

                      <div className="space-y-4">
                        {/* Meta Line */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-xs font-black uppercase tracking-wider text-red-500">LIVE NOW</span>
                            <span className="text-xs font-bold text-foreground/70">{match.status}</span>
                          </div>
                          <span className="text-xs text-foreground/50 font-mono font-semibold">{match.court}</span>
                        </div>

                        {/* Tournament & Category Tag */}
                        <div className="text-center">
                          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-surface border border-foreground/10 text-foreground/70">
                            {match.tournament} • {match.category}
                          </span>
                        </div>

                        {/* Head-to-Head Telemetry Board */}
                        <div
                          className="p-4 rounded-2xl border flex items-center justify-between"
                          style={{
                            backgroundColor: 'var(--athlon-surface)',
                            borderColor: 'var(--athlon-border)',
                          }}
                        >
                          {/* Player / Team 1 */}
                          <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0 pr-2">
                            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-black text-primary text-sm">
                              {match.player1.avatar}
                            </div>
                            <span className="text-xs font-black uppercase text-center line-clamp-1 truncate w-full">
                              {match.player1.name}
                            </span>
                            <span className="text-3xl font-black text-primary font-mono tabular-nums leading-none">
                              {match.player1.currentScore}
                            </span>
                          </div>

                          {/* VS & Game Score */}
                          <div className="flex flex-col items-center gap-1 shrink-0 px-3 border-x border-foreground/5">
                            <div className="px-3 py-1 rounded-lg bg-black/30 border border-foreground/10 text-xs font-mono font-black text-foreground">
                              {match.player1.gamesWon} - {match.player2.gamesWon}
                            </div>
                            <span className="text-[9px] font-extrabold uppercase text-foreground/40 tracking-wider">
                              Games
                            </span>
                          </div>

                          {/* Player / Team 2 */}
                          <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0 pl-2">
                            <div className="w-10 h-10 rounded-full bg-foreground/10 border border-foreground/20 flex items-center justify-center font-black text-foreground text-sm">
                              {match.player2.avatar}
                            </div>
                            <span className="text-xs font-black uppercase text-center line-clamp-1 truncate w-full">
                              {match.player2.name}
                            </span>
                            <span className="text-3xl font-black text-foreground font-mono tabular-nums leading-none">
                              {match.player2.currentScore}
                            </span>
                          </div>
                        </div>

                        {/* Sets Breakdown */}
                        {match.gamesList.length > 0 && (
                          <div className="flex items-center gap-1.5 justify-center flex-wrap text-xs text-foreground/60">
                            <span className="text-[10px] font-bold uppercase text-foreground/40">Sets:</span>
                            {match.gamesList.map((g: any, gIdx: number) => (
                              <span
                                key={gIdx}
                                className="px-2 py-0.5 rounded bg-surface border border-foreground/10 text-xs font-mono font-bold"
                              >
                                {g.scoreA ?? 0}-{g.scoreB ?? 0}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Card Action Link */}
                      <Link
                        href={`/home/live-score/${match.matchUuid}`}
                        className="w-full mt-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all group-hover:scale-[1.01]"
                      >
                        <span>Watch Live Stream &amp; Scoring</span>
                        <Tv className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                /* Empty Live Matches State */
                <div
                  className="p-12 rounded-3xl border text-center flex flex-col items-center justify-center max-w-lg mx-auto shadow-xs space-y-4"
                  style={{
                    backgroundColor: 'var(--athlon-card)',
                    borderColor: 'var(--athlon-border)',
                  }}
                >
                  <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/25 flex items-center justify-center text-red-400">
                    <Radio className="w-8 h-8 animate-pulse" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-base font-black uppercase tracking-tight text-foreground">
                      No Matches Currently Live
                    </h3>
                    <p className="text-xs text-foreground/60 max-w-xs leading-relaxed font-medium">
                      There are no active point-by-point scoreboards broadcasting on the radar right now. Check back when tournament rounds begin or view completed scorecards.
                    </p>
                  </div>

                  <button
                    onClick={() => setActiveTab('finished')}
                    className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-primary text-black transition-all active:scale-95 cursor-pointer shadow-sm"
                  >
                    View Completed Results ({displayedFinishedMatches.length})
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: COMPLETED RESULTS */}
          {activeTab === 'finished' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tight text-foreground">
                    Completed Tournament Results ({displayedFinishedMatches.length})
                  </h2>
                  <p className="text-xs text-foreground/50">
                    Official match scorecards, head-to-head outcomes, and verified winners
                  </p>
                </div>
              </div>

              {displayedFinishedMatches.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayedFinishedMatches.map((match) => (
                    <div
                      key={match.id || match.matchUuid}
                      className="p-6 rounded-3xl border relative overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition-all group"
                      style={{
                        backgroundColor: 'var(--athlon-card)',
                        borderColor: 'var(--athlon-border)',
                      }}
                    >
                      <div className="h-1 w-full bg-emerald-500 absolute top-0 left-0 right-0" />

                      <div className="space-y-3.5">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                            Final Result
                          </span>
                          <span className="text-xs font-mono text-foreground/50">{match.court}</span>
                        </div>

                        <div>
                          <span className="text-[10px] uppercase font-bold text-foreground/40 block">
                            Tournament
                          </span>
                          <h3 className="text-sm font-black text-foreground truncate">{match.tournament}</h3>
                        </div>

                        {/* Head-to-Head Result Box */}
                        <div
                          className="p-3.5 rounded-2xl border space-y-2"
                          style={{
                            backgroundColor: 'var(--athlon-surface)',
                            borderColor: 'var(--athlon-border)',
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-xs font-bold truncate ${
                                match.player1.isWinner ? 'text-primary font-black' : 'text-foreground/80'
                              }`}
                            >
                              {match.player1.name} {match.player1.isWinner ? '🏆' : ''}
                            </span>
                            <span className="text-sm font-black font-mono text-foreground">
                              {match.player1.gamesWon}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span
                              className={`text-xs font-bold truncate ${
                                match.player2.isWinner ? 'text-primary font-black' : 'text-foreground/80'
                              }`}
                            >
                              {match.player2.name} {match.player2.isWinner ? '🏆' : ''}
                            </span>
                            <span className="text-sm font-black font-mono text-foreground">
                              {match.player2.gamesWon}
                            </span>
                          </div>
                        </div>

                        {/* Sets Breakdown */}
                        {match.gamesList.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap text-xs text-foreground/60">
                            <span className="text-[10px] font-bold uppercase text-foreground/40">Sets:</span>
                            {match.gamesList.map((g: any, gIdx: number) => (
                              <span
                                key={gIdx}
                                className="px-2 py-0.5 rounded bg-surface border border-foreground/10 text-xs font-mono font-bold"
                              >
                                {g.scoreA ?? 0}-{g.scoreB ?? 0}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <Link
                        href={`/home/live-score/${match.matchUuid}`}
                        className="flex items-center justify-between pt-4 mt-4 border-t text-xs font-bold text-primary hover:underline"
                        style={{ borderColor: 'var(--athlon-border)' }}
                      >
                        <span>Official Scorecard Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  className="p-12 rounded-3xl border text-center flex flex-col items-center justify-center max-w-lg mx-auto shadow-xs space-y-3"
                  style={{
                    backgroundColor: 'var(--athlon-card)',
                    borderColor: 'var(--athlon-border)',
                  }}
                >
                  <Trophy className="w-12 h-12 text-foreground/30 mx-auto" />
                  <h3 className="text-base font-black uppercase tracking-tight text-foreground">
                    No Completed Matches Found
                  </h3>
                  <p className="text-xs text-foreground/60 max-w-xs leading-relaxed font-medium">
                    {searchQuery
                      ? `No finished matches matching "${searchQuery}".`
                      : 'Completed match summaries and verified scorecards will appear here.'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: LIVE AUCTIONS */}
          {activeTab === 'auctions' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tight text-foreground">
                    Live Player Auction Rooms ({liveAuctions.length})
                  </h2>
                  <p className="text-xs text-foreground/50">
                    Real-time team championship player bidding, purse balances, and draft logs
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {liveAuctions.map((champ) => (
                  <div
                    key={champ.championshipUuid}
                    className="p-6 rounded-3xl border relative overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition-all group"
                    style={{
                      backgroundColor: 'var(--athlon-card)',
                      borderColor: 'var(--athlon-border)',
                    }}
                  >
                    <div className="h-1 w-full bg-gradient-to-r from-red-500 via-rose-500 to-amber-400 absolute top-0 left-0 right-0 animate-pulse" />

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500/15 text-red-400 border border-red-500/25 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                          Auction Active
                        </span>
                        <span className="text-xs font-mono text-foreground/50">{champ.sport || 'Badminton'}</span>
                      </div>

                      <h3 className="text-base font-black text-foreground">{champ.name}</h3>
                      <p className="text-xs text-foreground/60 font-medium">
                        {champ.location || champ.venue || 'Championship Arena'}
                      </p>
                    </div>

                    <Link
                      href={`/home/team-championship/${champ.championshipUuid}/auction`}
                      className="w-full mt-4 py-2.5 bg-gradient-to-r from-red-500 via-rose-500 to-primary text-white font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-xs transition-transform active:scale-95"
                    >
                      <Gavel className="w-3.5 h-3.5" />
                      <span>Enter Auction Room</span>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `,
        }}
      />
    </div>
  );
}

