import { api } from './client';

export interface Tournament {
  id: string;
  name: string;
  status: string;
  // Add other fields based on TournamentResponse
}

export const TournamentService = {
  getAll: () => 
    api.get<{ data: any[] }>('/tournament/tournaments/get-all'),
  getById: (uuid: string) => 
    api.get<{ data: any }>(`/tournament/tournaments/get/${uuid}`),
};
