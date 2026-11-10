import { fetchClient } from './client';

export interface VenueMembership {
  membershipId: number;
  membershipUuid: string;
  organizationUuid: string;
  name: string;
  description?: string;
  price: number;
  totalHours: number;
  validityDays: number;
  discountPercentage?: number;
  isActive: boolean;
  createdAt?: string;
}

export interface VenueCustomerMembership {
  customerMembershipId: number;
  customerMembershipUuid: string;
  customerId: number;
  customerUuid?: string;
  customerName?: string;
  customerPhone?: string;
  membershipId: number;
  membershipName?: string;
  totalHoursGranted: number;
  remainingHours: number;
  startDate: string;
  expiryDate: string;
  status: 'ACTIVE' | 'EXPIRED' | 'DEPLETED' | 'CANCELLED';
  amountPaid: number;
  paymentMethod?: string;
  createdAt?: string;
}

export interface AssignMembershipRequest {
  organizationUuid: string;
  customerId: number;
  customerUuid?: string;
  membershipId: number;
  paymentMethod?: string;
  amountPaid?: number;
}

export const venueMembershipApi = {
  getPlans: async (orgUuid: string): Promise<VenueMembership[]> => {
    const res = await fetchClient<any>(`/api/identity/venues/memberships/plans/organization/${orgUuid}`);
    const data = res?.data || res;
    return Array.isArray(data) ? data : (data?.content || []);
  },

  createPlan: async (data: Partial<VenueMembership>): Promise<VenueMembership> => {
    const res = await fetchClient<any>('/api/identity/venues/memberships/plans', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res?.data || res;
  },

  getCustomerMemberships: async (
    orgUuid: string,
    params?: { search?: string; status?: string; page?: number; size?: number }
  ): Promise<{ content: VenueCustomerMembership[]; totalElements: number; totalPages: number }> => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.status) query.set('status', params.status);
    if (params?.page !== undefined) query.set('page', String(params.page));
    if (params?.size !== undefined) query.set('size', String(params.size));
    const qs = query.toString() ? `?${query.toString()}` : '';

    const res = await fetchClient<any>(
      `/api/identity/venues/memberships/organization/${orgUuid}/active${qs}`
    );
    const data = res?.data || res;
    const list = Array.isArray(data) ? data : (data?.content || []);
    return {
      content: list,
      totalElements: data?.totalElements || list.length,
      totalPages: data?.totalPages || 1,
    };
  },

  assignMembership: async (data: AssignMembershipRequest): Promise<VenueCustomerMembership> => {
    const res = await fetchClient<any>('/api/identity/venues/memberships/assign', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res?.data || res;
  },

  deductCredits: async (
    customerMembershipUuid: string,
    hours: number,
    notes?: string
  ): Promise<{ remainingHours: number; status: string }> => {
    const query = new URLSearchParams({ hours: String(hours) });
    if (notes) query.set('notes', notes);
    const res = await fetchClient<any>(
      `/api/identity/venues/memberships/customers/${customerMembershipUuid}/deduct?${query.toString()}`,
      { method: 'POST' }
    );
    return res?.data || res;
  },
};

