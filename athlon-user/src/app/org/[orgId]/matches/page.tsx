'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { ClubMatchService, ClubMatch } from '@/lib/api/clubMatch';
import { OrganizationService, OrganizationMemberResponse } from '@/lib/api/organization';
import { UserService } from '@/lib/api/user';
import {
  Search,
  Plus,
  Filter,
  Calendar,
  Clock,
  Trophy,
  MoreVertical,
  Shield,
  User,
  Users,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  X,
  RefreshCw,
  Sparkles,
  Crown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check
} from 'lucide-react';

const AVAILABLE_SPORTS_ICONS: Record<string, string> = {
  Badminton: '🏸',
  Cricket: '🏏',
  Football: '⚽',
  Tennis: '🎾',
  'Table Tennis': '🏓',
  Pickleball: '🥒',
  Basketball: '🏀',
  Volleyball: '🏐',
  Squash: '🎾'
};

// Custom Member Selector with Photo and Name only
function MemberSelector({
  label,
  value,
  onChange,
  members,
  disabledNames = []
}: {
  label: string;
  value: string;
  onChange: (name: string) => void;
  members: OrganizationMemberResponse[];
  disabledNames?: string[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedMember = members.find((m) => m.fullName === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${selectedMember
          ? 'bg-background border-foreground/20 text-foreground shadow-sm'
          : 'bg-background/80 border-foreground/10 text-foreground/40 hover:border-primary/40'
          }`}
        style={{ borderColor: 'var(--athlon-border)' }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {selectedMember ? (
            <>
              <div className="w-7 h-7 rounded-lg bg-foreground/10 border border-foreground/10 overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
                {selectedMember.photo ? (
                  <img
                    src={UserService.getPhotoUrl(selectedMember.photo)}
                    alt={selectedMember.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-black text-primary">
                    {selectedMember.fullName?.charAt(0)?.toUpperCase()}
                  </span>
                )}
              </div>
              <span className="text-xs font-bold text-foreground truncate">
                {selectedMember.fullName}
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
          <div
            className="fixed inset-0 z-20"
            onClick={() => setIsOpen(false)}
          />
          <div
            className="absolute top-full left-0 right-0 mt-1.5 z-30 max-h-52 overflow-y-auto rounded-2xl border shadow-2xl p-1.5 space-y-1 bg-surface animate-in fade-in zoom-in-95 duration-150"
            style={{
              backgroundColor: 'var(--athlon-surface)',
              borderColor: 'var(--athlon-border)'
            }}
          >
            {members.length === 0 ? (
              <div className="p-3 text-center text-xs text-foreground/40 font-medium">
                No club members found
              </div>
            ) : (
              members.map((m) => {
                const isDisabled = disabledNames.includes(m.fullName);
                const isSelected = m.fullName === value;
                return (
                  <button
                    key={m.organizationMemberUuid}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => {
                      onChange(m.fullName);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left transition-all ${isSelected
                      ? 'bg-primary text-black font-black shadow-sm'
                      : isDisabled
                        ? 'opacity-40 cursor-not-allowed bg-transparent'
                        : 'hover:bg-foreground/5 text-foreground'
                      }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-foreground/10 border border-foreground/10 overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
                      {m.photo ? (
                        <img
                          src={UserService.getPhotoUrl(m.photo)}
                          alt={m.fullName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className={`text-xs font-black ${isSelected ? 'text-black' : 'text-primary'}`}>
                          {m.fullName?.charAt(0)?.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-bold truncate flex-grow">
                      {m.fullName}
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-black shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function MatchesPage() {
  const params = useParams();
  const orgIdParam = (params?.orgId as string) || '';
  const { getActiveOrganization } = useWorkspaceStore();
  const org = getActiveOrganization();

  const orgUuid = org?.id || orgIdParam;

  const [matches, setMatches] = useState<ClubMatch[]>([]);
  const [members, setMembers] = useState<OrganizationMemberResponse[]>([]);
  const [clubSport, setClubSport] = useState<string>('Badminton');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  // Date filter: defaults to current local date
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Date navigation helpers
  const handleShiftDate = (days: number) => {
    const base = selectedDate ? new Date(selectedDate) : new Date();
    base.setDate(base.getDate() + days);
    setSelectedDate(base.toISOString().split('T')[0]);
  };

  const handleSetToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  const handleSetAllDates = () => {
    setSelectedDate('');
  };

  // Add Match Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [matchType, setMatchType] = useState<'SINGLES' | 'DOUBLES'>('SINGLES');
  const [matchDate, setMatchDate] = useState(new Date().toISOString().split('T')[0]);

  // Team A
  const [teamAPlayer1, setTeamAPlayer1] = useState('');
  const [teamAPlayer2, setTeamAPlayer2] = useState('');
  const [teamAScore, setTeamAScore] = useState('');

  // Team B
  const [teamBPlayer1, setTeamBPlayer1] = useState('');
  const [teamBPlayer2, setTeamBPlayer2] = useState('');
  const [teamBScore, setTeamBScore] = useState('');

  const [selectedWinner, setSelectedWinner] = useState<'TEAM_A' | 'TEAM_B' | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [toastSuccess, setToastSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (orgUuid) {
      loadData();
    }
  }, [orgUuid]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [matchesRes, membersRes, profileRes] = await Promise.allSettled([
        ClubMatchService.getMatchesByOrg(orgUuid),
        OrganizationService.getMembers(orgUuid),
        OrganizationService.getProfileByOrgUuid(orgUuid)
      ]);

      if (matchesRes.status === 'fulfilled') {
        const list = Array.isArray(matchesRes.value)
          ? matchesRes.value
          : ((matchesRes.value as any)?.data || []);
        setMatches(list);
      }

      if (membersRes.status === 'fulfilled') {
        const memList = Array.isArray(membersRes.value)
          ? membersRes.value
          : ((membersRes.value as any)?.data || []);
        setMembers(memList);
      }

      if (profileRes.status === 'fulfilled') {
        const profData = (profileRes.value as any)?.data || profileRes.value;
        if (profData?.sportsOffered) {
          setClubSport(profData.sportsOffered);
        }
      }
    } catch (err) {
      console.error('Failed to load club matches:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Auto calculate winner based on single set score
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

  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamAPlayer1.trim() || !teamBPlayer1.trim()) {
      setModalError('Please select Player 1 for both Team A and Team B.');
      return;
    }

    if (matchType === 'DOUBLES' && (!teamAPlayer2.trim() || !teamBPlayer2.trim())) {
      setModalError('Please select Player 2 for both sides in doubles match.');
      return;
    }

    if (teamAScore === '' || teamBScore === '') {
      setModalError('Please enter the match score for both sides.');
      return;
    }

    // Build player strings
    const teamAString = matchType === 'DOUBLES' && teamAPlayer2.trim()
      ? `${teamAPlayer1.trim()} / ${teamAPlayer2.trim()}`
      : teamAPlayer1.trim();

    const teamBString = matchType === 'DOUBLES' && teamBPlayer2.trim()
      ? `${teamBPlayer1.trim()} / ${teamBPlayer2.trim()}`
      : teamBPlayer1.trim();

    // Single match score: e.g. "21 - 18"
    const scoreString = `${teamAScore.trim()} - ${teamBScore.trim()}`;
    const winnerString = selectedWinner === 'TEAM_A' ? teamAString : selectedWinner === 'TEAM_B' ? teamBString : '';

    try {
      setIsSubmitting(true);
      setModalError(null);

      await ClubMatchService.createMatch({
        orgUuid,
        sportType: clubSport,
        matchType,
        matchDate,
        teamAPlayers: teamAString,
        teamBPlayers: teamBString,
        score: scoreString,
        winner: winnerString,
        status: 'COMPLETED'
      });

      setToastSuccess('Club match result successfully recorded!');
      setIsAddModalOpen(false);
      resetModal();
      loadData();

      setTimeout(() => setToastSuccess(null), 4000);
    } catch (err: any) {
      setModalError(err?.response?.data?.message || err?.message || 'Failed to save club match.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMatch = async (matchId?: number) => {
    if (!matchId) return;
    if (!confirm('Are you sure you want to delete this club match record?')) return;

    try {
      await ClubMatchService.deleteMatch(matchId);
      setMatches(prev => prev.filter(m => m.matchId !== matchId));
      setToastSuccess('Match record removed.');
      setTimeout(() => setToastSuccess(null), 4000);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to delete match.');
    }
  };

  const resetModal = () => {
    setMatchType('SINGLES');
    setMatchDate(new Date().toISOString().split('T')[0]);
    setTeamAPlayer1('');
    setTeamAPlayer2('');
    setTeamAScore('');
    setTeamBPlayer1('');
    setTeamBPlayer2('');
    setTeamBScore('');
    setSelectedWinner('');
    setModalError(null);
  };

  const filteredMatches = matches.filter((m) => {
    if (!selectedDate) return true; // Show all if no date selected
    return m.matchDate === selectedDate;
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Toast Notification */}
      {toastSuccess && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-md animate-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-bold">{toastSuccess}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h2 className="text-3xl font-extrabold text-foreground tracking-tight">Club Matches</h2>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-primary/15 text-primary border border-primary/25">
              {matches.length} Total
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-500/15 text-blue-400 border border-blue-500/25 flex items-center gap-1.5">
              <span>{AVAILABLE_SPORTS_ICONS[clubSport] || '🏅'}</span>
              <span>{clubSport}</span>
            </span>
          </div>
          <p className="text-foreground/50 font-medium text-sm">
            Record and track daily friendly match results and scores for {org?.name || 'your club'}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface border border-foreground/10 text-sm font-bold text-foreground hover:bg-foreground/5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button
            onClick={() => {
              resetModal();
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-black text-sm font-black tracking-wide hover:opacity-90 transition-all shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" /> Record Match
          </button>
        </div>
      </div>

      {/* Date Navigation & Calendar Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5 bg-surface border border-foreground/5 rounded-2xl p-3.5 sm:p-4 shadow-sm">
        {/* Left Side: Day Shifter & Date Picker */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleShiftDate(-1)}
            className="p-2 rounded-xl bg-background border border-foreground/10 hover:bg-foreground/5 text-foreground/70 hover:text-foreground transition-colors"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Calendar Date Input Picker */}
          <div className="relative flex items-center bg-background border border-foreground/10 rounded-xl px-3 py-2 text-xs font-bold text-foreground hover:border-primary/40 transition-colors shadow-inner">
            <Calendar className="w-4 h-4 text-primary shrink-0 mr-2" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs font-bold text-foreground focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={() => handleShiftDate(1)}
            className="p-2 rounded-xl bg-background border border-foreground/10 hover:bg-foreground/5 text-foreground/70 hover:text-foreground transition-colors"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {selectedDate && (
            <span className="hidden md:inline-block text-xs font-bold text-foreground/60 ml-2">
              {new Date(selectedDate).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          )}
        </div>

        {/* Right Side: Quick Filters & Counter */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={handleSetToday}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${selectedDate === new Date().toISOString().split('T')[0]
              ? 'bg-primary text-black shadow-md shadow-primary/20'
              : 'bg-background/80 text-foreground/70 hover:text-foreground border border-foreground/10'
              }`}
          >
            Today
          </button>

          <button
            onClick={handleSetAllDates}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${selectedDate === ''
              ? 'bg-primary text-black shadow-md shadow-primary/20'
              : 'bg-background/80 text-foreground/70 hover:text-foreground border border-foreground/10'
              }`}
          >
            All Dates
          </button>

          <div className="px-3 py-1.5 rounded-xl bg-foreground/5 border border-foreground/10 text-xs font-black text-foreground/60 ml-1">
            {filteredMatches.length} {filteredMatches.length === 1 ? 'Match' : 'Matches'}
          </div>
        </div>
      </div>

      {/* MATCHES CONTAINER */}
      <div className="bg-surface border border-foreground/5 rounded-[24px] overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm font-semibold text-foreground/50">Loading club matches...</p>
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="py-20 px-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-foreground/5 border border-foreground/10 mx-auto flex items-center justify-center text-foreground/40">
              <Calendar className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">
                {selectedDate
                  ? `No matches recorded on ${new Date(selectedDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`
                  : 'No matches recorded yet'}
              </h3>
              <p className="text-sm text-foreground/50 max-w-md mx-auto mt-1">
                {selectedDate
                  ? 'Switch date or record a new match for this day.'
                  : 'Start recording single friendly match results and scores for your club athletes.'}
              </p>
            </div>
            <button
              onClick={() => {
                resetModal();
                setMatchDate(new Date().toISOString().split('T')[0]);
                setIsAddModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-black text-sm font-black tracking-wide hover:opacity-90 shadow-lg shadow-primary/20"
            >
              <Plus className="w-4 h-4" /> Record Match
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-foreground/5 bg-foreground/[0.02]">
                    <th className="px-6 py-4 text-xs font-black text-foreground/50 uppercase tracking-widest">Date & Sport</th>
                    <th className="px-6 py-4 text-xs font-black text-foreground/50 uppercase tracking-widest">Team A</th>
                    <th className="px-6 py-4 text-xs font-black text-foreground/50 uppercase tracking-widest text-center">Score</th>
                    <th className="px-6 py-4 text-xs font-black text-foreground/50 uppercase tracking-widest">Team B</th>
                    <th className="px-6 py-4 text-xs font-black text-foreground/50 uppercase tracking-widest">Winner</th>
                    <th className="px-6 py-4 text-xs font-black text-foreground/50 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-foreground/5">
                  {filteredMatches.map((match) => (
                    <tr key={match.matchId} className="hover:bg-foreground/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="text-xs font-bold text-foreground">
                            {match.matchDate ? new Date(match.matchDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recent'}
                          </div>
                          <div className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-primary">
                            <span>{AVAILABLE_SPORTS_ICONS[match.sportType] || '🏅'}</span>
                            <span>{match.matchType || 'Match'}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 font-black text-xs flex items-center justify-center shrink-0 border border-blue-500/20">
                            A
                          </div>
                          <span className={`font-bold text-sm ${match.winner === match.teamAPlayers ? 'text-primary font-black' : 'text-foreground'}`}>
                            {match.teamAPlayers}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-3.5 py-1.5 rounded-xl bg-background border font-mono font-black text-xs text-foreground tracking-wider shadow-inner" style={{ borderColor: 'var(--athlon-border)' }}>
                          {match.score || 'VS'}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 font-black text-xs flex items-center justify-center shrink-0 border border-purple-500/20">
                            B
                          </div>
                          <span className={`font-bold text-sm ${match.winner === match.teamBPlayers ? 'text-primary font-black' : 'text-foreground'}`}>
                            {match.teamBPlayers}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {match.winner ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <Trophy className="w-3 h-3 text-emerald-400" />
                            {match.winner}
                          </span>
                        ) : (
                          <span className="text-xs text-foreground/40">-</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteMatch(match.matchId)}
                          className="p-2 rounded-xl text-foreground/40 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-80 group-hover:opacity-100"
                          title="Delete match record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Stylish Match Cards View */}
            <div className="block md:hidden divide-y divide-foreground/5">
              {filteredMatches.map((match) => {
                const scoreParts = (match.score || '').split('-').map((s) => s.trim());
                const scoreA = scoreParts[0] || (match.score ? match.score : '-');
                const scoreB = scoreParts[1] || '-';
                const isTeamAWinner = match.winner && match.winner === match.teamAPlayers;
                const isTeamBWinner = match.winner && match.winner === match.teamBPlayers;

                return (
                  <div key={match.matchId} className="p-4 space-y-3 hover:bg-foreground/[0.02] transition-colors">
                    {/* Top Bar: Date, Sport, Match Format, Actions */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{AVAILABLE_SPORTS_ICONS[match.sportType] || '🏅'}</span>
                        <span className="font-extrabold text-foreground">
                          {match.matchDate ? new Date(match.matchDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recent'}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-primary/15 text-primary border border-primary/25">
                          {match.matchType || 'SINGLES'}
                        </span>
                      </div>

                      <button
                        onClick={() => handleDeleteMatch(match.matchId)}
                        className="p-2 rounded-xl text-foreground/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Delete match"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Full-Width Match Scoreboard */}
                    <div
                      className="rounded-2xl bg-background border p-3.5 space-y-2.5 shadow-inner"
                      style={{ borderColor: 'var(--athlon-border)' }}
                    >
                      {/* Team A Row */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0 flex-grow">
                          <span className="w-6 h-6 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400 font-black text-[10px] flex items-center justify-center shrink-0">
                            A
                          </span>
                          <div className="min-w-0 flex-grow">
                            <div className={`text-xs sm:text-sm font-extrabold leading-snug break-words ${isTeamAWinner ? 'text-emerald-400 font-black' : 'text-foreground'}`}>
                              {match.teamAPlayers}
                            </div>
                            {isTeamAWinner && (
                              <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-emerald-400 mt-0.5">
                                <Crown className="w-3 h-3" /> Winner
                              </span>
                            )}
                          </div>
                        </div>

                        <div className={`px-3 py-1.5 rounded-xl font-mono font-black text-sm shrink-0 border ${isTeamAWinner
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                          : 'bg-surface text-foreground/80 border-foreground/10'
                          }`}>
                          {scoreA}
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-foreground/5" />

                      {/* Team B Row */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0 flex-grow">
                          <span className="w-6 h-6 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-400 font-black text-[10px] flex items-center justify-center shrink-0">
                            B
                          </span>
                          <div className="min-w-0 flex-grow">
                            <div className={`text-xs sm:text-sm font-extrabold leading-snug break-words ${isTeamBWinner ? 'text-emerald-400 font-black' : 'text-foreground'}`}>
                              {match.teamBPlayers}
                            </div>
                            {isTeamBWinner && (
                              <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-emerald-400 mt-0.5">
                                <Crown className="w-3 h-3" /> Winner
                              </span>
                            )}
                          </div>
                        </div>

                        <div className={`px-3 py-1.5 rounded-xl font-mono font-black text-sm shrink-0 border ${isTeamBWinner
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                          : 'bg-surface text-foreground/80 border-foreground/10'
                          }`}>
                          {scoreB}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* REDESIGNED STYLISH SINGLE-SET MATCH RECORDING MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center p-3 sm:p-6 pt-5 sm:pt-10 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
          <div
            className="w-full max-w-xl rounded-[32px] border shadow-2xl flex flex-col my-auto sm:my-0 animate-in zoom-in-95 duration-200 overflow-hidden"
            style={{
              backgroundColor: 'var(--athlon-surface)',
              borderColor: 'var(--athlon-border)'
            }}
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 pb-3.5 border-b flex items-center justify-between shrink-0" style={{ borderColor: 'var(--athlon-border)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-sm">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-lg sm:text-xl font-black text-foreground tracking-tight">Record Match</h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-500/15 text-blue-400 border border-blue-500/25">
                      {AVAILABLE_SPORTS_ICONS[clubSport] || '🏅'} {clubSport}
                    </span>
                  </div>
                  <p className="text-xs text-foreground/50 font-medium">Record match score between club athletes</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  resetModal();
                }}
                className="w-9 h-9 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-foreground/60 hover:text-foreground flex items-center justify-center transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleCreateMatch} className="flex flex-col flex-grow">
              <div className="p-5 sm:p-6 space-y-4 overflow-y-auto max-h-[72vh]">
                {modalError && (
                  <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-2.5">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{modalError}</span>
                  </div>
                )}

                {members.length === 0 && (
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                    <div>
                      <span className="font-bold">No Members in Club Directory:</span> Please add athletes to your club first in the Members tab to choose them for matches.
                    </div>
                  </div>
                )}

                {/* Match Format & Date */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-foreground/60">
                      Match Format
                    </label>
                    <div className="grid grid-cols-2 gap-1 bg-background p-1 rounded-2xl border" style={{ borderColor: 'var(--athlon-border)' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setMatchType('SINGLES');
                          setTeamAPlayer2('');
                          setTeamBPlayer2('');
                        }}
                        className={`py-2 rounded-xl text-xs font-bold transition-all text-center ${matchType === 'SINGLES'
                          ? 'bg-primary text-black font-black shadow-sm'
                          : 'text-foreground/60 hover:text-foreground'
                          }`}
                      >
                        Singles
                      </button>
                      <button
                        type="button"
                        onClick={() => setMatchType('DOUBLES')}
                        className={`py-2 rounded-xl text-xs font-bold transition-all text-center ${matchType === 'DOUBLES'
                          ? 'bg-primary text-black font-black shadow-sm'
                          : 'text-foreground/60 hover:text-foreground'
                          }`}
                      >
                        Doubles
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-foreground/60">
                      Match Date
                    </label>
                    <input
                      type="date"
                      value={matchDate}
                      onChange={(e) => setMatchDate(e.target.value)}
                      className="w-full bg-background border rounded-2xl px-3.5 py-2.5 text-xs font-mono font-bold text-foreground focus:outline-none focus:border-primary transition-all"
                      style={{ borderColor: 'var(--athlon-border)' }}
                    />
                  </div>
                </div>

                {/* VISUAL MATCHUP ARENA (TEAM A vs TEAM B WITH MEMBER SELECTORS) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">

                  {/* TEAM A CARD */}
                  <div className={`p-4 rounded-2xl border transition-all space-y-3 ${selectedWinner === 'TEAM_A'
                    ? 'bg-blue-500/10 border-blue-500/40 ring-1 ring-blue-500/30'
                    : 'bg-blue-500/5 border-blue-500/20'
                    }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" /> Team A
                      </span>
                      {selectedWinner === 'TEAM_A' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          <Crown className="w-3 h-3" /> Winner
                        </span>
                      )}
                    </div>

                    {/* Member Selectors with Photo + Name */}
                    <div className="space-y-2">
                      <MemberSelector
                        label="Select Player 1..."
                        value={teamAPlayer1}
                        onChange={setTeamAPlayer1}
                        members={members}
                        disabledNames={[teamBPlayer1, teamBPlayer2, teamAPlayer2].filter(Boolean)}
                      />

                      {matchType === 'DOUBLES' && (
                        <MemberSelector
                          label="Select Player 2 (Partner)..."
                          value={teamAPlayer2}
                          onChange={setTeamAPlayer2}
                          members={members}
                          disabledNames={[teamAPlayer1, teamBPlayer1, teamBPlayer2].filter(Boolean)}
                        />
                      )}
                    </div>

                    {/* Score Input Box */}
                    <div className="pt-1 flex items-center justify-between bg-background/80 p-2.5 rounded-xl border border-blue-500/15">
                      <span className="text-[11px] font-black uppercase text-foreground/50">Score:</span>
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
                  <div className={`p-4 rounded-2xl border transition-all space-y-3 ${selectedWinner === 'TEAM_B'
                    ? 'bg-purple-500/10 border-purple-500/40 ring-1 ring-purple-500/30'
                    : 'bg-purple-500/5 border-purple-500/20'
                    }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" /> Team B
                      </span>
                      {selectedWinner === 'TEAM_B' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          <Crown className="w-3 h-3" /> Winner
                        </span>
                      )}
                    </div>

                    {/* Member Selectors with Photo + Name */}
                    <div className="space-y-2">
                      <MemberSelector
                        label="Select Player 1..."
                        value={teamBPlayer1}
                        onChange={setTeamBPlayer1}
                        members={members}
                        disabledNames={[teamAPlayer1, teamAPlayer2, teamBPlayer2].filter(Boolean)}
                      />

                      {matchType === 'DOUBLES' && (
                        <MemberSelector
                          label="Select Player 2 (Partner)..."
                          value={teamBPlayer2}
                          onChange={setTeamBPlayer2}
                          members={members}
                          disabledNames={[teamAPlayer1, teamAPlayer2, teamBPlayer1].filter(Boolean)}
                        />
                      )}
                    </div>

                    {/* Score Input Box */}
                    <div className="pt-1 flex items-center justify-between bg-background/80 p-2.5 rounded-xl border border-purple-500/15">
                      <span className="text-[11px] font-black uppercase text-foreground/50">Score:</span>
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
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30 flex items-center justify-between text-xs animate-in fade-in duration-300">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="font-bold text-foreground">
                        Match Score: <strong className="font-mono text-primary text-sm">{teamAScore} - {teamBScore}</strong>
                      </span>
                    </div>
                    {selectedWinner && (
                      <span className="font-black text-emerald-400 uppercase tracking-wider text-[11px]">
                        Winner: {selectedWinner === 'TEAM_A' ? teamAPlayer1 || 'Team A' : teamBPlayer1 || 'Team B'}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* ALWAYS-VISIBLE STICKY BOTTOM ACTION FOOTER */}
              <div
                className="p-4 sm:p-5 border-t bg-surface/95 backdrop-blur-md flex items-center gap-3 shrink-0"
                style={{ borderColor: 'var(--athlon-border)' }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    resetModal();
                  }}
                  className="w-1/3 py-3 rounded-2xl bg-surface border border-foreground/10 text-xs font-bold text-foreground/70 hover:text-foreground hover:bg-foreground/5 transition-colors text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !teamAPlayer1 || !teamBPlayer1 || teamAScore === '' || teamBScore === ''}
                  className="w-2/3 py-3 rounded-2xl bg-primary text-black text-xs font-black tracking-wide hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
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
        </div>
      )}
    </div>
  );
}