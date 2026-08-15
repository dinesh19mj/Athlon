import { api } from './client';

export interface LiveScore {
  scoreId: number;
  scoreUuid: string;
  matchId: number;
  matchUuid: string;
  teamAScore?: string;
  teamBScore?: string;
  isFinal: boolean;
  isActive: boolean;
  scoreMeta?: any; // Full JSON game state
  createdOn?: string;
  modifiedOn?: string;
}

export const ScoreService = {
  /** Push full game state (called on every point by umpire scoring board) */
  sync: (matchUuid: string, state: object) =>
    api.post<{ data: LiveScore }>(`/api/tournament/scores/sync?matchId=${matchUuid}`, state),

  /** Get current score state for a specific match */
  getState: async (matchUuid: string) => {
    try {
      return await api.get<{ data: LiveScore }>(`/api/tournament/scores/state/${matchUuid}`);
    } catch (error) {
      return null;
    }
  },

  /** Get all currently live (in-progress) matches */
  getLive: () =>
    api.get<{ data: LiveScore[] }>('/api/tournament/scores/live'),

  /** Get all active scores including completed ones — used as fallback */
  getAll: () =>
    api.get<{ data: LiveScore[] }>('/api/tournament/scores/all'),
};
