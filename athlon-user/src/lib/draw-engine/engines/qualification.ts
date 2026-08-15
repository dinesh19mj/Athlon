import { Participant, Pool, MatchStatus } from '../core/types';

export interface PoolStanding {
  participant: Participant;
  played: number;
  won: number;
  lost: number;
  points: number;
}

export const QualificationEngine = {
  /**
   * Calculates standings for a given pool based on match results.
   */
  calculateStandings(pool: Pool): PoolStanding[] {
    const standingsMap = new Map<string, PoolStanding>();

    for (const p of pool.participants) {
      standingsMap.set(p.id, {
        participant: p,
        played: 0,
        won: 0,
        lost: 0,
        points: 0
      });
    }

    for (const match of pool.fixtures) {
      if (match.status === MatchStatus.COMPLETED && match.winnerId) {
        const p1 = match.participant1;
        const p2 = match.participant2;
        
        if (p1 && standingsMap.has(p1.id) && p2 && standingsMap.has(p2.id)) {
            const standing1 = standingsMap.get(p1.id)!;
            const standing2 = standingsMap.get(p2.id)!;
            
            standing1.played++;
            standing2.played++;
            
            if (match.winnerId === p1.id) {
                standing1.won++;
                standing1.points += 2; // Default logic: 2 pts for a win
                standing2.lost++;
            } else if (match.winnerId === p2.id) {
                standing2.won++;
                standing2.points += 2;
                standing1.lost++;
            }
        }
      }
    }

    // Sort by points, then by won
    return Array.from(standingsMap.values()).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.won !== a.won) return b.won - a.won;
      return 0; // Add Head-to-Head tiebreakers in future
    });
  },

  /**
   * Returns the top qualified participants from a pool based on standings.
   */
  getQualifiedParticipants(pool: Pool, topTeamsQualified: number): Participant[] {
    if (topTeamsQualified <= 0) return [];
    
    const standings = this.calculateStandings(pool);
    return standings.slice(0, topTeamsQualified).map(s => s.participant);
  }
};
