import { api, fetchClient } from './client';

export interface Tournament {
  tournamentId: number;
  tournamentUuid: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  organizerId: number;
  organizerUuid: string;
  userId: number;
  userUuid: string;
  status: string;
  isActive: boolean;
  tournamentType?: string;
  sport: string;
  visibility?: string;
  category?: string;
  matchFormat?: string;
  playersCount?: number;
  location?: string;
  mapLink: string;
  contactPhone: string;
  registrationFees: number;
  poster: string;
}

export const TournamentService = {
  getAll: () =>
    api.get<{ data: Tournament[] }>('/api/tournament/tournaments/getAllActiveTournaments'),

  getById: (uuid: string) =>
    api.get<{ data: Tournament }>(`/api/tournament/tournaments/getTournamentByUuid/${uuid}`),

  getByOrg: (orgUuid: string) =>
    api.get<{ data: Tournament[] }>(`/api/tournament/tournaments/getTournamentsByOrganizationUuid/${orgUuid}`),

  create: (formData: FormData) => {
    // We must use fetchClient directly to avoid JSON.stringify on FormData
    // And we must NOT set Content-Type header so browser adds multipart boundary automatically
    return fetchClient<{ data: Tournament }>('/api/tournament/tournaments/createTournament', {
      method: 'POST',
      body: formData,
    });
  },

  deactivate: (uuid: string) =>
    api.post<{ data: null }>(`/api/tournament/tournaments/deactivateTournament/${uuid}`, {})
};

export interface DrawResponse {
  message: string;
  data: any; // Simplified for now
}

export interface Match {
  id: number;
  uuid: string;
  tournamentId?: number;
  tournamentUuid?: string;
  teamARegistrationId: number | null;
  teamARegistrationUuid: string | null;
  teamBRegistrationId: number | null;
  teamBRegistrationUuid: string | null;
  courtId: number | null;
  scheduledTime: string | null;
  status: string;
  winnerRegistrationId: number | null;
  winnerRegistrationUuid: string | null;
  nextMatchUuid: string | null;
  umpirePhone?: string;
  poolId?: number | null;
  poolName?: string | null;
  teamAName?: string | null;
  teamBName?: string | null;
}

export const MatchService = {
  getByTournament: async (tournamentUuid: string): Promise<Match[]> => {
    const res = await api.get<{ data: Match[] }>(`/api/tournament/matches/tournament/${tournamentUuid}`);
    return res.data || [];
  },

  updateCourt: async (matchUuid: string, courtId: number) => {
    const res = await api.put<{ data: Match }>(`/api/tournament/matches/${matchUuid}/court?courtId=${courtId}`, {});
    return res.data;
  },

  updateUmpire: async (matchUuid: string, umpirePhone: string) => {
    const res = await api.put<{ data: Match }>(`/api/tournament/matches/${matchUuid}/umpire?umpirePhone=${encodeURIComponent(umpirePhone)}`, {});
    return res.data;
  },

  updateSchedule: async (matchUuid: string, scheduledTime: string) => {
    const res = await api.put<{ data: Match }>(`/api/tournament/matches/${matchUuid}/schedule?scheduledTime=${encodeURIComponent(scheduledTime)}`, {});
    return res.data;
  }
};

export interface CategoryCreateRequest {
  organizationId: number;
  organizationUuid: string;
  sportType: string;
  categoryName: string;
  createdBy: number;
}

export const CategoryService = {
  create: (data: CategoryCreateRequest) =>
    api.post<{ data: any }>('/api/tournament/categories/createCategory', data),
  getByOrg: (orgId: number) =>
    api.get<{ data: any[] }>(`/api/tournament/categories/organization/${orgId}`),
};

export interface RegistrationPlayer {
  registrationPlayerId?: number;
  registrationPlayerUuid?: string;
  playerId?: number;
  playerUuid?: string;
  playerName: string;
  phoneNumber?: string;
}

export interface Registration {
  id: number;
  registrationId?: number;
  uuid: string;
  registrationUuid?: string;
  tournamentId: number;
  categoryId: number;
  primaryContactId?: number;
  teamName: string;
  status: string;
  paymentStatus?: string;
  createdAt: string;
  isActive: boolean;
  players?: RegistrationPlayer[];
}

