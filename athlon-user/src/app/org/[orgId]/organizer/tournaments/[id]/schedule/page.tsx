'use client';

import Link from 'next/link';
import { use, useState } from 'react';
import { ArrowLeft, Calendar, Clock, MapPin, Search, Filter, Edit3, PlusCircle, UserPlus, X, CheckCircle2 } from 'lucide-react';

const initialMockSchedule = [
  {
    id: 1,
    time: '09:00 AM',
    court: 'Court 1',
    category: "Men's Singles",
    round: 'Quarter-Finals',
    player1: 'Raj Kumar',
    player2: 'Arjun M',
    status: 'Upcoming',
    umpire: null
  },
  {
    id: 2,
    time: '09:00 AM',
    court: 'Court 2',
    category: "Men's Singles",
    round: 'Quarter-Finals',
    player1: 'Dinesh',
    player2: 'Siva K',
    status: 'Upcoming',
    umpire: '9876543210' // Mock assigned
  },
  {
    id: 3,
    time: '10:00 AM',
    court: 'Court 1',
    category: "Women's Singles",
    round: 'Semi-Finals',
    player1: 'Priya R',
    player2: 'Sneha',
    status: 'Scheduled',
    umpire: null
  },
  {
    id: 4,
    time: '11:30 AM',
    court: 'Court 3',
    category: "Men's Doubles",
    round: 'Round of 16',
    player1: 'Rahul & Vikram',
    player2: 'Anand & Prakash',
    status: 'Scheduled',
    umpire: null
  }
];

