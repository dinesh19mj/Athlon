import { create } from 'zustand';
import {
  OrganizerCreditWallet,
  OrganizerSubscriptionService,
  TournamentSubscriptionPlan,
} from '@/lib/api/organizerSubscription';
import { SubscriptionService } from '@/lib/api/subscription';

export interface OrganizerPaywallState {
  isOpen: boolean;
  orgId: string;
  title: string;
  description: string;
  featureCode?: string;
  limitCode?: string;
  limitLabel?: string;
  currentUsage?: number;
  maxAllowed?: number;
  isQuotaLimit?: boolean;
  isCreditExhausted?: boolean;
  creditType?: 'TOURNAMENT_CREDIT' | 'AUCTION_ACTIVATION_CREDIT';
  recommendedPlan?: TournamentSubscriptionPlan | null;
}

interface OrganizerEntitlementsStore {
  walletByOrg: Record<string, OrganizerCreditWallet>;
  plans: TournamentSubscriptionPlan[];
  loadingByOrg: Record<string, boolean>;
  plansLoaded: boolean;
  paywall: OrganizerPaywallState;

  fetchEntitlements: (orgId: string, force?: boolean) => Promise<OrganizerCreditWallet | null>;
  loadEntitlements: (orgId: string, force?: boolean) => Promise<OrganizerCreditWallet | null>;
  refreshWallet: (orgId: string) => Promise<OrganizerCreditWallet | null>;

  getWallet: (orgId: string) => OrganizerCreditWallet | null;
  hasFeature: (orgId: string, featureCode: string) => boolean;
  getLimit: (orgId: string, limitCode: string, fallback?: number) => number;
  isWithinLimit: (orgId: string, limitCode: string, currentCount: number) => boolean;
  hasTournamentCredits: (orgId: string) => boolean;
  isAuctionAllowed: (orgId: string) => boolean;

  getRecommendedPlanForFeature: (featureCode: string) => TournamentSubscriptionPlan | null;
  getRecommendedPlanForLimit: (limitCode: string, neededValue: number) => TournamentSubscriptionPlan | null;

  openFeaturePaywall: (orgId: string, featureCode: string, title: string, description?: string) => void;
  openQuotaPaywall: (
    orgId: string,
    limitCode: string,
    arg3: string | number,
    arg4: number | string,
    neededValue?: number
  ) => void;
  openCreditPaywall: (orgId: string, creditType?: 'TOURNAMENT_CREDIT' | 'AUCTION_ACTIVATION_CREDIT') => void;
  closePaywall: () => void;
}

const initialPaywallState: OrganizerPaywallState = {
  isOpen: false,
  orgId: '',
  title: '',
  description: '',
};

