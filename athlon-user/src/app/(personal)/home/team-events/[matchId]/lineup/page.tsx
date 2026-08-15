'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { MatchService } from '@/lib/api/matches';
import { TournamentService, RegistrationService, Registration, Match, Tournament, TeamEventRosterService, TeamEventRosterPlayer } from '@/lib/api/tournaments';
import { TeamEventService, TeamEventFixtureDetails } from '@/lib/api/teamEvents';
import { LineupSubmissionForm } from '@/components/tournaments/teamevent/LineupSubmissionForm';
import { toast } from 'react-hot-toast';
import { ChevronLeftIcon } from 'lucide-react';

export default function LineupSubmissionPage() {
    const { matchId } = useParams() as { matchId: string };
    const { userId } = useAuthStore();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [match, setMatch] = useState<Match | null>(null);
    const [details, setDetails] = useState<TeamEventFixtureDetails | null>(null);
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [tournament, setTournament] = useState<Tournament | null>(null);
    
    // Determine which registration the user is acting for.
    const [myRegistration, setMyRegistration] = useState<Registration | null>(null);
    const [teamAReg, setTeamAReg] = useState<Registration | null>(null);
    const [teamBReg, setTeamBReg] = useState<Registration | null>(null);

    const [showAddPlayer, setShowAddPlayer] = useState(false);
    const [newPlayerName, setNewPlayerName] = useState('');
    const [newPlayerPhone, setNewPlayerPhone] = useState('');
    const [newPlayerCategoryId, setNewPlayerCategoryId] = useState('');
    const [addingPlayer, setAddingPlayer] = useState(false);
    const [roster, setRoster] = useState<TeamEventRosterPlayer[]>([]);

    useEffect(() => {
        if (!userId || !matchId) return;
        fetchData();
    }, [userId, matchId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const matchRes = await MatchService.getById(matchId);
            const matchData = matchRes.data as Match;
            setMatch(matchData);

            if (!matchData) {
                toast.error("Match not found");
                return;
            }

            const fixtureData = await TeamEventService.getFixtureDetails(matchData.id);
            setDetails(fixtureData);

            if (matchData.tournamentId) {
                if (matchData.tournamentUuid) {
                    try {
                        const tRes = await TournamentService.getById(matchData.tournamentUuid);
                        setTournament(tRes.data as Tournament);
                    } catch (e) {
                        console.error("Failed to load tournament info", e);
                    }
                }

                const regRes = await RegistrationService.getByTournament(matchData.tournamentId);
                const allRegs = regRes.data;
                setRegistrations(allRegs);

                const tAReg = allRegs.find(r => r.registrationId === matchData.teamARegistrationId || r.uuid === matchData.teamARegistrationUuid) || null;
                const tBReg = allRegs.find(r => r.registrationId === matchData.teamBRegistrationId || r.uuid === matchData.teamBRegistrationUuid) || null;
                setTeamAReg(tAReg);
                setTeamBReg(tBReg);

                const currentUserId = userId ? Number(userId) : null;

                // Identify if current user is captain of A or B
                let selectedReg: Registration | null = null;
                if (tAReg?.primaryContactId === currentUserId) {
                    selectedReg = tAReg;
                } else if (tBReg?.primaryContactId === currentUserId) {
                    selectedReg = tBReg;
                } else {
                    // Fallback for demo: just allow them to pick or default to A
                    selectedReg = tAReg || null;
                    toast.success("Demo Mode: You can toggle between Team A and Team B lineups.");
                }
                setMyRegistration(selectedReg);

                if (selectedReg) {
                    const uuidToUse = selectedReg.uuid || selectedReg.registrationUuid;
                    if (!uuidToUse) {
                        console.error("Selected registration has no UUID:", selectedReg);
                        toast.error("Registration UUID missing");
                    } else {
                        const rosterRes = await TeamEventRosterService.getTeamRoster(uuidToUse);
                        setRoster(rosterRes.data || []);
                    }
                }
            }

        } catch (error) {
            console.error(error);
            toast.error("Failed to load fixture data");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (lineupState: Record<string, string[]>) => {
        if (!userId || !myRegistration || !match || !details) return;

        try {
            const payload: any[] = [];
            for (const cat of details.categoryMatches) {
                const players = lineupState[cat.id.toString()] || [];
                players.forEach((playerIdStr, idx) => {
                    if (playerIdStr) {
                        payload.push({
                            teamEventCategoryId: cat.teamEventCategoryId,
                            playerRegistrationId: parseInt(playerIdStr),
                            position: idx + 1,
                            isSubstitute: false
                        });
                    }
                });
            }

            await TeamEventService.submitLineup(match.id, myRegistration.registrationId || myRegistration.id, payload, Number(userId!));
            toast.success("Lineup submitted successfully!");
            router.back();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to submit lineup");
        }
    };

    const handleAddPlayer = async () => {
        if (!userId || !myRegistration || !newPlayerName.trim()) return;

        try {
            setAddingPlayer(true);
            const uuid = myRegistration.registrationUuid || myRegistration.uuid;
            
            // Find category name if selected
            let selectedCategoryName = '';
            if (newPlayerCategoryId && details) {
                const cat = details.categoryMatches.find(c => c.teamEventCategoryId.toString() === newPlayerCategoryId);
                if (cat) selectedCategoryName = cat.categoryName;
            }

            await TeamEventRosterService.addPlayers(uuid!, [{ 
                playerName: newPlayerName.trim(), 
                phoneNumber: newPlayerPhone.trim(),
                categoryId: newPlayerCategoryId ? Number(newPlayerCategoryId) : undefined,
                categoryName: selectedCategoryName || undefined
            }], Number(userId));

            toast.success("Player added to roster!");
            setNewPlayerName('');
            setNewPlayerPhone('');
            setNewPlayerCategoryId('');
            setShowAddPlayer(false);
            // Refresh data to get the updated roster
            await fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to add player");
        } finally {
            setAddingPlayer(false);
        }
    };

    const handleSwitchTeam = async (reg: Registration) => {
        setMyRegistration(reg);
        const uuidToUse = reg.uuid || reg.registrationUuid;
        if (uuidToUse) {
            try {
                const rosterRes = await TeamEventRosterService.getTeamRoster(uuidToUse);
                setRoster(rosterRes.data || []);
            } catch (e) {
                console.error(e);
            }
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-background">
                <div className="text-foreground text-xl font-bold animate-pulse">Loading...</div>
            </div>
        );
    }

    if (!match || !details || !myRegistration) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center text-foreground">
                <p>Data not found.</p>
                <button onClick={() => router.back()} className="mt-4 px-4 py-2 bg-surface border border-border rounded-lg">Go Back</button>
            </div>
        );
    }

    const formattedRoster = roster.map((p, idx) => ({
        id: (p.rosterPlayerId || p.playerId || idx).toString(),
        name: p.playerName + (p.categoryName ? ` (${p.categoryName})` : '')
    }));

    const formattedCategories = details.categoryMatches.map(c => ({
        id: c.teamEventCategoryId.toString(),
        categoryName: c.categoryName,
        matchFormat: c.matchFormat,
        playersRequired: c.playersRequired || (c.matchFormat === 'DOUBLES' ? 2 : 1)
    }));

    // Find if an existing lineup was submitted
    const isTeamA = myRegistration.registrationId === match.teamARegistrationId || myRegistration.uuid === match.teamARegistrationUuid;
    const existingLineupEntity = isTeamA ? details.teamALineup : details.teamBLineup;
    const existingPlayers = isTeamA ? details.teamALineupPlayers : details.teamBLineupPlayers;
    const existingLineupState: Record<string, string[]> = {};

    if (existingPlayers) {
        existingPlayers.forEach(p => {
            const catIdStr = p.teamEventCategoryId.toString();
            if (!existingLineupState[catIdStr]) {
                existingLineupState[catIdStr] = [];
            }
            // Ensure array is large enough
            while (existingLineupState[catIdStr].length < p.position - 1) {
                existingLineupState[catIdStr].push('');
            }
            existingLineupState[catIdStr][p.position - 1] = p.playerRegistrationId.toString();
        });
    }

    // Default deadline: 15 mins before match, or 1 hour from now if match not scheduled
    const deadline = match.scheduledTime ? new Date(new Date(match.scheduledTime).getTime() - 15 * 60000) : new Date(Date.now() + 3600000);
    const isLocked = existingLineupEntity?.status === 'APPROVED' || existingLineupEntity?.status === 'LOCKED';

    const maxPlayers = tournament?.playersCount || 999;
    const currentPlayersCount = roster.length;
    const canAddPlayer = currentPlayersCount < maxPlayers;
    
    const bothApproved = details.teamALineup?.status === 'APPROVED' && details.teamBLineup?.status === 'APPROVED';
    const teamA = registrations.find(r => r.registrationUuid === match.teamARegistrationUuid || r.uuid === match.teamARegistrationUuid);
    const teamB = registrations.find(r => r.registrationUuid === match.teamBRegistrationUuid || r.uuid === match.teamBRegistrationUuid);

    return (
        <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8 pt-24">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <button 
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors font-semibold"
                    >
                        <ChevronLeftIcon className="w-5 h-5" />
                        Back to Matches
                    </button>
                    
                    {/* Team Selector Toggle for Demo Mode */}
                    {!bothApproved && (!myRegistration?.primaryContactId || myRegistration.primaryContactId !== Number(userId)) && teamAReg && teamBReg && (
                        <div className="flex items-center bg-surface border border-border rounded-lg overflow-hidden">
                            <button
                                onClick={() => handleSwitchTeam(teamAReg)}
                                className={`px-4 py-2 text-sm font-bold transition-colors ${myRegistration?.registrationId === teamAReg.registrationId ? 'bg-primary text-black' : 'text-text-muted hover:text-foreground'}`}
                            >
                                {teamAReg.teamName} (Team A)
                            </button>
                            <button
                                onClick={() => handleSwitchTeam(teamBReg)}
                                className={`px-4 py-2 text-sm font-bold transition-colors ${myRegistration?.registrationId === teamBReg.registrationId ? 'bg-primary text-black' : 'text-text-muted hover:text-foreground'}`}
                            >
                                {teamBReg.teamName} (Team B)
                            </button>
                        </div>
                    )}
                    
                    {!isLocked && (
                        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                            <span className="text-sm font-medium text-foreground/70">
                                Roster: {currentPlayersCount}/{tournament?.playersCount || '?'}
                            </span>
                            <button 
                                onClick={() => {
                                    if (canAddPlayer) setShowAddPlayer(true);
                                    else toast.error(`Cannot add more than ${maxPlayers} players`);
                                }}
                                disabled={!canAddPlayer}
                                className={`px-4 py-2 rounded-lg font-bold transition-colors text-sm sm:text-base whitespace-nowrap ${canAddPlayer ? 'bg-green-500 text-black hover:bg-green-600' : 'bg-surface border border-border text-foreground/50 cursor-not-allowed'}`}
                            >
                                + Add Player
                            </button>
                        </div>
                    )}
                </div>

                {showAddPlayer && (
                    <div className="mb-6 bg-surface border border-border p-4 rounded-xl shadow-lg">
                        <h3 className="font-bold mb-4 text-foreground">Add Player to {myRegistration.teamName}</h3>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <input 
                                className="flex-1 bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="Player Name"
                                value={newPlayerName}
                                onChange={e => setNewPlayerName(e.target.value)}
                            />
                            <input 
                                className="flex-1 bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="Phone Number (Optional)"
                                value={newPlayerPhone}
                                onChange={e => setNewPlayerPhone(e.target.value)}
                            />
                            <select 
                                className="flex-1 bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                                value={newPlayerCategoryId}
                                onChange={e => setNewPlayerCategoryId(e.target.value)}
                            >
                                <option value="">Select Category (Optional)</option>
                                {formattedCategories.map(cat => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.categoryName}
                                    </option>
                                ))}
                            </select>
                            <div className="flex gap-2">
                                <button 
                                    onClick={handleAddPlayer}
                                    disabled={addingPlayer || !newPlayerName.trim()}
                                    className="bg-green-500 text-black px-6 py-2 rounded-lg font-bold disabled:opacity-50 hover:bg-green-600 transition-colors"
                                >
                                    {addingPlayer ? 'Adding...' : 'Add'}
                                </button>
                                <button 
                                    onClick={() => {
                                        setShowAddPlayer(false);
                                        setNewPlayerName('');
                                        setNewPlayerPhone('');
                                        setNewPlayerCategoryId('');
                                    }}
                                    className="bg-surface text-foreground border border-border px-4 py-2 rounded-lg font-bold hover:bg-background transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                
                {bothApproved ? (
                    <div className="bg-surface border border-border p-6 rounded-2xl">
                        <h3 className="font-black text-xl mb-6 text-foreground text-center">Match Lineups</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Team A */}
                            <div className="space-y-4">
                                <h4 className="font-bold text-lg text-primary text-center bg-primary/10 py-2 rounded-lg">{teamA?.teamName || 'Team A'}</h4>
                                {details.categoryMatches.map((cat, i) => {
                                    const assignedPlayers = details.teamALineupPlayers?.filter(p => p.teamEventCategoryId === cat.teamEventCategoryId && !p.isSubstitute) || [];
                                    return (
                                        <div key={cat.id} className="bg-background border border-border rounded-xl p-3">
                                            <div className="text-xs text-foreground/50 font-bold uppercase tracking-widest mb-2">
                                                Match {i + 1}: {cat.categoryName}
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                {assignedPlayers.length > 0 ? assignedPlayers.map((p, idx) => (
                                                    <div key={idx} className="flex items-center gap-2 p-2 bg-surface rounded-lg">
                                                        <div className="w-6 h-6 rounded-full bg-border overflow-hidden flex items-center justify-center">
                                                            {p.photoUrl ? <img src={p.photoUrl} className="w-full h-full object-cover"/> : <span className="text-[10px] text-foreground/50">?</span>}
                                                        </div>
                                                        <span className="text-sm font-semibold">{p.playerName || `Player ID: ${p.playerRegistrationId}`}</span>
                                                    </div>
                                                )) : <div className="text-sm italic text-foreground/40">No players assigned</div>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Team B */}
                            <div className="space-y-4">
                                <h4 className="font-bold text-lg text-primary text-center bg-primary/10 py-2 rounded-lg">{teamB?.teamName || 'Team B'}</h4>
                                {details.categoryMatches.map((cat, i) => {
                                    const assignedPlayers = details.teamBLineupPlayers?.filter(p => p.teamEventCategoryId === cat.teamEventCategoryId && !p.isSubstitute) || [];
                                    return (
                                        <div key={cat.id} className="bg-background border border-border rounded-xl p-3">
                                            <div className="text-xs text-foreground/50 font-bold uppercase tracking-widest mb-2">
                                                Match {i + 1}: {cat.categoryName}
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                {assignedPlayers.length > 0 ? assignedPlayers.map((p, idx) => (
                                                    <div key={idx} className="flex items-center gap-2 p-2 bg-surface rounded-lg">
                                                        <div className="w-6 h-6 rounded-full bg-border overflow-hidden flex items-center justify-center">
                                                            {p.photoUrl ? <img src={p.photoUrl} className="w-full h-full object-cover"/> : <span className="text-[10px] text-foreground/50">?</span>}
                                                        </div>
                                                        <span className="text-sm font-semibold">{p.playerName || `Player ID: ${p.playerRegistrationId}`}</span>
                                                    </div>
                                                )) : <div className="text-sm italic text-foreground/40">No players assigned</div>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ) : (
                    <LineupSubmissionForm
                        fixtureMatchId={match.id.toString()}
                        teamRegistrationId={(myRegistration.registrationId || myRegistration.id).toString()}
                        categories={formattedCategories}
                        roster={formattedRoster}
                        deadline={deadline}
                        onSubmit={handleSubmit}
                        existingLineup={existingLineupState}
                        isLocked={isLocked}
                    />
                )}
            </div>
        </div>
    );
}
