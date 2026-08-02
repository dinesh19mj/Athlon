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
    api.post<SubscriptionPackage>('/subscriptionPackage/create', data),
    
  getAll: () => 
    api.get<SubscriptionPackage[]>('/subscriptionPackage/getAll'),
    
  getById: (packageId: number) => 
    api.get<SubscriptionPackage>(`/subscriptionPackage/getById/${packageId}`)
};
