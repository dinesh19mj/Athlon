import { Team, Pool, MatchCategory } from '../core/types';
import { LeagueEngine } from './league';
import { LineupEngine, TeamLineup } from './lineup';

export const TeamLeagueEngine = {
  /**
   * Generates team-level fixtures. (Uses the same logic as League for team pairings).
   */
  generateTeamLeague(teams: Team[], poolCount: number): Pool[] {
    // Generate standard round robin between teams
    return LeagueEngine.generateLeague(teams, poolCount);
  },

  /**
   * Validates a team's lineup based on the tournament configuration.
   * Throws an error if invalid.
   */
  submitLineup(team: Team, lineup: TeamLineup, categories: MatchCategory[], allowDuplicates: boolean = false): void {
      LineupEngine.validateLineup(team, lineup, categories, allowDuplicates);
      // In a full application, this function would also transition the lineup state in a database
  },

  /**
   * Final end-of-league validation before transitioning to knockout stage or publishing results.
   */
  validateTournamentCompletion(teams: Team[], allLineups: Record<string, TeamLineup[]>, requireEveryPlayerToPlay: boolean): void {
      if (!requireEveryPlayerToPlay) return;

      for (const team of teams) {
          const teamLineups = allLineups[team.id] || [];
          LineupEngine.validateAllPlayersPlayed(team, teamLineups);
      }
  }
};
