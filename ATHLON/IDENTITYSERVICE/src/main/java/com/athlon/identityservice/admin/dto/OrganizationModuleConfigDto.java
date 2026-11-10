package com.athlon.identityservice.admin.dto;

import java.time.LocalDateTime;

public class OrganizationModuleConfigDto {

    private String moduleKey;
    private String displayName;
    private String categoryLabel;
    private String description;
    private String iconName;
    private String status; // ACTIVE, BETA, COMING_SOON, DISABLED
    private Boolean isEnabled;
    private Boolean isSystemCore;
    private Boolean allowWorkspaceCreation;
    private Boolean showInPricing;
    private Boolean showInDiscovery;
    private String badgeText;
    private String badgeVariant;
    private String routePrefix;
    private Integer displayOrder;
    private LocalDateTime targetLaunchDate;
    private String maintenanceMessage;
    private LocalDateTime updatedAt;

    public OrganizationModuleConfigDto() {
    }

    public String getModuleKey() {
        return moduleKey;
    }

    public void setModuleKey(String moduleKey) {
        this.moduleKey = moduleKey;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public String getCategoryLabel() {
        return categoryLabel;
    }

    public void setCategoryLabel(String categoryLabel) {
        this.categoryLabel = categoryLabel;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getIconName() {
        return iconName;
    }

    public void setIconName(String iconName) {
        this.iconName = iconName;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Boolean getIsEnabled() {
        return isEnabled;
    }

    public void setIsEnabled(Boolean enabled) {
        isEnabled = enabled;
    }

    public Boolean getIsSystemCore() {
        return isSystemCore;
    }

    public void setIsSystemCore(Boolean systemCore) {
        isSystemCore = systemCore;
    }

    public Boolean getAllowWorkspaceCreation() {
        return allowWorkspaceCreation;
    }

    public void setAllowWorkspaceCreation(Boolean allowWorkspaceCreation) {
        this.allowWorkspaceCreation = allowWorkspaceCreation;
    }

    public Boolean getShowInPricing() {
        return showInPricing;
    }

    public void setShowInPricing(Boolean showInPricing) {
        this.showInPricing = showInPricing;
    }

    public Boolean getShowInDiscovery() {
        return showInDiscovery;
    }

    public void setShowInDiscovery(Boolean showInDiscovery) {
        this.showInDiscovery = showInDiscovery;
    }

    public String getBadgeText() {
        return badgeText;
    }

    public void setBadgeText(String badgeText) {
        this.badgeText = badgeText;
    }

    public String getBadgeVariant() {
        return badgeVariant;
    }

    public void setBadgeVariant(String badgeVariant) {
        this.badgeVariant = badgeVariant;
    }

    public String getRoutePrefix() {
        return routePrefix;
    }

    public void setRoutePrefix(String routePrefix) {
        this.routePrefix = routePrefix;
    }

    public Integer getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }

    public LocalDateTime getTargetLaunchDate() {
        return targetLaunchDate;
    }

    public void setTargetLaunchDate(LocalDateTime targetLaunchDate) {
        this.targetLaunchDate = targetLaunchDate;
    }

    public String getMaintenanceMessage() {
        return maintenanceMessage;
    }

    public void setMaintenanceMessage(String maintenanceMessage) {
        this.maintenanceMessage = maintenanceMessage;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}

