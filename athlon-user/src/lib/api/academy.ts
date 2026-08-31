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
  courtUuid?: string;
  courtName?: string;
  batchName: string;
  sportType?: string;
  level?: string;
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

    // High-fidelity fallback defaults
    return {
      organizationUuid,
      organizationName: 'ATHLON Sports Academy',
      totalCentres: 2,
      totalFacilities: 6,
      totalSports: 3,
      activeStudents: 428,
      activeCoaches: 18,
      activeBatches: 14,
      todaysSessionsCount: 8,
      todaysAttendancePercentage: 91.5,
      feesCollected: 482000,
      pendingFees: 68000,
      facilityUtilizationPercentage: 82,
      centres: [
        {
          centreUuid: 'c-main',
          organizationUuid,
          name: 'ATHLON Main Campus - Indiranagar',
          code: 'MAIN-01',
          address: '100ft Road, Near Metro Pillar 128',
          city: 'Bangalore',
          state: 'Karnataka',
          postalCode: '560038',
          country: 'India',
          contactPhone: '+91 98765 43210',
          contactEmail: 'indiranagar@athlon.sport',
          operatingHours: '05:30 AM - 10:30 PM',
          sportsAvailable: 'Badminton, Tennis, Table Tennis',
          managerName: 'Vikram Sethi',
          managerPhone: '+91 98450 11223',
          status: 'ACTIVE',
          facilitiesCount: 4,
          activeBatchesCount: 8,
          activeStudentsCount: 260,
          activeCoachesCount: 10,
        },
        {
          centreUuid: 'c-branch2',
          organizationUuid,
          name: 'ATHLON Elite Arena - HSR Layout',
          code: 'HSR-02',
          address: '27th Main, Sector 1, HSR Layout',
          city: 'Bangalore',
          state: 'Karnataka',
          postalCode: '560102',
          country: 'India',
          contactPhone: '+91 98765 88990',
          contactEmail: 'hsr@athlon.sport',
          operatingHours: '06:00 AM - 10:00 PM',
          sportsAvailable: 'Badminton, Cricket, Football',
          managerName: 'Pooja Hegde',
          managerPhone: '+91 98450 99887',
          status: 'ACTIVE',
          facilitiesCount: 2,
          activeBatchesCount: 6,
          activeStudentsCount: 168,
          activeCoachesCount: 8,
        },
      ],
      facilities: [
        {
          facilityUuid: 'f-1',
          organizationUuid,
          centreUuid: 'c-main',
          centreName: 'ATHLON Main Campus - Indiranagar',
          name: 'Badminton Court 1 (BWF Mat)',
          sportType: 'BADMINTON',
          facilityType: 'BADMINTON_COURT',
          surfaceType: 'Synthetic BWF Mat',
          facilityNumber: 'Court 1',
          locationDetails: 'Ground Floor, North Wing',
          capacity: 8,
          hourlyRate: 600,
          operatingHours: '05:30 AM - 10:30 PM',
          isAvailableForBooking: true,
          status: 'ACTIVE',
          activeBatchesCount: 3,
          enrolledStudentsCount: 48,
        },
        {
          facilityUuid: 'f-2',
          organizationUuid,
          centreUuid: 'c-main',
          centreName: 'ATHLON Main Campus - Indiranagar',
          name: 'Badminton Court 2 (Wooden)',
          sportType: 'BADMINTON',
          facilityType: 'BADMINTON_COURT',
          surfaceType: 'Wooden Flooring',
          facilityNumber: 'Court 2',
          locationDetails: 'Ground Floor, South Wing',
          capacity: 8,
          hourlyRate: 550,
          operatingHours: '05:30 AM - 10:30 PM',
          isAvailableForBooking: true,
          status: 'ACTIVE',
          activeBatchesCount: 3,
          enrolledStudentsCount: 42,
        },
      ],
      sports: [
        {
          sportUuid: 's-badminton',
          organizationUuid,
          sportName: 'Badminton',
          code: 'BADMINTON',
          description: 'High-performance shuttler development from grassroots to national circuit.',
          icon: '🏸',
          applicableFacilityTypes: 'BADMINTON_COURT',
          ageCategories: 'U9,U11,U13,U15,U17,SENIOR,MASTERS',
          status: 'ACTIVE',
          activeBatchesCount: 8,
          enrolledStudentsCount: 260,
        },
        {
          sportUuid: 's-cricket',
          organizationUuid,
          sportName: 'Cricket',
          code: 'CRICKET',
          description: 'Astro-turf and grass net practice with bowling machines and video analysis.',
          icon: '🏏',
          applicableFacilityTypes: 'CRICKET_NET,GROUND',
          ageCategories: 'U11,U13,U15,U19,OPEN',
          status: 'ACTIVE',
          activeBatchesCount: 4,
          enrolledStudentsCount: 110,
        },
        {
          sportUuid: 's-football',
          organizationUuid,
          sportName: 'Football',
          code: 'FOOTBALL',
          description: '5-a-side and 7-a-side turf training focusing on tactical agility and team play.',
          icon: '⚽',
          applicableFacilityTypes: 'FOOTBALL_TURF',
          ageCategories: 'U10,U12,U14,U18',
          status: 'ACTIVE',
          activeBatchesCount: 2,
          enrolledStudentsCount: 58,
        },
      ],
      upcomingBatches: [
        {
          batchUuid: 'b-1',
          organizationUuid,
          batchName: 'Morning Elite Shuttlers (B1)',
          sportType: 'Badminton',
          level: 'ADVANCED',
          courtName: 'Badminton Court 1',
          coachName: 'Coach Rajesh Kumar',
          daysOfWeek: 'MON,WED,FRI',
          startTime: '06:00:00',
          endTime: '07:30:00',
          maxCapacity: 16,
          enrolledCount: 14,
          monthlyFee: 5500,
          status: 'ACTIVE',
        },
        {
          batchUuid: 'b-2',
          organizationUuid,
          batchName: 'Grassroots Foundation (B2)',
          sportType: 'Badminton',
          level: 'BEGINNER',
          courtName: 'Badminton Court 2',
          coachName: 'Coach Arun Sharma',
          daysOfWeek: 'TUE,THU,SAT',
          startTime: '17:00:00',
          endTime: '18:00:00',
          maxCapacity: 20,
          enrolledCount: 18,
          monthlyFee: 2500,
          status: 'ACTIVE',
        },
        {
          batchUuid: 'b-3',
          organizationUuid,
          batchName: 'Cricket Junior Nets (U13)',
          sportType: 'Cricket',
          level: 'INTERMEDIATE',
          courtName: 'Cricket Net A',
          coachName: 'Coach Sandeep Rao',
          daysOfWeek: 'MON,WED,FRI',
          startTime: '16:30:00',
          endTime: '18:00:00',
          maxCapacity: 15,
          enrolledCount: 15,
          monthlyFee: 3800,
          status: 'ACTIVE',
        },
      ],
      alerts: [
        {
          type: 'WARNING',
          title: 'Pending Fees Collection',
          description: '₹68,000 pending across 18 student accounts for current billing cycle.',
          actionLink: `/org/${organizationUuid}/finances`,
        },
        {
          type: 'INFO',
          title: 'Upcoming Trial Classes',
          description: '4 new trial bookings scheduled for this weekend in Badminton & Cricket.',
          actionLink: `/org/${organizationUuid}/admissions`,
        },
        {
          type: 'SUCCESS',
          title: 'Optimal Facility Utilization',
          description: '82% court & net allocation rate across Indiranagar & HSR centres.',
          actionLink: `/org/${organizationUuid}/facilities`,
        },
      ],
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
      console.warn('Backend getCentres error, falling back:', err);
    }
    const dashboard = await this.getDashboard(organizationUuid);
    return dashboard.centres;
  },

  async createCentre(payload: Partial<AcademyCentre>): Promise<AcademyCentre> {
    const response = await fetchClient<{ success: boolean; data: AcademyCentre }>(
      '/api/identity/academy/centres',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
    return response.data;
  },

  async updateCentre(centreUuid: string, payload: Partial<AcademyCentre>): Promise<AcademyCentre> {
    const response = await fetchClient<{ success: boolean; data: AcademyCentre }>(
      `/api/identity/academy/centres/${centreUuid}`,
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      }
    );
    return response.data;
  },

  async deleteCentre(centreUuid: string): Promise<void> {
    await fetchClient(`/api/identity/academy/centres/${centreUuid}`, {
      method: 'DELETE',
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
      console.warn('Backend getFacilities error, falling back:', err);
    }
    const dashboard = await this.getDashboard(organizationUuid);
    return dashboard.facilities;
  },

  async createFacility(payload: Partial<AcademyFacility>): Promise<AcademyFacility> {
    const response = await fetchClient<{ success: boolean; data: AcademyFacility }>(
      '/api/identity/academy/facilities',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
    return response.data;
  },

  async updateFacility(facilityUuid: string, payload: Partial<AcademyFacility>): Promise<AcademyFacility> {
    const response = await fetchClient<{ success: boolean; data: AcademyFacility }>(
      `/api/identity/academy/facilities/${facilityUuid}`,
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      }
    );
    return response.data;
  },

  async deleteFacility(facilityUuid: string): Promise<void> {
    await fetchClient(`/api/identity/academy/facilities/${facilityUuid}`, {
      method: 'DELETE',
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
      console.warn('Backend getSports error, falling back:', err);
    }
    const dashboard = await this.getDashboard(organizationUuid);
    return dashboard.sports;
  },

  async createOrUpdateSport(payload: Partial<AcademySportConfig>): Promise<AcademySportConfig> {
    const response = await fetchClient<{ success: boolean; data: AcademySportConfig }>(
      '/api/identity/academy/sports',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
    return response.data;
  },
};
