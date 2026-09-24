'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  CalendarDays,
  Plus,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  X,
  AlertCircle,
  ChevronRight,
  Filter,
  DollarSign,
  Share2,
  Sparkles,
  ArrowLeft,
  Calendar,
  Flame,
  Check,
  Award,
  Zap,
  ShieldCheck,
  UserCheck,
  Coins,
  Ticket,
  Navigation,
  ExternalLink,
  Trash2,
} from 'lucide-react';
import {
  CommunityService,
  SessionResponse,
  CreateSessionRequest,
  CommunityMemberDto,
  SessionAttendanceStatus,
} from '@/lib/api/community';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { useOrgRole } from '@/hooks/use-org-role';
import { useAthlonTheme } from '@/hooks/use-athlon-theme';
import { Athlon3DIcon } from '@/components/common/Athlon3DIcon';
import { Athlon3DFAB } from '@/components/common/Athlon3DFAB';

export default function CommunitySessionsPage() {
  const params = useParams();
  const router = useRouter();
  const orgId = (params?.orgId as string) || '';
  const { getActiveOrganization, organizations } = useWorkspaceStore();
  const org = getActiveOrganization() || organizations.find((o) => o.id === orgId);
  const { isAdmin, canManage } = useOrgRole(orgId);
  let themeMode: 'light' | 'dark' = 'dark';
  try {
    const themeCtx = useAthlonTheme();
    if (themeCtx) {
      themeMode = themeCtx.mode;
    }
  } catch {
    // fallback if outside AthlonThemeProvider
  }

  const [sessions, setSessions] = useState<SessionResponse[]>([]);
  const [members, setMembers] = useState<CommunityMemberDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<'ALL' | 'UPCOMING' | 'THIS_WEEK'>('ALL');

  // Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Attendance & Delete Modal
  const [selectedSessionForAttendance, setSelectedSessionForAttendance] = useState<SessionResponse | null>(null);
  const [sessionToDelete, setSessionToDelete] = useState<SessionResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [markingUserUuid, setMarkingUserUuid] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateSessionRequest>({
    title: '',
    description: '',
    sport: 'Badminton',
    skillLevel: 'ALL',
    sessionDate: new Date().toISOString().split('T')[0],
    startTime: '18:00',
    endTime: '20:00',
    courtName: '',
    venueName: '',
    city: '',
    state: '',
    googleMapUrl: '',
    genderCategory: 'BOTH',
    maxMalePlayers: 4,
    maxFemalePlayers: 4,
    maxParticipants: 8,
    costPerPerson: 100,
  });

  const fetchSessions = async () => {
    if (!orgId) return;
    try {
      setLoading(true);
      const [sessRes, memRes] = await Promise.allSettled([
        CommunityService.getSessions(orgId),
        CommunityService.getMembers(orgId).catch(() => []),
      ]);

      if (sessRes.status === 'fulfilled') {
        const data = (sessRes.value as any)?.data || sessRes.value;
        setSessions(Array.isArray(data) ? data : []);
      }
      if (memRes.status === 'fulfilled') {
        const data = (memRes.value as any)?.data || memRes.value;
        setMembers(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to load sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [orgId]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setCreateError('Please enter a session title');
      return;
    }
    try {
      setIsCreating(true);
      setCreateError(null);

      const costNum = Number(formData.costPerPerson ?? formData.costPerPlayer ?? 0);
      let calculatedMax = formData.maxParticipants;
      if (formData.genderCategory === 'BOTH') {
        const m = Number(formData.maxMalePlayers || 0);
        const f = Number(formData.maxFemalePlayers || 0);
        calculatedMax = m + f > 0 ? m + f : 8;
      } else if (formData.genderCategory === 'MALE') {
        calculatedMax = Number(formData.maxMalePlayers || formData.maxParticipants || 8);
      } else if (formData.genderCategory === 'FEMALE') {
        calculatedMax = Number(formData.maxFemalePlayers || formData.maxParticipants || 8);
      }

      const payload: CreateSessionRequest = {
        ...formData,
        costPerPerson: costNum,
        costPerPlayer: costNum,
        maxParticipants: calculatedMax,
        maxPlayers: calculatedMax,
        genderCategory: formData.genderCategory || 'BOTH',
        maxMalePlayers: formData.genderCategory === 'FEMALE' ? 0 : Number(formData.maxMalePlayers || 0),
        maxFemalePlayers: formData.genderCategory === 'MALE' ? 0 : Number(formData.maxFemalePlayers || 0),
      };

      await CommunityService.createSession(orgId, payload);
      setShowCreateModal(false);
      setToastMessage('🎉 Session created with RSVPs open!');
      setTimeout(() => setToastMessage(null), 3500);
      fetchSessions();
    } catch (err: any) {
      console.error('Failed to create session:', err);
      setCreateError(err?.response?.data?.message || err?.message || 'Failed to create session');
    } finally {
      setIsCreating(false);
    }
  };

  const handleRsvp = async (sessionUuid: string, status: 'GOING' | 'MAYBE' | 'NOT_GOING') => {
    try {
      await CommunityService.rsvpSession(sessionUuid, { status, guestsCount: 0 });
      setToastMessage(status === 'GOING' ? '✓ You are confirmed for this session!' : 'RSVP updated.');
      setTimeout(() => setToastMessage(null), 3000);
      fetchSessions();
    } catch (err) {
      console.error('Failed to RSVP:', err);
    }
  };

  const handleMarkAttendance = async (sessionUuid: string, userUuid: string, status: SessionAttendanceStatus) => {
    try {
      setMarkingUserUuid(userUuid);
      await CommunityService.markAttendance(sessionUuid, { userUuid, status });
      fetchSessions();
    } catch (err) {
      console.error('Failed to mark attendance:', err);
    } finally {
      setMarkingUserUuid(null);
    }
  };

  const handleDeleteSession = async (sessionUuid: string) => {
    try {
      setIsDeleting(true);
      await CommunityService.deleteSession(sessionUuid);
      setToastMessage('Session deleted successfully.');
      setTimeout(() => setToastMessage(null), 3000);
      setSessionToDelete(null);
      fetchSessions();
    } catch (err: any) {
      console.error('Failed to delete session:', err);
      setToastMessage(err?.response?.data?.message || 'Failed to delete session');
      setTimeout(() => setToastMessage(null), 3500);
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper date & time formatters
  const formatSessionTime = (timeStr?: string) => {
    if (!timeStr) return '';
    const parts = timeStr.split(':');
    if (parts.length >= 2) {
      const hours = parseInt(parts[0], 10);
      const minutes = parts[1];
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 || 12;
      return `${formattedHours}:${minutes} ${ampm}`;
    }
    return timeStr;
  };

  const formatSessionDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  // Filtered Sessions
  const filteredSessions = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    if (filterTab === 'UPCOMING') {
      return sessions.filter((s) => s.sessionDate >= today);
    }
    if (filterTab === 'THIS_WEEK') {
      const weekAhead = new Date();
      weekAhead.setDate(weekAhead.getDate() + 7);
      const weekAheadStr = weekAhead.toISOString().split('T')[0];
      return sessions.filter((s) => s.sessionDate >= today && s.sessionDate <= weekAheadStr);
    }
    return sessions;
  }, [sessions, filterTab]);

  const totalGoing = useMemo(() => {
    return sessions.reduce((acc, curr) => acc + (curr.goingCount || curr.confirmedPlayersCount || 0), 0);
  }, [sessions]);

  return (
    <div className="min-h-screen pb-32 sm:pb-20 text-foreground" style={{ backgroundColor: 'var(--athlon-bg)' }}>
      {/* ─── Modern Mobile-First Hero Header ─── */}
      <div
        className="border-b relative overflow-hidden px-4 py-4 sm:py-6 sm:px-6 lg:px-8"
        style={{ borderColor: 'var(--athlon-border)' }}
      >
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 space-y-3.5">
          {/* Top Breadcrumb & Quick Back Row */}
          <div className="flex items-center justify-between gap-2">
            <Link
              href={`/org/${orgId}/dashboard`}
              className="inline-flex items-center gap-1.5 text-[11px] font-bold text-foreground/60 hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Workspace Hub</span>
            </Link>

            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-[10px] font-black uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
              <span>Live RSVPs Active</span>
            </div>
          </div>

          {/* Title & Subtitle */}
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl border flex items-center justify-center shadow-inner shrink-0"
                  style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                >
                  <Athlon3DIcon type="schedule" size={28} active={true} />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-foreground tracking-tight">
                    &quot;Let&apos;s Play&quot; Sessions
                  </h1>
                  <p className="text-[11px] sm:text-xs text-foreground/60 font-medium">
                    Weekly court games, player RSVPs &amp; roll call
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Strip */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <div
              className="p-2.5 sm:p-3 rounded-2xl border text-center space-y-0.5"
              style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
            >
              <div className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider">Total Games</div>
              <div className="text-base sm:text-lg font-black text-foreground">{sessions.length}</div>
            </div>
            <div
              className="p-2.5 sm:p-3 rounded-2xl border text-center space-y-0.5"
              style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
            >
              <div className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider">Active RSVPs</div>
              <div className="text-base sm:text-lg font-black text-primary">{totalGoing}</div>
            </div>
            <div
              className="p-2.5 sm:p-3 rounded-2xl border text-center space-y-0.5"
              style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
            >
              <div className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider">Circle Players</div>
              <div className="text-base sm:text-lg font-black text-blue-400">{members.length || 1}</div>
            </div>
          </div>

          {/* Filter Tabs Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 hide-scrollbar pt-1">
            {[
              { id: 'ALL', label: 'All Sessions' },
              { id: 'UPCOMING', label: 'Upcoming' },
              { id: 'THIS_WEEK', label: 'This Week' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${filterTab === tab.id
                  ? 'bg-foreground text-background shadow-sm'
                  : 'bg-surface hover:bg-card border text-foreground/70'
                  }`}
                style={{
                  borderColor: filterTab === tab.id ? undefined : 'var(--athlon-border)',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Main Sessions Content ─── */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-56 rounded-3xl animate-pulse border"
                style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
              />
            ))}
          </div>
        ) : filteredSessions.length === 0 ? (
          /* ─── Empty State ─── */
          <div
            className="p-6 sm:p-10 rounded-[28px] sm:rounded-[36px] border text-center space-y-6 relative overflow-hidden shadow-xl"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <div className="absolute top-0 right-1/2 translate-x-1/2 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative mx-auto w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
              <div className="absolute inset-0 rounded-3xl bg-primary/20 blur-xl animate-pulse" />
              <div
                className="relative w-full h-full rounded-2xl sm:rounded-3xl border flex items-center justify-center shadow-lg"
                style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
              >
                <Athlon3DIcon type="schedule" size={40} active={true} />
              </div>
            </div>

            <div className="space-y-1.5 max-w-md mx-auto relative z-10">
              <h3 className="text-lg sm:text-xl font-black text-foreground tracking-tight">
                No Game Sessions Scheduled Yet
              </h3>
              <p className="text-xs sm:text-sm text-foreground/60 leading-relaxed">
                Host your circle&apos;s next court sparring or friendly doubles match. Members get instant push alerts &amp; 1-tap RSVPs!
              </p>
            </div>

            <div className="pt-2 relative z-10">
              <button
                onClick={() => setShowCreateModal(true)}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-primary hover:bg-primary/90 text-black font-black text-xs sm:text-sm inline-flex items-center justify-center gap-2 shadow-[0_4px_25px_var(--athlon-primary-glow)] active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" strokeWidth={3} />
                <span>Host First Play Session</span>
              </button>
            </div>
          </div>
        ) : (
          /* ─── Redesigned Session Cards Grid ─── */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredSessions.map((sess) => {
              const isGoing = sess.currentUserRsvp === 'GOING';
              const max = sess.maxPlayers || sess.maxParticipants || 8;
              const current = sess.goingCount || sess.confirmedPlayersCount || (sess.rsvps ? sess.rsvps.filter((r) => r.status === 'GOING').length : 0);
              const fillPct = Math.min(100, Math.round((current / max) * 100));
              const isFull = max ? current >= max : false;
              const spotsLeft = Math.max(0, max - current);

              // Accurately resolve cost from either costPerPlayer or costPerPerson
              const costRaw = sess.costPerPlayer !== undefined && sess.costPerPlayer !== null
                ? sess.costPerPlayer
                : sess.costPerPerson;
              const cost = costRaw !== undefined && costRaw !== null ? Number(costRaw) : 0;

              const startTimeFormatted = formatSessionTime(sess.startTime);
              const endTimeFormatted = formatSessionTime(sess.endTime);
              const dateFormatted = formatSessionDate(sess.sessionDate);

              return (
                <div
                  key={sess.sessionUuid}
                  className="p-4 sm:p-5 rounded-[28px] border shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col justify-between space-y-4 relative overflow-hidden group"
                  style={{
                    backgroundColor: 'var(--athlon-card)',
                    borderColor: 'var(--athlon-border)',
                  }}
                >
                  {/* Card Header & Badges */}
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-primary/15 text-primary border border-primary/25">
                          🏸 {sess.sport || 'Badminton'}
                        </span>

                        {/* Gender Preference Badge */}
                        {sess.genderCategory === 'MALE' ? (
                          <span className="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-blue-500/15 text-blue-400 border border-blue-500/25">
                            🚹 Men
                          </span>
                        ) : sess.genderCategory === 'FEMALE' ? (
                          <span className="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-pink-500/15 text-pink-400 border border-pink-500/25">
                            🚺 Women
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-purple-500/15 text-purple-400 border border-purple-500/25">
                            👥 {sess.maxMalePlayers && sess.maxFemalePlayers ? `Mixed (${sess.maxMalePlayers}M + ${sess.maxFemalePlayers}F)` : 'Mixed / Both'}
                          </span>
                        )}

                        {cost > 0 ? (
                          <span className="px-2.5 py-1 rounded-xl text-[10.5px] font-black bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-500/15 text-amber-500 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1 shadow-sm">
                            <Coins className="w-3 h-3" />
                            <span>₹{cost} / player</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                            Free Session
                          </span>
                        )}
                      </div>

                      {isFull && (
                        <span className="px-2.5 py-0.5 rounded-full text-[9.5px] font-black uppercase tracking-wider border bg-rose-500/15 text-rose-400 border-rose-500/30">
                          Slots Full
                        </span>
                      )}
                    </div>

                    {/* Session Title & Description */}
                    <div className="space-y-1">
                      <h3 className="text-base sm:text-lg font-black text-foreground tracking-tight group-hover:text-primary transition-colors">
                        {sess.title}
                      </h3>
                      {sess.description && (
                        <p className="text-[11.5px] text-foreground/60 line-clamp-2 leading-relaxed">
                          {sess.description}
                        </p>
                      )}
                    </div>

                    {/* Meta Info Box */}
                    <div
                      className="p-3.5 rounded-2xl border space-y-2.5 text-xs shadow-inner"
                      style={{
                        backgroundColor: 'var(--athlon-surface)',
                        borderColor: 'var(--athlon-border)',
                      }}
                    >
                      {/* Date & Time */}
                      <div className="flex items-center justify-between text-[11.5px]">
                        <span className="text-foreground/55 font-semibold flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-primary shrink-0" /> Date &amp; Time
                        </span>
                        <div className="text-right">
                          <div className="font-bold text-foreground">{dateFormatted}</div>
                          <div className="text-[10.5px] font-mono text-foreground/60">
                            {startTimeFormatted} – {endTimeFormatted}
                          </div>
                        </div>
                      </div>

                      {/* Venue & Location */}
                      {(sess.venueName || sess.city || sess.state) && (
                        <div className="flex items-start justify-between text-[11.5px] pt-1 border-t border-border/40 gap-2">
                          <span className="text-foreground/55 font-semibold flex items-center gap-1.5 shrink-0 pt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-primary shrink-0" /> Court Venue
                          </span>
                          <div className="text-right space-y-0.5 max-w-[200px]">
                            <div className="font-bold text-foreground truncate">
                              {sess.venueName || 'Venue'}
                            </div>
                            {(sess.city || sess.state) && (
                              <div className="text-[10px] text-foreground/60 font-medium truncate">
                                {[sess.city, sess.state].filter(Boolean).join(', ')}
                              </div>
                            )}
                            {sess.googleMapUrl && (
                              <div className="pt-0.5">
                                <a
                                  href={sess.googleMapUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[10px] font-bold text-primary hover:underline"
                                >
                                  <Navigation className="w-2.5 h-2.5" />
                                  <span>View on Maps</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Capacity Progress Bar */}
                      <div className="pt-1.5 space-y-1 border-t border-border/40">
                        <div className="flex items-center justify-between text-[10.5px]">
                          <span className="text-foreground/60 font-semibold flex items-center gap-1">
                            <Users className="w-3 h-3 text-primary" /> Roster Capacity
                          </span>
                          <span className="font-mono font-bold text-foreground">
                            {current} / {max} slots ({spotsLeft > 0 ? `${spotsLeft} open` : 'Full'})
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-foreground/10 overflow-hidden p-[1px]">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${fillPct >= 100
                              ? 'bg-rose-500'
                              : fillPct >= 75
                                ? 'bg-amber-400'
                                : 'bg-primary'
                              }`}
                            style={{ width: `${fillPct}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Attending Player Avatars */}
                    <div className="space-y-1.5 pt-0.5">
                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-foreground/50">
                        <span>Confirmed Squad ({current})</span>
                        {spotsLeft > 0 && (
                          <span className="text-primary font-bold lowercase">
                            {spotsLeft} spot{spotsLeft > 1 ? 's' : ''} left
                          </span>
                        )}
                      </div>

                      {sess.rsvps && sess.rsvps.length > 0 ? (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {sess.rsvps
                            .filter((r) => r.status === 'GOING' || (r as any).rsvpStatus === 'GOING')
                            .slice(0, 8)
                            .map((r) => (
                              <div
                                key={(r as any).rsvpId || (r as any).userUuid}
                                title={r.fullName || (r as any).userName}
                                className="w-7 h-7 rounded-full border text-[10px] font-black flex items-center justify-center text-primary shadow-sm"
                                style={{
                                  backgroundColor: 'var(--athlon-surface)',
                                  borderColor: 'var(--athlon-border)',
                                }}
                              >
                                {(r as any).avatarUrl || (r as any).userAvatar ? (
                                  <img
                                    src={(r as any).avatarUrl || (r as any).userAvatar}
                                    alt={r.fullName || (r as any).userName}
                                    className="w-full h-full object-cover rounded-full"
                                  />
                                ) : (
                                  ((r.fullName || (r as any).userName || 'P') as string).charAt(0).toUpperCase()
                                )}
                              </div>
                            ))}
                          {sess.rsvps.filter((r) => r.status === 'GOING' || (r as any).rsvpStatus === 'GOING').length > 8 && (
                            <span className="text-[10px] font-bold text-foreground/50">
                              +{sess.rsvps.filter((r) => r.status === 'GOING' || (r as any).rsvpStatus === 'GOING').length - 8} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="text-[11px] text-foreground/45 italic py-0.5">
                          Be the first to confirm your spot!
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div
                    className="pt-3 border-t flex items-center justify-between gap-2"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <button
                      onClick={() => handleRsvp(sess.sessionUuid, isGoing ? 'NOT_GOING' : 'GOING')}
                      disabled={!isGoing && isFull}
                      className={`flex-1 py-3 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 ${isGoing
                        ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                        : isFull
                          ? 'bg-surface text-foreground/40 cursor-not-allowed border'
                          : 'bg-primary text-black hover:bg-primary/90 shadow-[0_2px_12px_var(--athlon-primary-glow)]'
                        }`}
                      style={{
                        borderColor: isFull ? 'var(--athlon-border)' : undefined,
                      }}
                    >
                      {isGoing ? (
                        <>
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>I&apos;m Playing (Confirmed)</span>
                        </>
                      ) : isFull ? (
                        <span>Session Full</span>
                      ) : cost > 0 ? (
                        <>
                          <Zap className="w-3.5 h-3.5 fill-black" />
                          <span>RSVP &amp; Join (₹{cost})</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-3.5 h-3.5 fill-black" />
                          <span>1-Tap RSVP</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setSelectedSessionForAttendance(sess)}
                      className="px-3.5 py-3 rounded-2xl border text-foreground font-bold text-xs flex items-center gap-1.5 hover:bg-surface transition-colors cursor-pointer shrink-0"
                      style={{
                        backgroundColor: 'var(--athlon-surface)',
                        borderColor: 'var(--athlon-border)',
                      }}
                      title="Roll Call & Attendance"
                    >
                      <UserCheck className="w-4 h-4 text-primary" />
                      <span className="hidden xs:inline">Roll Call</span>
                    </button>

                    {(isAdmin || canManage) && (
                      <button
                        onClick={() => setSessionToDelete(sess)}
                        className="px-3 py-3 rounded-2xl border text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: 'var(--athlon-surface)',
                          borderColor: 'var(--athlon-border)',
                        }}
                        title="Delete Session"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Host Session Modal ─── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div
            className="w-full max-w-lg rounded-[28px] border shadow-2xl p-5 sm:p-7 space-y-4 relative overflow-hidden max-h-[92vh] overflow-y-auto"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <div className="flex items-center justify-between border-b pb-3.5" style={{ borderColor: 'var(--athlon-border)' }}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center font-black text-sm">
                  🏸
                </div>
                <div>
                  <h3 className="font-black text-base text-foreground">Host &quot;Let&apos;s Play&quot; Session</h3>
                  <p className="text-[10px] text-foreground/60">Broadcast to community members for live RSVP</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-foreground/40 hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {createError && (
              <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase tracking-wider text-foreground/70">
                  Session Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Saturday Evening Doubles Sparring"
                  className="w-full px-3 py-2.5 rounded-xl border text-xs text-foreground focus:outline-none focus:border-primary transition-colors"
                  style={{
                    backgroundColor: 'var(--athlon-surface)',
                    borderColor: 'var(--athlon-border)',
                  }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-wider text-foreground/70">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.sessionDate}
                    onChange={(e) => setFormData({ ...formData, sessionDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border text-xs text-foreground focus:outline-none focus:border-primary"
                    style={{
                      backgroundColor: 'var(--athlon-surface)',
                      borderColor: 'var(--athlon-border)',
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-wider text-foreground/70">
                    Time Window *
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="w-full px-2 py-2 rounded-xl border text-xs text-foreground text-center"
                      style={{
                        backgroundColor: 'var(--athlon-surface)',
                        borderColor: 'var(--athlon-border)',
                      }}
                    />
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className="w-full px-2 py-2 rounded-xl border text-xs text-foreground text-center"
                      style={{
                        backgroundColor: 'var(--athlon-surface)',
                        borderColor: 'var(--athlon-border)',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* ─── Skill Level Dropdown ─── */}
              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase tracking-wider text-foreground/70">
                  Skill Level *
                </label>
                <div className="relative">
                  <select
                    value={formData.skillLevel || 'ALL'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        skillLevel: e.target.value,
                        skillLevelRequired: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border text-xs text-foreground font-bold appearance-none cursor-pointer focus:outline-none focus:border-primary transition-colors pr-8"
                    style={{
                      backgroundColor: 'var(--athlon-surface)',
                      borderColor: 'var(--athlon-border)',
                    }}
                  >
                    <option value="ALL">🌟 All Levels (Open for Everyone)</option>
                    <option value="BEGINNER">🟢 Beginner</option>
                    <option value="INTERMEDIATE">🟡 Intermediate</option>
                    <option value="ADVANCED">🔴 Advanced</option>
                    <option value="PRO">🏆 Pro / Competitive</option>
                  </select>
                  <ChevronRight className="w-4 h-4 text-foreground/40 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none rotate-90" />
                </div>
              </div>

              {/* ─── Player Gender Category & Count ─── */}
              <div
                className="p-3 rounded-2xl border space-y-2.5"
                style={{
                  backgroundColor: 'var(--athlon-surface)',
                  borderColor: 'var(--athlon-border)',
                }}
              >
                <div className="space-y-1">
                  <label className="text-[10.5px] font-black uppercase tracking-wider text-foreground/70">
                    Player Eligibility / Gender *
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'MALE', label: '🚹 Male' },
                      { id: 'FEMALE', label: '🚺 Female' },
                      { id: 'BOTH', label: '👥 Both' },
                    ].map((g) => (
                      <button
                        type="button"
                        key={g.id}
                        onClick={() => {
                          setFormData({
                            ...formData,
                            genderCategory: g.id as any,
                            maxMalePlayers: g.id === 'FEMALE' ? 0 : (formData.maxMalePlayers || 4),
                            maxFemalePlayers: g.id === 'MALE' ? 0 : (formData.maxFemalePlayers || 4),
                          });
                        }}
                        className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all text-center cursor-pointer border ${formData.genderCategory === g.id
                          ? 'bg-primary text-black border-primary font-black shadow-sm'
                          : 'bg-card text-foreground/70 border-border/50 hover:bg-card/80'
                          }`}
                        style={{
                          backgroundColor: formData.genderCategory === g.id ? undefined : 'var(--athlon-card)',
                          borderColor: formData.genderCategory === g.id ? undefined : 'var(--athlon-border)',
                        }}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Split Counts for BOTH / Separate for Male/Female */}
                {formData.genderCategory === 'BOTH' ? (
                  <div className="space-y-1.5 pt-1">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-foreground/60">Male Players</label>
                        <input
                          type="number"
                          min={1}
                          max={32}
                          value={formData.maxMalePlayers || ''}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10) || 0;
                            const f = formData.maxFemalePlayers || 0;
                            setFormData({
                              ...formData,
                              maxMalePlayers: val,
                              maxParticipants: val + f,
                              maxPlayers: val + f,
                            });
                          }}
                          placeholder="4"
                          className="w-full px-3 py-1.5 rounded-xl border text-xs text-foreground font-bold"
                          style={{
                            backgroundColor: 'var(--athlon-card)',
                            borderColor: 'var(--athlon-border)',
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-foreground/60">Female Players</label>
                        <input
                          type="number"
                          min={1}
                          max={32}
                          value={formData.maxFemalePlayers || ''}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10) || 0;
                            const m = formData.maxMalePlayers || 0;
                            setFormData({
                              ...formData,
                              maxFemalePlayers: val,
                              maxParticipants: m + val,
                              maxPlayers: m + val,
                            });
                          }}
                          placeholder="4"
                          className="w-full px-3 py-1.5 rounded-xl border text-xs text-foreground font-bold"
                          style={{
                            backgroundColor: 'var(--athlon-card)',
                            borderColor: 'var(--athlon-border)',
                          }}
                        />
                      </div>
                    </div>
                    <div className="text-[10.5px] text-primary font-semibold text-right">
                      Total Roster: {(formData.maxMalePlayers || 0) + (formData.maxFemalePlayers || 0)} players
                    </div>
                  </div>
                ) : formData.genderCategory === 'MALE' ? (
                  <div className="space-y-1 pt-1">
                    <label className="text-[10px] font-bold text-foreground/60">Max Male Players</label>
                    <input
                      type="number"
                      min={2}
                      max={64}
                      value={formData.maxMalePlayers || formData.maxParticipants || ''}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 0;
                        setFormData({
                          ...formData,
                          maxMalePlayers: val,
                          maxParticipants: val,
                          maxPlayers: val,
                        });
                      }}
                      placeholder="8"
                      className="w-full px-3 py-1.5 rounded-xl border text-xs text-foreground font-bold"
                      style={{
                        backgroundColor: 'var(--athlon-card)',
                        borderColor: 'var(--athlon-border)',
                      }}
                    />
                  </div>
                ) : (
                  <div className="space-y-1 pt-1">
                    <label className="text-[10px] font-bold text-foreground/60">Max Female Players</label>
                    <input
                      type="number"
                      min={2}
                      max={64}
                      value={formData.maxFemalePlayers || formData.maxParticipants || ''}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 0;
                        setFormData({
                          ...formData,
                          maxFemalePlayers: val,
                          maxParticipants: val,
                          maxPlayers: val,
                        });
                      }}
                      placeholder="8"
                      className="w-full px-3 py-1.5 rounded-xl border text-xs text-foreground font-bold"
                      style={{
                        backgroundColor: 'var(--athlon-card)',
                        borderColor: 'var(--athlon-border)',
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Cost / Player */}
              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase tracking-wider text-foreground/70">
                  Cost / Player (₹) — Enter 0 for Free
                </label>
                <input
                  type="number"
                  min={0}
                  value={formData.costPerPerson ?? formData.costPerPlayer ?? ''}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    setFormData({ ...formData, costPerPerson: val, costPerPlayer: val });
                  }}
                  placeholder="100"
                  className="w-full px-3 py-2 rounded-xl border text-xs text-foreground font-bold"
                  style={{
                    backgroundColor: 'var(--athlon-surface)',
                    borderColor: 'var(--athlon-border)',
                  }}
                />
              </div>

              {/* ─── Location & Venue Details ─── */}
              <div
                className="p-3 rounded-2xl border space-y-2.5"
                style={{
                  backgroundColor: 'var(--athlon-surface)',
                  borderColor: 'var(--athlon-border)',
                }}
              >
                <div className="text-[10.5px] font-black uppercase tracking-wider text-foreground/70 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  <span>Venue &amp; Location Details</span>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-foreground/60">Venue Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.venueName || ''}
                    onChange={(e) => setFormData({ ...formData, venueName: e.target.value })}
                    placeholder="e.g. PlayArena Sports Club"
                    className="w-full px-3 py-1.5 rounded-xl border text-xs text-foreground"
                    style={{
                      backgroundColor: 'var(--athlon-card)',
                      borderColor: 'var(--athlon-border)',
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-foreground/60">City</label>
                    <input
                      type="text"
                      value={formData.city || ''}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="e.g. Bengaluru"
                      className="w-full px-3 py-1.5 rounded-xl border text-xs text-foreground"
                      style={{
                        backgroundColor: 'var(--athlon-card)',
                        borderColor: 'var(--athlon-border)',
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-foreground/60">State</label>
                    <input
                      type="text"
                      value={formData.state || ''}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      placeholder="e.g. Karnataka"
                      className="w-full px-3 py-1.5 rounded-xl border text-xs text-foreground"
                      style={{
                        backgroundColor: 'var(--athlon-card)',
                        borderColor: 'var(--athlon-border)',
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-foreground/60">
                    Google Maps Link <span className="text-foreground/40 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="url"
                    value={formData.googleMapUrl || ''}
                    onChange={(e) => setFormData({ ...formData, googleMapUrl: e.target.value })}
                    placeholder="e.g. https://maps.app.goo.gl/..."
                    className="w-full px-3 py-1.5 rounded-xl border text-xs text-foreground"
                    style={{
                      backgroundColor: 'var(--athlon-card)',
                      borderColor: 'var(--athlon-border)',
                    }}
                  />
                </div>
              </div>

              <div
                className="pt-3 flex items-center justify-end gap-2 border-t"
                style={{ borderColor: 'var(--athlon-border)' }}
              >
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border text-foreground font-bold text-xs cursor-pointer"
                  style={{
                    backgroundColor: 'var(--athlon-surface)',
                    borderColor: 'var(--athlon-border)',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2 rounded-xl bg-primary text-black font-black text-xs disabled:opacity-50 cursor-pointer shadow-md"
                >
                  {isCreating ? 'Scheduling...' : 'Schedule & Open RSVP'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Attendance Check-in Roll Modal ─── */}
      {selectedSessionForAttendance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div
            className="w-full max-w-lg rounded-[28px] border shadow-2xl p-5 sm:p-7 space-y-4 relative overflow-hidden"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <div className="flex items-center justify-between border-b pb-3.5" style={{ borderColor: 'var(--athlon-border)' }}>
              <div>
                <h3 className="font-black text-base text-foreground">Attendance Check-in Roll</h3>
                <p className="text-[10.5px] text-foreground/60">
                  {selectedSessionForAttendance.title} • {formatSessionDate(selectedSessionForAttendance.sessionDate)}
                </p>
              </div>
              <button
                onClick={() => setSelectedSessionForAttendance(null)}
                className="p-1 text-foreground/40 hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {selectedSessionForAttendance.rsvps.length === 0 ? (
                <div className="text-center py-8 space-y-1">
                  <p className="text-xs font-bold text-foreground/60">No players have RSVP&apos;d yet.</p>
                  <p className="text-[10px] text-foreground/40">Players will show up here once they RSVP.</p>
                </div>
              ) : (
                selectedSessionForAttendance.rsvps.map((rsvp) => (
                  <div
                    key={(rsvp as any).rsvpId || (rsvp as any).userUuid}
                    className="p-2.5 rounded-2xl border flex items-center justify-between gap-2"
                    style={{
                      backgroundColor: 'var(--athlon-surface)',
                      borderColor: 'var(--athlon-border)',
                    }}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-7 h-7 rounded-full border flex items-center justify-center font-bold text-xs text-primary shrink-0"
                        style={{ borderColor: 'var(--athlon-border)' }}
                      >
                        {((rsvp.fullName || (rsvp as any).userName || 'P') as string).charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-foreground truncate">{rsvp.fullName || (rsvp as any).userName}</p>
                        <span className="text-[9.5px] text-foreground/50">RSVP: {rsvp.status || (rsvp as any).rsvpStatus}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() =>
                          handleMarkAttendance(selectedSessionForAttendance.sessionUuid, (rsvp as any).userUuid, 'PRESENT')
                        }
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-black text-[10px] font-black uppercase transition-all cursor-pointer"
                      >
                        ✓ Present
                      </button>
                      <button
                        onClick={() =>
                          handleMarkAttendance(selectedSessionForAttendance.sessionUuid, (rsvp as any).userUuid, 'ABSENT')
                        }
                        className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-black text-[10px] font-black uppercase transition-all cursor-pointer"
                      >
                        ✗ Absent
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t flex justify-end" style={{ borderColor: 'var(--athlon-border)' }}>
              <button
                onClick={() => setSelectedSessionForAttendance(null)}
                className="px-5 py-2 rounded-xl bg-primary text-black font-black text-xs cursor-pointer shadow-md"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Delete Session Confirmation Modal ─── */}
      {sessionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div
            className="w-full max-w-md rounded-[28px] border shadow-2xl p-5 sm:p-6 space-y-4 relative overflow-hidden"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/15 text-rose-500 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-foreground">Delete Session?</h3>
                <p className="text-[11px] text-foreground/60">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-foreground/80 leading-relaxed">
              Are you sure you want to cancel and delete <span className="font-bold text-foreground">&quot;{sessionToDelete.title}&quot;</span>? All player RSVPs and attendance records for this session will be permanently removed.
            </p>

            <div className="pt-3 flex items-center justify-end gap-2 border-t" style={{ borderColor: 'var(--athlon-border)' }}>
              <button
                type="button"
                onClick={() => setSessionToDelete(null)}
                className="px-4 py-2.5 rounded-xl border text-foreground font-bold text-xs cursor-pointer"
                style={{
                  backgroundColor: 'var(--athlon-surface)',
                  borderColor: 'var(--athlon-border)',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteSession(sessionToDelete.sessionUuid)}
                disabled={isDeleting}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs disabled:opacity-50 cursor-pointer shadow-md flex items-center gap-1.5"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Dynamic 3D Floating Action Button (FAB) for Hosting Sessions ─── */}
      <Athlon3DFAB
        onClick={() => setShowCreateModal(true)}
        label="Host Session"
        title="Host Game Session"
        ariaLabel="Host Game Session"
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-foreground text-background font-black text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
