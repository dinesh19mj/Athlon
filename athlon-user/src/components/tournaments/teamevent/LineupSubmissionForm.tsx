import React, { useState } from 'react';
import { Clock, CheckCircle2, Shield, User, AlertCircle, Sparkles, UserPlus, Trophy, ChevronRight } from 'lucide-react';

interface Player {
    id: string;
    name: string;
}

interface CategoryMatch {
    id: string;
    categoryName: string;
    matchFormat: string;
    playersRequired: number;
}

interface Props {
    fixtureMatchId: string;
    teamRegistrationId: string;
    teamName?: string;
    categories: CategoryMatch[];
    roster: Player[];
    deadline: Date;
    onSubmit: (lineup: Record<string, string[]>) => Promise<void>;
    existingLineup?: Record<string, string[]>;
    isLocked?: boolean;
    onCancelEdit?: () => void;
    isEditing?: boolean;
}

export const LineupSubmissionForm: React.FC<Props> = ({
    fixtureMatchId,
    teamRegistrationId,
    teamName,
    categories,
    roster,
    deadline,
    onSubmit,
    existingLineup,
    isLocked,
    onCancelEdit,
    isEditing
}) => {
    const [lineup, setLineup] = useState<Record<string, string[]>>(existingLineup || {});
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const now = new Date();
    const isPastDeadline = now > deadline;
    const isDisabled = isLocked || isPastDeadline || isSubmitting;

    // Calculate total required vs total selected
    const totalRequired = categories.reduce((sum, c) => sum + (c.playersRequired || 1), 0);
    let totalSelected = 0;
    const assignedPlayerIds = new Set<string>();
    const duplicatePlayerIds = new Set<string>();

    categories.forEach(cat => {
        const catPlayers = lineup[cat.id] || [];
        for (let i = 0; i < cat.playersRequired; i++) {
            const pId = catPlayers[i];
            if (pId) {
                totalSelected++;
                if (assignedPlayerIds.has(pId)) {
                    duplicatePlayerIds.add(pId);
                } else {
                    assignedPlayerIds.add(pId);
                }
            }
        }
    });

    const isComplete = totalSelected === totalRequired;
    const progressPercent = totalRequired > 0 ? Math.round((totalSelected / totalRequired) * 100) : 0;

    const handlePlayerSelect = (categoryId: string, playerIndex: number, playerId: string) => {
        const currentCategoryLineup = lineup[categoryId] || [];
        const newCategoryLineup = [...currentCategoryLineup];
        newCategoryLineup[playerIndex] = playerId;
        setLineup({ ...lineup, [categoryId]: newCategoryLineup });
    };

    const handleQuickAutoFill = () => {
        const newLineup: Record<string, string[]> = {};
        let rIndex = 0;
        categories.forEach(cat => {
            newLineup[cat.id] = [];
            for (let i = 0; i < cat.playersRequired; i++) {
                if (rIndex < roster.length) {
                    newLineup[cat.id].push(roster[rIndex].id);
                    rIndex++;
                } else {
                    newLineup[cat.id].push('');
                }
            }
        });
        setLineup(newLineup);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSubmit(lineup);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header / Info card */}
            <div className="rounded-2xl p-5 border border-primary/20 bg-surface-elevated/90 backdrop-blur-md shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-primary/20 text-primary border border-primary/30">
                                Lineup Builder
                            </span>
                            {teamName && (
                                <span className="text-xs font-bold text-foreground/80">
                                    for <span className="text-primary font-black">{teamName}</span>
                                </span>
                            )}
                        </div>
                        <h2 className="text-xl font-black text-foreground tracking-tight">
                            {isEditing ? 'Update Match Lineup' : 'Assign Match Categories'}
                        </h2>
                        <p className="text-xs text-foreground/50 mt-0.5">
                            Select players from your roster for each rubber category.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {roster.length >= totalRequired && totalSelected < totalRequired && (
                            <button
                                type="button"
                                onClick={handleQuickAutoFill}
                                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all flex items-center gap-1.5"
                            >
                                <Sparkles className="w-3.5 h-3.5" /> Auto-Fill
                            </button>
                        )}
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${
                            isPastDeadline 
                                ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                            <Clock className="w-3.5 h-3.5" />
                            <span>Deadline: {deadline.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="mt-5 pt-4 border-t border-border/60">
                    <div className="flex items-center justify-between text-xs font-bold mb-2">
                        <span className="text-foreground/70 flex items-center gap-1.5">
                            <Shield className="w-3.5 h-3.5 text-primary" />
                            Positions Assigned
                        </span>
                        <span className={`font-black ${isComplete ? 'text-emerald-400' : 'text-primary'}`}>
                            {totalSelected} / {totalRequired} ({progressPercent}%)
                        </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-background border border-border/60 overflow-hidden">
                        <div 
                            className={`h-full transition-all duration-300 rounded-full ${
                                isComplete 
                                    ? 'bg-gradient-to-r from-emerald-500 to-primary' 
                                    : 'bg-gradient-to-r from-primary to-amber-400'
                            }`}
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>

                {/* Warnings */}
                {duplicatePlayerIds.size > 0 && (
                    <div className="mt-3 flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>Some players are assigned to multiple match categories. Please ensure this is allowed for your tournament format.</span>
                    </div>
                )}
            </div>

            {/* Category Matches Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                    {categories.map((cat, idx) => {
                        const assignedForThisCat = lineup[cat.id] || [];
                        const isCatComplete = assignedForThisCat.filter(Boolean).length === cat.playersRequired;

                        return (
                            <div 
                                key={cat.id} 
                                className={`rounded-2xl p-5 border transition-all relative overflow-hidden ${
                                    isCatComplete 
                                        ? 'bg-surface-elevated/80 border-primary/30 shadow-md' 
                                        : 'bg-surface/90 border-border hover:border-primary/40'
                                }`}
                            >
                                {/* Subtle top glow if completed */}
                                {isCatComplete && (
                                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-emerald-400" />
                                )}

                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                                    <div className="flex items-center gap-2.5">
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                                            isCatComplete ? 'bg-primary text-black' : 'bg-primary/10 text-primary border border-primary/20'
                                        }`}>
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-base font-black text-foreground">{cat.categoryName}</h3>
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-background border border-border text-foreground/70">
                                                    {cat.matchFormat}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-foreground/50 font-medium">
                                                Requires {cat.playersRequired} Player{cat.playersRequired > 1 ? 's' : ''}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ${
                                            isCatComplete 
                                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                        }`}>
                                            {isCatComplete ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                            {isCatComplete ? 'Filled' : `${cat.playersRequired - assignedForThisCat.filter(Boolean).length} Needed`}
                                        </span>
                                    </div>
                                </div>

                                {/* Player Slots */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                    {Array.from({ length: cat.playersRequired }).map((_, pIdx) => {
                                        const selectedPlayerId = lineup[cat.id]?.[pIdx] || '';
                                        const selectedPlayerObj = roster.find(r => r.id === selectedPlayerId);
                                        const isDuplicate = selectedPlayerId && Array.from(duplicatePlayerIds).includes(selectedPlayerId);

                                        return (
                                            <div key={pIdx} className="space-y-1.5">
                                                <label className="text-[11px] font-bold uppercase tracking-wider text-foreground/60 flex items-center justify-between">
                                                    <span className="flex items-center gap-1.5">
                                                        <User className="w-3 h-3 text-primary" />
                                                        Position {pIdx + 1}
                                                    </span>
                                                    {selectedPlayerObj && (
                                                        <span className="text-[10px] text-primary font-semibold">Assigned</span>
                                                    )}
                                                </label>

                                                <div className="relative">
                                                    <select
                                                        disabled={isDisabled}
                                                        value={selectedPlayerId}
                                                        onChange={(e) => handlePlayerSelect(cat.id, pIdx, e.target.value)}
                                                        className={`w-full appearance-none rounded-xl px-4 py-3 text-sm font-bold bg-background border transition-all focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                                                            isDuplicate 
                                                                ? 'border-amber-500 text-foreground'
                                                                : selectedPlayerId 
                                                                    ? 'border-primary/40 text-foreground bg-primary/[0.03]' 
                                                                    : 'border-border text-foreground/40'
                                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                                        required
                                                    >
                                                        <option value="" className="bg-surface text-foreground/50">
                                                            -- Select Player {pIdx + 1} --
                                                        </option>
                                                        {roster.map((player) => {
                                                            const isAssignedElsewhere = assignedPlayerIds.has(player.id) && player.id !== selectedPlayerId;
                                                            return (
                                                                <option 
                                                                    key={player.id} 
                                                                    value={player.id}
                                                                    className="bg-surface text-foreground py-2"
                                                                >
                                                                    {player.name} {isAssignedElsewhere ? '(Assigned in other slot)' : ''}
                                                                </option>
                                                            );
                                                        })}
                                                    </select>

                                                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-foreground/40">
                                                        <ChevronRight className="w-4 h-4 rotate-90" />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Sticky / Bottom Submit Bar */}
                <div className="sticky bottom-4 z-20 pt-4">
                    <div className="p-3 bg-surface-elevated/95 backdrop-blur-md rounded-2xl border border-primary/30 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black shrink-0 ${
                                isComplete ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-primary/20 text-primary border border-primary/30'
                            }`}>
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-xs font-black text-foreground">
                                    {isComplete ? 'Ready to Submit' : `${totalSelected} of ${totalRequired} Positions Filled`}
                                </div>
                                <div className="text-[10px] text-foreground/50 font-medium">
                                    {isComplete ? 'All category assignments are complete.' : 'Fill all player slots before submitting.'}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            {onCancelEdit && (
                                <button
                                    type="button"
                                    onClick={onCancelEdit}
                                    className="flex-1 sm:flex-none px-5 py-3 rounded-xl text-xs font-bold bg-surface border border-border text-foreground/70 hover:text-foreground transition-all"
                                >
                                    Cancel
                                </button>
                            )}

                            <button
                                type="submit"
                                disabled={isDisabled || !isComplete}
                                className={`flex-1 sm:flex-none px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-black transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 shadow-lg ${
                                    isComplete 
                                        ? 'bg-primary hover:bg-primary-hover shadow-primary/30 cursor-pointer' 
                                        : 'bg-primary/40 opacity-60 cursor-not-allowed'
                                }`}
                            >
                                {isSubmitting ? (
                                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>{isEditing ? 'Update Lineup' : isLocked ? 'Lineup Locked' : 'Submit Lineup'}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};
