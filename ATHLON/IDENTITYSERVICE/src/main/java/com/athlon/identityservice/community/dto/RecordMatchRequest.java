package com.athlon.identityservice.community.dto;

import java.time.LocalDate;
import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class RecordMatchRequest {

    private UUID sessionUuid;

    @NotBlank(message = "Sport is required")
    private String sport;

    private String matchType = "SINGLES"; // SINGLES, DOUBLES, TEAM

    @NotBlank(message = "Team A name is required")
    private String teamAName;

    @NotBlank(message = "Team B name is required")
    private String teamBName;

    private String teamAPlayerUuids;
    private String teamBPlayerUuids;

    @NotNull(message = "Team A score is required")
    private Integer teamAScore;

    @NotNull(message = "Team B score is required")
    private Integer teamBScore;

    private String scoresJson;
    private String winnerTeam; // A, B, DRAW
    private LocalDate matchDate = LocalDate.now();

    public RecordMatchRequest() {
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
}
