'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useWorkspaceStore, WorkspaceType, Organization } from '@/lib/store/useWorkspaceStore';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { OrganizationService } from '@/lib/api/organization';
import {
  Trophy,
  Users,
  Building2,
  MapPin,
  Check,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  CreditCard,
  ShieldCheck,
  Lock,
  Zap,
  Calendar,
  GraduationCap,
  Info,
  Layers,
  ArrowRight,
  Clock,
  UserCheck,
  BadgeCheck,
  Flame,
  Globe,
  Ticket,
  Crown
} from 'lucide-react';
import Link from 'next/link';

type BillingCycle = 'monthly' | 'yearly';

interface WorkspaceModule {
  id: string;
  type: WorkspaceType;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  isSingleEvent?: boolean;
  isTeamChampionship?: boolean;
  icon: any;
  colorScheme: {
    accent: string;
    text: string;
    bg: string;
    border: string;
    badgeBg: string;
    badgeText: string;
  };
  features: string[];
  pricingOptions: {
    label: string;
    value: BillingCycle;
    price: number;
    formattedPrice: string;
    description: string;
    savingsBadge?: string;
  }[];
}

function SetupWorkspaceForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const packageId = searchParams.get('packageId');
  const initialBilling = (searchParams.get('billing') as BillingCycle) || 'monthly';
  
  const { addOrganization, setActiveWorkspace } = useWorkspaceStore();
  const { userEmail, userId } = useAuthStore();

  const [selectedModule, setSelectedModule] = useState<WorkspaceModule | null>(null);
  const [orgName, setOrgName] = useState('');
  const [selectedBilling, setSelectedBilling] = useState<BillingCycle>(initialBilling);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!packageId) {
      router.push('/subscription');
      return;
    }

    const fetchPackage = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050'}/api/identity/subscriptions/getPackageByUuid/${packageId}`
        );
        const json = await response.json();

        if (json.success && json.data) {
          const pkg = json.data;
          const nameLower = (pkg.name || '').toLowerCase();

          let type: WorkspaceType = 'PERSONAL';
          let icon = Trophy;
          let subtitle = 'Professional Sports Organization';
          let badge = 'ORGANIZATION';
          let isSingleEvent = false;
          let isTeamChampionship = false;
          let colorScheme = {
            accent: 'from-emerald-500 to-teal-600',
            text: 'text-primary',
            bg: 'bg-primary/10',
            border: 'border-primary/30',
            badgeBg: 'bg-primary/15',
            badgeText: 'text-primary',
          };
          let defaultFeatures = ['Instant Activation', 'Multi-Sport Engine', 'Real-time Cloud Sync'];

          if (nameLower.includes('auction') || nameLower.includes('championship')) {
            type = 'ORGANIZER';
            icon = Crown;
            subtitle = 'Franchise Mega-Event with Live Player Auctions';
            badge = 'MEGA AUCTION PASS';
            isSingleEvent = true;
            isTeamChampionship = true;
            colorScheme = {
              accent: 'from-amber-500 via-purple-500 to-pink-500',
              text: 'text-amber-500 dark:text-amber-300',
              bg: 'bg-amber-500/10 dark:bg-purple-500/10',
              border: 'border-amber-500/40 dark:border-purple-500/40',
              badgeBg: 'bg-gradient-to-r from-amber-500/20 to-purple-500/20',
              badgeText: 'text-amber-600 dark:text-amber-300 font-black',
            };
            defaultFeatures = [
              '1 Complete Team Championship Event',
              'Real-Time Live Player Auction & Bidding Console',
              'Franchise Owner Purse & Squad Management',
              'Team vs Team Multi-Match Tie Lineup Matrix',
              'Live YouTube Auction Screen & Score Overlays',
            ];
          } else if (nameLower.includes('single')) {
            type = 'ORGANIZER';
            icon = Ticket;
            subtitle = 'Pay-Per-Event for Knockout & League Draws';
            badge = '1 TOURNAMENT PASS';
            isSingleEvent = true;
            colorScheme = {
              accent: 'from-cyan-500 to-blue-600',
              text: 'text-cyan-500 dark:text-cyan-400',
              bg: 'bg-cyan-500/10',
              border: 'border-cyan-500/30',
              badgeBg: 'bg-cyan-500/15',
              badgeText: 'text-cyan-600 dark:text-cyan-300',
            };
            defaultFeatures = [
              '1 Complete Knockout / League Tournament',
              'Live YouTube Stream Score Overlay',
              'Automated Knockout & League Fixtures',
              'Digital Umpire Console for All Courts',
              'Fixtures & Player Bracket PDF Generator',
            ];
          } else if (nameLower.includes('organizer') || nameLower.includes('tournament')) {
            type = 'ORGANIZER';
            icon = Trophy;
            subtitle = 'Unlimited Knockout & League Tournaments / Month';
            badge = 'UNLIMITED MONTHLY';
            colorScheme = {
              accent: 'from-emerald-400 to-teal-500',
              text: 'text-emerald-500 dark:text-emerald-400',
              bg: 'bg-emerald-500/10',
              border: 'border-emerald-500/30',
              badgeBg: 'bg-emerald-500/15',
              badgeText: 'text-emerald-600 dark:text-emerald-300',
            };
            defaultFeatures = [
              'Unlimited Knockout & League Tournaments / Mo',
              'Live YouTube Stream Score Overlay',
              'Automated Knockout & League Fixtures',
              'Digital Umpire Console for All Courts',
              'Multi-Court Control Room & Schedule Matrix',
            ];
          } else if (nameLower.includes('academy')) {
            type = 'ACADEMY';
            icon = GraduationCap;
            subtitle = 'Academy & Student Management';
            badge = 'COACHING HUB';
            colorScheme = {
              accent: 'from-blue-500 to-cyan-500',
              text: 'text-blue-500 dark:text-blue-400',
              bg: 'bg-blue-500/10',
              border: 'border-blue-500/30',
              badgeBg: 'bg-blue-500/15',
              badgeText: 'text-blue-600 dark:text-blue-300',
            };
            defaultFeatures = [
              'Student Roster & Skill Assessment',
              'Automated Monthly Fee Invoicing',
              'Coach Batch Assignments & Payroll',
              'Attendance & Performance Reports',
            ];
          } else if (nameLower.includes('club')) {
            type = 'CLUB';
            icon = Building2;
            subtitle = 'Club Operations & Membership';
            badge = 'SPORTS CLUB';
            colorScheme = {
              accent: 'from-purple-500 to-indigo-500',
              text: 'text-purple-500 dark:text-purple-400',
              bg: 'bg-purple-500/10',
              border: 'border-purple-500/30',
              badgeBg: 'bg-purple-500/15',
              badgeText: 'text-purple-600 dark:text-purple-300',
            };
            defaultFeatures = [
              'Member Directory & Digital Pass',
              'Court & Facility Booking Calendar',
              'Internal Club Tournaments & Ladders',
              'Financial Accounts & Revenue Reports',
            ];
          } else if (nameLower.includes('court')) {
            type = 'COURT';
            icon = MapPin;
            subtitle = 'Venue Booking & Turf Management';
            badge = 'VENUE & TURF';
            colorScheme = {
              accent: 'from-rose-500 to-pink-500',
              text: 'text-rose-500 dark:text-rose-400',
              bg: 'bg-rose-500/10',
              border: 'border-rose-500/30',
              badgeBg: 'bg-rose-500/15',
              badgeText: 'text-rose-600 dark:text-rose-300',
            };
            defaultFeatures = [
              'Dynamic Slot Pricing & Booking Matrix',
              'Online UPI & Card Payment Gateway',
              'Instant Check-in & Customer Ratings',
              'Occupancy & Revenue Analytics',
            ];
          }

          let parsedFeatures: string[] = [];
          try {
            parsedFeatures = JSON.parse(pkg.features);
          } catch (e) {
            parsedFeatures = defaultFeatures;
          }

          const baseMonthly = Number(pkg.price) || 0;
          const baseYearly = baseMonthly * 10;

          const pricingOptions = isTeamChampionship
            ? [
                {
                  label: '1 Complete Team Championship Event Pass',
                  value: 'monthly' as BillingCycle,
                  price: baseMonthly,
                  formattedPrice: `₹${baseMonthly.toLocaleString()}`,
                  description: 'Includes live player auction console & multi-match tie scoring',
                },
              ]
            : isSingleEvent
            ? [
                {
                  label: '1 Complete Knockout / League Pass',
                  value: 'monthly' as BillingCycle,
                  price: baseMonthly,
                  formattedPrice: `₹${baseMonthly.toLocaleString()}`,
                  description: 'One-time event pass (No recurring monthly fee)',
                },
              ]
            : [
                {
                  label: 'Monthly License Plan',
                  value: 'monthly' as BillingCycle,
                  price: baseMonthly,
                  formattedPrice: `₹${baseMonthly.toLocaleString()}`,
                  description: 'Billed monthly with flexible cancellation',
                },
                {
                  label: 'Annual License Plan',
                  value: 'yearly' as BillingCycle,
                  price: baseYearly,
                  formattedPrice: `₹${baseYearly.toLocaleString()}`,
                  description: `Billed annually at ₹${Math.round(baseYearly / 12).toLocaleString()}/mo`,
                  savingsBadge: 'Save ~20% (2 Months Free)',
                },
              ];

          const mod: WorkspaceModule = {
            id: pkg.uuid,
            type,
            title: pkg.name,
            subtitle,
            description: pkg.description,
            badge,
            isSingleEvent,
            isTeamChampionship,
            icon,
            colorScheme,
            features: parsedFeatures.length > 0 ? parsedFeatures : defaultFeatures,
            pricingOptions,
          };

          setSelectedModule(mod);
          if (initialBilling === 'yearly' && !isSingleEvent) {
            setSelectedBilling('yearly');
          } else {
            setSelectedBilling('monthly');
          }
        } else {
          router.push('/subscription');
        }
      } catch (error) {
        console.error('Failed to fetch package:', error);
        router.push('/subscription');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPackage();
  }, [packageId, initialBilling, router]);

  const handleCreateWorkspace = async () => {
    if (!selectedModule || !orgName.trim() || isCreating) return;

    setIsCreating(true);

    let newOrgIdStr = `org_${Date.now()}`;
    let finalOrgName = orgName.trim();
    let finalOrgType = selectedModule.type;

    try {
      const orgRes = await OrganizationService.create({
        name: finalOrgName,
        type: finalOrgType,
        subscriptionPackageUuid: selectedModule.id,
      });

      if (orgRes && orgRes.data && orgRes.data.uuid) {
        newOrgIdStr = orgRes.data.uuid;
        finalOrgName = orgRes.data.name || finalOrgName;
        finalOrgType = (orgRes.data.type as WorkspaceType) || finalOrgType;
      }
    } catch (err) {
      console.warn('API Create Organization failed, proceeding with local store', err);
    }

    const newOrg: Organization = {
      id: newOrgIdStr,
      name: finalOrgName,
      type: finalOrgType,
    };

    addOrganization(newOrg);
    setActiveWorkspace(newOrgIdStr);

    setIsCreating(false);
    router.push(`/org/${newOrgIdStr}/dashboard`);
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <h3 className="text-base font-bold text-foreground">Preparing Workspace Configurator...</h3>
        <p className="text-xs text-text-muted mt-1">Retrieving licensed package permissions</p>
      </div>
    );
  }

  if (!selectedModule) return null;

  const currentPricing =
    selectedModule.pricingOptions.find((p) => p.value === selectedBilling) ||
    selectedModule.pricingOptions[0];

  const Icon = selectedModule.icon;

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* ── Background Ambient Glow ────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[650px] h-[350px] bg-primary/10 rounded-full blur-[120px] dark:bg-primary/15" />
        <div className="absolute top-[40%] -right-20 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] dark:bg-emerald-500/10" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* ── Top Bar ──────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <Link
            href="/subscription"
            className="group inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface border border-border hover:border-primary/40 text-sm font-semibold text-text-muted hover:text-foreground transition-all duration-200 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 text-primary" />
            <span>Change Package</span>
          </Link>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface/80 backdrop-blur-md border border-border text-xs font-semibold text-text-secondary">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            <span>Secure 256-Bit SSL Activation</span>
          </div>
        </div>

        {/* ── Main Two-Column Container ────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ── Left Column: Module Summary (5 cols) ───────────────────────── */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-card rounded-[28px] border border-border p-6 sm:p-8 shadow-md relative overflow-hidden">
              
              {/* Background Glow Watermark */}
              <div className="absolute -bottom-8 -right-8 opacity-5 dark:opacity-10 pointer-events-none">
                <Icon className="w-64 h-64 text-foreground" />
              </div>

              {/* Module Header */}
              <div className="flex items-start gap-4 mb-6 relative z-10">
                <div
                  className={`w-14 h-14 rounded-2xl ${selectedModule.colorScheme.bg} border ${selectedModule.colorScheme.border} flex items-center justify-center shrink-0 shadow-inner`}
                >
                  <Icon className={`w-7 h-7 ${selectedModule.colorScheme.text}`} />
                </div>
                <div>
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md ${selectedModule.colorScheme.badgeBg} ${selectedModule.colorScheme.badgeText} border ${selectedModule.colorScheme.border} inline-block mb-1.5`}
                  >
                    {selectedModule.badge}
                  </span>
                  <h2 className="text-2xl font-black text-foreground tracking-tight leading-tight">
                    {selectedModule.title}
                  </h2>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed mb-6 relative z-10 font-medium">
                {selectedModule.description}
              </p>

              {/* Included Tools & Capabilities */}
              <div className="space-y-3 pt-6 border-t border-border relative z-10 mb-6">
                <h4 className="text-xs font-black uppercase tracking-wider text-text-muted">
                  Included In This Workspace:
                </h4>
                {selectedModule.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs text-foreground/90 font-semibold">
                    <div className="w-4 h-4 rounded-full bg-primary/15 text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              {/* Security & Instant Deployment Pill */}
              <div className="p-4 rounded-2xl bg-surface border border-border text-xs text-text-muted flex items-start gap-3 relative z-10">
                <Zap className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold text-foreground block">Instant Provisioning</span>
                  <span>Your workspace URL and administration dashboard activate immediately upon checkout.</span>
                </div>
              </div>

            </div>

            {/* Account Owner Card */}
            <div className="bg-surface/80 rounded-2xl border border-border p-4 sm:p-5 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                  Root Workspace Owner
                </span>
                <span className="text-xs sm:text-sm font-extrabold text-foreground truncate block">
                  {userEmail || `User #${userId || 'Primary'}`}
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase tracking-wider shrink-0">
                Active
              </span>
            </div>
          </div>

          {/* ── Right Column: Configuration & Checkout Form (7 cols) ───────── */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="bg-card rounded-[28px] border border-border p-6 sm:p-8 shadow-md">
              
              <div className="mb-8">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-primary/10 text-primary text-xs font-bold mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Step-by-Step Provisioning</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                  Configure Your Workspace
                </h1>
                <p className="text-xs sm:text-sm text-text-secondary mt-1">
                  Name your sports organization and confirm your license cycle.
                </p>
              </div>

              {/* ── Field 1: Organization Name ─────────────────────────────── */}
              <div className="mb-8">
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <label className="text-xs font-black uppercase tracking-wider text-foreground">
                    1. Organization / Workspace Name <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] font-bold text-text-muted">
                    {orgName.length}/50 chars
                  </span>
                </div>

                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <input
                    type="text"
                    maxLength={50}
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder={
                      selectedModule.isTeamChampionship
                        ? 'e.g. Kerala Badminton Super League (KBSL)'
                        : selectedModule.type === 'ORGANIZER'
                        ? 'e.g. South India Open Championship 2026'
                        : selectedModule.type === 'ACADEMY'
                        ? 'e.g. Apex Smashers Academy'
                        : selectedModule.type === 'CLUB'
                        ? 'e.g. Downtown Sports Club'
                        : 'e.g. PlayZone Arena Kazhakootam'
                    }
                    className="w-full pl-12 pr-4 py-3.5 sm:py-4 bg-surface border border-border rounded-2xl text-sm sm:text-base font-bold text-foreground placeholder:text-text-muted/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    autoFocus
                  />
                </div>

                {/* Real-time Preview Pill */}
                {orgName.trim() && (
                  <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface border border-border text-xs text-text-secondary">
                    <Globe className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="truncate">
                      Preview Dashboard: <strong className="text-foreground font-black">{orgName.trim()}</strong>
                    </span>
                  </div>
                )}
              </div>

              {/* ── Field 2: Select License Billing Cycle ──────────────────── */}
              <div className="mb-8">
                <label className="text-xs font-black uppercase tracking-wider text-foreground mb-3 block">
                  2. Select License Plan
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {selectedModule.pricingOptions.map((option) => {
                    const isSelected = selectedBilling === option.value;
                    return (
                      <div
                        key={option.value}
                        onClick={() => setSelectedBilling(option.value)}
                        className={`p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between relative overflow-hidden ${
                          isSelected
                            ? 'border-primary bg-primary/10 shadow-md shadow-primary/10 ring-1 ring-primary/30'
                            : 'border-border bg-surface hover:bg-surface-hover hover:border-primary/40'
                        }`}
                      >
                        {/* Savings Badge */}
                        {option.savingsBadge && (
                          <div className="absolute top-3 right-3">
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider">
                              Save 20%
                            </span>
                          </div>
                        )}

                        <div className="mb-3">
                          <div className="flex items-center gap-2 mb-1">
                            <div
                              className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                isSelected
                                  ? 'border-primary bg-primary text-primary-foreground'
                                  : 'border-border bg-card'
                              }`}
                            >
                              {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </div>
                            <span className="font-extrabold text-sm text-foreground">
                              {option.label}
                            </span>
                          </div>
                          <p className="text-[11px] text-text-muted font-medium pl-6">
                            {option.description}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-border/80 flex items-baseline gap-1 pl-6">
                          <span className="text-2xl font-black text-foreground">
                            {option.formattedPrice}
                          </span>
                          <span className="text-[11px] font-bold text-text-muted">
                            {selectedModule.isSingleEvent
                              ? '/ event'
                              : option.value === 'yearly'
                              ? '/ year'
                              : '/ month'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── Order Summary Breakdown Box ────────────────────────────── */}
              <div className="p-5 rounded-2xl bg-surface border border-border mb-8 space-y-3">
                <div className="flex items-center justify-between text-xs text-text-secondary">
                  <span>
                    {selectedModule.title}{' '}
                    ({selectedModule.isSingleEvent ? '1 Event Pass' : selectedBilling === 'yearly' ? 'Annual Plan' : 'Monthly Plan'})
                  </span>
                  <span className="font-bold text-foreground">{currentPricing.formattedPrice}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-text-secondary">
                  <span>Platform Setup & Instant Activation</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">FREE (₹0)</span>
                </div>
                <div className="flex items-center justify-between text-xs text-text-secondary">
                  <span>Applicable GST / Taxes</span>
                  <span className="font-bold text-text-muted">Included</span>
                </div>
                <div className="pt-3 border-t border-border flex items-center justify-between text-sm sm:text-base font-black text-foreground">
                  <span>Total Due Today</span>
                  <span className="text-xl sm:text-2xl text-primary font-black">
                    {currentPricing.formattedPrice}
                  </span>
                </div>
              </div>

              {/* ── Submit & Launch Action ─────────────────────────────────── */}
              <button
                onClick={handleCreateWorkspace}
                disabled={!orgName.trim() || isCreating}
                className="w-full py-4 sm:py-5 px-6 rounded-2xl bg-gradient-to-r from-primary to-emerald-600 hover:from-primary-hover hover:to-emerald-500 text-primary-foreground text-sm sm:text-base font-black uppercase tracking-wider transition-all duration-200 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
              >
                {isCreating ? (
                  <>
                    <span className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    <span>Provisioning Workspace...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    <span>Confirm & Launch Workspace</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-text-muted font-bold text-center">
                <span className="flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-primary" /> No Lock-in
                </span>
                <span>•</span>
                <span>Cancel Anytime</span>
                <span>•</span>
                <span>Instant Access</span>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default function SetupWorkspacePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-bold text-text-muted">Loading Workspace Setup...</span>
          </div>
        </div>
      }
    >
      <SetupWorkspaceForm />
    </Suspense>
  );
}
