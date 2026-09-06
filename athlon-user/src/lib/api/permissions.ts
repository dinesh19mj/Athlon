import { api } from './client';
import { ApiResponse } from './user';

export type AccessLevel = 'MANAGE' | 'VIEW' | 'NONE';

export interface AcademyRolePermission {
  permissionUuid?: string;
  organizationUuid: string;
  role: string;       // ADMIN, COACH, STAFF, STUDENT, PARENT
  moduleId: string;   // batches, schedule, attendance, students, etc.
  accessLevel: AccessLevel;
}

export interface SaveRolePermissionsRequest {
  permissions: {
    role: string;
    moduleId: string;
    accessLevel: AccessLevel;
  }[];
}

export const AcademyPermissionService = {
  // Get all role permissions for an academy
  getOrgPermissions: (orgUuid: string) => {
    return api.get<ApiResponse<AcademyRolePermission[]>>(`/api/identity/academy/permissions/org/${orgUuid}`);
  },

  // Get permissions for a specific role in an academy
  getRolePermissions: (orgUuid: string, role: string) => {
    return api.get<ApiResponse<AcademyRolePermission[]>>(
      `/api/identity/academy/permissions/org/${orgUuid}/role?role=${encodeURIComponent(role)}`
    );
  },

  // Save/update custom permissions matrix
  savePermissions: (orgUuid: string, data: SaveRolePermissionsRequest) => {
    return api.post<ApiResponse<AcademyRolePermission[]>>(`/api/identity/academy/permissions/org/${orgUuid}/save`, data);
  },

  // Reset to default system permissions
  resetPermissions: (orgUuid: string) => {
    return api.post<ApiResponse<AcademyRolePermission[]>>(`/api/identity/academy/permissions/org/${orgUuid}/reset`, {});
  },
};
