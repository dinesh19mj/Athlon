package com.athlon.tournamentservice.score.entity;

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
@Table(name = "score_events")
public class ScoreEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "scoreeventid", updatable = false, nullable = false)
    private Long scoreEventId;

    @Column(name = "scoreeventuuid", updatable = false, nullable = false, unique = true)
    private UUID scoreEventUuid;

    @Column(name = "scoreid", nullable = false)
    private Long scoreId;

    @Column(name = "scoreuuid", nullable = false)
    private UUID scoreUuid;

    @Column(name = "playerid")
    private Long playerId;

    @Column(name = "playeruuid")
    private UUID playerUuid;

    @Column(name = "eventtype", nullable = false)
    private String eventType;

    @Column(name = "eventvalue")
    private String eventValue;

    @Column(name = "eventtime", nullable = false)
    private LocalDateTime eventTime;

    @Column(name = "isactive", nullable = false)
    private boolean isActive = true;

    @Column(name = "createdon", nullable = false, updatable = false)
    private LocalDateTime createdOn;

    @Column(name = "modifiedon")
    private LocalDateTime modifiedOn;

    @Column(name = "createdby")
    private Long createdBy;

    @Column(name = "modifiedby")
    private Long modifiedBy;

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
        if (this.scoreEventUuid == null) {
            this.scoreEventUuid = UUID.randomUUID();
        }
        if (this.eventTime == null) {
            this.eventTime = LocalDateTime.now();
        }
        this.createdOn = LocalDateTime.now();
        this.modifiedOn = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.modifiedOn = LocalDateTime.now();
    }

    public Long getScoreEventId() { return scoreEventId; }
    public void setScoreEventId(Long scoreEventId) { this.scoreEventId = scoreEventId; }
    public UUID getScoreEventUuid() { return scoreEventUuid; }
    public void setScoreEventUuid(UUID scoreEventUuid) { this.scoreEventUuid = scoreEventUuid; }
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
    public LocalDateTime getCreatedOn() { return createdOn; }
    public void setCreatedOn(LocalDateTime createdOn) { this.createdOn = createdOn; }
    public LocalDateTime getModifiedOn() { return modifiedOn; }
    public void setModifiedOn(LocalDateTime modifiedOn) { this.modifiedOn = modifiedOn; }
    public Long getCreatedBy() { return createdBy; }
    public void setCreatedBy(Long createdBy) { this.createdBy = createdBy; }
    public Long getModifiedBy() { return modifiedBy; }
    public void setModifiedBy(Long modifiedBy) { this.modifiedBy = modifiedBy; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ScoreEvent that = (ScoreEvent) o;
        return Objects.equals(scoreEventId, that.scoreEventId) && Objects.equals(scoreEventUuid, that.scoreEventUuid);
    }

    @Override
    public int hashCode() {
        return Objects.hash(scoreEventId, scoreEventUuid);
    }

    @Override
    public String toString() {
        return "ScoreEvent{" +
                "scoreEventId=" + scoreEventId +
                ", scoreEventUuid=" + scoreEventUuid +
                ", scoreId=" + scoreId +
                ", eventType='" + eventType + '\'' +
                ", isActive=" + isActive +
                '}';
    }
}

