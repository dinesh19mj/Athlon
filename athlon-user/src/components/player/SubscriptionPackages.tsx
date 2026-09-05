'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Trophy,
  Users,
  Building2,
  MapPin,
  Check,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Zap,
  Tv,
  Calendar,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Star,
  Flame,
  Layers,
  GraduationCap,
  Award,
  Search,
  BadgeCheck,
  HelpCircle,
  PhoneCall,
  CheckCircle2,
  Lock,
  ArrowUpRight,
  SlidersHorizontal,
  Ticket,
  Gavel,
  Crown
} from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { WorkspaceType } from '@/lib/store/useWorkspaceStore';

export type BillingCycle = 'monthly' | 'yearly';

export interface WorkspaceModule {
  id: string;
  type: WorkspaceType;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  isPopular?: boolean;
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
    glow: string;
  };
  monthlyPrice: number;
  yearlyPrice: number;
  highlightFeatures: string[];
  features: string[];
  specs: { label: string; value: string }[];
}

const FAQ_ITEMS = [
  {
    question: "What tournament formats are covered under standard Tournament Organizer packages?",
    answer: "Standard Tournament Organizer packages (Single Tournament Pass at ₹499 & Monthly Pro at ₹1,200/mo) support standard Knockout brackets and League / Round-Robin pool draws. They include automated draw generators, live umpire tablets, and YouTube score overlays."
  },
  {
    question: "Why is Team Championship & Live Auction a separate specialized package?",
    answer: "Team Championships are premium IPL-style multi-team events that involve a live interactive player auction console, franchise bidding wars, team purse budgets, team-vs-team multi-match tie rosters, and specialized auction streaming graphics. The dedicated Team Championship Pass (₹2,499) unlocks this complete mega-event suite for your tournament."
  },
  {
    question: "Can I manage multiple organizations under one account?",
    answer: "Yes! Athlon uses a unified Digital Sports Passport. You can create multiple workspaces (e.g. run an Academy while hosting independent Tournaments or Team Championships) and seamlessly switch between them from the top workspace menu."
  },
  {
    question: "How does YouTube Live Streaming with scoreboard overlays work?",
    answer: "All tournament packages connect your court/event stream key directly with our live score engine. Score and auction updates automatically overlay on your YouTube live broadcast stream in real-time."
  },
  {
    question: "Can I switch between monthly and annual billing later?",
    answer: "Absolutely. For recurring packages (Monthly Pro Organizer, Academy Hub, Club, Court), you can upgrade to annual billing anytime to take advantage of the 2-months-free discount (save ~20%)."
  },
  {
    question: "What payment methods are supported for workspace subscriptions?",
    answer: "We support all major payment options across India and globally, including UPI (GPay, PhonePe, Paytm), Credit/Debit Cards, Net Banking, and corporate invoices."
  }
];

