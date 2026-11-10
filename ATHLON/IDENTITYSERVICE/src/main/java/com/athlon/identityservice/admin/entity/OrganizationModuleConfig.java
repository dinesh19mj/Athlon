package com.athlon.identityservice.admin.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "organization_module_configs")
public class OrganizationModuleConfig {

    @Id
    @Column(name = "module_key", nullable = false, length = 50)
    private String moduleKey;

    @Column(name = "display_name", nullable = false, length = 100)
    private String displayName;

    @Column(name = "category_label", nullable = false, length = 100)
    private String categoryLabel;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "icon_name", length = 50)
    private String iconName = "Building2";

    @Column(name = "status", nullable = false, length = 30)
    private String status = "ACTIVE"; // ACTIVE, BETA, COMING_SOON, DISABLED

    @Column(name = "is_enabled", nullable = false)
    private Boolean isEnabled = true;

    @Column(name = "is_system_core", nullable = false)
    private Boolean isSystemCore = false;

    @Column(name = "allow_workspace_creation", nullable = false)
    private Boolean allowWorkspaceCreation = true;

    @Column(name = "show_in_pricing", nullable = false)
    private Boolean showInPricing = true;

    @Column(name = "show_in_discovery", nullable = false)
    private Boolean showInDiscovery = true;

    @Column(name = "badge_text", length = 50)
    private String badgeText;

    @Column(name = "badge_variant", length = 30)
    private String badgeVariant = "emerald";

    @Column(name = "route_prefix", length = 100)
    private String routePrefix;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;

    @Column(name = "target_launch_date")
    private LocalDateTime targetLaunchDate;

    @Column(name = "maintenance_message", columnDefinition = "TEXT")
    private String maintenanceMessage;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "updated_by")
    private Long updatedBy;

    public OrganizationModuleConfig() {
    }

    public OrganizationModuleConfig(String moduleKey, String displayName, String categoryLabel, String description) {
        this.moduleKey = moduleKey;
        this.displayName = displayName;
        this.categoryLabel = categoryLabel;
        this.description = description;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Long getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(Long updatedBy) {
        this.updatedBy = updatedBy;
    }
}

