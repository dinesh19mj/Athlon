import { api, fetchClient } from './client';

export interface AcademyCentre {
  centreId?: number;
  centreUuid: string;
  organizationId?: number;
  organizationUuid: string;
  name: string;
  code?: string;
  address?: string;
  city?: string;
  state?: string;
  district?: string;
  postalCode?: string;
  country?: string;
  contactPhone?: string;
  contactEmail?: string;
  mapLocationUrl?: string;
  operatingHours?: string;
  sportsAvailable?: string;
  managerName?: string;
  managerPhone?: string;
  status: 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE';
  facilitiesCount?: number;
  activeBatchesCount?: number;
  activeStudentsCount?: number;
  activeCoachesCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AcademyFacility {
  facilityId?: number;
  facilityUuid: string;
  organizationId?: number;
  organizationUuid: string;
  centreUuid?: string;
  centreName?: string;
  name: string;
  sportType: string;
  facilityType: string;
  surfaceType?: string;
  facilityNumber?: string;
  locationDetails?: string;
  capacity?: number;
  hourlyRate?: number;
  operatingHours?: string;
  isAvailableForBooking?: boolean;
  status: 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE';
  activeBatchesCount?: number;
  enrolledStudentsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AcademySportConfig {
  sportId?: number;
  sportUuid: string;
  organizationUuid: string;
  sportName: string;
  code?: string;
  description?: string;
  icon?: string;
  applicableFacilityTypes?: string;
  ageCategories?: string;
  status: 'ACTIVE' | 'INACTIVE';
  activeBatchesCount?: number;
  enrolledStudentsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AcademyBatchItem {
  batchId?: number;
  batchUuid: string;
  organizationUuid: string;
  centreUuid?: string;
  centreName?: string;
  facilityUuid?: string;
  courtUuid?: string;
  courtName?: string;
  batchName: string;
  sportType?: string;
  level?: string;
  ageCategory?: string;
  programFocus?: string;
  coachUuid?: string;
  coachName?: string;
  daysOfWeek?: string;
  startTime?: string;
  endTime?: string;
  maxCapacity?: number;
  enrolledCount?: number;
  monthlyFee?: number;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DashboardAlertItem {
  type: 'WARNING' | 'INFO' | 'SUCCESS' | 'ERROR';
  title: string;
  description: string;
  actionLink?: string;
}

export interface AcademyDashboardSummary {
  organizationUuid: string;
  organizationName: string;
  totalCentres: number;
  totalFacilities: number;
  totalSports: number;
  activeStudents: number;
  activeCoaches: number;
  activeBatches: number;
  todaysSessionsCount: number;
  todaysAttendancePercentage: number;
  feesCollected: number;
  pendingFees: number;
  facilityUtilizationPercentage: number;
  centres: AcademyCentre[];
  facilities: AcademyFacility[];
  sports: AcademySportConfig[];
  upcomingBatches: AcademyBatchItem[];
  alerts: DashboardAlertItem[];
}

export const AcademyService = {
  // ─── Dashboard Summary ──────────────────────────────────────────────────
  async getDashboard(organizationUuid: string): Promise<AcademyDashboardSummary> {
    try {
      const response = await fetchClient<{ success: boolean; data: AcademyDashboardSummary }>(
        `/api/identity/academy/dashboard/org/${organizationUuid}`
      );
      if (response && response.data) {
        return response.data;
      }
    } catch (err) {
      console.warn('Backend dashboard API fallback:', err);
    }

    // Real-data empty defaults (no hardcoded static mock campuses)
    return {
      organizationUuid,
      organizationName: 'Academy Workspace',
      totalCentres: 0,
      totalFacilities: 0,
      totalSports: 0,
      activeStudents: 0,
      activeCoaches: 0,
      activeBatches: 0,
      todaysSessionsCount: 0,
      todaysAttendancePercentage: 0,
      feesCollected: 0,
      pendingFees: 0,
      facilityUtilizationPercentage: 0,
      centres: [],
      facilities: [],
      sports: [],
      upcomingBatches: [],
      alerts: [],
    };
  },

  // ─── Multi-Centre Operations ─────────────────────────────────────────────
  async getCentres(organizationUuid: string): Promise<AcademyCentre[]> {
    try {
      const response = await fetchClient<{ success: boolean; data: AcademyCentre[] }>(
        `/api/identity/academy/centres/org/${organizationUuid}`
      );
      if (response && response.data) {
        return response.data;
      }
    } catch (err) {
      console.warn('Backend getCentres error:', err);
    }
    return [];
  },

  async createCentre(payload: Partial<AcademyCentre>): Promise<AcademyCentre> {
    const response = await fetchClient<{ success: boolean; data: AcademyCentre }>(
      '/api/identity/academy/centres/create',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
    return response.data;
  },

  async updateCentre(centreUuid: string, payload: Partial<AcademyCentre>): Promise<AcademyCentre> {
    const response = await fetchClient<{ success: boolean; data: AcademyCentre }>(
      `/api/identity/academy/centres/update/${centreUuid}`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
    return response.data;
  },

  async deleteCentre(centreUuid: string): Promise<void> {
    await fetchClient(`/api/identity/academy/centres/delete/${centreUuid}`, {
      method: 'POST',
    });
  },

  // ─── Multi-Facility Operations ───────────────────────────────────────────
  async getFacilities(organizationUuid: string, centreUuid?: string): Promise<AcademyFacility[]> {
    try {
      const query = centreUuid ? `?centreUuid=${centreUuid}` : '';
      const response = await fetchClient<{ success: boolean; data: AcademyFacility[] }>(
        `/api/identity/academy/facilities/org/${organizationUuid}${query}`
      );
      if (response && response.data) {
        return response.data;
      }
    } catch (err) {
      console.warn('Backend getFacilities error:', err);
    }
    return [];
  },

  async createFacility(payload: Partial<AcademyFacility>): Promise<AcademyFacility> {
    const response = await fetchClient<{ success: boolean; data: AcademyFacility }>(
      '/api/identity/academy/facilities/create',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
    return response.data;
  },

  async updateFacility(facilityUuid: string, payload: Partial<AcademyFacility>): Promise<AcademyFacility> {
    const response = await fetchClient<{ success: boolean; data: AcademyFacility }>(
      `/api/identity/academy/facilities/update/${facilityUuid}`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
    return response.data;
  },

  async deleteFacility(facilityUuid: string): Promise<void> {
    await fetchClient(`/api/identity/academy/facilities/delete/${facilityUuid}`, {
      method: 'POST',
    });
  },

  // ─── Multi-Sport Configurations ──────────────────────────────────────────
  async getSports(organizationUuid: string): Promise<AcademySportConfig[]> {
    try {
      const response = await fetchClient<{ success: boolean; data: AcademySportConfig[] }>(
        `/api/identity/academy/sports/org/${organizationUuid}`
      );
      if (response && response.data) {
        return response.data;
      }
    } catch (err) {
      console.warn('Backend getSports error:', err);
    }
    return [];
  },

  async createOrUpdateSport(payload: Partial<AcademySportConfig>): Promise<AcademySportConfig> {
    const response = await fetchClient<{ success: boolean; data: AcademySportConfig }>(
      '/api/identity/academy/sports/save',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
    return response.data;
  },

  // ─── Coaching Batches ─────────────────────────────────────────────────────
  async getBatches(organizationUuid: string, status?: string): Promise<AcademyBatchItem[]> {
    try {
      const query = status ? `?status=${status}` : '';
      const response = await fetchClient<{ success: boolean; data: AcademyBatchItem[] }>(
        `/api/identity/academy/batches/org/${organizationUuid}${query}`
      );
      if (response && response.data) {
        return response.data;
      }
    } catch (err) {
      console.warn('Backend getBatches error:', err);
    }
    return [];
  },

  async createBatch(payload: Partial<AcademyBatchItem>): Promise<AcademyBatchItem> {
    const response = await fetchClient<{ success: boolean; data: AcademyBatchItem }>(
      '/api/identity/academy/batches/create',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
    return response.data;
  },

  async updateBatch(payload: Partial<AcademyBatchItem> & { batchUuid: string }): Promise<AcademyBatchItem> {
    const response = await fetchClient<{ success: boolean; data: AcademyBatchItem }>(
      '/api/identity/academy/batches/update',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
    return response.data;
  },

  async deleteBatch(batchUuid: string): Promise<void> {
    await fetchClient(`/api/identity/academy/batches/delete/${batchUuid}`, {
      method: 'POST',
    });
  },
};
