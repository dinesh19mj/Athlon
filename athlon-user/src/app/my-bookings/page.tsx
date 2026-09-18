'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CalendarDays,
  Clock,
  MapPin,
  IndianRupee,
  CheckCircle2,
  XCircle,
  Building2,
  ChevronRight,
  AlertCircle,
  Search,
  Filter,
  CreditCard,
  Ticket
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { bookingApi, BookingDto } from '@/lib/api/venue';

export default function MyBookingsPage() {
  const { userUuid } = useAuthStore();
  const [bookings, setBookings] = useState<BookingDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'UPCOMING' | 'COMPLETED' | 'CANCELLED' | 'ALL'>('UPCOMING');
  const [selectedBooking, setSelectedBooking] = useState<BookingDto | null>(null);

  useEffect(() => {
    async function loadMyBookings() {
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
    }
    loadMyBookings();
  }, [userUuid]);

  const handleCancelBooking = async (booking: BookingDto) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      const res = await bookingApi.cancelBooking(booking.bookingUuid, 'Cancelled by player');
      if (res.success) {
        // Refresh
        const updated = await bookingApi.getMyBookings(userUuid || undefined);
        if (updated.success && updated.data) {
          setBookings(updated.data);
        }
      }
    } catch (err) {
      console.error('Failed to cancel booking:', err);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'CANCELLED') return b.bookingStatus === 'CANCELLED';
    if (activeTab === 'COMPLETED') return b.bookingStatus === 'COMPLETED' || b.bookingDate < today;
    if (activeTab === 'UPCOMING') {
      return (b.bookingStatus === 'CONFIRMED' || b.bookingStatus === 'CHECKED_IN') && b.bookingDate >= today;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      {/* Header */}
      <div className="border-b border-border bg-gradient-to-b from-card to-background p-6 md:p-10">
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-primary tracking-widest uppercase">
                <Ticket className="w-4 h-4" /> Personal Activity
              </div>
              <h1 className="text-2xl md:text-4xl font-black tracking-tight text-foreground">
                My Facility Bookings
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground">
                View your confirmed slot reservations, access booking passes, and manage cancellations.
              </p>
            </div>

            <Link
              href="/venues"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-black font-black text-xs hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20 self-start"
            >
              <CalendarDays className="w-4 h-4" /> Book New Slot
            </Link>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 pt-2 overflow-x-auto">
            {(['UPCOMING', 'COMPLETED', 'CANCELLED', 'ALL'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                  activeTab === tab
                    ? 'border-primary bg-primary/10 text-primary shadow-sm'
                    : 'border-border bg-card text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 pt-8 space-y-4">
        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-36 rounded-3xl bg-card border border-border" />
            ))}
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-16 text-center rounded-3xl bg-card border border-border space-y-4">
            <Ticket className="w-12 h-12 text-muted-foreground/40 mx-auto" />
            <h3 className="text-base font-black text-foreground">No Bookings Found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              You don&apos;t have any {activeTab.toLowerCase()} slot reservations right now.
            </p>
            <Link
              href="/venues"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-black font-bold text-xs hover:brightness-110"
            >
              Explore Venues Near You
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((b) => {
              const isCancelled = b.bookingStatus === 'CANCELLED';
              const isConfirmed = b.bookingStatus === 'CONFIRMED' || b.bookingStatus === 'CHECKED_IN';

              return (
                <div
                  key={b.bookingId}
                  className="p-6 rounded-3xl bg-card border border-border hover:border-primary/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm relative overflow-hidden"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-primary">
                        {b.bookingNumber}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full border text-[10px] font-black uppercase ${
                          isConfirmed
                            ? 'bg-green-500/10 border-green-500/30 text-green-400'
                            : isCancelled
                            ? 'bg-red-500/10 border-red-500/30 text-red-400'
                            : 'bg-primary/10 border-primary/30 text-primary'
                        }`}
                      >
                        {b.bookingStatus}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-lg font-black text-foreground">
                        {b.venueName || 'Sports Arena'}
                      </h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-primary" />
                        <span>{b.facilityName} • {b.sportName || 'Sport'}</span>
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-foreground/90">
                      <div className="flex items-center gap-1.5">
                        <CalendarDays className="w-4 h-4 text-primary" />
                        <span>{b.bookingDate}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-primary" />
                        <span>{b.startTime?.slice(0, 5)} - {b.endTime?.slice(0, 5)} ({b.durationMinutes}m)</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Price & Actions */}
                  <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-border">
                    <div className="space-y-0.5 text-left md:text-right">
                      <div className="text-xs text-muted-foreground">Total Fee</div>
                      <div className="text-xl font-black text-primary">₹{b.totalAmount}</div>
                      <div className="text-[10px] font-bold text-green-400 uppercase">{b.paymentStatus}</div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      {isConfirmed && (
                        <button
                          onClick={() => handleCancelBooking(b)}
                          className="px-4 py-2 rounded-xl border border-red-500/30 text-red-400 font-bold text-xs hover:bg-red-500/10 transition-colors"
                        >
                          Cancel Slot
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
    </div>
  );
}
