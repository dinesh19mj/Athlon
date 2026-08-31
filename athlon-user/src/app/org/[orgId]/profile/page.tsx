'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  Layers,
  Dumbbell,
  Eye,
  Camera,
  Share2,
  Plus,
  Check,
  X,
  Save,
  ArrowRight,
  Info,
  ShieldCheck,
  Calendar,
  ExternalLink,
  ChevronRight,
  Sliders,
  Flame,
  Star,
  Users,
  Compass,
  FileCheck,
  MapPinned,
  Wifi,
  Car,
  Bath,
  Lock,
  Coffee,
  ShoppingBag,
  Droplets,
  Video,
  HeartPulse,
  Wind,
} from 'lucide-react';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { OrganizationService, OrganizationProfile } from '@/lib/api/organization';

const POPULAR_SPORTS = [
  { name: 'Badminton', icon: '🏸' },
  { name: 'Cricket', icon: '🏏' },
  { name: 'Football', icon: '⚽' },
  { name: 'Tennis', icon: '🎾' },
  { name: 'Table Tennis', icon: '🏓' },
  { name: 'Basketball', icon: '🏀' },
  { name: 'Swimming', icon: '🏊' },
  { name: 'Squash', icon: '🎯' },
  { name: 'Pickleball', icon: '🏓' },
  { name: 'Volleyball', icon: '🏐' },
  { name: 'Athletics', icon: '🏃' },
  { name: 'Martial Arts', icon: '🥋' },
  { name: 'Chess', icon: '♟️' },
];

const AVAILABLE_AMENITIES = [
  { name: 'Wooden Flooring', icon: Layers, category: 'Court' },
  { name: 'Synthetic BWF Mats', icon: Layers, category: 'Court' },
  { name: 'Air Conditioned', icon: Wind, category: 'Comfort' },
  { name: 'Dedicated Parking', icon: Car, category: 'Facility' },
  { name: 'Showers & Changing Rooms', icon: Bath, category: 'Comfort' },
  { name: 'Locker Facility', icon: Lock, category: 'Facility' },
  { name: 'Cafeteria / Refreshments', icon: Coffee, category: 'Comfort' },
  { name: 'Pro Sports Shop', icon: ShoppingBag, category: 'Facility' },
  { name: 'Drinking Water Dispenser', icon: Droplets, category: 'Facility' },
  { name: 'High-Speed Wi-Fi', icon: Wifi, category: 'Tech' },
  { name: 'CCTV Surveillance', icon: Video, category: 'Tech' },
  { name: 'First Aid & Physio Room', icon: HeartPulse, category: 'Safety' },
];

