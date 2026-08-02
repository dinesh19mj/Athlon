package com.athlon.identityservice.user.dto.response;

import java.util.UUID;

public class SportsProfileResponse {

    private UUID uuid;
    private String sportName;
    private Integer currentRanking;
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

    public Integer getCurrentRanking() {
        return currentRanking;
    }

    public void setCurrentRanking(Integer currentRanking) {
        this.currentRanking = currentRanking;
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
