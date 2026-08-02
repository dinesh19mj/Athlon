'use client';

import { useState } from 'react';
import { TrendingUp, Target, Award, ChevronRight, Calendar, TrendingDown, Minus, Trophy, User } from 'lucide-react';

export default function ProgressPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Overall Leaderboard (Top 3)
  const overallTop3 = [
    { id: 1, name: 'Arjun', score: 2450, rank: 1, photo: null },
    { id: 2, name: 'Raj', score: 2120, rank: 2, photo: null },
    { id: 3, name: 'Neha', score: 1980, rank: 3, photo: null },
  ];

  // Mocking different daily data based on date selection
  const generateMockData = (dateStr: string) => {
    const hash = dateStr.split('-').reduce((acc, val) => acc + parseInt(val), 0);
    
    let baseMembers = [
      { id: 1, name: 'Arjun Patel', baseScore: 85, streak: 4 },
      { id: 2, name: 'Raj Kumar', baseScore: 78, streak: 2 },
      { id: 3, name: 'Neha Gupta', baseScore: 75, streak: 1 },
      { id: 4, name: 'Vikram Singh', baseScore: 65, streak: 0 },
      { id: 5, name: 'Pooja Sharma', baseScore: 60, streak: 0 },
      { id: 6, name: 'Kabir Das', baseScore: 55, streak: 0 },
    ];

    const members = baseMembers.map((m, i) => {
      const dailyFluctuation = ((hash + i) % 15) - 5; 
      const score = Math.min(100, Math.max(0, m.baseScore + dailyFluctuation));
      
      let trendIndicator: 'up' | 'down' | 'flat' = 'flat';
      if (dailyFluctuation > 2) trendIndicator = 'up';
      else if (dailyFluctuation < -2) trendIndicator = 'down';

      return {
        ...m,
        score,
        trendIndicator,
        trendVal: Math.abs(dailyFluctuation)
      };
    });

    members.sort((a, b) => b.score - a.score);
    return members.map((m, index) => ({ ...m, rank: index + 1 }));
  };

  const currentMembers = generateMockData(selectedDate);

  return (
    <div className="h-[calc(100vh-156px)] md:h-[calc(100vh-64px)] overflow-hidden bg-background text-foreground flex flex-col relative">
      <div className="p-6 border-b border-foreground/10 shrink-0 relative z-0">
        <h1 className="text-2xl font-black text-foreground uppercase tracking-tight">Progress</h1>
        <p className="text-foreground/50 text-xs font-bold mt-1">Skill & performance monitor</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 hide-scrollbar relative z-0">
        
        {/* OVERALL LEADERBOARD PODIUM */}
        <div>
          <h2 className="text-[10px] font-black text-foreground/40 uppercase tracking-widest mb-6 pl-1 text-center">Overall Champions</h2>
          
          <div className="flex items-end justify-center gap-2 px-4 h-48 relative pt-8 mt-4">
            {/* 2nd Place */}
            <div className="flex flex-col items-center w-1/3 relative z-10">
              <div className="absolute -top-10 flex flex-col items-center animate-in slide-in-from-bottom-4 duration-500 delay-100">
                <div className="w-12 h-12 rounded-full bg-gray-300 border-4 border-background flex items-center justify-center shadow-[0_0_15px_rgba(209,213,219,0.3)] z-10">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
                <span className="text-[10px] font-bold mt-1 text-foreground truncate max-w-[60px]">{overallTop3[1].name}</span>
                <span className="text-[9px] font-black text-gray-400">{overallTop3[1].score} pt</span>
              </div>
              <div className="w-full bg-gradient-to-t from-gray-500/20 to-gray-400/40 rounded-t-xl h-24 border-t-2 border-gray-400/50 flex justify-center pt-2 backdrop-blur-md">
                <span className="text-2xl font-black text-gray-300/50">2</span>
              </div>
            </div>

            {/* 1st Place */}
            <div className="flex flex-col items-center w-1/3 relative z-20">
              <div className="absolute -top-14 flex flex-col items-center animate-in slide-in-from-bottom-8 duration-700">
                <div className="absolute -top-6 text-yellow-500 animate-bounce">
                  <Trophy className="w-6 h-6 fill-yellow-500/20" />
                </div>
                <div className="w-16 h-16 rounded-full bg-yellow-400 border-4 border-background flex items-center justify-center shadow-[0_0_30px_rgba(250,204,21,0.5)] z-10">
                  <User className="w-7 h-7 text-yellow-800" />
                </div>
                <span className="text-xs font-black mt-1 text-foreground truncate max-w-[70px]">{overallTop3[0].name}</span>
                <span className="text-[10px] font-black text-yellow-500">{overallTop3[0].score} pt</span>
              </div>
              <div className="w-full bg-gradient-to-t from-yellow-600/20 to-yellow-500/40 rounded-t-xl h-32 border-t-2 border-yellow-500/50 flex justify-center pt-2 backdrop-blur-md">
                <span className="text-4xl font-black text-yellow-400/50">1</span>
              </div>
            </div>

            {/* 3rd Place */}
            <div className="flex flex-col items-center w-1/3 relative z-10">
              <div className="absolute -top-8 flex flex-col items-center animate-in slide-in-from-bottom-2 duration-500 delay-200">
                <div className="w-10 h-10 rounded-full bg-amber-700 border-4 border-background flex items-center justify-center shadow-[0_0_15px_rgba(180,83,9,0.3)] z-10">
                  <User className="w-4 h-4 text-amber-200" />
                </div>
                <span className="text-[10px] font-bold mt-1 text-foreground truncate max-w-[60px]">{overallTop3[2].name}</span>
                <span className="text-[9px] font-black text-amber-600">{overallTop3[2].score} pt</span>
              </div>
              <div className="w-full bg-gradient-to-t from-amber-800/20 to-amber-700/40 rounded-t-xl h-20 border-t-2 border-amber-700/50 flex justify-center pt-1 backdrop-blur-md">
                <span className="text-xl font-black text-amber-600/50">3</span>
              </div>
            </div>
          </div>
        </div>

        {/* DAILY LEADERBOARD */}
        <div>
          <div className="flex items-center justify-between mb-4 pl-1 pr-1 bg-surface/50 border border-foreground/5 rounded-2xl p-2">
            <div className="flex items-center gap-2 pl-2">
              <h2 className="text-[11px] font-black text-foreground uppercase tracking-widest">Daily Ranks</h2>
              <span className="text-[9px] font-bold px-2 py-1 bg-[#06B6D4]/10 text-[#06B6D4] rounded-full uppercase tracking-wider">
                {new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            
            <div className="relative group">
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <button className="w-9 h-9 rounded-xl bg-foreground/5 flex items-center justify-center text-foreground/70 group-hover:bg-[#06B6D4] group-hover:text-[#0A0F1A] transition-colors relative z-0">
                <Calendar className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {currentMembers.map((member) => (
              <div key={member.id} className="bg-surface/80 backdrop-blur-md border border-foreground/5 rounded-2xl p-4 shadow-xl flex items-center justify-between group hover:border-[#06B6D4]/30 transition-colors cursor-pointer relative overflow-hidden">
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                    member.rank === 1 ? 'bg-yellow-500/20 text-yellow-500' :
                    member.rank === 2 ? 'bg-gray-400/20 text-gray-400' :
                    member.rank === 3 ? 'bg-amber-700/20 text-amber-700' :
                    'bg-foreground/5 text-foreground/50'
                  }`}>
                    {member.rank}
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                      {member.name}
                      {member.streak > 2 && <span className="text-[9px] bg-orange-500/10 text-orange-500 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">🔥 {member.streak}</span>}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] text-foreground/60 font-bold uppercase tracking-wider">Score: {member.score}</span>
                      <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider">
                        {member.trendIndicator === 'up' && <><TrendingUp className="w-3 h-3 text-green-500" /> <span className="text-green-500">+{member.trendVal}</span></>}
                        {member.trendIndicator === 'down' && <><TrendingDown className="w-3 h-3 text-red-500" /> <span className="text-red-500">-{member.trendVal}</span></>}
                        {member.trendIndicator === 'flat' && <><Minus className="w-3 h-3 text-foreground/40" /> <span className="text-foreground/40">Same</span></>}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-foreground/5 flex items-center justify-center group-hover:bg-[#06B6D4] group-hover:text-[#0A0F1A] transition-colors shrink-0">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
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
