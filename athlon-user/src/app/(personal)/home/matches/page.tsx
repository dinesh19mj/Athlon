'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Calendar,
  MapPin,
  Clock,
  Trophy,
  ChevronRight,
  ChevronLeft,
  Activity,
  ClipboardList,
  AlertCircle,
  CheckCircle,
  Shield,
  Users,
  User,
  Play,
  Sparkles,
  Radio,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { MatchService, Match } from '@/lib/api/matches';
import { AuthService } from '@/lib/api/auth';

export default function PlayerMatchesPage() {
  const router = useRouter();
  const { userId, userUuid, token } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'playing' | 'umpiring'>('playing');
  const [userMatches, setUserMatches] = useState<Match[]>([]);
  const [umpireMatches, setUmpireMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  const playingTrackRef = useRef<HTMLDivElement>(null);
  const umpireTrackRef = useRef<HTMLDivElement>(null);
  const lineupsTrackRef = useRef<HTMLDivElement>(null);

  const scrollContainer = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (userId) {
      setLoading(true);
      MatchService.getByUser(Number(userId))
        .then((response: any) => {
          if (response && response.data) {
            const sorted = [...response.data].sort((a: Match, b: Match) => {
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
            setUserMatches(sorted);
          }
        })
        .catch((err) => {
          console.error('Failed to load user matches:', err);
        })
        .finally(() => {
          if (!userUuid || !token) {
            setLoading(false);
          }
        });

      if (userUuid && token) {
        AuthService.getUserProfile(userUuid, token)
          .then((profileRes) => {
            if (profileRes && profileRes.data && profileRes.data.phone) {
              return MatchService.getByUmpirePhone(profileRes.data.phone).catch(() => ({ data: [] }));
            }
            return { data: [] };
          })
          .then((response: any) => {
            if (response && response.data && Array.isArray(response.data)) {
              const sortedUmpire = [...response.data].sort((a: Match, b: Match) => {
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
              setUmpireMatches(sortedUmpire);
            } else {
              setUmpireMatches([]);
            }
          })
          .catch(() => {
            setUmpireMatches([]);
          })
          .finally(() => {
            setLoading(false);
          });
      }
    } else {
      setLoading(false);
    }
  }, [userId, userUuid, token]);

  const pendingLineups = userMatches.filter((m) => m.status === 'WAITING_FOR_LINEUPS');

  const getLineupButtonProps = (match: Match) => {
    const isAApproved = match.teamALineupStatus === 'APPROVED';
    const isBApproved = match.teamBLineupStatus === 'APPROVED';
    const isASubmitted = match.teamALineupStatus === 'SUBMITTED' || isAApproved;
    const isBSubmitted = match.teamBLineupStatus === 'SUBMITTED' || isBApproved;

    if (isAApproved && isBApproved) {
      return {
        text: 'View Lineup',
        statusText: 'Lineups Approved',
        color: 'bg-emerald-500 hover:bg-emerald-600 text-black',
        badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
        cardBg: 'bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/50',
        icon: <CheckCircle className="w-4 h-4" />,
      };
    }

    if (isASubmitted || isBSubmitted) {
      return {
        text: 'View Lineup',
        statusText: 'Lineup Submitted',
        color: 'bg-primary hover:bg-primary-hover text-black',
        badgeColor: 'bg-primary/20 text-primary border border-primary/30',
        cardBg: 'bg-primary/5 border-primary/20 hover:border-primary/50',
        icon: <CheckCircle className="w-4 h-4" />,
      };
    }

    return {
      text: 'Submit Lineup',
      statusText: 'Pending Lineup',
      color: 'bg-orange-500 hover:bg-orange-600 text-white',
      badgeColor: 'bg-orange-500/20 text-orange-500 border border-orange-500/30',
      cardBg: 'bg-orange-500/5 border-orange-500/20 hover:border-orange-500/50',
      icon: <ClipboardList className="w-4 h-4" />,
    };
  };

  const formatMatchDateTime = (match: Match) => {
    const dateStr = match.scheduledTime || match.matchDate;
    if (!dateStr) {
      return { date: 'Date TBA', time: 'Time TBA' };
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      return { date: 'Date TBA', time: 'Time TBA' };
    }
    return {
      date: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
      time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const renderTeamName = (name?: string, fallback: string = 'Team', align: 'left' | 'right' = 'left') => {
    if (!name)
      return (
        <span
          className={`text-xs md:text-sm font-black text-foreground ${
            align === 'right' ? 'text-right' : 'text-left'
          }`}
        >
          {fallback}
        </span>
      );
    const parts = name.split(/\s*&\s*/);
    const isRight = align === 'right';

    return (
      <div className={`flex flex-col gap-2 min-w-0 ${isRight ? 'items-end' : 'items-start'}`}>
        {parts.map((p, i) => (
          <div
            key={i}
            className={`flex items-center gap-2 min-w-0 max-w-full ${
              isRight ? 'flex-row-reverse text-right' : 'flex-row text-left'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                isRight
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-primary/10 text-primary border border-primary/20'
              }`}
            >
              <User className="w-3 h-3" />
            </div>
            <span
              className="text-xs md:text-sm font-extrabold text-foreground leading-none tracking-tight min-w-0 break-words"
              style={{ overflowWrap: 'anywhere' }}
            >
              {p}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-black">
      {/* ══════════════════════════════════════════════════════════════════════
          1. MOBILE VIEW ONLY (< md) - 100% UNTOUCHED ORIGINAL DESIGN
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="block md:hidden pb-24">
        {/* Header */}
        <header className="p-4 border-b border-foreground/10 bg-surface/80 backdrop-blur-md sticky top-0 z-20">
          <h1 className="text-3xl font-black uppercase tracking-wide">Matches</h1>
          <p className="text-text-muted font-medium mt-1 text-sm">
            View your playing schedule and umpiring assignments.
          </p>

          {/* Main Tabs */}
          <div className="flex bg-surface-elevated border border-border p-1 mt-6 rounded-xl max-w-sm shadow-sm">
            <button
              onClick={() => setActiveTab('playing')}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                activeTab === 'playing' ? 'bg-primary text-black shadow-md' : 'text-text-muted hover:text-foreground'
              }`}
            >
              Playing ({userMatches.length})
            </button>
            <button
              onClick={() => setActiveTab('umpiring')}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                activeTab === 'umpiring' ? 'bg-red-500 text-white shadow-md' : 'text-text-muted hover:text-foreground'
              }`}
            >
              Umpiring ({umpireMatches.length})
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-4 max-w-4xl mx-auto space-y-6">
          {loading && (
            <div className="flex justify-center items-center py-20 text-text-muted">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-sm font-medium tracking-wide">Loading match schedule...</p>
              </div>
            </div>
          )}

          {!loading && activeTab === 'playing' && pendingLineups.length > 0 && (
            <div className="mb-8">
              <h2 className="text-sm font-black uppercase tracking-widest text-orange-500 mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> Action Required
              </h2>
              <div className="space-y-4">
                {pendingLineups.map((match) => {
                  const btnProps = getLineupButtonProps(match);
                  const { date, time } = formatMatchDateTime(match);

                  return (
                    <div
                      key={match.id}
                      className={`border rounded-2xl p-6 flex flex-col justify-between gap-6 transition-colors group ${btnProps.cardBg}`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <span
                            className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${btnProps.badgeColor}`}
                          >
                            {btnProps.statusText}
                          </span>
                          <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                            Team Event
                          </span>
                        </div>
                        <h3 className="text-xl font-black tracking-tight mb-1 transition-colors group-hover:text-primary">
                          {match.teamAName && match.teamBName
                            ? `${match.teamAName} vs ${match.teamBName}`
                            : `Team Event Match #${match.id}`}
                        </h3>
                        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-text-muted mt-3">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-primary" /> {date}
                          </div>
                          {time && (
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-amber-400" /> {time}
                            </div>
                          )}
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-emerald-400" />{' '}
                            {match.courtName || (match.courtId ? `Court ${match.courtId}` : 'Court TBD')}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col justify-center pt-4 border-t border-border shrink-0">
                        <button
                          onClick={() => router.push(`/home/team-events/${match.uuid}/lineup`)}
                          className={`w-full px-5 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 ${btnProps.color}`}
                        >
                          {btnProps.icon} {btnProps.text}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Playing Tab */}
          {!loading && activeTab === 'playing' && (
            <div>
              <h2 className="text-xs font-black uppercase tracking-widest text-text-muted mb-4">Playing Matches</h2>
              <div className="space-y-4">
                {userMatches.filter((m) => m.status !== 'WAITING_FOR_LINEUPS').length === 0 ? (
                  <div className="text-center py-12 text-text-muted text-sm font-semibold bg-surface rounded-2xl border border-border">
                    No upcoming or past playing matches found.
                  </div>
                ) : (
                  userMatches
                    .filter((m) => m.status !== 'WAITING_FOR_LINEUPS')
                    .map((match) => {
                      const { date, time } = formatMatchDateTime(match);
                      const isLive = match.status === 'LIVE';
                      const isCompleted = match.status === 'COMPLETED';

                      return (
                        <div
                          key={match.id}
                          className="relative bg-surface-elevated border border-border/80 rounded-2xl p-6 flex flex-col gap-5 hover:border-primary/50 shadow-md transition-all group overflow-hidden"
                        >
                          <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-primary to-emerald-400"></div>

                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-3 flex-wrap">
                              <span
                                className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
                                  isLive
                                    ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                    : isCompleted
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : 'bg-primary/10 text-primary border border-primary/20'
                                }`}
                              >
                                {isLive ? 'LIVE NOW' : match.status || 'SCHEDULED'}
                              </span>
                              <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
                                {match.sportType || 'Badminton'} {match.poolName ? `• ${match.poolName}` : ''}
                              </span>
                            </div>

                            <h3 className="text-xl font-bold text-foreground tracking-tight group-hover:text-primary transition-colors mb-2">
                              {match.tournamentName || `Tournament #${match.tournamentId}`}
                            </h3>

                            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-text-muted mt-2">
                              <div className="flex items-center gap-1.5 bg-background/50 px-3 py-1.5 rounded-lg border border-border/40">
                                <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                                <span>{date}</span>
                              </div>
                              <div className="flex items-center gap-1.5 bg-background/50 px-3 py-1.5 rounded-lg border border-border/40">
                                <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                <span>{time}</span>
                              </div>
                              <div className="flex items-center gap-1.5 bg-background/50 px-3 py-1.5 rounded-lg border border-border/40">
                                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                <span>{match.courtName || (match.courtId ? `Court ${match.courtId}` : 'Court TBD')}</span>
                              </div>
                            </div>
                          </div>

                          <div className="relative bg-gradient-to-r from-surface/90 via-surface-elevated to-surface/90 p-4 rounded-2xl border border-border/80 shadow-inner overflow-hidden">
                            <div className="flex items-center justify-between mb-3 px-1">
                              <span className="text-[9px] font-black text-text-muted uppercase tracking-widest flex items-center gap-1.5">
                                <Trophy className="w-3.5 h-3.5 text-primary" /> Head-to-Head Matchup
                              </span>
                              <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                Court Ready
                              </span>
                            </div>

                            <div className="relative flex items-center justify-between gap-3 px-1">
                              <div className="flex-1 min-w-0 pr-1">
                                {renderTeamName(match.teamAName, 'Team A', 'left')}
                              </div>

                              <div className="shrink-0 z-10 mx-1">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary via-emerald-400 to-cyan-400 text-black font-black text-xs flex items-center justify-center shadow-lg shadow-primary/25 border-2 border-background ring-4 ring-background">
                                  VS
                                </div>
                              </div>

                              <div className="flex-1 min-w-0 pl-1">
                                {renderTeamName(match.teamBName, 'Team B', 'right')}
                              </div>
                            </div>
                          </div>

                          {(isLive || isCompleted) && (
                            <button
                              onClick={() => router.push(`/live-score/${match.uuid}`)}
                              className={`w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 border ${
                                isLive
                                  ? 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20 shadow-sm'
                                  : 'bg-surface-elevated text-emerald-400 border-emerald-500/30 hover:border-emerald-500/60 shadow-sm'
                              }`}
                            >
                              <Trophy className="w-4 h-4" />
                              {isLive ? 'Watch Live Court & Score' : 'View Match & Score Details'}
                            </button>
                          )}
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          )}

          {/* Umpiring Tab */}
          {!loading && activeTab === 'umpiring' && (
            <div>
              <h2 className="text-xs font-black uppercase tracking-widest text-text-muted mb-4">
                Umpiring Assignments
              </h2>

              {umpireMatches.length === 0 ? (
                <div className="bg-surface border border-border rounded-2xl p-12 text-center text-text-muted">
                  <Shield className="w-12 h-12 text-text-muted/40 mx-auto mb-3" />
                  <p className="text-base font-bold text-foreground mb-1">No Umpiring Assignments</p>
                  <p className="text-xs text-text-muted max-w-sm mx-auto">
                    When a tournament organizer assigns your registered phone number as an umpire to a match, it will
                    appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {umpireMatches.map((match) => {
                    const { date, time } = formatMatchDateTime(match);
                    const isLive = match.status === 'LIVE';
                    const isCompleted = match.status === 'COMPLETED';

                    return (
                      <div
                        key={match.id}
                        className="relative bg-surface-elevated border border-border/80 hover:border-red-500/50 rounded-2xl p-6 flex flex-col gap-5 shadow-lg hover:shadow-red-500/5 transition-all group overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-red-500 via-rose-500 to-amber-500"></div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-3 flex-wrap">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-red-500/10 text-red-400 border border-red-500/30">
                              <Shield className="w-3 h-3" /> Assigned Umpire
                            </span>
                            {match.sportType && (
                              <span className="px-2.5 py-1 bg-surface border border-border rounded-md text-[10px] font-bold uppercase tracking-wider text-text-muted">
                                {match.sportType}
                              </span>
                            )}
                            {isLive && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-red-500 text-white animate-pulse">
                                LIVE NOW
                              </span>
                            )}
                            {isCompleted && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                <Trophy className="w-3 h-3" /> COMPLETED
                              </span>
                            )}
                          </div>

                          <h3 className="text-xl font-bold text-foreground tracking-tight group-hover:text-red-400 transition-colors mb-2">
                            {match.tournamentName || `Tournament #${match.tournamentId}`}
                          </h3>

                          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-text-muted mt-3">
                            <div className="flex items-center gap-1.5 bg-background/60 px-3 py-1.5 rounded-lg border border-border/50">
                              <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                              <span>{date}</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-background/60 px-3 py-1.5 rounded-lg border border-border/50">
                              <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span>{time}</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-background/60 px-3 py-1.5 rounded-lg border border-border/50">
                              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <span>{match.courtName || (match.courtId ? `Court ${match.courtId}` : 'Court TBD')}</span>
                            </div>
                          </div>
                        </div>

                        <div className="relative bg-gradient-to-r from-surface/90 via-surface-elevated to-surface/90 p-4 rounded-2xl border border-border/80 shadow-inner overflow-hidden">
                          <div className="flex items-center justify-between mb-3 px-1">
                            <span className="text-[9px] font-black text-text-muted uppercase tracking-widest flex items-center gap-1.5">
                              <Shield className="w-3.5 h-3.5 text-red-400" /> Umpire Fixture
                            </span>
                            <span className="text-[9px] font-black uppercase tracking-wider text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                              Assigned
                            </span>
                          </div>

                          <div className="relative flex items-center justify-between gap-3 px-1">
                            <div className="flex-1 min-w-0 pr-1">
                              {renderTeamName(match.teamAName, 'Team A', 'left')}
                            </div>

                            <div className="shrink-0 z-10 mx-1">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-red-500 via-rose-500 to-amber-500 text-white font-black text-xs flex items-center justify-center shadow-lg shadow-red-500/30 border-2 border-background ring-4 ring-background">
                                VS
                              </div>
                            </div>

                            <div className="flex-1 min-w-0 pl-1">
                              {renderTeamName(match.teamBName, 'Team B', 'right')}
                            </div>
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
                            className="w-full py-3.5 bg-surface-elevated hover:bg-surface border border-emerald-500/30 hover:border-emerald-500/60 text-emerald-400 font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                          >
                            <Trophy className="w-4 h-4 text-emerald-400" /> View Match &amp; Score Details
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
                            className="w-full py-3.5 bg-red-500 hover:bg-red-600 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-red-500/20 active:scale-95 flex items-center justify-center gap-2"
                          >
                            <Activity className="w-4 h-4 animate-pulse" /> {isLive ? 'Resume Scoring' : 'Start Scoring'}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          2. DESKTOP VIEW ONLY (hidden on mobile, visible on md and above)
             - SLEEK DESKTOP HORIZONTAL SCROLLING TRACKS FOR MATCHES & UMPIRING
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="hidden md:block min-h-screen pb-20 bg-background">
        {/* Desktop Header Command Bar */}
        <div
          className="border-b px-8 py-8 bg-gradient-to-b from-card/70 via-card/30 to-background"
          style={{ borderColor: 'var(--athlon-border)' }}
        >
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between gap-6 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shadow-lg shadow-primary/10">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-foreground">
                    My Matches &amp; Schedule
                  </h1>
                  <p className="text-xs text-foreground/50">
                    Track your upcoming tournament fixtures, playing schedule, and umpiring duties
                  </p>
                </div>
              </div>

              {/* Segmented Filter Pills */}
              <div
                className="p-1 rounded-2xl border flex items-center gap-1.5"
                style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
              >
                <button
                  onClick={() => setActiveTab('playing')}
                  className={`flex items-center gap-2 py-2 px-5 rounded-xl text-xs font-black transition-all ${
                    activeTab === 'playing'
                      ? 'bg-primary text-black shadow-md shadow-primary/25 scale-[1.02]'
                      : 'text-foreground/70 hover:text-foreground hover:bg-white/[0.04]'
                  }`}
                >
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Playing Matches</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-black shrink-0 ${
                      activeTab === 'playing' ? 'bg-black/20 text-black' : 'bg-white/10 text-foreground/50'
                    }`}
                  >
                    {userMatches.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('umpiring')}
                  className={`flex items-center gap-2 py-2 px-5 rounded-xl text-xs font-black transition-all ${
                    activeTab === 'umpiring'
                      ? 'bg-red-500 text-white shadow-lg shadow-red-500/25 scale-[1.02]'
                      : 'text-foreground/70 hover:text-foreground hover:bg-white/[0.04]'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Umpiring Assignments</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-black shrink-0 ${
                      activeTab === 'umpiring' ? 'bg-black/20 text-white' : 'bg-white/10 text-foreground/50'
                    }`}
                  >
                    {umpireMatches.length}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Main Tracks (Horizontal Scrolling) */}
        <main className="max-w-7xl mx-auto px-8 py-8 space-y-12">
          {loading ? (
            <div className="py-24 text-center text-foreground/50 text-xs font-bold uppercase tracking-widest flex flex-col items-center justify-center gap-3">
              <div className="w-9 h-9 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <span>Loading match schedule...</span>
            </div>
          ) : (
            <div className="space-y-12">
              {/* 1. Action Required: Pending Lineups (Horizontal Scroll) */}
              {activeTab === 'playing' && pendingLineups.length > 0 && (
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
                        onClick={() => scrollContainer(lineupsTrackRef, 'left')}
                        className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                        style={{ borderColor: 'var(--athlon-border)' }}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => scrollContainer(lineupsTrackRef, 'right')}
                        className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                        style={{ borderColor: 'var(--athlon-border)' }}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div
                    ref={lineupsTrackRef}
                    className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 snap-x scroll-px-8 hide-scrollbar -mx-8 px-8"
                  >
                    {pendingLineups.map((match) => {
                      const btnProps = getLineupButtonProps(match);
                      const { date, time } = formatMatchDateTime(match);

                      return (
                        <div key={match.id} className="snap-start shrink-0 w-[380px]">
                          <div
                            className={`p-6 rounded-[28px] border space-y-4 h-full flex flex-col justify-between shadow-xl transition-all ${btnProps.cardBg}`}
                          >
                            <div className="flex items-center justify-between">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${btnProps.badgeColor}`}
                              >
                                {btnProps.statusText}
                              </span>
                              <span className="text-xs text-foreground/50 font-bold">Team Tie Event</span>
                            </div>

                            <div>
                              <h3 className="text-base font-black text-foreground">
                                {match.teamAName && match.teamBName
                                  ? `${match.teamAName} vs ${match.teamBName}`
                                  : `Team Event #${match.id}`}
                              </h3>
                              <div className="flex flex-wrap items-center gap-3 text-xs text-foreground/60 mt-2">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5 text-primary" /> {date}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5 text-amber-400" /> {time}
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />{' '}
                                  {match.courtName || (match.courtId ? `Court ${match.courtId}` : 'Court TBD')}
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => router.push(`/home/team-events/${match.uuid}/lineup`)}
                              className={`w-full py-2.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md ${btnProps.color}`}
                            >
                              {btnProps.icon} <span>{btnProps.text}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* 2. Playing Matches Track (Horizontal Scroll) */}
              {activeTab === 'playing' && (
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Trophy className="w-5 h-5 text-primary" />
                      <div>
                        <h2 className="text-lg font-black text-foreground">
                          Playing Fixtures ({userMatches.filter((m) => m.status !== 'WAITING_FOR_LINEUPS').length})
                        </h2>
                        <p className="text-xs text-foreground/50">
                          Upcoming court ties, active live games, and finished scorecards
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => scrollContainer(playingTrackRef, 'left')}
                        className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                        style={{ borderColor: 'var(--athlon-border)' }}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => scrollContainer(playingTrackRef, 'right')}
                        className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                        style={{ borderColor: 'var(--athlon-border)' }}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {userMatches.filter((m) => m.status !== 'WAITING_FOR_LINEUPS').length === 0 ? (
                    <div
                      className="text-center py-20 rounded-[32px] border p-8 space-y-3 bg-card"
                      style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                    >
                      <Trophy className="w-12 h-12 text-foreground/30 mx-auto" />
                      <h3 className="text-base font-black text-foreground">No Playing Matches Scheduled</h3>
                      <p className="text-xs text-foreground/50">
                        When you register for a tournament or team championship, your match fixtures will appear here.
                      </p>
                    </div>
                  ) : (
                    <div
                      ref={playingTrackRef}
                      className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 snap-x scroll-px-8 hide-scrollbar -mx-8 px-8"
                    >
                      {userMatches
                        .filter((m) => m.status !== 'WAITING_FOR_LINEUPS')
                        .map((match) => {
                          const { date, time } = formatMatchDateTime(match);
                          const isLive = match.status === 'LIVE' || match.status === 'IN_PROGRESS';
                          const isCompleted = match.status === 'COMPLETED';

                          return (
                            <div key={match.id} className="snap-start shrink-0 w-[380px]">
                              <div
                                className="p-6 rounded-[28px] border bg-card relative overflow-hidden h-full flex flex-col justify-between shadow-xl space-y-4 hover:border-primary/50 transition-all group"
                                style={{
                                  backgroundColor: 'var(--athlon-card)',
                                  borderColor: 'var(--athlon-border)',
                                }}
                              >
                                <div
                                  className={`h-1 w-full absolute top-0 left-0 right-0 ${
                                    isLive
                                      ? 'bg-red-500 animate-pulse'
                                      : isCompleted
                                      ? 'bg-emerald-500'
                                      : 'bg-primary'
                                  }`}
                                />

                                <div className="space-y-2">
                                  <div className="flex items-center justify-between text-xs pt-1">
                                    <span
                                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                        isLive
                                          ? 'bg-red-500/15 text-red-400 border-red-500/25 animate-pulse'
                                          : isCompleted
                                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
                                          : 'bg-primary/10 text-primary border border-primary/20'
                                      }`}
                                    >
                                      {isLive ? '● LIVE NOW' : match.status || 'SCHEDULED'}
                                    </span>
                                    <span className="font-mono text-[11px] text-foreground/50">
                                      {match.courtName || (match.courtId ? `Court ${match.courtId}` : 'Court TBD')}
                                    </span>
                                  </div>

                                  <h3 className="text-sm font-black text-foreground truncate">
                                    {match.tournamentName || `Tournament #${match.tournamentId}`}
                                  </h3>
                                </div>

                                <div
                                  className="p-4 rounded-2xl border space-y-3 bg-surface/50"
                                  style={{ borderColor: 'var(--athlon-border)' }}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="min-w-0">
                                      {renderTeamName(match.teamAName, 'Team A', 'left')}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <div className="h-[1px] flex-1 bg-foreground/10" />
                                    <span className="text-[9px] font-black text-primary uppercase tracking-widest bg-surface px-2 py-0.5 rounded-full border border-foreground/10">
                                      VS
                                    </span>
                                    <div className="h-[1px] flex-1 bg-foreground/10" />
                                  </div>

                                  <div className="flex items-center justify-between">
                                    <div className="min-w-0">
                                      {renderTeamName(match.teamBName, 'Team B', 'right')}
                                    </div>
                                  </div>
                                </div>

                                <div
                                  className="flex items-center justify-between text-xs text-foreground/60 pt-2 border-t"
                                  style={{ borderColor: 'var(--athlon-border)' }}
                                >
                                  <div className="flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                                    <span>
                                      {date} • {time}
                                    </span>
                                  </div>

                                  {(isLive || isCompleted) && (
                                    <button
                                      onClick={() => router.push(`/live-score/${match.uuid}`)}
                                      className="text-[11px] font-black text-primary hover:underline flex items-center gap-0.5"
                                    >
                                      Scorecard <ChevronRight className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </section>
              )}

              {/* 3. Umpiring Assignments Track (Horizontal Scroll) */}
              {activeTab === 'umpiring' && (
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Shield className="w-5 h-5 text-red-400" />
                      <div>
                        <h2 className="text-lg font-black text-foreground">
                          Umpiring Assignments ({umpireMatches.length})
                        </h2>
                        <p className="text-xs text-foreground/50">
                          Digital scoring duties and court officiating console
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => scrollContainer(umpireTrackRef, 'left')}
                        className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                        style={{ borderColor: 'var(--athlon-border)' }}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => scrollContainer(umpireTrackRef, 'right')}
                        className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                        style={{ borderColor: 'var(--athlon-border)' }}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {umpireMatches.length === 0 ? (
                    <div
                      className="text-center py-20 rounded-[32px] border p-8 space-y-3 bg-card"
                      style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                    >
                      <Shield className="w-12 h-12 text-foreground/30 mx-auto" />
                      <h3 className="text-base font-black text-foreground">No Umpiring Duties Assigned</h3>
                      <p className="text-xs text-foreground/50">
                        When an event organizer assigns your phone number as an official umpire, your matches will appear
                        here with instant scoring controls.
                      </p>
                    </div>
                  ) : (
                    <div
                      ref={umpireTrackRef}
                      className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 snap-x scroll-px-8 hide-scrollbar -mx-8 px-8"
                    >
                      {umpireMatches.map((match) => {
                        const { date, time } = formatMatchDateTime(match);
                        const isLive = match.status === 'LIVE' || match.status === 'IN_PROGRESS';
                        const isCompleted = match.status === 'COMPLETED';

                        return (
                          <div key={match.id || match.uuid} className="snap-start shrink-0 w-[380px]">
                            <div
                              className="p-6 rounded-[28px] border bg-card relative overflow-hidden h-full flex flex-col justify-between shadow-xl space-y-4 hover:border-red-500/50 transition-all group"
                              style={{
                                backgroundColor: 'var(--athlon-card)',
                                borderColor: 'var(--athlon-border)',
                              }}
                            >
                              <div className="h-1 w-full bg-gradient-to-r from-red-500 via-rose-500 to-amber-500 absolute top-0 left-0 right-0" />

                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs pt-1">
                                  <span
                                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                      isLive
                                        ? 'bg-red-500/15 text-red-400 border-red-500/25 animate-pulse'
                                        : isCompleted
                                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
                                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                                    }`}
                                  >
                                    {isLive ? '● LIVE' : isCompleted ? 'Completed' : 'Assigned Umpire'}
                                  </span>
                                  <span className="font-mono text-[11px] text-foreground/50">
                                    {match.courtName || (match.courtId ? `Court ${match.courtId}` : 'Court TBD')}
                                  </span>
                                </div>

                                <h3 className="text-sm font-black text-foreground truncate">
                                  {match.tournamentName || `Tournament #${match.tournamentId}`}
                                </h3>
                              </div>

                              <div
                                className="p-4 rounded-2xl border space-y-3 bg-surface/50"
                                style={{ borderColor: 'var(--athlon-border)' }}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="min-w-0">
                                    {renderTeamName(match.teamAName, 'Team A', 'left')}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <div className="h-[1px] flex-1 bg-foreground/10" />
                                  <span className="text-[9px] font-black text-red-400 uppercase tracking-widest bg-surface px-2 py-0.5 rounded-full border border-foreground/10">
                                    VS
                                  </span>
                                  <div className="h-[1px] flex-1 bg-foreground/10" />
                                </div>

                                <div className="flex items-center justify-between">
                                  <div className="min-w-0">
                                    {renderTeamName(match.teamBName, 'Team B', 'right')}
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-3 pt-2 border-t" style={{ borderColor: 'var(--athlon-border)' }}>
                                <div className="flex items-center justify-between text-xs text-foreground/60">
                                  <div className="flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                                    <span>
                                      {date} • {time}
                                    </span>
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
                                    className="w-full py-2.5 rounded-xl border border-emerald-500/30 text-emerald-400 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-emerald-500/10 transition-all"
                                  >
                                    <Trophy className="w-4 h-4" /> <span>View Scorecard</span>
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
                                    className="w-full py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-red-500/25 active:scale-95 transition-all"
                                  >
                                    <Activity className="w-4 h-4 animate-pulse" />{' '}
                                    <span>{isLive ? 'Resume Digital Scoring' : 'Start Scoring'}</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
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
