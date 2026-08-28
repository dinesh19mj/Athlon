'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { ClubMatchService, ClubMatch } from '@/lib/api/clubMatch';
import { OrganizationService, OrganizationMemberResponse } from '@/lib/api/organization';
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
  Sparkles
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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Add Match Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [matchType, setMatchType] = useState<'SINGLES' | 'DOUBLES'>('SINGLES');
  const [matchDate, setMatchDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Team A
  const [teamAPlayer1, setTeamAPlayer1] = useState('');
  const [teamAPlayer2, setTeamAPlayer2] = useState('');
  // Team B
  const [teamBPlayer1, setTeamBPlayer1] = useState('');
  const [teamBPlayer2, setTeamBPlayer2] = useState('');

  // Scores (Up to 3 sets)
  const [set1TeamA, setSet1TeamA] = useState('');
  const [set1TeamB, setSet1TeamB] = useState('');
  const [set2TeamA, setSet2TeamA] = useState('');
  const [set2TeamB, setSet2TeamB] = useState('');
  const [set3TeamA, setSet3TeamA] = useState('');
  const [set3TeamB, setSet3TeamB] = useState('');

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

  // Auto calculate winner based on set scores
  useEffect(() => {
    let teamAWins = 0;
    let teamBWins = 0;

    const s1A = parseInt(set1TeamA, 10);
    const s1B = parseInt(set1TeamB, 10);
    if (!isNaN(s1A) && !isNaN(s1B)) {
      if (s1A > s1B) teamAWins++;
      else if (s1B > s1A) teamBWins++;
    }

    const s2A = parseInt(set2TeamA, 10);
    const s2B = parseInt(set2TeamB, 10);
    if (!isNaN(s2A) && !isNaN(s2B)) {
      if (s2A > s2B) teamAWins++;
      else if (s2B > s2A) teamBWins++;
    }

    const s3A = parseInt(set3TeamA, 10);
    const s3B = parseInt(set3TeamB, 10);
    if (!isNaN(s3A) && !isNaN(s3B)) {
      if (s3A > s3B) teamAWins++;
      else if (s3B > s3A) teamBWins++;
    }

    if (teamAWins > teamBWins) setSelectedWinner('TEAM_A');
    else if (teamBWins > teamAWins) setSelectedWinner('TEAM_B');
    else setSelectedWinner('');
  }, [set1TeamA, set1TeamB, set2TeamA, set2TeamB, set3TeamA, set3TeamB]);

  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamAPlayer1.trim() || !teamBPlayer1.trim()) {
      setModalError('Please enter at least Player 1 for both Team A and Team B.');
      return;
    }

    // Build player string
    const teamAString = matchType === 'DOUBLES' && teamAPlayer2.trim()
      ? `${teamAPlayer1.trim()} / ${teamAPlayer2.trim()}`
      : teamAPlayer1.trim();

    const teamBString = matchType === 'DOUBLES' && teamBPlayer2.trim()
      ? `${teamBPlayer1.trim()} / ${teamBPlayer2.trim()}`
      : teamBPlayer1.trim();

    // Build score string
    const sets = [];
    if (set1TeamA !== '' && set1TeamB !== '') {
      sets.push(`${set1TeamA}-${set1TeamB}`);
    }
    if (set2TeamA !== '' && set2TeamB !== '') {
      sets.push(`${set2TeamA}-${set2TeamB}`);
    }
    if (set3TeamA !== '' && set3TeamB !== '') {
      sets.push(`${set3TeamA}-${set3TeamB}`);
    }

    const scoreString = sets.length > 0 ? sets.join(', ') : 'Completed';
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
    setTeamBPlayer1('');
    setTeamBPlayer2('');
    setSet1TeamA('');
    setSet1TeamB('');
    setSet2TeamA('');
    setSet2TeamB('');
    setSet3TeamA('');
    setSet3TeamB('');
    setSelectedWinner('');
    setModalError(null);
  };

  const filteredMatches = matches.filter((m) => {
    const matchesSearch =
      (m.teamAPlayers || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.teamBPlayers || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.score || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.sportType || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' || (m.status || '').toUpperCase() === statusFilter.toUpperCase();

    return matchesSearch && matchesStatus;
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
              {matches.length} {matches.length === 1 ? 'Match' : 'Matches'}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-500/15 text-blue-400 border border-blue-500/25 flex items-center gap-1.5">
              <span>{AVAILABLE_SPORTS_ICONS[clubSport] || '🏅'}</span>
              <span>{clubSport}</span>
            </span>
          </div>
          <p className="text-foreground/50 font-medium text-sm">
            Record and track internal club matches, challenges, and scores for {org?.name || 'your club'}.
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

      {/* Search & Filter Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 bg-surface border border-foreground/5 rounded-2xl p-4 shadow-sm">
        <div className="relative flex-grow">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40" />
          <input
            type="text"
            placeholder="Search matches by athlete name, score, or date..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-background border border-foreground/10 rounded-xl pl-12 pr-4 py-2.5 text-sm font-medium text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none shrink-0">
          {['ALL', 'COMPLETED', 'SCHEDULED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shrink-0 ${
                statusFilter === st
                  ? 'bg-primary text-black shadow-md shadow-primary/20'
                  : 'bg-background/60 text-foreground/60 hover:text-foreground border border-foreground/5'
              }`}
            >
              {st === 'ALL' ? 'All Matches' : st}
            </button>
          ))}
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
              <Trophy className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">
                {searchTerm || statusFilter !== 'ALL' ? 'No matching matches found' : 'No matches recorded yet'}
              </h3>
              <p className="text-sm text-foreground/50 max-w-md mx-auto mt-1">
                {searchTerm || statusFilter !== 'ALL'
                  ? 'Try adjusting your search query or filter.'
                  : 'Start recording friendly matches, scores, and athlete results for your club.'}
              </p>
            </div>
            {!searchTerm && statusFilter === 'ALL' && (
              <button
                onClick={() => {
                  resetModal();
                  setIsAddModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-black text-sm font-black tracking-wide hover:opacity-90 shadow-lg shadow-primary/20"
              >
                <Plus className="w-4 h-4" /> Record First Match
              </button>
            )}
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
                        <span className="inline-flex items-center px-3 py-1 rounded-xl bg-background border font-mono font-black text-xs text-foreground tracking-wider shadow-inner" style={{ borderColor: 'var(--athlon-border)' }}>
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
              {filteredMatches.map((match) => (
                <div key={match.matchId} className="p-4 space-y-3 hover:bg-foreground/[0.02] transition-colors">
                  {/* Top Bar: Date, Sport, Delete */}
                  <div className="flex items-center justify-between text-xs text-foreground/60">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{AVAILABLE_SPORTS_ICONS[match.sportType] || '🏅'}</span>
                      <span className="font-bold text-foreground">
                        {match.matchDate ? new Date(match.matchDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recent'}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-foreground/5 border border-foreground/10 text-foreground/70">
                        {match.matchType || 'Match'}
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

                  {/* VS Card */}
                  <div className="p-3.5 rounded-2xl bg-background border flex items-center justify-between gap-3" style={{ borderColor: 'var(--athlon-border)' }}>
                    {/* Team A */}
                    <div className="flex-1 text-center min-w-0">
                      <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-0.5">Team A</div>
                      <div className={`text-sm font-extrabold truncate ${match.winner === match.teamAPlayers ? 'text-emerald-400' : 'text-foreground'}`}>
                        {match.teamAPlayers}
                      </div>
                      {match.winner === match.teamAPlayers && (
                        <span className="inline-block mt-0.5 text-[9px] font-black uppercase tracking-widest text-emerald-400">Winner 🏆</span>
                      )}
                    </div>

                    {/* Score Center */}
                    <div className="px-3 py-1.5 rounded-xl bg-surface border font-mono font-black text-xs text-foreground shrink-0 shadow-sm text-center" style={{ borderColor: 'var(--athlon-border)' }}>
                      {match.score || 'VS'}
                    </div>

                    {/* Team B */}
                    <div className="flex-1 text-center min-w-0">
                      <div className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-0.5">Team B</div>
                      <div className={`text-sm font-extrabold truncate ${match.winner === match.teamBPlayers ? 'text-emerald-400' : 'text-foreground'}`}>
                        {match.teamBPlayers}
                      </div>
                      {match.winner === match.teamBPlayers && (
                        <span className="inline-block mt-0.5 text-[9px] font-black uppercase tracking-widest text-emerald-400">Winner 🏆</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* RECORD MATCH MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 sm:p-6 pt-6 sm:pt-12 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
          <div
            className="w-full max-w-lg rounded-[28px] border shadow-2xl flex flex-col my-auto sm:my-0 animate-in zoom-in-95 duration-200 overflow-hidden"
            style={{
              backgroundColor: 'var(--athlon-surface)',
              borderColor: 'var(--athlon-border)'
            }}
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 pb-3 border-b flex items-center justify-between shrink-0" style={{ borderColor: 'var(--athlon-border)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-sm">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-foreground tracking-tight">Record Club Match</h3>
                  <p className="text-xs text-foreground/50 font-medium">Save athlete match score directly into club records</p>
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
              <div className="p-5 sm:p-6 space-y-4 overflow-y-auto max-h-[70vh]">
                {modalError && (
                  <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-2.5">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{modalError}</span>
                  </div>
                )}

                {/* Match Type & Date Selector */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase tracking-wider text-foreground/70">
                      Match Format
                    </label>
                    <div className="grid grid-cols-2 gap-1.5 bg-background p-1 rounded-2xl border" style={{ borderColor: 'var(--athlon-border)' }}>
                      <button
                        type="button"
                        onClick={() => setMatchType('SINGLES')}
                        className={`py-2 rounded-xl text-xs font-bold transition-all ${
                          matchType === 'SINGLES'
                            ? 'bg-primary text-black font-black shadow-sm'
                            : 'text-foreground/60 hover:text-foreground'
                        }`}
                      >
                        Singles (1v1)
                      </button>
                      <button
                        type="button"
                        onClick={() => setMatchType('DOUBLES')}
                        className={`py-2 rounded-xl text-xs font-bold transition-all ${
                          matchType === 'DOUBLES'
                            ? 'bg-primary text-black font-black shadow-sm'
                            : 'text-foreground/60 hover:text-foreground'
                        }`}
                      >
                        Doubles (2v2)
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase tracking-wider text-foreground/70">
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

                {/* Team A Section */}
                <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" /> Team A (Athlete / Side 1)
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <input
                        type="text"
                        list="club-members-list-a1"
                        placeholder="Player 1 Name (pick member or type)..."
                        value={teamAPlayer1}
                        onChange={(e) => setTeamAPlayer1(e.target.value)}
                        className="w-full bg-background border rounded-xl px-3.5 py-2 text-xs font-bold text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary transition-all"
                        style={{ borderColor: 'var(--athlon-border)' }}
                      />
                      <datalist id="club-members-list-a1">
                        {members.map(m => (
                          <option key={m.organizationMemberUuid} value={m.fullName} />
                        ))}
                      </datalist>
                    </div>

                    {matchType === 'DOUBLES' && (
                      <input
                        type="text"
                        list="club-members-list-a2"
                        placeholder="Player 2 Name (Partner)..."
                        value={teamAPlayer2}
                        onChange={(e) => setTeamAPlayer2(e.target.value)}
                        className="w-full bg-background border rounded-xl px-3.5 py-2 text-xs font-bold text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary transition-all animate-in fade-in duration-200"
                        style={{ borderColor: 'var(--athlon-border)' }}
                      />
                    )}
                  </div>
                </div>

                {/* Team B Section */}
                <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/20 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" /> Team B (Opponent / Side 2)
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <input
                        type="text"
                        list="club-members-list-b1"
                        placeholder="Player 1 Name (pick member or type)..."
                        value={teamBPlayer1}
                        onChange={(e) => setTeamBPlayer1(e.target.value)}
                        className="w-full bg-background border rounded-xl px-3.5 py-2 text-xs font-bold text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary transition-all"
                        style={{ borderColor: 'var(--athlon-border)' }}
                      />
                      <datalist id="club-members-list-b1">
                        {members.map(m => (
                          <option key={m.organizationMemberUuid} value={m.fullName} />
                        ))}
                      </datalist>
                    </div>

                    {matchType === 'DOUBLES' && (
                      <input
                        type="text"
                        list="club-members-list-b2"
                        placeholder="Player 2 Name (Partner)..."
                        value={teamBPlayer2}
                        onChange={(e) => setTeamBPlayer2(e.target.value)}
                        className="w-full bg-background border rounded-xl px-3.5 py-2 text-xs font-bold text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary transition-all animate-in fade-in duration-200"
                        style={{ borderColor: 'var(--athlon-border)' }}
                      />
                    )}
                  </div>
                </div>

                {/* Set Scores Entry */}
                <div className="space-y-2.5">
                  <label className="text-xs font-black uppercase tracking-wider text-foreground/70 flex items-center justify-between">
                    <span>Enter Set Scores</span>
                    <span className="text-[10px] text-foreground/40 font-normal">Team A vs Team B</span>
                  </label>

                  <div className="grid grid-cols-3 gap-2">
                    {/* Set 1 */}
                    <div className="p-3 rounded-2xl bg-background border space-y-1.5 text-center" style={{ borderColor: 'var(--athlon-border)' }}>
                      <div className="text-[10px] font-black uppercase text-foreground/50">Set 1</div>
                      <div className="flex items-center justify-center gap-1.5">
                        <input
                          type="number"
                          placeholder="21"
                          value={set1TeamA}
                          onChange={(e) => setSet1TeamA(e.target.value)}
                          className="w-10 text-center py-1 rounded-lg bg-surface border text-xs font-black text-foreground focus:outline-none focus:border-primary"
                          style={{ borderColor: 'var(--athlon-border)' }}
                        />
                        <span className="text-xs font-bold text-foreground/40">-</span>
                        <input
                          type="number"
                          placeholder="18"
                          value={set1TeamB}
                          onChange={(e) => setSet1TeamB(e.target.value)}
                          className="w-10 text-center py-1 rounded-lg bg-surface border text-xs font-black text-foreground focus:outline-none focus:border-primary"
                          style={{ borderColor: 'var(--athlon-border)' }}
                        />
                      </div>
                    </div>

                    {/* Set 2 */}
                    <div className="p-3 rounded-2xl bg-background border space-y-1.5 text-center" style={{ borderColor: 'var(--athlon-border)' }}>
                      <div className="text-[10px] font-black uppercase text-foreground/50">Set 2 (Optional)</div>
                      <div className="flex items-center justify-center gap-1.5">
                        <input
                          type="number"
                          placeholder="21"
                          value={set2TeamA}
                          onChange={(e) => setSet2TeamA(e.target.value)}
                          className="w-10 text-center py-1 rounded-lg bg-surface border text-xs font-black text-foreground focus:outline-none focus:border-primary"
                          style={{ borderColor: 'var(--athlon-border)' }}
                        />
                        <span className="text-xs font-bold text-foreground/40">-</span>
                        <input
                          type="number"
                          placeholder="15"
                          value={set2TeamB}
                          onChange={(e) => setSet2TeamB(e.target.value)}
                          className="w-10 text-center py-1 rounded-lg bg-surface border text-xs font-black text-foreground focus:outline-none focus:border-primary"
                          style={{ borderColor: 'var(--athlon-border)' }}
                        />
                      </div>
                    </div>

                    {/* Set 3 */}
                    <div className="p-3 rounded-2xl bg-background border space-y-1.5 text-center" style={{ borderColor: 'var(--athlon-border)' }}>
                      <div className="text-[10px] font-black uppercase text-foreground/50">Set 3 (Optional)</div>
                      <div className="flex items-center justify-center gap-1.5">
                        <input
                          type="number"
                          placeholder="-"
                          value={set3TeamA}
                          onChange={(e) => setSet3TeamA(e.target.value)}
                          className="w-10 text-center py-1 rounded-lg bg-surface border text-xs font-black text-foreground focus:outline-none focus:border-primary"
                          style={{ borderColor: 'var(--athlon-border)' }}
                        />
                        <span className="text-xs font-bold text-foreground/40">-</span>
                        <input
                          type="number"
                          placeholder="-"
                          value={set3TeamB}
                          onChange={(e) => setSet3TeamB(e.target.value)}
                          className="w-10 text-center py-1 rounded-lg bg-surface border text-xs font-black text-foreground focus:outline-none focus:border-primary"
                          style={{ borderColor: 'var(--athlon-border)' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Winner Badge */}
                {selectedWinner && (
                  <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs font-black text-emerald-400">
                    <span className="flex items-center gap-1.5">
                      <Trophy className="w-4 h-4" /> Winner Declared:
                    </span>
                    <span>{selectedWinner === 'TEAM_A' ? teamAPlayer1 || 'Team A' : teamBPlayer1 || 'Team B'}</span>
                  </div>
                )}
              </div>

              {/* Modal Footer Actions */}
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
                  disabled={isSubmitting}
                  className="w-2/3 py-3 rounded-2xl bg-primary text-black text-xs font-black tracking-wide hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2 disabled:opacity-50"
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