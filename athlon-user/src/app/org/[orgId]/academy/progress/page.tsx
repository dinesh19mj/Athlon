'use client';

import { TrendingUp, Award, Target, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function ProgressPage() {
  const students = [
    { id: 1, name: 'Arjun Patel', score: 85, rank: 1, trend: '+5', color: 'bg-green-500' },
    { id: 2, name: 'Karan Singh', score: 78, rank: 2, trend: '+2', color: 'bg-blue-500' },
    { id: 3, name: 'Neha Gupta', score: 65, rank: 5, trend: '-1', color: 'bg-red-500' },
  ];

  return (
    <div className="h-[calc(100vh-156px)] md:h-[calc(100vh-64px)] overflow-hidden bg-background text-foreground flex flex-col">
      <div className="p-6 border-b border-foreground/10 shrink-0">
        <h1 className="text-2xl font-black text-foreground uppercase tracking-tight">Student Progress</h1>
        <p className="text-foreground/50 text-xs font-bold mt-1">Track performance metrics and rankings</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 hide-scrollbar">
        {/* Academy Overall Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-surface border border-foreground/10 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-1">
            <Target className="w-6 h-6 text-[#F97316] mb-1" />
            <span className="text-2xl font-black text-foreground">72%</span>
            <span className="text-[9px] font-bold text-foreground/50 uppercase tracking-widest">Avg Win Rate</span>
          </div>
          <div className="bg-surface border border-foreground/10 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-1">
            <Award className="w-6 h-6 text-yellow-500 mb-1" />
            <span className="text-2xl font-black text-foreground">12</span>
            <span className="text-[9px] font-bold text-foreground/50 uppercase tracking-widest">Tournaments Won</span>
          </div>
        </div>

        <div>
          <h2 className="text-[10px] font-black text-foreground/40 uppercase tracking-widest mb-3 pl-1">Top Performers</h2>
          <div className="space-y-3">
            {students.map((student) => (
              <Link key={student.id} href={`/academy/progress/${student.id}`} className="bg-surface/80 backdrop-blur-md border border-foreground/5 rounded-2xl p-4 shadow-xl flex items-center justify-between group hover:border-[#F97316]/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-background border border-foreground/10 flex items-center justify-center">
                    <span className="text-xs font-black text-foreground/70">#{student.rank}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-sm">{student.name}</h3>
                    <p className="text-[10px] text-foreground/50 uppercase tracking-wider flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-green-500" />
                      Rating: {student.score}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-foreground/20 group-hover:text-[#F97316] transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
