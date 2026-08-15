import { api } from './client';
import { Team } from '../store/useMatchStore';

export interface ScoreEvent {
  eventValue: string;
  eventType: 'POINT_SCORED' | 'POINT_REVERTED' | 'FAULT';
  eventTime: string;
}

export const ScoringService = {
  recordEvent: async (matchId: string, sportType: string, event: ScoreEvent) => {
    return await api.post<{ data: any }>(
      `/api/tournament/scores/record-event?matchId=${matchId}&sportType=${sportType}`, 
      event
    );
  },
  
  syncState: async (matchId: string, state: any) => {
    return await api.post<{ data: any }>(
      `/api/tournament/scores/sync?matchId=${matchId}`, 
      state
    );
  },

  getState: async (matchId: string) => {
    try {
      return await api.get<{ data: any }>(
        `/api/tournament/scores/state/${matchId}`
      );
    } catch (error) {
      console.error('Failed to fetch state from backend', error);
      throw error;
    }
  }
};
