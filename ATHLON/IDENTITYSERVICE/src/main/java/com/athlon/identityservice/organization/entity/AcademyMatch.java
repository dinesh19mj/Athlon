package com.athlon.identityservice.organization.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "academy_matches")
public class AcademyMatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "match_id", updatable = false, nullable = false)
    private Long matchId;

    @Column(name = "match_uuid", updatable = false, nullable = false, unique = true)
    private UUID matchUuid;

    @Column(name = "organization_id")
    private Long organizationId;

    @Column(name = "organization_uuid", nullable = false)
    private UUID organizationUuid;

    @Column(name = "match_title", length = 150)
    private String matchTitle; // e.g. "Morning Sparring - Finals"

    @Column(name = "sport_type", nullable = false, length = 100)
    private String sportType; // Badminton, Tennis, Table Tennis, etc.

    @Column(name = "match_type", length = 50)
    private String matchType = "SINGLES"; // SINGLES, DOUBLES, SPARRING, PRACTICE, LEAGUE

    @Column(name = "batch_uuid")
    private UUID batchUuid;

    @Column(name = "batch_name", length = 150)
    private String batchName;

    @Column(name = "court_uuid")
    private UUID courtUuid;

    @Column(name = "court_name", length = 150)
    private String courtName;

    @Column(name = "coach_uuid")
    private UUID coachUuid;

    @Column(name = "coach_name", length = 150)
    private String coachName;

    @Column(name = "match_date", nullable = false)
    private LocalDate matchDate;

    @Column(name = "match_time", length = 30)
    private String matchTime; // "17:30"

    @Column(name = "status", nullable = false, length = 30)
    private String status = "SCHEDULED"; // SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED

    // Team 1
    @Column(name = "player1_uuid")
    private UUID player1Uuid;

    @Column(name = "player1_name", nullable = false, length = 150)
    private String player1Name;

    @Column(name = "player2_uuid")
    private UUID player2Uuid;

    @Column(name = "player2_name", length = 150)
    private String player2Name;

    @Column(name = "team1_score")
    private Integer team1Score = 0;

    // Team 2
    @Column(name = "player3_uuid")
    private UUID player3Uuid;

    @Column(name = "player3_name", nullable = false, length = 150)
    private String player3Name;

    @Column(name = "player4_uuid")
    private UUID player4Uuid;

    @Column(name = "player4_name", length = 150)
    private String player4Name;

    @Column(name = "team2_score")
    private Integer team2Score = 0;

    // Results
    @Column(name = "winner_team")
    private Integer winnerTeam; // 1, 2, or null

    @Column(name = "winner_name", length = 255)
    private String winnerName;

    @Column(name = "scores_detail", length = 255)
    private String scoresDetail; // "21-18, 19-21, 21-15"

    @Column(name = "referee_name", length = 150)
    private String refereeName;

    @Column(name = "notes", length = 255)
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "updated_by")
    private Long updatedBy;

    public AcademyMatch() {
    }

    @PrePersist
    public void prePersist() {
        if (this.matchUuid == null) {
            this.matchUuid = UUID.randomUUID();
        }
        if (this.status == null) {
            this.status = "SCHEDULED";
        }
        if (this.team1Score == null) this.team1Score = 0;
        if (this.team2Score == null) this.team2Score = 0;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
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

    public Long getOrganizationId() {
        return organizationId;
    }

    public void setOrganizationId(Long organizationId) {
        this.organizationId = organizationId;
    }

    public UUID getOrganizationUuid() {
        return organizationUuid;
    }

    public void setOrganizationUuid(UUID organizationUuid) {
        this.organizationUuid = organizationUuid;
    }

    public String getMatchTitle() {
        return matchTitle;
    }

    public void setMatchTitle(String matchTitle) {
        this.matchTitle = matchTitle;
    }

    public String getSportType() {
        return sportType;
    }

    public void setSportType(String sportType) {
        this.sportType = sportType;
    }

    public String getMatchType() {
        return matchType;
    }

    public void setMatchType(String matchType) {
        this.matchType = matchType;
    }

    public UUID getBatchUuid() {
        return batchUuid;
    }

    public void setBatchUuid(UUID batchUuid) {
        this.batchUuid = batchUuid;
    }

    public String getBatchName() {
        return batchName;
    }

    public void setBatchName(String batchName) {
        this.batchName = batchName;
    }

    public UUID getCourtUuid() {
        return courtUuid;
    }

    public void setCourtUuid(UUID courtUuid) {
        this.courtUuid = courtUuid;
    }

    public String getCourtName() {
        return courtName;
    }

    public void setCourtName(String courtName) {
        this.courtName = courtName;
    }

    public UUID getCoachUuid() {
        return coachUuid;
    }

    public void setCoachUuid(UUID coachUuid) {
        this.coachUuid = coachUuid;
    }

    public String getCoachName() {
        return coachName;
    }

    public void setCoachName(String coachName) {
        this.coachName = coachName;
    }

    public LocalDate getMatchDate() {
        return matchDate;
    }

    public void setMatchDate(LocalDate matchDate) {
        this.matchDate = matchDate;
    }

    public String getMatchTime() {
        return matchTime;
    }

    public void setMatchTime(String matchTime) {
        this.matchTime = matchTime;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public UUID getPlayer1Uuid() {
        return player1Uuid;
    }

    public void setPlayer1Uuid(UUID player1Uuid) {
        this.player1Uuid = player1Uuid;
    }

    public String getPlayer1Name() {
        return player1Name;
    }

    public void setPlayer1Name(String player1Name) {
        this.player1Name = player1Name;
    }

    public UUID getPlayer2Uuid() {
        return player2Uuid;
    }

    public void setPlayer2Uuid(UUID player2Uuid) {
        this.player2Uuid = player2Uuid;
    }

    public String getPlayer2Name() {
        return player2Name;
    }

    public void setPlayer2Name(String player2Name) {
        this.player2Name = player2Name;
    }

    public Integer getTeam1Score() {
        return team1Score;
    }

    public void setTeam1Score(Integer team1Score) {
        this.team1Score = team1Score;
    }

    public UUID getPlayer3Uuid() {
        return player3Uuid;
    }

    public void setPlayer3Uuid(UUID player3Uuid) {
        this.player3Uuid = player3Uuid;
    }

    public String getPlayer3Name() {
        return player3Name;
    }

    public void setPlayer3Name(String player3Name) {
        this.player3Name = player3Name;
    }

    public UUID getPlayer4Uuid() {
        return player4Uuid;
    }

    public void setPlayer4Uuid(UUID player4Uuid) {
        this.player4Uuid = player4Uuid;
    }

    public String getPlayer4Name() {
        return player4Name;
    }

    public void setPlayer4Name(String player4Name) {
        this.player4Name = player4Name;
    }

    public Integer getTeam2Score() {
        return team2Score;
    }

    public void setTeam2Score(Integer team2Score) {
        this.team2Score = team2Score;
    }

    public Integer getWinnerTeam() {
        return winnerTeam;
    }

    public void setWinnerTeam(Integer winnerTeam) {
        this.winnerTeam = winnerTeam;
    }

    public String getWinnerName() {
        return winnerName;
    }

    public void setWinnerName(String winnerName) {
        this.winnerName = winnerName;
    }

    public String getScoresDetail() {
        return scoresDetail;
    }

    public void setScoresDetail(String scoresDetail) {
        this.scoresDetail = scoresDetail;
    }

    public String getRefereeName() {
        return refereeName;
    }

    public void setRefereeName(String refereeName) {
        this.refereeName = refereeName;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
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

    public Long getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(Long createdBy) {
        this.createdBy = createdBy;
    }

    public Long getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(Long updatedBy) {
        this.updatedBy = updatedBy;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof AcademyMatch)) return false;
        AcademyMatch that = (AcademyMatch) o;
        return Objects.equals(matchId, that.matchId) && Objects.equals(matchUuid, that.matchUuid);
    }

    @Override
    public int hashCode() {
        return Objects.hash(matchId, matchUuid);
    }
}
