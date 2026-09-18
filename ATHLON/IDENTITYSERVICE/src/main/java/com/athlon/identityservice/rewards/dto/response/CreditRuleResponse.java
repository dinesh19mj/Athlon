package com.athlon.identityservice.rewards.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

import com.athlon.identityservice.rewards.enums.CreditRuleCategory;

public class CreditRuleResponse {

    private UUID ruleUuid;
    private String ruleKey;
    private String ruleName;
    private CreditRuleCategory category;
    private Integer creditAmount;
    private Integer minThreshold;
    private String description;
    private Integer isActive;
    private LocalDateTime updatedAt;

    public CreditRuleResponse() {
    }

    public UUID getRuleUuid() {
        return ruleUuid;
    }

    public void setRuleUuid(UUID ruleUuid) {
        this.ruleUuid = ruleUuid;
    }

    public String getRuleKey() {
        return ruleKey;
    }

    public void setRuleKey(String ruleKey) {
        this.ruleKey = ruleKey;
    }

    public String getRuleName() {
        return ruleName;
    }

    public void setRuleName(String ruleName) {
        this.ruleName = ruleName;
    }

    public CreditRuleCategory getCategory() {
        return category;
    }

    public void setCategory(CreditRuleCategory category) {
        this.category = category;
    }

    public Integer getCreditAmount() {
        return creditAmount;
    }

    public void setCreditAmount(Integer creditAmount) {
        this.creditAmount = creditAmount;
    }

    public Integer getMinThreshold() {
        return minThreshold;
    }

    public void setMinThreshold(Integer minThreshold) {
        this.minThreshold = minThreshold;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getIsActive() {
        return isActive;
    }

    public void setIsActive(Integer isActive) {
        this.isActive = isActive;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
