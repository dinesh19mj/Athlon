'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  MapPin,
  Check,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Zap,
  Calendar,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Star,
  Flame,
  Layers,
  Crown,
  Trophy,
  GraduationCap,
  Users,
  Search,
  BadgeCheck,
  HelpCircle,
  PhoneCall,
  CheckCircle2,
  Lock,
  ArrowUpRight,
  SlidersHorizontal,
  Ticket,
  Clock,
  IndianRupee,
  Shield,
  Tag,
  Activity,
  Sliders,
  ChevronRight,
  CheckSquare,
  UserCheck,
  Gavel,
  Radio,
  Eye,
  Home,
  Headphones,
  AlertCircle,
  X
} from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useWorkspaceStore, Organization } from '@/lib/store/useWorkspaceStore';
import { useOrgModulesStore } from '@/lib/store/useOrgModulesStore';
import { OrganizationModuleConfig } from '@/lib/api/organizationModule';
import { SubscriptionService, VenueSubscriptionPlan } from '@/lib/api/subscription';
import { OrganizerSubscriptionService, TournamentSubscriptionPlan } from '@/lib/api/organizerSubscription';
import { AcademySubscriptionService, AcademySubscriptionPlan } from '@/lib/api/academySubscription';
import { ClubSubscriptionService, ClubSubscriptionPlan } from '@/lib/api/clubSubscription';
import { CoachSubscriptionService, CoachSubscriptionPlan } from '@/lib/api/coachSubscription';
import { CommunitySubscriptionService, CommunitySubscriptionPlan } from '@/lib/api/communitySubscription';

export type BillingCycle = 'monthly' | 'yearly';
export type OrgCategory = 'COURT' | 'ORGANIZER' | 'ACADEMY' | 'CLUB' | 'COACH' | 'COMMUNITY' | (string & {});

const ICON_MAP: Record<string, any> = {
  Building2,
  MapPin,
  Trophy,
  GraduationCap,
  Users,
  Zap,
  Shield,
  Layers,
  Crown,
  Ticket,
  UserCheck,
  Activity,
  Sliders,
};

const DEFAULT_CATEGORIES: { id: OrgCategory; label: string; icon: any; count: string }[] = [
  { id: 'COURT', label: 'Venues & Turfs', icon: Building2, count: '5 Tiers' },
  { id: 'ORGANIZER', label: 'Tournaments', icon: Trophy, count: '5 Tiers' },
  { id: 'ACADEMY', label: 'Academies', icon: GraduationCap, count: '5 Tiers' },
  { id: 'CLUB', label: 'Clubs & Teams', icon: Users, count: 'Free Trial' },
  { id: 'COACH', label: 'Coaches', icon: Zap, count: 'Free Trial' },
  { id: 'COMMUNITY', label: 'Community', icon: Shield, count: 'Free' },
];

// Generic Plan Model for multi-organization support
export interface GenericPlan {
  id: string;
  name: string;
  badge?: string;
  subtitle: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  isSingleEvent?: boolean;
  isPopular?: boolean;
  commissionRate?: number;
  quotas: { label: string; value: string }[];
  highlightFeatures: string[];
  disabledFeatures?: string[];
  theme: {
    border: string;
    gradient: string;
    accent: string;
    badgeBg: string;
    badgeText: string;
  };
}

// Feature Label Maps for Dynamic Features Translation
const VENUE_FEATURE_LABELS: Record<string, string> = {
  VENUE_FACILITY_MANAGEMENT: 'Bookable Facility & Court Management',
  VENUE_DYNAMIC_PRICING: 'Dynamic Peak & Weekend Pricing Rules',
  VENUE_RECURRING_BOOKINGS: 'Recurring Academy Batch Reservations',
  VENUE_ADVANCED_CRM: 'Customer CRM & VIP Spend Tracking',
  VENUE_MEMBERSHIPS: 'Prepaid Play Passes & Membership Wallets',
  VENUE_PREPAID_PACKAGES: 'Prepaid Court Packages & Bundles',
  VENUE_COUPONS: 'Promotional Discount Coupons & Promo Codes',
  VENUE_LOYALTY: 'Player Loyalty Rewards & Cashbacks',
  VENUE_QR_CHECKIN: 'Contactless QR Player Check-in & Gate Pass',
  VENUE_POS: 'POS Billing & Pro-Shop Counter Sales',
  VENUE_EQUIPMENT_RENTAL: 'Equipment Rentals & Return Tracking',
  VENUE_INVENTORY: 'Stock Movement & Inventory Tracking',
  VENUE_ADVANCED_INVENTORY: 'Multi-Location Inter-Branch Inventory',
  VENUE_EXPENSES: 'Expense Ledgers & P&L Statements',
  VENUE_ADVANCED_ANALYTICS: 'Revenue Forecasting & Utilization Heatmaps',
  VENUE_STAFF_ATTENDANCE: 'Staff Shift Schedules & Attendance',
  VENUE_PAYROLL: 'Staff Payroll Calculation & Commission',
  VENUE_ASSET_MANAGEMENT: 'Court Maintenance Blocks & Asset Logs',
  VENUE_CLEANING: 'Automated Cleaning Shift Rosters',
  VENUE_MULTI_BRANCH: 'Multi-Branch Unified Switcher',
  VENUE_API_ACCESS: 'Direct API Webhooks & Financial Sync',
};

const TOURNAMENT_FEATURE_LABELS: Record<string, string> = {
  BASIC_SETUP: 'Basic Tournament Structure & Categories',
  ONLINE_REGISTRATION: 'Online Registration & UPI Payment Verification',
  PAYMENT_VERIFICATION: 'Automated Payment Verification Desk',
  DOUBLES_PARTNER_LINKING: 'Doubles Partner Linking & Automated Draws',
  KNOCKOUT_AND_LEAGUE_DRAWS: 'Single Knockout & Round-Robin Draws',
  POOLED_KNOCKOUT: 'Pooled Knockout & Multi-Stage Draws',
  ADVANCED_DRAWS: 'Advanced Double-Elimination & Compass Draws',
  BASIC_AUTO_SCHEDULING: 'Automated Match Scheduling Engine',
  ADVANCED_SCHEDULING: 'Intelligent Court Scheduling & Conflict Detection',
  REST_INTERVAL_ENFORCEMENT: 'Mandatory Rest Interval Enforcement',
  ADVANCED_SEEDING: 'Advanced Seeding Matrix & Player Ratings',
  LIVE_SCORING: 'Digital Umpire Console for Real-Time Scoring',
  BASIC_OBS_OVERLAYS: 'Live Scoring & Basic 1080p OBS Broadcast Overlays',
  ADVANCED_BROADCAST_OVERLAYS: 'Dynamic OBS Broadcast Stream Overlays & Sponsor Ads',
  BASIC_FINANCIAL_REPORTING: 'Financial Reporting & Official PDF Certificates',
  ADVANCED_FINANCIAL_REPORTING: 'Advanced Financial Ledgers & Cash Flow Reports',
  TOURNAMENT_CERTIFICATES: 'Official PDF Certificates & Badges',
  SPONSOR_PLACEMENTS: 'Sponsor Placements on Public Pages',
  SPONSOR_ROTATION: 'Dynamic Multi-Sponsor Banner Rotation',
  TOURNAMENT_INVENTORY: 'Tournament Equipment & Shuttle Stock Tracking',
  ADVANCED_PERMISSIONS: 'Staff Roles & Permission Matrix',
  TEAM_CHAMPIONSHIP: 'Team Championship Multi-Match Ties',
  AUCTION_PLAYER_REGISTRATION: 'Automated Auction Player Registration',
  FULL_AUCTION: 'Full Auction Mode Support',
  PARTIAL_AUCTION: 'Partial Auction Mode Support',
  NO_AUCTION: 'Standard Non-Auction Mode Support',
  FRANCHISE_SQUAD_MANAGEMENT: 'Franchise Owner Purse & Squad Management',
  LIVE_AUCTION_ELIGIBLE: 'Live Auction Eligible (Activation Pass Available)',
  LIVE_AUCTION_ACTIVATION: 'Real-Time Live Player Auction & Bidding Console',
  TIE_RUBBER_SCORING: 'Rubber Tie Scoring Matrix',
  ADVANCED_ORGANIZER_ERP: 'Complete Organizer ERP & Stock Movement',
  CROSS_VENUE_COORDINATION: 'Cross-Venue Coordination & Master Timetables',
};

const ACADEMY_FEATURE_LABELS: Record<string, string> = {
  ACADEMY_BASIC_ROSTER: 'Active Trainee Roster Management',
  ACADEMY_ATTENDANCE: 'Daily Student Attendance Register',
  ACADEMY_FEE_TRACKING: 'Offline & Online Fee Collection Ledger',
  ACADEMY_DIGITAL_ID: 'Student Digital Identity Cards & QR Pass',
  ACADEMY_FEE_REMINDERS: 'Automated Monthly Fee WhatsApp Reminders',
  ACADEMY_PARENT_NOTICES: 'Parent Notice Broadcasts & SMS Updates',
  ACADEMY_SKILL_ASSESSMENT: 'Custom Fitness, Agility & Skill Benchmarks',
  ACADEMY_INTERNAL_MATCHES: 'Internal Practice Match Setup & Leaderboard',
  ACADEMY_MULTI_CENTRE: 'Multi-Campus Branch Switcher & Multi-Centre Sync',
  ACADEMY_EQUIPMENT_INVENTORY: 'Equipment & Training Gear Inventory',
  ACADEMY_COACH_PAYROLL: 'Coach Payroll Calculation & Session Shift Logs',
  ACADEMY_ONLINE_ADMISSIONS: 'Online Student Admissions & Registration Forms',
  ACADEMY_PERFORMANCE_ANALYTICS: 'Coach Video Review & Performance Feedback Notes',
  ACADEMY_DIRECT_DEBIT: 'Automated UPI Fee Payment Collection Links',
  ACADEMY_TRANSFER_LOGS: 'Trainee Inter-Campus Transfers & Historical Logs',
  ACADEMY_WHITE_LABEL: 'White-Label Custom Trainee / Parent Mobile App',
};

const CLUB_FEATURE_LABELS: Record<string, string> = {
  CLUB_BATCH_MANAGEMENT: 'Court Batch & Slot Scheduling Calendar',
  CLUB_ATTENDANCE: 'Member RSVP & Live Check-in Attendance',
  CLUB_FEE_TRACKING: 'Member Fee Dues & Collection Tracking',
  CLUB_EXPENSE_KITTY: 'Shared Kitty & Expense Splitter',
  CLUB_LEADERBOARD: 'Intra-Club Match Scoring & Leaderboard',
  CLUB_MATCH_SCORING: 'Live Game Scoring & Head-to-Head Stats',
  CLUB_INVENTORY: 'Shuttlecock & Equipment Inventory Tracking',
};

const COACH_FEATURE_LABELS: Record<string, string> = {
  COACH_CALENDAR: 'Personal Coaching Calendar & Slot Booking',
  COACH_ATTENDANCE: 'Trainee Daily Check-in & Session Attendance',
  COACH_FEE_TRACKING: 'Rate Cards & Direct Digital UPI Receipts',
  COACH_PROFILE: 'Coach Public Profile & Discovery Showcase',
  COACH_DRILL_CARDS: 'Trainee Drill Cards & Progress Reports',
  COACH_AUTO_REMINDERS: 'Automated Monthly Fee WhatsApp Reminders',
  COACH_VERIFIED_BADGE: 'Verified Coach Badge & Priority Search',
  COACH_VIDEO_ANALYSIS: 'Trainee Video Review & Performance Feedback',
};

const COMMUNITY_FEATURE_LABELS: Record<string, string> = {
  COMMUNITY_SESSIONS: 'Weekly Pickup Sessions & RSVP Queue',
  COMMUNITY_RSVP: 'Member RSVPs, Guest Counts & Check-in',
  COMMUNITY_FEED: 'Interactive Social Feed, Posts & Photos',
  COMMUNITY_POLLS: 'Member Polls & Group Decision Voting',
  COMMUNITY_EXPENSE_KITTY: 'Shared Kitty & Expense Splitter',
  COMMUNITY_LEADERBOARD: 'Friendly Match Scoring & ELO Leaderboard',
  COMMUNITY_MATCH_SCORING: 'Match Result Records & Head-to-Head Stats',
  COMMUNITY_AUTO_ALERTS: 'WhatsApp Session Alerts & Reminders',
};

// Standalone Add-on: Live Player Auction Activation Pass
const AUCTION_PASS_PLAN: GenericPlan = {
  id: 'AUCTION_PASS',
  name: 'Live Auction',
  badge: '⚡ ADD-ON • ₹499',
  isSingleEvent: true,
  subtitle: 'Real-Time Player Auction Console',
  description: 'Unlock live player bidding console for 1 tournament. Unlimited rounds, pause/resume free, multi-session free.',
  monthlyPrice: 499,
  yearlyPrice: 499,
  quotas: [
    { label: 'Event', value: '1 Tournament' },
    { label: 'Bidding', value: 'Real-Time Console' },
    { label: 'Purse', value: 'Franchise Wallets' },
  ],
  highlightFeatures: [
    'Real-Time Live Player Bidding & Calling Console',
    'Franchise Owner Purse Balances & Bid Increments',
    'Category-wise Player Pools & Sold/Unsold State',
    'Squad Limits & Automated Team Roster Assignment',
    'Pausing, Resuming & Multi-Day Sessions Cost ₹0 Extra',
    'YouTube Live Auction Graphics & Player Profile Overlays',
  ],
  disabledFeatures: [],
  theme: {
    border: 'border-amber-500/40 dark:border-amber-500/50 shadow-amber-500/15 ring-1 ring-amber-500/30',
    gradient: 'from-amber-500/[0.10] via-card to-card dark:from-amber-950/50 dark:via-slate-900 dark:to-slate-950',
    accent: 'text-amber-600 dark:text-amber-400',
    badgeBg: 'bg-amber-500/20 border border-amber-500/40',
    badgeText: 'text-amber-700 dark:text-amber-300 font-bold',
  },
};

// 4. Sports Club Plans (Single Plan: 30-Day Free Trial + ₹249/mo)
const CLUB_PLANS: GenericPlan[] = [
  {
    id: 'CLUB_ACCESS_PASS',
    name: 'Club Batch Pass',
    badge: '30 DAYS FREE TRIAL',
    isPopular: true,
    subtitle: 'Court Batch & Member Operations Pass',
    description: 'First 30 days free, then ₹249/month. Monitor court batches, player attendance, expenses, fees & leaderboards.',
    monthlyPrice: 249,
    yearlyPrice: 2490,
    quotas: [
      { label: 'Members', value: 'Up to 100 Players' },
      { label: 'Managers', value: '3 Admins' },
      { label: 'Free Trial', value: '30 Days Included' },
    ],
    highlightFeatures: [
      '30-Day All-Inclusive Free Trial (No Upfront Payment)',
      'Court Batch Slot Scheduling & Visual Calendar',
      'Member RSVP & Live Check-in Attendance',
      'Shared Kitty & Expense Splitter',
      'Member Fee Dues & Collection Tracking',
      'Intra-Club Match Scoring & ELO Leaderboard',
      'Shuttlecock & Equipment Inventory Tracking',
    ],
    disabledFeatures: [],
    theme: {
      border: 'border-emerald-500/50 dark:border-emerald-500/70 shadow-emerald-500/15 ring-1 ring-emerald-500/30',
      gradient: 'from-emerald-500/[0.1] via-card to-card dark:from-emerald-950/70 dark:via-slate-900 dark:to-slate-950',
      accent: 'text-emerald-600 dark:text-emerald-400',
      badgeBg: 'bg-gradient-to-r from-emerald-500 to-teal-400',
      badgeText: 'text-slate-950 font-black',
    },
  },
];

// 5. Coach Plans (2 Tiers: Starter with 30D Free Trial then ₹299/mo, and Pro ₹499/mo)
const COACH_PLANS: GenericPlan[] = [
  {
    id: 'COACH_STARTER',
    name: 'Starter',
    badge: '30-DAY FREE TRIAL',
    subtitle: 'Solo Coaches & Personal Trainers',
    description: 'Manage personal coaching calendar, slot bookings, student roster & cash/digital fee logging. First 30 days free, then ₹299/month.',
    monthlyPrice: 299,
    yearlyPrice: 2990,
    quotas: [
      { label: 'Trainees', value: '15 Max' },
      { label: 'Packages', value: '3 Rate Cards' },
      { label: 'Free Trial', value: '30 Days' },
    ],
    highlightFeatures: [
      'First 30 Days 100% Free Trial',
      'Up to 15 Active Trainees with Profiles',
      'Personal Coaching Calendar & Slot Scheduling',
      'Daily Check-in & Session Attendance',
      'Up to 3 Coaching Fee Packages & Rate Cards',
      'Cash & Digital UPI Payment Receipts',
      'Coach Public Discovery Profile',
    ],
    disabledFeatures: [
      'Trainee Drill Cards & Progress Reports',
      'Automated Monthly Fee WhatsApp Reminders',
      'Verified Coach Badge & Priority Placement',
    ],
    theme: {
      border: 'border-amber-500/40 dark:border-amber-500/50',
      gradient: 'from-amber-500/[0.08] via-card to-card dark:from-amber-950/40 dark:via-slate-900 dark:to-slate-950',
      accent: 'text-amber-600 dark:text-amber-400',
      badgeBg: 'bg-amber-500/15 border border-amber-500/30',
      badgeText: 'text-amber-700 dark:text-amber-300 font-bold',
    },
  },
  {
    id: 'COACH_PRO',
    name: 'Professional',
    badge: '👑 MOST POPULAR',
    isPopular: true,
    subtitle: 'Competitive & High-Volume Trainers',
    description: 'Up to 50 trainees, trainee drill cards, fitness test benchmarks, automated fee payment reminders & verified discovery badge.',
    monthlyPrice: 499,
    yearlyPrice: 4990,
    quotas: [
      { label: 'Trainees', value: '50 Max' },
      { label: 'Packages', value: 'Unlimited' },
      { label: 'Profile', value: 'Verified Badge' },
    ],
    highlightFeatures: [
      'Up to 50 Active Trainees with Full Roster',
      'Unlimited 1-on-1 & Small Group Booking Slots',
      'Trainee Drill Cards & Fitness Test Benchmarks',
      'Automated Monthly Fee WhatsApp Reminders',
      'Unlimited Coaching Rate Cards & Packages',
      'Trainee Video Review & Performance Feedback',
      'Verified Coach Badge on Athlon Marketplace',
    ],
    disabledFeatures: [],
    theme: {
      border: 'border-orange-500/50 dark:border-orange-500/70 shadow-orange-500/15 ring-1 ring-orange-500/30',
      gradient: 'from-orange-500/[0.1] via-card to-card dark:from-orange-950/70 dark:via-slate-900 dark:to-slate-950',
      accent: 'text-orange-600 dark:text-orange-400',
      badgeBg: 'bg-gradient-to-r from-amber-500 to-orange-500',
      badgeText: 'text-slate-950 font-black',
    },
  },
];

