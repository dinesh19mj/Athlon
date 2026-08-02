import { api } from './client';

export interface SubscriptionPackage {
  packageId?: number;
  name: string;
  workspaceType: string;
  period: string;
  price: number;
  features: string;
  isActive?: number;
}

export const SubscriptionService = {
  create: (data: SubscriptionPackage) => 
    api.post<SubscriptionPackage>('/api/identity/subscriptions/packages', data),
    
  getAll: () => 
    api.get<SubscriptionPackage[]>('/api/identity/subscriptions/packages'),
    
  getById: (packageId: string) => 
    api.get<SubscriptionPackage>(`/api/identity/subscriptions/packages/${packageId}`)
};
