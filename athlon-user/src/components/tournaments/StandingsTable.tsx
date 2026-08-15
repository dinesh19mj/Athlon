import React from 'react';
import { TrophyIcon } from 'lucide-react';

export interface PoolStanding {
  poolId: number;
  poolName: string;
  teamUuid: string;
  teamName: string;
  played: number;
  won: number;
  lost: number;
  points: number;
  rank: number;
}

interface StandingsTableProps {
  standings: PoolStanding[];
}

export function StandingsTable({ standings }: StandingsTableProps) {
  // Group by poolName
  const pools = new Map<string, PoolStanding[]>();
  standings.forEach(s => {
    if (!pools.has(s.poolName)) pools.set(s.poolName, []);
    pools.get(s.poolName)!.push(s);
  });

  return (
    <div className="w-full bg-background rounded-xl border border-border/50 p-6 shadow-inner">
      <div className="flex items-center gap-2 mb-6 border-b border-border/50 pb-3">
        <TrophyIcon className="w-5 h-5 text-yellow-500" />
        <h3 className="text-xl font-black text-foreground">Pool Standings</h3>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {Array.from(pools.entries()).map(([poolName, poolStandings]) => (
          <div key={poolName} className="bg-surface border border-foreground/10 rounded-xl overflow-hidden">
            <div className="bg-foreground/5 p-3 border-b border-foreground/10">
              <h4 className="font-bold text-foreground">{poolName}</h4>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-foreground/50 uppercase bg-background border-b border-foreground/10">
                  <tr>
                    <th className="px-4 py-2 w-12 text-center">Rank</th>
                    <th className="px-4 py-2">Team</th>
                    <th className="px-4 py-2 text-center w-16">P</th>
                    <th className="px-4 py-2 text-center w-16 text-[#1B9C56]">W</th>
                    <th className="px-4 py-2 text-center w-16 text-red-500">L</th>
                    <th className="px-4 py-2 text-center w-20">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {poolStandings.map((s) => (
                    <tr key={s.teamUuid} className="border-b border-foreground/5 last:border-0 hover:bg-foreground/5 transition-colors">
                      <td className="px-4 py-3 text-center font-bold text-foreground/70">
                        {s.rank <= 2 && s.played > 0 ? (
                          <span className="w-6 h-6 rounded bg-[#1B9C56]/20 text-[#1B9C56] flex items-center justify-center mx-auto text-xs">
                            {s.rank}
                          </span>
                        ) : (
                          s.rank
                        )}
                      </td>
                      <td className="px-4 py-3 font-bold text-foreground">
                        {s.teamName}
                        {s.rank <= 2 && s.played > 0 && <span className="ml-2 text-[10px] text-[#1B9C56] uppercase tracking-widest font-black hidden sm:inline-block">Qualifier</span>}
                      </td>
                      <td className="px-4 py-3 text-center text-foreground/70">{s.played}</td>
                      <td className="px-4 py-3 text-center font-bold text-[#1B9C56]">{s.won}</td>
                      <td className="px-4 py-3 text-center text-red-500">{s.lost}</td>
                      <td className="px-4 py-3 text-center font-black text-foreground">{s.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
