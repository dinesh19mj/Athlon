'use client';

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useWorkspaceStore, WorkspaceType, Organization } from '@/lib/store/useWorkspaceStore';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useOrgModulesStore } from '@/lib/store/useOrgModulesStore';
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
  Crown,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Shield
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
  quotas: { label: string; value: string }[];
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

function buildModuleFromPlanOrType(planCode?: string | null, type?: WorkspaceType | null): WorkspaceModule {
  const pCode = (planCode || '').toUpperCase();
  const orgType = type || (pCode.startsWith('VENUE_') ? 'COURT' : (pCode.startsWith('TOUR_') || pCode.startsWith('TOURNAMENT_')) ? 'ORGANIZER' : pCode.startsWith('ACADEMY_') ? 'ACADEMY' : pCode.startsWith('CLUB_') ? 'CLUB' : pCode.startsWith('COACH_') ? 'COACH' : pCode.startsWith('COMMUNITY_') ? 'COMMUNITY' : 'COURT');

  if (pCode === 'VENUE_STARTER') {
    return {
      id: 'plan-venue-starter',
      type: 'COURT',
      title: 'Starter Venue License',
      subtitle: 'Dynamic Pricing & Recurring Series',
      description: 'Up to 3 facilities with peak/off-peak pricing and recurring academy bookings.',
      badge: 'SMALL CLUBS',
      icon: MapPin,
      colorScheme: {
        accent: 'from-cyan-500 to-blue-600',
        text: 'text-cyan-400',
        bg: 'bg-cyan-500/10',
        border: 'border-cyan-500/30',
        badgeBg: 'bg-cyan-500/15',
        badgeText: 'text-cyan-300 font-bold',
      },
      quotas: [
        { label: 'Courts', value: '3 Units' },
        { label: 'Staff', value: '2 Logins' },
        { label: 'Commission', value: '6.0%' },
      ],
      features: [
        'Up to 3 Bookable Facilities',
        '2 Staff Logins (incl. Owner)',
        'Dynamic Peak & Weekend Tariffs',
        'Recurring Academy Series Reservations',
        'Automated Digital Invoices & Receipts',
        '6.0% Marketplace Commission Rate',
      ],
      pricingOptions: [
        { label: 'Monthly License Plan', value: 'monthly', price: 499, formattedPrice: '₹499', description: 'Billed monthly with flexible cancellation' },
        { label: 'Annual License Plan', value: 'yearly', price: 4999, formattedPrice: '₹4,999', description: 'Billed annually (~20% savings)', savingsBadge: 'Save ₹989' },
      ],
    };
  }

  if (pCode === 'VENUE_PROFESSIONAL') {
    return {
      id: 'plan-venue-professional',
      type: 'COURT',
      title: 'Professional Venue License',
      subtitle: 'Complete ERP, CRM & Prepaid Wallets',
      description: 'Customer loyalty tracking, prepaid play passes, POS billing & 10 facilities.',
      badge: 'MOST POPULAR',
      icon: MapPin,
      colorScheme: {
        accent: 'from-indigo-500 to-emerald-400',
        text: 'text-indigo-400',
        bg: 'bg-indigo-500/10',
        border: 'border-indigo-500/40',
        badgeBg: 'bg-gradient-to-r from-indigo-500 to-emerald-400',
        badgeText: 'text-black font-black',
      },
      quotas: [
        { label: 'Courts', value: '10 Units' },
        { label: 'Staff', value: '5 Logins' },
        { label: 'Commission', value: '4.5%' },
      ],
      features: [
        'Up to 10 Bookable Facilities',
        '5 Staff Logins (Owner + Managers + Reception)',
        'Customer CRM & VIP Spend Tracking',
        'Prepaid Play Passes & Membership Wallets',
        'POS Counter Sales & Equipment Rentals',
        'Expense Tracking & Audit Statements',
        'Reduced 4.5% Marketplace Commission',
      ],
      pricingOptions: [
        { label: 'Monthly License Plan', value: 'monthly', price: 999, formattedPrice: '₹999', description: 'Billed monthly with flexible cancellation' },
        { label: 'Annual License Plan', value: 'yearly', price: 9999, formattedPrice: '₹9,999', description: 'Billed annually (~20% savings)', savingsBadge: 'Save ₹1,989' },
      ],
    };
  }

  if (pCode === 'VENUE_BUSINESS') {
    return {
      id: 'plan-venue-business',
      type: 'COURT',
      title: 'Business Venue License',
      subtitle: 'Multi-Branch Operations & 25 Facilities',
      description: 'Up to 3 branches, 25 facilities, staff shift rosters & 3.5% commission.',
      badge: 'MULTI-BRANCH',
      icon: MapPin,
      colorScheme: {
        accent: 'from-emerald-500 to-teal-500',
        text: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/40',
        badgeBg: 'bg-emerald-500/20',
        badgeText: 'text-emerald-300 font-bold',
      },
      quotas: [
        { label: 'Courts', value: '25 Units' },
        { label: 'Staff', value: '15 Logins' },
        { label: 'Commission', value: '3.5%' },
      ],
      features: [
        'Multi-Branch Unified Switcher',
        'Up to 25 Bookable Facilities Across 3 Venues',
        '15 Staff Logins with Shift Rosters & Payroll',
        'Priority Marketplace Search Discovery',
        'Full Customer CRM & Prepaid Wallets',
        'Reduced 3.5% Marketplace Commission',
      ],
      pricingOptions: [
        { label: 'Monthly License Plan', value: 'monthly', price: 2499, formattedPrice: '₹2,499', description: 'Billed monthly' },
        { label: 'Annual License Plan', value: 'yearly', price: 24999, formattedPrice: '₹24,999', description: 'Billed annually (~20% savings)', savingsBadge: 'Save ₹4,989' },
      ],
    };
  }

  if (pCode === 'VENUE_ENTERPRISE') {
    return {
      id: 'plan-venue-enterprise',
      type: 'COURT',
      title: 'Enterprise Venue License',
      subtitle: 'Franchise Chains & Sports Stadiums',
      description: 'Unlimited facilities, custom integrations, lowest 2.0% commission & dedicated SLA.',
      badge: 'STADIUM SLA',
      icon: MapPin,
      colorScheme: {
        accent: 'from-purple-500 to-pink-500',
        text: 'text-purple-400',
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/40',
        badgeBg: 'bg-purple-500/20',
        badgeText: 'text-purple-300 font-bold',
      },
      quotas: [
        { label: 'Courts', value: 'Unlimited' },
        { label: 'Staff', value: 'Custom' },
        { label: 'Commission', value: '2.0%' },
      ],
      features: [
        'Unlimited Bookable Facilities & Turfs',
        'Custom Role-Based Staff Matrix',
        'Dedicated Account Manager & Phone SLA',
        'Lowest 2.0% Marketplace Commission',
        'Direct API Webhooks & Financial Sync',
      ],
      pricingOptions: [
        { label: 'Custom Enterprise Contract', value: 'yearly', price: 0, formattedPrice: 'Custom', description: 'Tailored enterprise contract' },
      ],
    };
  }

  if (pCode === 'ACADEMY_FREE' || (orgType === 'ACADEMY' && pCode === '')) {
    return {
      id: 'plan-academy-free',
      type: 'ACADEMY',
      title: 'Grassroots Free Academy',
      subtitle: 'Free Coaching Roster & Daily Attendance',
      description: 'Student roster up to 15 trainees, daily attendance register, cash fee logging, and public academy profile.',
      badge: '15 STUDENTS',
      icon: GraduationCap,
      colorScheme: {
        accent: 'from-slate-700 to-slate-900',
        text: 'text-slate-300',
        bg: 'bg-slate-800/40',
        border: 'border-slate-700',
        badgeBg: 'bg-slate-800',
        badgeText: 'text-slate-200 font-bold',
      },
      quotas: [
        { label: 'Students', value: '15 Max' },
        { label: 'Coaches', value: '1 Login' },
        { label: 'Campuses', value: '1 Centre' },
      ],
      features: [
        'Active Trainee Roster for up to 15 Students',
        '1 Head Coach / Owner Login',
        'Daily Student Attendance Register',
        'Cash & Offline Fee Collection Ledger',
        'Public Academy Profile on Athlon Discovery',
      ],
      pricingOptions: [
        { label: 'Free Forever', value: 'monthly', price: 0, formattedPrice: '₹0', description: 'Forever free tier for individual trainers' },
        { label: 'Annual Free', value: 'yearly', price: 0, formattedPrice: '₹0', description: 'Forever free tier for individual trainers' },
      ],
    };
  }

  if (pCode === 'ACADEMY_STARTER') {
    return {
      id: 'plan-academy-starter',
      type: 'ACADEMY',
      title: 'Starter Academy License',
      subtitle: 'Batch Schedules & Online Admissions',
      description: 'Up to 60 students, 3 coaches, multi-batch timetable scheduling, and digital fee payment reminders.',
      badge: '60 STUDENTS',
      icon: GraduationCap,
      colorScheme: {
        accent: 'from-blue-500 to-cyan-500',
        text: 'text-blue-400',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/30',
        badgeBg: 'bg-blue-500/15',
        badgeText: 'text-blue-300 font-bold',
      },
      quotas: [
        { label: 'Students', value: '60 Max' },
        { label: 'Coaches', value: '3 Logins' },
        { label: 'Campuses', value: '1 Centre' },
      ],
      features: [
        'Up to 60 Active Trainees with Digital Profiles',
        '3 Coach Staff Logins with Batch Allocation',
        'Online Student Admissions & Registration Forms',
        'Multi-Batch Scheduling, Timetables & Rosters',
        'Automated Monthly Fee Reminders via WhatsApp',
        'Downloadable Student Performance & Skill Cards',
      ],
      pricingOptions: [
        { label: 'Monthly License Plan', value: 'monthly', price: 999, formattedPrice: '₹999', description: 'Billed monthly' },
        { label: 'Annual License Plan', value: 'yearly', price: 9999, formattedPrice: '₹9,999', description: 'Billed annually (~20% savings)', savingsBadge: 'Save ₹1,989' },
      ],
    };
  }

  if (pCode === 'ACADEMY_PRO') {
    return {
      id: 'plan-academy-pro',
      type: 'ACADEMY',
      title: 'Professional Academy License',
      subtitle: 'Multi-Coach Competitive Training Centers',
      description: 'Up to 250 students, 3 campuses, coach payroll, fitness benchmarks & automated fee auto-debit.',
      badge: 'MOST POPULAR',
      icon: GraduationCap,
      colorScheme: {
        accent: 'from-indigo-500 to-purple-500',
        text: 'text-indigo-400',
        bg: 'bg-indigo-500/10',
        border: 'border-indigo-500/40',
        badgeBg: 'bg-gradient-to-r from-indigo-500 to-purple-500',
        badgeText: 'text-white font-bold',
      },
      quotas: [
        { label: 'Students', value: '250 Max' },
        { label: 'Coaches', value: '10 Logins' },
        { label: 'Campuses', value: '3 Centres' },
      ],
      features: [
        'Up to 250 Active Trainees across 3 Campuses',
        '10 Coach Staff Accounts with Check-in Logs',
        'Multi-Campus Branch Switcher & Unified Management',
        'Coach Payroll Calculation & Session Shift Logs',
        'Custom Fitness, Agility & Skill Benchmarks',
        'Automated UPI Fee Payment Collection Links',
      ],
      pricingOptions: [
        { label: 'Monthly License Plan', value: 'monthly', price: 2499, formattedPrice: '₹2,499', description: 'Billed monthly' },
        { label: 'Annual License Plan', value: 'yearly', price: 24999, formattedPrice: '₹24,999', description: 'Billed annually (~20% savings)', savingsBadge: 'Save ₹4,989' },
      ],
    };
  }

  if (pCode === 'ACADEMY_BUSINESS') {
    return {
      id: 'plan-academy-business',
      type: 'ACADEMY',
      title: 'Elite Academy License',
      subtitle: 'Multi-Sport High-Performance Academies',
      description: 'Up to 750 students, 10 campuses, 30 coaches, shift rostering, geo-fenced attendance & centralized treasury.',
      badge: 'MULTI-CAMPUS',
      icon: GraduationCap,
      colorScheme: {
        accent: 'from-emerald-500 to-teal-500',
        text: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/40',
        badgeBg: 'bg-emerald-500/20',
        badgeText: 'text-emerald-300 font-bold',
      },
      quotas: [
        { label: 'Students', value: '750 Max' },
        { label: 'Coaches', value: '30 Logins' },
        { label: 'Campuses', value: '10 Centres' },
      ],
      features: [
        'Up to 750 Active Trainees across 10 Campuses',
        '30 Staff Coach Accounts with Shift Rostering',
        'Multi-Sport Academy Support',
        'Centralized Headquarter Financials & Revenue P&L',
        'Geo-Fenced Mobile Coach Attendance Check-in',
        'Priority Listing & Verified Badge on Athlon',
      ],
      pricingOptions: [
        { label: 'Monthly License Plan', value: 'monthly', price: 4999, formattedPrice: '₹4,999', description: 'Billed monthly' },
        { label: 'Annual License Plan', value: 'yearly', price: 49999, formattedPrice: '₹49,999', description: 'Billed annually (~20% savings)', savingsBadge: 'Save ₹9,989' },
      ],
    };
  }

  if (pCode === 'TOURNAMENT_FREE' || pCode === 'TOURNAMENT_TRIAL' || (orgType === 'ORGANIZER' && (pCode === '' || pCode === 'FREE' || pCode === 'TOURNAMENT_FREE'))) {
    return {
      id: 'plan-tournament-free',
      type: 'ORGANIZER',
      title: 'Free Tournament Organizer',
      subtitle: 'Host 1 Trial Tournament',
      description: 'Host 1 trial tournament with up to 32 players, single knockout and round-robin draws.',
      badge: '1 TRIAL EVENT',
      icon: Trophy,
      isSingleEvent: true,
      colorScheme: {
        accent: 'from-slate-700 to-slate-900',
        text: 'text-slate-300',
        bg: 'bg-slate-800/40',
        border: 'border-slate-700',
        badgeBg: 'bg-slate-800',
        badgeText: 'text-slate-200 font-bold',
      },
      quotas: [
        { label: 'Credits', value: '1 Event' },
        { label: 'Players', value: 'Max 32' },
        { label: 'Categories', value: 'Up to 2' },
      ],
      features: [
        '1 Trial Tournament Publication Credit',
        'Up to 32 Unique Participants',
        'Single Knockout & Round-Robin Draws',
        'Up to 2 Categories & 2 Courts',
        'Basic Schedule & Match Sheet Printing',
        'Free Forever Organizer Trial',
      ],
      pricingOptions: [
        { label: 'Free Trial Pass', value: 'monthly', price: 0, formattedPrice: '₹0', description: 'Host 1 trial tournament with up to 32 players' },
        { label: 'Free Trial Pass (Annual)', value: 'yearly', price: 0, formattedPrice: '₹0', description: 'Host 1 trial tournament with up to 32 players' },
      ],
    };
  }

  if (pCode === 'TOURNAMENT_STARTER') {
    return {
      id: 'plan-tournament-starter',
      type: 'ORGANIZER',
      title: 'Tournament Starter Pass',
      subtitle: '1 Complete Tournament Credit',
      description: 'Publish 1 tournament with online registrations, UPI payment verification, and doubles partner linking.',
      badge: '1 CREDIT',
      icon: Trophy,
      isSingleEvent: true,
      colorScheme: {
        accent: 'from-cyan-500 to-blue-500',
        text: 'text-cyan-400',
        bg: 'bg-cyan-500/10',
        border: 'border-cyan-500/30',
        badgeBg: 'bg-cyan-500/15',
        badgeText: 'text-cyan-300 font-bold',
      },
      quotas: [
        { label: 'Credits', value: '1 Event' },
        { label: 'Players', value: 'Max 128' },
        { label: 'Categories', value: 'Up to 8' },
      ],
      features: [
        '1 Tournament Publication Credit (12 Months Validity)',
        'Up to 128 Unique Participants per Tournament',
        'Up to 8 Categories & 5 Court Resources',
        'Online Registration & UPI Payment Verification',
        'Doubles Partner Linking & Automated Draws',
        'Live Scoring & Basic OBS Broadcast Overlays',
      ],
      pricingOptions: [
        { label: '1 Complete Event Pass', value: 'monthly', price: 499, formattedPrice: '₹499', description: 'One-time publication pass (valid 12 months)' },
        { label: '1 Complete Event Pass (Annual)', value: 'yearly', price: 499, formattedPrice: '₹499', description: 'One-time publication pass (valid 12 months)' },
      ],
    };
  }

  if (pCode === 'TOURNAMENT_PRO') {
    return {
      id: 'plan-tournament-pro',
      type: 'ORGANIZER',
      title: 'Tournament Professional Pack',
      subtitle: '5 Tournaments + Live Auction Eligible',
      description: '5 tournament publication credits with advanced seeding, OBS broadcast overlays, team championships, and live auction eligibility.',
      badge: '5 CREDITS',
      icon: Trophy,
      isSingleEvent: true,
      colorScheme: {
        accent: 'from-emerald-500 to-teal-500',
        text: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/40',
        badgeBg: 'bg-gradient-to-r from-indigo-500 to-emerald-400',
        badgeText: 'text-slate-950 font-black',
      },
      quotas: [
        { label: 'Credits', value: '5 Events' },
        { label: 'Players', value: 'Max 512' },
        { label: 'Categories', value: 'Up to 30' },
      ],
      features: [
        '5 Tournament Publication Credits (12 Months Validity)',
        'Up to 512 Unique Participants per Tournament',
        'Up to 30 Categories, 20 Courts & 20 Officials',
        'Advanced Seeding & Rest Interval Enforcement',
        'Team Championship & Rubber Tie Scoring Matrix',
        'Live Auction Eligible (Full, Partial & No Auction)',
      ],
      pricingOptions: [
        { label: '5 Tournament Credits Pack', value: 'monthly', price: 1999, formattedPrice: '₹1,999', description: '5 tournament credits package (valid 12 months)' },
        { label: '5 Tournament Credits Pack (Annual)', value: 'yearly', price: 1999, formattedPrice: '₹1,999', description: '5 tournament credits package (valid 12 months)' },
      ],
    };
  }

  if (pCode === 'TOURNAMENT_BUSINESS' || pCode === 'TOURNAMENT_ENTERPRISE') {
    return {
      id: 'plan-tournament-business',
      type: 'ORGANIZER',
      title: 'Tournament Enterprise Pack',
      subtitle: '15 Events + 2 Auction Passes + ERP',
      description: 'High-volume organizers with 2 free included live auction activations, complete organizer ERP, and inventory stock tracking.',
      badge: '15 CREDITS • ERP',
      icon: Trophy,
      isSingleEvent: true,
      colorScheme: {
        accent: 'from-purple-500 to-indigo-500',
        text: 'text-purple-400',
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/40',
        badgeBg: 'bg-gradient-to-r from-purple-500 to-indigo-500',
        badgeText: 'text-white font-black',
      },
      quotas: [
        { label: 'Credits', value: '15 Events' },
        { label: 'Players', value: 'Max 1,500' },
        { label: 'Auctions', value: '2 Included' },
      ],
      features: [
        '15 Tournament Publication Credits (12 Months Validity)',
        '2 Free Included Live Player Auction Activations',
        'Up to 1,500 Participants Across 75 Categories',
        'Complete Organizer ERP & Equipment Inventory Stock Tracking',
        'Advanced Seeding, Draw Generator & OBS Live Overlays',
        'Multi-Court Scheduling & Staff Permission Matrix',
      ],
      pricingOptions: [
        { label: '15 Tournaments Enterprise Pack', value: 'monthly', price: 4999, formattedPrice: '₹4,999', description: '15 tournament credits package (valid 12 months)' },
        { label: '15 Tournaments Enterprise Pack (Annual)', value: 'yearly', price: 4999, formattedPrice: '₹4,999', description: '15 tournament credits package (valid 12 months)' },
      ],
    };
  }

  if (pCode === 'TOURNAMENT_AUCTION_PASS' || pCode === 'LIVE_AUCTION_PASS' || pCode === 'AUCTION_PASS_PLAN' || pCode.includes('AUCTION')) {
    return {
      id: 'plan-auction-activation',
      type: 'ORGANIZER',
      title: 'Live Auction Pass',
      subtitle: 'Real-Time Player Bidding Console',
      description: 'Activate real-time live auction bidding room for your franchise tournament or team championship.',
      badge: 'SPECIAL PASS',
      icon: Trophy,
      isSingleEvent: true,
      colorScheme: {
        accent: 'from-amber-500 to-orange-500',
        text: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/40',
        badgeBg: 'bg-amber-500/20',
        badgeText: 'text-amber-300 font-bold',
      },
      quotas: [
        { label: 'Auctions', value: '1 Live Room' },
        { label: 'Players', value: 'Unlimited' },
        { label: 'Franchises', value: 'Unlimited' },
      ],
      features: [
        '1 Real-Time Live Player Auction Activation Pass',
        'Franchise Owner Virtual Bidding Console & Purse Management',
        'Spectator Live Big-Screen Board & Projector Mode',
        'Unsold / Sold / RTM Rules Engine & Category Player Draft',
        'OBS Live Broadcast Overlay for Streaming Auctions',
      ],
      pricingOptions: [
        { label: '1 Live Auction Pass', value: 'monthly', price: 1499, formattedPrice: '₹1,499', description: 'One-time activation pass per tournament auction' },
        { label: '1 Live Auction Pass (Annual)', value: 'yearly', price: 1499, formattedPrice: '₹1,499', description: 'One-time activation pass per tournament auction' },
      ],
    };
  }

  if (orgType === 'ORGANIZER') {
    return {
      id: 'plan-tournament-starter',
      type: 'ORGANIZER',
      title: 'Tournament Starter Pass',
      subtitle: '1 Complete Tournament Credit',
      description: 'Publish 1 tournament with online registrations, UPI payment verification, and doubles partner linking.',
      badge: '1 CREDIT',
      icon: Trophy,
      isSingleEvent: true,
      colorScheme: {
        accent: 'from-cyan-500 to-blue-500',
        text: 'text-cyan-400',
        bg: 'bg-cyan-500/10',
        border: 'border-cyan-500/30',
        badgeBg: 'bg-cyan-500/15',
        badgeText: 'text-cyan-300 font-bold',
      },
      quotas: [
        { label: 'Credits', value: '1 Event' },
        { label: 'Players', value: 'Max 128' },
        { label: 'Categories', value: 'Up to 8' },
      ],
      features: [
        '1 Tournament Publication Credit (12 Months Validity)',
        'Up to 128 Unique Participants per Tournament',
        'Up to 8 Categories & 5 Court Resources',
        'Online Registration & UPI Payment Verification',
        'Doubles Partner Linking & Automated Draws',
        'Live Scoring & Basic OBS Broadcast Overlays',
      ],
      pricingOptions: [
        { label: '1 Complete Event Pass', value: 'monthly', price: 499, formattedPrice: '₹499', description: 'One-time publication pass (valid 12 months)' },
        { label: '1 Complete Event Pass (Annual)', value: 'yearly', price: 499, formattedPrice: '₹499', description: 'One-time publication pass (valid 12 months)' },
      ],
    };
  }

  if (pCode.startsWith('CLUB') || orgType === 'CLUB') {
    return {
      id: 'plan-club-access-pass',
      type: 'CLUB',
      title: 'Club Batch Pass',
      subtitle: 'Court Batch & Member Operations Pass',
      description: 'First 30 days free, then ₹249/mo. Manage court batches, member attendance, shared kitty, fees & leaderboards.',
      badge: '30 DAYS FREE TRIAL',
      icon: Users,
      colorScheme: {
        accent: 'from-emerald-500 to-teal-500',
        text: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/40',
        badgeBg: 'bg-gradient-to-r from-emerald-500 to-teal-400',
        badgeText: 'text-slate-950 font-black',
      },
      quotas: [
        { label: 'Members', value: 'Max 100' },
        { label: 'Managers', value: '3 Admins' },
        { label: 'Free Trial', value: '30 Days' },
      ],
      features: [
        '30-Day All-Inclusive Free Trial (No Upfront Payment)',
        'Court Batch & Slot Scheduling Calendar',
        'Member RSVP & Live Check-in Attendance',
        'Shared Kitty & Expense Splitter',
        'Member Fee Dues & Payment Tracking',
        'Intra-Club Match Scoring & ELO Leaderboard',
        'Shuttlecock & Equipment Inventory Tracking',
      ],
      pricingOptions: [
        { label: 'Monthly Pass (30-Day Trial Included)', value: 'monthly', price: 0, formattedPrice: '₹0 for 30 Days', description: 'Then ₹249/month recurring with flexible cancellation' },
        { label: 'Annual Pass (30-Day Trial Included)', value: 'yearly', price: 2490, formattedPrice: '₹2,490 / Year', description: 'Billed annually after 30-day trial (~17% savings)', savingsBadge: 'Save ₹498' },
      ],
    };
  }

  if (pCode === 'COACH_PRO') {
    return {
      id: 'plan-coach-pro',
      type: 'COACH',
      title: 'Coach Professional Pass',
      subtitle: 'Competitive & High-Volume Trainers',
      description: 'Up to 50 trainees, trainee drill cards, fitness test benchmarks, automated fee payment reminders & verified discovery badge.',
      badge: '50 TRAINEES • PRO',
      icon: UserCheck,
      colorScheme: {
        accent: 'from-orange-500 to-amber-500',
        text: 'text-orange-400',
        bg: 'bg-orange-500/10',
        border: 'border-orange-500/40',
        badgeBg: 'bg-gradient-to-r from-amber-500 to-orange-500',
        badgeText: 'text-slate-950 font-black',
      },
      quotas: [
        { label: 'Trainees', value: '50 Max' },
        { label: 'Packages', value: 'Unlimited' },
        { label: 'Profile', value: 'Verified' },
      ],
      features: [
        'Up to 50 Active Trainees with Full Profiles',
        'Unlimited 1-on-1 & Small Group Booking Slots',
        'Trainee Drill Cards & Fitness Test Benchmarks',
        'Automated Monthly Fee WhatsApp Reminders',
        'Unlimited Coaching Rate Cards & Packages',
        'Trainee Video Review & Performance Feedback',
        'Verified Coach Badge on Athlon Marketplace',
      ],
      pricingOptions: [
        { label: 'Monthly License Plan', value: 'monthly', price: 499, formattedPrice: '₹499', description: 'Billed monthly with flexible cancellation' },
        { label: 'Annual License Plan', value: 'yearly', price: 4990, formattedPrice: '₹4,990', description: 'Billed annually (~17% savings)', savingsBadge: 'Save ₹998' },
      ],
    };
  }

  if (pCode.startsWith('COACH') || orgType === 'COACH') {
    return {
      id: 'plan-coach-starter',
      type: 'COACH',
      title: 'Coach Starter Pass',
      subtitle: 'Solo Coaches & Personal Trainers',
      description: 'First 30 days free, then ₹299/mo. Manage personal coaching calendar, slot bookings, student roster & cash/digital fee logging.',
      badge: '30 DAYS FREE TRIAL',
      icon: UserCheck,
      colorScheme: {
        accent: 'from-amber-500 to-orange-500',
        text: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/40',
        badgeBg: 'bg-amber-500/15',
        badgeText: 'text-amber-300 font-bold',
      },
      quotas: [
        { label: 'Trainees', value: '15 Max' },
        { label: 'Packages', value: '3 Cards' },
        { label: 'Free Trial', value: '30 Days' },
      ],
      features: [
        'First 30 Days 100% Free Trial',
        'Up to 15 Active Trainees with Profiles',
        'Personal Coaching Calendar & Slot Scheduling',
        'Daily Check-in & Session Attendance',
        'Up to 3 Coaching Fee Packages & Rate Cards',
        'Cash & Digital UPI Payment Receipts',
        'Coach Public Discovery Profile',
      ],
      pricingOptions: [
        { label: 'Monthly Pass (30-Day Trial Included)', value: 'monthly', price: 0, formattedPrice: '₹0 for 30 Days', description: 'Then ₹299/month recurring with flexible cancellation' },
        { label: 'Annual Pass (30-Day Trial Included)', value: 'yearly', price: 2990, formattedPrice: '₹2,990 / Year', description: 'Billed annually after 30-day trial (~17% savings)', savingsBadge: 'Save ₹598' },
      ],
    };
  }

  if (pCode === 'COMMUNITY_PRO') {
    return {
      id: 'plan-community-pro',
      type: 'COMMUNITY',
      title: 'Community Pro Pass',
      subtitle: 'Active Sports Clubs & Growing Societies',
      description: 'Up to 250 members, shared kitty & expense splitter, friendly match scoreboards, leaderboards, WhatsApp alerts, and 5 coordinators.',
      badge: '250 MEMBERS • PRO',
      icon: Users,
      colorScheme: {
        accent: 'from-blue-500 to-sky-500',
        text: 'text-blue-400',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/40',
        badgeBg: 'bg-gradient-to-r from-sky-500 to-blue-600',
        badgeText: 'text-white font-black',
      },
      quotas: [
        { label: 'Members', value: '250 Max' },
        { label: 'Admins', value: '5 Coordinators' },
        { label: 'Kitty', value: 'Expense Splitter' },
      ],
      features: [
        'Up to 250 Active Community Members Roster',
        'Shared Expense Kitty & Treasury Splitter',
        'Friendly Match Scoring & Live Season Leaderboard',
        'Automated WhatsApp Event Reminder Broadcasts',
        'Up to 5 Community Coordinators & Admins',
        'Member Attendance History & Activity Analytics',
        'Priority Community Discovery & Verified Badge',
      ],
      pricingOptions: [
        { label: 'Monthly License Plan', value: 'monthly', price: 199, formattedPrice: '₹199', description: 'Billed monthly with flexible cancellation' },
        { label: 'Annual License Plan', value: 'yearly', price: 1990, formattedPrice: '₹1,990', description: 'Billed annually (~17% savings)', savingsBadge: 'Save ₹398' },
      ],
    };
  }

  if (pCode.startsWith('COMMUNITY') || orgType === 'COMMUNITY') {
    return {
      id: 'plan-community-free',
      type: 'COMMUNITY',
      title: 'Community Free Pass',
      subtitle: 'Social Groups & Apartment Societies',
      description: '₹0 forever free for up to 50 active members. Organize unlimited pickup sessions, RSVP check-ins, social announcements, photos, and polls.',
      badge: 'FOREVER FREE',
      icon: Users,
      colorScheme: {
        accent: 'from-sky-500 to-blue-500',
        text: 'text-sky-400',
        bg: 'bg-sky-500/10',
        border: 'border-sky-500/40',
        badgeBg: 'bg-sky-500/15',
        badgeText: 'text-sky-300 font-bold',
      },
      quotas: [
        { label: 'Members', value: '50 Members' },
        { label: 'Admins', value: '2 Coordinators' },
        { label: 'Sessions', value: 'Unlimited RSVPs' },
      ],
      features: [
        '₹0 Forever Free (No Credit Card or Expiry)',
        'Up to 50 Active Community Members Roster',
        'Unlimited Pickup Games & Social Play Sessions',
        'Real-Time RSVP & Interactive Check-in Tracking',
        'Community Feed, Pinned Notices & Photo Gallery',
        'Interactive Member Polls & Vote Counters',
        '2 Community Admins & Event Coordinators',
      ],
      pricingOptions: [
        { label: 'Forever Free Plan', value: 'monthly', price: 0, formattedPrice: '₹0 / Month', description: 'No expiry date and no credit card required' },
        { label: 'Forever Free Plan (Annual)', value: 'yearly', price: 0, formattedPrice: '₹0 / Year', description: 'No expiry date and no credit card required' },
      ],
    };
  }

  // Default to VENUE_FREE for COURT / general
  return {
    id: 'plan-venue-free',
    type: orgType,
    title: 'Free Venue License',
    subtitle: 'Zero Setup Cost for Individual Courts',
    description: 'Basic public listing, 15-minute live calendar & walk-in recording.',
    badge: 'STARTER VENUE',
    icon: MapPin,
    colorScheme: {
      accent: 'from-slate-700 to-slate-900',
      text: 'text-slate-300',
      bg: 'bg-slate-800/40',
      border: 'border-slate-700',
      badgeBg: 'bg-slate-800',
      badgeText: 'text-slate-200 font-bold',
    },
    quotas: [
      { label: 'Courts', value: '1 Unit' },
      { label: 'Staff', value: '1 Login' },
      { label: 'Commission', value: '8.0%' },
    ],
    features: [
      '1 Bookable Court / Facility',
      '1 Staff Account (Owner Access)',
      '15-Minute Live Visual Calendar',
      '10-Minute Cart Concurrency Hold',
      'Front-Desk Walk-in Booking & Receipts',
      '8.0% Marketplace Booking Commission',
    ],
    pricingOptions: [
      { label: 'Free License', value: 'monthly', price: 0, formattedPrice: '₹0', description: 'Forever free listing on Athlon Marketplace' },
      { label: 'Annual License', value: 'yearly', price: 0, formattedPrice: '₹0', description: 'Forever free listing on Athlon Marketplace' },
    ],
  };
}

