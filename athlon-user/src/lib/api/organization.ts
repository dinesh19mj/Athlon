import { api } from './client';

export interface Organization {
  orgId?: number;
  name: string;
  type: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  logo?: string;
  isActive?: number;
  subscriptionPackageUuid?: string;
}

export interface OrganizationMember {
  memberId?: number;
  orgId: number;
  playerId: number;
  role: string;
  isActive?: number;
}

export const OrganizationService = {
  create: (data: Organization) => 
    api.post<any>('/api/identity/organizations/createOrganization', data),
    
  update: (orgId: number, data: Organization) => 
    api.post<any>(`/api/identity/organizations/updateOrganization`, data),
    
  updateSubscription: (orgId: number, status: string, paymentRef?: string) => 
    api.post<any>(`/organization/updateSubscription/${orgId}?status=${status}${paymentRef ? `&paymentRef=${paymentRef}` : ''}`, {}),
    
  getById: (orgUuid: string) => 
    api.get<any>(`/api/identity/organizations/getOrganizationByUuid/${orgUuid}`),
    
  getAll: () => 
    api.get<any>('/api/identity/organizations/getAllOrganizations'),
    
  getByUserUuid: (userUuid: string) => 
    api.get<any>(`/api/identity/organizations/getByUserUuid/${userUuid}`),
    
  addMember: (orgId: number, playerId: number, role: string) => 
    api.post<OrganizationMember>(`/organization/addMember/${orgId}?playerId=${playerId}&role=${role}`, {}),
    
  getMembers: (orgId: number) => 
    api.get<OrganizationMember[]>(`/organization/getMembers/${orgId}`)
};
