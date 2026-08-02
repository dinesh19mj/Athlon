package com.athlon.identityservice.subscription.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class CreateSubscriptionPackageRequest {

    @NotBlank(message = "Package name is required")
    private String name;

    private String description;

    @NotNull(message = "Price is required")
    private BigDecimal price;

    @NotNull(message = "Duration in months is required")
    private Integer durationMonths;

    private String features;

    public CreateSubscriptionPackageRequest() {
    }

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
}
