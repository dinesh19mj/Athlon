import { api } from './client';

export interface ClubMatch {
  matchId?: number;
  orgId?: number;
  orgUuid: string;
  sportType: string;
  matchType?: string;
  matchDate: string;
  teamAPlayers: string;
  teamBPlayers: string;
  score: string;
  winner?: string;
  status: string;
  createdBy?: number;
  createdOn?: string;
}

export const ClubMatchService = {
  getMatchesByOrg: (orgIdentifier: string) =>
    api.get<ClubMatch[]>(`/api/tournament/clubmatch/org/${orgIdentifier}`),

  createMatch: (data: ClubMatch) =>
    api.post<ClubMatch>('/api/tournament/clubmatch/add', data),

  updateScore: (matchId: number, score: string, status?: string) =>
    api.put<ClubMatch>(`/api/tournament/clubmatch/updateScore/${matchId}?score=${encodeURIComponent(score)}${status ? `&status=${status}` : ''}`, {}),

  deleteMatch: (matchId: number) =>
    api.delete<void>(`/api/tournament/clubmatch/${matchId}`),
};
