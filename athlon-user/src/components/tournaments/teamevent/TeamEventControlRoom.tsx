import React, { useState, useEffect } from 'react';
import { Match, Registration } from '@/lib/api/tournaments';
import { TeamEventService, TeamEventFixtureDetails } from '@/lib/api/teamEvents';
import { CheckCircleIcon, XCircleIcon, ClockIcon, UsersIcon, AlertCircleIcon, LockIcon } from 'lucide-react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { toast } from 'react-hot-toast';

interface Props {
  match: Match;
  registrations: Registration[];
  onClose: () => void;
  onUpdate: () => void;
}

export const TeamEventControlRoom: React.FC<Props> = ({ match, registrations, onClose, onUpdate }) => {
  const { userId } = useAuthStore();
  const [details, setDetails] = useState<TeamEventFixtureDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [rejectingTeam, setRejectingTeam] = useState<'A' | 'B' | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const teamA = registrations.find(r => r.registrationUuid === match.teamARegistrationUuid || r.uuid === match.teamARegistrationUuid);
  const teamB = registrations.find(r => r.registrationUuid === match.teamBRegistrationUuid || r.uuid === match.teamBRegistrationUuid);

  useEffect(() => {
    fetchDetails();
  }, [match.id]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const data = await TeamEventService.getFixtureDetails(match.id);
      setDetails(data);
    } catch (error) {
      console.error('Failed to fetch fixture details', error);
      toast.error('Failed to load control room');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (lineupId: number) => {
    if (!userId) return;
    try {
      await TeamEventService.approveLineup(lineupId, Number(userId));
      toast.success('Lineup approved');
      fetchDetails();
      onUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to approve lineup');
    }
  };

  const handleReject = async (lineupId: number) => {
    if (!rejectReason.trim()) {
      toast.error('Rejection reason is required');
      return;
    }
    try {
      await TeamEventService.rejectLineup(lineupId, rejectReason);
      toast.success('Lineup rejected');
      setRejectingTeam(null);
      setRejectReason('');
      fetchDetails();
      onUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject lineup');
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="text-white text-xl font-bold animate-pulse">Loading...</div>
      </div>
    );
  }

  const bothApproved = details?.teamALineup?.status === 'APPROVED' && details?.teamBLineup?.status === 'APPROVED';

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
        <div className="max-w-5xl mx-auto space-y-6">
          
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-foreground">Team Event Control Room</h2>
              <p className="text-sm text-foreground/50">Review lineups and manage fixture status.</p>
            </div>
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-surface hover:bg-surface-elevated text-foreground font-bold rounded-lg transition-colors border border-border"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* TEAM A */}
            <div className="bg-surface border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6 border-b border-border/50 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <UsersIcon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{teamA?.teamName || 'Team A'}</h3>
                    <p className="text-xs text-foreground/50 uppercase tracking-widest font-black">
                      {details?.teamALineup?.status || 'NOT SUBMITTED'}
                    </p>
                  </div>
                </div>
              </div>

              {details?.teamALineup?.status === 'SUBMITTED' && rejectingTeam !== 'A' && (
                <div className="flex gap-2 mb-6">
                  <button onClick={() => handleApprove(details.teamALineup!.id)} className="flex-1 py-2 bg-[#1B9C56] text-white rounded-lg font-bold text-sm hover:bg-[#1B9C56]/90 transition-colors">
                    Approve Lineup
                  </button>
                  <button onClick={() => setRejectingTeam('A')} className="flex-1 py-2 bg-red-500/10 text-red-500 rounded-lg font-bold text-sm hover:bg-red-500 hover:text-white transition-colors">
                    Reject
                  </button>
                </div>
              )}

              {rejectingTeam === 'A' && (
                <div className="mb-6 space-y-3 p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
                  <textarea 
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    placeholder="Reason for rejection..."
                    className="w-full bg-background border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-red-500 text-foreground"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <button onClick={() => handleReject(details!.teamALineup!.id)} className="flex-1 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors">
                      Confirm Rejection
                    </button>
                    <button onClick={() => setRejectingTeam(null)} className="flex-1 py-2 bg-surface text-foreground rounded-lg font-bold text-sm hover:bg-surface-elevated transition-colors border border-border">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {details?.categoryMatches.map((cat, i) => {
                  const assignedPlayers = details.teamALineupPlayers?.filter(p => p.teamEventCategoryId === cat.teamEventCategoryId && !p.isSubstitute) || [];
                  return (
                    <div key={cat.id} className="bg-background border border-border rounded-xl p-3">
                      <div className="text-xs text-foreground/50 font-bold uppercase tracking-widest mb-2">
                        Match {i + 1}: {cat.categoryName} ({cat.matchFormat})
                      </div>
                      <div className="flex flex-col gap-2">
                        {assignedPlayers.length > 0 ? assignedPlayers.map((p, idx) => (
                          <div key={idx} className="flex items-center gap-3 bg-surface p-2.5 rounded-lg border border-border/50 shadow-sm transition-colors hover:border-primary/30">
                            <div className="w-9 h-9 rounded-full bg-border/50 overflow-hidden shrink-0 flex items-center justify-center">
                              {p.photoUrl ? (
                                <img src={p.photoUrl} alt={p.playerName || 'Player'} className="w-full h-full object-cover" />
                              ) : (
                                <UsersIcon className="w-4 h-4 text-foreground/40" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-foreground truncate">
                                {p.playerName || `Player ID: ${p.playerRegistrationId || p.id}`}
                              </p>
                              <p className="text-[10px] uppercase tracking-wider text-text-muted font-bold">
                                {p.isSubstitute ? 'Substitute' : `Player ${idx + 1}`}
                              </p>
                            </div>
                          </div>
                        )) : (
                          <div className="text-sm flex items-center gap-2 p-3 bg-surface border border-dashed border-border/60 rounded-lg text-foreground/40">
                            <AlertCircleIcon className="w-4 h-4" />
                            <span className="italic font-medium">No players assigned</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* TEAM B */}
            <div className="bg-surface border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6 border-b border-border/50 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <UsersIcon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{teamB?.teamName || 'Team B'}</h3>
                    <p className="text-xs text-foreground/50 uppercase tracking-widest font-black">
                      {details?.teamBLineup?.status || 'NOT SUBMITTED'}
                    </p>
                  </div>
                </div>
              </div>

              {details?.teamBLineup?.status === 'SUBMITTED' && rejectingTeam !== 'B' && (
                <div className="flex gap-2 mb-6">
                  <button onClick={() => handleApprove(details.teamBLineup!.id)} className="flex-1 py-2 bg-[#1B9C56] text-white rounded-lg font-bold text-sm hover:bg-[#1B9C56]/90 transition-colors">
                    Approve Lineup
                  </button>
                  <button onClick={() => setRejectingTeam('B')} className="flex-1 py-2 bg-red-500/10 text-red-500 rounded-lg font-bold text-sm hover:bg-red-500 hover:text-white transition-colors">
                    Reject
                  </button>
                </div>
              )}

              {rejectingTeam === 'B' && (
                <div className="mb-6 space-y-3 p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
                  <textarea 
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    placeholder="Reason for rejection..."
                    className="w-full bg-background border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-red-500 text-foreground"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <button onClick={() => handleReject(details!.teamBLineup!.id)} className="flex-1 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors">
                      Confirm Rejection
                    </button>
                    <button onClick={() => setRejectingTeam(null)} className="flex-1 py-2 bg-surface text-foreground rounded-lg font-bold text-sm hover:bg-surface-elevated transition-colors border border-border">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {details?.categoryMatches.map((cat, i) => {
                  const assignedPlayers = details.teamBLineupPlayers?.filter(p => p.teamEventCategoryId === cat.teamEventCategoryId && !p.isSubstitute) || [];
                  return (
                    <div key={cat.id} className="bg-background border border-border rounded-xl p-3">
                      <div className="text-xs text-foreground/50 font-bold uppercase tracking-widest mb-2">
                        Match {i + 1}: {cat.categoryName} ({cat.matchFormat})
                      </div>
                      <div className="flex flex-col gap-2">
                        {assignedPlayers.length > 0 ? assignedPlayers.map((p, idx) => (
                          <div key={idx} className="flex items-center gap-3 bg-surface p-2.5 rounded-lg border border-border/50 shadow-sm transition-colors hover:border-primary/30">
                            <div className="w-9 h-9 rounded-full bg-border/50 overflow-hidden shrink-0 flex items-center justify-center">
                              {p.photoUrl ? (
                                <img src={p.photoUrl} alt={p.playerName || 'Player'} className="w-full h-full object-cover" />
                              ) : (
                                <UsersIcon className="w-4 h-4 text-foreground/40" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-foreground truncate">
                                {p.playerName || `Player ID: ${p.playerRegistrationId || p.id}`}
                              </p>
                              <p className="text-[10px] uppercase tracking-wider text-text-muted font-bold">
                                {p.isSubstitute ? 'Substitute' : `Player ${idx + 1}`}
                              </p>
                            </div>
                          </div>
                        )) : (
                          <div className="text-sm flex items-center gap-2 p-3 bg-surface border border-dashed border-border/60 rounded-lg text-foreground/40">
                            <AlertCircleIcon className="w-4 h-4" />
                            <span className="italic font-medium">No players assigned</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          {bothApproved && (
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center gap-2">
              <CheckCircleIcon className="w-5 h-5 text-primary" />
              <span className="font-bold text-primary">Both Lineups Approved - Match Ready</span>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
