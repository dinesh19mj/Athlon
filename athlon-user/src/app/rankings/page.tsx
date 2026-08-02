'use client';

import { ArrowLeft, Search, Trophy, Medal, ChevronUp, ChevronDown, Minus, Filter } from 'lucide-react';
import Link from 'next/link';

export default function RankingsPage() {
  const rankings = [
    { rank: 1, name: 'Arjun Kumar', points: 2450, trend: 'up', change: 2, category: 'Men Singles' },
    { rank: 2, name: 'Rahul Sharma', points: 2310, trend: 'same', change: 0, category: 'Men Singles' },
    { rank: 3, name: 'Vikram Singh', points: 2150, trend: 'down', change: 1, category: 'Men Singles' },
    { rank: 4, name: 'Sanjay Reddy', points: 1980, trend: 'up', change: 3, category: 'Men Singles' },
    { rank: 5, name: 'Karthik N.', points: 1820, trend: 'down', change: 2, category: 'Men Singles' },
  ];

  return (
    <div className="min-h-screen w-full bg-background text-foreground font-sans pb-24 overflow-y-auto selection:bg-[#3B82F6] selection:text-white">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-4 bg-background/90 backdrop-blur-md border-b border-foreground/5">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 -ml-2 text-foreground hover:text-[#3B82F6] transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-lg font-bold uppercase tracking-wider">Rankings</h1>
        </div>
        
        <button className="p-2 -mr-2 text-foreground hover:text-[#3B82F6] transition-colors">
          <Search className="w-5 h-5" />
        </button>
      </header>

      <main className="w-full max-w-lg mx-auto px-4 flex flex-col gap-6 pt-4">

        {/* Filters / Quick Search */}
        <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar pb-2">
          <button className="px-3 py-1.5 rounded-full bg-surface border border-foreground/10 text-foreground flex items-center gap-1.5 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Filter
          </button>
          {['Men Singles', 'Women Singles', 'Men Doubles', 'Mixed Doubles'].map((filter, idx) => (
            <button key={idx} className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${idx === 0 ? 'bg-[#3B82F6] text-white' : 'bg-surface border border-foreground/10 text-foreground/70 hover:text-foreground'}`}>
              {filter}
            </button>
          ))}
        </div>

        {/* Top 3 Podium (Optional extra flair) */}
        <div className="flex items-end justify-center gap-2 mt-4 mb-6 h-40">
          {/* Rank 2 */}
          <div className="flex flex-col items-center gap-2 w-1/3">
            <div className="w-12 h-12 rounded-full bg-surface border-2 border-[#C0C0C0] flex items-center justify-center font-bold shadow-[0_0_15px_rgba(192,192,192,0.3)]">
              R
            </div>
            <div className="h-20 w-full bg-gradient-to-t from-surface to-surface/50 rounded-t-xl border border-foreground/5 flex flex-col items-center pt-2">
              <span className="text-[#C0C0C0] font-black text-lg">2</span>
            </div>
          </div>
          
          {/* Rank 1 */}
          <div className="flex flex-col items-center gap-2 w-1/3 z-10">
            <div className="w-16 h-16 rounded-full bg-surface border-2 border-[#FFD700] flex items-center justify-center font-bold shadow-[0_0_20px_rgba(255,215,0,0.4)]">
              <Trophy className="w-6 h-6 text-[#FFD700]" />
            </div>
            <div className="h-28 w-full bg-gradient-to-t from-surface to-surface/50 rounded-t-xl border border-foreground/5 border-t-[#FFD700]/50 flex flex-col items-center pt-2">
              <span className="text-[#FFD700] font-black text-2xl">1</span>
            </div>
          </div>

          {/* Rank 3 */}
          <div className="flex flex-col items-center gap-2 w-1/3">
            <div className="w-12 h-12 rounded-full bg-surface border-2 border-[#CD7F32] flex items-center justify-center font-bold shadow-[0_0_15px_rgba(205,127,50,0.3)]">
              V
            </div>
            <div className="h-16 w-full bg-gradient-to-t from-surface to-surface/50 rounded-t-xl border border-foreground/5 flex flex-col items-center pt-2">
              <span className="text-[#CD7F32] font-black text-lg">3</span>
            </div>
          </div>
        </div>

        {/* Leaderboard List */}
        <div className="bg-surface border border-foreground/5 rounded-[24px] overflow-hidden shadow-xl">
          <div className="px-5 py-4 border-b border-foreground/5 bg-foreground/[0.02]">
            <h2 className="text-sm font-black uppercase tracking-wider text-foreground">Global Leaderboard</h2>
          </div>
          
          <div className="flex flex-col">
            {rankings.map((player, idx) => (
              <div key={idx} className="flex items-center gap-4 px-5 py-4 border-b border-foreground/5 hover:bg-foreground/[0.02] transition-colors cursor-pointer group">
                
                {/* Rank Number & Trend */}
                <div className="flex flex-col items-center justify-center w-8 shrink-0">
                  <span className={`font-black text-lg ${player.rank <= 3 ? 'text-foreground' : 'text-foreground/50'}`}>
                    #{player.rank}
                  </span>
                  <div className="flex items-center gap-0.5 text-[9px] font-bold mt-1">
                    {player.trend === 'up' && <><ChevronUp className="w-3 h-3 text-green-500" /><span className="text-green-500">{player.change}</span></>}
                    {player.trend === 'down' && <><ChevronDown className="w-3 h-3 text-red-500" /><span className="text-red-500">{player.change}</span></>}
                    {player.trend === 'same' && <><Minus className="w-3 h-3 text-foreground/30" /></>}
                  </div>
                </div>

                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-background border border-foreground/10 flex items-center justify-center shrink-0">
                  <span className="font-bold text-sm text-foreground/70">{player.name.charAt(0)}</span>
                </div>

                {/* Name & Category */}
                <div className="flex flex-col flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-foreground truncate group-hover:text-[#3B82F6] transition-colors">{player.name}</h3>
                  <span className="text-[10px] text-foreground/50">{player.category}</span>
                </div>

                {/* Points */}
                <div className="flex flex-col items-end shrink-0">
                  <span className="font-black text-sm text-[#3B82F6]">{player.points.toLocaleString()}</span>
                  <span className="text-[9px] font-bold text-foreground/40 uppercase tracking-wider">PTS</span>
                </div>
                
              </div>
            ))}
          </div>
        </div>

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
