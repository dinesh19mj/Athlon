package com.athlon.tournamentservice.teamchampionship.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "team_championship_substitutions")
public class TeamChampionshipSubstitution {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "substitution_id", updatable = false, nullable = false)
    private Long substitutionId;

    @Column(name = "substitution_uuid", updatable = false, nullable = false, unique = true)
    private UUID substitutionUuid;

    @Column(name = "fixture_id", nullable = false)
    private Long fixtureId;

    @Column(name = "sub_match_id", nullable = false)
    private Long subMatchId;

    @Column(name = "team_id", nullable = false)
    private Long teamId;

    @Column(name = "original_player_id", nullable = false)
    private Long originalPlayerId;

    @Column(name = "original_player_name", nullable = false)
    private String originalPlayerName;

    @Column(name = "replacement_player_id", nullable = false)
    private Long replacementPlayerId;

    @Column(name = "replacement_player_name", nullable = false)
    private String replacementPlayerName;

    @Column(name = "reason")
    private String reason; // e.g. "INJURY", "TACTICAL", "UNAVAILABLE"

    @Column(name = "approved_by_user_id")
    private Long approvedByUserId;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (this.substitutionUuid == null) {
            this.substitutionUuid = UUID.randomUUID();
        }
    }

    public TeamChampionshipSubstitution() {}

    public Long getSubstitutionId() {
        return substitutionId;
    }

    public void setSubstitutionId(Long substitutionId) {
        this.substitutionId = substitutionId;
    }

    public UUID getSubstitutionUuid() {
        return substitutionUuid;
    }

    public void setSubstitutionUuid(UUID substitutionUuid) {
        this.substitutionUuid = substitutionUuid;
    }

    public Long getFixtureId() {
        return fixtureId;
    }

    public void setFixtureId(Long fixtureId) {
        this.fixtureId = fixtureId;
    }

    public Long getSubMatchId() {
        return subMatchId;
    }

    public void setSubMatchId(Long subMatchId) {
        this.subMatchId = subMatchId;
    }

    public Long getTeamId() {
        return teamId;
    }

    public void setTeamId(Long teamId) {
        this.teamId = teamId;
    }

    public Long getOriginalPlayerId() {
        return originalPlayerId;
    }

    public void setOriginalPlayerId(Long originalPlayerId) {
        this.originalPlayerId = originalPlayerId;
    }

    public String getOriginalPlayerName() {
        return originalPlayerName;
    }

    public void setOriginalPlayerName(String originalPlayerName) {
        this.originalPlayerName = originalPlayerName;
    }

    public Long getReplacementPlayerId() {
        return replacementPlayerId;
    }

    public void setReplacementPlayerId(Long replacementPlayerId) {
        this.replacementPlayerId = replacementPlayerId;
    }

    public String getReplacementPlayerName() {
        return replacementPlayerName;
    }

    public void setReplacementPlayerName(String replacementPlayerName) {
        this.replacementPlayerName = replacementPlayerName;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public Long getApprovedByUserId() {
        return approvedByUserId;
    }

    public void setApprovedByUserId(Long approvedByUserId) {
        this.approvedByUserId = approvedByUserId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
