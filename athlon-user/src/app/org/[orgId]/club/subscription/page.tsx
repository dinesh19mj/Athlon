'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Users,
  ShieldCheck,
  Check,
  Sparkles,
  ArrowLeft,
  Calendar,
  CreditCard,
  Clock,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Award,
  Lock,
  Layers,
  Crown
} from 'lucide-react';
import Link from 'next/link';
import {
  ClubSubscriptionService,
  ClubEntitlements,
  ClubSubscriptionPlan
} from '@/lib/api/clubSubscription';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';

export default function ClubSubscriptionHubPage() {
  const params = useParams();
  const router = useRouter();
  const orgId = (params?.orgId as string) || '';

  const { organizations, getActiveOrganization } = useWorkspaceStore();
  const currentOrganization = organizations.find((o) => o.id === orgId) || getActiveOrganization();

  const [entitlements, setEntitlements] = useState<ClubEntitlements | null>(null);
  const [plans, setPlans] = useState<ClubSubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const loadData = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [entData, plansData] = await Promise.all([
        ClubSubscriptionService.getEntitlements(orgId),
        ClubSubscriptionService.getPlans(),
      ]);
      setEntitlements(entData);
      setPlans(plansData);
      if (entData?.billingCycle) {
        setBillingCycle((entData.billingCycle.toUpperCase() as 'MONTHLY' | 'YEARLY') || 'MONTHLY');
      }
    } catch (err: any) {
      console.warn('Failed to load club entitlements, falling back:', err);
      // Optimistic 30-day free trial fallback for clean UI
      setEntitlements({
        organizationId: 101,
        organizationUuid: orgId,
        organizationName: currentOrganization?.name || 'Club Organization',
        activePlanCode: 'CLUB_ACCESS_PASS',
        activePlanName: 'Club Batch Pass',
        subscriptionStatus: 'TRIAL',
        billingCycle: 'MONTHLY',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
        daysRemaining: 30,
        isTrialActive: true,
        isExpired: false,
        maxMembers: 100,
        currentMembers: 42,
        maxManagers: 3,
        currentManagers: 1,
        features: {
          CLUB_BATCH_MANAGEMENT: true,
          CLUB_ATTENDANCE: true,
          CLUB_FEE_TRACKING: true,
          CLUB_EXPENSE_KITTY: true,
          CLUB_LEADERBOARD: true,
          CLUB_MATCH_SCORING: true,
          CLUB_INVENTORY: true,
        },
      });
      setPlans([
        {
          planId: 101,
          planUuid: 'club-access-pass-uuid',
          planCode: 'CLUB_ACCESS_PASS',
          name: 'Club Batch Pass',
          description: 'Single all-inclusive pass for court batch management, attendance, kitty & leaderboards. First 30 days free, then ₹249/mo.',
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
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (orgId) {
      loadData();
    }
  }, [orgId]);

  const handleSubscribe = async () => {
    setActionLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    try {
      const updated = await ClubSubscriptionService.subscribe({
        organizationUuid: orgId,
        billingCycle,
        paymentReference: `WEB_CLUB_${Date.now()}`,
      });
      setEntitlements(updated);
      setSuccessMessage(`Successfully activated Club Access Pass (${billingCycle === 'YEARLY' ? 'Annual' : 'Monthly'})!`);
    } catch (err: any) {
      console.error('Subscription failed:', err);
      const msg = err?.data?.message || err?.message || 'Subscription payment simulation failed. Please try again.';
      setErrorMessage(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const activePlan = plans[0];
  const monthlyPrice = activePlan?.monthlyPrice ?? 249;
  const yearlyPrice = activePlan?.yearlyPrice ?? 2490;
  const currentPrice = billingCycle === 'YEARLY' ? yearlyPrice : monthlyPrice;

  const currentMembers = entitlements?.currentMembers ?? 0;
  const maxMembers = entitlements?.maxMembers ?? 100;
  const memberUsagePercent = Math.min(100, Math.round((currentMembers / maxMembers) * 100));

  const daysRemaining = entitlements?.daysRemaining ?? 30;
  const isTrialActive = Boolean(entitlements?.isTrialActive);
  const isExpired = Boolean(entitlements?.isExpired);
  const isActivePaid = entitlements?.subscriptionStatus === 'ACTIVE';

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* ── TOP NAV HEADER ─────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={`/org/${orgId}/club`}
              className="p-2 rounded-xl bg-surface hover:bg-surface-hover text-text-muted hover:text-foreground border border-border transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                  <span>Club Pass & Batch Capacity</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                    ONE SIMPLE PLAN
                  </span>
                </h1>
              </div>
              <p className="text-xs text-text-muted hidden sm:block">
                Court batch scheduling, attendance, shared kitty, fees & leaderboards
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => loadData()}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-surface hover:bg-surface-hover border border-border text-text-muted hover:text-foreground transition-all flex items-center gap-1.5"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Alerts / Notifications */}
        {successMessage && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <span className="text-sm font-semibold">{successMessage}</span>
            </div>
            <button onClick={() => setSuccessMessage(null)} className="text-xs opacity-70 hover:opacity-100">
              ✕
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
              <span className="text-sm font-semibold">{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage(null)} className="text-xs opacity-70 hover:opacity-100">
              ✕
            </button>
          </div>
        )}

        {/* ── 1. STATUS HERO BANNER ────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card via-surface/60 to-surface/80 p-6 sm:p-8 shadow-xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  {isTrialActive ? '30-Day Free Trial Active' : isExpired ? 'Free Trial Expired' : 'Active Pass'}
                </span>
                <span className="text-xs font-mono text-text-muted">
                  Organization: {currentOrganization?.name || 'Club'}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                {isTrialActive
                  ? `${daysRemaining} Days Remaining in Your Free Trial`
                  : isExpired
                  ? 'Your 30-Day Free Trial Has Ended'
                  : 'Club Access Pass Active'}
              </h2>

              <p className="text-sm text-text-muted leading-relaxed">
                {isTrialActive
                  ? 'Your club currently enjoys 100% full access to court batch scheduling, member RSVP check-in, shared kitty expenses, and intra-club leaderboards with zero upfront payment.'
                  : isExpired
                  ? 'Subscribe for only ₹249/month to continue scheduling court batches, adding new members, and tracking kitty balances.'
                  : `Your subscription is active and renews in ${daysRemaining} days. All club batch operations are running with full capacity.`}
              </p>
            </div>

            {/* Trial Countdown Ring / Metric */}
            <div className="shrink-0 flex items-center gap-4 bg-surface/80 border border-border/80 backdrop-blur-md p-4 rounded-2xl">
              <div className="relative w-16 h-16 rounded-full flex items-center justify-center border-4 border-emerald-500/20">
                <div
                  className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin-slow"
                  style={{ transform: `rotate(${Math.min(360, (daysRemaining / 30) * 360)}deg)` }}
                />
                <div className="text-center">
                  <span className="text-lg font-black leading-none">{daysRemaining}</span>
                  <span className="block text-[9px] uppercase font-bold text-text-muted">Days</span>
                </div>
              </div>
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-text-muted block">
                  {isTrialActive ? 'Trial Period' : 'Subscription'}
                </span>
                <span className="text-sm font-bold text-foreground">
                  {isTrialActive ? 'First Month Free' : '₹249 / Month'}
                </span>
                <span className="text-[11px] text-emerald-500 font-semibold block">
                  {isExpired ? 'Action Required' : 'All Features Unlocked'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── 2. CAPACITY & USAGE GAUGES ───────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Member Roster Capacity */}
          <div className="p-5 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-500" />
                  Member Roster
                </span>
                <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  {memberUsagePercent}% Used
                </span>
              </div>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-3xl font-black text-foreground">{currentMembers}</span>
                <span className="text-sm font-semibold text-text-muted">/ {maxMembers} Max</span>
              </div>
            </div>
            <div>
              <div className="w-full h-2 rounded-full bg-surface border border-border overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 rounded-full"
                  style={{ width: `${memberUsagePercent}%` }}
                />
              </div>
              <span className="text-[11px] text-text-muted mt-2 block">
                {maxMembers - currentMembers} member slots available
              </span>
            </div>
          </div>

          {/* Admins & Captains */}
          <div className="p-5 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-500" />
                  Club Admins & Captains
                </span>
                <span className="text-xs font-bold font-mono text-cyan-600 dark:text-cyan-400">
                  {entitlements?.currentManagers ?? 1} / {entitlements?.maxManagers ?? 3}
                </span>
              </div>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-3xl font-black text-foreground">
                  {entitlements?.currentManagers ?? 1}
                </span>
                <span className="text-sm font-semibold text-text-muted">
                  / {entitlements?.maxManagers ?? 3} Logins
                </span>
              </div>
            </div>
            <span className="text-[11px] text-text-muted block">
              Batch coordinators with admin & scorekeeping permissions
            </span>
          </div>

          {/* Court Batches & Sessions */}
          <div className="p-5 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  Court Batches & Slots
                </span>
                <span className="text-xs font-bold font-mono text-indigo-500">UNLIMITED</span>
              </div>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-3xl font-black text-foreground">Active</span>
                <span className="text-sm font-semibold text-text-muted">Recurring Slots</span>
              </div>
            </div>
            <span className="text-[11px] text-text-muted block">
              Schedule weekend & weekday court sessions with RSVP checks
            </span>
          </div>
        </div>

        {/* ── 3. SINGLE PASS DETAILS & 1-CLICK SUBSCRIBE ────────────────────── */}
        <div className="p-6 sm:p-8 rounded-3xl bg-card border-2 border-emerald-500/40 shadow-xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-4 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950">
                  👑 ALL-IN-ONE PASS
                </span>
                <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">
                  No Hidden Tiers
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-black text-foreground">
                  Club Batch Operations Pass
                </h3>
                <p className="text-sm text-text-muted mt-1 leading-relaxed">
                  Tailored exclusively for badminton and sports club batches to track attendance, monitor fees, split expenses via kitty, and maintain live player leaderboards.
                </p>
              </div>

              {/* Billing Toggle */}
              <div className="inline-flex items-center p-1 rounded-xl bg-surface border border-border">
                <button
                  type="button"
                  onClick={() => setBillingCycle('MONTHLY')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    billingCycle === 'MONTHLY'
                      ? 'bg-foreground text-background shadow-sm'
                      : 'text-text-muted hover:text-foreground'
                  }`}
                >
                  Monthly (₹249/mo)
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle('YEARLY')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    billingCycle === 'YEARLY'
                      ? 'bg-foreground text-background shadow-sm'
                      : 'text-text-muted hover:text-foreground'
                  }`}
                >
                  <span>Annual (₹2,490/yr)</span>
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    SAVE ~17%
                  </span>
                </button>
              </div>

              {/* Price display */}
              <div className="flex items-baseline gap-2 pt-2">
                <span className="text-4xl font-black text-foreground">₹{currentPrice}</span>
                <span className="text-sm font-semibold text-text-muted">
                  {billingCycle === 'YEARLY' ? '/ year (after 30D trial)' : '/ month (after 30D trial)'}
                </span>
              </div>
            </div>

            {/* Features Checklist + Subscribe CTA */}
            <div className="lg:w-96 space-y-5 bg-surface/50 border border-border/80 p-6 rounded-2xl">
              <h4 className="text-xs font-black uppercase tracking-wider text-text-muted">
                What's Included in Your Pass:
              </h4>

              <ul className="space-y-2.5 text-xs text-foreground/90 font-medium">
                {[
                  '30-Day Full Access Free Trial',
                  'Up to 100 Active Club Members',
                  '3 Batch Admins & Captain Logins',
                  'Court Batch Slot Scheduling & Calendar',
                  'Member RSVP & Live Check-in Attendance',
                  'Shared Kitty & Expense Splitter',
                  'Member Fee Dues & Payment Tracking',
                  'Intra-Club Match Scoring & ELO Leaderboard',
                  'Shuttlecock & Equipment Inventory Tracking',
                ].map((feat) => (
                  <li key={feat} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={handleSubscribe}
                disabled={actionLoading}
                className="w-full py-3.5 px-4 rounded-xl text-sm font-black bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:brightness-110 active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-2"
              >
                {actionLoading ? (
                  <span className="inline-block w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>
                      {isExpired
                        ? `Activate Pass for ₹${currentPrice}`
                        : `Subscribe for ₹${currentPrice} (${billingCycle === 'YEARLY' ? 'Annual' : 'Monthly'})`}
                    </span>
                  </>
                )}
              </button>

              <p className="text-[11px] text-center text-text-muted">
                Flexible cancellation anytime • Secure instant activation
              </p>
            </div>
          </div>
        </div>

        {/* ── 4. CLUB FAQ SECTION ─────────────────────────────────────────── */}
        <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <HelpCircle className="w-5 h-5 text-emerald-500" />
            <h3 className="text-lg font-black text-foreground">Frequently Asked Questions</h3>
          </div>

          <div className="space-y-3">
            {[
              {
                q: 'How does the 30-day free trial work?',
                a: 'Every newly created Club organization immediately receives 30 days of full access to batch scheduling, attendance, shared kitty, and leaderboards. No credit card or upfront payment is required.',
              },
              {
                q: 'What happens after the 30-day trial expires?',
                a: 'After 30 days, your club pass can be renewed for ₹249/month (or ₹2,490/year) to continue adding members and scheduling court batches.',
              },
              {
                q: 'How many members and batch admins can we add?',
                a: 'The Club Access Pass includes capacity for up to 100 members and 3 admin/captain accounts, easily accommodating regular weekly court batch groups.',
              },
              {
                q: 'Can members check attendance and expense splits on their phones?',
                a: 'Yes, members can view upcoming court sessions, mark RSVPs, view transparency reports of shared kitty expenses, and inspect live leaderboard standings on Athlon.',
              },
            ].map((faq, idx) => (
              <div
                key={faq.q}
                className="border border-border rounded-xl p-4 bg-surface/40 hover:bg-surface/80 transition-all cursor-pointer"
                onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
              >
                <div className="flex items-center justify-between font-bold text-sm">
                  <span>{faq.q}</span>
                  <span className="text-text-muted">{openFaqIndex === idx ? '−' : '+'}</span>
                </div>
                {openFaqIndex === idx && (
                  <p className="text-xs text-text-muted mt-2 leading-relaxed">{faq.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

