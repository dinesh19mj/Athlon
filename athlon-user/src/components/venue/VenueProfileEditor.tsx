'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle2,
  Sparkles,
  Shield,
  Save,
  Plus,
  Check,
  Zap,
  RotateCcw,
  Copy,
  Info,
  CalendarCheck2,
  Calendar,
  Layers,
  FileText,
  SlidersHorizontal,
  ChevronRight,
  Flame,
  CheckCheck,
  AlertCircle,
} from 'lucide-react';
import {
  venueApi,
  VenueDto,
  VenueType,
  VenueStatus,
} from '@/lib/api/venue';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';

interface VenueProfileEditorProps {
  orgId: string;
}

interface AmenityDef {
  id: string;
  label: string;
  category: 'Court' | 'Facility' | 'Convenience' | 'Safety';
  iconEmoji: string;
}

const ALL_AMENITIES: AmenityDef[] = [
  { id: 'Floodlights', label: 'Floodlights / Night Play', category: 'Court', iconEmoji: '💡' },
  { id: 'Air Conditioned', label: 'Air Conditioned Arena', category: 'Court', iconEmoji: '❄️' },
  { id: 'Changing Rooms', label: 'Changing Rooms', category: 'Facility', iconEmoji: '🚪' },
  { id: 'Showers', label: 'Hot & Cold Showers', category: 'Facility', iconEmoji: '🚿' },
  { id: 'Locker Rooms', label: 'Secure Locker Rooms', category: 'Facility', iconEmoji: '🔐' },
  { id: 'Drinking Water', label: 'RO Drinking Water', category: 'Facility', iconEmoji: '💧' },
  { id: 'Parking', label: 'Vehicle Parking', category: 'Convenience', iconEmoji: '🚗' },
  { id: 'Pro Shop / Equipment Rental', label: 'Pro Shop & Rentals', category: 'Convenience', iconEmoji: '🏸' },
  { id: 'Refreshments / Cafeteria', label: 'Cafeteria & Drinks', category: 'Convenience', iconEmoji: '☕' },
  { id: 'First Aid / Physio', label: 'First Aid & Physio', category: 'Safety', iconEmoji: '🩹' },
  { id: 'Spectator Seating', label: 'Viewing Gallery', category: 'Facility', iconEmoji: '🏟️' },
  { id: 'Wi-Fi', label: 'High-speed Wi-Fi', category: 'Convenience', iconEmoji: '📶' },
  { id: 'CCTV Surveillance', label: '24/7 CCTV Security', category: 'Safety', iconEmoji: '📹' },
];

const DAYS_OF_WEEK = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

const DAY_SHORT_LABELS: Record<string, { short: string; mini: string }> = {
  MONDAY: { short: 'Mon', mini: 'M' },
  TUESDAY: { short: 'Tue', mini: 'T' },
  WEDNESDAY: { short: 'Wed', mini: 'W' },
  THURSDAY: { short: 'Thu', mini: 'T' },
  FRIDAY: { short: 'Fri', mini: 'F' },
  SATURDAY: { short: 'Sat', mini: 'S' },
  SUNDAY: { short: 'Sun', mini: 'S' },
};

