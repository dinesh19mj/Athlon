import { api } from './client';

export type TraineeSkillLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ELITE' | 'PRO';
export type TraineeStatus = 'ACTIVE' | 'INACTIVE' | 'PAUSED' | 'GRADUATED';
export type PackageCategory = '1on1' | 'group' | 'monthly' | 'sparring' | 'camp';
export type BillingCycle = 'per_session' | 'per_hour' | 'monthly' | 'quarterly';
export type ScheduleStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type FeeTransactionStatus = 'PAID' | 'PENDING' | 'OVERDUE' | 'WAIVED';

export interface CoachTrainee {
  traineeId?: number;
  traineeUuid: string;
  organizationId?: number;
  organizationUuid: string;
  userId?: number;
  userUuid?: string;
  fullName: string;
  gender?: string;
  dob?: string;
  age?: number;
  bloodGroup?: string;
  skillLevel?: TraineeSkillLevel | string;
  sportType?: string;
  phone?: string;
  email?: string;
  packageUuid?: string;
  packageName?: string;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  emergencyContact?: string;
  address?: string;
  photo?: string;
  medicalNotes?: string;
  notes?: string;
  attendanceRate?: number;
  enrollmentDate?: string;
  status?: TraineeStatus | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CoachFeePackage {
  packageId?: number;
  packageUuid: string;
  organizationId?: number;
  organizationUuid: string;
  name: string;
  category: PackageCategory | string;
  categoryLabel: string;
  price: number;
  billingCycle: BillingCycle | string;
  sessionsPerWeek: number;
  maxTrainees: number;
  enrolledCount?: number;
  description?: string;
  features?: string; // JSON array string
  isPopular?: boolean;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CoachSchedule {
  sessionId?: number;
  sessionUuid: string;
  organizationId?: number;
  organizationUuid: string;
  traineeUuid?: string;
  traineeName: string;
  traineeAvatar?: string;
  packageUuid?: string;
  packageName?: string;
  sessionDate?: string;
  timeSlot: string;
  venue?: string;
  court?: string;
  focusArea?: string;
  status: ScheduleStatus | string;
  isCheckedIn: boolean;
  checkInTime?: string;
  coachNotes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CoachFeeTransaction {
  transactionId?: number;
  transactionUuid: string;
  organizationId?: number;
  organizationUuid: string;
  traineeUuid?: string;
  traineeName: string;
  traineeAvatar?: string;
  packageUuid?: string;
  packageName?: string;
  amount: number;
  billingPeriod?: string;
  dueDate?: string;
  paidDate?: string;
  status: FeeTransactionStatus | string;
  paymentMethod?: string;
  paymentRef?: string;
  reminderSentAt?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CoachDashboardSummary {
  organizationUuid: string;
  activeTraineesCount: number;
  totalSessionsToday: number;
  completedSessionsToday: number;
  monthlyRevenuePaid: number;
  monthlyRevenuePending: number;
  projectedMonthlyRevenue: number;
  todaySchedules: CoachSchedule[];
  recentTrainees: CoachTrainee[];
  activePackages: CoachFeePackage[];
}

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

export interface CoachAttendanceRecord {
  attendanceId?: number;
  attendanceUuid: string;
  organizationId?: number;
  organizationUuid: string;
  traineeId?: number;
  traineeUuid: string;
  traineeName: string;
  traineeAvatar?: string;
  packageUuid?: string;
  packageName?: string;
  attendanceDate: string;
  status: AttendanceStatus | string;
  checkInTime?: string;
  checkOutTime?: string;
  focusDrills?: string;
  performanceRating?: number;
  coachNotes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CoachAttendanceSummary {
  organizationUuid: string;
  date: string;
  totalTrainees: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  attendancePercentage: number;
}

export interface MarkCoachAttendancePayload {
  organizationUuid: string;
  traineeUuid: string;
  traineeName?: string;
  traineeAvatar?: string;
  packageUuid?: string;
  packageName?: string;
  attendanceDate: string;
  status: AttendanceStatus | string;
  checkInTime?: string;
  checkOutTime?: string;
  focusDrills?: string;
  performanceRating?: number;
  coachNotes?: string;
}

export interface BulkCoachAttendancePayload {
  organizationUuid: string;
  attendanceDate: string;
  records: MarkCoachAttendancePayload[];
}

export const CoachService = {
  // ── Trainees Roster ──
  getTrainees: (orgUuid: string, status?: string) =>
    api.get<CoachTrainee[]>(`/api/identity/coach/trainees/org/${orgUuid}${status ? `?status=${status}` : ''}`),

  getTraineeByUuid: (traineeUuid: string) =>
    api.get<CoachTrainee>(`/api/identity/coach/trainees/${traineeUuid}`),

  createTrainee: (data: Partial<CoachTrainee> & { organizationUuid: string; fullName: string }) =>
    api.post<CoachTrainee>('/api/identity/coach/trainees/create', data),

  updateTrainee: (data: Partial<CoachTrainee> & { traineeUuid: string }) =>
    api.post<CoachTrainee>('/api/identity/coach/trainees/update', data),

  deleteTrainee: (traineeUuid: string) =>
    api.post<string>(`/api/identity/coach/trainees/delete/${traineeUuid}`, {}),

  // ── Fee Packages ──
  getPackages: (orgUuid: string, activeOnly?: boolean) =>
    api.get<CoachFeePackage[]>(`/api/identity/coach/packages/org/${orgUuid}${activeOnly ? '?activeOnly=true' : ''}`),

  getPackageByUuid: (packageUuid: string) =>
    api.get<CoachFeePackage>(`/api/identity/coach/packages/${packageUuid}`),

  createPackage: (data: Partial<CoachFeePackage> & { organizationUuid: string; name: string }) =>
    api.post<CoachFeePackage>('/api/identity/coach/packages/create', data),

  updatePackage: (data: Partial<CoachFeePackage> & { packageUuid: string }) =>
    api.post<CoachFeePackage>('/api/identity/coach/packages/update', data),

  deletePackage: (packageUuid: string) =>
    api.post<string>(`/api/identity/coach/packages/delete/${packageUuid}`, {}),

  // ── Schedules & Sessions ──
  getSchedules: (orgUuid: string, date?: string) =>
    api.get<CoachSchedule[]>(`/api/identity/coach/schedules/org/${orgUuid}${date ? `?date=${date}` : ''}`),

  createSchedule: (data: Partial<CoachSchedule> & { organizationUuid: string; traineeName: string; timeSlot: string }) =>
    api.post<CoachSchedule>('/api/identity/coach/schedules/create', data),

  updateSchedule: (data: Partial<CoachSchedule> & { sessionUuid: string }) =>
    api.post<CoachSchedule>('/api/identity/coach/schedules/update', data),

  checkInSchedule: (sessionUuid: string) =>
    api.post<CoachSchedule>(`/api/identity/coach/schedules/check-in/${sessionUuid}`, {}),

  deleteSchedule: (sessionUuid: string) =>
    api.post<string>(`/api/identity/coach/schedules/delete/${sessionUuid}`, {}),

  // ── Trainee Attendance ──
  getAttendance: (orgUuid: string, date?: string) =>
    api.get<CoachAttendanceRecord[]>(`/api/identity/coach/attendance/org/${orgUuid}${date ? `?date=${date}` : ''}`),

  getAttendanceSummary: (orgUuid: string, date?: string) =>
    api.get<CoachAttendanceSummary>(`/api/identity/coach/attendance/summary/org/${orgUuid}${date ? `?date=${date}` : ''}`),

  getTraineeAttendanceHistory: (orgUuid: string, traineeUuid: string, from?: string, to?: string) =>
    api.get<CoachAttendanceRecord[]>(
      `/api/identity/coach/attendance/trainee/${traineeUuid}?orgUuid=${orgUuid}${from ? `&from=${from}` : ''}${to ? `&to=${to}` : ''}`
    ),

  markAttendance: (data: MarkCoachAttendancePayload) =>
    api.post<CoachAttendanceRecord>('/api/identity/coach/attendance/mark', data),

  bulkMarkAttendance: (data: BulkCoachAttendancePayload) =>
    api.post<CoachAttendanceRecord[]>('/api/identity/coach/attendance/bulk-mark', data),

  deleteAttendance: (attendanceUuid: string) =>
    api.post<string>(`/api/identity/coach/attendance/delete/${attendanceUuid}`, {}),

  // ── Fee Transactions & Invoices ──
  getTransactions: (orgUuid: string, status?: string) =>
    api.get<CoachFeeTransaction[]>(`/api/identity/coach/transactions/org/${orgUuid}${status ? `?status=${status}` : ''}`),

  createTransaction: (data: Partial<CoachFeeTransaction> & { organizationUuid: string; traineeName: string; amount: number }) =>
    api.post<CoachFeeTransaction>('/api/identity/coach/transactions/create', data),

  recordPayment: (
    txOrData: string | { transactionUuid: string; amount?: number; paidDate?: string; paymentMethod?: string; paymentRef?: string; notes?: string; status?: string },
    optionalData?: { amount?: number; paidDate?: string; paymentMethod?: string; paymentRef?: string; notes?: string; status?: string }
  ) => {
    const payload = typeof txOrData === 'string' ? { transactionUuid: txOrData, ...optionalData } : txOrData;
    return api.post<CoachFeeTransaction>('/api/identity/coach/transactions/record-payment', payload);
  },

  sendReminder: (transactionUuid: string) =>
    api.post<CoachFeeTransaction>(`/api/identity/coach/transactions/send-reminder/${transactionUuid}`, {}),

  sendPaymentReminder: (transactionUuid: string) =>
    api.post<CoachFeeTransaction>(`/api/identity/coach/transactions/send-reminder/${transactionUuid}`, {}),

  // ── Dashboard Telemetry Summary ──
  getDashboardSummary: (orgUuid: string) =>
    api.get<CoachDashboardSummary>(`/api/identity/coach/dashboard/summary/${orgUuid}`),
};
