'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Package,
  Plus,
  RefreshCw,
  Check,
  X,
  Sparkles,
  Trophy,
  GraduationCap,
  Users,
  Dumbbell,
  Globe2,
  Building2,
  Search,
  CheckCircle2,
  Layers,
  Archive,
  ArrowRight,
  ShieldCheck,
  Calendar,
  IndianRupee,
  Zap,
  Award,
  Info,
  ChevronRight,
  Copy,
  Filter,
  Clock,
  CreditCard,
  Percent,
  Star,
  SlidersHorizontal,
  ChevronDown,
  Gift,
  Edit2,
  Save,
  CheckSquare,
  Square,
  Power,
} from 'lucide-react';
import { AdminService, SubscriptionPackageItem } from '@/lib/api/admin';
import {
  SubscriptionService,
  VenueSubscriptionPlan,
  SaveSubscriptionPlanPayload,
} from '@/lib/api/subscription';
import { OrganizerSubscriptionService, TournamentSubscriptionPlan } from '@/lib/api/organizerSubscription';
import { AcademySubscriptionService, AcademySubscriptionPlan } from '@/lib/api/academySubscription';
import { ClubSubscriptionService, ClubSubscriptionPlan } from '@/lib/api/clubSubscription';
import { CoachSubscriptionService, CoachSubscriptionPlan } from '@/lib/api/coachSubscription';
import { CommunitySubscriptionService, CommunitySubscriptionPlan } from '@/lib/api/communitySubscription';

type PlanCategory = 'ALL' | 'VENUE' | 'TOURNAMENT' | 'ACADEMY' | 'CLUB' | 'COACH' | 'COMMUNITY' | 'LEGACY';
type PriceFilter = 'ALL' | 'FREE' | 'PAID';

// Friendly names mapping to prevent raw DB plan codes from showing
const PLAN_FRIENDLY_META: Record<string, { title: string; categoryLabel: string; badge?: string; icon: string }> = {
  VENUE_FREE: { title: 'Venue Grassroots', categoryLabel: 'Sports Venue Tier', badge: 'Forever Free', icon: '🏟️' },
  VENUE_STARTER: { title: 'Venue Starter', categoryLabel: 'Sports Venue Tier', badge: 'Single Facility', icon: '🏟️' },
  VENUE_PRO: { title: 'Venue Pro Manager', categoryLabel: 'Sports Venue Tier', badge: '⭐ Most Popular', icon: '🏟️' },
  VENUE_BUSINESS: { title: 'Venue Business ERP', categoryLabel: 'Sports Venue Tier', badge: 'Multi-Branch', icon: '🏟️' },
  VENUE_ENTERPRISE: { title: 'Venue Enterprise', categoryLabel: 'Sports Venue Tier', badge: 'Custom SLA', icon: '🏟️' },

  TOURNAMENT_FREE: { title: 'Organizer Trial Pass', categoryLabel: 'Tournament Organizer Pack', badge: 'Free Trial', icon: '🏆' },
  TOURNAMENT_STARTER: { title: 'Single Tournament Pass', categoryLabel: 'Tournament Organizer Pack', badge: 'Single Event', icon: '🏆' },
  TOURNAMENT_PRO: { title: '5 Tournament Pro Pack', categoryLabel: 'Tournament Organizer Pack', badge: '⭐ Most Popular', icon: '🏆' },
  TOURNAMENT_BUSINESS: { title: '15 Tournament Enterprise Pack', categoryLabel: 'Tournament Organizer Pack', badge: 'Complete ERP', icon: '🏆' },

  ACADEMY_FREE: { title: 'Academy Grassroots', categoryLabel: 'Sports Academy Tier', badge: 'Forever Free', icon: '🎓' },
  ACADEMY_STARTER: { title: 'Academy Starter Hub', categoryLabel: 'Sports Academy Tier', badge: 'Single Campus', icon: '🎓' },
  ACADEMY_PRO: { title: 'Academy Pro Institute', categoryLabel: 'Sports Academy Tier', badge: '⭐ Most Popular', icon: '🎓' },
  ACADEMY_BUSINESS: { title: 'Academy Enterprise School', categoryLabel: 'Sports Academy Tier', badge: 'Multi-Campus', icon: '🎓' },

  CLUB_ACCESS_PASS: { title: 'Club Batch Access Pass', categoryLabel: 'Recreational Club Pass', badge: '🎁 30-Day Free Trial', icon: '👥' },

  COACH_STARTER: { title: 'Solo Coach Starter', categoryLabel: 'Freelance Trainer Plan', badge: '🎁 30-Day Free Trial', icon: '🏋️‍♂️' },
  COACH_PRO: { title: 'Pro Coach & Trainer', categoryLabel: 'Freelance Trainer Plan', badge: '⭐ Pro Tier', icon: '🏋️‍♂️' },

  COMMUNITY_FREE: { title: 'Community Social Free', categoryLabel: 'Sports Community Group', badge: 'Forever Free', icon: '🌐' },
  COMMUNITY_PRO: { title: 'Community Pro Society', categoryLabel: 'Sports Community Group', badge: 'Active Meetups', icon: '🌐' },
};

const MODULE_DEFAULT_FEATURES: Record<string, string[]> = {
  VENUE: [
    'VENUE_FACILITY_MANAGEMENT',
    'VENUE_DYNAMIC_PRICING',
    'VENUE_RECURRING_BOOKINGS',
    'VENUE_MEMBERSHIPS',
    'VENUE_PREPAID_PACKAGES',
    'VENUE_POS',
    'VENUE_ADVANCED_CRM',
    'VENUE_COUPONS',
    'VENUE_LOYALTY',
    'VENUE_QR_CHECKIN',
    'VENUE_EQUIPMENT_RENTAL',
    'VENUE_INVENTORY',
    'VENUE_ADVANCED_INVENTORY',
    'VENUE_STAFF_ATTENDANCE',
    'VENUE_PAYROLL',
    'VENUE_EXPENSES',
    'VENUE_ADVANCED_ANALYTICS',
    'VENUE_MULTI_BRANCH',
    'VENUE_API_ACCESS',
  ],
  TOURNAMENT: [
    'LIVE_SCORING',
    'ONLINE_REGISTRATION',
    'DOUBLES_PARTNER_LINKING',
    'KNOCKOUT_AND_LEAGUE_DRAWS',
    'BASIC_AUTO_SCHEDULING',
    'ADVANCED_SCHEDULING',
    'ADVANCED_DRAWS',
    'ADVANCED_SEEDING',
    'POOLED_KNOCKOUT',
    'TIE_RUBBER_SCORING',
    'TEAM_CHAMPIONSHIP',
    'LIVE_AUCTION_ELIGIBLE',
    'FULL_AUCTION',
    'BASIC_OBS_OVERLAYS',
    'ADVANCED_BROADCAST_OVERLAYS',
    'TOURNAMENT_CERTIFICATES',
    'SPONSOR_PLACEMENTS',
    'ADVANCED_FINANCIAL_REPORTING',
  ],
  ACADEMY: [
    'ACADEMY_BASIC_ROSTER',
    'ACADEMY_ATTENDANCE',
    'ACADEMY_FEE_TRACKING',
    'ACADEMY_FEE_REMINDERS',
    'ACADEMY_DIGITAL_ID',
    'ACADEMY_PARENT_NOTICES',
    'ACADEMY_SKILL_ASSESSMENT',
    'ACADEMY_INTERNAL_MATCHES',
    'ACADEMY_EQUIPMENT_INVENTORY',
    'ACADEMY_MULTI_CENTRE',
    'ACADEMY_COACH_PAYROLL',
    'ACADEMY_PARENT_PORTAL',
  ],
  CLUB: [
    'CLUB_BATCH_MANAGEMENT',
    'CLUB_ATTENDANCE',
    'CLUB_FEE_TRACKING',
    'CLUB_EXPENSE_KITTY',
    'CLUB_LEADERBOARD',
    'CLUB_MATCH_SCORING',
    'CLUB_INVENTORY',
    'CLUB_PRIORITY_COURT',
  ],
  COACH: [
    'COACH_PROFILE',
    'COACH_CALENDAR',
    'COACH_ATTENDANCE',
    'COACH_FEE_TRACKING',
    'COACH_AUTO_REMINDERS',
    'COACH_DRILL_CARDS',
    'COACH_VIDEO_ANALYSIS',
    'COACH_VERIFIED_BADGE',
  ],
  COMMUNITY: [
    'COMMUNITY_FEED',
    'COMMUNITY_RSVP',
    'COMMUNITY_POLLS',
    'COMMUNITY_SESSIONS',
    'COMMUNITY_EXPENSE_KITTY',
    'COMMUNITY_MATCH_SCORING',
    'COMMUNITY_LEADERBOARD',
    'COMMUNITY_AUTO_ALERTS',
  ],
};

const LIMIT_FRIENDLY_LABELS: Record<string, string> = {
  MAX_FACILITIES: 'Courts / Arenas',
  MAX_STAFF: 'Staff Accounts',
  MAX_VENUES: 'Venue Locations',
  MARKETPLACE_COMMISSION: 'Marketplace Commission',
  MAX_PARTICIPANTS: 'Player Capacity',
  MAX_COURTS: 'Courts Allowed',
  MAX_OFFICIALS: 'Umpires & Staff',
  MAX_CATEGORIES: 'Event Categories',
  INCLUDED_AUCTION_CREDITS: 'Live Auctions Included',
  TOURNAMENT_CREDITS: 'Tournament Credits',
  VALIDITY_DAYS: 'Validity Period',
  AUCTION_ALLOWED: 'Auction Eligibility',
  MAX_STUDENTS: 'Student Enrollment Cap',
  MAX_COACHES: 'Coaching Staff Limit',
  MAX_CENTRES: 'Campus Centres',
  MAX_BATCHES: 'Batch Schedules',
  MAX_MEMBERS: 'Club Members Limit',
  MAX_MANAGERS: 'Club Managers Limit',
  TRIAL_DAYS: 'Free Trial Duration',
  MAX_TRAINEES: 'Trainees Capacity',
  MAX_SESSIONS: 'Session Limit',
  MAX_PACKAGES: 'Packages Limit',
  MAX_COORDINATORS: 'Community Coordinators',
};

