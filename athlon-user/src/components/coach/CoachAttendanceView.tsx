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
  Building2,
  Phone,
  Save,
  Loader2,
  RefreshCw,
  Sparkles,
  ArrowLeft,
  Filter,
  Check,
  X,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Star,
  Flame,
  FileText,
  History,
  Activity,
  Award,
  Zap,
  CheckCheck,
  TrendingUp,
  Target,
  Dumbbell,
  ShieldCheck,
  CalendarDays,
  SlidersHorizontal,
  Trophy,
  Gauge,
  BarChart3,
  HeartPulse,
  MoreHorizontal,
  BookmarkCheck,
  Timer,
  Share2,
} from 'lucide-react';
import { usePermissions } from '@/hooks/use-permissions';
import {
  CoachService,
  CoachTrainee,
  CoachFeePackage,
  CoachAttendanceRecord,
  CoachAttendanceSummary,
  AttendanceStatus,
} from '@/lib/api/coach';

const getLocalDateString = (d: Date = new Date()): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDisplayDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  const todayStr = getLocalDateString();
  const isToday = dateStr === todayStr;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = dateStr === getLocalDateString(yesterday);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow = dateStr === getLocalDateString(tomorrow);

  let prefix = '';
  if (isToday) prefix = 'Today, ';
  else if (isYesterday) prefix = 'Yesterday, ';
  else if (isTomorrow) prefix = 'Tomorrow, ';

  return prefix + d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
};

const DRILL_SUGGESTIONS = [
  'Smash & Net Defense',
  'Footwork & Speed Agility',
  'Serve & Drop Deception',
  'Match Play Tactics',
  'Backhand Cross-Court',
  'Interval High-Intensity Drills',
  'Core Power & Reaction',
  'Baseline Rally Consistency',
];

const QUICK_NOTES_PRESETS = [
  'Superb energy and sharp footwork today! ⚡',
  'Good form, needs extra focus on backhand recovery.',
  'Assigned 15m endurance jump ropes as home practice.',
  'Improved court positioning during match sets.',
  'Arrived late due to school/traffic, completed modified set.',
];

const RATING_DESCRIPTIONS: Record<number, { label: string; color: string }> = {
  1: { label: 'Low Energy / Struggled', color: 'text-rose-400' },
  2: { label: 'Basic Effort', color: 'text-amber-400' },
  3: { label: 'Solid Performance', color: 'text-yellow-400' },
  4: { label: 'High Intensity & Focus', color: 'text-emerald-400' },
  5: { label: 'Peak Monster Form! 🔥', color: 'text-teal-400' },
};

