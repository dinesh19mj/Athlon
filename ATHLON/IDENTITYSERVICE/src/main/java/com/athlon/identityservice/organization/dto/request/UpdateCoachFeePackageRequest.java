package com.athlon.identityservice.organization.dto.request;

import java.math.BigDecimal;
import java.util.UUID;

import jakarta.validation.constraints.NotNull;

public class UpdateCoachFeePackageRequest {

    @NotNull(message = "Package UUID is required")
    private UUID packageUuid;

    private String name;
    private String category;
    private String categoryLabel;
    private BigDecimal price;
    private String billingCycle;
    private Integer sessionsPerWeek;
    private Integer maxTrainees;
    private String description;
    private String features;
    private Boolean isPopular;
    private Boolean active;

    public UpdateCoachFeePackageRequest() {
    }

    public UUID getPackageUuid() {
        return packageUuid;
    }

    public void setPackageUuid(UUID packageUuid) {
        this.packageUuid = packageUuid;
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
