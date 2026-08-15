package com.athlon.tournamentservice.drawengine.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "toss")
public class Toss {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "tossid", updatable = false, nullable = false)
    private Long tossId;

    @Column(name = "tossuuid", updatable = false, nullable = false, unique = true)
    private UUID tossUuid;

    @Column(name = "matchid", nullable = false)
    private Long matchId;

    @Column(name = "toss_winner_registration_id")
    private Long tossWinnerRegistrationId;

    @Column(name = "decision")
    private String decision; // HOME, AWAY, SERVE, RECEIVE

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

    public Toss() {}

    @PrePersist
    protected void onCreate() {
        if (this.tossUuid == null) {
            this.tossUuid = UUID.randomUUID();
        }
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getTossId() { return tossId; }
    public void setTossId(Long tossId) { this.tossId = tossId; }
    public UUID getTossUuid() { return tossUuid; }
    public void setTossUuid(UUID tossUuid) { this.tossUuid = tossUuid; }
    public Long getMatchId() { return matchId; }
    public void setMatchId(Long matchId) { this.matchId = matchId; }
    public Long getTossWinnerRegistrationId() { return tossWinnerRegistrationId; }
    public void setTossWinnerRegistrationId(Long tossWinnerRegistrationId) { this.tossWinnerRegistrationId = tossWinnerRegistrationId; }
    public String getDecision() { return decision; }
    public void setDecision(String decision) { this.decision = decision; }
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
