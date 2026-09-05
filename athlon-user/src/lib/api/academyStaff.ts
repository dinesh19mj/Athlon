import { api } from './client';
import { ApiResponse } from './user';

export interface AcademyStaffResponse {
  staffUuid: string;
  staffId?: number;
  organizationUuid: string;
  organizationId?: number;
  userUuid?: string;
  userId?: number;
  centreUuid?: string;
  centreId?: number;
  centreName?: string;
  staffType: 'COACH' | 'OPERATIONAL' | 'STAFF' | string;
  role: string;
  sportType?: string;
  fullName: string;
  email?: string;
  phone?: string;
  photo?: string;
  status: string;
  isActive?: number;
  joinedAt?: string;
}

export interface AddAcademyStaffRequest {
  phone: string;
  role: string;
  sportType?: string;
  centreUuid?: string;
}

export const AcademyStaffService = {
  // Get all staff or filter by type (COACH, OPERATIONAL, ALL)
  getStaff: (orgUuid: string, type?: string) => {
    const query = type ? `?type=${encodeURIComponent(type)}` : '';
    return api.get<ApiResponse<AcademyStaffResponse[]>>(`/api/identity/academy/staff/org/${orgUuid}${query}`);
  },

  // Get only Coaches for Academy
  getCoaches: (orgUuid: string) => {
    return api.get<ApiResponse<AcademyStaffResponse[]>>(`/api/identity/academy/staff/coaches/org/${orgUuid}`);
  },

  // Get only Operational / Administrative Staff for Academy
  getOperationalStaff: (orgUuid: string) => {
    return api.get<ApiResponse<AcademyStaffResponse[]>>(`/api/identity/academy/staff/operations/org/${orgUuid}`);
  },

  // Get single staff member by UUID
  getStaffByUuid: (staffUuid: string) => {
    return api.get<ApiResponse<AcademyStaffResponse>>(`/api/identity/academy/staff/${staffUuid}`);
  },

  // Add staff member / coach by phone
  addStaff: (orgUuid: string, data: AddAcademyStaffRequest) => {
    return api.post<ApiResponse<AcademyStaffResponse>>(`/api/identity/academy/staff/add/${orgUuid}`, data);
  },

  // Remove staff member / coach
  removeStaff: (orgUuid: string, staffUuid: string) => {
    return api.post<ApiResponse<void>>(`/api/identity/academy/staff/remove/${orgUuid}/${staffUuid}`, {});
  },
};
