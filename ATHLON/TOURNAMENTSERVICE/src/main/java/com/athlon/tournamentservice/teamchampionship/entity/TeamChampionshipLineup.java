package com.athlon.tournamentservice.teamchampionship.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "team_championship_lineups")
public class TeamChampionshipLineup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "lineup_id", updatable = false, nullable = false)
    private Long lineupId;

    @Column(name = "lineup_uuid", updatable = false, nullable = false, unique = true)
    private UUID lineupUuid;

    @Column(name = "fixture_id", nullable = false)
    private Long fixtureId;

    @Column(name = "team_id", nullable = false)
    private Long teamId;

    @Column(name = "submitted_by_user_id")
    private Long submittedByUserId;

    @Column(name = "version")
    private Integer version = 1;

    @Column(name = "status")
    private String status = "SUBMITTED"; // "DRAFT", "SUBMITTED", "APPROVED", "REJECTED", "LOCKED"

    @Column(name = "rejection_reason")
    private String rejectionReason;

    @Column(name = "preferred_category_order")
    private String preferredCategoryOrder; // comma-separated eventIds for TEAM_PREFERENCE_PLUS_TOSS

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (this.lineupUuid == null) {
            this.lineupUuid = UUID.randomUUID();
        }
        if (this.version == null) this.version = 1;
        if (this.status == null) this.status = "SUBMITTED";
    }

    public TeamChampionshipLineup() {}

    public Long getLineupId() {
        return lineupId;
    }

    public void setLineupId(Long lineupId) {
        this.lineupId = lineupId;
    }

    public UUID getLineupUuid() {
        return lineupUuid;
    }

    public void setLineupUuid(UUID lineupUuid) {
        this.lineupUuid = lineupUuid;
    }

    public Long getFixtureId() {
        return fixtureId;
    }

    public void setFixtureId(Long fixtureId) {
        this.fixtureId = fixtureId;
    }

    public Long getTeamId() {
        return teamId;
    }

    public void setTeamId(Long teamId) {
        this.teamId = teamId;
    }

    public Long getSubmittedByUserId() {
        return submittedByUserId;
    }

    public void setSubmittedByUserId(Long submittedByUserId) {
        this.submittedByUserId = submittedByUserId;
    }

    public Integer getVersion() {
        return version;
    }

    public void setVersion(Integer version) {
        this.version = version;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public String getPreferredCategoryOrder() {
        return preferredCategoryOrder;
    }

    public void setPreferredCategoryOrder(String preferredCategoryOrder) {
        this.preferredCategoryOrder = preferredCategoryOrder;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
