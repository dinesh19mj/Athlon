'use client';

import React, { useState, useEffect } from 'react';
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
  History
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

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border p-6 rounded-2xl shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-primary tracking-widest uppercase">
            <ClipboardList className="w-4 h-4" /> Bookings & Ledger
          </div>
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-foreground">
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
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-black font-black text-sm hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4" /> New Walk-In Booking
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-card/60 border border-border p-4 rounded-2xl">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search booking #, name, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-background border border-border text-xs font-medium text-foreground outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {(['ALL', 'CONFIRMED', 'CHECKED_IN', 'COMPLETED', 'CANCELLED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all whitespace-nowrap ${
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
                  <th className="p-3.5 font-black text-muted-foreground uppercase tracking-wider">Booking #</th>
                  <th className="p-3.5 font-black text-muted-foreground uppercase tracking-wider">Customer</th>
                  <th className="p-3.5 font-black text-muted-foreground uppercase tracking-wider">Facility / Sport</th>
                  <th className="p-3.5 font-black text-muted-foreground uppercase tracking-wider">Date & Time</th>
                  <th className="p-3.5 font-black text-muted-foreground uppercase tracking-wider">Amount</th>
                  <th className="p-3.5 font-black text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="p-3.5 font-black text-muted-foreground uppercase tracking-wider text-right">Actions</th>
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
                      <td className="p-3.5 font-mono font-bold text-primary">
                        {b.bookingNumber}
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-foreground">{b.guestName}</div>
                        {b.guestPhone && <div className="text-[10px] text-muted-foreground">{b.guestPhone}</div>}
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-foreground">{b.facilityName}</div>
                        <div className="text-[10px] text-muted-foreground">{b.sportName || 'Sport'}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-foreground">{b.bookingDate}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {b.startTime?.slice(0, 5)} - {b.endTime?.slice(0, 5)} ({b.durationMinutes}m)
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-foreground">₹{b.totalAmount}</div>
                        <div className={`text-[10px] font-bold ${b.paymentStatus === 'PAID' ? 'text-green-400' : 'text-amber-400'}`}>
                          {b.paymentStatus}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-full border text-[10px] font-bold ${statusBg}`}>
                          {b.bookingStatus}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => setSelectedBooking(b)}
                          className="px-3 py-1.5 rounded-lg bg-card border border-border hover:bg-white/5 text-xs font-bold text-foreground transition-all"
                        >
                          View Details
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
