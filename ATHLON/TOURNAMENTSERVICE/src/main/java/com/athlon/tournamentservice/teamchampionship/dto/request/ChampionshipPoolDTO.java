package com.athlon.tournamentservice.teamchampionship.dto.request;

public class ChampionshipPoolDTO {
    private String poolName;
    private String stage; // "LEAGUE", "SUPER_LEAGUE"
    private Integer qualifiersCount;

    public ChampionshipPoolDTO() {}

    public ChampionshipPoolDTO(String poolName, Integer qualifiersCount) {
        this.poolName = poolName;
        this.stage = "LEAGUE";
        this.qualifiersCount = qualifiersCount;
    }

    public String getPoolName() {
        return poolName;
    }

    public void setPoolName(String poolName) {
        this.poolName = poolName;
    }

    public String getStage() {
        return stage;
    }

    public void setStage(String stage) {
        this.stage = stage;
    }

    public Integer getQualifiersCount() {
        return qualifiersCount;
    }

    public void setQualifiersCount(Integer qualifiersCount) {
        this.qualifiersCount = qualifiersCount;
    }
}
