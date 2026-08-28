package com.athlon.identityservice.user.dto.response;

import java.util.UUID;

public class SportsProfileResponse {

    private UUID uuid;
    private String sportName;
    private String category;
    private Integer currentRanking;
    private Integer eloRating = 1200;
    private Integer highestElo = 1200;
    private Integer totalMatches = 0;
    private Integer matchesWon = 0;
    private Integer matchesLost = 0;
    private Double winRate = 0.0;
    private Integer currentStreak = 0;
    private Integer globalRank;
    private Integer stateRank;
    private Integer districtRank;
    private String verificationStatus;
    private String careerHighlights;
    private boolean isActive;

    public SportsProfileResponse() {
    }

    public UUID getUuid() {
        return uuid;
    }

    public void setUuid(UUID uuid) {
        this.uuid = uuid;
    }

    public String getSportName() {
        return sportName;
    }

    public void setSportName(String sportName) {
        this.sportName = sportName;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Integer getCurrentRanking() {
        return currentRanking;
    }

    public void setCurrentRanking(Integer currentRanking) {
        this.currentRanking = currentRanking;
    }

    public Integer getEloRating() {
        return eloRating;
    }

    public void setEloRating(Integer eloRating) {
        this.eloRating = eloRating;
    }

    public Integer getHighestElo() {
        return highestElo;
    }

    public void setHighestElo(Integer highestElo) {
        this.highestElo = highestElo;
    }

    public Integer getTotalMatches() {
        return totalMatches;
    }

    public void setTotalMatches(Integer totalMatches) {
        this.totalMatches = totalMatches;
    }

    public Integer getMatchesWon() {
        return matchesWon;
    }

    public void setMatchesWon(Integer matchesWon) {
        this.matchesWon = matchesWon;
    }

    public Integer getMatchesLost() {
        return matchesLost;
    }

    public void setMatchesLost(Integer matchesLost) {
        this.matchesLost = matchesLost;
    }

    public Double getWinRate() {
        return winRate;
    }

    public void setWinRate(Double winRate) {
        this.winRate = winRate;
    }

    public Integer getCurrentStreak() {
        return currentStreak;
    }

    public void setCurrentStreak(Integer currentStreak) {
        this.currentStreak = currentStreak;
    }

    public Integer getGlobalRank() {
        return globalRank;
    }

    public void setGlobalRank(Integer globalRank) {
        this.globalRank = globalRank;
    }

    public Integer getStateRank() {
        return stateRank;
    }

    public void setStateRank(Integer stateRank) {
        this.stateRank = stateRank;
    }

    public Integer getDistrictRank() {
        return districtRank;
    }

    public void setDistrictRank(Integer districtRank) {
        this.districtRank = districtRank;
    }

    public String getVerificationStatus() {
        return verificationStatus;
    }

    public void setVerificationStatus(String verificationStatus) {
        this.verificationStatus = verificationStatus;
    }

    public String getCareerHighlights() {
        return careerHighlights;
    }

    public void setCareerHighlights(String careerHighlights) {
        this.careerHighlights = careerHighlights;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
    }
}
