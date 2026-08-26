package com.athlon.tournamentservice.teamchampionship.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "team_championship_toss_records")
public class TeamChampionshipToss {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "toss_id", updatable = false, nullable = false)
    private Long tossId;

    @Column(name = "toss_uuid", updatable = false, nullable = false, unique = true)
    private UUID tossUuid;

    @Column(name = "fixture_id", nullable = false, unique = true)
    private Long fixtureId;

    @Column(name = "toss_winner_team_id", nullable = false)
    private Long tossWinnerTeamId;

    @Column(name = "toss_winner_team_name")
    private String tossWinnerTeamName;

    @Column(name = "decision")
    private String decision; // e.g. "CHOSE_CATEGORY_ORDER", "CHOSE_SIDE", "CHOSE_SERVE"

    @Column(name = "selected_order")
    private String selectedOrder; // comma-separated eventIds chosen

    @Column(name = "conducted_by_user_id")
    private Long conductedByUserId;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (this.tossUuid == null) {
            this.tossUuid = UUID.randomUUID();
        }
    }

    public TeamChampionshipToss() {}

    public Long getTossId() {
        return tossId;
    }

    public void setTossId(Long tossId) {
        this.tossId = tossId;
    }

    public UUID getTossUuid() {
        return tossUuid;
    }

    public void setTossUuid(UUID tossUuid) {
        this.tossUuid = tossUuid;
    }

    public Long getFixtureId() {
        return fixtureId;
    }

    public void setFixtureId(Long fixtureId) {
        this.fixtureId = fixtureId;
    }

    public Long getTossWinnerTeamId() {
        return tossWinnerTeamId;
    }

    public void setTossWinnerTeamId(Long tossWinnerTeamId) {
        this.tossWinnerTeamId = tossWinnerTeamId;
    }

    public String getTossWinnerTeamName() {
        return tossWinnerTeamName;
    }

    public void setTossWinnerTeamName(String tossWinnerTeamName) {
        this.tossWinnerTeamName = tossWinnerTeamName;
    }

    public String getDecision() {
        return decision;
    }

    public void setDecision(String decision) {
        this.decision = decision;
    }

    public String getSelectedOrder() {
        return selectedOrder;
    }

    public void setSelectedOrder(String selectedOrder) {
        this.selectedOrder = selectedOrder;
    }

    public Long getConductedByUserId() {
        return conductedByUserId;
    }

    public void setConductedByUserId(Long conductedByUserId) {
        this.conductedByUserId = conductedByUserId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
