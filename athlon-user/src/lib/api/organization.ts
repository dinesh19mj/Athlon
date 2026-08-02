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
    api.post<Organization>('/organization/createOrganization', data),
    
  update: (orgId: number, data: Organization) => 
    api.post<Organization>(`/organization/updateOrganization/${orgId}`, data),
    
  updateSubscription: (orgId: number, status: string, paymentRef?: string) => 
    api.post<Organization>(`/organization/updateSubscription/${orgId}?status=${status}${paymentRef ? `&paymentRef=${paymentRef}` : ''}`, {}),
    
  getById: (orgId: number) => 
    api.get<Organization>(`/organization/getOrganizationById/${orgId}`),
    
  getAll: () => 
    api.get<Organization[]>('/organization/getAllOrganizations'),
    
  addMember: (orgId: number, playerId: number, role: string) => 
    api.post<OrganizationMember>(`/organization/addMember/${orgId}?playerId=${playerId}&role=${role}`, {}),
    
  getMembers: (orgId: number) => 
    api.get<OrganizationMember[]>(`/organization/getMembers/${orgId}`)
};
