package com.athlon.identityservice.subscription.dto.response;

import java.math.BigDecimal;
import java.util.UUID;

public class SubscriptionPackageResponse {

    private UUID uuid;
    private String name;
    private String description;
    private BigDecimal price;
    private Integer durationMonths;
    private String features;
    private Integer isActive;

    public SubscriptionPackageResponse() {
    }

    public UUID getUuid() { return uuid; }
    public void setUuid(UUID uuid) { this.uuid = uuid; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public Integer getDurationMonths() { return durationMonths; }
    public void setDurationMonths(Integer durationMonths) { this.durationMonths = durationMonths; }

    public String getFeatures() { return features; }
    public void setFeatures(String features) { this.features = features; }

    public Integer getIsActive() { return isActive; }
    public void setIsActive(Integer active) { isActive = active; }
}
