"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  MapPin,
  Phone,
  Calendar,
  Clock,
  Play,
  Save,
  Users,
  User,
  Trophy,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Search,
  Filter,
  X,
  RotateCcw,
  Layers,
  ShieldAlert,
  SlidersHorizontal,
  Loader2,
} from "lucide-react";
import {
  TournamentService,
  MatchService,
  RegistrationService,
  StreamConfigService,
  Tournament,
  Match,
  Registration,
  CourtConfig,
  RegistrationPlayer,
} from "@/lib/api/tournaments";
import { UserService, UserResponse } from "@/lib/api/user";

interface MatchSetupSettingsProps {
  tournamentId: string;
}

export function MatchSetupSettings({ tournamentId }: MatchSetupSettingsProps) {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [courts, setCourts] = useState<CourtConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [playerPhotos, setPlayerPhotos] = useState<Record<string, string>>({});
  const [umpireVerification, setUmpireVerification] = useState<
    Record<string, { checking?: boolean; valid?: boolean; name?: string; error?: string }>
  >({});

  useEffect(() => {
    const fetchPhotos = async () => {
      const phonesToFetch: string[] = [];
      registrations.forEach((reg) => {
        reg.players?.forEach((p) => {
          if (p.phoneNumber && !playerPhotos[p.phoneNumber]) {
            phonesToFetch.push(p.phoneNumber);
          }
        });
      });

      if (phonesToFetch.length === 0) return;

      const newPhotos: Record<string, string> = {};
      await Promise.all(
        phonesToFetch.map(async (phone) => {
          try {
            const res = await UserService.getUserByPhone(phone);
            if (res?.data?.photo) {
              newPhotos[phone] = UserService.getPhotoUrl(res.data.photo);
            }
          } catch {
            // ignore
          }
        })
      );

      if (Object.keys(newPhotos).length > 0) {
        setPlayerPhotos((prev) => ({ ...prev, ...newPhotos }));
      }
    };

    if (registrations.length > 0) {
      fetchPhotos();
    }
  }, [registrations]);

  const resolvePlayerPhoto = (p: RegistrationPlayer): string => {
    const direct =
      p.photo ||
      p.photoUrl ||
      p.avatar ||
      p.profilePic ||
      p.userPhoto ||
      (p as any).image ||
      (p as any).profileImage;

    if (direct) {
      if (direct.startsWith('http') || direct.startsWith('data:') || direct.startsWith('/')) {
        return direct;
      }
      return UserService.getPhotoUrl(direct);
    }

    if (p.phoneNumber && playerPhotos[p.phoneNumber]) {
      return playerPhotos[p.phoneNumber];
    }

    return `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(p.playerName)}&backgroundColor=0ea5e9,10b981,8b5cf6,f59e0b`;
  };

  const verifyUmpirePhone = async (matchUuid: string, rawPhone: string): Promise<boolean> => {
    const rawClean = rawPhone.trim().replace(/\D/g, '');
    if (!rawClean) {
      setUmpireVerification((prev) => ({
        ...prev,
        [matchUuid]: { valid: undefined },
      }));
      return true;
    }

    if (rawClean.length < 10) {
      setUmpireVerification((prev) => ({
        ...prev,
        [matchUuid]: { checking: false, valid: false, error: 'Enter 10-digit phone number' },
      }));
      return false;
    }

    setUmpireVerification((prev) => ({
      ...prev,
      [matchUuid]: { checking: true },
    }));

    // Try last 10 digits as standard mobile number, or full number
    const phonesToTry = [rawClean.slice(-10), rawClean];
    const uniquePhones = Array.from(new Set(phonesToTry));

    try {
      let foundUser: UserResponse | null = null;
      for (const p of uniquePhones) {
        try {
          const res = await UserService.getUserByPhone(p);
          if (res?.data && (res.data.uuid || res.data.phone || res.data.firstName)) {
            foundUser = res.data;
            break;
          }
        } catch {
          // try next
        }
      }

      if (foundUser) {
        const uName =
          `${foundUser.firstName || ''} ${foundUser.lastName || ''}`.trim() ||
          (foundUser as any).name ||
          foundUser.phone ||
          'Registered User';

        setUmpireVerification((prev) => ({
          ...prev,
          [matchUuid]: { checking: false, valid: true, name: uName },
        }));
        return true;
      } else {
        setUmpireVerification((prev) => ({
          ...prev,
          [matchUuid]: { checking: false, valid: false, error: 'Not a registered user' },
        }));
        return false;
      }
    } catch {
      setUmpireVerification((prev) => ({
        ...prev,
        [matchUuid]: { checking: false, valid: false, error: 'Not a registered user' },
      }));
      return false;
    }
  };

  // Auto-verify umpire phone numbers of existing matches on load
  useEffect(() => {
    matches.forEach((m) => {
      if (m.umpirePhone && m.uuid && !umpireVerification[m.uuid]) {
        verifyUmpirePhone(m.uuid, m.umpirePhone);
      }
    });
  }, [matches]);

  const formatMatchDateTime = (dateStr?: string | null) => {
    if (!dateStr) return 'Time TBA';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Time TBA';
    
    const day = d.getDate();
    const month = d.toLocaleString('en-US', { month: 'short' });
    const year = d.getFullYear();
    const time = d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    
    return `${day} ${month} ${year}, ${time}`;
  };

  // Filters State
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UNASSIGNED' | 'READY' | 'COMPLETED'>('ALL');
  const [selectedPool, setSelectedPool] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Local state for editing courts/umpires/schedules before saving
  const [editState, setEditState] = useState<{ [matchUuid: string]: { courtId?: string; umpirePhone?: string; matchDate?: string; matchTime?: string } }>({});
  const [savingMatches, setSavingMatches] = useState<{ [matchUuid: string]: boolean }>({});
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!tournamentId) return;
      try {
        setIsLoading(true);
        const tRes = await TournamentService.getById(tournamentId);
        if (tRes && tRes.data) {
          setTournament(tRes.data);

          if (tRes.data.tournamentId) {
            const rRes = await RegistrationService.getByTournament(tRes.data.tournamentId);
            if (rRes && rRes.data) {
              setRegistrations(rRes.data);
            }
          }

          if (tRes.data.tournamentUuid) {
            const mRes = await MatchService.getByTournament(tRes.data.tournamentUuid);
            if (mRes) {
              setMatches(mRes);
            }

            const fetchedCourts = await StreamConfigService.getByTournament(tRes.data.tournamentUuid);
            if (fetchedCourts.length > 0) {
              setCourts(fetchedCourts);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch match setup data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [tournamentId]);

  // Generate date options between tournament startDate and endDate
  const getTournamentDateOptions = () => {
    if (!tournament?.startDate || !tournament?.endDate) return [];
    const start = new Date(tournament.startDate);
    const end = new Date(tournament.endDate);
    const dates: { value: string; label: string }[] = [];
    const current = new Date(start);
    let count = 0;
    while (current <= end && count < 30) {
      const year = current.getFullYear();
      const month = String(current.getMonth() + 1).padStart(2, '0');
      const day = String(current.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      const labelStr = current.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      dates.push({ value: dateStr, label: labelStr });
      current.setDate(current.getDate() + 1);
      count++;
    }
    return dates;
  };

  const handleEditChange = (matchUuid: string, field: 'courtId' | 'umpirePhone' | 'matchDate' | 'matchTime', value: string) => {
    setEditState(prev => ({
      ...prev,
      [matchUuid]: {
        ...prev[matchUuid],
        [field]: value
      }
    }));

    if (field === 'umpirePhone') {
      const clean = value.replace(/\D/g, '');
      if (clean.length >= 10) {
        verifyUmpirePhone(matchUuid, clean);
      } else if (!clean) {
        setUmpireVerification((prev) => ({
          ...prev,
          [matchUuid]: { valid: undefined },
        }));
      }
    }
  };

  const handleSaveMatch = async (matchUuid: string) => {
    const edits = editState[matchUuid];
    if (!edits) return;

    // Verify umpire phone if changed and non-empty
    if (edits.umpirePhone !== undefined && edits.umpirePhone.trim() !== '') {
      const isValid = await verifyUmpirePhone(matchUuid, edits.umpirePhone);
      if (!isValid) {
        setFeedback({
          type: 'error',
          message: `Cannot assign umpire: "${edits.umpirePhone}" is not a registered user. Please verify the phone number or have the umpire register first.`,
        });
        setTimeout(() => setFeedback(null), 4500);
        return;
      }
    }

    setSavingMatches(prev => ({ ...prev, [matchUuid]: true }));
    try {
      let updatedMatch: Match | undefined;

      if (edits.courtId !== undefined) {
        const courtIdNum = parseInt(edits.courtId);
        if (!isNaN(courtIdNum)) {
          updatedMatch = await MatchService.updateCourt(matchUuid, courtIdNum);
        }
      }

      if (edits.umpirePhone !== undefined) {
        updatedMatch = await MatchService.updateUmpire(matchUuid, edits.umpirePhone.trim());
      }

      if (edits.matchDate !== undefined || edits.matchTime !== undefined) {
        const currentMatch = matches.find(m => m.uuid === matchUuid);
        let curDate = "";
        let curTime = "09:00";

        if (currentMatch?.scheduledTime) {
          const d = new Date(currentMatch.scheduledTime);
          if (!isNaN(d.getTime())) {
            curDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            curTime = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
          }
        }

        const dateToSave = edits.matchDate !== undefined ? edits.matchDate : (curDate || (tournament?.startDate ? tournament.startDate.substring(0, 10) : ''));
        const timeToSave = edits.matchTime !== undefined ? edits.matchTime : curTime;

        if (dateToSave && timeToSave) {
          const fullIsoStr = `${dateToSave}T${timeToSave}:00`;
          updatedMatch = await MatchService.updateSchedule(matchUuid, fullIsoStr);
        }
      }

      if (updatedMatch) {
        setMatches(prev => prev.map(m => m.uuid === matchUuid ? updatedMatch! : m));
        setFeedback({ type: 'success', message: 'Match settings updated successfully!' });
        setTimeout(() => setFeedback(null), 3000);
      }
    } catch (error) {
      console.error("Failed to update match:", error);
      setFeedback({ type: 'error', message: 'Failed to update match configuration. Please try again.' });
      setTimeout(() => setFeedback(null), 4000);
    } finally {
      setSavingMatches(prev => ({ ...prev, [matchUuid]: false }));
    }
  };

  const scheduledMatches = useMemo(
    () => matches.filter((m) => m.teamARegistrationUuid != null || m.teamBRegistrationUuid != null),
    [matches]
  );

  // Distinct Pools
  const pools = useMemo(() => {
    const set = new Set<string>();
    scheduledMatches.forEach((m) => {
      if (m.poolName) set.add(m.poolName);
    });
    return Array.from(set).sort();
  }, [scheduledMatches]);

  const hasNonPoolMatches = useMemo(
    () => pools.length > 0 && scheduledMatches.some((m) => !m.poolName),
    [pools, scheduledMatches]
  );

  // Status Counts
  const counts = useMemo(() => {
    let unassigned = 0;
    let ready = 0;
    let completed = 0;

    scheduledMatches.forEach((m) => {
      const isComp = m.status === 'COMPLETED';
      if (isComp) {
        completed++;
      } else if (m.courtId && m.umpirePhone) {
        ready++;
      } else {
        unassigned++;
      }
    });

    return {
      all: scheduledMatches.length,
      unassigned,
      ready,
      completed,
    };
  }, [scheduledMatches]);

  // Filtered Matches
  const filteredMatches = useMemo(() => {
    return scheduledMatches.filter((match) => {
      const isComp = match.status === 'COMPLETED';
      const isReady = !isComp && Boolean(match.courtId && match.umpirePhone);
      const isUnassigned = !isComp && (!match.courtId || !match.umpirePhone);

      // Status filter
      if (statusFilter === 'UNASSIGNED' && !isUnassigned) return false;
      if (statusFilter === 'READY' && !isReady) return false;
      if (statusFilter === 'COMPLETED' && !isComp) return false;

      // Pool filter
      if (selectedPool !== 'ALL') {
        if (selectedPool === 'NO_POOL' && match.poolName) return false;
        if (selectedPool !== 'NO_POOL' && match.poolName !== selectedPool) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const teamA = registrations.find(
          (r) => r.registrationUuid === match.teamARegistrationUuid || r.uuid === match.teamARegistrationUuid
        );
        const teamB = registrations.find(
          (r) => r.registrationUuid === match.teamBRegistrationUuid || r.uuid === match.teamBRegistrationUuid
        );

        const matchPool = match.poolName?.toLowerCase() || '';
        const matchRound = match.roundName?.toLowerCase() || '';
        const umpire = match.umpirePhone?.toLowerCase() || '';
        const teamAName = teamA?.teamName?.toLowerCase() || '';
        const teamBName = teamB?.teamName?.toLowerCase() || '';
        const playersA = teamA?.players?.map((p) => p.playerName.toLowerCase()).join(' ') || '';
        const playersB = teamB?.players?.map((p) => p.playerName.toLowerCase()).join(' ') || '';

        const hit =
          matchPool.includes(q) ||
          matchRound.includes(q) ||
          umpire.includes(q) ||
          teamAName.includes(q) ||
          teamBName.includes(q) ||
          playersA.includes(q) ||
          playersB.includes(q);

        if (!hit) return false;
      }

      return true;
    }).sort((a, b) => {
      const isACompleted = a.status === 'COMPLETED';
      const isBCompleted = b.status === 'COMPLETED';

      // 1. Assigned / active matches first, completed matches later
      if (!isACompleted && isBCompleted) return -1;
      if (isACompleted && !isBCompleted) return 1;

      // 2. LIVE / IN_PROGRESS matches at the very top of active matches
      const isALive = a.status === 'LIVE' || a.status === 'IN_PROGRESS';
      const isBLive = b.status === 'LIVE' || b.status === 'IN_PROGRESS';
      if (isALive && !isBLive) return -1;
      if (!isALive && isBLive) return 1;

      // 3. Ascending order by scheduledTime or matchDate
      const timeA = a.scheduledTime ? new Date(a.scheduledTime).getTime() : (a.matchDate ? new Date(a.matchDate).getTime() : Infinity);
      const timeB = b.scheduledTime ? new Date(b.scheduledTime).getTime() : (b.matchDate ? new Date(b.matchDate).getTime() : Infinity);

      if (timeA !== timeB && !isNaN(timeA) && !isNaN(timeB)) {
        return timeA - timeB;
      }

      // 4. Tie breaker by id / matchNumber ascending
      const idA = typeof a.id === 'number' ? a.id : (a.matchNumber || 0);
      const idB = typeof b.id === 'number' ? b.id : (b.matchNumber || 0);
      return idA - idB;
    });
  }, [scheduledMatches, statusFilter, selectedPool, searchQuery, registrations]);

  const hasActiveFilters = statusFilter !== 'ALL' || selectedPool !== 'ALL' || searchQuery.trim() !== '';

  const resetFilters = () => {
    setStatusFilter('ALL');
    setSelectedPool('ALL');
    setSearchQuery('');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20 text-text-muted">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-sm font-medium tracking-wide">Loading match setups...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-surface border border-border/80 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" /> Match Assignments
          </h2>
          <p className="text-sm text-text-muted mt-1">
            Assign courts, set match dates/times, and add umpire contacts for scheduled matches.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-background/60 px-4 py-2 rounded-xl border border-border/50 text-xs text-text-muted font-medium">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span>{scheduledMatches.length} Scheduled Matches</span>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 text-xs font-bold animate-in fade-in duration-200 ${feedback.type === 'success'
            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
            : 'bg-red-500/15 text-red-400 border-red-500/30'
            }`}
        >
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* ── FILTERING & CONTROLS DASHBOARD ────────────────────────────── */}
      <div className="space-y-4">
        {/* 1. Status Filter Segmented Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* ALL MATCHES */}
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`p-4 rounded-2xl border text-left transition-all duration-200 relative overflow-hidden flex flex-col justify-between group ${statusFilter === 'ALL'
              ? 'bg-primary/10 border-primary shadow-lg shadow-primary/10 ring-1 ring-primary'
              : 'bg-surface border-border/80 hover:border-foreground/30'
              }`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-text-muted">All Matches</span>
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${statusFilter === 'ALL' ? 'bg-primary text-black' : 'bg-background border border-border text-foreground/70'
                  }`}
              >
                {counts.all}
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-black text-foreground">
              <span>Total Scheduled</span>
            </div>
          </button>

          {/* UNASSIGNED */}
          <button
            onClick={() => setStatusFilter('UNASSIGNED')}
            className={`p-4 rounded-2xl border text-left transition-all duration-200 relative overflow-hidden flex flex-col justify-between group ${statusFilter === 'UNASSIGNED'
              ? 'bg-amber-500/15 border-amber-500 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500'
              : 'bg-surface border-border/80 hover:border-amber-500/40'
              }`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">Needs Setup</span>
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${statusFilter === 'UNASSIGNED'
                  ? 'bg-amber-500 text-black'
                  : 'bg-amber-500/15 border border-amber-500/30 text-amber-400'
                  }`}
              >
                {counts.unassigned}
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-black text-amber-400">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Unassigned</span>
            </div>
          </button>

          {/* READY */}
          <button
            onClick={() => setStatusFilter('READY')}
            className={`p-4 rounded-2xl border text-left transition-all duration-200 relative overflow-hidden flex flex-col justify-between group ${statusFilter === 'READY'
              ? 'bg-emerald-500/15 border-emerald-500 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500'
              : 'bg-surface border-border/80 hover:border-emerald-500/40'
              }`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">Ready to Play</span>
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${statusFilter === 'READY'
                  ? 'bg-emerald-500 text-black'
                  : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                  }`}
              >
                {counts.ready}
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-black text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Court & Umpire Set</span>
            </div>
          </button>

          {/* COMPLETED */}
          <button
            onClick={() => setStatusFilter('COMPLETED')}
            className={`p-4 rounded-2xl border text-left transition-all duration-200 relative overflow-hidden flex flex-col justify-between group ${statusFilter === 'COMPLETED'
              ? 'bg-sky-500/15 border-sky-500 shadow-lg shadow-sky-500/10 ring-1 ring-sky-500'
              : 'bg-surface border-border/80 hover:border-sky-500/40'
              }`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-sky-400">Finished</span>
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${statusFilter === 'COMPLETED'
                  ? 'bg-sky-500 text-black'
                  : 'bg-sky-500/15 border border-sky-500/30 text-sky-400'
                  }`}
              >
                {counts.completed}
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-black text-sky-400">
              <Trophy className="w-3.5 h-3.5" />
              <span>Completed</span>
            </div>
          </button>
        </div>

        {/* 2. Pool Filters & Search Bar Toolbar */}
        <div className="p-3 bg-surface border border-border/80 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-sm">
          {/* Pool Selection Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-text-muted px-2 py-1 shrink-0">
              <Layers className="w-3.5 h-3.5 text-primary" />
              <span>Pool:</span>
            </div>

            <button
              onClick={() => setSelectedPool('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${selectedPool === 'ALL'
                ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                : 'bg-background hover:bg-white/5 border border-border text-foreground/70'
                }`}
            >
              All ({scheduledMatches.length})
            </button>

            {pools.map((pool) => {
              const poolCount = scheduledMatches.filter((m) => m.poolName === pool).length;
              return (
                <button
                  key={pool}
                  onClick={() => setSelectedPool(pool)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${selectedPool === pool
                    ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                    : 'bg-background hover:bg-white/5 border border-border text-foreground/70'
                    }`}
                >
                  {pool} ({poolCount})
                </button>
              );
            })}

            {hasNonPoolMatches && (
              <button
                onClick={() => setSelectedPool('NO_POOL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${selectedPool === 'NO_POOL'
                  ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                  : 'bg-background hover:bg-white/5 border border-border text-foreground/70'
                  }`}
              >
                Playoffs / Knockouts ({scheduledMatches.filter((m) => !m.poolName).length})
              </button>
            )}
          </div>

          {/* Search Input & Reset Button */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative flex-1 md:w-64">
              <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search team, player, umpire..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-text-muted/60 focus:outline-none focus:border-primary transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-border bg-background hover:bg-white/5 text-xs font-bold text-foreground/70 hover:text-foreground transition-colors shrink-0"
                title="Reset All Filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Showing Count Status Tag */}
        <div className="flex items-center justify-between text-xs text-text-muted px-1">
          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
            <span>
              Showing <strong className="text-foreground font-bold">{filteredMatches.length}</strong> of{' '}
              <strong className="text-foreground font-bold">{scheduledMatches.length}</strong> matches
            </span>
          </div>

          {hasActiveFilters && (
            <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
              <span className="font-semibold text-text-muted">Active Filter:</span>
              {statusFilter !== 'ALL' && (
                <span className="px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-primary font-bold">
                  {statusFilter}
                </span>
              )}
              {selectedPool !== 'ALL' && (
                <span className="px-2 py-0.5 rounded-md bg-white/10 border border-white/20 text-foreground font-bold">
                  {selectedPool === 'NO_POOL' ? 'Playoffs' : selectedPool}
                </span>
              )}
              {searchQuery && (
                <span className="px-2 py-0.5 rounded-md bg-white/10 border border-white/20 text-foreground font-bold">
                  &quot;{searchQuery}&quot;
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {scheduledMatches.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border rounded-2xl bg-surface/30">
            <Play className="w-12 h-12 text-text-muted/40 mb-4" />
            <p className="text-lg font-bold text-foreground">No matches scheduled yet.</p>
            <p className="text-sm text-text-muted max-w-sm mt-1">Generate the tournament draw first to see matches here.</p>
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-center border border-dashed border-border rounded-2xl bg-surface/30 p-6">
            <Filter className="w-10 h-10 text-text-muted/40 mb-3" />
            <h4 className="text-sm font-bold text-foreground mb-1">No Matches Found</h4>
            <p className="text-xs text-text-muted max-w-sm mb-4">
              No matches match your current filter selection. Try changing the status, pool, or search query.
            </p>
            <button
              onClick={resetFilters}
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-primary/20 hover:opacity-90 transition-opacity"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        ) : (
          filteredMatches.map((match, idx) => {
            const teamA = registrations.find(r => r.registrationUuid === match.teamARegistrationUuid || r.uuid === match.teamARegistrationUuid);
            const teamB = registrations.find(r => r.registrationUuid === match.teamBRegistrationUuid || r.uuid === match.teamBRegistrationUuid);
            const isLive = match.status === 'LIVE';
            const isCompleted = match.status === 'COMPLETED';

            const edits = editState[match.uuid] || {};
            const isEditing = edits.courtId !== undefined || edits.umpirePhone !== undefined || edits.matchDate !== undefined || edits.matchTime !== undefined;
            const isSaving = savingMatches[match.uuid];

            const currentCourtId = edits.courtId !== undefined ? parseInt(edits.courtId) : match.courtId;
            const assignedCourt = courts.find(c => c.id === currentCourtId);
            const currentUmpirePhone = edits.umpirePhone !== undefined ? edits.umpirePhone : match.umpirePhone;

            // Extract initial date & time for display/editing
            let initialDate = "";
            let initialTime = "";
            if (match.scheduledTime) {
              const d = new Date(match.scheduledTime);
              if (!isNaN(d.getTime())) {
                initialDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                initialTime = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
              }
            }

            // Prefill initialDate from tournament.startDate if no scheduled date set yet
            const tStart = tournament?.startDate ? tournament.startDate.substring(0, 10) : "";
            if (!initialDate && tStart) {
              initialDate = tStart;
            }

            const currentMatchDate = edits.matchDate !== undefined ? edits.matchDate : initialDate;
            const currentMatchTime = edits.matchTime !== undefined ? edits.matchTime : initialTime;

            return (
              <div
                key={match.uuid || idx}
                className="group relative bg-surface-elevated border border-border/80 hover:border-primary/40 rounded-2xl p-6 flex flex-col justify-between shadow-lg hover:shadow-primary/5 transition-all duration-300 overflow-hidden"
              >
                {/* Gradient Accent Bar */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${isLive
                    ? 'from-red-500 via-rose-500 to-amber-500 animate-pulse'
                    : isCompleted
                      ? 'from-emerald-500 to-teal-400'
                      : assignedCourt
                        ? 'from-primary via-emerald-400 to-cyan-500'
                        : 'from-border via-primary/30 to-border'
                    }`}
                />

                <div>
                  {/* Card Header: Match Number, Category, Time & Status */}
                  <div className="flex flex-col gap-3 mb-5 pb-4 border-b border-border/50">
                    {/* Top Line: Match #, Category, Status Badge */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-1 bg-primary/10 border border-primary/20 text-primary font-black text-xs uppercase tracking-wider rounded-md flex items-center gap-1.5 shrink-0">
                          <Sparkles className="w-3 h-3" /> Match #{idx + 1}
                        </span>
                        {match.poolName && (
                          <span className="px-2 py-0.5 bg-surface border border-border text-text-muted font-bold text-[10px] uppercase tracking-wider rounded-md shrink-0">
                            {match.poolName}
                          </span>
                        )}
                        {tournament?.category && (
                          <span className="px-2 py-0.5 bg-surface border border-border text-text-muted font-bold text-[10px] uppercase tracking-wider rounded-md shrink-0">
                            {tournament.category}
                          </span>
                        )}
                      </div>

                      {/* Status Badge */}
                      <div className="shrink-0">
                        {isLive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-red-500/10 text-red-400 border border-red-500/30">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                            LIVE NOW
                          </span>
                        ) : isCompleted ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" />
                            COMPLETED
                          </span>
                        ) : assignedCourt ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary border border-primary/30">
                            READY
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-background border border-border text-text-muted">
                            UNASSIGNED
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bottom Line: Scheduled Time */}
                    <div className="flex items-center gap-1.5 text-xs text-text-muted font-medium">
                      <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>
                        {formatMatchDateTime(match.scheduledTime)}
                      </span>
                    </div>
                  </div>

                  {/* Teams vs Teams Showcase */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 relative">

                    {/* Team A Card */}
                    <div className="p-4 bg-background/60 border border-border/60 rounded-xl flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h4 className={`font-extrabold text-base leading-tight truncate ${teamA ? 'text-foreground' : 'text-text-muted italic'}`}>
                            {teamA ? teamA.teamName : 'TBD (Winner)'}
                          </h4>
                          {teamA && (
                            <div className="flex items-center gap-1.5 shrink-0">
                              {teamA.players && teamA.players.length >= 2 ? (
                                <div className="flex -space-x-1.5 items-center">
                                  {teamA.players.slice(0, 2).map((p, idx) => (
                                    <img
                                      key={idx}
                                      src={resolvePlayerPhoto(p)}
                                      alt={p.playerName}
                                      className="w-5 h-5 rounded-full object-cover border border-background shadow-xs"
                                    />
                                  ))}
                                </div>
                              ) : (
                                <Users className="w-4 h-4 text-primary" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Team A Players */}
                      {teamA && teamA.players && teamA.players.length > 0 && (
                        <div className="flex flex-col gap-2 pt-2 border-t border-border/40">
                          {teamA.players.map((p, pIdx) => {
                            const photoUrl = resolvePlayerPhoto(p);
                            return (
                              <div key={pIdx} className="flex items-center justify-between text-xs py-0.5">
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className="w-5 h-5 rounded-full overflow-hidden border border-primary/30 bg-surface shrink-0 shadow-sm">
                                    <img
                                      src={photoUrl}
                                      alt={p.playerName}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <span className="font-semibold text-foreground/90 truncate">{p.playerName}</span>
                                </div>
                                {p.phoneNumber && (
                                  <span className="text-[10px] font-mono text-text-muted bg-surface px-1.5 py-0.5 rounded border border-border/40 shrink-0 ml-2">
                                    {p.phoneNumber}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* VS Badge */}
                    <div className="hidden sm:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-surface-elevated border border-border text-primary font-black text-xs items-center justify-center shadow-lg z-10">
                      VS
                    </div>

                    {/* Team B Card */}
                    <div className="p-4 bg-background/60 border border-border/60 rounded-xl flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h4 className={`font-extrabold text-base leading-tight truncate ${teamB ? 'text-foreground' : 'text-text-muted italic'}`}>
                            {teamB ? teamB.teamName : 'TBD (Winner)'}
                          </h4>
                          {teamB && (
                            <div className="flex items-center gap-1.5 shrink-0">
                              {teamB.players && teamB.players.length >= 2 ? (
                                <div className="flex -space-x-1.5 items-center">
                                  {teamB.players.slice(0, 2).map((p, idx) => (
                                    <img
                                      key={idx}
                                      src={resolvePlayerPhoto(p)}
                                      alt={p.playerName}
                                      className="w-5 h-5 rounded-full object-cover border border-background shadow-xs"
                                    />
                                  ))}
                                </div>
                              ) : (
                                <Users className="w-4 h-4 text-emerald-400" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Team B Players */}
                      {teamB && teamB.players && teamB.players.length > 0 && (
                        <div className="flex flex-col gap-2 pt-2 border-t border-border/40">
                          {teamB.players.map((p, pIdx) => {
                            const photoUrl = resolvePlayerPhoto(p);
                            return (
                              <div key={pIdx} className="flex items-center justify-between text-xs py-0.5">
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className="w-5 h-5 rounded-full overflow-hidden border border-emerald-500/30 bg-surface shrink-0 shadow-sm">
                                    <img
                                      src={photoUrl}
                                      alt={p.playerName}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <span className="font-semibold text-foreground/90 truncate">{p.playerName}</span>
                                </div>
                                {p.phoneNumber && (
                                  <span className="text-[10px] font-mono text-text-muted bg-surface px-1.5 py-0.5 rounded border border-border/40 shrink-0 ml-2">
                                    {p.phoneNumber}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Setup Controls Box */}
                <div className="p-4 bg-background/40 border border-border/50 rounded-xl space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                    {/* Court Selector */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-primary" /> Court Assignment
                      </label>
                      <select
                        className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:border-primary transition-colors cursor-pointer"
                        value={edits.courtId !== undefined ? edits.courtId : (match.courtId || '')}
                        onChange={(e) => handleEditChange(match.uuid, 'courtId', e.target.value)}
                      >
                        <option value="">Select a court...</option>
                        {courts.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.name} {c.streamKey ? '(Video Stream)' : '(Score Only)'}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Umpire Phone */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-emerald-400" /> Umpire Phone
                        </label>
                        {umpireVerification[match.uuid]?.checking ? (
                          <span className="text-[10px] text-amber-400 flex items-center gap-1 font-bold">
                            <Loader2 className="w-3 h-3 animate-spin" /> Verifying user...
                          </span>
                        ) : umpireVerification[match.uuid]?.valid === true ? (
                          <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-bold">
                            <CheckCircle2 className="w-3 h-3" />{umpireVerification[match.uuid]?.name}
                          </span>
                        ) : umpireVerification[match.uuid]?.valid === false ? (
                          <span className="text-[10px] text-red-400 flex items-center gap-1 font-bold">
                            <AlertCircle className="w-3 h-3" /> {umpireVerification[match.uuid]?.error || 'Not an user'}
                          </span>
                        ) : null}
                      </div>
                      <input
                        type="text"
                        placeholder="e.g. 9876543210"
                        className={`w-full bg-surface border rounded-lg px-3 py-2 text-xs font-mono text-foreground focus:outline-none transition-colors ${umpireVerification[match.uuid]?.valid === false
                          ? 'border-red-500/70 focus:border-red-500'
                          : umpireVerification[match.uuid]?.valid === true
                            ? 'border-emerald-500/70 focus:border-emerald-500'
                            : 'border-border focus:border-primary'
                          }`}
                        value={currentUmpirePhone || ''}
                        onChange={(e) => handleEditChange(match.uuid, 'umpirePhone', e.target.value)}
                        onBlur={(e) => {
                          if (e.target.value.trim()) {
                            verifyUmpirePhone(match.uuid, e.target.value);
                          }
                        }}
                      />
                      {umpireVerification[match.uuid]?.valid === false && (
                        <p className="text-[10px] text-red-400 font-medium">
                          Only registered users can be assigned as umpires.
                        </p>
                      )}
                    </div>

                  </div>

                  {/* Date & Time side-by-side on all screen sizes including mobile */}
                  <div className="grid grid-cols-2 gap-3">

                    {/* Match Date Calendar Picker */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-sky-400" /> Match Date
                      </label>
                      <input
                        type="date"
                        min={tournament?.startDate ? tournament.startDate.substring(0, 10) : undefined}
                        max={tournament?.endDate ? tournament.endDate.substring(0, 10) : undefined}
                        className="w-full bg-surface border border-border rounded-lg px-2.5 py-2 text-xs font-mono text-foreground focus:outline-none focus:border-primary transition-colors cursor-pointer"
                        value={currentMatchDate}
                        onChange={(e) => handleEditChange(match.uuid, 'matchDate', e.target.value)}
                      />
                    </div>

                    {/* Match Time Picker */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-400" /> Match Time
                      </label>
                      <input
                        type="time"
                        className="w-full bg-surface border border-border rounded-lg px-2.5 py-2 text-xs font-mono text-foreground focus:outline-none focus:border-primary transition-colors cursor-pointer"
                        value={currentMatchTime}
                        onChange={(e) => handleEditChange(match.uuid, 'matchTime', e.target.value)}
                      />
                    </div>

                  </div>

                  {/* Summary / Save Button */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/40">
                    <div className="text-[11px] text-text-muted">
                      {assignedCourt ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Assigned to {assignedCourt.name}
                        </span>
                      ) : (
                        <span className="text-amber-400/90 font-medium flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> Select court to assign
                        </span>
                      )}
                    </div>

                    {isEditing && (
                      <button
                        onClick={() => handleSaveMatch(match.uuid)}
                        disabled={isSaving}
                        className="px-5 py-2 bg-primary hover:bg-primary/90 text-black font-bold text-xs rounded-lg flex items-center gap-2 shadow-md shadow-primary/20 transition-all"
                      >
                        {isSaving ? (
                          <span className="animate-pulse">Saving...</span>
                        ) : (
                          <>
                            <Save className="w-3.5 h-3.5" /> Save
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
