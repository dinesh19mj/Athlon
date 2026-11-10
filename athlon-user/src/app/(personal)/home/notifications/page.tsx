'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bell,
  CalendarClock,
  Trophy,
  CheckCircle2,
  ChevronRight,
  Info,
  Radio,
  Zap,
  Shield,
  Clock,
  CheckCheck,
  AlertTriangle,
  ArrowLeft,
  Search,
  X,
  ExternalLink,
  RefreshCw,
  Flame,
  Check,
  Compass,
  MapPin,
  Tag,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { MatchService, Match } from '@/lib/api/matches';
import { RegistrationService, Registration } from '@/lib/api/tournaments';
import { TournamentAnnouncementService, TournamentAnnouncement } from '@/lib/api/tournamentAnnouncement';
import { AuthService } from '@/lib/api/auth';

export interface NotificationItem {
  id: string;
  type: 'match_update' | 'registration' | 'result' | 'system' | 'umpire';
  category: 'Match Updates' | 'Registrations' | 'Results' | 'System';
  title: string;
  message: string;
  time: string;
  timestamp: number;
  urgent: boolean;
  actionUrl?: string;
  actionLabel?: string;
  court?: string;
  tournamentName?: string;
}

function formatRelativeTime(dateString?: string): string {
  if (!dateString) return 'Recent';
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    if (isNaN(diffMs)) return dateString;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  } catch {
    return 'Recent';
  }
}

function getCategoryMeta(category: string, urgent: boolean) {
  if (urgent) {
    return {
      icon: AlertTriangle,
      color: 'text-amber-400',
      bgColor: 'bg-amber-400/10',
      borderColor: 'border-amber-500/30',
      badgeBg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      accentLine: 'bg-amber-500',
    };
  }
  switch (category) {
    case 'Match Updates':
      return {
        icon: CalendarClock,
        color: 'text-sky-400',
        bgColor: 'bg-sky-400/10',
        borderColor: 'border-sky-500/30',
        badgeBg: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
        accentLine: 'bg-sky-500',
      };
    case 'Registrations':
      return {
        icon: CheckCircle2,
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-400/10',
        borderColor: 'border-emerald-500/30',
        badgeBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        accentLine: 'bg-emerald-500',
      };
    case 'Results':
      return {
        icon: Trophy,
        color: 'text-amber-400',
        bgColor: 'bg-amber-400/10',
        borderColor: 'border-amber-500/30',
        badgeBg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
        accentLine: 'bg-amber-500',
      };
    case 'System':
    default:
      return {
        icon: Info,
        color: 'text-blue-400',
        bgColor: 'bg-blue-400/10',
        borderColor: 'border-blue-500/30',
        badgeBg: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
        accentLine: 'bg-blue-500',
      };
  }
}

