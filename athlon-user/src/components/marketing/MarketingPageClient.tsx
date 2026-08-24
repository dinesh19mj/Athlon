'use client';

import { useState, useEffect } from 'react';
import {
  Menu,
  LogIn,
  ArrowRight,
  Building2,
  Trophy,
  Building,
  CalendarDays,
  Calendar,
  MapPin,
  ActivityIcon,
  Tv,
  ChevronRight,
  Sparkles,
  Home,
  User,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { ScoreService, LiveScore } from '@/lib/api/scores';
import { TournamentService, Tournament } from '@/lib/api/tournaments';
import { useAthlonTheme } from '@/hooks/use-athlon-theme';
import { getThemeVideo } from '@/config/theme';

export function MarketingPageClient() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { themeKey } = useAthlonTheme();
  const backgroundVideo = getThemeVideo(themeKey);
  const [liveScores, setLiveScores] = useState<LiveScore[]>([]);

  const [finishedScores, setFinishedScores] = useState<LiveScore[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loadingTournaments, setLoadingTournaments] = useState(true);

  useEffect(() => {
    // 1. Fetch live + finished scores
    const fetchScores = () => {
      ScoreService.getLive()
        .then((res: any) => {
          if (res && res.data) setLiveScores(res.data);
        })
        .catch(() => {});

      ScoreService.getAll()
        .then((res: any) => {
          if (res?.data) {
            const finished = res.data.filter((s: LiveScore) => {
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
    const interval = setInterval(fetchScores, 5000);

    // 2. Fetch all public tournaments for marketplace home
    TournamentService.getAll()
      .then((res) => {
        const publicList = (res.data || []).filter((t: Tournament) => t.visibility === 'PUBLIC');
        setTournaments(publicList);
      })
      .catch((err) => console.error('Failed to load tournaments in marketing client', err))
      .finally(() => setLoadingTournaments(false));

    return () => clearInterval(interval);
  }, []);

  const currentLive = liveScores[0];
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

  const topCategories = [
    { id: 'tournaments', label: 'Tournaments', icon: Trophy },
    { id: 'academies', label: 'Academies', icon: Building },
    { id: 'bookings', label: 'Bookings', icon: CalendarDays },
    { id: 'live-score', label: 'Live Score', icon: Tv },
  ];

  return (
    <div className="min-h-screen w-full bg-background text-foreground font-sans pb-28 overflow-y-auto selection:bg-primary selection:text-black">
      {/* Main Container */}
      <main className="w-full max-w-lg mx-auto px-4 flex flex-col gap-6 pt-2">
        {/* 1. Hero Banner Carousel */}
        <section className="relative w-full min-h-[220px] rounded-[24px] overflow-hidden bg-background border border-foreground/10 shadow-[0_10px_40px_rgba(0,136,255,0.15)]">
          {/* Video Background */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[#001122] via-[#001122]/90 to-transparent z-10" />

            <div className="absolute top-[-10%] right-[-5%] w-[60%] h-[120%] mix-blend-screen opacity-50">
              <video
                key={backgroundVideo}
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
              >
                <source src={backgroundVideo} type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-gradient-to-l from-transparent to-background" />
            </div>
          </div>

          <div className="relative z-10 p-6 flex flex-col justify-center h-full w-full">
            <h1 className="text-[22px] sm:text-[24px] font-black leading-tight tracking-wide uppercase drop-shadow-lg">
              <span className="text-foreground">Compete Today</span>
              <br />
              <span className="text-primary">Champion Tomorrow</span>
            </h1>
            <p className="text-[11px] sm:text-xs text-foreground/80 mt-2 mb-5 max-w-[260px] leading-relaxed drop-shadow-md">
              Football, Cricket, Badminton & more!
              <br />
              Tournaments & Live Scores in one place.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/tournaments"
                className="flex items-center justify-center gap-1.5 bg-primary text-primary-foreground text-[10px] sm:text-[11px] font-black px-4 py-2.5 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_var(--athlon-primary-glow)]"
              >
                BROWSE TOURNAMENTS <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/academies"
                className="flex items-center justify-center gap-1.5 bg-black/40 backdrop-blur-md border border-foreground/20 text-foreground text-[10px] sm:text-[11px] font-bold px-4 py-2.5 rounded-xl hover:bg-foreground/10 transition-colors"
              >
                <Building2 className="w-3.5 h-3.5 text-primary" /> FIND ACADEMY
              </Link>
            </div>
          </div>
        </section>

        {/* 2. Primary Categories (Horizontal Scroll) */}
        <section className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 snap-x scroll-px-4 hide-scrollbar -mx-4 px-4">
          {topCategories.map((cat) => (
            <Link href={`/${cat.id}`} key={cat.id} className="flex flex-col items-center gap-1.5 shrink-0 snap-start">
              <div
                className="w-[68px] h-[68px] rounded-[16px] flex flex-col items-center justify-center transition-all shadow-lg cursor-pointer hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: 'var(--athlon-surface)',
                  border: '1px solid var(--athlon-border)',
                }}
              >
                <cat.icon className="w-6 h-6" style={{ color: 'var(--athlon-primary)' }} strokeWidth={1.5} />
              </div>
              <span className="text-[10px] font-medium" style={{ color: 'var(--athlon-text-secondary)' }}>
                {cat.label}
              </span>
            </Link>
          ))}
        </section>

        {/* 3. Live Match Card (Hidden if no active matches) */}
        {liveScores.length > 0 && currentLive && (
          <section className="bg-surface border border-foreground/5 rounded-[24px] p-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-red-500 font-bold text-xs tracking-wider">LIVE</span>
                <span className="text-foreground font-bold text-xs tracking-wider">MATCH</span>
              </div>
              <span className="text-foreground/50 text-xs">{courtName}</span>
            </div>

            <div className="flex items-center justify-center mb-6">
              <span className="px-3 py-1 bg-background rounded-full text-[10px] font-bold text-foreground/60 uppercase tracking-widest border border-foreground/5 text-center">
                {tournamentName} • {category}
              </span>
            </div>

            <div className="flex items-center justify-between px-2 mb-6">
              {/* Player 1 */}
              <div className="flex flex-col items-center gap-2 max-w-[110px]">
                <div className="w-16 h-16 rounded-full bg-gradient-to-b from-primary to-transparent p-[2px]">
                  <div className="w-full h-full rounded-full bg-background border-2 border-transparent overflow-hidden flex items-center justify-center">
                    <span className="text-xl font-black text-primary">{teamAName.charAt(0)}</span>
                  </div>
                </div>
                <span className="font-bold text-xs tracking-wider uppercase text-center line-clamp-2 leading-tight">
                  {teamAName}
                </span>
                <span className="text-4xl font-black text-primary leading-none tabular-nums">{scoreA}</span>
              </div>

              {/* VS */}
              <div className="flex flex-col items-center justify-center gap-2 mt-4 shrink-0">
                <div className="w-10 h-10 rounded-full bg-background border border-foreground/10 flex items-center justify-center">
                  <span className="text-foreground/50 font-bold text-sm">VS</span>
                </div>
                <span className="px-2 py-0.5 bg-background border border-foreground/5 rounded text-[10px] font-bold text-foreground/50 uppercase tracking-wider">
                  Game {currentGameIndex + 1}
                </span>
              </div>

              {/* Player 2 */}
              <div className="flex flex-col items-center gap-2 max-w-[110px]">
                <div className="w-16 h-16 rounded-full bg-gradient-to-b from-white/20 to-transparent p-[2px]">
                  <div className="w-full h-full rounded-full bg-background border-2 border-transparent overflow-hidden flex items-center justify-center">
                    <span className="text-xl font-black text-foreground">{teamBName.charAt(0)}</span>
                  </div>
                </div>
                <span className="font-bold text-xs tracking-wider uppercase text-center line-clamp-2 leading-tight">
                  {teamBName}
                </span>
                <span className="text-4xl font-black text-foreground leading-none tabular-nums">{scoreB}</span>
              </div>
            </div>

            <Link
              href={`/live-score/${currentLive.matchUuid}`}
              className="w-full py-3.5 bg-primary rounded-xl text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              WATCH LIVE <Tv className="w-4 h-4" />
            </Link>
          </section>
        )}

        {/* 4. Recent Match Results */}
        {finishedScores.length > 0 && (
          <section className="pt-1">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-black uppercase tracking-wider text-foreground">Recent Results</h2>
              </div>
              <Link href="/live-score" className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5">
                View All <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Full-bleed scroll rail with guaranteed left padding */}
            <div className="flex items-stretch gap-3 overflow-x-auto pb-3 snap-x scroll-px-4 hide-scrollbar -mx-4 px-4">
              {finishedScores.map((score, idx) => {
                const meta = score.scoreMeta || {};
                const cfg = meta.config || {};
                const teamAName = cfg.teamAName || (cfg.teamA ? cfg.teamA.join(' & ') : 'Team A');
                const teamBName = cfg.teamBName || (cfg.teamB ? cfg.teamB.join(' & ') : 'Team B');
                const games = meta.games || [];
                const gamesWonA = games.filter((g: any) => g.winner === 'A').length;
                const gamesWonB = games.filter((g: any) => g.winner === 'B').length;
                const isWinnerA = gamesWonA > gamesWonB;
                const isWinnerB = gamesWonB > gamesWonA;
                const category = cfg.category || '';
                const tournament = cfg.tournamentName || 'Tournament Match';

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
                      {/* Emerald top bar */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />

                      {/* Header */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> COMPLETED
                          </span>
                          <span className="text-[11px] text-foreground/50 font-medium truncate max-w-[130px]">{tournament}</span>
                        </div>
                        <span className="text-[10px] uppercase font-bold text-foreground/45 shrink-0">{category}</span>
                      </div>

                      {/* Team Rows — fixed layout, consistent height regardless of name length */}
                      <div
                        className="p-3.5 rounded-xl border space-y-2.5"
                        style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border-subtle)' }}
                      >
                        {/* Team A */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-xs text-primary shrink-0">
                              {teamAName.charAt(0)}
                            </div>
                            <span className={`text-xs truncate ${isWinnerA ? 'font-black text-foreground' : 'font-medium text-foreground/70'}`}>
                              {teamAName}
                            </span>
                            {isWinnerA && (
                              <Trophy className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20 shrink-0" />
                            )}
                          </div>
                          <span className={`text-sm font-black font-mono tabular-nums ml-2 shrink-0 ${isWinnerA ? 'text-emerald-400' : 'text-foreground/60'}`}>
                            {gamesWonA}
                          </span>
                        </div>

                        {/* Team B */}
                        <div
                          className="flex items-center justify-between border-t pt-2.5"
                          style={{ borderColor: 'var(--athlon-border-subtle)' }}
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-bold text-xs text-foreground/70 shrink-0">
                              {teamBName.charAt(0)}
                            </div>
                            <span className={`text-xs truncate ${isWinnerB ? 'font-black text-foreground' : 'font-medium text-foreground/70'}`}>
                              {teamBName}
                            </span>
                            {isWinnerB && (
                              <Trophy className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20 shrink-0" />
                            )}
                          </div>
                          <span className={`text-sm font-black font-mono tabular-nums ml-2 shrink-0 ${isWinnerB ? 'text-emerald-400' : 'text-foreground/60'}`}>
                            {gamesWonB}
                          </span>
                        </div>
                      </div>

                      {/* Sets footer */}
                      <div className="flex items-center justify-between border-t pt-1" style={{ borderColor: 'var(--athlon-border-subtle)' }}>
                        {games.length > 0 ? (
                          <div className="flex items-center gap-2 flex-wrap text-[10px] text-foreground/60">
                            <span className="font-extrabold uppercase tracking-wider text-foreground/40">Sets:</span>
                            {games.map((g: any, gIdx: number) => (
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

        {/* 5. Featured Tournaments Carousel Section on Market Home Page */}
        <section className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-black uppercase tracking-wider text-foreground">Featured Tournaments</h2>
            </div>
            <Link
              href="/tournaments"
              className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5"
            >
              View All {tournaments.length > 0 && `(${tournaments.length})`} <ChevronRight className="w-3.5 h-3.5" />
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
            /* Horizontal Scroll Rail */
            <div className="flex items-stretch gap-3.5 overflow-x-auto pb-4 pt-1 snap-x scroll-px-4 hide-scrollbar -mx-4 px-4">
              {tournaments.map((tournament) => {
                const startDate = new Date(tournament.startDate).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                });
                const endDate = new Date(tournament.endDate).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                });
                const isFinished = tournament.status === 'COMPLETED' || tournament.status === 'FINISHED';
                const isClosed = tournament.status === 'REGISTRATION_CLOSED';

                return (
                  <Link
                    href={`/tournaments/${tournament.tournamentUuid}`}
                    key={tournament.tournamentId || tournament.tournamentUuid}
                    className="snap-start shrink-0 w-[calc(100vw-3rem)] sm:w-[360px] max-w-[420px] rounded-[22px] border overflow-hidden shadow-lg transition-all duration-300 hover:border-primary/50 hover:shadow-primary/10 hover:shadow-xl group flex flex-col justify-between"
                    style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                  >
                    {/* Top gradient accent */}
                    <div className="h-1 w-full bg-gradient-to-r from-primary via-emerald-400 to-primary" />

                    <div className="p-4 flex flex-col justify-between flex-1 space-y-3">
                      {/* Badge row & Trophy icon */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-1.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/25 text-[9px] font-black uppercase tracking-wider">
                              {tournament.sport || 'Sports'}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-foreground/5 text-foreground/70 border border-foreground/10 text-[9px] font-bold uppercase tracking-wider">
                              {tournament.tournamentType === 'TEAM_EVENT'
                                ? 'Team Event'
                                : tournament.tournamentType || 'Knockout'}
                            </span>
                          </div>

                          <div className="w-7 h-7 rounded-lg bg-background border border-foreground/10 flex items-center justify-center shrink-0">
                            <Trophy className="w-3.5 h-3.5 text-foreground/40 group-hover:text-primary transition-colors" />
                          </div>
                        </div>

                        {/* Title & Status */}
                        <div>
                          <h3 className="text-sm font-black text-foreground group-hover:text-primary transition-colors line-clamp-1">
                            {tournament.name}
                          </h3>
                          {isFinished ? (
                            <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded bg-primary/15 text-primary border border-primary/25 text-[9px] font-black uppercase tracking-wider">
                              <Trophy className="w-2.5 h-2.5" /> Match Finished
                            </span>
                          ) : isClosed ? (
                            <span className="inline-block mt-1 px-2 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/25 text-[9px] font-black uppercase tracking-wider">
                              Registration Closed
                            </span>
                          ) : (
                            <span className="inline-block mt-1 px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 text-[9px] font-black uppercase tracking-wider">
                              Registration Open
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Location & Dates Chip Box */}
                      <div
                        className="rounded-xl p-2.5 border space-y-1.5 text-[11px]"
                        style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border-subtle)' }}
                      >
                        <div className="flex items-center gap-1.5 text-foreground/75">
                          <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span className="font-semibold truncate">
                            {startDate} - {endDate}
                          </span>
                        </div>

                        {tournament.location ? (
                          <div className="flex items-center gap-1.5 text-foreground/70">
                            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span className="truncate">{tournament.location}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-foreground/40">
                            <MapPin className="w-3.5 h-3.5 text-foreground/30 shrink-0" />
                            <span>Venue details inside</span>
                          </div>
                        )}
                      </div>

                      {/* Footer: Fee & Action */}
                      <div
                        className="flex items-center justify-between border-t pt-2.5"
                        style={{ borderColor: 'var(--athlon-border-subtle)' }}
                      >
                        <div>
                          <span className="text-[9px] font-bold text-foreground/40 uppercase block leading-none">Entry Fee</span>
                          <span className="text-xs font-black text-primary">
                            {tournament.registrationFees ? `₹${tournament.registrationFees}` : 'FREE'}
                          </span>
                        </div>

                        <span className="text-[10px] font-bold text-primary flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                          {isFinished ? 'VIEW RESULTS' : isClosed ? 'VIEW DETAILS' : 'REGISTER NOW'} <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

      </main>

      {/* Bottom Nav */}
      <nav
        className="fixed bottom-0 left-0 right-0 h-20 backdrop-blur-xl border-t z-50 px-6 flex items-center justify-between max-w-lg mx-auto"
        style={{ backgroundColor: 'var(--athlon-navigation)', borderColor: 'var(--athlon-border)' }}
      >
        <Link href="/" className="flex flex-col items-center gap-1 w-16">
          <Home className="w-6 h-6" style={{ color: 'var(--athlon-primary)' }} />
          <span className="text-[9px] font-bold" style={{ color: 'var(--athlon-navigation-active)' }}>
            Home
          </span>
        </Link>

        <Link
          href="/tournaments"
          className="flex flex-col items-center gap-1 w-16 opacity-70 hover:opacity-100 transition-opacity"
        >
          <Trophy className="w-6 h-6" style={{ color: 'var(--athlon-primary)' }} />
          <span className="text-[9px] font-bold" style={{ color: 'var(--athlon-text-muted)' }}>
            Tournaments
          </span>
        </Link>

        {/* Elevated Center Button */}
        <div className="relative -top-6 flex items-center justify-center">
          <Link
            href="/match-setup"
            className="w-16 h-16 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-transform border-4"
            style={{
              backgroundColor: 'var(--athlon-primary)',
              color: 'var(--athlon-primary-foreground)',
              borderColor: 'var(--athlon-navigation)',
              boxShadow: '0 8px 30px var(--athlon-glow)',
            }}
          >
            <img src="/umpire.png" alt="Umpire" className="w-8 h-8 object-contain drop-shadow-md" />
          </Link>
        </div>

        <Link
          href="/academies"
          className="flex flex-col items-center gap-1 w-16 opacity-70 hover:opacity-100 transition-opacity"
        >
          <Building className="w-6 h-6" style={{ color: 'var(--athlon-primary)' }} />
          <span className="text-[9px] font-bold" style={{ color: 'var(--athlon-text-muted)' }}>
            Academy
          </span>
        </Link>

        <Link
          href={isAuthenticated ? '/profile' : '/login'}
          className="flex flex-col items-center gap-1 w-16 opacity-70 hover:opacity-100 transition-opacity"
        >
          <User className="w-6 h-6" style={{ color: 'var(--athlon-primary)' }} />
          <span className="text-[9px] font-bold" style={{ color: 'var(--athlon-text-muted)' }}>
            Profile
          </span>
        </Link>
      </nav>

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
