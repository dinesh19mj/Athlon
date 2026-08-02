'use client';

import { useState } from 'react';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';
import { Trophy, Medal, Search, Filter, TrendingUp, TrendingDown, Minus, Activity, ChevronRight, Star } from 'lucide-react';
import Image from 'next/image';

const MOCK_LEADERBOARD = [
  { rank: 1, id: 'u1', name: 'Alex Johnson', avatar: 'https://i.pravatar.cc/150?u=u1', points: 2450, matches: 32, winRate: 85, trend: 'up', title: 'Grandmaster' },
  { rank: 2, id: 'u2', name: 'Sarah Williams', avatar: 'https://i.pravatar.cc/150?u=u2', points: 2320, matches: 28, winRate: 82, trend: 'up', title: 'Master' },
  { rank: 3, id: 'u3', name: 'Michael Chen', avatar: 'https://i.pravatar.cc/150?u=u3', points: 2150, matches: 35, winRate: 71, trend: 'down', title: 'Elite' },
  { rank: 4, id: 'u4', name: 'David Smith', avatar: 'https://i.pravatar.cc/150?u=u4', points: 1980, matches: 24, winRate: 68, trend: 'same', title: 'Pro' },
  { rank: 5, id: 'u5', name: 'Emma Davis', avatar: 'https://i.pravatar.cc/150?u=u5', points: 1850, matches: 20, winRate: 70, trend: 'up', title: 'Pro' },
  { rank: 6, id: 'u6', name: 'James Wilson', avatar: 'https://i.pravatar.cc/150?u=u6', points: 1720, matches: 18, winRate: 61, trend: 'down', title: 'Challenger' },
  { rank: 7, id: 'u7', name: 'Olivia Martinez', avatar: 'https://i.pravatar.cc/150?u=u7', points: 1690, matches: 22, winRate: 59, trend: 'same', title: 'Challenger' },
  { rank: 8, id: 'u8', name: 'Daniel Taylor', avatar: 'https://i.pravatar.cc/150?u=u8', points: 1540, matches: 15, winRate: 66, trend: 'up', title: 'Contender' },
];

