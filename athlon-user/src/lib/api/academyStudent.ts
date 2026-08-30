import { api } from './client';

export type StudentLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ELITE' | 'PRO';
export type FeeStatus = 'PAID' | 'PENDING' | 'OVERDUE';
export type StudentStatus = 'ACTIVE' | 'INACTIVE' | 'PAUSED' | 'GRADUATED';

export interface AcademyStudent {
  studentId?: number;
  studentUuid: string;
  organizationId?: number;
  organizationUuid: string;
  userId?: number;
  userUuid?: string;
  fullName: string;
  gender?: string;
  dob?: string;
  age?: number;
  bloodGroup?: string;
  level?: StudentLevel | string;
  batchUuid?: string;
  batchName?: string;
  batchTiming?: string;
  sportType?: string;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  emergencyContact?: string;
  address?: string;
  photo?: string;
  medicalNotes?: string;
  enrollmentDate?: string;
  monthlyFee?: number;
  feeFrequency?: string;
  feeStatus?: FeeStatus | string;
  status?: StudentStatus | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AcademyBatch {
  batchId?: number;
  batchUuid: string;
  organizationId?: number;
  organizationUuid: string;
  batchName: string;
  sportType?: string;
  level?: string;
  coachUuid?: string;
  coachName?: string;
  daysOfWeek?: string;
  startTime?: string;
  endTime?: string;
  maxCapacity?: number;
  enrolledCount?: number;
  monthlyFee?: number;
  status?: 'ACTIVE' | 'FULL' | 'ARCHIVED' | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AcademySummary {
  totalStudents: number;
  activeStudents: number;
  totalBatches: number;
  paidCount: number;
  pendingCount: number;
  overdueCount: number;
  feeCollectionPercentage: number;
  studentsByLevel: Record<string, number>;
  studentsByBatch: Record<string, number>;
}

export interface EnrollStudentPayload {
  organizationUuid: string;
  userUuid?: string;
  fullName: string;
  gender?: string;
  dob?: string;
  age?: number;
  bloodGroup?: string;
  level?: string;
  batchUuid?: string;
  batchName?: string;
  batchTiming?: string;
  sportType?: string;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  emergencyContact?: string;
  address?: string;
  photo?: string;
  medicalNotes?: string;
  enrollmentDate?: string;
  monthlyFee?: number;
  feeFrequency?: string;
  feeStatus?: string;
}

export interface UpdateStudentPayload {
  studentUuid: string;
  fullName?: string;
  gender?: string;
  dob?: string;
  age?: number;
  bloodGroup?: string;
  level?: string;
  batchUuid?: string;
  batchName?: string;
  batchTiming?: string;
  sportType?: string;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  emergencyContact?: string;
  address?: string;
  photo?: string;
  medicalNotes?: string;
  monthlyFee?: number;
  feeFrequency?: string;
  feeStatus?: string;
  status?: string;
}

export interface CreateBatchPayload {
  organizationUuid: string;
  batchName: string;
  sportType?: string;
  level?: string;
  coachUuid?: string;
  coachName?: string;
  daysOfWeek?: string;
  startTime?: string;
  endTime?: string;
  maxCapacity?: number;
  monthlyFee?: number;
}

export interface UpdateBatchPayload {
  batchUuid: string;
  batchName?: string;
  sportType?: string;
  level?: string;
  coachUuid?: string;
  coachName?: string;
  daysOfWeek?: string;
  startTime?: string;
  endTime?: string;
  maxCapacity?: number;
  monthlyFee?: number;
  status?: string;
}

export const AcademyStudentService = {
  getStudents: async (
    organizationUuid: string,
    params?: {
      level?: string;
      batchUuid?: string;
      feeStatus?: string;
      status?: string;
      search?: string;
    }
  ): Promise<AcademyStudent[]> => {
    let url = `/identity/academy/students/org/${organizationUuid}`;
    const query = new URLSearchParams();
    if (params?.level) query.append('level', params.level);
    if (params?.batchUuid) query.append('batchUuid', params.batchUuid);
    if (params?.feeStatus) query.append('feeStatus', params.feeStatus);
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);

    const queryString = query.toString();
    if (queryString) url += `?${queryString}`;

    const res = await api.get<{ data: AcademyStudent[] }>(url);
    return (res as any)?.data || res;
  },

  getStudentById: async (studentUuid: string): Promise<AcademyStudent> => {
    const res = await api.get<{ data: AcademyStudent }>(`/identity/academy/students/${studentUuid}`);
    return (res as any)?.data || res;
  },

  enrollStudent: async (payload: EnrollStudentPayload): Promise<AcademyStudent> => {
    const res = await api.post<{ data: AcademyStudent }>(`/identity/academy/students/enroll`, payload);
    return (res as any)?.data || res;
  },

  updateStudent: async (payload: UpdateStudentPayload): Promise<AcademyStudent> => {
    const res = await api.put<{ data: AcademyStudent }>(`/identity/academy/students/update`, payload);
    return (res as any)?.data || res;
  },

  deleteStudent: async (studentUuid: string): Promise<void> => {
    await api.delete(`/identity/academy/students/${studentUuid}`);
  },

  getSummary: async (organizationUuid: string): Promise<AcademySummary> => {
    const res = await api.get<{ data: AcademySummary }>(`/identity/academy/students/summary/org/${organizationUuid}`);
    return (res as any)?.data || res;
  },

  getBatches: async (organizationUuid: string, status?: string): Promise<AcademyBatch[]> => {
    let url = `/identity/academy/batches/org/${organizationUuid}`;
    if (status) url += `?status=${status}`;
    const res = await api.get<{ data: AcademyBatch[] }>(url);
    return (res as any)?.data || res;
  },

  createBatch: async (payload: CreateBatchPayload): Promise<AcademyBatch> => {
    const res = await api.post<{ data: AcademyBatch }>(`/identity/academy/batches/create`, payload);
    return (res as any)?.data || res;
  },

  updateBatch: async (payload: UpdateBatchPayload): Promise<AcademyBatch> => {
    const res = await api.put<{ data: AcademyBatch }>(`/identity/academy/batches/update`, payload);
    return (res as any)?.data || res;
  },

  deleteBatch: async (batchUuid: string): Promise<void> => {
    await api.delete(`/identity/academy/batches/${batchUuid}`);
  }
};
