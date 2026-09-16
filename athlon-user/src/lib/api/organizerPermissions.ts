import { api } from './client';
import { ApiResponse, UserResponse } from './user';

export type OrganizerAccessLevel = 'MANAGE' | 'VIEW' | 'NONE';

export interface OrganizerOfficial {
  officialUuid: string;
  organizationUuid: string;
  userUuid: string;
  userId: number;
  fullName: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  photo?: string;
  role: string;
  designation?: string;
  assignedTournaments?: string;
  notes?: string;
  isActive: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrganizerRolePermission {
  permissionUuid?: string;
  organizationUuid: string;
  role: string;
  moduleId: string;
  accessLevel: OrganizerAccessLevel;
}

export interface AddOrganizerOfficialPayload {
  organizationUuid: string;
  phone: string;
  role: string;
  designation?: string;
  assignedTournaments?: string;
  notes?: string;
}

export interface UpdateOrganizerOfficialPayload {
  officialUuid: string;
  role?: string;
  designation?: string;
  assignedTournaments?: string;
  notes?: string;
  isActive?: number;
}

export interface SaveOrganizerPermissionsPayload {
  permissions: {
    role: string;
    moduleId: string;
    accessLevel: OrganizerAccessLevel;
  }[];
}

export const ORGANIZER_ROLES_CONFIG = [
  {
    id: 'ADMIN',
    label: 'Organizer Admin / Owner',
    icon: '👑',
    description: 'Full administrative control across all tournaments, finances, settings, and staff.',
    badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30'
  },
  {
    id: 'TOURNAMENT_DIRECTOR',
    label: 'Tournament Director',
    icon: '🏆',
    description: 'Overall event leadership, tournament rules, schedules, fixture approvals, and court flows.',
    badgeClass: 'bg-primary/15 text-primary border-primary/30'
  },
  {
    id: 'CHIEF_UMPIRE',
    label: 'Chief Umpire / Referee',
    icon: '⚖️',
    description: 'Match adjudication, umpire assignments, court schedule execution, and live scoring oversight.',
    badgeClass: 'bg-purple-500/15 text-purple-400 border-purple-500/30'
  },
  {
    id: 'DESK_OFFICIAL',
    label: 'Desk Official / Scorer',
    icon: '📋',
    description: 'Player registration check-in, on-court live scoring, desk announcements, and bracket updates.',
    badgeClass: 'bg-blue-500/15 text-blue-400 border-blue-500/30'
  },
  {
    id: 'FINANCE_OFFICER',
    label: 'Treasury & Finance Officer',
    icon: '💰',
    description: 'Entry fee audit, sponsor receivables, prize pool disburser, and vendor ledger management.',
    badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
  },
  {
    id: 'LOGISTICS_COORDINATOR',
    label: 'Logistics & Equipment Manager',
    icon: '📦',
    description: 'Shuttlecock inventory, court tablets, banners, trophies, kits, and venue setup.',
    badgeClass: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
  },
  {
    id: 'MEDIA_MANAGER',
    label: 'Media & Streaming Producer',
    icon: '📡',
    description: 'Live broadcast cameras, streaming overlays, media coverage, and sponsor graphics.',
    badgeClass: 'bg-rose-500/15 text-rose-400 border-rose-500/30'
  }
];

export const ORGANIZER_MODULES_CONFIG = [
  { id: 'tournaments', label: 'Tournaments Management', icon: '🏆', desc: 'Create, configure, and publish tournaments & categories' },
  { id: 'registrations', label: 'Registrations & Check-in', icon: '🎫', desc: 'Approve entries, player check-in, and slot allocations' },
  { id: 'matches', label: 'Fixtures & Court Schedule', icon: '📅', desc: 'Generate draws, match brackets, and court timing' },
  { id: 'scoring', label: 'Live Scoring & Umpiring', icon: '⚡', desc: 'Digital scoreboard, court score input, and match umpire desk' },
  { id: 'inventory', label: 'Equipment & Shuttles Stock', icon: '🏸', desc: 'Track shuttle tubes, court tablets, nets, and trophies' },
  { id: 'finances', label: 'Treasury & Financial Ledger', icon: '💵', desc: 'Manage tournament revenues, entry fees, and operational costs' },
  { id: 'livestream', label: 'Livestream & Broadcasting', icon: '📡', desc: 'Configure court camera feeds and graphic overlays' },
  { id: 'officials', label: 'Roles & Staff Permissions', icon: '👥', desc: 'Appoint officials and manage module permissions' },
  { id: 'settings', label: 'Organizer Configuration', icon: '⚙️', desc: 'Edit organizer profile, verification, and legal details' }
];

export const OrganizerOfficialService = {
  // Get all appointed officials in organizer workspace
  getOfficials: (orgUuid: string, role?: string) => {
    let url = `/api/identity/organizer/officials/org/${orgUuid}?`;
    if (role && role !== 'ALL') url += `role=${encodeURIComponent(role)}&`;
    return api.get<ApiResponse<OrganizerOfficial[]>>(url);
  },

  // Add official by verified phone number
  addOfficialByPhone: (payload: AddOrganizerOfficialPayload) =>
    api.post<ApiResponse<OrganizerOfficial>>('/api/identity/organizer/officials/add', payload),

  // Update official role / designation / status
  updateOfficial: (payload: UpdateOrganizerOfficialPayload) =>
    api.post<ApiResponse<OrganizerOfficial>>('/api/identity/organizer/officials/update', payload),

  // Revoke official access
  deleteOfficial: (officialUuid: string) =>
    api.post<ApiResponse<void>>(`/api/identity/organizer/officials/delete/${officialUuid}`, {}),

  // Fast phone verification
  lookupUserByPhone: (phone: string) =>
    api.get<ApiResponse<UserResponse>>(`/api/identity/organizer/officials/lookup-user?phone=${encodeURIComponent(phone)}`)
};

export const OrganizerPermissionService = {
  // Get all permissions for organizer workspace
  getOrgPermissions: (orgUuid: string) =>
    api.get<ApiResponse<OrganizerRolePermission[]>>(`/api/identity/organizer/permissions/org/${orgUuid}`),

  // Get permissions for a specific role
  getRolePermissions: (orgUuid: string, role: string) =>
    api.get<ApiResponse<OrganizerRolePermission[]>>(
      `/api/identity/organizer/permissions/org/${orgUuid}/role?role=${encodeURIComponent(role)}`
    ),

  // Save custom permissions
  savePermissions: (orgUuid: string, payload: SaveOrganizerPermissionsPayload) =>
    api.post<ApiResponse<OrganizerRolePermission[]>>(`/api/identity/organizer/permissions/org/${orgUuid}/save`, payload),

  // Reset to default templates
  resetPermissions: (orgUuid: string) =>
    api.post<ApiResponse<OrganizerRolePermission[]>>(`/api/identity/organizer/permissions/org/${orgUuid}/reset`, {})
};
