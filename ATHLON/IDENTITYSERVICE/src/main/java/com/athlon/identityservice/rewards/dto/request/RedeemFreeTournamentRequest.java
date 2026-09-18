package com.athlon.identityservice.rewards.dto.request;

import jakarta.validation.constraints.NotBlank;

public class RedeemFreeTournamentRequest {

    @NotBlank(message = "Target tournament or registration ID is required")
    private String targetId;

    private String targetName;

    public RedeemFreeTournamentRequest() {
    }

    public RedeemFreeTournamentRequest(String targetId, String targetName) {
        this.targetId = targetId;
        this.targetName = targetName;
    }

    public String getTargetId() {
        return targetId;
    }

    public void setTargetId(String targetId) {
        this.targetId = targetId;
    }

    public String getTargetName() {
        return targetName;
    }

    public void setTargetName(String targetName) {
        this.targetName = targetName;
    }
}
