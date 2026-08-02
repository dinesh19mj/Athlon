'use client';

import Link from 'next/link';
import { use, useState } from 'react';
import { ArrowLeft, PlusCircle, Share2, Printer, Search, Trophy, LayoutGrid } from 'lucide-react';

// Mock data for a Quarter-Finals -> Semi-Finals -> Finals bracket
const bracketData = {
  rounds: [
    {
      name: 'Quarter-Finals',
      matches: [
        { id: 1, player1: 'Raj Kumar', score1: 21, player2: 'Arjun M', score2: 15, winner: 1, time: '10:00 AM' },
        { id: 2, player1: 'Dinesh', score1: 18, player2: 'Siva K', score2: 21, winner: 2, time: '10:30 AM' },
        { id: 3, player1: 'Rahul R', score1: null, player2: 'Vikram', score2: null, winner: null, time: '11:00 AM' },
        { id: 4, player1: 'Anand', score1: null, player2: 'Prakash', score2: null, winner: null, time: '11:30 AM' },
      ]
    },
    {
      name: 'Semi-Finals',
      matches: [
        { id: 5, player1: 'Raj Kumar', score1: null, player2: 'Siva K', score2: null, winner: null, time: '2:00 PM' },
        { id: 6, player1: 'TBD', score1: null, player2: 'TBD', score2: null, winner: null, time: '2:30 PM' },
      ]
    },
    {
      name: 'Finals',
      matches: [
        { id: 7, player1: 'TBD', score1: null, player2: 'TBD', score2: null, winner: null, time: '5:00 PM' },
      ]
    }
  ]
};

