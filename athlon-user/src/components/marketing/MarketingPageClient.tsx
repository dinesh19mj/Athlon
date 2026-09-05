'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  LogIn,
  ArrowRight,
  Building2,
  Trophy,
  Building,
  CalendarDays,
  Calendar,
  MapPin,
  Tv,
  ChevronRight,
  Sparkles,
  Home,
  User,
  CheckCircle2,
  Shield,
  Search,
  Flame,
  Swords,
  Layers,
  ArrowUpRight,
  Gavel,
  Check,
  Zap,
  Radio,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { ScoreService, LiveScore, isTournamentScore } from '@/lib/api/scores';
import { TournamentService, Tournament } from '@/lib/api/tournaments';
import { TeamChampionshipService, TeamChampionship } from '@/lib/api/teamChampionship';
import { PublicTournamentCard } from '@/components/tournaments/PublicTournamentCard';
import { PublicTeamChampionshipCard } from '@/components/tournaments/PublicTeamChampionshipCard';
import { useAthlonTheme } from '@/hooks/use-athlon-theme';
import { getThemeVideo } from '@/config/theme';

import { Athlon3DIcon } from '@/components/common/Athlon3DIcon';

export function MarketingPageClient() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { themeKey } = useAthlonTheme();
  const backgroundVideo = getThemeVideo(themeKey);

  const [liveScores, setLiveScores] = useState<LiveScore[]>([]);
  const [finishedScores, setFinishedScores] = useState<LiveScore[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [championships, setChampionships] = useState<TeamChampionship[]>([]);
  const [loadingTournaments, setLoadingTournaments] = useState(true);
  const [desktopFilter, setDesktopFilter] = useState<'all' | 'championships' | 'tournaments'>('all');

  useEffect(() => {
    // 1. Fetch live + finished scores
    const fetchScores = () => {
      if (typeof document !== 'undefined' && document.hidden) return;
      ScoreService.getLive()
        .then((res: any) => {
          if (res && res.data) {
            const tournamentLive = res.data.filter(isTournamentScore);
            setLiveScores(tournamentLive);
          }
        })
        .catch(() => {});

      ScoreService.getAll()
        .then((res: any) => {
          if (res?.data) {
            const tournamentScores = res.data.filter(isTournamentScore);
            const finished = tournamentScores.filter((s: LiveScore) => {
              const m = s.scoreMeta || {};
              const games = m.games || [];
              const wonA = games.filter((g: any) => g.winner === 'A').length;
              const wonB = games.filter((g: any) => g.winner === 'B').length;
              return s.isFinal === true || m.isCompleted === true || wonA >= 2 || wonB >= 2 || (games.length > 0 && !s.isActive);
            });
            setFinishedScores(finished);
          }
        })
        .catch(() => {});
    };

    fetchScores();
    const interval = setInterval(fetchScores, 15000);

    // 2. Fetch all public tournaments and team championships
    TournamentService.getAll()
      .then((res) => {
        const publicList = (res.data || []).filter((t: Tournament) => t.visibility === 'PUBLIC');
        setTournaments(publicList);
      })
      .catch((err) => console.error('Failed to load tournaments in marketing client', err))
      .finally(() => setLoadingTournaments(false));

    const loadPublicChampionships = () => {
      if (typeof document !== 'undefined' && document.hidden) return;
      TeamChampionshipService.getAllPublic()
        .then((res: any) => {
          const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
          setChampionships(list);
        })
        .catch((err) => {
          console.warn('Temporary issue fetching team championships:', err?.message || err);
        });
    };

    loadPublicChampionships();
    const champInterval = setInterval(loadPublicChampionships, 15000);

    return () => {
      clearInterval(interval);
      clearInterval(champInterval);
    };
  }, []);

  const currentLive = liveScores[0];
  const liveAuctionChampionships = championships.filter(
    (c) => c.stage === 'AUCTION_STAGE' || c.stage === 'AUCTION_PAUSED' || c.stage === 'AUCTION'
  );
  const meta = currentLive?.scoreMeta || {};
  const teamAName = meta.config?.teamAName || (meta.config?.teamA ? meta.config.teamA.join(' & ') : 'Team A');
  const teamBName = meta.config?.teamBName || (meta.config?.teamB ? meta.config.teamB.join(' & ') : 'Team B');
  const currentGameIndex = meta.currentGameIndex || 0;
  const games = meta.games || [];
  const currentGame = games[currentGameIndex] || {};
  const scoreA = currentGame.scoreA ?? (currentLive?.teamAScore || 0);
  const scoreB = currentGame.scoreB ?? (currentLive?.teamBScore || 0);
  const tournamentName = meta.config?.tournamentName || 'Tournament Match';
  const category = meta.config?.category || 'Doubles';
  const courtName = meta.config?.courtName || 'Court 1';

  const mobileCategories: Array<{ id: 'tournaments' | 'academies' | 'bookings' | 'live-score'; label: string }> = [
    { id: 'tournaments', label: 'Tournaments' },
    { id: 'academies', label: 'Academies' },
    { id: 'bookings', label: 'Bookings' },
    { id: 'live-score', label: 'Live Score' },
  ];

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-background text-foreground font-sans selection:bg-primary selection:text-black relative">
      {/* ══════════════════════════════════════════════════════════════════════
          1. MOBILE VIEW ONLY (hidden on md and above) - EXACT ORIGINAL DESIGN
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="block md:hidden pb-28">
        <main className="w-full max-w-lg mx-auto px-4 flex flex-col gap-6 pt-2">
          {/* 1. Hero Banner Carousel */}
          <section
            className="relative w-full min-h-[220px] rounded-[24px] overflow-hidden border shadow-lg"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            {/* Right-positioned video with CSS alpha mask (no hard edges or vertical line) */}
            <div
              className="absolute top-[-10%] right-[-5%] w-[60%] h-[120%] pointer-events-none z-0"
              style={{
                WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,1) 40%, rgba(0,0,0,1) 100%)',
                maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,1) 40%, rgba(0,0,0,1) 100%)',
              }}
            >
              <video
                key={backgroundVideo}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover object-center opacity-85 dark:opacity-60"
              >
                <source src={backgroundVideo} type="video/mp4" />
              </video>
            </div>

            {/* Left side content with solid readability */}
            <div className="relative z-10 p-5 sm:p-6 flex flex-col justify-center h-full w-full max-w-[75%] sm:max-w-[65%]">
              <h1 className="text-[20px] sm:text-[23px] font-black leading-tight tracking-wide uppercase">
                <span className="text-foreground">Compete Today</span>
                <br />
                <span className="text-primary drop-shadow-[0_2px_12px_var(--athlon-primary-glow)]">Champion Tomorrow</span>
              </h1>
              <p className="text-[11px] sm:text-xs text-foreground/75 mt-2 mb-4 leading-relaxed font-medium">
                Football, Cricket, Badminton & more!
                <br />
                Tournaments & Live Scores in one place.
              </p>
              <div className="flex flex-wrap items-center gap-2.5">
                <Link
                  href="/tournaments"
                  className="flex items-center justify-center gap-1.5 bg-primary text-black text-[10px] sm:text-[11px] font-black px-4 py-2.5 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-[0_4px_16px_var(--athlon-primary-glow)]"
                >
                  BROWSE TOURNAMENTS <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/academies"
                  className="flex items-center justify-center gap-1.5 bg-surface border border-foreground/15 text-foreground text-[10px] sm:text-[11px] font-bold px-3.5 py-2.5 rounded-xl hover:bg-foreground/5 transition-colors shadow-sm"
                >
                  <Building2 className="w-3.5 h-3.5 text-primary" /> FIND ACADEMY
                </Link>
              </div>
            </div>
          </section>

          {/* 2. Primary Categories with 3D Icons (Evenly Spaced with 68px Size) */}
          <section className="flex items-center justify-between w-full pt-1 pb-1 px-1">
            {mobileCategories.map((cat) => {
              const isLiveScore = cat.id === 'live-score';
              const hasLive = isLiveScore && liveScores.length > 0;

              return (
                <Link
                  href={`/${cat.id}`}
                  key={cat.id}
                  className="flex flex-col items-center gap-1.5 shrink-0 group"
                >
                  <div
                    className="relative w-[68px] h-[68px] rounded-[18px] flex flex-col items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 border overflow-hidden"
                    style={{
                      backgroundColor: 'var(--athlon-surface)',
                      borderColor: 'var(--athlon-border)',
                      boxShadow: '0 6px 20px -2px var(--athlon-primary-soft, rgba(0,0,0,0.3)), 0 2px 6px rgba(0,0,0,0.4)',
                    }}
                  >
                    {/* Top Glass Bevel Highlight */}
                    <div className="absolute inset-x-0 top-0 h-[35%] bg-gradient-to-b from-white/[0.08] to-transparent pointer-events-none" />

                    {hasLive && (
                      <span className="absolute top-1.5 right-1.5 flex h-2 w-2 z-10">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                      </span>
                    )}

                    <Athlon3DIcon
                      type={cat.id}
                      size={40}
                    />
                  </div>
                  <span
                    className="text-[10px] font-bold text-center tracking-tight transition-colors group-hover:text-primary"
                    style={{ color: 'var(--athlon-text-secondary)' }}
                  >
                    {cat.label}
                  </span>
                </Link>
              );
            })}
          </section>





          {/* 3. Mobile Live Match Arena Showcase */}
          {liveScores.length > 0 && (
            <section className="pt-1">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                  <h2 className="text-sm font-black uppercase tracking-wider text-foreground">
                    Live Match Arena ({liveScores.length})
                  </h2>
                </div>
                <Link href="/live-score" className="text-xs font-bold text-red-400 hover:underline flex items-center gap-0.5">
                  Live Scores <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="flex items-stretch gap-3 overflow-x-auto pb-3 snap-x scroll-px-4 hide-scrollbar -mx-4 px-4">
                {liveScores.map((score) => {
                  const mMeta = score.scoreMeta || {};
                  const cfg = mMeta.config || {};
                  const mTeamAName = cfg.teamAName || (cfg.teamA ? cfg.teamA.join(' & ') : 'Team A');
                  const mTeamBName = cfg.teamBName || (cfg.teamB ? cfg.teamB.join(' & ') : 'Team B');
                  const mGi = mMeta.currentGameIndex || 0;
                  const mGames = mMeta.games || [];
                  const mCur = mGames[mGi] || {};
                  const mScoreA = mCur.scoreA ?? (score.teamAScore || 0);
                  const mScoreB = mCur.scoreB ?? (score.teamBScore || 0);
                  const mTourn = cfg.tournamentName || 'Tournament Match';
                  const mCat = cfg.category || 'Match';

                  return (
                    <div
                      key={score.scoreId || score.matchUuid}
                      className="snap-start shrink-0 w-[calc(100vw-3rem)] sm:w-[340px] max-w-[380px] rounded-2xl border p-5 shadow-lg space-y-3.5 overflow-hidden relative flex flex-col justify-between"
                      style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'rgba(239, 68, 68, 0.4)' }}
                    >
                      <div className="absolute top-0 left-0 right-0 h-1 bg-red-500 animate-pulse" />

                      <div className="flex items-center justify-between pt-1">
                        <span className="px-2.5 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                          Live Game {mGi + 1}
                        </span>
                        <span className="text-[10px] text-foreground/50 font-bold uppercase truncate max-w-[140px]">
                          {cfg.courtName || 'Court Arena'}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h3 className="text-xs font-bold text-primary uppercase tracking-wider truncate">
                          {mTourn} • {mCat}
                        </h3>
                      </div>

                      <div
                        className="p-3.5 rounded-xl border space-y-2.5"
                        style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border-subtle)' }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div className="w-6 h-6 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-[11px] text-primary shrink-0">
                              {mTeamAName.charAt(0)}
                            </div>
                            <span className="text-xs font-black text-foreground truncate">{mTeamAName}</span>
                          </div>
                          <span className="text-base font-black font-mono tabular-nums ml-2 text-primary">{mScoreA}</span>
                        </div>

                        <div className="flex items-center justify-between border-t pt-2" style={{ borderColor: 'var(--athlon-border-subtle)' }}>
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-bold text-[11px] text-foreground/70 shrink-0">
                              {mTeamBName.charAt(0)}
                            </div>
                            <span className="text-xs font-black text-foreground truncate">{mTeamBName}</span>
                          </div>
                          <span className="text-base font-black font-mono tabular-nums ml-2 text-foreground">{mScoreB}</span>
                        </div>
                      </div>

                      <Link
                        href={`/live-score/${score.matchUuid}`}
                        className="w-full py-3 bg-gradient-to-r from-red-500 via-rose-500 to-primary text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-500/25 hover:brightness-110 active:scale-95 transition-all"
                      >
                        <Tv className="w-4 h-4" />
                        <span>WATCH LIVE SCORESHEET</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* 3.5 Mobile Live Player Auctions Showcase */}
          {liveAuctionChampionships.length > 0 && (
            <section className="pt-1">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                  <h2 className="text-sm font-black uppercase tracking-wider text-foreground">
                    Live Player Auctions ({liveAuctionChampionships.length})
                  </h2>
                </div>
                <span className="text-[10px] font-black uppercase text-red-400">
                  🔴 Live Bids
                </span>
              </div>

              <div className="flex items-stretch gap-3 overflow-x-auto pb-3 snap-x scroll-px-4 hide-scrollbar -mx-4 px-4">
                {liveAuctionChampionships.map((champ) => (
                  <div
                    key={champ.championshipUuid}
                    className="snap-start shrink-0 w-[calc(100vw-3rem)] sm:w-[340px] max-w-[380px] rounded-2xl border p-5 shadow-lg space-y-3.5 overflow-hidden relative flex flex-col justify-between"
                    style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'rgba(239, 68, 68, 0.4)' }}
                  >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-rose-500 to-primary animate-pulse" />

                    <div className="flex items-center justify-between pt-1">
                      <span className="px-2.5 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                        LIVE AUCTION
                      </span>
                      <span className="text-[10px] text-foreground/50 font-bold uppercase truncate max-w-[140px]">
                        {champ.sport || 'Badminton'}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-base font-black text-foreground tracking-tight line-clamp-1">
                        {champ.name}
                      </h3>
                      <p className="text-xs text-foreground/60 line-clamp-1">
                        {champ.location || champ.venue || 'Arena'} • Live Franchise Draft Floor
                      </p>
                    </div>

                    <div
                      className="p-3 rounded-xl border flex items-center justify-between text-xs"
                      style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border-subtle)' }}
                    >
                      <span className="text-foreground/60 font-semibold">Franchises:</span>
                      <span className="font-mono font-black text-primary">{champ.registeredTeamsCount || champ.maxTeams || 0} Teams</span>
                    </div>

                    <Link
                      href={`/home/team-championship/${champ.championshipUuid}/auction`}
                      className="w-full py-3 bg-gradient-to-r from-red-500 via-rose-500 to-primary text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-500/25 hover:brightness-110 active:scale-95 transition-all"
                    >
                      <Gavel className="w-4 h-4" />
                      <span>ENTER AUCTION ARENA</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 4. Recent Match Results */}
          {finishedScores.length > 0 && (
            <section className="pt-1">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <h2 className="text-sm font-black uppercase tracking-wider text-foreground">Recent Results</h2>
                </div>
                <Link href="/live-score" className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5">
                  View All <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="flex items-stretch gap-3 overflow-x-auto pb-3 snap-x scroll-px-4 hide-scrollbar -mx-4 px-4">
                {finishedScores.map((score, idx) => {
                  const sMeta = score.scoreMeta || {};
                  const cfg = sMeta.config || {};
                  const sTeamAName = cfg.teamAName || (cfg.teamA ? cfg.teamA.join(' & ') : 'Team A');
                  const sTeamBName = cfg.teamBName || (cfg.teamB ? cfg.teamB.join(' & ') : 'Team B');
                  const sGames = sMeta.games || [];
                  const gamesWonA = sGames.filter((g: any) => g.winner === 'A').length;
                  const gamesWonB = sGames.filter((g: any) => g.winner === 'B').length;
                  const isWinnerA = gamesWonA > gamesWonB;
                  const isWinnerB = gamesWonB > gamesWonA;
                  const sCategory = cfg.category || '';
                  const sTournament = cfg.tournamentName || 'Tournament Match';

                  return (
                    <Link
                      key={score.scoreId || idx}
                      href={`/live-score/${score.matchUuid}`}
                      className="snap-start shrink-0 w-[calc(100vw-3rem)] sm:w-[360px] max-w-[420px] group block"
                    >
                      <div
                        className="relative rounded-2xl border p-5 shadow-md space-y-4 overflow-hidden transition-all hover:border-primary/50"
                        style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                      >
                        <div className="absolute top-0 left-0 right-0 h-1 bg-primary shadow-[0_0_10px_var(--athlon-primary)]" />

                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-primary" /> COMPLETED
                            </span>
                            <span className="text-[11px] text-foreground/50 font-medium truncate max-w-[130px]">{sTournament}</span>
                          </div>
                          <span className="text-[10px] uppercase font-bold text-foreground/45 shrink-0">{sCategory}</span>
                        </div>

                        <div
                          className="p-3.5 rounded-xl border space-y-2.5"
                          style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border-subtle)' }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-xs text-primary shrink-0">
                                {sTeamAName.charAt(0)}
                              </div>
                              <span className={`text-xs truncate ${isWinnerA ? 'font-black text-foreground' : 'font-medium text-foreground/70'}`}>
                                {sTeamAName}
                              </span>
                              {isWinnerA && <Trophy className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20 shrink-0" />}
                            </div>
                            <span className={`text-sm font-black font-mono tabular-nums ml-2 shrink-0 ${isWinnerA ? 'text-primary' : 'text-foreground/60'}`}>
                              {gamesWonA}
                            </span>
                          </div>

                          <div
                            className="flex items-center justify-between border-t pt-2.5"
                            style={{ borderColor: 'var(--athlon-border-subtle)' }}
                          >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-bold text-xs text-foreground/70 shrink-0">
                                {sTeamBName.charAt(0)}
                              </div>
                              <span className={`text-xs truncate ${isWinnerB ? 'font-black text-foreground' : 'font-medium text-foreground/70'}`}>
                                {sTeamBName}
                              </span>
                              {isWinnerB && <Trophy className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20 shrink-0" />}
                            </div>
                            <span className={`text-sm font-black font-mono tabular-nums ml-2 shrink-0 ${isWinnerB ? 'text-primary' : 'text-foreground/60'}`}>
                              {gamesWonB}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between border-t pt-1" style={{ borderColor: 'var(--athlon-border-subtle)' }}>
                          {sGames.length > 0 ? (
                            <div className="flex items-center gap-2 flex-wrap text-[10px] text-foreground/60">
                              <span className="font-extrabold uppercase tracking-wider text-foreground/40">Sets:</span>
                              {sGames.map((g: any, gIdx: number) => (
                                <span key={gIdx} className="px-2 py-0.5 rounded bg-white/5 border border-white/10 font-mono font-bold">
                                  {g.scoreA ?? 0} - {g.scoreB ?? 0}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[10px] text-foreground/40 font-bold uppercase tracking-wider">Match Completed</span>
                          )}
                          <span className="text-[10px] font-bold text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform shrink-0 ml-2">
                            VIEW SCORECARD <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* 5. Team Championships Carousel */}
          {championships.length > 0 && (
            <section className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  <h2 className="text-sm font-black uppercase tracking-wider text-foreground">
                    Team Championships ({championships.length})
                  </h2>
                </div>
                <Link href="/tournaments" className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5">
                  View All <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="flex items-stretch gap-4 overflow-x-auto pb-4 snap-x scroll-px-6 hide-scrollbar -mx-4 px-4">
                {championships.map((championship) => (
                  <div
                    key={championship.championshipId || championship.championshipUuid}
                    className="snap-start shrink-0 w-[calc(100vw-3rem)] sm:w-[320px] md:w-[340px] max-w-[360px]"
                  >
                    <PublicTeamChampionshipCard championship={championship} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 6. Tournaments Carousel */}
          <section className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-black uppercase tracking-wider text-foreground">
                  Tournaments {tournaments.length > 0 && `(${tournaments.length})`}
                </h2>
              </div>
              <Link href="/tournaments" className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5">
                View All <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loadingTournaments ? (
              <div className="py-12 text-center text-foreground/50 text-xs font-bold uppercase tracking-widest">
                Loading tournaments...
              </div>
            ) : tournaments.length === 0 ? (
              <div
                className="rounded-2xl border border-dashed p-8 text-center"
                style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
              >
                <Trophy className="w-8 h-8 text-foreground/30 mx-auto mb-2" />
                <p className="text-xs font-bold text-foreground/60 uppercase">No active tournaments</p>
                <p className="text-[11px] text-foreground/40 mt-1">Check back soon for upcoming competitions.</p>
              </div>
            ) : (
              <div className="flex items-stretch gap-4 overflow-x-auto pb-4 snap-x scroll-px-6 hide-scrollbar -mx-4 px-4">
                {tournaments.map((tournament) => (
                  <div
                    key={tournament.tournamentId || tournament.tournamentUuid}
                    className="snap-start shrink-0 w-[calc(100vw-3rem)] sm:w-[320px] md:w-[340px] max-w-[360px]"
                  >
                    <PublicTournamentCard tournament={tournament} hrefPrefix="/tournaments" />
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>

        {/* Mobile Fixed Bottom Nav */}
        <nav
          className="fixed bottom-0 left-0 right-0 h-20 backdrop-blur-xl border-t z-50 px-5 flex items-center justify-between max-w-lg mx-auto"
          style={{ backgroundColor: 'var(--athlon-navigation)', borderColor: 'var(--athlon-border)' }}
        >
          <Link href="/" className="flex flex-col items-center gap-0.5 w-16 group">
            <Athlon3DIcon type="home" size={32} active={true} />
            <span className="text-[9.5px] font-bold text-primary leading-tight">
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
              href="/practice"
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
        {/* Desktop Top Navbar (Full Width) */}
        <header
          className="sticky top-0 z-50 w-full border-b backdrop-blur-xl bg-background/85 transition-all duration-300"
          style={{ borderColor: 'var(--athlon-border)' }}
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center text-primary group-hover:scale-105 transition-transform shadow-lg"
                style={{
                  backgroundColor: 'var(--athlon-surface)',
                  border: '1px solid var(--athlon-border)',
                  boxShadow: '0 0 20px var(--athlon-primary-soft)',
                }}
              >
                <Trophy className="w-5 h-5" style={{ color: 'var(--athlon-primary)' }} />
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
                className="px-4 py-2 rounded-xl text-sm font-black bg-primary text-black transition-all flex items-center gap-2 shadow-sm"
              >
                <Home className="w-4 h-4 text-black" />
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
                className="px-4 py-2 rounded-xl text-sm font-bold text-foreground/80 hover:text-foreground hover:bg-foreground/5 transition-all flex items-center gap-2"
              >
                <Tv className="w-4 h-4 text-blue-400" />
                <span>Live Arena</span>
                {liveScores.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                )}
              </Link>
            </nav>

            {/* Right Action CTAs */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <Link
                  href="/home"
                  className="flex items-center gap-2 bg-primary text-black text-sm font-black px-5 py-2.5 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg"
                  style={{ boxShadow: '0 4px 20px var(--athlon-primary-glow)' }}
                >
                  <span>Go to App</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
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
              )}
            </div>
          </div>
        </header>

        {/* ── 1. Full-Width Hero Section (Covering Page Layout Width) ── */}
        <section
          className="relative w-full border-b overflow-hidden"
          style={{
            backgroundColor: 'var(--athlon-card)',
            borderColor: 'var(--athlon-border)',
          }}
        >
          {/* Ambient Lighting & Mesh Glow Background */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <div className="absolute top-0 right-1/4 w-[600px] h-[400px] bg-primary/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 left-1/4 w-[500px] h-[350px] bg-emerald-500/10 rounded-full blur-[100px]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />
            {/* Subtle Grid Lines Texture */}
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
                backgroundSize: '48px 48px',
              }}
            />
          </div>

          {/* Hero Content Container */}
          <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24 grid grid-cols-12 gap-10 items-center">
            {/* Left 7 Columns: Headlines, Value Prop, Action CTAs */}
            <div className="col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-primary/10 border border-primary/25 text-primary">
                <Sparkles className="w-4 h-4" />
                <span>Next-Gen Sports Competition Platform</span>
              </div>

              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-black leading-[1.1] tracking-tight uppercase text-foreground">
                Compete Today. <br />
                <span className="bg-gradient-to-r from-primary via-emerald-400 to-amber-300 bg-clip-text text-transparent">
                  Champion Tomorrow.
                </span>
              </h1>

              <p className="text-base lg:text-lg text-foreground/75 leading-relaxed max-w-xl">
                The all-in-one tournament platform with real-time referee scoring, live player auction arenas, automated knockout brackets, and academy club management.
              </p>

              {/* Action Buttons */}
              <div className="flex items-center gap-4 pt-2">
                <Link
                  href="/tournaments"
                  className="flex items-center gap-2 bg-primary text-black text-sm font-black px-7 py-4 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl"
                  style={{ boxShadow: '0 8px 30px var(--athlon-primary-glow)' }}
                >
                  <Trophy className="w-4 h-4" />
                  <span>Browse All Tournaments</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/academies"
                  className="flex items-center gap-2 border text-foreground text-sm font-bold px-6 py-4 rounded-2xl hover:bg-foreground/5 active:scale-95 transition-all"
                  style={{
                    backgroundColor: 'var(--athlon-surface)',
                    borderColor: 'var(--athlon-border)',
                  }}
                >
                  <Building2 className="w-4 h-4 text-primary" />
                  <span>Find Academy</span>
                </Link>
              </div>

              {/* 3 Metric Pills */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-foreground/10 max-w-lg">
                <div>
                  <div className="text-2xl font-black font-mono text-primary">LIVE</div>
                  <div className="text-[11px] text-foreground/50 font-bold uppercase mt-0.5">Digital Scoresheets</div>
                </div>
                <div>
                  <div className="text-2xl font-black font-mono text-emerald-400">AUCTION</div>
                  <div className="text-[11px] text-foreground/50 font-bold uppercase mt-0.5">Squad Draft Arena</div>
                </div>
                <div>
                  <div className="text-2xl font-black font-mono text-amber-400">INSTANT</div>
                  <div className="text-[11px] text-foreground/50 font-bold uppercase mt-0.5">Automated Draws</div>
                </div>
              </div>
            </div>

            {/* Right 5 Columns: Platform Feature Showcase Card */}
            <div className="col-span-5 space-y-4">
              <div
                className="rounded-[32px] border p-8 shadow-2xl backdrop-blur-2xl space-y-5"
                style={{
                  backgroundColor: 'var(--athlon-surface)',
                  borderColor: 'var(--athlon-border)',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                }}
              >
                <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-wider">
                  <Shield className="w-4 h-4" />
                  <span>Franchise &amp; League Management</span>
                </div>
                <h3 className="text-2xl font-black text-foreground leading-snug">
                  Host Your Own Team Championship
                </h3>
                <p className="text-sm text-foreground/70 leading-relaxed">
                  Custom categories, live player draft auction arenas, automated pool ties, and real-time standings in a single integrated hub.
                </p>
                <Link
                  href="/tournaments"
                  className="inline-flex items-center gap-2 text-xs font-black text-primary hover:underline pt-2"
                >
                  <span>Explore Active Championships</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Desktop Main Content Container */}
        <main className="max-w-7xl mx-auto px-6 lg:px-8 py-14 space-y-14">
          {/* ── SECTION 1: 🔴 LIVE MATCH ARENA (HORIZONTAL SCROLL) ── */}
          {liveScores.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--athlon-border)' }}>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                  <h2 className="text-lg font-black text-foreground">
                    Live Match Arena ({liveScores.length})
                  </h2>
                </div>
                <Link
                  href="/live-score"
                  className="text-xs font-bold text-red-500 hover:underline uppercase tracking-wider flex items-center gap-1"
                >
                  Live Arena Dashboard <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 snap-x scroll-px-6 hide-scrollbar">
                {liveScores.map((score) => {
                  const mMeta = score.scoreMeta || {};
                  const cfg = mMeta.config || {};
                  const mTeamAName = cfg.teamAName || (cfg.teamA ? cfg.teamA.join(' & ') : 'Team A');
                  const mTeamBName = cfg.teamBName || (cfg.teamB ? cfg.teamB.join(' & ') : 'Team B');
                  const mGi = mMeta.currentGameIndex || 0;
                  const mGames = mMeta.games || [];
                  const mCur = mGames[mGi] || {};
                  const mScoreA = mCur.scoreA ?? (score.teamAScore || 0);
                  const mScoreB = mCur.scoreB ?? (score.teamBScore || 0);
                  const mTourn = cfg.tournamentName || 'Tournament Match';
                  const mCat = cfg.category || 'Match';

                  return (
                    <div
                      key={score.scoreId || score.matchUuid}
                      className="snap-start shrink-0 w-[380px] rounded-2xl border p-5 shadow-lg space-y-4 overflow-hidden relative flex flex-col justify-between"
                      style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'rgba(239, 68, 68, 0.4)' }}
                    >
                      <div className="absolute top-0 left-0 right-0 h-1 bg-red-500 animate-pulse" />

                      <div className="flex items-center justify-between pt-1">
                        <span className="px-2.5 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                          Live Game {mGi + 1}
                        </span>
                        <span className="text-xs text-foreground/50 font-medium truncate max-w-[180px]">
                          {cfg.courtName || 'Court Arena'}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h3 className="text-base font-black text-foreground tracking-tight line-clamp-1">
                          {mTourn}
                        </h3>
                        <p className="text-xs text-foreground/60 line-clamp-1">
                          {mCat} • Real-time umpire scoresheet
                        </p>
                      </div>

                      <div
                        className="p-3.5 rounded-xl border space-y-2.5"
                        style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border-subtle)' }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-xs text-primary shrink-0">
                              {mTeamAName.charAt(0)}
                            </div>
                            <span className="text-xs font-black text-foreground truncate">{mTeamAName}</span>
                          </div>
                          <span className="text-lg font-black font-mono tabular-nums ml-2 text-primary">{mScoreA}</span>
                        </div>

                        <div className="flex items-center justify-between border-t pt-2" style={{ borderColor: 'var(--athlon-border-subtle)' }}>
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-bold text-xs text-foreground/70 shrink-0">
                              {mTeamBName.charAt(0)}
                            </div>
                            <span className="text-xs font-black text-foreground truncate">{mTeamBName}</span>
                          </div>
                          <span className="text-lg font-black font-mono tabular-nums ml-2 text-foreground">{mScoreB}</span>
                        </div>
                      </div>

                      <Link
                        href={`/live-score/${score.matchUuid}`}
                        className="w-full py-3 bg-gradient-to-r from-red-500 via-rose-500 to-primary text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-500/25 hover:brightness-110 active:scale-95 transition-all"
                      >
                        <Tv className="w-4 h-4" />
                        <span>WATCH LIVE SCORESHEET</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* 2. Desktop 4-Bento Arena Services Grid */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--athlon-border)' }}>
              <div>
                <h2 className="text-lg font-black text-foreground">Explore Sports Ecosystem</h2>
                <p className="text-xs text-foreground/50">Comprehensive competition & academy services</p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-5">
              {[
                {
                  id: 'tournaments',
                  label: 'Tournaments',
                  desc: 'Single & double elimination brackets, knockout rounds, and draw automation.',
                  icon: Trophy,
                  color: 'text-primary',
                  bg: 'bg-primary/10 border-primary/20',
                },
                {
                  id: 'tournaments',
                  label: 'Team Championships',
                  desc: 'Multi-category franchise leagues, live player auction arena, and pool standings.',
                  icon: Shield,
                  color: 'text-amber-400',
                  bg: 'bg-amber-500/10 border-amber-500/20',
                },
                {
                  id: 'academies',
                  label: 'Sports Academies',
                  desc: 'Student coaching batches, attendance tracking, coaches, and fee management.',
                  icon: Building,
                  color: 'text-emerald-400',
                  bg: 'bg-emerald-500/10 border-emerald-500/20',
                },
                {
                  id: 'live-score',
                  label: 'Live Broadcast Arena',
                  desc: 'Point-by-point digital umpiring scoresheet and real-time live match updates.',
                  icon: Tv,
                  color: 'text-blue-400',
                  bg: 'bg-blue-500/10 border-blue-500/20',
                },
              ].map((service) => (
                <Link
                  href={`/${service.id}`}
                  key={service.label}
                  className="group p-6 rounded-[24px] border flex flex-col justify-between space-y-4 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl relative overflow-hidden"
                  style={{
                    backgroundColor: 'var(--athlon-card)',
                    borderColor: 'var(--athlon-border)',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${service.bg} ${service.color} group-hover:scale-110 transition-transform`}>
                      <service.icon className="w-6 h-6" />
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-foreground/30 group-hover:text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                  </div>

                  <div>
                    <h3 className="font-extrabold text-base text-foreground group-hover:text-primary transition-colors">
                      {service.label}
                    </h3>
                    <p className="text-xs text-foreground/60 mt-1 leading-relaxed">
                      {service.desc}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* 3. Desktop Live Player Auctions Showcase (Horizontal Scrolling) */}
          {liveAuctionChampionships.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--athlon-border)' }}>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                  <h2 className="text-lg font-black text-foreground">
                    Live Player Auction Arenas ({liveAuctionChampionships.length})
                  </h2>
                </div>
                <span className="text-xs font-bold text-red-500 uppercase tracking-wider">
                  🔴 Broadcasting Live
                </span>
              </div>

              <div className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 snap-x scroll-px-6 hide-scrollbar">
                {liveAuctionChampionships.map((champ) => (
                  <div
                    key={champ.championshipUuid}
                    className="snap-start shrink-0 w-[380px] rounded-2xl border p-5 shadow-lg space-y-4 overflow-hidden relative flex flex-col justify-between"
                    style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'rgba(239, 68, 68, 0.4)' }}
                  >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-rose-500 to-primary animate-pulse" />

                    <div className="flex items-center justify-between pt-1">
                      <span className="px-2.5 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                        LIVE AUCTION
                      </span>
                      <span className="text-xs text-foreground/50 font-medium truncate max-w-[180px]">
                        {champ.sport || 'Badminton'}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-base font-black text-foreground tracking-tight line-clamp-1">
                        {champ.name}
                      </h3>
                      <p className="text-xs text-foreground/60 line-clamp-1">
                        {champ.location || champ.venue || 'Arena'} • Live Franchise Bidding &amp; Player Draft
                      </p>
                    </div>

                    <div
                      className="p-3 rounded-xl border flex items-center justify-between text-xs"
                      style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border-subtle)' }}
                    >
                      <span className="text-foreground/60 font-semibold">Franchises Competing:</span>
                      <span className="font-mono font-black text-primary">{champ.registeredTeamsCount || champ.maxTeams || 0} Teams</span>
                    </div>

                    <Link
                      href={`/home/team-championship/${champ.championshipUuid}/auction`}
                      className="w-full py-3 bg-gradient-to-r from-red-500 via-rose-500 to-primary text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-500/25 hover:brightness-110 active:scale-95 transition-all"
                    >
                      <Gavel className="w-4 h-4" />
                      <span>ENTER AUCTION ARENA</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 4. Desktop Recent Completed Matches (Horizontal Scrolling) */}
          {finishedScores.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--athlon-border)' }}>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-lg font-black text-foreground">Recent Match Results</h2>
                </div>
                <Link
                  href="/live-score"
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                >
                  View All Live Arena <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Horizontal Scroll Rail */}
              <div className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 snap-x scroll-px-6 hide-scrollbar">
                {finishedScores.map((score, idx) => {
                  const sMeta = score.scoreMeta || {};
                  const cfg = sMeta.config || {};
                  const sTeamAName = cfg.teamAName || (cfg.teamA ? cfg.teamA.join(' & ') : 'Team A');
                  const sTeamBName = cfg.teamBName || (cfg.teamB ? cfg.teamB.join(' & ') : 'Team B');
                  const sGames = sMeta.games || [];
                  const gamesWonA = sGames.filter((g: any) => g.winner === 'A').length;
                  const gamesWonB = sGames.filter((g: any) => g.winner === 'B').length;
                  const isWinnerA = gamesWonA > gamesWonB;
                  const isWinnerB = gamesWonB > gamesWonA;
                  const sCategory = cfg.category || '';
                  const sTournament = cfg.tournamentName || 'Tournament Match';

                  return (
                    <Link
                      key={score.scoreId || idx}
                      href={`/live-score/${score.matchUuid}`}
                      className="snap-start shrink-0 w-[380px] group rounded-2xl border p-5 shadow-md space-y-4 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 relative flex flex-col justify-between"
                      style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                    >
                      <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />

                      <div className="flex items-center justify-between pt-1">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> COMPLETED
                        </span>
                        <span className="text-xs text-foreground/50 font-medium truncate max-w-[180px]">
                          {sTournament} • {sCategory}
                        </span>
                      </div>

                      <div
                        className="p-3.5 rounded-xl border space-y-2.5"
                        style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-xs text-primary shrink-0">
                              {sTeamAName.charAt(0)}
                            </div>
                            <span className={`text-xs truncate ${isWinnerA ? 'font-black text-foreground' : 'font-medium text-foreground/70'}`}>
                              {sTeamAName}
                            </span>
                            {isWinnerA && <Trophy className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20 shrink-0" />}
                          </div>
                          <span className={`text-sm font-black font-mono tabular-nums ml-2 ${isWinnerA ? 'text-emerald-400' : 'text-foreground/60'}`}>
                            {gamesWonA}
                          </span>
                        </div>

                        <div className="flex items-center justify-between border-t pt-2" style={{ borderColor: 'var(--athlon-border)' }}>
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-bold text-xs text-foreground/70 shrink-0">
                              {sTeamBName.charAt(0)}
                            </div>
                            <span className={`text-xs truncate ${isWinnerB ? 'font-black text-foreground' : 'font-medium text-foreground/70'}`}>
                              {sTeamBName}
                            </span>
                            {isWinnerB && <Trophy className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20 shrink-0" />}
                          </div>
                          <span className={`text-sm font-black font-mono tabular-nums ml-2 ${isWinnerB ? 'text-emerald-400' : 'text-foreground/60'}`}>
                            {gamesWonB}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t pt-2 text-xs text-foreground/60" style={{ borderColor: 'var(--athlon-border)' }}>
                        <span>View Full Scorecard</span>
                        <ChevronRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* 4. Desktop Team Championships Showcase (Horizontal Scrolling) */}
          {championships.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--athlon-border)' }}>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-black text-foreground">
                    Team Championships ({championships.length})
                  </h2>
                </div>
                <Link
                  href="/tournaments"
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                >
                  View All <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Horizontal Scroll Rail */}
              <div className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 snap-x scroll-px-6 hide-scrollbar">
                {championships.map((championship) => (
                  <div
                    key={championship.championshipId || championship.championshipUuid}
                    className="snap-start shrink-0 w-[360px] lg:w-[380px]"
                  >
                    <PublicTeamChampionshipCard championship={championship} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 5. Desktop Public Tournaments Showcase (Horizontal Scrolling) */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--athlon-border)' }}>
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-black text-foreground">
                  Tournaments & Individual Draws {tournaments.length > 0 && `(${tournaments.length})`}
                </h2>
              </div>
              <Link
                href="/tournaments"
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
              >
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {loadingTournaments ? (
              <div className="py-16 text-center text-foreground/50 text-xs font-bold uppercase tracking-widest">
                Loading tournaments...
              </div>
            ) : tournaments.length === 0 ? (
              <div
                className="rounded-3xl border border-dashed p-12 text-center"
                style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
              >
                <Trophy className="w-10 h-10 text-foreground/30 mx-auto mb-3" />
                <p className="text-sm font-bold text-foreground/60 uppercase">No active tournaments</p>
                <p className="text-xs text-foreground/40 mt-1">Check back soon for upcoming competitions.</p>
              </div>
            ) : (
              /* Horizontal Scroll Rail */
              <div className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 snap-x scroll-px-6 hide-scrollbar">
                {tournaments.map((tournament) => (
                  <div
                    key={tournament.tournamentId || tournament.tournamentUuid}
                    className="snap-start shrink-0 w-[360px] lg:w-[380px]"
                  >
                    <PublicTournamentCard tournament={tournament} hrefPrefix="/tournaments" />
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>

        {/* Desktop Footer */}
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
                <div className="w-8 h-8 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary font-black">
                  <Trophy className="w-4 h-4" />
                </div>
                <span className="font-black text-foreground text-sm tracking-wide">ATHLON SPORTS</span>
              </div>

              <div className="flex items-center gap-8 text-foreground/60 font-medium">
                <Link href="/tournaments" className="hover:text-primary transition-colors">Tournaments</Link>
                <Link href="/tournaments" className="hover:text-primary transition-colors">Team Championships</Link>
                <Link href="/academies" className="hover:text-primary transition-colors">Academies</Link>
                <Link href="/live-score" className="hover:text-primary transition-colors">Live Scoring</Link>
                <Link href="/login" className="hover:text-primary transition-colors">Organizer Hub</Link>
              </div>
            </div>

            <div className="border-t pt-6 flex items-center justify-between text-foreground/40 text-[11px]" style={{ borderColor: 'var(--athlon-border)' }}>
              <p>© 2026 Athlon Sports Platform. All rights reserved.</p>
              <p>The tournament experience, elevated.</p>
            </div>
          </div>
        </footer>
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
