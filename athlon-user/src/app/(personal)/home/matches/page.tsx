'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Clock, Trophy, ChevronRight, Activity, ClipboardList } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
  },
  {
    id: 102,
    tournament: 'Winter Classic',
    category: "Women's Singles",
    round: 'Finals',
    date: 'Oct 19, 2024',
    time: '03:00 PM',
    court: 'Court 1',
    teamA: 'Priya',
    teamB: 'Neha',
    status: 'Upcoming'
  }
];

export default function PlayerMatchesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'playing' | 'umpiring'>('playing');

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
        {activeTab === 'playing' && mockMatches.map((match) => (
          <div key={match.id} className="bg-surface border border-foreground/10 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-[#1B9C56]/50 transition-colors group">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
                  match.status === 'Upcoming' 
                    ? 'bg-orange-500/10 text-orange-500' 
                    : match.result === 'Won'
                      ? 'bg-[#1B9C56]/10 text-[#1B9C56]'
                      : 'bg-red-500/10 text-red-500'
                }`}>
                  {match.status === 'Upcoming' ? 'Upcoming' : match.result}
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">{match.category} • {match.round}</span>
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight mb-1 group-hover:text-[#1B9C56] transition-colors">{match.tournament}</h3>
              <div className="flex items-center gap-4 text-xs font-bold text-foreground/60 mt-3">
                <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {match.date}</div>
                <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {match.time}</div>
                <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {match.court}</div>
              </div>
            </div>
            <div className="flex flex-col md:items-end justify-center pt-4 md:pt-0 border-t border-foreground/5 md:border-none shrink-0 md:min-w-[150px]">
              <div className="text-[10px] font-black text-foreground/40 uppercase tracking-widest mb-1">Opponent</div>
              <div className="text-base font-black truncate">{match.opponent}</div>
              {match.status === 'Completed' && match.score && (
                <div className="mt-2 text-xs font-bold bg-foreground/5 px-2 py-1 rounded">
                  Score: <span className="text-foreground/80">{match.score}</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {activeTab === 'umpiring' && mockUmpireMatches.map((match) => (
          <div key={match.id} className="bg-surface border border-foreground/10 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-red-500/50 transition-colors group">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-red-500/10 text-red-500">
                  Assigned Umpire
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">{match.category} • {match.round}</span>
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight mb-1 group-hover:text-red-500 transition-colors">{match.tournament}</h3>
              <div className="flex items-center gap-4 text-xs font-bold text-foreground/60 mt-3">
                <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {match.date}</div>
                <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {match.time}</div>
                <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {match.court}</div>
              </div>
            </div>
            <div className="flex flex-col md:items-end justify-center pt-4 md:pt-0 border-t border-foreground/5 md:border-none shrink-0 md:min-w-[200px]">
              <div className="text-[10px] font-black text-foreground/40 uppercase tracking-widest mb-1">Matchup</div>
              <div className="text-sm font-black truncate">{match.teamA}</div>
              <div className="text-[10px] text-foreground/50 font-bold my-0.5">VS</div>
              <div className="text-sm font-black truncate">{match.teamB}</div>
              
              <button 
                onClick={() => router.push(`/scoring/live?matchId=${match.id}&sport=Badminton`)}
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
