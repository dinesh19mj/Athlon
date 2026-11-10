import { api } from './client';

export type ModuleStatus = 'ACTIVE' | 'BETA' | 'COMING_SOON' | 'DISABLED';
export type BadgeVariant = 'emerald' | 'blue' | 'amber' | 'purple' | 'slate';

export interface OrganizationModuleConfig {
  moduleKey: string;
  displayName: string;
  categoryLabel: string;
  description?: string;
  iconName?: string;
  status: ModuleStatus;
  isEnabled: boolean;
  isSystemCore: boolean;
  allowWorkspaceCreation: boolean;
  showInPricing: boolean;
  showInDiscovery: boolean;
  badgeText?: string;
  badgeVariant?: BadgeVariant;
  routePrefix?: string;
  displayOrder: number;
  targetLaunchDate?: string | null;
  maintenanceMessage?: string | null;
  updatedAt?: string;
}

export interface CreateOrgModulePayload {
  moduleKey: string;
  displayName: string;
  categoryLabel: string;
  description?: string;
  iconName?: string;
  status?: ModuleStatus;
  isEnabled?: boolean;
  allowWorkspaceCreation?: boolean;
  showInPricing?: boolean;
  showInDiscovery?: boolean;
  badgeText?: string;
  badgeVariant?: BadgeVariant;
  routePrefix?: string;
  displayOrder?: number;
  targetLaunchDate?: string | null;
  maintenanceMessage?: string | null;
}

export interface UpdateOrgModulePayload {
  displayName?: string;
  categoryLabel?: string;
  description?: string;
  iconName?: string;
  status?: ModuleStatus;
  isEnabled?: boolean;
  allowWorkspaceCreation?: boolean;
  showInPricing?: boolean;
  showInDiscovery?: boolean;
  badgeText?: string;
  badgeVariant?: BadgeVariant;
  routePrefix?: string;
  displayOrder?: number;
  targetLaunchDate?: string | null;
  maintenanceMessage?: string | null;
}

export const OrganizationModuleApi = {
  // Public Endpoint: used by frontend store, navigation, pricing & discovery
  getPublicModules: async (): Promise<OrganizationModuleConfig[]> => {
    const res = await api.get<any>('/api/identity/config/organization-modules');
    return res?.data || res || [];
  },

  // Admin Endpoints: used by /admin/organization-modules
  getAllAdmin: async (): Promise<OrganizationModuleConfig[]> => {
    const res = await api.get<any>('/api/admin/organization-modules');
    return res?.data || res || [];
  },

  getByKeyAdmin: async (key: string): Promise<OrganizationModuleConfig> => {
    const res = await api.get<any>(`/api/admin/organization-modules/${encodeURIComponent(key)}`);
    return res?.data || res;
  },

  create: async (payload: CreateOrgModulePayload): Promise<OrganizationModuleConfig> => {
    const res = await api.post<any>('/api/admin/organization-modules', payload);
    return res?.data || res;
  },

  update: async (key: string, payload: UpdateOrgModulePayload): Promise<OrganizationModuleConfig> => {
    const res = await api.put<any>(`/api/admin/organization-modules/${encodeURIComponent(key)}`, payload);
    return res?.data || res;
  },

  toggleStatus: async (key: string): Promise<OrganizationModuleConfig> => {
    const res = await api.post<any>(`/api/admin/organization-modules/${encodeURIComponent(key)}/toggle`, {});
    return res?.data || res;
  },

  delete: async (key: string): Promise<void> => {
    await api.delete<any>(`/api/admin/organization-modules/${encodeURIComponent(key)}`);
  },

  reorder: async (moduleKeys: string[]): Promise<OrganizationModuleConfig[]> => {
    const res = await api.post<any>('/api/admin/organization-modules/reorder', moduleKeys);
    return res?.data || res || [];
  },
};

