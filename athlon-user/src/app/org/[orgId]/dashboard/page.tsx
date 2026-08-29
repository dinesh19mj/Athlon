'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import {
  Trophy,
  Users,
  CreditCard,
  Activity,
  Calendar,
  Settings,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Building,
  MapPin,
  ClipboardList,
  GraduationCap,
  TrendingUp,
  Package,
  BarChart2,
  Video,
  Play,
  Radio,
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
  Clock,
  CheckCircle2,
  SlidersHorizontal,
  UserCheck,
} from 'lucide-react';

import HomeRoleHeader from '@/components/home/HomeRoleHeader';
import { useAthlonTheme } from '@/hooks/use-athlon-theme';
import { getThemeVideo } from '@/config/theme';
import { Athlon3DIcon, Athlon3DIconProps } from '@/components/common/Athlon3DIcon';
import { ClubFinanceService, FinanceSummary } from '@/lib/api/clubFinance';
import { OrganizationService, OrganizationMemberResponse } from '@/lib/api/organization';
import { ClubInventoryService, InventorySummary } from '@/lib/api/clubInventory';
import { TournamentService, Tournament } from '@/lib/api/tournaments';

function getOrg3DIconType(name: string): Athlon3DIconProps['type'] {
  const n = name.toLowerCase();
  if (n.includes('tournament') || n.includes('event') || n.includes('cup') || n.includes('league')) return 'tournaments';
  if (n.includes('live') || n.includes('stream') || n.includes('broadcast') || n.includes('video')) return 'livestream';
  if (n.includes('student') || n.includes('pupil')) return 'students';
  if (n.includes('coach') || n.includes('trainer')) return 'coaches';
  if (n.includes('member') || n.includes('staff') || n.includes('squad') || n.includes('team')) return 'members';
  if (n.includes('attendance') || n.includes('check-in') || n.includes('roll')) return 'attendance';
  if (n.includes('schedule') || n.includes('calendar') || n.includes('slot') || n.includes('booking')) return 'schedule';
  if (n.includes('performance') || n.includes('telemetry') || n.includes('analytic')) return 'performance';
  if (n.includes('match') || n.includes('fixture') || n.includes('sparring')) return 'matches';
  if (n.includes('setup') || n.includes('console') || n.includes('officiat')) return 'setup';
  if (n.includes('umpire') || n.includes('referee')) return 'umpire';
  if (n.includes('leaderboard') || n.includes('rank') || n.includes('standing') || n.includes('result')) return 'rankings';
  if (n.includes('inventory') || n.includes('equipment') || n.includes('shuttle') || n.includes('gear')) return 'inventory';
  if (n.includes('finance') || n.includes('fee') || n.includes('billing') || n.includes('payout') || n.includes('revenue') || n.includes('card')) return 'finances';
  if (n.includes('facility') || n.includes('infrastructure') || n.includes('district') || n.includes('court') || n.includes('map') || n.includes('venue')) return 'facilities';
  if (n.includes('setting') || n.includes('config')) return 'settings';
  if (n.includes('registration') || n.includes('register') || n.includes('approv') || n.includes('entry') || n.includes('pass')) return 'registered';
  if (n.includes('academ') || n.includes('club')) return 'academies';
  return 'home';
}

