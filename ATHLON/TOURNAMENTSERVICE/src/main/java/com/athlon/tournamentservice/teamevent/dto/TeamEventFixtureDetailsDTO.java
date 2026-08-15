package com.athlon.tournamentservice.teamevent.dto;

import com.athlon.tournamentservice.teamevent.entity.TeamEventCategoryMatch;
import com.athlon.tournamentservice.teamevent.entity.TeamEventLineup;
import com.athlon.tournamentservice.teamevent.entity.TeamEventLineupPlayer;

import java.util.List;

public class TeamEventFixtureDetailsDTO {
    private Long fixtureMatchId;
    private List<TeamEventCategoryMatch> categoryMatches;
    private TeamEventLineup teamALineup;
    private List<TeamEventLineupPlayer> teamALineupPlayers;
    private TeamEventLineup teamBLineup;
    private List<TeamEventLineupPlayer> teamBLineupPlayers;

    public TeamEventFixtureDetailsDTO() {}

    public Long getFixtureMatchId() { return fixtureMatchId; }
    public void setFixtureMatchId(Long fixtureMatchId) { this.fixtureMatchId = fixtureMatchId; }

    public List<TeamEventCategoryMatch> getCategoryMatches() { return categoryMatches; }
    public void setCategoryMatches(List<TeamEventCategoryMatch> categoryMatches) { this.categoryMatches = categoryMatches; }

    public TeamEventLineup getTeamALineup() { return teamALineup; }
    public void setTeamALineup(TeamEventLineup teamALineup) { this.teamALineup = teamALineup; }

    public List<TeamEventLineupPlayer> getTeamALineupPlayers() { return teamALineupPlayers; }
    public void setTeamALineupPlayers(List<TeamEventLineupPlayer> teamALineupPlayers) { this.teamALineupPlayers = teamALineupPlayers; }

    public TeamEventLineup getTeamBLineup() { return teamBLineup; }
    public void setTeamBLineup(TeamEventLineup teamBLineup) { this.teamBLineup = teamBLineup; }

    public List<TeamEventLineupPlayer> getTeamBLineupPlayers() { return teamBLineupPlayers; }
    public void setTeamBLineupPlayers(List<TeamEventLineupPlayer> teamBLineupPlayers) { this.teamBLineupPlayers = teamBLineupPlayers; }
}