// 6. Community Plans (2 Tiers: Free ₹0 up to 50 members, Pro ₹199/mo or ₹1,990/yr up to 250 members)
const COMMUNITY_PLANS: GenericPlan[] = [
  {
    id: 'COMMUNITY_FREE',
    name: 'Free',
    badge: 'FOREVER FREE',
    subtitle: 'Social Groups & Apartment Societies',
    description: '₹0 forever free for up to 50 active members. Organize unlimited pickup sessions, RSVP check-ins, social announcements, photos, and polls.',
    monthlyPrice: 0,
    yearlyPrice: 0,
    quotas: [
      { label: 'Members', value: '50 Members' },
      { label: 'Admins', value: '2 Coordinators' },
      { label: 'Sessions', value: 'Unlimited RSVPs' },
    ],
    highlightFeatures: [
      '₹0 Forever Free (No Credit Card or Expiry)',
      'Up to 50 Active Community Members Roster',
      'Unlimited Pickup Games & Social Play Sessions',
      'Real-Time RSVP & Interactive Check-in Tracking',
      'Community Feed, Pinned Notices & Photo Gallery',
      'Interactive Member Polls & Vote Counters',
      '2 Community Admins & Event Coordinators',
    ],
    disabledFeatures: [
      'Shared Kitty & Treasury Expense Splitter',
      'Friendly Match Scoring & Live Leaderboard',
      'Automated WhatsApp Event Broadcasts',
      'CSV & Excel Member Data Export',
    ],
    theme: {
      border: 'border-sky-500/40 dark:border-sky-500/50',
      gradient: 'from-sky-500/[0.08] via-card to-card dark:from-sky-950/40 dark:via-slate-900 dark:to-slate-950',
      accent: 'text-sky-600 dark:text-sky-400',
      badgeBg: 'bg-sky-500/15 border border-sky-500/30',
      badgeText: 'text-sky-700 dark:text-sky-300 font-bold',
    },
  },
  {
    id: 'COMMUNITY_PRO',
    name: 'Pro',
    badge: '👑 MOST POPULAR',
    isPopular: true,
    subtitle: 'Active Sports Clubs & Growing Societies',
    description: 'Up to 250 members, shared kitty & expense splitter, friendly match scoreboards, leaderboards, WhatsApp alerts, and 5 coordinators.',
    monthlyPrice: 199,
    yearlyPrice: 1990,
    quotas: [
      { label: 'Members', value: '250 Members' },
      { label: 'Admins', value: '5 Coordinators' },
      { label: 'Kitty', value: 'Expense Splitter' },
    ],
    highlightFeatures: [
      'Up to 250 Active Community Members Roster',
      'Shared Expense Kitty & Treasury Splitter',
      'Friendly Match Scoring & Live Season Leaderboard',
      'Automated WhatsApp Event Reminder Broadcasts',
      'Up to 5 Community Coordinators & Admins',
      'Member Attendance History & Activity Analytics',
      'CSV / Excel Member & Treasury Roster Export',
      'Priority Community Discovery & Verified Badge',
    ],
    disabledFeatures: [],
    theme: {
      border: 'border-blue-500/50 dark:border-blue-500/70 shadow-blue-500/15 ring-1 ring-blue-500/30',
      gradient: 'from-blue-500/[0.1] via-card to-card dark:from-blue-950/70 dark:via-slate-900 dark:to-slate-950',
      accent: 'text-blue-600 dark:text-blue-400',
      badgeBg: 'bg-gradient-to-r from-sky-500 to-blue-600',
      badgeText: 'text-white font-black',
    },
  },
];

const VENUE_FAQS = [
  {
    question: "How are facility & court limits calculated?",
    answer: "Facility limits represent bookable physical resources (courts, turfs, pitches, swimming pools, nets) managed in your venue. For example, a 6-badminton-court hall requires a plan with at least 6 facilities (Starter allows up to 3, Professional allows up to 10)."
  },
  {
    question: "Do staff limits include the venue owner?",
    answer: "Yes, the staff limit includes the owner and all invited team accounts (Facility Admins, Front Desk / Receptionists, Court Supervisors, and Accounts Managers)."
  },
  {
    question: "How do marketplace commissions work?",
    answer: "Athlon charges a marketplace commission only on online bookings received from the public Athlon consumer app. Direct walk-in desk bookings, offline reservations, and cash payments have 0% platform fee. Higher plans enjoy lower marketplace commissions (down to 2%)."
  },
  {
    question: "Can I upgrade or switch from monthly to annual billing anytime?",
    answer: "Yes, you can upgrade your plan or switch between monthly and annual billing at any time from your Venue Subscription dashboard. Switching to annual saves approximately 20% (equal to 2 months free per year)."
  },
  {
    question: "How do prepaid play passes and memberships work in the Professional plan?",
    answer: "The Professional and Business plans unlock the Memberships engine. You can create 10-hour, 25-hour, or monthly prepaid passes, assign them to frequent players, and deduct hours during walk-in court check-ins."
  }
];

const TOURNAMENT_FAQS = [
  {
    question: "How do tournament publication credits work?",
    answer: "Each tournament publication credit allows you to publish and organize 1 complete tournament event (valid for 12 months from purchase). Credits are reserved and deducted upon public tournament publication."
  },
  {
    question: "How does the Live Auction Activation add-on work?",
    answer: "The Live Auction Activation (₹499) unlocks the real-time franchise bidding floor and player auction console for your tournament. Pausing, resuming, and multi-session auctions carry ₹0 additional charge."
  },
  {
    question: "What is the difference between Professional and Business packages?",
    answer: "Professional includes 5 tournament credits (eligible for auction add-ons), while Business includes 15 tournament credits plus 2 free live auction activations and complete inventory/ERP management."
  },
  {
    question: "Can I run Team Championships with multi-match rubber ties?",
    answer: "Yes, Professional and Business tiers support Team Championships with custom match orders (e.g. 2 Singles + 1 Doubles), team franchise squads, and aggregate tie scoring."
  }
];

const ACADEMY_FAQS = [
  {
    question: "How are student / trainee capacity limits calculated?",
    answer: "Student limits apply to actively enrolled trainees across your academy batches. Inactive, graduated, or paused student profiles do not consume your capacity quota."
  },
  {
    question: "What happens if we reach our student limit during mid-term admissions?",
    answer: "Existing enrolled students, daily attendance marking, and scheduled batches are never blocked or interrupted. To enroll additional new students, you can either upgrade your plan tier or add a +50 student capacity booster add-on."
  },
  {
    question: "Do coach staff accounts have individual mobile access?",
    answer: "Yes, coach logins provide dedicated staff portals to mark batch attendance, record fitness benchmark scores, and add player evaluation notes directly from their mobile phones."
  },
  {
    question: "How does the multi-campus branch switcher work in Professional and Elite plans?",
    answer: "Academy administrators can switch between campuses seamlessly with one click, manage location-specific batches and fee structures, and view consolidated financial performance."
  },
  {
    question: "Can parents view their child's attendance and pay fees online?",
    answer: "Yes, parents receive automated WhatsApp payment links and can view attendance calendars and coach evaluation notes through the Athlon student portal."
  }
];

const CLUB_FAQS = [
  {
    question: "How does the 30-day free trial work for Clubs?",
    answer: "Every newly created Club workspace immediately receives a 30-day all-inclusive free trial with full access to court batch scheduling, member attendance, fee tracking, expense kitty, and match leaderboards. No credit card or upfront payment is required."
  },
  {
    question: "What happens when the 30-day free trial ends?",
    answer: "After 30 days, clubs can subscribe to the all-inclusive Club Access Pass for only ₹249/month (or ₹2,490/year) to continue managing batches, adding members, and tracking treasury expenses."
  },
  {
    question: "How many members and batch managers are included in the Club plan?",
    answer: "The Club Access Pass supports up to 100 club members and 3 batch admins / captains, which easily accommodates standard weekly court batch communities and recreational clubs."
  },
  {
    question: "Can members view their attendance and shared kitty balance?",
    answer: "Yes, club members can check their attendance record, view upcoming court batch slots, log RSVPs, and see transparent expense breakdowns and leaderboard rankings in the Athlon club portal."
  }
];

const COACH_FAQS = [
  {
    question: "How does the Coach Starter 30-day free trial work?",
    answer: "Every newly registered Coach workspace receives 30 days of full free access to the Coach Starter tier. You can schedule sessions, enrol up to 15 trainees, and manage rate cards. From the second month onwards, you can continue for ₹299/month."
  },
  {
    question: "What is the difference between Coach Starter and Coach Professional?",
    answer: "Coach Starter (₹299/mo) supports up to 15 trainees and basic session scheduling. Coach Professional (₹499/mo) expands capacity to 50 trainees, adds customizable drill cards, fitness benchmarks, automated WhatsApp fee payment reminders, and the Verified Coach badge on Athlon."
  },
  {
    question: "How are active trainee limits counted?",
    answer: "Only currently enrolled, active trainee clients count toward your quota. Inactive, past, or graduated student profiles do not consume your capacity."
  },
  {
    question: "Can parents and trainees book 1-on-1 slots directly?",
    answer: "Yes, coaches can share their personalized Athlon booking link, allowing trainees or parents to select available coaching slots and confirm sessions seamlessly."
  }
];

const COMMUNITY_FAQS = [
  {
    question: "Is Community Free really ₹0 forever?",
    answer: "Yes, Community Free is 100% free forever for up to 50 active members. You can host unlimited pickup sessions, track RSVPs, post announcements, run polls, and share photos with no expiry date and no credit card required."
  },
  {
    question: "When should we upgrade to Community Pro?",
    answer: "When your community grows beyond 50 members (up to 250), or when you want to track shared expenses and kitty dues, record friendly match results with live leaderboards, and send automated WhatsApp event broadcasts, Community Pro gives you all these tools for just ₹199/month (or ₹1,990/year)."
  },
  {
    question: "How is the member capacity limit counted?",
    answer: "Only active members currently part of your community roster count towards your limit. Inactive or removed members do not consume member slots."
  },
  {
    question: "How does the Shared Kitty & Expense Splitter work in Community Pro?",
    answer: "Coordinators can log court booking charges, shuttlecock purchases, or refreshments into the community treasury. Athlon automatically calculates per-member contributions and tracks settlement statuses transparently."
  },
  {
    question: "Can multiple coordinators manage sessions and announcements?",
    answer: "Yes, Community Free supports up to 2 coordinators, while Community Pro supports up to 5 coordinators with dedicated event scheduling and attendance moderation permissions."
  }
];

function getPlanTheme(planCode: string, name: string) {
  const code = (planCode || name || '').toUpperCase();
  if (code.includes('FREE')) {
    return {
      border: 'border-border',
      gradient: 'from-card via-surface/60 to-surface/80 dark:from-slate-900/90 dark:to-slate-950',
      accent: 'text-foreground',
      badgeBg: 'bg-surface border border-border',
      badgeText: 'text-foreground font-bold',
    };
  }
  if (code.includes('STARTER')) {
    return {
      border: 'border-cyan-500/40 dark:border-cyan-500/50',
      gradient: 'from-cyan-500/[0.08] via-card to-card dark:from-cyan-950/40 dark:via-slate-900 dark:to-slate-950',
      accent: 'text-cyan-600 dark:text-cyan-400',
      badgeBg: 'bg-cyan-500/15 border border-cyan-500/30',
      badgeText: 'text-cyan-700 dark:text-cyan-300 font-bold',
    };
  }
  if (code.includes('PRO') || code.includes('PROFESSIONAL')) {
    return {
      border: 'border-indigo-500/50 dark:border-indigo-500/70 shadow-indigo-500/15 ring-1 ring-indigo-500/30',
      gradient: 'from-indigo-500/[0.1] via-card to-card dark:from-indigo-950/70 dark:via-slate-900 dark:to-slate-950',
      accent: 'text-indigo-600 dark:text-indigo-400',
      badgeBg: 'bg-gradient-to-r from-indigo-500 to-emerald-400',
      badgeText: 'text-slate-950 font-black',
    };
  }
  if (code.includes('BUSINESS') || code.includes('ELITE')) {
    return {
      border: 'border-emerald-500/40 dark:border-emerald-500/60 shadow-emerald-500/10',
      gradient: 'from-emerald-500/[0.08] via-card to-card dark:from-emerald-950/50 dark:via-slate-900 dark:to-slate-950',
      accent: 'text-emerald-600 dark:text-emerald-400',
      badgeBg: 'bg-emerald-500/15 border border-emerald-500/30',
      badgeText: 'text-emerald-700 dark:text-emerald-300 font-bold',
    };
  }
  if (code.includes('ENTERPRISE')) {
    return {
      border: 'border-purple-500/40 dark:border-purple-500/60 shadow-purple-500/10',
      gradient: 'from-purple-500/[0.08] via-card to-card dark:from-purple-950/50 dark:via-slate-900 dark:to-slate-950',
      accent: 'text-purple-600 dark:text-purple-400',
      badgeBg: 'bg-purple-500/15 border border-purple-500/30',
      badgeText: 'text-purple-700 dark:text-purple-300 font-bold',
    };
  }
  return {
    border: 'border-amber-500/40 dark:border-amber-500/50 shadow-amber-500/15 ring-1 ring-amber-500/30',
    gradient: 'from-amber-500/[0.10] via-card to-card dark:from-amber-950/50 dark:via-slate-900 dark:to-slate-950',
    accent: 'text-amber-600 dark:text-amber-400',
    badgeBg: 'bg-amber-500/20 border border-amber-500/40',
    badgeText: 'text-amber-700 dark:text-amber-300 font-bold',
  };
}

function mapVenuePlanToGeneric(p: VenueSubscriptionPlan): GenericPlan {
  const code = (p.planCode || '').toUpperCase();
  const isPop = code.includes('PRO');
  const maxFac = p.limits?.MAX_FACILITIES || p.limits?.MAX_COURTS || 1;
  const maxStaff = p.limits?.MAX_STAFF || 1;
  const maxVenues = p.limits?.MAX_VENUES || 1;

  const highlights: string[] = [];
  if (maxFac >= 999) {
    highlights.push('Unlimited Bookable Facilities & Turfs');
  } else {
    highlights.push(`Up to ${maxFac} Bookable Facilit${maxFac > 1 ? 'ies' : 'y'}`);
  }
  highlights.push(`${maxStaff} Staff Login${maxStaff > 1 ? 's' : ''} (incl. Owner)`);
  if (maxVenues > 1) {
    highlights.push(`Multi-Branch Support across ${maxVenues} Venues`);
  }

  if (p.features) {
    Object.entries(p.features).forEach(([featKey, isEnabled]) => {
      if (isEnabled) {
        const label = VENUE_FEATURE_LABELS[featKey] || VENUE_FEATURE_LABELS[`VENUE_${featKey}`];
        if (label && !highlights.includes(label)) {
          highlights.push(label);
        }
      }
    });
  }

  if (highlights.length < 5) {
    highlights.push('Digital Automated Invoices & Receipts');
    highlights.push('Live 15-Minute Visual Calendar');
  }

  const disabled: string[] = [];
  const importantFeatures = [
    'VENUE_DYNAMIC_PRICING',
    'VENUE_RECURRING_BOOKINGS',
    'VENUE_ADVANCED_CRM',
    'VENUE_MEMBERSHIPS',
    'VENUE_POS',
    'VENUE_MULTI_BRANCH',
  ];
  if (p.features) {
    importantFeatures.forEach((featKey) => {
      const isEnabled = p.features[featKey] ?? p.features[featKey.replace('VENUE_', '')];
      if (!isEnabled) {
        const label = VENUE_FEATURE_LABELS[featKey];
        if (label && !disabled.includes(label)) {
          disabled.push(label);
        }
      }
    });
  }

  const badge = code.includes('FREE') ? 'STARTER VENUE' :
    code.includes('STARTER') ? 'SMALL CLUBS' :
      code.includes('PRO') ? '👑 MOST POPULAR' :
        code.includes('BUSINESS') ? '🚀 MULTI-BRANCH' : '💎 STADIUM SLA';

  const subtitle = code.includes('FREE') ? 'Zero Setup Cost for Individual Courts' :
    code.includes('STARTER') ? 'Automated Pricing for Growing Turfs' :
      code.includes('PRO') ? 'Complete ERP, CRM & Prepaid Wallets' :
        code.includes('BUSINESS') ? 'Multi-Location Commercial Complexes' : 'Franchise Chains & Sports Stadiums';

  return {
    id: p.planCode,
    name: p.name.replace(/^Venue\s+/i, ''),
    badge,
    isPopular: isPop,
    subtitle,
    description: p.description,
    monthlyPrice: Number(p.monthlyPrice) || 0,
    yearlyPrice: Number(p.yearlyPrice) || 0,
    commissionRate: Number(p.marketplaceCommissionRate) || 0,
    quotas: [
      { label: 'Courts', value: maxFac >= 999 ? 'Unlimited' : `${maxFac} Unit${maxFac > 1 ? 's' : ''}` },
      { label: 'Staff', value: `${maxStaff} Login${maxStaff > 1 ? 's' : ''}` },
      { label: 'Locations', value: `${maxVenues} Venue${maxVenues > 1 ? 's' : ''}` },
    ],
    highlightFeatures: highlights,
    disabledFeatures: disabled,
    theme: getPlanTheme(p.planCode, p.name),
  };
}

