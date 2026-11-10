import { api } from './client';

export interface CoachSubscriptionPlan {
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
  maxTrainees: number;
  limits?: Record<string, number>;
  features: Record<string, boolean>;
}

export interface CoachEntitlements {
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

  // Trainee Quotas
  maxTrainees: number;
  currentTrainees: number;
  traineesRemaining: number;

  // Features Map
  features: Record<string, boolean>;
}

export interface SubscribeCoachPlanRequest {
  organizationId?: number;
  organizationUuid?: string;
  planCode: string; // 'COACH_STARTER' | 'COACH_PRO'
  billingCycle: 'MONTHLY' | 'YEARLY';
  paymentReference?: string;
}

export const CoachSubscriptionService = {
  /**
   * Fetch all published Coach subscription plans.
   */
  async getPlans(): Promise<CoachSubscriptionPlan[]> {
    try {
      const res = await api.get<any>('/api/identity/subscriptions/coach/plans');
      return res.data || [];
    } catch (err) {
      console.warn('[CoachSubscription] Live plans fetch failed, returning fallbacks', err);
      return [
        {
          planId: 201,
          planUuid: 'coach-starter-uuid',
          planCode: 'COACH_STARTER',
          name: 'Coach Starter',
          description: 'Manage personal coaching calendar, slot bookings, student roster & cash/digital fee logging. 30 days free trial, then ₹299/mo.',
          displayOrder: 0,
          monthlyPrice: 299,
          yearlyPrice: 2990,
          trialDays: 30,
          maxTrainees: 15,
          limits: { MAX_TRAINEES: 15, TRIAL_DAYS: 30, MAX_PACKAGES: 3 },
          features: {
            COACH_CALENDAR: true,
            COACH_ATTENDANCE: true,
            COACH_FEE_TRACKING: true,
            COACH_PROFILE: true,
            COACH_DRILL_CARDS: false,
            COACH_AUTO_REMINDERS: false,
            COACH_VERIFIED_BADGE: false,
          },
        },
        {
          planId: 202,
          planUuid: 'coach-pro-uuid',
          planCode: 'COACH_PRO',
          name: 'Coach Professional',
          description: 'Up to 50 trainees, trainee drill cards, fitness test benchmarks, automated fee payment reminders & verified discovery badge.',
          displayOrder: 1,
          monthlyPrice: 499,
          yearlyPrice: 4990,
          trialDays: 0,
          maxTrainees: 50,
          limits: { MAX_TRAINEES: 50, TRIAL_DAYS: 0, MAX_PACKAGES: 9999 },
          features: {
            COACH_CALENDAR: true,
            COACH_ATTENDANCE: true,
            COACH_FEE_TRACKING: true,
            COACH_PROFILE: true,
            COACH_DRILL_CARDS: true,
            COACH_AUTO_REMINDERS: true,
            COACH_VERIFIED_BADGE: true,
            COACH_VIDEO_ANALYSIS: true,
          },
        },
      ];
    }
  },

  /**
   * Fetch real-time coach entitlements and usage meters by Org UUID.
   */
  async getEntitlements(orgUuid: string): Promise<CoachEntitlements> {
    const res = await api.get<any>(`/api/identity/subscriptions/coach/${orgUuid}/entitlements`);
    return res.data;
  },

  /**
   * Fetch entitlements by numeric Org ID.
   */
  async getEntitlementsById(orgId: number | string): Promise<CoachEntitlements> {
    const res = await api.get<any>(`/api/identity/subscriptions/coach/by-id/${orgId}/entitlements`);
    return res.data;
  },

  /**
   * Subscribe or upgrade to Coach Starter (₹299/mo) or Coach Pro (₹499/mo).
   */
  async subscribe(request: SubscribeCoachPlanRequest): Promise<CoachEntitlements> {
    const res = await api.post<any>('/api/identity/subscriptions/coach/subscribe', request);
    return res.data;
  },

  /**
   * Check if coach has trainee capacity available before enrolling a new trainee.
   */
  async validateTraineeCapacity(orgUuid: string): Promise<boolean> {
    try {
      await api.get<any>(`/api/identity/subscriptions/coach/${orgUuid}/validate-trainee`);
      return true;
    } catch (err) {
      throw err;
    }
  },
};

