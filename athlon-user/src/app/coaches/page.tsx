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
  UserPlus
} from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { OrganizationService } from '@/lib/api/organization';
import { CoachMarketplaceCard, CoachCardData } from '@/components/marketplace/CoachMarketplaceCard';
import { Athlon3DIcon } from '@/components/common/Athlon3DIcon';

const DEFAULT_COACHES: CoachCardData[] = [
  {
    id: 1,
    name: 'Deepak Raj',
    type: 'COACH',
    sportType: 'Badminton',
    experienceYears: 8,
    city: 'Bangalore',
    state: 'Karnataka',
    address: 'Indiranagar Sports Hub, Bangalore',
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=800&auto=format&fit=crop',
    tags: ['Badminton', 'BWF Level 2', 'Singles Footwork', 'High Performance'],
    description: 'Former state champion and certified BWF Level 2 coach specializing in junior athlete development, tactical deception, and stamina conditioning.',
    profile: {
      sportsOffered: 'Badminton',
      admissionStatus: 'OPEN',
      experienceYears: 8,
      city: 'Bangalore',
      state: 'Karnataka',
      bio: 'BWF Certified High-Performance Badminton Coach',
    },
  },
  {
    id: 2,
    name: 'Vikram Sethi',
    type: 'COACH',
    sportType: 'Tennis',
    experienceYears: 12,
    city: 'Mumbai',
    state: 'Maharashtra',
    address: 'Bandra Lawn Tennis Center, Mumbai',
    image: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=800&auto=format&fit=crop',
    tags: ['Tennis', 'USPTA Certified', 'Serve Mechanics', 'Match Strategy'],
    description: 'Specialist in serve mechanics, baseline agility, and junior tournament match prep with over a decade of tour coaching.',
    profile: {
      sportsOffered: 'Tennis',
      admissionStatus: 'OPEN',
      experienceYears: 12,
      city: 'Mumbai',
      state: 'Maharashtra',
      bio: 'USPTA Elite Tennis Coach & Junior Mentor',
    },
  },
  {
    id: 3,
    name: 'Arun Nair',
    type: 'COACH',
    sportType: 'Cricket',
    experienceYears: 10,
    city: 'Chennai',
    state: 'Tamil Nadu',
    address: 'Marina Cricket Nets, Chennai',
    image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=800&auto=format&fit=crop',
    tags: ['Cricket', 'BCCI Level 1', 'Fast Bowling', 'Power Hitting'],
    description: 'BCCI Level 1 accredited coach focusing on biomechanics of bowling action, injury prevention, and tactical captaincy.',
    profile: {
      sportsOffered: 'Cricket',
      admissionStatus: 'LIMITED',
      experienceYears: 10,
      city: 'Chennai',
      state: 'Tamil Nadu',
      bio: 'BCCI Level 1 Fast Bowling & Batting Specialist',
    },
  },
];

export default function CoachesPage() {
  const { isAuthenticated, userUuid, userEmail } = useAuthStore();
  const { personalProfile } = useWorkspaceStore();

  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [liveCoaches, setLiveCoaches] = useState<CoachCardData[]>([]);
  const [loading, setLoading] = useState(true);

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
              city: prof?.city || 'Bangalore',
              state: prof?.state || 'Karnataka',
              address: prof?.address || prof?.city || 'Coaching Hub',
              image: prof?.banner
                ? OrganizationService.getBannerUrl(prof.banner)
                : prof?.logo
                  ? OrganizationService.getLogoUrl(prof.logo)
                  : DEFAULT_COACHES[idx % DEFAULT_COACHES.length].image,
              tags: sports,
              experienceYears: prof?.experienceYears || 5,
              logo: org.logo || prof?.logo,
              banner: org.banner || prof?.banner,
              description: org.description || prof?.description || prof?.bio,
              profile: prof || org,
            };
          });
          setLiveCoaches(mapped);
        } else {
          setLiveCoaches(DEFAULT_COACHES);
        }
      } catch (err) {
        console.error('Failed to load coaches:', err);
        setLiveCoaches(DEFAULT_COACHES);
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
    if (liveCoaches.length === 0) return DEFAULT_COACHES;
    return liveCoaches;
  }, [liveCoaches]);

  // Filtered List
  const filteredCoaches = useMemo(() => {
    return allCoaches.filter((c) => {
      if (activeFilter === 'badminton' && !c.tags?.some((t) => t.toLowerCase().includes('badminton'))) return false;
      if (activeFilter === 'tennis' && !c.tags?.some((t) => t.toLowerCase().includes('tennis'))) return false;
      if (activeFilter === 'cricket' && !c.tags?.some((t) => t.toLowerCase().includes('cricket'))) return false;
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
  }, [allCoaches, activeFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 selection:bg-primary selection:text-black">
      {/* ── HERO & SEARCH SECTION ── */}
      <section className="relative overflow-hidden border-b border-foreground/10 bg-gradient-to-b from-surface/80 via-surface/40 to-background pt-8 pb-10 px-4 sm:px-8">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto space-y-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-black uppercase tracking-wider">
                <Award className="w-4 h-4" />
                <span>Athlon Certified Coaches</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight">
                Discover Professional Sports Coaches & Mentors
              </h1>
              <p className="text-xs sm:text-sm text-foreground/60 max-w-2xl font-medium">
                Find certified personal coaches, 1-on-1 sparring partners, and high-performance training mentors across sports disciplines.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <Link
                href="/home"
                className="px-4 py-2.5 rounded-xl border border-white/10 bg-surface hover:bg-white/5 text-xs font-bold text-foreground transition-all flex items-center gap-2 shadow-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </Link>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <div className="relative flex-grow">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/40" />
              <input
                type="text"
                placeholder="Search by coach name, sport discipline (Badminton, Cricket), or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-foreground/30 font-medium transition-all shadow-inner"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar shrink-0">
              {[
                { id: 'all', label: 'All Coaches' },
                { id: 'badminton', label: '🏸 Badminton' },
                { id: 'tennis', label: '🎾 Tennis' },
                { id: 'cricket', label: '🏏 Cricket' },
                { id: 'verified', label: '🏅 Senior (5+ Yrs)' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 border ${
                    activeFilter === f.id
                      ? 'bg-primary text-black border-primary shadow-sm font-black'
                      : 'bg-surface border-white/10 text-foreground/70 hover:bg-white/5'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── COACHES DIRECTORY GRID ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            <h2 className="text-base sm:text-lg font-black text-foreground">
              Available Sports Coaches ({filteredCoaches.length})
            </h2>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-xs font-semibold text-foreground/50">Finding certified coaches...</p>
          </div>
        ) : filteredCoaches.length === 0 ? (
          <div className="py-16 text-center space-y-3 bg-surface/50 border border-white/10 rounded-3xl p-8">
            <Award className="w-10 h-10 text-foreground/30 mx-auto" />
            <div className="text-base font-bold text-foreground">No Coaches Found</div>
            <p className="text-xs text-foreground/50 max-w-sm mx-auto">
              We couldn&apos;t find any coaches matching your search filters. Try adjusting your search query.
            </p>
            <button
              onClick={() => {
                setActiveFilter('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-xl bg-primary text-black text-xs font-bold shadow-md cursor-pointer hover:brightness-110"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCoaches.map((coach) => (
              <div key={coach.uuid || coach.id} className="h-full">
                <CoachMarketplaceCard coach={coach} className="h-full shadow-md" />
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
  );
}
