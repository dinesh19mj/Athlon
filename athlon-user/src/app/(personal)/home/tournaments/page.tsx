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
} from 'lucide-react';
import Link from 'next/link';
import { TournamentService, Tournament } from '@/lib/api/tournaments';
import { TeamChampionshipService, TeamChampionship } from '@/lib/api/teamChampionship';
import { PublicTournamentCard } from '@/components/tournaments/PublicTournamentCard';
import { PublicTeamChampionshipCard } from '@/components/tournaments/PublicTeamChampionshipCard';

export default function TournamentsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedSport, setSelectedSport] = useState('ALL');
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

  const sports = ['ALL', 'Badminton', 'Pickleball', 'Tennis', 'Table Tennis', 'Squash'];

  // Filter Tournaments
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

    if (selectedSport !== 'ALL' && t.sport?.toLowerCase() !== selectedSport.toLowerCase()) {
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

  // Filter Championships
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

    if (selectedSport !== 'ALL' && c.sport?.toLowerCase() !== selectedSport.toLowerCase()) {
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
          1. MOBILE VIEW ONLY (< md) - 100% UNTOUCHED ORIGINAL DESIGN
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="block md:hidden pb-24 overflow-y-auto">
        {/* Top Navbar */}
        <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-4 bg-background/90 backdrop-blur-md border-b border-foreground/5">
          <div className="flex items-center gap-3">
            <Link href="/home" className="p-2 -ml-2 text-foreground hover:text-primary transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-lg font-bold uppercase tracking-wider">Tournaments &amp; Championships</h1>
          </div>

          <button className="p-2 -mr-2 text-foreground hover:text-primary transition-colors">
            <Search className="w-5 h-5" />
          </button>
        </header>

        <main className="w-full max-w-lg mx-auto px-4 flex flex-col gap-6 pt-4">
          {/* Custom Segmented Control */}
          <div className="flex items-center bg-surface p-1 rounded-xl border border-foreground/10 relative">
            {[
              { id: 'upcoming', label: 'Upcoming' },
              { id: 'championships', label: 'Championships' },
              { id: 'live', label: 'Live' },
              { id: 'completed', label: 'Completed' },
            ].map((tab) => {
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
                width: `calc(100% / 4 - 8px)`,
                left: `calc((100% / 4) * ${['upcoming', 'championships', 'live', 'completed'].findIndex(
                  (t) => t === activeTab
                )} + 4px)`,
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
                Loading tournaments &amp; championships...
              </div>
            ) : activeTab === 'championships' ? (
              filteredChampionships.length === 0 ? (
                <div className="text-center py-12 text-foreground/50 text-sm font-bold uppercase tracking-widest">
                  No championships found
                </div>
              ) : (
                filteredChampionships.map((c) => (
                  <div key={c.championshipId || c.championshipUuid} className="h-full">
                    <PublicTeamChampionshipCard championship={c} />
                  </div>
                ))
              )
            ) : filteredTournaments.length === 0 && filteredChampionships.length === 0 ? (
              <div className="text-center py-12 text-foreground/50 text-sm font-bold uppercase tracking-widest">
                No tournaments or championships found
              </div>
            ) : (
              <>
                {/* Championships in General View */}
                {filteredChampionships.map((c) => (
                  <div key={c.championshipId || c.championshipUuid} className="h-full">
                    <PublicTeamChampionshipCard championship={c} />
                  </div>
                ))}

                {/* Individual Tournaments */}
                {filteredTournaments.map((tournament) => {
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
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 ${
                        isActive
                          ? 'bg-primary text-black shadow-md shadow-primary/25 scale-105'
                          : 'bg-surface/60 border text-foreground/60 hover:text-foreground hover:bg-surface'
                      }`}
                      style={{ borderColor: isActive ? 'transparent' : 'var(--athlon-border)' }}
                    >
                      <span>{tab.label}</span>
                      {tab.count !== undefined && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                            isActive ? 'bg-black/20 text-black font-black' : 'bg-foreground/10 text-foreground/70'
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
                      className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                        isSelected
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
