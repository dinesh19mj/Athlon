import { api } from './client';

export interface ClubMemberAttendance {
  organizationMemberUuid: string;
  organizationMemberId?: number;
  userUuid?: string;
  userId?: number;
  fullName: string;
  photo?: string;
  phone?: string;
  role?: string;
  attendanceUuid?: string;
  attendanceDate: string;
  status: 'PRESENT' | 'ABSENT' | 'LEAVE' | 'UNMARKED';
  checkInTime?: string;
  notes?: string;
  updatedAt?: string;
}

export interface AttendanceSummary {
  date: string;
  totalMembers: number;
  presentCount: number;
  absentCount: number;
  leaveCount: number;
  unmarkedCount: number;
  attendancePercentage: number;
}

export interface MarkAttendancePayload {
  organizationUuid: string;
  organizationMemberUuid: string;
  attendanceDate: string;
  status: 'PRESENT' | 'ABSENT' | 'LEAVE';
  checkInTime?: string;
  notes?: string;
}

export interface BulkAttendancePayload {
  organizationUuid: string;
  attendanceDate: string;
  records: Array<{
    organizationMemberUuid: string;
    status: 'PRESENT' | 'ABSENT' | 'LEAVE';
    notes?: string;
  }>;
}

export const ClubAttendanceService = {
  getDailyAttendance: (orgUuid: string, date: string) =>
    api.get<ClubMemberAttendance[]>(`/api/identity/club/attendance/org/${orgUuid}?date=${date}`),

  markAttendance: (payload: MarkAttendancePayload) =>
    api.post<ClubMemberAttendance>('/api/identity/club/attendance/mark', payload),

  bulkMarkAttendance: (payload: BulkAttendancePayload) =>
    api.post<ClubMemberAttendance[]>('/api/identity/club/attendance/bulk', payload),

  getSummary: (orgUuid: string, date: string) =>
    api.get<AttendanceSummary>(`/api/identity/club/attendance/summary/org/${orgUuid}?date=${date}`),
};
