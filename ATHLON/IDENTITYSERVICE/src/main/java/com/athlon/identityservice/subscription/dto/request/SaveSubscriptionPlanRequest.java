package com.athlon.identityservice.subscription.dto.request;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

public class SaveSubscriptionPlanRequest {
    private Long planId;
    private UUID planUuid;
    private String planCode;
    private String name;
    private String description;
    private String targetModule; // VENUE, TOURNAMENT, ACADEMY, CLUB, COACH, COMMUNITY
    private Integer displayOrder;
    private Integer isActive;

    // Pricing
    private BigDecimal monthlyPrice;
    private BigDecimal yearlyPrice;
    private BigDecimal packagePrice; // for tournament packs
    private BigDecimal marketplaceCommissionRate; // for venues (e.g. 5.0)

    // Quotas / Numerical Limits
    private Map<String, Integer> limits;

    // Feature Toggles
    private Map<String, Boolean> features;

    public SaveSubscriptionPlanRequest() {
    }

    public Long getPlanId() {
        return planId;
    }

    public void setPlanId(Long planId) {
        this.planId = planId;
    }

    public UUID getPlanUuid() {
        return planUuid;
    }

    public void setPlanUuid(UUID planUuid) {
        this.planUuid = planUuid;
    }

    public String getPlanCode() {
        return planCode;
    }

    public void setPlanCode(String planCode) {
        this.planCode = planCode;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getTargetModule() {
        return targetModule;
    }

    public void setTargetModule(String targetModule) {
        this.targetModule = targetModule;
    }

    public Integer getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }

    public Integer getIsActive() {
        return isActive;
    }

    public void setIsActive(Integer isActive) {
        this.isActive = isActive;
    }

    public BigDecimal getMonthlyPrice() {
        return monthlyPrice;
    }

    public void setMonthlyPrice(BigDecimal monthlyPrice) {
        this.monthlyPrice = monthlyPrice;
    }

    public BigDecimal getYearlyPrice() {
        return yearlyPrice;
    }

    public void setYearlyPrice(BigDecimal yearlyPrice) {
        this.yearlyPrice = yearlyPrice;
    }

    public BigDecimal getPackagePrice() {
        return packagePrice;
    }

    public void setPackagePrice(BigDecimal packagePrice) {
        this.packagePrice = packagePrice;
    }

    public BigDecimal getMarketplaceCommissionRate() {
        return marketplaceCommissionRate;
    }

    public void setMarketplaceCommissionRate(BigDecimal marketplaceCommissionRate) {
        this.marketplaceCommissionRate = marketplaceCommissionRate;
    }

    public Map<String, Integer> getLimits() {
        return limits;
    }

    public void setLimits(Map<String, Integer> limits) {
        this.limits = limits;
    }

    public Map<String, Boolean> getFeatures() {
        return features;
    }

    public void setFeatures(Map<String, Boolean> features) {
        this.features = features;
    }
}

