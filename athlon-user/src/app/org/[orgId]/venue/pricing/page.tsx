'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Tag,
  Plus,
  Clock,
  IndianRupee,
  Building2,
  CheckCircle2,
  Sparkles,
  Layers,
  ChevronRight,
  Filter,
  XCircle,
  AlertCircle,
  RefreshCw,
  CalendarDays,
  SlidersHorizontal,
  Trash2,
  ArrowUpRight,
  TrendingUp,
  Sun,
  Moon,
  Calendar,
  Zap,
  Shield,
  Eye,
  Search
} from 'lucide-react';
import {
  venueApi,
  facilityApi,
  VenueDto,
  FacilityDto,
  FacilityPricingRule,
  PricingType
} from '@/lib/api/venue';
import { useVenueEntitlementsStore } from '@/store/useVenueEntitlementsStore';

export default function VenuePricingPage() {
  const params = useParams();
  const orgId = params?.orgId as string;

  const { loadEntitlements, hasFeature, openFeaturePaywall } = useVenueEntitlementsStore();

  const [venue, setVenue] = useState<VenueDto | null>(null);
  const [facilities, setFacilities] = useState<FacilityDto[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<FacilityDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Desktop search & filter
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [desktopViewMode, setDesktopViewMode] = useState<'cards' | 'table'>('cards');
  const [deletingRuleIdx, setDeletingRuleIdx] = useState<number | null>(null);

  // Add Rule Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pricingType, setPricingType] = useState<PricingType>('PEAK');
  const [dayOfWeek, setDayOfWeek] = useState<string>('');
  const [startTime, setStartTime] = useState('18:00');
  const [endTime, setEndTime] = useState('22:00');
  const [price, setPrice] = useState<number>(750);
  const [priority, setPriority] = useState<number>(5);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const orgVenues = await venueApi.getVenuesByOrganization(orgId);
        if (orgVenues.success && orgVenues.data && orgVenues.data.length > 0) {
          const v = orgVenues.data[0];
          setVenue(v);
          const facRes = await facilityApi.getFacilitiesByVenue(v.venueId);
          if (facRes.success && facRes.data) {
            setFacilities(facRes.data);
            if (facRes.data.length > 0) {
              setSelectedFacility(facRes.data[0]);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load pricing:', err);
      } finally {
        setLoading(false);
      }
    }
    if (orgId) {
      loadData();
      loadEntitlements(orgId);
    }
  }, [orgId, loadEntitlements]);

  const handleOpenAddPricingModal = () => {
    if (!hasFeature(orgId, 'VENUE_DYNAMIC_PRICING')) {
      openFeaturePaywall(
        orgId,
        'VENUE_DYNAMIC_PRICING',
        'Dynamic Peak & Weekend Slot Pricing',
        'Configure time-of-day peak surges, weekend multipliers, and off-peak discounts to maximize court revenue.'
      );
      return;
    }
    setPricingType('PEAK');
    setStartTime('18:00');
    setEndTime('22:00');
    setPrice(750);
    setPriority(5);
    setIsModalOpen(true);
  };

  const handleRefresh = async () => {
    if (!venue) return;
    setRefreshing(true);
    try {
      const facRes = await facilityApi.getFacilitiesByVenue(venue.venueId);
      if (facRes.success && facRes.data) {
        setFacilities(facRes.data);
        if (selectedFacility) {
          const current = facRes.data.find((f) => f.facilityId === selectedFacility.facilityId);
          if (current) setSelectedFacility(current);
        }
      }
    } finally {
      setRefreshing(false);
    }
  };

  const handleAddPricingRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFacility || !venue) return;

    try {
      setSaving(true);
      const updatedRules = [
        ...(selectedFacility.pricingRules || []),
        {
          pricingType,
          dayOfWeek: dayOfWeek || undefined,
          startTime: `${startTime}:00`,
          endTime: `${endTime}:00`,
          price: Number(price),
          durationMinutes: selectedFacility.slotDurationMinutes || 60,
          priority: Number(priority),
          isActive: true,
        },
      ];

      const res = await facilityApi.updateFacility(selectedFacility.facilityUuid, {
        venueId: venue.venueId,
        name: selectedFacility.name,
        facilityType: selectedFacility.facilityType,
        indoorOutdoor: selectedFacility.indoorOutdoor,
        surfaceType: selectedFacility.surfaceType,
        slotDurationMinutes: selectedFacility.slotDurationMinutes,
        bookingEnabled: true,
        sports: selectedFacility.sports,
        pricingRules: updatedRules,
      });

      if (res.success) {
        setIsModalOpen(false);
        const facRes = await facilityApi.getFacilitiesByVenue(venue.venueId);
        if (facRes.success) {
          setFacilities(facRes.data);
          const current = facRes.data.find((f) => f.facilityId === selectedFacility.facilityId);
          if (current) setSelectedFacility(current);
        }
      }
    } catch (err) {
      console.error('Error adding pricing rule:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePricingRule = async (ruleIndex: number) => {
    if (!selectedFacility || !venue) return;
    try {
      setDeletingRuleIdx(ruleIndex);
      const updatedRules = (selectedFacility.pricingRules || []).filter((_, i) => i !== ruleIndex);
      const res = await facilityApi.updateFacility(selectedFacility.facilityUuid, {
        venueId: venue.venueId,
        name: selectedFacility.name,
        facilityType: selectedFacility.facilityType,
        indoorOutdoor: selectedFacility.indoorOutdoor,
        surfaceType: selectedFacility.surfaceType,
        slotDurationMinutes: selectedFacility.slotDurationMinutes,
        bookingEnabled: true,
        sports: selectedFacility.sports,
        pricingRules: updatedRules,
      });

      if (res.success) {
        const facRes = await facilityApi.getFacilitiesByVenue(venue.venueId);
        if (facRes.success) {
          setFacilities(facRes.data);
          const current = facRes.data.find((f) => f.facilityId === selectedFacility.facilityId);
          if (current) setSelectedFacility(current);
        }
      }
    } catch (err) {
      console.error('Error deleting pricing rule:', err);
    } finally {
      setDeletingRuleIdx(null);
    }
  };

  // Helper presets for modal
  const applyPreset = (preset: 'PRIME_EVENING' | 'WEEKEND_PRIME' | 'AFTERNOON_OFFPEAK' | 'MORNING_PEAK') => {
    if (preset === 'PRIME_EVENING') {
      setPricingType('PEAK');
      setStartTime('18:00');
      setEndTime('22:00');
      setDayOfWeek('');
      setPrice(750);
      setPriority(5);
    } else if (preset === 'WEEKEND_PRIME') {
      setPricingType('WEEKEND');
      setStartTime('07:00');
      setEndTime('22:00');
      setDayOfWeek('SATURDAY');
      setPrice(850);
      setPriority(6);
    } else if (preset === 'AFTERNOON_OFFPEAK') {
      setPricingType('OFF_PEAK');
      setStartTime('11:00');
      setEndTime('16:00');
      setDayOfWeek('');
      setPrice(400);
      setPriority(3);
    } else if (preset === 'MORNING_PEAK') {
      setPricingType('PEAK');
      setStartTime('06:00');
      setEndTime('09:00');
      setDayOfWeek('');
      setPrice(700);
      setPriority(4);
    }
  };

  // Metrics calculation
  const pricingMetrics = useMemo(() => {
    if (!selectedFacility) {
      return {
        rulesCount: 0,
        standardRate: 0,
        peakRate: 0,
        peakSpread: 0,
        offPeakRate: 0,
        offPeakDiscount: 0,
        highestPriority: 1,
      };
    }

    const rules = selectedFacility.pricingRules || [];
    const rulesCount = rules.length;
    const standardRule = rules.find((r) => r.pricingType === 'STANDARD');
    const standardRate = standardRule?.price || 0;

    const peakRules = rules.filter((r) => r.pricingType === 'PEAK');
    const peakRate = peakRules.length > 0 ? Math.max(...peakRules.map((r) => r.price)) : standardRate;
    const peakSpread = peakRate > standardRate ? peakRate - standardRate : 0;

    const offPeakRules = rules.filter((r) => r.pricingType === 'OFF_PEAK');
    const offPeakRate = offPeakRules.length > 0 ? Math.min(...offPeakRules.map((r) => r.price)) : standardRate;
    const offPeakDiscount = standardRate > offPeakRate ? standardRate - offPeakRate : 0;

    const highestPriority = rules.length > 0 ? Math.max(...rules.map((r) => r.priority || 1)) : 1;

    return {
      rulesCount,
      standardRate,
      peakRate,
      peakSpread,
      offPeakRate,
      offPeakDiscount,
      highestPriority,
    };
  }, [selectedFacility]);

  // Hourly timeline blocks calculation (06:00 - 23:00)
  const timelineHours = useMemo(() => {
    if (!selectedFacility) return [];
    const rules = [...(selectedFacility.pricingRules || [])].sort((a, b) => (b.priority || 1) - (a.priority || 1));
    const hours: { hour: string; label: string; price: number; type: PricingType }[] = [];

    for (let h = 6; h <= 22; h++) {
      const timeStr = `${h.toString().padStart(2, '0')}:00:00`;
      const timeDisplay = `${h.toString().padStart(2, '0')}:00`;

      // Find highest priority matching rule
      let matchedRule: FacilityPricingRule | undefined = undefined;
      for (const r of rules) {
        if (r.startTime <= timeStr && r.endTime > timeStr) {
          matchedRule = r;
          break;
        }
      }

      const standardRule = rules.find((r) => r.pricingType === 'STANDARD');
      const finalPrice = matchedRule?.price ?? standardRule?.price ?? 500;
      const finalType = matchedRule?.pricingType ?? standardRule?.pricingType ?? 'STANDARD';

      hours.push({
        hour: timeStr,
        label: timeDisplay,
        price: finalPrice,
        type: finalType,
      });
    }

    return hours;
  }, [selectedFacility]);

  // Filtered rules for display
  const filteredRules = useMemo(() => {
    if (!selectedFacility) return [];
    let list = [...(selectedFacility.pricingRules || [])];

    if (typeFilter !== 'ALL') {
      list = list.filter((r) => r.pricingType === typeFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((r) => {
        return (
          r.pricingType.toLowerCase().includes(q) ||
          r.dayOfWeek?.toLowerCase().includes(q) ||
          r.startTime?.toLowerCase().includes(q) ||
          r.endTime?.toLowerCase().includes(q) ||
          r.price.toString().includes(q)
        );
      });
    }

    return list;
  }, [selectedFacility, typeFilter, searchQuery]);

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
              <Tag className="w-4 h-4" /> Dynamic Pricing
            </div>
            <h1 className="text-xl font-black tracking-tight text-foreground">
              Slot Rate Rules & Tiers
            </h1>
            <p className="text-xs text-muted-foreground">
              Configure Standard, Peak hours, Weekend rates, and Off-Peak discounts per facility.
            </p>
          </div>

          <button
            onClick={handleOpenAddPricingModal}
            disabled={!selectedFacility}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-black font-black text-sm hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 w-full"
          >
            <Plus className="w-4 h-4" /> Add Rate Rule
          </button>
        </div>

        {/* Mobile Facility Tab Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-border">
          {facilities.map((fac) => (
            <button
              key={fac.facilityId}
              onClick={() => setSelectedFacility(fac)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all whitespace-nowrap flex items-center gap-1.5 ${
                selectedFacility?.facilityId === fac.facilityId
                  ? 'border-primary bg-primary/10 text-primary shadow-sm'
                  : 'border-border bg-card text-muted-foreground hover:text-foreground'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>{fac.name}</span>
            </button>
          ))}
        </div>

        {/* Mobile Pricing Rules List */}
        {loading ? (
          <div className="h-48 rounded-2xl bg-card border border-border animate-pulse" />
        ) : !selectedFacility ? (
          <div className="p-8 text-center rounded-2xl bg-card border border-border text-xs text-muted-foreground">
            No facilities available.
          </div>
        ) : (
          <div className="space-y-3">
            <h3 className="text-xs font-black text-foreground flex items-center gap-1.5">
              <span>{selectedFacility.name} Rules</span>
              <span className="text-[10px] text-muted-foreground font-normal">
                (Evaluated by priority)
              </span>
            </h3>

            <div className="grid grid-cols-1 gap-3">
              {selectedFacility.pricingRules?.map((rule, idx) => {
                let badgeColor = 'bg-primary/10 text-primary border-primary/30';
                if (rule.pricingType === 'PEAK') badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
                if (rule.pricingType === 'WEEKEND') badgeColor = 'bg-purple-500/10 text-purple-400 border-purple-500/30';
                if (rule.pricingType === 'OFF_PEAK') badgeColor = 'bg-blue-500/10 text-blue-400 border-blue-500/30';

                return (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-card border border-border space-y-2 relative overflow-hidden shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded-full border text-[10px] font-black uppercase ${badgeColor}`}>
                        {rule.pricingType}
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        Priority #{rule.priority || 1}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-black text-foreground">₹{rule.price}</span>
                      <span className="text-xs text-muted-foreground">/{rule.durationMinutes || 60}m</span>
                    </div>

                    <div className="text-xs space-y-0.5 text-muted-foreground pt-1 border-t border-border">
                      <div className="flex items-center justify-between">
                        <span>Time:</span>
                        <span className="font-bold text-foreground">
                          {rule.startTime?.slice(0, 5)} - {rule.endTime?.slice(0, 5)}
                        </span>
                      </div>
                      {rule.dayOfWeek && (
                        <div className="flex items-center justify-between">
                          <span>Day:</span>
                          <span className="font-bold text-primary">{rule.dayOfWeek}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. DESKTOP VIEW (hidden md:block) - ATHLETIC YIELD COMMAND CENTER         */}
      {/* ========================================================================= */}
      <div className="hidden md:block space-y-5">

        {/* Desktop Header */}
        <div className="flex items-center justify-between gap-4 pb-1">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground mb-1">
              <span>Venue Monetization</span>
              <span>/</span>
              <span className="text-foreground">Pricing Rules</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">
              Dynamic Pricing Rules
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Configure peak surges, weekend rates, and off-peak tariffs per facility.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              title="Refresh Pricing"
              className="p-2.5 rounded-xl bg-card border border-border/80 hover:bg-white/5 active:scale-95 text-muted-foreground hover:text-foreground transition-all shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-primary' : ''}`} />
            </button>

            <button
              onClick={handleOpenAddPricingModal}
              disabled={!selectedFacility}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-black font-bold text-xs hover:brightness-110 active:scale-95 transition-all shadow-md shadow-primary/20 disabled:opacity-50"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              Add Rule
            </button>
          </div>
        </div>

        {/* Facility Court Strip Selector */}
        <div className="p-3.5 rounded-2xl bg-card border border-border/80 space-y-2.5 shadow-sm">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-muted-foreground flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-primary" /> Select Facility:
            </span>
            <span className="font-mono text-muted-foreground">
              {facilities.length} available
            </span>
          </div>

          <div className="flex items-center gap-2.5 overflow-x-auto pb-0.5">
            {facilities.map((fac) => {
              const isSelected = selectedFacility?.facilityId === fac.facilityId;
              const ruleCount = fac.pricingRules?.length || 0;
              const standardRate = fac.pricingRules?.find((p) => p.pricingType === 'STANDARD')?.price;

              return (
                <button
                  key={fac.facilityId}
                  onClick={() => setSelectedFacility(fac)}
                  className={`px-3.5 py-2.5 rounded-xl border text-left transition-all min-w-[170px] flex items-center justify-between gap-3 shrink-0 ${
                    isSelected
                      ? 'border-primary bg-primary/10 shadow-sm ring-1 ring-primary/40'
                      : 'border-border/80 bg-background hover:bg-white/[0.03] text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <div className="truncate">
                    <div className="text-xs font-bold text-foreground truncate">
                      {fac.name}
                    </div>
                    <div className="text-[10px] text-muted-foreground uppercase">
                      {fac.facilityType}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono text-xs font-bold text-foreground">
                      {standardRate ? `₹${standardRate}` : '₹500'}
                    </div>
                    <div className="text-[10px] text-primary font-semibold">
                      {ruleCount} rule{ruleCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4 Clean Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-2xl bg-card border border-border/70 hover:border-primary/40 transition-all">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-semibold">Rate Rules</span>
              <Tag className="w-4 h-4 text-primary" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-foreground">{pricingMetrics.rulesCount}</span>
              <span className="text-xs text-muted-foreground font-medium">configured</span>
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground font-medium">
              Max priority #{pricingMetrics.highestPriority}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-card border border-border/70 hover:border-amber-500/40 transition-all">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-semibold">Peak Rate</span>
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-400">₹{pricingMetrics.peakRate}</span>
              <span className="text-xs text-muted-foreground font-medium">/ slot</span>
            </div>
            <div className="mt-2 text-[11px] text-amber-400 font-semibold">
              +₹{pricingMetrics.peakSpread} over base
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-card border border-border/70 hover:border-emerald-500/40 transition-all">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-semibold">Standard Base</span>
              <IndianRupee className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-400">₹{pricingMetrics.standardRate}</span>
              <span className="text-xs text-muted-foreground font-medium">/ {selectedFacility?.slotDurationMinutes || 60}m</span>
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground font-medium">
              Default baseline tariff
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-card border border-border/70 hover:border-blue-500/40 transition-all">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-semibold">Off-Peak Rate</span>
              <Sun className="w-4 h-4 text-blue-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-blue-400">₹{pricingMetrics.offPeakRate}</span>
              <span className="text-xs text-muted-foreground font-medium">/ slot</span>
            </div>
            <div className="mt-2 text-[11px] text-blue-400 font-semibold">
              {pricingMetrics.offPeakDiscount > 0 ? `-₹${pricingMetrics.offPeakDiscount} discount` : 'Base rate'}
            </div>
          </div>
        </div>

        {/* Visual 24-Hour Daily Tariff Timeline Heatmap */}
        <div className="p-5 rounded-3xl bg-card border border-border/80 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" /> Daily Schedule Tariff Heatmap (06:00 - 23:00)
              </span>
              <p className="text-[11px] text-muted-foreground">
                Hover over an hour block to inspect the calculated tariff rate for {selectedFacility?.name}.
              </p>
            </div>

            <div className="flex items-center gap-2 text-[10px] font-bold">
              <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Peak Hours
              </span>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> Off-Peak
              </span>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 text-foreground/70 border border-border">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" /> Standard
              </span>
            </div>
          </div>

          <div className="grid grid-cols-17 gap-1 overflow-x-auto py-2">
            {timelineHours.map((slot, i) => {
              const isPeak = slot.type === 'PEAK';
              const isOffPeak = slot.type === 'OFF_PEAK';
              const isWeekend = slot.type === 'WEEKEND';

              return (
                <div
                  key={i}
                  className={`p-2 rounded-xl text-center border transition-all hover:scale-105 cursor-default ${
                    isPeak
                      ? 'bg-amber-500/15 border-amber-500/30 text-amber-400 shadow-sm'
                      : isOffPeak
                      ? 'bg-blue-500/15 border-blue-500/30 text-blue-400'
                      : isWeekend
                      ? 'bg-purple-500/15 border-purple-500/30 text-purple-400'
                      : 'bg-background border-border/80 text-foreground/80'
                  }`}
                  title={`${slot.label}: ₹${slot.price} (${slot.type})`}
                >
                  <div className="text-[10px] font-mono font-bold">{slot.label}</div>
                  <div className="text-xs font-black mt-1 font-mono">₹{slot.price}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="p-3 rounded-2xl bg-card border border-border/80 flex flex-col lg:flex-row items-center justify-between gap-3 shadow-sm">
          {/* Left: Search & Filter Pills */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            {/* Search Input */}
            <div className="relative min-w-[200px] max-w-sm flex-1">
              <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search rule, time, price..."
                className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-background border border-border/80 text-xs font-medium text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary transition-colors"
              />
              {searchQuery && (
                <button
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
                { key: 'PEAK', label: 'Peak' },
                { key: 'WEEKEND', label: 'Weekend' },
                { key: 'OFF_PEAK', label: 'Off-Peak' },
                { key: 'STANDARD', label: 'Standard' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setTypeFilter(tab.key)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    typeFilter === tab.key
                      ? 'bg-primary text-black shadow-sm font-black'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Results count and View Mode Switcher */}
          <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
            <span className="text-xs font-mono text-muted-foreground">
              Showing <strong className="text-foreground">{filteredRules.length}</strong> rules
            </span>

            <div className="flex items-center p-0.5 bg-background border border-border/80 rounded-xl">
              <button
                onClick={() => setDesktopViewMode('cards')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  desktopViewMode === 'cards'
                    ? 'bg-white/10 text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Cards Grid"
              >
                <Layers className="w-3.5 h-3.5" /> Grid
              </button>
              <button
                onClick={() => setDesktopViewMode('table')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  desktopViewMode === 'table'
                    ? 'bg-white/10 text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Priority Ledger Table"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" /> Table
              </button>
            </div>
          </div>
        </div>

        {/* Content Display: Cards vs Table */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-52 rounded-3xl bg-card border border-border" />
            ))}
          </div>
        ) : filteredRules.length === 0 ? (
          <div className="p-16 text-center rounded-3xl bg-card border border-border/80 space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto border border-primary/20">
              <Tag className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-foreground">No Pricing Rules Found</h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                {searchQuery || typeFilter !== 'ALL'
                  ? 'No rules match the current filter criteria.'
                  : `Add peak or off-peak rate multipliers for ${selectedFacility?.name}.`}
              </p>
            </div>
            <button
              onClick={() => {
                setPricingType('PEAK');
                setStartTime('18:00');
                setEndTime('22:00');
                setPrice(750);
                setPriority(5);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-black font-black text-xs hover:brightness-110 shadow-lg shadow-primary/20"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" /> Add Rate Rule
            </button>
          </div>
        ) : desktopViewMode === 'cards' ? (
          /* ================= CARDS GRID VIEW ================= */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredRules.map((rule, idx) => {
              let badgeColor = 'bg-primary/10 text-primary border-primary/30';
              let accentGlow = 'hover:border-primary/50';
              if (rule.pricingType === 'PEAK') {
                badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
                accentGlow = 'hover:border-amber-500/50';
              } else if (rule.pricingType === 'WEEKEND') {
                badgeColor = 'bg-purple-500/10 text-purple-400 border-purple-500/30';
                accentGlow = 'hover:border-purple-500/50';
              } else if (rule.pricingType === 'OFF_PEAK') {
                badgeColor = 'bg-blue-500/10 text-blue-400 border-blue-500/30';
                accentGlow = 'hover:border-blue-500/50';
              }

              const standardRule = selectedFacility?.pricingRules?.find((r) => r.pricingType === 'STANDARD');
              const standardRate = standardRule?.price || rule.price;
              const delta = rule.price - standardRate;

              return (
                <div
                  key={idx}
                  className={`group relative p-6 rounded-3xl bg-card border border-border/80 transition-all duration-300 flex flex-col justify-between shadow-sm hover:shadow-xl space-y-4 ${accentGlow}`}
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <span className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${badgeColor}`}>
                        {rule.pricingType} TIER
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 text-muted-foreground font-bold">
                          Priority #{rule.priority || 1}
                        </span>
                        <button
                          onClick={() => handleDeletePricingRule(idx)}
                          disabled={deletingRuleIdx === idx}
                          title="Delete Rule"
                          className="p-1 rounded-md text-muted-foreground/40 hover:text-red-400 hover:bg-red-500/10 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Price Rate */}
                    <div className="flex items-baseline justify-between pt-1">
                      <div>
                        <div className="text-3xl font-black text-foreground font-mono">
                          ₹{rule.price}
                        </div>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground">
                          per {rule.durationMinutes || selectedFacility?.slotDurationMinutes || 60} min slot
                        </span>
                      </div>

                      {delta !== 0 && (
                        <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                          delta > 0 ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400'
                        }`}>
                          {delta > 0 ? `+₹${delta} surge` : `-₹${Math.abs(delta)} disc`}
                        </span>
                      )}
                    </div>

                    {/* Time Window & Day Details */}
                    <div className="p-3 rounded-2xl bg-background/60 border border-border/60 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-primary" /> Active Hours
                        </span>
                        <span className="font-mono font-bold text-foreground">
                          {rule.startTime?.slice(0, 5)} - {rule.endTime?.slice(0, 5)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-border/50">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-primary" /> Applicable Day
                        </span>
                        <span className="font-bold text-primary">
                          {rule.dayOfWeek || 'All Applicable Days'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer status */}
                  <div className="pt-3 border-t border-border/60 flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Active in booking engine
                    </span>
                    <span className="text-foreground/40 font-mono text-[10px]">
                      Rule #{idx + 1}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ================= PRIORITY LEDGER TABLE VIEW ================= */
          <div className="rounded-3xl bg-card border border-border/80 overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/80 bg-background/50 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                  <th className="p-4">Priority Rank</th>
                  <th className="p-4">Tier Type</th>
                  <th className="p-4">Time Interval</th>
                  <th className="p-4">Applicable Day</th>
                  <th className="p-4 text-center">Duration</th>
                  <th className="p-4 text-right">Tariff Rate</th>
                  <th className="p-4 text-right">Standard Delta</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 text-xs">
                {filteredRules.map((rule, idx) => {
                  const standardRule = selectedFacility?.pricingRules?.find((r) => r.pricingType === 'STANDARD');
                  const standardRate = standardRule?.price || rule.price;
                  const delta = rule.price - standardRate;

                  return (
                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="p-4 font-mono font-bold text-primary">
                        #{rule.priority || 1}
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                          {rule.pricingType}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-bold text-foreground">
                        {rule.startTime?.slice(0, 5)} - {rule.endTime?.slice(0, 5)}
                      </td>
                      <td className="p-4 text-foreground/80">
                        {rule.dayOfWeek || 'All Days'}
                      </td>
                      <td className="p-4 text-center font-mono text-muted-foreground">
                        {rule.durationMinutes || selectedFacility?.slotDurationMinutes || 60}m
                      </td>
                      <td className="p-4 text-right font-black font-mono text-emerald-400 text-sm">
                        ₹{rule.price}
                      </td>
                      <td className="p-4 text-right font-mono text-[11px]">
                        {delta > 0 ? (
                          <span className="text-amber-400 font-bold">+₹{delta}</span>
                        ) : delta < 0 ? (
                          <span className="text-blue-400 font-bold">-₹{Math.abs(delta)}</span>
                        ) : (
                          <span className="text-muted-foreground font-normal">Base</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDeletePricingRule(idx)}
                          disabled={deletingRuleIdx === idx}
                          className="p-1.5 rounded-lg border border-border/80 hover:bg-red-500/10 hover:text-red-400 text-muted-foreground transition-all"
                          title="Delete Rule"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. ADD PRICING RULE MODAL                                                 */}
      {/* ========================================================================= */}
      {isModalOpen && selectedFacility && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-card border border-border w-full max-w-lg rounded-3xl p-6 lg:p-7 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-lg font-black text-foreground">Add Slot Rate Rule</h3>
                <p className="text-xs text-muted-foreground">Configuring tariffs for {selectedFacility.name}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Presets */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Quick Presets</label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => applyPreset('PRIME_EVENING')}
                  className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-amber-400 border border-amber-500/20 transition-all"
                >
                  ⚡ Prime Evening (18:00 - 22:00)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('WEEKEND_PRIME')}
                  className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-purple-400 border border-purple-500/20 transition-all"
                >
                  🌟 Weekend Surge (Saturday)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('AFTERNOON_OFFPEAK')}
                  className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-blue-400 border border-blue-500/20 transition-all"
                >
                  ☀️ Afternoon Discount (11:00 - 16:00)
                </button>
              </div>
            </div>

            <form onSubmit={handleAddPricingRule} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Tier Type</label>
                <select
                  value={pricingType}
                  onChange={(e) => {
                    const t = e.target.value as PricingType;
                    setPricingType(t);
                    if (t === 'PEAK') setPriority(5);
                    if (t === 'WEEKEND') setPriority(4);
                    if (t === 'OFF_PEAK') setPriority(3);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs font-bold text-foreground outline-none focus:border-primary cursor-pointer"
                >
                  <option value="PEAK">Peak Hours (Evening/Prime Multiplier)</option>
                  <option value="WEEKEND">Weekend Rate (Sat/Sun Premium)</option>
                  <option value="OFF_PEAK">Off-Peak (Afternoon Discount)</option>
                  <option value="STANDARD">Standard Rate (Baseline)</option>
                  <option value="CUSTOM">Custom Override</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Start Time</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs font-bold text-foreground outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">End Time</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs font-bold text-foreground outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Price Rate (₹ / Slot)</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs font-black font-mono text-emerald-400 outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Specific Day (Optional)</label>
                  <select
                    value={dayOfWeek}
                    onChange={(e) => setDayOfWeek(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs font-bold text-foreground outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="">All Applicable Days</option>
                    <option value="SATURDAY">Saturday Only</option>
                    <option value="SUNDAY">Sunday Only</option>
                    <option value="MONDAY">Monday Only</option>
                    <option value="FRIDAY">Friday Only</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Rule Priority (Higher overrides lower)</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={priority}
                  onChange={(e) => setPriority(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-xs font-bold text-foreground outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border font-bold text-xs text-foreground hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-black font-black text-xs hover:brightness-110 disabled:opacity-50 transition-all shadow-lg shadow-primary/20"
                >
                  {saving ? 'Saving...' : 'Add Pricing Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
