'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import {
  Settings,
  User,
  Bell,
  CreditCard,
  ShieldAlert,
  Upload,
  Save,
  Building,
  MapPin,
  Phone,
  Mail,
  Loader2,
  Palette,
  Globe,
  Lock,
  Eye,
  CheckCircle2,
  Clock,
  Sparkles,
  Award,
  Layers,
  Dumbbell,
  Shield,
  Trash2
} from 'lucide-react';
import { OrganizationService, Organization } from '@/lib/api/organization';
import { ThemeSelector } from '@/components/theme';

export default function SettingsPage() {
  const params = useParams();
  const orgId = (params?.orgId as string) || '';
  const { getActiveOrganization, updateOrganization, organizations } = useWorkspaceStore();
  const org = getActiveOrganization() || organizations.find(o => o.id === orgId);
  const [activeTab, setActiveTab] = useState('profile');

  // Form State
  const [name, setName] = useState(org?.name || '');
  const [type, setType] = useState(org?.type || 'ORGANIZER');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [stateName, setStateName] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('India');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');
  const [logo, setLogo] = useState<string | null>(org?.logo || null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Academy-specific dynamic fields
  const [sportsOffered, setSportsOffered] = useState<string[]>(['Badminton']);
  const [admissionStatus, setAdmissionStatus] = useState('OPEN');
  const [academyLevels, setAcademyLevels] = useState('');

  // Court-specific dynamic fields
  const [totalCourts, setTotalCourts] = useState('');
  const [surfaceType, setSurfaceType] = useState('');
  const [openingTime, setOpeningTime] = useState('');
  const [closingTime, setClosingTime] = useState('');
  const [pricePerHour, setPricePerHour] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing organization data
  useEffect(() => {
    if (!org) return;
    setName(org.name || '');
    setType(org.type || 'ORGANIZER');
    setLogo(org.logo || null);

    const loadOrgData = async () => {
      try {
        setIsLoading(true);
        if (org.id && !org.id.startsWith('org_')) {
          const res = await OrganizationService.getProfileByOrgUuid(org.id).catch(() => null);
          if (res && res.data) {
            const d = res.data;
            if (d.name) setName(d.name);
            if (d.type) setType(d.type);
            if (d.contactEmail) setEmail(d.contactEmail);
            if (d.contactPhone) setPhone(d.contactPhone);
            if (d.address) setAddress(d.address);
            if (d.city) setCity(d.city);
            if (d.district) setDistrict(d.district);
            if (d.state) setStateName(d.state);
            if (d.country) setCountry(d.country);
            if (d.postalCode) setPostalCode(d.postalCode);
            if (d.website) setWebsite(d.website);
            if (d.description) setDescription(d.description);
            if (d.logo) setLogo(d.logo);
            if (d.sportsOffered) setSportsOffered(d.sportsOffered.split(','));
            if (d.admissionStatus) setAdmissionStatus(d.admissionStatus);
            if (d.academyLevels) setAcademyLevels(d.academyLevels);
            if (d.totalCourts) setTotalCourts(d.totalCourts.toString());
            if (d.surfaceType) setSurfaceType(d.surfaceType);
            if (d.openingTime) setOpeningTime(d.openingTime);
            if (d.closingTime) setClosingTime(d.closingTime);
            if (d.pricePerHour) setPricePerHour(d.pricePerHour.toString());
          } else {
            // Fallback to basic getById
            const basicRes = await OrganizationService.getById(org.id).catch(() => null);
            if (basicRes && basicRes.data) {
              const d = basicRes.data;
              if (d.name) setName(d.name);
              if (d.type) setType(d.type);
              if (d.description) setDescription(d.description);
              if (d.profile) {
                const p = d.profile;
                if (p.contactEmail) setEmail(p.contactEmail);
                if (p.contactPhone) setPhone(p.contactPhone);
                if (p.address) setAddress(p.address);
                if (p.city) setCity(p.city);
                if (p.district) setDistrict(p.district);
                if (p.state) setStateName(p.state);
                if (p.country) setCountry(p.country);
                if (p.postalCode) setPostalCode(p.postalCode);
                if (p.website) setWebsite(p.website);
                if (p.logo) setLogo(p.logo);
              }
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch org details', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrgData();
  }, [org?.id]);

  if (!org) return null;

  const isPublicMarketplaceType = org.type === 'ACADEMY' || org.type === 'COURT';

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleRemoveLogo = () => {
    setLogo(null);
    setLogoFile(null);
    setLogoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) return;
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const profilePayload = {
        organizationUuid: org.id,
        name: name.trim(),
        type: org.type,
        contactEmail: email.trim(),
        contactPhone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        district: district.trim(),
        state: stateName.trim(),
        country: country.trim(),
        postalCode: postalCode.trim(),
        website: website.trim(),
        description: description.trim(),
        logo: logo || undefined,
        isPublic: isPublicMarketplaceType ? 1 : 0,
        sportsOffered: sportsOffered.join(','),
        admissionStatus: admissionStatus,
        academyLevels: academyLevels.trim(),
        totalCourts: totalCourts ? parseInt(totalCourts) : undefined,
        surfaceType: surfaceType.trim(),
        openingTime: openingTime.trim(),
        closingTime: closingTime.trim(),
        pricePerHour: pricePerHour ? parseFloat(pricePerHour) : undefined,
      };

      if (!org.id.startsWith('org_')) {
        if (logoFile) {
          const formData = new FormData();
          formData.append('organizationUuid', org.id);
          formData.append('name', name.trim());
          formData.append('type', org.type);
          formData.append('contactEmail', email.trim());
          formData.append('contactPhone', phone.trim());
          formData.append('address', address.trim());
          formData.append('city', city.trim());
          formData.append('district', district.trim());
          formData.append('state', stateName.trim());
          formData.append('country', country.trim());
          formData.append('postalCode', postalCode.trim());
          formData.append('website', website.trim());
          formData.append('description', description.trim());
          formData.append('isPublic', (isPublicMarketplaceType ? 1 : 0).toString());
          formData.append('sportsOffered', sportsOffered.join(','));
          formData.append('admissionStatus', admissionStatus);
          formData.append('academyLevels', academyLevels.trim());
          if (totalCourts) formData.append('totalCourts', totalCourts);
          if (surfaceType) formData.append('surfaceType', surfaceType.trim());
          if (openingTime) formData.append('openingTime', openingTime.trim());
          if (closingTime) formData.append('closingTime', closingTime.trim());
          if (pricePerHour) formData.append('pricePerHour', pricePerHour);
          formData.append('logoFile', logoFile);

          const res = await OrganizationService.saveProfileMultipart(formData).catch(async () => {
            return await OrganizationService.saveProfile(profilePayload);
          });
          if (res?.data?.logo) {
            setLogo(res.data.logo);
          }
        } else {
          await OrganizationService.saveProfile(profilePayload).catch(async (err) => {
            console.warn('saveProfile endpoint fallback to update:', err);
            await OrganizationService.update(parseInt(org.id) || 0, {
              name: name.trim(),
              type: org.type,
              contactEmail: email.trim(),
              contactPhone: phone.trim(),
              address: address.trim(),
              city: city.trim(),
              district: district.trim(),
              state: stateName.trim(),
              country: country.trim(),
              postalCode: postalCode.trim(),
              website: website.trim(),
              description: description.trim(),
              logo: logo || undefined,
            });
          });
        }
      }

      // Update local store
      updateOrganization(org.id, {
        name: name.trim(),
        logo: logoPreview || logo || undefined,
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update organization profile', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 text-foreground font-sans">

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-primary">
            Workspace Configuration
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
          <Settings className="w-7 h-7 text-primary" /> Workspace Settings
        </h1>
        <p className="text-foreground/60 text-xs md:text-sm font-medium mt-1">
          Manage workspace identity, contact details, location and preferences for <span className="font-bold text-foreground">{org.name}</span>.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">

        {/* Settings Sidebar */}
        <div className="w-full md:w-64 shrink-0 space-y-1">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs md:text-sm font-bold transition-all ${activeTab === 'profile'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-foreground/70 hover:bg-surface hover:text-foreground'
              }`}
          >
            <User className="w-4 h-4" /> Organization Profile
          </button>
          <button
            onClick={() => setActiveTab('appearance')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs md:text-sm font-bold transition-all ${activeTab === 'appearance'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-foreground/70 hover:bg-surface hover:text-foreground'
              }`}
          >
            <Palette className="w-4 h-4" /> Appearance & Theme
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs md:text-sm font-bold transition-all ${activeTab === 'notifications'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-foreground/70 hover:bg-surface hover:text-foreground'
              }`}
          >
            <Bell className="w-4 h-4" /> Notifications
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs md:text-sm font-bold transition-all ${activeTab === 'billing'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-foreground/70 hover:bg-surface hover:text-foreground'
              }`}
          >
            <CreditCard className="w-4 h-4" /> Billing & Plan
          </button>
          <div className="pt-4 mt-4 border-t border-border">
            <button
              onClick={() => setActiveTab('danger')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs md:text-sm font-bold transition-all ${activeTab === 'danger'
                  ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                  : 'text-red-400/70 hover:bg-red-500/10 hover:text-red-400'
                }`}
            >
              <ShieldAlert className="w-4 h-4" /> Danger Zone
            </button>
          </div>
        </div>

        {/* Settings Content Area */}
        <div className="flex-grow">
          <div
            className="rounded-[24px] p-6 md:p-8 shadow-xl border"
            style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
          >

            {/* ─── Profile Tab ──────────────────────────────────────────────── */}
            {activeTab === 'profile' && (
              <div className="space-y-8 animate-in fade-in duration-300">

                {/* Header & Visibility Status Notice */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border">
                  <div>
                    <h2 className="text-xl font-black text-foreground">Organization Profile</h2>
                    <p className="text-xs text-foreground/60 mt-0.5">
                      Configure your workspace identity, regional address, and operational details.
                    </p>
                  </div>

                  {/* Dynamic Visibility Badge based on Organization Type */}
                  {isPublicMarketplaceType ? (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/25 text-primary text-xs font-bold shrink-0">
                      <Globe className="w-4 h-4" />
                      <span>Public Marketplace Profile</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface border border-border text-foreground/70 text-xs font-bold shrink-0">
                      <Lock className="w-4 h-4 text-primary" />
                      <span>Private Workspace (Internal Only)</span>
                    </div>
                  )}
                </div>

                {/* Visibility Info Card */}
                {isPublicMarketplaceType ? (
                  <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-start gap-3.5">
                    <Globe className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div className="space-y-1 text-xs">
                      <div className="font-bold text-foreground">
                        Public Marketplace & Directory Listing Active
                      </div>
                      <p className="text-foreground/70 leading-relaxed">
                        {org.type === 'ACADEMY'
                          ? 'This academy profile, location, sports batches, and facilities are published to all users on the ATHLON Academies Directory and Marketplace Home Page.'
                          : 'This venue profile, courts, amenities, and hourly booking slots are published to all users on the ATHLON Court Booking Directory and Marketplace Home Page.'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-surface border border-border rounded-2xl p-4 flex items-start gap-3.5">
                    <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div className="space-y-1 text-xs">
                      <div className="font-bold text-foreground">
                        Confidential Organization Workspace
                      </div>
                      <p className="text-foreground/70 leading-relaxed">
                        This {org.type.toLowerCase()} profile and its regional details (City, District, State, Address) are exclusively visible to your organization team and tournament administrators. It is not listed on public discovery directories.
                      </p>
                    </div>
                  </div>
                )}

                {/* Workspace Logo Upload */}
                <div className="flex items-center gap-6 pb-6 border-b border-border">
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleLogoUpload}
                  />

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-24 h-24 rounded-2xl bg-surface border-2 border-dashed border-border flex flex-col items-center justify-center text-foreground/40 hover:border-primary/50 transition-all cursor-pointer group shrink-0 overflow-hidden relative"
                  >
                    {logoPreview || logo ? (
                      <img
                        src={logoPreview || OrganizationService.getLogoUrl(logo || '')}
                        alt={name}
                        className="w-full h-full object-cover rounded-2xl"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <>
                        <Upload className="w-6 h-6 mb-1 text-primary group-hover:scale-110 transition-transform" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-primary">Upload</span>
                      </>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div>
                      <h3 className="text-sm font-black text-foreground">Workspace Logo</h3>
                      <p className="text-xs text-foreground/50 mt-0.5">Recommended size: 512x512px. Max 2MB (PNG, JPG, WEBP).</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg bg-surface border border-border text-xs font-bold text-foreground hover:border-primary/50 transition-colors"
                      >
                        Change Logo
                      </button>
                      {(logoPreview || logo) && (
                        <button
                          type="button"
                          onClick={handleRemoveLogo}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Core Organization Details */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-2">
                    <Building className="w-4 h-4" /> Basic Identity
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-foreground/60 uppercase tracking-widest">
                        Organization Name *
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g. Matrix Sports Hub"
                        className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:border-primary transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-foreground/60 uppercase tracking-widest">
                        Workspace Type
                      </label>
                      <input
                        type="text"
                        value={type}
                        disabled
                        className="w-full bg-surface/50 border border-border/60 rounded-xl px-4 py-3 text-sm font-bold text-foreground/50 cursor-not-allowed uppercase"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-foreground/60 uppercase tracking-widest">
                        Official Support Email
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="contact@organization.com"
                        className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:border-primary transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-foreground/60 uppercase tracking-widest">
                        Official Support Phone
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:border-primary transition-all"
                      />
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[10px] font-black text-foreground/60 uppercase tracking-widest">
                        Official Website or Social Link
                      </label>
                      <input
                        type="url"
                        value={website}
                        onChange={e => setWebsite(e.target.value)}
                        placeholder="https://myorganization.com"
                        className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:border-primary transition-all"
                      />
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[10px] font-black text-foreground/60 uppercase tracking-widest">
                        Overview & Bio
                      </label>
                      <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="Write a brief overview of your organization, mission, and facilities..."
                        className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:border-primary transition-all min-h-[90px] resize-y"
                      />
                    </div>
                  </div>
                </div>

                {/* ─── Regional Address Details ─────────────────────────────── */}
                <div className="space-y-4 pt-4 border-t border-border">
                  <h3 className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Location & Regional Details
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5 sm:col-span-2 md:col-span-3">
                      <label className="text-[10px] font-black text-foreground/60 uppercase tracking-widest">
                        Primary Street Address
                      </label>
                      <input
                        type="text"
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                        placeholder="Building, street, landmark..."
                        className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:border-primary transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-foreground/60 uppercase tracking-widest">
                        City / Town *
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={e => setCity(e.target.value)}
                        placeholder="e.g. Trivandrum"
                        className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:border-primary transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-foreground/60 uppercase tracking-widest">
                        District *
                      </label>
                      <input
                        type="text"
                        value={district}
                        onChange={e => setDistrict(e.target.value)}
                        placeholder="e.g. Thiruvananthapuram"
                        className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:border-primary transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-foreground/60 uppercase tracking-widest">
                        State / Province *
                      </label>
                      <input
                        type="text"
                        value={stateName}
                        onChange={e => setStateName(e.target.value)}
                        placeholder="e.g. Kerala"
                        className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:border-primary transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-foreground/60 uppercase tracking-widest">
                        PIN / Postal Code
                      </label>
                      <input
                        type="text"
                        value={postalCode}
                        onChange={e => setPostalCode(e.target.value)}
                        placeholder="e.g. 695581"
                        className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:border-primary transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-foreground/60 uppercase tracking-widest">
                        Country
                      </label>
                      <input
                        type="text"
                        value={country}
                        onChange={e => setCountry(e.target.value)}
                        placeholder="India"
                        className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:border-primary transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* ─── Type-Specific Details ────────────────────────────────── */}
                {org.type === 'ACADEMY' && (
                  <div className="space-y-4 pt-4 border-t border-border">
                    <h3 className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-2">
                      <Award className="w-4 h-4" /> Academy Marketplace Settings
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-foreground/60 uppercase tracking-widest">
                          Admissions Status
                        </label>
                        <select
                          value={admissionStatus}
                          onChange={e => setAdmissionStatus(e.target.value)}
                          className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:border-primary transition-all"
                        >
                          <option value="OPEN">Admissions Open</option>
                          <option value="LIMITED">Limited Slots Available</option>
                          <option value="CLOSED">Admissions Closed (Waitlist)</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-foreground/60 uppercase tracking-widest">
                          Training Levels Offered
                        </label>
                        <input
                          type="text"
                          value={academyLevels}
                          onChange={e => setAcademyLevels(e.target.value)}
                          placeholder="e.g. Grassroots, Intermediate, Elite Professional"
                          className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:border-primary transition-all"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {org.type === 'COURT' && (
                  <div className="space-y-4 pt-4 border-t border-border">
                    <h3 className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-2">
                      <Clock className="w-4 h-4" /> Court Booking Marketplace Settings
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-foreground/60 uppercase tracking-widest">
                          Total Courts Count
                        </label>
                        <input
                          type="number"
                          value={totalCourts}
                          onChange={e => setTotalCourts(e.target.value)}
                          placeholder="4"
                          className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:border-primary transition-all"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-foreground/60 uppercase tracking-widest">
                          Court Surface Type
                        </label>
                        <input
                          type="text"
                          value={surfaceType}
                          onChange={e => setSurfaceType(e.target.value)}
                          placeholder="Synthetic Mat on Wood"
                          className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:border-primary transition-all"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-foreground/60 uppercase tracking-widest">
                          Base Slot Rate (₹/Hour)
                        </label>
                        <input
                          type="number"
                          value={pricePerHour}
                          onChange={e => setPricePerHour(e.target.value)}
                          placeholder="400"
                          className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:border-primary transition-all"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-foreground/60 uppercase tracking-widest">
                          Daily Opening Time
                        </label>
                        <input
                          type="text"
                          value={openingTime}
                          onChange={e => setOpeningTime(e.target.value)}
                          placeholder="06:00 AM"
                          className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:border-primary transition-all"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-foreground/60 uppercase tracking-widest">
                          Daily Closing Time
                        </label>
                        <input
                          type="text"
                          value={closingTime}
                          onChange={e => setClosingTime(e.target.value)}
                          placeholder="11:00 PM"
                          className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:border-primary transition-all"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Save Trigger */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border">
                  {saveSuccess ? (
                    <div className="flex items-center gap-2 text-xs font-bold text-primary animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Workspace profile changes saved successfully!</span>
                    </div>
                  ) : (
                    <span className="text-xs text-foreground/50">
                      All changes are saved to your ATHLON workspace database.
                    </span>
                  )}

                  <button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-primary text-primary-foreground text-xs font-black uppercase tracking-wider hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_var(--athlon-glow)] disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {isSaving ? 'Saving Changes...' : 'Save Profile Changes'}
                  </button>
                </div>

              </div>
            )}

            {/* ─── Appearance Tab ───────────────────────────────────────────── */}
            {activeTab === 'appearance' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-1">Appearance & Accent Theme</h2>
                  <p className="text-sm font-medium text-foreground/50 mb-6">Customize the ATHLON sports-tech accent theme across your workspace.</p>
                  <ThemeSelector showPreviews={true} />
                </div>
              </div>
            )}

            {/* ─── Notifications Tab ────────────────────────────────────────── */}
            {activeTab === 'notifications' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-1">Notification Preferences</h2>
                  <p className="text-sm font-medium text-foreground/50 mb-6">Choose how you want to be alerted about workspace activity.</p>

                  <div className="space-y-4">
                    {[
                      { title: 'New Member Registrations', desc: 'Get notified when a new member or student joins.' },
                      { title: 'Fee Payment Alerts', desc: 'Notifications for successful fee collections and overdue alerts.' },
                      { title: 'Schedule Changes', desc: 'Alerts when a coach modifies or cancels a batch.' },
                      { title: 'Weekly Reports', desc: 'Receive a weekly digest of analytics and attendance.' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-surface border border-border rounded-xl">
                        <div>
                          <div className="font-bold text-foreground text-sm">{item.title}</div>
                          <div className="text-xs text-foreground/50 mt-0.5">{item.desc}</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked={i < 3} />
                          <div className="w-11 h-6 bg-foreground/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ─── Billing Tab ──────────────────────────────────────────────── */}
            {activeTab === 'billing' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-1">Billing & Plan</h2>
                  <p className="text-sm font-medium text-foreground/50 mb-6">Manage your ATHLON OS license and billing details.</p>

                  <div
                    className="p-6 rounded-2xl relative overflow-hidden mb-8 border"
                    style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                  >
                    <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="text-primary text-xs font-black uppercase tracking-widest mb-1">Current License</div>
                        <h3 className="text-2xl font-black text-foreground mb-1">{org.type} Professional</h3>
                        <p className="text-sm font-semibold text-foreground/70">₹2,999 / month • Next renewal on Sep 12, 2026</p>
                      </div>
                      <button className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-black uppercase tracking-wider hover:opacity-90 transition-all shadow-md shrink-0">
                        Manage Subscription
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-foreground mb-4 text-sm uppercase tracking-wider">Billing History</h3>
                  <div className="border border-border rounded-xl overflow-hidden bg-surface">
                    <table className="w-full text-left">
                      <thead className="bg-foreground/[0.02] border-b border-border">
                        <tr>
                          <th className="px-4 py-3 text-xs font-black text-foreground/50 uppercase tracking-widest">Date</th>
                          <th className="px-4 py-3 text-xs font-black text-foreground/50 uppercase tracking-widest">Description</th>
                          <th className="px-4 py-3 text-xs font-black text-foreground/50 uppercase tracking-widest">Amount</th>
                          <th className="px-4 py-3 text-xs font-black text-foreground/50 uppercase tracking-widest text-right">Invoice</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40">
                        <tr>
                          <td className="px-4 py-3 text-sm font-bold text-foreground">Aug 12, 2026</td>
                          <td className="px-4 py-3 text-sm text-foreground/70">{org.type} Pro License - Monthly</td>
                          <td className="px-4 py-3 text-sm font-bold text-foreground">₹2,999</td>
                          <td className="px-4 py-3 text-right">
                            <button className="text-xs font-bold text-primary hover:underline">Download</button>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm font-bold text-foreground">Jul 12, 2026</td>
                          <td className="px-4 py-3 text-sm text-foreground/70">{org.type} Pro License - Monthly</td>
                          <td className="px-4 py-3 text-sm font-bold text-foreground">₹2,999</td>
                          <td className="px-4 py-3 text-right">
                            <button className="text-xs font-bold text-primary hover:underline">Download</button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ─── Danger Tab ───────────────────────────────────────────────── */}
            {activeTab === 'danger' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div>
                  <h2 className="text-xl font-bold text-red-400 mb-1 flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5" /> Danger Zone
                  </h2>
                  <p className="text-sm font-medium text-foreground/50 mb-6">Irreversible actions for your workspace.</p>

                  <div className="border border-red-500/20 bg-red-500/5 rounded-xl p-6">
                    <h3 className="font-bold text-foreground mb-2">Delete Workspace</h3>
                    <p className="text-xs text-foreground/60 mb-6 leading-relaxed">
                      Once you delete this workspace, there is no going back. All members, tournament records, settings, and financial logs will be permanently wiped.
                    </p>
                    <button className="px-5 py-2.5 rounded-xl bg-red-500 text-white text-xs font-black uppercase tracking-wider hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20">
                      Delete {org.name}
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

    </div>
  );
}