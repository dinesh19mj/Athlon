import { api } from './client';

export interface SubscriptionPackage {
  uuid?: string;
  packageId?: number;
  name: string;
  workspaceType?: string;
  period?: string;
  price?: number;
  durationMonths?: number;
  description?: string;
  features?: string;
  isActive?: number;
}

export interface OrganizationSubscriptionResponse {
  uuid?: string;
  organizationId?: number;
  planUuid?: string;
  planName?: string;
  subscriptionPackage?: SubscriptionPackage;
  startDate?: string;
  endDate?: string;
  status?: string;
  billingCycle?: string;
  paymentReference?: string;
}

export interface VenueEntitlementSummary {
  planCode: string;
  planName: string;
  billingCycle: string;
  status: string;
  startDate: string;
  endDate: string;
  daysRemaining: number;
  marketplaceCommissionRate: number;
  limits: Record<string, number>;
  usage: Record<string, number>;
  features: Record<string, boolean>;
  isExpired: boolean;
  canAddFacility: boolean;
  canAddStaff: boolean;
  canAddVenue: boolean;
}

export interface VenueSubscriptionPlan {
  planId: number;
  planUuid: string;
  planCode: string;
  name: string;
  description: string;
  displayOrder: number;
  versionId: number;
  versionNumber: number;
  marketplaceCommissionRate: number;
  monthlyPrice: number;
  yearlyPrice: number;
  limits: Record<string, number>;
  features: Record<string, boolean>;
}

export interface SaveSubscriptionPlanPayload {
  planId?: number;
  planUuid?: string;
  planCode?: string;
  name: string;
  description?: string;
  targetModule: 'VENUE' | 'TOURNAMENT' | 'ACADEMY' | 'CLUB' | 'COACH' | 'COMMUNITY';
  displayOrder?: number;
  isActive?: number;
  monthlyPrice?: number;
  yearlyPrice?: number;
  packagePrice?: number;
  marketplaceCommissionRate?: number;
  limits?: Record<string, number>;
  features?: Record<string, boolean>;
}

export const SubscriptionService = {
  getAll: () =>
    api.get<any>('/api/identity/subscriptions/plans/venue'),

  getActiveForOrg: (orgUuid: string) =>
    api.get<any>(`/api/identity/subscriptions/organizations/${orgUuid}/active`),

  subscribeOrg: (data: { organizationUuid: string; packageUuid: string; paymentReference?: string }) =>
    api.post<any>('/api/identity/subscriptions/organizations/subscribe', data),

  getVenueEntitlements: (orgUuid: string) =>
    api.get<{ status: string; data: VenueEntitlementSummary }>(`/api/identity/subscriptions/organizations/${orgUuid}/entitlements`),

  getVenuePlans: () =>
    api.get<{ status: string; data: VenueSubscriptionPlan[] }>('/api/identity/subscriptions/plans/venue'),

  subscribeVenuePlan: (orgUuid: string, data: { planCode?: string; planUuid?: string; billingCycle?: string; paymentReference?: string }) =>
    api.post<{ status: string; data: VenueEntitlementSummary }>(`/api/identity/subscriptions/organizations/${orgUuid}/subscribe-plan`, data),

  createPlan: (data: SaveSubscriptionPlanPayload) =>
    api.post<{ status: string; message: string; data: any }>('/api/identity/subscriptions/plans/create', data),

  updatePlan: (data: SaveSubscriptionPlanPayload) =>
    api.post<{ status: string; message: string; data: any }>('/api/identity/subscriptions/plans/update', data),

  togglePlanStatus: (planUuid: string) =>
    api.post<{ status: string; message: string; data: any }>('/api/identity/subscriptions/plans/toggle-status', { planUuid }),
};
