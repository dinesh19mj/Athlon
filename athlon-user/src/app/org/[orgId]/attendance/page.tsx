'use client';

import { useState, useEffect } from 'react';
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
  ShieldAlert,
  Lock,
  Phone
} from 'lucide-react';
import { useOrgRole } from '@/hooks/use-org-role';
import { useAuthStore } from '@/lib/store/useAuthStore';
import AcademyAttendanceView from '@/components/academy/AcademyAttendanceView';

// Helper to get local date formatted as YYYY-MM-DD (avoiding UTC timezone shift)
const getLocalDateString = (d: Date = new Date()): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function AttendancePage() {
  const params = useParams();
  const orgIdParam = (params?.orgId as string) || '';
  const { getActiveOrganization, personalProfile } = useWorkspaceStore();
  const { userUuid: authUserUuid, userId: authUserId } = useAuthStore();
  const org = getActiveOrganization();

  const orgUuid = org?.id || orgIdParam;

  if (org?.type === 'ACADEMY') {
    return <AcademyAttendanceView orgUuid={orgUuid} orgName={org.name || 'Academy'} />;
  }
  const { role, isAdmin, isCoach, canManage } = useOrgRole(orgUuid);
  const canTakeAttendance = isAdmin || isCoach;

  const [selectedDate, setSelectedDate] = useState<string>(getLocalDateString());
  const [attendanceList, setAttendanceList] = useState<ClubMemberAttendance[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
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
        ClubAttendanceService.getSummary(orgUuid, date)
      ]);

      if (listRes.status === 'fulfilled') {
        const list = Array.isArray(listRes.value)
          ? listRes.value
          : ((listRes.value as any)?.data || []);
        setAttendanceList(list);
      } else {
        // Graceful fallback to club members list
        try {
          const members = await OrganizationService.getMembers(orgUuid);
          const memberList = Array.isArray(members) ? members : ((members as any)?.data || []);
          const fallbackAttendance: ClubMemberAttendance[] = memberList.map((m: OrganizationMemberResponse) => ({
            organizationMemberUuid: m.organizationMemberUuid,
            organizationMemberId: m.organizationMemberId,
            userUuid: m.userUuid,
            userId: m.userId,
            fullName: m.fullName,
            photo: m.photo,
            phone: m.phone,
            role: m.role,
            attendanceDate: date,
            status: 'UNMARKED'
          }));
          setAttendanceList(fallbackAttendance);
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
    setAttendanceList(prev =>
      prev.map(m => (m.organizationMemberUuid === memberUuid ? { ...m, status: newStatus } : m))
    );

    try {
      await ClubAttendanceService.markAttendance({
        organizationUuid: orgUuid,
        organizationMemberUuid: memberUuid,
        attendanceDate: selectedDate,
        status: newStatus
      });

      if (isSelfRecord) {
        setToastSuccess(
          newStatus === 'PRESENT'
            ? 'Checked in as Present!'
            : 'Marked as Absent.'
        );
      } else {
        setToastSuccess('Attendance updated successfully.');
      }
      setTimeout(() => setToastSuccess(null), 3000);

      // Reload summary in background
      ClubAttendanceService.getSummary(orgUuid, selectedDate)
        .then(res => {
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
    setAttendanceList(prev => prev.map(m => ({ ...m, status })));

    try {
      setSaving(true);
      await ClubAttendanceService.bulkMarkAttendance({
        organizationUuid: orgUuid,
        attendanceDate: selectedDate,
        records: attendanceList.map(m => ({
          organizationMemberUuid: m.organizationMemberUuid,
          status
        }))
      });

      setToastSuccess(`All members marked as ${status.toLowerCase()}!`);
      setTimeout(() => setToastSuccess(null), 3000);
      loadAttendanceData(selectedDate);
    } catch (err: any) {
      console.error('Bulk mark failed:', err);
      setErrorMessage('Failed to bulk mark attendance.');
    } finally {
      setSaving(false);
    }
  };

  const filteredMembers = attendanceList.filter(m =>
    (m.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.phone || '').includes(searchTerm)
  );

  // If user is a member with their top check-in card active, exclude self from lower roster to avoid duplicates
  const displayRoster = !canTakeAttendance && myAttendanceRecord
    ? filteredMembers.filter(m => !isMemberSelf(m))
    : filteredMembers;

  const presentCount = attendanceList.filter(m => m.status === 'PRESENT').length;
  const absentCount = attendanceList.filter(m => m.status === 'ABSENT').length;
  const unmarkedCount = attendanceList.filter(m => m.status === 'UNMARKED').length;
  const totalCount = attendanceList.length;
  const attendanceRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Toast Notification */}
      {toastSuccess && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-md animate-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-bold">{toastSuccess}</span>
        </div>
      )}

      {/* ── HEADER SECTION (DESKTOP) ── */}
      <div className="hidden md:flex md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h2 className="text-3xl font-extrabold text-foreground tracking-tight">Club Attendance</h2>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-primary/15 text-primary border border-primary/25">
              {totalCount} {totalCount === 1 ? 'Member' : 'Members'}
            </span>
          </div>
          <p className="text-foreground/50 font-medium text-sm">
            Keep track of daily check-ins and attendance records for {org?.name || 'your club'}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface border border-foreground/10 text-sm font-bold text-foreground hover:bg-foreground/5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
          </button>
          {!canTakeAttendance && (
            <span className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-foreground/5 border border-foreground/10 text-xs font-bold text-foreground/70">
              <User className="w-3.5 h-3.5 text-primary" /> Member Mode
            </span>
          )}
        </div>
      </div>

      {/* ── HEADER SECTION (MOBILE APP-LIKE COMPACT BAR) ── */}
      <div className="flex md:hidden flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-foreground tracking-tight">Club Attendance</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-primary/15 text-primary border border-primary/25 shrink-0">
                {totalCount} {totalCount === 1 ? 'Member' : 'Members'}
              </span>
            </div>
            <p className="text-xs text-foreground/50 mt-0.5 truncate">
              {org?.name || 'Club Roster'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 rounded-xl bg-surface border border-foreground/10 text-foreground active:scale-95 transition"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-primary' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* ── DATE NAVIGATION & CALENDAR BAR ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface border border-foreground/10 rounded-2xl p-3 sm:p-4 shadow-sm">
        {/* Day Shifter & Date Picker */}
        <div className="flex items-center justify-between sm:justify-start gap-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleShiftDate(-1)}
              className="p-2 rounded-xl bg-background border border-foreground/10 hover:bg-foreground/5 text-foreground/70 hover:text-foreground transition-colors active:scale-90"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Calendar Date Input Picker */}
            <div className="relative flex items-center bg-background border border-foreground/10 rounded-xl px-3 py-1.5 text-xs font-bold text-foreground hover:border-primary/40 transition-colors shadow-inner">
              <CalendarIcon className="w-3.5 h-3.5 text-primary shrink-0 mr-1.5" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-xs font-bold text-foreground focus:outline-none cursor-pointer"
              />
            </div>

            <button
              onClick={() => handleShiftDate(1)}
              className="p-2 rounded-xl bg-background border border-foreground/10 hover:bg-foreground/5 text-foreground/70 hover:text-foreground transition-colors active:scale-90"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {selectedDate && (
            <span className="text-[11px] font-bold text-foreground/60">
              {new Date(`${selectedDate}T00:00:00`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
            </span>
          )}
        </div>

        {/* Quick Date Buttons & Bulk Actions */}
        <div className="flex items-center justify-between sm:justify-end gap-2 pt-1 sm:pt-0 border-t sm:border-t-0 border-foreground/5 flex-wrap">
          <button
            onClick={handleSetToday}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${selectedDate === getLocalDateString()
                ? 'bg-primary text-black shadow-md shadow-primary/20'
                : 'bg-background/80 text-foreground/70 hover:text-foreground border border-foreground/10'
              }`}
          >
            Today
          </button>

          {canTakeAttendance && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleBulkMark('PRESENT')}
                disabled={saving || totalCount === 0}
                className="px-2.5 py-1.5 rounded-xl text-[11px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 active:scale-95 transition-all disabled:opacity-40"
              >
                Mark All Present
              </button>

              <button
                onClick={() => handleBulkMark('ABSENT')}
                disabled={saving || totalCount === 0}
                className="px-2.5 py-1.5 rounded-xl text-[11px] font-black bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 active:scale-95 transition-all disabled:opacity-40"
              >
                Mark All Absent
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── ATTENDANCE STATS CARDS ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Total Members */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-surface border border-foreground/5 space-y-1 shadow-sm">
          <div className="text-[10px] font-black uppercase tracking-wider text-foreground/40">Total Roster</div>
          <div className="text-xl sm:text-2xl font-black text-foreground">{totalCount}</div>
        </div>

        {/* Present */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1 shadow-sm">
          <div className="text-[10px] font-black uppercase tracking-wider text-emerald-400">Present</div>
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-xl sm:text-2xl font-black text-emerald-400">{presentCount}</span>
            <span className="text-[11px] sm:text-xs font-bold text-emerald-400/70">({attendanceRate}%)</span>
          </div>
        </div>

        {/* Absent */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-red-500/10 border border-red-500/20 space-y-1 shadow-sm">
          <div className="text-[10px] font-black uppercase tracking-wider text-red-400">Absent</div>
          <div className="text-xl sm:text-2xl font-black text-red-400">{absentCount}</div>
        </div>

        {/* Unmarked */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-foreground/5 border border-foreground/10 space-y-1 shadow-sm">
          <div className="text-[10px] font-black uppercase tracking-wider text-foreground/40">Unmarked</div>
          <div className="text-xl sm:text-2xl font-black text-foreground/60">{unmarkedCount}</div>
        </div>
      </div>

      {/* ─── Modern My Attendance Check-In Deck (Member View) ─── */}
      {myAttendanceRecord && (
        <div className="relative overflow-hidden rounded-[26px] bg-surface/90 border border-white/10 p-4 sm:p-6 shadow-xl backdrop-blur-2xl transition-all duration-300">
          <div
            className="absolute inset-0 pointer-events-none opacity-40 transition-opacity duration-300"
            style={{
              background:
                myAttendanceRecord.status === 'PRESENT'
                  ? 'radial-gradient(circle at 10% 20%, rgba(16,185,129,0.12), transparent 70%)'
                  : myAttendanceRecord.status === 'ABSENT'
                  ? 'radial-gradient(circle at 90% 20%, rgba(239,68,68,0.12), transparent 70%)'
                  : 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.03), transparent 70%)',
            }}
          />

          <div className="relative z-10 space-y-3.5">
            {/* Top Row: User Identity & Live Status Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
                  {myAttendanceRecord.photo ? (
                    <img
                      src={UserService.getPhotoUrl(myAttendanceRecord.photo)}
                      alt={myAttendanceRecord.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-black text-primary">
                      {myAttendanceRecord.fullName?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm sm:text-base font-black text-foreground tracking-tight truncate">
                      {myAttendanceRecord.fullName}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[9.5px] font-black uppercase tracking-wider bg-primary/15 text-primary border border-primary/30">
                      You
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[9.5px] font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-white/50">
                      {myAttendanceRecord.role || role || 'Member'}
                    </span>
                  </div>
                  <p className="text-[11px] text-foreground/45 mt-0.5 font-medium">
                    {selectedDate === getLocalDateString()
                      ? "Today's Attendance Check-in"
                      : `Attendance for ${new Date(`${selectedDate}T00:00:00`).toLocaleDateString('en-GB', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                        })}`}
                  </p>
                </div>
              </div>

              {/* Status Capsule Indicator */}
              <div className="self-start sm:self-auto flex items-center">
                {myAttendanceRecord.status === 'PRESENT' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Present</span>
                    {myAttendanceRecord.checkInTime && (
                      <span className="text-[10.5px] opacity-70 font-mono font-normal">
                        • {String(myAttendanceRecord.checkInTime).slice(0, 5)}
                      </span>
                    )}
                  </span>
                ) : myAttendanceRecord.status === 'ABSENT' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-red-500/15 text-red-400 border border-red-500/30 shadow-[0_0_12px_rgba(239,68,68,0.2)]">
                    <X className="w-3.5 h-3.5" />
                    <span>Absent</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/5 text-white/50 border border-white/10">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
                    <span>Not Marked</span>
                  </span>
                )}
              </div>
            </div>

            {/* Bottom Row: Tactile Dual Segmented Switch Bar */}
            <div className="bg-background/90 p-1.5 rounded-2xl border border-white/10 shadow-inner grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleStatusChange(myAttendanceRecord.organizationMemberUuid, 'PRESENT')}
                className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 ${
                  myAttendanceRecord.status === 'PRESENT'
                    ? 'bg-emerald-500 text-black shadow-[0_4px_16px_rgba(16,185,129,0.35)] scale-[1.01]'
                    : 'text-foreground/50 hover:text-emerald-400 hover:bg-emerald-500/10'
                }`}
              >
                <Check className="w-3.5 h-3.5" strokeWidth={2.8} />
                <span>Present</span>
              </button>

              <button
                type="button"
                onClick={() => handleStatusChange(myAttendanceRecord.organizationMemberUuid, 'ABSENT')}
                className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 ${
                  myAttendanceRecord.status === 'ABSENT'
                    ? 'bg-red-500 text-white shadow-[0_4px_16px_rgba(239,68,68,0.35)] scale-[1.01]'
                    : 'text-foreground/50 hover:text-red-400 hover:bg-red-500/10'
                }`}
              >
                <X className="w-3.5 h-3.5" strokeWidth={2.8} />
                <span>Absent</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MEMBER ATTENDANCE ROSTER CONTAINER ── */}
      <div>
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 bg-surface border border-foreground/5 rounded-3xl">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-xs font-semibold text-foreground/50">Loading club attendance...</p>
          </div>
        ) : displayRoster.length === 0 ? (
          <div className="py-16 px-6 text-center space-y-3 bg-surface border border-foreground/5 rounded-3xl">
            <div className="w-14 h-14 rounded-2xl bg-foreground/5 border border-foreground/10 mx-auto flex items-center justify-center text-foreground/40">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                {!canTakeAttendance && myAttendanceRecord ? 'No Other Club Members' : 'No Club Members Found'}
              </h3>
              <p className="text-xs text-foreground/50 max-w-sm mx-auto mt-1">
                {!canTakeAttendance && myAttendanceRecord
                  ? 'Your attendance check-in is ready above. Other athletes will appear here once they join.'
                  : 'Please add athletes in the Members tab first to track their daily attendance.'}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Table Roster (Untouched) */}
            <div className="hidden md:block bg-surface border border-foreground/5 rounded-[24px] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-foreground/5 bg-foreground/[0.02]">
                      <th className="px-6 py-4 text-xs font-black text-foreground/50 uppercase tracking-widest">Athlete</th>
                      <th className="px-6 py-4 text-xs font-black text-foreground/50 uppercase tracking-widest">Role &amp; Contact</th>
                      <th className="px-6 py-4 text-xs font-black text-foreground/50 uppercase tracking-widest text-center">Attendance Status</th>
                      <th className="px-6 py-4 text-xs font-black text-foreground/50 uppercase tracking-widest text-right">Check-in Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-foreground/5">
                    {displayRoster.map((member) => {
                      const isPresent = member.status === 'PRESENT';
                      const isAbsent = member.status === 'ABSENT';
                      const canModify = canTakeAttendance;

                      return (
                        <tr key={member.organizationMemberUuid} className="hover:bg-foreground/[0.02] transition-colors group">
                          {/* Member Name + Photo */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-foreground/10 border border-foreground/10 overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
                                {member.photo ? (
                                  <img
                                    src={UserService.getPhotoUrl(member.photo)}
                                    alt={member.fullName}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="text-xs font-black text-primary">
                                    {member.fullName?.charAt(0)?.toUpperCase() || 'A'}
                                  </span>
                                )}
                              </div>
                              <div>
                                <div className="font-extrabold text-sm text-foreground">
                                  {member.fullName}
                                </div>
                                <div className="text-[11px] font-mono text-foreground/40">{member.phone ? `+91 ${member.phone}` : 'No phone'}</div>
                              </div>
                            </div>
                          </td>

                          {/* Role */}
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-foreground/5 border border-foreground/10 text-foreground/70">
                              {member.role || 'MEMBER'}
                            </span>
                          </td>

                          {/* Status Toggle Buttons or Read-Only Indicator */}
                          <td className="px-6 py-4">
                            {canModify ? (
                              <div className="flex items-center justify-center gap-1.5 bg-background p-1 rounded-2xl border max-w-xs mx-auto shadow-inner" style={{ borderColor: 'var(--athlon-border)' }}>
                                {/* PRESENT */}
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(member.organizationMemberUuid, 'PRESENT')}
                                  className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${isPresent
                                      ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/25 scale-[1.02]'
                                      : 'text-foreground/50 hover:text-emerald-400 hover:bg-emerald-500/10'
                                    }`}
                                >
                                  <Check className="w-3.5 h-3.5" /> Present
                                </button>

                                {/* ABSENT */}
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(member.organizationMemberUuid, 'ABSENT')}
                                  className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${isAbsent
                                      ? 'bg-red-500 text-white shadow-md shadow-red-500/25 scale-[1.02]'
                                      : 'text-foreground/50 hover:text-red-400 hover:bg-red-500/10'
                                    }`}
                                >
                                  <X className="w-3.5 h-3.5" /> Absent
                                </button>
                              </div>
                            ) : (
                              <div className="flex justify-center">
                                <span className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5 ${isPresent
                                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                                    : isAbsent
                                      ? 'bg-red-500/15 text-red-400 border border-red-500/25'
                                      : 'bg-foreground/5 text-foreground/40 border border-foreground/10'
                                  }`}>
                                  {isPresent ? <Check className="w-3.5 h-3.5" /> : isAbsent ? <X className="w-3.5 h-3.5" /> : null}
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

            {/* ── MOBILE VIEW: ULTRA-STYLISH APP-LIKE ROSTER CARDS ── */}
            <div className="block md:hidden space-y-3">
              {displayRoster.map((member) => {
                const isPresent = member.status === 'PRESENT';
                const isAbsent = member.status === 'ABSENT';
                const canModify = canTakeAttendance;

                return (
                  <div
                    key={member.organizationMemberUuid}
                    className="p-3.5 rounded-2xl border border-border bg-card shadow-sm space-y-3 transition-all hover:border-primary/40"
                  >
                    {/* Top Row: Avatar + Name + Role + Check-in Time */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-2xl bg-surface border border-border overflow-hidden flex items-center justify-center shrink-0 shadow-sm relative">
                          {member.photo ? (
                            <img
                              src={UserService.getPhotoUrl(member.photo)}
                              alt={member.fullName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-xs font-black text-primary">
                              {member.fullName?.charAt(0)?.toUpperCase() || 'M'}
                            </span>
                          )}
                          {isPresent && (
                            <span className="absolute bottom-0.5 right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-card" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <h4 className="text-sm font-black text-foreground leading-tight truncate">
                            {member.fullName}
                          </h4>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-foreground/5 border border-foreground/10 text-foreground/60">
                              {member.role || 'MEMBER'}
                            </span>
                            {member.checkInTime && (
                              <span className="text-[10px] font-mono text-emerald-400 font-bold">
                                • {String(member.checkInTime).slice(0, 5)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {member.phone && (
                        <a
                          href={`tel:${member.phone}`}
                          className="p-2 rounded-xl bg-surface hover:bg-surface-hover border border-border text-primary active:scale-90 transition shrink-0"
                          title="Call Athlete"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>

                    {/* Status Toggle Switch Bar */}
                    {canModify ? (
                      <div className="grid grid-cols-2 gap-1.5 bg-surface p-1 rounded-xl border border-border">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(member.organizationMemberUuid, 'PRESENT')}
                          className={`py-2 px-3 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
                            isPresent
                              ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/25 font-black scale-[1.01]'
                              : 'text-foreground/50 hover:text-emerald-400 hover:bg-emerald-500/10'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                          <span>Present</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStatusChange(member.organizationMemberUuid, 'ABSENT')}
                          className={`py-2 px-3 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
                            isAbsent
                              ? 'bg-red-500 text-white shadow-md shadow-red-500/25 font-black scale-[1.01]'
                              : 'text-foreground/50 hover:text-red-400 hover:bg-red-500/10'
                          }`}
                        >
                          <X className="w-3.5 h-3.5" strokeWidth={2.5} />
                          <span>Absent</span>
                        </button>
                      </div>
                    ) : (
                      <div className="pt-1 flex items-center justify-between border-t border-border">
                        <span className="text-[11px] font-bold text-foreground/40">Status</span>
                        <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 ${
                          isPresent
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                            : isAbsent
                            ? 'bg-red-500/15 text-red-400 border border-red-500/25'
                            : 'bg-foreground/5 text-foreground/40 border border-foreground/10'
                        }`}>
                          {isPresent ? <Check className="w-3 h-3" /> : isAbsent ? <X className="w-3 h-3" /> : null}
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