function formatLimitLabel(key: string): string {
  if (LIMIT_FRIENDLY_LABELS[key]) return LIMIT_FRIENDLY_LABELS[key];
  return key
    .replace(/^MAX_/, 'Max ')
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatFeatureName(raw: string): string {
  return raw
    .replace(/^(VENUE_|ACADEMY_|CLUB_|COACH_|COMMUNITY_|BASIC_|ADVANCED_)/, '')
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function AdminSubscriptionPlansPage() {
  // Plan states for all 6 organization verticals + legacy packages
  const [venuePlans, setVenuePlans] = useState<VenueSubscriptionPlan[]>([]);
  const [tournamentPlans, setTournamentPlans] = useState<TournamentSubscriptionPlan[]>([]);
  const [academyPlans, setAcademyPlans] = useState<AcademySubscriptionPlan[]>([]);
  const [clubPlans, setClubPlans] = useState<ClubSubscriptionPlan[]>([]);
  const [coachPlans, setCoachPlans] = useState<CoachSubscriptionPlan[]>([]);
  const [communityPlans, setCommunityPlans] = useState<CommunitySubscriptionPlan[]>([]);
  const [legacyPackages, setLegacyPackages] = useState<SubscriptionPackageItem[]>([]);

  // Navigation & Filter States
  const [activeCategory, setActiveCategory] = useState<PlanCategory>('ALL');
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Expanded card state on mobile
  const [expandedCardCode, setExpandedCardCode] = useState<string | null>(null);

  // Inspector & Modals
  const [inspectedPlan, setInspectedPlan] = useState<{
    category: string;
    icon: any;
    title: string;
    code: string;
    description?: string;
    priceFormatted: string;
    priceSecondary?: string;
    uuid?: string;
    version?: number;
    order?: number;
    limits?: Record<string, any>;
    features?: Record<string, boolean>;
    raw: any;
  } | null>(null);

  // Edit / Create Modern Plan Modal State
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'CREATE' | 'EDIT'>('CREATE');
  const [planForm, setPlanForm] = useState<{
    planId?: number;
    planUuid?: string;
    planCode: string;
    name: string;
    description: string;
    targetModule: 'VENUE' | 'TOURNAMENT' | 'ACADEMY' | 'CLUB' | 'COACH' | 'COMMUNITY';
    displayOrder: number;
    isActive: number;
    monthlyPrice: string;
    yearlyPrice: string;
    packagePrice: string;
    commissionRate: string;
    limits: Record<string, string>;
    features: Record<string, boolean>;
  }>({
    planCode: '',
    name: '',
    description: '',
    targetModule: 'VENUE',
    displayOrder: 0,
    isActive: 1,
    monthlyPrice: '499',
    yearlyPrice: '4999',
    packagePrice: '0',
    commissionRate: '5.0',
    limits: {},
    features: {},
  });
  const [savingPlan, setSavingPlan] = useState(false);
  const [planFormError, setPlanFormError] = useState<string | null>(null);

  // Form State for creating legacy packages
  const [isLegacyModalOpen, setIsLegacyModalOpen] = useState(false);
  const [legacyName, setLegacyName] = useState('');
  const [legacyDesc, setLegacyDesc] = useState('');
  const [legacyPrice, setLegacyPrice] = useState('999');
  const [legacyDuration, setLegacyDuration] = useState('1');
  const [legacyFeatures, setLegacyFeatures] = useState('Tournament Management, Live Scoring, Up to 64 Teams');
  const [submittingLegacy, setSubmittingLegacy] = useState(false);
  const [legacyFormError, setLegacyFormError] = useState<string | null>(null);

  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const [vRes, tRes, aRes, clRes, coRes, cmRes, legRes] = await Promise.all([
        SubscriptionService.getVenuePlans().catch(() => null),
        OrganizerSubscriptionService.getPlans().catch(() => null),
        AcademySubscriptionService.getPlans().catch(() => null),
        ClubSubscriptionService.getPlans().catch(() => null),
        CoachSubscriptionService.getPlans().catch(() => null),
        CommunitySubscriptionService.getPlans().catch(() => null),
        AdminService.getAllPackages().catch(() => null),
      ]);

      const extractArray = <T,>(res: any): T[] => {
        if (!res) return [];
        if (Array.isArray(res)) return res;
        if (Array.isArray(res.data)) return res.data;
        if (Array.isArray(res.data?.data)) return res.data.data;
        if (Array.isArray(res.content)) return res.content;
        return [];
      };

      setVenuePlans(extractArray<VenueSubscriptionPlan>(vRes));
      setTournamentPlans(extractArray<TournamentSubscriptionPlan>(tRes));
      setAcademyPlans(extractArray<AcademySubscriptionPlan>(aRes));
      setClubPlans(extractArray<ClubSubscriptionPlan>(clRes));
      setCoachPlans(extractArray<CoachSubscriptionPlan>(coRes));
      setCommunityPlans(extractArray<CommunitySubscriptionPlan>(cmRes));
      setLegacyPackages(extractArray<SubscriptionPackageItem>(legRes));
    } catch (err) {
      console.error('Failed to load subscription plans', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const totalModernPlans = useMemo(() => {
    return (
      venuePlans.length +
      tournamentPlans.length +
      academyPlans.length +
      clubPlans.length +
      coachPlans.length +
      communityPlans.length
    );
  }, [venuePlans, tournamentPlans, academyPlans, clubPlans, coachPlans, communityPlans]);

  // Open Create Plan Modal
  const openCreatePlanModal = (targetModule: 'VENUE' | 'TOURNAMENT' | 'ACADEMY' | 'CLUB' | 'COACH' | 'COMMUNITY' = 'VENUE') => {
    setModalMode('CREATE');
    setPlanFormError(null);
    const defaultFeats: Record<string, boolean> = {};
    (MODULE_DEFAULT_FEATURES[targetModule] || []).forEach((f) => {
      defaultFeats[f] = true;
    });

    const defaultLimits: Record<string, string> = {};
    if (targetModule === 'VENUE') {
      defaultLimits['MAX_FACILITIES'] = '3';
      defaultLimits['MAX_STAFF'] = '2';
      defaultLimits['MAX_VENUES'] = '1';
    } else if (targetModule === 'TOURNAMENT') {
      defaultLimits['MAX_PARTICIPANTS'] = '128';
      defaultLimits['MAX_COURTS'] = '5';
      defaultLimits['TOURNAMENT_CREDITS'] = '1';
      defaultLimits['INCLUDED_AUCTION_CREDITS'] = '0';
      defaultLimits['VALIDITY_DAYS'] = '365';
    } else if (targetModule === 'ACADEMY') {
      defaultLimits['MAX_STUDENTS'] = '60';
      defaultLimits['MAX_COACHES'] = '3';
      defaultLimits['MAX_CENTRES'] = '1';
    } else if (targetModule === 'CLUB') {
      defaultLimits['MAX_MEMBERS'] = '100';
      defaultLimits['MAX_MANAGERS'] = '3';
      defaultLimits['TRIAL_DAYS'] = '30';
    } else if (targetModule === 'COACH') {
      defaultLimits['MAX_TRAINEES'] = '15';
      defaultLimits['TRIAL_DAYS'] = '30';
    } else if (targetModule === 'COMMUNITY') {
      defaultLimits['MAX_MEMBERS'] = '50';
      defaultLimits['MAX_COORDINATORS'] = '2';
    }

    setPlanForm({
      planCode: '',
      name: '',
      description: '',
      targetModule,
      displayOrder: 0,
      isActive: 1,
      monthlyPrice: targetModule === 'TOURNAMENT' ? '0' : '499',
      yearlyPrice: targetModule === 'TOURNAMENT' ? '0' : '4999',
      packagePrice: targetModule === 'TOURNAMENT' ? '499' : '0',
      commissionRate: targetModule === 'VENUE' ? '5.0' : '0',
      limits: defaultLimits,
      features: defaultFeats,
    });
    setIsPlanModalOpen(true);
  };

  // Open Edit Plan Modal
  const openEditPlanModal = (plan: any, moduleName: 'VENUE' | 'TOURNAMENT' | 'ACADEMY' | 'CLUB' | 'COACH' | 'COMMUNITY') => {
    setModalMode('EDIT');
    setPlanFormError(null);

    const limitsStr: Record<string, string> = {};
    if (plan.limits) {
      Object.entries(plan.limits).forEach(([k, v]) => {
        limitsStr[k] = String(v);
      });
    }

    const featsObj: Record<string, boolean> = { ...(plan.features || {}) };
    (MODULE_DEFAULT_FEATURES[moduleName] || []).forEach((f) => {
      if (featsObj[f] === undefined) {
        featsObj[f] = false;
      }
    });

    setPlanForm({
      planId: plan.planId,
      planUuid: plan.planUuid,
      planCode: plan.planCode,
      name: plan.name,
      description: plan.description || '',
      targetModule: moduleName,
      displayOrder: plan.displayOrder ?? 0,
      isActive: plan.isActive !== undefined ? plan.isActive : 1,
      monthlyPrice: String(plan.monthlyPrice ?? 0),
      yearlyPrice: String(plan.yearlyPrice ?? 0),
      packagePrice: String(plan.packagePrice ?? 0),
      commissionRate: String(plan.marketplaceCommissionRate ?? 0),
      limits: limitsStr,
      features: featsObj,
    });
    setIsPlanModalOpen(true);
  };

  // Submit Plan (Create or Update) via POST
  const handleSavePlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planForm.name.trim()) {
      setPlanFormError('Plan name is required.');
      return;
    }

    setSavingPlan(true);
    setPlanFormError(null);

    try {
      const parsedLimits: Record<string, number> = {};
      Object.entries(planForm.limits).forEach(([k, v]) => {
        const num = parseInt(v, 10);
        if (!isNaN(num)) {
          parsedLimits[k] = num;
        }
      });

      const payload: SaveSubscriptionPlanPayload = {
        planId: planForm.planId,
        planUuid: planForm.planUuid,
        planCode: planForm.planCode.trim() || undefined,
        name: planForm.name.trim(),
        description: planForm.description.trim() || undefined,
        targetModule: planForm.targetModule,
        displayOrder: planForm.displayOrder,
        isActive: planForm.isActive,
        monthlyPrice: parseFloat(planForm.monthlyPrice) || 0,
        yearlyPrice: parseFloat(planForm.yearlyPrice) || 0,
        packagePrice: parseFloat(planForm.packagePrice) || 0,
        marketplaceCommissionRate: parseFloat(planForm.commissionRate) || 0,
        limits: parsedLimits,
        features: planForm.features,
      };

      if (modalMode === 'CREATE') {
        await SubscriptionService.createPlan(payload);
        showNotification(`Successfully created plan "${payload.name}"!`);
      } else {
        await SubscriptionService.updatePlan(payload);
        showNotification(`Successfully updated plan "${payload.name}"!`);
      }

      setIsPlanModalOpen(false);
      fetchPlans();
    } catch (err: any) {
      console.error('Failed to save subscription plan:', err);
      setPlanFormError(err?.message || 'Failed to save subscription plan. Please check inputs.');
    } finally {
      setSavingPlan(false);
    }
  };

  // Toggle Plan Active Status via POST
  const handleTogglePlanStatus = async (planUuid: string, currentStatus: number, planName: string) => {
    try {
      await SubscriptionService.togglePlanStatus(planUuid);
      showNotification(`Plan "${planName}" status changed to ${currentStatus === 1 ? 'Inactive' : 'Active'}.`);
      fetchPlans();
    } catch (err: any) {
      console.error('Failed to toggle status:', err);
      showNotification(err?.message || 'Failed to toggle status');
    }
  };

  // Create Legacy Package
  const handleCreateLegacyPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!legacyName.trim()) {
      setLegacyFormError('Package name is required');
      return;
    }
    setSubmittingLegacy(true);
    setLegacyFormError(null);
    try {
      await AdminService.createPackage({
        name: legacyName.trim(),
        description: legacyDesc.trim() || undefined,
        price: parseFloat(legacyPrice) || 0,
        durationMonths: parseInt(legacyDuration) || 1,
        features: legacyFeatures.trim() || undefined,
      });

      setIsLegacyModalOpen(false);
      setLegacyName('');
      setLegacyDesc('');
      setLegacyPrice('999');
      setLegacyDuration('1');
      showNotification('Legacy package created successfully.');
      fetchPlans();
    } catch (err: any) {
      console.error('Failed to create legacy package', err);
      setLegacyFormError(err?.message || 'Failed to create subscription package');
    } finally {
      setSubmittingLegacy(false);
    }
  };

  // Filter helpers
  const q = searchQuery.toLowerCase().trim();
  const filterList = <T extends { name: string; planCode?: string; description?: string; monthlyPrice?: number; packagePrice?: number }>(
    items: T[]
  ): T[] => {
    return items.filter((item) => {
      if (q) {
        const meta = item.planCode ? PLAN_FRIENDLY_META[item.planCode] : null;
        const friendlyTitle = meta?.title.toLowerCase() || '';
        const friendlyCategory = meta?.categoryLabel.toLowerCase() || '';
        const matchesName = item.name.toLowerCase().includes(q) || friendlyTitle.includes(q);
        const matchesCat = friendlyCategory.includes(q);
        const matchesDesc = item.description ? item.description.toLowerCase().includes(q) : false;
        if (!matchesName && !matchesCat && !matchesDesc) return false;
      }
      const p = item.monthlyPrice !== undefined ? item.monthlyPrice : item.packagePrice !== undefined ? item.packagePrice : 0;
      if (priceFilter === 'FREE' && p > 0) return false;
      if (priceFilter === 'PAID' && p === 0) return false;
      return true;
    });
  };

  const filteredVenuePlans = filterList(venuePlans);
  const filteredTournamentPlans = filterList(tournamentPlans);
  const filteredAcademyPlans = filterList(academyPlans);
  const filteredClubPlans = filterList(clubPlans);
  const filteredCoachPlans = filterList(coachPlans);
  const filteredCommunityPlans = filterList(communityPlans);
  const filteredLegacyPackages = useMemo(() => {
    return legacyPackages.filter((p) => {
      if (q) {
        const mName = p.name.toLowerCase().includes(q);
        const mDesc = p.description ? p.description.toLowerCase().includes(q) : false;
        const mFeat = p.features ? p.features.toLowerCase().includes(q) : false;
        if (!mName && !mDesc && !mFeat) return false;
      }
      if (priceFilter === 'FREE' && p.price > 0) return false;
      if (priceFilter === 'PAID' && p.price === 0) return false;
      return true;
    });
  }, [legacyPackages, q, priceFilter]);

  const categoryTabs = [
    { id: 'ALL' as PlanCategory, label: 'All Plans', count: totalModernPlans, icon: Layers },
    { id: 'VENUE' as PlanCategory, label: 'Venues', count: venuePlans.length, icon: Building2 },
    { id: 'TOURNAMENT' as PlanCategory, label: 'Tournaments', count: tournamentPlans.length, icon: Trophy },
    { id: 'ACADEMY' as PlanCategory, label: 'Academies', count: academyPlans.length, icon: GraduationCap },
    { id: 'CLUB' as PlanCategory, label: 'Clubs', count: clubPlans.length, icon: Users },
    { id: 'COACH' as PlanCategory, label: 'Coaches', count: coachPlans.length, icon: Dumbbell },
    { id: 'COMMUNITY' as PlanCategory, label: 'Communities', count: communityPlans.length, icon: Globe2 },
    { id: 'LEGACY' as PlanCategory, label: 'Legacy Archive', count: legacyPackages.length, icon: Archive },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 pb-24 max-w-7xl mx-auto px-1 sm:px-2">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-2xl border bg-emerald-600 text-white flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-xs font-bold">{notification}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          1. ARENA HERO BANNER
          ───────────────────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden rounded-2xl sm:rounded-3xl border p-4 sm:p-7 shadow-lg transition-all"
        style={{
          backgroundColor: 'var(--athlon-card)',
          borderColor: 'var(--athlon-border)',
        }}
      >
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-[10px] sm:text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              <span>Athlon Subscription Matrix</span>
            </div>
            <h1
              className="text-lg sm:text-2xl font-black uppercase tracking-tight leading-tight"
              style={{ color: 'var(--athlon-text)' }}
            >
              Subscription Packages &amp; Quotas
            </h1>
            <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--athlon-text-secondary)' }}>
              Configure live pricing, capacity quotas, and feature entitlements across all 6 sports verticals.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div
            className="grid grid-cols-3 divide-x rounded-xl border text-center shrink-0 self-stretch sm:self-start lg:self-auto"
            style={{
              backgroundColor: 'var(--athlon-surface)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <div className="px-3 py-2">
              <div className="text-[9px] font-mono uppercase" style={{ color: 'var(--athlon-text-muted)' }}>
                Active Plans
              </div>
              <div className="text-lg sm:text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                {totalModernPlans}
              </div>
            </div>
            <div className="px-3 py-2" style={{ borderColor: 'var(--athlon-border)' }}>
              <div className="text-[9px] font-mono uppercase" style={{ color: 'var(--athlon-text-muted)' }}>
                Verticals
              </div>
              <div className="text-lg sm:text-xl font-black font-mono" style={{ color: 'var(--athlon-text)' }}>
                6
              </div>
            </div>
            <div className="px-3 py-2">
              <div className="text-[9px] font-mono uppercase" style={{ color: 'var(--athlon-text-muted)' }}>
                Archived
              </div>
              <div className="text-lg sm:text-xl font-black font-mono" style={{ color: 'var(--athlon-text-muted)' }}>
                {legacyPackages.length}
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls Bar */}
        <div
          className="relative z-10 mt-4 pt-4 border-t flex flex-wrap items-center justify-between gap-3"
          style={{ borderColor: 'var(--athlon-border)' }}
        >
          {/* Billing Cycle Switcher */}
          <div
            className="flex items-center gap-1 p-1 rounded-xl border w-full sm:w-auto"
            style={{
              backgroundColor: 'var(--athlon-surface)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <button
              onClick={() => setBillingCycle('MONTHLY')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                billingCycle === 'MONTHLY'
                  ? 'bg-emerald-600 dark:bg-emerald-500 text-white dark:text-black shadow-sm'
                  : 'hover:opacity-80'
              }`}
              style={billingCycle !== 'MONTHLY' ? { color: 'var(--athlon-text-secondary)' } : undefined}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('YEARLY')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                billingCycle === 'YEARLY'
                  ? 'bg-emerald-600 dark:bg-emerald-500 text-white dark:text-black shadow-sm'
                  : 'hover:opacity-80'
              }`}
              style={billingCycle !== 'YEARLY' ? { color: 'var(--athlon-text-secondary)' } : undefined}
            >
              <span>Annual</span>
              <span className="text-[8.5px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold">
                Save ~17%
              </span>
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={fetchPlans}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all disabled:opacity-50 hover:opacity-90 active:scale-95 shadow-xs"
              style={{
                backgroundColor: 'var(--athlon-surface)',
                borderColor: 'var(--athlon-border)',
                color: 'var(--athlon-text)',
              }}
              title="Refresh Plans"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`}
                style={{ color: 'var(--athlon-primary)' }}
              />
              <span>Refresh</span>
            </button>

            {/* CREATE NEW MODERN PLAN BUTTON (POST /plans/create) */}
            <button
              onClick={() => openCreatePlanModal(activeCategory === 'ALL' || activeCategory === 'LEGACY' ? 'VENUE' : activeCategory)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider shadow-md transition-all active:scale-95 hover:opacity-90"
              style={{
                backgroundColor: 'var(--athlon-primary)',
                color: '#000000',
              }}
            >
              <Plus className="w-4 h-4" />
              <span>Add Plan</span>
            </button>

            {/* Create Legacy Package */}
            <button
              onClick={() => setIsLegacyModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all hover:opacity-80"
              style={{
                backgroundColor: 'var(--athlon-surface)',
                borderColor: 'var(--athlon-border)',
                color: 'var(--athlon-text-secondary)',
              }}
              title="Add classic row to subscription_packages table"
            >
              <Archive className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Classic</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. SEARCH & FILTER CONTROLS
          ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="relative flex-1">
          <Search
            className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--athlon-text-muted)' }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search plans (e.g. Pro, Starter, Court, Coach)..."
            className="w-full pl-9 pr-8 py-2 rounded-xl border text-xs focus:outline-none transition-all"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
              color: 'var(--athlon-text)',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-100"
              style={{ color: 'var(--athlon-text-muted)' }}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div
          className="flex items-center gap-1 p-1 rounded-xl border text-xs font-bold self-start sm:self-auto shrink-0"
          style={{
            backgroundColor: 'var(--athlon-surface)',
            borderColor: 'var(--athlon-border)',
          }}
        >
          <span className="text-[10px] font-mono px-2 uppercase" style={{ color: 'var(--athlon-text-muted)' }}>
            Filter:
          </span>
          {(['ALL', 'FREE', 'PAID'] as PriceFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setPriceFilter(f)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                priceFilter === f ? 'shadow-xs font-black' : 'hover:opacity-80'
              }`}
              style={
                priceFilter === f
                  ? {
                      backgroundColor: 'var(--athlon-card)',
                      color: 'var(--athlon-text)',
                    }
                  : {
                      color: 'var(--athlon-text-muted)',
                    }
              }
            >
              {f === 'ALL' ? 'All' : f === 'FREE' ? 'Free (₹0)' : 'Paid'}
            </button>
          ))}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. SWIPEABLE CATEGORY TABS
          ───────────────────────────────────────────────────────────── */}
      <div
        className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar border-b"
        style={{ borderColor: 'var(--athlon-border)' }}
      >
        {categoryTabs.map((tab) => {
          const isSelected = activeCategory === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`group flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 ${
                isSelected ? 'shadow-sm font-black' : 'border-transparent hover:opacity-90'
              }`}
              style={
                isSelected
                  ? {
                      backgroundColor: 'var(--athlon-card)',
                      borderColor: 'var(--athlon-primary)',
                      color: 'var(--athlon-text)',
                    }
                  : {
                      color: 'var(--athlon-text-secondary)',
                    }
              }
            >
              <Icon
                className="w-3.5 h-3.5 transition-transform group-hover:scale-110"
                style={{
                  color: isSelected ? 'var(--athlon-primary)' : 'var(--athlon-text-muted)',
                }}
              />
              <span>{tab.label}</span>
              <span
                className="text-[9px] px-1.5 py-0.2 rounded-full font-mono border"
                style={
                  isSelected
                    ? {
                        backgroundColor: 'rgba(var(--primary-rgb, 16), 0.15)',
                        color: 'var(--athlon-primary)',
                        borderColor: 'rgba(var(--primary-rgb, 16), 0.3)',
                      }
                    : {
                        backgroundColor: 'var(--athlon-surface)',
                        color: 'var(--athlon-text-muted)',
                        borderColor: 'var(--athlon-border)',
                      }
                }
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. CONTENT VIEWS (MOBILE-OPTIMIZED WITH EDIT PROVISIONS)
          ───────────────────────────────────────────────────────────── */}
      {loading ? (
        <div
          className="p-16 rounded-2xl border text-center space-y-3"
          style={{
            backgroundColor: 'var(--athlon-card)',
            borderColor: 'var(--athlon-border)',
          }}
        >
          <RefreshCw className="w-7 h-7 mx-auto animate-spin" style={{ color: 'var(--athlon-primary)' }} />
          <h3 className="text-sm font-bold" style={{ color: 'var(--athlon-text)' }}>
            Loading subscription plans...
          </h3>
          <p className="text-xs" style={{ color: 'var(--athlon-text-muted)' }}>
            Connecting to Athlon Entitlement Engine
          </p>
        </div>
      ) : (
        <div className="space-y-6 sm:space-y-10">
          {/* Helper render card function */}
          {(() => {
            const renderPlanCard = (
              plan: any,
              moduleName: 'VENUE' | 'TOURNAMENT' | 'ACADEMY' | 'CLUB' | 'COACH' | 'COMMUNITY',
              accentColor: string
            ) => {
              const meta = PLAN_FRIENDLY_META[plan.planCode] || {
                title: plan.name,
                categoryLabel: `${moduleName} Tier`,
                badge: plan.monthlyPrice === 0 ? 'Forever Free' : undefined,
                icon: moduleName === 'VENUE' ? '🏟️' : moduleName === 'TOURNAMENT' ? '🏆' : moduleName === 'ACADEMY' ? '🎓' : moduleName === 'CLUB' ? '👥' : moduleName === 'COACH' ? '🏋️‍♂️' : '🌐',
              };
              const isFree = plan.monthlyPrice === 0 && (plan.packagePrice === undefined || plan.packagePrice === 0);
              const priceToDisplay =
                moduleName === 'TOURNAMENT'
                  ? plan.packagePrice
                  : billingCycle === 'YEARLY' && plan.yearlyPrice > 0
                  ? plan.yearlyPrice
                  : plan.monthlyPrice;
              const unit =
                moduleName === 'TOURNAMENT'
                  ? '/ pack'
                  : billingCycle === 'YEARLY' && plan.yearlyPrice > 0
                  ? '/ yr'
                  : '/ mo';
              const savings = (plan.monthlyPrice ?? 0) * 12 - (plan.yearlyPrice ?? 0);
              const isExpanded = expandedCardCode === plan.planCode;

              return (
                <div
                  key={plan.planCode}
                  className="rounded-2xl border p-4 sm:p-5 flex flex-col justify-between shadow-xs transition-all hover:shadow-md relative"
                  style={{
                    backgroundColor: 'var(--athlon-card)',
                    borderColor: meta.badge?.includes('Popular')
                      ? accentColor
                      : 'var(--athlon-border)',
                  }}
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-xl shrink-0">{meta.icon}</span>
                        <div className="min-w-0">
                          <h3 className="text-sm font-black truncate" style={{ color: 'var(--athlon-text)' }}>
                            {meta.title}
                          </h3>
                          <p className="text-[10px] font-medium" style={{ color: 'var(--athlon-text-muted)' }}>
                            {meta.categoryLabel}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {meta.badge && (
                          <span
                            className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full border bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                          >
                            {meta.badge}
                          </span>
                        )}
                        {/* Edit Button directly on card */}
                        <button
                          onClick={() => openEditPlanModal(plan, moduleName)}
                          className="p-1.5 rounded-lg border hover:opacity-80 transition-opacity"
                          style={{
                            backgroundColor: 'var(--athlon-surface)',
                            borderColor: 'var(--athlon-border)',
                            color: 'var(--athlon-text)',
                          }}
                          title="Edit this plan (Pricing, limits, features)"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Price Hero Box */}
                    <div
                      className="p-2.5 rounded-xl border flex items-center justify-between"
                      style={{
                        backgroundColor: 'var(--athlon-surface)',
                        borderColor: 'var(--athlon-border)',
                      }}
                    >
                      <div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-black font-mono" style={{ color: 'var(--athlon-text)' }}>
                            ₹{priceToDisplay?.toLocaleString('en-IN') ?? 0}
                          </span>
                          <span className="text-xs font-bold" style={{ color: 'var(--athlon-text-muted)' }}>
                            {unit}
                          </span>
                        </div>
                        {isFree ? (
                          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">
                            100% Free Forever
                          </span>
                        ) : moduleName !== 'TOURNAMENT' && billingCycle === 'YEARLY' && savings > 0 ? (
                          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
                            Save ₹{savings.toLocaleString('en-IN')}/year
                          </span>
                        ) : moduleName === 'TOURNAMENT' ? (
                          <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">
                            🏆 {plan.tournamentCredits} Tournament Credits
                          </span>
                        ) : (
                          <span className="text-[10px]" style={{ color: 'var(--athlon-text-muted)' }}>
                            Billed monthly
                          </span>
                        )}
                      </div>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-md border" style={{ color: 'var(--athlon-text-muted)', borderColor: 'var(--athlon-border)' }}>
                        v{plan.versionNumber || 1}
                      </span>
                    </div>

                    {/* Quota Highlights */}
                    <div
                      className="grid grid-cols-3 gap-1 p-2 rounded-xl border text-center"
                      style={{
                        backgroundColor: 'var(--athlon-surface)',
                        borderColor: 'var(--athlon-border)',
                      }}
                    >
                      {moduleName === 'VENUE' && (
                        <>
                          <div className="p-1">
                            <div className="text-[8px] font-mono uppercase" style={{ color: 'var(--athlon-text-muted)' }}>Courts</div>
                            <div className="text-xs font-black font-mono" style={{ color: 'var(--athlon-text)' }}>{plan.limits?.MAX_FACILITIES ?? 1}</div>
                          </div>
                          <div className="p-1 border-x" style={{ borderColor: 'var(--athlon-border)' }}>
                            <div className="text-[8px] font-mono uppercase" style={{ color: 'var(--athlon-text-muted)' }}>Staff</div>
                            <div className="text-xs font-black font-mono" style={{ color: 'var(--athlon-text)' }}>{plan.limits?.MAX_STAFF ?? 1}</div>
                          </div>
                          <div className="p-1">
                            <div className="text-[8px] font-mono uppercase" style={{ color: 'var(--athlon-text-muted)' }}>Commission</div>
                            <div className="text-xs font-black font-mono text-emerald-700 dark:text-emerald-400">{plan.marketplaceCommissionRate ?? 5}%</div>
                          </div>
                        </>
                      )}
                      {moduleName === 'TOURNAMENT' && (
                        <>
                          <div className="p-1">
                            <div className="text-[8px] font-mono uppercase" style={{ color: 'var(--athlon-text-muted)' }}>Max Players</div>
                            <div className="text-xs font-black font-mono" style={{ color: 'var(--athlon-text)' }}>{plan.limits?.MAX_PARTICIPANTS ?? 32}</div>
                          </div>
                          <div className="p-1 border-x" style={{ borderColor: 'var(--athlon-border)' }}>
                            <div className="text-[8px] font-mono uppercase" style={{ color: 'var(--athlon-text-muted)' }}>Courts</div>
                            <div className="text-xs font-black font-mono" style={{ color: 'var(--athlon-text)' }}>{plan.limits?.MAX_COURTS ?? 2}</div>
                          </div>
                          <div className="p-1">
                            <div className="text-[8px] font-mono uppercase" style={{ color: 'var(--athlon-text-muted)' }}>Auctions</div>
                            <div className="text-xs font-black font-mono text-amber-700 dark:text-amber-400">{plan.includedAuctionCredits > 0 ? `${plan.includedAuctionCredits} Free` : 'Pass Req.'}</div>
                          </div>
                        </>
                      )}
                      {moduleName === 'ACADEMY' && (
                        <>
                          <div className="p-1">
                            <div className="text-[8px] font-mono uppercase" style={{ color: 'var(--athlon-text-muted)' }}>Students</div>
                            <div className="text-xs font-black font-mono" style={{ color: 'var(--athlon-text)' }}>{plan.maxStudents ?? 15}</div>
                          </div>
                          <div className="p-1 border-x" style={{ borderColor: 'var(--athlon-border)' }}>
                            <div className="text-[8px] font-mono uppercase" style={{ color: 'var(--athlon-text-muted)' }}>Coaches</div>
                            <div className="text-xs font-black font-mono" style={{ color: 'var(--athlon-text)' }}>{plan.maxCoaches ?? 1}</div>
                          </div>
                          <div className="p-1">
                            <div className="text-[8px] font-mono uppercase" style={{ color: 'var(--athlon-text-muted)' }}>Campuses</div>
                            <div className="text-xs font-black font-mono text-sky-700 dark:text-sky-400">{plan.maxCentres ?? 1}</div>
                          </div>
                        </>
                      )}
                      {moduleName === 'CLUB' && (
                        <>
                          <div className="p-1">
                            <div className="text-[8px] font-mono uppercase" style={{ color: 'var(--athlon-text-muted)' }}>Members</div>
                            <div className="text-xs font-black font-mono" style={{ color: 'var(--athlon-text)' }}>{plan.maxMembers ?? 100}</div>
                          </div>
                          <div className="p-1 border-x" style={{ borderColor: 'var(--athlon-border)' }}>
                            <div className="text-[8px] font-mono uppercase" style={{ color: 'var(--athlon-text-muted)' }}>Managers</div>
                            <div className="text-xs font-black font-mono" style={{ color: 'var(--athlon-text)' }}>{plan.maxManagers ?? 3}</div>
                          </div>
                          <div className="p-1">
                            <div className="text-[8px] font-mono uppercase" style={{ color: 'var(--athlon-text-muted)' }}>Trial</div>
                            <div className="text-xs font-black font-mono text-purple-700 dark:text-purple-400">{plan.trialDays ?? 30}d Free</div>
                          </div>
                        </>
                      )}
                      {moduleName === 'COACH' && (
                        <>
                          <div className="p-1 col-span-2">
                            <div className="text-[8px] font-mono uppercase" style={{ color: 'var(--athlon-text-muted)' }}>Active Trainees Cap</div>
                            <div className="text-xs font-black font-mono text-rose-700 dark:text-rose-400">Up to {plan.maxTrainees ?? 15} Trainees</div>
                          </div>
                          <div className="p-1 border-l" style={{ borderColor: 'var(--athlon-border)' }}>
                            <div className="text-[8px] font-mono uppercase" style={{ color: 'var(--athlon-text-muted)' }}>Trial</div>
                            <div className="text-xs font-black font-mono" style={{ color: 'var(--athlon-text)' }}>{plan.trialDays > 0 ? `${plan.trialDays}d` : 'Pro'}</div>
                          </div>
                        </>
                      )}
                      {moduleName === 'COMMUNITY' && (
                        <>
                          <div className="p-1">
                            <div className="text-[8px] font-mono uppercase" style={{ color: 'var(--athlon-text-muted)' }}>Members</div>
                            <div className="text-xs font-black font-mono" style={{ color: 'var(--athlon-text)' }}>{plan.maxMembers ?? 50}</div>
                          </div>
                          <div className="p-1 border-x" style={{ borderColor: 'var(--athlon-border)' }}>
                            <div className="text-[8px] font-mono uppercase" style={{ color: 'var(--athlon-text-muted)' }}>Coordinators</div>
                            <div className="text-xs font-black font-mono text-teal-700 dark:text-teal-400">{plan.maxCoordinators ?? 2}</div>
                          </div>
                          <div className="p-1">
                            <div className="text-[8px] font-mono uppercase" style={{ color: 'var(--athlon-text-muted)' }}>Treasury</div>
                            <div className="text-xs font-black font-mono" style={{ color: 'var(--athlon-text)' }}>Splitter</div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Description */}
                    {plan.description && (
                      <p className="text-[11px] leading-relaxed line-clamp-2" style={{ color: 'var(--athlon-text-secondary)' }}>
                        {plan.description}
                      </p>
                    )}

                    {/* Features preview */}
                    <div className="space-y-1">
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(plan.features || {})
                          .filter(([, enabled]) => enabled)
                          .slice(0, isExpanded ? 25 : 3)
                          .map(([featKey]) => (
                            <span
                              key={featKey}
                              className="text-[9px] px-2 py-0.5 rounded-md border flex items-center gap-1"
                              style={{
                                backgroundColor: 'var(--athlon-surface)',
                                borderColor: 'var(--athlon-border)',
                                color: 'var(--athlon-text)',
                              }}
                            >
                              <Check className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                              <span className="truncate">{formatFeatureName(featKey)}</span>
                            </span>
                          ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 mt-3 border-t flex items-center justify-between" style={{ borderColor: 'var(--athlon-border)' }}>
                    <button
                      onClick={() => setExpandedCardCode(isExpanded ? null : plan.planCode)}
                      className="text-[10px] font-bold flex items-center gap-0.5"
                      style={{ color: 'var(--athlon-text-secondary)' }}
                    >
                      <span>{isExpanded ? 'Less' : 'Features'}</span>
                      <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditPlanModal(plan, moduleName)}
                        className="text-[10px] font-bold px-2.5 py-1 rounded-lg border hover:opacity-80 transition-all flex items-center gap-1"
                        style={{
                          backgroundColor: 'var(--athlon-surface)',
                          borderColor: 'var(--athlon-border)',
                          color: 'var(--athlon-text)',
                        }}
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() =>
                          setInspectedPlan({
                            category: meta.categoryLabel,
                            icon: meta.icon === '🏟️' ? Building2 : meta.icon === '🏆' ? Trophy : meta.icon === '🎓' ? GraduationCap : meta.icon === '👥' ? Users : meta.icon === '🏋️‍♂️' ? Dumbbell : Globe2,
                            title: meta.title,
                            code: plan.planCode,
                            description: plan.description,
                            priceFormatted: `₹${(plan.monthlyPrice ?? plan.packagePrice ?? 0).toLocaleString('en-IN')} ${unit}`,
                            priceSecondary: plan.yearlyPrice ? `₹${plan.yearlyPrice.toLocaleString('en-IN')} / yr` : undefined,
                            uuid: plan.planUuid,
                            version: plan.versionNumber,
                            order: plan.displayOrder,
                            limits: plan.limits,
                            features: plan.features,
                            raw: plan,
                          })
                        }
                        className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
                      >
                        <span>Inspect</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            };

            return (
              <>
                {/* 1. VENUES */}
                {(activeCategory === 'VENUE' || activeCategory === 'ALL') && filteredVenuePlans.length > 0 && (
                  <section className="space-y-3">
                    <div className="flex items-center justify-between pb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🏟️</span>
                        <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                          Sports Venues &amp; Turfs ({filteredVenuePlans.length})
                        </h2>
                      </div>
                      <button
                        onClick={() => openCreatePlanModal('VENUE')}
                        className="text-[11px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Venue Plan</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
                      {filteredVenuePlans.map((p) => renderPlanCard(p, 'VENUE', 'rgba(16, 185, 129, 0.45)'))}
                    </div>
                  </section>
                )}

                {/* 2. TOURNAMENTS */}
                {(activeCategory === 'TOURNAMENT' || activeCategory === 'ALL') && filteredTournamentPlans.length > 0 && (
                  <section className="space-y-3">
                    <div className="flex items-center justify-between pb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🏆</span>
                        <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
                          Tournament Organizers ({filteredTournamentPlans.length})
                        </h2>
                      </div>
                      <button
                        onClick={() => openCreatePlanModal('TOURNAMENT')}
                        className="text-[11px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Tournament Pack</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                      {filteredTournamentPlans.map((p) => renderPlanCard(p, 'TOURNAMENT', 'rgba(245, 158, 11, 0.45)'))}
                    </div>
                  </section>
                )}

                {/* 3. ACADEMIES */}
                {(activeCategory === 'ACADEMY' || activeCategory === 'ALL') && filteredAcademyPlans.length > 0 && (
                  <section className="space-y-3">
                    <div className="flex items-center justify-between pb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🎓</span>
                        <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-sky-700 dark:text-sky-400">
                          Sports Academies ({filteredAcademyPlans.length})
                        </h2>
                      </div>
                      <button
                        onClick={() => openCreatePlanModal('ACADEMY')}
                        className="text-[11px] font-black uppercase tracking-wider text-sky-700 dark:text-sky-400 hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Academy Plan</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                      {filteredAcademyPlans.map((p) => renderPlanCard(p, 'ACADEMY', 'rgba(14, 165, 233, 0.45)'))}
                    </div>
                  </section>
                )}

                {/* 4. CLUBS */}
                {(activeCategory === 'CLUB' || activeCategory === 'ALL') && filteredClubPlans.length > 0 && (
                  <section className="space-y-3">
                    <div className="flex items-center justify-between pb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base">👥</span>
                        <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-purple-700 dark:text-purple-400">
                          Recreational Clubs ({filteredClubPlans.length})
                        </h2>
                      </div>
                      <button
                        onClick={() => openCreatePlanModal('CLUB')}
                        className="text-[11px] font-black uppercase tracking-wider text-purple-700 dark:text-purple-400 hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Club Plan</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      {filteredClubPlans.map((p) => renderPlanCard(p, 'CLUB', 'rgba(168, 85, 247, 0.45)'))}
                    </div>
                  </section>
                )}

                {/* 5. COACHES */}
                {(activeCategory === 'COACH' || activeCategory === 'ALL') && filteredCoachPlans.length > 0 && (
                  <section className="space-y-3">
                    <div className="flex items-center justify-between pb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🏋️‍♂️</span>
                        <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-rose-700 dark:text-rose-400">
                          Solo Coaches &amp; Trainers ({filteredCoachPlans.length})
                        </h2>
                      </div>
                      <button
                        onClick={() => openCreatePlanModal('COACH')}
                        className="text-[11px] font-black uppercase tracking-wider text-rose-700 dark:text-rose-400 hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Coach Plan</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 max-w-2xl">
                      {filteredCoachPlans.map((p) => renderPlanCard(p, 'COACH', 'rgba(244, 63, 94, 0.45)'))}
                    </div>
                  </section>
                )}

                {/* 6. COMMUNITIES */}
                {(activeCategory === 'COMMUNITY' || activeCategory === 'ALL') && filteredCommunityPlans.length > 0 && (
                  <section className="space-y-3">
                    <div className="flex items-center justify-between pb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🌐</span>
                        <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-teal-700 dark:text-teal-400">
                          Communities &amp; Groups ({filteredCommunityPlans.length})
                        </h2>
                      </div>
                      <button
                        onClick={() => openCreatePlanModal('COMMUNITY')}
                        className="text-[11px] font-black uppercase tracking-wider text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Community Plan</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 max-w-2xl">
                      {filteredCommunityPlans.map((p) => renderPlanCard(p, 'COMMUNITY', 'rgba(20, 184, 166, 0.45)'))}
                    </div>
                  </section>
                )}
              </>
            );
          })()}

          {/* ═══════════════════════════════════════════════════════════
              SECTION: ARCHIVED LEGACY PACKAGES
              ═══════════════════════════════════════════════════════════ */}
          {(activeCategory === 'LEGACY' || (activeCategory === 'ALL' && !q)) && filteredLegacyPackages.length > 0 && (
            <section className="space-y-3 pt-6 border-t" style={{ borderColor: 'var(--athlon-border)' }}>
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2">
                  <Archive className="w-4 h-4" style={{ color: 'var(--athlon-text-muted)' }} />
                  <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider" style={{ color: 'var(--athlon-text)' }}>
                    Archived Classic Packages ({filteredLegacyPackages.length})
                  </h2>
                </div>
                <span
                  className="text-[9px] font-mono px-2 py-0.5 rounded-full border"
                  style={{
                    backgroundColor: 'var(--athlon-surface)',
                    borderColor: 'var(--athlon-border)',
                    color: 'var(--athlon-text-muted)',
                  }}
                >
                  Classic DB Packages
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {filteredLegacyPackages.map((pkg) => (
                  <div
                    key={pkg.uuid || pkg.packageId}
                    className="rounded-2xl p-4 border flex flex-col justify-between shadow-xs transition-all hover:shadow-sm"
                    style={{
                      backgroundColor: 'var(--athlon-card)',
                      borderColor: 'var(--athlon-border)',
                    }}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-black text-xs truncate" style={{ color: 'var(--athlon-text)' }}>
                          {pkg.name}
                        </h3>
                        <span
                          className="text-[9px] font-mono px-1.5 py-0.2 rounded-full border shrink-0"
                          style={{
                            backgroundColor: 'var(--athlon-surface)',
                            borderColor: 'var(--athlon-border)',
                            color: 'var(--athlon-text-muted)',
                          }}
                        >
                          Archived
                        </span>
                      </div>

                      <div
                        className="p-2 rounded-xl border flex items-baseline gap-1"
                        style={{
                          backgroundColor: 'var(--athlon-surface)',
                          borderColor: 'var(--athlon-border)',
                        }}
                      >
                        <span className="text-lg font-black font-mono" style={{ color: 'var(--athlon-text)' }}>
                          ₹{pkg.price?.toLocaleString('en-IN') ?? 0}
                        </span>
                        <span className="text-[10px]" style={{ color: 'var(--athlon-text-muted)' }}>
                          / {pkg.durationMonths} {pkg.durationMonths === 1 ? 'Month' : 'Months'}
                        </span>
                      </div>

                      {pkg.description && (
                        <p className="text-[10px] line-clamp-2 leading-relaxed" style={{ color: 'var(--athlon-text-secondary)' }}>
                          {pkg.description}
                        </p>
                      )}

                      {pkg.features && (
                        <div className="flex flex-wrap gap-1">
                          {pkg.features.split(',').map((feat, idx) => (
                            <span
                              key={idx}
                              className="text-[8.5px] px-1.5 py-0.2 rounded border"
                              style={{
                                backgroundColor: 'var(--athlon-surface)',
                                borderColor: 'var(--athlon-border)',
                                color: 'var(--athlon-text)',
                              }}
                            >
                              {feat.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div
                      className="pt-2 mt-2 border-t flex items-center justify-between text-[9px] font-mono"
                      style={{
                        borderColor: 'var(--athlon-border)',
                        color: 'var(--athlon-text-muted)',
                      }}
                    >
                      <span>ID: {pkg.packageId || pkg.uuid?.slice(0, 8)}</span>
                      <span>Classic Tier</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Empty State */}
          {filteredVenuePlans.length === 0 &&
            filteredTournamentPlans.length === 0 &&
            filteredAcademyPlans.length === 0 &&
            filteredClubPlans.length === 0 &&
            filteredCoachPlans.length === 0 &&
            filteredCommunityPlans.length === 0 &&
            filteredLegacyPackages.length === 0 && (
              <div
                className="p-12 rounded-2xl border text-center space-y-2.5"
                style={{
                  backgroundColor: 'var(--athlon-card)',
                  borderColor: 'var(--athlon-border)',
                }}
              >
                <Package className="w-8 h-8 mx-auto opacity-40" style={{ color: 'var(--athlon-text-muted)' }} />
                <h3 className="text-sm font-bold" style={{ color: 'var(--athlon-text)' }}>
                  No plans matched your criteria
                </h3>
                <p className="text-xs" style={{ color: 'var(--athlon-text-muted)' }}>
                  Try adjusting your search query or selecting a different vertical tab.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setPriceFilter('ALL');
                    setActiveCategory('ALL');
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border"
                  style={{
                    backgroundColor: 'var(--athlon-surface)',
                    borderColor: 'var(--athlon-border)',
                    color: 'var(--athlon-text)',
                  }}
                >
                  Reset Filters
                </button>
              </div>
            )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          5. DETAILS & ENTITLEMENTS INSPECTOR MODAL
          ───────────────────────────────────────────────────────────── */}
      {inspectedPlan && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div
            className="max-w-xl w-full max-h-[85vh] overflow-y-auto rounded-2xl sm:rounded-3xl border p-5 sm:p-7 space-y-5 shadow-2xl relative"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
              color: 'var(--athlon-text)',
            }}
          >
            <div className="flex items-start justify-between gap-3 pb-3 border-b" style={{ borderColor: 'var(--athlon-border)' }}>
              <div>
                <span
                  className="text-[9px] font-mono px-2 py-0.5 rounded-full border uppercase tracking-wider font-bold"
                  style={{
                    backgroundColor: 'var(--athlon-surface)',
                    borderColor: 'var(--athlon-border)',
                    color: 'var(--athlon-text-muted)',
                  }}
                >
                  {inspectedPlan.category}
                </span>
                <h2 className="text-lg sm:text-xl font-black mt-1" style={{ color: 'var(--athlon-text)' }}>
                  {inspectedPlan.title}
                </h2>
                <div className="text-[11px] font-mono" style={{ color: 'var(--athlon-text-muted)' }}>
                  Code: {inspectedPlan.code} • Version: v{inspectedPlan.version || 1}
                </div>
              </div>
              <button
                onClick={() => setInspectedPlan(null)}
                className="p-1.5 rounded-xl hover:opacity-80 transition-opacity"
                style={{
                  backgroundColor: 'var(--athlon-surface)',
                  color: 'var(--athlon-text)',
                }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div
              className="grid grid-cols-2 gap-2.5 p-3 rounded-xl border text-center"
              style={{
                backgroundColor: 'var(--athlon-surface)',
                borderColor: 'var(--athlon-border)',
              }}
            >
              <div>
                <div className="text-[9px] font-mono uppercase" style={{ color: 'var(--athlon-text-muted)' }}>
                  Primary Pricing
                </div>
                <div className="text-lg font-black font-mono" style={{ color: 'var(--athlon-text)' }}>
                  {inspectedPlan.priceFormatted}
                </div>
              </div>
              {inspectedPlan.priceSecondary && (
                <div>
                  <div className="text-[9px] font-mono uppercase" style={{ color: 'var(--athlon-text-muted)' }}>
                    Annual / Details
                  </div>
                  <div className="text-sm font-black font-mono text-emerald-700 dark:text-emerald-400 mt-0.5">
                    {inspectedPlan.priceSecondary}
                  </div>
                </div>
              )}
            </div>

            {inspectedPlan.description && (
              <p
                className="text-xs leading-relaxed p-3 rounded-xl border"
                style={{
                  backgroundColor: 'var(--athlon-surface)',
                  borderColor: 'var(--athlon-border)',
                  color: 'var(--athlon-text-secondary)',
                }}
              >
                {inspectedPlan.description}
              </p>
            )}

            {inspectedPlan.limits && Object.keys(inspectedPlan.limits).length > 0 && (
              <div className="space-y-2">
                <h4 className="text-[11px] font-black uppercase tracking-wider" style={{ color: 'var(--athlon-text-muted)' }}>
                  Enforced Capacity Limits &amp; Ceilings
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.entries(inspectedPlan.limits).map(([limKey, val]) => (
                    <div
                      key={limKey}
                      className="p-2.5 rounded-xl border flex items-center justify-between"
                      style={{
                        backgroundColor: 'var(--athlon-surface)',
                        borderColor: 'var(--athlon-border)',
                      }}
                    >
                      <span className="text-[11px] font-medium" style={{ color: 'var(--athlon-text-secondary)' }}>
                        {formatLimitLabel(limKey)}
                      </span>
                      <span className="text-xs font-black font-mono text-emerald-700 dark:text-emerald-400">
                        {String(val)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {inspectedPlan.features && (
              <div className="space-y-2">
                <h4 className="text-[11px] font-black uppercase tracking-wider" style={{ color: 'var(--athlon-text-muted)' }}>
                  Feature Permissions Matrix ({Object.keys(inspectedPlan.features).length} Controls)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto p-1">
                  {Object.entries(inspectedPlan.features).map(([featKey, enabled]) => (
                    <div
                      key={featKey}
                      className="flex items-center justify-between p-2 rounded-xl text-[11px] border"
                      style={
                        enabled
                          ? {
                              backgroundColor: 'rgba(16, 185, 129, 0.08)',
                              borderColor: 'rgba(16, 185, 129, 0.25)',
                              color: 'var(--athlon-text)',
                            }
                          : {
                              backgroundColor: 'var(--athlon-surface)',
                              borderColor: 'var(--athlon-border)',
                              color: 'var(--athlon-text-muted)',
                            }
                      }
                    >
                      <span className="truncate pr-2 font-medium">
                        {formatFeatureName(featKey)}
                      </span>
                      {enabled ? (
                        <span className="px-1.5 py-0.2 rounded text-[8.5px] font-black bg-emerald-500/20 text-emerald-800 dark:text-emerald-300">
                          ACTIVE
                        </span>
                      ) : (
                        <span
                          className="px-1.5 py-0.2 rounded text-[8.5px] font-mono border"
                          style={{
                            backgroundColor: 'var(--athlon-card)',
                            borderColor: 'var(--athlon-border)',
                            color: 'var(--athlon-text-muted)',
                          }}
                        >
                          LOCKED
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-3 border-t flex items-center justify-between" style={{ borderColor: 'var(--athlon-border)' }}>
              <div className="text-[10px] font-mono" style={{ color: 'var(--athlon-text-muted)' }}>
                UUID: {inspectedPlan.uuid?.slice(0, 13)}...
              </div>
              <button
                onClick={() => setInspectedPlan(null)}
                className="px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider border transition-all hover:opacity-90"
                style={{
                  backgroundColor: 'var(--athlon-surface)',
                  borderColor: 'var(--athlon-border)',
                  color: 'var(--athlon-text)',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          6. CREATE / EDIT SUBSCRIPTION PLAN MODAL (USING POST API)
          ───────────────────────────────────────────────────────────── */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div
            className="max-w-2xl w-full max-h-[90vh] overflow-y-auto border rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
              color: 'var(--athlon-text)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--athlon-border)' }}>
              <div className="flex items-center gap-2.5">
                <div
                  className="w-10 h-10 rounded-xl border flex items-center justify-center"
                  style={{
                    backgroundColor: 'var(--athlon-surface)',
                    borderColor: 'var(--athlon-border)',
                    color: 'var(--athlon-primary)',
                  }}
                >
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black uppercase tracking-tight" style={{ color: 'var(--athlon-text)' }}>
                    {modalMode === 'CREATE' ? 'Add New Subscription Plan' : `Edit Plan: ${planForm.name}`}
                  </h3>
                  <p className="text-xs" style={{ color: 'var(--athlon-text-muted)' }}>
                    {modalMode === 'CREATE'
                      ? 'Publish a new operational plan tier via @PostMapping'
                      : 'Update live pricing, capacity quotas, and feature permissions'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPlanModalOpen(false)}
                className="p-1.5 rounded-lg transition-colors hover:opacity-80"
                style={{ color: 'var(--athlon-text-muted)' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSavePlanSubmit} className="space-y-4">
              {/* Target Module Picker */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider block mb-1" style={{ color: 'var(--athlon-text-secondary)' }}>
                  Vertical / Target Module *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(['VENUE', 'TOURNAMENT', 'ACADEMY', 'CLUB', 'COACH', 'COMMUNITY'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      disabled={modalMode === 'EDIT'}
                      onClick={() => {
                        const defaultFeats: Record<string, boolean> = {};
                        (MODULE_DEFAULT_FEATURES[m] || []).forEach((f) => {
                          defaultFeats[f] = true;
                        });
                        setPlanForm((prev) => ({
                          ...prev,
                          targetModule: m,
                          features: defaultFeats,
                        }));
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-left flex items-center gap-2 ${
                        planForm.targetModule === m ? 'shadow-md font-black ring-2 ring-emerald-500/50' : 'hover:opacity-80'
                      }`}
                      style={{
                        backgroundColor: planForm.targetModule === m ? 'var(--athlon-surface)' : 'var(--athlon-card)',
                        borderColor: planForm.targetModule === m ? 'var(--athlon-primary)' : 'var(--athlon-border)',
                        color: 'var(--athlon-text)',
                      }}
                    >
                      <span className="text-base">
                        {m === 'VENUE' ? '🏟️' : m === 'TOURNAMENT' ? '🏆' : m === 'ACADEMY' ? '🎓' : m === 'CLUB' ? '👥' : m === 'COACH' ? '🏋️‍♂️' : '🌐'}
                      </span>
                      <span>{m}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Plan Name & Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider block mb-1" style={{ color: 'var(--athlon-text-secondary)' }}>
                    Display Plan Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={planForm.name}
                    onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                    placeholder="E.g., Venue Pro Plus, Academy Elite"
                    className="w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none transition-colors"
                    style={{
                      backgroundColor: 'var(--athlon-surface)',
                      borderColor: 'var(--athlon-border)',
                      color: 'var(--athlon-text)',
                    }}
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider block mb-1" style={{ color: 'var(--athlon-text-secondary)' }}>
                    Internal Plan Code {modalMode === 'CREATE' && '(Optional - auto-generated)'}
                  </label>
                  <input
                    type="text"
                    disabled={modalMode === 'EDIT'}
                    value={planForm.planCode}
                    onChange={(e) => setPlanForm({ ...planForm, planCode: e.target.value.toUpperCase() })}
                    placeholder="E.g., VENUE_PRO_PLUS"
                    className="w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none transition-colors font-mono"
                    style={{
                      backgroundColor: 'var(--athlon-surface)',
                      borderColor: 'var(--athlon-border)',
                      color: 'var(--athlon-text)',
                    }}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider block mb-1" style={{ color: 'var(--athlon-text-secondary)' }}>
                  Description / Synopsis
                </label>
                <textarea
                  value={planForm.description}
                  onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                  placeholder="Overview of capabilities and target audience for this tier..."
                  className="w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none resize-none h-14 transition-colors"
                  style={{
                    backgroundColor: 'var(--athlon-surface)',
                    borderColor: 'var(--athlon-border)',
                    color: 'var(--athlon-text)',
                  }}
                />
              </div>

              {/* Pricing Grid */}
              <div className="p-3.5 rounded-xl border space-y-3" style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}>
                <div className="text-[11px] font-black uppercase tracking-wider" style={{ color: 'var(--athlon-text)' }}>
                  Pricing Configuration
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {planForm.targetModule !== 'TOURNAMENT' ? (
                    <>
                      <div>
                        <label className="text-[10px] font-bold uppercase block mb-1" style={{ color: 'var(--athlon-text-muted)' }}>
                          Monthly Price (₹)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={planForm.monthlyPrice}
                          onChange={(e) => setPlanForm({ ...planForm, monthlyPrice: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-xl border text-xs font-mono"
                          style={{
                            backgroundColor: 'var(--athlon-card)',
                            borderColor: 'var(--athlon-border)',
                            color: 'var(--athlon-text)',
                          }}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase block mb-1" style={{ color: 'var(--athlon-text-muted)' }}>
                          Yearly Price (₹)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={planForm.yearlyPrice}
                          onChange={(e) => setPlanForm({ ...planForm, yearlyPrice: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-xl border text-xs font-mono"
                          style={{
                            backgroundColor: 'var(--athlon-card)',
                            borderColor: 'var(--athlon-border)',
                            color: 'var(--athlon-text)',
                          }}
                        />
                      </div>
                    </>
                  ) : (
                    <div>
                      <label className="text-[10px] font-bold uppercase block mb-1" style={{ color: 'var(--athlon-text-muted)' }}>
                        Package Price (₹)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={planForm.packagePrice}
                        onChange={(e) => setPlanForm({ ...planForm, packagePrice: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-xl border text-xs font-mono"
                        style={{
                          backgroundColor: 'var(--athlon-card)',
                          borderColor: 'var(--athlon-border)',
                          color: 'var(--athlon-text)',
                        }}
                      />
                    </div>
                  )}

                  {planForm.targetModule === 'VENUE' && (
                    <div>
                      <label className="text-[10px] font-bold uppercase block mb-1" style={{ color: 'var(--athlon-text-muted)' }}>
                        Commission (%)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={planForm.commissionRate}
                        onChange={(e) => setPlanForm({ ...planForm, commissionRate: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-xl border text-xs font-mono"
                        style={{
                          backgroundColor: 'var(--athlon-card)',
                          borderColor: 'var(--athlon-border)',
                          color: 'var(--athlon-text)',
                        }}
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-[10px] font-bold uppercase block mb-1" style={{ color: 'var(--athlon-text-muted)' }}>
                      Active Status
                    </label>
                    <select
                      value={planForm.isActive}
                      onChange={(e) => setPlanForm({ ...planForm, isActive: parseInt(e.target.value, 10) })}
                      className="w-full px-3 py-1.5 rounded-xl border text-xs font-bold"
                      style={{
                        backgroundColor: 'var(--athlon-card)',
                        borderColor: 'var(--athlon-border)',
                        color: 'var(--athlon-text)',
                      }}
                    >
                      <option value={1}>Active</option>
                      <option value={0}>Inactive (Paused)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Dynamic Capacity Quotas */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider block" style={{ color: 'var(--athlon-text-secondary)' }}>
                  Enforced Capacity Quotas &amp; Ceilings
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {Object.entries(planForm.limits).map(([limitCode, limitVal]) => (
                    <div
                      key={limitCode}
                      className="p-2.5 rounded-xl border"
                      style={{
                        backgroundColor: 'var(--athlon-surface)',
                        borderColor: 'var(--athlon-border)',
                      }}
                    >
                      <label className="text-[9px] font-mono uppercase block mb-1 truncate" style={{ color: 'var(--athlon-text-muted)' }}>
                        {formatLimitLabel(limitCode)}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={limitVal}
                        onChange={(e) =>
                          setPlanForm({
                            ...planForm,
                            limits: { ...planForm.limits, [limitCode]: e.target.value },
                          })
                        }
                        className="w-full px-2.5 py-1 rounded-lg border text-xs font-black font-mono"
                        style={{
                          backgroundColor: 'var(--athlon-card)',
                          borderColor: 'var(--athlon-border)',
                          color: 'var(--athlon-text)',
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Feature Permissions Checkbox Grid */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--athlon-text-secondary)' }}>
                    Feature Entitlements ({Object.keys(planForm.features).length} Controls)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const allEnabled = Object.values(planForm.features).every(Boolean);
                      const updated: Record<string, boolean> = {};
                      Object.keys(planForm.features).forEach((k) => {
                        updated[k] = !allEnabled;
                      });
                      setPlanForm({ ...planForm, features: updated });
                    }}
                    className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                  >
                    Toggle All
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 border rounded-xl" style={{ borderColor: 'var(--athlon-border)' }}>
                  {Object.entries(planForm.features).map(([featCode, isEnabled]) => (
                    <label
                      key={featCode}
                      className="flex items-center justify-between p-2 rounded-xl text-xs border cursor-pointer select-none transition-colors"
                      style={
                        isEnabled
                          ? {
                              backgroundColor: 'rgba(16, 185, 129, 0.08)',
                              borderColor: 'rgba(16, 185, 129, 0.3)',
                              color: 'var(--athlon-text)',
                            }
                          : {
                              backgroundColor: 'var(--athlon-surface)',
                              borderColor: 'var(--athlon-border)',
                              color: 'var(--athlon-text-muted)',
                            }
                      }
                    >
                      <span className="truncate pr-2 font-medium">{formatFeatureName(featCode)}</span>
                      <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={(e) =>
                          setPlanForm({
                            ...planForm,
                            features: { ...planForm.features, [featCode]: e.target.checked },
                          })
                        }
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-0 shrink-0 cursor-pointer"
                      />
                    </label>
                  ))}
                </div>
              </div>

              {planFormError && (
                <div className="text-xs text-red-600 dark:text-red-400 bg-red-500/10 p-2.5 rounded-xl border border-red-500/20">
                  {planFormError}
                </div>
              )}

              {/* Submit Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t" style={{ borderColor: 'var(--athlon-border)' }}>
                <button
                  type="button"
                  onClick={() => setIsPlanModalOpen(false)}
                  disabled={savingPlan}
                  className="px-4 py-2 rounded-xl text-xs font-bold border transition-colors hover:opacity-80"
                  style={{
                    backgroundColor: 'var(--athlon-surface)',
                    borderColor: 'var(--athlon-border)',
                    color: 'var(--athlon-text-muted)',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPlan}
                  className="px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider shadow-md hover:opacity-90 transition-all flex items-center gap-1.5"
                  style={{
                    backgroundColor: 'var(--athlon-primary)',
                    color: '#000000',
                  }}
                >
                  {savingPlan ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Plan...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>{modalMode === 'CREATE' ? 'Publish Plan' : 'Save Changes'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          7. CREATE LEGACY PACKAGE MODAL
          ───────────────────────────────────────────────────────────── */}
      {isLegacyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div
            className="max-w-md w-full border rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-2xl space-y-4"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--athlon-border)' }}>
              <div className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-xl border flex items-center justify-center"
                  style={{
                    backgroundColor: 'var(--athlon-surface)',
                    borderColor: 'var(--athlon-border)',
                    color: 'var(--athlon-primary)',
                  }}
                >
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase" style={{ color: 'var(--athlon-text)' }}>
                    Create Classic Package
                  </h3>
                  <p className="text-[11px]" style={{ color: 'var(--athlon-text-muted)' }}>
                    Add to database table subscription_packages
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsLegacyModalOpen(false)}
                className="p-1.5 rounded-lg transition-colors hover:opacity-80"
                style={{ color: 'var(--athlon-text-muted)' }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateLegacyPackage} className="space-y-3.5">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: 'var(--athlon-text-secondary)' }}>
                  Package Name *
                </label>
                <input
                  type="text"
                  required
                  value={legacyName}
                  onChange={(e) => setLegacyName(e.target.value)}
                  placeholder="E.g., Organizer Pro, Academy Hub"
                  className="w-full px-3 py-2 rounded-xl border text-xs focus:outline-none transition-colors"
                  style={{
                    backgroundColor: 'var(--athlon-surface)',
                    borderColor: 'var(--athlon-border)',
                    color: 'var(--athlon-text)',
                  }}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: 'var(--athlon-text-secondary)' }}>
                  Description
                </label>
                <textarea
                  value={legacyDesc}
                  onChange={(e) => setLegacyDesc(e.target.value)}
                  placeholder="Short description of this package..."
                  className="w-full px-3 py-2 rounded-xl border text-xs focus:outline-none resize-none h-14 transition-colors"
                  style={{
                    backgroundColor: 'var(--athlon-surface)',
                    borderColor: 'var(--athlon-border)',
                    color: 'var(--athlon-text)',
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: 'var(--athlon-text-secondary)' }}>
                    Price (INR) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={legacyPrice}
                    onChange={(e) => setLegacyPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-xs focus:outline-none transition-colors font-mono"
                    style={{
                      backgroundColor: 'var(--athlon-surface)',
                      borderColor: 'var(--athlon-border)',
                      color: 'var(--athlon-text)',
                    }}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: 'var(--athlon-text-secondary)' }}>
                    Duration (Months) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="120"
                    value={legacyDuration}
                    onChange={(e) => setLegacyDuration(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-xs focus:outline-none transition-colors font-mono"
                    style={{
                      backgroundColor: 'var(--athlon-surface)',
                      borderColor: 'var(--athlon-border)',
                      color: 'var(--athlon-text)',
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: 'var(--athlon-text-secondary)' }}>
                  Features (Comma separated)
                </label>
                <textarea
                  value={legacyFeatures}
                  onChange={(e) => setLegacyFeatures(e.target.value)}
                  placeholder="E.g., Tournament Management, Live Scoring, Up to 64 Teams"
                  className="w-full px-3 py-2 rounded-xl border text-xs focus:outline-none resize-none h-16 transition-colors"
                  style={{
                    backgroundColor: 'var(--athlon-surface)',
                    borderColor: 'var(--athlon-border)',
                    color: 'var(--athlon-text)',
                  }}
                />
              </div>

              {legacyFormError && (
                <div className="text-xs text-red-600 dark:text-red-400 bg-red-500/10 p-2 rounded-xl border border-red-500/20">
                  {legacyFormError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2.5 border-t" style={{ borderColor: 'var(--athlon-border)' }}>
                <button
                  type="button"
                  onClick={() => setIsLegacyModalOpen(false)}
                  disabled={submittingLegacy}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-colors hover:opacity-80"
                  style={{
                    backgroundColor: 'var(--athlon-surface)',
                    borderColor: 'var(--athlon-border)',
                    color: 'var(--athlon-text-muted)',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingLegacy}
                  className="px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-md hover:opacity-90 transition-all"
                  style={{
                    backgroundColor: 'var(--athlon-primary)',
                    color: '#000000',
                  }}
                >
                  {submittingLegacy ? 'Creating...' : 'Create Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