function mapOrganizerPlanToGeneric(p: TournamentSubscriptionPlan): GenericPlan {
  const code = (p.planCode || '').toUpperCase();
  const isPop = code.includes('PRO');
  const maxPart = p.limits?.MAX_PARTICIPANTS || 32;
  const maxCat = p.limits?.MAX_CATEGORIES || 2;
  const maxCourts = p.limits?.MAX_COURTS || 2;
  const credits = p.tournamentCredits || p.limits?.TOURNAMENT_CREDITS || 1;
  const auctions = p.includedAuctionCredits || p.limits?.INCLUDED_AUCTION_CREDITS || 0;

  const highlights: string[] = [];
  if (code.includes('FREE')) {
    highlights.push('1 Free Trial Tournament Publication (30 Days Validity)');
    highlights.push(`Up to ${maxPart} Unique Participants & ${maxCat} Categories`);
    highlights.push('Knockout & Round-Robin Draws');
    highlights.push('Digital Umpire Console for Real-Time Scoring');
    highlights.push('Public Results & Basic Winner Certificates');
  } else {
    highlights.push(`${credits} Tournament Publication Credit${credits > 1 ? 's' : ''} (12 Months Validity)`);
    if (auctions > 0) highlights.push(`${auctions} Free Included Live Auction Activations`);
    highlights.push(`Up to ${maxPart.toLocaleString()} Participants / Event`);
    highlights.push(`Up to ${maxCat} Categories & ${maxCourts} Courts`);
  }

  if (p.features) {
    Object.entries(p.features).forEach(([featKey, isEnabled]) => {
      if (isEnabled) {
        const label = TOURNAMENT_FEATURE_LABELS[featKey] || TOURNAMENT_FEATURE_LABELS[featKey.toUpperCase()];
        if (label && !highlights.includes(label)) {
          highlights.push(label);
        }
      }
    });
  }

  const disabled: string[] = [];
  const importantFeatures = [
    'LIVE_AUCTION_ACTIVATION',
    'ADVANCED_BROADCAST_OVERLAYS',
    'TEAM_CHAMPIONSHIP',
    'ADVANCED_SEEDING',
    'ADVANCED_ORGANIZER_ERP',
  ];
  if (p.features) {
    importantFeatures.forEach((featKey) => {
      const isEnabled = p.features[featKey] ?? p.features[featKey.toLowerCase()];
      if (!isEnabled) {
        const label = TOURNAMENT_FEATURE_LABELS[featKey];
        if (label && !disabled.includes(label)) {
          disabled.push(label);
        }
      }
    });
  }

  const badge = code.includes('FREE') ? '1 TRIAL EVENT' :
    code.includes('STARTER') ? '1 TOURNAMENT CREDIT' :
      code.includes('PRO') ? '👑 5 CREDITS • POPULAR' : '🔥 15 CREDITS + 2 AUCTIONS';

  const subtitle = code.includes('FREE') ? 'Single Tournament Grassroots Trial' :
    code.includes('STARTER') ? 'Single Club / Community Tournament' :
      code.includes('PRO') ? '5 Tournaments + Live Auction Eligible' : '15 Tournaments + 2 Included Live Auctions';

  const quotas = [
    { label: 'Credits', value: `${credits} Event${credits > 1 ? 's' : ''}` },
    { label: 'Players', value: `Max ${maxPart.toLocaleString()}` },
    { label: 'Categories', value: `Up to ${maxCat}` },
  ];
  if (auctions > 0) {
    quotas.push({ label: 'Auctions', value: `${auctions} Included` });
  }

  return {
    id: p.planCode,
    name: p.name.replace(/^Tournament\s+/i, ''),
    badge,
    isPopular: isPop,
    isSingleEvent: true,
    subtitle,
    description: p.description,
    monthlyPrice: Number(p.packagePrice) || 0,
    yearlyPrice: Number(p.packagePrice) || 0,
    quotas,
    highlightFeatures: highlights,
    disabledFeatures: disabled,
    theme: getPlanTheme(p.planCode, p.name),
  };
}

function mapAcademyPlanToGeneric(p: AcademySubscriptionPlan): GenericPlan {
  const code = (p.planCode || '').toUpperCase();
  const isPop = code.includes('PRO');
  const maxStudents = p.maxStudents || p.limits?.MAX_STUDENTS || 15;
  const maxCoaches = p.maxCoaches || p.limits?.MAX_COACHES || 1;
  const maxCentres = p.maxCentres || p.limits?.MAX_CENTRES || 1;

  const highlights: string[] = [];
  if (maxStudents >= 9999) {
    highlights.push('Unlimited Active Trainees & Campuses');
  } else {
    highlights.push(`Up to ${maxStudents} Active Trainees with Digital Profiles`);
  }
  highlights.push(`${maxCoaches >= 999 ? 'Unlimited' : maxCoaches} Coach Staff Account${maxCoaches > 1 ? 's' : ''}`);
  highlights.push(`${maxCentres >= 999 ? 'Unlimited' : maxCentres} Campus Centre${maxCentres > 1 ? 's' : ''}`);

  if (p.features) {
    Object.entries(p.features).forEach(([featKey, isEnabled]) => {
      if (isEnabled) {
        const label = ACADEMY_FEATURE_LABELS[featKey] || ACADEMY_FEATURE_LABELS[featKey.toUpperCase()];
        if (label && !highlights.includes(label)) {
          highlights.push(label);
        }
      }
    });
  }

  if (highlights.length < 5) {
    highlights.push('Daily Student Attendance Registers');
    highlights.push('Offline Cash Fee Collection Ledger');
    highlights.push('Public Academy Discovery Profile');
  }

  const disabled: string[] = [];
  const importantFeatures = [
    'ACADEMY_ONLINE_ADMISSIONS',
    'ACADEMY_FEE_REMINDERS',
    'ACADEMY_MULTI_CENTRE',
    'ACADEMY_COACH_PAYROLL',
    'ACADEMY_PERFORMANCE_ANALYTICS',
  ];
  if (p.features) {
    importantFeatures.forEach((featKey) => {
      const isEnabled = p.features[featKey] ?? p.features[featKey.toLowerCase()];
      if (!isEnabled) {
        const label = ACADEMY_FEATURE_LABELS[featKey];
        if (label && !disabled.includes(label)) {
          disabled.push(label);
        }
      }
    });
  }

  const badge = code.includes('FREE') ? '15 STUDENTS' :
    code.includes('STARTER') ? '60 STUDENTS' :
      code.includes('PRO') ? '👑 250 STUDENTS • POPULAR' :
        code.includes('BUSINESS') ? '🚀 750 STUDENTS • 10 CAMPUSES' : '💎 FRANCHISE CHAIN';

  const subtitle = code.includes('FREE') ? 'Grassroots Coaching & Individual Trainers' :
    code.includes('STARTER') ? 'Growing Badminton & Sports Academies' :
      code.includes('PRO') ? 'Multi-Coach Competitive Training Centers' :
        code.includes('BUSINESS') ? 'Multi-Sport High-Performance Academies' : 'National Chains & Elite Sports Institutes';

  return {
    id: p.planCode,
    name: p.name.replace(/^Academy\s+/i, ''),
    badge,
    isPopular: isPop,
    subtitle,
    description: p.description,
    monthlyPrice: Number(p.monthlyPrice) || 0,
    yearlyPrice: Number(p.yearlyPrice) || 0,
    quotas: [
      { label: 'Students', value: maxStudents >= 9999 ? 'Unlimited' : `Max ${maxStudents}` },
      { label: 'Coaches', value: maxCoaches >= 999 ? 'Unlimited' : `${maxCoaches} Coach${maxCoaches > 1 ? 'es' : ''}` },
      { label: 'Campuses', value: maxCentres >= 999 ? 'Unlimited' : `${maxCentres} Centre${maxCentres > 1 ? 's' : ''}` },
    ],
    highlightFeatures: highlights,
    disabledFeatures: disabled,
    theme: getPlanTheme(p.planCode, p.name),
  };
}

function mapClubPlanToGeneric(p: ClubSubscriptionPlan): GenericPlan {
  const maxMembers = p.maxMembers || p.limits?.MAX_MEMBERS || 100;
  const maxManagers = p.maxManagers || p.limits?.MAX_MANAGERS || 3;
  const trialDays = p.trialDays || p.limits?.TRIAL_DAYS || 30;

  const highlights: string[] = [
    `First ${trialDays} Days 100% Free Trial`,
    `Up to ${maxMembers} Club Members Roster`,
    `${maxManagers} Club Admins / Captain Logins`,
  ];

  if (p.features) {
    Object.entries(p.features).forEach(([featKey, isEnabled]) => {
      if (isEnabled) {
        const label = CLUB_FEATURE_LABELS[featKey] || CLUB_FEATURE_LABELS[featKey.toUpperCase()];
        if (label && !highlights.includes(label)) {
          highlights.push(label);
        }
      }
    });
  }

  if (highlights.length < 6) {
    highlights.push('Court Batch Slot Scheduling & Visual Calendar');
    highlights.push('Member RSVP & Live Check-in Attendance');
    highlights.push('Shared Kitty & Expense Splitter');
    highlights.push('Member Fee Dues & Collection Tracking');
    highlights.push('Intra-Club Match Scoring & ELO Leaderboard');
    highlights.push('Shuttlecock & Equipment Inventory Tracking');
  }

  return {
    id: p.planCode || 'CLUB_ACCESS_PASS',
    name: p.name ? p.name.replace(/^Club\s+/i, '') : 'Batch Pass',
    badge: '30 DAYS FREE TRIAL',
    isPopular: true,
    subtitle: 'Court Batch & Member Operations Pass',
    description: p.description || 'First 30 days free, then ₹249/month. Monitor court batches, player attendance, expenses, fees & leaderboards.',
    monthlyPrice: Number(p.monthlyPrice) || 249,
    yearlyPrice: Number(p.yearlyPrice) || 2490,
    quotas: [
      { label: 'Members', value: `Max ${maxMembers} Players` },
      { label: 'Managers', value: `${maxManagers} Admins` },
      { label: 'Free Trial', value: `${trialDays} Days Free` },
    ],
    highlightFeatures: highlights,
    disabledFeatures: [],
    theme: {
      border: 'border-emerald-500/50 dark:border-emerald-500/70 shadow-emerald-500/15 ring-1 ring-emerald-500/30',
      gradient: 'from-emerald-500/[0.1] via-card to-card dark:from-emerald-950/70 dark:via-slate-900 dark:to-slate-950',
      accent: 'text-emerald-600 dark:text-emerald-400',
      badgeBg: 'bg-gradient-to-r from-emerald-500 to-teal-400',
      badgeText: 'text-slate-950 font-black',
    },
  };
}

function mapCoachPlanToGeneric(p: CoachSubscriptionPlan): GenericPlan {
  const code = (p.planCode || '').toUpperCase();
  const isPop = code.includes('PRO');
  const maxTrainees = p.maxTrainees || p.limits?.MAX_TRAINEES || (isPop ? 50 : 15);
  const trialDays = p.trialDays || p.limits?.TRIAL_DAYS || (isPop ? 0 : 30);

  const highlights: string[] = [];
  if (trialDays > 0) {
    highlights.push(`First ${trialDays} Days 100% Free Trial`);
  }
  highlights.push(`Up to ${maxTrainees} Active Trainees Roster`);

  if (p.features) {
    Object.entries(p.features).forEach(([featKey, isEnabled]) => {
      if (isEnabled) {
        const label = COACH_FEATURE_LABELS[featKey] || COACH_FEATURE_LABELS[featKey.toUpperCase()];
        if (label && !highlights.includes(label)) {
          highlights.push(label);
        }
      }
    });
  }

  if (highlights.length < 5) {
    highlights.push('Personal Coaching Calendar & Slot Scheduling');
    highlights.push('Daily Check-in & Session Attendance');
    highlights.push('Cash & Digital UPI Payment Receipts');
    highlights.push('Coach Public Discovery Profile');
  }

  const disabled: string[] = [];
  const importantFeatures = [
    'COACH_DRILL_CARDS',
    'COACH_AUTO_REMINDERS',
    'COACH_VERIFIED_BADGE',
    'COACH_VIDEO_ANALYSIS',
  ];
  if (p.features) {
    importantFeatures.forEach((featKey) => {
      const isEnabled = p.features[featKey] ?? p.features[featKey.toLowerCase()];
      if (!isEnabled) {
        const label = COACH_FEATURE_LABELS[featKey];
        if (label && !disabled.includes(label)) {
          disabled.push(label);
        }
      }
    });
  }

  const badge = isPop ? '👑 MOST POPULAR • ₹499' : '30-DAY FREE TRIAL • ₹299';
  const subtitle = isPop ? 'Competitive & High-Volume Trainers' : 'Solo Coaches & Personal Trainers';

  return {
    id: p.planCode,
    name: p.name.replace(/^Coach\s+/i, ''),
    badge,
    isPopular: isPop,
    subtitle,
    description: p.description,
    monthlyPrice: Number(p.monthlyPrice) || (isPop ? 499 : 299),
    yearlyPrice: Number(p.yearlyPrice) || (isPop ? 4990 : 2990),
    quotas: [
      { label: 'Trainees', value: `${maxTrainees} Max` },
      { label: 'Rate Cards', value: isPop ? 'Unlimited' : '3 Packages' },
      { label: 'Free Trial', value: trialDays > 0 ? `${trialDays} Days Free` : 'Pro Features' },
    ],
    highlightFeatures: highlights,
    disabledFeatures: disabled,
    theme: isPop
      ? {
          border: 'border-orange-500/50 dark:border-orange-500/70 shadow-orange-500/15 ring-1 ring-orange-500/30',
          gradient: 'from-orange-500/[0.1] via-card to-card dark:from-orange-950/70 dark:via-slate-900 dark:to-slate-950',
          accent: 'text-orange-600 dark:text-orange-400',
          badgeBg: 'bg-gradient-to-r from-amber-500 to-orange-500',
          badgeText: 'text-slate-950 font-black',
        }
      : {
          border: 'border-amber-500/40 dark:border-amber-500/50',
          gradient: 'from-amber-500/[0.08] via-card to-card dark:from-amber-950/40 dark:via-slate-900 dark:to-slate-950',
          accent: 'text-amber-600 dark:text-amber-400',
          badgeBg: 'bg-amber-500/15 border border-amber-500/30',
          badgeText: 'text-amber-700 dark:text-amber-300 font-bold',
        },
  };
}

function mapCommunityPlanToGeneric(p: CommunitySubscriptionPlan): GenericPlan {
  const code = (p.planCode || '').toUpperCase();
  const isPop = code.includes('PRO');
  const maxMembers = p.maxMembers || p.limits?.MAX_MEMBERS || (isPop ? 250 : 50);
  const maxCoordinators = p.maxCoordinators || p.limits?.MAX_COORDINATORS || (isPop ? 5 : 2);

  const highlights: string[] = [];
  if (isPop) {
    highlights.push(`Up to ${maxMembers} Active Community Members`);
    highlights.push(`${maxCoordinators} Community Coordinators & Admins`);
  } else {
    highlights.push('₹0 Forever Free (No Credit Card or Expiry)');
    highlights.push(`Up to ${maxMembers} Active Community Members`);
    highlights.push(`${maxCoordinators} Community Coordinators & Admins`);
  }

  if (p.features) {
    Object.entries(p.features).forEach(([featKey, isEnabled]) => {
      if (isEnabled) {
        const label = COMMUNITY_FEATURE_LABELS[featKey] || COMMUNITY_FEATURE_LABELS[featKey.toUpperCase()];
        if (label && !highlights.includes(label)) {
          highlights.push(label);
        }
      }
    });
  }

  if (highlights.length < 5) {
    highlights.push('Unlimited Pickup Games & Social Play Sessions');
    highlights.push('Real-Time RSVP & Interactive Check-in Tracking');
    highlights.push('Community Feed, Pinned Notices & Photo Gallery');
    highlights.push('Interactive Member Polls & Vote Counters');
  }

  const disabled: string[] = [];
  const importantFeatures = [
    'COMMUNITY_KITTY_SPLITTER',
    'COMMUNITY_MATCH_SCORING',
    'COMMUNITY_WHATSAPP_BROADCASTS',
    'COMMUNITY_EXPORT_REPORTS',
  ];
  if (p.features) {
    importantFeatures.forEach((featKey) => {
      const isEnabled = p.features[featKey] ?? p.features[featKey.toLowerCase()];
      if (!isEnabled) {
        const label = COMMUNITY_FEATURE_LABELS[featKey];
        if (label && !disabled.includes(label)) {
          disabled.push(label);
        }
      }
    });
  }

  const badge = isPop ? '👑 MOST POPULAR • ₹199' : 'FOREVER FREE • ₹0';
  const subtitle = isPop ? 'Active Sports Clubs & Growing Societies' : 'Social Groups & Apartment Societies';

  return {
    id: p.planCode,
    name: p.name.replace(/^Community\s+/i, ''),
    badge,
    isPopular: isPop,
    subtitle,
    description: p.description,
    monthlyPrice: Number(p.monthlyPrice) || (isPop ? 199 : 0),
    yearlyPrice: Number(p.yearlyPrice) || (isPop ? 1990 : 0),
    quotas: [
      { label: 'Members', value: `Up to ${maxMembers}` },
      { label: 'Admins', value: `${maxCoordinators} Coordinators` },
      { label: 'Sessions', value: 'Unlimited RSVPs' },
    ],
    highlightFeatures: highlights,
    disabledFeatures: disabled,
    theme: isPop
      ? {
          border: 'border-blue-500/50 dark:border-blue-500/70 shadow-blue-500/15 ring-1 ring-blue-500/30',
          gradient: 'from-blue-500/[0.1] via-card to-card dark:from-blue-950/70 dark:via-slate-900 dark:to-slate-950',
          accent: 'text-blue-600 dark:text-blue-400',
          badgeBg: 'bg-gradient-to-r from-sky-500 to-blue-600',
          badgeText: 'text-white font-black',
        }
      : {
          border: 'border-sky-500/40 dark:border-sky-500/50',
          gradient: 'from-sky-500/[0.08] via-card to-card dark:from-sky-950/40 dark:via-slate-900 dark:to-slate-950',
          accent: 'text-sky-600 dark:text-sky-400',
          badgeBg: 'bg-sky-500/15 border border-sky-500/30',
          badgeText: 'text-sky-700 dark:text-sky-300 font-bold',
        },
  };
}