export function VenueProfileEditor({ orgId }: VenueProfileEditorProps) {
  const { getActiveOrganization, organizations } = useWorkspaceStore();
  const org = getActiveOrganization() || organizations.find((o) => o.id === orgId);

  const [venue, setVenue] = useState<VenueDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Mobile Active Sub-tab View ('amenities' | 'hours' | 'policies')
  const [mobileSubTab, setMobileSubTab] = useState<'amenities' | 'hours' | 'policies'>('amenities');
  const [amenityCategoryFilter, setAmenityCategoryFilter] = useState<'ALL' | 'Court' | 'Facility' | 'Convenience' | 'Safety'>('ALL');

  // Selected Amenities
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    'Floodlights',
    'Drinking Water',
    'Changing Rooms',
    'Parking',
  ]);

  // Operating Hours
  const [operatingHours, setOperatingHours] = useState<
    { dayOfWeek: string; openingTime: string; closingTime: string; isClosed: boolean }[]
  >(
    DAYS_OF_WEEK.map((d) => ({
      dayOfWeek: d,
      openingTime: '06:00',
      closingTime: '23:00',
      isClosed: false,
    }))
  );

  // Guidelines & Policies
  const [rules, setRules] = useState('');
  const [cancellationPolicy, setCancellationPolicy] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const orgVenues = await venueApi.getVenuesByOrganization(orgId);
        if (orgVenues?.success && orgVenues.data && orgVenues.data.length > 0) {
          const v = orgVenues.data[0];
          setVenue(v);
          setRules(v.rulesAndRegulations || '');
          setCancellationPolicy(v.cancellationPolicy || '');
          if (v.amenities && v.amenities.length > 0) {
            setSelectedAmenities(v.amenities.map((a) => a.amenityName));
          }
          if (v.operatingHours && v.operatingHours.length > 0) {
            setOperatingHours(
              DAYS_OF_WEEK.map((day) => {
                const existing = v.operatingHours?.find(
                  (h) => h.dayOfWeek.toUpperCase() === day.toUpperCase()
                );
                return {
                  dayOfWeek: day,
                  openingTime: existing?.openingTime?.slice(0, 5) || '06:00',
                  closingTime: existing?.closingTime?.slice(0, 5) || '23:00',
                  isClosed: existing?.isClosed || false,
                };
              })
            );
          }
        }
      } catch (err) {
        console.error('Failed to load venue profile:', err);
      } finally {
        setLoading(false);
      }
    }
    if (orgId) {
      loadData();
    }
  }, [orgId]);

  const toggleAmenity = (amenityId: string) => {
    if (selectedAmenities.includes(amenityId)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== amenityId));
    } else {
      setSelectedAmenities([...selectedAmenities, amenityId]);
    }
  };

  const handleHourChange = (index: number, field: string, value: any) => {
    const updated = [...operatingHours];
    updated[index] = { ...updated[index], [field]: value };
    setOperatingHours(updated);
  };

  // Quick Batch Actions
  const applyMondayToAllWeekdays = () => {
    const mon = operatingHours[0];
    const updated = operatingHours.map((h, i) => {
      if (i < 5) {
        return { ...h, openingTime: mon.openingTime, closingTime: mon.closingTime, isClosed: mon.isClosed };
      }
      return h;
    });
    setOperatingHours(updated);
  };

  const setAllHoursStandard = (open: string, close: string) => {
    const updated = operatingHours.map((h) => ({
      ...h,
      openingTime: open,
      closingTime: close,
      isClosed: false,
    }));
    setOperatingHours(updated);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setSaving(true);
      setSavedSuccess(false);
      setErrorMessage(null);

      const payload = {
        name: venue?.name || org?.name || 'Sports Venue',
        description: venue?.description || '',
        venueType: venue?.venueType || ('MIXED' as VenueType),
        addressLine1: venue?.addressLine1 || '',
        addressLine2: venue?.addressLine2 || '',
        city: venue?.city || '',
        state: venue?.state || '',
        postalCode: venue?.postalCode || '',
        contactNumber: venue?.contactNumber || '',
        email: venue?.email || '',
        rulesAndRegulations: rules.trim(),
        cancellationPolicy: cancellationPolicy.trim(),
        amenityNames: selectedAmenities,
        operatingHours: operatingHours.map((h) => ({
          dayOfWeek: h.dayOfWeek,
          openingTime: h.isClosed ? '00:00' : `${h.openingTime}:00`,
          closingTime: h.isClosed ? '00:00' : `${h.closingTime}:00`,
          isClosed: h.isClosed,
        })),
      };

      let res;
      if (venue?.venueUuid) {
        res = await venueApi.updateVenue(venue.venueUuid, payload);
      } else {
        res = await venueApi.createVenue({
          organizationUuid: orgId,
          status: 'ACTIVE' as VenueStatus,
          bookingEnabled: true,
          ...payload,
        });
      }

      if (res?.success && res.data) {
        setVenue(res.data);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3500);
      } else {
        setErrorMessage(res?.message || 'Failed to update venue amenities and operating hours.');
      }
    } catch (err: any) {
      console.error('Failed to save venue:', err);
      setErrorMessage(err?.message || 'An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-10 text-center rounded-3xl bg-card border border-border space-y-3">
        <Clock className="w-8 h-8 text-primary animate-spin mx-auto" />
        <p className="text-xs font-bold text-foreground/60">Loading venue amenities & operating hours...</p>
      </div>
    );
  }

  const openDaysCount = operatingHours.filter((h) => !h.isClosed).length;
  const filteredAmenities = amenityCategoryFilter === 'ALL'
    ? ALL_AMENITIES
    : ALL_AMENITIES.filter((a) => a.category === amenityCategoryFilter);

  return (
    <div className="w-full">
      {/* ══════════════════════════════════════════════════════════════════════
          1. MOBILE ONLY VIEW (md:hidden) — ULTRA STYLISH APP-LIKE EXPERIENCE
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="block md:hidden space-y-4 pb-20">
        {/* Mobile Top Hero Header */}
        <div
          className="relative rounded-3xl p-4 overflow-hidden border shadow-lg"
          style={{
            backgroundColor: 'var(--athlon-card)',
            borderColor: 'var(--athlon-border)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          }}
        >
          {/* Subtle Ambient Background Glow */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 space-y-3">
            {/* Header Badge Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shadow-inner">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-primary block">
                    Venue Configuration
                  </span>
                  <h2 className="text-sm font-black text-foreground tracking-tight">
                    Amenities &amp; Hours
                  </h2>
                </div>
              </div>

              {/* Status Badge */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{openDaysCount} / 7 Days Active</span>
              </div>
            </div>

            {/* Micro Stats Strip */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <div
                className="p-2.5 rounded-2xl border text-center"
                style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
              >
                <div className="text-xs font-black text-foreground">{selectedAmenities.length} Active</div>
                <div className="text-[9px] font-bold text-foreground/50 uppercase">Amenities</div>
              </div>
              <div
                className="p-2.5 rounded-2xl border text-center"
                style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
              >
                <div className="text-xs font-black text-primary truncate">
                  {operatingHours[0]?.openingTime || '06:00'} - {operatingHours[0]?.closingTime || '23:00'}
                </div>
                <div className="text-[9px] font-bold text-foreground/50 uppercase">Daily Hours</div>
              </div>
              <div
                className="p-2.5 rounded-2xl border text-center"
                style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
              >
                <div className="text-xs font-black text-foreground">
                  {rules ? 'Customized' : 'Standard'}
                </div>
                <div className="text-[9px] font-bold text-foreground/50 uppercase">Guidelines</div>
              </div>
            </div>

            {/* Quick Mobile Save Button */}
            <button
              type="button"
              onClick={() => handleSave()}
              disabled={saving}
              className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-primary/25 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Updates...' : 'Save All Changes'}</span>
            </button>
          </div>
        </div>

        {/* Feedback Messages on Mobile */}
        {savedSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Venue amenities and schedule saved successfully!</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ── Mobile Segmented Sub-Tab Switcher ── */}
        <div
          className="p-1 rounded-2xl border flex items-center gap-1 shadow-sm"
          style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
        >
          <button
            type="button"
            onClick={() => setMobileSubTab('amenities')}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              mobileSubTab === 'amenities'
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'text-foreground/70 hover:text-foreground'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Amenities ({selectedAmenities.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileSubTab('hours')}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              mobileSubTab === 'hours'
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'text-foreground/70 hover:text-foreground'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Hours</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileSubTab('policies')}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              mobileSubTab === 'policies'
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'text-foreground/70 hover:text-foreground'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Rules</span>
          </button>
        </div>

        {/* ── SECTION A: MOBILE AMENITIES ── */}
        {mobileSubTab === 'amenities' && (
          <div className="space-y-3 animate-in fade-in duration-200">
            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
              {(['ALL', 'Court', 'Facility', 'Convenience', 'Safety'] as const).map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setAmenityCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all border active:scale-95 ${
                    amenityCategoryFilter === cat
                      ? 'bg-primary/20 text-primary border-primary/50'
                      : 'border-border text-foreground/60 hover:text-foreground bg-card/60'
                  }`}
                  style={{ borderColor: amenityCategoryFilter === cat ? undefined : 'var(--athlon-border)' }}
                >
                  {cat === 'ALL' ? 'All Amenities' : cat}
                </button>
              ))}
            </div>

            {/* Interactive Grid of Amenities Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredAmenities.map((amenity) => {
                const isSelected = selectedAmenities.includes(amenity.id);
                return (
                  <button
                    type="button"
                    key={amenity.id}
                    onClick={() => toggleAmenity(amenity.id)}
                    className={`p-3 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all active:scale-[0.97] ${
                      isSelected
                        ? 'border-primary/60 shadow-md shadow-primary/10'
                        : 'border-border opacity-70 hover:opacity-100'
                    }`}
                    style={{
                      backgroundColor: isSelected ? 'var(--athlon-surface)' : 'var(--athlon-card)',
                      borderColor: isSelected ? 'var(--athlon-primary)' : 'var(--athlon-border)',
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-2xl flex items-center justify-center text-base shrink-0 border ${
                          isSelected
                            ? 'bg-primary/20 border-primary/40 shadow-inner'
                            : 'bg-foreground/5 border-foreground/10'
                        }`}
                      >
                        {amenity.iconEmoji}
                      </div>
                      <div className="min-w-0">
                        <span className={`block text-xs font-bold truncate ${isSelected ? 'text-foreground' : 'text-foreground/80'}`}>
                          {amenity.label}
                        </span>
                        <span className="text-[9.5px] font-mono font-bold uppercase tracking-wider text-foreground/40 block">
                          {amenity.category}
                        </span>
                      </div>
                    </div>

                    {/* Checkmark Status Bubble */}
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all ${
                        isSelected
                          ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/40 scale-100'
                          : 'border border-foreground/20 text-transparent scale-90'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── SECTION B: MOBILE OPERATING HOURS ── */}
        {mobileSubTab === 'hours' && (
          <div className="space-y-3 animate-in fade-in duration-200">
            {/* Quick Batch Actions Strip */}
            <div className="flex items-center justify-between gap-2 p-2 rounded-2xl border bg-card/60" style={{ borderColor: 'var(--athlon-border)' }}>
              <span className="text-[10px] font-black uppercase text-foreground/60 px-1">Quick Tools</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={applyMondayToAllWeekdays}
                  className="px-2.5 py-1 rounded-xl text-[10px] font-bold border bg-surface hover:text-primary transition-all flex items-center gap-1 active:scale-95"
                  style={{ borderColor: 'var(--athlon-border)' }}
                >
                  <Copy className="w-3 h-3 text-primary" />
                  <span>Mon ➔ Fri</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAllHoursStandard('06:00', '23:00')}
                  className="px-2.5 py-1 rounded-xl text-[10px] font-bold border bg-surface hover:text-primary transition-all flex items-center gap-1 active:scale-95"
                  style={{ borderColor: 'var(--athlon-border)' }}
                >
                  <Zap className="w-3 h-3 text-primary" />
                  <span>6 AM - 11 PM</span>
                </button>
              </div>
            </div>

            {/* List of 7 Days */}
            <div className="space-y-2">
              {operatingHours.map((hour, idx) => {
                const dayMeta = DAY_SHORT_LABELS[hour.dayOfWeek] || { short: hour.dayOfWeek.slice(0, 3), mini: hour.dayOfWeek.charAt(0) };
                return (
                  <div
                    key={hour.dayOfWeek}
                    className={`p-3 rounded-2xl border transition-all ${
                      hour.isClosed
                        ? 'opacity-50 border-dashed bg-background/40'
                        : 'bg-card shadow-sm'
                    }`}
                    style={{
                      backgroundColor: hour.isClosed ? undefined : 'var(--athlon-card)',
                      borderColor: 'var(--athlon-border)',
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      {/* Day Label */}
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center text-[10px] font-black uppercase ${
                            hour.isClosed
                              ? 'bg-foreground/10 text-foreground/40'
                              : 'bg-primary/20 text-primary border border-primary/30'
                          }`}
                        >
                          {dayMeta.mini}
                        </div>
                        <div>
                          <span className="text-xs font-black text-foreground block">
                            {dayMeta.short}
                          </span>
                          <span className="text-[9px] text-foreground/40 uppercase font-mono block">
                            {hour.dayOfWeek}
                          </span>
                        </div>
                      </div>

                      {/* Time Pickers or Closed Label */}
                      {!hour.isClosed ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="time"
                            value={hour.openingTime}
                            onChange={(e) => handleHourChange(idx, 'openingTime', e.target.value)}
                            className="px-2 py-1 rounded-xl border text-[11px] font-mono font-bold text-foreground outline-none focus:border-primary text-center"
                            style={{
                              backgroundColor: 'var(--athlon-surface)',
                              borderColor: 'var(--athlon-border)',
                            }}
                          />
                          <span className="text-[10px] text-foreground/40 font-bold">➔</span>
                          <input
                            type="time"
                            value={hour.closingTime}
                            onChange={(e) => handleHourChange(idx, 'closingTime', e.target.value)}
                            className="px-2 py-1 rounded-xl border text-[11px] font-mono font-bold text-foreground outline-none focus:border-primary text-center"
                            style={{
                              backgroundColor: 'var(--athlon-surface)',
                              borderColor: 'var(--athlon-border)',
                            }}
                          />
                        </div>
                      ) : (
                        <span className="text-[11px] font-bold text-red-400 italic px-2 py-1 rounded-lg bg-red-500/10 border border-red-500/20">
                          Closed
                        </span>
                      )}

                      {/* Open / Closed Toggle Switch */}
                      <button
                        type="button"
                        onClick={() => handleHourChange(idx, 'isClosed', !hour.isClosed)}
                        className={`w-11 h-6 rounded-full p-0.5 transition-colors relative shrink-0 ${
                          !hour.isClosed ? 'bg-primary' : 'bg-foreground/20'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                            !hour.isClosed ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── SECTION C: MOBILE RULES & POLICIES ── */}
        {mobileSubTab === 'policies' && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <div
              className="p-4 rounded-3xl border space-y-3"
              style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <h3 className="text-xs font-black uppercase text-foreground">Court Rules &amp; Footwear</h3>
              </div>
              <textarea
                rows={3}
                placeholder="e.g. Non-marking gum sole shoes mandatory. Outside food not permitted on courts."
                value={rules}
                onChange={(e) => setRules(e.target.value)}
                className="w-full p-3 rounded-2xl border text-xs font-medium text-foreground outline-none focus:border-primary resize-none leading-relaxed"
                style={{
                  backgroundColor: 'var(--athlon-surface)',
                  borderColor: 'var(--athlon-border)',
                }}
              />
            </div>

            <div
              className="p-4 rounded-3xl border space-y-3"
              style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <h3 className="text-xs font-black uppercase text-foreground">Cancellation &amp; Refund Terms</h3>
              </div>
              <textarea
                rows={3}
                placeholder="e.g. Cancellations allowed up to 4 hours prior to slot for 100% wallet credit."
                value={cancellationPolicy}
                onChange={(e) => setCancellationPolicy(e.target.value)}
                className="w-full p-3 rounded-2xl border text-xs font-medium text-foreground outline-none focus:border-primary resize-none leading-relaxed"
                style={{
                  backgroundColor: 'var(--athlon-surface)',
                  borderColor: 'var(--athlon-border)',
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          2. DESKTOP ONLY VIEW (hidden md:block) — 100% UNTOUCHED ORIGINAL LAYOUT
         ══════════════════════════════════════════════════════════════════════ */}
      <form onSubmit={handleSave} className="hidden md:block space-y-6">
        {/* Status Banner */}
        <div
          className="p-5 rounded-3xl border relative overflow-hidden bg-card shadow-sm flex items-center justify-between gap-4"
          style={{ borderColor: 'var(--athlon-border)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-black text-foreground uppercase tracking-wider">
                  Venue Amenities &amp; Operating Hours
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {openDaysCount} Days Active / Wk
                </span>
              </div>
              <p className="text-xs text-foreground/55 mt-0.5">
                General organization info, name, address, and contact details are managed in{' '}
                <span className="font-bold text-primary">Organization Profile</span>.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-2xl bg-primary text-primary-foreground font-black text-xs hover:brightness-110 shadow-lg shadow-primary/20 flex items-center gap-2 disabled:opacity-50 active:scale-95 transition-all shrink-0"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>

        {savedSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Venue amenities and weekly operating hours updated successfully!</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <Shield className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 1. Venue Amenities Management */}
        <div
          className="p-6 rounded-3xl border bg-card/60 space-y-4 shadow-sm"
          style={{ borderColor: 'var(--athlon-border)' }}
        >
          <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--athlon-border)' }}>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-black text-foreground uppercase tracking-wider">
                Venue Amenities &amp; Court Features ({selectedAmenities.length} selected)
              </h3>
            </div>
            <span className="text-[11px] text-foreground/50 font-medium">
              Click to toggle amenities displayed to players during court bookings.
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {ALL_AMENITIES.map((amenity) => {
              const isSelected = selectedAmenities.includes(amenity.id);
              return (
                <button
                  type="button"
                  key={amenity.id}
                  onClick={() => toggleAmenity(amenity.id)}
                  className={`p-3 rounded-2xl text-left text-xs font-bold transition-all border flex items-center justify-between gap-2 active:scale-[0.98] ${
                    isSelected
                      ? 'bg-primary/15 text-primary border-primary/50 shadow-sm shadow-primary/10'
                      : 'bg-background/80 border-border text-foreground/70 hover:text-foreground hover:bg-foreground/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-primary text-black font-black' : 'bg-foreground/10 text-foreground/60'
                      }`}
                    >
                      {isSelected ? <Check className="w-4 h-4 stroke-[3]" /> : <Plus className="w-3.5 h-3.5" />}
                    </div>
                    <div className="min-w-0">
                      <span className="block truncate">{amenity.label}</span>
                      <span className="text-[10px] text-foreground/40 uppercase font-mono block">{amenity.category}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Weekly Operating Hours Schedule */}
        <div
          className="p-6 rounded-3xl border bg-card/60 space-y-4 shadow-sm"
          style={{ borderColor: 'var(--athlon-border)' }}
        >
          <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--athlon-border)' }}>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-black text-foreground uppercase tracking-wider">
                Weekly Operating Schedule
              </h3>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={applyMondayToAllWeekdays}
                className="px-2.5 py-1.5 rounded-xl border text-[11px] font-bold text-foreground/80 hover:text-primary hover:bg-foreground/5 transition-all flex items-center gap-1 active:scale-95"
                style={{ borderColor: 'var(--athlon-border)' }}
                title="Copy Monday hours to Tuesday through Friday"
              >
                <Copy className="w-3 h-3 text-primary" />
                <span>Copy Mon to Fri</span>
              </button>

              <button
                type="button"
                onClick={() => setAllHoursStandard('06:00', '23:00')}
                className="px-2.5 py-1.5 rounded-xl border text-[11px] font-bold text-foreground/80 hover:text-primary hover:bg-foreground/5 transition-all flex items-center gap-1 active:scale-95"
                style={{ borderColor: 'var(--athlon-border)' }}
                title="Set standard 6:00 AM to 11:00 PM for all days"
              >
                <Zap className="w-3 h-3 text-primary" />
                <span>6 AM – 11 PM All</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {operatingHours.map((hour, idx) => (
              <div
                key={hour.dayOfWeek}
                className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                  hour.isClosed ? 'bg-background/40 opacity-60 border-dashed' : 'bg-background border-border'
                }`}
              >
                <div className="flex items-center gap-2 w-36">
                  <CalendarCheck2 className={`w-4 h-4 ${hour.isClosed ? 'text-foreground/30' : 'text-primary'}`} />
                  <span className="text-xs font-black uppercase tracking-wider text-foreground">
                    {hour.dayOfWeek}
                  </span>
                </div>

                {!hour.isClosed ? (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] uppercase font-bold text-foreground/40">Open</span>
                      <input
                        type="time"
                        value={hour.openingTime}
                        onChange={(e) => handleHourChange(idx, 'openingTime', e.target.value)}
                        className="px-2.5 py-1.5 rounded-xl bg-surface border border-border text-xs font-mono font-bold text-foreground outline-none focus:border-primary"
                      />
                    </div>
                    <span className="text-xs text-foreground/40 font-bold px-1">–</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] uppercase font-bold text-foreground/40">Close</span>
                      <input
                        type="time"
                        value={hour.closingTime}
                        onChange={(e) => handleHourChange(idx, 'closingTime', e.target.value)}
                        className="px-2.5 py-1.5 rounded-xl bg-surface border border-border text-xs font-mono font-bold text-foreground outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                ) : (
                  <span className="text-xs font-bold text-foreground/40 italic py-1">
                    Closed on this day
                  </span>
                )}

                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={hour.isClosed}
                    onChange={(e) => handleHourChange(idx, 'isClosed', e.target.checked)}
                    className="rounded accent-primary"
                  />
                  <span className={hour.isClosed ? 'text-red-400 font-bold' : 'text-foreground/70'}>
                    {hour.isClosed ? 'Closed' : 'Open'}
                  </span>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Court Policies & Player Guidelines */}
        <div
          className="p-6 rounded-3xl border bg-card/60 space-y-4 shadow-sm"
          style={{ borderColor: 'var(--athlon-border)' }}
        >
          <div className="flex items-center gap-2 border-b pb-3" style={{ borderColor: 'var(--athlon-border)' }}>
            <Shield className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-black text-foreground uppercase tracking-wider">
              Court Footwear Rules &amp; Cancellation Policy
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <span>Court Rules &amp; Footwear Policy</span>
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Non-marking gum sole shoes mandatory for badminton courts. No outside food allowed on synthetic turfs."
                value={rules}
                onChange={(e) => setRules(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-background border text-xs font-medium text-foreground outline-none focus:border-primary resize-none leading-relaxed"
                style={{ borderColor: 'var(--athlon-border)' }}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <span>Cancellation &amp; Refund Policy</span>
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Cancellations allowed up to 4 hours before slot time for full wallet credit."
                value={cancellationPolicy}
                onChange={(e) => setCancellationPolicy(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-background border text-xs font-medium text-foreground outline-none focus:border-primary resize-none leading-relaxed"
                style={{ borderColor: 'var(--athlon-border)' }}
              />
            </div>
          </div>
        </div>

        {/* Desktop Save Button Bar */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-black text-xs hover:brightness-110 shadow-lg shadow-primary/20 flex items-center gap-2 disabled:opacity-50 active:scale-95 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Changes...' : 'Save Amenities & Hours'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
