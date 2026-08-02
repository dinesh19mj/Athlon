import { api } from './client';
import { Team } from '../store/useMatchStore';

export interface ScoreEvent {
  team: Team;
  action: 'POINT_SCORED' | 'POINT_REVERTED' | 'FAULT';
  timestamp: string;
}

export const ScoringService = {
  recordEvent: async (matchId: string, sportType: string, event: ScoreEvent) => {
    try {
      return await api.post<{ data: any }>(
        `/tournament/scores/record-event?matchId=${matchId}&sportType=${sportType}`, 
        event
      );
    } catch (error) {
      console.log('[browser] Mocking scoring API response for development');
      return { data: { success: true } };
    }
  },
  
  syncState: async (matchId: string, state: any) => {
    try {
      return await api.post<{ data: any }>(
        `/tournament/scores/sync?matchId=${matchId}`, 
        state
      );
    } catch (error) {
      console.log('[browser] Mocking state sync for development');
      return { data: { success: true } };
    }
  },

  getState: async (matchId: string) => {
    try {
      return await api.get<{ data: any }>(
        `/tournament/scores/state/${matchId}`
      );
    } catch (error) {
      console.error('Failed to fetch state from backend', error);
      throw error;
    }
  }
};
