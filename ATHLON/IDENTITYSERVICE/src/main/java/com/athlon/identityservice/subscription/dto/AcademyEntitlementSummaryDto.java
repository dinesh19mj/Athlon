package com.athlon.identityservice.subscription.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class AcademyEntitlementSummaryDto {

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

    // Quotas & Usages
    private Long currentStudents;
    private Integer maxStudents;
    private Long currentCoaches;
    private Integer maxCoaches;
    private Long currentCentres;
    private Integer maxCentres;

    // Add-on allowances
    private Integer addonStudents;
    private Integer addonCoaches;
    private Integer addonCentres;

    private Map<String, Boolean> features;
    private List<AddonSummaryDto> activeAddons;

    public AcademyEntitlementSummaryDto() {
    }

    public static class AddonSummaryDto {
        private Long addonId;
        private String addonType;
        private Integer quantity;
        private LocalDateTime endDate;
        private String status;

        public AddonSummaryDto() {
        }

        public Long getAddonId() {
            return addonId;
        }

        public void setAddonId(Long addonId) {
            this.addonId = addonId;
        }

        public String getAddonType() {
            return addonType;
        }

        public void setAddonType(String addonType) {
            this.addonType = addonType;
        }

        public Integer getQuantity() {
            return quantity;
        }

        public void setQuantity(Integer quantity) {
            this.quantity = quantity;
        }

        public LocalDateTime getEndDate() {
            return endDate;
        }

        public void setEndDate(LocalDateTime endDate) {
            this.endDate = endDate;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }
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

    public Long getCurrentStudents() {
        return currentStudents;
    }

    public void setCurrentStudents(Long currentStudents) {
        this.currentStudents = currentStudents;
    }

    public Integer getMaxStudents() {
        return maxStudents;
    }

    public void setMaxStudents(Integer maxStudents) {
        this.maxStudents = maxStudents;
    }

    public Long getCurrentCoaches() {
        return currentCoaches;
    }

    public void setCurrentCoaches(Long currentCoaches) {
        this.currentCoaches = currentCoaches;
    }

    public Integer getMaxCoaches() {
        return maxCoaches;
    }

    public void setMaxCoaches(Integer maxCoaches) {
        this.maxCoaches = maxCoaches;
    }

    public Long getCurrentCentres() {
        return currentCentres;
    }

    public void setCurrentCentres(Long currentCentres) {
        this.currentCentres = currentCentres;
    }

    public Integer getMaxCentres() {
        return maxCentres;
    }

    public void setMaxCentres(Integer maxCentres) {
        this.maxCentres = maxCentres;
    }

    public Integer getAddonStudents() {
        return addonStudents;
    }

    public void setAddonStudents(Integer addonStudents) {
        this.addonStudents = addonStudents;
    }

    public Integer getAddonCoaches() {
        return addonCoaches;
    }

    public void setAddonCoaches(Integer addonCoaches) {
        this.addonCoaches = addonCoaches;
    }

    public Integer getAddonCentres() {
        return addonCentres;
    }

    public void setAddonCentres(Integer addonCentres) {
        this.addonCentres = addonCentres;
    }

    public Map<String, Boolean> getFeatures() {
        return features;
    }

    public void setFeatures(Map<String, Boolean> features) {
        this.features = features;
    }

    public List<AddonSummaryDto> getActiveAddons() {
        return activeAddons;
    }

    public void setActiveAddons(List<AddonSummaryDto> activeAddons) {
        this.activeAddons = activeAddons;
    }
}

