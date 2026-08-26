import { fetchClient } from './client';

export interface ChampionshipCategory {
  categoryId?: number;
  categoryUuid?: string;
  championshipId?: number;
  name: string;
  code?: string;
  description?: string;
  displayOrder?: number;
  maxPlayers?: number;
  isActive?: boolean;
  basePrice?: number;
  registrationFee?: number;
}

export interface ChampionshipMatchFormat {
  formatId?: number;
  formatUuid?: string;
  championshipId?: number;
  name: string;
  sport?: string;
  playersPerSide?: number;
  displayOrder?: number;
  isActive?: boolean;
}

export interface ChampionshipEvent {
  eventId?: number;
  eventUuid?: string;
  championshipId?: number;
  categoryId: number;
  categoryName: string;
  formatId: number;
  formatName: string;
  eventName: string;
  pointsWeight?: number;
  displayOrder?: number;
  isMandatory?: boolean;
  isActive?: boolean;
}

export interface ChampionshipRulesConfig {
  configId?: number;
  configUuid?: string;
  championshipId?: number;
  minSquadSize: number;
  maxSquadSize: number;
  everyPlayerMustPlayLeague: boolean;
  allowSubstitutions: boolean;

  // League Stage Rules
  leagueMatchFormat?: 'PLAY_ALL' | 'BEST_OF_N';
  leagueWinPoints?: number;
  leagueDrawPoints?: number;
  leagueLossPoints?: number;
  leagueLineupDeadlineMinutes?: number;
  leagueTossOrderRule?: 'ORGANIZER_DEFINED' | 'TEAM_PREFERENCE_PLUS_TOSS';
  leagueLineupRevealPolicy?: 'SIMULTANEOUS_REVEAL' | 'AFTER_APPROVAL';
  leagueMaxSubstitutions?: number;

  // Knockout Stage Rules
  knockoutMatchFormat?: 'PLAY_ALL' | 'BEST_OF_N';
  knockoutLineupDeadlineMinutes?: number;
  knockoutTossOrderRule?: 'ORGANIZER_DEFINED' | 'TEAM_PREFERENCE_PLUS_TOSS';
  knockoutLineupRevealPolicy?: 'SIMULTANEOUS_REVEAL' | 'AFTER_APPROVAL';
  knockoutMaxSubstitutions?: number;

  // Legacy fallback fields
  lineupDeadlineMinutes?: number;
  tossOrderRule?: 'ORGANIZER_DEFINED' | 'TEAM_PREFERENCE_PLUS_TOSS';
  lineupRevealPolicy?: 'SIMULTANEOUS_REVEAL' | 'AFTER_APPROVAL';
  maxSubstitutionsPerFixture?: number;
}

export interface TeamChampionship {
  championshipId: number;
  championshipUuid: string;
  name: string;
  description?: string;
  sport: string;
  startDate?: string;
  endDate?: string;
  registrationClosingDate?: string;
  organizerId: number;
  organizerUuid: string;
  userId?: number;
  userUuid?: string;
  venue?: string;
  location?: string;
  mapLink?: string;
  contactPhone?: string;
  posterUrl?: string;
  maxTeams: number;
  teamRegistrationFee: number;
  playerFeeMode: 'FREE' | 'GLOBAL_PAID' | 'CATEGORY_PAID';
  defaultPlayerFee: number;
  auctionMode: 'FULL_AUCTION' | 'PARTIAL_AUCTION' | 'NO_AUCTION';
  stage: string;
  status: string;
  visibility: 'PUBLIC' | 'PRIVATE';
  categories?: ChampionshipCategory[];
  matchFormats?: ChampionshipMatchFormat[];
  events?: ChampionshipEvent[];
  pools?: TeamChampionshipPool[];
  rules?: ChampionshipRulesConfig;
  registeredTeamsCount?: number;
  registeredPlayersCount?: number;
}

export interface ChampionshipTeamRegistration {
  teamId: number;
  teamUuid: string;
  championshipId: number;
  championshipUuid: string;
  teamName: string;
  logoUrl?: string;
  ownerUserId?: number;
  ownerUserUuid?: string;
  captainName?: string;
  contactPhone?: string;
  contactEmail?: string;
  status: string;
  paymentStatus: string;
  paymentAmount: number;
}

export interface ChampionshipPlayerRegistration {
  playerId: number;
  playerUuid: string;
  championshipId: number;
  championshipUuid: string;
  userId?: number;
  fullName: string;
  phone?: string;
  email?: string;
  categoryId?: number;
  categoryName?: string;
  eligibleFormats?: string;
  basePrice?: number;
  feeAmount?: number;
  paymentStatus: string;
  status: string;
  avatarUrl?: string;
}

