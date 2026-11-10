import { api } from './client';

export interface CommunitySubscriptionPlan {
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
  maxMembers: number;
  maxCoordinators: number;
  limits?: Record<string, number>;
  features: Record<string, boolean>;
}

export interface CommunityEntitlements {
  organizationId: number;
  organizationUuid: string;
  organizationName: string;
  activePlanCode: string;
  activePlanName: string;
  subscriptionStatus: string; // 'ACTIVE', 'EXPIRED', 'TRIAL'
  billingCycle: string;
  startDate: string | null;
  endDate: string | null;
  daysRemaining: number | null;
  isTrialActive: boolean;
  isExpired: boolean;

  // Member Quotas
  maxMembers: number;
  currentMembers: number;
  membersRemaining: number;

  // Coordinator Quotas
  maxCoordinators: number;
  currentCoordinators: number;

  // Features Map
  features: Record<string, boolean>;
}

export interface SubscribeCommunityPlanRequest {
  organizationId?: number;
  organizationUuid?: string;
  planCode: string; // 'COMMUNITY_FREE' | 'COMMUNITY_PRO'
  billingCycle: 'MONTHLY' | 'YEARLY';
  paymentReference?: string;
}

export const CommunitySubscriptionService = {
  /**
   * Fetch all published Community subscription plans.
   */
  async getPlans(): Promise<CommunitySubscriptionPlan[]> {
    try {
      const res = await api.get<any>('/api/identity/subscriptions/community/plans');
      return res.data || [];
    } catch (err) {
      console.warn('[CommunitySubscription] Live plans fetch failed, returning fallbacks', err);
      return [
        {
          planId: 301,
          planUuid: 'community-free-uuid',
          planCode: 'COMMUNITY_FREE',
          name: 'Community Free',
          description: 'Forever free for neighborhood groups & local meetups. Up to 50 members, session RSVPs, community feed & polls.',
          displayOrder: 0,
          monthlyPrice: 0,
          yearlyPrice: 0,
          maxMembers: 50,
          maxCoordinators: 2,
          limits: { MAX_MEMBERS: 50, MAX_COORDINATORS: 2 },
          features: {
            COMMUNITY_SESSIONS: true,
            COMMUNITY_RSVP: true,
            COMMUNITY_FEED: true,
            COMMUNITY_POLLS: true,
            COMMUNITY_EXPENSE_KITTY: false,
            COMMUNITY_LEADERBOARD: false,
            COMMUNITY_MATCH_SCORING: false,
            COMMUNITY_AUTO_ALERTS: false,
          },
        },
        {
          planId: 302,
          planUuid: 'community-pro-uuid',
          planCode: 'COMMUNITY_PRO',
          name: 'Community Pro',
          description: 'Up to 250 members, shared expense kitty & treasury splitter, friendly match scoring, live leaderboards & 5 coordinators.',
          displayOrder: 1,
          monthlyPrice: 199,
          yearlyPrice: 1990,
          maxMembers: 250,
          maxCoordinators: 5,
          limits: { MAX_MEMBERS: 250, MAX_COORDINATORS: 5 },
          features: {
            COMMUNITY_SESSIONS: true,
            COMMUNITY_RSVP: true,
            COMMUNITY_FEED: true,
            COMMUNITY_POLLS: true,
            COMMUNITY_EXPENSE_KITTY: true,
            COMMUNITY_LEADERBOARD: true,
            COMMUNITY_MATCH_SCORING: true,
            COMMUNITY_AUTO_ALERTS: true,
          },
        },
      ];
    }
  },

  /**
   * Fetch real-time community entitlements and usage meters by Community UUID.
   */
  async getEntitlements(communityUuid: string): Promise<CommunityEntitlements> {
    const res = await api.get<any>(`/api/identity/subscriptions/community/${communityUuid}/entitlements`);
    return res.data;
  },

  /**
   * Fetch entitlements by numeric Org ID.
   */
  async getEntitlementsById(orgId: number | string): Promise<CommunityEntitlements> {
    const res = await api.get<any>(`/api/identity/subscriptions/community/by-id/${orgId}/entitlements`);
    return res.data;
  },

  /**
   * Subscribe or upgrade to Community Free or Community Pro (₹199/mo).
   */
  async subscribe(request: SubscribeCommunityPlanRequest): Promise<CommunityEntitlements> {
    const res = await api.post<any>('/api/identity/subscriptions/community/subscribe', request);
    return res.data;
  },

  /**
   * Check if community has member capacity available before accepting new join requests.
   */
  async validateMemberCapacity(communityUuid: string): Promise<boolean> {
    try {
      await api.get<any>(`/api/identity/subscriptions/community/${communityUuid}/validate-member`);
      return true;
    } catch (err) {
      throw err;
    }
  },
};
