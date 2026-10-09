import { fetchClient } from './client';

export interface AdminDashboardStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  totalOrganizations: number;
  activeOrganizations: number;
  organizationsByType: Record<string, number>;
  totalPackages: number;
  activeSubscriptions: number;
  pendingSubscriptionRequests: number;
  totalTournaments: number;
}

export interface AdminUserItem {
  userId: number;
  userUuid: string;
  email: string;
  isActive: number;
  createdAt: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  city?: string;
  roles: string[];
  organizationCount: number;
}

export interface AdminOrganizationItem {
  organizationId: number;
  organizationUuid: string;
  name: string;
  type: string;
  description?: string;
  isActive: number;
  createdAt: string;
  userId?: number;
  userUuid?: string;
  ownerEmail?: string;
  activePackageName?: string;
  subscriptionExpiry?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  empty: boolean;
}

export interface ApiResponse<T> {
  status: string;
  message?: string;
  data: T;
}

export const AdminService = {
  getDashboardStats: async (): Promise<ApiResponse<AdminDashboardStats>> => {
    return fetchClient<ApiResponse<AdminDashboardStats>>('/api/admin/dashboard/stats', {
      method: 'GET',
    });
  },

  getUsers: async (params?: {
    search?: string;
    status?: number;
    page?: number;
    size?: number;
  }): Promise<ApiResponse<PageResponse<AdminUserItem>>> => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.status !== undefined) query.set('status', String(params.status));
    query.set('page', String(params?.page ?? 0));
    query.set('size', String(params?.size ?? 10));

    return fetchClient<ApiResponse<PageResponse<AdminUserItem>>>(
      `/api/admin/users?${query.toString()}`,
      { method: 'GET' }
    );
  },

  getUserDetail: async (userUuid: string): Promise<ApiResponse<AdminUserItem>> => {
    return fetchClient<ApiResponse<AdminUserItem>>(`/api/admin/users/${userUuid}`, {
      method: 'GET',
    });
  },

  updateUserStatus: async (
    userUuid: string,
    status: 'ACTIVE' | 'SUSPENDED',
    reason?: string
  ): Promise<ApiResponse<AdminUserItem>> => {
    return fetchClient<ApiResponse<AdminUserItem>>(`/api/admin/users/${userUuid}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, reason }),
    });
  },

  getOrganizations: async (params?: {
    search?: string;
    type?: string;
    status?: number;
    page?: number;
    size?: number;
  }): Promise<ApiResponse<PageResponse<AdminOrganizationItem>>> => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.type) query.set('type', params.type);
    if (params?.status !== undefined) query.set('status', String(params.status));
    query.set('page', String(params?.page ?? 0));
    query.set('size', String(params?.size ?? 10));

    return fetchClient<ApiResponse<PageResponse<AdminOrganizationItem>>>(
      `/api/admin/organizations?${query.toString()}`,
      { method: 'GET' }
    );
  },

  getOrganizationDetail: async (
    orgUuid: string
  ): Promise<ApiResponse<AdminOrganizationItem>> => {
    return fetchClient<ApiResponse<AdminOrganizationItem>>(
      `/api/admin/organizations/${orgUuid}`,
      { method: 'GET' }
    );
  },

  updateOrganizationStatus: async (
    orgUuid: string,
    status: 'ACTIVE' | 'SUSPENDED',
    reason?: string
  ): Promise<ApiResponse<AdminOrganizationItem>> => {
    return fetchClient<ApiResponse<AdminOrganizationItem>>(
      `/api/admin/organizations/${orgUuid}/status`,
      {
        method: 'PUT',
        body: JSON.stringify({ status, reason }),
      }
    );
  },

  getAllPackages: async (): Promise<ApiResponse<SubscriptionPackageItem[]>> => {
    return fetchClient<ApiResponse<SubscriptionPackageItem[]>>(
      '/api/identity/subscriptions/getAllPackages',
      { method: 'GET' }
    );
  },

  createPackage: async (data: {
    name: string;
    description?: string;
    price: number;
    durationMonths: number;
    features?: string;
  }): Promise<ApiResponse<SubscriptionPackageItem>> => {
    return fetchClient<ApiResponse<SubscriptionPackageItem>>(
      '/api/identity/subscriptions/createPackage',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  getSubscriptionRequests: async (params?: {
    status?: string;
    page?: number;
    size?: number;
  }): Promise<ApiResponse<PageResponse<PlatformSubscriptionRequestItem>>> => {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    query.set('page', String(params?.page ?? 0));
    query.set('size', String(params?.size ?? 10));

    return fetchClient<ApiResponse<PageResponse<PlatformSubscriptionRequestItem>>>(
      `/api/admin/subscriptions/requests?${query.toString()}`,
      { method: 'GET' }
    );
  },

  approveSubscriptionRequest: async (
    requestUuid: string
  ): Promise<ApiResponse<PlatformSubscriptionRequestItem>> => {
    return fetchClient<ApiResponse<PlatformSubscriptionRequestItem>>(
      `/api/admin/subscriptions/requests/${requestUuid}/approve`,
      { method: 'POST' }
    );
  },

  rejectSubscriptionRequest: async (
    requestUuid: string,
    reason?: string
  ): Promise<ApiResponse<PlatformSubscriptionRequestItem>> => {
    return fetchClient<ApiResponse<PlatformSubscriptionRequestItem>>(
      `/api/admin/subscriptions/requests/${requestUuid}/reject`,
      {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }
    );
  },

  getAuditLogs: async (params?: {
    page?: number;
    size?: number;
  }): Promise<ApiResponse<PageResponse<PlatformAdminAuditLogItem>>> => {
    const query = new URLSearchParams();
    query.set('page', String(params?.page ?? 0));
    query.set('size', String(params?.size ?? 20));

    return fetchClient<ApiResponse<PageResponse<PlatformAdminAuditLogItem>>>(
      `/api/admin/audit-logs?${query.toString()}`,
      { method: 'GET' }
    );
  },
};

export interface SubscriptionPackageItem {
  uuid: string;
  name: string;
  description?: string;
  price: number;
  durationMonths: number;
  features?: string;
  isActive?: number;
}

export interface PlatformSubscriptionRequestItem {
  requestId: number;
  requestUuid: string;
  userId: number;
  userUuid: string;
  organizationId: number;
  organizationUuid: string;
  packageId: number;
  packageUuid: string;
  billingPeriodMonths: number;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentReference?: string;
  paymentProofUrl?: string;
  paymentStatus: string;
  requestStatus: string;
  rejectionReason?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface PlatformAdminAuditLogItem {
  auditId: number;
  auditUuid: string;
  adminUserId: number;
  adminUserUuid: string;
  adminEmail: string;
  action: string;
  entityType: string;
  entityId: string;
  previousState?: string;
  newState?: string;
  reason?: string;
  requestIp?: string;
  createdAt: string;
}

