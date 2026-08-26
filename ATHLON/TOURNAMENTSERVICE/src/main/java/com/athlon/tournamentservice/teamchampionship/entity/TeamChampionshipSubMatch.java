package com.athlon.tournamentservice.teamchampionship.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "team_championship_sub_matches")
public class TeamChampionshipSubMatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "sub_match_id", updatable = false, nullable = false)
    private Long subMatchId;

    @Column(name = "sub_match_uuid", updatable = false, nullable = false, unique = true)
    private UUID subMatchUuid;

    @Column(name = "fixture_id", nullable = false)
    private Long fixtureId;

    @Column(name = "championship_id", nullable = false)
    private Long championshipId;

    @Column(name = "event_id", nullable = false)
    private Long eventId;

    @Column(name = "event_name", nullable = false)
    private String eventName; // e.g. "C Level Men's Doubles"

    @Column(name = "category_id")
    private Long categoryId;

    @Column(name = "category_name")
    private String categoryName;

    @Column(name = "format_id")
    private Long formatId;

    @Column(name = "format_name")
    private String formatName;

    @Column(name = "order_sequence")
    private Integer orderSequence = 1;

    @Column(name = "match_id")
    private Long matchId; // References existing live scoring Match entity (optional/linked)

    @Column(name = "team_a_players")
    private String teamAPlayers; // e.g. "Dinesh M J, Vinayak S"

    @Column(name = "team_b_players")
    private String teamBPlayers; // e.g. "Rahul K, Arun V"

    @Column(name = "status")
    private String status = "SCHEDULED"; // "SCHEDULED", "IN_PROGRESS", "COMPLETED", "WALKOVER"

    @Column(name = "score_summary")
    private String scoreSummary; // e.g. "21-18, 19-21, 21-15"

    @Column(name = "winning_team_id")
    private Long winningTeamId;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (this.subMatchUuid == null) {
            this.subMatchUuid = UUID.randomUUID();
        }
        if (this.orderSequence == null) this.orderSequence = 1;
        if (this.status == null) this.status = "SCHEDULED";
    }

    public TeamChampionshipSubMatch() {}

    public Long getSubMatchId() {
        return subMatchId;
    }

    public void setSubMatchId(Long subMatchId) {
        this.subMatchId = subMatchId;
    }

    public UUID getSubMatchUuid() {
        return subMatchUuid;
    }

    public void setSubMatchUuid(UUID subMatchUuid) {
        this.subMatchUuid = subMatchUuid;
    }

    public Long getFixtureId() {
        return fixtureId;
    }

    public void setFixtureId(Long fixtureId) {
        this.fixtureId = fixtureId;
    }

    public Long getChampionshipId() {
        return championshipId;
    }

    public void setChampionshipId(Long championshipId) {
        this.championshipId = championshipId;
    }

    public Long getEventId() {
        return eventId;
    }

    public void setEventId(Long eventId) {
        this.eventId = eventId;
    }

    public String getEventName() {
        return eventName;
    }

    public void setEventName(String eventName) {
        this.eventName = eventName;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public Long getFormatId() {
        return formatId;
    }

    public void setFormatId(Long formatId) {
        this.formatId = formatId;
    }

    public String getFormatName() {
        return formatName;
    }

    public void setFormatName(String formatName) {
        this.formatName = formatName;
    }

    public Integer getOrderSequence() {
        return orderSequence;
    }

    public void setOrderSequence(Integer orderSequence) {
        this.orderSequence = orderSequence;
    }

    public Long getMatchId() {
        return matchId;
    }

    public void setMatchId(Long matchId) {
        this.matchId = matchId;
    }

    public String getTeamAPlayers() {
        return teamAPlayers;
    }

    public void setTeamAPlayers(String teamAPlayers) {
        this.teamAPlayers = teamAPlayers;
    }

    public String getTeamBPlayers() {
        return teamBPlayers;
    }

    public void setTeamBPlayers(String teamBPlayers) {
        this.teamBPlayers = teamBPlayers;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getScoreSummary() {
        return scoreSummary;
    }

    public void setScoreSummary(String scoreSummary) {
        this.scoreSummary = scoreSummary;
    }

    public Long getWinningTeamId() {
        return winningTeamId;
    }

    public void setWinningTeamId(Long winningTeamId) {
        this.winningTeamId = winningTeamId;
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