export default function OrganizationProfilePage() {
  const params = useParams();
  const router = useRouter();
  const orgId = (params?.orgId as string) || '';

  const { getActiveOrganization, updateOrganization, organizations } = useWorkspaceStore();
  const activeOrg = getActiveOrganization() || organizations.find((o) => o.id === orgId);

  const [activeTab, setActiveTab] = useState<'general' | 'location' | 'sports'>('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Profile Form States
  const [name, setName] = useState(activeOrg?.name || '');
  const [type, setType] = useState<'PERSONAL' | 'ACADEMY' | 'ASSOCIATION' | 'CLUB' | 'COURT' | 'ORGANIZER'>(
    (activeOrg?.type as any) || 'ACADEMY'
  );
  const [bio, setBio] = useState('');
  const [description, setDescription] = useState('');
  const [establishedYear, setEstablishedYear] = useState<number | ''>(2020);
  const [registrationNumber, setRegistrationNumber] = useState('');

  // Branding States
  const [logoUrl, setLogoUrl] = useState(activeOrg?.logo || '');
  const [coverUrl, setCoverUrl] = useState(
    'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1600&q=80'
  );

  // Contact & Location States
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('India');
  const [postalCode, setPostalCode] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [instagram, setInstagram] = useState('');

  // Sports & Amenities
  const [selectedSports, setSelectedSports] = useState<string[]>(['Badminton']);
  const [customSportInput, setCustomSportInput] = useState('');
  const [amenities, setAmenities] = useState<string[]>([
    'Wooden Flooring',
    'Synthetic BWF Mats',
    'Dedicated Parking',
    'Showers & Changing Rooms',
    'Drinking Water Dispenser',
  ]);
  const [totalCourts, setTotalCourts] = useState<number | ''>(4);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Load existing profile from backend
  useEffect(() => {
    async function loadProfile() {
      if (!orgId) return;
      try {
        setLoading(true);
        const data = await OrganizationService.getProfileByOrgUuid(orgId);
        if (data) {
          setName(data.name || activeOrg?.name || '');
          if (data.type) setType(data.type as any);
          setBio(data.bio || '');
          setDescription(data.description || '');
          setEstablishedYear(data.establishedYear ?? 2020);
          setRegistrationNumber(data.registrationNumber || '');
          if (data.logo) setLogoUrl(data.logo);
          if (data.banner) setCoverUrl(data.banner);
          setAddress(data.address || '');
          setCity(data.city || '');
          setState(data.state || '');
          setCountry(data.country || 'India');
          setPostalCode(data.postalCode || '');
          setContactPhone(data.contactPhone || '');
          setContactEmail(data.contactEmail || '');
          setWebsite(data.website || '');
          setInstagram(data.socialInstagram || '');
          if (data.sportsOffered) {
            const sportsList = data.sportsOffered.split(',').map((s: string) => s.trim()).filter(Boolean);
            if (sportsList.length > 0) setSelectedSports(sportsList);
          }
          if (data.amenities) {
            const amenList = data.amenities.split(',').map((a: string) => a.trim()).filter(Boolean);
            if (amenList.length > 0) setAmenities(amenList);
          }
          setTotalCourts(data.totalCourts ?? 4);
        }
      } catch (err: any) {
        console.warn('Could not fetch existing profile, using defaults:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [orgId, activeOrg]);

  // Profile Health Score Calculation
  const profileHealth = useMemo(() => {
    let score = 0;
    const checks = [
      { name: 'Academy Name', passed: Boolean(name.trim()), weight: 15 },
      { name: 'Logo Avatar', passed: Boolean(logoUrl), weight: 15 },
      { name: 'Cover Image', passed: Boolean(coverUrl), weight: 10 },
      { name: 'Location Details', passed: Boolean(city.trim() && address.trim()), weight: 20 },
      { name: 'Contact Phone', passed: Boolean(contactPhone.trim()), weight: 15 },
      { name: 'Sports Listed', passed: selectedSports.length > 0, weight: 15 },
      { name: 'Amenities Added', passed: amenities.length > 0, weight: 10 },
    ];
    checks.forEach((c) => {
      if (c.passed) score += c.weight;
    });
    return { score, checks };
  }, [name, logoUrl, coverUrl, city, address, contactPhone, selectedSports, amenities]);

  const handleSportToggle = (sport: string) => {
    setSelectedSports((prev) =>
      prev.includes(sport) ? prev.filter((s) => s !== sport) : [...prev, sport]
    );
  };

  const handleAddCustomSport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSportInput.trim()) return;
    const s = customSportInput.trim();
    if (!selectedSports.includes(s)) {
      setSelectedSports((prev) => [...prev, s]);
    }
    setCustomSportInput('');
  };

  const handleAmenityToggle = (amenity: string) => {
    setAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setLogoUrl(url);
    }
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCoverUrl(url);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const payload: OrganizationProfile = {
        organizationUuid: orgId,
        name,
        type,
        bio,
        description,
        establishedYear: establishedYear === '' ? undefined : Number(establishedYear),
        registrationNumber,
        logo: logoUrl,
        banner: coverUrl,
        address,
        city,
        state,
        country,
        postalCode,
        contactPhone,
        contactEmail,
        website,
        socialInstagram: instagram,
        sportsOffered: selectedSports.join(','),
        amenities: amenities.join(','),
        totalCourts: totalCourts === '' ? undefined : Number(totalCourts),
      };

      await OrganizationService.saveProfile(payload);

      if (activeOrg) {
        updateOrganization(activeOrg.id, {
          name,
          type,
          logo: logoUrl,
        });
      }

      setSuccessMsg('Organization profile and type updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      console.error('Failed to save organization profile:', err);
      setErrorMsg(err.message || 'Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center animate-pulse">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
          <Loader2 className="w-12 h-12 animate-spin text-primary absolute inset-0 opacity-70" />
        </div>
        <p className="text-text-muted font-medium text-xs tracking-wider uppercase">Loading Academy Profile Studio...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pt-6 sm:pt-8 md:pt-10 pb-28 px-2 sm:px-4">
      {/* ══════════════════════════════════════════════════════════════════════
          HERO BANNER & PROFILE IDENTITY POD
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="relative rounded-3xl overflow-hidden border border-border bg-card shadow-2xl">
        {/* Cover Photo Backdrop */}
        <div className="relative w-full h-48 sm:h-64 md:h-72 bg-surface group">
          <img
            src={coverUrl}
            alt="Academy Banner"
            className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-black/40" />
          <div className="absolute inset-0 bg-primary/5 backdrop-blur-[1px]" />

          {/* Cover Action Button */}
          <button
            type="button"
            onClick={() => coverInputRef.current?.click()}
            className="absolute top-4 right-4 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-black/60 hover:bg-black/80 text-foreground text-xs font-semibold backdrop-blur-md border border-white/15 transition-all shadow-lg hover:scale-105 active:scale-95"
          >
            <Camera className="w-4 h-4 text-primary" />
            <span className="hidden sm:inline">Change Cover Photo</span>
            <span className="sm:hidden">Cover</span>
          </button>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            onChange={handleCoverUpload}
            className="hidden"
          />

          {/* Floating Top Stats / Status Badges */}
          <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
            {city && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 text-text-secondary text-xs font-medium border border-white/10 backdrop-blur-md">
                <MapPin className="w-3 h-3 text-primary" />
                {city}, {state || country}
              </span>
            )}
          </div>
        </div>

        {/* Overlapping Identity & Control Card */}
        <div className="relative px-5 sm:px-8 pb-6 pt-0">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 -mt-14 sm:-mt-16 relative z-10">
            {/* Avatar & Title */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
              <div className="relative group/avatar">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl sm:rounded-3xl bg-surface border-4 border-background p-0.5 overflow-hidden shadow-2xl ring-2 ring-primary/30 flex items-center justify-center bg-gradient-to-br from-surface to-background">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="w-full h-full object-cover rounded-xl sm:rounded-2xl" />
                  ) : (
                    <Building2 className="w-10 h-10 text-primary" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-1 rounded-2xl bg-black/75 opacity-0 group-hover/avatar:opacity-100 flex flex-col items-center justify-center text-[11px] font-semibold text-white transition-opacity duration-200 backdrop-blur-sm"
                  title="Upload Logo"
                >
                  <Camera className="w-5 h-5 mb-0.5 text-primary" />
                  Edit Logo
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-2.5 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                    {name || 'Academy Profile'}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                    {type}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-text-secondary max-w-xl line-clamp-1">
                  {bio || 'Set your academy tagline, coaching ethos, and public sports facilities.'}
                </p>
                <div className="flex items-center justify-center sm:justify-start gap-3 pt-1 text-xs text-text-muted">
                  <span className="flex items-center gap-1 font-medium text-primary">
                    <Calendar className="w-3.5 h-3.5" />
                    Est. {establishedYear || '2020'}
                  </span>
                  <span>•</span>
                  <span>{selectedSports.length} Sports Offered</span>
                  <span>•</span>
                  <span>{totalCourts || 4} Arena Courts</span>
                </div>
              </div>
            </div>

            {/* Top Action Bar */}
            <div className="flex items-center justify-center sm:justify-end gap-2.5 flex-wrap w-full md:w-auto">
              <button
                type="button"
                onClick={() => setShowPreviewModal(true)}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-surface hover:bg-surface-hover text-foreground text-xs font-semibold border border-border transition-all shadow-md active:scale-95"
              >
                <Eye className="w-4 h-4 text-primary" />
                Live Preview
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={saving}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover active:scale-95 text-primary-foreground font-bold text-xs transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>

        {/* Profile Strength Quick Bar */}
        <div className="border-t border-border bg-surface/50 px-5 sm:px-8 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-1.5 font-semibold text-foreground">
              <Flame className="w-4 h-4 text-primary" />
              <span>Profile Completeness:</span>
              <span className="text-primary font-bold">{profileHealth.score}%</span>
            </div>
            <div className="flex-1 sm:w-32 h-1.5 bg-surface-hover rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${profileHealth.score}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-text-secondary overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {profileHealth.checks.slice(0, 4).map((c) => (
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

      {/* Notifications */}
      {successMsg && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-primary/10 border border-primary/30 text-primary text-xs font-semibold animate-in fade-in slide-in-from-top-2 shadow-lg shadow-primary/5">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-primary" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-error/10 border border-error/30 text-error text-xs font-semibold animate-in fade-in slide-in-from-top-2">
          <Info className="w-5 h-5 flex-shrink-0 text-error" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          DEDICATED COACHING & BATCHES CALLOUT CARD
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden p-5 sm:p-6 rounded-3xl bg-card/90 border border-primary/30 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 group">
        <div className="absolute top-0 right-0 w-80 h-full bg-primary/5 blur-3xl pointer-events-none" />

        <div className="flex items-start sm:items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/30 text-primary flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/10 group-hover:scale-105 transition-transform">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-foreground tracking-tight">Coaching & Batches</h3>
            </div>
            <p className="text-xs text-text-secondary mt-1 max-w-xl leading-relaxed">
              Configure training venues & courts, student batches, and coaching fee plans.
            </p>
          </div>
        </div>

        <Link
          href={`/org/${orgId}/admissions`}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold transition-all shadow-md shadow-primary/20 flex-shrink-0 group/btn"
        >
          Manage Coaching & Batches
          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          SEGMENTED TAB NAVIGATION
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="flex p-1.5 rounded-2xl bg-card/80 border border-border backdrop-blur-xl gap-1.5 shadow-inner">
        <button
          onClick={() => setActiveTab('general')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all ${activeTab === 'general'
            ? 'bg-primary/15 text-primary border border-primary/30 shadow-md'
            : 'text-text-secondary hover:text-foreground hover:bg-surface'
            }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Identity</span>
        </button>

        <button
          onClick={() => setActiveTab('location')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all ${activeTab === 'location'
            ? 'bg-primary/15 text-primary border border-primary/30 shadow-md'
            : 'text-text-secondary hover:text-foreground hover:bg-surface'
            }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Location</span>
        </button>

        <button
          onClick={() => setActiveTab('sports')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all ${activeTab === 'sports'
            ? 'bg-primary/15 text-primary border border-primary/30 shadow-md'
            : 'text-text-secondary hover:text-foreground hover:bg-surface'
            }`}
        >
          <Dumbbell className="w-4 h-4" />
          <span>Sports</span>
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          MAIN CONTENT AREA (DUAL COLUMN DESKTOP / FLUID MOBILE)
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-8 space-y-6">
          {/* TAB 1: General Information */}
          {activeTab === 'general' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="bg-card/80 p-6 sm:p-7 rounded-3xl border border-border backdrop-blur-xl space-y-6 shadow-xl">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div>
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <Award className="w-4 h-4 text-primary" />
                      Academy Profile
                    </h2>
                  </div>
                  <span className="text-[11px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
                    Step 1 of 3
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-2">
                      Organization / Academy Name *
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-3 w-4 h-4 text-text-muted" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Apex Smash Badminton Academy"
                        className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-2">
                      Organization Type (Restricted)
                    </label>
                    <div className="flex items-center justify-between px-4 py-2.5 bg-surface border border-border rounded-xl text-text-muted text-sm cursor-not-allowed">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-base flex-shrink-0">
                          {type === 'ACADEMY' ? '🏸' : type === 'CLUB' ? '🏆' : type === 'ASSOCIATION' ? '🏛️' : type === 'COURT' ? '🏟️' : '🎯'}
                        </span>
                        <span className="font-bold text-foreground uppercase tracking-wide text-xs">
                          {type}
                        </span>
                        <span className="text-text-muted text-xs truncate hidden sm:inline">
                          • {type === 'ACADEMY' ? 'Sports Academy (Coaching & Training)' : type === 'CLUB' ? 'Sports Club' : type === 'ASSOCIATION' ? 'Sports Association' : type === 'COURT' ? 'Court Venue' : 'Tournament Organizer'}
                        </span>
                      </div>
                      <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-surface-hover text-text-secondary border border-border flex-shrink-0">
                        <Lock className="w-3 h-3 text-text-muted" />
                        LOCKED
                      </span>
                    </div>
                    <p className="text-[10px] text-text-muted mt-1">
                      Institutional classification is fixed upon organization registration.
                    </p>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-2">
                      Tagline / Bio
                    </label>
                    <input
                      type="text"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="e.g. Nurturing state & national badminton champions since 2018"
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-2">
                      Established Year
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3.5 top-3 w-4 h-4 text-text-muted" />
                      <input
                        type="number"
                        value={establishedYear}
                        onChange={(e) => setEstablishedYear(e.target.value ? parseInt(e.target.value) : '')}
                        placeholder="2020"
                        className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-2">
                      Reg. / Affiliation ID
                    </label>
                    <div className="relative">
                      <FileCheck className="absolute left-3.5 top-3 w-4 h-4 text-text-muted" />
                      <input
                        type="text"
                        value={registrationNumber}
                        onChange={(e) => setRegistrationNumber(e.target.value)}
                        placeholder="e.g. BAI/AFF/2022"
                        className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-2">
                    About Academy & Coaching Philosophy (Full Story)
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your training ethos, certified coaches, batch structures, athlete milestones, and fitness regimen..."
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition resize-none leading-relaxed"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Location & Contacts */}
          {activeTab === 'location' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="bg-card/80 p-6 sm:p-7 rounded-3xl border border-border backdrop-blur-xl space-y-6 shadow-xl">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div>
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      Campus Location & Geo Coordinates
                    </h2>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Ensures accurate Google Maps navigation for parents and players
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
                    Step 2 of 3
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-2">
                      Street Address / Campus Landmark *
                    </label>
                    <div className="relative">
                      <MapPinned className="absolute left-3.5 top-3 w-4 h-4 text-text-muted" />
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="e.g. Survey No. 42, Sport Avenue, Near Metro Pillar 128"
                        className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-2">
                        City / Town *
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Bangalore"
                        className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-2">
                        State
                      </label>
                      <input
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="e.g. Karnataka"
                        className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-2">
                        PIN Code
                      </label>
                      <input
                        type="text"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder="560102"
                        className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-2">
                        Country
                      </label>
                      <input
                        type="text"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        placeholder="India"
                        className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Direct Communications */}
              <div className="bg-card/80 p-6 sm:p-7 rounded-3xl border border-border backdrop-blur-xl space-y-6 shadow-xl">
                <div className="border-b border-border pb-4">
                  <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                    <Phone className="w-4 h-4 text-primary" />
                    Direct Contact Channels & Socials
                  </h2>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Parent inquiries, phone bookings, and social community links
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-2">
                      Official Phone / WhatsApp *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-3 w-4 h-4 text-text-muted" />
                      <input
                        type="text"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-2">
                      Inquiries Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3 w-4 h-4 text-text-muted" />
                      <input
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="contact@apexbadminton.com"
                        className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-2">
                      Official Website
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-3.5 top-3 w-4 h-4 text-text-muted" />
                      <input
                        type="text"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="https://apexbadminton.com"
                        className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-2">
                      Instagram / Social Handle
                    </label>
                    <div className="relative">
                      <Share2 className="absolute left-3.5 top-3 w-4 h-4 text-text-muted" />
                      <input
                        type="text"
                        value={instagram}
                        onChange={(e) => setInstagram(e.target.value)}
                        placeholder="@apex_academy_official"
                        className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Sports & Facilities */}
          {activeTab === 'sports' && (
            <div className="space-y-6 animate-in fade-in">
              {/* Sports Picker */}
              <div className="bg-card/80 p-6 sm:p-7 rounded-3xl border border-border backdrop-blur-xl space-y-5 shadow-xl">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div>
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <Dumbbell className="w-4 h-4 text-primary" />
                      Sports Disciplines Offered ({selectedSports.length})
                    </h2>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Select all sports your academy trains for. Athletes search by these tags.
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
                    Step 3 of 3
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 pt-1">
                  {POPULAR_SPORTS.map((item) => {
                    const isSelected = selectedSports.includes(item.name);
                    return (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => handleSportToggle(item.name)}
                        className={`flex items-center gap-2 p-3 rounded-2xl text-xs font-semibold transition-all border text-left ${isSelected
                          ? 'bg-primary/20 text-primary border-primary/50 shadow-md shadow-primary/10 scale-[1.02]'
                          : 'bg-surface text-text-secondary border-border hover:border-border-strong hover:text-foreground'
                          }`}
                      >
                        <span className="text-base">{item.icon}</span>
                        <span className="truncate flex-1">{item.name}</span>
                        {isSelected && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Sport Adder */}
                <form onSubmit={handleAddCustomSport} className="flex gap-2 max-w-md pt-2">
                  <input
                    type="text"
                    value={customSportInput}
                    onChange={(e) => setCustomSportInput(e.target.value)}
                    placeholder="Add custom sport / martial art..."
                    className="flex-1 px-4 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary transition"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold rounded-xl transition"
                  >
                    Add Sport
                  </button>
                </form>
              </div>

              {/* Amenities & Infrastructure */}
              <div className="bg-card/80 p-6 sm:p-7 rounded-3xl border border-border backdrop-blur-xl space-y-6 shadow-xl">
                <div>
                  <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                    <Layers className="w-4 h-4 text-primary" />
                    Infrastructure & Premium Amenities
                  </h2>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Highlight facility specifications to inspire trust in players and parents
                  </p>
                </div>

                <div className="max-w-xs">
                  <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-2">
                    Total Active Courts / Arena Units
                  </label>
                  <div className="relative">
                    <Layers className="absolute left-3.5 top-3 w-4 h-4 text-text-muted" />
                    <input
                      type="number"
                      value={totalCourts}
                      onChange={(e) => setTotalCourts(e.target.value ? parseInt(e.target.value) : '')}
                      placeholder="4"
                      className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-3">
                    Select All Available Campus Amenities ({amenities.length} Active)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {AVAILABLE_AMENITIES.map((item) => {
                      const IconComponent = item.icon;
                      const hasAmenity = amenities.includes(item.name);
                      return (
                        <button
                          key={item.name}
                          type="button"
                          onClick={() => handleAmenityToggle(item.name)}
                          className={`flex items-center gap-3 p-3.5 rounded-2xl text-xs font-semibold transition-all border text-left ${hasAmenity
                            ? 'bg-primary/15 text-primary border-primary/40 shadow-sm shadow-primary/10'
                            : 'bg-surface text-text-secondary border-border hover:border-border-strong hover:text-foreground'
                            }`}
                        >
                          <div
                            className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${hasAmenity ? 'bg-primary text-primary-foreground' : 'bg-surface-hover text-text-muted'
                              }`}
                          >
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <span className="truncate flex-1">{item.name}</span>
                          {hasAmenity && <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Card Inspector & Quick Shortcuts (Desktop Sticky) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Live Preview Card Simulator */}
          <div className="bg-card/80 p-5 rounded-3xl border border-border backdrop-blur-xl shadow-xl space-y-4 sticky top-6">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                Live Marketplace Card
              </span>
              <span className="text-[10px] text-text-muted">Real-time sync</span>
            </div>

            {/* Simulated Marketplace Card */}
            <div className="rounded-2xl overflow-hidden border border-border bg-surface group shadow-2xl">
              <div className="relative h-36 bg-surface-hover overflow-hidden">
                <img src={coverUrl} alt="Card Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-black/40" />

                <div className="absolute top-2.5 right-2.5">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-primary text-primary-foreground shadow-md">
                    {type}
                  </span>
                </div>

                <div className="absolute bottom-2.5 left-3 flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-surface border border-primary/50 overflow-hidden shadow-lg flex items-center justify-center">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Mini Logo" className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground leading-tight line-clamp-1">
                      {name || 'Academy Title'}
                    </h4>
                    <p className="text-[11px] text-text-secondary flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-primary" />
                      {city ? `${city}, ${state || country}` : 'City, Location'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 space-y-3">
                {bio && <p className="text-xs text-text-secondary italic line-clamp-2">&ldquo;{bio}&rdquo;</p>}

                <div>
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">
                    Sports Trained
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {selectedSports.slice(0, 4).map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 text-[10px] font-semibold"
                      >
                        {s}
                      </span>
                    ))}
                    {selectedSports.length > 4 && (
                      <span className="px-1.5 py-0.5 rounded-md bg-surface-hover text-text-muted text-[10px]">
                        +{selectedSports.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="border-t border-border pt-3 flex items-center justify-between text-xs">
                  <span className="text-text-secondary">{totalCourts || 4} Arena Courts</span>
                  <span className="text-primary font-bold flex items-center gap-1">
                    Admissions Open <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Dock */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary hover:bg-primary-hover active:scale-95 text-primary-foreground font-bold text-xs transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Publish Changes Now
              </button>

              <button
                type="button"
                onClick={() => setShowPreviewModal(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-surface hover:bg-surface-hover text-foreground text-xs font-semibold border border-border transition"
              >
                <Eye className="w-4 h-4 text-primary" />
                Full Screen Modal Preview
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          MOBILE FLOATING SAVE DOCK
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 p-3 bg-background/95 border-t border-border backdrop-blur-xl z-40 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setShowPreviewModal(true)}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-surface text-foreground text-xs font-bold border border-border active:scale-95 transition"
        >
          <Eye className="w-4 h-4 text-primary" />
          Preview
        </button>
        <button
          type="button"
          onClick={handleSaveProfile}
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary active:scale-95 text-primary-foreground text-xs font-bold shadow-lg shadow-primary/25 disabled:opacity-50 transition"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Profile
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          FULL-SCREEN PREVIEW MODAL
         ══════════════════════════════════════════════════════════════════════ */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-card border border-border rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between p-4 border-b border-border bg-card/80">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary" />
                Athlete Marketplace Live Listing Preview
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
                    <h4 className="text-lg font-bold text-foreground">{name || 'Academy Name'}</h4>
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
                  Sports Offered ({selectedSports.length})
                </h5>
                <div className="flex flex-wrap gap-1.5">
                  {selectedSports.map((s) => (
                    <span
                      key={s}
                      className="px-3 py-1 rounded-lg bg-primary/10 text-primary border border-primary/25 text-xs font-semibold"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h5 className="text-[11px] font-extrabold text-text-muted uppercase tracking-wider">
                  Facilities & Amenities
                </h5>
                <div className="flex flex-wrap gap-1.5">
                  {amenities.map((a) => (
                    <span
                      key={a}
                      className="px-3 py-1 rounded-lg bg-surface text-foreground border border-border text-xs font-medium"
                    >
                      {a}
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
