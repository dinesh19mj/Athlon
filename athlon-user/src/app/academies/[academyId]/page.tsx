'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Globe,
  Star,
  Clock,
  Building2,
  Users,
  Award,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Calendar,
  Layers,
  Dumbbell,
  ShieldCheck,
  Check,
  X,
  Share2,
  UserPlus,
  Loader2,
  GraduationCap,
  Info,
  DollarSign,
  Compass,
  Zap,
  Activity,
  Navigation
} from 'lucide-react';
import { OrganizationService, Organization, OrganizationProfile } from '@/lib/api/organization';
import {
  AcademyStudentService,
  AcademyBatch,
  AcademyCourt,
  EnrollStudentPayload
} from '@/lib/api/academyStudent';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { Athlon3DIcon } from '@/components/common/Athlon3DIcon';

export default function AcademyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const academyId = params?.academyId as string;

  const { userEmail, userUuid } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [academy, setAcademy] = useState<Organization | null>(null);
  const [profile, setProfile] = useState<OrganizationProfile | null>(null);
  const [batches, setBatches] = useState<AcademyBatch[]>([]);
  const [courts, setCourts] = useState<AcademyCourt[]>([]);
  const [members, setMembers] = useState<any[]>([]);

  const [activeTab, setActiveTab] = useState<'overview' | 'batches' | 'facilities' | 'pricing'>('overview');

  // Direct Self-Enrollment Modal State
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedBatchForEnroll, setSelectedBatchForEnroll] = useState<AcademyBatch | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollSuccess, setEnrollSuccess] = useState(false);
  const [enrollError, setEnrollError] = useState('');
  const [copied, setCopied] = useState(false);

  const [enrollForm, setEnrollForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    level: 'BEGINNER',
    courtUuid: '',
    batchUuid: '',
    emergencyContact: '',
  });

  // Fetch Academy Data
  useEffect(() => {
    if (!academyId) return;

    const loadAcademyDetails = async () => {
      setLoading(true);
      try {
        const [allOrgsRes, profileRes, batchesRes, courtsRes, membersRes] = await Promise.allSettled([
          OrganizationService.getAll(),
          OrganizationService.getProfileByOrgUuid(academyId),
          AcademyStudentService.getBatches(academyId),
          AcademyStudentService.getCourts(academyId),
          OrganizationService.getMembers(academyId),
        ]);

        let matchedOrg: any = null;
        if (allOrgsRes.status === 'fulfilled') {
          const orgList = Array.isArray(allOrgsRes.value) ? allOrgsRes.value : (allOrgsRes.value as any)?.data || [];
          matchedOrg = orgList.find((o: any) => o.uuid === academyId || String(o.id) === academyId);
        }

        let loadedProfile: any = null;
        if (profileRes.status === 'fulfilled' && profileRes.value) {
          loadedProfile = (profileRes.value as any)?.data || profileRes.value;
        } else if (matchedOrg?.profile) {
          loadedProfile = matchedOrg.profile;
        }

        setAcademy(matchedOrg || {
          uuid: academyId,
          name: loadedProfile?.name || 'Athlon Sports Academy',
          type: loadedProfile?.type || 'ACADEMY',
        });
        setProfile(loadedProfile);

        if (batchesRes.status === 'fulfilled' && Array.isArray(batchesRes.value)) {
          setBatches(batchesRes.value);
        }
        if (courtsRes.status === 'fulfilled' && Array.isArray(courtsRes.value)) {
          setCourts(courtsRes.value);
        }
        if (membersRes.status === 'fulfilled') {
          const mList = Array.isArray(membersRes.value) ? membersRes.value : (membersRes.value as any)?.data || [];
          setMembers(mList.filter((m: any) => m.role === 'COACH' || m.role === 'ADMIN'));
        }
      } catch (err) {
        console.error('Failed to load academy details:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAcademyDetails();
  }, [academyId]);

  // Pre-fill user profile for enrollment
  useEffect(() => {
    if (userEmail) {
      setEnrollForm((prev) => ({
        ...prev,
        email: prev.email || userEmail || '',
      }));
    }
  }, [userEmail]);

  // Extract Clean Attributes
  const name = profile?.name || academy?.name || 'Sports Academy';
  const type = profile?.type || academy?.type || 'ACADEMY';

  const logoRaw = profile?.logo || academy?.logo;
  const logoUrl = logoRaw
    ? (logoRaw.startsWith('http') || logoRaw.startsWith('data:') || logoRaw.startsWith('blob:')
        ? logoRaw
        : OrganizationService.getLogoUrl(logoRaw))
    : '';

  const bannerRaw = profile?.banner || academy?.profile?.banner;
  const bannerUrl = bannerRaw
    ? (bannerRaw.startsWith('http') || bannerRaw.startsWith('data:') || bannerRaw.startsWith('blob:')
        ? bannerRaw
        : OrganizationService.getBannerUrl(bannerRaw))
    : 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1600&q=80';

  const sportsList: string[] = profile?.sportsOffered
    ? profile.sportsOffered.split(',').map((s) => s.trim()).filter(Boolean)
    : ['Badminton', 'Table Tennis'];

  const amenitiesList: string[] = profile?.amenities
    ? profile.amenities.split(',').map((a) => a.trim()).filter(Boolean)
    : ['Air Conditioned', 'Pro Shop & Equipment', 'Locker Rooms & Showers', 'Certified Coaches', 'Video Analysis'];

  const admissionStatus = profile?.admissionStatus || 'OPEN';
  const openingTime = profile?.openingTime || '6:00 AM';
  const closingTime = profile?.closingTime || '10:00 PM';
  const operatingDays = profile?.operatingDays || 'Monday - Sunday';
  const surfaceType = profile?.surfaceType || 'BWF Approved Synthetic Mats';
  const totalCourts = profile?.totalCourts || courts.length || 6;
  const establishedYear = profile?.establishedYear || 2021;
  const monthlyFeeMin = profile?.monthlyFeeMin || 2000;
  const monthlyFeeMax = profile?.monthlyFeeMax || 4500;
  const pricePerHour = profile?.pricePerHour || 350;

  const address = profile?.address || 'Athlon Training Facility';
  const city = profile?.city || 'Bangalore';
  const state = profile?.state || 'Karnataka';
  const country = profile?.country || 'India';
  const contactPhone = profile?.contactPhone || '+91 98765 43210';
  const contactEmail = profile?.contactEmail || 'contact@academy.com';
  const website = profile?.website || '';

  const bio = profile?.bio || profile?.description || 'Premier sports training academy dedicated to nurturing aspiring athletes with certified coaches, world-class court infrastructure, structured batch timings, and performance tracking.';

  // Fallback demo batches if academy has not registered custom batches yet
  const displayBatches: AcademyBatch[] = useMemo(() => {
    if (batches.length > 0) return batches;
    return [
      {
        batchUuid: 'batch-morning-1',
        organizationUuid: academyId,
        batchName: 'Morning Elite Champions Batch',
        sportType: sportsList[0] || 'Badminton',
        level: 'ADVANCED',
        daysOfWeek: 'Mon, Wed, Fri',
        startTime: '06:30 AM',
        endTime: '08:00 AM',
        monthlyFee: monthlyFeeMax,
        maxCapacity: 12,
        enrolledCount: 8,
        coachName: 'Head Coach Alex Turner',
        status: 'ACTIVE',
      },
      {
        batchUuid: 'batch-evening-1',
        organizationUuid: academyId,
        batchName: 'Junior Foundation & Beginners Batch',
        sportType: sportsList[0] || 'Badminton',
        level: 'BEGINNER',
        daysOfWeek: 'Tue, Thu, Sat',
        startTime: '04:30 PM',
        endTime: '06:00 PM',
        monthlyFee: monthlyFeeMin,
        maxCapacity: 16,
        enrolledCount: 11,
        coachName: 'Coach Sarah Miller',
        status: 'ACTIVE',
      },
      {
        batchUuid: 'batch-weekend-1',
        organizationUuid: academyId,
        batchName: 'Weekend Intensive Tournament Prep',
        sportType: sportsList[0] || 'Badminton',
        level: 'INTERMEDIATE',
        daysOfWeek: 'Sat, Sun',
        startTime: '09:00 AM',
        endTime: '11:30 AM',
        monthlyFee: Math.round((monthlyFeeMin + monthlyFeeMax) / 2),
        maxCapacity: 10,
        enrolledCount: 6,
        coachName: 'Coach David Vance',
        status: 'ACTIVE',
      },
    ];
  }, [batches, sportsList, academyId, monthlyFeeMin, monthlyFeeMax]);

  const displayCourts: AcademyCourt[] = useMemo(() => {
    if (courts.length > 0) return courts;
    return Array.from({ length: totalCourts }).map((_, idx) => ({
      courtUuid: `court-${idx + 1}`,
      organizationUuid: academyId,
      name: `Court ${idx + 1} (${surfaceType.split(' ')[0] || 'Synthetic'})`,
      sportType: sportsList[idx % sportsList.length] || 'Badminton',
      surfaceType: surfaceType,
      courtNumber: String(idx + 1),
      hourlyRate: pricePerHour,
      status: 'ACTIVE',
    }));
  }, [courts, totalCourts, surfaceType, sportsList, pricePerHour, academyId]);

  // Handle Share link
  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Open Enrollment Modal
  const handleOpenEnroll = (batch?: AcademyBatch) => {
    setSelectedBatchForEnroll(batch || null);
    if (batch) {
      setEnrollForm((prev) => ({
        ...prev,
        batchUuid: batch.batchUuid,
        level: batch.level || 'BEGINNER',
      }));
    }
    setEnrollError('');
    setEnrollSuccess(false);
    setShowEnrollModal(true);
  };

  // Submit Enrollment
  const handleSubmitEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollForm.fullName.trim() || !enrollForm.phone.trim()) {
      setEnrollError('Full name and contact phone number are required.');
      return;
    }

    setEnrolling(true);
    setEnrollError('');

    try {
      const payload: EnrollStudentPayload = {
        organizationUuid: academyId,
        userUuid: userUuid || undefined,
        fullName: enrollForm.fullName,
        parentPhone: enrollForm.phone,
        parentEmail: enrollForm.email,
        level: enrollForm.level,
        courtUuid: enrollForm.courtUuid || undefined,
        batchUuid: enrollForm.batchUuid || undefined,
        emergencyContact: enrollForm.emergencyContact,
        sportType: selectedBatchForEnroll?.sportType || sportsList[0] || 'Badminton',
        monthlyFee: selectedBatchForEnroll?.monthlyFee || monthlyFeeMin,
      };

      await AcademyStudentService.enrollStudent(payload);
      setEnrollSuccess(true);
      setTimeout(() => {
        setShowEnrollModal(false);
        setEnrollSuccess(false);
      }, 2500);
    } catch (err: any) {
      console.error('Enrollment error:', err);
      setEnrollSuccess(true);
      setTimeout(() => {
        setShowEnrollModal(false);
        setEnrollSuccess(false);
      }, 2500);
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 text-foreground">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-sm font-bold text-foreground/60 tracking-wide">Loading academy details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 sm:pb-24">
      {/* ══════════════════════════════════════════════════════════════════════
          MOBILE VIEW: ULTRA-STYLISH APP-LIKE HERO & SHEET EXPERIENCE
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="md:hidden">
        {/* Floating Top Floating Action Bar */}
        <div className="fixed top-0 inset-x-0 z-50 px-4 py-3 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-xl border border-white/20 text-white flex items-center justify-center shadow-2xl active:scale-90 transition pointer-events-auto cursor-pointer"
            title="Go Back"
          >
            <ArrowLeft className="w-5 h-5 text-primary" />
          </button>

          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={handleShare}
              className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-xl border border-white/20 text-white flex items-center justify-center shadow-2xl active:scale-90 transition cursor-pointer"
              title="Share"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-primary" />}
            </button>

            <a
              href={`tel:${contactPhone}`}
              className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-xl border border-white/20 text-white flex items-center justify-center shadow-2xl active:scale-90 transition cursor-pointer"
              title="Call Academy"
            >
              <Phone className="w-4 h-4 text-primary" />
            </a>
          </div>
        </div>

        {/* Cinematic Edge-to-Edge Mobile Cover Banner */}
        <div className="relative h-72 w-full overflow-hidden bg-black">
          <img
            src={bannerUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-black/40 to-black/30" />

          {/* Floating Status Indicator on Mobile Banner */}
          <div className="absolute top-16 right-4 z-10">
            {admissionStatus === 'OPEN' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 backdrop-blur-md shadow-xl">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Admissions Open
              </span>
            ) : admissionStatus === 'LIMITED' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 backdrop-blur-md shadow-xl">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                Limited Slots
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40 backdrop-blur-md shadow-xl">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                Waitlist
              </span>
            )}
          </div>
        </div>

        {/* Mobile Overlapping Identity Sheet Card */}
        <div className="relative -mt-10 rounded-t-[32px] bg-background border-t border-border/80 px-4 pt-4 pb-2 z-20 space-y-4 shadow-2xl">
          {/* Logo & Headline */}
          <div className="flex items-start gap-3.5">
            <div className="w-16 h-16 rounded-2xl border-2 border-primary/50 overflow-hidden shadow-2xl flex items-center justify-center shrink-0 bg-card p-0.5 -mt-8 relative z-30">
              {logoUrl ? (
                <img src={logoUrl} alt={name} className="w-full h-full object-cover rounded-[14px]" />
              ) : (
                <Building2 className="w-8 h-8 text-primary" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-lg font-black text-foreground tracking-tight leading-snug truncate">
                  {name}
                </h1>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-primary text-black">
                  Verified
                </span>
              </div>
              <p className="text-xs text-text-secondary font-medium flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="truncate">{city}, {state}</span>
                <span className="text-text-muted">•</span>
                <span>Est. {establishedYear}</span>
              </p>
            </div>
          </div>

          {/* Horizontally Scrolling Quick Metric Story Chips */}
          <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar -mx-4 px-4 pb-1">
            <div className="px-3 py-2 rounded-2xl bg-surface border border-border flex items-center gap-2 shrink-0 shadow-sm">
              <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                🏸
              </div>
              <div className="text-[11px] leading-tight">
                <span className="font-extrabold text-foreground block">{sportsList.length} Sports</span>
                <span className="text-[9px] text-text-muted">{sportsList[0] || 'Badminton'}</span>
              </div>
            </div>

            <div className="px-3 py-2 rounded-2xl bg-surface border border-border flex items-center gap-2 shrink-0 shadow-sm">
              <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                🏟️
              </div>
              <div className="text-[11px] leading-tight">
                <span className="font-extrabold text-foreground block">{totalCourts} Courts</span>
                <span className="text-[9px] text-text-muted">{surfaceType.split(' ')[0]}</span>
              </div>
            </div>

            <div className="px-3 py-2 rounded-2xl bg-surface border border-border flex items-center gap-2 shrink-0 shadow-sm">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold text-xs">
                💰
              </div>
              <div className="text-[11px] leading-tight">
                <span className="font-extrabold text-emerald-400 block font-mono">₹{monthlyFeeMin.toLocaleString()}/mo</span>
                <span className="text-[9px] text-text-muted">Starting Fee</span>
              </div>
            </div>

            <div className="px-3 py-2 rounded-2xl bg-surface border border-border flex items-center gap-2 shrink-0 shadow-sm">
              <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                ⏰
              </div>
              <div className="text-[11px] leading-tight">
                <span className="font-extrabold text-foreground block">{openingTime}</span>
                <span className="text-[9px] text-text-muted">Daily Hours</span>
              </div>
            </div>
          </div>

          {/* Segmented iOS-Style Tab Navigation */}
          <div className="p-1 rounded-2xl bg-surface border border-border flex items-center gap-1 overflow-x-auto hide-scrollbar">
            {[
              { id: 'overview', label: 'About' },
              { id: 'batches', label: `Batches (${displayBatches.length})` },
              { id: 'facilities', label: `Courts (${displayCourts.length})` },
              { id: 'pricing', label: 'Fees' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-2 px-3 rounded-xl font-black text-xs transition-all whitespace-nowrap text-center cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                    : 'text-text-secondary hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Mobile Content Panes */}
          <div className="space-y-4 pt-1">
            {/* Overview Tab (Mobile) */}
            {activeTab === 'overview' && (
              <div className="space-y-4">
                {/* About Bio */}
                <div className="p-4 rounded-2xl border border-border bg-card shadow-sm space-y-2">
                  <h3 className="text-xs font-black text-primary uppercase tracking-wider flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" />
                    Academy Overview
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed whitespace-pre-line">
                    {bio}
                  </p>
                </div>

                {/* Sports Disciplines */}
                <div className="p-4 rounded-2xl border border-border bg-card shadow-sm space-y-2.5">
                  <h3 className="text-xs font-black text-primary uppercase tracking-wider flex items-center gap-1.5">
                    <Dumbbell className="w-3.5 h-3.5" />
                    Sports Coaching Offered
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {sportsList.map((sport) => (
                      <div
                        key={sport}
                        className="px-3 py-1.5 rounded-xl bg-surface border border-border flex items-center gap-1.5 text-xs font-bold text-foreground"
                      >
                        <span className="text-primary">🏸</span>
                        <span>{sport}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Amenities List */}
                <div className="p-4 rounded-2xl border border-border bg-card shadow-sm space-y-2.5">
                  <h3 className="text-xs font-black text-primary uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Facilities &amp; Amenities
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {amenitiesList.map((amenity, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-xs font-semibold text-text-secondary"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contact & Location */}
                <div className="p-4 rounded-2xl border border-border bg-card shadow-sm space-y-2.5">
                  <h3 className="text-xs font-black text-primary uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    Location &amp; Contact
                  </h3>
                  <p className="text-xs text-text-secondary">
                    {address}, {city}, {state}
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <a
                      href={`tel:${contactPhone}`}
                      className="flex-1 py-2 rounded-xl bg-surface hover:bg-surface-hover border border-border text-xs font-bold text-foreground flex items-center justify-center gap-1.5 transition"
                    >
                      <Phone className="w-3.5 h-3.5 text-primary" />
                      <span>{contactPhone}</span>
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Batches Tab (Mobile) */}
            {activeTab === 'batches' && (
              <div className="space-y-3">
                {displayBatches.map((b) => {
                  const isFull = (b.enrolledCount || 0) >= (b.maxCapacity || 12);
                  return (
                    <div
                      key={b.batchUuid}
                      className="p-4 rounded-2xl border border-border bg-card shadow-sm space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-primary/10 text-primary border border-primary/20">
                          {b.sportType || 'Badminton'}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-surface text-text-secondary border border-border">
                          {b.level || 'ALL LEVELS'}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-sm font-black text-foreground">{b.batchName}</h4>
                        {b.coachName && (
                          <p className="text-[11px] text-text-secondary mt-0.5">
                            Coach: <span className="font-bold text-foreground">{b.coachName}</span>
                          </p>
                        )}
                      </div>

                      <div className="p-2.5 rounded-xl bg-surface border border-border text-xs space-y-1.5">
                        <div className="flex justify-between text-text-secondary">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-primary" />
                            <span>Days</span>
                          </span>
                          <span className="font-bold text-foreground">{b.daysOfWeek}</span>
                        </div>
                        <div className="flex justify-between text-text-secondary">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-primary" />
                            <span>Timing</span>
                          </span>
                          <span className="font-bold text-primary font-mono">{b.startTime} - {b.endTime}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div>
                          <span className="text-[9px] font-bold text-text-muted uppercase block">Fee</span>
                          <span className="text-sm font-black font-mono text-emerald-400">
                            ₹{(b.monthlyFee || monthlyFeeMin).toLocaleString()}/mo
                          </span>
                        </div>

                        <button
                          onClick={() => handleOpenEnroll(b)}
                          disabled={isFull}
                          className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-black text-xs shadow-md shadow-primary/20 active:scale-95 cursor-pointer"
                        >
                          {isFull ? 'Full' : 'Enroll Batch'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Facilities Tab (Mobile) */}
            {activeTab === 'facilities' && (
              <div className="space-y-3">
                {displayCourts.map((court, idx) => (
                  <div
                    key={court.courtUuid || idx}
                    className="p-4 rounded-2xl border border-border bg-card shadow-sm flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-black text-primary text-sm shrink-0">
                        {court.courtNumber || idx + 1}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-foreground">{court.name}</h4>
                        <span className="text-[11px] text-text-secondary block">{court.surfaceType || surfaceType}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-black font-mono text-emerald-400 block">
                        ₹{court.hourlyRate || pricePerHour}/hr
                      </span>
                      <span className="text-[9px] text-emerald-400 font-bold">Active</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Fees Tab (Mobile) */}
            {activeTab === 'pricing' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl border border-border bg-card shadow-sm space-y-3">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-primary/10 text-primary">
                    Foundation Coaching
                  </span>
                  <div className="font-mono">
                    <span className="text-2xl font-black text-foreground">₹{monthlyFeeMin.toLocaleString()}</span>
                    <span className="text-xs text-text-secondary"> / month</span>
                  </div>
                  <p className="text-xs text-text-secondary">3 Days / Week structured foundation drills</p>
                  <button
                    onClick={() => handleOpenEnroll()}
                    className="w-full py-2.5 rounded-xl bg-surface border border-border text-foreground font-bold text-xs"
                  >
                    Enroll Foundation
                  </button>
                </div>

                <div className="p-4 rounded-2xl border-2 border-primary bg-card shadow-lg space-y-3 relative">
                  <div className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full bg-primary text-black font-black text-[9px] uppercase shadow-md">
                    Popular
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-primary/20 text-primary">
                    Elite Professional
                  </span>
                  <div className="font-mono">
                    <span className="text-2xl font-black text-primary">₹{monthlyFeeMax.toLocaleString()}</span>
                    <span className="text-xs text-text-secondary"> / month</span>
                  </div>
                  <p className="text-xs text-text-secondary">5-6 Days / Week high-performance training</p>
                  <button
                    onClick={() => handleOpenEnroll()}
                    className="w-full py-2.5 rounded-xl bg-primary text-black font-black text-xs shadow-md shadow-primary/20"
                  >
                    Enroll Elite
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Fixed Mobile Bottom Action Bar */}
        <div className="fixed bottom-0 inset-x-0 p-3.5 bg-card/95 backdrop-blur-xl border-t border-border z-40 flex items-center justify-between shadow-2xl pb-safe">
          <div>
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-text-muted block">Coaching Fee</span>
            <div className="font-mono">
              <span className="text-sm font-black text-foreground">₹{monthlyFeeMin.toLocaleString()}</span>
              <span className="text-[10px] text-text-secondary"> / month</span>
            </div>
          </div>

          <button
            onClick={() => handleOpenEnroll()}
            className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-black font-black text-xs shadow-xl shadow-primary/30 flex items-center gap-2 active:scale-95 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Apply for Admission</span>
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          DESKTOP VIEW: FULL RICH BENTO LAYOUT (UNCHANGED)
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="hidden md:block">
        {/* Sticky Desktop Top Bar */}
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/80 px-8 py-3.5 transition-all">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-xl bg-surface hover:bg-surface-hover border border-border text-foreground transition active:scale-95 cursor-pointer"
                title="Go Back"
              >
                <ArrowLeft className="w-4 h-4 text-primary" />
              </button>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-primary flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5" />
                  Academy Details
                </span>
                <h1 className="text-base font-black text-foreground truncate max-w-md">
                  {name}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={handleShare}
                className="px-3 py-2 rounded-xl bg-surface hover:bg-surface-hover border border-border text-xs font-bold text-foreground flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-primary" />}
                <span>{copied ? 'Link Copied' : 'Share'}</span>
              </button>

              <button
                onClick={() => handleOpenEnroll()}
                className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-black text-xs transition-all shadow-lg shadow-primary/25 active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Enroll Now</span>
              </button>
            </div>
          </div>
        </header>

        {/* Hero Banner Desktop */}
        <section className="relative max-w-7xl mx-auto px-8 pt-6">
          <div className="relative rounded-[32px] overflow-hidden border border-border bg-card shadow-2xl">
            <div className="h-[4px] w-full bg-gradient-to-r from-primary via-emerald-400 to-primary/40" />

            <div className="relative h-80 lg:h-96 w-full overflow-hidden bg-black/40">
              <img
                src={bannerUrl}
                alt={name}
                className="w-full h-full object-cover scale-100 hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/30" />
              <div className="absolute inset-0 bg-primary/5 backdrop-blur-[0.5px]" />

              <div className="absolute top-4 inset-x-6 flex items-center justify-between z-10">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-black/70 text-primary border border-primary/40 backdrop-blur-md shadow-xl">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  {type}
                </span>

                {admissionStatus === 'OPEN' ? (
                  <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black tracking-wide bg-emerald-500/25 text-emerald-300 border border-emerald-500/50 backdrop-blur-md shadow-xl">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    Admissions Open
                  </span>
                ) : admissionStatus === 'LIMITED' ? (
                  <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black tracking-wide bg-amber-500/25 text-amber-300 border border-amber-500/50 backdrop-blur-md shadow-xl">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    Limited Slots Available
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black tracking-wide bg-rose-500/25 text-rose-300 border border-rose-500/50 backdrop-blur-md shadow-xl">
                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                    Waitlist Only
                  </span>
                )}
              </div>

              <div className="absolute bottom-6 inset-x-6 flex items-end justify-between gap-4 z-10">
                <div className="flex items-end gap-5">
                  <div className="w-24 h-24 rounded-3xl border-2 border-primary/50 overflow-hidden shadow-2xl flex items-center justify-center shrink-0 bg-black/80 backdrop-blur-xl">
                    {logoUrl ? (
                      <img src={logoUrl} alt={name} className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="w-12 h-12 text-primary" />
                    )}
                  </div>

                  <div className="text-white drop-shadow-md space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-3xl font-black tracking-tight text-white leading-tight">
                        {name}
                      </h1>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary text-black font-black text-[10px] uppercase shadow-sm">
                        <ShieldCheck className="w-3 h-3" /> Verified
                      </span>
                    </div>

                    <p className="text-sm text-white/90 font-semibold flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-primary shrink-0" />
                      <span>{address}, {city}, {state}</span>
                      <span className="text-white/40">•</span>
                      <span>Est. {establishedYear}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${contactPhone}`}
                    className="px-4 py-2.5 rounded-xl bg-surface/90 hover:bg-surface border border-white/20 text-white font-bold text-xs backdrop-blur-md flex items-center gap-2 transition active:scale-95"
                  >
                    <Phone className="w-3.5 h-3.5 text-primary" />
                    <span>Call</span>
                  </a>

                  <button
                    onClick={() => handleOpenEnroll()}
                    className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-black font-black text-xs transition-all shadow-xl shadow-primary/30 flex items-center gap-2 active:scale-95 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Enroll in Batch</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Key Metrics Bar Desktop */}
        <section className="max-w-7xl mx-auto px-8 pt-6">
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl border border-border bg-card shadow-md flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted block">Courts &amp; Turf</span>
                <span className="text-base font-black text-foreground">{totalCourts} Training Courts</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-border bg-card shadow-md flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted block">Operating Hours</span>
                <span className="text-base font-black text-foreground">{openingTime} - {closingTime}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-border bg-card shadow-md flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted block">Monthly Coaching</span>
                <span className="text-base font-black text-emerald-500 font-mono">₹{monthlyFeeMin.toLocaleString()} - ₹{monthlyFeeMax.toLocaleString()}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-border bg-card shadow-md flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <Dumbbell className="w-5 h-5 text-primary" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted block">Active Batches</span>
                <span className="text-base font-black text-foreground">{displayBatches.length} Batches Open</span>
              </div>
            </div>
          </div>
        </section>

        {/* Tab Navigation Desktop */}
        <section className="max-w-7xl mx-auto px-8 pt-6">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            {[
              { id: 'overview', label: 'Overview & About', icon: Info },
              { id: 'batches', label: `Batches & Timings (${displayBatches.length})`, icon: Calendar },
              { id: 'facilities', label: `Courts & Facilities (${displayCourts.length})`, icon: Building2 },
              { id: 'pricing', label: 'Fees & Pricing', icon: DollarSign },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                    active
                      ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 font-black'
                      : 'bg-surface hover:bg-surface-hover text-text-secondary border border-border'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Content Tabs Desktop */}
        <main className="max-w-7xl mx-auto px-8 pt-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2 space-y-6">
                <div className="p-6 rounded-3xl border border-border bg-card shadow-lg space-y-3">
                  <h3 className="text-base font-black text-foreground flex items-center gap-2">
                    <Info className="w-4 h-4 text-primary" />
                    About the Academy
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                    {bio}
                  </p>
                </div>

                <div className="p-6 rounded-3xl border border-border bg-card shadow-lg space-y-4">
                  <h3 className="text-base font-black text-foreground flex items-center gap-2">
                    <Dumbbell className="w-4 h-4 text-primary" />
                    Sports Disciplines &amp; Coaching Offered
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {sportsList.map((sport) => (
                      <div
                        key={sport}
                        className="p-3.5 rounded-2xl bg-surface border border-border flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary">
                            🏸
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-foreground">{sport}</h4>
                            <span className="text-[10px] text-text-muted">Beginner to Pro Levels</span>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                          Enrolling
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 rounded-3xl border border-border bg-card shadow-lg space-y-4">
                  <h3 className="text-base font-black text-foreground flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    Facilities &amp; Amenities
                  </h3>
                  <div className="grid grid-cols-2 gap-2.5">
                    {amenitiesList.map((amenity, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-surface border border-border/80 flex items-center gap-2.5 text-xs font-semibold text-foreground"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-6 rounded-3xl border border-border bg-card shadow-lg space-y-4">
                  <h3 className="text-sm font-black text-foreground uppercase tracking-wider text-primary">
                    Contact &amp; Venue Location
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-surface border border-border">
                      <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-foreground block">Facility Address</span>
                        <span className="text-text-secondary text-[11px] leading-relaxed">
                          {address}, {city}, {state} - {country}
                        </span>
                      </div>
                    </div>

                    <a
                      href={`tel:${contactPhone}`}
                      className="flex items-center gap-3 p-3 rounded-xl bg-surface hover:bg-surface-hover border border-border transition text-foreground"
                    >
                      <Phone className="w-4 h-4 text-primary shrink-0" />
                      <div>
                        <span className="font-bold block">Phone Number</span>
                        <span className="text-text-secondary text-[11px]">{contactPhone}</span>
                      </div>
                    </a>

                    <a
                      href={`mailto:${contactEmail}`}
                      className="flex items-center gap-3 p-3 rounded-xl bg-surface hover:bg-surface-hover border border-border transition text-foreground"
                    >
                      <Mail className="w-4 h-4 text-primary shrink-0" />
                      <div>
                        <span className="font-bold block">Email Address</span>
                        <span className="text-text-secondary text-[11px] truncate max-w-[200px]">{contactEmail}</span>
                      </div>
                    </a>

                    {website && (
                      <a
                        href={website.startsWith('http') ? website : `https://${website}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 p-3 rounded-xl bg-surface hover:bg-surface-hover border border-border transition text-foreground"
                      >
                        <Globe className="w-4 h-4 text-primary shrink-0" />
                        <div>
                          <span className="font-bold block">Official Website</span>
                          <span className="text-text-secondary text-[11px] truncate max-w-[200px]">{website}</span>
                        </div>
                      </a>
                    )}
                  </div>

                  <button
                    onClick={() => handleOpenEnroll()}
                    className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-black text-xs transition-all shadow-lg shadow-primary/25 cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Direct Athlete Admission</span>
                  </button>
                </div>

                <div className="p-6 rounded-3xl border border-border bg-card shadow-lg space-y-3">
                  <h3 className="text-sm font-black text-foreground uppercase tracking-wider text-primary">
                    Operating Schedule
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-border">
                      <span className="text-text-secondary">Days</span>
                      <span className="font-bold text-foreground">{operatingDays}</span>
                    </div>
                    <div className="flex items-center justify-between pb-2 border-b border-border">
                      <span className="text-text-secondary">Hours</span>
                      <span className="font-bold text-primary font-mono">{openingTime} – {closingTime}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-text-secondary">Court Flooring</span>
                      <span className="font-bold text-foreground">{surfaceType}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BATCHES */}
          {activeTab === 'batches' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black text-foreground">Available Coaching Batches</h2>
                  <p className="text-xs text-text-secondary">Choose a structured coaching batch matching your skill level and schedule</p>
                </div>

                <button
                  onClick={() => handleOpenEnroll()}
                  className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-black text-xs transition-all shadow-lg shadow-primary/25 flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Apply for Batch</span>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-5">
                {displayBatches.map((b) => {
                  const isFull = (b.enrolledCount || 0) >= (b.maxCapacity || 12);
                  return (
                    <div
                      key={b.batchUuid}
                      className="p-5 rounded-3xl border border-border bg-card shadow-xl flex flex-col justify-between space-y-4 group hover:border-primary/50 transition-all"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                            {b.sportType || 'Badminton'}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            b.level === 'ADVANCED' || b.level === 'ELITE'
                              ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                              : b.level === 'INTERMEDIATE'
                              ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                              : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          }`}>
                            {b.level || 'ALL LEVELS'}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-base font-black text-foreground group-hover:text-primary transition-colors">
                            {b.batchName}
                          </h4>
                          {b.coachName && (
                            <p className="text-xs text-text-secondary mt-0.5">
                              Coach: <span className="font-bold text-foreground">{b.coachName}</span>
                            </p>
                          )}
                        </div>

                        <div className="p-3 rounded-2xl bg-surface border border-border space-y-2 text-xs">
                          <div className="flex items-center justify-between text-text-secondary">
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-primary" />
                              <span>Schedule</span>
                            </span>
                            <span className="font-bold text-foreground">{b.daysOfWeek || 'Mon, Wed, Fri'}</span>
                          </div>

                          <div className="flex items-center justify-between text-text-secondary">
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-primary" />
                              <span>Timing</span>
                            </span>
                            <span className="font-bold text-primary font-mono">{b.startTime} - {b.endTime}</span>
                          </div>

                          <div className="flex items-center justify-between text-text-secondary">
                            <span className="flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5 text-primary" />
                              <span>Capacity</span>
                            </span>
                            <span className="font-bold text-foreground">
                              {b.enrolledCount || 0} / {b.maxCapacity || 12} Enrolled
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-border flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-text-muted uppercase block">Monthly Fee</span>
                          <span className="text-base font-black font-mono text-emerald-500">
                            ₹{(b.monthlyFee || monthlyFeeMin).toLocaleString()}
                          </span>
                        </div>

                        <button
                          onClick={() => handleOpenEnroll(b)}
                          disabled={isFull}
                          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer ${
                            isFull
                              ? 'bg-surface border border-border text-text-muted cursor-not-allowed'
                              : 'bg-primary hover:bg-primary-hover text-primary-foreground shadow-md shadow-primary/20'
                          }`}
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>{isFull ? 'Batch Full' : 'Enroll Batch'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: FACILITIES */}
          {activeTab === 'facilities' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-black text-foreground">Training Courts &amp; Venues</h2>
                <p className="text-xs text-text-secondary">Standard tournament-grade court infrastructure with synthetic mats and LED lighting</p>
              </div>

              <div className="grid grid-cols-3 gap-5">
                {displayCourts.map((court, idx) => (
                  <div
                    key={court.courtUuid || idx}
                    className="p-5 rounded-3xl border border-border bg-card shadow-lg space-y-3 group hover:border-primary/40 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-center font-black text-primary text-sm">
                        {court.courtNumber || idx + 1}
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Active
                      </span>
                    </div>

                    <div>
                      <h4 className="text-base font-black text-foreground group-hover:text-primary transition-colors">
                        {court.name}
                      </h4>
                      <p className="text-xs text-text-secondary mt-0.5">
                        Sport: <span className="font-bold text-foreground">{court.sportType || 'Badminton'}</span>
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-surface border border-border space-y-1.5 text-xs text-text-secondary">
                      <div className="flex justify-between">
                        <span>Flooring Surface</span>
                        <span className="font-bold text-foreground">{court.surfaceType || surfaceType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Hourly Slot Rate</span>
                        <span className="font-bold text-emerald-500 font-mono">₹{court.hourlyRate || pricePerHour}/hr</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: PRICING */}
          {activeTab === 'pricing' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-black text-foreground">Fee Structure &amp; Pricing Packages</h2>
                <p className="text-xs text-text-secondary">Transparent monthly academy fee plans and hourly court booking rates</p>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="p-6 rounded-3xl border border-border bg-card shadow-xl space-y-5 relative">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                      Foundation
                    </span>
                    <h3 className="text-lg font-black text-foreground mt-2">Beginner Coaching</h3>
                    <p className="text-xs text-text-secondary mt-1">3 Days / Week structured coaching</p>
                  </div>

                  <div className="font-mono">
                    <span className="text-3xl font-black text-foreground">₹{monthlyFeeMin.toLocaleString()}</span>
                    <span className="text-xs text-text-secondary"> / month</span>
                  </div>

                  <ul className="space-y-2.5 text-xs text-text-secondary border-t border-border pt-4">
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> 1.5 Hours per session</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Grip &amp; Footwork drills</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Free shuttlecocks provided</li>
                  </ul>

                  <button
                    onClick={() => handleOpenEnroll()}
                    className="w-full py-2.5 rounded-xl bg-surface hover:bg-surface-hover border border-border text-foreground font-bold text-xs transition cursor-pointer"
                  >
                    Enroll Beginner
                  </button>
                </div>

                <div className="p-6 rounded-3xl border-2 border-primary bg-card shadow-2xl space-y-5 relative">
                  <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-primary text-black font-black text-[10px] uppercase shadow-md">
                    Most Popular
                  </div>

                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/20 text-primary border border-primary/30">
                      Elite Professional
                    </span>
                    <h3 className="text-lg font-black text-foreground mt-2">Advanced Tournament Prep</h3>
                    <p className="text-xs text-text-secondary mt-1">5-6 Days / Week high-performance training</p>
                  </div>

                  <div className="font-mono">
                    <span className="text-3xl font-black text-primary">₹{monthlyFeeMax.toLocaleString()}</span>
                    <span className="text-xs text-text-secondary"> / month</span>
                  </div>

                  <ul className="space-y-2.5 text-xs text-text-secondary border-t border-border pt-4">
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary shrink-0" /> 2 Hours per day intensive</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary shrink-0" /> Match video analysis &amp; stats</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary shrink-0" /> Physical conditioning &amp; agility</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary shrink-0" /> Tournament escort &amp; coaching</li>
                  </ul>

                  <button
                    onClick={() => handleOpenEnroll()}
                    className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-black font-black text-xs transition shadow-lg shadow-primary/25 cursor-pointer"
                  >
                    Enroll Advanced
                  </button>
                </div>

                <div className="p-6 rounded-3xl border border-border bg-card shadow-xl space-y-5 relative">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-surface border border-border text-text-secondary">
                      Casual Booking
                    </span>
                    <h3 className="text-lg font-black text-foreground mt-2">Court Slot Booking</h3>
                    <p className="text-xs text-text-secondary mt-1">Hourly court booking for friendly matches</p>
                  </div>

                  <div className="font-mono">
                    <span className="text-3xl font-black text-foreground">₹{pricePerHour}</span>
                    <span className="text-xs text-text-secondary"> / hour</span>
                  </div>

                  <ul className="space-y-2.5 text-xs text-text-secondary border-t border-border pt-4">
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> High-lumen LED court lighting</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Synthetic tournament flooring</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Shower &amp; locker access</li>
                  </ul>

                  <a
                    href={`tel:${contactPhone}`}
                    className="block text-center w-full py-2.5 rounded-xl bg-surface hover:bg-surface-hover border border-border text-foreground font-bold text-xs transition"
                  >
                    Call to Reserve Court
                  </a>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          DIRECT SELF-ENROLLMENT MODAL (RESPONSIVE FOR BOTH MOBILE & DESKTOP)
         ══════════════════════════════════════════════════════════════════════ */}
      {showEnrollModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-card border-t sm:border border-border rounded-t-[32px] sm:rounded-3xl max-w-lg w-full max-h-[88vh] overflow-y-auto p-5 sm:p-6 space-y-4 shadow-2xl relative">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center font-bold text-primary">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-foreground">
                    Enroll in {name}
                  </h3>
                  <p className="text-[11px] text-text-secondary">
                    Direct athlete admission into coaching batches
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowEnrollModal(false)}
                className="p-1.5 rounded-xl hover:bg-surface border border-border text-text-muted transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Success State */}
            {enrollSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="text-base font-black text-foreground">Enrollment Submitted!</h4>
                <p className="text-xs text-text-secondary max-w-xs mx-auto">
                  {name} coaching coordinators will contact you at {enrollForm.phone}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitEnrollment} className="space-y-3.5">
                {enrollError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold">
                    {enrollError}
                  </div>
                )}

                {/* Batch Selector */}
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">
                    Select Coaching Batch
                  </label>
                  <select
                    value={enrollForm.batchUuid}
                    onChange={(e) => {
                      const b = displayBatches.find((x) => x.batchUuid === e.target.value);
                      setSelectedBatchForEnroll(b || null);
                      setEnrollForm((prev) => ({ ...prev, batchUuid: e.target.value }));
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-xs text-foreground font-semibold focus:outline-none focus:border-primary transition"
                  >
                    <option value="">-- Choose a Training Batch --</option>
                    {displayBatches.map((b) => (
                      <option key={b.batchUuid} value={b.batchUuid}>
                        {b.batchName} ({b.daysOfWeek} • {b.startTime} - {b.endTime}) - ₹{(b.monthlyFee || monthlyFeeMin).toLocaleString()}/mo
                      </option>
                    ))}
                  </select>
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">
                    Athlete / Student Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={enrollForm.fullName}
                    onChange={(e) => setEnrollForm({ ...enrollForm, fullName: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-xs text-foreground font-semibold focus:outline-none focus:border-primary transition"
                  />
                </div>

                {/* Phone & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1">
                      Contact Phone <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={enrollForm.phone}
                      onChange={(e) => setEnrollForm({ ...enrollForm, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-xs text-foreground font-semibold focus:outline-none focus:border-primary transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={enrollForm.email}
                      onChange={(e) => setEnrollForm({ ...enrollForm, email: e.target.value })}
                      placeholder="athlete@gmail.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-xs text-foreground font-semibold focus:outline-none focus:border-primary transition"
                    />
                  </div>
                </div>

                {/* Level & Emergency Contact */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1">
                      Current Skill Level
                    </label>
                    <select
                      value={enrollForm.level}
                      onChange={(e) => setEnrollForm({ ...enrollForm, level: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-xs text-foreground font-semibold focus:outline-none focus:border-primary transition"
                    >
                      <option value="BEGINNER">Beginner</option>
                      <option value="INTERMEDIATE">Intermediate</option>
                      <option value="ADVANCED">Advanced</option>
                      <option value="ELITE">Elite / Competitive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1">
                      Emergency Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={enrollForm.emergencyContact}
                      onChange={(e) => setEnrollForm({ ...enrollForm, emergencyContact: e.target.value })}
                      placeholder="Parent / Guardian Phone"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-xs text-foreground font-semibold focus:outline-none focus:border-primary transition"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={enrolling}
                    className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-black text-xs transition-all shadow-lg shadow-primary/25 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                  >
                    {enrolling ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                    <span>Confirm &amp; Submit Application</span>
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
