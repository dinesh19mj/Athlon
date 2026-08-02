'use client';

import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  TrendingUp,
  Search,
  Filter,
  Medal,
  Award,
  Crown
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/useAuthStore';

// Mock data for rankings
const rankingsData = [
  { rank: 1, name: 'Alex Rivers', points: 15200, trend: 'up', change: 0, isCurrentUser: false },
  { rank: 2, name: 'Jordan Lee', points: 14850, trend: 'up', change: +2, isCurrentUser: false },
  { rank: 3, name: 'Sam Smith', points: 13900, trend: 'down', change: -1, isCurrentUser: false },
  { rank: 4, name: 'Player', points: 12450, trend: 'up', change: +5, isCurrentUser: true },
  { rank: 5, name: 'Taylor Davis', points: 11200, trend: 'same', change: 0, isCurrentUser: false },
  { rank: 6, name: 'Morgan Chen', points: 10800, trend: 'down', change: -1, isCurrentUser: false },
  { rank: 7, name: 'Chris Evans', points: 9500, trend: 'down', change: -2, isCurrentUser: false },
  { rank: 8, name: 'Tom Holland', points: 8900, trend: 'up', change: +3, isCurrentUser: false },
];

export default function PlayerRankingsPage() {
  const router = useRouter();
  const { userEmail } = useAuthStore();
  const displayName = userEmail ? userEmail.split('@')[0] : 'Player';

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-zinc-300 drop-shadow-[0_0_8px_rgba(212,212,216,0.3)]" />;
    if (rank === 3) return <Award className="w-5 h-5 text-amber-600 drop-shadow-[0_0_8px_rgba(217,119,6,0.3)]" />;
    return <span className="w-5 h-5 flex items-center justify-center font-black text-foreground/40">{rank}</span>;
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col relative overflow-hidden">
      
      {/* Ambient Glow */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#3B82F6]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-purple-600/5 rounded-full blur-[100px] pointer-events-none" />

      {/* HEADER */}
      <header className="px-4 py-6 flex items-center justify-between shrink-0 relative z-10">
        <button onClick={() => router.push('/player')} className="p-3 -ml-3 text-foreground/70 hover:text-foreground transition-colors bg-foreground/0 hover:bg-foreground/5 rounded-full">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex flex-col items-center">
          <h1 className="text-xl font-black uppercase tracking-widest text-foreground drop-shadow-md">Global Rankings</h1>
          <div className="flex items-center gap-1.5 mt-1">
            <TrendingUp className="w-3 h-3 text-[#3B82F6]" />
            <span className="text-[10px] font-bold text-[#3B82F6] uppercase tracking-widest">Season 2026</span>
          </div>
        </div>
        <button className="p-3 -mr-3 text-foreground/70 hover:text-foreground transition-colors bg-foreground/0 hover:bg-foreground/5 rounded-full">
          <Filter className="w-6 h-6" />
        </button>
      </header>

      {/* SEARCH & FILTER */}
      <div className="px-4 pb-6 relative z-10 shrink-0">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/30" />
          <input 
            type="text" 
            placeholder="Search players..."
            className="w-full bg-surface border border-foreground/5 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-foreground placeholder-white/30 focus:outline-none focus:border-[#3B82F6]/50 focus:shadow-[0_0_15px_rgba(59,130,246,0.15)] transition-all shadow-xl"
          />
        </div>
        
        {/* Category Chips */}
        <div className="flex gap-2 mt-4 overflow-x-auto hide-scrollbar pb-1 -mx-4 px-4">
          <button className="px-4 py-2 bg-[#3B82F6] text-foreground rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap shadow-[0_4px_15px_rgba(59,130,246,0.3)]">
            Men's Singles
          </button>
          <button className="px-4 py-2 bg-surface border border-foreground/5 text-foreground/60 hover:text-foreground rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-colors">
            Women's Singles
          </button>
          <button className="px-4 py-2 bg-surface border border-foreground/5 text-foreground/60 hover:text-foreground rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-colors">
            Mixed Doubles
          </button>
        </div>
      </div>

      {/* RANKINGS LIST */}
      <div className="flex-1 overflow-y-auto px-4 pb-32 relative z-10 hide-scrollbar space-y-3">
        {rankingsData.map((player, i) => (
          <div 
            key={player.rank}
            className={`flex items-center gap-4 p-4 rounded-2xl transition-all animate-in fade-in slide-in-from-bottom-4 relative overflow-hidden ${
              player.isCurrentUser 
                ? 'bg-[#3B82F6]/10 border border-[#3B82F6]/30 shadow-lg shadow-[#3B82F6]/5' 
                : 'bg-surface border border-foreground/5 hover:bg-foreground/5'
            }`}
            style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}
          >
            {player.isCurrentUser && (
              <div className="absolute top-0 left-0 bottom-0 w-1 bg-[#3B82F6]" />
            )}
            
            <div className="w-8 flex justify-center shrink-0">
              {getRankIcon(player.rank)}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className={`font-extrabold truncate ${player.isCurrentUser ? 'text-[#3B82F6] text-base' : 'text-foreground text-sm'}`}>
                {player.isCurrentUser ? displayName : player.name}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">{player.points.toLocaleString()} PTS</span>
              </div>
            </div>
            
            <div className="flex flex-col items-end shrink-0">
              {player.change > 0 ? (
                <div className="flex items-center gap-0.5 text-green-500">
                  <TrendingUp className="w-3 h-3" />
                  <span className="text-[10px] font-bold">+{player.change}</span>
                </div>
              ) : player.change < 0 ? (
                <div className="flex items-center gap-0.5 text-red-500">
                  <TrendingUp className="w-3 h-3 rotate-180" />
                  <span className="text-[10px] font-bold">{player.change}</span>
                </div>
              ) : (
                <span className="text-[10px] font-bold text-foreground/20">-</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
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
