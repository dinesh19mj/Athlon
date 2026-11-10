import { create } from 'zustand';
import {
  SubscriptionService,
  VenueEntitlementSummary,
  VenueSubscriptionPlan,
} from '@/lib/api/subscription';

export interface VenuePaywallState {
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
  recommendedPlan?: VenueSubscriptionPlan | null;
}

interface VenueEntitlementsStore {
  entitlementsByOrg: Record<string, VenueEntitlementSummary>;
  plans: VenueSubscriptionPlan[];
  loadingByOrg: Record<string, boolean>;
  plansLoaded: boolean;
  paywall: VenuePaywallState;

  fetchEntitlements: (orgId: string, force?: boolean) => Promise<VenueEntitlementSummary | null>;
  loadEntitlements: (orgId: string, force?: boolean) => Promise<VenueEntitlementSummary | null>;
  refreshEntitlements: (orgId: string) => Promise<VenueEntitlementSummary | null>;

  getEntitlements: (orgId: string) => VenueEntitlementSummary | null;
  hasFeature: (orgId: string, featureCode: string) => boolean;
  getLimit: (orgId: string, limitCode: string, fallback?: number) => number;
  getUsage: (orgId: string, usageCode: string) => number;
  canAddFacility: (orgId: string, currentCount?: number) => boolean;
  canAddStaff: (orgId: string, currentCount?: number) => boolean;
  canAddVenue: (orgId: string, currentCount?: number) => boolean;

  getRecommendedPlanForFeature: (featureCode: string) => VenueSubscriptionPlan | null;
  getRecommendedPlanForLimit: (limitCode: string, neededValue: number) => VenueSubscriptionPlan | null;

  openFeaturePaywall: (orgId: string, featureCode: string, title: string, description?: string) => void;
  openQuotaPaywall: (
    orgId: string,
    limitCode: string,
    arg3: string | number,
    arg4: number | string,
    neededValue?: number
  ) => void;
  closePaywall: () => void;
}

const initialPaywallState: VenuePaywallState = {
  isOpen: false,
  orgId: '',
  title: '',
  description: '',
};

