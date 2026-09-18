'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin,
  Clock,
  Phone,
  CheckCircle2,
  User,
  Check,
  Copy,
  Lock,
  RefreshCw,
  X,
  Mail,
  Calendar as CalendarIcon
} from 'lucide-react';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { useAuthStore } from '@/lib/store/useAuthStore';
import {
  venueApi,
  facilityApi,
  bookingApi,
  VenueDto,
  FacilityDto,
  FacilityAvailabilityResponse,
  SlotDto,
  BookingDto
} from '@/lib/api/venue';

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

export default function VenueBookingDetailPage() {
  const params = useParams();
  const venueUuid = params?.venueUuid as string;
  const { personalProfile } = useWorkspaceStore();
  const { userUuid, userEmail } = useAuthStore();

  const [venue, setVenue] = useState<VenueDto | null>(null);
  const [facilities, setFacilities] = useState<FacilityDto[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<FacilityDto | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [availability, setAvailability] = useState<FacilityAvailabilityResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Selected Slot for checkout
  const [selectedSlot, setSelectedSlot] = useState<SlotDto | null>(null);

  // Checkout Form State
  const [playerName, setPlayerName] = useState(() => personalProfile?.name || (userEmail ? userEmail.split('@')[0] : ''));
  const [playerPhone, setPlayerPhone] = useState('');
  const [playerEmail, setPlayerEmail] = useState('');
  const [selectedSport, setSelectedSport] = useState('Badminton');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'CASH'>('UPI');
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<BookingDto | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);

  // Next 14 days dates for selector
  const nextDates = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const isToday = i === 0;
      const isTomorrow = i === 1;
      return {
        dateStr: d.toISOString().split('T')[0],
        dayName: isToday ? 'Today' : isTomorrow ? 'Tmrw' : d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: d.getDate(),
        month: d.toLocaleDateString('en-US', { month: 'short' }),
        fullLabel: d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
      };
    });
  }, []);

  const selectedDateObj = useMemo(() => {
    const found = nextDates.find((d) => d.dateStr === selectedDate);
    if (found) return found;
    const d = new Date(selectedDate);
    return {
      dateStr: selectedDate,
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNum: d.getDate(),
      month: d.toLocaleDateString('en-US', { month: 'short' }),
      fullLabel: d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
    };
  }, [selectedDate, nextDates]);

  // Load venue and facilities
  useEffect(() => {
    async function loadVenue() {
      try {
        setLoading(true);
        const res = await venueApi.getVenueByUuid(venueUuid);
        if (res.success && res.data) {
          const v = res.data;
          setVenue(v);
          const facRes = await facilityApi.getFacilitiesByVenue(v.venueId);
          if (facRes.success && facRes.data && facRes.data.length > 0) {
            setFacilities(facRes.data);
            setSelectedFacility(facRes.data[0]);
            if (facRes.data[0].sports && facRes.data[0].sports.length > 0) {
              setSelectedSport(facRes.data[0].sports[0].sportName);
            }
          }
        }
      } catch (err: unknown) {
        console.error('Failed to load venue details:', err);
      } finally {
        setLoading(false);
      }
    }
    if (venueUuid) {
      loadVenue();
    }
  }, [venueUuid]);

  // Fetch slots whenever selected facility or date changes
  useEffect(() => {
    async function loadSlots() {
      if (!selectedFacility) return;
      try {
        setLoadingSlots(true);
        const res = await facilityApi.getFacilityAvailability(
          selectedFacility.facilityId,
          selectedDate
        );
        if (res.success && res.data) {
          setAvailability(res.data);
          setSelectedSlot(null); // Clear selected slot so stale slot or price is never retained across dates/facilities
        }
      } catch (err: unknown) {
        console.error('Failed to load facility slots:', err);
      } finally {
        setLoadingSlots(false);
      }
    }
    loadSlots();
  }, [selectedFacility, selectedDate]);

  const handleFacilityChange = (facility: FacilityDto) => {
    setSelectedFacility(facility);
    setSelectedSlot(null); // Reset selected slot to avoid stale slot/price divergence
    if (facility.sports && facility.sports.length > 0) {
      setSelectedSport(facility.sports[0].sportName);
    }
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!venue || !selectedFacility || !selectedSlot) return;

    if (!playerName.trim()) {
      setBookingError('Please enter player name to proceed.');
      return;
    }

    const cleanedPhone = playerPhone.trim().replace(/\D/g, '');
    if (!/^[6789]\d{9}$/.test(cleanedPhone)) {
      setBookingError('Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.');
      return;
    }

    try {
      setIsProcessing(true);
      setBookingError(null);

      const res = await bookingApi.createBooking({
        venueId: venue.venueId,
        facilityId: selectedFacility.facilityId,
        customerUserUuid: userUuid || undefined,
        guestName: playerName.trim(),
        guestPhone: cleanedPhone,
        guestEmail: playerEmail.trim() || undefined,
        bookingDate: selectedDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        sportName: selectedSport,
        baseAmount: selectedSlot.price,
        totalAmount: selectedSlot.price,
        bookingSource: 'ATHLON_APP',
        paymentStatus: paymentMethod === 'CASH' ? 'UNPAID' : 'PENDING',
        paymentMethod,
        paidAmount: 0,
        notes: `Court reservation via ATHLON (${paymentMethod})`,
      });

      if (res.success && res.data) {
        const bookingRef = res.data.bookingNumber || res.data.bookingId || (res.data as any).id;
        if (!bookingRef) {
          throw new Error('Booking confirmation failed: Server response omitted a valid booking reference number.');
        }
        setConfirmedBooking(res.data);
      } else {
        throw new Error((res as any)?.message || 'Unable to confirm booking. Please try again.');
      }
    } catch (err: unknown) {
      console.error('Booking failed:', err);
      const errMsg = err instanceof Error ? err.message : 'Slot checkout failed. It may have just been booked by another athlete.';
      setBookingError(errMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const availableSlots = useMemo(() => {
    return availability?.slots || [];
  }, [availability]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <div className="w-full max-w-xl rounded-3xl border border-border p-8 bg-card shadow-2xl space-y-5 animate-pulse">
          <div className="h-8 w-48 bg-foreground/10 rounded-xl" />
          <div className="h-4 w-32 bg-foreground/10 rounded-lg" />
          <div className="h-24 bg-foreground/5 rounded-2xl" />
          <div className="h-40 bg-foreground/5 rounded-2xl" />
          <div className="h-28 bg-foreground/5 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-8 text-center text-foreground space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center text-primary shadow-xl">
          <MapPin className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black">Venue Not Found</h2>
        <p className="text-xs text-muted-foreground max-w-sm">
          The requested venue could not be loaded or is currently unavailable for booking.
        </p>
        <Link
          href="/bookings"
          className="px-5 py-2.5 rounded-xl bg-primary text-black text-xs font-black shadow-lg shadow-primary/20 hover:scale-105 transition-all"
        >
          Return to Venues Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-black py-4 md:py-8 px-3 sm:px-4">
      {/* Centered Modern Booking Sheet Container (Matching Image 1 Flow) */}
      <div
        className="w-full max-w-xl sm:max-w-2xl mx-auto rounded-2xl sm:rounded-[32px] border p-3.5 sm:p-5 md:p-7 shadow-2xl space-y-4 sm:space-y-6"
        style={{
          backgroundColor: 'var(--athlon-card)',
          borderColor: 'var(--athlon-border)',
        }}
      >
        {/* ══════════════════════════════════════════════════════════════════════
            HEADER: VENUE NAME & DATE
           ══════════════════════════════════════════════════════════════════════ */}
        <div className="flex items-start justify-between gap-3 pb-2 sm:pb-3 border-b" style={{ borderColor: 'var(--athlon-border)' }}>
          <div className="space-y-0.5 sm:space-y-1">
            <h1 className="text-lg sm:text-2xl md:text-3xl font-black text-foreground tracking-tight leading-tight">
              {venue.name}
            </h1>
            <p className="text-[10.5px] sm:text-xs font-semibold text-foreground/60 flex items-center gap-1.5">
              <CalendarIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
              <span>{selectedDateObj.fullLabel}</span>
            </p>
          </div>

          <Link
            href="/bookings"
            className="w-7 h-7 sm:w-9 sm:h-9 rounded-full border flex items-center justify-center text-foreground/60 hover:text-foreground hover:bg-foreground/5 transition-all shrink-0"
            style={{
              backgroundColor: 'var(--athlon-surface)',
              borderColor: 'var(--athlon-border)',
            }}
            title="Back to Venues"
          >
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Link>
        </div>

        {/* Success Confirmation State */}
        {confirmedBooking ? (
          <div className="py-8 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-primary/20 border border-primary text-primary flex items-center justify-center mx-auto shadow-lg shadow-primary/20">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                Instant Confirmation
              </span>
              <h2 className="text-2xl font-black text-foreground">Court Slot Reserved!</h2>
              <p className="text-xs text-foreground/60 max-w-sm mx-auto">
                Your reservation for <span className="text-primary font-bold">{selectedFacility?.name}</span> on{' '}
                <span className="text-primary font-bold">{confirmedBooking.bookingDate}</span> at{' '}
                <span className="text-primary font-bold">
                  {formatSlotTime12H(confirmedBooking.startTime)} - {formatSlotTime12H(confirmedBooking.endTime)}
                </span>{' '}
                has been confirmed.
              </p>
            </div>

            {/* Reference Number */}
            <div
              className="p-3.5 rounded-2xl border flex items-center justify-between max-w-sm mx-auto"
              style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
            >
              <div className="text-left">
                <div className="text-[9px] uppercase font-bold text-foreground/50">Booking Reference</div>
                <div className="text-sm font-mono font-black text-primary">
                  #{confirmedBooking.bookingNumber}
                </div>
              </div>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(confirmedBooking.bookingNumber || '');
                  setCopiedRef(true);
                  setTimeout(() => setCopiedRef(false), 2000);
                }}
                className="px-2.5 py-1.5 rounded-lg border text-[11px] font-bold text-foreground hover:text-primary transition-all flex items-center gap-1"
                style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
              >
                {copiedRef ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedRef ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 max-w-sm mx-auto">
              <Link
                href="/bookings"
                className="w-full py-3 rounded-xl bg-primary text-black font-black text-xs shadow-lg shadow-primary/20 hover:scale-105 transition-all text-center"
              >
                Explore More Venues
              </Link>
              <button
                type="button"
                onClick={() => {
                  setConfirmedBooking(null);
                  setSelectedSlot(null);
                }}
                className="w-full py-3 rounded-xl border font-bold text-xs text-foreground/80 hover:text-foreground transition-all"
                style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
              >
                Book Another Slot
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleConfirmBooking} className="space-y-4 sm:space-y-6">
            {/* ══════════════════════════════════════════════════════════════════
                1. CHOOSE A FACILITY
               ══════════════════════════════════════════════════════════════════ */}
            <div
              className="rounded-xl sm:rounded-2xl border p-2.5 sm:p-4 space-y-2 sm:space-y-3"
              style={{
                backgroundColor: 'var(--athlon-surface)',
                borderColor: 'var(--athlon-border)',
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-[10.5px] sm:text-xs font-black uppercase tracking-wider text-foreground">
                    1. Choose a facility
                  </h3>
                  <p className="text-[9.5px] sm:text-[10.5px] text-foreground/50 mt-0.5">
                    Only its live available slots are shown below.
                  </p>
                </div>
                <span className="text-[8.5px] sm:text-[10px] font-black rounded-full bg-primary/15 text-primary border border-primary/20 px-2 py-0.5 sm:px-2.5 sm:py-1">
                  {facilities.length} available
                </span>
              </div>

              {/* Facility Cards Grid / Horizontal Scroll */}
              <div className="flex gap-2 sm:gap-2.5 overflow-x-auto pb-1 hide-scrollbar">
                {facilities.map((fac) => {
                  const isChosen = selectedFacility?.facilityId === fac.facilityId;
                  const sportLabel = fac.sports?.[0]?.sportName || fac.surfaceType || 'Sport';
                  const slotsCount = fac.facilityId === selectedFacility?.facilityId
                    ? availableSlots.length
                    : (fac.pricingRules?.length ? 15 : 12);

                  return (
                    <button
                      key={fac.facilityId}
                      type="button"
                      onClick={() => handleFacilityChange(fac)}
                      className={`min-w-[115px] sm:min-w-[140px] flex-1 text-left rounded-xl sm:rounded-2xl border p-2 sm:p-3 transition-all ${
                        isChosen
                          ? 'bg-primary text-black border-primary shadow-md shadow-primary/20 font-black scale-[1.01]'
                          : 'text-foreground/80 hover:border-primary/50'
                      }`}
                      style={{
                        backgroundColor: isChosen ? undefined : 'var(--athlon-card)',
                        borderColor: isChosen ? undefined : 'var(--athlon-border)',
                      }}
                    >
                      <span className="block text-[11px] sm:text-xs font-black truncate">{fac.name}</span>
                      <span
                        className={`block text-[9px] sm:text-[10px] mt-0.5 font-medium truncate ${
                          isChosen ? 'text-black/75' : 'text-foreground/50'
                        }`}
                      >
                        {sportLabel} · {slotsCount} slots
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date Selector Row */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-foreground/70">
                  Select Date
                </span>
                <span className="text-xs font-bold text-primary font-mono">
                  {selectedDateObj.dayName}, {selectedDateObj.month} {selectedDateObj.dayNum}
                </span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
                {nextDates.map((d) => {
                  const isDateSelected = selectedDate === d.dateStr;
                  return (
                    <button
                      key={d.dateStr}
                      type="button"
                      onClick={() => {
                        setSelectedDate(d.dateStr);
                        setSelectedSlot(null);
                      }}
                      className={`flex flex-col items-center justify-center min-w-[56px] py-2 px-1.5 rounded-xl border transition-all text-center shrink-0 ${
                        isDateSelected
                          ? 'bg-primary text-black border-primary font-black shadow-sm'
                          : 'text-foreground/70 hover:bg-foreground/5 font-semibold'
                      }`}
                      style={{
                        backgroundColor: isDateSelected ? undefined : 'var(--athlon-surface)',
                        borderColor: isDateSelected ? undefined : 'var(--athlon-border)',
                      }}
                    >
                      <span className={`text-[9px] uppercase ${isDateSelected ? 'font-black' : 'text-foreground/50'}`}>
                        {d.dayName}
                      </span>
                      <span className="text-sm font-black font-mono leading-tight">
                        {d.dayNum}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════════
                2. CHOOSE A TIME
               ══════════════════════════════════════════════════════════════════ */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
                  2. Choose a time
                </h3>
                {selectedFacility && (
                  <span className="text-xs font-bold text-primary truncate max-w-[50%]">
                    {selectedFacility.name}
                  </span>
                )}
              </div>

              {loadingSlots ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 animate-pulse">
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <div
                      key={n}
                      className="h-12 rounded-xl bg-foreground/5 border"
                      style={{ borderColor: 'var(--athlon-border)' }}
                    />
                  ))}
                </div>
              ) : availableSlots.length === 0 ? (
                <div
                  className="p-6 rounded-2xl border text-center space-y-1"
                  style={{
                    backgroundColor: 'var(--athlon-surface)',
                    borderColor: 'var(--athlon-border)',
                  }}
                >
                  <p className="text-xs font-bold text-foreground">No slots available for this date</p>
                  <p className="text-[10px] text-foreground/50">Try selecting another date or facility above</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {availableSlots.map((slot) => {
                    const isSlotChosen = selectedSlot?.startTime === slot.startTime;
                    return (
                      <button
                        key={slot.startTime}
                        type="button"
                        disabled={!slot.isAvailable}
                        onClick={() => setSelectedSlot(slot)}
                        className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                          !slot.isAvailable
                            ? 'opacity-30 cursor-not-allowed line-through'
                            : isSlotChosen
                            ? 'bg-primary text-black font-black border-primary shadow-md scale-[1.02]'
                            : 'hover:border-primary/50 text-foreground font-semibold'
                        }`}
                        style={{
                          backgroundColor: isSlotChosen ? undefined : 'var(--athlon-surface)',
                          borderColor: isSlotChosen ? undefined : 'var(--athlon-border)',
                        }}
                      >
                        <span className="text-xs font-bold font-mono">
                          {formatSlotTime12H(slot.startTime)}
                        </span>
                        <span className={`text-[10px] font-mono font-black ${isSlotChosen ? 'text-black/80' : 'text-primary'}`}>
                          ₹{slot.price}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ══════════════════════════════════════════════════════════════════
                3. PLAYER DETAILS & PAYMENT
               ══════════════════════════════════════════════════════════════════ */}
            <div className="space-y-4 pt-2 border-t" style={{ borderColor: 'var(--athlon-border)' }}>
              <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
                3. Player Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-foreground/70">Player Name</label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-foreground/40 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder="Your Name"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border text-xs font-medium outline-none focus:border-primary text-foreground"
                      style={{
                        backgroundColor: 'var(--athlon-surface)',
                        borderColor: 'var(--athlon-border)',
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-foreground/70">Phone Number</label>
                    <span className="text-[10px] text-foreground/50">Mandatory (10 digits)</span>
                  </div>
                  <div className="relative flex items-center">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-foreground/50 font-bold text-xs pr-1.5 border-r border-foreground/10">
                      <Phone className="w-3.5 h-3.5 text-foreground/40" />
                      <span>+91</span>
                    </div>
                    <input
                      type="tel"
                      inputMode="numeric"
                      required
                      maxLength={10}
                      value={playerPhone}
                      onChange={(e) => setPlayerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="98765 43210"
                      className={`w-full pl-16 pr-3 py-2.5 rounded-xl border text-xs font-medium outline-none transition-all text-foreground ${
                        playerPhone.length > 0 && !/^[6789]\d{9}$/.test(playerPhone.trim())
                          ? 'border-rose-500 focus:border-rose-500'
                          : 'focus:border-primary'
                      }`}
                      style={{
                        backgroundColor: 'var(--athlon-surface)',
                        borderColor: playerPhone.length > 0 && !/^[6789]\d{9}$/.test(playerPhone.trim()) ? undefined : 'var(--athlon-border)',
                      }}
                    />
                  </div>
                  {playerPhone.length > 0 && !/^[6789]\d{9}$/.test(playerPhone.trim()) && (
                    <p className="text-[10px] text-rose-400 font-medium">
                      Enter valid 10-digit mobile number starting with 6, 7, 8, or 9
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-foreground/70">Email (Optional)</label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-foreground/40 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={playerEmail}
                      onChange={(e) => setPlayerEmail(e.target.value)}
                      placeholder="Email Address"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border text-xs font-medium outline-none focus:border-primary text-foreground"
                      style={{
                        backgroundColor: 'var(--athlon-surface)',
                        borderColor: 'var(--athlon-border)',
                      }}
                    />
                  </div>
                </div>

                {selectedFacility?.sports && selectedFacility.sports.length > 1 && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-foreground/70">Sport</label>
                    <select
                      value={selectedSport}
                      onChange={(e) => setSelectedSport(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border text-xs font-bold text-foreground outline-none focus:border-primary cursor-pointer"
                      style={{
                        backgroundColor: 'var(--athlon-surface)',
                        borderColor: 'var(--athlon-border)',
                      }}
                    >
                      {selectedFacility.sports.map((s) => (
                        <option key={s.id} value={s.sportName}>
                          {s.sportName}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Payment Option Tabs */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-foreground/70">Payment Option</label>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { id: 'UPI' as const, label: 'UPI / GPay', icon: '⚡' },
                    { id: 'CARD' as const, label: 'Cards / Net', icon: '💳' },
                    { id: 'CASH' as const, label: 'Pay at Venue', icon: '💵' },
                  ]).map((m) => {
                    const isMethodSelected = paymentMethod === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id)}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center flex flex-col items-center gap-1 cursor-pointer ${
                          isMethodSelected
                            ? 'bg-primary text-black border-primary shadow-sm font-black'
                            : 'text-foreground/70 hover:bg-foreground/5 font-semibold'
                        }`}
                        style={{
                          backgroundColor: isMethodSelected ? undefined : 'var(--athlon-surface)',
                          borderColor: isMethodSelected ? undefined : 'var(--athlon-border)',
                        }}
                      >
                        <span className="text-sm">{m.icon}</span>
                        <span className="text-[10px] leading-tight">{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Booking Summary Box */}
              <div
                className="p-3.5 rounded-2xl border space-y-2 text-xs"
                style={{
                  backgroundColor: 'var(--athlon-surface)',
                  borderColor: 'var(--athlon-border)',
                }}
              >
                <div className="flex items-center justify-between text-foreground/70">
                  <span>
                    {selectedFacility?.name || 'Court'} · {selectedSlot ? `${formatSlotTime12H(selectedSlot.startTime)} - ${formatSlotTime12H(selectedSlot.endTime)}` : 'Select a slot'}
                  </span>
                  <span className="font-mono font-bold">₹{selectedSlot?.price || 0}</span>
                </div>
                <div className="flex items-center justify-between text-foreground/70">
                  <span>Convenience Fee:</span>
                  <span className="text-primary font-bold uppercase">FREE</span>
                </div>
                <div className="flex items-center justify-between pt-1.5 border-t border-foreground/10 text-sm font-black text-foreground">
                  <span>Total Amount:</span>
                  <span className="text-primary font-mono text-base">₹{selectedSlot?.price || 0}</span>
                </div>
              </div>

              {bookingError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
                  {bookingError}
                </div>
              )}

              {/* Confirm CTA Button */}
              <button
                type="submit"
                disabled={
                  isProcessing ||
                  !selectedSlot ||
                  !playerName.trim() ||
                  !/^[6789]\d{9}$/.test(playerPhone.trim().replace(/\D/g, ''))
                }
                className="w-full py-3.5 rounded-2xl bg-primary text-black font-black text-xs shadow-lg shadow-primary/25 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Confirming Court Reservation...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>
                      Confirm Booking ({selectedFacility?.name} • {selectedSlot ? formatSlotTime12H(selectedSlot.startTime) : 'Slot'} - ₹{selectedSlot?.price || 0})
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

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
