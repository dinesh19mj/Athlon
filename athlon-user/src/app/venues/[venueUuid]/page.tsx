'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin,
  Clock,
  Phone,
  CheckCircle2,
  User,
  Check,
  Copy,
  RefreshCw,
  X,
  Mail,
  Calendar as CalendarIcon,
  CalendarCheck,
  AlertTriangle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Flame,
  ArrowRight,
  ShieldCheck,
  Zap,
  CreditCard,
  Banknote,
  SlidersHorizontal,
  Sun,
  Sunrise,
  Moon
} from 'lucide-react';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { UserService } from '@/lib/api/user';
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

function getSlotPeriod(timeStr: string): 'morning' | 'afternoon' | 'evening' {
  if (!timeStr) return 'morning';
  const hour = parseInt(timeStr.split(':')[0], 10);
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

export default function VenueBookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const venueUuid = params?.venueUuid as string;
  const { personalProfile } = useWorkspaceStore();
  const { isAuthenticated, userUuid, userEmail } = useAuthStore();

  const [venue, setVenue] = useState<VenueDto | null>(null);
  const [facilities, setFacilities] = useState<FacilityDto[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<FacilityDto | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [availability, setAvailability] = useState<FacilityAvailabilityResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Time Period Filter: ALL, MORNING, AFTERNOON, EVENING
  const [timeFilter, setTimeFilter] = useState<'ALL' | 'MORNING' | 'AFTERNOON' | 'EVENING'>('ALL');

  // Selected Slots for checkout (multiple slot selection support)
  const [selectedSlots, setSelectedSlots] = useState<SlotDto[]>([]);

  // Checkout Form State
  const [playerName, setPlayerName] = useState(() => personalProfile?.name || (userEmail ? userEmail.split('@')[0] : ''));
  const [playerPhone, setPlayerPhone] = useState('');
  const [playerEmail, setPlayerEmail] = useState(() => userEmail || '');
  const [selectedSport, setSelectedSport] = useState('Badminton');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'CASH'>('UPI');
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmedBookings, setConfirmedBookings] = useState<BookingDto[]>([]);
  const [bookingPartialWarning, setBookingPartialWarning] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [copiedRefId, setCopiedRefId] = useState<string | null>(null);
  const [copiedAllRefs, setCopiedAllRefs] = useState(false);
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);

  const playerDetailsSectionRef = useRef<HTMLDivElement>(null);

  // Total price for all chosen slots
  const totalSlotsPrice = useMemo(() => {
    return selectedSlots.reduce((acc, s) => acc + (s.price || 0), 0);
  }, [selectedSlots]);

  // Contiguous time spans detection for smooth UX summary
  const contiguousSummary = useMemo(() => {
    if (selectedSlots.length === 0) return null;
    if (selectedSlots.length === 1) {
      return {
        label: `${formatSlotTime12H(selectedSlots[0].startTime)} – ${formatSlotTime12H(selectedSlots[0].endTime)}`,
        isContiguous: true,
        durationHours: 1
      };
    }

    // Check if sorted slots form one contiguous block
    let isSingleContiguous = true;
    for (let i = 0; i < selectedSlots.length - 1; i++) {
      if (selectedSlots[i].endTime !== selectedSlots[i + 1].startTime) {
        isSingleContiguous = false;
        break;
      }
    }

    if (isSingleContiguous) {
      const first = selectedSlots[0];
      const last = selectedSlots[selectedSlots.length - 1];
      return {
        label: `${formatSlotTime12H(first.startTime)} – ${formatSlotTime12H(last.endTime)}`,
        isContiguous: true,
        durationHours: selectedSlots.length
      };
    }

    return {
      label: `${selectedSlots.length} slots across the day`,
      isContiguous: false,
      durationHours: selectedSlots.length
    };
  }, [selectedSlots]);

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

  // Auto-prefill player details from logged in user account
  useEffect(() => {
    if (userEmail) {
      setPlayerEmail((prev) => (prev ? prev : userEmail));
    }
    if (personalProfile?.name) {
      setPlayerName((prev) => (prev ? prev : personalProfile.name));
    }

    if (!userUuid) return;

    let isMounted = true;
    async function loadUserProfile() {
      try {
        const res = await UserService.getUserByUuid(userUuid!);
        if (isMounted && res.success && res.data) {
          const u = res.data;
          const fullName = [u.firstName, u.lastName].filter(Boolean).join(' ').trim();
          if (fullName) {
            setPlayerName(fullName);
          }
          if (u.phone) {
            const cleanPhone = u.phone.replace(/\D/g, '').slice(-10);
            if (cleanPhone) {
              setPlayerPhone(cleanPhone);
            }
          }
          if (u.email) {
            setPlayerEmail(u.email);
          } else if (userEmail) {
            setPlayerEmail(userEmail);
          }
        }
      } catch (err) {
        console.warn('Could not auto-fetch user details for booking prefill:', err);
      }
    }

    loadUserProfile();
    return () => {
      isMounted = false;
    };
  }, [userUuid, userEmail, personalProfile?.name]);

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
          setSelectedSlots([]); // Clear selected slots so stale slots/prices are never retained across dates/facilities
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
    setSelectedSlots([]);
    if (facility.sports && facility.sports.length > 0) {
      setSelectedSport(facility.sports[0].sportName);
    }
  };

  const handleToggleSlot = (slot: SlotDto) => {
    if (!slot.isAvailable) return;
    setSelectedSlots((prev) => {
      const exists = prev.some((s) => s.startTime === slot.startTime);
      if (exists) {
        return prev.filter((s) => s.startTime !== slot.startTime);
      } else {
        const next = [...prev, slot];
        return next.sort((a, b) => a.startTime.localeCompare(b.startTime));
      }
    });
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!venue || !selectedFacility || selectedSlots.length === 0) return;

    if (!playerName.trim()) {
      setBookingError('Please enter player name to proceed.');
      playerDetailsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    const cleanedPhone = playerPhone.trim().replace(/\D/g, '');
    if (!/^[6789]\d{9}$/.test(cleanedPhone)) {
      setBookingError('Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.');
      playerDetailsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    try {
      setIsProcessing(true);
      setBookingError(null);
      setBookingPartialWarning(null);

      const successfulBookings: BookingDto[] = [];
      const failedSlots: { slot: SlotDto; reason: string }[] = [];

      // Process reservations for each selected slot sequentially
      for (let i = 0; i < selectedSlots.length; i++) {
        const slot = selectedSlots[i];
        try {
          const res = await bookingApi.createBooking({
            venueId: venue.venueId,
            facilityId: selectedFacility.facilityId,
            customerUserUuid: userUuid || undefined,
            guestName: playerName.trim(),
            guestPhone: cleanedPhone,
            guestEmail: playerEmail.trim() || undefined,
            bookingDate: selectedDate,
            startTime: slot.startTime,
            endTime: slot.endTime,
            sportName: selectedSport,
            baseAmount: slot.price,
            totalAmount: slot.price,
            bookingSource: 'ATHLON_APP',
            paymentStatus: paymentMethod === 'CASH' ? 'UNPAID' : 'PENDING',
            paymentMethod,
            paidAmount: 0,
            notes: `Court reservation via ATHLON (${paymentMethod}) [${formatSlotTime12H(slot.startTime)} - ${formatSlotTime12H(slot.endTime)}]`,
          });

          if (res.success && res.data) {
            const bookingRef = res.data.bookingNumber || res.data.bookingId || (res.data as any).id;
            if (bookingRef) {
              successfulBookings.push(res.data);
            } else {
              failedSlots.push({ slot, reason: 'Missing booking reference from server.' });
            }
          } else {
            failedSlots.push({ slot, reason: (res as any)?.message || 'Slot reservation was rejected by server.' });
          }
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Slot may have just been booked by another athlete.';
          failedSlots.push({ slot, reason: msg });
        }
      }

      if (successfulBookings.length > 0) {
        setConfirmedBookings(successfulBookings);
        // Refresh availability in the background so slots update immediately
        facilityApi.getFacilityAvailability(selectedFacility.facilityId, selectedDate)
          .then((res) => {
            if (res.success && res.data) {
              setAvailability(res.data);
            }
          })
          .catch(() => {});

        if (failedSlots.length > 0) {
          setBookingPartialWarning(
            `Successfully reserved ${successfulBookings.length} slot(s). However, ${failedSlots.length} slot(s) (${failedSlots.map((f) => formatSlotTime12H(f.slot.startTime)).join(', ')}) could not be reserved: ${failedSlots.map((f) => f.reason).join('; ')}`
          );
        }
      } else {
        const firstError = failedSlots[0]?.reason || 'Slot checkout failed. Please try again.';
        throw new Error(firstError);
      }
    } catch (err: unknown) {
      console.error('Booking failed:', err);
      const errMsg = err instanceof Error ? err.message : 'Slot checkout failed. It may have just been booked by another athlete.';
      setBookingError(errMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFloatingBarClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSlots.length === 0) return;

    const cleanedPhone = playerPhone.trim().replace(/\D/g, '');
    const isPhoneValid = /^[6789]\d{9}$/.test(cleanedPhone);

    if (!playerName.trim() || !isPhoneValid) {
      playerDetailsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
      if (!playerName.trim()) {
        setBookingError('Please enter player name below to proceed.');
      } else if (!isPhoneValid) {
        setBookingError('Please enter a valid 10-digit mobile number below.');
      }
      return;
    }

    handleConfirmBooking(e);
  };

  const availableSlots = useMemo(() => {
    return availability?.slots || [];
  }, [availability]);

  // Filter slots by morning, afternoon, evening
  const filteredSlots = useMemo(() => {
    if (timeFilter === 'ALL') return availableSlots;
    return availableSlots.filter((slot) => {
      const period = getSlotPeriod(slot.startTime);
      if (timeFilter === 'MORNING') return period === 'morning';
      if (timeFilter === 'AFTERNOON') return period === 'afternoon';
      if (timeFilter === 'EVENING') return period === 'evening';
      return true;
    });
  }, [availableSlots, timeFilter]);

  const periodCounts = useMemo(() => {
    const counts = { morning: 0, afternoon: 0, evening: 0 };
    availableSlots.forEach((s) => {
      if (s.isAvailable) {
        const p = getSlotPeriod(s.startTime);
        counts[p]++;
      }
    });
    return counts;
  }, [availableSlots]);

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
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-black py-3 sm:py-6 px-3 sm:px-4 pb-48 sm:pb-56">
      {/* Centered Modern Booking Sheet Container */}
      <div
        className="w-full max-w-xl sm:max-w-2xl mx-auto rounded-2xl sm:rounded-[32px] border p-3.5 sm:p-5 md:p-6 shadow-2xl space-y-5"
        style={{
          backgroundColor: 'var(--athlon-card)',
          borderColor: 'var(--athlon-border)',
        }}
      >
        {/* ══════════════════════════════════════════════════════════════════════
            HEADER: VENUE IDENTITY & DATE BADGE
           ══════════════════════════════════════════════════════════════════════ */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b" style={{ borderColor: 'var(--athlon-border)' }}>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-primary/15 text-primary border border-primary/25">
                Instant Court Booking
              </span>
              {venue.city && (
                <span className="text-[10.5px] font-medium text-foreground/50 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-foreground/40" />
                  {venue.city}
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-foreground tracking-tight leading-tight">
              {venue.name}
            </h1>
            <p className="text-[11px] sm:text-xs font-semibold text-foreground/60 flex items-center gap-1.5 pt-0.5">
              <CalendarIcon className="w-3.5 h-3.5 text-primary" />
              <span>{selectedDateObj.fullLabel}</span>
            </p>
          </div>

          <Link
            href="/bookings"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex items-center justify-center text-foreground/60 hover:text-foreground hover:bg-foreground/5 transition-all shrink-0"
            style={{
              backgroundColor: 'var(--athlon-surface)',
              borderColor: 'var(--athlon-border)',
            }}
            title="Back to Venues"
          >
            <X className="w-4 h-4" />
          </Link>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            SUCCESS CONFIRMATION SCREEN
           ══════════════════════════════════════════════════════════════════════ */}
        {confirmedBookings.length > 0 ? (
          <div className="py-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-primary/20 border border-primary text-primary flex items-center justify-center mx-auto shadow-lg shadow-primary/20">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                Instant Confirmation
              </span>
              <h2 className="text-2xl font-black text-foreground">
                {confirmedBookings.length === 1 ? 'Court Slot Reserved!' : `${confirmedBookings.length} Court Slots Reserved!`}
              </h2>
              <p className="text-xs text-foreground/60 max-w-sm mx-auto">
                Your reservation for <span className="text-primary font-bold">{selectedFacility?.name}</span> on{' '}
                <span className="text-primary font-bold">{confirmedBookings[0].bookingDate}</span> has been confirmed.
              </p>
            </div>

            {bookingPartialWarning && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-medium max-w-md mx-auto text-left flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                <span>{bookingPartialWarning}</span>
              </div>
            )}

            {/* Reference Numbers & Booked Slots Card List */}
            <div
              className="p-3.5 rounded-2xl border space-y-2.5 max-w-md mx-auto text-left"
              style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
            >
              <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: 'var(--athlon-border)' }}>
                <div className="text-[10px] uppercase font-black text-foreground/50">
                  Reserved Slot{confirmedBookings.length > 1 ? 's' : ''} ({confirmedBookings.length})
                </div>
                <div className="text-xs font-mono font-black text-primary">
                  Total: ₹{confirmedBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0)}
                </div>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {confirmedBookings.map((b) => (
                  <div
                    key={b.bookingUuid || b.bookingId}
                    className="p-2.5 rounded-xl border flex items-center justify-between gap-2"
                    style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                  >
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-foreground flex items-center gap-1.5 font-mono">
                        <Clock className="w-3 h-3 text-primary" />
                        <span>{formatSlotTime12H(b.startTime)} - {formatSlotTime12H(b.endTime)}</span>
                      </div>
                      <div className="text-[10px] font-mono text-primary font-bold">
                        #{b.bookingNumber}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-foreground/80">
                        ₹{b.totalAmount}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(b.bookingNumber || '');
                          setCopiedRefId(b.bookingNumber);
                          setTimeout(() => setCopiedRefId(null), 2000);
                        }}
                        className="px-2 py-1 rounded-lg border text-[10px] font-bold text-foreground hover:text-primary transition-all flex items-center gap-1 cursor-pointer"
                        style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
                        title="Copy Reference"
                      >
                        {copiedRefId === b.bookingNumber ? (
                          <>
                            <Check className="w-3 h-3 text-primary" />
                            <span className="text-primary">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {confirmedBookings.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    const allRefs = confirmedBookings.map((b) => `#${b.bookingNumber}`).join(', ');
                    navigator.clipboard.writeText(allRefs);
                    setCopiedAllRefs(true);
                    setTimeout(() => setCopiedAllRefs(false), 2000);
                  }}
                  className="w-full py-2 rounded-xl border text-[11px] font-bold text-foreground hover:text-primary transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                >
                  {copiedAllRefs ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedAllRefs ? 'All References Copied!' : 'Copy All References'}</span>
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2 max-w-md mx-auto">
              <Link
                href="/my-bookings"
                className="w-full py-3 rounded-xl bg-primary text-black font-black text-xs shadow-lg shadow-primary/20 hover:scale-105 transition-all text-center flex items-center justify-center gap-1.5"
              >
                <CalendarCheck className="w-3.5 h-3.5" />
                View in My Bookings
              </Link>
              <button
                type="button"
                onClick={() => {
                  setConfirmedBookings([]);
                  setSelectedSlots([]);
                  setBookingPartialWarning(null);
                }}
                className="w-full py-3 rounded-xl border font-bold text-xs text-foreground/80 hover:text-foreground transition-all cursor-pointer"
                style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
              >
                Book More Slots
              </button>
              <Link
                href="/bookings"
                className="w-full py-3 rounded-xl border font-bold text-xs text-foreground/60 hover:text-foreground transition-all text-center"
                style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
              >
                Explore Venues
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleConfirmBooking} className="space-y-5">
            {/* ══════════════════════════════════════════════════════════════════
                1. FACILITY PICKER (SLICK SEGMENTED PILLS)
               ══════════════════════════════════════════════════════════════════ */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-foreground/70">
                  1. Select Court / Facility
                </span>
                <span className="text-[10px] font-bold text-primary font-mono">
                  {facilities.length} available
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {facilities.map((fac) => {
                  const isChosen = selectedFacility?.facilityId === fac.facilityId;
                  const sportLabel = fac.sports?.[0]?.sportName || fac.surfaceType || 'Sport';
                  const slotsCount = fac.facilityId === selectedFacility?.facilityId
                    ? availableSlots.filter(s => s.isAvailable).length
                    : (fac.pricingRules?.length ? 15 : 12);

                  return (
                    <button
                      key={fac.facilityId}
                      type="button"
                      onClick={() => handleFacilityChange(fac)}
                      className={`text-left rounded-xl sm:rounded-2xl border p-2.5 sm:p-3 transition-all cursor-pointer relative overflow-hidden ${
                        isChosen
                          ? 'border-primary shadow-md shadow-primary/20 ring-1 ring-primary'
                          : 'text-foreground/80 hover:border-primary/40'
                      }`}
                      style={{
                        backgroundColor: isChosen ? 'var(--athlon-surface)' : 'var(--athlon-card)',
                        borderColor: isChosen ? 'var(--athlon-primary)' : 'var(--athlon-border)',
                      }}
                    >
                      {isChosen && (
                        <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none">
                          <div className="absolute transform rotate-45 bg-primary text-black text-[8px] font-black right-[-24px] top-[4px] w-[60px] text-center">
                            ACTIVE
                          </div>
                        </div>
                      )}
                      <span className="block text-xs sm:text-[13px] font-black truncate">{fac.name}</span>
                      <span className="block text-[10px] text-foreground/50 font-medium truncate mt-0.5">
                        {sportLabel} · <span className="text-primary font-bold">{slotsCount} live slots</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════════
                DATE SELECTOR (HORIZONTAL CALENDAR STRIP)
               ══════════════════════════════════════════════════════════════════ */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-foreground/70">
                  Select Date
                </span>
                <span className="text-xs font-bold text-primary font-mono">
                  {selectedDateObj.dayName}, {selectedDateObj.month} {selectedDateObj.dayNum}
                </span>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
                {nextDates.map((d) => {
                  const isDateSelected = selectedDate === d.dateStr;
                  return (
                    <button
                      key={d.dateStr}
                      type="button"
                      onClick={() => {
                        setSelectedDate(d.dateStr);
                        setSelectedSlots([]);
                      }}
                      className={`flex flex-col items-center justify-center min-w-[54px] py-2 px-1 rounded-xl border transition-all text-center shrink-0 cursor-pointer ${
                        isDateSelected
                          ? 'bg-primary text-black border-primary font-black shadow-sm scale-[1.02]'
                          : 'text-foreground/70 hover:bg-foreground/5 font-semibold'
                      }`}
                      style={{
                        backgroundColor: isDateSelected ? undefined : 'var(--athlon-surface)',
                        borderColor: isDateSelected ? undefined : 'var(--athlon-border)',
                      }}
                    >
                      <span className={`text-[8.5px] uppercase ${isDateSelected ? 'font-black text-black' : 'text-foreground/50'}`}>
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
                2. TIME PERIOD FILTER & SLOTS SELECTION (REDESIGNED)
               ══════════════════════════════════════════════════════════════════ */}
            <div
              className="rounded-2xl border p-3.5 sm:p-4 space-y-3.5"
              style={{
                backgroundColor: 'var(--athlon-surface)',
                borderColor: 'var(--athlon-border)',
              }}
            >
              {/* Header with Title and Clear Action */}
              <div className="flex items-center justify-between gap-2 border-b pb-2.5" style={{ borderColor: 'var(--athlon-border)' }}>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
                      2. Choose Slots
                    </h3>
                    <span className="text-[9px] font-bold text-foreground/50">
                      (Select multiple)
                    </span>
                  </div>
                  <p className="text-[10px] text-foreground/60 mt-0.5">
                    Tap any slot to add or remove it from your reservation.
                  </p>
                </div>

                {selectedSlots.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedSlots([])}
                    className="text-[10px] font-bold text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1 px-2 py-1 rounded-lg border border-rose-500/20 bg-rose-500/5 cursor-pointer shrink-0"
                  >
                    <X className="w-3 h-3" />
                    <span>Clear all ({selectedSlots.length})</span>
                  </button>
                )}
              </div>

              {/* Time Period Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 hide-scrollbar">
                {[
                  { id: 'ALL' as const, label: 'All Slots', icon: SlidersHorizontal, count: availableSlots.filter(s => s.isAvailable).length },
                  { id: 'MORNING' as const, label: 'Morning', icon: Sunrise, count: periodCounts.morning },
                  { id: 'AFTERNOON' as const, label: 'Afternoon', icon: Sun, count: periodCounts.afternoon },
                  { id: 'EVENING' as const, label: 'Evening', icon: Moon, count: periodCounts.evening },
                ].map((tab) => {
                  const isActive = timeFilter === tab.id;
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setTimeFilter(tab.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition-all shrink-0 cursor-pointer ${
                        isActive
                          ? 'bg-primary text-black border-primary shadow-sm font-black'
                          : 'text-foreground/70 hover:bg-foreground/5'
                      }`}
                      style={{
                        backgroundColor: isActive ? undefined : 'var(--athlon-card)',
                        borderColor: isActive ? undefined : 'var(--athlon-border)',
                      }}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{tab.label}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                          isActive ? 'bg-black/20 text-black' : 'bg-foreground/10 text-foreground/60'
                        }`}
                      >
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Slots Grid */}
              {loadingSlots ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 animate-pulse py-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <div
                      key={n}
                      className="h-14 rounded-xl bg-foreground/5 border"
                      style={{ borderColor: 'var(--athlon-border)' }}
                    />
                  ))}
                </div>
              ) : filteredSlots.length === 0 ? (
                <div
                  className="p-6 rounded-xl border text-center space-y-1"
                  style={{
                    backgroundColor: 'var(--athlon-card)',
                    borderColor: 'var(--athlon-border)',
                  }}
                >
                  <p className="text-xs font-bold text-foreground">No slots available for this period</p>
                  <p className="text-[10px] text-foreground/50">
                    Switch to &quot;All Slots&quot; or select another date above
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {filteredSlots.map((slot) => {
                    const isSlotChosen = selectedSlots.some((s) => s.startTime === slot.startTime);
                    return (
                      <button
                        key={slot.startTime}
                        type="button"
                        disabled={!slot.isAvailable}
                        onClick={() => handleToggleSlot(slot)}
                        className={`p-2 sm:p-2.5 rounded-xl border flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer relative ${
                          !slot.isAvailable
                            ? 'opacity-25 cursor-not-allowed line-through'
                            : isSlotChosen
                            ? 'bg-primary text-black font-black border-primary shadow-md shadow-primary/20 scale-[1.02] ring-1 ring-primary'
                            : 'hover:border-primary/50 text-foreground font-semibold'
                        }`}
                        style={{
                          backgroundColor: isSlotChosen ? undefined : 'var(--athlon-card)',
                          borderColor: isSlotChosen ? undefined : 'var(--athlon-border)',
                        }}
                      >
                        {isSlotChosen && (
                          <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-black/20 flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-black stroke-[3]" />
                          </span>
                        )}
                        <span className="text-xs font-bold font-mono">
                          {formatSlotTime12H(slot.startTime)}
                        </span>
                        <span className={`text-[10.5px] font-mono font-black ${isSlotChosen ? 'text-black/80' : 'text-primary'}`}>
                          ₹{slot.price}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Contiguity Banner / Selection Indicator */}
              {selectedSlots.length > 0 && contiguousSummary && (
                <div
                  className="p-2.5 sm:p-3 rounded-xl border flex items-center justify-between gap-2 animate-in fade-in-50 duration-150"
                  style={{
                    backgroundColor: 'var(--athlon-card)',
                    borderColor: 'var(--athlon-border)',
                  }}
                >
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-6 h-6 rounded-lg bg-primary/20 text-primary flex items-center justify-center shrink-0">
                      <Flame className="w-3.5 h-3.5 text-primary" />
                    </span>
                    <div>
                      <div className="font-black text-foreground flex items-center gap-1.5">
                        <span>{contiguousSummary.durationHours} hr{contiguousSummary.durationHours > 1 ? 's' : ''} court session</span>
                        <span className="text-[10px] font-bold text-primary bg-primary/15 px-1.5 py-0.2 rounded-full">
                          {selectedSlots.length} slot{selectedSlots.length > 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="text-[10.5px] font-mono text-foreground/60">
                        {contiguousSummary.label}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-[9px] uppercase font-bold text-foreground/50">Subtotal</div>
                    <div className="text-sm font-black font-mono text-primary">
                      ₹{totalSlotsPrice}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ══════════════════════════════════════════════════════════════════
                3. PLAYER DETAILS (COMPACT & PREFILLED)
               ══════════════════════════════════════════════════════════════════ */}
            <div
              ref={playerDetailsSectionRef}
              className="rounded-2xl border p-3.5 sm:p-4 space-y-3.5"
              style={{
                backgroundColor: 'var(--athlon-surface)',
                borderColor: 'var(--athlon-border)',
              }}
            >
              <div className="flex items-center justify-between gap-2 border-b pb-2.5" style={{ borderColor: 'var(--athlon-border)' }}>
                <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
                  3. Player & Contact
                </h3>
                {(isAuthenticated || userUuid || userEmail) && (
                  <span className="text-[9.5px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    Prefilled from account
                  </span>
                )}
              </div>

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
                      className="w-full pl-9 pr-3 py-2 rounded-xl border text-xs font-medium outline-none focus:border-primary text-foreground"
                      style={{
                        backgroundColor: 'var(--athlon-card)',
                        borderColor: 'var(--athlon-border)',
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-foreground/70">Phone Number</label>
                    <span className="text-[9.5px] text-foreground/50">Mandatory</span>
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
                      className={`w-full pl-16 pr-3 py-2 rounded-xl border text-xs font-medium outline-none transition-all text-foreground ${
                        playerPhone.length > 0 && !/^[6789]\d{9}$/.test(playerPhone.trim())
                          ? 'border-rose-500 focus:border-rose-500'
                          : 'focus:border-primary'
                      }`}
                      style={{
                        backgroundColor: 'var(--athlon-card)',
                        borderColor: playerPhone.length > 0 && !/^[6789]\d{9}$/.test(playerPhone.trim()) ? undefined : 'var(--athlon-border)',
                      }}
                    />
                  </div>
                  {playerPhone.length > 0 && !/^[6789]\d{9}$/.test(playerPhone.trim()) && (
                    <p className="text-[9.5px] text-rose-400 font-medium">
                      Enter 10-digit mobile starting with 6, 7, 8, or 9
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
                      className="w-full pl-9 pr-3 py-2 rounded-xl border text-xs font-medium outline-none focus:border-primary text-foreground"
                      style={{
                        backgroundColor: 'var(--athlon-card)',
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
                      className="w-full px-3 py-2 rounded-xl border text-xs font-bold text-foreground outline-none focus:border-primary cursor-pointer"
                      style={{
                        backgroundColor: 'var(--athlon-card)',
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

              {/* Payment Option Segmented Cards */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[11px] font-bold text-foreground/70">Payment Option</label>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { id: 'UPI' as const, label: 'UPI / GPay', icon: Zap },
                    { id: 'CARD' as const, label: 'Cards / Net', icon: CreditCard },
                    { id: 'CASH' as const, label: 'Pay at Venue', icon: Banknote },
                  ]).map((m) => {
                    const isMethodSelected = paymentMethod === m.id;
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id)}
                        className={`p-2 sm:p-2.5 rounded-xl border text-xs font-bold transition-all text-center flex flex-col items-center gap-1 cursor-pointer ${
                          isMethodSelected
                            ? 'bg-primary text-black border-primary shadow-sm font-black scale-[1.01]'
                            : 'text-foreground/70 hover:bg-foreground/5 font-semibold'
                        }`}
                        style={{
                          backgroundColor: isMethodSelected ? undefined : 'var(--athlon-card)',
                          borderColor: isMethodSelected ? undefined : 'var(--athlon-border)',
                        }}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-[10px] leading-tight">{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Error Message */}
            {bookingError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{bookingError}</span>
              </div>
            )}
          </form>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          MODERN FLOATING DOCK / BOTTOM CHECKOUT BAR (ELEVATED FOR MOBILE)
         ══════════════════════════════════════════════════════════════════════ */}
      {confirmedBookings.length === 0 && (
        <div
          className="fixed bottom-10 sm:bottom-12 left-3.5 right-3.5 sm:left-1/2 sm:-translate-x-1/2 sm:w-[calc(100%-2rem)] sm:max-w-xl md:max-w-2xl z-50 rounded-2xl sm:rounded-3xl border shadow-2xl p-3 sm:p-4 backdrop-blur-2xl transition-all"
          style={{
            backgroundColor: 'rgba(var(--athlon-card-rgb, 15, 23, 42), 0.94)',
            borderColor: selectedSlots.length > 0 ? 'var(--athlon-primary)' : 'var(--athlon-border)',
            boxShadow: '0 12px 36px -6px rgba(0, 0, 0, 0.5), 0 0 16px -2px rgba(var(--athlon-primary-rgb, 16, 185, 129), 0.15)',
          }}
        >
          <div className="max-w-xl sm:max-w-2xl mx-auto space-y-2">
            {/* Expandable Breakdown Drawer */}
            {isBreakdownOpen && selectedSlots.length > 0 && (
              <div
                className="p-3 rounded-2xl border space-y-2 text-xs mb-2 animate-in slide-in-from-bottom-2 duration-150 max-h-48 overflow-y-auto"
                style={{
                  backgroundColor: 'var(--athlon-surface)',
                  borderColor: 'var(--athlon-border)',
                }}
              >
                <div className="flex items-center justify-between border-b pb-1.5 font-bold text-foreground/70" style={{ borderColor: 'var(--athlon-border)' }}>
                  <span>{selectedFacility?.name} · {selectedDateObj.dayName}, {selectedDateObj.month} {selectedDateObj.dayNum}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedSlots([])}
                    className="text-[10px] text-rose-400 hover:underline cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
                <div className="space-y-1.5">
                  {selectedSlots.map((slot) => (
                    <div key={slot.startTime} className="flex items-center justify-between text-foreground/80 font-mono text-[11px]">
                      <span>{formatSlotTime12H(slot.startTime)} – {formatSlotTime12H(slot.endTime)}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">₹{slot.price}</span>
                        <button
                          type="button"
                          onClick={() => handleToggleSlot(slot)}
                          className="hover:text-rose-400 text-foreground/40 transition-colors p-0.5 cursor-pointer"
                          title="Remove slot"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-1 border-t text-[10px] text-foreground/60" style={{ borderColor: 'var(--athlon-border)' }}>
                  <span>Convenience Fee:</span>
                  <span className="text-primary font-bold">FREE</span>
                </div>
              </div>
            )}

            {/* Bottom Bar Controls */}
            <div className="flex items-center justify-between gap-3">
              {/* Left Details & Breakdown Toggle */}
              <div className="space-y-0.5 min-w-0 pl-1 sm:pl-0">
                {selectedSlots.length === 0 ? (
                  <div>
                    <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      <span>No slots selected</span>
                    </div>
                    <div className="text-[10px] sm:text-[10.5px] text-foreground/50">
                      Pick court slots above to proceed
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-base sm:text-lg font-black font-mono text-primary">
                        ₹{totalSlotsPrice}
                      </span>
                      <span className="text-[11px] font-bold text-foreground/80">
                        ({selectedSlots.length} slot{selectedSlots.length > 1 ? 's' : ''})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsBreakdownOpen((prev) => !prev)}
                      className="text-[10px] font-semibold text-foreground/60 hover:text-primary transition-colors flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>{isBreakdownOpen ? 'Hide breakdown' : 'View breakdown'}</span>
                      {isBreakdownOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
                    </button>
                  </div>
                )}
              </div>

              {/* Right CTA Button - Lifted, fully visible, interactive */}
              <button
                type="button"
                onClick={handleFloatingBarClick}
                disabled={isProcessing || selectedSlots.length === 0}
                className="py-3 px-5 sm:px-6 rounded-xl sm:rounded-2xl bg-primary text-black font-black text-xs sm:text-[13px] shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Reserving {selectedSlots.length} Slot{selectedSlots.length > 1 ? 's' : ''}...</span>
                  </>
                ) : selectedSlots.length === 0 ? (
                  <>
                    <span>Select Slots</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                ) : !playerName.trim() || !/^[6789]\d{9}$/.test(playerPhone.trim().replace(/\D/g, '')) ? (
                  <>
                    <span>Add Details & Book</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                ) : (
                  <>
                    <span>Confirm {selectedSlots.length > 1 ? `${selectedSlots.length} Bookings` : 'Booking'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
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
