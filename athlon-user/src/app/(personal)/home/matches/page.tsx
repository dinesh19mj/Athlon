'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  Layers,
  ArrowRight,
  Medal,
  Flame,
  CheckCircle2,
  ExternalLink,
  Search,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { MatchService, Match } from '@/lib/api/matches';
import {
  TournamentService,
  RegistrationService,
  Tournament,
  Registration,
} from '@/lib/api/tournaments';
import { AuthService } from '@/lib/api/auth';

interface EnrichedTournament {
  id: string | number;
  tournamentId?: number;
  tournamentUuid?: string;
  name: string;
  sport?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  poster?: string;
  status: string;
  tournamentType?: string;
  registration?: Registration;
  userMatches: Match[];
  completedMatchesCount: number;
  totalMatchesCount: number;
}

function parseSetScores(setScores: any): string[] {
  if (!setScores) return [];
  if (Array.isArray(setScores)) {
    return setScores.map((s) => {
      if (typeof s === 'string') return s;
      if (typeof s === 'object' && s !== null) {
        if ('pointsA' in s && 'pointsB' in s) return `${s.pointsA}-${s.pointsB}`;
        if ('teamAScore' in s && 'teamBScore' in s) return `${s.teamAScore}-${s.teamBScore}`;
        if ('scoreA' in s && 'scoreB' in s) return `${s.scoreA}-${s.scoreB}`;
      }
      return String(s);
    });
  }
  if (typeof setScores === 'string') {
    const trimmed = setScores.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        return parseSetScores(parsed);
      } catch {
        // ignore
      }
    }
    if (trimmed.includes(',')) {
      return trimmed
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [trimmed];
  }
  return [];
}

