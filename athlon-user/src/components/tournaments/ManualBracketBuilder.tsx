import React, { useState, useMemo } from 'react';
import { Registration, RegistrationPlayer, DrawService } from '@/lib/api/tournaments';
import {
  Users,
  Shield,
  Play,
  AlertCircle,
  ChevronRight,
  X,
  Dices,
  Sparkles,
  RotateCcw,
  Trophy,
  CheckCircle2,
  Sliders,
  ArrowRight,
  UserPlus,
  Swords
} from 'lucide-react';
import { TeamSpinner, SpinnerSelection } from './TeamSpinner';
import { UserService } from '@/lib/api/user';

interface ManualBracketBuilderProps {
  tournamentUuid: string;
  registrations: Registration[];
  initialDrawSize?: number;
  onComplete: () => void;
  onCancel: () => void;
  playerPhotos?: Record<string, string>;
}

export type SlotAssignment = Registration | 'BYE' | null;

export interface PairingSlot {
  id: number;
  teamA: SlotAssignment;
  teamB: SlotAssignment;
}

export function ManualBracketBuilder({
  tournamentUuid,
  registrations,
  initialDrawSize,
  onComplete,
  onCancel,
  playerPhotos = {},
}: ManualBracketBuilderProps) {
  const totalTeams = registrations.length;
  const [internalPhotos, setInternalPhotos] = useState<Record<string, string>>({});

  React.useEffect(() => {
    const fetchPhotos = async () => {
      const phonesToFetch: string[] = [];
      registrations.forEach((reg) => {
        reg.players?.forEach((p) => {
          if (p.phoneNumber && !playerPhotos?.[p.phoneNumber] && !internalPhotos[p.phoneNumber]) {
            phonesToFetch.push(p.phoneNumber);
          }
        });
      });

      if (phonesToFetch.length === 0) return;

      const newPhotos: Record<string, string> = {};
      await Promise.all(
        phonesToFetch.map(async (phone) => {
          try {
            const res = await UserService.getUserByPhone(phone);
            if (res?.data?.photo) {
              newPhotos[phone] = UserService.getPhotoUrl(res.data.photo);
            }
          } catch {
            // ignore
          }
        })
      );

      if (Object.keys(newPhotos).length > 0) {
        setInternalPhotos((prev) => ({ ...prev, ...newPhotos }));
      }
    };

    if (registrations.length > 0) {
      fetchPhotos();
    }
  }, [registrations, playerPhotos]);

  // Calculate default recommended bracket size (next power of 2)
  const defaultDrawSize = useMemo(() => {
    if (initialDrawSize && initialDrawSize >= totalTeams) return initialDrawSize;
    if (totalTeams <= 4) return 4;
    if (totalTeams <= 8) return 8;
    if (totalTeams <= 16) return 16;
    if (totalTeams <= 32) return 32;
    if (totalTeams <= 64) return 64;
    return Math.pow(2, Math.ceil(Math.log2(totalTeams)));
  }, [totalTeams, initialDrawSize]);

  const [drawSize, setDrawSize] = useState<number>(defaultDrawSize);

  // Total Byes & Pairings
  const totalPairings = drawSize / 2;
  const totalByes = Math.max(0, drawSize - totalTeams);
  const round1ActiveMatches = Math.max(0, totalTeams - totalPairings);

  // Slots
  const [slots, setSlots] = useState<PairingSlot[]>(() =>
    Array.from({ length: totalPairings }, (_, i) => ({
      id: i + 1,
      teamA: null,
      teamB: null,
    }))
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSelection, setActiveSelection] = useState<{ slotId: number; position: 'A' | 'B' } | null>(null);

  // Change draw size
  const handleDrawSizeChange = (newSize: number) => {
    if (newSize < totalTeams) {
      alert(`Draw size (${newSize}) cannot be less than registered teams (${totalTeams}).`);
      return;
    }
    setDrawSize(newSize);
    const newPairings = newSize / 2;
    setSlots(
      Array.from({ length: newPairings }, (_, i) => ({
        id: i + 1,
        teamA: null,
        teamB: null,
      }))
    );
  };

  // Assigned real teams count
  const getAssignedTeamsCount = () => {
    let count = 0;
    slots.forEach((s) => {
      if (s.teamA && s.teamA !== 'BYE') count++;
      if (s.teamB && s.teamB !== 'BYE') count++;
    });
    return count;
  };

  // Assigned Byes count
  const getAssignedByesCount = () => {
    let count = 0;
    slots.forEach((s) => {
      if (s.teamA === 'BYE') count++;
      if (s.teamB === 'BYE') count++;
    });
    return count;
  };

  const assignedTeamsCount = getAssignedTeamsCount();
  const assignedByesCount = getAssignedByesCount();
  const unassignedTeamsCount = Math.max(0, totalTeams - assignedTeamsCount);
  const remainingByesCount = Math.max(0, totalByes - assignedByesCount);

  const isTeamAssigned = (regUuid: string) => {
    for (const slot of slots) {
      if (slot.teamA && slot.teamA !== 'BYE' && (slot.teamA.registrationUuid === regUuid || slot.teamA.uuid === regUuid))
        return true;
      if (slot.teamB && slot.teamB !== 'BYE' && (slot.teamB.registrationUuid === regUuid || slot.teamB.uuid === regUuid))
        return true;
    }
    return false;
  };

  const unassignedTeams = useMemo(
    () => registrations.filter((reg) => !isTeamAssigned(reg.registrationUuid || reg.uuid)),
    [registrations, slots]
  );

  // Select team
  const handleSelectTeam = (reg: Registration) => {
    if (!activeSelection) return;
    const regUuid = reg.registrationUuid || reg.uuid;

    const newSlots = slots.map((slot) => {
      let s = { ...slot };
      if (s.teamA && s.teamA !== 'BYE' && (s.teamA.registrationUuid === regUuid || s.teamA.uuid === regUuid)) s.teamA = null;
      if (s.teamB && s.teamB !== 'BYE' && (s.teamB.registrationUuid === regUuid || s.teamB.uuid === regUuid)) s.teamB = null;
      return s;
    });

    const targetIndex = newSlots.findIndex((s) => s.id === activeSelection.slotId);
    if (activeSelection.position === 'A') {
      newSlots[targetIndex].teamA = reg;
    } else {
      newSlots[targetIndex].teamB = reg;
    }

    setSlots(newSlots);
    setActiveSelection(null);
  };

  // Select BYE
  const handleSelectBye = () => {
    if (!activeSelection) return;
    if (remainingByesCount <= 0) {
      alert('All Byes for this draw size have already been assigned.');
      return;
    }

    const targetSlot = slots.find((s) => s.id === activeSelection.slotId);
    if (!targetSlot) return;

    // Check if the other position is already BYE
    const otherPosition = activeSelection.position === 'A' ? targetSlot.teamB : targetSlot.teamA;
    if (otherPosition === 'BYE') {
      alert('Cannot assign BYE to both slots in the same match. Each match must have at least one team.');
      return;
    }

    const newSlots = [...slots];
    const targetIndex = newSlots.findIndex((s) => s.id === activeSelection.slotId);
    if (activeSelection.position === 'A') {
      newSlots[targetIndex].teamA = 'BYE';
    } else {
      newSlots[targetIndex].teamB = 'BYE';
    }

    setSlots(newSlots);
    setActiveSelection(null);
  };

  // Spinner result
  const handleSpinResult = (slotId: number, position: 'A' | 'B', selection: SpinnerSelection) => {
    const newSlots = [...slots];
    const targetIndex = newSlots.findIndex((s) => s.id === slotId);

    if (selection.type === 'team') {
      const regUuid = selection.team.registrationUuid || selection.team.uuid;
      // Clear from previous slot if any
      newSlots.forEach((s) => {
        if (s.teamA && s.teamA !== 'BYE' && (s.teamA.registrationUuid === regUuid || s.teamA.uuid === regUuid)) s.teamA = null;
        if (s.teamB && s.teamB !== 'BYE' && (s.teamB.registrationUuid === regUuid || s.teamB.uuid === regUuid)) s.teamB = null;
      });
      if (position === 'A') newSlots[targetIndex].teamA = selection.team;
      else newSlots[targetIndex].teamB = selection.team;
    } else {
      // Double check other position is not BYE
      const otherPos = position === 'A' ? newSlots[targetIndex].teamB : newSlots[targetIndex].teamA;
      if (otherPos === 'BYE') {
        alert('Cannot assign BYE to both slots in the same match.');
        return;
      }
      if (position === 'A') newSlots[targetIndex].teamA = 'BYE';
      else newSlots[targetIndex].teamB = 'BYE';
    }

    setSlots(newSlots);
  };

  const handleRemoveSlot = (e: React.MouseEvent, slotId: number, position: 'A' | 'B') => {
    e.stopPropagation();
    const newSlots = [...slots];
    const targetIndex = newSlots.findIndex((s) => s.id === slotId);
    if (position === 'A') newSlots[targetIndex].teamA = null;
    else newSlots[targetIndex].teamB = null;
    setSlots(newSlots);
  };

  // Auto-Distribute Standard Byes (Strictly at most 1 BYE per match)
  const handleAutoDistributeByes = () => {
    const newSlots = slots.map((s) => ({ ...s }));
    // Clear existing byes first
    newSlots.forEach((s) => {
      if (s.teamA === 'BYE') s.teamA = null;
      if (s.teamB === 'BYE') s.teamB = null;
    });

    // Place at most 1 BYE per match (never pair Bye vs Bye)
    let byesPlaced = 0;
    for (let i = 0; i < totalPairings; i++) {
      if (byesPlaced >= totalByes) break;
      if (!newSlots[i].teamB && newSlots[i].teamA !== 'BYE') {
        newSlots[i].teamB = 'BYE';
        byesPlaced++;
      }
    }

    setSlots(newSlots);
  };

  // Randomize All (Teams + Byes - Guaranteed 0 matches with 2 byes)
  const handleRandomizeAll = () => {
    // 1. Pick `totalByes` distinct match indices that will receive exactly 1 BYE
    const matchIndices = Array.from({ length: totalPairings }, (_, i) => i).sort(() => Math.random() - 0.5);
    const byeMatchIndices = new Set(matchIndices.slice(0, totalByes));

    // 2. Shuffle registered teams
    const shuffledTeams = [...registrations].sort(() => Math.random() - 0.5);
    let teamIdx = 0;

    const newSlots: PairingSlot[] = Array.from({ length: totalPairings }, (_, i) => {
      if (byeMatchIndices.has(i)) {
        // Exactly 1 BYE and 1 Team (never 2 Byes)
        const byeInA = Math.random() > 0.5;
        const team = shuffledTeams[teamIdx++] || null;
        return {
          id: i + 1,
          teamA: byeInA ? 'BYE' : team,
          teamB: byeInA ? team : 'BYE',
        };
      } else {
        // 2 real teams
        return {
          id: i + 1,
          teamA: shuffledTeams[teamIdx++] || null,
          teamB: shuffledTeams[teamIdx++] || null,
        };
      }
    });

    setSlots(newSlots);
  };

  // Clear All
  const handleClearAll = () => {
    setSlots(
      Array.from({ length: totalPairings }, (_, i) => ({
        id: i + 1,
        teamA: null,
        teamB: null,
      }))
    );
  };

  // Publish
  const handlePublish = async () => {
    if (unassignedTeamsCount > 0) {
      alert(`You still have ${unassignedTeamsCount} unassigned teams. All teams must be placed into bracket slots.`);
      return;
    }
    if (remainingByesCount > 0) {
      alert(`You have ${remainingByesCount} unassigned Byes. Fill all ${drawSize} slots before publishing.`);
      return;
    }

    // Validate that NO match has both slots as BYE
    const doubleByeMatch = slots.find((s) => s.teamA === 'BYE' && s.teamB === 'BYE');
    if (doubleByeMatch) {
      alert(`Match ${doubleByeMatch.id} has both slots assigned as BYE. Each match must have at least one team.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        drawType: 'KNOCKOUT',
        drawSize: drawSize,
        totalByes: totalByes,
        pairings: slots.map((s) => ({
          slotIndex: s.id,
          teamAUuid: s.teamA && s.teamA !== 'BYE' ? s.teamA.registrationUuid || s.teamA.uuid : null,
          teamBUuid: s.teamB && s.teamB !== 'BYE' ? s.teamB.registrationUuid || s.teamB.uuid : null,
          isTeamABye: s.teamA === 'BYE',
          isTeamBBye: s.teamB === 'BYE',
        })),
      };

      await DrawService.generateManualDraw(tournamentUuid, payload);
      alert('Tournament fixture published successfully!');
      onComplete();
    } catch (error) {
      console.error('Failed to publish manual draw', error);
      alert('Failed to publish draw. Please verify all slot pairings.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isReadyToPublish = unassignedTeamsCount === 0 && remainingByesCount === 0;

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-300">
      {/* ── TOP CONTROL & DRAW CALCULATION BANNER ──────────────────────── */}
      {/* DESKTOP BANNER (lg+) */}
      <div
        className="hidden lg:block rounded-3xl border p-6 shadow-xl relative overflow-hidden"
        style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Title & Draw Size Configuration */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="w-10 h-10 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                  Tournament Draw Setup & Fixture Builder
                </h3>
                <p className="text-xs text-foreground/50 font-medium">
                  Customize bracket size, assign team slots, or spin the randomizer wheel with automatic byes.
                </p>
              </div>
            </div>

            {/* Auto-Configured Bracket Badge */}
            <div className="flex items-center gap-2 flex-wrap pt-0.5">
              <span className="px-3 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider bg-primary text-primary-foreground shadow-sm">
                {drawSize} Draw Bracket
              </span>
              {totalByes === 0 ? (
                <span className="px-2.5 py-1 rounded-xl text-[11px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Perfect Bracket (0 Byes)
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-xl text-[11px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30 font-mono">
                  {totalByes} Byes Configured
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              onClick={onCancel}
              className="px-4 py-2.5 rounded-xl border text-xs font-bold text-foreground/60 hover:text-foreground transition-all"
              style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border-subtle)' }}
            >
              Cancel
            </button>

            <button
              onClick={handlePublish}
              disabled={isSubmitting || !isReadyToPublish}
              className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg ${isReadyToPublish
                ? 'bg-primary text-black shadow-primary/30 hover:scale-105 active:scale-95'
                : 'bg-foreground/10 text-foreground/40 border border-foreground/10 cursor-not-allowed'
                }`}
            >
              <Play className="w-4 h-4 fill-current shrink-0" />
              <span>{isSubmitting ? 'Publishing...' : 'Publish Tournament Draw'}</span>
            </button>
          </div>
        </div>

        {/* Desktop Live Draw Math Breakdown */}
        <div className="grid grid-cols-4 gap-3 pt-5 mt-5 border-t" style={{ borderColor: 'var(--athlon-border)' }}>
          {/* Registered Teams */}
          <div
            className="p-3.5 rounded-2xl border"
            style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border-subtle)' }}
          >
            <span className="text-[10px] font-black uppercase text-foreground/40 block">Registered Teams</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-lg font-black text-foreground font-mono">{totalTeams}</span>
            </div>
            <span className="text-[10px] text-foreground/50 font-medium">
              {assignedTeamsCount}/{totalTeams} Assigned
            </span>
          </div>

          {/* Total Byes */}
          <div
            className="p-3.5 rounded-2xl border"
            style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border-subtle)' }}
          >
            <span className="text-[10px] font-black uppercase text-foreground/40 block">Total Byes</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span className="text-lg font-black text-emerald-400 font-mono">{totalByes}</span>
            </div>
            <span className="text-[10px] text-foreground/50 font-medium">
              {assignedByesCount}/{totalByes} Byes Assigned
            </span>
          </div>

          {/* Round 1 Active Matches */}
          <div
            className="p-3.5 rounded-2xl border"
            style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border-subtle)' }}
          >
            <span className="text-[10px] font-black uppercase text-foreground/40 block">Round 1 Matches</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="text-lg font-black text-amber-400 font-mono">
                {round1ActiveMatches > 0 ? `${round1ActiveMatches} Matches` : '0 (Direct Round 2)'}
              </span>
            </div>
            <span className="text-[10px] text-foreground/50 font-medium">
              {round1ActiveMatches * 2} Teams play in R1
            </span>
          </div>

          {/* Direct Round 2 Advances */}
          <div
            className="p-3.5 rounded-2xl border"
            style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border-subtle)' }}
          >
            <span className="text-[10px] font-black uppercase text-foreground/40 block">Direct R2 Byes</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <ArrowRight className="w-4 h-4 text-blue-400" />
              <span className="text-lg font-black text-blue-400 font-mono">{totalByes} Teams</span>
            </div>
            <span className="text-[10px] text-foreground/50 font-medium">Advance to Round 2</span>
          </div>
        </div>
      </div>

      {/* MOBILE COMPACT HEADER (block lg:hidden) */}
      <div
        className="block lg:hidden rounded-2xl border p-4 shadow-lg space-y-3 relative overflow-hidden"
        style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
      >
        {/* Mobile Header Row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shrink-0">
              <Sliders className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-black text-foreground truncate">Fixture Builder</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="px-1.5 py-0.2 rounded text-[9.5px] font-black bg-primary text-primary-foreground">
                  {drawSize} Draw
                </span>
                {totalByes === 0 ? (
                  <span className="text-[9.5px] font-bold text-emerald-400">0 Byes</span>
                ) : (
                  <span className="text-[9.5px] font-bold text-amber-400 font-mono">{totalByes} Byes</span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Action Top Right */}
          <button
            onClick={onCancel}
            className="px-2.5 py-1.5 rounded-xl border text-[11px] font-bold text-foreground/60 hover:text-foreground"
            style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border-subtle)' }}
          >
            Cancel
          </button>
        </div>

        {/* Mobile 4-Column Micro Stats Bar */}
        <div
          className="grid grid-cols-4 gap-1 p-2 rounded-xl border text-center"
          style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border-subtle)' }}
        >
          <div className="p-1 rounded-lg bg-black/20">
            <span className="text-[8.5px] font-black uppercase text-foreground/40 block leading-tight">Teams</span>
            <span className="text-xs font-black text-foreground font-mono block mt-0.5">{totalTeams}</span>
            <span className="text-[8px] text-foreground/40">{assignedTeamsCount} done</span>
          </div>

          <div className="p-1 rounded-lg bg-black/20">
            <span className="text-[8.5px] font-black uppercase text-foreground/40 block leading-tight">Byes</span>
            <span className="text-xs font-black text-emerald-400 font-mono block mt-0.5">{totalByes}</span>
            <span className="text-[8px] text-foreground/40">{assignedByesCount} done</span>
          </div>

          <div className="p-1 rounded-lg bg-black/20">
            <span className="text-[8.5px] font-black uppercase text-foreground/40 block leading-tight">R1 Match</span>
            <span className="text-xs font-black text-amber-400 font-mono block mt-0.5">{round1ActiveMatches}</span>
            <span className="text-[8px] text-foreground/40">Active</span>
          </div>

          <div className="p-1 rounded-lg bg-black/20">
            <span className="text-[8.5px] font-black uppercase text-foreground/40 block leading-tight">To R2</span>
            <span className="text-xs font-black text-blue-400 font-mono block mt-0.5">{totalByes}</span>
            <span className="text-[8px] text-foreground/40">Direct</span>
          </div>
        </div>

        {/* Publish Action Button (Full Width Mobile) */}
        <button
          onClick={handlePublish}
          disabled={isSubmitting || !isReadyToPublish}
          className={`w-full py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md ${isReadyToPublish
            ? 'bg-primary text-black shadow-primary/30 active:scale-95'
            : 'bg-foreground/10 text-foreground/40 border border-foreground/10 cursor-not-allowed'
            }`}
        >
          <Play className="w-3.5 h-3.5 fill-current shrink-0" />
          <span>{isSubmitting ? 'Publishing...' : 'Publish Tournament Draw'}</span>
        </button>
      </div>

      {/* ── DRAW BUILDER WORKSPACE ────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Sidebar: Available Teams & Bye Pool (Desktop Only) */}
        <div
          className="hidden lg:flex w-80 rounded-3xl border p-4 sm:p-5 flex-col shrink-0 shadow-lg space-y-4"
          style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
        >
          {/* Header & Quick Action Buttons */}
          <div className="space-y-3 pb-3 border-b" style={{ borderColor: 'var(--athlon-border)' }}>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-black text-sm text-foreground uppercase tracking-tight">Roster & Bye Pool</h4>
                <p className="text-[10.5px] text-foreground/50">Click any slot to assign</p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-primary/15 text-primary border border-primary/30 font-mono">
                {unassignedTeamsCount} Left
              </span>
            </div>

            {/* Quick Helper Tools */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleAutoDistributeByes}
                disabled={totalByes === 0}
                className="py-1.5 px-2 rounded-xl text-[10.5px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 transition-all flex items-center justify-center gap-1 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                title="Automatically place Byes into standard bracket slots"
              >
                <Sparkles className="w-3 h-3 shrink-0" />
                <span>Auto Byes</span>
              </button>

              <button
                type="button"
                onClick={handleRandomizeAll}
                className="py-1.5 px-2 rounded-xl text-[10.5px] font-black uppercase tracking-wider bg-primary/15 text-primary border border-primary/30 hover:bg-primary/25 transition-all flex items-center justify-center gap-1 active:scale-95 whitespace-nowrap"
                title="Shuffle all teams and byes into bracket"
              >
                <Dices className="w-3 h-3 shrink-0" />
                <span>Random</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleClearAll}
              className="w-full py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider border text-foreground/40 hover:text-foreground transition-all flex items-center justify-center gap-1"
              style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border-subtle)' }}
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear All Pairings</span>
            </button>
          </div>

          {/* BYE Token Card */}
          {totalByes > 0 && (
            <div
              className="p-3 rounded-2xl border flex items-center justify-between"
              style={{
                backgroundColor: 'var(--athlon-surface)',
                borderColor: remainingByesCount > 0 ? 'rgba(16, 185, 129, 0.4)' : 'var(--athlon-border-subtle)',
              }}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-black text-xs text-foreground block">BYE Token</span>
                  <span className="text-[10px] text-foreground/50">Skip to Round 2</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {remainingByesCount} Left
              </span>
            </div>
          )}

          {/* Teams List */}
          <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
            {registrations.map((reg) => {
              const assigned = isTeamAssigned(reg.registrationUuid || reg.uuid);

              return (
                <div
                  key={reg.registrationUuid || reg.uuid}
                  className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all ${assigned
                    ? 'opacity-40 border-white/5 bg-white/[0.02]'
                    : 'border-white/10 hover:border-primary/40 bg-surface shadow-sm'
                    }`}
                  style={!assigned ? { backgroundColor: 'var(--athlon-surface)' } : {}}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Users className={`w-3.5 h-3.5 shrink-0 ${assigned ? 'text-foreground/30' : 'text-primary'}`} />
                    <span className="font-bold text-foreground truncate">{reg.teamName}</span>
                  </div>
                  {assigned && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase text-primary bg-primary/10 border border-primary/20 shrink-0">
                      Assigned
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Canvas: Pairing Match Slots */}
        <div
          className="flex-1 w-full rounded-2xl sm:rounded-3xl border p-3.5 sm:p-6 shadow-xl space-y-4 sm:space-y-5"
          style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
        >
          {/* Mobile-Only Quick Action Bar */}
          <div
            className="block lg:hidden rounded-2xl p-3 border shadow-sm space-y-2.5"
            style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border-subtle)' }}
          >
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="font-black uppercase tracking-wider text-foreground/80 text-[11px]">
                {unassignedTeamsCount} Teams • {remainingByesCount} Byes Left
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-black bg-primary/15 text-primary border border-primary/30">
                {assignedTeamsCount + assignedByesCount}/{drawSize} Filled
              </span>
            </div>

            {/* Quick 3D Buttons Bar */}
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={handleAutoDistributeByes}
                disabled={totalByes === 0}
                className="py-2 px-1 rounded-xl text-[10.5px] font-black uppercase tracking-wider bg-gradient-to-b from-emerald-500/20 to-emerald-500/10 text-emerald-400 border border-emerald-500/35 hover:border-emerald-500/60 shadow-[0_2px_6px_rgba(16,185,129,0.15)] transition-all flex items-center justify-center gap-1 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap"
              >
                <Sparkles className="w-3 h-3 shrink-0" />
                <span>Auto Byes</span>
              </button>

              <button
                type="button"
                onClick={handleRandomizeAll}
                className="py-2 px-1 rounded-xl text-[10.5px] font-black uppercase tracking-wider bg-gradient-to-b from-primary/25 to-primary/10 text-primary border border-primary/40 hover:border-primary/70 shadow-[0_2px_6px_rgba(var(--primary-rgb),0.15)] transition-all flex items-center justify-center gap-1 active:scale-95 whitespace-nowrap"
              >
                <Dices className="w-3 h-3 shrink-0" />
                <span>Random</span>
              </button>

              <button
                type="button"
                onClick={handleClearAll}
                className="py-2 px-1 rounded-xl text-[10.5px] font-bold uppercase tracking-wider border border-white/10 text-foreground/50 hover:text-foreground transition-all flex items-center justify-center gap-1 active:scale-95"
                style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}
              >
                <RotateCcw className="w-3 h-3" />
                <span>Clear</span>
              </button>
            </div>
          </div>

          {/* Match Canvas Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b" style={{ borderColor: 'var(--athlon-border)' }}>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base sm:text-lg font-black text-foreground">Round 1 Fixture Slots</h4>
                <span className="px-2 py-0.5 rounded-full text-xs font-black bg-primary/20 text-primary font-mono">
                  {totalPairings} Matches
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-foreground/50 mt-0.5">
                Tap any slot to assign, or tap the dice icon for the wheel spinner.
              </p>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-foreground/60">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl border" style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border-subtle)' }}>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{assignedTeamsCount + assignedByesCount}/{drawSize} Slots Filled</span>
              </span>
            </div>
          </div>

          {/* Slots Grid with 3D Match Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
            {slots.map((slot) => {
              const isMatchWithBye = slot.teamA === 'BYE' || slot.teamB === 'BYE';
              const advancingTeam =
                slot.teamA && slot.teamA !== 'BYE' && slot.teamB === 'BYE'
                  ? slot.teamA
                  : slot.teamB && slot.teamB !== 'BYE' && slot.teamA === 'BYE'
                    ? slot.teamB
                    : null;

              const isMatchReady = slot.teamA && slot.teamB && !isMatchWithBye;

              return (
                <div
                  key={slot.id}
                  className="rounded-2xl border p-3 sm:p-4 shadow-md space-y-2.5 transition-all hover:border-primary/50 relative overflow-hidden group"
                  style={{
                    backgroundColor: 'var(--athlon-surface)',
                    borderColor: advancingTeam
                      ? 'rgba(16, 185, 129, 0.4)'
                      : isMatchReady
                        ? 'rgba(var(--primary-rgb), 0.35)'
                        : 'var(--athlon-border-subtle)',
                  }}
                >
                  {/* Match Header Badge */}
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-foreground/60">
                    <span className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded-md bg-white/10 border border-white/10 font-mono text-[10px] text-foreground font-black">
                        #{slot.id < 10 ? `0${slot.id}` : slot.id}
                      </span>
                      <span className="font-bold text-foreground/70">MATCH {slot.id}</span>
                    </span>

                    {advancingTeam ? (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-1 shadow-sm">
                        <Trophy className="w-2.5 h-2.5" />
                        <span>Advances to R2</span>
                      </span>
                    ) : isMatchReady ? (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase text-primary bg-primary/15 border border-primary/30 flex items-center gap-1 shadow-sm">
                        <Swords className="w-2.5 h-2.5" />
                        <span>Ready</span>
                      </span>
                    ) : (
                      <span className="text-[9px] text-foreground/40 font-medium">Unfilled</span>
                    )}
                  </div>

                  {/* Team A Slot */}
                  <div
                    onClick={() => setActiveSelection({ slotId: slot.id, position: 'A' })}
                    className={`cursor-pointer min-h-[46px] rounded-xl border-2 flex items-center px-3 transition-all active:scale-[0.99] ${slot.teamA
                      ? slot.teamA === 'BYE'
                        ? 'border-emerald-500/60 bg-emerald-500/10 shadow-sm'
                        : 'border-primary/60 bg-gradient-to-r from-primary/15 via-primary/5 to-transparent shadow-sm'
                      : 'border-dashed border-white/15 hover:border-primary/50 bg-black/25'
                      }`}
                  >
                    {slot.teamA ? (
                      <div className="w-full flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          {slot.teamA === 'BYE' ? (
                            <>
                              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                                <Shield className="w-3.5 h-3.5" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <span className="font-black text-xs text-emerald-400 block">BYE</span>
                                <span className="text-[9px] text-foreground/40 block leading-tight truncate">
                                  Opponent advances to R2
                                </span>
                              </div>
                            </>
                          ) : (
                            <>
                              {(() => {
                                const teamA = slot.teamA as Registration;
                                const allPhotos = { ...internalPhotos, ...(playerPhotos || {}) };
                                const getPPhoto = (p?: RegistrationPlayer) => {
                                  if (!p) return null;
                                  const direct = p.photo || p.photoUrl || p.avatar || p.profilePic || p.userPhoto || (p as any).image;
                                  if (direct) {
                                    return direct.startsWith('http') || direct.startsWith('data:') || direct.startsWith('/') ? direct : UserService.getPhotoUrl(direct);
                                  }
                                  if (p.phoneNumber && allPhotos[p.phoneNumber]) {
                                    return allPhotos[p.phoneNumber];
                                  }
                                  return `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(p.playerName || teamA?.teamName || '')}&backgroundColor=0ea5e9,10b981,8b5cf6,f59e0b`;
                                };

                                const players = teamA?.players || [];

                                if (players.length >= 2) {
                                  const p1Url = getPPhoto(players[0]);
                                  const p2Url = getPPhoto(players[1]);

                                  return (
                                    <div className="relative w-8 h-7 flex items-center shrink-0">
                                      {p1Url ? (
                                        <img src={p1Url} alt="P1" className="w-6 h-6 rounded-full object-cover border-2 border-[var(--athlon-card)] shadow-sm shrink-0 z-10" />
                                      ) : (
                                        <div className="w-6 h-6 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center text-[9px] font-black shrink-0 z-10">
                                          {players[0]?.playerName?.charAt(0).toUpperCase() || 'P'}
                                        </div>
                                      )}
                                      {p2Url ? (
                                        <img src={p2Url} alt="P2" className="w-6 h-6 rounded-full object-cover border-2 border-[var(--athlon-card)] shadow-sm shrink-0 -ml-2.5" />
                                      ) : (
                                        <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center text-[9px] font-black shrink-0 -ml-2.5">
                                          {players[1]?.playerName?.charAt(0).toUpperCase() || 'P'}
                                        </div>
                                      )}
                                    </div>
                                  );
                                }

                                if (players.length === 1) {
                                  const singleUrl = getPPhoto(players[0]);
                                  if (singleUrl) {
                                    return (
                                      <div className="w-7 h-7 rounded-lg overflow-hidden border border-white/15 shrink-0 bg-black/20 shadow-sm">
                                        <img src={singleUrl} alt={slot.teamA.teamName} className="w-full h-full object-cover" />
                                      </div>
                                    );
                                  }
                                }

                                const directTeamPhoto = (slot.teamA as any).photo || (slot.teamA as any).teamLogo || (slot.teamA as any).logo;
                                const teamUrl = directTeamPhoto ? UserService.getPhotoUrl(directTeamPhoto) : `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(slot.teamA.teamName)}&backgroundColor=0ea5e9,10b981,8b5cf6,f59e0b`;

                                return (
                                  <div className="w-7 h-7 rounded-lg overflow-hidden border border-white/15 shrink-0 bg-black/20 shadow-sm">
                                    <img src={teamUrl} alt={slot.teamA.teamName} className="w-full h-full object-cover" />
                                  </div>
                                );
                              })()}
                              <span className="font-bold text-xs text-foreground truncate">{slot.teamA.teamName}</span>
                            </>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => handleRemoveSlot(e, slot.id, 'A')}
                          className="p-1 rounded-lg hover:bg-red-500/20 text-foreground/40 hover:text-red-400 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-full flex items-center justify-between gap-2 py-0.5">
                        {/* Option 1: Manual Team Selection */}
                        <div
                          onClick={() => setActiveSelection({ slotId: slot.id, position: 'A' })}
                          className="flex items-center gap-2 text-foreground/70 hover:text-primary transition-colors min-w-0 flex-1 text-left cursor-pointer group"
                        >
                          <div className="w-6 h-6 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 group-hover:scale-105 transition-transform">
                            <UserPlus className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-[11.5px] sm:text-xs font-bold truncate">
                            Choose Team 1
                          </span>
                        </div>

                        {/* Option 2: Wheel Spinner Randomizer */}
                        <div className="flex items-center shrink-0" onClick={(e) => e.stopPropagation()}>
                          <TeamSpinner
                            unassignedTeams={unassignedTeams}
                            remainingByes={slot.teamB === 'BYE' ? 0 : remainingByesCount}
                            onSelect={(res) => handleSpinResult(slot.id, 'A', res)}
                            triggerClassName="px-2.5 py-1 rounded-lg bg-primary/15 hover:bg-primary/25 border border-primary/35 text-primary text-[10.5px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
                            triggerLabel="Spin"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 3D Battle VS Component */}
                  <div className="flex items-center justify-center my-1 relative z-10 select-none">
                    {/* Glowing Battle Line Behind VS */}
                    <div className="absolute inset-x-3 h-[1.5px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

                    {/* 3D Tactile VS Token */}
                    <div
                      className="relative px-3.5 py-0.5 rounded-full border border-primary/40 flex items-center justify-center shadow-md transition-transform hover:scale-110 active:scale-95"
                      style={{
                        backgroundColor: 'var(--athlon-card)',
                        boxShadow: '0 3px 8px rgba(0,0,0,0.18), inset 0 1px 1px rgba(255,255,255,0.2)',
                      }}
                    >
                      <span className="text-[10px] font-black italic tracking-widest text-primary drop-shadow-sm font-sans block">
                        VS
                      </span>
                    </div>
                  </div>

                  {/* Team B Slot */}
                  <div
                    className={`min-h-[46px] rounded-xl border-2 flex items-center px-3 transition-all ${slot.teamB
                      ? slot.teamB === 'BYE'
                        ? 'border-emerald-500/60 bg-emerald-500/10 shadow-sm cursor-pointer'
                        : 'border-primary/60 bg-gradient-to-r from-primary/15 via-primary/5 to-transparent shadow-sm cursor-pointer'
                      : 'border-dashed border-white/15 hover:border-primary/50 bg-black/25'
                      }`}
                  >
                    {slot.teamB ? (
                      <div className="w-full flex items-center justify-between gap-2">
                        <div
                          onClick={() => setActiveSelection({ slotId: slot.id, position: 'B' })}
                          className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                        >
                          {slot.teamB === 'BYE' ? (
                            <>
                              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                                <Shield className="w-3.5 h-3.5" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <span className="font-black text-xs text-emerald-400 block">BYE</span>
                                <span className="text-[9px] text-foreground/40 block leading-tight truncate">
                                  Opponent advances to R2
                                </span>
                              </div>
                            </>
                          ) : (
                            <>
                              {(() => {
                                const teamB = slot.teamB as Registration;
                                const allPhotos = { ...internalPhotos, ...(playerPhotos || {}) };
                                const getPPhoto = (p?: RegistrationPlayer) => {
                                  if (!p) return null;
                                  const direct = p.photo || p.photoUrl || p.avatar || p.profilePic || p.userPhoto || (p as any).image;
                                  if (direct) {
                                    return direct.startsWith('http') || direct.startsWith('data:') || direct.startsWith('/') ? direct : UserService.getPhotoUrl(direct);
                                  }
                                  if (p.phoneNumber && allPhotos[p.phoneNumber]) {
                                    return allPhotos[p.phoneNumber];
                                  }
                                  return `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(p.playerName || teamB?.teamName || '')}&backgroundColor=0ea5e9,10b981,8b5cf6,f59e0b`;
                                };

                                const players = teamB?.players || [];

                                if (players.length >= 2) {
                                  const p1Url = getPPhoto(players[0]);
                                  const p2Url = getPPhoto(players[1]);

                                  return (
                                    <div className="relative w-8 h-7 flex items-center shrink-0">
                                      {p1Url ? (
                                        <img src={p1Url} alt="P1" className="w-6 h-6 rounded-full object-cover border-2 border-[var(--athlon-card)] shadow-sm shrink-0 z-10" />
                                      ) : (
                                        <div className="w-6 h-6 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center text-[9px] font-black shrink-0 z-10">
                                          {players[0]?.playerName?.charAt(0).toUpperCase() || 'P'}
                                        </div>
                                      )}
                                      {p2Url ? (
                                        <img src={p2Url} alt="P2" className="w-6 h-6 rounded-full object-cover border-2 border-[var(--athlon-card)] shadow-sm shrink-0 -ml-2.5" />
                                      ) : (
                                        <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center text-[9px] font-black shrink-0 -ml-2.5">
                                          {players[1]?.playerName?.charAt(0).toUpperCase() || 'P'}
                                        </div>
                                      )}
                                    </div>
                                  );
                                }

                                if (players.length === 1) {
                                  const singleUrl = getPPhoto(players[0]);
                                  if (singleUrl) {
                                    return (
                                      <div className="w-7 h-7 rounded-lg overflow-hidden border border-white/15 shrink-0 bg-black/20 shadow-sm">
                                        <img src={singleUrl} alt={slot.teamB.teamName} className="w-full h-full object-cover" />
                                      </div>
                                    );
                                  }
                                }

                                const directTeamPhoto = (slot.teamB as any).photo || (slot.teamB as any).teamLogo || (slot.teamB as any).logo;
                                const teamUrl = directTeamPhoto ? UserService.getPhotoUrl(directTeamPhoto) : `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(slot.teamB.teamName)}&backgroundColor=0ea5e9,10b981,8b5cf6,f59e0b`;

                                return (
                                  <div className="w-7 h-7 rounded-lg overflow-hidden border border-white/15 shrink-0 bg-black/20 shadow-sm">
                                    <img src={teamUrl} alt={slot.teamB.teamName} className="w-full h-full object-cover" />
                                  </div>
                                );
                              })()}
                              <span className="font-bold text-xs text-foreground truncate">{slot.teamB.teamName}</span>
                            </>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => handleRemoveSlot(e, slot.id, 'B')}
                          className="p-1 rounded-lg hover:bg-red-500/20 text-foreground/40 hover:text-red-400 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-full flex items-center justify-between gap-2 py-0.5">
                        {/* Option 1: Manual Team Selection */}
                        <div
                          onClick={() => setActiveSelection({ slotId: slot.id, position: 'B' })}
                          className="flex items-center gap-2 text-foreground/70 hover:text-primary transition-colors min-w-0 flex-1 text-left cursor-pointer group"
                        >
                          <div className="w-6 h-6 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 group-hover:scale-105 transition-transform">
                            <UserPlus className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-[11.5px] sm:text-xs font-bold truncate">
                            Choose Team 2 (or BYE)
                          </span>
                        </div>

                        {/* Option 2: Wheel Spinner Randomizer */}
                        <div className="flex items-center shrink-0" onClick={(e) => e.stopPropagation()}>
                          <TeamSpinner
                            unassignedTeams={unassignedTeams}
                            remainingByes={slot.teamA === 'BYE' ? 0 : remainingByesCount}
                            onSelect={(res) => handleSpinResult(slot.id, 'B', res)}
                            triggerClassName="px-2.5 py-1 rounded-lg bg-primary/15 hover:bg-primary/25 border border-primary/35 text-primary text-[10.5px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
                            triggerLabel="Spin"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Warnings / Reminders */}
          {!isReadyToPublish && (
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>
                {unassignedTeamsCount > 0 && `${unassignedTeamsCount} teams remaining. `}
                {remainingByesCount > 0 && `${remainingByesCount} byes remaining. `}
                Assign all slots to publish fixture.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── SELECTION POPUP MODAL (Team or BYE) ─────────────────────────── */}
      {activeSelection && (() => {
        const activeSlot = slots.find((s) => s.id === activeSelection.slotId);
        const otherPositionIsBye = activeSlot
          ? activeSelection.position === 'A'
            ? activeSlot.teamB === 'BYE'
            : activeSlot.teamA === 'BYE'
          : false;

        return (
          <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-0 animate-in fade-in duration-200">
            <div
              className="rounded-t-3xl sm:rounded-3xl border w-full sm:max-w-md max-h-[80vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200 overflow-hidden"
              style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 sm:p-5 border-b" style={{ borderColor: 'var(--athlon-border)' }}>
                <div>
                  <h3 className="font-black text-base text-foreground">Select Match Slot</h3>
                  <p className="text-xs text-foreground/50">
                    Match {activeSelection.slotId} • Slot {activeSelection.position}
                  </p>
                </div>
                <button
                  onClick={() => setActiveSelection(null)}
                  className="p-1.5 rounded-full hover:bg-white/10 text-foreground/60 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-4 space-y-3 overflow-y-auto flex-1">
                {/* Assign BYE Option */}
                {totalByes > 0 && (
                  <button
                    type="button"
                    onClick={handleSelectBye}
                    disabled={otherPositionIsBye || remainingByesCount <= 0}
                    className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all group ${otherPositionIsBye
                      ? 'opacity-40 border-white/10 bg-white/[0.02] cursor-not-allowed'
                      : remainingByesCount <= 0
                        ? 'opacity-40 border-white/10 bg-white/[0.02] cursor-not-allowed'
                        : 'bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20 active:scale-[0.99]'
                      }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform shrink-0">
                        <Shield className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="font-black text-xs text-emerald-400 block">
                          {otherPositionIsBye ? 'BYE Not Allowed' : 'Assign BYE'}
                        </span>
                        <span className="text-[10px] text-foreground/50 block truncate">
                          {otherPositionIsBye
                            ? 'Opponent in this match is already a BYE'
                            : 'Opponent advances automatically to Round 2'}
                        </span>
                      </div>
                    </div>
                    {!otherPositionIsBye && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-black bg-emerald-500/20 text-emerald-400 shrink-0">
                        {remainingByesCount} Left
                      </span>
                    )}
                  </button>
                )}

                {/* Roster Teams List */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-foreground/40 px-1 block">
                    Registered Teams ({unassignedTeamsCount} unassigned)
                  </span>

                  {registrations.map((reg) => {
                    const assigned = isTeamAssigned(reg.registrationUuid || reg.uuid);

                    return (
                      <button
                        key={reg.registrationUuid || reg.uuid}
                        type="button"
                        onClick={() => handleSelectTeam(reg)}
                        className={`w-full p-3 rounded-xl border flex items-center justify-between text-left transition-all ${assigned
                          ? 'opacity-40 border-white/5 bg-white/[0.02]'
                          : 'border-white/10 hover:border-primary/50 hover:bg-primary/5 bg-surface'
                          }`}
                        style={!assigned ? { backgroundColor: 'var(--athlon-surface)' } : {}}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <Users className={`w-4 h-4 shrink-0 ${assigned ? 'text-foreground/30' : 'text-primary'}`} />
                          <span className={`font-bold text-xs truncate ${assigned ? 'text-foreground/40' : 'text-foreground'}`}>
                            {reg.teamName}
                          </span>
                        </div>
                        {assigned && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase text-primary bg-primary/10 border border-primary/20 shrink-0">
                            Assigned
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}


