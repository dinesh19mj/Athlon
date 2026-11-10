'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Lock,
  Wrench,
  Layers,
  User,
  Phone,
  IndianRupee,
  Activity,
  Filter,
  RefreshCw,
  Search,
  Sparkles,
  Sun,
  Sunrise,
  Moon,
  TrendingUp,
  Check,
  Shield,
  MapPin,
  Tag,
  LayoutGrid,
  Calendar as CalendarIcon,
  Zap,
  ArrowRight,
  UserCheck,
  SlidersHorizontal,
  Flame,
  List,
  Eye,
  Settings
} from 'lucide-react';
import {
  venueApi,
  facilityApi,
  bookingApi,
  VenueDto,
  FacilityDto,
  VenueDailyAvailabilityResponse,
  FacilityAvailabilityResponse,
  SlotDto,
  BookingDto
} from '@/lib/api/venue';

export default function VenueCalendarPage() {
  const params = useParams();
  const orgId = params?.orgId as string;

  const [venue, setVenue] = useState<VenueDto | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [dailyData, setDailyData] = useState<VenueDailyAvailabilityResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFacilityId, setSelectedFacilityId] = useState<number | 'ALL'>('ALL');
  const [timeFilter, setTimeFilter] = useState<'ALL' | 'MORNING' | 'AFTERNOON' | 'EVENING'>('ALL');

  // Desktop View Controls State
  const [desktopSearchQuery, setDesktopSearchQuery] = useState('');
  const [desktopTimeFilter, setDesktopTimeFilter] = useState<'ALL' | 'MORNING' | 'AFTERNOON' | 'EVENING'>('ALL');
  const [desktopViewMode, setDesktopViewMode] = useState<'GRID' | 'TIMELINE'>('GRID');
  const [desktopDensity, setDesktopDensity] = useState<'COMFORTABLE' | 'COMPACT'>('COMFORTABLE');

  // Modals state
  const [activeSlotModal, setActiveSlotModal] = useState<{
    facility: FacilityAvailabilityResponse;
    slot: SlotDto;
  } | null>(null);

  const [bookingDetailsModal, setBookingDetailsModal] = useState<BookingDto | null>(null);
  const [loadingBookingDetails, setLoadingBookingDetails] = useState(false);

  // Walk-in Form State
  const [walkinName, setWalkinName] = useState('');
  const [walkinPhone, setWalkinPhone] = useState('');
  const [walkinSport, setWalkinSport] = useState('');
  const [walkinPaymentMethod, setWalkinPaymentMethod] = useState<'CASH' | 'UPI' | 'CARD'>('UPI');
  const [isSubmittingWalkin, setIsSubmittingWalkin] = useState(false);
  const [walkinError, setWalkinError] = useState<string | null>(null);

  // Quick Block State
  const [blockReason, setBlockReason] = useState('Owner / Admin Hold');
  const [isBlocking, setIsBlocking] = useState(false);
  const [modalTab, setModalTab] = useState<'BOOK' | 'BLOCK'>('BOOK');

  // Load Venue & Slots
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        let orgVenues = await venueApi.getVenuesByOrganization(orgId);
        let v = orgVenues?.data && orgVenues.data.length > 0 ? orgVenues.data[0] : null;

        if (!v) {
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
          await fetchAvailability(v.venueId, selectedDate);
        }
      } catch (err) {
        console.error('Failed to load venue calendar:', err);
      } finally {
        setLoading(false);
      }
    }
    if (orgId) {
      loadData();
    }
  }, [orgId, selectedDate]);

  const fetchAvailability = async (venueId: number, dateStr: string) => {
    try {
      setRefreshing(true);
      const res = await venueApi.getVenueAvailability(venueId, dateStr);
      if (res?.success && res.data) {
        setDailyData(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch availability:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleDateChange = (daysDelta: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + daysDelta);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  // 7-day date strip calculation
  const dateStrip = useMemo(() => {
    const base = new Date(selectedDate);
    const days = [];
    for (let i = -3; i <= 3; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = d.getDate();
      const monthName = d.toLocaleDateString('en-US', { month: 'short' });
      const isToday = dateStr === new Date().toISOString().split('T')[0];
      const isSelected = dateStr === selectedDate;
      days.push({ dateStr, dayName, dayNum, monthName, isToday, isSelected });
    }
    return days;
  }, [selectedDate]);

  const handleSlotClick = async (fac: FacilityAvailabilityResponse, slot: SlotDto) => {
    if (slot.status === 'AVAILABLE') {
      setWalkinName('');
      setWalkinPhone('');
      setWalkinSport(fac.facilityName || 'Badminton');
      setWalkinError(null);
      setModalTab('BOOK');
      setActiveSlotModal({ facility: fac, slot });
    } else if (slot.bookingUuid) {
      try {
        setLoadingBookingDetails(true);
        const res = await bookingApi.getBookingByUuid(slot.bookingUuid);
        if (res?.success && res.data) {
          setBookingDetailsModal(res.data);
        }
      } catch (err) {
        console.error('Error loading booking details:', err);
      } finally {
        setLoadingBookingDetails(false);
      }
    }
  };

  const handleWalkinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSlotModal || !venue) return;

    try {
      setIsSubmittingWalkin(true);
      setWalkinError(null);

      const res = await bookingApi.createBooking({
        venueId: venue.venueId,
        facilityId: activeSlotModal.facility.facilityId,
        guestName: walkinName.trim() || 'Walk-in Player',
        guestPhone: walkinPhone.trim(),
        bookingDate: selectedDate,
        startTime: activeSlotModal.slot.startTime,
        endTime: activeSlotModal.slot.endTime,
        sportName: walkinSport || 'Badminton',
        baseAmount: activeSlotModal.slot.price,
        totalAmount: activeSlotModal.slot.price,
        bookingSource: 'WALK_IN',
        paymentStatus: 'PAID',
        paymentMethod: walkinPaymentMethod,
        paidAmount: activeSlotModal.slot.price,
        notes: `Walk-in on-spot booking (${walkinPaymentMethod})`,
      });

      if (res?.success) {
        setActiveSlotModal(null);
        await fetchAvailability(venue.venueId, selectedDate);
      }
    } catch (err: any) {
      console.error('Booking failed:', err);
      setWalkinError(err?.message || 'Failed to complete walk-in reservation');
    } finally {
      setIsSubmittingWalkin(false);
    }
  };

  const handleBlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSlotModal || !venue) return;

    try {
      setIsBlocking(true);
      const res = await facilityApi.createBlock({
        venueId: venue.venueId,
        facilityId: activeSlotModal.facility.facilityId,
        blockType: 'OWNER_BLOCK',
        blockDate: selectedDate,
        startTime: activeSlotModal.slot.startTime,
        endTime: activeSlotModal.slot.endTime,
        reason: blockReason.trim() || 'Administrative Block',
      });

      if (res?.success) {
        setActiveSlotModal(null);
        await fetchAvailability(venue.venueId, selectedDate);
      }
    } catch (err: any) {
      console.error('Block failed:', err);
      setWalkinError(err?.message || 'Failed to block slot');
    } finally {
      setIsBlocking(false);
    }
  };

  const handleStatusChange = async (newStatus: any) => {
    if (!bookingDetailsModal || !venue) return;
    try {
      const res = await bookingApi.updateBookingStatus(bookingDetailsModal.bookingUuid, newStatus);
      if (res?.success) {
        setBookingDetailsModal(null);
        await fetchAvailability(venue.venueId, selectedDate);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const filteredFacilities = useMemo(() => {
    return dailyData?.facilities.filter((f) =>
      selectedFacilityId === 'ALL' ? true : f.facilityId === selectedFacilityId
    ) || [];
  }, [dailyData, selectedFacilityId]);

  // Distinct time slots for desktop grid rows
  const allTimeSlots = useMemo(() => {
    const slots: string[] = [];
    dailyData?.facilities.forEach((f) => {
      f.slots.forEach((s) => {
        const label = `${s.startTime.slice(0, 5)} - ${s.endTime.slice(0, 5)}`;
        if (!slots.includes(label)) {
          slots.push(label);
        }
      });
    });
    return slots;
  }, [dailyData]);

  // Slot calculations & stats
  const metrics = useMemo(() => {
    let totalSlots = 0;
    let availableCount = 0;
    let bookedCount = 0;
    let recurringCount = 0;
    let blockedCount = 0;
    let estRevenue = 0;

    dailyData?.facilities.forEach((f) => {
      f.slots.forEach((s) => {
        totalSlots++;
        if (s.status === 'AVAILABLE') availableCount++;
        else if (s.status === 'BOOKED') {
          bookedCount++;
          estRevenue += Number(s.price) || 0;
        } else if (s.status === 'RESERVED') {
          recurringCount++;
          estRevenue += Number(s.price) || 0;
        } else if (s.status === 'BLOCKED' || s.status === 'MAINTENANCE') {
          blockedCount++;
        }
      });
    });

    const occupancyPct = totalSlots > 0 ? Math.round(((bookedCount + recurringCount) / totalSlots) * 100) : 0;
    return { totalSlots, availableCount, bookedCount, recurringCount, blockedCount, estRevenue, occupancyPct };
  }, [dailyData]);

  // Format date for title
  const formattedDateTitle = useMemo(() => {
    try {
      const d = new Date(selectedDate);
      return d.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return selectedDate;
    }
  }, [selectedDate]);

  // 14-day date strip for desktop panoramic view (-3 to +10 days)
  const desktopDateStrip = useMemo(() => {
    const base = new Date(selectedDate);
    const days = [];
    for (let i = -3; i <= 10; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = d.getDate();
      const monthName = d.toLocaleDateString('en-US', { month: 'short' });
      const isToday = dateStr === new Date().toISOString().split('T')[0];
      const isSelected = dateStr === selectedDate;
      days.push({ dateStr, dayName, dayNum, monthName, isToday, isSelected });
    }
    return days;
  }, [selectedDate]);

  // Filtered time slots for desktop based on desktopTimeFilter
  const desktopFilteredTimeSlots = useMemo(() => {
    let slots = allTimeSlots;
    if (desktopTimeFilter !== 'ALL') {
      slots = slots.filter((timeWindow) => {
        const [startTimeStr] = timeWindow.split(' - ');
        const h = parseInt(startTimeStr.split(':')[0], 10);
        if (desktopTimeFilter === 'MORNING') return h < 12;
        if (desktopTimeFilter === 'AFTERNOON') return h >= 12 && h < 17;
        if (desktopTimeFilter === 'EVENING') return h >= 17;
        return true;
      });
    }
    return slots;
  }, [allTimeSlots, desktopTimeFilter]);

  const isCurrentDate = useMemo(() => {
    return selectedDate === new Date().toISOString().split('T')[0];
  }, [selectedDate]);

  const currentHour = useMemo(() => {
    return new Date().getHours();
  }, []);

  const getSportEmoji = (sportName?: string, facilityName?: string) => {
    const text = `${sportName || ''} ${facilityName || ''}`.toLowerCase();
    if (text.includes('badminton')) return '🏸';
    if (text.includes('tennis')) return '🎾';
    if (text.includes('football') || text.includes('turf') || text.includes('soccer')) return '⚽';
    if (text.includes('cricket') || text.includes('box')) return '🏏';
    if (text.includes('basketball')) return '🏀';
    if (text.includes('squash') || text.includes('pickleball')) return '🏓';
    if (text.includes('swimming') || text.includes('pool')) return '🏊';
    if (text.includes('volleyball')) return '🏐';
    return '🏟️';
  };

  const getPlayerInitials = (name?: string) => {
    if (!name) return 'PL';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const isSlotSearchMatch = (slot: SlotDto) => {
    if (!desktopSearchQuery.trim()) return true;
    const q = desktopSearchQuery.toLowerCase().trim();
    const name = (slot.customerName || '').toLowerCase();
    const num = (slot.bookingNumber || '').toLowerCase();
    const sport = (slot.sportName || '').toLowerCase();
    const reason = (slot.reason || '').toLowerCase();
    return name.includes(q) || num.includes(q) || sport.includes(q) || reason.includes(q);
  };

  return (
    <div className="min-h-screen space-y-4 md:space-y-6 pb-28 md:pb-16">
      {/* ─────────────────────────────────────────────────────────────
          1. TOP NAVIGATION / HEADER
      ────────────────────────────────────────────────────────────── */}

      {/* MOBILE APP HEADER (< md) */}
      <div className="block md:hidden">
        <div className="p-4 rounded-3xl border bg-gradient-to-b from-card via-card/90 to-card/60 backdrop-blur-xl relative overflow-hidden shadow-2xl space-y-4" style={{ borderColor: 'var(--athlon-border)' }}>
          {/* Ambient Background Glow */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* 1. Header Bar: Venue Title & Live Pill */}
          <div className="relative z-10 flex items-start justify-between gap-2">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <span className="flex h-1.5 w-1.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                </span>
                <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400">
                  Live Operations
                </span>
                <span className="text-[9px] text-foreground/30">•</span>
                <span className="text-[9px] font-bold text-foreground/60">{metrics.occupancyPct}% Booked</span>
              </div>

              <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
                <span>{venue?.name || 'Playzone'}</span>
              </h1>
              <p className="text-[11px] font-medium text-foreground/50">
                {formattedDateTitle}
              </p>
            </div>

            {/* Quick Actions Group */}
            <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
              <button
                onClick={() => handleDateChange(-1)}
                className="p-2 rounded-xl bg-surface border border-border text-foreground/70 active:scale-95 transition-all"
                title="Previous Day"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition-all border ${
                  selectedDate === new Date().toISOString().split('T')[0]
                    ? 'bg-primary text-black border-primary shadow-sm shadow-primary/25'
                    : 'bg-surface border-border text-foreground/80'
                }`}
              >
                Today
              </button>

              <button
                onClick={() => handleDateChange(1)}
                className="p-2 rounded-xl bg-surface border border-border text-foreground/70 active:scale-95 transition-all"
                title="Next Day"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => venue && fetchAvailability(venue.venueId, selectedDate)}
                className={`p-2 rounded-xl bg-surface border text-foreground/80 active:scale-95 transition-all ${
                  refreshing ? 'animate-spin text-primary border-primary/40' : 'border-border'
                }`}
                title="Refresh Matrix"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 2. 7-Day Interactive Date Strip */}
          <div className="relative z-10 flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar -mx-1 px-1">
            {dateStrip.map((item) => (
              <button
                key={item.dateStr}
                onClick={() => setSelectedDate(item.dateStr)}
                className={`shrink-0 py-2.5 px-3 rounded-2xl text-center transition-all duration-200 flex flex-col items-center min-w-[58px] relative ${
                  item.isSelected
                    ? 'bg-gradient-to-b from-emerald-400 via-primary to-emerald-500 text-black font-black shadow-lg shadow-emerald-500/30 scale-105 ring-2 ring-emerald-400/40'
                    : 'bg-surface/70 text-foreground/70 border border-border/80 hover:border-primary/40 active:scale-95'
                }`}
              >
                <span className={`text-[9px] uppercase tracking-wider font-extrabold leading-none ${item.isSelected ? 'text-black/80 font-black' : 'text-foreground/50'}`}>
                  {item.isToday ? 'Today' : item.dayName}
                </span>
                <span className="text-base font-black leading-none my-1">
                  {item.dayNum}
                </span>
                <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                  item.isSelected ? 'bg-black' : 'bg-emerald-400 shadow-sm shadow-emerald-400/50'
                }`} />
              </button>
            ))}
          </div>

          {/* 3. High-Tech Micro-Stats Bar (3 Glass Widgets) */}
          <div className="relative z-10 grid grid-cols-3 gap-2 pt-1 border-t border-white/5">
            {/* Available */}
            <div className="p-2.5 rounded-2xl bg-emerald-500/[0.06] border border-emerald-500/20 text-center space-y-0.5">
              <div className="flex items-center justify-center gap-1 text-[9px] font-black uppercase tracking-wider text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Available</span>
              </div>
              <div className="text-base font-black text-foreground">{metrics.availableCount}</div>
              <div className="text-[8px] text-foreground/50 font-bold">Ready Slots</div>
            </div>

            {/* Booked */}
            <div className="p-2.5 rounded-2xl bg-primary/[0.06] border border-primary/20 text-center space-y-0.5">
              <div className="flex items-center justify-center gap-1 text-[9px] font-black uppercase tracking-wider text-primary">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>Booked</span>
              </div>
              <div className="text-base font-black text-foreground">{metrics.bookedCount}</div>
              <div className="text-[8px] text-foreground/50 font-bold">Confirmed</div>
            </div>

            {/* Est Revenue */}
            <div className="p-2.5 rounded-2xl bg-cyan-500/[0.06] border border-cyan-500/20 text-center space-y-0.5">
              <div className="flex items-center justify-center gap-1 text-[9px] font-black uppercase tracking-wider text-cyan-400">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>Revenue</span>
              </div>
              <div className="text-base font-black text-foreground">₹{metrics.estRevenue.toLocaleString()}</div>
              <div className="text-[8px] text-foreground/50 font-bold">Projected</div>
            </div>
          </div>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════
          1. DESKTOP OPERATIONS HERO COCKPIT (md+)
      ══════════════════════════════════════════════════════════════ */}
      <div
        className="hidden md:block p-6 rounded-3xl border bg-gradient-to-r from-card via-card/90 to-card/70 backdrop-blur-xl relative overflow-hidden shadow-2xl"
        style={{ borderColor: 'var(--athlon-border)' }}
      >
        {/* Ambient Athletic Lighting */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none -mr-24 -mt-24" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -mb-32" />

        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          {/* Left: Venue Identity & Live Telemetry */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-wider shadow-sm shadow-emerald-500/10">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span>Live Arena Operations</span>
              </span>
              <span className="text-xs text-foreground/30">•</span>
              <span className="text-xs font-black text-foreground/70 px-2.5 py-0.5 rounded-lg bg-surface border border-border">
                {metrics.occupancyPct}% Occupancy
              </span>
              <span className="text-xs font-black text-primary px-2.5 py-0.5 rounded-lg bg-primary/10 border border-primary/20">
                {dailyData?.facilities.length || 0} Facilities Active
              </span>
            </div>

            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
                <span>{venue?.name || 'Playzone Sports Arena'}</span>
              </h1>
              <span className="text-xs px-2.5 py-1 rounded-xl bg-surface border border-border text-foreground/60 font-bold">
                {venue?.city || 'Sports Hub'}
              </span>
            </div>

            <p className="text-xs font-medium text-foreground/60 max-w-2xl flex items-center gap-2">
              <CalendarIcon className="w-3.5 h-3.5 text-primary" />
              <span>{formattedDateTitle}</span>
              <span className="text-foreground/30">•</span>
              <span>Real-time multi-court dispatch, instant walk-ins, and club batch reservations.</span>
            </p>
          </div>

          {/* Right: Date Stepper & Direct Action Hub */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Stepper with Native Date Picker */}
            <div
              className="flex items-center p-1.5 rounded-2xl border bg-background/90 shadow-inner backdrop-blur-md"
              style={{ borderColor: 'var(--athlon-border)' }}
            >
              <button
                onClick={() => handleDateChange(-1)}
                className="p-2 rounded-xl hover:bg-white/5 text-foreground/80 hover:text-foreground active:scale-95 transition-all"
                title="Previous Day"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all border mx-1 ${
                  selectedDate === new Date().toISOString().split('T')[0]
                    ? 'bg-primary text-black border-primary shadow-md shadow-primary/25'
                    : 'bg-surface border-border text-foreground/80 hover:text-foreground hover:bg-white/5'
                }`}
              >
                Today
              </button>

              <div className="relative flex items-center px-1">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent text-xs font-black text-foreground px-2 py-1 outline-none cursor-pointer"
                />
              </div>

              <button
                onClick={() => handleDateChange(1)}
                className="p-2 rounded-xl hover:bg-white/5 text-foreground/80 hover:text-foreground active:scale-95 transition-all"
                title="Next Day"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Refresh Live Matrix */}
            <button
              onClick={() => venue && fetchAvailability(venue.venueId, selectedDate)}
              className={`p-3 rounded-2xl border bg-surface/90 text-foreground/80 hover:text-foreground active:scale-95 transition-all ${
                refreshing ? 'animate-spin text-primary border-primary/50' : 'border-border hover:border-primary/40'
              }`}
              title="Refresh Matrix"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Quick Route Shortcuts to Modules */}
            <div className="flex items-center gap-1.5 pl-2 border-l border-white/10">
              <Link
                href={`/org/${orgId}/venue/bookings`}
                className="px-3 py-2.5 rounded-2xl border border-border bg-surface text-foreground/80 hover:text-foreground hover:border-primary/40 text-xs font-black flex items-center gap-1.5 transition-all shadow-sm"
              >
                <CalendarDays className="w-3.5 h-3.5 text-primary" />
                <span>Bookings</span>
              </Link>

              <Link
                href={`/org/${orgId}/venue/blocks`}
                className="px-3 py-2.5 rounded-2xl border border-border bg-surface text-foreground/80 hover:text-foreground hover:border-primary/40 text-xs font-black flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Lock className="w-3.5 h-3.5 text-red-400" />
                <span>Holds</span>
              </Link>

              <Link
                href={`/org/${orgId}/venue/facilities`}
                className="px-3.5 py-2.5 rounded-2xl bg-primary text-black font-black text-xs hover:brightness-110 shadow-lg shadow-primary/20 flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add Facility</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 14-DAY EXECUTIVE HORIZONTAL STRIP */}
        <div
          className="mt-6 pt-5 border-t flex items-center gap-2.5 overflow-x-auto pb-1 hide-scrollbar"
          style={{ borderColor: 'var(--athlon-border)' }}
        >
          {desktopDateStrip.map((item) => (
            <button
              key={item.dateStr}
              onClick={() => setSelectedDate(item.dateStr)}
              className={`shrink-0 py-3 px-4 rounded-2xl text-center transition-all duration-200 flex flex-col items-center min-w-[76px] relative border ${
                item.isSelected
                  ? 'bg-gradient-to-b from-primary via-primary/95 to-primary/90 text-black border-primary font-black shadow-xl shadow-primary/25 scale-105 ring-2 ring-primary/40'
                  : 'bg-background/80 text-foreground/70 border-border hover:border-primary/40 hover:text-foreground hover:bg-surface/60'
              }`}
            >
              <span
                className={`text-[10px] uppercase tracking-wider font-extrabold leading-none ${
                  item.isSelected ? 'text-black/80 font-black' : 'text-foreground/50'
                }`}
              >
                {item.dayName}
              </span>
              <span className="text-lg font-black leading-tight my-1">
                {item.dayNum}
              </span>
              <div className="flex items-center gap-1">
                <span
                  className={`text-[9px] font-bold ${
                    item.isSelected ? 'text-black/70' : 'text-foreground/40'
                  }`}
                >
                  {item.monthName}
                </span>
                {item.isToday && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      item.isSelected ? 'bg-black' : 'bg-primary shadow-sm shadow-primary/80'
                    }`}
                  />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 2. EXECUTIVE BENTO KPI ANALYTICS BAR (md+) */}
      <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Live Occupancy & Utilization */}
        <div
          className="p-5 rounded-3xl border bg-gradient-to-br from-card via-card/90 to-card/60 backdrop-blur-xl relative overflow-hidden shadow-lg group hover:border-emerald-500/40 transition-all"
          style={{ borderColor: 'var(--athlon-border)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Court Occupancy</span>
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-inner">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <div className="text-3xl font-black text-foreground tracking-tight">{metrics.occupancyPct}%</div>
            <span className="text-xs font-bold text-foreground/50">Capacity booked</span>
          </div>
          <div className="mt-3.5 space-y-1.5">
            <div className="w-full h-2 rounded-full bg-surface border border-white/5 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-primary transition-all duration-500"
                style={{ width: `${Math.min(100, metrics.occupancyPct)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-foreground/50 font-bold">
              <span>{metrics.bookedCount + metrics.recurringCount} Slots Utilized</span>
              <span>{metrics.totalSlots} Total</span>
            </div>
          </div>
        </div>

        {/* Card 2: Confirmed Bookings */}
        <div
          className="p-5 rounded-3xl border bg-gradient-to-br from-card via-card/90 to-card/60 backdrop-blur-xl relative overflow-hidden shadow-lg group hover:border-primary/40 transition-all"
          style={{ borderColor: 'var(--athlon-border)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span>Confirmed Bookings</span>
            </span>
            <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shadow-inner">
              <CalendarDays className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <div className="text-3xl font-black text-foreground tracking-tight">{metrics.bookedCount}</div>
            <span className="text-xs font-bold text-primary">Player reservations</span>
          </div>
          <div className="mt-3.5 flex items-center gap-2 pt-2 border-t border-white/5 text-[11px] text-foreground/60 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>{metrics.availableCount} open slots still ready for dispatch</span>
          </div>
        </div>

        {/* Card 3: Recurring Academy Batches & Holds */}
        <div
          className="p-5 rounded-3xl border bg-gradient-to-br from-card via-card/90 to-card/60 backdrop-blur-xl relative overflow-hidden shadow-lg group hover:border-purple-500/40 transition-all"
          style={{ borderColor: 'var(--athlon-border)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              <span>Club & Batch Holds</span>
            </span>
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shadow-inner">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <div className="text-3xl font-black text-foreground tracking-tight">
              {metrics.recurringCount}
              <span className="text-lg font-bold text-foreground/40 font-mono ml-1">/ {metrics.blockedCount} blk</span>
            </div>
            <span className="text-xs font-bold text-purple-300">Academy series</span>
          </div>
          <div className="mt-3.5 flex items-center gap-2 pt-2 border-t border-white/5 text-[11px] text-foreground/60 font-medium">
            <Shield className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span>Coaching sessions & administrative blocks</span>
          </div>
        </div>

        {/* Card 4: Daily Projected Revenue */}
        <div
          className="p-5 rounded-3xl border bg-gradient-to-br from-card via-card/90 to-card/60 backdrop-blur-xl relative overflow-hidden shadow-lg group hover:border-cyan-500/40 transition-all"
          style={{ borderColor: 'var(--athlon-border)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>Daily Projected Yield</span>
            </span>
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shadow-inner">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <div className="text-3xl font-black text-foreground tracking-tight">
              ₹{metrics.estRevenue.toLocaleString()}
            </div>
            <span className="text-xs font-bold text-cyan-400">Total estimated</span>
          </div>
          <div className="mt-3.5 flex items-center gap-2 pt-2 border-t border-white/5 text-[11px] text-foreground/60 font-medium">
            <IndianRupee className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>
              {dailyData?.facilities.length
                ? `₹${Math.round(metrics.estRevenue / (dailyData.facilities.length || 1)).toLocaleString()} / facility avg`
                : 'Based on locked slots'}
            </span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          MOBILE ONLY: FILTERS & FACILITY SELECTOR (< md)
      ────────────────────────────────────────────────────────────── */}
      <div className="block md:hidden p-2.5 rounded-2xl border bg-card/40 flex flex-col gap-2.5" style={{ borderColor: 'var(--athlon-border)' }}>
        {/* Facility Filter Pills */}
        <div className="flex items-center gap-1.5 md:gap-2 overflow-x-auto pb-0.5 md:pb-0 hide-scrollbar -mx-1 px-1">
          <button
            onClick={() => setSelectedFacilityId('ALL')}
            className={`px-3 md:px-3.5 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 border ${
              selectedFacilityId === 'ALL'
                ? 'bg-primary text-black border-primary shadow-sm'
                : 'bg-background border-border text-foreground/70 hover:text-foreground'
            }`}
          >
            All Courts ({dailyData?.facilities.length || 0})
          </button>

          {dailyData?.facilities.map((fac) => (
            <button
              key={fac.facilityId}
              onClick={() => setSelectedFacilityId(fac.facilityId)}
              className={`px-3 md:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 border flex items-center gap-1.5 ${
                selectedFacilityId === fac.facilityId
                  ? 'bg-primary text-black border-primary font-black shadow-sm'
                  : 'bg-background border-border text-foreground/70 hover:text-foreground'
              }`}
            >
              <span>{fac.facilityName}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${selectedFacilityId === fac.facilityId ? 'bg-black/20 text-black' : 'bg-white/5 text-foreground/50'}`}>
                {fac.slots.filter((s) => s.status === 'AVAILABLE').length} free
              </span>
            </button>
          ))}
        </div>

        {/* Legend Badges */}
        <div className="flex flex-wrap items-center gap-2.5 md:gap-3 text-[10px] md:text-[11px] font-bold shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-500/50" />
            <span className="text-foreground/70">Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary shadow-sm shadow-primary/50" />
            <span className="text-foreground/70">Booked</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-400 shadow-sm shadow-purple-500/50" />
            <span className="text-foreground/70">Series</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-400 shadow-sm shadow-red-500/50" />
            <span className="text-foreground/70">Blocked</span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. MAIN VIEW: DESKTOP MATRIX vs MOBILE TIMELINE
      ────────────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="h-96 rounded-3xl bg-card border border-border animate-pulse flex flex-col items-center justify-center gap-3 text-muted-foreground font-bold text-sm">
          <Activity className="w-6 h-6 animate-spin text-primary" />
          <span>Synchronizing live court availability matrix...</span>
        </div>
      ) : filteredFacilities.length === 0 ? (
        <div className="p-8 md:p-12 text-center rounded-3xl bg-card border border-border space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-inner">
            <CalendarDays className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-black text-foreground">No Facilities Configured Yet</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
            Add your badminton courts, tennis courts or football turfs to unlock real-time slot bookings and player check-ins.
          </p>
          <Link
            href={`/org/${orgId}/venue/facilities`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-black font-black text-xs hover:brightness-110 shadow-lg shadow-primary/20"
          >
            <Plus className="w-4 h-4" /> Add First Court / Facility
          </Link>
        </div>
      ) : (
        <>
          {/* ═════════════════════════════════════════════════════════
              A. DESKTOP VIEW: HIGH-TECH ARENA COMMAND CENTER & DISPATCH MATRIX (md+)
          ══════════════════════════════════════════════════════════ */}
          <div className="hidden md:block space-y-6">
            {/* 1. COMMAND & CONTROL TOOLBAR */}
            <div
              className="p-4 rounded-3xl border bg-card/60 backdrop-blur-xl space-y-4 shadow-md"
              style={{ borderColor: 'var(--athlon-border)' }}
            >
              {/* Top Row: Facility Selector Pills & Search Bar */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                {/* Facility Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
                  <button
                    onClick={() => setSelectedFacilityId('ALL')}
                    className={`px-4 py-2 rounded-2xl text-xs font-black transition-all shrink-0 border flex items-center gap-2 ${
                      selectedFacilityId === 'ALL'
                        ? 'bg-primary text-black border-primary shadow-md shadow-primary/20 scale-[1.02]'
                        : 'bg-surface border-border text-foreground/70 hover:text-foreground hover:border-primary/40'
                    }`}
                  >
                    <span>🏟️ All Facilities</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-lg ${
                        selectedFacilityId === 'ALL' ? 'bg-black/20 text-black' : 'bg-background text-foreground/50'
                      }`}
                    >
                      {dailyData?.facilities.length || 0}
                    </span>
                  </button>

                  {dailyData?.facilities.map((fac) => {
                    const freeCount = fac.slots.filter((s) => s.status === 'AVAILABLE').length;
                    const isSelected = selectedFacilityId === fac.facilityId;
                    const emoji = getSportEmoji(undefined, fac.facilityName);

                    return (
                      <button
                        key={fac.facilityId}
                        onClick={() => setSelectedFacilityId(fac.facilityId)}
                        className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 border flex items-center gap-2 ${
                          isSelected
                            ? 'bg-primary text-black border-primary font-black shadow-md shadow-primary/20 scale-[1.02]'
                            : 'bg-surface border-border text-foreground/70 hover:text-foreground hover:border-primary/40'
                        }`}
                      >
                        <span>{emoji} {fac.facilityName}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-lg font-black ${
                            isSelected ? 'bg-black/20 text-black' : 'bg-background text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          {freeCount} free
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Live Search Bar */}
                <div className="relative min-w-[280px]">
                  <Search className="w-4 h-4 text-foreground/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Find player, booking # or sport..."
                    value={desktopSearchQuery}
                    onChange={(e) => setDesktopSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 rounded-2xl bg-background/80 border border-border text-xs font-bold text-foreground placeholder:text-foreground/40 outline-none focus:border-primary transition-all shadow-inner"
                  />
                  {desktopSearchQuery && (
                    <button
                      onClick={() => setDesktopSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground text-xs font-black"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Bottom Row: Time Period Filter, Density & View Mode Controls, Legend */}
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 pt-3 border-t border-white/5">
                {/* Time Period Filter Pills */}
                <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-background border border-border shrink-0">
                  {(
                    [
                      { id: 'ALL', label: 'All Day (24h)', icon: Sparkles },
                      { id: 'MORNING', label: 'Morning (06-12)', icon: Sunrise },
                      { id: 'AFTERNOON', label: 'Afternoon (12-17)', icon: Sun },
                      { id: 'EVENING', label: 'Prime Evening (17-23)', icon: Moon },
                    ] as const
                  ).map((t) => {
                    const Icon = t.icon;
                    const isActive = desktopTimeFilter === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setDesktopTimeFilter(t.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                          isActive
                            ? 'bg-primary text-black shadow-md shadow-primary/20 scale-[1.02]'
                            : 'text-foreground/60 hover:text-foreground hover:bg-white/5'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{t.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* View Mode & Density Toggles + Legend */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Density Toggle */}
                  <div className="flex items-center gap-1 p-1 rounded-2xl bg-background border border-border">
                    <button
                      onClick={() => setDesktopDensity('COMFORTABLE')}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                        desktopDensity === 'COMFORTABLE' ? 'bg-surface text-foreground font-black shadow-sm' : 'text-foreground/50'
                      }`}
                      title="Comfortable card height"
                    >
                      Comfortable
                    </button>
                    <button
                      onClick={() => setDesktopDensity('COMPACT')}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                        desktopDensity === 'COMPACT' ? 'bg-surface text-foreground font-black shadow-sm' : 'text-foreground/50'
                      }`}
                      title="Compact dense view"
                    >
                      Compact
                    </button>
                  </div>

                  {/* View Mode Toggle: Grid vs Timeline */}
                  <div className="flex items-center gap-1 p-1 rounded-2xl bg-background border border-border">
                    <button
                      onClick={() => setDesktopViewMode('GRID')}
                      className={`px-3 py-1 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                        desktopViewMode === 'GRID' ? 'bg-primary text-black shadow-md' : 'text-foreground/60 hover:text-foreground'
                      }`}
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      <span>Matrix</span>
                    </button>
                    <button
                      onClick={() => setDesktopViewMode('TIMELINE')}
                      className={`px-3 py-1 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                        desktopViewMode === 'TIMELINE' ? 'bg-primary text-black shadow-md' : 'text-foreground/60 hover:text-foreground'
                      }`}
                    >
                      <List className="w-3.5 h-3.5" />
                      <span>Courts Feed</span>
                    </button>
                  </div>

                  {/* Status Legend */}
                  <div className="hidden 2xl:flex items-center gap-3 pl-3 border-l border-white/10 text-xs font-bold">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                      <span className="text-foreground/70">Available</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-primary shadow-sm shadow-primary/50" />
                      <span className="text-foreground/70">Booked</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-400 shadow-sm shadow-purple-400/50" />
                      <span className="text-foreground/70">Series</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-400 shadow-sm shadow-red-400/50" />
                      <span className="text-foreground/70">Hold / Block</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. MAIN SCHEDULER VIEW */}
            {desktopViewMode === 'GRID' ? (
              /* ──────── GRID MATRIX SCHEDULER TABLE ──────── */
              <div
                className="bg-card rounded-3xl border overflow-hidden shadow-2xl transition-all"
                style={{ borderColor: 'var(--athlon-border)' }}
              >
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b bg-surface/90 backdrop-blur-md sticky top-0 z-20" style={{ borderColor: 'var(--athlon-border)' }}>
                        {/* Time Window Column Header */}
                        <th
                          className="p-4 text-xs font-black uppercase tracking-wider text-muted-foreground w-48 shrink-0 border-r bg-surface"
                          style={{ borderColor: 'var(--athlon-border)' }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-primary" />
                              <span>Time Slot</span>
                            </div>
                            <span className="text-[10px] font-bold text-foreground/40 font-mono">
                              {desktopFilteredTimeSlots.length} rows
                            </span>
                          </div>
                        </th>

                        {/* Facility Court Columns Headers */}
                        {filteredFacilities.map((fac) => {
                          const freeCount = fac.slots.filter((s) => s.status === 'AVAILABLE').length;
                          const bookedCount = fac.slots.filter((s) => s.status === 'BOOKED' || s.status === 'RESERVED').length;
                          const occupancy = fac.slots.length > 0 ? Math.round((bookedCount / fac.slots.length) * 100) : 0;
                          const emoji = getSportEmoji(undefined, fac.facilityName);

                          return (
                            <th
                              key={fac.facilityId}
                              className="p-4 text-xs font-black text-foreground min-w-[240px] border-r last:border-r-0"
                              style={{ borderColor: 'var(--athlon-border)' }}
                            >
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="text-base">{emoji}</span>
                                    <div>
                                      <div className="text-sm font-black text-foreground tracking-tight">{fac.facilityName}</div>
                                      <div className="text-[10px] text-foreground/50 font-bold">Standard Arena Court</div>
                                    </div>
                                  </div>
                                  <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
                                    {fac.slotDurationMinutes}m
                                  </span>
                                </div>

                                {/* Mini Court Occupancy Meter */}
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between text-[10px] font-bold text-foreground/50">
                                    <span className="text-emerald-400 font-extrabold">{freeCount} Available</span>
                                    <span>{occupancy}% Booked</span>
                                  </div>
                                  <div className="w-full h-1.5 rounded-full bg-background border border-white/5 overflow-hidden">
                                    <div
                                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-primary to-purple-500"
                                      style={{ width: `${occupancy}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>

                    <tbody>
                      {desktopFilteredTimeSlots.map((timeWindow) => {
                        const [startTimeStr] = timeWindow.split(' - ');
                        const hourNum = parseInt(startTimeStr.split(':')[0], 10);
                        const isPeakHour = hourNum >= 18 && hourNum <= 22;
                        const isNowHour = isCurrentDate && hourNum === currentHour;
                        const periodIcon =
                          hourNum < 12 ? (
                            <Sunrise className="w-3.5 h-3.5 text-amber-400" />
                          ) : hourNum < 17 ? (
                            <Sun className="w-3.5 h-3.5 text-yellow-400" />
                          ) : (
                            <Moon className="w-3.5 h-3.5 text-indigo-400" />
                          );

                        return (
                          <tr
                            key={timeWindow}
                            className={`border-b transition-colors group ${
                              isNowHour ? 'bg-primary/[0.03]' : 'hover:bg-white/[0.02]'
                            }`}
                            style={{ borderColor: 'var(--athlon-border)' }}
                          >
                            {/* Sticky Time Header Column */}
                            <td
                              className="p-3.5 text-xs font-black text-foreground shrink-0 border-r bg-background/50 relative"
                              style={{ borderColor: 'var(--athlon-border)' }}
                            >
                              {isNowHour && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary shadow-sm shadow-primary animate-pulse" />
                              )}
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  {periodIcon}
                                  <span className="font-mono text-xs">{timeWindow}</span>
                                </div>
                                {isPeakHour && (
                                  <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-0.5">
                                    <Flame className="w-2.5 h-2.5" />
                                    <span>PEAK</span>
                                  </span>
                                )}
                              </div>
                              {isNowHour && (
                                <div className="text-[9px] font-black text-primary uppercase tracking-wider flex items-center gap-1 mt-0.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                                  <span>Current Window</span>
                                </div>
                              )}
                            </td>

                            {/* Court Slots for this Time Window */}
                            {filteredFacilities.map((fac) => {
                              const slot = fac.slots.find((s) => s.startTime.slice(0, 5) === startTimeStr);

                              if (!slot) {
                                return (
                                  <td
                                    key={fac.facilityId}
                                    className="p-2 border-r last:border-r-0 text-center text-xs text-foreground/20 font-mono"
                                    style={{ borderColor: 'var(--athlon-border)' }}
                                  >
                                    —
                                  </td>
                                );
                              }

                              const isAvail = slot.status === 'AVAILABLE';
                              const isBooked = slot.status === 'BOOKED';
                              const isHeld = slot.status === 'HELD';
                              const isBlocked = slot.status === 'BLOCKED';
                              const isMaint = slot.status === 'MAINTENANCE';
                              const isReserved = slot.status === 'RESERVED';
                              const matchesSearch = isSlotSearchMatch(slot);
                              const isDimmed = desktopSearchQuery.trim() !== '' && !matchesSearch;

                              const heightClass = desktopDensity === 'COMPACT' ? 'min-h-[58px] p-2.5' : 'min-h-[76px] p-3';

                              return (
                                <td
                                  key={fac.facilityId}
                                  className={`p-2 border-r last:border-r-0 transition-opacity ${
                                    isDimmed ? 'opacity-25 hover:opacity-100' : 'opacity-100'
                                  }`}
                                  style={{ borderColor: 'var(--athlon-border)' }}
                                >
                                  <button
                                    onClick={() => handleSlotClick(fac, slot)}
                                    className={`w-full rounded-2xl border text-left transition-all duration-200 active:scale-[0.98] flex flex-col justify-between ${heightClass} shadow-sm relative overflow-hidden group/slot ${
                                      isAvail
                                        ? 'bg-emerald-500/[0.06] border-emerald-500/25 text-emerald-400 hover:border-emerald-400 hover:bg-emerald-500/15 hover:shadow-lg hover:shadow-emerald-500/10'
                                        : isBooked
                                        ? 'bg-primary/[0.08] border-primary/35 text-foreground hover:border-primary hover:bg-primary/[0.14] hover:shadow-md hover:shadow-primary/10'
                                        : isReserved
                                        ? 'bg-purple-500/[0.08] border-purple-500/35 text-purple-300 hover:border-purple-400 hover:bg-purple-500/[0.14]'
                                        : isBlocked
                                        ? 'bg-red-500/[0.07] border-red-500/30 text-red-400 hover:bg-red-500/[0.12]'
                                        : isMaint
                                        ? 'bg-amber-500/[0.07] border-amber-500/30 text-amber-400 hover:bg-amber-500/[0.12]'
                                        : 'bg-amber-500/[0.07] border-amber-500/30 text-amber-300'
                                    } ${
                                      desktopSearchQuery.trim() !== '' && matchesSearch
                                        ? 'ring-2 ring-primary scale-[1.01] shadow-lg shadow-primary/20'
                                        : ''
                                    }`}
                                  >
                                    {/* Slot Top Bar */}
                                    <div className="flex items-center justify-between gap-1 w-full">
                                      {isAvail ? (
                                        <div className="flex items-center gap-1.5">
                                          <span className="text-sm font-black text-emerald-400 tracking-tight">
                                            ₹{slot.price}
                                          </span>
                                          <span className="text-[9px] font-black text-emerald-400/80 px-1.5 py-0.2 rounded bg-emerald-500/20 uppercase tracking-wider">
                                            {slot.pricingType}
                                          </span>
                                        </div>
                                      ) : isBooked ? (
                                        <div className="flex items-center gap-1.5 min-w-0">
                                          <div className="w-5 h-5 rounded-md bg-primary text-black font-black text-[10px] flex items-center justify-center shrink-0">
                                            {getPlayerInitials(slot.customerName)}
                                          </div>
                                          <span className="text-xs font-black text-foreground truncate">
                                            {slot.customerName || 'Confirmed Player'}
                                          </span>
                                        </div>
                                      ) : isReserved ? (
                                        <div className="flex items-center gap-1 min-w-0">
                                          <span className="text-xs">🔁</span>
                                          <span className="text-xs font-black text-purple-300 truncate">
                                            {slot.reason || 'Recurring Series'}
                                          </span>
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-1.5 min-w-0 text-red-400">
                                          <Lock className="w-3.5 h-3.5 shrink-0" />
                                          <span className="text-xs font-black truncate">
                                            {slot.reason || (isMaint ? 'Maintenance' : 'Admin Hold')}
                                          </span>
                                        </div>
                                      )}

                                      {/* Right Badge */}
                                      <div>
                                        {isAvail ? (
                                          <span className="opacity-0 group-hover/slot:opacity-100 transition-opacity text-[10px] font-black text-emerald-400 flex items-center gap-0.5">
                                            <span>+ Book</span>
                                          </span>
                                        ) : isBooked ? (
                                          <span className="text-[9px] font-black text-primary px-1.5 py-0.5 rounded bg-primary/20 border border-primary/30">
                                            PAID
                                          </span>
                                        ) : isReserved ? (
                                          <span className="text-[9px] font-black text-purple-400 px-1.5 py-0.5 rounded bg-purple-500/20 border border-purple-500/30">
                                            SERIES
                                          </span>
                                        ) : isHeld ? (
                                          <span className="text-[9px] font-black text-amber-400 px-1.5 py-0.5 rounded bg-amber-500/20">
                                            HELD
                                          </span>
                                        ) : null}
                                      </div>
                                    </div>

                                    {/* Slot Bottom Meta Line */}
                                    <div className="text-[10px] text-foreground/50 flex items-center justify-between pt-1 border-t border-white/5 mt-1 w-full font-medium">
                                      <span className="truncate flex items-center gap-1">
                                        {isAvail ? (
                                          <span className="text-emerald-400/70 font-bold group-hover/slot:text-emerald-400">
                                            Instant Walk-In
                                          </span>
                                        ) : (
                                          <span>{slot.sportName || 'Court Booked'}</span>
                                        )}
                                      </span>
                                      {slot.bookingNumber && (
                                        <span className="font-mono text-[9px] text-primary/80 font-bold group-hover/slot:text-primary">
                                          #{slot.bookingNumber.slice(-4)}
                                        </span>
                                      )}
                                    </div>
                                  </button>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* ──────── TIMELINE STREAM VIEW (Court by Court) ──────── */
              <div className="space-y-4">
                {filteredFacilities.map((fac) => {
                  const freeCount = fac.slots.filter((s) => s.status === 'AVAILABLE').length;
                  const emoji = getSportEmoji(undefined, fac.facilityName);

                  return (
                    <div
                      key={fac.facilityId}
                      className="p-5 rounded-3xl border bg-card/80 backdrop-blur-xl space-y-4 shadow-xl"
                      style={{ borderColor: 'var(--athlon-border)' }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center text-lg">
                            {emoji}
                          </div>
                          <div>
                            <h3 className="text-base font-black text-foreground">{fac.facilityName}</h3>
                            <p className="text-xs text-foreground/50 font-bold">
                              {freeCount} of {fac.slots.length} slots free today • {fac.slotDurationMinutes} min blocks
                            </p>
                          </div>
                        </div>
                        <span className="px-3 py-1 rounded-xl bg-surface border border-border text-xs font-black text-foreground/80">
                          Standard Arena Court
                        </span>
                      </div>

                      {/* Horizontal Slots Ribbon */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
                        {fac.slots.map((slot, sIdx) => {
                          const isAvail = slot.status === 'AVAILABLE';
                          const isBooked = slot.status === 'BOOKED';
                          const isReserved = slot.status === 'RESERVED';

                          return (
                            <div
                              key={sIdx}
                              onClick={() => handleSlotClick(fac, slot)}
                              className={`p-3 rounded-2xl border cursor-pointer transition-all active:scale-95 space-y-1.5 ${
                                isAvail
                                  ? 'bg-emerald-500/[0.08] border-emerald-500/30 hover:border-emerald-400 hover:bg-emerald-500/15'
                                  : isBooked
                                  ? 'bg-primary/[0.08] border-primary/30 hover:border-primary'
                                  : isReserved
                                  ? 'bg-purple-500/[0.08] border-purple-500/30 hover:border-purple-400'
                                  : 'bg-red-500/[0.08] border-red-500/30'
                              }`}
                            >
                              <div className="flex items-center justify-between text-xs font-mono font-black text-foreground">
                                <span>{slot.startTime.slice(0, 5)}</span>
                                {isAvail ? (
                                  <span className="text-emerald-400 font-sans">₹{slot.price}</span>
                                ) : (
                                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-primary/20 text-primary font-sans">
                                    {slot.status}
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] font-bold text-foreground/70 truncate">
                                {isAvail ? '+ Book' : slot.customerName || slot.reason || 'Booked'}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ═════════════════════════════════════════════════════════
              B. MOBILE VIEW: PREMIUM NATIVE SPORTS APP SLOTS STREAM (< md)
          ══════════════════════════════════════════════════════════ */}
          <div className="block md:hidden space-y-3">
            {/* Period Filter Capsule Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-card border border-border">
              {(['ALL', 'MORNING', 'AFTERNOON', 'EVENING'] as const).map((t) => {
                const label = t === 'ALL' ? 'All Day' : t === 'MORNING' ? 'Morning' : t === 'AFTERNOON' ? 'Afternoon' : 'Evening';
                const icon = t === 'MORNING' ? '🌅' : t === 'AFTERNOON' ? '☀️' : t === 'EVENING' ? '🌙' : '⚡';
                return (
                  <button
                    key={t}
                    onClick={() => setTimeFilter(t)}
                    className={`flex-1 py-1.5 rounded-xl text-[10px] font-black transition-all flex items-center justify-center gap-1 ${
                      timeFilter === t
                        ? 'bg-primary text-black shadow-md shadow-primary/20'
                        : 'text-foreground/60 hover:text-foreground'
                    }`}
                  >
                    <span>{icon}</span>
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>

            {/* Mobile Court Feed */}
            <div className="space-y-3">
              {filteredFacilities.map((fac) => {
                const slotsToRender = fac.slots.filter((s) => {
                  if (timeFilter === 'ALL') return true;
                  const h = parseInt(s.startTime.split(':')[0], 10);
                  if (timeFilter === 'MORNING') return h < 12;
                  if (timeFilter === 'AFTERNOON') return h >= 12 && h < 17;
                  if (timeFilter === 'EVENING') return h >= 17;
                  return true;
                });

                const availableSlotsCount = slotsToRender.filter((s) => s.status === 'AVAILABLE').length;

                return (
                  <div key={fac.facilityId} className="p-3.5 rounded-3xl border bg-card/90 backdrop-blur-md space-y-3 shadow-md" style={{ borderColor: 'var(--athlon-border)' }}>
                    {/* Court Subhead */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-black text-xs">
                          🏸
                        </div>
                        <div>
                          <h3 className="text-sm font-black text-foreground">{fac.facilityName}</h3>
                          <p className="text-[10px] text-foreground/50 font-bold">
                            {availableSlotsCount} of {slotsToRender.length} slots free
                          </p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-lg bg-surface border border-border text-[9px] font-black text-foreground/70">
                        {fac.slotDurationMinutes} min
                      </span>
                    </div>

                    {/* Touch-Friendly Slot Cards */}
                    {slotsToRender.length === 0 ? (
                      <div className="p-6 text-center text-xs text-foreground/40 font-bold">
                        No slots in this time period
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {slotsToRender.map((slot, sIdx) => {
                          const isAvail = slot.status === 'AVAILABLE';
                          const isBooked = slot.status === 'BOOKED';
                          const isReserved = slot.status === 'RESERVED';
                          const isBlocked = slot.status === 'BLOCKED' || slot.status === 'MAINTENANCE';

                          return (
                            <div
                              key={sIdx}
                              onClick={() => handleSlotClick(fac, slot)}
                              className={`p-3 rounded-2xl border transition-all active:scale-[0.98] flex items-center justify-between cursor-pointer relative overflow-hidden ${
                                isAvail
                                  ? 'bg-emerald-500/[0.07] border-emerald-500/30 hover:border-emerald-500'
                                  : isBooked
                                  ? 'bg-primary/[0.07] border-primary/30'
                                  : isReserved
                                  ? 'bg-purple-500/[0.07] border-purple-500/30'
                                  : 'bg-red-500/[0.07] border-red-500/30'
                              }`}
                            >
                              {/* Left Time & Status Tag */}
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center border font-mono ${
                                  isAvail
                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                    : isBooked
                                    ? 'bg-primary/10 border-primary/20 text-primary'
                                    : isReserved
                                    ? 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                                }`}>
                                  <Clock className="w-3.5 h-3.5" />
                                  <span className="text-[8px] font-black leading-none mt-0.5">
                                    {slot.startTime.slice(0, 2)}:00
                                  </span>
                                </div>

                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-black text-foreground">
                                      {slot.startTime.slice(0, 5)} - {slot.endTime.slice(0, 5)}
                                    </span>
                                  </div>

                                  <div className="text-[11px] font-bold flex items-center gap-1.5">
                                    {isAvail ? (
                                      <span className="text-emerald-400 font-black">
                                        ₹{slot.price} • Available
                                      </span>
                                    ) : isBooked ? (
                                      <span className="text-primary font-bold truncate max-w-[140px]">
                                        👤 {slot.customerName || 'Confirmed Player'}
                                      </span>
                                    ) : isReserved ? (
                                      <span className="text-purple-400 font-bold truncate max-w-[140px]">
                                        🔁 {slot.reason || 'Recurring Series'}
                                      </span>
                                    ) : (
                                      <span className="text-red-400 font-bold">
                                        🔒 {slot.reason || 'Blocked'}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Right Action Button / Indicator */}
                              <div>
                                {isAvail ? (
                                  <button className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 text-black font-black text-xs shadow-md shadow-emerald-500/20 flex items-center gap-1">
                                    <span>Book</span>
                                    <Plus className="w-3.5 h-3.5" />
                                  </button>
                                ) : isBooked ? (
                                  <button className="px-3 py-1.5 rounded-xl bg-primary/20 text-primary border border-primary/30 font-bold text-xs flex items-center gap-1">
                                    <span>View</span>
                                    <ArrowRight className="w-3 h-3" />
                                  </button>
                                ) : (
                                  <div className="p-2 rounded-xl bg-white/5 text-foreground/40">
                                    <Lock className="w-3.5 h-3.5" />
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. NATIVE MOBILE BOTTOM-SHEET / DESKTOP MODAL (WALK-IN / BLOCK)
      ────────────────────────────────────────────────────────────── */}
      {activeSlotModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="bg-card border w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 relative animate-in slide-in-from-bottom-6 sm:zoom-in-95 max-h-[92vh] overflow-y-auto" style={{ borderColor: 'var(--athlon-border)' }}>
            {/* Sheet Drag Handle for Mobile */}
            <div className="w-12 h-1.5 bg-foreground/20 rounded-full mx-auto sm:hidden -mt-1 mb-2" />

            <div className="flex items-center justify-between border-b pb-3.5" style={{ borderColor: 'var(--athlon-border)' }}>
              <div>
                <h3 className="text-base sm:text-lg font-black text-foreground">
                  {modalTab === 'BOOK' ? 'Walk-in Player Booking' : 'Block Time Slot'}
                </h3>
                <p className="text-[11px] sm:text-xs text-foreground/60 font-medium">
                  {activeSlotModal.facility.facilityName} • {formattedDateTitle} ({activeSlotModal.slot.startTime.slice(0, 5)} - {activeSlotModal.slot.endTime.slice(0, 5)})
                </p>
              </div>
              <button
                onClick={() => setActiveSlotModal(null)}
                className="p-1.5 rounded-xl hover:bg-white/5 text-muted-foreground hover:text-foreground"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Tab Switcher */}
            <div className="flex rounded-2xl bg-background p-1 border" style={{ borderColor: 'var(--athlon-border)' }}>
              <button
                type="button"
                onClick={() => setModalTab('BOOK')}
                className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
                  modalTab === 'BOOK' ? 'bg-primary text-black shadow-md' : 'text-foreground/60 hover:text-foreground'
                }`}
              >
                ⚡ Instant Walk-In
              </button>
              <button
                type="button"
                onClick={() => setModalTab('BLOCK')}
                className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
                  modalTab === 'BLOCK' ? 'bg-primary text-black shadow-md' : 'text-foreground/60 hover:text-foreground'
                }`}
              >
                🔒 Admin Block
              </button>
            </div>

            {walkinError && (
              <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{walkinError}</span>
              </div>
            )}

            {modalTab === 'BOOK' ? (
              <form onSubmit={handleWalkinSubmit} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Player / Guest Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={walkinName}
                    onChange={(e) => setWalkinName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border text-sm font-bold text-foreground outline-none focus:border-primary"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={walkinPhone}
                      onChange={(e) => setWalkinPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-background border text-sm font-medium text-foreground outline-none focus:border-primary"
                      style={{ borderColor: 'var(--athlon-border)' }}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">Sport</label>
                    <input
                      type="text"
                      placeholder="e.g. Badminton"
                      value={walkinSport}
                      onChange={(e) => setWalkinSport(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-background border text-sm font-medium text-foreground outline-none focus:border-primary"
                      style={{ borderColor: 'var(--athlon-border)' }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Payment Mode</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['UPI', 'CASH', 'CARD'] as const).map((method) => (
                      <button
                        type="button"
                        key={method}
                        onClick={() => setWalkinPaymentMethod(method)}
                        className={`py-2 rounded-xl text-xs font-black border transition-all ${
                          walkinPaymentMethod === method
                            ? 'border-primary bg-primary/10 text-primary shadow-sm'
                            : 'border-border bg-background text-foreground/60 hover:text-foreground'
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Pill */}
                <div className="p-3.5 rounded-2xl bg-surface border flex items-center justify-between" style={{ borderColor: 'var(--athlon-border)' }}>
                  <div>
                    <span className="text-xs font-bold text-foreground/60">Total Collection</span>
                    <div className="text-[10px] text-emerald-400 font-bold">Standard dynamic rate</div>
                  </div>
                  <span className="text-xl sm:text-2xl font-black text-primary">₹{activeSlotModal.slot.price}</span>
                </div>

                <div className="flex items-center gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setActiveSlotModal(null)}
                    className="flex-1 py-3 rounded-xl border font-bold text-xs text-foreground hover:bg-white/5"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingWalkin}
                    className="flex-1 py-3 rounded-xl bg-primary text-black font-black text-xs hover:brightness-110 disabled:opacity-50 shadow-lg shadow-primary/20"
                  >
                    {isSubmittingWalkin ? 'Confirming...' : 'Confirm & Collect'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleBlockSubmit} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Block / Hold Reason</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Court Maintenance / Private Club Event"
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border text-sm font-medium text-foreground outline-none focus:border-primary"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  />
                </div>

                <div className="flex items-center gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setActiveSlotModal(null)}
                    className="flex-1 py-3 rounded-xl border font-bold text-xs text-foreground hover:bg-white/5"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isBlocking}
                    className="flex-1 py-3 rounded-xl bg-red-500 text-white font-black text-xs hover:bg-red-600 disabled:opacity-50 shadow-lg shadow-red-500/20"
                  >
                    {isBlocking ? 'Blocking...' : 'Block Slot'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          5. BOOKING DETAILS & CHECK-IN BOTTOM-SHEET / MODAL
      ────────────────────────────────────────────────────────────── */}
      {bookingDetailsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="bg-card border w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 animate-in slide-in-from-bottom-6 sm:zoom-in-95 max-h-[92vh] overflow-y-auto" style={{ borderColor: 'var(--athlon-border)' }}>
            <div className="w-12 h-1.5 bg-foreground/20 rounded-full mx-auto sm:hidden -mt-1 mb-2" />

            <div className="flex items-center justify-between border-b pb-3.5" style={{ borderColor: 'var(--athlon-border)' }}>
              <div>
                <span className="text-[10px] font-mono font-black text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
                  #{bookingDetailsModal.bookingNumber}
                </span>
                <h3 className="text-lg sm:text-xl font-black text-foreground mt-1">
                  {bookingDetailsModal.guestName}
                </h3>
              </div>
              <button
                onClick={() => setBookingDetailsModal(null)}
                className="p-1.5 rounded-xl hover:bg-white/5 text-muted-foreground hover:text-foreground"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 rounded-2xl bg-surface border space-y-0.5" style={{ borderColor: 'var(--athlon-border)' }}>
                <span className="text-foreground/50 font-bold text-[10px]">Facility & Sport</span>
                <div className="font-black text-foreground">
                  {bookingDetailsModal.facilityName} ({bookingDetailsModal.sportName || 'Sport'})
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-surface border space-y-0.5" style={{ borderColor: 'var(--athlon-border)' }}>
                <span className="text-foreground/50 font-bold text-[10px]">Time Window</span>
                <div className="font-black text-foreground">
                  {bookingDetailsModal.startTime.slice(0, 5)} - {bookingDetailsModal.endTime.slice(0, 5)}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-surface border space-y-0.5" style={{ borderColor: 'var(--athlon-border)' }}>
                <span className="text-foreground/50 font-bold text-[10px]">Payment</span>
                <div className="font-black text-emerald-400">
                  {bookingDetailsModal.paymentStatus} (₹{bookingDetailsModal.totalAmount})
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-surface border space-y-0.5" style={{ borderColor: 'var(--athlon-border)' }}>
                <span className="text-foreground/50 font-bold text-[10px]">Status</span>
                <div className="font-black text-primary">
                  {bookingDetailsModal.bookingStatus}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-1 flex flex-col sm:flex-row items-center gap-2.5">
              {bookingDetailsModal.bookingStatus === 'CONFIRMED' && (
                <button
                  onClick={() => handleStatusChange('CHECKED_IN')}
                  className="w-full sm:flex-1 py-3 rounded-xl bg-primary text-black font-black text-xs hover:brightness-110 shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Check-In Player</span>
                </button>
              )}
              {bookingDetailsModal.bookingStatus === 'CHECKED_IN' && (
                <button
                  onClick={() => handleStatusChange('COMPLETED')}
                  className="w-full sm:flex-1 py-3 rounded-xl bg-emerald-500 text-black font-black text-xs hover:brightness-110 shadow-lg shadow-emerald-500/20"
                >
                  Mark Session Completed
                </button>
              )}
              {bookingDetailsModal.bookingStatus !== 'CANCELLED' && (
                <button
                  onClick={() => handleStatusChange('CANCELLED')}
                  className="w-full sm:flex-1 py-3 rounded-xl border border-red-500/40 text-red-400 font-black text-xs hover:bg-red-500/10"
                >
                  Cancel Booking
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

