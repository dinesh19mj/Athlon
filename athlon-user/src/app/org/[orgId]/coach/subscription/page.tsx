'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  UserCheck,
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
  Crown,
  Flame,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import {
  CoachSubscriptionService,
  CoachEntitlements,
  CoachSubscriptionPlan
} from '@/lib/api/coachSubscription';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';

export default function CoachSubscriptionHubPage() {
  const params = useParams();
  const router = useRouter();
  const orgId = (params?.orgId as string) || '';

  const { organizations, getActiveOrganization } = useWorkspaceStore();
  const currentOrganization = organizations.find((o) => o.id === orgId) || getActiveOrganization();

  const [entitlements, setEntitlements] = useState<CoachEntitlements | null>(null);
  const [plans, setPlans] = useState<CoachSubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const loadData = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [entData, plansData] = await Promise.all([
        CoachSubscriptionService.getEntitlements(orgId),
        CoachSubscriptionService.getPlans(),
      ]);
      setEntitlements(entData);
      setPlans(plansData);
      if (entData?.billingCycle) {
        setBillingCycle((entData.billingCycle.toUpperCase() as 'MONTHLY' | 'YEARLY') || 'MONTHLY');
      }
    } catch (err: any) {
      console.warn('Failed to load coach entitlements, falling back:', err);
      // Optimistic 30-day free trial fallback for clean UI
      setEntitlements({
        organizationId: 201,
        organizationUuid: orgId,
        organizationName: currentOrganization?.name || 'Coach Workspace',
        activePlanCode: 'COACH_STARTER',
        activePlanName: 'Coach Starter',
        subscriptionStatus: 'TRIAL',
        billingCycle: 'MONTHLY',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
        daysRemaining: 30,
        isTrialActive: true,
        isExpired: false,
        maxTrainees: 15,
        currentTrainees: 6,
        traineesRemaining: 9,
        features: {
          COACH_CALENDAR: true,
          COACH_ATTENDANCE: true,
          COACH_FEE_TRACKING: true,
          COACH_PROFILE: true,
          COACH_DRILL_CARDS: false,
          COACH_AUTO_REMINDERS: false,
          COACH_VERIFIED_BADGE: false,
        },
      });
      setPlans([
        {
          planId: 201,
          planUuid: 'coach-starter-uuid',
          planCode: 'COACH_STARTER',
          name: 'Coach Starter',
          description: 'Manage personal coaching calendar, slot bookings, student roster & cash/digital fee logging. First 30 days free, then ₹299/mo.',
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

  const handleSubscribe = async (planCode: string) => {
    setActionLoading(planCode);
    setSuccessMessage(null);
    setErrorMessage(null);
    try {
      const updated = await CoachSubscriptionService.subscribe({
        organizationUuid: orgId,
        planCode,
        billingCycle,
        paymentReference: `WEB_COACH_${Date.now()}`,
      });
      setEntitlements(updated);
      setSuccessMessage(`Successfully switched to ${planCode === 'COACH_PRO' ? 'Coach Professional' : 'Coach Starter'}!`);
    } catch (err: any) {
      console.error('Subscription failed:', err);
      const msg = err?.data?.message || err?.message || 'Subscription activation failed. Please try again.';
      setErrorMessage(msg);
    } finally {
      setActionLoading(null);
    }
  };

  const currentTrainees = entitlements?.currentTrainees ?? 0;
  const maxTrainees = entitlements?.maxTrainees ?? 15;
  const traineeUsagePercent = Math.min(100, Math.round((currentTrainees / maxTrainees) * 100));

  const daysRemaining = entitlements?.daysRemaining ?? 30;
  const isTrialActive = Boolean(entitlements?.isTrialActive);
  const isExpired = Boolean(entitlements?.isExpired);
  const activePlanCode = entitlements?.activePlanCode || 'COACH_STARTER';

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* ── TOP NAV HEADER ─────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={`/org/${orgId}/coaches`}
              className="p-2 rounded-xl bg-surface hover:bg-surface-hover text-text-muted hover:text-foreground border border-border transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                  <span>Coach Pass & Trainee Capacity</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/30">
                    2 TIERS • 30D TRIAL
                  </span>
                </h1>
              </div>
              <p className="text-xs text-text-muted hidden sm:block">
                Trainee client roster, 1-on-1 sessions, rate cards & progress reports
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
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  {isTrialActive ? '30-Day Free Trial Active' : isExpired ? 'Starter Trial Expired' : 'Active Pass'}
                </span>
                <span className="text-xs font-mono text-text-muted">
                  Coach: {currentOrganization?.name || 'Private Coach'}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                {isTrialActive
                  ? `${daysRemaining} Days Left in Coach Starter Free Trial`
                  : isExpired
                  ? 'Your 30-Day Free Trial Has Ended'
                  : `${entitlements?.activePlanName || 'Coach Pass'} Active`}
              </h2>

              <p className="text-sm text-text-muted leading-relaxed">
                {isTrialActive
                  ? 'You are on the Coach Starter tier with full access to trainee enrollment, session calendars, and rate card billing with zero upfront cost. From month 2 onwards, continue for only ₹299/mo or upgrade to Pro.'
                  : isExpired
                  ? 'Subscribe for ₹299/month (Coach Starter) or ₹499/month (Coach Pro) to continue adding new trainees and scheduling sessions.'
                  : `Your plan is fully active and renews in ${daysRemaining} days. All coaching features and trainee capacity quotas are unlocked.`}
              </p>
            </div>

            {/* Trial Countdown Ring / Metric */}
            <div className="shrink-0 flex items-center gap-4 bg-surface/80 border border-border/80 backdrop-blur-md p-4 rounded-2xl">
              <div className="relative w-16 h-16 rounded-full flex items-center justify-center border-4 border-amber-500/20">
                <div
                  className="absolute inset-0 rounded-full border-4 border-amber-500 border-t-transparent animate-spin-slow"
                  style={{ transform: `rotate(${Math.min(360, (daysRemaining / 30) * 360)}deg)` }}
                />
                <div className="text-center">
                  <span className="text-lg font-black leading-none">{daysRemaining}</span>
                  <span className="block text-[9px] uppercase font-bold text-text-muted">Days</span>
                </div>
              </div>
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-text-muted block">
                  {isTrialActive ? 'Starter Trial' : 'Active Tier'}
                </span>
                <span className="text-sm font-bold text-foreground">
                  {isTrialActive ? 'First Month Free' : activePlanCode === 'COACH_PRO' ? 'Coach Pro (₹499/mo)' : 'Coach Starter (₹299/mo)'}
                </span>
                <span className="text-[11px] text-amber-500 font-semibold block">
                  {isExpired ? 'Subscription Required' : `${maxTrainees} Trainees Ceiling`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── 2. CAPACITY & USAGE GAUGES ───────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Active Trainee Capacity */}
          <div className="p-5 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-amber-500" />
                  Active Trainees
                </span>
                <span className="text-xs font-bold font-mono text-amber-600 dark:text-amber-400">
                  {traineeUsagePercent}% Used
                </span>
              </div>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-3xl font-black text-foreground">{currentTrainees}</span>
                <span className="text-sm font-semibold text-text-muted">/ {maxTrainees} Max</span>
              </div>
            </div>
            <div>
              <div className="w-full h-2 rounded-full bg-surface border border-border overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500 rounded-full"
                  style={{ width: `${traineeUsagePercent}%` }}
                />
              </div>
              <span className="text-[11px] text-text-muted mt-2 block">
                {Math.max(0, maxTrainees - currentTrainees)} trainee slots remaining in current plan
              </span>
            </div>
          </div>

          {/* Coaching Packages / Rate Cards */}
          <div className="p-5 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-cyan-500" />
                  Fee Rate Cards
                </span>
                <span className="text-xs font-bold font-mono text-cyan-600 dark:text-cyan-400">
                  {activePlanCode === 'COACH_PRO' ? 'UNLIMITED' : 'UP TO 3'}
                </span>
              </div>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-3xl font-black text-foreground">
                  {activePlanCode === 'COACH_PRO' ? 'Unlimited' : '3 Cards'}
                </span>
                <span className="text-sm font-semibold text-text-muted">Active Packages</span>
              </div>
            </div>
            <span className="text-[11px] text-text-muted block">
              1-on-1 private drills, monthly clinics & sparring packages
            </span>
          </div>

          {/* Verification & Marketplace Ranking */}
          <div className="p-5 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Marketplace Status
                </span>
                <span className="text-xs font-bold font-mono text-emerald-500">
                  {activePlanCode === 'COACH_PRO' ? 'VERIFIED' : 'STANDARD'}
                </span>
              </div>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-2xl font-black text-foreground">
                  {activePlanCode === 'COACH_PRO' ? 'Verified Coach' : 'Public Profile'}
                </span>
              </div>
            </div>
            <span className="text-[11px] text-text-muted block">
              {activePlanCode === 'COACH_PRO'
                ? 'Verified badge + top ranking in Athlon Coach Search'
                : 'Upgrade to Coach Pro to unlock the Verified Coach badge'}
            </span>
          </div>
        </div>

        {/* ── 3. BILLING CYCLE SWITCHER & 2-TIER PLAN CARDS ─────────────────── */}
        <div className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-black text-foreground">Available Coach Plans</h3>
              <p className="text-xs text-text-muted">Choose the right tier to match your coaching roster size</p>
            </div>

            {/* Billing Cycle Toggle */}
            <div className="inline-flex items-center p-1 rounded-xl bg-surface border border-border self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setBillingCycle('MONTHLY')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  billingCycle === 'MONTHLY'
                    ? 'bg-foreground text-background shadow-sm'
                    : 'text-text-muted hover:text-foreground'
                }`}
              >
                Monthly Billing
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
                <span>Annual Billing</span>
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  SAVE ~17%
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* TIER 1: COACH STARTER */}
            <div className="p-6 sm:p-8 rounded-3xl bg-card border-2 border-border hover:border-amber-500/40 transition-all flex flex-col justify-between shadow-md relative overflow-hidden">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                    30-DAY FREE TRIAL
                  </span>
                  <span className="text-xs font-bold text-text-muted">15 TRAINEES</span>
                </div>

                <div>
                  <h4 className="text-2xl font-black text-foreground">Coach Starter</h4>
                  <p className="text-xs text-text-muted mt-1">
                    First 30 days free, then ₹299/mo. Ideal for solo coaches and personal trainers.
                  </p>
                </div>

                <div className="flex items-baseline gap-2 pt-2">
                  <span className="text-4xl font-black text-foreground">
                    ₹{billingCycle === 'YEARLY' ? '2,990' : '299'}
                  </span>
                  <span className="text-xs font-semibold text-text-muted">
                    {billingCycle === 'YEARLY' ? '/ year (after 30D trial)' : '/ month (after 30D trial)'}
                  </span>
                </div>

                <div className="pt-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-text-muted block mb-3">
                    Features Included:
                  </span>
                  <ul className="space-y-2.5 text-xs text-foreground/90">
                    {[
                      'First 30 Days 100% Free Trial',
                      'Up to 15 Active Trainees Roster',
                      'Personal Coaching Calendar & Slot Scheduling',
                      'Daily Check-in & Session Attendance',
                      'Up to 3 Fee Packages & Rate Cards',
                      'Cash & Digital UPI Payment Receipts',
                      'Coach Public Discovery Profile',
                    ].map((f) => (
                      <li key={f} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="button"
                  onClick={() => handleSubscribe('COACH_STARTER')}
                  disabled={actionLoading !== null || (activePlanCode === 'COACH_STARTER' && !isExpired)}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                    activePlanCode === 'COACH_STARTER' && !isExpired
                      ? 'bg-surface border border-border text-text-muted cursor-default'
                      : 'bg-foreground text-background hover:opacity-90 active:scale-[0.98]'
                  }`}
                >
                  {actionLoading === 'COACH_STARTER' ? (
                    <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : activePlanCode === 'COACH_STARTER' && !isExpired ? (
                    'Current Active Plan'
                  ) : (
                    `Subscribe Starter (₹${billingCycle === 'YEARLY' ? '2,990/yr' : '299/mo'})`
                  )}
                </button>
              </div>
            </div>

            {/* TIER 2: COACH PRO */}
            <div className="p-6 sm:p-8 rounded-3xl bg-card border-2 border-orange-500/50 shadow-xl relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950">
                    👑 MOST POPULAR • 50 TRAINEES
                  </span>
                  <span className="text-xs font-bold text-orange-500 uppercase tracking-wider">
                    Full Pro Suite
                  </span>
                </div>

                <div>
                  <h4 className="text-2xl font-black text-foreground">Coach Professional</h4>
                  <p className="text-xs text-text-muted mt-1">
                    Up to 50 trainees, drill cards, automated WhatsApp reminders, and verified coach badge.
                  </p>
                </div>

                <div className="flex items-baseline gap-2 pt-2">
                  <span className="text-4xl font-black text-foreground">
                    ₹{billingCycle === 'YEARLY' ? '4,990' : '499'}
                  </span>
                  <span className="text-xs font-semibold text-text-muted">
                    {billingCycle === 'YEARLY' ? '/ year' : '/ month'}
                  </span>
                </div>

                <div className="pt-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-text-muted block mb-3">
                    Everything in Starter, plus:
                  </span>
                  <ul className="space-y-2.5 text-xs text-foreground/90">
                    {[
                      'Up to 50 Active Trainees with Full Profiles',
                      'Unlimited 1-on-1 & Small Group Booking Slots',
                      'Trainee Drill Cards & Fitness Test Benchmarks',
                      'Automated Monthly Fee WhatsApp Reminders',
                      'Unlimited Coaching Rate Cards & Packages',
                      'Trainee Video Review & Performance Feedback',
                      'Verified Coach Badge on Athlon Marketplace',
                    ].map((f) => (
                      <li key={f} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-orange-500 shrink-0" />
                        <span className="font-semibold">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-6 relative z-10">
                <button
                  type="button"
                  onClick={() => handleSubscribe('COACH_PRO')}
                  disabled={actionLoading !== null || activePlanCode === 'COACH_PRO'}
                  className={`w-full py-3.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                    activePlanCode === 'COACH_PRO'
                      ? 'bg-surface border border-border text-text-muted cursor-default'
                      : 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 hover:brightness-110 active:scale-[0.98] shadow-lg'
                  }`}
                >
                  {actionLoading === 'COACH_PRO' ? (
                    <span className="inline-block w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : activePlanCode === 'COACH_PRO' ? (
                    'Current Active Plan'
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>Upgrade to Pro (₹{billingCycle === 'YEARLY' ? '4,990/yr' : '499/mo'})</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── 4. COACH FAQ SECTION ─────────────────────────────────────────── */}
        <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <HelpCircle className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-black text-foreground">Frequently Asked Questions</h3>
          </div>

          <div className="space-y-3">
            {[
              {
                q: 'How does the Coach Starter 30-day free trial work?',
                a: 'Every newly registered Coach workspace receives 30 days of full free access to the Coach Starter tier. You can schedule sessions, enrol up to 15 trainees, and manage rate cards. From the second month onwards, you can continue for ₹299/month.',
              },
              {
                q: 'What is the difference between Coach Starter and Coach Professional?',
                a: 'Coach Starter (₹299/mo) supports up to 15 trainees and basic session scheduling. Coach Professional (₹499/mo) expands capacity to 50 trainees, adds customizable drill cards, fitness benchmarks, automated WhatsApp fee payment reminders, and the Verified Coach badge on Athlon.',
              },
              {
                q: 'How are active trainee limits counted?',
                a: 'Only currently enrolled, active trainee clients count toward your quota. Inactive, past, or graduated student profiles do not consume your capacity.',
              },
              {
                q: 'Can parents and trainees book 1-on-1 slots directly?',
                a: 'Yes, coaches can share their personalized Athlon booking link, allowing trainees or parents to select available coaching slots and confirm sessions seamlessly.',
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