const DEFAULT_FALLBACK_PLANS: VenueSubscriptionPlan[] = [
  {
    planId: 1,
    planUuid: 'venue-free-plan',
    planCode: 'VENUE_FREE',
    name: 'Venue Free',
    description: 'Basic public listing and 1 bookable court for grassroots venue operators',
    displayOrder: 0,
    versionId: 1,
    versionNumber: 1,
    marketplaceCommissionRate: 8.0,
    monthlyPrice: 0,
    yearlyPrice: 0,
    limits: { MAX_VENUES: 1, MAX_FACILITIES: 1, MAX_STAFF: 1 },
    features: {
      VENUE_FACILITY_MANAGEMENT: true,
      VENUE_DYNAMIC_PRICING: false,
      VENUE_RECURRING_BOOKINGS: false,
      VENUE_ADVANCED_CRM: false,
      VENUE_MEMBERSHIPS: false,
      VENUE_PREPAID_PACKAGES: false,
      VENUE_COUPONS: false,
      VENUE_LOYALTY: false,
      VENUE_QR_CHECKIN: false,
      VENUE_POS: false,
      VENUE_EQUIPMENT_RENTAL: false,
      VENUE_INVENTORY: false,
      VENUE_ADVANCED_INVENTORY: false,
      VENUE_EXPENSES: false,
      VENUE_ADVANCED_ANALYTICS: false,
      VENUE_STAFF_ATTENDANCE: false,
      VENUE_PAYROLL: false,
      VENUE_ASSET_MANAGEMENT: false,
      VENUE_CLEANING: false,
      VENUE_MULTI_BRANCH: false,
      VENUE_API_ACCESS: false,
    },
  },
  {
    planId: 2,
    planUuid: 'venue-starter-plan',
    planCode: 'VENUE_STARTER',
    name: 'Venue Starter',
    description: 'Full operational suite with dynamic pricing and recurring series for single facilities',
    displayOrder: 1,
    versionId: 1,
    versionNumber: 1,
    marketplaceCommissionRate: 5.0,
    monthlyPrice: 499,
    yearlyPrice: 4999,
    limits: { MAX_VENUES: 1, MAX_FACILITIES: 3, MAX_STAFF: 2 },
    features: {
      VENUE_FACILITY_MANAGEMENT: true,
      VENUE_DYNAMIC_PRICING: true,
      VENUE_RECURRING_BOOKINGS: true,
      VENUE_ADVANCED_CRM: false,
      VENUE_MEMBERSHIPS: false,
      VENUE_PREPAID_PACKAGES: false,
      VENUE_COUPONS: false,
      VENUE_LOYALTY: false,
      VENUE_QR_CHECKIN: false,
      VENUE_POS: false,
      VENUE_EQUIPMENT_RENTAL: false,
      VENUE_INVENTORY: false,
      VENUE_ADVANCED_INVENTORY: false,
      VENUE_EXPENSES: false,
      VENUE_ADVANCED_ANALYTICS: false,
      VENUE_STAFF_ATTENDANCE: false,
      VENUE_PAYROLL: false,
      VENUE_ASSET_MANAGEMENT: false,
      VENUE_CLEANING: false,
      VENUE_MULTI_BRANCH: false,
      VENUE_API_ACCESS: false,
    },
  },
  {
    planId: 3,
    planUuid: 'venue-pro-plan',
    planCode: 'VENUE_PRO',
    name: 'Venue Professional',
    description: 'Advanced player CRM, membership passes, POS kiosk, equipment rentals, and promotional coupons',
    displayOrder: 2,
    versionId: 1,
    versionNumber: 1,
    marketplaceCommissionRate: 3.0,
    monthlyPrice: 999,
    yearlyPrice: 9999,
    limits: { MAX_VENUES: 1, MAX_FACILITIES: 10, MAX_STAFF: 5 },
    features: {
      VENUE_FACILITY_MANAGEMENT: true,
      VENUE_DYNAMIC_PRICING: true,
      VENUE_RECURRING_BOOKINGS: true,
      VENUE_ADVANCED_CRM: true,
      VENUE_MEMBERSHIPS: true,
      VENUE_PREPAID_PACKAGES: true,
      VENUE_COUPONS: true,
      VENUE_LOYALTY: true,
      VENUE_QR_CHECKIN: true,
      VENUE_POS: true,
      VENUE_EQUIPMENT_RENTAL: true,
      VENUE_INVENTORY: true,
      VENUE_ADVANCED_INVENTORY: false,
      VENUE_EXPENSES: true,
      VENUE_ADVANCED_ANALYTICS: true,
      VENUE_STAFF_ATTENDANCE: false,
      VENUE_PAYROLL: false,
      VENUE_ASSET_MANAGEMENT: false,
      VENUE_CLEANING: false,
      VENUE_MULTI_BRANCH: false,
      VENUE_API_ACCESS: false,
    },
  },
  {
    planId: 4,
    planUuid: 'venue-business-plan',
    planCode: 'VENUE_BUSINESS',
    name: 'Venue Business',
    description: 'Multi-branch operations, staff shifts, attendance & payroll, and inter-branch transfers',
    displayOrder: 3,
    versionId: 1,
    versionNumber: 1,
    marketplaceCommissionRate: 1.5,
    monthlyPrice: 2499,
    yearlyPrice: 24999,
    limits: { MAX_VENUES: 3, MAX_FACILITIES: 25, MAX_STAFF: 15 },
    features: {
      VENUE_FACILITY_MANAGEMENT: true,
      VENUE_DYNAMIC_PRICING: true,
      VENUE_RECURRING_BOOKINGS: true,
      VENUE_ADVANCED_CRM: true,
      VENUE_MEMBERSHIPS: true,
      VENUE_PREPAID_PACKAGES: true,
      VENUE_COUPONS: true,
      VENUE_LOYALTY: true,
      VENUE_QR_CHECKIN: true,
      VENUE_POS: true,
      VENUE_EQUIPMENT_RENTAL: true,
      VENUE_INVENTORY: true,
      VENUE_ADVANCED_INVENTORY: true,
      VENUE_EXPENSES: true,
      VENUE_ADVANCED_ANALYTICS: true,
      VENUE_STAFF_ATTENDANCE: true,
      VENUE_PAYROLL: true,
      VENUE_ASSET_MANAGEMENT: true,
      VENUE_CLEANING: true,
      VENUE_MULTI_BRANCH: true,
      VENUE_API_ACCESS: false,
    },
  },
];

