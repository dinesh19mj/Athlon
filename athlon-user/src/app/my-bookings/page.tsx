'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  CalendarDays,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  Building2,
  ChevronRight,
  AlertCircle,
  Search,
  Filter,
  CreditCard,
  Ticket,
  Copy,
  Check,
  Share2,
  ExternalLink,
  CalendarPlus,
  Flame,
  Zap,
  Navigation,
  ArrowRight,
  X,
  QrCode,
  ShieldCheck,
  RefreshCw,
  Trophy,
  Activity,
  Layers,
  Sparkles,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { bookingApi, BookingDto } from '@/lib/api/venue';

function formatSlotTime12H(timeStr: string): string {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  let hour = parseInt(parts[0], 10);
  const minute = parts[1] || '00';
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  if (hour === 0) hour = 12;
  return `${String(hour).padStart(2, '0')}:${minute} ${ampm}`;
}

function formatDateFormatted(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

function getRelativeDayLabel(dateStr: string): string {
  if (!dateStr) return '';
  const today = new Date().toISOString().split('T')[0];
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrow = tomorrowDate.toISOString().split('T')[0];

  if (dateStr === today) return 'Today';
  if (dateStr === tomorrow) return 'Tomorrow';
  return formatDateFormatted(dateStr);
}

// Simulated SVG Barcode Component for the ticket pass
function BarcodePattern({ code }: { code: string }) {
  const bars = useMemo(() => {
    const seed = code.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const pattern: number[] = [];
    for (let i = 0; i < 48; i++) {
      pattern.push(((seed * (i + 1) * 17) % 7) > 2 ? 1 : 0);
    }
    return pattern;
  }, [code]);

  return (
    <div className="flex items-center justify-center gap-[2px] h-9 px-2 bg-foreground/5 rounded-lg opacity-85">
      {bars.map((val, idx) => (
        <div
          key={idx}
          className={`${val ? 'bg-foreground' : 'bg-transparent'} h-full rounded-full`}
          style={{ width: (idx % 4 === 0 ? '3px' : '1.5px') }}
        />
      ))}
    </div>
  );
}

// Simulated Stylized SVG QR Code Component
function PassQRCode({ code }: { code: string }) {
  const matrix = useMemo(() => {
    const size = 11;
    const seed = code.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const grid: boolean[][] = [];
    for (let r = 0; r < size; r++) {
      const row: boolean[] = [];
      for (let c = 0; c < size; c++) {
        // Corners are always dark for QR locator markers
        const isCorner =
          (r < 3 && c < 3) ||
          (r < 3 && c >= size - 3) ||
          (r >= size - 3 && c < 3);
        if (isCorner) {
          row.push(true);
        } else {
          row.push(((seed * (r + 1) * (c + 1) * 31) % 5) > 1);
        }
      }
      grid.push(row);
    }
    return grid;
  }, [code]);

  return (
    <div className="p-2.5 rounded-2xl bg-white border border-border shadow-inner flex flex-col items-center justify-center">
      <div className="grid grid-cols-11 gap-[2px] w-24 h-24 sm:w-28 sm:h-28">
        {matrix.flat().map((filled, idx) => (
          <div
            key={idx}
            className={`rounded-[1px] ${filled ? 'bg-slate-900' : 'bg-slate-100'}`}
          />
        ))}
      </div>
      <span className="text-[8px] font-mono font-black text-slate-600 mt-1.5 tracking-wider">
        VERIFIED PASS
      </span>
    </div>
  );
}

export default function MyBookingsPage() {
  const { userUuid, userEmail } = useAuthStore();
  const { personalProfile } = useWorkspaceStore();

  const [bookings, setBookings] = useState<BookingDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'UPCOMING' | 'COMPLETED' | 'CANCELLED' | 'ALL'>('UPCOMING');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState<string>('ALL');

  // Modal / Interaction State
  const [selectedBookingForPass, setSelectedBookingForPass] = useState<BookingDto | null>(null);
  const [bookingToCancel, setBookingToCancel] = useState<BookingDto | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [copiedRefId, setCopiedRefId] = useState<string | null>(null);

  // Fetch Bookings
  const loadMyBookings = async () => {
    try {
      setLoading(true);
      const res = await bookingApi.getMyBookings(userUuid || undefined);
      if (res.success && res.data) {
        setBookings(res.data);
      }
    } catch (err) {
      console.error('Failed to load my bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyBookings();
  }, [userUuid]);

  const handleCancelBooking = async () => {
    if (!bookingToCancel) return;
    try {
      setIsCancelling(true);
      const res = await bookingApi.cancelBooking(bookingToCancel.bookingUuid, 'Cancelled by player');
      if (res.success) {
        setBookingToCancel(null);
        await loadMyBookings();
      }
    } catch (err) {
      console.error('Failed to cancel booking:', err);
      alert('Could not cancel booking. Please contact venue support.');
    } finally {
      setIsCancelling(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRefId(id);
    setTimeout(() => setCopiedRefId(null), 2000);
  };

  const today = new Date().toISOString().split('T')[0];

  // Distinct sports in user bookings
  const availableSports = useMemo(() => {
    const sports = new Set<string>();
    bookings.forEach((b) => {
      if (b.sportName) sports.add(b.sportName);
    });
    return Array.from(sports);
  }, [bookings]);

  // Filtered Bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      // Tab Filter
      if (activeTab === 'CANCELLED' && b.bookingStatus !== 'CANCELLED') return false;
      if (activeTab === 'COMPLETED') {
        const isPastOrComplete = b.bookingStatus === 'COMPLETED' || (b.bookingDate < today && b.bookingStatus !== 'CANCELLED');
        if (!isPastOrComplete) return false;
      }
      if (activeTab === 'UPCOMING') {
        const isUp = (b.bookingStatus === 'CONFIRMED' || b.bookingStatus === 'CHECKED_IN' || b.bookingStatus === 'PENDING') && b.bookingDate >= today;
        if (!isUp) return false;
      }

      // Sport Filter
      if (selectedSport !== 'ALL' && b.sportName !== selectedSport) return false;

      // Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const venue = (b.venueName || '').toLowerCase();
        const facility = (b.facilityName || '').toLowerCase();
        const ref = (b.bookingNumber || '').toLowerCase();
        const sport = (b.sportName || '').toLowerCase();
        if (!venue.includes(q) && !facility.includes(q) && !ref.includes(q) && !sport.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [bookings, activeTab, selectedSport, searchQuery, today]);

  // Next Upcoming Booking (Spotlight Hero)
  const nextUpcomingBooking = useMemo(() => {
    const upcoming = bookings
      .filter((b) => (b.bookingStatus === 'CONFIRMED' || b.bookingStatus === 'CHECKED_IN') && b.bookingDate >= today)
      .sort((a, b) => {
        if (a.bookingDate !== b.bookingDate) {
          return a.bookingDate.localeCompare(b.bookingDate);
        }
        return (a.startTime || '').localeCompare(b.startTime || '');
      });
    return upcoming.length > 0 ? upcoming[0] : null;
  }, [bookings, today]);

  // Overall User Stats
  const stats = useMemo(() => {
    const upcomingCount = bookings.filter(
      (b) => (b.bookingStatus === 'CONFIRMED' || b.bookingStatus === 'CHECKED_IN') && b.bookingDate >= today
    ).length;

    const completed = bookings.filter((b) => b.bookingStatus === 'COMPLETED' || b.bookingDate < today);
    const totalMinutes = completed.reduce((acc, b) => acc + (b.durationMinutes || 60), 0);
    const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

    const totalSpent = bookings
      .filter((b) => b.bookingStatus !== 'CANCELLED')
      .reduce((acc, b) => acc + (b.totalAmount || 0), 0);

    return {
      upcomingCount,
      totalHours,
      totalBookings: bookings.length,
      totalSpent
    };
  }, [bookings, today]);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-black pb-28">
      {/* ══════════════════════════════════════════════════════════════════════
          HERO BANNER & QUICK STATS
         ══════════════════════════════════════════════════════════════════════ */}
      <div
        className="border-b relative overflow-hidden pt-6 pb-8 md:pt-10 md:pb-12 px-4 sm:px-6 md:px-8"
        style={{
          backgroundColor: 'var(--athlon-surface)',
          borderColor: 'var(--athlon-border)',
        }}
      >
        {/* Ambient Glow Gradient */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
        <div className="absolute bottom-0 left-10 w-72 h-72 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-5xl mx-auto space-y-6 relative z-10">
          {/* Top Bar: Title & Book New CTA */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-primary/20 text-primary border border-primary/30 flex items-center gap-1">
                  <Ticket className="w-3 h-3" />
                  Court Reservations
                </span>
                {personalProfile?.name && (
                  <span className="text-[11px] font-semibold text-foreground/60">
                    Welcome back, {personalProfile.name.split(' ')[0]}
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground tracking-tight">
                My Court Passes
              </h1>
              <p className="text-xs sm:text-[13px] text-foreground/60 max-w-lg leading-relaxed">
                Access your digital tickets, manage upcoming court bookings, and track all your match sessions in one place.
              </p>
            </div>

            <div className="flex items-center gap-2.5 self-start sm:self-auto">
              <button
                onClick={loadMyBookings}
                className="w-10 h-10 rounded-2xl border flex items-center justify-center text-foreground/70 hover:text-foreground transition-all hover:scale-105 active:scale-95 cursor-pointer"
                style={{
                  backgroundColor: 'var(--athlon-card)',
                  borderColor: 'var(--athlon-border)',
                }}
                title="Refresh Bookings"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-primary' : ''}`} />
              </button>

              <Link
                href="/bookings"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-black font-black text-xs shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <CalendarPlus className="w-4 h-4" />
                <span>Book Court Slot</span>
              </Link>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 pt-2">
            {[
              {
                label: 'Active Passes',
                value: stats.upcomingCount,
                unit: 'upcoming',
                icon: Flame,
                color: 'text-amber-400 bg-amber-400/10 border-amber-400/20'
              },
              {
                label: 'Hours On Court',
                value: stats.totalHours,
                unit: 'hrs played',
                icon: Activity,
                color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
              },
              {
                label: 'Total Sessions',
                value: stats.totalBookings,
                unit: 'all-time',
                icon: Trophy,
                color: 'text-primary bg-primary/10 border-primary/20'
              },
              {
                label: 'Total Investment',
                value: `₹${stats.totalSpent}`,
                unit: 'court fees',
                icon: CreditCard,
                color: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20'
              },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={i}
                  className="p-3 sm:p-3.5 rounded-2xl border transition-all hover:scale-[1.01]"
                  style={{
                    backgroundColor: 'var(--athlon-card)',
                    borderColor: 'var(--athlon-border)',
                  }}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] sm:text-[11px] font-bold text-foreground/50 truncate">
                      {stat.label}
                    </span>
                    <span className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 ${stat.color}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <div className="text-lg sm:text-xl font-black font-mono text-foreground tracking-tight">
                    {stat.value}
                  </div>
                  <div className="text-[9.5px] font-medium text-foreground/50">
                    {stat.unit}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-3 sm:px-6 md:px-8 pt-6 sm:pt-8 space-y-6">
        {/* ══════════════════════════════════════════════════════════════════════
            SPOTLIGHT: NEXT UPCOMING PASS HERO CARD
           ══════════════════════════════════════════════════════════════════════ */}
        {nextUpcomingBooking && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-primary" />
                Next Match / Court Session
              </span>
              <span className="text-[10.5px] font-bold text-foreground/50 font-mono">
                {getRelativeDayLabel(nextUpcomingBooking.bookingDate)}
              </span>
            </div>

            {/* Boarding Pass Hero Ticket */}
            <div
              className="rounded-2xl sm:rounded-3xl border shadow-xl relative overflow-hidden group transition-all"
              style={{
                backgroundColor: 'var(--athlon-card)',
                borderColor: 'var(--athlon-border)',
              }}
            >
              {/* Top Accent Strip */}
              <div className="h-1.5 w-full bg-gradient-to-r from-primary via-emerald-400 to-primary" />

              <div className="p-4 sm:p-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-5">
                {/* Left Ticket Info */}
                <div className="space-y-3 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[9.5px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Pass Ready
                    </span>
                    <span className="text-xs font-mono font-black text-primary">
                      #{nextUpcomingBooking.bookingNumber}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-foreground/5 text-foreground/60">
                      {nextUpcomingBooking.sportName || 'Badminton'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-2xl font-black text-foreground tracking-tight">
                      {nextUpcomingBooking.venueName || 'Sports Arena'}
                    </h3>
                    <p className="text-xs sm:text-[13px] text-foreground/60 flex items-center gap-1.5 mt-0.5 font-medium">
                      <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>{nextUpcomingBooking.facilityName}</span>
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 sm:gap-6 pt-1 text-xs sm:text-sm font-bold text-foreground font-mono">
                    <div className="flex items-center gap-1.5">
                      <CalendarDays className="w-4 h-4 text-primary shrink-0" />
                      <span>{formatDateFormatted(nextUpcomingBooking.bookingDate)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-primary shrink-0" />
                      <span>
                        {formatSlotTime12H(nextUpcomingBooking.startTime)} – {formatSlotTime12H(nextUpcomingBooking.endTime)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Perforated Divider (Hidden on mobile) */}
                <div className="hidden md:flex flex-col items-center justify-center px-4 self-stretch">
                  <div className="w-[1px] h-full border-r border-dashed border-border" />
                </div>

                {/* Right Action & Quick QR view */}
                <div className="flex sm:flex-row md:flex-col items-center sm:items-center md:items-end justify-between gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-border">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] uppercase font-bold text-foreground/50">Total Paid</span>
                    <div className="text-xl sm:text-2xl font-black font-mono text-primary">
                      ₹{nextUpcomingBooking.totalAmount}
                    </div>
                    <span className="text-[9.5px] font-bold text-emerald-400 uppercase">
                      {nextUpcomingBooking.paymentStatus}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedBookingForPass(nextUpcomingBooking)}
                      className="px-4 py-2.5 rounded-xl bg-primary text-black font-black text-xs hover:scale-105 active:scale-95 transition-all shadow-md shadow-primary/20 flex items-center gap-1.5 cursor-pointer"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>View Pass</span>
                    </button>

                    <button
                      onClick={() => copyToClipboard(nextUpcomingBooking.bookingNumber, 'hero')}
                      className="p-2.5 rounded-xl border text-foreground/70 hover:text-primary transition-all cursor-pointer"
                      style={{
                        backgroundColor: 'var(--athlon-surface)',
                        borderColor: 'var(--athlon-border)',
                      }}
                      title="Copy Reference"
                    >
                      {copiedRefId === 'hero' ? (
                        <Check className="w-4 h-4 text-primary" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            SEARCH, SPORT TABS & STATUS FILTER
           ══════════════════════════════════════════════════════════════════ */}
        <div className="space-y-3">
          {/* Status Tabs */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 hide-scrollbar">
              {(
                [
                  { id: 'UPCOMING' as const, label: 'Upcoming' },
                  { id: 'COMPLETED' as const, label: 'Completed' },
                  { id: 'CANCELLED' as const, label: 'Cancelled' },
                  { id: 'ALL' as const, label: 'All Bookings' },
                ] as const
              ).map((tab) => {
                const isActive = activeTab === tab.id;
                const count = bookings.filter((b) => {
                  if (tab.id === 'ALL') return true;
                  if (tab.id === 'CANCELLED') return b.bookingStatus === 'CANCELLED';
                  if (tab.id === 'COMPLETED') return b.bookingStatus === 'COMPLETED' || (b.bookingDate < today && b.bookingStatus !== 'CANCELLED');
                  if (tab.id === 'UPCOMING') return (b.bookingStatus === 'CONFIRMED' || b.bookingStatus === 'CHECKED_IN') && b.bookingDate >= today;
                  return true;
                }).length;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                      isActive
                        ? 'bg-primary text-black border-primary shadow-sm font-black scale-[1.01]'
                        : 'text-foreground/70 hover:bg-foreground/5'
                    }`}
                    style={{
                      backgroundColor: isActive ? undefined : 'var(--athlon-surface)',
                      borderColor: isActive ? undefined : 'var(--athlon-border)',
                    }}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                        isActive ? 'bg-black/20 text-black' : 'bg-foreground/10 text-foreground/60'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Sport Filter Chips (if multiple sports) */}
            {availableSports.length > 1 && (
              <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar">
                <button
                  onClick={() => setSelectedSport('ALL')}
                  className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold border transition-all cursor-pointer ${
                    selectedSport === 'ALL'
                      ? 'border-primary text-primary bg-primary/10'
                      : 'border-border text-foreground/50 hover:text-foreground'
                  }`}
                >
                  All Sports
                </button>
                {availableSports.map((sport) => (
                  <button
                    key={sport}
                    onClick={() => setSelectedSport(sport)}
                    className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold border transition-all cursor-pointer ${
                      selectedSport === sport
                        ? 'border-primary text-primary bg-primary/10'
                        : 'border-border text-foreground/50 hover:text-foreground'
                    }`}
                  >
                    {sport}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-foreground/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by venue name, court, or booking ref..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl border text-xs font-medium outline-none focus:border-primary text-foreground placeholder:text-foreground/40"
              style={{
                backgroundColor: 'var(--athlon-surface)',
                borderColor: 'var(--athlon-border)',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground cursor-pointer p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            BOOKINGS LIST CARDS (STYLED PASS VIEW)
           ══════════════════════════════════════════════════════════════════ */}
        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-32 rounded-2xl border"
                style={{
                  backgroundColor: 'var(--athlon-card)',
                  borderColor: 'var(--athlon-border)',
                }}
              />
            ))}
          </div>
        ) : filteredBookings.length === 0 ? (
          <div
            className="p-12 sm:p-16 text-center rounded-3xl border space-y-4"
            style={{
              backgroundColor: 'var(--athlon-surface)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center text-primary mx-auto shadow-sm">
              <Ticket className="w-8 h-8 opacity-70" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="text-base sm:text-lg font-black text-foreground">
                No Bookings Found
              </h3>
              <p className="text-xs text-foreground/50">
                {searchQuery
                  ? `No reservations match "${searchQuery}". Try clearing search filter.`
                  : `You don't have any ${activeTab.toLowerCase()} court passes at the moment.`}
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/bookings"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-black font-black text-xs hover:scale-105 transition-all shadow-md shadow-primary/20"
              >
                <CalendarPlus className="w-4 h-4" />
                <span>Explore & Book Courts</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredBookings.map((b) => {
              const isCancelled = b.bookingStatus === 'CANCELLED';
              const isConfirmed = b.bookingStatus === 'CONFIRMED' || b.bookingStatus === 'CHECKED_IN';
              const isPast = b.bookingDate < today;

              return (
                <div
                  key={b.bookingUuid || b.bookingId}
                  className="rounded-2xl border p-4 sm:p-5 transition-all hover:border-primary/40 hover:shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4"
                  style={{
                    backgroundColor: 'var(--athlon-card)',
                    borderColor: 'var(--athlon-border)',
                  }}
                >
                  {/* Left Ticket Details */}
                  <div className="space-y-2.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-black text-primary">
                        #{b.bookingNumber}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          isCancelled
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/25'
                            : isConfirmed && !isPast
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
                            : 'bg-foreground/10 text-foreground/60 border border-foreground/15'
                        }`}
                      >
                        {isPast && isConfirmed ? 'Completed' : b.bookingStatus}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-foreground/5 text-foreground/60">
                        {b.sportName || 'Court'}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base sm:text-lg font-black text-foreground tracking-tight">
                        {b.venueName || 'Sports Arena'}
                      </h3>
                      <p className="text-xs text-foreground/60 flex items-center gap-1.5 mt-0.5">
                        <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>{b.facilityName}</span>
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-mono font-bold text-foreground/80">
                      <div className="flex items-center gap-1.5">
                        <CalendarDays className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>{formatDateFormatted(b.bookingDate)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>
                          {formatSlotTime12H(b.startTime)} – {formatSlotTime12H(b.endTime)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Price & Actions */}
                  <div className="flex items-center justify-between md:flex-col md:items-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-border">
                    <div className="text-left md:text-right">
                      <div className="text-[10px] uppercase font-bold text-foreground/50">Fee</div>
                      <div className="text-lg font-black font-mono text-primary">₹{b.totalAmount}</div>
                      <div className="text-[9px] font-bold text-emerald-400 uppercase">
                        {b.paymentStatus}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedBookingForPass(b)}
                        className="px-3 py-1.5 rounded-xl border text-[11px] font-bold text-foreground hover:text-primary transition-all flex items-center gap-1 cursor-pointer"
                        style={{
                          backgroundColor: 'var(--athlon-surface)',
                          borderColor: 'var(--athlon-border)',
                        }}
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Pass</span>
                      </button>

                      {isConfirmed && !isPast && (
                        <button
                          onClick={() => setBookingToCancel(b)}
                          className="px-2.5 py-1.5 rounded-xl border border-rose-500/25 text-rose-400 hover:bg-rose-500/10 text-[11px] font-bold transition-all cursor-pointer"
                          title="Cancel Reservation"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          DIGITAL PASS MODAL (AIRLINE / EVENT BOARDING PASS TICKET)
         ══════════════════════════════════════════════════════════════════════ */}
      {selectedBookingForPass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in-50 duration-200">
          <div
            className="w-full max-w-sm rounded-3xl border shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            {/* Header with Close */}
            <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--athlon-border)' }}>
              <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-primary">
                <Ticket className="w-4 h-4" />
                <span>Athlon Verified Court Pass</span>
              </div>
              <button
                onClick={() => setSelectedBookingForPass(null)}
                className="w-7 h-7 rounded-full border flex items-center justify-center text-foreground/50 hover:text-foreground transition-all cursor-pointer"
                style={{
                  backgroundColor: 'var(--athlon-surface)',
                  borderColor: 'var(--athlon-border)',
                }}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Ticket Body */}
            <div className="p-5 space-y-4 text-center">
              {/* QR Code Presentation */}
              <div className="flex justify-center">
                <PassQRCode code={selectedBookingForPass.bookingNumber} />
              </div>

              <div className="space-y-1">
                <div className="text-[10px] uppercase font-bold text-foreground/50">Pass Reference</div>
                <div className="text-base font-mono font-black text-primary tracking-wider">
                  #{selectedBookingForPass.bookingNumber}
                </div>
              </div>

              {/* Venue & Time Details Card */}
              <div
                className="p-3.5 rounded-2xl border text-left space-y-2.5 text-xs"
                style={{
                  backgroundColor: 'var(--athlon-surface)',
                  borderColor: 'var(--athlon-border)',
                }}
              >
                <div className="border-b pb-2" style={{ borderColor: 'var(--athlon-border)' }}>
                  <span className="text-[9.5px] uppercase font-bold text-foreground/50">Venue & Court</span>
                  <div className="text-sm font-black text-foreground mt-0.5">
                    {selectedBookingForPass.venueName || 'Sports Arena'}
                  </div>
                  <div className="text-xs text-primary font-bold">
                    {selectedBookingForPass.facilityName} · {selectedBookingForPass.sportName || 'Court'}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-foreground/50 block">Date</span>
                    <span className="font-bold text-foreground">
                      {formatDateFormatted(selectedBookingForPass.bookingDate)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-foreground/50 block">Time Slot</span>
                    <span className="font-bold text-foreground">
                      {formatSlotTime12H(selectedBookingForPass.startTime)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-foreground/50 block">Player</span>
                    <span className="font-bold text-foreground truncate block">
                      {selectedBookingForPass.guestName || personalProfile?.name || 'Athlete'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-foreground/50 block">Total Fee</span>
                    <span className="font-black text-primary">
                      ₹{selectedBookingForPass.totalAmount}
                    </span>
                  </div>
                </div>
              </div>

              {/* Barcode Strip */}
              <BarcodePattern code={selectedBookingForPass.bookingNumber} />

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => copyToClipboard(selectedBookingForPass.bookingNumber, 'modal')}
                  className="flex-1 py-2.5 rounded-xl border text-xs font-bold text-foreground hover:text-primary transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  style={{
                    backgroundColor: 'var(--athlon-surface)',
                    borderColor: 'var(--athlon-border)',
                  }}
                >
                  {copiedRefId === 'modal' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-primary" />
                      <span className="text-primary font-black">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Ref</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: `Athlon Court Pass - ${selectedBookingForPass.venueName}`,
                        text: `Court reservation for ${selectedBookingForPass.facilityName} on ${selectedBookingForPass.bookingDate} at ${formatSlotTime12H(selectedBookingForPass.startTime)}. Ref: #${selectedBookingForPass.bookingNumber}`,
                      }).catch(() => {});
                    } else {
                      copyToClipboard(selectedBookingForPass.bookingNumber, 'modal');
                    }
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-black font-black text-xs hover:scale-105 transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Pass</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODERN CANCELLATION CONFIRMATION DIALOG
         ══════════════════════════════════════════════════════════════════════ */}
      {bookingToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in-50 duration-200">
          <div
            className="w-full max-w-sm rounded-3xl border shadow-2xl p-5 sm:p-6 space-y-4 animate-in zoom-in-95 duration-200"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-foreground">Cancel Court Reservation?</h3>
              <p className="text-xs text-foreground/60 leading-relaxed">
                Are you sure you want to cancel your slot for{' '}
                <span className="text-foreground font-bold">{bookingToCancel.facilityName}</span> on{' '}
                <span className="text-foreground font-bold">{formatDateFormatted(bookingToCancel.bookingDate)}</span> at{' '}
                <span className="text-foreground font-bold">{formatSlotTime12H(bookingToCancel.startTime)}</span>?
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                disabled={isCancelling}
                onClick={() => setBookingToCancel(null)}
                className="w-full py-2.5 rounded-xl border text-xs font-bold text-foreground/70 hover:text-foreground transition-all cursor-pointer"
                style={{
                  backgroundColor: 'var(--athlon-surface)',
                  borderColor: 'var(--athlon-border)',
                }}
              >
                Keep Booking
              </button>

              <button
                type="button"
                disabled={isCancelling}
                onClick={handleCancelBooking}
                className="w-full py-2.5 rounded-xl bg-rose-500 text-white font-black text-xs hover:bg-rose-600 transition-all shadow-md shadow-rose-500/25 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isCancelling ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Cancelling...</span>
                  </>
                ) : (
                  <span>Yes, Cancel</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Scrollbar utility */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `,
        }}
      />
    </div>
  );
}