export default function NotificationsPage() {
  const router = useRouter();
  const { userId, userUuid, token } = useAuthStore();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Persisted Read Notification IDs in localStorage
  const [readIds, setReadIds] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('athlon_read_notifications');
        if (stored) {
          setReadIds(JSON.parse(stored));
        }
      } catch {
        // ignore storage parse error
      }
    }
  }, []);

  const isRead = (id: string) => readIds.includes(id);

  const markAllAsRead = () => {
    const allIds = notifications.map((n) => n.id);
    const updated = Array.from(new Set([...readIds, ...allIds]));
    setReadIds(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('athlon_read_notifications', JSON.stringify(updated));
    }
  };

  const markAsRead = (id: string) => {
    const updated = Array.from(new Set([...readIds, id]));
    setReadIds(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('athlon_read_notifications', JSON.stringify(updated));
    }
  };

  // Fetch real notifications from backend services
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const items: NotificationItem[] = [];

      // 1. Matches for current user
      if (userId) {
        try {
          const matchesRes = await MatchService.getByUser(Number(userId));
          const userMatches: Match[] = Array.isArray(matchesRes)
            ? matchesRes
            : (matchesRes as any)?.data || [];

          userMatches.forEach((m) => {
            const status = (m.status || '').toUpperCase();
            const tName = m.tournamentName || 'Tournament';
            const courtStr = m.courtName || (m.courtId ? `Court ${m.courtId}` : undefined);

            if (status === 'IN_PROGRESS' || status === 'LIVE') {
              items.push({
                id: `match-live-${m.uuid || m.id}`,
                type: 'match_update',
                category: 'Match Updates',
                title: 'Match In Progress (LIVE)',
                message: `${tName}: ${m.teamAName || 'Team A'} vs ${m.teamBName || 'Team B'}${
                  courtStr ? ` on ${courtStr}` : ''
                }. Match is currently live on court.`,
                time: 'Live Now',
                timestamp: Date.now(),
                urgent: true,
                actionUrl: `/home/matches`,
                actionLabel: 'View Live Match',
                court: courtStr,
                tournamentName: tName,
              });
            } else if (
              status === 'WAITING_FOR_LINEUPS' ||
              m.teamALineupStatus === 'PENDING' ||
              m.teamBLineupStatus === 'PENDING'
            ) {
              items.push({
                id: `match-lineup-${m.uuid || m.id}`,
                type: 'match_update',
                category: 'Match Updates',
                title: 'Action Required: Submit Lineup',
                message: `Lineup submission is required for ${m.roundName || 'upcoming fixture'} in ${tName}.`,
                time: 'Action Required',
                timestamp: Date.now() - 1000 * 60 * 15,
                urgent: true,
                actionUrl: `/home/matches`,
                actionLabel: 'Submit Lineup',
                court: courtStr,
                tournamentName: tName,
              });
            } else if (status === 'COMPLETED') {
              items.push({
                id: `match-done-${m.uuid || m.id}`,
                type: 'result',
                category: 'Results',
                title: `Match Completed: ${m.roundName || 'Result'}`,
                message: `${tName} • ${m.teamAName || 'Team A'} vs ${m.teamBName || 'Team B'}. Final scores are verified.`,
                time: m.matchDate ? formatRelativeTime(m.matchDate) : 'Completed',
                timestamp: m.matchDate ? new Date(m.matchDate).getTime() : Date.now() - 1000 * 60 * 60 * 24,
                urgent: false,
                actionUrl: `/home/matches`,
                actionLabel: 'Review Scorecard',
                court: courtStr,
                tournamentName: tName,
              });
            } else if (status === 'SCHEDULED') {
              items.push({
                id: `match-sched-${m.uuid || m.id}`,
                type: 'match_update',
                category: 'Match Updates',
                title: `Scheduled Fixture: ${m.roundName || 'Upcoming Match'}`,
                message: `${tName} • ${m.teamAName || 'Team A'} vs ${m.teamBName || 'Team B'}${
                  courtStr ? ` on ${courtStr}` : ''
                } at ${m.scheduledTime || 'TBD'}.`,
                time: m.scheduledTime || (m.matchDate ? formatRelativeTime(m.matchDate) : 'Upcoming'),
                timestamp: m.matchDate ? new Date(m.matchDate).getTime() : Date.now() - 1000 * 60 * 60 * 5,
                urgent: false,
                actionUrl: `/home/matches`,
                actionLabel: 'Match Pass',
                court: courtStr,
                tournamentName: tName,
              });
            }
          });
        } catch (err) {
          console.warn('Could not fetch user matches for notifications', err);
        }
      }

      // 2. Official Umpiring Assignments
      if (userUuid && token) {
        try {
          const profileRes = await AuthService.getUserProfile(userUuid, token).catch(() => null);
          const phone = profileRes?.data?.phone;
          if (phone) {
            const umpRes = await MatchService.getByUmpirePhone(phone).catch(() => null);
            const umpMatches: Match[] = Array.isArray(umpRes)
              ? umpRes
              : (umpRes as any)?.data || [];

            umpMatches.forEach((m) => {
              const isLive = m.status === 'IN_PROGRESS' || m.status === 'LIVE';
              items.push({
                id: `umpire-${m.uuid || m.id}`,
                type: 'match_update',
                category: 'Match Updates',
                title: isLive ? `Referee Call: Court ${m.courtName || '1'} (LIVE)` : `Official Umpire Assignment`,
                message: `You are assigned as official referee for ${m.tournamentName || 'Tournament'}: ${
                  m.teamAName || 'Team A'
                } vs ${m.teamBName || 'Team B'}.`,
                time: isLive ? 'Live Now' : m.scheduledTime || 'Assigned',
                timestamp: Date.now() - 1000 * 60 * 30,
                urgent: true,
                actionUrl: `/scoring?matchUuid=${m.uuid}`,
                actionLabel: 'Launch Scoring Console',
                court: m.courtName || (m.courtId ? `Court ${m.courtId}` : undefined),
                tournamentName: m.tournamentName,
              });
            });
          }
        } catch (err) {
          console.warn('Could not fetch umpire duties for notifications', err);
        }
      }

      // 3. User Tournament Registrations
      if (userId) {
        try {
          const regRes = await RegistrationService.getByUser(String(userId));
          const userRegistrations: Registration[] = Array.isArray(regRes)
            ? regRes
            : (regRes as any)?.data || [];

          userRegistrations.forEach((reg) => {
            const regId = reg.registrationUuid || reg.uuid || reg.registrationId || `reg-${Math.random()}`;
            const tName = (reg as any).tournamentName || reg.teamName || 'Tournament';

            if (reg.paymentStatus === 'PENDING') {
              items.push({
                id: `reg-pay-${regId}`,
                type: 'registration',
                category: 'Registrations',
                title: `Payment Due: ${tName}`,
                message: `Payment is pending for ${
                  reg.category ? `${reg.category} in ` : ''
                }"${tName}". Complete entry fee payment to secure your seed.`,
                time: 'Payment Due',
                timestamp: Date.now() - 1000 * 60 * 120,
                urgent: true,
                actionUrl: '/home/registered',
                actionLabel: 'Pay Entry Fee',
                tournamentName: tName,
              });
            } else if (reg.status === 'APPROVED') {
              items.push({
                id: `reg-appr-${regId}`,
                type: 'registration',
                category: 'Registrations',
                title: `Registration Confirmed: ${tName}`,
                message: `Your registration for "${tName}" (${
                  reg.category || 'Division'
                }) has been approved and confirmed.`,
                time: 'Confirmed',
                timestamp: Date.now() - 1000 * 60 * 60 * 12,
                urgent: false,
                actionUrl: '/home/registered',
                actionLabel: 'View Match Day Pass',
                tournamentName: tName,
              });
            } else if (reg.status === 'PENDING') {
              items.push({
                id: `reg-sub-${regId}`,
                type: 'registration',
                category: 'Registrations',
                title: `Registration Submitted: ${tName}`,
                message: `Your entry for "${tName}" has been submitted to tournament organizers and is currently under review.`,
                time: 'Under Review',
                timestamp: Date.now() - 1000 * 60 * 60 * 24,
                urgent: false,
                actionUrl: '/home/registered',
                actionLabel: 'Check Entry Status',
                tournamentName: tName,
              });
            }
          });
        } catch (err) {
          console.warn('Could not fetch registrations for notifications', err);
        }
      }

      // 4. Tournament Bulletins & Announcements
      try {
        const annRes = await TournamentAnnouncementService.getAll();
        const announcements: TournamentAnnouncement[] = Array.isArray(annRes)
          ? annRes
          : (annRes as any)?.data || [];

        announcements.slice(0, 5).forEach((a) => {
          const aId = a.uuid || a.id;
          const msg = a.content
            ? a.content.length > 180
              ? `${a.content.slice(0, 180)}...`
              : a.content
            : 'Official bulletin issued by tournament administration.';

          items.push({
            id: `ann-${aId}`,
            type: 'system',
            category: 'System',
            title: a.title || 'Official Tournament Bulletin',
            message: msg,
            time: a.createdAt ? formatRelativeTime(a.createdAt) : 'Recent',
            timestamp: a.createdAt ? new Date(a.createdAt).getTime() : Date.now() - 1000 * 60 * 60 * 48,
            urgent: false,
            actionUrl: a.tournamentUuid ? `/home/tournaments/${a.tournamentUuid}` : '/tournaments',
            actionLabel: 'Read Bulletin',
            tournamentName: a.title,
          });
        });
      } catch (err) {
        console.warn('Could not fetch announcements for notifications', err);
      }

      // Sort items: urgent first, then by timestamp descending
      items.sort((a, b) => {
        if (a.urgent && !b.urgent) return -1;
        if (!a.urgent && b.urgent) return 1;
        return b.timestamp - a.timestamp;
      });

      setNotifications(items);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [userId, userUuid, token]);

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const categories = ['All', 'Match Updates', 'Registrations', 'Results', 'System'];

  // Filtered dispatches based on tab and search query
  const filteredNotifications = useMemo(() => {
    return notifications.filter((notif) => {
      // 1. Tab category filter
      if (selectedFilter !== 'All' && notif.category !== selectedFilter) {
        return false;
      }
      // 2. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = notif.title.toLowerCase().includes(q);
        const matchesMsg = notif.message.toLowerCase().includes(q);
        const matchesTourn = notif.tournamentName?.toLowerCase().includes(q);
        const matchesCourt = notif.court?.toLowerCase().includes(q);
        return matchesTitle || matchesMsg || matchesTourn || matchesCourt;
      }
      return true;
    });
  }, [notifications, selectedFilter, searchQuery]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !isRead(n.id)).length;
  }, [notifications, readIds]);

  const urgentCount = useMemo(() => {
    return notifications.filter((n) => n.urgent && !isRead(n.id)).length;
  }, [notifications, readIds]);

  const matchUpdateCount = useMemo(() => {
    return notifications.filter((n) => n.category === 'Match Updates').length;
  }, [notifications]);

  const regCount = useMemo(() => {
    return notifications.filter((n) => n.category === 'Registrations').length;
  }, [notifications]);

  const sysCount = useMemo(() => {
    return notifications.filter((n) => n.category === 'System' || n.category === 'Results').length;
  }, [notifications]);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-black">
      {/* ══════════════════════════════════════════════════════════════════════
          1. MOBILE VIEW ONLY (< md) - CLEAN, REFINED & DYNAMIC
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="block md:hidden pb-24">
        {/* Header */}
        <header className="px-4 py-3 border-b border-foreground/10 bg-surface/85 backdrop-blur-md sticky top-0 z-20 flex justify-between items-center safe-header">
          <div className="flex items-center gap-2">
            <Link
              href="/home"
              className="w-8 h-8 rounded-lg border border-foreground/10 flex items-center justify-center text-foreground/80 hover:text-foreground active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="space-y-0.5">
              <h1 className="text-base font-black uppercase tracking-wide flex items-center gap-1.5 text-foreground">
                <Bell className="w-4 h-4 text-[#3B82F6]" /> Notifications
              </h1>
              <p className="text-text-muted font-medium text-[10px] leading-tight">
                Live match calls, entries &amp; bulletins
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleManualRefresh}
              disabled={refreshing}
              className="w-7 h-7 rounded-lg border border-foreground/10 flex items-center justify-center text-foreground/60 active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[9.5px] font-black uppercase tracking-wider text-primary shrink-0 bg-primary/10 px-2 py-1 rounded-lg border border-primary/20"
              >
                Mark Read
              </button>
            )}
          </div>
        </header>

        {/* Mobile Filter Tabs */}
        <div className="px-3.5 pt-2.5 flex items-center gap-1.5 overflow-x-auto hide-scrollbar">
          {categories.map((cat) => {
            const count =
              cat === 'All'
                ? notifications.length
                : notifications.filter((n) => n.category === cat).length;
            const active = selectedFilter === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedFilter(cat)}
                className={`px-3 py-1 rounded-full text-[10.5px] font-bold uppercase tracking-wider shrink-0 transition-all border ${
                  active
                    ? 'bg-primary text-black border-primary'
                    : 'bg-surface border-foreground/10 text-foreground/70'
                }`}
              >
                <span>{cat}</span>
                {count > 0 && <span className="ml-1 opacity-70 font-mono">({count})</span>}
              </button>
            );
          })}
        </div>

        {/* Main Content */}
        <main className="p-3.5 max-w-3xl mx-auto space-y-2.5">
          {loading ? (
            <div className="space-y-2.5 py-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-surface border border-foreground/10 rounded-xl p-3 animate-pulse space-y-2"
                >
                  <div className="h-4 w-32 bg-foreground/10 rounded" />
                  <div className="h-3 w-3/4 bg-foreground/10 rounded" />
                </div>
              ))}
            </div>
          ) : filteredNotifications.length > 0 ? (
            filteredNotifications.map((notif) => {
              const meta = getCategoryMeta(notif.category, notif.urgent);
              const read = isRead(notif.id);
              const IconComp = meta.icon;

              return (
                <div
                  key={notif.id}
                  className={`bg-surface border rounded-xl p-3 flex gap-3 transition-colors group relative overflow-hidden ${
                    !read
                      ? 'border-primary/40 shadow-sm bg-surface-elevated'
                      : 'border-border/60 opacity-80 hover:opacity-100'
                  }`}
                >
                  {!read && <div className={`absolute left-0 top-0 bottom-0 w-1 ${meta.accentLine}`} />}

                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${meta.bgColor}`}>
                    <IconComp className={`w-4 h-4 ${meta.color}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap pr-1">
                        <h3
                          className={`text-xs font-black tracking-tight truncate ${
                            !read ? 'text-foreground' : 'text-foreground/80'
                          }`}
                        >
                          {notif.title}
                        </h3>
                        {notif.urgent && !read && (
                          <span className="px-1.5 py-0.2 rounded text-[8.5px] font-black uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30">
                            Urgent
                          </span>
                        )}
                      </div>
                      <span className="text-[9px] font-bold text-text-muted shrink-0 mt-0.5">{notif.time}</span>
                    </div>

                    <p
                      className={`text-[11px] leading-relaxed ${
                        !read ? 'font-medium text-foreground/80' : 'font-normal text-text-muted'
                      }`}
                    >
                      {notif.message}
                    </p>

                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-foreground/5">
                      {notif.actionUrl ? (
                        <Link
                          href={notif.actionUrl}
                          className="text-[10px] font-bold text-primary flex items-center gap-0.5 hover:underline"
                        >
                          <span>{notif.actionLabel || 'View Details'}</span>
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      ) : (
                        <div />
                      )}

                      {!read && (
                        <button
                          onClick={() => markAsRead(notif.id)}
                          className="text-[9.5px] text-foreground/50 hover:text-foreground flex items-center gap-1 font-semibold"
                        >
                          <Check className="w-3 h-3" />
                          <span>Dismiss</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-surface/50 border border-dashed border-border rounded-2xl p-8 text-center flex flex-col items-center justify-center mt-6">
              <Bell className="w-8 h-8 text-text-muted/30 mb-2" />
              <h3 className="text-xs font-black uppercase tracking-wider text-foreground/80 mb-1">
                You're all caught up!
              </h3>
              <p className="text-[10px] text-text-muted max-w-xs">
                There are no new dispatches matching your selected criteria.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          2. DESKTOP VIEW ONLY (hidden on mobile, visible on md and above)
             - CLEAN TELEMETRY HUD + 3-COLUMN DISPATCH GRID (NO STICKY NAVBAR)
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
          {/* Subtle Ambient Glows */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

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

                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/10 border border-primary/25 text-primary">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                    Athlete Dispatch &amp; Alert Center
                  </div>

                  <button
                    onClick={handleManualRefresh}
                    disabled={refreshing}
                    className="w-9 h-9 rounded-xl border flex items-center justify-center transition-all active:scale-95 cursor-pointer hover:bg-white/5"
                    style={{
                      backgroundColor: 'var(--athlon-card)',
                      borderColor: 'var(--athlon-border)',
                    }}
                    title="Sync real-time dispatches"
                  >
                    <RefreshCw
                      className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`}
                      style={{ color: 'var(--athlon-primary)' }}
                    />
                  </button>
                </div>

                <h1 className="text-3xl lg:text-4xl font-black text-foreground tracking-tight uppercase">
                  Notifications &amp; Field Alerts
                </h1>
                <p className="text-sm text-foreground/60 leading-relaxed font-medium">
                  Real-time match schedule adjustments, official umpiring calls, registration approvals, and tournament bulletins.
                </p>
              </div>

              {/* Right: 4 Telemetry HUD Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
                {/* Total Alerts */}
                <div
                  className="p-4 rounded-2xl border flex flex-col justify-between min-w-[130px] shadow-xs"
                  style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-foreground/50">Total</span>
                    <Bell className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-2xl font-black font-mono text-foreground">{notifications.length}</div>
                  <span className="text-[10px] text-foreground/50 font-medium">Active dispatches</span>
                </div>

                {/* Priority / Action Required */}
                <div
                  className="p-4 rounded-2xl border flex flex-col justify-between min-w-[130px] shadow-xs"
                  style={{
                    backgroundColor: 'var(--athlon-card)',
                    borderColor: urgentCount > 0 ? 'rgba(245, 158, 11, 0.4)' : 'var(--athlon-border)',
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">Urgent</span>
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl font-black font-mono text-amber-400">{urgentCount}</div>
                  <span className="text-[10px] text-foreground/50 font-medium">Action needed</span>
                </div>

                {/* Match Updates */}
                <div
                  className="p-4 rounded-2xl border flex flex-col justify-between min-w-[130px] shadow-xs"
                  style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-sky-400">Matches</span>
                    <CalendarClock className="w-4 h-4 text-sky-400" />
                  </div>
                  <div className="text-2xl font-black font-mono text-foreground">{matchUpdateCount}</div>
                  <span className="text-[10px] text-foreground/50 font-medium">Court schedules</span>
                </div>

                {/* Registrations & Bulletins */}
                <div
                  className="p-4 rounded-2xl border flex flex-col justify-between min-w-[130px] shadow-xs"
                  style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">Entries</span>
                    <Shield className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-black font-mono text-foreground">{regCount + sysCount}</div>
                  <span className="text-[10px] text-foreground/50 font-medium">Passes &amp; bulletins</span>
                </div>
              </div>
            </div>

            {/* Interactive Controls Bar: Category Filter Tabs, Search & Mark All Read */}
            <div className="pt-2 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              {/* Category Filter Capsules */}
              <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
                {categories.map((cat) => {
                  const count =
                    cat === 'All'
                      ? notifications.length
                      : notifications.filter((n) => n.category === cat).length;
                  const active = selectedFilter === cat;

                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedFilter(cat)}
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 border ${
                        active
                          ? 'bg-primary text-black border-primary shadow-sm shadow-primary/20 scale-[1.02]'
                          : 'text-foreground/70 hover:text-foreground hover:bg-white/5'
                      }`}
                      style={{
                        backgroundColor: active ? 'var(--athlon-primary)' : 'var(--athlon-card)',
                        borderColor: active ? 'var(--athlon-primary)' : 'var(--athlon-border)',
                      }}
                    >
                      <span>{cat}</span>
                      <span
                        className="text-[10px] font-mono px-1.5 py-0.2 rounded-md font-bold"
                        style={{
                          backgroundColor: active ? 'rgba(0,0,0,0.2)' : 'var(--athlon-surface)',
                          color: active ? '#000' : 'var(--athlon-text-muted)',
                        }}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Right Controls: Search & Mark All As Read */}
              <div className="flex items-center gap-3 shrink-0">
                {/* Search Bar */}
                <div
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl border w-64 lg:w-72 shadow-xs transition-colors focus-within:border-primary/50"
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
                    placeholder="Search dispatches, courts..."
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

                {/* Mark All As Read Button */}
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-black uppercase tracking-wider text-foreground/80 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all cursor-pointer shadow-xs"
                    style={{
                      backgroundColor: 'var(--athlon-card)',
                      borderColor: 'var(--athlon-border)',
                    }}
                  >
                    <CheckCheck className="w-4 h-4 text-primary" />
                    <span>Mark All Read</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Desktop Main Content Grid */}
        <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8 space-y-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="p-5 rounded-2xl border animate-pulse space-y-3"
                  style={{
                    backgroundColor: 'var(--athlon-card)',
                    borderColor: 'var(--athlon-border)',
                  }}
                >
                  <div className="flex justify-between">
                    <div className="h-4 w-24 bg-foreground/10 rounded" />
                    <div className="h-4 w-16 bg-foreground/10 rounded" />
                  </div>
                  <div className="h-5 w-3/4 bg-foreground/10 rounded" />
                  <div className="h-10 bg-foreground/10 rounded-xl" />
                </div>
              ))}
            </div>
          ) : filteredNotifications.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredNotifications.map((notif) => {
                const meta = getCategoryMeta(notif.category, notif.urgent);
                const read = isRead(notif.id);
                const IconComp = meta.icon;

                return (
                  <div
                    key={notif.id}
                    className={`rounded-2xl border relative overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-200 group ${
                      !read ? 'border-primary/40' : 'opacity-90 hover:opacity-100'
                    }`}
                    style={{
                      backgroundColor: 'var(--athlon-card)',
                      borderColor: !read ? undefined : 'var(--athlon-border)',
                    }}
                  >
                    {/* Top Status Gradient Line */}
                    <div className={`h-1 w-full ${meta.accentLine} absolute top-0 left-0 right-0`} />

                    {/* Card Body */}
                    <div className="p-5 space-y-3.5">
                      {/* Top Meta Line: Category Badge + Relative Time */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${meta.badgeBg}`}
                          >
                            {notif.category}
                          </span>

                          {notif.urgent && !read && (
                            <span className="px-2 py-0.5 rounded-full text-[9.5px] font-black uppercase tracking-wider bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center gap-1 animate-pulse">
                              <Flame className="w-2.5 h-2.5" />
                              <span>Action</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-foreground/50 font-mono">
                          <Clock className="w-3 h-3 text-foreground/40" />
                          <span>{notif.time}</span>
                        </div>
                      </div>

                      {/* Title & Icon Header */}
                      <div className="flex items-start gap-3 pt-1">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${meta.bgColor} ${meta.borderColor}`}
                        >
                          <IconComp className={`w-5 h-5 ${meta.color}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-black text-foreground tracking-tight leading-snug line-clamp-2">
                            {notif.title}
                          </h3>

                          {/* Tournament or Court Pill */}
                          {(notif.tournamentName || notif.court) && (
                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                              {notif.tournamentName && (
                                <span className="inline-flex items-center gap-1 text-[10px] text-foreground/60 font-semibold truncate max-w-[200px]">
                                  <Tag className="w-2.5 h-2.5 text-primary" />
                                  <span className="truncate">{notif.tournamentName}</span>
                                </span>
                              )}
                              {notif.court && (
                                <span className="inline-flex items-center gap-1 text-[10px] text-foreground/60 font-semibold">
                                  <MapPin className="w-2.5 h-2.5 text-emerald-500" />
                                  <span>{notif.court}</span>
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Dispatch Message Text */}
                      <p className="text-xs text-foreground/75 leading-relaxed font-medium">
                        {notif.message}
                      </p>
                    </div>

                    {/* Card Footer Action Bar */}
                    <div
                      className="px-5 py-3 border-t flex items-center justify-between text-xs font-bold"
                      style={{
                        backgroundColor: 'var(--athlon-surface)',
                        borderColor: 'var(--athlon-border)',
                      }}
                    >
                      {notif.actionUrl ? (
                        <Link
                          href={notif.actionUrl}
                          className="flex items-center gap-1.5 text-primary hover:underline transition-colors group-hover:translate-x-0.5 duration-150"
                        >
                          <span>{notif.actionLabel || 'View Details'}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      ) : (
                        <span className="text-[11px] text-foreground/40 font-mono">System Notice</span>
                      )}

                      {!read ? (
                        <button
                          onClick={() => markAsRead(notif.id)}
                          className="text-foreground/50 hover:text-foreground flex items-center gap-1 text-[11px] font-semibold transition-colors cursor-pointer"
                          title="Mark as read"
                        >
                          <Check className="w-3.5 h-3.5 text-primary" />
                          <span>Dismiss</span>
                        </button>
                      ) : (
                        <span className="text-[10px] font-mono text-foreground/40 flex items-center gap-1">
                          <Check className="w-3 h-3 text-foreground/30" />
                          <span>Read</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Empty State */
            <div
              className="p-12 rounded-3xl border text-center flex flex-col items-center justify-center max-w-lg mx-auto shadow-xs space-y-4"
              style={{
                backgroundColor: 'var(--athlon-card)',
                borderColor: 'var(--athlon-border)',
              }}
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center border"
                style={{
                  backgroundColor: 'var(--athlon-primary-soft)',
                  borderColor: 'var(--athlon-border)',
                  color: 'var(--athlon-primary)',
                }}
              >
                <Bell className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-black uppercase tracking-tight text-foreground">
                  {searchQuery ? 'No Matching Dispatches' : "You're All Caught Up!"}
                </h3>
                <p className="text-xs text-foreground/60 max-w-xs leading-relaxed font-medium">
                  {searchQuery
                    ? `No notifications found matching "${searchQuery}". Try adjusting your keywords or clearing the filter.`
                    : 'Zero active notifications right now. Match call-ups, schedule adjustments, and organizer bulletins will appear here automatically.'}
                </p>
              </div>

              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-primary text-black transition-all active:scale-95 cursor-pointer shadow-sm"
                >
                  Clear Search Filter
                </button>
              ) : (
                <div className="flex items-center gap-3 pt-2">
                  <Link
                    href="/tournaments"
                    className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-primary text-black transition-all active:scale-95 flex items-center gap-1.5 shadow-sm"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Explore Tournaments</span>
                  </Link>
                  <Link
                    href="/home/matches"
                    className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border text-foreground/80 hover:text-foreground hover:bg-white/5 transition-all active:scale-95"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    View My Matches
                  </Link>
                </div>
              )}
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