export const useVenueEntitlementsStore = create<VenueEntitlementsStore>((set, get) => ({
  entitlementsByOrg: {},
  plans: DEFAULT_FALLBACK_PLANS,
  loadingByOrg: {},
  plansLoaded: false,
  paywall: initialPaywallState,

  fetchEntitlements: async (orgId: string, force = false) => {
    if (!orgId) return null;
    const state = get();
    if (!force && state.entitlementsByOrg[orgId] && state.plansLoaded) {
      return state.entitlementsByOrg[orgId];
    }
    if (state.loadingByOrg[orgId] && !force) {
      return state.entitlementsByOrg[orgId] || null;
    }

    set((s) => ({ loadingByOrg: { ...s.loadingByOrg, [orgId]: true } }));
    try {
      const [entRes, plansRes] = await Promise.all([
        SubscriptionService.getVenueEntitlements(orgId).catch(() => null),
        !state.plansLoaded || force
          ? SubscriptionService.getVenuePlans().catch(() => null)
          : Promise.resolve(null),
      ]);

      const rawPlans = plansRes as any;
      const extractedPlans: VenueSubscriptionPlan[] = Array.isArray(rawPlans?.data?.data)
        ? rawPlans.data.data
        : Array.isArray(rawPlans?.data)
        ? rawPlans.data
        : Array.isArray(rawPlans)
        ? rawPlans
        : [];

      const sortedPlans =
        extractedPlans.length > 0
          ? [...extractedPlans].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
          : get().plans.length > 0
          ? get().plans
          : DEFAULT_FALLBACK_PLANS;

      const rawEnt = entRes as any;
      let extractedEnt: VenueEntitlementSummary | null =
        rawEnt?.data?.data &&
        typeof rawEnt.data.data === 'object' &&
        ('planName' in rawEnt.data.data || 'planCode' in rawEnt.data.data)
          ? rawEnt.data.data
          : rawEnt?.data &&
            typeof rawEnt.data === 'object' &&
            ('planName' in rawEnt.data || 'planCode' in rawEnt.data)
          ? rawEnt.data
          : rawEnt && typeof rawEnt === 'object' && ('planName' in rawEnt || 'planCode' in rawEnt)
          ? rawEnt
          : null;

      if (!extractedEnt) {
        const defaultPlan = sortedPlans[0] || DEFAULT_FALLBACK_PLANS[0];
        extractedEnt = {
          planCode: defaultPlan.planCode,
          planName: defaultPlan.name,
          billingCycle: 'MONTHLY',
          status: 'ACTIVE',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 3650 * 24 * 60 * 60 * 1000).toISOString(),
          daysRemaining: 3650,
          marketplaceCommissionRate: defaultPlan.marketplaceCommissionRate,
          limits: defaultPlan.limits,
          usage: { VENUES_USED: 1, FACILITIES_USED: 1, STAFF_USED: 1 },
          features: defaultPlan.features,
          isExpired: false,
          canAddFacility: true,
          canAddStaff: true,
          canAddVenue: false,
        };
      }

      set((s) => ({
        entitlementsByOrg: extractedEnt
          ? { ...s.entitlementsByOrg, [orgId]: extractedEnt }
          : s.entitlementsByOrg,
        plans: sortedPlans,
        plansLoaded: extractedPlans.length > 0 || s.plansLoaded,
        loadingByOrg: { ...s.loadingByOrg, [orgId]: false },
      }));

      return extractedEnt;
    } catch {
      set((s) => ({ loadingByOrg: { ...s.loadingByOrg, [orgId]: false } }));
      return get().entitlementsByOrg[orgId] || null;
    }
  },

  loadEntitlements: async (orgId: string, force = false) => {
    return get().fetchEntitlements(orgId, force);
  },

  refreshEntitlements: async (orgId: string) => {
    return get().fetchEntitlements(orgId, true);
  },

  getEntitlements: (orgId: string) => {
    return get().entitlementsByOrg[orgId] || null;
  },

  hasFeature: (orgId: string, featureCode: string) => {
    const ent = get().entitlementsByOrg[orgId];
    if (!ent || !ent.features) {
      const activePlan = get().plans.find((p) => p.planCode === ent?.planCode);
      if (activePlan?.features) {
        return activePlan.features[featureCode] === true;
      }
      return true; // Optimistic while loading
    }
    return ent.features[featureCode] === true;
  },

  getLimit: (orgId: string, limitCode: string, fallback = 1) => {
    const ent = get().entitlementsByOrg[orgId];
    if (!ent || !ent.limits) {
      const activePlan = get().plans.find((p) => p.planCode === ent?.planCode);
      if (activePlan?.limits && typeof activePlan.limits[limitCode] === 'number') {
        return activePlan.limits[limitCode];
      }
      return fallback;
    }
    return typeof ent.limits[limitCode] === 'number' ? ent.limits[limitCode] : fallback;
  },

  getUsage: (orgId: string, usageCode: string) => {
    const ent = get().entitlementsByOrg[orgId];
    return ent?.usage?.[usageCode] ?? 0;
  },

  canAddFacility: (orgId: string, currentCount?: number) => {
    const max = get().getLimit(orgId, 'MAX_FACILITIES', 1);
    const used = typeof currentCount === 'number' ? currentCount : get().getUsage(orgId, 'FACILITIES_USED');
    return used < max;
  },

  canAddStaff: (orgId: string, currentCount?: number) => {
    const max = get().getLimit(orgId, 'MAX_STAFF', 1);
    const used = typeof currentCount === 'number' ? currentCount : get().getUsage(orgId, 'STAFF_USED');
    return used < max;
  },

  canAddVenue: (orgId: string, currentCount?: number) => {
    const max = get().getLimit(orgId, 'MAX_VENUES', 1);
    const used = typeof currentCount === 'number' ? currentCount : get().getUsage(orgId, 'VENUES_USED');
    return used < max;
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
    const ent = get().entitlementsByOrg[orgId];
    set({
      paywall: {
        isOpen: true,
        orgId,
        title,
        description:
          description ||
          `${title} is not included in your current ${
            ent?.planName || 'active'
          } plan. Upgrade to ${
            recommendedPlan?.name || 'Venue Professional'
          } to unlock this capability dynamically.`,
        featureCode,
        isQuotaLimit: false,
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
    const ent = get().entitlementsByOrg[orgId];

    set({
      paywall: {
        isOpen: true,
        orgId,
        title: `${limitLabel} Limit Reached`,
        description: `Your ${
          ent?.planName || 'current'
        } plan allows up to ${maxAllowed} ${limitLabel.toLowerCase()}. Upgrade to ${
          recommendedPlan?.name || 'a higher tier'
        } to expand your capacity up to ${
          recommendedPlan?.limits?.[limitCode] ?? 'higher'
        } ${limitLabel.toLowerCase()}.`,
        limitCode,
        limitLabel,
        currentUsage,
        maxAllowed,
        isQuotaLimit: true,
        recommendedPlan,
      },
    });
  },

  closePaywall: () => {
    set({ paywall: initialPaywallState });
  },
}));

