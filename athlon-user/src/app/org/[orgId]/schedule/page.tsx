'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  Search,
  Plus,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  Phone,
  MessageCircle,
  Mail,
  Filter,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Building2,
  ChevronDown,
  ChevronUp,
  UserCheck,
  Activity,
  Award,
  Zap,
} from 'lucide-react';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { useOrgRole } from '@/hooks/use-org-role';
import { useOrgSports, getSportEmoji } from '@/lib/hooks/useOrgSports';
import { AcademyStudentService, AcademyBatch } from '@/lib/api/academyStudent';
import { AcademyStaffService, AcademyStaffResponse } from '@/lib/api/academyStaff';
import { AcademyService, AcademyCentre } from '@/lib/api/academy';

/* ─── Day Constants ─── */
const DAYS_OF_WEEK = [
  { key: 'ALL', short: 'All', label: 'All Days' },
  { key: 'MON', short: 'Mon', label: 'Monday' },
  { key: 'TUE', short: 'Tue', label: 'Tuesday' },
  { key: 'WED', short: 'Wed', label: 'Wednesday' },
  { key: 'THU', short: 'Thu', label: 'Thursday' },
  { key: 'FRI', short: 'Fri', label: 'Friday' },
  { key: 'SAT', short: 'Sat', label: 'Saturday' },
  { key: 'SUN', short: 'Sun', label: 'Sunday' },
];

const BATCH_LEVELS = [
  { value: 'ALL', label: 'All Levels' },
  { value: 'BEGINNER', label: 'Beginner' },
  { value: 'INTERMEDIATE', label: 'Intermediate' },
  { value: 'ADVANCED', label: 'Advanced' },
  { value: 'ELITE', label: 'Elite' },
];

