import { Team, MatchCategory, Match } from '../core/types';
import { ValidationError } from '../core/errors';

export interface LineupAssignment {
  categoryId: string;
  playerIds: string[]; // 1 for singles, 2 for doubles
}

export interface TeamLineup {
  teamId: string;
  assignments: LineupAssignment[];
}

export const LineupEngine = {
  /**
   * Validates if a submitted line-up is valid for a team.
   * Checks for duplicate players (if not allowed) and reserve constraints.
   */
  validateLineup(team: Team, lineup: TeamLineup, categories: MatchCategory[], allowDuplicates: boolean = false): void {
    const usedPlayers = new Set<string>();

    for (const assignment of lineup.assignments) {
      const category = categories.find(c => c.id === assignment.categoryId);
      if (!category) {
        throw new ValidationError(`Invalid category ID: ${assignment.categoryId}`);
      }

      for (const playerId of assignment.playerIds) {
        if (!team.players.includes(playerId) && !team.reserves.includes(playerId)) {
          throw new ValidationError(`Player ${playerId} does not belong to team ${team.name}`);
        }

        if (!allowDuplicates && usedPlayers.has(playerId)) {
          throw new ValidationError(`Player ${playerId} is already assigned to another category in this match.`);
        }
        
        usedPlayers.add(playerId);
      }
    }
  },

  /**
   * Validates the "Require Every Player To Play" rule across all matches of a team.
   */
  validateAllPlayersPlayed(team: Team, allLineupsForTeam: TeamLineup[]): void {
    const playedPlayers = new Set<string>();

    for (const lineup of allLineupsForTeam) {
      for (const assignment of lineup.assignments) {
        for (const playerId of assignment.playerIds) {
          playedPlayers.add(playerId);
        }
      }
    }

    for (const playerId of team.players) {
      if (!playedPlayers.has(playerId)) {
        throw new ValidationError(`Player ${playerId} from team ${team.name} has not been assigned to any match.`);
      }
    }
  }
};
