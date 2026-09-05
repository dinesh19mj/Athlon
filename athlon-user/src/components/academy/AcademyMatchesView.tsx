'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Trophy,
  Swords,
  Plus,
  Search,
  Users,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  X,
  Crown,
  User,
  Trash2,
  Check,
  ChevronDown,
  Sparkles,
  Flame,
  LayoutGrid,
  List,
  Target,
  Shield,
  Zap,
} from 'lucide-react';
import { useOrgRole } from '@/hooks/use-org-role';
import { useOrgSports } from '@/lib/hooks/useOrgSports';
import { AcademyMatchService, AcademyMatch, MatchType } from '@/lib/api/academyMatch';
import { AcademyStudentService, AcademyStudent, AcademyBatch } from '@/lib/api/academyStudent';
import { UserService } from '@/lib/api/user';

const AVAILABLE_SPORTS_ICONS: Record<string, string> = {
  Badminton: '🏸',
  Cricket: '🏏',
  Football: '⚽',
  Tennis: '🎾',
  'Table Tennis': '🏓',
  Pickleball: '🥒',
  Basketball: '🏀',
  Volleyball: '🏐',
  Squash: '🎾',
};

// Sport Category Helper
export type SportCategory = 'RACKET' | 'CRICKET' | 'FOOTBALL' | 'BASKETBALL';

export const getSportCategory = (sportName: string): SportCategory => {
  const s = (sportName || '').toLowerCase().trim();
  if (s === 'cricket') return 'CRICKET';
  if (s === 'football' || s === 'soccer') return 'FOOTBALL';
  if (s === 'basketball') return 'BASKETBALL';
  return 'RACKET'; // Default: Badminton, Tennis, TT, Pickleball, Squash, Volleyball
};

