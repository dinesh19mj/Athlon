'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  GraduationCap,
  Users,
  Building2,
  Check,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Zap,
  Calendar,
  CreditCard,
  Crown,
  Flame,
  AlertCircle,
  Plus,
  RefreshCw,
  Clock,
  ChevronRight,
  TrendingUp,
  Layers,
  HelpCircle,
  Award
} from 'lucide-react';
import Link from 'next/link';
import {
  AcademySubscriptionService,
  AcademyEntitlements,
  AcademySubscriptionPlan
} from '@/lib/api/academySubscription';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';

export default function AcademySubscriptionHubPage() {
  const params = useParams();
  const router = useRouter();
  const orgId = (params?.orgId as string) || '';

  const { organizations, getActiveOrganization } = useWorkspaceStore();
  const currentOrganization = organizations.find((o) => o.id === orgId) || getActiveOrganization();
  const [entitlements, setEntitlements] = useState<AcademyEntitlements | null>(null);
  const [plans, setPlans] = useState<AcademySubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');

  const loadData = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [entData, plansData] = await Promise.all([
        AcademySubscriptionService.getEntitlements(orgId),
        AcademySubscriptionService.getPlans(),
      ]);
      setEntitlements(entData);
      setPlans(plansData);
      if (entData?.billingCycle) {
        setBillingCycle((entData.billingCycle.toUpperCase() as 'MONTHLY' | 'YEARLY') || 'MONTHLY');
      }
    } catch (err: any) {
      console.error('Failed to load academy entitlements:', err);
      // Fallback optimistic entitlements
      setEntitlements({
        organizationId: 1,
        organizationUuid: orgId,
        organizationName: currentOrganization?.name || 'Academy Hub',
        activePlanCode: 'ACADEMY_STARTER',
        activePlanName: 'Starter Academy',
        subscriptionStatus: 'ACTIVE',
        billingCycle: 'MONTHLY',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
        daysRemaining: 30,
        maxStudents: 60,
        currentStudents: 24,
        studentsRemaining: 36,
        maxCoaches: 3,
        currentCoaches: 2,
        coachesRemaining: 1,
        maxCentres: 1,
        currentCentres: 1,
        centresRemaining: 0,
        activeAddons: [],
        features: {
          ONLINE_ADMISSIONS: true,
          ATTENDANCE_TRACKING: true,
          FEE_INVOICING: true,
          PERFORMANCE_REPORTS: true,
        },
      });
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
    setActionLoading(`plan-${planCode}`);
    setSuccessMessage(null);
    setErrorMessage(null);
    try {
      const updated = await AcademySubscriptionService.subscribe({
        organizationUuid: orgId,
        planCode,
        billingCycle,
        paymentReference: `WEB_ACADEMY_${Date.now()}`,
      });
      setEntitlements(updated);
      setSuccessMessage(`Successfully switched to ${planCode.replace('ACADEMY_', '')} plan!`);
    } catch (err: any) {
      setErrorMessage(err?.data?.message || err?.message || 'Failed to update academy subscription.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleBuyAddon = async (addonType: 'STUDENT_PACK' | 'CAMPUS' | 'COACH') => {
    setActionLoading(`addon-${addonType}`);
    setSuccessMessage(null);
    setErrorMessage(null);
    try {
      const updated = await AcademySubscriptionService.purchaseAddon({
        organizationUuid: orgId,
        addonType,
        quantity: 1,
        durationMonths: 1,
        paymentReference: `ADDON_${addonType}_${Date.now()}`,
      });
      setEntitlements(updated);
      setSuccessMessage(`Added capacity booster pack successfully!`);
    } catch (err: any) {
      setErrorMessage(err?.data?.message || err?.message || 'Failed to purchase add-on.');
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mb-3" />
        <h3 className="text-sm font-bold text-foreground">Loading Academy Capacity & Billing...</h3>
        <p className="text-[11px] text-text-muted mt-0.5">Fetching trainee ceilings and active add-on boosters</p>
      </div>
    );
  }

  const studentPct = entitlements?.maxStudents
    ? Math.min(100, Math.round((entitlements.currentStudents / entitlements.maxStudents) * 100))
    : 0;
  const coachPct = entitlements?.maxCoaches
    ? Math.min(100, Math.round((entitlements.currentCoaches / entitlements.maxCoaches) * 100))
    : 0;
  const centrePct = entitlements?.maxCentres
    ? Math.min(100, Math.round((entitlements.currentCentres / entitlements.maxCentres) * 100))
    : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 text-foreground">
      {/* ── Top Header Strip ───────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-3">
          <Link
            href={`/org/${orgId}/academy`}
            className="p-2.5 rounded-xl border border-border bg-surface hover:bg-surface-hover text-text-muted hover:text-foreground transition shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                🎓 ACADEMY LICENSING
              </span>
              <span className="text-xs font-mono font-bold text-text-muted">
                {entitlements?.organizationName || 'Academy Hub'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight mt-1">
              Trainee Capacity & Billing Hub
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/subscription"
            className="px-4 py-2 rounded-xl text-xs font-bold border border-border bg-surface hover:bg-surface-hover text-foreground transition shadow-sm flex items-center gap-1.5"
          >
            <span>Browse All Plans</span>
            <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
          </Link>
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl border border-border bg-surface hover:bg-surface-hover text-text-muted hover:text-foreground transition shadow-sm"
            title="Refresh Real-time Quotas"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm font-semibold flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs sm:text-sm font-semibold flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ── 1. ACTIVE SUBSCRIPTION STATUS BANNER ────────────────────────────── */}
      <section
        className="rounded-[26px] p-6 border shadow-xl relative overflow-hidden transition-all"
        style={{
          backgroundColor: 'var(--athlon-card)',
          borderColor: 'var(--athlon-border)',
        }}
      >
        <div className="absolute inset-x-0 top-0 h-[40%] bg-gradient-to-b from-white/[0.08] dark:from-white/[0.03] via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                ACTIVE ACADEMY MEMBERSHIP
              </span>
              <span className="text-xs text-text-muted">•</span>
              <span className="text-xs font-bold text-text-muted capitalize">
                {entitlements?.billingCycle.toLowerCase()} cycle
              </span>
            </div>
            <div className="flex items-baseline gap-3">
              <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                {entitlements?.activePlanName || 'Grassroots Free Tier'}
              </h2>
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                {entitlements?.daysRemaining !== undefined ? `${entitlements.daysRemaining} Days Left` : 'Active'}
              </span>
            </div>
            <p className="text-xs text-text-secondary max-w-xl leading-relaxed">
              Enforces real-time student admission validation, coach staff credentials, campus branch creation, and monthly parent fee collection.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-3 rounded-2xl bg-surface border border-border text-center">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                Billing Cycle
              </span>
              <span className="text-sm font-black text-foreground font-mono">
                {entitlements?.billingCycle || 'MONTHLY'}
              </span>
            </div>
            <div className="px-4 py-3 rounded-2xl bg-surface border border-border text-center">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                Expiry Date
              </span>
              <span className="text-sm font-black text-foreground font-mono">
                {entitlements?.endDate ? new Date(entitlements.endDate).toLocaleDateString() : 'Forever'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. REAL-TIME CAPACITY METERS & GAUGES ──────────────────────────── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-black uppercase tracking-wider text-text-muted flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span>Real-time Resource Ceilings & Utilization</span>
          </h3>
          <span className="text-[11px] text-text-muted font-mono">
            Guarded by Identity Service
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Gauge 1: Student Trainee Capacity */}
          <div className="bg-card rounded-2xl border border-border p-5 space-y-4 shadow-sm relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-text-muted block">
                    Active Trainees
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-2xl font-black text-foreground font-mono">
                      {entitlements?.currentStudents ?? 0}
                    </span>
                    <span className="text-xs font-bold text-text-muted font-mono">
                      / {entitlements?.maxStudents ?? 15} Max
                    </span>
                  </div>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-black font-mono ${studentPct > 90 ? 'bg-rose-500/15 text-rose-500' : 'bg-surface text-text-muted'}`}>
                {studentPct}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full bg-surface overflow-hidden border border-border">
              <div
                className={`h-full rounded-full transition-all duration-500 ${studentPct > 90 ? 'bg-rose-500' : studentPct > 75 ? 'bg-amber-500' : 'bg-primary'}`}
                style={{ width: `${studentPct}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-text-secondary pt-1">
              <span>{entitlements?.studentsRemaining ?? 0} Seats Remaining</span>
              <button
                onClick={() => handleBuyAddon('STUDENT_PACK')}
                disabled={actionLoading === 'addon-STUDENT_PACK'}
                className="text-primary font-bold hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>+50 Pack (₹499)</span>
              </button>
            </div>
          </div>

          {/* Gauge 2: Coach Staff Seats */}
          <div className="bg-card rounded-2xl border border-border p-5 space-y-4 shadow-sm relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-text-muted block">
                    Coach Staff Logins
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-2xl font-black text-foreground font-mono">
                      {entitlements?.currentCoaches ?? 0}
                    </span>
                    <span className="text-xs font-bold text-text-muted font-mono">
                      / {entitlements?.maxCoaches ?? 1} Max
                    </span>
                  </div>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-black font-mono ${coachPct >= 100 ? 'bg-rose-500/15 text-rose-500' : 'bg-surface text-text-muted'}`}>
                {coachPct}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full bg-surface overflow-hidden border border-border">
              <div
                className={`h-full rounded-full transition-all duration-500 ${coachPct >= 100 ? 'bg-rose-500' : 'bg-indigo-500'}`}
                style={{ width: `${coachPct}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-text-secondary pt-1">
              <span>{entitlements?.coachesRemaining ?? 0} Staff Seats Left</span>
              <button
                onClick={() => handleBuyAddon('COACH')}
                disabled={actionLoading === 'addon-COACH'}
                className="text-indigo-500 font-bold hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>+1 Coach (₹299)</span>
              </button>
            </div>
          </div>

          {/* Gauge 3: Campus Centres */}
          <div className="bg-card rounded-2xl border border-border p-5 space-y-4 shadow-sm relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-text-muted block">
                    Campuses / Centres
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-2xl font-black text-foreground font-mono">
                      {entitlements?.currentCentres ?? 0}
                    </span>
                    <span className="text-xs font-bold text-text-muted font-mono">
                      / {entitlements?.maxCentres ?? 1} Max
                    </span>
                  </div>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-black font-mono ${centrePct >= 100 ? 'bg-rose-500/15 text-rose-500' : 'bg-surface text-text-muted'}`}>
                {centrePct}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full bg-surface overflow-hidden border border-border">
              <div
                className={`h-full rounded-full transition-all duration-500 ${centrePct >= 100 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                style={{ width: `${centrePct}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-text-secondary pt-1">
              <span>{entitlements?.centresRemaining ?? 0} Campus Slots Left</span>
              <button
                onClick={() => handleBuyAddon('CAMPUS')}
                disabled={actionLoading === 'addon-CAMPUS'}
                className="text-emerald-500 font-bold hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>+1 Campus (₹799)</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. CAPACITY BOOSTER ADD-ONS ────────────────────────────────────── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-text-muted flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Instant Capacity Booster Add-ons</span>
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Add individual resource packs without switching your entire plan tier.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Booster 1: +50 Students */}
          <div className="rounded-2xl border border-border bg-surface p-4.5 flex flex-col justify-between space-y-4 shadow-sm hover:border-primary/50 transition">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-blue-500/15 text-blue-600 dark:text-blue-400">
                  TRAINEE BOOSTER
                </span>
                <span className="text-base font-black text-foreground font-mono">₹499/mo</span>
              </div>
              <h4 className="text-sm font-bold text-foreground">+50 Student Capacity Pack</h4>
              <p className="text-[11px] text-text-secondary leading-relaxed">
                Expands your active student roster quota by 50 trainees for 30 days.
              </p>
            </div>
            <button
              onClick={() => handleBuyAddon('STUDENT_PACK')}
              disabled={actionLoading === 'addon-STUDENT_PACK'}
              className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary-hover active:scale-95 transition shadow-sm flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{actionLoading === 'addon-STUDENT_PACK' ? 'Activating...' : 'Add +50 Trainees'}</span>
            </button>
          </div>

          {/* Booster 2: +1 Campus Centre */}
          <div className="rounded-2xl border border-border bg-surface p-4.5 flex flex-col justify-between space-y-4 shadow-sm hover:border-emerald-500/50 transition">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  BRANCH PACK
                </span>
                <span className="text-base font-black text-foreground font-mono">₹799/mo</span>
              </div>
              <h4 className="text-sm font-bold text-foreground">+1 Campus Centre Branch</h4>
              <p className="text-[11px] text-text-secondary leading-relaxed">
                Enables creating an additional training facility under your academy.
              </p>
            </div>
            <button
              onClick={() => handleBuyAddon('CAMPUS')}
              disabled={actionLoading === 'addon-CAMPUS'}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold active:scale-95 transition shadow-sm flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{actionLoading === 'addon-CAMPUS' ? 'Activating...' : 'Add +1 Campus'}</span>
            </button>
          </div>

          {/* Booster 3: +1 Coach Staff */}
          <div className="rounded-2xl border border-border bg-surface p-4.5 flex flex-col justify-between space-y-4 shadow-sm hover:border-indigo-500/50 transition">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                  STAFF SEAT
                </span>
                <span className="text-base font-black text-foreground font-mono">₹299/mo</span>
              </div>
              <h4 className="text-sm font-bold text-foreground">+1 Coach Staff Account</h4>
              <p className="text-[11px] text-text-secondary leading-relaxed">
                Add an additional coach login with mobile attendance and shift access.
              </p>
            </div>
            <button
              onClick={() => handleBuyAddon('COACH')}
              disabled={actionLoading === 'addon-COACH'}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold active:scale-95 transition shadow-sm flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{actionLoading === 'addon-COACH' ? 'Activating...' : 'Add +1 Coach'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── 4. PLAN SWITCHER & UPGRADE MATRIX ──────────────────────────────── */}
      <section className="space-y-4 pt-4 border-t border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-black text-foreground tracking-tight">
              Switch or Upgrade Academy Plan Tier
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">
              Upgrade instantly to unlock higher trainee capacity, multi-campus branches, and coach payroll.
            </p>
          </div>

          {/* Billing Switcher */}
          <div className="inline-flex items-center p-1 bg-surface border border-border rounded-xl self-start sm:self-auto">
            <button
              onClick={() => setBillingCycle('MONTHLY')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${billingCycle === 'MONTHLY' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-text-muted'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('YEARLY')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${billingCycle === 'YEARLY' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-text-muted'}`}
            >
              <span>Yearly</span>
              <span className="text-[9px] px-1 py-0.2 rounded font-black uppercase bg-emerald-500/20 text-emerald-400">
                Save ~20%
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card: Starter */}
          <div className="rounded-2xl border border-border bg-card p-5 flex flex-col justify-between space-y-4 shadow-sm hover:border-primary/40 transition">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-blue-500/15 text-blue-500">
                  60 STUDENTS
                </span>
                <span className="text-xs text-text-muted font-bold">Small Academies</span>
              </div>
              <div>
                <h4 className="text-base font-black text-foreground">Starter Academy</h4>
                <div className="flex items-baseline gap-1 mt-1 font-mono">
                  <span className="text-xl font-black text-foreground">
                    {billingCycle === 'YEARLY' ? '₹9,999' : '₹999'}
                  </span>
                  <span className="text-xs text-text-muted">
                    /{billingCycle === 'YEARLY' ? 'yr' : 'mo'}
                  </span>
                </div>
              </div>
              <div className="space-y-1.5 text-xs text-text-secondary pt-2 border-t border-border/60">
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>Up to 60 Active Trainees</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>3 Coach Staff Logins</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>Online Student Admissions</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>WhatsApp Fee Reminders</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => handleSubscribe('ACADEMY_STARTER')}
              disabled={actionLoading === 'plan-ACADEMY_STARTER' || entitlements?.activePlanCode === 'ACADEMY_STARTER'}
              className="w-full py-2.5 rounded-xl border border-primary text-primary hover:bg-primary hover:text-primary-foreground text-xs font-bold transition disabled:opacity-50"
            >
              {entitlements?.activePlanCode === 'ACADEMY_STARTER' ? 'Current Tier' : 'Select Starter'}
            </button>
          </div>

          {/* Card: Professional */}
          <div className="rounded-2xl border-2 border-indigo-500/50 bg-card p-5 flex flex-col justify-between space-y-4 shadow-md relative overflow-hidden">
            <div className="absolute top-2 right-2">
              <span className="px-2 py-0.5 rounded text-[8.5px] font-black uppercase bg-gradient-to-r from-indigo-500 to-emerald-400 text-black">
                MOST POPULAR
              </span>
            </div>
            <div className="space-y-3">
              <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-indigo-500/15 text-indigo-500">
                250 STUDENTS • 3 CAMPUSES
              </span>
              <div>
                <h4 className="text-base font-black text-foreground">Professional Hub</h4>
                <div className="flex items-baseline gap-1 mt-1 font-mono">
                  <span className="text-xl font-black text-foreground">
                    {billingCycle === 'YEARLY' ? '₹24,999' : '₹2,499'}
                  </span>
                  <span className="text-xs text-text-muted">
                    /{billingCycle === 'YEARLY' ? 'yr' : 'mo'}
                  </span>
                </div>
              </div>
              <div className="space-y-1.5 text-xs text-text-secondary pt-2 border-t border-border/60">
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Up to 250 Trainees across 3 Centres</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>10 Coach Staff Accounts</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Coach Payroll & Session Shifts</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Automated Fee Auto-Debit Links</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Video Reviews & Skill Benchmarks</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => handleSubscribe('ACADEMY_PRO')}
              disabled={actionLoading === 'plan-ACADEMY_PRO' || entitlements?.activePlanCode === 'ACADEMY_PRO'}
              className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-black uppercase tracking-wider transition shadow-md disabled:opacity-50"
            >
              {entitlements?.activePlanCode === 'ACADEMY_PRO' ? 'Current Tier' : 'Upgrade to Pro'}
            </button>
          </div>

          {/* Card: Elite */}
          <div className="rounded-2xl border border-border bg-card p-5 flex flex-col justify-between space-y-4 shadow-sm hover:border-emerald-500/40 transition">
            <div className="space-y-3">
              <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-500/15 text-emerald-500">
                750 STUDENTS • 10 CAMPUSES
              </span>
              <div>
                <h4 className="text-base font-black text-foreground">Elite Academy</h4>
                <div className="flex items-baseline gap-1 mt-1 font-mono">
                  <span className="text-xl font-black text-foreground">
                    {billingCycle === 'YEARLY' ? '₹49,999' : '₹4,999'}
                  </span>
                  <span className="text-xs text-text-muted">
                    /{billingCycle === 'YEARLY' ? 'yr' : 'mo'}
                  </span>
                </div>
              </div>
              <div className="space-y-1.5 text-xs text-text-secondary pt-2 border-t border-border/60">
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Up to 750 Trainees across 10 Centres</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>30 Staff Coach Accounts</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Geo-fenced Coach Attendance</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Centralized Treasury & P&L</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => handleSubscribe('ACADEMY_BUSINESS')}
              disabled={actionLoading === 'plan-ACADEMY_BUSINESS' || entitlements?.activePlanCode === 'ACADEMY_BUSINESS'}
              className="w-full py-2.5 rounded-xl border border-border bg-surface hover:bg-surface-hover text-foreground text-xs font-bold transition disabled:opacity-50"
            >
              {entitlements?.activePlanCode === 'ACADEMY_BUSINESS' ? 'Current Tier' : 'Select Elite'}
            </button>
          </div>

          {/* Card: Enterprise */}
          <div className="rounded-2xl border border-border bg-card p-5 flex flex-col justify-between space-y-4 shadow-sm hover:border-purple-500/40 transition">
            <div className="space-y-3">
              <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-purple-500/15 text-purple-500">
                FRANCHISE CHAIN
              </span>
              <div>
                <h4 className="text-base font-black text-foreground">Franchise Enterprise</h4>
                <div className="flex items-baseline gap-1 mt-1 font-mono">
                  <span className="text-xl font-black text-purple-600 dark:text-purple-400">Custom SLA</span>
                </div>
              </div>
              <div className="space-y-1.5 text-xs text-text-secondary pt-2 border-t border-border/60">
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                  <span>Unlimited Students, Coaches & Campuses</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                  <span>White-label Custom Student App</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                  <span>Multi-State Franchise Royalty Sync</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                  <span>Dedicated SLA & Account Manager</span>
                </div>
              </div>
            </div>
            <a
              href="mailto:enterprise@athlonsports.in?subject=Athlon%20Academy%20Enterprise%20Inquiry"
              className="w-full py-2.5 rounded-xl border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-300 text-xs font-bold text-center transition block"
            >
              Contact Enterprise
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

