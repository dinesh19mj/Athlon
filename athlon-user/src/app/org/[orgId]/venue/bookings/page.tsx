'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ClipboardList,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  IndianRupee,
  Phone,
  User,
  Plus,
  ChevronRight,
  Eye,
  Calendar,
  AlertCircle,
  CreditCard,
  Building2,
  Layers,
  History,
  UserCheck,
  RefreshCw,
  TrendingUp,
  Activity,
  CalendarDays,
  SlidersHorizontal,
  Download,
  ExternalLink,
  Lock,
  Check,
  Zap,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import {
  venueApi,
  facilityApi,
  bookingApi,
  VenueDto,
  FacilityDto,
  BookingDto,
  BookingStatus,
  PaymentStatus
} from '@/lib/api/venue';

export default function VenueBookingsPage() {
  const params = useParams();
  const orgId = params?.orgId as string;

  const [venue, setVenue] = useState<VenueDto | null>(null);
  const [facilities, setFacilities] = useState<FacilityDto[]>([]);
  const [bookings, setBookings] = useState<BookingDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Desktop filter & control states
  const [desktopFacilityFilter, setDesktopFacilityFilter] = useState<number | 'ALL'>('ALL');
  const [desktopPaymentFilter, setDesktopPaymentFilter] = useState<'ALL' | 'PAID' | 'DUE'>('ALL');
  const [desktopDateFilter, setDesktopDateFilter] = useState<'ALL' | 'TODAY' | 'UPCOMING' | 'PAST'>('ALL');
  const [refreshing, setRefreshing] = useState(false);

  // Selected Booking Drawer
  const [selectedBooking, setSelectedBooking] = useState<BookingDto | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // New Walk-in Modal
  const [isWalkinModalOpen, setIsWalkinModalOpen] = useState(false);
  const [selectedFacilityId, setSelectedFacilityId] = useState<number>(0);
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('07:00');
  const [endTime, setEndTime] = useState('08:00');
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [sportName, setSportName] = useState('Badminton');
  const [basePrice, setBasePrice] = useState(500);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CASH' | 'CARD'>('UPI');
  const [submittingWalkin, setSubmittingWalkin] = useState(false);
  const [walkinError, setWalkinError] = useState<string | null>(null);

  // Payment Recording Modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<'UPI' | 'CASH' | 'CARD'>('UPI');
  const [payTxnRef, setPayTxnRef] = useState('');
  const [savingPayment, setSavingPayment] = useState(false);

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
              setSelectedFacilityId(facRes.data[0].facilityId);
            }
          }
          await loadBookings(v.venueId);
        }
      } catch (err) {
        console.error('Failed to load bookings:', err);
      } finally {
        setLoading(false);
      }
    }
    if (orgId) {
      loadData();
    }
  }, [orgId]);

  const loadBookings = async (venueId: number) => {
    const res = await bookingApi.getBookingsByVenue(venueId);
    if (res.success && res.data) {
      setBookings(res.data);
    }
  };

  const handleStatusUpdate = async (status: BookingStatus) => {
    if (!selectedBooking || !venue) return;
    try {
      const res = await bookingApi.updateBookingStatus(selectedBooking.bookingUuid, status);
      if (res.success) {
        setSelectedBooking(res.data);
        await loadBookings(venue.venueId);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking || !venue) return;
    const reason = prompt('Please enter cancellation reason:', 'Customer requested cancellation');
    if (reason === null) return;

    try {
      const res = await bookingApi.cancelBooking(selectedBooking.bookingUuid, reason);
      if (res.success) {
        setSelectedBooking(res.data);
        await loadBookings(venue.venueId);
      }
    } catch (err) {
      console.error('Failed to cancel:', err);
    }
  };

  const handleRecordPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking || !venue) return;

    try {
      setSavingPayment(true);
      const res = await bookingApi.recordPayment(selectedBooking.bookingUuid, {
        amount: Number(paymentAmount),
        paymentMethod: payMethod,
        transactionReference: payTxnRef.trim(),
        notes: `Manual settlement (${payMethod})`,
      });

      if (res.success) {
        setSelectedBooking(res.data);
        setIsPaymentModalOpen(false);
        await loadBookings(venue.venueId);
      }
    } catch (err) {
      console.error('Failed to record payment:', err);
    } finally {
      setSavingPayment(false);
    }
  };

  const handleCreateWalkin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!venue || !selectedFacilityId) return;

    try {
      setSubmittingWalkin(true);
      setWalkinError(null);

      const res = await bookingApi.createBooking({
        venueId: venue.venueId,
        facilityId: selectedFacilityId,
        guestName: guestName.trim() || 'Walk-in Guest',
        guestPhone: guestPhone.trim(),
        bookingDate,
        startTime: `${startTime}:00`,
        endTime: `${endTime}:00`,
        sportName,
        baseAmount: Number(basePrice),
        totalAmount: Number(basePrice),
        bookingSource: 'WALK_IN',
        paymentStatus: 'PAID',
        paymentMethod,
        paidAmount: Number(basePrice),
        notes: `On-spot walkin reservation (${paymentMethod})`,
      });

      if (res.success) {
        setIsWalkinModalOpen(false);
        await loadBookings(venue.venueId);
      }
    } catch (err: any) {
      console.error('Failed walkin booking:', err);
      setWalkinError(err?.message || 'Failed to create booking');
    } finally {
      setSubmittingWalkin(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = statusFilter === 'ALL' || b.bookingStatus === statusFilter;
    const matchesSearch =
      searchTerm === '' ||
      b.bookingNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.guestName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.guestPhone?.includes(searchTerm) ||
      b.facilityName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleRefresh = async () => {
    if (!venue) return;
    try {
      setRefreshing(true);
      await loadBookings(venue.venueId);
    } finally {
      setRefreshing(false);
    }
  };

  const metrics = useMemo(() => {
    let totalRevenue = 0;
    let paidRevenue = 0;
    let pendingRevenue = 0;
    let confirmedCount = 0;
    let checkedInCount = 0;
    let completedCount = 0;
    let cancelledCount = 0;

    bookings.forEach((b) => {
      const amt = Number(b.totalAmount) || 0;
      totalRevenue += amt;
      if (b.paymentStatus === 'PAID') {
        paidRevenue += amt;
      } else {
        pendingRevenue += amt;
      }

      if (b.bookingStatus === 'CONFIRMED') confirmedCount++;
      else if (b.bookingStatus === 'CHECKED_IN') checkedInCount++;
      else if (b.bookingStatus === 'COMPLETED') completedCount++;
      else if (b.bookingStatus === 'CANCELLED') cancelledCount++;
    });

    const activeCount = confirmedCount + checkedInCount;
    const checkInRate =
      bookings.length > 0
        ? Math.round(((checkedInCount + completedCount) / (bookings.length - cancelledCount || 1)) * 100)
        : 0;

    return {
      totalBookings: bookings.length,
      totalRevenue,
      paidRevenue,
      pendingRevenue,
      confirmedCount,
      checkedInCount,
      completedCount,
      cancelledCount,
      activeCount,
      checkInRate: Math.min(100, Math.max(0, checkInRate)),
    };
  }, [bookings]);

  const desktopFilteredBookings = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];

    return bookings.filter((b) => {
      if (statusFilter !== 'ALL' && b.bookingStatus !== statusFilter) {
        return false;
      }
      if (desktopFacilityFilter !== 'ALL' && b.facilityId !== desktopFacilityFilter) {
        return false;
      }
      if (desktopPaymentFilter === 'PAID' && b.paymentStatus !== 'PAID') {
        return false;
      }
      if (desktopPaymentFilter === 'DUE' && b.paymentStatus === 'PAID') {
        return false;
      }
      if (desktopDateFilter === 'TODAY' && b.bookingDate !== todayStr) {
        return false;
      }
      if (desktopDateFilter === 'UPCOMING' && b.bookingDate < todayStr) {
        return false;
      }
      if (desktopDateFilter === 'PAST' && b.bookingDate >= todayStr) {
        return false;
      }

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matches =
          b.bookingNumber?.toLowerCase().includes(q) ||
          b.guestName?.toLowerCase().includes(q) ||
          b.guestPhone?.includes(q) ||
          b.facilityName?.toLowerCase().includes(q) ||
          b.sportName?.toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [bookings, statusFilter, desktopFacilityFilter, desktopPaymentFilter, desktopDateFilter, searchTerm]);

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

  const handleStatusUpdateQuick = async (booking: BookingDto, status: BookingStatus) => {
    if (!venue) return;
    try {
      const res = await bookingApi.updateBookingStatus(booking.bookingUuid, status);
      if (res.success) {
        await loadBookings(venue.venueId);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* ═════════════════════════════════════════════════════════
          MOBILE VIEW: TOUCH-FRIENDLY RESERVATIONS (< md)
      ══════════════════════════════════════════════════════════ */}
      <div className="block md:hidden space-y-4">
        {/* Header */}
        <div className="flex flex-col gap-4 bg-card border border-border p-5 rounded-2xl shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-primary tracking-widest uppercase">
              <ClipboardList className="w-4 h-4" /> Bookings & Ledger
            </div>
            <h1 className="text-xl font-black tracking-tight text-foreground">
              Reservation Management
            </h1>
            <p className="text-xs text-muted-foreground">
              Search, filter, check-in players, process walk-ins and collect payments.
            </p>
          </div>

          <button
            onClick={() => {
              setGuestName('');
              setGuestPhone('');
              setBasePrice(500);
              setWalkinError(null);
              setIsWalkinModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-black font-black text-sm hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20 w-full"
          >
            <Plus className="w-4 h-4" /> New Walk-In Booking
          </button>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col gap-3 bg-card/60 border border-border p-4 rounded-2xl">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search booking #, name, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-background border border-border text-xs font-medium text-foreground outline-none focus:border-primary"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full pb-1 hide-scrollbar">
            {(['ALL', 'CONFIRMED', 'CHECKED_IN', 'COMPLETED', 'CANCELLED'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all whitespace-nowrap shrink-0 ${
                  statusFilter === status
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-background text-muted-foreground hover:text-foreground'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings Table / List */}
        {loading ? (
          <div className="h-64 rounded-2xl bg-card border border-border animate-pulse flex items-center justify-center text-muted-foreground font-bold text-sm">
            Loading reservations...
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-card border border-border space-y-3">
            <ClipboardList className="w-10 h-10 text-muted-foreground/40 mx-auto" />
            <h3 className="text-sm font-black text-foreground">No Bookings Found</h3>
            <p className="text-xs text-muted-foreground">
              {searchTerm || statusFilter !== 'ALL'
                ? 'Try adjusting your search criteria.'
                : 'No reservations booked yet.'}
            </p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-background/50">
                    <th className="p-3 font-black text-muted-foreground uppercase tracking-wider">Booking #</th>
                    <th className="p-3 font-black text-muted-foreground uppercase tracking-wider">Customer</th>
                    <th className="p-3 font-black text-muted-foreground uppercase tracking-wider">Facility / Sport</th>
                    <th className="p-3 font-black text-muted-foreground uppercase tracking-wider">Date & Time</th>
                    <th className="p-3 font-black text-muted-foreground uppercase tracking-wider">Amount</th>
                    <th className="p-3 font-black text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="p-3 font-black text-muted-foreground uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((b) => {
                    let statusBg = 'bg-primary/10 text-primary border-primary/30';
                    if (b.bookingStatus === 'CHECKED_IN') statusBg = 'bg-blue-500/10 text-blue-400 border-blue-500/30';
                    if (b.bookingStatus === 'COMPLETED') statusBg = 'bg-green-500/10 text-green-400 border-green-500/30';
                    if (b.bookingStatus === 'CANCELLED') statusBg = 'bg-red-500/10 text-red-400 border-red-500/30';

                    return (
                      <tr key={b.bookingId} className="border-b border-border/50 hover:bg-white/[0.01] transition-colors">
                        <td className="p-3 font-mono font-bold text-primary">
                          {b.bookingNumber}
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-foreground">{b.guestName}</div>
                          {b.guestPhone && <div className="text-[10px] text-muted-foreground">{b.guestPhone}</div>}
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-foreground">{b.facilityName}</div>
                          <div className="text-[10px] text-muted-foreground">{b.sportName || 'Sport'}</div>
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-foreground">{b.bookingDate}</div>
                          <div className="text-[10px] text-muted-foreground">
                            {b.startTime?.slice(0, 5)} - {b.endTime?.slice(0, 5)} ({b.durationMinutes}m)
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-foreground">₹{b.totalAmount}</div>
                          <div className={`text-[10px] font-bold ${b.paymentStatus === 'PAID' ? 'text-green-400' : 'text-amber-400'}`}>
                            {b.paymentStatus}
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`px-2.5 py-1 rounded-full border text-[10px] font-bold ${statusBg}`}>
                            {b.bookingStatus}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => setSelectedBooking(b)}
                            className="px-3 py-1.5 rounded-lg bg-card border border-border hover:bg-white/5 text-xs font-bold text-foreground transition-all"
                          >
                            View
                          </button>
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

      {/* ═════════════════════════════════════════════════════════
          DESKTOP VIEW: STADIUM-GRADE RESERVATION LEDGER (md+)
      ══════════════════════════════════════════════════════════ */}
      <div className="hidden md:block space-y-6">
        {/* 1. DESKTOP OPERATIONS HERO COCKPIT */}
        <div
          className="p-6 rounded-3xl border bg-gradient-to-r from-card via-card/90 to-card/70 backdrop-blur-xl relative overflow-hidden shadow-2xl"
          style={{ borderColor: 'var(--athlon-border)' }}
        >
          {/* Ambient Lighting */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none -mr-24 -mt-24" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none -mb-32" />

          <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
            {/* Left: Venue Identity & Operations Title */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-black uppercase tracking-wider shadow-sm shadow-primary/10">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                  </span>
                  <span>Arena Reservations & Settlement</span>
                </span>
                <span className="text-xs text-foreground/30">•</span>
                <span className="text-xs font-black text-foreground/70 px-2.5 py-0.5 rounded-lg bg-surface border border-border">
                  {metrics.totalBookings} Total Logged
                </span>
                <span className="text-xs font-black text-emerald-400 px-2.5 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  {metrics.confirmedCount} Active Bookings
                </span>
              </div>

              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
                  <span>Reservation Ledger & Dispatch</span>
                </h1>
                <span className="text-xs px-2.5 py-1 rounded-xl bg-surface border border-border text-foreground/60 font-bold">
                  {venue?.name || 'Main Sports Complex'}
                </span>
              </div>

              <p className="text-xs font-medium text-foreground/60 max-w-2xl flex items-center gap-2">
                <ClipboardList className="w-3.5 h-3.5 text-primary" />
                <span>Real-time player check-ins, walk-in counter dispatch, payment audits and booking lifecycles.</span>
              </p>
            </div>

            {/* Right: Quick Action Hub & Navigation */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                className={`p-3 rounded-2xl border bg-surface/90 text-foreground/80 hover:text-foreground active:scale-95 transition-all ${
                  refreshing ? 'animate-spin text-primary border-primary/50' : 'border-border hover:border-primary/40'
                }`}
                title="Refresh Bookings Ledger"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              {/* Direct Link to Live Calendar */}
              <Link
                href={`/org/${orgId}/venue/calendar`}
                className="px-4 py-2.5 rounded-2xl border border-border bg-surface text-foreground/80 hover:text-foreground hover:border-primary/40 text-xs font-black flex items-center gap-2 transition-all shadow-sm"
              >
                <CalendarDays className="w-4 h-4 text-primary" />
                <span>Calendar Matrix</span>
              </Link>

              {/* Direct Link to Holds */}
              <Link
                href={`/org/${orgId}/venue/blocks`}
                className="px-4 py-2.5 rounded-2xl border border-border bg-surface text-foreground/80 hover:text-foreground hover:border-primary/40 text-xs font-black flex items-center gap-2 transition-all shadow-sm"
              >
                <Lock className="w-4 h-4 text-red-400" />
                <span>Admin Holds</span>
              </Link>

              {/* Instant Walk-in CTA */}
              <button
                onClick={() => {
                  setGuestName('');
                  setGuestPhone('');
                  setBasePrice(500);
                  setWalkinError(null);
                  setIsWalkinModalOpen(true);
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-black font-black text-xs hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-primary/20"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>New Walk-In Booking</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. EXECUTIVE BENTO KPI ANALYTICS BAR (4 Cards) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Volume */}
          <div
            className="p-5 rounded-3xl border bg-gradient-to-br from-card via-card/90 to-card/60 backdrop-blur-xl relative overflow-hidden shadow-lg group hover:border-primary/40 transition-all"
            style={{ borderColor: 'var(--athlon-border)' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span>Total Bookings</span>
              </span>
              <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shadow-inner">
                <ClipboardList className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <div className="text-3xl font-black text-foreground tracking-tight">{metrics.totalBookings}</div>
              <span className="text-xs font-bold text-primary font-bold">reservations</span>
            </div>
            <div className="mt-3.5 flex items-center gap-2 pt-2 border-t border-white/5 text-[11px] text-foreground/60 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>{metrics.confirmedCount} confirmed • {metrics.completedCount} completed</span>
            </div>
          </div>

          {/* Card 2: Revenue Collected & Settled */}
          <div
            className="p-5 rounded-3xl border bg-gradient-to-br from-card via-card/90 to-card/60 backdrop-blur-xl relative overflow-hidden shadow-lg group hover:border-emerald-500/40 transition-all"
            style={{ borderColor: 'var(--athlon-border)' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Settled Revenue</span>
              </span>
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-inner">
                <IndianRupee className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <div className="text-3xl font-black text-foreground tracking-tight">
                ₹{metrics.paidRevenue.toLocaleString()}
              </div>
              <span className="text-xs font-bold text-emerald-400">Paid in full</span>
            </div>
            <div className="mt-3.5 flex items-center gap-2 pt-2 border-t border-white/5 text-[11px] text-foreground/60 font-medium">
              <CreditCard className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-amber-400/90 font-bold">₹{metrics.pendingRevenue.toLocaleString()} pending collection</span>
            </div>
          </div>

          {/* Card 3: Check-in Compliance */}
          <div
            className="p-5 rounded-3xl border bg-gradient-to-br from-card via-card/90 to-card/60 backdrop-blur-xl relative overflow-hidden shadow-lg group hover:border-blue-500/40 transition-all"
            style={{ borderColor: 'var(--athlon-border)' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                <span>Player Check-In Rate</span>
              </span>
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shadow-inner">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <div className="text-3xl font-black text-foreground tracking-tight">{metrics.checkInRate}%</div>
              <span className="text-xs font-bold text-blue-300">compliance</span>
            </div>
            {/* Progress bar */}
            <div className="mt-3.5 space-y-1.5">
              <div className="w-full h-2 rounded-full bg-surface border border-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-primary transition-all duration-500"
                  style={{ width: `${metrics.checkInRate}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-foreground/50 font-bold">
                <span>{metrics.checkedInCount + metrics.completedCount} Attended</span>
                <span>{metrics.totalBookings - metrics.cancelledCount} Expected</span>
              </div>
            </div>
          </div>

          {/* Card 4: Facility Arena Utilization */}
          <div
            className="p-5 rounded-3xl border bg-gradient-to-br from-card via-card/90 to-card/60 backdrop-blur-xl relative overflow-hidden shadow-lg group hover:border-purple-500/40 transition-all"
            style={{ borderColor: 'var(--athlon-border)' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                <span>Active Facilities</span>
              </span>
              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shadow-inner">
                <Building2 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <div className="text-3xl font-black text-foreground tracking-tight">{facilities.length}</div>
              <span className="text-xs font-bold text-purple-300">courts registered</span>
            </div>
            <div className="mt-3.5 flex items-center gap-2 pt-2 border-t border-white/5 text-[11px] text-foreground/60 font-medium">
              <Layers className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span>Multi-sport booking engine ready</span>
            </div>
          </div>
        </div>

        {/* 3. COMMAND & FILTER TOOLBAR */}
        <div
          className="p-4 rounded-3xl border bg-card/60 backdrop-blur-xl space-y-4 shadow-md"
          style={{ borderColor: 'var(--athlon-border)' }}
        >
          {/* Top Row: Search Input & Status Pills */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[320px]">
              <Search className="w-4 h-4 text-foreground/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search booking ref #, player name, phone, sport, or court..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-8 py-2 rounded-2xl bg-background/80 border border-border text-xs font-bold text-foreground placeholder:text-foreground/40 outline-none focus:border-primary transition-all shadow-inner"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground text-xs font-black"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Lifecycle Status Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
              {(
                [
                  { id: 'ALL', label: 'All', count: bookings.length },
                  { id: 'CONFIRMED', label: 'Confirmed', count: metrics.confirmedCount },
                  { id: 'CHECKED_IN', label: 'Checked In', count: metrics.checkedInCount },
                  { id: 'COMPLETED', label: 'Completed', count: metrics.completedCount },
                  { id: 'CANCELLED', label: 'Cancelled', count: metrics.cancelledCount },
                ] as const
              ).map((st) => (
                <button
                  key={st.id}
                  onClick={() => setStatusFilter(st.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 border ${
                    statusFilter === st.id
                      ? 'bg-primary text-black border-primary shadow-md shadow-primary/20 scale-[1.02]'
                      : 'bg-surface border-border text-foreground/70 hover:text-foreground hover:border-primary/40'
                  }`}
                >
                  <span>{st.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                      statusFilter === st.id ? 'bg-black/20 text-black' : 'bg-background text-foreground/50'
                    }`}
                  >
                    {st.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Bottom Row: Facility Filter, Payment Filter, Date Range & Summary */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 pt-3 border-t border-white/5">
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Facility Select */}
              <div className="flex items-center gap-1.5 text-xs font-bold text-foreground/70">
                <Building2 className="w-3.5 h-3.5 text-primary" />
                <select
                  value={desktopFacilityFilter}
                  onChange={(e) => setDesktopFacilityFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
                  className="px-3 py-1.5 rounded-xl bg-background border border-border text-xs font-bold text-foreground outline-none focus:border-primary cursor-pointer"
                >
                  <option value="ALL">All Courts ({facilities.length})</option>
                  {facilities.map((f) => (
                    <option key={f.facilityId} value={f.facilityId}>
                      {f.name} ({f.facilityType})
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Filter */}
              <div className="flex items-center gap-1 p-1 rounded-2xl bg-background border border-border">
                {(
                  [
                    { id: 'ALL', label: 'All Payments' },
                    { id: 'PAID', label: 'Paid in Full' },
                    { id: 'DUE', label: 'Pending / Due' },
                  ] as const
                ).map((pm) => (
                  <button
                    key={pm.id}
                    onClick={() => setDesktopPaymentFilter(pm.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                      desktopPaymentFilter === pm.id
                        ? 'bg-surface text-foreground font-black shadow-sm'
                        : 'text-foreground/50 hover:text-foreground'
                    }`}
                  >
                    {pm.label}
                  </button>
                ))}
              </div>

              {/* Date Filter */}
              <div className="flex items-center gap-1 p-1 rounded-2xl bg-background border border-border">
                {(
                  [
                    { id: 'ALL', label: 'All Dates' },
                    { id: 'TODAY', label: 'Today' },
                    { id: 'UPCOMING', label: 'Upcoming' },
                    { id: 'PAST', label: 'Past' },
                  ] as const
                ).map((df) => (
                  <button
                    key={df.id}
                    onClick={() => setDesktopDateFilter(df.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                      desktopDateFilter === df.id
                        ? 'bg-surface text-foreground font-black shadow-sm'
                        : 'text-foreground/50 hover:text-foreground'
                    }`}
                  >
                    {df.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Results Counter */}
            <div className="text-xs font-bold text-foreground/50 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span>
                Showing <strong className="text-foreground">{desktopFilteredBookings.length}</strong> of {bookings.length} reservations
              </span>
            </div>
          </div>
        </div>

        {/* 4. HIGH-TECH RESERVATIONS LEDGER TABLE */}
        {loading ? (
          <div className="h-72 rounded-3xl bg-card border border-border animate-pulse flex flex-col items-center justify-center gap-3 text-muted-foreground font-bold text-sm shadow-xl">
            <Activity className="w-6 h-6 animate-spin text-primary" />
            <span>Synchronizing reservations ledger...</span>
          </div>
        ) : desktopFilteredBookings.length === 0 ? (
          <div className="p-16 text-center rounded-3xl bg-card border border-border space-y-4 shadow-xl">
            <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-inner">
              <ClipboardList className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-foreground">No Reservations Found</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed font-medium">
              {searchTerm || statusFilter !== 'ALL' || desktopFacilityFilter !== 'ALL' || desktopPaymentFilter !== 'ALL'
                ? 'No bookings match your current filter criteria. Try clearing filters or search terms.'
                : 'No bookings recorded in this venue yet. Create your first walk-in booking above!'}
            </p>
            {(searchTerm || statusFilter !== 'ALL' || desktopFacilityFilter !== 'ALL' || desktopPaymentFilter !== 'ALL' || desktopDateFilter !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('ALL');
                  setDesktopFacilityFilter('ALL');
                  setDesktopPaymentFilter('ALL');
                  setDesktopDateFilter('ALL');
                }}
                className="px-4 py-2 rounded-xl bg-surface border border-border text-xs font-bold text-foreground hover:bg-white/5"
              >
                Reset All Filters
              </button>
            )}
          </div>
        ) : (
          <div
            className="bg-card rounded-3xl border overflow-hidden shadow-2xl transition-all"
            style={{ borderColor: 'var(--athlon-border)' }}
          >
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b bg-surface/90 backdrop-blur-md sticky top-0 z-20" style={{ borderColor: 'var(--athlon-border)' }}>
                    <th className="p-4 font-black uppercase tracking-wider text-muted-foreground w-40">Booking Ref</th>
                    <th className="p-4 font-black uppercase tracking-wider text-muted-foreground min-w-[200px]">Player / Guest</th>
                    <th className="p-4 font-black uppercase tracking-wider text-muted-foreground min-w-[180px]">Facility & Sport</th>
                    <th className="p-4 font-black uppercase tracking-wider text-muted-foreground min-w-[170px]">Date & Schedule</th>
                    <th className="p-4 font-black uppercase tracking-wider text-muted-foreground min-w-[160px]">Financials</th>
                    <th className="p-4 font-black uppercase tracking-wider text-muted-foreground w-36">Status</th>
                    <th className="p-4 font-black uppercase tracking-wider text-muted-foreground text-right w-48">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/5">
                  {desktopFilteredBookings.map((b) => {
                    const todayStr = new Date().toISOString().split('T')[0];
                    const isToday = b.bookingDate === todayStr;
                    const emoji = getSportEmoji(b.sportName, b.facilityName);
                    const initials = getPlayerInitials(b.guestName);

                    let statusBadge = (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/30 font-black text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <span>Confirmed</span>
                      </span>
                    );
                    if (b.bookingStatus === 'CHECKED_IN') {
                      statusBadge = (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 font-black text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                          <span>Checked In</span>
                        </span>
                      );
                    } else if (b.bookingStatus === 'COMPLETED') {
                      statusBadge = (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-black text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span>Completed</span>
                        </span>
                      );
                    } else if (b.bookingStatus === 'CANCELLED') {
                      statusBadge = (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/30 font-black text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                          <span>Cancelled</span>
                        </span>
                      );
                    }

                    return (
                      <tr
                        key={b.bookingId}
                        className="hover:bg-white/[0.02] transition-colors group"
                      >
                        {/* Booking Ref */}
                        <td className="p-4">
                          <div className="space-y-1">
                            <span className="font-mono font-black text-primary text-xs tracking-tight">
                              {b.bookingNumber}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-bold text-foreground/50 px-2 py-0.5 rounded-md bg-surface border border-border flex items-center gap-1">
                                <span>{b.bookingSource === 'WALK_IN' ? '⚡ Walk-In' : '🌐 Online'}</span>
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Player / Guest */}
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/30 text-primary font-black text-xs flex items-center justify-center shrink-0 shadow-inner">
                              {initials}
                            </div>
                            <div className="space-y-0.5 min-w-0">
                              <div className="font-black text-foreground text-sm truncate">{b.guestName}</div>
                              {b.guestPhone ? (
                                <div className="text-[11px] text-foreground/50 font-medium flex items-center gap-1">
                                  <Phone className="w-3 h-3 text-foreground/40" />
                                  <span>{b.guestPhone}</span>
                                </div>
                              ) : (
                                <div className="text-[10px] text-foreground/40 font-bold">No phone added</div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Facility & Sport */}
                        <td className="p-4">
                          <div className="space-y-1">
                            <div className="font-black text-foreground flex items-center gap-1.5 text-xs">
                              <span>{emoji}</span>
                              <span className="truncate">{b.facilityName}</span>
                            </div>
                            <div className="text-[10px] text-foreground/50 font-bold flex items-center gap-1">
                              <span>{b.sportName || 'Arena Sport'}</span>
                              <span>•</span>
                              <span>{b.durationMinutes}m block</span>
                            </div>
                          </div>
                        </td>

                        {/* Date & Schedule */}
                        <td className="p-4">
                          <div className="space-y-1">
                            <div className="font-black text-foreground flex items-center gap-1.5 text-xs">
                              <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                              <span>{b.bookingDate}</span>
                              {isToday && (
                                <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase">
                                  Today
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-foreground/50 font-mono font-bold flex items-center gap-1">
                              <Clock className="w-3 h-3 text-foreground/40" />
                              <span>{b.startTime?.slice(0, 5)} - {b.endTime?.slice(0, 5)}</span>
                            </div>
                          </div>
                        </td>

                        {/* Financials & Settlement */}
                        <td className="p-4">
                          <div className="space-y-1">
                            <div className="font-black text-foreground text-sm flex items-center gap-1">
                              <span>₹{b.totalAmount}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                                  b.paymentStatus === 'PAID'
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                }`}
                              >
                                {b.paymentStatus}
                              </span>
                              {b.payments?.[0]?.paymentMethod && (
                                <span className="text-[10px] font-bold text-foreground/40 font-mono uppercase">
                                  {b.payments[0].paymentMethod}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="p-4">
                          {statusBadge}
                        </td>

                        {/* Quick Actions Hub */}
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {b.bookingStatus === 'CONFIRMED' && (
                              <button
                                onClick={() => handleStatusUpdateQuick(b, 'CHECKED_IN')}
                                className="px-3 py-1.5 rounded-xl bg-primary text-black font-black text-xs hover:brightness-110 active:scale-95 transition-all shadow-sm flex items-center gap-1"
                                title="Instant Player Check-in"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>Check-In</span>
                              </button>
                            )}

                            {b.bookingStatus === 'CHECKED_IN' && (
                              <button
                                onClick={() => handleStatusUpdateQuick(b, 'COMPLETED')}
                                className="px-3 py-1.5 rounded-xl bg-emerald-500 text-black font-black text-xs hover:brightness-110 active:scale-95 transition-all shadow-sm flex items-center gap-1"
                                title="Mark Completed"
                              >
                                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                <span>Complete</span>
                              </button>
                            )}

                            {b.paymentStatus !== 'PAID' && (
                              <button
                                onClick={() => {
                                  setSelectedBooking(b);
                                  setPaymentAmount(b.totalAmount);
                                  setIsPaymentModalOpen(true);
                                }}
                                className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-xs hover:bg-amber-500/20 active:scale-95 transition-all flex items-center gap-1"
                                title="Record Settlement"
                              >
                                <IndianRupee className="w-3 h-3" />
                                <span>Collect</span>
                              </button>
                            )}

                            <button
                              onClick={() => setSelectedBooking(b)}
                              className="px-3 py-1.5 rounded-xl bg-surface border border-border hover:bg-white/5 hover:border-primary/40 text-xs font-bold text-foreground transition-all flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5 text-foreground/50" />
                              <span>View</span>
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

      {/* Booking Details Drawer / Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-xl rounded-3xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-primary">{selectedBooking.bookingNumber}</span>
                <h3 className="text-lg font-black text-foreground">{selectedBooking.guestName}</h3>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Grid Overview */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-background border border-border space-y-1">
                <span className="text-muted-foreground">Facility & Sport</span>
                <div className="font-bold text-foreground">
                  {selectedBooking.facilityName} • {selectedBooking.sportName || 'Sport'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-background border border-border space-y-1">
                <span className="text-muted-foreground">Booking Date & Time</span>
                <div className="font-bold text-foreground">
                  {selectedBooking.bookingDate} ({selectedBooking.startTime?.slice(0, 5)} - {selectedBooking.endTime?.slice(0, 5)})
                </div>
              </div>

              <div className="p-3 rounded-xl bg-background border border-border space-y-1">
                <span className="text-muted-foreground">Payment Status</span>
                <div className="font-bold text-green-400">
                  {selectedBooking.paymentStatus} (₹{selectedBooking.totalAmount})
                </div>
              </div>

              <div className="p-3 rounded-xl bg-background border border-border space-y-1">
                <span className="text-muted-foreground">Booking Source</span>
                <div className="font-bold text-primary">
                  {selectedBooking.bookingSource}
                </div>
              </div>
            </div>

            {/* Status Flow Actions */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-foreground">Status Transitions</span>
              <div className="flex flex-wrap items-center gap-2">
                {selectedBooking.bookingStatus === 'CONFIRMED' && (
                  <button
                    onClick={() => handleStatusUpdate('CHECKED_IN')}
                    className="px-4 py-2 rounded-xl bg-primary text-black font-black text-xs hover:brightness-110"
                  >
                    Check In Player
                  </button>
                )}
                {selectedBooking.bookingStatus === 'CHECKED_IN' && (
                  <button
                    onClick={() => handleStatusUpdate('COMPLETED')}
                    className="px-4 py-2 rounded-xl bg-green-500 text-white font-black text-xs hover:bg-green-600"
                  >
                    Mark Session Completed
                  </button>
                )}
                {selectedBooking.paymentStatus !== 'PAID' && (
                  <button
                    onClick={() => {
                      setPaymentAmount(selectedBooking.totalAmount);
                      setIsPaymentModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-card border border-primary/40 text-primary font-bold text-xs hover:bg-primary/10"
                  >
                    Collect / Record Payment
                  </button>
                )}
                {selectedBooking.bookingStatus !== 'CANCELLED' && (
                  <button
                    onClick={handleCancelBooking}
                    className="px-4 py-2 rounded-xl border border-red-500/40 text-red-400 font-bold text-xs hover:bg-red-500/10"
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>

            {/* Status History Audit Ledger */}
            {selectedBooking.statusHistories && selectedBooking.statusHistories.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-border">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-primary" /> Status Audit Trail
                </span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {selectedBooking.statusHistories.map((h) => (
                    <div key={h.id} className="p-2 rounded-lg bg-background border border-border text-[11px] flex items-center justify-between">
                      <span className="font-bold text-foreground">{h.newStatus}</span>
                      <span className="text-muted-foreground">{h.reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Record Payment Sub-Modal */}
      {isPaymentModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-black text-foreground">Record Payment</h3>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Amount (₹)</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-sm font-bold text-foreground outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['UPI', 'CASH', 'CARD'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPayMethod(m)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        payMethod === m
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-background text-muted-foreground'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Transaction Ref / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. UPI Ref / Receipt #"
                  value={payTxnRef}
                  onChange={(e) => setPayTxnRef(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-xs font-medium text-foreground outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border font-bold text-xs text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPayment}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-black font-black text-xs hover:brightness-110 disabled:opacity-50"
                >
                  {savingPayment ? 'Recording...' : 'Confirm Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Walk-in Reservation Modal */}
      {isWalkinModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="text-lg font-black text-foreground">Walk-in Reservation</h3>
                <p className="text-xs text-muted-foreground">On-spot counter booking & payment</p>
              </div>
              <button
                onClick={() => setIsWalkinModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {walkinError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{walkinError}</span>
              </div>
            )}

            <form onSubmit={handleCreateWalkin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Select Facility / Court</label>
                <select
                  value={selectedFacilityId}
                  onChange={(e) => setSelectedFacilityId(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs font-bold text-foreground outline-none focus:border-primary cursor-pointer"
                >
                  {facilities.map((fac) => (
                    <option key={fac.facilityId} value={fac.facilityId}>
                      {fac.name} ({fac.facilityType})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Date</label>
                  <input
                    type="date"
                    required
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
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

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Player / Guest Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikas Nair"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs font-medium text-foreground outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs font-medium text-foreground outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Sport</label>
                  <input
                    type="text"
                    placeholder="e.g. Badminton"
                    value={sportName}
                    onChange={(e) => setSportName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs font-medium text-foreground outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Total Fee (₹)</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={basePrice}
                    onChange={(e) => setBasePrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs font-bold text-foreground outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['UPI', 'CASH', 'CARD'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentMethod(m)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        paymentMethod === m
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-background text-muted-foreground'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsWalkinModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border font-bold text-xs text-foreground hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingWalkin}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-black font-black text-xs hover:brightness-110 disabled:opacity-50"
                >
                  {submittingWalkin ? 'Confirming...' : 'Create & Collect'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
