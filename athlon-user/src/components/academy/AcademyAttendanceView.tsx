'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  Users,
  ShieldCheck,
  Building2,
  Phone,
  MessageCircle,
  Save,
  Loader2,
  RefreshCw,
  Sparkles,
  Layers,
  ArrowLeft,
  Filter,
  Check,
  X,
  AlertCircle,
  ChevronDown,
} from 'lucide-react';
import { useOrgRole } from '@/hooks/use-org-role';
import {
  AcademyAttendanceService,
  AcademyAttendanceRecord,
  AcademyAttendanceSummary,
  AttendanceStatus,
  AttendeeType,
} from '@/lib/api/academyAttendance';
import { AcademyStudentService, AcademyStudent, AcademyBatch } from '@/lib/api/academyStudent';
import { AcademyStaffService, AcademyStaffResponse } from '@/lib/api/academyStaff';
import { getSportEmoji } from '@/lib/hooks/useOrgSports';

const getLocalDateString = (d: Date = new Date()): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

interface Props {
  orgUuid: string;
  orgName: string;
}

export default function AcademyAttendanceView({ orgUuid, orgName }: Props) {
  const { isAdmin, isCoach } = useOrgRole(orgUuid);
  const canTakeAttendance = isAdmin || isCoach;

  // Active Channel: STUDENTS | COACHES | STAFF
  const [activeTab, setActiveTab] = useState<'STUDENTS' | 'COACHES' | 'STAFF'>('STUDENTS');
  const [selectedDate, setSelectedDate] = useState<string>(getLocalDateString());

  // Data States
  const [students, setStudents] = useState<AcademyStudent[]>([]);
  const [coaches, setCoaches] = useState<AcademyStaffResponse[]>([]);
  const [staffList, setStaffList] = useState<AcademyStaffResponse[]>([]);
  const [batches, setBatches] = useState<AcademyBatch[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AcademyAttendanceRecord>>({});
  const [summary, setSummary] = useState<AcademyAttendanceSummary | null>(null);

  // Filter States
  const [selectedBatchUuid, setSelectedBatchUuid] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [bulkSaving, setBulkSaving] = useState<boolean>(false);
  const [toastSuccess, setToastSuccess] = useState<string | null>(null);
  const [toastError, setToastError] = useState<string | null>(null);

  const showToast = (msg: string, isErr = false) => {
    if (isErr) {
      setToastError(msg);
      setTimeout(() => setToastError(null), 3500);
    } else {
      setToastSuccess(msg);
      setTimeout(() => setToastSuccess(null), 3500);
    }
  };

  // Load roster data once
  const loadRosterData = async () => {
    if (!orgUuid) return;
    try {
      const [studentsRes, coachesRes, staffRes, batchesRes] = await Promise.allSettled([
        AcademyStudentService.getStudents(orgUuid),
        AcademyStaffService.getCoaches(orgUuid),
        AcademyStaffService.getOperationalStaff(orgUuid),
        AcademyStudentService.getBatches(orgUuid),
      ]);

      if (studentsRes.status === 'fulfilled') {
        const sList = Array.isArray(studentsRes.value) ? studentsRes.value : (studentsRes.value as any)?.data || [];
        setStudents(sList.filter((s: AcademyStudent) => !s.status || s.status.toUpperCase() === 'ACTIVE'));
      }
      if (coachesRes.status === 'fulfilled') {
        const cRaw = coachesRes.value;
        const cList = Array.isArray(cRaw) ? cRaw : (cRaw as any)?.data || [];
        setCoaches(cList);
      }
      if (staffRes.status === 'fulfilled') {
        const stRaw = staffRes.value;
        const stList = Array.isArray(stRaw) ? stRaw : (stRaw as any)?.data || [];
        setStaffList(stList);
      }
      if (batchesRes.status === 'fulfilled') {
        setBatches(batchesRes.value || []);
      }
    } catch (err) {
      console.error('Failed to load roster data:', err);
    }
  };

  // Load Attendance Records & Summary for selected date
  const loadDailyAttendance = async (date: string) => {
    if (!orgUuid) return;
    try {
      setLoading(true);
      const [attRes, sumRes] = await Promise.allSettled([
        AcademyAttendanceService.getDailyAttendance(orgUuid, date),
        AcademyAttendanceService.getSummary(orgUuid, date),
      ]);

      if (attRes.status === 'fulfilled') {
        const raw = attRes.value;
        const records: AcademyAttendanceRecord[] = Array.isArray(raw) ? raw : (raw as any)?.data || [];
        const map: Record<string, AcademyAttendanceRecord> = {};
        records.forEach((r) => {
          map[r.attendeeUuid] = r;
        });
        setAttendanceMap(map);
      }

      if (sumRes.status === 'fulfilled') {
        const sData = (sumRes.value as any)?.data || sumRes.value;
        setSummary(sData);
      }
    } catch (err) {
      console.error('Failed to load daily attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRosterData();
  }, [orgUuid]);

  useEffect(() => {
    loadDailyAttendance(selectedDate);
  }, [orgUuid, selectedDate]);

  // Date stepper handlers
  const handlePrevDay = () => {
    const parts = selectedDate.split('-').map(Number);
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    d.setDate(d.getDate() - 1);
    setSelectedDate(getLocalDateString(d));
  };

  const handleNextDay = () => {
    const parts = selectedDate.split('-').map(Number);
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    d.setDate(d.getDate() + 1);
    setSelectedDate(getLocalDateString(d));
  };

  const handleTodayJump = () => {
    setSelectedDate(getLocalDateString());
  };

  const formattedDateDisplay = useMemo(() => {
    const parts = selectedDate.split('-').map(Number);
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, [selectedDate]);

  // Current Attendees List based on activeTab
  const currentAttendees = useMemo(() => {
    if (activeTab === 'STUDENTS') {
      return students
        .filter((s) => {
          const q = searchTerm.toLowerCase().trim();
          const matchQuery =
            !q ||
            [s.fullName, s.parentPhone, s.batchName, s.level, s.sportType].some((v) =>
              v?.toLowerCase().includes(q)
            );

          const matchBatch =
            selectedBatchUuid === 'ALL' ||
            s.batchUuid === selectedBatchUuid;

          return matchQuery && matchBatch;
        })
        .map((s) => ({
          uuid: s.studentUuid,
          type: 'STUDENT' as AttendeeType,
          name: s.fullName,
          subtext: s.batchName || 'Unassigned Batch',
          tag: s.level || 'Student',
          phone: s.parentPhone,
          batchUuid: s.batchUuid,
          batchName: s.batchName,
        }));
    } else if (activeTab === 'COACHES') {
      return coaches
        .filter((c) => {
          const q = searchTerm.toLowerCase().trim();
          return !q || [c.fullName, c.phone, c.role, c.sportType].some((v) => v?.toLowerCase().includes(q));
        })
        .map((c) => ({
          uuid: c.staffUuid,
          type: 'COACH' as AttendeeType,
          name: c.fullName,
          subtext: c.sportType ? `${c.sportType} Coach` : 'Coaching Staff',
          tag: c.role || 'Coach',
          phone: c.phone,
          batchUuid: undefined,
          batchName: undefined,
        }));
    } else {
      return staffList
        .filter((st) => {
          const q = searchTerm.toLowerCase().trim();
          return !q || [st.fullName, st.phone, st.role, st.centreName].some((v) => v?.toLowerCase().includes(q));
        })
        .map((st) => ({
          uuid: st.staffUuid,
          type: 'STAFF' as AttendeeType,
          name: st.fullName,
          subtext: st.centreName || 'Operations & Admin',
          tag: st.role || 'Staff',
          phone: st.phone,
          batchUuid: undefined,
          batchName: undefined,
        }));
    }
  }, [activeTab, students, coaches, staffList, selectedBatchUuid, searchTerm]);

  // Mark Single Attendance
  const handleMarkStatus = async (
    attendee: { uuid: string; type: AttendeeType; name: string; batchUuid?: string; batchName?: string },
    status: AttendanceStatus
  ) => {
    if (!canTakeAttendance) {
      showToast('Only academy administrators and coaches can take attendance.', true);
      return;
    }

    try {
      setUpdatingId(attendee.uuid);
      const res = await AcademyAttendanceService.markAttendance({
        organizationUuid: orgUuid,
        attendeeType: attendee.type,
        attendeeUuid: attendee.uuid,
        attendeeName: attendee.name,
        batchUuid: attendee.batchUuid,
        batchName: attendee.batchName,
        attendanceDate: selectedDate,
        status: status,
      });

      const updated = (res as any)?.data || res;
      setAttendanceMap((prev) => ({
        ...prev,
        [attendee.uuid]: updated,
      }));

      // Refresh summary in background
      AcademyAttendanceService.getSummary(orgUuid, selectedDate).then((sRes) => {
        const sData = (sRes as any)?.data || sRes;
        if (sData) setSummary(sData);
      });
    } catch (err: any) {
      console.error('Failed to mark attendance:', err);
      showToast('Could not save attendance record.', true);
    } finally {
      setUpdatingId(null);
    }
  };

  // Bulk Mark All Visible Attendees
  const handleBulkMarkAll = async (status: AttendanceStatus) => {
    if (!canTakeAttendance) {
      showToast('Only academy administrators and coaches can take attendance.', true);
      return;
    }
    if (currentAttendees.length === 0) return;

    try {
      setBulkSaving(true);
      const records = currentAttendees.map((a) => ({
        organizationUuid: orgUuid,
        attendeeType: a.type,
        attendeeUuid: a.uuid,
        attendeeName: a.name,
        batchUuid: a.batchUuid,
        batchName: a.batchName,
        attendanceDate: selectedDate,
        status: status,
      }));

      const res = await AcademyAttendanceService.bulkMarkAttendance({
        organizationUuid: orgUuid,
        records: records,
      });

      const list: AcademyAttendanceRecord[] = Array.isArray(res) ? res : (res as any)?.data || [];
      const newMap = { ...attendanceMap };
      list.forEach((r) => {
        newMap[r.attendeeUuid] = r;
      });
      setAttendanceMap(newMap);

      showToast(`Marked ${list.length} ${activeTab.toLowerCase()} as ${status}.`);

      // Refresh summary
      const sumRes = await AcademyAttendanceService.getSummary(orgUuid, selectedDate);
      const sData = (sumRes as any)?.data || sumRes;
      if (sData) setSummary(sData);
    } catch (err) {
      console.error('Bulk attendance error:', err);
      showToast('Failed to complete bulk attendance update.', true);
    } finally {
      setBulkSaving(false);
    }
  };

  // Channel Metrics Computation
  const channelMetrics = useMemo(() => {
    let total = currentAttendees.length;
    let present = 0;
    let absent = 0;
    let late = 0;
    let excused = 0;

    currentAttendees.forEach((a) => {
      const rec = attendanceMap[a.uuid];
      if (rec) {
        if (rec.status === 'PRESENT') present++;
        else if (rec.status === 'ABSENT') absent++;
        else if (rec.status === 'LATE') { late++; present++; }
        else if (rec.status === 'EXCUSED') excused++;
      }
    });

    const rate = total > 0 ? Math.round((present / total) * 100) : 0;
    return { total, present, absent, late, excused, rate };
  }, [currentAttendees, attendanceMap]);

  return (
    <div className="min-h-screen bg-background pb-28">

      {/* ── STICKY APP BAR (Mobile & Desktop) ── */}
      <div
        className="sticky top-0 z-30 px-3.5 sm:px-4 py-2.5 sm:py-3 border-b backdrop-blur-xl"
        style={{ backgroundColor: 'var(--athlon-sidebar)', borderColor: 'var(--athlon-border)' }}
      >
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <Link
              href={`/org/${orgUuid}/dashboard`}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-foreground/70 shrink-0 transition"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm sm:text-base font-black text-foreground leading-tight truncate">
                  Attendance
                </h1>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                  {channelMetrics.rate}% Present
                </span>
              </div>
              <p className="text-[10px] text-foreground/45 truncate">
                Daily Roll Call &amp; Check-ins • {orgName}
              </p>
            </div>
          </div>

          {/* Quick Refresh */}
          <button
            onClick={() => loadDailyAttendance(selectedDate)}
            className="p-1.5 rounded-xl border text-foreground/60 hover:text-foreground hover:bg-white/5 transition cursor-pointer"
            style={{ borderColor: 'var(--athlon-border)' }}
            title="Refresh Attendance"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-primary' : ''}`} />
          </button>
        </div>

        {/* ── Interactive Date Navigator Strip ── */}
        <div
          className="flex items-center justify-between gap-2 p-1.5 rounded-xl border mb-2.5"
          style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
        >
          <button
            onClick={handlePrevDay}
            className="p-1.5 rounded-lg hover:bg-white/10 text-foreground/70 transition cursor-pointer"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <CalendarIcon className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="text-xs font-black text-foreground">{formattedDateDisplay}</span>
            {selectedDate !== getLocalDateString() && (
              <button
                onClick={handleTodayJump}
                className="px-2 py-0.5 rounded-md text-[9px] font-extrabold bg-primary/15 text-primary border border-primary/25 hover:bg-primary/25 transition cursor-pointer"
              >
                Today
              </button>
            )}
          </div>

          <button
            onClick={handleNextDay}
            className="p-1.5 rounded-lg hover:bg-white/10 text-foreground/70 transition cursor-pointer"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* ── 3 Channel Tabs: Students | Coaches | Staff ── */}
        <div
          className="grid grid-cols-3 p-1 rounded-xl border gap-1"
          style={{ backgroundColor: 'var(--athlon-input)', borderColor: 'var(--athlon-border)' }}
        >
          <button
            onClick={() => { setActiveTab('STUDENTS'); setSelectedBatchUuid('ALL'); }}
            className={`py-1.5 rounded-lg text-xs font-black transition flex items-center justify-center gap-1.5 ${
              activeTab === 'STUDENTS'
                ? 'bg-primary text-black shadow-sm'
                : 'text-foreground/60 hover:text-foreground'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Students ({students.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('COACHES')}
            className={`py-1.5 rounded-lg text-xs font-black transition flex items-center justify-center gap-1.5 ${
              activeTab === 'COACHES'
                ? 'bg-primary text-black shadow-sm'
                : 'text-foreground/60 hover:text-foreground'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Coaches ({coaches.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('STAFF')}
            className={`py-1.5 rounded-lg text-xs font-black transition flex items-center justify-center gap-1.5 ${
              activeTab === 'STAFF'
                ? 'bg-primary text-black shadow-sm'
                : 'text-foreground/60 hover:text-foreground'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Staff ({staffList.length})</span>
          </button>
        </div>

        {/* ── Search & Batch Filter Controls ── */}
        <div className="flex items-center gap-1.5 mt-2.5">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-foreground/35" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Search ${activeTab.toLowerCase()} by name, phone...`}
              className="w-full pl-8 pr-7 py-1.5 rounded-xl text-[11px] text-foreground placeholder:text-foreground/35 focus:outline-none focus:ring-1 focus:ring-primary/30 transition"
              style={{ backgroundColor: 'var(--athlon-input)', borderColor: 'var(--athlon-border)', border: '1px solid' }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Batch Selector (For Students Channel) */}
          {activeTab === 'STUDENTS' && batches.length > 0 && (
            <div className="relative shrink-0 max-w-[140px] sm:max-w-xs">
              <select
                value={selectedBatchUuid}
                onChange={(e) => setSelectedBatchUuid(e.target.value)}
                className="w-full pl-2.5 pr-6 py-1.5 rounded-xl text-[11px] font-bold border text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 appearance-none cursor-pointer transition shadow-sm truncate"
                style={{ backgroundColor: 'var(--athlon-input)', borderColor: 'var(--athlon-border)' }}
              >
                <option value="ALL" className="bg-[#18181b] text-white font-semibold">All Batches</option>
                {batches.map((b) => (
                  <option key={b.batchUuid} value={b.batchUuid} className="bg-[#18181b] text-white font-semibold">
                    {b.batchName} ({b.sportType || 'All'})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 text-foreground/50 pointer-events-none" />
            </div>
          )}
        </div>
      </div>

      {/* ── TOAST NOTIFICATIONS ── */}
      <div className="px-3.5 sm:px-4 space-y-2 pt-2">
        {toastSuccess && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/12 border border-emerald-500/25 text-emerald-400 text-xs font-semibold animate-in fade-in">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>{toastSuccess}</span>
          </div>
        )}
        {toastError && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/12 border border-red-500/25 text-red-400 text-xs font-semibold animate-in fade-in">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{toastError}</span>
          </div>
        )}
      </div>

      {/* ── MAIN ATTENDANCE ROSTER STREAM ── */}
      <div className="px-3.5 sm:px-4 pt-2 space-y-2.5">

        {/* Telemetry Summary & Quick Bulk Bar */}
        <div
          className="rounded-2xl border p-2.5 space-y-2.5 shadow-sm"
          style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
        >
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-4 divide-x divide-white/5 text-center">
            <div>
              <div className="text-xs font-mono font-black text-foreground">{channelMetrics.total}</div>
              <div className="text-[8px] uppercase tracking-wider font-bold text-foreground/40">Expected</div>
            </div>
            <div>
              <div className="text-xs font-mono font-black text-emerald-400">{channelMetrics.present}</div>
              <div className="text-[8px] uppercase tracking-wider font-bold text-foreground/40">Present</div>
            </div>
            <div>
              <div className="text-xs font-mono font-black text-red-400">{channelMetrics.absent}</div>
              <div className="text-[8px] uppercase tracking-wider font-bold text-foreground/40">Absent</div>
            </div>
            <div>
              <div className="text-xs font-mono font-black text-amber-400">{channelMetrics.late}</div>
              <div className="text-[8px] uppercase tracking-wider font-bold text-foreground/40">Late</div>
            </div>
          </div>

          {/* Quick Bulk Actions */}
          {canTakeAttendance && currentAttendees.length > 0 && (
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5">
              <span className="text-[10px] font-bold text-foreground/50">
                Quick Mark:
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={bulkSaving}
                  onClick={() => handleBulkMarkAll('PRESENT')}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-[10px] font-extrabold transition active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-1"
                >
                  <Check className="w-3 h-3" />
                  <span>All Present</span>
                </button>
                <button
                  disabled={bulkSaving}
                  onClick={() => handleBulkMarkAll('ABSENT')}
                  className="px-2.5 py-1 rounded-lg bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 text-[10px] font-extrabold transition active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  <span>All Absent</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Loading / Empty States */}
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[220px] gap-2.5">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
            <p className="text-xs text-foreground/40 font-medium">Fetching attendance records...</p>
          </div>
        ) : currentAttendees.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[200px] text-center space-y-2 px-4 py-8">
            <div className="w-12 h-12 rounded-2xl bg-card border border-border flex items-center justify-center text-xl">
              📋
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">No {activeTab.toLowerCase()} found</p>
              <p className="text-[11px] text-foreground/45 mt-0.5 max-w-xs">
                {searchTerm
                  ? 'Try clearing your search term or batch filter.'
                  : activeTab === 'STUDENTS'
                  ? 'Register students via Admissions to enable daily roll call.'
                  : `Add ${activeTab.toLowerCase()} in the staff directory to track daily check-ins.`}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {currentAttendees.map((attendee) => {
              const record = attendanceMap[attendee.uuid];
              const currentStatus: AttendanceStatus | null = record?.status || null;
              const isUpdating = updatingId === attendee.uuid;
              const cleanPhone = (attendee.phone || '').replace(/[^0-9]/g, '');

              return (
                <div
                  key={attendee.uuid}
                  className="rounded-xl border p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-all shadow-sm"
                  style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                >
                  {/* Left: Attendee Info */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center text-primary font-black text-xs shrink-0 shadow-inner">
                      {attendee.name ? attendee.name.slice(0, 2).toUpperCase() : 'AT'}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs sm:text-sm font-black text-foreground truncate">
                          {attendee.name}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-white/5 border border-white/10 text-foreground/70 uppercase shrink-0">
                          {attendee.tag}
                        </span>
                        {record?.checkInTime && (
                          <span className="text-[8px] font-mono text-cyan-400">
                            ⏱ {record.checkInTime.slice(0, 5)}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-foreground/50 truncate flex items-center gap-1 mt-0.5">
                        <span className="truncate">{attendee.subtext}</span>
                        {attendee.phone && (
                          <>
                            <span>•</span>
                            <span className="font-mono">{attendee.phone}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Status Toggle Chips & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-1.5 shrink-0 pt-1.5 sm:pt-0 border-t sm:border-t-0 border-white/5">
                    {/* Status Buttons */}
                    <div className="flex items-center gap-1">
                      {/* PRESENT */}
                      <button
                        disabled={isUpdating || !canTakeAttendance}
                        onClick={() => handleMarkStatus(attendee, 'PRESENT')}
                        className={`px-2 py-1 rounded-lg text-[10px] font-extrabold transition active:scale-95 cursor-pointer border ${
                          currentStatus === 'PRESENT'
                            ? 'bg-emerald-500 text-black border-emerald-500 font-black shadow-sm'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                        }`}
                        title="Mark Present"
                      >
                        P
                      </button>

                      {/* ABSENT */}
                      <button
                        disabled={isUpdating || !canTakeAttendance}
                        onClick={() => handleMarkStatus(attendee, 'ABSENT')}
                        className={`px-2 py-1 rounded-lg text-[10px] font-extrabold transition active:scale-95 cursor-pointer border ${
                          currentStatus === 'ABSENT'
                            ? 'bg-red-500 text-white border-red-500 font-black shadow-sm'
                            : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                        }`}
                        title="Mark Absent"
                      >
                        A
                      </button>

                      {/* LATE */}
                      <button
                        disabled={isUpdating || !canTakeAttendance}
                        onClick={() => handleMarkStatus(attendee, 'LATE')}
                        className={`px-2 py-1 rounded-lg text-[10px] font-extrabold transition active:scale-95 cursor-pointer border ${
                          currentStatus === 'LATE'
                            ? 'bg-amber-500 text-black border-amber-500 font-black shadow-sm'
                            : 'bg-amber-500/10 text-amber-300 border-amber-500/20 hover:bg-amber-500/20'
                        }`}
                        title="Mark Late"
                      >
                        L
                      </button>

                      {/* EXCUSED */}
                      <button
                        disabled={isUpdating || !canTakeAttendance}
                        onClick={() => handleMarkStatus(attendee, 'EXCUSED')}
                        className={`px-2 py-1 rounded-lg text-[10px] font-extrabold transition active:scale-95 cursor-pointer border ${
                          currentStatus === 'EXCUSED'
                            ? 'bg-cyan-500 text-black border-cyan-500 font-black shadow-sm'
                            : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 hover:bg-cyan-500/20'
                        }`}
                        title="Mark Excused"
                      >
                        E
                      </button>
                    </div>

                    {/* WhatsApp Alert for Absentee/Guardian */}
                    {cleanPhone && (
                      <a
                        href={`https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : '91' + cleanPhone}?text=${encodeURIComponent(
                          `Hello from ${orgName}, regarding attendance for ${attendee.name} on ${formattedDateDisplay}: Status is ${
                            currentStatus || 'Pending'
                          }.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition active:scale-95"
                        title="WhatsApp Message"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </a>
                    )}
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
