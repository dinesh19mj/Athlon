import React, { useState } from 'react';
import { ClockIcon, CheckCircleIcon } from 'lucide-react';

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
    categories: CategoryMatch[];
    roster: Player[];
    deadline: Date;
    onSubmit: (lineup: any) => Promise<void>;
    existingLineup?: any;
    isLocked?: boolean;
}

export const LineupSubmissionForm: React.FC<Props> = ({
    fixtureMatchId,
    teamRegistrationId,
    categories,
    roster,
    deadline,
    onSubmit,
    existingLineup,
    isLocked
}) => {
    const [lineup, setLineup] = useState<Record<string, string[]>>(existingLineup || {});
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const now = new Date();
    const isPastDeadline = now > deadline;
    const isDisabled = isLocked || isPastDeadline || isSubmitting;

    const handlePlayerSelect = (categoryId: string, playerIndex: number, playerId: string) => {
        const currentCategoryLineup = lineup[categoryId] || [];
        const newCategoryLineup = [...currentCategoryLineup];
        newCategoryLineup[playerIndex] = playerId;
        setLineup({ ...lineup, [categoryId]: newCategoryLineup });
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
        <div className="bg-[#0D1520] border border-white/10 rounded-2xl p-4 sm:p-6 max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <div>
                    <h3 className="text-white font-bold text-lg">Submit Lineup</h3>
                    <p className="text-white/50 text-xs mt-1">Assign players for each match category</p>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${
                    isPastDeadline ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                    <ClockIcon className="w-4 h-4" />
                    Deadline: {deadline.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {categories.map((cat, idx) => (
                    <div key={cat.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
                            <div className="text-sm font-bold text-white">
                                Match {idx + 1}: {cat.categoryName} <span className="text-white/40 font-normal">({cat.matchFormat})</span>
                            </div>
                            <div className="text-[10px] uppercase tracking-wider text-white/50 font-black bg-white/10 px-2 py-1 rounded-md">
                                {cat.playersRequired} Player{cat.playersRequired > 1 ? 's' : ''}
                            </div>
                        </div>

                        <div className="space-y-3">
                            {Array.from({ length: cat.playersRequired }).map((_, pIdx) => (
                                <select
                                    key={pIdx}
                                    disabled={isDisabled}
                                    value={lineup[cat.id]?.[pIdx] || ""}
                                    onChange={(e) => handlePlayerSelect(cat.id, pIdx, e.target.value)}
                                    className="w-full bg-[#0D1520] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50 appearance-none"
                                    required
                                >
                                    <option value="">Select Player {pIdx + 1}</option>
                                    {roster.map(player => (
                                        <option key={player.id} value={player.id}>
                                            {player.name}
                                        </option>
                                    ))}
                                </select>
                            ))}
                        </div>
                    </div>
                ))}

                <button
                    type="submit"
                    disabled={isDisabled}
                    className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            <CheckCircleIcon className="w-5 h-5" />
                            {isLocked ? "Lineup Locked" : "Submit Lineup"}
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};