export default function MatchSchedulePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  const [schedule, setSchedule] = useState(initialMockSchedule);
  
  // Modal State
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<number | null>(null);
  const [umpirePhone, setUmpirePhone] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  const openAssignModal = (matchId: number) => {
    setSelectedMatch(matchId);
    setAssignModalOpen(true);
    setUmpirePhone('');
  };

  const handleAssignUmpire = () => {
    if (!umpirePhone || umpirePhone.length < 10) return;
    
    setIsAssigning(true);
    // Mock API call delay
    setTimeout(() => {
      setSchedule(prev => prev.map(match => 
        match.id === selectedMatch ? { ...match, umpire: umpirePhone } : match
      ));
      setIsAssigning(false);
      setAssignModalOpen(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans pb-24 relative">
      {/* Header */}
      <header className="p-4 md:px-8 md:py-6 border-b border-foreground/5 bg-surface/50 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href={`/organizer/tournaments/${id}`} className="p-2 -ml-2 text-foreground/70 hover:text-foreground transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-xl md:text-2xl font-black uppercase tracking-wide">Match Schedule</h1>
              <span className="text-[10px] font-bold text-[#1B9C56] uppercase tracking-widest">Day 1 • Oct 15, 2024</span>
            </div>
          </div>
          <button className="hidden md:flex p-2 md:px-4 md:py-2 bg-[#1B9C56] text-black rounded-xl items-center gap-2 text-sm font-bold shadow-[0_0_15px_rgba(27,156,86,0.3)] hover:scale-105 active:scale-95 transition-all">
            <PlusCircle className="w-4 h-4" /> Add Match
          </button>
        </div>

        {/* Toolbar */}
        <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            <button className="px-5 py-2 bg-[#1B9C56] text-black font-bold text-xs uppercase tracking-wider rounded-lg shrink-0">Day 1 (Oct 15)</button>
            <button className="px-5 py-2 bg-surface border border-foreground/10 text-foreground/60 font-bold text-xs uppercase tracking-wider rounded-lg hover:text-foreground shrink-0 transition-colors">Day 2 (Oct 16)</button>
            <button className="px-5 py-2 bg-surface border border-foreground/10 text-foreground/60 font-bold text-xs uppercase tracking-wider rounded-lg hover:text-foreground shrink-0 transition-colors">Day 3 (Oct 17)</button>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative flex-1 md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-foreground/40" />
              </div>
              <input 
                type="text" 
                placeholder="Search player or court..." 
                className="w-full bg-background border border-foreground/10 rounded-xl py-2 pl-9 pr-4 text-sm font-bold focus:outline-none focus:border-[#1B9C56] transition-colors"
              />
            </div>
            <button className="p-2 border border-foreground/10 rounded-xl hover:bg-foreground/5 transition-colors">
              <Filter className="w-5 h-5 text-foreground/70" />
            </button>
          </div>
        </div>
      </header>

      {/* Schedule List */}
      <main className="p-4 md:p-8 max-w-5xl mx-auto space-y-4">
        {schedule.map((match) => (
          <div key={match.id} className="bg-surface border border-foreground/10 rounded-2xl p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-8 hover:border-[#1B9C56]/50 transition-colors group">
            
            {/* Time & Court */}
            <div className="flex md:flex-col items-center md:items-start justify-between md:justify-center md:w-32 shrink-0">
              <div className="flex items-center gap-2 text-lg font-black">
                <Clock className="w-4 h-4 text-[#1B9C56]" />
                <span>{match.time}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-foreground/50 mt-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>{match.court}</span>
              </div>
            </div>

            {/* Divider (Desktop only) */}
            <div className="hidden md:block w-px h-12 bg-foreground/10" />

            {/* Match Details */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40 bg-foreground/5 px-2 py-0.5 rounded">Match {match.id}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#1B9C56]">{match.category} • {match.round}</span>
                {match.umpire && (
                  <span className="text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-500/10 px-2 py-0.5 rounded flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Umpire: {match.umpire}
                  </span>
                )}
              </div>
              
              <div className="flex items-center justify-between md:justify-start md:gap-8">
                <div className="text-base md:text-lg font-black truncate max-w-[120px] md:max-w-none text-right md:text-left">
                  {match.player1}
                </div>
                <div className="text-xs font-black text-foreground/30 italic px-2">VS</div>
                <div className="text-base md:text-lg font-black truncate max-w-[120px] md:max-w-none">
                  {match.player2}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between md:justify-end gap-3 mt-4 md:mt-0 pt-4 md:pt-0 border-t border-foreground/5 md:border-none">
              <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${
                match.status === 'Upcoming' 
                  ? 'bg-orange-500/10 text-orange-500' 
                  : 'bg-foreground/5 text-foreground/60'
              }`}>
                {match.status}
              </span>
              
              {!match.umpire ? (
                <button 
                  onClick={() => openAssignModal(match.id)}
                  className="p-2 md:p-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl hover:bg-red-500 hover:text-white transition-colors group-hover:border-red-500/50"
                  title="Assign Umpire"
                >
                  <UserPlus className="w-4 h-4" />
                </button>
              ) : (
                <button 
                  onClick={() => openAssignModal(match.id)}
                  className="p-2 md:p-3 bg-background border border-foreground/10 rounded-xl hover:bg-foreground/5 transition-colors group-hover:border-foreground/30 text-foreground/40 hover:text-foreground"
                  title="Change Umpire"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              )}
            </div>

          </div>
        ))}

        {/* Empty State / Bottom padding */}
        <div className="pt-8 pb-12 flex flex-col items-center justify-center opacity-50">
          <Calendar className="w-8 h-8 mb-2 text-foreground/30" />
          <p className="text-sm font-bold">End of schedule for Day 1</p>
        </div>
      </main>
      
      {/* Mobile FAB */}
      <button className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-[#1B9C56] text-black rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(27,156,86,0.4)] hover:scale-105 active:scale-95 transition-transform z-30">
        <PlusCircle className="w-6 h-6" />
      </button>

      {/* Assign Umpire Modal */}
      {assignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setAssignModalOpen(false)} />
          <div className="bg-surface border border-foreground/10 rounded-2xl w-full max-w-sm relative z-10 shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black uppercase tracking-tight">Assign Umpire</h3>
              <button onClick={() => setAssignModalOpen(false)} className="p-1 text-foreground/40 hover:text-foreground transition-colors bg-foreground/5 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-sm font-bold text-foreground/60 mb-6">Enter the mobile number of the player you want to assign as the umpire for Match #{selectedMatch}.</p>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-foreground/40 mb-1 block">Umpire Mobile Number</label>
                <input 
                  type="tel" 
                  value={umpirePhone}
                  onChange={(e) => setUmpirePhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full bg-background border border-foreground/10 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-red-500 transition-colors placeholder-foreground/20"
                />
              </div>
              
              <button 
                onClick={handleAssignUmpire}
                disabled={isAssigning || umpirePhone.length < 10}
                className="w-full bg-red-500 text-white font-black uppercase tracking-widest py-3 rounded-xl hover:bg-red-400 active:scale-95 transition-all shadow-[0_5px_20px_rgba(239,68,68,0.3)] disabled:opacity-50 disabled:pointer-events-none"
              >
                {isAssigning ? 'Assigning...' : 'Assign Umpire'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