export const useOrganizerEntitlementsStore = create<OrganizerEntitlementsStore>((set, get) => ({
  walletByOrg: {},
  plans: [],
  loadingByOrg: {},
  plansLoaded: false,
  paywall: initialPaywallState,

  fetchEntitlements: async (orgId: string, force = false) => {
    if (!orgId) return null;
    const state = get();
    if (!force && state.walletByOrg[orgId] && state.plansLoaded) {
      return state.walletByOrg[orgId];
    }
    if (state.loadingByOrg[orgId]) {
      return state.walletByOrg[orgId] || null;
    }

    set((s) => ({ loadingByOrg: { ...s.loadingByOrg, [orgId]: true } }));
    try {
      const [walletRes, plansRes] = await Promise.all([
        OrganizerSubscriptionService.getWallet(orgId).catch(() => null),
        !state.plansLoaded || force
          ? OrganizerSubscriptionService.getPlans().catch(() => null)
          : Promise.resolve(null),
      ]);

      let wallet = walletRes?.data || null;
      const sortedPlans = plansRes?.data
        ? [...plansRes.data].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
        : get().plans;

      // Fallback if the backend wallet endpoint failed due to an uninitialized wallet in a read-only transaction
      if (!wallet && sortedPlans.length > 0) {
        const activeSubRes = await SubscriptionService.getActiveForOrg(orgId).catch(() => null);
        const activeSub = (activeSubRes as any)?.data || activeSubRes;
        const pkgUuid = activeSub?.subscriptionPackage?.uuid || activeSub?.planUuid;
        const pkgName = activeSub?.subscriptionPackage?.name || activeSub?.planName;

        const matchedPlan =
          sortedPlans.find(
            (p) =>
              (pkgUuid && p.planUuid === pkgUuid) ||
              (pkgName && p.name.toLowerCase() === String(pkgName).toLowerCase())
          ) ||
          sortedPlans.find((p) => p.planCode === 'TOURNAMENT_FREE') ||
          sortedPlans[0];

        if (matchedPlan) {
          wallet = {
            accountId: 0,
            organizationId: activeSub?.organizationId || 0,
            organizationUuid: orgId,
            organizationName: '',
            activeTierCode: matchedPlan.planCode,
            activeTierName: matchedPlan.name,
            tournamentCreditsAvailable: matchedPlan.tournamentCredits ?? matchedPlan.limits?.TOURNAMENT_CREDITS ?? 1,
            tournamentCreditsReserved: 0,
            auctionCreditsAvailable: matchedPlan.includedAuctionCredits ?? matchedPlan.limits?.INCLUDED_AUCTION_CREDITS ?? 0,
            auctionCreditsReserved: 0,
            tierLimits: matchedPlan.limits || {},
            tierFeatures: matchedPlan.features || {},
            activeGrants: [],
            updatedAt: new Date().toISOString(),
          };
        }
      }

      set((s) => ({
        walletByOrg: wallet ? { ...s.walletByOrg, [orgId]: wallet } : s.walletByOrg,
        plans: sortedPlans,
        plansLoaded: sortedPlans.length > 0 || s.plansLoaded,
        loadingByOrg: { ...s.loadingByOrg, [orgId]: false },
      }));

      return wallet;
    } catch {
      set((s) => ({ loadingByOrg: { ...s.loadingByOrg, [orgId]: false } }));
      return null;
    }
  },

  loadEntitlements: async (orgId: string, force = false) => {
    return get().fetchEntitlements(orgId, force);
  },

  refreshWallet: async (orgId: string) => {
    return get().fetchEntitlements(orgId, true);
  },

  getWallet: (orgId: string) => {
    return get().walletByOrg[orgId] || null;
  },

  hasFeature: (orgId: string, featureCode: string) => {
    const wallet = get().walletByOrg[orgId];
    if (!wallet || !wallet.tierFeatures) {
      // Check matching plan in catalog if tierFeatures wasn't populated
      const activePlan = get().plans.find((p) => p.planCode === wallet?.activeTierCode);
      if (activePlan?.features) {
        return activePlan.features[featureCode] === true;
      }
      return true; // Optimistic while loading
    }
    return wallet.tierFeatures[featureCode] === true;
  },

  getLimit: (orgId: string, limitCode: string, fallback = 0) => {
    const wallet = get().walletByOrg[orgId];
    if (wallet?.tierLimits && typeof wallet.tierLimits[limitCode] === 'number') {
      return wallet.tierLimits[limitCode];
    }
    const activePlan = get().plans.find((p) => p.planCode === wallet?.activeTierCode);
    if (activePlan?.limits && typeof activePlan.limits[limitCode] === 'number') {
      return activePlan.limits[limitCode];
    }
    return fallback;
  },

  isWithinLimit: (orgId: string, limitCode: string, currentCount: number) => {
    const max = get().getLimit(orgId, limitCode, 999999);
    return currentCount < max;
  },

  hasTournamentCredits: (orgId: string) => {
    const wallet = get().walletByOrg[orgId];
    if (!wallet) return true;
    return (wallet.tournamentCreditsAvailable ?? 0) > 0;
  },

  isAuctionAllowed: (orgId: string) => {
    return get().getLimit(orgId, 'AUCTION_ALLOWED', 0) >= 1 || get().hasFeature(orgId, 'LIVE_AUCTION_ELIGIBLE');
  },

  getRecommendedPlanForFeature: (featureCode: string) => {
    const { plans } = get();
    if (!plans.length) return null;
    return (
      plans.find((p) => p.features && p.features[featureCode] === true) ||
      plans[plans.length - 1] ||
      null
    );
  },

  getRecommendedPlanForLimit: (limitCode: string, neededValue: number) => {
    const { plans } = get();
    if (!plans.length) return null;
    return (
      plans.find((p) => p.limits && (p.limits[limitCode] ?? 0) >= neededValue) ||
      plans[plans.length - 1] ||
      null
    );
  },

  openFeaturePaywall: (orgId: string, featureCode: string, title: string, description?: string) => {
    const recommendedPlan = get().getRecommendedPlanForFeature(featureCode);
    const wallet = get().walletByOrg[orgId];
    set({
      paywall: {
        isOpen: true,
        orgId,
        title,
        description:
          description ||
          `${title} is not included in your current ${wallet?.activeTierName || 'active'} plan. Upgrade to ${
            recommendedPlan?.name || 'a higher tier'
          } to unlock this capability dynamically.`,
        featureCode,
        isQuotaLimit: false,
        isCreditExhausted: false,
        recommendedPlan,
      },
    });
  },

  openQuotaPaywall: (
    orgId: string,
    limitCode: string,
    arg3: string | number,
    arg4: number | string,
    neededValue?: number
  ) => {
    const limitLabel = typeof arg3 === 'string' ? arg3 : String(arg4);
    const currentUsage = typeof arg3 === 'number' ? arg3 : Number(arg4);
    const maxAllowed = get().getLimit(orgId, limitCode, currentUsage);
    const targetNeeded = neededValue ?? maxAllowed + 1;
    const recommendedPlan = get().getRecommendedPlanForLimit(limitCode, targetNeeded);
    const wallet = get().walletByOrg[orgId];

    set({
      paywall: {
        isOpen: true,
        orgId,
        title: `${limitLabel} Limit Reached`,
        description: `Your ${wallet?.activeTierName || 'current'} plan allows up to ${maxAllowed} ${limitLabel.toLowerCase()}. Upgrade to ${
          recommendedPlan?.name || 'a higher pack'
        } to expand your capacity up to ${recommendedPlan?.limits?.[limitCode] ?? 'higher'} ${limitLabel.toLowerCase()}.`,
        limitCode,
        limitLabel,
        currentUsage,
        maxAllowed,
        isQuotaLimit: true,
        isCreditExhausted: false,
        recommendedPlan,
      },
    });
  },

  openCreditPaywall: (orgId: string, creditType = 'TOURNAMENT_CREDIT') => {
    const { plans, walletByOrg } = get();
    const wallet = walletByOrg[orgId];
    const isAuction = creditType === 'AUCTION_ACTIVATION_CREDIT';
    const recommendedPlan = isAuction
      ? plans.find((p) => (p.limits?.['AUCTION_ALLOWED'] ?? 0) >= 1 && p.planCode !== wallet?.activeTierCode) ||
        plans.find((p) => (p.limits?.['AUCTION_ALLOWED'] ?? 0) >= 1) ||
        null
      : plans.find((p) => p.packagePrice > 0 && p.planCode === wallet?.activeTierCode) ||
        plans.find((p) => p.packagePrice > 0) ||
        null;

    set({
      paywall: {
        isOpen: true,
        orgId,
        title: isAuction ? 'Live Auction Credit Required' : '0 Tournament Credits Remaining',
        description: isAuction
          ? 'Activating the real-time Franchise Bidding Console requires 1 Live Auction Activation Credit (₹499/event) on a Professional or Business tier.'
          : `You have exhausted your available Tournament Publication Credits on ${
              wallet?.activeTierName || 'your current plan'
            }. Top up or upgrade your pack to launch new tournaments.`,
        isQuotaLimit: false,
        isCreditExhausted: true,
        creditType,
        recommendedPlan,
      },
    });
  },

  closePaywall: () => {
    set({ paywall: initialPaywallState });
  },
}));

