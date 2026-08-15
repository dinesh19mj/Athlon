package com.athlon.tournamentservice.teamevent.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "team_event_category_match")
public class TeamEventCategoryMatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false, nullable = false)
    private Long id;

    @Column(name = "uuid", updatable = false, nullable = false, unique = true)
    private UUID uuid = UUID.randomUUID();

    // Link to the overarching TeamEventFixture (which is stored in the 'matches' table)
    @Column(name = "parent_match_id", nullable = false)
    private Long parentMatchId;

    @Column(name = "team_event_category_id", nullable = false)
    private Long teamEventCategoryId;

    @Column(name = "match_order")
    private Integer matchOrder; // The order this category is played in this fixture

    @Column(name = "team_a_registration_id")
    private Long teamARegistrationId; // Team A
    
    @Column(name = "team_b_registration_id")
    private Long teamBRegistrationId; // Team B

    @Column(name = "status", nullable = false)
    private String status = "SCHEDULED"; // SCHEDULED, IN_PROGRESS, COMPLETED

    @Column(name = "winner_registration_id")
    private Long winnerRegistrationId;

    @Column(name = "court_id")
    private Long courtId;

    @Column(name = "score")
    private String score; // e.g. "21-15, 21-18"

    @Transient
    private String categoryName;

    @Transient
    private String matchFormat;

    @Transient
    private Integer playersRequired;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public TeamEventCategoryMatch() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public UUID getUuid() { return uuid; }
    public void setUuid(UUID uuid) { this.uuid = uuid; }

    public Long getParentMatchId() { return parentMatchId; }
    public void setParentMatchId(Long parentMatchId) { this.parentMatchId = parentMatchId; }

    public Long getTeamEventCategoryId() { return teamEventCategoryId; }
    public void setTeamEventCategoryId(Long teamEventCategoryId) { this.teamEventCategoryId = teamEventCategoryId; }

    public Integer getMatchOrder() { return matchOrder; }
    public void setMatchOrder(Integer matchOrder) { this.matchOrder = matchOrder; }

    public Long getTeamARegistrationId() { return teamARegistrationId; }
    public void setTeamARegistrationId(Long teamARegistrationId) { this.teamARegistrationId = teamARegistrationId; }

    public Long getTeamBRegistrationId() { return teamBRegistrationId; }
    public void setTeamBRegistrationId(Long teamBRegistrationId) { this.teamBRegistrationId = teamBRegistrationId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Long getWinnerRegistrationId() { return winnerRegistrationId; }
    public void setWinnerRegistrationId(Long winnerRegistrationId) { this.winnerRegistrationId = winnerRegistrationId; }

    public Long getCourtId() { return courtId; }
    public void setCourtId(Long courtId) { this.courtId = courtId; }

    public String getScore() { return score; }
    public void setScore(String score) { this.score = score; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public String getMatchFormat() { return matchFormat; }
    public void setMatchFormat(String matchFormat) { this.matchFormat = matchFormat; }

    public Integer getPlayersRequired() { return playersRequired; }
    public void setPlayersRequired(Integer playersRequired) { this.playersRequired = playersRequired; }
}
