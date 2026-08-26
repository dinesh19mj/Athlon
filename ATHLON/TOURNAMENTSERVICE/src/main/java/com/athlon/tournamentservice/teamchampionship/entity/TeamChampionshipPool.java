package com.athlon.tournamentservice.teamchampionship.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "team_championship_pools")
public class TeamChampionshipPool {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "pool_id", updatable = false, nullable = false)
    private Long poolId;

    @Column(name = "pool_uuid", updatable = false, nullable = false, unique = true)
    private UUID poolUuid;

    @Column(name = "championship_id", nullable = false)
    private Long championshipId;

    @Column(name = "championship_uuid", nullable = false)
    private UUID championshipUuid;

    @Column(name = "pool_name", nullable = false)
    private String poolName; // e.g. "Pool A", "Pool B"

    @Column(name = "stage")
    private String stage = "LEAGUE"; // "LEAGUE", "SUPER_LEAGUE"

    @Column(name = "qualifiers_count")
    private Integer qualifiersCount = 2;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (this.poolUuid == null) {
            this.poolUuid = UUID.randomUUID();
        }
        if (this.stage == null) this.stage = "LEAGUE";
        if (this.qualifiersCount == null) this.qualifiersCount = 2;
    }

    public TeamChampionshipPool() {}

    public Long getPoolId() {
        return poolId;
    }

    public void setPoolId(Long poolId) {
        this.poolId = poolId;
    }

    public UUID getPoolUuid() {
        return poolUuid;
    }

    public void setPoolUuid(UUID poolUuid) {
        this.poolUuid = poolUuid;
    }

    public Long getChampionshipId() {
        return championshipId;
    }

    public void setChampionshipId(Long championshipId) {
        this.championshipId = championshipId;
    }

    public UUID getChampionshipUuid() {
        return championshipUuid;
    }

    public void setChampionshipUuid(UUID championshipUuid) {
        this.championshipUuid = championshipUuid;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
