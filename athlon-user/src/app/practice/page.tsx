'use client';

import { ArrowLeft, Search, Swords, User, MapPin, Calendar, Clock, Filter, Plus } from 'lucide-react';
import Link from 'next/link';

export default function PracticePage() {
  const practiceMatches = [
    {
      id: 1,
      player: 'Kiran R.',
      level: 'Intermediate',
      location: 'Smash Arena Pro, Koramangala',
      date: 'Today',
      time: '18:00 - 19:00',
      type: 'Singles',
      status: 'Looking for Opponent'
    },
    {
      id: 2,
      player: 'Deepak & Harish',
      level: 'Advanced',
      location: 'Elite Sports Club, HSR',
      date: 'Tomorrow',
      time: '07:00 - 09:00',
      type: 'Doubles',
      status: 'Need 2 Players'
    },
    {
      id: 3,
      player: 'Nisha M.',
      level: 'Beginner',
      location: 'Velocity Hub, Indiranagar',
      date: 'Sat, 24 Oct',
      time: '10:00 - 11:00',
      type: 'Singles',
      status: 'Looking for Opponent'
    }
  ];

  return (
    <div className="min-h-screen w-full bg-background text-foreground font-sans pb-24 overflow-y-auto selection:bg-[#10B981] selection:text-white">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-4 bg-background/90 backdrop-blur-md border-b border-foreground/5">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 -ml-2 text-foreground hover:text-[#10B981] transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-lg font-bold uppercase tracking-wider flex items-center gap-2">
            Practice Match
          </h1>
        </div>
        
        <button className="p-2 -mr-2 text-foreground hover:text-[#10B981] transition-colors">
          <Search className="w-5 h-5" />
        </button>
      </header>

      <main className="w-full max-w-lg mx-auto px-4 flex flex-col gap-6 pt-4">

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button className="flex-1 bg-[#10B981] text-[#0A0F1A] font-black text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-[0_5px_15px_rgba(16,185,129,0.3)] hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" /> HOST A MATCH
          </button>
          <button className="w-12 h-12 bg-surface border border-foreground/10 rounded-xl flex items-center justify-center hover:bg-foreground/5 transition-colors">
            <Filter className="w-5 h-5 text-foreground" />
          </button>
        </div>

        {/* Filters / Quick Search */}
        <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar">
          {['All Levels', 'Beginner', 'Intermediate', 'Advanced', 'Singles', 'Doubles'].map((filter, idx) => (
            <button key={idx} className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${idx === 0 ? 'bg-foreground text-background' : 'bg-surface border border-foreground/10 text-foreground/70 hover:text-foreground'}`}>
              {filter}
            </button>
          ))}
        </div>

        {/* Open Practice Matches */}
        <section>
          <h3 className="text-xs font-bold text-foreground/50 tracking-wider uppercase mb-4 mt-2">Open Invites</h3>
          
          <div className="flex flex-col gap-4">
            {practiceMatches.map((match) => (
              <div key={match.id} className="bg-surface border border-foreground/5 hover:border-foreground/20 rounded-[20px] p-5 flex flex-col transition-colors shadow-lg cursor-pointer group">
                
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-background border border-foreground/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-foreground/50" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-foreground group-hover:text-[#10B981] transition-colors">{match.player}</span>
                      <span className="text-[10px] text-foreground/50">{match.level} • {match.type}</span>
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded bg-[#10B981]/10 text-[#10B981] text-[9px] font-black uppercase tracking-wider border border-[#10B981]/20">
                    {match.status}
                  </span>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-2 text-xs text-foreground/70">
                    <Calendar className="w-4 h-4 text-[#10B981]" />
                    <span>{match.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-foreground/70">
                    <Clock className="w-4 h-4 text-[#10B981]" />
                    <span>{match.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-foreground/70 col-span-2">
                    <MapPin className="w-4 h-4 text-orange-400" />
                    <span className="truncate">{match.location}</span>
                  </div>
                </div>

                {/* Action */}
                <button className="w-full py-3 bg-background border border-foreground/5 rounded-xl text-xs font-bold text-foreground hover:bg-foreground hover:text-background transition-colors flex items-center justify-center gap-2">
                  <Swords className="w-4 h-4" /> JOIN MATCH
                </button>

              </div>
            ))}
          </div>
        </section>

      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}
