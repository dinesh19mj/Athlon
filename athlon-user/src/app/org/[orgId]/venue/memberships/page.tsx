'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  CreditCard,
  Plus,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Crown,
  Search,
  User,
  Zap,
  ArrowRight,
  TrendingUp,
  Percent,
  Check,
  IndianRupee,
  Activity,
  Layers,
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
  Eye,
  XCircle,
  Shield,
  Building2,
  UserCheck,
  ChevronRight
} from 'lucide-react';
import {
  venueMembershipApi,
  VenueMembership,
  VenueCustomerMembership,
  AssignMembershipRequest
} from '@/lib/api/venueMembership';
import { venueCustomerApi, VenueCustomer } from '@/lib/api/venueCustomer';
import { SubscriptionService, VenueEntitlementSummary } from '@/lib/api/subscription';
import { FeaturePaywallModal } from '@/components/venue/FeaturePaywallModal';
import { useVenueEntitlementsStore } from '@/store/useVenueEntitlementsStore';

export default function VenueMembershipsPage() {
  const params = useParams();
  const orgId = params?.orgId as string;

  const {
    entitlementsByOrg,
    refreshEntitlements: refreshStoreEntitlements,
  } = useVenueEntitlementsStore();
  const storeEntitlements = orgId ? entitlementsByOrg[orgId] : null;

  const [activeTab, setActiveTab] = useState<'plans' | 'wallets'>('plans');
  const [plans, setPlans] = useState<VenueMembership[]>([]);
  const [customerMemberships, setCustomerMemberships] = useState<VenueCustomerMembership[]>([]);
  const [customers, setCustomers] = useState<VenueCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [localEntitlements, setEntitlements] = useState<VenueEntitlementSummary | null>(null);
  const entitlements = storeEntitlements || localEntitlements;
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);

  // Desktop search & filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [desktopViewMode, setDesktopViewMode] = useState<'cards' | 'table'>('cards');
  const [inspectedPass, setInspectedPass] = useState<VenueCustomerMembership | null>(null);

  // Create Plan Modal
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [planName, setPlanName] = useState('');
  const [planDesc, setPlanDesc] = useState('');
  const [planPrice, setPlanPrice] = useState(2500);
  const [planHours, setPlanHours] = useState(10);
  const [planValidityDays, setPlanValidityDays] = useState(60);
  const [planDiscount, setPlanDiscount] = useState(15);
  const [savingPlan, setSavingPlan] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);

  // Assign Plan Modal
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | ''>('');
  const [selectedPlanId, setSelectedPlanId] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);

  // Deduct Hours Modal
  const [deductModalItem, setDeductModalItem] = useState<VenueCustomerMembership | null>(null);
  const [hoursToDeduct, setHoursToDeduct] = useState(1);
  const [deductNotes, setDeductNotes] = useState('Court session check-in');
  const [deducting, setDeducting] = useState(false);
  const [deductError, setDeductError] = useState<string | null>(null);

  useEffect(() => {
    if (!orgId) return;
    loadEntitlements();
    loadData();
  }, [orgId]);

  const loadEntitlements = async () => {
    try {
      const ent = await refreshStoreEntitlements(orgId);
      if (ent) {
        setEntitlements(ent);
      }
    } catch (e) {
      console.warn('Failed to fetch entitlements:', e);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [pRes, mRes, cRes] = await Promise.all([
        venueMembershipApi.getPlans(orgId),
        venueMembershipApi.getCustomerMemberships(orgId, { size: 100 }),
        venueCustomerApi.getCustomers(orgId, { size: 100 }),
      ]);
      setPlans(pRes || []);
      setCustomerMemberships(mRes?.content || []);
      setCustomers(cRes?.content || []);
    } catch (e) {
      console.error('Failed to load membership data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([loadEntitlements(), loadData()]);
    } finally {
      setRefreshing(false);
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planName.trim()) {
      setPlanError('Plan name is required');
      return;
    }
    setSavingPlan(true);
    setPlanError(null);
    try {
      await venueMembershipApi.createPlan({
        organizationUuid: orgId,
        name: planName.trim(),
        description: planDesc.trim() || undefined,
        price: planPrice,
        totalHours: planHours,
        validityDays: planValidityDays,
        discountPercentage: planDiscount,
        isActive: true,
      });
      setIsPlanModalOpen(false);
      loadData();
    } catch (err: any) {
      setPlanError(err?.data?.message || err?.message || 'Failed to create membership plan');
    } finally {
      setSavingPlan(false);
    }
  };

  const handleAssignMembership = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || !selectedPlanId) {
      setAssignError('Please select both a player and a membership plan');
      return;
    }
    setAssigning(true);
    setAssignError(null);
    try {
      const foundCustomer = customers.find(c => c.customerId === Number(selectedCustomerId));
      await venueMembershipApi.assignMembership({
        organizationUuid: orgId,
        customerId: Number(selectedCustomerId),
        customerUuid: foundCustomer?.customerUuid,
        membershipId: Number(selectedPlanId),
        paymentMethod,
        amountPaid,
      });
      setIsAssignModalOpen(false);
      loadData();
      setActiveTab('wallets');
    } catch (err: any) {
      setAssignError(err?.data?.message || err?.message || 'Failed to assign membership');
    } finally {
      setAssigning(false);
    }
  };

  const handleDeductHours = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deductModalItem) return;
    setDeducting(true);
    setDeductError(null);
    try {
      const res = await venueMembershipApi.deductCredits(
        deductModalItem.customerMembershipUuid,
        hoursToDeduct,
        deductNotes
      );
      if (inspectedPass && inspectedPass.customerMembershipUuid === deductModalItem.customerMembershipUuid) {
        setInspectedPass({
          ...inspectedPass,
          remainingHours: res?.remainingHours ?? Math.max(0, inspectedPass.remainingHours - hoursToDeduct),
          status: (res?.status as any) || inspectedPass.status,
        });
      }
      setDeductModalItem(null);
      loadData();
    } catch (err: any) {
      setDeductError(err?.data?.message || err?.message || 'Failed to deduct membership credits');
    } finally {
      setDeducting(false);
    }
  };

  const openAssignModalForPlan = (plan: VenueMembership) => {
    if (entitlements && !entitlements.features?.VENUE_MEMBERSHIPS) {
      setIsPaywallOpen(true);
      return;
    }
    setSelectedPlanId(plan.membershipId);
    setAmountPaid(plan.price);
    setIsAssignModalOpen(true);
  };

  const hasMembershipFeature = entitlements?.features?.VENUE_MEMBERSHIPS ?? true;

  // Active wallets metrics
  const metrics = useMemo(() => {
    const activePasses = customerMemberships.filter(m => m.status === 'ACTIVE');
    const activePassesCount = activePasses.length;
    const totalHoursOutstanding = activePasses.reduce((acc, m) => acc + (m.remainingHours || 0), 0);
    const totalHoursGranted = customerMemberships.reduce((acc, m) => acc + (m.totalHoursGranted || 0), 0);
    const totalAdvanceRevenue = customerMemberships.reduce((acc, m) => acc + (Number(m.amountPaid) || 0), 0);
    const avgHourlyYield = totalHoursGranted > 0 ? Math.round(totalAdvanceRevenue / totalHoursGranted) : 0;
    const totalPasses = customerMemberships.length;
    const retentionRate = totalPasses > 0 ? Math.round((activePassesCount / totalPasses) * 100) : 100;

    return {
      activePassesCount,
      totalHoursOutstanding,
      totalHoursGranted,
      totalAdvanceRevenue,
      avgHourlyYield,
      totalPasses,
      retentionRate
    };
  }, [customerMemberships]);

  const getInitials = (name?: string) => {
    if (!name) return 'PL';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const formatExpiryCountdown = (dateStr?: string) => {
    if (!dateStr) return 'No expiry';
    const expiry = new Date(dateStr);
    if (isNaN(expiry.getTime())) return dateStr;
    const now = new Date();
    const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'Expired';
    if (diffDays === 0) return 'Expires today';
    if (diffDays === 1) return 'Expires tomorrow';
    return `${diffDays} days left`;
  };

  // Filtered passes
  const filteredCustomerMemberships = useMemo(() => {
    return customerMemberships.filter((m) => {
      if (statusFilter !== 'ALL' && m.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = m.customerName?.toLowerCase().includes(q);
        const matchPhone = m.customerPhone?.toLowerCase().includes(q);
        const matchPackage = m.membershipName?.toLowerCase().includes(q);
        const matchMethod = m.paymentMethod?.toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchPackage && !matchMethod) return false;
      }
      return true;
    });
  }, [customerMemberships, statusFilter, searchQuery]);

  // Filtered plans
  const filteredPlans = useMemo(() => {
    if (!searchQuery.trim()) return plans;
    const q = searchQuery.toLowerCase();
    return plans.filter((p) => {
      return p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q);
    });
  }, [plans, searchQuery]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">

      {/* ========================================================================= */}
      {/* 1. MOBILE VIEW (block md:hidden) - 100% UNTOUCHED ORIGINAL LAYOUT        */}
      {/* ========================================================================= */}
      <div className="block md:hidden space-y-4">
        {/* Mobile Header Banner */}
        <div className="flex flex-col justify-between items-start gap-4 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
                <CreditCard className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight">Memberships & Prepaid</h1>
              {!hasMembershipFeature && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                  <Crown className="w-3 h-3" /> Pro
                </span>
              )}
            </div>
            <p className="text-slate-400 text-xs">
              Offer recurring hour packages, prepaid passes, and track player wallet balances.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full">
            <button
              onClick={() => {
                if (entitlements && !entitlements.features?.VENUE_MEMBERSHIPS) {
                  setIsPaywallOpen(true);
                  return;
                }
                setIsPlanModalOpen(true);
              }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl transition shadow-lg shadow-indigo-600/25 active:scale-95"
            >
              <Plus className="w-4 h-4" /> Create Package
            </button>
          </div>
        </div>

        {/* Mobile Feature Locked Banner */}
        {!hasMembershipFeature && (
          <div className="bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-900 border border-amber-500/30 p-4 rounded-2xl space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-400">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Unlock Prepaid Hours</h3>
                <p className="text-xs text-slate-400">
                  Upgrade to Professional plan to issue prepaid passes and credit wallets.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsPaywallOpen(true)}
              className="w-full py-2 bg-amber-500 text-black font-semibold text-xs rounded-xl"
            >
              Upgrade Plan
            </button>
          </div>
        )}

        {/* Mobile Tabs */}
        <div className="flex border-b border-slate-800 space-x-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('plans')}
            className={`pb-2.5 transition border-b-2 ${
              activeTab === 'plans'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-slate-400'
            }`}
          >
            Packages ({plans.length})
          </button>
          <button
            onClick={() => setActiveTab('wallets')}
            className={`pb-2.5 transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'wallets'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-slate-400'
            }`}
          >
            Player Passes ({customerMemberships.length})
          </button>
        </div>

        {/* Mobile Content */}
        {activeTab === 'plans' ? (
          <div className="space-y-3">
            {loading ? (
              <div className="p-8 text-center text-slate-400">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500 mb-2" />
                <p className="text-xs">Loading packages...</p>
              </div>
            ) : plans.length === 0 ? (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center space-y-2">
                <CreditCard className="w-10 h-10 text-slate-600 mx-auto" />
                <h3 className="text-sm font-semibold text-white">No membership plans</h3>
                <p className="text-xs text-slate-400">Create 10-hour passes to boost recurring revenue.</p>
              </div>
            ) : (
              plans.map((p) => (
                <div
                  key={p.membershipId}
                  className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm">{p.name}</h4>
                      <div className="text-xs text-indigo-400 font-semibold mt-0.5">{p.totalHours} Play Hours</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-white text-base">₹{p.price.toLocaleString('en-IN')}</div>
                      <div className="text-[10px] text-slate-500">{p.validityDays} days validity</div>
                    </div>
                  </div>
                  <button
                    onClick={() => openAssignModalForPlan(p)}
                    className="w-full py-2 bg-slate-800 active:bg-indigo-600 text-white text-xs font-semibold rounded-xl transition"
                  >
                    Assign to Player
                  </button>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {customerMemberships.length === 0 ? (
              <div className="p-8 text-center bg-slate-900/60 border border-slate-800 rounded-2xl text-slate-400">
                <CreditCard className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="text-xs">No active player passes yet.</p>
              </div>
            ) : (
              customerMemberships.map((m) => (
                <div
                  key={m.customerMembershipUuid}
                  className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm">{m.customerName || `Customer #${m.customerId}`}</h4>
                      <div className="text-xs text-slate-400">{m.membershipName}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {m.remainingHours} hrs left
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/60">
                    <span className="text-slate-500">Exp: {m.expiryDate ? new Date(m.expiryDate).toLocaleDateString() : 'N/A'}</span>
                    {m.status === 'ACTIVE' && m.remainingHours > 0 && (
                      <button
                        onClick={() => {
                          setDeductModalItem(m);
                          setHoursToDeduct(1);
                          setDeductNotes('Court check-in');
                        }}
                        className="px-2.5 py-1 bg-indigo-600 text-white text-xs font-bold rounded-lg"
                      >
                        Deduct Hours
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. DESKTOP VIEW (hidden md:block) - ATHLETIC STADIUM WALLET COMMAND CENTER*/}
      {/* ========================================================================= */}
      <div className="hidden md:block space-y-5">

        {/* Desktop Header */}
        <div className="flex items-center justify-between gap-4 pb-1">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground mb-1">
              <span>Venue Monetization</span>
              <span>/</span>
              <span className="text-foreground">Memberships</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">
              Memberships & Prepaid
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Hour packages, prepaid passes, and player credit balances.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              title="Refresh Memberships"
              className="p-2.5 rounded-xl bg-card border border-border/80 hover:bg-white/5 active:scale-95 text-muted-foreground hover:text-foreground transition-all shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-primary' : ''}`} />
            </button>

            <button
              onClick={() => {
                if (plans.length > 0) {
                  setSelectedPlanId(plans[0].membershipId);
                  setAmountPaid(plans[0].price);
                }
                setIsAssignModalOpen(true);
              }}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-background border border-border hover:bg-white/5 font-bold text-xs text-foreground transition-all"
            >
              <CreditCard className="w-4 h-4 text-primary" /> Assign Pass
            </button>

            <button
              onClick={() => {
                if (entitlements && !entitlements.features?.VENUE_MEMBERSHIPS) {
                  setIsPaywallOpen(true);
                  return;
                }
                setIsPlanModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-black font-bold text-xs hover:brightness-110 active:scale-95 transition-all shadow-md shadow-primary/20"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              New Package
            </button>
          </div>
        </div>

        {/* Feature Paywall Banner if locked */}
        {!hasMembershipFeature && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 text-xs">
              <Crown className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-foreground font-medium">Prepaid memberships available with Professional plan</span>
            </div>
            <button
              onClick={() => setIsPaywallOpen(true)}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl transition shrink-0"
            >
              Upgrade Plan
            </button>
          </div>
        )}

        {/* 4 Clean Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-2xl bg-card border border-border/70 hover:border-primary/40 transition-all">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-semibold">Active Member Passes</span>
              <CreditCard className="w-4 h-4 text-primary" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-foreground">{metrics.activePassesCount}</span>
              <span className="text-xs text-muted-foreground font-medium">/ {metrics.totalPasses} total</span>
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground font-medium">
              {plans.length} packages live
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-card border border-border/70 hover:border-indigo-500/40 transition-all">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-semibold">Prepaid Hours Pool</span>
              <Clock className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-indigo-400">{metrics.totalHoursOutstanding}</span>
              <span className="text-xs text-muted-foreground font-medium">hrs unredeemed</span>
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground font-medium">
              {metrics.totalHoursGranted} hrs granted total
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-card border border-border/70 hover:border-emerald-500/40 transition-all">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-semibold">Advance Capital</span>
              <IndianRupee className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-400">₹{metrics.totalAdvanceRevenue.toLocaleString('en-IN')}</span>
            </div>
            <div className="mt-2 text-[11px] text-emerald-400 font-semibold">
              Upfront revenue secured
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-card border border-border/70 hover:border-amber-500/40 transition-all">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-semibold">Avg Hourly Yield</span>
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-400">₹{metrics.avgHourlyYield}</span>
              <span className="text-xs text-muted-foreground font-medium">/ hr</span>
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground font-medium">
              Blended tariff per pass hour
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="p-3 rounded-2xl bg-card border border-border/80 flex flex-col lg:flex-row items-center justify-between gap-3 shadow-sm">
          {/* Left: Mode Tabs & Search */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            {/* Main Section Mode Tabs */}
            <div className="flex items-center p-0.5 bg-background border border-border/80 rounded-xl">
              <button
                onClick={() => setActiveTab('plans')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'plans'
                    ? 'bg-primary text-black font-black shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Packages ({plans.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('wallets')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'wallets'
                    ? 'bg-primary text-black font-black shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Passes & Wallets ({customerMemberships.length})</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative min-w-[200px] max-w-sm flex-1">
              <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={activeTab === 'plans' ? "Search packages..." : "Search player or pass..."}
                className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-background border border-border/80 text-xs font-medium text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Status Filter for Wallets */}
            {activeTab === 'wallets' && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl bg-background border border-border/80 text-xs font-semibold text-foreground outline-none focus:border-primary cursor-pointer"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="EXHAUSTED">Exhausted</option>
                <option value="EXPIRED">Expired</option>
              </select>
            )}
          </div>


          {/* Right: Results count & View Mode Switcher */}
          <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
            <span className="text-xs font-mono text-muted-foreground">
              Showing <strong className="text-foreground">
                {activeTab === 'plans' ? filteredPlans.length : filteredCustomerMemberships.length}
              </strong> items
            </span>

            <div className="flex items-center p-1 bg-background border border-border/80 rounded-xl">
              <button
                onClick={() => setDesktopViewMode('cards')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  desktopViewMode === 'cards'
                    ? 'bg-white/10 text-foreground font-black'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Grid Mode"
              >
                <Layers className="w-3.5 h-3.5" /> Grid
              </button>
              <button
                onClick={() => setDesktopViewMode('table')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  desktopViewMode === 'table'
                    ? 'bg-white/10 text-foreground font-black'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Ledger Table Mode"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" /> Ledger
              </button>
            </div>
          </div>
        </div>

        {/* Content Display based on Active Tab */}
        {loading ? (
          <div className="p-16 text-center rounded-3xl bg-card border border-border/80 space-y-3">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2" />
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
              Retrieving membership and credit wallet records...
            </p>
          </div>
        ) : activeTab === 'plans' ? (
          /* ================= TAB 1: MEMBERSHIP PACKAGES ================= */
          filteredPlans.length === 0 ? (
            <div className="p-16 text-center rounded-3xl bg-card border border-border/80 space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto border border-primary/20">
                <CreditCard className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-foreground">No Membership Packages Found</h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  {searchQuery ? 'No packages match your search filter.' : 'Create prepaid packages like 10-Hour passes or monthly court subscriptions.'}
                </p>
              </div>
              <button
                onClick={() => setIsPlanModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-black font-black text-xs hover:brightness-110 shadow-lg shadow-primary/20"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" /> Create First Package
              </button>
            </div>
          ) : desktopViewMode === 'cards' ? (
            /* Packages Cards Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlans.map((p) => {
                const hourlyRate = Math.round(p.price / (p.totalHours || 1));
                return (
                  <div
                    key={p.membershipId}
                    className="group relative p-6 rounded-3xl bg-card border border-border/80 hover:border-primary/50 transition-all duration-300 flex flex-col justify-between shadow-sm hover:shadow-xl space-y-5"
                  >
                    <div className="space-y-4">
                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <h3 className="text-lg font-black text-foreground group-hover:text-primary transition-colors">
                            {p.name}
                          </h3>
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {p.description || 'Prepaid bulk court hours with priority reservation access.'}
                          </p>
                        </div>
                        {p.discountPercentage && p.discountPercentage > 0 ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                            {p.discountPercentage}% OFF
                          </span>
                        ) : null}
                      </div>

                      {/* Pricing & Hours Bento */}
                      <div className="p-3.5 rounded-2xl bg-background/60 border border-border/60 flex items-baseline justify-between">
                        <div>
                          <div className="text-2xl font-black text-foreground font-mono">
                            ₹{p.price.toLocaleString('en-IN')}
                          </div>
                          <span className="text-[10px] uppercase font-bold text-muted-foreground">one-time upfront</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-black text-primary font-mono">
                            {p.totalHours} Play Hours
                          </div>
                          <span className="text-[10px] font-mono text-muted-foreground">
                            ₹{hourlyRate} / hr avg
                          </span>
                        </div>
                      </div>

                      {/* Features */}
                      <div className="space-y-2 text-xs text-foreground/80">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-primary" />
                          <span>Valid for <strong className="text-foreground">{p.validityDays} days</strong> from activation</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Universal court & facility access</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-indigo-400" />
                          <span>Protected ledger balance</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom CTA */}
                    <div className="pt-4 border-t border-border/60">
                      <button
                        onClick={() => openAssignModalForPlan(p)}
                        className="w-full py-3 px-4 bg-white/[0.04] hover:bg-primary hover:text-black text-foreground font-black text-xs rounded-2xl transition-all flex items-center justify-center gap-2 border border-border/80 group-hover:border-primary shadow-sm"
                      >
                        <span>Assign Package to Player</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Packages Table View */
            <div className="rounded-3xl bg-card border border-border/80 overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/80 bg-background/50 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                    <th className="p-4">Package Name</th>
                    <th className="p-4 text-center">Hours Granted</th>
                    <th className="p-4 text-right">Package Price</th>
                    <th className="p-4 text-right">Effective Rate</th>
                    <th className="p-4">Validity</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 text-xs">
                  {filteredPlans.map((p) => (
                    <tr key={p.membershipId} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="p-4">
                        <div className="font-black text-foreground group-hover:text-primary transition-colors text-sm">
                          {p.name}
                        </div>
                        <div className="text-[11px] text-muted-foreground line-clamp-1">{p.description}</div>
                      </td>
                      <td className="p-4 text-center font-black font-mono text-primary text-sm">
                        {p.totalHours} hrs
                      </td>
                      <td className="p-4 text-right font-black font-mono text-foreground text-sm">
                        ₹{p.price.toLocaleString('en-IN')}
                      </td>
                      <td className="p-4 text-right font-mono text-emerald-400 font-bold">
                        ₹{Math.round(p.price / (p.totalHours || 1))} / hr
                      </td>
                      <td className="p-4 text-muted-foreground font-mono">
                        {p.validityDays} days
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => openAssignModalForPlan(p)}
                          className="px-3.5 py-1.5 rounded-xl bg-primary text-black font-black text-xs hover:brightness-110 transition-all shadow-sm"
                        >
                          Assign Pass
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          /* ================= TAB 2: ACTIVE PLAYER PASSES & WALLETS ================= */
          filteredCustomerMemberships.length === 0 ? (
            <div className="p-16 text-center rounded-3xl bg-card border border-border/80 space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto border border-primary/20">
                <CreditCard className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-foreground">No Player Passes Found</h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  {searchQuery || statusFilter !== 'ALL'
                    ? 'No player wallet passes match the current filter.'
                    : 'Assign a membership package to a player to create their credit wallet.'}
                </p>
              </div>
              <button
                onClick={() => {
                  if (plans.length > 0) {
                    setSelectedPlanId(plans[0].membershipId);
                    setAmountPaid(plans[0].price);
                  }
                  setIsAssignModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-black font-black text-xs hover:brightness-110 shadow-lg shadow-primary/20"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" /> Assign First Pass
              </button>
            </div>
          ) : (
            /* Passes Table / Ledger */
            <div className="rounded-3xl bg-card border border-border/80 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border/80 bg-background/50 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                      <th className="p-4">Player Athlete</th>
                      <th className="p-4">Pass Package</th>
                      <th className="p-4">Credit Balance & Progress</th>
                      <th className="p-4">Expiry Window</th>
                      <th className="p-4 text-right">Advance Paid</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50 text-xs">
                    {filteredCustomerMemberships.map((m) => {
                      const percentLeft = Math.round((m.remainingHours / (m.totalHoursGranted || 1)) * 100);
                      const initials = getInitials(m.customerName);

                      return (
                        <tr key={m.customerMembershipUuid} className="hover:bg-white/[0.02] transition-colors group">
                          {/* Player */}
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-black text-xs shrink-0">
                                {initials}
                              </div>
                              <div>
                                <div className="font-black text-foreground group-hover:text-primary transition-colors text-sm">
                                  {m.customerName || `Customer #${m.customerId}`}
                                </div>
                                <div className="text-[11px] font-mono text-muted-foreground">
                                  {m.customerPhone || 'No phone recorded'}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Package */}
                          <td className="p-4">
                            <div className="font-bold text-foreground">
                              {m.membershipName || 'Custom Pass'}
                            </div>
                            <div className="text-[10px] font-mono text-muted-foreground">
                              Pass #{m.customerMembershipId}
                            </div>
                          </td>

                          {/* Balance Progress */}
                          <td className="p-4">
                            <div className="space-y-1.5 w-44">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-black text-foreground font-mono">
                                  {m.remainingHours} hrs left
                                </span>
                                <span className="text-[10px] font-mono text-muted-foreground">
                                  of {m.totalHoursGranted} hrs
                                </span>
                              </div>
                              <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-300 ${
                                    percentLeft > 50 ? 'bg-emerald-400' : percentLeft > 20 ? 'bg-amber-400' : 'bg-red-400'
                                  }`}
                                  style={{ width: `${percentLeft}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* Expiry */}
                          <td className="p-4">
                            <div className="font-medium text-foreground text-xs">
                              {formatExpiryCountdown(m.expiryDate)}
                            </div>
                            <div className="text-[10px] text-muted-foreground font-mono">
                              {m.expiryDate ? new Date(m.expiryDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Never'}
                            </div>
                          </td>

                          {/* Advance Paid */}
                          <td className="p-4 text-right">
                            <div className="font-mono font-black text-emerald-400 text-sm">
                              ₹{Number(m.amountPaid || 0).toLocaleString('en-IN')}
                            </div>
                            <div className="text-[10px] text-muted-foreground uppercase font-mono">
                              via {m.paymentMethod || 'ADVANCE'}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="p-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border inline-flex items-center gap-1.5 ${
                                m.status === 'ACTIVE'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                  : 'bg-red-500/10 text-red-400 border-red-500/30'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${m.status === 'ACTIVE' ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                              {m.status}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {m.status === 'ACTIVE' && m.remainingHours > 0 && (
                                <button
                                  onClick={() => {
                                    setDeductModalItem(m);
                                    setHoursToDeduct(1);
                                    setDeductNotes('Court check-in deduction');
                                  }}
                                  className="px-3 py-1.5 rounded-xl bg-primary text-black font-black text-xs hover:brightness-110 transition-all shadow-sm flex items-center gap-1"
                                >
                                  <Zap className="w-3 h-3" /> Deduct
                                </button>
                              )}
                              <button
                                onClick={() => setInspectedPass(m)}
                                className="p-1.5 rounded-lg border border-border/80 hover:bg-white/5 text-muted-foreground hover:text-foreground"
                                title="Inspect Pass Ledger"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. DESKTOP SLIDE-OVER PASS INSPECTOR                                      */}
      {/* ========================================================================= */}
      {inspectedPass && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end animate-in fade-in">
          <div className="w-full max-w-xl bg-card border-l border-border h-full p-6 lg:p-8 flex flex-col justify-between overflow-y-auto space-y-6">
            <div className="space-y-6">
              {/* Drawer Top */}
              <div className="flex items-start justify-between border-b border-border pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-black text-sm shrink-0">
                    {getInitials(inspectedPass.customerName)}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-foreground">{inspectedPass.customerName}</h2>
                    <span className="text-xs font-mono text-muted-foreground">
                      Pass #{inspectedPass.customerMembershipId} • {inspectedPass.membershipName}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setInspectedPass(null)}
                  className="p-2 rounded-xl hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              {/* Balance & Financials Bento */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-background border border-border space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Remaining Balance</span>
                  <div className="text-2xl font-black text-emerald-400 font-mono">
                    {inspectedPass.remainingHours} hrs
                  </div>
                  <div className="text-[11px] text-muted-foreground font-mono">
                    of {inspectedPass.totalHoursGranted} hours granted
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-background border border-border space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Advance Capital Paid</span>
                  <div className="text-2xl font-black text-foreground font-mono">
                    ₹{Number(inspectedPass.amountPaid || 0).toLocaleString('en-IN')}
                  </div>
                  <div className="text-[11px] text-muted-foreground font-mono">
                    via {inspectedPass.paymentMethod || 'UPI / Advance'}
                  </div>
                </div>
              </div>

              {/* Validity Details */}
              <div className="p-4 rounded-2xl bg-background border border-border space-y-3">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Pass Validity Matrix</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Activation Date</span>
                    <span className="font-mono text-foreground">{inspectedPass.startDate || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Expiry Date</span>
                    <span className="font-mono text-foreground">{inspectedPass.expiryDate || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className="font-bold text-emerald-400 font-mono">{inspectedPass.status}</span>
                  </div>
                </div>
              </div>

              {/* Quick Deduct Card */}
              {inspectedPass.status === 'ACTIVE' && inspectedPass.remainingHours > 0 && (
                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-3">
                  <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-wider">
                    <Zap className="w-4 h-4" /> Quick Session Deduct
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Instantly check-in this player for an active session and deduct credits from their balance.
                  </p>
                  <button
                    onClick={() => {
                      setDeductModalItem(inspectedPass);
                      setHoursToDeduct(1);
                      setDeductNotes('Court session check-in');
                    }}
                    className="w-full py-2.5 px-4 bg-primary text-black font-black text-xs rounded-xl hover:brightness-110 transition-all shadow-md shadow-primary/20"
                  >
                    Deduct Credits Now
                  </button>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-end">
              <button
                onClick={() => setInspectedPass(null)}
                className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-foreground transition-all"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MODALS (Create Plan + Assign Pass + Deduct Hours + Paywall)             */}
      {/* ========================================================================= */}

      {/* Modal: Create Membership Package */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card border border-border rounded-3xl w-full max-w-lg p-6 lg:p-7 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-lg font-black text-foreground">Create Membership Package</h3>
                <p className="text-xs text-muted-foreground">Configure prepaid play hours and validity discounts</p>
              </div>
              <button
                onClick={() => setIsPlanModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {planError && (
              <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{planError}</span>
              </div>
            )}

            <form onSubmit={handleCreatePlan} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Package Name *</label>
                <input
                  type="text"
                  required
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  placeholder="e.g. 10-Hour Summer Pass"
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground text-xs font-medium focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Description</label>
                <textarea
                  rows={2}
                  value={planDesc}
                  onChange={(e) => setPlanDesc(e.target.value)}
                  placeholder="Valid across all badminton & tennis courts with priority booking access..."
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground text-xs focus:outline-none focus:border-primary resize-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Package Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={planPrice}
                    onChange={(e) => setPlanPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground text-xs font-mono font-black focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Total Play Hours *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={planHours}
                    onChange={(e) => setPlanHours(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground text-xs font-mono font-black focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Validity (Days) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={planValidityDays}
                    onChange={(e) => setPlanValidityDays(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground text-xs font-mono focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Discount (% display)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={planDiscount}
                    onChange={(e) => setPlanDiscount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground text-xs font-mono focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPlanModalOpen(false)}
                  className="px-4 py-2.5 bg-background border border-border hover:bg-white/5 text-foreground text-xs font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPlan}
                  className="px-5 py-2.5 bg-primary text-black font-black text-xs hover:brightness-110 disabled:opacity-50 rounded-xl transition shadow-lg shadow-primary/20"
                >
                  {savingPlan ? 'Saving...' : 'Create Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Assign Membership to Player */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card border border-border rounded-3xl w-full max-w-lg p-6 lg:p-7 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-lg font-black text-foreground">Assign Package to Player</h3>
                <p className="text-xs text-muted-foreground">Credit advance play hours to an athlete wallet</p>
              </div>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {assignError && (
              <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{assignError}</span>
              </div>
            )}

            <form onSubmit={handleAssignMembership} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Select Player *</label>
                <select
                  required
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground text-xs font-bold focus:outline-none focus:border-primary cursor-pointer"
                >
                  <option value="">-- Choose Player --</option>
                  {customers.map((c) => (
                    <option key={c.customerId} value={c.customerId}>
                      {c.fullName} {c.phone ? `(${c.phone})` : ''} - {c.vipTier}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Select Package *</label>
                <select
                  required
                  value={selectedPlanId}
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    setSelectedPlanId(id);
                    const found = plans.find(p => p.membershipId === id);
                    if (found) setAmountPaid(found.price);
                  }}
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground text-xs font-bold focus:outline-none focus:border-primary cursor-pointer"
                >
                  <option value="">-- Choose Package --</option>
                  {plans.map((p) => (
                    <option key={p.membershipId} value={p.membershipId}>
                      {p.name} - {p.totalHours} hrs (₹{p.price})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Amount Paid (₹)</label>
                  <input
                    type="number"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground text-xs font-mono font-black focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground text-xs font-bold focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="UPI">UPI</option>
                    <option value="CASH">Cash</option>
                    <option value="CARD">Card POS</option>
                    <option value="NET_BANKING">Net Banking</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2.5 bg-background border border-border hover:bg-white/5 text-foreground text-xs font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assigning}
                  className="px-5 py-2.5 bg-primary text-black font-black text-xs hover:brightness-110 disabled:opacity-50 rounded-xl transition shadow-lg shadow-primary/20"
                >
                  {assigning ? 'Assigning...' : 'Assign Pass'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Deduct Hours */}
      {deductModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card border border-border rounded-3xl w-full max-w-sm p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-black text-foreground">Deduct Player Hours</h3>
              <button onClick={() => setDeductModalItem(null)} className="text-muted-foreground hover:text-foreground">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Player: <strong className="text-foreground">{deductModalItem.customerName}</strong>
              <br />
              Remaining credits: <strong className="text-emerald-400 font-mono">{deductModalItem.remainingHours} hrs</strong>
            </p>

            {deductError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">
                {deductError}
              </div>
            )}

            <form onSubmit={handleDeductHours} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Hours to Deduct</label>
                <input
                  type="number"
                  min={1}
                  max={deductModalItem.remainingHours}
                  value={hoursToDeduct}
                  onChange={(e) => setHoursToDeduct(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground text-xs font-mono font-bold focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Reason / Notes</label>
                <input
                  type="text"
                  value={deductNotes}
                  onChange={(e) => setDeductNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeductModalItem(null)}
                  className="px-4 py-2.5 bg-background border border-border hover:bg-white/5 text-foreground text-xs font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deducting}
                  className="px-5 py-2.5 bg-primary text-black font-black text-xs hover:brightness-110 disabled:opacity-50 rounded-xl transition shadow-lg shadow-primary/20"
                >
                  {deducting ? 'Deducting...' : 'Confirm Deduction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subscription Paywall Modal */}
      <FeaturePaywallModal
        isOpen={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
        orgId={orgId}
        featureName="Memberships & Prepaid Hour Passes"
        featureDescription="Offer packages, bulk playtime passes, and manage player credit wallets with Athlon's Venue ERP."
        requiredPlan="Professional"
        currentPlan={entitlements?.planName || 'Free'}
      />
    </div>
  );
}
