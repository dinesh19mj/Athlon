import { api } from './client';

export interface Match {
  id: number;
  uuid: string;
  tournamentId: number;
  tournamentUuid: string;
  teamARegistrationId?: number;
  teamARegistrationUuid?: string;
  teamBRegistrationId?: number;
  teamBRegistrationUuid?: string;
  teamAId: number;
  teamBId: number;
  teamAName?: string;
  teamBName?: string;
  courtId?: number;
  courtName?: string;
  tournamentName?: string;
  tournamentType?: string;
  matchDate?: string;
  scheduledTime?: string;
  poolName?: string;
  sportType: string;
  status?: string;
  teamALineupStatus?: string;
  teamBLineupStatus?: string;
}

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
    api.post<{ data: any }>('/api/tournament/matches/create', data),
    
  getById: (uuid: string) => 
    api.get<{ data: any }>(`/api/tournament/matches/get/${uuid}`),
    
  getByTournament: (tournamentId: number) => 
    api.get<{ data: any[] }>(`/api/tournament/matches/tournament/${tournamentId}`),
    
  getByUser: (userId: number) => 
    api.get<{ data: any[] }>(`/api/tournament/matches/user/${userId}`),
    
  getByUmpirePhone: (phone: string) =>
    api.get<{ data: any[] }>(`/api/tournament/matches/umpire/${encodeURIComponent(phone)}`),
    
  updateStatus: (uuid: string, status: string, winnerRegistrationId?: number) =>
    api.put<{ data: any }>(`/api/tournament/matches/${uuid}/status?status=${status}${winnerRegistrationId ? `&winnerRegistrationId=${winnerRegistrationId}` : ''}`, {})
};
