import { api } from './client';
import { ApiResponse, UserResponse } from './user';

export type VenueAccessLevel = 'MANAGE' | 'VIEW' | 'NONE';

export interface VenueStaff {
  staffUuid: string;
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
  assignedFacilities?: string;
  notes?: string;
  isActive: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface VenueRolePermission {
  permissionUuid?: string;
  organizationUuid: string;
  role: string;
  moduleId: string;
  accessLevel: VenueAccessLevel;
}

export interface AddVenueStaffPayload {
  organizationUuid: string;
  phone: string;
  role: string;
  designation?: string;
  assignedFacilities?: string;
  notes?: string;
}

export interface UpdateVenueStaffPayload {
  staffUuid: string;
  role?: string;
  designation?: string;
  assignedFacilities?: string;
  notes?: string;
  isActive?: number;
}

export interface SaveVenuePermissionsPayload {
  permissions: {
    role: string;
    moduleId: string;
    accessLevel: VenueAccessLevel;
  }[];
}

export const VENUE_ROLES_CONFIG = [
  {
    id: 'ADMIN',
    label: 'Venue Owner / Facility Admin',
    icon: '👑',
    description: 'Unrestricted control across all courts, schedules, staff, finances, tariffs, and settings.',
    badgeClass: 'bg-amber-500/15 text-amber-500 border-amber-500/30'
  },
  {
    id: 'VENUE_MANAGER',
    label: 'General Venue Manager',
    icon: '🏟️',
    description: 'Operational leadership, court timetable, staff allocations, customer relations, and pricing.',
    badgeClass: 'bg-primary/15 text-primary border-primary/30'
  },
  {
    id: 'FRONT_DESK',
    label: 'Front Desk & Reception',
    icon: '📋',
    description: 'Walk-in slot reservations, customer check-ins, spot payments, and live court board oversight.',
    badgeClass: 'bg-blue-500/15 text-blue-500 border-blue-500/30'
  },
  {
    id: 'COURT_SUPERVISOR',
    label: 'Court & Turf Supervisor',
    icon: '🏸',
    description: 'Court readiness inspection, lighting control, equipment handovers, and transition tracking.',
    badgeClass: 'bg-purple-500/15 text-purple-500 border-purple-500/30'
  },
  {
    id: 'FINANCE_MANAGER',
    label: 'Accounts & Billing Manager',
    icon: '💰',
    description: 'Daily collection reconciliation, GST invoice audit, customer refunds, and online payouts.',
    badgeClass: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
  },
  {
    id: 'MAINTENANCE_STAFF',
    label: 'Facility & Turf Caretaker',
    icon: '🛠️',
    description: 'Court repair logs, maintenance holds, equipment stock maintenance, and turf upkeep.',
    badgeClass: 'bg-slate-500/15 text-slate-400 border-slate-500/30'
  }
];

export const VENUE_MODULES_CONFIG = [
  {
    id: 'courts',
    name: 'Courts & Facilities',
    category: 'Infrastructure',
    icon: '🏟️',
    description: 'Court configuration, turf setup, surface types, amenities, and facility parameters.'
  },
  {
    id: 'calendar',
    name: 'Court Calendar & Slots',
    category: 'Operations',
    icon: '📅',
    description: 'Real-time court schedule grid, slot timetable, and dynamic availability.'
  },
  {
    id: 'bookings',
    name: 'Bookings & Walk-in Ledger',
    category: 'Operations',
    icon: '🎟️',
    description: 'Customer reservation ledger, booking status updates, player check-in, and cancellations.'
  },
  {
    id: 'blocks',
    name: 'Court Blocks & Maintenance',
    category: 'Operations',
    icon: '🛡️',
    description: 'Temporary or recurring court holds for tournaments, maintenance, coaching, or VIP blocks.'
  },
  {
    id: 'pricing',
    name: 'Dynamic Tariffs & Rates',
    category: 'Commercials',
    icon: '🏷️',
    description: 'Hourly court rates, peak/non-peak pricing, weekend tariffs, and special promotional discounts.'
  },
  {
    id: 'finances',
    name: 'Revenue & Accounts Ledger',
    category: 'Commercials',
    icon: '💳',
    description: 'Daily revenue collections, payment breakdown, refunds, and payout transaction ledgers.'
  },
  {
    id: 'inventory',
    name: 'Equipment & Rental Gear',
    category: 'Supplies',
    icon: '📦',
    description: 'Rental racquets, shuttles, footballs, tokens, kiosk items, and asset tracking.'
  },
  {
    id: 'staff',
    name: 'Staff & Roles Management',
    category: 'Administration',
    icon: '👥',
    description: 'Add venue team members, assign operational roles, and manage permissions.'
  },
  {
    id: 'settings',
    name: 'Venue & Profile Settings',
    category: 'Administration',
    icon: '⚙️',
    description: 'Venue profile details, contact numbers, map location, amenities, and workspace configuration.'
  }
];

export const VENUE_DEFAULT_PERMISSIONS: Record<string, Record<string, VenueAccessLevel>> = {
  ADMIN: {
    courts: 'MANAGE',
    calendar: 'MANAGE',
    bookings: 'MANAGE',
    blocks: 'MANAGE',
    pricing: 'MANAGE',
    finances: 'MANAGE',
    inventory: 'MANAGE',
    staff: 'MANAGE',
    settings: 'MANAGE'
  },
  VENUE_MANAGER: {
    courts: 'MANAGE',
    calendar: 'MANAGE',
    bookings: 'MANAGE',
    blocks: 'MANAGE',
    pricing: 'MANAGE',
    finances: 'MANAGE',
    inventory: 'MANAGE',
    staff: 'MANAGE',
    settings: 'VIEW'
  },
  FRONT_DESK: {
    courts: 'VIEW',
    calendar: 'MANAGE',
    bookings: 'MANAGE',
    blocks: 'VIEW',
    pricing: 'VIEW',
    finances: 'VIEW',
    inventory: 'VIEW',
    staff: 'NONE',
    settings: 'NONE'
  },
  COURT_SUPERVISOR: {
    courts: 'VIEW',
    calendar: 'VIEW',
    bookings: 'VIEW',
    blocks: 'MANAGE',
    pricing: 'NONE',
    finances: 'NONE',
    inventory: 'MANAGE',
    staff: 'NONE',
    settings: 'NONE'
  },
  FINANCE_MANAGER: {
    courts: 'VIEW',
    calendar: 'VIEW',
    bookings: 'VIEW',
    blocks: 'NONE',
    pricing: 'MANAGE',
    finances: 'MANAGE',
    inventory: 'VIEW',
    staff: 'NONE',
    settings: 'NONE'
  },
  MAINTENANCE_STAFF: {
    courts: 'VIEW',
    calendar: 'NONE',
    bookings: 'NONE',
    blocks: 'MANAGE',
    pricing: 'NONE',
    finances: 'NONE',
    inventory: 'MANAGE',
    staff: 'NONE',
    settings: 'NONE'
  }
};

export const VenueStaffService = {
  // Get all staff members in venue workspace
  getStaff: (orgUuid: string, role?: string) => {
    let url = `/api/identity/venue/staff/org/${orgUuid}?`;
    if (role && role !== 'ALL') url += `role=${encodeURIComponent(role)}&`;
    return api.get<ApiResponse<VenueStaff[]>>(url);
  },

  // Add staff member by verified phone number
  addStaffByPhone: (payload: AddVenueStaffPayload) =>
    api.post<ApiResponse<VenueStaff>>('/api/identity/venue/staff/add', payload),

  // Update staff role / designation / status
  updateStaff: (payload: UpdateVenueStaffPayload) =>
    api.put<ApiResponse<VenueStaff>>('/api/identity/venue/staff/update', payload),

  // Revoke staff access
  deleteStaff: (staffUuid: string) =>
    api.delete<ApiResponse<string>>(`/api/identity/venue/staff/${staffUuid}`),

  // Fast phone verification
  lookupUserByPhone: (phone: string) =>
    api.get<ApiResponse<UserResponse>>(`/api/identity/venue/staff/verify-phone?phone=${encodeURIComponent(phone)}`)
};

export const VenuePermissionService = {
  // Get all permissions for venue workspace
  getOrgPermissions: (orgUuid: string) =>
    api.get<ApiResponse<VenueRolePermission[]>>(`/api/identity/venue/permissions/org/${orgUuid}`),

  // Get permissions for a specific role
  getRolePermissions: (orgUuid: string, role: string) =>
    api.get<ApiResponse<VenueRolePermission[]>>(
      `/api/identity/venue/permissions/org/${orgUuid}/role?role=${encodeURIComponent(role)}`
    ),

  // Save custom permissions
  savePermissions: (orgUuid: string, payload: SaveVenuePermissionsPayload) =>
    api.post<ApiResponse<VenueRolePermission[]>>(`/api/identity/venue/permissions/org/${orgUuid}/save`, payload),

  // Reset to default templates
  resetPermissions: (orgUuid: string) =>
    api.post<ApiResponse<VenueRolePermission[]>>(`/api/identity/venue/permissions/org/${orgUuid}/reset`, {})
};
