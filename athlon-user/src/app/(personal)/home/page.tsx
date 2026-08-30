'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Trophy,
  Activity,
  TrendingUp,
  ChevronRight,
  ChevronLeft,
  MapPin,
  Calendar,
  ShieldCheck,
  Building,
  Users,
  Plus,
  Flame,
  ClipboardList,
  Clock,
  Zap,
  User,
  Settings,
  BarChart3,
  Swords,
  GraduationCap,
  BookOpen,
  LayoutDashboard,
  ArrowRight,
  CheckCircle2,
  Shield,
  AlertCircle,
  Radio,
  Play,
  Share2,
  Sparkles,
  Gavel,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useWorkspaceStore, Organization } from '@/lib/store/useWorkspaceStore';
import { TournamentService, Tournament } from '@/lib/api/tournaments';
import { TeamChampionshipService, TeamChampionship } from '@/lib/api/teamChampionship';
import { PublicTournamentCard } from '@/components/tournaments/PublicTournamentCard';
import { PublicTeamChampionshipCard } from '@/components/tournaments/PublicTeamChampionshipCard';
import { ScoreService, LiveScore } from '@/lib/api/scores';
import { MatchService, Match } from '@/lib/api/matches';
import { OrganizationService } from '@/lib/api/organization';
import { AuthService } from '@/lib/api/auth';
import { UserService, SportsProfileResponse } from '@/lib/api/user';
import { useAthlonTheme } from '@/hooks/use-athlon-theme';
import { getThemeVideo } from '@/config/theme';

import HomeRoleHeader from '@/components/home/HomeRoleHeader';
import { Athlon3DIcon } from '@/components/common/Athlon3DIcon';

/* ─── helpers ─────────────────────────────────────────────────────────────── */

const quickActions: { id: string; label: string; icon: any; icon3d: 'tournaments' | 'rankings' | 'matches' | 'registered'; desc: string }[] = [
  { id: '/home/tournaments', label: 'Tournaments', icon: Trophy, icon3d: 'tournaments', desc: 'Events & Brackets' },
  { id: '/home/rankings', label: 'Rankings', icon: TrendingUp, icon3d: 'rankings', desc: 'Global ELO Standings' },
  { id: '/home/matches', label: 'Matches', icon: Activity, icon3d: 'matches', desc: 'Schedule & Scores' },
  { id: '/home/registered', label: 'Registered', icon: ClipboardList, icon3d: 'registered', desc: 'My Entries' },
];

function orgIcon(type: string, cls = 'w-7 h-7') {
  if (type === 'ACADEMY') return <GraduationCap className={cls} strokeWidth={1.5} />;
  if (type === 'CLUB') return <Users className={cls} strokeWidth={1.5} />;
  if (type === 'ASSOCIATION') return <Trophy className={cls} strokeWidth={1.5} />;
  if (type === 'COURT') return <LayoutDashboard className={cls} strokeWidth={1.5} />;
  return <ShieldCheck className={cls} strokeWidth={1.5} />;
}

/* ─── component ───────────────────────────────────────────────────────────── */

