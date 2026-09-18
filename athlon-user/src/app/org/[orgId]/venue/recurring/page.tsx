'use client';

import React, { useState, useEffect } from 'react';
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
  AlertTriangle
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
  RecurrenceType
} from '@/lib/api/venue';

export default function VenueRecurringPage() {
  const params = useParams();
  const orgId = params?.orgId as string;

  const [venue, setVenue] = useState<VenueDto | null>(null);
  const [facilities, setFacilities] = useState<FacilityDto[]>([]);
  const [seriesList, setSeriesList] = useState<RecurringReservationDto[]>([]);
  const [loading, setLoading] = useState(true);

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
    { key: 'MONDAY', label: 'Mon' },
    { key: 'TUESDAY', label: 'Tue' },
    { key: 'WEDNESDAY', label: 'Wed' },
    { key: 'THURSDAY', label: 'Thu' },
    { key: 'FRIDAY', label: 'Fri' },
    { key: 'SATURDAY', label: 'Sat' },
    { key: 'SUNDAY', label: 'Sun' },
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
    }
  }, [orgId]);

  const loadSeries = async (venueId: number) => {
    const res = await recurringReservationApi.getByVenue(venueId);
    if (res.success && res.data) {
      setSeriesList(res.data);
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
      }
    } catch (err) {
      console.error('Failed to add exception:', err);
    } finally {
      setSavingException(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border p-6 rounded-2xl shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-primary tracking-widest uppercase">
            <Layers className="w-4 h-4" /> Recurring Reservations
          </div>
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-foreground">
            Internal Series & Academy Batches
          </h1>
          <p className="text-xs text-muted-foreground">
            Reserve repeating slots for academy batches, club matches and coaching sessions with conflict collision detection.
          </p>
        </div>

        <button
          onClick={() => {
            setTitle('');
            setNotes('');
            setConflictReport(null);
            setCreateError(null);
            setIsCreateModalOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-black font-black text-sm hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4" /> Create Recurring Series
        </button>
      </div>

      {/* Series Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-44 rounded-2xl bg-card border border-border" />
          ))}
        </div>
      ) : seriesList.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-card border border-border space-y-3">
          <Layers className="w-10 h-10 text-muted-foreground/40 mx-auto" />
          <h3 className="text-sm font-black text-foreground">No Recurring Series Set Up</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Create scheduled weekly blocks for academy training or regular club members.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {seriesList.map((s) => (
            <div
              key={s.recurringReservationId}
              className="p-5 rounded-2xl bg-card border border-border hover:border-primary/40 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
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

      {/* Create Recurring Series Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-xl rounded-3xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="text-lg font-black text-foreground">Create Recurring Reservation Series</h3>
                <p className="text-xs text-muted-foreground">Reserve slots with conflict collision detection</p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {createError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-sm font-medium text-foreground outline-none focus:border-primary"
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

              {/* Days of week */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Repeat On Days</label>
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
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border bg-background text-muted-foreground'
                        }`}
                      >
                        {d.label}
                      </button>
                    );
                  })}
                </div>
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
                    className="px-3 py-1.5 rounded-xl bg-card border border-border hover:bg-white/5 text-xs font-bold text-foreground"
                  >
                    {checkingConflict ? 'Analyzing...' : 'Run Conflict Check'}
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
                          <AlertTriangle className="w-4 h-4" />
                          <span>{conflictReport.conflictingOccurrencesCount} Conflicts Found across {conflictReport.totalOccurrences} dates!</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>All {conflictReport.totalOccurrences} occurrences are clean & available!</span>
                        </>
                      )}
                    </div>

                    {conflictReport.hasConflicts && (
                      <div className="space-y-1 max-h-28 overflow-y-auto pt-1">
                        {conflictReport.conflicts.map((c, i) => (
                          <div key={i} className="text-[11px] text-foreground/80">
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
                  className="flex-1 py-2.5 rounded-xl border border-border font-bold text-xs text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-black font-black text-xs hover:brightness-110 disabled:opacity-50"
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
              <button onClick={() => setIsExceptionModalOpen(false)} className="text-muted-foreground">
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

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Reason</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Festival Holiday / Tournament on Court"
                  value={exceptionReason}
                  onChange={(e) => setExceptionReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs font-medium text-foreground outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsExceptionModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border font-bold text-xs text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingException}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 text-black font-black text-xs hover:bg-amber-400 disabled:opacity-50"
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
