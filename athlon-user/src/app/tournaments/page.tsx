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
} from 'lucide-react';
import Link from 'next/link';
import { TournamentService, Tournament } from '@/lib/api/tournaments';
import { TeamChampionshipService, TeamChampionship } from '@/lib/api/teamChampionship';
import { PublicTournamentCard } from '@/components/tournaments/PublicTournamentCard';
import { PublicTeamChampionshipCard } from '@/components/tournaments/PublicTeamChampionshipCard';
import { useAuthStore } from '@/lib/store/useAuthStore';

export default function TournamentsPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [desktopFilter, setDesktopFilter] = useState<'all' | 'championships' | 'upcoming' | 'live' | 'completed'>('all');
  const [selectedSport, setSelectedSport] = useState<string>('all');
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [championships, setChampionships] = useState<TeamChampionship[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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
    }

    if (!matchesTab) return false;
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
    } else if (activeTab === 'championships') {
      matchesTab = true;
    }

    if (!matchesTab) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.location?.toLowerCase().includes(q) ||
      c.sport?.toLowerCase().includes(q)
    );
  });

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
          1. MOBILE VIEW ONLY (< md) - EXACT PRESERVED MOBILE EXPERIENCE
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="block md:hidden pb-24 overflow-y-auto">
        {/* Top Navbar */}
        <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-4 bg-background/90 backdrop-blur-md border-b border-foreground/5">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 -ml-2 text-foreground hover:text-primary transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-lg font-bold uppercase tracking-wider">Tournaments & Championships</h1>
          </div>

          <button className="p-2 -mr-2 text-foreground hover:text-primary transition-colors">
            <Search className="w-5 h-5" />
          </button>
        </header>

        <main className="w-full max-w-lg mx-auto px-4 flex flex-col gap-6 pt-4">
          {/* Custom Segmented Control */}
          <div className="flex items-center bg-surface p-1 rounded-xl border border-foreground/10 relative">
            {mobileTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider rounded-lg transition-all z-10 ${
                    isActive ? 'text-primary-foreground' : 'text-foreground/50 hover:text-foreground'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}

            {/* Animated Highlight Background */}
            <div
              className="absolute top-1 bottom-1 rounded-lg bg-primary transition-all duration-300 ease-in-out shadow-[0_0_15px_var(--athlon-primary-glow)]"
              style={{
                width: `calc(100% / ${mobileTabs.length} - 8px)`,
                left: `calc((100% / ${mobileTabs.length}) * ${mobileTabs.findIndex((t) => t.id === activeTab)} + 4px)`,
              }}
            />
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-foreground/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, sport, location..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border bg-surface text-xs font-medium outline-none focus:border-primary border-foreground/10"
            />
          </div>

          {/* Cards List */}
          <div className="flex flex-col gap-5">
            {loading ? (
              <div className="text-center py-12 text-foreground/50 text-sm font-bold uppercase tracking-widest">
                Loading tournaments & championships...
              </div>
            ) : activeTab === 'championships' ? (
              mobileFilteredChampionships.length === 0 ? (
                <div className="text-center py-12 text-foreground/50 text-sm font-bold uppercase tracking-widest">
                  No championships found
                </div>
              ) : (
                mobileFilteredChampionships.map((c) => (
                  <div key={c.championshipId || c.championshipUuid} className="h-full">
                    <PublicTeamChampionshipCard championship={c} />
                  </div>
                ))
              )
            ) : mobileFilteredTournaments.length === 0 && mobileFilteredChampionships.length === 0 ? (
              <div className="text-center py-12 text-foreground/50 text-sm font-bold uppercase tracking-widest">
                No tournaments or championships found
              </div>
            ) : (
              <>
                {/* Championships in General View */}
                {mobileFilteredChampionships.map((c) => (
                  <div key={c.championshipId || c.championshipUuid} className="h-full">
                    <PublicTeamChampionshipCard championship={c} />
                  </div>
                ))}

                {/* Individual Tournaments */}
                {mobileFilteredTournaments.map((tournament) => {
                  const startDate = new Date(tournament.startDate).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  });
                  const endDate = new Date(tournament.endDate).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  });

                  return (
                    <Link
                      href={`/tournaments/${tournament.tournamentUuid}`}
                      key={tournament.tournamentId}
                      className="bg-surface border border-foreground/10 hover:border-foreground/30 rounded-[24px] overflow-hidden transition-colors shadow-lg cursor-pointer group block"
                    >
                      <div className="h-1.5 w-full bg-primary" />

                      <div className="p-5">
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <h2 className="text-sm sm:text-base font-black leading-tight text-foreground group-hover:text-primary transition-colors">
                            {tournament.name}
                          </h2>
                          <div className="w-10 h-10 shrink-0 rounded-xl bg-background border border-foreground/10 flex items-center justify-center">
                            <Trophy className="w-5 h-5 text-foreground/50 group-hover:text-primary transition-colors" />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-y-3 gap-x-2 mb-5">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-[#FF7722]" />
                            <span className="text-[10px] sm:text-xs text-foreground/70">
                              {startDate} - {endDate}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-orange-400" />
                            <span className="text-[10px] sm:text-xs text-foreground/70 truncate">
                              {tournament.location || 'TBD'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ActivityIcon className="w-3.5 h-3.5 text-primary" />
                            <span className="text-[10px] sm:text-xs text-foreground/70">{tournament.sport}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-3.5 h-3.5 text-purple-400" />
                            <span className="text-[10px] sm:text-xs text-foreground/70">
                              Fee:{' '}
                              <span className="font-bold text-foreground">
                                {tournament.registrationFees ? `₹${tournament.registrationFees}` : 'Free'}
                              </span>
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-foreground/5 pt-4">
                          <div className="flex flex-wrap items-center gap-1.5 max-w-[65%]">
                            {tournament.category &&
                              tournament.category.split(',').map((cat, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 rounded border border-foreground/10 bg-background text-[9px] font-medium text-foreground/50 whitespace-nowrap"
                                >
                                  {cat.trim()}
                                </span>
                              ))}
                            {tournament.matchFormat &&
                              tournament.matchFormat.split(',').map((format, idx) => (
                                <span
                                  key={`f-${idx}`}
                                  className="px-2 py-0.5 rounded border border-foreground/10 bg-background text-[9px] font-medium text-foreground/50 whitespace-nowrap"
                                >
                                  {format.trim()}
                                </span>
                              ))}
                          </div>

                          <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-primary group-hover:text-foreground transition-colors bg-primary/10 px-3 py-1.5 rounded-lg">
                            DETAILS <ChevronRight className="w-3 h-3" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </>
            )}
          </div>
        </main>
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
