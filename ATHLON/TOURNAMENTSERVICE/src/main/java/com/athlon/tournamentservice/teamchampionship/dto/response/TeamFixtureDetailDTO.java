package com.athlon.tournamentservice.teamchampionship.dto.response;

import com.athlon.tournamentservice.teamchampionship.entity.TeamChampionshipFixture;
import com.athlon.tournamentservice.teamchampionship.entity.TeamChampionshipSubMatch;
import com.athlon.tournamentservice.teamchampionship.entity.TeamChampionshipToss;
import java.util.List;

public class TeamFixtureDetailDTO {
    private TeamChampionshipFixture fixture;
    private List<TeamChampionshipSubMatch> subMatches;
    private TeamChampionshipToss toss;
    private Boolean teamALineupSubmitted;
    private Boolean teamBLineupSubmitted;
    private Boolean lineupsRevealed;

    public TeamFixtureDetailDTO() {}

    public TeamChampionshipFixture getFixture() { return fixture; }
    public void setFixture(TeamChampionshipFixture fixture) { this.fixture = fixture; }

    public List<TeamChampionshipSubMatch> getSubMatches() { return subMatches; }
    public void setSubMatches(List<TeamChampionshipSubMatch> subMatches) { this.subMatches = subMatches; }

    public TeamChampionshipToss getToss() { return toss; }
    public void setToss(TeamChampionshipToss toss) { this.toss = toss; }

    public Boolean getTeamALineupSubmitted() { return teamALineupSubmitted; }
    public void setTeamALineupSubmitted(Boolean teamALineupSubmitted) { this.teamALineupSubmitted = teamALineupSubmitted; }

    public Boolean getTeamBLineupSubmitted() { return teamBLineupSubmitted; }
    public void setTeamBLineupSubmitted(Boolean teamBLineupSubmitted) { this.teamBLineupSubmitted = teamBLineupSubmitted; }

    public Boolean getLineupsRevealed() { return lineupsRevealed; }
    public void setLineupsRevealed(Boolean lineupsRevealed) { this.lineupsRevealed = lineupsRevealed; }
}