export interface ChampionshipSquadPlayer {
  squadId: number;
  squadUuid: string;
  championshipId: number;
  teamId: number;
  playerId: number;
  playerName: string;
  categoryId?: number;
  categoryName?: string;
  eligibleFormats?: string;
  acquisitionType: 'AUCTION' | 'RESERVED' | 'DIRECT';
  purchasePrice: number;
  matchesPlayedCount: number;
  isActive: boolean;
}

export interface TeamSquadAudit {
  teamId: number;
  teamUuid: string;
  teamName: string;
  logoUrl?: string;
  captainName?: string;
  squadCapacity: number;
  playersCount: number;
  players: ChampionshipSquadPlayer[];
  everyPlayerHasPlayedLeague: boolean;
  unplayedPlayers: string[];
}

export interface TeamChampionshipFixture {
  fixtureId: number;
  fixtureUuid: string;
  championshipId: number;
  poolId?: number;
  poolName?: string;
  roundName: string;
  roundNumber?: number;
  stage: string;
  teamAId: number;
  teamAName: string;
  teamBId: number;
  teamBName: string;
  scheduledTime?: string;
  courtId?: number;
  courtName?: string;
  status: string;
  teamAPoints: number;
  teamBPoints: number;
  winnerTeamId?: number;
  winnerTeamName?: string;
  categoryOrderMode?: string;
  tossWinnerTeamId?: number;
}

export interface TeamChampionshipSubMatch {
  subMatchId: number;
  subMatchUuid: string;
  fixtureId: number;
  championshipId: number;
  eventId: number;
  eventName: string;
  categoryId?: number;
  categoryName?: string;
  formatId?: number;
  formatName?: string;
  orderSequence: number;
  matchId?: number;
  teamAPlayers?: string;
  teamBPlayers?: string;
  status: string;
  scoreSummary?: string;
  winningTeamId?: number;
}

export interface TeamChampionshipPool {
  poolId: number;
  poolUuid: string;
  championshipId: number;
  poolName: string;
  stage: string;
  qualifiersCount: number;
}

export interface StandingsRow {
  teamId: number;
  teamName: string;
  logoUrl?: string;
  poolId?: number;
  poolName?: string;
  played: number;
  won: number;
  lost: number;
  ties: number;
  points: number;
  subMatchesWon: number;
  subMatchesLost: number;
  subMatchDiff: number;
  rank: number;
  isQualified: boolean;
}

const unwrap = <T>(res: any): T => (res && res.data !== undefined ? res.data : res);

