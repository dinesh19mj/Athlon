package com.athlon.identityservice.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public class CreateOrganizationModuleRequest {

    @NotBlank(message = "Module key is required")
    @Size(min = 2, max = 50, message = "Module key must be between 2 and 50 characters")
    @Pattern(regexp = "^[A-Za-z0-9_]+$", message = "Module key must contain only alphanumeric characters and underscores")
    private String moduleKey;

    @NotBlank(message = "Display name is required")
    @Size(max = 100, message = "Display name must not exceed 100 characters")
    private String displayName;

    @NotBlank(message = "Category label is required")
    @Size(max = 100, message = "Category label must not exceed 100 characters")
    private String categoryLabel;

    private String description;
    private String iconName = "Building2";
    private String status = "ACTIVE"; // ACTIVE, BETA, COMING_SOON, DISABLED
    private Boolean isEnabled = true;
    private Boolean allowWorkspaceCreation = true;
    private Boolean showInPricing = true;
    private Boolean showInDiscovery = true;
    private String badgeText;
    private String badgeVariant = "emerald";
    private String routePrefix;
    private Integer displayOrder = 0;
    private LocalDateTime targetLaunchDate;
    private String maintenanceMessage;

    public CreateOrganizationModuleRequest() {
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
}