// Compact Dynamic Fallback Generator for Offline Readiness
function getFallbackPlans(category: OrgCategory): GenericPlan[] {
  if (category === 'COURT') {
    const defaultVenues: VenueSubscriptionPlan[] = [
      {
        planId: 1,
        planUuid: 'v-free',
        planCode: 'VENUE_FREE',
        name: 'Venue Free',
        description: 'Basic public listing, 15-minute live calendar & walk-in recording.',
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
          VENUE_POS: false,
        },
      },
      {
        planId: 2,
        planUuid: 'v-starter',
        planCode: 'VENUE_STARTER',
        name: 'Venue Starter',
        description: 'Dynamic peak rates & recurring academy reservations for up to 3 facilities.',
        displayOrder: 1,
        versionId: 1,
        versionNumber: 1,
        marketplaceCommissionRate: 6.0,
        monthlyPrice: 499,
        yearlyPrice: 4999,
        limits: { MAX_VENUES: 1, MAX_FACILITIES: 3, MAX_STAFF: 2 },
        features: {
          VENUE_FACILITY_MANAGEMENT: true,
          VENUE_DYNAMIC_PRICING: true,
          VENUE_RECURRING_BOOKINGS: true,
          VENUE_ADVANCED_CRM: false,
          VENUE_MEMBERSHIPS: false,
          VENUE_POS: false,
          VENUE_MULTI_BRANCH: false,
        },
      },
      {
        planId: 3,
        planUuid: 'v-pro',
        planCode: 'VENUE_PROFESSIONAL',
        name: 'Venue Professional',
        description: 'Customer loyalty tracking, prepaid play passes, POS billing & 10 courts.',
        displayOrder: 2,
        versionId: 1,
        versionNumber: 1,
        marketplaceCommissionRate: 4.5,
        monthlyPrice: 999,
        yearlyPrice: 9999,
        limits: { MAX_VENUES: 1, MAX_FACILITIES: 10, MAX_STAFF: 5 },
        features: {
          VENUE_FACILITY_MANAGEMENT: true,
          VENUE_DYNAMIC_PRICING: true,
          VENUE_RECURRING_BOOKINGS: true,
          VENUE_ADVANCED_CRM: true,
          VENUE_MEMBERSHIPS: true,
          VENUE_POS: true,
          VENUE_MULTI_BRANCH: false,
        },
      },
      {
        planId: 4,
        planUuid: 'v-biz',
        planCode: 'VENUE_BUSINESS',
        name: 'Venue Business',
        description: 'Up to 3 branches, 25 facilities, staff shift rosters & 3.5% commission.',
        displayOrder: 3,
        versionId: 1,
        versionNumber: 1,
        marketplaceCommissionRate: 3.5,
        monthlyPrice: 2499,
        yearlyPrice: 24999,
        limits: { MAX_VENUES: 3, MAX_FACILITIES: 25, MAX_STAFF: 15 },
        features: {
          VENUE_FACILITY_MANAGEMENT: true,
          VENUE_DYNAMIC_PRICING: true,
          VENUE_RECURRING_BOOKINGS: true,
          VENUE_ADVANCED_CRM: true,
          VENUE_MEMBERSHIPS: true,
          VENUE_POS: true,
          VENUE_MULTI_BRANCH: true,
        },
      },
      {
        planId: 5,
        planUuid: 'v-ent',
        planCode: 'VENUE_ENTERPRISE',
        name: 'Venue Enterprise',
        description: 'Unlimited facilities, custom integrations, lowest 2.0% commission & dedicated SLA.',
        displayOrder: 4,
        versionId: 1,
        versionNumber: 1,
        marketplaceCommissionRate: 2.0,
        monthlyPrice: 0,
        yearlyPrice: 0,
        limits: { MAX_VENUES: 999, MAX_FACILITIES: 999, MAX_STAFF: 999 },
        features: {
          VENUE_FACILITY_MANAGEMENT: true,
          VENUE_DYNAMIC_PRICING: true,
          VENUE_RECURRING_BOOKINGS: true,
          VENUE_ADVANCED_CRM: true,
          VENUE_MEMBERSHIPS: true,
          VENUE_POS: true,
          VENUE_MULTI_BRANCH: true,
          VENUE_API_ACCESS: true,
        },
      },
    ];
    return defaultVenues.map(mapVenuePlanToGeneric);
  }

  if (category === 'ORGANIZER') {
    const defaultTournaments: TournamentSubscriptionPlan[] = [
      {
        planId: 10,
        planUuid: 't-free',
        planCode: 'TOURNAMENT_FREE',
        name: 'Tournament Free',
        description: 'Host 1 trial tournament with up to 32 players, single knockout and round-robin draws.',
        displayOrder: 0,
        versionId: 1,
        versionNumber: 1,
        packagePrice: 0,
        tournamentCredits: 1,
        includedAuctionCredits: 0,
        validityDays: 30,
        limits: { MAX_PARTICIPANTS: 32, MAX_CATEGORIES: 2, MAX_COURTS: 2, TOURNAMENT_CREDITS: 1, INCLUDED_AUCTION_CREDITS: 0 },
        features: {
          BASIC_SETUP: true,
          ONLINE_REGISTRATION: false,
          LIVE_AUCTION_ACTIVATION: false,
          ADVANCED_BROADCAST_OVERLAYS: false,
        },
      },
      {
        planId: 11,
        planUuid: 't-starter',
        planCode: 'TOURNAMENT_STARTER',
        name: 'Tournament Starter',
        description: 'Publish 1 tournament with online registrations, UPI payment verification, and doubles partner linking.',
        displayOrder: 1,
        versionId: 1,
        versionNumber: 1,
        packagePrice: 499,
        tournamentCredits: 1,
        includedAuctionCredits: 0,
        validityDays: 365,
        limits: { MAX_PARTICIPANTS: 128, MAX_CATEGORIES: 8, MAX_COURTS: 5, TOURNAMENT_CREDITS: 1, INCLUDED_AUCTION_CREDITS: 0 },
        features: {
          BASIC_SETUP: true,
          ONLINE_REGISTRATION: true,
          PAYMENT_VERIFICATION: true,
          DOUBLES_PARTNER_LINKING: true,
          BASIC_OBS_OVERLAYS: true,
          LIVE_AUCTION_ACTIVATION: false,
          TEAM_CHAMPIONSHIP: false,
        },
      },
      {
        planId: 12,
        planUuid: 't-pro',
        planCode: 'TOURNAMENT_PRO',
        name: 'Tournament Professional',
        description: '5 tournament publication pack with advanced seeding, OBS broadcast overlays, team championships, and live auction eligibility.',
        displayOrder: 2,
        versionId: 1,
        versionNumber: 1,
        packagePrice: 1999,
        tournamentCredits: 5,
        includedAuctionCredits: 0,
        validityDays: 365,
        limits: { MAX_PARTICIPANTS: 512, MAX_CATEGORIES: 30, MAX_COURTS: 20, TOURNAMENT_CREDITS: 5, INCLUDED_AUCTION_CREDITS: 0 },
        features: {
          BASIC_SETUP: true,
          ONLINE_REGISTRATION: true,
          ADVANCED_SEEDING: true,
          ADVANCED_BROADCAST_OVERLAYS: true,
          TEAM_CHAMPIONSHIP: true,
          LIVE_AUCTION_ELIGIBLE: true,
        },
      },
      {
        planId: 13,
        planUuid: 't-biz',
        planCode: 'TOURNAMENT_BUSINESS',
        name: 'Tournament Enterprise',
        description: 'High-volume organizers with 2 free included live auction activations, complete organizer ERP, and inventory stock tracking.',
        displayOrder: 3,
        versionId: 1,
        versionNumber: 1,
        packagePrice: 4999,
        tournamentCredits: 15,
        includedAuctionCredits: 2,
        validityDays: 365,
        limits: { MAX_PARTICIPANTS: 1500, MAX_CATEGORIES: 75, MAX_COURTS: 60, TOURNAMENT_CREDITS: 15, INCLUDED_AUCTION_CREDITS: 2 },
        features: {
          BASIC_SETUP: true,
          ONLINE_REGISTRATION: true,
          ADVANCED_SEEDING: true,
          ADVANCED_BROADCAST_OVERLAYS: true,
          TEAM_CHAMPIONSHIP: true,
          LIVE_AUCTION_ACTIVATION: true,
          ADVANCED_ORGANIZER_ERP: true,
        },
      },
    ];
    const mapped = defaultTournaments.map(mapOrganizerPlanToGeneric);
    mapped.push(AUCTION_PASS_PLAN);
    return mapped;
  }

  if (category === 'ACADEMY') {
    const defaultAcademies: AcademySubscriptionPlan[] = [
      {
        planId: 20,
        planUuid: 'a-free',
        planCode: 'ACADEMY_FREE',
        name: 'Grassroots Free',
        description: 'Student roster, daily attendance register, cash fee logging, and public academy profile.',
        displayOrder: 0,
        versionId: 1,
        versionNumber: 1,
        monthlyPrice: 0,
        yearlyPrice: 0,
        maxStudents: 15,
        maxCoaches: 1,
        maxCentres: 1,
        limits: { MAX_STUDENTS: 15, MAX_COACHES: 1, MAX_CENTRES: 1 },
        features: {
          ACADEMY_BASIC_ROSTER: true,
          ACADEMY_ATTENDANCE: true,
          ACADEMY_FEE_TRACKING: true,
          ACADEMY_ONLINE_ADMISSIONS: false,
          ACADEMY_FEE_REMINDERS: false,
        },
      },
      {
        planId: 21,
        planUuid: 'a-starter',
        planCode: 'ACADEMY_STARTER',
        name: 'Academy Starter',
        description: 'Batch schedules, online student admissions, automated fee payment reminders & attendance.',
        displayOrder: 1,
        versionId: 1,
        versionNumber: 1,
        monthlyPrice: 999,
        yearlyPrice: 9999,
        maxStudents: 60,
        maxCoaches: 3,
        maxCentres: 1,
        limits: { MAX_STUDENTS: 60, MAX_COACHES: 3, MAX_CENTRES: 1 },
        features: {
          ACADEMY_BASIC_ROSTER: true,
          ACADEMY_ATTENDANCE: true,
          ACADEMY_FEE_TRACKING: true,
          ACADEMY_ONLINE_ADMISSIONS: true,
          ACADEMY_FEE_REMINDERS: true,
          ACADEMY_MULTI_CENTRE: false,
        },
      },
      {
        planId: 22,
        planUuid: 'a-pro',
        planCode: 'ACADEMY_PRO',
        name: 'Academy Professional',
        description: 'Up to 250 students, 3 campuses, coach payroll, fitness benchmarks & automated fee auto-debit.',
        displayOrder: 2,
        versionId: 1,
        versionNumber: 1,
        monthlyPrice: 2499,
        yearlyPrice: 24999,
        maxStudents: 250,
        maxCoaches: 10,
        maxCentres: 3,
        limits: { MAX_STUDENTS: 250, MAX_COACHES: 10, MAX_CENTRES: 3 },
        features: {
          ACADEMY_BASIC_ROSTER: true,
          ACADEMY_ATTENDANCE: true,
          ACADEMY_FEE_TRACKING: true,
          ACADEMY_ONLINE_ADMISSIONS: true,
          ACADEMY_FEE_REMINDERS: true,
          ACADEMY_MULTI_CENTRE: true,
          ACADEMY_COACH_PAYROLL: true,
        },
      },
      {
        planId: 23,
        planUuid: 'a-biz',
        planCode: 'ACADEMY_BUSINESS',
        name: 'Academy Elite',
        description: 'Up to 750 students, 10 campuses, 30 coaches, shift rostering, geo-fenced attendance & centralized treasury.',
        displayOrder: 3,
        versionId: 1,
        versionNumber: 1,
        monthlyPrice: 4999,
        yearlyPrice: 49999,
        maxStudents: 750,
        maxCoaches: 30,
        maxCentres: 10,
        limits: { MAX_STUDENTS: 750, MAX_COACHES: 30, MAX_CENTRES: 10 },
        features: {
          ACADEMY_BASIC_ROSTER: true,
          ACADEMY_ATTENDANCE: true,
          ACADEMY_FEE_TRACKING: true,
          ACADEMY_ONLINE_ADMISSIONS: true,
          ACADEMY_FEE_REMINDERS: true,
          ACADEMY_MULTI_CENTRE: true,
          ACADEMY_COACH_PAYROLL: true,
          ACADEMY_PERFORMANCE_ANALYTICS: true,
        },
      },
      {
        planId: 24,
        planUuid: 'a-ent',
        planCode: 'ACADEMY_ENTERPRISE',
        name: 'Academy Enterprise',
        description: 'Unlimited students, coaches, and campuses with custom white-label app & dedicated SLA.',
        displayOrder: 4,
        versionId: 1,
        versionNumber: 1,
        monthlyPrice: 0,
        yearlyPrice: 0,
        maxStudents: 99999,
        maxCoaches: 999,
        maxCentres: 999,
        limits: { MAX_STUDENTS: 99999, MAX_COACHES: 999, MAX_CENTRES: 999 },
        features: {
          ACADEMY_BASIC_ROSTER: true,
          ACADEMY_ATTENDANCE: true,
          ACADEMY_FEE_TRACKING: true,
          ACADEMY_ONLINE_ADMISSIONS: true,
          ACADEMY_FEE_REMINDERS: true,
          ACADEMY_MULTI_CENTRE: true,
          ACADEMY_COACH_PAYROLL: true,
          ACADEMY_PERFORMANCE_ANALYTICS: true,
          ACADEMY_WHITE_LABEL: true,
        },
      },
    ];
    return defaultAcademies.map(mapAcademyPlanToGeneric);
  }

  if (category === 'CLUB') return CLUB_PLANS;
  if (category === 'COACH') return COACH_PLANS;
  if (category === 'COMMUNITY') return COMMUNITY_PLANS;
  return [];
}

