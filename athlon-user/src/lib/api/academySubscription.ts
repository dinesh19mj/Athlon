import { api } from './client';

export interface AcademySubscriptionPlan {
  planId: number;
  planUuid: string;
  planCode: string;
  name: string;
  description: string;
  displayOrder: number;
  versionId?: number;
  versionNumber?: number;
  monthlyPrice: number;
  yearlyPrice: number;
  maxStudents: number;
  maxCoaches: number;
  maxCentres: number;
  limits?: Record<string, number>;
  features: Record<string, boolean>;
}

export interface AcademyAddonSummary {
  addonId: number;
  addonType: string;
  quantity: number;
  endDate: string;
  isActive: boolean;
}

export interface AcademyEntitlements {
  organizationId: number;
  organizationUuid: string;
  organizationName: string;
  activePlanCode: string;
  activePlanName: string;
  subscriptionStatus: string;
  billingCycle: string;
  startDate: string | null;
  endDate: string | null;
  daysRemaining: number;
  
  // Effective Ceilings
  maxStudents: number;
  currentStudents: number;
  studentsRemaining: number;

  maxCoaches: number;
  currentCoaches: number;
  coachesRemaining: number;

  maxCentres: number;
  currentCentres: number;
  centresRemaining: number;

  // Addons & Features
  activeAddons: AcademyAddonSummary[];
  features: Record<string, boolean>;
}

export interface SubscribeAcademyPlanRequest {
  organizationId?: number;
  organizationUuid?: string;
  planCode: string;
  billingCycle: 'MONTHLY' | 'YEARLY';
  paymentReference?: string;
}

export interface PurchaseAcademyAddonRequest {
  organizationId?: number;
  organizationUuid?: string;
  addonType: 'STUDENT_PACK' | 'CAMPUS' | 'COACH';
  quantity: number;
  durationMonths?: number;
  paymentReference?: string;
}

export const AcademySubscriptionService = {
  /**
   * Fetch all published Academy subscription plans.
   */
  async getPlans(): Promise<AcademySubscriptionPlan[]> {
    try {
      const res = await api.get<any>('/api/identity/subscriptions/academy/plans');
      return res.data || [];
    } catch (err) {
      try {
        const fallbackRes = await api.get<any>('/api/identity/subscriptions/plans/academy');
        return fallbackRes.data || [];
      } catch {
        throw err;
      }
    }
  },

  /**
   * Fetch real-time academy entitlements and usage meters by Org UUID.
   */
  async getEntitlements(orgUuid: string): Promise<AcademyEntitlements> {
    const res = await api.get<any>(`/api/identity/subscriptions/academy/${orgUuid}/entitlements`);
    return res.data;
  },

  /**
   * Fetch real-time academy entitlements by numeric Org ID.
   */
  async getEntitlementsById(orgId: number): Promise<AcademyEntitlements> {
    const res = await api.get<any>(`/api/identity/subscriptions/academy/by-id/${orgId}/entitlements`);
    return res.data;
  },

  /**
   * Subscribe or upgrade to an academy plan.
   */
  async subscribe(request: SubscribeAcademyPlanRequest): Promise<AcademyEntitlements> {
    const res = await api.post<any>('/api/identity/subscriptions/academy/subscribe', request);
    return res.data;
  },

  /**
   * Purchase a capacity booster pack (+50 Students, +1 Campus, +1 Coach).
   */
  async purchaseAddon(request: PurchaseAcademyAddonRequest): Promise<AcademyEntitlements> {
    const res = await api.post<any>('/api/identity/subscriptions/academy/addons/purchase', request);
    return res.data;
  },

  /**
   * Validate student admission capacity before admitting a new trainee.
   */
  async validateAdmission(orgUuid: string): Promise<{ valid: boolean; current: number; max: number }> {
    const res = await api.get<any>(`/api/identity/subscriptions/academy/validate-admission?orgUuid=${orgUuid}`);
    return res.data;
  },

  /**
   * Validate coach seat capacity before adding staff.
   */
  async validateCoach(orgUuid: string): Promise<{ valid: boolean; current: number; max: number }> {
    const res = await api.get<any>(`/api/identity/subscriptions/academy/validate-coach?orgUuid=${orgUuid}`);
    return res.data;
  },

  /**
   * Validate centre branch capacity before creating a campus.
   */
  async validateCentre(orgUuid: string): Promise<{ valid: boolean; current: number; max: number }> {
    const res = await api.get<any>(`/api/identity/subscriptions/academy/validate-centre?orgUuid=${orgUuid}`);
    return res.data;
  },
};

