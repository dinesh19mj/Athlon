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
  ChevronDown,
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
import {
  LocationService,
  DistrictItem,
  StateItem,
  FALLBACK_INDIAN_STATES,
  FALLBACK_STATE_DISTRICTS,
} from '@/lib/api/location';

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
  const [admissionStatus, setAdmissionStatus] = useState<string>('OPEN');

  // Branding States
  const [logoUrl, setLogoUrl] = useState(activeOrg?.logo || '');
  const [coverUrl, setCoverUrl] = useState(
    'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1600&q=80'
  );

  // Contact & Location States
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('Karnataka');
  const [country, setCountry] = useState('India');
  const [postalCode, setPostalCode] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [instagram, setInstagram] = useState('');

  // Location lists for dynamic dropdowns
  const [statesList, setStatesList] = useState<string[]>(FALLBACK_INDIAN_STATES);
  const [districtsList, setDistrictsList] = useState<string[]>(FALLBACK_STATE_DISTRICTS['Karnataka'] || []);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  // Sports
  const [selectedSports, setSelectedSports] = useState<string[]>(['Badminton']);
  const [customSportInput, setCustomSportInput] = useState('');

  // Media files & raw backend identifiers
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [savedLogoRaw, setSavedLogoRaw] = useState<string>('');
  const [savedCoverRaw, setSavedCoverRaw] = useState<string>('');

  // Snapshot tracking for live published status
  const [initialSnapshot, setInitialSnapshot] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Fetch states on mount
  useEffect(() => {
    async function fetchStates() {
      try {
        const res = await LocationService.getAllStates();
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const names = Array.from(new Set(res.data.map((s: StateItem) => s.name))).sort() as string[];
          setStatesList(names);
        } else {
          setStatesList(FALLBACK_INDIAN_STATES);
        }
      } catch {
        setStatesList(FALLBACK_INDIAN_STATES);
      }
    }
    fetchStates();
  }, []);

  // Fetch districts on state change
  useEffect(() => {
    if (!state) {
      setDistrictsList([]);
      return;
    }
    async function fetchDistricts() {
      try {
        setLoadingDistricts(true);
        const res = await LocationService.getDistrictsByStateName(state);
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const names = Array.from(new Set(res.data.map((d: DistrictItem) => d.name))).sort() as string[];
          setDistrictsList(names);
        } else {
          setDistrictsList(FALLBACK_STATE_DISTRICTS[state] || []);
        }
      } catch {
        setDistrictsList(FALLBACK_STATE_DISTRICTS[state] || []);
      } finally {
        setLoadingDistricts(false);
      }
    }
    fetchDistricts();
  }, [state]);

  // Load existing profile from backend
  useEffect(() => {
    async function loadProfile() {
      if (!orgId) return;
      try {
        setLoading(true);
        const res = await OrganizationService.getProfileByOrgUuid(orgId);
        const data = res?.data || res;
        if (data) {
          const loadedName = data.name || activeOrg?.name || '';
          const loadedType = (data.type as any) || 'ACADEMY';
          const loadedBio = data.bio || '';
          const loadedDesc = data.description || '';
          const loadedYear = data.establishedYear !== undefined && data.establishedYear !== null ? data.establishedYear : 2020;
          const loadedReg = data.registrationNumber || '';
          const loadedAdmission = data.admissionStatus || 'OPEN';
          const loadedAddr = data.address || '';
          const loadedCity = data.city || '';
          const loadedDistrict = data.district || '';
          const loadedState = data.state || 'Karnataka';
          const loadedCountry = data.country || 'India';
          const loadedPostal = data.postalCode || '';
          const loadedPhone = data.contactPhone || '';
          const loadedEmail = data.contactEmail || '';
          const loadedWeb = data.website || '';
          const loadedInsta = data.socialInstagram || '';
          
          let loadedSports = ['Badminton'];
          if (data.sportsOffered) {
            const sportsList = data.sportsOffered.split(',').map((s: string) => s.trim()).filter(Boolean);
            if (sportsList.length > 0) loadedSports = sportsList;
          }

          setName(loadedName);
          setType(loadedType);
          setBio(loadedBio);
          setDescription(loadedDesc);
          setEstablishedYear(loadedYear);
          setRegistrationNumber(loadedReg);
          setAdmissionStatus(loadedAdmission);
          setAddress(loadedAddr);
          setCity(loadedCity);
          setDistrict(loadedDistrict);
          setState(loadedState);
          setCountry(loadedCountry);
          setPostalCode(loadedPostal);
          setContactPhone(loadedPhone);
          setContactEmail(loadedEmail);
          setWebsite(loadedWeb);
          setInstagram(loadedInsta);
          setSelectedSports(loadedSports);

          if (data.logo) {
            setLogoUrl(OrganizationService.getLogoUrl(data.logo));
            setSavedLogoRaw(data.logo);
          }
          if (data.banner) {
            setCoverUrl(OrganizationService.getBannerUrl(data.banner));
            setSavedCoverRaw(data.banner);
          }

          // Capture pristine snapshot
          setInitialSnapshot(
            JSON.stringify({
              name: loadedName.trim(),
              type: loadedType,
              bio: loadedBio.trim(),
              description: loadedDesc.trim(),
              establishedYear: loadedYear,
              registrationNumber: loadedReg.trim(),
              admissionStatus: loadedAdmission,
              address: loadedAddr.trim(),
              city: loadedCity.trim(),
              district: loadedDistrict.trim(),
              state: loadedState,
              country: loadedCountry,
              postalCode: loadedPostal.trim(),
              contactPhone: loadedPhone.trim(),
              contactEmail: loadedEmail.trim(),
              website: loadedWeb.trim(),
              instagram: loadedInsta.trim(),
              selectedSports: loadedSports,
              savedLogoRaw: data.logo || '',
              savedCoverRaw: data.banner || '',
            })
          );
        }
      } catch (err: any) {
        console.warn('Could not fetch existing profile, using defaults:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [orgId, activeOrg]);

  // Current State Snapshot & Has Unpublished Changes Flag
  const currentSnapshot = JSON.stringify({
    name: name.trim(),
    type,
    bio: bio.trim(),
    description: description.trim(),
    establishedYear,
    registrationNumber: registrationNumber.trim(),
    admissionStatus,
    address: address.trim(),
    city: city.trim(),
    district: district.trim(),
    state,
    country,
    postalCode: postalCode.trim(),
    contactPhone: contactPhone.trim(),
    contactEmail: contactEmail.trim(),
    website: website.trim(),
    instagram: instagram.trim(),
    selectedSports,
    savedLogoRaw,
    savedCoverRaw,
  });

  const hasUnpublishedChanges = useMemo(() => {
    if (!initialSnapshot) return false;
    if (logoFile !== null || coverFile !== null) return true;
    return initialSnapshot !== currentSnapshot;
  }, [initialSnapshot, currentSnapshot, logoFile, coverFile]);

  // Profile Health Score Calculation
  const profileHealth = useMemo(() => {
    let score = 0;
    const checks = [
      { name: 'Academy Name', passed: Boolean(name.trim()), weight: 20 },
      { name: 'Logo Avatar', passed: Boolean(logoUrl), weight: 15 },
      { name: 'Cover Image', passed: Boolean(coverUrl), weight: 15 },
      { name: 'Location Details', passed: Boolean(city.trim() && address.trim()), weight: 25 },
      { name: 'Contact Phone', passed: Boolean(contactPhone.trim()), weight: 10 },
      { name: 'Sports Listed', passed: selectedSports.length > 0, weight: 15 },
    ];
    checks.forEach((c) => {
      if (c.passed) score += c.weight;
    });
    return { score, checks };
  }, [name, logoUrl, coverUrl, city, address, contactPhone, selectedSports]);

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

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const url = URL.createObjectURL(file);
      setLogoUrl(url);
    }
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      const url = URL.createObjectURL(file);
      setCoverUrl(url);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('organizationUuid', orgId);
      if (name) formData.append('name', name);
      if (type) formData.append('type', type);
      if (bio) formData.append('bio', bio);
      if (description) formData.append('description', description);
      if (establishedYear !== '') formData.append('establishedYear', establishedYear.toString());
      if (registrationNumber) formData.append('registrationNumber', registrationNumber);
      if (admissionStatus) formData.append('admissionStatus', admissionStatus);
      if (address) formData.append('address', address);
      if (city) formData.append('city', city);
      if (district) formData.append('district', district);
      if (state) formData.append('state', state);
      if (country) formData.append('country', country);
      if (postalCode) formData.append('postalCode', postalCode);
      if (contactPhone) formData.append('contactPhone', contactPhone);
      if (contactEmail) formData.append('contactEmail', contactEmail);
      if (website) formData.append('website', website);
      if (instagram) formData.append('socialInstagram', instagram);
      formData.append('sportsOffered', selectedSports.join(','));
      formData.append('isPublic', '1');

      if (logoFile) {
        formData.append('logoFile', logoFile);
      } else if (savedLogoRaw) {
        formData.append('logo', savedLogoRaw);
      }

      if (coverFile) {
        formData.append('bannerFile', coverFile);
      } else if (savedCoverRaw) {
        formData.append('banner', savedCoverRaw);
      }

      const saveRes = await OrganizationService.saveProfileMultipart(formData).catch(async () => {
        // Fallback to JSON saveProfile if multipart endpoint is unreachable
        const jsonPayload: OrganizationProfile = {
          organizationUuid: orgId,
          name,
          type,
          bio,
          description,
          establishedYear: establishedYear === '' ? undefined : Number(establishedYear),
          registrationNumber,
          admissionStatus,
          logo: savedLogoRaw || (!logoUrl.startsWith('blob:') ? logoUrl : undefined),
          banner: savedCoverRaw || (!coverUrl.startsWith('blob:') ? coverUrl : undefined),
          address,
          city,
          district,
          state,
          country,
          postalCode,
          contactPhone,
          contactEmail,
          website,
          socialInstagram: instagram,
          sportsOffered: selectedSports.join(','),
          isPublic: 1,
        };
        return await OrganizationService.saveProfile(jsonPayload);
      });

      const savedData = saveRes?.data || saveRes;
      let newLogoRaw = savedLogoRaw;
      let newCoverRaw = savedCoverRaw;

      if (savedData?.logo) {
        setLogoUrl(OrganizationService.getLogoUrl(savedData.logo));
        setSavedLogoRaw(savedData.logo);
        newLogoRaw = savedData.logo;
        setLogoFile(null);
      }
      if (savedData?.banner) {
        setCoverUrl(OrganizationService.getBannerUrl(savedData.banner));
        setSavedCoverRaw(savedData.banner);
        newCoverRaw = savedData.banner;
        setCoverFile(null);
      }

      if (activeOrg) {
        updateOrganization(activeOrg.id, {
          name,
          type,
          logo: savedData?.logo ? OrganizationService.getLogoUrl(savedData.logo) : logoUrl,
        });
      }

      // Synchronize pristine snapshot with freshly saved values
      setInitialSnapshot(
        JSON.stringify({
          name: name.trim(),
          type,
          bio: bio.trim(),
          description: description.trim(),
          establishedYear,
          registrationNumber: registrationNumber.trim(),
          admissionStatus,
          address: address.trim(),
          city: city.trim(),
          district: district.trim(),
          state,
          country,
          postalCode: postalCode.trim(),
          contactPhone: contactPhone.trim(),
          contactEmail: contactEmail.trim(),
          website: website.trim(),
          instagram: instagram.trim(),
          selectedSports,
          savedLogoRaw: newLogoRaw,
          savedCoverRaw: newCoverRaw,
        })
      );

      // Dispatch global sync event to refresh home and marketplace cards
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('athlon-org-updated', { detail: { orgId } }));
        localStorage.setItem('athlon_org_updated_time', Date.now().toString());
      }

      setSuccessMsg('Academy profile published & synced live to Marketplace and Home page!');
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
                  <span>{selectedSports.length} Sports</span>
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
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg active:scale-95 ${
                  saving
                    ? 'bg-primary text-primary-foreground opacity-70'
                    : hasUnpublishedChanges
                    ? 'bg-primary hover:bg-primary-hover text-primary-foreground shadow-primary/25 cursor-pointer'
                    : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 cursor-default'
                }`}
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : hasUnpublishedChanges ? (
                  <Save className="w-4 h-4" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                )}
                {saving ? 'Publishing...' : hasUnpublishedChanges ? 'Publish Changes Now' : 'Published'}
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

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-2">
                      Marketplace Admissions Status
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {[
                        { value: 'OPEN', label: 'Admissions Open', desc: 'Accepting new athlete enrollments', color: 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10' },
                        { value: 'LIMITED', label: 'Limited Slots Available', desc: 'Few batch seats remaining', color: 'text-amber-500 border-amber-500/30 bg-amber-500/10' },
                        { value: 'CLOSED', label: 'Admissions Closed', desc: 'Waitlist active / fully booked', color: 'text-rose-500 border-rose-500/30 bg-rose-500/10' },
                      ].map((item) => {
                        const isSelected = admissionStatus === item.value;
                        return (
                          <button
                            key={item.value}
                            type="button"
                            onClick={() => setAdmissionStatus(item.value)}
                            className={`p-3 rounded-2xl border text-left transition-all ${
                              isSelected
                                ? `${item.color} shadow-md ring-1 ring-primary/40`
                                : 'bg-surface border-border hover:border-border-strong text-text-secondary hover:text-foreground'
                            }`}
                          >
                            <div className="text-xs font-bold flex items-center justify-between">
                              <span>{item.label}</span>
                              {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                            </div>
                            <p className="text-[10px] text-text-muted mt-0.5">{item.desc}</p>
                          </button>
                        );
                      })}
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
                      Campus Location
                    </h2>
                    {/* <p className="text-xs text-text-secondary mt-0.5">
                      Ensures accurate Google Maps navigation for parents and players
                    </p> */}
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {/* Dynamic State Dropdown */}
                    <div>
                      <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-2">
                        State <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={state}
                          onChange={(e) => {
                            const newState = e.target.value;
                            setState(newState);
                            const fallback = FALLBACK_STATE_DISTRICTS[newState] || [];
                            if (fallback.length > 0) {
                              setDistrict(fallback[0]);
                            } else {
                              setDistrict('');
                            }
                          }}
                          className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition appearance-none cursor-pointer"
                        >
                          <option value="" disabled className="bg-card text-foreground">Select State</option>
                          {statesList.map((st) => (
                            <option key={st} value={st} className="bg-card text-foreground">
                              {st}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                      </div>
                    </div>

                    {/* Dynamic District Dropdown */}
                    <div>
                      <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-2">
                        District <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        {districtsList.length > 0 ? (
                          <select
                            value={district}
                            onChange={(e) => setDistrict(e.target.value)}
                            disabled={loadingDistricts}
                            className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition appearance-none cursor-pointer disabled:opacity-50"
                          >
                            <option value="" disabled className="bg-card text-foreground">
                              {loadingDistricts ? 'Loading...' : 'Select District'}
                            </option>
                            {districtsList.map((dst) => (
                              <option key={dst} value={dst} className="bg-card text-foreground">
                                {dst}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={district}
                            onChange={(e) => setDistrict(e.target.value)}
                            placeholder="e.g. Bengaluru Urban"
                            className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                          />
                        )}
                        {districtsList.length > 0 && (
                          <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                        )}
                      </div>
                    </div>

                    {/* City / Town */}
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

                    {/* PIN Code */}
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

                    {/* Country */}
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
                      Sports ({selectedSports.length})
                    </h2>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Select all sports your academy trains.
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
              {hasUnpublishedChanges ? (
                <span className="text-[10px] font-bold text-amber-500 flex items-center gap-1 animate-pulse">
                  ● Unsaved changes
                </span>
              ) : (
                <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Live on Marketplace
                </span>
              )}
            </div>

            {/* Simulated Marketplace Card */}
            <div className="group relative rounded-[26px] overflow-hidden border border-border bg-card shadow-2xl transition-all select-none">
              <div className="h-[3px] w-full bg-gradient-to-r from-primary via-emerald-400 to-primary/30" />
              
              <div className="relative h-44 bg-surface-hover overflow-hidden">
                <img src={coverUrl} alt="Card Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/30" />
                <div className="absolute inset-0 bg-primary/5 backdrop-blur-[0.5px]" />

                <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/60 text-primary border border-primary/30 backdrop-blur-md shadow-lg">
                    <Sparkles className="w-3 h-3 text-primary" />
                    {type}
                  </span>

                  {admissionStatus === 'OPEN' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-wide bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 backdrop-blur-md shadow-lg">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      Admissions Open
                    </span>
                  ) : admissionStatus === 'LIMITED' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-wide bg-amber-500/20 text-amber-300 border border-amber-500/40 backdrop-blur-md shadow-lg">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      Limited Slots
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-wide bg-rose-500/20 text-rose-300 border border-rose-500/40 backdrop-blur-md shadow-lg">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                      Waitlist
                    </span>
                  )}
                </div>

                <div className="absolute bottom-3 inset-x-3.5 flex items-center gap-3 z-10">
                  <div className="w-12 h-12 rounded-2xl border-2 border-primary/50 overflow-hidden shadow-2xl flex items-center justify-center shrink-0 bg-black/70 backdrop-blur-md">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Mini Logo" className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="w-6 h-6 text-primary" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 drop-shadow-md">
                    <h4 className="text-base font-black text-white leading-tight truncate tracking-tight">
                      {name || 'Academy Title'}
                    </h4>
                    <p className="text-[11px] text-white/85 font-semibold flex items-center gap-1 mt-0.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="truncate">{city ? `${city}, ${state || country}` : 'City, Location'}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 space-y-3.5">
                <div>
                  <span className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider block mb-1.5">
                    Sports Trained
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedSports.slice(0, 4).map((s) => (
                      <span
                        key={s}
                        className="px-2.5 py-1 rounded-xl bg-primary/10 text-primary border border-primary/25 text-[11px] font-bold tracking-tight shadow-sm"
                      >
                        {s}
                      </span>
                    ))}
                    {selectedSports.length > 4 && (
                      <span className="px-2 py-1 rounded-xl bg-surface text-text-secondary text-[11px] font-bold border border-border">
                        +{selectedSports.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="border-t border-border pt-3 flex items-center justify-between text-xs">
                  <span className="text-text-secondary font-bold text-[11px] flex items-center gap-1.5">
                    <Dumbbell className="w-3.5 h-3.5 text-primary shrink-0" />
                    {selectedSports.length} {selectedSports.length === 1 ? 'Sport' : 'Sports'}
                  </span>
                  <span className={`font-black flex items-center gap-1 ${
                    admissionStatus === 'CLOSED'
                      ? 'text-rose-400'
                      : admissionStatus === 'LIMITED'
                      ? 'text-amber-400'
                      : 'text-primary'
                  }`}>
                    {admissionStatus === 'CLOSED'
                      ? 'Waitlist'
                      : admissionStatus === 'LIMITED'
                      ? 'Limited Slots'
                      : 'Admissions Open'}
                    <ChevronRight className="w-4 h-4" />
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
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs transition-all shadow-lg active:scale-95 ${
                  saving
                    ? 'bg-primary text-primary-foreground opacity-70 cursor-wait'
                    : hasUnpublishedChanges
                    ? 'bg-primary hover:bg-primary-hover text-primary-foreground shadow-primary/25 cursor-pointer animate-in fade-in'
                    : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 cursor-default'
                }`}
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : hasUnpublishedChanges ? (
                  <Save className="w-4 h-4" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                )}
                {saving ? 'Publishing Changes...' : hasUnpublishedChanges ? 'Publish Changes Now' : 'Published'}
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
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs transition-all shadow-lg active:scale-95 ${
            saving
              ? 'bg-primary text-primary-foreground opacity-70'
              : hasUnpublishedChanges
              ? 'bg-primary text-primary-foreground shadow-primary/25 cursor-pointer'
              : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 cursor-default'
          }`}
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : hasUnpublishedChanges ? (
            <Save className="w-4 h-4" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          )}
          {saving ? 'Publishing...' : hasUnpublishedChanges ? 'Publish Changes Now' : 'Published'}
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
                  Sports({selectedSports.length})
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