export default function DrawsAndBracketsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  const [isDrawGenerated, setIsDrawGenerated] = useState(false);
  const [drawSize, setDrawSize] = useState(64);
  const registrations = 56;
  const calculatedByes = Math.max(0, drawSize - registrations);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col h-full overflow-hidden">
      
      {/* Header */}
      <header className="p-4 md:px-8 md:py-6 border-b border-foreground/5 shrink-0 bg-surface/50 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href={`/organizer/tournaments/${id}`} className="p-2 -ml-2 text-foreground/70 hover:text-foreground transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-xl md:text-2xl font-black uppercase tracking-wide">Draws & Brackets</h1>
              <span className="text-[10px] font-bold text-[#1B9C56] uppercase tracking-widest">Men's Singles</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="hidden md:flex p-2 md:px-4 md:py-2 bg-surface border border-foreground/10 rounded-xl items-center gap-2 text-sm font-bold hover:bg-foreground/5 transition-colors">
              <Printer className="w-4 h-4" /> Print
            </button>
            <button className="p-2 md:px-4 md:py-2 bg-[#1B9C56] text-black rounded-xl flex items-center gap-2 text-sm font-bold shadow-[0_0_15px_rgba(27,156,86,0.3)] hover:scale-105 active:scale-95 transition-all">
              <Share2 className="w-4 h-4" /> <span className="hidden md:inline">Share</span>
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            <button className="px-4 py-2 bg-[#1B9C56] text-black font-bold text-xs uppercase tracking-wider rounded-lg shrink-0">Men's Singles</button>
            <button className="px-4 py-2 bg-surface border border-foreground/10 text-foreground/60 font-bold text-xs uppercase tracking-wider rounded-lg hover:text-foreground shrink-0 transition-colors">Men's Doubles</button>
            <button className="px-4 py-2 bg-surface border border-foreground/10 text-foreground/60 font-bold text-xs uppercase tracking-wider rounded-lg hover:text-foreground shrink-0 transition-colors">Mixed</button>
            <button className="px-3 py-2 bg-foreground/5 text-foreground/80 rounded-lg shrink-0 flex items-center gap-1 text-xs font-bold"><PlusCircle className="w-4 h-4"/> Add</button>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-foreground/40" />
            </div>
            <input 
              type="text" 
              placeholder="Find player..." 
              className="w-full md:w-64 bg-background border border-foreground/10 rounded-xl py-2 pl-9 pr-4 text-sm font-bold focus:outline-none focus:border-[#1B9C56] transition-colors"
            />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      {!isDrawGenerated ? (
        // Empty State: Generate Draw
        <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 text-center overflow-y-auto">
          <div className="w-24 h-24 rounded-full bg-surface border border-foreground/5 flex shrink-0 items-center justify-center mb-6 mt-8 md:mt-0">
            <LayoutGrid className="w-10 h-10 text-foreground/30" />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight mb-2">Generate Draws</h2>
          <p className="text-foreground/50 max-w-md mb-8">
            Configure the bracket size and seeding method to generate the fixtures.
          </p>
          
          <div className="bg-surface border border-foreground/10 rounded-2xl p-6 text-left w-full max-w-sm shadow-xl mb-8 space-y-4">
            
            <div className="bg-foreground/5 rounded-xl p-4 flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-widest text-foreground/60">Total Registrations</span>
              <span className="text-lg font-black text-[#1B9C56]">{registrations}</span>
            </div>

            <div>
              <label className="block text-[10px] font-black text-foreground/50 uppercase tracking-widest mb-2">Draw Size</label>
              <select 
                className="w-full bg-background border border-foreground/10 rounded-xl py-3 px-4 text-sm font-bold text-foreground focus:outline-none focus:border-[#1B9C56]"
                value={drawSize}
                onChange={(e) => setDrawSize(Number(e.target.value))}
              >
                <option value="16">16 Teams</option>
                <option value="32">32 Teams</option>
                <option value="64">64 Teams</option>
                <option value="128">128 Teams</option>
              </select>
            </div>

            <div className="bg-[#1B9C56]/10 border border-[#1B9C56]/20 rounded-xl p-4 flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-widest text-[#1B9C56]">Calculated Byes</span>
              <span className="text-lg font-black text-[#1B9C56]">{calculatedByes}</span>
            </div>

            <div>
              <label className="block text-[10px] font-black text-foreground/50 uppercase tracking-widest mb-2">Seeding Method</label>
              <select className="w-full bg-background border border-foreground/10 rounded-xl py-3 px-4 text-sm font-bold text-foreground focus:outline-none focus:border-[#1B9C56]">
                <option>Random Draw</option>
                <option>Manual Seeding</option>
                <option>Rank Based</option>
              </select>
            </div>
            
          </div>

          <button 
            onClick={() => setIsDrawGenerated(true)}
            className="bg-[#1B9C56] text-black font-black uppercase tracking-wide py-4 px-12 rounded-xl hover:scale-105 active:scale-95 transition-transform shadow-[0_10px_30px_rgba(27,156,86,0.3)] shrink-0 mb-8 md:mb-0"
          >
            Generate Bracket
          </button>
        </div>
      ) : (
        // Bracket Canvas (Scrollable)
        <div className="flex-1 overflow-auto bg-[#0a0f1a] relative p-8">
          <div className="inline-flex gap-16 min-w-max pb-16">
            
            {bracketData.rounds.map((round, rIndex) => (
              <div key={rIndex} className="flex flex-col relative w-64">
                
                {/* Round Header */}
                <div className="text-center mb-8 shrink-0">
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-foreground/50">{round.name}</h3>
                  <div className="h-1 w-8 bg-[#1B9C56] mx-auto mt-2 rounded-full opacity-50" />
                </div>

                {/* Matches Column */}
                <div className="flex flex-col flex-1 justify-around gap-6">
                  {round.matches.map((match, mIndex) => {
                    const isCompleted = match.winner !== null;
                    return (
                      <div key={mIndex} className="relative group">
                        {/* Match Card */}
                        <div className={`bg-surface border ${isCompleted ? 'border-foreground/20' : 'border-[#1B9C56]/30'} rounded-xl overflow-hidden shadow-lg hover:border-[#1B9C56] transition-colors relative z-10 cursor-pointer`}>
                          <div className="bg-foreground/5 px-3 py-1.5 flex justify-between items-center border-b border-foreground/5">
                            <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Match {match.id}</span>
                            <span className="text-[10px] font-bold text-orange-500 bg-orange-500/10 px-1.5 py-0.5 rounded">{match.time}</span>
                          </div>
                          
                          <div className="flex flex-col">
                            {/* Player 1 */}
                            <div className={`flex items-center justify-between px-3 py-2 ${match.winner === 1 ? 'bg-[#1B9C56]/10' : ''}`}>
                              <span className={`text-sm font-black ${match.winner === 2 ? 'text-foreground/40 line-through' : 'text-foreground'}`}>{match.player1}</span>
                              <span className={`text-sm font-bold ${match.winner === 1 ? 'text-[#1B9C56]' : 'text-foreground/50'}`}>{match.score1 ?? '-'}</span>
                            </div>
                            <div className="h-[1px] w-full bg-foreground/5" />
                            {/* Player 2 */}
                            <div className={`flex items-center justify-between px-3 py-2 ${match.winner === 2 ? 'bg-[#1B9C56]/10' : ''}`}>
                              <span className={`text-sm font-black ${match.winner === 1 ? 'text-foreground/40 line-through' : 'text-foreground'}`}>{match.player2}</span>
                              <span className={`text-sm font-bold ${match.winner === 2 ? 'text-[#1B9C56]' : 'text-foreground/50'}`}>{match.score2 ?? '-'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Connecting Lines to Next Round (if not final round) */}
                        {rIndex < bracketData.rounds.length - 1 && (
                          <div className="hidden lg:block absolute left-full top-1/2 w-8 h-[1px] bg-foreground/20 -translate-y-1/2 -z-10" />
                        )}
                        {/* Connecting Lines from Previous Round (if not first round) */}
                        {rIndex > 0 && (
                          <>
                            <div className="hidden lg:block absolute right-full top-1/2 w-8 h-[1px] bg-foreground/20 -translate-y-1/2 -z-10" />
                            {/* Vertical Line connecting the two previous matches */}
                            {mIndex % 2 === 0 ? (
                              <div className="hidden lg:block absolute right-full top-1/2 w-[1px] h-[calc(100%+1.5rem)] bg-foreground/20 -z-10" />
                            ) : (
                              <div className="hidden lg:block absolute right-full bottom-1/2 w-[1px] h-[calc(100%+1.5rem)] bg-foreground/20 -z-10" />
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            
            {/* Winner Section */}
            <div className="flex flex-col justify-center items-center relative w-48 -ml-8">
               <div className="hidden lg:block absolute right-full top-1/2 w-8 h-[1px] bg-foreground/20 -translate-y-1/2 -z-10" />
               <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#1B9C56] to-green-800 flex items-center justify-center shadow-[0_0_30px_rgba(27,156,86,0.5)] border-4 border-background z-10 mb-4 animate-pulse">
                  <Trophy className="w-10 h-10 text-black" />
               </div>
               <h3 className="text-sm font-black text-[#1B9C56] uppercase tracking-widest">Champion</h3>
               <p className="text-foreground/50 text-xs font-bold mt-1">TBD</p>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
