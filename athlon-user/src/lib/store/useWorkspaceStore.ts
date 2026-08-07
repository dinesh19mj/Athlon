import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type WorkspaceType = 'PERSONAL' | 'ACADEMY' | 'ASSOCIATION' | 'CLUB' | 'COURT' | 'ORGANIZER';

export interface Organization {
  id: string;
  name: string;
  type: WorkspaceType;
  logo?: string;
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
    }),
    {
      name: 'workspace-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
