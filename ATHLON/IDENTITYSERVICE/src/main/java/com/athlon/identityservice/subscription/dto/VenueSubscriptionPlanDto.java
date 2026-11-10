package com.athlon.identityservice.subscription.dto;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

public class VenueSubscriptionPlanDto {
    private Long planId;
    private UUID planUuid;
    private String planCode;
    private String name;
    private String description;
    private Integer displayOrder;
    private Long versionId;
    private Integer versionNumber;
    private BigDecimal marketplaceCommissionRate;
    private BigDecimal monthlyPrice;
    private BigDecimal yearlyPrice;
    private Map<String, Integer> limits;
    private Map<String, Boolean> features;

    public VenueSubscriptionPlanDto() {
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

    public Integer getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }

    public Long getVersionId() {
        return versionId;
    }

    public void setVersionId(Long versionId) {
        this.versionId = versionId;
    }

    public Integer getVersionNumber() {
        return versionNumber;
    }

    public void setVersionNumber(Integer versionNumber) {
        this.versionNumber = versionNumber;
    }

    public BigDecimal getMarketplaceCommissionRate() {
        return marketplaceCommissionRate;
    }

    public void setMarketplaceCommissionRate(BigDecimal marketplaceCommissionRate) {
        this.marketplaceCommissionRate = marketplaceCommissionRate;
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

