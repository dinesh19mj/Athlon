'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users,
  Search,
  Plus,
  MapPin,
  CalendarDays,
  Trophy,
  ShieldCheck,
  Activity,
  ChevronRight,
  Filter,
  Sparkles,
  Lock,
  Globe,
  CheckCircle2,
  AlertCircle,
  X,
  Compass,
  Zap,
} from 'lucide-react';
import { Athlon3DIcon } from '@/components/common/Athlon3DIcon';
import { Athlon3DFAB } from '@/components/common/Athlon3DFAB';
import { CommunityService, CommunityResponse, CreateCommunityRequest } from '@/lib/api/community';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';

interface SportCategory {
  name: string;
  emoji: string;
}

const POPULAR_SPORTS: SportCategory[] = [
  { name: 'All', emoji: '🏆' },
  { name: 'Badminton', emoji: '🏸' },
  { name: 'Tennis', emoji: '🎾' },
  { name: 'Pickleball', emoji: '🏓' },
  { name: 'Cricket', emoji: '🏏' },
  { name: 'Football', emoji: '⚽' },
  { name: 'Basketball', emoji: '🏀' },
  { name: 'Table Tennis', emoji: '🏓' },
  { name: 'Volleyball', emoji: '🏐' },
  { name: 'Squash', emoji: '🎾' },
];

