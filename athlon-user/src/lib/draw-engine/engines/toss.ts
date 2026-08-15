import { Team, MatchCategory } from '../core/types';

export enum TossDecisionType {
  HOME = 'HOME',
  AWAY = 'AWAY',
  SERVE = 'SERVE', // specific to some sports
  RECEIVE = 'RECEIVE'
}

export interface TossResult {
  winnerId: string;
  decision: TossDecisionType;
  categoryOrderOverride?: string[]; // array of category IDs if order is changed
}

export const TossEngine = {
  /**
   * Conducts a random toss between two teams if not done manually.
   */
  conductRandomToss(team1: Team, team2: Team): TossResult {
    const winner = Math.random() > 0.5 ? team1.id : team2.id;
    const decision = Math.random() > 0.5 ? TossDecisionType.HOME : TossDecisionType.AWAY;
    
    return {
      winnerId: winner,
      decision
    };
  },

  /**
   * Applies the toss result to a match context, optionally reordering categories.
   */
  applyTossResult(categories: MatchCategory[], toss: TossResult): MatchCategory[] {
    if (!toss.categoryOrderOverride || toss.categoryOrderOverride.length === 0) {
      return categories;
    }

    const newOrder: MatchCategory[] = [];
    for (const catId of toss.categoryOrderOverride) {
      const cat = categories.find(c => c.id === catId);
      if (cat) {
        newOrder.push(cat);
      }
    }
    
    return newOrder.length === categories.length ? newOrder : categories; // Fallback if invalid
  }
};
