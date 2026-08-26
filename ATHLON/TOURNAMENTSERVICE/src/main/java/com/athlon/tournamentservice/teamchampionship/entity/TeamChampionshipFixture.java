package com.athlon.tournamentservice.teamchampionship.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "team_championship_fixtures")
public class TeamChampionshipFixture {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "fixture_id", updatable = false, nullable = false)
    private Long fixtureId;

    @Column(name = "fixture_uuid", updatable = false, nullable = false, unique = true)
    private UUID fixtureUuid;

    @Column(name = "championship_id", nullable = false)
    private Long championshipId;

    @Column(name = "championship_uuid", nullable = false)
    private UUID championshipUuid;

    @Column(name = "pool_id")
    private Long poolId;

    @Column(name = "round_name")
    private String roundName = "Round 1"; // "Round 1", "Quarter Final", "Semi Final", "Final"

    @Column(name = "stage")
    private String stage = "LEAGUE"; // "LEAGUE", "KNOCKOUT"

    @Column(name = "team_a_id", nullable = false)
    private Long teamAId;

    @Column(name = "team_a_name", nullable = false)
    private String teamAName;

    @Column(name = "team_b_id", nullable = false)
    private Long teamBId;

    @Column(name = "team_b_name", nullable = false)
    private String teamBName;

    @Column(name = "scheduled_time")
    private LocalDateTime scheduledTime;

    @Column(name = "court_id")
    private Long courtId;

    @Column(name = "court_name")
    private String courtName;

    @Column(name = "status")
    private String status = "SCHEDULED"; // "SCHEDULED", "LINEUPS_OPEN", "LINEUPS_SUBMITTED", "IN_PROGRESS", "COMPLETED", "CANCELLED"

    @Column(name = "team_a_points")
    private Integer teamAPoints = 0;

    @Column(name = "team_b_points")
    private Integer teamBPoints = 0;

    @Column(name = "winner_team_id")
    private Long winnerTeamId;

    @Column(name = "winner_team_name")
    private String winnerTeamName;

    @Column(name = "category_order_mode")
    private String categoryOrderMode; // "ORGANIZER_DEFINED", "TEAM_PREFERENCE_PLUS_TOSS"

    @Column(name = "toss_winner_team_id")
    private Long tossWinnerTeamId;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (this.fixtureUuid == null) {
            this.fixtureUuid = UUID.randomUUID();
        }
        if (this.roundName == null) this.roundName = "Round 1";
        if (this.stage == null) this.stage = "LEAGUE";
        if (this.status == null) this.status = "SCHEDULED";
        if (this.teamAPoints == null) this.teamAPoints = 0;
        if (this.teamBPoints == null) this.teamBPoints = 0;
    }

    public TeamChampionshipFixture() {}

    public Long getFixtureId() {
        return fixtureId;
    }

    public void setFixtureId(Long fixtureId) {
        this.fixtureId = fixtureId;
    }

    public UUID getFixtureUuid() {
        return fixtureUuid;
    }

    public void setFixtureUuid(UUID fixtureUuid) {
        this.fixtureUuid = fixtureUuid;
    }

    public Long getChampionshipId() {
        return championshipId;
    }

    public void setChampionshipId(Long championshipId) {
        this.championshipId = championshipId;
    }

    public UUID getChampionshipUuid() {
        return championshipUuid;
    }

    public void setChampionshipUuid(UUID championshipUuid) {
        this.championshipUuid = championshipUuid;
    }

    public Long getPoolId() {
        return poolId;
    }

    public void setPoolId(Long poolId) {
        this.poolId = poolId;
    }

    public String getRoundName() {
        return roundName;
    }

    public void setRoundName(String roundName) {
        this.roundName = roundName;
    }

    public String getStage() {
        return stage;
    }

    public void setStage(String stage) {
        this.stage = stage;
    }

    public Long getTeamAId() {
        return teamAId;
    }

    public void setTeamAId(Long teamAId) {
        this.teamAId = teamAId;
    }

    public String getTeamAName() {
        return teamAName;
    }

    public void setTeamAName(String teamAName) {
        this.teamAName = teamAName;
    }

    public Long getTeamBId() {
        return teamBId;
    }

    public void setTeamBId(Long teamBId) {
        this.teamBId = teamBId;
    }

    public String getTeamBName() {
        return teamBName;
    }

    public void setTeamBName(String teamBName) {
        this.teamBName = teamBName;
    }

    public LocalDateTime getScheduledTime() {
        return scheduledTime;
    }

    public void setScheduledTime(LocalDateTime scheduledTime) {
        this.scheduledTime = scheduledTime;
    }

    public Long getCourtId() {
        return courtId;
    }

    public void setCourtId(Long courtId) {
        this.courtId = courtId;
    }

    public String getCourtName() {
        return courtName;
    }

    public void setCourtName(String courtName) {
        this.courtName = courtName;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getTeamAPoints() {
        return teamAPoints;
    }

    public void setTeamAPoints(Integer teamAPoints) {
        this.teamAPoints = teamAPoints;
    }

    public Integer getTeamBPoints() {
        return teamBPoints;
    }

    public void setTeamBPoints(Integer teamBPoints) {
        this.teamBPoints = teamBPoints;
    }

    public Long getWinnerTeamId() {
        return winnerTeamId;
    }

    public void setWinnerTeamId(Long winnerTeamId) {
        this.winnerTeamId = winnerTeamId;
    }

    public String getWinnerTeamName() {
        return winnerTeamName;
    }

    public void setWinnerTeamName(String winnerTeamName) {
        this.winnerTeamName = winnerTeamName;
    }

    public String getCategoryOrderMode() {
        return categoryOrderMode;
    }

    public void setCategoryOrderMode(String categoryOrderMode) {
        this.categoryOrderMode = categoryOrderMode;
    }

    public Long getTossWinnerTeamId() {
        return tossWinnerTeamId;
    }

    public void setTossWinnerTeamId(Long tossWinnerTeamId) {
        this.tossWinnerTeamId = tossWinnerTeamId;
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
