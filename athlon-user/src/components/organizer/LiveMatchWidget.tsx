'use client';

import { useLiveMatch } from '@/hooks/useLiveMatch';

export function LiveMatchWidget({ matchId, courtName, teamA, teamB }: { matchId: string, courtName: string, teamA: string, teamB: string }) {
  const { leftScore, rightScore } = useLiveMatch(matchId);

  return (
    <div className="bg-(--surface) border border-(--border) rounded-(--radius-card) p-4 flex flex-col relative overflow-hidden group hover:border-(--primary)/50 transition-colors">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-(--live) to-(--primary) opacity-75" />
      
      <div className="flex justify-between items-center mb-4 mt-2">
        <span className="px-2 py-1 bg-(--live)/10 text-(--live) text-[10px] uppercase font-bold rounded-full tracking-wide">
          Live Now
        </span>
        <span className="text-xs font-semibold text-(--text-muted)">{courtName}</span>
      </div>

      <div className="flex justify-between items-center flex-1">
        <div className="flex flex-col items-center flex-1">
          <span className="text-sm font-semibold mb-2 text-center text-(--text-muted) line-clamp-1">{teamA}</span>
          <span className="text-4xl font-bold tabular-nums">{leftScore}</span>
        </div>
        
        <div className="text-(--text-muted)/50 font-bold px-2">VS</div>

        <div className="flex flex-col items-center flex-1">
          <span className="text-sm font-semibold mb-2 text-center text-(--text-muted) line-clamp-1">{teamB}</span>
          <span className="text-4xl font-bold tabular-nums">{rightScore}</span>
        </div>
      </div>
      
      <div className="mt-4 pt-3 border-t border-(--border) flex justify-between items-center text-xs">
        <span className="text-(--text-muted)">Men's Doubles</span>
        <button className="text-(--primary) hover:underline font-medium">View Details</button>
      </div>
    </div>
  );
}