export default function PersonalHomePage() {
  const router = useRouter();
  const { userEmail, userId, userUuid, token, isAuthenticated } = useAuthStore();
  const { personalProfile, organizations, setActiveWorkspace, setOrganizations } = useWorkspaceStore();
  const { themeKey } = useAthlonTheme();
  const backgroundVideo = getThemeVideo(themeKey);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.replace('/');
    }
  }, [mounted, isAuthenticated, router]);

  const [activeRole, setActiveRole] = useState<'PLAYER' | string>('PLAYER');

  const [publicTournaments, setPublicTournaments] = useState<Tournament[]>([]);
  const [publicChampionships, setPublicChampionships] = useState<TeamChampionship[]>([]);
  const [liveScores, setLiveScores] = useState<LiveScore[]>([]);
  const [finishedScores, setFinishedScores] = useState<LiveScore[]>([]);
  const [userMatches, setUserMatches] = useState<any[]>([]);
  const [rawUserMatches, setRawUserMatches] = useState<Match[]>([]);
  const [umpireMatches, setUmpireMatches] = useState<Match[]>([]);
  const [playerStats, setPlayerStats] = useState<SportsProfileResponse | null>(null);

  // Refs for horizontal scroll controls
  const auctionsScrollRef = useRef<HTMLDivElement>(null);
  const liveScrollRef = useRef<HTMLDivElement>(null);
  const champsScrollRef = useRef<HTMLDivElement>(null);
  const tournsScrollRef = useRef<HTMLDivElement>(null);
  const resultsScrollRef = useRef<HTMLDivElement>(null);
  const schedScrollRef = useRef<HTMLDivElement>(null);
  const lineupsScrollRef = useRef<HTMLDivElement>(null);

  const scrollContainer = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  /* ── data fetching ── */
  useEffect(() => {
    TournamentService.getAll()
      .then((res) => setPublicTournaments(res.data.filter((t: Tournament) => t.visibility === 'PUBLIC')))
      .catch(() => { });

    // Public Championships with auto-polling
    const loadPublicChampionships = () => {
      TeamChampionshipService.getAllPublic()
        .then((res: any) => {
          const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
          setPublicChampionships(list);
        })
        .catch(() => { });
    };

    loadPublicChampionships();
    const champInterval = setInterval(loadPublicChampionships, 6000);

    // Fetch real organizations from API and sync to store
    if (userUuid) {
      OrganizationService.getByUserUuid(userUuid)
        .then((res) => {
          if (res?.data?.length) {
            setOrganizations(
              res.data.map((o: any) => ({
                id: o.uuid,
                name: o.name,
                type: o.type,
                logo: o.logo,
                role: o.role || 'MEMBER',
              }))
            );
          }
        })
        .catch(() => { });
    }

    return () => clearInterval(champInterval);
  }, [userUuid, setActiveWorkspace]);

  useEffect(() => {
    if (userId) {
      MatchService.getByUser(Number(userId))
        .then((res) => {
          if (res?.data?.length) {
            const sorted = [...res.data].sort((a: Match, b: Match) => {
              const isACompleted = a.status === 'COMPLETED';
              const isBCompleted = b.status === 'COMPLETED';
              if (!isACompleted && isBCompleted) return -1;
              if (isACompleted && !isBCompleted) return 1;
              const isALive = a.status === 'LIVE' || a.status === 'IN_PROGRESS';
              const isBLive = b.status === 'LIVE' || b.status === 'IN_PROGRESS';
              if (isALive && !isBLive) return -1;
              if (!isALive && isBLive) return 1;
              const timeA = a.scheduledTime
                ? new Date(a.scheduledTime).getTime()
                : a.matchDate
                  ? new Date(a.matchDate).getTime()
                  : Infinity;
              const timeB = b.scheduledTime
                ? new Date(b.scheduledTime).getTime()
                : b.matchDate
                  ? new Date(b.matchDate).getTime()
                  : Infinity;
              if (timeA !== timeB && !isNaN(timeA) && !isNaN(timeB)) return timeA - timeB;
              return (typeof a.id === 'number' ? a.id : 0) - (typeof b.id === 'number' ? b.id : 0);
            });

            setRawUserMatches(sorted);
            setUserMatches(
              sorted.map((m: Match) => ({
                id: m.uuid || `match-${m.id}`,
                matchUuid: m.uuid,
                tournament: m.tournamentName || 'Tournament Match',
                date: m.scheduledTime
                  ? new Date(m.scheduledTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
                  : m.matchDate || 'Scheduled',
                teamAName: m.teamAName || 'Team A',
                teamBName: m.teamBName || 'Team B',
                court: m.courtName || (m.courtId ? `Court ${m.courtId}` : 'Court TBD'),
                status: m.status || 'Scheduled',
              }))
            );
          }
        })
        .catch(() => { });
    }

    // Fetch Umpiring Assignments
    if (userUuid && token) {
      AuthService.getUserProfile(userUuid, token)
        .then((profileRes) => {
          if (profileRes?.data?.phone) {
            return MatchService.getByUmpirePhone(profileRes.data.phone).catch(() => ({ data: [] }));
          }
          return { data: [] };
        })
        .then((response: any) => {
          if (response?.data && Array.isArray(response.data)) {
            const sortedUmpireMatches = [...response.data].sort((a: Match, b: Match) => {
              const isACompleted = a.status === 'COMPLETED';
              const isBCompleted = b.status === 'COMPLETED';
              if (!isACompleted && isBCompleted) return -1;
              if (isACompleted && !isBCompleted) return 1;
              const isALive = a.status === 'LIVE' || a.status === 'IN_PROGRESS';
              const isBLive = b.status === 'LIVE' || b.status === 'IN_PROGRESS';
              if (isALive && !isBLive) return -1;
              if (!isALive && isBLive) return 1;
              const timeA = a.scheduledTime
                ? new Date(a.scheduledTime).getTime()
                : a.matchDate
                  ? new Date(a.matchDate).getTime()
                  : Infinity;
              const timeB = b.scheduledTime
                ? new Date(b.scheduledTime).getTime()
                : b.matchDate
                  ? new Date(b.matchDate).getTime()
                  : Infinity;
              if (timeA !== timeB && !isNaN(timeA) && !isNaN(timeB)) return timeA - timeB;
              return (typeof a.id === 'number' ? a.id : 0) - (typeof b.id === 'number' ? b.id : 0);
            });
            setUmpireMatches(sortedUmpireMatches);
          } else {
            setUmpireMatches([]);
          }
        })
        .catch(() => {
          setUmpireMatches([]);
        });
    }

    // Fetch Player Telemetry Stats
    if (userUuid) {
      UserService.getUserStats(userUuid)
        .then((res) => {
          if (res?.success && res.data) {
            setPlayerStats(res.data);
          }
        })
        .catch(() => { });
    }

    const fetchScores = () => {
      ScoreService.getLive()
        .then((res: any) => res?.data && setLiveScores(res.data))
        .catch(() => { });

      ScoreService.getAll()
        .then((res: any) => {
          if (res?.data) {
            const finished = res.data.filter((s: LiveScore) => {
              const meta = s.scoreMeta || {};
              const games = meta.games || [];
              const wonA = games.filter((g: any) => g.winner === 'A').length;
              const wonB = games.filter((g: any) => g.winner === 'B').length;
              return (
                s.isFinal === true ||
                meta.isCompleted === true ||
                wonA >= 2 ||
                wonB >= 2 ||
                (games.length > 0 && !s.isActive)
              );
            });
            setFinishedScores(finished);
          }
        })
        .catch(() => { });
    };

    fetchScores();
    const iv = setInterval(fetchScores, 5000);
    return () => clearInterval(iv);
  }, [userId, userUuid, token]);

  const displayName = personalProfile?.name || (userEmail ? userEmail.split('@')[0] : 'Athlete');
  const athlonId = personalProfile?.athlonId || 'ATH-0000000';

  /* ── handlers ── */
  function selectRole(role: string) {
    if (role === 'PLAYER') {
      setActiveWorkspace('PERSONAL');
      setActiveRole('PLAYER');
      router.push('/home');
    } else {
      setActiveWorkspace(role);
      router.push(`/org/${role}/dashboard`);
    }
  }

  const pendingLineups = rawUserMatches.filter((m) => m.status === 'WAITING_FOR_LINEUPS');
  const liveAuctionChampionships = publicChampionships.filter(
    (c) => c.stage === 'AUCTION_STAGE' || c.stage === 'AUCTION_PAUSED' || c.stage === 'AUCTION'
  );

  return (
    <div className="bg-background text-foreground flex flex-col relative selection:bg-primary selection:text-black min-h-screen w-full max-w-full overflow-x-hidden">
      {/* ══════════════════════════════════════════════════════════════════════
          1. MOBILE VIEW ONLY (< md) - 100% UNTOUCHED ORIGINAL DESIGN
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="block md:hidden h-[calc(100vh-80px)] overflow-y-auto hide-scrollbar overscroll-contain max-w-full">
        {/* HERO VIDEO */}
        <div className="px-6 relative z-10 mt-6 mb-4">
          <section className="relative w-full min-h-[160px] rounded-[24px] overflow-hidden bg-background border border-foreground/10 shadow-lg">
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
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
            </div>
          </section>
        </div>

        {/* ROLE SWITCHER HEADER ─────────────────────── */}
        <div className="px-6 mb-5">
          <HomeRoleHeader
            activeRole={activeRole}
            onSelectRole={selectRole}
            organizations={organizations}
            showSearch={false}
            onAddClick={() => {
              window.location.href = '/subscription';
            }}
          />
        </div>

        {/* ── PLAYER CONTENT ────────────────────────────────────────────── */}
        {activeRole === 'PLAYER' && (
          <>
            {/* Profile Stats Card */}
            <div className="px-6 mb-3.5">
              <div
                className="rounded-[18px] shadow-lg overflow-hidden border border-white/[0.08] relative"
                style={{
                  background: 'linear-gradient(145deg, var(--athlon-card) 0%, rgba(14, 22, 38, 0.95) 100%)',
                }}
              >
                {/* Top Subtle Ambient Glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />

                {/* Profile Info Header */}
                <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-white/[0.06] relative z-10">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative">
                      <div className="w-9 h-9 rounded-xl bg-black/40 border border-white/10 overflow-hidden shrink-0 shadow-inner flex items-center justify-center">
                        <img
                          src={personalProfile?.avatar || '/placeholder.png'}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#0A0F1D]" />
                    </div>

                    <div className="flex flex-col min-w-0">
                      <span className="text-foreground font-bold text-xs sm:text-sm tracking-wide uppercase truncate">
                        {displayName}
                      </span>
                    </div>
                  </div>

                  {/* Win Rate Capsule */}
                  <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-2.5 py-1.5 shrink-0">
                    <div className="flex flex-col items-end">
                      <span className="text-[7.5px] font-extrabold tracking-widest uppercase text-emerald-400/80 leading-none mb-0.5">
                        WIN RATE
                      </span>
                      <span className="text-emerald-400 font-black text-sm sm:text-base leading-none">
                        {playerStats?.winRate ? `${Math.round(playerStats.winRate)}%` : '0%'}
                      </span>
                    </div>
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400 shrink-0 opacity-90" />
                  </div>
                </div>

                {/* 3 Stats Grid (Compact) */}
                <div className="grid grid-cols-3 divide-x divide-white/[0.06] bg-black/[0.15] relative z-10">
                  {[
                    { label: 'MATCHES', icon: Activity, value: String(playerStats?.totalMatches ?? 0) },
                    { label: 'WINS', icon: Trophy, value: String(playerStats?.matchesWon ?? 0) },
                    { label: 'WIN RATE', icon: TrendingUp, value: `${playerStats?.winRate ? Math.round(playerStats.winRate) : 0}%` },
                  ].map((s) => (
                    <div key={s.label} className="flex flex-col items-center justify-center py-2.5 px-2 gap-1">
                      <div className="flex items-center gap-1 text-foreground/40 text-[8px] font-extrabold tracking-wider uppercase">
                        <s.icon className="w-3 h-3 text-foreground/50" />
                        <span>{s.label}</span>
                      </div>
                      <div className="text-foreground font-bold text-xs sm:text-sm leading-tight">{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>



            {/* Quick Actions */}
            <div className="px-6 pt-2 pb-3 mb-2 overflow-hidden">
              <section className="flex items-center justify-between">
                {quickActions.map((action) => (
                  <Link href={action.id} key={action.id} className="flex flex-col items-center gap-1.5 shrink-0 group">
                    <div
                      className="w-[68px] h-[68px] rounded-[18px] flex flex-col items-center justify-center transition-all shadow-lg cursor-pointer hover:scale-105 active:scale-95 border"
                      style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                    >
                      <Athlon3DIcon type={action.icon3d} size={40} active={true} />
                    </div>
                    <span className="text-[10.5px] font-semibold transition-colors group-hover:text-primary" style={{ color: 'var(--athlon-text-secondary)' }}>
                      {action.label}
                    </span>
                  </Link>
                ))}
              </section>
            </div>

            {/* My Clubs & Workspaces (Role-Aware) */}
            {organizations && organizations.length > 0 && (
              <div className="px-6 pb-4 pt-1 overflow-hidden">
                <div className="flex items-center justify-between mb-3 pl-1 pr-1">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-primary" />
                    <h2 className="text-[10px] font-black text-foreground/70 uppercase tracking-widest">
                      Membership
                    </h2>
                  </div>
                  <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider">
                    {organizations.length} {organizations.length === 1 ? 'Org' : 'Orgs'}
                  </span>
                </div>

                <div className="flex items-stretch gap-3 overflow-x-auto pb-2 snap-x scroll-px-6 hide-scrollbar -mx-6 px-6 md:mx-0 md:px-0">
                  {organizations.map((orgItem) => {
                    const roleUpper = (orgItem.role || 'MEMBER').toUpperCase();
                    const isAdmin = roleUpper === 'ADMIN' || roleUpper === 'OWNER' || roleUpper === 'MANAGER';
                    const isCoach = roleUpper === 'COACH';
                    const isStudent = roleUpper === 'STUDENT';

                    return (
                      <div
                        key={orgItem.id}
                        className="snap-start shrink-0 w-[220px] sm:w-[240px]"
                      >
                        <button
                          onClick={() => {
                            setActiveWorkspace(orgItem.id);
                            router.push(`/org/${orgItem.id}/dashboard`);
                          }}
                          className="w-full text-left p-3.5 rounded-[20px] border bg-gradient-to-br from-surface via-surface to-background/60 hover:border-primary/50 transition-all group shadow-md flex flex-col justify-between h-full space-y-2.5"
                          style={{
                            borderColor: 'var(--athlon-border)',
                          }}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="w-9 h-9 rounded-xl bg-black/40 border border-white/10 overflow-hidden flex items-center justify-center text-base shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                              {orgItem.logo ? (
                                <img src={orgItem.logo} alt={orgItem.name} className="w-full h-full object-cover" />
                              ) : (
                                <Athlon3DIcon
                                  type={
                                    orgItem.type === 'CLUB'
                                      ? 'members'
                                      : orgItem.type === 'ACADEMY'
                                        ? 'students'
                                        : 'tournaments'
                                  }
                                  size={22}
                                  active={true}
                                />
                              )}
                            </div>

                            {/* Role Badge */}
                            <span
                              className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${isAdmin
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : isCoach
                                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                  : isStudent
                                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                }`}
                            >
                              {isAdmin ? '👑 Admin' : isCoach ? '🧢 Coach' : isStudent ? '🎓 Student' : '👤 Member'}
                            </span>
                          </div>

                          <div>
                            <h4 className="text-xs font-black text-foreground truncate group-hover:text-primary transition-colors">
                              {orgItem.name}
                            </h4>
                            <span className="text-[9.5px] font-semibold text-foreground/40 uppercase tracking-wider block mt-0.5">
                              {orgItem.type}
                            </span>
                          </div>

                          <div className="pt-2 border-t border-foreground/5 flex items-center justify-between text-[10px] font-extrabold text-primary">
                            <span>Open</span>
                            <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Live Scores */}
            {liveScores.length > 0 && (
              <div className="px-6 pb-6 pt-3 mt-3 overflow-hidden">
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
                    const gi = meta.currentGameIndex || 0;
                    const games = meta.games || [];
                    const cur = games[gi] || {};
                    const scoreA = cur.scoreA ?? (score.teamAScore || 0);
                    const scoreB = cur.scoreB ?? (score.teamBScore || 0);
                    const setsWonA = games.filter((g: any) => g.winner === 'A').length;
                    const setsWonB = games.filter((g: any) => g.winner === 'B').length;
                    const isServing = cur.currentServer;
                    return (
                      <div key={score.scoreId} className="snap-start shrink-0 w-[calc(100vw-3rem)] sm:w-[340px] md:w-[360px] max-w-[380px]">
                        <Link
                          href={`/live-score/${score.matchUuid}`}
                          className="block h-full rounded-[22px] overflow-hidden shadow-2xl group relative transition-all hover:scale-[1.02]"
                        >
                          <div className="relative bg-gradient-to-br from-[#0d1117] via-[#111827] to-[#0f172a] p-[1px] rounded-[22px] h-full">
                            <div className="absolute inset-0 rounded-[22px] bg-gradient-to-br from-red-500/20 via-transparent to-emerald-500/10 opacity-60" />
                            <div className="relative bg-[#0d1117]/95 backdrop-blur-md rounded-[22px] overflow-hidden h-full flex flex-col justify-between">
                              <div>
                                <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
                                  <span className="inline-flex items-center gap-1.5 px-2 py-[3px] rounded-full text-[9px] font-black uppercase tracking-widest bg-red-500/15 text-red-400 border border-red-500/25">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> Live
                                  </span>
                                  <div className="flex items-center gap-2 text-[9px] font-bold text-white/40 uppercase tracking-wider">
                                    <span>{config.courtName || 'Court'}</span>
                                    <span className="text-white/15">•</span>
                                    <span>Game {gi + 1}</span>
                                  </div>
                                </div>
                                <div className="px-4 py-3">
                                  <div className="flex items-stretch gap-3">
                                    <div className="flex-1 min-w-0 space-y-1.5">
                                      <div className="flex items-center gap-2 mb-2">
                                        <div
                                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black shrink-0 ${isServing === 'A'
                                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                            : 'bg-white/5 text-white/40 border border-white/10'
                                            }`}
                                        >
                                          {isServing === 'A' ? <Zap className="w-3.5 h-3.5" /> : 'A'}
                                        </div>
                                        <span
                                          className={`text-2xl font-black tabular-nums ${Number(scoreA) > Number(scoreB) ? 'text-emerald-400' : 'text-white/90'
                                            }`}
                                        >
                                          {scoreA}
                                        </span>
                                      </div>
                                      {teamAPlayers.length > 0 ? (
                                        teamAPlayers.map((p: string, i: number) => (
                                          <div key={i} className="flex items-center gap-1.5">
                                            <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                                              <span className="text-[8px] font-black text-emerald-400">{p.charAt(0)}</span>
                                            </div>
                                            <span className="text-[11px] font-bold text-white/80 truncate">{p}</span>
                                          </div>
                                        ))
                                      ) : (
                                        <span className="text-[11px] font-bold text-white/60 truncate block">{teamAName}</span>
                                      )}
                                    </div>
                                    <div className="flex flex-col items-center justify-center gap-2 px-1">
                                      <div className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center">
                                        <span className="text-[9px] font-black text-white/25 uppercase">vs</span>
                                      </div>
                                      {games.length > 1 && (
                                        <div className="flex flex-col items-center gap-[3px]">
                                          {games.map((_: any, idx: number) => (
                                            <div
                                              key={idx}
                                              className={`w-1.5 h-1.5 rounded-full ${idx === gi
                                                ? 'bg-red-400'
                                                : games[idx]?.winner === 'A'
                                                  ? 'bg-emerald-400/80'
                                                  : games[idx]?.winner === 'B'
                                                    ? 'bg-amber-400/80'
                                                    : 'bg-white/15'
                                                }`}
                                            />
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0 space-y-1.5 text-right">
                                      <div className="flex items-center justify-end gap-2 mb-2">
                                        <span
                                          className={`text-2xl font-black tabular-nums ${Number(scoreB) > Number(scoreA) ? 'text-amber-400' : 'text-white/90'
                                            }`}
                                        >
                                          {scoreB}
                                        </span>
                                        <div
                                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black shrink-0 ${isServing === 'B'
                                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                            : 'bg-white/5 text-white/40 border border-white/10'
                                            }`}
                                        >
                                          {isServing === 'B' ? <Zap className="w-3.5 h-3.5" /> : 'B'}
                                        </div>
                                      </div>
                                      {teamBPlayers.length > 0 ? (
                                        teamBPlayers.map((p: string, i: number) => (
                                          <div key={i} className="flex items-center justify-end gap-1.5">
                                            <span className="text-[11px] font-bold text-white/80 truncate">{p}</span>
                                            <div className="w-5 h-5 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                                              <span className="text-[8px] font-black text-amber-400">{p.charAt(0)}</span>
                                            </div>
                                          </div>
                                        ))
                                      ) : (
                                        <span className="text-[11px] font-bold text-white/60 truncate block">{teamBName}</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                {(setsWonA > 0 || setsWonB > 0) && (
                                  <div className="mx-4 mb-2 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-white/30">
                                    <span className="text-emerald-400/80">{setsWonA}</span>
                                    <div className="flex-1 h-[2px] rounded-full bg-white/5 overflow-hidden">
                                      <div
                                        className="h-full bg-gradient-to-r from-emerald-500/60 to-emerald-500/20 rounded-full"
                                        style={{ width: `${(setsWonA / (setsWonA + setsWonB || 1)) * 100}%` }}
                                      />
                                    </div>
                                    <span>Sets</span>
                                    <div className="flex-1 h-[2px] rounded-full bg-white/5 overflow-hidden">
                                      <div
                                        className="h-full bg-gradient-to-l from-amber-500/60 to-amber-500/20 rounded-full ml-auto"
                                        style={{ width: `${(setsWonB / (setsWonA + setsWonB || 1)) * 100}%` }}
                                      />
                                    </div>
                                    <span className="text-amber-400/80">{setsWonB}</span>
                                  </div>
                                )}
                              </div>
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

            {/* Finished Match Results */}
            {finishedScores.length > 0 && (
              <div className="px-6 pb-6 pt-3 mt-4 overflow-hidden">
                <div className="flex items-center justify-between mb-3.5 pl-1 pr-1">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-primary" />
                    <h2 className="text-[10px] font-black text-foreground/70 uppercase tracking-widest">
                      Recent Match Results
                    </h2>
                  </div>
                  <Link
                    href="/live-score"
                    className="text-[10px] font-bold text-primary hover:underline uppercase tracking-wider flex items-center"
                  >
                    View All ({finishedScores.length}) <ChevronRight className="w-3 h-3 ml-0.5" />
                  </Link>
                </div>

                <div className="flex items-stretch gap-4 overflow-x-auto pb-4 snap-x scroll-px-6 hide-scrollbar -mx-6 px-6 md:mx-0 md:px-0">
                  {finishedScores.map((score) => {
                    const meta = score.scoreMeta || {};
                    const config = meta.config || {};
                    const teamAPlayers = config.teamA || [];
                    const teamBPlayers = config.teamB || [];
                    const teamAName = config.teamAName || (teamAPlayers.length ? teamAPlayers.join(' & ') : 'Team A');
                    const teamBName = config.teamBName || (teamBPlayers.length ? teamBPlayers.join(' & ') : 'Team B');
                    const games = meta.games || [];
                    const setsWonA = games.filter((g: any) => g.winner === 'A').length;
                    const setsWonB = games.filter((g: any) => g.winner === 'B').length;
                    const winner = setsWonA > setsWonB ? 'A' : setsWonB > setsWonA ? 'B' : null;

                    return (
                      <div
                        key={score.scoreId}
                        className="snap-start shrink-0 w-[calc(100vw-3rem)] sm:w-[320px] md:w-[340px] max-w-[360px]"
                      >
                        <Link
                          href={`/live-score/${score.matchUuid}`}
                          className="block h-full rounded-[22px] overflow-hidden shadow-xl border relative transition-all hover:border-primary/50 group"
                          style={{
                            backgroundColor: 'var(--athlon-card)',
                            borderColor: 'var(--athlon-border)',
                          }}
                        >
                          <div className="h-[2px] w-full bg-emerald-500" />
                          <div className="p-4 space-y-3 flex flex-col justify-between h-full">
                            <div className="flex items-center justify-between">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                                <CheckCircle2 className="w-2.5 h-2.5" /> Completed
                              </span>
                              <span className="text-[9px] font-bold text-foreground/45 uppercase tracking-wider truncate max-w-[150px]">
                                {config.tournamentName || 'Tournament Match'}
                              </span>
                            </div>

                            {/* Teams & Scores */}
                            <div
                              className="rounded-xl p-3 border space-y-2"
                              style={{
                                backgroundColor: 'var(--athlon-surface)',
                                borderColor: 'var(--athlon-border-subtle)',
                              }}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className="w-6 h-6 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-black text-primary shrink-0">
                                    {teamAName.charAt(0)}
                                  </div>
                                  <span
                                    className={`text-xs truncate ${winner === 'A' ? 'font-black text-foreground' : 'font-medium text-foreground/70'
                                      }`}
                                  >
                                    {teamAName}
                                  </span>
                                </div>
                                <span
                                  className={`text-xs font-black font-mono tabular-nums ${winner === 'A' ? 'text-emerald-400 font-black' : 'text-foreground/60'
                                    }`}
                                >
                                  {setsWonA}
                                </span>
                              </div>

                              <div
                                className="flex items-center justify-between gap-2 border-t pt-2"
                                style={{ borderColor: 'var(--athlon-border-subtle)' }}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-foreground/70 shrink-0">
                                    {teamBName.charAt(0)}
                                  </div>
                                  <span
                                    className={`text-xs truncate ${winner === 'B' ? 'font-black text-foreground' : 'font-medium text-foreground/70'
                                      }`}
                                  >
                                    {teamBName}
                                  </span>
                                </div>
                                <span
                                  className={`text-xs font-black font-mono tabular-nums ${winner === 'B' ? 'text-emerald-400 font-black' : 'text-foreground/60'
                                    }`}
                                >
                                  {setsWonB}
                                </span>
                              </div>
                            </div>

                            {/* Sets breakdown & CTA */}
                            <div
                              className="flex items-center justify-between pt-2 border-t text-[10px]"
                              style={{ borderColor: 'var(--athlon-border-subtle)' }}
                            >
                              {games.length > 0 ? (
                                <div className="flex items-center gap-1.5 flex-wrap text-foreground/60">
                                  <span className="font-bold text-foreground/40 text-[9px] uppercase">Sets:</span>
                                  {games.map((g: any, gIdx: number) => (
                                    <span key={gIdx} className="px-1.5 py-0.2 rounded bg-white/5 font-mono font-bold text-[9px]">
                                      {g.scoreA ?? 0}–{g.scoreB ?? 0}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-[9px] text-foreground/40 font-bold uppercase">Finished</span>
                              )}

                              <span className="text-[9px] font-bold text-primary flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform shrink-0 ml-2">
                                Scorecard <ChevronRight className="w-3 h-3" />
                              </span>
                            </div>
                          </div>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Live Player Auctions Showcase (Mobile) */}
            {liveAuctionChampionships.length > 0 && (
              <div className="px-6 pb-6 pt-2 overflow-hidden">
                <div className="flex items-center justify-between mb-3.5 pl-1 pr-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                    <h2 className="text-[10px] font-black text-red-500 uppercase tracking-widest">
                      Live Player Auctions ({liveAuctionChampionships.length})
                    </h2>
                  </div>
                  <span className="text-[9px] font-black text-red-400 uppercase tracking-wider">
                    🔴 Broadcasting
                  </span>
                </div>

                <div className="flex items-stretch gap-4 overflow-x-auto pb-4 snap-x scroll-px-6 hide-scrollbar -mx-6 px-6 md:mx-0 md:px-0">
                  {liveAuctionChampionships.map((champ) => (
                    <div
                      key={champ.championshipUuid}
                      className="snap-start shrink-0 w-[calc(100vw-3rem)] sm:w-[320px] md:w-[340px] max-w-[360px]"
                    >
                      <Link
                        href={`/home/team-championship/${champ.championshipUuid}/auction`}
                        className="block h-full rounded-[22px] overflow-hidden shadow-xl border relative transition-all hover:border-red-500/50 group"
                        style={{
                          backgroundColor: 'var(--athlon-card)',
                          borderColor: 'rgba(239, 68, 68, 0.4)',
                        }}
                      >
                        <div className="h-[2px] w-full bg-gradient-to-r from-red-500 via-rose-500 to-primary animate-pulse" />
                        <div className="p-4 space-y-3 flex flex-col justify-between h-full">
                          <div className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-red-500/15 text-red-400 border border-red-500/25">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" /> Live Auction
                            </span>
                            <span className="text-[9px] font-bold text-foreground/45 uppercase tracking-wider truncate max-w-[140px]">
                              {champ.sport || 'Badminton'}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <h3 className="text-sm font-black text-foreground tracking-tight line-clamp-1">
                              {champ.name}
                            </h3>
                            <p className="text-[11px] text-foreground/60 line-clamp-1">
                              {champ.location || champ.venue || 'Arena'} • Live Draft Floor
                            </p>
                          </div>

                          <div
                            className="rounded-xl p-2.5 border flex items-center justify-between text-xs"
                            style={{
                              backgroundColor: 'var(--athlon-surface)',
                              borderColor: 'var(--athlon-border-subtle)',
                            }}
                          >
                            <span className="text-foreground/60 font-semibold text-[11px]">Franchises:</span>
                            <span className="font-mono font-black text-primary text-xs">
                              {champ.registeredTeamsCount || champ.maxTeams || 0} Teams
                            </span>
                          </div>

                          <div className="w-full py-2.5 bg-gradient-to-r from-red-500 via-rose-500 to-primary text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-red-500/25">
                            <Gavel className="w-3.5 h-3.5" />
                            <span>Enter Live Arena</span>
                            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Team Championships (Auctions & Leagues) */}
            {publicChampionships.length > 0 && (
              <div className="px-6 pb-6 pt-2 overflow-hidden">
                <div className="flex items-center justify-between mb-3.5 pl-1 pr-1">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    <h2 className="text-[10px] font-black text-foreground/70 uppercase tracking-widest">
                      Team Championships ({publicChampionships.length})
                    </h2>
                  </div>
                  <Link
                    href="/tournaments"
                    className="text-[10px] font-bold text-primary hover:underline uppercase tracking-wider flex items-center"
                  >
                    View All <ChevronRight className="w-3 h-3 ml-0.5" />
                  </Link>
                </div>

                <div className="flex items-stretch gap-4 overflow-x-auto pb-4 snap-x scroll-px-6 hide-scrollbar -mx-6 px-6 md:mx-0 md:px-0">
                  {publicChampionships.map((c) => (
                    <div
                      key={c.championshipId || c.championshipUuid}
                      className="snap-start shrink-0 w-[calc(100vw-3rem)] sm:w-[320px] md:w-[340px] max-w-[360px]"
                    >
                      <PublicTeamChampionshipCard championship={c} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tournaments (Open, Ongoing & Finished) */}
            {publicTournaments.length > 0 && (
              <div className="px-6 pb-6 pt-2 overflow-hidden">
                <div className="flex items-center justify-between mb-3.5 pl-1 pr-1">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-primary" />
                    <h2 className="text-[10px] font-black text-foreground/70 uppercase tracking-widest">
                      Tournaments ({publicTournaments.length})
                    </h2>
                  </div>
                  <Link
                    href="/home/tournaments"
                    className="text-[10px] font-bold text-primary hover:underline uppercase tracking-wider flex items-center"
                  >
                    View All <ChevronRight className="w-3 h-3 ml-0.5" />
                  </Link>
                </div>

                <div className="flex items-stretch gap-4 overflow-x-auto pb-4 snap-x scroll-px-6 hide-scrollbar -mx-6 px-6 md:mx-0 md:px-0">
                  {publicTournaments.map((t) => (
                    <div
                      key={t.tournamentId || t.tournamentUuid}
                      className="snap-start shrink-0 w-[calc(100vw-3rem)] sm:w-[320px] md:w-[340px] max-w-[360px]"
                    >
                      <PublicTournamentCard tournament={t} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Required: Pending Lineups */}
            {pendingLineups.length > 0 && (
              <div className="px-6 pb-6 pt-2">
                <div className="flex items-center justify-between mb-3.5 pl-1 pr-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                    <h2 className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Action Required</h2>
                  </div>
                  <Link
                    href="/home/matches"
                    className="text-[10px] font-bold text-orange-500 hover:underline uppercase tracking-wider flex items-center"
                  >
                    View All <ChevronRight className="w-3 h-3 ml-0.5" />
                  </Link>
                </div>
                <div className="flex items-stretch gap-4 overflow-x-auto pb-4 snap-x scroll-px-6 hide-scrollbar -mx-6 px-6 md:mx-0 md:px-0">
                  {pendingLineups.map((match) => {
                    const isAApproved = match.teamALineupStatus === 'APPROVED';
                    const isBApproved = match.teamBLineupStatus === 'APPROVED';
                    const isASubmitted = match.teamALineupStatus === 'SUBMITTED' || isAApproved;
                    const isBSubmitted = match.teamBLineupStatus === 'SUBMITTED' || isBApproved;
                    const bothApproved = isAApproved && isBApproved;
                    const hasSubmitted = isASubmitted || isBSubmitted;

                    const statusBadgeText = bothApproved
                      ? 'Lineups Approved'
                      : hasSubmitted
                        ? 'Lineup Submitted'
                        : 'Pending Lineup';

                    const statusBadgeClass = bothApproved
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : hasSubmitted
                        ? 'bg-primary/20 text-primary border border-primary/30'
                        : 'bg-orange-500/20 text-orange-500 border border-orange-500/30';

                    const cardBgClass = bothApproved
                      ? 'bg-emerald-500/5 border-emerald-500/20'
                      : hasSubmitted
                        ? 'bg-primary/5 border-primary/20'
                        : 'bg-orange-500/5 border-orange-500/25';

                    const dateStr = match.scheduledTime || match.matchDate;
                    let formattedDate = 'Date TBA';
                    let formattedTime = 'Time TBA';
                    if (dateStr) {
                      const d = new Date(dateStr);
                      if (!isNaN(d.getTime())) {
                        formattedDate = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                        formattedTime = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                      }
                    }
                    return (
                      <div
                        key={match.id}
                        className="snap-start shrink-0 w-[calc(100vw-3rem)] sm:w-[340px] md:w-[360px] max-w-[380px]"
                      >
                        <div className={`rounded-[18px] border p-4 flex flex-col gap-3 h-full transition-all ${cardBgClass}`}>
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${statusBadgeClass}`}
                              >
                                {statusBadgeText}
                              </span>
                              <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">
                                Team Event
                              </span>
                            </div>
                            <AlertCircle
                              className={`w-4 h-4 shrink-0 ${bothApproved ? 'text-emerald-400' : hasSubmitted ? 'text-primary' : 'text-orange-500'
                                }`}
                            />
                          </div>

                          <h3 className="text-sm font-black tracking-tight text-foreground">
                            {match.teamAName && match.teamBName
                              ? `${match.teamAName} vs ${match.teamBName}`
                              : `Team Event Match #${match.id}`}
                          </h3>

                          <div className="flex flex-wrap items-center gap-3 text-[10px] font-semibold text-foreground/50">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-primary" /> {formattedDate}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-amber-400" /> {formattedTime}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-emerald-400" />{' '}
                              {match.courtName || (match.courtId ? `Court ${match.courtId}` : 'Court TBD')}
                            </div>
                          </div>

                          <button
                            onClick={() => router.push(`/home/team-events/${match.uuid}/lineup`)}
                            className={`mt-auto w-full py-2.5 text-xs font-black uppercase tracking-widest rounded-xl active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 ${bothApproved
                              ? 'bg-emerald-500 hover:bg-emerald-600 text-black'
                              : hasSubmitted
                                ? 'bg-primary hover:bg-primary-hover text-black'
                                : 'bg-orange-500 hover:bg-orange-600 text-white'
                              }`}
                          >
                            {hasSubmitted ? (
                              <>
                                <CheckCircle2 className="w-4 h-4" /> View Lineup
                              </>
                            ) : (
                              <>
                                <ClipboardList className="w-4 h-4" /> Submit Lineup
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* My Schedule */}
            {userMatches.length > 0 && (
              <div className="px-6 pb-8">
                <div className="flex items-center justify-between mb-4 pl-1 pr-2">
                  <h2 className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">My Schedule</h2>
                  <Link
                    href="/home/matches"
                    className="text-[10px] font-bold text-primary uppercase tracking-wider flex items-center hover:underline"
                  >
                    View All <ChevronRight className="w-3 h-3 ml-0.5" />
                  </Link>
                </div>
                <div className="flex items-stretch gap-4 overflow-x-auto pb-4 snap-x scroll-px-6 hide-scrollbar -mx-6 px-6 md:mx-0 md:px-0">
                  {userMatches.map((match) => (
                    <div
                      key={match.id}
                      className="snap-start shrink-0 w-[calc(100vw-3rem)] sm:w-[340px] md:w-[360px] max-w-[380px]"
                    >
                      <div
                        className="relative rounded-[22px] overflow-hidden shadow-xl border h-full flex flex-col justify-between"
                        style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                      >
                        <div className="h-[3px] w-full bg-gradient-to-r from-primary via-amber-400 to-emerald-400" />
                        <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                          <div className="flex items-start justify-between gap-3 border-b border-foreground/5 pb-2.5">
                            <div className="space-y-0.5 min-w-0 flex-1">
                              <span className="text-[10px] font-black text-foreground/40 uppercase tracking-widest block truncate">
                                {match.tournament}
                              </span>
                              <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                                <MapPin className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate">{match.court}</span>
                              </div>
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border shrink-0 ${match.status === 'LIVE' || match.status === 'IN_PROGRESS'
                                ? 'bg-red-500/10 text-red-400 border-red-500/20 animate-pulse'
                                : 'bg-primary/10 text-primary border-primary/20'
                                }`}
                            >
                              {match.status === 'LIVE' || match.status === 'IN_PROGRESS' ? '● LIVE' : match.status}
                            </span>
                          </div>
                          <div
                            className="rounded-xl p-3 border space-y-2"
                            style={{
                              backgroundColor: 'var(--athlon-surface)',
                              borderColor: 'var(--athlon-border-subtle)',
                            }}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <div className="w-7 h-7 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center text-primary font-black text-xs shrink-0">
                                  {match.teamAName.charAt(0)}
                                </div>
                                <span className="text-xs font-extrabold text-foreground truncate">{match.teamAName}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 my-0.5">
                              <div className="h-[1px] flex-1 bg-foreground/10" />
                              <span className="text-[9px] font-black text-primary uppercase tracking-widest bg-surface px-2 py-0.5 rounded-full border border-foreground/10 shrink-0">
                                VS
                              </span>
                              <div className="h-[1px] flex-1 bg-foreground/10" />
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <div className="w-7 h-7 rounded-lg bg-emerald-400/15 border border-emerald-400/30 flex items-center justify-center text-emerald-400 font-black text-xs shrink-0">
                                  {match.teamBName.charAt(0)}
                                </div>
                                <span className="text-xs font-extrabold text-foreground truncate">{match.teamBName}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-xs pt-1 border-t border-foreground/5">
                            <span className="text-[9px] font-bold text-foreground/40 uppercase tracking-wider">Time</span>
                            <div className="flex items-center gap-1.5 text-foreground/80 font-bold bg-background px-2.5 py-1 rounded-lg border border-foreground/5 text-[11px]">
                              <Clock className="w-3 h-3 text-primary" />
                              <span>{match.date}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Umpiring Assignments */}
            {umpireMatches.length > 0 && (
              <div className="px-6 pb-8">
                <div className="flex items-center justify-between mb-4 pl-1 pr-2">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-red-400" />
                    <h2 className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">
                      Umpiring Assignments ({umpireMatches.length})
                    </h2>
                  </div>
                  <Link
                    href="/home/matches"
                    className="text-[10px] font-bold text-red-400 uppercase tracking-wider flex items-center hover:underline"
                  >
                    View All <ChevronRight className="w-3 h-3 ml-0.5" />
                  </Link>
                </div>

                <div className="flex items-stretch gap-4 overflow-x-auto pb-4 snap-x scroll-px-6 hide-scrollbar -mx-6 px-6 md:mx-0 md:px-0">
                  {umpireMatches.map((match) => {
                    const isLive = match.status === 'LIVE' || match.status === 'IN_PROGRESS';
                    const isCompleted = match.status === 'COMPLETED';
                    const dateStr = match.scheduledTime || match.matchDate;
                    let formattedTime = 'Time TBA';
                    if (dateStr) {
                      const d = new Date(dateStr);
                      if (!isNaN(d.getTime())) {
                        formattedTime = d.toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
                      }
                    }

                    return (
                      <div
                        key={match.id || match.uuid}
                        className="snap-start shrink-0 w-[calc(100vw-3rem)] sm:w-[340px] md:w-[360px] max-w-[380px]"
                      >
                        <div
                          className="relative rounded-[22px] overflow-hidden shadow-xl border h-full flex flex-col justify-between"
                          style={{
                            backgroundColor: 'var(--athlon-card)',
                            borderColor: 'var(--athlon-border)',
                          }}
                        >
                          <div className="h-[3px] w-full bg-gradient-to-r from-red-500 via-rose-500 to-amber-500" />

                          <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                            <div className="flex items-start justify-between gap-3 border-b border-foreground/5 pb-2.5">
                              <div className="space-y-0.5 min-w-0 flex-1">
                                <span className="text-[10px] font-black text-foreground/40 uppercase tracking-widest block truncate">
                                  {match.tournamentName || 'Tournament Match'}
                                </span>
                                <div className="flex items-center gap-1.5 text-xs font-bold text-red-400">
                                  <MapPin className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                                  <span className="truncate">
                                    {match.courtName || (match.courtId ? `Court ${match.courtId}` : 'Court TBD')}
                                  </span>
                                </div>
                              </div>

                              <span
                                className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border shrink-0 ${isLive
                                  ? 'bg-red-500/15 text-red-400 border-red-500/30 animate-pulse'
                                  : isCompleted
                                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                                  }`}
                              >
                                {isLive ? '● LIVE' : isCompleted ? 'Completed' : 'Assigned'}
                              </span>
                            </div>

                            <div
                              className="rounded-xl p-3 border space-y-2"
                              style={{
                                backgroundColor: 'var(--athlon-surface)',
                                borderColor: 'var(--athlon-border-subtle)',
                              }}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <div className="w-7 h-7 rounded-lg bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 font-black text-xs shrink-0">
                                    {(match.teamAName || 'A').charAt(0)}
                                  </div>
                                  <span className="text-xs font-extrabold text-foreground truncate">
                                    {match.teamAName || 'Team A'}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 my-0.5">
                                <div className="h-[1px] flex-1 bg-foreground/10" />
                                <span className="text-[9px] font-black text-red-400 uppercase tracking-widest bg-surface px-2 py-0.5 rounded-full border border-foreground/10 shrink-0">
                                  VS
                                </span>
                                <div className="h-[1px] flex-1 bg-foreground/10" />
                              </div>

                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <div className="w-7 h-7 rounded-lg bg-emerald-400/15 border border-emerald-400/30 flex items-center justify-center text-emerald-400 font-black text-xs shrink-0">
                                    {(match.teamBName || 'B').charAt(0)}
                                  </div>
                                  <span className="text-xs font-extrabold text-foreground truncate">
                                    {match.teamBName || 'Team B'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2.5 pt-1 border-t border-foreground/5">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-[9px] font-bold text-foreground/40 uppercase tracking-wider">
                                  Time
                                </span>
                                <div className="flex items-center gap-1.5 text-foreground/80 font-bold bg-background px-2.5 py-1 rounded-lg border border-foreground/5 text-[11px]">
                                  <Clock className="w-3 h-3 text-amber-400" />
                                  <span>{formattedTime}</span>
                                </div>
                              </div>

                              {isCompleted ? (
                                <button
                                  onClick={() => {
                                    const isTeamEvent =
                                      match.tournamentType === 'TEAM_EVENT' ||
                                      match.tournamentType === 'TEAM_LEAGUE' ||
                                      match.status === 'WAITING_FOR_LINEUPS';
                                    if (isTeamEvent) {
                                      router.push(`/home/team-events/${match.uuid}/score`);
                                    } else {
                                      router.push(`/live-score/${match.uuid}`);
                                    }
                                  }}
                                  className="w-full py-2.5 rounded-xl bg-surface-elevated hover:bg-surface border border-emerald-500/30 text-emerald-400 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                                >
                                  <Trophy className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>Match Results</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    const isTeamEvent =
                                      match.tournamentType === 'TEAM_EVENT' ||
                                      match.tournamentType === 'TEAM_LEAGUE' ||
                                      match.status === 'WAITING_FOR_LINEUPS';
                                    if (isTeamEvent) {
                                      router.push(`/home/team-events/${match.uuid}/score`);
                                      return;
                                    }

                                    const sport = match.sportType || 'Badminton';
                                    const teamAStr = match.teamAName
                                      ? encodeURIComponent(match.teamAName.replace(/\s*&\s*/g, ','))
                                      : '';
                                    const teamBStr = match.teamBName
                                      ? encodeURIComponent(match.teamBName.replace(/\s*&\s*/g, ','))
                                      : '';
                                    const teamANameStr = match.teamAName ? encodeURIComponent(match.teamAName) : '';
                                    const teamBNameStr = match.teamBName ? encodeURIComponent(match.teamBName) : '';
                                    const tournamentNameStr = match.tournamentName
                                      ? encodeURIComponent(match.tournamentName)
                                      : '';
                                    const courtNameStr = match.courtName
                                      ? encodeURIComponent(match.courtName)
                                      : match.courtId
                                        ? encodeURIComponent(`Court ${match.courtId}`)
                                        : '';

                                    router.push(
                                      `/match-setup?matchId=${match.uuid}&sport=${sport}&teamA=${teamAStr}&teamB=${teamBStr}&teamAName=${teamANameStr}&teamBName=${teamBNameStr}&tournamentName=${tournamentNameStr}&courtName=${courtNameStr}&fromUmpire=true`
                                    );
                                  }}
                                  className="w-full py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-red-500/25 active:scale-95 flex items-center justify-center gap-1.5"
                                >
                                  <Activity className="w-3.5 h-3.5 animate-pulse" />
                                  <span>{isLive ? 'Resume Scoring' : 'Start Scoring'}</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          2. DESKTOP VIEW ONLY (hidden on mobile, visible on md and above)
             - ULTRA STYLISH HORIZONTAL SCROLLING RAILS WITH SMOOTH NAV CONTROLS
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="hidden md:block min-h-screen bg-background pb-20 w-full max-w-full overflow-x-hidden">
        {/* Desktop Ambient Hero Banner with Video & Profile Telemetry */}
        <section className="relative w-full border-b overflow-hidden bg-gradient-to-b from-card/60 via-card/30 to-background" style={{ borderColor: 'var(--athlon-border)' }}>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-7xl mx-auto px-8 py-8">
            <div className="flex items-center justify-between gap-6 flex-wrap">
              {/* Profile Card Block */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div
                    className="w-16 h-16 rounded-2xl bg-black/60 border-2 overflow-hidden flex items-center justify-center shadow-2xl"
                    style={{ borderColor: 'var(--athlon-primary)' }}
                  >
                    <img src={personalProfile?.avatar || '/placeholder.png'} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-background animate-pulse" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <h1 className="text-2xl font-black tracking-tight text-foreground">{displayName}</h1>
                    <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-primary/15 text-primary border border-primary/30">
                      {athlonId}
                    </span>
                  </div>
                  <p className="text-xs text-foreground/60 flex items-center gap-2">
                    <span>Personal Athlete Workspace</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-semibold">Active &amp; Ready</span>
                  </p>
                </div>
              </div>

              {/* 3 Telemetry Metrics: Matches, Wins, Win Rate */}
              <div className="flex items-center gap-3">
                <div className="p-3 px-4 rounded-2xl border bg-surface/70 backdrop-blur-md flex items-center gap-3 shadow-sm" style={{ borderColor: 'var(--athlon-border)' }}>
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase text-foreground/50">Matches</div>
                    <div className="text-lg font-black text-foreground font-mono">{playerStats?.totalMatches ?? 0}</div>
                  </div>
                </div>

                <div className="p-3 px-4 rounded-2xl border bg-surface/70 backdrop-blur-md flex items-center gap-3 shadow-sm" style={{ borderColor: 'var(--athlon-border)' }}>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase text-foreground/50">Wins</div>
                    <div className="text-lg font-black text-amber-400 font-mono">{playerStats?.matchesWon ?? 0}</div>
                  </div>
                </div>

                <div className="p-3 px-4 rounded-2xl border bg-surface/70 backdrop-blur-md flex items-center gap-3 shadow-sm" style={{ borderColor: 'var(--athlon-border)' }}>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase text-foreground/50">Win Rate</div>
                    <div className="text-lg font-black text-emerald-400 font-mono">
                      {playerStats?.winRate ? `${Math.round(playerStats.winRate)}%` : '0%'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Navigation Strip */}
            <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t" style={{ borderColor: 'var(--athlon-border)' }}>
              {quickActions.map((action) => (
                <Link
                  key={action.id}
                  href={action.id}
                  className="p-3.5 rounded-2xl border flex items-center gap-3.5 bg-surface/50 hover:bg-surface hover:border-primary/40 transition-all group shadow-sm"
                  style={{ borderColor: 'var(--athlon-border)' }}
                >
                  <div className="w-12 h-12 rounded-xl bg-surface border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0 shadow-inner">
                    <Athlon3DIcon type={action.icon3d} size={32} active={true} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-black text-foreground group-hover:text-primary transition-colors">{action.label}</div>
                    <div className="text-[10px] text-foreground/50 truncate">{action.desc}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-foreground/30 ml-auto group-hover:translate-x-1 group-hover:text-primary transition-all" />
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Desktop Workspace Content with Full-Width Horizontal Scrolling Tracks */}
        <main className="max-w-7xl mx-auto px-8 py-8 space-y-10">
          {/* ── SECTION 0: 🔴 LIVE PLAYER AUCTIONS (HORIZONTAL SCROLL) ── */}
          {liveAuctionChampionships.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                  <h2 className="text-base font-black text-foreground uppercase tracking-wider">
                    Live Player Auction Arenas ({liveAuctionChampionships.length})
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-red-500 uppercase tracking-wider mr-2">
                    🔴 Broadcasting Live
                  </span>
                  <button
                    onClick={() => scrollContainer(auctionsScrollRef, 'left')}
                    className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all cursor-pointer"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => scrollContainer(auctionsScrollRef, 'right')}
                    className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all cursor-pointer"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div
                ref={auctionsScrollRef}
                className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 snap-x scroll-px-8 hide-scrollbar -mx-8 px-8"
              >
                {liveAuctionChampionships.map((champ) => (
                  <div key={champ.championshipUuid} className="snap-start shrink-0 w-[380px]">
                    <div
                      className="block h-full rounded-[24px] border p-5 relative overflow-hidden transition-all hover:border-red-500/60 hover:shadow-xl group space-y-4 flex flex-col justify-between"
                      style={{
                        backgroundColor: 'var(--athlon-card)',
                        borderColor: 'rgba(239, 68, 68, 0.4)',
                      }}
                    >
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-rose-500 to-primary animate-pulse" />

                      <div className="flex items-center justify-between text-xs pb-3 border-b" style={{ borderColor: 'var(--athlon-border)' }}>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500/15 text-red-400 border border-red-500/25 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                          Live Floor
                        </span>
                        <span className="text-[11px] font-bold text-foreground/50 truncate max-w-[180px]">
                          {champ.sport || 'Championship'}
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
                        className="p-3.5 rounded-2xl border flex items-center justify-between text-xs bg-surface/50"
                        style={{ borderColor: 'var(--athlon-border)' }}
                      >
                        <span className="text-foreground/60 font-semibold">Franchises Competing:</span>
                        <span className="font-mono font-black text-primary">{champ.registeredTeamsCount || champ.maxTeams || 0} Teams</span>
                      </div>

                      <Link
                        href={`/home/team-championship/${champ.championshipUuid}/auction`}
                        className="w-full py-3 bg-gradient-to-r from-red-500 via-rose-500 to-primary text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-500/25 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                      >
                        <Gavel className="w-4 h-4" />
                        <span>ENTER AUCTION ARENA</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── SECTION 1: 🔴 LIVE MATCH BROADCASTS (HORIZONTAL SCROLL) ── */}
          {liveScores.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                  <h2 className="text-base font-black text-foreground uppercase tracking-wider">
                    Live Broadcast Center ({liveScores.length})
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <Link href="/live-score" className="text-xs font-bold text-red-500 hover:underline uppercase tracking-wider mr-2">
                    Live Scoreboard →
                  </Link>
                  <button
                    onClick={() => scrollContainer(liveScrollRef, 'left')}
                    className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => scrollContainer(liveScrollRef, 'right')}
                    className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div
                ref={liveScrollRef}
                className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 snap-x scroll-px-8 hide-scrollbar -mx-8 px-8"
              >
                {liveScores.map((score) => {
                  const meta = score.scoreMeta || {};
                  const config = meta.config || {};
                  const teamAPlayers = config.teamA || [];
                  const teamBPlayers = config.teamB || [];
                  const teamAName = config.teamAName || (teamAPlayers.length ? teamAPlayers.join(' & ') : 'Team A');
                  const teamBName = config.teamBName || (teamBPlayers.length ? teamBPlayers.join(' & ') : 'Team B');
                  const gi = meta.currentGameIndex || 0;
                  const games = meta.games || [];
                  const cur = games[gi] || {};
                  const scoreA = cur.scoreA ?? (score.teamAScore || 0);
                  const scoreB = cur.scoreB ?? (score.teamBScore || 0);
                  const isServing = cur.currentServer;

                  return (
                    <div key={score.scoreId} className="snap-start shrink-0 w-[380px]">
                      <Link
                        href={`/live-score/${score.matchUuid}`}
                        className="block h-full rounded-[24px] border p-5 bg-card relative overflow-hidden transition-all hover:border-red-500/60 hover:shadow-xl group"
                        style={{
                          backgroundColor: 'var(--athlon-card)',
                          borderColor: 'var(--athlon-border)',
                        }}
                      >
                        <div className="absolute top-0 left-0 right-0 h-1 bg-red-500 animate-pulse" />
                        <div className="flex items-center justify-between text-xs pb-3 border-b" style={{ borderColor: 'var(--athlon-border)' }}>
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500/15 text-red-400 border border-red-500/25 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                            Live Game {gi + 1}
                          </span>
                          <span className="text-[11px] font-bold text-foreground/50 truncate max-w-[180px]">
                            {config.courtName || 'Court Arena'}
                          </span>
                        </div>

                        <div className="p-4 my-3 rounded-2xl border space-y-3 bg-surface/50" style={{ borderColor: 'var(--athlon-border)' }}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center ${isServing === 'A' ? 'bg-emerald-500 text-black' : 'bg-foreground/10 text-foreground/60'}`}>
                                A
                              </span>
                              <span className="text-sm font-black text-foreground truncate">{teamAName}</span>
                            </div>
                            <span className={`text-2xl font-mono font-black ${Number(scoreA) > Number(scoreB) ? 'text-emerald-400' : 'text-foreground'}`}>
                              {scoreA}
                            </span>
                          </div>

                          <div className="flex items-center justify-between border-t pt-3" style={{ borderColor: 'var(--athlon-border)' }}>
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center ${isServing === 'B' ? 'bg-amber-500 text-black' : 'bg-foreground/10 text-foreground/60'}`}>
                                B
                              </span>
                              <span className="text-sm font-black text-foreground truncate">{teamBName}</span>
                            </div>
                            <span className={`text-2xl font-mono font-black ${Number(scoreB) > Number(scoreA) ? 'text-amber-400' : 'text-foreground'}`}>
                              {scoreB}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs pt-2 text-foreground/50">
                          <span className="truncate max-w-[200px]">{config.tournamentName || 'Tournament Match'}</span>
                          <span className="text-red-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                            Enter Arena <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ── SECTION 2: ⚠️ ACTION REQUIRED: PENDING LINEUPS (HORIZONTAL SCROLL) ── */}
          {pendingLineups.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-orange-500">
                  <AlertCircle className="w-5 h-5" />
                  <h2 className="text-base font-black uppercase tracking-wider">
                    Action Required: Captain Lineups ({pendingLineups.length})
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => scrollContainer(lineupsScrollRef, 'left')}
                    className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => scrollContainer(lineupsScrollRef, 'right')}
                    className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div
                ref={lineupsScrollRef}
                className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 snap-x scroll-px-8 hide-scrollbar -mx-8 px-8"
              >
                {pendingLineups.map((match) => (
                  <div key={match.id} className="snap-start shrink-0 w-[360px]">
                    <div className="p-5 rounded-[24px] border space-y-3.5 bg-orange-500/5 border-orange-500/25 h-full flex flex-col justify-between shadow-lg">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-orange-500/20 text-orange-400 border border-orange-500/30">
                          Pending Lineup
                        </span>
                        <span className="text-xs text-foreground/50 font-bold">Team Tie Event</span>
                      </div>

                      <div>
                        <h3 className="text-sm font-black text-foreground">
                          {match.teamAName && match.teamBName ? `${match.teamAName} vs ${match.teamBName}` : `Team Event #${match.id}`}
                        </h3>
                        <div className="text-xs text-foreground/60 flex items-center gap-2 mt-1">
                          <Calendar className="w-3.5 h-3.5 text-primary" />
                          <span>{match.scheduledTime ? new Date(match.scheduledTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Time TBA'}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => router.push(`/home/team-events/${match.uuid}/lineup`)}
                        className="w-full py-2.5 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-orange-500/25"
                      >
                        <ClipboardList className="w-4 h-4" />
                        <span>Submit Order of Play</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── SECTION 3: 🛡️ FEATURED TEAM CHAMPIONSHIPS (HORIZONTAL SCROLL) ── */}
          {publicChampionships.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Shield className="w-5 h-5 text-primary" />
                  <div>
                    <h2 className="text-base font-black text-foreground">Featured Team Championships</h2>
                    <p className="text-xs text-foreground/50">Multi-category franchise leagues, live auctions, and team draft competitions</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link href="/tournaments" className="text-xs font-bold text-primary hover:underline uppercase tracking-wider mr-2">
                    View All ({publicChampionships.length}) →
                  </Link>
                  <button
                    onClick={() => scrollContainer(champsScrollRef, 'left')}
                    className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => scrollContainer(champsScrollRef, 'right')}
                    className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div
                ref={champsScrollRef}
                className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 snap-x scroll-px-8 hide-scrollbar -mx-8 px-8"
              >
                {publicChampionships.map((c) => (
                  <div key={c.championshipId || c.championshipUuid} className="snap-start shrink-0 w-[360px]">
                    <PublicTeamChampionshipCard championship={c} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── SECTION 4: 🏆 OPEN TOURNAMENTS (HORIZONTAL SCROLL) ── */}
          {publicTournaments.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <div>
                    <h2 className="text-base font-black text-foreground">Open Tournaments</h2>
                    <p className="text-xs text-foreground/50">Knockout, round-robin &amp; league championships open for registration</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link href="/home/tournaments" className="text-xs font-bold text-primary hover:underline uppercase tracking-wider mr-2">
                    View All ({publicTournaments.length}) →
                  </Link>
                  <button
                    onClick={() => scrollContainer(tournsScrollRef, 'left')}
                    className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => scrollContainer(tournsScrollRef, 'right')}
                    className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div
                ref={tournsScrollRef}
                className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 snap-x scroll-px-8 hide-scrollbar -mx-8 px-8"
              >
                {publicTournaments.map((t) => (
                  <div key={t.tournamentId || t.tournamentUuid} className="snap-start shrink-0 w-[360px]">
                    <PublicTournamentCard tournament={t} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── SECTION 5: 📅 MY SCHEDULE & UMPIRING (HORIZONTAL SCROLL) ── */}
          {(userMatches.length > 0 || umpireMatches.length > 0) && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Clock className="w-5 h-5 text-primary" />
                  <div>
                    <h2 className="text-base font-black text-foreground">My Match Schedule &amp; Umpiring</h2>
                    <p className="text-xs text-foreground/50">Your active court schedule, tie fixtures, and umpire assignments</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link href="/home/matches" className="text-xs font-bold text-primary hover:underline uppercase tracking-wider mr-2">
                    Full Calendar →
                  </Link>
                  <button
                    onClick={() => scrollContainer(schedScrollRef, 'left')}
                    className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => scrollContainer(schedScrollRef, 'right')}
                    className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div
                ref={schedScrollRef}
                className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 snap-x scroll-px-8 hide-scrollbar -mx-8 px-8"
              >
                {/* Umpire Matches */}
                {umpireMatches.map((match) => (
                  <div key={match.id || match.uuid} className="snap-start shrink-0 w-[360px]">
                    <div
                      className="p-5 rounded-[24px] border space-y-3.5 bg-card relative overflow-hidden h-full flex flex-col justify-between shadow-lg"
                      style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                    >
                      <div className="h-1 w-full bg-gradient-to-r from-red-500 to-amber-500 absolute top-0 left-0 right-0" />
                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-500/15 text-red-400 border border-red-500/25">
                          Umpiring Assignment
                        </span>
                        <span className="font-mono text-[11px] text-foreground/60">{match.courtName || 'Court TBD'}</span>
                      </div>

                      <div className="text-sm font-black text-foreground">
                        {match.teamAName || 'Team A'} vs {match.teamBName || 'Team B'}
                      </div>

                      <button
                        onClick={() => {
                          const sport = match.sportType || 'Badminton';
                          const teamAStr = match.teamAName ? encodeURIComponent(match.teamAName.replace(/\s*&\s*/g, ',')) : '';
                          const teamBStr = match.teamBName ? encodeURIComponent(match.teamBName.replace(/\s*&\s*/g, ',')) : '';
                          router.push(`/match-setup?matchId=${match.uuid}&sport=${sport}&teamA=${teamAStr}&teamB=${teamBStr}&fromUmpire=true`);
                        }}
                        className="w-full py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-red-500/25"
                      >
                        <Activity className="w-3.5 h-3.5 animate-pulse" />
                        <span>Start / Resume Digital Score</span>
                      </button>
                    </div>
                  </div>
                ))}

                {/* Player Matches */}
                {userMatches.map((match) => (
                  <div key={match.id} className="snap-start shrink-0 w-[360px]">
                    <div
                      className="p-5 rounded-[24px] border space-y-3.5 bg-card relative overflow-hidden h-full flex flex-col justify-between shadow-lg"
                      style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                    >
                      <div className="h-1 w-full bg-gradient-to-r from-primary to-emerald-400 absolute top-0 left-0 right-0" />
                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="font-bold text-primary truncate max-w-[200px]">{match.tournament}</span>
                        <span className="font-mono text-[11px] text-foreground/60">{match.court}</span>
                      </div>

                      <div className="text-sm font-black text-foreground">
                        {match.teamAName} vs {match.teamBName}
                      </div>

                      <div className="flex items-center justify-between text-xs text-foreground/60 pt-2 border-t" style={{ borderColor: 'var(--athlon-border)' }}>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span>{match.date}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold text-[10px]">
                          {match.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── SECTION 6: ✅ RECENT RESULTS (HORIZONTAL SCROLL) ── */}
          {finishedScores.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h2 className="text-base font-black text-foreground">Recent Match Results</h2>
                    <p className="text-xs text-foreground/50">Official scorecards and completed fixture results</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link href="/live-score" className="text-xs font-bold text-primary hover:underline uppercase tracking-wider mr-2">
                    All Results →
                  </Link>
                  <button
                    onClick={() => scrollContainer(resultsScrollRef, 'left')}
                    className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => scrollContainer(resultsScrollRef, 'right')}
                    className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div
                ref={resultsScrollRef}
                className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 snap-x scroll-px-8 hide-scrollbar -mx-8 px-8"
              >
                {finishedScores.map((score) => {
                  const meta = score.scoreMeta || {};
                  const config = meta.config || {};
                  const teamAPlayers = config.teamA || [];
                  const teamBPlayers = config.teamB || [];
                  const teamAName = config.teamAName || (teamAPlayers.length ? teamAPlayers.join(' & ') : 'Team A');
                  const teamBName = config.teamBName || (teamBPlayers.length ? teamBPlayers.join(' & ') : 'Team B');
                  const games = meta.games || [];
                  const setsWonA = games.filter((g: any) => g.winner === 'A').length;
                  const setsWonB = games.filter((g: any) => g.winner === 'B').length;

                  return (
                    <div key={score.scoreId} className="snap-start shrink-0 w-[360px]">
                      <Link
                        href={`/live-score/${score.matchUuid}`}
                        className="block h-full p-5 rounded-[24px] border bg-card space-y-3.5 hover:border-primary/50 transition-all shadow-lg group"
                        style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-black uppercase">
                            Finished
                          </span>
                          <span className="text-[11px] text-foreground/50 truncate max-w-[180px]">{config.tournamentName || 'Tournament'}</span>
                        </div>

                        <div className="p-3.5 rounded-2xl border space-y-2 bg-surface/50" style={{ borderColor: 'var(--athlon-border)' }}>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-foreground truncate">{teamAName}</span>
                            <span className="font-mono font-black text-sm text-emerald-400">{setsWonA}</span>
                          </div>
                          <div className="flex items-center justify-between border-t pt-2" style={{ borderColor: 'var(--athlon-border)' }}>
                            <span className="text-xs font-black text-foreground truncate">{teamBName}</span>
                            <span className="font-mono font-black text-sm text-amber-400">{setsWonB}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-foreground/50 pt-1">
                          <span>Scorecard View</span>
                          <span className="text-primary font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                            Details <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ── MANAGED WORKSPACES ── */}
          {organizations.length > 0 && (
            <section
              className="p-6 rounded-[28px] border space-y-4 shadow-lg"
              style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
            >
              <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--athlon-border)' }}>
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-primary" />
                  <h2 className="text-base font-black text-foreground">Managed Clubs, Academies &amp; Workspaces</h2>
                </div>
                <Link href="/subscription" className="text-xs font-bold text-primary hover:underline">
                  + Add Workspace
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {organizations.map((org) => (
                  <button
                    key={org.id}
                    onClick={() => selectRole(org.id)}
                    className="p-4 rounded-2xl border flex items-center justify-between text-left hover:border-primary/50 transition-all bg-surface/40 group"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                        {orgIcon(org.type, 'w-4 h-4')}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-black text-foreground truncate">{org.name}</div>
                        <div className="text-[10px] text-foreground/50 uppercase font-bold">{org.type}</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-foreground/40 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            </section>
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
