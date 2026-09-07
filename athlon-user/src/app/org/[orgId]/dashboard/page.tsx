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
  Building2,
  Newspaper,
} from 'lucide-react';

import HomeRoleHeader from '@/components/home/HomeRoleHeader';
import { useAthlonTheme } from '@/hooks/use-athlon-theme';
import { getThemeVideo } from '@/config/theme';
import { Athlon3DIcon, Athlon3DIconProps } from '@/components/common/Athlon3DIcon';
import { ClubFinanceService, FinanceSummary } from '@/lib/api/clubFinance';
import { OrganizationService, OrganizationMemberResponse } from '@/lib/api/organization';
import { ClubInventoryService, InventorySummary } from '@/lib/api/clubInventory';
import { TournamentService, Tournament } from '@/lib/api/tournaments';
import { useOrgRole } from '@/hooks/use-org-role';
import { usePermissions } from '@/hooks/use-permissions';

function getOrg3DIconType(name: string): Athlon3DIconProps['type'] {
  const n = name.toLowerCase();
  if (n.includes('tournament') || n.includes('event') || n.includes('cup') || n.includes('league')) return 'tournaments';
  if (n.includes('live') || n.includes('stream') || n.includes('broadcast') || n.includes('video')) return 'livestream';
  if (n.includes('post') || n.includes('blog') || n.includes('gallery') || n.includes('feed') || n.includes('media') || n.includes('article')) return 'posts';
  if (n.includes('student') || n.includes('pupil')) return 'students';
  if (n.includes('batch') || n.includes('group') || n.includes('coaching')) return 'batches';
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
  if (n.includes('centre') || n.includes('campus') || n.includes('branch')) return 'facilities';
  if (n.includes('facility') || n.includes('infrastructure') || n.includes('district') || n.includes('court') || n.includes('map') || n.includes('venue')) return 'facilities';
  if (n.includes('setting') || n.includes('config')) return 'settings';
  if (n.includes('registration') || n.includes('register') || n.includes('approv') || n.includes('entry') || n.includes('pass')) return 'registered';
  if (n.includes('academ') || n.includes('club')) return 'academies';
  return 'home';
}

import { AcademyService, AcademyDashboardSummary } from '@/lib/api/academy';

