'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Shield,
  Plus,
  Clock,
  Wrench,
  Trash2,
  Building2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Filter,
  RefreshCw,
  CalendarDays,
  SlidersHorizontal,
  Eye,
  Lock,
  Unlock,
  Zap,
  Sparkles,
  ArrowRight,
  Ban,
  Search
} from 'lucide-react';
import {
  venueApi,
  facilityApi,
  VenueDto,
  FacilityDto,
  FacilityBlockDto,
  FacilityMaintenanceDto,
  BlockType
} from '@/lib/api/venue';

export default function VenueBlocksPage() {
  const params = useParams();
  const orgId = params?.orgId as string;

  const [venue, setVenue] = useState<VenueDto | null>(null);
  const [facilities, setFacilities] = useState<FacilityDto[]>([]);
  const [blocks, setBlocks] = useState<FacilityBlockDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Desktop search & filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [desktopTypeFilter, setDesktopTypeFilter] = useState<string>('ALL');
  const [desktopFacilityFilter, setDesktopFacilityFilter] = useState<string>('ALL');
  const [desktopDateFilter, setDesktopDateFilter] = useState<string>('ALL');
  const [desktopViewMode, setDesktopViewMode] = useState<'cards' | 'table'>('cards');
  const [inspectedBlock, setInspectedBlock] = useState<FacilityBlockDto | null>(null);

  // Add Block Modal
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [facilityId, setFacilityId] = useState<number>(0);
  const [blockType, setBlockType] = useState<BlockType>('OWNER_BLOCK');
  const [blockDate, setBlockDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('13:00');
  const [reason, setReason] = useState('Private Tournament / Match');
  const [notes, setNotes] = useState('');
  const [savingBlock, setSavingBlock] = useState(false);

  // Maintenance Modal
  const [isMaintModalOpen, setIsMaintModalOpen] = useState(false);
  const [maintType, setMaintType] = useState('ROUTINE');
  const [maintStart, setMaintStart] = useState(new Date().toISOString().slice(0, 16));
  const [maintEnd, setMaintEnd] = useState(new Date(Date.now() + 4 * 3600 * 1000).toISOString().slice(0, 16));
  const [maintDesc, setMaintDesc] = useState('Floor Mat Cleaning & LED Light Replacement');
  const [savingMaint, setSavingMaint] = useState(false);

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
              setFacilityId(facRes.data[0].facilityId);
            }
          }
          await loadBlocks(v.venueId);
        }
      } catch (err) {
        console.error('Failed to load blocks:', err);
      } finally {
        setLoading(false);
      }
    }
    if (orgId) {
      loadData();
    }
  }, [orgId]);

  const loadBlocks = async (venueId: number) => {
    const res = await facilityApi.getBlocksByVenue(venueId);
    if (res.success && res.data) {
      setBlocks(res.data);
    }
  };

  const handleRefresh = async () => {
    if (!venue) return;
    setRefreshing(true);
    try {
      await loadBlocks(venue.venueId);
    } finally {
      setRefreshing(false);
    }
  };

  const handleCreateBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!venue || !facilityId) return;

    try {
      setSavingBlock(true);
      const res = await facilityApi.createBlock({
        venueId: venue.venueId,
        facilityId,
        blockType,
        blockDate,
        startTime: `${startTime}:00`,
        endTime: `${endTime}:00`,
        reason: reason.trim(),
        notes: notes.trim(),
      });

      if (res.success) {
        setIsBlockModalOpen(false);
        await loadBlocks(venue.venueId);
      }
    } catch (err) {
      console.error('Failed to create block:', err);
    } finally {
      setSavingBlock(false);
    }
  };

  const handleCreateMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!facilityId) return;

    try {
      setSavingMaint(true);
      const res = await facilityApi.createMaintenance({
        facilityId,
        maintenanceType: maintType,
        startDateTime: `${maintStart}:00`,
        endDateTime: `${maintEnd}:00`,
        description: maintDesc.trim(),
      });

      if (res.success) {
        setIsMaintModalOpen(false);
        if (venue) await loadBlocks(venue.venueId);
      }
    } catch (err) {
      console.error('Failed to schedule maintenance:', err);
    } finally {
      setSavingMaint(false);
    }
  };

  const handleDeleteBlock = async (blockUuid: string) => {
    if (!confirm('Are you sure you want to release this block?')) return;
    if (!venue) return;

    try {
      await facilityApi.deleteBlock(blockUuid);
      await loadBlocks(venue.venueId);
      if (inspectedBlock && inspectedBlock.blockUuid === blockUuid) {
        setInspectedBlock(null);
      }
    } catch (err) {
      console.error('Failed to delete block:', err);
    }
  };

  // Helper calculations
  const parseTimeToMinutes = (timeStr?: string) => {
    if (!timeStr) return 0;
    const parts = timeStr.split(':');
    const h = Number(parts[0]) || 0;
    const m = Number(parts[1]) || 0;
    return h * 60 + m;
  };

  const getBlockDurationHours = (b: FacilityBlockDto) => {
    const start = parseTimeToMinutes(b.startTime);
    const end = parseTimeToMinutes(b.endTime);
    const diff = Math.max(0, end - start);
    return (diff / 60).toFixed(1);
  };

  const metrics = useMemo(() => {
    const total = blocks.length;
    let totalMinutes = 0;
    const todayStr = new Date().toISOString().split('T')[0];
    let todayCount = 0;

    blocks.forEach((b) => {
      const start = parseTimeToMinutes(b.startTime);
      const end = parseTimeToMinutes(b.endTime);
      totalMinutes += Math.max(0, end - start);
      if (b.blockDate === todayStr) todayCount++;
    });

    const totalBlockedHours = (totalMinutes / 60).toFixed(1);

    const ownerCount = blocks.filter((b) => b.blockType === 'OWNER_BLOCK').length;
    const eventCount = blocks.filter((b) => b.blockType === 'PRIVATE_EVENT' || b.blockType === 'TOURNAMENT').length;
    const maintCount = blocks.filter((b) => b.blockType === 'MAINTENANCE').length;
    const academyCount = blocks.filter((b) => b.blockType === 'ACADEMY' || b.blockType === 'CLUB').length;

    const affectedCourtsSet = new Set(blocks.map((b) => b.facilityId));

    return {
      total,
      totalBlockedHours,
      todayCount,
      ownerCount,
      eventCount,
      maintCount,
      academyCount,
      affectedCourtsCount: affectedCourtsSet.size,
    };
  }, [blocks]);

  const getBlockTypeMeta = (type: BlockType) => {
    switch (type) {
      case 'OWNER_BLOCK':
        return {
          label: 'Admin Hold',
          badge: 'bg-rose-500/10 text-rose-400 border-rose-500/25',
          icon: Lock,
        };
      case 'PRIVATE_EVENT':
      case 'TOURNAMENT':
        return {
          label: 'Private Event',
          badge: 'bg-purple-500/10 text-purple-400 border-purple-500/25',
          icon: Sparkles,
        };
      case 'MAINTENANCE':
        return {
          label: 'Maintenance',
          badge: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
          icon: Wrench,
        };
      case 'ACADEMY':
        return {
          label: 'Academy Session',
          badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/25',
          icon: Shield,
        };
      case 'CLUB':
        return {
          label: 'Club Session',
          badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
          icon: Shield,
        };
      default:
        return {
          label: type ? String(type).replace(/_/g, ' ') : 'Hold',
          badge: 'bg-slate-500/10 text-slate-300 border-slate-500/25',
          icon: Ban,
        };
    }
  };

  const filteredBlocks = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];

    return blocks.filter((b) => {
      if (desktopTypeFilter !== 'ALL' && b.blockType !== desktopTypeFilter) return false;
      if (desktopFacilityFilter !== 'ALL' && b.facilityId !== Number(desktopFacilityFilter)) return false;

      if (desktopDateFilter === 'TODAY' && b.blockDate !== todayStr) return false;
      if (desktopDateFilter === 'UPCOMING' && b.blockDate < todayStr) return false;
      if (desktopDateFilter === 'PAST' && b.blockDate >= todayStr) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchReason = b.reason?.toLowerCase().includes(q);
        const matchFacility = b.facilityName?.toLowerCase().includes(q);
        const matchNotes = b.notes?.toLowerCase().includes(q);
        const matchType = b.blockType?.toLowerCase().includes(q);
        if (!matchReason && !matchFacility && !matchNotes && !matchType) return false;
      }

      return true;
    });
  }, [blocks, desktopTypeFilter, desktopFacilityFilter, desktopDateFilter, searchQuery]);

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
              <Shield className="w-4 h-4" /> Capacity & Maintenance
            </div>
            <h1 className="text-xl font-black tracking-tight text-foreground">
              Administrative Blocks & Maintenance
            </h1>
            <p className="text-xs text-muted-foreground">
              Block courts for tournaments, private events, or scheduled maintenance without slot overlap.
            </p>
          </div>

          <div className="flex flex-col gap-2 w-full">
            <button
              onClick={() => setIsMaintModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border text-foreground font-bold text-xs"
            >
              <Wrench className="w-4 h-4 text-amber-400" /> Schedule Maintenance
            </button>
            <button
              onClick={() => setIsBlockModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-black font-black text-xs shadow-lg shadow-primary/20"
            >
              <Plus className="w-4 h-4" /> New Admin Block
            </button>
          </div>
        </div>

        {/* Mobile Blocks List */}
        {loading ? (
          <div className="h-48 rounded-2xl bg-card border border-border animate-pulse" />
        ) : blocks.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-card border border-border space-y-2">
            <Shield className="w-10 h-10 text-muted-foreground/40 mx-auto" />
            <h3 className="text-sm font-black text-foreground">No Active Blocks</h3>
            <p className="text-xs text-muted-foreground">
              All court slots are currently open for booking according to operating rules.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {blocks.map((b) => (
              <div
                key={b.blockUuid}
                className="p-4 rounded-2xl bg-card border border-border space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2 py-0.5 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 text-[10px] font-black uppercase">
                    {b.blockType}
                  </span>
                  <button
                    onClick={() => handleDeleteBlock(b.blockUuid)}
                    className="p-1 rounded-lg text-muted-foreground hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-sm font-black text-foreground">{b.reason}</h3>

                <div className="text-xs space-y-1 text-muted-foreground pt-1 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span>Facility:</span>
                    <span className="font-bold text-foreground">{b.facilityName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Date:</span>
                    <span className="font-bold text-foreground">{b.blockDate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Time:</span>
                    <span className="font-bold text-foreground">
                      {b.startTime?.slice(0, 5)} - {b.endTime?.slice(0, 5)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. DESKTOP VIEW (hidden md:block) - ATHLETIC CAPACITY COMMAND CENTER      */}
      {/* ========================================================================= */}
      <div className="hidden md:block space-y-5">

        {/* Desktop Header */}
        <div className="flex items-center justify-between gap-4 pb-1">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground mb-1">
              <span>Venue Operations</span>
              <span>/</span>
              <span className="text-foreground">Court Blocks</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">
              Court Blocks & Holds
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage facility maintenance windows, private events, and admin capacity holds.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              title="Refresh Blocks"
              className="p-2.5 rounded-xl bg-card border border-border/80 hover:bg-white/5 active:scale-95 text-muted-foreground hover:text-foreground transition-all shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-primary' : ''}`} />
            </button>

            <button
              onClick={() => setIsMaintModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-background border border-border hover:bg-white/5 font-bold text-xs text-foreground transition-all"
            >
              <Wrench className="w-4 h-4 text-amber-400" /> Maintenance
            </button>

            <button
              onClick={() => setIsBlockModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-black font-bold text-xs hover:brightness-110 active:scale-95 transition-all shadow-md shadow-primary/20"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              New Block
            </button>
          </div>
        </div>

        {/* 4 Clean Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-2xl bg-card border border-border/70 hover:border-rose-500/40 transition-all">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-semibold">Active Holds</span>
              <Lock className="w-4 h-4 text-rose-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-foreground">{metrics.total}</span>
              <span className="text-xs text-muted-foreground font-medium">holds</span>
            </div>
            <div className="mt-2 text-[11px] text-rose-400 font-semibold">
              {metrics.todayCount} active today
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-card border border-border/70 hover:border-amber-500/40 transition-all">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-semibold">Blocked Hours</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-400">{metrics.totalBlockedHours}</span>
              <span className="text-xs text-muted-foreground font-medium">hours</span>
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground font-medium">
              {metrics.affectedCourtsCount} courts impacted
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-card border border-border/70 hover:border-purple-500/40 transition-all">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-semibold">Categories</span>
              <Sparkles className="w-4 h-4 text-purple-400" />
            </div>
            <div className="flex flex-wrap gap-1.5 items-center mt-1">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                Admin: {metrics.ownerCount}
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                Events: {metrics.eventCount}
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Maint: {metrics.maintCount}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-card border border-border/70 hover:border-emerald-500/40 transition-all">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-semibold">Collision Guard</span>
              <Shield className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-400">100%</span>
              <span className="text-xs text-muted-foreground font-medium">conflict-free</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Real-time overlap blocking</span>
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="p-3 rounded-2xl bg-card border border-border/80 flex flex-col lg:flex-row items-center justify-between gap-3 shadow-sm">
          {/* Left: Search Bar & Filters */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            {/* Search Input */}
            <div className="relative min-w-[200px] max-w-sm flex-1">
              <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reason, court..."
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
                { key: 'OWNER_BLOCK', label: 'Admin' },
                { key: 'PRIVATE_EVENT', label: 'Events' },
                { key: 'MAINTENANCE', label: 'Maint' },
                { key: 'ACADEMY', label: 'Academy' },
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

            {/* Facility Select */}
            {facilities.length > 0 && (
              <select
                value={desktopFacilityFilter}
                onChange={(e) => setDesktopFacilityFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl bg-background border border-border/80 text-xs font-semibold text-foreground outline-none focus:border-primary cursor-pointer"
              >
                <option value="ALL">All Courts</option>
                {facilities.map((fac) => (
                  <option key={fac.facilityId} value={fac.facilityId}>
                    {fac.name}
                  </option>
                ))}
              </select>
            )}

            {/* Date Window Select */}
            <select
              value={desktopDateFilter}
              onChange={(e) => setDesktopDateFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-background border border-border/80 text-xs font-semibold text-foreground outline-none focus:border-primary cursor-pointer"
            >
              <option value="ALL">All Dates</option>
              <option value="TODAY">Today</option>
              <option value="UPCOMING">Upcoming</option>
              <option value="PAST">Past</option>
            </select>
          </div>


          {/* Right: Results count and View Mode Switcher */}
          <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
            <span className="text-xs font-mono text-muted-foreground">
              Showing <strong className="text-foreground">{filteredBlocks.length}</strong> of {blocks.length}
            </span>

            <div className="flex items-center p-1 bg-background border border-border/80 rounded-xl">
              <button
                onClick={() => setDesktopViewMode('cards')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  desktopViewMode === 'cards'
                    ? 'bg-white/10 text-foreground font-black'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Cards Grid"
              >
                <Shield className="w-3.5 h-3.5" /> Grid
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

        {/* Content Display: Cards vs Table */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-56 rounded-3xl bg-card border border-border" />
            ))}
          </div>
        ) : filteredBlocks.length === 0 ? (
          <div className="p-16 text-center rounded-3xl bg-card border border-border/80 space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto border border-primary/20">
              <Shield className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-foreground">No Active Capacity Holds Found</h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                {searchQuery || desktopTypeFilter !== 'ALL' || desktopFacilityFilter !== 'ALL' || desktopDateFilter !== 'ALL'
                  ? 'No blocks match the active filter criteria. Clear search or reset filters.'
                  : 'All court inventory is open for booking. Schedule maintenance or an admin hold when needed.'}
              </p>
            </div>
            <button
              onClick={() => setIsBlockModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-black font-black text-xs hover:brightness-110 shadow-lg shadow-primary/20"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" /> Create Admin Block
            </button>
          </div>
        ) : desktopViewMode === 'cards' ? (
          /* ================= CARDS GRID VIEW ================= */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredBlocks.map((b) => {
              const meta = getBlockTypeMeta(b.blockType);
              const IconComp = meta.icon;
              const durationHours = getBlockDurationHours(b);
              const isToday = b.blockDate === new Date().toISOString().split('T')[0];

              return (
                <div
                  key={b.blockUuid}
                  className="group relative p-6 rounded-3xl bg-card border border-border/80 hover:border-red-500/50 transition-all duration-300 flex flex-col justify-between shadow-sm hover:shadow-xl space-y-4"
                >
                  <div className="space-y-3.5">
                    {/* Top Row: Type Pill + Facility + Release Button */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${meta.badge}`}>
                            <IconComp className="w-3 h-3" />
                            {meta.label}
                          </span>
                          {isToday && (
                            <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-black flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                              TODAY
                            </span>
                          )}
                        </div>

                        <h3 className="text-base font-black text-foreground group-hover:text-primary transition-colors line-clamp-1 pt-0.5">
                          {b.reason}
                        </h3>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setInspectedBlock(b)}
                          className="p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-all"
                          title="Inspect Block"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBlock(b.blockUuid)}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-all"
                          title="Release Block"
                        >
                          <Unlock className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Facility Court Badge */}
                    <div className="flex items-center gap-2 text-xs font-bold text-foreground/80">
                      <Building2 className="w-4 h-4 text-primary" />
                      <span>{b.facilityName || 'Court Unit'}</span>
                    </div>

                    {/* Schedule Bento Box */}
                    <div className="p-3.5 rounded-2xl bg-background/60 border border-border/60 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-primary" /> Scheduled Date
                        </span>
                        <span className="font-mono font-bold text-foreground">
                          {b.blockDate}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-border/50">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-primary" /> Time Window
                        </span>
                        <div className="text-right">
                          <span className="font-mono font-black text-foreground">
                            {b.startTime?.slice(0, 5)} - {b.endTime?.slice(0, 5)}
                          </span>
                          <span className="text-[10px] text-muted-foreground ml-1 font-mono">
                            ({durationHours}h)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Notes if present */}
                    {b.notes && (
                      <p className="text-xs text-muted-foreground line-clamp-2 italic">
                        "{b.notes}"
                      </p>
                    )}
                  </div>

                  {/* Card Actions Footer */}
                  <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-muted-foreground font-mono">
                      Ref: #{b.blockUuid.slice(0, 8)}
                    </span>

                    <button
                      onClick={() => handleDeleteBlock(b.blockUuid)}
                      className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-[11px] font-bold transition-all flex items-center gap-1"
                    >
                      <Unlock className="w-3 h-3" /> Release Hold
                    </button>
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
                    <th className="p-4">Hold Reason & Ref</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Facility Court</th>
                    <th className="p-4">Scheduled Date</th>
                    <th className="p-4">Time Window</th>
                    <th className="p-4 text-center">Duration</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 text-xs">
                  {filteredBlocks.map((b) => {
                    const meta = getBlockTypeMeta(b.blockType);
                    const IconComp = meta.icon;
                    const durationHours = getBlockDurationHours(b);
                    const isToday = b.blockDate === new Date().toISOString().split('T')[0];

                    return (
                      <tr key={b.blockUuid} className="hover:bg-white/[0.02] transition-colors group">
                        {/* Reason */}
                        <td className="p-4">
                          <div className="font-black text-foreground group-hover:text-primary transition-colors text-sm">
                            {b.reason}
                          </div>
                          <div className="text-[10px] font-mono text-muted-foreground">
                            #{b.blockUuid.slice(0, 8)}
                          </div>
                        </td>

                        {/* Category */}
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${meta.badge}`}>
                            <IconComp className="w-3 h-3" />
                            {meta.label}
                          </span>
                        </td>

                        {/* Facility Court */}
                        <td className="p-4 font-bold text-foreground/80">
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-primary/70" />
                            <span>{b.facilityName || 'Court Unit'}</span>
                          </div>
                        </td>

                        {/* Date */}
                        <td className="p-4 font-mono font-medium">
                          <div className="flex items-center gap-1.5">
                            <span>{b.blockDate}</span>
                            {isToday && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                TODAY
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Time Window */}
                        <td className="p-4 font-mono font-bold text-foreground">
                          {b.startTime?.slice(0, 5)} - {b.endTime?.slice(0, 5)}
                        </td>

                        {/* Duration */}
                        <td className="p-4 text-center font-mono text-muted-foreground">
                          {durationHours} hrs
                        </td>

                        {/* Actions */}
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setInspectedBlock(b)}
                              className="p-1.5 rounded-lg border border-border/80 hover:bg-white/5 text-muted-foreground hover:text-foreground"
                              title="Inspect Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteBlock(b.blockUuid)}
                              className="px-2.5 py-1 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs transition-all flex items-center gap-1"
                              title="Release Block"
                            >
                              <Unlock className="w-3 h-3" /> Release
                            </button>
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
      {/* 3. DESKTOP SLIDE-OVER BLOCK INSPECTOR                                     */}
      {/* ========================================================================= */}
      {inspectedBlock && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end animate-in fade-in">
          <div className="w-full max-w-xl bg-card border-l border-border h-full p-6 lg:p-8 flex flex-col justify-between overflow-y-auto space-y-6">
            <div className="space-y-6">
              {/* Drawer Top */}
              <div className="flex items-start justify-between border-b border-border pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getBlockTypeMeta(inspectedBlock.blockType).badge}`}>
                      {getBlockTypeMeta(inspectedBlock.blockType).label}
                    </span>
                    <span className="text-xs font-mono text-muted-foreground">
                      #{inspectedBlock.blockUuid.slice(0, 8)}
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-foreground">{inspectedBlock.reason}</h2>
                  <p className="text-xs text-muted-foreground">{inspectedBlock.facilityName}</p>
                </div>

                <button
                  onClick={() => setInspectedBlock(null)}
                  className="p-2 rounded-xl hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              {/* Timing & Facility Bento */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-background border border-border space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Blocked Facility</span>
                  <div className="text-base font-black text-foreground flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-primary" />
                    <span>{inspectedBlock.facilityName}</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground font-mono">
                    ID #{inspectedBlock.facilityId}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-background border border-border space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Scheduled Window</span>
                  <div className="text-base font-black text-foreground flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>{inspectedBlock.startTime?.slice(0, 5)} - {inspectedBlock.endTime?.slice(0, 5)}</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground font-mono">
                    {getBlockDurationHours(inspectedBlock)} hours duration
                  </div>
                </div>
              </div>

              {/* Date Matrix */}
              <div className="p-4 rounded-2xl bg-background border border-border space-y-2">
                <span className="text-xs font-bold text-foreground uppercase tracking-wider">Calendar Date</span>
                <div className="text-sm font-black text-foreground font-mono flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>{inspectedBlock.blockDate}</span>
                </div>
              </div>

              {/* Notes */}
              {inspectedBlock.notes && (
                <div className="p-4 rounded-2xl bg-background border border-border space-y-1.5">
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider">Administrative Notes</span>
                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {inspectedBlock.notes}
                  </p>
                </div>
              )}

              {/* Release Warning Box */}
              <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-2">
                <div className="flex items-center gap-2 text-rose-400 font-black text-xs uppercase tracking-wider">
                  <Lock className="w-4 h-4" /> Capacity Locked
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Releasing this block will immediately open up the {inspectedBlock.facilityName} slots for public booking and online reservations.
                </p>
              </div>
            </div>

            {/* Drawer Bottom Actions */}
            <div className="pt-4 border-t border-border flex items-center justify-between gap-3">
              <button
                onClick={() => handleDeleteBlock(inspectedBlock.blockUuid)}
                className="px-5 py-2.5 rounded-xl bg-red-500 text-white font-black text-xs hover:bg-red-600 transition-all flex items-center gap-1.5 shadow-md shadow-red-500/20"
              >
                <Unlock className="w-3.5 h-3.5" /> Release Block Now
              </button>

              <button
                onClick={() => setInspectedBlock(null)}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-foreground transition-all"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MODALS (Add Block + Schedule Maintenance)                              */}
      {/* ========================================================================= */}

      {/* Add Block Modal */}
      {isBlockModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-card border border-border w-full max-w-lg rounded-3xl p-6 lg:p-7 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-lg font-black text-foreground">Block Facility Slot</h3>
                <p className="text-xs text-muted-foreground">Reserve dedicated capacity for events and operations</p>
              </div>
              <button onClick={() => setIsBlockModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBlock} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Target Facility / Court</label>
                <select
                  value={facilityId}
                  onChange={(e) => setFacilityId(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs font-bold text-foreground outline-none focus:border-primary cursor-pointer"
                >
                  {facilities.map((fac) => (
                    <option key={fac.facilityId} value={fac.facilityId}>
                      {fac.name} ({fac.facilityType})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Block Reason / Category</label>
                <select
                  value={blockType}
                  onChange={(e) => setBlockType(e.target.value as BlockType)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs font-bold text-foreground outline-none focus:border-primary cursor-pointer"
                >
                  <option value="OWNER_BLOCK">Owner / Admin Hold</option>
                  <option value="PRIVATE_EVENT">Private Tournament / Event</option>
                  <option value="CLUB">Club Member Session</option>
                  <option value="ACADEMY">Academy Coaching Session</option>
                  <option value="MAINTENANCE">Maintenance</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Date</label>
                  <input
                    type="date"
                    required
                    value={blockDate}
                    onChange={(e) => setBlockDate(e.target.value)}
                    className="w-full px-2 py-2 rounded-xl bg-background border border-border text-xs font-bold text-foreground outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Start Time</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-2 py-2 rounded-xl bg-background border border-border text-xs font-bold text-foreground outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">End Time</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-2 py-2 rounded-xl bg-background border border-border text-xs font-bold text-foreground outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Reason / Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. State Badminton League Matches"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs font-medium text-foreground outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Internal Notes (Optional)</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional instructions, coordinator details..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs font-medium text-foreground outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsBlockModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border font-bold text-xs text-foreground hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingBlock}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-black text-xs hover:bg-red-600 disabled:opacity-50 transition-all shadow-lg shadow-red-500/20"
                >
                  {savingBlock ? 'Blocking...' : 'Confirm Block'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Maintenance Modal */}
      {isMaintModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-card border border-border w-full max-w-lg rounded-3xl p-6 lg:p-7 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-lg font-black text-foreground">Schedule Maintenance</h3>
                <p className="text-xs text-muted-foreground">Temporarily close court inventory for repair or cleaning</p>
              </div>
              <button onClick={() => setIsMaintModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMaintenance} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Facility / Court</label>
                <select
                  value={facilityId}
                  onChange={(e) => setFacilityId(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs font-bold text-foreground outline-none focus:border-primary cursor-pointer"
                >
                  {facilities.map((fac) => (
                    <option key={fac.facilityId} value={fac.facilityId}>
                      {fac.name} ({fac.facilityType})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Maintenance Type</label>
                <select
                  value={maintType}
                  onChange={(e) => setMaintType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs font-bold text-foreground outline-none focus:border-primary cursor-pointer"
                >
                  <option value="ROUTINE">Routine Inspection & Cleaning</option>
                  <option value="FLOOR_COATING">Floor Coating / Relining</option>
                  <option value="LIGHTING">Lighting & Floodlight Repair</option>
                  <option value="REPAIR">Net / Equipment Repair</option>
                  <option value="EMERGENCY">Emergency Maintenance</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Start Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={maintStart}
                    onChange={(e) => setMaintStart(e.target.value)}
                    className="w-full px-2 py-2 rounded-xl bg-background border border-border text-xs font-bold text-foreground outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">End Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={maintEnd}
                    onChange={(e) => setMaintEnd(e.target.value)}
                    className="w-full px-2 py-2 rounded-xl bg-background border border-border text-xs font-bold text-foreground outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Description / Notes</label>
                <textarea
                  rows={2}
                  value={maintDesc}
                  onChange={(e) => setMaintDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs font-medium text-foreground outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsMaintModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border font-bold text-xs text-foreground hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingMaint}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 text-black font-black text-xs hover:bg-amber-400 disabled:opacity-50 transition-all shadow-md shadow-amber-500/20"
                >
                  {savingMaint ? 'Scheduling...' : 'Schedule Maintenance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