export const TeamChampionshipService = {
  create: async (data: FormData | any): Promise<TeamChampionship> => {
    if (data instanceof FormData) {
      const res = await fetchClient<{ data: TeamChampionship } | TeamChampionship>(
        '/api/tournament/team-championship/createChampionship',
        {
          method: 'POST',
          body: data,
        }
      );
      return unwrap<TeamChampionship>(res);
    }
    const res = await fetchClient<{ data: TeamChampionship } | TeamChampionship>(
      '/api/tournament/team-championship/create',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    return unwrap<TeamChampionship>(res);
  },

  getById: async (championshipUuid: string): Promise<TeamChampionship> => {
    const res = await fetchClient<{ data: TeamChampionship } | TeamChampionship>(
      `/api/tournament/team-championship/getChampionshipByUuid/${championshipUuid}`
    );
    return unwrap<TeamChampionship>(res);
  },

  getByOrganizer: async (organizerUuid: string): Promise<TeamChampionship[]> => {
    const res = await fetchClient<{ data: TeamChampionship[] } | TeamChampionship[]>(
      `/api/tournament/team-championship/getChampionshipsByOrganizationUuid/${organizerUuid}`
    );
    return unwrap<TeamChampionship[]>(res);
  },

  getAllPublic: async (): Promise<TeamChampionship[]> => {
    const res = await fetchClient<{ data: TeamChampionship[] } | TeamChampionship[]>(
      '/api/tournament/team-championship/getAllActiveChampionships'
    );
    return unwrap<TeamChampionship[]>(res);
  },

  updateStage: async (championshipUuid: string, stage: string): Promise<TeamChampionship> => {
    const res = await fetchClient<{ data: TeamChampionship } | TeamChampionship>(
      `/api/tournament/team-championship/updateStage/${championshipUuid}?stage=${encodeURIComponent(stage)}`,
      {
        method: 'POST',
      }
    );
    return unwrap<TeamChampionship>(res);
  },

  getStandings: async (championshipUuid: string): Promise<StandingsRow[]> => {
    const res = await fetchClient<{ data: StandingsRow[] } | StandingsRow[]>(
      `/api/tournament/team-championship/getStandings/${championshipUuid}`
    );
    return unwrap<StandingsRow[]>(res);
  },

  registerTeam: async (data: any): Promise<ChampionshipTeamRegistration> => {
    const res = await fetchClient<any>('/api/tournament/team-championship/registrations/team', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return unwrap<ChampionshipTeamRegistration>(res);
  },

  registerPlayer: async (data: any): Promise<ChampionshipPlayerRegistration> => {
    const res = await fetchClient<any>('/api/tournament/team-championship/registrations/player', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return unwrap<ChampionshipPlayerRegistration>(res);
  },

  getTeams: async (championshipUuid: string): Promise<ChampionshipTeamRegistration[]> => {
    const res = await fetchClient<any>(`/api/tournament/team-championship/registrations/teams/${championshipUuid}`);
    return unwrap<ChampionshipTeamRegistration[]>(res);
  },

  getPlayers: async (championshipUuid: string): Promise<ChampionshipPlayerRegistration[]> => {
    const res = await fetchClient<any>(`/api/tournament/team-championship/registrations/players/${championshipUuid}`);
    return unwrap<ChampionshipPlayerRegistration[]>(res);
  },

  getTeamSquad: async (teamId: number): Promise<ChampionshipSquadPlayer[]> => {
    const res = await fetchClient<any>(`/api/tournament/team-championship/registrations/squad/${teamId}`);
    return unwrap<ChampionshipSquadPlayer[]>(res);
  },

  getSquadAudit: async (teamId: number, championshipId: number): Promise<TeamSquadAudit> => {
    const res = await fetchClient<any>(`/api/tournament/team-championship/registrations/squad/${teamId}/audit/${championshipId}`);
    return unwrap<TeamSquadAudit>(res);
  },

  updateTeamPayment: async (teamId: number, status: string): Promise<ChampionshipTeamRegistration> => {
    const res = await fetchClient<any>(`/api/tournament/team-championship/registrations/teams/${teamId}/payment-status?status=${status}`, {
      method: 'POST',
    });
    return unwrap<ChampionshipTeamRegistration>(res);
  },

  updatePlayerPayment: async (playerId: number, status: string): Promise<ChampionshipPlayerRegistration> => {
    const res = await fetchClient<any>(`/api/tournament/team-championship/registrations/players/${playerId}/payment-status?status=${status}`, {
      method: 'POST',
    });
    return unwrap<ChampionshipPlayerRegistration>(res);
  },

  generatePoolFixtures: async (championshipId: number, numberOfPools = 1): Promise<TeamChampionshipFixture[]> => {
    const res = await fetchClient<any>(`/api/tournament/team-championship/fixtures/generate-pools?championshipId=${championshipId}&numberOfPools=${numberOfPools}`, {
      method: 'POST',
    });
    return unwrap<TeamChampionshipFixture[]>(res);
  },

  getFixtures: async (championshipUuid: string): Promise<TeamChampionshipFixture[]> => {
    const res = await fetchClient<any>(`/api/tournament/team-championship/fixtures/championship/${championshipUuid}`);
    return unwrap<TeamChampionshipFixture[]>(res);
  },

  getSubMatches: async (fixtureId: number): Promise<TeamChampionshipSubMatch[]> => {
    const res = await fetchClient<any>(`/api/tournament/team-championship/fixtures/${fixtureId}/sub-matches`);
    return unwrap<TeamChampionshipSubMatch[]>(res);
  },

  getPools: async (championshipUuid: string): Promise<TeamChampionshipPool[]> => {
    const res = await fetchClient<any>(`/api/tournament/team-championship/fixtures/pools/${championshipUuid}`);
    return unwrap<TeamChampionshipPool[]>(res);
  },

  submitLineup: async (data: any): Promise<any> => {
    const res = await fetchClient<any>('/api/tournament/team-championship/lineups/submit', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return unwrap<any>(res);
  },

  approveLineup: async (lineupId: number): Promise<any> => {
    const res = await fetchClient<any>(`/api/tournament/team-championship/lineups/${lineupId}/approve`, {
      method: 'POST',
    });
    return unwrap<any>(res);
  },

  rejectLineup: async (lineupId: number, reason: string): Promise<any> => {
    const res = await fetchClient<any>(`/api/tournament/team-championship/lineups/${lineupId}/reject?reason=${encodeURIComponent(reason)}`, {
      method: 'POST',
    });
    return unwrap<any>(res);
  },

  recordToss: async (data: any): Promise<any> => {
    const res = await fetchClient<any>('/api/tournament/team-championship/lineups/toss', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return unwrap<any>(res);
  },

  recordSubstitution: async (data: any): Promise<any> => {
    const res = await fetchClient<any>('/api/tournament/team-championship/lineups/substitutions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return unwrap<any>(res);
  },

  getFixtureDetail: async (fixtureId: number, isOrganizer = false): Promise<any> => {
    const res = await fetchClient<any>(`/api/tournament/team-championship/lineups/fixture/${fixtureId}?isOrganizer=${isOrganizer}`);
    return unwrap<any>(res);
  },

  getLineupsForFixture: async (fixtureId: number): Promise<any[]> => {
    const res = await fetchClient<any[]>(`/api/tournament/team-championship/lineups/fixture/${fixtureId}/list`);
    return unwrap<any[]>(res);
  },
};
