'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { OrganizationService, OrganizationMemberResponse } from '@/lib/api/organization';
import { ClubMatchService, ClubMatch } from '@/lib/api/clubMatch';
import { UserService } from '@/lib/api/user';
import {
  Trophy,
  Medal,
  Search,
  TrendingUp,
  Activity,
  Star,
  Crown,
  Loader2,
  RefreshCw,
  Plus,
  Flame,
  ArrowUpRight,
  Shield,
  User,
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

interface MemberStats {
  memberUuid: string;
  fullName: string;
  photo?: string;
  phone?: string;
  role?: string;
  matchesPlayed: number;
  wins: number;
  losses: number;
  winRate: number; // percentage
  points: number; // 3 pts per win, 1 pt per match played
  form: ('W' | 'L')[];
}

export default function LeaderboardPage() {
  const params = useParams();
  const orgIdParam = (params?.orgId as string) || '';
  const { getActiveOrganization } = useWorkspaceStore();
  const org = getActiveOrganization();

  const orgUuid = org?.id || orgIdParam;

  const [members, setMembers] = useState<OrganizationMemberResponse[]>([]);
  const [matches, setMatches] = useState<ClubMatch[]>([]);
  const [clubSport, setClubSport] = useState<string>('Badminton');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'POINTS' | 'WIN_RATE' | 'WINS'>('POINTS');

  useEffect(() => {
    if (orgUuid) {
      loadData();
    }
  }, [orgUuid]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [membersRes, matchesRes, profileRes] = await Promise.allSettled([
        OrganizationService.getMembers(orgUuid),
        ClubMatchService.getMatchesByOrg(orgUuid),
        OrganizationService.getProfileByOrgUuid(orgUuid)
      ]);

      if (membersRes.status === 'fulfilled') {
        const memList = Array.isArray(membersRes.value)
          ? membersRes.value
          : ((membersRes.value as any)?.data || []);
        setMembers(memList);
      }

      if (matchesRes.status === 'fulfilled') {
        const matchList = Array.isArray(matchesRes.value)
          ? matchesRes.value
          : ((matchesRes.value as any)?.data || []);
        setMatches(matchList);
      }

      if (profileRes.status === 'fulfilled') {
        const profData = (profileRes.value as any)?.data || profileRes.value;
        if (profData?.sportsOffered) {
          setClubSport(profData.sportsOffered);
        }
      }
    } catch (err) {
      console.error('Failed to load leaderboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Compute live player standings from matches & members
  const leaderboardData: MemberStats[] = useMemo(() => {
    if (!members.length) return [];

    return members.map((member) => {
      const name = member.fullName.trim().toLowerCase();

      // Find all matches where this member played
      const playerMatches = matches.filter((m) => {
        const teamA = (m.teamAPlayers || '').toLowerCase();
        const teamB = (m.teamBPlayers || '').toLowerCase();
        return teamA.includes(name) || teamB.includes(name);
      });

      let wins = 0;
      let losses = 0;
      const form: ('W' | 'L')[] = [];

      // Sort matches chronologically to calculate form (recent matches first)
      const sortedMatches = [...playerMatches].sort(
        (a, b) => new Date(b.matchDate || 0).getTime() - new Date(a.matchDate || 0).getTime()
      );

      sortedMatches.forEach((m) => {
        const winner = (m.winner || '').toLowerCase();
        const isWinner = winner.includes(name);

        if (isWinner) {
          wins++;
          if (form.length < 5) form.push('W');
        } else {
          losses++;
          if (form.length < 5) form.push('L');
        }
      });

      const mp = wins + losses;
      const winRate = mp > 0 ? Math.round((wins / mp) * 100) : 0;
      const points = wins * 3 + mp * 1; // Standard: 3 pts per win, 1 pt participation

      return {
        memberUuid: member.organizationMemberUuid,
        fullName: member.fullName,
        photo: member.photo,
        phone: member.phone,
        role: member.role,
        matchesPlayed: mp,
        wins,
        losses,
        winRate,
        points,
        form: form.reverse()
      };
    });
  }, [members, matches]);

  // Sort and filter leaderboard
  const sortedLeaderboard = useMemo(() => {
    const filtered = leaderboardData.filter((m) =>
      m.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.sort((a, b) => {
      if (sortBy === 'POINTS') {
        if (b.points !== a.points) return b.points - a.points;
        return b.winRate - a.winRate;
      }
      if (sortBy === 'WIN_RATE') {
        if (b.winRate !== a.winRate) return b.winRate - a.winRate;
        return b.points - a.points;
      }
      if (sortBy === 'WINS') {
        if (b.wins !== a.wins) return b.wins - a.wins;
        return b.points - a.points;
      }
      return 0;
    });
  }, [leaderboardData, searchTerm, sortBy]);

  const topThree = sortedLeaderboard.slice(0, 3);
  const restOfList = sortedLeaderboard.slice(3);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-background">
      {/* Background Glow */}
      <div className="absolute top-0 left-0 right-0 h-[45vh] bg-gradient-to-b from-primary/10 via-background to-background pointer-events-none" />

      <div className="relative p-6 md:p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-2">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 text-primary border border-primary/25 text-xs font-black uppercase tracking-widest mb-3">
              <Star className="w-3.5 h-3.5 fill-primary" /> Official Club Standings
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground tracking-tight">
                Club Leaderboard
              </h1>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-500/15 text-blue-400 border border-blue-500/25 flex items-center gap-1.5">
                <span>{AVAILABLE_SPORTS_ICONS[clubSport] || '🏅'}</span>
                <span>{clubSport}</span>
              </span>
            </div>
            <p className="text-sm md:text-base text-foreground/50 font-medium mt-1">
              Live standings computed from recorded match results for {org?.name || 'your club'}.
            </p>
          </div>

          {/* Quick Actions & Refresh */}
          <div className="flex items-center gap-3 self-start md:self-auto">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface border border-foreground/10 text-sm font-bold text-foreground hover:bg-foreground/5 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
            </button>
            <Link
              href={`/org/${orgUuid}/matches`}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-black text-sm font-black tracking-wide hover:opacity-90 transition-all shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" /> Record Match
            </Link>
          </div>
        </div>


        {/* Loading Spinner */}
        {loading ? (
          <div className="py-28 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm font-semibold text-foreground/50">Calculating live standings...</p>
          </div>
        ) : members.length === 0 ? (
          <div className="py-20 px-6 text-center space-y-4 bg-surface border border-foreground/5 rounded-3xl">
            <div className="w-16 h-16 rounded-3xl bg-foreground/5 border border-foreground/10 mx-auto flex items-center justify-center text-foreground/40">
              <Trophy className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">No Club Members Found</h3>
              <p className="text-sm text-foreground/50 max-w-md mx-auto mt-1">
                Add athletes in the Members section to start calculating rankings and standings.
              </p>
            </div>
            <Link
              href={`/org/${orgUuid}/members`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-black text-sm font-black tracking-wide hover:opacity-90 shadow-lg shadow-primary/20"
            >
              <Plus className="w-4 h-4" /> Add Club Members
            </Link>
          </div>
        ) : (
          <>
            {/* TOP 3 PODIUM ARENA */}
            {sortedLeaderboard.some((m) => m.matchesPlayed > 0) && (
              <div className="flex justify-center items-end gap-2 sm:gap-4 md:gap-6 pt-8 pb-4 max-w-4xl mx-auto px-2">
                {/* 2nd Place (Silver) */}
                {topThree[1] && (
                  <div className="flex flex-col items-center w-1/3 max-w-[220px] group transition-all">
                    <div className="relative mb-5 transform transition-transform group-hover:-translate-y-1.5 duration-300">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden ring-4 ring-slate-300 shadow-[0_0_25px_rgba(203,213,225,0.25)] bg-surface flex items-center justify-center">
                        {topThree[1].photo ? (
                          <img
                            src={UserService.getPhotoUrl(topThree[1].photo)}
                            alt={topThree[1].fullName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-lg sm:text-2xl font-black text-slate-300">
                            {topThree[1].fullName?.charAt(0)?.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-slate-200 to-slate-400 text-slate-900 px-2.5 py-0.5 rounded-full font-black text-xs shadow-md whitespace-nowrap">
                        2ND
                      </div>
                    </div>
                    <div className="w-full bg-gradient-to-b from-slate-500/10 to-surface border-t border-x border-slate-500/20 rounded-t-[28px] h-[150px] sm:h-[180px] flex flex-col items-center justify-end pb-4 sm:pb-5 px-2 text-center backdrop-blur-md">
                      <h3 className="font-black text-foreground text-xs sm:text-sm md:text-base truncate w-full mb-0.5">
                        {topThree[1].fullName}
                      </h3>
                      <div className="text-[10px] sm:text-xs font-bold text-slate-400 mb-1">
                        {topThree[1].wins}W - {topThree[1].losses}L ({topThree[1].winRate}%)
                      </div>
                      <div className="text-base sm:text-xl font-black text-foreground">
                        {topThree[1].points} <span className="text-[10px] text-foreground/50">PTS</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 1st Place (Gold) */}
                {topThree[0] && (
                  <div className="flex flex-col items-center w-1/3 max-w-[260px] z-10 group transition-all">
                    <div className="relative mb-6 transform transition-transform group-hover:-translate-y-2 duration-300">
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 animate-bounce">
                        <Crown className="w-7 h-7 text-yellow-400 drop-shadow-[0_0_12px_rgba(250,204,21,0.6)] fill-yellow-400" />
                      </div>
                      <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-30 md:h-30 rounded-2xl overflow-hidden ring-4 ring-yellow-400 shadow-[0_0_35px_rgba(250,204,21,0.4)] bg-surface flex items-center justify-center">
                        {topThree[0].photo ? (
                          <img
                            src={UserService.getPhotoUrl(topThree[0].photo)}
                            alt={topThree[0].fullName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xl sm:text-3xl font-black text-yellow-400">
                            {topThree[0].fullName?.charAt(0)?.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-amber-500 text-yellow-950 px-3.5 py-1 rounded-full font-black text-xs sm:text-sm shadow-xl whitespace-nowrap">
                        1ST CHAMP
                      </div>
                    </div>
                    <div className="w-full bg-gradient-to-b from-yellow-500/15 via-yellow-500/5 to-surface border-t border-x border-yellow-500/30 rounded-t-[32px] h-[180px] sm:h-[220px] flex flex-col items-center justify-end pb-5 sm:pb-6 px-2 text-center backdrop-blur-md relative overflow-hidden">
                      <h3 className="font-black text-foreground text-sm sm:text-base md:text-lg truncate w-full mb-0.5">
                        {topThree[0].fullName}
                      </h3>
                      <div className="text-xs font-bold text-yellow-500/90 mb-1">
                        {topThree[0].wins}W - {topThree[0].losses}L ({topThree[0].winRate}%)
                      </div>
                      <div className="text-lg sm:text-2xl font-black text-primary">
                        {topThree[0].points} <span className="text-xs text-foreground/50">PTS</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3rd Place (Bronze) */}
                {topThree[2] && (
                  <div className="flex flex-col items-center w-1/3 max-w-[220px] group transition-all">
                    <div className="relative mb-5 transform transition-transform group-hover:-translate-y-1.5 duration-300">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden ring-4 ring-amber-700/80 shadow-[0_0_25px_rgba(180,83,9,0.25)] bg-surface flex items-center justify-center">
                        {topThree[2].photo ? (
                          <img
                            src={UserService.getPhotoUrl(topThree[2].photo)}
                            alt={topThree[2].fullName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-lg sm:text-2xl font-black text-amber-500">
                            {topThree[2].fullName?.charAt(0)?.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-600 to-amber-800 text-amber-100 px-2.5 py-0.5 rounded-full font-black text-xs shadow-md whitespace-nowrap">
                        3RD
                      </div>
                    </div>
                    <div className="w-full bg-gradient-to-b from-amber-700/10 to-surface border-t border-x border-amber-700/20 rounded-t-[28px] h-[130px] sm:h-[155px] flex flex-col items-center justify-end pb-4 sm:pb-5 px-2 text-center backdrop-blur-md">
                      <h3 className="font-black text-foreground text-xs sm:text-sm md:text-base truncate w-full mb-0.5">
                        {topThree[2].fullName}
                      </h3>
                      <div className="text-[10px] sm:text-xs font-bold text-amber-500/80 mb-1">
                        {topThree[2].wins}W - {topThree[2].losses}L ({topThree[2].winRate}%)
                      </div>
                      <div className="text-base sm:text-xl font-black text-foreground">
                        {topThree[2].points} <span className="text-[10px] text-foreground/50">PTS</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Filter & Sort Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-surface border border-foreground/5 rounded-2xl p-4 shadow-sm">
              {/* Search Box */}
              <div className="relative flex-grow max-w-md">
                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40" />
                <input
                  type="text"
                  placeholder="Search athlete by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-background border border-foreground/10 rounded-xl pl-11 pr-4 py-2 text-xs font-bold text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary transition-all"
                />
              </div>

              {/* Sort Chips */}
              <div className="flex items-center gap-1.5 self-end sm:self-auto">
                <span className="text-[11px] font-black uppercase tracking-wider text-foreground/40 mr-1 hidden sm:inline">
                  Sort:
                </span>
                {[
                  { id: 'POINTS', label: 'Points (PTS)' },
                  { id: 'WIN_RATE', label: 'Win Rate (%)' },
                  { id: 'WINS', label: 'Total Wins' }
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSortBy(s.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                      sortBy === s.id
                        ? 'bg-primary text-black shadow-md shadow-primary/20'
                        : 'bg-background/80 text-foreground/60 hover:text-foreground border border-foreground/10'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* FULL STANDINGS TABLE (DESKTOP) */}
            <div className="bg-surface border border-foreground/5 rounded-[24px] overflow-hidden shadow-sm">
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-foreground/5 bg-foreground/[0.02]">
                      <th className="px-6 py-4 text-xs font-black text-foreground/50 uppercase tracking-widest text-center w-16">Rank</th>
                      <th className="px-6 py-4 text-xs font-black text-foreground/50 uppercase tracking-widest">Athlete</th>
                      <th className="px-6 py-4 text-xs font-black text-foreground/50 uppercase tracking-widest text-center">Played</th>
                      <th className="px-6 py-4 text-xs font-black text-foreground/50 uppercase tracking-widest text-center">Won</th>
                      <th className="px-6 py-4 text-xs font-black text-foreground/50 uppercase tracking-widest text-center">Lost</th>
                      <th className="px-6 py-4 text-xs font-black text-foreground/50 uppercase tracking-widest text-center">Win %</th>
                      <th className="px-6 py-4 text-xs font-black text-foreground/50 uppercase tracking-widest text-center">Recent Form</th>
                      <th className="px-6 py-4 text-xs font-black text-foreground/50 uppercase tracking-widest text-right">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-foreground/5">
                    {sortedLeaderboard.map((item, index) => {
                      const rank = index + 1;
                      const isGold = rank === 1;
                      const isSilver = rank === 2;
                      const isBronze = rank === 3;

                      return (
                        <tr key={item.memberUuid} className="hover:bg-foreground/[0.02] transition-colors group">
                          {/* Rank */}
                          <td className="px-6 py-4 text-center">
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
                              <span className="font-mono font-bold text-xs text-foreground/40">#{rank}</span>
                            )}
                          </td>

                          {/* Athlete Info */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-foreground/10 border border-foreground/10 overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
                                {item.photo ? (
                                  <img
                                    src={UserService.getPhotoUrl(item.photo)}
                                    alt={item.fullName}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="text-xs font-black text-primary">
                                    {item.fullName?.charAt(0)?.toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <div>
                                <div className={`font-extrabold text-sm ${isGold ? 'text-primary font-black' : 'text-foreground'}`}>
                                  {item.fullName}
                                </div>
                                <div className="text-[11px] font-mono text-foreground/40">
                                  {item.phone ? `+91 ${item.phone}` : item.role || 'Member'}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Played */}
                          <td className="px-6 py-4 text-center font-mono font-bold text-xs text-foreground">
                            {item.matchesPlayed}
                          </td>

                          {/* Won */}
                          <td className="px-6 py-4 text-center font-mono font-black text-xs text-emerald-400">
                            {item.wins}
                          </td>

                          {/* Lost */}
                          <td className="px-6 py-4 text-center font-mono font-bold text-xs text-red-400/80">
                            {item.losses}
                          </td>

                          {/* Win % */}
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <span className="font-mono font-black text-xs text-foreground">{item.winRate}%</span>
                              <div className="w-12 h-1.5 rounded-full bg-foreground/10 overflow-hidden">
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
                          </td>

                          {/* Recent Form */}
                          <td className="px-6 py-4 text-center">
                            {item.form.length > 0 ? (
                              <div className="flex items-center justify-center gap-1">
                                {item.form.map((res, i) => (
                                  <span
                                    key={i}
                                    className={`w-4 h-4 rounded-md text-[9px] font-black flex items-center justify-center ${
                                      res === 'W'
                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                    }`}
                                  >
                                    {res}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-foreground/30">-</span>
                            )}
                          </td>

                          {/* Points */}
                          <td className="px-6 py-4 text-right">
                            <span className="inline-flex items-center px-3 py-1 rounded-xl bg-background border font-mono font-black text-sm text-primary shadow-inner" style={{ borderColor: 'var(--athlon-border)' }}>
                              {item.points} PTS
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* MOBILE STANDINGS CARDS */}
              <div className="block md:hidden divide-y divide-foreground/5">
                {sortedLeaderboard.map((item, index) => {
                  const rank = index + 1;
                  const isGold = rank === 1;
                  const isSilver = rank === 2;
                  const isBronze = rank === 3;

                  return (
                    <div key={item.memberUuid} className="p-4 space-y-3 hover:bg-foreground/[0.02] transition-colors">
                      {/* Top row: Rank, Avatar, Name, Points */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className={`w-7 h-7 rounded-xl font-mono font-black text-xs flex items-center justify-center shrink-0 ${
                            isGold
                              ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                              : isSilver
                              ? 'bg-slate-300/20 text-slate-300 border border-slate-300/30'
                              : isBronze
                              ? 'bg-amber-700/20 text-amber-500 border border-amber-700/30'
                              : 'bg-foreground/5 text-foreground/50 border border-foreground/10'
                          }`}>
                            {isGold ? '🥇' : isSilver ? '🥈' : isBronze ? '🥉' : `#${rank}`}
                          </span>

                          <div className="w-9 h-9 rounded-xl bg-foreground/10 border border-foreground/10 overflow-hidden flex items-center justify-center shrink-0">
                            {item.photo ? (
                              <img
                                src={UserService.getPhotoUrl(item.photo)}
                                alt={item.fullName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-xs font-black text-primary">
                                {item.fullName?.charAt(0)?.toUpperCase()}
                              </span>
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className={`font-extrabold text-sm truncate ${isGold ? 'text-primary font-black' : 'text-foreground'}`}>
                              {item.fullName}
                            </div>
                            <div className="text-[10px] font-mono text-foreground/40">
                              {item.wins}W - {item.losses}L • {item.matchesPlayed} MP
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="px-3 py-1 rounded-xl bg-background border font-mono font-black text-xs text-primary shadow-inner" style={{ borderColor: 'var(--athlon-border)' }}>
                            {item.points} PTS
                          </div>
                          <div className="text-[10px] font-bold text-emerald-400 mt-0.5">
                            {item.winRate}% Win Rate
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
