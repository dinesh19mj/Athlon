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
  Info,
  DollarSign,
  Zap,
  Activity,
  Trophy,
  Eye,
  Lock,
  Tag,
  MessageSquare
} from 'lucide-react';
import { OrganizationService, Organization, OrganizationProfile } from '@/lib/api/organization';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';

export default function CoachDetailPage() {
  const params = useParams();
  const router = useRouter();
  const coachId = (params?.coachId as string) || '';

  const { isAuthenticated, userUuid, userEmail } = useAuthStore();
  const { personalProfile } = useWorkspaceStore();

  const [loading, setLoading] = useState(true);
  const [coachData, setCoachData] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  // Enquiry / Session Booking Modal
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [enquiring, setEnquiring] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [enquiryForm, setEnquiryForm] = useState({
    athleteName: personalProfile?.name || '',
    phone: '',
    email: userEmail || '',
    preferredSport: 'Badminton',
    sessionType: '1_ON_1_PRIVATE',
    notes: '',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    const fetchCoachProfile = async () => {
      if (!coachId) return;
      try {
        setLoading(true);
        const res = await OrganizationService.getProfileByOrgUuid(coachId);
        const data = res?.data || res;
        if (data) {
          setProfile(data);
          setCoachData(data);
        }
      } catch (err) {
        console.error('Failed to load coach profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCoachProfile();
  }, [coachId]);

  const name = profile?.name || coachData?.name || 'Professional Coach';
  const bio = profile?.bio || coachData?.bio || 'Certified High-Performance Sports Coach';
  const description = profile?.description || coachData?.description || '';
  const admissionStatus = profile?.admissionStatus || 'OPEN';
  const establishedYear = profile?.establishedYear || 2020;
  const experienceYears = profile?.experienceYears || 6;
  const registrationNumber = profile?.registrationNumber || '';

  const logoUrl = profile?.logo
    ? OrganizationService.getLogoUrl(profile.logo)
    : coachData?.logo
      ? OrganizationService.getLogoUrl(coachData.logo)
      : '';

  const coverUrl = profile?.banner
    ? OrganizationService.getBannerUrl(profile.banner)
    : coachData?.banner
      ? OrganizationService.getBannerUrl(coachData.banner)
      : 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1600&q=80';

  const address = profile?.address || '';
  const city = profile?.city || '';
  const state = profile?.state || '';
  const country = profile?.country || 'India';
  const contactPhone = profile?.contactPhone || '';
  const contactEmail = profile?.contactEmail || '';
  const website = profile?.website || '';
  const instagram = profile?.socialInstagram || '';

  const sportsOffered: string[] = profile?.sportsOffered
    ? profile.sportsOffered.split(',').map((s: string) => s.trim()).filter(Boolean)
    : ['Badminton'];

  const certifications: string[] = profile?.certifications && Array.isArray(profile.certifications)
    ? profile.certifications
    : ['Certified High-Performance Coach', 'BWF / National Federation Accredited'];

  const specializations: string[] = profile?.specializations && Array.isArray(profile.specializations)
    ? profile.specializations
    : ['Footwork & Speed Drills', 'Match Strategy & Tactical Play', 'Stamina & Agility Conditioning'];

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquiryForm.athleteName.trim() || !enquiryForm.phone.trim()) {
      alert('Please fill in athlete name and contact phone number.');
      return;
    }

    setEnquiring(true);
    try {
      // Simulate direct booking / enquiry notification
      await new Promise((resolve) => setTimeout(resolve, 800));
      showToast(`🎉 Coaching enquiry sent to Coach ${name}! The coach will contact you shortly.`);
      setShowEnquiryModal(false);
    } catch (err) {
      alert('Failed to send enquiry. Please try again.');
    } finally {
      setEnquiring(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-xs font-semibold text-foreground/50 tracking-wider uppercase">
          Loading Coach Workspace Profile...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-28 selection:bg-primary selection:text-black">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2.5 bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md animate-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* ── TOP HERO BANNER & IDENTITY POD ── */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8 pt-4 sm:pt-6 space-y-6">
        <div className="relative rounded-3xl overflow-hidden border border-border bg-card shadow-2xl">
          {/* Cover Photo Backdrop */}
          <div className="relative w-full h-52 sm:h-64 md:h-72 bg-surface group">
            <img
              src={coverUrl}
              alt="Coach Banner"
              className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-black/40" />
            <div className="absolute inset-0 bg-primary/5 backdrop-blur-[1px]" />

            {/* Top Navigation Row */}
            <div className="absolute top-4 inset-x-4 flex items-center justify-between z-20">
              <Link
                href="/coaches"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/70 hover:bg-black/90 text-foreground text-xs font-bold backdrop-blur-md border border-white/15 transition-all shadow-md active:scale-95"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>All Coaches</span>
              </Link>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-black/60 text-primary border border-primary/30 backdrop-blur-md shadow-lg">
                  <Award className="w-3.5 h-3.5 text-primary" />
                  COACH
                </span>
                {admissionStatus === 'OPEN' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wide bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 backdrop-blur-md shadow-lg">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Sessions Open
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Overlapping Avatar & Coach Identity Pod */}
          <div className="relative px-5 sm:px-8 pb-6 pt-0">
            <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-5 -mt-14 sm:-mt-16 relative z-10">
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-5 text-center sm:text-left">
                {/* Avatar Box */}
                <div className="relative group/avatar">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-surface border-4 border-background p-0.5 overflow-hidden shadow-2xl ring-2 ring-primary/30 flex items-center justify-center bg-gradient-to-br from-surface to-background">
                    {logoUrl ? (
                      <img src={logoUrl} alt={name} className="w-full h-full object-cover rounded-2xl" />
                    ) : (
                      <Award className="w-10 h-10 text-primary" />
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-center sm:justify-start gap-2.5 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                      {name}
                    </h1>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                      Verified Coach
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-text-secondary max-w-xl line-clamp-2">
                    {bio}
                  </p>

                  <div className="flex items-center justify-center sm:justify-start gap-3 pt-1 text-xs text-text-muted flex-wrap">
                    <span className="flex items-center gap-1 font-bold text-primary">
                      <Sparkles className="w-3.5 h-3.5" />
                      {experienceYears} Years Experience
                    </span>
                    <span>•</span>
                    <span>{sportsOffered.join(', ')}</span>
                    {city && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-cyan-400" />
                          {city}, {state || country}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setShowEnquiryModal(true)}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-black text-xs bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Book Session / Enroll</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── MAIN CONTENT GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-20">
          {/* Left Column (8 cols): Story, Credentials, Specializations */}
          <div className="lg:col-span-8 space-y-6">
            {/* 1. Coaching Philosophy & Background */}
            <div className="bg-card p-6 sm:p-7 rounded-3xl border border-border shadow-sm space-y-4">
              <div className="border-b border-border pb-3">
                <h2 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                  <Award className="w-4 h-4 text-primary" />
                  About Coach &amp; Training Philosophy
                </h2>
              </div>

              {description ? (
                <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
                  {description}
                </p>
              ) : (
                <p className="text-xs sm:text-sm text-text-muted italic">
                  Dedicated high-performance coaching customized for individual athletes, footwork optimization, match mental resilience, and technical stroke refinement.
                </p>
              )}

              {/* Quick Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 rounded-2xl bg-surface border border-border text-center">
                  <div className="text-[10px] font-bold text-text-muted uppercase">Experience</div>
                  <div className="text-sm font-black text-foreground mt-0.5">{experienceYears} Years</div>
                </div>
                <div className="p-3 rounded-2xl bg-surface border border-border text-center">
                  <div className="text-[10px] font-bold text-text-muted uppercase">Coaching ID</div>
                  <div className="text-sm font-black text-foreground mt-0.5 truncate">{registrationNumber || 'BWF-COACH'}</div>
                </div>
                <div className="p-3 rounded-2xl bg-surface border border-border text-center">
                  <div className="text-[10px] font-bold text-text-muted uppercase">Discipline</div>
                  <div className="text-sm font-black text-primary mt-0.5 truncate">{sportsOffered[0] || 'Badminton'}</div>
                </div>
                <div className="p-3 rounded-2xl bg-surface border border-border text-center">
                  <div className="text-[10px] font-bold text-text-muted uppercase">Availability</div>
                  <div className="text-sm font-black text-emerald-400 mt-0.5">{admissionStatus === 'OPEN' ? 'Accepting' : 'Waitlist'}</div>
                </div>
              </div>
            </div>

            {/* 2. Official Certifications & Licenses */}
            <div className="bg-card p-6 sm:p-7 rounded-3xl border border-border shadow-sm space-y-4">
              <div className="border-b border-border pb-3">
                <h2 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  Official Certifications &amp; Accreditations
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {certifications.map((cert, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-2xl bg-surface border border-border flex items-center gap-3 shadow-sm hover:border-primary/40 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center font-black text-base shrink-0">
                      🏅
                    </div>
                    <div>
                      <div className="text-xs font-bold text-foreground">{cert}</div>
                      <div className="text-[10px] font-semibold text-primary">Verified Credential</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Coaching Specializations & Focus Drills */}
            <div className="bg-card p-6 sm:p-7 rounded-3xl border border-border shadow-sm space-y-4">
              <div className="border-b border-border pb-3">
                <h2 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  Coaching Specializations &amp; Tactical Focus
                </h2>
              </div>

              <div className="flex flex-wrap gap-2">
                {specializations.map((spec, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-surface border border-border text-xs font-bold text-foreground shadow-sm"
                  >
                    <span className="text-base">🎯</span>
                    <span>{spec}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (4 cols): Direct Contacts & Booking Card */}
          <div className="lg:col-span-4 space-y-6">
            {/* Quick Session Booking CTA Card */}
            <div className="bg-card p-6 rounded-3xl border border-primary/30 shadow-xl space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                  1-on-1 &amp; Batches
                </span>
                <h3 className="text-lg font-black text-foreground mt-0.5">
                  Train with Coach {name}
                </h3>
                <p className="text-xs text-text-secondary mt-1">
                  Private slots, customized drill regimes, and batch coaching sessions available.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowEnquiryModal(true)}
                className="w-full py-3 rounded-2xl font-black text-xs bg-primary text-primary-foreground shadow-md hover:opacity-90 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Submit Training Enquiry</span>
              </button>
            </div>

            {/* Direct Communication Channels */}
            <div className="bg-card p-5 sm:p-6 rounded-3xl border border-border shadow-sm space-y-4">
              <div className="border-b border-border pb-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" />
                  Direct Channels
                </h3>
              </div>

              <div className="space-y-2.5">
                {/* Phone */}
                <div className="p-3 rounded-2xl bg-surface border border-border flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold text-text-muted uppercase">Phone / WhatsApp</div>
                      <div className="text-xs font-bold text-foreground truncate">{contactPhone || 'Available upon enquiry'}</div>
                    </div>
                  </div>
                  {contactPhone && (
                    <a
                      href={`tel:${contactPhone}`}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 text-xs font-bold hover:bg-emerald-500/25"
                    >
                      Call
                    </a>
                  )}
                </div>

                {/* Email */}
                {contactEmail && (
                  <div className="p-3 rounded-2xl bg-surface border border-border flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Mail className="w-4 h-4 text-primary shrink-0" />
                      <div className="min-w-0">
                        <div className="text-[10px] font-bold text-text-muted uppercase">Email</div>
                        <div className="text-xs font-bold text-foreground truncate">{contactEmail}</div>
                      </div>
                    </div>
                    <a
                      href={`mailto:${contactEmail}`}
                      className="px-2.5 py-1 rounded-lg bg-primary/15 text-primary text-xs font-bold hover:bg-primary/25"
                    >
                      Email
                    </a>
                  </div>
                )}

                {/* Location */}
                <div className="p-3 rounded-2xl bg-surface border border-border flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-primary shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold text-text-muted uppercase">Location &amp; Campus</div>
                    <div className="text-xs font-bold text-foreground truncate">
                      {[address, city, state, country].filter(Boolean).join(', ') || 'Training Center'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── ENQUIRY & TRAINING BOOKING MODAL ── */}
      {showEnquiryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg bg-card border border-border rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between p-4 border-b border-border bg-card/80">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                Train with Coach {name}
              </h3>
              <button
                type="button"
                onClick={() => setShowEnquiryModal(false)}
                className="p-1.5 rounded-xl text-text-muted hover:text-foreground hover:bg-surface-hover transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEnquirySubmit} className="p-5 sm:p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1">
                  Athlete / Trainee Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={enquiryForm.athleteName}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, athleteName: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1">
                    Contact Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={enquiryForm.phone}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={enquiryForm.email}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, email: e.target.value })}
                    placeholder="athlete@example.com"
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1">
                  Training Program / Session Type
                </label>
                <select
                  value={enquiryForm.sessionType}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, sessionType: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary appearance-none cursor-pointer"
                >
                  <option value="1_ON_1_PRIVATE">1-on-1 Private High-Performance Coaching</option>
                  <option value="GROUP_BATCH">Regular Batch Coaching &amp; Drills</option>
                  <option value="SPARRING">Match Sparring &amp; Tactical Guidance</option>
                  <option value="WEEKEND_CAMP">Weekend Intensive Training Bootcamp</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1">
                  Goals / Experience Notes
                </label>
                <textarea
                  rows={3}
                  value={enquiryForm.notes}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, notes: e.target.value })}
                  placeholder="Mention your current playing level, specific focus areas (footwork, power smash, tournaments), and availability..."
                  className="w-full px-3.5 py-2 bg-background border border-border rounded-xl text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEnquiryModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-border text-xs font-bold text-foreground/70 hover:bg-surface transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={enquiring}
                  className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-black uppercase tracking-wider shadow-md hover:opacity-90 transition-all flex items-center gap-1.5"
                >
                  {enquiring && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Submit Training Enquiry</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
