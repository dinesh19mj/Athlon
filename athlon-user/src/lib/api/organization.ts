import { api, fetchClient } from './client';

export interface OrganizationProfile {
  profileUuid?: string;
  organizationId?: number;
  organizationUuid: string;
  name?: string;
  type?: string;
  description?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  city?: string;
  district?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  website?: string;
  logo?: string;
  banner?: string;
  isPublic?: number;
  sportsOffered?: string;
  admissionStatus?: string;
  academyLevels?: string;
  totalCourts?: number;
  surfaceType?: string;
  openingTime?: string;
  closingTime?: string;
  pricePerHour?: number;
  amenities?: string;
  bio?: string;
  establishedYear?: number;
  registrationNumber?: string;
  monthlyFeeMin?: number;
  monthlyFeeMax?: number;
  operatingDays?: string;
  socialInstagram?: string;
  socialFacebook?: string;
  socialYoutube?: string;
  rating?: number;
  reviewsCount?: number;
  updatedAt?: string;
}

export interface Organization {
  orgId?: number;
  uuid?: string;
  organizationUuid?: string;
  name: string;
  type: string;
  description?: string;
  address?: string;
  city?: string;
  district?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  logo?: string;
  isActive?: number;
  role?: string;
  subscriptionPackageUuid?: string;
  profile?: OrganizationProfile;
}

export interface OrganizationMemberResponse {
  organizationMemberUuid: string;
  organizationMemberId?: number;
  organizationUuid: string;
  organizationId?: number;
  userUuid: string;
  userId?: number;
  fullName: string;
  email?: string;
  phone?: string;
  photo?: string;
  role: string;
  sportType?: string;
  status: string;
  isActive?: number;
  joinedAt?: string;
}

export interface AddMemberRequest {
  phone: string;
  role?: string;
  sportType?: string;
}

export const OrganizationService = {
  create: (data: Organization) => 
    api.post<any>('/api/identity/organizations/createOrganization', data),
    
  update: (orgId: number, data: Organization) => 
    api.post<any>(`/api/identity/organizations/updateOrganization`, data),
    
  saveProfile: (data: OrganizationProfile) =>
    api.post<any>('/api/identity/organizations/saveProfile', data),

  saveProfileMultipart: (formData: FormData) =>
    fetchClient<any>('/api/identity/organizations/saveProfileMultipart', {
      method: 'POST',
      body: formData,
    }),

  getProfileByOrgUuid: (orgUuid: string) =>
    api.get<any>(`/api/identity/organizations/getProfileByOrgUuid/${orgUuid}`),

  getLogoUrl: (fileName?: string) => {
    if (!fileName) return '';
    if (fileName.startsWith('http') || fileName.startsWith('data:') || fileName.startsWith('blob:')) return fileName;
    const cleanName = fileName.split(/[/\\]/).pop() || fileName;
    return `/api/identity/organizations/logo/${encodeURIComponent(cleanName)}`;
  },

  getBannerUrl: (fileName?: string) => {
    if (!fileName) return '';
    if (fileName.startsWith('http') || fileName.startsWith('data:') || fileName.startsWith('blob:')) return fileName;
    const cleanName = fileName.split(/[/\\]/).pop() || fileName;
    return `/api/identity/organizations/banner/${encodeURIComponent(cleanName)}`;
  },

  updateSubscription: (orgId: number, status: string, paymentRef?: string) => 
    api.post<any>(`/organization/updateSubscription/${orgId}?status=${status}${paymentRef ? `&paymentRef=${paymentRef}` : ''}`, {}),
    
  getById: (orgUuid: string) => 
    api.get<any>(`/api/identity/organizations/getOrganizationByUuid/${orgUuid}`),
    
  getAll: () => 
    api.get<any>('/api/identity/organizations/getAllOrganizations'),
    
  getByUserUuid: (userUuid: string) => 
    api.get<any>(`/api/identity/organizations/getByUserUuid/${userUuid}`),
    
  getMembers: (orgUuid: string) => 
    api.get<OrganizationMemberResponse[]>(`/api/identity/organizations/${orgUuid}/members`),

  addMemberByPhone: (orgUuid: string, data: AddMemberRequest) =>
    api.post<OrganizationMemberResponse>(`/api/identity/organizations/${orgUuid}/members`, data),

  removeMember: (orgUuid: string, memberUuid: string) =>
    api.post<void>(`/api/identity/organizations/${orgUuid}/members/${memberUuid}/remove`, {}),

  getUserRole: (orgUuid: string, userUuid: string) =>
    api.get<string>(`/api/identity/organizations/${orgUuid}/user-role/${userUuid}`)
};
