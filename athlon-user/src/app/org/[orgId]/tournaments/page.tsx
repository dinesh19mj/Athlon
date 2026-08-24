'use client';

import { useState, useEffect, useMemo } from 'react';
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
  Flame,
  Swords,
  X,
} from 'lucide-react';
import { TournamentService, Tournament } from '@/lib/api/tournaments';

export default function TournamentsPage() {
  const params = useParams();
  const orgId = params.orgId as string;
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'all' | 'public' | 'private'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const response = await TournamentService.getByOrg(orgId);
        if (response && response.data) {
          setTournaments(response.data as Tournament[]);
        }
      } catch (error) {
        console.error('Failed to fetch tournaments:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTournaments();
  }, [orgId]);

  // Compute metrics
  const totalCount = tournaments.length;
  const publicCount = tournaments.filter((t) => (t.visibility || 'PRIVATE').toUpperCase() === 'PUBLIC').length;
  const privateCount = tournaments.filter((t) => (t.visibility || 'PRIVATE').toUpperCase() === 'PRIVATE').length;
  const activeCount = tournaments.filter((t) => t.status === 'ACTIVE' || t.status === 'LIVE').length;

  // Filter tournaments
  const filteredTournaments = useMemo(() => {
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
  }, [tournaments, activeTab, searchQuery]);

  const getPosterUrl = (posterPath: string) => {
    if (!posterPath) return '';
    const cleanPath = posterPath.startsWith('/') && posterPath.includes(':') ? posterPath.substring(1) : posterPath;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050';
    return `${baseUrl}/api/tournament/tournaments/getFile?filePath=${encodeURIComponent(cleanPath)}`;
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 selection:bg-primary selection:text-black">
      {/* ── Top Hero Banner ────────────────────────────────────────────── */}
      <div className="relative border-b overflow-hidden" style={{ borderColor: 'var(--athlon-border)' }}>
        {/* Ambient Gradient Glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none translate-y-1/2" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* Title & Description */}
            <div className="max-w-2xl space-y-2.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest bg-primary/10 border border-primary/20 text-primary">
                <Trophy className="w-3.5 h-3.5" />
                <span>Tournament Management</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight leading-tight">
                Tournaments & Events
              </h1>

              <p className="text-xs sm:text-sm font-medium leading-relaxed max-w-xl" style={{ color: 'var(--athlon-text-secondary)' }}>
                Organize, schedule, and launch competitions. Manage public and private events, live scoring brackets, and registrations seamlessly.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 shrink-0 flex-wrap">
              <button
                onClick={() => router.push(`/org/${orgId}/categories`)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-all hover:scale-105 active:scale-95 shadow-sm"
                style={{
                  backgroundColor: 'var(--athlon-surface)',
                  borderColor: 'var(--athlon-border)',
                  color: 'var(--athlon-text)',
                }}
              >
                <Tag className="w-4 h-4 text-primary" />
                <span>Categories</span>
              </button>

              <button
                onClick={() => router.push(`/org/${orgId}/tournaments/create`)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black bg-primary text-primary-foreground transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/20"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>New Tournament</span>
              </button>
            </div>
          </div>

          {/* 4-Stat Quick Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-white/[0.06]">
            <div
              className="p-3.5 rounded-2xl border flex items-center gap-3.5"
              style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border-subtle)' }}
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                <Trophy className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-extrabold uppercase tracking-wider" style={{ color: 'var(--athlon-text-muted)' }}>
                  Total Events
                </span>
                <span className="text-lg font-black text-foreground">{totalCount}</span>
              </div>
            </div>

            <div
              className="p-3.5 rounded-2xl border flex items-center gap-3.5"
              style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border-subtle)' }}
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-extrabold uppercase tracking-wider" style={{ color: 'var(--athlon-text-muted)' }}>
                  Public Events
                </span>
                <span className="text-lg font-black text-foreground">{publicCount}</span>
              </div>
            </div>

            <div
              className="p-3.5 rounded-2xl border flex items-center gap-3.5"
              style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border-subtle)' }}
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-extrabold uppercase tracking-wider" style={{ color: 'var(--athlon-text-muted)' }}>
                  Private Events
                </span>
                <span className="text-lg font-black text-foreground">{privateCount}</span>
              </div>
            </div>

            <div
              className="p-3.5 rounded-2xl border flex items-center gap-3.5"
              style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border-subtle)' }}
            >
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
                <Activity className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-extrabold uppercase tracking-wider" style={{ color: 'var(--athlon-text-muted)' }}>
                  Active Status
                </span>
                <span className="text-lg font-black text-foreground">{activeCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content Area ────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Controls Bar (Filter Tabs + Search) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Segmented Filter Tabs */}
          <div
            className="flex p-1 rounded-2xl border shadow-inner shrink-0"
            style={{
              backgroundColor: 'var(--athlon-surface)',
              borderColor: 'var(--athlon-border-subtle)',
            }}
          >
            {[
              { id: 'all', label: 'All', count: totalCount },
              { id: 'public', label: 'Public', count: publicCount },
              { id: 'private', label: 'Private', count: privateCount },
            ].map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-200 ${
                    isSelected
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'text-foreground/60 hover:text-foreground hover:bg-white/[0.04]'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected ? 'bg-black/20 text-primary-foreground' : 'bg-white/5 text-foreground/40'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-foreground/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tournaments by name, sport, location..."
              className="w-full pl-10 pr-9 py-2.5 rounded-2xl border text-xs sm:text-sm font-medium focus:outline-none focus:border-primary transition-all placeholder:text-foreground/30"
              style={{
                backgroundColor: 'var(--athlon-surface)',
                borderColor: 'var(--athlon-border-subtle)',
                color: 'var(--athlon-text)',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* ── Tournament Cards Grid ─────────────────────────────────── */}
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <span className="text-xs font-bold uppercase tracking-widest text-foreground/50">Loading tournaments...</span>
          </div>
        ) : filteredTournaments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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

              const isTeamEvent = tournament.tournamentType === 'TEAM_EVENT';

              return (
                <Link
                  key={tournament.tournamentUuid}
                  href={`/org/${orgId}/tournaments/${tournament.tournamentUuid}`}
                  className="group rounded-[22px] border overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl relative"
                  style={{
                    backgroundColor: 'var(--athlon-card)',
                    borderColor: 'var(--athlon-border)',
                  }}
                >
                  {/* Card Header & Poster */}
                  <div>
                    {posterUrl ? (
                      <div className="w-full h-44 relative bg-black/40 overflow-hidden border-b border-white/[0.08]">
                        <img
                          src={posterUrl}
                          alt={tournament.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1D] via-transparent to-black/30" />

                        {/* Top Action Pills */}
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider backdrop-blur-md border shadow-md ${
                              isPublic
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            }`}
                          >
                            {tournament.visibility || 'PRIVATE'}
                          </span>

                          <div className="w-7 h-7 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/80 group-hover:text-primary group-hover:scale-110 transition-all">
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </div>
                        </div>

                        {/* Bottom Poster Tag */}
                        <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-md bg-primary/20 backdrop-blur-md border border-primary/30 text-primary text-[10px] font-extrabold uppercase tracking-wider">
                            {tournament.sport || 'Sports'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-32 relative bg-gradient-to-br from-primary/10 via-surface to-background border-b border-white/[0.08] p-4 flex flex-col justify-between">
                        <div className="flex items-center justify-between z-10">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider backdrop-blur-md border ${
                              isPublic
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            }`}
                          >
                            {tournament.visibility || 'PRIVATE'}
                          </span>

                          <div className="w-7 h-7 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/80 group-hover:text-primary group-hover:scale-110 transition-all">
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </div>
                        </div>

                        <div className="flex items-center gap-2 z-10">
                          <span className="px-2 py-0.5 rounded-md bg-primary/20 backdrop-blur-md border border-primary/30 text-primary text-[10px] font-extrabold uppercase tracking-wider">
                            {tournament.sport || 'Sports'}
                          </span>
                          <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider">
                            {isTeamEvent ? 'Team League' : 'Knockout'}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Tournament Info Body */}
                    <div className="p-5 space-y-3.5">
                      <h3 className="text-base sm:text-lg font-black text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">
                        {tournament.name}
                      </h3>

                      {/* Date & Location */}
                      <div className="space-y-1.5 text-xs text-foreground/75">
                        <div className="flex items-center gap-2 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span>{startDate} - {endDate}</span>
                        </div>

                        {tournament.location && (
                          <div className="flex items-center gap-2 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span className="truncate">{tournament.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Strip */}
                  <div
                    className="p-3.5 px-5 border-t flex items-center justify-between text-xs"
                    style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.2)',
                      borderColor: 'var(--athlon-border-subtle)',
                    }}
                  >
                    <div className="flex items-center gap-1.5">
                      <Ticket className="w-3.5 h-3.5 text-primary" />
                      <span className="font-extrabold text-foreground">
                        {tournament.registrationFees ? `₹${tournament.registrationFees}` : 'Free Entry'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-primary font-bold text-[11px] group-hover:translate-x-0.5 transition-transform">
                      <span>Manage</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          /* ── Stylish Empty State ───────────────────────────────────── */
          <div
            className="py-16 sm:py-20 px-6 rounded-[28px] border border-dashed flex flex-col items-center justify-center text-center relative overflow-hidden shadow-2xl"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

            {/* Glowing Icon Badge */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-primary/10 border border-primary/25 flex items-center justify-center text-primary mb-5 shadow-lg shadow-primary/10 relative z-10">
              <Trophy className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-foreground mb-2 relative z-10">
              {searchQuery ? 'No Matching Tournaments Found' : 'Launch Your First Competition'}
            </h3>

            <p
              className="text-xs sm:text-sm font-medium max-w-md mb-8 leading-relaxed relative z-10"
              style={{ color: 'var(--athlon-text-secondary)' }}
            >
              {searchQuery
                ? `No tournaments matched "${searchQuery}". Try adjusting your search query or clear the filter.`
                : 'Create knockout brackets, league schedules, or team championships with automated draws and live umpire scoring.'}
            </p>

            {/* Empty State Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 relative z-10">
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-5 py-2.5 rounded-xl bg-white/10 border border-white/15 text-foreground font-bold text-xs sm:text-sm hover:bg-white/15 transition-all"
                >
                  Clear Search Filter
                </button>
              ) : (
                <>
                  <button
                    onClick={() => router.push(`/org/${orgId}/tournaments/create`)}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-black text-xs sm:text-sm shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Create Your First Tournament</span>
                  </button>

                  <button
                    onClick={() => router.push(`/org/${orgId}/categories`)}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl border text-foreground font-bold text-xs sm:text-sm hover:bg-white/5 transition-all"
                    style={{
                      backgroundColor: 'var(--athlon-surface)',
                      borderColor: 'var(--athlon-border)',
                    }}
                  >
                    <Tag className="w-4 h-4 text-primary" />
                    <span>Manage Categories</span>
                  </button>
                </>
              )}
            </div>

            {/* 3 Quick Features Bento Below */}
            {!searchQuery && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl mt-12 pt-8 border-t border-white/[0.06] text-left relative z-10">
                <div
                  className="p-3.5 rounded-xl border"
                  style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border-subtle)' }}
                >
                  <div className="flex items-center gap-2 text-primary font-bold text-xs mb-1">
                    <Swords className="w-3.5 h-3.5" />
                    <span>Automated Draws</span>
                  </div>
                  <p className="text-[11px] text-foreground/50 font-medium">Generate single/double elimination brackets in one click.</p>
                </div>

                <div
                  className="p-3.5 rounded-xl border"
                  style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border-subtle)' }}
                >
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs mb-1">
                    <Activity className="w-3.5 h-3.5" />
                    <span>Live Scoring</span>
                  </div>
                  <p className="text-[11px] text-foreground/50 font-medium">Real-time court match scoring and live broadcast overlays.</p>
                </div>

                <div
                  className="p-3.5 rounded-xl border"
                  style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border-subtle)' }}
                >
                  <div className="flex items-center gap-2 text-purple-400 font-bold text-xs mb-1">
                    <Ticket className="w-3.5 h-3.5" />
                    <span>Online Registration</span>
                  </div>
                  <p className="text-[11px] text-foreground/50 font-medium">Collect player entries, team rosters, and fees seamlessly.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}