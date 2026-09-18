package com.athlon.identityservice.rewards.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

import com.athlon.identityservice.rewards.enums.RedemptionStatus;
import com.athlon.identityservice.rewards.enums.RedemptionType;

public class CreditRedemptionResponse {

    private UUID redemptionUuid;
    private Long userId;
    private UUID userUuid;
    private RedemptionType redemptionType;
    private Integer creditsSpent;
    private String targetId;
    private RedemptionStatus status;
    private Long remainingBalance;
    private LocalDateTime createdAt;

    public CreditRedemptionResponse() {
    }

    public UUID getRedemptionUuid() {
        return redemptionUuid;
    }

    public void setRedemptionUuid(UUID redemptionUuid) {
        this.redemptionUuid = redemptionUuid;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public UUID getUserUuid() {
        return userUuid;
    }

    public void setUserUuid(UUID userUuid) {
        this.userUuid = userUuid;
    }

    public RedemptionType getRedemptionType() {
        return redemptionType;
    }

    public void setRedemptionType(RedemptionType redemptionType) {
        this.redemptionType = redemptionType;
    }

    public Integer getCreditsSpent() {
        return creditsSpent;
    }

    public void setCreditsSpent(Integer creditsSpent) {
        this.creditsSpent = creditsSpent;
    }

    public String getTargetId() {
        return targetId;
    }

    public void setTargetId(String targetId) {
        this.targetId = targetId;
    }

    public RedemptionStatus getStatus() {
        return status;
    }

    public void setStatus(RedemptionStatus status) {
        this.status = status;
    }

    public Long getRemainingBalance() {
        return remainingBalance;
    }

    public void setRemainingBalance(Long remainingBalance) {
        this.remainingBalance = remainingBalance;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
