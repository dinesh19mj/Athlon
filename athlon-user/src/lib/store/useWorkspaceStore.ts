import { create } from 'zustand';

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
  
  // Helpers
  getActiveOrganization: () => Organization | undefined;
}

// Mock Data for initial testing
const MOCK_PROFILE: PersonalProfile = {
  id: 'usr_123',
  name: 'John Doe',
  athlonId: 'ATH-004523',
  avatar: '/umpire.png', // Temporary placeholder
};

const MOCK_ORGS: Organization[] = [
  { id: 'org_elite', name: 'Elite Academy', type: 'ACADEMY' },
  { id: 'org_kba', name: 'Kerala Badminton Association', type: 'ASSOCIATION' },
  { id: 'org_weekend', name: 'Weekend Smashers Club', type: 'CLUB' },
];

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  activeWorkspaceId: 'PERSONAL',
  personalProfile: MOCK_PROFILE,
  organizations: MOCK_ORGS,

  setActiveWorkspace: (id) => set({ activeWorkspaceId: id }),
  setOrganizations: (orgs) => set({ organizations: orgs }),
  addOrganization: (org) => set((state) => ({ organizations: [...state.organizations, org] })),
  setPersonalProfile: (profile) => set({ personalProfile: profile }),

  getActiveOrganization: () => {
    const { activeWorkspaceId, organizations } = get();
    if (activeWorkspaceId === 'PERSONAL') return undefined;
    return organizations.find((org) => org.id === activeWorkspaceId);
  },
}));
