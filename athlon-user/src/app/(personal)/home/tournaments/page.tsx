'use client';

import { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Search,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Trophy,
  ChevronRight,
  ChevronLeft,
  ActivityIcon,
  Shield,
  Filter,
  Sparkles,
  Radio,
  Clock,
  CheckCircle2,
  Zap,
  Tv,
  X,
  ArrowRight,
  LayoutGrid,
  List,
  GalleryHorizontal,
} from 'lucide-react';
import Link from 'next/link';
import { TournamentService, Tournament } from '@/lib/api/tournaments';
import { TeamChampionshipService, TeamChampionship } from '@/lib/api/teamChampionship';
import { PublicTournamentCard } from '@/components/tournaments/PublicTournamentCard';
import { PublicTeamChampionshipCard } from '@/components/tournaments/PublicTeamChampionshipCard';

export default function TournamentsPage() {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedSport, setSelectedSport] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'carousel'>('grid');
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [championships, setChampionships] = useState<TeamChampionship[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const champsScrollRef = useRef<HTMLDivElement>(null);
  const tournsScrollRef = useRef<HTMLDivElement>(null);

  const scrollContainer = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

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
          const list = Array.isArray(val) ? val : Array.isArray(val?.data) ? val.data : [];
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

  const tabs = [
    { id: 'all', label: 'All Events', count: tournaments.length + championships.length },
    { id: 'championships', label: 'Team Championships', count: championships.length },
    { id: 'tournaments', label: 'Tournaments', count: tournaments.length },
    { id: 'live', label: 'Live Now' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'completed', label: 'Completed' },
  ];

  const mobileTabs = [
    { id: 'all', label: 'All' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'championships', label: 'Championships' },
    { id: 'live', label: 'Live' },
    { id: 'completed', label: 'Completed' },
  ];

  const sports = ['ALL', 'Badminton', 'Pickleball', 'Tennis', 'Table Tennis', 'Squash'];
  const sportsList = ['all', 'Badminton', 'Cricket', 'Football', 'Volleyball'];

  // Mobile filtered tournaments
  const mobileFilteredTournaments = tournaments.filter((t) => {
    const now = new Date().getTime();
    const start = new Date(t.startDate).getTime();
    const end = new Date(t.endDate).getTime();

    let matchesTab = true;
    if (activeTab === 'live') {
      matchesTab = t.status === 'LIVE' || (!isNaN(start) && !isNaN(end) && now >= start && now <= end);
    } else if (activeTab === 'upcoming') {
      matchesTab = t.status === 'UPCOMING' || isNaN(start) || now < start;
    } else if (activeTab === 'completed') {
      matchesTab = t.status === 'COMPLETED' || (!isNaN(end) && now > end);
    } else if (activeTab === 'championships') {
      return false;
    }

    if (!matchesTab) return false;

    if (selectedSport !== 'all' && selectedSport !== 'ALL' && t.sport?.toLowerCase() !== selectedSport.toLowerCase()) {
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
      matchesTab =
        c.stage === 'LEAGUE_STAGE' ||
        c.stage === 'KNOCKOUT_STAGE' ||
        (!isNaN(start) && !isNaN(end) && now >= start && now <= end);
    } else if (activeTab === 'upcoming') {
      matchesTab =
        c.stage === 'REGISTRATION_OPEN' ||
        c.stage === 'AUCTION_STAGE' ||
        isNaN(start) ||
        now < start;
    } else if (activeTab === 'completed') {
      matchesTab = c.stage === 'COMPLETED' || (!isNaN(end) && now > end);
    } else if (activeTab === 'tournaments') {
      return false;
    }

    if (!matchesTab) return false;

    if (selectedSport !== 'all' && selectedSport !== 'ALL' && c.sport?.toLowerCase() !== selectedSport.toLowerCase()) {
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

  const mobileTotalVisible = mobileFilteredTournaments.length + mobileFilteredChampionships.length;

  const liveCount =
    tournaments.filter((t) => t.status === 'LIVE').length +
    championships.filter((c) => c.stage === 'LEAGUE_STAGE' || c.stage === 'KNOCKOUT_STAGE').length;

  const upcomingCount =
    tournaments.filter((t) => t.status === 'UPCOMING').length +
    championships.filter((c) => c.stage === 'REGISTRATION_OPEN' || c.stage === 'AUCTION_STAGE').length;

  const totalChampionships = championships.length;
  const totalTournaments = tournaments.length;
  const totalCount = totalTournaments + totalChampionships;

  // Desktop Filter Tournaments
  const filteredTournaments = tournaments.filter((t) => {
    const now = new Date().getTime();
    const start = new Date(t.startDate).getTime();
    const end = new Date(t.endDate).getTime();

    let matchesTab = true;
    if (activeTab === 'championships') {
      return false;
    } else if (activeTab === 'tournaments') {
      matchesTab = true;
    } else if (activeTab === 'live') {
      matchesTab = t.status === 'LIVE' || (!isNaN(start) && !isNaN(end) && now >= start && now <= end);
    } else if (activeTab === 'completed') {
      matchesTab = t.status === 'COMPLETED' || (!isNaN(end) && now > end);
    } else if (activeTab === 'upcoming') {
      matchesTab = t.status === 'UPCOMING' || isNaN(start) || now < start;
    }

    if (!matchesTab) return false;

    if (selectedSport !== 'ALL' && selectedSport !== 'all' && t.sport?.toLowerCase() !== selectedSport.toLowerCase()) {
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

  // Desktop Filter Championships
  const filteredChampionships = championships.filter((c) => {
    const now = new Date().getTime();
    const start = c.startDate ? new Date(c.startDate).getTime() : NaN;
    const end = c.endDate ? new Date(c.endDate).getTime() : NaN;

    let matchesTab = true;
    if (activeTab === 'tournaments') {
      return false;
    } else if (activeTab === 'championships' || activeTab === 'all') {
      matchesTab = true;
    } else if (activeTab === 'live') {
      matchesTab =
        c.stage === 'LEAGUE_STAGE' ||
        c.stage === 'KNOCKOUT_STAGE' ||
        (!isNaN(start) && !isNaN(end) && now >= start && now <= end);
    } else if (activeTab === 'completed') {
      matchesTab = c.stage === 'COMPLETED' || (!isNaN(end) && now > end);
    } else if (activeTab === 'upcoming') {
      matchesTab =
        c.stage === 'REGISTRATION_OPEN' ||
        c.stage === 'AUCTION_STAGE' ||
        isNaN(start) ||
        now < start;
    }

    if (!matchesTab) return false;

    if (selectedSport !== 'ALL' && selectedSport !== 'all' && c.sport?.toLowerCase() !== selectedSport.toLowerCase()) {
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
              href="/home"
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
              <h1 className="text-xs font-black uppercase tracking-wider text-foreground truncate">
                Tournaments
              </h1>
              <p className="text-[10px] text-foreground/50 font-bold truncate">
                {mobileTotalVisible} active events
              </p>
            </div>
          </div>
        </header>

        <main className="w-full max-w-lg mx-auto px-3.5 flex flex-col gap-3.5 pt-3">
          {/* Search Bar */}
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-foreground/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
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
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold shrink-0 transition-all cursor-pointer border ${isSelected
                    ? 'bg-primary text-black border-primary shadow-sm shadow-primary/20 scale-[1.02]'
                    : 'border-transparent text-foreground/70 hover:text-foreground hover:bg-white/5'
                    }`}
                  style={{
                    backgroundColor: isSelected ? undefined : 'var(--athlon-surface)',
                    borderColor: isSelected ? undefined : 'var(--athlon-border)',
                  }}
                >
                  <span className="text-xs">{sportIcon}</span>
                  <span className="capitalize">{sport === 'all' ? 'All' : sport}</span>
                </button>
              );
            })}
          </div>

          {/* Segmented Status Tabs */}
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
                  className={`flex-1 py-1.5 px-2 text-[10.5px] font-black uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1 shrink-0 ${isActive
                    ? 'bg-primary text-black shadow-sm font-black'
                    : 'text-foreground/60 hover:text-foreground'
                    }`}
                >
                  <span>{tab.label}</span>
                  {tabCount > 0 && (
                    <span
                      className={`text-[9px] font-mono font-bold px-1 rounded-full ${isActive ? 'bg-black/20 text-black' : 'bg-foreground/10 text-foreground/60'
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
                className={`p-1.5 rounded-lg transition-all flex items-center gap-1 ${viewMode === 'grid'
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
                className={`p-1.5 rounded-lg transition-all flex items-center gap-1 ${viewMode === 'list'
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
                className={`p-1.5 rounded-lg transition-all flex items-center gap-1 ${viewMode === 'carousel'
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
                        <span>Tournaments &amp; Knockouts ({mobileFilteredTournaments.length})</span>
                      </div>
                    )}
                    {mobileFilteredTournaments.map((tournament) => (
                      <PublicTournamentCard
                        key={tournament.tournamentId || tournament.tournamentUuid}
                        tournament={tournament}
                        hrefPrefix="/home/tournaments"
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
                        href={`/home/tournaments/${tournament.tournamentUuid || tournament.tournamentId}`}
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
                        <span>Tournaments &amp; Knockouts ({mobileFilteredTournaments.length})</span>
                      </div>
                      <span className="text-[9.5px] font-bold text-foreground/40 uppercase tracking-widest flex items-center gap-0.5">

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
                            hrefPrefix="/home/tournaments"
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
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          2. DESKTOP VIEW ONLY (hidden on mobile, visible on md and above)
             - HORIZONTAL SCROLLING CARD TRACKS FOR CHAMPIONSHIPS & TOURNAMENTS
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="hidden md:block min-h-screen pb-20 bg-background">
        {/* Desktop Header Banner */}
        <div
          className="border-b px-8 py-8 bg-gradient-to-b from-card/70 via-card/30 to-background"
          style={{ borderColor: 'var(--athlon-border)' }}
        >
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between gap-6 flex-wrap">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shadow-lg shadow-primary/10">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-black tracking-tight text-foreground">
                      Tournaments &amp; Championships
                    </h1>
                    <p className="text-xs text-foreground/50">
                      Discover open competitions, franchise team championships, and live matches
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Search */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative min-w-[320px]">
                  <Search className="w-4 h-4 text-foreground/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search tournaments, location, sport..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border bg-surface text-xs font-medium outline-none focus:border-primary transition-all"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  />
                </div>
              </div>
            </div>

            {/* Sport Filter Chips & Telemetry Bar */}
            <div className="flex items-center justify-between pt-2 border-t flex-wrap gap-4" style={{ borderColor: 'var(--athlon-border)' }}>
              {/* Category Segmented Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar py-1">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 ${isActive
                        ? 'bg-primary text-black shadow-md shadow-primary/25 scale-105'
                        : 'bg-surface/60 border text-foreground/60 hover:text-foreground hover:bg-surface'
                        }`}
                      style={{ borderColor: isActive ? 'transparent' : 'var(--athlon-border)' }}
                    >
                      <span>{tab.label}</span>
                      {tab.count !== undefined && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${isActive ? 'bg-black/20 text-black font-black' : 'bg-foreground/10 text-foreground/70'
                            }`}
                        >
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Sport Pills */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-foreground/40 font-bold mr-1">Sport:</span>
                {sports.map((sport) => {
                  const isSelected = selectedSport === sport;
                  return (
                    <button
                      key={sport}
                      onClick={() => setSelectedSport(sport)}
                      className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${isSelected
                        ? 'bg-primary/20 text-primary border border-primary/40'
                        : 'text-foreground/60 hover:text-foreground hover:bg-white/5'
                        }`}
                    >
                      {sport}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Event Cards Tracks (Horizontal Scrolling) */}
        <main className="max-w-7xl mx-auto px-8 py-8 space-y-12">
          {loading ? (
            <div className="text-center py-20 space-y-3">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <div className="text-sm font-black uppercase tracking-widest text-foreground/50">
                Loading events catalog...
              </div>
            </div>
          ) : filteredTournaments.length === 0 && filteredChampionships.length === 0 ? (
            <div
              className="text-center py-24 rounded-[32px] border p-8 space-y-4 max-w-xl mx-auto bg-card"
              style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
            >
              <div className="w-16 h-16 rounded-2xl bg-foreground/5 border flex items-center justify-center mx-auto text-foreground/40" style={{ borderColor: 'var(--athlon-border)' }}>
                <Trophy className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-foreground">No Events Match Your Filters</h3>
              <p className="text-xs text-foreground/50">
                Try selecting a different sport, resetting your search criteria, or exploring all tournaments.
              </p>
              <button
                onClick={() => {
                  setActiveTab('all');
                  setSelectedSport('ALL');
                  setSearchQuery('');
                }}
                className="px-5 py-2.5 rounded-xl bg-primary text-black font-black text-xs uppercase tracking-wider"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="space-y-12">
              {/* 1. Team Championships Section (Horizontal Scroll) */}
              {filteredChampionships.length > 0 && (
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Shield className="w-5 h-5 text-primary" />
                      <div>
                        <h2 className="text-lg font-black text-foreground">
                          Team Championships ({filteredChampionships.length})
                        </h2>
                        <p className="text-xs text-foreground/50">
                          Multi-category franchise leagues, live auctions, and player draft events
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => scrollContainer(champsScrollRef, 'left')}
                        className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                        style={{ borderColor: 'var(--athlon-border)' }}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => scrollContainer(champsScrollRef, 'right')}
                        className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                        style={{ borderColor: 'var(--athlon-border)' }}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div
                    ref={champsScrollRef}
                    className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 snap-x scroll-px-8 hide-scrollbar -mx-8 px-8"
                  >
                    {filteredChampionships.map((c) => (
                      <div key={c.championshipId || c.championshipUuid} className="snap-start shrink-0 w-[360px]">
                        <PublicTeamChampionshipCard championship={c} />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* 2. Individual Tournaments Section (Horizontal Scroll) */}
              {filteredTournaments.length > 0 && (
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Trophy className="w-5 h-5 text-amber-400" />
                      <div>
                        <h2 className="text-lg font-black text-foreground">
                          Open Tournaments ({filteredTournaments.length})
                        </h2>
                        <p className="text-xs text-foreground/50">
                          Knockout &amp; league championships open for registration
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => scrollContainer(tournsScrollRef, 'left')}
                        className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                        style={{ borderColor: 'var(--athlon-border)' }}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => scrollContainer(tournsScrollRef, 'right')}
                        className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                        style={{ borderColor: 'var(--athlon-border)' }}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div
                    ref={tournsScrollRef}
                    className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 snap-x scroll-px-8 hide-scrollbar -mx-8 px-8"
                  >
                    {filteredTournaments.map((t) => (
                      <div key={t.tournamentId || t.tournamentUuid} className="snap-start shrink-0 w-[360px]">
                        <PublicTournamentCard tournament={t} />
                      </div>
                    ))}
                  </div>
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
