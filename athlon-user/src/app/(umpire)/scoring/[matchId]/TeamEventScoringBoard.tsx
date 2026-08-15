'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MatchService, Match } from '@/lib/api/matches';
import { RegistrationService } from '@/lib/api/tournaments';
import { TeamEventService, TeamEventFixtureDetails, TeamEventCategoryMatch, TeamEventLineupPlayer } from '@/lib/api/teamEvents';
import { ChevronLeftIcon, UsersIcon, Undo2 } from 'lucide-react';
import Link from 'next/link';
import { useMatchStore } from '@/lib/store/useMatchStore';

export default function TeamEventScoringBoard({ matchId }: { matchId: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [match, setMatch] = useState<Match | null>(null);
    const [details, setDetails] = useState<TeamEventFixtureDetails | null>(null);
    const [teamA, setTeamA] = useState<any>(null);
    const [teamB, setTeamB] = useState<any>(null);

    const store = useMatchStore();

    useEffect(() => {
        console.log("TeamEventScoringBoard mounted. matchId:", matchId);
        if (!matchId) {
            setLoading(false);
            return;
        }
        fetchData();
    }, [matchId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const matchRes = await MatchService.getById(matchId);
            const matchData = matchRes.data as Match;
            setMatch(matchData);

            if (!matchData) return;

            const fixtureData = await TeamEventService.getFixtureDetails(matchData.id);
            setDetails(fixtureData);

            if (matchData.tournamentId) {
                const regRes = await RegistrationService.getByTournament(matchData.tournamentId);
                const allRegs = regRes.data;
                setTeamA(allRegs.find(r => r.registrationId === matchData.teamARegistrationId || r.uuid === matchData.teamARegistrationUuid));
                setTeamB(allRegs.find(r => r.registrationId === matchData.teamBRegistrationId || r.uuid === matchData.teamBRegistrationUuid));
            }
        } catch (error) {
            console.error("fetchData Error:", error);
        } finally {
            console.log("fetchData finally. Setting loading to false.");
            setLoading(false);
        }
    };

    if (loading && !match) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-background">
                <div className="text-foreground text-xl font-bold animate-pulse">Loading Team Event...</div>
            </div>
        );
    }

    if (!match || !details) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-foreground">
                <p>Data not found.</p>
                <button onClick={() => router.back()} className="mt-4 px-4 py-2 bg-surface border border-border rounded-lg">Go Back</button>
            </div>
        );
    }

    return (
        <div className="h-[100dvh] overflow-y-auto touch-auto bg-[#0D1520] text-white flex flex-col p-4 md:p-6 lg:p-8">
            <button 
                onClick={() => router.back()}
                className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6 font-semibold w-fit"
            >
                <ChevronLeftIcon className="w-5 h-5" />
                Exit Scoring
            </button>

            <div className="flex-1 max-w-4xl mx-auto w-full space-y-6">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-black text-white uppercase tracking-widest">{match?.tournamentName || 'Team Event Fixture'}</h1>
                    <div className="flex items-center justify-center gap-4 mt-4">
                        <div className="text-xl font-bold text-white">{teamA?.teamName || 'Team A'}</div>
                        <div className="text-sm font-black text-white/50 uppercase">VS</div>
                        <div className="text-xl font-bold text-white">{teamB?.teamName || 'Team B'}</div>
                    </div>
                </div>

                <div className="space-y-4">
                    {details.categoryMatches.map((cat, index) => {
                        const getPlayers = (lineupPlayers: TeamEventLineupPlayer[] | undefined) => {
                            if (!lineupPlayers) return [];
                            return lineupPlayers.filter(p => p.teamEventCategoryId === cat.id && !p.isSubstitute).map(p => p.playerName || 'Unknown');
                        };
                        const teamAPlayers = getPlayers(details.teamALineupPlayers);
                        const teamBPlayers = getPlayers(details.teamBLineupPlayers);

                        return (
                            <div key={cat.id} className="relative overflow-hidden bg-gradient-to-br from-white/5 to-white/[0.01] border border-white/10 rounded-3xl p-5 md:p-6 shadow-2xl backdrop-blur-xl group hover:border-white/20 transition-all">
                                {/* Header */}
                                <div className="flex flex-wrap items-center gap-3 mb-5">
                                    <span className="px-3 py-1 bg-red-500/20 text-red-500 font-black text-xs uppercase tracking-widest rounded-lg">Match {index + 1}</span>
                                    <h3 className="text-xl font-black text-white">{cat.categoryName}</h3>
                                    <span className="ml-auto text-xs font-black text-white/40 uppercase tracking-widest">{cat.matchFormat}</span>
                                </div>

                                {/* VS Battle Area */}
                                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 bg-black/20 rounded-2xl p-3 md:p-4 border border-white/5">
                                    {/* Team A */}
                                    <div className="flex-1 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 relative overflow-hidden group-hover:border-blue-500/40 transition-colors">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 blur-[50px] -mr-10 -mt-10 rounded-full" />
                                        <div className="relative z-10">
                                            <div className="text-[10px] uppercase font-black text-blue-400 tracking-widest mb-1">{teamA?.teamName || 'Team A'}</div>
                                            <div className="text-base font-bold text-white break-words">{teamAPlayers.join(' / ') || 'TBD'}</div>
                                        </div>
                                    </div>

                                    {/* VS Badge */}
                                    <div className="flex items-center justify-center -my-4 md:my-0 md:-mx-4 z-10">
                                        <div className="w-10 h-10 rounded-full bg-[#0D1520] border border-white/10 flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                                            <span className="text-[10px] font-black text-white/50 uppercase">VS</span>
                                        </div>
                                    </div>

                                    {/* Team B */}
                                    <div className="flex-1 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 relative overflow-hidden group-hover:border-emerald-500/40 transition-colors">
                                        <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/20 blur-[50px] -ml-10 -mt-10 rounded-full" />
                                        <div className="relative z-10 md:text-right">
                                            <div className="text-[10px] uppercase font-black text-emerald-400 tracking-widest mb-1">{teamB?.teamName || 'Team B'}</div>
                                            <div className="text-base font-bold text-white break-words">{teamBPlayers.join(' / ') || 'TBD'}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Area */}
                                <div className="mt-5 flex justify-end">
                                    {cat.status === 'COMPLETED' ? (
                                        <div className="w-full md:w-auto px-8 py-3.5 bg-emerald-500/20 text-emerald-500 font-black rounded-xl border border-emerald-500/30 flex items-center justify-center uppercase tracking-widest text-sm">
                                            Completed
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => {
                                                const qs = new URLSearchParams({
                                                    sport: match?.sportType || 'Badminton',
                                                    category: cat.matchFormat,
                                                    teamA: teamAPlayers.join(','),
                                                    teamB: teamBPlayers.join(','),
                                                    teamAName: teamA?.teamName || '',
                                                    teamBName: teamB?.teamName || '',
                                                    teamARegId: teamA?.registrationId?.toString() || '',
                                                    teamBRegId: teamB?.registrationId?.toString() || '',
                                                    categoryId: cat.id.toString(),
                                                    matchId: matchId.toString()
                                                });
                                                router.push(`/match-setup?${qs.toString()}`);
                                            }}
                                            className="w-full md:w-auto px-8 py-3.5 bg-gradient-to-r from-red-500 to-red-600 text-white font-black rounded-xl hover:from-red-400 hover:to-red-500 active:scale-95 transition-all shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:shadow-[0_0_25px_rgba(239,68,68,0.4)] uppercase tracking-widest text-sm"
                                        >
                                            Score Match
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

        </div>
    );
}
