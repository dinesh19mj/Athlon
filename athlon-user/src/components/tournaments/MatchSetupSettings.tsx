"use client";

import React, { useState, useEffect } from "react";
import { MapPin, Phone, Calendar, Clock, Play, Save, Users, User, Trophy, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { TournamentService, MatchService, RegistrationService, StreamConfigService, Tournament, Match, Registration, CourtConfig } from "@/lib/api/tournaments";

interface MatchSetupSettingsProps {
  tournamentId: string;
}

export function MatchSetupSettings({ tournamentId }: MatchSetupSettingsProps) {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [courts, setCourts] = useState<CourtConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Local state for editing courts/umpires/schedules before saving
  const [editState, setEditState] = useState<{ [matchUuid: string]: { courtId?: string, umpirePhone?: string, matchDate?: string, matchTime?: string } }>({});
  const [savingMatches, setSavingMatches] = useState<{ [matchUuid: string]: boolean }>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const tRes = await TournamentService.getById(tournamentId);
        if (tRes && tRes.data) {
          setTournament(tRes.data);

          if (tRes.data.tournamentId) {
            const rRes = await RegistrationService.getByTournament(tRes.data.tournamentId);
            if (rRes && rRes.data) {
              setRegistrations(rRes.data);
            }
          }

          if (tRes.data.tournamentUuid) {
            const mRes = await MatchService.getByTournament(tRes.data.tournamentUuid);
            if (mRes) {
              setMatches(mRes);
            }

            const fetchedCourts = await StreamConfigService.getByTournament(tRes.data.tournamentUuid);
            if (fetchedCourts.length > 0) {
              setCourts(fetchedCourts);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch match setup data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [tournamentId]);

  // Generate date options between tournament startDate and endDate
  const getTournamentDateOptions = () => {
    if (!tournament?.startDate || !tournament?.endDate) return [];
    const start = new Date(tournament.startDate);
    const end = new Date(tournament.endDate);
    const dates: { value: string; label: string }[] = [];
    const current = new Date(start);
    let count = 0;
    while (current <= end && count < 30) {
      const year = current.getFullYear();
      const month = String(current.getMonth() + 1).padStart(2, '0');
      const day = String(current.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      const labelStr = current.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      dates.push({ value: dateStr, label: labelStr });
      current.setDate(current.getDate() + 1);
      count++;
    }
    return dates;
  };

  const handleEditChange = (matchUuid: string, field: 'courtId' | 'umpirePhone' | 'matchDate' | 'matchTime', value: string) => {
    setEditState(prev => ({
      ...prev,
      [matchUuid]: {
        ...prev[matchUuid],
        [field]: value
      }
    }));
  };

  const handleSaveMatch = async (matchUuid: string) => {
    const edits = editState[matchUuid];
    if (!edits) return;

    setSavingMatches(prev => ({ ...prev, [matchUuid]: true }));
    try {
      let updatedMatch: Match | undefined;

      if (edits.courtId !== undefined) {
        const courtIdNum = parseInt(edits.courtId);
        if (!isNaN(courtIdNum)) {
          updatedMatch = await MatchService.updateCourt(matchUuid, courtIdNum);
        }
      }

      if (edits.umpirePhone !== undefined) {
        updatedMatch = await MatchService.updateUmpire(matchUuid, edits.umpirePhone);
      }

      if (edits.matchDate !== undefined || edits.matchTime !== undefined) {
        const currentMatch = matches.find(m => m.uuid === matchUuid);
        let curDate = "";
        let curTime = "09:00";

        if (currentMatch?.scheduledTime) {
          const d = new Date(currentMatch.scheduledTime);
          if (!isNaN(d.getTime())) {
            curDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            curTime = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
          }
        }

        const dateToSave = edits.matchDate !== undefined ? edits.matchDate : (curDate || (tournament?.startDate ? tournament.startDate.substring(0, 10) : ''));
        const timeToSave = edits.matchTime !== undefined ? edits.matchTime : curTime;

        if (dateToSave && timeToSave) {
          const fullIsoStr = `${dateToSave}T${timeToSave}:00`;
          updatedMatch = await MatchService.updateSchedule(matchUuid, fullIsoStr);
        }
      }

      if (updatedMatch) {
        setMatches(prev => prev.map(m => m.uuid === matchUuid ? updatedMatch! : m));
        setEditState(prev => {
          const newState = { ...prev };
          delete newState[matchUuid];
          return newState;
        });
      }
    } catch (error) {
      console.error("Failed to update match:", error);
      alert("Failed to update match configuration.");
    } finally {
      setSavingMatches(prev => ({ ...prev, [matchUuid]: false }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20 text-text-muted">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-sm font-medium tracking-wide">Loading match setups...</p>
        </div>
      </div>
    );
  }

  const scheduledMatches = matches.filter(m => m.teamARegistrationUuid != null || m.teamBRegistrationUuid != null);
  const tournamentDates = getTournamentDateOptions();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-surface border border-border/80 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" /> Match Assignments & Controls
          </h2>
          <p className="text-sm text-text-muted mt-1">
            Assign courts, set match dates/times, and add umpire contacts for scheduled matches.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-background/60 px-4 py-2 rounded-xl border border-border/50 text-xs text-text-muted font-medium">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span>{scheduledMatches.length} Scheduled Matches</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {scheduledMatches.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border rounded-2xl bg-surface/30">
            <Play className="w-12 h-12 text-text-muted/40 mb-4" />
            <p className="text-lg font-bold text-foreground">No matches scheduled yet.</p>
            <p className="text-sm text-text-muted max-w-sm mt-1">Generate the tournament draw first to see matches here.</p>
          </div>
        ) : (
          scheduledMatches.map((match, idx) => {
            const teamA = registrations.find(r => r.registrationUuid === match.teamARegistrationUuid || r.uuid === match.teamARegistrationUuid);
            const teamB = registrations.find(r => r.registrationUuid === match.teamBRegistrationUuid || r.uuid === match.teamBRegistrationUuid);
            const isLive = match.status === 'LIVE';
            const isCompleted = match.status === 'COMPLETED';

            const edits = editState[match.uuid] || {};
            const isEditing = edits.courtId !== undefined || edits.umpirePhone !== undefined || edits.matchDate !== undefined || edits.matchTime !== undefined;
            const isSaving = savingMatches[match.uuid];

            const currentCourtId = edits.courtId !== undefined ? parseInt(edits.courtId) : match.courtId;
            const assignedCourt = courts.find(c => c.id === currentCourtId);
            const currentUmpirePhone = edits.umpirePhone !== undefined ? edits.umpirePhone : match.umpirePhone;

            // Extract initial date & time for display/editing
            let initialDate = "";
            let initialTime = "";
            if (match.scheduledTime) {
              const d = new Date(match.scheduledTime);
              if (!isNaN(d.getTime())) {
                initialDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                initialTime = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
              }
            }

            // Prefill initialDate from tournament.startDate if no scheduled date set yet
            const tStart = tournament?.startDate ? tournament.startDate.substring(0, 10) : "";
            if (!initialDate && tStart) {
              initialDate = tStart;
            }

            const currentMatchDate = edits.matchDate !== undefined ? edits.matchDate : initialDate;
            const currentMatchTime = edits.matchTime !== undefined ? edits.matchTime : initialTime;

            return (
              <div
                key={match.uuid || idx}
                className="group relative bg-surface-elevated border border-border/80 hover:border-primary/40 rounded-2xl p-6 flex flex-col justify-between shadow-lg hover:shadow-primary/5 transition-all duration-300 overflow-hidden"
              >
                {/* Gradient Accent Bar */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${isLive
                      ? 'from-red-500 via-rose-500 to-amber-500 animate-pulse'
                      : isCompleted
                        ? 'from-emerald-500 to-teal-400'
                        : assignedCourt
                          ? 'from-primary via-emerald-400 to-cyan-500'
                          : 'from-border via-primary/30 to-border'
                    }`}
                />

                <div>
                  {/* Card Header: Match Number, Category, Time & Status */}
                  <div className="flex flex-col gap-3 mb-5 pb-4 border-b border-border/50">
                    {/* Top Line: Match #, Category, Status Badge */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-1 bg-primary/10 border border-primary/20 text-primary font-black text-xs uppercase tracking-wider rounded-md flex items-center gap-1.5 shrink-0">
                          <Sparkles className="w-3 h-3" /> Match #{idx + 1}
                        </span>
                        {match.poolName && (
                          <span className="px-2 py-0.5 bg-surface border border-border text-text-muted font-bold text-[10px] uppercase tracking-wider rounded-md shrink-0">
                            {match.poolName}
                          </span>
                        )}
                        {tournament?.category && (
                          <span className="px-2 py-0.5 bg-surface border border-border text-text-muted font-bold text-[10px] uppercase tracking-wider rounded-md shrink-0">
                            {tournament.category}
                          </span>
                        )}
                      </div>

                      {/* Status Badge */}
                      <div className="shrink-0">
                        {isLive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-red-500/10 text-red-400 border border-red-500/30">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                            LIVE NOW
                          </span>
                        ) : isCompleted ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" />
                            COMPLETED
                          </span>
                        ) : assignedCourt ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary border border-primary/30">
                            READY
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-background border border-border text-text-muted">
                            UNASSIGNED
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bottom Line: Scheduled Time */}
                    <div className="flex items-center gap-1.5 text-xs text-text-muted font-medium">
                      <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>
                        {match.scheduledTime
                          ? new Date(match.scheduledTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
                          : 'Time TBA'}
                      </span>
                    </div>
                  </div>

                  {/* Teams vs Teams Showcase */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 relative">

                    {/* Team A Card */}
                    <div className="p-4 bg-background/60 border border-border/60 rounded-xl flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">Side A</span>
                          {teamA && <Users className="w-3.5 h-3.5 text-primary" />}
                        </div>
                        <h4 className={`font-extrabold text-base leading-tight ${teamA ? 'text-foreground' : 'text-text-muted italic'}`}>
                          {teamA ? teamA.teamName : 'TBD (Winner)'}
                        </h4>
                      </div>

                      {/* Team A Players */}
                      {teamA && teamA.players && teamA.players.length > 0 && (
                        <div className="flex flex-col gap-1.5 pt-2 border-t border-border/40">
                          {teamA.players.map((p, pIdx) => (
                            <div key={pIdx} className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-text-muted flex items-center gap-1.5">
                                <User className="w-3 h-3 text-primary/70" /> {p.playerName}
                              </span>
                              {p.phoneNumber && (
                                <span className="text-[10px] font-mono text-text-muted/70 bg-surface px-1.5 py-0.5 rounded">{p.phoneNumber}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* VS Badge */}
                    <div className="hidden sm:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-surface-elevated border border-border text-primary font-black text-xs items-center justify-center shadow-lg z-10">
                      VS
                    </div>

                    {/* Team B Card */}
                    <div className="p-4 bg-background/60 border border-border/60 rounded-xl flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">Side B</span>
                          {teamB && <Users className="w-3.5 h-3.5 text-emerald-400" />}
                        </div>
                        <h4 className={`font-extrabold text-base leading-tight ${teamB ? 'text-foreground' : 'text-text-muted italic'}`}>
                          {teamB ? teamB.teamName : 'TBD (Winner)'}
                        </h4>
                      </div>

                      {/* Team B Players */}
                      {teamB && teamB.players && teamB.players.length > 0 && (
                        <div className="flex flex-col gap-1.5 pt-2 border-t border-border/40">
                          {teamB.players.map((p, pIdx) => (
                            <div key={pIdx} className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-text-muted flex items-center gap-1.5">
                                <User className="w-3 h-3 text-emerald-400/70" /> {p.playerName}
                              </span>
                              {p.phoneNumber && (
                                <span className="text-[10px] font-mono text-text-muted/70 bg-surface px-1.5 py-0.5 rounded">{p.phoneNumber}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Setup Controls Box */}
                <div className="p-4 bg-background/40 border border-border/50 rounded-xl space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                    {/* Court Selector */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-primary" /> Court Assignment
                      </label>
                      <select
                        className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:border-primary transition-colors cursor-pointer"
                        value={edits.courtId !== undefined ? edits.courtId : (match.courtId || '')}
                        onChange={(e) => handleEditChange(match.uuid, 'courtId', e.target.value)}
                      >
                        <option value="">Select a court...</option>
                        {courts.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.name} {c.streamKey ? '(Video Stream)' : '(Score Only)'}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Umpire Phone */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-emerald-400" /> Umpire Phone
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 9876543210"
                        className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:border-primary transition-colors"
                        value={currentUmpirePhone || ''}
                        onChange={(e) => handleEditChange(match.uuid, 'umpirePhone', e.target.value)}
                      />
                    </div>

                  </div>

                  {/* Date & Time side-by-side on all screen sizes including mobile */}
                  <div className="grid grid-cols-2 gap-3">

                    {/* Match Date Calendar Picker */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-sky-400" /> Match Date
                      </label>
                      <input
                        type="date"
                        min={tournament?.startDate ? tournament.startDate.substring(0, 10) : undefined}
                        max={tournament?.endDate ? tournament.endDate.substring(0, 10) : undefined}
                        className="w-full bg-surface border border-border rounded-lg px-2.5 py-2 text-xs font-mono text-foreground focus:outline-none focus:border-primary transition-colors cursor-pointer"
                        value={currentMatchDate}
                        onChange={(e) => handleEditChange(match.uuid, 'matchDate', e.target.value)}
                      />
                    </div>

                    {/* Match Time Picker */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-400" /> Match Time
                      </label>
                      <input
                        type="time"
                        className="w-full bg-surface border border-border rounded-lg px-2.5 py-2 text-xs font-mono text-foreground focus:outline-none focus:border-primary transition-colors cursor-pointer"
                        value={currentMatchTime}
                        onChange={(e) => handleEditChange(match.uuid, 'matchTime', e.target.value)}
                      />
                    </div>

                  </div>

                  {/* Summary / Save Button */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/40">
                    <div className="text-[11px] text-text-muted">
                      {assignedCourt ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Assigned to {assignedCourt.name}
                        </span>
                      ) : (
                        <span className="text-amber-400/90 font-medium flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> Select court to assign
                        </span>
                      )}
                    </div>

                    {isEditing && (
                      <button
                        onClick={() => handleSaveMatch(match.uuid)}
                        disabled={isSaving}
                        className="px-5 py-2 bg-primary hover:bg-primary/90 text-black font-bold text-xs rounded-lg flex items-center gap-2 shadow-md shadow-primary/20 transition-all"
                      >
                        {isSaving ? (
                          <span className="animate-pulse">Saving...</span>
                        ) : (
                          <>
                            <Save className="w-3.5 h-3.5" /> Save
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