export function SubscriptionPackages({ hideNavbar = false }: { hideNavbar?: boolean } = {}) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { organizations } = useWorkspaceStore();

  const [activeOrgType, setActiveOrgType] = useState<OrgCategory>('COURT');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [selectedPlanId, setSelectedPlanId] = useState<string>('VENUE_PROFESSIONAL');
  const [mobileDeckMode, setMobileDeckMode] = useState<'focused' | 'deck'>('focused');
  const [showComparison, setShowComparison] = useState<boolean>(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [planDetailsModal, setPlanDetailsModal] = useState<GenericPlan | null>(null);

  // Dynamic Plans State from Backend
  const [backendPlans, setBackendPlans] = useState<Record<OrgCategory, GenericPlan[] | null>>({
    COURT: null,
    ORGANIZER: null,
    ACADEMY: null,
    CLUB: null,
    COACH: null,
    COMMUNITY: null,
  });
  const [isLoadingPlans, setIsLoadingPlans] = useState<boolean>(true);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Synchronize live plans from backend
  const syncLivePlans = React.useCallback(async (force = false) => {
    setIsLoadingPlans(true);
    try {
      const [venueRes, orgRes, academyRes, clubRes, coachRes, communityRes] = await Promise.allSettled([
        SubscriptionService.getVenuePlans(),
        OrganizerSubscriptionService.getPlans(),
        AcademySubscriptionService.getPlans(),
        ClubSubscriptionService.getPlans(),
        CoachSubscriptionService.getPlans(),
        CommunitySubscriptionService.getPlans(),
      ]);

      setBackendPlans((prev) => {
        const next = { ...prev };

        if (venueRes.status === 'fulfilled') {
          const apiData = (venueRes.value as any)?.data || venueRes.value;
          if (Array.isArray(apiData) && apiData.length > 0) {
            next.COURT = apiData.map(mapVenuePlanToGeneric);
          }
        }

        if (orgRes.status === 'fulfilled') {
          const apiData = (orgRes.value as any)?.data || orgRes.value;
          if (Array.isArray(apiData) && apiData.length > 0) {
            const mapped = apiData.map(mapOrganizerPlanToGeneric);
            if (!mapped.some((m: GenericPlan) => m.id === 'AUCTION_PASS')) {
              mapped.push(AUCTION_PASS_PLAN);
            }
            next.ORGANIZER = mapped;
          }
        }

        if (academyRes.status === 'fulfilled') {
          const apiData = (academyRes.value as any)?.data || academyRes.value;
          if (Array.isArray(apiData) && apiData.length > 0) {
            const mapped = apiData.map(mapAcademyPlanToGeneric);
            if (!mapped.some((p) => p.id === 'ACADEMY_ENTERPRISE')) {
              mapped.push(
                mapAcademyPlanToGeneric({
                  planId: 24,
                  planUuid: 'a-ent',
                  planCode: 'ACADEMY_ENTERPRISE',
                  name: 'Academy Enterprise',
                  description: 'Unlimited students, coaches, and campuses with custom white-label app & dedicated SLA.',
                  displayOrder: 4,
                  monthlyPrice: 0,
                  yearlyPrice: 0,
                  maxStudents: 99999,
                  maxCoaches: 999,
                  maxCentres: 999,
                  limits: { MAX_STUDENTS: 99999, MAX_COACHES: 999, MAX_CENTRES: 999 },
                  features: {
                    ACADEMY_BASIC_ROSTER: true,
                    ACADEMY_ATTENDANCE: true,
                    ACADEMY_FEE_TRACKING: true,
                    ACADEMY_ONLINE_ADMISSIONS: true,
                    ACADEMY_FEE_REMINDERS: true,
                    ACADEMY_MULTI_CENTRE: true,
                    ACADEMY_COACH_PAYROLL: true,
                    ACADEMY_PERFORMANCE_ANALYTICS: true,
                    ACADEMY_WHITE_LABEL: true,
                  },
                })
              );
            }
            next.ACADEMY = mapped;
          }
        }

        if (clubRes.status === 'fulfilled') {
          const apiData = (clubRes.value as any)?.data || clubRes.value;
          if (Array.isArray(apiData) && apiData.length > 0) {
            next.CLUB = apiData.map(mapClubPlanToGeneric);
          }
        }

        if (coachRes.status === 'fulfilled') {
          const apiData = (coachRes.value as any)?.data || coachRes.value;
          if (Array.isArray(apiData) && apiData.length > 0) {
            next.COACH = apiData.map(mapCoachPlanToGeneric);
          }
        }

        if (communityRes.status === 'fulfilled') {
          const apiData = (communityRes.value as any)?.data || communityRes.value;
          if (Array.isArray(apiData) && apiData.length > 0) {
            next.COMMUNITY = apiData.map(mapCommunityPlanToGeneric);
          }
        }

        return next;
      });

      setLastSyncTime(new Date());
    } catch (err) {
      console.warn(`[SubscriptionPackages] Live plans sync error:`, err);
    } finally {
      setIsLoadingPlans(false);
    }
  }, []);

  useEffect(() => {
    syncLivePlans();
  }, [syncLivePlans]);

  // Upgrade Modal State
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState<GenericPlan | null>(null);
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');
  const [submittingUpgrade, setSubmittingUpgrade] = useState(false);
  const [upgradeSuccess, setUpgradeSuccess] = useState(false);
  const [upgradeError, setUpgradeError] = useState<string | null>(null);

  const {
    modules: orgModules,
    fetchModules: fetchOrgModules,
    getModule,
  } = useOrgModulesStore();

  useEffect(() => {
    fetchOrgModules();
  }, [fetchOrgModules]);

  // Notice modal for Early Access / Workspace Provisioning Paused
  const [moduleNoticeModal, setModuleNoticeModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    badge: string;
    isComingSoon: boolean;
  }>({
    isOpen: false,
    title: '',
    description: '',
    badge: '',
    isComingSoon: false,
  });

  // Dynamic modules list from admin registry
  const dynamicCategories = React.useMemo(() => {
    if (!orgModules || orgModules.length === 0) {
      return DEFAULT_CATEGORIES;
    }
    const filtered = orgModules
      .filter((m) => m.isEnabled && m.showInPricing && m.status !== 'DISABLED')
      .sort((a, b) => a.displayOrder - b.displayOrder);

    if (filtered.length === 0) {
      return DEFAULT_CATEGORIES;
    }

    return filtered.map((m) => {
      const defaultMatch = DEFAULT_CATEGORIES.find((d) => d.id === m.moduleKey);
      const IconComponent = (m.iconName && ICON_MAP[m.iconName]) || defaultMatch?.icon || Building2;
      return {
        id: m.moduleKey as OrgCategory,
        label: m.categoryLabel || m.displayName,
        icon: IconComponent,
        count: m.badgeText || (m.status === 'COMING_SOON' ? 'SOON' : m.status === 'BETA' ? 'BETA' : defaultMatch?.count || 'Active'),
        status: m.status,
        allowWorkspaceCreation: m.allowWorkspaceCreation,
        maintenanceMessage: m.maintenanceMessage,
        displayName: m.displayName,
        description: m.description,
        targetLaunchDate: m.targetLaunchDate,
      };
    });
  }, [orgModules]);

  // Ensure activeOrgType matches an enabled category
  useEffect(() => {
    if (dynamicCategories.length > 0) {
      const exists = dynamicCategories.some((c) => c.id === activeOrgType);
      if (!exists) {
        setActiveOrgType(dynamicCategories[0].id);
      }
    }
  }, [dynamicCategories, activeOrgType]);

  const activeModuleConfig = getModule(activeOrgType);

  // Filter organizations matching active category
  const matchingOrgs = organizations.filter((o) => {
    if (activeOrgType === 'COURT') return o.type === 'COURT' || (o.type as string) === 'VENUE_MANAGER';
    if (activeOrgType === 'ORGANIZER') return o.type === 'ORGANIZER';
    if (activeOrgType === 'ACADEMY') return o.type === 'ACADEMY';
    if (activeOrgType === 'CLUB') return o.type === 'CLUB';
    if (activeOrgType === 'COACH') return o.type === 'COACH';
    if (activeOrgType === 'COMMUNITY') return o.type === 'COMMUNITY';
    return false;
  });

  // Current Plan Set according to Active Org Type (Live Dynamic with fallback)
  const currentPlans: GenericPlan[] = React.useMemo(() => {
    const live = backendPlans[activeOrgType];
    if (live && live.length > 0) return live;
    return getFallbackPlans(activeOrgType);
  }, [activeOrgType, backendPlans]);

  const isLiveSynced = Boolean(backendPlans[activeOrgType] && backendPlans[activeOrgType]!.length > 0);

  // When changing category, auto-focus its popular or first plan
  useEffect(() => {
    const popular = currentPlans.find((p) => p.isPopular) || currentPlans[0];
    if (popular) {
      setSelectedPlanId(popular.id);
    }
  }, [activeOrgType, currentPlans]);

  const activeFocusedPlan = currentPlans.find((p) => p.id === selectedPlanId) || currentPlans[0];

  const activeFaqs = React.useMemo(() => {
    if (activeOrgType === 'ACADEMY') return ACADEMY_FAQS;
    if (activeOrgType === 'ORGANIZER') return TOURNAMENT_FAQS;
    if (activeOrgType === 'CLUB') return CLUB_FAQS;
    if (activeOrgType === 'COACH') return COACH_FAQS;
    if (activeOrgType === 'COMMUNITY') return COMMUNITY_FAQS;
    return VENUE_FAQS;
  }, [activeOrgType]);

  const handleSelectPlan = (plan: GenericPlan) => {
    if (activeModuleConfig?.status === 'COMING_SOON') {
      setModuleNoticeModal({
        isOpen: true,
        title: `${activeModuleConfig.displayName} Launching Soon`,
        description: activeModuleConfig.maintenanceMessage || 'We are fine-tuning this module with dedicated features for sports professionals. You have been placed on the priority invite list.',
        badge: 'COMING SOON',
        isComingSoon: true,
      });
      return;
    }

    if (activeModuleConfig && (!activeModuleConfig.isEnabled || !activeModuleConfig.allowWorkspaceCreation)) {
      setModuleNoticeModal({
        isOpen: true,
        title: `${activeModuleConfig.displayName} Onboarding Paused`,
        description: activeModuleConfig.maintenanceMessage || 'New workspace creation for this vertical is temporarily paused for routine system upgrades. Existing workspaces are operating normally.',
        badge: 'PAUSED',
        isComingSoon: false,
      });
      return;
    }

    if (plan.id === 'VENUE_ENTERPRISE' || plan.id === 'ACADEMY_ENTERPRISE') {
      window.location.href = 'mailto:enterprise@athlonsports.in?subject=Athlon%20Enterprise%20Inquiry';
      return;
    }

    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(`/setup-workspace?type=${activeOrgType}&plan=${plan.id}&billing=${billingCycle}`)}`);
      return;
    }

    if (matchingOrgs.length > 0) {
      setSelectedPlanForUpgrade(plan);
      setSelectedOrgId(matchingOrgs[0].id);
      setUpgradeError(null);
      setUpgradeSuccess(false);
      setIsUpgradeModalOpen(true);
    } else {
      router.push(`/setup-workspace?type=${activeOrgType}&plan=${plan.id}&billing=${billingCycle}`);
    }
  };

  const handleConfirmUpgrade = async () => {
    if (!selectedPlanForUpgrade || !selectedOrgId) return;
    setSubmittingUpgrade(true);
    setUpgradeError(null);

    try {
      await SubscriptionService.subscribeOrg({
        organizationUuid: selectedOrgId,
        packageUuid: selectedPlanForUpgrade.id,
        paymentReference: `WEB_SUB_${Date.now()}`,
      });

      setUpgradeSuccess(true);
      setTimeout(() => {
        setIsUpgradeModalOpen(false);
        if (activeOrgType === 'ACADEMY') {
          router.push(`/org/${selectedOrgId}/academy/subscription`);
        } else if (activeOrgType === 'ORGANIZER') {
          router.push(`/org/${selectedOrgId}/organizer/subscription`);
        } else if (activeOrgType === 'CLUB') {
          router.push(`/org/${selectedOrgId}/club/subscription`);
        } else if (activeOrgType === 'COACH') {
          router.push(`/org/${selectedOrgId}/coach/subscription`);
        } else if (activeOrgType === 'COMMUNITY') {
          router.push(`/org/${selectedOrgId}/community/subscription`);
        } else {
          router.push(`/org/${selectedOrgId}/venue/subscription`);
        }
      }, 1500);
    } catch (err: any) {
      setUpgradeError(err?.data?.message || err?.message || 'Failed to activate plan');
    } finally {
      setSubmittingUpgrade(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Background Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-primary/10 rounded-full blur-[120px] dark:bg-primary/15" />
        <div className="absolute top-[35%] -left-40 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] dark:bg-indigo-500/10" />
        <div className="absolute top-[60%] -right-40 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[100px] dark:bg-amber-500/10" />
      </div>

      {/* ========================================================================= */}
      {/* ── MOBILE VIEW (< md) ─────────────────────────────────────────────────── */}
      {/* Ultra-Tactile, Athletic Arena Mobile Experience                           */}
      {/* ========================================================================= */}
      <div className="block md:hidden w-full max-w-lg mx-auto px-3.5 sm:px-4 pt-3 pb-36 space-y-4 relative z-10">

        {/* Hero Header Card */}
        <section
          className="relative w-full rounded-[26px] overflow-hidden border p-4.5 shadow-xl transition-all"
          style={{
            backgroundColor: 'var(--athlon-card)',
            borderColor: 'var(--athlon-border)',
            boxShadow: '0 12px 32px -6px var(--athlon-shadow, rgba(0, 0, 0, 0.25)), 0 0 0 1px var(--athlon-border)',
          }}
        >
          {/* Specular Glare Arc */}
          <div className="absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-white/[0.14] dark:from-white/[0.05] via-transparent to-transparent pointer-events-none z-0" />

          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/15 border border-primary/30 text-primary text-[10px] font-black uppercase tracking-widest">
              <Sparkles className="w-3 h-3" />
              <span>ORGANIZATION OPERATING PLANS</span>
            </div>

            <h1 className="text-[21px] font-black leading-[1.12] tracking-tight uppercase text-foreground">
              POWER YOUR ARENA.{' '}
              <span className="text-primary drop-shadow-[0_2px_12px_var(--athlon-primary-glow)]">
                ELEVATE SPORTS.
              </span>
            </h1>

            <p className="text-[11px] text-text-secondary leading-relaxed font-medium">
              Choose dedicated enterprise tiers for Sports Venues, Tournaments, Live Player Auctions, Academies, or Clubs.
            </p>

            {/* Billing Cycle Switcher */}
            <div className="pt-2">
              <div className="p-1 bg-surface/90 backdrop-blur-md border border-border rounded-xl flex items-center justify-between shadow-inner">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold text-center transition ${billingCycle === 'monthly'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-text-muted hover:text-foreground'
                    }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle('yearly')}
                  className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition ${billingCycle === 'yearly'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-text-muted hover:text-foreground'
                    }`}
                >
                  <span>Annual</span>
                  <span className={`text-[8.5px] px-1 py-0.2 rounded font-black uppercase ${billingCycle === 'yearly' ? 'bg-primary-foreground/25 text-primary-foreground' : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                    }`}>
                    Save ~20%
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── 1. ORGANIZATION TYPE SELECTOR (Horizontal 3D Pods) ─────────────── */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-text-muted">
              Select Organization Module
            </span>
            <span className="text-[10px] font-mono text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-full">
              {currentPlans.length} Plans
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {dynamicCategories.map((cat) => {
              const isSelected = activeOrgType === cat.id;
              const IconComp = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveOrgType(cat.id as OrgCategory)}
                  className={`shrink-0 px-3.5 py-2 rounded-2xl text-[11px] font-bold transition-all border flex items-center gap-1.5 active:scale-95 shadow-sm ${isSelected
                    ? 'bg-primary text-primary-foreground border-primary font-black shadow-[0_2px_12px_var(--athlon-primary-glow)] scale-[1.02]'
                    : 'bg-card/80 border-border text-foreground/80 hover:border-primary/40'
                    }`}
                >
                  <IconComp className="w-3.5 h-3.5 shrink-0" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 2. TIER SELECTOR PILLS (Fast Tap Switcher) ─────────────────────── */}
        {currentPlans.length > 0 && activeModuleConfig?.status !== 'COMING_SOON' && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-text-muted">
                Select Package Tier
              </span>
              <div className="flex items-center gap-1 text-[10px]">
                <button
                  onClick={() => setMobileDeckMode('focused')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition ${mobileDeckMode === 'focused' ? 'bg-surface text-primary border border-border shadow-inner' : 'text-text-muted'
                    }`}
                >
                  Card Focus
                </button>
                <button
                  onClick={() => setMobileDeckMode('deck')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition ${mobileDeckMode === 'deck' ? 'bg-surface text-primary border border-border shadow-inner' : 'text-text-muted'
                    }`}
                >
                  All Cards
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {currentPlans.map((p) => {
                const isSelected = selectedPlanId === p.id;
                return (
                  <button
                    key={`pill-${p.id}`}
                    onClick={() => {
                      setSelectedPlanId(p.id);
                      setMobileDeckMode('focused');
                    }}
                    className={`shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-bold transition border active:scale-95 flex items-center gap-1 ${isSelected
                      ? 'bg-foreground text-background border-foreground font-black shadow-md'
                      : 'bg-surface border-border text-foreground/80'
                      }`}
                  >
                    {p.isPopular && <Flame className="w-3 h-3 text-amber-400 fill-current" />}
                    <span>{p.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── 3. HERO PLAN CARD (Ultra-Stylish Athletic Design) ───────────────── */}
        {isLoadingPlans && !backendPlans[activeOrgType] ? (
          <div className="w-full rounded-[26px] p-5 border border-border bg-card animate-pulse space-y-4">
            <div className="h-6 bg-surface rounded-lg w-1/2" />
            <div className="h-4 bg-surface rounded-md w-3/4" />
            <div className="h-14 bg-surface rounded-2xl w-full" />
            <div className="h-24 bg-surface rounded-2xl w-full" />
            <div className="h-10 bg-surface rounded-xl w-full" />
          </div>
        ) : currentPlans.length === 0 || activeModuleConfig?.status === 'COMING_SOON' ? (
          <div className="w-full rounded-[26px] p-6 border border-amber-500/30 bg-gradient-to-b from-amber-500/10 via-card to-card text-center space-y-4 shadow-xl">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-2xl">
              🚀
            </div>
            <div className="space-y-1">
              <span className="inline-block text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Coming Soon • Early Access
              </span>
              <h3 className="text-lg font-black text-foreground">
                {activeModuleConfig?.displayName || 'Module Engine'}
              </h3>
              <p className="text-xs text-text-secondary max-w-xs mx-auto">
                {activeModuleConfig?.description || 'Tailored features and operational toolsets are currently being crafted for this vertical.'}
              </p>
            </div>
            {activeModuleConfig?.maintenanceMessage && (
              <div className="p-3 rounded-xl bg-surface border border-border text-xs text-text-muted">
                {activeModuleConfig.maintenanceMessage}
              </div>
            )}
            <button
              onClick={() => {
                setModuleNoticeModal({
                  isOpen: true,
                  title: `${activeModuleConfig?.displayName || 'Module'} Waitlist`,
                  description: 'You are on the priority list. You will receive immediate notification once registration opens.',
                  badge: 'WAITLIST REGISTERED',
                  isComingSoon: true,
                });
              }}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 active:scale-95 transition-all"
            >
              Request Early Beta Invite
            </button>
          </div>
        ) : mobileDeckMode === 'focused' && activeFocusedPlan ? (
          <div
            className={`w-full rounded-[26px] p-5 flex flex-col justify-between relative overflow-hidden transition-all border shadow-xl bg-card bg-gradient-to-b ${activeFocusedPlan.theme.gradient} ${activeFocusedPlan.theme.border}`}
          >
            {/* Specular glare reflection */}
            <div className="absolute inset-x-0 top-0 h-[35%] bg-gradient-to-b from-white/[0.12] dark:from-white/[0.04] via-transparent to-transparent pointer-events-none z-0" />

            <div className="relative z-10 space-y-4">
              {/* Card Header Row */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-foreground tracking-tight uppercase">
                      {activeFocusedPlan.name}
                    </h3>
                    {activeFocusedPlan.badge && (
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${activeFocusedPlan.theme.badgeBg} ${activeFocusedPlan.theme.badgeText} shadow-sm`}>
                        {activeFocusedPlan.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-text-muted font-medium mt-0.5">
                    {activeFocusedPlan.subtitle}
                  </p>
                </div>

                {activeFocusedPlan.commissionRate !== undefined && (
                  <span className="text-[10px] font-mono font-bold bg-surface px-2.5 py-1 rounded-xl border border-border text-primary">
                    {activeFocusedPlan.commissionRate}% comm
                  </span>
                )}
              </div>

              {/* Price Capsule */}
              <div className="p-3.5 rounded-2xl bg-surface border border-border flex items-center justify-between shadow-inner">
                <div>
                  {activeFocusedPlan.id === 'VENUE_ENTERPRISE' ? (
                    <div className="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono">Custom SLA</div>
                  ) : activeFocusedPlan.monthlyPrice === 0 ? (
                    <div className="text-2xl font-black text-foreground font-mono">₹0 Free</div>
                  ) : (
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-foreground font-mono tracking-tight">
                        ₹{(activeFocusedPlan.isSingleEvent
                          ? activeFocusedPlan.monthlyPrice
                          : billingCycle === 'yearly'
                            ? activeFocusedPlan.yearlyPrice
                            : activeFocusedPlan.monthlyPrice
                        ).toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs font-bold text-text-muted">
                        {activeFocusedPlan.isSingleEvent ? '/ event' : billingCycle === 'yearly' ? '/ year' : '/ month'}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  {activeFocusedPlan.isSingleEvent ? (
                    <span className="text-[9.5px] font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-md">
                      1 Event Pass
                    </span>
                  ) : billingCycle === 'yearly' && activeFocusedPlan.monthlyPrice > 0 ? (
                    <span className="text-[9.5px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                      Save ₹{((activeFocusedPlan.monthlyPrice * 12) - activeFocusedPlan.yearlyPrice).toLocaleString('en-IN')}
                    </span>
                  ) : (
                    <span className="text-[9.5px] font-bold text-text-muted bg-surface-hover px-2 py-0.5 rounded-md border border-border">
                      Cancel anytime
                    </span>
                  )}
                </div>
              </div>

              {/* Quota Telemetry Pods (3-Cell Grid) */}
              <div className="grid grid-cols-3 divide-x divide-border rounded-xl p-2.5 border border-border bg-surface/90 backdrop-blur-md">
                {activeFocusedPlan.quotas.map((q, idx) => (
                  <div key={idx} className="text-center px-1">
                    <div className="text-xs font-black text-foreground font-mono leading-none">
                      {q.value}
                    </div>
                    <div className="text-[8.5px] font-bold text-text-muted uppercase tracking-wider mt-1">
                      {q.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Complete Features List */}
              <div className="space-y-2 pt-1 text-xs">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted block">
                  Included Entitlements & Features:
                </span>

                {activeFocusedPlan.highlightFeatures.map((f, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-foreground font-medium">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 stroke-[2.5]" />
                    <span className="leading-snug">{f}</span>
                  </div>
                ))}

                {activeFocusedPlan.disabledFeatures?.map((f, idx) => (
                  <div key={`dis-${idx}`} className="flex items-center gap-2 text-text-muted/40 line-through">
                    <span className="w-4 text-center shrink-0 font-bold">—</span>
                    <span className="leading-snug">{f}</span>
                  </div>
                ))}
              </div>

              {/* Primary Tactile Action Button */}
              <div className="pt-3">
                <button
                  onClick={() => handleSelectPlan(activeFocusedPlan)}
                  className={`w-full py-3.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xl active:scale-95 ${activeFocusedPlan.id === 'VENUE_PROFESSIONAL' || activeFocusedPlan.isPopular
                    ? 'bg-gradient-to-r from-indigo-500 to-emerald-400 text-black shadow-indigo-500/30 font-black'
                    : activeFocusedPlan.id === 'VENUE_BUSINESS'
                      ? 'bg-emerald-600 active:bg-emerald-700 text-white shadow-emerald-600/30'
                      : activeFocusedPlan.id === 'VENUE_ENTERPRISE'
                        ? 'bg-purple-600 active:bg-purple-700 text-white shadow-purple-600/30'
                        : activeFocusedPlan.monthlyPrice === 0
                          ? 'bg-surface hover:bg-surface-hover text-foreground border border-border shadow-sm'
                          : 'bg-primary active:bg-primary/90 text-primary-foreground'
                    }`}
                >
                  <span>
                    {activeFocusedPlan.id === 'VENUE_ENTERPRISE'
                      ? 'Contact Enterprise Team'
                      : activeFocusedPlan.monthlyPrice === 0
                        ? 'Get Started Free'
                        : `Upgrade to ${activeFocusedPlan.name}`}
                  </span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Stacked Deck: All Cards in this category rendered in vertical feed */
          <div className="space-y-4">
            {currentPlans.map((plan) => {
              const isSelected = selectedPlanId === plan.id;
              const price = plan.isSingleEvent
                ? plan.monthlyPrice
                : billingCycle === 'yearly'
                  ? plan.yearlyPrice
                  : plan.monthlyPrice;

              return (
                <div
                  key={`stacked-${plan.id}`}
                  className={`rounded-[24px] p-4.5 border transition-all relative overflow-hidden bg-card bg-gradient-to-b ${plan.theme.gradient} ${plan.theme.border} ${isSelected ? 'ring-2 ring-primary shadow-xl' : 'shadow-md'
                    }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-base font-black text-foreground">{plan.name}</h4>
                        {plan.badge && (
                          <span className={`px-2 py-0.5 rounded text-[8.5px] font-black uppercase ${plan.theme.badgeBg} ${plan.theme.badgeText}`}>
                            {plan.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-text-muted mt-0.5">{plan.description}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-base font-black text-foreground font-mono">
                        {plan.id === 'VENUE_ENTERPRISE'
                          ? 'Custom'
                          : plan.monthlyPrice === 0
                            ? '₹0'
                            : `₹${price.toLocaleString('en-IN')}`}
                      </div>
                      <span className="text-[9px] text-text-muted block font-semibold">
                        {plan.isSingleEvent ? '/ event' : billingCycle === 'yearly' ? '/ year' : '/ month'}
                      </span>
                    </div>
                  </div>

                  {/* Quota chips */}
                  <div className="flex items-center gap-2 py-2 border-y border-border text-[10px] text-text-secondary">
                    {plan.quotas.map((q, idx) => (
                      <span key={idx} className="bg-surface px-2 py-0.5 rounded border border-border">
                        {q.label}: <strong className="text-foreground">{q.value}</strong>
                      </span>
                    ))}
                  </div>

                  {/* Features sample */}
                  <div className="space-y-1 my-3 text-[11px] text-text-secondary">
                    {plan.highlightFeatures.slice(0, 3).map((f, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handleSelectPlan(plan)}
                    className="w-full py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-black uppercase tracking-wider rounded-xl transition shadow-md active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <span>Select {plan.name}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* ── 4. FULL FEATURE COMPARISON DRAWER ───────────────────────────────── */}
        <div className="rounded-2xl border p-4 bg-card shadow-sm space-y-3">
          <button
            onClick={() => setShowComparison(!showComparison)}
            className="w-full flex items-center justify-between text-left"
          >
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
                {activeOrgType === 'ORGANIZER' ? 'Compare All Tournament Tiers' : 'Compare All 5 Tier Entitlements'}
              </h3>
              <p className="text-[10px] text-text-muted mt-0.5">
                {activeOrgType === 'ORGANIZER'
                  ? 'Publication credits, participant ceilings, broadcast overlays & live auction access'
                  : 'Courts, staff accounts, dynamic pricing & ERP tools'}
              </p>
            </div>
            <div className="p-1 rounded-lg bg-surface border border-border text-primary">
              {showComparison ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>

          {showComparison && (
            <div className="pt-2 border-t border-border space-y-3 text-xs">
              {activeOrgType === 'ORGANIZER' ? (
                <>
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                      Tournament Publication Credits
                    </span>
                    <div className="grid grid-cols-5 gap-1 text-center bg-surface p-2 rounded-xl text-[10px]">
                      <div><span className="text-text-muted block text-[8.5px]">Free</span><strong className="text-foreground">1 Trial</strong></div>
                      <div><span className="text-text-muted block text-[8.5px]">Starter</span><strong className="text-foreground">1 Credit</strong></div>
                      <div className="bg-indigo-500/10 rounded py-0.5"><span className="text-indigo-400 block text-[8.5px]">Pro</span><strong className="text-indigo-400">5 Credits</strong></div>
                      <div><span className="text-text-muted block text-[8.5px]">Business</span><strong className="text-emerald-400">15 Credits</strong></div>
                      <div><span className="text-text-muted block text-[8.5px]">Add-on</span><strong className="text-amber-400">—</strong></div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">
                      Live Auction Access
                    </span>
                    <div className="grid grid-cols-5 gap-1 text-center bg-surface p-2 rounded-xl text-[10px]">
                      <div><span className="text-text-muted block text-[8.5px]">Free</span><span className="font-bold text-text-muted">No</span></div>
                      <div><span className="text-text-muted block text-[8.5px]">Starter</span><span className="font-bold text-text-muted">No</span></div>
                      <div className="bg-indigo-500/10 rounded py-0.5"><span className="text-indigo-400 block text-[8.5px]">Pro</span><span className="font-bold text-amber-400">Eligible</span></div>
                      <div><span className="text-text-muted block text-[8.5px]">Business</span><span className="font-bold text-emerald-400">2 Free</span></div>
                      <div><span className="text-text-muted block text-[8.5px]">Add-on</span><span className="font-bold text-amber-400">₹499</span></div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                      Player & Category Ceilings
                    </span>
                    <div className="space-y-1 bg-surface p-2.5 rounded-xl text-[11px]">
                      <div className="flex justify-between items-center text-text-secondary">
                        <span>Max Participants:</span>
                        <span className="font-bold text-foreground">32 (Free) • 128 (Starter) • 512 (Pro) • 1,500 (Business)</span>
                      </div>
                      <div className="flex justify-between items-center text-text-secondary">
                        <span>Category Limit:</span>
                        <span className="font-bold text-foreground">2 (Free) • 8 (Starter) • 30 (Pro) • 75 (Business)</span>
                      </div>
                      <div className="flex justify-between items-center text-text-secondary">
                        <span>Court Resources:</span>
                        <span className="font-bold text-indigo-400">Up to 60 Courts (Business)</span>
                      </div>
                      <div className="flex justify-between items-center text-text-secondary">
                        <span>OBS Stream Overlays:</span>
                        <span className="font-bold text-emerald-400">Starter & above</span>
                      </div>
                      <div className="flex justify-between items-center text-text-secondary">
                        <span>Team Championship & Ties:</span>
                        <span className="font-bold text-purple-400">Pro & Business</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : activeOrgType === 'ACADEMY' ? (
                <>
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">
                      Trainee Capacity Limits
                    </span>
                    <div className="grid grid-cols-5 gap-1 text-center bg-surface p-2 rounded-xl text-[10px]">
                      <div><span className="text-text-muted block text-[8.5px]">Free</span><strong className="text-foreground">15</strong></div>
                      <div><span className="text-text-muted block text-[8.5px]">Starter</span><strong className="text-foreground">60</strong></div>
                      <div className="bg-indigo-500/10 rounded py-0.5"><span className="text-indigo-400 block text-[8.5px]">Pro</span><strong className="text-indigo-400">250</strong></div>
                      <div><span className="text-text-muted block text-[8.5px]">Elite</span><strong className="text-emerald-400">750</strong></div>
                      <div><span className="text-text-muted block text-[8.5px]">Enterprise</span><strong className="text-purple-400">∞</strong></div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">
                      Coach Staff Logins
                    </span>
                    <div className="grid grid-cols-5 gap-1 text-center bg-surface p-2 rounded-xl text-[10px]">
                      <div><span className="text-text-muted block text-[8.5px]">Free</span><span className="font-bold">1</span></div>
                      <div><span className="text-text-muted block text-[8.5px]">Starter</span><span className="font-bold">3</span></div>
                      <div className="bg-indigo-500/10 rounded py-0.5"><span className="text-indigo-400 block text-[8.5px]">Pro</span><span className="font-bold text-indigo-400">10</span></div>
                      <div><span className="text-text-muted block text-[8.5px]">Elite</span><span className="font-bold text-emerald-400">30</span></div>
                      <div><span className="text-text-muted block text-[8.5px]">Enterprise</span><span className="font-bold text-purple-400">Custom</span></div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">
                      Operations & Campuses
                    </span>
                    <div className="space-y-1 bg-surface p-2.5 rounded-xl text-[11px]">
                      <div className="flex justify-between items-center text-text-secondary">
                        <span>Campus Locations:</span>
                        <span className="font-bold text-foreground">1 (Starter) • 3 (Pro) • 10 (Elite)</span>
                      </div>
                      <div className="flex justify-between items-center text-text-secondary">
                        <span>Online Admissions:</span>
                        <span className="font-bold text-emerald-400">Starter & above</span>
                      </div>
                      <div className="flex justify-between items-center text-text-secondary">
                        <span>Fee Auto-Debit Links:</span>
                        <span className="font-bold text-indigo-400">Pro & above</span>
                      </div>
                      <div className="flex justify-between items-center text-text-secondary">
                        <span>Coach Payroll & Shifts:</span>
                        <span className="font-bold text-indigo-400">Pro & above</span>
                      </div>
                      <div className="flex justify-between items-center text-text-secondary">
                        <span>Multi-Campus Switcher:</span>
                        <span className="font-bold text-emerald-400">Pro, Elite & Enterprise</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                      Bookable Court Quotas
                    </span>
                    <div className="grid grid-cols-5 gap-1 text-center bg-surface p-2 rounded-xl text-[10px]">
                      <div><span className="text-text-muted block text-[8.5px]">Free</span><strong className="text-foreground">1</strong></div>
                      <div><span className="text-text-muted block text-[8.5px]">Starter</span><strong className="text-foreground">3</strong></div>
                      <div className="bg-indigo-500/10 rounded py-0.5"><span className="text-indigo-400 block text-[8.5px]">Pro</span><strong className="text-indigo-400">10</strong></div>
                      <div><span className="text-text-muted block text-[8.5px]">Business</span><strong className="text-emerald-400">25</strong></div>
                      <div><span className="text-text-muted block text-[8.5px]">Enterprise</span><strong className="text-purple-400">∞</strong></div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                      Marketplace Commission
                    </span>
                    <div className="grid grid-cols-5 gap-1 text-center bg-surface p-2 rounded-xl text-[10px]">
                      <div><span className="text-text-muted block text-[8.5px]">Free</span><span className="font-bold">8%</span></div>
                      <div><span className="text-text-muted block text-[8.5px]">Starter</span><span className="font-bold">6%</span></div>
                      <div className="bg-indigo-500/10 rounded py-0.5"><span className="text-indigo-400 block text-[8.5px]">Pro</span><span className="font-bold text-indigo-400">4.5%</span></div>
                      <div><span className="text-text-muted block text-[8.5px]">Business</span><span className="font-bold text-emerald-400">3.5%</span></div>
                      <div><span className="text-text-muted block text-[8.5px]">Enterprise</span><span className="font-bold text-purple-400">2%</span></div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                      ERP & Retention Tools
                    </span>
                    <div className="space-y-1 bg-surface p-2.5 rounded-xl text-[11px]">
                      <div className="flex justify-between items-center text-text-secondary">
                        <span>Peak Dynamic Pricing:</span>
                        <span className="font-bold text-foreground">Starter & above</span>
                      </div>
                      <div className="flex justify-between items-center text-text-secondary">
                        <span>Recurring Academy Series:</span>
                        <span className="font-bold text-foreground">Starter & above</span>
                      </div>
                      <div className="flex justify-between items-center text-text-secondary">
                        <span>Customer CRM & VIP Tiers:</span>
                        <span className="font-bold text-indigo-400">Pro & above</span>
                      </div>
                      <div className="flex justify-between items-center text-text-secondary">
                        <span>Prepaid Play Passes:</span>
                        <span className="font-bold text-indigo-400">Pro & above</span>
                      </div>
                      <div className="flex justify-between items-center text-text-secondary">
                        <span>POS & Rentals:</span>
                        <span className="font-bold text-indigo-400">Pro & above</span>
                      </div>
                      <div className="flex justify-between items-center text-text-secondary">
                        <span>Multi-Branch Switcher:</span>
                        <span className="font-bold text-emerald-400">Business & Enterprise</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* ── 5. MOBILE FAQ ACCORDION ────────────────────────────────────────── */}
        <div className="space-y-2">
          <div className="px-1">
            <h3 className="text-xs font-black uppercase tracking-wider text-foreground">
              Frequently Asked Questions
            </h3>
          </div>

          <div className="space-y-2">
            {activeFaqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={`mob-faq-${idx}`} className="rounded-2xl border bg-card/80 overflow-hidden">
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-3.5 text-left font-bold text-xs text-foreground flex justify-between items-center gap-2"
                  >
                    <span>{faq.question}</span>
                    {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-primary shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 text-text-muted shrink-0" />}
                  </button>
                  {isOpen && (
                    <div className="px-3.5 pb-3.5 text-[11px] text-text-secondary leading-relaxed border-t border-border/60 pt-2">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ── DESKTOP VIEW (hidden md:block) ─────────────────────────────────────── */}
      {/* ========================================================================= */}
      <div className="hidden md:block relative z-10 w-full">
        {/* Desktop Top Navbar (Full Width) */}
        {!hideNavbar && (
          <header
            className="sticky top-0 z-50 w-full border-b backdrop-blur-xl bg-background/85 transition-all duration-300"
            style={{ borderColor: 'var(--athlon-border)' }}
          >
            <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
              {/* Brand Logo */}
              <Link href="/" className="flex items-center gap-3 group">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center text-primary group-hover:scale-105 transition-transform shadow-lg"
                  style={{
                    backgroundColor: 'var(--athlon-surface)',
                    border: '1px solid var(--athlon-border)',
                    boxShadow: '0 0 20px var(--athlon-primary-soft)',
                  }}
                >
                  <Crown className="w-5 h-5 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-black tracking-tight text-foreground leading-none">
                    ATHLON
                  </span>
                  <span
                    className="text-[10px] font-mono font-bold tracking-widest uppercase leading-tight mt-0.5"
                    style={{ color: 'var(--athlon-primary)' }}
                  >
                    Sports Platform
                  </span>
                </div>
              </Link>

              {/* Center Navigation Links */}
              <nav className="flex items-center gap-1 bg-surface/40 p-1.5 rounded-2xl border border-foreground/5 backdrop-blur-md">
                <Link
                  href="/"
                  className="px-4 py-2 rounded-xl text-sm font-bold text-foreground/80 hover:text-foreground hover:bg-foreground/5 transition-all flex items-center gap-2"
                >
                  <Home className="w-4 h-4 text-primary" />
                  <span>Home</span>
                </Link>

                <Link
                  href="/venues"
                  className="px-4 py-2 rounded-xl text-sm font-bold text-foreground/80 hover:text-foreground hover:bg-foreground/5 transition-all flex items-center gap-2"
                >
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  <span>Venues &amp; Turfs</span>
                </Link>

                <Link
                  href="/academies"
                  className="px-4 py-2 rounded-xl text-sm font-bold text-foreground/80 hover:text-foreground hover:bg-foreground/5 transition-all flex items-center gap-2"
                >
                  <GraduationCap className="w-4 h-4 text-emerald-400" />
                  <span>Academies</span>
                </Link>

                <Link
                  href="/tournaments"
                  className="px-4 py-2 rounded-xl text-sm font-bold text-foreground/80 hover:text-foreground hover:bg-foreground/5 transition-all flex items-center gap-2"
                >
                  <Trophy className="w-4 h-4 text-primary" />
                  <span>Tournaments</span>
                </Link>

                <Link
                  href="/live-score"
                  className="px-4 py-2 rounded-xl text-sm font-bold text-foreground/80 hover:text-foreground hover:bg-foreground/5 transition-all flex items-center gap-2"
                >
                  <Radio className="w-4 h-4 text-red-500" />
                  <span>Live Arena</span>
                </Link>
              </nav>

              {/* Right Action CTAs */}
              <div className="flex items-center gap-2.5 shrink-0">
                {isAuthenticated ? (
                  <Link
                    href="/home"
                    className="flex items-center gap-1.5 bg-primary text-black text-xs sm:text-sm font-black px-4 py-2 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-md whitespace-nowrap shrink-0"
                    style={{ boxShadow: '0 4px 16px var(--athlon-primary-glow)' }}
                  >
                    <span>Go to App</span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    className="flex items-center gap-1.5 bg-primary text-black text-xs sm:text-sm font-black px-4 py-2 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-md whitespace-nowrap shrink-0"
                    style={{ boxShadow: '0 4px 16px var(--athlon-primary-glow)' }}
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </Link>
                )}
              </div>
            </div>
          </header>
        )}

        {/* Full-Width Subscription Discovery Hero Banner */}
        <section
          className="relative w-full border-b overflow-hidden"
          style={{
            backgroundColor: 'var(--athlon-card)',
            borderColor: 'var(--athlon-border)',
          }}
        >
          {/* Ambient Lighting & Radar Glow */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <div className="absolute top-0 right-1/4 w-[500px] h-[300px] bg-primary/10 rounded-full blur-[110px]" />
            <div className="absolute bottom-0 left-1/4 w-[450px] h-[260px] bg-emerald-500/10 rounded-full blur-[100px]" />
            <div
              className="absolute inset-0 opacity-[0.02]"
              style={{
                backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
                backgroundSize: '40px 40px',
              }}
            />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-10 lg:py-14 space-y-8">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-primary/10 border border-primary/25 text-primary">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Enterprise Sports Infrastructure • Transparent Pricing</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-[1.15] uppercase">
                {activeOrgType === 'ORGANIZER' ? (
                  <>
                    Tournament Organizer &{' '}
                    <span className="bg-gradient-to-r from-primary via-emerald-400 to-amber-400 bg-clip-text text-transparent">
                      Live Auction Packs
                    </span>
                  </>
                ) : activeOrgType === 'ACADEMY' ? (
                  <>
                    Academy & Coaching{' '}
                    <span className="bg-gradient-to-r from-primary via-emerald-400 to-amber-400 bg-clip-text text-transparent">
                      Management Plans
                    </span>
                  </>
                ) : activeOrgType === 'CLUB' ? (
                  <>
                    Club & Team{' '}
                    <span className="bg-gradient-to-r from-primary via-emerald-400 to-amber-400 bg-clip-text text-transparent">
                      Squad Operations
                    </span>
                  </>
                ) : activeOrgType === 'COACH' ? (
                  <>
                    Coach & Trainer{' '}
                    <span className="bg-gradient-to-r from-primary via-emerald-400 to-amber-400 bg-clip-text text-transparent">
                      Pro Membership
                    </span>
                  </>
                ) : activeOrgType === 'COMMUNITY' ? (
                  <>
                    Sports Community &{' '}
                    <span className="bg-gradient-to-r from-primary via-emerald-400 to-amber-400 bg-clip-text text-transparent">
                      Society Portal
                    </span>
                  </>
                ) : (
                  <>
                    Venue Management &{' '}
                    <span className="bg-gradient-to-r from-primary via-emerald-400 to-amber-400 bg-clip-text text-transparent">
                      Premium ERP Plans
                    </span>
                  </>
                )}
              </h1>

              <p className="text-sm sm:text-base text-foreground/75 max-w-2xl mx-auto leading-relaxed">
                {activeOrgType === 'ORGANIZER'
                  ? 'Publish single or multi-stage tournaments with credits, activate live player auction consoles, stream OBS score overlays, and manage team championships.'
                  : activeOrgType === 'ACADEMY'
                    ? 'Scale your sports coaching academy, manage student rosters, schedule multi-coach batches, automate monthly fee collections, and track athlete performance across campuses.'
                    : activeOrgType === 'CLUB'
                      ? 'Streamline club rosters, team tryouts, match fees, equipment inventory, and player performance tracking.'
                      : activeOrgType === 'COACH'
                        ? 'Manage your private training clients, workout programs, session bookings, and track progress over time.'
                        : activeOrgType === 'COMMUNITY'
                          ? 'Build an active local sports community, schedule friendly weekend matches, and track leaderboard standings.'
                          : 'Scale your sports arenas, turf facilities, and court complexes with real-time slot grids, dynamic pricing, customer CRM, and prepaid player passes.'}
              </p>

              {/* Monthly vs Annual Billing Switcher */}
              <div className="pt-2">
                <div
                  className="inline-flex items-center justify-center p-1.5 rounded-2xl border shadow-lg"
                  style={{
                    backgroundColor: 'var(--athlon-surface)',
                    borderColor: 'var(--athlon-border)',
                  }}
                >
                  <button
                    onClick={() => setBillingCycle('monthly')}
                    className={`px-6 py-2 rounded-xl text-xs sm:text-sm font-black transition-all ${
                      billingCycle === 'monthly'
                        ? 'bg-primary text-black shadow-md scale-[1.02]'
                        : 'text-foreground/70 hover:text-foreground hover:bg-white/5'
                    }`}
                  >
                    Monthly Billing
                  </button>
                  <button
                    onClick={() => setBillingCycle('yearly')}
                    className={`px-6 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all ${
                      billingCycle === 'yearly'
                        ? 'bg-primary text-black shadow-md scale-[1.02]'
                        : 'text-foreground/70 hover:text-foreground hover:bg-white/5'
                    }`}
                  >
                    <span>Annual Billing</span>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md ${
                        billingCycle === 'yearly'
                          ? 'bg-black/20 text-black'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      Save ~20%
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* 4 Value Proposition Highlight Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto pt-2">
              <div
                className="p-4 rounded-2xl border flex items-center gap-3.5 shadow-xs"
                style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center text-primary shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-foreground/50 tracking-wider">Pricing</span>
                  <div className="text-xs font-black text-foreground">Zero Hidden Fees</div>
                </div>
              </div>

              <div
                className="p-4 rounded-2xl border flex items-center gap-3.5 shadow-xs"
                style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-foreground/50 tracking-wider">Evaluation</span>
                  <div className="text-xs font-black text-foreground">30-Day Free Trial</div>
                </div>
              </div>

              <div
                className="p-4 rounded-2xl border flex items-center gap-3.5 shadow-xs"
                style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-foreground/50 tracking-wider">Activation</span>
                  <div className="text-xs font-black text-foreground">Instant Go-Live</div>
                </div>
              </div>

              <div
                className="p-4 rounded-2xl border flex items-center gap-3.5 shadow-xs"
                style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border)' }}
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400 shrink-0">
                  <Headphones className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-foreground/50 tracking-wider">Assistance</span>
                  <div className="text-xs font-black text-foreground">24/7 Dedicated Ops</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-6 lg:px-8 py-10 space-y-12">
          {/* Vertical / Module Selector Dock (Responsive Grid, Never Clipped) */}
          <div
            className="p-2 rounded-2xl border shadow-sm"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <div className={`grid gap-2 ${
              dynamicCategories.length <= 4 
                ? 'grid-cols-2 md:grid-cols-4' 
                : dynamicCategories.length <= 6 
                  ? 'grid-cols-2 md:grid-cols-3 xl:grid-cols-6' 
                  : 'grid-cols-2 md:grid-cols-4 xl:grid-cols-8'
            }`}>
              {dynamicCategories.map((cat) => {
                const isSelected = activeOrgType === cat.id;
                const IconComponent = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveOrgType(cat.id as OrgCategory)}
                    className={`flex items-center justify-center gap-2 px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-primary text-black border-primary font-black shadow-md shadow-primary/20 scale-[1.01]'
                        : 'border-transparent text-foreground/75 hover:text-foreground hover:bg-white/5'
                    }`}
                  >
                    <IconComponent
                      className={`w-4 h-4 shrink-0 ${
                        isSelected ? 'text-black' : 'text-primary'
                      }`}
                    />
                    <span className="truncate">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Creation Paused Info Banner */}
          {activeModuleConfig && !activeModuleConfig.allowWorkspaceCreation && activeModuleConfig.status !== 'COMING_SOON' && (
            <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 flex items-center gap-3 text-xs text-amber-200">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="flex-1">
                {activeModuleConfig.maintenanceMessage || 'New workspace creation is temporarily paused for this vertical. Plan details are shown for informational reference.'}
              </span>
            </div>
          )}

          {/* Desktop Cards Grid */}
          {isLoadingPlans && !backendPlans[activeOrgType] ? (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={`skel-d-${i}`}
                  className="rounded-[28px] p-6 border animate-pulse space-y-4"
                  style={{
                    backgroundColor: 'var(--athlon-card)',
                    borderColor: 'var(--athlon-border)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-surface" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-4 bg-surface rounded-md w-1/2" />
                      <div className="h-3 bg-surface rounded-md w-1/3" />
                    </div>
                  </div>
                  <div className="h-3 bg-surface rounded-md w-full" />
                  <div className="h-8 bg-surface rounded-xl w-2/5 my-2" />
                  <div className="h-8 bg-surface rounded-xl w-full" />
                  <div className="h-10 bg-surface rounded-xl w-full mt-4" />
                </div>
              ))}
            </div>
          ) : currentPlans.length === 0 || activeModuleConfig?.status === 'COMING_SOON' ? (
            <div className="w-full rounded-[28px] border border-amber-500/30 bg-card p-12 text-center space-y-5 shadow-xl relative overflow-hidden">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-3xl">
                🚀
              </div>
              <div className="space-y-2 max-w-xl mx-auto">
                <span className="inline-block text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Coming Soon • Early Access
                </span>
                <h3 className="text-2xl font-black text-foreground">
                  {activeModuleConfig?.displayName || 'Module Engine'}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {activeModuleConfig?.description || 'Tailored features and operational toolsets are currently being crafted for this vertical.'}
                </p>
              </div>
              {activeModuleConfig?.maintenanceMessage && (
                <div className="max-w-lg mx-auto p-3.5 rounded-xl bg-surface border border-border text-xs text-text-muted">
                  {activeModuleConfig.maintenanceMessage}
                </div>
              )}
              {activeModuleConfig?.targetLaunchDate && (
                <p className="text-xs font-mono text-primary font-bold">
                  Target Launch: {new Date(activeModuleConfig.targetLaunchDate).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                </p>
              )}
              <div className="pt-2">
                <button
                  onClick={() => {
                    setModuleNoticeModal({
                      isOpen: true,
                      title: `${activeModuleConfig?.displayName || 'Module'} Waitlist`,
                      description: 'Thank you for your interest! You have been prioritized for early access invitations.',
                      badge: 'WAITLIST REGISTERED',
                      isComingSoon: true,
                    });
                  }}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 active:scale-95 transition-all cursor-pointer"
                >
                  Request Early Beta Invite
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
              {currentPlans.map((plan) => {
                const id = plan.id.toUpperCase();
                const name = plan.name.toUpperCase();
                const isPopular = plan.isPopular || id.includes('PRO') || name.includes('PRO');
                const isAuction = id.includes('AUCTION') || name.includes('AUCTION');
                const isBusiness = id.includes('BUSINESS') || id.includes('ELITE') || name.includes('BUSINESS') || name.includes('ELITE');
                const isEnterprise = id.includes('ENTERPRISE') || name.includes('ENTERPRISE');
                const isStarter = id.includes('STARTER') || name.includes('STARTER');

                // Determine Tier Personality & Aesthetics
                let IconComponent = Zap;
                let tagText = 'Standard Tier';
                let tagClass = 'bg-surface border border-foreground/10 text-foreground/70';
                let iconBoxClass = 'bg-surface text-foreground/70 border border-foreground/15';
                let cardBorderClass = 'border-border/80 hover:border-foreground/30';
                let glowGradient = 'from-white/[0.04] via-transparent to-transparent';
                let ctaButtonClass = 'bg-surface border border-foreground/15 text-foreground hover:bg-foreground hover:text-background';

                if (isAuction) {
                  IconComponent = Gavel;
                  tagText = 'Special Pass';
                  tagClass = 'bg-amber-500/15 text-amber-500 dark:text-amber-400 border border-amber-500/30';
                  iconBoxClass = 'bg-amber-500/10 text-amber-500 border border-amber-500/25';
                  cardBorderClass = 'border-amber-500/35 hover:border-amber-500/60 shadow-amber-500/5';
                  glowGradient = 'from-amber-500/15 via-transparent to-transparent';
                  ctaButtonClass = 'bg-amber-500 text-black font-black hover:brightness-105 shadow-md shadow-amber-500/20';
                } else if (isPopular) {
                  IconComponent = Crown;
                  tagText = '★ Flagship Tier';
                  tagClass = 'bg-primary text-black font-black shadow-xs';
                  iconBoxClass = 'bg-primary text-black font-black shadow-md shadow-primary/30';
                  cardBorderClass = 'border-primary ring-1 ring-primary/40 shadow-xl shadow-primary/10';
                  glowGradient = 'from-primary/20 via-primary/5 to-transparent';
                  ctaButtonClass = 'bg-primary text-black font-black hover:scale-[1.02] shadow-md shadow-primary/30';
                } else if (isBusiness) {
                  IconComponent = Trophy;
                  tagText = 'High Volume';
                  tagClass = 'bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 border border-emerald-500/30';
                  iconBoxClass = 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/25';
                  cardBorderClass = 'border-emerald-500/35 hover:border-emerald-500/60';
                  glowGradient = 'from-emerald-500/15 via-transparent to-transparent';
                  ctaButtonClass = 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 dark:text-emerald-400 hover:bg-emerald-500 hover:text-black font-black';
                } else if (isEnterprise) {
                  IconComponent = Sparkles;
                  tagText = 'Custom SLA';
                  tagClass = 'bg-purple-500/15 text-purple-500 dark:text-purple-400 border border-purple-500/30';
                  iconBoxClass = 'bg-purple-500/10 text-purple-500 border border-purple-500/25';
                  cardBorderClass = 'border-purple-500/35 hover:border-purple-500/60';
                  glowGradient = 'from-purple-500/15 via-transparent to-transparent';
                  ctaButtonClass = 'bg-purple-500/15 border border-purple-500/30 text-purple-500 dark:text-purple-400 hover:bg-purple-500 hover:text-white font-black';
                } else if (isStarter) {
                  IconComponent = Ticket;
                  tagText = 'Starter';
                  tagClass = 'bg-blue-500/15 text-blue-500 dark:text-blue-400 border border-blue-500/30';
                  iconBoxClass = 'bg-blue-500/10 text-blue-500 border border-blue-500/25';
                  cardBorderClass = 'border-blue-500/35 hover:border-blue-500/60';
                  glowGradient = 'from-blue-500/15 via-transparent to-transparent';
                  ctaButtonClass = 'bg-blue-500/10 border border-blue-500/25 text-blue-500 dark:text-blue-400 hover:bg-blue-500 hover:text-white font-black';
                }

                const price = plan.isSingleEvent
                  ? plan.monthlyPrice
                  : billingCycle === 'yearly'
                  ? plan.yearlyPrice
                  : plan.monthlyPrice;

                return (
                  <div
                    key={plan.id}
                    className={`w-full relative rounded-[28px] p-5 lg:p-6 flex flex-col justify-between transition-all duration-300 border overflow-hidden bg-card hover:shadow-xl hover:-translate-y-1 ${cardBorderClass}`}
                    style={{
                      backgroundColor: 'var(--athlon-card)',
                    }}
                  >
                    {/* Top Ambient Specular Aura */}
                    <div
                      className={`absolute top-0 inset-x-0 h-32 bg-gradient-to-b ${glowGradient} pointer-events-none rounded-t-[28px]`}
                    />

                    <div className="space-y-4 relative z-10">
                      {/* 1. Header: Icon + Name + Tag */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${iconBoxClass}`}>
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-sm font-black text-foreground uppercase tracking-tight truncate leading-none">
                              {plan.name}
                            </h3>
                            <span className={`inline-block mt-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${tagClass}`}>
                              {tagText}
                            </span>
                          </div>
                        </div>

                        {plan.commissionRate !== undefined && (
                          <span className="text-[10px] font-black text-primary bg-primary/10 border border-primary/25 px-2 py-0.5 rounded-full shrink-0">
                            {plan.commissionRate}% comm
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-xs text-foreground/60 leading-relaxed min-h-[32px] line-clamp-2">
                        {plan.description}
                      </p>

                      {/* 2. Price Section */}
                      <div
                        className="py-3 border-y space-y-0.5"
                        style={{ borderColor: 'var(--athlon-border)' }}
                      >
                        {plan.id === 'VENUE_ENTERPRISE' || plan.id === 'ACADEMY_ENTERPRISE' ? (
                          <div>
                            <div className="text-2xl lg:text-3xl font-black text-primary font-mono tracking-tight">Custom</div>
                            <div className="text-[10px] text-foreground/50 font-medium mt-0.5">Tailored enterprise contract</div>
                          </div>
                        ) : plan.monthlyPrice === 0 ? (
                          <div>
                            <div className="text-2xl lg:text-3xl font-black text-foreground font-mono tracking-tight">₹0</div>
                            <div className="text-[10px] text-foreground/50 font-medium mt-0.5">Free forever trial tier</div>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-baseline gap-1.5 flex-wrap">
                              <span className="text-2xl lg:text-3xl font-black text-foreground font-mono tracking-tight">
                                ₹{price.toLocaleString('en-IN')}
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-surface border border-foreground/10 text-foreground/60">
                                {plan.isSingleEvent
                                  ? '/ event'
                                  : billingCycle === 'yearly'
                                  ? '/ year'
                                  : '/ month'}
                              </span>
                            </div>
                            {billingCycle === 'yearly' && !plan.isSingleEvent && (
                              <div className="text-[10px] text-emerald-500 font-extrabold mt-1 flex items-center gap-1">
                                <Sparkles className="w-3 h-3 shrink-0" />
                                <span>Save ₹{((plan.monthlyPrice * 12) - plan.yearlyPrice).toLocaleString('en-IN')}/yr</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* 3. Quotas Preview Micro-Pills */}
                      {plan.quotas && plan.quotas.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                          {plan.quotas.slice(0, 3).map((q, idx) => (
                            <div
                              key={idx}
                              className="px-2.5 py-1 rounded-lg border text-[10px] font-bold bg-surface/60 flex items-center gap-1 text-foreground/80"
                              style={{ borderColor: 'var(--athlon-border)' }}
                            >
                              <span className="text-foreground/40 text-[9px] uppercase">{q.label}:</span>
                              <span className="font-mono font-black text-foreground">{q.value}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* 4. Top Capabilities Preview */}
                      <div className="space-y-1.5 text-xs text-foreground/75 pt-1">
                        {plan.highlightFeatures.slice(0, 2).map((f, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <div className="w-3.5 h-3.5 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shrink-0">
                              <Check className="w-2 h-2 stroke-[3]" />
                            </div>
                            <span className="truncate text-[11px] font-medium">{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 5. Action Row: Choose CTA + Details Button */}
                    <div className="pt-4 mt-2 border-t flex items-center gap-2 relative z-10" style={{ borderColor: 'var(--athlon-border)' }}>
                      <button
                        onClick={() => handleSelectPlan(plan)}
                        className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-95 ${ctaButtonClass}`}
                      >
                        <span>
                          {plan.id === 'VENUE_ENTERPRISE' || plan.id === 'ACADEMY_ENTERPRISE'
                            ? 'Contact Sales'
                            : plan.monthlyPrice === 0
                            ? 'Get Started'
                            : 'Choose Plan'}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                      </button>

                      <button
                        onClick={() => setPlanDetailsModal(plan)}
                        className="px-3.5 py-2.5 rounded-xl text-xs font-bold border hover:border-primary/50 text-foreground/80 hover:text-foreground bg-surface/60 hover:bg-surface transition-all flex items-center gap-1.5 active:scale-95 shrink-0 cursor-pointer"
                        style={{ borderColor: 'var(--athlon-border)' }}
                        title="View Full Plan Details & Capabilities"
                      >
                        <Eye className="w-3.5 h-3.5 text-primary" />
                        <span>Details</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Enterprise Concierge Banner */}
          <div
            className="p-8 rounded-[28px] border flex flex-col md:flex-row items-center justify-between gap-6"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider">
                <Crown className="w-3.5 h-3.5" />
                <span>Multi-Facility Franchise &amp; State Associations</span>
              </div>
              <h3 className="text-xl lg:text-2xl font-black text-foreground tracking-tight uppercase">
                Need a Custom Enterprise Contract?
              </h3>
              <p className="text-xs sm:text-sm text-foreground/70 leading-relaxed">
                Tailored SLA guarantees, dedicated account managers, custom ERP data migration, and on-premise hardware integrations for multi-city sports facilities.
              </p>
            </div>

            <a
              href="mailto:enterprise@athlonsports.in?subject=Athlon%20Enterprise%20Inquiry"
              className="px-6 py-3 rounded-2xl bg-primary text-black font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all whitespace-nowrap shrink-0"
            >
              <span>Talk to Enterprise Sales</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Feature Comparison Matrix */}
          <div
            className="border rounded-[28px] p-6 lg:p-8 shadow-sm"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-foreground uppercase tracking-tight">
                  Feature &amp; Quota Matrix
                </h2>
                <p className="text-xs sm:text-sm text-foreground/60 mt-1">
                  Comprehensive entitlement breakdown across all operational tiers.
                </p>
              </div>
              <button
                onClick={() => setShowComparison(!showComparison)}
                className="px-4 py-2 border text-xs font-bold text-foreground rounded-xl transition flex items-center gap-2 hover:bg-white/5 cursor-pointer"
                style={{
                  backgroundColor: 'var(--athlon-surface)',
                  borderColor: 'var(--athlon-border)',
                }}
              >
                <span>{showComparison ? 'Collapse Matrix' : 'Expand Full Matrix'}</span>
                {showComparison ? (
                  <ChevronUp className="w-4 h-4 text-primary" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-foreground/50" />
                )}
              </button>
            </div>

            {showComparison && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-foreground">
                  {activeOrgType === 'ORGANIZER' ? (
                    <>
                      <thead
                        className="text-[11px] uppercase tracking-wider text-foreground/60 border-b"
                        style={{
                          backgroundColor: 'var(--athlon-surface)',
                          borderColor: 'var(--athlon-border)',
                        }}
                      >
                        <tr>
                          <th className="py-3 px-4">Feature / Entitlement</th>
                          <th className="py-3 px-3 text-center">Free Trial</th>
                          <th className="py-3 px-3 text-center">Starter Pass</th>
                          <th className="py-3 px-3 text-center bg-primary/10 text-primary font-black">Professional</th>
                          <th className="py-3 px-3 text-center">Business</th>
                          <th className="py-3 px-3 text-center">Auction Add-on</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y font-medium" style={{ borderColor: 'var(--athlon-border)' }}>
                        <tr className="bg-surface/50 text-foreground font-bold">
                          <td colSpan={6} className="py-2.5 px-4 text-primary uppercase text-[10px] tracking-wider font-black">
                            Tournament Publication Credits &amp; Validity
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-4">Publication Credits</td>
                          <td className="py-2.5 px-3 text-center font-bold">1 Trial</td>
                          <td className="py-2.5 px-3 text-center font-bold">1 Credit</td>
                          <td className="py-2.5 px-3 text-center font-black text-primary bg-primary/5">5 Credits</td>
                          <td className="py-2.5 px-3 text-center font-bold text-emerald-500">15 Credits</td>
                          <td className="py-2.5 px-3 text-center text-foreground/40">—</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-4">Live Auction Activations</td>
                          <td className="py-2.5 px-3 text-center text-foreground/40">No</td>
                          <td className="py-2.5 px-3 text-center text-foreground/40">No</td>
                          <td className="py-2.5 px-3 text-center font-black text-amber-500 bg-primary/5">Eligible (₹499)</td>
                          <td className="py-2.5 px-3 text-center font-bold text-emerald-500">2 Included Free</td>
                          <td className="py-2.5 px-3 text-center font-bold text-amber-500">1 Event Pass</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-4">Max Participants / Event</td>
                          <td className="py-2.5 px-3 text-center">32</td>
                          <td className="py-2.5 px-3 text-center font-bold">128</td>
                          <td className="py-2.5 px-3 text-center font-black text-primary bg-primary/5">512</td>
                          <td className="py-2.5 px-3 text-center font-bold text-emerald-500">1,500</td>
                          <td className="py-2.5 px-3 text-center font-bold">Pool Limits</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-4">Max Categories</td>
                          <td className="py-2.5 px-3 text-center">2</td>
                          <td className="py-2.5 px-3 text-center font-bold">8</td>
                          <td className="py-2.5 px-3 text-center font-black text-primary bg-primary/5">30</td>
                          <td className="py-2.5 px-3 text-center font-bold text-emerald-500">75</td>
                          <td className="py-2.5 px-3 text-center font-bold">All Sets</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-4">Courts &amp; Officials Staff</td>
                          <td className="py-2.5 px-3 text-center">2 Courts / 2 Staff</td>
                          <td className="py-2.5 px-3 text-center font-bold">5 Courts / 5 Staff</td>
                          <td className="py-2.5 px-3 text-center font-black text-primary bg-primary/5">20 Courts / 20 Staff</td>
                          <td className="py-2.5 px-3 text-center font-bold text-emerald-500">60 Courts / 60 Staff</td>
                          <td className="py-2.5 px-3 text-center font-bold">Auction Control</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-4">Team Championship &amp; Bidding</td>
                          <td className="py-2.5 px-3 text-center text-foreground/40">—</td>
                          <td className="py-2.5 px-3 text-center text-foreground/40">—</td>
                          <td className="py-2.5 px-3 text-center font-black text-primary bg-primary/5">Tie Rubber Scoring</td>
                          <td className="py-2.5 px-3 text-center font-bold text-emerald-500">Full Suite + Squads</td>
                          <td className="py-2.5 px-3 text-center font-bold text-amber-500">Live Auction Console</td>
                        </tr>
                      </tbody>
                    </>
                  ) : activeOrgType === 'ACADEMY' ? (
                    <>
                      <thead
                        className="text-[11px] uppercase tracking-wider text-foreground/60 border-b"
                        style={{
                          backgroundColor: 'var(--athlon-surface)',
                          borderColor: 'var(--athlon-border)',
                        }}
                      >
                        <tr>
                          <th className="py-3 px-4">Feature / Entitlement</th>
                          <th className="py-3 px-3 text-center">Grassroots Free</th>
                          <th className="py-3 px-3 text-center">Starter</th>
                          <th className="py-3 px-3 text-center bg-primary/10 text-primary font-black">Professional</th>
                          <th className="py-3 px-3 text-center">Elite</th>
                          <th className="py-3 px-3 text-center">Enterprise</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y font-medium" style={{ borderColor: 'var(--athlon-border)' }}>
                        <tr className="bg-surface/50 text-foreground font-bold">
                          <td colSpan={6} className="py-2.5 px-4 text-primary uppercase text-[10px] tracking-wider font-black">
                            Trainee Capacity &amp; Infrastructure Limits
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-4">Max Enrolled Trainees</td>
                          <td className="py-2.5 px-3 text-center font-bold">15</td>
                          <td className="py-2.5 px-3 text-center font-bold">60</td>
                          <td className="py-2.5 px-3 text-center font-black text-primary bg-primary/5">250</td>
                          <td className="py-2.5 px-3 text-center font-bold text-emerald-500">750</td>
                          <td className="py-2.5 px-3 text-center font-bold text-primary">Unlimited</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-4">Coach Staff Logins</td>
                          <td className="py-2.5 px-3 text-center">1</td>
                          <td className="py-2.5 px-3 text-center font-bold">3</td>
                          <td className="py-2.5 px-3 text-center font-black text-primary bg-primary/5">10</td>
                          <td className="py-2.5 px-3 text-center font-bold text-emerald-500">30</td>
                          <td className="py-2.5 px-3 text-center font-bold text-primary">Unlimited</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-4">Campus Centres / Branches</td>
                          <td className="py-2.5 px-3 text-center">1</td>
                          <td className="py-2.5 px-3 text-center font-bold">1</td>
                          <td className="py-2.5 px-3 text-center font-black text-primary bg-primary/5">3</td>
                          <td className="py-2.5 px-3 text-center font-bold text-emerald-500">10</td>
                          <td className="py-2.5 px-3 text-center font-bold text-primary">Unlimited</td>
                        </tr>
                        <tr className="bg-surface/50 text-foreground font-bold">
                          <td colSpan={6} className="py-2.5 px-4 text-primary uppercase text-[10px] tracking-wider font-black">
                            Operations, Admissions &amp; Fee Management
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-4">Online Admissions &amp; Registration</td>
                          <td className="py-2.5 px-3 text-center text-foreground/40">—</td>
                          <td className="py-2.5 px-3 text-center font-bold text-foreground">Standard Form</td>
                          <td className="py-2.5 px-3 text-center font-black text-primary bg-primary/5">Custom Application</td>
                          <td className="py-2.5 px-3 text-center font-bold text-emerald-500">Full Portal</td>
                          <td className="py-2.5 px-3 text-center font-bold text-primary">Custom KYC</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-4">Fee Reminders &amp; Auto-Debit</td>
                          <td className="py-2.5 px-3 text-center text-foreground/40">Cash Receipts</td>
                          <td className="py-2.5 px-3 text-center font-bold text-foreground">WhatsApp Reminders</td>
                          <td className="py-2.5 px-3 text-center font-black text-primary bg-primary/5">Auto-Debit Links</td>
                          <td className="py-2.5 px-3 text-center font-bold text-emerald-500">Central Treasury</td>
                          <td className="py-2.5 px-3 text-center font-bold text-primary">ERP / Tally Sync</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-4">Coach Payroll &amp; Session Logs</td>
                          <td className="py-2.5 px-3 text-center text-foreground/40">—</td>
                          <td className="py-2.5 px-3 text-center text-foreground/40">—</td>
                          <td className="py-2.5 px-3 text-center font-black text-primary bg-primary/5">Payroll &amp; Check-ins</td>
                          <td className="py-2.5 px-3 text-center font-bold text-emerald-500">Geo-fenced Shifts</td>
                          <td className="py-2.5 px-3 text-center font-bold text-primary">HRMS Integration</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-4">Performance &amp; Video Reviews</td>
                          <td className="py-2.5 px-3 text-center text-foreground/40">—</td>
                          <td className="py-2.5 px-3 text-center font-bold text-foreground">Report Cards</td>
                          <td className="py-2.5 px-3 text-center font-black text-primary bg-primary/5">Video &amp; Benchmarks</td>
                          <td className="py-2.5 px-3 text-center font-bold text-emerald-500">Full Analytics Suite</td>
                          <td className="py-2.5 px-3 text-center font-bold text-primary">Custom Metrics</td>
                        </tr>
                      </tbody>
                    </>
                  ) : (
                    <>
                      <thead
                        className="text-[11px] uppercase tracking-wider text-foreground/60 border-b"
                        style={{
                          backgroundColor: 'var(--athlon-surface)',
                          borderColor: 'var(--athlon-border)',
                        }}
                      >
                        <tr>
                          <th className="py-3 px-4">Feature / Entitlement</th>
                          <th className="py-3 px-3 text-center">Free</th>
                          <th className="py-3 px-3 text-center">Starter</th>
                          <th className="py-3 px-3 text-center bg-primary/10 text-primary font-black">Professional</th>
                          <th className="py-3 px-3 text-center">Business</th>
                          <th className="py-3 px-3 text-center">Enterprise</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y font-medium" style={{ borderColor: 'var(--athlon-border)' }}>
                        <tr className="bg-surface/50 text-foreground font-bold">
                          <td colSpan={6} className="py-2.5 px-4 text-primary uppercase text-[10px] tracking-wider font-black">
                            Resource Quotas &amp; Marketplace
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-4">Max Facilities / Courts</td>
                          <td className="py-2.5 px-3 text-center">1</td>
                          <td className="py-2.5 px-3 text-center font-bold text-foreground">3</td>
                          <td className="py-2.5 px-3 text-center font-black text-primary bg-primary/5">10</td>
                          <td className="py-2.5 px-3 text-center font-bold text-emerald-500">25</td>
                          <td className="py-2.5 px-3 text-center font-bold text-primary">Unlimited</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-4">Staff Logins (incl. Owner)</td>
                          <td className="py-2.5 px-3 text-center">1</td>
                          <td className="py-2.5 px-3 text-center">2</td>
                          <td className="py-2.5 px-3 text-center font-black text-primary bg-primary/5">5</td>
                          <td className="py-2.5 px-3 text-center font-bold text-emerald-500">15</td>
                          <td className="py-2.5 px-3 text-center font-bold text-primary">Custom</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-4">Marketplace Booking Commission</td>
                          <td className="py-2.5 px-3 text-center">8.0%</td>
                          <td className="py-2.5 px-3 text-center">6.0%</td>
                          <td className="py-2.5 px-3 text-center font-black text-primary bg-primary/5">4.5%</td>
                          <td className="py-2.5 px-3 text-center font-bold text-emerald-500">3.5%</td>
                          <td className="py-2.5 px-3 text-center font-bold text-primary">2.0%</td>
                        </tr>
                      </tbody>
                    </>
                  )}
                </table>
              </div>
            )}
          </div>

          {/* Frequently Asked Questions */}
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">
                Frequently Asked Questions
              </h2>
              <p className="text-xs text-foreground/60">
                Clear answers regarding limits, commissions, billing, and cancellations.
              </p>
            </div>

            <div className="space-y-3">
              {activeFaqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="border rounded-2xl overflow-hidden transition-all shadow-xs"
                    style={{
                      backgroundColor: 'var(--athlon-card)',
                      borderColor: 'var(--athlon-border)',
                    }}
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full p-4 sm:p-5 text-left font-bold text-sm text-foreground flex justify-between items-center gap-3 hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <span>{faq.question}</span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-primary shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-foreground/40 shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <div
                        className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs text-foreground/70 leading-relaxed border-t pt-3"
                        style={{ borderColor: 'var(--athlon-border)' }}
                      >
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </main>

        {/* Desktop Branded Footer */}
        <footer
          className="mt-20 border-t pt-12 pb-10 text-xs"
          style={{
            backgroundColor: 'var(--athlon-card)',
            borderColor: 'var(--athlon-border)',
          }}
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black">
                  <Crown className="w-4 h-4" />
                </div>
                <span className="font-black text-foreground text-sm tracking-wide">ATHLON SUBSCRIPTION SUITE</span>
              </div>

              <div className="flex items-center gap-8 text-foreground/60 font-medium">
                <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                <Link href="/venues" className="hover:text-primary transition-colors">Venues</Link>
                <Link href="/academies" className="hover:text-primary transition-colors">Academies</Link>
                <Link href="/tournaments" className="hover:text-primary transition-colors">Tournaments</Link>
                <Link href="/live-score" className="hover:text-primary transition-colors">Live Scoring</Link>
                <Link href="/login" className="hover:text-primary transition-colors">Portal Login</Link>
              </div>
            </div>

            <div className="border-t pt-6 flex items-center justify-between text-foreground/40 text-[11px]" style={{ borderColor: 'var(--athlon-border)' }}>
              <p>© 2026 Athlon Sports Platform. All rights reserved.</p>
              <p>Transparent SaaS pricing for modern sports infrastructure.</p>
            </div>
          </div>
        </footer>
      </div>

      {/* Plan Details Modal Dialog */}
      {planDetailsModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div
            className="w-full max-w-2xl rounded-[32px] border bg-card p-6 sm:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto shadow-2xl"
            style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b pb-4" style={{ borderColor: 'var(--athlon-border)' }}>
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm shrink-0">
                  <Crown className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xl font-black text-foreground uppercase tracking-tight">
                      {planDetailsModal.name}
                    </h3>
                    {planDetailsModal.badge && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary text-black">
                        {planDetailsModal.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-foreground/60 mt-1">
                    {planDetailsModal.subtitle || planDetailsModal.description}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setPlanDetailsModal(null)}
                className="w-9 h-9 rounded-xl border flex items-center justify-center text-foreground/60 hover:text-foreground hover:bg-white/5 active:scale-95 transition-all shrink-0"
                style={{ borderColor: 'var(--athlon-border)' }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Price & Billing Summary */}
            <div
              className="p-4.5 rounded-2xl border flex items-center justify-between flex-wrap gap-4 bg-surface/50"
              style={{ borderColor: 'var(--athlon-border)' }}
            >
              <div>
                <span className="text-[10px] font-black uppercase text-foreground/40 tracking-wider">
                  Plan Investment
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl lg:text-3xl font-black text-foreground font-mono">
                    {planDetailsModal.id === 'VENUE_ENTERPRISE' || planDetailsModal.id === 'ACADEMY_ENTERPRISE'
                      ? 'Custom SLA'
                      : planDetailsModal.monthlyPrice === 0
                      ? '₹0 Free'
                      : `₹${(planDetailsModal.isSingleEvent
                          ? planDetailsModal.monthlyPrice
                          : billingCycle === 'yearly'
                          ? planDetailsModal.yearlyPrice
                          : planDetailsModal.monthlyPrice
                        ).toLocaleString('en-IN')}`}
                  </span>
                  <span className="text-xs font-bold text-foreground/60">
                    {planDetailsModal.isSingleEvent
                      ? '/ event'
                      : billingCycle === 'yearly'
                      ? '/ year (billed annually)'
                      : '/ month'}
                  </span>
                </div>
              </div>

              {planDetailsModal.commissionRate !== undefined && (
                <div className="px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/25 text-xs font-black text-primary">
                  {planDetailsModal.commissionRate}% Platform Fee
                </div>
              )}
            </div>

            {/* Operating Capacity Quotas */}
            {planDetailsModal.quotas && planDetailsModal.quotas.length > 0 && (
              <div className="space-y-3">
                <div className="text-xs font-black uppercase tracking-wider text-foreground/50 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-primary" />
                  <span>Operating Capacity Quotas</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {planDetailsModal.quotas.map((q, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border bg-surface/30 space-y-1"
                      style={{ borderColor: 'var(--athlon-border)' }}
                    >
                      <div className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider truncate">
                        {q.label}
                      </div>
                      <div className="text-sm font-black text-foreground font-mono truncate">
                        {q.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Capabilities & Included Features */}
            <div className="space-y-3">
              <div className="text-xs font-black uppercase tracking-wider text-foreground/50 flex items-center gap-1.5">
                <Check className="w-4 h-4 text-primary stroke-[3]" />
                <span>All Included Capabilities &amp; Features</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {planDetailsModal.highlightFeatures.map((f, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border bg-surface/30 flex items-start gap-2.5 text-xs text-foreground/85"
                    style={{ borderColor: 'var(--athlon-border)' }}
                  >
                    <div className="w-4 h-4 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shrink-0 mt-0.5">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <span className="leading-snug">{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--athlon-border)' }}>
              <button
                onClick={() => setPlanDetailsModal(null)}
                className="px-4 py-2.5 rounded-xl border text-xs font-bold text-foreground/70 hover:text-foreground hover:bg-surface transition-all active:scale-95"
                style={{ borderColor: 'var(--athlon-border)' }}
              >
                Close
              </button>

              <button
                onClick={() => {
                  const p = planDetailsModal;
                  setPlanDetailsModal(null);
                  handleSelectPlan(p);
                }}
                className="px-6 py-2.5 rounded-xl bg-primary text-black font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md hover:scale-105 active:scale-95 transition-all"
              >
                <span>
                  {planDetailsModal.id === 'VENUE_ENTERPRISE' || planDetailsModal.id === 'ACADEMY_ENTERPRISE'
                    ? 'Contact Enterprise Sales'
                    : planDetailsModal.monthlyPrice === 0
                    ? 'Get Started Free'
                    : `Choose ${planDetailsModal.name}`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade / Subscription Modal (Responsive for Desktop & Mobile) */}
      {isUpgradeModalOpen && selectedPlanForUpgrade && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-t-[26px] sm:rounded-2xl w-full max-w-md p-5 sm:p-6 space-y-4 shadow-2xl relative text-foreground">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-foreground">
                  Upgrade to {selectedPlanForUpgrade.name} Plan
                </h3>
                <p className="text-[11px] text-text-muted mt-0.5">
                  Select the workspace you want to upgrade.
                </p>
              </div>
              <button
                onClick={() => setIsUpgradeModalOpen(false)}
                className="text-text-muted hover:text-foreground p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {upgradeError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs rounded-xl">
                {upgradeError}
              </div>
            )}

            {upgradeSuccess ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
                <h4 className="text-base font-bold text-foreground">Plan Activated Successfully!</h4>
                <p className="text-xs text-text-muted">Redirecting to your workspace dashboard...</p>
              </div>
            ) : (
              <div className="space-y-4 text-sm">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-text-muted">Select Workspace</label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsUpgradeModalOpen(false);
                        router.push(`/setup-workspace?type=${activeOrgType}&plan=${selectedPlanForUpgrade.id}&billing=${billingCycle}`);
                      }}
                      className="text-[11px] font-semibold text-primary hover:underline"
                    >
                      + Create New Workspace Instead
                    </button>
                  </div>
                  <select
                    value={selectedOrgId}
                    onChange={(e) => setSelectedOrgId(e.target.value)}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-foreground text-sm focus:outline-none focus:border-primary"
                  >
                    {matchingOrgs.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-3 bg-surface rounded-xl border border-border space-y-1.5 text-xs text-text-secondary">
                  <div className="flex justify-between">
                    <span>Selected Plan:</span>
                    <strong className="text-foreground">{selectedPlanForUpgrade.name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Billing Term:</span>
                    <strong className="text-foreground capitalize">
                      {selectedPlanForUpgrade.isSingleEvent ? 'Per Event' : billingCycle}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Amount:</span>
                    <strong className="text-primary font-bold font-mono">
                      ₹{(selectedPlanForUpgrade.isSingleEvent
                        ? selectedPlanForUpgrade.monthlyPrice
                        : billingCycle === 'yearly'
                          ? selectedPlanForUpgrade.yearlyPrice
                          : selectedPlanForUpgrade.monthlyPrice
                      ).toLocaleString('en-IN')}
                    </strong>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsUpgradeModalOpen(false)}
                    className="px-4 py-2 bg-surface hover:bg-surface-hover text-foreground border border-border text-xs font-semibold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={submittingUpgrade}
                    onClick={handleConfirmUpgrade}
                    className="px-4 py-2 bg-primary hover:bg-primary-hover disabled:opacity-50 text-primary-foreground text-xs font-semibold rounded-xl transition"
                  >
                    {submittingUpgrade ? 'Activating...' : 'Confirm Upgrade'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Dynamic Module Notice / Early Access Modal */}
      {moduleNoticeModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-md rounded-[28px] border p-6 sm:p-8 space-y-5 shadow-2xl relative"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <span className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full ${
                moduleNoticeModal.isComingSoon ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              }`}>
                {moduleNoticeModal.badge}
              </span>
              <button
                onClick={() => setModuleNoticeModal((prev) => ({ ...prev, isOpen: false }))}
                className="w-7 h-7 rounded-full bg-surface border border-border flex items-center justify-center text-text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-black text-foreground">
                {moduleNoticeModal.title}
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                {moduleNoticeModal.description}
              </p>
            </div>

            <button
              onClick={() => setModuleNoticeModal((prev) => ({ ...prev, isOpen: false }))}
              className="w-full py-3 rounded-xl bg-primary text-black font-black text-xs uppercase tracking-wider shadow-md hover:bg-primary-hover active:scale-95 transition-all cursor-pointer"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
