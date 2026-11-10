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
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { OrganizationService } from '@/lib/api/organization';
import { ThemeModal } from '@/components/theme';
import { POPULAR_SPORTS } from '@/components/academy/OrganizationProfileEditor';
import { SportMetadataService } from '@/lib/api/tournaments';
import { Athlon3DFAB } from '@/components/common/Athlon3DFAB';

export default function OrganizationProfilePage() {
  const params = useParams();
  const router = useRouter();
  const orgId = (params?.orgId as string) || '';

  const { getActiveOrganization, organizations } = useWorkspaceStore();
  const activeOrg = getActiveOrganization() || organizations.find((o) => o.id === orgId);
  const { logout } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [dynamicSports, setDynamicSports] = useState<{ name: string; icon: string }[]>(POPULAR_SPORTS);

  useEffect(() => {
    async function fetchSports() {
      try {
        const res: any = await SportMetadataService.getAllSports();
        const sportsData: any[] = Array.isArray(res?.data?.data)
          ? res.data.data
          : Array.isArray(res?.data)
            ? res.data
            : [];
        if (Array.isArray(sportsData) && sportsData.length > 0) {
          setDynamicSports(
            sportsData.map((s: any) => ({
              name: s.sportName,
              icon: s.emoji || '🏅',
            }))
          );
        }
      } catch {
        // use fallback
      }
    }
    fetchSports();
  }, []);

  // Dropdown menu & Modals
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [bannerError, setBannerError] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type?: 'success' | 'error' } | null>(null);

  const triggerToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      triggerToast('🔗 Profile link copied to clipboard!');
    }
  };

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
  const isCommunity =
    type === 'COMMUNITY' ||
    activeOrg?.type === 'COMMUNITY' ||
    String(type).toUpperCase() === 'COMMUNITY' ||
    String(activeOrg?.type).toUpperCase() === 'COMMUNITY';

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
    { name: isCommunity ? 'Community Bio' : isOrganizer ? 'About Vision' : isCoach ? 'Coach Bio' : 'About Story', passed: Boolean(description && description.length > 20), weight: 20 },
    { name: 'Direct Phone', passed: Boolean(contactPhone), weight: 15 },
    { name: 'Email Address', passed: Boolean(contactEmail), weight: 10 },
    { name: isCommunity ? 'Community City' : isOrganizer ? 'Headquarters City' : isAssociation ? 'Secretariat City' : 'Campus City', passed: Boolean(city), weight: 15 },
    { name: isCommunity ? 'Community Sports' : isOrganizer ? 'Sports Hosted' : 'Sports Listed', passed: sportsOffered.length > 0, weight: 15 },
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
          Loading {isCommunity ? 'Community' : isOrganizer ? 'Organizer' : isAssociation ? 'Association' : isCoach ? 'Coach' : 'Academy'} Profile...
        </p>
      </div>
    );
  }

  return (
    <div
      className="min-h-full w-full pb-28 md:pb-16 text-foreground relative"
      style={{
        backgroundColor: 'var(--athlon-bg)',
        paddingTop: 'max(1.25rem, calc(env(safe-area-inset-top, 0px) + 0.75rem))',
      }}
    >
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-[140px] opacity-15"
          style={{ background: 'var(--athlon-primary)' }}
        />
        <div
          className="absolute top-1/3 -right-32 w-96 h-96 rounded-full blur-[160px] opacity-10"
          style={{ background: '#10B981' }}
        />
      </div>

      <div className="relative z-10 w-full max-w-lg md:max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 flex flex-col gap-3.5 md:gap-6 pt-1.5">
        {/* Toast Feedback */}
        {toastMessage && (
          <div
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl shadow-2xl border backdrop-blur-xl flex items-center gap-2.5 text-xs font-black transition-all animate-bounce ${toastMessage.type === 'success'
              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
              : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
              }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        )}

        {/* ─── 1. DESKTOP ARENA SHOWCASE HERO CARD (Desktop Only, hidden on mobile) ─── */}
        <section
          className="hidden md:block relative w-full rounded-[32px] overflow-hidden border shadow-2xl transition-all"
          style={{
            backgroundColor: 'var(--athlon-card)',
            borderColor: 'var(--athlon-border)',
            boxShadow:
              '0 20px 48px -12px var(--athlon-shadow, rgba(0, 0, 0, 0.16)), 0 0 0 1px var(--athlon-border), inset 0 1px 1px 0 rgba(255, 255, 255, 0.12)',
          }}
        >
          {/* Top Edge Neon Energy Rail */}
          <div
            className="absolute top-0 inset-x-0 h-[2.5px] opacity-90 pointer-events-none z-20"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, var(--athlon-primary) 50%, transparent 100%)',
            }}
          />

          {/* Widescreen Cinematic Cover Canvas */}
          <div className="relative w-full h-64 lg:h-72 overflow-hidden group">
            <img
              src={bannerError ? 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1600&q=80' : coverUrl}
              alt=""
              onError={() => setBannerError(true)}
              className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
            />
            {/* Cinematic Gradient Veil */}
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--athlon-card)] via-black/40 to-black/75" />

            {/* Top Navigation & Action Deck */}
            <div className="absolute top-5 inset-x-6 lg:inset-x-8 flex items-center justify-between gap-4 z-20">
              {/* Left: Back & Breadcrumb */}
              <div className="flex items-center gap-3">
                <Link
                  href={`/org/${orgId}/dashboard`}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-white/20 bg-black/60 hover:bg-black/80 text-white text-xs font-bold backdrop-blur-md transition-all active:scale-95 shadow-md"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                </Link>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/15 bg-black/50 backdrop-blur-md text-[11px] font-bold text-white/90">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-primary font-black uppercase">{type} PROFILE</span>
                </div>
              </div>

              {/* Right: Quick Action Controls */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/20 bg-black/60 hover:bg-black/80 text-white text-xs font-bold backdrop-blur-md transition-all active:scale-95 shadow-md cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Marketplace Preview</span>
                </button>

                <button
                  type="button"
                  onClick={() => router.push(`/org/${orgId}/settings?tab=profile`)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-black text-xs font-black transition-all active:scale-95 shadow-lg shadow-primary/30 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsThemeModalOpen(true)}
                  className="w-8 h-8 rounded-xl border border-white/20 bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-all active:scale-95 shadow-md cursor-pointer"
                  title="Theme & Accent"
                >
                  <Palette className="w-3.5 h-3.5 text-primary" />
                </button>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="w-8 h-8 rounded-xl border border-white/20 bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-all active:scale-95 shadow-md cursor-pointer"
                  title="Share Profile"
                >
                  <Share2 className="w-3.5 h-3.5 text-primary" />
                </button>

                <Link
                  href={`/org/${orgId}/settings`}
                  className="w-8 h-8 rounded-xl border border-white/20 bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-all active:scale-95 shadow-md"
                  title="Workspace Settings"
                >
                  <Settings className="w-3.5 h-3.5 text-white/80" />
                </Link>
              </div>
            </div>
          </div>

          {/* Identity & Main Info Deck */}
          <div className="relative px-6 sm:px-8 pb-7 pt-0 z-10">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 -mt-16 lg:-mt-20">
              {/* Avatar + Main Headline */}
              <div className="flex items-start lg:items-end gap-5 min-w-0 flex-1">
                {/* Avatar Emblem Tile */}
                <div className="relative group/avatar shrink-0 z-20">
                  <div
                    className="w-24 h-24 lg:w-32 lg:h-32 rounded-3xl border-4 p-1 overflow-hidden shadow-2xl flex items-center justify-center transition-all duration-300 group-hover/avatar:scale-105"
                    style={{
                      backgroundColor: 'var(--athlon-card)',
                      borderColor: 'var(--athlon-card)',
                      boxShadow:
                        '0 16px 36px -8px var(--athlon-shadow, rgba(0,0,0,0.25)), 0 0 0 2.5px var(--athlon-primary)',
                    }}
                  >
                    {logoUrl && !logoError ? (
                      <img
                        src={logoUrl}
                        alt=""
                        onError={() => setLogoError(true)}
                        className="w-full h-full object-cover rounded-2xl"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-black text-2xl lg:text-3xl rounded-2xl">
                        {name ? name.substring(0, 2).toUpperCase() : 'AT'}
                      </div>
                    )}
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-card flex items-center justify-center shadow-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-300 animate-ping" />
                  </span>
                </div>

                {/* Identity Title & Description */}
                <div className="min-w-0 flex-1 space-y-1.5 pt-4 lg:pt-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-xs"
                      style={{
                        backgroundColor: 'var(--athlon-primary-soft)',
                        borderColor: 'var(--athlon-primary)',
                        color: 'var(--athlon-primary)',
                      }}
                    >
                      {type}
                    </span>

                    {admissionStatus === 'OPEN' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        {isCommunity ? 'Open to All Members' : isOrganizer ? 'Tournament Entries Open' : 'Admissions Open'}
                      </span>
                    ) : admissionStatus === 'LIMITED' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        {isCommunity ? 'Limited Spots' : isOrganizer ? 'Limited Entries' : 'Limited Slots'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                        {isCommunity ? 'Invite Only' : isOrganizer ? 'Registration Closed' : 'Waitlist'}
                      </span>
                    )}

                    {city && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-foreground/60">
                        <MapPin className="w-3 h-3 text-primary" />
                        {[city, state, country].filter(Boolean).join(', ')}
                      </span>
                    )}
                  </div>

                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-foreground tracking-tight leading-tight truncate">
                    {name}
                  </h1>

                  <p className="text-xs sm:text-sm text-foreground/70 font-medium leading-relaxed max-w-3xl line-clamp-2">
                    {bio || (isCommunity
                      ? 'Set your community mission, sports activities, member meetups, and club spirit.'
                      : isOrganizer
                        ? 'Set your organization bio, tournament hosting credentials, and venue details.'
                        : isAssociation
                          ? 'Set your association mission, sports governance details, and affiliated zones.'
                          : isCoach
                            ? 'Set your coaching philosophy, career achievements, and training methodologies.'
                            : 'Set your academy tagline, coaching ethos, and public sports facilities.')}
                  </p>
                </div>
              </div>
            </div>

            {/* Telemetry Strip with 4 Institutional Metrics */}
            <div
              className="grid grid-cols-2 lg:grid-cols-4 divide-x rounded-2xl p-3 mt-6 border backdrop-blur-md"
              style={{
                backgroundColor: 'var(--athlon-surface)',
                borderColor: 'var(--athlon-border)',
              }}
            >
              <div className="flex flex-col items-center justify-center text-center px-3 py-1" style={{ borderColor: 'var(--athlon-border)' }}>
                <span className="text-sm lg:text-base font-black text-primary font-mono leading-none">
                  {establishedYear || '2020'}
                </span>
                <span className="text-[9.5px] font-bold text-text-muted uppercase tracking-wider mt-1.5 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-primary/70" />
                  {isCommunity ? 'Active Since' : 'Established'}
                </span>
              </div>

              <div className="flex flex-col items-center justify-center text-center px-3 py-1" style={{ borderColor: 'var(--athlon-border)' }}>
                <span className="text-sm lg:text-base font-black text-emerald-400 font-mono leading-none">
                  {sportsOffered.length} Sports
                </span>
                <span className="text-[9.5px] font-bold text-text-muted uppercase tracking-wider mt-1.5 flex items-center gap-1">
                  <Dumbbell className="w-3 h-3 text-emerald-400/70" />
                  Disciplines Listed
                </span>
              </div>

              <div className="flex flex-col items-center justify-center text-center px-3 py-1" style={{ borderColor: 'var(--athlon-border)' }}>
                <span className="text-sm lg:text-base font-black text-foreground font-mono leading-none truncate max-w-full">
                  {registrationNumber || 'ATH-VERIFIED'}
                </span>
                <span className="text-[9.5px] font-bold text-text-muted uppercase tracking-wider mt-1.5 flex items-center gap-1">
                  <FileCheck className="w-3 h-3 text-foreground/70" />
                  {isOrganizer ? 'Reg. / Org ID' : 'Affiliation ID'}
                </span>
              </div>

              <div className="flex flex-col items-center justify-center text-center px-3 py-1" style={{ borderColor: 'var(--athlon-border)' }}>
                <div className="flex items-center gap-2">
                  <span className="text-sm lg:text-base font-black text-primary font-mono leading-none">
                    {completenessScore}%
                  </span>
                  <div className="w-16 h-1.5 rounded-full bg-foreground/10 overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${completenessScore}%` }} />
                  </div>
                </div>
                <span className="text-[9.5px] font-bold text-text-muted uppercase tracking-wider mt-1.5 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-primary" />
                  Profile Completeness
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 2. ATHLON ARENA HERO CARD (Mobile Only, hidden on desktop) ─── */}
        <section
          className="block md:hidden relative w-full rounded-[26px] overflow-hidden border p-4 sm:p-5 shadow-xl transition-all"
          style={{
            backgroundColor: 'var(--athlon-card)',
            borderColor: 'var(--athlon-border)',
            boxShadow:
              '0 12px 32px -6px var(--athlon-shadow, rgba(0, 0, 0, 0.15)), 0 0 0 1px var(--athlon-border), inset 0 1px 1px 0 rgba(255, 255, 255, 0.12)',
          }}
        >
          {/* Top Edge Neon Energy Rail */}
          <div
            className="absolute top-0 inset-x-0 h-[2px] opacity-75 pointer-events-none z-0"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, var(--athlon-primary) 50%, transparent 100%)',
            }}
          />

          {/* Stadium Floodlight Spotlights */}
          <div
            className="absolute -top-16 -right-16 w-60 h-60 rounded-full blur-3xl pointer-events-none opacity-40 dark:opacity-60 animate-pulse duration-1000 z-0"
            style={{
              background: 'radial-gradient(circle, var(--athlon-primary) 0%, rgba(16, 185, 129, 0.3) 40%, transparent 75%)',
            }}
          />

          {/* Specular Sheen Arc */}
          <div className="absolute inset-x-0 top-0 h-[35%] bg-gradient-to-b from-white/[0.12] dark:from-white/[0.04] via-transparent to-transparent pointer-events-none z-0" />

          <div className="relative z-10 space-y-3.5">
            {/* Top Control Bar inside Hero */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Link
                  href={`/org/${orgId}/dashboard`}
                  className="w-7 h-7 rounded-lg border flex items-center justify-center text-foreground/70 hover:text-foreground active:scale-95 transition-all shrink-0 shadow-sm backdrop-blur-md"
                  style={{ borderColor: 'var(--athlon-border)', backgroundColor: 'var(--athlon-surface)' }}
                  title="Back to Hub"
                >
                  <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                </Link>

                <div
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border backdrop-blur-md"
                  style={{
                    backgroundColor: 'var(--athlon-primary-soft)',
                    borderColor: 'var(--athlon-primary)',
                  }}
                >
                  <span className="relative flex h-2 w-2">
                    <span
                      className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                      style={{ backgroundColor: 'var(--athlon-primary)' }}
                    />
                    <span
                      className="relative inline-flex rounded-full h-2 w-2"
                      style={{ backgroundColor: 'var(--athlon-primary)' }}
                    />
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-primary truncate flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-primary" />
                    {type} PROFILE
                  </span>
                </div>
              </div>

              {/* Action Buttons: Options & Share */}
              <div className="flex items-center gap-1.5 shrink-0 relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="w-7 h-7 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground active:scale-95 cursor-pointer shadow-sm backdrop-blur-md"
                  style={{ borderColor: 'var(--athlon-border)', backgroundColor: 'var(--athlon-surface)' }}
                  title="Profile Options"
                >
                  <Settings className="w-3.5 h-3.5 text-primary" />
                </button>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="w-7 h-7 rounded-xl border flex items-center justify-center text-foreground/70 hover:text-foreground active:scale-95 cursor-pointer shadow-sm backdrop-blur-md"
                  style={{ borderColor: 'var(--athlon-border)', backgroundColor: 'var(--athlon-surface)' }}
                  title="Share Profile"
                >
                  <Share2 className="w-3.5 h-3.5 text-primary" />
                </button>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                  <div className="absolute right-0 top-9 w-52 bg-card/95 border border-border rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-1.5 flex flex-col gap-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          setIsMenuOpen(false);
                          router.push(`/org/${orgId}/settings?tab=profile`);
                        }}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-foreground hover:bg-foreground/5 hover:text-primary transition-colors text-left"
                      >
                        <Edit3 className="w-4 h-4 text-primary shrink-0" />
                        <span className="flex-1">Edit Profile</span>
                        <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsMenuOpen(false);
                          setIsThemeModalOpen(true);
                        }}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-foreground hover:bg-foreground/5 hover:text-primary transition-colors text-left"
                      >
                        <Palette className="w-4 h-4 text-primary shrink-0" />
                        <span className="flex-1">Appearance &amp; Theme</span>
                        <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsMenuOpen(false);
                          setShowPreviewModal(true);
                        }}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-foreground hover:bg-foreground/5 hover:text-primary transition-colors text-left"
                      >
                        <Eye className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span className="flex-1">Marketplace Preview</span>
                        <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
                      </button>

                      <div className="my-1 border-t border-border" />

                      <Link
                        href={`/org/${orgId}/settings`}
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-foreground/80 hover:bg-foreground/5 hover:text-foreground transition-colors text-left"
                      >
                        <Settings className="w-4 h-4 text-text-muted shrink-0" />
                        <span className="flex-1">Settings</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          setIsMenuOpen(false);
                          logout();
                          window.location.href = '/';
                        }}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition-colors text-left w-full"
                      >
                        <LogOut className="w-4 h-4 text-rose-500 shrink-0" />
                        <span className="flex-1">Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Clean Cover Banner Frame */}
            <div className="relative w-full h-32 sm:h-48 rounded-2xl overflow-hidden border border-white/10 shadow-inner group">
              <img
                src={bannerError ? 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1600&q=80' : coverUrl}
                alt=""
                onError={() => setBannerError(true)}
                className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Identity Info Block (Below banner with clean avatar and typography) */}
            <div className="flex items-start gap-3 sm:gap-4 pt-0.5">
              <div className="relative group/avatar shrink-0">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-surface border-2 border-background p-0.5 overflow-hidden shadow-lg ring-2 ring-primary/30 flex items-center justify-center bg-gradient-to-br from-surface to-background">
                  {logoUrl && !logoError ? (
                    <img
                      src={logoUrl}
                      alt=""
                      onError={() => setLogoError(true)}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-black text-lg sm:text-xl rounded-xl">
                      {name ? name.substring(0, 2).toUpperCase() : 'AT'}
                    </div>
                  )}
                </div>
              </div>

              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h1 className="text-[17px] sm:text-[20px] font-black leading-tight tracking-tight uppercase text-foreground truncate">
                    {name}
                  </h1>
                  {admissionStatus === 'OPEN' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      {isCommunity ? 'Open to All' : isOrganizer ? 'Entries Open' : 'Admissions Open'}
                    </span>
                  ) : admissionStatus === 'LIMITED' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      {isCommunity ? 'Limited Spots' : isOrganizer ? 'Limited Entries' : 'Limited Slots'}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                      {isCommunity ? 'Invite Only' : isOrganizer ? 'Closed' : 'Waitlist'}
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-text-secondary leading-relaxed font-medium line-clamp-2">
                  {bio || (isCommunity
                    ? 'Set your community mission, sports activities, member meetups, and club spirit.'
                    : isOrganizer
                      ? 'Set your organization bio, tournament hosting credentials, and venue details.'
                      : isAssociation
                        ? 'Set your association mission, sports governance details, and affiliated zones.'
                        : isCoach
                          ? 'Set your coaching philosophy, career achievements, and training methodologies.'
                          : 'Set your academy tagline, coaching ethos, and public sports facilities.')}
                </p>
              </div>
            </div>

            {/* Live Telemetry Strip with 3 Metrics */}
            <div
              className="grid grid-cols-3 divide-x rounded-2xl p-2.5 mt-1 border backdrop-blur-md"
              style={{
                backgroundColor: 'var(--athlon-surface)',
                borderColor: 'var(--athlon-border)',
              }}
            >
              <div
                className="flex flex-col items-center justify-center text-center px-1"
                style={{ borderColor: 'var(--athlon-border)' }}
              >
                <span className="text-xs font-black text-primary font-mono leading-none truncate max-w-full">
                  {establishedYear || '2020'}
                </span>
                <span className="text-[8.5px] font-bold text-text-muted uppercase tracking-wider mt-1 truncate max-w-full">
                  {isCommunity ? 'Active Since' : 'Established'}
                </span>
              </div>

              <div
                className="flex flex-col items-center justify-center text-center px-1"
                style={{ borderColor: 'var(--athlon-border)' }}
              >
                <span className="text-xs font-black text-emerald-400 font-mono leading-none truncate max-w-full">
                  {sportsOffered.length}
                </span>
                <span className="text-[8.5px] font-bold text-text-muted uppercase tracking-wider mt-1 truncate max-w-full">
                  {isCommunity ? 'Sports' : 'Disciplines'}
                </span>
              </div>

              <div
                className="flex flex-col items-center justify-center text-center px-1"
                style={{ borderColor: 'var(--athlon-border)' }}
              >
                <span className="text-xs font-black text-foreground font-mono leading-none truncate max-w-full">
                  {isCommunity
                    ? (admissionStatus === 'OPEN' ? 'Open' : admissionStatus === 'LIMITED' ? 'Limited' : 'Invite Only')
                    : `${completenessScore}%`}
                </span>
                <span className="text-[8.5px] font-bold text-text-muted uppercase tracking-wider mt-1 truncate max-w-full">
                  {isCommunity ? 'Join Status' : 'Completeness'}
                </span>
              </div>
            </div>

            {/* Profile Completeness Mini-Bar (Hidden for Community Profiles) */}
            {!isCommunity && (
              <div className="pt-2 border-t border-foreground/5 space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span className="text-foreground/70 uppercase tracking-wider flex items-center gap-1 font-black">
                    <Flame className="w-3 h-3 text-primary" /> Profile Completeness
                  </span>
                  <span className="text-primary font-mono font-black">{completenessScore}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-surface overflow-hidden border border-foreground/5">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${completenessScore}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════
            PROFILE SHOWCASE MAIN CONTENT (Read-Only Polished Cards)
           ══════════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 pb-24">
          {/* Left Column: Story, Sports & Campus */}
          <div className="lg:col-span-8 space-y-4 sm:space-y-6">
            {/* 1. About Story & Philosophy (Hidden for Community Profiles) */}
            {!isCommunity && (
              <div className="bg-card p-4 sm:p-6 md:p-7 rounded-2xl md:rounded-[28px] border border-border shadow-sm md:shadow-xl space-y-4 relative overflow-hidden backdrop-blur-md">
                {/* Top Accent Line */}
                <div
                  className="absolute top-0 inset-x-0 h-[2px] opacity-75 pointer-events-none z-0"
                  style={{
                    background: 'linear-gradient(90deg, transparent 0%, var(--athlon-primary) 50%, transparent 100%)',
                  }}
                />

                <div className="border-b border-border pb-3 relative z-10">
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
                  <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed whitespace-pre-line break-words [overflow-wrap:anywhere] relative z-10">
                    {description}
                  </p>
                ) : (
                  <p className="text-xs sm:text-sm text-text-muted italic relative z-10">
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
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 relative z-10">
                  <div className="p-3 rounded-2xl bg-surface border border-border text-center shadow-xs">
                    <div className="text-[10px] font-bold text-text-muted uppercase">Established</div>
                    <div className="text-sm sm:text-base font-black text-foreground mt-0.5">{establishedYear || '2020'}</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-surface border border-border text-center shadow-xs">
                    <div className="text-[10px] font-bold text-text-muted uppercase">
                      {isOrganizer ? 'Reg. / Org ID' : 'Affiliation ID'}
                    </div>
                    <div className="text-sm sm:text-base font-black text-foreground mt-0.5 truncate">{registrationNumber || 'ORG-REG'}</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-surface border border-border text-center shadow-xs">
                    <div className="text-[10px] font-bold text-text-muted uppercase">Org Type</div>
                    <div className="text-sm sm:text-base font-black text-primary mt-0.5">{type}</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-surface border border-border text-center shadow-xs">
                    <div className="text-[10px] font-bold text-text-muted uppercase">Status</div>
                    <div className="text-sm sm:text-base font-black text-emerald-400 mt-0.5">{admissionStatus}</div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Sports Disciplines Trained / Organized */}
            <div className="bg-card p-4 sm:p-6 md:p-7 rounded-2xl md:rounded-[28px] border border-border shadow-sm md:shadow-xl space-y-4 relative overflow-hidden backdrop-blur-md">
              <div className="border-b border-border pb-3">
                <h2 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-primary" />
                  {isCommunity
                    ? `Community Sports (${sportsOffered.length})`
                    : isOrganizer
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
                  const matched = dynamicSports.find((p) => p.name.toLowerCase() === sport.toLowerCase()) ||
                    POPULAR_SPORTS.find((p) => p.name.toLowerCase() === sport.toLowerCase());
                  const icon = matched ? matched.icon : '🏅';
                  return (
                    <div
                      key={sport}
                      className="p-3.5 rounded-2xl bg-surface border border-border flex items-center gap-3 hover:border-primary/50 hover:shadow-md hover:shadow-primary/5 transition-all group"
                    >
                      <span className="text-2xl transition-transform duration-200 group-hover:scale-110">{icon}</span>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs sm:text-sm font-bold text-foreground truncate">{sport}</div>
                        <div className="text-[10px] font-semibold text-primary">
                          {isCommunity ? 'Community Sport' : isOrganizer ? 'Active Sport' : 'Active Program'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Location & Directions */}
            <div className="bg-card p-4 sm:p-6 md:p-7 rounded-2xl md:rounded-[28px] border border-border shadow-sm md:shadow-xl space-y-4 overflow-hidden relative backdrop-blur-md">
              <div className="border-b border-border pb-3">
                <h2 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary shrink-0" />
                  <span className="truncate">
                    {isCommunity
                      ? 'Community Base & Meetup Location'
                      : isOrganizer
                        ? 'Headquarters & Operational Base'
                        : isAssociation
                          ? 'Secretariat / Office Location'
                          : isCoach
                            ? 'Training Base & Location'
                            : 'Campus Location & Directions'}
                  </span>
                </h2>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full min-w-0 overflow-hidden">
                <div className="flex items-start gap-3.5 min-w-0 flex-1 w-full">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPinned className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="text-xs sm:text-sm font-bold text-foreground break-words [overflow-wrap:anywhere] leading-relaxed">
                      {address || (isCommunity
                        ? 'Community home venue or meetup location not provided'
                        : isOrganizer
                          ? 'Headquarters / venue address not provided'
                          : isAssociation
                            ? 'Secretariat office address not provided'
                            : isCoach
                              ? 'Training base address not provided'
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
                    className="px-4 py-2.5 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-black transition-all text-xs font-bold flex items-center gap-2 shrink-0 self-start sm:self-center shadow-xs"
                  >
                    <span>View on Maps</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Contact Channels & Operations Hub */}
          <div className="lg:col-span-4 space-y-4 sm:space-y-6">
            {/* Direct Contact Channels Card */}
            <div className="bg-card p-4 sm:p-6 md:p-7 rounded-2xl md:rounded-[28px] border border-border shadow-sm md:shadow-xl space-y-4 relative overflow-hidden backdrop-blur-md">
              <div className="border-b border-border pb-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" />
                  {isCommunity ? 'Community Contacts' : 'Direct Channels'}
                </h3>
              </div>

              <div className="space-y-2.5">
                {/* Phone */}
                <div className="p-3.5 rounded-2xl bg-surface border border-border flex items-center justify-between transition-all hover:border-emerald-500/40">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold text-text-muted uppercase">
                        {isCommunity ? 'Community Lead / WhatsApp' : 'Phone / WhatsApp'}
                      </div>
                      <div className="text-xs font-bold text-foreground truncate">{contactPhone || 'Not set'}</div>
                    </div>
                  </div>
                  {contactPhone && (
                    <a
                      href={`tel:${contactPhone}`}
                      className="px-3 py-1 rounded-xl bg-emerald-500/15 text-emerald-400 text-xs font-bold hover:bg-emerald-500/25 transition-all"
                    >
                      Call
                    </a>
                  )}
                </div>

                {/* Email */}
                <div className="p-3.5 rounded-2xl bg-surface border border-border flex items-center justify-between transition-all hover:border-primary/40">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold text-text-muted uppercase">
                        {isCommunity ? 'Community Email' : 'Inquiries Email'}
                      </div>
                      <div className="text-xs font-bold text-foreground truncate">{contactEmail || 'Not set'}</div>
                    </div>
                  </div>
                  {contactEmail && (
                    <a
                      href={`mailto:${contactEmail}`}
                      className="px-3 py-1 rounded-xl bg-primary/15 text-primary text-xs font-bold hover:bg-primary/25 transition-all"
                    >
                      Email
                    </a>
                  )}
                </div>

                {/* Website */}
                {website && (
                  <div className="p-3.5 rounded-2xl bg-surface border border-border flex items-center justify-between transition-all hover:border-cyan-500/40">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-cyan-500/15 flex items-center justify-center shrink-0">
                        <Globe className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] font-bold text-text-muted uppercase">Website</div>
                        <div className="text-xs font-bold text-foreground truncate">{website}</div>
                      </div>
                    </div>
                    <a
                      href={website.startsWith('http') ? website : `https://${website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 rounded-xl bg-cyan-500/15 text-cyan-400 text-xs font-bold hover:bg-cyan-500/25 transition-all"
                    >
                      Visit
                    </a>
                  </div>
                )}

                {/* Instagram */}
                {instagram && (
                  <div className="p-3.5 rounded-2xl bg-surface border border-border flex items-center justify-between transition-all hover:border-pink-500/40">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-pink-500/15 flex items-center justify-center shrink-0">
                        <Share2 className="w-4 h-4 text-pink-400" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] font-bold text-text-muted uppercase">Instagram</div>
                        <div className="text-xs font-bold text-foreground truncate">{instagram}</div>
                      </div>
                    </div>
                    <a
                      href={`https://instagram.com/${instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 rounded-xl bg-pink-500/15 text-pink-400 text-xs font-bold hover:bg-pink-500/25 transition-all"
                    >
                      Follow
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Operations & Modules Shortcut Hub (Hidden for Community Profiles) */}
            {!isCommunity && (
              <div className="bg-card p-4 sm:p-6 md:p-7 rounded-2xl md:rounded-[28px] border border-border shadow-sm md:shadow-xl space-y-4 relative overflow-hidden backdrop-blur-md">
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
                        className="p-3.5 rounded-2xl bg-surface hover:bg-surface-hover border border-border hover:border-primary/40 transition-all group shadow-xs"
                      >
                        <Trophy className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                        <div className="text-xs font-bold text-foreground mt-2">Tournaments</div>
                        <div className="text-[10px] text-text-muted">Draws &amp; matches</div>
                      </Link>

                      <Link
                        href={`/org/${orgId}/registrations`}
                        className="p-3.5 rounded-2xl bg-surface hover:bg-surface-hover border border-border hover:border-primary/40 transition-all group shadow-xs"
                      >
                        <Users className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                        <div className="text-xs font-bold text-foreground mt-2">Registrations</div>
                        <div className="text-[10px] text-text-muted">Player entries</div>
                      </Link>

                      <Link
                        href={`/org/${orgId}/finances`}
                        className="p-3.5 rounded-2xl bg-surface hover:bg-surface-hover border border-border hover:border-primary/40 transition-all group shadow-xs"
                      >
                        <Banknote className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                        <div className="text-xs font-bold text-foreground mt-2">Finances</div>
                        <div className="text-[10px] text-text-muted">Revenue &amp; expenses</div>
                      </Link>

                      <Link
                        href={`/org/${orgId}/settings?tab=permissions`}
                        className="p-3.5 rounded-2xl bg-surface hover:bg-surface-hover border border-border hover:border-primary/40 transition-all group shadow-xs"
                      >
                        <ShieldCheck className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                        <div className="text-xs font-bold text-foreground mt-2">Roles &amp; Access</div>
                        <div className="text-[10px] text-text-muted">Officials &amp; staff</div>
                      </Link>

                      <Link
                        href={`/org/${orgId}/facilities`}
                        className="p-3.5 rounded-2xl bg-surface hover:bg-surface-hover border border-border hover:border-primary/40 transition-all group shadow-xs"
                      >
                        <Building2 className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                        <div className="text-xs font-bold text-foreground mt-2">Venues &amp; Courts</div>
                        <div className="text-[10px] text-text-muted">Match facilities</div>
                      </Link>

                      <Link
                        href={`/org/${orgId}/posts`}
                        className="p-3.5 rounded-2xl bg-surface hover:bg-surface-hover border border-border hover:border-primary/40 transition-all group shadow-xs"
                      >
                        <Newspaper className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                        <div className="text-xs font-bold text-foreground mt-2">Media &amp; News</div>
                        <div className="text-[10px] text-text-muted">Updates &amp; posters</div>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        href={`/org/${orgId}/facilities`}
                        className="p-3.5 rounded-2xl bg-surface hover:bg-surface-hover border border-border hover:border-primary/40 transition-all group shadow-xs"
                      >
                        <Building2 className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                        <div className="text-xs font-bold text-foreground mt-2">Courts &amp; Facilities</div>
                        <div className="text-[10px] text-text-muted">Venues &amp; booking</div>
                      </Link>

                      <Link
                        href={`/org/${orgId}/batches`}
                        className="p-3.5 rounded-2xl bg-surface hover:bg-surface-hover border border-border hover:border-primary/40 transition-all group shadow-xs"
                      >
                        <Layers className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                        <div className="text-xs font-bold text-foreground mt-2">Coaching Batches</div>
                        <div className="text-[10px] text-text-muted">Schedules &amp; plans</div>
                      </Link>

                      <Link
                        href={`/org/${orgId}/students`}
                        className="p-3.5 rounded-2xl bg-surface hover:bg-surface-hover border border-border hover:border-primary/40 transition-all group shadow-xs"
                      >
                        <Users className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                        <div className="text-xs font-bold text-foreground mt-2">Athletes &amp; Students</div>
                        <div className="text-[10px] text-text-muted">Roster &amp; profiles</div>
                      </Link>

                      <Link
                        href={`/org/${orgId}/coaches`}
                        className="p-3.5 rounded-2xl bg-surface hover:bg-surface-hover border border-border hover:border-primary/40 transition-all group shadow-xs"
                      >
                        <Award className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                        <div className="text-xs font-bold text-foreground mt-2">Coaching Staff</div>
                        <div className="text-[10px] text-text-muted">Trainers &amp; mentors</div>
                      </Link>

                      <Link
                        href={`/org/${orgId}/tournaments`}
                        className="p-3.5 rounded-2xl bg-surface hover:bg-surface-hover border border-border hover:border-primary/40 transition-all group shadow-xs"
                      >
                        <Trophy className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                        <div className="text-xs font-bold text-foreground mt-2">Tournaments</div>
                        <div className="text-[10px] text-text-muted">Draws &amp; matches</div>
                      </Link>

                      <Link
                        href={`/org/${orgId}/posts`}
                        className="p-3.5 rounded-2xl bg-surface hover:bg-surface-hover border border-border hover:border-primary/40 transition-all group shadow-xs"
                      >
                        <Newspaper className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                        <div className="text-xs font-bold text-foreground mt-2">Media &amp; Gallery</div>
                        <div className="text-[10px] text-text-muted">Updates &amp; highlights</div>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Session & Account Hub */}
            <div className="bg-card p-4 sm:p-6 md:p-7 rounded-2xl md:rounded-[28px] border border-border shadow-sm md:shadow-xl space-y-3 relative overflow-hidden backdrop-blur-md">
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
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 transition-all active:scale-95 shadow-sm cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out of ATHLON</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Floating Action Button (FAB) for Edit Profile ── */}
        <div className="fixed bottom-22 right-4 md:bottom-8 md:right-8 z-40">
          <Athlon3DFAB
            icon={<Edit3 className="w-6 h-6 text-black stroke-[2.5]" />}
            label="Edit Profile"
            onClick={() => router.push(`/org/${orgId}/settings?tab=profile`)}
            className="fixed bottom-22 right-4 md:bottom-8 md:right-8 z-40"
          />
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
                  <h5 className="text-[11px] font-extrabold text-text-muted uppercase tracking-wider">
                    {isCommunity ? 'About Our Community' : 'About Us'}
                  </h5>
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
