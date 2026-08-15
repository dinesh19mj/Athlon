package com.athlon.tournamentservice.teamevent.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "team_event_category_order")
public class TeamEventCategoryOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false, nullable = false)
    private Long id;

    @Column(name = "uuid", updatable = false, nullable = false, unique = true)
    private UUID uuid = UUID.randomUUID();

    @Column(name = "fixture_match_id", nullable = false)
    private Long fixtureMatchId;

    @Column(name = "team_event_category_id", nullable = false)
    private Long teamEventCategoryId;

    @Column(name = "match_order", nullable = false)
    private Integer matchOrder;

    @Column(name = "source", nullable = false)
    private String source; // ORGANIZER, TEAM_PREFERENCE, TOSS

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public TeamEventCategoryOrder() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public UUID getUuid() { return uuid; }
    public void setUuid(UUID uuid) { this.uuid = uuid; }

    public Long getFixtureMatchId() { return fixtureMatchId; }
    public void setFixtureMatchId(Long fixtureMatchId) { this.fixtureMatchId = fixtureMatchId; }

    public Long getTeamEventCategoryId() { return teamEventCategoryId; }
    public void setTeamEventCategoryId(Long teamEventCategoryId) { this.teamEventCategoryId = teamEventCategoryId; }

    public Integer getMatchOrder() { return matchOrder; }
    public void setMatchOrder(Integer matchOrder) { this.matchOrder = matchOrder; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
