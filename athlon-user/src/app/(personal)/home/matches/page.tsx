'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Clock, Trophy, ChevronRight, Activity, ClipboardList, AlertCircle, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { MatchService, Match } from '@/lib/api/matches';
import { toast } from 'react-hot-toast';
import { AuthService } from '@/lib/api/auth';

// ... (omitting mock data for brevity in thoughts, but replacing exact lines)

const mockMatches = [
  {
    id: 1,
    tournament: 'Summer Smash 2024',
    category: "Men's Singles",
    round: 'Quarter-Finals',
    date: 'Oct 15, 2024',
    time: '10:00 AM',
    court: 'Court 1',
    opponent: 'Arjun M',
    status: 'Upcoming',
    score: null,
    result: null
  },
  {
    id: 2,
    tournament: 'State Level Championship',
    category: "Men's Singles",
    round: 'Finals',
    date: 'Sep 20, 2024',
    time: '04:00 PM',
    court: 'Main Court',
    opponent: 'Siva K',
    status: 'Completed',
    score: '21-18, 15-21, 21-19',
    result: 'Won'
  }
];

const mockUmpireMatches = [
  {
    id: 101,
    tournament: 'Weekend Warriors Open',
    category: "Men's Doubles",
    round: 'Semi-Finals',
    date: 'Oct 18, 2024',
    time: '11:00 AM',
    court: 'Court 2',
    teamA: 'Rahul / Amit',
    teamB: 'Siva / Dinesh',
    status: 'Upcoming'
  }
];

