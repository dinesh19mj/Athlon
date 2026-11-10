import { api } from './client';

export interface ClubSubscriptionPlan {
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
  trialDays: number;
  maxMembers: number;
  maxManagers: number;
  limits?: Record<string, number>;
  features: Record<string, boolean>;
}

export interface ClubEntitlements {
  organizationId: number;
  organizationUuid: string;
  organizationName: string;
  activePlanCode: string;
  activePlanName: string;
  subscriptionStatus: string; // 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED'
  billingCycle: string;
  startDate: string | null;
  endDate: string | null;
  daysRemaining: number;
  isTrialActive: boolean;
  isExpired: boolean;

  // Capacity quotas
  maxMembers: number;
  currentMembers: number;
  maxManagers: number;
  currentManagers: number;

  // Features map
  features: Record<string, boolean>;
}

export interface SubscribeClubPlanRequest {
  organizationId?: number;
  organizationUuid?: string;
  billingCycle: 'MONTHLY' | 'YEARLY';
  paymentReference?: string;
}

export const ClubSubscriptionService = {
  /**
   * Fetch published Club subscription plans (Single Plan: CLUB_ACCESS_PASS).
   */
  async getPlans(): Promise<ClubSubscriptionPlan[]> {
    try {
      const res = await api.get<any>('/api/identity/subscriptions/club/plans');
      return res.data || [];
    } catch (err) {
      console.warn('[ClubSubscription] Live plans fetch failed, returning fallback', err);
      return [
        {
          planId: 101,
          planUuid: 'club-access-pass-uuid',
          planCode: 'CLUB_ACCESS_PASS',
          name: 'Club Batch Pass',
          description: 'Single all-inclusive pass for court batch management, attendance, kitty & leaderboards.',
          displayOrder: 1,
          monthlyPrice: 249,
          yearlyPrice: 2490,
          trialDays: 30,
          maxMembers: 100,
          maxManagers: 3,
          features: {
            CLUB_BATCH_MANAGEMENT: true,
            CLUB_ATTENDANCE: true,
            CLUB_FEE_TRACKING: true,
            CLUB_EXPENSE_KITTY: true,
            CLUB_LEADERBOARD: true,
            CLUB_MATCH_SCORING: true,
            CLUB_INVENTORY: true,
          },
        },
      ];
    }
  },

  /**
   * Fetch real-time club entitlements and usage quotas by Org UUID.
   */
  async getEntitlements(orgUuid: string): Promise<ClubEntitlements> {
    const res = await api.get<any>(`/api/identity/subscriptions/club/${orgUuid}/entitlements`);
    return res.data;
  },

  /**
   * Fetch entitlements by numeric Org ID.
   */
  async getEntitlementsById(orgId: number | string): Promise<ClubEntitlements> {
    const res = await api.get<any>(`/api/identity/subscriptions/club/by-id/${orgId}/entitlements`);
    return res.data;
  },

  /**
   * Subscribe or renew the Club Access Pass (₹249/month or ₹2,490/year).
   */
  async subscribe(request: SubscribeClubPlanRequest): Promise<ClubEntitlements> {
    const res = await api.post<any>('/api/identity/subscriptions/club/subscribe', request);
    return res.data;
  },

  /**
   * Check if club has member capacity available before adding a new member.
   */
  async validateMemberCapacity(orgId: number | string): Promise<boolean> {
    try {
      await api.get<any>(`/api/identity/subscriptions/club/${orgId}/validate-member`);
      return true;
    } catch (err) {
      throw err;
    }
  },
};

