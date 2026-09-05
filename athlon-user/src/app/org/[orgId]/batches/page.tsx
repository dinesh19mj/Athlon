'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles,
  Users,
  Calendar,
  Clock,
  Plus,
  Edit2,
  Trash2,
  X,
  Loader2,
  Search,
  Building2,
  MapPin,
  IndianRupee,
  GraduationCap,
  Target,
  ChevronDown,
  ChevronUp,
  Layers,
  ArrowRight,
  Check,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import {
  AcademyService,
  AcademyBatchItem,
  AcademyCentre,
  AcademyFacility,
} from '@/lib/api/academy';
import { useOrgSports } from '@/lib/hooks/useOrgSports';

/* ─── Constants & Metadata ─── */
const DAYS_OF_WEEK = [
  { key: 'MON', label: 'M' },
  { key: 'TUE', label: 'T' },
  { key: 'WED', label: 'W' },
  { key: 'THU', label: 'T' },
  { key: 'FRI', label: 'F' },
  { key: 'SAT', label: 'S' },
  { key: 'SUN', label: 'S' },
];

const LEVEL_OPTIONS = [
  { value: 'BEGINNER', label: 'Beginner', color: 'text-sky-400 bg-sky-500/10 border-sky-500/25' },
  { value: 'INTERMEDIATE', label: 'Intermediate', color: 'text-violet-400 bg-violet-500/10 border-violet-500/25' },
  { value: 'ADVANCED', label: 'Advanced', color: 'text-amber-400 bg-amber-500/10 border-amber-500/25' },
  { value: 'ELITE', label: 'Elite', color: 'text-rose-400 bg-rose-500/10 border-rose-500/25' },
  { value: 'PRO', label: 'Pro', color: 'text-primary bg-primary/10 border-primary/25' },
];

const AGE_CATEGORIES = ['U9', 'U11', 'U13', 'U15', 'U17', 'U19', 'OPEN', 'ADULTS', 'MASTERS'];

const SPORT_META: Record<string, { label: string; emoji: string }> = {
  BADMINTON: { label: 'Badminton', emoji: '🏸' },
  CRICKET: { label: 'Cricket', emoji: '🏏' },
  FOOTBALL: { label: 'Football', emoji: '⚽' },
  TENNIS: { label: 'Tennis', emoji: '🎾' },
  TABLE_TENNIS: { label: 'Table Tennis', emoji: '🏓' },
  BASKETBALL: { label: 'Basketball', emoji: '🏀' },
  SWIMMING: { label: 'Swimming', emoji: '🏊' },
  VOLLEYBALL: { label: 'Volleyball', emoji: '🏐' },
  SQUASH: { label: 'Squash', emoji: '🎾' },
  PICKLEBALL: { label: 'Pickleball', emoji: '🏓' },
  OTHER: { label: 'Multi-Sport', emoji: '🏅' },
};

function getSportEmoji(sport?: string) {
  if (!sport) return '🎯';
  const key = sport.toUpperCase().replace(/\s+/g, '_');
  return SPORT_META[key]?.emoji ?? '🎯';
}

/* ─── Time Helper Functions ─── */
function formatTime12h(time24: string): string {
  if (!time24) return '';
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  if (isNaN(h)) return time24;
  const m = mStr || '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12;
  return `${h.toString().padStart(2, '0')}:${m} ${ampm}`;
}

function parseTimeTo24h(timeStr: string): string {
  if (!timeStr) return '06:00';
  if (/^\d{2}:\d{2}(:\d{2})?$/.test(timeStr)) {
    return timeStr.slice(0, 5);
  }
  const match = timeStr.trim().match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!match) return '06:00';
  let [_, hStr, m, period] = match;
  let h = parseInt(hStr, 10);
  if (period) {
    if (period.toUpperCase() === 'PM' && h < 12) h += 12;
    if (period.toUpperCase() === 'AM' && h === 12) h = 0;
  }
  return `${h.toString().padStart(2, '0')}:${m}`;
}

