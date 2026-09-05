'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Plus,
  Calendar,
  MapPin,
  Trophy,
  Search,
  ArrowRight,
  Loader2,
  Phone,
  Tag,
  Ticket,
  Sparkles,
  Layers,
  Activity,
  Globe,
  Lock,
  ArrowUpRight,
  ChevronRight,
  ChevronLeft,
  Flame,
  Swords,
  Shield,
  X,
  Gavel,
  Users,
  SlidersHorizontal,
  Zap,
  CheckCircle2,
  Sliders,
  Filter,
} from 'lucide-react';
import { TournamentService, Tournament } from '@/lib/api/tournaments';
import { TeamChampionshipService, TeamChampionship } from '@/lib/api/teamChampionship';

export default function TournamentsPage() {
  const params = useParams();
  const orgId = params.orgId as string;
  const router = useRouter();

  const championshipsTrackRef = useRef<HTMLDivElement>(null);
  const tournamentsTrackRef = useRef<HTMLDivElement>(null);

  const scrollTrack = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const formatEventDates = (start?: string, end?: string) => {
    if (!start) return 'Dates TBA';
    try {
      const s = new Date(start);
      const e = end ? new Date(end) : null;
      if (isNaN(s.getTime())) return 'Dates TBA';

      if (!e || isNaN(e.getTime()) || s.toDateString() === e.toDateString()) {
        return s.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
      }

      const sStr = s.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      const eStr = e.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
      return `${sStr} – ${eStr}`;
    } catch {
      return 'Dates TBA';
    }
  };

  const [eventType, setEventType] = useState<'all' | 'tournaments' | 'championships'>('all');
  const [activeTab, setActiveTab] = useState<'all' | 'public' | 'private'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [championships, setChampionships] = useState<TeamChampionship[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setIsLoading(true);
        const [tRes, cRes] = await Promise.allSettled([
          TournamentService.getByOrg(orgId),
          TeamChampionshipService.getByOrganizer(orgId),
        ]);

        if (tRes.status === 'fulfilled' && tRes.value?.data) {
          setTournaments(tRes.value.data as Tournament[]);
        }
        if (cRes.status === 'fulfilled' && cRes.value) {
          const list = Array.isArray(cRes.value) ? cRes.value : ((cRes.value as any)?.data || []);
          setChampionships(list);
        }
      } catch (error) {
        console.error('Failed to fetch events:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, [orgId]);

  // Compute metrics
  const totalTournaments = tournaments.length;
  const totalChampionships = championships.length;
  const totalCount = totalTournaments + totalChampionships;

  const publicCount =
    tournaments.filter((t) => (t.visibility || 'PRIVATE').toUpperCase() === 'PUBLIC').length +
    championships.filter((c) => (c.visibility || 'PUBLIC').toUpperCase() === 'PUBLIC').length;

  const privateCount =
    tournaments.filter((t) => (t.visibility || 'PRIVATE').toUpperCase() === 'PRIVATE').length +
    championships.filter((c) => (c.visibility || 'PUBLIC').toUpperCase() === 'PRIVATE').length;

  // Filter tournaments
  const filteredTournaments = useMemo(() => {
    if (eventType === 'championships') return [];
    return tournaments.filter((t) => {
      const matchesTab =
        activeTab === 'all'
          ? true
          : (t.visibility || 'PRIVATE').toLowerCase() === activeTab;

      if (!matchesTab) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        t.name?.toLowerCase().includes(q) ||
        t.sport?.toLowerCase().includes(q) ||
        t.location?.toLowerCase().includes(q) ||
        t.category?.toLowerCase().includes(q)
      );
    });
  }, [tournaments, activeTab, searchQuery, eventType]);

  // Filter championships
  const filteredChampionships = useMemo(() => {
    if (eventType === 'tournaments') return [];
    return championships.filter((c) => {
      const matchesTab =
        activeTab === 'all'
          ? true
          : (c.visibility || 'PUBLIC').toLowerCase() === activeTab;

      if (!matchesTab) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        c.name?.toLowerCase().includes(q) ||
        c.sport?.toLowerCase().includes(q) ||
        c.location?.toLowerCase().includes(q)
      );
    });
  }, [championships, activeTab, searchQuery, eventType]);

  const getPosterUrl = (posterPath: string) => {
    if (!posterPath) return '';
    const cleanPath = posterPath.startsWith('/') && posterPath.includes(':') ? posterPath.substring(1) : posterPath;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050';
    return `${baseUrl}/api/tournament/tournaments/getFile?filePath=${encodeURIComponent(cleanPath)}`;
  };

  const getChampPosterUrl = (posterPath?: string) => {
    if (!posterPath) return '';
    if (posterPath.startsWith('http') || posterPath.startsWith('data:')) return posterPath;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050';
    return `${baseUrl}/api/tournament/team-championship/getFile?filePath=${encodeURIComponent(posterPath)}`;
  };

  const getStageBadge = (stage = 'REGISTRATION_OPEN') => {
    switch (stage) {
      case 'REGISTRATION_OPEN':
        return { label: 'Registration Open', class: 'bg-primary/15 text-primary border-primary/30' };
      case 'AUCTION_STAGE':
        return { label: 'Auction Live', class: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30' };
      case 'LEAGUE_STAGE':
        return { label: 'League Stage', class: 'bg-primary/15 text-primary border-primary/30' };
      case 'KNOCKOUT_STAGE':
        return { label: 'Knockouts', class: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30' };
      case 'COMPLETED':
        return { label: 'Completed', class: 'bg-foreground/10 text-foreground/70 border-foreground/20' };
      default:
        return { label: stage.replace('_', ' '), class: 'bg-primary/15 text-primary border-primary/30' };
    }
  };

  const hasEvents = filteredTournaments.length > 0 || filteredChampionships.length > 0;

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 md:pb-16 selection:bg-primary selection:text-black">
      {/* ══════════════════════════════════════════════════════════════════════
          1. MOBILE VIEW ONLY (< md) - REDESIGNED SLEEK MOBILE EXPERIENCE
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="block md:hidden">
        {/* Modern Sticky Mobile Header */}
        <header className="sticky top-0 z-30 bg-surface/90 backdrop-blur-xl border-b border-foreground/10 px-4 py-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={() => router.push(`/org/${orgId}/dashboard`)}
              className="p-1.5 -ml-1.5 rounded-xl text-foreground/70 hover:text-foreground hover:bg-foreground/5 transition-colors active:scale-95 shrink-0"
              title="Back to Dashboard"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Organizer Hub</span>
              </div>
              <h1 className="text-base font-black text-foreground tracking-tight truncate">
                Tournaments & Championships
              </h1>
            </div>
          </div>
        </header>

        {/* Hero Banner & Summary Metrics Bar */}
        <div className="p-4 space-y-3.5">
          {/* Action Cards / Hero Quick Launch */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => router.push(`/org/${orgId}/tournaments/create`)}
              className="p-3.5 rounded-2xl border text-left flex flex-col justify-between gap-2.5 transition-all active:scale-98 group hover:border-primary/50 shadow-sm relative overflow-hidden"
              style={{
                backgroundColor: 'var(--athlon-card)',
                borderColor: 'var(--athlon-border)',
              }}
            >
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Trophy className="w-4 h-4" />
                </div>
                <span className="text-xs font-mono font-black text-foreground">{totalTournaments}</span>
              </div>
              <div>
                <div className="text-xs font-black text-foreground group-hover:text-primary transition-colors">+ Tournament</div>
                <div className="text-[9.5px] text-foreground/50 font-medium">Knockout & Groups</div>
              </div>
            </button>

            <button
              onClick={() => router.push(`/org/${orgId}/team-championship/create`)}
              className="p-3.5 rounded-2xl border text-left flex flex-col justify-between gap-2.5 transition-all active:scale-98 group hover:border-primary/50 shadow-sm relative overflow-hidden"
              style={{
                backgroundColor: 'var(--athlon-card)',
                borderColor: 'var(--athlon-border)',
              }}
            >
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                  <Shield className="w-4 h-4" />
                </div>
                <span className="text-xs font-mono font-black text-amber-500">{totalChampionships}</span>
              </div>
              <div>
                <div className="text-xs font-black text-foreground group-hover:text-amber-500 transition-colors">+ Championship</div>
                <div className="text-[9.5px] text-foreground/50 font-medium">Franchise & Auctions</div>
              </div>
            </button>
          </div>

          {/* Quick Metrics Strip */}
          <div
            className="p-2 rounded-xl border flex items-center justify-around text-center"
            style={{
              backgroundColor: 'var(--athlon-surface)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <div>
              <div className="text-[9.5px] font-extrabold uppercase text-foreground/45">Total</div>
              <div className="text-xs font-black font-mono text-foreground">{totalCount}</div>
            </div>
            <div className="w-[1px] h-5 bg-foreground/10" />
            <div>
              <div className="text-[9.5px] font-extrabold uppercase text-foreground/45">Public</div>
              <div className="text-xs font-black font-mono text-primary">{publicCount}</div>
            </div>
            <div className="w-[1px] h-5 bg-foreground/10" />
            <div>
              <div className="text-[9.5px] font-extrabold uppercase text-foreground/45">Private</div>
              <div className="text-xs font-black font-mono text-foreground/70">{privateCount}</div>
            </div>
          </div>
        </div>

        {/* Mobile Filters Bar */}
        <div className="p-3.5 space-y-4">
          <div
            className="p-2 rounded-[20px] border space-y-2"
            style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
          >
            {/* Row 1: Primary Segmented Type Selector */}
            <div
              className="p-1 rounded-xl border flex items-center gap-1"
              style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
            >
              {[
                { id: 'all', label: 'All', count: totalCount },
                { id: 'championships', label: 'Championships', count: totalChampionships },
                { id: 'tournaments', label: 'Tournaments', count: totalTournaments },
              ].map((tab) => {
                const isSelected = eventType === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setEventType(tab.id as any)}
                    className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-1.5 rounded-lg text-[11px] font-black transition-all ${
                      isSelected
                        ? 'bg-primary text-black shadow-sm'
                        : 'text-foreground/60 hover:text-foreground'
                    }`}
                  >
                    <span className="truncate">{tab.label}</span>
                    <span
                      className={`text-[9.5px] px-1.5 py-0.2 rounded-full font-mono shrink-0 ${
                        isSelected ? 'bg-black/20 text-black font-black' : 'bg-white/10 text-foreground/40'
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Row 2: Visibility Filter & Search Bar */}
            <div className="flex items-center justify-between gap-2">
              <div
                className="p-0.5 rounded-xl border flex items-center gap-1 shrink-0"
                style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
              >
                {[
                  { id: 'all', label: 'All' },
                  { id: 'public', label: 'Public' },
                  { id: 'private', label: 'Private' },
                ].map((tab) => {
                  const isSelected = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all text-center ${
                        isSelected
                          ? 'bg-foreground/15 text-foreground font-black'
                          : 'text-foreground/50'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-foreground/40 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search events..."
                  className="w-full pl-7 pr-6 py-1 rounded-xl border text-[11px] font-medium focus:outline-none focus:border-primary transition-all placeholder:text-foreground/30"
                  style={{
                    backgroundColor: 'var(--athlon-surface)',
                    borderColor: 'var(--athlon-border)',
                    color: 'var(--athlon-text)',
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Cards List */}
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-7 h-7 text-primary animate-spin" />
              <span className="text-xs font-bold uppercase tracking-widest text-foreground/50">Loading events...</span>
            </div>
          ) : hasEvents ? (
            <div className="space-y-6">
              {/* Championships */}
              {filteredChampionships.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 border-b pb-2" style={{ borderColor: 'var(--athlon-border)' }}>
                    <Shield className="w-4 h-4 text-primary" />
                    <h2 className="text-xs font-black uppercase tracking-wider text-foreground">
                      Team Championships ({filteredChampionships.length})
                    </h2>
                  </div>

                  <div className="space-y-3">
                    {filteredChampionships.map((champ) => {
                      const posterUrl = getChampPosterUrl(champ.posterUrl);
                      const stageBadge = getStageBadge(champ.stage);
                      const startDate = champ.startDate
                        ? new Date(champ.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                        : 'TBA';

                      return (
                        <Link
                          key={champ.championshipUuid}
                          href={`/org/${orgId}/team-championship/${champ.championshipUuid}`}
                          className="group rounded-2xl border overflow-hidden flex flex-col justify-between transition-all active:scale-[0.99] relative block"
                          style={{
                            backgroundColor: 'var(--athlon-card)',
                            borderColor: 'var(--athlon-border)',
                          }}
                        >
                          <div className="h-[2.5px] w-full bg-primary shadow-[0_0_8px_var(--athlon-primary)]" />
                          <div className="p-3.5 space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${stageBadge.class}`}>
                                {stageBadge.label}
                              </span>
                              <span className="text-[10px] font-extrabold text-primary flex items-center gap-1">
                                <Shield className="w-3 h-3" /> {champ.sport}
                              </span>
                            </div>

                            <h3 className="text-sm font-black text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">
                              {champ.name}
                            </h3>

                            <div className="flex items-center justify-between text-[11px] text-foreground/70">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-primary" />
                                <span>{formatEventDates(champ.startDate, champ.endDate)}</span>
                              </div>
                              <div className="flex items-center gap-1 font-bold text-foreground">
                                <Users className="w-3 h-3 text-primary" />
                                <span>Max {champ.maxTeams || 6} Teams</span>
                              </div>
                            </div>
                          </div>

                          <div
                            className="p-2.5 px-3.5 border-t flex items-center justify-between text-[11px]"
                            style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                          >
                            <span className="font-extrabold text-foreground">
                              {champ.teamRegistrationFee ? `₹${champ.teamRegistrationFee}/Team` : 'Free Entry'}
                            </span>
                            <span className="text-primary font-black flex items-center gap-0.5">
                              Manage Hub <ChevronRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tournaments */}
              {filteredTournaments.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 border-b pb-2" style={{ borderColor: 'var(--athlon-border)' }}>
                    <Trophy className="w-4 h-4 text-primary" />
                    <h2 className="text-xs font-black uppercase tracking-wider text-foreground">
                      Tournaments ({filteredTournaments.length})
                    </h2>
                  </div>

                  <div className="space-y-3">
                    {filteredTournaments.map((tournament) => {
                      const isPublic = (tournament.visibility || 'PRIVATE').toUpperCase() === 'PUBLIC';
                      const startDate = new Date(tournament.startDate).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      });

                      return (
                        <Link
                          key={tournament.tournamentUuid}
                          href={`/org/${orgId}/tournaments/${tournament.tournamentUuid}`}
                          className="group rounded-2xl border overflow-hidden flex flex-col justify-between transition-all active:scale-[0.99] relative block"
                          style={{
                            backgroundColor: 'var(--athlon-card)',
                            borderColor: 'var(--athlon-border)',
                          }}
                        >
                          <div className="h-[2.5px] w-full bg-primary shadow-[0_0_8px_var(--athlon-primary)]" />
                          <div className="p-3.5 space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                                  isPublic
                                    ? 'bg-primary/15 text-primary border-primary/30'
                                    : 'bg-foreground/10 text-foreground/70 border-foreground/20'
                                }`}
                              >
                                {tournament.visibility || 'PRIVATE'}
                              </span>
                              <span className="text-[10px] font-extrabold text-primary flex items-center gap-1">
                                <Trophy className="w-3 h-3" /> {tournament.sport || 'Sports'}
                              </span>
                            </div>

                            <h3 className="text-sm font-black text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">
                              {tournament.name}
                            </h3>

                            <div className="flex items-center justify-between text-[11px] text-foreground/70">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-primary" />
                                <span>{formatEventDates(tournament.startDate, tournament.endDate)}</span>
                              </div>
                              {tournament.location && (
                                <div className="flex items-center gap-1 truncate max-w-[150px]">
                                  <MapPin className="w-3 h-3 text-primary shrink-0" />
                                  <span className="truncate">{tournament.location}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div
                            className="p-2.5 px-3.5 border-t flex items-center justify-between text-[11px]"
                            style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                          >
                            <span className="font-extrabold text-foreground">
                              {tournament.registrationFees ? `₹${tournament.registrationFees}` : 'Free Entry'}
                            </span>
                            <span className="text-primary font-black flex items-center gap-0.5">
                              Manage Tournament <ChevronRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div
              className="py-14 px-4 rounded-2xl border border-dashed flex flex-col items-center justify-center text-center"
              style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
            >
              <Trophy className="w-8 h-8 text-primary mb-3" />
              <h3 className="text-base font-black text-foreground mb-1">No Matching Events</h3>
              <p className="text-xs text-foreground/60 mb-5">Create a championship or tournament to get started.</p>
              <div className="flex flex-col gap-2 w-full max-w-xs">
                <button
                  onClick={() => router.push(`/org/${orgId}/team-championship/create`)}
                  className="w-full py-2.5 rounded-xl bg-primary text-black font-black text-xs"
                >
                  + Create Team Championship
                </button>
                <button
                  onClick={() => router.push(`/org/${orgId}/tournaments/create`)}
                  className="w-full py-2.5 rounded-xl border text-foreground font-bold text-xs"
                  style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                >
                  + Create Tournament
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Floating Action Dock */}
        <div
          className="fixed bottom-0 left-0 right-0 z-40 backdrop-blur-xl border-t p-3"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--athlon-card) 90%, transparent)',
            borderColor: 'var(--athlon-border)',
          }}
        >
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push(`/org/${orgId}/team-championship/create`)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-3 px-3 rounded-2xl border font-black text-xs text-primary shadow-sm active:scale-95 transition-all"
              style={{
                backgroundColor: 'var(--athlon-surface)',
                borderColor: 'var(--athlon-primary)',
              }}
            >
              <Shield className="w-4 h-4 text-primary" />
              <span>+ Championship</span>
            </button>

            <button
              onClick={() => router.push(`/org/${orgId}/tournaments/create`)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-3 px-3 rounded-2xl bg-primary text-black font-black text-xs shadow-xl shadow-primary/25 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ Tournament</span>
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          2. DESKTOP VIEW ONLY (hidden on mobile, visible on md and above)
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="hidden md:block">
        {/* Desktop Hero Command Center */}
        <div
          className="relative w-full border-b overflow-hidden"
          style={{
            backgroundColor: 'var(--athlon-card)',
            borderColor: 'var(--athlon-border)',
          }}
        >
          {/* Ambient Lighting Accents */}
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

          <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-10 lg:py-12 space-y-8">
            {/* Top Bar: Title & Action CTAs */}
            <div className="flex items-center justify-between gap-8">
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-primary/10 border border-primary/25 text-primary">
                  <Trophy className="w-4 h-4" />
                  <span>Competition Command Center</span>
                </div>

                <h1 className="text-3xl lg:text-4xl font-black text-foreground tracking-tight leading-tight">
                  Tournaments & Championships
                </h1>

                <p className="text-sm text-foreground/75 leading-relaxed">
                  Manage sports tournaments, franchise team championships, live auction bidding arenas, knockout brackets, pool leagues, and referee scoresheets in one unified console.
                </p>
              </div>

              {/* Top Quick Actions */}
              <div className="flex items-center gap-3.5 shrink-0">
                <button
                  onClick={() => router.push(`/org/${orgId}/team-championship/create`)}
                  className="flex items-center gap-2.5 px-5 py-3 rounded-2xl text-sm font-black border transition-all hover:scale-105 active:scale-95 shadow-md"
                  style={{
                    backgroundColor: 'var(--athlon-surface)',
                    borderColor: 'var(--athlon-primary)',
                    color: 'var(--athlon-primary)',
                  }}
                >
                  <Shield className="w-4 h-4 text-primary" />
                  <span>Create Team Championship</span>
                </button>

                <button
                  onClick={() => router.push(`/org/${orgId}/tournaments/create`)}
                  className="flex items-center gap-2.5 px-6 py-3 rounded-2xl text-sm font-black bg-primary text-black transition-all hover:scale-105 active:scale-95 shadow-xl"
                  style={{ boxShadow: '0 4px 20px var(--athlon-primary-glow)' }}
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Create Tournament</span>
                </button>
              </div>
            </div>

            {/* 4 Dashboard Metric Widgets */}
            <div className="grid grid-cols-4 gap-5">
              <div
                className="p-5 rounded-[22px] border flex items-center justify-between transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                style={{
                  backgroundColor: 'var(--athlon-surface)',
                  borderColor: 'var(--athlon-border)',
                }}
              >
                <div className="space-y-1">
                  <span className="text-[11px] font-extrabold uppercase text-foreground/50 tracking-wider">
                    Total Competitions
                  </span>
                  <div className="text-2xl font-black text-foreground font-mono tabular-nums">
                    {totalCount}
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Trophy className="w-6 h-6" />
                </div>
              </div>

              <div
                className="p-5 rounded-[22px] border flex items-center justify-between transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                style={{
                  backgroundColor: 'var(--athlon-surface)',
                  borderColor: 'var(--athlon-border)',
                }}
              >
                <div className="space-y-1">
                  <span className="text-[11px] font-extrabold uppercase text-foreground/50 tracking-wider">
                    Team Championships
                  </span>
                  <div className="text-2xl font-black text-emerald-400 font-mono tabular-nums">
                    {totalChampionships}
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Shield className="w-6 h-6" />
                </div>
              </div>

              <div
                className="p-5 rounded-[22px] border flex items-center justify-between transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                style={{
                  backgroundColor: 'var(--athlon-surface)',
                  borderColor: 'var(--athlon-border)',
                }}
              >
                <div className="space-y-1">
                  <span className="text-[11px] font-extrabold uppercase text-foreground/50 tracking-wider">
                    Public Discoverable
                  </span>
                  <div className="text-2xl font-black text-blue-400 font-mono tabular-nums">
                    {publicCount}
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Globe className="w-6 h-6" />
                </div>
              </div>

              <div
                className="p-5 rounded-[22px] border flex items-center justify-between transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                style={{
                  backgroundColor: 'var(--athlon-surface)',
                  borderColor: 'var(--athlon-border)',
                }}
              >
                <div className="space-y-1">
                  <span className="text-[11px] font-extrabold uppercase text-foreground/50 tracking-wider">
                    Private / Internal
                  </span>
                  <div className="text-2xl font-black text-amber-400 font-mono tabular-nums">
                    {privateCount}
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Lock className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Filter & Search Dock */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 space-y-8">
          <div
            className="p-3.5 rounded-[24px] border flex items-center justify-between gap-4 shadow-sm"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            {/* Left: Primary Segmented Type Selector */}
            <div
              className="p-1 rounded-2xl border flex items-center gap-1.5"
              style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
            >
              {[
                { id: 'all', label: 'All Competitions', count: totalCount, icon: Layers },
                { id: 'championships', label: 'Team Championships', count: totalChampionships, icon: Shield },
                { id: 'tournaments', label: 'Tournaments & Draws', count: totalTournaments, icon: Trophy },
              ].map((tab) => {
                const isSelected = eventType === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setEventType(tab.id as any)}
                    className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-black transition-all ${
                      isSelected
                        ? 'bg-primary text-black shadow-md'
                        : 'text-foreground/70 hover:text-foreground hover:bg-white/[0.04]'
                    }`}
                  >
                    <tab.icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono shrink-0 ${
                        isSelected ? 'bg-black/20 text-black font-black' : 'bg-white/10 text-foreground/50'
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Right: Visibility Pills & Search Box */}
            <div className="flex items-center gap-3">
              {/* Visibility Switcher */}
              <div
                className="p-1 rounded-2xl border flex items-center gap-1"
                style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
              >
                {[
                  { id: 'all', label: 'All' },
                  { id: 'public', label: 'Public' },
                  { id: 'private', label: 'Private' },
                ].map((tab) => {
                  const isSelected = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-foreground/15 text-foreground font-black'
                          : 'text-foreground/50 hover:text-foreground hover:bg-white/[0.04]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Desktop Search Input */}
              <div className="relative w-80">
                <Search className="w-4 h-4 text-foreground/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search events, sports, locations..."
                  className="w-full pl-10 pr-9 py-2 rounded-2xl border text-xs font-medium focus:outline-none focus:border-primary transition-all placeholder:text-foreground/30"
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

          {/* Desktop Content Grid */}
          {isLoading ? (
            <div className="py-28 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-9 h-9 text-primary animate-spin" />
              <span className="text-xs font-bold uppercase tracking-widest text-foreground/50">
                Loading organizer competitions...
              </span>
            </div>
          ) : hasEvents ? (
            <div className="space-y-12">
              {/* 1. Team Championships Section */}
              {filteredChampionships.length > 0 && (
                <section className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--athlon-border)' }}>
                    <div className="flex items-center gap-2.5">
                      <Shield className="w-5 h-5 text-primary" />
                      <div>
                        <h2 className="text-lg font-black text-foreground">
                          Team Championships ({filteredChampionships.length})
                        </h2>
                        <span className="text-xs text-foreground/50">Multi-Category Franchise League & Auction Hub</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => scrollTrack(championshipsTrackRef, 'left')}
                        className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                        style={{ borderColor: 'var(--athlon-border)' }}
                        title="Scroll Left"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => scrollTrack(championshipsTrackRef, 'right')}
                        className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                        style={{ borderColor: 'var(--athlon-border)' }}
                        title="Scroll Right"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div
                    ref={championshipsTrackRef}
                    className="flex items-stretch gap-6 overflow-x-auto pb-4 pt-1 snap-x scroll-px-8 hide-scrollbar -mx-8 px-8"
                  >
                    {filteredChampionships.map((champ) => {
                      const posterUrl = getChampPosterUrl(champ.posterUrl);
                      const stageBadge = getStageBadge(champ.stage);
                      const startDate = champ.startDate
                        ? new Date(champ.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                        : 'TBA';
                      const endDate = champ.endDate
                        ? new Date(champ.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                        : '';

                      return (
                        <div key={champ.championshipUuid} className="snap-start shrink-0 w-[380px]">
                          <Link
                            href={`/org/${orgId}/team-championship/${champ.championshipUuid}`}
                            className="group rounded-[28px] border overflow-hidden flex flex-col justify-between h-full transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl relative block"
                            style={{
                              backgroundColor: 'var(--athlon-card)',
                              borderColor: 'var(--athlon-border)',
                            }}
                          >
                            <div className="h-[3px] w-full bg-gradient-to-r from-amber-400 via-primary to-emerald-400" />

                            <div>
                              {posterUrl ? (
                                <div className="w-full h-48 relative bg-black/40 overflow-hidden border-b border-white/[0.08]">
                                  <img
                                    src={posterUrl}
                                    alt={champ.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    onError={(e) => {
                                      (e.target as HTMLElement).style.display = 'none';
                                    }}
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1D] via-transparent to-black/30" />

                                  <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md border shadow-md ${stageBadge.class}`}>
                                      {stageBadge.label}
                                    </span>

                                    <div className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/15 flex items-center justify-center text-white/80 group-hover:text-primary group-hover:scale-110 transition-all">
                                      <ArrowUpRight className="w-4 h-4" />
                                    </div>
                                  </div>

                                  <div className="absolute bottom-3.5 left-3.5 z-10 flex items-center gap-1.5">
                                    <span className="px-2.5 py-1 rounded-lg bg-primary/20 backdrop-blur-md border border-primary/30 text-primary text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                                      <Shield className="w-3.5 h-3.5" /> {champ.sport} League
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <div className="w-full h-36 relative bg-gradient-to-br from-primary/10 via-surface to-background border-b border-white/[0.08] p-4 flex flex-col justify-between">
                                  <div className="flex items-center justify-between z-10">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md border ${stageBadge.class}`}>
                                      {stageBadge.label}
                                    </span>

                                    <div className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/15 flex items-center justify-center text-white/80 group-hover:text-primary group-hover:scale-110 transition-all">
                                      <ArrowUpRight className="w-4 h-4" />
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 z-10">
                                    <span className="px-2.5 py-1 rounded-lg bg-primary/20 backdrop-blur-md border border-primary/30 text-primary text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                                      <Shield className="w-3.5 h-3.5" /> {champ.sport} League
                                    </span>
                                  </div>
                                </div>
                              )}

                              <div className="p-5 space-y-3.5">
                                <h3 className="text-base font-black text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">
                                  {champ.name}
                                </h3>

                                <div className="space-y-1.5 text-xs text-foreground/75">
                                  <div className="flex items-center gap-2 font-medium">
                                    <Calendar className="w-4 h-4 text-primary shrink-0" />
                                    <span>{formatEventDates(champ.startDate, champ.endDate)}</span>
                                  </div>

                                  <div className="flex items-center gap-2 font-medium">
                                    <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                                    <span className="truncate">{champ.location || champ.venue || 'Venue TBA'}</span>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between gap-2 pt-3 border-t text-xs text-foreground/60" style={{ borderColor: 'var(--athlon-border)' }}>
                                  <div className="flex items-center gap-1.5 font-bold">
                                    <Users className="w-3.5 h-3.5 text-primary" />
                                    <span>Max {champ.maxTeams || 6} Teams</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                                    <Gavel className="w-3.5 h-3.5" />
                                    <span>{champ.auctionMode?.replace('_', ' ')}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div
                              className="p-3.5 px-5 border-t flex items-center justify-between text-xs"
                              style={{
                                backgroundColor: 'rgba(0, 0, 0, 0.25)',
                                borderColor: 'var(--athlon-border)',
                              }}
                            >
                              <div className="flex items-center gap-1.5">
                                <Ticket className="w-4 h-4 text-primary" />
                                <span className="font-black text-foreground">
                                  {champ.teamRegistrationFee ? `₹${champ.teamRegistrationFee}/Team` : 'Free Entry'}
                                </span>
                              </div>

                              <div className="flex items-center gap-1 text-primary font-black text-xs group-hover:translate-x-1 transition-transform">
                                <span>Manage Championship</span>
                                <ChevronRight className="w-4 h-4" />
                              </div>
                            </div>
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* 2. Tournaments Section */}
              {filteredTournaments.length > 0 && (
                <section className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--athlon-border)' }}>
                    <div className="flex items-center gap-2.5">
                      <Trophy className="w-5 h-5 text-primary" />
                      <div>
                        <h2 className="text-lg font-black text-foreground">
                          Tournaments & Individual Draws ({filteredTournaments.length})
                        </h2>
                        <span className="text-xs text-foreground/50">Single & Double Elimination Draws</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => scrollTrack(tournamentsTrackRef, 'left')}
                        className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                        style={{ borderColor: 'var(--athlon-border)' }}
                        title="Scroll Left"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => scrollTrack(tournamentsTrackRef, 'right')}
                        className="w-8 h-8 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all"
                        style={{ borderColor: 'var(--athlon-border)' }}
                        title="Scroll Right"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div
                    ref={tournamentsTrackRef}
                    className="flex items-stretch gap-6 overflow-x-auto pb-4 pt-1 snap-x scroll-px-8 hide-scrollbar -mx-8 px-8"
                  >
                    {filteredTournaments.map((tournament) => {
                      const posterUrl = getPosterUrl(tournament.poster);
                      const isPublic = (tournament.visibility || 'PRIVATE').toUpperCase() === 'PUBLIC';
                      const startDate = new Date(tournament.startDate).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      });
                      const endDate = new Date(tournament.endDate).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      });

                      return (
                        <div key={tournament.tournamentUuid} className="snap-start shrink-0 w-[380px]">
                          <Link
                            href={`/org/${orgId}/tournaments/${tournament.tournamentUuid}`}
                            className="group rounded-[28px] border overflow-hidden flex flex-col justify-between h-full transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl relative block"
                            style={{
                              backgroundColor: 'var(--athlon-card)',
                              borderColor: 'var(--athlon-border)',
                            }}
                          >
                            <div>
                              {posterUrl ? (
                                <div className="w-full h-48 relative bg-black/40 overflow-hidden border-b border-white/[0.08]">
                                  <img
                                    src={posterUrl}
                                    alt={tournament.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    onError={(e) => {
                                      (e.target as HTMLElement).style.display = 'none';
                                    }}
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1D] via-transparent to-black/30" />

                                  <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10">
                                    <span
                                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md border shadow-md ${
                                        isPublic
                                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                      }`}
                                    >
                                      {tournament.visibility || 'PRIVATE'}
                                    </span>

                                    <div className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/15 flex items-center justify-center text-white/80 group-hover:text-primary group-hover:scale-110 transition-all">
                                      <ArrowUpRight className="w-4 h-4" />
                                    </div>
                                  </div>

                                  <div className="absolute bottom-3.5 left-3.5 z-10 flex items-center gap-1.5">
                                    <span className="px-2.5 py-1 rounded-lg bg-primary/20 backdrop-blur-md border border-primary/30 text-primary text-[10px] font-black uppercase tracking-wider">
                                      {tournament.sport || 'Sports'}
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <div className="w-full h-36 relative bg-gradient-to-br from-primary/10 via-surface to-background border-b border-white/[0.08] p-4 flex flex-col justify-between">
                                  <div className="flex items-center justify-between z-10">
                                    <span
                                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md border ${
                                        isPublic
                                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                      }`}
                                    >
                                      {tournament.visibility || 'PRIVATE'}
                                    </span>

                                    <div className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/15 flex items-center justify-center text-white/80 group-hover:text-primary group-hover:scale-110 transition-all">
                                      <ArrowUpRight className="w-4 h-4" />
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 z-10">
                                    <span className="px-2.5 py-1 rounded-lg bg-primary/20 backdrop-blur-md border border-primary/30 text-primary text-[10px] font-black uppercase tracking-wider">
                                      {tournament.sport || 'Sports'}
                                    </span>
                                  </div>
                                </div>
                              )}

                              <div className="p-5 space-y-3.5">
                                <h3 className="text-base font-black text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">
                                  {tournament.name}
                                </h3>

                                <div className="space-y-1.5 text-xs text-foreground/75">
                                  <div className="flex items-center gap-2 font-medium">
                                    <Calendar className="w-4 h-4 text-primary shrink-0" />
                                    <span>{formatEventDates(tournament.startDate, tournament.endDate)}</span>
                                  </div>

                                  {tournament.location && (
                                    <div className="flex items-center gap-2 font-medium">
                                      <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                                      <span className="truncate">{tournament.location}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div
                              className="p-3.5 px-5 border-t flex items-center justify-between text-xs"
                              style={{
                                backgroundColor: 'rgba(0, 0, 0, 0.25)',
                                borderColor: 'var(--athlon-border)',
                              }}
                            >
                              <div className="flex items-center gap-1.5">
                                <Ticket className="w-4 h-4 text-primary" />
                                <span className="font-black text-foreground">
                                  {tournament.registrationFees ? `₹${tournament.registrationFees}` : 'Free Entry'}
                                </span>
                              </div>

                              <div className="flex items-center gap-1 text-primary font-black text-xs group-hover:translate-x-1 transition-transform">
                                <span>Manage Tournament</span>
                                <ChevronRight className="w-4 h-4" />
                              </div>
                            </div>
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}
            </div>
          ) : (
            /* Desktop Empty State */
            <div
              className="py-24 px-8 rounded-[36px] border border-dashed flex flex-col items-center justify-center text-center relative overflow-hidden shadow-2xl"
              style={{
                backgroundColor: 'var(--athlon-card)',
                borderColor: 'var(--athlon-border)',
              }}
            >
              <div className="w-20 h-20 rounded-3xl bg-primary/10 border border-primary/25 flex items-center justify-center text-primary mb-6 shadow-xl shadow-primary/10">
                <Trophy className="w-10 h-10" />
              </div>

              <h3 className="text-2xl font-black text-foreground mb-2">
                {searchQuery ? 'No Matching Events Found' : 'Launch Your First Competition'}
              </h3>

              <p className="text-sm font-medium max-w-lg mb-8 leading-relaxed text-foreground/70">
                {searchQuery
                  ? `No competitions matched "${searchQuery}". Try searching with a different keyword or reset filters.`
                  : 'Create franchise team championships with live player auctions and pool leagues, or knockout tournaments with automated draws.'}
              </p>

              <div className="flex items-center gap-4">
                {searchQuery ? (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="px-6 py-3 rounded-2xl bg-white/10 border border-white/15 text-foreground font-bold text-sm hover:bg-white/15 transition-all"
                  >
                    Clear Search Filter
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => router.push(`/org/${orgId}/team-championship/create`)}
                      className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-primary text-black font-black text-sm shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                    >
                      <Shield className="w-4 h-4" />
                      <span>Create Team Championship</span>
                    </button>

                    <button
                      onClick={() => router.push(`/org/${orgId}/tournaments/create`)}
                      className="flex items-center gap-2 px-6 py-3.5 rounded-2xl border text-foreground font-bold text-sm hover:bg-white/5 active:scale-95 transition-all"
                      style={{
                        backgroundColor: 'var(--athlon-surface)',
                        borderColor: 'var(--athlon-border)',
                      }}
                    >
                      <Plus className="w-4 h-4 text-primary" />
                      <span>Create Tournament</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}