export default function OrganizationDashboard() {
  const params = useParams();
  const orgId = (params?.orgId as string) || '';
  const { getActiveOrganization, organizations } = useWorkspaceStore();
  const { themeKey } = useAthlonTheme();
  const backgroundVideo = getThemeVideo(themeKey);
  const org = getActiveOrganization() || organizations.find((o) => o.id === orgId);

  const [financeSummary, setFinanceSummary] = useState<FinanceSummary | null>(null);
  const [members, setMembers] = useState<OrganizationMemberResponse[]>([]);
  const [inventorySummary, setInventorySummary] = useState<InventorySummary | null>(null);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  const toolsTrackRef = useRef<HTMLDivElement>(null);
  const eventsTrackRef = useRef<HTMLDivElement>(null);
  const liveTrackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (org?.id) {
      setLoadingMetrics(true);
      Promise.allSettled([
        ClubFinanceService.getSummary(org.id),
        OrganizationService.getMembers(org.id),
        ClubInventoryService.getSummary(org.id),
        TournamentService.getByOrg(org.id),
      ]).then(([finRes, memRes, invRes, tournRes]) => {
        if (finRes.status === 'fulfilled') {
          const sum = (finRes.value as any)?.data || finRes.value;
          setFinanceSummary(sum);
        }
        if (memRes.status === 'fulfilled') {
          const memList = Array.isArray(memRes.value) ? memRes.value : ((memRes.value as any)?.data || []);
          setMembers(memList);
        }
        if (invRes.status === 'fulfilled') {
          const invSum = (invRes.value as any)?.data || invRes.value;
          setInventorySummary(invSum);
        }
        if (tournRes.status === 'fulfilled') {
          const tList = Array.isArray(tournRes.value) ? tournRes.value : ((tournRes.value as any)?.data || []);
          setTournaments(tList);
        }
        setLoadingMetrics(false);
      });
    }
  }, [org?.id]);

  const newMembersThisWeek = useMemo(() => {
    return members.filter((m) => {
      if (!m.joinedAt) return false;
      const joined = new Date(m.joinedAt);
      const diffDays = (Date.now() - joined.getTime()) / (1000 * 3600 * 24);
      return diffDays <= 7;
    }).length;
  }, [members]);

  const scrollTrack = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!org) return null;

  // Determine quick actions based on organization type
  const getQuickActions = () => {
    const actions = [];

    if (org.type === 'ACADEMY') {
      actions.push({
        id: `/org/${org.id}/students`,
        label: 'Students',
        description: 'Manage enrollments & batches',
        icon: GraduationCap,
        color: 'text-[#3B82F6]',
        bg: 'bg-blue-500/10',
      });
      actions.push({
        id: `/org/${org.id}/attendance`,
        label: 'Attendance',
        description: 'Daily check-ins & roll call',
        icon: ClipboardList,
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
      });
      actions.push({
        id: `/org/${org.id}/coaches`,
        label: 'Coaches',
        description: 'Staff & coaching roster',
        icon: UserCheck,
        color: 'text-purple-400',
        bg: 'bg-purple-500/10',
      });
      actions.push({
        id: `/org/${org.id}/members`,
        label: 'Staff',
        description: 'Administration & roles',
        icon: ShieldCheck,
        color: 'text-foreground/70',
        bg: 'bg-white/5',
      });
      actions.push({
        id: `/org/${org.id}/schedule`,
        label: 'Schedule',
        description: 'Training calendars & slots',
        icon: Calendar,
        color: 'text-orange-400',
        bg: 'bg-orange-500/10',
      });
      actions.push({
        id: `/org/${org.id}/performance`,
        label: 'Performance',
        description: 'Telemetry & analytics',
        icon: TrendingUp,
        color: 'text-blue-400',
        bg: 'bg-blue-500/10',
      });
      actions.push({
        id: `/org/${org.id}/matches`,
        label: 'Matches',
        description: 'Internal academy sparring',
        icon: Activity,
        color: 'text-red-400',
        bg: 'bg-red-500/10',
      });
      actions.push({
        id: `/org/${org.id}/match-setup`,
        label: 'Setup',
        description: 'Quick court launch console',
        icon: SlidersHorizontal,
        color: 'text-amber-500',
        bg: 'bg-amber-500/10',
      });
      actions.push({
        id: `/org/${org.id}/livestream`,
        label: 'Live Stream',
        description: 'Broadcast court cameras',
        icon: Video,
        color: 'text-red-500',
        bg: 'bg-red-500/10',
      });
    } else if (org.type === 'CLUB') {
      actions.push({
        id: `/org/${org.id}/members`,
        label: 'Members',
        description: 'Registered club members',
        icon: Users,
        color: 'text-[#3B82F6]',
        bg: 'bg-blue-500/10',
      });
      actions.push({
        id: `/org/${org.id}/matches`,
        label: 'Matches',
        description: 'Club league fixtures',
        icon: Activity,
        color: 'text-red-400',
        bg: 'bg-red-500/10',
      });
      actions.push({
        id: `/org/${org.id}/match-setup`,
        label: 'Setup',
        description: 'Officiating console',
        icon: SlidersHorizontal,
        color: 'text-amber-500',
        bg: 'bg-amber-500/10',
      });
      actions.push({
        id: `/org/${org.id}/attendance`,
        label: 'Attendance',
        description: 'Court bookings & check-ins',
        icon: ClipboardList,
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
      });
      actions.push({
        id: `/org/${org.id}/leaderboard`,
        label: 'Leaderboard',
        description: 'Club ELO rankings',
        icon: BarChart2,
        color: 'text-purple-400',
        bg: 'bg-purple-500/10',
      });
      actions.push({
        id: `/org/${org.id}/inventory`,
        label: 'Inventory',
        description: 'Shuttles & equipment',
        icon: Package,
        color: 'text-orange-400',
        bg: 'bg-orange-500/10',
      });
    }

    if (org.type === 'ORGANIZER' || org.type === 'ASSOCIATION') {
      actions.push({
        id: `/org/${org.id}/tournaments`,
        label: 'Tournaments',
        description: 'Championships, Draws & Schedules',
        icon: Trophy,
        color: 'text-yellow-400',
        bg: 'bg-yellow-500/10',
      });
      actions.push({
        id: `/org/${org.id}/match-setup`,
        label: 'Setup',
        description: 'Digital Umpire Console',
        icon: SlidersHorizontal,
        color: 'text-amber-500',
        bg: 'bg-amber-500/10',
      });
      actions.push({
        id: `/org/${org.id}/livestream`,
        label: 'Live Stream',
        description: 'HD Multi-court Broadcast',
        icon: Video,
        color: 'text-red-400',
        bg: 'bg-red-500/10',
      });
    }

    if (org.type === 'COURT') {
      actions.push({
        id: `/org/${org.id}/bookings`,
        label: 'Bookings',
        description: 'Court slot management',
        icon: Calendar,
        color: 'text-primary',
        bg: 'bg-primary/10',
      });
      actions.push({
        id: `/org/${org.id}/facilities`,
        label: 'Facilities',
        description: 'Arena infrastructure',
        icon: MapPin,
        color: 'text-purple-400',
        bg: 'bg-purple-500/10',
      });
    }

    // Common actions
    actions.push({
      id: `/org/${org.id}/finances`,
      label: 'Finances',
      description: 'Billing, payouts & revenue',
      icon: CreditCard,
      color: 'text-primary',
      bg: 'bg-primary/10',
    });
    actions.push({
      id: `/org/${org.id}/settings`,
      label: 'Settings',
      description: 'Workspace configuration',
      icon: Settings,
      color: 'text-foreground/60',
      bg: 'bg-white/5',
    });

    return actions;
  };

  const getOrgIcon = () => {
    switch (org.type) {
      case 'ACADEMY':
        return Users;
      case 'CLUB':
        return Building;
      case 'ORGANIZER':
        return Trophy;
      case 'ASSOCIATION':
        return ShieldCheck;
      case 'COURT':
        return MapPin;
      default:
        return Building;
    }
  };

  const quickActions = getQuickActions();
  const OrgIcon = getOrgIcon();

  // Mock workspace events for Organizer
  const orgTournaments = [
    {
      id: 'tourn-1',
      title: 'State Championship League 2026',
      type: 'Team Championship',
      sport: 'Badminton',
      status: 'LIVE IN PLAY',
      teams: 8,
      matches: 24,
      venue: 'Main Indoor Arena',
      badge: 'Live',
    },
    {
      id: 'tourn-2',
      title: 'Summer Smash Masters Open',
      type: 'Open Tournament',
      sport: 'Badminton',
      status: 'REGISTRATIONS OPEN',
      teams: 48,
      matches: 64,
      venue: 'Central Court Complex',
      badge: 'Upcoming',
    },
    {
      id: 'tourn-3',
      title: 'Junior District Cup 2026',
      type: 'Junior Knockout',
      sport: 'Badminton',
      status: 'SCHEDULED',
      teams: 32,
      matches: 31,
      venue: 'Sports Authority Stadium',
      badge: 'Upcoming',
    },
  ];

  // Mock live courts for Organizer
  const liveCourts = [
    {
      id: 'court-1',
      court: 'Court 1',
      tournament: 'State Championship League 2026',
      match: 'Warriors BC vs Smashers United',
      score: '21-18, 14-12',
      status: 'Set 2 In Play',
      streamLive: true,
    },
    {
      id: 'court-2',
      court: 'Court 2',
      tournament: 'State Championship League 2026',
      match: 'Apex Shuttlers vs Lightning Stars',
      score: '19-21, 21-17, 8-5',
      status: 'Deciding Set',
      streamLive: true,
    },
    {
      id: 'court-3',
      court: 'Court 3',
      tournament: 'State Championship League 2026',
      match: 'Royal Strikers vs Phoenix Club',
      score: 'Warm-up / Lineup Check',
      status: 'Ready to Start',
      streamLive: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-black">
      {/* ══════════════════════════════════════════════════════════════════════
          1. MOBILE VIEW ONLY (< md) - 100% UNTOUCHED ORIGINAL EXPERIENCE
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="block md:hidden pb-24 overflow-y-auto">
        {/* HERO SECTION (Video Container) */}
        <div className="px-6 relative z-10 mt-6 mb-6 max-w-7xl mx-auto">
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

        {/* ROLE SWITCHER HEADER */}
        <div className="px-6 mb-6 max-w-7xl mx-auto">
          <HomeRoleHeader activeRole={org.id} organizations={organizations} showSearch={false} />
        </div>

        {/* UNIFIED ORG STATS & METRICS CARD */}
        <div className="px-6 relative z-10 mb-4 max-w-7xl mx-auto">
          <div
            className="rounded-[18px] shadow-lg overflow-hidden border border-white/[0.08] relative"
            style={{
              background: 'linear-gradient(145deg, var(--athlon-card) 0%, rgba(14, 22, 38, 0.95) 100%)',
            }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />

            {/* Org Info Header */}
            <div className="flex items-center justify-between p-3.5 border-b border-white/[0.06] relative z-10">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative">
                  <div className="w-9 h-9 rounded-xl bg-black/40 border border-white/10 overflow-hidden shrink-0 shadow-inner flex items-center justify-center">
                    {org.logo ? (
                      <img src={org.logo} alt={org.name} className="w-full h-full object-cover" />
                    ) : (
                      <OrgIcon className="w-4 h-4 text-foreground/50" />
                    )}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#0A0F1D]" />
                </div>

                <div className="flex flex-col min-w-0">
                  <span className="text-foreground font-bold text-xs tracking-wide uppercase truncate">
                    {org.name}
                  </span>
                </div>
              </div>

              {/* Role Capsule Badge */}
              <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-xl px-2.5 py-1.5 shrink-0">
                <span className="text-primary font-black text-xs leading-none">{org.type}</span>
                <OrgIcon className="w-3.5 h-3.5 text-primary shrink-0 opacity-90" />
              </div>
            </div>

            {/* 2 Metrics Grid */}
            <div className="grid grid-cols-2 divide-x divide-white/[0.06] bg-black/[0.15] relative z-10">
              <Link
                href={`/org/${org.id}/finances`}
                className="flex flex-col items-center justify-center py-2.5 px-2 gap-1 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-1 text-foreground/40 text-[8px] font-extrabold tracking-wider uppercase">
                  <CreditCard className="w-3 h-3 text-foreground/50" />
                  <span>MONTHLY REVENUE</span>
                </div>
                <div className="text-foreground font-bold text-xs leading-tight flex items-baseline gap-1">
                  <span>₹{Number(financeSummary?.totalIncome || 0).toLocaleString('en-IN')}</span>
                  {financeSummary && Number(financeSummary.netBalance) !== 0 ? (
                    <span className={`text-[8px] font-semibold ${
                      Number(financeSummary.netBalance) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {Number(financeSummary.netBalance) >= 0 ? `+₹${Number(financeSummary.netBalance).toLocaleString('en-IN')}` : `-₹${Math.abs(Number(financeSummary.netBalance)).toLocaleString('en-IN')}`}
                    </span>
                  ) : (
                    <span className="text-[8px] text-emerald-400 font-semibold">+0%</span>
                  )}
                </div>
              </Link>

              <Link
                href={`/org/${org.id}/members`}
                className="flex flex-col items-center justify-center py-2.5 px-2 gap-1 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-1 text-foreground/40 text-[8px] font-extrabold tracking-wider uppercase">
                  <Users className="w-3 h-3 text-foreground/50" />
                  <span>ACTIVE MEMBERS</span>
                </div>
                <div className="text-foreground font-bold text-xs leading-tight flex items-baseline gap-1">
                  <span>{members.length}</span>
                  <span className="text-[8px] text-blue-400 font-semibold">
                    {newMembersThisWeek > 0 ? `+${newMembersThisWeek} new` : 'Roster'}
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Horizontal Quick Actions */}
        <div className="px-6 max-w-7xl mx-auto mt-4 space-y-6">
          <div className="flex items-center justify-between gap-3 overflow-x-auto pb-2 hide-scrollbar">
            {quickActions.map((action) => (
              <Link key={action.id} href={action.id} className="flex flex-col items-center gap-1.5 shrink-0 group">
                <div
                  className="w-[68px] h-[68px] rounded-[18px] flex flex-col items-center justify-center transition-all shadow-lg cursor-pointer hover:scale-105 active:scale-95 border"
                  style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                >
                  <Athlon3DIcon type={getOrg3DIconType(action.label)} size={38} active={true} />
                </div>
                <span
                  className="text-[10px] font-semibold text-center transition-colors group-hover:text-primary"
                  style={{ color: 'var(--athlon-text-secondary)' }}
                >
                  {action.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          2. DESKTOP VIEW ONLY (hidden on mobile, visible on md and above)
             - PREMIUM COMMAND DECK WITH HORIZONTAL SCROLLING TRACKS
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="hidden md:block min-h-screen pb-20 bg-background">
        {/* Desktop Hero Command Banner (No background video) */}
        <section
          className="border-b px-8 py-10 bg-gradient-to-b from-card/80 via-card/40 to-background relative overflow-hidden"
          style={{ borderColor: 'var(--athlon-border)' }}
        >
          {/* Ambient Radar Glow */}
          <div className="absolute top-0 right-1/4 w-[500px] h-[250px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[200px] bg-yellow-500/5 rounded-full blur-[90px] pointer-events-none" />

          <div className="max-w-7xl mx-auto space-y-8 relative z-10">
            {/* Header Strip */}
            <div className="flex items-center justify-between gap-6 flex-wrap">
              <div className="flex items-center gap-5">
                <div
                  className="w-16 h-16 rounded-[24px] border p-1 shadow-2xl flex items-center justify-center relative overflow-hidden"
                  style={{
                    backgroundColor: 'var(--athlon-surface)',
                    borderColor: 'var(--athlon-border)',
                  }}
                >
                  {org.logo ? (
                    <img src={org.logo} alt={org.name} className="w-full h-full object-cover rounded-[20px]" />
                  ) : (
                    <OrgIcon className="w-8 h-8 text-primary" />
                  )}
                  <div className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-background" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-black text-foreground tracking-tight">{org.name}</h1>
                    <span className="px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-widest bg-primary/15 text-primary border border-primary/30">
                      {org.type} Workspace
                    </span>
                  </div>
                  <p className="text-xs text-foreground/50">
                    Central management operations console, event coordination, and financial ledger
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <Link
                  href={`/org/${org.id}/tournaments/create`}
                  className="flex items-center gap-2 bg-primary text-black text-xs font-black px-5 py-2.5 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg"
                  style={{ boxShadow: '0 4px 20px var(--athlon-primary-glow)' }}
                >
                  <Trophy className="w-4 h-4" />
                  <span>Create Tournament</span>
                </Link>

                <Link
                  href={`/org/${org.id}/settings`}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-black uppercase tracking-wider text-foreground/70 hover:text-foreground hover:bg-white/5 transition-all"
                  style={{ borderColor: 'var(--athlon-border)' }}
                >
                  <Settings className="w-4 h-4 text-primary" />
                  <span>Org Settings</span>
                </Link>
              </div>
            </div>

            {/* 4 Workspace Telemetry Highlight Cards */}
            <div className="grid grid-cols-4 gap-4">
              <Link
                href={`/org/${org.id}/finances`}
                className="p-5 rounded-[24px] border space-y-2 relative overflow-hidden shadow-sm hover:border-primary/40 transition-all group block"
                style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
              >
                <div className="flex items-center justify-between text-foreground/50">
                  <span className="text-[10px] font-black uppercase tracking-wider">Monthly Revenue</span>
                  <CreditCard className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-foreground font-mono">
                    ₹{Number(financeSummary?.totalIncome || 0).toLocaleString('en-IN')}
                  </span>
                  {financeSummary && (
                    <span className={`text-xs font-bold font-mono ${
                      Number(financeSummary.netBalance || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {Number(financeSummary.netBalance || 0) >= 0
                        ? `+₹${Number(financeSummary.netBalance || 0).toLocaleString('en-IN')} Net`
                        : `-₹${Math.abs(Number(financeSummary.netBalance || 0)).toLocaleString('en-IN')} Net`}
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-foreground/45 block">
                  {financeSummary ? `${financeSummary.transactionCount} transactions recorded` : 'Verified payouts & fee collections'}
                </span>
              </Link>

              <Link
                href={`/org/${org.id}/members`}
                className="p-5 rounded-[24px] border space-y-2 relative overflow-hidden shadow-sm hover:border-blue-500/40 transition-all group block"
                style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
              >
                <div className="flex items-center justify-between text-foreground/50">
                  <span className="text-[10px] font-black uppercase tracking-wider">Active Members</span>
                  <Users className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-foreground font-mono">{members.length}</span>
                  <span className="text-xs font-bold text-blue-400 font-mono">
                    {newMembersThisWeek > 0 ? `+${newMembersThisWeek} this week` : 'Active Roster'}
                  </span>
                </div>
                <span className="text-[11px] text-foreground/45 block">Registered athlete roster</span>
              </Link>

              <Link
                href={`/org/${org.id}/tournaments`}
                className="p-5 rounded-[24px] border space-y-2 relative overflow-hidden shadow-sm hover:border-yellow-500/40 transition-all group block"
                style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
              >
                <div className="flex items-center justify-between text-foreground/50">
                  <span className="text-[10px] font-black uppercase tracking-wider">Tournaments Active</span>
                  <Trophy className="w-4 h-4 text-yellow-400 group-hover:scale-110 transition-transform" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-yellow-400 font-mono">{tournaments.length} Events</span>
                  <span className="text-xs font-bold text-yellow-500 font-mono">
                    {tournaments.filter(t => (t as any).status === 'LIVE' || (t as any).status === 'IN_PROGRESS').length > 0
                      ? `${tournaments.filter(t => (t as any).status === 'LIVE' || (t as any).status === 'IN_PROGRESS').length} Live`
                      : 'Scheduled'}
                  </span>
                </div>
                <span className="text-[11px] text-foreground/45 block">Championships &amp; Opens</span>
              </Link>

              <Link
                href={`/org/${org.id}/inventory`}
                className="p-5 rounded-[24px] border space-y-2 relative overflow-hidden shadow-sm hover:border-emerald-500/40 transition-all group block"
                style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
              >
                <div className="flex items-center justify-between text-foreground/50">
                  <span className="text-[10px] font-black uppercase tracking-wider">Club Supplies &amp; Gear</span>
                  <Package className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-primary font-mono">
                    {inventorySummary?.totalQuantity || 0} Units
                  </span>
                  <span className="text-xs font-bold text-emerald-400 font-mono">
                    {inventorySummary?.inStockCount || 0} In Stock
                  </span>
                </div>
                <span className="text-[11px] text-foreground/45 block">
                  {inventorySummary?.lowStockCount ? `${inventorySummary.lowStockCount} low stock alerts` : 'Shuttles & equipment ready'}
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* Desktop Main Tracks (Horizontal Scrolling) */}
        <main className="max-w-7xl mx-auto px-8 py-10 space-y-12">
          {/* 1. Management Quick Action Tools (Horizontal Scroll) */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-primary" />
                <div>
                  <h2 className="text-lg font-black text-foreground">Management Tools &amp; Modules</h2>
                  <p className="text-xs text-foreground/50">
                    Quick operations console for {org.name} ({quickActions.length} tools available)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => scrollTrack(toolsTrackRef, 'left')}
                  className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                  style={{ borderColor: 'var(--athlon-border)' }}
                  title="Scroll Left"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollTrack(toolsTrackRef, 'right')}
                  className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                  style={{ borderColor: 'var(--athlon-border)' }}
                  title="Scroll Right"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div
              ref={toolsTrackRef}
              className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 snap-x scroll-px-8 hide-scrollbar -mx-8 px-8"
            >
              {quickActions.map((action) => (
                <Link
                  key={action.id}
                  href={action.id}
                  className="snap-start shrink-0 w-[240px] p-5 rounded-[24px] border relative overflow-hidden flex flex-col justify-between shadow-lg hover:shadow-2xl transition-all group"
                  style={{
                    backgroundColor: 'var(--athlon-card)',
                    borderColor: 'var(--athlon-border)',
                  }}
                >
                  <div className="space-y-3">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-surface border border-white/10 shadow-inner group-hover:scale-110 transition-transform shrink-0">
                      <Athlon3DIcon type={getOrg3DIconType(action.label)} size={36} active={true} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-foreground group-hover:text-primary transition-colors">
                        {action.label}
                      </h3>
                      <p className="text-xs text-foreground/50 mt-1 leading-relaxed line-clamp-2">
                        {action.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-bold text-primary pt-3 border-t mt-4" style={{ borderColor: 'var(--athlon-border)' }}>
                    <span>Open Tool</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* 2. Active Tournaments & Championships (Horizontal Scroll) */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <div>
                  <h2 className="text-lg font-black text-foreground">Active Tournaments &amp; Leagues</h2>
                  <p className="text-xs text-foreground/50">Manage draws, schedules, umpire allocations, and results</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => scrollTrack(eventsTrackRef, 'left')}
                  className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                  style={{ borderColor: 'var(--athlon-border)' }}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollTrack(eventsTrackRef, 'right')}
                  className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                  style={{ borderColor: 'var(--athlon-border)' }}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div
              ref={eventsTrackRef}
              className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 snap-x scroll-px-8 hide-scrollbar -mx-8 px-8"
            >
              {orgTournaments.map((tournament) => (
                <div key={tournament.id} className="snap-start shrink-0 w-[360px]">
                  <div
                    className="p-6 rounded-[28px] border bg-card relative overflow-hidden h-full flex flex-col justify-between shadow-xl space-y-4 hover:border-yellow-500/40 transition-all group"
                    style={{
                      backgroundColor: 'var(--athlon-card)',
                      borderColor: 'var(--athlon-border)',
                    }}
                  >
                    <div className="h-1 w-full bg-gradient-to-r from-yellow-500 via-amber-400 to-primary absolute top-0 left-0 right-0" />

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-yellow-500/15 text-yellow-400 border border-yellow-500/30">
                          {tournament.type}
                        </span>
                        <span className="text-xs text-foreground/50 font-bold">{tournament.sport}</span>
                      </div>

                      <h3 className="text-base font-black text-foreground truncate group-hover:text-yellow-400 transition-colors">
                        {tournament.title}
                      </h3>

                      <div
                        className="grid grid-cols-2 gap-2 p-3 rounded-2xl border text-center"
                        style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                      >
                        <div>
                          <span className="text-[9px] uppercase font-bold text-foreground/40 block">Teams / Entrants</span>
                          <span className="text-sm font-black text-foreground font-mono">{tournament.teams}</span>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase font-bold text-foreground/40 block">Total Fixtures</span>
                          <span className="text-sm font-black text-primary font-mono">{tournament.matches}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-foreground/50">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate">{tournament.venue}</span>
                      </div>
                    </div>

                    <Link
                      href={`/org/${org.id}/tournaments`}
                      className="w-full py-2.5 rounded-xl bg-surface border border-yellow-500/30 text-yellow-400 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-yellow-500/10 transition-all"
                    >
                      <span>Manage Event</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 3. Courtside Live Scoring & Streams Track (Horizontal Scroll) */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Radio className="w-5 h-5 text-red-500 animate-pulse" />
                <div>
                  <h2 className="text-lg font-black text-foreground">Courtside Live Stream &amp; Scoring Console</h2>
                  <p className="text-xs text-foreground/50">Real-time point-by-point umpire radar and stream broadcast links</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => scrollTrack(liveTrackRef, 'left')}
                  className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                  style={{ borderColor: 'var(--athlon-border)' }}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollTrack(liveTrackRef, 'right')}
                  className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                  style={{ borderColor: 'var(--athlon-border)' }}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div
              ref={liveTrackRef}
              className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 snap-x scroll-px-8 hide-scrollbar -mx-8 px-8"
            >
              {liveCourts.map((court) => (
                <div key={court.id} className="snap-start shrink-0 w-[360px]">
                  <div
                    className="p-6 rounded-[28px] border bg-card relative overflow-hidden h-full flex flex-col justify-between shadow-xl space-y-4 hover:border-red-500/40 transition-all group"
                    style={{
                      backgroundColor: 'var(--athlon-card)',
                      borderColor: 'var(--athlon-border)',
                    }}
                  >
                    <div className="h-1 w-full bg-red-500 animate-pulse absolute top-0 left-0 right-0" />

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500/15 text-red-400 border border-red-500/30 flex items-center gap-1">
                          <Radio className="w-3 h-3 text-red-500 animate-pulse" /> {court.court}
                        </span>
                        <span className="text-xs text-foreground/50 font-bold">{court.status}</span>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-foreground/40 block truncate">
                          {court.tournament}
                        </span>
                        <h3 className="text-sm font-black text-foreground truncate mt-0.5">{court.match}</h3>
                      </div>

                      <div
                        className="p-3 rounded-2xl border flex items-center justify-between text-center"
                        style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                      >
                        <span className="text-[10px] font-extrabold uppercase text-foreground/50">Current Score</span>
                        <span className="text-base font-black text-red-400 font-mono">{court.score}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t" style={{ borderColor: 'var(--athlon-border)' }}>
                      <Link
                        href={`/org/${org.id}/match-setup`}
                        className="py-2.5 rounded-xl bg-surface border border-red-500/30 text-red-400 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-red-500/10 transition-all text-center"
                      >
                        <Play className="w-3.5 h-3.5" /> <span>Umpire</span>
                      </Link>

                      <Link
                        href={`/org/${org.id}/livestream`}
                        className="py-2.5 rounded-xl bg-red-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-red-500/25 hover:bg-red-600 transition-all text-center"
                      >
                        <Video className="w-3.5 h-3.5" /> <span>Broadcast</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
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
