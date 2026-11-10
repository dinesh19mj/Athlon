'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Building2,
  Plus,
  Edit2,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Layers,
  Tag,
  Shield,
  Search,
  IndianRupee,
  Filter,
  Check,
  RefreshCw,
  CalendarDays,
  ExternalLink,
  SlidersHorizontal,
  Eye,
  ArrowRight,
  Sun,
  Umbrella,
  Waves,
  Trophy,
  Compass
} from 'lucide-react';
import {
  venueApi,
  facilityApi,
  VenueDto,
  FacilityDto,
  FacilityType,
  SurfaceType,
  FacilityStatus
} from '@/lib/api/venue';
import { SubscriptionService, VenueEntitlementSummary } from '@/lib/api/subscription';
import { FeaturePaywallModal } from '@/components/venue/FeaturePaywallModal';
import { useVenueEntitlementsStore } from '@/store/useVenueEntitlementsStore';

export default function VenueFacilitiesPage() {
  const params = useParams();
  const orgId = params?.orgId as string;

  const {
    entitlementsByOrg,
    loadEntitlements: loadStoreEntitlements,
    refreshEntitlements: refreshStoreEntitlements,
  } = useVenueEntitlementsStore();
  const storeEntitlements = orgId ? entitlementsByOrg[orgId] : null;

  const [venue, setVenue] = useState<VenueDto | null>(null);
  const [facilities, setFacilities] = useState<FacilityDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState<FacilityDto | null>(null);
  const [inspectedFacility, setInspectedFacility] = useState<FacilityDto | null>(null);
  const [localEntitlements, setEntitlements] = useState<VenueEntitlementSummary | null>(null);
  const entitlements = storeEntitlements || localEntitlements;
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);

  // Desktop filtering & views
  const [searchQuery, setSearchQuery] = useState('');
  const [desktopTypeFilter, setDesktopTypeFilter] = useState<string>('ALL');
  const [desktopEnvironmentFilter, setDesktopEnvironmentFilter] = useState<string>('ALL');
  const [desktopSurfaceFilter, setDesktopSurfaceFilter] = useState<string>('ALL');
  const [desktopViewMode, setDesktopViewMode] = useState<'grid' | 'table'>('grid');

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [facilityType, setFacilityType] = useState<FacilityType>('COURT');
  const [indoorOutdoor, setIndoorOutdoor] = useState<'INDOOR' | 'OUTDOOR'>('INDOOR');
  const [surfaceType, setSurfaceType] = useState<SurfaceType>('SYNTHETIC');
  const [slotDurationMinutes, setSlotDurationMinutes] = useState(60);
  const [standardPrice, setStandardPrice] = useState(500);
  const [selectedSports, setSelectedSports] = useState<string[]>(['Badminton']);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableSports = [
    'Badminton', 'Tennis', 'Pickleball', 'Squash',
    'Cricket', 'Football', 'Basketball', 'Table Tennis', 'Volleyball', 'Swimming'
  ];

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        let orgVenues = await venueApi.getVenuesByOrganization(orgId);
        let v = orgVenues?.data && orgVenues.data.length > 0 ? orgVenues.data[0] : null;

        if (!v) {
          // Auto-create initial default venue for this workspace if not present
          const createRes = await venueApi.createVenue({
            organizationUuid: orgId,
            name: 'Main Sports Complex',
            venueType: 'MIXED',
            bookingEnabled: true,
            status: 'ACTIVE' as any,
          });
          if (createRes?.success && createRes.data) {
            v = createRes.data;
          }
        }

        if (v) {
          setVenue(v);
          await loadFacilities(v.venueId);
        }

        const entRes = await loadStoreEntitlements(orgId);
        if (entRes) {
          setEntitlements(entRes);
        }
      } catch (err: any) {
        console.error('Failed to load facilities:', err);
        setError(err?.message || 'Failed to load venue facilities');
      } finally {
        setLoading(false);
      }
    }
    if (orgId) {
      loadData();
    }
  }, [orgId]);

  const loadFacilities = async (venueId: number) => {
    try {
      const res = await facilityApi.getFacilitiesByVenue(venueId);
      if (res?.success && res.data) {
        setFacilities(res.data);
      }
    } catch (err: any) {
      console.error('Failed to load facility list:', err);
    }
  };

  const handleRefresh = async () => {
    if (!venue) return;
    setRefreshing(true);
    try {
      await Promise.all([
        loadFacilities(venue.venueId),
        SubscriptionService.getVenueEntitlements(orgId).then((res) => {
          if (res?.data) setEntitlements(res.data);
        }).catch(() => null)
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  const openCreateModal = () => {
    if (entitlements && !entitlements.canAddFacility) {
      setIsPaywallOpen(true);
      return;
    }
    setEditingFacility(null);
    setName('');
    setDescription('');
    setFacilityType('COURT');
    setIndoorOutdoor('INDOOR');
    setSurfaceType('SYNTHETIC');
    setSlotDurationMinutes(60);
    setStandardPrice(500);
    setSelectedSports(['Badminton']);
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (fac: FacilityDto) => {
    setEditingFacility(fac);
    setName(fac.name || '');
    setDescription(fac.description || '');
    setFacilityType(fac.facilityType || 'COURT');
    setIndoorOutdoor((fac.indoorOutdoor as any) || 'INDOOR');
    setSurfaceType(fac.surfaceType || 'SYNTHETIC');
    setSlotDurationMinutes(fac.slotDurationMinutes || 60);
    const primaryPricing = fac.pricingRules?.find(p => p.pricingType === 'STANDARD');
    setStandardPrice(primaryPricing?.price || 500);
    setSelectedSports(fac.sports?.map(s => s.sportName) || ['Badminton']);
    setError(null);
    setIsModalOpen(true);
  };

  const toggleSport = (sport: string) => {
    if (selectedSports.includes(sport)) {
      if (selectedSports.length > 1) {
        setSelectedSports(selectedSports.filter(s => s !== sport));
      }
    } else {
      setSelectedSports([...selectedSports, sport]);
    }
  };

  const handleSaveFacility = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !name.trim()) {
      setError('Facility name is required.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      let currentVenue = venue;
      if (!currentVenue) {
        const orgVenues = await venueApi.getVenuesByOrganization(orgId);
        if (orgVenues?.data && orgVenues.data.length > 0) {
          currentVenue = orgVenues.data[0];
          setVenue(currentVenue);
        } else {
          const createRes = await venueApi.createVenue({
            organizationUuid: orgId,
            name: 'Main Sports Complex',
            venueType: 'MIXED',
            bookingEnabled: true,
            status: 'ACTIVE' as any,
          });
          if (createRes?.success && createRes.data) {
            currentVenue = createRes.data;
            setVenue(currentVenue);
          }
        }
      }

      if (!currentVenue) {
        setError('Venue profile not found. Please refresh the page and try again.');
        return;
      }

      const payload = {
        venueId: currentVenue.venueId,
        venueUuid: currentVenue.venueUuid,
        name: name.trim(),
        description: description?.trim() || '',
        facilityType,
        indoorOutdoor,
        surfaceType,
        slotDurationMinutes: Number(slotDurationMinutes) || 60,
        bookingEnabled: true,
        sports: selectedSports.map((s, idx) => ({
          sportName: s,
          isPrimary: idx === 0,
        })),
        pricingRules: [
          {
            pricingType: 'STANDARD',
            startTime: '06:00:00',
            endTime: '23:00:00',
            price: Number(standardPrice) || 0,
            durationMinutes: Number(slotDurationMinutes) || 60,
            priority: 1,
            isActive: true,
          },
        ],
      };

      if (editingFacility) {
        await facilityApi.updateFacility(editingFacility.facilityUuid, payload);
      } else {
        await facilityApi.createFacility(payload);
      }

      setIsModalOpen(false);
      await Promise.all([
        loadFacilities(currentVenue.venueId),
        refreshStoreEntitlements(orgId).then((ent) => {
          if (ent) setEntitlements(ent);
        }),
      ]);
    } catch (err: any) {
      console.error('Error saving facility:', err);
      setError(err?.message || 'Failed to save facility. Please check all fields.');
    } finally {
      setSaving(false);
    }
  };

  // Helper metadata
  const getSportEmoji = (sportName?: string) => {
    const s = (sportName || '').toLowerCase();
    if (s.includes('badminton')) return '🏸';
    if (s.includes('tennis') && !s.includes('table')) return '🎾';
    if (s.includes('pickleball')) return '🏓';
    if (s.includes('table tennis') || s.includes('tt')) return '🏓';
    if (s.includes('squash')) return '🎾';
    if (s.includes('cricket')) return '🏏';
    if (s.includes('football') || s.includes('soccer')) return '⚽';
    if (s.includes('basketball')) return '🏀';
    if (s.includes('volleyball')) return '🏐';
    if (s.includes('swim')) return '🏊';
    return '🏆';
  };

  const getSurfaceLabel = (surface?: SurfaceType) => {
    switch (surface) {
      case 'SYNTHETIC':
        return 'Synthetic Mat';
      case 'WOODEN':
        return 'Wooden Floor';
      case 'ACRYLIC':
        return 'Acrylic Hardcourt';
      case 'CLAY':
        return 'Clay Court';
      case 'ARTIFICIAL_TURF':
        return 'Artificial Turf';
      case 'NATURAL_GRASS':
        return 'Natural Grass';
      case 'CONCRETE':
        return 'Concrete';
      case 'RUBBER':
        return 'Rubberized';
      default:
        return surface ? String(surface).replace(/_/g, ' ') : 'Standard Surface';
    }
  };

  // Metrics calculation
  const metrics = useMemo(() => {
    const total = facilities.length;
    const indoorCount = facilities.filter(f => f.indoorOutdoor === 'INDOOR').length;
    const outdoorCount = facilities.filter(f => f.indoorOutdoor === 'OUTDOOR').length;

    const allSportsSet = new Set<string>();
    facilities.forEach(f => {
      f.sports?.forEach(s => {
        if (s.sportName) allSportsSet.add(s.sportName);
      });
    });

    const rates: number[] = [];
    facilities.forEach(f => {
      const p = f.pricingRules?.find(rule => rule.pricingType === 'STANDARD')?.price;
      if (typeof p === 'number' && p > 0) rates.push(p);
    });

    const avgRate = rates.length > 0 ? Math.round(rates.reduce((a, b) => a + b, 0) / rates.length) : 0;
    const maxRate = rates.length > 0 ? Math.max(...rates) : 0;
    const minRate = rates.length > 0 ? Math.min(...rates) : 0;

    const bookingEnabledCount = facilities.filter(f => f.bookingEnabled).length;
    const quotaMax = entitlements?.limits?.MAX_FACILITIES ?? 5;

    return {
      total,
      indoorCount,
      outdoorCount,
      sportsCount: allSportsSet.size,
      avgRate,
      maxRate,
      minRate,
      bookingEnabledCount,
      quotaMax
    };
  }, [facilities, entitlements]);

  // Filtered facilities for desktop
  const filteredFacilities = useMemo(() => {
    return facilities.filter((fac) => {
      if (desktopTypeFilter !== 'ALL' && fac.facilityType !== desktopTypeFilter) return false;
      if (desktopEnvironmentFilter !== 'ALL' && fac.indoorOutdoor !== desktopEnvironmentFilter) return false;
      if (desktopSurfaceFilter !== 'ALL' && fac.surfaceType !== desktopSurfaceFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = fac.name?.toLowerCase().includes(q);
        const matchDesc = fac.description?.toLowerCase().includes(q);
        const matchType = fac.facilityType?.toLowerCase().includes(q);
        const matchSurface = fac.surfaceType?.toLowerCase().includes(q);
        const matchSport = fac.sports?.some(s => s.sportName.toLowerCase().includes(q));
        if (!matchName && !matchDesc && !matchType && !matchSurface && !matchSport) return false;
      }

      return true;
    });
  }, [facilities, desktopTypeFilter, desktopEnvironmentFilter, desktopSurfaceFilter, searchQuery]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">

      {/* ========================================================================= */}
      {/* 1. MOBILE VIEW (block md:hidden) - 100% UNTOUCHED ORIGINAL LAYOUT        */}
      {/* ========================================================================= */}
      <div className="block md:hidden space-y-4">
        {/* Mobile Header */}
        <div className="flex flex-col gap-4 bg-card border border-border p-5 rounded-2xl shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-primary tracking-widest uppercase">
              <Building2 className="w-4 h-4" /> Courts & Facilities
            </div>
            <h1 className="text-xl font-black tracking-tight text-foreground">
              Facility Infrastructure & Multi-Sport
            </h1>
            <p className="text-xs text-muted-foreground">
              Manage bookable units (Courts, Turfs, Pitches, Pools, Nets) and their sport mappings.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-black font-black text-sm hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20 w-full"
          >
            <Plus className="w-4 h-4" /> Add New Facility
          </button>
        </div>

        {/* Mobile Facility Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 gap-4 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 rounded-2xl bg-card border border-border" />
            ))}
          </div>
        ) : facilities.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-card border border-border space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-black text-foreground">No Facilities Configured</h3>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Start by adding your first Badminton court, Cricket pitch or Football turf.
            </p>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-black font-black text-xs hover:brightness-110"
            >
              <Plus className="w-4 h-4" /> Add Facility
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {facilities.map((fac) => {
              const standardRate = fac.pricingRules?.find(p => p.pricingType === 'STANDARD')?.price;
              return (
                <div
                  key={fac.facilityId}
                  className="p-4 rounded-2xl bg-card border border-border hover:border-primary/40 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="text-[10px] font-bold text-primary uppercase tracking-wider">
                          {fac.facilityType} • {fac.indoorOutdoor}
                        </div>
                        <h3 className="text-base font-black text-foreground">
                          {fac.name}
                        </h3>
                      </div>
                      <button
                        onClick={() => openEditModal(fac)}
                        className="p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>

                    {fac.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {fac.description}
                      </p>
                    )}

                    {/* Sport Badges */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {fac.sports?.map((s) => (
                        <span
                          key={s.id}
                          className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[10px] font-bold text-foreground/80"
                        >
                          {s.sportName}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Footer Details */}
                  <div className="pt-2.5 border-t border-border flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      <span>{fac.slotDurationMinutes} min slot</span>
                    </div>

                    <div className="font-black text-foreground">
                      {standardRate ? `₹${standardRate}/slot` : 'Custom Rates'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. DESKTOP VIEW (hidden md:block) - ATHLETIC STADIUM ASSET COMMAND CENTER */}
      {/* ========================================================================= */}
      <div className="hidden md:block space-y-5">

        {/* Desktop Header */}
        <div className="flex items-center justify-between gap-4 pb-1">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground mb-1">
              <span>Venue Infrastructure</span>
              <span>/</span>
              <span className="text-foreground">Courts & Facilities</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">
              Courts & Facilities
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage courts, turfs, pitches, sport mappings, and base slot rates.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              title="Refresh Facilities"
              className="p-2.5 rounded-xl bg-card border border-border/80 hover:bg-white/5 active:scale-95 text-muted-foreground hover:text-foreground transition-all shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-primary' : ''}`} />
            </button>

            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-black font-bold text-xs hover:brightness-110 active:scale-95 transition-all shadow-md shadow-primary/20"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              New Facility
            </button>
          </div>
        </div>

        {/* 4 Clean Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-2xl bg-card border border-border/70 hover:border-primary/40 transition-all">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-semibold">Facilities</span>
              <Building2 className="w-4 h-4 text-primary" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-foreground">{metrics.total}</span>
              <span className="text-xs text-muted-foreground font-medium">/ {metrics.quotaMax} capacity</span>
            </div>
            <div className="mt-2.5 w-full bg-white/5 rounded-full h-1 overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (metrics.total / metrics.quotaMax) * 100)}%` }}
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-card border border-border/70 hover:border-blue-500/40 transition-all">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-semibold">Sports Mapped</span>
              <Compass className="w-4 h-4 text-blue-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-blue-400">{metrics.sportsCount}</span>
              <span className="text-xs text-muted-foreground font-medium">sports</span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground font-medium">
              <span>{metrics.indoorCount} Indoor</span>
              <span>•</span>
              <span>{metrics.outdoorCount} Outdoor</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-card border border-border/70 hover:border-emerald-500/40 transition-all">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-semibold">Avg Base Tariff</span>
              <IndianRupee className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-400">₹{metrics.avgRate}</span>
              <span className="text-xs text-muted-foreground font-medium">/ slot</span>
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground font-mono">
              ₹{metrics.minRate} - ₹{metrics.maxRate} range
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-card border border-border/70 hover:border-amber-500/40 transition-all">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-semibold">Online Status</span>
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-400">{metrics.bookingEnabledCount}</span>
              <span className="text-xs text-muted-foreground font-medium">of {metrics.total} bookable</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold">
              <Check className="w-3.5 h-3.5" />
              <span>Public booking active</span>
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="p-3 rounded-2xl bg-card border border-border/80 flex flex-col lg:flex-row items-center justify-between gap-3 shadow-sm">
          {/* Left: Search Bar & Filters */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            {/* Search Input */}
            <div className="relative min-w-[220px] max-w-sm flex-1">
              <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search court, sport..."
                className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-background border border-border/80 text-xs font-medium text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Type Filter Pills */}
            <div className="flex items-center gap-1 p-1 bg-background border border-border/80 rounded-xl">
              {[
                { key: 'ALL', label: 'All' },
                { key: 'COURT', label: 'Courts' },
                { key: 'TURF', label: 'Turfs' },
                { key: 'PITCH', label: 'Pitches' },
                { key: 'PRACTICE_NET', label: 'Nets' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setDesktopTypeFilter(tab.key)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    desktopTypeFilter === tab.key
                      ? 'bg-primary text-black shadow-sm font-black'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Environment Filter */}
            <select
              value={desktopEnvironmentFilter}
              onChange={(e) => setDesktopEnvironmentFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-background border border-border/80 text-xs font-semibold text-foreground outline-none focus:border-primary cursor-pointer"
            >
              <option value="ALL">All Environments</option>
              <option value="INDOOR">Indoor</option>
              <option value="OUTDOOR">Outdoor</option>
            </select>


            {/* Surface Filter */}
            <select
              value={desktopSurfaceFilter}
              onChange={(e) => setDesktopSurfaceFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-background border border-border/80 text-xs font-bold text-foreground outline-none focus:border-primary cursor-pointer"
            >
              <option value="ALL">All Surfaces</option>
              <option value="SYNTHETIC">Synthetic Mat</option>
              <option value="WOODEN">Wooden Flooring</option>
              <option value="ACRYLIC">Acrylic Hardcourt</option>
              <option value="CLAY">Clay</option>
              <option value="ARTIFICIAL_TURF">Artificial Turf</option>
              <option value="NATURAL_GRASS">Natural Grass</option>
            </select>
          </div>

          {/* Right: Results count and View Mode Switcher */}
          <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
            <span className="text-xs font-mono text-muted-foreground">
              Showing <strong className="text-foreground">{filteredFacilities.length}</strong> of {facilities.length}
            </span>

            <div className="flex items-center p-1 bg-background border border-border/80 rounded-xl">
              <button
                onClick={() => setDesktopViewMode('grid')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  desktopViewMode === 'grid'
                    ? 'bg-white/10 text-foreground font-black'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Cards Grid"
              >
                <Layers className="w-3.5 h-3.5" /> Grid
              </button>
              <button
                onClick={() => setDesktopViewMode('table')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  desktopViewMode === 'table'
                    ? 'bg-white/10 text-foreground font-black'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Ledger Table"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" /> Ledger
              </button>
            </div>
          </div>
        </div>

        {/* Content Display: Grid vs Table */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 rounded-3xl bg-card border border-border" />
            ))}
          </div>
        ) : filteredFacilities.length === 0 ? (
          <div className="p-16 text-center rounded-3xl bg-card border border-border/80 space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto border border-primary/20">
              <Building2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-foreground">No Facilities Found</h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                {searchQuery || desktopTypeFilter !== 'ALL' || desktopEnvironmentFilter !== 'ALL' || desktopSurfaceFilter !== 'ALL'
                  ? 'No courts or facilities match the active filter criteria. Clear search or reset filters.'
                  : 'Get started by creating your first athletic court or turf unit.'}
              </p>
            </div>
            {(searchQuery || desktopTypeFilter !== 'ALL' || desktopEnvironmentFilter !== 'ALL' || desktopSurfaceFilter !== 'ALL') ? (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setDesktopTypeFilter('ALL');
                  setDesktopEnvironmentFilter('ALL');
                  setDesktopSurfaceFilter('ALL');
                }}
                className="px-4 py-2 rounded-xl bg-white/10 text-xs font-bold text-foreground hover:bg-white/20 transition-all"
              >
                Reset All Filters
              </button>
            ) : (
              <button
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-black font-black text-xs hover:brightness-110 shadow-lg shadow-primary/20"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" /> Add First Facility
              </button>
            )}
          </div>
        ) : desktopViewMode === 'grid' ? (
          /* ================= GRID VIEW ================= */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredFacilities.map((fac) => {
              const standardRate = fac.pricingRules?.find(p => p.pricingType === 'STANDARD')?.price;
              const primarySport = fac.sports?.[0]?.sportName || 'Sports';
              const emoji = getSportEmoji(primarySport);

              return (
                <div
                  key={fac.facilityId}
                  className="group relative p-5 rounded-3xl bg-card border border-border/80 hover:border-primary/50 transition-all duration-300 flex flex-col justify-between shadow-sm hover:shadow-xl space-y-4"
                >
                  <div className="space-y-3.5">
                    {/* Top Row: Type & Environment + Edit Button */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-base">{emoji}</span>
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                            {fac.facilityType}
                          </span>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                            {fac.indoorOutdoor === 'INDOOR' ? <Sun className="w-3 h-3 text-amber-400" /> : <Umbrella className="w-3 h-3 text-blue-400" />}
                            {fac.indoorOutdoor}
                          </span>
                        </div>

                        <h3 className="text-lg font-black text-foreground group-hover:text-primary transition-colors line-clamp-1 pt-0.5">
                          {fac.name}
                        </h3>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setInspectedFacility(fac)}
                          className="p-2 rounded-xl hover:bg-white/5 text-muted-foreground hover:text-foreground transition-all"
                          title="Inspect Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(fac)}
                          className="p-2 rounded-xl hover:bg-white/5 text-muted-foreground hover:text-primary transition-all"
                          title="Edit Facility"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Surface & Spec Pill */}
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-background/80 border border-border/60 text-xs font-semibold text-foreground/80 flex items-center gap-1.5">
                        <Shield className="w-3 h-3 text-primary" />
                        {getSurfaceLabel(fac.surfaceType)}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Online Bookable
                      </span>
                    </div>

                    {/* Description */}
                    {fac.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {fac.description}
                      </p>
                    )}

                    {/* Supported Sports Badges */}
                    <div className="space-y-1.5">
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        Supported Sports
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {fac.sports?.map((s) => (
                          <span
                            key={s.id}
                            className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[10px] font-bold text-foreground/80 flex items-center gap-1"
                          >
                            <span>{getSportEmoji(s.sportName)}</span>
                            <span>{s.sportName}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Timing & Pricing Bento Box */}
                  <div className="space-y-3 pt-3 border-t border-border/60">
                    <div className="grid grid-cols-2 gap-2 p-2.5 rounded-2xl bg-background/60 border border-border/60">
                      <div>
                        <div className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3 text-primary" /> Slot Duration
                        </div>
                        <div className="text-xs font-black text-foreground mt-0.5 font-mono">
                          {fac.slotDurationMinutes} minutes
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] uppercase font-bold text-muted-foreground">
                          Standard Rate
                        </div>
                        <div className="text-xs font-black text-emerald-400 mt-0.5 font-mono">
                          {standardRate ? `₹${standardRate} / slot` : 'Custom Rates'}
                        </div>
                      </div>
                    </div>

                    {/* Quick Link Shortcuts */}
                    <div className="flex items-center justify-between text-xs pt-1">
                      <Link
                        href={`/org/${orgId}/venue/calendar`}
                        className="text-[11px] font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                      >
                        <CalendarDays className="w-3.5 h-3.5" /> View in Calendar
                      </Link>

                      <Link
                        href={`/org/${orgId}/venue/pricing`}
                        className="text-[11px] font-bold text-muted-foreground hover:text-amber-400 transition-colors flex items-center gap-1"
                      >
                        <IndianRupee className="w-3.5 h-3.5" /> Configure Pricing
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ================= LEDGER TABLE VIEW ================= */
          <div className="rounded-3xl bg-card border border-border/80 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/80 bg-background/50 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                    <th className="p-4">Facility Unit</th>
                    <th className="p-4">Type & Environment</th>
                    <th className="p-4">Surface Specification</th>
                    <th className="p-4">Supported Sports</th>
                    <th className="p-4 text-center">Slot Duration</th>
                    <th className="p-4 text-right">Standard Rate</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 text-xs">
                  {filteredFacilities.map((fac) => {
                    const standardRate = fac.pricingRules?.find(p => p.pricingType === 'STANDARD')?.price;
                    const primarySport = fac.sports?.[0]?.sportName || 'Sports';
                    const emoji = getSportEmoji(primarySport);

                    return (
                      <tr key={fac.facilityId} className="hover:bg-white/[0.02] transition-colors group">
                        {/* Unit Name */}
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{emoji}</span>
                            <div>
                              <div className="font-black text-foreground group-hover:text-primary transition-colors text-sm">
                                {fac.name}
                              </div>
                              <div className="text-[10px] font-mono text-muted-foreground">
                                ID: #{fac.facilityId}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Type & Environment */}
                        <td className="p-4">
                          <div className="space-y-1">
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                              {fac.facilityType}
                            </span>
                            <div className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                              {fac.indoorOutdoor === 'INDOOR' ? <Sun className="w-3 h-3 text-amber-400" /> : <Umbrella className="w-3 h-3 text-blue-400" />}
                              <span>{fac.indoorOutdoor}</span>
                            </div>
                          </div>
                        </td>

                        {/* Surface */}
                        <td className="p-4 font-bold text-foreground/80">
                          <div className="flex items-center gap-1.5">
                            <Shield className="w-3.5 h-3.5 text-primary/70" />
                            <span>{getSurfaceLabel(fac.surfaceType)}</span>
                          </div>
                        </td>

                        {/* Sports */}
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {fac.sports?.map((s) => (
                              <span
                                key={s.id}
                                className="px-1.5 py-0.2 rounded bg-white/5 border border-white/5 text-[10px] font-semibold text-foreground/80"
                              >
                                {s.sportName}
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* Slot Duration */}
                        <td className="p-4 text-center font-mono font-bold text-foreground">
                          {fac.slotDurationMinutes} min
                        </td>

                        {/* Rate */}
                        <td className="p-4 text-right">
                          <div className="font-black font-mono text-emerald-400 text-sm">
                            {standardRate ? `₹${standardRate}` : 'Custom'}
                          </div>
                          <div className="text-[10px] text-muted-foreground">per session</div>
                        </td>

                        {/* Status */}
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Active
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setInspectedFacility(fac)}
                              title="Inspect Facility"
                              className="p-1.5 rounded-lg border border-border/80 hover:bg-white/5 text-foreground/80 hover:text-foreground"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => openEditModal(fac)}
                              title="Edit Facility"
                              className="p-1.5 rounded-lg border border-border/80 hover:bg-white/5 text-primary"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <Link
                              href={`/org/${orgId}/venue/calendar`}
                              title="Open Calendar Matrix"
                              className="p-1.5 rounded-lg border border-border/80 hover:bg-white/5 text-muted-foreground hover:text-foreground"
                            >
                              <CalendarDays className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. DESKTOP SLIDE-OVER FACILITY DETAILS DRAWER                              */}
      {/* ========================================================================= */}
      {inspectedFacility && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end animate-in fade-in">
          <div className="w-full max-w-xl bg-card border-l border-border h-full p-6 lg:p-8 flex flex-col justify-between overflow-y-auto space-y-6">
            <div className="space-y-6">
              {/* Drawer Top */}
              <div className="flex items-start justify-between border-b border-border pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                      {inspectedFacility.facilityType}
                    </span>
                    <span className="text-xs font-mono text-muted-foreground">
                      #{inspectedFacility.facilityId}
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-foreground">{inspectedFacility.name}</h2>
                  <p className="text-xs text-muted-foreground">{getSurfaceLabel(inspectedFacility.surfaceType)}</p>
                </div>

                <button
                  onClick={() => setInspectedFacility(null)}
                  className="p-2 rounded-xl hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              {/* Status and Environment Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-background border border-border space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Environment</span>
                  <div className="text-sm font-black text-foreground flex items-center gap-1.5">
                    {inspectedFacility.indoorOutdoor === 'INDOOR' ? <Sun className="w-4 h-4 text-amber-400" /> : <Umbrella className="w-4 h-4 text-blue-400" />}
                    <span>{inspectedFacility.indoorOutdoor}</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground font-mono">
                    Protected arena
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-background border border-border space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Slot Schedule Duration</span>
                  <div className="text-sm font-black text-foreground flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>{inspectedFacility.slotDurationMinutes} min</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground font-mono">
                    Per reservation booking
                  </div>
                </div>
              </div>

              {/* Supported Sports */}
              <div className="p-4 rounded-2xl bg-background border border-border space-y-2">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">Mapped Sports Disciplines</label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {inspectedFacility.sports?.map((s) => (
                    <span
                      key={s.id}
                      className="px-3 py-1.5 rounded-xl bg-card border border-border text-xs font-bold text-foreground flex items-center gap-1.5 shadow-sm"
                    >
                      <span className="text-sm">{getSportEmoji(s.sportName)}</span>
                      <span>{s.sportName}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Description */}
              {inspectedFacility.description && (
                <div className="p-4 rounded-2xl bg-background border border-border space-y-1.5">
                  <span className="text-xs font-bold text-foreground">Infrastructure Specifications</span>
                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {inspectedFacility.description}
                  </p>
                </div>
              )}

              {/* Pricing Rules Overview */}
              <div className="p-4 rounded-2xl bg-background border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <IndianRupee className="w-4 h-4 text-emerald-400" /> Configured Tariff Rules
                  </span>
                  <Link
                    href={`/org/${orgId}/venue/pricing`}
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                  >
                    Adjust in Pricing Engine <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                {inspectedFacility.pricingRules && inspectedFacility.pricingRules.length > 0 ? (
                  <div className="divide-y divide-border/60 rounded-xl border border-border/80 overflow-hidden">
                    {inspectedFacility.pricingRules.map((rule, idx) => (
                      <div key={idx} className="p-2.5 text-xs flex items-center justify-between">
                        <div>
                          <div className="font-bold text-foreground">{rule.pricingType}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">
                            {rule.startTime} - {rule.endTime}
                          </div>
                        </div>
                        <div className="font-black text-emerald-400 font-mono text-sm">
                          ₹{rule.price}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground">Standard pricing not set.</div>
                )}
              </div>
            </div>

            {/* Drawer Bottom Actions */}
            <div className="pt-4 border-t border-border flex items-center justify-between gap-3">
              <Link
                href={`/org/${orgId}/venue/calendar`}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-foreground transition-all flex items-center gap-1.5"
              >
                <CalendarDays className="w-3.5 h-3.5 text-primary" /> Matrix Calendar
              </Link>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const target = inspectedFacility;
                    setInspectedFacility(null);
                    openEditModal(target);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-primary text-black font-black text-xs hover:brightness-110 transition-all"
                >
                  Edit Configuration
                </button>
                <button
                  onClick={() => setInspectedFacility(null)}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-foreground transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MODALS (Add / Edit Facility + Paywall)                                  */}
      {/* ========================================================================= */}

      {/* Add / Edit Facility Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-xl rounded-3xl p-6 lg:p-7 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="text-lg font-black text-foreground">
                  {editingFacility ? 'Edit Facility Unit' : 'Add New Facility Unit'}
                </h3>
                <p className="text-xs text-muted-foreground">Configure court dimensions, surface materials, and supported sports</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSaveFacility} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Facility / Court Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Court 1 - Wooden Floor"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-sm font-medium text-foreground outline-none focus:border-primary transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Facility Type</label>
                  <select
                    value={facilityType}
                    onChange={(e) => setFacilityType(e.target.value as FacilityType)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs font-bold text-foreground outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="COURT">Court</option>
                    <option value="TURF">Turf</option>
                    <option value="FIELD">Field / Ground</option>
                    <option value="PITCH">Pitch</option>
                    <option value="PRACTICE_NET">Practice Net</option>
                    <option value="POOL">Swimming Pool</option>
                    <option value="TABLE">Table (TT/Pool)</option>
                    <option value="HALL">Indoor Hall</option>
                    <option value="MULTI_PURPOSE">Multi-Purpose</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Indoor / Outdoor</label>
                  <select
                    value={indoorOutdoor}
                    onChange={(e) => setIndoorOutdoor(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs font-bold text-foreground outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="INDOOR">Indoor</option>
                    <option value="OUTDOOR">Outdoor</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Surface Type</label>
                  <select
                    value={surfaceType}
                    onChange={(e) => setSurfaceType(e.target.value as SurfaceType)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs font-bold text-foreground outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="SYNTHETIC">Synthetic Mat</option>
                    <option value="WOODEN">Wooden Flooring</option>
                    <option value="ACRYLIC">Acrylic Hardcourt</option>
                    <option value="CLAY">Clay</option>
                    <option value="ARTIFICIAL_TURF">Artificial Turf</option>
                    <option value="NATURAL_GRASS">Natural Grass</option>
                    <option value="CONCRETE">Concrete</option>
                    <option value="RUBBER">Rubberized</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Slot Duration (Min)</label>
                  <select
                    value={slotDurationMinutes}
                    onChange={(e) => setSlotDurationMinutes(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs font-bold text-foreground outline-none focus:border-primary cursor-pointer"
                  >
                    <option value={30}>30 Minutes</option>
                    <option value={60}>60 Minutes (Standard)</option>
                    <option value={90}>90 Minutes</option>
                    <option value={120}>120 Minutes (2 Hours)</option>
                  </select>
                </div>
              </div>

              {/* Supported Sports */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-foreground">Supported Sports</label>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {selectedSports.length} selected
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableSports.map((sport) => {
                    const active = selectedSports.includes(sport);
                    return (
                      <button
                        key={sport}
                        type="button"
                        onClick={() => toggleSport(sport)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                          active
                            ? 'border-primary bg-primary/10 text-primary shadow-sm'
                            : 'border-border bg-background text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <span>{getSportEmoji(sport)}</span>
                        <span>{sport}</span>
                        {active && <Check className="w-3 h-3 text-primary" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Standard Base Price */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Standard Base Price (₹ / Slot)</label>
                <div className="relative">
                  <IndianRupee className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    required
                    min={0}
                    value={standardPrice}
                    onChange={(e) => setStandardPrice(Number(e.target.value))}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-background border border-border text-sm font-black text-emerald-400 font-mono outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Specifications & Notes (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. 8-LED anti-glare floodlights, BWF approved court dimensions, changing rooms nearby..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs font-medium text-foreground outline-none focus:border-primary resize-none transition-colors"
                />
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border font-bold text-xs text-foreground hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-black font-black text-xs hover:brightness-110 disabled:opacity-50 transition-all shadow-lg shadow-primary/20"
                >
                  {saving ? 'Saving...' : editingFacility ? 'Update Facility' : 'Create Facility'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quota Paywall Modal */}
      <FeaturePaywallModal
        isOpen={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
        orgId={orgId}
        featureName="Facility Quota Limit"
        currentPlan={entitlements?.planName || 'Current Plan'}
        requiredPlan="Professional"
        isQuotaLimit={true}
        limitInfo={{
          label: 'Facilities / Courts',
          current: entitlements?.usage?.FACILITIES_USED ?? facilities.length,
          max: entitlements?.limits?.MAX_FACILITIES ?? 1,
        }}
      />
    </div>
  );
}
