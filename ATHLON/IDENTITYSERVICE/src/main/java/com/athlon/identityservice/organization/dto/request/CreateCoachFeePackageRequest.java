package com.athlon.identityservice.organization.dto.request;

import java.math.BigDecimal;
import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreateCoachFeePackageRequest {

    @NotNull(message = "Organization UUID is required")
    private UUID organizationUuid;

    @NotBlank(message = "Package name is required")
    private String name;

    private String category; // 1on1, group, monthly, sparring, camp
    private String categoryLabel;
    private BigDecimal price;
    private String billingCycle; // per_session, per_hour, monthly, quarterly
    private Integer sessionsPerWeek = 3;
    private Integer maxTrainees = 1;
    private String description;
    private String features; // JSON array or formatted string
    private Boolean isPopular = false;
    private Boolean active = true;

    public CreateCoachFeePackageRequest() {
    }

    public UUID getOrganizationUuid() {
        return organizationUuid;
    }

    public void setOrganizationUuid(UUID organizationUuid) {
        this.organizationUuid = organizationUuid;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getCategoryLabel() {
        return categoryLabel;
    }

    public void setCategoryLabel(String categoryLabel) {
        this.categoryLabel = categoryLabel;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public String getBillingCycle() {
        return billingCycle;
    }

    public void setBillingCycle(String billingCycle) {
        this.billingCycle = billingCycle;
    }

    public Integer getSessionsPerWeek() {
        return sessionsPerWeek;
    }

    public void setSessionsPerWeek(Integer sessionsPerWeek) {
        this.sessionsPerWeek = sessionsPerWeek;
    }

    public Integer getMaxTrainees() {
        return maxTrainees;
    }

    public void setMaxTrainees(Integer maxTrainees) {
        this.maxTrainees = maxTrainees;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getFeatures() {
        return features;
    }

    public void setFeatures(String features) {
        this.features = features;
    }

    public Boolean getIsPopular() {
        return isPopular;
    }

    public void setIsPopular(Boolean isPopular) {
        this.isPopular = isPopular;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}