function generateSlug(text: string): string {
  const clean = text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return clean || 'my-workspace';
}

function SetupWorkspaceForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const packageId = searchParams.get('packageId');
  const planParam = searchParams.get('plan') || searchParams.get('planCode');
  const typeParam = (searchParams.get('type') as WorkspaceType) || (planParam?.startsWith('VENUE_') ? 'COURT' : (planParam?.startsWith('TOURNAMENT_') || planParam?.startsWith('TOUR_')) ? 'ORGANIZER' : planParam?.startsWith('ACADEMY_') ? 'ACADEMY' : planParam?.startsWith('CLUB_') ? 'CLUB' : planParam?.startsWith('COACH_') ? 'COACH' : planParam?.startsWith('COMMUNITY_') ? 'COMMUNITY' : null);
  const initialBilling = (searchParams.get('billing') as BillingCycle) || 'monthly';

  const { addOrganization, setActiveWorkspace } = useWorkspaceStore();
  const { userEmail, userId, isAuthenticated } = useAuthStore();

  const [selectedModule, setSelectedModule] = useState<WorkspaceModule | null>(null);
  const [orgName, setOrgName] = useState('');
  const [selectedBilling, setSelectedBilling] = useState<BillingCycle>(initialBilling);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isFeaturesOpen, setIsFeaturesOpen] = useState(false);

  const { fetchModules, getModule } = useOrgModulesStore();

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  const moduleConfig = selectedModule ? getModule(selectedModule.type) : undefined;
  const isCreationBlocked = Boolean(
    moduleConfig && (!moduleConfig.isEnabled || !moduleConfig.allowWorkspaceCreation || moduleConfig.status === 'DISABLED' || moduleConfig.status === 'COMING_SOON')
  );

  useEffect(() => {
    if (!packageId && !planParam && !typeParam) {
      router.push('/home/subscription');
      return;
    }

    if (planParam || typeParam) {
      const mod = buildModuleFromPlanOrType(planParam, typeParam);
      setSelectedModule(mod);
      setSelectedBilling(initialBilling === 'yearly' ? 'yearly' : 'monthly');
      setIsLoading(false);
      return;
    }

    const fetchPackage = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050'}/api/identity/subscriptions/plans/venue`
        ).catch(() => null);
        const json = response ? await response.json() : null;
        const venuePlans = json?.data || [];
        const found = venuePlans.find((p: any) => p.planUuid === packageId || p.planCode === packageId) || venuePlans[0];
        const pkg = found ? {
          uuid: found.planUuid,
          name: found.name,
          description: found.description,
          price: found.monthlyPrice,
          features: JSON.stringify(Object.keys(found.features || {}).filter((k: string) => found.features[k])),
        } : null;

        if (pkg) {
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
            badgeText: 'text-primary font-bold',
          };
          let defaultFeatures = ['Instant Activation', 'Multi-Sport Engine', 'Real-time Cloud Sync'];
          let quotas = [
            { label: 'Cloud Sync', value: 'Live' },
            { label: 'Support', value: '24/7' },
            { label: 'License', value: 'Active' },
          ];

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
            quotas = [
              { label: 'Pass', value: '1 Mega Tie' },
              { label: 'Console', value: 'Live Auction' },
              { label: 'Overlays', value: 'YouTube 4K' },
            ];
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
              badgeText: 'text-cyan-600 dark:text-cyan-300 font-bold',
            };
            quotas = [
              { label: 'Event', value: '1 Pass' },
              { label: 'Draws', value: 'Unlimited' },
              { label: 'Console', value: 'Digital Umpire' },
            ];
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
              badgeText: 'text-emerald-600 dark:text-emerald-300 font-bold',
            };
            quotas = [
              { label: 'Tournaments', value: 'Unlimited' },
              { label: 'Courts', value: 'Matrix' },
              { label: 'Stream', value: 'YouTube Live' },
            ];
            defaultFeatures = [
              'Unlimited Knockout & League Tournaments / Mo',
              'Live YouTube Stream Score Overlay',
              'Automated Knockout & League Fixtures',
              'Digital Umpire Console for All Courts',
              'Multi-Court Control Room & Schedule Matrix',
            ];
          } else if (nameLower.includes('coach') || nameLower.includes('trainer')) {
            type = 'COACH';
            icon = UserCheck;
            subtitle = 'Private Coaching, Trainee Roster & Rate Cards';
            badge = 'COACH & TRAINER';
            colorScheme = {
              accent: 'from-amber-500 to-orange-600',
              text: 'text-amber-500 dark:text-amber-400',
              bg: 'bg-amber-500/10',
              border: 'border-amber-500/30',
              badgeBg: 'bg-amber-500/15',
              badgeText: 'text-amber-600 dark:text-amber-300 font-bold',
            };
            quotas = [
              { label: 'Trainees', value: 'Roster' },
              { label: 'Check-in', value: 'Daily Queue' },
              { label: 'Payments', value: 'Direct UPI' },
            ];
            defaultFeatures = [
              'Single-Sport Profile & Credentials Showcase',
              'Trainee Enrolment & Skill Level Tracker',
              'Custom Coaching Packages & Rate Cards',
              'Daily Training Schedule & Check-in Queue',
              'Direct Fee Collection & Payment Receipts',
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
              badgeText: 'text-blue-600 dark:text-blue-300 font-bold',
            };
            quotas = [
              { label: 'Students', value: 'Roster' },
              { label: 'Payroll', value: 'Coaches' },
              { label: 'Invoices', value: 'Auto Monthly' },
            ];
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
              badgeText: 'text-purple-600 dark:text-purple-300 font-bold',
            };
            quotas = [
              { label: 'Members', value: 'Passports' },
              { label: 'Courts', value: 'Calendar' },
              { label: 'Finances', value: 'Audit Log' },
            ];
            defaultFeatures = [
              'Member Directory & Digital Pass',
              'Court & Facility Booking Calendar',
              'Internal Club Tournaments & Ladders',
              'Financial Accounts & Revenue Reports',
            ];
          } else if (nameLower.includes('court') || nameLower.includes('venue')) {
            type = 'COURT';
            icon = MapPin;
            subtitle = 'Sports Facility, Turf & Arena Operations Hub';
            badge = 'VENUE MANAGER';
            colorScheme = {
              accent: 'from-rose-500 to-pink-500',
              text: 'text-rose-500 dark:text-rose-400',
              bg: 'bg-rose-500/10',
              border: 'border-rose-500/30',
              badgeBg: 'bg-rose-500/15',
              badgeText: 'text-rose-600 dark:text-rose-300 font-bold',
            };
            quotas = [
              { label: 'Courts', value: '1 Unit' },
              { label: 'Staff', value: '1 Login' },
              { label: 'Commission', value: '8.0%' },
            ];
            defaultFeatures = [
              'Real-Time Visual Booking Grid & Slot Matrix',
              'Multi-Sport Facilities & Dynamic Peak Tiers',
              '10-Minute Cart Hold & Instant UPI Checkout',
              'Recurring Series with Conflict Detection',
              'Admin Maintenance Blocks & Revenue Analytics',
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
            quotas,
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
          router.push('/home/subscription');
        }
      } catch (error) {
        console.error('Failed to fetch package:', error);
        router.push('/home/subscription');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPackage();
  }, [packageId, planParam, typeParam, initialBilling, router]);

  const handleCreateWorkspace = async () => {
    if (!selectedModule || !orgName.trim() || isCreating || isCreationBlocked) return;
    setErrorMessage(null);

    if (isCreationBlocked) {
      setErrorMessage(
        moduleConfig?.maintenanceMessage ||
        (moduleConfig?.status === 'COMING_SOON'
          ? 'This organization vertical is launching soon and workspace creation is not yet open.'
          : 'Workspace creation for this organization vertical is temporarily paused.')
      );
      return;
    }

    if (!isAuthenticated || !userId) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }

    setIsCreating(true);

    try {
      const isRealUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(selectedModule.id);

      // Derive clean planCode (e.g. VENUE_FREE, VENUE_STARTER, VENUE_PRO)
      const derivedPlanCode = planParam || (selectedModule.id.startsWith('plan-')
        ? selectedModule.id.replace('plan-', '').toUpperCase().replace(/-/g, '_')
        : undefined);

      const orgRes = await OrganizationService.create({
        name: orgName.trim(),
        type: selectedModule.type,
        planCode: derivedPlanCode,
        planUuid: isRealUuid ? selectedModule.id : undefined,
        billingCycle: selectedBilling.toUpperCase(),
      });

      if (orgRes && orgRes.data && orgRes.data.uuid) {
        const newOrg: Organization = {
          id: orgRes.data.uuid,
          name: orgRes.data.name || orgName.trim(),
          type: (orgRes.data.type as WorkspaceType) || selectedModule.type,
        };

        addOrganization(newOrg);
        setActiveWorkspace(orgRes.data.uuid);
        router.push(`/org/${orgRes.data.uuid}/dashboard`);
      } else {
        throw new Error(orgRes?.message || 'Failed to create organization. Please try again.');
      }
    } catch (err: any) {
      console.error('API Create Organization failed:', err);
      const apiMsg = err?.data?.message || err?.message || 'Failed to create organization. Please ensure your account has active session credentials.';
      setErrorMessage(apiMsg);
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mb-3" />
        <h3 className="text-sm font-bold text-foreground">Preparing Workspace Configurator...</h3>
        <p className="text-[11px] text-text-muted mt-0.5">Retrieving licensed package permissions</p>
      </div>
    );
  }

  if (!selectedModule) return null;

  const currentPricing =
    selectedModule.pricingOptions.find((p) => p.value === selectedBilling) ||
    selectedModule.pricingOptions[0];

  const Icon = selectedModule.icon;
  const isFreePlan = currentPricing.price === 0;

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* ── Background Ambient Glow ────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[650px] h-[350px] bg-primary/10 rounded-full blur-[120px] dark:bg-primary/15" />
        <div className="absolute top-[40%] -right-20 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] dark:bg-emerald-500/10" />
      </div>

      {/* ========================================================================= */}
      {/* ── MOBILE VIEW (< md) ─────────────────────────────────────────────────── */}
      {/* Ultra-Tactile Athletic Arena Workspace Provisioning Engine               */}
      {/* ========================================================================= */}
      <div className="block md:hidden w-full max-w-lg mx-auto px-3.5 sm:px-4 pt-3 pb-44 space-y-3.5 relative z-10">

        {/* 1. Hero License Specular Glare Card */}
        <section
          className="relative w-full rounded-[26px] overflow-hidden border p-4.5 shadow-xl transition-all"
          style={{
            backgroundColor: 'var(--athlon-card)',
            borderColor: 'var(--athlon-border)',
            boxShadow: '0 12px 32px -6px var(--athlon-shadow, rgba(0, 0, 0, 0.25)), 0 0 0 1px var(--athlon-border)',
          }}
        >
          {/* Specular Glare Arc */}
          <div className="absolute inset-x-0 top-0 h-[40%] bg-gradient-to-b from-white/[0.12] dark:from-white/[0.04] via-transparent to-transparent pointer-events-none z-0" />

          {/* Header row */}
          <div className="relative z-10 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl ${selectedModule.colorScheme.bg} border ${selectedModule.colorScheme.border} flex items-center justify-center shrink-0 shadow-inner`}
              >
                <Icon className={`w-6 h-6 ${selectedModule.colorScheme.text}`} />
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span
                    className={`text-[9.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${selectedModule.colorScheme.badgeBg} ${selectedModule.colorScheme.badgeText} border ${selectedModule.colorScheme.border}`}
                  >
                    {selectedModule.badge}
                  </span>
                  <span className="text-[10px] font-bold text-text-muted">
                    {moduleConfig?.categoryLabel || moduleConfig?.displayName || (selectedModule.type === 'COURT' ? '🏟️ VENUE ERP' : selectedModule.type === 'ORGANIZER' ? '🏆 TOURNAMENTS' : selectedModule.type === 'ACADEMY' ? '🎓 ACADEMY' : selectedModule.type === 'CLUB' ? '👥 CLUB' : selectedModule.type === 'COMMUNITY' ? '👥 COMMUNITY' : '⚡ COACH')}
                  </span>
                </div>
                <h2 className="text-xl font-black text-foreground tracking-tight leading-tight">
                  {selectedModule.title}
                </h2>
              </div>
            </div>
          </div>

          <p className="text-[11.5px] text-text-secondary leading-relaxed mt-2.5 relative z-10 font-medium">
            {selectedModule.subtitle}
          </p>

          {/* Signature 3-Cell Glass Telemetry Strip */}
          {selectedModule.quotas && selectedModule.quotas.length > 0 && (
            <div
              className="grid grid-cols-3 divide-x rounded-2xl p-2.5 mt-3.5 border backdrop-blur-md relative z-10"
              style={{
                backgroundColor: 'var(--athlon-surface)',
                borderColor: 'var(--athlon-border)',
              }}
            >
              {selectedModule.quotas.map((q, idx) => (
                <div key={idx} className={`flex flex-col items-center justify-center ${idx > 0 ? 'border-border' : ''}`}>
                  <span className="text-xs font-black text-foreground font-mono leading-none">
                    {q.value}
                  </span>
                  <span className="text-[8.5px] font-bold text-text-muted uppercase tracking-wider mt-1">
                    {q.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Collapsible Features Accordion */}
          <div className="mt-3.5 pt-3 border-t border-border/80 relative z-10">
            <button
              type="button"
              onClick={() => setIsFeaturesOpen(!isFeaturesOpen)}
              className="w-full flex items-center justify-between text-left py-1 text-xs font-bold text-text-muted hover:text-foreground transition-colors"
            >
              <span className="flex items-center gap-1.5 text-primary text-[11px] font-black uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Included Features ({selectedModule.features.length})</span>
              </span>
              <span className="flex items-center gap-1 text-[11px] text-text-muted">
                <span>{isFeaturesOpen ? 'Collapse' : 'View all'}</span>
                {isFeaturesOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </span>
            </button>

            {isFeaturesOpen ? (
              <div className="space-y-2 pt-2.5">
                {selectedModule.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-[11px] text-foreground/90 font-medium">
                    <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <span className="leading-snug">{feat}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-1.5 pt-1.5">
                {selectedModule.features.slice(0, 2).map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-[11px] text-text-secondary font-medium truncate">
                    <div className="w-3 h-3 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                      <Check className="w-2 h-2 stroke-[3]" />
                    </div>
                    <span className="truncate">{feat}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* 2. Step 1: Workspace Name Card */}
        <section
          className="rounded-2xl border p-4 shadow-sm relative overflow-hidden transition-all"
          style={{
            backgroundColor: 'var(--athlon-card)',
            borderColor: 'var(--athlon-border)',
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <label className="text-[11px] font-black uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-primary/15 text-primary flex items-center justify-center text-[9px] font-mono font-black">
                1
              </span>
              <span>Organization / Venue Name</span>
              <span className="text-rose-500">*</span>
            </label>
            <span className="text-[10px] font-mono text-text-muted">
              {orgName.length}/50
            </span>
          </div>

          <div className="relative mt-1">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
              <Building2 className="w-4 h-4 text-primary" />
            </div>
            <input
              type="text"
              maxLength={50}
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder={
                selectedModule.type === 'COURT'
                  ? 'e.g. PlayZone Badminton Arena'
                  : selectedModule.type === 'ORGANIZER'
                    ? 'e.g. South India Championship 2026'
                    : selectedModule.type === 'ACADEMY'
                      ? 'e.g. Apex Smashers Academy'
                      : 'e.g. Downtown Sports Club'
              }
              className="w-full pl-10 pr-3 py-3 bg-surface border border-border rounded-xl text-sm font-bold text-foreground placeholder:text-text-muted/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              autoFocus
            />
          </div>

          {/* Real-time Domain Slug Preview */}
          {orgName.trim() && (
            <div
              className="mt-3 p-2.5 rounded-xl border flex items-center justify-between gap-2"
              style={{
                backgroundColor: 'var(--athlon-surface)',
                borderColor: 'var(--athlon-border)',
              }}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Globe className="w-3.5 h-3.5 text-primary shrink-0" />
                <div className="text-[11px] truncate">
                  <span className="text-text-muted">athlon.sport/org/</span>
                  <strong className="text-primary font-black font-mono">
                    {generateSlug(orgName)}
                  </strong>
                </div>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[8.5px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 shrink-0">
                Live URL
              </span>
            </div>
          )}
        </section>

        {/* 3. Step 2: Billing Term Selector (if multiple options available) */}
        {selectedModule.pricingOptions.length > 1 && !selectedModule.isSingleEvent && (
          <section
            className="rounded-2xl border p-4 shadow-sm relative overflow-hidden transition-all"
            style={{
              backgroundColor: 'var(--athlon-card)',
              borderColor: 'var(--athlon-border)',
            }}
          >
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-primary/15 text-primary flex items-center justify-center text-[9px] font-mono font-black">
                  2
                </span>
                <span>Select License Term</span>
              </label>
              <span className="text-[10px] font-bold text-text-muted">
                Flexible Cancel
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {selectedModule.pricingOptions.map((opt) => {
                const isSelected = selectedBilling === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSelectedBilling(opt.value)}
                    className={`p-3 rounded-xl border-2 text-left relative flex flex-col justify-between transition-all active:scale-[0.98] ${isSelected
                      ? 'border-primary bg-primary/10 shadow-sm ring-1 ring-primary/30'
                      : 'border-border bg-surface'
                      }`}
                  >
                    {opt.savingsBadge && (
                      <div className="absolute top-2 right-2">
                        <span className="px-1.5 py-0.2 rounded text-[8px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Save ~20%
                        </span>
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <div
                          className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${isSelected
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-card'
                            }`}
                        >
                          {isSelected && <Check className="w-2 h-2 stroke-[3]" />}
                        </div>
                        <span className="text-xs font-extrabold text-foreground capitalize">
                          {opt.value}
                        </span>
                      </div>
                      <div className="text-base font-black text-foreground font-mono mt-1">
                        {opt.formattedPrice}
                        <span className="text-[9.5px] font-bold text-text-muted font-sans ml-1">
                          /{opt.value === 'yearly' ? 'yr' : 'mo'}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* 4. Root Workspace Administrator Pod */}
        <div
          className="rounded-2xl border p-3 flex items-center gap-3"
          style={{
            backgroundColor: 'var(--athlon-surface)',
            borderColor: 'var(--athlon-border)',
          }}
        >
          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <UserCheck className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block">
              Root Workspace Administrator
            </span>
            <span className="text-xs font-bold text-foreground truncate block">
              {userEmail || `User #${userId || 'Primary'}`}
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[9px] font-black uppercase tracking-wider shrink-0">
            Authenticated
          </span>
        </div>

        {/* 5. Mobile Order Summary Strip */}
        <div
          className="rounded-2xl border p-3.5 space-y-2 text-xs"
          style={{
            backgroundColor: 'var(--athlon-card)',
            borderColor: 'var(--athlon-border)',
          }}
        >
          <div className="flex justify-between text-text-secondary text-[11px]">
            <span>License Subscription</span>
            <span className="font-bold text-foreground">{currentPricing.formattedPrice}</span>
          </div>
          <div className="flex justify-between text-text-secondary text-[11px]">
            <span>Instant Workspace Activation</span>
            <span className="font-bold text-emerald-500">FREE (₹0)</span>
          </div>
          <div className="flex justify-between text-text-secondary text-[11px]">
            <span>Applicable Taxes & GST</span>
            <span className="text-text-muted">Included</span>
          </div>
          <div className="pt-2 border-t border-border flex items-center justify-between text-xs font-black text-foreground">
            <span>Total Due Today:</span>
            <span className="text-lg font-mono text-primary font-black">
              {currentPricing.formattedPrice}
            </span>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Module Lifecycle / Maintenance Warning */}
        {isCreationBlocked && (
          <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-200 space-y-1.5 shadow-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <h4 className="font-bold text-xs text-foreground">
                {moduleConfig?.status === 'COMING_SOON'
                  ? `${moduleConfig.displayName} Launching Soon`
                  : 'Workspace Onboarding Paused'}
              </h4>
            </div>
            <p className="text-[11px] text-text-secondary leading-relaxed">
              {moduleConfig?.maintenanceMessage ||
                (moduleConfig?.status === 'COMING_SOON'
                  ? 'This vertical is currently in development. Self-service workspace creation will open with general availability.'
                  : 'Workspace creation for this module is temporarily paused by platform administrators.')}
            </p>
            {moduleConfig?.targetLaunchDate && (
              <p className="text-[10px] font-mono text-primary font-bold">
                Target Launch: {new Date(moduleConfig.targetLaunchDate).toLocaleDateString()}
              </p>
            )}
          </div>
        )}

        {/* 6. Floating Elevated Sticky Launch Bar (Mobile Viewport) */}
        <div
          className="fixed inset-x-3.5 sm:inset-x-4 max-w-lg mx-auto z-40 p-3 sm:p-3.5 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all"
          style={{
            backgroundColor: 'var(--athlon-card)',
            borderColor: 'var(--athlon-border)',
            boxShadow: '0 16px 36px -4px var(--athlon-shadow, rgba(0, 0, 0, 0.45)), 0 0 0 1px var(--athlon-border)',
            bottom: 'max(1.25rem, calc(env(safe-area-inset-bottom, 0px) + 0.85rem))',
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block">
                Total Due Today
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-foreground font-mono leading-none">
                  {currentPricing.formattedPrice}
                </span>
                <span className="text-[10px] font-bold text-text-muted">
                  {isFreePlan ? 'Forever Free' : `/${selectedBilling}`}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCreateWorkspace}
              disabled={!orgName.trim() || isCreating || isCreationBlocked}
              className="flex-1 max-w-[240px] py-3.5 px-4 rounded-xl bg-primary hover:bg-primary-hover active:scale-[0.98] text-primary-foreground font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isCreating ? (
                <>
                  <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  <span>Provisioning...</span>
                </>
              ) : isCreationBlocked ? (
                <span>{moduleConfig?.status === 'COMING_SOON' ? 'Waitlist Only' : 'Creation Paused'}</span>
              ) : (
                <>
                  <span>{isFreePlan ? 'Launch Free' : 'Confirm & Launch'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* ── DESKTOP VIEW (>= md) ───────────────────────────────────────────────── */}
      {/* High-Resolution 2-Column Responsive Configurator                          */}
      {/* ========================================================================= */}
      <div className="hidden md:block relative z-10 max-w-6xl mx-auto px-6 lg:px-8 py-8 sm:py-12">

        {/* Top Bar */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <Link
            href="/home/subscription"
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

        {/* Main Two-Column Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column: Module Summary (5 cols) */}
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

              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed mb-5 relative z-10 font-medium">
                {selectedModule.description}
              </p>

              {/* Signature 3-Cell Glass Telemetry Strip */}
              {selectedModule.quotas && selectedModule.quotas.length > 0 && (
                <div className="grid grid-cols-3 divide-x rounded-2xl p-3 mb-6 border bg-surface/70 border-border backdrop-blur-md relative z-10">
                  {selectedModule.quotas.map((q, idx) => (
                    <div key={idx} className={`flex flex-col items-center justify-center ${idx > 0 ? 'border-border' : ''}`}>
                      <span className="text-sm font-black text-foreground font-mono leading-none">
                        {q.value}
                      </span>
                      <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider mt-1">
                        {q.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}

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

          {/* Right Column: Configuration & Checkout Form (7 cols) */}
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

              {errorMessage && (
                <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 dark:text-rose-400 flex items-start gap-3 text-xs sm:text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="font-bold block mb-0.5">Workspace Setup Error</span>
                    <span>{errorMessage}</span>
                  </div>
                </div>
              )}

              {/* Field 1: Organization Name */}
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
                      selectedModule.type === 'COURT'
                        ? 'e.g. PlayZone Badminton Arena'
                        : selectedModule.type === 'ORGANIZER'
                          ? 'e.g. South India Open Championship 2026'
                          : selectedModule.type === 'COACH'
                            ? 'e.g. Coach Dinesh Sports Performance'
                            : selectedModule.type === 'ACADEMY'
                              ? 'e.g. Apex Smashers Academy'
                              : selectedModule.type === 'CLUB'
                                ? 'e.g. Downtown Sports Club'
                                : 'e.g. PlayZone Arena'
                    }
                    className="w-full pl-12 pr-4 py-3.5 sm:py-4 bg-surface border border-border rounded-2xl text-sm sm:text-base font-bold text-foreground placeholder:text-text-muted/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>

                {/* Real-time Preview Pill */}
                {orgName.trim() && (
                  <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface border border-border text-xs text-text-secondary">
                    <Globe className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="truncate">
                      Preview Dashboard URL: <strong className="text-foreground font-black font-mono">athlon.sport/org/{generateSlug(orgName)}</strong>
                    </span>
                  </div>
                )}
              </div>

              {/* Field 2: Select License Billing Cycle */}
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
                        className={`p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between relative overflow-hidden ${isSelected
                          ? 'border-primary bg-primary/10 shadow-md shadow-primary/10 ring-1 ring-primary/30'
                          : 'border-border bg-surface hover:bg-surface-hover hover:border-primary/40'
                          }`}
                      >
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
                              className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${isSelected
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
                          <span className="text-2xl font-black text-foreground font-mono">
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

              {/* Order Summary Breakdown Box */}
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
                  <span className="text-xl sm:text-2xl text-primary font-black font-mono">
                    {currentPricing.formattedPrice}
                  </span>
                </div>
              </div>

              {/* Module Lifecycle / Maintenance Warning */}
              {isCreationBlocked && (
                <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-200 mb-6 space-y-1.5 shadow-sm">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    <h4 className="font-bold text-xs text-foreground">
                      {moduleConfig?.status === 'COMING_SOON'
                        ? `${moduleConfig.displayName} Launching Soon`
                        : 'Workspace Onboarding Paused'}
                    </h4>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {moduleConfig?.maintenanceMessage ||
                      (moduleConfig?.status === 'COMING_SOON'
                        ? 'This vertical is currently in development. Self-service workspace creation will open with general availability.'
                        : 'Workspace creation for this module is temporarily paused by platform administrators.')}
                  </p>
                  {moduleConfig?.targetLaunchDate && (
                    <p className="text-[11px] font-mono text-primary font-bold">
                      Target Launch: {new Date(moduleConfig.targetLaunchDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}

              {/* Submit & Launch Action */}
              <button
                onClick={handleCreateWorkspace}
                disabled={!orgName.trim() || isCreating || isCreationBlocked}
                className="w-full py-4 sm:py-5 px-6 rounded-2xl bg-gradient-to-r from-primary to-emerald-600 hover:from-primary-hover hover:to-emerald-500 text-primary-foreground text-sm sm:text-base font-black uppercase tracking-wider transition-all duration-200 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
              >
                {isCreating ? (
                  <>
                    <span className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    <span>Provisioning Workspace...</span>
                  </>
                ) : isCreationBlocked ? (
                  <span>{moduleConfig?.status === 'COMING_SOON' ? 'Launching Soon (Waitlist Only)' : 'Workspace Onboarding Paused'}</span>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    <span>{isFreePlan ? 'Confirm & Launch Free Workspace' : 'Confirm & Launch Workspace'}</span>
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
