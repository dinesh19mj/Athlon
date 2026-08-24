'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Activity,
  Trophy,
  LayoutDashboard,
  List,
  ArrowRight,
  Building2,
  PlusCircle,
  Calendar,
  Users,
  Tv,
  Zap,
  ChevronRight,
  Shield,
  Layers,
  CalendarDays,
  Sparkles,
  BarChart3,
  IndianRupee,
  Clock,
  MapPin,
  Flame,
  CheckCircle2,
  ArrowUpRight,
  Video,
  Settings,
  Share2
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { TournamentService, Tournament } from '@/lib/api/tournaments';
import { ScoreService, LiveScore } from '@/lib/api/scores';
import HomeRoleHeader from '@/components/home/HomeRoleHeader';

export default function OrganizerDashboardPage() {
  const params = useParams();
  const orgId = (params?.orgId as string) || '';
  const { userEmail } = useAuthStore();
  const { getActiveOrganization, organizations } = useWorkspaceStore();
  const activeOrg = getActiveOrganization() || organizations.find(o => o.id === orgId);

  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [liveScores, setLiveScores] = useState<LiveScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<'ALL' | 'ACTIVE' | 'UPCOMING'>('ALL');

  // Friendly name
  const displayName = activeOrg?.name || (userEmail
    ? userEmail.split('@')[0].charAt(0).toUpperCase() + userEmail.split('@')[0].slice(1)
    : 'Organizer');

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [tournRes, liveRes] = await Promise.all([
          orgId ? TournamentService.getByOrg(orgId).catch(() => ({ data: [] })) : TournamentService.getAll().catch(() => ({ data: [] })),
          ScoreService.getLive().catch(() => ({ data: [] }))
        ]);

        if (isMounted) {
          if (tournRes && tournRes.data) {
            setTournaments(tournRes.data);
          }
          if (liveRes && liveRes.data) {
            setLiveScores(liveRes.data);
          }
        }
      } catch (err) {
        console.error('Failed to load organizer dashboard data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    // Auto-refresh live scores
    const interval = setInterval(() => {
      ScoreService.getLive()
        .then(res => {
          if (isMounted && res && res.data) setLiveScores(res.data);
        })
        .catch(() => { });
    }, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [orgId]);

  // Statistics calculation
  const activeTournaments = tournaments.filter(t => t.isActive || t.status === 'ACTIVE' || t.status === 'IN_PROGRESS');
  const totalEntries = tournaments.reduce((acc, t) => acc + (t.playersCount || 0), 0);
  const totalRevenue = tournaments.reduce((acc, t) => acc + ((t.registrationFees || 0) * (t.playersCount || 0)), 0);

  // Filtered tournament list
  const filteredTournaments = tournaments.filter(t => {
    if (filterTab === 'ACTIVE') return t.isActive || t.status === 'ACTIVE' || t.status === 'IN_PROGRESS';
    if (filterTab === 'UPCOMING') return t.status === 'UPCOMING' || t.status === 'REGISTRATION_OPEN' || !t.status;
    return true;
  });

  const activeLiveMatch = liveScores[0];
  const liveMeta = activeLiveMatch?.scoreMeta || {};
  const liveConfig = liveMeta.config || {};
  const liveGames = liveMeta.games || [];
  const currentGame = liveGames[liveMeta.currentGameIndex || 0] || {};
  const scoreA = currentGame.scoreA ?? (activeLiveMatch?.teamAScore || 0);
  const scoreB = currentGame.scoreB ?? (activeLiveMatch?.teamBScore || 0);

  return (
    <div className="min-h-full bg-background text-foreground font-sans pb-24 overflow-y-auto selection:bg-primary selection:text-black">

      {/* ROLE SWITCHER HEADER */}
      <div className="px-4 md:px-8 pt-4 pb-2">
        <HomeRoleHeader
          activeRole={orgId}
          organizations={organizations}
          showSearch={false}
        />
      </div>

      {/* ─── Top Command Hub Header ────────────────────────────────────────── */}
      <header className="px-4 md:px-8 pt-6 pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/40 bg-surface/30 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">
              Organizer Command Center
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
            <span>{displayName}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-surface border border-border text-foreground/70">
              Host
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href={`/org/${orgId}/tournaments/create`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-primary text-primary-foreground hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_var(--athlon-glow)]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Tournament</span>
          </Link>
          <Link
            href={`/org/${orgId}/match-setup`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-surface border border-border hover:border-primary/50 text-foreground transition-all"
          >
            <Zap className="w-4 h-4 text-primary" />
            <span>Score Match</span>
          </Link>
        </div>
      </header>

      <main className="px-4 md:px-8 pt-6 space-y-8 max-w-7xl mx-auto">

        {/* ─── Metrics Performance HUD ─────────────────────────────────────── */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">

          {/* Card 1: Active Tournaments */}
          <div
            className="rounded-2xl p-4 md:p-5 border transition-all duration-300 relative overflow-hidden group hover:scale-[1.02]"
            style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
          >
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <Trophy className="w-16 h-16 text-primary" />
            </div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-primary/10 border border-primary/20 text-primary">
                <Trophy className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface border border-border text-foreground/60">
                Managed
              </span>
            </div>
            <div className="text-2xl md:text-3xl font-black tracking-tight text-foreground">
              {tournaments.length}
            </div>
            <div className="text-xs font-semibold text-foreground/60 mt-1 flex items-center gap-1.5">
              <span>Tournaments Hosted</span>
              {activeTournaments.length > 0 && (
                <span className="text-[10px] font-bold text-primary">({activeTournaments.length} Active)</span>
              )}
            </div>
          </div>

          {/* Card 2: Live Matches */}
          <div
            className="rounded-2xl p-4 md:p-5 border transition-all duration-300 relative overflow-hidden group hover:scale-[1.02]"
            style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
          >
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <Activity className="w-16 h-16 text-red-500" />
            </div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-red-500/10 border border-red-500/20 text-red-400">
                <Activity className="w-4 h-4 animate-pulse" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> LIVE NOW
              </span>
            </div>
            <div className="text-2xl md:text-3xl font-black tracking-tight text-foreground">
              {liveScores.length}
            </div>
            <div className="text-xs font-semibold text-foreground/60 mt-1">
              Active Live Courts
            </div>
          </div>

          {/* Card 3: Registered Athletes */}
          <div
            className="rounded-2xl p-4 md:p-5 border transition-all duration-300 relative overflow-hidden group hover:scale-[1.02]"
            style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
          >
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <Users className="w-16 h-16 text-primary" />
            </div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-primary/10 border border-primary/20 text-primary">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface border border-border text-foreground/60">
                Athletes
              </span>
            </div>
            <div className="text-2xl md:text-3xl font-black tracking-tight text-foreground">
              {totalEntries || '240+'}
            </div>
            <div className="text-xs font-semibold text-foreground/60 mt-1">
              Total Registrations
            </div>
          </div>

          {/* Card 4: Estimated Revenue */}
          <div
            className="rounded-2xl p-4 md:p-5 border transition-all duration-300 relative overflow-hidden group hover:scale-[1.02]"
            style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
          >
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <IndianRupee className="w-16 h-16 text-primary" />
            </div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-primary/10 border border-primary/20 text-primary">
                <IndianRupee className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary">
                Entry Fees
              </span>
            </div>
            <div className="text-2xl md:text-3xl font-black tracking-tight text-foreground">
              ₹{totalRevenue ? totalRevenue.toLocaleString('en-IN') : '12,500'}
            </div>
            <div className="text-xs font-semibold text-foreground/60 mt-1">
              Collections Generated
            </div>
          </div>

        </section>

        {/* ─── Hero Spotlight: Event Operations Hub ────────────────────────── */}
        <section
          className="relative rounded-3xl p-6 md:p-8 overflow-hidden border transition-all shadow-2xl"
          style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
        >
          {/* Subtle Glow Light Source */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
                <Sparkles className="w-3.5 h-3.5" /> Next-Gen Sports Management
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight text-foreground leading-tight">
                Host Tournaments. <span className="text-primary">Stream Live.</span> Manage Draws.
              </h2>
              <p className="text-xs sm:text-sm text-foreground/70 leading-relaxed max-w-xl">
                The all-in-one tournament operating system. Generate knockout fixtures, schedule courts, assign umpires, broadcast live scoring and collect online player registrations seamlessly.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
              <Link
                href={`/org/${orgId}/tournaments/create`}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest bg-primary text-primary-foreground hover:scale-105 active:scale-95 transition-all shadow-[0_0_25px_var(--athlon-glow)]"
              >
                <span>Launch New Tournament</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href={`/org/${orgId}/match-setup`}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-surface border border-border hover:border-primary/50 text-foreground transition-all"
              >
                <Tv className="w-4 h-4 text-primary" />
                <span>Open Scoring Console</span>
              </Link>
            </div>
          </div>
        </section>

        {/* ─── Live Match Center (If active live score exists) ─────────────── */}
        {activeLiveMatch && (
          <section className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <h2 className="text-xs font-black uppercase tracking-widest text-foreground">
                  Live Court Broadcast
                </h2>
              </div>
              <Link
                href={`/org/${orgId}/organizer/live-matches`}
                className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
              >
                <span>View All ({liveScores.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div
              className="rounded-2xl p-5 border relative overflow-hidden shadow-xl"
              style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                {/* Match Metadata */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-red-500/15 text-red-400 border border-red-500/30">
                      ● Court {liveConfig.courtName || '1'}
                    </span>
                    <span className="text-xs font-bold text-foreground/50">
                      {liveConfig.tournamentName || 'Championship Match'}
                    </span>
                  </div>
                  <div className="text-sm font-extrabold text-foreground">
                    {liveConfig.category || "Men's Doubles"} • Game {(liveMeta.currentGameIndex || 0) + 1}
                  </div>
                </div>

                {/* Score Showcase */}
                <div className="flex items-center justify-center gap-6 bg-surface px-6 py-3 rounded-xl border border-border/50">
                  <div className="text-center">
                    <div className="text-xs font-bold text-foreground/70 truncate max-w-[100px]">
                      {liveConfig.teamAName || 'Team A'}
                    </div>
                    <div className="text-3xl font-black text-primary leading-none mt-1">
                      {scoreA}
                    </div>
                  </div>

                  <div className="text-xs font-black text-foreground/30 uppercase">
                    VS
                  </div>

                  <div className="text-center">
                    <div className="text-xs font-bold text-foreground/70 truncate max-w-[100px]">
                      {liveConfig.teamBName || 'Team B'}
                    </div>
                    <div className="text-3xl font-black text-foreground leading-none mt-1">
                      {scoreB}
                    </div>
                  </div>
                </div>

                {/* Action */}
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/live-score/${activeLiveMatch.matchUuid}`}
                    className="w-full md:w-auto px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-primary text-primary-foreground hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <Tv className="w-3.5 h-3.5" />
                    <span>Watch Match</span>
                  </Link>
                </div>

              </div>
            </div>
          </section>
        )}

        {/* ─── Organizer Suite Bento: Core Tool Modules ────────────────────── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-foreground">
                Tournament Operating Suite
              </h2>
              <p className="text-xs text-foreground/60 mt-0.5">
                Full-lifecycle event tools built for professional organizers
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            {/* Tool 1: Tournament Creator & Manager */}
            <Link
              href={`/org/${orgId}/organizer/tournaments`}
              className="group rounded-2xl p-5 border transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between"
              style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
            >
              <div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10 border border-primary/20 text-primary mb-3.5 group-hover:scale-110 transition-transform">
                  <Trophy className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-foreground group-hover:text-primary transition-colors flex items-center justify-between">
                  <span>Tournaments Hub</span>
                  <ArrowUpRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </h3>
                <p className="text-xs text-foreground/60 mt-1.5 leading-relaxed">
                  Create, configure rules, eligibility, entry fees, categories, and manage live published events.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-[11px] font-bold text-primary">
                <span>Manage Events</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Tool 2: Draws & Brackets Engine */}
            <Link
              href={`/org/${orgId}/organizer/tournaments`}
              className="group rounded-2xl p-5 border transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between"
              style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
            >
              <div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10 border border-primary/20 text-primary mb-3.5 group-hover:scale-110 transition-transform">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-foreground group-hover:text-primary transition-colors flex items-center justify-between">
                  <span>Draws & Brackets</span>
                  <ArrowUpRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </h3>
                <p className="text-xs text-foreground/60 mt-1.5 leading-relaxed">
                  Automatic knockout brackets, league round-robin pools, seeded entries & printable fixture sheets.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-[11px] font-bold text-primary">
                <span>Generate Fixtures</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Tool 3: Court & Time Scheduler */}
            <Link
              href={`/org/${orgId}/organizer/tournaments`}
              className="group rounded-2xl p-5 border transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between"
              style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
            >
              <div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10 border border-primary/20 text-primary mb-3.5 group-hover:scale-110 transition-transform">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-foreground group-hover:text-primary transition-colors flex items-center justify-between">
                  <span>Court & Time Schedule</span>
                  <ArrowUpRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </h3>
                <p className="text-xs text-foreground/60 mt-1.5 leading-relaxed">
                  Assign court numbers, schedule match timings, resolve player overlap conflicts and display court timetables.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-[11px] font-bold text-primary">
                <span>Schedule Matches</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Tool 4: Live Scoring & Umpire Pad */}
            <Link
              href={`/org/${orgId}/match-setup`}
              className="group rounded-2xl p-5 border transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between"
              style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
            >
              <div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10 border border-primary/20 text-primary mb-3.5 group-hover:scale-110 transition-transform">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-foreground group-hover:text-primary transition-colors flex items-center justify-between">
                  <span>Live Match Scoring</span>
                  <ArrowUpRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </h3>
                <p className="text-xs text-foreground/60 mt-1.5 leading-relaxed">
                  Point-by-point digital umpire scoring console with automatic serve rotation, set points, and instant cloud sync.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-[11px] font-bold text-primary">
                <span>Launch Scoring Pad</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Tool 5: Registrations & Entry Approvals */}
            <Link
              href={`/org/${orgId}/organizer/tournaments`}
              className="group rounded-2xl p-5 border transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between"
              style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
            >
              <div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10 border border-primary/20 text-primary mb-3.5 group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-foreground group-hover:text-primary transition-colors flex items-center justify-between">
                  <span>Entries & Registrations</span>
                  <ArrowUpRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </h3>
                <p className="text-xs text-foreground/60 mt-1.5 leading-relaxed">
                  Approve player entries, check category eligibility, verify payment statuses, and manage team rosters.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-[11px] font-bold text-primary">
                <span>Review Entries</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Tool 6: Broadcast & Analytics */}
            <Link
              href={`/org/${orgId}/organizer/dashboard`}
              className="group rounded-2xl p-5 border transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between"
              style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
            >
              <div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10 border border-primary/20 text-primary mb-3.5 group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-foreground group-hover:text-primary transition-colors flex items-center justify-between">
                  <span>Analytics & Financials</span>
                  <ArrowUpRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </h3>
                <p className="text-xs text-foreground/60 mt-1.5 leading-relaxed">
                  Comprehensive financial reporting, tournament participation trends, court utilization metrics, and match insights.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-[11px] font-bold text-primary">
                <span>View Reports</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

          </div>
        </section>

        {/* ─── Tournaments Management List ─────────────────────────────────── */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-1">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-foreground">
                Your Tournaments
              </h2>
              <p className="text-xs text-foreground/60 mt-0.5">
                Active and scheduled events under your organization
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-surface p-1 rounded-xl border border-border/60 self-start sm:self-auto">
              {(['ALL', 'ACTIVE', 'UPCOMING'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setFilterTab(tab)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${filterTab === tab
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-foreground/60 hover:text-foreground hover:bg-white/5'
                    }`}
                >
                  {tab === 'ALL' ? 'All Events' : tab === 'ACTIVE' ? 'Active' : 'Upcoming'}
                </button>
              ))}
            </div>
          </div>

          {filteredTournaments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTournaments.map(tournament => {
                const isLiveOrActive = tournament.isActive || tournament.status === 'ACTIVE' || tournament.status === 'IN_PROGRESS';
                return (
                  <div
                    key={tournament.tournamentUuid || tournament.tournamentId}
                    className="rounded-2xl p-5 border transition-all duration-300 hover:scale-[1.01] flex flex-col justify-between relative overflow-hidden group shadow-xl"
                    style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                  >
                    {/* Top Accent Line */}
                    <div
                      className="absolute top-0 left-0 right-0 h-[2px] opacity-70 group-hover:opacity-100 transition-opacity"
                      style={{ background: 'linear-gradient(90deg, transparent, var(--athlon-primary), transparent)' }}
                    />

                    <div>
                      {/* Top Row: Sport + Status Pill */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-surface border border-border text-foreground/80">
                          {tournament.sport || 'Badminton'}
                        </span>

                        <span
                          className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider border ${isLiveOrActive
                              ? 'bg-primary/10 text-primary border-primary/25'
                              : 'bg-surface border-border text-foreground/60'
                            }`}
                        >
                          {tournament.status || 'Active'}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-base font-black text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {tournament.name}
                      </h3>

                      {/* Bento Detail Chips */}
                      <div className="mt-3.5 space-y-2 bg-surface p-3 rounded-xl border border-border/40 text-xs">
                        <div className="flex items-center justify-between text-foreground/70">
                          <span className="flex items-center gap-1.5 text-[11px] font-semibold">
                            <Calendar className="w-3.5 h-3.5 text-primary" />
                            <span>{tournament.startDate ? new Date(tournament.startDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'Dates TBA'}</span>
                          </span>
                          <span className="font-bold text-foreground">
                            {tournament.registrationFees ? `₹${tournament.registrationFees}` : 'Free'}
                          </span>
                        </div>

                        {tournament.location && (
                          <div className="flex items-center gap-1.5 text-foreground/60 text-[11px] font-medium truncate">
                            <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span className="truncate">{tournament.location}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Hub Buttons */}
                    <div className="mt-4 pt-3 border-t border-border/40 grid grid-cols-2 gap-2">
                      <Link
                        href={`/org/${orgId}/organizer/tournaments/${tournament.tournamentUuid || tournament.tournamentId}`}
                        className="py-2 px-3 rounded-lg text-[11px] font-bold uppercase tracking-wider bg-surface border border-border hover:border-primary/50 text-foreground text-center transition-all"
                      >
                        Manage
                      </Link>
                      <Link
                        href={`/tournaments/${tournament.tournamentUuid || tournament.tournamentId}`}
                        className="py-2 px-3 rounded-lg text-[11px] font-bold uppercase tracking-wider bg-primary text-primary-foreground hover:opacity-90 text-center transition-all shadow-sm"
                      >
                        Public View
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              className="rounded-2xl p-10 border text-center flex flex-col items-center justify-center space-y-4"
              style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-primary/10 border border-primary/20 text-primary">
                <Trophy className="w-7 h-7" />
              </div>
              <div className="space-y-1 max-w-sm">
                <h3 className="text-base font-bold text-foreground">No Tournaments Found</h3>
                <p className="text-xs text-foreground/60">
                  You haven't created any tournaments in this category yet. Launch your first event in minutes.
                </p>
              </div>
              <Link
                href={`/org/${orgId}/tournaments/create`}
                className="px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-primary text-primary-foreground hover:scale-105 active:scale-95 transition-all shadow-md"
              >
                + Create Tournament
              </Link>
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
