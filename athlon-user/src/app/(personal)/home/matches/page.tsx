'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Clock, Trophy, ChevronRight, Activity, ClipboardList, AlertCircle, CheckCircle, Shield, Users, User, Play, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { MatchService, Match } from '@/lib/api/matches';
import { AuthService } from '@/lib/api/auth';

export default function PlayerMatchesPage() {
  const router = useRouter();
  const { userId, userUuid, token } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'playing' | 'umpiring'>('playing');
  const [userMatches, setUserMatches] = useState<Match[]>([]);
  const [umpireMatches, setUmpireMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      setLoading(true);
      MatchService.getByUser(Number(userId))
        .then((response: any) => {
          if (response && response.data) {
            setUserMatches(response.data);
          }
        })
        .catch(err => {
          console.error("Failed to load user matches:", err);
        })
        .finally(() => {
          if (!userUuid || !token) {
            setLoading(false);
          }
        });
        
      if (userUuid && token) {
        AuthService.getUserProfile(userUuid, token)
          .then((profileRes) => {
            if (profileRes && profileRes.data && profileRes.data.phone) {
              return MatchService.getByUmpirePhone(profileRes.data.phone).catch(() => ({ data: [] }));
            }
            return { data: [] };
          })
          .then((response: any) => {
             if (response && response.data && Array.isArray(response.data)) {
                setUmpireMatches(response.data);
             } else {
                setUmpireMatches([]);
             }
          })
          .catch(() => {
             setUmpireMatches([]);
          })
          .finally(() => {
            setLoading(false);
          });
      }
    } else {
      setLoading(false);
    }
  }, [userId, userUuid, token]);

  const pendingLineups = userMatches.filter(m => m.status === 'WAITING_FOR_LINEUPS');

  const getLineupButtonProps = (match: Match) => {
    const isAApproved = match.teamALineupStatus === 'APPROVED';
    const isBApproved = match.teamBLineupStatus === 'APPROVED';
    
    if (isAApproved && isBApproved) {
      return { text: 'Lineups Approved', color: 'bg-[#1B9C56]', icon: <CheckCircle className="w-4 h-4" /> };
    }
    
    return { text: 'Submit Lineup', color: 'bg-orange-500 hover:bg-orange-600', icon: <ClipboardList className="w-4 h-4" /> };
  };

  const formatMatchDateTime = (match: Match) => {
    const dateStr = match.scheduledTime || match.matchDate;
    if (!dateStr) {
      return { date: 'Date TBA', time: 'Time TBA' };
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      return { date: 'Date TBA', time: 'Time TBA' };
    }
    return {
      date: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
      time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const renderTeamName = (name?: string, fallback: string = 'Team', align: 'left' | 'right' = 'left') => {
    if (!name) return <span className={`text-xs md:text-sm font-black text-foreground ${align === 'right' ? 'text-right' : 'text-left'}`}>{fallback}</span>;
    const parts = name.split(/\s*&\s*/);
    const isRight = align === 'right';

    return (
      <div className={`flex flex-col gap-2 min-w-0 ${isRight ? 'items-end' : 'items-start'}`}>
        {parts.map((p, i) => (
          <div key={i} className={`flex items-center gap-2 min-w-0 max-w-full ${isRight ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${isRight ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-primary/10 text-primary border border-primary/20'}`}>
              <User className="w-3 h-3" />
            </div>
            <span 
              className="text-xs md:text-sm font-extrabold text-foreground leading-none tracking-tight min-w-0 break-words"
              style={{ overflowWrap: 'anywhere' }}
            >
              {p}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans pb-24">
      {/* Header */}
      <header className="p-4 md:px-8 md:py-6 border-b border-foreground/10 bg-surface/80 backdrop-blur-md sticky top-0 z-20">
        <h1 className="text-3xl font-black uppercase tracking-wide">Matches</h1>
        <p className="text-text-muted font-medium mt-1 text-sm">View your playing schedule and umpiring assignments.</p>
        
        {/* Main Tabs */}
        <div className="flex bg-surface-elevated border border-border p-1 mt-6 rounded-xl max-w-sm shadow-sm">
          <button 
            onClick={() => setActiveTab('playing')}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === 'playing' ? 'bg-[#1B9C56] text-black shadow-md' : 'text-text-muted hover:text-foreground'}`}
          >
            Playing ({userMatches.length})
          </button>
          <button 
            onClick={() => setActiveTab('umpiring')}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === 'umpiring' ? 'bg-red-500 text-white shadow-md' : 'text-text-muted hover:text-foreground'}`}
          >
            Umpiring ({umpireMatches.length})
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
        
        {loading && (
          <div className="flex justify-center items-center py-20 text-text-muted">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <p className="text-sm font-medium tracking-wide">Loading match schedule...</p>
            </div>
          </div>
        )}

        {!loading && activeTab === 'playing' && pendingLineups.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-black uppercase tracking-widest text-orange-500 mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> Action Required
            </h2>
            <div className="space-y-4">
              {pendingLineups.map((match) => {
                const isAApproved = match.teamALineupStatus === 'APPROVED';
                const isBApproved = match.teamBLineupStatus === 'APPROVED';
                const bothApproved = isAApproved && isBApproved;
                const { date, time } = formatMatchDateTime(match);
                
                return (
                <div key={match.id} className={`border rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors group ${bothApproved ? 'bg-[#1B9C56]/5 border-[#1B9C56]/20 hover:border-[#1B9C56]/50' : 'bg-orange-500/5 border-orange-500/20 hover:border-orange-500/50'}`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${bothApproved ? 'bg-[#1B9C56]/20 text-[#1B9C56]' : 'bg-orange-500/20 text-orange-500'}`}>
                        {bothApproved ? 'Lineup Approved' : 'Pending Lineup'}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Team Event</span>
                    </div>
                    <h3 className={`text-xl font-black tracking-tight mb-1 transition-colors ${bothApproved ? 'group-hover:text-[#1B9C56]' : 'group-hover:text-orange-500'}`}>
                      {match.teamAName && match.teamBName 
                        ? `${match.teamAName} vs ${match.teamBName}` 
                        : `Team Event Match #${match.id}`}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-text-muted mt-3">
                      <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-primary" /> {date}</div>
                      {time && <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-amber-400" /> {time}</div>}
                      <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-emerald-400" /> {match.courtName || (match.courtId ? `Court ${match.courtId}` : 'Court TBD')}</div>
                    </div>
                  </div>
                  <div className="flex flex-col md:items-end justify-center pt-4 md:pt-0 border-t border-border md:border-none shrink-0 md:min-w-[150px]">
                    <button 
                      onClick={() => router.push(`/home/team-events/${match.uuid}/lineup`)}
                      className={`w-full md:w-auto px-5 py-2.5 text-white text-xs font-black uppercase tracking-widest rounded-xl active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 ${getLineupButtonProps(match).color}`}
                    >
                      {getLineupButtonProps(match).icon} {getLineupButtonProps(match).text}
                    </button>
                  </div>
                </div>
              )})}
            </div>
          </div>
        )}

        {/* Playing Tab */}
        {!loading && activeTab === 'playing' && (
          <div>
            <h2 className="text-xs font-black uppercase tracking-widest text-text-muted mb-4">Playing Matches</h2>
            <div className="space-y-4">
              {userMatches.filter(m => m.status !== 'WAITING_FOR_LINEUPS').length === 0 ? (
                <div className="text-center py-12 text-text-muted text-sm font-semibold bg-surface rounded-2xl border border-border">
                  No upcoming or past playing matches found.
                </div>
              ) : (
                userMatches.filter(m => m.status !== 'WAITING_FOR_LINEUPS').map((match) => {
                  const { date, time } = formatMatchDateTime(match);
                  const isLive = match.status === 'LIVE';
                  const isCompleted = match.status === 'COMPLETED';

                  return (
                    <div key={match.id} className="relative bg-surface-elevated border border-border/80 rounded-2xl p-6 flex flex-col gap-5 hover:border-[#1B9C56]/50 shadow-md transition-all group overflow-hidden">
                      <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-[#1B9C56] to-emerald-400"></div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
                            isLive 
                              ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                              : isCompleted
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-primary/10 text-primary border border-primary/20'
                          }`}>
                            {isLive ? 'LIVE NOW' : match.status || 'SCHEDULED'}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
                            {match.sportType || 'Badminton'} {match.poolName ? `• ${match.poolName}` : ''}
                          </span>
                        </div>

                        <h3 className="text-xl font-bold text-foreground tracking-tight group-hover:text-[#1B9C56] transition-colors mb-2">
                          {match.tournamentName || `Tournament #${match.tournamentId}`}
                        </h3>

                        {/* Date, Time, Court Row */}
                        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-text-muted mt-2">
                          <div className="flex items-center gap-1.5 bg-background/50 px-3 py-1.5 rounded-lg border border-border/40">
                            <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span>{date}</span>
                          </div>
                          <div className="flex items-center gap-1.5 bg-background/50 px-3 py-1.5 rounded-lg border border-border/40">
                            <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>{time}</span>
                          </div>
                          <div className="flex items-center gap-1.5 bg-background/50 px-3 py-1.5 rounded-lg border border-border/40">
                            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>{match.courtName || (match.courtId ? `Court ${match.courtId}` : 'Court TBD')}</span>
                          </div>
                        </div>
                      </div>

                      {/* Teams Matchup Showcase */}
                      <div className="relative bg-gradient-to-r from-surface/90 via-surface-elevated to-surface/90 p-4 md:p-5 rounded-2xl border border-border/80 shadow-inner overflow-hidden">
                        <div className="flex items-center justify-between mb-3 px-1">
                          <span className="text-[9px] font-black text-text-muted uppercase tracking-widest flex items-center gap-1.5">
                            <Trophy className="w-3.5 h-3.5 text-primary" /> Head-to-Head Matchup
                          </span>
                          <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            Court Ready
                          </span>
                        </div>

                        <div className="relative flex items-center justify-between gap-3 px-1">
                          {/* Team A (Left) */}
                          <div className="flex-1 min-w-0 pr-1">
                            {renderTeamName(match.teamAName, 'Team A', 'left')}
                          </div>

                          {/* Circular Gradient VS Emblem */}
                          <div className="shrink-0 z-10 mx-1">
                            <div className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-gradient-to-tr from-primary via-emerald-400 to-cyan-400 text-black font-black text-xs md:text-sm flex items-center justify-center shadow-lg shadow-primary/25 border-2 border-background ring-4 ring-background">
                              VS
                            </div>
                          </div>

                          {/* Team B (Right) */}
                          <div className="flex-1 min-w-0 pl-1">
                            {renderTeamName(match.teamBName, 'Team B', 'right')}
                          </div>
                        </div>
                      </div>

                      {/* View Scorecard Button if Live or Completed */}
                      {(isLive || isCompleted) && (
                        <button
                          onClick={() => router.push(`/live-score/${match.uuid}`)}
                          className={`w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 border ${
                            isLive 
                              ? 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20 shadow-sm' 
                              : 'bg-surface-elevated text-emerald-400 border-emerald-500/30 hover:border-emerald-500/60 shadow-sm'
                          }`}
                        >
                          <Trophy className="w-4 h-4" />
                          {isLive ? 'Watch Live Court & Score' : 'View Match & Score Details'}
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Umpiring Tab */}
        {!loading && activeTab === 'umpiring' && (
          <div>
            <h2 className="text-xs font-black uppercase tracking-widest text-text-muted mb-4">Umpiring Assignments</h2>
            
            {umpireMatches.length === 0 ? (
              <div className="bg-surface border border-border rounded-2xl p-12 text-center text-text-muted">
                <Shield className="w-12 h-12 text-text-muted/40 mx-auto mb-3" />
                <p className="text-base font-bold text-foreground mb-1">No Umpiring Assignments</p>
                <p className="text-xs text-text-muted max-w-sm mx-auto">
                  When a tournament organizer assigns your registered phone number as an umpire to a match, it will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {umpireMatches.map((match) => {
                  const { date, time } = formatMatchDateTime(match);
                  const isLive = match.status === 'LIVE';
                  const isCompleted = match.status === 'COMPLETED';

                  return (
                    <div 
                      key={match.id} 
                      className="relative bg-surface-elevated border border-border/80 hover:border-red-500/50 rounded-2xl p-6 flex flex-col gap-5 shadow-lg hover:shadow-red-500/5 transition-all group overflow-hidden"
                    >
                      {/* Red Accent Bar for Umpiring */}
                      <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-red-500 via-rose-500 to-amber-500"></div>

                      <div className="flex-1">
                        {/* Badges */}
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-red-500/10 text-red-400 border border-red-500/30">
                            <Shield className="w-3 h-3" /> Assigned Umpire
                          </span>
                          {match.sportType && (
                            <span className="px-2.5 py-1 bg-surface border border-border rounded-md text-[10px] font-bold uppercase tracking-wider text-text-muted">
                              {match.sportType}
                            </span>
                          )}
                          {isLive && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-red-500 text-white animate-pulse">
                              LIVE NOW
                            </span>
                          )}
                          {isCompleted && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              <Trophy className="w-3 h-3" /> COMPLETED
                            </span>
                          )}
                        </div>

                        {/* Tournament Title */}
                        <h3 className="text-xl font-bold text-foreground tracking-tight group-hover:text-red-400 transition-colors mb-2">
                          {match.tournamentName || `Tournament #${match.tournamentId}`}
                        </h3>

                        {/* Date, Time, Court Details Row */}
                        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-text-muted mt-3">
                          <div className="flex items-center gap-1.5 bg-background/60 px-3 py-1.5 rounded-lg border border-border/50">
                            <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span>{date}</span>
                          </div>
                          <div className="flex items-center gap-1.5 bg-background/60 px-3 py-1.5 rounded-lg border border-border/50">
                            <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>{time}</span>
                          </div>
                          <div className="flex items-center gap-1.5 bg-background/60 px-3 py-1.5 rounded-lg border border-border/50">
                            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>{match.courtName || (match.courtId ? `Court ${match.courtId}` : 'Court TBD')}</span>
                          </div>
                        </div>
                      </div>

                      {/* Teams Matchup Showcase */}
                      <div className="relative bg-gradient-to-r from-surface/90 via-surface-elevated to-surface/90 p-4 md:p-5 rounded-2xl border border-border/80 shadow-inner overflow-hidden">
                        <div className="flex items-center justify-between mb-3 px-1">
                          <span className="text-[9px] font-black text-text-muted uppercase tracking-widest flex items-center gap-1.5">
                            <Shield className="w-3.5 h-3.5 text-red-400" /> Umpire Fixture
                          </span>
                          <span className="text-[9px] font-black uppercase tracking-wider text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                            Assigned
                          </span>
                        </div>

                        <div className="relative flex items-center justify-between gap-3 px-1">
                          {/* Team A (Left) */}
                          <div className="flex-1 min-w-0 pr-1">
                            {renderTeamName(match.teamAName, 'Team A', 'left')}
                          </div>

                          {/* Circular Gradient VS Emblem */}
                          <div className="shrink-0 z-10 mx-1">
                            <div className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-gradient-to-tr from-red-500 via-rose-500 to-amber-500 text-white font-black text-xs md:text-sm flex items-center justify-center shadow-lg shadow-red-500/30 border-2 border-background ring-4 ring-background">
                              VS
                            </div>
                          </div>

                          {/* Team B (Right) */}
                          <div className="flex-1 min-w-0 pl-1">
                            {renderTeamName(match.teamBName, 'Team B', 'right')}
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      {isCompleted ? (
                        <button 
                          onClick={() => router.push(`/live-score/${match.uuid}`)}
                          className="w-full py-3.5 bg-surface-elevated hover:bg-surface border border-emerald-500/30 hover:border-emerald-500/60 text-emerald-400 font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                        >
                          <Trophy className="w-4 h-4 text-emerald-400" /> View Match & Score Details
                        </button>
                      ) : (
                        <button 
                          onClick={() => {
                            const sport = match.sportType || 'Badminton';
                            const teamAStr = match.teamAName ? encodeURIComponent(match.teamAName.replace(/\s*&\s*/g, ',')) : '';
                            const teamBStr = match.teamBName ? encodeURIComponent(match.teamBName.replace(/\s*&\s*/g, ',')) : '';
                            const teamANameStr = match.teamAName ? encodeURIComponent(match.teamAName) : '';
                            const teamBNameStr = match.teamBName ? encodeURIComponent(match.teamBName) : '';
                            const tournamentNameStr = match.tournamentName ? encodeURIComponent(match.tournamentName) : '';
                            const courtNameStr = match.courtName ? encodeURIComponent(match.courtName) : (match.courtId ? encodeURIComponent(`Court ${match.courtId}`) : '');
                            
                            router.push(`/match-setup?matchId=${match.uuid}&sport=${sport}&teamA=${teamAStr}&teamB=${teamBStr}&teamAName=${teamANameStr}&teamBName=${teamBNameStr}&tournamentName=${tournamentNameStr}&courtName=${courtNameStr}&fromUmpire=true`);
                          }}
                          className="w-full py-3.5 bg-red-500 hover:bg-red-600 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-red-500/20 active:scale-95 flex items-center justify-center gap-2"
                        >
                          <Activity className="w-4 h-4 animate-pulse" /> {isLive ? 'Resume Scoring' : 'Start Scoring'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
