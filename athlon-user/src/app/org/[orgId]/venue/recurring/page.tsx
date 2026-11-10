'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Layers,
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Building2,
  Filter,
  Check,
  ChevronRight,
  Shield,
  Activity,
  AlertTriangle,
  Search,
  RefreshCw,
  Sparkles,
  Pause,
  Play,
  CalendarDays,
  ExternalLink,
  ArrowRight,
  UserCheck,
  Award,
  Briefcase,
  Wrench,
  BarChart2,
  Eye,
  SlidersHorizontal,
  Users
} from 'lucide-react';
import {
  venueApi,
  facilityApi,
  recurringReservationApi,
  VenueDto,
  FacilityDto,
  RecurringReservationDto,
  RecurringConflictReportDto,
  ReservationType,
  RecurrenceType,
  ReservationStatus
} from '@/lib/api/venue';
import { useVenueEntitlementsStore } from '@/store/useVenueEntitlementsStore';

export default function VenueRecurringPage() {
  const params = useParams();
  const orgId = params?.orgId as string;

  const { loadEntitlements, hasFeature, openFeaturePaywall } = useVenueEntitlementsStore();

  const [venue, setVenue] = useState<VenueDto | null>(null);
  const [facilities, setFacilities] = useState<FacilityDto[]>([]);
  const [seriesList, setSeriesList] = useState<RecurringReservationDto[]>([]);
  const [loading, setLoading] = useState(true);

  // Desktop filtering & views
  const [searchQuery, setSearchQuery] = useState('');
  const [desktopTypeFilter, setDesktopTypeFilter] = useState<string>('ALL');
  const [desktopFacilityFilter, setDesktopFacilityFilter] = useState<string>('ALL');
  const [desktopStatusFilter, setDesktopStatusFilter] = useState<string>('ALL');
  const [desktopViewMode, setDesktopViewMode] = useState<'cards' | 'table'>('cards');
  const [refreshing, setRefreshing] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null);
  const [inspectedSeries, setInspectedSeries] = useState<RecurringReservationDto | null>(null);

  // New Series Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [facilityId, setFacilityId] = useState<number>(0);
  const [title, setTitle] = useState('');
  const [reservationType, setReservationType] = useState<ReservationType>('ACADEMY_BATCH');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [startTime, setStartTime] = useState('06:00');
  const [endTime, setEndTime] = useState('07:30');
  const [selectedDays, setSelectedDays] = useState<string[]>(['MONDAY', 'WEDNESDAY', 'FRIDAY']);
  const [notes, setNotes] = useState('');

  // Conflict Pre-flight state
  const [checkingConflict, setCheckingConflict] = useState(false);
  const [conflictReport, setConflictReport] = useState<RecurringConflictReportDto | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Exception Override Modal
  const [isExceptionModalOpen, setIsExceptionModalOpen] = useState(false);
  const [activeSeries, setActiveSeries] = useState<RecurringReservationDto | null>(null);
  const [exceptionDate, setExceptionDate] = useState(new Date().toISOString().split('T')[0]);
  const [exceptionReason, setExceptionReason] = useState('Holiday / Ground Rescheduled');
  const [savingException, setSavingException] = useState(false);

  const daysList = [
    { key: 'MONDAY', label: 'Mon', full: 'Monday' },
    { key: 'TUESDAY', label: 'Tue', full: 'Tuesday' },
    { key: 'WEDNESDAY', label: 'Wed', full: 'Wednesday' },
    { key: 'THURSDAY', label: 'Thu', full: 'Thursday' },
    { key: 'FRIDAY', label: 'Fri', full: 'Friday' },
    { key: 'SATURDAY', label: 'Sat', full: 'Saturday' },
    { key: 'SUNDAY', label: 'Sun', full: 'Sunday' },
  ];

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
          await loadSeries(v.venueId);
        }
      } catch (err) {
        console.error('Failed to load recurring series:', err);
      } finally {
        setLoading(false);
      }
    }
    if (orgId) {
      loadData();
      loadEntitlements(orgId);
    }
  }, [orgId, loadEntitlements]);

  const handleOpenCreateSeriesModal = () => {
    if (!hasFeature(orgId, 'VENUE_RECURRING_BOOKINGS')) {
      openFeaturePaywall(
        orgId,
        'VENUE_RECURRING_BOOKINGS',
        'Recurring Batch & League Reservations',
        'Block weekly repeating slots for academies, clubs, coaches, and corporate leagues with automated conflict detection.'
      );
      return;
    }
    setTitle('');
    setNotes('');
    setConflictReport(null);
    setCreateError(null);
    setIsCreateModalOpen(true);
  };

  const loadSeries = async (venueId: number) => {
    const res = await recurringReservationApi.getByVenue(venueId);
    if (res.success && res.data) {
      setSeriesList(res.data);
    }
  };

  const handleRefresh = async () => {
    if (!venue) return;
    try {
      setRefreshing(true);
      await loadSeries(venue.venueId);
    } finally {
      setRefreshing(false);
    }
  };

  const handleToggleStatus = async (series: RecurringReservationDto) => {
    if (!venue) return;
    try {
      setUpdatingStatusId(series.recurringReservationId);
      const nextStatus: ReservationStatus = series.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
      const res = await recurringReservationApi.updateStatus(series.recurringReservationId, nextStatus);
      if (res.success) {
        await loadSeries(venue.venueId);
        if (inspectedSeries && inspectedSeries.recurringReservationId === series.recurringReservationId) {
          setInspectedSeries({ ...inspectedSeries, status: nextStatus });
        }
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      if (selectedDays.length > 1) {
        setSelectedDays(selectedDays.filter((d) => d !== day));
      }
    } else {
      setSelectedDays([...selectedDays, day]);
    }
    setConflictReport(null);
  };

  const setDaysPreset = (preset: 'ALL' | 'WEEKDAYS' | 'WEEKENDS' | 'CLEAR') => {
    if (preset === 'ALL') {
      setSelectedDays(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']);
    } else if (preset === 'WEEKDAYS') {
      setSelectedDays(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']);
    } else if (preset === 'WEEKENDS') {
      setSelectedDays(['SATURDAY', 'SUNDAY']);
    } else {
      setSelectedDays(['MONDAY']);
    }
    setConflictReport(null);
  };

  const handleCheckConflicts = async () => {
    if (!facilityId) return;
    try {
      setCheckingConflict(true);
      setCreateError(null);
      const res = await recurringReservationApi.checkConflicts({
        facilityId,
        startDate,
        endDate,
        startTime: `${startTime}:00`,
        endTime: `${endTime}:00`,
        daysOfWeek: selectedDays.join(','),
        repeatInterval: 1,
      });

      if (res.success && res.data) {
        setConflictReport(res.data);
      }
    } catch (err: any) {
      console.error('Conflict check error:', err);
      setCreateError(err?.message || 'Conflict check failed');
    } finally {
      setCheckingConflict(false);
    }
  };

  const handleCreateSeries = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!venue || !facilityId) return;

    try {
      setSubmitting(true);
      setCreateError(null);

      const res = await recurringReservationApi.createRecurringReservation({
        venueId: venue.venueId,
        facilityId,
        reservationType,
        title: title.trim() || 'Internal Recurring Series',
        recurrenceType: 'WEEKLY',
        startDate,
        endDate,
        startTime: `${startTime}:00`,
        endTime: `${endTime}:00`,
        repeatInterval: 1,
        daysOfWeek: selectedDays.join(','),
        notes: notes.trim(),
      });

      if (res.success) {
        setIsCreateModalOpen(false);
        await loadSeries(venue.venueId);
      }
    } catch (err: any) {
      console.error('Failed to create series:', err);
      setCreateError(err?.message || 'Failed to create series');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddException = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSeries || !venue) return;

    try {
      setSavingException(true);
      const res = await recurringReservationApi.addException(activeSeries.recurringReservationId, {
        occurrenceDate: exceptionDate,
        exceptionType: 'CANCELLED',
        reason: exceptionReason.trim(),
      });

      if (res.success) {
        setIsExceptionModalOpen(false);
        await loadSeries(venue.venueId);
        if (inspectedSeries && inspectedSeries.recurringReservationId === activeSeries.recurringReservationId) {
          const updatedExceptions = [...(inspectedSeries.exceptions || []), {
            occurrenceDate: exceptionDate,
            exceptionType: 'CANCELLED' as const,
            reason: exceptionReason.trim()
          }];
          setInspectedSeries({ ...inspectedSeries, exceptions: updatedExceptions });
        }
      }
    } catch (err) {
      console.error('Failed to add exception:', err);
    } finally {
      setSavingException(false);
    }
  };

  // Helper calculations for metrics & visual cards
  const parseTimeToMinutes = (timeStr: string) => {
    if (!timeStr) return 0;
    const parts = timeStr.split(':');
    const h = Number(parts[0]) || 0;
    const m = Number(parts[1]) || 0;
    return h * 60 + m;
  };

  const getSeriesDurationMinutes = (s: RecurringReservationDto) => {
    const start = parseTimeToMinutes(s.startTime);
    const end = parseTimeToMinutes(s.endTime);
    return Math.max(0, end - start);
  };

  const metrics = useMemo(() => {
    const total = seriesList.length;
    const activeList = seriesList.filter((s) => s.status === 'ACTIVE');
    const activeCount = activeList.length;
    const pausedCount = seriesList.filter((s) => s.status === 'PAUSED').length;

    let totalWeeklyMins = 0;
    activeList.forEach((s) => {
      const duration = getSeriesDurationMinutes(s);
      const daysCount = s.daysOfWeek ? s.daysOfWeek.split(',').filter(Boolean).length : 0;
      totalWeeklyMins += duration * daysCount;
    });
    const weeklyHours = (totalWeeklyMins / 60).toFixed(1);

    const academyCount = seriesList.filter((s) => s.reservationType === 'ACADEMY_BATCH').length;
    const clubCount = seriesList.filter((s) => s.reservationType === 'CLUB').length;
    const coachCount = seriesList.filter((s) => s.reservationType === 'COACH').length;
    const customerCount = seriesList.filter((s) => s.reservationType === 'CUSTOMER').length;
    const internalCount = seriesList.filter((s) => s.reservationType === 'INTERNAL').length;

    let totalExceptions = 0;
    seriesList.forEach((s) => {
      totalExceptions += s.exceptions?.length || 0;
    });

    const activeFacilitiesSet = new Set(activeList.map((s) => s.facilityId));
    const activeCourtsUtilized = activeFacilitiesSet.size;

    return {
      total,
      activeCount,
      pausedCount,
      weeklyHours,
      academyCount,
      clubCount,
      coachCount,
      customerCount,
      internalCount,
      totalExceptions,
      activeCourtsUtilized
    };
  }, [seriesList]);

  const filteredSeries = useMemo(() => {
    return seriesList.filter((s) => {
      if (desktopTypeFilter !== 'ALL' && s.reservationType !== desktopTypeFilter) return false;
      if (desktopFacilityFilter !== 'ALL' && s.facilityId !== Number(desktopFacilityFilter)) return false;
      if (desktopStatusFilter !== 'ALL' && s.status !== desktopStatusFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = s.title?.toLowerCase().includes(q);
        const matchFacility = s.facilityName?.toLowerCase().includes(q);
        const matchNotes = s.notes?.toLowerCase().includes(q);
        const matchType = s.reservationType?.toLowerCase().includes(q);
        if (!matchTitle && !matchFacility && !matchNotes && !matchType) return false;
      }

      return true;
    });
  }, [seriesList, desktopTypeFilter, desktopFacilityFilter, desktopStatusFilter, searchQuery]);

  const getTypeMeta = (type: ReservationType) => {
    switch (type) {
      case 'ACADEMY_BATCH':
        return {
          label: 'Academy Batch',
          badgeClass: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/25',
          dotClass: 'bg-indigo-400',
          icon: Award,
        };
      case 'CLUB':
        return {
          label: 'Club Session',
          badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
          dotClass: 'bg-emerald-400',
          icon: Users,
        };
      case 'COACH':
        return {
          label: 'Coach Slot',
          badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
          dotClass: 'bg-amber-400',
          icon: UserCheck,
        };
      case 'CUSTOMER':
        return {
          label: 'Contract',
          badgeClass: 'bg-purple-500/10 text-purple-400 border-purple-500/25',
          dotClass: 'bg-purple-400',
          icon: Briefcase,
        };
      case 'INTERNAL':
      default:
        return {
          label: type ? type.replace(/_/g, ' ') : 'Internal Ops',
          badgeClass: 'bg-slate-500/10 text-slate-300 border-slate-500/25',
          dotClass: 'bg-slate-400',
          icon: Wrench,
        };
    }
  };

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
              <Layers className="w-4 h-4" /> Recurring Reservations
            </div>
            <h1 className="text-xl font-black tracking-tight text-foreground">
              Internal Series & Academy Batches
            </h1>
            <p className="text-xs text-muted-foreground">
              Reserve repeating slots for academy batches, club matches and coaching sessions with conflict collision detection.
            </p>
          </div>

          <button
            onClick={handleOpenCreateSeriesModal}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-black font-black text-sm hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20 w-full"
          >
            <Plus className="w-4 h-4" /> Create Recurring Series
          </button>
        </div>

        {/* Mobile Series Cards */}
        {loading ? (
          <div className="grid grid-cols-1 gap-4 animate-pulse">
            {[1, 2].map((i) => (
              <div key={i} className="h-44 rounded-2xl bg-card border border-border" />
            ))}
          </div>
        ) : seriesList.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-card border border-border space-y-3">
            <Layers className="w-10 h-10 text-muted-foreground/40 mx-auto" />
            <h3 className="text-sm font-black text-foreground">No Recurring Series Set Up</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Create scheduled weekly blocks for academy training or regular club members.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {seriesList.map((s) => (
              <div
                key={s.recurringReservationId}
                className="p-4 rounded-2xl bg-card border border-border hover:border-primary/40 transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                        {s.reservationType} • {s.facilityName}
                      </span>
                      <h3 className="text-base font-black text-foreground">
                        {s.title}
                      </h3>
                    </div>
                    <span className="px-2.5 py-1 rounded-full border border-green-500/30 bg-green-500/10 text-green-400 text-[10px] font-bold">
                      {s.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-bold text-foreground/90">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    <span>
                      {s.startTime.slice(0, 5)} - {s.endTime.slice(0, 5)}
                    </span>
                    <span className="text-muted-foreground font-normal">
                      ({s.startDate} to {s.endDate || 'Indefinite'})
                    </span>
                  </div>

                  {/* Days Badges */}
                  <div className="flex flex-wrap gap-1">
                    {s.daysOfWeek.split(',').map((day) => (
                      <span
                        key={day}
                        className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] font-bold text-foreground/70 uppercase"
                      >
                        {day.slice(0, 3)}
                      </span>
                    ))}
                  </div>

                  {/* Exceptions Count */}
                  {s.exceptions && s.exceptions.length > 0 && (
                    <div className="text-[11px] text-amber-400/90 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{s.exceptions.length} occurrence override(s) recorded</span>
                    </div>
                  )}
                </div>

                {/* Action */}
                <div className="pt-3 border-t border-border flex items-center justify-between">
                  <button
                    onClick={() => {
                      setActiveSeries(s);
                      setExceptionDate(new Date().toISOString().split('T')[0]);
                      setIsExceptionModalOpen(true);
                    }}
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Date Exception (Skip/Cancel)
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. DESKTOP VIEW (hidden md:block) - ATHLETIC CADENCE COMMAND CENTER       */}
      {/* ========================================================================= */}
      <div className="hidden md:block space-y-5">

        {/* Desktop Header */}
        <div className="flex items-center justify-between gap-4 pb-1">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground mb-1">
              <span>Venue Operations</span>
              <span>/</span>
              <span className="text-foreground">Recurring Cadence</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">
              Recurring Schedules
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Weekly repeating batches for academies, clubs, and training sessions.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              title="Refresh schedules"
              className="p-2.5 rounded-xl bg-card border border-border/80 hover:bg-white/5 active:scale-95 text-muted-foreground hover:text-foreground transition-all shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-primary' : ''}`} />
            </button>

            <button
              onClick={handleOpenCreateSeriesModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-black font-bold text-xs hover:brightness-110 active:scale-95 transition-all shadow-md shadow-primary/20"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              New Series
            </button>
          </div>
        </div>

        {/* 4 Clean Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-2xl bg-card border border-border/70 hover:border-primary/40 transition-all">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-semibold">Active Series</span>
              <Layers className="w-4 h-4 text-primary" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-foreground">{metrics.activeCount}</span>
              <span className="text-xs text-muted-foreground font-medium">/ {metrics.total} total</span>
            </div>
            <div className="mt-2.5 w-full bg-white/5 rounded-full h-1 overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all duration-500"
                style={{ width: `${metrics.total ? (metrics.activeCount / metrics.total) * 100 : 0}%` }}
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-card border border-border/70 hover:border-emerald-500/40 transition-all">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-semibold">Reserved Hours</span>
              <Clock className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-400">{metrics.weeklyHours}</span>
              <span className="text-xs text-muted-foreground font-medium">hrs / week</span>
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground font-medium">
              Across {metrics.activeCourtsUtilized} court{metrics.activeCourtsUtilized !== 1 ? 's' : ''}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-card border border-border/70 hover:border-indigo-500/40 transition-all">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-semibold">Categories</span>
              <BarChart2 className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="flex flex-wrap gap-1.5 items-center mt-1">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Academy: {metrics.academyCount}
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Club: {metrics.clubCount}
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Coach: {metrics.coachCount}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-card border border-border/70 hover:border-blue-500/40 transition-all">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-semibold">Date Overrides</span>
              <Shield className="w-4 h-4 text-blue-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-blue-400">{metrics.totalExceptions}</span>
              <span className="text-xs text-muted-foreground font-medium">exceptions recorded</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Collision guard active</span>
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="p-3 rounded-2xl bg-card border border-border/80 flex flex-col lg:flex-row items-center justify-between gap-3 shadow-sm">
          {/* Left: Search & Filter Pills */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            {/* Search Input */}
            <div className="relative min-w-[220px] max-w-sm flex-1">
              <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search series or court..."
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

            {/* Type Filters */}
            <div className="flex items-center gap-1 p-1 bg-background border border-border/80 rounded-xl">
              {[
                { key: 'ALL', label: 'All' },
                { key: 'ACADEMY_BATCH', label: 'Academy' },
                { key: 'CLUB', label: 'Club' },
                { key: 'COACH', label: 'Coach' },
                { key: 'CUSTOMER', label: 'Contract' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setDesktopTypeFilter(tab.key)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    desktopTypeFilter === tab.key
                      ? 'bg-primary text-black shadow-sm'
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

            {/* Status Select */}
            <select
              value={desktopStatusFilter}
              onChange={(e) => setDesktopStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-background border border-border/80 text-xs font-semibold text-foreground outline-none focus:border-primary cursor-pointer"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="PAUSED">Paused</option>
            </select>
          </div>

          {/* Right: Results count & View Mode Switcher */}
          <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
            <span className="text-xs text-muted-foreground font-medium">
              <strong className="text-foreground">{filteredSeries.length}</strong> of {seriesList.length}
            </span>

            <div className="flex items-center p-0.5 bg-background border border-border/80 rounded-xl">
              <button
                onClick={() => setDesktopViewMode('cards')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  desktopViewMode === 'cards'
                    ? 'bg-white/10 text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Cards View"
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
                title="Ledger Table"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" /> Table
              </button>
            </div>
          </div>
        </div>


        {/* Content Display: Cards vs Table */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-56 rounded-3xl bg-card border border-border" />
            ))}
          </div>
        ) : filteredSeries.length === 0 ? (
          <div className="p-16 text-center rounded-3xl bg-card border border-border/80 space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto border border-primary/20">
              <Layers className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-foreground">No Recurring Series Found</h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                {searchQuery || desktopTypeFilter !== 'ALL' || desktopFacilityFilter !== 'ALL' || desktopStatusFilter !== 'ALL'
                  ? 'No series match the active filter criteria. Clear search or reset filters.'
                  : 'Start by creating your first weekly repeating academy batch or club reservation.'}
              </p>
            </div>
            {(searchQuery || desktopTypeFilter !== 'ALL' || desktopFacilityFilter !== 'ALL' || desktopStatusFilter !== 'ALL') ? (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setDesktopTypeFilter('ALL');
                  setDesktopFacilityFilter('ALL');
                  setDesktopStatusFilter('ALL');
                }}
                className="px-4 py-2 rounded-xl bg-white/10 text-xs font-bold text-foreground hover:bg-white/20 transition-all"
              >
                Reset All Filters
              </button>
            ) : (
              <button
                onClick={() => {
                  setTitle('');
                  setNotes('');
                  setConflictReport(null);
                  setCreateError(null);
                  setIsCreateModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-black font-black text-xs hover:brightness-110 shadow-lg shadow-primary/20"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" /> Create First Series
              </button>
            )}
          </div>
        ) : desktopViewMode === 'cards' ? (
          /* ================= GRID VIEW ================= */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSeries.map((s) => {
              const meta = getTypeMeta(s.reservationType);
              const IconComp = meta.icon;
              const durationMins = getSeriesDurationMinutes(s);
              const activeDays = s.daysOfWeek ? s.daysOfWeek.split(',').filter(Boolean) : [];
              const isUpdatingThis = updatingStatusId === s.recurringReservationId;

              return (
                <div
                  key={s.recurringReservationId}
                  className={`group relative p-5 rounded-3xl bg-card border transition-all duration-300 flex flex-col justify-between shadow-sm hover:shadow-lg ${
                    s.status === 'ACTIVE'
                      ? 'border-border/80 hover:border-primary/50'
                      : 'border-border/40 opacity-75 hover:opacity-100 hover:border-amber-500/40'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Top Row: Type Pill + Facility + Status Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${meta.badgeClass}`}>
                            <IconComp className="w-3 h-3" />
                            {meta.label}
                          </span>
                          <span className="text-xs font-bold text-foreground/70 truncate max-w-[140px]">
                            {s.facilityName}
                          </span>
                        </div>

                        <h3 className="text-base font-black text-foreground group-hover:text-primary transition-colors line-clamp-1 pt-0.5">
                          {s.title}
                        </h3>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black border flex items-center gap-1.5 shrink-0 ${
                          s.status === 'ACTIVE'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${s.status === 'ACTIVE' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                        {s.status}
                      </span>
                    </div>

                    {/* Time Window & Duration Pill */}
                    <div className="p-3 rounded-2xl bg-background/60 border border-border/60 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-black text-foreground">
                        <Clock className="w-4 h-4 text-primary" />
                        <span>
                          {s.startTime.slice(0, 5)} - {s.endTime.slice(0, 5)}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-white/5 text-[11px] font-bold text-foreground/70 font-mono">
                        {durationMins} min / session
                      </span>
                    </div>

                    {/* Weekly Cadence Days Visualizer */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        <span>Weekly Days</span>
                        <span className="font-mono text-foreground/70">{activeDays.length} days/wk</span>
                      </div>
                      <div className="grid grid-cols-7 gap-1">
                        {daysList.map((d) => {
                          const isActive = activeDays.includes(d.key);
                          return (
                            <div
                              key={d.key}
                              className={`py-1 text-center rounded-lg text-[10px] font-black transition-all ${
                                isActive
                                  ? 'bg-primary/20 text-primary border border-primary/30 shadow-sm'
                                  : 'bg-white/[0.03] text-foreground/25 border border-transparent'
                              }`}
                              title={`${d.full}: ${isActive ? 'Scheduled' : 'Off'}`}
                            >
                              {d.label}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Schedule Date Window */}
                    <div className="text-[11px] text-muted-foreground flex items-center justify-between border-t border-border/40 pt-2.5">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground/60" />
                        <span>{s.startDate} to {s.endDate || 'Ongoing'}</span>
                      </span>

                      {s.exceptions && s.exceptions.length > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 font-bold text-[10px] flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {s.exceptions.length} skip{s.exceptions.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="pt-4 mt-4 border-t border-border/60 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {/* Pause / Resume Button */}
                      <button
                        onClick={() => handleToggleStatus(s)}
                        disabled={isUpdatingThis}
                        title={s.status === 'ACTIVE' ? 'Pause Cadence' : 'Resume Cadence'}
                        className={`p-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1 ${
                          s.status === 'ACTIVE'
                            ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/30'
                            : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        }`}
                      >
                        {isUpdatingThis ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : s.status === 'ACTIVE' ? (
                          <Pause className="w-3.5 h-3.5" />
                        ) : (
                          <Play className="w-3.5 h-3.5" />
                        )}
                        <span className="text-[11px] hidden sm:inline">
                          {s.status === 'ACTIVE' ? 'Pause' : 'Resume'}
                        </span>
                      </button>

                      {/* Add Date Exception Button */}
                      <button
                        onClick={() => {
                          setActiveSeries(s);
                          setExceptionDate(new Date().toISOString().split('T')[0]);
                          setIsExceptionModalOpen(true);
                        }}
                        className="px-2.5 py-2 rounded-xl bg-background border border-border hover:bg-white/5 text-[11px] font-bold text-foreground/90 transition-all flex items-center gap-1"
                        title="Skip a specific holiday / rain date"
                      >
                        <Plus className="w-3.5 h-3.5 text-primary" /> Skip Date
                      </button>
                    </div>

                    {/* View Details / Drawer Button */}
                    <button
                      onClick={() => setInspectedSeries(s)}
                      className="px-2.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/10 text-[11px] font-bold text-primary flex items-center gap-1 transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" /> Details
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
                    <th className="p-4">Series & Category</th>
                    <th className="p-4">Facility Court</th>
                    <th className="p-4">Weekly Cadence</th>
                    <th className="p-4">Time Window</th>
                    <th className="p-4">Date Period</th>
                    <th className="p-4">Overrides</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 text-xs">
                  {filteredSeries.map((s) => {
                    const meta = getTypeMeta(s.reservationType);
                    const IconComp = meta.icon;
                    const durationMins = getSeriesDurationMinutes(s);
                    const activeDays = s.daysOfWeek ? s.daysOfWeek.split(',').filter(Boolean) : [];
                    const isUpdatingThis = updatingStatusId === s.recurringReservationId;

                    return (
                      <tr key={s.recurringReservationId} className="hover:bg-white/[0.02] transition-colors group">
                        {/* Title & Category */}
                        <td className="p-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${meta.badgeClass}`}>
                                <IconComp className="w-2.5 h-2.5" />
                                {meta.label}
                              </span>
                              <span className="font-mono text-[10px] text-foreground/40">
                                #{s.recurringReservationId}
                              </span>
                            </div>
                            <div className="font-black text-foreground group-hover:text-primary transition-colors text-sm">
                              {s.title}
                            </div>
                          </div>
                        </td>

                        {/* Facility */}
                        <td className="p-4 font-bold text-foreground/80">
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-primary/70" />
                            <span>{s.facilityName}</span>
                          </div>
                        </td>

                        {/* Weekly Cadence Days */}
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            {daysList.map((d) => {
                              const isActive = activeDays.includes(d.key);
                              return (
                                <span
                                  key={d.key}
                                  className={`w-5 h-5 rounded flex items-center justify-center text-[9px] font-black ${
                                    isActive
                                      ? 'bg-primary/20 text-primary border border-primary/40'
                                      : 'bg-white/[0.03] text-foreground/20'
                                  }`}
                                  title={`${d.full}: ${isActive ? 'Yes' : 'No'}`}
                                >
                                  {d.label[0]}
                                </span>
                              );
                            })}
                          </div>
                        </td>

                        {/* Time Window */}
                        <td className="p-4">
                          <div className="space-y-0.5">
                            <div className="font-black text-foreground flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-primary" />
                              <span>{s.startTime.slice(0, 5)} - {s.endTime.slice(0, 5)}</span>
                            </div>
                            <div className="text-[10px] font-mono text-muted-foreground">
                              {durationMins} minutes
                            </div>
                          </div>
                        </td>

                        {/* Date Period */}
                        <td className="p-4">
                          <div className="text-muted-foreground font-mono text-[11px]">
                            <div>{s.startDate}</div>
                            <div className="text-[10px] text-foreground/40">to {s.endDate || 'Indefinite'}</div>
                          </div>
                        </td>

                        {/* Overrides */}
                        <td className="p-4">
                          {s.exceptions && s.exceptions.length > 0 ? (
                            <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold inline-flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {s.exceptions.length} skip{s.exceptions.length !== 1 ? 's' : ''}
                            </span>
                          ) : (
                            <span className="text-foreground/30 text-[11px] font-mono">None</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black border inline-flex items-center gap-1.5 ${
                              s.status === 'ACTIVE'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${s.status === 'ACTIVE' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                            {s.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleToggleStatus(s)}
                              disabled={isUpdatingThis}
                              title={s.status === 'ACTIVE' ? 'Pause Series' : 'Resume Series'}
                              className="p-1.5 rounded-lg border border-border/80 hover:bg-white/5 text-foreground/80 hover:text-foreground"
                            >
                              {isUpdatingThis ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              ) : s.status === 'ACTIVE' ? (
                                <Pause className="w-3.5 h-3.5 text-amber-400" />
                              ) : (
                                <Play className="w-3.5 h-3.5 text-emerald-400" />
                              )}
                            </button>

                            <button
                              onClick={() => {
                                setActiveSeries(s);
                                setExceptionDate(new Date().toISOString().split('T')[0]);
                                setIsExceptionModalOpen(true);
                              }}
                              title="Add Date Exception"
                              className="p-1.5 rounded-lg border border-border/80 hover:bg-white/5 text-primary"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => setInspectedSeries(s)}
                              title="Inspect Details"
                              className="p-1.5 rounded-lg border border-border/80 hover:bg-white/5 text-foreground/70 hover:text-foreground"
                            >
                              <Eye className="w-3.5 h-3.5" />
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
      {/* 3. DESKTOP INSPECT SLIDE-OVER DRAWER                                      */}
      {/* ========================================================================= */}
      {inspectedSeries && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end animate-in fade-in">
          <div className="w-full max-w-xl bg-card border-l border-border h-full p-6 lg:p-8 flex flex-col justify-between overflow-y-auto space-y-6">
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-start justify-between border-b border-border pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                      {inspectedSeries.reservationType}
                    </span>
                    <span className="text-xs font-mono text-muted-foreground">
                      #{inspectedSeries.recurringReservationId}
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-foreground">{inspectedSeries.title}</h2>
                  <p className="text-xs text-muted-foreground">{inspectedSeries.facilityName}</p>
                </div>

                <button
                  onClick={() => setInspectedSeries(null)}
                  className="p-2 rounded-xl hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              {/* Status Banner */}
              <div className="p-4 rounded-2xl bg-background border border-border flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground font-bold">Cadence Engine State</div>
                  <div className="text-sm font-black text-foreground flex items-center gap-2 mt-0.5">
                    <span className={`w-2 h-2 rounded-full ${inspectedSeries.status === 'ACTIVE' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                    {inspectedSeries.status}
                  </div>
                </div>

                <button
                  onClick={() => handleToggleStatus(inspectedSeries)}
                  disabled={updatingStatusId === inspectedSeries.recurringReservationId}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                    inspectedSeries.status === 'ACTIVE'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                  }`}
                >
                  {inspectedSeries.status === 'ACTIVE' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{inspectedSeries.status === 'ACTIVE' ? 'Pause Cadence' : 'Activate Cadence'}</span>
                </button>
              </div>

              {/* Timing & Recurrence Breakdown */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-background border border-border space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Daily Slot Window</span>
                  <div className="text-base font-black text-foreground flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>{inspectedSeries.startTime.slice(0, 5)} - {inspectedSeries.endTime.slice(0, 5)}</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground font-mono">
                    {getSeriesDurationMinutes(inspectedSeries)} minutes duration
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-background border border-border space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Effective Dates</span>
                  <div className="text-sm font-black text-foreground">
                    {inspectedSeries.startDate}
                  </div>
                  <div className="text-[11px] text-muted-foreground font-mono">
                    to {inspectedSeries.endDate || 'Indefinite Schedule'}
                  </div>
                </div>
              </div>

              {/* Weekly Days List */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">Active Days Cadence</label>
                <div className="grid grid-cols-7 gap-1.5">
                  {daysList.map((d) => {
                    const activeDays = inspectedSeries.daysOfWeek ? inspectedSeries.daysOfWeek.split(',').filter(Boolean) : [];
                    const isActive = activeDays.includes(d.key);
                    return (
                      <div
                        key={d.key}
                        className={`py-2 text-center rounded-xl text-xs font-black transition-all ${
                          isActive
                            ? 'bg-primary/20 text-primary border border-primary/40 shadow-sm'
                            : 'bg-white/[0.02] text-foreground/20 border border-transparent'
                        }`}
                      >
                        {d.label}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              {inspectedSeries.notes && (
                <div className="p-4 rounded-2xl bg-background border border-border space-y-1.5">
                  <span className="text-xs font-bold text-foreground">Operational Notes / Syllabus</span>
                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {inspectedSeries.notes}
                  </p>
                </div>
              )}

              {/* Exceptions Log */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    Recorded Date Exceptions (Skips)
                  </span>
                  <button
                    onClick={() => {
                      setActiveSeries(inspectedSeries);
                      setExceptionDate(new Date().toISOString().split('T')[0]);
                      setIsExceptionModalOpen(true);
                    }}
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Skip Another Date
                  </button>
                </div>

                {inspectedSeries.exceptions && inspectedSeries.exceptions.length > 0 ? (
                  <div className="divide-y divide-border/60 rounded-2xl bg-background border border-border overflow-hidden">
                    {inspectedSeries.exceptions.map((ex, idx) => (
                      <div key={idx} className="p-3 text-xs flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="font-bold text-foreground font-mono">{ex.occurrenceDate}</div>
                          <div className="text-[11px] text-muted-foreground">{ex.reason || 'Manual override'}</div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-500/10 text-red-400 border border-red-500/20">
                          {ex.exceptionType}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center rounded-2xl bg-background border border-border text-xs text-muted-foreground">
                    No date skips recorded. All recurring weekly slots are active.
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-end">
              <button
                onClick={() => setInspectedSeries(null)}
                className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-foreground transition-all"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MODALS (Create Recurring Series + Add Exception)                       */}
      {/* ========================================================================= */}

      {/* Create Recurring Series Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-xl rounded-3xl p-6 lg:p-7 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="text-lg font-black text-foreground">Create Recurring Reservation Series</h3>
                <p className="text-xs text-muted-foreground">Reserve slots with real-time collision detection</p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {createError && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSeries} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Series Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Junior Academy Morning Batch"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-sm font-medium text-foreground outline-none focus:border-primary transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Facility / Court</label>
                  <select
                    value={facilityId}
                    onChange={(e) => {
                      setFacilityId(Number(e.target.value));
                      setConflictReport(null);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs font-bold text-foreground outline-none focus:border-primary"
                  >
                    {facilities.map((fac) => (
                      <option key={fac.facilityId} value={fac.facilityId}>
                        {fac.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Reservation Type</label>
                  <select
                    value={reservationType}
                    onChange={(e) => setReservationType(e.target.value as ReservationType)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs font-bold text-foreground outline-none focus:border-primary"
                  >
                    <option value="ACADEMY_BATCH">Academy Training Batch</option>
                    <option value="CLUB">Club Member Session</option>
                    <option value="COACH">Coach Private Slot</option>
                    <option value="CUSTOMER">Customer Contract</option>
                    <option value="INTERNAL">Internal Maintenance / Ops</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setConflictReport(null);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs font-bold text-foreground outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">End Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setConflictReport(null);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs font-bold text-foreground outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Start Time</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => {
                      setStartTime(e.target.value);
                      setConflictReport(null);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs font-bold text-foreground outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">End Time</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => {
                      setEndTime(e.target.value);
                      setConflictReport(null);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs font-bold text-foreground outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Days of week with quick preset selectors */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-foreground">Repeat On Days</label>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setDaysPreset('ALL')}
                      className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-foreground/70"
                    >
                      All Days
                    </button>
                    <button
                      type="button"
                      onClick={() => setDaysPreset('WEEKDAYS')}
                      className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-foreground/70"
                    >
                      Weekdays
                    </button>
                    <button
                      type="button"
                      onClick={() => setDaysPreset('WEEKENDS')}
                      className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-foreground/70"
                    >
                      Weekends
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {daysList.map((d) => {
                    const active = selectedDays.includes(d.key);
                    return (
                      <button
                        type="button"
                        key={d.key}
                        onClick={() => toggleDay(d.key)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          active
                            ? 'border-primary bg-primary/10 text-primary shadow-sm'
                            : 'border-border bg-background text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {d.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Optional Notes */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Operational Notes / Syllabus (Optional)</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Lead Coach: Coach Alex. Shuttlecocks provided by academy."
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs font-medium text-foreground outline-none focus:border-primary"
                />
              </div>

              {/* Pre-Flight Conflict Check Box */}
              <div className="p-4 rounded-2xl bg-background border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-primary" /> Pre-Flight Collision Analyzer
                    </span>
                    <p className="text-[11px] text-muted-foreground">
                      Verify all occurrences against existing bookings and blocks before saving.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleCheckConflicts}
                    disabled={checkingConflict}
                    className="px-3 py-1.5 rounded-xl bg-card border border-border hover:bg-white/5 text-xs font-bold text-foreground transition-colors"
                  >
                    {checkingConflict ? 'Analyzing...' : 'Run Collision Check'}
                  </button>
                </div>

                {conflictReport && (
                  <div
                    className={`p-3 rounded-xl border text-xs space-y-2 ${
                      conflictReport.hasConflicts
                        ? 'bg-red-500/10 border-red-500/30 text-red-400'
                        : 'bg-green-500/10 border-green-500/30 text-green-400'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-2">
                      {conflictReport.hasConflicts ? (
                        <>
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                          <span>{conflictReport.conflictingOccurrencesCount} Conflicts Found across {conflictReport.totalOccurrences} dates!</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span>All {conflictReport.totalOccurrences} occurrences are clean & available!</span>
                        </>
                      )}
                    </div>

                    {conflictReport.hasConflicts && (
                      <div className="space-y-1 max-h-28 overflow-y-auto pt-1 font-mono text-[11px]">
                        {conflictReport.conflicts.map((c, i) => (
                          <div key={i} className="text-foreground/80">
                            • {c.date}: {c.conflictDescription} ({c.conflictType})
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border font-bold text-xs text-foreground hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-black font-black text-xs hover:brightness-110 disabled:opacity-50 transition-all shadow-lg shadow-primary/20"
                >
                  {submitting ? 'Creating Series...' : 'Save Recurring Series'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Date Exception Modal */}
      {isExceptionModalOpen && activeSeries && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-black text-foreground">Skip Occurrence</h3>
                <p className="text-xs text-muted-foreground">{activeSeries.title}</p>
              </div>
              <button onClick={() => setIsExceptionModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddException} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Date to Cancel / Override</label>
                <input
                  type="date"
                  required
                  value={exceptionDate}
                  onChange={(e) => setExceptionDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs font-bold text-foreground outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Reason for Exception</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Festival Holiday / Tournament on Court"
                  value={exceptionReason}
                  onChange={(e) => setExceptionReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs font-medium text-foreground outline-none focus:border-primary"
                />

                {/* Quick reason suggestions */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['Holiday / Festival', 'Court Maintenance', 'Rain / Inclement Weather', 'Tournament Event'].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setExceptionReason(r)}
                      className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsExceptionModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border font-bold text-xs text-foreground hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingException}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 text-black font-black text-xs hover:bg-amber-400 disabled:opacity-50 transition-all shadow-md shadow-amber-500/20"
                >
                  {savingException ? 'Saving...' : 'Confirm Exception'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
