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
  AlertCircle,
} from 'lucide-react';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { OrganizationService } from '@/lib/api/organization';

interface CoachingTier {
  id: string;
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  frequency: string; // e.g. "3 Days / Week (1.5 hrs/day)"
  monthlyFee: number;
  quarterlyFee?: number;
  admissionFee?: number;
  description: string;
}

interface CoachingBatch {
  id: string;
  name: string;
  ageGroup: string; // e.g. "U-13 Boys & Girls"
  days: string[]; // e.g. ["Mon", "Wed", "Fri"]
  timing: string; // e.g. "06:00 AM - 07:30 AM"
  coachName: string;
  allocatedCourts: string; // e.g. "Court 1 & 2"
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

const DEFAULT_SPORTS = ['Badminton', 'Cricket', 'Tennis', 'Table Tennis', 'Football'];

const INITIAL_CONFIGS: Record<string, SportAdmissionsConfig> = {
  Badminton: {
    sport: 'Badminton',
    admissionStatus: 'OPEN',
    seasonName: 'Annual Academy Coaching 2026-27',
    headCoach: 'Coach Rajesh Kumar (BWF Level 2)',
    tiers: [
      {
        id: '1',
        name: 'Grassroots & Foundation Batch',
        level: 'Beginner',
        frequency: '3 Days / Week (1 hr/day)',
        monthlyFee: 2500,
        quarterlyFee: 6500,
        admissionFee: 1000,
        description: 'Focuses on grip, footwork fundamentals, hand-eye coordination, and basic stroke techniques.',
      },
      {
        id: '2',
        name: 'Development & Competitive Squad',
        level: 'Intermediate',
        frequency: '5 Days / Week (1.5 hrs/day)',
        monthlyFee: 4200,
        quarterlyFee: 11500,
        admissionFee: 1500,
        description: 'Match simulation, tactical drilling, agility training, and district tournament preparation.',
      },
      {
        id: '3',
        name: 'Elite High-Performance Team',
        level: 'Advanced',
        frequency: '6 Days / Week (2 hrs/day + Physio)',
        monthlyFee: 6500,
        quarterlyFee: 18000,
        admissionFee: 2000,
        description: 'State and national circuit athletes with personalized match strategy and fitness training.',
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
        name: 'Evening Competitive',
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
        name: 'Weekend Adults & Masters',
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
    seasonName: `${selectedSport} Academy Program 2026`,
    headCoach: 'Chief Coaching Staff',
    tiers: [
      {
        id: '1',
        name: 'Regular Training Program',
        level: 'All Levels',
        frequency: '3 Days / Week',
        monthlyFee: 3000,
        quarterlyFee: 8000,
        admissionFee: 1000,
        description: `Standard structured coaching program for ${selectedSport}.`,
      },
    ],
    batches: [
      {
        id: 'b1',
        name: 'Regular Batch 1',
        ageGroup: 'All Age Groups',
        days: ['Mon', 'Wed', 'Fri'],
        timing: '05:00 PM - 06:30 PM',
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
      name: 'New Batch Slot',
      ageGroup: 'Open / All Ages',
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
      // Simulate network save / integrate with backend admissions API
      await new Promise((res) => setTimeout(res, 600));
      setSuccessMsg(`Admissions & Coaching schedule for ${selectedSport} published successfully!`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        <p className="text-zinc-400 font-medium text-sm">Loading Admissions Hub...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-24">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/60 p-6 rounded-2xl border border-zinc-800/80 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <Link
            href={`/org/${orgId}/profile`}
            className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center border border-zinc-700 transition"
            title="Back to Academy Profile"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white tracking-tight">Coaching & Admissions Studio</h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Academy Hub
              </span>
            </div>
            <p className="text-sm text-zinc-400 mt-0.5">
              Manage admission intakes, tiered coaching fees, court allocation, and student batch capacity
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSaveAll}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-zinc-950 font-semibold text-sm transition shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save & Publish Admissions
          </button>
        </div>
      </div>

      {/* Success Alert */}
      {successMsg && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Sport Selector Tabs */}
      <div className="bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Select Sport to Configure Coaching
          </span>
          <span className="text-xs text-zinc-500">
            {availableSports.length} Sport{availableSports.length > 1 ? 's' : ''} Configured
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {availableSports.map((sport) => {
            const isSelected = selectedSport === sport;
            const sportConfig = configs[sport];
            const status = sportConfig?.admissionStatus || 'OPEN';

            return (
              <button
                key={sport}
                type="button"
                onClick={() => setSelectedSport(sport)}
                className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-semibold transition border ${
                  isSelected
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60 shadow-md'
                    : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                <Dumbbell className="w-3.5 h-3.5" />
                <span>{sport}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase ${
                    status === 'OPEN'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : status === 'FEW_LEFT'
                      ? 'bg-amber-500/20 text-amber-400'
                      : status === 'WAITLIST'
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {status.replace('_', ' ')}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Sport Admissions Controller */}
      <div className="space-y-6">
        {/* Section 1: Admission Status & Intake Season */}
        <div className="bg-zinc-900/60 p-6 rounded-2xl border border-zinc-800 space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                {selectedSport} Admission Intake & Head Coach
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Controls real-time badge and inquiries on the public marketplace
              </p>
            </div>

            {/* Status Picker */}
            <div className="flex items-center gap-2">
              <label className="text-xs text-zinc-400 font-medium">Status:</label>
              <select
                value={currentConfig.admissionStatus}
                onChange={(e: any) =>
                  updateCurrentConfig((prev) => ({
                    ...prev,
                    admissionStatus: e.target.value,
                  }))
                }
                className="px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-semibold text-emerald-400 focus:outline-none focus:border-emerald-500"
              >
                <option value="OPEN">🟢 Open for Admissions</option>
                <option value="FEW_LEFT">🟡 Few Seats Remaining</option>
                <option value="WAITLIST">🔵 Waitlist Only</option>
                <option value="CLOSED">🔴 Admissions Closed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Intake Program / Season Title
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
                className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Lead / Head Coach in Charge
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
                placeholder="e.g. Coach Rajesh Kumar (NIS & BWF Certified)"
                className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Coaching Fee Tiers (Monthly / Quarterly / Admission Fee) */}
        <div className="bg-zinc-900/60 p-6 rounded-2xl border border-zinc-800 space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                Coaching Fee Structure & Skill Tiers
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Set monthly/quarterly fees per level (Beginner, Intermediate, Elite)
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddTier}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-medium border border-zinc-700/60 transition"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              Add Tier
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {currentConfig.tiers.map((tier) => (
              <div
                key={tier.id}
                className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-5 space-y-4 relative flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <select
                      value={tier.level}
                      onChange={(e: any) => handleUpdateTier(tier.id, 'level', e.target.value)}
                      className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 focus:outline-none"
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
                        title="Delete Tier"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">
                      Tier Plan Name
                    </label>
                    <input
                      type="text"
                      value={tier.name}
                      onChange={(e) => handleUpdateTier(tier.id, 'name', e.target.value)}
                      className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-100 font-semibold focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">
                      Weekly Frequency & Duration
                    </label>
                    <input
                      type="text"
                      value={tier.frequency}
                      onChange={(e) => handleUpdateTier(tier.id, 'frequency', e.target.value)}
                      placeholder="e.g. 5 Days / Week (1.5 hrs)"
                      className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">
                        Monthly Fee (₹)
                      </label>
                      <input
                        type="number"
                        value={tier.monthlyFee}
                        onChange={(e) =>
                          handleUpdateTier(tier.id, 'monthlyFee', Number(e.target.value))
                        }
                        className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">
                        Quarterly Fee (₹)
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
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">
                      Program Syllabus & Focus
                    </label>
                    <textarea
                      rows={2}
                      value={tier.description}
                      onChange={(e) => handleUpdateTier(tier.id, 'description', e.target.value)}
                      placeholder="e.g. Footwork, tactical drilling, state tournament prep..."
                      className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-300 focus:outline-none focus:border-emerald-500 resize-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Active Student Batches, Court Allocation & Capacity */}
        <div className="bg-zinc-900/60 p-6 rounded-2xl border border-zinc-800 space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                Active Student Batches & Court Allocation
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Manage batch timings, allocated courts, and maximum intake capacity
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddBatch}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-medium border border-zinc-700/60 transition"
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
                  className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">
                        Batch Name
                      </label>
                      <input
                        type="text"
                        value={batch.name}
                        onChange={(e) => handleUpdateBatch(batch.id, 'name', e.target.value)}
                        className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white font-medium focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">
                        Age Group / Category
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
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">
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
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">
                        Allocated Courts
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

                  {/* Capacity & Actions */}
                  <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-zinc-800 pt-3 md:pt-0 md:pl-4">
                    <div className="text-right min-w-[100px]">
                      <div className="flex items-center justify-end gap-1 text-xs">
                        <span className="font-bold text-emerald-400">{batch.enrolledCount}</span>
                        <span className="text-zinc-500">/</span>
                        <input
                          type="number"
                          value={batch.maxCapacity}
                          onChange={(e) =>
                            handleUpdateBatch(batch.id, 'maxCapacity', Number(e.target.value))
                          }
                          className="w-12 px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-center text-xs text-zinc-300"
                        />
                        <span className="text-[10px] text-zinc-500">seats</span>
                      </div>
                      <div className="w-24 h-1.5 bg-zinc-800 rounded-full mt-1.5 overflow-hidden ml-auto">
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
                        className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-zinc-850 rounded-lg transition"
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
      </div>
    </div>
  );
}
