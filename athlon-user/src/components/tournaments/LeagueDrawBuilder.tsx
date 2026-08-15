import React, { useState, useMemo } from 'react';
import { Registration, DrawService } from '@/lib/api/tournaments';
import { UsersIcon, CheckCircleIcon, SettingsIcon, PlusIcon, MinusIcon, TrashIcon, ArrowRightIcon } from 'lucide-react';
import { TeamSpinner } from './TeamSpinner';

interface LeagueDrawBuilderProps {
  tournamentUuid: string;
  registrations: Registration[];
  onComplete: () => void;
  onCancel: () => void;
}

interface PoolConfig {
  id: string;
  name: string;
  capacity: number;
  qualifiers: number;
}

interface PoolAssignment {
  poolId: string;
  teamUuids: string[];
}

export function LeagueDrawBuilder({ tournamentUuid, registrations, onComplete, onCancel }: LeagueDrawBuilderProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [pools, setPools] = useState<PoolConfig[]>([
    { id: '1', name: 'Pool A', capacity: 4, qualifiers: 2 },
    { id: '2', name: 'Pool B', capacity: 4, qualifiers: 2 }
  ]);
  const [assignments, setAssignments] = useState<PoolAssignment[]>([
    { poolId: '1', teamUuids: [] },
    { poolId: '2', teamUuids: [] }
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper calculations
  const totalCapacity = pools.reduce((sum, p) => sum + p.capacity, 0);
  const totalTeams = registrations.length;
  const isCapacityValid = totalCapacity === totalTeams;

  // Step 1 Functions
  const addPool = () => {
    const nextId = String(Date.now());
    const nextLetter = String.fromCharCode(65 + pools.length);
    setPools([...pools, { id: nextId, name: `Pool ${nextLetter}`, capacity: 4, qualifiers: 2 }]);
    setAssignments([...assignments, { poolId: nextId, teamUuids: [] }]);
  };

  const removePool = (id: string) => {
    setPools(pools.filter(p => p.id !== id));
    setAssignments(assignments.filter(a => a.poolId !== id));
  };

  const updatePool = (id: string, field: keyof PoolConfig, value: string | number) => {
    setPools(pools.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  // Step 2 Functions
  const assignedTeamUuids = assignments.flatMap(a => a.teamUuids);
  const availableTeams = registrations.filter(r => !assignedTeamUuids.includes(r.registrationUuid!));

  const assignTeamToPool = (teamUuid: string, poolId: string) => {
    const pool = pools.find(p => p.id === poolId);
    const poolAssignment = assignments.find(a => a.poolId === poolId);
    if (!pool || !poolAssignment) return;
    
    if (poolAssignment.teamUuids.length >= pool.capacity) {
      alert(`Capacity reached for ${pool.name}`);
      return;
    }

    setAssignments(prev => prev.map(a => {
      // Remove from old pool if it was there
      const cleanUuids = a.teamUuids.filter(uuid => uuid !== teamUuid);
      // Add to new pool
      if (a.poolId === poolId) {
        return { ...a, teamUuids: [...cleanUuids, teamUuid] };
      }
      return { ...a, teamUuids: cleanUuids };
    }));
  };

  const removeTeamFromPool = (teamUuid: string, poolId: string) => {
    setAssignments(prev => prev.map(a => 
      a.poolId === poolId 
        ? { ...a, teamUuids: a.teamUuids.filter(id => id !== teamUuid) } 
        : a
    ));
  };

  // Generate Fixtures
  const handleGenerateAndPublish = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const payload = {
        drawType: 'LEAGUE',
        pools: pools.map(p => {
          const assignment = assignments.find(a => a.poolId === p.id);
          return {
            poolName: p.name,
            capacity: p.capacity,
            qualifiers: p.qualifiers,
            teamUuids: assignment?.teamUuids || []
          };
        })
      };

      await DrawService.generateLeagueDraw(tournamentUuid, payload);
      onComplete();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate league draw.');
      setIsGenerating(false);
    }
  };


  return (
    <div className="bg-surface border border-foreground/10 rounded-2xl overflow-hidden flex flex-col h-[80vh] min-h-[600px]">
      
      {/* Header / Stepper */}
      <div className="bg-background/50 border-b border-foreground/10 p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-foreground">League Draw Setup</h2>
          <p className="text-sm text-foreground/60 mt-1">Configure pools and generate round-robin fixtures.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-1.5 md:gap-2 text-xs md:text-sm font-bold">
          <div className={`px-2 md:px-3 py-1.5 rounded-full flex items-center gap-1.5 md:gap-2 ${step === 1 ? 'bg-[#1B9C56] text-white' : 'bg-foreground/5 text-foreground/50'}`}>
            <span className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-white/20 flex items-center justify-center text-[9px] md:text-[10px]">1</span>
            Pools
          </div>
          <ArrowRightIcon className="w-3 h-3 md:w-4 md:h-4 text-foreground/20 shrink-0" />
          <div className={`px-2 md:px-3 py-1.5 rounded-full flex items-center gap-1.5 md:gap-2 ${step === 2 ? 'bg-[#1B9C56] text-white' : 'bg-foreground/5 text-foreground/50'}`}>
            <span className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-white/20 flex items-center justify-center text-[9px] md:text-[10px]">2</span>
            Teams
          </div>
          <ArrowRightIcon className="w-3 h-3 md:w-4 md:h-4 text-foreground/20 shrink-0" />
          <div className={`px-2 md:px-3 py-1.5 rounded-full flex items-center gap-1.5 md:gap-2 ${step === 3 ? 'bg-[#1B9C56] text-white' : 'bg-foreground/5 text-foreground/50'}`}>
            <span className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-white/20 flex items-center justify-center text-[9px] md:text-[10px]">3</span>
            Review
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-background/30">
        
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-sm font-semibold flex items-center justify-between">
            {error}
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-400">
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 1: POOL CONFIGURATION */}
        {step === 1 && (
          <div className="flex flex-col gap-6 max-w-4xl mx-auto">
            
            <div className="flex items-center justify-between p-4 bg-surface border border-foreground/10 rounded-xl">
              <div>
                <h3 className="font-bold text-foreground flex items-center gap-2">
                  <SettingsIcon className="w-4 h-4 text-[#1B9C56]" />
                  Tournament Capacity Overview
                </h3>
                <p className="text-sm text-foreground/60 mt-1">Sum of pool capacities must equal {totalTeams}.</p>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-black ${isCapacityValid ? 'text-[#1B9C56]' : 'text-orange-500'}`}>
                  {totalCapacity} / {totalTeams}
                </div>
                <div className="text-xs font-bold text-foreground/40 uppercase tracking-widest">
                  Assigned Capacity
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pools.map((pool, index) => (
                <div key={pool.id} className="bg-surface border border-foreground/10 rounded-xl p-5 relative group">
                  {pools.length > 1 && (
                    <button 
                      onClick={() => removePool(pool.id)}
                      className="absolute top-4 right-4 p-1.5 text-foreground/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  )}
                  
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest block mb-1">Pool Name</label>
                      <input 
                        type="text" 
                        value={pool.name}
                        onChange={(e) => updatePool(pool.id, 'name', e.target.value)}
                        className="w-full bg-background border border-foreground/10 rounded-lg px-3 py-2 text-sm font-semibold text-foreground focus:outline-none focus:border-[#1B9C56]"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest block mb-1">Team Capacity</label>
                        <div className="flex items-center">
                          <button 
                            type="button"
                            onClick={() => updatePool(pool.id, 'capacity', Math.max(2, pool.capacity - 1))}
                            className="bg-foreground/5 p-2.5 rounded-l-lg hover:bg-foreground/10 text-foreground/60 border border-foreground/10 border-r-0 transition-colors"
                          >
                            <MinusIcon className="w-4 h-4" />
                          </button>
                          <input 
                            type="number" 
                            min="2"
                            max={totalTeams}
                            value={pool.capacity}
                            onChange={(e) => updatePool(pool.id, 'capacity', parseInt(e.target.value) || 2)}
                            className="w-full bg-background border-y border-foreground/10 px-2 py-2 text-sm font-semibold text-foreground focus:outline-none focus:border-[#1B9C56] text-center"
                          />
                          <button 
                            type="button"
                            onClick={() => updatePool(pool.id, 'capacity', Math.min(totalTeams, pool.capacity + 1))}
                            className="bg-foreground/5 p-2.5 rounded-r-lg hover:bg-foreground/10 text-foreground/60 border border-foreground/10 border-l-0 transition-colors"
                          >
                            <PlusIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest block mb-1">Qualifiers</label>
                        <div className="flex items-center">
                          <button 
                            type="button"
                            onClick={() => updatePool(pool.id, 'qualifiers', Math.max(1, pool.qualifiers - 1))}
                            className="bg-foreground/5 p-2.5 rounded-l-lg hover:bg-foreground/10 text-foreground/60 border border-foreground/10 border-r-0 transition-colors"
                          >
                            <MinusIcon className="w-4 h-4" />
                          </button>
                          <input 
                            type="number" 
                            min="1"
                            max={pool.capacity}
                            value={pool.qualifiers}
                            onChange={(e) => updatePool(pool.id, 'qualifiers', parseInt(e.target.value) || 1)}
                            className="w-full bg-background border-y border-foreground/10 px-2 py-2 text-sm font-semibold text-foreground focus:outline-none focus:border-[#1B9C56] text-center"
                          />
                          <button 
                            type="button"
                            onClick={() => updatePool(pool.id, 'qualifiers', Math.min(pool.capacity, pool.qualifiers + 1))}
                            className="bg-foreground/5 p-2.5 rounded-r-lg hover:bg-foreground/10 text-foreground/60 border border-foreground/10 border-l-0 transition-colors"
                          >
                            <PlusIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              <button 
                onClick={addPool}
                className="bg-background border-2 border-dashed border-foreground/10 hover:border-[#1B9C56]/50 hover:bg-[#1B9C56]/5 rounded-xl p-5 flex flex-col items-center justify-center gap-2 text-foreground/50 hover:text-[#1B9C56] transition-colors min-h-[160px]"
              >
                <div className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center">
                  <PlusIcon className="w-5 h-5" />
                </div>
                <span className="text-sm font-bold">Add Pool</span>
              </button>
            </div>
            
          </div>
        )}

        {/* STEP 2: TEAM ASSIGNMENT */}
        {step === 2 && (
          <div className="flex flex-col gap-6 h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-foreground flex items-center gap-2">
                <UsersIcon className="w-5 h-5 text-blue-500" />
                Assign Teams to Pools
              </h3>
              <span className="px-3 py-1 bg-foreground/5 rounded-full text-xs font-bold text-foreground/70">
                {availableTeams.length} Unassigned
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
              {pools.map(pool => {
                const assignment = assignments.find(a => a.poolId === pool.id);
                const assignedCount = assignment?.teamUuids.length || 0;
                const isFull = assignedCount === pool.capacity;
                
                // Create an array of size pool.capacity
                const slots = Array.from({ length: pool.capacity }, (_, i) => assignment?.teamUuids[i] || null);
                
                return (
                  <div key={pool.id} className={`bg-surface border rounded-xl p-5 flex flex-col ${isFull ? 'border-[#1B9C56]/50 shadow-md shadow-[#1B9C56]/5' : 'border-foreground/10'}`}>
                    <div className="flex items-center justify-between mb-4 border-b border-foreground/5 pb-4">
                      <h4 className="font-black text-lg text-foreground">{pool.name}</h4>
                      <div className={`px-2.5 py-1 rounded text-xs font-bold ${isFull ? 'bg-[#1B9C56]/10 text-[#1B9C56]' : 'bg-foreground/5 text-foreground/50'}`}>
                        {assignedCount} / {pool.capacity}
                      </div>
                    </div>
                    
                    <div className="flex-1 space-y-3">
                      {slots.map((teamUuid, index) => {
                        if (teamUuid) {
                          const team = registrations.find(r => r.registrationUuid === teamUuid);
                          return (
                            <div key={`slot-${index}`} className="bg-background border border-foreground/10 rounded-lg p-3 flex items-center justify-between">
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-foreground">{team?.teamName}</span>
                              </div>
                              <button 
                                onClick={() => removeTeamFromPool(teamUuid, pool.id)}
                                className="p-1.5 text-foreground/30 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                          );
                        } else {
                          return (
                            <div key={`slot-${index}`} className="h-12 border-2 border-dashed border-foreground/10 rounded-lg flex items-center justify-between px-3">
                              <select 
                                className="text-xs bg-background border border-foreground/10 text-foreground font-bold focus:outline-none focus:border-[#1B9C56] rounded px-2 py-1 flex-1 w-full truncate cursor-pointer"
                                onChange={(e) => {
                                  if (e.target.value) {
                                    assignTeamToPool(e.target.value, pool.id);
                                    e.target.value = ""; // Reset for next use
                                  }
                                }}
                                defaultValue=""
                                disabled={availableTeams.length === 0}
                              >
                                <option value="" disabled>Select Team {index + 1}...</option>
                                {availableTeams.map(t => (
                                  <option key={t.registrationUuid} value={t.registrationUuid}>
                                    {t.teamName}
                                  </option>
                                ))}
                              </select>
                              
                              <div className="ml-2 border-l border-foreground/10 pl-2">
                                <TeamSpinner 
                                  unassignedTeams={availableTeams}
                                  onSelect={(team) => assignTeamToPool(team.registrationUuid!, pool.id)}
                                  disabled={availableTeams.length === 0}
                                />
                              </div>
                            </div>
                          );
                        }
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: REVIEW & PUBLISH */}
        {step === 3 && (
          <div className="flex flex-col gap-6 max-w-2xl mx-auto">
            <div className="bg-surface border border-[#1B9C56]/30 rounded-2xl p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-[#1B9C56]/10 mx-auto flex items-center justify-center mb-4">
                <CheckCircleIcon className="w-8 h-8 text-[#1B9C56]" />
              </div>
              <h3 className="text-xl font-black text-foreground mb-2">Draw Configuration Valid</h3>
              <p className="text-sm text-foreground/60 mb-6">
                All {totalTeams} teams have been assigned. Generating the draw will lock these pool assignments and create a round-robin fixture list for each pool.
              </p>
              
              <div className="grid grid-cols-2 gap-4 text-left mb-6">
                <div className="bg-background rounded-xl p-4 border border-foreground/10">
                  <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest block mb-1">Total Pools</span>
                  <span className="text-2xl font-black text-foreground">{pools.length}</span>
                </div>
                <div className="bg-background rounded-xl p-4 border border-foreground/10">
                  <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest block mb-1">Total Matches</span>
                  <span className="text-2xl font-black text-[#1B9C56]">
                    {pools.reduce((sum, p) => sum + (p.capacity * (p.capacity - 1)) / 2, 0)}
                  </span>
                </div>
              </div>
              
              <button
                onClick={handleGenerateAndPublish}
                disabled={isGenerating}
                className="w-full py-4 bg-[#1B9C56] hover:bg-[#158045] text-white rounded-xl font-black uppercase tracking-widest text-sm transition-colors shadow-lg shadow-[#1B9C56]/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? 'Generating...' : 'Confirm & Publish Draw'}
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Footer Navigation */}
      <div className="bg-background/80 backdrop-blur-md border-t border-foreground/10 p-4 md:px-6 flex items-center justify-between mt-auto">
        <button 
          onClick={() => {
            if (step === 1) onCancel();
            else setStep((prev) => (prev - 1) as any);
          }}
          className="px-5 py-2.5 bg-surface border border-foreground/10 hover:border-foreground/30 text-foreground rounded-xl font-bold text-sm transition-colors"
        >
          {step === 1 ? 'Cancel' : 'Back'}
        </button>

        {step < 3 && (
          <button 
            onClick={() => {
              if (step === 1) {
                if (!isCapacityValid) {
                  alert(`Total pool capacity (${totalCapacity}) must equal total registered teams (${totalTeams}).`);
                  return;
                }
                const invalidPool = pools.find(p => p.qualifiers > p.capacity || p.qualifiers < 1);
                if (invalidPool) {
                  alert(`Pool ${invalidPool.name} has invalid qualification count.`);
                  return;
                }
                setStep(2);
              } else if (step === 2) {
                if (availableTeams.length > 0) {
                  alert(`There are still ${availableTeams.length} unassigned teams.`);
                  return;
                }
                setStep(3);
              }
            }}
            className="px-6 py-2.5 bg-foreground text-background hover:bg-foreground/90 rounded-xl font-bold text-sm transition-colors"
          >
            Continue
          </button>
        )}
      </div>

    </div>
  );
}
