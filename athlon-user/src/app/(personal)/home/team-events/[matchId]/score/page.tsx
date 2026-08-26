'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { MatchService, Match } from '@/lib/api/matches';
import { TournamentService, RegistrationService, Registration, Tournament, TeamEventRosterService, TeamEventRosterPlayer } from '@/lib/api/tournaments';
import { TeamEventService, TeamEventFixtureDetails, TeamEventCategoryMatch } from '@/lib/api/teamEvents';
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
    Activity, 
    Trophy, 
    Lock, 
    Play, 
    ChevronRight,
    Swords,
    X
} from 'lucide-react';

export default function TeamEventFixtureScoringPage() {
    const { matchId } = useParams() as { matchId: string };
    const { userId } = useAuthStore();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [match, setMatch] = useState<Match | null>(null);
    const [details, setDetails] = useState<TeamEventFixtureDetails | null>(null);
    const [tournament, setTournament] = useState<Tournament | null>(null);
    const [registrations, setRegistrations] = useState<Registration[]>([]);

    // Quick score submit modal state
    const [scoringCategory, setScoringCategory] = useState<TeamEventCategoryMatch | null>(null);
    const [scoreInput, setScoreInput] = useState('');
    const [selectedWinnerRegId, setSelectedWinnerRegId] = useState<number | null>(null);
    const [submittingScore, setSubmittingScore] = useState(false);

    useEffect(() => {
        if (!matchId) return;
        fetchData();
    }, [matchId]);

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

            if (matchData.tournamentUuid) {
                try {
                    const tRes = await TournamentService.getById(matchData.tournamentUuid);
                    setTournament(tRes.data as Tournament);
                } catch (e) {
                    console.error("Failed to load tournament info", e);
                }
            }

            if (matchData.tournamentId) {
                try {
                    const regRes = await RegistrationService.getByTournament(matchData.tournamentId);
                    setRegistrations(regRes.data || []);
                } catch (e) {
                    console.error("Failed to load registrations", e);
                }
            }
        } catch (error) {
            console.error("Failed to load fixture scoring data", error);
            toast.error("Failed to load fixture data");
        } finally {
            setLoading(false);
        }
    };

    const handleQuickScoreSubmit = async () => {
        if (!scoringCategory || !selectedWinnerRegId || !scoreInput.trim()) {
            toast.error("Please select a winner and enter the score");
            return;
        }

        try {
            setSubmittingScore(true);
            await TeamEventService.submitCategoryScore(
                scoringCategory.id,
                selectedWinnerRegId,
                scoreInput.trim()
            );

            toast.success(`Score submitted for ${scoringCategory.categoryName}!`);
            setScoringCategory(null);
            setScoreInput('');
            setSelectedWinnerRegId(null);
            await fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to submit category score");
        } finally {
            setSubmittingScore(false);
        }
    };

    const handleLaunchLiveScore = (categoryMatch: TeamEventCategoryMatch, teamAPlayerNames: string, teamBPlayerNames: string) => {
        if (!match) return;

        const sport = match.sportType || tournament?.sport || 'Badminton';
        const teamAStr = encodeURIComponent(teamAPlayerNames.replace(/\s*&\s*/g, ','));
        const teamBStr = encodeURIComponent(teamBPlayerNames.replace(/\s*&\s*/g, ','));
        const teamANameStr = encodeURIComponent(match.teamAName || 'Team A');
        const teamBNameStr = encodeURIComponent(match.teamBName || 'Team B');
        const tournamentNameStr = encodeURIComponent(tournament?.name || match.tournamentName || '');
        const courtNameStr = encodeURIComponent(match.courtName || (match.courtId ? `Court ${match.courtId}` : ''));

        // Map the rubber's matchFormat (DOUBLES / SINGLES) to the GameCategory string the
        // match-setup page understands (it checks category.includes('Doubles')).
        const fmt = (categoryMatch.matchFormat || '').toUpperCase();
        const gameCategory = fmt.includes('DOUBLES') ? "Men's Doubles" : "Men's Singles";
        const categoryParam = encodeURIComponent(gameCategory);

        router.push(
            `/match-setup?matchId=${match.uuid}&sport=${sport}&category=${categoryParam}&teamA=${teamAStr}&teamB=${teamBStr}&teamAName=${teamANameStr}&teamBName=${teamBNameStr}&tournamentName=${tournamentNameStr}&courtName=${courtNameStr}&fromUmpire=true&categoryMatchId=${categoryMatch.id}`
        );
    };

    if (loading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <p className="text-foreground/70 font-black text-sm uppercase tracking-widest">Loading Umpire Fixture...</p>
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
                <h2 className="text-xl font-black mb-2">Fixture Not Found</h2>
                <p className="text-sm text-foreground/60 mb-6">The requested fixture details could not be retrieved.</p>
                <button onClick={() => router.back()} className="px-6 py-2.5 bg-primary text-black font-black rounded-xl text-xs uppercase tracking-wider">
                    Go Back
                </button>
            </div>
        );
    }

    const teamAReg = registrations.find(r => r.registrationId === match.teamARegistrationId || r.uuid === match.teamARegistrationUuid);
    const teamBReg = registrations.find(r => r.registrationId === match.teamBRegistrationId || r.uuid === match.teamBRegistrationUuid);

    const teamAName = teamAReg?.teamName || match.teamAName || 'Team A';
    const teamBName = teamBReg?.teamName || match.teamBName || 'Team B';

    // Calculate score
    let teamAWins = 0;
    let teamBWins = 0;
    details.categoryMatches.forEach(cm => {
        if (cm.winnerRegistrationId != null) {
            if (cm.winnerRegistrationId === match.teamARegistrationId) teamAWins++;
            else if (cm.winnerRegistrationId === match.teamBRegistrationId) teamBWins++;
        }
    });

    const isAApproved = details.teamALineup?.status === 'APPROVED';
    const isBApproved = details.teamBLineup?.status === 'APPROVED';
    const bothApproved = isAApproved && isBApproved;
    const isFixtureCompleted = match.status === 'COMPLETED' || details.categoryMatches.every(cm => cm.status === 'COMPLETED');

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
        <div className="min-h-screen bg-background text-foreground font-sans pb-28">
            {/* Top Navigation */}
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
                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1.5">
                            <Activity className="w-3.5 h-3.5 animate-pulse" />
                            Umpire Scoring Mode
                        </span>
                    </div>
                </div>
            </header>

            <main className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
                {/* ── Fixture Header Hero ─────────────────────────────────── */}
                <div className="relative rounded-3xl overflow-hidden border border-border bg-gradient-to-br from-surface-elevated via-surface to-background p-6 shadow-2xl">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

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

                    {/* Overall Scoreboard Head-to-Head */}
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-center relative z-10">
                        {/* Team A */}
                        <div className="sm:col-span-2 rounded-2xl p-4 bg-surface border border-border text-left">
                            <span className="text-[10px] font-black uppercase tracking-widest text-foreground/50">Team A</span>
                            <h3 className="text-xl font-black text-foreground truncate mt-0.5">{teamAName}</h3>
                            <div className="text-[11px] font-bold text-foreground/50 mt-1">
                                {details.teamALineup?.status === 'APPROVED' ? 'Lineup Approved ✓' : 'Lineup ' + (details.teamALineup?.status || 'Pending')}
                            </div>
                        </div>

                        {/* Center Score Display */}
                        <div className="flex flex-col items-center justify-center">
                            <div className="px-5 py-2.5 rounded-2xl bg-background border border-border/80 flex items-center gap-3 shadow-inner">
                                <span className={`text-2xl font-black ${teamAWins > teamBWins ? 'text-primary' : 'text-foreground'}`}>
                                    {teamAWins}
                                </span>
                                <span className="text-foreground/30 font-black text-sm">:</span>
                                <span className={`text-2xl font-black ${teamBWins > teamAWins ? 'text-primary' : 'text-foreground'}`}>
                                    {teamBWins}
                                </span>
                            </div>
                            <span className="text-[10px] font-black text-foreground/40 mt-1 uppercase tracking-widest">
                                Rubbers Won
                            </span>
                        </div>

                        {/* Team B */}
                        <div className="sm:col-span-2 rounded-2xl p-4 bg-surface border border-border text-right sm:text-right">
                            <span className="text-[10px] font-black uppercase tracking-widest text-foreground/50">Team B</span>
                            <h3 className="text-xl font-black text-foreground truncate mt-0.5">{teamBName}</h3>
                            <div className="text-[11px] font-bold text-foreground/50 mt-1">
                                {details.teamBLineup?.status === 'APPROVED' ? 'Lineup Approved ✓' : 'Lineup ' + (details.teamBLineup?.status || 'Pending')}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Lineup Alert if not approved ───────────────────────── */}
                {!bothApproved && (
                    <div className="rounded-2xl p-4 border border-amber-500/30 bg-amber-500/10 flex items-start gap-3 text-amber-400">
                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-xs font-black uppercase tracking-wider">Lineup Approval Pending</h4>
                            <p className="text-xs text-amber-400/80 mt-0.5">
                                One or both team lineups have not been fully approved yet. You can still score the rubber matches as an assigned umpire.
                            </p>
                        </div>
                    </div>
                )}

                {/* ── Category Matches (Rubbers) ─────────────────────────── */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black uppercase tracking-widest text-foreground/80 flex items-center gap-2">
                            <Swords className="w-4 h-4 text-primary" />
                            Category Matches ({details.categoryMatches.length} Rubbers)
                        </h3>
                        <span className="text-xs font-bold text-foreground/50">
                            {details.categoryMatches.filter(cm => cm.status === 'COMPLETED').length} / {details.categoryMatches.length} Completed
                        </span>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {details.categoryMatches.map((catMatch, idx) => {
                            const isCompleted = catMatch.status === 'COMPLETED';
                            const teamAPlayers = details.teamALineupPlayers?.filter(p => 
                                (catMatch.teamEventCategoryId != null && String(p.teamEventCategoryId) === String(catMatch.teamEventCategoryId)) ||
                                (catMatch.id != null && String(p.teamEventCategoryId) === String(catMatch.id))
                            ) || [];

                            const teamBPlayers = details.teamBLineupPlayers?.filter(p => 
                                (catMatch.teamEventCategoryId != null && String(p.teamEventCategoryId) === String(catMatch.teamEventCategoryId)) ||
                                (catMatch.id != null && String(p.teamEventCategoryId) === String(catMatch.id))
                            ) || [];

                            const teamAPlayerNames = teamAPlayers.map(p => p.playerName || `Player ${p.position}`).join(' & ') || 'Players TBA';
                            const teamBPlayerNames = teamBPlayers.map(p => p.playerName || `Player ${p.position}`).join(' & ') || 'Players TBA';

                            const isTeamAWinner = catMatch.winnerRegistrationId === match.teamARegistrationId;
                            const isTeamBWinner = catMatch.winnerRegistrationId === match.teamBRegistrationId;

                            return (
                                <div 
                                    key={catMatch.id} 
                                    className={`rounded-2xl border p-5 transition-all ${
                                        isCompleted 
                                            ? 'bg-surface-elevated/70 border-emerald-500/30' 
                                            : 'bg-surface-elevated border-border hover:border-primary/40 shadow-sm'
                                    }`}
                                >
                                    {/* Rubber Header */}
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-border/60 pb-3 mb-4">
                                        <div className="flex items-center gap-2.5">
                                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                                                isCompleted ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-primary/10 text-primary border border-primary/20'
                                            }`}>
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="text-base font-black text-foreground">{catMatch.categoryName}</h4>
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-background border border-border text-foreground/70">
                                                        {catMatch.matchFormat}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-foreground/40 font-medium">
                                                    {catMatch.playersRequired || (catMatch.matchFormat === 'DOUBLES' ? 2 : 1)} Players per Team
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
                                                isCompleted 
                                                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                                                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                            }`}>
                                                {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5 animate-pulse" />}
                                                {isCompleted ? 'Finished' : 'Ready to Score'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Matchup Comparison */}
                                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-center mb-5">
                                        {/* Side A */}
                                        <div className={`sm:col-span-2 p-3.5 rounded-xl border transition-all ${
                                            isTeamAWinner 
                                                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' 
                                                : 'bg-background border-border/80'
                                        }`}>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-[10px] font-black uppercase tracking-wider text-foreground/50">{teamAName}</span>
                                                {isTeamAWinner && <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500 text-black">Winner</span>}
                                            </div>
                                            <div className="text-sm font-black text-foreground truncate">{teamAPlayerNames}</div>
                                        </div>

                                        <div className="text-center font-black text-foreground/30 text-xs uppercase">
                                            VS
                                        </div>

                                        {/* Side B */}
                                        <div className={`sm:col-span-2 p-3.5 rounded-xl border transition-all ${
                                            isTeamBWinner 
                                                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' 
                                                : 'bg-background border-border/80'
                                        }`}>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-[10px] font-black uppercase tracking-wider text-foreground/50">{teamBName}</span>
                                                {isTeamBWinner && <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500 text-black">Winner</span>}
                                            </div>
                                            <div className="text-sm font-black text-foreground truncate">{teamBPlayerNames}</div>
                                        </div>
                                    </div>

                                    {/* Score / Result Banner */}
                                    {isCompleted && (
                                        <div className="p-3 rounded-xl bg-background border border-border flex items-center justify-between mb-4">
                                            <span className="text-xs font-bold text-foreground/60">Final Rubber Score:</span>
                                            <span className="text-sm font-black text-emerald-400">
                                                {catMatch.score || 'Winner recorded'}
                                            </span>
                                        </div>
                                    )}

                                    {/* Action Buttons for Umpire */}
                                    <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-border/60">
                                        <button
                                            onClick={() => {
                                                setScoringCategory(catMatch);
                                                setScoreInput(catMatch.score || '');
                                                setSelectedWinnerRegId(catMatch.winnerRegistrationId || match.teamARegistrationId || null);
                                            }}
                                            className="px-4 py-2 rounded-xl text-xs font-bold bg-surface border border-border hover:border-primary/40 text-foreground transition-all"
                                        >
                                            {isCompleted ? 'Edit Score' : 'Quick Score Entry'}
                                        </button>

                                        <button
                                            onClick={() => handleLaunchLiveScore(catMatch, teamAPlayerNames, teamBPlayerNames)}
                                            className="px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-primary hover:bg-primary-hover text-black transition-all active:scale-95 flex items-center gap-1.5 shadow-md"
                                        >
                                            <Play className="w-3.5 h-3.5 fill-black" />
                                            {isCompleted ? 'Re-Score Live' : 'Live Score Rubber'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ── Quick Score Entry Modal ────────────────────────────── */}
                {scoringCategory && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-surface-elevated border border-primary/30 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
                            <div className="flex items-center justify-between border-b border-border pb-3">
                                <div>
                                    <h3 className="font-black text-base text-foreground">Score Category Match</h3>
                                    <p className="text-xs text-foreground/50 mt-0.5">{scoringCategory.categoryName} ({scoringCategory.matchFormat})</p>
                                </div>
                                <button onClick={() => setScoringCategory(null)} className="text-foreground/40 hover:text-foreground">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-foreground/70 uppercase tracking-wider block mb-2">
                                        Select Winning Team *
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedWinnerRegId(match.teamARegistrationId || null)}
                                            className={`p-3 rounded-xl text-xs font-black uppercase tracking-wider border transition-all ${
                                                selectedWinnerRegId === match.teamARegistrationId 
                                                    ? 'bg-primary text-black border-primary shadow-md' 
                                                    : 'bg-background border-border text-foreground/70 hover:border-primary/40'
                                            }`}
                                        >
                                            {teamAName}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setSelectedWinnerRegId(match.teamBRegistrationId || null)}
                                            className={`p-3 rounded-xl text-xs font-black uppercase tracking-wider border transition-all ${
                                                selectedWinnerRegId === match.teamBRegistrationId 
                                                    ? 'bg-primary text-black border-primary shadow-md' 
                                                    : 'bg-background border-border text-foreground/70 hover:border-primary/40'
                                            }`}
                                        >
                                            {teamBName}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-foreground/70 uppercase tracking-wider block mb-2">
                                        Set Scores (e.g. 15-10, 15-12) *
                                    </label>
                                    <input 
                                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-foreground/30"
                                        placeholder="15-10, 15-12"
                                        value={scoreInput}
                                        onChange={e => setScoreInput(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                                <button
                                    type="button"
                                    onClick={() => setScoringCategory(null)}
                                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-foreground/60 hover:text-foreground"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleQuickScoreSubmit}
                                    disabled={submittingScore || !selectedWinnerRegId || !scoreInput.trim()}
                                    className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-primary hover:bg-primary-hover text-black transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {submittingScore ? 'Saving...' : 'Submit Rubber Score'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
