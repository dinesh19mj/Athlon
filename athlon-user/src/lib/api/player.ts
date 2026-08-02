import { api } from './client';

export interface Player {
  playerId?: number;
  fullName: string;
  email: string;
  phone?: string;
  photoUrl?: string;
  // add other fields as needed
}

export interface PlayerRole {
  roleId: number;
  roleName: string;
}

export const PlayerService = {
  register: (data: any) => 
    api.post<Player>('/api/identity/users/createUser', data),

  getById: (playerId: number) => 
    api.get<Player>(`/player/getPlayerById/${playerId}`),

  getRoles: (playerId: number) => 
    api.get<PlayerRole[]>(`/player/roles/${playerId}`),

  updatePhoto: (playerId: number, data: any) => 
    api.put<Player>(`/player/updatePhoto/${playerId}`, data),
};
