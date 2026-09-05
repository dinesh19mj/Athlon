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

/** Helper to ensure ONLY genuine official tournament matches are displayed in public live feeds */
export function isTournamentScore(score: LiveScore): boolean {
  if (!score) return false;
  const matchId = String(score.matchUuid || score.matchId || '');
  if (!matchId || matchId === 'live' || matchId.startsWith('practice-') || matchId.startsWith('match-')) {
    return false;
  }
  const meta = score.scoreMeta || {};
  const config = meta.config || {};

  // Must belong to an official tournament with an explicit tournamentName or tournamentUuid
  const tournamentName = (config.tournamentName || meta.tournamentName || '').trim();
  const tournamentUuid = (config.tournamentUuid || meta.tournamentUuid || '').trim();

  if (!tournamentName && !tournamentUuid) {
    return false;
  }

  const lowerName = tournamentName.toLowerCase();
  if (
    !lowerName ||
    lowerName === 'practice match' ||
    lowerName === 'quick match' ||
    lowerName === 'local match' ||
    lowerName === 'live match' ||
    lowerName.includes('practice') ||
    lowerName.includes('quick match') ||
    lowerName.includes('local match')
  ) {
    return false;
  }

  if (config.isPractice === true || meta.isPractice === true) {
    return false;
  }

  return true;
}
