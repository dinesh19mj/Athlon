package com.athlon.tournamentservice.teamchampionship.dto.request;

public class ChampionshipRulesDTO {
    private Integer minSquadSize;
    private Integer maxSquadSize;
    private Boolean everyPlayerMustPlayLeague;
    private Boolean allowSubstitutions;

    // League Stage Rules
    private String leagueMatchFormat; // "PLAY_ALL", "BEST_OF_N"
    private Integer leagueWinPoints;
    private Integer leagueDrawPoints;
    private Integer leagueLossPoints;
    private Integer leagueLineupDeadlineMinutes;
    private String leagueTossOrderRule; // "ORGANIZER_DEFINED", "TEAM_PREFERENCE_PLUS_TOSS"
    private String leagueLineupRevealPolicy; // "SIMULTANEOUS_REVEAL", "AFTER_APPROVAL"
    private Integer leagueMaxSubstitutions;

    // Knockout Stage Rules
    private String knockoutMatchFormat; // "PLAY_ALL", "BEST_OF_N"
    private Integer knockoutLineupDeadlineMinutes;
    private String knockoutTossOrderRule; // "ORGANIZER_DEFINED", "TEAM_PREFERENCE_PLUS_TOSS"
    private String knockoutLineupRevealPolicy; // "SIMULTANEOUS_REVEAL", "AFTER_APPROVAL"
    private Integer knockoutMaxSubstitutions;

    // Legacy fallback fields
    private Integer lineupDeadlineMinutes;
    private String tossOrderRule;
    private String lineupRevealPolicy;
    private Integer maxSubstitutionsPerFixture;

    public ChampionshipRulesDTO() {}

    public Integer getMinSquadSize() { return minSquadSize; }
    public void setMinSquadSize(Integer minSquadSize) { this.minSquadSize = minSquadSize; }

    public Integer getMaxSquadSize() { return maxSquadSize; }
    public void setMaxSquadSize(Integer maxSquadSize) { this.maxSquadSize = maxSquadSize; }

    public Boolean getEveryPlayerMustPlayLeague() { return everyPlayerMustPlayLeague; }
    public void setEveryPlayerMustPlayLeague(Boolean everyPlayerMustPlayLeague) { this.everyPlayerMustPlayLeague = everyPlayerMustPlayLeague; }

    public Boolean getAllowSubstitutions() { return allowSubstitutions; }
    public void setAllowSubstitutions(Boolean allowSubstitutions) { this.allowSubstitutions = allowSubstitutions; }

    public String getLeagueMatchFormat() { return leagueMatchFormat; }
    public void setLeagueMatchFormat(String leagueMatchFormat) { this.leagueMatchFormat = leagueMatchFormat; }

    public Integer getLeagueWinPoints() { return leagueWinPoints; }
    public void setLeagueWinPoints(Integer leagueWinPoints) { this.leagueWinPoints = leagueWinPoints; }

    public Integer getLeagueDrawPoints() { return leagueDrawPoints; }
    public void setLeagueDrawPoints(Integer leagueDrawPoints) { this.leagueDrawPoints = leagueDrawPoints; }

    public Integer getLeagueLossPoints() { return leagueLossPoints; }
    public void setLeagueLossPoints(Integer leagueLossPoints) { this.leagueLossPoints = leagueLossPoints; }

    public Integer getLeagueLineupDeadlineMinutes() { return leagueLineupDeadlineMinutes != null ? leagueLineupDeadlineMinutes : lineupDeadlineMinutes; }
    public void setLeagueLineupDeadlineMinutes(Integer leagueLineupDeadlineMinutes) { this.leagueLineupDeadlineMinutes = leagueLineupDeadlineMinutes; }

    public String getLeagueTossOrderRule() { return leagueTossOrderRule != null ? leagueTossOrderRule : tossOrderRule; }
    public void setLeagueTossOrderRule(String leagueTossOrderRule) { this.leagueTossOrderRule = leagueTossOrderRule; }

    public String getLeagueLineupRevealPolicy() { return leagueLineupRevealPolicy != null ? leagueLineupRevealPolicy : lineupRevealPolicy; }
    public void setLeagueLineupRevealPolicy(String leagueLineupRevealPolicy) { this.leagueLineupRevealPolicy = leagueLineupRevealPolicy; }

    public Integer getLeagueMaxSubstitutions() { return leagueMaxSubstitutions != null ? leagueMaxSubstitutions : maxSubstitutionsPerFixture; }
    public void setLeagueMaxSubstitutions(Integer leagueMaxSubstitutions) { this.leagueMaxSubstitutions = leagueMaxSubstitutions; }

    public String getKnockoutMatchFormat() { return knockoutMatchFormat; }
    public void setKnockoutMatchFormat(String knockoutMatchFormat) { this.knockoutMatchFormat = knockoutMatchFormat; }

    public Integer getKnockoutLineupDeadlineMinutes() { return knockoutLineupDeadlineMinutes != null ? knockoutLineupDeadlineMinutes : lineupDeadlineMinutes; }
    public void setKnockoutLineupDeadlineMinutes(Integer knockoutLineupDeadlineMinutes) { this.knockoutLineupDeadlineMinutes = knockoutLineupDeadlineMinutes; }

    public String getKnockoutTossOrderRule() { return knockoutTossOrderRule != null ? knockoutTossOrderRule : tossOrderRule; }
    public void setKnockoutTossOrderRule(String knockoutTossOrderRule) { this.knockoutTossOrderRule = knockoutTossOrderRule; }

    public String getKnockoutLineupRevealPolicy() { return knockoutLineupRevealPolicy != null ? knockoutLineupRevealPolicy : lineupRevealPolicy; }
    public void setKnockoutLineupRevealPolicy(String knockoutLineupRevealPolicy) { this.knockoutLineupRevealPolicy = knockoutLineupRevealPolicy; }

    public Integer getKnockoutMaxSubstitutions() { return knockoutMaxSubstitutions != null ? knockoutMaxSubstitutions : maxSubstitutionsPerFixture; }
    public void setKnockoutMaxSubstitutions(Integer knockoutMaxSubstitutions) { this.knockoutMaxSubstitutions = knockoutMaxSubstitutions; }

    public Integer getLineupDeadlineMinutes() { return lineupDeadlineMinutes; }
    public void setLineupDeadlineMinutes(Integer lineupDeadlineMinutes) { this.lineupDeadlineMinutes = lineupDeadlineMinutes; }

    public String getTossOrderRule() { return tossOrderRule; }
    public void setTossOrderRule(String tossOrderRule) { this.tossOrderRule = tossOrderRule; }

    public String getLineupRevealPolicy() { return lineupRevealPolicy; }
    public void setLineupRevealPolicy(String lineupRevealPolicy) { this.lineupRevealPolicy = lineupRevealPolicy; }

    public Integer getMaxSubstitutionsPerFixture() { return maxSubstitutionsPerFixture; }
    public void setMaxSubstitutionsPerFixture(Integer maxSubstitutionsPerFixture) { this.maxSubstitutionsPerFixture = maxSubstitutionsPerFixture; }
}
