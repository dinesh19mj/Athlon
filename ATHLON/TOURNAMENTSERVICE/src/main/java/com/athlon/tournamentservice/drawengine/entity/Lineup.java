package com.athlon.tournamentservice.drawengine.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "lineups")
public class Lineup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "lineupid", updatable = false, nullable = false)
    private Long lineupId;

    @Column(name = "lineupuuid", updatable = false, nullable = false, unique = true)
    private UUID lineupUuid;

    @Column(name = "matchid", nullable = false)
    private Long matchId;

    @Column(name = "teamregistrationid", nullable = false)
    private Long teamRegistrationId;

    @Column(name = "status", nullable = false)
    private String status = "PENDING"; // PENDING, READY, PUBLISHED

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

    public Lineup() {}

    @PrePersist
    protected void onCreate() {
        if (this.lineupUuid == null) {
            this.lineupUuid = UUID.randomUUID();
        }
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getLineupId() { return lineupId; }
    public void setLineupId(Long lineupId) { this.lineupId = lineupId; }
    public UUID getLineupUuid() { return lineupUuid; }
    public void setLineupUuid(UUID lineupUuid) { this.lineupUuid = lineupUuid; }
    public Long getMatchId() { return matchId; }
    public void setMatchId(Long matchId) { this.matchId = matchId; }
    public Long getTeamRegistrationId() { return teamRegistrationId; }
    public void setTeamRegistrationId(Long teamRegistrationId) { this.teamRegistrationId = teamRegistrationId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
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
}
