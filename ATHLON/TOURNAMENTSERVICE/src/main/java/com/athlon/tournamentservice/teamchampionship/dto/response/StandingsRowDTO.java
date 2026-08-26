package com.athlon.tournamentservice.teamchampionship.dto.response;

public class StandingsRowDTO {
    private Long teamId;
    private String teamName;
    private String logoUrl;
    private Long poolId;
    private String poolName;
    private Integer played = 0;
    private Integer won = 0;
    private Integer lost = 0;
    private Integer ties = 0;
    private Integer points = 0;
    private Integer subMatchesWon = 0;
    private Integer subMatchesLost = 0;
    private Integer subMatchDiff = 0;
    private Integer rank = 0;
    private Boolean isQualified = false;

    public StandingsRowDTO() {}

    public Long getTeamId() { return teamId; }
    public void setTeamId(Long teamId) { this.teamId = teamId; }

    public String getTeamName() { return teamName; }
    public void setTeamName(String teamName) { this.teamName = teamName; }

    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }

    public Long getPoolId() { return poolId; }
    public void setPoolId(Long poolId) { this.poolId = poolId; }

    public String getPoolName() { return poolName; }
    public void setPoolName(String poolName) { this.poolName = poolName; }

    public Integer getPlayed() { return played; }
    public void setPlayed(Integer played) { this.played = played; }

    public Integer getWon() { return won; }
    public void setWon(Integer won) { this.won = won; }

    public Integer getLost() { return lost; }
    public void setLost(Integer lost) { this.lost = lost; }

    public Integer getTies() { return ties; }
    public void setTies(Integer ties) { this.ties = ties; }

    public Integer getPoints() { return points; }
    public void setPoints(Integer points) { this.points = points; }

    public Integer getSubMatchesWon() { return subMatchesWon; }
    public void setSubMatchesWon(Integer subMatchesWon) { this.subMatchesWon = subMatchesWon; }

    public Integer getSubMatchesLost() { return subMatchesLost; }
    public void setSubMatchesLost(Integer subMatchesLost) { this.subMatchesLost = subMatchesLost; }

    public Integer getSubMatchDiff() { return subMatchDiff; }
    public void setSubMatchDiff(Integer subMatchDiff) { this.subMatchDiff = subMatchDiff; }

    public Integer getRank() { return rank; }
    public void setRank(Integer rank) { this.rank = rank; }

    public Boolean getIsQualified() { return isQualified; }
    public void setIsQualified(Boolean qualified) { isQualified = qualified; }
}
