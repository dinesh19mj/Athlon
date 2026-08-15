package com.athlon.tournamentservice.dto.request;

import java.util.List;
import java.util.UUID;

public class LeagueDrawRequest {
    private String drawType; // LEAGUE
    private List<PoolAssignmentDTO> pools;

    public String getDrawType() {
        return drawType;
    }

    public void setDrawType(String drawType) {
        this.drawType = drawType;
    }

    public List<PoolAssignmentDTO> getPools() {
        return pools;
    }

    public void setPools(List<PoolAssignmentDTO> pools) {
        this.pools = pools;
    }

    public static class PoolAssignmentDTO {
        private String poolName;
        private int capacity;
        private int qualifiers;
        private List<UUID> teamUuids;

        public String getPoolName() {
            return poolName;
        }

        public void setPoolName(String poolName) {
            this.poolName = poolName;
        }

        public int getCapacity() {
            return capacity;
        }

        public void setCapacity(int capacity) {
            this.capacity = capacity;
        }

        public int getQualifiers() {
            return qualifiers;
        }

        public void setQualifiers(int qualifiers) {
            this.qualifiers = qualifiers;
        }

        public List<UUID> getTeamUuids() {
            return teamUuids;
        }

        public void setTeamUuids(List<UUID> teamUuids) {
            this.teamUuids = teamUuids;
        }
    }
}
