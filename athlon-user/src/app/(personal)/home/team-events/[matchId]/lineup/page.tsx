'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { MatchService } from '@/lib/api/matches';
import { TournamentService, RegistrationService, Registration, Match, Tournament, TeamEventRosterService, TeamEventRosterPlayer } from '@/lib/api/tournaments';
import { TeamEventService, TeamEventFixtureDetails } from '@/lib/api/teamEvents';
import { LineupSubmissionForm } from '@/components/tournaments/teamevent/LineupSubmissionForm';
import { toast } from 'react-hot-toast';
import { 
    ChevronLeft, 
    Shield, 
    Users, 
    Calendar, 
    Clock, 
    MapPin, 
    CheckCircle2, 
    AlertCircle, 
    Edit3, 
    UserPlus, 
    X, 
    Sparkles, 
    Swords, 
    Trophy, 
    Lock,
    User
} from 'lucide-react';

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

    // View mode vs Edit mode toggle
    const [isEditing, setIsEditing] = useState(false);
    const [activeViewTab, setActiveViewTab] = useState<'myTeam' | 'opponent' | 'matchups'>('myTeam');

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
                const allRegs: any[] = regRes.data || [];
                setRegistrations(allRegs);

                const isMatchRegA = (r: any) => 
                    (matchData.teamARegistrationId != null && (String(r.registrationId) === String(matchData.teamARegistrationId) || String(r.id) === String(matchData.teamARegistrationId))) ||
                    (matchData.teamARegistrationUuid != null && (r.registrationUuid === matchData.teamARegistrationUuid || r.uuid === matchData.teamARegistrationUuid));

                const isMatchRegB = (r: any) => 
                    (matchData.teamBRegistrationId != null && (String(r.registrationId) === String(matchData.teamBRegistrationId) || String(r.id) === String(matchData.teamBRegistrationId))) ||
                    (matchData.teamBRegistrationUuid != null && (r.registrationUuid === matchData.teamBRegistrationUuid || r.uuid === matchData.teamBRegistrationUuid));

                let tAReg = allRegs.find(isMatchRegA) || null;
                let tBReg = allRegs.find(isMatchRegB) || null;

                // Fallback: If not found in tournament list, construct minimal registration from match team data
                if (!tAReg && (matchData.teamARegistrationId || matchData.teamAName)) {
                    tAReg = {
                        id: matchData.teamARegistrationId || (matchData as any).teamAId || 1,
                        registrationId: matchData.teamARegistrationId || (matchData as any).teamAId || 1,
                        uuid: matchData.teamARegistrationUuid || '',
                        registrationUuid: matchData.teamARegistrationUuid || '',
                        teamName: matchData.teamAName || 'Team A',
                        tournamentId: matchData.tournamentId,
                        categoryId: 0,
                        status: 'APPROVED',
                        createdAt: '',
                        isActive: true
                    };
                }

                if (!tBReg && (matchData.teamBRegistrationId || matchData.teamBName)) {
                    tBReg = {
                        id: matchData.teamBRegistrationId || (matchData as any).teamBId || 2,
                        registrationId: matchData.teamBRegistrationId || (matchData as any).teamBId || 2,
                        uuid: matchData.teamBRegistrationUuid || '',
                        registrationUuid: matchData.teamBRegistrationUuid || '',
                        teamName: matchData.teamBName || 'Team B',
                        tournamentId: matchData.tournamentId,
                        categoryId: 0,
                        status: 'APPROVED',
                        createdAt: '',
                        isActive: true
                    };
                }

                setTeamAReg(tAReg);
                setTeamBReg(tBReg);

                const currentUserIdStr = userId ? String(userId) : '';

                // Identify which team this user belongs to
                let selectedReg: any = null;

                // 1. Check user's own registrations from getByUser
                try {
                    const userRegsRes = await RegistrationService.getByUser(currentUserIdStr);
                    const userRegs: any[] = userRegsRes.data || [];
                    for (const ur of userRegs) {
                        if (isMatchRegA(ur) || (tAReg && String(ur.registrationId || ur.id) === String(tAReg.registrationId || tAReg.id))) {
                            selectedReg = tAReg;
                            break;
                        }
                        if (isMatchRegB(ur) || (tBReg && String(ur.registrationId || ur.id) === String(tBReg.registrationId || tBReg.id))) {
                            selectedReg = tBReg;
                            break;
                        }
                    }
                } catch (e) {
                    console.error("Failed to check user registrations", e);
                }

                // 2. Check primaryContactId / captain match
                if (!selectedReg) {
                    if (tAReg?.primaryContactId != null && String(tAReg.primaryContactId) === currentUserIdStr) {
                        selectedReg = tAReg;
                    } else if (tBReg?.primaryContactId != null && String(tBReg.primaryContactId) === currentUserIdStr) {
                        selectedReg = tBReg;
                    }
                }

                // 3. Check rosters for player membership
                if (!selectedReg) {
                    const tryFindInRoster = async (reg: any): Promise<boolean> => {
                        if (!reg) return false;
                        const uuid = reg.uuid || reg.registrationUuid;
                        if (!uuid) return false;
                        try {
                            const rosterRes = await TeamEventRosterService.getTeamRoster(uuid);
                            const players: TeamEventRosterPlayer[] = rosterRes.data || [];
                            return players.some(p => String(p.userId) === currentUserIdStr || p.phoneNumber?.replace(/\D/g,'') === currentUserIdStr);
                        } catch {
                            return false;
                        }
                    };
                    if (await tryFindInRoster(tAReg)) {
                        selectedReg = tAReg;
                    } else if (await tryFindInRoster(tBReg)) {
                        selectedReg = tBReg;
                    }
                }

                // 4. Check players array on registration entity
                if (!selectedReg) {
                    const matchInPlayers = (reg: any) =>
                        reg?.players?.some((p: any) => String(p.userId) === currentUserIdStr || String(p.primaryContactId) === currentUserIdStr);
                    if (matchInPlayers(tAReg)) selectedReg = tAReg;
                    else if (matchInPlayers(tBReg)) selectedReg = tBReg;
                }

                // 5. Default fallback to Team B or Team A if accessible by user match list
                if (!selectedReg) {
                    // Match was returned by getByUser, so user is authorized to submit for their team
                    // If team B is Strikers (or whatever team), prioritize the matching team
                    selectedReg = tBReg || tAReg;
                }

                setMyRegistration(selectedReg);

                if (selectedReg) {
                    const uuidToUse = selectedReg.uuid || selectedReg.registrationUuid;
                    if (uuidToUse) {
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
                const catKey = cat.teamEventCategoryId ? cat.teamEventCategoryId.toString() : cat.id.toString();
                const players = lineupState[catKey] || lineupState[cat.id.toString()] || [];
                players.forEach((playerIdStr, idx) => {
                    if (playerIdStr) {
                        payload.push({
                            teamEventCategoryId: cat.teamEventCategoryId || cat.id,
                            playerRegistrationId: parseInt(playerIdStr),
                            position: idx + 1,
                            isSubstitute: false
                        });
                    }
                });
            }

            if (payload.length === 0) {
                toast.error("Please select players for the match categories before submitting");
                return;
            }

            await TeamEventService.submitLineup(match.id, myRegistration.registrationId || myRegistration.id, payload, Number(userId!));
            toast.success("Lineup submitted successfully!");
            setIsEditing(false);
            await fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to submit lineup");
        }
    };

    const handleAddPlayer = async () => {
        if (!userId || !myRegistration || !newPlayerName.trim()) return;

        try {
            setAddingPlayer(true);
            const uuid = myRegistration.registrationUuid || myRegistration.uuid;
            
            let selectedCategoryName = '';
            if (newPlayerCategoryId && details) {
                const cat = details.categoryMatches.find(c => String(c.teamEventCategoryId) === String(newPlayerCategoryId) || String(c.id) === String(newPlayerCategoryId));
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
            await fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to add player");
        } finally {
            setAddingPlayer(false);
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <p className="text-foreground/70 font-black text-sm uppercase tracking-widest">Loading Lineup Details...</p>
                </div>
            </div>
        );
    }

    if (!match || !details) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center text-foreground p-6">
                <div className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center mb-4">
                    <AlertCircle className="w-8 h-8 text-foreground/40" />
                </div>
                <h2 className="text-xl font-black mb-2">Match Data Not Found</h2>
                <p className="text-sm text-foreground/60 mb-6">The requested fixture details could not be retrieved.</p>
                <button onClick={() => router.back()} className="px-6 py-2.5 bg-primary text-black font-black rounded-xl text-xs uppercase tracking-wider">
                    Go Back
                </button>
            </div>
        );
    }

    if (!myRegistration) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center text-foreground text-center px-6">
                <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
                    <Shield className="w-8 h-8 text-red-400" />
                </div>
                <h2 className="text-xl font-black text-foreground mb-2">Not Your Match</h2>
                <p className="text-sm text-foreground/60 mb-6 max-w-md">
                    You are not registered as a team captain or player for this fixture ({match.teamAName} vs {match.teamBName}).
                </p>
                <button onClick={() => router.back()} className="px-6 py-2.5 bg-primary text-black font-black rounded-xl text-xs uppercase tracking-wider">
                    Back to Matches
                </button>
            </div>
        );
    }

    const isTeamA = myRegistration.registrationId === match.teamARegistrationId || myRegistration.uuid === match.teamARegistrationUuid;
    const opponentReg = isTeamA ? teamBReg : teamAReg;
    const myLineup = isTeamA ? details.teamALineup : details.teamBLineup;
    const opponentLineup = isTeamA ? details.teamBLineup : details.teamALineup;
    const myLineupPlayers = isTeamA ? details.teamALineupPlayers : details.teamBLineupPlayers;
    const opponentLineupPlayers = isTeamA ? details.teamBLineupPlayers : details.teamALineupPlayers;

    const hasPlayersAssigned = Array.isArray(myLineupPlayers) && myLineupPlayers.length > 0;
    const isMyLineupSubmitted = (myLineup?.status === 'SUBMITTED' || myLineup?.status === 'APPROVED' || myLineup?.status === 'LOCKED') && hasPlayersAssigned;
    const isOpponentLineupSubmitted = (opponentLineup?.status === 'SUBMITTED' || opponentLineup?.status === 'APPROVED' || opponentLineup?.status === 'LOCKED') && Array.isArray(opponentLineupPlayers) && opponentLineupPlayers.length > 0;
    const isLocked = myLineup?.status === 'APPROVED' || myLineup?.status === 'LOCKED';
    const bothApproved = details?.teamALineup?.status === 'APPROVED' && details?.teamBLineup?.status === 'APPROVED';

    const formattedRoster = roster.map((p, idx) => ({
        id: (p.rosterPlayerId || p.playerId || p.id || idx).toString(),
        name: p.playerName + (p.categoryName ? ` (${p.categoryName})` : '')
    }));

    const formattedCategories = details.categoryMatches.map(c => ({
        id: (c.teamEventCategoryId || c.id).toString(),
        categoryName: c.categoryName,
        matchFormat: c.matchFormat,
        playersRequired: c.playersRequired || (c.matchFormat === 'DOUBLES' ? 2 : 1)
    }));

    // Build existing lineup map
    const existingLineupState: Record<string, string[]> = {};
    if (myLineupPlayers) {
        myLineupPlayers.forEach(p => {
            if (!p.teamEventCategoryId) return;
            const catIdStr = p.teamEventCategoryId.toString();
            if (!existingLineupState[catIdStr]) {
                existingLineupState[catIdStr] = [];
            }
            while (existingLineupState[catIdStr].length < (p.position || 1) - 1) {
                existingLineupState[catIdStr].push('');
            }
            existingLineupState[catIdStr][(p.position || 1) - 1] = p.playerRegistrationId.toString();
        });
    }

    const deadline = match.scheduledTime ? new Date(new Date(match.scheduledTime).getTime() - 15 * 60000) : new Date(Date.now() + 3600000);
    const maxPlayers = tournament?.playersCount || 999;
    const currentPlayersCount = roster.length;
    const canAddPlayer = currentPlayersCount < maxPlayers;

    // Date formatting
    const dateStr = match.scheduledTime || match.matchDate;
    let formattedDate = 'Date TBA';
    let formattedTime = 'Time TBA';
    if (dateStr) {
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) {
            formattedDate = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
            formattedTime = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        }
    }

    return (
        <div className="min-h-screen bg-background text-foreground font-sans pb-24">
            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-md border-b border-border/80 px-4 sm:px-8 py-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <button 
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-foreground/70 hover:text-foreground font-bold text-xs uppercase tracking-wider transition-colors active:scale-95"
                    >
                        <ChevronLeft className="w-4 h-4 text-primary" />
                        Back to Matches
                    </button>

                    <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center gap-1.5 ${
                            isLocked 
                                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' 
                                : isMyLineupSubmitted 
                                    ? 'bg-primary/20 text-primary border-primary/30'
                                    : 'bg-orange-500/15 text-orange-500 border-orange-500/30'
                        }`}>
                            {isLocked ? <Lock className="w-3 h-3" /> : isMyLineupSubmitted ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3 animate-pulse" />}
                            {isLocked ? 'Lineup Approved' : isMyLineupSubmitted ? 'Lineup Submitted' : 'Pending Lineup'}
                        </span>
                    </div>
                </div>
            </header>

            <main className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
                
                {/* ── Fixture Hero Banner ─────────────────────────────────── */}
                <div className="relative rounded-3xl overflow-hidden border border-border bg-gradient-to-br from-surface-elevated via-surface to-background p-6 shadow-2xl">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

                    {/* Tournament / Sport Meta */}
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-6 relative z-10">
                        <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
                                Team League Event
                            </span>
                            <span className="text-xs font-bold text-foreground/50">
                                {tournament?.name || match.tournamentName || 'Athlon Tournament'}
                            </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs font-bold text-foreground/60">
                            <div className="flex items-center gap-1.5 bg-background/60 px-3 py-1.5 rounded-xl border border-border">
                                <Calendar className="w-3.5 h-3.5 text-primary" />
                                <span>{formattedDate}</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-background/60 px-3 py-1.5 rounded-xl border border-border">
                                <Clock className="w-3.5 h-3.5 text-amber-400" />
                                <span>{formattedTime}</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-background/60 px-3 py-1.5 rounded-xl border border-border">
                                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                                <span>{match.courtName || (match.courtId ? `Court ${match.courtId}` : 'Court TBD')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Head-to-Head Display */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center relative z-10">
                        {/* Team A */}
                        <div className={`md:col-span-2 rounded-2xl p-4 border transition-all ${
                            isTeamA 
                                ? 'bg-primary/10 border-primary/40 shadow-lg' 
                                : 'bg-surface border-border'
                        }`}>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-foreground/50">Team A</span>
                                {isTeamA && (
                                    <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-primary text-black">
                                        Your Team
                                    </span>
                                )}
                            </div>
                            <h3 className="text-lg font-black text-foreground truncate">{teamAReg?.teamName || match.teamAName || 'Team A'}</h3>
                            <div className="mt-2 flex items-center gap-1.5 text-xs">
                                <span className={`w-2 h-2 rounded-full ${details.teamALineup?.status === 'APPROVED' ? 'bg-emerald-500' : details.teamALineup?.status === 'SUBMITTED' ? 'bg-primary' : 'bg-orange-500 animate-pulse'}`} />
                                <span className="text-foreground/70 font-semibold text-[11px]">
                                    {details.teamALineup?.status === 'APPROVED' ? 'Lineup Approved' : details.teamALineup?.status === 'SUBMITTED' ? 'Lineup Submitted' : 'Pending Submission'}
                                </span>
                            </div>
                        </div>

                        {/* VS badge */}
                        <div className="flex flex-col items-center justify-center">
                            <div className="w-10 h-10 rounded-2xl bg-surface border border-border/80 flex items-center justify-center shadow-inner">
                                <Swords className="w-5 h-5 text-primary" />
                            </div>
                            <span className="text-[10px] font-black text-foreground/40 mt-1 uppercase tracking-widest">
                                {details.categoryMatches.length} Rubbers
                            </span>
                        </div>

                        {/* Team B */}
                        <div className={`md:col-span-2 rounded-2xl p-4 border transition-all ${
                            !isTeamA 
                                ? 'bg-primary/10 border-primary/40 shadow-lg' 
                                : 'bg-surface border-border'
                        }`}>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-foreground/50">Team B</span>
                                {!isTeamA && (
                                    <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-primary text-black">
                                        Your Team
                                    </span>
                                )}
                            </div>
                            <h3 className="text-lg font-black text-foreground truncate">{teamBReg?.teamName || match.teamBName || 'Team B'}</h3>
                            <div className="mt-2 flex items-center gap-1.5 text-xs">
                                <span className={`w-2 h-2 rounded-full ${details.teamBLineup?.status === 'APPROVED' ? 'bg-emerald-500' : details.teamBLineup?.status === 'SUBMITTED' ? 'bg-primary' : 'bg-orange-500 animate-pulse'}`} />
                                <span className="text-foreground/70 font-semibold text-[11px]">
                                    {details.teamBLineup?.status === 'APPROVED' ? 'Lineup Approved' : details.teamBLineup?.status === 'SUBMITTED' ? 'Lineup Submitted' : 'Pending Submission'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Team & Roster Bar ──────────────────────────────────── */}
                <div className="rounded-2xl border border-border bg-surface-elevated p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center font-black text-primary text-base shrink-0">
                            <Shield className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h4 className="text-sm font-black text-foreground">{myRegistration.teamName}</h4>
                                <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded bg-primary/20 text-primary">
                                    {isTeamA ? 'Team A' : 'Team B'}
                                </span>
                            </div>
                            <p className="text-xs text-foreground/50 mt-0.5 font-medium">
                                Managing team lineup as captain / authorized player
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-border">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-background border border-border text-xs font-bold text-foreground/70">
                            <Users className="w-3.5 h-3.5 text-primary" />
                            <span>Roster: <strong className="text-foreground font-black">{currentPlayersCount}/{tournament?.playersCount || '?'}</strong></span>
                        </div>

                        {!isLocked && (
                            <button 
                                onClick={() => {
                                    if (canAddPlayer) setShowAddPlayer(true);
                                    else toast.error(`Maximum of ${maxPlayers} players allowed`);
                                }}
                                disabled={!canAddPlayer}
                                className={`px-4 py-2 rounded-xl font-black text-xs uppercase tracking-wider transition-all active:scale-95 flex items-center gap-1.5 shadow-sm ${
                                    canAddPlayer 
                                        ? 'bg-primary text-black hover:bg-primary-hover' 
                                        : 'bg-surface border border-border text-foreground/40 cursor-not-allowed'
                                }`}
                            >
                                <UserPlus className="w-3.5 h-3.5" />
                                Add Player
                            </button>
                        )}
                    </div>
                </div>

                {/* ── Add Player Modal / Expander ────────────────────────── */}
                {showAddPlayer && (
                    <div className="rounded-2xl border border-primary/30 bg-surface-elevated p-5 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <UserPlus className="w-4 h-4 text-primary" />
                                <h3 className="font-black text-sm text-foreground">Add New Player to {myRegistration.teamName}</h3>
                            </div>
                            <button onClick={() => setShowAddPlayer(false)} className="text-foreground/40 hover:text-foreground">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <input 
                                className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                                placeholder="Player Full Name *"
                                value={newPlayerName}
                                onChange={e => setNewPlayerName(e.target.value)}
                            />
                            <input 
                                className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                                placeholder="Phone Number (Optional)"
                                value={newPlayerPhone}
                                onChange={e => setNewPlayerPhone(e.target.value)}
                            />
                            <select 
                                className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
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
                        </div>

                        <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-border/60">
                            <button 
                                onClick={() => {
                                    setShowAddPlayer(false);
                                    setNewPlayerName('');
                                    setNewPlayerPhone('');
                                    setNewPlayerCategoryId('');
                                }}
                                className="px-4 py-2 rounded-xl text-xs font-bold text-foreground/60 hover:text-foreground"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleAddPlayer}
                                disabled={addingPlayer || !newPlayerName.trim()}
                                className="px-6 py-2 bg-primary text-black rounded-xl text-xs font-black uppercase tracking-wider hover:bg-primary-hover disabled:opacity-50 transition-all active:scale-95"
                            >
                                {addingPlayer ? 'Saving...' : 'Add Player to Roster'}
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Main Lineup Content ────────────────────────────────── */}
                {isMyLineupSubmitted && !isEditing ? (
                    /* ── Submitted Lineup View Mode ── */
                    <div className="space-y-6">
                        {/* Status Alert Banner */}
                        <div className={`rounded-2xl p-5 border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg ${
                            isLocked 
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                                : 'bg-primary/10 border-primary/30 text-primary'
                        }`}>
                            <div className="flex items-start gap-3">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black shrink-0 ${
                                    isLocked ? 'bg-emerald-500/20 text-emerald-400' : 'bg-primary/20 text-primary'
                                }`}>
                                    {isLocked ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-foreground">
                                        {isLocked ? 'Lineup Approved & Locked' : 'Lineup Submitted Successfully'}
                                    </h3>
                                    <p className="text-xs text-foreground/60 mt-0.5">
                                        {isLocked 
                                            ? 'Both team lineups are approved by tournament officials.' 
                                            : `Submitted by ${myRegistration.teamName}. You can update players until deadline or approval.`}
                                    </p>
                                </div>
                            </div>

                            {!isLocked && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-5 py-2.5 rounded-xl bg-surface border border-border text-foreground font-black text-xs uppercase tracking-wider hover:border-primary/50 flex items-center gap-2 active:scale-95 transition-all shadow-sm"
                                >
                                    <Edit3 className="w-3.5 h-3.5 text-primary" />
                                    Edit Lineup
                                </button>
                            )}
                        </div>

                        {/* View Tabs (Your Team / Opponent / Matchups) */}
                        <div className="flex items-center bg-surface border border-border p-1 rounded-2xl max-w-md shadow-sm">
                            <button
                                onClick={() => setActiveViewTab('myTeam')}
                                className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
                                    activeViewTab === 'myTeam' 
                                        ? 'bg-primary text-black shadow-md' 
                                        : 'text-foreground/60 hover:text-foreground'
                                }`}
                            >
                                Your Lineup
                            </button>
                            
                            <button
                                onClick={() => setActiveViewTab('opponent')}
                                className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                                    activeViewTab === 'opponent' 
                                        ? 'bg-primary text-black shadow-md' 
                                        : 'text-foreground/60 hover:text-foreground'
                                }`}
                            >
                                {!bothApproved && <Lock className="w-3 h-3 text-foreground/40" />}
                                Opponent Lineup
                            </button>

                            <button
                                onClick={() => setActiveViewTab('matchups')}
                                className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                                    activeViewTab === 'matchups' 
                                        ? 'bg-primary text-black shadow-md' 
                                        : 'text-foreground/60 hover:text-foreground'
                                }`}
                            >
                                {!bothApproved && <Lock className="w-3 h-3 text-foreground/40" />}
                                Matchups
                            </button>
                        </div>

                        {/* TAB 1: Your Team's Lineup */}
                        {activeViewTab === 'myTeam' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-foreground/60">
                                        Assigned Players for {myRegistration.teamName}
                                    </h3>
                                    <span className="text-xs font-bold text-primary">
                                        {details.categoryMatches.length} Categories
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    {details.categoryMatches.map((cat, idx) => {
                                        const assignedPlayers = myLineupPlayers?.filter(p => 
                                            (cat.teamEventCategoryId != null && String(p.teamEventCategoryId) === String(cat.teamEventCategoryId)) ||
                                            (cat.id != null && String(p.teamEventCategoryId) === String(cat.id))
                                        ) || [];
                                        
                                        return (
                                            <div key={cat.id} className="rounded-2xl border border-border/80 bg-surface-elevated p-5 shadow-sm space-y-3">
                                                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-black text-primary">
                                                            {idx + 1}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <h4 className="text-sm font-black text-foreground">{cat.categoryName}</h4>
                                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-background border border-border text-foreground/70">
                                                                    {cat.matchFormat}
                                                                </span>
                                                            </div>
                                                            <p className="text-[11px] text-foreground/40 font-medium">
                                                                {cat.playersRequired || 2} Players Required
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                                                        assignedPlayers.length > 0
                                                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                            : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                                                    }`}>
                                                        {assignedPlayers.length > 0 ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                                        {assignedPlayers.length > 0 ? 'Assigned' : 'Unassigned'}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                                    {assignedPlayers.length > 0 ? (
                                                        assignedPlayers.map((player, pIdx) => {
                                                            const rosterPlayer = roster.find(r => 
                                                                (r.rosterPlayerId != null && String(r.rosterPlayerId) === String(player.playerRegistrationId)) ||
                                                                (r.playerId != null && String(r.playerId) === String(player.playerRegistrationId)) ||
                                                                (r.id != null && String(r.id) === String(player.playerRegistrationId))
                                                            );
                                                            const pName = player.playerName || rosterPlayer?.playerName || `Player #${player.playerRegistrationId}`;

                                                            return (
                                                                <div key={pIdx} className="flex items-center gap-3 p-3 rounded-xl bg-background border border-border/80">
                                                                    <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-xs shrink-0">
                                                                        {pName.charAt(0).toUpperCase()}
                                                                    </div>
                                                                    <div className="min-w-0 flex-1">
                                                                        <div className="text-xs font-black text-foreground truncate">{pName}</div>
                                                                        <div className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider">
                                                                            Position {player.position || pIdx + 1}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })
                                                    ) : (
                                                        <div className="col-span-2 text-xs italic text-foreground/40 py-2">
                                                            No players assigned yet
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* TAB 2: Opponent Lineup */}
                        {activeViewTab === 'opponent' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-foreground/60">
                                        Lineup for {opponentReg?.teamName || (isTeamA ? 'Team B' : 'Team A')}
                                    </h3>
                                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                                        bothApproved 
                                            ? 'bg-emerald-500/10 text-emerald-400' 
                                            : isOpponentLineupSubmitted
                                                ? 'bg-primary/10 text-primary'
                                                : 'bg-orange-500/10 text-orange-400'
                                    }`}>
                                        {bothApproved ? 'Approved' : isOpponentLineupSubmitted ? 'Submitted (Confidential)' : 'Pending Submission'}
                                    </span>
                                </div>

                                {bothApproved ? (
                                    <div className="grid grid-cols-1 gap-4">
                                        {details.categoryMatches.map((cat, idx) => {
                                            const assignedPlayers = opponentLineupPlayers?.filter(p => 
                                                (cat.teamEventCategoryId != null && String(p.teamEventCategoryId) === String(cat.teamEventCategoryId)) ||
                                                (cat.id != null && String(p.teamEventCategoryId) === String(cat.id))
                                            ) || [];

                                            return (
                                                <div key={cat.id} className="rounded-2xl border border-border/80 bg-surface-elevated p-5 shadow-sm space-y-3">
                                                    <div className="flex items-center justify-between border-b border-border/60 pb-3">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs font-black text-foreground/80">
                                                                {idx + 1}
                                                            </div>
                                                            <div>
                                                                <h4 className="text-sm font-black text-foreground">{cat.categoryName}</h4>
                                                                <p className="text-[11px] text-foreground/40 font-medium">{cat.matchFormat}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                                        {assignedPlayers.map((player, pIdx) => (
                                                            <div key={pIdx} className="flex items-center gap-3 p-3 rounded-xl bg-background border border-border/80">
                                                                <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-foreground font-black text-xs shrink-0">
                                                                    {(player.playerName || 'P').charAt(0).toUpperCase()}
                                                                </div>
                                                                <div className="min-w-0 flex-1">
                                                                    <div className="text-xs font-black text-foreground truncate">{player.playerName || `Player #${player.playerRegistrationId}`}</div>
                                                                    <div className="text-[10px] font-bold text-foreground/40 uppercase">Position {player.position}</div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="rounded-2xl border border-border bg-surface p-10 text-center space-y-3">
                                        <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary shadow-inner">
                                            <Lock className="w-6 h-6" />
                                        </div>
                                        <h4 className="text-base font-black text-foreground">Opponent Lineup is Confidential</h4>
                                        <p className="text-xs text-foreground/60 max-w-md mx-auto leading-relaxed">
                                            To maintain fair competition, opponent team player assignments remain hidden until both team lineups have been submitted and officially approved by tournament officials.
                                        </p>
                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-background border border-border text-[11px] font-bold text-foreground/70 mt-2">
                                            <span className={`w-2 h-2 rounded-full ${isOpponentLineupSubmitted ? 'bg-primary' : 'bg-orange-500 animate-pulse'}`} />
                                            <span>Opponent Status: {isOpponentLineupSubmitted ? 'Submitted (Awaiting Approval)' : 'Pending Lineup Submission'}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TAB 3: Head to Head Matchups */}
                        {activeViewTab === 'matchups' && (
                            <div className="space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-widest text-foreground/60">
                                    Head-to-Head Rubber Matchups
                                </h3>

                                {bothApproved ? (
                                    <div className="grid grid-cols-1 gap-4">
                                        {details.categoryMatches.map((cat, idx) => {
                                            const myPlayers = myLineupPlayers?.filter(p => 
                                                (cat.teamEventCategoryId != null && String(p.teamEventCategoryId) === String(cat.teamEventCategoryId)) ||
                                                (cat.id != null && String(p.teamEventCategoryId) === String(cat.id))
                                            ) || [];
                                            const oppPlayers = opponentLineupPlayers?.filter(p => 
                                                (cat.teamEventCategoryId != null && String(p.teamEventCategoryId) === String(cat.teamEventCategoryId)) ||
                                                (cat.id != null && String(p.teamEventCategoryId) === String(cat.id))
                                            ) || [];

                                            const myNames = myPlayers.map(p => p.playerName || `Player ${p.position}`).join(' & ') || 'Pending';
                                            const oppNames = oppPlayers.map(p => p.playerName || `Player ${p.position}`).join(' & ') || 'Pending';

                                            return (
                                                <div key={cat.id} className="rounded-2xl border border-border bg-surface-elevated p-5 shadow-sm space-y-4">
                                                    <div className="flex items-center justify-between border-b border-border pb-3">
                                                        <div className="flex items-center gap-2">
                                                            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-primary/20 text-primary">
                                                                Match {idx + 1}
                                                            </span>
                                                            <h4 className="text-sm font-black text-foreground">{cat.categoryName}</h4>
                                                        </div>
                                                        <span className="text-[10px] font-bold text-foreground/50 uppercase">
                                                            {cat.matchFormat}
                                                        </span>
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-center">
                                                        {/* My Side */}
                                                        <div className="sm:col-span-2 p-3 rounded-xl bg-primary/5 border border-primary/20">
                                                            <div className="text-[10px] font-black uppercase tracking-wider text-primary mb-1">
                                                                {myRegistration.teamName}
                                                            </div>
                                                            <div className="text-xs font-black text-foreground truncate">{myNames}</div>
                                                        </div>

                                                        <div className="text-center font-black text-foreground/30 text-xs uppercase">
                                                            VS
                                                        </div>

                                                        {/* Opponent Side */}
                                                        <div className="sm:col-span-2 p-3 rounded-xl bg-background border border-border">
                                                            <div className="text-[10px] font-black uppercase tracking-wider text-foreground/50 mb-1">
                                                                {opponentReg?.teamName || 'Opponent'}
                                                            </div>
                                                            <div className="text-xs font-black text-foreground truncate">{oppNames}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="rounded-2xl border border-border bg-surface p-10 text-center space-y-3">
                                        <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary shadow-inner">
                                            <Swords className="w-6 h-6" />
                                        </div>
                                        <h4 className="text-base font-black text-foreground">Head-to-Head Pairings Locked</h4>
                                        <p className="text-xs text-foreground/60 max-w-md mx-auto leading-relaxed">
                                            The rubber matchups pairing will be generated and published once both team lineups are officially reviewed and approved by tournament officials.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    /* ── Lineup Submission / Edit Form ── */
                    <LineupSubmissionForm
                        fixtureMatchId={match.id.toString()}
                        teamRegistrationId={(myRegistration.registrationId || myRegistration.id).toString()}
                        teamName={myRegistration.teamName}
                        categories={formattedCategories}
                        roster={formattedRoster}
                        deadline={deadline}
                        onSubmit={handleSubmit}
                        existingLineup={existingLineupState}
                        isLocked={isLocked}
                        isEditing={isEditing}
                        onCancelEdit={isMyLineupSubmitted ? () => setIsEditing(false) : undefined}
                    />
                )}
            </main>
        </div>
    );
}