export default function CommunitiesDirectoryPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { addOrganization, setActiveWorkspace } = useWorkspaceStore();

  const [communities, setCommunities] = useState<CommunityResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSport, setSelectedSport] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'DISCOVER' | 'MY_COMMUNITIES'>('DISCOVER');

  // Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateCommunityRequest>({
    name: '',
    description: '',
    primarySport: 'Badminton',
    city: '',
    area: '',
    venueName: '',
    visibility: 'PUBLIC',
  });

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      if (activeTab === 'MY_COMMUNITIES') {
        const res = await CommunityService.getMyCommunities();
        const data = (res as any)?.data || res;
        setCommunities(Array.isArray(data) ? data : []);
      } else {
        const res = await CommunityService.listCommunities({
          sport: selectedSport !== 'All' ? selectedSport : undefined,
          query: searchQuery.trim() || undefined,
        });
        const data = (res as any)?.data || res;
        setCommunities(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to load communities:', err);
      setCommunities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, [selectedSport, activeTab]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCommunities();
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setCreateError('Please enter a community name');
      return;
    }
    try {
      setIsCreating(true);
      setCreateError(null);
      const res = await CommunityService.createCommunity(formData);
      const created = (res as any)?.data || res;

      if (created && created.orgUuid) {
        addOrganization({
          id: created.orgUuid,
          name: created.name,
          type: 'COMMUNITY',
          role: 'OWNER',
        });
        setActiveWorkspace(created.orgUuid);
        setShowCreateModal(false);
        router.push(`/org/${created.orgUuid}/dashboard`);
      } else {
        setShowCreateModal(false);
        fetchCommunities();
      }
    } catch (err: any) {
      console.error('Failed to create community:', err);
      setCreateError(err?.response?.data?.message || err?.message || 'Failed to create community. Free plan limit may be reached.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: 'var(--athlon-bg)' }}>
      {/* ─── Compact, Sleek Mobile-First Hero & Header ─── */}
      <div
        className="border-b relative overflow-hidden px-4 py-3.5 sm:py-5 sm:px-6 lg:px-8"
        style={{ borderColor: 'var(--athlon-border)' }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 space-y-3">
          {/* Header Top Row: Badge + Compact Title */}
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30">
                <Sparkles className="w-2.5 h-2.5" />
                <span>Play Hub</span>
              </span>
              <span className="text-[10px] text-foreground/50 font-semibold truncate hidden xs:inline">
                • Game Circles
              </span>
            </div>
            <h1 className="text-base sm:text-xl font-black text-foreground tracking-tight truncate leading-tight">
              Sports Communities
            </h1>
          </div>

          <p className="text-[11px] sm:text-xs text-foreground/60 font-medium leading-relaxed max-w-xl line-clamp-2">
            Join active local groups, RSVP for weekly &quot;Let&apos;s Play&quot; sessions, and build your sports circle.
          </p>

          {/* ─── Modern Mobile Tabs & Search Dock ─── */}
          <div className="space-y-2 pt-0.5">
            <div className="flex items-center gap-2">
              {/* Segmented Switcher */}
              <div
                className="flex items-center p-0.5 rounded-xl border bg-surface shrink-0"
                style={{ borderColor: 'var(--athlon-border)' }}
              >
                <button
                  onClick={() => setActiveTab('DISCOVER')}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-black transition-all cursor-pointer flex items-center gap-1 ${
                    activeTab === 'DISCOVER'
                      ? 'bg-primary text-black shadow-sm'
                      : 'text-foreground/70 hover:text-foreground'
                  }`}
                >
                  <Compass className="w-3 h-3" />
                  <span>Explore</span>
                </button>
                <button
                  onClick={() => setActiveTab('MY_COMMUNITIES')}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-black transition-all cursor-pointer flex items-center gap-1 ${
                    activeTab === 'MY_COMMUNITIES'
                      ? 'bg-primary text-black shadow-sm'
                      : 'text-foreground/70 hover:text-foreground'
                  }`}
                >
                  <Users className="w-3 h-3" />
                  <span>My Circles</span>
                </button>
              </div>

              {/* Integrated Search Bar */}
              <form onSubmit={handleSearchSubmit} className="flex-1 min-w-0">
                <div
                  className="flex items-center px-2.5 py-1.5 rounded-xl border bg-card transition-all focus-within:ring-1 focus-within:ring-primary"
                  style={{ borderColor: 'var(--athlon-border)' }}
                >
                  <Search className="w-3.5 h-3.5 text-foreground/40 mr-1.5 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search name or city..."
                    className="w-full bg-transparent text-[11px] sm:text-xs text-foreground placeholder:text-foreground/40 focus:outline-none"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        fetchCommunities();
                      }}
                      className="p-0.5 text-foreground/40 hover:text-foreground mr-1 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-2 py-0.5 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary text-[10px] font-black tracking-wide shrink-0 transition-colors"
                  >
                    Search
                  </button>
                </div>
              </form>
            </div>

            {/* Sport Category Horizontal Scroll Chips */}
            {activeTab === 'DISCOVER' && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                {POPULAR_SPORTS.map((sport) => {
                  const isSelected = selectedSport === sport.name;
                  return (
                    <button
                      key={sport.name}
                      onClick={() => setSelectedSport(sport.name)}
                      className={`px-2.5 py-1 rounded-full text-[10.5px] font-extrabold whitespace-nowrap transition-all border cursor-pointer active:scale-95 flex items-center gap-1 shrink-0 ${
                        isSelected
                          ? 'bg-primary text-black border-primary shadow-sm font-black'
                          : 'bg-card text-foreground/75 hover:text-foreground hover:bg-surface border-border'
                      }`}
                      style={{
                        borderColor: isSelected ? 'var(--athlon-primary)' : 'var(--athlon-border)',
                      }}
                    >
                      <span>{sport.emoji}</span>
                      <span>{sport.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Communities Cards Grid ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-36 rounded-2xl bg-surface animate-pulse border"
                style={{ borderColor: 'var(--athlon-border)' }}
              />
            ))}
          </div>
        ) : communities.length === 0 ? (
          <div
            className="py-12 text-center space-y-3 rounded-2xl border border-dashed p-6 my-2"
            style={{ borderColor: 'var(--athlon-border)', backgroundColor: 'var(--athlon-card)' }}
          >
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto text-2xl font-bold">
              🏸
            </div>
            <div className="space-y-0.5">
              <h3 className="text-sm font-black text-foreground">No communities found</h3>
              <p className="text-[11px] text-foreground/60 max-w-xs mx-auto">
                {activeTab === 'MY_COMMUNITIES'
                  ? "You haven't joined or created any sports circles yet."
                  : 'Be the first to start a sports community in this sport or city!'}
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 rounded-xl bg-primary text-black font-extrabold text-xs inline-flex items-center gap-1.5 hover:bg-primary/90 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Circle</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {communities.map((comm, idx) => {
              const commUuid = comm.organizationUuid || comm.orgUuid || comm.communityUuid || String(comm.organizationId || idx);
              const isJoined = comm.currentUserStatus === 'ACTIVE';
              const isPending = comm.currentUserStatus === 'REQUESTED';
              const gamesHosted = comm.sessionsCount ?? comm.totalSessionsHosted ?? 0;
              const locationDisplay = comm.city || comm.location || comm.area || 'All Areas';

              return (
                <div
                  key={commUuid}
                  className="rounded-2xl border p-3.5 sm:p-4 transition-all duration-200 hover:shadow-md flex flex-col justify-between space-y-3 relative overflow-hidden group"
                  style={{
                    backgroundColor: 'var(--athlon-card)',
                    borderColor: 'var(--athlon-border)',
                  }}
                >
                  {/* Top Row: Avatar + Community Name + Visibility Badge */}
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-surface border border-primary/30 flex items-center justify-center text-sm font-black text-primary shrink-0 shadow-sm">
                        {comm.logoUrl ? (
                          <img src={comm.logoUrl} alt={comm.name} className="w-full h-full object-cover rounded-xl" />
                        ) : (
                          (comm.name || 'C').charAt(0).toUpperCase()
                        )}
                      </div>

                      <div className="min-w-0 space-y-0.5">
                        <Link href={`/communities/${commUuid}`}>
                          <h3 className="font-black text-xs sm:text-sm text-foreground group-hover:text-primary transition-colors tracking-tight truncate leading-tight">
                            {comm.name}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[8.5px] font-black uppercase tracking-wider text-primary px-1.5 py-0.5 rounded bg-primary/10 border border-primary/25">
                            {comm.primarySport}
                          </span>
                          <span className="text-[9.5px] text-foreground/50 font-medium flex items-center gap-0.5 truncate">
                            <MapPin className="w-2.5 h-2.5 text-primary shrink-0" />
                            <span className="truncate max-w-[100px]">{locationDisplay}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {comm.visibility === 'PUBLIC' ? (
                        <span className="px-1.5 py-0.5 rounded-md text-[8px] font-extrabold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-0.5">
                          <Globe className="w-2.5 h-2.5" /> Public
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded-md text-[8px] font-extrabold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-0.5">
                          <Lock className="w-2.5 h-2.5" /> Request
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bio / Description */}
                  {comm.description && (
                    <p className="text-[11px] text-foreground/65 line-clamp-2 leading-relaxed">
                      {comm.description}
                    </p>
                  )}

                  {/* Micro Telemetry & Action Footer */}
                  <div
                    className="pt-2 border-t flex items-center justify-between gap-2"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <div className="flex items-center gap-2.5 text-[10px] text-foreground/60 font-medium">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-primary" />
                        <span className="font-mono font-bold text-foreground">{comm.memberCount || 1}</span>
                        <span className="hidden xs:inline">players</span>
                      </span>
                      {gamesHosted > 0 && (
                        <span className="flex items-center gap-1">
                          <Zap className="w-3 h-3 text-primary" />
                          <span className="font-mono font-bold text-foreground">{gamesHosted}</span>
                          <span className="hidden xs:inline">games</span>
                        </span>
                      )}
                    </div>

                    {/* Action Link */}
                    <div className="flex items-center gap-1 shrink-0">
                      {isJoined ? (
                        <Link
                          href={`/org/${commUuid}/dashboard`}
                          className="px-2.5 py-1 rounded-lg bg-primary text-black font-black text-[11px] inline-flex items-center gap-0.5 transition-all shadow-sm active:scale-95"
                        >
                          <span>Workspace</span>
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      ) : isPending ? (
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-400 font-bold text-[10px] border border-amber-500/30">
                          Pending
                        </span>
                      ) : (
                        <Link
                          href={`/communities/${commUuid}`}
                          className="px-2.5 py-1 rounded-lg bg-surface hover:bg-primary/20 text-primary border border-primary/30 font-bold text-[11px] inline-flex items-center gap-0.5 transition-colors active:scale-95"
                        >
                          <span>View Circle</span>
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Floating Action Button (Create Circle) ─── */}
      <Athlon3DFAB
        onClick={() => {
          if (!isAuthenticated) {
            router.push('/login?redirect=/communities');
            return;
          }
          setShowCreateModal(true);
        }}
        label="Create Circle"
        title="Create Circle"
        ariaLabel="Create Circle"
      />

      {/* ─── Mobile Bottom Navigation Bar ─── */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 h-16 backdrop-blur-xl border-t z-30 px-4 flex items-center justify-around max-w-lg mx-auto fixed-bottom-nav"
        style={{
          backgroundColor: 'var(--athlon-navigation)',
          borderColor: 'var(--athlon-border)',
          transform: 'translate3d(0, 0, 0)',
          WebkitTransform: 'translate3d(0, 0, 0)',
        }}
      >
        <Link
          href={isAuthenticated ? '/home' : '/'}
          className="flex flex-col items-center justify-center gap-0.5 w-14 group opacity-70 hover:opacity-100 transition-opacity"
        >
          <Athlon3DIcon type="home" size={26} active={false} />
          <span className="text-[10px] font-bold leading-tight tracking-tight" style={{ color: 'var(--athlon-text-muted)' }}>
            Home
          </span>
        </Link>

        <Link
          href={isAuthenticated ? '/home/tournaments' : '/tournaments'}
          className="flex flex-col items-center justify-center gap-0.5 w-14 group opacity-70 hover:opacity-100 transition-opacity"
        >
          <Athlon3DIcon type="tournaments" size={26} active={false} />
          <span className="text-[10px] font-bold leading-tight tracking-tight" style={{ color: 'var(--athlon-text-muted)' }}>
            Events
          </span>
        </Link>

        {/* 3D Circular Elevated Umpire / Play Button */}
        <div className="relative -top-5 flex items-center justify-center">
          <Link
            href="/practice"
            className="w-[56px] h-[56px] rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all border-[3.5px] group relative overflow-hidden shadow-2xl umpire-center-orb"
            style={{
              backgroundColor: 'var(--athlon-primary)',
              borderColor: 'var(--athlon-navigation)',
              boxShadow: '0 8px 24px -2px var(--athlon-primary-glow), 0 4px 12px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.45), inset 0 -3px 6px rgba(0,0,0,0.3)',
            }}
          >
            {/* 3D Glass Specular Reflection Arc */}
            <div className="absolute inset-x-1 top-0 h-[45%] rounded-t-full bg-gradient-to-b from-white/40 via-white/10 to-transparent pointer-events-none" />

            <img
              src="/umpire.png"
              alt="Play"
              className="w-7 h-7 object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] relative z-10 transition-transform group-hover:scale-110 group-active:scale-95"
            />
          </Link>
        </div>

        <Link
          href="/live-score"
          className="flex flex-col items-center justify-center gap-0.5 w-14 group opacity-70 hover:opacity-100 transition-opacity"
        >
          <Athlon3DIcon type="live-score" size={26} active={false} />
          <span className="text-[10px] font-bold leading-tight tracking-tight" style={{ color: 'var(--athlon-text-muted)' }}>
            Live
          </span>
        </Link>

        <Link
          href={isAuthenticated ? '/profile' : '/login?redirect=/profile'}
          className="flex flex-col items-center justify-center gap-0.5 w-14 group opacity-70 hover:opacity-100 transition-opacity"
        >
          <Athlon3DIcon type="profile" size={26} active={false} />
          <span className="text-[10px] font-bold leading-tight tracking-tight" style={{ color: 'var(--athlon-text-muted)' }}>
            Profile
          </span>
        </Link>
      </nav>

      {/* ─── Create Community Modal ─── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div
            className="w-full max-w-lg rounded-2xl sm:rounded-3xl border shadow-2xl p-4 sm:p-6 space-y-4 relative overflow-hidden max-h-[92vh] overflow-y-auto"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--athlon-border)' }}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center font-black text-sm">
                  🏸
                </div>
                <div>
                  <h3 className="font-black text-sm sm:text-base text-foreground">Create Sports Circle</h3>
                  <p className="text-[10px] text-foreground/60">Free Tier • Upgrade to PRO anytime</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-foreground/40 hover:text-foreground hover:bg-surface transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 flex items-start gap-2 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
              <div className="text-[11px] text-foreground/80 leading-snug">
                <span className="font-bold text-foreground">Free Tier:</span> Unlimited members, weekly sessions, feed, friendly matches &amp; kitty ledger. You can upgrade to <span className="font-bold text-amber-400">PRO</span> anytime to unlock Tournaments &amp; Cups.
              </div>
            </div>

            {createError && (
              <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase tracking-wider text-foreground/70">
                  Community Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Bangalore Smashers Club"
                  className="w-full px-3 py-2 rounded-xl bg-surface border text-xs text-foreground focus:outline-none focus:border-primary transition-colors"
                  style={{ borderColor: 'var(--athlon-border)' }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-wider text-foreground/70">
                    Primary Sport *
                  </label>
                  <select
                    value={formData.primarySport}
                    onChange={(e) => setFormData({ ...formData, primarySport: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-surface border text-xs text-foreground focus:outline-none focus:border-primary transition-colors"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    {POPULAR_SPORTS.filter((s) => s.name !== 'All').map((sport) => (
                      <option key={sport.name} value={sport.name} className="bg-neutral-900 text-white">
                        {sport.emoji} {sport.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-wider text-foreground/70">
                    City / Location
                  </label>
                  <input
                    type="text"
                    value={formData.city || ''}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Bengaluru"
                    className="w-full px-3 py-2 rounded-xl bg-surface border text-xs text-foreground focus:outline-none focus:border-primary transition-colors"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase tracking-wider text-foreground/70">
                  Description / Bio
                </label>
                <textarea
                  rows={2}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description about regular sessions and play style..."
                  className="w-full px-3 py-2 rounded-xl bg-surface border text-xs text-foreground focus:outline-none focus:border-primary transition-colors resize-none"
                  style={{ borderColor: 'var(--athlon-border)' }}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase tracking-wider text-foreground/70">
                  Access &amp; Privacy
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, visibility: 'PUBLIC' })}
                    className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                      formData.visibility === 'PUBLIC'
                        ? 'bg-primary/15 border-primary text-foreground font-bold'
                        : 'bg-surface border-border text-foreground/60'
                    }`}
                    style={{ borderColor: formData.visibility === 'PUBLIC' ? 'var(--athlon-primary)' : 'var(--athlon-border)' }}
                  >
                    <div className="flex items-center gap-1 text-[11px] font-black">
                      <Globe className="w-3 h-3 text-primary" />
                      <span>Public</span>
                    </div>
                    <p className="text-[9px] text-foreground/50 mt-0.5">Instant join</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, visibility: 'APPROVAL_REQUIRED' })}
                    className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                      formData.visibility === 'APPROVAL_REQUIRED'
                        ? 'bg-primary/15 border-primary text-foreground font-bold'
                        : 'bg-surface border-border text-foreground/60'
                    }`}
                    style={{ borderColor: formData.visibility === 'APPROVAL_REQUIRED' ? 'var(--athlon-primary)' : 'var(--athlon-border)' }}
                  >
                    <div className="flex items-center gap-1 text-[11px] font-black">
                      <Lock className="w-3 h-3 text-amber-400" />
                      <span>Approval Req.</span>
                    </div>
                    <p className="text-[9px] text-foreground/50 mt-0.5">Admin approval</p>
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t" style={{ borderColor: 'var(--athlon-border)' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 rounded-xl bg-surface hover:bg-card text-foreground font-semibold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-4 py-1.5 rounded-xl bg-primary hover:bg-primary/90 text-black font-black text-xs flex items-center gap-1.5 transition-all shadow-[0_2px_10px_var(--athlon-primary-glow)] disabled:opacity-50 cursor-pointer"
                >
                  {isCreating ? 'Creating...' : 'Create Circle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
