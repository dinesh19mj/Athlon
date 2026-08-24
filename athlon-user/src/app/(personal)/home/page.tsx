'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Trophy,
  Activity,
  TrendingUp,
  ChevronRight,
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
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useWorkspaceStore, Organization } from '@/lib/store/useWorkspaceStore';
import { TournamentService, Tournament } from '@/lib/api/tournaments';
import { PublicTournamentCard } from '@/components/tournaments/PublicTournamentCard';
import { ScoreService, LiveScore } from '@/lib/api/scores';
import { MatchService, Match } from '@/lib/api/matches';
import { OrganizationService } from '@/lib/api/organization';
import { AuthService } from '@/lib/api/auth';
import { useAthlonTheme } from '@/hooks/use-athlon-theme';
import { getThemeVideo } from '@/config/theme';

import HomeRoleHeader from '@/components/home/HomeRoleHeader';


/* ─── helpers ─────────────────────────────────────────────────────────────── */

const quickActions = [
  { id: '/home/tournaments', label: 'Tournaments', icon: Trophy },
  { id: '/home/rankings', label: 'Rankings', icon: TrendingUp },
  { id: '/home/matches', label: 'Matches', icon: Activity },
  { id: '/home/registered', label: 'Registered', icon: ClipboardList },
];

function orgIcon(type: string, cls = 'w-7 h-7') {
  if (type === 'ACADEMY') return <GraduationCap className={cls} strokeWidth={1.5} />;
  if (type === 'CLUB') return <Users className={cls} strokeWidth={1.5} />;
  if (type === 'ASSOCIATION') return <Trophy className={cls} strokeWidth={1.5} />;
  if (type === 'COURT') return <LayoutDashboard className={cls} strokeWidth={1.5} />;
  return <ShieldCheck className={cls} strokeWidth={1.5} />;
}

function orgDashboardLinks(org: Organization) {
  const base = `/org/${org.id}`;
  if (org.type === 'ORGANIZER' || org.type === 'ASSOCIATION')
    return [
      { href: `${base}/dashboard`, label: 'Dashboard', icon: LayoutDashboard },
      { href: `${base}/tournaments`, label: 'Tournaments', icon: Trophy },
      { href: `${base}/members`, label: 'Members', icon: Users },
      { href: `${base}/settings`, label: 'Settings', icon: Settings },
    ];
  if (org.type === 'ACADEMY')
    return [
      { href: `${base}/dashboard`, label: 'Dashboard', icon: LayoutDashboard },
      { href: `${base}/batches`, label: 'Batches', icon: BookOpen },
      { href: `${base}/students`, label: 'Students', icon: Users },
      { href: `${base}/settings`, label: 'Settings', icon: Settings },
    ];
  if (org.type === 'CLUB')
    return [
      { href: `${base}/dashboard`, label: 'Dashboard', icon: LayoutDashboard },
      { href: `${base}/tournaments`, label: 'Tournaments', icon: Trophy },
      { href: `${base}/members`, label: 'Members', icon: Users },
      { href: `${base}/settings`, label: 'Settings', icon: Settings },
    ];
  if (org.type === 'COURT')
    return [
      { href: `${base}/dashboard`, label: 'Dashboard', icon: LayoutDashboard },
      { href: `${base}/bookings`, label: 'Bookings', icon: Calendar },
      { href: `${base}/courts`, label: 'Courts', icon: Swords },
      { href: `${base}/settings`, label: 'Settings', icon: Settings },
    ];
  return [
    { href: `${base}/dashboard`, label: 'Dashboard', icon: LayoutDashboard },
    { href: `${base}/settings`, label: 'Settings', icon: Settings },
  ];
}

/* ─── component ───────────────────────────────────────────────────────────── */

