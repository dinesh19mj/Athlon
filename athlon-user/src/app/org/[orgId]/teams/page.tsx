'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useParams } from 'next/navigation';
import {
  Activity,
  Plus,
  Trophy,
  Users,
  CheckCircle2,
  X,
  AlertCircle,
  AlertTriangle,
  Medal,
  Calendar,
  Swords,
  Sparkles,
  Flame,
  Search,
  Crown,
  MapPin,
  TrendingUp,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Filter,
  ArrowUpRight,
  Shield,
  Zap,
  RotateCcw,
  Check,
  User,
  Loader2,
  Star,
} from 'lucide-react';
import {
  CommunityService,
  CommunityTeam,
  CommunityMatch,
  CreateTeamRequest,
  RecordMatchRequest,
  CommunityMemberDto,
} from '@/lib/api/community';
import { UserService } from '@/lib/api/user';
import { Athlon3DIcon } from '@/components/common/Athlon3DIcon';
import { useOrgRole } from '@/hooks/use-org-role';

// Helper to get local date formatted as YYYY-MM-DD
const getLocalDateString = (d: Date = new Date()): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// ─── COMMUNITY PARTICIPANT SELECTOR (MATCHES CLUB WORKSPACE) ────────
interface ParticipantSelectorProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  members: CommunityMemberDto[];
  teams: CommunityTeam[];
  disabledNames?: string[];
}

