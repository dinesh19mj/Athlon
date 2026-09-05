package com.athlon.identityservice.organization.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public class AcademyMatchResponse {

    private UUID matchUuid;
    private Long matchId;
    private UUID organizationUuid;
    private Long organizationId;
    private String matchTitle;
    private String sportType;
    private String matchType;
    private UUID batchUuid;
    private String batchName;
    private UUID courtUuid;
    private String courtName;
    private UUID coachUuid;
    private String coachName;
    private LocalDate matchDate;
    private String matchTime;
    private String status;

    // Team 1
    private UUID player1Uuid;
    private String player1Name;
    private UUID player2Uuid;
    private String player2Name;
    private Integer team1Score;

    // Team 2
    private UUID player3Uuid;
    private String player3Name;
    private UUID player4Uuid;
    private String player4Name;
    private Integer team2Score;

    // Results
    private Integer winnerTeam;
    private String winnerName;
    private String scoresDetail;
    private String refereeName;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public AcademyMatchResponse() {
    }

    public UUID getMatchUuid() {
        return matchUuid;
    }

    public void setMatchUuid(UUID matchUuid) {
        this.matchUuid = matchUuid;
    }

    public Long getMatchId() {
        return matchId;
    }

    public void setMatchId(Long matchId) {
        this.matchId = matchId;
    }

    public UUID getOrganizationUuid() {
        return organizationUuid;
    }

    public void setOrganizationUuid(UUID organizationUuid) {
        this.organizationUuid = organizationUuid;
    }

    public Long getOrganizationId() {
        return organizationId;
    }

    public void setOrganizationId(Long organizationId) {
        this.organizationId = organizationId;
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
}
