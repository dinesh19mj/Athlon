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
} from 'lucide-react';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
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
  'Wooden Flooring',
  'Synthetic BWF Mats',
  'Air Conditioned',
  'Dedicated Parking',
  'Showers & Changing Rooms',
  'Locker Facility',
  'Cafeteria / Refreshments',
  'Pro Sports Shop',
  'Drinking Water Dispenser',
  'High-Speed Wi-Fi',
  'CCTV Surveillance',
  'First Aid & Physio Room',
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

      // Sync with global workspace state
      if (activeOrg) {
        updateOrganization(activeOrg.id, {
          name,
          logo: logoUrl,
        });
      }

      setSuccessMsg('Academy profile updated successfully!');
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
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        <p className="text-zinc-400 font-medium text-sm">Loading Academy Profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-24">
      {/* Header Banner & Titles */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/60 p-6 rounded-2xl border border-zinc-800/80 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white tracking-tight">{name || 'Academy Profile'}</h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wide">
                {type}
              </span>
            </div>
            <p className="text-sm text-zinc-400 mt-0.5">
              Public branding, campus facilities, and sports offerings shown on the marketplace
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowPreviewModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-medium border border-zinc-700/60 transition shadow-sm"
          >
            <Eye className="w-4 h-4 text-zinc-400" />
            Preview
          </button>
          <button
            type="button"
            onClick={handleSaveProfile}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-zinc-950 font-semibold text-sm transition shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Profile
          </button>
        </div>
      </div>

      {/* Alert Messages */}
      {successMsg && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm animate-in fade-in">
          <Info className="w-5 h-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Prominent Coaching & Admissions Hub Link Banner */}
      <div className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-zinc-900/80 to-zinc-900/40 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 border border-emerald-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
              Coaching & Admissions Studio
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Dedicated Hub
              </span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Manage admission statuses, sports-wise coaching fee plans (Monthly, Quarterly), court allocations, and student batches separately.
            </p>
          </div>
        </div>
        <Link
          href={`/org/${orgId}/admissions`}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition flex-shrink-0 group"
        >
          Manage Coaching & Admissions
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-zinc-800 space-x-2">
        <button
          onClick={() => setActiveTab('general')}
          className={`pb-3 px-4 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
            activeTab === 'general'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          1. General Information & Branding
        </button>
        <button
          onClick={() => setActiveTab('location')}
          className={`pb-3 px-4 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
            activeTab === 'location'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <MapPin className="w-4 h-4" />
          2. Location & Contacts
        </button>
        <button
          onClick={() => setActiveTab('sports')}
          className={`pb-3 px-4 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
            activeTab === 'sports'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Dumbbell className="w-4 h-4" />
          3. Sports & Campus Facilities
        </button>
      </div>

      {/* Tab 1: General Information & Branding */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          {/* Visual Media Header (Cover + Logo) */}
          <div className="bg-zinc-900/60 p-6 rounded-2xl border border-zinc-800 space-y-6">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Camera className="w-4 h-4 text-emerald-400" />
              Visual Branding (Cover & Logo)
            </h2>

            {/* Cover Banner Area */}
            <div className="relative w-full h-48 sm:h-64 rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 group">
              <img src={coverUrl} alt="Academy Cover" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent pointer-events-none" />

              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-850 text-xs font-medium text-zinc-200 border border-zinc-700/60 backdrop-blur-md transition shadow-md"
              >
                <Camera className="w-3.5 h-3.5 text-emerald-400" />
                Change Cover
              </button>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverUpload}
                className="hidden"
              />

              {/* Logo Avatar Positioning */}
              <div className="absolute bottom-4 left-6 flex items-end gap-4">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-zinc-900 border-2 border-emerald-500/50 overflow-hidden shadow-2xl flex items-center justify-center group/avatar">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="w-10 h-10 text-emerald-400" />
                  )}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 flex flex-col items-center justify-center text-[10px] font-medium text-white transition"
                  >
                    <Camera className="w-4 h-4 mb-0.5 text-emerald-400" />
                    Change Logo
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </div>
                <div className="mb-2">
                  <h3 className="text-lg font-bold text-white shadow-sm">{name || 'Your Academy'}</h3>
                  <p className="text-xs text-emerald-400 font-medium">Est. {establishedYear || '2020'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Core Info Fields */}
          <div className="bg-zinc-900/60 p-6 rounded-2xl border border-zinc-800 space-y-5">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              Institutional Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Organization / Academy Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Apex Smash Badminton Academy"
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Organization Type
                </label>
                <select
                  value={type}
                  onChange={(e: any) => setType(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-emerald-500 transition"
                >
                  <option value="ACADEMY">Sports Academy (Coaching & Training)</option>
                  <option value="CLUB">Sports Club & Community</option>
                  <option value="ASSOCIATION">Sports Association / Federation</option>
                  <option value="COURT">Dedicated Court & Arena Venue</option>
                  <option value="ORGANIZER">Tournament Organizer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Tagline / Short Bio
                </label>
                <input
                  type="text"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="e.g. Nurturing state & national badminton champions since 2018"
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                    Established Year
                  </label>
                  <input
                    type="number"
                    value={establishedYear}
                    onChange={(e) => setEstablishedYear(e.target.value ? parseInt(e.target.value) : '')}
                    placeholder="2020"
                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                    Reg. / Affiliation ID
                  </label>
                  <input
                    type="text"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    placeholder="e.g. BAI/AFF/2022"
                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                About Academy & Vision (Full Description)
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Share your coaching philosophy, head coaches' credentials, certified training methods, and academy achievements..."
                className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-emerald-500 transition resize-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Location & Contacts */}
      {activeTab === 'location' && (
        <div className="space-y-6">
          <div className="bg-zinc-900/60 p-6 rounded-2xl border border-zinc-800 space-y-5">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              Campus Physical Location
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Street Address / Campus Landmark *
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Survey No. 42, Sport Avenue, Near Metro Pillar 128"
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                    City / Town *
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Bangalore"
                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                    State / Province
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. Karnataka"
                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                    PIN / Postal Code
                  </label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="560102"
                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="India"
                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/60 p-6 rounded-2xl border border-zinc-800 space-y-5">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-400" />
              Direct Contacts & Digital Handles
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Official Phone / WhatsApp *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Official Inquiries Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="contact@apexbadminton.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Website / Booking Portal
                </label>
                <div className="relative">
                  <Globe className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://apexbadminton.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Instagram / Social Handle
                </label>
                <div className="relative">
                  <Share2 className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="@apex_academy_official"
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Sports & Facilities */}
      {activeTab === 'sports' && (
        <div className="space-y-6">
          {/* Sports Selection */}
          <div className="bg-zinc-900/60 p-6 rounded-2xl border border-zinc-800 space-y-4">
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-emerald-400" />
                Sports & Disciplines Offered
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Select all sports your academy trains or provides courts for. These tags allow athletes to filter in the marketplace.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5 pt-2">
              {POPULAR_SPORTS.map((sport) => {
                const isSelected = selectedSports.includes(sport);
                return (
                  <button
                    key={sport}
                    type="button"
                    onClick={() => handleSportToggle(sport)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition border ${
                      isSelected
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm'
                        : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-300'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    {sport}
                  </button>
                );
              })}
            </div>

            {/* Add Custom Sport */}
            <form onSubmit={handleAddCustomSport} className="flex gap-2 max-w-sm pt-2">
              <input
                type="text"
                value={customSportInput}
                onChange={(e) => setCustomSportInput(e.target.value)}
                placeholder="Add other sport / martial art..."
                className="flex-1 px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-emerald-500 transition"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold rounded-xl text-zinc-200 transition"
              >
                Add
              </button>
            </form>
          </div>

          {/* Amenities & Court Specs */}
          <div className="bg-zinc-900/60 p-6 rounded-2xl border border-zinc-800 space-y-5">
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                Court Specifications & Premium Amenities
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Highlight your facility&apos;s standards to inspire confidence in parents and aspiring athletes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-2">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Total Active Courts / Arena Units
                </label>
                <input
                  type="number"
                  value={totalCourts}
                  onChange={(e) => setTotalCourts(e.target.value ? parseInt(e.target.value) : '')}
                  placeholder="4"
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                Academy Amenities & Services
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {AVAILABLE_AMENITIES.map((amenity) => {
                  const hasAmenity = amenities.includes(amenity);
                  return (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => handleAmenityToggle(amenity)}
                      className={`flex items-center gap-2.5 p-3 rounded-xl text-xs font-medium transition border text-left ${
                        hasAmenity
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/40 shadow-sm'
                          : 'bg-zinc-950/70 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${
                          hasAmenity ? 'bg-emerald-500 text-zinc-950' : 'border border-zinc-700'
                        }`}
                      >
                        {hasAmenity && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="truncate">{amenity}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Notice to Admissions */}
          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
            <span>Want to configure coaching fees, batch timings, and seat availability per sport?</span>
            <Link
              href={`/org/${orgId}/admissions`}
              className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1.5"
            >
              Open Admissions Hub <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-400" />
                Academy Marketplace Preview Card
              </h3>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="relative h-44 rounded-xl overflow-hidden border border-zinc-800">
                <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-emerald-500/50 overflow-hidden flex items-center justify-center shadow-lg">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="w-6 h-6 text-emerald-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">{name || 'Academy Name'}</h4>
                    <p className="text-xs text-zinc-300">
                      {city ? `${city}, ${state || country}` : 'Location Not Set'}
                    </p>
                  </div>
                </div>
              </div>

              {bio && <p className="text-xs text-zinc-300 italic">&ldquo;{bio}&rdquo;</p>}

              <div className="space-y-2">
                <h5 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  Sports Offered ({selectedSports.length})
                </h5>
                <div className="flex flex-wrap gap-1.5">
                  {selectedSports.map((s) => (
                    <span
                      key={s}
                      className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h5 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  Facilities & Amenities
                </h5>
                <div className="flex flex-wrap gap-1.5">
                  {amenities.map((a) => (
                    <span
                      key={a}
                      className="px-2.5 py-1 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700/60 text-xs"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>

              {description && (
                <div className="space-y-1">
                  <h5 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">About</h5>
                  <p className="text-xs text-zinc-400 leading-relaxed">{description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
