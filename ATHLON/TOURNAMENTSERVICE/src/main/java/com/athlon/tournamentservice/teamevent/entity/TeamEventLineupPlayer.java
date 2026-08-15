package com.athlon.tournamentservice.teamevent.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "team_event_lineup_player")
public class TeamEventLineupPlayer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false, nullable = false)
    private Long id;

    @Column(name = "uuid", updatable = false, nullable = false, unique = true)
    private UUID uuid = UUID.randomUUID();

    @Column(name = "team_event_lineup_id", nullable = false)
    private Long teamEventLineupId;

    @Column(name = "team_event_category_id")
    private Long teamEventCategoryId; // Nullable for substitutes

    @Column(name = "player_registration_id", nullable = false)
    private Long playerRegistrationId; // Links to RegistrationPlayer

    @Column(name = "position")
    private Integer position; // Player 1, Player 2 in doubles

    @Column(name = "is_substitute")
    private Boolean isSubstitute = false;

    @Transient
    private String playerName;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public TeamEventLineupPlayer() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public UUID getUuid() { return uuid; }
    public void setUuid(UUID uuid) { this.uuid = uuid; }

    public Long getTeamEventLineupId() { return teamEventLineupId; }
    public void setTeamEventLineupId(Long teamEventLineupId) { this.teamEventLineupId = teamEventLineupId; }

    public Long getTeamEventCategoryId() { return teamEventCategoryId; }
    public void setTeamEventCategoryId(Long teamEventCategoryId) { this.teamEventCategoryId = teamEventCategoryId; }

    public Long getPlayerRegistrationId() { return playerRegistrationId; }
    public void setPlayerRegistrationId(Long playerRegistrationId) { this.playerRegistrationId = playerRegistrationId; }

    public Integer getPosition() { return position; }
    public void setPosition(Integer position) { this.position = position; }

    public Boolean getIsSubstitute() { return isSubstitute; }
    public void setIsSubstitute(Boolean isSubstitute) { this.isSubstitute = isSubstitute; }

    public String getPlayerName() { return playerName; }
    public void setPlayerName(String playerName) { this.playerName = playerName; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
