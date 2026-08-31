'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles,
  Award,
  Users,
  Calendar,
  Clock,
  CheckCircle2,
  DollarSign,
  Plus,
  Trash2,
  Save,
  Loader2,
  ArrowLeft,
  Info,
  ShieldCheck,
  Dumbbell,
  Layers,
  ChevronRight,
  UserCheck,
  Flame,
  User,
  Check,
  Sliders,
} from 'lucide-react';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { OrganizationService } from '@/lib/api/organization';

interface CoachingTier {
  id: string;
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  frequency: string;
  monthlyFee: number;
  quarterlyFee?: number;
  admissionFee?: number;
  description: string;
}

interface CoachingBatch {
  id: string;
  name: string;
  ageGroup: string;
  days: string[];
  timing: string;
  coachName: string;
  allocatedCourts: string;
  maxCapacity: number;
  enrolledCount: number;
}

interface SportAdmissionsConfig {
  sport: string;
  admissionStatus: 'OPEN' | 'FEW_LEFT' | 'WAITLIST' | 'CLOSED';
  seasonName: string;
  headCoach: string;
  tiers: CoachingTier[];
  batches: CoachingBatch[];
}

const SPORT_ICONS: Record<string, string> = {
  Badminton: '🏸',
  Cricket: '🏏',
  Tennis: '🎾',
  'Table Tennis': '🏓',
  Football: '⚽',
  Basketball: '🏀',
  Swimming: '🏊',
  Squash: '🎯',
  Pickleball: '🏓',
  Volleyball: '🏐',
  Athletics: '🏃',
  'Martial Arts': '🥋',
  Chess: '♟️',
};

const DEFAULT_SPORTS = ['Badminton', 'Cricket', 'Tennis', 'Table Tennis', 'Football'];

const INITIAL_CONFIGS: Record<string, SportAdmissionsConfig> = {
  Badminton: {
    sport: 'Badminton',
    admissionStatus: 'OPEN',
    seasonName: 'Annual Academy Batch 2026-27',
    headCoach: 'Coach Rajesh Kumar (BWF Level 2)',
    tiers: [
      {
        id: '1',
        name: 'Grassroots Foundation',
        level: 'Beginner',
        frequency: '3 Days / Week',
        monthlyFee: 2500,
        quarterlyFee: 6500,
        admissionFee: 1000,
        description: 'Focuses on grip, footwork fundamentals, and basic stroke techniques.',
      },
      {
        id: '2',
        name: 'Development Squad',
        level: 'Intermediate',
        frequency: '5 Days / Week',
        monthlyFee: 4200,
        quarterlyFee: 11500,
        admissionFee: 1500,
        description: 'Match simulation, tactical drilling, and district tournament prep.',
      },
      {
        id: '3',
        name: 'Elite Squad',
        level: 'Advanced',
        frequency: '6 Days / Week',
        monthlyFee: 6500,
        quarterlyFee: 18000,
        admissionFee: 2000,
        description: 'State and national circuit training with match strategy.',
      },
    ],
    batches: [
      {
        id: 'b1',
        name: 'Morning Juniors',
        ageGroup: 'Under 14 (Ages 8-13)',
        days: ['Mon', 'Wed', 'Fri'],
        timing: '06:30 AM - 07:30 AM',
        coachName: 'Coach Suresh',
        allocatedCourts: 'Courts 1 & 2',
        maxCapacity: 16,
        enrolledCount: 12,
      },
      {
        id: 'b2',
        name: 'Evening Squad',
        ageGroup: 'Under 19 & State Prep',
        days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        timing: '04:30 PM - 06:30 PM',
        coachName: 'Coach Rajesh Kumar',
        allocatedCourts: 'Courts 1, 2 & 3',
        maxCapacity: 14,
        enrolledCount: 13,
      },
      {
        id: 'b3',
        name: 'Weekend Adults',
        ageGroup: 'Adults (18+)',
        days: ['Sat', 'Sun'],
        timing: '07:00 AM - 09:00 AM',
        coachName: 'Coach Suresh',
        allocatedCourts: 'Courts 3 & 4',
        maxCapacity: 12,
        enrolledCount: 8,
      },
    ],
  },
};

