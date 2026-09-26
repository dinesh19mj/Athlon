import { api } from './client';

export interface SubscriptionPackage {
  uuid?: string;
  packageId?: number;
  name: string;
  workspaceType?: string;
  period?: string;
  price: number;
  durationMonths?: number;
  description?: string;
  features: string;
  isActive?: number;
}

export interface OrganizationSubscriptionResponse {
  uuid?: string;
  organizationId?: number;
  subscriptionPackage?: SubscriptionPackage;
  startDate?: string;
  endDate?: string;
  status?: string;
  paymentReference?: string;
}

export const SubscriptionService = {
  create: (data: SubscriptionPackage) =>
    api.post<SubscriptionPackage>('/api/identity/subscriptions/createPackage', data),

  getAll: () =>
    api.get<any>('/api/identity/subscriptions/getAllPackages'),

  getById: (packageId: string) =>
    api.get<SubscriptionPackage>(`/api/identity/subscriptions/getPackageByUuid/${packageId}`),

  getActiveForOrg: (orgUuid: string) =>
    api.get<any>(`/api/identity/subscriptions/organizations/${orgUuid}/active`),

  subscribeOrg: (data: { organizationUuid: string; packageUuid: string; paymentReference?: string }) =>
    api.post<any>('/api/identity/subscriptions/organizations/subscribe', data),
};

