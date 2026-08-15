package com.athlon.tournamentservice.teamevent.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "team_event_toss")
public class TeamEventToss {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false, nullable = false)
    private Long id;

    @Column(name = "uuid", updatable = false, nullable = false, unique = true)
    private UUID uuid = UUID.randomUUID();

    @Column(name = "fixture_match_id", nullable = false)
    private Long fixtureMatchId;

    @Column(name = "stage")
    private String stage; // LEAGUE, KNOCKOUT

    @Column(name = "winner_registration_id")
    private Long winnerRegistrationId;

    @Column(name = "decision")
    private String decision; // e.g. CATEGORY_ORDER

    @Column(name = "category_order_source")
    private String categoryOrderSource; // ORGANIZER, TEAM_PREFERENCE, TOSS

    @Column(name = "confirmed_by")
    private Long confirmedBy;

    @Column(name = "confirmed_at")
    private LocalDateTime confirmedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public TeamEventToss() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public UUID getUuid() { return uuid; }
    public void setUuid(UUID uuid) { this.uuid = uuid; }

    public Long getFixtureMatchId() { return fixtureMatchId; }
    public void setFixtureMatchId(Long fixtureMatchId) { this.fixtureMatchId = fixtureMatchId; }

    public String getStage() { return stage; }
    public void setStage(String stage) { this.stage = stage; }

    public Long getWinnerRegistrationId() { return winnerRegistrationId; }
    public void setWinnerRegistrationId(Long winnerRegistrationId) { this.winnerRegistrationId = winnerRegistrationId; }

    public String getDecision() { return decision; }
    public void setDecision(String decision) { this.decision = decision; }

    public String getCategoryOrderSource() { return categoryOrderSource; }
    public void setCategoryOrderSource(String categoryOrderSource) { this.categoryOrderSource = categoryOrderSource; }

    public Long getConfirmedBy() { return confirmedBy; }
    public void setConfirmedBy(Long confirmedBy) { this.confirmedBy = confirmedBy; }

    public LocalDateTime getConfirmedAt() { return confirmedAt; }
    public void setConfirmedAt(LocalDateTime confirmedAt) { this.confirmedAt = confirmedAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