function parseDays(d?: string): string[] {
  return d ? d.split(',').map((x) => x.trim().toUpperCase()).filter(Boolean) : [];
}

/* ─── Tiny Input Component ─── */
function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
  colSpan = false,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  colSpan?: boolean;
}) {
  return (
    <div className={colSpan ? 'col-span-2' : ''}>
      <label className="block text-[10px] font-bold text-foreground/50 uppercase tracking-wider mb-1">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 bg-background/60 border border-white/10 rounded-xl text-xs text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition"
      />
    </div>
  );
}

export default function CoachingBatchesPage() {
  const params = useParams();
  const orgId = (params?.orgId as string) || '';
  const { getActiveOrganization, organizations } = useWorkspaceStore();
  const activeOrg = getActiveOrganization() || organizations.find((o) => o.id === orgId);
  const orgName = activeOrg?.name ?? 'Academy Workspace';
  const { sports: orgSports } = useOrgSports(orgId);

  const sportOptions = useMemo(() => {
    if (orgSports.length > 0) {
      return orgSports.map((s) => {
        const key = s.toUpperCase().replace(/[\s\-_/]+/g, '_');
        const meta = SPORT_META[key] || { label: s, emoji: getSportEmoji(s) };
        return {
          value: key,
          label: `${meta.emoji} ${meta.label}`,
          emoji: meta.emoji,
          name: meta.label,
        };
      });
    }
    return [
      {
        value: 'BADMINTON',
        label: '🏸 Badminton',
        emoji: '🏸',
        name: 'Badminton',
      },
    ];
  }, [orgSports]);

  const [batches, setBatches] = useState<AcademyBatchItem[]>([]);
  const [centres, setCentres] = useState<AcademyCentre[]>([]);
  const [facilities, setFacilities] = useState<AcademyFacility[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSport, setSelectedSport] = useState('ALL');
  const [selectedLevel, setSelectedLevel] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [editingBatch, setEditingBatch] = useState<AcademyBatchItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [deletingBatch, setDeletingBatch] = useState<AcademyBatchItem | null>(null);

  const [batchName, setBatchName] = useState('');
  const [sportType, setSportType] = useState('BADMINTON');
  const [level, setLevel] = useState('BEGINNER');
  const [ageCategory, setAgeCategory] = useState('U15');
  const [programFocus, setProgramFocus] = useState('');
  const [coachName, setCoachName] = useState('');
  const [centreUuid, setCentreUuid] = useState('');
  const [facilityUuid, setFacilityUuid] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>(['MON', 'WED', 'FRI']);
  const [startTime, setStartTime] = useState('06:00');
  const [endTime, setEndTime] = useState('07:30');
  const [maxCapacity, setMaxCapacity] = useState(20);
  const [monthlyFee, setMonthlyFee] = useState<number | ''>(3500);
  const [status, setStatus] = useState<'ACTIVE' | 'FULL' | 'ARCHIVED'>('ACTIVE');

  const loadData = async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const [batchData, centreData, facilityData] = await Promise.all([
        AcademyService.getBatches(orgId),
        AcademyService.getCentres(orgId),
        AcademyService.getFacilities(orgId),
      ]);
      setBatches(batchData || []);
      setCentres(centreData || []);
      setFacilities(facilityData || []);
    } catch (e) {
      console.error('Failed to load coaching batches:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [orgId]);

  const openCreateModal = () => {
    const defaultKey = sportOptions[0]?.value || 'BADMINTON';
    setEditingBatch(null);
    setBatchName('');
    setSportType(defaultKey);
    setLevel('BEGINNER');
    setAgeCategory('U15');
    setProgramFocus('');
    setCoachName('');
    setCentreUuid(centres[0]?.centreUuid || '');
    setFacilityUuid('');
    setSelectedDays(['MON', 'WED', 'FRI']);
    setStartTime('06:00');
    setEndTime('07:30');
    setMaxCapacity(20);
    setMonthlyFee(3500);
    setStatus('ACTIVE');
    setShowModal(true);
  };

  const openEditModal = (batch: AcademyBatchItem) => {
    setEditingBatch(batch);
    setBatchName(batch.batchName || '');
    setSportType((batch.sportType || 'BADMINTON').toUpperCase());
    setLevel((batch.level || 'BEGINNER').toUpperCase());
    setAgeCategory(batch.ageCategory || 'U15');
    setProgramFocus(batch.programFocus || '');
    setCoachName(batch.coachName || '');
    setCentreUuid(batch.centreUuid || '');
    setFacilityUuid(batch.facilityUuid || '');
    setSelectedDays(parseDays(batch.daysOfWeek));
    setStartTime(parseTimeTo24h(batch.startTime || '06:00'));
    setEndTime(parseTimeTo24h(batch.endTime || '07:30'));
    setMaxCapacity(batch.maxCapacity ?? 20);
    setMonthlyFee(batch.monthlyFee !== undefined ? batch.monthlyFee : '');
    setStatus((batch.status as any) || 'ACTIVE');
    setShowModal(true);
  };

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSaveBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchName.trim()) return;
    setSaving(true);
    setErrorMsg('');

    try {
      const matchedCentre = centres.find((c) => c.centreUuid === centreUuid);
      const matchedFacility = facilities.find((f) => f.facilityUuid === facilityUuid);

      const payload: Partial<AcademyBatchItem> = {
        organizationUuid: orgId,
        batchName,
        sportType,
        level,
        ageCategory,
        programFocus,
        coachName,
        centreUuid: centreUuid || undefined,
        centreName: matchedCentre?.name || undefined,
        facilityUuid: facilityUuid || undefined,
        courtName: matchedFacility?.name || undefined,
        daysOfWeek: selectedDays.join(','),
        startTime,
        endTime,
        maxCapacity: Number(maxCapacity) || 20,
        monthlyFee: monthlyFee !== '' ? Number(monthlyFee) : undefined,
        status,
      };

      if (editingBatch) {
        const updated = await AcademyService.updateBatch({
          ...payload,
          batchUuid: editingBatch.batchUuid,
        });
        setBatches((prev) =>
          prev.map((b) => (b.batchUuid === updated.batchUuid ? updated : b))
        );
        setSuccessMsg(`"${batchName}" updated`);
      } else {
        const created = await AcademyService.createBatch(payload);
        setBatches((prev) => [created, ...prev]);
        setSuccessMsg(`"${batchName}" created`);
      }

      setShowModal(false);
      await loadData();
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err: any) {
      console.error('Failed to save batch:', err);
      setErrorMsg(err.message || 'Failed to save batch.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (batch: AcademyBatchItem) => {
    setDeletingBatch(null);
    try {
      await AcademyService.deleteBatch(batch.batchUuid);
      setBatches((p) => p.filter((b) => b.batchUuid !== batch.batchUuid));
      setSuccessMsg(`"${batch.batchName}" removed`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e) {
      console.error(e);
      alert('Could not delete batch.');
    }
  };

  const filteredBatches = batches.filter((b) => {
    const q = searchTerm.toLowerCase().trim();
    const matchQuery =
      !q ||
      [b.batchName, b.coachName, b.sportType, b.courtName, b.centreName, b.ageCategory, b.level].some(
        (v) => v?.toLowerCase().includes(q)
      );
    const matchSport =
      selectedSport === 'ALL' ||
      b.sportType?.toUpperCase() === selectedSport.toUpperCase();
    const matchLevel =
      selectedLevel === 'ALL' ||
      b.level?.toUpperCase() === selectedLevel.toUpperCase();
    const matchStatus =
      selectedStatus === 'ALL' ||
      b.status?.toUpperCase() === selectedStatus.toUpperCase();

    return matchQuery && matchSport && matchLevel && matchStatus;
  });

  const totalBatches = batches.length;
  const activeBatches = batches.filter((b) => (b.status || 'ACTIVE').toUpperCase() === 'ACTIVE').length;
  const totalEnrolled = batches.reduce((s, b) => s + (b.enrolledCount ?? 0), 0);
  const totalCapacity = batches.reduce((s, b) => s + (b.maxCapacity ?? 20), 0);

  const modalFilteredFacilities = centreUuid
    ? facilities.filter((f) => f.centreUuid === centreUuid)
    : facilities;

  return (
    <div className="min-h-screen bg-background pb-28">

      <div
        className="sticky top-0 z-30 px-4 py-3 border-b backdrop-blur-xl"
        style={{ backgroundColor: 'var(--athlon-sidebar)', borderColor: 'var(--athlon-border)' }}
      >
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-sm font-black text-foreground leading-none">Coaching Batches</h1>
              <p className="text-[10px] text-foreground/45 mt-0.5">
                {totalBatches} batch{totalBatches !== 1 ? 'es' : ''} • {orgName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/org/${orgId}/facilities`}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-[10px] font-bold text-foreground/70 hover:text-foreground transition active:scale-95"
              style={{ borderColor: 'var(--athlon-border)' }}
            >
              <Layers className="w-3 h-3 text-cyan-400" />
              Courts ({facilities.length})
            </Link>
          </div>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-foreground/35" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search batch, coach, court, sport..."
            className="w-full pl-9 pr-8 py-2 rounded-xl text-xs text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-1 focus:ring-primary/30 transition"
            style={{ backgroundColor: 'var(--athlon-input)', borderColor: 'var(--athlon-border)', border: '1px solid' }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pt-2.5 pb-0.5 hide-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedSport('ALL')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition whitespace-nowrap shrink-0 border ${
              selectedSport === 'ALL'
                ? 'bg-primary text-black border-primary font-extrabold shadow-sm'
                : 'bg-white/[0.03] text-foreground/60 border-white/5 hover:border-white/15'
            }`}
          >
            All Sports ({totalBatches})
          </button>

          {sportOptions.map((sport) => {
            const count = batches.filter(
              (b) => b.sportType?.toUpperCase() === sport.value
            ).length;
            return (
              <button
                key={sport.value}
                type="button"
                onClick={() => setSelectedSport(sport.value)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition whitespace-nowrap shrink-0 border ${
                  selectedSport === sport.value
                    ? 'bg-primary text-black border-primary font-extrabold shadow-sm'
                    : 'bg-white/[0.03] text-foreground/60 border-white/5 hover:border-white/15'
                }`}
              >
                <span>{sport.emoji}</span>
                <span>{sport.name}</span>
                {count > 0 && (
                  <span
                    className={`text-[9px] px-1 rounded-full ${
                      selectedSport === sport.value
                        ? 'bg-black/20 text-black'
                        : 'bg-white/10 text-foreground/50'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 pb-0.5 hide-scrollbar">
          <button
            onClick={() => setSelectedLevel('ALL')}
            className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition shrink-0 border ${
              selectedLevel === 'ALL'
                ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30 font-bold'
                : 'bg-white/[0.02] text-foreground/40 border-white/5'
            }`}
          >
            All Levels
          </button>
          {LEVEL_OPTIONS.map((lvl) => (
            <button
              key={lvl.value}
              onClick={() => setSelectedLevel(lvl.value)}
              className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition shrink-0 border ${
                selectedLevel === lvl.value
                  ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30 font-bold'
                  : 'bg-white/[0.02] text-foreground/40 border-white/5'
              }`}
            >
              {lvl.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 space-y-2 pt-3">
        {successMsg && (
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-emerald-500/12 border border-emerald-500/25 text-emerald-400 text-xs font-semibold animate-in fade-in">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-red-500/12 border border-red-500/25 text-red-400 text-xs font-semibold animate-in fade-in">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {errorMsg}
          </div>
        )}
      </div>

      <div className="px-4 pt-3 space-y-3">

        {!loading && batches.length > 0 && (
          <div
            className="grid grid-cols-3 divide-x divide-white/5 rounded-2xl border p-2 text-center"
            style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
          >
            <div>
              <div className="text-xs font-mono font-black text-indigo-400">{activeBatches}</div>
              <div className="text-[8px] uppercase tracking-wider font-bold text-foreground/40">Active Batches</div>
            </div>
            <div>
              <div className="text-xs font-mono font-black text-emerald-400">{totalEnrolled}</div>
              <div className="text-[8px] uppercase tracking-wider font-bold text-foreground/40">Enrolled Students</div>
            </div>
            <div>
              <div className="text-xs font-mono font-black text-primary">{totalCapacity}</div>
              <div className="text-[8px] uppercase tracking-wider font-bold text-foreground/40">Total Seats</div>
            </div>
          </div>
        )}

        {!loading && filteredBatches.length > 0 && (
          <p className="text-[10px] text-foreground/35 font-medium px-1">
            Showing {filteredBatches.length} of {totalBatches}
          </p>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[280px] gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
            </div>
            <p className="text-[11px] text-foreground/40 font-medium">Loading batches…</p>
          </div>
        ) : filteredBatches.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[260px] text-center space-y-3 px-6">
            <div className="w-14 h-14 rounded-2xl bg-card border border-border flex items-center justify-center text-2xl">
              🎯
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">No coaching batches found</p>
              <p className="text-xs text-foreground/45 mt-1">
                {searchTerm
                  ? 'Try a different filter or search query.'
                  : 'Tap + to create your first coaching batch.'}
              </p>
            </div>
            {!searchTerm && (
              <button
                onClick={openCreateModal}
                className="px-5 py-2.5 bg-primary text-black text-xs font-extrabold rounded-2xl shadow-lg shadow-primary/25 active:scale-95 transition"
              >
                + Create First Batch
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBatches.map((batch) => {
              const isExpanded = expandedId === batch.batchUuid;
              const emoji = getSportEmoji(batch.sportType);
              const enrolled = batch.enrolledCount ?? 0;
              const capacity = batch.maxCapacity ?? 20;
              const pct = capacity > 0 ? Math.min(100, Math.round((enrolled / capacity) * 100)) : 0;
              const days = parseDays(batch.daysOfWeek);
              const lvlObj = LEVEL_OPTIONS.find((l) => l.value === (batch.level || 'BEGINNER').toUpperCase()) || LEVEL_OPTIONS[0];

              return (
                <div
                  key={batch.batchUuid}
                  className="rounded-2xl border overflow-hidden transition-all"
                  style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
                >
                  <button
                    className="w-full text-left p-4 flex items-start justify-between gap-3 active:bg-white/[0.02] transition"
                    onClick={() => setExpandedId(isExpanded ? null : batch.batchUuid)}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 text-xl">
                        {emoji}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-extrabold text-foreground truncate leading-tight">
                            {batch.batchName}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold border uppercase shrink-0 ${lvlObj.color}`}>
                            {batch.level || 'Beginner'}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase shrink-0 ${
                              batch.status === 'ACTIVE'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : batch.status === 'FULL'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-white/5 text-foreground/40 border border-white/10'
                            }`}
                          >
                            {batch.status || 'ACTIVE'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mt-1 flex-wrap text-[11px] text-foreground/50">
                          {(batch.startTime || batch.endTime) && (
                            <span className="flex items-center gap-1 font-medium text-foreground/70">
                              <Clock className="w-3 h-3 text-cyan-400 shrink-0" />
                              {formatTime12h(batch.startTime || '')} – {formatTime12h(batch.endTime || '')}
                            </span>
                          )}

                          {days.length > 0 && (
                            <span className="flex items-center gap-0.5">
                              {DAYS_OF_WEEK.map((d) => (
                                <span
                                  key={d.key}
                                  className={`w-3.5 h-3.5 rounded text-[8px] font-bold flex items-center justify-center ${
                                    days.includes(d.key)
                                      ? 'bg-primary/20 text-primary font-black border border-primary/30'
                                      : 'text-foreground/20'
                                  }`}
                                >
                                  {d.label}
                                </span>
                              ))}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-1 text-[10px] text-foreground/40 truncate">
                          {batch.coachName && (
                            <span className="flex items-center gap-1 truncate">
                              <GraduationCap className="w-3 h-3 text-purple-400 shrink-0" />
                              {batch.coachName}
                            </span>
                          )}
                          {(batch.courtName || batch.centreName) && (
                            <span className="flex items-center gap-1 truncate">
                              <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                              {batch.courtName || batch.centreName}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 text-foreground/30">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  <div className="px-4 pb-3">
                    <div className="flex items-center justify-between text-[10px] mb-1">
                      <span className="text-foreground/40 font-medium flex items-center gap-1">
                        <Users className="w-3 h-3 text-indigo-400" />
                        Roster
                      </span>
                      <span className="font-mono font-bold text-foreground">
                        {enrolled} / {capacity} ({pct}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          pct >= 90 ? 'bg-rose-400' : pct >= 70 ? 'bg-amber-400' : 'bg-emerald-400'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t space-y-2.5 px-4 py-3" style={{ borderColor: 'var(--athlon-border)' }}>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        {batch.ageCategory && (
                          <div className="flex items-center justify-between">
                            <span className="text-foreground/40">Age Group</span>
                            <span className="text-foreground font-semibold">{batch.ageCategory}</span>
                          </div>
                        )}

                        {batch.monthlyFee != null && (
                          <div className="flex items-center justify-between">
                            <span className="text-foreground/40">Monthly Fee</span>
                            <span className="text-primary font-bold font-mono">
                              ₹{Number(batch.monthlyFee).toLocaleString('en-IN')}
                            </span>
                          </div>
                        )}
                      </div>

                      {batch.programFocus && (
                        <div className="text-[10px] text-foreground/50 bg-white/[0.02] p-2 rounded-xl border border-white/5 italic">
                          🎯 {batch.programFocus}
                        </div>
                      )}

                      <div
                        className="flex items-center justify-between pt-2.5 border-t"
                        style={{ borderColor: 'var(--athlon-border)' }}
                      >
                        <Link
                          href={`/org/${orgId}/students?batchUuid=${batch.batchUuid}`}
                          className="flex items-center gap-1 text-[11px] font-bold text-primary active:opacity-70"
                        >
                          <Users className="w-3.5 h-3.5" />
                          View Students
                          <ArrowRight className="w-3 h-3" />
                        </Link>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditModal(batch)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold text-foreground/60 hover:text-foreground border border-transparent hover:border-white/10 transition active:scale-95"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            Edit
                          </button>
                          <button
                            onClick={() => setDeletingBatch(batch)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold text-red-400/70 hover:text-red-400 border border-transparent hover:border-red-500/20 transition active:scale-95"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <button
        onClick={openCreateModal}
        className="fixed bottom-24 right-5 z-40 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl active:scale-95 transition-all"
        style={{
          backgroundColor: 'var(--athlon-primary)',
          boxShadow: '0 8px 24px var(--athlon-primary-glow), 0 4px 10px rgba(0,0,0,0.5)',
        }}
        aria-label="New Batch"
      >
        <Plus className="w-6 h-6 text-black" strokeWidth={2.5} />
      </button>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div
            className="relative w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 sm:zoom-in-95"
            style={{ backgroundColor: 'var(--athlon-card)', maxHeight: '92dvh' }}
          >
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 rounded-full bg-white/15" />
            </div>

            <div
              className="flex items-center justify-between px-5 py-3 border-b"
              style={{ borderColor: 'var(--athlon-border)' }}
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <span className="text-sm font-extrabold text-foreground">
                  {editingBatch ? 'Edit Coaching Batch' : 'New Coaching Batch'}
                </span>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-foreground/50 hover:text-foreground hover:bg-white/5 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBatch} className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-cyan-400 mb-2">Batch Identity</p>
                <div className="space-y-3">
                  <Field
                    label="Batch Name"
                    value={batchName}
                    onChange={setBatchName}
                    placeholder="e.g. Morning Elite Shuttlers (B1)"
                    required
                  />

                  <div>
                    <label className="block text-[10px] font-bold text-foreground/50 uppercase tracking-wider mb-1.5">
                      Sport
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {sportOptions.map((sport) => {
                        const isSelected = sportType === sport.value;
                        return (
                          <button
                            key={sport.value}
                            type="button"
                            onClick={() => setSportType(sport.value)}
                            className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-bold transition text-left border ${
                              isSelected
                                ? 'bg-primary text-black border-primary font-extrabold shadow-sm'
                                : 'bg-background/40 text-foreground/70 border-white/10 hover:border-white/20'
                            }`}
                          >
                            <span className="text-base shrink-0">{sport.emoji}</span>
                            <span className="truncate text-[11px]">{sport.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Skill Level */}
                    <div>
                      <label className="block text-[10px] font-bold text-foreground/50 uppercase tracking-wider mb-1">
                        Skill Level
                      </label>
                      <div className="relative">
                        <select
                          value={level}
                          onChange={(e) => setLevel(e.target.value)}
                          className="w-full px-3 py-2.5 bg-background/60 border border-white/10 rounded-xl text-xs text-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition appearance-none cursor-pointer"
                        >
                          {LEVEL_OPTIONS.map((l) => (
                            <option key={l.value} value={l.value} className="bg-card text-foreground">
                              {l.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 pointer-events-none" />
                      </div>
                    </div>

                    {/* Age Group */}
                    <div>
                      <label className="block text-[10px] font-bold text-foreground/50 uppercase tracking-wider mb-1">
                        Age Category
                      </label>
                      <div className="relative">
                        <select
                          value={ageCategory}
                          onChange={(e) => setAgeCategory(e.target.value)}
                          className="w-full px-3 py-2.5 bg-background/60 border border-white/10 rounded-xl text-xs text-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition appearance-none cursor-pointer"
                        >
                          {AGE_CATEGORIES.map((a) => (
                            <option key={a} value={a} className="bg-card text-foreground">
                              {a}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section: Training Schedule */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Training Schedule</p>
                <div className="space-y-3">
                  {/* Days Toggle */}
                  <div>
                    <label className="block text-[10px] font-bold text-foreground/50 uppercase tracking-wider mb-1.5">
                      Days of Week ({selectedDays.length} Selected)
                    </label>
                    <div className="flex gap-1.5">
                      {DAYS_OF_WEEK.map((d) => {
                        const isSelected = selectedDays.includes(d.key);
                        return (
                          <button
                            key={d.key}
                            type="button"
                            onClick={() => toggleDay(d.key)}
                            className={`flex-1 py-2 rounded-xl text-xs font-extrabold border transition ${
                              isSelected
                                ? 'bg-primary text-black border-primary shadow-sm'
                                : 'bg-background/40 text-foreground/50 border-white/10 hover:border-white/20'
                            }`}
                          >
                            {d.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Clock Time Pickers */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-foreground/50 uppercase tracking-wider mb-1">
                        Start Time ⏰
                      </label>
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full px-3 py-2.5 bg-background/60 border border-white/10 rounded-xl text-xs text-foreground font-mono focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition cursor-pointer [color-scheme:dark]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-foreground/50 uppercase tracking-wider mb-1">
                        End Time ⏰
                      </label>
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full px-3 py-2.5 bg-background/60 border border-white/10 rounded-xl text-xs text-foreground font-mono focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition cursor-pointer [color-scheme:dark]"
                      />
                    </div>
                  </div>

                  {/* Live preview */}
                  <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="text-[11px] font-bold text-foreground/70">
                      {formatTime12h(startTime)} – {formatTime12h(endTime)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section: Location & Coach */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-2">Location &amp; Coach</p>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    {/* Campus Select */}
                    <div>
                      <label className="block text-[10px] font-bold text-foreground/50 uppercase tracking-wider mb-1">
                        Campus
                      </label>
                      <div className="relative">
                        <select
                          value={centreUuid}
                          onChange={(e) => {
                            setCentreUuid(e.target.value);
                            setFacilityUuid('');
                          }}
                          className="w-full px-3 py-2.5 bg-background/60 border border-white/10 rounded-xl text-xs text-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition appearance-none cursor-pointer"
                        >
                          <option value="" className="bg-card text-foreground">
                            Main Hub (Default)
                          </option>
                          {centres.map((c) => (
                            <option key={c.centreUuid} value={c.centreUuid} className="bg-card text-foreground">
                              {c.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 pointer-events-none" />
                      </div>
                    </div>

                    {/* Facility Select */}
                    <div>
                      <label className="block text-[10px] font-bold text-foreground/50 uppercase tracking-wider mb-1">
                        Court / Facility
                      </label>
                      <div className="relative">
                        <select
                          value={facilityUuid}
                          onChange={(e) => setFacilityUuid(e.target.value)}
                          className="w-full px-3 py-2.5 bg-background/60 border border-white/10 rounded-xl text-xs text-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition appearance-none cursor-pointer"
                        >
                          <option value="" className="bg-card text-foreground">
                            Select Court…
                          </option>
                          {modalFilteredFacilities.map((f) => (
                            <option key={f.facilityUuid} value={f.facilityUuid} className="bg-card text-foreground">
                              {f.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <Field
                    label="Assigned Coach"
                    value={coachName}
                    onChange={setCoachName}
                    placeholder="e.g. Coach Rajesh Kumar"
                  />
                </div>
              </div>

              {/* Section: Capacity, Pricing & Status */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-2">
                  Capacity, Fee &amp; Status
                </p>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Field
                      label="Max Capacity"
                      value={maxCapacity}
                      onChange={(v) => setMaxCapacity(Number(v) || 0)}
                      type="number"
                      placeholder="20"
                    />

                    <Field
                      label="Monthly Fee (₹)"
                      value={monthlyFee}
                      onChange={(v) => setMonthlyFee(v === '' ? '' : Number(v))}
                      type="number"
                      placeholder="3500"
                    />
                  </div>

                  <Field
                    label="Program Focus (Optional)"
                    value={programFocus}
                    onChange={setProgramFocus}
                    placeholder="e.g. Grassroots Foundation, Tournament Circuit"
                  />

                  {/* Status Dropdown */}
                  <div>
                    <label className="block text-[10px] font-bold text-foreground/50 uppercase tracking-wider mb-1">
                      Batch Status
                    </label>
                    <div className="relative">
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as any)}
                        className="w-full px-3 py-2.5 bg-background/60 border border-white/10 rounded-xl text-xs text-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition appearance-none cursor-pointer"
                      >
                        <option value="ACTIVE" className="bg-card text-foreground">Active</option>
                        <option value="FULL" className="bg-card text-foreground">Full</option>
                        <option value="ARCHIVED" className="bg-card text-foreground">Archived</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {errorMsg && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {errorMsg}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-1 pb-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-2xl text-xs font-bold text-foreground/70 border transition active:scale-95"
                  style={{ borderColor: 'var(--athlon-border)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 rounded-2xl text-xs font-extrabold text-black bg-primary shadow-lg shadow-primary/25 transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editingBatch ? 'Update Batch' : 'Create Batch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRMATION DIALOG ── */}
      {deletingBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div
            className="relative w-full max-w-sm rounded-3xl p-6 border shadow-2xl animate-in zoom-in-95 space-y-4"
            style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
          >
            <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/25 flex items-center justify-center text-red-400">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-extrabold text-foreground">Remove Batch?</h3>
              <p className="text-xs text-foreground/50 mt-1">
                &quot;{deletingBatch.batchName}&quot; will be deleted.
                {(deletingBatch.enrolledCount ?? 0) > 0 && (
                  <span className="text-red-400 font-semibold block mt-1">
                    {deletingBatch.enrolledCount} enrolled students will be unassigned.
                  </span>
                )}
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeletingBatch(null)}
                className="flex-1 py-2.5 rounded-xl border text-xs font-bold text-foreground/70 transition active:scale-95"
                style={{ borderColor: 'var(--athlon-border)' }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deletingBatch)}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-extrabold transition active:scale-95"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
