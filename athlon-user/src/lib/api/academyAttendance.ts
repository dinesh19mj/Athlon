import { api } from './client';
import { ApiResponse } from './user';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
export type AttendeeType = 'STUDENT' | 'COACH' | 'STAFF' | string;

export interface AcademyAttendanceRecord {
  attendanceUuid: string;
  attendanceId?: number;
  organizationUuid: string;
  organizationId?: number;
  attendeeType: AttendeeType;
  attendeeUuid: string;
  attendeeName?: string;
  attendeePhoto?: string;
  attendeePhone?: string;
  batchUuid?: string;
  batchName?: string;
  centreUuid?: string;
  centreName?: string;
  attendanceDate: string; // YYYY-MM-DD
  status: AttendanceStatus;
  checkInTime?: string;
  checkOutTime?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MarkAcademyAttendancePayload {
  organizationUuid: string;
  attendeeType: AttendeeType;
  attendeeUuid: string;
  attendeeName?: string;
  batchUuid?: string;
  batchName?: string;
  centreUuid?: string;
  attendanceDate: string; // YYYY-MM-DD
  status: AttendanceStatus;
  checkInTime?: string;
  notes?: string;
}

export interface BulkAcademyAttendancePayload {
  organizationUuid: string;
  records: MarkAcademyAttendancePayload[];
}

export interface AcademyAttendanceSummary {
  organizationUuid: string;
  attendanceDate: string;
  totalHeadcount: number;
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
  totalExcused: number;
  overallPercentage: number;
  studentsTotal: number;
  studentsPresent: number;
  studentsAbsent: number;
  studentsPercentage: number;
  coachesTotal: number;
  coachesPresent: number;
  coachesAbsent: number;
  coachesPercentage: number;
  staffTotal: number;
  staffPresent: number;
  staffAbsent: number;
  staffPercentage: number;
}

export const AcademyAttendanceService = {
  // Get daily attendance for an organization with optional filters
  getDailyAttendance: (
    orgUuid: string,
    date: string,
    type?: string,
    batchUuid?: string
  ) => {
    let url = `/api/identity/academy/attendance/org/${orgUuid}?date=${encodeURIComponent(date)}`;
    if (type && type !== 'ALL') url += `&type=${encodeURIComponent(type)}`;
    if (batchUuid && batchUuid !== 'ALL') url += `&batchUuid=${encodeURIComponent(batchUuid)}`;
    return api.get<ApiResponse<AcademyAttendanceRecord[]>>(url);
  },

  // Get aggregated attendance summary
  getSummary: (orgUuid: string, date: string) => {
    return api.get<ApiResponse<AcademyAttendanceSummary>>(
      `/api/identity/academy/attendance/summary/org/${orgUuid}?date=${encodeURIComponent(date)}`
    );
  },

  // Mark single attendance
  markAttendance: (payload: MarkAcademyAttendancePayload) => {
    return api.post<ApiResponse<AcademyAttendanceRecord>>('/api/identity/academy/attendance/mark', payload);
  },

  // Bulk mark attendance
  bulkMarkAttendance: (payload: BulkAcademyAttendancePayload) => {
    return api.post<ApiResponse<AcademyAttendanceRecord[]>>('/api/identity/academy/attendance/bulk', payload);
  },
};
