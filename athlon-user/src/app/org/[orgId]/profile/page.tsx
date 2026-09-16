'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Loader2,
  CheckCircle2,
  Sparkles,
  Award,
  Dumbbell,
  Eye,
  Share2,
  Settings,
  Edit3,
  Palette,
  Calendar,
  ExternalLink,
  Flame,
  FileCheck,
  MapPinned,
  Users,
  Layers,
  Trophy,
  Newspaper,
  X,
  ChevronRight,
  LogOut,
  Banknote,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { OrganizationService } from '@/lib/api/organization';
import { ThemeModal } from '@/components/theme';
import { POPULAR_SPORTS } from '@/components/academy/OrganizationProfileEditor';

export default function OrganizationProfilePage() {
  const params = useParams();
  const router = useRouter();
  const orgId = (params?.orgId as string) || '';

  const { getActiveOrganization, organizations } = useWorkspaceStore();
  const activeOrg = getActiveOrganization() || organizations.find((o) => o.id === orgId);
  const { logout } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);

  // Dropdown menu & Modals
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadProfile = async () => {
    if (!orgId) return;
    try {
      setLoading(true);
      const res = await OrganizationService.getProfileByOrgUuid(orgId);
      const data = res?.data || res;
      if (data) {
        setProfileData(data);
      }
    } catch (err) {
      console.warn('Could not fetch profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [orgId, activeOrg]);

  // Derived state with fallbacks
  const name = profileData?.name || activeOrg?.name || 'Organization Profile';
  const type = profileData?.type || activeOrg?.type || 'ACADEMY';
  const isOrganizer = type === 'ORGANIZER' || activeOrg?.type === 'ORGANIZER';
  const isAssociation = type === 'ASSOCIATION' || activeOrg?.type === 'ASSOCIATION';
  const isCoach = type === 'COACH' || activeOrg?.type === 'COACH';
  const isClub = type === 'CLUB' || activeOrg?.type === 'CLUB';

  const bio = profileData?.bio || '';
  const description = profileData?.description || '';
  const establishedYear = profileData?.establishedYear ?? 2020;
  const registrationNumber = profileData?.registrationNumber || '';
  const admissionStatus = profileData?.admissionStatus || 'OPEN';

  const logoUrl = profileData?.logo
    ? OrganizationService.getLogoUrl(profileData.logo)
    : activeOrg?.logo || '';
  const coverUrl = profileData?.banner
    ? OrganizationService.getBannerUrl(profileData.banner)
    : 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1600&q=80';

  const address = profileData?.address || '';
  const city = profileData?.city || '';
  const district = profileData?.district || '';
  const state = profileData?.state || '';
  const country = profileData?.country || 'India';
  const postalCode = profileData?.postalCode || '';
  const contactPhone = profileData?.contactPhone || '';
  const contactEmail = profileData?.contactEmail || '';
  const website = profileData?.website || '';
  const instagram = profileData?.socialInstagram || '';

  const sportsOffered: string[] = profileData?.sportsOffered
    ? profileData.sportsOffered.split(',').map((s: string) => s.trim()).filter(Boolean)
    : ['Badminton'];

  // Completeness score
  const checks = [
    { name: 'Profile Logo', passed: Boolean(logoUrl), weight: 15 },
    { name: 'Cover Banner', passed: Boolean(profileData?.banner), weight: 10 },
    { name: isOrganizer ? 'About Vision' : isCoach ? 'Coach Bio' : 'About Story', passed: Boolean(description && description.length > 20), weight: 20 },
    { name: 'Direct Phone', passed: Boolean(contactPhone), weight: 15 },
    { name: 'Email Address', passed: Boolean(contactEmail), weight: 10 },
    { name: isOrganizer ? 'Headquarters City' : isAssociation ? 'Secretariat City' : 'Campus City', passed: Boolean(city), weight: 15 },
    { name: isOrganizer ? 'Sports Hosted' : 'Sports Listed', passed: sportsOffered.length > 0, weight: 15 },
  ];
  let completenessScore = 0;
  checks.forEach((c) => {
    if (c.passed) completenessScore += c.weight;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center animate-pulse">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
          <Loader2 className="w-12 h-12 animate-spin text-primary absolute inset-0 opacity-70" />
        </div>
        <p className="text-text-muted font-medium text-xs tracking-wider uppercase">
          Loading {isOrganizer ? 'Organizer' : isAssociation ? 'Association' : isCoach ? 'Coach' : 'Academy'} Profile...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-background text-foreground font-sans selection:bg-primary selection:text-black">
      {/* ══════════════════════════════════════════════════════════════════════
          HERO BANNER & PROFILE IDENTITY POD
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8 pt-4 sm:pt-6 space-y-6 w-full max-w-full">
        <div className="relative rounded-3xl overflow-hidden border border-border bg-card shadow-2xl">
          {/* Cover Photo Backdrop */}
          <div className="relative w-full h-48 sm:h-64 md:h-72 bg-surface group">
            <img
              src={coverUrl}
              alt={isOrganizer ? 'Organizer Banner' : 'Academy Banner'}
              className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-black/40" />
            <div className="absolute inset-0 bg-primary/5 backdrop-blur-[1px]" />

            {/* Floating Top Badges */}
            <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 text-primary text-xs font-black uppercase tracking-wider border border-primary/30 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                {type}
              </span>
              {city && (
                <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black/60 text-text-secondary text-xs font-medium border border-white/10 backdrop-blur-md">
                  <MapPin className="w-3 h-3 text-primary" />
                  {city}, {state || country}
                </span>
              )}
            </div>

            {/* ── TOP RIGHT DROPDOWN MENU BUTTON ── */}
            <div className="absolute top-4 right-4 z-30" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-black/70 hover:bg-black/90 text-foreground text-xs font-bold backdrop-blur-md border border-white/20 transition-all shadow-xl active:scale-95"
                title="Profile Options"
              >
                <Settings className="w-4 h-4 text-primary animate-spin-slow" />
                <span className="hidden sm:inline text-xs">Options</span>
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 top-12 w-56 bg-card/95 border border-border rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-1.5 flex flex-col gap-0.5">
                    {/* 1. Edit Profile -> navigates to Settings */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        router.push(`/org/${orgId}/settings?tab=profile`);
                      }}
                      className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-foreground hover:bg-foreground/5 hover:text-primary transition-colors text-left"
                    >
                      <Edit3 className="w-4 h-4 text-primary shrink-0" />
                      <span className="flex-1">Edit Profile</span>
                      <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
                    </button>

                    {/* 2. Appearance & Theme */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsThemeModalOpen(true);
                      }}
                      className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-foreground hover:bg-foreground/5 hover:text-primary transition-colors text-left"
                    >
                      <Palette className="w-4 h-4 text-primary shrink-0" />
                      <span className="flex-1">Appearance &amp; Theme</span>
                      <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
                    </button>

                    {/* 3. Live Marketplace Preview */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        setShowPreviewModal(true);
                      }}
                      className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-foreground hover:bg-foreground/5 hover:text-primary transition-colors text-left"
                    >
                      <Eye className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span className="flex-1">Marketplace Preview</span>
                      <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
                    </button>

                    <div className="my-1 border-t border-border" />

                    {/* 4. Workspace Settings */}
                    <Link
                      href={`/org/${orgId}/settings`}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-foreground/80 hover:bg-foreground/5 hover:text-foreground transition-colors text-left"
                    >
                      <Settings className="w-4 h-4 text-text-muted shrink-0" />
                      <span className="flex-1">Workspace Settings</span>
                    </Link>

                    {/* 5. Log Out */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        logout();
                        window.location.href = '/';
                      }}
                      className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition-colors text-left w-full"
                    >
                      <LogOut className="w-4 h-4 text-rose-500 shrink-0" />
                      <span className="flex-1">Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Overlapping Identity Section */}
          <div className="relative px-5 sm:px-8 pb-6 pt-0">
            <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-5 -mt-14 sm:-mt-16 relative z-10">
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-5 text-center sm:text-left">
                <div className="relative group/avatar">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl sm:rounded-3xl bg-surface border-4 border-background p-0.5 overflow-hidden shadow-2xl ring-2 ring-primary/30 flex items-center justify-center bg-gradient-to-br from-surface to-background">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo" className="w-full h-full object-cover rounded-xl sm:rounded-2xl" />
                    ) : (
                      <Building2 className="w-10 h-10 text-primary" />
                    )}
                  </div>
                </div>

                <div className="space-y-1 min-w-0 max-w-full">
                  <div className="flex items-center justify-center sm:justify-start gap-2.5 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight break-words [overflow-wrap:anywhere]">
                      {name}
                    </h1>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                      {type}
                    </span>
                    {admissionStatus === 'OPEN' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        {isOrganizer ? 'Tournaments & Entries Open' : 'Admissions Open'}
                      </span>
                    ) : admissionStatus === 'LIMITED' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        {isOrganizer ? 'Limited Entries' : 'Limited Slots'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                        {isOrganizer ? 'Registrations Closed' : 'Waitlist Active'}
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-text-secondary max-w-xl line-clamp-2 break-words [overflow-wrap:anywhere]">
                    {bio || (isOrganizer
                      ? 'Set your organization bio, tournament hosting credentials, and venue details.'
                      : isAssociation
                        ? 'Set your association mission, sports governance details, and affiliated zones.'
                        : isCoach
                          ? 'Set your coaching philosophy, career achievements, and training methodologies.'
                          : 'Set your academy tagline, coaching ethos, and public sports facilities.')}
                  </p>

                  <div className="flex items-center justify-center sm:justify-start gap-3 pt-1 text-xs text-text-muted flex-wrap">
                    <span className="flex items-center gap-1 font-medium text-primary">
                      <Calendar className="w-3.5 h-3.5" />
                      Est. {establishedYear || '2020'}
                    </span>
                    <span>•</span>
                    <span>{sportsOffered.length} {isOrganizer ? 'Sports Organized' : 'Sports Disciplines'}</span>
                    {city && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-cyan-400" />
                          {city}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Strength Quick Bar */}
          <div className="border-t border-border bg-surface/50 px-5 sm:px-8 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <Flame className="w-4 h-4 text-primary" />
                <span>Profile Completeness:</span>
                <span className="text-primary font-bold">{completenessScore}%</span>
              </div>
              <div className="flex-1 sm:w-32 h-1.5 bg-surface-hover rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${completenessScore}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-text-secondary overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {checks.slice(0, 4).map((c) => (
                <span key={c.name} className="flex items-center gap-1 flex-shrink-0">
                  {c.passed ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                  ) : (
                    <span className="w-3.5 h-3.5 rounded-full border border-border flex items-center justify-center text-[9px] text-text-muted">
                      !
                    </span>
                  )}
                  {c.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            PROFILE SHOWCASE MAIN CONTENT (Read-Only Polished Cards)
           ══════════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-24">
          {/* Left Column: Story, Sports & Campus */}
          <div className="lg:col-span-8 space-y-6">
            {/* 1. About Story & Philosophy */}
            <div className="bg-card p-6 sm:p-7 rounded-3xl border border-border shadow-sm space-y-4">
              <div className="border-b border-border pb-3">
                <h2 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                  <Award className="w-4 h-4 text-primary" />
                  {isOrganizer
                    ? 'About Tournament Organization & Event Mission'
                    : isAssociation
                      ? 'About Sports Association & Governance'
                      : isCoach
                        ? 'About Coach & Training Philosophy'
                        : 'About Academy & Coaching Philosophy'}
                </h2>
              </div>

              {description ? (
                <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed whitespace-pre-line break-words [overflow-wrap:anywhere]">
                  {description}
                </p>
              ) : (
                <p className="text-xs sm:text-sm text-text-muted italic">
                  {isOrganizer
                    ? 'No tournament organization story or background added yet.'
                    : isAssociation
                      ? 'No association overview or mission statement added yet.'
                      : isCoach
                        ? 'No coach story or training philosophy description added yet.'
                        : 'No academy story or coaching philosophy description added yet.'}
                </p>
              )}

              {/* Quick Institutional Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 rounded-2xl bg-surface border border-border text-center">
                  <div className="text-[10px] font-bold text-text-muted uppercase">Established</div>
                  <div className="text-sm font-black text-foreground mt-0.5">{establishedYear || '2020'}</div>
                </div>
                <div className="p-3 rounded-2xl bg-surface border border-border text-center">
                  <div className="text-[10px] font-bold text-text-muted uppercase">
                    {isOrganizer ? 'Reg. / Org ID' : 'Affiliation ID'}
                  </div>
                  <div className="text-sm font-black text-foreground mt-0.5 truncate">{registrationNumber || 'ORG-REG'}</div>
                </div>
                <div className="p-3 rounded-2xl bg-surface border border-border text-center">
                  <div className="text-[10px] font-bold text-text-muted uppercase">Org Type</div>
                  <div className="text-sm font-black text-primary mt-0.5">{type}</div>
                </div>
                <div className="p-3 rounded-2xl bg-surface border border-border text-center">
                  <div className="text-[10px] font-bold text-text-muted uppercase">Status</div>
                  <div className="text-sm font-black text-emerald-400 mt-0.5">{admissionStatus}</div>
                </div>
              </div>
            </div>

            {/* 2. Sports Disciplines Trained / Organized */}
            <div className="bg-card p-6 sm:p-7 rounded-3xl border border-border shadow-sm space-y-4">
              <div className="border-b border-border pb-3">
                <h2 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-primary" />
                  {isOrganizer
                    ? `Sports & Tournaments Organized (${sportsOffered.length})`
                    : isAssociation
                      ? `Sports Disciplines Governed (${sportsOffered.length})`
                      : isClub
                        ? `Club Sports (${sportsOffered.length})`
                        : `Sports Disciplines Trained (${sportsOffered.length})`}
                </h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {sportsOffered.map((sport) => {
                  const matched = POPULAR_SPORTS.find((p) => p.name.toLowerCase() === sport.toLowerCase());
                  const icon = matched ? matched.icon : '🏅';
                  return (
                    <div
                      key={sport}
                      className="p-3.5 rounded-2xl bg-surface border border-border flex items-center gap-2.5 hover:border-primary/40 transition-colors shadow-sm"
                    >
                      <span className="text-xl">{icon}</span>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-foreground truncate">{sport}</div>
                        <div className="text-[10px] font-semibold text-primary">
                          {isOrganizer ? 'Active Sport' : 'Active Program'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Location & Directions */}
            <div className="bg-card p-5 sm:p-7 rounded-3xl border border-border shadow-sm space-y-4 overflow-hidden">
              <div className="border-b border-border pb-3">
                <h2 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary shrink-0" />
                  <span className="truncate">
                    {isOrganizer
                      ? 'Headquarters & Operational Base'
                      : isAssociation
                        ? 'Secretariat / Office Location'
                        : isCoach
                          ? 'Training Base & Location'
                          : 'Campus Location & Directions'}
                  </span>
                </h2>
              </div>

              <div className="p-4 rounded-2xl bg-surface border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full min-w-0 overflow-hidden">
                <div className="flex items-start gap-3 min-w-0 flex-1 w-full">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPinned className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="text-xs font-bold text-foreground break-words [overflow-wrap:anywhere] leading-relaxed">
                      {address || (isOrganizer
                        ? 'Headquarters / venue address not provided'
                        : isAssociation
                          ? 'Secretariat office address not provided'
                          : 'Campus Street Address not provided')}
                    </div>
                    <div className="text-xs text-text-secondary break-words [overflow-wrap:anywhere]">
                      {[city, district, state, postalCode, country].filter(Boolean).join(', ') || 'City, State, India'}
                    </div>
                  </div>
                </div>

                {city && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${address} ${city}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-black transition-colors text-xs font-bold flex items-center gap-1.5 shrink-0 self-start sm:self-center"
                  >
                    <span>View on Maps</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Contact Channels & Operations Hub */}
          <div className="lg:col-span-4 space-y-6">
            {/* Direct Contact Channels Card */}
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
                      <div className="text-xs font-bold text-foreground truncate">{contactPhone || 'Not set'}</div>
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
                <div className="p-3 rounded-2xl bg-surface border border-border flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Mail className="w-4 h-4 text-primary shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold text-text-muted uppercase">Inquiries Email</div>
                      <div className="text-xs font-bold text-foreground truncate">{contactEmail || 'Not set'}</div>
                    </div>
                  </div>
                  {contactEmail && (
                    <a
                      href={`mailto:${contactEmail}`}
                      className="px-2.5 py-1 rounded-lg bg-primary/15 text-primary text-xs font-bold hover:bg-primary/25"
                    >
                      Email
                    </a>
                  )}
                </div>

                {/* Website */}
                {website && (
                  <div className="p-3 rounded-2xl bg-surface border border-border flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Globe className="w-4 h-4 text-cyan-400 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-[10px] font-bold text-text-muted uppercase">Website</div>
                        <div className="text-xs font-bold text-foreground truncate">{website}</div>
                      </div>
                    </div>
                    <a
                      href={website.startsWith('http') ? website : `https://${website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-cyan-500/15 text-cyan-400 text-xs font-bold hover:bg-cyan-500/25"
                    >
                      Visit
                    </a>
                  </div>
                )}

                {/* Instagram */}
                {instagram && (
                  <div className="p-3 rounded-2xl bg-surface border border-border flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Share2 className="w-4 h-4 text-pink-400 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-[10px] font-bold text-text-muted uppercase">Instagram</div>
                        <div className="text-xs font-bold text-foreground truncate">{instagram}</div>
                      </div>
                    </div>
                    <a
                      href={`https://instagram.com/${instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-pink-500/15 text-pink-400 text-xs font-bold hover:bg-pink-500/25"
                    >
                      Follow
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Operations & Modules Shortcut Hub */}
            <div className="bg-card p-5 sm:p-6 rounded-3xl border border-border shadow-sm space-y-4">
              <div className="border-b border-border pb-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  {isOrganizer
                    ? 'Organizer Operations Hub'
                    : isAssociation
                      ? 'Association Operations Hub'
                      : isCoach
                        ? 'Coach Operations Hub'
                        : 'Academy Operations Hub'}
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {isOrganizer ? (
                  <>
                    <Link
                      href={`/org/${orgId}/tournaments`}
                      className="p-3 rounded-2xl bg-surface hover:bg-surface-hover border border-border transition-colors group"
                    >
                      <Trophy className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                      <div className="text-xs font-bold text-foreground mt-1.5">Tournaments</div>
                      <div className="text-[10px] text-text-muted">Draws &amp; matches</div>
                    </Link>

                    <Link
                      href={`/org/${orgId}/registrations`}
                      className="p-3 rounded-2xl bg-surface hover:bg-surface-hover border border-border transition-colors group"
                    >
                      <Users className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                      <div className="text-xs font-bold text-foreground mt-1.5">Registrations</div>
                      <div className="text-[10px] text-text-muted">Player entries</div>
                    </Link>

                    <Link
                      href={`/org/${orgId}/finances`}
                      className="p-3 rounded-2xl bg-surface hover:bg-surface-hover border border-border transition-colors group"
                    >
                      <Banknote className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                      <div className="text-xs font-bold text-foreground mt-1.5">Finances</div>
                      <div className="text-[10px] text-text-muted">Revenue &amp; expenses</div>
                    </Link>

                    <Link
                      href={`/org/${orgId}/settings?tab=roles`}
                      className="p-3 rounded-2xl bg-surface hover:bg-surface-hover border border-border transition-colors group"
                    >
                      <ShieldCheck className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                      <div className="text-xs font-bold text-foreground mt-1.5">Roles &amp; Access</div>
                      <div className="text-[10px] text-text-muted">Officials &amp; staff</div>
                    </Link>

                    <Link
                      href={`/org/${orgId}/facilities`}
                      className="p-3 rounded-2xl bg-surface hover:bg-surface-hover border border-border transition-colors group"
                    >
                      <Building2 className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                      <div className="text-xs font-bold text-foreground mt-1.5">Venues &amp; Courts</div>
                      <div className="text-[10px] text-text-muted">Match facilities</div>
                    </Link>

                    <Link
                      href={`/org/${orgId}/posts`}
                      className="p-3 rounded-2xl bg-surface hover:bg-surface-hover border border-border transition-colors group"
                    >
                      <Newspaper className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                      <div className="text-xs font-bold text-foreground mt-1.5">Media &amp; News</div>
                      <div className="text-[10px] text-text-muted">Updates &amp; posters</div>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href={`/org/${orgId}/facilities`}
                      className="p-3 rounded-2xl bg-surface hover:bg-surface-hover border border-border transition-colors group"
                    >
                      <Building2 className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                      <div className="text-xs font-bold text-foreground mt-1.5">Courts &amp; Facilities</div>
                      <div className="text-[10px] text-text-muted">Venues &amp; booking</div>
                    </Link>

                    <Link
                      href={`/org/${orgId}/batches`}
                      className="p-3 rounded-2xl bg-surface hover:bg-surface-hover border border-border transition-colors group"
                    >
                      <Layers className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                      <div className="text-xs font-bold text-foreground mt-1.5">Coaching Batches</div>
                      <div className="text-[10px] text-text-muted">Schedules &amp; plans</div>
                    </Link>

                    <Link
                      href={`/org/${orgId}/students`}
                      className="p-3 rounded-2xl bg-surface hover:bg-surface-hover border border-border transition-colors group"
                    >
                      <Users className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                      <div className="text-xs font-bold text-foreground mt-1.5">Athletes &amp; Students</div>
                      <div className="text-[10px] text-text-muted">Roster &amp; profiles</div>
                    </Link>

                    <Link
                      href={`/org/${orgId}/coaches`}
                      className="p-3 rounded-2xl bg-surface hover:bg-surface-hover border border-border transition-colors group"
                    >
                      <Award className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                      <div className="text-xs font-bold text-foreground mt-1.5">Coaching Staff</div>
                      <div className="text-[10px] text-text-muted">Trainers &amp; mentors</div>
                    </Link>

                    <Link
                      href={`/org/${orgId}/tournaments`}
                      className="p-3 rounded-2xl bg-surface hover:bg-surface-hover border border-border transition-colors group"
                    >
                      <Trophy className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                      <div className="text-xs font-bold text-foreground mt-1.5">Tournaments</div>
                      <div className="text-[10px] text-text-muted">Draws &amp; matches</div>
                    </Link>

                    <Link
                      href={`/org/${orgId}/posts`}
                      className="p-3 rounded-2xl bg-surface hover:bg-surface-hover border border-border transition-colors group"
                    >
                      <Newspaper className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                      <div className="text-xs font-bold text-foreground mt-1.5">Media &amp; Gallery</div>
                      <div className="text-[10px] text-text-muted">Updates &amp; highlights</div>
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Session & Account Hub */}
            <div className="bg-card p-5 sm:p-6 rounded-3xl border border-border shadow-sm space-y-3">
              <div className="border-b border-border pb-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-foreground/70 flex items-center gap-1.5">
                  <LogOut className="w-3.5 h-3.5 text-rose-500" />
                  Account &amp; Session
                </h3>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    window.location.href = '/';
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-bold text-xs bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 transition-all active:scale-95 shadow-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out of ATHLON</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          THEME & APPEARANCE MODAL
         ══════════════════════════════════════════════════════════════════════ */}
      <ThemeModal open={isThemeModalOpen} onClose={() => setIsThemeModalOpen(false)} />

      {/* ══════════════════════════════════════════════════════════════════════
          FULL-SCREEN PREVIEW MODAL
         ══════════════════════════════════════════════════════════════════════ */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-card border border-border rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between p-4 border-b border-border bg-card/80">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary" />
                Live Listing Preview
              </h3>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="p-1.5 rounded-xl text-text-muted hover:text-foreground hover:bg-surface-hover transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              <div className="relative h-48 sm:h-56 rounded-2xl overflow-hidden border border-border shadow-xl">
                <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                <div className="absolute top-3 right-3">
                  <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-primary text-primary-foreground shadow-lg">
                    {type}
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-surface border-2 border-primary/60 overflow-hidden flex items-center justify-center shadow-xl">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="w-7 h-7 text-primary" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-foreground">{name}</h4>
                    <p className="text-xs text-text-secondary flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-primary" />
                      {city ? `${city}, ${state || country}` : 'Location Not Set'}
                    </p>
                  </div>
                </div>
              </div>

              {bio && <p className="text-xs sm:text-sm text-text-secondary italic">&ldquo;{bio}&rdquo;</p>}

              <div className="space-y-2">
                <h5 className="text-[11px] font-extrabold text-text-muted uppercase tracking-wider">
                  Sports ({sportsOffered.length})
                </h5>
                <div className="flex flex-wrap gap-1.5">
                  {sportsOffered.map((s) => (
                    <span
                      key={s}
                      className="px-3 py-1 rounded-lg bg-primary/10 text-primary border border-primary/25 text-xs font-semibold"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {description && (
                <div className="space-y-1.5 border-t border-border pt-3">
                  <h5 className="text-[11px] font-extrabold text-text-muted uppercase tracking-wider">About Us</h5>
                  <p className="text-xs text-text-secondary leading-relaxed">{description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