export default function OrganizationAdmissionsPage() {
  const params = useParams();
  const orgId = (params?.orgId as string) || '';

  const { getActiveOrganization, organizations } = useWorkspaceStore();
  const activeOrg = getActiveOrganization() || organizations.find((o) => o.id === orgId);

  const [availableSports, setAvailableSports] = useState<string[]>(DEFAULT_SPORTS);
  const [selectedSport, setSelectedSport] = useState<string>('Badminton');
  const [configs, setConfigs] = useState<Record<string, SportAdmissionsConfig>>(INITIAL_CONFIGS);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Mobile View Section Filter ('all' | 'tiers' | 'batches' | 'intake')
  const [mobileTab, setMobileTab] = useState<'all' | 'tiers' | 'batches' | 'intake'>('all');

  // Load sports from org profile if exists
  useEffect(() => {
    async function loadOrgSports() {
      if (!orgId) return;
      try {
        setLoading(true);
        const profile = await OrganizationService.getProfileByOrgUuid(orgId);
        if (profile?.sportsOffered) {
          const list = profile.sportsOffered.split(',').map((s: string) => s.trim()).filter(Boolean);
          if (list.length > 0) {
            setAvailableSports(list);
            setSelectedSport(list[0]);
          }
        }
      } catch (e) {
        console.warn('Could not fetch org sports, using defaults:', e);
      } finally {
        setLoading(false);
      }
    }
    loadOrgSports();
  }, [orgId]);

  // Active sport configuration helper
  const currentConfig = configs[selectedSport] || {
    sport: selectedSport,
    admissionStatus: 'OPEN',
    seasonName: `${selectedSport} Academy 2026`,
    headCoach: 'Lead Coaching Staff',
    tiers: [
      {
        id: '1',
        name: 'Regular Training',
        level: 'All Levels',
        frequency: '3 Days / Week',
        monthlyFee: 3000,
        quarterlyFee: 8000,
        description: `Standard structured coaching program for ${selectedSport}.`,
      },
    ],
    batches: [
      {
        id: 'b1',
        name: 'Morning Batch',
        ageGroup: 'All Ages',
        days: ['Mon', 'Wed', 'Fri'],
        timing: '06:00 AM - 07:30 AM',
        coachName: 'Lead Coach',
        allocatedCourts: 'Court 1',
        maxCapacity: 15,
        enrolledCount: 6,
      },
    ],
  };

  const updateCurrentConfig = (updater: (prev: SportAdmissionsConfig) => SportAdmissionsConfig) => {
    setConfigs((prev) => {
      const existing = prev[selectedSport] || currentConfig;
      return {
        ...prev,
        [selectedSport]: updater(existing),
      };
    });
  };

  const handleAddTier = () => {
    const newTier: CoachingTier = {
      id: Date.now().toString(),
      name: 'New Coaching Plan',
      level: 'Intermediate',
      frequency: '3 Days / Week',
      monthlyFee: 3000,
      description: 'Comprehensive coaching schedule focusing on skill enhancement.',
    };
    updateCurrentConfig((prev) => ({
      ...prev,
      tiers: [...prev.tiers, newTier],
    }));
  };

  const handleRemoveTier = (tierId: string) => {
    updateCurrentConfig((prev) => ({
      ...prev,
      tiers: prev.tiers.filter((t) => t.id !== tierId),
    }));
  };

  const handleUpdateTier = (tierId: string, field: keyof CoachingTier, value: any) => {
    updateCurrentConfig((prev) => ({
      ...prev,
      tiers: prev.tiers.map((t) => (t.id === tierId ? { ...t, [field]: value } : t)),
    }));
  };

  const handleAddBatch = () => {
    const newBatch: CoachingBatch = {
      id: Date.now().toString(),
      name: 'New Batch',
      ageGroup: 'All Ages',
      days: ['Tue', 'Thu', 'Sat'],
      timing: '05:30 PM - 07:00 PM',
      coachName: currentConfig.headCoach || 'Lead Coach',
      allocatedCourts: 'Court 1',
      maxCapacity: 15,
      enrolledCount: 0,
    };
    updateCurrentConfig((prev) => ({
      ...prev,
      batches: [...prev.batches, newBatch],
    }));
  };

  const handleRemoveBatch = (batchId: string) => {
    updateCurrentConfig((prev) => ({
      ...prev,
      batches: prev.batches.filter((b) => b.id !== batchId),
    }));
  };

  const handleUpdateBatch = (batchId: string, field: keyof CoachingBatch, value: any) => {
    updateCurrentConfig((prev) => ({
      ...prev,
      batches: prev.batches.map((b) => (b.id === batchId ? { ...b, [field]: value } : b)),
    }));
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setSuccessMsg('');
    try {
      await new Promise((res) => setTimeout(res, 500));
      setSuccessMsg(`Admissions for ${selectedSport} saved!`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } finally {
      setSaving(false);
    }
  };

  // Quick summary counts
  const totalCapacity = currentConfig.batches.reduce((sum, b) => sum + (b.maxCapacity || 0), 0);
  const totalEnrolled = currentConfig.batches.reduce((sum, b) => sum + (b.enrolledCount || 0), 0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center animate-pulse">
          <Sparkles className="w-5 h-5 text-emerald-400" />
        </div>
        <p className="text-zinc-400 font-medium text-xs tracking-wider uppercase">Loading Admissions Hub...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-5 pb-28 px-2 sm:px-4">
      {/* ══════════════════════════════════════════════════════════════════════
          COMPACT CLEAN HEADER
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="flex items-center justify-between gap-3 bg-zinc-900/70 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-zinc-800/80 backdrop-blur-xl shadow-xl">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={`/org/${orgId}/profile`}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center border border-zinc-700/80 transition flex-shrink-0 active:scale-95"
            title="Back to Profile"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight truncate">
                Admissions & Coaching
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Academy Hub
              </span>
            </div>
            <p className="text-xs text-zinc-400 truncate">
              Manage plans, fee structures, and student batches
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSaveAll}
          disabled={saving}
          className="hidden sm:inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-zinc-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition active:scale-95 disabled:opacity-50 flex-shrink-0"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Admissions
        </button>
      </div>

      {/* Success Banner */}
      {successMsg && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          SPORTS SELECTOR PILLS (HORIZONTAL SWIPE ON MOBILE)
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {availableSports.map((sport) => {
          const isSelected = selectedSport === sport;
          const sportConfig = configs[sport];
          const status = sportConfig?.admissionStatus || 'OPEN';
          const icon = SPORT_ICONS[sport] || '🏆';

          return (
            <button
              key={sport}
              type="button"
              onClick={() => setSelectedSport(sport)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border flex-shrink-0 active:scale-95 ${
                isSelected
                  ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/20'
                  : 'bg-zinc-900/80 text-zinc-400 border-zinc-800/80 hover:border-zinc-700 hover:text-zinc-200'
              }`}
            >
              <span className="text-sm">{icon}</span>
              <span>{sport}</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  status === 'OPEN'
                    ? 'bg-emerald-400 animate-pulse'
                    : status === 'FEW_LEFT'
                    ? 'bg-amber-400'
                    : status === 'WAITLIST'
                    ? 'bg-blue-400'
                    : 'bg-zinc-600'
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* Quick Summary Strip for Selected Sport */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="bg-zinc-900/60 p-3 sm:p-4 rounded-2xl border border-zinc-800/80 text-center sm:text-left flex flex-col justify-center">
          <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Fee Plans</div>
          <div className="text-base sm:text-xl font-extrabold text-white mt-0.5">
            {currentConfig.tiers.length} <span className="text-xs font-medium text-zinc-400">Tiers</span>
          </div>
        </div>

        <div className="bg-zinc-900/60 p-3 sm:p-4 rounded-2xl border border-zinc-800/80 text-center sm:text-left flex flex-col justify-center">
          <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Batches</div>
          <div className="text-base sm:text-xl font-extrabold text-white mt-0.5">
            {currentConfig.batches.length} <span className="text-xs font-medium text-zinc-400">Slots</span>
          </div>
        </div>

        <div className="bg-zinc-900/60 p-3 sm:p-4 rounded-2xl border border-zinc-800/80 text-center sm:text-left flex flex-col justify-center">
          <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Enrolled</div>
          <div className="text-base sm:text-xl font-extrabold text-emerald-400 mt-0.5">
            {totalEnrolled} <span className="text-xs font-medium text-zinc-500">/ {totalCapacity}</span>
          </div>
        </div>
      </div>

      {/* Mobile Sub-Tab Segmenter (Visible on mobile for focus) */}
      <div className="sm:hidden flex p-1 rounded-xl bg-zinc-900/80 border border-zinc-800 gap-1 text-xs">
        <button
          onClick={() => setMobileTab('all')}
          className={`flex-1 py-1.5 rounded-lg font-bold transition ${
            mobileTab === 'all' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-zinc-400'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setMobileTab('tiers')}
          className={`flex-1 py-1.5 rounded-lg font-bold transition ${
            mobileTab === 'tiers' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-zinc-400'
          }`}
        >
          Plans ({currentConfig.tiers.length})
        </button>
        <button
          onClick={() => setMobileTab('batches')}
          className={`flex-1 py-1.5 rounded-lg font-bold transition ${
            mobileTab === 'batches' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-zinc-400'
          }`}
        >
          Batches ({currentConfig.batches.length})
        </button>
        <button
          onClick={() => setMobileTab('intake')}
          className={`flex-1 py-1.5 rounded-lg font-bold transition ${
            mobileTab === 'intake' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-zinc-400'
          }`}
        >
          Intake
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 1: INTAKE & HEAD COACH
         ══════════════════════════════════════════════════════════════════════ */}
      {(mobileTab === 'all' || mobileTab === 'intake') && (
        <div className="bg-zinc-900/60 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-zinc-800/80 space-y-4 shadow-xl animate-in fade-in">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              {selectedSport} Intake & Coach
            </h2>

            {/* Quick Status Dropdown */}
            <select
              value={currentConfig.admissionStatus}
              onChange={(e: any) =>
                updateCurrentConfig((prev) => ({
                  ...prev,
                  admissionStatus: e.target.value,
                }))
              }
              className="px-2.5 py-1 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
            >
              <option value="OPEN">🟢 Open</option>
              <option value="FEW_LEFT">🟡 Few Seats</option>
              <option value="WAITLIST">🔵 Waitlist</option>
              <option value="CLOSED">🔴 Closed</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                Program Title
              </label>
              <input
                type="text"
                value={currentConfig.seasonName}
                onChange={(e) =>
                  updateCurrentConfig((prev) => ({
                    ...prev,
                    seasonName: e.target.value,
                  }))
                }
                placeholder="e.g. Annual Badminton Academy Batch 2026-27"
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                Head Coach
              </label>
              <input
                type="text"
                value={currentConfig.headCoach}
                onChange={(e) =>
                  updateCurrentConfig((prev) => ({
                    ...prev,
                    headCoach: e.target.value,
                  }))
                }
                placeholder="e.g. Coach Rajesh Kumar (BWF Level 2)"
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 2: COACHING FEE PLANS
         ══════════════════════════════════════════════════════════════════════ */}
      {(mobileTab === 'all' || mobileTab === 'tiers') && (
        <div className="bg-zinc-900/60 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-zinc-800/80 space-y-4 shadow-xl animate-in fade-in">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                Coaching Fee Plans ({currentConfig.tiers.length})
              </h2>
            </div>
            <button
              type="button"
              onClick={handleAddTier}
              className="flex items-center gap-1 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-bold border border-zinc-700 transition active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              Add Plan
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {currentConfig.tiers.map((tier) => (
              <div
                key={tier.id}
                className="bg-zinc-950/90 border border-zinc-800/90 rounded-2xl p-4 space-y-3.5 shadow-md flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <select
                      value={tier.level}
                      onChange={(e: any) => handleUpdateTier(tier.id, 'level', e.target.value)}
                      className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 focus:outline-none"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="All Levels">All Levels</option>
                    </select>

                    {currentConfig.tiers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveTier(tier.id)}
                        className="text-zinc-500 hover:text-rose-400 p-1 transition"
                        title="Delete Plan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">
                      Plan Name
                    </label>
                    <input
                      type="text"
                      value={tier.name}
                      onChange={(e) => handleUpdateTier(tier.id, 'name', e.target.value)}
                      className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">
                      Schedule & Frequency
                    </label>
                    <input
                      type="text"
                      value={tier.frequency}
                      onChange={(e) => handleUpdateTier(tier.id, 'frequency', e.target.value)}
                      placeholder="e.g. 5 Days / Week"
                      className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">
                        Monthly (₹)
                      </label>
                      <input
                        type="number"
                        value={tier.monthlyFee}
                        onChange={(e) =>
                          handleUpdateTier(tier.id, 'monthlyFee', Number(e.target.value))
                        }
                        className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-extrabold text-emerald-400 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">
                        Quarterly (₹)
                      </label>
                      <input
                        type="number"
                        value={tier.quarterlyFee || ''}
                        onChange={(e) =>
                          handleUpdateTier(
                            tier.id,
                            'quarterlyFee',
                            e.target.value ? Number(e.target.value) : undefined
                          )
                        }
                        placeholder="Optional"
                        className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">
                      Focus & Syllabus
                    </label>
                    <textarea
                      rows={2}
                      value={tier.description}
                      onChange={(e) => handleUpdateTier(tier.id, 'description', e.target.value)}
                      placeholder="Focus areas, drills, and match prep..."
                      className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-300 focus:outline-none focus:border-emerald-500 resize-none leading-relaxed"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 3: STUDENT BATCHES & COURT ALLOCATION
         ══════════════════════════════════════════════════════════════════════ */}
      {(mobileTab === 'all' || mobileTab === 'batches') && (
        <div className="bg-zinc-900/60 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-zinc-800/80 space-y-4 shadow-xl animate-in fade-in">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                Student Batches & Courts ({currentConfig.batches.length})
              </h2>
            </div>
            <button
              type="button"
              onClick={handleAddBatch}
              className="flex items-center gap-1 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-bold border border-zinc-700 transition active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              Add Batch
            </button>
          </div>

          <div className="space-y-3">
            {currentConfig.batches.map((batch) => {
              const fillPercentage = Math.min(
                100,
                Math.round((batch.enrolledCount / (batch.maxCapacity || 1)) * 100)
              );

              return (
                <div
                  key={batch.id}
                  className="bg-zinc-950/90 border border-zinc-800/90 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3.5 shadow-md"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 flex-1">
                    <div>
                      <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">
                        Batch Name
                      </label>
                      <input
                        type="text"
                        value={batch.name}
                        onChange={(e) => handleUpdateBatch(batch.id, 'name', e.target.value)}
                        className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">
                        Age Category
                      </label>
                      <input
                        type="text"
                        value={batch.ageGroup}
                        onChange={(e) => handleUpdateBatch(batch.id, 'ageGroup', e.target.value)}
                        placeholder="e.g. Under 14"
                        className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">
                        Daily Timing
                      </label>
                      <input
                        type="text"
                        value={batch.timing}
                        onChange={(e) => handleUpdateBatch(batch.id, 'timing', e.target.value)}
                        placeholder="06:30 AM - 07:30 AM"
                        className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">
                        Assigned Courts
                      </label>
                      <input
                        type="text"
                        value={batch.allocatedCourts}
                        onChange={(e) =>
                          handleUpdateBatch(batch.id, 'allocatedCourts', e.target.value)
                        }
                        placeholder="e.g. Courts 1 & 2"
                        className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Capacity Progress & Actions */}
                  <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 md:border-l border-zinc-800/80 pt-2.5 md:pt-0 md:pl-4">
                    <div className="text-left md:text-right min-w-[90px]">
                      <div className="flex items-center md:justify-end gap-1 text-xs">
                        <span className="font-extrabold text-emerald-400">{batch.enrolledCount}</span>
                        <span className="text-zinc-600">/</span>
                        <input
                          type="number"
                          value={batch.maxCapacity}
                          onChange={(e) =>
                            handleUpdateBatch(batch.id, 'maxCapacity', Number(e.target.value))
                          }
                          className="w-11 px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-center text-xs text-zinc-300"
                        />
                        <span className="text-[10px] text-zinc-500">seats</span>
                      </div>
                      <div className="w-24 h-1.5 bg-zinc-800 rounded-full mt-1.5 overflow-hidden md:ml-auto">
                        <div
                          className={`h-full rounded-full ${
                            fillPercentage >= 90
                              ? 'bg-rose-500'
                              : fillPercentage >= 70
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${fillPercentage}%` }}
                        />
                      </div>
                    </div>

                    {currentConfig.batches.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveBatch(batch.id)}
                        className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 rounded-lg transition"
                        title="Delete Batch"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MOBILE FLOATING SAVE ACTION DOCK
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 p-3 bg-zinc-950/90 border-t border-zinc-800 backdrop-blur-xl z-40 flex items-center gap-3">
        <Link
          href={`/org/${orgId}/profile`}
          className="px-4 py-3 rounded-xl bg-zinc-900 text-zinc-300 text-xs font-bold border border-zinc-700 active:scale-95 transition"
        >
          Profile
        </Link>
        <button
          type="button"
          onClick={handleSaveAll}
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 active:scale-95 text-zinc-950 text-xs font-extrabold shadow-lg shadow-emerald-500/25 disabled:opacity-50 transition"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Admissions
        </button>
      </div>
    </div>
  );
}
