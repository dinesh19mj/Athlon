'use client';

import React, { useState, useMemo } from 'react';
import { Registration, Tournament, DrawService } from '@/lib/api/tournaments';
import {
  Users,
  CheckCircle2,
  Settings,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  Shuffle,
  Layers,
  Trophy,
  Swords,
  AlertCircle,
  HelpCircle,
  Dices,
  RotateCcw,
  Sparkles,
  RefreshCw,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import { TeamSpinner } from './TeamSpinner';

interface PooledKnockoutBuilderProps {
  tournamentUuid: string;
  registrations: Registration[];
  categoryName?: string;
  tournament?: Tournament | null;
  onComplete: () => void;
  onCancel: () => void;
}

interface PoolConfig {
  id: string;
  name: string;
  capacity: number;
}

interface PoolAssignment {
  poolId: string;
  teamUuids: string[];
}

const extractCategories = (t?: Tournament | null, regs: Registration[] = [], passedCat?: string): string[] => {
  const set = new Set<string>();

  // 1. If a specific valid category was passed
  if (passedCat && passedCat !== 'ALL' && passedCat !== 'Open Category') {
    set.add(passedCat.trim());
  }

  // 2. From tournament.teamEventCategories
  if (t?.teamEventCategories) {
    try {
      const parsed = typeof t.teamEventCategories === 'string' ? JSON.parse(t.teamEventCategories) : t.teamEventCategories;
      if (Array.isArray(parsed)) {
        parsed.forEach((c: any) => {
          if (c && typeof c === 'object' && c.name) set.add(c.name.trim());
          else if (typeof c === 'string' && c.trim()) set.add(c.trim());
        });
      }
    } catch { }
  }

  // 3. From tournament.category
  if (t?.category) {
    t.category.split(',').forEach((c) => {
      const trimmed = c.trim();
      if (trimmed && trimmed.toLowerCase() !== 'open category') set.add(trimmed);
    });
  }

  // 4. From registrations
  regs.forEach((r) => {
    if (r.category && r.category.trim() && r.category.toLowerCase() !== 'open category') {
      set.add(r.category.trim());
    }
    if (r.teamName) {
      const match = r.teamName.match(/\(([^)]+)\)$/);
      if (match && match[1] && match[1].trim() && match[1].toLowerCase() !== 'open category') {
        set.add(match[1].trim());
      }
    }
  });

  const list = Array.from(set).filter(Boolean);
  return list.length > 0 ? list : ['Category 1', 'Category 2'];
};

const formatTeamDisplayName = (reg?: Registration | null): string => {
  if (!reg) return 'Team';
  const rawName = reg.teamName || reg.players?.[0]?.playerName || 'Team';
  return rawName.replace(/\s*\([^)]*\)\s*$/, '').trim() || rawName;
};

