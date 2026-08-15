import { api } from './client';

export interface TeamEventCategoryMatch {
    id: number;
    parentMatchId: number;
    tournamentId: number;
    teamEventCategoryId: number;
    categoryName: string;
    matchFormat: string;
    playersRequired: number;
    displayOrder: number;
    status: string;
    winnerRegistrationId: number | null;
}

export interface TeamEventFixtureDetails {
    fixtureMatchId: number;
    categoryMatches: TeamEventCategoryMatch[];
    teamALineup?: TeamEventLineup;
    teamALineupPlayers?: TeamEventLineupPlayer[];
    teamBLineup?: TeamEventLineup;
    teamBLineupPlayers?: TeamEventLineupPlayer[];
}

export interface TeamEventLineupPlayer {
  id: number;
  uuid: string;
  teamEventLineupId: number;
  teamEventCategoryId: number | null;
  playerRegistrationId: number;
  playerName?: string;
  photoUrl?: string;
  position: number;
  isSubstitute: boolean;
}

export interface TeamEventLineup {
    id: number;
    fixtureMatchId: number;
    teamRegistrationId: number;
    submittedBy: number;
    submittedAt: string;
    status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'LOCKED';
    approvedBy?: number;
    approvedAt?: string;
    players: TeamEventLineupPlayer[];
}

export const TeamEventService = {
    getFixtureDetails: async (fixtureMatchId: number): Promise<TeamEventFixtureDetails> => {
        const response = await api.get(`/api/tournament/team-events/fixture/${fixtureMatchId}/details`);
        return (response as any).data;
    },

    submitLineup: async (
        fixtureMatchId: number, 
        teamRegistrationId: number, 
        players: TeamEventLineupPlayer[],
        submittedBy: number
    ): Promise<TeamEventLineup> => {
        const response = await api.post(
            `/api/tournament/team-events/lineup/submit/${fixtureMatchId}/${teamRegistrationId}?submittedBy=${submittedBy}`,
            players
        );
        return (response as any).data;
    },

    approveLineup: async (lineupId: number, approvedBy: number): Promise<TeamEventLineup> => {
        const response = await api.post(`/api/tournament/team-events/lineup/approve/${lineupId}?approvedBy=${approvedBy}`, {});
        return (response as any).data;
    },

    rejectLineup: async (lineupId: number, reason: string): Promise<TeamEventLineup> => {
        const response = await api.post(`/api/tournament/team-events/lineup/reject/${lineupId}`, { reason });
        return (response as any).data;
    },

    submitCategoryScore: async (categoryMatchId: number, winnerRegistrationId: number | null, score: string): Promise<void> => {
        await api.post(`/api/tournament/team-events/scoring/category/${categoryMatchId}`, {
            winnerRegistrationId,
            score
        });
    },

    scoreCategory: async (fixtureMatchId: number, categoryId: number, payload: any): Promise<any> => {
        const response = await api.post(`/api/tournament/team-events/fixture/${fixtureMatchId}/category/${categoryId}/score`, payload);
        return (response as any).data;
    }
};
