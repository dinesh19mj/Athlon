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
  Navigation,
  Phone,
  Trophy,
  Shield,
  Building2,
  Building,
  Tv,
  Home,
  ArrowRight,
  Filter,
  Sparkles,
  CheckCircle2,
  Calendar,
  X,
  Clock,
  Award,
  LayoutGrid,
  List,
  GalleryHorizontal,
  GraduationCap,
  Users,
  Layers,
  Check,
  Loader2,
  UserPlus
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { OrganizationService } from '@/lib/api/organization';
import { AcademyStudentService, AcademyBatch, AcademyCourt } from '@/lib/api/academyStudent';
import { Athlon3DIcon } from '@/components/common/Athlon3DIcon';
import { AcademyMarketplaceCard } from '@/components/marketplace/AcademyMarketplaceCard';

interface AcademyListing {
  id: string | number;
  uuid?: string;
  name: string;
  sportType?: string;
  rating: string;
  reviews: string;
  distance: string;
  location: string;
  price: string;
  courts: number;
  tags: string[];
  image: string;
  featured: boolean;
  openTiming: string;
  phone: string;
  isLiveOrg?: boolean;
  logo?: string;
  banner?: string;
  description?: string;
  profile?: any;
}

export default function AcademiesPage() {
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

  const [liveAcademies, setLiveAcademies] = useState<AcademyListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'compact'>('grid');

  // Direct Enrollment Modal States
  const [selectedAcademyForEnroll, setSelectedAcademyForEnroll] = useState<AcademyListing | null>(null);
  const [academyBatches, setAcademyBatches] = useState<AcademyBatch[]>([]);
  const [academyCourts, setAcademyCourts] = useState<AcademyCourt[]>([]);
  const [loadingAcademyData, setLoadingAcademyData] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Enroll Form
  const [enrollForm, setEnrollForm] = useState({
    fullName: personalProfile?.name || '',
    phone: '',
    email: userEmail || '',
    level: 'BEGINNER',
    courtUuid: '',
    batchUuid: '',
    emergencyContact: '',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch Live Academies from Backend with timeout handling
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 8000);

    const fetchAcademies = async () => {
      try {
        setLoading(true);
        const res = await OrganizationService.getAll({ signal: controller.signal });
        clearTimeout(timeoutId);
        if (!active) return;

        const orgs = Array.isArray(res) ? res : (res as any)?.data || [];
        const liveOrgs = orgs.filter((o: any) => o.type === 'ACADEMY');

        if (liveOrgs.length > 0) {
          const mapped: AcademyListing[] = liveOrgs.map((org: any, idx: number) => {
            const prof = org.profile;
            const sports = prof?.sportsOffered ? prof.sportsOffered.split(',').map((s: string) => s.trim()) : ['Badminton'];
            const amenitiesList = prof?.amenities ? prof.amenities.split(',').map((a: string) => a.trim()).slice(0, 2) : [];
            const feeString = prof?.monthlyFeeMin
              ? `₹${prof.monthlyFeeMin.toLocaleString()}${prof?.monthlyFeeMax ? ` - ₹${prof.monthlyFeeMax.toLocaleString()}` : ''}/mo`
              : (prof?.pricePerHour ? `₹${prof.pricePerHour}/hr` : undefined);

            return {
              id: org.uuid || org.id || `org-${idx}`,
              uuid: org.uuid,
              name: org.name,
              sportType: sports[0] || 'Badminton',
              rating: prof?.rating ? prof.rating.toFixed(1) : undefined,
              reviews: prof?.reviewsCount ? `${prof.reviewsCount}` : undefined,
              distance: prof?.city ? `${prof.city}` : undefined,
              location: [prof?.address, prof?.city, prof?.state].filter(Boolean).join(', ') || org.location || 'Location TBA',
              price: feeString || 'Fee upon enquiry',
              courts: prof?.totalCourts || undefined,
              tags: [
                ...sports.slice(0, 2),
                ...(prof?.surfaceType ? [prof.surfaceType] : []),
                ...amenitiesList,
              ],
              image: prof?.banner
                ? OrganizationService.getBannerUrl(prof.banner)
                : prof?.logo
                  ? OrganizationService.getLogoUrl(prof.logo)
                  : 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=800&auto=format&fit=crop',
              featured: idx === 0,
              openTiming: prof?.openingTime && prof?.closingTime ? `${prof.openingTime} - ${prof.closingTime}` : 'Timings TBA',
              phone: prof?.contactPhone || '',
              isLiveOrg: true,
              logo: org.logo || prof?.logo,
              banner: org.banner || prof?.banner,
              description: org.description || prof?.description || prof?.bio,
              profile: prof || org,
            };
          });
          setLiveAcademies(mapped);
        } else {
          setLiveAcademies([]);
        }
      } catch (err) {
        console.error('Failed to load academies:', err);
        if (active) setLiveAcademies([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchAcademies();

    const handleOrgSync = () => {
      fetchAcademies();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('athlon-org-updated', handleOrgSync);
      window.addEventListener('storage', (e) => {
        if (e.key === 'athlon_org_updated_time') fetchAcademies();
      });
    }

    return () => {
      active = false;
      clearTimeout(timeoutId);
      if (typeof window !== 'undefined') {
        window.removeEventListener('athlon-org-updated', handleOrgSync);
      }
    };
  }, []);

  const allAcademies = useMemo(() => {
    return liveAcademies;
  }, [liveAcademies]);

  const featured = allAcademies.find((a) => a.featured) || allAcademies[0];

  // Filtered List
  const filteredAcademies = useMemo(() => {
    return allAcademies.filter((a) => {
      if (activeFilter === 'top_rated' && parseFloat(a.rating) < 4.7) return false;
      if (activeFilter === 'coaching' && !a.tags.some((t) => t.toLowerCase().includes('coaching') || t.toLowerCase().includes('training'))) return false;
      if (activeFilter === 'bwf' && !a.tags.some((t) => t.toLowerCase().includes('bwf'))) return false;
      if (activeFilter === '24_7' && !a.tags.some((t) => t.toLowerCase().includes('24/7') || a.openTiming.includes('24 Hours'))) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        a.name.toLowerCase().includes(q) ||
        a.location.toLowerCase().includes(q) ||
        (a.sportType && a.sportType.toLowerCase().includes(q)) ||
        a.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [allAcademies, activeFilter, searchQuery]);

  const isFiltered = activeFilter !== 'all' || searchQuery.trim().length > 0;

  // Open Direct Enroll Modal
  const handleOpenEnrollModal = async (academy: AcademyListing) => {
    setSelectedAcademyForEnroll(academy);
    setEnrollForm({
      fullName: personalProfile?.name || '',
      phone: '',
      email: userEmail || '',
      level: 'BEGINNER',
      courtUuid: '',
      batchUuid: '',
      emergencyContact: '',
    });

    if (academy.uuid) {
      try {
        setLoadingAcademyData(true);
        const [batchesRes, courtsRes] = await Promise.allSettled([
          AcademyStudentService.getBatches(academy.uuid),
          AcademyStudentService.getCourts(academy.uuid),
        ]);
        if (batchesRes.status === 'fulfilled') setAcademyBatches(batchesRes.value || []);
        if (courtsRes.status === 'fulfilled') setAcademyCourts(courtsRes.value || []);
      } catch (err) {
        console.error('Failed to load academy batches:', err);
      } finally {
        setLoadingAcademyData(false);
      }
    } else {
      setAcademyBatches([]);
      setAcademyCourts([]);
    }
  };

  // Submit Direct Enrollment
  const handleSubmitEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAcademyForEnroll || !enrollForm.fullName.trim()) return;

    try {
      setEnrolling(true);
      const selectedB = academyBatches.find((b) => b.batchUuid === enrollForm.batchUuid);
      const selectedC = academyCourts.find((c) => c.courtUuid === (enrollForm.courtUuid || selectedB?.courtUuid));

      if (selectedAcademyForEnroll.uuid) {
        await AcademyStudentService.enrollStudent({
          organizationUuid: selectedAcademyForEnroll.uuid,
          userUuid: userUuid || undefined,
          fullName: enrollForm.fullName.trim(),
          level: enrollForm.level,
          courtUuid: selectedC?.courtUuid || selectedB?.courtUuid,
          batchUuid: selectedB?.batchUuid,
          batchName: selectedB?.batchName,
          batchTiming: selectedB ? `${selectedB.startTime} - ${selectedB.endTime}` : undefined,
          sportType: selectedAcademyForEnroll.sportType || 'Badminton',
          parentPhone: enrollForm.phone,
          parentEmail: enrollForm.email,
          emergencyContact: enrollForm.emergencyContact,
          status: 'ENQUIRY',
        });
      }

      showToast(`🎉 Application submitted to ${selectedAcademyForEnroll.name}! The academy will review and confirm your admission.`);
      setSelectedAcademyForEnroll(null);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to submit enrollment. Please try again.');
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 selection:bg-primary selection:text-black">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2.5 bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md animate-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* ── SLEEK MOBILE-FIRST HEADER & SEARCH HUB ── */}
      <section className="relative overflow-hidden border-b border-border/80 bg-gradient-to-b from-card/90 via-surface/60 to-background pt-3 sm:pt-6 pb-4 sm:pb-6 px-3.5 sm:px-6">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

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
                    Athlon Academies
                  </span>
                  <span className="hidden xs:inline-block text-[10px] text-foreground/40 font-semibold">•</span>
                  <span className="hidden xs:inline-block text-[10px] text-foreground/50 font-bold truncate">
                    Training Centers
                  </span>
                </div>
                <h1 className="text-base sm:text-xl md:text-2xl font-black text-foreground tracking-tight truncate mt-0.5">
                  Training Academies &amp; Hubs
                </h1>
              </div>
            </div>

            {/* View Mode Switcher (Grid / List) */}
            <div className="flex items-center p-1 rounded-xl bg-surface/80 border border-border/80 shrink-0 shadow-xs">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                title="Grid Card View"
                className={`p-1.5 rounded-lg text-xs transition-all ${
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
                className={`p-1.5 rounded-lg text-xs transition-all ${
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
              href="/academies"
              className="px-3 py-1.5 rounded-xl text-[11px] font-black bg-primary text-black flex items-center gap-1.5 shadow-xs shrink-0"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Academies</span>
            </Link>
            <Link
              href="/venues"
              className="px-3 py-1.5 rounded-xl text-[11px] font-bold text-foreground/70 hover:text-foreground border border-border/70 hover:bg-surface flex items-center gap-1.5 shrink-0 transition-all"
            >
              <Building2 className="w-3.5 h-3.5 text-primary" />
              <span>Courts &amp; Turfs</span>
            </Link>
            <Link
              href="/coaches"
              className="px-3 py-1.5 rounded-xl text-[11px] font-bold text-foreground/70 hover:text-foreground border border-border/70 hover:bg-surface flex items-center gap-1.5 shrink-0 transition-all"
            >
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>Coaches</span>
            </Link>
          </div>

          {/* Search Input Bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by academy name, sport, or location..."
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

          {/* Filter Chips Carousel (Horizontal scroll on mobile) */}
          <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar pb-0.5 pt-0.5">
            {[
              { id: 'all', label: 'All Centers' },
              { id: 'top_rated', label: '⭐ Top Rated' },
              { id: 'coaching', label: '🏸 Coaching' },
              { id: 'bwf', label: '🏆 BWF Certified' },
              { id: 'tennis', label: '🎾 Tennis' },
              { id: 'cricket', label: '🏏 Cricket' },
              { id: '24_7', label: '⏰ Open 24/7' },
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

      {/* ── ACADEMIES DIRECTORY LIST / GRID ── */}
      <main className="max-w-7xl mx-auto px-3.5 sm:px-6 py-4 sm:py-6 space-y-4">
        {/* Results Counter Bar */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-foreground/80 font-bold">
            <Building2 className="w-4 h-4 text-primary shrink-0" />
            <span className="text-xs font-black text-foreground">
              {loading ? 'Discovering academies...' : `${filteredAcademies.length} ${filteredAcademies.length === 1 ? 'Academy' : 'Academies'} Available`}
            </span>
          </div>

          {isFiltered && (
            <button
              onClick={() => {
                setActiveFilter('all');
                setSearchQuery('');
              }}
              className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
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
            <p className="text-xs font-bold text-foreground/50">Discovering sports academies...</p>
          </div>
        ) : allAcademies.length === 0 ? (
          /* Empty Directory State */
          <div className="py-12 sm:py-16 text-center space-y-3 bg-surface/50 border border-border/80 rounded-3xl p-6 sm:p-8 max-w-md mx-auto shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-center text-primary mx-auto">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm sm:text-base font-black text-foreground">No Academies Registered Yet</h3>
              <p className="text-xs text-foreground/60 leading-relaxed max-w-xs mx-auto">
                There are currently no sports academies registered in the directory. Verified training academies will appear here once onboarded.
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
        ) : filteredAcademies.length === 0 ? (
          /* Search / Filter Mismatch State */
          <div className="py-12 sm:py-16 text-center space-y-3 bg-surface/50 border border-border/80 rounded-3xl p-6 sm:p-8 max-w-md mx-auto shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-foreground/5 border border-border/80 flex items-center justify-center text-foreground/40 mx-auto">
              <Search className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm sm:text-base font-bold text-foreground">No Matching Academies</h3>
              <p className="text-xs text-foreground/50 leading-relaxed max-w-xs mx-auto">
                We couldn&apos;t find any academies matching your search filters. Try adjusting your search query.
              </p>
            </div>
            <button
              onClick={() => {
                setActiveFilter('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-xl bg-primary text-black text-xs font-black uppercase tracking-wider shadow-sm hover:brightness-110 active:scale-95 transition-all"
            >
              Reset Filters
            </button>
          </div>
        ) : viewMode === 'compact' ? (
          /* Compact List View (Mobile-First) */
          <div className="space-y-2.5 max-w-2xl mx-auto">
            {filteredAcademies.map((academy) => (
              <div key={academy.id}>
                <AcademyMarketplaceCard
                  academy={academy}
                  variant="compact"
                  onEnrollClick={() => handleOpenEnrollModal(academy)}
                />
              </div>
            ))}
          </div>
        ) : (
          /* Grid View (Mobile-Optimized Cards) */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filteredAcademies.map((academy) => (
              <div key={academy.id} className="h-full">
                <AcademyMarketplaceCard
                  academy={academy}
                  variant="card"
                  className="h-full shadow-xs"
                  onEnrollClick={() => handleOpenEnrollModal(academy)}
                />
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

        <Link href="/academies" className="flex flex-col items-center gap-0.5 w-16 group">
          <Athlon3DIcon type="academies" size={32} active={true} />
          <span className="text-[9.5px] font-bold text-primary leading-tight">
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

      {/* ══════════════════════════════════════════════════════════════════════
          DIRECT ENROLLMENT MODAL (ATHLETE / PARENT SELF-ENROLL)
         ══════════════════════════════════════════════════════════════════════ */}
      {selectedAcademyForEnroll && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-surface border border-white/10 rounded-2xl sm:rounded-3xl max-w-lg w-full max-h-[85vh] sm:max-h-[88vh] overflow-y-auto p-4 sm:p-6 space-y-4 shadow-2xl relative">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary border border-primary/30 flex items-center justify-center font-bold">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-foreground">
                    Enroll in {selectedAcademyForEnroll.name}
                  </h3>
                  <p className="text-[11px] text-foreground/50">
                    Direct athlete admission into coaching batches
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAcademyForEnroll(null)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-foreground/50 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingAcademyData ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
                <p className="text-xs text-foreground/50">Fetching available batches & courts...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitEnrollment} className="space-y-3.5 text-xs">

                {/* 1. Athlete Information */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-black uppercase text-primary tracking-wider">
                    1. Athlete Information
                  </h4>

                  <div>
                    <label className="text-[11px] font-bold text-foreground/60 block mb-1">Athlete Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aarav Patel"
                      value={enrollForm.fullName}
                      onChange={(e) => setEnrollForm({ ...enrollForm, fullName: e.target.value })}
                      className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-primary text-xs sm:text-sm font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[11px] font-bold text-foreground/60 block mb-1">Contact Phone *</label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={enrollForm.phone}
                        onChange={(e) => setEnrollForm({ ...enrollForm, phone: e.target.value })}
                        className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-primary font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-foreground/60 block mb-1">Email Address</label>
                      <input
                        type="email"
                        placeholder="athlete@gmail.com"
                        value={enrollForm.email}
                        onChange={(e) => setEnrollForm({ ...enrollForm, email: e.target.value })}
                        className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Skill Level & Batch Selection */}
                <div className="space-y-2.5 pt-2 border-t border-white/10">
                  <h4 className="text-xs font-black uppercase text-primary tracking-wider">
                    2. Select Training Batch
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[11px] font-bold text-foreground/60 block mb-1">Current Skill Level</label>
                      <select
                        value={enrollForm.level}
                        onChange={(e) => setEnrollForm({ ...enrollForm, level: e.target.value })}
                        className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-primary cursor-pointer"
                      >
                        <option value="BEGINNER">Beginner</option>
                        <option value="INTERMEDIATE">Intermediate</option>
                        <option value="ADVANCED">Advanced</option>
                        <option value="ELITE">Elite</option>
                        <option value="PRO">Pro</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-foreground/60 block mb-1">Preferred Batch / Schedule</label>
                      <select
                        value={enrollForm.batchUuid}
                        onChange={(e) => setEnrollForm({ ...enrollForm, batchUuid: e.target.value })}
                        className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-primary cursor-pointer"
                      >
                        {academyBatches.length === 0 ? (
                          <option value="">General Coaching Batch (Open)</option>
                        ) : (
                          <>
                            <option value="">Select Training Batch</option>
                            {academyBatches.map((b) => (
                              <option key={b.batchUuid} value={b.batchUuid}>
                                {b.batchName} ({b.startTime || ''} - {b.endTime || ''})
                              </option>
                            ))}
                          </>
                        )}
                      </select>
                    </div>
                  </div>
                </div>

                {/* 3. Emergency Contact */}
                <div className="space-y-2.5 pt-2 border-t border-white/10">
                  <div>
                    <label className="text-[11px] font-bold text-foreground/60 block mb-1">Emergency Contact Number</label>
                    <input
                      type="tel"
                      placeholder="e.g. +91 91234 56789"
                      value={enrollForm.emergencyContact}
                      onChange={(e) => setEnrollForm({ ...enrollForm, emergencyContact: e.target.value })}
                      className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                {/* Sticky Action Footer */}
                <div className="sticky bottom-0 bg-surface/95 backdrop-blur-md pt-3 pb-1 border-t border-white/10 flex items-center justify-end gap-2 -mx-4 -mb-4 px-4 sm:-mx-6 sm:-mb-6 sm:px-6 z-20">
                  <button
                    type="button"
                    onClick={() => setSelectedAcademyForEnroll(null)}
                    className="px-4 py-2 rounded-xl bg-surface border border-white/10 hover:bg-white/5 text-foreground/70 font-bold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={enrolling || !enrollForm.fullName.trim()}
                    className="px-5 py-2 rounded-xl bg-primary text-black font-black hover:brightness-110 transition-all shadow-lg shadow-primary/20 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {enrolling && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>Confirm Admission</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
