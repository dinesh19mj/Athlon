package com.athlon.tournamentservice.dto.request;

import java.util.List;
import java.util.UUID;

public class PooledKnockoutDrawRequest {
    private String categoryName;
    private Long categoryId;
    private int qualifiersPerPool = 2; // Default 2 teams per pool
    private List<PoolAssignmentDTO> pools;

    public static class PoolAssignmentDTO {
        private String poolName;
        private List<UUID> registrationUuids;

        public String getPoolName() { return poolName; }
        public void setPoolName(String poolName) { this.poolName = poolName; }
        public List<UUID> getRegistrationUuids() { return registrationUuids; }
        public void setRegistrationUuids(List<UUID> registrationUuids) { this.registrationUuids = registrationUuids; }
    }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public int getQualifiersPerPool() { return qualifiersPerPool; }
    public void setQualifiersPerPool(int qualifiersPerPool) { this.qualifiersPerPool = qualifiersPerPool; }
    public List<PoolAssignmentDTO> getPools() { return pools; }
    public void setPools(List<PoolAssignmentDTO> pools) { this.pools = pools; }
}
