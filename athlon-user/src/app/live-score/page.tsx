'use client';

import { useState, useEffect } from 'react';
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
  CheckCircle2,
  Medal,
  Calendar,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { ScoreService, LiveScore } from '@/lib/api/scores';

export default function LiveScorePage() {
  const [activeTab, setActiveTab] = useState<'live' | 'finished'>('live');
  const [liveScores, setLiveScores] = useState<LiveScore[]>([]);
  const [allScores, setAllScores] = useState<LiveScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const [liveRes, allRes] = await Promise.all([
          ScoreService.getLive().catch(() => ({ data: [] })),
          ScoreService.getAll().catch(() => ({ data: [] })),
        ]);

        if (liveRes && liveRes.data) {
          setLiveScores(liveRes.data);
        }
        if (allRes && allRes.data) {
          setAllScores(allRes.data);
        }
      } catch (err) {
        console.error('Failed to load live/finished scores', err);
      } finally {
        setLoading(false);
      }
    };

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

  const parsedLiveMatches = liveScores.map(parseMatchCard);

  // Finished matches are those with isFinal or where games completed
  const parsedFinishedMatches = allScores
    .map(parseMatchCard)
    .filter((m) => m.isFinished || !liveScores.some((l) => l.matchUuid === m.matchUuid));

  // Search filter
  const filterBySearch = (matches: ReturnType<typeof parseMatchCard>[]) => {
    if (!searchQuery.trim()) return matches;
    const q = searchQuery.toLowerCase();
    return matches.filter(
      (m) =>
        m.player1.name.toLowerCase().includes(q) ||
        m.player2.name.toLowerCase().includes(q) ||
        m.tournament.toLowerCase().includes(q)
    );
  };

  const displayedLiveMatches = filterBySearch(parsedLiveMatches);
  const displayedFinishedMatches = filterBySearch(parsedFinishedMatches);

  return (
    <div className="min-h-screen w-full bg-background text-foreground font-sans pb-24 overflow-y-auto selection:bg-[#EF4444] selection:text-white">
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

        <div className="relative">
          {/* <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search match..."
            className="w-32 sm:w-44 px-3 py-1.5 rounded-xl border text-xs bg-surface border-foreground/10 focus:outline-none focus:border-red-500 transition-all"
          /> */}
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

        {/* ── LIVE TAB ────────────────────────────────────────────────── */}
        {!loading && activeTab === 'live' && (
          <div className="space-y-5 animate-in fade-in duration-300">
            {displayedLiveMatches.length === 0 ? (
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

        {/* ── FINISHED RESULTS TAB ─────────────────────────────────────── */}
        {!loading && activeTab === 'finished' && (
          <div className="space-y-4 animate-in fade-in duration-300">
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
              <div className="space-y-4">
                {displayedFinishedMatches.map((match, idx) => (
                  <Link
                    key={match.id || match.matchUuid || idx}
                    href={`/live-score/${match.matchUuid}`}
                    className="block rounded-2xl border p-5 shadow-md space-y-4 relative overflow-hidden transition-all hover:border-primary/50 group"
                    style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                  >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />

                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> COMPLETED
                        </span>
                        <span className="text-[11px] text-foreground/50 font-medium">{match.tournament}</span>
                      </div>
                      <span className="text-[10px] uppercase font-bold text-foreground/45">{match.category}</span>
                    </div>

                    {/* Team Rows */}
                    <div
                      className="p-3.5 rounded-xl border space-y-2.5"
                      style={{
                        backgroundColor: 'var(--athlon-surface)',
                        borderColor: 'var(--athlon-border-subtle)',
                      }}
                    >
                      {/* Team A */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-xs text-primary shrink-0">
                            {match.player1.avatar}
                          </div>
                          <span
                            className={`text-xs font-black truncate max-w-[200px] ${
                              match.player1.isWinner ? 'text-foreground font-black' : 'text-foreground/70'
                            }`}
                          >
                            {match.player1.name}
                          </span>
                          {match.player1.isWinner && (
                            <Trophy className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20 shrink-0" />
                          )}
                        </div>

                        <span
                          className={`text-sm font-black font-mono tabular-nums ${
                            match.player1.isWinner ? 'text-emerald-400' : 'text-foreground/60'
                          }`}
                        >
                          {match.player1.gamesWon}
                        </span>
                      </div>

                      {/* Team B */}
                      <div
                        className="flex items-center justify-between border-t pt-2.5"
                        style={{ borderColor: 'var(--athlon-border-subtle)' }}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-bold text-xs text-foreground/70 shrink-0">
                            {match.player2.avatar}
                          </div>
                          <span
                            className={`text-xs font-black truncate max-w-[200px] ${
                              match.player2.isWinner ? 'text-foreground font-black' : 'text-foreground/70'
                            }`}
                          >
                            {match.player2.name}
                          </span>
                          {match.player2.isWinner && (
                            <Trophy className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20 shrink-0" />
                          )}
                        </div>

                        <span
                          className={`text-sm font-black font-mono tabular-nums ${
                            match.player2.isWinner ? 'text-emerald-400' : 'text-foreground/60'
                          }`}
                        >
                          {match.player2.gamesWon}
                        </span>
                      </div>
                    </div>

                    {/* Set Breakdown if available */}
                    <div className="flex items-center justify-between pt-1 border-t" style={{ borderColor: 'var(--athlon-border-subtle)' }}>
                      {match.gamesList.length > 0 ? (
                        <div className="flex items-center gap-2 flex-wrap text-[10px] text-foreground/60">
                          <span className="font-extrabold uppercase tracking-wider text-foreground/40">Sets:</span>
                          {match.gamesList.map((g: any, gIdx: number) => (
                            <span
                              key={gIdx}
                              className="px-2 py-0.5 rounded bg-white/5 border border-white/10 font-mono font-bold"
                            >
                              {g.scoreA ?? 0} - {g.scoreB ?? 0}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[10px] text-foreground/40 font-bold uppercase tracking-wider">Match Completed</span>
                      )}

                      <span className="text-[10px] font-bold text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        VIEW SCORECARD <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