export default function OrganizationDashboard() {
  const params = useParams();
  const orgId = (params?.orgId as string) || '';
  const { getActiveOrganization, organizations } = useWorkspaceStore();
  const { themeKey } = useAthlonTheme();
  const backgroundVideo = getThemeVideo(themeKey);
  const org = getActiveOrganization() || organizations.find((o) => o.id === orgId);
  const { role, isAdmin, isCoach, isMember, canManage } = useOrgRole(org?.id);
  const { canAccessModule } = usePermissions(org?.id);

  const [financeSummary, setFinanceSummary] = useState<FinanceSummary | null>(null);
  const [members, setMembers] = useState<OrganizationMemberResponse[]>([]);
  const [inventorySummary, setInventorySummary] = useState<InventorySummary | null>(null);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [academyDashboard, setAcademyDashboard] = useState<AcademyDashboardSummary | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [selectedCampusFilter, setSelectedCampusFilter] = useState('ALL');
  const [selectedSportFilter, setSelectedSportFilter] = useState('ALL');

  const toolsTrackRef = useRef<HTMLDivElement>(null);
  const eventsTrackRef = useRef<HTMLDivElement>(null);
  const liveTrackRef = useRef<HTMLDivElement>(null);
  const sessionsTrackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (org?.id) {
      setLoadingMetrics(true);
      Promise.allSettled([
        ClubFinanceService.getSummary(org.id),
        OrganizationService.getMembers(org.id),
        ClubInventoryService.getSummary(org.id),
        TournamentService.getByOrg(org.id),
        org.type === 'ACADEMY' ? AcademyService.getDashboard(org.id) : Promise.resolve(null),
      ]).then(([finRes, memRes, invRes, tournRes, acadRes]) => {
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
        if (acadRes.status === 'fulfilled' && acadRes.value) {
          setAcademyDashboard(acadRes.value as AcademyDashboardSummary);
        }
        setLoadingMetrics(false);
      });
    }
  }, [org?.id, org?.type]);

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

  // Determine quick actions based on organization type and role permissions
  const getQuickActions = () => {
    const actions = [];

    if (org.type === 'ACADEMY') {
      const allAcademyTools = [
        {
          key: 'tournaments',
          id: `/org/${org.id}/tournaments`,
          label: 'Tournaments',
          description: 'Internal leagues & draws',
          icon: Trophy,
          color: 'text-amber-400',
          bg: 'bg-amber-500/10',
        },
        {
          key: 'students',
          id: `/org/${org.id}/students`,
          label: 'Students',
          description: 'Enrollments & active roster',
          icon: GraduationCap,
          color: 'text-blue-400',
          bg: 'bg-blue-500/10',
        },
        {
          key: 'batches',
          id: `/org/${org.id}/batches`,
          label: 'Batches',
          description: 'Coaching groups & schedules',
          icon: Layers,
          color: 'text-indigo-400',
          bg: 'bg-indigo-500/10',
        },
        {
          key: 'schedule',
          id: `/org/${org.id}/schedule`,
          label: 'Schedule',
          description: 'Training calendars & slots',
          icon: Calendar,
          color: 'text-orange-400',
          bg: 'bg-orange-500/10',
        },
        {
          key: 'attendance',
          id: `/org/${org.id}/attendance`,
          label: 'Attendance',
          description: 'Daily check-ins & roll call',
          icon: ClipboardList,
          color: 'text-emerald-400',
          bg: 'bg-emerald-500/10',
        },
        {
          key: 'centres',
          id: `/org/${org.id}/centres`,
          label: 'Centres',
          description: 'Campus branches & locations',
          icon: Building2,
          color: 'text-violet-400',
          bg: 'bg-violet-500/10',
        },
        {
          key: 'facilities',
          id: `/org/${org.id}/facilities`,
          label: 'Facilities',
          description: 'Courts, turfs & arenas',
          icon: MapPin,
          color: 'text-cyan-400',
          bg: 'bg-cyan-500/10',
        },
        {
          key: 'coaches',
          id: `/org/${org.id}/coaches`,
          label: 'Coaches',
          description: 'Coaching staff & roster',
          icon: UserCheck,
          color: 'text-purple-400',
          bg: 'bg-purple-500/10',
        },
        {
          key: 'staff',
          id: `/org/${org.id}/staff`,
          label: 'Staff',
          description: 'Administration & roles',
          icon: ShieldCheck,
          color: 'text-slate-400',
          bg: 'bg-white/5',
        },
        {
          key: 'performance',
          id: `/org/${org.id}/performance`,
          label: 'Performance',
          description: 'Telemetry & analytics',
          icon: TrendingUp,
          color: 'text-blue-400',
          bg: 'bg-blue-500/10',
        },
        {
          key: 'matches',
          id: `/org/${org.id}/matches`,
          label: 'Matches',
          description: 'Internal academy sparring',
          icon: Activity,
          color: 'text-red-400',
          bg: 'bg-red-500/10',
        },
        {
          key: 'inventory',
          id: `/org/${org.id}/inventory`,
          label: 'Inventory',
          description: 'Shuttles & equipment stock',
          icon: Package,
          color: 'text-orange-400',
          bg: 'bg-orange-500/10',
        },
        {
          key: 'posts',
          id: `/org/${org.id}/posts`,
          label: 'Feed & Gallery',
          description: 'Blogs, YouTube drills & photos',
          icon: Newspaper,
          color: 'text-pink-400',
          bg: 'bg-pink-500/10',
        },
        {
          key: 'finances',
          id: `/org/${org.id}/finances`,
          label: 'Finances',
          description: 'Fee collection & ledgers',
          icon: CreditCard,
          color: 'text-emerald-400',
          bg: 'bg-emerald-500/10',
        },
        {
          key: 'settings',
          id: `/org/${org.id}/settings`,
          label: 'Settings',
          description: 'Academy configuration & preferences',
          icon: Settings,
          color: 'text-neutral-400',
          bg: 'bg-neutral-500/10',
        },
      ];

      // Filter tools based on dynamic role permissions
      const permitted = allAcademyTools.filter((tool) => canAccessModule(tool.key));
      return permitted;
    } else if (org.type === 'CLUB') {
      actions.push({
        id: `/org/${org.id}/tournaments`,
        label: 'Tournaments',
        description: 'Club tournaments & draws',
        icon: Trophy,
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
      });
      actions.push({
        id: `/org/${org.id}/livestream`,
        label: 'Live Stream',
        description: 'Live broadcast & scoring',
        icon: Video,
        color: 'text-rose-400',
        bg: 'bg-rose-500/10',
      });
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
      actions.push({
        id: `/org/${org.id}/analytics`,
        label: 'Analytics',
        description: 'Matches, attendance, stock & ledger',
        icon: TrendingUp,
        color: 'text-cyan-400',
        bg: 'bg-cyan-500/10',
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
        id: `/org/${org.id}/livestream`,
        label: 'Live Stream',
        description: 'HD Multi-court Broadcast',
        icon: Video,
        color: 'text-red-400',
        bg: 'bg-red-500/10',
      });
      actions.push({
        id: `/org/${org.id}/match-setup`,
        label: 'Setup',
        description: 'Digital Umpire Console',
        icon: SlidersHorizontal,
        color: 'text-amber-500',
        bg: 'bg-amber-500/10',
      });
    }

    if (org.type === 'COURT') {
      actions.push({
        id: `/org/${org.id}/tournaments`,
        label: 'Tournaments',
        description: 'Court tournaments & leagues',
        icon: Trophy,
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
      });
      actions.push({
        id: `/org/${org.id}/livestream`,
        label: 'Live Stream',
        description: 'Court match broadcast',
        icon: Video,
        color: 'text-rose-400',
        bg: 'bg-rose-500/10',
      });
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

    // Common actions for non-academy org types
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
            className="rounded-[18px] shadow-sm overflow-hidden border relative"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />

            {/* Org Info Header */}
            <div
              className="flex items-center justify-between p-3.5 border-b relative z-10"
              style={{ borderColor: 'var(--athlon-border)' }}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative">
                  <div
                    className="w-9 h-9 rounded-xl border overflow-hidden shrink-0 shadow-inner flex items-center justify-center"
                    style={{
                      backgroundColor: 'var(--athlon-surface)',
                      borderColor: 'var(--athlon-border)',
                    }}
                  >
                    {org.logo ? (
                      <img src={org.logo} alt={org.name} className="w-full h-full object-cover" />
                    ) : (
                      <OrgIcon className="w-4 h-4" style={{ color: 'var(--athlon-text-muted)' }} />
                    )}
                  </div>
                  <div
                    className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2"
                    style={{ borderColor: 'var(--athlon-card)' }}
                  />
                </div>

                <div className="flex flex-col min-w-0">
                  <span
                    className="font-bold text-xs tracking-wide uppercase truncate"
                    style={{ color: 'var(--athlon-text)' }}
                  >
                    {org.name}
                  </span>
                </div>
              </div>

              {/* Role Capsule Badge */}
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-xl px-2 py-1 shrink-0">
                  <span className="text-primary font-black text-[10px] leading-none">{org.type}</span>
                  <OrgIcon className="w-3 h-3 text-primary shrink-0 opacity-90" />
                </div>
                <span className={`px-2 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                  isAdmin
                    ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/25'
                    : isCoach
                    ? 'bg-purple-500/15 text-purple-700 dark:text-purple-400 border border-purple-500/25'
                    : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25'
                }`}>
                  {isAdmin ? '👑 Admin' : isCoach ? '🧢 Coach' : '👤 Member'}
                </span>
              </div>
            </div>

            {/* 2 Metrics Grid */}
            <div
              className="grid grid-cols-2 divide-x relative z-10"
              style={{
                backgroundColor: 'var(--athlon-surface)',
                borderColor: 'var(--athlon-border)',
              }}
            >
              <Link
                href={`/org/${org.id}/finances`}
                className="flex flex-col items-center justify-center py-2.5 px-2 gap-1 hover:opacity-80 transition-opacity"
                style={{ borderColor: 'var(--athlon-border)' }}
              >
                <div
                  className="flex items-center gap-1 text-[8px] font-extrabold tracking-wider uppercase"
                  style={{ color: 'var(--athlon-text-muted)' }}
                >
                  <CreditCard className="w-3 h-3" />
                  <span>MONTHLY REVENUE</span>
                </div>
                {loadingMetrics ? (
                  <div className="h-4 w-16 bg-foreground/10 rounded animate-pulse my-0.5" />
                ) : (
                  <div
                    className="font-bold text-xs leading-tight flex items-baseline gap-1"
                    style={{ color: 'var(--athlon-text)' }}
                  >
                    <span>₹{Number(financeSummary?.totalIncome || 0).toLocaleString('en-IN')}</span>
                    {financeSummary && Number(financeSummary.netBalance) !== 0 ? (
                      <span className={`text-[8px] font-semibold ${
                        Number(financeSummary.netBalance) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}>
                        {Number(financeSummary.netBalance) >= 0 ? `+₹${Number(financeSummary.netBalance).toLocaleString('en-IN')}` : `-₹${Math.abs(Number(financeSummary.netBalance)).toLocaleString('en-IN')}`}
                      </span>
                    ) : (
                      <span className="text-[8px] text-emerald-600 dark:text-emerald-400 font-semibold">+0%</span>
                    )}
                  </div>
                )}
              </Link>

              <Link
                href={org.type === 'ACADEMY' ? `/org/${org.id}/staff` : `/org/${org.id}/members`}
                className="flex flex-col items-center justify-center py-2.5 px-2 gap-1 hover:opacity-80 transition-opacity"
                style={{ borderColor: 'var(--athlon-border)' }}
              >
                <div
                  className="flex items-center gap-1 text-[8px] font-extrabold tracking-wider uppercase"
                  style={{ color: 'var(--athlon-text-muted)' }}
                >
                  <Users className="w-3 h-3" />
                  <span>{org.type === 'ACADEMY' ? 'STAFF ROSTER' : 'ACTIVE MEMBERS'}</span>
                </div>
                {loadingMetrics ? (
                  <div className="h-4 w-12 bg-foreground/10 rounded animate-pulse my-0.5" />
                ) : (
                  <div
                    className="font-bold text-xs leading-tight flex items-baseline gap-1"
                    style={{ color: 'var(--athlon-text)' }}
                  >
                    <span>{members.length}</span>
                    <span className="text-[8px] text-blue-600 dark:text-blue-400 font-semibold">
                      {org.type === 'ACADEMY' ? 'Staff' : (newMembersThisWeek > 0 ? `+${newMembersThisWeek} new` : 'Roster')}
                    </span>
                  </div>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Management Tools & Modules (Mobile) */}
        <div className="px-6 max-w-7xl mx-auto mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <h2 className="text-xs font-black uppercase tracking-wider text-foreground">
                Management Tools &amp; Modules
              </h2>
            </div>
            <span className="text-[10px] font-bold text-foreground/50">
              {quickActions.length} Tools
            </span>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-2 hide-scrollbar -mx-6 px-6">
            {quickActions.map((action) => (
              <Link key={action.id} href={action.id} className="flex flex-col items-center gap-1.5 shrink-0 group">
                <div
                  className="w-[72px] h-[72px] rounded-[20px] flex flex-col items-center justify-center transition-all shadow-md cursor-pointer hover:scale-105 active:scale-95 border"
                  style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                >
                  <Athlon3DIcon type={getOrg3DIconType(action.label)} size={40} active={true} />
                </div>
                <span
                  className="text-[10px] font-bold text-center transition-colors group-hover:text-primary max-w-[76px] truncate"
                  style={{ color: 'var(--athlon-text-secondary)' }}
                >
                  {action.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* ACADEMY SPECIFIC MOBILE SECTIONS */}
        {org.type === 'ACADEMY' && (
          <>
            {/* 1. Today's Scheduled Coaching Sessions (Mobile) */}
            <div className="px-6 max-w-7xl mx-auto mt-6">
              <div className="flex items-center justify-between mb-3.5 pl-1 pr-1">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <h2 className="text-[10px] font-black text-foreground/70 uppercase tracking-widest">
                    Today's Scheduled Coaching Sessions
                  </h2>
                </div>
                <span className="text-[10px] font-bold text-primary tracking-wider">
                  {loadingMetrics ? 'Loading...' : `${academyDashboard?.upcomingBatches?.length ?? 0} ${(academyDashboard?.upcomingBatches?.length ?? 0) === 1 ? 'Batch' : 'Batches'}`}
                </span>
              </div>

              {loadingMetrics ? (
                <div className="flex items-stretch gap-4 overflow-x-auto pb-4 pt-1 snap-x scroll-px-6 hide-scrollbar -mx-6 px-6">
                  {[1, 2].map((i) => (
                    <div key={i} className="snap-start shrink-0 w-[calc(100vw-3rem)] sm:w-[320px] h-[180px] rounded-[22px] border bg-surface/50 animate-pulse" style={{ borderColor: 'var(--athlon-border)' }} />
                  ))}
                </div>
              ) : (academyDashboard?.upcomingBatches && academyDashboard.upcomingBatches.length > 0) ? (
                <div className="flex items-stretch gap-4 overflow-x-auto pb-4 pt-1 snap-x scroll-px-6 hide-scrollbar -mx-6 px-6">
                  {academyDashboard.upcomingBatches.map((batch) => {
                    const enrolled = Number(batch.enrolledCount || 0);
                    const max = Number(batch.maxCapacity || 1);
                    const capacityPercent = Math.min(100, Math.round((enrolled / max) * 100));

                    return (
                      <div
                        key={batch.batchUuid}
                        className="snap-start shrink-0 w-[calc(100vw-3rem)] sm:w-[320px] md:w-[340px] max-w-[360px]"
                      >
                        <div
                          className="relative rounded-[22px] overflow-hidden shadow-xl border h-full flex flex-col justify-between transition-all duration-300 group hover:border-primary/50"
                          style={{
                            backgroundColor: 'var(--athlon-card)',
                            borderColor: 'var(--athlon-border)',
                          }}
                        >
                          {/* Top Theme Primary Accent Line */}
                          <div className="h-[3px] w-full bg-primary" />

                          <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                            {/* Header Row: Level Badge, Sport & Capacity Tag */}
                            <div className="flex items-center justify-between gap-2 border-b border-foreground/5 pb-2.5">
                              <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 shrink-0">
                                  <Sparkles className="w-2.5 h-2.5 text-primary" />
                                  {batch.level || 'COACHING'}
                                </span>

                                <span className="px-2 py-0.5 rounded-full text-[8.5px] font-bold uppercase tracking-wider bg-surface border border-foreground/10 text-foreground/70 shrink-0">
                                  {batch.sportType || 'Badminton'}
                                </span>
                              </div>

                              {/* Slot Tag */}
                              <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-black tracking-tight text-primary bg-primary/10 border border-primary/25 shrink-0">
                                {enrolled} / {max} Enrolled
                              </span>
                            </div>

                            {/* Batch Name & Time */}
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-primary/20 transition-all">
                                <Calendar className="w-4 h-4 text-primary" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3
                                  className="text-xs sm:text-sm font-black text-foreground group-hover:text-primary transition-colors tracking-tight line-clamp-1 leading-snug"
                                  title={batch.batchName}
                                >
                                  {batch.batchName}
                                </h3>
                                <div className="flex items-center gap-1 text-[10px] font-bold text-foreground/50 truncate mt-0.5">
                                  <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                                  <span className="truncate">
                                    {batch.startTime?.substring(0, 5)} - {batch.endTime?.substring(0, 5)} {batch.daysOfWeek ? `(${batch.daysOfWeek})` : ''}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Bento Detail Bar: Coach, Court & Fill Progress */}
                            <div
                              className="rounded-xl p-2.5 border space-y-2.5 text-[11px]"
                              style={{
                                backgroundColor: 'var(--athlon-surface)',
                                borderColor: 'var(--athlon-border)',
                              }}
                            >
                              <div className="grid grid-cols-2 gap-2">
                                {/* Coach Info */}
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className="w-6 h-6 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-[9px] shrink-0">
                                    {(batch.coachName || 'C').charAt(0)}
                                  </div>
                                  <div className="min-w-0">
                                    <span className="text-[8.5px] uppercase font-bold text-foreground/40 block leading-none">Coach</span>
                                    <span className="text-[11px] font-black text-primary truncate block mt-0.5">
                                      {batch.coachName || 'Unassigned'}
                                    </span>
                                  </div>
                                </div>

                                {/* Court Location */}
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                  <div className="min-w-0">
                                    <span className="text-[8.5px] uppercase font-bold text-foreground/40 block leading-none">Court</span>
                                    <span className="text-[10.5px] font-bold text-foreground/80 truncate block mt-0.5">
                                      {batch.courtName?.split('(')[0]?.trim() || 'Court 1'}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Batch Capacity Bar */}
                              <div className="space-y-1 pt-1 border-t border-foreground/5">
                                <div className="flex items-center justify-between text-[9px] font-bold text-foreground/50">
                                  <span>Batch Capacity</span>
                                  <span className="font-mono text-primary">{capacityPercent}% full</span>
                                </div>
                                <div className="h-1.5 w-full rounded-full bg-foreground/10 overflow-hidden">
                                  <div
                                    className="h-full bg-primary rounded-full transition-all duration-500"
                                    style={{ width: `${capacityPercent}%` }}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Footer Action Buttons */}
                            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-foreground/5">
                              <Link
                                href={`/org/${org.id}/attendance`}
                                className="py-2.5 rounded-xl bg-primary text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-primary/20 active:scale-95 transition-all text-center"
                              >
                                <ClipboardList className="w-3.5 h-3.5" />
                                <span>Roll Call</span>
                              </Link>

                              <Link
                                href={`/org/${org.id}/batches`}
                                className="py-2.5 rounded-xl bg-surface border text-foreground/80 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1 hover:bg-white/5 active:scale-95 transition-all text-center"
                                style={{ borderColor: 'var(--athlon-border)' }}
                              >
                                <span>Batch Info</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div
                  className="rounded-[22px] border p-6 text-center space-y-2"
                  style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                >
                  <Calendar className="w-8 h-8 text-foreground/30 mx-auto" />
                  <p className="text-xs font-bold text-foreground/70">No coaching batches scheduled today</p>
                  <Link href={`/org/${org.id}/batches`} className="text-[11px] font-bold text-primary hover:underline inline-block">
                    Create / Manage Batches &rarr;
                  </Link>
                </div>
              )}
            </div>

            {/* 2. Academy Campuses & Training Arenas (Mobile) */}
            <div className="px-6 max-w-7xl mx-auto mt-6">
              <div className="flex items-center justify-between mb-3.5 pl-1 pr-1">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-primary" />
                  <h2 className="text-[10px] font-black text-foreground/70 uppercase tracking-widest">
                    Academy Campuses &amp; Training Arenas
                  </h2>
                </div>
                <Link
                  href={`/org/${org.id}/centres`}
                  className="text-[10px] font-bold text-primary hover:underline uppercase tracking-wider flex items-center gap-0.5"
                >
                  <span>Explore</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {loadingMetrics ? (
                <div className="flex items-stretch gap-4 overflow-x-auto pb-4 pt-1 snap-x scroll-px-6 hide-scrollbar -mx-6 px-6">
                  {[1, 2].map((i) => (
                    <div key={i} className="snap-start shrink-0 w-[calc(100vw-3rem)] sm:w-[320px] h-[180px] rounded-[22px] border bg-surface/50 animate-pulse" style={{ borderColor: 'var(--athlon-border)' }} />
                  ))}
                </div>
              ) : (academyDashboard?.centres && academyDashboard.centres.length > 0) ? (
                <div className="flex items-stretch gap-4 overflow-x-auto pb-4 pt-1 snap-x scroll-px-6 hide-scrollbar -mx-6 px-6">
                  {academyDashboard.centres.map((centre) => (
                    <div
                      key={centre.centreUuid}
                      className="snap-start shrink-0 w-[calc(100vw-3rem)] sm:w-[320px] md:w-[340px] max-w-[360px]"
                    >
                      <div
                        className="relative rounded-[22px] overflow-hidden shadow-xl border h-full flex flex-col justify-between transition-all duration-300 group hover:border-primary/50"
                        style={{
                          backgroundColor: 'var(--athlon-card)',
                          borderColor: 'var(--athlon-border)',
                        }}
                      >
                        {/* Top Theme Primary Accent Line */}
                        <div className="h-[3px] w-full bg-primary" />

                        <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                          {/* Header Row */}
                          <div className="flex items-center justify-between gap-2 border-b border-foreground/5 pb-2.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 shrink-0">
                              <Building className="w-2.5 h-2.5 text-primary" />
                              Campus Arena
                            </span>

                            <span className="px-2 py-0.5 rounded-full text-[8.5px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                              {centre.status || 'Active'}
                            </span>
                          </div>

                          {/* Centre Name & Location */}
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-primary/20 transition-all">
                              <Building className="w-4 h-4 text-primary" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="text-xs sm:text-sm font-black text-foreground group-hover:text-primary transition-colors tracking-tight line-clamp-1 leading-snug">
                                {centre.name}
                              </h3>
                              <div className="flex items-center gap-1 text-[10px] font-bold text-foreground/45 truncate mt-0.5">
                                <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                                <span className="truncate">{centre.city || 'Campus'}{centre.operatingHours ? ` • ${centre.operatingHours}` : ''}</span>
                              </div>
                            </div>
                          </div>

                          {/* Bento Metric Strip */}
                          <div
                            className="grid grid-cols-3 gap-2 p-2.5 rounded-xl border text-center"
                            style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                          >
                            <div>
                              <span className="text-[8.5px] uppercase font-bold text-foreground/40 block">Courts</span>
                              <span className="text-xs font-black text-foreground font-mono">{centre.facilitiesCount ?? 0}</span>
                            </div>
                            <div>
                              <span className="text-[8.5px] uppercase font-bold text-foreground/40 block">Batches</span>
                              <span className="text-xs font-black text-foreground font-mono">{centre.activeBatchesCount ?? 0}</span>
                            </div>
                            <div>
                              <span className="text-[8.5px] uppercase font-bold text-foreground/40 block">Students</span>
                              <span className="text-xs font-black text-primary font-mono">{centre.activeStudentsCount ?? 0}</span>
                            </div>
                          </div>

                          {/* Footer */}
                          <div className="flex items-center justify-between pt-1 border-t border-foreground/5">
                            <span className="text-[9.5px] text-foreground/50 truncate max-w-[65%]">
                              Sports: <span className="text-foreground font-bold">{centre.sportsAvailable || 'Badminton'}</span>
                            </span>

                            <Link
                              href={`/org/${org.id}/facilities?centreUuid=${centre.centreUuid}`}
                              className="text-[10px] font-black uppercase tracking-wider text-primary flex items-center gap-0.5 hover:underline shrink-0"
                            >
                              <span>Courts</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  className="rounded-[22px] border p-6 text-center space-y-2"
                  style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                >
                  <Building className="w-8 h-8 text-foreground/30 mx-auto" />
                  <p className="text-xs font-bold text-foreground/70">No campus locations registered</p>
                  <Link href={`/org/${org.id}/centres`} className="text-[11px] font-bold text-primary hover:underline inline-block">
                    Add Campus Centre &rarr;
                  </Link>
                </div>
              )}
            </div>
          </>
        )}
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
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                      isAdmin
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                        : isCoach
                        ? 'bg-purple-500/15 text-purple-400 border border-purple-500/25'
                        : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                    }`}>
                      {isAdmin ? '👑 Admin' : isCoach ? '🧢 Coach' : '👤 Member'}
                    </span>
                  </div>
                  <p className="text-xs text-foreground/50">
                    {isAdmin
                      ? 'Central management operations console, event coordination, and financial ledger'
                      : 'Club portal • View member roster, matches, attendance history, and equipment catalog'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                {isAdmin && (
                  <Link
                    href={`/org/${org.id}/tournaments/create`}
                    className="flex items-center gap-2 bg-primary text-black text-xs font-black px-5 py-2.5 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg"
                    style={{ boxShadow: '0 4px 20px var(--athlon-primary-glow)' }}
                  >
                    <Trophy className="w-4 h-4" />
                    <span>Create Tournament</span>
                  </Link>
                )}

                <Link
                  href={`/org/${org.id}/settings`}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-black uppercase tracking-wider text-foreground/70 hover:text-foreground hover:bg-white/5 transition-all"
                  style={{ borderColor: 'var(--athlon-border)' }}
                >
                  <Settings className="w-4 h-4 text-primary" />
                  <span>{isAdmin ? 'Org Settings' : 'Club Info'}</span>
                </Link>
              </div>
            </div>

            {/* 4 Workspace Telemetry Highlight Cards */}
            {org.type === 'ACADEMY' ? (
              <div className="grid grid-cols-4 gap-4">
                <Link
                  href={`/org/${org.id}/students`}
                  className="p-5 rounded-[24px] border space-y-2 relative overflow-hidden shadow-sm hover:border-blue-500/40 transition-all group block"
                  style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                >
                  <div className="flex items-center justify-between text-foreground/50">
                    <span className="text-[10px] font-black uppercase tracking-wider">Active Students</span>
                    <GraduationCap className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                  </div>
                  {loadingMetrics ? (
                    <div className="h-8 w-24 bg-foreground/10 rounded animate-pulse my-1" />
                  ) : (
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-foreground font-mono">
                        {academyDashboard?.activeStudents ?? 0}
                      </span>
                      <span className="text-xs font-bold text-blue-400 font-mono">
                        {academyDashboard?.activeBatches ?? 0} Batches
                      </span>
                    </div>
                  )}
                  <span className="text-[11px] text-foreground/45 block">Grassroots to Elite Training Roster</span>
                </Link>

                <Link
                  href={`/org/${org.id}/attendance`}
                  className="p-5 rounded-[24px] border space-y-2 relative overflow-hidden shadow-sm hover:border-emerald-500/40 transition-all group block"
                  style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                >
                  <div className="flex items-center justify-between text-foreground/50">
                    <span className="text-[10px] font-black uppercase tracking-wider">Today's Attendance</span>
                    <ClipboardList className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                  </div>
                  {loadingMetrics ? (
                    <div className="h-8 w-24 bg-foreground/10 rounded animate-pulse my-1" />
                  ) : (
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-emerald-400 font-mono">
                        {academyDashboard?.todaysAttendancePercentage != null ? `${academyDashboard.todaysAttendancePercentage}%` : '0%'}
                      </span>
                      <span className="text-xs font-bold text-emerald-500 font-mono">
                        {academyDashboard?.todaysSessionsCount ?? 0} Slots
                      </span>
                    </div>
                  )}
                  <span className="text-[11px] text-foreground/45 block">Live QR &amp; Coach Digital Roll Call</span>
                </Link>

                <Link
                  href={`/org/${org.id}/finances`}
                  className="p-5 rounded-[24px] border space-y-2 relative overflow-hidden shadow-sm hover:border-primary/40 transition-all group block"
                  style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                >
                  <div className="flex items-center justify-between text-foreground/50">
                    <span className="text-[10px] font-black uppercase tracking-wider">Coaching Fees</span>
                    <CreditCard className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                  </div>
                  {loadingMetrics ? (
                    <div className="h-8 w-28 bg-foreground/10 rounded animate-pulse my-1" />
                  ) : (
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-foreground font-mono">
                        ₹{Number(academyDashboard?.feesCollected || financeSummary?.totalIncome || 0).toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs font-bold text-rose-400 font-mono">
                        ₹{Number(academyDashboard?.pendingFees || 0).toLocaleString('en-IN')} Due
                      </span>
                    </div>
                  )}
                  <span className="text-[11px] text-foreground/45 block">Monthly coaching billing cycle</span>
                </Link>

                <Link
                  href={`/org/${org.id}/centres`}
                  className="p-5 rounded-[24px] border space-y-2 relative overflow-hidden shadow-sm hover:border-purple-500/40 transition-all group block"
                  style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                >
                  <div className="flex items-center justify-between text-foreground/50">
                    <span className="text-[10px] font-black uppercase tracking-wider">Campuses &amp; Courts</span>
                    <Building className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                  </div>
                  {loadingMetrics ? (
                    <div className="h-8 w-24 bg-foreground/10 rounded animate-pulse my-1" />
                  ) : (
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-foreground font-mono">
                        {academyDashboard?.totalCentres ?? 0} Campuses
                      </span>
                      <span className="text-xs font-bold text-purple-400 font-mono">
                        {academyDashboard?.totalFacilities ?? 0} Courts
                      </span>
                    </div>
                  )}
                  <span className="text-[11px] text-foreground/45 block">
                    {academyDashboard?.facilityUtilizationPercentage != null ? `${academyDashboard.facilityUtilizationPercentage}%` : '0%'} Arena Utilization Rate
                  </span>
                </Link>
              </div>
            ) : (
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
                  {loadingMetrics ? (
                    <div className="h-8 w-24 bg-foreground/10 rounded animate-pulse my-1" />
                  ) : (
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
                  )}
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
                  {loadingMetrics ? (
                    <div className="h-8 w-16 bg-foreground/10 rounded animate-pulse my-1" />
                  ) : (
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-foreground font-mono">{members.length}</span>
                      <span className="text-xs font-bold text-blue-400 font-mono">
                        {newMembersThisWeek > 0 ? `+${newMembersThisWeek} this week` : 'Active Roster'}
                      </span>
                    </div>
                  )}
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
                  {loadingMetrics ? (
                    <div className="h-8 w-20 bg-foreground/10 rounded animate-pulse my-1" />
                  ) : (
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-yellow-400 font-mono">{tournaments.length} Events</span>
                      <span className="text-xs font-bold text-yellow-500 font-mono">
                        {tournaments.filter(t => (t as any).status === 'LIVE' || (t as any).status === 'IN_PROGRESS').length > 0
                          ? `${tournaments.filter(t => (t as any).status === 'LIVE' || (t as any).status === 'IN_PROGRESS').length} Live`
                          : 'Scheduled'}
                      </span>
                    </div>
                  )}
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
                  {loadingMetrics ? (
                    <div className="h-8 w-20 bg-foreground/10 rounded animate-pulse my-1" />
                  ) : (
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-primary font-mono">
                        {inventorySummary?.totalQuantity || 0} Units
                      </span>
                      <span className="text-xs font-bold text-emerald-400 font-mono">
                        {inventorySummary?.inStockCount || 0} In Stock
                      </span>
                    </div>
                  )}
                  <span className="text-[11px] text-foreground/45 block">
                    {inventorySummary?.lowStockCount ? `${inventorySummary.lowStockCount} low stock alerts` : 'Shuttles & equipment ready'}
                  </span>
                </Link>
              </div>
            )}
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

          {/* 2. ACADEMY-SPECIFIC TRACKS OR TOURNAMENT TRACKS */}
          {org.type === 'ACADEMY' ? (
            <>
              {/* Today's Training Sessions Track */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-5 h-5 text-primary" />
                    <div>
                      <h2 className="text-lg font-black text-foreground">Today's Scheduled Coaching Sessions</h2>
                      <p className="text-xs text-foreground/50">
                        {loadingMetrics ? 'Loading sessions...' : `${academyDashboard?.upcomingBatches?.length ?? 0} ${(academyDashboard?.upcomingBatches?.length ?? 0) === 1 ? 'Batch' : 'Batches'} active today • Real-time student check-in`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => scrollTrack(sessionsTrackRef, 'left')}
                      className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                      style={{ borderColor: 'var(--athlon-border)' }}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => scrollTrack(sessionsTrackRef, 'right')}
                      className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                      style={{ borderColor: 'var(--athlon-border)' }}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {loadingMetrics ? (
                  <div className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 snap-x scroll-px-8 hide-scrollbar -mx-8 px-8">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="snap-start shrink-0 w-[360px] h-[260px] rounded-[28px] border bg-card/50 animate-pulse" style={{ borderColor: 'var(--athlon-border)' }} />
                    ))}
                  </div>
                ) : (academyDashboard?.upcomingBatches && academyDashboard.upcomingBatches.length > 0) ? (
                  <div
                    ref={sessionsTrackRef}
                    className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 snap-x scroll-px-8 hide-scrollbar -mx-8 px-8"
                  >
                    {academyDashboard.upcomingBatches.map((batch) => (
                      <div key={batch.batchUuid} className="snap-start shrink-0 w-[360px]">
                        <div
                          className="p-6 rounded-[28px] border bg-card relative overflow-hidden h-full flex flex-col justify-between shadow-xl space-y-4 hover:border-primary/40 transition-all group"
                          style={{
                            backgroundColor: 'var(--athlon-card)',
                            borderColor: 'var(--athlon-border)',
                          }}
                        >
                          <div className="h-1 w-full bg-gradient-to-r from-primary via-emerald-400 to-blue-500 absolute top-0 left-0 right-0" />

                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/15 text-primary border border-primary/30">
                                {batch.level || 'COACHING'}
                              </span>
                              <span className="text-xs text-foreground/50 font-bold">{batch.sportType || 'Badminton'}</span>
                            </div>

                            <div>
                              <h3 className="text-base font-black text-foreground truncate group-hover:text-primary transition-colors">
                                {batch.batchName}
                              </h3>
                              <p className="text-xs text-foreground/50 flex items-center gap-1.5 mt-0.5">
                                <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                                <span>{batch.startTime?.substring(0, 5)} - {batch.endTime?.substring(0, 5)} {batch.daysOfWeek ? `(${batch.daysOfWeek})` : ''}</span>
                              </p>
                            </div>

                            <div
                              className="grid grid-cols-2 gap-2 p-3 rounded-2xl border text-center"
                              style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                            >
                              <div>
                                <span className="text-[9px] uppercase font-bold text-foreground/40 block">Enrolled</span>
                                <span className="text-sm font-black text-foreground font-mono">
                                  {batch.enrolledCount ?? 0} / {batch.maxCapacity ?? 0}
                                </span>
                              </div>
                              <div>
                                <span className="text-[9px] uppercase font-bold text-foreground/40 block">Coach</span>
                                <span className="text-sm font-black text-primary truncate block">
                                  {batch.coachName || 'Unassigned'}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 text-xs text-foreground/50">
                              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <span className="truncate">{batch.courtName || 'Court'}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-2 border-t" style={{ borderColor: 'var(--athlon-border)' }}>
                            <Link
                              href={`/org/${org.id}/attendance`}
                              className="py-2.5 rounded-xl bg-primary text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-primary/20 hover:scale-105 active:scale-95 transition-all text-center"
                            >
                              <ClipboardList className="w-3.5 h-3.5" />
                              <span>Roll Call</span>
                            </Link>

                            <Link
                              href={`/org/${org.id}/batches`}
                              className="py-2.5 rounded-xl bg-surface border text-foreground/80 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1 hover:bg-white/5 transition-all text-center"
                              style={{ borderColor: 'var(--athlon-border)' }}
                            >
                              <span>Batch Info</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    className="p-8 rounded-[28px] border text-center space-y-2 max-w-xl"
                    style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                  >
                    <Calendar className="w-8 h-8 text-foreground/30 mx-auto" />
                    <h3 className="text-sm font-bold text-foreground/80">No coaching sessions scheduled today</h3>
                    <p className="text-xs text-foreground/50">Configure your batch roster, timings, and court allocations.</p>
                    <Link href={`/org/${org.id}/batches`} className="text-xs font-bold text-primary hover:underline inline-block pt-1">
                      Manage Batches &rarr;
                    </Link>
                  </div>
                )}
              </section>

              {/* Campus Centres & Arenas Track */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Building className="w-5 h-5 text-purple-400" />
                    <div>
                      <h2 className="text-lg font-black text-foreground">Academy Campuses &amp; Training Arenas</h2>
                      <p className="text-xs text-foreground/50">
                        {loadingMetrics ? 'Loading campuses...' : `${academyDashboard?.centres?.length ?? 0} Campus ${(academyDashboard?.centres?.length ?? 0) === 1 ? 'location' : 'locations'} • Multi-court sports infrastructure`}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/org/${org.id}/centres`}
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                  >
                    <span>Manage Campuses</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {loadingMetrics ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {[1, 2].map((i) => (
                      <div key={i} className="p-6 rounded-[28px] border bg-card/50 h-[220px] animate-pulse" style={{ borderColor: 'var(--athlon-border)' }} />
                    ))}
                  </div>
                ) : (academyDashboard?.centres && academyDashboard.centres.length > 0) ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {academyDashboard.centres.map((centre) => (
                      <div
                        key={centre.centreUuid}
                        className="p-6 rounded-[28px] border bg-card space-y-4 shadow-xl hover:border-purple-500/40 transition-all group"
                        style={{
                          backgroundColor: 'var(--athlon-card)',
                          borderColor: 'var(--athlon-border)',
                        }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-surface border border-white/10 flex items-center justify-center text-primary shrink-0 shadow-md">
                              <Building className="w-6 h-6" />
                            </div>
                            <div>
                              <h3 className="text-base font-extrabold text-foreground group-hover:text-purple-400 transition-colors">
                                {centre.name}
                              </h3>
                              <p className="text-xs text-foreground/50 flex items-center gap-1 mt-1">
                                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                <span>{centre.city || 'Campus'}{centre.operatingHours ? ` • ${centre.operatingHours}` : ''}</span>
                              </p>
                            </div>
                          </div>

                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30">
                            {centre.status || 'ACTIVE'}
                          </span>
                        </div>

                        <div
                          className="grid grid-cols-3 gap-2 p-3 rounded-2xl border text-center"
                          style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                        >
                          <div>
                            <span className="text-[9px] uppercase font-bold text-foreground/40 block">Courts / Units</span>
                            <span className="text-sm font-black text-foreground font-mono">{centre.facilitiesCount ?? 0}</span>
                          </div>
                          <div>
                            <span className="text-[9px] uppercase font-bold text-foreground/40 block">Active Batches</span>
                            <span className="text-sm font-black text-foreground font-mono">{centre.activeBatchesCount ?? 0}</span>
                          </div>
                          <div>
                            <span className="text-[9px] uppercase font-bold text-foreground/40 block">Students</span>
                            <span className="text-sm font-black text-primary font-mono">{centre.activeStudentsCount ?? 0}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-2 border-t" style={{ borderColor: 'var(--athlon-border)' }}>
                          <span className="text-xs text-foreground/50 truncate">
                            Sports: <span className="text-foreground font-semibold">{centre.sportsAvailable || 'Badminton'}</span>
                          </span>

                          <Link
                            href={`/org/${org.id}/facilities?centreUuid=${centre.centreUuid}`}
                            className="text-xs font-bold text-primary hover:underline shrink-0 flex items-center gap-1"
                          >
                            <span>Courts</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    className="p-8 rounded-[28px] border text-center space-y-2 max-w-xl"
                    style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                  >
                    <Building className="w-8 h-8 text-foreground/30 mx-auto" />
                    <h3 className="text-sm font-bold text-foreground/80">No campus locations registered</h3>
                    <p className="text-xs text-foreground/50">Add sports campuses, training arenas, and courts.</p>
                    <Link href={`/org/${org.id}/centres`} className="text-xs font-bold text-primary hover:underline inline-block pt-1">
                      Add Campus Centre &rarr;
                    </Link>
                  </div>
                )}
              </section>
            </>
          ) : (
            <>
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
            </>
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