export default function PlayerMatchesPage() {
  const router = useRouter();
  const { userId, userUuid, token } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'tournaments' | 'matches' | 'umpiring'>('tournaments');
  const [tournamentFilter, setTournamentFilter] = useState<'ALL' | 'COMPLETED' | 'LIVE' | 'REGISTERED'>('ALL');
  const [matchFilter, setMatchFilter] = useState<'ALL' | 'COMPLETED' | 'LIVE' | 'UPCOMING'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [userMatches, setUserMatches] = useState<Match[]>([]);
  const [umpireMatches, setUmpireMatches] = useState<Match[]>([]);
  const [userTournaments, setUserTournaments] = useState<EnrichedTournament[]>([]);
  const [loading, setLoading] = useState(true);

  const tournamentsTrackRef = useRef<HTMLDivElement>(null);
  const matchesTrackRef = useRef<HTMLDivElement>(null);
  const umpireTrackRef = useRef<HTMLDivElement>(null);
  const lineupsTrackRef = useRef<HTMLDivElement>(null);

  const scrollContainer = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const loadData = async () => {
      try {
        // 1. Fetch user matches
        let matches: Match[] = [];
        try {
          const matchRes = await MatchService.getByUser(Number(userId));
          if (matchRes && matchRes.data) {
            matches = matchRes.data;
          }
        } catch (e) {
          console.error('Failed to load user matches:', e);
        }

        // Sort user matches: Live first, then Scheduled by date, then Completed
        const sortedMatches = [...matches].sort((a: Match, b: Match) => {
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
        setUserMatches(sortedMatches);

        // 2. Fetch user registrations & all tournaments
        let registrations: Registration[] = [];
        let allTournaments: Tournament[] = [];
        try {
          const [regRes, tourRes] = await Promise.all([
            RegistrationService.getByUser(userId).catch(() => ({ data: [] as Registration[] })),
            TournamentService.getAll().catch(() => ({ data: [] as Tournament[] })),
          ]);
          registrations = regRes?.data || [];
          allTournaments = tourRes?.data || [];
        } catch (e) {
          console.error('Failed to load registrations or tournaments:', e);
        }

        // 3. Map into EnrichedTournaments
        const tourMap = new Map<string | number, EnrichedTournament>();

        // Add from registrations
        registrations.forEach((reg) => {
          const tDetail = allTournaments.find(
            (t) => t.tournamentId === reg.tournamentId || (reg.tournamentId && t.tournamentId === reg.tournamentId)
          );
          const key = reg.tournamentId || reg.tournamentId || reg.uuid;
          const tUuid = tDetail?.tournamentUuid || reg.categoryUuid || '';

          const existing = tourMap.get(key) || {
            id: key,
            tournamentId: reg.tournamentId,
            tournamentUuid: tUuid,
            name: tDetail?.name || `Tournament #${reg.tournamentId}`,
            sport: tDetail?.sport || 'Badminton',
            startDate: tDetail?.startDate,
            endDate: tDetail?.endDate,
            location: tDetail?.location || 'Venue TBA',
            poster: tDetail?.poster,
            status: tDetail?.status || reg.status || 'REGISTERED',
            tournamentType: tDetail?.tournamentType,
            registration: reg,
            userMatches: [],
            completedMatchesCount: 0,
            totalMatchesCount: 0,
          };
          existing.registration = reg;
          tourMap.set(key, existing);
        });

        // Add / correlate from matches
        sortedMatches.forEach((m) => {
          const key = m.tournamentId || m.tournamentUuid || m.tournamentName || 'unknown';
          let tour = tourMap.get(key);
          if (!tour) {
            // Find in allTournaments
            const tDetail = allTournaments.find(
              (t) =>
                (m.tournamentId && t.tournamentId === m.tournamentId) ||
                (m.tournamentUuid && t.tournamentUuid === m.tournamentUuid) ||
                (m.tournamentName && t.name?.toLowerCase() === m.tournamentName?.toLowerCase())
            );

            tour = {
              id: key,
              tournamentId: m.tournamentId || tDetail?.tournamentId,
              tournamentUuid: m.tournamentUuid || tDetail?.tournamentUuid || '',
              name: m.tournamentName || tDetail?.name || `Tournament #${m.tournamentId || ''}`,
              sport: m.sportType || tDetail?.sport || 'Badminton',
              startDate: tDetail?.startDate || m.matchDate || undefined,
              endDate: tDetail?.endDate,
              location: tDetail?.location || m.courtName || 'Venue TBA',
              poster: tDetail?.poster,
              status: tDetail?.status || (m.status === 'COMPLETED' ? 'COMPLETED' : 'ONGOING'),
              tournamentType: m.tournamentType || tDetail?.tournamentType,
              userMatches: [],
              completedMatchesCount: 0,
              totalMatchesCount: 0,
            };
            tourMap.set(key, tour);
          }

          // Avoid duplicate matches
          if (!tour.userMatches.some((x) => x.id === m.id || (x.uuid && x.uuid === m.uuid))) {
            tour.userMatches.push(m);
            tour.totalMatchesCount += 1;
            if (m.status === 'COMPLETED') {
              tour.completedMatchesCount += 1;
            }
          }
        });

        const tourList = Array.from(tourMap.values()).map((tour) => {
          // Compute refined status
          const isAllCompleted =
            tour.totalMatchesCount > 0 && tour.completedMatchesCount === tour.totalMatchesCount;
          const isAnyLive = tour.userMatches.some(
            (m) => m.status === 'LIVE' || m.status === 'IN_PROGRESS'
          );

          let finalStatus = tour.status;
          if (
            tour.status?.toUpperCase() === 'COMPLETED' ||
            tour.status?.toUpperCase() === 'FINISHED' ||
            isAllCompleted
          ) {
            finalStatus = 'COMPLETED';
          } else if (isAnyLive || tour.status?.toUpperCase() === 'LIVE') {
            finalStatus = 'LIVE';
          } else if (tour.status?.toUpperCase() === 'ONGOING' || tour.userMatches.length > 0) {
            finalStatus = 'ONGOING';
          } else {
            finalStatus = 'REGISTERED';
          }

          return { ...tour, status: finalStatus };
        });

        // Sort tournaments: Live first, Ongoing, then Registered, then Completed (most recent on top)
        tourList.sort((a, b) => {
          const rank = (s: string) => {
            if (s === 'LIVE') return 0;
            if (s === 'ONGOING') return 1;
            if (s === 'REGISTERED') return 2;
            if (s === 'COMPLETED') return 3;
            return 4;
          };
          if (rank(a.status) !== rank(b.status)) {
            return rank(a.status) - rank(b.status);
          }
          const dateA = a.startDate ? new Date(a.startDate).getTime() : 0;
          const dateB = b.startDate ? new Date(b.startDate).getTime() : 0;
          return dateB - dateA;
        });

        setUserTournaments(tourList);

        // 4. Fetch umpire matches if userUuid & token available
        if (userUuid && token) {
          try {
            const profileRes = await AuthService.getUserProfile(userUuid, token);
            if (profileRes?.data?.phone) {
              const uRes = await MatchService.getByUmpirePhone(profileRes.data.phone).catch(() => ({
                data: [],
              }));
              if (uRes?.data && Array.isArray(uRes.data)) {
                const sortedUmpire = [...uRes.data].sort((a: Match, b: Match) => {
                  const isACompleted = a.status === 'COMPLETED';
                  const isBCompleted = b.status === 'COMPLETED';
                  if (!isACompleted && isBCompleted) return -1;
                  if (isACompleted && !isBCompleted) return 1;
                  const isALive = a.status === 'LIVE' || a.status === 'IN_PROGRESS';
                  const isBLive = b.status === 'LIVE' || b.status === 'IN_PROGRESS';
                  if (isALive && !isBLive) return -1;
                  if (!isALive && isBLive) return 1;
                  return (typeof a.id === 'number' ? a.id : 0) - (typeof b.id === 'number' ? b.id : 0);
                });
                setUmpireMatches(sortedUmpire);
              }
            }
          } catch (e) {
            console.error('Failed to load umpire assignments:', e);
          }
        }
      } catch (err) {
        console.error('Error loading matches & tournaments page data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId, userUuid, token]);

  const pendingLineups = useMemo(
    () => userMatches.filter((m) => m.status === 'WAITING_FOR_LINEUPS'),
    [userMatches]
  );

  const completedMatches = useMemo(
    () => userMatches.filter((m) => m.status === 'COMPLETED'),
    [userMatches]
  );

  const liveMatches = useMemo(
    () => userMatches.filter((m) => m.status === 'LIVE' || m.status === 'IN_PROGRESS'),
    [userMatches]
  );

  const upcomingMatches = useMemo(
    () =>
      userMatches.filter(
        (m) =>
          m.status !== 'COMPLETED' &&
          m.status !== 'LIVE' &&
          m.status !== 'IN_PROGRESS' &&
          m.status !== 'WAITING_FOR_LINEUPS'
      ),
    [userMatches]
  );

  // Filtered lists
  const filteredTournaments = useMemo(() => {
    return userTournaments.filter((t) => {
      const matchText =
        !searchQuery ||
        t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.sport?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.location?.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchText) return false;
      if (tournamentFilter === 'ALL') return true;
      if (tournamentFilter === 'COMPLETED') return t.status === 'COMPLETED';
      if (tournamentFilter === 'LIVE') return t.status === 'LIVE' || t.status === 'ONGOING';
      if (tournamentFilter === 'REGISTERED') return t.status === 'REGISTERED';
      return true;
    });
  }, [userTournaments, tournamentFilter, searchQuery]);

  const filteredMatches = useMemo(() => {
    return userMatches.filter((m) => {
      const matchText =
        !searchQuery ||
        m.tournamentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.teamAName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.teamBName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.courtName?.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchText) return false;
      if (matchFilter === 'ALL') return true;
      if (matchFilter === 'COMPLETED') return m.status === 'COMPLETED';
      if (matchFilter === 'LIVE') return m.status === 'LIVE' || m.status === 'IN_PROGRESS';
      if (matchFilter === 'UPCOMING')
        return m.status !== 'COMPLETED' && m.status !== 'LIVE' && m.status !== 'IN_PROGRESS';
      return true;
    });
  }, [userMatches, matchFilter, searchQuery]);

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
      date: d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const renderTeamName = (name?: string, fallback: string = 'Team', align: 'left' | 'right' = 'left') => {
    if (!name)
      return (
        <span
          className={`text-[11px] sm:text-xs md:text-sm font-black text-foreground ${
            align === 'right' ? 'text-right' : 'text-left'
          }`}
        >
          {fallback}
        </span>
      );
    const parts = name.split(/\s*&\s*/);
    const isRight = align === 'right';

    return (
      <div className={`flex flex-col gap-1 min-w-0 ${isRight ? 'items-end' : 'items-start'}`}>
        {parts.map((p, i) => (
          <div
            key={i}
            className={`flex items-center gap-1.5 min-w-0 max-w-full ${
              isRight ? 'flex-row-reverse text-right' : 'flex-row text-left'
            }`}
          >
            <div
              className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shrink-0 ${
                isRight
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-primary/10 text-primary border border-primary/20'
              }`}
            >
              <User className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            </div>
            <span
              className="text-[11px] sm:text-xs md:text-sm font-extrabold text-foreground leading-tight tracking-tight min-w-0 break-words"
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
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-black pb-24 w-full max-w-full overflow-x-hidden">
      {/* ══════════════════════════════════════════════════════════════════════
          TOP STICKY HEADER & TABS (Mobile & Desktop)
         ══════════════════════════════════════════════════════════════════════ */}
      <header
        className="p-2.5 sm:p-4 md:px-8 md:py-5 border-b border-foreground/10 bg-surface/85 backdrop-blur-md sticky top-0 z-20 shadow-sm w-full max-w-full overflow-x-hidden"
      >
        <div className="max-w-7xl mx-auto space-y-2 sm:space-y-3 w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-4 w-full">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1 sm:p-1.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
                  <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                </span>
                <div>
                  <h1 className="text-sm sm:text-lg md:text-2xl font-black uppercase tracking-tight text-foreground leading-tight">
                    Tournaments &amp; Matches
                  </h1>
                  <p className="text-text-muted font-medium text-[9.5px] sm:text-xs md:text-sm leading-tight mt-0.5">
                    Your registered events, match fixtures, scores &amp; umpire duties
                  </p>
                </div>
              </div>
            </div>

            {/* 3 Main Segmented Action Tabs (Snug, full visibility without truncation) */}
            <div className="flex items-center bg-surface-elevated border border-border p-0.5 sm:p-1 rounded-xl sm:rounded-2xl shadow-sm w-full md:w-auto">
              {/* Tab 1: Tournament */}
              <button
                onClick={() => setActiveTab('tournaments')}
                className={`flex-1 md:flex-initial flex items-center justify-center gap-1 sm:gap-1.5 py-1.5 sm:py-2 px-1.5 sm:px-3 md:px-4 text-[9.5px] sm:text-xs font-black uppercase tracking-tight rounded-lg sm:rounded-xl transition-all whitespace-nowrap ${
                  activeTab === 'tournaments'
                    ? 'bg-primary text-black shadow-sm shadow-primary/25'
                    : 'text-text-muted hover:text-foreground'
                }`}
              >
                <Trophy className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 hidden xs:inline-block" />
                <span className="whitespace-nowrap">Tournament</span>
                <span
                  className={`text-[8.5px] sm:text-[10px] px-1 sm:px-1.5 py-0.2 rounded-full font-mono font-bold shrink-0 ${
                    activeTab === 'tournaments' ? 'bg-black/20 text-black' : 'bg-foreground/10 text-foreground/70'
                  }`}
                >
                  {userTournaments.length}
                </span>
              </button>

              {/* Tab 2: Matches */}
              <button
                onClick={() => setActiveTab('matches')}
                className={`flex-1 md:flex-initial flex items-center justify-center gap-1 sm:gap-1.5 py-1.5 sm:py-2 px-1.5 sm:px-3 md:px-4 text-[9.5px] sm:text-xs font-black uppercase tracking-tight rounded-lg sm:rounded-xl transition-all whitespace-nowrap ${
                  activeTab === 'matches'
                    ? 'bg-emerald-500 text-black shadow-sm shadow-emerald-500/25'
                    : 'text-text-muted hover:text-foreground'
                }`}
              >
                <Activity className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 hidden xs:inline-block" />
                <span className="whitespace-nowrap">Matches</span>
                <span
                  className={`text-[8.5px] sm:text-[10px] px-1 sm:px-1.5 py-0.2 rounded-full font-mono font-bold shrink-0 ${
                    activeTab === 'matches' ? 'bg-black/20 text-black' : 'bg-foreground/10 text-foreground/70'
                  }`}
                >
                  {userMatches.length}
                </span>
              </button>

              {/* Tab 3: Umpiring */}
              <button
                onClick={() => setActiveTab('umpiring')}
                className={`flex-1 md:flex-initial flex items-center justify-center gap-1 sm:gap-1.5 py-1.5 sm:py-2 px-1.5 sm:px-3 md:px-4 text-[9.5px] sm:text-xs font-black uppercase tracking-tight rounded-lg sm:rounded-xl transition-all whitespace-nowrap ${
                  activeTab === 'umpiring'
                    ? 'bg-red-500 text-white shadow-sm shadow-red-500/25'
                    : 'text-text-muted hover:text-foreground'
                }`}
              >
                <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 hidden xs:inline-block" />
                <span className="whitespace-nowrap">Umpiring</span>
                <span
                  className={`text-[8.5px] sm:text-[10px] px-1 sm:px-1.5 py-0.2 rounded-full font-mono font-bold shrink-0 ${
                    activeTab === 'umpiring' ? 'bg-black/20 text-white' : 'bg-foreground/10 text-foreground/70'
                  }`}
                >
                  {umpireMatches.length}
                </span>
              </button>
            </div>
          </div>

          {/* Sub-bar: Search & Filter Pills */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3 pt-1.5 border-t border-border/40 w-full max-w-full overflow-hidden">
            {/* Search Input */}
            <div className="relative w-full sm:w-72 min-w-0 shrink-0">
              <Search className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-text-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={
                  activeTab === 'tournaments'
                    ? 'Search tournaments or locations...'
                    : activeTab === 'matches'
                    ? 'Search matches, teams...'
                    : 'Search umpiring fixtures...'
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-background border border-border/80 pl-8 pr-2.5 py-1 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-medium text-foreground placeholder:text-text-muted/60 focus:outline-none focus:border-primary transition-all"
              />
            </div>

            {/* Filter Pills based on active tab */}
            {activeTab === 'tournaments' && (
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-0.5 sm:pb-0 hide-scrollbar max-w-full">
                {(
                  [
                    { id: 'ALL', label: 'All Tournaments', count: userTournaments.length },
                    {
                      id: 'COMPLETED',
                      label: 'Finished',
                      count: userTournaments.filter((t) => t.status === 'COMPLETED').length,
                    },
                    {
                      id: 'LIVE',
                      label: 'Live / Active',
                      count: userTournaments.filter((t) => t.status === 'LIVE' || t.status === 'ONGOING').length,
                    },
                    {
                      id: 'REGISTERED',
                      label: 'Registered',
                      count: userTournaments.filter((t) => t.status === 'REGISTERED').length,
                    },
                  ] as const
                ).map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setTournamentFilter(f.id)}
                    className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 border shrink-0 ${
                      tournamentFilter === f.id
                        ? 'bg-primary/15 text-primary border-primary/40 shadow-sm'
                        : 'bg-surface border-border/70 text-text-muted hover:text-foreground'
                    }`}
                  >
                    <span>{f.label}</span>
                    <span className="text-[9px] sm:text-[10px] opacity-70 font-mono">({f.count})</span>
                  </button>
                ))}
              </div>
            )}

            {activeTab === 'matches' && (
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-0.5 sm:pb-0 hide-scrollbar max-w-full">
                {(
                  [
                    { id: 'ALL', label: 'All Matches', count: userMatches.length },
                    {
                      id: 'LIVE',
                      label: 'Live',
                      count: liveMatches.length,
                    },
                    {
                      id: 'UPCOMING',
                      label: 'Upcoming',
                      count: upcomingMatches.length,
                    },
                    {
                      id: 'COMPLETED',
                      label: 'Finished',
                      count: completedMatches.length,
                    },
                  ] as const
                ).map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setMatchFilter(f.id)}
                    className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 border shrink-0 ${
                      matchFilter === f.id
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 shadow-sm'
                        : 'bg-surface border-border/70 text-text-muted hover:text-foreground'
                    }`}
                  >
                    <span>{f.label}</span>
                    <span className="text-[9px] sm:text-[10px] opacity-70 font-mono">({f.count})</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════════════════
          MAIN CONTENT AREA
         ══════════════════════════════════════════════════════════════════════ */}
      <main className="max-w-7xl mx-auto p-3 sm:p-4 md:px-8 md:py-8 w-full max-w-full overflow-x-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20 text-text-muted">
            <div className="flex flex-col items-center gap-2.5">
              <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
              <p className="text-[11px] font-bold uppercase tracking-wider">Loading tournaments &amp; matches...</p>
            </div>
          </div>
        ) : (
          <div>
            {/* ═════════════════════════════════════════════════════════════════
                TAB 1: TOURNAMENTS (Participated & Finished)
               ═════════════════════════════════════════════════════════════════ */}
            {activeTab === 'tournaments' && (
              <div className="space-y-4 sm:space-y-6">
                {filteredTournaments.length === 0 ? (
                  <div className="text-center py-14 sm:py-20 rounded-2xl sm:rounded-3xl border border-dashed border-border p-6 sm:p-8 space-y-3 sm:space-y-4 bg-surface/50">
                    <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-text-muted/30 mx-auto" />
                    <h3 className="text-sm sm:text-base font-black text-foreground uppercase tracking-wide">
                      No Tournaments Found
                    </h3>
                    <p className="text-[11px] sm:text-xs text-text-muted max-w-sm mx-auto">
                      {searchQuery
                        ? `No tournaments matching "${searchQuery}".`
                        : "You haven't participated in any tournaments yet under this filter."}
                    </p>
                    <Link
                      href="/home/tournaments"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-black font-black text-xs uppercase tracking-wider rounded-xl hover:scale-105 transition-all shadow-md shadow-primary/20"
                    >
                      Browse Upcoming Tournaments <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:gap-6">
                    {filteredTournaments.map((tour) => {
                      const isCompleted = tour.status === 'COMPLETED';
                      const isLive = tour.status === 'LIVE';
                      const isOngoing = tour.status === 'ONGOING';
                      const tournamentTargetUrl = `/tournaments/${tour.tournamentUuid || tour.id}`;

                      return (
                        <div
                          key={tour.id}
                          className="bg-surface-elevated border border-border/80 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 md:p-7 shadow-md hover:border-primary/40 transition-all group overflow-hidden relative"
                        >
                          {/* Top Status Gradient Bar */}
                          <div
                            className={`absolute top-0 left-0 right-0 h-1 sm:h-1.5 ${
                              isCompleted
                                ? 'bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-500'
                                : isLive
                                ? 'bg-gradient-to-r from-red-500 via-rose-500 to-amber-500 animate-pulse'
                                : 'bg-gradient-to-r from-primary to-emerald-400'
                            }`}
                          />

                          {/* Tournament Header */}
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 pb-3 sm:pb-5 border-b border-border/60">
                            <div className="space-y-1.5 sm:space-y-2 flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                                {/* Status Badge */}
                                <span
                                  className={`px-2 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1 border ${
                                    isCompleted
                                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-sm'
                                      : isLive
                                      ? 'bg-red-500/15 text-red-400 border-red-500/30 animate-pulse shadow-sm'
                                      : isOngoing
                                      ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
                                      : 'bg-primary/15 text-primary border-primary/30'
                                  }`}
                                >
                                  {isCompleted && <Trophy className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400" />}
                                  {isLive && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />}
                                  {isCompleted
                                    ? 'TOURNAMENT FINISHED'
                                    : isLive
                                    ? 'LIVE TOURNAMENT'
                                    : isOngoing
                                    ? 'IN PROGRESS'
                                    : 'REGISTERED ENTRY'}
                                </span>

                                {tour.sport && (
                                  <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-background border border-border text-text-muted">
                                    {tour.sport}
                                  </span>
                                )}

                                {tour.tournamentType && (
                                  <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-surface border border-border/70 text-text-muted">
                                    {tour.tournamentType.replace(/_/g, ' ')}
                                  </span>
                                )}
                              </div>

                              <h2 className="text-base sm:text-xl md:text-2xl font-black text-foreground tracking-tight group-hover:text-primary transition-colors">
                                {tour.name}
                              </h2>

                              {/* Dates & Location */}
                              <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 text-[11px] sm:text-xs font-semibold text-text-muted">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
                                  <span>
                                    {tour.startDate
                                      ? new Date(tour.startDate).toLocaleDateString('en-US', {
                                          month: 'short',
                                          day: 'numeric',
                                          year: 'numeric',
                                        })
                                      : 'Date TBA'}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400" />
                                  <span>{tour.location || 'Venue TBA'}</span>
                                </div>

                                {tour.registration && (
                                  <div className="flex items-center gap-1 bg-primary/5 px-2 py-0.5 rounded-lg border border-primary/20 text-primary text-[10px] sm:text-xs">
                                    <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                    <span>
                                      Entry: {tour.registration.teamName || tour.registration.category || 'Registered'}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* CTA Action Buttons */}
                            <div className="flex flex-wrap items-center gap-2 shrink-0">
                              <Link
                                href={tournamentTargetUrl}
                                className="px-3.5 py-2 rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-wider bg-primary text-black hover:bg-primary-hover active:scale-95 transition-all flex items-center gap-1.5 shadow-md shadow-primary/20"
                              >
                                <Trophy className="w-3.5 h-3.5" />
                                <span>View Full Result Page</span>
                              </Link>
                            </div>
                          </div>

                          {/* User Matches Inside This Tournament */}
                          <div className="pt-3.5 sm:pt-4 space-y-2.5 sm:space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <Activity className="w-3.5 h-3.5 text-primary" />
                                <h3 className="text-[11px] sm:text-xs md:text-sm font-black uppercase tracking-wider text-foreground">
                                  Your Matches ({tour.userMatches.length})
                                </h3>
                              </div>

                              {isCompleted && (
                                <span className="text-[9px] sm:text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                  All Concluded
                                </span>
                              )}
                            </div>

                            {tour.userMatches.length === 0 ? (
                              <div className="bg-surface/50 border border-border/60 rounded-xl sm:rounded-2xl p-4 sm:p-5 text-center text-[11px] sm:text-xs text-text-muted">
                                Fixtures and match schedule for this tournament will appear once draws are generated.
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5 sm:gap-3.5">
                                {tour.userMatches.map((m) => {
                                  const { date, time } = formatMatchDateTime(m);
                                  const mScores = parseSetScores(m.setScores);
                                  const isMLive = m.status === 'LIVE' || m.status === 'IN_PROGRESS';
                                  const isMCompleted = m.status === 'COMPLETED';

                                  return (
                                    <div
                                      key={m.id || m.uuid}
                                      className="bg-surface border border-border/80 rounded-xl sm:rounded-2xl p-3 sm:p-3.5 flex flex-col justify-between gap-2.5 hover:border-foreground/20 transition-all shadow-sm"
                                    >
                                      {/* Match Mini Header */}
                                      <div className="flex items-center justify-between text-xs text-text-muted">
                                        <span className="font-bold text-[9.5px] sm:text-[10px] uppercase tracking-wider text-foreground/80">
                                          {m.roundName || (m.roundNumber ? `Round ${m.roundNumber}` : 'Match Fixture')}
                                        </span>
                                        <span
                                          className={`px-1.5 sm:px-2 py-0.5 rounded-md text-[8.5px] sm:text-[9px] font-black uppercase tracking-wider border ${
                                            isMLive
                                              ? 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse'
                                              : isMCompleted
                                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
                                              : 'bg-foreground/5 text-text-muted border-foreground/10'
                                          }`}
                                        >
                                          {isMLive ? '● LIVE' : m.status || 'SCHEDULED'}
                                        </span>
                                      </div>

                                      {/* Teams Scoreboard Box */}
                                      <div className="bg-background/80 border border-border/60 rounded-lg sm:rounded-xl p-2.5 space-y-1.5">
                                        <div className="flex items-center justify-between gap-2">
                                          <div className="flex-1 min-w-0">
                                            {renderTeamName(m.teamAName, 'Team A', 'left')}
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-1.5">
                                          <div className="h-px flex-1 bg-border/60" />
                                          <span className="text-[8.5px] font-mono font-bold text-text-muted uppercase px-1 py-0.2 bg-surface rounded">
                                            VS
                                          </span>
                                          <div className="h-px flex-1 bg-border/60" />
                                        </div>

                                        <div className="flex items-center justify-between gap-2">
                                          <div className="flex-1 min-w-0">
                                            {renderTeamName(m.teamBName, 'Team B', 'left')}
                                          </div>
                                        </div>
                                      </div>

                                      {/* Scores if completed or live */}
                                      {mScores.length > 0 && (
                                        <div className="flex flex-wrap items-center gap-1 pt-0.5">
                                          <span className="text-[9px] sm:text-[10px] font-bold text-text-muted uppercase">
                                            Scores:
                                          </span>
                                          {mScores.map((score, idx) => (
                                            <span
                                              key={idx}
                                              className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-primary/10 text-primary border border-primary/25"
                                            >
                                              S{idx + 1}: {score}
                                            </span>
                                          ))}
                                        </div>
                                      )}

                                      {/* Match Footer */}
                                      <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-text-muted pt-1.5 border-t border-border/50">
                                        <div className="flex items-center gap-1">
                                          <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400" />
                                          <span>
                                            {date} • {time}
                                          </span>
                                        </div>

                                        {m.uuid && (
                                          <Link
                                            href={`/live-score/${m.uuid}`}
                                            className="font-bold text-primary hover:underline inline-flex items-center gap-0.5"
                                          >
                                            Scorecard <ChevronRight className="w-3 h-3" />
                                          </Link>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ═════════════════════════════════════════════════════════════════
                TAB 2: MATCHES (All, Live, Upcoming & Finished Fixtures)
               ═════════════════════════════════════════════════════════════════ */}
            {activeTab === 'matches' && (
              <div className="space-y-6 sm:space-y-8">
                {/* 1. Action Required (Captain Lineups) */}
                {pendingLineups.length > 0 && (
                  <div className="space-y-3 sm:space-y-4">
                    <h2 className="text-[11px] sm:text-xs md:text-sm font-black uppercase tracking-widest text-orange-500 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Action Required: Team Lineups ({pendingLineups.length})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      {pendingLineups.map((match) => {
                        const btnProps = getLineupButtonProps(match);
                        const { date, time } = formatMatchDateTime(match);

                        return (
                          <div
                            key={match.id}
                            className={`border rounded-2xl p-3.5 sm:p-4.5 flex flex-col justify-between gap-3 transition-all group ${btnProps.cardBg}`}
                          >
                            <div>
                              <div className="flex items-center justify-between mb-1.5">
                                <span
                                  className={`px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-black uppercase tracking-widest ${btnProps.badgeColor}`}
                                >
                                  {btnProps.statusText}
                                </span>
                                <span className="text-[9px] sm:text-[10px] font-bold text-text-muted uppercase">Team Event</span>
                              </div>

                              <h3 className="text-xs sm:text-sm md:text-base font-black tracking-tight mb-1.5 group-hover:text-primary transition-colors">
                                {match.teamAName && match.teamBName
                                  ? `${match.teamAName} vs ${match.teamBName}`
                                  : `Team Event Match #${match.id}`}
                              </h3>

                              <div className="flex flex-wrap items-center gap-2.5 text-[10.5px] sm:text-xs text-text-muted">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary" /> {date}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400" /> {time}
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => router.push(`/home/team-events/${match.uuid}/lineup`)}
                              className={`w-full py-2 px-3 text-xs font-black uppercase tracking-wider rounded-xl shadow-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all ${btnProps.color}`}
                            >
                              {btnProps.icon} {btnProps.text}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. Matches List */}
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm sm:text-base font-black uppercase tracking-wide text-foreground">
                        Match Schedule &amp; Results ({filteredMatches.length})
                      </h2>
                      <p className="text-[10.5px] sm:text-xs text-text-muted">
                        Full match details, sets scorelines, courts, and verified scorecards
                      </p>
                    </div>
                  </div>

                  {filteredMatches.length === 0 ? (
                    <div className="text-center py-12 sm:py-16 rounded-2xl sm:rounded-3xl border border-dashed border-border p-6 sm:p-8 space-y-2.5 sm:space-y-3 bg-surface/50">
                      <Activity className="w-8 h-8 sm:w-10 sm:h-10 text-text-muted/30 mx-auto" />
                      <h3 className="text-xs sm:text-sm font-black text-foreground uppercase tracking-wider">
                        No Matches Found
                      </h3>
                      <p className="text-[10.5px] sm:text-xs text-text-muted max-w-sm mx-auto">
                        No match fixtures match your current filter criteria.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 md:gap-5">
                      {filteredMatches.map((match) => {
                        const { date, time } = formatMatchDateTime(match);
                        const isLive = match.status === 'LIVE' || match.status === 'IN_PROGRESS';
                        const isCompleted = match.status === 'COMPLETED';
                        const mScores = parseSetScores(match.setScores);

                        return (
                          <div
                            key={match.id || match.uuid}
                            className="bg-surface-elevated border border-border/80 rounded-2xl p-3.5 sm:p-4.5 flex flex-col justify-between gap-3 shadow-sm hover:border-primary/50 transition-all group relative overflow-hidden"
                          >
                            <div
                              className={`absolute top-0 left-0 right-0 h-1 ${
                                isLive ? 'bg-red-500 animate-pulse' : isCompleted ? 'bg-emerald-500' : 'bg-primary'
                              }`}
                            />

                            <div>
                              {/* Match Status & Tournament Name */}
                              <div className="flex items-center justify-between gap-2 mb-1.5 pt-0.5">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider border ${
                                    isLive
                                      ? 'bg-red-500/15 text-red-400 border-red-500/25 animate-pulse'
                                      : isCompleted
                                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
                                      : 'bg-primary/10 text-primary border border-primary/20'
                                  }`}
                                >
                                  {isLive ? '● LIVE NOW' : match.status || 'SCHEDULED'}
                                </span>
                                <span className="text-[10px] sm:text-[11px] font-semibold text-text-muted truncate">
                                  {match.courtName || (match.courtId ? `Court ${match.courtId}` : 'Court TBD')}
                                </span>
                              </div>

                              <h3 className="text-xs sm:text-sm md:text-base font-black text-foreground tracking-tight group-hover:text-primary transition-colors mb-0.5 truncate">
                                {match.tournamentName || `Tournament #${match.tournamentId}`}
                              </h3>
                              <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2.5">
                                {match.sportType || 'Badminton'} {match.roundName ? `• ${match.roundName}` : ''}
                              </p>

                              {/* Head to head box */}
                              <div className="bg-background/80 border border-border/70 rounded-xl p-2.5 sm:p-3 space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="min-w-0 flex-1">
                                    {renderTeamName(match.teamAName, 'Team A', 'left')}
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5">
                                  <div className="h-px flex-1 bg-border/60" />
                                  <span className="text-[8.5px] font-mono font-black text-primary uppercase px-1.5 py-0.2 bg-surface rounded-full border border-border">
                                    VS
                                  </span>
                                  <div className="h-px flex-1 bg-border/60" />
                                </div>

                                <div className="flex items-center justify-between">
                                  <div className="min-w-0 flex-1">
                                    {renderTeamName(match.teamBName, 'Team B', 'right')}
                                  </div>
                                </div>
                              </div>

                              {/* Set Scores */}
                              {mScores.length > 0 && (
                                <div className="flex flex-wrap items-center gap-1 mt-2">
                                  <span className="text-[9px] sm:text-[10px] font-bold text-text-muted uppercase">Set Scores:</span>
                                  {mScores.map((s, idx) => (
                                    <span
                                      key={idx}
                                      className="px-1.5 py-0.2 rounded text-[9.5px] sm:text-[10px] font-mono font-bold bg-primary/10 text-primary border border-primary/20"
                                    >
                                      {s}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Footer info & scorecard button */}
                            <div className="space-y-2 pt-2 border-t border-border/60">
                              <div className="flex items-center justify-between text-[10.5px] sm:text-xs text-text-muted">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-amber-400" />
                                  <span>
                                    {date} • {time}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5">
                                {match.uuid && (
                                  <Link
                                    href={`/live-score/${match.uuid}`}
                                    className={`flex-1 py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-wider text-center flex items-center justify-center gap-1 transition-all shadow-sm ${
                                      isLive
                                        ? 'bg-red-500 hover:bg-red-600 text-white'
                                        : 'bg-surface hover:bg-surface-elevated border border-emerald-500/30 text-emerald-400'
                                    }`}
                                  >
                                    <Trophy className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                    <span>{isLive ? 'Watch Live Score' : 'Full Scorecard'}</span>
                                  </Link>
                                )}

                                {(match.tournamentUuid || match.tournamentId) && (
                                  <Link
                                    href={`/tournaments/${match.tournamentUuid || match.tournamentId}`}
                                    title="View Tournament Results"
                                    className="p-2 rounded-lg sm:rounded-xl border border-border/80 text-text-muted hover:text-foreground hover:bg-surface transition-all shrink-0"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </Link>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ═════════════════════════════════════════════════════════════════
                TAB 3: UMPIRING (Official Referee Assignments)
               ═════════════════════════════════════════════════════════════════ */}
            {activeTab === 'umpiring' && (
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm sm:text-base font-black uppercase tracking-wide text-foreground">
                      Umpiring Assignments ({umpireMatches.length})
                    </h2>
                    <p className="text-[10.5px] sm:text-xs text-text-muted">
                      Digital scoring duties and court officiating console
                    </p>
                  </div>
                </div>

                {umpireMatches.length === 0 ? (
                  <div className="bg-surface border border-border rounded-2xl sm:rounded-3xl p-10 sm:p-16 text-center text-text-muted space-y-2.5 sm:space-y-3">
                    <Shield className="w-10 h-10 sm:w-12 sm:h-12 text-text-muted/30 mx-auto" />
                    <h3 className="text-sm sm:text-base font-black text-foreground">No Umpiring Assignments</h3>
                    <p className="text-[10.5px] sm:text-xs text-text-muted max-w-sm mx-auto">
                      When a tournament organizer assigns your registered phone number as an official umpire, your
                      matches will appear here with instant digital scoring controls.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 md:gap-5">
                    {umpireMatches.map((match) => {
                      const { date, time } = formatMatchDateTime(match);
                      const isLive = match.status === 'LIVE' || match.status === 'IN_PROGRESS';
                      const isCompleted = match.status === 'COMPLETED';

                      return (
                        <div
                          key={match.id || match.uuid}
                          className="bg-surface-elevated border border-border/80 rounded-2xl p-3.5 sm:p-4.5 flex flex-col justify-between gap-3 shadow-sm hover:border-red-500/50 transition-all group relative overflow-hidden"
                        >
                          <div className="h-1 w-full bg-gradient-to-r from-red-500 via-rose-500 to-amber-500 absolute top-0 left-0 right-0" />

                          <div>
                            <div className="flex items-center justify-between text-xs pt-0.5 mb-1.5">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider border ${
                                  isLive
                                    ? 'bg-red-500/15 text-red-400 border-red-500/25 animate-pulse'
                                    : isCompleted
                                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
                                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                                }`}
                              >
                                {isLive ? '● LIVE' : isCompleted ? 'Completed' : 'Assigned Umpire'}
                              </span>
                              <span className="font-mono text-[10px] sm:text-[11px] text-text-muted">
                                {match.courtName || (match.courtId ? `Court ${match.courtId}` : 'Court TBD')}
                              </span>
                            </div>

                            <h3 className="text-xs sm:text-sm md:text-base font-black text-foreground truncate mb-0.5">
                              {match.tournamentName || `Tournament #${match.tournamentId}`}
                            </h3>
                            <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2.5">
                              {match.sportType || 'Badminton'}
                            </p>

                            <div className="bg-background/80 border border-border/70 rounded-xl p-2.5 sm:p-3 space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="min-w-0 flex-1">
                                  {renderTeamName(match.teamAName, 'Team A', 'left')}
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <div className="h-px flex-1 bg-border/60" />
                                <span className="text-[8.5px] font-mono font-black text-red-400 uppercase px-1.5 py-0.2 bg-surface rounded-full border border-border">
                                  VS
                                </span>
                                <div className="h-px flex-1 bg-border/60" />
                              </div>

                              <div className="flex items-center justify-between">
                                <div className="min-w-0 flex-1">
                                  {renderTeamName(match.teamBName, 'Team B', 'right')}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2 pt-2 border-t border-border/60">
                            <div className="flex items-center justify-between text-[10.5px] sm:text-xs text-text-muted">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-amber-400" />
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
                                className="w-full py-2 rounded-lg sm:rounded-xl border border-emerald-500/30 text-emerald-400 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-emerald-500/10 transition-all"
                              >
                                <Trophy className="w-3.5 h-3.5" /> <span>View Scorecard</span>
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
                                className="w-full py-2 rounded-lg sm:rounded-xl bg-red-500 hover:bg-red-600 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm shadow-red-500/25 active:scale-95 transition-all"
                              >
                                <Activity className="w-3.5 h-3.5 animate-pulse" />
                                <span>{isLive ? 'Resume Scoring' : 'Start Scoring'}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

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
