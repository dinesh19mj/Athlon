package com.athlon.tournamentservice.teamevent.entity;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "team_event_roster_players")
public class TeamEventRosterPlayer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "rosterplayerid", updatable = false, nullable = false)
    private Long rosterPlayerId;

    @Column(name = "rosterplayeruuid", updatable = false, nullable = false, unique = true)
    private UUID rosterPlayerUuid;

    @Column(name = "tournamentid", nullable = false)
    private Long tournamentId;

    @Column(name = "teamregistrationid", nullable = false)
    private Long teamRegistrationId;

    @Column(name = "playername", nullable = false)
    private String playerName;

    @Column(name = "phonenumber")
    private String phoneNumber;

    @Column(name = "playerid")
    private Long playerId;

    @Column(name = "categoryid")
    private Long categoryId;

    @Column(name = "categoryname")
    private String categoryName;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "created_by")
    private Long createdBy;

    public TeamEventRosterPlayer() {}

    public TeamEventRosterPlayer(Long tournamentId, Long teamRegistrationId, String playerName, String phoneNumber, Long playerId, Long categoryId, String categoryName, Long createdBy) {
        this.tournamentId = tournamentId;
        this.teamRegistrationId = teamRegistrationId;
        this.playerName = playerName;
        this.phoneNumber = phoneNumber;
        this.playerId = playerId;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.createdBy = createdBy;
    }

    @PrePersist
    public void prePersist() {
        if (rosterPlayerUuid == null) {
            rosterPlayerUuid = UUID.randomUUID();
        }
    }

    // Getters and Setters

    public Long getRosterPlayerId() { return rosterPlayerId; }
    public void setRosterPlayerId(Long rosterPlayerId) { this.rosterPlayerId = rosterPlayerId; }

    public UUID getRosterPlayerUuid() { return rosterPlayerUuid; }
    public void setRosterPlayerUuid(UUID rosterPlayerUuid) { this.rosterPlayerUuid = rosterPlayerUuid; }

    public Long getTournamentId() { return tournamentId; }
    public void setTournamentId(Long tournamentId) { this.tournamentId = tournamentId; }

    public Long getTeamRegistrationId() { return teamRegistrationId; }
    public void setTeamRegistrationId(Long teamRegistrationId) { this.teamRegistrationId = teamRegistrationId; }

    public String getPlayerName() { return playerName; }
    public void setPlayerName(String playerName) { this.playerName = playerName; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public Long getPlayerId() { return playerId; }
    public void setPlayerId(Long playerId) { this.playerId = playerId; }

    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public Long getCreatedBy() { return createdBy; }
    public void setCreatedBy(Long createdBy) { this.createdBy = createdBy; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof TeamEventRosterPlayer)) return false;
        TeamEventRosterPlayer that = (TeamEventRosterPlayer) o;
        return Objects.equals(rosterPlayerId, that.rosterPlayerId) && Objects.equals(rosterPlayerUuid, that.rosterPlayerUuid);
    }

    @Override
    public int hashCode() {
        return Objects.hash(rosterPlayerId, rosterPlayerUuid);
    }

    @Override
    public String toString() {
        return "TeamEventRosterPlayer{" +
                "rosterPlayerId=" + rosterPlayerId +
                ", rosterPlayerUuid=" + rosterPlayerUuid +
                ", tournamentId=" + tournamentId +
                ", teamRegistrationId=" + teamRegistrationId +
                ", playerName='" + playerName + '\'' +
                ", phoneNumber='" + phoneNumber + '\'' +
                ", playerId=" + playerId +
                ", categoryId=" + categoryId +
                ", categoryName='" + categoryName + '\'' +
                '}';
    }
}