export default function LeaderboardPage() {
  const { getActiveOrganization } = useWorkspaceStore();
  const org = getActiveOrganization();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Global Ranking');

  if (!org) return null;

  const filteredData = MOCK_LEADERBOARD.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const topThree = filteredData.slice(0, 3);
  const restOfList = filteredData.slice(3);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-background">
      {/* Dynamic Header Background */}
      <div className="absolute top-0 left-0 right-0 h-[40vh] bg-gradient-to-b from-blue-900/20 via-background to-background pointer-events-none" />

      <div className="relative p-6 md:p-8 max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-500 text-xs font-black uppercase tracking-widest mb-4">
              <Star className="w-3.5 h-3.5" /> Official Rankings
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight mb-2">Club Leaderboard</h1>
            <p className="text-lg text-foreground/50 font-medium">Season 4 • {org.name}</p>
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            {['Global Ranking', 'Badminton', 'Tennis', 'Football'].map(cat => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 ${
                  activeCategory === cat 
                  ? 'bg-foreground text-background shadow-lg shadow-foreground/20 scale-105' 
                  : 'bg-surface/50 backdrop-blur-sm border border-foreground/10 text-foreground/70 hover:bg-foreground/5 hover:border-foreground/20'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Podium (Top 3) */}
        <div className="flex justify-center items-end gap-3 md:gap-6 pt-10">
          
          {/* Rank 2 (Silver) */}
          {topThree[1] && (
            <div className="flex flex-col items-center w-1/3 max-w-[200px] group">
              <div className="relative mb-6 transform transition-transform group-hover:-translate-y-2 duration-500">
                <div className="w-20 h-20 md:w-28 md:h-28 rounded-2xl overflow-hidden ring-4 ring-slate-300/80 shadow-[0_0_30px_rgba(203,213,225,0.3)]">
                  <img src={topThree[1].avatar} alt={topThree[1].name} className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-slate-200 to-slate-400 text-slate-900 px-3 py-1 rounded-full font-black text-sm shadow-lg whitespace-nowrap">
                  2ND
                </div>
              </div>
              <div className="w-full bg-gradient-to-b from-slate-500/10 to-surface border-t border-x border-slate-500/20 rounded-t-[32px] h-[160px] flex flex-col items-center justify-end pb-6 relative overflow-hidden backdrop-blur-md">
                <div className="absolute inset-0 bg-slate-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <h3 className="font-bold text-foreground text-lg mb-1 truncate w-full text-center px-2">{topThree[1].name}</h3>
                <div className="text-sm font-bold text-slate-500 mb-2">{topThree[1].title}</div>
                <div className="text-2xl font-black text-foreground drop-shadow-sm">{topThree[1].points} <span className="text-xs text-foreground/50">PTS</span></div>
              </div>
            </div>
          )}

          {/* Rank 1 (Gold) */}
          {topThree[0] && (
            <div className="flex flex-col items-center w-1/3 max-w-[240px] z-10 group">
              <div className="relative mb-8 transform transition-transform group-hover:-translate-y-3 duration-500">
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 animate-bounce">
                  <Trophy className="w-10 h-10 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)] fill-yellow-400/20" />
                </div>
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden ring-4 ring-yellow-400 shadow-[0_0_40px_rgba(250,204,21,0.4)]">
                  <img src={topThree[0].avatar} alt={topThree[0].name} className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-300 to-yellow-500 text-yellow-950 px-4 py-1.5 rounded-full font-black text-sm shadow-xl whitespace-nowrap border border-yellow-200">
                  1ST
                </div>
              </div>
              <div className="w-full bg-gradient-to-b from-yellow-500/10 to-surface border-t border-x border-yellow-500/30 rounded-t-[40px] h-[200px] flex flex-col items-center justify-end pb-8 relative overflow-hidden backdrop-blur-md shadow-2xl shadow-yellow-500/10">
                <div className="absolute inset-0 bg-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <h3 className="font-bold text-foreground text-xl mb-1 truncate w-full text-center px-2">{topThree[0].name}</h3>
                <div className="text-sm font-bold text-yellow-600 mb-2">{topThree[0].title}</div>
                <div className="text-4xl font-black text-foreground drop-shadow-md">{topThree[0].points} <span className="text-sm text-foreground/50">PTS</span></div>
              </div>
            </div>
          )}

          {/* Rank 3 (Bronze) */}
          {topThree[2] && (
            <div className="flex flex-col items-center w-1/3 max-w-[200px] group">
              <div className="relative mb-6 transform transition-transform group-hover:-translate-y-2 duration-500">
                <div className="w-20 h-20 md:w-28 md:h-28 rounded-2xl overflow-hidden ring-4 ring-amber-700/60 shadow-[0_0_30px_rgba(180,83,9,0.3)]">
                  <img src={topThree[2].avatar} alt={topThree[2].name} className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-600 to-amber-800 text-amber-50 px-3 py-1 rounded-full font-black text-sm shadow-lg whitespace-nowrap">
                  3RD
                </div>
              </div>
              <div className="w-full bg-gradient-to-b from-amber-700/10 to-surface border-t border-x border-amber-700/20 rounded-t-[32px] h-[140px] flex flex-col items-center justify-end pb-6 relative overflow-hidden backdrop-blur-md">
                <div className="absolute inset-0 bg-amber-700/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <h3 className="font-bold text-foreground text-lg mb-1 truncate w-full text-center px-2">{topThree[2].name}</h3>
                <div className="text-sm font-bold text-amber-600 mb-2">{topThree[2].title}</div>
                <div className="text-2xl font-black text-foreground drop-shadow-sm">{topThree[2].points} <span className="text-xs text-foreground/50">PTS</span></div>
              </div>
            </div>
          )}
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pt-8 border-t border-foreground/5">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40" />
            <input 
              type="text" 
              placeholder="Find a player..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface/50 backdrop-blur-sm border border-foreground/10 rounded-2xl pl-12 pr-4 py-3 text-base font-medium text-foreground focus:outline-none focus:border-foreground/30 focus:ring-4 focus:ring-foreground/5 transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-surface/50 backdrop-blur-sm border border-foreground/10 text-sm font-bold text-foreground hover:bg-foreground/5 w-full sm:w-auto justify-center transition-colors">
            <Filter className="w-4 h-4" /> Filter Options
          </button>
        </div>

        {/* Detailed Cards List (Replaced Datatable) */}
        <div className="space-y-4">
          {restOfList.map((user) => (
            <div 
              key={user.id} 
              className="group relative flex flex-col md:flex-row md:items-center justify-between p-4 md:p-6 bg-surface/50 backdrop-blur-md border border-foreground/5 rounded-3xl hover:border-foreground/20 hover:shadow-xl hover:shadow-foreground/5 hover:-translate-y-1 transition-all duration-300"
            >
              
              {/* Left Side: Rank, Avatar, Info */}
              <div className="flex items-center gap-4 md:gap-6 mb-4 md:mb-0">
                <div className="w-12 text-center shrink-0">
                  <span className="text-2xl font-black text-foreground/30 font-mono group-hover:text-foreground transition-colors duration-300">#{user.rank}</span>
                </div>
                
                <div className="relative shrink-0">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl overflow-hidden bg-foreground/10">
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-surface border border-foreground/10 flex items-center justify-center">
                    {user.trend === 'up' ? (
                      <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                    ) : user.trend === 'down' ? (
                      <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                    ) : (
                      <Minus className="w-3.5 h-3.5 text-foreground/40" />
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-xl font-bold text-foreground group-hover:text-blue-500 transition-colors">{user.name}</h4>
                  <div className="text-sm font-bold text-foreground/50">{user.title}</div>
                </div>
              </div>

              {/* Right Side: Stats Flexbox */}
              <div className="flex items-center gap-2 md:gap-8 bg-background/50 p-3 md:p-4 rounded-2xl border border-foreground/5 ml-16 md:ml-0 overflow-x-auto hide-scrollbar">
                
                <div className="flex flex-col items-center justify-center px-4 shrink-0">
                  <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-1">Win Rate</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-foreground">{user.winRate}%</span>
                    <svg className="w-4 h-4 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-foreground/10"
                        stroke="currentColor" strokeWidth="4" fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className={user.winRate >= 70 ? 'text-green-500' : user.winRate >= 50 ? 'text-yellow-500' : 'text-red-500'}
                        stroke="currentColor" strokeWidth="4" strokeDasharray={`${user.winRate}, 100`} fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                  </div>
                </div>

                <div className="w-px h-10 bg-foreground/10 shrink-0 hidden md:block" />

                <div className="flex flex-col items-center justify-center px-4 shrink-0">
                  <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-1">Matches</span>
                  <span className="text-lg font-bold text-foreground">{user.matches}</span>
                </div>

                <div className="w-px h-10 bg-foreground/10 shrink-0 hidden md:block" />

                <div className="flex flex-col items-end justify-center pl-4 pr-2 shrink-0">
                  <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-1">Total Points</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-foreground">{user.points}</span>
                    <span className="text-xs font-bold text-foreground/50">PTS</span>
                  </div>
                </div>

              </div>

            </div>
          ))}

          {restOfList.length === 0 && (
            <div className="p-12 text-center bg-surface/50 border border-foreground/5 rounded-3xl">
              <div className="w-16 h-16 rounded-full bg-foreground/5 flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-foreground/30" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">No players found</h3>
              <p className="text-foreground/50 font-medium">Try adjusting your search filters.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
