import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type WorkspaceType = 'PERSONAL' | 'ACADEMY' | 'ASSOCIATION' | 'CLUB' | 'COURT' | 'ORGANIZER';

export interface Organization {
  id: string;
  name: string;
  type: WorkspaceType;
  logo?: string;
  role?: string; // 'ADMIN' | 'OWNER' | 'MANAGER' | 'MEMBER' | 'COACH' | 'STUDENT' | 'ATHLETE'
}

export interface PersonalProfile {
  id: string;
  name: string;
  athlonId: string;
  avatar?: string;
}

interface WorkspaceState {
  // Current Context
  activeWorkspaceId: string | 'PERSONAL';
  
  // Data
  personalProfile: PersonalProfile | null;
  organizations: Organization[];

  // Actions
  setActiveWorkspace: (id: string | 'PERSONAL') => void;
  setOrganizations: (orgs: Organization[]) => void;
  addOrganization: (org: Organization) => void;
  setPersonalProfile: (profile: PersonalProfile) => void;
  updateOrganization: (id: string, updates: Partial<Organization>) => void;
  
  // Helpers
  getActiveOrganization: () => Organization | undefined;
  isOrgAdmin: (orgId?: string) => boolean;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      activeWorkspaceId: 'PERSONAL',
      personalProfile: null,
      organizations: [],

      setActiveWorkspace: (id) => set({ activeWorkspaceId: id }),
      setOrganizations: (orgs) => set({ organizations: orgs }),
      addOrganization: (org) => set((state) => ({ organizations: [...state.organizations, org] })),
      setPersonalProfile: (profile) => set({ personalProfile: profile }),
      updateOrganization: (id, updates) => set((state) => ({
        organizations: state.organizations.map((org) => org.id === id ? { ...org, ...updates } : org)
      })),

      getActiveOrganization: () => {
        const { activeWorkspaceId, organizations } = get();
        if (activeWorkspaceId === 'PERSONAL') return undefined;
        return organizations.find((org) => org.id === activeWorkspaceId);
      },

      isOrgAdmin: (orgId) => {
        const { activeWorkspaceId, organizations } = get();
        const targetId = orgId || activeWorkspaceId;
        if (targetId === 'PERSONAL') return true;
        const org = organizations.find((o) => o.id === targetId);
        if (!org) return false;
        const role = (org.role || 'ADMIN').toUpperCase();
        return role === 'ADMIN' || role === 'OWNER' || role === 'MANAGER';
      },
    }),
    {
      name: 'workspace-storage',
      version: 2,
      storage: createJSONStorage(() => localStorage),
    }
  )
);
