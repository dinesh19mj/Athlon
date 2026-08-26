'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  Search,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Trophy,
  ChevronRight,
  ActivityIcon,
  Shield,
  Sparkles,
  Layers,
  ArrowRight,
  Filter,
  Flame,
  CheckCircle2,
  Tv,
  Building2,
  Building,
  X,
  Plus,
  Home,
  LayoutGrid,
  List,
  GalleryHorizontal,
  Clock,
} from 'lucide-react';
import Link from 'next/link';
import { TournamentService, Tournament } from '@/lib/api/tournaments';
import { TeamChampionshipService, TeamChampionship } from '@/lib/api/teamChampionship';
import { PublicTournamentCard } from '@/components/tournaments/PublicTournamentCard';
import { PublicTeamChampionshipCard } from '@/components/tournaments/PublicTeamChampionshipCard';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { themeController } from '@/config/theme';
import { Athlon3DIcon } from '@/components/common/Athlon3DIcon';

export default function TournamentsPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'carousel'>('grid');
  const [desktopFilter, setDesktopFilter] = useState<'all' | 'championships' | 'upcoming' | 'live' | 'completed'>('all');
  const [selectedSport, setSelectedSport] = useState<string>('all');
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [championships, setChampionships] = useState<TeamChampionship[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // When user is not logged in, ensure standard default Athlon theme is active
    if (!isAuthenticated) {
      themeController.setTheme('algae');
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const [res, champRes] = await Promise.allSettled([
          TournamentService.getAll(),
          TeamChampionshipService.getAllPublic(),
        ]);
        if (res.status === 'fulfilled' && res.value?.data) {
          const activePublic = (res.value.data || []).filter((t: Tournament) => t.visibility === 'PUBLIC');
          setTournaments(activePublic);
        }
        if (champRes.status === 'fulfilled' && champRes.value) {
          const val = champRes.value as any;
          const list = Array.isArray(val) ? val : (Array.isArray(val?.data) ? val.data : []);
          setChampionships(list);
        }
      } catch (err) {
        console.error('Failed to load tournaments and championships', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTournaments();
  }, []);

  const mobileTabs = [
    { id: 'all', label: 'All' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'championships', label: 'Championships' },
    { id: 'live', label: 'Live' },
    { id: 'completed', label: 'Completed' },
  ];

  // Mobile filtered tournaments
  const mobileFilteredTournaments = tournaments.filter((t) => {
    const now = new Date().getTime();
    const start = new Date(t.startDate).getTime();
    const end = new Date(t.endDate).getTime();

    let matchesTab = true;
    if (activeTab === 'live') {
      matchesTab = t.status === 'LIVE' || (!isNaN(start) && !isNaN(end) && now >= start && now <= end);
    } else if (activeTab === 'completed') {
      matchesTab = t.status === 'COMPLETED' || (!isNaN(end) && now > end);
    } else if (activeTab === 'upcoming') {
      matchesTab = t.status === 'UPCOMING' || isNaN(start) || now < start;
    } else if (activeTab === 'championships') {
      matchesTab = false;
    }

    if (!matchesTab) return false;

    if (selectedSport !== 'all' && t.sport?.toLowerCase() !== selectedSport.toLowerCase()) {
      return false;
    }

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.name?.toLowerCase().includes(q) ||
      t.location?.toLowerCase().includes(q) ||
      t.sport?.toLowerCase().includes(q)
    );
  });

  // Mobile filtered championships
  const mobileFilteredChampionships = championships.filter((c) => {
    const now = new Date().getTime();
    const start = c.startDate ? new Date(c.startDate).getTime() : NaN;
    const end = c.endDate ? new Date(c.endDate).getTime() : NaN;

    let matchesTab = true;
    if (activeTab === 'live') {
      matchesTab = c.stage === 'LEAGUE_STAGE' || c.stage === 'KNOCKOUT_STAGE' || (!isNaN(start) && !isNaN(end) && now >= start && now <= end);
    } else if (activeTab === 'completed') {
      matchesTab = c.stage === 'COMPLETED' || (!isNaN(end) && now > end);
    } else if (activeTab === 'upcoming') {
      matchesTab = c.stage === 'REGISTRATION_OPEN' || c.stage === 'AUCTION_STAGE' || isNaN(start) || now < start;
    } else if (activeTab === 'championships' || activeTab === 'all') {
      matchesTab = true;
    }

    if (!matchesTab) return false;

    if (selectedSport !== 'all' && c.sport?.toLowerCase() !== selectedSport.toLowerCase()) {
      return false;
    }

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.location?.toLowerCase().includes(q) ||
      c.sport?.toLowerCase().includes(q)
    );
  });

  const mobileTotalVisible = (activeTab === 'championships' ? 0 : mobileFilteredTournaments.length) + mobileFilteredChampionships.length;

  // Desktop Metrics
  const totalCount = tournaments.length + championships.length;
  const totalChampionships = championships.length;
  const liveCount =
    tournaments.filter((t) => t.status === 'LIVE').length +
    championships.filter((c) => c.stage === 'LEAGUE_STAGE' || c.stage === 'KNOCKOUT_STAGE').length;
  const upcomingCount = totalCount - liveCount;

  // Desktop filtered tournaments
  const desktopTournaments = useMemo(() => {
    if (desktopFilter === 'championships') return [];
    return tournaments.filter((t) => {
      const now = new Date().getTime();
      const start = new Date(t.startDate).getTime();
      const end = new Date(t.endDate).getTime();

      let matchesFilter = true;
      if (desktopFilter === 'live') {
        matchesFilter = t.status === 'LIVE' || (!isNaN(start) && !isNaN(end) && now >= start && now <= end);
      } else if (desktopFilter === 'completed') {
        matchesFilter = t.status === 'COMPLETED' || (!isNaN(end) && now > end);
      } else if (desktopFilter === 'upcoming') {
        matchesFilter = t.status === 'UPCOMING' || isNaN(start) || now < start;
      }

      if (!matchesFilter) return false;

      if (selectedSport !== 'all' && t.sport?.toLowerCase() !== selectedSport.toLowerCase()) {
        return false;
      }

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        t.name?.toLowerCase().includes(q) ||
        t.location?.toLowerCase().includes(q) ||
        t.sport?.toLowerCase().includes(q)
      );
    });
  }, [tournaments, desktopFilter, selectedSport, searchQuery]);

  // Desktop filtered championships
  const desktopChampionships = useMemo(() => {
    return championships.filter((c) => {
      const now = new Date().getTime();
      const start = c.startDate ? new Date(c.startDate).getTime() : NaN;
      const end = c.endDate ? new Date(c.endDate).getTime() : NaN;

      let matchesFilter = true;
      if (desktopFilter === 'live') {
        matchesFilter = c.stage === 'LEAGUE_STAGE' || c.stage === 'KNOCKOUT_STAGE' || (!isNaN(start) && !isNaN(end) && now >= start && now <= end);
      } else if (desktopFilter === 'completed') {
        matchesFilter = c.stage === 'COMPLETED' || (!isNaN(end) && now > end);
      } else if (desktopFilter === 'upcoming') {
        matchesFilter = c.stage === 'REGISTRATION_OPEN' || c.stage === 'AUCTION_STAGE' || isNaN(start) || now < start;
      }

      if (!matchesFilter) return false;

      if (selectedSport !== 'all' && c.sport?.toLowerCase() !== selectedSport.toLowerCase()) {
        return false;
      }

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        c.name?.toLowerCase().includes(q) ||
        c.location?.toLowerCase().includes(q) ||
        c.sport?.toLowerCase().includes(q)
      );
    });
  }, [championships, desktopFilter, selectedSport, searchQuery]);

  const sportsList = ['all', 'Badminton', 'Cricket', 'Football', 'Volleyball'];

  return (
    <div className="min-h-screen w-full bg-background text-foreground font-sans selection:bg-primary selection:text-black">
      {/* ══════════════════════════════════════════════════════════════════════
          1. MOBILE VIEW ONLY (< md) - REDESIGNED STYLISH & COMPACT EXPERIENCE
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="block md:hidden pb-28 min-h-screen">
        {/* Compact Sticky Top Navbar */}
        <header
          className="sticky top-0 z-40 flex items-center justify-between px-3.5 py-2.5 backdrop-blur-xl border-b transition-all"
          style={{
            backgroundColor: 'var(--athlon-navigation)',
            borderColor: 'var(--athlon-border)',
          }}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <Link
              href="/"
              className="w-8 h-8 rounded-xl flex items-center justify-center border text-foreground/80 hover:text-foreground transition-all hover:scale-105 active:scale-95 shrink-0"
              style={{
                backgroundColor: 'var(--athlon-surface)',
                borderColor: 'var(--athlon-border)',
              }}
              aria-label="Back to Home"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-xs font-black uppercase tracking-wider text-foreground truncate">
                  Tournaments
                </h1>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-primary/15 text-primary border border-primary/25 font-mono shrink-0">
                  {mobileTotalVisible}
                </span>
              </div>
              <p className="text-[10px] text-foreground/50 font-bold truncate">
                Find and compete in sports events
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {liveCount > 0 && (
              <Link
                href="/live-score"
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black bg-red-500/15 border border-red-500/30 text-red-400 animate-pulse"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <span>{liveCount} Live</span>
              </Link>
            )}
          </div>
        </header>

        <main className="w-full max-w-lg mx-auto px-3.5 flex flex-col gap-3.5 pt-3">
          {/* Live Arena Ribbon (if live matches exist) */}
          {liveCount > 0 && (
            <Link
              href="/live-score"
              className="flex items-center justify-between p-2.5 rounded-2xl border transition-all hover:scale-[1.01] active:scale-[0.99] shadow-sm group"
              style={{
                background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.12) 0%, rgba(0, 229, 255, 0.08) 100%)',
                borderColor: 'rgba(239, 68, 68, 0.3)',
              }}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                  <Tv className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping shrink-0" />
                    <span className="text-[11px] font-black text-foreground uppercase tracking-tight truncate">
                      {liveCount} Active Competition{liveCount > 1 ? 's' : ''} in Arena
                    </span>
                  </div>
                  <span className="text-[9.5px] text-foreground/60 font-medium truncate block">
                    Watch real-time live scores and court points
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-primary group-hover:translate-x-0.5 transition-transform shrink-0 ml-1.5" />
            </Link>
          )}

          {/* Search Bar & Clear Action */}
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-foreground/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tournament, venue, or sport..."
              className="w-full pl-9 pr-8 py-2 rounded-xl border text-xs font-medium outline-none focus:border-primary transition-all text-foreground placeholder:text-foreground/40"
              style={{
                backgroundColor: 'var(--athlon-surface)',
                borderColor: 'var(--athlon-border)',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground p-0.5"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sport Filter Pills (Smooth Horizontal Scroll) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scroll-px-3 hide-scrollbar -mx-3.5 px-3.5">
            {sportsList.map((sport) => {
              const isSelected = selectedSport.toLowerCase() === sport.toLowerCase();
              const sportIcon =
                sport === 'all'
                  ? '⚡'
                  : sport === 'Badminton'
                  ? '🏸'
                  : sport === 'Cricket'
                  ? '🏏'
                  : sport === 'Football'
                  ? '⚽'
                  : sport === 'Volleyball'
                  ? '🏐'
                  : '🏆';

              return (
                <button
                  key={sport}
                  onClick={() => setSelectedSport(sport)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold shrink-0 transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-primary text-black border-primary shadow-sm shadow-primary/20 scale-[1.02]'
                      : 'border-transparent text-foreground/70 hover:text-foreground hover:bg-white/5'
                  }`}
                  style={{
                    backgroundColor: isSelected ? undefined : 'var(--athlon-surface)',
                    borderColor: isSelected ? undefined : 'var(--athlon-border)',
                  }}
                >
                  <span className="text-xs">{sportIcon}</span>
                  <span className="capitalize">{sport === 'all' ? 'All Sports' : sport}</span>
                </button>
              );
            })}
          </div>

          {/* Segmented Status Tabs (Compact & Count-Aware) */}
          <div
            className="flex items-center p-1 rounded-xl border relative gap-1 overflow-x-auto hide-scrollbar"
            style={{
              backgroundColor: 'var(--athlon-surface)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            {mobileTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              let tabCount = 0;
              if (tab.id === 'all') tabCount = totalCount;
              else if (tab.id === 'upcoming') tabCount = upcomingCount;
              else if (tab.id === 'championships') tabCount = totalChampionships;
              else if (tab.id === 'live') tabCount = liveCount;
              else if (tab.id === 'completed') {
                tabCount =
                  tournaments.filter((t) => t.status === 'COMPLETED').length +
                  championships.filter((c) => c.stage === 'COMPLETED').length;
              }

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-1.5 px-2 text-[10.5px] font-black uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1 shrink-0 ${
                    isActive
                      ? 'bg-primary text-black shadow-sm font-black'
                      : 'text-foreground/60 hover:text-foreground'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tabCount > 0 && (
                    <span
                      className={`text-[9px] font-mono font-bold px-1 rounded-full ${
                        isActive ? 'bg-black/20 text-black' : 'bg-foreground/10 text-foreground/60'
                      }`}
                    >
                      {tabCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* View Mode Toggle Header */}
          <div className="flex items-center justify-between px-0.5 pt-0.5">
            <div className="text-[10.5px] font-bold text-foreground/60">
              Showing <span className="text-foreground font-black font-mono">{mobileTotalVisible}</span> {mobileTotalVisible === 1 ? 'competition' : 'competitions'}
            </div>

            {/* View Mode Switcher: Grid, List, Scroll */}
            <div
              className="flex items-center p-0.5 rounded-xl border"
              style={{
                backgroundColor: 'var(--athlon-surface)',
                borderColor: 'var(--athlon-border)',
              }}
            >
              <button
                onClick={() => setViewMode('grid')}
                title="Grid View"
                aria-label="Grid View"
                className={`p-1.5 rounded-lg transition-all flex items-center gap-1 ${
                  viewMode === 'grid'
                    ? 'bg-primary text-black font-black shadow-sm'
                    : 'text-foreground/50 hover:text-foreground'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="text-[9.5px] font-bold hidden sm:inline">Grid</span>
              </button>

              <button
                onClick={() => setViewMode('list')}
                title="List View"
                aria-label="List View"
                className={`p-1.5 rounded-lg transition-all flex items-center gap-1 ${
                  viewMode === 'list'
                    ? 'bg-primary text-black font-black shadow-sm'
                    : 'text-foreground/50 hover:text-foreground'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span className="text-[9.5px] font-bold hidden sm:inline">List</span>
              </button>

              <button
                onClick={() => setViewMode('carousel')}
                title="Horizontal Scroll View"
                aria-label="Horizontal Scroll View"
                className={`p-1.5 rounded-lg transition-all flex items-center gap-1 ${
                  viewMode === 'carousel'
                    ? 'bg-primary text-black font-black shadow-sm'
                    : 'text-foreground/50 hover:text-foreground'
                }`}
              >
                <GalleryHorizontal className="w-3.5 h-3.5" />
                <span className="text-[9.5px] font-bold hidden sm:inline">Scroll</span>
              </button>
            </div>
          </div>

          {/* Cards / List / Carousel Content Section */}
          <div className="flex flex-col gap-3.5 pt-0.5">
            {loading ? (
              <div className="space-y-3 py-4">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="w-full h-36 rounded-2xl animate-pulse border"
                    style={{
                      backgroundColor: 'var(--athlon-surface)',
                      borderColor: 'var(--athlon-border)',
                    }}
                  />
                ))}
              </div>
            ) : mobileTotalVisible === 0 ? (
              <div
                className="py-12 px-4 text-center rounded-2xl border flex flex-col items-center justify-center space-y-3"
                style={{
                  backgroundColor: 'var(--athlon-surface)',
                  borderColor: 'var(--athlon-border)',
                }}
              >
                <div className="w-12 h-12 rounded-2xl bg-foreground/5 border border-foreground/10 flex items-center justify-center text-foreground/40">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
                    No Tournaments Found
                  </h3>
                  <p className="text-[11px] text-foreground/50 mt-1 max-w-xs mx-auto">
                    {searchQuery || selectedSport !== 'all'
                      ? 'No events match your current search and sport filters.'
                      : 'There are no active tournaments in this category yet.'}
                  </p>
                </div>

                {(searchQuery || selectedSport !== 'all' || activeTab !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedSport('all');
                      setActiveTab('all');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/25 text-primary text-[11px] font-bold hover:bg-primary/20 transition-all"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            ) : viewMode === 'grid' ? (
              /* ── 1. GRID VIEW (Rich Stacked Bento Cards) ── */
              <>
                {/* Team Championships */}
                {mobileFilteredChampionships.length > 0 && (
                  <div className="space-y-3">
                    {activeTab === 'all' && (
                      <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-primary px-0.5">
                        <Shield className="w-3.5 h-3.5" />
                        <span>Team Championships ({mobileFilteredChampionships.length})</span>
                      </div>
                    )}
                    {mobileFilteredChampionships.map((c) => (
                      <PublicTeamChampionshipCard
                        key={c.championshipId || c.championshipUuid}
                        championship={c}
                      />
                    ))}
                  </div>
                )}

                {/* Individual Tournaments */}
                {activeTab !== 'championships' && mobileFilteredTournaments.length > 0 && (
                  <div className="space-y-3">
                    {activeTab === 'all' && mobileFilteredChampionships.length > 0 && (
                      <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-primary px-0.5 pt-2">
                        <Trophy className="w-3.5 h-3.5" />
                        <span>Tournaments & Knockouts ({mobileFilteredTournaments.length})</span>
                      </div>
                    )}
                    {mobileFilteredTournaments.map((tournament) => (
                      <PublicTournamentCard
                        key={tournament.tournamentId || tournament.tournamentUuid}
                        tournament={tournament}
                        hrefPrefix="/tournaments"
                      />
                    ))}
                  </div>
                )}
              </>
            ) : viewMode === 'list' ? (
              /* ── 2. LIST VIEW (Compact High-Density Rows) ── */
              <div className="space-y-2">
                {/* Team Championships in List View */}
                {mobileFilteredChampionships.map((c) => (
                  <Link
                    href={`/home/team-championship/${c.championshipUuid || c.championshipId}`}
                    key={c.championshipId || c.championshipUuid}
                    className="flex items-center justify-between p-3 rounded-2xl border transition-all hover:scale-[1.01] active:scale-[0.99] group shadow-sm"
                    style={{
                      backgroundColor: 'var(--athlon-surface)',
                      borderColor: 'var(--athlon-border)',
                    }}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-105 transition-transform">
                        <Shield className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-black text-foreground truncate group-hover:text-primary transition-colors">
                            {c.name}
                          </h4>
                          <span className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[8px] font-black uppercase shrink-0">
                            {c.auctionMode?.replace('_', ' ') || 'Auction'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[9.5px] text-foreground/55 font-medium truncate mt-0.5">
                          <span className="truncate">{c.sport || 'Sports'}</span>
                          <span>•</span>
                          <span className="truncate">{c.location || 'Venue TBA'}</span>
                          <span>•</span>
                          <span className="text-foreground/75 font-bold">{c.maxTeams || 6} Teams</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className="text-[9.5px] font-mono font-black text-primary bg-primary/10 px-2 py-0.5 rounded-lg border border-primary/20">
                        {c.teamRegistrationFee ? `₹${c.teamRegistrationFee}` : 'Free'}
                      </span>
                      <ChevronRight className="w-4 h-4 text-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </Link>
                ))}

                {/* Individual Tournaments in List View */}
                {activeTab !== 'championships' &&
                  mobileFilteredTournaments.map((tournament) => {
                    const isFinished = tournament.status === 'COMPLETED' || tournament.status === 'FINISHED';
                    return (
                      <Link
                        href={`/tournaments/${tournament.tournamentUuid || tournament.tournamentId}`}
                        key={tournament.tournamentId || tournament.tournamentUuid}
                        className="flex items-center justify-between p-3 rounded-2xl border transition-all hover:scale-[1.01] active:scale-[0.99] group shadow-sm"
                        style={{
                          backgroundColor: 'var(--athlon-surface)',
                          borderColor: 'var(--athlon-border)',
                        }}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 group-hover:scale-105 transition-transform">
                            <Trophy className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-xs font-black text-foreground truncate group-hover:text-primary transition-colors">
                                {tournament.name}
                              </h4>
                              {tournament.status === 'LIVE' ? (
                                <span className="px-1.5 py-0.2 rounded bg-red-500/15 text-red-400 border border-red-500/30 text-[8px] font-black uppercase shrink-0">
                                  LIVE
                                </span>
                              ) : isFinished ? (
                                <span className="px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 text-[8px] font-black uppercase shrink-0">
                                  Done
                                </span>
                              ) : null}
                            </div>
                            <div className="flex items-center gap-1.5 text-[9.5px] text-foreground/55 font-medium truncate mt-0.5">
                              <span className="truncate">{tournament.sport || 'Badminton'}</span>
                              <span>•</span>
                              <span className="truncate">{tournament.location || 'Venue TBA'}</span>
                              {tournament.category && (
                                <>
                                  <span>•</span>
                                  <span className="truncate">{tournament.category.split(',')[0]}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <span className="text-[9.5px] font-mono font-black text-primary bg-primary/10 px-2 py-0.5 rounded-lg border border-primary/20">
                            {tournament.registrationFees ? `₹${tournament.registrationFees}` : 'Free'}
                          </span>
                          <ChevronRight className="w-4 h-4 text-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </Link>
                    );
                  })}
              </div>
            ) : (
              /* ── 3. HORIZONTAL SCROLL / CAROUSEL VIEW ── */
              <div className="space-y-4">
                {/* Team Championships Carousel */}
                {mobileFilteredChampionships.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-0.5">
                      <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-400">
                        <Shield className="w-3.5 h-3.5" />
                        <span>Team Championships ({mobileFilteredChampionships.length})</span>
                      </div>
                      <span className="text-[9.5px] font-bold text-foreground/40 uppercase tracking-widest flex items-center gap-0.5">
                        Swipe <ArrowRight className="w-2.5 h-2.5" />
                      </span>
                    </div>

                    <div className="flex items-stretch gap-3.5 overflow-x-auto pb-3 snap-x scroll-px-3.5 hide-scrollbar -mx-3.5 px-3.5">
                      {mobileFilteredChampionships.map((c) => (
                        <div
                          key={c.championshipId || c.championshipUuid}
                          className="snap-start shrink-0 w-[84vw] sm:w-[320px] max-w-[340px]"
                        >
                          <PublicTeamChampionshipCard championship={c} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Individual Tournaments Carousel */}
                {activeTab !== 'championships' && mobileFilteredTournaments.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between px-0.5">
                      <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-primary">
                        <Trophy className="w-3.5 h-3.5" />
                        <span>Tournaments & Knockouts ({mobileFilteredTournaments.length})</span>
                      </div>
                      <span className="text-[9.5px] font-bold text-foreground/40 uppercase tracking-widest flex items-center gap-0.5">
                        Swipe <ArrowRight className="w-2.5 h-2.5" />
                      </span>
                    </div>

                    <div className="flex items-stretch gap-3.5 overflow-x-auto pb-3 snap-x scroll-px-3.5 hide-scrollbar -mx-3.5 px-3.5">
                      {mobileFilteredTournaments.map((tournament) => (
                        <div
                          key={tournament.tournamentId || tournament.tournamentUuid}
                          className="snap-start shrink-0 w-[84vw] sm:w-[320px] max-w-[340px]"
                        >
                          <PublicTournamentCard
                            tournament={tournament}
                            hrefPrefix="/tournaments"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>

        {/* Mobile Fixed Bottom Nav */}
        <nav
          className="fixed bottom-0 left-0 right-0 h-20 backdrop-blur-xl border-t z-50 px-5 flex items-center justify-between max-w-lg mx-auto"
          style={{ backgroundColor: 'var(--athlon-navigation)', borderColor: 'var(--athlon-border)' }}
        >
          <Link href="/" className="flex flex-col items-center gap-0.5 w-16 group opacity-80 hover:opacity-100 transition-opacity">
            <Athlon3DIcon type="home" size={32} active={false} />
            <span className="text-[9.5px] font-bold leading-tight" style={{ color: 'var(--athlon-text-muted)' }}>
              Home
            </span>
          </Link>

          <Link href="/tournaments" className="flex flex-col items-center gap-0.5 w-16 group">
            <Athlon3DIcon type="tournaments" size={32} active={true} />
            <span className="text-[9.5px] font-bold text-primary leading-tight">
              Tournaments
            </span>
          </Link>

          {/* 3D Circular Elevated Umpire Button */}
          <div className="relative -top-5 flex items-center justify-center">
            <Link
              href="/match-setup"
              className="w-[60px] h-[60px] rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all border-[3.5px] group relative overflow-hidden shadow-2xl"
              style={{
                backgroundColor: 'var(--athlon-primary)',
                borderColor: 'var(--athlon-navigation)',
                boxShadow: '0 10px 25px -2px var(--athlon-primary-glow), 0 4px 12px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.45), inset 0 -3px 6px rgba(0,0,0,0.3)',
              }}
            >
              {/* 3D Glass Specular Reflection Arc */}
              <div className="absolute inset-x-1 top-0 h-[45%] rounded-t-full bg-gradient-to-b from-white/40 via-white/10 to-transparent pointer-events-none" />

              <img
                src="/umpire.png"
                alt="Umpire"
                className="w-8 h-8 object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.45)] relative z-10 transition-transform group-hover:scale-110 group-active:scale-95"
              />
            </Link>
          </div>

          <Link href="/academies" className="flex flex-col items-center gap-0.5 w-16 group opacity-80 hover:opacity-100 transition-opacity">
            <Athlon3DIcon type="academies" size={32} active={false} />
            <span className="text-[9.5px] font-bold leading-tight" style={{ color: 'var(--athlon-text-muted)' }}>
              Academy
            </span>
          </Link>

          <Link href={isAuthenticated ? '/home' : '/login'} className="flex flex-col items-center gap-0.5 w-16 group opacity-80 hover:opacity-100 transition-opacity">
            <Athlon3DIcon type="profile" size={32} active={false} />
            <span className="text-[9.5px] font-bold leading-tight" style={{ color: 'var(--athlon-text-muted)' }}>
              Profile
            </span>
          </Link>
        </nav>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          2. DESKTOP VIEW ONLY (hidden on mobile, visible on md and above)
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="hidden md:block">
        {/* Desktop Top Navbar (Full Width) */}
        <header
          className="sticky top-0 z-50 w-full border-b backdrop-blur-xl bg-background/85 transition-all duration-300"
          style={{ borderColor: 'var(--athlon-border)' }}
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center text-primary group-hover:scale-105 transition-transform shadow-lg"
                style={{
                  backgroundColor: 'var(--athlon-surface)',
                  border: '1px solid var(--athlon-border)',
                  boxShadow: '0 0 20px var(--athlon-primary-soft)',
                }}
              >
                <Trophy className="w-5 h-5" style={{ color: 'var(--athlon-primary)' }} />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-foreground leading-none">
                  ATHLON
                </span>
                <span
                  className="text-[10px] font-mono font-bold tracking-widest uppercase leading-tight mt-0.5"
                  style={{ color: 'var(--athlon-primary)' }}
                >
                  Sports Platform
                </span>
              </div>
            </Link>

            {/* Center Navigation Links */}
            <nav className="flex items-center gap-1 bg-surface/40 p-1.5 rounded-2xl border border-foreground/5 backdrop-blur-md">
              <Link
                href="/"
                className="px-4 py-2 rounded-xl text-sm font-bold text-foreground/80 hover:text-foreground hover:bg-foreground/5 transition-all flex items-center gap-2"
              >
                <Home className="w-4 h-4 text-primary" />
                <span>Home</span>
              </Link>

              <Link
                href="/tournaments"
                onClick={() => setDesktopFilter('all')}
                className="px-4 py-2 rounded-xl text-sm font-black bg-primary text-black transition-all flex items-center gap-2 shadow-sm"
              >
                <Trophy className="w-4 h-4 text-black" />
                <span>Tournaments</span>
              </Link>

              <Link
                href="/academies"
                className="px-4 py-2 rounded-xl text-sm font-bold text-foreground/80 hover:text-foreground hover:bg-foreground/5 transition-all flex items-center gap-2"
              >
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span>Academies</span>
              </Link>

              <Link
                href="/live-score"
                className="px-4 py-2 rounded-xl text-sm font-bold text-foreground/80 hover:text-foreground hover:bg-foreground/5 transition-all flex items-center gap-2"
              >
                <Tv className="w-4 h-4 text-blue-400" />
                <span>Live Arena</span>
                {liveCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                )}
              </Link>
            </nav>

            {/* Right Action CTAs */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <Link
                  href="/home"
                  className="flex items-center gap-2 bg-primary text-black text-sm font-black px-5 py-2.5 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg"
                  style={{ boxShadow: '0 4px 20px var(--athlon-primary-glow)' }}
                >
                  <span>Go to App</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    href="/login"
                    className="text-sm font-bold px-4 py-2 rounded-xl text-foreground/80 hover:text-foreground hover:bg-foreground/5 transition-all"
                  >
                    Log In
                  </Link>

                  <Link
                    href="/login"
                    className="flex items-center gap-1.5 bg-primary text-black text-sm font-black px-5 py-2.5 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg"
                    style={{ boxShadow: '0 4px 20px var(--athlon-primary-glow)' }}
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Full-Width Discovery Hero Banner */}
        <section
          className="relative w-full border-b overflow-hidden"
          style={{
            backgroundColor: 'var(--athlon-card)',
            borderColor: 'var(--athlon-border)',
          }}
        >
          {/* Ambient Lighting Background */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <div className="absolute top-0 right-1/4 w-[500px] h-[300px] bg-primary/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-1/4 w-[450px] h-[250px] bg-emerald-500/10 rounded-full blur-[90px]" />
            <div
              className="absolute inset-0 opacity-[0.02]"
              style={{
                backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
                backgroundSize: '40px 40px',
              }}
            />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-10 lg:py-14 space-y-8">
            <div className="flex items-center justify-between gap-8">
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-primary/10 border border-primary/25 text-primary">
                  <Trophy className="w-4 h-4" />
                  <span>Public Sports Competition Hub</span>
                </div>

                <h1 className="text-3xl lg:text-5xl font-black text-foreground tracking-tight leading-tight uppercase">
                  Discover Tournaments &{' '}
                  <span className="bg-gradient-to-r from-primary via-emerald-400 to-amber-300 bg-clip-text text-transparent">
                    Team Championships
                  </span>
                </h1>

                <p className="text-sm lg:text-base text-foreground/75 leading-relaxed">
                  Join franchise team draft auctions, register your squad for multi-tier pool leagues, or enter single and doubles knockout tournament brackets.
                </p>
              </div>

              {/* 4 Metric Highlights */}
              <div className="grid grid-cols-2 gap-3 shrink-0">
                <div
                  className="p-4 rounded-2xl border flex items-center gap-3 w-44"
                  style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-foreground/50">Total Events</span>
                    <div className="text-lg font-black text-foreground font-mono">{totalCount}</div>
                  </div>
                </div>

                <div
                  className="p-4 rounded-2xl border flex items-center gap-3 w-44"
                  style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-foreground/50">Championships</span>
                    <div className="text-lg font-black text-emerald-400 font-mono">{totalChampionships}</div>
                  </div>
                </div>

                <div
                  className="p-4 rounded-2xl border flex items-center gap-3 w-44"
                  style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-foreground/50">Upcoming</span>
                    <div className="text-lg font-black text-foreground font-mono">{upcomingCount}</div>
                  </div>
                </div>

                <div
                  className="p-4 rounded-2xl border flex items-center gap-3 w-44"
                  style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <Tv className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-foreground/50">Live Arena</span>
                    <div className="text-lg font-black text-blue-400 font-mono">{liveCount}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Desktop Filter & Search Dock */}
        <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8 space-y-8">
          {/* Unified 2-Row Filter Deck */}
          <div
            className="p-4 rounded-[28px] border shadow-sm space-y-3.5"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            {/* Row 1: Primary Stage Segmented Switcher */}
            <div
              className="p-1.5 rounded-2xl border flex items-center gap-1.5"
              style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
            >
              {[
                { id: 'all', label: 'All Events', count: totalCount, icon: Layers },
                { id: 'championships', label: 'Team Championships', count: totalChampionships, icon: Shield },
                { id: 'upcoming', label: 'Upcoming Draws', count: upcomingCount, icon: Calendar },
                { id: 'live', label: 'Live in Arena', count: liveCount, icon: Tv, isLive: true },
                { id: 'completed', label: 'Completed', icon: CheckCircle2 },
              ].map((tab) => {
                const isSelected = desktopFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setDesktopFilter(tab.id as any)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-black transition-all ${
                      isSelected
                        ? 'bg-primary text-black shadow-md shadow-primary/20 scale-[1.01]'
                        : 'text-foreground/70 hover:text-foreground hover:bg-white/[0.04]'
                    }`}
                  >
                    <tab.icon className={`w-3.5 h-3.5 ${tab.isLive && liveCount > 0 && !isSelected ? 'text-red-400 animate-pulse' : ''}`} />
                    <span>{tab.label}</span>
                    {tab.count !== undefined && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-black shrink-0 ${
                          isSelected
                            ? 'bg-black/20 text-black'
                            : tab.isLive && liveCount > 0
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-white/10 text-foreground/50'
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Row 2: Sport Category Chips & Search Bar */}
            <div className="flex items-center justify-between gap-4 pt-1">
              {/* Sport Category Pills */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-foreground/40 mr-1 flex items-center gap-1">
                  <Filter className="w-3 h-3" /> Sport:
                </span>
                {sportsList.map((sport) => {
                  const isSelected = selectedSport === sport;
                  return (
                    <button
                      key={sport}
                      onClick={() => setSelectedSport(sport)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                        isSelected
                          ? 'bg-primary/15 text-primary border-primary/30 font-black shadow-sm'
                          : 'bg-surface/50 text-foreground/60 border-foreground/10 hover:text-foreground hover:bg-surface'
                      }`}
                    >
                      {sport === 'all' ? 'All Sports' : sport}
                    </button>
                  );
                })}
              </div>

              {/* Interactive Search Input */}
              <div className="relative w-80 shrink-0">
                <Search className="w-4 h-4 text-foreground/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search events, venues, sports..."
                  className="w-full pl-10 pr-9 py-2 rounded-xl border text-xs font-medium focus:outline-none focus:border-primary transition-all placeholder:text-foreground/30"
                  style={{
                    backgroundColor: 'var(--athlon-surface)',
                    borderColor: 'var(--athlon-border)',
                    color: 'var(--athlon-text)',
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Desktop Content Section */}
          {loading ? (
            <div className="py-28 text-center text-foreground/50 text-xs font-bold uppercase tracking-widest">
              Loading tournaments & championships...
            </div>
          ) : desktopChampionships.length === 0 && desktopTournaments.length === 0 ? (
            <div
              className="py-24 px-8 rounded-[36px] border border-dashed flex flex-col items-center justify-center text-center"
              style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
            >
              <Trophy className="w-12 h-12 text-foreground/30 mb-4" />
              <h3 className="text-xl font-black text-foreground mb-2">No Competitions Found</h3>
              <p className="text-xs text-foreground/60 max-w-md mb-6 leading-relaxed">
                {searchQuery
                  ? `No events matched "${searchQuery}". Try clearing search filters or selecting another sport.`
                  : 'There are currently no public competitions matching your selected category.'}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-5 py-2.5 rounded-2xl bg-primary text-black font-black text-xs shadow-md"
                >
                  Clear Filter
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-12">
              {/* 1. Team Championships Section */}
              {desktopChampionships.length > 0 && (
                <section className="space-y-5">
                  <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--athlon-border)' }}>
                    <div className="flex items-center gap-2.5">
                      <Shield className="w-5 h-5 text-primary" />
                      <h2 className="text-lg font-black text-foreground">
                        Team Championships ({desktopChampionships.length})
                      </h2>
                    </div>
                    <span className="text-xs text-foreground/50">Franchise Leagues & Player Auction Arena</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                    {desktopChampionships.map((champ) => (
                      <div key={champ.championshipId || champ.championshipUuid} className="h-full">
                        <PublicTeamChampionshipCard championship={champ} />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* 2. Tournaments Section */}
              {desktopTournaments.length > 0 && (
                <section className="space-y-5">
                  <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--athlon-border)' }}>
                    <div className="flex items-center gap-2.5">
                      <Trophy className="w-5 h-5 text-primary" />
                      <h2 className="text-lg font-black text-foreground">
                        Tournaments & Draws ({desktopTournaments.length})
                      </h2>
                    </div>
                    <span className="text-xs text-foreground/50">Single & Double Elimination Draws</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                    {desktopTournaments.map((tournament) => (
                      <div key={tournament.tournamentId || tournament.tournamentUuid} className="h-full">
                        <PublicTournamentCard tournament={tournament} hrefPrefix="/tournaments" />
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </main>

        {/* Desktop Branded Footer */}
        <footer
          className="mt-20 border-t pt-12 pb-10 text-xs"
          style={{
            backgroundColor: 'var(--athlon-card)',
            borderColor: 'var(--athlon-border)',
          }}
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary font-black">
                  <Trophy className="w-4 h-4" />
                </div>
                <span className="font-black text-foreground text-sm tracking-wide">ATHLON SPORTS</span>
              </div>

              <div className="flex items-center gap-8 text-foreground/60 font-medium">
                <Link href="/tournaments" className="hover:text-primary transition-colors">Tournaments</Link>
                <Link href="/tournaments" className="hover:text-primary transition-colors">Team Championships</Link>
                <Link href="/academies" className="hover:text-primary transition-colors">Academies</Link>
                <Link href="/live-score" className="hover:text-primary transition-colors">Live Scoring</Link>
                <Link href="/login" className="hover:text-primary transition-colors">Organizer Hub</Link>
              </div>
            </div>

            <div className="border-t pt-6 flex items-center justify-between text-foreground/40 text-[11px]" style={{ borderColor: 'var(--athlon-border)' }}>
              <p>© 2026 Athlon Sports Platform. All rights reserved.</p>
              <p>The tournament experience, elevated.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
