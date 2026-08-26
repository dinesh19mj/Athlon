package com.athlon.tournamentservice.teamchampionship.dto.response;

import com.athlon.tournamentservice.teamchampionship.entity.ChampionshipSquad;
import java.util.List;

public class TeamSquadResponseDTO {
    private Long teamId;
    private String teamUuid;
    private String teamName;
    private String logoUrl;
    private String captainName;
    private Integer squadCapacity;
    private Integer playersCount;
    private List<ChampionshipSquad> players;
    private Boolean everyPlayerHasPlayedLeague;
    private List<String> unplayedPlayers;

    public TeamSquadResponseDTO() {}

    public Long getTeamId() { return teamId; }
    public void setTeamId(Long teamId) { this.teamId = teamId; }

    public String getTeamUuid() { return teamUuid; }
    public void setTeamUuid(String teamUuid) { this.teamUuid = teamUuid; }

    public String getTeamName() { return teamName; }
    public void setTeamName(String teamName) { this.teamName = teamName; }

    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }

    public String getCaptainName() { return captainName; }
    public void setCaptainName(String captainName) { this.captainName = captainName; }

    public Integer getSquadCapacity() { return squadCapacity; }
    public void setSquadCapacity(Integer squadCapacity) { this.squadCapacity = squadCapacity; }

    public Integer getPlayersCount() { return playersCount; }
    public void setPlayersCount(Integer playersCount) { this.playersCount = playersCount; }

    public List<ChampionshipSquad> getPlayers() { return players; }
    public void setPlayers(List<ChampionshipSquad> players) { this.players = players; }

    public Boolean getEveryPlayerHasPlayedLeague() { return everyPlayerHasPlayedLeague; }
    public void setEveryPlayerHasPlayedLeague(Boolean everyPlayerHasPlayedLeague) { this.everyPlayerHasPlayedLeague = everyPlayerHasPlayedLeague; }

    public List<String> getUnplayedPlayers() { return unplayedPlayers; }
    public void setUnplayedPlayers(List<String> unplayedPlayers) { this.unplayedPlayers = unplayedPlayers; }
}