export default function PlayerMatchesPage() {
  const router = useRouter();
  const { userId } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'playing' | 'umpiring'>('playing');
  const [userMatches, setUserMatches] = useState<Match[]>([]);
  const [umpireMatches, setUmpireMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const { userUuid, token } = useAuthStore();

  useEffect(() => {
    if (userId) {
      setLoading(true);
      MatchService.getByUser(Number(userId))
        .then((response: any) => {
          if (response.success) {
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
            if (profileRes.data && profileRes.data.phone) {
              return MatchService.getByUmpirePhone(profileRes.data.phone);
            }
            return { data: [] };
          })
          .then((response: any) => {
             if (response && response.data) {
                setUmpireMatches(response.data);
             }
          })
          .catch(err => {
             console.error("Failed to load umpire matches:", err);
          })
          .finally(() => {
            setLoading(false);
          });
      }
    }
  }, [userId, userUuid, token]);

  // Find Team Event fixtures that require lineup submission
  const pendingLineups = userMatches.filter(m => m.status === 'WAITING_FOR_LINEUPS');

  const getLineupButtonProps = (match: Match) => {
    const isAApproved = match.teamALineupStatus === 'APPROVED';
    const isBApproved = match.teamBLineupStatus === 'APPROVED';
    
    if (isAApproved && isBApproved) {
      return { text: 'Lineups Approved', color: 'bg-[#1B9C56]', icon: <CheckCircle className="w-4 h-4" /> };
    }
    
    return { text: 'Submit Lineup', color: 'bg-orange-500 hover:bg-orange-600', icon: <ClipboardList className="w-4 h-4" /> };
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans pb-24">
      {/* Header */}
      <header className="p-4 md:px-8 md:py-6 border-b border-foreground/5 bg-surface/50 backdrop-blur-md sticky top-0 z-20">
        <h1 className="text-3xl font-black uppercase tracking-wide">Matches</h1>
        <p className="text-foreground/50 font-bold mt-1 text-sm">View your playing schedule and umpiring assignments.</p>
        
        {/* Main Tabs */}
        <div className="flex bg-surface border border-foreground/10 p-1 mt-6 rounded-xl max-w-sm">
          <button 
            onClick={() => setActiveTab('playing')}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === 'playing' ? 'bg-[#1B9C56] text-black shadow-md' : 'text-foreground/60 hover:text-foreground'}`}
          >
            Playing
          </button>
          <button 
            onClick={() => setActiveTab('umpiring')}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === 'umpiring' ? 'bg-red-500 text-white shadow-md' : 'text-foreground/60 hover:text-foreground'}`}
          >
            Umpiring
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 md:p-8 max-w-4xl mx-auto space-y-4">
        
        {activeTab === 'playing' && pendingLineups.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-black uppercase tracking-widest text-orange-500 mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> Action Required
            </h2>
            <div className="space-y-4">
              {pendingLineups.map((match) => {
                const isAApproved = match.teamALineupStatus === 'APPROVED';
                const isBApproved = match.teamBLineupStatus === 'APPROVED';
                const bothApproved = isAApproved && isBApproved;
                
                return (
                <div key={match.id} className={`border rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors group ${bothApproved ? 'bg-[#1B9C56]/5 border-[#1B9C56]/20 hover:border-[#1B9C56]/50' : 'bg-orange-500/5 border-orange-500/20 hover:border-orange-500/50'}`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${bothApproved ? 'bg-[#1B9C56]/20 text-[#1B9C56]' : 'bg-orange-500/20 text-orange-600 dark:text-orange-400'}`}>
                        {bothApproved ? 'Lineup Approved' : 'Pending Lineup'}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Team Event</span>
                    </div>
                    <h3 className={`text-lg font-black uppercase tracking-tight mb-1 transition-colors ${bothApproved ? 'group-hover:text-[#1B9C56]' : 'group-hover:text-orange-500'}`}>
                      {match.teamAName && match.teamBName 
                        ? `${match.teamAName} vs ${match.teamBName}` 
                        : `Team Event Match #${match.id}`}
                    </h3>
                    <div className="flex items-center gap-4 text-xs font-bold text-foreground/60 mt-3">
                      <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Upcoming</div>
                      <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> TBD</div>
                    </div>
                  </div>
                  <div className="flex flex-col md:items-end justify-center pt-4 md:pt-0 border-t border-foreground/5 md:border-none shrink-0 md:min-w-[150px]">
                    <button 
                      onClick={() => router.push(`/home/team-events/${match.uuid}/lineup`)}
                      className={`w-full md:w-auto px-4 py-2 text-white text-xs font-black uppercase tracking-widest rounded-lg active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 ${getLineupButtonProps(match).color}`}
                    >
                      {getLineupButtonProps(match).icon} {getLineupButtonProps(match).text}
                    </button>
                  </div>
                </div>
              )})}
            </div>
          </div>
        )}

        {activeTab === 'playing' && (
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-foreground/40 mb-4">Upcoming & Past</h2>
            <div className="space-y-4">
              {userMatches.filter(m => m.status !== 'WAITING_FOR_LINEUPS').length === 0 ? (
                <div className="text-center py-8 text-foreground/50 text-sm font-bold bg-surface rounded-2xl border border-foreground/5">
                  No upcoming or past matches found.
                </div>
              ) : (
                userMatches.filter(m => m.status !== 'WAITING_FOR_LINEUPS').map((match) => (
                  <div key={match.id} className="bg-surface border border-foreground/10 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-[#1B9C56]/50 transition-colors group">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
                          match.status === 'SCHEDULED' 
                            ? 'bg-orange-500/10 text-orange-500' 
                            : match.status === 'COMPLETED'
                              ? 'bg-[#1B9C56]/10 text-[#1B9C56]'
                              : 'bg-foreground/10 text-foreground'
                        }`}>
                          {match.status || 'TBD'}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">{match.poolName ? `Pool Play • ${match.poolName}` : 'Match'}</span>
                      </div>
                      <h3 className="text-lg font-black uppercase tracking-tight mb-1 group-hover:text-[#1B9C56] transition-colors">Tournament #{match.tournamentId}</h3>
                      <div className="flex items-center gap-4 text-xs font-bold text-foreground/60 mt-3">
                        <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {match.matchDate ? new Date(match.matchDate).toLocaleDateString() : 'TBD'}</div>
                        <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {match.matchDate ? new Date(match.matchDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'TBD'}</div>
                        <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {match.courtId ? `Court ${match.courtId}` : 'TBD'}</div>
                      </div>
                    </div>
                    <div className="flex flex-col md:items-end justify-center pt-4 md:pt-0 border-t border-foreground/5 md:border-none shrink-0 md:min-w-[150px]">
                      <div className="text-[10px] font-black text-foreground/40 uppercase tracking-widest mb-1">Matchup</div>
                      <div className="text-base font-black truncate">
                        {match.teamAName || `Team ${match.teamARegistrationId}`} vs {match.teamBName || `Team ${match.teamBRegistrationId}`}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'umpiring' && umpireMatches.length === 0 && (
          <div className="bg-surface border border-foreground/10 rounded-2xl p-8 text-center text-foreground/50">
            No umpiring assignments found for your phone number.
          </div>
        )}

        {activeTab === 'umpiring' && umpireMatches.map((match) => (
          <div key={match.id} className="bg-surface border border-foreground/10 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-red-500/50 transition-colors group">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-red-500/10 text-red-500">
                  Assigned Umpire
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">{match.sportType}</span>
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight mb-1 group-hover:text-red-500 transition-colors">{match.tournamentName || `Tournament #${match.tournamentId}`}</h3>
              <div className="flex items-center gap-4 text-xs font-bold text-foreground/60 mt-3">
                <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {match.matchDate ? new Date(match.matchDate).toLocaleDateString() : 'TBD'}</div>
                <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {match.matchDate ? new Date(match.matchDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'TBD'}</div>
                <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {match.courtName || (match.courtId ? `Court ${match.courtId}` : 'TBD')}</div>
              </div>
            </div>
            <div className="flex flex-col md:items-end justify-center pt-4 md:pt-0 border-t border-foreground/5 md:border-none shrink-0 md:min-w-[200px]">
              <div className="text-[10px] font-black text-foreground/40 uppercase tracking-widest mb-1">Matchup</div>
              <div className="text-sm font-black truncate">{match.teamAName || `Team ${match.teamARegistrationId}`}</div>
              <div className="text-[10px] text-foreground/50 font-bold my-0.5">VS</div>
              <div className="text-sm font-black truncate">{match.teamBName || `Team ${match.teamBRegistrationId}`}</div>
              
              <button 
                onClick={() => router.push(`/scoring/${match.uuid}?sport=${match.sportType}${match.tournamentType ? `&tournamentType=${match.tournamentType}` : ''}`)}
                className="mt-4 w-full md:w-auto px-4 py-2 bg-red-500 text-white text-xs font-black uppercase tracking-widest rounded-lg hover:bg-red-400 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Activity className="w-4 h-4" /> Start Scoring
              </button>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
