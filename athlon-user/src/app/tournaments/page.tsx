'use client';

import { useState } from 'react';
import { ArrowLeft, Search, MapPin, Calendar, Users, DollarSign, Trophy, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function TournamentsPage() {
  const [activeTab, setActiveTab] = useState('upcoming');

  const tabs = [
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'live', label: 'Live' },
    { id: 'completed', label: 'Completed' },
  ];

  const tournaments = [
    {
      id: 1,
      title: 'District Badminton Championship 2024',
      status: 'upcoming',
      date: '25 Jul - 28 Jul 2024',
      location: 'Elite Sports Academy',
      participants: '128 / 256',
      prize: '₹50,000',
      entryFee: '₹1,500',
      categories: ['Men Singles', 'Women Singles', 'Mixed Doubles'],
      color: 'bg-[#1B9C56]',
    },
    {
      id: 2,
      title: 'Junior State Ranking Tournament',
      status: 'upcoming',
      date: '05 Aug - 08 Aug 2024',
      location: 'Govt. Indoor Stadium',
      participants: '340 / 500',
      prize: '₹1,00,000',
      entryFee: '₹1,000',
      categories: ['U-15', 'U-17', 'U-19'],
      color: 'bg-[#1B9C56]',
    },
    {
      id: 3,
      title: 'Corporate Smash League Season 2',
      status: 'upcoming',
      date: '12 Aug - 14 Aug 2024',
      location: 'Smash Arena',
      participants: '32 / 64 Teams',
      prize: '₹2,50,000',
      entryFee: '₹5,000 / Team',
      categories: ['Team Event', 'Corporate Mix'],
      color: 'bg-[#1B9C56]',
    }
  ];

  return (
    <div className="min-h-screen w-full bg-background text-foreground font-sans pb-24 overflow-y-auto selection:bg-[#1B9C56] selection:text-black">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-4 bg-background/90 backdrop-blur-md border-b border-foreground/5">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 -ml-2 text-foreground hover:text-[#1B9C56] transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-lg font-bold uppercase tracking-wider">Tournaments</h1>
        </div>
        
        <button className="p-2 -mr-2 text-foreground hover:text-[#1B9C56] transition-colors">
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
                  isActive ? 'text-[#0A0F1A]' : 'text-foreground/50 hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
          
          {/* Animated Highlight Background */}
          <div 
            className="absolute top-1 bottom-1 rounded-lg bg-[#1B9C56] transition-all duration-300 ease-in-out shadow-[0_0_15px_rgba(0,255,102,0.2)]"
            style={{
              width: `calc(100% / ${tabs.length} - 8px)`,
              left: `calc((100% / ${tabs.length}) * ${tabs.findIndex(t => t.id === activeTab)} + 4px)`
            }}
          />
        </div>

        {/* Tournament Cards List */}
        <div className="flex flex-col gap-5">
          {tournaments.map((tournament) => (
            <div key={tournament.id} className="bg-surface border border-foreground/10 hover:border-foreground/30 rounded-[24px] overflow-hidden transition-colors shadow-lg cursor-pointer group">
              
              {/* Header / Gradient Banner */}
              <div className={`h-1.5 w-full ${tournament.color}`} />
              
              <div className="p-5">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <h2 className="text-sm sm:text-base font-black leading-tight text-foreground group-hover:text-[#1B9C56] transition-colors">
                    {tournament.title}
                  </h2>
                  <div className="w-10 h-10 shrink-0 rounded-xl bg-background border border-foreground/10 flex items-center justify-center">
                    <Trophy className={`w-5 h-5 text-foreground/50 group-hover:text-[#1B9C56] transition-colors`} />
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-y-3 gap-x-2 mb-5">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-[#FF7722]" />
                    <span className="text-[10px] sm:text-xs text-foreground/70">{tournament.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-orange-400" />
                    <span className="text-[10px] sm:text-xs text-foreground/70 truncate">{tournament.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-3.5 h-3.5 text-[#1B9C56]" />
                    <span className="text-[10px] sm:text-xs text-foreground/70">Prize: <span className="font-bold text-foreground">{tournament.prize}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-[10px] sm:text-xs text-foreground/70">Fill: <span className="font-bold text-foreground">{tournament.participants}</span></span>
                  </div>
                </div>

                {/* Categories & Actions */}
                <div className="flex items-center justify-between border-t border-foreground/5 pt-4">
                  <div className="flex flex-wrap items-center gap-1.5 max-w-[65%]">
                    {tournament.categories.map((cat, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded border border-foreground/10 bg-background text-[9px] font-medium text-foreground/50 whitespace-nowrap">
                        {cat}
                      </span>
                    ))}
                  </div>
                  
                  <button className="flex items-center justify-center gap-1 text-[10px] font-bold text-[#1B9C56] hover:text-foreground transition-colors bg-[#1B9C56]/10 px-3 py-1.5 rounded-lg">
                    DETAILS <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>

      </main>

    </div>
  );
}
