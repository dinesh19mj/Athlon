package com.athlon.tournament.match.entity;

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
@Table(name = "matches")
public class Match {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "matchid", updatable = false, nullable = false)
    private Long id;

    @Column(name = "matchuuid", updatable = false, nullable = false, unique = true)
    private UUID uuid;

    @Column(name = "teamaregistrationid")
    private Long teamARegistrationId;

    @Column(name = "teamaregistrationuuid")
    private UUID teamARegistrationUuid;

    @Column(name = "teambregistrationid")
    private Long teamBRegistrationId;

    @Column(name = "teambregistrationuuid")
    private UUID teamBRegistrationUuid;

    @Column(name = "courtid")
    private Long courtId;

    @Column(name = "courtuuid")
    private UUID courtUuid;

    @Column(name = "scheduledtime")
    private LocalDateTime scheduledTime;

    @Column(name = "status", nullable = false)
    private String status = "SCHEDULED";

    @Column(name = "winnerregistrationid")
    private Long winnerRegistrationId;

    @Column(name = "winnerregistrationuuid")
    private UUID winnerRegistrationUuid;

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

    public Match() {
    }

    public Match(Long teamARegistrationId, UUID teamARegistrationUuid, Long teamBRegistrationId, UUID teamBRegistrationUuid, Long courtId, UUID courtUuid, LocalDateTime scheduledTime, Long createdBy) {
        this.teamARegistrationId = teamARegistrationId;
        this.teamARegistrationUuid = teamARegistrationUuid;
        this.teamBRegistrationId = teamBRegistrationId;
        this.teamBRegistrationUuid = teamBRegistrationUuid;
        this.courtId = courtId;
        this.courtUuid = courtUuid;
        this.scheduledTime = scheduledTime;
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
    public Long getTeamARegistrationId() { return teamARegistrationId; }
    public void setTeamARegistrationId(Long teamARegistrationId) { this.teamARegistrationId = teamARegistrationId; }
    public UUID getTeamARegistrationUuid() { return teamARegistrationUuid; }
    public void setTeamARegistrationUuid(UUID teamARegistrationUuid) { this.teamARegistrationUuid = teamARegistrationUuid; }
    public Long getTeamBRegistrationId() { return teamBRegistrationId; }
    public void setTeamBRegistrationId(Long teamBRegistrationId) { this.teamBRegistrationId = teamBRegistrationId; }
    public UUID getTeamBRegistrationUuid() { return teamBRegistrationUuid; }
    public void setTeamBRegistrationUuid(UUID teamBRegistrationUuid) { this.teamBRegistrationUuid = teamBRegistrationUuid; }
    public Long getCourtId() { return courtId; }
    public void setCourtId(Long courtId) { this.courtId = courtId; }
    public UUID getCourtUuid() { return courtUuid; }
    public void setCourtUuid(UUID courtUuid) { this.courtUuid = courtUuid; }
    public LocalDateTime getScheduledTime() { return scheduledTime; }
    public void setScheduledTime(LocalDateTime scheduledTime) { this.scheduledTime = scheduledTime; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Long getWinnerRegistrationId() { return winnerRegistrationId; }
    public void setWinnerRegistrationId(Long winnerRegistrationId) { this.winnerRegistrationId = winnerRegistrationId; }
    public UUID getWinnerRegistrationUuid() { return winnerRegistrationUuid; }
    public void setWinnerRegistrationUuid(UUID winnerRegistrationUuid) { this.winnerRegistrationUuid = winnerRegistrationUuid; }
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
        Match match = (Match) o;
        return Objects.equals(id, match.id) && Objects.equals(uuid, match.uuid);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, uuid);
    }

    @Override
    public String toString() {
        return "Match{" +
                "id=" + id +
                ", uuid=" + uuid +
                ", teamARegistrationId=" + teamARegistrationId +
                ", teamBRegistrationId=" + teamBRegistrationId +
                ", status='" + status + '\'' +
                ", isActive=" + isActive +
                '}';
    }
}
