'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import {
  Building2,
  Upload,
  Save,
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
  Shield,
  Eye,
  Clock,
  DollarSign,
  Calendar,
  Star,
  Check,
  Plus,
  X,
  ExternalLink,
  ChevronRight,
  Info,
  Share2,
  Video
} from 'lucide-react';
import { OrganizationService, OrganizationProfile } from '@/lib/api/organization';

const POPULAR_SPORTS = [
  'Badminton',
  'Cricket',
  'Football',
  'Tennis',
  'Table Tennis',
  'Basketball',
  'Swimming',
  'Squash',
  'Pickleball',
  'Volleyball',
  'Athletics',
  'Martial Arts',
  'Chess',
];

const AVAILABLE_AMENITIES = [
  'Air Conditioned',
  'Wooden Flooring',
  'Synthetic Mats',
  'BWF Approved Lighting',
  'Showers & Changing Rooms',
  'Locker Facility',
  'Cafeteria & Snacks',
  'Pro Shop & Equipment',
  'Dedicated Parking',
  'Free High-Speed Wi-Fi',
  'Physiotherapy & First Aid',
  'Drinking Water Dispenser',
  'Spectator Seating',
  'CCTV Surveillance',
];

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function OrgProfilePage() {
  const params = useParams();
  const orgId = (params?.orgId as string) || '';
  const { getActiveOrganization, updateOrganization, organizations } = useWorkspaceStore();
  const activeOrg = getActiveOrganization() || organizations.find((o) => o.id === orgId);

  const [activeTab, setActiveTab] = useState<'general' | 'location' | 'sports' | 'facility'>('general');
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
  const [isPublic, setIsPublic] = useState(1);

  // Contacts & Location
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [stateName, setStateName] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('India');
  const [website, setWebsite] = useState('');

  // Social Links
  const [socialInstagram, setSocialInstagram] = useState('');
  const [socialFacebook, setSocialFacebook] = useState('');
  const [socialYoutube, setSocialYoutube] = useState('');

  // Media
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  // Sports & Disciplines
  const [selectedSports, setSelectedSports] = useState<string[]>(['Badminton']);
  const [customSportInput, setCustomSportInput] = useState('');

  // Type Specific: Academy
  const [admissionStatus, setAdmissionStatus] = useState('OPEN');
  const [academyLevels, setAcademyLevels] = useState<string[]>(['Beginner', 'Intermediate', 'Advanced']);
  const [monthlyFeeMin, setMonthlyFeeMin] = useState<number | ''>(2000);
  const [monthlyFeeMax, setMonthlyFeeMax] = useState<number | ''>(4500);
  const [selectedOperatingDays, setSelectedOperatingDays] = useState<string[]>([
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
    'Sat',
  ]);
  const [openingTime, setOpeningTime] = useState('06:00 AM');
  const [closingTime, setClosingTime] = useState('09:30 PM');

  // Type Specific: Club / Court / Venue
  const [totalCourts, setTotalCourts] = useState<number | ''>(4);
  const [surfaceType, setSurfaceType] = useState('Synthetic BWF Mats');
  const [pricePerHour, setPricePerHour] = useState<number | ''>(400);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    'Wooden Flooring',
    'Air Conditioned',
    'Dedicated Parking',
    'Showers & Changing Rooms',
  ]);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Fetch initial profile
  useEffect(() => {
    async function loadProfile() {
      if (!orgId) return;
      setLoading(true);
      try {
        const res = await OrganizationService.getProfileByOrgUuid(orgId);
        const p: OrganizationProfile = (res as any)?.data || (res as any);

        if (p) {
          setName(p.name || '');
          if (p.type) setType(p.type as any);
          setBio(p.bio || '');
          setDescription(p.description || '');
          setEstablishedYear(p.establishedYear ?? 2020);
          setRegistrationNumber(p.registrationNumber || '');
          setIsPublic(p.isPublic ?? 1);

          setContactEmail(p.contactEmail || '');
          setContactPhone(p.contactPhone || '');
          setAddress(p.address || '');
          setCity(p.city || '');
          setDistrict(p.district || '');
          setStateName(p.state || '');
          setPostalCode(p.postalCode || '');
          setCountry(p.country || 'India');
          setWebsite(p.website || '');

          setSocialInstagram(p.socialInstagram || '');
          setSocialFacebook(p.socialFacebook || '');
          setSocialYoutube(p.socialYoutube || '');

          if (p.logo) {
            setLogoUrl(p.logo);
            setLogoPreview(OrganizationService.getLogoUrl(p.logo));
          }
          if (p.banner) {
            setBannerUrl(p.banner);
            setBannerPreview(OrganizationService.getBannerUrl(p.banner));
          }

          if (p.sportsOffered) {
            const sports = p.sportsOffered
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean);
            if (sports.length > 0) setSelectedSports(sports);
          }

          if (p.admissionStatus) setAdmissionStatus(p.admissionStatus);
          if (p.academyLevels) {
            const lvls = p.academyLevels
              .split(',')
              .map((l) => l.trim())
              .filter(Boolean);
            if (lvls.length > 0) setAcademyLevels(lvls);
          }
          setMonthlyFeeMin(p.monthlyFeeMin ?? 2000);
          setMonthlyFeeMax(p.monthlyFeeMax ?? 4500);
          if (p.operatingDays) {
            const days = p.operatingDays
              .split(',')
              .map((d) => d.trim())
              .filter(Boolean);
            if (days.length > 0) setSelectedOperatingDays(days);
          }
          setOpeningTime(p.openingTime || '06:00 AM');
          setClosingTime(p.closingTime || '09:30 PM');

          setTotalCourts(p.totalCourts ?? 4);
          setSurfaceType(p.surfaceType || 'Synthetic BWF Mats');
          setPricePerHour(p.pricePerHour ?? 400);
          if (p.amenities) {
            const am = p.amenities
              .split(',')
              .map((a) => a.trim())
              .filter(Boolean);
            if (am.length > 0) setSelectedAmenities(am);
          }
        }
      } catch (err) {
        console.error('Failed to load org profile:', err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [orgId]);

  // Handle Logo Upload
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const preview = URL.createObjectURL(file);
      setLogoPreview(preview);
    }
  };

  // Handle Banner Upload
  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      const preview = URL.createObjectURL(file);
      setBannerPreview(preview);
    }
  };

  // Sport selection toggle
  const toggleSport = (sport: string) => {
    setSelectedSports((prev) =>
      prev.includes(sport) ? prev.filter((s) => s !== sport) : [...prev, sport]
    );
  };

  const addCustomSport = () => {
    if (customSportInput.trim() && !selectedSports.includes(customSportInput.trim())) {
      setSelectedSports((prev) => [...prev, customSportInput.trim()]);
      setCustomSportInput('');
    }
  };

  // Amenity selection toggle
  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  // Day toggle
  const toggleDay = (day: string) => {
    setSelectedOperatingDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  // Level toggle
  const toggleLevel = (lvl: string) => {
    setAcademyLevels((prev) =>
      prev.includes(lvl) ? prev.filter((l) => l !== lvl) : [...prev, lvl]
    );
  };

  // Save Profile Handler
  const handleSave = async () => {
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (logoFile || bannerFile) {
        // Use Multipart FormData
        const formData = new FormData();
        formData.append('organizationUuid', orgId);
        formData.append('name', name);
        formData.append('type', type);
        formData.append('bio', bio);
        formData.append('description', description);
        if (establishedYear) formData.append('establishedYear', establishedYear.toString());
        formData.append('registrationNumber', registrationNumber);
        formData.append('isPublic', isPublic.toString());

        formData.append('contactEmail', contactEmail);
        formData.append('contactPhone', contactPhone);
        formData.append('address', address);
        formData.append('city', city);
        formData.append('district', district);
        formData.append('state', stateName);
        formData.append('country', country);
        formData.append('postalCode', postalCode);
        formData.append('website', website);

        formData.append('socialInstagram', socialInstagram);
        formData.append('socialFacebook', socialFacebook);
        formData.append('socialYoutube', socialYoutube);

        formData.append('sportsOffered', selectedSports.join(', '));
        formData.append('admissionStatus', admissionStatus);
        formData.append('academyLevels', academyLevels.join(', '));
        if (monthlyFeeMin) formData.append('monthlyFeeMin', monthlyFeeMin.toString());
        if (monthlyFeeMax) formData.append('monthlyFeeMax', monthlyFeeMax.toString());
        formData.append('operatingDays', selectedOperatingDays.join(', '));
        formData.append('openingTime', openingTime);
        formData.append('closingTime', closingTime);

        if (totalCourts) formData.append('totalCourts', totalCourts.toString());
        formData.append('surfaceType', surfaceType);
        if (pricePerHour) formData.append('pricePerHour', pricePerHour.toString());
        formData.append('amenities', selectedAmenities.join(', '));

        if (logoFile) formData.append('logoFile', logoFile);
        if (bannerFile) formData.append('bannerFile', bannerFile);

        const res = await OrganizationService.saveProfileMultipart(formData);
        const updated = (res as any)?.data || res;
        if (updated?.logo) setLogoPreview(OrganizationService.getLogoUrl(updated.logo));
        if (updated?.banner) setBannerPreview(OrganizationService.getBannerUrl(updated.banner));
      } else {
        // Standard JSON payload
        const payload: OrganizationProfile = {
          organizationUuid: orgId,
          name,
          type,
          bio,
          description,
          establishedYear: establishedYear ? Number(establishedYear) : undefined,
          registrationNumber,
          isPublic,
          contactEmail,
          contactPhone,
          address,
          city,
          district,
          state: stateName,
          country,
          postalCode,
          website,
          socialInstagram,
          socialFacebook,
          socialYoutube,
          logo: logoUrl || undefined,
          banner: bannerUrl || undefined,
          sportsOffered: selectedSports.join(', '),
          admissionStatus,
          academyLevels: academyLevels.join(', '),
          monthlyFeeMin: monthlyFeeMin ? Number(monthlyFeeMin) : undefined,
          monthlyFeeMax: monthlyFeeMax ? Number(monthlyFeeMax) : undefined,
          operatingDays: selectedOperatingDays.join(', '),
          openingTime,
          closingTime,
          totalCourts: totalCourts ? Number(totalCourts) : undefined,
          surfaceType,
          pricePerHour: pricePerHour ? Number(pricePerHour) : undefined,
          amenities: selectedAmenities.join(', '),
        };

        await OrganizationService.saveProfile(payload);
      }

      // Sync with Workspace Store
      if (activeOrg) {
        updateOrganization(activeOrg.id, {
          name,
          logo: logoPreview || activeOrg.logo,
        });
      }

      setSuccessMsg('Organization profile updated successfully! All changes are live.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setErrorMsg(err.message || 'Failed to save organization profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3 text-foreground/60">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm font-semibold tracking-wide">Loading organization profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* ══════════════════════════════════════════════════════════════════════
          HERO BANNER & LOGO STUDIO
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="relative w-full">
        {/* Banner Area */}
        <div className="relative h-48 sm:h-64 md:h-72 w-full bg-gradient-to-r from-emerald-900/60 via-primary/20 to-black/80 overflow-hidden border-b border-white/10">
          {bannerPreview ? (
            <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-radial from-white/5 to-transparent">
              <Building2 className="w-16 h-16 text-white/20" />
            </div>
          )}

          {/* Banner Dark Vignette Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-black/40 to-transparent" />

          {/* Change Banner Button */}
          <button
            onClick={() => bannerInputRef.current?.click()}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 px-3.5 py-2 rounded-xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 flex items-center gap-2 text-xs font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-black/40"
          >
            <Upload className="w-3.5 h-3.5 text-primary" />
            <span>Change Cover Banner</span>
          </button>
          <input
            type="file"
            ref={bannerInputRef}
            onChange={handleBannerChange}
            accept="image/*"
            className="hidden"
          />
        </div>

        {/* Floating Identity Strip */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-16 sm:-mt-20 relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            {/* Logo Avatar */}
            <div className="relative group w-24 h-24 sm:w-32 sm:h-32 rounded-3xl overflow-hidden border-4 border-background bg-surface shadow-2xl shadow-black/60 shrink-0">
              {logoPreview ? (
                <img src={logoPreview} alt={name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/20 text-primary font-black text-3xl">
                  {name.charAt(0) || 'A'}
                </div>
              )}

              {/* Logo Upload Hover Overlay */}
              <button
                onClick={() => logoInputRef.current?.click()}
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 text-white text-[10px] font-bold transition-opacity"
              >
                <Upload className="w-4 h-4 text-primary" />
                <span>Upload Logo</span>
              </button>
              <input
                type="file"
                ref={logoInputRef}
                onChange={handleLogoChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            {/* Org Title & Badges */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                  {name || 'Organization Name'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-primary/15 text-primary border border-primary/30 uppercase">
                  {type}
                </span>
                {isPublic === 1 ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Public
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-500/15 text-yellow-400 border border-yellow-500/30">
                    Private Only
                  </span>
                )}
              </div>
              <p className="text-xs text-foreground/60 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                <span>{city ? `${city}, ${stateName || 'India'}` : 'Location not set'}</span>
                {establishedYear && <span>• Est. {establishedYear}</span>}
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0 pt-2 md:pt-0">
            <button
              onClick={() => setShowPreviewModal(true)}
              className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-foreground text-xs font-bold transition-all flex items-center gap-2 active:scale-95 shadow-md"
            >
              <Eye className="w-4 h-4 text-primary" />
              <span>Live Card Preview</span>
            </button>

            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-black text-xs font-black tracking-wide transition-all flex items-center gap-2 active:scale-95 shadow-lg shadow-primary/20 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : <Save className="w-4 h-4" />}
              <span>{saving ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          ALERT NOTIFICATIONS
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-6">
        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center gap-3 text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-400 flex items-center gap-3 text-xs font-bold animate-in fade-in">
            <Info className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          TABBED CONFIGURATION HUB
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-6">
        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 overflow-x-auto hide-scrollbar gap-2 sm:gap-4">
          <button
            onClick={() => setActiveTab('general')}
            className={`pb-3 px-3 text-xs font-black flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'general'
                ? 'border-primary text-primary'
                : 'border-transparent text-foreground/50 hover:text-foreground'
              }`}
          >
            <Building2 className="w-4 h-4" />
            <span>1. General Information</span>
          </button>

          <button
            onClick={() => setActiveTab('location')}
            className={`pb-3 px-3 text-xs font-black flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'location'
                ? 'border-primary text-primary'
                : 'border-transparent text-foreground/50 hover:text-foreground'
              }`}
          >
            <MapPin className="w-4 h-4" />
            <span>2. Location & Contacts</span>
          </button>

          <button
            onClick={() => setActiveTab('sports')}
            className={`pb-3 px-3 text-xs font-black flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'sports'
                ? 'border-primary text-primary'
                : 'border-transparent text-foreground/50 hover:text-foreground'
              }`}
          >
            <Dumbbell className="w-4 h-4" />
            <span>3. Sports & Activities</span>
          </button>

          <button
            onClick={() => setActiveTab('facility')}
            className={`pb-3 px-3 text-xs font-black flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'facility'
                ? 'border-primary text-primary'
                : 'border-transparent text-foreground/50 hover:text-foreground'
              }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>4. {type === 'ACADEMY' ? 'Coaching & Admissions' : 'Courts & Facilities'}</span>
          </button>
        </div>

        {/* Tab 1: General Info */}
        {activeTab === 'general' && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-200">
            {/* Basic Info Card */}
            <div className="p-6 rounded-3xl border border-white/10 bg-surface/50 backdrop-blur-sm space-y-4">
              <h2 className="text-sm font-black uppercase tracking-wider text-primary flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <span>Identity Details</span>
              </h2>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground/70">Organization / Academy Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Apex Smash Badminton Academy"
                  className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-background/60 text-xs font-semibold text-foreground focus:outline-none focus:border-primary/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground/70">Organization Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-background/60 text-xs font-semibold text-foreground focus:outline-none focus:border-primary/50"
                  >
                    <option value="ACADEMY">ACADEMY (Coaching)</option>
                    <option value="CLUB">CLUB (Members & Courts)</option>
                    <option value="COURT">COURT / VENUE (Booking)</option>
                    <option value="ORGANIZER">TOURNAMENT ORGANIZER</option>
                    <option value="ASSOCIATION">SPORTS ASSOCIATION</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground/70">Established Year</label>
                  <input
                    type="number"
                    value={establishedYear}
                    onChange={(e) => setEstablishedYear(e.target.value ? Number(e.target.value) : '')}
                    placeholder="e.g. 2018"
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-background/60 text-xs font-semibold text-foreground focus:outline-none focus:border-primary/50"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground/70">Federation / Legal Registration ID</label>
                <input
                  type="text"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                  placeholder="e.g. TN-SPO-2024-8849"
                  className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-background/60 text-xs font-semibold text-foreground focus:outline-none focus:border-primary/50"
                />
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                <div>
                  <div className="text-xs font-black text-foreground">Marketplace Visibility</div>
                  <div className="text-[11px] text-foreground/50">Allow athletes to discover and enroll online</div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPublic((prev) => (prev === 1 ? 0 : 1))}
                  className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${isPublic === 1 ? 'bg-primary' : 'bg-white/10'
                    }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-black shadow-md transition-transform ${isPublic === 1 ? 'translate-x-6' : 'translate-x-0'
                      }`}
                  />
                </button>
              </div>
            </div>

            {/* Description & About Bio */}
            <div className="p-6 rounded-3xl border border-white/10 bg-surface/50 backdrop-blur-sm space-y-4">
              <h2 className="text-sm font-black uppercase tracking-wider text-primary flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>Story & About</span>
              </h2>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground/70">Catchy Tagline / Short Pitch</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Certified International Coaches & Olympic Standard Courts"
                  className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-background/60 text-xs font-semibold text-foreground focus:outline-none focus:border-primary/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground/70">Comprehensive Bio / About Academy</label>
                <textarea
                  rows={5}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Detail your history, head coaches, coaching philosophies, notable tournament champions trained, and training methodology..."
                  className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-background/60 text-xs font-semibold text-foreground focus:outline-none focus:border-primary/50 resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Location & Contacts */}
        {activeTab === 'location' && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-200">
            {/* Address Details */}
            <div className="p-6 rounded-3xl border border-white/10 bg-surface/50 backdrop-blur-sm space-y-4">
              <h2 className="text-sm font-black uppercase tracking-wider text-primary flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Facility Physical Address</span>
              </h2>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground/70">Street Address & Landmark</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 45, Sports Complex Road, Opp. Anna Stadium"
                  className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-background/60 text-xs font-semibold text-foreground focus:outline-none focus:border-primary/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground/70">City / Town</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Chennai"
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-background/60 text-xs font-semibold text-foreground focus:outline-none focus:border-primary/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground/70">District</label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="e.g. Chennai"
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-background/60 text-xs font-semibold text-foreground focus:outline-none focus:border-primary/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground/70">State</label>
                  <input
                    type="text"
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    placeholder="e.g. Tamil Nadu"
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-background/60 text-xs font-semibold text-foreground focus:outline-none focus:border-primary/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground/70">Postal Code (PIN)</label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="e.g. 600028"
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-background/60 text-xs font-semibold text-foreground focus:outline-none focus:border-primary/50"
                  />
                </div>
              </div>
            </div>

            {/* Contacts & Social Media */}
            <div className="p-6 rounded-3xl border border-white/10 bg-surface/50 backdrop-blur-sm space-y-4">
              <h2 className="text-sm font-black uppercase tracking-wider text-primary flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>Contact Channels & Socials</span>
              </h2>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground/70">Official Phone Number</label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-background/60 text-xs font-semibold text-foreground focus:outline-none focus:border-primary/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground/70">Official Email</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="e.g. contact@apexacademy.in"
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-background/60 text-xs font-semibold text-foreground focus:outline-none focus:border-primary/50"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground/70">Website URL</label>
                <input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="e.g. https://apexbadminton.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-background/60 text-xs font-semibold text-foreground focus:outline-none focus:border-primary/50"
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-white/5">
                <label className="text-xs font-bold text-foreground/70">Social Media Links</label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 bg-background/40">
                    <Share2 className="w-4 h-4 text-pink-400 shrink-0" />
                    <input
                      type="text"
                      value={socialInstagram}
                      onChange={(e) => setSocialInstagram(e.target.value)}
                      placeholder="Instagram profile handle or URL"
                      className="w-full bg-transparent text-xs font-medium text-foreground focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 bg-background/40">
                    <Globe className="w-4 h-4 text-blue-400 shrink-0" />
                    <input
                      type="text"
                      value={socialFacebook}
                      onChange={(e) => setSocialFacebook(e.target.value)}
                      placeholder="Facebook Page URL"
                      className="w-full bg-transparent text-xs font-medium text-foreground focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 bg-background/40">
                    <Video className="w-4 h-4 text-red-400 shrink-0" />
                    <input
                      type="text"
                      value={socialYoutube}
                      onChange={(e) => setSocialYoutube(e.target.value)}
                      placeholder="YouTube Channel URL"
                      className="w-full bg-transparent text-xs font-medium text-foreground focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Sports & Disciplines */}
        {activeTab === 'sports' && (
          <div className="mt-6 p-6 rounded-3xl border border-white/10 bg-surface/50 backdrop-blur-sm space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-primary flex items-center gap-2">
                <Dumbbell className="w-4 h-4" />
                <span>Sports & Disciplines Offered</span>
              </h2>
              <p className="text-xs text-foreground/50 mt-1">
                Select all sports your academy trains or provides courts for. These tags allow athletes to filter in the marketplace.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {POPULAR_SPORTS.map((sport) => {
                const isSelected = selectedSports.includes(sport);
                return (
                  <button
                    key={sport}
                    type="button"
                    onClick={() => toggleSport(sport)}
                    className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 border ${isSelected
                        ? 'bg-primary text-black border-primary font-black shadow-md shadow-primary/20 scale-105'
                        : 'bg-white/[0.04] text-foreground/70 border-white/10 hover:border-white/20 hover:text-foreground'
                      }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    <span>{sport}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Sport Adder */}
            <div className="flex items-center gap-2 max-w-md pt-4 border-t border-white/5">
              <input
                type="text"
                value={customSportInput}
                onChange={(e) => setCustomSportInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCustomSport()}
                placeholder="Add other sport / martial art..."
                className="flex-1 px-4 py-2 rounded-xl border border-white/10 bg-background/60 text-xs font-semibold text-foreground focus:outline-none focus:border-primary/50"
              />
              <button
                type="button"
                onClick={addCustomSport}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-foreground text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 text-primary" />
                <span>Add</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 4: Specialty & Facility Configuration */}
        {activeTab === 'facility' && (
          <div className="mt-6 space-y-6 animate-in fade-in duration-200">
            {/* For ACADEMY: Admissions, Fees & Batches */}
            {type === 'ACADEMY' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Admission Status & Fees */}
                <div className="p-6 rounded-3xl border border-white/10 bg-surface/50 backdrop-blur-sm space-y-4">
                  <h2 className="text-sm font-black uppercase tracking-wider text-primary flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Admission & Coaching Fees</span>
                  </h2>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground/70">Current Admission Status</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'OPEN', label: 'Admissions Open', color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10' },
                        { id: 'FEW_LEFT', label: 'Few Spots Left', color: 'text-yellow-400 border-yellow-500/40 bg-yellow-500/10' },
                        { id: 'WAITLIST', label: 'Waitlist Only', color: 'text-blue-400 border-blue-500/40 bg-blue-500/10' },
                        { id: 'CLOSED', label: 'Admissions Closed', color: 'text-red-400 border-red-500/40 bg-red-500/10' },
                      ].map((st) => (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => setAdmissionStatus(st.id)}
                          className={`p-3 rounded-2xl border text-xs font-bold text-left transition-all ${admissionStatus === st.id ? `${st.color} font-black ring-1 ring-primary` : 'border-white/10 bg-white/[0.02] text-foreground/60'
                            }`}
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground/70">Min Monthly Fee (₹)</label>
                      <input
                        type="number"
                        value={monthlyFeeMin}
                        onChange={(e) => setMonthlyFeeMin(e.target.value ? Number(e.target.value) : '')}
                        placeholder="e.g. 2000"
                        className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-background/60 text-xs font-semibold text-foreground focus:outline-none focus:border-primary/50"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground/70">Max Monthly Fee (₹)</label>
                      <input
                        type="number"
                        value={monthlyFeeMax}
                        onChange={(e) => setMonthlyFeeMax(e.target.value ? Number(e.target.value) : '')}
                        placeholder="e.g. 5000"
                        className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-background/60 text-xs font-semibold text-foreground focus:outline-none focus:border-primary/50"
                      />
                    </div>
                  </div>

                  {/* Coaching Levels */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground/70">Coaching Levels Supported</label>
                    <div className="flex flex-wrap gap-2">
                      {['Beginner', 'Intermediate', 'Advanced', 'Elite Pro', 'Summer Camp'].map((lvl) => {
                        const isSelected = academyLevels.includes(lvl);
                        return (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => toggleLevel(lvl)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${isSelected
                                ? 'bg-primary/20 text-primary border-primary/40 font-black'
                                : 'bg-white/[0.04] text-foreground/50 border-white/10'
                              }`}
                          >
                            {lvl}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Timings & Days */}
                <div className="p-6 rounded-3xl border border-white/10 bg-surface/50 backdrop-blur-sm space-y-4">
                  <h2 className="text-sm font-black uppercase tracking-wider text-primary flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Operating Hours & Active Days</span>
                  </h2>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground/70">Days Open</label>
                    <div className="flex gap-2">
                      {DAYS_OF_WEEK.map((day) => {
                        const isSelected = selectedOperatingDays.includes(day);
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => toggleDay(day)}
                            className={`w-10 h-10 rounded-xl text-xs font-bold transition-all flex items-center justify-center border ${isSelected
                                ? 'bg-primary text-black font-black border-primary shadow-md shadow-primary/20'
                                : 'bg-white/[0.04] text-foreground/60 border-white/10'
                              }`}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground/70">Opening Time</label>
                      <input
                        type="text"
                        value={openingTime}
                        onChange={(e) => setOpeningTime(e.target.value)}
                        placeholder="06:00 AM"
                        className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-background/60 text-xs font-semibold text-foreground focus:outline-none focus:border-primary/50"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground/70">Closing Time</label>
                      <input
                        type="text"
                        value={closingTime}
                        onChange={(e) => setClosingTime(e.target.value)}
                        placeholder="10:00 PM"
                        className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-background/60 text-xs font-semibold text-foreground focus:outline-none focus:border-primary/50"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Courts, Surface & Amenities Checklist (For all org types) */}
            <div className="p-6 rounded-3xl border border-white/10 bg-surface/50 backdrop-blur-sm space-y-6">
              <h2 className="text-sm font-black uppercase tracking-wider text-primary flex items-center gap-2">
                <Layers className="w-4 h-4" />
                <span>Court Specifications & Premium Amenities</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground/70">Total Courts / Pitches</label>
                  <input
                    type="number"
                    value={totalCourts}
                    onChange={(e) => setTotalCourts(e.target.value ? Number(e.target.value) : '')}
                    placeholder="e.g. 6"
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-background/60 text-xs font-semibold text-foreground focus:outline-none focus:border-primary/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground/70">Court Surface Type</label>
                  <input
                    type="text"
                    value={surfaceType}
                    onChange={(e) => setSurfaceType(e.target.value)}
                    placeholder="e.g. Wooden + Synthetic BWF Mats"
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-background/60 text-xs font-semibold text-foreground focus:outline-none focus:border-primary/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground/70">Hourly Booking Rate (₹/hr)</label>
                  <input
                    type="number"
                    value={pricePerHour}
                    onChange={(e) => setPricePerHour(e.target.value ? Number(e.target.value) : '')}
                    placeholder="e.g. 450"
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-background/60 text-xs font-semibold text-foreground focus:outline-none focus:border-primary/50"
                  />
                </div>
              </div>

              {/* Amenities Grid */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                <label className="text-xs font-bold text-foreground/70">Available Amenities & Features</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                  {AVAILABLE_AMENITIES.map((amenity) => {
                    const isSelected = selectedAmenities.includes(amenity);
                    return (
                      <button
                        key={amenity}
                        type="button"
                        onClick={() => toggleAmenity(amenity)}
                        className={`p-3 rounded-2xl border text-xs font-bold text-left transition-all flex items-center justify-between ${isSelected
                            ? 'bg-primary/15 text-primary border-primary/40 font-black shadow-sm'
                            : 'bg-white/[0.02] text-foreground/60 border-white/10 hover:border-white/20'
                          }`}
                      >
                        <span className="truncate">{amenity}</span>
                        {isSelected && <Check className="w-4 h-4 text-primary shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          LIVE MARKETPLACE CARD PREVIEW MODAL
         ══════════════════════════════════════════════════════════════════════ */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-surface border border-white/15 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl space-y-4">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary" />
                <span className="text-xs font-black uppercase tracking-wider text-foreground">
                  Marketplace Card Simulation
                </span>
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-foreground/60 hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Simulated Marketplace Card */}
            <div className="p-4">
              <div className="group relative rounded-3xl border border-white/15 bg-gradient-to-b from-white/[0.06] to-transparent overflow-hidden shadow-xl">
                {/* Banner */}
                <div className="relative h-36 w-full overflow-hidden bg-surface">
                  {bannerPreview ? (
                    <img src={bannerPreview} alt={name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/10">
                      <Building2 className="w-12 h-12 text-white/20" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-primary text-black uppercase shadow-md">
                      {type}
                    </span>
                    {admissionStatus === 'OPEN' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white shadow-md">
                        Admissions Open
                      </span>
                    )}
                  </div>

                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-black text-amber-400 border border-white/10">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>4.9</span>
                    <span className="text-[9px] text-white/60 font-normal">(50+)</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl overflow-hidden border border-white/15 bg-surface shrink-0">
                      {logoPreview ? (
                        <img src={logoPreview} alt={name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/20 text-primary font-black text-sm">
                          {name.charAt(0) || 'A'}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-black text-foreground truncate">{name || 'Organization Name'}</h3>
                      <p className="text-[11px] text-foreground/60 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-primary shrink-0" />
                        <span className="truncate">{city ? `${city}, ${stateName || 'India'}` : 'Location'}</span>
                      </p>
                    </div>
                  </div>

                  {description && <p className="text-xs text-foreground/70 line-clamp-2">{description}</p>}

                  {/* Sports tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {selectedSports.slice(0, 3).map((sp) => (
                      <span
                        key={sp}
                        className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-foreground/80"
                      >
                        {sp}
                      </span>
                    ))}
                    {selectedSports.length > 3 && (
                      <span className="px-1.5 py-0.5 rounded-lg bg-white/5 text-[10px] text-foreground/50 font-bold">
                        +{selectedSports.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Footer Stats & Button */}
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-foreground/50 font-bold">Coaching Fee</div>
                      <div className="text-xs font-black text-primary">
                        {monthlyFeeMin ? `₹${monthlyFeeMin.toLocaleString()}` : '₹2,000'}
                        {monthlyFeeMax ? ` - ₹${monthlyFeeMax.toLocaleString()}` : ''}
                        <span className="text-[10px] text-foreground/50 font-normal">/mo</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="px-4 py-2 rounded-xl bg-primary text-black font-black text-xs shadow-md shadow-primary/20"
                    >
                      Enroll Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
