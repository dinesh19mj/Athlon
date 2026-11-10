import { create } from 'zustand';
import { OrganizationModuleApi, OrganizationModuleConfig } from '@/lib/api/organizationModule';

interface OrgModulesState {
  modules: OrganizationModuleConfig[];
  isLoading: boolean;
  isLoaded: boolean;
  error: string | null;

  fetchModules: (forceRefresh?: boolean) => Promise<OrganizationModuleConfig[]>;
  getModule: (moduleKey: string) => OrganizationModuleConfig | undefined;
  isModuleEnabled: (moduleKey: string) => boolean;
  canCreateWorkspace: (moduleKey: string) => boolean;
  isPricingVisible: (moduleKey: string) => boolean;
  isDiscoveryVisible: (moduleKey: string) => boolean;
}

export const useOrgModulesStore = create<OrgModulesState>((set, get) => ({
  modules: [],
  isLoading: false,
  isLoaded: false,
  error: null,

  fetchModules: async (forceRefresh = false) => {
    if (get().isLoaded && !forceRefresh) {
      return get().modules;
    }

    set({ isLoading: true, error: null });
    try {
      const data = await OrganizationModuleApi.getPublicModules();
      const list = Array.isArray(data) ? data : [];
      set({ modules: list, isLoading: false, isLoaded: true });
      return list;
    } catch (err: any) {
      console.warn('[useOrgModulesStore] Could not fetch public modules:', err);
      set({ isLoading: false, error: err?.message || 'Failed to load modules' });
      return get().modules;
    }
  },

  getModule: (moduleKey: string) => {
    if (!moduleKey) return undefined;
    const key = moduleKey.toUpperCase();
    const normalized = key === 'VENUE' ? 'COURT' : key === 'TOURNAMENT' ? 'ORGANIZER' : key;
    return get().modules.find((m) => m.moduleKey.toUpperCase() === normalized);
  },

  isModuleEnabled: (moduleKey: string) => {
    const mod = get().getModule(moduleKey);
    if (!mod) return true; // Fail-open for backward compatibility
    return mod.isEnabled && mod.status !== 'DISABLED';
  },

  canCreateWorkspace: (moduleKey: string) => {
    const mod = get().getModule(moduleKey);
    if (!mod) return true;
    return mod.isEnabled && mod.allowWorkspaceCreation && mod.status !== 'DISABLED' && mod.status !== 'COMING_SOON';
  },

  isPricingVisible: (moduleKey: string) => {
    const mod = get().getModule(moduleKey);
    if (!mod) return true;
    return mod.isEnabled && mod.showInPricing && mod.status !== 'DISABLED';
  },

  isDiscoveryVisible: (moduleKey: string) => {
    const mod = get().getModule(moduleKey);
    if (!mod) return true;
    return mod.isEnabled && mod.showInDiscovery && mod.status !== 'DISABLED';
  },
}));

