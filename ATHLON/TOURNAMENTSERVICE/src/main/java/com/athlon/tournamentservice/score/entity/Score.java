package com.athlon.tournamentservice.score.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "scores")
public class Score {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "scoreid", updatable = false, nullable = false)
    private Long scoreId;

    @Column(name = "scoreuuid", updatable = false, nullable = false, unique = true)
    private UUID scoreUuid;

    @Column(name = "matchid", nullable = false)
    private Long matchId;

    @Column(name = "matchuuid")
    private UUID matchUuid;

    @Column(name = "teamascore")
    private String teamAScore;

    @Column(name = "teambscore")
    private String teamBScore;

    @Column(name = "isfinal", nullable = false)
    private boolean isFinal = false;

    @Column(name = "isactive", nullable = false)
    private boolean isActive = true;

    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.JSON)
    @Column(name = "scoremeta", columnDefinition = "jsonb")
    private com.fasterxml.jackson.databind.JsonNode scoreMeta;

    @Column(name = "createdon", nullable = false, updatable = false)
    private LocalDateTime createdOn;

    @Column(name = "modifiedon")
    private LocalDateTime modifiedOn;

    @Column(name = "createdby")
    private Long createdBy;

    @Column(name = "modifiedby")
    private Long modifiedBy;

    public Score() {
    }

    public Score(Long matchId, UUID matchUuid, String teamAScore, String teamBScore, boolean isFinal, Long createdBy) {
        this.matchId = matchId;
        this.matchUuid = matchUuid;
        this.teamAScore = teamAScore;
        this.teamBScore = teamBScore;
        this.isFinal = isFinal;
        this.createdBy = createdBy;
    }

    @PrePersist
    protected void onCreate() {
        if (this.scoreUuid == null) {
            this.scoreUuid = UUID.randomUUID();
        }
        this.createdOn = LocalDateTime.now();
        this.modifiedOn = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.modifiedOn = LocalDateTime.now();
    }

    public Long getScoreId() { return scoreId; }
    public void setScoreId(Long scoreId) { this.scoreId = scoreId; }
    public UUID getScoreUuid() { return scoreUuid; }
    public void setScoreUuid(UUID scoreUuid) { this.scoreUuid = scoreUuid; }
    public Long getMatchId() { return matchId; }
    public void setMatchId(Long matchId) { this.matchId = matchId; }
    public UUID getMatchUuid() { return matchUuid; }
    public void setMatchUuid(UUID matchUuid) { this.matchUuid = matchUuid; }
    public String getTeamAScore() { return teamAScore; }
    public void setTeamAScore(String teamAScore) { this.teamAScore = teamAScore; }
    public String getTeamBScore() { return teamBScore; }
    public void setTeamBScore(String teamBScore) { this.teamBScore = teamBScore; }
    public boolean isFinal() { return isFinal; }
    public void setFinal(boolean aFinal) { isFinal = aFinal; }
    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }
    public com.fasterxml.jackson.databind.JsonNode getScoreMeta() { return scoreMeta; }
    public void setScoreMeta(com.fasterxml.jackson.databind.JsonNode scoreMeta) { this.scoreMeta = scoreMeta; }
    public LocalDateTime getCreatedOn() { return createdOn; }
    public void setCreatedOn(LocalDateTime createdOn) { this.createdOn = createdOn; }
    public LocalDateTime getModifiedOn() { return modifiedOn; }
    public void setModifiedOn(LocalDateTime modifiedOn) { this.modifiedOn = modifiedOn; }
    public Long getCreatedBy() { return createdBy; }
    public void setCreatedBy(Long createdBy) { this.createdBy = createdBy; }
    public Long getModifiedBy() { return modifiedBy; }
    public void setModifiedBy(Long modifiedBy) { this.modifiedBy = modifiedBy; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Score score = (Score) o;
        return Objects.equals(scoreId, score.scoreId) && Objects.equals(scoreUuid, score.scoreUuid);
    }

    @Override
    public int hashCode() {
        return Objects.hash(scoreId, scoreUuid);
    }

    @Override
    public String toString() {
        return "Score{" +
                "scoreId=" + scoreId +
                ", scoreUuid=" + scoreUuid +
                ", matchId=" + matchId +
                ", teamAScore='" + teamAScore + '\'' +
                ", teamBScore='" + teamBScore + '\'' +
                ", isFinal=" + isFinal +
                ", isActive=" + isActive +
                '}';
    }
}

