package com.athlon.tournamentservice.ranking.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "rankings")
public class Ranking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "rankingid", updatable = false, nullable = false)
    private Long id;

    @Column(name = "rankinguuid", updatable = false, nullable = false, unique = true)
    private UUID uuid;

    @Column(name = "categoryid", nullable = false)
    private Long categoryId;

    @Column(name = "categoryuuid", nullable = false)
    private UUID categoryUuid;

    @Column(name = "playerid")
    private Long playerId;

    @Column(name = "playeruuid")
    private UUID playerUuid;

    @Column(name = "rankposition", nullable = false)
    private Integer rankPosition;

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

    public Ranking() {
    }

    public Ranking(Long categoryId, UUID categoryUuid, Long playerId, UUID playerUuid, Integer rankPosition, Long createdBy) {
        this.categoryId = categoryId;
        this.categoryUuid = categoryUuid;
        this.playerId = playerId;
        this.playerUuid = playerUuid;
        this.rankPosition = rankPosition;
        this.createdBy = createdBy;
    }

    @PrePersist
    protected void onCreate() {
        if (this.uuid == null) {
            this.uuid = UUID.randomUUID();
        }
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public UUID getUuid() { return uuid; }
    public void setUuid(UUID uuid) { this.uuid = uuid; }
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public UUID getCategoryUuid() { return categoryUuid; }
    public void setCategoryUuid(UUID categoryUuid) { this.categoryUuid = categoryUuid; }
    public Long getPlayerId() { return playerId; }
    public void setPlayerId(Long playerId) { this.playerId = playerId; }
    public UUID getPlayerUuid() { return playerUuid; }
    public void setPlayerUuid(UUID playerUuid) { this.playerUuid = playerUuid; }
    public Integer getRankPosition() { return rankPosition; }
    public void setRankPosition(Integer rankPosition) { this.rankPosition = rankPosition; }
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
        Ranking ranking = (Ranking) o;
        return Objects.equals(id, ranking.id) && Objects.equals(uuid, ranking.uuid);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, uuid);
    }

    @Override
    public String toString() {
        return "Ranking{" +
                "id=" + id +
                ", uuid=" + uuid +
                ", categoryId=" + categoryId +
                ", playerId=" + playerId +
                ", rankPosition=" + rankPosition +
                ", isActive=" + isActive +
                '}';
    }
}

