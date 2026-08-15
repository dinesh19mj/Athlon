'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Trophy,
  Activity,
  TrendingUp,
  CreditCard,
  ChevronRight,
  MapPin,
  Calendar,
  Star,
  CheckCircle2,
  Wallet,
  ShieldCheck,
  Building,
  Users,
  Plus,
  Flame,
  Hand,
  ClipboardList,
  Clock,
  Zap
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { TournamentService, Tournament } from '@/lib/api/tournaments';
import { PublicTournamentCard } from '@/components/tournaments/PublicTournamentCard';
import { ScoreService, LiveScore } from '@/lib/api/scores';



import { MatchService, Match } from '@/lib/api/matches';

const quickActions = [
  { id: '/home/tournaments', label: 'Tournaments', icon: Trophy, color: 'text-[#1B9C56]' },
  { id: '/home/rankings', label: 'Rankings', icon: TrendingUp, color: 'text-orange-400' },
  { id: '/home/matches', label: 'Matches', icon: Activity, color: 'text-[#1B9C56]' },
  { id: '/home/registered', label: 'Registered', icon: ClipboardList, color: 'text-purple-400' },
];

export default function PersonalHomePage() {
  const { userEmail, userId } = useAuthStore();
  const { personalProfile, organizations } = useWorkspaceStore();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [publicTournaments, setPublicTournaments] = useState<Tournament[]>([]);
  const [liveScores, setLiveScores] = useState<LiveScore[]>([]);
  const [userMatches, setUserMatches] = useState<any[]>([]);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const res = await TournamentService.getAll();
        const activePublic = res.data.filter((t: Tournament) => t.visibility === 'PUBLIC');
        setPublicTournaments(activePublic);
      } catch (err) {
        console.error("Failed to load tournaments", err);
      }
    };
    fetchTournaments();

    const fetchUserMatches = async () => {
      try {
        if (userId) {
          const res = await MatchService.getByUser(Number(userId));
          if (res && res.data && res.data.length > 0) {
            const formatted = res.data.map((m: Match) => {
              const teamA = m.teamAName || 'Team A';
              const teamB = m.teamBName || 'Team B';
              return {
                id: m.uuid || `match-${m.id}`,
                matchUuid: m.uuid,
                tournament: m.tournamentName || 'Tournament Match',
                date: m.scheduledTime ? new Date(m.scheduledTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : (m.matchDate || 'Scheduled'),
                teamAName: teamA,
                teamBName: teamB,
                opponent: teamB, // Defaults to Team B, displayed alongside Team A in matchup
                court: m.courtName || (m.courtId ? `Court ${m.courtId}` : 'Court TBD'),
                status: m.status || 'Scheduled'
              };
            });
            setUserMatches(formatted);
          }
        }
      } catch (err) {
        console.error("Failed to load user schedule", err);
      }
    };
    fetchUserMatches();

    const fetchLiveScores = () => {
      ScoreService.getLive()
        .then((res: any) => {
          if (res && res.data) {
            setLiveScores(res.data);
          }
        })
        .catch(err => console.error("Failed to load live scores", err));
    };

    fetchLiveScores();
    const interval = setInterval(fetchLiveScores, 5000);
    return () => clearInterval(interval);
  }, [userId]);



  const displayName = personalProfile?.name || (userEmail ? userEmail.split('@')[0] : 'Athlete');
  const athlonId = personalProfile?.athlonId || 'ATH-0000000';

  return (
    <div className="h-[calc(100vh-80px)] md:h-screen overflow-hidden bg-background text-foreground flex flex-col relative">

      {/* Main Scrollable Area */}
      <div className="relative z-10 flex-1 overflow-y-auto hide-scrollbar">

        {/* HERO SECTION (Video Container) */}
        <div className="px-6 relative z-10 mt-6 mb-6">
          <section className="relative w-full min-h-[160px] rounded-[24px] overflow-hidden bg-background border border-foreground/10 shadow-lg">

            {/* Video Background */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
              >
                <source src="/athlon-background.mp4" type="video/mp4" />
              </video>
            </div>

          </section>
        </div>

        {/* PROFILE STATS CARD */}
        <div className="px-6 relative z-10 mb-6">
          <div className="bg-[#0A101D] border border-white/5 rounded-[20px] shadow-xl overflow-hidden">

            {/* Top Section */}
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-black/50 border border-white/10 overflow-hidden shrink-0 shadow-md">
                  <img src={personalProfile?.avatar || '/placeholder.png'} alt="Profile" className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col">
                  <div className="text-[#1B9C56] font-black text-lg tracking-wide uppercase leading-tight">
                    {displayName}
                  </div>
                  <div className="text-foreground/40 text-[10px] font-mono font-bold tracking-widest mt-0.5">
                    {athlonId}
                  </div>
                </div>
              </div>

              <div className="w-px h-12 bg-white/5 mx-2" />

              <div className="flex flex-col gap-1 items-end text-right">
                <div className="text-foreground/40 text-[10px] font-black tracking-widest uppercase">
                  RATING
                </div>
                <div className="text-[#1B9C56] font-black text-3xl leading-none">
                  1200
                </div>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-3 divide-x divide-white/5">
              <div className="flex flex-col items-center justify-center p-4 py-5 gap-2">
                <div className="flex items-center gap-1.5 text-foreground/40 text-[9px] font-black tracking-widest uppercase">
                  <Activity className="w-3.5 h-3.5" /> MATCHES
                </div>
                <div className="text-white font-black text-2xl">
                  0
                </div>
              </div>

              <div className="flex flex-col items-center justify-center p-4 py-5 gap-2">
                <div className="flex items-center gap-1.5 text-foreground/40 text-[9px] font-black tracking-widest uppercase">
                  <TrendingUp className="w-3.5 h-3.5" /> WIN RATE
                </div>
                <div className="text-white font-black text-2xl flex items-baseline gap-1">
                  0 <span className="text-[#1B9C56] text-sm">%</span>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center p-4 py-5 gap-2">
                <div className="flex items-center gap-1.5 text-foreground/40 text-[9px] font-black tracking-widest uppercase">
                  <Flame className="w-3.5 h-3.5" /> RANK
                </div>
                <div className="text-white font-black text-2xl">
                  0
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* QUICK ACTIONS GRID */}
        <div className="px-6 py-4 overflow-hidden">
          <section className="flex items-center justify-between">
            {quickActions.map((action) => (
              <Link href={action.id} key={action.id} className="flex flex-col items-center gap-1.5 shrink-0">
                <div className="w-[68px] h-[68px] rounded-[16px] bg-surface border border-foreground/5 hover:border-foreground/20 flex flex-col items-center justify-center transition-colors shadow-lg cursor-pointer">
                  <action.icon className={`w-6 h-6 ${action.color.replace('text-', '') === action.color ? action.color.replace('bg-', 'text-') : action.color}`} strokeWidth={1.5} />
                </div>
                <span className="text-[10px] font-medium text-foreground/80">{action.label}</span>
              </Link>
            ))}
          </section>
        </div>

        {/* MY ORGANIZATIONS */}
        {organizations && (
          <div className="px-6 pb-6 overflow-hidden">
            <h2 className="text-[10px] font-black text-foreground/40 uppercase tracking-widest mb-4 pl-1">My Organizations</h2>
            <section className="flex items-center gap-3 overflow-x-auto pb-4 pt-1 snap-x scroll-px-6 hide-scrollbar -mx-6 px-6 md:mx-0 md:px-0">
              {organizations.map((org) => {
                const isAssoc = org.type === 'ASSOCIATION';
                const isAcad = org.type === 'ACADEMY';
                const isClub = org.type === 'CLUB';

                return (
                  <button
                    key={org.id}
                    onClick={() => {
                      window.location.href = `/org/${org.id}/dashboard`;
                    }}
                    className="flex flex-col items-center gap-2 shrink-0 snap-start max-w-[80px]"
                  >
                    <div className={`w-[68px] h-[68px] rounded-[20px] bg-surface border border-foreground/5 flex flex-col items-center justify-center transition-all shadow-md hover:shadow-xl hover:border-foreground/20 cursor-pointer`}>
                      {isAssoc && <Trophy className="w-8 h-8 text-yellow-500" strokeWidth={1.5} />}
                      {isAcad && <Building className="w-8 h-8 text-blue-500" strokeWidth={1.5} />}
                      {isClub && <Users className="w-8 h-8 text-green-500" strokeWidth={1.5} />}
                      {!isAssoc && !isAcad && !isClub && <ShieldCheck className="w-8 h-8 text-purple-500" strokeWidth={1.5} />}
                    </div>
                    <span className="text-[10px] font-medium text-foreground/80 text-center leading-tight line-clamp-2">{org.name}</span>
                  </button>
                )
              })}

              <button
                onClick={() => {
                  window.location.href = `/subscription`;
                }}
                className="flex flex-col items-center gap-2 shrink-0 snap-start max-w-[80px]"
              >
                <div className={`w-[68px] h-[68px] rounded-[20px] bg-surface/50 border border-foreground/5 border-dashed flex flex-col items-center justify-center transition-all shadow-sm hover:shadow-md hover:border-foreground/20 cursor-pointer`}>
                  <Plus className="w-8 h-8 text-foreground/40" strokeWidth={1.5} />
                </div>
                <span className="text-[10px] font-medium text-foreground/80 text-center leading-tight line-clamp-2">Add New</span>
              </button>
            </section>
          </div>
        )}

        {/* LIVE SCORES WIDGET (Positioned below My Organizations) */}
        {liveScores.length > 0 && (
          <div className="px-6 pb-6 overflow-hidden">
            <div className="flex items-center justify-between mb-3.5 pl-1 pr-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <h2 className="text-[10px] font-black text-foreground/70 uppercase tracking-widest">Live Now</h2>
              </div>
              <Link href="/live-score" className="text-[10px] font-bold text-red-500 hover:underline uppercase tracking-wider">
                See All ({liveScores.length})
              </Link>
            </div>

            <div className="flex items-stretch gap-4 overflow-x-auto pb-4 snap-x scroll-px-6 hide-scrollbar -mx-6 px-6 md:mx-0 md:px-0">
              {liveScores.map((score) => {
                const meta = score.scoreMeta || {};
                const config = meta.config || {};
                const teamAPlayers = config.teamA || [];
                const teamBPlayers = config.teamB || [];
                const teamAName = config.teamAName || (teamAPlayers.length ? teamAPlayers.join(' & ') : 'Team A');
                const teamBName = config.teamBName || (teamBPlayers.length ? teamBPlayers.join(' & ') : 'Team B');
                const currentGameIndex = meta.currentGameIndex || 0;
                const games = meta.games || [];
                const currentGame = games[currentGameIndex] || {};
                const scoreA = currentGame.scoreA ?? (score.teamAScore || 0);
                const scoreB = currentGame.scoreB ?? (score.teamBScore || 0);
                const setsWonA = games.filter((g: any) => g.winner === 'A').length;
                const setsWonB = games.filter((g: any) => g.winner === 'B').length;
                const isServing = currentGame.currentServer;

                return (
                  <div key={score.scoreId} className="snap-start shrink-0 w-[calc(100vw-3rem)] sm:w-[340px] md:w-[360px] max-w-[380px]">
                    <Link
                      href={`/live-score/${score.matchUuid}`}
                      className="block h-full rounded-[22px] overflow-hidden shadow-2xl group relative transition-all hover:scale-[1.02] hover:shadow-red-500/10"
                    >
                      {/* Gradient Background with Glass Layer */}
                      <div className="relative bg-gradient-to-br from-[#0d1117] via-[#111827] to-[#0f172a] p-[1px] rounded-[22px] h-full">
                        <div className="absolute inset-0 rounded-[22px] bg-gradient-to-br from-red-500/20 via-transparent to-emerald-500/10 opacity-60" />
                        <div className="relative bg-[#0d1117]/95 backdrop-blur-md rounded-[22px] overflow-hidden h-full flex flex-col justify-between">

                          {/* Top Strip: LIVE badge + Court + Game */}
                          <div>
                            <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
                              <span className="inline-flex items-center gap-1.5 px-2 py-[3px] rounded-full text-[9px] font-black uppercase tracking-widest bg-red-500/15 text-red-400 border border-red-500/25">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> Live
                              </span>
                              <div className="flex items-center gap-2 text-[9px] font-bold text-white/40 uppercase tracking-wider">
                                <span>{config.courtName || 'Court'}</span>
                                <span className="text-white/15">•</span>
                                <span>Game {currentGameIndex + 1}</span>
                              </div>
                            </div>

                            {/* Main Score Section */}
                            <div className="px-4 py-3">
                              <div className="flex items-stretch gap-3">

                                {/* Team A Column */}
                                <div className="flex-1 min-w-0 space-y-1.5">
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black shrink-0 ${isServing === 'A'
                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                                        : 'bg-white/5 text-white/40 border border-white/10'
                                      }`}>
                                      {isServing === 'A' && <Zap className="w-3.5 h-3.5" />}
                                      {isServing !== 'A' && 'A'}
                                    </div>
                                    <span className={`text-2xl font-black tabular-nums ${Number(scoreA) > Number(scoreB) ? 'text-emerald-400' : 'text-white/90'}`}>
                                      {scoreA}
                                    </span>
                                  </div>
                                  {teamAPlayers.length > 0 ? teamAPlayers.map((p: string, i: number) => (
                                    <div key={i} className="flex items-center gap-1.5">
                                      <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                                        <span className="text-[8px] font-black text-emerald-400">{p.charAt(0)}</span>
                                      </div>
                                      <span className="text-[11px] font-bold text-white/80 leading-tight truncate">{p}</span>
                                    </div>
                                  )) : (
                                    <span className="text-[11px] font-bold text-white/60 truncate block">{teamAName}</span>
                                  )}
                                </div>

                                {/* Center Divider with VS + Set Dots */}
                                <div className="flex flex-col items-center justify-center gap-2 px-1">
                                  <div className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center">
                                    <span className="text-[9px] font-black text-white/25 uppercase">vs</span>
                                  </div>
                                  {/* Set indicator dots */}
                                  {games.length > 1 && (
                                    <div className="flex flex-col items-center gap-[3px]">
                                      {games.map((_: any, gi: number) => (
                                        <div key={gi} className={`w-1.5 h-1.5 rounded-full ${gi === currentGameIndex
                                            ? 'bg-red-400 shadow-[0_0_4px_rgba(239,68,68,0.6)]'
                                            : games[gi]?.winner === 'A'
                                              ? 'bg-emerald-400/80'
                                              : games[gi]?.winner === 'B'
                                                ? 'bg-amber-400/80'
                                                : 'bg-white/15'
                                          }`} />
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* Team B Column */}
                                <div className="flex-1 min-w-0 space-y-1.5 text-right">
                                  <div className="flex items-center justify-end gap-2 mb-2">
                                    <span className={`text-2xl font-black tabular-nums ${Number(scoreB) > Number(scoreA) ? 'text-amber-400' : 'text-white/90'}`}>
                                      {scoreB}
                                    </span>
                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black shrink-0 ${isServing === 'B'
                                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.3)]'
                                        : 'bg-white/5 text-white/40 border border-white/10'
                                      }`}>
                                      {isServing === 'B' && <Zap className="w-3.5 h-3.5" />}
                                      {isServing !== 'B' && 'B'}
                                    </div>
                                  </div>
                                  {teamBPlayers.length > 0 ? teamBPlayers.map((p: string, i: number) => (
                                    <div key={i} className="flex items-center justify-end gap-1.5">
                                      <span className="text-[11px] font-bold text-white/80 leading-tight truncate">{p}</span>
                                      <div className="w-5 h-5 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                                        <span className="text-[8px] font-black text-amber-400">{p.charAt(0)}</span>
                                      </div>
                                    </div>
                                  )) : (
                                    <span className="text-[11px] font-bold text-white/60 truncate block">{teamBName}</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Sets Won Bar (only if any set completed) */}
                            {(setsWonA > 0 || setsWonB > 0) && (
                              <div className="mx-4 mb-2 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-white/30">
                                <span className="text-emerald-400/80">{setsWonA}</span>
                                <div className="flex-1 h-[2px] rounded-full bg-white/5 overflow-hidden">
                                  <div className="h-full bg-gradient-to-r from-emerald-500/60 to-emerald-500/20 rounded-full" style={{ width: `${(setsWonA / (setsWonA + setsWonB || 1)) * 100}%` }} />
                                </div>
                                <span>Sets</span>
                                <div className="flex-1 h-[2px] rounded-full bg-white/5 overflow-hidden">
                                  <div className="h-full bg-gradient-to-l from-amber-500/60 to-amber-500/20 rounded-full ml-auto" style={{ width: `${(setsWonB / (setsWonA + setsWonB || 1)) * 100}%` }} />
                                </div>
                                <span className="text-amber-400/80">{setsWonB}</span>
                              </div>
                            )}
                          </div>

                          {/* Footer: Tournament + Watch CTA */}
                          <div className="flex items-center justify-between px-4 py-2.5 bg-white/[0.02] border-t border-white/[0.04]">
                            <span className="text-[9px] font-bold text-white/30 uppercase tracking-wider truncate max-w-[60%]">
                              {config.tournamentName || 'Live Match'}
                            </span>
                            <span className="text-[9px] font-black text-red-400 uppercase tracking-widest flex items-center gap-0.5 group-hover:text-red-300 transition-colors">
                              Watch <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                            </span>
                          </div>

                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* UPCOMING MATCHES (MY SCHEDULE) */}
        <div className="px-6 pb-8">
          <div className="flex items-center justify-between mb-4 pl-1 pr-2">
            <h2 className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">My Schedule</h2>
            <Link href="/home/matches" className="text-[10px] font-bold text-[#1B9C56] uppercase tracking-wider flex items-center hover:underline">
              View All <ChevronRight className="w-3 h-3 ml-0.5" />
            </Link>
          </div>

          <div className="flex items-stretch gap-4 overflow-x-auto pb-4 snap-x scroll-px-6 hide-scrollbar -mx-6 px-6 md:mx-0 md:px-0">
            {userMatches.length > 0 ? (
              userMatches.map((match, i) => (
                <div key={match.id} className="snap-start shrink-0 w-[calc(100vw-3rem)] sm:w-[340px] md:w-[360px] max-w-[380px]">
                  <div className="relative bg-surface/90 backdrop-blur-xl border border-foreground/10 rounded-[22px] overflow-hidden shadow-xl hover:border-[#1B9C56]/40 transition-all group h-full flex flex-col justify-between">
                    {/* Top Gradient Line Accent */}
                    <div className="h-[3px] w-full bg-gradient-to-r from-[#1B9C56] via-amber-400 to-emerald-400" />

                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                      {/* Header Row: Tournament Title + Status Pill */}
                      <div className="flex items-start justify-between gap-3 border-b border-foreground/5 pb-2.5">
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <span className="text-[10px] font-black text-foreground/40 uppercase tracking-widest block truncate" title={match.tournament}>
                            {match.tournament}
                          </span>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-[#1B9C56]">
                            <MapPin className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{match.court}</span>
                          </div>
                        </div>

                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border shrink-0 ${match.status === 'LIVE' || match.status === 'IN_PROGRESS'
                            ? 'bg-red-500/10 text-red-400 border-red-500/20 animate-pulse'
                            : 'bg-[#1B9C56]/10 text-[#1B9C56] border-[#1B9C56]/20'
                          }`}>
                          {match.status === 'LIVE' || match.status === 'IN_PROGRESS' ? '● LIVE' : match.status}
                        </span>
                      </div>

                      {/* Verses Matchup Showcase */}
                      <div className="bg-background/80 rounded-xl p-3 border border-foreground/5 space-y-2">
                        {/* Team A */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div className="w-7 h-7 rounded-lg bg-[#1B9C56]/15 border border-[#1B9C56]/30 flex items-center justify-center text-[#1B9C56] font-black text-xs shrink-0 shadow-sm">
                              {match.teamAName.charAt(0)}
                            </div>
                            <span className="text-xs font-extrabold text-foreground leading-snug truncate" title={match.teamAName}>{match.teamAName}</span>
                          </div>
                          <span className="text-[8px] font-black text-foreground/40 uppercase tracking-wider bg-foreground/5 px-1.5 py-0.5 rounded border border-foreground/5 shrink-0">A</span>
                        </div>

                        {/* VS Divider */}
                        <div className="flex items-center gap-2 my-0.5">
                          <div className="h-[1px] flex-1 bg-foreground/10" />
                          <span className="text-[9px] font-black text-[#1B9C56] uppercase tracking-widest bg-surface px-2 py-0.5 rounded-full border border-foreground/10 shrink-0">
                            VS
                          </span>
                          <div className="h-[1px] flex-1 bg-foreground/10" />
                        </div>

                        {/* Team B */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div className="w-7 h-7 rounded-lg bg-emerald-400/15 border border-emerald-400/30 flex items-center justify-center text-emerald-400 font-black text-xs shrink-0 shadow-sm">
                              {match.teamBName.charAt(0)}
                            </div>
                            <span className="text-xs font-extrabold text-foreground leading-snug truncate" title={match.teamBName}>{match.teamBName}</span>
                          </div>
                          <span className="text-[8px] font-black text-foreground/40 uppercase tracking-wider bg-foreground/5 px-1.5 py-0.5 rounded border border-foreground/5 shrink-0">B</span>
                        </div>
                      </div>

                      {/* Footer: Date & Time */}
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-foreground/5">
                        <span className="text-[9px] font-bold text-foreground/40 uppercase tracking-wider">Time</span>
                        <div className="flex items-center gap-1.5 text-foreground/80 font-bold bg-background px-2.5 py-1 rounded-lg border border-foreground/5 text-[11px]">
                          <Clock className="w-3 h-3 text-[#1B9C56]" />
                          <span>{match.date}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="w-full bg-surface/50 border border-foreground/5 border-dashed rounded-2xl p-8 text-center flex flex-col items-center justify-center">
                <Calendar className="w-8 h-8 text-foreground/20 mb-3" />
                <span className="text-xs font-bold text-foreground/40 uppercase tracking-widest">No upcoming schedule</span>
              </div>
            )}
          </div>
        </div>

        {/* PUBLIC TOURNAMENTS */}
        {publicTournaments.length > 0 && (
          <div className="px-6 pb-8">
            <div className="flex items-center justify-between mb-4 pl-1 pr-2">
              <h2 className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Public Tournaments</h2>
              <Link href="/tournaments" className="text-[10px] font-bold text-[#1B9C56] uppercase tracking-wider flex items-center hover:underline">
                View All <ChevronRight className="w-3 h-3 ml-0.5" />
              </Link>
            </div>

            <div className="flex items-stretch gap-4 overflow-x-auto pb-4 snap-x scroll-px-6 hide-scrollbar -mx-6 px-6 md:mx-0 md:px-0">
              {publicTournaments.map(tournament => (
                <div key={tournament.tournamentId} className="snap-start shrink-0 w-[calc(100vw-3rem)] sm:w-[340px] md:w-[360px] max-w-[380px]">
                  <PublicTournamentCard tournament={tournament} />
                </div>
              ))}
            </div>
          </div>
        )}

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
        @keyframes wave {
          0% { transform: rotate(0.0deg) }
          10% { transform: rotate(14.0deg) }
          20% { transform: rotate(-8.0deg) }
          30% { transform: rotate(14.0deg) }
          40% { transform: rotate(-4.0deg) }
          50% { transform: rotate(10.0deg) }
          60% { transform: rotate(0.0deg) }
          100% { transform: rotate(0.0deg) }
        }
        .animate-wave {
          animation: wave 2.5s ease-in-out infinite;
        }
      `}} />
    </div>
  );
}