export function SubscriptionPackages() {
  const router = useRouter();
  const { isAuthenticated, userId } = useAuthStore();

  const [isClient, setIsClient] = useState(false);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [modules, setModules] = useState<WorkspaceModule[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [showComparison, setShowComparison] = useState<boolean>(false);

  useEffect(() => {
    setIsClient(true);

    const fetchPackages = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050'}/api/identity/subscriptions/getAllPackages`
        );
        const json = await response.json();

        if (json.success && json.data) {
          const fetchedModules: WorkspaceModule[] = json.data.map((pkg: any) => {
            const nameLower = (pkg.name || '').toLowerCase();
            let type: WorkspaceType = 'PERSONAL';
            let icon = Trophy;
            let subtitle = 'High Performance Sports Operations';
            let isPopular = false;
            let isSingleEvent = false;
            let isTeamChampionship = false;
            let badge = 'ORGANIZATION';
            let colorScheme = {
              accent: 'from-emerald-500 to-teal-600',
              text: 'text-primary',
              bg: 'bg-primary/10',
              border: 'border-primary/30',
              badgeBg: 'bg-primary/15',
              badgeText: 'text-primary',
              glow: 'rgba(84, 172, 104, 0.25)',
            };
            let highlightFeatures = ['Instant Activation', 'Multi-Sport Support', 'Cloud Sync'];
            let specs = [
              { label: 'Format Support', value: 'Knockout & League' },
              { label: 'Live Streaming', value: '1080p HD Overlay' },
              { label: 'Uptime SLA', value: '99.9% Uptime' },
            ];

            if (nameLower.includes('auction') || nameLower.includes('championship')) {
              type = 'ORGANIZER';
              icon = Crown;
              subtitle = 'Franchise Mega-Event with Live Player Auctions';
              isSingleEvent = true;
              isTeamChampionship = true;
              badge = 'MEGA AUCTION PASS';
              colorScheme = {
                accent: 'from-amber-500 via-purple-500 to-pink-500',
                text: 'text-amber-500 dark:text-amber-300',
                bg: 'bg-amber-500/10 dark:bg-purple-500/10',
                border: 'border-amber-500/40 dark:border-purple-500/40',
                badgeBg: 'bg-gradient-to-r from-amber-500/20 to-purple-500/20',
                badgeText: 'text-amber-600 dark:text-amber-300 font-black',
                glow: 'rgba(245, 158, 11, 0.35)',
              };
              highlightFeatures = [
                '1 Complete Team Championship Event',
                'Real-Time Live Player Auction & Bidding Console',
                'Franchise Owner Purse & Squad Management',
                'Team vs Team Multi-Match Tie Lineup Matrix',
                'Live YouTube Auction Screen & Score Overlays',
              ];
              specs = [
                { label: 'Format Type', value: 'IPL-Style Team Event' },
                { label: 'Auction Console', value: 'Real-time Bidding' },
                { label: 'Tie Matrix', value: 'Sub-Match Lineups' },
              ];
            } else if (nameLower.includes('single')) {
              type = 'ORGANIZER';
              icon = Ticket;
              subtitle = 'Pay-Per-Event for Knockout & League Draws';
              isSingleEvent = true;
              badge = '1 TOURNAMENT PASS';
              colorScheme = {
                accent: 'from-cyan-500 to-blue-600',
                text: 'text-cyan-500 dark:text-cyan-400',
                bg: 'bg-cyan-500/10',
                border: 'border-cyan-500/30',
                badgeBg: 'bg-cyan-500/15',
                badgeText: 'text-cyan-600 dark:text-cyan-300',
                glow: 'rgba(6, 182, 212, 0.25)',
              };
              highlightFeatures = [
                '1 Complete Knockout / League Tournament',
                'Automated Knockout & League Draw Generator',
                'Live YouTube Score Overlay Broadcast',
                'Digital Umpire Console for All Courts',
                'Instant Draw & Bracket PDF Generator',
              ];
              specs = [
                { label: 'Format Type', value: 'Knockout & League' },
                { label: 'Validity', value: '1 Tournament Event' },
                { label: 'Live Streaming', value: '1080p HD Overlay' },
              ];
            } else if (nameLower.includes('organizer') || nameLower.includes('tournament')) {
              type = 'ORGANIZER';
              icon = Trophy;
              subtitle = 'Unlimited Knockout & League Tournaments / Month';
              isPopular = true;
              badge = 'UNLIMITED MONTHLY';
              colorScheme = {
                accent: 'from-emerald-400 to-teal-500',
                text: 'text-emerald-500 dark:text-emerald-400',
                bg: 'bg-emerald-500/10',
                border: 'border-emerald-500/30',
                badgeBg: 'bg-emerald-500/15',
                badgeText: 'text-emerald-600 dark:text-emerald-300',
                glow: 'rgba(16, 185, 129, 0.25)',
              };
              highlightFeatures = [
                'Unlimited Knockout & League Tournaments / Mo',
                'Automated Bracket & Pool Draw Engines',
                'Live YouTube Broadcast Score Overlays',
                'Digital Umpire Console for All Courts',
                'Multi-Court Control Room & Schedule Matrix',
              ];
              specs = [
                { label: 'Format Type', value: 'Knockout & League' },
                { label: 'Events Limit', value: 'Unlimited Tournaments' },
                { label: 'Live Streaming', value: 'Multi-Court HD' },
              ];
            } else if (nameLower.includes('academy')) {
              type = 'ACADEMY';
              icon = GraduationCap;
              subtitle = 'Complete Training & Student Lifecycle Platform';
              badge = 'COACHING & STUDENTS';
              colorScheme = {
                accent: 'from-blue-500 to-cyan-500',
                text: 'text-blue-500 dark:text-blue-400',
                bg: 'bg-blue-500/10',
                border: 'border-blue-500/30',
                badgeBg: 'bg-blue-500/15',
                badgeText: 'text-blue-600 dark:text-blue-300',
                glow: 'rgba(59, 130, 246, 0.25)',
              };
              highlightFeatures = [
                'Student Roster & Skill Level Tracking',
                'Automated Monthly Fee Invoicing',
                'Coach Batch Assignment & Payroll',
                'Attendance & Performance Reports',
              ];
              specs = [
                { label: 'Students Capacity', value: 'Up to 500 Students' },
                { label: 'Batches', value: 'Unlimited Batches' },
                { label: 'Reports', value: 'Automated PDF Cards' },
              ];
            } else if (nameLower.includes('club')) {
              type = 'CLUB';
              icon = Building2;
              subtitle = 'Membership, Facility & Internal Leagues Hub';
              badge = 'COMMUNITY & MEMBERS';
              colorScheme = {
                accent: 'from-purple-500 to-indigo-500',
                text: 'text-purple-500 dark:text-purple-400',
                bg: 'bg-purple-500/10',
                border: 'border-purple-500/30',
                badgeBg: 'bg-purple-500/15',
                badgeText: 'text-purple-600 dark:text-purple-300',
                glow: 'rgba(168, 85, 247, 0.25)',
              };
              highlightFeatures = [
                'Member Directory & Digital ID Badges',
                'Facility & Court Reservation Matrix',
                'Internal Club Leagues & Ladders',
                'Financial Accounting & Expense Ledgers',
              ];
              specs = [
                { label: 'Member Limit', value: 'Up to 2,000 Members' },
                { label: 'Venues', value: 'Multi-Facility Support' },
                { label: 'Ladder System', value: 'Real-time Ranking' },
              ];
            } else if (nameLower.includes('court')) {
              type = 'COURT';
              icon = MapPin;
              subtitle = 'Turnkey Turf & Arena Slot Booking System';
              badge = 'VENUE OWNERS';
              colorScheme = {
                accent: 'from-rose-500 to-pink-500',
                text: 'text-rose-500 dark:text-rose-400',
                bg: 'bg-rose-500/10',
                border: 'border-rose-500/30',
                badgeBg: 'bg-rose-500/15',
                badgeText: 'text-rose-600 dark:text-rose-300',
                glow: 'rgba(244, 63, 94, 0.25)',
              };
              highlightFeatures = [
                'Dynamic Slot Pricing & Real-Time Availability',
                'Instant Payment Gateway & UPI QR Check-In',
                'Player Reviews & Verified Badges',
                'Court Peak-Hour Revenue Analytics',
              ];
              specs = [
                { label: 'Courts Managed', value: 'Up to 20 Courts' },
                { label: 'Booking Matrix', value: 'Hourly & Daily' },
                { label: 'Payouts', value: 'Instant T+1 Settlement' },
              ];
            }

            let parsedFeatures: string[] = [];
            try {
              parsedFeatures = JSON.parse(pkg.features);
            } catch (e) {
              parsedFeatures = highlightFeatures;
            }

            const monthlyPrice = Number(pkg.price) || 0;
            const yearlyPrice = monthlyPrice * 10;

            return {
              id: pkg.uuid,
              type,
              title: pkg.name,
              subtitle,
              description: pkg.description,
              badge,
              isPopular,
              isSingleEvent,
              isTeamChampionship,
              icon,
              colorScheme,
              monthlyPrice,
              yearlyPrice,
              highlightFeatures,
              features: parsedFeatures.length > 0 ? parsedFeatures : highlightFeatures,
              specs,
            };
          });

          setModules(fetchedModules);
        }
      } catch (error) {
        console.error('Failed to fetch packages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPackages();
  }, []);

  const filteredModules = useMemo(() => {
    return modules.filter((mod) => {
      const matchCategory =
        activeCategory === 'ALL' ||
        (activeCategory === 'ORGANIZER' && mod.type === 'ORGANIZER' && !mod.isTeamChampionship) ||
        (activeCategory === 'AUCTION' && mod.isTeamChampionship) ||
        (activeCategory === 'ACADEMY' && mod.type === 'ACADEMY') ||
        (activeCategory === 'CLUB' && mod.type === 'CLUB') ||
        (activeCategory === 'COURT' && mod.type === 'COURT');

      const matchSearch =
        !searchQuery.trim() ||
        mod.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mod.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mod.features.some((f) => f.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchCategory && matchSearch;
    });
  }, [modules, activeCategory, searchQuery]);

  const handleSelectPackage = (pkg: WorkspaceModule) => {
    const cycle = pkg.isSingleEvent ? 'tournament' : billingCycle;
    router.push(`/setup-workspace?packageId=${pkg.id}&billing=${cycle}`);
  };

  if (!isClient) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-bold text-text-muted">Loading Subscription Hub...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* ── Background Glow & Grid Elements ───────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-primary/10 rounded-full blur-[120px] dark:bg-primary/15" />
        <div className="absolute top-[35%] -left-40 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] dark:bg-blue-500/10" />
        <div className="absolute top-[60%] -right-40 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[100px] dark:bg-amber-500/10" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-24">
        
        {/* ── Navigation Breadcrumb & Back Bar ─────────────────────────────── */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="group inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface border border-border hover:border-primary/40 text-sm font-semibold text-text-muted hover:text-foreground transition-all duration-200 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 text-primary" />
            <span>Back</span>
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface/80 backdrop-blur-md border border-border text-xs font-semibold text-text-secondary">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            <span>Athlon Digital Sports Passport</span>
          </div>
        </div>

        {/* ── Hero Header ─────────────────────────────────────────────────── */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-extrabold uppercase tracking-widest mb-4 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Modular Enterprise Ecosystem</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-[1.15] mb-4 sm:mb-6">
            Power Your Sports Journey with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-400 to-teal-300">
              Pro Workspaces
            </span>
          </h1>

          <p className="text-base sm:text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed font-normal">
            Choose specialized modules for standard Knockout & League tournaments, IPL-style Live Auction Team Championships, Academies, Sports Clubs, or Venues.
          </p>

          {/* ── Monthly / Yearly Billing Toggle ───────────────────────────── */}
          <div className="mt-8 inline-flex items-center justify-center p-1.5 bg-surface/90 backdrop-blur-md border border-border rounded-2xl shadow-lg relative">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`relative px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 ${
                billingCycle === 'monthly'
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]'
                  : 'text-text-muted hover:text-foreground'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`relative px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all duration-300 ${
                billingCycle === 'yearly'
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]'
                  : 'text-text-muted hover:text-foreground'
              }`}
            >
              <span>Annual Billing</span>
              <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md ${
                billingCycle === 'yearly'
                  ? 'bg-black/25 text-primary-foreground'
                  : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
              }`}>
                Save ~20%
              </span>
            </button>
          </div>
        </div>

        {/* ── Filter Tabs & Search Bar ────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10 pb-4 border-b border-border">
          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
            {[
              { id: 'ALL', label: 'All Packages', icon: Layers },
              { id: 'ORGANIZER', label: 'Knockout & League', icon: Trophy },
              { id: 'AUCTION', label: '👑 Team Championship & Auctions', icon: Crown },
              { id: 'ACADEMY', label: 'Academies', icon: GraduationCap },
              { id: 'CLUB', label: 'Clubs', icon: Building2 },
              { id: 'COURT', label: 'Courts', icon: MapPin },
            ].map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? 'bg-foreground text-background shadow-md'
                      : 'bg-surface hover:bg-surface-hover text-text-muted hover:text-foreground border border-border'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-background' : 'text-primary'}`} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search packages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9.5 pr-4 py-2 bg-surface border border-border rounded-xl text-xs sm:text-sm text-foreground placeholder:text-text-muted focus:outline-none focus:border-primary/60 transition-colors"
            />
          </div>
        </div>

        {/* ── Package Cards Grid ─────────────────────────────────────────── */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-[560px] bg-surface/60 rounded-[28px] border border-border/80 animate-pulse p-6 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-surface-hover" />
                  <div className="w-3/4 h-6 rounded-lg bg-surface-hover" />
                  <div className="w-full h-12 rounded-lg bg-surface-hover" />
                  <div className="w-1/2 h-8 rounded-lg bg-surface-hover mt-6" />
                </div>
                <div className="w-full h-12 rounded-xl bg-surface-hover" />
              </div>
            ))}
          </div>
        ) : filteredModules.length === 0 ? (
          <div className="bg-surface rounded-3xl border border-border p-12 text-center max-w-md mx-auto my-12">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">No matching modules found</h3>
            <p className="text-sm text-text-muted mb-6">
              Try adjusting your search query or reset your category filter.
            </p>
            <button
              onClick={() => {
                setActiveCategory('ALL');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-primary text-primary-foreground font-bold rounded-xl text-xs uppercase tracking-wider"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {filteredModules.map((mod) => {
              const Icon = mod.icon;
              const isSingle = mod.isSingleEvent;
              const isChamp = mod.isTeamChampionship;
              
              const displayPrice = isSingle
                ? mod.monthlyPrice
                : billingCycle === 'yearly'
                ? mod.yearlyPrice
                : mod.monthlyPrice;

              const equivalentMonthly = isSingle
                ? null
                : billingCycle === 'yearly'
                ? Math.round(mod.yearlyPrice / 12)
                : mod.monthlyPrice;

              return (
                <div
                  key={mod.id}
                  className={`group relative rounded-[28px] transition-all duration-300 flex flex-col justify-between ${
                    isChamp
                      ? 'bg-gradient-to-b from-card via-surface to-card border-2 border-amber-500/60 shadow-[0_16px_48px_rgba(245,158,11,0.2)] ring-1 ring-amber-500/40'
                      : mod.isPopular
                      ? 'bg-gradient-to-b from-card to-surface border-2 border-emerald-500/50 shadow-[0_12px_40px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/30'
                      : isSingle
                      ? 'bg-gradient-to-b from-card to-surface border border-cyan-500/40 shadow-sm hover:shadow-xl hover:border-cyan-500/60'
                      : 'bg-card hover:bg-card-hover border border-border hover:border-primary/40 shadow-sm hover:shadow-xl'
                  }`}
                >
                  {/* Popular & Special Accent Ribbons */}
                  {isChamp && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20">
                      <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500 via-purple-500 to-pink-500 text-black text-[11px] font-black uppercase tracking-wider shadow-md shadow-amber-500/30">
                        <Crown className="w-3.5 h-3.5" />
                        <span>Live Auction & Mega Teams</span>
                      </div>
                    </div>
                  )}

                  {!isChamp && mod.isPopular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-black text-[11px] font-black uppercase tracking-wider shadow-md shadow-emerald-500/25">
                        <Flame className="w-3 h-3 fill-current" />
                        <span>Most Popular</span>
                      </div>
                    </div>
                  )}

                  {!isChamp && isSingle && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500 text-black text-[11px] font-black uppercase tracking-wider shadow-md shadow-cyan-500/25">
                        <Ticket className="w-3 h-3" />
                        <span>Single Event Pass</span>
                      </div>
                    </div>
                  )}

                  {/* Card Header & Content */}
                  <div className="p-6 sm:p-7 flex flex-col flex-grow">
                    {/* Icon & Badge Row */}
                    <div className="flex items-start justify-between gap-3 mb-5">
                      <div
                        className={`w-14 h-14 rounded-2xl ${mod.colorScheme.bg} border ${mod.colorScheme.border} flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-300`}
                      >
                        <Icon className={`w-7 h-7 ${mod.colorScheme.text}`} />
                      </div>

                      <span
                        className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg ${mod.colorScheme.badgeBg} ${mod.colorScheme.badgeText} border ${mod.colorScheme.border}`}
                      >
                        {mod.badge}
                      </span>
                    </div>

                    {/* Title & Subtitle */}
                    <h3 className="text-xl sm:text-2xl font-black text-foreground tracking-tight mb-1.5">
                      {mod.title}
                    </h3>
                    <p className="text-xs font-semibold text-text-muted mb-4 line-clamp-1">
                      {mod.subtitle}
                    </p>

                    <p className="text-xs text-text-secondary leading-relaxed mb-6 font-medium">
                      {mod.description}
                    </p>

                    {/* Pricing Block */}
                    <div className="mb-6 p-4 rounded-2xl bg-surface/80 border border-border/80">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
                          ₹{displayPrice.toLocaleString()}
                        </span>
                        <span className="text-xs font-bold text-text-muted">
                          {isSingle
                            ? '/ event'
                            : billingCycle === 'yearly'
                            ? '/ year'
                            : '/ month'}
                        </span>
                      </div>

                      {isSingle ? (
                        <div className="flex items-center gap-1.5 mt-2 text-[11px] font-bold text-cyan-600 dark:text-cyan-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>One-time event pass (No monthly recurring fee)</span>
                        </div>
                      ) : (
                        billingCycle === 'yearly' && (
                          <div className="flex items-center gap-1.5 mt-2 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>
                              ₹{equivalentMonthly?.toLocaleString()}/mo (Save ₹{(mod.monthlyPrice * 2).toLocaleString()})
                            </span>
                          </div>
                        )
                      )}
                    </div>

                    {/* Key Capabilities List */}
                    <div className="space-y-2.5 mb-6 flex-grow">
                      <p className="text-[11px] font-black uppercase tracking-wider text-text-muted">
                        Included Features:
                      </p>
                      {mod.features.slice(0, 5).map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs text-foreground/90">
                          <div className={`w-4 h-4 rounded-full ${isChamp ? 'bg-amber-500/20 text-amber-500' : 'bg-primary/10 text-primary'} flex items-center justify-center shrink-0 mt-0.5`}>
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                          <span className="font-semibold leading-tight">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Quick Specs Pill Box */}
                    <div className="grid grid-cols-2 gap-2 pt-4 border-t border-border/80 text-[11px] text-text-muted">
                      {mod.specs.slice(0, 2).map((s, idx) => (
                        <div key={idx} className="bg-background/60 rounded-lg p-2 border border-border/60">
                          <span className="block text-[10px] text-text-muted">{s.label}</span>
                          <span className="font-bold text-foreground truncate block">{s.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card Action Button Footer */}
                  <div className="p-6 pt-0">
                    <button
                      onClick={() => handleSelectPackage(mod)}
                      className={`w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-sm ${
                        isChamp
                          ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-purple-600 text-black font-black hover:opacity-95 hover:scale-[1.02] active:scale-[0.98]'
                          : mod.isPopular
                          ? 'bg-gradient-to-r from-primary to-emerald-600 text-primary-foreground shadow-primary/25 hover:shadow-lg hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]'
                          : isSingle
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-black hover:scale-[1.02] active:scale-[0.98]'
                          : 'bg-primary hover:bg-primary-hover text-primary-foreground hover:scale-[1.02] active:scale-[0.98]'
                      }`}
                    >
                      <span>{isChamp ? 'Unlock Team Auctions' : isSingle ? 'Get Single Pass' : 'Select Module'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Feature Comparison Accordion / Toggle ───────────────────────── */}
        <div className="mt-16 sm:mt-20">
          <div className="bg-surface/80 backdrop-blur-md rounded-3xl border border-border p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-primary/10 text-primary text-xs font-bold mb-2">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Format & Feature Matrix</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-foreground">
                  Compare Tournament & Organization Formats
                </h3>
                <p className="text-xs sm:text-sm text-text-secondary mt-1">
                  Standard packages include Knockout & League formats. Team Championships with Live Auctions are unlocked via the specialized pass.
                </p>
              </div>

              <button
                onClick={() => setShowComparison(!showComparison)}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-card border border-border hover:border-primary/40 text-xs sm:text-sm font-bold text-foreground transition-all shrink-0"
              >
                <span>{showComparison ? 'Hide Comparison Matrix' : 'View Full Matrix'}</span>
                {showComparison ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {showComparison && (
              <div className="mt-8 overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[760px]">
                  <thead>
                    <tr className="border-b border-border text-xs font-black uppercase tracking-wider text-text-muted">
                      <th className="py-4 px-4">Core Capability</th>
                      <th className="py-4 px-4 text-center">Single Tournament</th>
                      <th className="py-4 px-4 text-center">Monthly Pro Organizer</th>
                      <th className="py-4 px-4 text-center text-amber-500">👑 Team Championship</th>
                      <th className="py-4 px-4 text-center">Academy Hub</th>
                      <th className="py-4 px-4 text-center">Club Management</th>
                      <th className="py-4 px-4 text-center">Court Provider</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-xs">
                    {[
                      { name: 'Tournament Events Allowed', single: '1 Event', org: 'Unlimited / Mo', champ: '1 Mega Event', acad: 'Internal', club: 'Internal', court: '—' },
                      { name: 'Knockout Fixtures & Draws', single: true, org: true, champ: true, acad: false, club: true, court: false },
                      { name: 'League / Round-Robin Pools', single: true, org: true, champ: true, acad: false, club: true, court: false },
                      { name: 'Live Player Auction & Bidding Console', single: false, org: false, champ: true, acad: false, club: false, court: false },
                      { name: 'Franchise Team Purse & Squad Budget', single: false, org: false, champ: true, acad: false, club: false, court: false },
                      { name: 'Team-vs-Team Multi-Match Tie Lineups', single: false, org: false, champ: true, acad: false, club: false, court: false },
                      { name: 'YouTube Live Score Overlay', single: true, org: true, champ: true, acad: false, club: false, court: false },
                      { name: 'Digital Umpire Console & Scoring', single: true, org: true, champ: true, acad: true, club: true, court: false },
                      { name: 'Student Roster & Skill Tracking', single: false, org: false, champ: false, acad: true, club: false, court: false },
                      { name: 'Automated Monthly Invoicing', single: false, org: false, champ: false, acad: true, club: true, court: true },
                      { name: 'Dynamic Turf & Slot Booking', single: false, org: false, champ: false, acad: false, club: true, court: true },
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-surface-hover/50 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-foreground">{row.name}</td>
                        <td className="py-3.5 px-4 text-center">
                          {typeof row.single === 'boolean' ? (
                            row.single ? <Check className="w-4 h-4 text-primary mx-auto" /> : <span className="text-text-muted/40 font-bold">—</span>
                          ) : (
                            <span className="font-bold text-cyan-500">{row.single}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {typeof row.org === 'boolean' ? (
                            row.org ? <Check className="w-4 h-4 text-primary mx-auto" /> : <span className="text-text-muted/40 font-bold">—</span>
                          ) : (
                            <span className="font-bold text-emerald-500">{row.org}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center bg-amber-500/5">
                          {typeof row.champ === 'boolean' ? (
                            row.champ ? <Check className="w-4 h-4 text-amber-500 mx-auto" /> : <span className="text-text-muted/40 font-bold">—</span>
                          ) : (
                            <span className="font-black text-amber-500">{row.champ}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {typeof row.acad === 'boolean' ? (
                            row.acad ? <Check className="w-4 h-4 text-primary mx-auto" /> : <span className="text-text-muted/40 font-bold">—</span>
                          ) : (
                            <span className="font-bold text-blue-500">{row.acad}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {typeof row.club === 'boolean' ? (
                            row.club ? <Check className="w-4 h-4 text-primary mx-auto" /> : <span className="text-text-muted/40 font-bold">—</span>
                          ) : (
                            <span className="font-bold text-purple-500">{row.club}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {typeof row.court === 'boolean' ? (
                            row.court ? <Check className="w-4 h-4 text-primary mx-auto" /> : <span className="text-text-muted/40 font-bold">—</span>
                          ) : (
                            <span className="font-bold text-rose-500">{row.court}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* ── Enterprise Custom Inquiries Banner ──────────────────────────── */}
        <div className="mt-12 sm:mt-16 rounded-3xl bg-gradient-to-r from-surface via-card to-surface border border-primary/20 p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-primary/10 text-primary text-xs font-black uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" />
              <span>State & National Federations</span>
            </div>
            <h3 className="text-xl sm:text-3xl font-black text-foreground">
              Need Multi-Venue or White-Label Solutions?
            </h3>
            <p className="text-xs sm:text-sm text-text-secondary max-w-xl">
              We provide custom federated software, state-level points tables, dedicated server nodes, and white-label mobile applications.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
            <a
              href="mailto:contact@athlon.sport"
              className="w-full sm:w-auto px-6 py-3.5 bg-foreground text-background hover:opacity-90 font-black rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Talk to Enterprise</span>
            </a>
          </div>
        </div>

        {/* ── FAQ Section ─────────────────────────────────────────────────── */}
        <div className="mt-16 sm:mt-20 max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h3 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              Frequently Asked Questions
            </h3>
            <p className="text-xs sm:text-sm text-text-secondary mt-1">
              Everything you need to know about Athlon tournament formats, live auctions, and organization tiers.
            </p>
          </div>

          <div className="space-y-3">
            {FAQ_ITEMS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-surface border border-border overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left font-bold text-sm sm:text-base text-foreground hover:text-primary transition-colors"
                  >
                    <span>{faq.question}</span>
                    <div className="p-1 rounded-lg bg-card border border-border shrink-0">
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-primary" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-text-muted" />
                      )}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-text-secondary leading-relaxed border-t border-border/40 pt-3">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
