'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  Camera,
  Share2,
  Check,
  X,
  Save,
  Info,
  Calendar,
  ChevronDown,
  ChevronRight,
  Flame,
  FileCheck,
  MapPinned,
  Lock,
  Compass,
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

export const POPULAR_SPORTS = [
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

interface OrganizationProfileEditorProps {
  orgId: string;
  onSaved?: (data: any) => void;
  onCancel?: () => void;
  isModal?: boolean;
}

export function OrganizationProfileEditor({
  orgId,
  onSaved,
  onCancel,
  isModal = false,
}: OrganizationProfileEditorProps) {
  const { getActiveOrganization, updateOrganization, organizations } = useWorkspaceStore();
  const activeOrg = getActiveOrganization() || organizations.find((o) => o.id === orgId);

  const [activeTab, setActiveTab] = useState<'general' | 'credentials' | 'location' | 'sports'>('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Profile Form States
  const [name, setName] = useState(activeOrg?.name || '');
  const [type, setType] = useState<'PERSONAL' | 'ACADEMY' | 'ASSOCIATION' | 'CLUB' | 'COURT' | 'ORGANIZER' | 'COACH'>(
    (activeOrg?.type as any) || 'ACADEMY'
  );
  const isClub = type === 'CLUB' || activeOrg?.type === 'CLUB';
  const isCoach = type === 'COACH' || activeOrg?.type === 'COACH';
  const isOrganizer = type === 'ORGANIZER' || activeOrg?.type === 'ORGANIZER';
  const isAssociation = type === 'ASSOCIATION' || activeOrg?.type === 'ASSOCIATION';
  const isSingleSport = isClub || isCoach;

  // Coach Credentials & Experience States
  const [coachingExperienceYears, setCoachingExperienceYears] = useState<number | ''>(5);
  const [coachingCertifications, setCoachingCertifications] = useState<string[]>(['Certified Coach']);
  const [newCertInput, setNewCertInput] = useState('');
  const [coachingSpecializations, setCoachingSpecializations] = useState<string[]>(['Singles Tactics', 'Footwork & Agility']);
  const [newSpecInput, setNewSpecInput] = useState('');
  const [playingAchievements, setPlayingAchievements] = useState('');
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
            if (sportsList.length > 0) {
              loadedSports = (loadedType === 'CLUB' || loadedType === 'COACH' || activeOrg?.type === 'CLUB' || activeOrg?.type === 'COACH') && sportsList.length > 1
                ? [sportsList[0]]
                : sportsList;
            }
          }

          // Parse coach credentials if available
          if (data.amenities) {
            try {
              const parsed = JSON.parse(data.amenities);
              if (parsed && typeof parsed === 'object') {
                if (parsed.experienceYears !== undefined) setCoachingExperienceYears(parsed.experienceYears);
                if (Array.isArray(parsed.certifications)) setCoachingCertifications(parsed.certifications);
                if (Array.isArray(parsed.specializations)) setCoachingSpecializations(parsed.specializations);
                if (parsed.playingAchievements) setPlayingAchievements(parsed.playingAchievements);
              }
            } catch {
              // Ignore non-json
            }
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

  const profileHealth = useMemo(() => {
    let score = 0;
    const checks = [
      { name: 'Organization Name', passed: Boolean(name.trim()), weight: 20 },
      { name: 'Logo Avatar', passed: Boolean(logoUrl), weight: 15 },
      { name: 'Cover Banner', passed: Boolean(coverUrl), weight: 15 },
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
    if (isSingleSport) {
      setSelectedSports([sport]);
      return;
    }
    setSelectedSports((prev) =>
      prev.includes(sport) ? prev.filter((s) => s !== sport) : [...prev, sport]
    );
  };

  const handleAddCustomSport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSportInput.trim()) return;
    const s = customSportInput.trim();
    if (isSingleSport) {
      setSelectedSports([s]);
    } else {
      if (!selectedSports.includes(s)) {
        setSelectedSports((prev) => [...prev, s]);
      }
    }
    setCustomSportInput('');
  };

  const handleAddCert = (cert: string) => {
    const val = cert.trim();
    if (!val || coachingCertifications.includes(val)) return;
    setCoachingCertifications([...coachingCertifications, val]);
    setNewCertInput('');
  };

  const handleRemoveCert = (cert: string) => {
    setCoachingCertifications(coachingCertifications.filter((c) => c !== cert));
  };

  const handleAddSpec = (spec: string) => {
    const val = spec.trim();
    if (!val || coachingSpecializations.includes(val)) return;
    setCoachingSpecializations([...coachingSpecializations, val]);
    setNewSpecInput('');
  };

  const handleRemoveSpec = (spec: string) => {
    setCoachingSpecializations(coachingSpecializations.filter((s) => s !== spec));
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

      const coachCredentialsData = JSON.stringify({
        experienceYears: coachingExperienceYears,
        certifications: coachingCertifications,
        specializations: coachingSpecializations,
        playingAchievements,
      });
      formData.append('amenities', coachCredentialsData);

      const saveRes = await OrganizationService.saveProfileMultipart(formData).catch(async () => {
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
          amenities: coachCredentialsData,
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

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('athlon-org-updated', { detail: { orgId } }));
        localStorage.setItem('athlon_org_updated_time', Date.now().toString());
      }

      setSuccessMsg('Organization profile saved & synced live across ATHLON!');
      setTimeout(() => setSuccessMsg(''), 4000);

      if (onSaved) {
        onSaved(savedData);
      }
    } catch (err: any) {
      console.error('Failed to save organization profile:', err);
      setErrorMsg(err.message || 'Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-text-muted font-medium text-xs tracking-wider uppercase">Loading Profile Configuration...</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 w-full max-w-full overflow-x-hidden ${isModal ? '' : 'pb-28 sm:pb-8'}`}>
      {/* ── Banner & Identity Pod Preview ── */}
      <div className="relative rounded-3xl overflow-hidden border border-border bg-card shadow-xl w-full max-w-full">
        {/* Cover Photo Backdrop */}
        <div className="relative w-full h-40 sm:h-52 bg-surface group">
          <img
            src={coverUrl}
            alt="Academy Banner"
            className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-black/40" />

          {/* Cover Action Button */}
          <button
            type="button"
            onClick={() => coverInputRef.current?.click()}
            className="absolute top-3 right-3 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/70 hover:bg-black/90 text-foreground text-xs font-semibold backdrop-blur-md border border-white/15 transition-all shadow-md active:scale-95"
          >
            <Camera className="w-3.5 h-3.5 text-primary" />
            <span>Change Cover</span>
          </button>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            onChange={handleCoverUpload}
            className="hidden"
          />

          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/20 text-primary border border-primary/30 backdrop-blur-md">
              {type}
            </span>
          </div>
        </div>

        {/* Identity & Avatar */}
        <div className="relative px-3.5 sm:px-6 pb-5 pt-0 w-full max-w-full">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-10 sm:-mt-12 relative z-10 w-full">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-3 text-center sm:text-left min-w-0 max-w-full">
              <div className="relative group/avatar shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-surface border-4 border-background p-0.5 overflow-hidden shadow-2xl ring-2 ring-primary/30 flex items-center justify-center">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <Building2 className="w-8 h-8 text-primary" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-1 rounded-xl bg-black/75 opacity-0 group-hover/avatar:opacity-100 flex flex-col items-center justify-center text-[10px] font-semibold text-white transition-opacity backdrop-blur-sm"
                  title="Upload Logo"
                >
                  <Camera className="w-4 h-4 mb-0.5 text-primary" />
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

              <div className="min-w-0 max-w-full">
                <h3 className="text-xl sm:text-2xl font-black text-foreground tracking-tight truncate">
                  {name || 'Organization Name'}
                </h3>
                <p className="text-xs text-text-secondary line-clamp-1 max-w-md">
                  {bio || 'Set tagline, coaching ethos, and public information.'}
                </p>
              </div>
            </div>

            {/* Save / Status Button */}
            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <button
                type="button"
                onClick={() => setShowPreviewModal(true)}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface hover:bg-surface-hover text-foreground text-xs font-bold border border-border transition-all active:scale-95"
              >
                <Eye className="w-3.5 h-3.5 text-primary" />
                <span>Preview</span>
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={saving}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 sm:px-5 py-2 rounded-xl font-bold text-xs transition-all shadow-md active:scale-95 ${saving
                  ? 'bg-primary text-primary-foreground opacity-70 cursor-wait'
                  : hasUnpublishedChanges
                    ? 'bg-primary hover:bg-primary-hover text-primary-foreground shadow-primary/25 cursor-pointer'
                    : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 cursor-default'
                  }`}
              >
                {saving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : hasUnpublishedChanges ? (
                  <Save className="w-3.5 h-3.5" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                )}
                <span>{saving ? 'Publishing...' : hasUnpublishedChanges ? 'Publish Changes' : 'Published'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Completeness Bar */}
        <div className="border-t border-border bg-surface/50 px-3.5 sm:px-6 py-2.5 flex items-center justify-between gap-3 text-xs w-full max-w-full">
          <div className="flex items-center gap-2 shrink-0">
            <Flame className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="font-semibold text-foreground text-[11px]">Completeness:</span>
            <span className="text-primary font-bold text-[11px]">{profileHealth.score}%</span>
          </div>
          <div className="w-24 sm:w-36 h-1.5 bg-surface-hover rounded-full overflow-hidden shrink-0">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${profileHealth.score}%` }}
            />
          </div>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-primary/10 border border-primary/30 text-primary text-xs font-semibold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-primary" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-error/10 border border-error/30 text-error text-xs font-semibold animate-in fade-in">
          <Info className="w-4 h-4 flex-shrink-0 text-error" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ── Segmented Navigation Tabs ── */}
      <div className="flex p-1 rounded-2xl bg-card border border-border gap-1 shadow-inner overflow-x-auto hide-scrollbar w-full max-w-full">
        <button
          type="button"
          onClick={() => setActiveTab('general')}
          className={`flex-1 min-w-[70px] sm:min-w-0 shrink-0 sm:shrink flex items-center justify-center gap-1.5 py-2.5 px-2.5 sm:px-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'general'
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-foreground/70 hover:text-foreground hover:bg-surface'
            }`}
        >
          <Building2 className="w-3.5 h-3.5 shrink-0" />
          <span>Identity</span>
        </button>

        {isCoach && (
          <button
            type="button"
            onClick={() => setActiveTab('credentials')}
            className={`flex-1 min-w-[85px] sm:min-w-0 shrink-0 sm:shrink flex items-center justify-center gap-1.5 py-2.5 px-2.5 sm:px-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'credentials'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-foreground/70 hover:text-foreground hover:bg-surface'
              }`}
          >
            <Award className="w-3.5 h-3.5 shrink-0" />
            <span>Credentials</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setActiveTab('location')}
          className={`flex-1 min-w-[70px] sm:min-w-0 shrink-0 sm:shrink flex items-center justify-center gap-1.5 py-2.5 px-2.5 sm:px-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'location'
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-foreground/70 hover:text-foreground hover:bg-surface'
            }`}
        >
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          <span>Location</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sports')}
          className={`flex-1 min-w-[70px] sm:min-w-0 shrink-0 sm:shrink flex items-center justify-center gap-1.5 py-2.5 px-2.5 sm:px-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'sports'
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-foreground/70 hover:text-foreground hover:bg-surface'
            }`}
        >
          <Dumbbell className="w-3.5 h-3.5 shrink-0" />
          <span>{isSingleSport ? 'Sport' : 'Sports'}</span>
        </button>
      </div>

      {/* ── Tab Contents ── */}
      <div className="space-y-6">
        {/* TAB 1: General */}
        {activeTab === 'general' && (
          <div className="bg-card p-5 sm:p-6 rounded-3xl border border-border space-y-5 shadow-sm animate-in fade-in">
            <div className="border-b border-border pb-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Award className="w-4 h-4 text-primary" /> {isOrganizer ? 'Organizer Identity & Profile' : isAssociation ? 'Association Identity & Profile' : isCoach ? 'Coach Identity & Profile' : 'Organization Identity & Profile'}
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">
                {isOrganizer
                  ? 'Set public organizer name, tournament bio, event vision, and registration intake status.'
                  : isAssociation
                    ? 'Set sports association name, governance details, mission, and affiliation status.'
                    : isCoach
                      ? 'Set coach profile name, training philosophy, career credentials, and intake status.'
                      : 'Set public institutional name, bio, coaching philosophy, and admission intake status.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">
                  {isOrganizer ? 'Organizer / Organization Name *' : isAssociation ? 'Association Name *' : isCoach ? 'Coach / Academy Name *' : 'Organization / Academy Name *'}
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-3 w-4 h-4 text-text-muted" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={isOrganizer ? 'e.g. Apex Smash Open Badminton Tournament Committee' : 'e.g. Apex Smash Badminton Academy'}
                    className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl text-foreground text-xs sm:text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">
                  Organization Type (Restricted)
                </label>
                <div className="flex items-center justify-between px-3.5 py-2 bg-surface border border-border rounded-xl text-text-muted text-xs sm:text-sm cursor-not-allowed">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-bold text-foreground uppercase tracking-wide text-xs">{type}</span>
                    <span className="text-text-muted text-xs truncate hidden sm:inline">
                      • {type === 'ACADEMY' ? 'Sports Academy' : type === 'CLUB' ? 'Sports Club' : type === 'ASSOCIATION' ? 'Sports Association' : type === 'ORGANIZER' ? 'Tournament Organizer' : type === 'COACH' ? 'Certified Coach' : 'Sports Venue'}
                    </span>
                  </div>
                  <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-surface-hover text-text-secondary border border-border">
                    <Lock className="w-3 h-3 text-text-muted" />
                    LOCKED
                  </span>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">
                  Tagline / Bio
                </label>
                <input
                  type="text"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder={isOrganizer
                    ? 'e.g. Premier organizer of national & state ranking badminton championships'
                    : isAssociation
                      ? 'e.g. Official governing body for district sports tournaments'
                      : 'e.g. Nurturing state & national badminton champions since 2018'}
                  className="w-full px-3.5 py-2 bg-background border border-border rounded-xl text-foreground text-xs sm:text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">
                  Established Year
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-3 w-4 h-4 text-text-muted" />
                  <input
                    type="number"
                    value={establishedYear}
                    onChange={(e) => setEstablishedYear(e.target.value ? parseInt(e.target.value) : '')}
                    placeholder="2020"
                    className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl text-foreground text-xs sm:text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">
                  {isOrganizer ? 'Reg. / License ID' : 'Reg. / Affiliation ID'}
                </label>
                <div className="relative">
                  <FileCheck className="absolute left-3.5 top-3 w-4 h-4 text-text-muted" />
                  <input
                    type="text"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    placeholder={isOrganizer ? 'e.g. ORG/TN/2023' : 'e.g. BAI/AFF/2022'}
                    className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl text-foreground text-xs sm:text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">
                  {isOrganizer ? 'Tournament Registrations Status' : 'Admissions Status'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {(isOrganizer
                    ? [
                      { value: 'OPEN', label: 'Registrations Open', desc: 'Accepting tournament entries', color: 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10' },
                      { value: 'LIMITED', label: 'Limited Slots', desc: 'Few category slots left', color: 'text-amber-500 border-amber-500/30 bg-amber-500/10' },
                      { value: 'CLOSED', label: 'Registrations Closed', desc: 'Entries finalized', color: 'text-rose-500 border-rose-500/30 bg-rose-500/10' },
                    ]
                    : [
                      { value: 'OPEN', label: 'Admissions Open', desc: 'Accepting enrollments', color: 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10' },
                      { value: 'LIMITED', label: 'Limited Slots', desc: 'Few seats remaining', color: 'text-amber-500 border-amber-500/30 bg-amber-500/10' },
                      { value: 'CLOSED', label: 'Admissions Closed', desc: 'Waitlist active', color: 'text-rose-500 border-rose-500/30 bg-rose-500/10' },
                    ]
                  ).map((item) => {
                    const isSelected = admissionStatus === item.value;
                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setAdmissionStatus(item.value)}
                        className={`p-3 rounded-2xl border text-left transition-all ${isSelected
                          ? `${item.color} shadow-sm ring-1 ring-primary/40`
                          : 'bg-surface border-border text-text-secondary hover:text-foreground'
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

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">
                  {isOrganizer
                    ? 'About Tournament Organization & Event Vision'
                    : isAssociation
                      ? 'About Sports Association & Governance'
                      : isCoach
                        ? 'About Coaching Philosophy & Ethos'
                        : 'About Organization & Coaching Philosophy'}
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={isOrganizer
                    ? 'Describe your tournament organizing experience, past championships, venues managed, rules followed, and organizing vision...'
                    : isAssociation
                      ? 'Describe your association structure, state/national affiliations, tournaments governed, and sports development roadmap...'
                      : 'Describe your training ethos, certified coaches, batch structures, athlete milestones, and fitness regimen...'}
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground text-xs sm:text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition resize-none leading-relaxed"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB: Coach Credentials & Experience (COACH only) */}
        {activeTab === 'credentials' && (
          <div className="bg-card p-5 sm:p-6 rounded-3xl border border-border space-y-5 shadow-sm animate-in fade-in">
            <div className="border-b border-border pb-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Award className="w-4 h-4 text-primary" /> Professional Coach Credentials & Experience
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">
                Highlight your coaching tenure, official federated certifications, specialization drills, and playing career milestones.
              </p>
            </div>

            <div className="space-y-5">
              {/* Years of Experience */}
              <div className="max-w-xs">
                <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">
                  Coaching Experience (Years) *
                </label>
                <div className="relative">
                  <Sparkles className="absolute left-3.5 top-3 w-4 h-4 text-text-muted" />
                  <input
                    type="number"
                    min={0}
                    max={60}
                    value={coachingExperienceYears}
                    onChange={(e) => setCoachingExperienceYears(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g. 8"
                    className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl text-foreground text-xs sm:text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition font-mono font-bold"
                  />
                </div>
              </div>

              {/* Certifications & Licenses */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider">
                  Certifications & Coaching Licenses ({coachingCertifications.length})
                </label>

                {/* Active Badges */}
                <div className="flex flex-wrap gap-2">
                  {coachingCertifications.map((cert) => (
                    <span
                      key={cert}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-primary/15 text-primary border border-primary/30"
                    >
                      <span>🏅 {cert}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCert(cert)}
                        className="hover:text-red-400 p-0.5"
                        title="Remove"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Add Custom Cert */}
                <div className="flex gap-2 max-w-md pt-1">
                  <input
                    type="text"
                    value={newCertInput}
                    onChange={(e) => setNewCertInput(e.target.value)}
                    placeholder="Add certification (e.g. BWF Level 2, NIS Diploma, AIFF-D)..."
                    className="flex-1 px-3.5 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary transition"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddCert(newCertInput)}
                    className="px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold rounded-xl transition"
                  >
                    Add
                  </button>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] font-bold text-foreground/40 uppercase">Suggestions:</span>
                  {['BWF Level 1', 'BWF Level 2', 'NIS Certified', 'AIFF License', 'USPTA Professional', 'CSCS Fitness'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleAddCert(preset)}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-surface border border-border hover:border-primary/50 text-foreground/70 hover:text-primary transition"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Specializations & Focus Areas */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider">
                  Coaching Specializations & Focus Areas ({coachingSpecializations.length})
                </label>

                {/* Active Badges */}
                <div className="flex flex-wrap gap-2">
                  {coachingSpecializations.map((spec) => (
                    <span
                      key={spec}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-secondary/15 text-foreground border border-border"
                    >
                      <span>🎯 {spec}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSpec(spec)}
                        className="hover:text-red-400 p-0.5"
                        title="Remove"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Add Custom Spec */}
                <div className="flex gap-2 max-w-md pt-1">
                  <input
                    type="text"
                    value={newSpecInput}
                    onChange={(e) => setNewSpecInput(e.target.value)}
                    placeholder="Add specialization (e.g. Footwork & Agility, Smash Power)..."
                    className="flex-1 px-3.5 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary transition"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddSpec(newSpecInput)}
                    className="px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold rounded-xl transition"
                  >
                    Add
                  </button>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] font-bold text-foreground/40 uppercase">Suggestions:</span>
                  {['Singles Tactics', 'Doubles Movement', 'Footwork & Agility', 'High Performance', 'Beginners Fundamentals', 'Match Mental Toughness'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleAddSpec(preset)}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-surface border border-border hover:border-primary/50 text-foreground/70 hover:text-primary transition"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Playing Achievements */}
              <div>
                <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">
                  Playing Career Background & Notable Achievements
                </label>
                <textarea
                  rows={3}
                  value={playingAchievements}
                  onChange={(e) => setPlayingAchievements(e.target.value)}
                  placeholder="e.g. Former State Ranked #2, All-India Inter-University Silver Medalist, National Junior Championship Quarter-Finalist..."
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground text-xs sm:text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition resize-none leading-relaxed"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Location */}
        {activeTab === 'location' && (
          <div className="bg-card p-5 sm:p-6 rounded-3xl border border-border space-y-5 shadow-sm animate-in fade-in">
            <div className="border-b border-border pb-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" /> {isOrganizer ? 'Headquarters Location & Direct Contacts' : isAssociation ? 'Secretariat Location & Direct Contacts' : isCoach ? 'Training Base & Direct Contacts' : 'Campus Location & Direct Contacts'}
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">
                {isOrganizer
                  ? 'Official headquarters address coordinates and organizer / participant communication channels.'
                  : isAssociation
                    ? 'Official secretariat address coordinates and association communication channels.'
                    : 'Accurate address coordinates and parent communication channels.'}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">
                  {isOrganizer ? 'Headquarters / Venue Address *' : isAssociation ? 'Secretariat / Office Address *' : 'Street Address / Campus Landmark *'}
                </label>
                <div className="relative">
                  <MapPinned className="absolute left-3.5 top-3 w-4 h-4 text-text-muted" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={isOrganizer ? 'e.g. Door No. 12, Arena Sports Complex, Stadium Road' : 'e.g. Survey No. 42, Sport Avenue, Near Metro Pillar 128'}
                    className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl text-foreground text-xs sm:text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">
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
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-xs sm:text-sm focus:outline-none focus:border-primary appearance-none cursor-pointer"
                    >
                      <option value="" disabled className="bg-card text-foreground">Select State</option>
                      {statesList.map((st) => (
                        <option key={st} value={st} className="bg-card text-foreground">
                          {st}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">
                    District <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    {districtsList.length > 0 ? (
                      <select
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        disabled={loadingDistricts}
                        className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-xs sm:text-sm focus:outline-none focus:border-primary appearance-none cursor-pointer disabled:opacity-50"
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
                        className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-xs sm:text-sm focus:outline-none focus:border-primary transition"
                      />
                    )}
                    {districtsList.length > 0 && (
                      <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">
                    City / Town *
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Bangalore"
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-xs sm:text-sm focus:outline-none focus:border-primary transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">
                    PIN Code
                  </label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="560102"
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-xs sm:text-sm focus:outline-none focus:border-primary transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">
                    Country
                  </label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="India"
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-xs sm:text-sm focus:outline-none focus:border-primary transition"
                  />
                </div>
              </div>

              {/* Contacts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t border-border">
                <div>
                  <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">
                    Official Phone / WhatsApp *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3 w-4 h-4 text-text-muted" />
                    <input
                      type="text"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl text-foreground text-xs sm:text-sm focus:outline-none focus:border-primary transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">
                    Inquiries Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-text-muted" />
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="contact@apexbadminton.com"
                      className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl text-foreground text-xs sm:text-sm focus:outline-none focus:border-primary transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">
                    Official Website
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-3 w-4 h-4 text-text-muted" />
                    <input
                      type="text"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://apexbadminton.com"
                      className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl text-foreground text-xs sm:text-sm focus:outline-none focus:border-primary transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">
                    Instagram Handle
                  </label>
                  <div className="relative">
                    <Share2 className="absolute left-3.5 top-3 w-4 h-4 text-text-muted" />
                    <input
                      type="text"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      placeholder="@apex_badminton"
                      className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl text-foreground text-xs sm:text-sm focus:outline-none focus:border-primary transition"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Sports */}
        {activeTab === 'sports' && (
          <div className="bg-card p-5 sm:p-6 rounded-3xl border border-border space-y-5 shadow-sm animate-in fade-in">
            <div className="border-b border-border pb-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-primary" /> {isClub ? 'Club Sport Discipline' : 'Sports Disciplines Offered'} ({selectedSports.length})
                </h3>
                {isClub && (
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/25">
                    Single Sport
                  </span>
                )}
              </div>
              <p className="text-xs text-text-secondary mt-0.5">
                {isClub
                  ? 'Select the primary sport discipline for your club.'
                  : 'Select all sport codes trained or hosted at your facilities.'}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {POPULAR_SPORTS.map((item) => {
                const isSelected = selectedSports.includes(item.name);
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => handleSportToggle(item.name)}
                    className={`flex items-center gap-2 p-3 rounded-2xl text-xs font-semibold transition-all border text-left ${isSelected
                      ? 'bg-primary/20 text-primary border-primary/50 shadow-sm'
                      : 'bg-surface text-text-secondary border-border hover:text-foreground'
                      }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    <span className="truncate flex-1">{item.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Custom Sport Adder */}
            <form onSubmit={handleAddCustomSport} className="flex gap-2 max-w-md pt-1">
              <input
                type="text"
                value={customSportInput}
                onChange={(e) => setCustomSportInput(e.target.value)}
                placeholder={isClub ? "Add custom club sport..." : "Add custom sport..."}
                className="flex-1 px-3.5 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary transition"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold rounded-xl transition"
              >
                {isClub ? 'Set Sport' : 'Add'}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* ── Footer Controls ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border">
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-text-secondary hover:text-foreground hover:bg-surface border border-border transition"
          >
            Cancel
          </button>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowPreviewModal(true)}
            className="px-4 py-2.5 rounded-xl bg-surface hover:bg-surface-hover text-foreground text-xs font-bold border border-border transition flex items-center gap-1.5 active:scale-95 shadow-sm"
          >
            <Eye className="w-3.5 h-3.5 text-primary" />
            <span>Preview</span>
          </button>
          <button
            type="button"
            onClick={handleSaveProfile}
            disabled={saving}
            className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md flex items-center gap-2 active:scale-95 ${saving
              ? 'bg-primary text-primary-foreground opacity-70 cursor-wait'
              : hasUnpublishedChanges
                ? 'bg-primary hover:bg-primary-hover text-primary-foreground shadow-primary/25 cursor-pointer'
                : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 cursor-default'
              }`}
          >
            {saving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : hasUnpublishedChanges ? (
              <Save className="w-3.5 h-3.5" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            )}
            <span>{saving ? 'Publishing...' : hasUnpublishedChanges ? 'Publish Changes Now' : 'Published'}</span>
          </button>
        </div>
      </div>

      {/* ── Full Screen Preview Modal ── */}
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

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="relative h-48 rounded-2xl overflow-hidden border border-border shadow-xl">
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
                    <h4 className="text-lg font-bold text-foreground">{name || 'Organization Name'}</h4>
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
                  Sports ({selectedSports.length})
                </h5>
                <div className="flex flex-wrap gap-1.5">
                  {selectedSports.map((s) => (
                    <span
                      key={s}
                      className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/25 text-xs font-semibold"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {description && (
                <div className="space-y-1 border-t border-border pt-3">
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
