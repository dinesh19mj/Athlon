package com.athlon.tournament.score.entity;

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
@Table(name = "score_events", schema = "tournament")
public class ScoreEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false, nullable = false)
    private Long id;

    @Column(name = "uuid", updatable = false, nullable = false, unique = true)
    private UUID uuid;

    @Column(name = "score_id", nullable = false)
    private Long scoreId;

    @Column(name = "score_uuid", nullable = false)
    private UUID scoreUuid;

    @Column(name = "player_id")
    private Long playerId;

    @Column(name = "player_uuid")
    private UUID playerUuid;

    @Column(name = "event_type", nullable = false)
    private String eventType;

    @Column(name = "event_value")
    private String eventValue;

    @Column(name = "event_time", nullable = false)
    private LocalDateTime eventTime;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "updated_by")
    private Long updatedBy;

    public ScoreEvent() {
    }

    public ScoreEvent(Long scoreId, UUID scoreUuid, Long playerId, UUID playerUuid, String eventType, String eventValue, LocalDateTime eventTime, Long createdBy) {
        this.scoreId = scoreId;
        this.scoreUuid = scoreUuid;
        this.playerId = playerId;
        this.playerUuid = playerUuid;
        this.eventType = eventType;
        this.eventValue = eventValue;
        this.eventTime = eventTime;
        this.createdBy = createdBy;
    }

    @PrePersist
    protected void onCreate() {
        if (this.uuid == null) {
            this.uuid = UUID.randomUUID();
        }
        if (this.eventTime == null) {
            this.eventTime = LocalDateTime.now();
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
    public Long getScoreId() { return scoreId; }
    public void setScoreId(Long scoreId) { this.scoreId = scoreId; }
    public UUID getScoreUuid() { return scoreUuid; }
    public void setScoreUuid(UUID scoreUuid) { this.scoreUuid = scoreUuid; }
    public Long getPlayerId() { return playerId; }
    public void setPlayerId(Long playerId) { this.playerId = playerId; }
    public UUID getPlayerUuid() { return playerUuid; }
    public void setPlayerUuid(UUID playerUuid) { this.playerUuid = playerUuid; }
    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }
    public String getEventValue() { return eventValue; }
    public void setEventValue(String eventValue) { this.eventValue = eventValue; }
    public LocalDateTime getEventTime() { return eventTime; }
    public void setEventTime(LocalDateTime eventTime) { this.eventTime = eventTime; }
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
        ScoreEvent that = (ScoreEvent) o;
        return Objects.equals(id, that.id) && Objects.equals(uuid, that.uuid);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, uuid);
    }

    @Override
    public String toString() {
        return "ScoreEvent{" +
                "id=" + id +
                ", uuid=" + uuid +
                ", scoreId=" + scoreId +
                ", eventType='" + eventType + '\'' +
                ", isActive=" + isActive +
                '}';
    }
}