export function PooledKnockoutBuilder({
  tournamentUuid,
  registrations,
  categoryName,
  tournament,
  onComplete,
  onCancel,
}: PooledKnockoutBuilderProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [qualifiersPerPool, setQualifiersPerPool] = useState<number>(2);

  // Extract distinct tournament categories
  const categoriesList = useMemo(
    () => extractCategories(tournament, registrations, categoryName),
    [tournament, registrations, categoryName]
  );

  const [pools, setPools] = useState<PoolConfig[]>(() => {
    if (categoriesList.length > 0) {
      return categoriesList.map((cat, idx) => {
        const count = registrations.filter((r) => {
          if (r.category && r.category.trim().toLowerCase() === cat.toLowerCase()) return true;
          if (r.teamName && r.teamName.toLowerCase().includes(`(${cat.toLowerCase()})`)) return true;
          return false;
        }).length;

        return {
          id: String(idx + 1),
          name: cat,
          capacity: Math.max(2, count || Math.ceil(registrations.length / categoriesList.length) || 4),
        };
      });
    }
    return [
      { id: '1', name: 'Pool A', capacity: Math.ceil(registrations.length / 2) || 4 },
      { id: '2', name: 'Pool B', capacity: Math.ceil(registrations.length / 2) || 4 },
    ];
  });

  const [assignments, setAssignments] = useState<PoolAssignment[]>(() => {
    return pools.map((p) => ({
      poolId: p.id,
      teamUuids: [],
    }));
  });

  const [selectedPoolId, setSelectedPoolId] = useState<string>(() => pools[0]?.id || '1');
  const [step3FilterCategory, setStep3FilterCategory] = useState<string>('ALL');

  const currentPoolIndex = useMemo(() => {
    const idx = pools.findIndex((p) => p.id === selectedPoolId);
    return idx >= 0 ? idx : 0;
  }, [pools, selectedPoolId]);

  const currentPool = pools[currentPoolIndex] || pools[0];

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalCapacity = pools.reduce((sum, p) => sum + p.capacity, 0);
  const totalTeams = registrations.length;
  const isCapacityValid = totalCapacity >= totalTeams;

  // Pool Structure Handlers
  const updatePool = (id: string, field: keyof PoolConfig, value: string | number) => {
    if (field === 'capacity') {
      const numVal = Math.max(2, Number(value));
      const otherCap = pools.filter((p) => p.id !== id).reduce((sum, p) => sum + p.capacity, 0);
      if (otherCap + numVal > totalTeams) {
        const maxAllowed = Math.max(2, totalTeams - otherCap);
        setPools(pools.map((p) => (p.id === id ? { ...p, capacity: maxAllowed } : p)));
        return;
      }
      setPools(pools.map((p) => (p.id === id ? { ...p, capacity: numVal } : p)));
      return;
    }
    setPools(pools.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  // Helper to get all registered teams belonging to a category / pool
  const getEligibleTeamsForPool = (poolName: string): Registration[] => {
    const matching = registrations.filter((r) => {
      if (r.category && r.category.trim().toLowerCase() === poolName.trim().toLowerCase()) return true;
      if (r.teamName && r.teamName.toLowerCase().includes(`(${poolName.toLowerCase()})`)) return true;
      return false;
    });
    return matching.length > 0 ? matching : registrations;
  };

  // Helper to get unassigned teams for a specific pool
  const getUnassignedTeamsForPool = (pool: PoolConfig): Registration[] => {
    const eligible = getEligibleTeamsForPool(pool.name);
    const allAssignedUuids = assignments.flatMap((a) => a.teamUuids || []).filter(Boolean);
    return eligible.filter((r) => {
      const uuid = r.registrationUuid || r.uuid;
      return uuid ? !allAssignedUuids.includes(uuid) : false;
    });
  };

  // Assign team to a specific slot index in a pool
  const assignTeamToPoolSlot = (poolId: string, slotIndex: number, teamUuid: string) => {
    setAssignments((prev) =>
      prev.map((a) => {
        if (a.poolId !== poolId) {
          return {
            ...a,
            teamUuids: (a.teamUuids || []).map((u) => (u === teamUuid ? '' : u)),
          };
        }
        const pool = pools.find((p) => p.id === poolId);
        const maxSlots = pool ? pool.capacity : Math.max(slotIndex + 1, a.teamUuids.length);
        const newSlots = Array.from({ length: maxSlots }, (_, i) => a.teamUuids[i] || '');
        newSlots[slotIndex] = teamUuid;
        return { ...a, teamUuids: newSlots };
      })
    );
  };

  // Remove team from a specific slot index in a pool
  const removeTeamFromPoolSlot = (poolId: string, slotIndex: number) => {
    setAssignments((prev) =>
      prev.map((a) => {
        if (a.poolId !== poolId) return a;
        const newSlots = [...a.teamUuids];
        if (slotIndex < newSlots.length) {
          newSlots[slotIndex] = '';
        }
        return { ...a, teamUuids: newSlots };
      })
    );
  };

  // Auto-draw a single pool
  const autoDrawPool = (poolId: string) => {
    const pool = pools.find((p) => p.id === poolId);
    if (!pool) return;
    const otherAssigned = assignments
      .filter((a) => a.poolId !== poolId)
      .flatMap((a) => a.teamUuids || [])
      .filter(Boolean);
    const eligible = getEligibleTeamsForPool(pool.name).filter((r) => {
      const uuid = r.registrationUuid || r.uuid;
      return uuid ? !otherAssigned.includes(uuid) : false;
    });
    const shuffled = [...eligible].sort(() => Math.random() - 0.5);
    const assignedUuids = shuffled
      .slice(0, pool.capacity)
      .map((r) => r.registrationUuid || r.uuid)
      .filter(Boolean) as string[];

    setAssignments((prev) =>
      prev.map((a) => {
        if (a.poolId === poolId) {
          return { ...a, teamUuids: assignedUuids };
        }
        return a;
      })
    );
  };

  // Auto-draw all pools
  const autoDrawAllPools = () => {
    setAssignments(
      pools.map((p) => {
        const eligible = getEligibleTeamsForPool(p.name);
        const shuffled = [...eligible].sort(() => Math.random() - 0.5);
        const assignedUuids = shuffled
          .slice(0, p.capacity)
          .map((r) => r.registrationUuid || r.uuid)
          .filter(Boolean) as string[];
        return {
          poolId: p.id,
          teamUuids: assignedUuids,
        };
      })
    );
  };

  // Reset a single pool draw
  const resetPoolDraw = (poolId: string) => {
    setAssignments((prev) =>
      prev.map((a) => (a.poolId === poolId ? { ...a, teamUuids: [] } : a))
    );
  };

  // Reset all pool draws
  const resetAllDraws = () => {
    setAssignments(pools.map((p) => ({ poolId: p.id, teamUuids: [] })));
  };

  // Total unassigned count across all categories
  const totalUnassignedAcrossPools = pools.reduce(
    (sum, p) => sum + getUnassignedTeamsForPool(p).length,
    0
  );

  // Check if all pools have been fully drawn / seeded
  const areAllPoolsReady = useMemo(() => {
    return pools.every((p) => {
      const assign = assignments.find((a) => a.poolId === p.id);
      const assignedCount = (assign?.teamUuids || []).filter(Boolean).length;
      const eligibleCount = getEligibleTeamsForPool(p.name).length;
      const required = Math.min(p.capacity, eligibleCount);
      return required > 0 && assignedCount >= required;
    });
  }, [pools, assignments, registrations]);

  const handleGenerate = async () => {
    if (!areAllPoolsReady) {
      setError(`Please complete the draw for all category pools before generating fixtures.`);
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const payload = {
        categoryName: categoryName || 'Open',
        qualifiersPerPool,
        pools: pools.map(p => {
          const assign = assignments.find(a => a.poolId === p.id);
          return {
            poolName: p.name,
            registrationUuids: (assign?.teamUuids || []).filter(Boolean)
          };
        })
      };

      await DrawService.generatePooledKnockoutDraw(tournamentUuid, payload);
      onComplete();
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || err?.message || 'Failed to generate pooled knockout draw.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-surface rounded-3xl border border-border p-4 sm:p-6 shadow-xl space-y-5">
      {/* ════════════════════════════════════════════════════════════
          MOBILE VIEW (block md:hidden) - Redesigned Mobile Experience
         ════════════════════════════════════════════════════════════ */}
      <div className="block md:hidden space-y-4">
        {/* Mobile Header */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-border/70">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-emerald-500/10 border border-primary/30 flex items-center justify-center text-primary shrink-0 shadow-sm">
              <Swords className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-black text-foreground tracking-tight truncate">
                Multi-Pool Knockout
              </h2>
            </div>
          </div>
        </div>

        {/* Mobile Step Indicator Pills */}
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-surface-elevated border border-border/60">
          {[
            { num: 1, label: 'Pools' },
            { num: 2, label: 'Draw' },
            { num: 3, label: 'Launch' },
          ].map((s) => (
            <button
              key={s.num}
              type="button"
              disabled={step < s.num}
              onClick={() => {
                if (s.num === 1) setStep(1);
                if (s.num === 2 && isCapacityValid) setStep(2);
                if (s.num === 3 && areAllPoolsReady) setStep(3);
              }}
              className={`py-2 px-1.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${step === s.num
                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25 scale-[1.02]'
                : step > s.num
                  ? 'bg-emerald-500/15 text-emerald-400 font-bold'
                  : 'text-foreground/40 font-semibold'
                }`}
            >
              {step > s.num ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <span className="w-4 h-4 rounded-full bg-black/20 flex items-center justify-center text-[10px] font-black">
                  {s.num}
                </span>
              )}
              <span className="truncate">{s.label}</span>
            </button>
          ))}
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span className="leading-tight">{error}</span>
          </div>
        )}

        {/* MOBILE STEP 1: POOLS & ADVANCEMENT RULES */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* 1. Mobile Advancement Rules Card */}
            <div className="p-4 rounded-2xl border border-border/70 bg-surface-elevated space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-foreground flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" /> Advancement Rules
                </span>
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-black font-mono">
                  {pools.length * qualifiersPerPool} Qualifiers
                </span>
              </div>

              {/* 2-Option Touch Switcher */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setQualifiersPerPool(1)}
                  className={`p-3 rounded-xl border text-left transition-all relative ${qualifiersPerPool === 1
                    ? 'border-primary bg-primary/15 text-foreground shadow-sm ring-1 ring-primary/40'
                    : 'border-border/60 bg-surface text-foreground/60'
                    }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-black text-xs text-foreground">Top 1 Winner</span>
                    {qualifiersPerPool === 1 && <span className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                  <span className="text-[10px] text-foreground/50 leading-tight block">Winner only advances</span>
                </button>

                <button
                  type="button"
                  onClick={() => setQualifiersPerPool(2)}
                  className={`p-3 rounded-xl border text-left transition-all relative ${qualifiersPerPool === 2
                    ? 'border-primary bg-primary/15 text-foreground shadow-sm ring-1 ring-primary/40'
                    : 'border-border/60 bg-surface text-foreground/60'
                    }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-black text-xs text-foreground">Top 2 Finalists</span>
                    {qualifiersPerPool === 2 && <span className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                  <span className="text-[10px] text-foreground/50 leading-tight block">Winners</span>
                </button>
              </div>
            </div>

            {/* 2. Mobile Capacity Metric Capsule */}
            <div className="p-3.5 rounded-2xl border border-border/70 bg-surface-elevated grid grid-cols-2 gap-2.5 text-center shadow-sm">
              <div className="p-2.5 rounded-xl bg-black/20 flex flex-col justify-center">
                <span className="text-[10px] font-black uppercase text-foreground/45">Registered Teams</span>
                <span className="text-base font-black text-foreground font-mono mt-0.5">{totalTeams}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-black/20 flex flex-col justify-center">
                <span className="text-[10px] font-black uppercase text-foreground/45">Total Capacity</span>
                <span className="text-base font-black font-mono mt-0.5 text-primary">
                  {totalCapacity}
                </span>
              </div>
            </div>

            {/* 3. Mobile Configured Pools (Named per Category, No Add Pool Button) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-black text-foreground flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-primary" /> Category Pools ({pools.length})
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {pools.map((p) => (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-2xl border border-border/70 bg-surface-elevated space-y-2.5 shadow-sm relative"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                        <span className="font-black text-xs text-foreground truncate">
                          {p.name}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-foreground/50 font-bold uppercase">Pool Capacity</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => updatePool(p.id, 'capacity', Math.max(2, p.capacity - 1))}
                          className="w-7 h-7 rounded-lg bg-surface border border-border flex items-center justify-center text-foreground active:scale-95 transition-all text-xs font-black"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center font-mono font-black text-xs text-foreground">
                          {p.capacity}
                        </span>
                        <button
                          type="button"
                          disabled={totalCapacity >= totalTeams}
                          onClick={() => updatePool(p.id, 'capacity', p.capacity + 1)}
                          className="w-7 h-7 rounded-lg bg-surface border border-border flex items-center justify-center text-foreground active:scale-95 transition-all text-xs font-black disabled:opacity-30 disabled:pointer-events-none"
                          title={totalCapacity >= totalTeams ? 'Capacity cannot exceed registered teams' : undefined}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Actions for Step 1 */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/70">
              <button
                type="button"
                onClick={onCancel}
                className="py-3 px-3 rounded-xl border border-border text-foreground/60 text-xs font-black text-center transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!isCapacityValid) {
                    alert('Total pool capacity must be at least equal to registered teams.');
                    return;
                  }
                  setStep(2);
                }}
                className="py-3 px-3 rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider shadow-lg shadow-primary/20 flex items-center justify-center gap-1.5 active:scale-95 transition-all"
              >
                <span>Next: Draw</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* MOBILE STEP 2: CATEGORY MATCH DRAW WITH WHEEL SPINNER */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Header with Global Draw Controls */}
            <div className="p-3.5 rounded-2xl border border-border/70 bg-surface-elevated space-y-2.5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-black text-foreground flex items-center gap-1.5">
                    <Swords className="w-3.5 h-3.5 text-primary" /> Category Match Draw
                  </span>
                  <p className="text-[10.5px] text-foreground/50 mt-0.5">
                    Spin the wheel to draw teams into match slots for each category.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/50">
                <button
                  type="button"
                  onClick={autoDrawAllPools}
                  className="py-2 px-2.5 rounded-xl bg-primary/20 text-primary border border-primary/30 text-[11px] font-black flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-sm"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>Auto-Draw All</span>
                </button>
                <button
                  type="button"
                  onClick={resetAllDraws}
                  className="py-2 px-2.5 rounded-xl bg-surface border border-border/70 text-foreground/60 text-[11px] font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset All</span>
                </button>
              </div>
            </div>

            {/* Category Filter Tabs (Horizontal Scroll) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between px-0.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-foreground/50">
                  Select Category ({pools.length})
                </span>
                <span className="text-[10px] font-bold text-primary">
                  {pools.filter((p) => {
                    const assign = assignments.find((a) => a.poolId === p.id);
                    const filled = (assign?.teamUuids || []).filter(Boolean).length;
                    const eligible = getEligibleTeamsForPool(p.name);
                    return filled >= Math.min(p.capacity, eligible.length) && eligible.length > 0;
                  }).length} / {pools.length} Ready
                </span>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
                {pools.map((p) => {
                  const assign = assignments.find((a) => a.poolId === p.id);
                  const filledCount = (assign?.teamUuids || []).filter(Boolean).length;
                  const isCurrent = p.id === currentPool.id;
                  const eligible = getEligibleTeamsForPool(p.name);
                  const isFull = filledCount >= Math.min(p.capacity, eligible.length) && eligible.length > 0;

                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPoolId(p.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all active:scale-95 ${
                        isCurrent
                          ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 ring-2 ring-primary/40'
                          : isFull
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-surface-elevated text-foreground/70 border border-border/70 hover:bg-surface'
                      }`}
                    >
                      {isFull && <CheckCircle2 className={`w-3 h-3 ${isCurrent ? 'text-primary-foreground' : 'text-emerald-400'}`} />}
                      <span className="truncate max-w-[130px]">{p.name}</span>
                      <span
                        className={`text-[9.5px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                          isCurrent
                            ? 'bg-black/20 text-white'
                            : isFull
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-foreground/10 text-foreground/60'
                        }`}
                      >
                        {filledCount}/{p.capacity}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Category Pool Match Draw Card */}
            {currentPool && (() => {
              const p = currentPool;
              const assign = assignments.find((a) => a.poolId === p.id);
              const assignedSlots = assign?.teamUuids || [];
              const eligibleTeams = getEligibleTeamsForPool(p.name);
              const unassignedTeams = getUnassignedTeamsForPool(p);
              const filledCount = assignedSlots.filter(Boolean).length;
              const matchCount = Math.ceil(p.capacity / 2);
              const isPoolFull = filledCount >= Math.min(p.capacity, eligibleTeams.length) && eligibleTeams.length > 0;

              return (
                <div
                  key={p.id}
                  className="p-3.5 rounded-2xl border border-border/70 bg-surface-elevated space-y-3 shadow-sm"
                >
                  {/* Pool Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-border/50">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
                      <span className="font-black text-xs text-foreground truncate">
                        {p.name}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-mono font-bold shrink-0">
                        {filledCount} / {p.capacity}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => autoDrawPool(p.id)}
                        className="px-2 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-[10px] font-black flex items-center gap-1 active:scale-95 transition-all"
                        title="Auto-draw this category"
                      >
                        <Shuffle className="w-2.5 h-2.5" />
                        <span>Draw</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => resetPoolDraw(p.id)}
                        className="p-1 rounded-lg bg-surface border border-border text-foreground/50 hover:text-red-400 active:scale-95 transition-all"
                        title="Reset category draw"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Match Fixture Slots */}
                  <div className="space-y-2">
                    {Array.from({ length: matchCount }).map((_, matchIdx) => {
                      const slot1Idx = matchIdx * 2;
                      const slot2Idx = matchIdx * 2 + 1;
                      const uuid1 = assignedSlots[slot1Idx];
                      const uuid2 = assignedSlots[slot2Idx];
                      const team1 = uuid1
                        ? registrations.find((r) => (r.registrationUuid || r.uuid) === uuid1)
                        : null;
                      const team2 = uuid2
                        ? registrations.find((r) => (r.registrationUuid || r.uuid) === uuid2)
                        : null;

                      return (
                        <div
                          key={matchIdx}
                          className="p-2.5 rounded-xl bg-background border border-border/60 space-y-2"
                        >
                          <div className="flex items-center justify-between text-[10px] font-black text-foreground/45 uppercase tracking-wider">
                            <span>Match #{matchIdx + 1}</span>
                            <span className="font-mono text-[9px] text-primary/70">
                              {team1 && team2 ? 'Ready' : 'Pending Draw'}
                            </span>
                          </div>

                          {/* Slot 1 */}
                          <div className="flex items-center justify-between gap-2">
                            {team1 ? (
                              <div className="flex-1 p-2.5 rounded-lg bg-surface border border-primary/30 flex items-center justify-between gap-2 min-w-0 shadow-sm">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="w-5 h-5 rounded bg-primary/20 text-primary font-mono font-black text-xs flex items-center justify-center shrink-0">
                                    #{slot1Idx + 1}
                                  </span>
                                  <span className="font-bold text-xs text-foreground truncate">
                                    {formatTeamDisplayName(team1)}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeTeamFromPoolSlot(p.id, slot1Idx)}
                                  className="p-1 rounded text-foreground/40 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                                  title="Remove team"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex-1 p-1 rounded-xl border border-dashed border-primary/35 bg-primary/[0.04] flex items-center gap-1.5 min-w-0">
                                <div className="flex-1 min-w-0">
                                  <TeamSpinner
                                    unassignedTeams={unassignedTeams}
                                    onSelect={(s) => {
                                      if (s.type === 'team') {
                                        const uid = s.team.registrationUuid || s.team.uuid;
                                        if (uid) assignTeamToPoolSlot(p.id, slot1Idx, uid);
                                      }
                                    }}
                                    triggerLabel={`Spin`}
                                    triggerClassName="w-full py-2 px-3 text-primary hover:bg-primary/10 rounded-lg font-black text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-40 truncate"
                                  />
                                </div>
                                <span className="text-[9px] font-black text-foreground/30 uppercase shrink-0">or</span>
                                <div className="relative flex-1 min-w-0">
                                  <select
                                    value=""
                                    onChange={(e) => {
                                      if (e.target.value) {
                                        assignTeamToPoolSlot(p.id, slot1Idx, e.target.value);
                                      }
                                    }}
                                    disabled={unassignedTeams.length === 0}
                                    className="w-full appearance-none bg-surface hover:bg-surface-elevated text-foreground border border-border/70 hover:border-primary/40 rounded-lg px-2.5 py-2 text-xs font-bold cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary transition-all pr-6 truncate disabled:opacity-40 disabled:cursor-not-allowed"
                                    title="Manually select team"
                                  >
                                    <option value="" disabled>Pick Team ▾</option>
                                    {unassignedTeams.map((t) => (
                                      <option
                                        key={t.registrationUuid || t.uuid}
                                        value={t.registrationUuid || t.uuid}
                                        className="bg-surface text-foreground"
                                      >
                                        {formatTeamDisplayName(t)}
                                      </option>
                                    ))}
                                  </select>
                                  <ChevronDown className="w-3.5 h-3.5 text-foreground/40 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                              </div>
                            )}
                          </div>

                          {/* VS Divider */}
                          <div className="flex items-center justify-center">
                            <span className="px-2.5 py-0.5 rounded-full bg-surface border border-border text-[10px] font-black text-foreground/40 font-mono tracking-widest">
                              VS
                            </span>
                          </div>

                          {/* Slot 2 */}
                          <div className="flex items-center justify-between gap-2">
                            {team2 ? (
                              <div className="flex-1 p-2.5 rounded-lg bg-surface border border-primary/30 flex items-center justify-between gap-2 min-w-0 shadow-sm">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="w-5 h-5 rounded bg-primary/20 text-primary font-mono font-black text-xs flex items-center justify-center shrink-0">
                                    #{slot2Idx + 1}
                                  </span>
                                  <span className="font-bold text-xs text-foreground truncate">
                                    {formatTeamDisplayName(team2)}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeTeamFromPoolSlot(p.id, slot2Idx)}
                                  className="p-1 rounded text-foreground/40 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                                  title="Remove team"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex-1 p-1 rounded-xl border border-dashed border-primary/35 bg-primary/[0.04] flex items-center gap-1.5 min-w-0">
                                <div className="flex-1 min-w-0">
                                  <TeamSpinner
                                    unassignedTeams={unassignedTeams}
                                    onSelect={(s) => {
                                      if (s.type === 'team') {
                                        const uid = s.team.registrationUuid || s.team.uuid;
                                        if (uid) assignTeamToPoolSlot(p.id, slot2Idx, uid);
                                      }
                                    }}
                                    triggerLabel={`Spin`}
                                    triggerClassName="w-full py-2 px-3 text-primary hover:bg-primary/10 rounded-lg font-black text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-40 truncate"
                                  />
                                </div>
                                <span className="text-[9px] font-black text-foreground/30 uppercase shrink-0">or</span>
                                <div className="relative flex-1 min-w-0">
                                  <select
                                    value=""
                                    onChange={(e) => {
                                      if (e.target.value) {
                                        assignTeamToPoolSlot(p.id, slot2Idx, e.target.value);
                                      }
                                    }}
                                    disabled={unassignedTeams.length === 0}
                                    className="w-full appearance-none bg-surface hover:bg-surface-elevated text-foreground border border-border/70 hover:border-primary/40 rounded-lg px-2.5 py-2 text-xs font-bold cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary transition-all pr-6 truncate disabled:opacity-40 disabled:cursor-not-allowed"
                                    title="Manually select team"
                                  >
                                    <option value="" disabled>Pick Team ▾</option>
                                    {unassignedTeams.map((t) => (
                                      <option
                                        key={t.registrationUuid || t.uuid}
                                        value={t.registrationUuid || t.uuid}
                                        className="bg-surface text-foreground"
                                      >
                                        {formatTeamDisplayName(t)}
                                      </option>
                                    ))}
                                  </select>
                                  <ChevronDown className="w-3.5 h-3.5 text-foreground/40 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pool Footer Status & Category Navigation */}
                  <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px]">
                    <div>
                      {isPoolFull ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Category complete
                        </span>
                      ) : (
                        <span className="text-amber-300/80 font-medium">
                          {unassignedTeams.length} unassigned
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={currentPoolIndex === 0}
                        onClick={() => setSelectedPoolId(pools[currentPoolIndex - 1].id)}
                        className="px-2 py-1 rounded-lg bg-surface border border-border text-foreground/60 hover:text-foreground disabled:opacity-30 disabled:pointer-events-none text-xs flex items-center gap-1 transition-all"
                        title="Previous category"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span>Prev</span>
                      </button>
                      <span className="font-mono text-[10px] text-foreground/50 px-1">
                        {currentPoolIndex + 1}/{pools.length}
                      </span>
                      <button
                        type="button"
                        disabled={currentPoolIndex === pools.length - 1}
                        onClick={() => setSelectedPoolId(pools[currentPoolIndex + 1].id)}
                        className="px-2 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 disabled:opacity-30 disabled:pointer-events-none text-xs font-bold flex items-center gap-1 transition-all"
                        title="Next category"
                      >
                        <span>Next</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Mobile Step 2 Actions */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/70">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-3 px-3 rounded-xl border border-border text-foreground/60 text-xs font-black text-center"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!areAllPoolsReady) {
                    alert('Please complete the team draw for all category pools before continuing.');
                    return;
                  }
                  setStep(3);
                }}
                className="py-3 px-3 rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider shadow-lg shadow-primary/20 flex items-center justify-center gap-1.5 active:scale-95 transition-all disabled:opacity-50"
              >
                <span>Next: Review</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* MOBILE STEP 3: REVIEW & LAUNCH (STYLISH & IMMERSIVE REDESIGN) */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* 1. Structure Summary Card */}
            <div className="p-3.5 rounded-2xl border border-border/80 bg-surface-elevated space-y-3 shadow-sm">
              <div className="flex items-center justify-between pb-2 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-foreground uppercase tracking-wider">
                      Tournament Summary
                    </h3>
                    <p className="text-[10px] text-foreground/50">Multi-pool knockout structure</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-mono font-bold">
                  {totalTeams} Teams
                </span>
              </div>

              {/* Summary Metric Cards Grid */}
              <div className="grid grid-cols-2 gap-2">
                {/* Metric 1: Categories */}
                <div className="p-2.5 rounded-xl bg-background border border-border/70 space-y-1">
                  <div className="flex items-center gap-1.5 text-foreground/50 text-[10px] font-bold uppercase tracking-wider">
                    <Layers className="w-3 h-3 text-primary" />
                    <span>Stage 1 Pools</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-base font-black text-foreground font-mono">
                      {pools.length}
                    </span>
                    <span className="text-[10.5px] text-foreground/50 font-bold">Categories</span>
                  </div>
                </div>

                {/* Metric 2: Qualifiers */}
                <div className="p-2.5 rounded-xl bg-background border border-border/70 space-y-1">
                  <div className="flex items-center gap-1.5 text-foreground/50 text-[10px] font-bold uppercase tracking-wider">
                    <Trophy className="w-3 h-3 text-emerald-400" />
                    <span>Advancing</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-base font-black text-emerald-400 font-mono">
                      {pools.length * qualifiersPerPool}
                    </span>
                    <span className="text-[10px] text-emerald-400/70 font-bold">
                      (Top {qualifiersPerPool}/cat)
                    </span>
                  </div>
                </div>
              </div>

              {/* Championship Pathway Strip */}
              <div className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9.5px] uppercase font-bold text-amber-400/80 tracking-wider block">
                      Stage 2 Championship
                    </span>
                    <span className="text-[11.5px] font-black text-foreground truncate block">
                      {pools.length * qualifiersPerPool === 8
                        ? 'Quarter-Finals ➔ Final'
                        : 'Semi-Finals ➔ Final'}
                    </span>
                  </div>
                </div>
                <span className="text-[9px] font-mono font-extrabold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20 shrink-0">
                  PLAYOFFS
                </span>
              </div>
            </div>

            {/* 2. Category Matchups Section */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5">
                  <Swords className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-black text-foreground uppercase tracking-wider">
                    Category Matchups
                  </span>
                </div>
                <span className="text-[10px] font-mono text-foreground/45 font-bold">
                  {pools.reduce((sum, p) => sum + Math.ceil(p.capacity / 2), 0)} Matches Total
                </span>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
                <button
                  type="button"
                  onClick={() => setStep3FilterCategory('ALL')}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-bold shrink-0 transition-all active:scale-95 ${
                    step3FilterCategory === 'ALL'
                      ? 'bg-primary text-primary-foreground font-black shadow-md shadow-primary/20 ring-1 ring-primary/40'
                      : 'bg-surface-elevated border border-border/80 text-foreground/70 hover:text-foreground'
                  }`}
                >
                  All ({pools.length})
                </button>
                {pools.map((p) => {
                  const isSelected = step3FilterCategory === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setStep3FilterCategory(p.id)}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-bold shrink-0 transition-all active:scale-95 ${
                        isSelected
                          ? 'bg-primary text-primary-foreground font-black shadow-md shadow-primary/20 ring-1 ring-primary/40'
                          : 'bg-surface-elevated border border-border/80 text-foreground/70 hover:text-foreground'
                      }`}
                    >
                      {p.name}
                    </button>
                  );
                })}
              </div>

              {/* Match Cards List */}
              <div className="space-y-3">
                {pools
                  .filter((p) => step3FilterCategory === 'ALL' || p.id === step3FilterCategory)
                  .map((p) => {
                    const assign = assignments.find((a) => a.poolId === p.id);
                    const assignedSlots = assign?.teamUuids || [];
                    const matchCount = Math.ceil(p.capacity / 2);

                    return (
                      <div
                        key={p.id}
                        className="p-3.5 rounded-2xl border border-border/70 bg-surface-elevated space-y-2.5 shadow-sm"
                      >
                        {/* Category Header */}
                        <div className="flex items-center justify-between pb-2 border-b border-border/50">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
                            <span className="text-xs font-black text-foreground truncate">
                              {p.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 text-[9.5px] font-mono font-bold">
                              {matchCount} {matchCount === 1 ? 'Match' : 'Matches'}
                            </span>
                          </div>
                        </div>

                        {/* Fixtures List */}
                        <div className="space-y-2.5">
                          {Array.from({ length: matchCount }).map((_, mIdx) => {
                            const slot1Idx = mIdx * 2;
                            const slot2Idx = mIdx * 2 + 1;
                            const t1 = registrations.find(
                              (r) => (r.registrationUuid || r.uuid) === assignedSlots[slot1Idx]
                            );
                            const t2 = registrations.find(
                              (r) => (r.registrationUuid || r.uuid) === assignedSlots[slot2Idx]
                            );

                            return (
                              <div
                                key={mIdx}
                                className="p-3 rounded-2xl bg-background/90 border border-border/80 space-y-2 shadow-xs"
                              >
                                {/* Header */}
                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider">
                                  <span className="text-foreground/50 flex items-center gap-1">
                                    <Swords className="w-3 h-3 text-primary" /> Match #{mIdx + 1}
                                  </span>
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold">
                                    {t1 && t2 ? 'Ready' : 'Confirmed'}
                                  </span>
                                </div>

                                {/* Team 1 Full-Width Row */}
                                <div className="p-2.5 px-3 rounded-xl bg-surface border border-border/70 flex items-center shadow-xs">
                                  <span className="text-xs font-bold text-foreground leading-snug break-words flex-1 min-w-0">
                                    {t1 ? formatTeamDisplayName(t1) : 'BYE'}
                                  </span>
                                </div>

                                {/* Stylish VS Divider Strip */}
                                <div className="relative flex items-center justify-center py-0.5">
                                  <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-border/50"></div>
                                  </div>
                                  <span className="relative px-2.5 py-0.5 rounded-full bg-surface-elevated border border-border/80 text-[9px] font-mono font-black text-foreground/50 tracking-widest shadow-xs">
                                    VS
                                  </span>
                                </div>

                                {/* Team 2 Full-Width Row */}
                                <div className="p-2.5 px-3 rounded-xl bg-surface border border-border/70 flex items-center shadow-xs">
                                  <span className="text-xs font-bold text-foreground leading-snug break-words flex-1 min-w-0">
                                    {t2 ? formatTeamDisplayName(t2) : 'BYE'}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Final Mobile Actions */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/70">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={isGenerating}
                className="py-3 px-3 rounded-xl border border-border bg-surface text-foreground/70 hover:text-foreground text-xs font-black text-center active:scale-95 transition-all"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="col-span-2 py-3 px-4 rounded-xl bg-gradient-to-r from-primary to-orange-500 text-black font-black text-xs uppercase tracking-wider shadow-xl shadow-primary/25 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
              >
                <Swords className="w-4 h-4" />
                <span>{isGenerating ? 'Generating...' : 'Generate Draw'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════
          DESKTOP VIEW DESIGN (hidden md:block) - Desktop UI
         ════════════════════════════════════════════════════════════ */}
      <div className="hidden md:block space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-foreground">
                Multi-Pool Knockout Draw Setup
              </h2>
              <p className="text-xs text-foreground/50">
                Configure pool mini-brackets and advancing qualifier rules for the championship stage.
              </p>
            </div>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center gap-2">
            {[
              { num: 1, label: 'Pools & Rules' },
              { num: 2, label: 'Team Draw' },
              { num: 3, label: 'Review & Launch' },
            ].map((s) => (
              <div
                key={s.num}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${step === s.num
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                  : step > s.num
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-surface-elevated text-foreground/40'
                  }`}
              >
                <span>{s.num}.</span>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-3">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: POOL STRUCTURE & QUALIFIER RULES */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Qualification Rules */}
              <div className="p-5 rounded-xl border border-border bg-surface-elevated space-y-4">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  Advancement Rules (Per Pool)
                </h3>
                <p className="text-xs text-foreground/60 leading-relaxed">
                  Specify how many teams from each pool knockout bracket will advance to the Championship Stage.
                </p>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setQualifiersPerPool(1)}
                    className={`p-3 rounded-xl border text-left transition-all ${qualifiersPerPool === 1
                      ? 'border-primary bg-primary/10 text-foreground'
                      : 'border-border bg-background text-foreground/60 hover:text-foreground'
                      }`}
                  >
                    <div className="font-bold text-sm">Top 1 Winner Only</div>
                    <div className="text-[11px] text-foreground/40 mt-1">Pool Champion advances directly</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setQualifiersPerPool(2)}
                    className={`p-3 rounded-xl border text-left transition-all ${qualifiersPerPool === 2
                      ? 'border-primary bg-primary/10 text-foreground'
                      : 'border-border bg-background text-foreground/60 hover:text-foreground'
                      }`}
                  >
                    <div className="font-bold text-sm">Top 2 (Winner + Runner-Up)</div>
                    <div className="text-[11px] text-foreground/40 mt-1">Both finalists advance to Playoffs</div>
                  </button>
                </div>

                <div className="p-3 rounded-lg bg-background border border-border text-xs text-foreground/70 flex items-center justify-between">
                  <span>Total Championship Qualifiers:</span>
                  <strong className="text-primary font-mono text-sm">{pools.length * qualifiersPerPool} Teams</strong>
                </div>
              </div>

              {/* Total Teams Overview */}
              <div className="p-5 rounded-xl border border-border bg-surface-elevated space-y-3">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  Registration Pool Capacity
                </h3>
                <div className="flex items-center justify-between text-xs py-1 border-b border-border/60">
                  <span className="text-foreground/60">Total Registered Teams:</span>
                  <span className="font-bold font-mono text-foreground">{totalTeams}</span>
                </div>
                <div className="flex items-center justify-between text-xs py-1 border-b border-border/60">
                  <span className="text-foreground/60">Total Configured Capacity:</span>
                  <span className={`font-bold font-mono ${isCapacityValid ? 'text-emerald-400' : 'text-red-400'}`}>
                    {totalCapacity}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs py-1">
                  <span className="text-foreground/60">Status:</span>
                  <span className={`font-bold ${isCapacityValid ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {isCapacityValid ? '✓ Valid Capacity' : '⚠️ Adjust Pool Capacities'}
                  </span>
                </div>
              </div>
            </div>

            {/* Pools List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground">Category Pools ({pools.length})</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {pools.map((p) => (
                  <div key={p.id} className="p-4 rounded-xl border border-border bg-surface-elevated space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-foreground truncate">{p.name}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-foreground/50">Capacity:</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => updatePool(p.id, 'capacity', Math.max(2, p.capacity - 1))}
                          className="w-6 h-6 rounded bg-background border border-border flex items-center justify-center text-foreground hover:bg-surface"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center font-mono font-bold text-foreground">{p.capacity}</span>
                        <button
                          type="button"
                          disabled={totalCapacity >= totalTeams}
                          onClick={() => updatePool(p.id, 'capacity', p.capacity + 1)}
                          className="w-6 h-6 rounded bg-background border border-border flex items-center justify-center text-foreground hover:bg-surface disabled:opacity-30 disabled:pointer-events-none"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 1 Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2.5 rounded-xl border border-border text-foreground/60 hover:text-foreground text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!isCapacityValid) {
                    alert('Total pool capacity must be at least equal to registered teams.');
                    return;
                  }
                  setStep(2);
                }}
                className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              >
                <span>Next: Team Draw</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: CATEGORY MATCH DRAW WITH WHEEL SPINNER */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-2">
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Swords className="w-4 h-4 text-primary" />
                  Category Pool Match Draw
                </h3>
                <p className="text-xs text-foreground/50">
                  Draw registered teams into pool match slots using the Wheel Spinner or Auto-Draw per category.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={autoDrawAllPools}
                  className="px-4 py-2 rounded-xl bg-primary/20 hover:bg-primary text-primary hover:text-black border border-primary/30 text-xs font-black flex items-center gap-2 transition-all shadow-sm active:scale-95"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>Auto-Draw All Categories</span>
                </button>
                <button
                  type="button"
                  onClick={resetAllDraws}
                  className="px-3.5 py-2 rounded-xl bg-surface border border-border hover:bg-surface-elevated text-foreground/60 hover:text-foreground text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All</span>
                </button>
              </div>
            </div>

            {/* Category Navigation Tabs */}
            <div className="p-3 rounded-2xl border border-border bg-surface-elevated space-y-2.5 shadow-sm">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-black uppercase tracking-wider text-foreground/60 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-primary" /> Category Selection ({pools.length})
                </span>
                <span className="text-xs font-bold text-primary font-mono">
                  {pools.filter((p) => {
                    const assign = assignments.find((a) => a.poolId === p.id);
                    const filled = (assign?.teamUuids || []).filter(Boolean).length;
                    const eligible = getEligibleTeamsForPool(p.name);
                    return filled >= Math.min(p.capacity, eligible.length) && eligible.length > 0;
                  }).length} / {pools.length} Categories Fully Seeded
                </span>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar pt-0.5">
                {pools.map((p) => {
                  const assign = assignments.find((a) => a.poolId === p.id);
                  const filledCount = (assign?.teamUuids || []).filter(Boolean).length;
                  const isCurrent = p.id === currentPool.id;
                  const eligible = getEligibleTeamsForPool(p.name);
                  const isFull = filledCount >= Math.min(p.capacity, eligible.length) && eligible.length > 0;

                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPoolId(p.id)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold shrink-0 flex items-center gap-2 transition-all active:scale-95 ${
                        isCurrent
                          ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 ring-2 ring-primary/40'
                          : isFull
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                          : 'bg-surface text-foreground/70 border border-border hover:bg-surface-elevated hover:text-foreground'
                      }`}
                    >
                      {isFull && <CheckCircle2 className={`w-3.5 h-3.5 ${isCurrent ? 'text-primary-foreground' : 'text-emerald-400'}`} />}
                      <span className="font-extrabold">{p.name}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                          isCurrent
                            ? 'bg-black/20 text-white'
                            : isFull
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-foreground/10 text-foreground/60'
                        }`}
                      >
                        {filledCount} / {p.capacity}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Category Pool Match Draw Card */}
            {currentPool && (() => {
              const p = currentPool;
              const assign = assignments.find((a) => a.poolId === p.id);
              const assignedSlots = assign?.teamUuids || [];
              const eligibleTeams = getEligibleTeamsForPool(p.name);
              const unassignedTeams = getUnassignedTeamsForPool(p);
              const filledCount = assignedSlots.filter(Boolean).length;
              const matchCount = Math.ceil(p.capacity / 2);
              const isPoolFull = filledCount >= Math.min(p.capacity, eligibleTeams.length) && eligibleTeams.length > 0;

              return (
                <div key={p.id} className="p-6 rounded-2xl border border-border bg-surface-elevated space-y-5 shadow-sm">
                  <div className="flex items-center justify-between pb-4 border-b border-border/60">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-3.5 h-3.5 rounded-full bg-primary shrink-0" />
                      <span className="font-black text-base text-foreground truncate">{p.name} Bracket</span>
                      <span className="px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-mono font-bold">
                        {filledCount} / {p.capacity} Teams Drawn
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => autoDrawPool(p.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <Shuffle className="w-3.5 h-3.5" />
                        <span>Draw {p.name}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => resetPoolDraw(p.id)}
                        className="p-2 rounded-xl bg-background border border-border text-foreground/50 hover:text-red-400 transition-colors"
                        title="Reset category draw"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Match Fixture Slots Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.from({ length: matchCount }).map((_, matchIdx) => {
                      const slot1Idx = matchIdx * 2;
                      const slot2Idx = matchIdx * 2 + 1;
                      const uuid1 = assignedSlots[slot1Idx];
                      const uuid2 = assignedSlots[slot2Idx];
                      const team1 = uuid1
                        ? registrations.find((r) => (r.registrationUuid || r.uuid) === uuid1)
                        : null;
                      const team2 = uuid2
                        ? registrations.find((r) => (r.registrationUuid || r.uuid) === uuid2)
                        : null;

                      return (
                        <div
                          key={matchIdx}
                          className="p-3.5 rounded-xl bg-background border border-border/70 space-y-2.5"
                        >
                          <div className="flex items-center justify-between text-xs font-bold text-foreground/50 uppercase tracking-wider">
                            <span>Match #{matchIdx + 1}</span>
                            <span className="font-mono text-[10px] text-primary/70">
                              {team1 && team2 ? 'Ready' : 'Awaiting Selection'}
                            </span>
                          </div>

                          {/* Slot 1 */}
                          <div className="flex items-center justify-between gap-2">
                            {team1 ? (
                              <div className="flex-1 p-2.5 rounded-lg bg-surface border border-primary/30 flex items-center justify-between gap-2 min-w-0 shadow-sm">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="w-5 h-5 rounded bg-primary/20 text-primary font-mono font-black text-xs flex items-center justify-center shrink-0">
                                    #{slot1Idx + 1}
                                  </span>
                                  <span className="font-bold text-xs text-foreground truncate">
                                    {formatTeamDisplayName(team1)}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeTeamFromPoolSlot(p.id, slot1Idx)}
                                  className="p-1 rounded text-foreground/40 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                                  title="Remove team"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex-1 p-1 rounded-xl border border-dashed border-primary/35 bg-primary/[0.04] flex items-center gap-1.5 min-w-0">
                                <div className="flex-1 min-w-0">
                                  <TeamSpinner
                                    unassignedTeams={unassignedTeams}
                                    onSelect={(s) => {
                                      if (s.type === 'team') {
                                        const uid = s.team.registrationUuid || s.team.uuid;
                                        if (uid) assignTeamToPoolSlot(p.id, slot1Idx, uid);
                                      }
                                    }}
                                    triggerLabel={`Spin`}
                                    triggerClassName="w-full py-2 px-3 text-primary hover:bg-primary/10 rounded-lg font-black text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-40 truncate"
                                  />
                                </div>
                                <span className="text-[9px] font-black text-foreground/30 uppercase shrink-0">or</span>
                                <div className="relative flex-1 min-w-0">
                                  <select
                                    value=""
                                    onChange={(e) => {
                                      if (e.target.value) {
                                        assignTeamToPoolSlot(p.id, slot1Idx, e.target.value);
                                      }
                                    }}
                                    disabled={unassignedTeams.length === 0}
                                    className="w-full appearance-none bg-surface hover:bg-surface-elevated text-foreground border border-border/70 hover:border-primary/40 rounded-lg px-2.5 py-2 text-xs font-bold cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary transition-all pr-6 truncate disabled:opacity-40 disabled:cursor-not-allowed"
                                    title="Manually select team"
                                  >
                                    <option value="" disabled>Pick Team ▾</option>
                                    {unassignedTeams.map((t) => (
                                      <option
                                        key={t.registrationUuid || t.uuid}
                                        value={t.registrationUuid || t.uuid}
                                        className="bg-surface text-foreground"
                                      >
                                        {formatTeamDisplayName(t)}
                                      </option>
                                    ))}
                                  </select>
                                  <ChevronDown className="w-3.5 h-3.5 text-foreground/40 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                              </div>
                            )}
                          </div>

                          {/* VS Divider */}
                          <div className="flex items-center justify-center">
                            <span className="px-2.5 py-0.5 rounded-full bg-surface border border-border text-[10px] font-black text-foreground/40 font-mono tracking-widest">
                              VS
                            </span>
                          </div>

                          {/* Slot 2 */}
                          <div className="flex items-center justify-between gap-2">
                            {team2 ? (
                              <div className="flex-1 p-2.5 rounded-lg bg-surface border border-primary/30 flex items-center justify-between gap-2 min-w-0 shadow-sm">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="w-5 h-5 rounded bg-primary/20 text-primary font-mono font-black text-xs flex items-center justify-center shrink-0">
                                    #{slot2Idx + 1}
                                  </span>
                                  <span className="font-bold text-xs text-foreground truncate">
                                    {formatTeamDisplayName(team2)}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeTeamFromPoolSlot(p.id, slot2Idx)}
                                  className="p-1 rounded text-foreground/40 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                                  title="Remove team"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex-1 p-1 rounded-xl border border-dashed border-primary/35 bg-primary/[0.04] flex items-center gap-1.5 min-w-0">
                                <div className="flex-1 min-w-0">
                                  <TeamSpinner
                                    unassignedTeams={unassignedTeams}
                                    onSelect={(s) => {
                                      if (s.type === 'team') {
                                        const uid = s.team.registrationUuid || s.team.uuid;
                                        if (uid) assignTeamToPoolSlot(p.id, slot2Idx, uid);
                                      }
                                    }}
                                    triggerLabel={`Spin`}
                                    triggerClassName="w-full py-2 px-3 text-primary hover:bg-primary/10 rounded-lg font-black text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-40 truncate"
                                  />
                                </div>
                                <span className="text-[9px] font-black text-foreground/30 uppercase shrink-0">or</span>
                                <div className="relative flex-1 min-w-0">
                                  <select
                                    value=""
                                    onChange={(e) => {
                                      if (e.target.value) {
                                        assignTeamToPoolSlot(p.id, slot2Idx, e.target.value);
                                      }
                                    }}
                                    disabled={unassignedTeams.length === 0}
                                    className="w-full appearance-none bg-surface hover:bg-surface-elevated text-foreground border border-border/70 hover:border-primary/40 rounded-lg px-2.5 py-2 text-xs font-bold cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary transition-all pr-6 truncate disabled:opacity-40 disabled:cursor-not-allowed"
                                    title="Manually select team"
                                  >
                                    <option value="" disabled>Pick Team ▾</option>
                                    {unassignedTeams.map((t) => (
                                      <option
                                        key={t.registrationUuid || t.uuid}
                                        value={t.registrationUuid || t.uuid}
                                        className="bg-surface text-foreground"
                                      >
                                        {formatTeamDisplayName(t)}
                                      </option>
                                    ))}
                                  </select>
                                  <ChevronDown className="w-3.5 h-3.5 text-foreground/40 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Status Footer & Category Switcher */}
                  <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                    <div>
                      {isPoolFull ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          Category bracket fully seeded
                        </span>
                      ) : (
                        <span className="text-amber-300 font-medium">
                          {unassignedTeams.length} teams unassigned in {p.name}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={currentPoolIndex === 0}
                        onClick={() => setSelectedPoolId(pools[currentPoolIndex - 1].id)}
                        className="px-3 py-1.5 rounded-xl bg-surface border border-border text-foreground/70 hover:text-foreground hover:bg-surface-elevated disabled:opacity-30 disabled:pointer-events-none text-xs font-bold flex items-center gap-1.5 transition-all"
                        title="Previous category"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span>Previous Category</span>
                      </button>
                      <span className="font-mono text-xs text-foreground/50 px-2 font-bold">
                        {currentPoolIndex + 1} of {pools.length}
                      </span>
                      <button
                        type="button"
                        disabled={currentPoolIndex === pools.length - 1}
                        onClick={() => setSelectedPoolId(pools[currentPoolIndex + 1].id)}
                        className="px-3.5 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 disabled:opacity-30 disabled:pointer-events-none text-xs font-black flex items-center gap-1.5 transition-all"
                        title="Next category"
                      >
                        <span>Next Category</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Step 2 Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2.5 rounded-xl border border-border text-foreground/60 hover:text-foreground text-xs font-bold transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!areAllPoolsReady) {
                    alert('Please complete the team draw for all category pools before continuing.');
                    return;
                  }
                  setStep(3);
                }}
                className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <span>Next: Review & Launch</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: REVIEW & CONFIRM */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl border border-border bg-surface-elevated space-y-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Tournament Structure Summary
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-background border border-border">
                  <span className="text-foreground/50 block">Stage 1</span>
                  <strong className="text-foreground font-bold text-sm">{pools.length} Category Pools</strong>
                  <span className="text-foreground/40 block mt-0.5">{totalTeams} Total Teams</span>
                </div>

                <div className="p-3 rounded-xl bg-background border border-border">
                  <span className="text-foreground/50 block">Stage 2 Qualifiers</span>
                  <strong className="text-primary font-bold text-sm">
                    {pools.length * qualifiersPerPool} Teams Advance
                  </strong>
                  <span className="text-foreground/40 block mt-0.5">
                    Top {qualifiersPerPool} per pool
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-background border border-border">
                  <span className="text-foreground/50 block">Championship Stage</span>
                  <strong className="text-amber-400 font-bold text-sm">
                    {pools.length * qualifiersPerPool === 8 ? 'Quarter-Finals ➔ Final' : 'Semi-Finals ➔ Final'}
                  </strong>
                  <span className="text-foreground/40 block mt-0.5">Playoff Stage</span>
                </div>
              </div>

              {/* Fixtures Review */}
              <div className="pt-3 space-y-3 border-t border-border/60">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h4 className="text-xs font-black text-foreground uppercase tracking-wider">
                    Category Matchups Preview
                  </h4>
                  <div className="flex items-center gap-1.5 overflow-x-auto">
                    <button
                      type="button"
                      onClick={() => setStep3FilterCategory('ALL')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        step3FilterCategory === 'ALL'
                          ? 'bg-primary text-black font-black shadow-sm'
                          : 'bg-background border border-border text-foreground/60 hover:text-foreground'
                      }`}
                    >
                      All Categories ({pools.length})
                    </button>
                    {pools.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setStep3FilterCategory(p.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          step3FilterCategory === p.id
                            ? 'bg-primary text-black font-black shadow-sm'
                            : 'bg-background border border-border text-foreground/60 hover:text-foreground'
                        }`}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {pools
                    .filter((p) => step3FilterCategory === 'ALL' || p.id === step3FilterCategory)
                    .map((p) => {
                      const assign = assignments.find((a) => a.poolId === p.id);
                      const assignedSlots = assign?.teamUuids || [];
                      const matchCount = Math.ceil(p.capacity / 2);

                      return (
                        <div key={p.id} className="p-3 rounded-xl bg-background border border-border space-y-2">
                          <span className="text-xs font-black text-primary block">{p.name}</span>
                          <div className="space-y-1.5">
                            {Array.from({ length: matchCount }).map((_, mIdx) => {
                              const t1 = registrations.find(
                                (r) => (r.registrationUuid || r.uuid) === assignedSlots[mIdx * 2]
                              );
                              const t2 = registrations.find(
                                (r) => (r.registrationUuid || r.uuid) === assignedSlots[mIdx * 2 + 1]
                              );
                              return (
                                <div
                                  key={mIdx}
                                  className="text-xs text-foreground/80 flex items-center justify-between py-1 px-2 rounded bg-surface/60 border border-border/40"
                                >
                                  <span className="font-bold truncate max-w-[42%]">
                                    {t1 ? formatTeamDisplayName(t1) : 'BYE'}
                                  </span>
                                  <span className="text-[10px] font-black text-foreground/40 font-mono">VS</span>
                                  <span className="font-bold truncate max-w-[42%] text-right">
                                    {t2 ? formatTeamDisplayName(t2) : 'BYE'}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* Final Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={isGenerating}
                className="px-4 py-2.5 rounded-xl border border-border text-foreground/60 hover:text-foreground text-xs font-bold transition-colors"
              >
                Back
              </button>

              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 text-black font-black text-sm uppercase tracking-wider shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Swords className="w-4 h-4" />
                <span>{isGenerating ? 'Generating Fixtures...' : 'Generate Pool Knockout Draw'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
