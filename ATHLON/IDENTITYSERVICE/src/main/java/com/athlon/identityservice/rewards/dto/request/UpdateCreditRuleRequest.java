package com.athlon.identityservice.rewards.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class UpdateCreditRuleRequest {

    @NotBlank(message = "Rule key cannot be blank")
    private String ruleKey;

    private String ruleName;

    @NotNull(message = "Credit amount cannot be null")
    @Min(value = 0, message = "Credit amount must be 0 or greater")
    private Integer creditAmount;

    @Min(value = 0, message = "Min threshold must be 0 or greater")
    private Integer minThreshold;

    private String description;

    private Integer isActive;

    public UpdateCreditRuleRequest() {
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
}
