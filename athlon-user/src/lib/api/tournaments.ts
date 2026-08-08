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
  updateStatus: (uuid: string, status: string, updatedBy?: number) =>
    api.post<{ data: Registration }>(`/api/tournament/registrations/${uuid}/status?status=${status}${updatedBy ? `&updatedBy=${updatedBy}` : ''}`, {}),
  updatePaymentStatus: (uuid: string, status: string, updatedBy?: number) =>
    api.post<{ data: Registration }>(`/api/tournament/registrations/${uuid}/payment-status?status=${status}${updatedBy ? `&updatedBy=${updatedBy}` : ''}`, {}),
};
