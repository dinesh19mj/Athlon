package com.athlon.identityservice.community.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "community_matches")
public class CommunityMatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "match_id", updatable = false, nullable = false)
    private Long matchId;

    @Column(name = "match_uuid", updatable = false, nullable = false, unique = true)
    private UUID matchUuid;

    @Column(name = "community_uuid", nullable = false)
    private UUID communityUuid;

    @Column(name = "session_uuid")
    private UUID sessionUuid;

    @Column(name = "sport", nullable = false, length = 80)
    private String sport;

    @Column(name = "match_type", nullable = false, length = 40)
    private String matchType = "SINGLES"; // SINGLES, DOUBLES, TEAM

    @Column(name = "team_a_name", nullable = false, length = 150)
    private String teamAName;

    @Column(name = "team_b_name", nullable = false, length = 150)
    private String teamBName;

    @Column(name = "team_a_player_uuids", length = 500)
    private String teamAPlayerUuids;

    @Column(name = "team_b_player_uuids", length = 500)
    private String teamBPlayerUuids;

    @Column(name = "team_a_score", nullable = false)
    private Integer teamAScore = 0;

    @Column(name = "team_b_score", nullable = false)
    private Integer teamBScore = 0;

    @Column(name = "scores_json", length = 500)
    private String scoresJson; // e.g. "21-18, 19-21, 21-15"

    @Column(name = "winner_team", length = 10)
    private String winnerTeam; // A, B, DRAW

    @Column(name = "match_date", nullable = false)
    private LocalDate matchDate;

    @Column(name = "recorded_by_user_uuid", nullable = false)
    private UUID recordedByUserUuid;

    @Column(name = "recorded_by_user_name", length = 150)
    private String recordedByUserName;

    @Column(name = "status", nullable = false, length = 30)
    private String status = "COMPLETED";

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public CommunityMatch() {
    }

    @PrePersist
    public void prePersist() {
        if (matchUuid == null) {
            matchUuid = UUID.randomUUID();
        }
        if (teamAScore == null) teamAScore = 0;
        if (teamBScore == null) teamBScore = 0;
        if (status == null) status = "COMPLETED";
    }

    public Long getMatchId() {
        return matchId;
    }

    public void setMatchId(Long matchId) {
        this.matchId = matchId;
    }

    public UUID getMatchUuid() {
        return matchUuid;
    }

    public void setMatchUuid(UUID matchUuid) {
        this.matchUuid = matchUuid;
    }

    public UUID getCommunityUuid() {
        return communityUuid;
    }

    public void setCommunityUuid(UUID communityUuid) {
        this.communityUuid = communityUuid;
    }

    public UUID getSessionUuid() {
        return sessionUuid;
    }

    public void setSessionUuid(UUID sessionUuid) {
        this.sessionUuid = sessionUuid;
    }

    public String getSport() {
        return sport;
    }

    public void setSport(String sport) {
        this.sport = sport;
    }

    public String getMatchType() {
        return matchType;
    }

    public void setMatchType(String matchType) {
        this.matchType = matchType;
    }

    public String getTeamAName() {
        return teamAName;
    }

    public void setTeamAName(String teamAName) {
        this.teamAName = teamAName;
    }

    public String getTeamBName() {
        return teamBName;
    }

    public void setTeamBName(String teamBName) {
        this.teamBName = teamBName;
    }

    public String getTeamAPlayerUuids() {
        return teamAPlayerUuids;
    }

    public void setTeamAPlayerUuids(String teamAPlayerUuids) {
        this.teamAPlayerUuids = teamAPlayerUuids;
    }

    public String getTeamBPlayerUuids() {
        return teamBPlayerUuids;
    }

    public void setTeamBPlayerUuids(String teamBPlayerUuids) {
        this.teamBPlayerUuids = teamBPlayerUuids;
    }

    public Integer getTeamAScore() {
        return teamAScore;
    }

    public void setTeamAScore(Integer teamAScore) {
        this.teamAScore = teamAScore;
    }

    public Integer getTeamBScore() {
        return teamBScore;
    }

    public void setTeamBScore(Integer teamBScore) {
        this.teamBScore = teamBScore;
    }

    public String getScoresJson() {
        return scoresJson;
    }

    public void setScoresJson(String scoresJson) {
        this.scoresJson = scoresJson;
    }

    public String getWinnerTeam() {
        return winnerTeam;
    }

    public void setWinnerTeam(String winnerTeam) {
        this.winnerTeam = winnerTeam;
    }

    public LocalDate getMatchDate() {
        return matchDate;
    }

    public void setMatchDate(LocalDate matchDate) {
        this.matchDate = matchDate;
    }

    public UUID getRecordedByUserUuid() {
        return recordedByUserUuid;
    }

    public void setRecordedByUserUuid(UUID recordedByUserUuid) {
        this.recordedByUserUuid = recordedByUserUuid;
    }

    public String getRecordedByUserName() {
        return recordedByUserName;
    }

    public void setRecordedByUserName(String recordedByUserName) {
        this.recordedByUserName = recordedByUserName;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
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
