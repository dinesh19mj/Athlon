package com.athlon.tournamentservice.dto.response;

import java.util.UUID;

public class PoolStandingDTO {
    private Long poolId;
    private String poolName;
    private UUID teamUuid;
    private String teamName;
    private int played;
    private int won;
    private int lost;
    private int points;
    private int rank;

    public Long getPoolId() { return poolId; }
    public void setPoolId(Long poolId) { this.poolId = poolId; }

    public String getPoolName() { return poolName; }
    public void setPoolName(String poolName) { this.poolName = poolName; }

    public UUID getTeamUuid() { return teamUuid; }
    public void setTeamUuid(UUID teamUuid) { this.teamUuid = teamUuid; }

    public String getTeamName() { return teamName; }
    public void setTeamName(String teamName) { this.teamName = teamName; }

    public int getPlayed() { return played; }
    public void setPlayed(int played) { this.played = played; }

    public int getWon() { return won; }
    public void setWon(int won) { this.won = won; }

    public int getLost() { return lost; }
    public void setLost(int lost) { this.lost = lost; }

    public int getPoints() { return points; }
    public void setPoints(int points) { this.points = points; }

    public int getRank() { return rank; }
    public void setRank(int rank) { this.rank = rank; }
}
