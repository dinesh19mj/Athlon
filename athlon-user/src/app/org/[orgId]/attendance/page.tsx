'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { ClubAttendanceService, ClubMemberAttendance, AttendanceSummary } from '@/lib/api/clubAttendance';
import { OrganizationService, OrganizationMemberResponse } from '@/lib/api/organization';
import { UserService } from '@/lib/api/user';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Clock,
  User,
  Users,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Sparkles,
  Shield,
  Phone,
  Search,
  CheckCheck,
  Zap,
} from 'lucide-react';
import { useOrgRole } from '@/hooks/use-org-role';
import { useAuthStore } from '@/lib/store/useAuthStore';
import AcademyAttendanceView from '@/components/academy/AcademyAttendanceView';
import CoachAttendanceView from '@/components/coach/CoachAttendanceView';

// Helper to get local date formatted as YYYY-MM-DD (avoiding UTC timezone shift)
const getLocalDateString = (d: Date = new Date()): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Deduplicate attendance records by member UUID / user UUID / user ID
const deduplicateAttendance = (items: ClubMemberAttendance[]): ClubMemberAttendance[] => {
  const seenUuids = new Set<string>();
  const seenUserUuids = new Set<string>();
  const seenUserIds = new Set<string>();

  return items.filter((m) => {
    if (m.organizationMemberUuid) {
      if (seenUuids.has(m.organizationMemberUuid)) return false;
      seenUuids.add(m.organizationMemberUuid);
    }
    if (m.userUuid) {
      const lower = m.userUuid.toLowerCase();
      if (seenUserUuids.has(lower)) return false;
      seenUserUuids.add(lower);
    }
    if (m.userId) {
      const idStr = String(m.userId);
      if (seenUserIds.has(idStr)) return false;
      seenUserIds.add(idStr);
    }
    return true;
  });
};

export default function AttendancePage() {
  const params = useParams();
  const orgIdParam = (params?.orgId as string) || '';
  const { getActiveOrganization } = useWorkspaceStore();
  const org = getActiveOrganization();
  const orgUuid = org?.id || orgIdParam;

  if (org?.type === 'ACADEMY') {
    return <AcademyAttendanceView orgUuid={orgUuid} orgName={org.name || 'Academy'} />;
  }

  if (org?.type === 'COACH') {
    return <CoachAttendanceView orgUuid={orgUuid} orgName={org.name || 'Coach Workspace'} />;
  }

  return <ClubAttendanceView orgUuid={orgUuid} orgName={org?.name || 'Club'} org={org} />;
}

