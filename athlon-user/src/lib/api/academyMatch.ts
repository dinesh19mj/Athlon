import { api } from './client';
import { ApiResponse } from './user';

export type MatchStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type MatchType = 'SINGLES' | 'DOUBLES' | 'SPARRING' | 'PRACTICE' | 'LEAGUE' | string;

export interface AcademyMatch {
  matchUuid: string;
  matchId?: number;
  organizationUuid: string;
  organizationId?: number;
  matchTitle?: string;
  sportType: string;
  matchType: MatchType;
  batchUuid?: string;
  batchName?: string;
  courtUuid?: string;
  courtName?: string;
  coachUuid?: string;
  coachName?: string;
  matchDate: string; // YYYY-MM-DD
  matchTime?: string; // HH:mm
  status: MatchStatus;

  // Team 1
  player1Uuid?: string;
  player1Name: string;
  player2Uuid?: string;
  player2Name?: string;
  team1Score?: number;

  // Team 2
  player3Uuid?: string;
  player3Name: string;
  player4Uuid?: string;
  player4Name?: string;
  team2Score?: number;

  // Results
  winnerTeam?: number; // 1 or 2
  winnerName?: string;
  scoresDetail?: string; // e.g. "21-18, 19-21, 21-15"
  refereeName?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAcademyMatchPayload {
  organizationUuid: string;
  matchTitle?: string;
  sportType: string;
  matchType?: MatchType;
  batchUuid?: string;
  batchName?: string;
  courtUuid?: string;
  courtName?: string;
  coachUuid?: string;
  coachName?: string;
  matchDate: string; // YYYY-MM-DD
  matchTime?: string;
  status?: MatchStatus;

  // Team 1
  player1Uuid?: string;
  player1Name: string;
  player2Uuid?: string;
  player2Name?: string;

  // Team 2
  player3Uuid?: string;
  player3Name: string;
  player4Uuid?: string;
  player4Name?: string;

  // Scores & Winner
  team1Score?: number;
  team2Score?: number;
  scoresDetail?: string;
  winnerTeam?: number;
  winnerName?: string;

  notes?: string;
}

export interface UpdateAcademyMatchScorePayload {
  team1Score?: number;
  team2Score?: number;
  scoresDetail?: string;
  winnerTeam?: number;
  winnerName?: string;
  status?: MatchStatus;
  notes?: string;
}

export const AcademyMatchService = {
  // Get matches with optional filters
  getMatches: (
    orgUuid: string,
    status?: string,
    sportType?: string,
    batchUuid?: string
  ) => {
    let url = `/api/identity/academy/matches/org/${orgUuid}?`;
    const params: string[] = [];
    if (status && status !== 'ALL') params.push(`status=${encodeURIComponent(status)}`);
    if (sportType && sportType !== 'ALL') params.push(`sportType=${encodeURIComponent(sportType)}`);
    if (batchUuid && batchUuid !== 'ALL') params.push(`batchUuid=${encodeURIComponent(batchUuid)}`);
    url += params.join('&');
    return api.get<ApiResponse<AcademyMatch[]>>(url);
  },

  // Get single match by UUID
  getMatchByUuid: (matchUuid: string) => {
    return api.get<ApiResponse<AcademyMatch>>(`/api/identity/academy/matches/${matchUuid}`);
  },

  // Create match
  createMatch: (payload: CreateAcademyMatchPayload) => {
    return api.post<ApiResponse<AcademyMatch>>('/api/identity/academy/matches/create', payload);
  },

  // Update score & winner
  updateScore: (matchUuid: string, payload: UpdateAcademyMatchScorePayload) => {
    return api.post<ApiResponse<AcademyMatch>>(`/api/identity/academy/matches/update-score/${matchUuid}`, payload);
  },

  // Delete match
  deleteMatch: (matchUuid: string) => {
    return api.post<ApiResponse<void>>(`/api/identity/academy/matches/delete/${matchUuid}`, {});
  },
};
