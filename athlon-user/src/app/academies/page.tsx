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
import Image from 'next/image';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { OrganizationService } from '@/lib/api/organization';
import { AcademyStudentService, AcademyBatch, AcademyCourt } from '@/lib/api/academyStudent';
import { Athlon3DIcon } from '@/components/common/Athlon3DIcon';

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
}

const DEFAULT_ACADEMIES: AcademyListing[] = [
  {
    id: 1,
    name: 'Smash Arena Pro Academy',
    sportType: 'Badminton',
    rating: '4.9',
    reviews: '128',
    distance: '2.5 km',
    location: 'Koramangala, Bangalore',
    price: '₹1,500/mo',
    courts: 6,
    tags: ['BWF Certified', 'Pro Shop', 'Coaching Batches', 'Wooden Flooring'],
    image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=800&auto=format&fit=crop',
    featured: true,
    openTiming: '6:00 AM - 11:00 PM',
    phone: '+91 98765 43210',
  },
  {
    id: 2,
    name: 'Elite Sports Club & Academy',
    sportType: 'Badminton',
    rating: '4.7',
    reviews: '84',
    distance: '4.1 km',
    location: 'HSR Layout, Bangalore',
    price: '₹1,400/mo',
    courts: 4,
    tags: ['Wooden Courts', 'Showers', 'Coaching Batches', 'Cafeteria'],
    image: 'https://images.unsplash.com/photo-1599586120429-48281b6f0ece?q=80&w=800&auto=format&fit=crop',
    featured: false,
    openTiming: '5:30 AM - 10:30 PM',
    phone: '+91 98765 43211',
  },
  {
    id: 3,
    name: 'Velocity Badminton Hub',
    sportType: 'Badminton',
    rating: '4.5',
    reviews: '56',
    distance: '6.8 km',
    location: 'Indiranagar, Bangalore',
    price: '₹1,200/mo',
    courts: 3,
    tags: ['Synthetic Flooring', 'Coaching Batches', 'Equipment Rental'],
    image: 'https://images.unsplash.com/photo-1611252758110-6c9f2868853b?q=80&w=800&auto=format&fit=crop',
    featured: false,
    openTiming: 'Open 24 Hours',
    phone: '+91 98765 43212',
  },
  {
    id: 4,
    name: 'Apex Badminton & Fitness Center',
    sportType: 'Badminton',
    rating: '4.8',
    reviews: '92',
    distance: '3.4 km',
    location: 'Whitefield, Bangalore',
    price: '₹1,800/mo',
    courts: 8,
    tags: ['BWF Certified', 'Air Conditioned', 'Pro Shop'],
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=800&auto=format&fit=crop',
    featured: false,
    openTiming: '6:00 AM - 10:00 PM',
    phone: '+91 98765 43213',
  },
];

