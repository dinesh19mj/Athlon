package com.athlon.identityservice.subscription.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

public class VenueEntitlementSummaryDto {
    private String planCode;
    private String planName;
    private String billingCycle;
    private String status;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Long daysRemaining;
    private BigDecimal marketplaceCommissionRate;
    private Map<String, Integer> limits;
    private Map<String, Integer> usage;
    private Map<String, Boolean> features;
    private boolean isExpired;
    private boolean canAddFacility;
    private boolean canAddStaff;
    private boolean canAddVenue;

    public VenueEntitlementSummaryDto() {
    }

    public String getPlanCode() {
        return planCode;
    }

    public void setPlanCode(String planCode) {
        this.planCode = planCode;
    }

    public String getPlanName() {
        return planName;
    }

    public void setPlanName(String planName) {
        this.planName = planName;
    }

    public String getBillingCycle() {
        return billingCycle;
    }

    public void setBillingCycle(String billingCycle) {
        this.billingCycle = billingCycle;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }

    public LocalDateTime getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
    }

    public Long getDaysRemaining() {
        return daysRemaining;
    }

    public void setDaysRemaining(Long daysRemaining) {
        this.daysRemaining = daysRemaining;
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

    public Map<String, Integer> getUsage() {
        return usage;
    }

    public void setUsage(Map<String, Integer> usage) {
        this.usage = usage;
    }

    public Map<String, Boolean> getFeatures() {
        return features;
    }

    public void setFeatures(Map<String, Boolean> features) {
        this.features = features;
    }

    public boolean isExpired() {
        return isExpired;
    }

    public void setExpired(boolean expired) {
        isExpired = expired;
    }

    public boolean isCanAddFacility() {
        return canAddFacility;
    }

    public void setCanAddFacility(boolean canAddFacility) {
        this.canAddFacility = canAddFacility;
    }

    public boolean isCanAddStaff() {
        return canAddStaff;
    }

    public void setCanAddStaff(boolean canAddStaff) {
        this.canAddStaff = canAddStaff;
    }

    public boolean isCanAddVenue() {
        return canAddVenue;
    }

    public void setCanAddVenue(boolean canAddVenue) {
        this.canAddVenue = canAddVenue;
    }
}