const SKILL_CONFIG: Record<string, { label: string; color: string; border: string; bg: string; dotColor: string }> = {
  BEGINNER: { label: 'Beginner', color: 'text-sky-400', border: 'border-sky-500/30', bg: 'bg-sky-500/10', dotColor: 'bg-sky-400' },
  INTERMEDIATE: { label: 'Intermediate', color: 'text-violet-400', border: 'border-violet-500/30', bg: 'bg-violet-500/10', dotColor: 'bg-violet-400' },
  ADVANCED: { label: 'Advanced', color: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/10', dotColor: 'bg-amber-400' },
  ELITE: { label: 'Elite', color: 'text-rose-400', border: 'border-rose-500/30', bg: 'bg-rose-500/10', dotColor: 'bg-rose-400' },
  PRO: { label: 'Pro', color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', dotColor: 'bg-emerald-400' },
};

interface Props {
  orgUuid: string;
  orgName: string;
}

export default function CoachAttendanceView({ orgUuid, orgName }: Props) {
  const { canManageModule } = usePermissions(orgUuid);
  const canManage = canManageModule('attendance');

  const [selectedDate, setSelectedDate] = useState<string>(getLocalDateString());
  const [trainees, setTrainees] = useState<CoachTrainee[]>([]);
  const [packages, setPackages] = useState<CoachFeePackage[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, CoachAttendanceRecord>>({});
  const [summary, setSummary] = useState<CoachAttendanceSummary | null>(null);

  // Filters & State
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedPackageUuid, setSelectedPackageUuid] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [selectedSkillLevel, setSelectedSkillLevel] = useState<string>('ALL');

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [updatingTraineeUuid, setUpdatingTraineeUuid] = useState<string | null>(null);
  const [bulkSaving, setBulkSaving] = useState<boolean>(false);

  // Expanded card state for notes/ratings/drills
  const [expandedTraineeUuid, setExpandedTraineeUuid] = useState<string | null>(null);
  const [draftDetails, setDraftDetails] = useState<
    Record<string, { checkInTime?: string; focusDrills?: string; performanceRating?: number; coachNotes?: string }>
  >({});

  // History modal state
  const [historyTrainee, setHistoryTrainee] = useState<CoachTrainee | null>(null);
  const [historyRecords, setHistoryRecords] = useState<CoachAttendanceRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

  // Toasts
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

  // 1. Initial load of trainees and packages
  const loadRoster = async () => {
    if (!orgUuid) return;
    try {
      const [traineesRes, pkgsRes] = await Promise.allSettled([
        CoachService.getTrainees(orgUuid, 'ACTIVE'),
        CoachService.getPackages(orgUuid, true),
      ]);

      if (traineesRes.status === 'fulfilled' && traineesRes.value) {
        const list = Array.isArray(traineesRes.value) ? traineesRes.value : ((traineesRes.value as any)?.data || []);
        setTrainees(list);
      }
      if (pkgsRes.status === 'fulfilled' && pkgsRes.value) {
        const list = Array.isArray(pkgsRes.value) ? pkgsRes.value : ((pkgsRes.value as any)?.data || []);
        setPackages(list);
      }
    } catch (err: any) {
      console.error('Error loading coach roster:', err);
    }
  };

  // 2. Load attendance for the selected date
  const loadAttendance = async (isRefetch = false) => {
    if (!orgUuid || !selectedDate) return;
    if (isRefetch) setRefreshing(true);
    else setLoading(true);

    try {
      const [attRes, sumRes] = await Promise.allSettled([
        CoachService.getAttendance(orgUuid, selectedDate),
        CoachService.getAttendanceSummary(orgUuid, selectedDate),
      ]);

      if (attRes.status === 'fulfilled' && attRes.value) {
        const list: CoachAttendanceRecord[] = Array.isArray(attRes.value) ? attRes.value : ((attRes.value as any)?.data || []);
        const map: Record<string, CoachAttendanceRecord> = {};
        list.forEach((rec) => {
          map[rec.traineeUuid] = rec;
        });
        setAttendanceMap(map);
      } else {
        setAttendanceMap({});
      }

      if (sumRes.status === 'fulfilled' && sumRes.value) {
        const summaryObj = (sumRes.value as any)?.data || sumRes.value;
        setSummary(summaryObj);
      }
    } catch (err: any) {
      console.error('Error loading coach attendance:', err);
      showToast('Failed to load attendance records for this date', true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadRoster();
  }, [orgUuid]);

  useEffect(() => {
    loadAttendance();
  }, [orgUuid, selectedDate]);

  // Date Navigation Helpers
  const changeDateByDays = (days: number) => {
    const current = new Date(selectedDate + 'T00:00:00');
    current.setDate(current.getDate() + days);
    setSelectedDate(getLocalDateString(current));
  };

  const jumpToToday = () => {
    setSelectedDate(getLocalDateString());
  };

  // Quick 7-Day Day Selector Bar around the active date
  const dayStrip = useMemo(() => {
    const current = new Date(selectedDate + 'T00:00:00');
    const days: { dateStr: string; dayName: string; dayNum: number; isToday: boolean; isSelected: boolean }[] = [];
    const todayStr = getLocalDateString();

    for (let i = -3; i <= 3; i++) {
      const d = new Date(current);
      d.setDate(d.getDate() + i);
      const str = getLocalDateString(d);
      days.push({
        dateStr: str,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: d.getDate(),
        isToday: str === todayStr,
        isSelected: str === selectedDate,
      });
    }
    return days;
  }, [selectedDate]);

  // Mark / Toggle single trainee attendance
  const handleSetStatus = async (
    trainee: CoachTrainee,
    newStatus: AttendanceStatus,
    extraFields?: { checkInTime?: string; focusDrills?: string; performanceRating?: number; coachNotes?: string }
  ) => {
    setUpdatingTraineeUuid(trainee.traineeUuid);

    const nowTime = new Date().toTimeString().slice(0, 5); // "HH:MM"
    const currentRecord = attendanceMap[trainee.traineeUuid];

    const payload = {
      organizationUuid: orgUuid,
      traineeUuid: trainee.traineeUuid,
      traineeName: trainee.fullName,
      traineeAvatar: trainee.photo,
      packageUuid: trainee.packageUuid,
      packageName: trainee.packageName,
      attendanceDate: selectedDate,
      status: newStatus,
      checkInTime: extraFields?.checkInTime || currentRecord?.checkInTime || (newStatus === 'PRESENT' || newStatus === 'LATE' ? nowTime : undefined),
      focusDrills: extraFields?.focusDrills !== undefined ? extraFields.focusDrills : (currentRecord?.focusDrills || ''),
      performanceRating: extraFields?.performanceRating !== undefined ? extraFields.performanceRating : (currentRecord?.performanceRating || undefined),
      coachNotes: extraFields?.coachNotes !== undefined ? extraFields.coachNotes : (currentRecord?.coachNotes || ''),
    };

    // Optimistic UI Update
    const optimisticRecord: CoachAttendanceRecord = {
      attendanceUuid: currentRecord?.attendanceUuid || 'temp-' + Date.now(),
      organizationUuid: orgUuid,
      traineeUuid: trainee.traineeUuid,
      traineeName: trainee.fullName,
      traineeAvatar: trainee.photo,
      packageUuid: trainee.packageUuid,
      packageName: trainee.packageName,
      attendanceDate: selectedDate,
      status: newStatus,
      checkInTime: payload.checkInTime,
      focusDrills: payload.focusDrills,
      performanceRating: payload.performanceRating,
      coachNotes: payload.coachNotes,
    };

    setAttendanceMap((prev) => ({
      ...prev,
      [trainee.traineeUuid]: optimisticRecord,
    }));

    try {
      const res = await CoachService.markAttendance(payload);
      if (res) {
        const updated = (res as any)?.data || res;
        setAttendanceMap((prev) => ({
          ...prev,
          [trainee.traineeUuid]: updated,
        }));
      }
      CoachService.getAttendanceSummary(orgUuid, selectedDate).then((s) => {
        if (s) setSummary((s as any)?.data || s);
      });
    } catch (err: any) {
      console.error('Failed to mark attendance:', err);
      showToast('Error updating attendance for ' + trainee.fullName, true);
      loadAttendance(true);
    } finally {
      setUpdatingTraineeUuid(null);
    }
  };

  // Bulk mark all visible / active trainees as PRESENT
  const handleMarkAllPresent = async () => {
    if (filteredTrainees.length === 0) return;
    setBulkSaving(true);

    const nowTime = new Date().toTimeString().slice(0, 5);
    const records = filteredTrainees.map((t) => {
      const existing = attendanceMap[t.traineeUuid];
      return {
        organizationUuid: orgUuid,
        traineeUuid: t.traineeUuid,
        traineeName: t.fullName,
        traineeAvatar: t.photo,
        packageUuid: t.packageUuid,
        packageName: t.packageName,
        attendanceDate: selectedDate,
        status: 'PRESENT' as AttendanceStatus,
        checkInTime: existing?.checkInTime || nowTime,
        focusDrills: existing?.focusDrills,
        performanceRating: existing?.performanceRating,
        coachNotes: existing?.coachNotes,
      };
    });

    try {
      const res = await CoachService.bulkMarkAttendance({
        organizationUuid: orgUuid,
        attendanceDate: selectedDate,
        records,
      });

      if (res) {
        const list: CoachAttendanceRecord[] = Array.isArray(res) ? res : ((res as any)?.data || []);
        const newMap = { ...attendanceMap };
        list.forEach((r) => {
          newMap[r.traineeUuid] = r;
        });
        setAttendanceMap(newMap);
        showToast(`⚡ Successfully checked-in ${list.length} trainees as Present!`);
      }

      CoachService.getAttendanceSummary(orgUuid, selectedDate).then((s) => {
        if (s) setSummary((s as any)?.data || s);
      });
    } catch (err: any) {
      console.error('Bulk attendance error:', err);
      showToast('Failed to bulk mark attendance', true);
    } finally {
      setBulkSaving(false);
    }
  };

  // Save detailed training notes / focus area / rating
  const handleSaveDetails = async (trainee: CoachTrainee) => {
    const draft = draftDetails[trainee.traineeUuid] || {};
    const existing = attendanceMap[trainee.traineeUuid];
    const status = (existing?.status as AttendanceStatus) || 'PRESENT';

    await handleSetStatus(trainee, status, {
      checkInTime: draft.checkInTime !== undefined ? draft.checkInTime : existing?.checkInTime,
      focusDrills: draft.focusDrills !== undefined ? draft.focusDrills : existing?.focusDrills,
      performanceRating: draft.performanceRating !== undefined ? draft.performanceRating : existing?.performanceRating,
      coachNotes: draft.coachNotes !== undefined ? draft.coachNotes : existing?.coachNotes,
    });

    showToast(`Saved session drills & feedback for ${trainee.fullName}`);
    setExpandedTraineeUuid(null);
  };

  // Load trainee individual attendance history modal
  const openHistory = async (trainee: CoachTrainee) => {
    setHistoryTrainee(trainee);
    setLoadingHistory(true);
    try {
      const res = await CoachService.getTraineeAttendanceHistory(orgUuid, trainee.traineeUuid);
      if (res) {
        const list = Array.isArray(res) ? res : ((res as any)?.data || []);
        setHistoryRecords(list);
      }
    } catch (err) {
      console.error('Error fetching trainee history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Filtered trainees list
  const filteredTrainees = useMemo(() => {
    return trainees.filter((t) => {
      const matchesSearch =
        !searchTerm.trim() ||
        t.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.phone && t.phone.includes(searchTerm)) ||
        (t.packageName && t.packageName.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesPackage = selectedPackageUuid === 'ALL' || t.packageUuid === selectedPackageUuid;
      const matchesSkill = selectedSkillLevel === 'ALL' || (t.skillLevel || '').toUpperCase() === selectedSkillLevel.toUpperCase();

      const record = attendanceMap[t.traineeUuid];

      const matchesStatus =
        selectedStatusFilter === 'ALL' ||
        (selectedStatusFilter === 'UNMARKED' && !record) ||
        (record && record.status === selectedStatusFilter);

      return matchesSearch && matchesPackage && matchesSkill && matchesStatus;
    });
  }, [trainees, searchTerm, selectedPackageUuid, selectedSkillLevel, selectedStatusFilter, attendanceMap]);

  // Computed live summary from map
  const computedStats = useMemo(() => {
    const total = trainees.length;
    let present = 0;
    let late = 0;
    let absent = 0;
    let excused = 0;

    Object.values(attendanceMap).forEach((r) => {
      if (r.status === 'PRESENT') present++;
      else if (r.status === 'LATE') late++;
      else if (r.status === 'ABSENT') absent++;
      else if (r.status === 'EXCUSED') excused++;
    });

    const markedTotal = present + late + absent + excused;
    const rate = markedTotal > 0 ? Math.round(((present + late) / markedTotal) * 100) : 0;
    const unmarked = Math.max(0, total - markedTotal);

    return { total, present, late, absent, excused, unmarked, rate };
  }, [trainees, attendanceMap]);

  return (
    <div className="w-full max-w-full min-h-screen bg-background pb-36 overflow-x-hidden text-foreground selection:bg-primary/20">
      {/* ── TOAST NOTIFICATIONS ── */}
      {toastSuccess && (
        <div className="fixed bottom-8 right-4 sm:right-8 z-50 flex items-center gap-3 bg-emerald-600/95 backdrop-blur-md text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl shadow-emerald-500/30 border border-emerald-400/30 animate-in fade-in slide-in-from-bottom-4 duration-200 max-w-[90vw]">
          <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>
          <span className="truncate">{toastSuccess}</span>
        </div>
      )}
      {toastError && (
        <div className="fixed bottom-8 right-4 sm:right-8 z-50 flex items-center gap-3 bg-rose-600/95 backdrop-blur-md text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl shadow-rose-500/30 border border-rose-400/30 animate-in fade-in slide-in-from-bottom-4 duration-200 max-w-[90vw]">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="truncate">{toastError}</span>
        </div>
      )}

      {/* ── HERO BANNER & GLASS HEADER ── */}
      <div className="relative w-full border-b backdrop-blur-2xl bg-gradient-to-b from-card/80 via-card/50 to-background" style={{ borderColor: 'var(--athlon-border)' }}>
        {/* Neon Ambient Glow Lights */}
        <div className="absolute -top-16 left-1/4 w-96 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-0 right-10 w-80 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-4 space-y-3.5">
          {/* Top Row: Brand & Live Training Badge & Action buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
            {/* Title & Brand */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative group shrink-0">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary via-emerald-500 to-teal-400 p-[1.5px] shadow-lg shadow-primary/20">
                  <div className="w-full h-full rounded-[14px] bg-background/90 backdrop-blur-xl flex items-center justify-center">
                    <UserCheck className="w-5 h-5 text-primary group-hover:scale-110 transition duration-300" />
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-background animate-pulse" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-base sm:text-lg font-black tracking-tight text-foreground leading-tight truncate">
                    Coach Attendance
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/10 border border-primary/25 text-primary">
                    <Zap className="w-2.5 h-2.5 fill-primary" />
                    Live
                  </span>
                </div>
                <p className="text-xs text-foreground/50 truncate mt-0.5 flex items-center gap-1.5">
                  <span className="font-semibold text-foreground/80">{orgName}</span>
                  <span>•</span>
                  <span>{formatDisplayDate(selectedDate)}</span>
                </p>
              </div>
            </div>

            {/* Right Buttons: Refresh, Today shortcut, Bulk Check-in */}
            <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
              <button
                onClick={jumpToToday}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition active:scale-95 flex items-center gap-1.5 ${selectedDate === getLocalDateString()
                  ? 'bg-primary/10 border-primary/30 text-primary font-black'
                  : 'bg-card hover:bg-surface border-border text-foreground/70'
                  }`}
                style={{ borderColor: 'var(--athlon-border)' }}
              >
                <CalendarDays className="w-3.5 h-3.5" />
                <span>Today</span>
              </button>

              <button
                onClick={() => loadAttendance(true)}
                disabled={refreshing}
                className="p-2 rounded-xl border bg-card hover:bg-surface text-foreground/60 hover:text-foreground transition active:scale-95 disabled:opacity-50 shadow-sm"
                style={{ borderColor: 'var(--athlon-border)' }}
                title="Sync attendance records"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-primary' : ''}`} />
              </button>

              <button
                onClick={handleMarkAllPresent}
                disabled={bulkSaving || filteredTrainees.length === 0}
                className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-black bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20 active:scale-95 transition disabled:opacity-50 whitespace-nowrap"
              >
                {bulkSaving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                )}
                <span>Check All Present</span>
              </button>
            </div>
          </div>

          {/* Bottom Row: High-Tech 7-Day Scrubber Ribbon */}
          <div className="flex items-center justify-between gap-1.5 sm:gap-2 w-full min-w-0 pt-1">
            {/* Prev Day Button */}
            <button
              onClick={() => changeDateByDays(-1)}
              className="p-2 sm:p-2.5 rounded-xl border bg-card/60 text-foreground/70 hover:text-foreground hover:bg-card transition active:scale-95 shrink-0 shadow-sm"
              style={{ borderColor: 'var(--athlon-border)' }}
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* 7-Day Interactive Scrubber Strip */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0 overflow-x-auto no-scrollbar justify-between">
              {dayStrip.map((day) => {
                return (
                  <button
                    key={day.dateStr}
                    onClick={() => setSelectedDate(day.dateStr)}
                    className={`flex flex-col items-center justify-center py-1.5 px-2 sm:px-3 rounded-2xl border transition-all duration-200 flex-1 min-w-[40px] max-w-[70px] ${day.isSelected
                      ? 'bg-gradient-to-b from-primary to-primary/90 text-primary-foreground border-primary shadow-lg shadow-primary/30 scale-105 font-black ring-2 ring-primary/30'
                      : day.isToday
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20 font-bold'
                        : 'bg-card/40 text-foreground/60 hover:text-foreground hover:bg-card/80'
                      }`}
                    style={!day.isSelected && !day.isToday ? { borderColor: 'var(--athlon-border)' } : undefined}
                  >
                    <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 leading-none">
                      {day.dayName}
                    </span>
                    <span className="text-xs sm:text-sm font-black mt-1 leading-none">
                      {day.dayNum}
                    </span>
                    {day.isToday && !day.isSelected && (
                      <span className="w-1 h-1 rounded-full bg-emerald-400 mt-1" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Next Day Button */}
            <button
              onClick={() => changeDateByDays(1)}
              className="p-2 sm:p-2.5 rounded-xl border bg-card/60 text-foreground/70 hover:text-foreground hover:bg-card transition active:scale-95 shrink-0 shadow-sm"
              style={{ borderColor: 'var(--athlon-border)' }}
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Native Calendar Picker Trigger */}
            <div className="relative shrink-0">
              <button
                className="p-2 sm:p-2.5 rounded-xl border bg-card/60 text-primary hover:bg-primary/10 hover:border-primary/30 transition active:scale-95 shadow-sm"
                style={{ borderColor: 'var(--athlon-border)' }}
                title="Select Specific Date"
              >
                <CalendarIcon className="w-4 h-4" />
              </button>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT AREA ── */}
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 pt-5 sm:pt-6 space-y-4 sm:space-y-6 w-full max-w-full">
        {/* ── TELEMETRY PERFORMANCE MATRIX CARDS ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* 1. Overall Check-in Rate Card */}
          <div
            className="p-4 rounded-3xl border bg-gradient-to-br from-card/90 via-card/60 to-card/30 backdrop-blur-xl relative overflow-hidden shadow-sm flex flex-col justify-between group hover:border-primary/40 transition duration-300"
            style={{ borderColor: 'var(--athlon-border)' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-foreground/50">
                Attendance Rate
              </span>
              <div className="w-7 h-7 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center text-primary">
                <Gauge className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="mt-3 flex items-baseline justify-between">
              <div className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                {computedStats.rate}%
              </div>
              <span className="text-[10px] font-bold text-foreground/50">
                {computedStats.present + computedStats.late}/{computedStats.total} active
              </span>
            </div>

            {/* Progress bar line */}
            <div className="w-full bg-background/80 h-1.5 rounded-full mt-3 overflow-hidden border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, computedStats.rate)}%` }}
              />
            </div>
          </div>

          {/* 2. Present Count Card */}
          <div
            onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'PRESENT' ? 'ALL' : 'PRESENT')}
            className={`p-4 rounded-3xl border cursor-pointer backdrop-blur-xl relative overflow-hidden shadow-sm flex flex-col justify-between transition-all duration-200 active:scale-98 ${selectedStatusFilter === 'PRESENT'
              ? 'bg-emerald-500/15 border-emerald-500/50 ring-2 ring-emerald-500/30'
              : 'bg-card/60 hover:bg-emerald-500/[0.07] border-white/10'
              }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400">
                Present & On-Time
              </span>
              <div className="w-7 h-7 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="mt-3 flex items-baseline justify-between">
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight">
                {computedStats.present}
              </div>
              <span className="text-[10px] font-black text-emerald-400/80 uppercase">
                {computedStats.total > 0 ? Math.round((computedStats.present / computedStats.total) * 100) : 0}% Trainees
              </span>
            </div>

            <p className="text-[10px] text-foreground/45 mt-2 truncate">
              Ready on court for training
            </p>
          </div>

          {/* 3. Late Count Card */}
          <div
            onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'LATE' ? 'ALL' : 'LATE')}
            className={`p-4 rounded-3xl border cursor-pointer backdrop-blur-xl relative overflow-hidden shadow-sm flex flex-col justify-between transition-all duration-200 active:scale-98 ${selectedStatusFilter === 'LATE'
              ? 'bg-amber-500/15 border-amber-500/50 ring-2 ring-amber-500/30'
              : 'bg-card/60 hover:bg-amber-500/[0.07] border-white/10'
              }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-400">
                Late Arrivals
              </span>
              <div className="w-7 h-7 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Clock className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="mt-3 flex items-baseline justify-between">
              <div className="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight">
                {computedStats.late}
              </div>
              <span className="text-[10px] font-black text-amber-400/80 uppercase">
                Delayed Session
              </span>
            </div>

            <p className="text-[10px] text-foreground/45 mt-2 truncate">
              Joined after warmups started
            </p>
          </div>

          {/* 4. Absent & Excused Card */}
          <div
            onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'ABSENT' ? 'ALL' : 'ABSENT')}
            className={`p-4 rounded-3xl border cursor-pointer backdrop-blur-xl relative overflow-hidden shadow-sm flex flex-col justify-between transition-all duration-200 active:scale-98 ${selectedStatusFilter === 'ABSENT'
              ? 'bg-rose-500/15 border-rose-500/50 ring-2 ring-rose-500/30'
              : 'bg-card/60 hover:bg-rose-500/[0.07] border-white/10'
              }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-rose-400">
                Absent / Excused
              </span>
              <div className="w-7 h-7 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <XCircle className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="mt-3 flex items-baseline justify-between">
              <div className="text-2xl sm:text-3xl font-black text-rose-400 tracking-tight">
                {computedStats.absent}
                <span className="text-xs text-sky-400 font-bold ml-1.5">
                  ({computedStats.excused} Excused)
                </span>
              </div>
              <span className="text-[10px] font-black text-rose-400/80 uppercase">
                {computedStats.unmarked > 0 ? `${computedStats.unmarked} Pending` : 'Recorded'}
              </span>
            </div>

            <p className="text-[10px] text-foreground/45 mt-2 truncate">
              Unattended or requested leave
            </p>
          </div>
        </div>

        {/* ── SEARCH & FILTER CONTROLS BAR ── */}
        <div
          className="p-3.5 sm:p-4 rounded-3xl border bg-card/40 backdrop-blur-xl flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 w-full max-w-full shadow-sm"
          style={{ borderColor: 'var(--athlon-border)' }}
        >
          {/* Left: Search input with clear icon */}
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/40" />
            <input
              type="text"
              placeholder="Search trainees by name, phone or coaching package..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 bg-background/80 border rounded-2xl text-xs text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary/60 transition shadow-inner font-medium"
              style={{ borderColor: 'var(--athlon-border)' }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Right Filters: Package Filter, Skill Filter, Status Clear */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Package Filter */}
            <select
              value={selectedPackageUuid}
              onChange={(e) => setSelectedPackageUuid(e.target.value)}
              className="px-3 py-2.5 bg-background/80 border rounded-2xl text-xs text-foreground focus:outline-none focus:border-primary/60 transition font-medium flex-1 sm:flex-none max-w-[180px] truncate"
              style={{ borderColor: 'var(--athlon-border)' }}
            >
              <option value="ALL">All Coaching Plans</option>
              {packages.map((p) => (
                <option key={p.packageUuid} value={p.packageUuid}>
                  {p.name}
                </option>
              ))}
            </select>

            {/* Skill Level Filter */}
            <select
              value={selectedSkillLevel}
              onChange={(e) => setSelectedSkillLevel(e.target.value)}
              className="px-3 py-2.5 bg-background/80 border rounded-2xl text-xs text-foreground focus:outline-none focus:border-primary/60 transition font-medium flex-1 sm:flex-none max-w-[140px] truncate"
              style={{ borderColor: 'var(--athlon-border)' }}
            >
              <option value="ALL">All Skill Levels</option>
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
              <option value="ELITE">Elite</option>
              <option value="PRO">Pro</option>
            </select>

            {/* Quick Reset Filters Pill */}
            {(searchTerm || selectedPackageUuid !== 'ALL' || selectedSkillLevel !== 'ALL' || selectedStatusFilter !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedPackageUuid('ALL');
                  setSelectedSkillLevel('ALL');
                  setSelectedStatusFilter('ALL');
                }}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition active:scale-95 flex items-center gap-1 shrink-0"
              >
                <X className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* ── TRAINEES ROSTER LIST ── */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="relative w-14 h-14 rounded-3xl bg-primary/10 border border-primary/25 flex items-center justify-center mb-3 shadow-inner">
              <Loader2 className="w-7 h-7 animate-spin text-primary" />
            </div>
            <p className="text-sm font-black text-foreground">Syncing Coach Attendance Matrix...</p>
            <p className="text-xs text-foreground/45 mt-0.5">Fetching enrolled trainees and check-in records</p>
          </div>
        ) : filteredTrainees.length === 0 ? (
          <div
            className="py-16 px-4 rounded-3xl border text-center flex flex-col items-center justify-center bg-card/30 backdrop-blur-md shadow-sm"
            style={{ borderColor: 'var(--athlon-border)' }}
          >
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border border-primary/25 flex items-center justify-center text-primary mb-3 shadow-inner">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-sm sm:text-base font-black text-foreground">No trainees found matching criteria</h3>
            <p className="text-xs text-foreground/50 max-w-sm mt-1">
              {searchTerm || selectedPackageUuid !== 'ALL' || selectedStatusFilter !== 'ALL'
                ? 'Try resetting the search filters or selecting another date.'
                : 'No active trainees are enrolled in your coach workspace.'}
            </p>
            <Link
              href={`/org/${orgUuid}/students`}
              className="mt-4 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-primary to-emerald-500 text-primary-foreground text-xs font-black hover:opacity-90 transition shadow-lg shadow-primary/25 active:scale-95"
            >
              Manage & Enrol Trainees
            </Link>
          </div>
        ) : (
          <div className="space-y-3 w-full max-w-full">
            {filteredTrainees.map((trainee) => {
              const record = attendanceMap[trainee.traineeUuid];
              const status = record?.status as AttendanceStatus | undefined;
              const isUpdating = updatingTraineeUuid === trainee.traineeUuid;
              const isExpanded = expandedTraineeUuid === trainee.traineeUuid;
              const draft = draftDetails[trainee.traineeUuid] || {
                checkInTime: record?.checkInTime || '',
                focusDrills: record?.focusDrills || '',
                performanceRating: record?.performanceRating || 0,
                coachNotes: record?.coachNotes || '',
              };

              const skillStyle = SKILL_CONFIG[(trainee.skillLevel || 'BEGINNER').toUpperCase()] || SKILL_CONFIG.BEGINNER;

              return (
                <div
                  key={trainee.traineeUuid}
                  className={`group rounded-3xl border transition-all duration-300 overflow-hidden w-full max-w-full backdrop-blur-xl ${status === 'PRESENT'
                    ? 'bg-gradient-to-r from-emerald-500/[0.08] via-card/70 to-card/40 border-emerald-500/30 shadow-md shadow-emerald-500/5'
                    : status === 'LATE'
                      ? 'bg-gradient-to-r from-amber-500/[0.08] via-card/70 to-card/40 border-amber-500/30 shadow-md shadow-amber-500/5'
                      : status === 'ABSENT'
                        ? 'bg-gradient-to-r from-rose-500/[0.08] via-card/70 to-card/40 border-rose-500/30 shadow-md shadow-rose-500/5'
                        : status === 'EXCUSED'
                          ? 'bg-gradient-to-r from-sky-500/[0.08] via-card/70 to-card/40 border-sky-500/30 shadow-md shadow-sky-500/5'
                          : 'bg-card/40 hover:bg-card/70 border-white/10 hover:border-white/20'
                    }`}
                >
                  {/* Trainee Card Main Row */}
                  <div className="p-3.5 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 w-full min-w-0">
                    {/* Left: Athlete Profile Capsule */}
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      {/* Avatar with Status Ring */}
                      <div className="relative shrink-0">
                        {trainee.photo ? (
                          <img
                            src={trainee.photo}
                            alt={trainee.fullName}
                            className="w-13 h-13 rounded-2xl object-cover border-2 border-white/15 shadow-md"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary/30 via-primary/10 to-emerald-500/10 border border-primary/30 flex items-center justify-center font-black text-sm text-primary shadow-inner">
                            {trainee.fullName.charAt(0).toUpperCase()}
                          </div>
                        )}

                        {/* Status Aura Badge */}
                        {status && (
                          <div
                            className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background flex items-center justify-center shadow-lg ${status === 'PRESENT'
                              ? 'bg-emerald-500 text-white'
                              : status === 'LATE'
                                ? 'bg-amber-500 text-white'
                                : status === 'ABSENT'
                                  ? 'bg-rose-500 text-white'
                                  : 'bg-sky-500 text-white'
                              }`}
                          >
                            {status === 'PRESENT' && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            {status === 'LATE' && <Clock className="w-2.5 h-2.5" />}
                            {status === 'ABSENT' && <X className="w-2.5 h-2.5 stroke-[3]" />}
                            {status === 'EXCUSED' && <FileText className="w-2.5 h-2.5" />}
                          </div>
                        )}
                      </div>

                      {/* Name, Skill Badges & Stats */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-xs sm:text-sm font-black text-foreground truncate tracking-tight">
                            {trainee.fullName}
                          </h3>

                          {/* Skill Level Badge */}
                          <span
                            className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider border flex items-center gap-1 ${skillStyle.bg} ${skillStyle.color} ${skillStyle.border}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${skillStyle.dotColor}`} />
                            {skillStyle.label}
                          </span>

                          {/* Package Badge */}
                          {trainee.packageName && (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/25 text-indigo-400">
                              {trainee.packageName}
                            </span>
                          )}
                        </div>

                        {/* Sub telemetry: Phone, Attendance Streak %, Check-in time, Performance stars */}
                        <div className="flex items-center gap-2.5 sm:gap-3 mt-1.5 text-[10px] text-foreground/50 flex-wrap">
                          {trainee.phone && (
                            <span className="flex items-center gap-1 hover:text-foreground/80 transition">
                              <Phone className="w-2.5 h-2.5" />
                              {trainee.phone}
                            </span>
                          )}

                          <span className="flex items-center gap-1 font-bold text-foreground/75">
                            <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
                            {trainee.attendanceRate || 100}% attendance
                          </span>

                          {record?.checkInTime && (
                            <span className="flex items-center gap-1 font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/25">
                              <Clock className="w-2.5 h-2.5" />
                              In: {record.checkInTime}
                            </span>
                          )}

                          {record?.performanceRating && (
                            <span className="flex items-center gap-1 text-amber-400 font-black bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/25">
                              <Star className="w-2.5 h-2.5 fill-amber-400" />
                              {record.performanceRating}/5 Form
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Tactile 4-State Segmented Control & Studio Buttons */}
                    <div className="flex items-center justify-between md:justify-end gap-2 w-full md:w-auto shrink-0 pt-2.5 md:pt-0 border-t md:border-t-0 border-white/5 min-w-0">
                      {/* Segmented Status Toggle Pill Group */}
                      <div
                        className="flex items-center p-1 rounded-2xl bg-background/90 border shadow-inner flex-1 md:flex-none justify-between sm:justify-start gap-1 min-w-0"
                        style={{ borderColor: 'var(--athlon-border)' }}
                      >
                        {/* PRESENT */}
                        <button
                          type="button"
                          onClick={() => handleSetStatus(trainee, 'PRESENT')}
                          disabled={isUpdating}
                          className={`flex items-center justify-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] font-black transition-all active:scale-95 flex-1 sm:flex-none ${status === 'PRESENT'
                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/40 ring-1 ring-emerald-300'
                            : 'text-foreground/60 hover:text-emerald-400 hover:bg-emerald-500/10'
                            }`}
                        >
                          <Check className="w-3 h-3 stroke-[3] shrink-0" />
                          <span>Present</span>
                        </button>

                        {/* LATE */}
                        <button
                          type="button"
                          onClick={() => handleSetStatus(trainee, 'LATE')}
                          disabled={isUpdating}
                          className={`flex items-center justify-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl text-[11px] font-black transition-all active:scale-95 flex-1 sm:flex-none ${status === 'LATE'
                            ? 'bg-amber-500 text-white shadow-md shadow-amber-500/40 ring-1 ring-amber-300'
                            : 'text-foreground/60 hover:text-amber-400 hover:bg-amber-500/10'
                            }`}
                        >
                          <Clock className="w-3 h-3 shrink-0" />
                          <span>Late</span>
                        </button>

                        {/* ABSENT */}
                        <button
                          type="button"
                          onClick={() => handleSetStatus(trainee, 'ABSENT')}
                          disabled={isUpdating}
                          className={`flex items-center justify-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl text-[11px] font-black transition-all active:scale-95 flex-1 sm:flex-none ${status === 'ABSENT'
                            ? 'bg-rose-500 text-white shadow-md shadow-rose-500/40 ring-1 ring-rose-300'
                            : 'text-foreground/60 hover:text-rose-400 hover:bg-rose-500/10'
                            }`}
                        >
                          <X className="w-3 h-3 stroke-[3] shrink-0" />
                          <span>Absent</span>
                        </button>

                        {/* EXCUSED */}
                        <button
                          type="button"
                          onClick={() => handleSetStatus(trainee, 'EXCUSED')}
                          disabled={isUpdating}
                          className={`flex items-center justify-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl text-[11px] font-black transition-all active:scale-95 flex-1 sm:flex-none ${status === 'EXCUSED'
                            ? 'bg-sky-500 text-white shadow-md shadow-sky-500/40 ring-1 ring-sky-300'
                            : 'text-foreground/60 hover:text-sky-400 hover:bg-sky-500/10'
                            }`}
                        >
                          <FileText className="w-3 h-3 shrink-0" />
                          <span>Excused</span>
                        </button>
                      </div>

                      {/* Action Icons: History Timeline & Drills Drawer */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => openHistory(trainee)}
                          className="p-2 rounded-xl text-foreground/50 hover:text-primary hover:bg-primary/10 border border-transparent hover:border-primary/20 transition active:scale-95"
                          title="View Attendance & Progress History"
                        >
                          <History className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (isExpanded) {
                              setExpandedTraineeUuid(null);
                            } else {
                              setExpandedTraineeUuid(trainee.traineeUuid);
                              setDraftDetails((prev) => ({
                                ...prev,
                                [trainee.traineeUuid]: {
                                  checkInTime: record?.checkInTime || '',
                                  focusDrills: record?.focusDrills || '',
                                  performanceRating: record?.performanceRating || 0,
                                  coachNotes: record?.coachNotes || '',
                                },
                              }));
                            }
                          }}
                          className={`flex items-center gap-1 px-2.5 py-2 rounded-xl border transition active:scale-95 text-xs font-bold ${isExpanded
                            ? 'bg-primary/20 text-primary border-primary/40'
                            : 'text-foreground/60 hover:text-foreground border-white/10 hover:bg-white/5'
                            }`}
                          title="Session Drills, Ratings & Notes"
                        >
                          <Dumbbell className="w-3.5 h-3.5" />
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* ── EXPANDABLE SESSION STUDIO DRAWER ── */}
                  {isExpanded && (
                    <div
                      className="p-4 sm:p-5 bg-gradient-to-b from-black/40 to-black/20 border-t space-y-4 animate-in fade-in slide-in-from-top-2 duration-200"
                      style={{ borderColor: 'var(--athlon-border)' }}
                    >
                      {/* Row 1: Arrival Time + 5-Star Form Rating */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Arrival Timestamp with Quick Buttons */}
                        <div>
                          <label className="block text-[10px] font-black text-foreground/50 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-primary" />
                            <span>Arrival Timestamp</span>
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="time"
                              value={draft.checkInTime || ''}
                              onChange={(e) =>
                                setDraftDetails((prev) => ({
                                  ...prev,
                                  [trainee.traineeUuid]: { ...draft, checkInTime: e.target.value },
                                }))
                              }
                              className="px-3 py-2 bg-background/90 border rounded-xl text-xs text-foreground font-bold focus:outline-none focus:border-primary/60 flex-1"
                              style={{ borderColor: 'var(--athlon-border)' }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const now = new Date().toTimeString().slice(0, 5);
                                setDraftDetails((prev) => ({
                                  ...prev,
                                  [trainee.traineeUuid]: { ...draft, checkInTime: now },
                                }));
                              }}
                              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-bold text-foreground/80 transition active:scale-95"
                            >
                              Now
                            </button>
                          </div>
                        </div>

                        {/* Session Form Rating (1-5 Stars) */}
                        <div>
                          <label className="block text-[10px] font-black text-foreground/50 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                            <Star className="w-3.5 h-3.5 text-amber-400" />
                            <span>Training Form & Effort Rating</span>
                          </label>
                          <div className="flex items-center gap-2 py-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() =>
                                  setDraftDetails((prev) => ({
                                    ...prev,
                                    [trainee.traineeUuid]: { ...draft, performanceRating: star },
                                  }))
                                }
                                className="p-1.5 rounded-xl hover:bg-white/10 transition active:scale-95"
                              >
                                <Star
                                  className={`w-5 h-5 transition-all ${(draft.performanceRating || 0) >= star
                                    ? 'text-amber-400 fill-amber-400 scale-110 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                                    : 'text-foreground/20 hover:text-amber-400/50'
                                    }`}
                                />
                              </button>
                            ))}
                            {(draft.performanceRating || 0) > 0 && (
                              <span className={`text-xs font-black ml-1 ${RATING_DESCRIPTIONS[draft.performanceRating!]?.color || 'text-amber-400'}`}>
                                {RATING_DESCRIPTIONS[draft.performanceRating!]?.label || `${draft.performanceRating}/5`}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Row 2: Focus Drills Practiced */}
                      <div>
                        <label className="block text-[10px] font-black text-foreground/50 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                          <Target className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Drills Practiced in Today's Session</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Smash defense, drop deception, backhand cross-court..."
                          value={draft.focusDrills || ''}
                          onChange={(e) =>
                            setDraftDetails((prev) => ({
                              ...prev,
                              [trainee.traineeUuid]: { ...draft, focusDrills: e.target.value },
                            }))
                          }
                          className="w-full px-3 py-2 bg-background/90 border rounded-xl text-xs text-foreground placeholder:text-foreground/35 focus:outline-none focus:border-primary/60 font-medium"
                          style={{ borderColor: 'var(--athlon-border)' }}
                        />

                        {/* Quick Drill Tag Chips */}
                        <div className="flex items-center gap-1.5 flex-wrap mt-2">
                          <span className="text-[10px] font-bold text-foreground/40">Suggested Drills:</span>
                          {DRILL_SUGGESTIONS.map((drill) => (
                            <button
                              key={drill}
                              type="button"
                              onClick={() => {
                                const current = draft.focusDrills || '';
                                const updated = current ? `${current}, ${drill}` : drill;
                                setDraftDetails((prev) => ({
                                  ...prev,
                                  [trainee.traineeUuid]: { ...draft, focusDrills: updated },
                                }));
                              }}
                              className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-foreground/70 transition active:scale-95"
                            >
                              + {drill}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Row 3: Coach Feedback & Notes */}
                      <div>
                        <label className="block text-[10px] font-black text-foreground/50 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Coach Observation, Technique Advice & Homework</span>
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Enter athlete assessment, technical correction points, or endurance homework..."
                          value={draft.coachNotes || ''}
                          onChange={(e) =>
                            setDraftDetails((prev) => ({
                              ...prev,
                              [trainee.traineeUuid]: { ...draft, coachNotes: e.target.value },
                            }))
                          }
                          className="w-full px-3 py-2 bg-background/90 border rounded-xl text-xs text-foreground placeholder:text-foreground/35 focus:outline-none focus:border-primary/60 resize-none font-medium"
                          style={{ borderColor: 'var(--athlon-border)' }}
                        />

                        {/* Preset Note Quick-Chips */}
                        <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                          <span className="text-[10px] font-bold text-foreground/40">Quick Notes:</span>
                          {QUICK_NOTES_PRESETS.slice(0, 3).map((note, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setDraftDetails((prev) => ({
                                  ...prev,
                                  [trainee.traineeUuid]: { ...draft, coachNotes: note },
                                }));
                              }}
                              className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 transition active:scale-95 truncate max-w-[260px]"
                            >
                              {note}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Drawer Bottom Actions */}
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                        <button
                          type="button"
                          onClick={() => setExpandedTraineeUuid(null)}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-foreground/60 hover:text-foreground transition"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveDetails(trainee)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-primary text-primary-foreground hover:opacity-90 transition active:scale-95 shadow-lg shadow-primary/25"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Save Session Details</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── TRAINEE ATTENDANCE & PERFORMANCE HISTORY MODAL ── */}
      {historyTrainee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="w-full max-w-xl bg-card rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
            style={{ borderColor: 'var(--athlon-border)' }}
          >
            {/* Modal Header */}
            <div
              className="p-4 sm:p-5 border-b flex items-center justify-between bg-gradient-to-r from-card via-card/80 to-background"
              style={{ borderColor: 'var(--athlon-border)' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/30 via-primary/10 to-emerald-500/10 border border-primary/30 flex items-center justify-center text-primary font-black text-base shadow-inner">
                  {historyTrainee.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-foreground leading-tight">
                    {historyTrainee.fullName}
                  </h3>
                  <p className="text-[11px] text-foreground/50 mt-0.5">
                    Attendance Log & Training Milestones • {historyTrainee.packageName || 'Personal Coaching'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setHistoryTrainee(null)}
                className="p-2 rounded-xl text-foreground/40 hover:text-foreground hover:bg-white/5 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1">
              {loadingHistory ? (
                <div className="py-16 flex flex-col items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                  <p className="text-xs font-bold text-foreground/70">Retrieving training milestones...</p>
                </div>
              ) : historyRecords.length === 0 ? (
                <div className="py-12 text-center text-xs text-foreground/50">
                  No previous attendance records recorded for this trainee yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {historyRecords.map((r) => (
                    <div
                      key={r.attendanceUuid}
                      className="p-3.5 rounded-2xl border bg-background/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-sm hover:border-white/20 transition"
                      style={{ borderColor: 'var(--athlon-border)' }}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-3.5 h-3.5 rounded-full mt-1 shrink-0 ${r.status === 'PRESENT'
                            ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                            : r.status === 'LATE'
                              ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                              : r.status === 'ABSENT'
                                ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'
                                : 'bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.5)]'
                            }`}
                        />
                        <div>
                          <div className="font-black text-foreground text-xs sm:text-sm">
                            {formatDisplayDate(r.attendanceDate)}
                          </div>
                          {r.focusDrills && (
                            <div className="text-[11px] font-semibold text-primary mt-1">
                              🎯 Drills: {r.focusDrills}
                            </div>
                          )}
                          {r.coachNotes && (
                            <div className="text-[10px] text-foreground/60 italic mt-1 bg-white/5 p-2 rounded-xl border border-white/5">
                              "{r.coachNotes}"
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        {r.performanceRating && (
                          <div className="flex items-center gap-1 text-[11px] font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                            <Star className="w-3 h-3 fill-amber-400" />
                            <span>{r.performanceRating}/5</span>
                          </div>
                        )}
                        <span
                          className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider ${r.status === 'PRESENT'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : r.status === 'LATE'
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                              : r.status === 'ABSENT'
                                ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                                : 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                            }`}
                        >
                          {r.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div
              className="p-3.5 sm:p-4 border-t bg-card flex items-center justify-between text-xs text-foreground/60"
              style={{ borderColor: 'var(--athlon-border)' }}
            >
              <span className="font-bold">Total Sessions Recorded: {historyRecords.length}</span>
              <button
                onClick={() => setHistoryTrainee(null)}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition text-xs shadow-md shadow-primary/20"
              >
                Close Logs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
