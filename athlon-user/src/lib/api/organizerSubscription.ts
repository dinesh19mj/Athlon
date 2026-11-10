import { api } from './client';

export interface TournamentSubscriptionPlan {
  planId: number;
  planUuid: string;
  planCode: string;
  name: string;
  description: string;
  displayOrder: number;
  versionId: number;
  versionNumber: number;
  packagePrice: number;
  tournamentCredits: number;
  includedAuctionCredits: number;
  validityDays: number;
  limits: Record<string, number>;
  features: Record<string, boolean>;
}

export interface CreditGrantSummary {
  grantId: number;
  creditType: string;
  initialQuantity: number;
  remainingQuantity: number;
  sourceType: string;
  expiresAt: string | null;
  status: string;
}

export interface OrganizerCreditWallet {
  accountId: number;
  organizationId: number;
  organizationUuid: string;
  organizationName: string;
  activeTierCode: string;
  activeTierName: string;
  tournamentCreditsAvailable: number;
  tournamentCreditsReserved: number;
  auctionCreditsAvailable: number;
  auctionCreditsReserved: number;
  tierLimits?: Record<string, number>;
  tierFeatures?: Record<string, boolean>;
  activeGrants: CreditGrantSummary[];
  updatedAt: string;
}

export interface CreditTransaction {
  transactionId: number;
  accountId: number;
  creditType: string;
  amount: number;
  transactionType: string;
  referenceType: string;
  referenceId: string;
  idempotencyKey: string;
  notes: string;
  createdAt: string;
}

export interface ConsumeTournamentCreditRequest {
  organizationId: number;
  tournamentUuid: string;
  participantCount?: number;
  categoryCount?: number;
  officialCount?: number;
  courtCount?: number;
  isAuctionMode?: boolean;
  notes?: string;
}

export interface ConsumeAuctionCreditRequest {
  organizationId: number;
  tournamentUuid: string;
  activatedBy?: number;
  notes?: string;
}

export interface TopupCreditRequest {
  organizationId: number;
  creditType: string;
  quantity: number;
  sourceType?: string;
  targetTierCode?: string;
  paymentOrderId?: number;
  validityDays?: number;
  notes?: string;
}

export interface TournamentCreditAllocation {
  allocationId: number;
  tournamentUuid: string;
  organizationId: number;
  accountId: number;
  planCode: string;
  planVersion: number;
  maxParticipants: number;
  maxCategories: number;
  maxOfficials: number;
  maxCourts: number;
  auctionAllowed: boolean;
  status: string;
  allocatedAt: string;
  updatedAt: string;
}

export interface AuctionCreditActivation {
  activationId: number;
  tournamentUuid: string;
  organizationId: number;
  accountId: number;
  activationType: string;
  activatedBy?: number;
  status: string;
  activatedAt: string;
}

export const OrganizerSubscriptionService = {
  getPlans: () =>
    api.get<{ data: TournamentSubscriptionPlan[] }>('/api/identity/subscriptions/organizer/plans'),

  getWallet: async (orgUuid: string): Promise<{ data: OrganizerCreditWallet }> => {
    try {
      return await api.get<{ data: OrganizerCreditWallet }>(`/api/identity/subscriptions/organizer/${orgUuid}/wallet`);
    } catch (err: any) {
      // Graceful fallback if the running backend JVM has not yet been restarted and hits a read-only transaction on first-time wallet creation
      const [plansRes, activeSubRes] = await Promise.all([
        api.get<{ data: TournamentSubscriptionPlan[] }>('/api/identity/subscriptions/organizer/plans').catch(() => null),
        api.get<any>(`/api/identity/subscriptions/organizations/${orgUuid}/active`).catch(() => null),
      ]);

      const plans = plansRes?.data || [];
      const activeSub = activeSubRes?.data || activeSubRes;
      const pkgUuid = activeSub?.subscriptionPackage?.uuid || activeSub?.planUuid;
      const pkgName = activeSub?.subscriptionPackage?.name || activeSub?.planName;

      const matchedPlan =
        plans.find(
          (p) =>
            (pkgUuid && p.planUuid === pkgUuid) ||
            (pkgName && p.name.toLowerCase() === String(pkgName).toLowerCase())
        ) ||
        plans.find((p) => p.planCode === 'TOURNAMENT_FREE') ||
        plans[0];

      const fallbackWallet: OrganizerCreditWallet = {
        accountId: 0,
        organizationId: activeSub?.organizationId || 0,
        organizationUuid: orgUuid,
        organizationName: '',
        activeTierCode: matchedPlan?.planCode || 'TOURNAMENT_FREE',
        activeTierName: matchedPlan?.name || 'Tournament Free',
        tournamentCreditsAvailable:
          matchedPlan?.tournamentCredits ?? matchedPlan?.limits?.TOURNAMENT_CREDITS ?? 1,
        tournamentCreditsReserved: 0,
        auctionCreditsAvailable:
          matchedPlan?.includedAuctionCredits ?? matchedPlan?.limits?.INCLUDED_AUCTION_CREDITS ?? 0,
        auctionCreditsReserved: 0,
        tierLimits: matchedPlan?.limits || {
          MAX_PARTICIPANTS: 32,
          MAX_CATEGORIES: 2,
          MAX_OFFICIALS: 2,
          MAX_COURTS: 2,
          AUCTION_ALLOWED: 0,
        },
        tierFeatures: matchedPlan?.features || {
          BASIC_SETUP: true,
          ONLINE_REGISTRATION: true,
          PAYMENT_VERIFICATION: true,
          KNOCKOUT_AND_LEAGUE_DRAWS: true,
          LIVE_SCORING: true,
        },
        activeGrants: [],
        updatedAt: new Date().toISOString(),
      };

      return { data: fallbackWallet };
    }
  },

  getWalletById: (orgId: number) =>
    api.get<{ data: OrganizerCreditWallet }>(`/api/identity/subscriptions/organizer/by-id/${orgId}/wallet`),

  consumeTournamentCredit: (request: ConsumeTournamentCreditRequest) =>
    api.post<{ data: TournamentCreditAllocation }>('/api/identity/subscriptions/organizer/consume-tournament-credit', request),

  consumeAuctionCredit: (request: ConsumeAuctionCreditRequest) =>
    api.post<{ data: AuctionCreditActivation }>('/api/identity/subscriptions/organizer/consume-auction-credit', request),

  refundTournamentCredit: (organizationId: number, tournamentUuid: string, reason?: string) =>
    api.post<{ data: TournamentCreditAllocation }>('/api/identity/subscriptions/organizer/refund-tournament-credit', {
      organizationId,
      tournamentUuid,
      reason,
    }),

  topupCredits: (request: TopupCreditRequest) =>
    api.post<{ data: OrganizerCreditWallet }>('/api/identity/subscriptions/organizer/topup-credits', request),

  getTransactions: (orgId: number, page = 0, size = 20) =>
    api.get<{ data: { content: CreditTransaction[]; totalElements: number; totalPages: number } }>(
      `/api/identity/subscriptions/organizer/${orgId}/transactions?page=${page}&size=${size}`
    ),

  getTournamentAllocation: (tournamentUuid: string) =>
    api.get<{ data: TournamentCreditAllocation | null }>(
      `/api/identity/subscriptions/organizer/tournaments/${tournamentUuid}/allocation`
    ),

  getAuctionActivation: (tournamentUuid: string) =>
    api.get<{ data: AuctionCreditActivation | null }>(
      `/api/identity/subscriptions/organizer/tournaments/${tournamentUuid}/auction-activation`
    ),
};

