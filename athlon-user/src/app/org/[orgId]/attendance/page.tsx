'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { ClubAttendanceService, ClubMemberAttendance, AttendanceSummary } from '@/lib/api/clubAttendance';
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
  Save
} from 'lucide-react';

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
  const { getActiveOrganization } = useWorkspaceStore();
  const org = getActiveOrganization();

  const orgUuid = org?.id || orgIdParam;

  const [selectedDate, setSelectedDate] = useState<string>(getLocalDateString());
  const [attendanceList, setAttendanceList] = useState<ClubMemberAttendance[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [toastSuccess, setToastSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
        console.error('Failed to load daily attendance:', listRes.reason);
      }

      if (summaryRes.status === 'fulfilled') {
        const sumData = (summaryRes.value as any)?.data || summaryRes.value;
        setSummary(sumData);
      }
    } catch (err: any) {
      console.error('Error loading attendance:', err);
      setErrorMessage('Failed to load attendance records.');
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
  const handleStatusChange = async (memberUuid: string, newStatus: 'PRESENT' | 'ABSENT' | 'LEAVE') => {
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

      // Reload summary in background
      ClubAttendanceService.getSummary(orgUuid, selectedDate).then(res => {
        const sumData = (res as any)?.data || res;
        setSummary(sumData);
      });
    } catch (err: any) {
      console.error('Failed to update attendance:', err);
      setToastSuccess('Failed to save status update.');
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

  // Save full sheet
  const handleSaveSheet = async () => {
    try {
      setSaving(true);
      await ClubAttendanceService.bulkMarkAttendance({
        organizationUuid: orgUuid,
        attendanceDate: selectedDate,
        records: attendanceList
          .filter(m => m.status !== 'UNMARKED')
          .map(m => ({
            organizationMemberUuid: m.organizationMemberUuid,
            status: m.status as 'PRESENT' | 'ABSENT' | 'LEAVE',
            notes: m.notes
          }))
      });

      setToastSuccess('Attendance records saved successfully!');
      setTimeout(() => setToastSuccess(null), 3000);
      loadAttendanceData(selectedDate);
    } catch (err: any) {
      console.error('Save sheet failed:', err);
      setErrorMessage('Failed to save attendance sheet.');
    } finally {
      setSaving(false);
    }
  };

  const filteredMembers = attendanceList.filter(m =>
    (m.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.phone || '').includes(searchTerm)
  );

  const presentCount = attendanceList.filter(m => m.status === 'PRESENT').length;
  const absentCount = attendanceList.filter(m => m.status === 'ABSENT').length;
  const leaveCount = attendanceList.filter(m => m.status === 'LEAVE').length;
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

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
          <button
            onClick={handleSaveSheet}
            disabled={saving || totalCount === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-black text-sm font-black tracking-wide hover:opacity-90 transition-all shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Sheet
          </button>
        </div>
      </div>

      {/* Date Navigation & Calendar Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5 bg-surface border border-foreground/5 rounded-2xl p-3.5 sm:p-4 shadow-sm">
        {/* Left Side: Day Shifter & Date Picker */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleShiftDate(-1)}
            className="p-2 rounded-xl bg-background border border-foreground/10 hover:bg-foreground/5 text-foreground/70 hover:text-foreground transition-colors"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Calendar Date Input Picker */}
          <div className="relative flex items-center bg-background border border-foreground/10 rounded-xl px-3 py-2 text-xs font-bold text-foreground hover:border-primary/40 transition-colors shadow-inner">
            <CalendarIcon className="w-4 h-4 text-primary shrink-0 mr-2" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs font-bold text-foreground focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={() => handleShiftDate(1)}
            className="p-2 rounded-xl bg-background border border-foreground/10 hover:bg-foreground/5 text-foreground/70 hover:text-foreground transition-colors"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {selectedDate && (
            <span className="hidden md:inline-block text-xs font-bold text-foreground/60 ml-2">
              {new Date(`${selectedDate}T00:00:00`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          )}
        </div>

        {/* Right Side: Quick Date Buttons & Actions */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={handleSetToday}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              selectedDate === getLocalDateString()
                ? 'bg-primary text-black shadow-md shadow-primary/20'
                : 'bg-background/80 text-foreground/70 hover:text-foreground border border-foreground/10'
            }`}
          >
            Today
          </button>

          <button
            onClick={() => handleBulkMark('PRESENT')}
            disabled={saving || totalCount === 0}
            className="px-3 py-1.5 rounded-xl text-xs font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all disabled:opacity-40"
          >
            Mark All Present
          </button>

          <button
            onClick={() => handleBulkMark('ABSENT')}
            disabled={saving || totalCount === 0}
            className="px-3 py-1.5 rounded-xl text-xs font-black bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all disabled:opacity-40"
          >
            Mark All Absent
          </button>
        </div>
      </div>

      {/* Attendance Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        {/* Total Members */}
        <div className="p-4 rounded-2xl bg-surface border border-foreground/5 space-y-1 shadow-sm">
          <div className="text-[10px] font-black uppercase tracking-wider text-foreground/40">Total Roster</div>
          <div className="text-2xl font-black text-foreground">{totalCount}</div>
        </div>

        {/* Present */}
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1 shadow-sm">
          <div className="text-[10px] font-black uppercase tracking-wider text-emerald-400">Present</div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-400">{presentCount}</span>
            <span className="text-xs font-bold text-emerald-400/70">({attendanceRate}%)</span>
          </div>
        </div>

        {/* Absent */}
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 space-y-1 shadow-sm">
          <div className="text-[10px] font-black uppercase tracking-wider text-red-400">Absent</div>
          <div className="text-2xl font-black text-red-400">{absentCount}</div>
        </div>

        {/* Leave */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1 shadow-sm">
          <div className="text-[10px] font-black uppercase tracking-wider text-amber-400">On Leave</div>
          <div className="text-2xl font-black text-amber-400">{leaveCount}</div>
        </div>

        {/* Unmarked */}
        <div className="p-4 rounded-2xl bg-foreground/5 border border-foreground/10 space-y-1 shadow-sm col-span-2 md:col-span-1">
          <div className="text-[10px] font-black uppercase tracking-wider text-foreground/40">Unmarked</div>
          <div className="text-2xl font-black text-foreground/60">{unmarkedCount}</div>
        </div>
      </div>

      {/* Member Attendance Roster Container */}
      <div className="bg-surface border border-foreground/5 rounded-[24px] overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm font-semibold text-foreground/50">Loading club attendance...</p>
          </div>
        ) : totalCount === 0 ? (
          <div className="py-20 px-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-foreground/5 border border-foreground/10 mx-auto flex items-center justify-center text-foreground/40">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">No Club Members Found</h3>
              <p className="text-sm text-foreground/50 max-w-md mx-auto mt-1">
                Please add athletes in the <strong>Members</strong> tab first to track their daily attendance.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Table Roster */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-foreground/5 bg-foreground/[0.02]">
                    <th className="px-6 py-4 text-xs font-black text-foreground/50 uppercase tracking-widest">Athlete</th>
                    <th className="px-6 py-4 text-xs font-black text-foreground/50 uppercase tracking-widest">Role & Contact</th>
                    <th className="px-6 py-4 text-xs font-black text-foreground/50 uppercase tracking-widest text-center">Attendance Status</th>
                    <th className="px-6 py-4 text-xs font-black text-foreground/50 uppercase tracking-widest text-right">Check-in Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-foreground/5">
                  {filteredMembers.map((member) => {
                    const isPresent = member.status === 'PRESENT';
                    const isAbsent = member.status === 'ABSENT';
                    const isLeave = member.status === 'LEAVE';

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
                              <div className="font-extrabold text-sm text-foreground">{member.fullName}</div>
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

                        {/* Status Toggle Buttons */}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-1 bg-background p-1 rounded-2xl border max-w-xs mx-auto shadow-inner" style={{ borderColor: 'var(--athlon-border)' }}>
                            {/* PRESENT */}
                            <button
                              type="button"
                              onClick={() => handleStatusChange(member.organizationMemberUuid, 'PRESENT')}
                              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                                isPresent
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
                              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                                isAbsent
                                  ? 'bg-red-500 text-white shadow-md shadow-red-500/25 scale-[1.02]'
                                  : 'text-foreground/50 hover:text-red-400 hover:bg-red-500/10'
                              }`}
                            >
                              <X className="w-3.5 h-3.5" /> Absent
                            </button>

                            {/* LEAVE */}
                            <button
                              type="button"
                              onClick={() => handleStatusChange(member.organizationMemberUuid, 'LEAVE')}
                              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                                isLeave
                                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/25 scale-[1.02]'
                                  : 'text-foreground/50 hover:text-amber-400 hover:bg-amber-500/10'
                              }`}
                            >
                              <Clock className="w-3.5 h-3.5" /> Leave
                            </button>
                          </div>
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

            {/* Mobile Roster Cards */}
            <div className="block md:hidden divide-y divide-foreground/5">
              {filteredMembers.map((member) => {
                const isPresent = member.status === 'PRESENT';
                const isAbsent = member.status === 'ABSENT';
                const isLeave = member.status === 'LEAVE';

                return (
                  <div key={member.organizationMemberUuid} className="p-4 space-y-3 hover:bg-foreground/[0.02] transition-colors">
                    {/* Athlete Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-foreground/10 border border-foreground/10 overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
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
                          <div className="font-extrabold text-sm text-foreground">{member.fullName}</div>
                          <div className="text-[11px] font-mono text-foreground/40">{member.phone ? `+91 ${member.phone}` : 'No phone'}</div>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-foreground/5 border border-foreground/10 text-foreground/60">
                        {member.role || 'MEMBER'}
                      </span>
                    </div>

                    {/* Segmented Status Toggle Bar */}
                    <div className="grid grid-cols-3 gap-1.5 bg-background p-1.5 rounded-2xl border shadow-inner" style={{ borderColor: 'var(--athlon-border)' }}>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(member.organizationMemberUuid, 'PRESENT')}
                        className={`py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                          isPresent
                            ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/25'
                            : 'text-foreground/50 hover:bg-emerald-500/10'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" /> Present
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStatusChange(member.organizationMemberUuid, 'ABSENT')}
                        className={`py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                          isAbsent
                            ? 'bg-red-500 text-white shadow-md shadow-red-500/25'
                            : 'text-foreground/50 hover:bg-red-500/10'
                        }`}
                      >
                        <X className="w-3.5 h-3.5" /> Absent
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStatusChange(member.organizationMemberUuid, 'LEAVE')}
                        className={`py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                          isLeave
                            ? 'bg-amber-500 text-black shadow-md shadow-amber-500/25'
                            : 'text-foreground/50 hover:bg-amber-500/10'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" /> Leave
                      </button>
                    </div>
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