export const RegistrationService = {
  getByTournament: (tournamentId: number) =>
    api.get<{ data: Registration[] }>(`/api/tournament/registrations/get-by-tournament?tournamentId=${tournamentId}`),
  getByUser: (userId: string) =>
    api.get<{ data: Registration[] }>(`/api/tournament/registrations/get-by-user?userId=${userId}`),
  updateStatus: (uuid: string, status: string, updatedBy?: number) =>
    api.post<{ data: Registration }>(`/api/tournament/registrations/${uuid}/status?status=${status}${updatedBy ? `&updatedBy=${updatedBy}` : ''}`, {}),
  updatePaymentStatus: (uuid: string, status: string, updatedBy?: number) =>
    api.post<{ data: Registration }>(`/api/tournament/registrations/${uuid}/payment-status?status=${status}${updatedBy ? `&updatedBy=${updatedBy}` : ''}`, {}),
  addPlayers: (uuid: string, players: { playerName: string; phoneNumber?: string }[], updatedBy?: number) =>
    api.post<{ data: Registration }>(`/api/tournament/registrations/${uuid}/players${updatedBy ? `?updatedBy=${updatedBy}` : ''}`, players),
};

export interface TeamEventRosterPlayer {
  rosterPlayerId?: number;
  rosterPlayerUuid?: string;
  tournamentId?: number;
  teamRegistrationId?: number;
  playerName: string;
  phoneNumber?: string;
  playerId?: number;
  categoryId?: number;
  categoryName?: string;
}

export const TeamEventRosterService = {
  getTeamRoster: (registrationUuid: string) =>
    api.get<{ data: TeamEventRosterPlayer[] }>(`/api/tournament/team-events/roster/${registrationUuid}`),
  addPlayers: (registrationUuid: string, players: TeamEventRosterPlayer[], updatedBy?: number) =>
    api.post<{ data: TeamEventRosterPlayer[] }>(`/api/tournament/team-events/roster/${registrationUuid}/players${updatedBy ? `?updatedBy=${updatedBy}` : ''}`, players)
};

export const DrawService = {
    generateDraw: (tournamentUuid: string, type: string) =>
        api.post<{ data: any }>(`/api/tournament/draws/generate/${tournamentUuid}?type=${type}`, {}),
    generateManualDraw: (tournamentUuid: string, requestBody: any) =>
        api.post<{ data: any }>(`/api/tournament/draws/manual/${tournamentUuid}`, requestBody),
    generateLeagueDraw: (tournamentUuid: string, requestBody: any) =>
        api.post<{ data: any }>(`/api/tournament/draws/league/${tournamentUuid}`, requestBody),
    generateLeaguePlayoffs: (tournamentUuid: string) =>
        api.post<{ data: any }>(`/api/tournament/draws/league-playoffs/${tournamentUuid}`, {}),
    getStandings: (tournamentUuid: string) =>
        api.get<any>(`/api/tournament/draws/standings/${tournamentUuid}`),
    deleteDraw: (tournamentUuid: string) =>
        api.delete<{ data: any }>(`/api/tournament/draws/${tournamentUuid}`),
};

export interface CourtConfig {
  id: number;
  tournamentUuid?: string;
  name: string;
  streamKey: string;
  enableStream?: boolean;
}

export const StreamConfigService = {
  getByTournament: async (tournamentUuid: string): Promise<CourtConfig[]> => {
    try {
      const res = await api.get<{ data: any[] }>(`/api/tournament/stream-config/${tournamentUuid}`);
      if (res.data) {
        return res.data.map((c: any) => ({
          id: c.id,
          tournamentUuid: c.tournamentUuid,
          name: c.courtName,
          streamKey: c.streamKey || '',
          enableStream: !!c.streamKey
        }));
      }
      return [];
    } catch (e) {
      console.error(e);
      return [];
    }
  },
  
  saveConfigs: async (tournamentUuid: string, configs: CourtConfig[]): Promise<CourtConfig[]> => {
    const payload = configs.map(c => ({
      id: (c.id && c.id > 1000000000000) ? null : c.id,
      courtName: c.name,
      streamKey: c.enableStream ? (c.streamKey || '') : ''
    }));
    
    const res = await api.post<{ data: any[] }>(`/api/tournament/stream-config/${tournamentUuid}`, payload);
    
    if (res.data) {
       return res.data.map((c: any) => ({
         id: c.id,
         tournamentUuid: c.tournamentUuid,
         name: c.courtName,
         streamKey: c.streamKey || '',
         enableStream: !!c.streamKey
       }));
    }
    return [];
  }
};
