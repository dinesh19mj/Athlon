package com.athlon.tournamentservice.drawengine.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "pool_teams")
public class PoolTeam {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "poolteamid", updatable = false, nullable = false)
    private Long poolTeamId;

    @Column(name = "poolteamuuid", updatable = false, nullable = false, unique = true)
    private UUID poolTeamUuid;

    @Column(name = "poolid", nullable = false)
    private Long poolId;

    @Column(name = "registrationid", nullable = false)
    private Long registrationId;

    @Column(name = "createdon", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public PoolTeam() {
    }

    public PoolTeam(Long poolId, Long registrationId) {
        this.poolId = poolId;
        this.registrationId = registrationId;
    }

    @PrePersist
    protected void onCreate() {
        if (this.poolTeamUuid == null) {
            this.poolTeamUuid = UUID.randomUUID();
        }
        this.createdAt = LocalDateTime.now();
    }

    public Long getPoolTeamId() { return poolTeamId; }
    public void setPoolTeamId(Long poolTeamId) { this.poolTeamId = poolTeamId; }
    
    public UUID getPoolTeamUuid() { return poolTeamUuid; }
    public void setPoolTeamUuid(UUID poolTeamUuid) { this.poolTeamUuid = poolTeamUuid; }

    public Long getPoolId() { return poolId; }
    public void setPoolId(Long poolId) { this.poolId = poolId; }

    public Long getRegistrationId() { return registrationId; }
    public void setRegistrationId(Long registrationId) { this.registrationId = registrationId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        PoolTeam poolTeam = (PoolTeam) o;
        return Objects.equals(poolTeamId, poolTeam.poolTeamId) && Objects.equals(poolTeamUuid, poolTeam.poolTeamUuid);
    }

    @Override
    public int hashCode() {
        return Objects.hash(poolTeamId, poolTeamUuid);
    }
}
