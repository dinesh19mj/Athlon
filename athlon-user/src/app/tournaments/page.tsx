'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Search, MapPin, Calendar, Users, DollarSign, Trophy, ChevronRight, ActivityIcon } from 'lucide-react';
import Link from 'next/link';
import { TournamentService, Tournament } from '@/lib/api/tournaments';

export default function TournamentsPage() {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const res = await TournamentService.getAll();
        const activePublic = (res.data || []).filter((t: Tournament) => t.visibility === 'PUBLIC');
        setTournaments(activePublic);
      } catch (err) {
        console.error("Failed to load tournaments", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTournaments();
  }, []);

  const tabs = [
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'live', label: 'Live' },
    { id: 'completed', label: 'Completed' },
  ];

  const filteredTournaments = tournaments.filter((t) => {
    const now = new Date().getTime();
    const start = new Date(t.startDate).getTime();
    const end = new Date(t.endDate).getTime();

    let matchesTab = true;
    if (activeTab === 'live') {
      matchesTab = t.status === 'LIVE' || (!isNaN(start) && !isNaN(end) && now >= start && now <= end);
    } else if (activeTab === 'completed') {
      matchesTab = t.status === 'COMPLETED' || (!isNaN(end) && now > end);
    } else if (activeTab === 'upcoming') {
      matchesTab = t.status === 'UPCOMING' || isNaN(start) || now < start;
    }

    if (!matchesTab) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.name?.toLowerCase().includes(q) ||
      t.location?.toLowerCase().includes(q) ||
      t.sport?.toLowerCase().includes(q)
    );
  });



  return (
    <div className="min-h-screen w-full bg-background text-foreground font-sans pb-24 overflow-y-auto selection:bg-primary selection:text-black">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-4 bg-background/90 backdrop-blur-md border-b border-foreground/5">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 -ml-2 text-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-lg font-bold uppercase tracking-wider">Tournaments</h1>
        </div>
        
        <button className="p-2 -mr-2 text-foreground hover:text-primary transition-colors">
          <Search className="w-5 h-5" />
        </button>
      </header>

      <main className="w-full max-w-lg mx-auto px-4 flex flex-col gap-6 pt-4">

        {/* Custom Segmented Control */}
        <div className="flex items-center bg-surface p-1 rounded-xl border border-foreground/10 relative">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider rounded-lg transition-all z-10 ${
                  isActive ? 'text-primary-foreground' : 'text-foreground/50 hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
          
          {/* Animated Highlight Background */}
          <div 
            className="absolute top-1 bottom-1 rounded-lg bg-primary transition-all duration-300 ease-in-out shadow-[0_0_15px_var(--athlon-primary-glow)]"
            style={{
              width: `calc(100% / ${tabs.length} - 8px)`,
              left: `calc((100% / ${tabs.length}) * ${tabs.findIndex(t => t.id === activeTab)} + 4px)`
            }}
          />
        </div>

        {/* Tournament Cards List */}
        <div className="flex flex-col gap-5">
          {loading ? (
            <div className="text-center py-12 text-foreground/50 text-sm font-bold uppercase tracking-widest">
              Loading tournaments...
            </div>
          ) : filteredTournaments.length === 0 ? (
            <div className="text-center py-12 text-foreground/50 text-sm font-bold uppercase tracking-widest">
              No tournaments found
            </div>
          ) : filteredTournaments.map((tournament) => {
            const startDate = new Date(tournament.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            const endDate = new Date(tournament.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            
            return (
              <Link href={`/tournaments/${tournament.tournamentUuid}`} key={tournament.tournamentId} className="bg-surface border border-foreground/10 hover:border-foreground/30 rounded-[24px] overflow-hidden transition-colors shadow-lg cursor-pointer group block">
                
                {/* Header / Gradient Banner */}
                <div className="h-1.5 w-full bg-primary" />
                
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <h2 className="text-sm sm:text-base font-black leading-tight text-foreground group-hover:text-primary transition-colors">
                      {tournament.name}
                    </h2>
                    <div className="w-10 h-10 shrink-0 rounded-xl bg-background border border-foreground/10 flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-foreground/50 group-hover:text-primary transition-colors" />
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-y-3 gap-x-2 mb-5">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-[#FF7722]" />
                      <span className="text-[10px] sm:text-xs text-foreground/70">{startDate} - {endDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-orange-400" />
                      <span className="text-[10px] sm:text-xs text-foreground/70 truncate">{tournament.location || 'TBD'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ActivityIcon className="w-3.5 h-3.5 text-primary" />
                      <span className="text-[10px] sm:text-xs text-foreground/70">{tournament.sport}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-3.5 h-3.5 text-purple-400" />
                      <span className="text-[10px] sm:text-xs text-foreground/70">Fee: <span className="font-bold text-foreground">{tournament.registrationFees ? `₹${tournament.registrationFees}` : 'Free'}</span></span>
                    </div>
                  </div>

                  {/* Categories & Actions */}
                  <div className="flex items-center justify-between border-t border-foreground/5 pt-4">
                    <div className="flex flex-wrap items-center gap-1.5 max-w-[65%]">
                      {tournament.category && tournament.category.split(',').map((cat, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded border border-foreground/10 bg-background text-[9px] font-medium text-foreground/50 whitespace-nowrap">
                          {cat.trim()}
                        </span>
                      ))}
                      {tournament.matchFormat && tournament.matchFormat.split(',').map((format, idx) => (
                        <span key={`f-${idx}`} className="px-2 py-0.5 rounded border border-foreground/10 bg-background text-[9px] font-medium text-foreground/50 whitespace-nowrap">
                          {format.trim()}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-primary group-hover:text-foreground transition-colors bg-primary/10 px-3 py-1.5 rounded-lg">
                      DETAILS <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>

                </div>
              </Link>
            );
          })}
        </div>

      </main>

    </div>
  );
}
