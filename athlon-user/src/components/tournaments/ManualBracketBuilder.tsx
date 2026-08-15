import React, { useState } from 'react';
import { Registration, DrawService } from '@/lib/api/tournaments';
import { UsersIcon, CheckCircleIcon, PlayIcon, AlertCircleIcon, ChevronRightIcon, XIcon } from 'lucide-react';
import { TeamSpinner } from './TeamSpinner';

interface ManualBracketBuilderProps {
  tournamentUuid: string;
  registrations: Registration[];
  onComplete: () => void;
  onCancel: () => void;
}

export function ManualBracketBuilder({ tournamentUuid, registrations, onComplete, onCancel }: ManualBracketBuilderProps) {
  const numTeams = registrations.length;
  const rounds = Math.max(1, Math.ceil(Math.log2(numTeams)));
  const drawSize = Math.pow(2, rounds);
  const numPairings = drawSize / 2;

  const initialSlots = Array.from({ length: numPairings }, (_, i) => ({
    id: i + 1,
    teamA: null as Registration | null,
    teamB: null as Registration | null
  }));

  const [slots, setSlots] = useState(initialSlots);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Selection Modal State
  const [activeSelection, setActiveSelection] = useState<{ slotId: number, position: 'A' | 'B' } | null>(null);

  const getAssignedCount = () => {
    let count = 0;
    slots.forEach(s => {
      if (s.teamA) count++;
      if (s.teamB) count++;
    });
    return count;
  };

  const getUnassignedCount = () => registrations.length - getAssignedCount();

  const isTeamAssigned = (regUuid: string) => {
    for (const slot of slots) {
      if (slot.teamA && (slot.teamA.registrationUuid === regUuid || slot.teamA.uuid === regUuid)) return true;
      if (slot.teamB && (slot.teamB.registrationUuid === regUuid || slot.teamB.uuid === regUuid)) return true;
    }
    return false;
  };

  const handleSelectTeam = (reg: Registration) => {
    if (!activeSelection) return;

    const regUuid = reg.registrationUuid || reg.uuid;

    const newSlots = slots.map(slot => {
      let s = { ...slot };
      // Remove this team from any existing slot
      if (s.teamA && (s.teamA.registrationUuid === regUuid || s.teamA.uuid === regUuid)) s.teamA = null;
      if (s.teamB && (s.teamB.registrationUuid === regUuid || s.teamB.uuid === regUuid)) s.teamB = null;
      return s;
    });

    const targetIndex = newSlots.findIndex(s => s.id === activeSelection.slotId);
    if (activeSelection.position === 'A') {
      newSlots[targetIndex].teamA = reg;
    } else {
      newSlots[targetIndex].teamB = reg;
    }

    setSlots(newSlots);
    setActiveSelection(null);
  };

  const handleSpinSelect = (slotId: number, position: 'A' | 'B', team: Registration) => {
    const newSlots = [...slots];
    const targetIndex = newSlots.findIndex(s => s.id === slotId);
    if (position === 'A') {
      newSlots[targetIndex].teamA = team;
    } else {
      newSlots[targetIndex].teamB = team;
    }
    setSlots(newSlots);
  };

  const unassignedTeams = registrations.filter(reg => !isTeamAssigned(reg.registrationUuid || reg.uuid));

  const handleRemoveTeam = (e: React.MouseEvent, slotId: number, position: 'A' | 'B') => {
    e.stopPropagation();
    const newSlots = [...slots];
    const targetIndex = newSlots.findIndex(s => s.id === slotId);
    if (position === 'A') newSlots[targetIndex].teamA = null;
    else newSlots[targetIndex].teamB = null;
    setSlots(newSlots);
  };

  const handlePublish = async () => {
    if (getUnassignedCount() > 0) {
      alert(`You still have ${getUnassignedCount()} unassigned players. All players must be assigned to slots.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        drawType: "KNOCKOUT",
        pairings: slots.map(s => ({
          slotIndex: s.id,
          teamAUuid: s.teamA?.registrationUuid || s.teamA?.uuid || null,
          teamBUuid: s.teamB?.registrationUuid || s.teamB?.uuid || null
        }))
      };

      await DrawService.generateManualDraw(tournamentUuid, payload);
      alert("Manual Draw published successfully!");
      onComplete();
    } catch (error) {
      console.error("Failed to publish manual draw", error);
      alert("Failed to publish draw. Check console.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 mt-8 animate-in fade-in duration-300 relative">

      {/* Sidebar: Unassigned Players (Hidden on Mobile) */}
      <div className="hidden lg:flex w-80 bg-surface border border-border rounded-xl p-4 flex-col">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
          <div>
            <h3 className="font-bold text-foreground">Team Roster</h3>
            <p className="text-xs text-text-muted mt-0.5">Click slots to assign</p>
          </div>
          <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold">
            {getUnassignedCount()} Left
          </span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 min-h-[300px]">
          {registrations.map(reg => {
            const assigned = isTeamAssigned(reg.registrationUuid || reg.uuid);
            return (
              <div
                key={reg.registrationUuid || reg.uuid}
                className={`p-3 rounded-lg flex items-center justify-between transition-all ${assigned
                    ? 'bg-background/50 border border-border/30 opacity-60'
                    : 'bg-background border border-border hover:border-primary/50 shadow-sm'
                  }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <UsersIcon className={`w-4 h-4 shrink-0 ${assigned ? 'text-text-muted' : 'text-primary'}`} />
                  <span className="text-sm font-semibold text-foreground truncate">{reg.teamName}</span>
                </div>
                {assigned && <span className="text-[10px] font-bold uppercase tracking-wider text-primary ml-2">Assigned</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Canvas: Bracket Slots */}
      <div className="flex-1 bg-surface border border-border rounded-xl p-4 md:p-6 flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold text-foreground">Round 1</h3>
            <p className="text-sm text-text-muted mt-1">Tap a slot to assign a team.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-text-muted hover:text-foreground bg-background border border-border rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePublish}
              disabled={isSubmitting || getUnassignedCount() > 0}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-black rounded-lg font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 whitespace-nowrap"
            >
              <PlayIcon className="w-4 h-4" />
              {isSubmitting ? "Publishing..." : "Publish"}
            </button>
          </div>
        </div>

        {/* Mobile progress indicator */}
        <div className="lg:hidden flex items-center justify-between bg-background p-3 rounded-lg border border-border mb-6">
          <span className="text-sm font-semibold">Teams Assigned</span>
          <span className="text-sm font-bold bg-primary/20 text-primary px-3 py-1 rounded-full">
            {getAssignedCount()} / {registrations.length}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 overflow-y-auto">
          {slots.map(slot => (
            <div key={slot.id} className="bg-background border-2 border-border rounded-xl p-4 flex flex-col shadow-inner">
              <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Match {slot.id}</div>

              <div className="flex flex-col gap-2">
                {/* Team A Slot */}
                <div
                  onClick={() => setActiveSelection({ slotId: slot.id, position: 'A' })}
                  className={`cursor-pointer h-12 rounded-lg border-2 flex items-center px-3 transition-colors ${slot.teamA
                      ? 'border-primary border-solid bg-primary/5'
                      : 'border-border border-dashed hover:border-primary/50 bg-surface/50'
                    }`}
                >
                  {slot.teamA ? (
                    <div className="w-full flex items-center justify-between">
                      <span className="text-sm font-bold text-foreground truncate pr-2">{slot.teamA.teamName}</span>
                      <div
                        onClick={(e) => handleRemoveTeam(e, slot.id, 'A')}
                        className="p-1.5 hover:bg-destructive/20 rounded-md text-text-muted hover:text-destructive transition-colors"
                      >
                        <XIcon className="w-4 h-4" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-full flex items-center justify-between text-text-muted">
                      <span className="text-xs font-medium">Select Team 1</span>
                      <div className="flex items-center gap-2">
                        <TeamSpinner 
                          unassignedTeams={unassignedTeams} 
                          onSelect={(team) => handleSpinSelect(slot.id, 'A', team)} 
                        />
                        <ChevronRightIcon className="w-4 h-4" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-center -my-2 relative z-10 pointer-events-none">
                  <span className="bg-surface text-[10px] font-black text-text-muted uppercase px-2 py-0.5 rounded-sm">VS</span>
                </div>

                {/* Team B Slot */}
                <div
                  onClick={() => setActiveSelection({ slotId: slot.id, position: 'B' })}
                  className={`cursor-pointer h-12 rounded-lg border-2 flex items-center px-3 transition-colors ${slot.teamB
                      ? 'border-primary border-solid bg-primary/5'
                      : 'border-border border-dashed hover:border-primary/50 bg-surface/50'
                    }`}
                >
                  {slot.teamB ? (
                    <div className="w-full flex items-center justify-between">
                      <span className="text-sm font-bold text-foreground truncate pr-2">{slot.teamB.teamName}</span>
                      <div
                        onClick={(e) => handleRemoveTeam(e, slot.id, 'B')}
                        className="p-1.5 hover:bg-destructive/20 rounded-md text-text-muted hover:text-destructive transition-colors"
                      >
                        <XIcon className="w-4 h-4" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-full flex items-center justify-between text-text-muted">
                      <span className="text-xs font-medium">Select Team 2 (or Bye)</span>
                      <div className="flex items-center gap-2">
                        <TeamSpinner 
                          unassignedTeams={unassignedTeams} 
                          onSelect={(team) => handleSpinSelect(slot.id, 'B', team)} 
                        />
                        <ChevronRightIcon className="w-4 h-4" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {getUnassignedCount() > 0 && (
          <div className="mt-6 flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded-lg">
            <AlertCircleIcon className="w-5 h-5 shrink-0" />
            <p className="text-xs sm:text-sm font-medium">You must assign {getUnassignedCount()} more players before publishing.</p>
          </div>
        )}
      </div>

      {/* Mobile/Desktop Selection Modal */}
      {activeSelection && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-0">
          <div className="bg-surface border border-border sm:rounded-xl rounded-t-2xl sm:rounded-b-xl w-full sm:max-w-md max-h-[80vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <h3 className="font-bold text-foreground">Select Team</h3>
                <p className="text-xs text-text-muted">Match {activeSelection.slotId} - Team {activeSelection.position}</p>
              </div>
              <button
                onClick={() => setActiveSelection(null)}
                className="p-2 bg-background hover:bg-border rounded-full text-text-muted transition-colors"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1">
              <div className="space-y-2">
                {registrations.map(reg => {
                  const assigned = isTeamAssigned(reg.registrationUuid || reg.uuid);
                  return (
                    <button
                      key={reg.registrationUuid || reg.uuid}
                      onClick={() => handleSelectTeam(reg)}
                      className={`w-full text-left p-4 rounded-xl flex items-center justify-between transition-all ${assigned
                          ? 'bg-background/50 border border-border/50'
                          : 'bg-background border border-border hover:border-primary shadow-sm hover:bg-primary/5'
                        }`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <UsersIcon className={`w-5 h-5 shrink-0 ${assigned ? 'text-text-muted' : 'text-primary'}`} />
                        <span className={`text-sm font-semibold truncate ${assigned ? 'text-text-muted' : 'text-foreground'}`}>
                          {reg.teamName}
                        </span>
                      </div>
                      {assigned && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted bg-surface px-2 py-1 rounded-md">
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
      )}
    </div>
  );
}
