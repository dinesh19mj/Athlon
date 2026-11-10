package com.athlon.identityservice.subscription.dto;

import java.time.LocalDateTime;
import java.util.Map;

public class ClubEntitlementSummaryDto {

    private Long organizationId;
    private String organizationUuid;
    private String organizationName;
    private String activePlanCode;
    private String activePlanName;
    private String subscriptionStatus;
    private String billingCycle;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Long daysRemaining;
    private Boolean isTrialActive;
    private Boolean isExpired;

    // Quotas & Usage
    private Long currentMembers;
    private Integer maxMembers;
    private Long currentManagers;
    private Integer maxManagers;

    private Map<String, Boolean> features;

    public ClubEntitlementSummaryDto() {
    }

    public Long getOrganizationId() {
        return organizationId;
    }

    public void setOrganizationId(Long organizationId) {
        this.organizationId = organizationId;
    }

    public String getOrganizationUuid() {
        return organizationUuid;
    }

    public void setOrganizationUuid(String organizationUuid) {
        this.organizationUuid = organizationUuid;
    }

    public String getOrganizationName() {
        return organizationName;
    }

    public void setOrganizationName(String organizationName) {
        this.organizationName = organizationName;
    }

    public String getActivePlanCode() {
        return activePlanCode;
    }

    public void setActivePlanCode(String activePlanCode) {
        this.activePlanCode = activePlanCode;
    }

    public String getActivePlanName() {
        return activePlanName;
    }

    public void setActivePlanName(String activePlanName) {
        this.activePlanName = activePlanName;
    }

    public String getSubscriptionStatus() {
        return subscriptionStatus;
    }

    public void setSubscriptionStatus(String subscriptionStatus) {
        this.subscriptionStatus = subscriptionStatus;
    }

    public String getBillingCycle() {
        return billingCycle;
    }

    public void setBillingCycle(String billingCycle) {
        this.billingCycle = billingCycle;
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

    public Boolean getIsTrialActive() {
        return isTrialActive;
    }

    public void setIsTrialActive(Boolean isTrialActive) {
        this.isTrialActive = isTrialActive;
    }

    public Boolean getIsExpired() {
        return isExpired;
    }

    public void setIsExpired(Boolean isExpired) {
        this.isExpired = isExpired;
    }

    public Long getCurrentMembers() {
        return currentMembers;
    }

    public void setCurrentMembers(Long currentMembers) {
        this.currentMembers = currentMembers;
    }

    public Integer getMaxMembers() {
        return maxMembers;
    }

    public void setMaxMembers(Integer maxMembers) {
        this.maxMembers = maxMembers;
    }

    public Long getCurrentManagers() {
        return currentManagers;
    }

    public void setCurrentManagers(Long currentManagers) {
        this.currentManagers = currentManagers;
    }

    public Integer getMaxManagers() {
        return maxManagers;
    }

    public void setMaxManagers(Integer maxManagers) {
        this.maxManagers = maxManagers;
    }

    public Map<String, Boolean> getFeatures() {
        return features;
    }

    public void setFeatures(Map<String, Boolean> features) {
        this.features = features;
    }
}