export default function SchedulePage() {
  const params = useParams();
  const orgIdParam = (params?.orgId as string) || '';
  const { getActiveOrganization } = useWorkspaceStore();
  const activeOrg = getActiveOrganization();
  const orgUuid = activeOrg?.id || orgIdParam;
  const orgName = activeOrg?.name ?? 'Academy';

  const { isAdmin } = useOrgRole();
  const canManage = isAdmin;
  const { sports: orgSports } = useOrgSports(orgUuid);

  // States
  const [batches, setBatches] = useState<AcademyBatch[]>([]);
  const [coaches, setCoaches] = useState<AcademyStaffResponse[]>([]);
  const [centres, setCentres] = useState<AcademyCentre[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Selected Day
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('TODAY');
  const [selectedSport, setSelectedSport] = useState<string>('ALL');
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  const [selectedCoachUuid, setSelectedCoachUuid] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [viewMode, setViewMode] = useState<'CARDS' | 'TIMELINE' | 'WEEKLY'>('CARDS');

  // Load Data
  const loadData = async () => {
    if (!orgUuid) return;
    try {
      setLoading(true);
      const [batchesRes, coachesRes, centresRes] = await Promise.allSettled([
        AcademyStudentService.getBatches(orgUuid),
        AcademyStaffService.getCoaches(orgUuid),
        AcademyService.getCentres(orgUuid),
      ]);

      if (batchesRes.status === 'fulfilled') {
        setBatches(batchesRes.value || []);
      }
      if (coachesRes.status === 'fulfilled') {
        const raw = coachesRes.value;
        setCoaches(Array.isArray(raw) ? raw : (raw as any)?.data || []);
      }
      if (centresRes.status === 'fulfilled') {
        setCentres(centresRes.value || []);
      }
    } catch (err) {
      console.error('Failed to load schedule data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [orgUuid]);

  // Determine current day of week key (e.g. 'MON', 'TUE', etc.)
  const getTodayKey = (d: Date) => {
    const map = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    return map[d.getDay()];
  };

  const currentDayKey = getTodayKey(currentDate);

  // Helper to check if batch runs on given day
  const batchRunsOnDay = (batch: AcademyBatch, dayKey: string) => {
    if (dayKey === 'ALL') return true;
    const daysStr = (batch.daysOfWeek || '').toUpperCase();
    if (!daysStr || daysStr.includes('DAILY') || daysStr.includes('ALL')) return true;
    if (daysStr.includes('WEEKDAY') && ['MON', 'TUE', 'WED', 'THU', 'FRI'].includes(dayKey)) return true;
    if (daysStr.includes('WEEKEND') && ['SAT', 'SUN'].includes(dayKey)) return true;
    return daysStr.includes(dayKey);
  };

  // Active day key for filter
  const activeDayKey = selectedDayFilter === 'TODAY' ? currentDayKey : selectedDayFilter;

  // Filtered batches
  const filteredBatches = useMemo(() => {
    return batches.filter((b) => {
      const q = searchTerm.toLowerCase().trim();
      const matchQuery =
        !q ||
        [b.batchName, b.coachName, b.courtName, b.sportType, b.level, b.startTime, b.endTime].some((v) =>
          v?.toLowerCase().includes(q)
        );

      const matchDay = batchRunsOnDay(b, activeDayKey);

      const matchSport =
        selectedSport === 'ALL' ||
        (b.sportType && b.sportType.toLowerCase() === selectedSport.toLowerCase());

      const matchLevel =
        selectedLevel === 'ALL' ||
        (b.level && b.level.toUpperCase() === selectedLevel.toUpperCase());

      const matchCoach =
        selectedCoachUuid === 'ALL' ||
        b.coachUuid === selectedCoachUuid ||
        (b.coachName && coaches.find((c) => c.staffUuid === selectedCoachUuid)?.fullName === b.coachName);

      return matchQuery && matchDay && matchSport && matchLevel && matchCoach;
    });
  }, [batches, searchTerm, activeDayKey, selectedSport, selectedLevel, selectedCoachUuid, coaches]);

  // Sort batches by Start Time
  const sortedBatches = useMemo(() => {
    return [...filteredBatches].sort((a, b) => {
      const timeA = a.startTime || '00:00';
      const timeB = b.startTime || '00:00';
      return timeA.localeCompare(timeB);
    });
  }, [filteredBatches]);

  // Format Date String (e.g. "Wednesday, 2 Sep")
  const formattedDate = useMemo(() => {
    return currentDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }, [currentDate]);

  // Navigation handlers for date picker
  const handlePrevDay = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() - 1);
    setCurrentDate(next);
    setSelectedDayFilter('TODAY');
  };

  const handleNextDay = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 1);
    setCurrentDate(next);
    setSelectedDayFilter('TODAY');
  };

  const handleTodayJump = () => {
    setCurrentDate(new Date());
    setSelectedDayFilter('TODAY');
  };

  // Find coach details helper
  const getCoachDetails = (batch: AcademyBatch) => {
    if (!batch.coachUuid && !batch.coachName) return null;
    return coaches.find(
      (c) =>
        (batch.coachUuid && c.userUuid === batch.coachUuid) ||
        (batch.coachUuid && c.staffUuid === batch.coachUuid) ||
        (batch.coachName && c.fullName?.toLowerCase() === batch.coachName.toLowerCase())
    );
  };

  // Time slot helper for status badge
  const getBatchTimeStatus = (batch: AcademyBatch) => {
    if (!batch.startTime || !batch.endTime) return null;
    try {
      const now = new Date();
      const [sh, sm] = batch.startTime.split(':').map(Number);
      const [eh, em] = batch.endTime.split(':').map(Number);

      const start = new Date(now);
      start.setHours(sh || 0, sm || 0, 0, 0);

      const end = new Date(now);
      end.setHours(eh || 0, em || 0, 0, 0);

      if (now >= start && now <= end) {
        return { label: 'LIVE NOW', class: 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse' };
      }
      if (now < start && start.getTime() - now.getTime() < 3600000) {
        const mins = Math.round((start.getTime() - now.getTime()) / 60000);
        return { label: `IN ${mins}M`, class: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
      }
      if (now > end) {
        return { label: 'COMPLETED', class: 'bg-white/5 text-foreground/40 border-white/10' };
      }
      return { label: 'UPCOMING', class: 'bg-primary/10 text-primary border-primary/20' };
    } catch {
      return null;
    }
  };

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
                  Schedule
                </h1>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-primary/10 text-primary border border-primary/20">
                  {filteredBatches.length} Sessions
                </span>
              </div>
              <p className="text-[10px] text-foreground/45 truncate">
                Training Calendars &amp; Court Timetables • {orgName}
              </p>
            </div>
          </div>

          {/* Quick Top Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Link
              href={`/org/${orgUuid}/batches`}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-[10px] font-bold text-foreground/70 hover:text-foreground transition active:scale-95"
              style={{ borderColor: 'var(--athlon-border)' }}
              title="Manage Batches"
            >
              <Layers className="w-3 h-3 text-cyan-400" />
              <span>Batches</span>
            </Link>
          </div>
        </div>

        {/* ── Interactive Date Navigator Strip ── */}
        <div
          className="flex items-center justify-between gap-2 p-1.5 rounded-xl border mb-2"
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
            <span className="text-xs font-black text-foreground">{formattedDate}</span>
            <button
              onClick={handleTodayJump}
              className="px-2 py-0.5 rounded-md text-[9px] font-extrabold bg-primary/15 text-primary border border-primary/25 hover:bg-primary/25 transition cursor-pointer"
            >
              Today
            </button>
          </div>

          <button
            onClick={handleNextDay}
            className="p-1.5 rounded-lg hover:bg-white/10 text-foreground/70 transition cursor-pointer"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* ── Search & Filter Controls ── */}
        <div className="flex items-center gap-1.5">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-foreground/35" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search session, coach, court, time..."
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

          {/* Level Filter Selector */}
          <div className="relative shrink-0">
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="pl-2.5 pr-7 py-1.5 rounded-xl text-[11px] font-bold border text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 appearance-none cursor-pointer transition shadow-sm"
              style={{ backgroundColor: 'var(--athlon-input)', borderColor: 'var(--athlon-border)' }}
            >
              {BATCH_LEVELS.map((lvl) => (
                <option key={lvl.value} value={lvl.value} className="bg-[#18181b] text-white font-semibold">
                  {lvl.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 text-foreground/50 pointer-events-none" />
          </div>
        </div>

        {/* ── Days of Week Filter Strip ── */}
        <div className="flex items-center gap-1 overflow-x-auto pt-2 pb-0.5 hide-scrollbar">
          <button
            onClick={() => setSelectedDayFilter('TODAY')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition whitespace-nowrap shrink-0 border ${
              selectedDayFilter === 'TODAY'
                ? 'bg-primary text-black border-primary font-black shadow-sm'
                : 'bg-white/[0.03] text-foreground/60 border-white/5 hover:border-white/15'
            }`}
          >
            Today ({currentDayKey})
          </button>
          {DAYS_OF_WEEK.map((d) => (
            <button
              key={d.key}
              onClick={() => setSelectedDayFilter(d.key)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition whitespace-nowrap shrink-0 border ${
                selectedDayFilter === d.key
                  ? 'bg-primary text-black border-primary font-black shadow-sm'
                  : 'bg-white/[0.03] text-foreground/60 border-white/5 hover:border-white/15'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        {/* Sport Discipline Filter Chips */}
        {orgSports.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1.5 pb-0.5 hide-scrollbar">
            <button
              onClick={() => setSelectedSport('ALL')}
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition whitespace-nowrap shrink-0 border ${
                selectedSport === 'ALL'
                  ? 'bg-primary/20 text-primary border-primary/40 font-extrabold'
                  : 'bg-white/[0.02] text-foreground/50 border-white/5 hover:border-white/10'
              }`}
            >
              All Sports
            </button>
            {orgSports.map((sport) => (
              <button
                key={sport}
                onClick={() => setSelectedSport(sport)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold transition whitespace-nowrap shrink-0 border ${
                  selectedSport === sport
                    ? 'bg-primary/20 text-primary border-primary/40 font-extrabold'
                    : 'bg-white/[0.02] text-foreground/50 border-white/5 hover:border-white/10'
                }`}
              >
                <span>{getSportEmoji(sport)}</span>
                <span>{sport}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── MAIN SCHEDULE STREAM ── */}
      <div className="px-3.5 sm:px-4 pt-2 space-y-2.5">

        {/* Telemetry Summary */}
        {!loading && (
          <div
            className="grid grid-cols-3 divide-x divide-white/5 rounded-2xl border p-2 text-center"
            style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
          >
            <div>
              <div className="text-xs font-mono font-black text-primary">{sortedBatches.length}</div>
              <div className="text-[8px] uppercase tracking-wider font-bold text-foreground/40">Scheduled</div>
            </div>
            <div>
              <div className="text-xs font-mono font-black text-cyan-400">{coaches.length}</div>
              <div className="text-[8px] uppercase tracking-wider font-bold text-foreground/40">Coaches</div>
            </div>
            <div>
              <div className="text-xs font-mono font-black text-amber-400">
                {sortedBatches.reduce((sum, b) => sum + (b.enrolledCount || 0), 0)}
              </div>
              <div className="text-[8px] uppercase tracking-wider font-bold text-foreground/40">Athletes</div>
            </div>
          </div>
        )}

        {/* Loading / Empty States */}
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[220px] gap-2.5">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
            <p className="text-xs text-foreground/40 font-medium">Fetching training schedule...</p>
          </div>
        ) : sortedBatches.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[200px] text-center space-y-2 px-4 py-8">
            <div className="w-12 h-12 rounded-2xl bg-card border border-border flex items-center justify-center text-xl">
              🗓️
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">No sessions scheduled for this day</p>
              <p className="text-[11px] text-foreground/45 mt-0.5 max-w-xs">
                {searchTerm
                  ? 'Try clearing your search query or filters.'
                  : 'Create coaching batches to automatically populate the calendar timetable.'}
              </p>
            </div>
            {canManage && (
              <Link
                href={`/org/${orgUuid}/batches`}
                className="mt-2 px-3.5 py-2 rounded-xl bg-primary text-black text-xs font-black shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Create Training Batch</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-2.5">
            {sortedBatches.map((batch) => {
              const coachObj = getCoachDetails(batch);
              const timeStatus = getBatchTimeStatus(batch);
              const enrolled = batch.enrolledCount || 0;
              const capacity = batch.maxCapacity || 15;
              const capacityPct = Math.min(100, Math.round((enrolled / capacity) * 100));
              const cleanPhone = (coachObj?.phone || '').replace(/[^0-9]/g, '');

              return (
                <div
                  key={batch.batchUuid}
                  className="rounded-xl border overflow-hidden transition-all shadow-sm"
                  style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                >
                  <div className="p-3">
                    {/* Header: Sport Emoji, Batch Name, Time Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        {/* Sport / Time Badge */}
                        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/25 flex flex-col items-center justify-center text-primary font-black shrink-0">
                          <span className="text-sm">{getSportEmoji(batch.sportType)}</span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs sm:text-sm font-black text-foreground truncate">
                              {batch.batchName}
                            </span>
                            {batch.level && (
                              <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 uppercase">
                                {batch.level}
                              </span>
                            )}
                            {batch.sportType && (
                              <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-white/5 border border-white/10 text-foreground/70">
                                {batch.sportType}
                              </span>
                            )}
                            {timeStatus && (
                              <span className={`px-1.5 py-0.2 rounded text-[8px] font-black border uppercase ${timeStatus.class}`}>
                                {timeStatus.label}
                              </span>
                            )}
                          </div>

                          {/* Time & Days Subtitle */}
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-foreground/60 flex-wrap">
                            <span className="font-mono font-bold text-primary flex items-center gap-1">
                              <Clock className="w-3 h-3 text-primary" />
                              <span>{batch.startTime || '06:00'} - {batch.endTime || '07:30'}</span>
                            </span>
                            <span>•</span>
                            <span className="text-foreground/50">{batch.daysOfWeek || 'Daily'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Middle: Coach & Court Row */}
                    <div className="grid grid-cols-2 gap-2 mt-2.5 p-2 rounded-lg bg-black/20 text-[10px]">
                      {/* Coach Assignment */}
                      <div className="flex items-center gap-1.5 min-w-0">
                        <div className="w-5 h-5 rounded-md bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center shrink-0 text-[9px]">
                          {coachObj?.fullName ? coachObj.fullName.slice(0, 2).toUpperCase() : 'CO'}
                        </div>
                        <div className="min-w-0 truncate">
                          <span className="text-foreground/40 text-[8px] block uppercase leading-none">Coach</span>
                          <span className="font-bold text-foreground truncate block">
                            {coachObj?.fullName || batch.coachName || 'Unassigned'}
                          </span>
                        </div>
                      </div>

                      {/* Court / Venue */}
                      <div className="flex items-center gap-1.5 min-w-0">
                        <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                        <div className="min-w-0 truncate">
                          <span className="text-foreground/40 text-[8px] block uppercase leading-none">Venue / Court</span>
                          <span className="font-bold text-foreground truncate block">
                            {batch.courtName || 'Main Training Facility'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Capacity Progress Bar */}
                    <div className="mt-2.5 space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-foreground/50 flex items-center gap-1">
                          <Users className="w-3 h-3 text-foreground/40" />
                          <span>Roster Capacity</span>
                        </span>
                        <span className="font-mono font-bold text-foreground">
                          {enrolled} / {capacity} ({capacityPct}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            capacityPct >= 100
                              ? 'bg-red-400'
                              : capacityPct >= 75
                              ? 'bg-amber-400'
                              : 'bg-primary'
                          }`}
                          style={{ width: `${capacityPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Bottom Action Strip */}
                    <div className="flex items-center justify-between gap-2 mt-2.5 pt-2 border-t border-white/5">
                      {/* Contact Coach Actions */}
                      <div className="flex items-center gap-1">
                        {coachObj?.phone && (
                          <a
                            href={`tel:${coachObj.phone}`}
                            className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 transition active:scale-95"
                            title="Call Coach"
                          >
                            <Phone className="w-3 h-3" />
                          </a>
                        )}
                        {cleanPhone && (
                          <a
                            href={`https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : '91' + cleanPhone}?text=${encodeURIComponent(
                              `Hello Coach ${coachObj?.fullName || ''}, regarding ${batch.batchName} session at ${orgName}.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition active:scale-95"
                            title="WhatsApp Coach"
                          >
                            <MessageCircle className="w-3 h-3" />
                          </a>
                        )}
                      </div>

                      {/* Manage Batch Button */}
                      <Link
                        href={`/org/${orgUuid}/batches`}
                        className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-foreground/70 hover:text-foreground text-[10px] font-bold transition active:scale-95 flex items-center gap-1"
                      >
                        <Layers className="w-3 h-3 text-cyan-400" />
                        <span>Manage Batch</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── FLOATING ACTION BUTTON (CREATE/MANAGE BATCH) ── */}
      {canManage && (
        <Link
          href={`/org/${orgUuid}/batches`}
          className="fixed bottom-24 right-5 z-40 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl active:scale-95 transition-all cursor-pointer"
          style={{
            backgroundColor: 'var(--athlon-primary)',
            boxShadow: '0 8px 24px var(--athlon-primary-glow), 0 4px 10px rgba(0,0,0,0.5)',
          }}
          aria-label="Create Batch"
        >
          <Plus className="w-6 h-6 text-black" strokeWidth={2.5} />
        </Link>
      )}
    </div>
  );
}
