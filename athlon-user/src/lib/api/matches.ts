import { api } from './client';

export interface MatchCreateRequest {
  fixtureMatchId?: number;
  teamAId: number;
  teamBId: number;
  courtId?: number;
  matchDate?: string;
  sportType: string;
}

export const MatchService = {
  create: (data: MatchCreateRequest) => 
    api.post<{ data: any }>('/tournament/matches/create', data),
    
  getById: (uuid: string) => 
    api.get<{ data: any }>(`/tournament/matches/get/${uuid}`),
    
  getByTournament: (tournamentId: number) => 
    api.get<{ data: any[] }>(`/tournament/matches/tournament/${tournamentId}`)
};