const getLocalDateString = (d: Date = new Date()): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Custom Student Selector with Photo, Name, and Batch Chip
function StudentSelector({
  label,
  value,
  onChange,
  students,
  disabledNames = [],
}: {
  label: string;
  value: string;
  onChange: (name: string, uuid?: string) => void;
  students: AcademyStudent[];
  disabledNames?: string[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const selectedStudent = students.find((s) => s.fullName === value);

  const filteredStudents = useMemo(() => {
    if (!search.trim()) return students;
    return students.filter(
      (s) =>
        s.fullName.toLowerCase().includes(search.toLowerCase()) ||
        (s.batchName && s.batchName.toLowerCase().includes(search.toLowerCase()))
    );
  }, [students, search]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all group ${selectedStudent || value
          ? 'bg-background border-foreground/20 text-foreground shadow-sm'
          : 'bg-background/80 border-foreground/10 text-foreground/40 hover:border-primary/40'
          }`}
        style={{ borderColor: 'var(--athlon-border)' }}
      >
        <div className="flex items-center gap-3 min-w-0">
          {selectedStudent ? (
            <>
              <div className="w-8 h-8 rounded-xl bg-foreground/10 border border-foreground/10 overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
                {selectedStudent.photo ? (
                  <img
                    src={UserService.getPhotoUrl(selectedStudent.photo)}
                    alt={selectedStudent.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-black text-primary">
                    {selectedStudent.fullName?.charAt(0)?.toUpperCase()}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <span className="text-xs font-black text-foreground truncate block">
                  {selectedStudent.fullName}
                </span>
                {selectedStudent.batchName && (
                  <span className="text-[10px] text-foreground/50 font-semibold truncate block">
                    {selectedStudent.batchName}
                  </span>
                )}
              </div>
            </>
          ) : value ? (
            <>
              <div className="w-8 h-8 rounded-xl bg-foreground/10 border border-foreground/10 flex items-center justify-center text-xs font-black text-primary shrink-0">
                {value.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-black text-foreground truncate">{value}</span>
            </>
          ) : (
            <>
              <div className="w-8 h-8 rounded-xl bg-foreground/5 border border-foreground/10 flex items-center justify-center text-foreground/30 shrink-0 group-hover:text-primary transition-colors">
                <User className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-foreground/40">{label}</span>
            </>
          )}
        </div>
        <ChevronDown className="w-4 h-4 text-foreground/40 shrink-0 ml-2 group-hover:text-foreground transition-colors" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div
            className="absolute z-50 left-0 right-0 top-full mt-1.5 rounded-2xl border shadow-2xl max-h-64 overflow-y-auto p-2 space-y-1 bg-surface animate-in fade-in zoom-in-95 duration-150"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            {/* Quick Filter Input */}
            <div className="p-1 pb-1.5 border-b border-foreground/10">
              <input
                type="text"
                placeholder="Search athlete by name or batch..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
                className="w-full px-3 py-2 rounded-xl bg-background border border-foreground/15 text-xs text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary font-medium"
              />
            </div>

            {filteredStudents.length === 0 ? (
              <div className="p-3 text-center text-xs text-foreground/50 font-medium">
                No matching student found. Click below to add.
              </div>
            ) : (
              filteredStudents.map((student) => {
                const isDisabled = disabledNames.includes(student.fullName);
                const isSelected = value === student.fullName;

                return (
                  <button
                    key={student.studentUuid}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => {
                      onChange(student.fullName, student.studentUuid);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-colors ${isSelected
                      ? 'bg-primary/15 text-primary font-black'
                      : isDisabled
                        ? 'opacity-40 cursor-not-allowed bg-foreground/[0.02]'
                        : 'hover:bg-foreground/5 text-foreground'
                      }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-foreground/10 border border-foreground/10 overflow-hidden flex items-center justify-center shrink-0">
                        {student.photo ? (
                          <img
                            src={UserService.getPhotoUrl(student.photo)}
                            alt={student.fullName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-black text-primary">
                            {student.fullName?.charAt(0)?.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold truncate block">
                          {student.fullName}
                        </span>
                        {student.batchName && (
                          <span className="text-[10px] text-foreground/50 font-medium truncate block">
                            {student.batchName}
                          </span>
                        )}
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-primary shrink-0 ml-2" />}
                  </button>
                );
              })
            )}

            {/* Custom Manual Entry Option */}
            {search.trim() && (
              <div className="pt-1 border-t border-foreground/10 p-1">
                <button
                  type="button"
                  onClick={() => {
                    onChange(search.trim());
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className="w-full py-1.5 px-2.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold text-left flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Use &ldquo;{search.trim()}&rdquo;</span>
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

interface Props {
  orgUuid: string;
  orgName: string;
}

export default function AcademyMatchesView({ orgUuid, orgName }: Props) {
  const { isAdmin, isCoach } = useOrgRole(orgUuid);
  const canManageMatches = isAdmin || isCoach;
  const { sports: orgSports } = useOrgSports(orgUuid);

  // Data States
  const [matches, setMatches] = useState<AcademyMatch[]>([]);
  const [students, setStudents] = useState<AcademyStudent[]>([]);
  const [batches, setBatches] = useState<AcademyBatch[]>([]);
  const [loading, setLoading] = useState(true);

  // View Mode: 'CARDS' | 'TABLE'
  const [viewMode, setViewMode] = useState<'CARDS' | 'TABLE'>('CARDS');

  // Filter States
  const [selectedSport, setSelectedSport] = useState<string>('ALL');
  const [selectedBatchUuid, setSelectedBatchUuid] = useState<string>('ALL');
  const [selectedDate, setSelectedDate] = useState<string>(''); // empty = all
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Toast Notifications
  const [toastSuccess, setToastSuccess] = useState<string | null>(null);
  const [toastError, setToastError] = useState<string | null>(null);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [savingMatch, setSavingMatch] = useState(false);

  // ─── RECORD MATCH FORM STATE ───
  const [matchSport, setMatchSport] = useState(orgSports[0] || 'Badminton');
  const [batchUuid, setBatchUuid] = useState<string>('');
  const [matchDate, setMatchDate] = useState<string>(getLocalDateString());
  const [selectedWinner, setSelectedWinner] = useState<'TEAM_A' | 'TEAM_B' | null>(null);

  // Common Players
  const [teamAPlayer1, setTeamAPlayer1] = useState('');
  const [teamAPlayer1Uuid, setTeamAPlayer1Uuid] = useState<string | undefined>();
  const [teamAPlayer2, setTeamAPlayer2] = useState('');
  const [teamAPlayer2Uuid, setTeamAPlayer2Uuid] = useState<string | undefined>();
  const [teamBPlayer1, setTeamBPlayer1] = useState('');
  const [teamBPlayer1Uuid, setTeamBPlayer1Uuid] = useState<string | undefined>();
  const [teamBPlayer2, setTeamBPlayer2] = useState('');
  const [teamBPlayer2Uuid, setTeamBPlayer2Uuid] = useState<string | undefined>();

  // 1. Racket / Net Sports State
  const [racketFormat, setRacketFormat] = useState<'SINGLES' | 'DOUBLES'>('SINGLES');
  const [racketScoreA, setRacketScoreA] = useState<string>('');
  const [racketScoreB, setRacketScoreB] = useState<string>('');

  // 2. Cricket State
  const [cricketFormat, setCricketFormat] = useState<string>('10 Overs');
  const [cricketRunsA, setCricketRunsA] = useState<string>('');
  const [cricketWicketsA, setCricketWicketsA] = useState<string>('');
  const [cricketOversA, setCricketOversA] = useState<string>('');
  const [cricketRunsB, setCricketRunsB] = useState<string>('');
  const [cricketWicketsB, setCricketWicketsB] = useState<string>('');
  const [cricketOversB, setCricketOversB] = useState<string>('');

  // 3. Football State
  const [footballFormat, setFootballFormat] = useState<string>('5v5 Turf');
  const [footballGoalsA, setFootballGoalsA] = useState<string>('');
  const [footballGoalsB, setFootballGoalsB] = useState<string>('');

  // 4. Basketball State
  const [basketballFormat, setBasketballFormat] = useState<string>('5v5 Full Court');
  const [basketballScoreA, setBasketballScoreA] = useState<string>('');
  const [basketballScoreB, setBasketballScoreB] = useState<string>('');

  const sportCategory = useMemo(() => getSportCategory(matchSport), [matchSport]);

  const showToast = (msg: string, isErr = false) => {
    if (isErr) {
      setToastError(msg);
      setTimeout(() => setToastError(null), 3500);
    } else {
      setToastSuccess(msg);
      setTimeout(() => setToastSuccess(null), 3500);
    }
  };

  // Load Matches, Students, and Batches
  const loadData = async () => {
    if (!orgUuid) return;
    try {
      setLoading(true);
      const [matchesRes, studentsRes, batchesRes] = await Promise.allSettled([
        AcademyMatchService.getMatches(orgUuid),
        AcademyStudentService.getStudents(orgUuid),
        AcademyStudentService.getBatches(orgUuid),
      ]);

      if (matchesRes.status === 'fulfilled') {
        const raw = matchesRes.value;
        const list = Array.isArray(raw) ? raw : (raw as any)?.data || [];
        setMatches(list);
      }
      if (studentsRes.status === 'fulfilled') {
        const sRaw = studentsRes.value;
        const sList = Array.isArray(sRaw) ? sRaw : (sRaw as any)?.data || [];
        setStudents(sList);
      }
      if (batchesRes.status === 'fulfilled') {
        setBatches(batchesRes.value || []);
      }
    } catch (err) {
      console.error('Failed to load academy matches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [orgUuid]);

  useEffect(() => {
    if (orgSports.length > 0 && !orgSports.includes(matchSport)) {
      setMatchSport(orgSports[0]);
    }
  }, [orgSports]);

  // Auto-calculate winner when points change
  useEffect(() => {
    if (sportCategory === 'RACKET') {
      const a = parseInt(racketScoreA, 10);
      const b = parseInt(racketScoreB, 10);
      if (!isNaN(a) && !isNaN(b)) {
        if (a > b) setSelectedWinner('TEAM_A');
        else if (b > a) setSelectedWinner('TEAM_B');
        else setSelectedWinner(null);
      } else {
        setSelectedWinner(null);
      }
    } else if (sportCategory === 'CRICKET') {
      const a = parseInt(cricketRunsA, 10);
      const b = parseInt(cricketRunsB, 10);
      if (!isNaN(a) && !isNaN(b)) {
        if (a > b) setSelectedWinner('TEAM_A');
        else if (b > a) setSelectedWinner('TEAM_B');
        else setSelectedWinner(null);
      } else {
        setSelectedWinner(null);
      }
    } else if (sportCategory === 'FOOTBALL') {
      const a = parseInt(footballGoalsA, 10);
      const b = parseInt(footballGoalsB, 10);
      if (!isNaN(a) && !isNaN(b)) {
        if (a > b) setSelectedWinner('TEAM_A');
        else if (b > a) setSelectedWinner('TEAM_B');
        else setSelectedWinner(null);
      } else {
        setSelectedWinner(null);
      }
    } else if (sportCategory === 'BASKETBALL') {
      const a = parseInt(basketballScoreA, 10);
      const b = parseInt(basketballScoreB, 10);
      if (!isNaN(a) && !isNaN(b)) {
        if (a > b) setSelectedWinner('TEAM_A');
        else if (b > a) setSelectedWinner('TEAM_B');
        else setSelectedWinner(null);
      } else {
        setSelectedWinner(null);
      }
    }
  }, [
    sportCategory,
    racketScoreA,
    racketScoreB,
    cricketRunsA,
    cricketRunsB,
    footballGoalsA,
    footballGoalsB,
    basketballScoreA,
    basketballScoreB,
  ]);

  // Filtered Students when a Batch is selected in modal
  const modalAvailableStudents = useMemo(() => {
    if (!batchUuid) return students;
    return students.filter((s) => s.batchUuid === batchUuid);
  }, [students, batchUuid]);

  // Filtered Matches
  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      const q = searchTerm.toLowerCase().trim();
      const matchQuery =
        !q ||
        [
          m.player1Name,
          m.player2Name,
          m.player3Name,
          m.player4Name,
          m.winnerName,
          m.batchName,
          m.sportType,
          m.scoresDetail,
        ].some((v) => v?.toLowerCase().includes(q));

      const matchSportFilter =
        selectedSport === 'ALL' ||
        (m.sportType && m.sportType.toLowerCase() === selectedSport.toLowerCase());

      const matchBatch =
        selectedBatchUuid === 'ALL' || m.batchUuid === selectedBatchUuid;

      const matchDateFilter =
        !selectedDate || (m.matchDate && m.matchDate.startsWith(selectedDate));

      return matchQuery && matchSportFilter && matchBatch && matchDateFilter;
    });
  }, [matches, searchTerm, selectedSport, selectedBatchUuid, selectedDate]);

  // Performance telemetry calculations
  const stats = useMemo(() => {
    const total = matches.length;
    const todayStr = getLocalDateString();
    const todayMatches = matches.filter((m) => m.matchDate === todayStr).length;

    const winsMap: Record<string, number> = {};
    matches.forEach((m) => {
      if (m.winnerName) {
        winsMap[m.winnerName] = (winsMap[m.winnerName] || 0) + 1;
      }
    });

    let topPlayer = 'No Data';
    let topWins = 0;
    Object.entries(winsMap).forEach(([name, count]) => {
      if (count > topWins) {
        topWins = count;
        topPlayer = name;
      }
    });

    return { total, todayMatches, distinctBatches: batches.length, topPlayer, topWins };
  }, [matches, batches]);

  const resetModal = () => {
    setModalError(null);
    setBatchUuid('');
    setMatchDate(getLocalDateString());
    setTeamAPlayer1('');
    setTeamAPlayer1Uuid(undefined);
    setTeamAPlayer2('');
    setTeamAPlayer2Uuid(undefined);
    setTeamBPlayer1('');
    setTeamBPlayer1Uuid(undefined);
    setTeamBPlayer2('');
    setTeamBPlayer2Uuid(undefined);
    setRacketFormat('SINGLES');
    setRacketScoreA('');
    setRacketScoreB('');
    setCricketFormat('10 Overs');
    setCricketRunsA('');
    setCricketWicketsA('');
    setCricketOversA('');
    setCricketRunsB('');
    setCricketWicketsB('');
    setCricketOversB('');
    setFootballFormat('5v5 Turf');
    setFootballGoalsA('');
    setFootballGoalsB('');
    setBasketballFormat('5v5 Full Court');
    setBasketballScoreA('');
    setBasketballScoreB('');
    setSelectedWinner(null);
  };

  // Record Match Submit Handler
  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamAPlayer1.trim()) {
      setModalError('Please select or enter Team A Player 1 / Captain');
      return;
    }
    if (!teamBPlayer1.trim()) {
      setModalError('Please select or enter Team B Player 1 / Captain');
      return;
    }

    const isRacketDoubles = sportCategory === 'RACKET' && racketFormat === 'DOUBLES';
    if (isRacketDoubles && (!teamAPlayer2.trim() || !teamBPlayer2.trim())) {
      setModalError('Please select both partners for doubles match');
      return;
    }

    const teamAName =
      isRacketDoubles && teamAPlayer2.trim()
        ? `${teamAPlayer1.trim()} & ${teamAPlayer2.trim()}`
        : teamAPlayer1.trim();

    const teamBName =
      isRacketDoubles && teamBPlayer2.trim()
        ? `${teamBPlayer1.trim()} & ${teamBPlayer2.trim()}`
        : teamBPlayer1.trim();

    let sA = 0;
    let sB = 0;
    let scoresDetail = '';
    let matchTypeStr = 'SINGLES';

    if (sportCategory === 'RACKET') {
      sA = parseInt(racketScoreA, 10) || 0;
      sB = parseInt(racketScoreB, 10) || 0;
      matchTypeStr = racketFormat;
      scoresDetail = `${sA} - ${sB} pts`;
    } else if (sportCategory === 'CRICKET') {
      sA = parseInt(cricketRunsA, 10) || 0;
      sB = parseInt(cricketRunsB, 10) || 0;
      matchTypeStr = cricketFormat;
      const wA = cricketWicketsA !== '' ? cricketWicketsA : '0';
      const wB = cricketWicketsB !== '' ? cricketWicketsB : '0';
      const oA = cricketOversA.trim() ? `${cricketOversA} ov` : '';
      const oB = cricketOversB.trim() ? `${cricketOversB} ov` : '';
      scoresDetail = `${sA}/${wA}${oA ? ` (${oA})` : ''} vs ${sB}/${wB}${oB ? ` (${oB})` : ''}`;
    } else if (sportCategory === 'FOOTBALL') {
      sA = parseInt(footballGoalsA, 10) || 0;
      sB = parseInt(footballGoalsB, 10) || 0;
      matchTypeStr = footballFormat;
      scoresDetail = `${sA} - ${sB} goals`;
    } else if (sportCategory === 'BASKETBALL') {
      sA = parseInt(basketballScoreA, 10) || 0;
      sB = parseInt(basketballScoreB, 10) || 0;
      matchTypeStr = basketballFormat;
      scoresDetail = `${sA} - ${sB} pts`;
    }

    const winnerTeam = selectedWinner === 'TEAM_B' ? 2 : (sB > sA ? 2 : 1);
    const winnerName = winnerTeam === 1 ? teamAName : teamBName;
    const batchObj = batches.find((b) => b.batchUuid === batchUuid);

    try {
      setSavingMatch(true);
      setModalError(null);

      const payload = {
        organizationUuid: orgUuid,
        matchTitle: `${matchSport} ${matchTypeStr} Sparring`,
        sportType: matchSport,
        matchType: matchTypeStr,
        batchUuid: batchUuid || undefined,
        batchName: batchObj ? batchObj.batchName : undefined,
        matchDate: matchDate || getLocalDateString(),
        status: 'COMPLETED' as const,

        // Team 1
        player1Uuid: teamAPlayer1Uuid,
        player1Name: teamAPlayer1.trim(),
        player2Uuid: isRacketDoubles ? teamAPlayer2Uuid : undefined,
        player2Name: isRacketDoubles ? teamAPlayer2.trim() : undefined,
        team1Score: sA,

        // Team 2
        player3Uuid: teamBPlayer1Uuid,
        player3Name: teamBPlayer1.trim(),
        player4Uuid: isRacketDoubles ? teamBPlayer2Uuid : undefined,
        player4Name: isRacketDoubles ? teamBPlayer2.trim() : undefined,
        team2Score: sB,

        scoresDetail,
        winnerTeam,
        winnerName,
      };

      await AcademyMatchService.createMatch(payload);
      showToast('Match recorded! Performance updated.');
      setIsAddModalOpen(false);
      resetModal();
      loadData();
    } catch (err: any) {
      console.error('Failed to record match:', err);
      setModalError(err?.message || 'Failed to record match. Please try again.');
    } finally {
      setSavingMatch(false);
    }
  };

  // Delete Match Handler
  const handleDeleteMatch = async (matchUuid: string) => {
    if (!confirm('Are you sure you want to delete this sparring record?')) return;
    try {
      await AcademyMatchService.deleteMatch(matchUuid);
      setMatches((prev) => prev.filter((m) => m.matchUuid !== matchUuid));
      showToast('Match record deleted.');
    } catch (err) {
      console.error('Failed to delete match:', err);
      showToast('Failed to delete match.', true);
    }
  };

  const activeSportList = orgSports.length > 0 ? orgSports : ['Badminton', 'Cricket', 'Football', 'Tennis', 'Table Tennis'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ─── TOAST NOTIFICATIONS ─── */}
      {toastSuccess && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500 text-black font-black text-xs shadow-2xl shadow-emerald-500/30 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastSuccess}</span>
        </div>
      )}
      {toastError && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl bg-red-500 text-white font-black text-xs shadow-2xl shadow-red-500/30 animate-in fade-in slide-in-from-top-4 duration-200">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{toastError}</span>
        </div>
      )}

      {/* ─── 1. HERO & TELEMETRY ARENA BANNER ─── */}
      <div
        className="relative rounded-[32px] p-6 sm:p-8 border overflow-hidden shadow-xl"
        style={{
          backgroundColor: 'var(--athlon-card)',
          borderColor: 'var(--athlon-border)',
        }}
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shadow-sm">
                <Swords className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                  Academy Matches
                </h1>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start lg:self-center">
            {/* View Mode Toggle */}
            <div
              className="flex items-center p-1 rounded-2xl border bg-surface/80 shadow-inner"
              style={{ borderColor: 'var(--athlon-border)' }}
            >
              <button
                onClick={() => setViewMode('CARDS')}
                className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${viewMode === 'CARDS'
                  ? 'bg-primary text-black font-black shadow-sm'
                  : 'text-foreground/60 hover:text-foreground'
                  }`}
                title="Cards Arena View"
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">Arena</span>
              </button>
              <button
                onClick={() => setViewMode('TABLE')}
                className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${viewMode === 'TABLE'
                  ? 'bg-primary text-black font-black shadow-sm'
                  : 'text-foreground/60 hover:text-foreground'
                  }`}
                title="Matrix Table View"
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">Table</span>
              </button>
            </div>

            {canManageMatches && (
              <button
                onClick={() => {
                  resetModal();
                  setIsAddModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-primary text-black text-xs sm:text-sm font-black tracking-wide hover:opacity-90 shadow-lg shadow-primary/25 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" strokeWidth={3} />
                <span>Record Match</span>
              </button>
            )}
          </div>
        </div>

        {/* ─── 4 KPI Telemetry Cards ─── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-foreground/5">
          <div
            className="p-3.5 sm:p-4 rounded-2xl border flex items-center gap-3.5 shadow-sm"
            style={{
              backgroundColor: 'var(--athlon-surface)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-foreground/50 tracking-wider block">
                Total Sparrings
              </span>
              <span className="text-lg sm:text-xl font-black text-foreground font-mono">
                {stats.total}
              </span>
            </div>
          </div>

          <div
            className="p-3.5 sm:p-4 rounded-2xl border flex items-center gap-3.5 shadow-sm"
            style={{
              backgroundColor: 'var(--athlon-surface)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-700 dark:text-amber-400 shrink-0">
              <Flame className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-foreground/50 tracking-wider block">
                Today&apos;s Bouts
              </span>
              <span className="text-lg sm:text-xl font-black text-foreground font-mono">
                {stats.todayMatches}
              </span>
            </div>
          </div>

          <div
            className="p-3.5 sm:p-4 rounded-2xl border flex items-center gap-3.5 shadow-sm"
            style={{
              backgroundColor: 'var(--athlon-surface)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-700 dark:text-blue-400 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-foreground/50 tracking-wider block">
                Active Batches
              </span>
              <span className="text-lg sm:text-xl font-black text-foreground font-mono">
                {batches.length}
              </span>
            </div>
          </div>

          <div
            className="p-3.5 sm:p-4 rounded-2xl border flex items-center gap-3.5 shadow-sm"
            style={{
              backgroundColor: 'var(--athlon-surface)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-700 dark:text-purple-400 shrink-0">
              <Crown className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-foreground/50 tracking-wider block">
                Top Athlete
              </span>
              <span className="text-xs sm:text-sm font-black text-foreground truncate block" title={stats.topPlayer}>
                {stats.topPlayer}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 2. INTERACTIVE FILTERS & SEARCH ROW ─── */}
      {/* DESKTOP FILTER BAR (md and above) */}
      <div className="hidden md:flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-foreground/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student, opponent, batch, or sport..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-surface border text-xs font-semibold text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary transition-all shadow-inner"
            style={{ borderColor: 'var(--athlon-border)' }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-foreground/40 hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sport Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 hide-scrollbar">
          <button
            onClick={() => setSelectedSport('ALL')}
            className={`px-3.5 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all border ${selectedSport === 'ALL'
              ? 'bg-primary text-black border-primary shadow-md'
              : 'bg-surface text-foreground/75 border-border hover:bg-foreground/5'
              }`}
          >
            All Sports
          </button>
          {activeSportList.map((sport) => (
            <button
              key={sport}
              onClick={() => setSelectedSport(sport)}
              className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1.5 ${selectedSport.toLowerCase() === sport.toLowerCase()
                ? 'bg-primary text-black border-primary shadow-md font-black'
                : 'bg-surface text-foreground/75 border-border hover:bg-foreground/5'
                }`}
            >
              <span>{AVAILABLE_SPORTS_ICONS[sport] || '🏅'}</span>
              <span>{sport}</span>
            </button>
          ))}
        </div>

        {/* Batch Filter Dropdown */}
        {batches.length > 0 && (
          <div className="shrink-0">
            <select
              value={selectedBatchUuid}
              onChange={(e) => setSelectedBatchUuid(e.target.value)}
              className="px-4 py-3 rounded-2xl bg-surface border text-xs font-bold text-foreground focus:outline-none focus:border-primary transition-all shadow-sm"
              style={{ borderColor: 'var(--athlon-border)' }}
            >
              <option value="ALL">All Batches</option>
              {batches.map((b) => (
                <option key={b.batchUuid} value={b.batchUuid}>
                  {b.batchName}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Date Quick Jump */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setSelectedDate(getLocalDateString())}
            className={`px-3.5 py-2.5 rounded-2xl text-xs font-black transition-all border ${selectedDate === getLocalDateString()
              ? 'bg-primary text-black border-primary shadow-sm'
              : 'bg-surface text-foreground/75 border-border hover:bg-foreground/5'
              }`}
          >
            Today
          </button>
          <button
            onClick={() => setSelectedDate('')}
            className={`px-3.5 py-2.5 rounded-2xl text-xs font-black transition-all border ${selectedDate === ''
              ? 'bg-primary text-black border-primary shadow-sm'
              : 'bg-surface text-foreground/75 border-border hover:bg-foreground/5'
              }`}
          >
            All Dates
          </button>
        </div>
      </div>

      {/* MOBILE FILTER DOCK (Phones / small screens only) */}
      <div className="flex md:hidden flex-col gap-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-foreground/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student, batch, opponent..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-surface border text-xs font-semibold text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary shadow-inner"
            style={{ borderColor: 'var(--athlon-border)' }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-foreground/40 hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Horizontal Sports Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 hide-scrollbar">
          <button
            onClick={() => setSelectedSport('ALL')}
            className={`px-3 py-2 rounded-xl text-xs font-black whitespace-nowrap shrink-0 transition-all border ${selectedSport === 'ALL'
              ? 'bg-primary text-black border-primary shadow-sm'
              : 'bg-surface text-foreground/75 border-border'
              }`}
          >
            All Sports
          </button>
          {activeSportList.map((sport) => (
            <button
              key={sport}
              onClick={() => setSelectedSport(sport)}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all border flex items-center gap-1.5 ${selectedSport.toLowerCase() === sport.toLowerCase()
                ? 'bg-primary text-black border-primary shadow-sm font-black'
                : 'bg-surface text-foreground/75 border-border'
                }`}
            >
              <span className="text-xs">{AVAILABLE_SPORTS_ICONS[sport] || '🏅'}</span>
              <span>{sport}</span>
            </button>
          ))}
        </div>

        {/* Secondary Row */}
        <div className="grid grid-cols-2 gap-2">
          <div className="relative">
            <select
              value={selectedBatchUuid}
              onChange={(e) => setSelectedBatchUuid(e.target.value)}
              className="w-full h-10 px-3 pr-7 rounded-xl bg-surface border text-xs font-bold text-foreground focus:outline-none focus:border-primary transition-all truncate appearance-none"
              style={{ borderColor: 'var(--athlon-border)' }}
            >
              <option value="ALL">All Batches</option>
              {batches.map((b) => (
                <option key={b.batchUuid} value={b.batchUuid}>
                  {b.batchName}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-foreground/40 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div
            className="h-10 grid grid-cols-2 gap-1 p-1 rounded-xl border bg-surface"
            style={{ borderColor: 'var(--athlon-border)' }}
          >
            <button
              type="button"
              onClick={() => setSelectedDate(getLocalDateString())}
              className={`rounded-lg text-[11px] font-bold transition-all flex items-center justify-center ${selectedDate === getLocalDateString()
                ? 'bg-primary text-black shadow-sm font-black'
                : 'text-foreground/70 hover:text-foreground'
                }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setSelectedDate('')}
              className={`rounded-lg text-[11px] font-bold transition-all flex items-center justify-center ${selectedDate === ''
                ? 'bg-primary text-black shadow-sm font-black'
                : 'text-foreground/70 hover:text-foreground'
                }`}
            >
              All Dates
            </button>
          </div>
        </div>
      </div>

      {/* ─── 3. MATCHES DISPLAY (ARENA CARDS OR MATRIX TABLE) ─── */}
      {loading ? (
        <div
          className="rounded-[32px] p-24 text-center border flex flex-col items-center justify-center gap-3 shadow-sm"
          style={{
            backgroundColor: 'var(--athlon-card)',
            borderColor: 'var(--athlon-border)',
          }}
        >
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm font-bold text-foreground/60">Loading arena sparrings...</p>
        </div>
      ) : filteredMatches.length === 0 ? (
        <div
          className="rounded-[32px] p-16 sm:p-20 text-center border space-y-4 shadow-sm"
          style={{
            backgroundColor: 'var(--athlon-card)',
            borderColor: 'var(--athlon-border)',
          }}
        >
          <div className="w-16 h-16 rounded-3xl bg-primary/10 border border-primary/20 mx-auto flex items-center justify-center text-primary shadow-inner">
            <Swords className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg sm:text-xl font-black text-foreground">
              {selectedDate
                ? `No bouts recorded on ${new Date(`${selectedDate}T00:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`
                : 'No sparring matches recorded yet'}
            </h3>
            <p className="text-xs text-foreground/50 font-medium leading-relaxed">
              Start recording internal sparring and practice match scores to build student skill telemetry.
            </p>
          </div>
          {canManageMatches && (
            <button
              onClick={() => {
                resetModal();
                setIsAddModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-black text-xs sm:text-sm font-black tracking-wide hover:opacity-90 shadow-lg shadow-primary/20"
            >
              <Plus className="w-4 h-4" strokeWidth={3} /> Record Match
            </button>
          )}
        </div>
      ) : viewMode === 'CARDS' ? (
        /* ─── ARENA BATTLE CARDS GRID ─── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredMatches.map((match) => {
            const teamAName = match.player2Name
              ? `${match.player1Name} & ${match.player2Name}`
              : match.player1Name;
            const teamBName = match.player4Name
              ? `${match.player3Name} & ${match.player4Name}`
              : match.player3Name;
            const isTeamAWinner = match.winnerTeam === 1 || (match.team1Score ?? 0) > (match.team2Score ?? 0);
            const isTeamBWinner = match.winnerTeam === 2 || (match.team2Score ?? 0) > (match.team1Score ?? 0);

            return (
              <div
                key={match.matchUuid}
                className="group relative rounded-[28px] border overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.01] flex flex-col justify-between"
                style={{
                  backgroundColor: 'var(--athlon-card)',
                  borderColor: 'var(--athlon-border)',
                }}
              >
                <div
                  className={`h-1.5 w-full ${isTeamAWinner ? 'bg-gradient-to-r from-blue-500 to-emerald-500' : 'bg-gradient-to-r from-purple-500 to-emerald-500'
                    }`}
                />

                <div className="p-5 space-y-4">
                  {/* Card Header: Sport, Format, Date, Delete Action */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-lg shrink-0">{AVAILABLE_SPORTS_ICONS[match.sportType] || '🏅'}</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-primary/15 text-primary border border-primary/25">
                        {match.matchType || 'MATCH'}
                      </span>
                      {match.batchName && (
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-surface border border-border text-foreground/75 truncate max-w-[110px]">
                          {match.batchName}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-foreground/50">
                        {match.matchDate
                          ? new Date(`${match.matchDate}T00:00:00`).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                          })
                          : 'Recent'}
                      </span>
                      {canManageMatches && (
                        <button
                          onClick={() => handleDeleteMatch(match.matchUuid)}
                          className="p-1.5 rounded-lg text-foreground/30 hover:text-red-500 hover:bg-red-500/10 transition-colors opacity-60 group-hover:opacity-100"
                          title="Delete match record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* ─── HEAD-TO-HEAD BATTLE ARENA ─── */}
                  <div
                    className="p-4 rounded-2xl border space-y-3 shadow-inner relative overflow-hidden"
                    style={{
                      backgroundColor: 'var(--athlon-surface)',
                      borderColor: 'var(--athlon-border)',
                    }}
                  >
                    {/* Team A Row */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 border shadow-sm ${isTeamAWinner
                            ? 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/40 ring-2 ring-blue-500/20'
                            : 'bg-foreground/5 text-foreground/60 border-border'
                            }`}
                        >
                          A
                        </div>
                        <div className="min-w-0">
                          <span
                            className={`text-xs sm:text-sm font-black leading-tight truncate block ${isTeamAWinner ? 'text-foreground' : 'text-foreground/80'
                              }`}
                          >
                            {teamAName}
                          </span>
                          {isTeamAWinner && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mt-0.5">
                              <Crown className="w-3 h-3" /> Winner
                            </span>
                          )}
                        </div>
                      </div>

                      <div
                        className={`px-3 py-1.5 rounded-xl font-mono font-black text-sm shrink-0 border ${isTeamAWinner
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40 shadow-sm'
                          : 'bg-card text-foreground/75 border-border'
                          }`}
                      >
                        {match.sportType.toLowerCase() === 'cricket' && match.scoresDetail
                          ? match.scoresDetail.split('vs')[0]?.trim() || match.team1Score
                          : match.team1Score ?? 0}
                      </div>
                    </div>

                    {/* VS Central Divider */}
                    <div className="relative flex items-center justify-center my-1">
                      <div className="w-full border-t border-foreground/5" />
                      <span className="absolute px-2 py-0.5 rounded-full bg-card border border-border text-[8px] font-black uppercase tracking-widest text-foreground/40">
                        VS
                      </span>
                    </div>

                    {/* Team B Row */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 border shadow-sm ${isTeamBWinner
                            ? 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/40 ring-2 ring-purple-500/20'
                            : 'bg-foreground/5 text-foreground/60 border-border'
                            }`}
                        >
                          B
                        </div>
                        <div className="min-w-0">
                          <span
                            className={`text-xs sm:text-sm font-black leading-tight truncate block ${isTeamBWinner ? 'text-foreground' : 'text-foreground/80'
                              }`}
                          >
                            {teamBName}
                          </span>
                          {isTeamBWinner && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mt-0.5">
                              <Crown className="w-3 h-3" /> Winner
                            </span>
                          )}
                        </div>
                      </div>

                      <div
                        className={`px-3 py-1.5 rounded-xl font-mono font-black text-sm shrink-0 border ${isTeamBWinner
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40 shadow-sm'
                          : 'bg-card text-foreground/75 border-border'
                          }`}
                      >
                        {match.sportType.toLowerCase() === 'cricket' && match.scoresDetail
                          ? match.scoresDetail.split('vs')[1]?.trim() || match.team2Score
                          : match.team2Score ?? 0}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer details */}
                <div
                  className="px-5 py-3 border-t flex items-center justify-between text-[10px] font-bold text-foreground/60"
                  style={{ borderColor: 'var(--athlon-border)' }}
                >
                  <span className="flex items-center gap-1">
                    <Target className="w-3 h-3 text-primary" /> {match.scoresDetail || 'Training Sparring'}
                  </span>
                  <span className="text-primary font-black uppercase tracking-wider">
                    COMPLETED
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ─── MATRIX TABLE VIEW ─── */
        <div
          className="rounded-[28px] border overflow-hidden shadow-sm"
          style={{
            backgroundColor: 'var(--athlon-card)',
            borderColor: 'var(--athlon-border)',
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-foreground/5 bg-foreground/[0.02]">
                  <th className="px-6 py-4 text-xs font-black text-foreground/70 dark:text-foreground/50 uppercase tracking-widest">
                    Date &amp; Sport
                  </th>
                  <th className="px-6 py-4 text-xs font-black text-foreground/70 dark:text-foreground/50 uppercase tracking-widest">
                    Batch
                  </th>
                  <th className="px-6 py-4 text-xs font-black text-foreground/70 dark:text-foreground/50 uppercase tracking-widest">
                    Team A
                  </th>
                  <th className="px-6 py-4 text-xs font-black text-foreground/70 dark:text-foreground/50 uppercase tracking-widest text-center">
                    Score / Result
                  </th>
                  <th className="px-6 py-4 text-xs font-black text-foreground/70 dark:text-foreground/50 uppercase tracking-widest">
                    Team B
                  </th>
                  <th className="px-6 py-4 text-xs font-black text-foreground/70 dark:text-foreground/50 uppercase tracking-widest">
                    Winner
                  </th>
                  {canManageMatches && (
                    <th className="px-6 py-4 text-xs font-black text-foreground/70 dark:text-foreground/50 uppercase tracking-widest text-right">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/5">
                {filteredMatches.map((match) => {
                  const teamAName = match.player2Name
                    ? `${match.player1Name} & ${match.player2Name}`
                    : match.player1Name;
                  const teamBName = match.player4Name
                    ? `${match.player3Name} & ${match.player4Name}`
                    : match.player3Name;
                  const isTeamAWinner = match.winnerTeam === 1 || (match.team1Score ?? 0) > (match.team2Score ?? 0);
                  const isTeamBWinner = match.winnerTeam === 2 || (match.team2Score ?? 0) > (match.team1Score ?? 0);

                  return (
                    <tr key={match.matchUuid} className="hover:bg-foreground/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="text-xs font-bold text-foreground">
                            {match.matchDate
                              ? new Date(`${match.matchDate}T00:00:00`).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })
                              : 'Recent'}
                          </div>
                          <div className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-primary">
                            <span>{AVAILABLE_SPORTS_ICONS[match.sportType] || '🏅'}</span>
                            <span>{match.sportType} · {match.matchType || 'MATCH'}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {match.batchName ? (
                          <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-surface border border-border text-foreground/80">
                            {match.batchName}
                          </span>
                        ) : (
                          <span className="text-xs text-foreground/40">-</span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-700 dark:text-blue-400 font-black text-xs flex items-center justify-center shrink-0 border border-blue-500/20">
                            A
                          </div>
                          <span className={`font-bold text-sm ${isTeamAWinner ? 'text-primary font-black' : 'text-foreground'}`}>
                            {teamAName}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <span
                          className="inline-flex items-center px-3.5 py-1.5 rounded-xl bg-surface border font-mono font-black text-xs text-foreground tracking-wider shadow-inner"
                          style={{ borderColor: 'var(--athlon-border)' }}
                        >
                          {match.scoresDetail || `${match.team1Score ?? 0} – ${match.team2Score ?? 0}`}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-700 dark:text-purple-400 font-black text-xs flex items-center justify-center shrink-0 border border-purple-500/20">
                            B
                          </div>
                          <span className={`font-bold text-sm ${isTeamBWinner ? 'text-primary font-black' : 'text-foreground'}`}>
                            {teamBName}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {isTeamAWinner || isTeamBWinner ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/25">
                            <Crown className="w-3 h-3 text-emerald-800 dark:text-emerald-400" />
                            {isTeamAWinner ? teamAName : teamBName}
                          </span>
                        ) : (
                          <span className="text-xs text-foreground/40">-</span>
                        )}
                      </td>

                      {canManageMatches && (
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDeleteMatch(match.matchUuid)}
                            className="p-2 rounded-xl text-foreground/40 hover:text-red-500 hover:bg-red-500/10 transition-colors opacity-80 group-hover:opacity-100"
                            title="Delete match record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── 4. SPORT-ADAPTIVE RECORD MATCH MODAL ─── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center p-2.5 sm:p-6 pt-3 sm:pt-10 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
          <div
            className="w-full max-w-2xl rounded-[28px] sm:rounded-[36px] border shadow-2xl flex flex-col my-auto sm:my-0 animate-in zoom-in-95 duration-200 overflow-hidden"
            style={{
              backgroundColor: 'var(--athlon-surface)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            {/* Modal Header */}
            <div
              className="p-3.5 sm:p-6 sm:pb-4 border-b flex items-center justify-between shrink-0 gap-3"
              style={{ borderColor: 'var(--athlon-border)' }}
            >
              <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shadow-sm text-lg sm:text-2xl shrink-0">
                  {AVAILABLE_SPORTS_ICONS[matchSport] || '🏅'}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-base sm:text-xl font-black text-foreground tracking-tight truncate">
                      Record {matchSport}
                    </h4>
                    <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-black bg-primary/15 text-primary border border-primary/25 shrink-0">
                      {sportCategory}
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  resetModal();
                }}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-foreground/5 hover:bg-foreground/10 text-foreground/60 hover:text-foreground flex items-center justify-center transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleCreateMatch} className="flex flex-col flex-grow">
              <div className="p-3.5 sm:p-6 space-y-3.5 sm:space-y-5 overflow-y-auto max-h-[75vh]">
                {modalError && (
                  <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold flex items-center gap-2.5">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{modalError}</span>
                  </div>
                )}

                {/* ─── 1. SPORT & ADAPTIVE FORMAT SELECTORS ─── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Sport Selector */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-foreground/70">
                      Select Sport
                    </label>
                    <select
                      value={matchSport}
                      onChange={(e) => setMatchSport(e.target.value)}
                      className="w-full bg-background border rounded-2xl px-4 py-3 text-xs font-bold text-foreground focus:outline-none focus:border-primary transition-all shadow-sm"
                      style={{ borderColor: 'var(--athlon-border)' }}
                    >
                      {activeSportList.map((sp) => (
                        <option key={sp} value={sp}>
                          {AVAILABLE_SPORTS_ICONS[sp] || '🏅'} {sp}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sport-Adaptive Format Selector */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-foreground/70">
                      Match Format / Category
                    </label>

                    {/* A. Racket / Net Sports Format */}
                    {sportCategory === 'RACKET' && (
                      <div
                        className="grid grid-cols-2 gap-1.5 bg-background p-1.5 rounded-2xl border"
                        style={{ borderColor: 'var(--athlon-border)' }}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setRacketFormat('SINGLES');
                            setTeamAPlayer2('');
                            setTeamAPlayer2Uuid(undefined);
                            setTeamBPlayer2('');
                            setTeamBPlayer2Uuid(undefined);
                          }}
                          className={`py-2 rounded-xl text-xs font-black transition-all text-center ${racketFormat === 'SINGLES'
                            ? 'bg-primary text-black shadow-md'
                            : 'text-foreground/60 hover:text-foreground'
                            }`}
                        >
                          Singles
                        </button>
                        <button
                          type="button"
                          onClick={() => setRacketFormat('DOUBLES')}
                          className={`py-2 rounded-xl text-xs font-black transition-all text-center ${racketFormat === 'DOUBLES'
                            ? 'bg-primary text-black shadow-md'
                            : 'text-foreground/60 hover:text-foreground'
                            }`}
                        >
                          Doubles
                        </button>
                      </div>
                    )}

                    {/* B. Cricket Format */}
                    {sportCategory === 'CRICKET' && (
                      <select
                        value={cricketFormat}
                        onChange={(e) => {
                          setCricketFormat(e.target.value);
                          if (e.target.value === '5 Overs') {
                            setCricketOversA('5.0');
                            setCricketOversB('5.0');
                          } else if (e.target.value === '10 Overs') {
                            setCricketOversA('10.0');
                            setCricketOversB('10.0');
                          } else if (e.target.value === '20 Overs (T20)') {
                            setCricketOversA('20.0');
                            setCricketOversB('20.0');
                          } else if (e.target.value === 'Super Over') {
                            setCricketOversA('1.0');
                            setCricketOversB('1.0');
                          }
                        }}
                        className="w-full bg-background border rounded-2xl px-4 py-3 text-xs font-bold text-foreground focus:outline-none focus:border-primary transition-all shadow-sm"
                        style={{ borderColor: 'var(--athlon-border)' }}
                      >
                        <option value="5 Overs">5 Overs Blitz</option>
                        <option value="10 Overs">10 Overs Practice Match</option>
                        <option value="20 Overs (T20)">20 Overs (T20 Match)</option>
                        <option value="Super Over">Super Over Shootout</option>
                        <option value="Nets Sparring">Nets / Box Cricket</option>
                      </select>
                    )}

                    {/* C. Football Format */}
                    {sportCategory === 'FOOTBALL' && (
                      <select
                        value={footballFormat}
                        onChange={(e) => setFootballFormat(e.target.value)}
                        className="w-full bg-background border rounded-2xl px-4 py-3 text-xs font-bold text-foreground focus:outline-none focus:border-primary transition-all shadow-sm"
                        style={{ borderColor: 'var(--athlon-border)' }}
                      >
                        <option value="5v5 Turf">5v5 Turf Match</option>
                        <option value="7v7 Match">7v7 Practice Match</option>
                        <option value="11v11 Full Squad">11v11 Full Squad</option>
                        <option value="Penalty Shootout">Penalty Shootout</option>
                      </select>
                    )}

                    {/* D. Basketball Format */}
                    {sportCategory === 'BASKETBALL' && (
                      <select
                        value={basketballFormat}
                        onChange={(e) => setBasketballFormat(e.target.value)}
                        className="w-full bg-background border rounded-2xl px-4 py-3 text-xs font-bold text-foreground focus:outline-none focus:border-primary transition-all shadow-sm"
                        style={{ borderColor: 'var(--athlon-border)' }}
                      >
                        <option value="3v3 Half Court">3v3 Half Court</option>
                        <option value="5v5 Full Court">5v5 Full Court</option>
                      </select>
                    )}
                  </div>
                </div>

                {/* ─── 2. BATCH & MATCH DATE ─── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-foreground/70">
                      Batch (Optional Filter)
                    </label>
                    <select
                      value={batchUuid}
                      onChange={(e) => setBatchUuid(e.target.value)}
                      className="w-full bg-background border rounded-2xl px-4 py-3 text-xs font-bold text-foreground focus:outline-none focus:border-primary transition-all shadow-sm"
                      style={{ borderColor: 'var(--athlon-border)' }}
                    >
                      <option value="">All Batches / General</option>
                      {batches.map((b) => (
                        <option key={b.batchUuid} value={b.batchUuid}>
                          {b.batchName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-foreground/70">
                      Match Date
                    </label>
                    <input
                      type="date"
                      value={matchDate}
                      onChange={(e) => setMatchDate(e.target.value)}
                      className="w-full bg-background border rounded-2xl px-4 py-3 text-xs font-mono font-bold text-foreground focus:outline-none focus:border-primary transition-all shadow-sm"
                      style={{ borderColor: 'var(--athlon-border)' }}
                    />
                  </div>
                </div>

                {/* ─── 3. DYNAMIC ARENA MATCHUP (TEAM A vs TEAM B) ─── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  {/* ─── TEAM A CARD ─── */}
                  <div
                    className={`p-5 rounded-3xl border transition-all space-y-3.5 relative overflow-hidden ${selectedWinner === 'TEAM_A'
                      ? 'bg-blue-500/10 border-blue-500/40 ring-2 ring-blue-500/20'
                      : 'bg-blue-500/5 border-blue-500/20'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                        <User className="w-4 h-4" /> Team A
                      </span>
                      {selectedWinner === 'TEAM_A' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30">
                          <Crown className="w-3 h-3" /> Winner
                        </span>
                      )}
                    </div>

                    {/* Student Selectors */}
                    <div className="space-y-2">
                      <StudentSelector
                        label={
                          sportCategory === 'CRICKET'
                            ? 'Select Team A Captain / Batter...'
                            : sportCategory === 'FOOTBALL' || sportCategory === 'BASKETBALL'
                              ? 'Select Team A Captain / Key Athlete...'
                              : 'Select Player 1...'
                        }
                        value={teamAPlayer1}
                        onChange={(name, uuid) => {
                          setTeamAPlayer1(name);
                          setTeamAPlayer1Uuid(uuid);
                        }}
                        students={modalAvailableStudents}
                        disabledNames={[teamBPlayer1, teamBPlayer2, teamAPlayer2].filter(Boolean)}
                      />

                      {sportCategory === 'RACKET' && racketFormat === 'DOUBLES' && (
                        <StudentSelector
                          label="Select Player 2 (Partner)..."
                          value={teamAPlayer2}
                          onChange={(name, uuid) => {
                            setTeamAPlayer2(name);
                            setTeamAPlayer2Uuid(uuid);
                          }}
                          students={modalAvailableStudents}
                          disabledNames={[teamAPlayer1, teamBPlayer1, teamBPlayer2].filter(Boolean)}
                        />
                      )}
                    </div>

                    {/* SPORT-SPECIFIC SCORING PANEL FOR TEAM A */}
                    {/* A. RACKET SCORE */}
                    {sportCategory === 'RACKET' && (
                      <div className="p-3.5 rounded-2xl bg-background/90 border border-blue-500/20 flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider text-foreground/70">
                          Final Points:
                        </span>
                        <input
                          type="number"
                          placeholder="0"
                          value={racketScoreA}
                          onChange={(e) => setRacketScoreA(e.target.value)}
                          className="w-24 text-center py-2 px-3 rounded-xl bg-surface border text-xl font-black font-mono text-foreground focus:outline-none focus:border-primary transition-all shadow-inner"
                          style={{ borderColor: 'var(--athlon-border)' }}
                        />
                      </div>
                    )}

                    {/* B. CRICKET SCORE FOR TEAM A */}
                    {sportCategory === 'CRICKET' && (
                      <div className="p-3.5 rounded-2xl bg-background/90 border border-blue-500/20 space-y-2.5">
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <span className="text-[10px] font-bold text-foreground/60 uppercase block mb-1">
                              Runs
                            </span>
                            <input
                              type="number"
                              placeholder="0"
                              value={cricketRunsA}
                              onChange={(e) => setCricketRunsA(e.target.value)}
                              className="w-full text-center py-1.5 px-2 rounded-xl bg-surface border text-base font-black font-mono text-foreground focus:outline-none focus:border-primary shadow-inner"
                              style={{ borderColor: 'var(--athlon-border)' }}
                            />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-foreground/60 uppercase block mb-1">
                              Wickets
                            </span>
                            <input
                              type="number"
                              min={0}
                              max={10}
                              placeholder="0"
                              value={cricketWicketsA}
                              onChange={(e) => setCricketWicketsA(e.target.value)}
                              className="w-full text-center py-1.5 px-2 rounded-xl bg-surface border text-base font-black font-mono text-foreground focus:outline-none focus:border-primary shadow-inner"
                              style={{ borderColor: 'var(--athlon-border)' }}
                            />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-foreground/60 uppercase block mb-1">
                              Overs
                            </span>
                            <input
                              type="text"
                              placeholder="10.0"
                              value={cricketOversA}
                              onChange={(e) => setCricketOversA(e.target.value)}
                              className="w-full text-center py-1.5 px-2 rounded-xl bg-surface border text-base font-black font-mono text-foreground focus:outline-none focus:border-primary shadow-inner"
                              style={{ borderColor: 'var(--athlon-border)' }}
                            />
                          </div>
                        </div>
                        {(cricketRunsA !== '' || cricketWicketsA !== '') && (
                          <div className="text-center text-xs font-mono font-black text-primary">
                            Score: {cricketRunsA || 0}/{cricketWicketsA || 0} {cricketOversA ? `(${cricketOversA} ov)` : ''}
                          </div>
                        )}
                      </div>
                    )}

                    {/* C. FOOTBALL SCORE FOR TEAM A */}
                    {sportCategory === 'FOOTBALL' && (
                      <div className="p-3.5 rounded-2xl bg-background/90 border border-blue-500/20 flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider text-foreground/70">
                          Goals Scored:
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const curr = parseInt(footballGoalsA, 10) || 0;
                              setFootballGoalsA(String(Math.max(0, curr - 1)));
                            }}
                            className="w-8 h-8 rounded-xl bg-surface border font-black text-base flex items-center justify-center text-foreground hover:bg-foreground/10 transition-colors"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min={0}
                            placeholder="0"
                            value={footballGoalsA}
                            onChange={(e) => setFootballGoalsA(e.target.value)}
                            className="w-16 text-center py-1.5 px-2 rounded-xl bg-surface border text-lg font-black font-mono text-foreground focus:outline-none focus:border-primary"
                            style={{ borderColor: 'var(--athlon-border)' }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const curr = parseInt(footballGoalsA, 10) || 0;
                              setFootballGoalsA(String(curr + 1));
                            }}
                            className="w-8 h-8 rounded-xl bg-primary text-black font-black text-base flex items-center justify-center hover:opacity-90 transition-opacity"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    )}

                    {/* D. BASKETBALL SCORE FOR TEAM A */}
                    {sportCategory === 'BASKETBALL' && (
                      <div className="p-3.5 rounded-2xl bg-background/90 border border-blue-500/20 flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider text-foreground/70">
                          Total Points:
                        </span>
                        <input
                          type="number"
                          placeholder="0"
                          value={basketballScoreA}
                          onChange={(e) => setBasketballScoreA(e.target.value)}
                          className="w-24 text-center py-2 px-3 rounded-xl bg-surface border text-xl font-black font-mono text-foreground focus:outline-none focus:border-primary transition-all shadow-inner"
                          style={{ borderColor: 'var(--athlon-border)' }}
                        />
                      </div>
                    )}
                  </div>

                  {/* ─── TEAM B CARD ─── */}
                  <div
                    className={`p-5 rounded-3xl border transition-all space-y-3.5 relative overflow-hidden ${selectedWinner === 'TEAM_B'
                      ? 'bg-purple-500/10 border-purple-500/40 ring-2 ring-purple-500/20'
                      : 'bg-purple-500/5 border-purple-500/20'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
                        <User className="w-4 h-4" /> Team B
                      </span>
                      {selectedWinner === 'TEAM_B' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30">
                          <Crown className="w-3 h-3" /> Winner
                        </span>
                      )}
                    </div>

                    {/* Student Selectors */}
                    <div className="space-y-2">
                      <StudentSelector
                        label={
                          sportCategory === 'CRICKET'
                            ? 'Select Team B Captain / Opponent...'
                            : sportCategory === 'FOOTBALL' || sportCategory === 'BASKETBALL'
                              ? 'Select Team B Captain / Opponent...'
                              : 'Select Player 1 (Opponent)...'
                        }
                        value={teamBPlayer1}
                        onChange={(name, uuid) => {
                          setTeamBPlayer1(name);
                          setTeamBPlayer1Uuid(uuid);
                        }}
                        students={modalAvailableStudents}
                        disabledNames={[teamAPlayer1, teamAPlayer2, teamBPlayer2].filter(Boolean)}
                      />

                      {sportCategory === 'RACKET' && racketFormat === 'DOUBLES' && (
                        <StudentSelector
                          label="Select Player 2 (Opponent Partner)..."
                          value={teamBPlayer2}
                          onChange={(name, uuid) => {
                            setTeamBPlayer2(name);
                            setTeamBPlayer2Uuid(uuid);
                          }}
                          students={modalAvailableStudents}
                          disabledNames={[teamAPlayer1, teamAPlayer2, teamBPlayer1].filter(Boolean)}
                        />
                      )}
                    </div>

                    {/* SPORT-SPECIFIC SCORING PANEL FOR TEAM B */}
                    {/* A. RACKET SCORE */}
                    {sportCategory === 'RACKET' && (
                      <div className="p-3.5 rounded-2xl bg-background/90 border border-purple-500/20 flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider text-foreground/70">
                          Final Points:
                        </span>
                        <input
                          type="number"
                          placeholder="0"
                          value={racketScoreB}
                          onChange={(e) => setRacketScoreB(e.target.value)}
                          className="w-24 text-center py-2 px-3 rounded-xl bg-surface border text-xl font-black font-mono text-foreground focus:outline-none focus:border-primary transition-all shadow-inner"
                          style={{ borderColor: 'var(--athlon-border)' }}
                        />
                      </div>
                    )}

                    {/* B. CRICKET SCORE FOR TEAM B */}
                    {sportCategory === 'CRICKET' && (
                      <div className="p-3.5 rounded-2xl bg-background/90 border border-purple-500/20 space-y-2.5">
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <span className="text-[10px] font-bold text-foreground/60 uppercase block mb-1">
                              Runs
                            </span>
                            <input
                              type="number"
                              placeholder="0"
                              value={cricketRunsB}
                              onChange={(e) => setCricketRunsB(e.target.value)}
                              className="w-full text-center py-1.5 px-2 rounded-xl bg-surface border text-base font-black font-mono text-foreground focus:outline-none focus:border-primary shadow-inner"
                              style={{ borderColor: 'var(--athlon-border)' }}
                            />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-foreground/60 uppercase block mb-1">
                              Wickets
                            </span>
                            <input
                              type="number"
                              min={0}
                              max={10}
                              placeholder="0"
                              value={cricketWicketsB}
                              onChange={(e) => setCricketWicketsB(e.target.value)}
                              className="w-full text-center py-1.5 px-2 rounded-xl bg-surface border text-base font-black font-mono text-foreground focus:outline-none focus:border-primary shadow-inner"
                              style={{ borderColor: 'var(--athlon-border)' }}
                            />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-foreground/60 uppercase block mb-1">
                              Overs
                            </span>
                            <input
                              type="text"
                              placeholder="10.0"
                              value={cricketOversB}
                              onChange={(e) => setCricketOversB(e.target.value)}
                              className="w-full text-center py-1.5 px-2 rounded-xl bg-surface border text-base font-black font-mono text-foreground focus:outline-none focus:border-primary shadow-inner"
                              style={{ borderColor: 'var(--athlon-border)' }}
                            />
                          </div>
                        </div>
                        {(cricketRunsB !== '' || cricketWicketsB !== '') && (
                          <div className="text-center text-xs font-mono font-black text-primary">
                            Score: {cricketRunsB || 0}/{cricketWicketsB || 0} {cricketOversB ? `(${cricketOversB} ov)` : ''}
                          </div>
                        )}
                      </div>
                    )}

                    {/* C. FOOTBALL SCORE FOR TEAM B */}
                    {sportCategory === 'FOOTBALL' && (
                      <div className="p-3.5 rounded-2xl bg-background/90 border border-purple-500/20 flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider text-foreground/70">
                          Goals Scored:
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const curr = parseInt(footballGoalsB, 10) || 0;
                              setFootballGoalsB(String(Math.max(0, curr - 1)));
                            }}
                            className="w-8 h-8 rounded-xl bg-surface border font-black text-base flex items-center justify-center text-foreground hover:bg-foreground/10 transition-colors"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min={0}
                            placeholder="0"
                            value={footballGoalsB}
                            onChange={(e) => setFootballGoalsB(e.target.value)}
                            className="w-16 text-center py-1.5 px-2 rounded-xl bg-surface border text-lg font-black font-mono text-foreground focus:outline-none focus:border-primary"
                            style={{ borderColor: 'var(--athlon-border)' }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const curr = parseInt(footballGoalsB, 10) || 0;
                              setFootballGoalsB(String(curr + 1));
                            }}
                            className="w-8 h-8 rounded-xl bg-primary text-black font-black text-base flex items-center justify-center hover:opacity-90 transition-opacity"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    )}

                    {/* D. BASKETBALL SCORE FOR TEAM B */}
                    {sportCategory === 'BASKETBALL' && (
                      <div className="p-3.5 rounded-2xl bg-background/90 border border-purple-500/20 flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider text-foreground/70">
                          Total Points:
                        </span>
                        <input
                          type="number"
                          placeholder="0"
                          value={basketballScoreB}
                          onChange={(e) => setBasketballScoreB(e.target.value)}
                          className="w-24 text-center py-2 px-3 rounded-xl bg-surface border text-xl font-black font-mono text-foreground focus:outline-none focus:border-primary transition-all shadow-inner"
                          style={{ borderColor: 'var(--athlon-border)' }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div
                className="p-6 pt-4 border-t flex items-center justify-end gap-3 shrink-0"
                style={{ borderColor: 'var(--athlon-border)' }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    resetModal();
                  }}
                  className="px-5 py-3 rounded-2xl border border-foreground/10 text-xs font-bold text-foreground/70 hover:text-foreground hover:bg-foreground/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingMatch}
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-2xl bg-primary text-black text-xs sm:text-sm font-black tracking-wide hover:opacity-90 shadow-xl shadow-primary/25 disabled:opacity-50 active:scale-95 transition-all"
                >
                  {savingMatch ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Result...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" strokeWidth={3} />
                      <span>Save</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
