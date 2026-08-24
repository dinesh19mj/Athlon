import React, { useMemo } from 'react';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';

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
  // Group and sort standings dynamically by Points (descending), Wins (descending), Losses (ascending)
  const sortedPools = useMemo(() => {
    const poolsMap = new Map<string, PoolStanding[]>();

    standings.forEach((s) => {
      const poolName = s.poolName || `Pool ${s.poolId || 'A'}`;
      if (!poolsMap.has(poolName)) poolsMap.set(poolName, []);
      poolsMap.get(poolName)!.push({ ...s });
    });

    const result: { poolName: string; teams: PoolStanding[] }[] = [];

    // Sort pool names alphabetically (Pool A, Pool B, etc.)
    const sortedPoolNames = Array.from(poolsMap.keys()).sort();

    sortedPoolNames.forEach((poolName) => {
      const teamList = poolsMap.get(poolName)!;

      // Sort teams in this pool:
      // 1. Points (Descending)
      // 2. Won (Descending)
      // 3. Lost (Ascending)
      // 4. Played (Descending)
      teamList.sort((a, b) => {
        const ptsDiff = (b.points || 0) - (a.points || 0);
        if (ptsDiff !== 0) return ptsDiff;

        const wonDiff = (b.won || 0) - (a.won || 0);
        if (wonDiff !== 0) return wonDiff;

        const lostDiff = (a.lost || 0) - (b.lost || 0);
        if (lostDiff !== 0) return lostDiff;

        return (b.played || 0) - (a.played || 0);
      });

      // Assign position/rank based strictly on points standing
      teamList.forEach((team, index) => {
        team.rank = index + 1;
      });

      result.push({ poolName, teams: teamList });
    });

    return result;
  }, [standings]);

  return (
    <div
      className="w-full rounded-2xl border p-5 sm:p-6 shadow-lg space-y-6"
      style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border)' }}
    >
      <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--athlon-border)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-foreground">Pool Standings & Points Table</h3>
            <p className="text-[11px] text-foreground/50 font-medium">Rankings dynamically ordered by total match points.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-bold text-foreground/60">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          <span>Top 2 Qualify for Playoffs</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {sortedPools.map(({ poolName, teams }) => (
          <div
            key={poolName}
            className="rounded-2xl border overflow-hidden shadow-md"
            style={{ backgroundColor: 'var(--athlon-surface)', borderColor: 'var(--athlon-border-subtle)' }}
          >
            {/* Pool Header */}
            <div
              className="p-3.5 px-4 border-b flex items-center justify-between"
              style={{ backgroundColor: 'var(--athlon-card)', borderColor: 'var(--athlon-border-subtle)' }}
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                <h4 className="font-black text-sm text-foreground uppercase tracking-wide">{poolName}</h4>
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-foreground/45">
                {teams.length} Teams
              </span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead
                  className="text-[10px] uppercase font-extrabold border-b tracking-wider"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    borderColor: 'var(--athlon-border-subtle)',
                    color: 'var(--athlon-text-muted)',
                  }}
                >
                  <tr>
                    <th className="px-3.5 py-2.5 w-12 text-center">Rank</th>
                    <th className="px-3.5 py-2.5">Team</th>
                    <th className="px-3 py-2.5 text-center w-12" title="Played">P</th>
                    <th className="px-3 py-2.5 text-center w-12 text-emerald-400" title="Won">W</th>
                    <th className="px-3 py-2.5 text-center w-12 text-red-400" title="Lost">L</th>
                    <th className="px-4 py-2.5 text-center w-16 text-primary font-black" title="Points">Pts</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'var(--athlon-border-subtle)' }}>
                  {teams.map((team, idx) => {
                    const hasScored = (team.played || 0) > 0 || (team.points || 0) > 0;
                    const isQualifier = team.rank <= 2 && hasScored;

                    return (
                      <tr
                        key={team.teamUuid || idx}
                        className={`transition-colors ${
                          isQualifier ? 'bg-primary/[0.03] hover:bg-primary/[0.07]' : 'hover:bg-white/[0.03]'
                        }`}
                      >
                        {/* Rank */}
                        <td className="px-3.5 py-3 text-center">
                          {hasScored && team.rank === 1 ? (
                            <span className="w-6 h-6 rounded-lg bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 flex items-center justify-center mx-auto text-xs font-black">
                              1
                            </span>
                          ) : hasScored && team.rank === 2 ? (
                            <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto text-xs font-black">
                              2
                            </span>
                          ) : (
                            <span className="font-bold text-foreground/50 text-xs">
                              {team.rank}
                            </span>
                          )}
                        </td>

                        {/* Team Name */}
                        <td className="px-3.5 py-3 font-bold text-foreground">
                          <div className="flex items-center gap-2">
                            <span className="truncate max-w-[180px] sm:max-w-[240px] block">
                              {team.teamName}
                            </span>
                            {isQualifier && (
                              <span className="px-1.5 py-0.2 rounded bg-primary/15 text-primary border border-primary/25 text-[9px] font-black uppercase tracking-wider shrink-0">
                                Q
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Played */}
                        <td className="px-3 py-3 text-center font-medium text-foreground/60">{team.played || 0}</td>

                        {/* Won */}
                        <td className="px-3 py-3 text-center font-bold text-emerald-400">{team.won || 0}</td>

                        {/* Lost */}
                        <td className="px-3 py-3 text-center font-medium text-red-400/80">{team.lost || 0}</td>

                        {/* Points */}
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-lg text-xs font-black ${
                              (team.points || 0) > 0
                                ? 'bg-primary/20 text-primary border border-primary/30'
                                : 'text-foreground/60 bg-white/5'
                            }`}
                          >
                            {team.points || 0}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