function ClubAttendanceView({
  orgUuid,
  orgName,
  org,
}: {
  orgUuid: string;
  orgName: string;
  org?: any;
}) {
  const { personalProfile } = useWorkspaceStore();
  const { userUuid: authUserUuid, userId: authUserId } = useAuthStore();
  const { role, isAdmin, isCoach, canManage } = useOrgRole(orgUuid);
  const canTakeAttendance = isAdmin || isCoach;

  const [selectedDate, setSelectedDate] = useState<string>(getLocalDateString());
  const [attendanceList, setAttendanceList] = useState<ClubMemberAttendance[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PRESENT' | 'ABSENT' | 'UNMARKED'>('ALL');
  const [toastSuccess, setToastSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isMemberSelf = (member: ClubMemberAttendance) => {
    if (authUserUuid && member.userUuid && member.userUuid.toLowerCase() === authUserUuid.toLowerCase()) return true;
    if (authUserId && member.userId && String(member.userId) === String(authUserId)) return true;
    if (personalProfile?.id && member.userUuid && member.userUuid.toLowerCase() === personalProfile.id.toLowerCase()) return true;
    if (personalProfile?.name && member.fullName && member.fullName.trim().toLowerCase() === personalProfile.name.trim().toLowerCase()) return true;
    return false;
  };

  const myAttendanceRecord = attendanceList.find(isMemberSelf);

  useEffect(() => {
    if (orgUuid) {
      loadAttendanceData(selectedDate);
    }
  }, [orgUuid, selectedDate]);

  const loadAttendanceData = async (date: string) => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const [listRes, summaryRes] = await Promise.allSettled([
        ClubAttendanceService.getDailyAttendance(orgUuid, date),
        ClubAttendanceService.getSummary(orgUuid, date),
      ]);

      if (listRes.status === 'fulfilled') {
        const list = Array.isArray(listRes.value)
          ? listRes.value
          : ((listRes.value as any)?.data || []);
        setAttendanceList(deduplicateAttendance(list));
      } else {
        // Fallback to club members list
        try {
          const members = await OrganizationService.getMembers(orgUuid);
          const memberList = Array.isArray(members) ? members : ((members as any)?.data || []);
          const fallbackAttendance: ClubMemberAttendance[] = memberList.map(
            (m: OrganizationMemberResponse) => ({
              organizationMemberUuid: m.organizationMemberUuid,
              organizationMemberId: m.organizationMemberId,
              userUuid: m.userUuid,
              userId: m.userId,
              fullName: m.fullName,
              photo: m.photo,
              phone: m.phone,
              role: m.role,
              attendanceDate: date,
              status: 'UNMARKED',
            })
          );
          setAttendanceList(deduplicateAttendance(fallbackAttendance));
        } catch (memErr) {
          console.error('Failed to load fallback members:', memErr);
        }
      }

      if (summaryRes.status === 'fulfilled') {
        const sumData = (summaryRes.value as any)?.data || summaryRes.value;
        setSummary(sumData);
      }
    } catch (err: any) {
      console.error('Error loading attendance:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadAttendanceData(selectedDate);
  };

  const handleShiftDate = (days: number) => {
    const base = selectedDate ? new Date(`${selectedDate}T00:00:00`) : new Date();
    base.setDate(base.getDate() + days);
    setSelectedDate(getLocalDateString(base));
  };

  const handleSetToday = () => {
    setSelectedDate(getLocalDateString());
  };

  // Single member status change with optimistic update & instant persistence
  const handleStatusChange = async (memberUuid: string, newStatus: 'PRESENT' | 'ABSENT') => {
    const isSelfRecord = myAttendanceRecord?.organizationMemberUuid === memberUuid;

    // Optimistic UI update
    setAttendanceList((prev) =>
      prev.map((m) =>
        m.organizationMemberUuid === memberUuid ? { ...m, status: newStatus } : m
      )
    );

    try {
      await ClubAttendanceService.markAttendance({
        organizationUuid: orgUuid,
        organizationMemberUuid: memberUuid,
        attendanceDate: selectedDate,
        status: newStatus,
      });

      if (isSelfRecord) {
        setToastSuccess(
          newStatus === 'PRESENT'
            ? 'Checked in as Present!'
            : 'Marked as Absent.'
        );
      } else {
        setToastSuccess('Attendance record updated.');
      }
      setTimeout(() => setToastSuccess(null), 3000);

      // Reload summary in background
      ClubAttendanceService.getSummary(orgUuid, selectedDate)
        .then((res) => {
          const sumData = (res as any)?.data || res;
          setSummary(sumData);
        })
        .catch(() => { });
    } catch (err: any) {
      console.error('Failed to update attendance:', err);
      setToastSuccess('Failed to save status update.');
      setTimeout(() => setToastSuccess(null), 3000);
    }
  };

  // Bulk mark all members on this day
  const handleBulkMark = async (status: 'PRESENT' | 'ABSENT') => {
    if (attendanceList.length === 0) return;

    // Optimistic UI update
    setAttendanceList((prev) => prev.map((m) => ({ ...m, status })));

    try {
      setSaving(true);
      await ClubAttendanceService.bulkMarkAttendance({
        organizationUuid: orgUuid,
        attendanceDate: selectedDate,
        records: attendanceList.map((m) => ({
          organizationMemberUuid: m.organizationMemberUuid,
          status,
        })),
      });

      setToastSuccess(`All athletes marked as ${status.toLowerCase()}!`);
      setTimeout(() => setToastSuccess(null), 3000);
      loadAttendanceData(selectedDate);
    } catch (err: any) {
      console.error('Bulk mark failed:', err);
      setErrorMessage('Failed to bulk mark attendance.');
    } finally {
      setSaving(false);
    }
  };

  // Filter by search & status
  const filteredMembers = useMemo(() => {
    return attendanceList.filter((m) => {
      const matchSearch =
        (m.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.phone || '').includes(searchTerm);

      if (!matchSearch) return false;

      if (statusFilter === 'ALL') return true;
      return (m.status || 'UNMARKED') === statusFilter;
    });
  }, [attendanceList, searchTerm, statusFilter]);

  // FIX FOR DUPLICATE: Exclude self from the bottom roster because they are already prominently featured in the Top Check-In Card
  const displayRoster = useMemo(() => {
    if (myAttendanceRecord) {
      return filteredMembers.filter((m) => !isMemberSelf(m));
    }
    return filteredMembers;
  }, [filteredMembers, myAttendanceRecord]);

  const presentCount = attendanceList.filter((m) => m.status === 'PRESENT').length;
  const absentCount = attendanceList.filter((m) => m.status === 'ABSENT').length;
  const unmarkedCount = attendanceList.filter((m) => m.status === 'UNMARKED').length;
  const totalCount = attendanceList.length;
  const attendanceRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

  const formattedDate = useMemo(() => {
    const d = selectedDate ? new Date(`${selectedDate}T00:00:00`) : new Date();
    return {
      weekday: d.toLocaleDateString('en-GB', { weekday: 'short' }),
      day: d.toLocaleDateString('en-GB', { day: '2-digit' }),
      month: d.toLocaleDateString('en-GB', { month: 'short' }),
      year: d.getFullYear(),
      full: d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }),
    };
  }, [selectedDate]);

  const isToday = selectedDate === getLocalDateString();

  return (
    <div className="p-3 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-3.5 sm:space-y-6 md:space-y-8 animate-in fade-in duration-300">
      {/* Toast Notification Banner */}
      {toastSuccess && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2.5 bg-emerald-950/95 border border-emerald-500/40 text-emerald-300 px-4 py-2.5 rounded-2xl shadow-2xl backdrop-blur-xl animate-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-bold">{toastSuccess}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 sm:p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs font-bold flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ── HEADER SECTION (DESKTOP) ── */}
      <div className="hidden md:flex md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-3xl font-black text-foreground tracking-tight">
              Club Attendance
            </h1>
            <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-primary/15 text-primary border border-primary/30">
              {totalCount} {totalCount === 1 ? 'Member' : 'Members'}
            </span>
          </div>
          <p className="text-sm font-semibold text-foreground/50 mt-1">
            Track daily athlete check-ins and attendance records for <span className="text-foreground font-bold">{orgName}</span>
          </p>
        </div>

        {/* Action Dock */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-surface border border-border text-xs font-bold text-foreground hover:bg-surface-hover transition-all active:scale-95 disabled:opacity-50 cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-primary ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Syncing...' : 'Sync'}</span>
          </button>

          {!canTakeAttendance && (
            <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-foreground/5 border border-border text-[11px] font-bold text-foreground/70">
              <User className="w-3.5 h-3.5 text-primary" />
              <span>Athlete Mode</span>
            </span>
          )}
        </div>
      </div>

      {/* ── COMPACT MOBILE HEADER BAR ── */}
      <div className="flex md:hidden items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-black text-foreground tracking-tight truncate">
              Club Attendance
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-primary/15 text-primary border border-primary/25 shrink-0">
              {totalCount} {totalCount === 1 ? 'Member' : 'Members'}
            </span>
          </div>
          <p className="text-[11px] text-foreground/50 font-semibold truncate">
            {orgName}
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2 rounded-xl bg-surface border border-border text-foreground active:scale-95 transition shrink-0"
          title="Refresh"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-primary' : 'text-foreground/70'}`} />
        </button>
      </div>

      {/* ── DESKTOP DATE NAVIGATOR CONTROL ── */}
      <div
        className="hidden md:block p-4 rounded-3xl border shadow-sm space-y-3.5 relative overflow-hidden"
        style={{
          backgroundColor: 'var(--athlon-card)',
          borderColor: 'var(--athlon-border)',
        }}
      >
        <div className="flex items-center justify-between gap-3.5">
          {/* Day Shifter with Embedded Calendar */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleShiftDate(-1)}
              className="p-2.5 rounded-2xl border text-foreground/70 hover:text-foreground transition-all active:scale-95 cursor-pointer"
              style={{
                backgroundColor: 'var(--athlon-surface)',
                borderColor: 'var(--athlon-border)',
              }}
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Custom Interactive Date Badge with Native Picker */}
            <div
              className="relative flex items-center gap-2 px-4 py-2 rounded-2xl border transition-all shadow-inner group hover:border-primary/50"
              style={{
                backgroundColor: 'var(--athlon-surface)',
                borderColor: 'var(--athlon-border)',
              }}
            >
              <CalendarIcon className="w-4 h-4 text-primary shrink-0 group-hover:scale-110 transition-transform" />
              <div className="flex items-baseline gap-1.5">
                <span className="text-xs font-black text-foreground">{formattedDate.weekday},</span>
                <span className="text-xs font-mono font-black text-foreground">
                  {formattedDate.day} {formattedDate.month} {formattedDate.year}
                </span>
              </div>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                title="Choose custom date"
              />
            </div>

            <button
              onClick={() => handleShiftDate(1)}
              className="p-2.5 rounded-2xl border text-foreground/70 hover:text-foreground transition-all active:scale-95 cursor-pointer"
              style={{
                backgroundColor: 'var(--athlon-surface)',
                borderColor: 'var(--athlon-border)',
              }}
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Quick Date Pills */}
            <div className="flex items-center gap-1.5 pl-1">
              <button
                onClick={handleSetToday}
                className={`px-3.5 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer ${isToday
                    ? 'bg-primary text-black shadow-md shadow-primary/25'
                    : 'border text-foreground/70 hover:text-foreground'
                  }`}
                style={{
                  backgroundColor: !isToday ? 'var(--athlon-surface)' : undefined,
                  borderColor: !isToday ? 'var(--athlon-border)' : undefined,
                }}
              >
                Today
              </button>
            </div>
          </div>

          {/* Admin / Coach Fast Bulk Actions */}
          {canTakeAttendance && (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => handleBulkMark('PRESENT')}
                disabled={saving || totalCount === 0}
                className="px-3.5 py-2 rounded-2xl text-xs font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 active:scale-95 transition-all disabled:opacity-40 cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span>Mark All Present</span>
              </button>

              <button
                onClick={() => handleBulkMark('ABSENT')}
                disabled={saving || totalCount === 0}
                className="px-3.5 py-2 rounded-2xl text-xs font-black bg-rose-500/15 text-rose-400 border border-rose-500/30 hover:bg-rose-500/25 active:scale-95 transition-all disabled:opacity-40 cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <X className="w-3.5 h-3.5 text-rose-400" />
                <span>Mark All Absent</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── COMPACT MOBILE DATE STRIP (SPACE SAVING) ── */}
      <div
        className="block md:hidden p-2 rounded-2xl border shadow-xs space-y-2"
        style={{
          backgroundColor: 'var(--athlon-card)',
          borderColor: 'var(--athlon-border)',
        }}
      >
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleShiftDate(-1)}
              className="p-1.5 rounded-xl border text-foreground/70 active:scale-90"
              style={{
                backgroundColor: 'var(--athlon-surface)',
                borderColor: 'var(--athlon-border)',
              }}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <div
              className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border"
              style={{
                backgroundColor: 'var(--athlon-surface)',
                borderColor: 'var(--athlon-border)',
              }}
            >
              <CalendarIcon className="w-3 h-3 text-primary shrink-0" />
              <span className="text-[11px] font-black text-foreground font-mono">
                {formattedDate.day} {formattedDate.month} ({formattedDate.weekday})
              </span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
            </div>

            <button
              onClick={() => handleShiftDate(1)}
              className="p-1.5 rounded-xl border text-foreground/70 active:scale-90"
              style={{
                backgroundColor: 'var(--athlon-surface)',
                borderColor: 'var(--athlon-border)',
              }}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleSetToday}
            className={`px-2.5 py-1 rounded-xl text-[10px] font-black transition-all ${isToday
                ? 'bg-primary text-black font-extrabold'
                : 'border text-foreground/70'
              }`}
            style={{
              backgroundColor: !isToday ? 'var(--athlon-surface)' : undefined,
              borderColor: !isToday ? 'var(--athlon-border)' : undefined,
            }}
          >
            Today
          </button>
        </div>

        {canTakeAttendance && (
          <div className="flex items-center gap-1.5 pt-1 border-t border-foreground/5">
            <button
              onClick={() => handleBulkMark('PRESENT')}
              disabled={saving || totalCount === 0}
              className="flex-1 py-1.5 px-2 rounded-xl text-[10px] font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center gap-1 active:scale-95"
            >
              <Check className="w-3 h-3 stroke-[3]" /> All Present
            </button>
            <button
              onClick={() => handleBulkMark('ABSENT')}
              disabled={saving || totalCount === 0}
              className="flex-1 py-1.5 px-2 rounded-xl text-[10px] font-black bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center justify-center gap-1 active:scale-95"
            >
              <X className="w-3 h-3 stroke-[3]" /> All Absent
            </button>
          </div>
        )}
      </div>

      {/* ── DESKTOP BENTO HUD STATS (UNTOUCHED) ── */}
      <div className="hidden md:grid md:grid-cols-4 gap-4">
        {/* Total Roster */}
        <div
          className="p-5 rounded-3xl border shadow-sm space-y-2 relative overflow-hidden"
          style={{
            backgroundColor: 'var(--athlon-card)',
            borderColor: 'var(--athlon-border)',
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-black uppercase tracking-wider text-foreground/50">
              Total Roster
            </span>
            <div className="w-7 h-7 rounded-xl bg-foreground/5 border border-foreground/10 flex items-center justify-center text-foreground/60">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-3xl font-black text-foreground font-mono">{totalCount}</div>
          <div className="text-[11px] font-semibold text-foreground/40">Active Club Athletes</div>
        </div>

        {/* Present */}
        <div
          className="p-5 rounded-3xl border shadow-sm space-y-2 relative overflow-hidden border-emerald-500/30"
          style={{
            backgroundColor: 'var(--athlon-card)',
          }}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between relative z-10">
            <span className="text-[10.5px] font-black uppercase tracking-wider text-emerald-400">
              Present
            </span>
            <div className="w-7 h-7 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 relative z-10">
            <span className="text-3xl font-black text-emerald-400 font-mono">
              {presentCount}
            </span>
            <span className="text-xs font-bold text-emerald-400/80 font-mono">
              ({attendanceRate}%)
            </span>
          </div>
          <div className="w-full bg-foreground/10 h-1.5 rounded-full overflow-hidden relative z-10">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${attendanceRate}%` }}
            />
          </div>
        </div>

        {/* Absent */}
        <div
          className="p-5 rounded-3xl border shadow-sm space-y-2 relative overflow-hidden border-rose-500/30"
          style={{
            backgroundColor: 'var(--athlon-card)',
          }}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between relative z-10">
            <span className="text-[10.5px] font-black uppercase tracking-wider text-rose-400">
              Absent
            </span>
            <div className="w-7 h-7 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <X className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          </div>
          <div className="text-3xl font-black text-rose-400 font-mono relative z-10">
            {absentCount}
          </div>
          <div className="text-[11px] font-semibold text-rose-400/60 relative z-10">
            {totalCount > 0 ? `${Math.round((absentCount / totalCount) * 100)}% of roster` : '0%'}
          </div>
        </div>

        {/* Unmarked */}
        <div
          className="p-5 rounded-3xl border shadow-sm space-y-2 relative overflow-hidden"
          style={{
            backgroundColor: 'var(--athlon-card)',
            borderColor: 'var(--athlon-border)',
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-black uppercase tracking-wider text-foreground/50">
              Unmarked
            </span>
            <div className="w-7 h-7 rounded-xl bg-foreground/5 border border-foreground/10 flex items-center justify-center text-foreground/60">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-3xl font-black text-foreground/70 font-mono">
            {unmarkedCount}
          </div>
          <div className="text-[11px] font-semibold text-foreground/40">Pending Verification</div>
        </div>
      </div>

      {/* ── ULTRA-COMPACT MOBILE MINI STAT BAR (SPACE SAVING) ── */}
      <div
        className="grid grid-cols-4 gap-1.5 md:hidden p-2 rounded-2xl border"
        style={{
          backgroundColor: 'var(--athlon-card)',
          borderColor: 'var(--athlon-border)',
        }}
      >
        <div className="text-center p-1 rounded-xl bg-foreground/[0.03]">
          <div className="text-[9px] font-black uppercase tracking-tight text-foreground/45">Roster</div>
          <div className="text-sm font-black font-mono text-foreground leading-tight">{totalCount}</div>
        </div>
        <div className="text-center p-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <div className="text-[9px] font-black uppercase tracking-tight text-emerald-400">Present</div>
          <div className="text-sm font-black font-mono text-emerald-400 leading-tight">
            {presentCount} <span className="text-[9px] font-bold opacity-80">({attendanceRate}%)</span>
          </div>
        </div>
        <div className="text-center p-1 rounded-xl bg-rose-500/10 border border-rose-500/20">
          <div className="text-[9px] font-black uppercase tracking-tight text-rose-400">Absent</div>
          <div className="text-sm font-black font-mono text-rose-400 leading-tight">{absentCount}</div>
        </div>
        <div className="text-center p-1 rounded-xl bg-foreground/[0.03]">
          <div className="text-[9px] font-black uppercase tracking-tight text-foreground/45">Pending</div>
          <div className="text-sm font-black font-mono text-foreground/70 leading-tight">{unmarkedCount}</div>
        </div>
      </div>

      {/* ── DESKTOP VIP "YOUR DAILY ATTENDANCE" (UNTOUCHED) ── */}
      {myAttendanceRecord && (
        <div
          className="hidden md:block relative overflow-hidden rounded-[32px] border p-6 shadow-xl transition-all duration-300"
          style={{
            backgroundColor: 'var(--athlon-card)',
            borderColor: 'var(--athlon-border)',
          }}
        >
          <div
            className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-20"
            style={{
              backgroundColor:
                myAttendanceRecord.status === 'PRESENT'
                  ? '#10b981'
                  : myAttendanceRecord.status === 'ABSENT'
                    ? '#ef4444'
                    : 'var(--athlon-primary)',
            }}
          />

          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-13 h-13 rounded-2xl bg-primary/10 border border-primary/25 overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
                  {myAttendanceRecord.photo ? (
                    <img
                      src={UserService.getPhotoUrl(myAttendanceRecord.photo)}
                      alt={myAttendanceRecord.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-base font-black text-primary font-mono">
                      {myAttendanceRecord.fullName?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-black text-foreground tracking-tight truncate">
                      {myAttendanceRecord.fullName}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary text-black">
                      You
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-foreground/5 border border-foreground/10 text-foreground/70">
                      {myAttendanceRecord.role || role || 'Member'}
                    </span>
                  </div>
                  <p className="text-xs text-foreground/50 mt-0.5 font-medium">
                    {isToday
                      ? "Today's Attendance Check-in"
                      : `Attendance for ${formattedDate.full}`}
                  </p>
                </div>
              </div>

              <div>
                {myAttendanceRecord.status === 'PRESENT' ? (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/35 shadow-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Present</span>
                    {myAttendanceRecord.checkInTime && (
                      <span className="text-[11px] opacity-80 font-mono font-normal">
                        • {String(myAttendanceRecord.checkInTime).slice(0, 5)}
                      </span>
                    )}
                  </span>
                ) : myAttendanceRecord.status === 'ABSENT' ? (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-rose-500/15 text-rose-400 border border-rose-500/35 shadow-sm">
                    <X className="w-4 h-4 text-rose-400" />
                    <span>Absent</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-foreground/5 text-foreground/50 border border-foreground/10">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    <span>Not Marked</span>
                  </span>
                )}
              </div>
            </div>

            <div
              className="p-1.5 rounded-2xl border grid grid-cols-2 gap-2 shadow-inner"
              style={{
                backgroundColor: 'var(--athlon-surface)',
                borderColor: 'var(--athlon-border)',
              }}
            >
              <button
                type="button"
                onClick={() => handleStatusChange(myAttendanceRecord.organizationMemberUuid, 'PRESENT')}
                className={`py-2.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 ${myAttendanceRecord.status === 'PRESENT'
                    ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/30 scale-[1.01]'
                    : 'text-foreground/60 hover:text-emerald-400 hover:bg-emerald-500/10'
                  }`}
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Present</span>
              </button>

              <button
                type="button"
                onClick={() => handleStatusChange(myAttendanceRecord.organizationMemberUuid, 'ABSENT')}
                className={`py-2.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 ${myAttendanceRecord.status === 'ABSENT'
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30 scale-[1.01]'
                    : 'text-foreground/60 hover:text-rose-400 hover:bg-rose-500/10'
                  }`}
              >
                <X className="w-4 h-4 stroke-[3]" />
                <span>Absent</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── COMPACT MOBILE SELF CHECK-IN CARD (SPACE SAVING) ── */}
      {myAttendanceRecord && (
        <div
          className="block md:hidden p-3 rounded-2xl border shadow-sm transition-all"
          style={{
            backgroundColor: 'var(--athlon-card)',
            borderColor: myAttendanceRecord.status === 'PRESENT'
              ? 'rgba(16, 185, 129, 0.35)'
              : myAttendanceRecord.status === 'ABSENT'
                ? 'rgba(239, 68, 68, 0.35)'
                : 'var(--athlon-border)',
          }}
        >
          <div className="flex items-center justify-between gap-2.5">
            {/* Left: Avatar + Name + You tag */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/25 overflow-hidden flex items-center justify-center shrink-0">
                {myAttendanceRecord.photo ? (
                  <img
                    src={UserService.getPhotoUrl(myAttendanceRecord.photo)}
                    alt={myAttendanceRecord.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-black text-primary font-mono">
                    {myAttendanceRecord.fullName?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="text-xs font-black text-foreground truncate">
                    {myAttendanceRecord.fullName}
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-primary text-black">
                    You
                  </span>
                </div>
                <div className="text-[10px] text-foreground/50 font-semibold truncate">
                  {myAttendanceRecord.status === 'PRESENT' ? (
                    <span className="text-emerald-400 font-bold">● Checked In</span>
                  ) : myAttendanceRecord.status === 'ABSENT' ? (
                    <span className="text-rose-400 font-bold">● Marked Absent</span>
                  ) : (
                    <span>Tap to check-in</span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Quick Segmented Action Toggle */}
            <div
              className="flex items-center gap-1 p-0.5 rounded-xl border shrink-0"
              style={{
                backgroundColor: 'var(--athlon-surface)',
                borderColor: 'var(--athlon-border)',
              }}
            >
              <button
                type="button"
                onClick={() => handleStatusChange(myAttendanceRecord.organizationMemberUuid, 'PRESENT')}
                className={`py-1.5 px-2.5 rounded-lg text-[11px] font-black transition-all flex items-center gap-1 cursor-pointer active:scale-95 ${myAttendanceRecord.status === 'PRESENT'
                    ? 'bg-emerald-500 text-black shadow-xs'
                    : 'text-foreground/50 hover:text-emerald-400'
                  }`}
              >
                <Check className="w-3 h-3 stroke-[3]" />
                <span>Present</span>
              </button>

              <button
                type="button"
                onClick={() => handleStatusChange(myAttendanceRecord.organizationMemberUuid, 'ABSENT')}
                className={`py-1.5 px-2.5 rounded-lg text-[11px] font-black transition-all flex items-center gap-1 cursor-pointer active:scale-95 ${myAttendanceRecord.status === 'ABSENT'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'text-foreground/50 hover:text-rose-400'
                  }`}
              >
                <X className="w-3 h-3 stroke-[3]" />
                <span>Absent</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ATHLETE ROSTER DIRECTORY ── */}
      <div className="space-y-3 sm:space-y-4">
        {/* Search & Status Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
            <input
              type="text"
              placeholder="Search athletes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl pl-9 pr-3 py-2 text-xs sm:text-sm font-medium text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary border transition-all"
              style={{
                backgroundColor: 'var(--athlon-surface)',
                borderColor: 'var(--athlon-border)',
              }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Status Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 hide-scrollbar shrink-0">
            {(
              [
                { key: 'ALL', label: 'All', count: totalCount },
                { key: 'PRESENT', label: 'Present', count: presentCount },
                { key: 'ABSENT', label: 'Absent', count: absentCount },
                { key: 'UNMARKED', label: 'Pending', count: unmarkedCount },
              ] as const
            ).map((filter) => {
              const active = statusFilter === filter.key;
              return (
                <button
                  key={filter.key}
                  onClick={() => setStatusFilter(filter.key)}
                  className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-black tracking-tight transition-all shrink-0 flex items-center gap-1 cursor-pointer ${active
                      ? 'bg-primary text-black shadow-sm'
                      : 'border text-foreground/60 hover:text-foreground'
                    }`}
                  style={{
                    backgroundColor: !active ? 'var(--athlon-surface)' : undefined,
                    borderColor: !active ? 'var(--athlon-border)' : undefined,
                  }}
                >
                  <span>{filter.label}</span>
                  <span
                    className={`text-[9px] px-1 py-0.2 rounded-full font-mono font-bold ${active ? 'bg-black/20 text-black' : 'bg-foreground/10 text-foreground/60'
                      }`}
                  >
                    {filter.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Roster List or Empty State */}
        {loading ? (
          <div
            className="py-16 sm:py-20 flex flex-col items-center justify-center gap-2.5 rounded-3xl border shadow-sm"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <Loader2 className="w-7 h-7 text-primary animate-spin" />
            <p className="text-xs font-semibold text-foreground/50">Loading club attendance...</p>
          </div>
        ) : displayRoster.length === 0 ? (
          <div
            className="py-12 sm:py-16 px-4 sm:px-6 text-center space-y-2.5 rounded-3xl border shadow-sm"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <div className="w-12 h-12 rounded-2xl bg-foreground/5 border border-foreground/10 mx-auto flex items-center justify-center text-foreground/40">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-foreground">
                {searchTerm || statusFilter !== 'ALL'
                  ? 'No matching athletes found'
                  : myAttendanceRecord
                    ? 'No Other Club Athletes'
                    : 'No Club Athletes Found'}
              </h3>
              <p className="text-xs text-foreground/50 max-w-sm mx-auto mt-1">
                {searchTerm || statusFilter !== 'ALL'
                  ? 'Try clearing your search query or switching your status filter.'
                  : myAttendanceRecord
                    ? 'Your attendance is marked above. Other club athletes will appear here once added.'
                    : 'Add members in the Club Members tab to track daily team attendance.'}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* ── DESKTOP TABLE VIEW (UNTOUCHED) ── */}
            <div
              className="hidden md:block rounded-[28px] border overflow-hidden shadow-sm"
              style={{
                backgroundColor: 'var(--athlon-card)',
                borderColor: 'var(--athlon-border)',
              }}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-foreground/5 bg-foreground/[0.02]">
                      <th className="px-6 py-4 text-xs font-black text-foreground/50 uppercase tracking-widest">
                        Athlete
                      </th>
                      <th className="px-6 py-4 text-xs font-black text-foreground/50 uppercase tracking-widest">
                        Role
                      </th>
                      <th className="px-6 py-4 text-xs font-black text-foreground/50 uppercase tracking-widest text-center">
                        Attendance Status
                      </th>
                      <th className="px-6 py-4 text-xs font-black text-foreground/50 uppercase tracking-widest text-right">
                        Check-in Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-foreground/5">
                    {displayRoster.map((member) => {
                      const isPresent = member.status === 'PRESENT';
                      const isAbsent = member.status === 'ABSENT';
                      const canModify = canTakeAttendance;

                      return (
                        <tr
                          key={member.organizationMemberUuid}
                          className="hover:bg-foreground/[0.02] transition-colors group"
                        >
                          {/* Member Name + Photo */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3.5">
                              <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
                                {member.photo ? (
                                  <img
                                    src={UserService.getPhotoUrl(member.photo)}
                                    alt={member.fullName}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="text-xs font-black text-primary font-mono">
                                    {member.fullName?.charAt(0)?.toUpperCase() || 'A'}
                                  </span>
                                )}
                              </div>
                              <div>
                                <div className="font-black text-sm text-foreground">
                                  {member.fullName}
                                </div>
                                <div className="text-xs font-mono text-foreground/50 flex items-center gap-1.5 mt-0.5">
                                  <Phone className="w-3 h-3 text-primary/70" />
                                  <span>{member.phone ? `+91 ${member.phone}` : '-'}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Role */}
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-foreground/5 border border-foreground/10 text-foreground/70 inline-flex items-center gap-1">
                              {member.role === 'ADMIN' ? (
                                <Shield className="w-3 h-3 text-purple-400" />
                              ) : member.role === 'COACH' ? (
                                <Sparkles className="w-3 h-3 text-amber-400" />
                              ) : (
                                <User className="w-3 h-3 text-primary" />
                              )}
                              <span>{member.role || 'MEMBER'}</span>
                            </span>
                          </td>

                          {/* Status Action Buttons / Indicator */}
                          <td className="px-6 py-4">
                            {canModify ? (
                              <div
                                className="flex items-center justify-center gap-1.5 p-1 rounded-2xl border max-w-xs mx-auto shadow-inner"
                                style={{
                                  backgroundColor: 'var(--athlon-surface)',
                                  borderColor: 'var(--athlon-border)',
                                }}
                              >
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(member.organizationMemberUuid, 'PRESENT')}
                                  className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${isPresent
                                      ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/25 scale-[1.02]'
                                      : 'text-foreground/50 hover:text-emerald-400 hover:bg-emerald-500/10'
                                    }`}
                                >
                                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                  <span>Present</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(member.organizationMemberUuid, 'ABSENT')}
                                  className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${isAbsent
                                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25 scale-[1.02]'
                                      : 'text-foreground/50 hover:text-rose-400 hover:bg-rose-500/10'
                                    }`}
                                >
                                  <X className="w-3.5 h-3.5 stroke-[2.5]" />
                                  <span>Absent</span>
                                </button>
                              </div>
                            ) : (
                              <div className="flex justify-center">
                                <span
                                  className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5 ${isPresent
                                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                                      : isAbsent
                                        ? 'bg-rose-500/15 text-rose-400 border border-rose-500/25'
                                        : 'bg-foreground/5 text-foreground/40 border border-foreground/10'
                                    }`}
                                >
                                  {isPresent ? (
                                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                  ) : isAbsent ? (
                                    <X className="w-3.5 h-3.5 stroke-[2.5]" />
                                  ) : null}
                                  {member.status || 'UNMARKED'}
                                </span>
                              </div>
                            )}
                          </td>

                          {/* Check-in Time */}
                          <td className="px-6 py-4 text-right">
                            <span className="text-xs font-mono font-bold text-foreground/50">
                              {member.checkInTime ? String(member.checkInTime).slice(0, 5) : '-'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── ULTRA-COMPACT SLIM MOBILE ATHLETE ROWS (SPACE SAVING) ── */}
            <div className="block md:hidden space-y-2">
              {displayRoster.map((member) => {
                const isPresent = member.status === 'PRESENT';
                const isAbsent = member.status === 'ABSENT';
                const canModify = canTakeAttendance;

                return (
                  <div
                    key={member.organizationMemberUuid}
                    className="p-2.5 rounded-2xl border shadow-xs transition-all flex items-center justify-between gap-2.5"
                    style={{
                      backgroundColor: 'var(--athlon-card)',
                      borderColor: isPresent
                        ? 'rgba(16, 185, 129, 0.3)'
                        : isAbsent
                          ? 'rgba(239, 68, 68, 0.3)'
                          : 'var(--athlon-border)',
                    }}
                  >
                    {/* Left: Avatar + Athlete Name & Role */}
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 overflow-hidden flex items-center justify-center shrink-0 relative">
                        {member.photo ? (
                          <img
                            src={UserService.getPhotoUrl(member.photo)}
                            alt={member.fullName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-black text-primary font-mono">
                            {member.fullName?.charAt(0)?.toUpperCase() || 'M'}
                          </span>
                        )}
                        {isPresent && (
                          <span className="absolute bottom-0.5 right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-card" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-black text-foreground truncate">
                            {member.fullName}
                          </h4>
                          {member.phone && (
                            <a
                              href={`tel:${member.phone}`}
                              className="text-foreground/40 hover:text-primary active:scale-90 transition shrink-0"
                              title="Call Athlete"
                            >
                              <Phone className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>

                        <div className="flex items-center gap-1 text-[9.5px] font-semibold text-foreground/50 truncate">
                          <span className="uppercase">{member.role || 'MEMBER'}</span>
                          {member.checkInTime && (
                            <span className="text-emerald-400 font-mono font-bold">
                              • {String(member.checkInTime).slice(0, 5)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Quick Action Segmented Buttons */}
                    {canModify ? (
                      <div
                        className="flex items-center gap-1 p-0.5 rounded-xl border shrink-0"
                        style={{
                          backgroundColor: 'var(--athlon-surface)',
                          borderColor: 'var(--athlon-border)',
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => handleStatusChange(member.organizationMemberUuid, 'PRESENT')}
                          className={`py-1.5 px-2 rounded-lg text-[10.5px] font-black transition-all flex items-center gap-1 cursor-pointer active:scale-95 ${isPresent
                              ? 'bg-emerald-500 text-black shadow-xs'
                              : 'text-foreground/50 hover:text-emerald-400'
                            }`}
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>Present</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStatusChange(member.organizationMemberUuid, 'ABSENT')}
                          className={`py-1.5 px-2 rounded-lg text-[10.5px] font-black transition-all flex items-center gap-1 cursor-pointer active:scale-95 ${isAbsent
                              ? 'bg-rose-500 text-white shadow-xs'
                              : 'text-foreground/50 hover:text-rose-400'
                            }`}
                        >
                          <X className="w-3 h-3 stroke-[3]" />
                          <span>Absent</span>
                        </button>
                      </div>
                    ) : (
                      <div className="shrink-0">
                        <span
                          className={`px-2 py-0.5 rounded-lg text-[9.5px] font-black uppercase tracking-wider inline-flex items-center gap-1 ${isPresent
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                              : isAbsent
                                ? 'bg-rose-500/15 text-rose-400 border border-rose-500/25'
                                : 'bg-foreground/5 text-foreground/40 border border-foreground/10'
                            }`}
                        >
                          {isPresent ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : isAbsent ? <X className="w-2.5 h-2.5 stroke-[3]" /> : null}
                          {member.status || 'UNMARKED'}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}