export default function AcademiesPage() {
  const { isAuthenticated, userUuid, userEmail } = useAuthStore();
  const { personalProfile } = useWorkspaceStore();

  const [activeFilter, setActiveFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'carousel'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [liveAcademies, setLiveAcademies] = useState<AcademyListing[]>([]);
  const [loading, setLoading] = useState(true);

  // Direct Enroll Modal State
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

  // Fetch Live Academies from Backend
  useEffect(() => {
    const fetchAcademies = async () => {
      try {
        setLoading(true);
        const res = await OrganizationService.getAll();
        const orgs = Array.isArray(res) ? res : (res as any)?.data || [];
        const liveOrgs = orgs.filter((o: any) => o.type === 'ACADEMY');

        if (liveOrgs.length > 0) {
          const mapped: AcademyListing[] = liveOrgs.map((org: any, idx: number) => {
            const prof = org.profile;
            const sports = prof?.sportsOffered ? prof.sportsOffered.split(',').map((s: string) => s.trim()) : ['Badminton'];
            const amenitiesList = prof?.amenities ? prof.amenities.split(',').map((a: string) => a.trim()).slice(0, 2) : [];
            const feeString = prof?.monthlyFeeMin 
              ? `₹${prof.monthlyFeeMin.toLocaleString()}${prof?.monthlyFeeMax ? ` - ₹${prof.monthlyFeeMax.toLocaleString()}` : ''}/mo`
              : (prof?.pricePerHour ? `₹${prof.pricePerHour}/hr` : '₹2,000/mo');

            return {
              id: org.uuid || org.id || `org-${idx}`,
              uuid: org.uuid,
              name: org.name,
              sportType: sports[0] || 'Badminton',
              rating: prof?.rating ? prof.rating.toFixed(1) : '4.9',
              reviews: prof?.reviewsCount ? `${prof.reviewsCount}+` : '50+',
              distance: prof?.city ? `${prof.city}` : 'Bangalore',
              location: prof?.address || prof?.city || 'Athlon Academy Center',
              price: feeString,
              courts: prof?.totalCourts || 4,
              tags: [
                ...sports.slice(0, 2),
                prof?.surfaceType || 'BWF Synthetic Mats',
                ...amenitiesList,
              ],
              image: prof?.banner
                ? OrganizationService.getBannerUrl(prof.banner)
                : prof?.logo
                  ? OrganizationService.getLogoUrl(prof.logo)
                  : DEFAULT_ACADEMIES[idx % DEFAULT_ACADEMIES.length].image,
              featured: idx === 0,
              openTiming: prof?.openingTime && prof?.closingTime ? `${prof.openingTime} - ${prof.closingTime}` : '6:00 AM - 10:00 PM',
              phone: prof?.contactPhone || '+91 98765 43210',
              isLiveOrg: true,
            };
          });
          setLiveAcademies(mapped);
        } else {
          setLiveAcademies(DEFAULT_ACADEMIES);
        }
      } catch (err) {
        console.error('Failed to load academies:', err);
        setLiveAcademies(DEFAULT_ACADEMIES);
      } finally {
        setLoading(false);
      }
    };

    fetchAcademies();
  }, []);

  const allAcademies = useMemo(() => {
    if (liveAcademies.length === 0) return DEFAULT_ACADEMIES;
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
          monthlyFee: selectedB?.monthlyFee || 1500,
          feeFrequency: 'MONTHLY',
          feeStatus: 'PENDING',
        });
      }

      showToast(`🎉 Enrolled successfully into ${selectedAcademyForEnroll.name}!`);
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

      {/* ══════════════════════════════════════════════════════════════════════
          HERO & SEARCH BAR SECTION
         ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden border-b border-foreground/10 bg-gradient-to-b from-surface/80 via-surface/40 to-background pt-8 pb-10 px-4 sm:px-8">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto space-y-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-black uppercase tracking-wider">
                <GraduationCap className="w-4 h-4" />
                <span>Athlon Sports Academies</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight">
                Discover Training Academies & Coaching Centers
              </h1>
              <p className="text-xs sm:text-sm text-foreground/60 max-w-2xl font-medium">
                Find certified sports academies, professional coaching batches, and training venues with certified coaches across disciplines.
              </p>
            </div>

            {/* Quick Actions / Link to Dashboard */}
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
                placeholder="Search by academy name, sport (Badminton, Cricket), or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-foreground/30 font-medium transition-all shadow-inner"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar shrink-0">
              {[
                { id: 'all', label: 'All Centers' },
                { id: 'top_rated', label: '⭐ Top Rated' },
                { id: 'coaching', label: '🏸 Coaching' },
                { id: 'bwf', label: '🏆 BWF Certified' },
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

      {/* ══════════════════════════════════════════════════════════════════════
          ACADEMY DIRECTORY GRID
         ══════════════════════════════════════════════════════════════════════ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            <h2 className="text-base sm:text-lg font-black text-foreground">
              Available Academies & Training Batches ({filteredAcademies.length})
            </h2>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-xs font-semibold text-foreground/50">Discovering sports academies...</p>
          </div>
        ) : filteredAcademies.length === 0 ? (
          <div className="py-16 text-center space-y-3 bg-surface/50 border border-white/10 rounded-3xl p-8">
            <GraduationCap className="w-10 h-10 text-foreground/30 mx-auto" />
            <h3 className="text-sm font-black text-foreground">No academies matched your search</h3>
            <p className="text-xs text-foreground/50">Try broadening your search query or removing active filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAcademies.map((academy) => (
              <div
                key={academy.id}
                className="rounded-3xl border border-white/10 bg-surface/80 hover:border-primary/40 transition-all overflow-hidden shadow-xl flex flex-col justify-between group backdrop-blur-xl"
              >
                {/* Academy Banner Image */}
                <div className="relative h-44 w-full overflow-hidden bg-black/40">
                  <img
                    src={academy.image}
                    alt={academy.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary text-black shadow-md flex items-center gap-1">
                      <span>🏸</span>
                      <span>{academy.sportType || 'Badminton'}</span>
                    </span>

                    <div className="flex items-center gap-1 bg-black/70 px-2 py-0.5 rounded-full text-[11px] font-bold text-white backdrop-blur-sm border border-white/10">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span>{academy.rating}</span>
                    </div>
                  </div>

                  {/* Bottom Image Info */}
                  <div className="absolute bottom-3 left-3 right-3 z-10">
                    <h3 className="text-base font-black text-white leading-tight truncate drop-shadow-md">
                      {academy.name}
                    </h3>
                    <div className="flex items-center gap-1 text-[11px] text-white/80 font-medium mt-0.5">
                      <MapPin className="w-3 h-3 text-primary shrink-0" />
                      <span className="truncate">{academy.location}</span>
                    </div>
                  </div>
                </div>

                {/* Academy Details Body */}
                <div className="p-4 space-y-3.5 flex-1 flex flex-col justify-between">
                  {/* Courts, Batches & Amenities */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-foreground/70 bg-background/60 p-2.5 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-1.5 font-bold">
                        <Building2 className="w-3.5 h-3.5 text-blue-400" />
                        <span>{academy.courts} Training Courts</span>
                      </div>
                      <div className="flex items-center gap-1 font-bold text-primary">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{academy.openTiming}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {academy.tags.slice(0, 3).map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-white/5 border border-white/10 text-foreground/70"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Fee & Action Buttons */}
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-foreground/40 block">Training Fee</span>
                      <span className="text-sm font-black font-mono text-emerald-400">{academy.price}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${academy.phone}`}
                        title="Call Academy"
                        className="p-2 rounded-xl bg-surface border border-white/10 hover:bg-white/10 text-foreground/70 transition-colors"
                      >
                        <Phone className="w-4 h-4 text-primary" />
                      </a>

                      <button
                        onClick={() => handleOpenEnrollModal(academy)}
                        className="px-4 py-2 rounded-xl bg-primary text-black font-black text-xs hover:brightness-110 transition-all shadow-md shadow-primary/20 cursor-pointer flex items-center gap-1.5 active:scale-95"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Enroll Now</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

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
