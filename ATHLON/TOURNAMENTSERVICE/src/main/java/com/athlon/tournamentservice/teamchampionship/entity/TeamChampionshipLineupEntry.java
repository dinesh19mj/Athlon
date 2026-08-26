package com.athlon.tournamentservice.teamchampionship.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "team_championship_lineup_entries")
public class TeamChampionshipLineupEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "entry_id", updatable = false, nullable = false)
    private Long entryId;

    @Column(name = "lineup_id", nullable = false)
    private Long lineupId;

    @Column(name = "event_id", nullable = false)
    private Long eventId;

    @Column(name = "event_name")
    private String eventName;

    @Column(name = "player_id", nullable = false)
    private Long playerId;

    @Column(name = "player_name", nullable = false)
    private String playerName;

    @Column(name = "player_position")
    private Integer playerPosition = 1; // 1 for Player 1, 2 for Player 2 (in doubles)

    @Column(name = "is_substitute")
    private Boolean isSubstitute = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public TeamChampionshipLineupEntry() {}

    public Long getEntryId() {
        return entryId;
    }

    public void setEntryId(Long entryId) {
        this.entryId = entryId;
    }

    public Long getLineupId() {
        return lineupId;
    }

    public void setLineupId(Long lineupId) {
        this.lineupId = lineupId;
    }

    public Long getEventId() {
        return eventId;
    }

    public void setEventId(Long eventId) {
        this.eventId = eventId;
    }

    public String getEventName() {
        return eventName;
    }

    public void setEventName(String eventName) {
        this.eventName = eventName;
    }

    public Long getPlayerId() {
        return playerId;
    }

    public void setPlayerId(Long playerId) {
        this.playerId = playerId;
    }

    public String getPlayerName() {
        return playerName;
    }

    public void setPlayerName(String playerName) {
        this.playerName = playerName;
    }

    public Integer getPlayerPosition() {
        return playerPosition;
    }

    public void setPlayerPosition(Integer playerPosition) {
        this.playerPosition = playerPosition;
    }

    public Boolean getIsSubstitute() {
        return isSubstitute;
    }

    public void setIsSubstitute(Boolean substitute) {
        isSubstitute = substitute;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
