'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  ArrowLeft,
  Search,
  MapPin,
  Star,
  ChevronRight,
  ShieldCheck,
  Dumbbell,
  Phone,
  Trophy,
  Award,
  Sparkles,
  CheckCircle2,
  Calendar,
  X,
  Clock,
  LayoutGrid,
  List,
  GraduationCap,
  Users,
  Check,
  Loader2,
  UserPlus,
  Building2,
  ChevronDown,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { OrganizationService } from '@/lib/api/organization';
import { CoachMarketplaceCard, CoachCardData } from '@/components/marketplace/CoachMarketplaceCard';
import { Athlon3DIcon } from '@/components/common/Athlon3DIcon';

const POPULAR_CITIES = ['All Cities', 'Bangalore', 'Chennai', 'Hyderabad', 'Mumbai', 'Delhi NCR', 'Pune'];

export default function CoachesPage() {
  const router = useRouter();
  const { isAuthenticated, userUuid, userEmail } = useAuthStore();
  const { personalProfile } = useWorkspaceStore();

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push(isAuthenticated ? '/home' : '/');
    }
  };

  const [activeFilter, setActiveFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('All Cities');
  const [searchQuery, setSearchQuery] = useState('');
  const [liveCoaches, setLiveCoaches] = useState<CoachCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'compact'>('grid');

  // Fetch Live Coaches from Backend
  useEffect(() => {
    const fetchCoaches = async () => {
      try {
        setLoading(true);
        const res = await OrganizationService.getAll();
        const orgs = Array.isArray(res) ? res : (res as any)?.data || [];
        const coachOrgs = orgs.filter((o: any) => o.type === 'COACH');

        if (coachOrgs.length > 0) {
          const mapped: CoachCardData[] = coachOrgs.map((org: any, idx: number) => {
            const prof = org.profile;
            const sports = prof?.sportsOffered ? prof.sportsOffered.split(',').map((s: string) => s.trim()) : ['Badminton'];
            return {
              id: org.uuid || org.id || `coach-${idx}`,
              uuid: org.uuid,
              name: org.name,
              type: 'COACH',
              sportType: sports[0] || 'Badminton',
              city: prof?.city || '',
              state: prof?.state || '',
              address: prof?.address || prof?.city || '',
              image: prof?.banner
                ? OrganizationService.getBannerUrl(prof.banner)
                : prof?.logo
                  ? OrganizationService.getLogoUrl(prof.logo)
                  : '',
              tags: sports,
              experienceYears: prof?.experienceYears || 0,
              logo: org.logo || prof?.logo,
              banner: org.banner || prof?.banner,
              description: org.description || prof?.description || prof?.bio || '',
              profile: prof || org,
            };
          });
          setLiveCoaches(mapped);
        } else {
          setLiveCoaches([]);
        }
      } catch (err) {
        console.error('Failed to load coaches:', err);
        setLiveCoaches([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCoaches();

    const handleOrgSync = () => {
      fetchCoaches();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('athlon-org-updated', handleOrgSync);
      window.addEventListener('storage', (e) => {
        if (e.key === 'athlon_org_updated_time') fetchCoaches();
      });
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('athlon-org-updated', handleOrgSync);
      }
    };
  }, []);

  const allCoaches = useMemo(() => {
    return liveCoaches;
  }, [liveCoaches]);

  // Filtered List
  const filteredCoaches = useMemo(() => {
    return allCoaches.filter((c) => {
      if (cityFilter !== 'All Cities') {
        const cCity = (c.city || c.profile?.city || '').toLowerCase();
        const target = cityFilter.toLowerCase();
        if (!cCity.includes(target) && !target.includes(cCity)) return false;
      }

      if (activeFilter === 'badminton' && !c.tags?.some((t) => t.toLowerCase().includes('badminton'))) return false;
      if (activeFilter === 'tennis' && !c.tags?.some((t) => t.toLowerCase().includes('tennis'))) return false;
      if (activeFilter === 'cricket' && !c.tags?.some((t) => t.toLowerCase().includes('cricket'))) return false;
      if (activeFilter === 'football' && !c.tags?.some((t) => t.toLowerCase().includes('football'))) return false;
      if (activeFilter === 'table_tennis' && !c.tags?.some((t) => t.toLowerCase().includes('table tennis') || t.toLowerCase().includes('tt'))) return false;
      if (activeFilter === 'verified' && !((c.profile?.experienceYears || 0) >= 5)) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        (c.city && c.city.toLowerCase().includes(q)) ||
        (c.sportType && c.sportType.toLowerCase().includes(q)) ||
        c.tags?.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [allCoaches, activeFilter, searchQuery, cityFilter]);

  const isFiltered = activeFilter !== 'all' || searchQuery.trim().length > 0 || cityFilter !== 'All Cities';

  const resetFilters = () => {
    setActiveFilter('all');
    setSearchQuery('');
    setCityFilter('All Cities');
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-28 sm:pb-16 selection:bg-primary selection:text-black">
      {/* ── SLEEK MOBILE-FIRST HEADER & SEARCH BAR ── */}
      <section className="relative overflow-hidden border-b border-border/80 bg-gradient-to-b from-card/90 via-surface/60 to-background pt-3 sm:pt-6 pb-4 sm:pb-6 px-3.5 sm:px-6">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto space-y-3 sm:space-y-4 relative z-10">
          {/* Top Bar: Back Button, Title, and View Mode Switcher */}
          <div className="flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                type="button"
                onClick={handleBack}
                title="Go Back"
                className="w-9 h-9 rounded-xl border border-border/80 bg-surface/80 hover:bg-surface text-foreground/80 hover:text-foreground flex items-center justify-center transition-all active:scale-95 shadow-xs shrink-0 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-[9px] font-black uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    Athlon Coaches
                  </span>
                  <span className="hidden xs:inline-block text-[10px] text-foreground/40 font-semibold">•</span>
                  <span className="hidden xs:inline-block text-[10px] text-foreground/50 font-bold truncate">
                    Verified Mentors
                  </span>
                </div>
                <h1 className="text-base sm:text-xl md:text-2xl font-black text-foreground tracking-tight truncate mt-0.5">
                  Sports Coaches &amp; Mentors
                </h1>
              </div>
            </div>

            {/* View Mode Switcher (Grid / List) */}
            <div className="flex items-center p-1 rounded-xl bg-surface/80 border border-border/80 shrink-0 shadow-xs">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                title="Grid Card View"
                className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-primary text-black font-black shadow-xs scale-105'
                    : 'text-foreground/50 hover:text-foreground'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('compact')}
                title="Compact List View"
                className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                  viewMode === 'compact'
                    ? 'bg-primary text-black font-black shadow-xs scale-105'
                    : 'text-foreground/50 hover:text-foreground'
                }`}
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Hub Switcher Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar pt-0.5">
            <Link
              href="/coaches"
              className="px-3 py-1.5 rounded-xl text-[11px] font-black bg-primary text-black flex items-center gap-1.5 shadow-xs shrink-0"
            >
              <Award className="w-3.5 h-3.5 text-black" />
              <span>Coaches</span>
            </Link>
            <Link
              href="/venues"
              className="px-3 py-1.5 rounded-xl text-[11px] font-bold text-foreground/70 hover:text-foreground border border-border/70 hover:bg-surface flex items-center gap-1.5 shrink-0 transition-all"
            >
              <Building2 className="w-3.5 h-3.5 text-primary" />
              <span>Courts &amp; Turfs</span>
            </Link>
            <Link
              href="/academies"
              className="px-3 py-1.5 rounded-xl text-[11px] font-bold text-foreground/70 hover:text-foreground border border-border/70 hover:bg-surface flex items-center gap-1.5 shrink-0 transition-all"
            >
              <GraduationCap className="w-3.5 h-3.5 text-primary" />
              <span>Academies</span>
            </Link>
          </div>

          {/* Search & City Input Bar */}
          <div className="flex items-center gap-2">
            {/* City Selector Pill */}
            <div className="relative shrink-0">
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="appearance-none pl-7 pr-6 py-2 rounded-xl text-xs font-bold border border-border/80 bg-surface/80 hover:bg-surface text-foreground shadow-inner outline-none focus:border-primary transition-all cursor-pointer"
              >
                {POPULAR_CITIES.map((c) => (
                  <option key={c} value={c} className="bg-card text-foreground">
                    {c}
                  </option>
                ))}
              </select>
              <MapPin className="w-3.5 h-3.5 text-primary absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              <ChevronDown className="w-3 h-3 text-foreground/50 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Search Input Bar */}
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by coach name, sport, or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface/80 border border-border/80 rounded-xl pl-8.5 pr-8 py-2 text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 placeholder:text-foreground/35 font-medium transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-foreground/10 text-foreground/60 flex items-center justify-center hover:bg-foreground/20 text-[10px]"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Chips Carousel (Horizontal scroll on mobile) */}
          <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar pb-0.5 pt-0.5">
            {[
              { id: 'all', label: 'All Coaches' },
              { id: 'badminton', label: '🏸 Badminton' },
              { id: 'tennis', label: '🎾 Tennis' },
              { id: 'cricket', label: '🏏 Cricket' },
              { id: 'football', label: '⚽ Football' },
              { id: 'table_tennis', label: '🏓 Table Tennis' },
              { id: 'verified', label: '⭐ Senior (5+ Yrs)' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer shrink-0 border active:scale-95 ${
                  activeFilter === f.id
                    ? 'bg-primary text-black border-primary shadow-xs font-black'
                    : 'bg-surface/70 border-border/70 text-foreground/70 hover:bg-surface hover:text-foreground'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── COACHES DIRECTORY LIST / GRID ── */}
      <main className="max-w-7xl mx-auto px-3.5 sm:px-6 py-4 sm:py-6 space-y-4">
        {/* Results Counter Bar */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-foreground/80 font-bold">
            <Award className="w-4 h-4 text-primary shrink-0" />
            <span className="text-xs font-black text-foreground">
              {loading ? 'Searching coaches...' : `${filteredCoaches.length} ${filteredCoaches.length === 1 ? 'Coach' : 'Coaches'} Available`}
            </span>
            {cityFilter !== 'All Cities' && (
              <span className="text-foreground/50 text-[11px] hidden xs:inline truncate">in {cityFilter}</span>
            )}
          </div>

          {isFiltered && (
            <button
              onClick={resetFilters}
              className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="py-16 sm:py-24 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-center text-primary">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
            <p className="text-xs font-bold text-foreground/50">Finding certified coaches...</p>
          </div>
        ) : allCoaches.length === 0 ? (
          /* Empty Directory State */
          <div className="py-12 sm:py-16 text-center space-y-3 bg-surface/50 border border-border/80 rounded-3xl p-6 sm:p-8 max-w-md mx-auto shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-center text-primary mx-auto">
              <Award className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm sm:text-base font-black text-foreground">No Coaches Registered Yet</h3>
              <p className="text-xs text-foreground/60 leading-relaxed max-w-xs mx-auto">
                There are currently no sports coaches or mentors registered in the directory. Verified coaches will appear here once onboarded.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href={isAuthenticated ? '/home' : '/'}
                className="px-4 py-2 rounded-xl bg-primary text-black text-xs font-black uppercase tracking-wider shadow-sm hover:brightness-110 inline-flex items-center gap-2 active:scale-95 transition-all"
              >
                <span>Back to Home</span>
              </Link>
            </div>
          </div>
        ) : filteredCoaches.length === 0 ? (
          /* Search / Filter Mismatch State */
          <div className="py-12 sm:py-16 text-center space-y-3 bg-surface/50 border border-border/80 rounded-3xl p-6 sm:p-8 max-w-md mx-auto shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-foreground/5 border border-border/80 flex items-center justify-center text-foreground/40 mx-auto">
              <Search className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm sm:text-base font-bold text-foreground">No Matching Coaches</h3>
              <p className="text-xs text-foreground/50 leading-relaxed max-w-xs mx-auto">
                We couldn&apos;t find any coaches matching your search filters. Try adjusting your search query.
              </p>
            </div>
            <button
              onClick={resetFilters}
              className="px-4 py-2 rounded-xl bg-primary text-black text-xs font-black uppercase tracking-wider shadow-sm hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : viewMode === 'compact' ? (
          /* Compact List View (Mobile-First) */
          <div className="space-y-2.5 max-w-2xl mx-auto">
            {filteredCoaches.map((coach) => (
              <div key={coach.uuid || coach.id}>
                <CoachMarketplaceCard coach={coach} variant="compact" />
              </div>
            ))}
          </div>
        ) : (
          /* Grid View (Mobile-Optimized Cards) */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filteredCoaches.map((coach) => (
              <div key={coach.uuid || coach.id} className="h-full">
                <CoachMarketplaceCard coach={coach} variant="card" className="h-full shadow-xs" />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Mobile Fixed Bottom Nav */}
      <nav
        className="fixed bottom-0 inset-x-0 h-20 backdrop-blur-xl border-t z-50 px-5 flex items-center justify-between max-w-lg mx-auto fixed-bottom-nav md:hidden"
        style={{
          backgroundColor: 'var(--athlon-navigation)',
          borderColor: 'var(--athlon-border)',
          transform: 'translate3d(0, 0, 0)',
          WebkitTransform: 'translate3d(0, 0, 0)',
        }}
      >
        <Link href="/" className="flex flex-col items-center gap-0.5 w-16 group opacity-80 hover:opacity-100 transition-opacity">
          <Athlon3DIcon type="home" size={32} active={false} />
          <span className="text-[9.5px] font-bold leading-tight" style={{ color: 'var(--athlon-text-muted)' }}>
            Home
          </span>
        </Link>

        <Link href="/tournaments" className="flex flex-col items-center gap-0.5 w-16 group opacity-80 hover:opacity-100 transition-opacity">
          <Athlon3DIcon type="tournaments" size={32} active={false} />
          <span className="text-[9.5px] font-bold leading-tight" style={{ color: 'var(--athlon-text-muted)' }}>
            Tournaments
          </span>
        </Link>

        {/* 3D Circular Elevated Umpire Button */}
        <div className="relative -top-5 flex items-center justify-center">
          <Link
            href="/practice"
            className="w-[60px] h-[60px] rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all border-[3.5px] group relative overflow-hidden shadow-2xl umpire-center-orb"
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

        <Link href="/coaches" className="flex flex-col items-center gap-0.5 w-16 group">
          <Athlon3DIcon type="coaches" size={32} active={true} />
          <span className="text-[9.5px] font-bold text-primary leading-tight">
            Coaches
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
  );
}
