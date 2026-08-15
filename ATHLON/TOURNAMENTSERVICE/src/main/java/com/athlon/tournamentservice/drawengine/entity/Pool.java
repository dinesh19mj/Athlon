package com.athlon.tournamentservice.drawengine.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "pools")
public class Pool {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "poolid", updatable = false, nullable = false)
    private Long poolId;

    @Column(name = "pooluuid", updatable = false, nullable = false, unique = true)
    private UUID poolUuid;

    @Column(name = "drawid", nullable = false)
    private Long drawId;

    @Column(name = "poolname", nullable = false)
    private String poolName; // Pool A, Pool B, etc.

    @Column(name = "poolcapacity")
    private Integer poolCapacity;

    @Column(name = "isactive", nullable = false)
    private boolean isActive = true;

    @Column(name = "createdon", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "modifiedon")
    private LocalDateTime updatedAt;

    @Column(name = "createdby")
    private Long createdBy;

    @Column(name = "modifiedby")
    private Long updatedBy;

    public Pool() {
    }

    public Pool(Long drawId, String poolName, Integer poolCapacity, Long createdBy) {
        this.drawId = drawId;
        this.poolName = poolName;
        this.poolCapacity = poolCapacity;
        this.createdBy = createdBy;
    }

    @PrePersist
    protected void onCreate() {
        if (this.poolUuid == null) {
            this.poolUuid = UUID.randomUUID();
        }
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getPoolId() { return poolId; }
    public void setPoolId(Long poolId) { this.poolId = poolId; }
    public UUID getPoolUuid() { return poolUuid; }
    public void setPoolUuid(UUID poolUuid) { this.poolUuid = poolUuid; }
    public Long getDrawId() { return drawId; }
    public void setDrawId(Long drawId) { this.drawId = drawId; }
    public String getPoolName() { return poolName; }
    public void setPoolName(String poolName) { this.poolName = poolName; }
    public Integer getPoolCapacity() { return poolCapacity; }
    public void setPoolCapacity(Integer poolCapacity) { this.poolCapacity = poolCapacity; }
    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public Long getCreatedBy() { return createdBy; }
    public void setCreatedBy(Long createdBy) { this.createdBy = createdBy; }
    public Long getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(Long updatedBy) { this.updatedBy = updatedBy; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Pool pool = (Pool) o;
        return Objects.equals(poolId, pool.poolId) && Objects.equals(poolUuid, pool.poolUuid);
    }

    @Override
    public int hashCode() {
        return Objects.hash(poolId, poolUuid);
    }
}
