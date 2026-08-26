'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeftIcon,
  CalendarIcon,
  MapPinIcon,
  ImageIcon,
  X,
  Trophy,
  Shield,
  Globe,
  Lock,
  Calendar,
  MapPin,
  Ticket,
  Phone,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Layers,
  Activity,
  Plus,
} from 'lucide-react';
import Link from 'next/link';

import { TournamentService, CategoryService } from '@/lib/api/tournaments';
import { TeamEventCategoryConfig } from '@/components/tournaments/teamevent/TeamEventCategoryBuilder';
import { OrganizationService } from '@/lib/api/organization';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';

export default function CreateTournamentPage() {
  const router = useRouter();
  const params = useParams();
  const orgUuid = params.orgId as string;
  const posterInputRef = useRef<HTMLInputElement>(null);
  const desktopPosterInputRef = useRef<HTMLInputElement>(null);

  const { userId, userUuid } = useAuthStore();
  const { getActiveOrganization, organizations } = useWorkspaceStore();
  const activeOrg =
    organizations.find((o) => o.id === orgUuid) ||
    getActiveOrganization() ||
    { id: orgUuid, name: 'Organization', type: 'ORGANIZER' };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orgCategories, setOrgCategories] = useState<any[]>([]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const orgResponse = await OrganizationService.getById(orgUuid);
        const orgData = orgResponse.data;
        if (orgData && orgData.orgId) {
          const catResponse = await CategoryService.getByOrg(orgData.orgId);
          if (catResponse && catResponse.data) {
            setOrgCategories(catResponse.data);
          }
        }
      } catch (error) {
        console.error('Failed to load categories', error);
      }
    };
    loadCategories();
  }, [orgUuid]);

  const [formData, setFormData] = useState({
    name: '',
    type: 'PRIVATE',
    location: '',
    mapLink: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    registrationClosingDate: '',
    registrationClosingTime: '',
    tournamentType: 'KNOCKOUT',
    sport: 'Badminton',
    category: '',
    categories: [] as string[],
    matchFormat: "Men's Singles",
    matchFormats: [] as string[],
    playersCount: '',
    registrationFees: '',
    description: '',
    contactPhone: '',
    teamEventCategories: [] as TeamEventCategoryConfig[],
  });

  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [posterFile, setPosterFile] = useState<File | null>(null);

  const handlePosterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPosterFile(file);
    const reader = new FileReader();
    reader.onload = () => setPosterPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      const orgResponse = await OrganizationService.getById(orgUuid);
      const orgData = orgResponse.data;

      if (!orgData || !orgData.orgId) {
        throw new Error('Could not load organization details.');
      }

      const form = new FormData();
      form.append('name', formData.name);
      form.append('description', formData.description);

      const startDateTime = formData.startDate
        ? `${formData.startDate}T${formData.startTime || '00:00'}:00`
        : '';
      if (startDateTime) form.append('startDate', startDateTime);

      const endDateTime = formData.endDate
        ? `${formData.endDate}T${formData.endTime || '00:00'}:00`
        : '';
      if (endDateTime) form.append('endDate', endDateTime);

      const registrationClosingDateTime = formData.registrationClosingDate
        ? `${formData.registrationClosingDate}T${formData.registrationClosingTime || '23:59'}:00`
        : '';
      if (registrationClosingDateTime) form.append('registrationClosingDate', registrationClosingDateTime);

      form.append('tournamentType', formData.tournamentType);
      form.append('sport', formData.sport);
      if (formData.tournamentType === 'TEAM_EVENT') {
        form.append('teamEventCategories', JSON.stringify(formData.teamEventCategories));
      } else {
        form.append('matchFormat', formData.matchFormat);
        form.append('category', formData.category);
      }
      if (formData.playersCount) {
        form.append('playersCount', formData.playersCount.toString());
      }
      form.append('visibility', formData.type);
      form.append('location', formData.location);
      if (formData.mapLink) form.append('mapLink', formData.mapLink);
      if (formData.contactPhone) form.append('contactPhone', formData.contactPhone);
      if (formData.registrationFees) form.append('registrationFees', formData.registrationFees);

      form.append('organizerId', orgData.orgId.toString());
      form.append('organizerUuid', orgUuid);

      if (userId) form.append('userId', userId.toString());
      if (userUuid) form.append('userUuid', userUuid);
      if (userId) form.append('createdBy', userId.toString());

      if (posterFile) {
        form.append('poster', posterFile);
      }

      await TournamentService.create(form);
      router.push(`/org/${orgUuid}/tournaments`);
    } catch (error) {
      console.error('Failed to create tournament', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Form validity & completeness
  const requiredFields = [formData.name.trim(), formData.location.trim(), formData.startDate, formData.endDate];
  const filledCount = requiredFields.filter(Boolean).length;
  const progressPercent = Math.round((filledCount / requiredFields.length) * 100);
  const isFormValid = formData.name.trim() !== '' && formData.location.trim() !== '';

  const inputClass =
    'w-full bg-[#0D1520] border border-white/10 rounded-2xl px-4 py-4 text-white text-base focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-white/25 font-medium';
  const labelClass = 'block text-[10px] font-black text-white/50 uppercase tracking-widest mb-2';

  const desktopInputClass =
    'w-full px-4 py-3.5 rounded-2xl border text-sm font-semibold text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-foreground/30';
  const desktopLabelClass = 'block text-xs font-black uppercase tracking-wider text-foreground/60 mb-2';

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-black">
      {/* ══════════════════════════════════════════════════════════════════════
          1. MOBILE VIEW ONLY (< md) - 100% UNTOUCHED ORIGINAL EXPERIENCE
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="block md:hidden pb-24">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-md border-b border-white/5 px-5 py-4 flex items-center gap-4">
          <Link href={`/org/${orgUuid}/tournaments`} className="text-white/60 hover:text-white transition-colors">
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-white/50 text-sm font-bold tracking-widest uppercase"> CREATE TOURNAMENT</span>
          </div>
        </div>

        <div className="px-5 pt-6 space-y-7 max-w-2xl mx-auto">
          {/* VISIBILITY */}
          <div>
            <label className={labelClass}>Visibility</label>
            <div className="space-y-2">
              {[
                { value: 'PRIVATE', label: 'Private', desc: 'Me and players I invite can see this Tournament' },
                { value: 'PUBLIC', label: 'Public', desc: 'Anyone can discover and view this Tournament' },
              ].map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => setFormData({ ...formData, type: opt.value })}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl border-2 cursor-pointer transition-all ${
                    formData.type === opt.value ? 'border-primary bg-primary/10' : 'border-white/10 bg-[#0D1520]'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      formData.type === opt.value ? 'border-primary' : 'border-white/30'
                    }`}
                  >
                    {formData.type === opt.value && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                  <div>
                    <div className={`font-bold text-sm ${formData.type === opt.value ? 'text-white' : 'text-white/70'}`}>
                      {opt.label}
                    </div>
                    <div className="text-[10px] text-white/35 mt-0.5">{opt.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* TOURNAMENT NAME */}
          <div>
            <label className={labelClass}>
              Tournament Name <span className="text-primary">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={inputClass}
              placeholder="E.g. State Open 2026"
            />
          </div>

          {/* SPORT */}
          <div>
            <label className={labelClass}>
              Sport <span className="text-primary">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['Badminton', 'Cricket', 'Football', 'Volleyball'].map((sport) => (
                <button
                  key={sport}
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, sport });
                  }}
                  className={`py-3 px-4 rounded-xl border-2 text-sm font-bold transition-all ${
                    formData.sport === sport
                      ? 'border-primary bg-primary/10 text-white'
                      : 'border-white/10 bg-[#0D1520] text-white/50 hover:border-white/25 hover:text-white/80'
                  }`}
                >
                  {sport}
                </button>
              ))}
            </div>
          </div>

          {/* TOURNAMENT TYPE */}
          <div>
            <label className={labelClass}>
              Tournament Type <span className="text-primary">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['KNOCKOUT', 'LEAGUE'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, tournamentType: type });
                  }}
                  className={`py-3 px-4 rounded-xl border-2 text-sm font-bold transition-all ${
                    formData.tournamentType === type
                      ? 'border-primary bg-primary/10 text-white'
                      : 'border-white/10 bg-[#0D1520] text-white/50 hover:border-white/25 hover:text-white/80'
                  }`}
                >
                  {type === 'KNOCKOUT' ? 'Knockout' : 'League'}
                </button>
              ))}
            </div>
          </div>

          {/* MATCH FORMAT */}
          <div>
            <label className={labelClass}>
              Match Format <span className="text-primary">*</span>
            </label>
            <select
              value={formData.matchFormat}
              onChange={(e) => setFormData({ ...formData, matchFormat: e.target.value })}
              className={`${inputClass} appearance-none`}
            >
              <option value="" disabled>
                Select format...
              </option>
              <option value="Men's Singles">Men's Singles</option>
              <option value="Women's Singles">Women's Singles</option>
              <option value="Men's Doubles">Men's Doubles</option>
              <option value="Women's Doubles">Women's Doubles</option>
              <option value="Mixed Doubles">Mixed Doubles</option>
            </select>
          </div>

          {/* VENUE */}
          <div>
            <label className={labelClass}>
              Venue <span className="text-primary">*</span>
            </label>
            <div className="relative">
              <MapPinIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className={`${inputClass} pl-12`}
                placeholder="Search court, stadium, area..."
              />
            </div>
          </div>

          {/* GOOGLE MAP LINK */}
          <div>
            <label className={labelClass}>Google Maps Link (Optional)</label>
            <div className="relative">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <input
                type="url"
                value={formData.mapLink}
                onChange={(e) => setFormData({ ...formData, mapLink: e.target.value })}
                className={`${inputClass} pl-12 text-sm`}
                placeholder="Paste Google Maps link here..."
              />
            </div>
            {formData.mapLink && (
              <a
                href={formData.mapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-2 text-[10px] font-bold text-primary hover:underline uppercase tracking-wider"
              >
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                Preview on Google Maps
              </a>
            )}
          </div>

          {/* DATES */}
          <div className="space-y-4">
            <div>
              <label className={labelClass}>
                Tournament Start Date <span className="text-primary">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full bg-[#0D1520] border border-white/10 rounded-xl pl-9 pr-3 py-3 text-white text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium"
                  />
                </div>
                <div className="relative">
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full bg-[#0D1520] border border-white/10 rounded-xl px-3 py-3 text-white text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className={labelClass}>
                Tournament End Date <span className="text-primary">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full bg-[#0D1520] border border-white/10 rounded-xl pl-9 pr-3 py-3 text-white text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium"
                  />
                </div>
                <div className="relative">
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full bg-[#0D1520] border border-white/10 rounded-xl px-3 py-3 text-white text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className={labelClass}>Registration Closing Date</label>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="date"
                    value={formData.registrationClosingDate}
                    onChange={(e) => setFormData({ ...formData, registrationClosingDate: e.target.value })}
                    className="w-full bg-[#0D1520] border border-white/10 rounded-xl pl-9 pr-3 py-3 text-white text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium"
                  />
                </div>
                <div className="relative">
                  <input
                    type="time"
                    value={formData.registrationClosingTime}
                    onChange={(e) => setFormData({ ...formData, registrationClosingTime: e.target.value })}
                    className="w-full bg-[#0D1520] border border-white/10 rounded-xl px-3 py-3 text-white text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium"
                  />
                </div>
              </div>
              <p className="text-[10px] text-white/40 mt-1">
                Registrations will automatically lock after this date and time.
              </p>
            </div>
          </div>

          {/* POSTER IMAGE */}
          <div>
            <label className={labelClass}>Tournament Poster</label>
            <input ref={posterInputRef} type="file" accept="image/*" onChange={handlePosterChange} className="hidden" />
            {posterPreview ? (
              <div className="relative rounded-2xl overflow-hidden border border-white/10 aspect-[16/7]">
                <img src={posterPreview} alt="Poster" className="w-full h-full object-cover" />
                <button
                  onClick={() => {
                    setPosterPreview(null);
                    setPosterFile(null);
                  }}
                  className="absolute top-3 right-3 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-red-500/80 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => posterInputRef.current?.click()}
                className="w-full bg-[#0D1520] border-2 border-dashed border-white/15 rounded-2xl py-8 flex flex-col items-center gap-3 hover:border-primary/50 hover:bg-primary/5 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <ImageIcon className="w-6 h-6 text-white/30 group-hover:text-primary transition-colors" />
                </div>
                <div className="text-center">
                  <div className="text-sm font-bold text-white/50 group-hover:text-white/70 transition-colors">
                    Tap to upload poster
                  </div>
                  <div className="text-xs text-white/25 mt-0.5">JPG, PNG or WEBP · Max 5MB</div>
                </div>
              </button>
            )}
          </div>

          {/* CATEGORY (Only for Knockout and League tournaments) */}
          {formData.tournamentType !== 'TEAM_EVENT' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[10px] font-black text-white/50 uppercase tracking-widest">
                  Category
                </label>
                <Link
                  href={`/org/${orgUuid}/categories?returnTo=create-tournament`}
                  className="text-[10px] font-bold text-primary hover:text-primary-dark hover:underline uppercase tracking-wider flex items-center gap-1 transition-colors"
                >
                  + Add Category
                </Link>
              </div>

              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className={`${inputClass} appearance-none`}
                disabled={!formData.sport}
              >
                <option value="" disabled>
                  Select category...
                </option>
                {orgCategories
                  .filter((c) => c.sportType === formData.sport)
                  .map((c) => (
                    <option key={c.categoryUuid} value={c.categoryName}>
                      {c.categoryName}
                    </option>
                  ))}
              </select>
              {!formData.sport && (
                <div className="text-[10px] text-primary mt-2 ml-1">Please select a sport first to see categories</div>
              )}
            </div>
          )}

          {/* REGISTRATION FEES */}
          <div>
            <label className={labelClass}>Registration Fees</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-black text-lg">₹</span>
              <input
                type="number"
                min="0"
                value={formData.registrationFees}
                onChange={(e) => setFormData({ ...formData, registrationFees: e.target.value })}
                className={`${inputClass} pl-9`}
                placeholder="0 for free entry"
              />
            </div>
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className={labelClass}>Description (Optional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={`${inputClass} min-h-[100px] resize-none`}
              placeholder="Venue notes, schedule, links..."
            />
          </div>

          {/* CONTACT PHONE */}
          <div>
            <label className={labelClass}>Contact Phone (Optional)</label>
            <input
              type="tel"
              value={formData.contactPhone}
              onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
              className={inputClass}
              placeholder="10-digit mobile number"
              maxLength={10}
            />
          </div>

          {/* CREATE BUTTON */}
          <button
            onClick={handleSubmit}
            disabled={!formData.name.trim() || !formData.location.trim() || isSubmitting}
            className="w-full bg-primary disabled:opacity-40 disabled:cursor-not-allowed text-black text-base font-black uppercase tracking-wider py-5 rounded-2xl transition-all hover:bg-primary-dark active:scale-95 shadow-[0_8px_30px_rgba(27,156,86,0.3)]"
          >
            {isSubmitting ? 'Creating...' : 'Create Tournament'}
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          2. DESKTOP VIEW ONLY (hidden on mobile, visible on md and above)
             - 2-COLUMN DESIGN WITH LIVE PREVIEW & FORM SECTIONS
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="hidden md:block min-h-screen pb-20 bg-background">
        {/* Desktop Header Command Bar */}
        <div
          className="border-b px-8 py-8 bg-gradient-to-b from-card/80 via-card/30 to-background"
          style={{ borderColor: 'var(--athlon-border)' }}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-foreground/50 font-bold uppercase tracking-wider">
                <Link href={`/org/${orgUuid}/dashboard`} className="hover:text-primary transition-colors">
                  {activeOrg.name}
                </Link>
                <span>/</span>
                <Link href={`/org/${orgUuid}/tournaments`} className="hover:text-primary transition-colors">
                  Tournaments
                </Link>
                <span>/</span>
                <span className="text-primary">Create Event</span>
              </div>
              <h1 className="text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
                <Trophy className="w-8 h-8 text-primary" />
                Launch Tournament Competition
              </h1>
              <p className="text-xs text-foreground/60">
                Setup match brackets, venue logistics, registration fee schedules, and public event visibility
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href={`/org/${orgUuid}/tournaments`}
                className="px-5 py-2.5 rounded-2xl border text-xs font-black uppercase tracking-wider text-foreground/70 hover:text-foreground hover:bg-white/5 transition-all"
                style={{ borderColor: 'var(--athlon-border)' }}
              >
                Cancel
              </Link>
              <button
                onClick={handleSubmit}
                disabled={!isFormValid || isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-primary text-black text-xs font-black uppercase tracking-wider shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all"
              >
                {isSubmitting ? (
                  <span>Publishing Competition...</span>
                ) : (
                  <>
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>Create Tournament</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 2-Column Desktop Grid Layout */}
        <main className="max-w-7xl mx-auto px-8 py-10">
          <div className="grid grid-cols-12 gap-8 items-start">
            {/* Left Main Form Column (7 Cols) */}
            <div className="col-span-7 space-y-8">
              {/* Card 1: Event Identity & Format */}
              <section
                className="p-8 rounded-[28px] border shadow-xl space-y-6"
                style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
              >
                <div className="flex items-center gap-3 pb-4 border-b" style={{ borderColor: 'var(--athlon-border)' }}>
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-foreground">Event Identity &amp; Discipline</h2>
                    <p className="text-xs text-foreground/50">Core competition name, sport discipline, and draw type</p>
                  </div>
                </div>

                {/* Tournament Name */}
                <div>
                  <label className={desktopLabelClass}>
                    Tournament Title <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={desktopInputClass}
                    style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                    placeholder="e.g. State Open Championship 2026"
                  />
                </div>

                {/* Sport Discipline Selector */}
                <div>
                  <label className={desktopLabelClass}>
                    Sport Discipline <span className="text-primary">*</span>
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {['Badminton', 'Cricket', 'Football', 'Volleyball'].map((sport) => (
                      <button
                        key={sport}
                        type="button"
                        onClick={() => setFormData({ ...formData, sport })}
                        className={`py-3 px-3 rounded-2xl border text-xs font-black uppercase tracking-wider transition-all flex flex-col items-center gap-1.5 ${
                          formData.sport === sport
                            ? 'bg-primary text-black border-primary shadow-md shadow-primary/20 scale-[1.02]'
                            : 'text-foreground/70 hover:text-foreground hover:bg-white/5'
                        }`}
                        style={{
                          backgroundColor: formData.sport === sport ? 'var(--athlon-primary)' : 'var(--athlon-surface)',
                          borderColor: formData.sport === sport ? 'transparent' : 'var(--athlon-border)',
                        }}
                      >
                        <span>{sport}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tournament Type & Visibility Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Type */}
                  <div>
                    <label className={desktopLabelClass}>
                      Draw Format <span className="text-primary">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {['KNOCKOUT', 'LEAGUE'].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setFormData({ ...formData, tournamentType: type })}
                          className={`py-3 rounded-2xl border text-xs font-black uppercase tracking-wider transition-all ${
                            formData.tournamentType === type
                              ? 'bg-primary/15 text-primary border-primary shadow-sm'
                              : 'text-foreground/60 hover:text-foreground'
                          }`}
                          style={{
                            backgroundColor:
                              formData.tournamentType === type ? 'rgba(27, 156, 86, 0.15)' : 'var(--athlon-surface)',
                            borderColor: formData.tournamentType === type ? 'var(--athlon-primary)' : 'var(--athlon-border)',
                          }}
                        >
                          {type === 'KNOCKOUT' ? 'Knockout' : 'Pool League'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Visibility */}
                  <div>
                    <label className={desktopLabelClass}>Event Visibility</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: 'PRIVATE', label: 'Private', icon: Lock },
                        { value: 'PUBLIC', label: 'Public', icon: Globe },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, type: opt.value })}
                          className={`py-3 px-2 rounded-2xl border text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                            formData.type === opt.value
                              ? 'bg-primary/15 text-primary border-primary shadow-sm'
                              : 'text-foreground/60 hover:text-foreground'
                          }`}
                          style={{
                            backgroundColor:
                              formData.type === opt.value ? 'rgba(27, 156, 86, 0.15)' : 'var(--athlon-surface)',
                            borderColor: formData.type === opt.value ? 'var(--athlon-primary)' : 'var(--athlon-border)',
                          }}
                        >
                          <opt.icon className="w-3.5 h-3.5" />
                          <span>{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Match Format & Category Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={desktopLabelClass}>
                      Match Format <span className="text-primary">*</span>
                    </label>
                    <select
                      value={formData.matchFormat}
                      onChange={(e) => setFormData({ ...formData, matchFormat: e.target.value })}
                      className={`${desktopInputClass} appearance-none cursor-pointer`}
                      style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                    >
                      <option value="Men's Singles">Men's Singles</option>
                      <option value="Women's Singles">Women's Singles</option>
                      <option value="Men's Doubles">Men's Doubles</option>
                      <option value="Women's Doubles">Women's Doubles</option>
                      <option value="Mixed Doubles">Mixed Doubles</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-black uppercase tracking-wider text-foreground/60">
                        Category Tier
                      </label>
                      <Link
                        href={`/org/${orgUuid}/categories?returnTo=create-tournament`}
                        className="text-[10px] font-black text-primary hover:underline uppercase tracking-wider flex items-center gap-0.5"
                      >
                        <Plus className="w-3 h-3" /> Add Category
                      </Link>
                    </div>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className={`${desktopInputClass} appearance-none cursor-pointer`}
                      style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                    >
                      <option value="">Default Open Category</option>
                      {orgCategories
                        .filter((c) => c.sportType === formData.sport)
                        .map((c) => (
                          <option key={c.categoryUuid} value={c.categoryName}>
                            {c.categoryName}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </section>

              {/* Card 2: Venue & Location */}
              <section
                className="p-8 rounded-[28px] border shadow-xl space-y-6"
                style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
              >
                <div className="flex items-center gap-3 pb-4 border-b" style={{ borderColor: 'var(--athlon-border)' }}>
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-foreground">Venue &amp; Location Logistics</h2>
                    <p className="text-xs text-foreground/50">Stadium address and Google Maps navigation pin</p>
                  </div>
                </div>

                <div>
                  <label className={desktopLabelClass}>
                    Venue / Arena Name &amp; Address <span className="text-primary">*</span>
                  </label>
                  <div className="relative">
                    <MapPinIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className={`${desktopInputClass} pl-11`}
                      style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                      placeholder="e.g. Central Sports Complex, Court 1-4, Anna Nagar"
                    />
                  </div>
                </div>

                <div>
                  <label className={desktopLabelClass}>Google Maps Pin URL (Optional)</label>
                  <div className="relative">
                    <ExternalLink className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                    <input
                      type="url"
                      value={formData.mapLink}
                      onChange={(e) => setFormData({ ...formData, mapLink: e.target.value })}
                      className={`${desktopInputClass} pl-11 text-xs`}
                      style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                      placeholder="https://maps.google.com/..."
                    />
                  </div>
                  {formData.mapLink && (
                    <a
                      href={formData.mapLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Test Google Maps Navigation Pin</span>
                    </a>
                  )}
                </div>
              </section>

              {/* Card 3: Schedules & Lock Times */}
              <section
                className="p-8 rounded-[28px] border shadow-xl space-y-6"
                style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
              >
                <div className="flex items-center gap-3 pb-4 border-b" style={{ borderColor: 'var(--athlon-border)' }}>
                  <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-foreground">Competition Schedule &amp; Lock Dates</h2>
                    <p className="text-xs text-foreground/50">Start &amp; end dates, match hours, and registration deadlines</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={desktopLabelClass}>
                      Tournament Start Date <span className="text-primary">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className={`${desktopInputClass} col-span-2`}
                        style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                      />
                      <input
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        className={desktopInputClass}
                        style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={desktopLabelClass}>
                      Tournament End Date <span className="text-primary">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className={`${desktopInputClass} col-span-2`}
                        style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                      />
                      <input
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                        className={desktopInputClass}
                        style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className={desktopLabelClass}>Registration Lock Deadline (Optional)</label>
                  <div className="grid grid-cols-3 gap-3">
                    <input
                      type="date"
                      value={formData.registrationClosingDate}
                      onChange={(e) => setFormData({ ...formData, registrationClosingDate: e.target.value })}
                      className={`${desktopInputClass} col-span-2`}
                      style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                    />
                    <input
                      type="time"
                      value={formData.registrationClosingTime}
                      onChange={(e) => setFormData({ ...formData, registrationClosingTime: e.target.value })}
                      className={desktopInputClass}
                      style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                    />
                  </div>
                  <span className="text-[11px] text-foreground/45 mt-1.5 block">
                    Entries will automatically close after this timestamp.
                  </span>
                </div>
              </section>

              {/* Card 4: Entry Fees & Rules Notes */}
              <section
                className="p-8 rounded-[28px] border shadow-xl space-y-6"
                style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
              >
                <div className="flex items-center gap-3 pb-4 border-b" style={{ borderColor: 'var(--athlon-border)' }}>
                  <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <Ticket className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-foreground">Registration Fees &amp; Tournament Notes</h2>
                    <p className="text-xs text-foreground/50">Entry pricing, organizer contact number, and description</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={desktopLabelClass}>Entry Fee Per Entry (₹)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40 font-black">₹</span>
                      <input
                        type="number"
                        min="0"
                        value={formData.registrationFees}
                        onChange={(e) => setFormData({ ...formData, registrationFees: e.target.value })}
                        className={`${desktopInputClass} pl-8`}
                        style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                        placeholder="0 for free entry"
                      />
                    </div>
                  </div>

                  <div>
                    <label className={desktopLabelClass}>Organizer Contact Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                      <input
                        type="tel"
                        value={formData.contactPhone}
                        onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                        className={`${desktopInputClass} pl-11`}
                        style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                        placeholder="10-digit mobile number"
                        maxLength={10}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className={desktopLabelClass}>Tournament Description &amp; Guidelines</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className={`${desktopInputClass} min-h-[120px] resize-none leading-relaxed`}
                    style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                    placeholder="Enter court rules, shuttlecock specifications, referee contacts, and reporting time notes..."
                  />
                </div>
              </section>
            </div>

            {/* Right Sticky Preview & Action Column (5 Cols) */}
            <div className="col-span-5 space-y-6 sticky top-6">
              {/* Poster Upload Zone */}
              <div
                className="p-6 rounded-[28px] border shadow-xl space-y-4"
                style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-foreground/60">
                    Tournament Poster
                  </span>
                  <span className="text-[10px] text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                    2:3 or 4:5 Portrait
                  </span>
                </div>

                <input
                  ref={desktopPosterInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePosterChange}
                  className="hidden"
                />

                {posterPreview ? (
                  <div className="relative rounded-2xl overflow-hidden border border-white/10 aspect-[4/5] max-h-[380px] mx-auto shadow-lg group bg-black/40 flex items-center justify-center">
                    <img src={posterPreview} alt="Poster Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => desktopPosterInputRef.current?.click()}
                        className="px-3.5 py-2 rounded-xl bg-white/20 backdrop-blur-md text-xs font-bold text-white hover:bg-white/30 transition-all"
                      >
                        Change Poster
                      </button>
                      <button
                        onClick={() => {
                          setPosterPreview(null);
                          setPosterFile(null);
                        }}
                        className="p-2 rounded-xl bg-red-500/80 backdrop-blur-md text-white hover:bg-red-600 transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => desktopPosterInputRef.current?.click()}
                    className="border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-3 group-hover:scale-110 transition-transform">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-black text-foreground">Upload Tournament Poster</span>
                    <span className="text-xs text-foreground/40 mt-1">Portrait ratio 2:3 or 4:5 · Max 5MB</span>
                  </div>
                )}
              </div>

              {/* Live Card Preview in Athlete Portal */}
              <div
                className="p-6 rounded-[28px] border shadow-xl space-y-4"
                style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-foreground/60">
                    Live Portal Card Preview
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-primary/20 text-primary border border-primary/30">
                    Live Preview
                  </span>
                </div>

                {/* The Mocked Card */}
                <div
                  className="rounded-[24px] border overflow-hidden shadow-2xl relative"
                  style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                >
                  <div className="h-1.5 w-full bg-gradient-to-r from-primary via-emerald-400 to-yellow-500" />
                  <div className="p-5 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/15 text-primary border border-primary/30">
                        {formData.tournamentType}
                      </span>
                      <span className="text-xs font-bold text-foreground/60">{formData.sport}</span>
                    </div>

                    <div>
                      <h3 className="text-base font-black text-foreground leading-snug truncate">
                        {formData.name || 'Tournament Title Preview'}
                      </h3>
                      <span className="text-xs text-primary font-bold">{formData.matchFormat}</span>
                    </div>

                    <div className="space-y-1 text-xs text-foreground/60">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>
                          {formData.startDate && formData.endDate && formData.startDate === formData.endDate
                            ? formData.startDate
                            : `${formData.startDate || 'Start Date'} - ${formData.endDate || 'End Date'}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate">{formData.location || 'Venue Location'}</span>
                      </div>
                    </div>

                    <div
                      className="pt-3 border-t flex items-center justify-between text-xs"
                      style={{ borderColor: 'var(--athlon-border)' }}
                    >
                      <span className="font-mono font-black text-foreground">
                        {formData.registrationFees ? `₹${formData.registrationFees}` : 'Free Entry'}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-wider text-primary">
                        {formData.type} EVENT
                      </span>
                    </div>
                  </div>
                </div>

                {/* Form Progress Meter */}
                <div className="pt-2 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-foreground/60">Form Completion</span>
                    <span className="font-black text-primary font-mono">{progressPercent}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Launch Button */}
                <button
                  onClick={handleSubmit}
                  disabled={!isFormValid || isSubmitting}
                  className="w-full py-4 rounded-2xl bg-primary text-black font-black text-sm uppercase tracking-wider shadow-xl shadow-primary/25 hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span>Publishing Tournament...</span>
                  ) : (
                    <>
                      <Trophy className="w-4 h-4" />
                      <span>Launch Competition Now</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
