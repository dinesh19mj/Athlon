import { fetchClient } from './client';

export interface VenueCustomer {
  customerId: number;
  customerUuid: string;
  organizationUuid: string;
  fullName: string;
  phone?: string;
  email?: string;
  vipTier: 'STANDARD' | 'SILVER' | 'GOLD' | 'VIP';
  totalBookings: number;
  totalSpent: number;
  lastVisitAt?: string;
  notes?: string;
  tags?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VenueCustomerCreateRequest {
  organizationUuid: string;
  fullName: string;
  phone?: string;
  email?: string;
  vipTier?: 'STANDARD' | 'SILVER' | 'GOLD' | 'VIP';
  notes?: string;
  tags?: string;
}

export const venueCustomerApi = {
  getCustomers: async (
    orgUuid: string,
    params?: { search?: string; tier?: string; page?: number; size?: number }
  ): Promise<{ content: VenueCustomer[]; totalElements: number; totalPages: number }> => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.tier) query.set('tier', params.tier);
    if (params?.page !== undefined) query.set('page', String(params.page));
    if (params?.size !== undefined) query.set('size', String(params.size));
    const qs = query.toString() ? `?${query.toString()}` : '';

    const res = await fetchClient<any>(
      `/api/identity/venues/customers/organization/${orgUuid}${qs}`
    );
    const pageData = res?.data || res;
    return {
      content: pageData?.content || (Array.isArray(pageData) ? pageData : []),
      totalElements: pageData?.totalElements || (Array.isArray(pageData) ? pageData.length : 0),
      totalPages: pageData?.totalPages || 1,
    };
  },

  getCustomerDetail: async (customerUuid: string): Promise<VenueCustomer> => {
    const res = await fetchClient<any>(`/api/identity/venues/customers/${customerUuid}`);
    return res?.data || res;
  },

  createCustomer: async (data: VenueCustomerCreateRequest): Promise<VenueCustomer> => {
    const res = await fetchClient<any>('/api/identity/venues/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res?.data || res;
  },

  updateCustomer: async (customerUuid: string, data: VenueCustomerCreateRequest): Promise<VenueCustomer> => {
    const res = await fetchClient<any>(`/api/identity/venues/customers/${customerUuid}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res?.data || res;
  },
};