export default function PersonalHomePage() {
  const router = useRouter();
  const { userEmail, userId, userUuid, token } = useAuthStore();
  const { personalProfile, organizations, setActiveWorkspace, setOrganizations } = useWorkspaceStore();
  const { themeKey } = useAthlonTheme();
  const backgroundVideo = getThemeVideo(themeKey);

  const [activeRole, setActiveRole] = useState<'PLAYER' | string>('PLAYER');

  const [searchQuery, setSearchQuery] = useState('');
  const [publicTournaments, setPublicTournaments] = useState<Tournament[]>([]);
  const [liveScores, setLiveScores] = useState<LiveScore[]>([]);
  const [finishedScores, setFinishedScores] = useState<LiveScore[]>([]);
  const [userMatches, setUserMatches] = useState<any[]>([]);
  const [umpireMatches, setUmpireMatches] = useState<Match[]>([]);
  const tabBarRef = useRef<HTMLDivElement>(null);

  /* ── data fetching ── */
  useEffect(() => {
    TournamentService.getAll()
      .then(res => setPublicTournaments(res.data.filter((t: Tournament) => t.visibility === 'PUBLIC')))
      .catch(() => { });

    // Fetch real organizations from API and sync to store
    if (userUuid) {
      OrganizationService.getByUserUuid(userUuid)
        .then(res => {
          if (res?.data?.length) {
            setOrganizations(res.data.map((o: any) => ({
              id: o.uuid,
              name: o.name,
              type: o.type,
              logo: o.logo,
            })));
          }
        })
        .catch(() => { });
    }

    if (userId) {
      MatchService.getByUser(Number(userId))
        .then(res => {
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
              const timeA = a.scheduledTime ? new Date(a.scheduledTime).getTime() : (a.matchDate ? new Date(a.matchDate).getTime() : Infinity);
              const timeB = b.scheduledTime ? new Date(b.scheduledTime).getTime() : (b.matchDate ? new Date(b.matchDate).getTime() : Infinity);
              if (timeA !== timeB && !isNaN(timeA) && !isNaN(timeB)) return timeA - timeB;
              return (typeof a.id === 'number' ? a.id : 0) - (typeof b.id === 'number' ? b.id : 0);
            });

            setUserMatches(sorted.map((m: Match) => ({
              id: m.uuid || `match-${m.id}`,
              matchUuid: m.uuid,
              tournament: m.tournamentName || 'Tournament Match',
              date: m.scheduledTime
                ? new Date(m.scheduledTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
                : (m.matchDate || 'Scheduled'),
              teamAName: m.teamAName || 'Team A',
              teamBName: m.teamBName || 'Team B',
              court: m.courtName || (m.courtId ? `Court ${m.courtId}` : 'Court TBD'),
              status: m.status || 'Scheduled',
            })));
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
              const timeA = a.scheduledTime ? new Date(a.scheduledTime).getTime() : (a.matchDate ? new Date(a.matchDate).getTime() : Infinity);
              const timeB = b.scheduledTime ? new Date(b.scheduledTime).getTime() : (b.matchDate ? new Date(b.matchDate).getTime() : Infinity);
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
              return s.isFinal === true || meta.isCompleted === true || wonA >= 2 || wonB >= 2 || (games.length > 0 && !s.isActive);
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

  const filteredTournaments = publicTournaments.filter(t => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.name?.toLowerCase().includes(q) ||
      t.sport?.toLowerCase().includes(q) ||
      t.location?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="h-[calc(100vh-80px)] md:h-screen overflow-hidden bg-background text-foreground flex flex-col relative">

      {/* ── Main Scrollable Area ─────────────────────────────────────────── */}
      <div className="relative z-10 flex-1 overflow-y-auto hide-scrollbar">

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
            onAddClick={() => { window.location.href = '/subscription'; }}
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

                  {/* Rating Capsule */}
                  <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-xl px-2.5 py-1.5 shrink-0">
                    <div className="flex flex-col items-end">
                      <span className="text-[7.5px] font-extrabold tracking-widest uppercase text-primary/80 leading-none mb-0.5">
                        RATING
                      </span>
                      <span className="text-primary font-black text-sm sm:text-base leading-none">
                        1200
                      </span>
                    </div>
                    <Trophy className="w-3.5 h-3.5 text-primary shrink-0 opacity-90" />
                  </div>
                </div>

                {/* 3 Stats Grid (Compact) */}
                <div className="grid grid-cols-3 divide-x divide-white/[0.06] bg-black/[0.15] relative z-10">
                  {[
                    { label: 'MATCHES', icon: Activity, value: '0' },
                    { label: 'WIN RATE', icon: TrendingUp, value: '0%' },
                    { label: 'RANK', icon: Flame, value: '-' },
                  ].map(s => (
                    <div key={s.label} className="flex flex-col items-center justify-center py-2.5 px-2 gap-1">
                      <div className="flex items-center gap-1 text-foreground/40 text-[8px] font-extrabold tracking-wider uppercase">
                        <s.icon className="w-3 h-3 text-foreground/50" />
                        <span>{s.label}</span>
                      </div>
                      <div className="text-foreground font-bold text-xs sm:text-sm leading-tight">
                        {s.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="px-6 py-2 overflow-hidden">
              <section className="flex items-center justify-between">
                {quickActions.map((action) => (
                  <Link href={action.id} key={action.id} className="flex flex-col items-center gap-1.5 shrink-0">
                    <div
                      className="w-[68px] h-[68px] rounded-[16px] flex flex-col items-center justify-center transition-all shadow-lg cursor-pointer hover:scale-105 active:scale-95"
                      style={{ backgroundColor: 'var(--athlon-surface)', border: '1px solid var(--athlon-border)' }}
                    >
                      <action.icon className="w-6 h-6" style={{ color: 'var(--athlon-primary)' }} strokeWidth={1.5} />
                    </div>
                    <span className="text-[10px] font-medium" style={{ color: 'var(--athlon-text-secondary)' }}>{action.label}</span>
                  </Link>
                ))}
              </section>
            </div>

            {/* Live Scores */}
            {liveScores.length > 0 && (
              <div className="px-6 pb-6 pt-4 overflow-hidden">
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
                        <Link href={`/live-score/${score.matchUuid}`}
                          className="block h-full rounded-[22px] overflow-hidden shadow-2xl group relative transition-all hover:scale-[1.02]">
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
                                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black shrink-0 ${isServing === 'A' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-white/5 text-white/40 border border-white/10'}`}>
                                          {isServing === 'A' ? <Zap className="w-3.5 h-3.5" /> : 'A'}
                                        </div>
                                        <span className={`text-2xl font-black tabular-nums ${Number(scoreA) > Number(scoreB) ? 'text-emerald-400' : 'text-white/90'}`}>{scoreA}</span>
                                      </div>
                                      {teamAPlayers.length > 0 ? teamAPlayers.map((p: string, i: number) => (
                                        <div key={i} className="flex items-center gap-1.5">
                                          <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                                            <span className="text-[8px] font-black text-emerald-400">{p.charAt(0)}</span>
                                          </div>
                                          <span className="text-[11px] font-bold text-white/80 truncate">{p}</span>
                                        </div>
                                      )) : <span className="text-[11px] font-bold text-white/60 truncate block">{teamAName}</span>}
                                    </div>
                                    <div className="flex flex-col items-center justify-center gap-2 px-1">
                                      <div className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center">
                                        <span className="text-[9px] font-black text-white/25 uppercase">vs</span>
                                      </div>
                                      {games.length > 1 && (
                                        <div className="flex flex-col items-center gap-[3px]">
                                          {games.map((_: any, idx: number) => (
                                            <div key={idx} className={`w-1.5 h-1.5 rounded-full ${idx === gi ? 'bg-red-400' : games[idx]?.winner === 'A' ? 'bg-emerald-400/80' : games[idx]?.winner === 'B' ? 'bg-amber-400/80' : 'bg-white/15'}`} />
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0 space-y-1.5 text-right">
                                      <div className="flex items-center justify-end gap-2 mb-2">
                                        <span className={`text-2xl font-black tabular-nums ${Number(scoreB) > Number(scoreA) ? 'text-amber-400' : 'text-white/90'}`}>{scoreB}</span>
                                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black shrink-0 ${isServing === 'B' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-white/5 text-white/40 border border-white/10'}`}>
                                          {isServing === 'B' ? <Zap className="w-3.5 h-3.5" /> : 'B'}
                                        </div>
                                      </div>
                                      {teamBPlayers.length > 0 ? teamBPlayers.map((p: string, i: number) => (
                                        <div key={i} className="flex items-center justify-end gap-1.5">
                                          <span className="text-[11px] font-bold text-white/80 truncate">{p}</span>
                                          <div className="w-5 h-5 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                                            <span className="text-[8px] font-black text-amber-400">{p.charAt(0)}</span>
                                          </div>
                                        </div>
                                      )) : <span className="text-[11px] font-bold text-white/60 truncate block">{teamBName}</span>}
                                    </div>
                                  </div>
                                </div>
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
                              <div className="flex items-center justify-between px-4 py-2.5 bg-white/[0.02] border-t border-white/[0.04]">
                                <span className="text-[9px] font-bold text-white/30 uppercase tracking-wider truncate max-w-[60%]">{config.tournamentName || 'Live Match'}</span>
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
              <div className="px-6 pb-6 pt-2 overflow-hidden">
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
                                    className={`text-xs truncate ${
                                      winner === 'A' ? 'font-black text-foreground' : 'font-medium text-foreground/70'
                                    }`}
                                  >
                                    {teamAName}
                                  </span>
                                </div>
                                <span
                                  className={`text-xs font-black font-mono tabular-nums ${
                                    winner === 'A' ? 'text-emerald-400 font-black' : 'text-foreground/60'
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
                                    className={`text-xs truncate ${
                                      winner === 'B' ? 'font-black text-foreground' : 'font-medium text-foreground/70'
                                    }`}
                                  >
                                    {teamBName}
                                  </span>
                                </div>
                                <span
                                  className={`text-xs font-black font-mono tabular-nums ${
                                    winner === 'B' ? 'text-emerald-400 font-black' : 'text-foreground/60'
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
                                    <span
                                      key={gIdx}
                                      className="px-1.5 py-0.2 rounded bg-white/5 font-mono font-bold text-[9px]"
                                    >
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

            {/* My Schedule */}
            {userMatches.length > 0 && (
              <div className="px-6 pb-8">
                <div className="flex items-center justify-between mb-4 pl-1 pr-2">
                  <h2 className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">My Schedule</h2>
                  <Link href="/home/matches" className="text-[10px] font-bold text-primary uppercase tracking-wider flex items-center hover:underline">
                    View All <ChevronRight className="w-3 h-3 ml-0.5" />
                  </Link>
                </div>
                <div className="flex items-stretch gap-4 overflow-x-auto pb-4 snap-x scroll-px-6 hide-scrollbar -mx-6 px-6 md:mx-0 md:px-0">
                  {userMatches.map((match) => (
                    <div key={match.id} className="snap-start shrink-0 w-[calc(100vw-3rem)] sm:w-[340px] md:w-[360px] max-w-[380px]">
                      <div className="relative rounded-[22px] overflow-hidden shadow-xl border h-full flex flex-col justify-between"
                        style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}>
                        <div className="h-[3px] w-full bg-gradient-to-r from-primary via-amber-400 to-emerald-400" />
                        <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                          <div className="flex items-start justify-between gap-3 border-b border-foreground/5 pb-2.5">
                            <div className="space-y-0.5 min-w-0 flex-1">
                              <span className="text-[10px] font-black text-foreground/40 uppercase tracking-widest block truncate">{match.tournament}</span>
                              <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                                <MapPin className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate">{match.court}</span>
                              </div>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border shrink-0 ${match.status === 'LIVE' || match.status === 'IN_PROGRESS' ? 'bg-red-500/10 text-red-400 border-red-500/20 animate-pulse' : 'bg-primary/10 text-primary border-primary/20'}`}>
                              {match.status === 'LIVE' || match.status === 'IN_PROGRESS' ? '● LIVE' : match.status}
                            </span>
                          </div>
                          <div className="rounded-xl p-3 border space-y-2" style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border-subtle)' }}>
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <div className="w-7 h-7 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center text-primary font-black text-xs shrink-0">{match.teamAName.charAt(0)}</div>
                                <span className="text-xs font-extrabold text-foreground truncate">{match.teamAName}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 my-0.5">
                              <div className="h-[1px] flex-1 bg-foreground/10" />
                              <span className="text-[9px] font-black text-primary uppercase tracking-widest bg-surface px-2 py-0.5 rounded-full border border-foreground/10 shrink-0">VS</span>
                              <div className="h-[1px] flex-1 bg-foreground/10" />
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <div className="w-7 h-7 rounded-lg bg-emerald-400/15 border border-emerald-400/30 flex items-center justify-center text-emerald-400 font-black text-xs shrink-0">{match.teamBName.charAt(0)}</div>
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
                          {/* Red / Amber top gradient accent */}
                          <div className="h-[3px] w-full bg-gradient-to-r from-red-500 via-rose-500 to-amber-500" />

                          <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                            {/* Match Header */}
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
                                className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border shrink-0 ${
                                  isLive
                                    ? 'bg-red-500/15 text-red-400 border-red-500/30 animate-pulse'
                                    : isCompleted
                                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                                }`}
                              >
                                {isLive ? '● LIVE' : isCompleted ? 'Completed' : 'Assigned'}
                              </span>
                            </div>

                            {/* Teams Box */}
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

                            {/* Timing & Quick Umpire Action */}
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
                                <Link
                                  href={`/live-score/${match.uuid}`}
                                  className="w-full py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 hover:bg-emerald-500/20"
                                >
                                  <Trophy className="w-3.5 h-3.5" />
                                  <span>View Scorecard</span>
                                </Link>
                              ) : (
                                <button
                                  onClick={() => {
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

            {/* Public Tournaments */}
            {filteredTournaments.length > 0 && (
              <div className="px-6 pb-8">
                <div className="flex items-center justify-between mb-4 pl-1 pr-2">
                  <h2 className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Public Tournaments</h2>
                  <Link href="/home/tournaments" className="text-[10px] font-bold text-primary uppercase tracking-wider flex items-center hover:underline">
                    View All <ChevronRight className="w-3 h-3 ml-0.5" />
                  </Link>
                </div>
                <div className="flex items-stretch gap-4 overflow-x-auto pb-4 snap-x scroll-px-6 hide-scrollbar -mx-6 px-6 md:mx-0 md:px-0">
                  {filteredTournaments.map(tournament => (
                    <div key={tournament.tournamentId} className="snap-start shrink-0 w-[calc(100vw-3rem)] sm:w-[340px] md:w-[360px] max-w-[380px]">
                      <PublicTournamentCard tournament={tournament} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      ` }} />
    </div>
  );
}