function CommunityParticipantSelector({
  label,
  value,
  onChange,
  members,
  teams,
  disabledNames = [],
}: ParticipantSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const selectedMember = members.find((m) => m.fullName === value);
  const selectedTeam = teams.find((t) => t.name === value);

  const filteredMembers = useMemo(() => {
    if (!search.trim()) return members;
    return members.filter((m) =>
      m.fullName?.toLowerCase().includes(search.toLowerCase())
    );
  }, [members, search]);

  const filteredTeams = useMemo(() => {
    if (!search.trim()) return teams;
    return teams.filter((t) =>
      t.name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [teams, search]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
          value
            ? 'bg-background border-foreground/20 text-foreground shadow-sm'
            : 'bg-background/80 border-foreground/10 text-foreground/40 hover:border-primary/40'
        }`}
        style={{ borderColor: 'var(--athlon-border)' }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {selectedMember ? (
            <>
              <div className="w-7 h-7 rounded-lg bg-foreground/10 border border-foreground/10 overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
                {selectedMember.photoUrl || selectedMember.userAvatar ? (
                  <img
                    src={UserService.getPhotoUrl(selectedMember.photoUrl || selectedMember.userAvatar)}
                    alt={selectedMember.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-black text-primary">
                    {selectedMember.fullName?.charAt(0)?.toUpperCase()}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-foreground truncate block">
                  {selectedMember.fullName}
                </span>
                <span className="text-[10px] text-foreground/40 truncate block">
                  {selectedMember.role}
                </span>
              </div>
            </>
          ) : selectedTeam ? (
            <>
              <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-xs shrink-0">
                {selectedTeam.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-foreground truncate block">
                  {selectedTeam.name}
                </span>
                <span className="text-[10px] text-primary truncate block">
                  Squad ({selectedTeam.sport})
                </span>
              </div>
            </>
          ) : value ? (
            <>
              <div className="w-7 h-7 rounded-lg bg-foreground/10 flex items-center justify-center text-foreground font-black text-xs shrink-0">
                {value.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-bold text-foreground truncate">
                {value}
              </span>
            </>
          ) : (
            <>
              <div className="w-7 h-7 rounded-lg bg-foreground/5 border border-foreground/10 flex items-center justify-center text-foreground/30 shrink-0">
                <User className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-medium text-foreground/40">{label}</span>
            </>
          )}
        </div>

        {value ? (
          <div
            onClick={(e) => {
              e.stopPropagation();
              onChange('');
            }}
            className="p-1 rounded-md hover:bg-foreground/10 text-foreground/40 hover:text-foreground transition-colors"
            title="Clear selection"
          >
            <X className="w-3.5 h-3.5" />
          </div>
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-foreground/40 shrink-0 ml-1" />
        )}
      </button>

      {/* DROPDOWN MENU */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setIsOpen(false)} />
          <div
            className="absolute top-full left-0 right-0 mt-1.5 z-30 max-h-56 overflow-y-auto rounded-2xl border shadow-2xl p-1.5 space-y-1 bg-surface animate-in fade-in zoom-in-95 duration-150"
            style={{
              backgroundColor: 'var(--athlon-surface)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            {/* Search Input */}
            <div className="relative p-1">
              <Search className="w-3.5 h-3.5 text-foreground/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search member or squad..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-background border text-xs text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary"
                style={{ borderColor: 'var(--athlon-border)' }}
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Custom Write-in if search does not match */}
            {search.trim() && !members.some((m) => m.fullName.toLowerCase() === search.toLowerCase()) && !teams.some((t) => t.name.toLowerCase() === search.toLowerCase()) && (
              <button
                type="button"
                onClick={() => {
                  onChange(search.trim());
                  setIsOpen(false);
                  setSearch('');
                }}
                className="w-full flex items-center gap-2 p-2 rounded-xl text-left bg-primary/10 text-primary hover:bg-primary/20 transition-all text-xs font-bold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Use &quot;{search.trim()}&quot; (Custom / Guest)</span>
              </button>
            )}

            {/* Members List */}
            {filteredMembers.length > 0 && (
              <div className="space-y-0.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-foreground/40 px-2 pt-1 block">
                  Community Members ({filteredMembers.length})
                </span>
                {filteredMembers.map((m) => {
                  const isDisabled = disabledNames.includes(m.fullName);
                  const isSelected = m.fullName === value;
                  return (
                    <button
                      key={m.userUuid}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => {
                        onChange(m.fullName);
                        setIsOpen(false);
                        setSearch('');
                      }}
                      className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left transition-all ${
                        isSelected
                          ? 'bg-primary text-black font-black shadow-sm'
                          : isDisabled
                          ? 'opacity-40 cursor-not-allowed bg-transparent'
                          : 'hover:bg-foreground/5 text-foreground'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-lg bg-foreground/10 border border-foreground/10 overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
                        {m.photoUrl || m.userAvatar ? (
                          <img
                            src={UserService.getPhotoUrl(m.photoUrl || m.userAvatar)}
                            alt={m.fullName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className={`text-xs font-black ${isSelected ? 'text-black' : 'text-primary'}`}>
                            {m.fullName?.charAt(0)?.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-grow">
                        <span className="text-xs font-bold truncate block">{m.fullName}</span>
                        <span className={`text-[10px] truncate block ${isSelected ? 'text-black/70' : 'text-foreground/40'}`}>
                          {m.role}
                        </span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-black shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Squads List */}
            {filteredTeams.length > 0 && (
              <div className="space-y-0.5 pt-1 border-t" style={{ borderColor: 'var(--athlon-border)' }}>
                <span className="text-[10px] font-black uppercase tracking-wider text-foreground/40 px-2 pt-1 block">
                  Squads ({filteredTeams.length})
                </span>
                {filteredTeams.map((t) => {
                  const isDisabled = disabledNames.includes(t.name);
                  const isSelected = t.name === value;
                  return (
                    <button
                      key={t.teamId}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => {
                        onChange(t.name);
                        setIsOpen(false);
                        setSearch('');
                      }}
                      className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left transition-all ${
                        isSelected
                          ? 'bg-primary text-black font-black shadow-sm'
                          : isDisabled
                          ? 'opacity-40 cursor-not-allowed bg-transparent'
                          : 'hover:bg-foreground/5 text-foreground'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-xs shrink-0">
                        {t.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs font-bold truncate flex-grow">{t.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-black shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}

            {filteredMembers.length === 0 && filteredTeams.length === 0 && (
              <div className="p-3 text-center text-xs text-foreground/40">
                No members or squads found. Type above to add a player.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ─── SPORT CONFIG & THEMES ───────────────────────────────────────────
interface SportMeta {
  icon: string;
  color: string;
  glow: string;
  bg: string;
  border: string;
}

const SPORT_CONFIGS: Record<string, SportMeta> = {
  Badminton: {
    icon: '🏸',
    color: '#10B981',
    glow: 'rgba(16, 185, 129, 0.25)',
    bg: 'rgba(16, 185, 129, 0.12)',
    border: 'rgba(16, 185, 129, 0.35)',
  },
  Football: {
    icon: '⚽',
    color: '#3B82F6',
    glow: 'rgba(59, 130, 246, 0.25)',
    bg: 'rgba(59, 130, 246, 0.12)',
    border: 'rgba(59, 130, 246, 0.35)',
  },
  Cricket: {
    icon: '🏏',
    color: '#F59E0B',
    glow: 'rgba(245, 158, 11, 0.25)',
    bg: 'rgba(245, 158, 11, 0.12)',
    border: 'rgba(245, 158, 11, 0.35)',
  },
  Tennis: {
    icon: '🎾',
    color: '#84CC16',
    glow: 'rgba(132, 204, 22, 0.25)',
    bg: 'rgba(132, 204, 22, 0.12)',
    border: 'rgba(132, 204, 22, 0.35)',
  },
  'Table Tennis': {
    icon: '🏓',
    color: '#EC4899',
    glow: 'rgba(236, 72, 153, 0.25)',
    bg: 'rgba(236, 72, 153, 0.12)',
    border: 'rgba(236, 72, 153, 0.35)',
  },
  Pickleball: {
    icon: '🥒',
    color: '#14B8A6',
    glow: 'rgba(20, 184, 166, 0.25)',
    bg: 'rgba(20, 184, 166, 0.12)',
    border: 'rgba(20, 184, 166, 0.35)',
  },
  Basketball: {
    icon: '🏀',
    color: '#F97316',
    glow: 'rgba(249, 115, 22, 0.25)',
    bg: 'rgba(249, 115, 22, 0.12)',
    border: 'rgba(249, 115, 22, 0.35)',
  },
  Volleyball: {
    icon: '🏐',
    color: '#8B5CF6',
    glow: 'rgba(139, 92, 246, 0.25)',
    bg: 'rgba(139, 92, 246, 0.12)',
    border: 'rgba(139, 92, 246, 0.35)',
  },
  Squash: {
    icon: '🎾',
    color: '#06B6D4',
    glow: 'rgba(6, 182, 212, 0.25)',
    bg: 'rgba(6, 182, 212, 0.12)',
    border: 'rgba(6, 182, 212, 0.35)',
  },
};

const DEFAULT_SPORT: SportMeta = {
  icon: '⚡',
  color: '#54AC68',
  glow: 'rgba(84, 172, 104, 0.25)',
  bg: 'rgba(84, 172, 104, 0.12)',
  border: 'rgba(84, 172, 104, 0.35)',
};

const ALL_SPORTS = ['Badminton', 'Football', 'Cricket', 'Tennis', 'Pickleball', 'Table Tennis', 'Basketball', 'Volleyball', 'Squash'];

type ViewTab = 'ALL' | 'SQUADS' | 'MATCHES' | 'LEADERBOARD';

interface LeaderboardEntry {
  id: string;
  name: string;
  subTitle?: string;
  avatar?: string;
  matchesPlayed: number;
  wins: number;
  losses: number;
  winRate: number; // percentage
  points: number; // 3 pts per win, 1 pt per match played
  form: ('W' | 'L')[];
  sport?: string;
}

export default function CommunityTeamsPage() {
  const params = useParams();
  const orgId = (params?.orgId as string) || '';
  const { org } = useOrgRole(orgId);

  const [teams, setTeams] = useState<CommunityTeam[]>([]);
  const [matches, setMatches] = useState<CommunityMatch[]>([]);
  const [members, setMembers] = useState<CommunityMemberDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filters & Navigation
  const [activeTab, setActiveTab] = useState<ViewTab>('ALL');
  const [selectedSport, setSelectedSport] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Leaderboard State (Club Workspace Parity)
  const [leaderboardDate, setLeaderboardDate] = useState<string>(getLocalDateString());
  const [isAllTime, setIsAllTime] = useState<boolean>(true);
  const [leaderboardType, setLeaderboardType] = useState<'ATHLETES' | 'SQUADS'>('ATHLETES');
  const [leaderboardSortBy, setLeaderboardSortBy] = useState<'POINTS' | 'WIN_RATE' | 'WINS'>('POINTS');
  const [leaderboardSearch, setLeaderboardSearch] = useState<string>('');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form Team Modal
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamSport, setTeamSport] = useState('Badminton');
  const [selectedCaptain, setSelectedCaptain] = useState<string>('');
  const [isSubmittingTeam, setIsSubmittingTeam] = useState(false);

  // Record Match Modal State (matching Club Workspace)
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchType, setMatchType] = useState<'SINGLES' | 'DOUBLES'>('SINGLES');
  const [matchDate, setMatchDate] = useState(getLocalDateString());
  const [matchSport, setMatchSport] = useState('Badminton');

  // Team A
  const [teamAPlayer1, setTeamAPlayer1] = useState('');
  const [teamAPlayer2, setTeamAPlayer2] = useState('');
  const [teamAScore, setTeamAScore] = useState('');

  // Team B
  const [teamBPlayer1, setTeamBPlayer1] = useState('');
  const [teamBPlayer2, setTeamBPlayer2] = useState('');
  const [teamBScore, setTeamBScore] = useState('');

  const [selectedWinner, setSelectedWinner] = useState<'TEAM_A' | 'TEAM_B' | ''>('');
  const [venueName, setVenueName] = useState('');
  const [matchNotes, setMatchNotes] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);
  const [isSubmittingMatch, setIsSubmittingMatch] = useState(false);

  // Auto calculate winner based on scores
  useEffect(() => {
    const sA = parseInt(teamAScore, 10);
    const sB = parseInt(teamBScore, 10);

    if (!isNaN(sA) && !isNaN(sB)) {
      if (sA > sB) {
        setSelectedWinner('TEAM_A');
      } else if (sB > sA) {
        setSelectedWinner('TEAM_B');
      } else {
        setSelectedWinner('');
      }
    } else {
      setSelectedWinner('');
    }
  }, [teamAScore, teamBScore]);

  const resetMatchModal = () => {
    setMatchType('SINGLES');
    setMatchDate(getLocalDateString());
    setTeamAPlayer1('');
    setTeamAPlayer2('');
    setTeamAScore('');
    setTeamBPlayer1('');
    setTeamBPlayer2('');
    setTeamBScore('');
    setSelectedWinner('');
    setVenueName('');
    setMatchNotes('');
    setModalError(null);
  };

  const triggerToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3800);
  };

  const fetchTeamsAndMatches = async () => {
    if (!orgId) return;
    try {
      setLoading(true);
      const [teamRes, matchRes, memberRes] = await Promise.allSettled([
        CommunityService.getTeams(orgId),
        CommunityService.getMatches(orgId).catch(() => []),
        CommunityService.getMembers(orgId).catch(() => []),
      ]);

      if (teamRes.status === 'fulfilled') {
        const data = (teamRes.value as any)?.data || teamRes.value;
        setTeams(Array.isArray(data) ? data : []);
      }
      if (matchRes.status === 'fulfilled') {
        const data = (matchRes.value as any)?.data || matchRes.value;
        setMatches(Array.isArray(data) ? data : []);
      }
      if (memberRes.status === 'fulfilled') {
        const data = (memberRes.value as any)?.data || memberRes.value;
        setMembers(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to load community team/match data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamsAndMatches();
  }, [orgId]);

  // Handle Team Creation
  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) return;
    try {
      setIsSubmittingTeam(true);
      const captainObj = members.find((m) => m.userUuid === selectedCaptain);
      const req: CreateTeamRequest = {
        name: teamName.trim(),
        sport: teamSport,
        captainUserUuid: selectedCaptain || undefined,
      };
      await CommunityService.createTeam(orgId, req);
      triggerToast(`🏆 Squad "${teamName}" formed successfully!`);
      setShowTeamModal(false);
      setTeamName('');
      setSelectedCaptain('');
      fetchTeamsAndMatches();
    } catch (err: any) {
      console.error('Failed to create team:', err);
      triggerToast(err?.message || 'Failed to form squad. Please try again.', 'error');
    } finally {
      setIsSubmittingTeam(false);
    }
  };

  // Handle Match Recording (matching Club Workspace)
  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamAPlayer1.trim() || !teamBPlayer1.trim()) {
      setModalError('Please select Player 1 for both Team A and Team B.');
      return;
    }

    if (matchType === 'DOUBLES' && (!teamAPlayer2.trim() || !teamBPlayer2.trim())) {
      setModalError('Please select Player 2 (Partner) for both sides in doubles match.');
      return;
    }

    if (teamAScore === '' || teamBScore === '') {
      setModalError('Please enter match score for both sides.');
      return;
    }

    const teamAName = matchType === 'DOUBLES' && teamAPlayer2.trim()
      ? `${teamAPlayer1.trim()} / ${teamAPlayer2.trim()}`
      : teamAPlayer1.trim();

    const teamBName = matchType === 'DOUBLES' && teamBPlayer2.trim()
      ? `${teamBPlayer1.trim()} / ${teamBPlayer2.trim()}`
      : teamBPlayer1.trim();

    try {
      setIsSubmittingMatch(true);
      setModalError(null);
      await CommunityService.recordMatch(orgId, {
        matchDate,
        sport: matchSport,
        teamAName,
        teamBName,
        scoreA: teamAScore.trim(),
        scoreB: teamBScore.trim(),
        venueName: venueName.trim() || undefined,
        notes: matchNotes.trim() || undefined,
      });
      triggerToast('⚡ Match result successfully recorded!');
      setShowMatchModal(false);
      resetMatchModal();
      fetchTeamsAndMatches();
    } catch (err: any) {
      console.error('Failed to record match:', err);
      setModalError(err?.message || 'Failed to record match scorecard.');
    } finally {
      setIsSubmittingMatch(false);
    }
  };

  // Quick action from squad card to pre-populate match dialog
  const handleQuickChallenge = (team: CommunityTeam) => {
    setTeamAPlayer1(team.name);
    setMatchSport(team.sport || 'Badminton');
    setTeamBPlayer1('');
    setTeamAScore('');
    setTeamBScore('');
    setShowMatchModal(true);
  };

  // Filtered Teams
  const filteredTeams = useMemo(() => {
    return teams.filter((t) => {
      const matchesSport = selectedSport === 'ALL' || (t.sport || '').toLowerCase() === selectedSport.toLowerCase();
      const matchesSearch =
        !searchQuery.trim() ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.captainName && t.captainName.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesSport && matchesSearch;
    });
  }, [teams, selectedSport, searchQuery]);

  // Filtered Matches
  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      const matchesSport = selectedSport === 'ALL' || (m.sport || '').toLowerCase() === selectedSport.toLowerCase();
      const matchesSearch =
        !searchQuery.trim() ||
        m.teamAName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.teamBName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.venueName && m.venueName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (m.notes && m.notes.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesSport && matchesSearch;
    });
  }, [matches, selectedSport, searchQuery]);

  // Standings calculation (sorted by win % then matches won)
  const squadStandings = useMemo(() => {
    return [...teams].sort((a, b) => {
      const winRateA = a.totalMatches > 0 ? a.matchesWon / a.totalMatches : 0;
      const winRateB = b.totalMatches > 0 ? b.matchesWon / b.totalMatches : 0;
      if (winRateB !== winRateA) return winRateB - winRateA;
      return b.matchesWon - a.matchesWon;
    });
  }, [teams]);

  // Top squad spotlight
  const topSquad = squadStandings.length > 0 && squadStandings[0].matchesWon > 0 ? squadStandings[0] : null;

  // Distinct sports in the community
  const availableSports = useMemo(() => {
    const set = new Set<string>();
    teams.forEach((t) => t.sport && set.add(t.sport));
    matches.forEach((m) => m.sport && set.add(m.sport));
    return Array.from(set);
  }, [teams, matches]);

  const handleShiftLeaderboardDate = (days: number) => {
    setIsAllTime(false);
    const base = leaderboardDate ? new Date(`${leaderboardDate}T00:00:00`) : new Date();
    base.setDate(base.getDate() + days);
    setLeaderboardDate(getLocalDateString(base));
  };

  const handleSetToday = () => {
    setIsAllTime(false);
    setLeaderboardDate(getLocalDateString());
  };

  const handleSetAllTime = () => {
    setIsAllTime(true);
  };

  // Filter matches based on selected date or All-Time and sport filter
  const filteredLeaderboardMatches = useMemo(() => {
    return matches.filter((m) => {
      const matchDateStr = (m.matchDate || '').split('T')[0];
      const matchesDate = isAllTime || matchDateStr === leaderboardDate;
      const matchesSport = selectedSport === 'ALL' || (m.sport || '').toLowerCase() === selectedSport.toLowerCase();
      return matchesDate && matchesSport;
    });
  }, [matches, leaderboardDate, isAllTime, selectedSport]);

  // Compute Athlete Leaderboard from members & matches
  const athleteLeaderboard: LeaderboardEntry[] = useMemo(() => {
    if (!members.length) return [];

    return members
      .filter((member) => Boolean(member && (member.fullName || member.userName)))
      .map((member) => {
        const rawName = (member.fullName || member.userName || 'Unknown Athlete').trim();
        const name = rawName.toLowerCase();

        // Find matches where member participated
        const playerMatches = name
          ? filteredLeaderboardMatches.filter((m) => {
              const teamA = (m.teamAName || '').toLowerCase();
              const teamB = (m.teamBName || '').toLowerCase();
              return teamA.includes(name) || teamB.includes(name);
            })
          : [];

        let wins = 0;
        let losses = 0;
        const form: ('W' | 'L')[] = [];

        // Sort matches chronologically
        const sorted = [...playerMatches].sort(
          (a, b) => new Date(b.matchDate || 0).getTime() - new Date(a.matchDate || 0).getTime()
        );

        sorted.forEach((m) => {
          const sA = parseInt(m.scoreA || '', 10);
          const sB = parseInt(m.scoreB || '', 10);
          const teamA = (m.teamAName || '').toLowerCase();
          const teamB = (m.teamBName || '').toLowerCase();

          const inTeamA = teamA.includes(name);
          const inTeamB = teamB.includes(name);

          if (!isNaN(sA) && !isNaN(sB)) {
            if (sA > sB) {
              if (inTeamA) {
                wins++;
                if (form.length < 5) form.push('W');
              } else if (inTeamB) {
                losses++;
                if (form.length < 5) form.push('L');
              }
            } else if (sB > sA) {
              if (inTeamB) {
                wins++;
                if (form.length < 5) form.push('W');
              } else if (inTeamA) {
                losses++;
                if (form.length < 5) form.push('L');
              }
            }
          }
        });

        const mp = wins + losses;
        const winRate = mp > 0 ? Math.round((wins / mp) * 100) : 0;
        const points = wins * 3 + mp * 1;

        return {
          id: member.userUuid || String(member.userId || Math.random()),
          name: rawName,
          subTitle: member.role || 'Member',
          avatar: member.photoUrl || member.userAvatar,
          matchesPlayed: mp,
          wins,
          losses,
          winRate,
          points,
          form: form.reverse(),
        };
      });
  }, [members, filteredLeaderboardMatches]);

  // Compute Squad Leaderboard from teams & matches
  const squadLeaderboard: LeaderboardEntry[] = useMemo(() => {
    if (!teams.length) return [];

    return teams
      .filter((t) => Boolean(t && (selectedSport === 'ALL' || (t.sport || '').toLowerCase() === selectedSport.toLowerCase())))
      .map((t) => {
        const rawName = (t.name || 'Unnamed Squad').trim();
        const squadName = rawName.toLowerCase();

        const squadMatches = squadName
          ? filteredLeaderboardMatches.filter((m) => {
              const teamA = (m.teamAName || '').toLowerCase();
              const teamB = (m.teamBName || '').toLowerCase();
              return teamA === squadName || teamB === squadName;
            })
          : [];

        let wins = 0;
        let losses = 0;
        const form: ('W' | 'L')[] = [];

        const sorted = [...squadMatches].sort(
          (a, b) => new Date(b.matchDate || 0).getTime() - new Date(a.matchDate || 0).getTime()
        );

        sorted.forEach((m) => {
          const sA = parseInt(m.scoreA || '', 10);
          const sB = parseInt(m.scoreB || '', 10);
          const teamA = (m.teamAName || '').toLowerCase();
          const teamB = (m.teamBName || '').toLowerCase();

          if (!isNaN(sA) && !isNaN(sB)) {
            if (sA > sB) {
              if (teamA === squadName) {
                wins++;
                if (form.length < 5) form.push('W');
              } else if (teamB === squadName) {
                losses++;
                if (form.length < 5) form.push('L');
              }
            } else if (sB > sA) {
              if (teamB === squadName) {
                wins++;
                if (form.length < 5) form.push('W');
              } else if (teamA === squadName) {
                losses++;
                if (form.length < 5) form.push('L');
              }
            }
          }
        });

        const mp = squadMatches.length > 0 ? (wins + losses) : (t.totalMatches || 0);
        const finalWins = squadMatches.length > 0 ? wins : (t.matchesWon || 0);
        const finalLosses = squadMatches.length > 0 ? losses : (t.matchesLost || 0);
        const winRate = mp > 0 ? Math.round((finalWins / mp) * 100) : 0;
        const points = finalWins * 3 + mp * 1;

        return {
          id: String(t.teamId || Math.random()),
          name: rawName,
          subTitle: `Squad (${t.sport || 'General'})`,
          sport: t.sport,
          matchesPlayed: mp,
          wins: finalWins,
          losses: finalLosses,
          winRate,
          points,
          form: form.reverse(),
        };
      });
  }, [teams, filteredLeaderboardMatches, selectedSport]);

  // Sorted and filtered active leaderboard
  const sortedLeaderboard = useMemo(() => {
    const list = leaderboardType === 'ATHLETES' ? athleteLeaderboard : squadLeaderboard;
    const searchLower = (leaderboardSearch || '').trim().toLowerCase();

    const filtered = list.filter((item) => {
      if (!item) return false;
      const itemName = (item.name || '').toLowerCase();
      const itemSub = (item.subTitle || '').toLowerCase();
      return !searchLower || itemName.includes(searchLower) || itemSub.includes(searchLower);
    });

    return filtered.sort((a, b) => {
      if (b.matchesPlayed > 0 && a.matchesPlayed === 0) return 1;
      if (a.matchesPlayed > 0 && b.matchesPlayed === 0) return -1;

      if (leaderboardSortBy === 'POINTS') {
        if (b.points !== a.points) return b.points - a.points;
        return b.winRate - a.winRate;
      }
      if (leaderboardSortBy === 'WIN_RATE') {
        if (b.winRate !== a.winRate) return b.winRate - a.winRate;
        return b.points - a.points;
      }
      if (leaderboardSortBy === 'WINS') {
        if (b.wins !== a.wins) return b.wins - a.wins;
        return b.points - a.points;
      }
      return 0;
    });
  }, [leaderboardType, athleteLeaderboard, squadLeaderboard, leaderboardSearch, leaderboardSortBy]);

  const activeLeaderboardParticipants = useMemo(() => sortedLeaderboard.filter((m) => m.matchesPlayed > 0), [sortedLeaderboard]);
  const topThree = useMemo(() => (activeLeaderboardParticipants.length > 0 ? activeLeaderboardParticipants : sortedLeaderboard).slice(0, 3), [activeLeaderboardParticipants, sortedLeaderboard]);

  return (
    <div className="min-h-screen text-foreground relative pb-28">
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-[140px] opacity-15"
          style={{ background: 'var(--athlon-primary)' }}
        />
        <div
          className="absolute top-1/3 -right-32 w-96 h-96 rounded-full blur-[160px] opacity-10"
          style={{ background: '#FF4B72' }}
        />
      </div>

      <div className="relative z-10 p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
        {/* ─── TOAST NOTIFICATION ─── */}
        {toastMessage && (
          <div
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl shadow-2xl border backdrop-blur-xl flex items-center gap-2.5 text-xs font-black transition-all animate-bounce ${toastMessage.type === 'success'
              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
              : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
              }`}
          >
            {toastMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
            <span>{toastMessage.text}</span>
          </div>
        )}

        {/* ─── 1. HERO MATCH CENTER BANNER ─── */}
        <div
          className="rounded-3xl border p-5 sm:p-7 relative overflow-hidden shadow-2xl backdrop-blur-xl transition-all"
          style={{
            backgroundColor: 'var(--athlon-card)',
            borderColor: 'var(--athlon-border)',
            backgroundImage: 'radial-gradient(ellipse at 85% 15%, var(--athlon-primary-glow) 0%, transparent 60%)',
          }}
        >
          {/* Subtle grid pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, #FFF 1px, transparent 0)',
              backgroundSize: '24px 24px',
            }}
          />

          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2.5 max-w-xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-[11px] font-black text-primary tracking-wider uppercase">
                <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                <span className="flex items-center gap-1">
                  <Swords className="w-3.5 h-3.5" />
                  Community Match Center
                </span>
              </div>

              {/* Title */}
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-foreground tracking-tight flex items-center gap-2.5">
                  <span>Matches &amp; Squads</span>
                  <Flame className="w-6 h-6 text-amber-400 shrink-0 inline hidden sm:inline" />
                </h1>
                <p className="text-xs sm:text-sm text-foreground/70 font-medium mt-1 leading-relaxed">
                  Log scrimmage results, track club squads, and follow head-to-head derbies for {org?.name || 'the community'}.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
              <button
                type="button"
                onClick={() => setShowTeamModal(true)}
                className="flex-1 sm:flex-none px-4 py-3 rounded-2xl bg-surface hover:bg-surface-hover border text-foreground font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md cursor-pointer group"
                style={{ borderColor: 'var(--athlon-border)' }}
              >
                <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-colors">
                  <Plus className="w-4 h-4 stroke-[3]" />
                </div>
                <span>Form Squad</span>
              </button>

              <button
                type="button"
                onClick={() => setShowMatchModal(true)}
                className="flex-1 sm:flex-none px-5 py-3 rounded-2xl bg-primary text-black font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/25 cursor-pointer relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none" />
                <Zap className="w-4 h-4 fill-current stroke-[2.5]" />
                <span>Matches</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div
            className="mt-6 pt-5 border-t grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs"
            style={{ borderColor: 'var(--athlon-border)' }}
          >
            <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-surface/50 border border-foreground/5">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider block">Squads</span>
                <span className="text-base font-black text-foreground">{teams.length}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-surface/50 border border-foreground/5">
              <div className="w-8 h-8 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center shrink-0">
                <Swords className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider block">Scrimmages</span>
                <span className="text-base font-black text-foreground">{matches.length}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-surface/50 border border-foreground/5">
              <div className="w-8 h-8 rounded-xl bg-emerald-400/10 text-emerald-400 flex items-center justify-center shrink-0">
                <Trophy className="w-4 h-4" />
              </div>
              <div className="truncate">
                <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider block">Top Squad</span>
                <span className="text-xs font-black text-foreground truncate block">
                  {topSquad ? topSquad.name : '—'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-surface/50 border border-foreground/5">
              <div className="w-8 h-8 rounded-xl bg-purple-400/10 text-purple-400 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider block">Active Sports</span>
                <span className="text-base font-black text-foreground">
                  {availableSports.length > 0 ? availableSports.length : '1'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── 2. CONTROLS, SEARCH & TABS ─── */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Navigation Tabs */}
            <div
              className="flex items-center p-1 rounded-2xl border bg-surface/80 max-w-full overflow-x-auto hide-scrollbar"
              style={{ borderColor: 'var(--athlon-border)' }}
            >
              {[
                { id: 'ALL', label: 'Overview', icon: Sparkles },
                { id: 'SQUADS', label: `Squads (${teams.length})`, icon: Users },
                { id: 'MATCHES', label: `Matches (${matches.length})`, icon: Swords },
                { id: 'LEADERBOARD', label: 'Leaderboard', icon: Medal },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as ViewTab)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${isActive
                      ? 'bg-primary text-black shadow-md'
                      : 'text-foreground/70 hover:text-foreground hover:bg-surface-hover'
                      }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Search Box */}
            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 text-foreground/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search squads, players, court..."
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-surface border text-xs text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary transition-all"
                style={{ borderColor: 'var(--athlon-border)' }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Sport Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
            <button
              onClick={() => setSelectedSport('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all border cursor-pointer ${selectedSport === 'ALL'
                ? 'bg-foreground text-background border-foreground shadow-sm'
                : 'bg-surface text-foreground/70 hover:text-foreground'
                }`}
              style={{ borderColor: selectedSport === 'ALL' ? undefined : 'var(--athlon-border)' }}
            >
              All Sports
            </button>
            {ALL_SPORTS.map((sport) => {
              const meta = SPORT_CONFIGS[sport] || DEFAULT_SPORT;
              const isSelected = selectedSport.toLowerCase() === sport.toLowerCase();
              return (
                <button
                  key={sport}
                  onClick={() => setSelectedSport(isSelected ? 'ALL' : sport)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all border flex items-center gap-1.5 cursor-pointer ${isSelected
                    ? 'shadow-sm text-foreground'
                    : 'bg-surface text-foreground/70 hover:text-foreground'
                    }`}
                  style={{
                    backgroundColor: isSelected ? meta.bg : undefined,
                    borderColor: isSelected ? meta.border : 'var(--athlon-border)',
                  }}
                >
                  <span>{meta.icon}</span>
                  <span>{sport}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── 3. CONTENT SECTIONS ─── */}
        {loading ? (
          /* Loading Skeleton */
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-44 rounded-3xl border bg-surface/50 animate-pulse"
                  style={{ borderColor: 'var(--athlon-border)' }}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* ─── SQUADS SECTION (Shown in ALL or SQUADS tab) ─── */}
            {(activeTab === 'ALL' || activeTab === 'SQUADS') && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                      <Users className="w-3.5 h-3.5" />
                    </div>
                    <h2 className="text-sm font-black text-foreground uppercase tracking-wider">
                      Squads
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-primary/15 text-primary border border-primary/25">
                      {filteredTeams.length}
                    </span>
                  </div>

                  <button
                    onClick={() => setShowTeamModal(true)}
                    className="text-xs font-black text-primary hover:underline flex items-center gap-1 uppercase tracking-wider cursor-pointer"
                  >
                    <span>+ Form Squad</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {filteredTeams.length === 0 ? (
                  /* ─── ULTRA-STYLISH EMPTY SQUAD STATE ─── */
                  <div
                    className="rounded-3xl border p-8 sm:p-10 text-center relative overflow-hidden shadow-lg backdrop-blur-md"
                    style={{
                      backgroundColor: 'var(--athlon-card)',
                      borderColor: 'var(--athlon-border)',
                      backgroundImage: 'radial-gradient(circle at 50% 30%, rgba(84, 172, 104, 0.08) 0%, transparent 70%)',
                    }}
                  >
                    <div className="max-w-md mx-auto space-y-4">
                      {/* Glowing Badge Container */}
                      <div className="w-20 h-20 mx-auto rounded-3xl bg-primary/10 border border-primary/30 flex items-center justify-center shadow-xl shadow-primary/10 relative group">
                        <div className="absolute inset-0 rounded-3xl bg-primary/20 blur-xl opacity-50 group-hover:opacity-100 transition-opacity" />
                        <Athlon3DIcon type="tournaments" size={48} />
                      </div>

                      <div className="space-y-1.5">
                        <h3 className="text-lg font-black text-foreground tracking-tight">
                          {teams.length === 0 ? 'No Squads Assembled Yet' : 'No Squads Match Your Filter'}
                        </h3>
                        <p className="text-xs text-foreground/60 leading-relaxed">
                          {teams.length === 0
                            ? 'Assemble friendly squads with your club mates to battle in internal scrimmages and climb the derby leaderboard.'
                            : 'Try adjusting your search keywords or sport filter above to find existing squads.'}
                        </p>
                      </div>

                      {/* Feature Highlights Pills */}
                      <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-[11px] text-foreground/70">
                        <span className="px-2.5 py-1 rounded-xl bg-surface border" style={{ borderColor: 'var(--athlon-border)' }}>
                          🛡️ Custom Squad Badges
                        </span>
                        <span className="px-2.5 py-1 rounded-xl bg-surface border" style={{ borderColor: 'var(--athlon-border)' }}>
                          📊 Win/Loss Stats
                        </span>
                        <span className="px-2.5 py-1 rounded-xl bg-surface border" style={{ borderColor: 'var(--athlon-border)' }}>
                          ⚔️ Derby Records
                        </span>
                      </div>

                      {/* Direct CTA */}
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => setShowTeamModal(true)}
                          className="px-6 py-2.5 rounded-2xl bg-primary text-black font-black text-xs inline-flex items-center gap-2 hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/20 cursor-pointer"
                        >
                          <Plus className="w-4 h-4 stroke-[3]" />
                          <span>Form Your First Squad</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Squads Grid */
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTeams.map((t) => {
                      const meta = SPORT_CONFIGS[t.sport] || DEFAULT_SPORT;
                      const winRate = t.totalMatches > 0 ? Math.round((t.matchesWon / t.totalMatches) * 100) : 0;
                      return (
                        <div
                          key={t.teamId}
                          className="p-5 rounded-3xl border space-y-4 shadow-sm hover:shadow-xl hover:border-primary/40 transition-all group relative overflow-hidden"
                          style={{
                            backgroundColor: 'var(--athlon-card)',
                            borderColor: 'var(--athlon-border)',
                          }}
                        >
                          {/* Corner ambient glow */}
                          <div
                            className="absolute -top-12 -right-12 w-24 h-24 rounded-full blur-2xl opacity-20 pointer-events-none transition-opacity group-hover:opacity-40"
                            style={{ background: meta.color }}
                          />

                          {/* Top Row: Crest & Name */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg border shadow-inner shrink-0 relative"
                                style={{
                                  backgroundColor: meta.bg,
                                  borderColor: meta.border,
                                  color: meta.color,
                                }}
                              >
                                <span>{t.name.charAt(0).toUpperCase()}</span>
                                <span className="absolute -bottom-1 -right-1 text-xs">
                                  {meta.icon}
                                </span>
                              </div>

                              <div className="min-w-0">
                                <h4 className="font-black text-sm text-foreground truncate group-hover:text-primary transition-colors">
                                  {t.name}
                                </h4>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span
                                    className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider"
                                    style={{
                                      backgroundColor: meta.bg,
                                      color: meta.color,
                                    }}
                                  >
                                    {t.sport}
                                  </span>
                                  {t.captainName && (
                                    <span className="text-[10px] text-foreground/50 truncate flex items-center gap-1">
                                      <Crown className="w-2.5 h-2.5 text-amber-400" />
                                      {t.captainName}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Quick Challenge Action */}
                            <button
                              type="button"
                              onClick={() => handleQuickChallenge(t)}
                              title="Log match for this squad"
                              className="p-2 rounded-xl bg-surface hover:bg-primary hover:text-black text-foreground/60 transition-all border shrink-0 cursor-pointer"
                              style={{ borderColor: 'var(--athlon-border)' }}
                            >
                              <Swords className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Win Rate Progress & Stats */}
                          <div
                            className="p-3 rounded-2xl bg-surface/70 border space-y-2"
                            style={{ borderColor: 'var(--athlon-border)' }}
                          >
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-foreground/60 flex items-center gap-1">
                                <TrendingUp className="w-3 h-3 text-primary" />
                                Win Rate
                              </span>
                              <span className="font-black text-primary font-mono">{winRate}%</span>
                            </div>

                            {/* Progress bar */}
                            <div className="w-full h-1.5 rounded-full bg-background overflow-hidden flex">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${winRate}%`,
                                  backgroundColor: winRate > 50 ? 'var(--athlon-primary)' : meta.color,
                                }}
                              />
                            </div>

                            <div className="flex items-center justify-between text-[11px] font-bold text-foreground/50 pt-0.5">
                              <span>
                                {t.matchesWon}W — {t.matchesLost}L
                              </span>
                              <span>{t.totalMatches} matches</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ─── MATCH HISTORY SECTION (Shown in ALL or MATCHES tab) ─── */}
            {(activeTab === 'ALL' || activeTab === 'MATCHES') && (
              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
                      <Swords className="w-3.5 h-3.5" />
                    </div>
                    <h2 className="text-sm font-black text-foreground uppercase tracking-wider">
                      Matches
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400/15 text-amber-400 border border-amber-400/25">
                      {filteredMatches.length}
                    </span>
                  </div>

                  <button
                    onClick={() => setShowMatchModal(true)}
                    className="text-xs font-black text-amber-400 hover:underline flex items-center gap-1 uppercase tracking-wider cursor-pointer"
                  >
                    <span>⚡ Record Match</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {filteredMatches.length === 0 ? (
                  /* ─── ULTRA-STYLISH EMPTY MATCHES STATE ─── */
                  <div
                    className="rounded-3xl border p-8 sm:p-10 text-center relative overflow-hidden shadow-lg backdrop-blur-md"
                    style={{
                      backgroundColor: 'var(--athlon-card)',
                      borderColor: 'var(--athlon-border)',
                      backgroundImage: 'radial-gradient(circle at 50% 30%, rgba(245, 158, 11, 0.08) 0%, transparent 70%)',
                    }}
                  >
                    <div className="max-w-md mx-auto space-y-4">
                      {/* Glowing Badge Container */}
                      <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center shadow-xl shadow-amber-400/10 relative group">
                        <div className="absolute inset-0 rounded-3xl bg-amber-400/20 blur-xl opacity-50 group-hover:opacity-100 transition-opacity" />
                        <Athlon3DIcon type="matches" size={48} />
                      </div>

                      <div className="space-y-1.5">
                        <h3 className="text-lg font-black text-foreground tracking-tight">
                          {matches.length === 0 ? 'No Scrimmages Recorded Yet' : 'No Matches Match Your Filter'}
                        </h3>
                        <p className="text-xs text-foreground/60 leading-relaxed">
                          {matches.length === 0
                            ? 'Played a friendly game on court today? Record the final scorecard to update squad standings and member brag rights.'
                            : 'Try selecting a different sport or clearing your search filter.'}
                        </p>
                      </div>

                      {/* Example score pills */}
                      <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-[11px] font-mono text-foreground/60">
                        <span className="px-2.5 py-1 rounded-xl bg-surface border" style={{ borderColor: 'var(--athlon-border)' }}>
                          🏸 21-19, 21-17
                        </span>
                        <span className="px-2.5 py-1 rounded-xl bg-surface border" style={{ borderColor: 'var(--athlon-border)' }}>
                          ⚽ 3 — 2
                        </span>
                        <span className="px-2.5 py-1 rounded-xl bg-surface border" style={{ borderColor: 'var(--athlon-border)' }}>
                          🎾 6-4, 7-5
                        </span>
                      </div>

                      {/* Direct CTA */}
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => setShowMatchModal(true)}
                          className="px-6 py-2.5 rounded-2xl bg-amber-400 text-black font-black text-xs inline-flex items-center gap-2 hover:bg-amber-300 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-amber-400/20 cursor-pointer"
                        >
                          <Zap className="w-4 h-4 fill-current stroke-[2.5]" />
                          <span>Log Your First Match</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Matches Cards (ESPN / Sofascore Style Duels) */
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredMatches.map((m) => {
                      const meta = SPORT_CONFIGS[m.sport] || DEFAULT_SPORT;
                      const hasScore = Boolean(m.scoreA || m.scoreB);
                      return (
                        <div
                          key={m.matchId}
                          className="p-5 rounded-3xl border space-y-4 shadow-sm hover:shadow-xl hover:border-amber-400/30 transition-all group relative overflow-hidden"
                          style={{
                            backgroundColor: 'var(--athlon-card)',
                            borderColor: 'var(--athlon-border)',
                          }}
                        >
                          {/* Card Header: Date & Venue */}
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 text-foreground/50">
                              <Calendar className="w-3.5 h-3.5" />
                              <span className="font-bold">{m.matchDate}</span>
                              {m.venueName && (
                                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface border text-[10px]" style={{ borderColor: 'var(--athlon-border)' }}>
                                  <MapPin className="w-2.5 h-2.5 text-primary" />
                                  {m.venueName}
                                </span>
                              )}
                            </div>

                            <span
                              className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1"
                              style={{
                                backgroundColor: meta.bg,
                                color: meta.color,
                              }}
                            >
                              <span>{meta.icon}</span>
                              <span>{m.sport}</span>
                            </span>
                          </div>

                          {/* Head-to-Head Duel Arena */}
                          <div
                            className="p-4 rounded-2xl bg-surface/80 border flex items-center justify-between gap-3 shadow-inner"
                            style={{ borderColor: 'var(--athlon-border)' }}
                          >
                            {/* Team A */}
                            <div className="flex-1 min-w-0 flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-black text-sm shrink-0">
                                {m.teamAName.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <span className="font-black text-xs sm:text-sm text-foreground truncate block">
                                  {m.teamAName}
                                </span>
                                <span className="text-[10px] text-foreground/50 font-bold block uppercase tracking-wider">
                                  Team A
                                </span>
                              </div>
                            </div>

                            {/* Score Pill / VS */}
                            <div className="shrink-0 flex flex-col items-center">
                              {hasScore ? (
                                <div
                                  className="px-3.5 py-1.5 rounded-xl font-mono font-black text-xs sm:text-sm text-primary bg-card border shadow-sm tracking-wider"
                                  style={{ borderColor: 'var(--athlon-border)' }}
                                >
                                  {m.scoreA || '0'} : {m.scoreB || '0'}
                                </div>
                              ) : (
                                <div className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-foreground/50 bg-card border" style={{ borderColor: 'var(--athlon-border)' }}>
                                  VS
                                </div>
                              )}
                              <span className="text-[9px] font-black text-foreground/40 uppercase tracking-widest mt-1">
                                FINAL
                              </span>
                            </div>

                            {/* Team B */}
                            <div className="flex-1 min-w-0 flex items-center justify-end gap-2.5 text-right">
                              <div className="min-w-0">
                                <span className="font-black text-xs sm:text-sm text-foreground truncate block">
                                  {m.teamBName}
                                </span>
                                <span className="text-[10px] text-foreground/50 font-bold block uppercase tracking-wider">
                                  Team B
                                </span>
                              </div>
                              <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center font-black text-sm shrink-0">
                                {m.teamBName.charAt(0).toUpperCase()}
                              </div>
                            </div>
                          </div>

                          {/* Footer: Notes & Recorded By */}
                          <div className="flex items-center justify-between text-[11px] text-foreground/50 pt-1">
                            {m.notes ? (
                              <p className="italic truncate max-w-[240px]">
                                &ldquo;{m.notes}&rdquo;
                              </p>
                            ) : (
                              <span className="text-[10px]">Friendly Scrimmage</span>
                            )}

                            {m.recordedByUserName && (
                              <span className="text-[10px] font-medium text-foreground/40 shrink-0">
                                Logged by {m.recordedByUserName}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ─── 4. COMMUNITY LEADERBOARD (MATCHES CLUB WORKSPACE) ─── */}
            {activeTab === 'LEADERBOARD' && (
              <div className="space-y-6">
                {/* ── LEADERBOARD TOP BANNER & TOGGLE ── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 text-primary border border-primary/25 text-xs font-black uppercase tracking-widest mb-2">
                      <Star className="w-3.5 h-3.5 fill-primary" /> Official Community Leaderboard
                    </div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                        Community Leaderboard
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-blue-500/15 text-blue-400 border border-blue-500/25 flex items-center gap-1">
                        <span>{selectedSport === 'ALL' ? '🏅' : (SPORT_CONFIGS[selectedSport] || DEFAULT_SPORT).icon}</span>
                        <span>{selectedSport === 'ALL' ? 'All Sports' : selectedSport}</span>
                      </span>
                    </div>
                    <p className="text-xs text-foreground/50 font-medium mt-0.5">
                      {isAllTime
                        ? `All-time community standings calculated from official scrimmage match results.`
                        : `Daily leaderboard for ${new Date(`${leaderboardDate}T00:00:00`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}.`}
                    </p>
                  </div>

                  {/* Leaderboard Category Switcher: Athletes vs Squads */}
                  <div
                    className="flex items-center p-1 rounded-2xl border bg-surface self-start sm:self-auto shrink-0 shadow-sm"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <button
                      type="button"
                      onClick={() => setLeaderboardType('ATHLETES')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        leaderboardType === 'ATHLETES'
                          ? 'bg-primary text-black shadow-md'
                          : 'text-foreground/60 hover:text-foreground'
                      }`}
                    >
                      👤 Athletes ({athleteLeaderboard.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setLeaderboardType('SQUADS')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        leaderboardType === 'SQUADS'
                          ? 'bg-primary text-black shadow-md'
                          : 'text-foreground/60 hover:text-foreground'
                      }`}
                    >
                      🛡️ Squads ({squadLeaderboard.length})
                    </button>
                  </div>
                </div>

                {/* ── TOP 3 PODIUM ARENA (MATCHES CLUB WORKSPACE) ── */}
                {activeLeaderboardParticipants.length > 0 ? (
                  <div className="flex justify-center items-end gap-2 sm:gap-4 md:gap-6 pt-3 sm:pt-6 pb-2 max-w-4xl mx-auto px-1 sm:px-2">
                    {/* 2nd Place (Silver) */}
                    {topThree[1] && (
                      <div className="flex flex-col items-center w-1/3 max-w-[220px] group transition-all">
                        <div className="relative mb-3 sm:mb-4 transform transition-transform group-hover:-translate-y-1 duration-300">
                          <div className="absolute -top-6 sm:-top-7 left-1/2 -translate-x-1/2 animate-bounce" style={{ animationDelay: '0.15s' }}>
                            <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-slate-300 drop-shadow-[0_0_10px_rgba(203,213,225,0.6)] fill-slate-300" />
                          </div>
                          <div className="w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden ring-3 sm:ring-4 ring-slate-300 shadow-[0_0_25px_rgba(203,213,225,0.25)] bg-surface flex items-center justify-center">
                            {topThree[1].avatar ? (
                              <img
                                src={UserService.getPhotoUrl(topThree[1].avatar)}
                                alt={topThree[1].name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-base sm:text-2xl font-black text-slate-300">
                                {topThree[1].name?.charAt(0)?.toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="absolute -bottom-2.5 sm:-bottom-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-slate-200 to-slate-400 text-slate-900 px-2 py-0.2 sm:px-2.5 sm:py-0.5 rounded-full font-black text-[9px] sm:text-xs shadow-md whitespace-nowrap">
                            2ND
                          </div>
                        </div>
                        <div className="w-full bg-gradient-to-b from-slate-500/10 to-surface border-t border-x border-slate-500/20 rounded-t-[22px] sm:rounded-t-[28px] h-[120px] sm:h-[180px] flex flex-col items-center justify-end pb-3 sm:pb-5 px-1.5 sm:px-2 text-center backdrop-blur-md">
                          <h3 className="font-black text-foreground text-xs sm:text-sm md:text-base truncate w-full mb-0.5">
                            {topThree[1].name}
                          </h3>
                          <div className="text-[10px] sm:text-xs font-mono text-foreground/50 mb-1">
                            <span className="text-emerald-400 font-bold">{topThree[1].wins}W</span>
                            {' - '}
                            <span className="text-red-400 font-bold">{topThree[1].losses}L</span>
                          </div>
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-500/20 border border-slate-500/30 font-mono font-black text-[10px] sm:text-xs text-slate-200">
                            {topThree[1].points} PTS
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 mt-1">
                            {topThree[1].winRate}% Win
                          </span>
                        </div>
                      </div>
                    )}

                    {/* 1st Place (Gold Champion) */}
                    {topThree[0] && (
                      <div className="flex flex-col items-center w-1/3 max-w-[240px] group transition-all z-10">
                        <div className="relative mb-3 sm:mb-5 transform transition-transform group-hover:-translate-y-2 duration-300">
                          <div className="absolute -top-7 sm:-top-9 left-1/2 -translate-x-1/2 animate-bounce">
                            <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)] fill-yellow-400" />
                          </div>
                          <div className="w-16 h-16 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden ring-4 sm:ring-4 ring-yellow-400 shadow-[0_0_35px_rgba(250,204,21,0.4)] bg-surface flex items-center justify-center">
                            {topThree[0].avatar ? (
                              <img
                                src={UserService.getPhotoUrl(topThree[0].avatar)}
                                alt={topThree[0].name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-xl sm:text-3xl font-black text-yellow-400">
                                {topThree[0].name?.charAt(0)?.toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="absolute -bottom-2.5 sm:-bottom-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 text-yellow-950 px-2.5 py-0.5 sm:px-3.5 sm:py-0.5 rounded-full font-black text-[10px] sm:text-xs shadow-lg whitespace-nowrap">
                            1ST CHAMPION
                          </div>
                        </div>
                        <div className="w-full bg-gradient-to-b from-yellow-500/15 via-yellow-500/5 to-surface border-t border-x border-yellow-500/30 rounded-t-[24px] sm:rounded-t-[32px] h-[155px] sm:h-[220px] flex flex-col items-center justify-end pb-3 sm:pb-6 px-1.5 sm:px-2 text-center backdrop-blur-md">
                          <h3 className="font-black text-foreground text-xs sm:text-base md:text-lg truncate w-full mb-0.5 text-primary">
                            {topThree[0].name}
                          </h3>
                          <div className="text-[10px] sm:text-xs font-mono text-foreground/60 mb-1.5">
                            <span className="text-emerald-400 font-bold">{topThree[0].wins}W</span>
                            {' - '}
                            <span className="text-red-400 font-bold">{topThree[0].losses}L</span>
                          </div>
                          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-yellow-500/20 border border-yellow-500/40 font-mono font-black text-[10px] sm:text-xs text-yellow-300 shadow-sm">
                            {topThree[0].points} PTS
                          </div>
                          <span className="text-[10px] font-black text-emerald-400 mt-1">
                            {topThree[0].winRate}% Win Rate
                          </span>
                        </div>
                      </div>
                    )}

                    {/* 3rd Place (Bronze) */}
                    {topThree[2] && (
                      <div className="flex flex-col items-center w-1/3 max-w-[220px] group transition-all">
                        <div className="relative mb-3 sm:mb-4 transform transition-transform group-hover:-translate-y-1 duration-300">
                          <div className="absolute -top-6 sm:-top-7 left-1/2 -translate-x-1/2 animate-bounce" style={{ animationDelay: '0.3s' }}>
                            <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.6)] fill-amber-500" />
                          </div>
                          <div className="w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden ring-3 sm:ring-4 ring-amber-700 shadow-[0_0_25px_rgba(245,158,11,0.25)] bg-surface flex items-center justify-center">
                            {topThree[2].avatar ? (
                              <img
                                src={UserService.getPhotoUrl(topThree[2].avatar)}
                                alt={topThree[2].name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-base sm:text-2xl font-black text-amber-500">
                                {topThree[2].name?.charAt(0)?.toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="absolute -bottom-2.5 sm:-bottom-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-600 to-amber-800 text-amber-100 px-2 py-0.2 sm:px-2.5 sm:py-0.5 rounded-full font-black text-[9px] sm:text-xs shadow-md whitespace-nowrap">
                            3RD
                          </div>
                        </div>
                        <div className="w-full bg-gradient-to-b from-amber-700/10 to-surface border-t border-x border-amber-700/20 rounded-t-[22px] sm:rounded-t-[28px] h-[105px] sm:h-[155px] flex flex-col items-center justify-end pb-3 sm:pb-5 px-1.5 sm:px-2 text-center backdrop-blur-md">
                          <h3 className="font-black text-foreground text-xs sm:text-sm md:text-base truncate w-full mb-0.5">
                            {topThree[2].name}
                          </h3>
                          <div className="text-[10px] sm:text-xs font-mono text-foreground/50 mb-1">
                            <span className="text-emerald-400 font-bold">{topThree[2].wins}W</span>
                            {' - '}
                            <span className="text-red-400 font-bold">{topThree[2].losses}L</span>
                          </div>
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-700/20 border border-amber-700/30 font-mono font-black text-[10px] sm:text-xs text-amber-300">
                            {topThree[2].points} PTS
                          </div>
                          <span className="text-[10px] font-bold text-amber-500 mt-1">
                            {topThree[2].winRate}% Win
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    className="p-6 text-center rounded-3xl border text-xs text-foreground/60 space-y-1.5"
                    style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                  >
                    <Trophy className="w-7 h-7 text-foreground/30 mx-auto mb-2" />
                    <p className="font-bold text-foreground">No matches recorded for this date timeframe.</p>
                    <p className="text-foreground/40">Switch to <strong>All Time</strong> or log scrimmage results to activate the live podium!</p>
                  </div>
                )}

                {/* ── DATE NAVIGATION & CALENDAR BAR (MATCHES CLUB WORKSPACE) ── */}
                <div
                  className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl p-3 sm:p-4 border shadow-sm"
                  style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                >
                  {/* Left Side: Day Steppers & Date Picker */}
                  <div className="flex items-center justify-between sm:justify-start gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleShiftLeaderboardDate(-1)}
                        className="p-2 rounded-xl bg-background border hover:bg-surface text-foreground/70 hover:text-foreground transition-colors active:scale-90 cursor-pointer"
                        style={{ borderColor: 'var(--athlon-border)' }}
                        title="Previous Day"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      {/* Calendar Date Input Picker */}
                      <div
                        className="relative flex items-center bg-background border rounded-xl px-3 py-1.5 text-xs font-bold text-foreground hover:border-primary/40 transition-colors shadow-inner"
                        style={{ borderColor: 'var(--athlon-border)' }}
                      >
                        <Calendar className="w-3.5 h-3.5 text-primary shrink-0 mr-1.5" />
                        <input
                          type="date"
                          value={leaderboardDate}
                          onChange={(e) => {
                            setIsAllTime(false);
                            setLeaderboardDate(e.target.value);
                          }}
                          className="bg-transparent text-xs font-bold text-foreground focus:outline-none cursor-pointer"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleShiftLeaderboardDate(1)}
                        className="p-2 rounded-xl bg-background border hover:bg-surface text-foreground/70 hover:text-foreground transition-colors active:scale-90 cursor-pointer"
                        style={{ borderColor: 'var(--athlon-border)' }}
                        title="Next Day"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    {!isAllTime && leaderboardDate && (
                      <span className="text-[11px] font-bold text-foreground/60 hidden sm:inline">
                        {new Date(`${leaderboardDate}T00:00:00`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </span>
                    )}
                  </div>

                  {/* Right Side: Quick Selectors (Today, All Time) */}
                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={handleSetToday}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        !isAllTime && leaderboardDate === getLocalDateString()
                          ? 'bg-primary text-black shadow-md shadow-primary/20'
                          : 'bg-background/80 text-foreground/70 hover:text-foreground border'
                      }`}
                      style={{ borderColor: !isAllTime && leaderboardDate === getLocalDateString() ? undefined : 'var(--athlon-border)' }}
                    >
                      Today
                    </button>

                    <button
                      type="button"
                      onClick={handleSetAllTime}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        isAllTime
                          ? 'bg-primary text-black shadow-md shadow-primary/20'
                          : 'bg-background/80 text-foreground/70 hover:text-foreground border'
                      }`}
                      style={{ borderColor: isAllTime ? undefined : 'var(--athlon-border)' }}
                    >
                      All Time
                    </button>
                  </div>
                </div>

                {/* ── FILTER & SORT BAR (MATCHES CLUB WORKSPACE) ── */}
                <div
                  className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl p-3 sm:p-4 border shadow-sm"
                  style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                >
                  {/* Search Box */}
                  <div className="relative flex-grow max-w-md">
                    <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/40 pointer-events-none" />
                    <input
                      type="text"
                      placeholder={`Search ${leaderboardType === 'ATHLETES' ? 'athlete' : 'squad'} by name...`}
                      value={leaderboardSearch}
                      onChange={(e) => setLeaderboardSearch(e.target.value)}
                      className="w-full bg-background border rounded-xl pl-9 pr-8 py-2 text-xs font-bold text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary transition-all shadow-inner"
                      style={{ borderColor: 'var(--athlon-border)' }}
                    />
                    {leaderboardSearch && (
                      <button
                        type="button"
                        onClick={() => setLeaderboardSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Sort Chips */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 hide-scrollbar">
                    <span className="text-[10px] font-black uppercase tracking-wider text-foreground/40 mr-0.5 shrink-0 hidden sm:inline">
                      Sort:
                    </span>
                    {[
                      { id: 'POINTS', label: 'Points (PTS)' },
                      { id: 'WIN_RATE', label: 'Win Rate (%)' },
                      { id: 'WINS', label: 'Total Wins' },
                    ].map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setLeaderboardSortBy(s.id as any)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 active:scale-95 cursor-pointer ${
                          leaderboardSortBy === s.id
                            ? 'bg-primary text-black shadow-md shadow-primary/20'
                            : 'bg-background/80 text-foreground/60 hover:text-foreground border'
                        }`}
                        style={{ borderColor: leaderboardSortBy === s.id ? undefined : 'var(--athlon-border)' }}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── FULL LEADERBOARD TABLE (DESKTOP) ── */}
                <div
                  className="hidden md:block rounded-[24px] border overflow-hidden shadow-lg"
                  style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                >
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b bg-surface/60 text-[10px] font-black uppercase tracking-wider text-foreground/50" style={{ borderColor: 'var(--athlon-border)' }}>
                          <th className="px-6 py-4 text-center w-16">Rank</th>
                          <th className="px-6 py-4">{leaderboardType === 'ATHLETES' ? 'Athlete' : 'Squad'}</th>
                          <th className="px-6 py-4 text-center">Played</th>
                          <th className="px-6 py-4 text-center">Won</th>
                          <th className="px-6 py-4 text-center">Lost</th>
                          <th className="px-6 py-4 text-center">Win %</th>
                          <th className="px-6 py-4 text-center">Recent Form</th>
                          <th className="px-6 py-4 text-right">Points</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y" style={{ borderColor: 'var(--athlon-border)' }}>
                        {sortedLeaderboard.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="py-12 text-center text-foreground/50 font-bold">
                              No {leaderboardType.toLowerCase()} found matching your criteria.
                            </td>
                          </tr>
                        ) : (
                          sortedLeaderboard.map((item, index) => {
                            const rank = index + 1;
                            const hasPlayed = item.matchesPlayed > 0;
                            const isGold = rank === 1 && hasPlayed;
                            const isSilver = rank === 2 && hasPlayed;
                            const isBronze = rank === 3 && hasPlayed;

                            return (
                              <tr key={item.id} className="hover:bg-surface/50 transition-colors group">
                                {/* Rank */}
                                <td className="px-6 py-4 text-center font-black">
                                  {isGold ? (
                                    <span className="w-7 h-7 rounded-lg bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 font-black text-xs inline-flex items-center justify-center">
                                      🥇
                                    </span>
                                  ) : isSilver ? (
                                    <span className="w-7 h-7 rounded-lg bg-slate-300/20 text-slate-300 border border-slate-300/30 font-black text-xs inline-flex items-center justify-center">
                                      🥈
                                    </span>
                                  ) : isBronze ? (
                                    <span className="w-7 h-7 rounded-lg bg-amber-700/20 text-amber-500 border border-amber-700/30 font-black text-xs inline-flex items-center justify-center">
                                      🥉
                                    </span>
                                  ) : (
                                    <span className="text-foreground/40 font-bold font-mono">#{rank}</span>
                                  )}
                                </td>

                                {/* Participant Identity */}
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-surface border overflow-hidden flex items-center justify-center shrink-0 shadow-inner" style={{ borderColor: 'var(--athlon-border)' }}>
                                      {item.avatar ? (
                                        <img
                                          src={UserService.getPhotoUrl(item.avatar)}
                                          alt={item.name}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <span className={`text-xs font-black ${isGold ? 'text-yellow-400' : 'text-primary'}`}>
                                          {item.name.charAt(0).toUpperCase()}
                                        </span>
                                      )}
                                    </div>
                                    <div className="min-w-0">
                                      <span className={`font-black truncate block ${isGold ? 'text-primary' : 'text-foreground'}`}>
                                        {item.name}
                                      </span>
                                      {item.subTitle && (
                                        <span className="text-[10px] text-foreground/40 truncate block">
                                          {item.subTitle}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </td>

                                {/* Record Columns */}
                                <td className="px-6 py-4 text-center font-mono font-bold">{item.matchesPlayed}</td>
                                <td className="px-6 py-4 text-center font-mono font-black text-emerald-400">{item.wins}</td>
                                <td className="px-6 py-4 text-center font-mono font-bold text-rose-400">{item.losses}</td>

                                {/* Win Rate Progress Bar */}
                                <td className="px-6 py-4 text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    <div className="w-16 h-1.5 rounded-full bg-surface overflow-hidden border" style={{ borderColor: 'var(--athlon-border)' }}>
                                      <div
                                        className={`h-full rounded-full ${
                                          item.winRate >= 70
                                            ? 'bg-emerald-400'
                                            : item.winRate >= 50
                                            ? 'bg-primary'
                                            : 'bg-foreground/40'
                                        }`}
                                        style={{ width: `${item.winRate}%` }}
                                      />
                                    </div>
                                    <span className="font-mono font-bold text-[11px] text-foreground/80 w-8 text-right">
                                      {item.winRate}%
                                    </span>
                                  </div>
                                </td>

                                {/* Recent Form Chips */}
                                <td className="px-6 py-4 text-center">
                                  {item.form.length > 0 ? (
                                    <div className="flex items-center justify-center gap-1">
                                      {item.form.map((res, i) => (
                                        <span
                                          key={i}
                                          className={`w-5 h-5 rounded-md text-[9px] font-mono font-black flex items-center justify-center shadow-xs ${
                                            res === 'W'
                                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                          }`}
                                        >
                                          {res}
                                        </span>
                                      ))}
                                    </div>
                                  ) : (
                                    <span className="text-[10px] text-foreground/30 font-mono">—</span>
                                  )}
                                </td>

                                {/* Points Capsule */}
                                <td className="px-6 py-4 text-right">
                                  <span
                                    className="inline-flex items-center px-3 py-1 rounded-xl bg-background border font-mono font-black text-sm text-primary shadow-inner"
                                    style={{ borderColor: 'var(--athlon-border)' }}
                                  >
                                    {item.points} PTS
                                  </span>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* ── MOBILE LEADERBOARD CARDS (MATCHES CLUB WORKSPACE) ── */}
                <div className="block md:hidden space-y-3">
                  {sortedLeaderboard.length === 0 ? (
                    <div
                      className="p-8 text-center rounded-2xl border text-xs text-foreground/50"
                      style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                    >
                      No {leaderboardType.toLowerCase()} found matching your criteria.
                    </div>
                  ) : (
                    sortedLeaderboard.map((item, index) => {
                      const rank = index + 1;
                      const hasPlayed = item.matchesPlayed > 0;
                      const isGold = rank === 1 && hasPlayed;
                      const isSilver = rank === 2 && hasPlayed;
                      const isBronze = rank === 3 && hasPlayed;

                      return (
                        <div
                          key={item.id}
                          className="p-3.5 rounded-2xl border shadow-sm space-y-3 transition-all"
                          style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                        >
                          {/* Top Row: Rank + Avatar + Name + Points */}
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              {/* Rank Badge */}
                              <span
                                className={`w-7 h-7 rounded-xl font-mono font-black text-xs flex items-center justify-center shrink-0 ${
                                  isGold
                                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                    : isSilver
                                    ? 'bg-slate-300/20 text-slate-300 border border-slate-300/30'
                                    : isBronze
                                    ? 'bg-amber-700/20 text-amber-500 border border-amber-700/30'
                                    : 'bg-surface text-foreground/50 border'
                                }`}
                                style={{ borderColor: isGold || isSilver || isBronze ? undefined : 'var(--athlon-border)' }}
                              >
                                {isGold ? '🥇' : isSilver ? '🥈' : isBronze ? '🥉' : `#${rank}`}
                              </span>

                              {/* Avatar */}
                              <div
                                className="w-10 h-10 rounded-2xl bg-surface border overflow-hidden flex items-center justify-center shrink-0 shadow-sm relative"
                                style={{ borderColor: 'var(--athlon-border)' }}
                              >
                                {item.avatar ? (
                                  <img
                                    src={UserService.getPhotoUrl(item.avatar)}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className={`text-xs font-black ${isGold ? 'text-yellow-400' : 'text-primary'}`}>
                                    {item.name.charAt(0).toUpperCase()}
                                  </span>
                                )}
                              </div>

                              {/* Name & Record */}
                              <div className="min-w-0">
                                <h4 className={`text-sm font-black truncate leading-tight ${isGold ? 'text-primary' : 'text-foreground'}`}>
                                  {item.name}
                                </h4>
                                <div className="text-[11px] font-mono text-foreground/50 mt-0.5">
                                  <span className="text-emerald-400 font-bold">{item.wins}W</span>
                                  {' - '}
                                  <span className="text-red-400/80 font-bold">{item.losses}L</span>
                                  <span className="text-foreground/30 mx-1">•</span>
                                  <span>{item.matchesPlayed} MP</span>
                                </div>
                              </div>
                            </div>

                            {/* Points Capsule */}
                            <div className="text-right shrink-0">
                              <div
                                className="px-3 py-1 rounded-xl bg-surface border font-mono font-black text-xs text-primary shadow-inner"
                                style={{ borderColor: 'var(--athlon-border)' }}
                              >
                                {item.points} PTS
                              </div>
                              <div className="text-[10px] font-black text-emerald-400 mt-0.5">
                                {item.winRate}% Win
                              </div>
                            </div>
                          </div>

                          {/* Bottom Row: Win Rate Bar + Recent Form Chips */}
                          <div className="pt-2 border-t flex items-center justify-between gap-3 text-xs" style={{ borderColor: 'var(--athlon-border)' }}>
                            {/* Win Rate Progress Bar */}
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <div className="w-full max-w-[120px] h-1.5 rounded-full bg-surface overflow-hidden border" style={{ borderColor: 'var(--athlon-border)' }}>
                                <div
                                  className={`h-full rounded-full ${
                                    item.winRate >= 70
                                      ? 'bg-emerald-400'
                                      : item.winRate >= 50
                                      ? 'bg-primary'
                                      : 'bg-foreground/40'
                                  }`}
                                  style={{ width: `${item.winRate}%` }}
                                />
                              </div>
                            </div>

                            {/* Recent Form */}
                            {item.form.length > 0 && (
                              <div className="flex items-center gap-1 shrink-0">
                                {item.form.map((res, i) => (
                                  <span
                                    key={i}
                                    className={`w-4 h-4 rounded text-[9px] font-mono font-black flex items-center justify-center ${
                                      res === 'W'
                                        ? 'bg-emerald-500/20 text-emerald-400'
                                        : 'bg-rose-500/20 text-rose-400'
                                    }`}
                                  >
                                    {res}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── 5. MODAL: FORM SQUAD ─── */}
        {showTeamModal && mounted && typeof document !== 'undefined' && createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 pb-20 sm:pb-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
            <div
              className="w-full max-w-lg rounded-3xl border shadow-2xl relative max-h-[80vh] sm:max-h-[88vh] flex flex-col my-auto overflow-hidden"
              style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
            >
              {/* Fixed Modal Header */}
              <div className="flex items-center justify-between border-b px-5 sm:px-6 py-4 shrink-0" style={{ borderColor: 'var(--athlon-border)' }}>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-black text-base sm:text-lg text-foreground">Form Internal Squad</h3>
                    <p className="text-[11px] text-foreground/50">Organize a permanent roster for club scrimmages</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowTeamModal(false)}
                  className="p-1.5 rounded-xl bg-surface hover:bg-card border text-foreground/40 hover:text-foreground transition-colors cursor-pointer shrink-0"
                  style={{ borderColor: 'var(--athlon-border)' }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form with Scrollable Body & Sticky Footer */}
              <form onSubmit={handleCreateTeam} className="flex flex-col flex-1 min-h-0">
                <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-4 overscroll-contain">
                  {/* Squad Emblem Live Preview */}
                  <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-surface border" style={{ borderColor: 'var(--athlon-border)' }}>
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl border shadow-inner shrink-0"
                      style={{
                        backgroundColor: (SPORT_CONFIGS[teamSport] || DEFAULT_SPORT).bg,
                        borderColor: (SPORT_CONFIGS[teamSport] || DEFAULT_SPORT).border,
                        color: (SPORT_CONFIGS[teamSport] || DEFAULT_SPORT).color,
                      }}
                    >
                      <span>{teamName ? teamName.charAt(0).toUpperCase() : '?'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-foreground/40 block">Emblem Preview</span>
                      <h4 className="font-black text-sm text-foreground">
                        {teamName || 'Your Squad Name'}
                      </h4>
                      <span className="text-xs text-primary font-bold">
                        {(SPORT_CONFIGS[teamSport] || DEFAULT_SPORT).icon} {teamSport}
                      </span>
                    </div>
                  </div>

                  {/* Squad Name */}
                  <div>
                    <label className="text-xs font-black uppercase tracking-wider text-foreground/70 block mb-1">
                      Squad Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      placeholder="e.g. Phoenix Strikers, Smash Bros, Apex FC"
                      className="w-full px-4 py-2.5 rounded-xl bg-surface border text-xs text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary transition-all font-medium"
                      style={{ borderColor: 'var(--athlon-border)' }}
                    />
                  </div>

                  {/* Sport Selection Chips */}
                  <div>
                    <label className="text-xs font-black uppercase tracking-wider text-foreground/70 block mb-1.5">
                      Sport *
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {ALL_SPORTS.map((sport) => {
                        const isSelected = teamSport === sport;
                        const meta = SPORT_CONFIGS[sport] || DEFAULT_SPORT;
                        return (
                          <button
                            key={sport}
                            type="button"
                            onClick={() => setTeamSport(sport)}
                            className={`px-2.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-black border flex items-center gap-1.5 transition-all cursor-pointer ${isSelected
                              ? 'shadow-md text-foreground'
                              : 'bg-surface text-foreground/60 hover:text-foreground'
                              }`}
                            style={{
                              backgroundColor: isSelected ? meta.bg : undefined,
                              borderColor: isSelected ? meta.border : 'var(--athlon-border)',
                            }}
                          >
                            <span>{meta.icon}</span>
                            <span>{sport}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Captain Selector */}
                  {members.length > 0 && (
                    <div>
                      <label className="text-xs font-black uppercase tracking-wider text-foreground/70 block mb-1">
                        Squad Captain (Optional)
                      </label>
                      <select
                        value={selectedCaptain}
                        onChange={(e) => setSelectedCaptain(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-surface border text-xs text-foreground focus:outline-none focus:border-primary transition-all font-medium"
                        style={{ borderColor: 'var(--athlon-border)' }}
                      >
                        <option value="">No captain assigned</option>
                        {members.map((m) => (
                          <option key={m.userUuid} value={m.userUuid}>
                            {m.fullName} ({m.role})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Sticky Modal Footer */}
                <div
                  className="border-t px-5 sm:px-6 py-3.5 flex items-center justify-end gap-3 shrink-0"
                  style={{ borderColor: 'var(--athlon-border)', backgroundColor: 'var(--athlon-card)' }}
                >
                  <button
                    type="button"
                    onClick={() => setShowTeamModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-surface hover:bg-card border text-xs font-bold text-foreground/70 transition-colors cursor-pointer"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingTeam}
                    className="px-6 py-2.5 rounded-xl bg-primary text-black font-black text-xs hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-md shadow-primary/25 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingTeam ? 'Assembling Squad...' : 'Form Squad'}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

        {/* ─── 6. MODAL: RECORD MATCH (MATCHES CLUB WORKSPACE) ─── */}
        {showMatchModal && mounted && typeof document !== 'undefined' && createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 pb-20 sm:pb-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
            <div
              className="w-full max-w-lg rounded-3xl border shadow-2xl relative max-h-[82vh] sm:max-h-[88vh] flex flex-col my-auto overflow-hidden"
              style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
            >
              {/* Modal Header */}
              <div className="p-4 sm:p-5 pb-3 border-b flex items-center justify-between shrink-0" style={{ borderColor: 'var(--athlon-border)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-sm">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base sm:text-lg font-black text-foreground tracking-tight">Record Match</h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-500/15 text-blue-400 border border-blue-500/25">
                        {(SPORT_CONFIGS[matchSport] || DEFAULT_SPORT).icon} {matchSport}
                      </span>
                    </div>
                    <p className="text-[11px] text-foreground/50 font-medium">Record match score between community athletes / squads</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowMatchModal(false);
                    resetMatchModal();
                  }}
                  className="w-8 h-8 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-foreground/60 hover:text-foreground flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Form Body */}
              <form onSubmit={handleCreateMatch} className="flex flex-col flex-1 min-h-0">
                <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 overscroll-contain">
                  {modalError && (
                    <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-2.5">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{modalError}</span>
                    </div>
                  )}

                  {/* Sport, Format & Date */}
                  <div className="space-y-3">
                    {/* Sport Selection Chips */}
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-foreground/60 block mb-1">
                        Sport
                      </label>
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
                        {ALL_SPORTS.map((sport) => {
                          const isSelected = matchSport === sport;
                          const meta = SPORT_CONFIGS[sport] || DEFAULT_SPORT;
                          return (
                            <button
                              key={sport}
                              type="button"
                              onClick={() => setMatchSport(sport)}
                              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border flex items-center gap-1 whitespace-nowrap transition-all cursor-pointer ${
                                isSelected
                                  ? 'shadow-md text-foreground'
                                  : 'bg-surface text-foreground/60 hover:text-foreground'
                              }`}
                              style={{
                                backgroundColor: isSelected ? meta.bg : undefined,
                                borderColor: isSelected ? meta.border : 'var(--athlon-border)',
                              }}
                            >
                              <span>{meta.icon}</span>
                              <span>{sport}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-wider text-foreground/60">
                          Match Format
                        </label>
                        <div className="grid grid-cols-2 gap-1 bg-background p-1 rounded-xl border" style={{ borderColor: 'var(--athlon-border)' }}>
                          <button
                            type="button"
                            onClick={() => {
                              setMatchType('SINGLES');
                              setTeamAPlayer2('');
                              setTeamBPlayer2('');
                            }}
                            className={`py-1.5 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                              matchType === 'SINGLES'
                                ? 'bg-primary text-black font-black shadow-sm'
                                : 'text-foreground/60 hover:text-foreground'
                            }`}
                          >
                            Singles
                          </button>
                          <button
                            type="button"
                            onClick={() => setMatchType('DOUBLES')}
                            className={`py-1.5 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                              matchType === 'DOUBLES'
                                ? 'bg-primary text-black font-black shadow-sm'
                                : 'text-foreground/60 hover:text-foreground'
                            }`}
                          >
                            Doubles
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-wider text-foreground/60">
                          Match Date
                        </label>
                        <input
                          type="date"
                          value={matchDate}
                          onChange={(e) => setMatchDate(e.target.value)}
                          className="w-full bg-background border rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-foreground focus:outline-none focus:border-primary transition-all"
                          style={{ borderColor: 'var(--athlon-border)' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* VISUAL MATCHUP ARENA (TEAM A vs TEAM B WITH PARTICIPANT SELECTORS) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {/* TEAM A CARD */}
                    <div
                      className={`p-3.5 rounded-2xl border transition-all space-y-2.5 ${
                        selectedWinner === 'TEAM_A'
                          ? 'bg-blue-500/10 border-blue-500/40 ring-1 ring-blue-500/30'
                          : 'bg-blue-500/5 border-blue-500/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5" /> Team A (Host)
                        </span>
                        {selectedWinner === 'TEAM_A' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            <Crown className="w-3 h-3" /> Winner
                          </span>
                        )}
                      </div>

                      {/* Member Selectors with Photo + Name */}
                      <div className="space-y-2">
                        <CommunityParticipantSelector
                          label="Select Player 1 or Squad..."
                          value={teamAPlayer1}
                          onChange={setTeamAPlayer1}
                          members={members}
                          teams={teams}
                          disabledNames={[teamBPlayer1, teamBPlayer2, teamAPlayer2].filter(Boolean)}
                        />

                        {matchType === 'DOUBLES' && (
                          <CommunityParticipantSelector
                            label="Select Player 2 (Partner)..."
                            value={teamAPlayer2}
                            onChange={setTeamAPlayer2}
                            members={members}
                            teams={teams}
                            disabledNames={[teamAPlayer1, teamBPlayer1, teamBPlayer2].filter(Boolean)}
                          />
                        )}
                      </div>

                      {/* Score Input Box */}
                      <div className="pt-1 flex items-center justify-between bg-background/80 p-2 rounded-xl border border-blue-500/15">
                        <span className="text-[10px] font-black uppercase text-foreground/50">Score:</span>
                        <input
                          type="number"
                          placeholder="21"
                          value={teamAScore}
                          onChange={(e) => setTeamAScore(e.target.value)}
                          className="w-20 text-center py-1.5 px-2 rounded-xl bg-surface border text-base font-black font-mono text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-inner"
                          style={{ borderColor: 'var(--athlon-border)' }}
                        />
                      </div>
                    </div>

                    {/* TEAM B CARD */}
                    <div
                      className={`p-3.5 rounded-2xl border transition-all space-y-2.5 ${
                        selectedWinner === 'TEAM_B'
                          ? 'bg-purple-500/10 border-purple-500/40 ring-1 ring-purple-500/30'
                          : 'bg-purple-500/5 border-purple-500/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5" /> Team B (Challenger)
                        </span>
                        {selectedWinner === 'TEAM_B' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            <Crown className="w-3 h-3" /> Winner
                          </span>
                        )}
                      </div>

                      {/* Member Selectors with Photo + Name */}
                      <div className="space-y-2">
                        <CommunityParticipantSelector
                          label="Select Player 1 or Squad..."
                          value={teamBPlayer1}
                          onChange={setTeamBPlayer1}
                          members={members}
                          teams={teams}
                          disabledNames={[teamAPlayer1, teamAPlayer2, teamBPlayer2].filter(Boolean)}
                        />

                        {matchType === 'DOUBLES' && (
                          <CommunityParticipantSelector
                            label="Select Player 2 (Partner)..."
                            value={teamBPlayer2}
                            onChange={setTeamBPlayer2}
                            members={members}
                            teams={teams}
                            disabledNames={[teamAPlayer1, teamAPlayer2, teamBPlayer1].filter(Boolean)}
                          />
                        )}
                      </div>

                      {/* Score Input Box */}
                      <div className="pt-1 flex items-center justify-between bg-background/80 p-2 rounded-xl border border-purple-500/15">
                        <span className="text-[10px] font-black uppercase text-foreground/50">Score:</span>
                        <input
                          type="number"
                          placeholder="18"
                          value={teamBScore}
                          onChange={(e) => setTeamBScore(e.target.value)}
                          className="w-20 text-center py-1.5 px-2 rounded-xl bg-surface border text-base font-black font-mono text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-inner"
                          style={{ borderColor: 'var(--athlon-border)' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* MATCH RESULT SUMMARY PILL */}
                  {teamAScore !== '' && teamBScore !== '' && (
                    <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30 flex items-center justify-between text-xs animate-in fade-in duration-300">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="font-bold text-foreground">
                          Score: <strong className="font-mono text-primary text-sm">{teamAScore} - {teamBScore}</strong>
                        </span>
                      </div>
                      {selectedWinner && (
                        <span className="font-black text-emerald-400 uppercase tracking-wider text-[11px] truncate max-w-[180px]">
                          Winner: {selectedWinner === 'TEAM_A' ? teamAPlayer1 || 'Team A' : teamBPlayer1 || 'Team B'}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Venue and Notes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-foreground/60 block mb-1">
                        Venue / Court (Optional)
                      </label>
                      <input
                        type="text"
                        value={venueName}
                        onChange={(e) => setVenueName(e.target.value)}
                        placeholder="e.g. Court 3, Main Arena"
                        className="w-full px-3 py-2 rounded-xl bg-surface border text-xs text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary transition-all"
                        style={{ borderColor: 'var(--athlon-border)' }}
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-foreground/60 block mb-1">
                        Match Notes (Optional)
                      </label>
                      <input
                        type="text"
                        value={matchNotes}
                        onChange={(e) => setMatchNotes(e.target.value)}
                        placeholder="e.g. 3-setter deuce finish"
                        className="w-full px-3 py-2 rounded-xl bg-surface border text-xs text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary transition-all"
                        style={{ borderColor: 'var(--athlon-border)' }}
                      />
                    </div>
                  </div>
                </div>

                {/* ALWAYS-VISIBLE STICKY BOTTOM ACTION FOOTER */}
                <div
                  className="p-4 border-t bg-surface/95 backdrop-blur-md flex items-center gap-3 shrink-0"
                  style={{ borderColor: 'var(--athlon-border)' }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setShowMatchModal(false);
                      resetMatchModal();
                    }}
                    className="w-1/3 py-2.5 rounded-2xl bg-surface border border-foreground/10 text-xs font-bold text-foreground/70 hover:text-foreground hover:bg-foreground/5 transition-colors text-center cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={
                      isSubmittingMatch ||
                      !teamAPlayer1 ||
                      !teamBPlayer1 ||
                      teamAScore === '' ||
                      teamBScore === '' ||
                      (matchType === 'DOUBLES' && (!teamAPlayer2 || !teamBPlayer2))
                    }
                    className="w-2/3 py-2.5 rounded-2xl bg-primary text-black text-xs font-black tracking-wide hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isSubmittingMatch ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Saving Result...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" /> Save Match Result
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
      </div>
    </div>
  );
}
