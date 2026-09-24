package com.athlon.marketplaceservice.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class MarketplaceProductRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotBlank(message = "Sport category is required")
    private String sport;

    @NotBlank(message = "Product category is required")
    private String category;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than zero")
    private BigDecimal price;

    private BigDecimal originalPrice;

    @NotBlank(message = "Condition is required")
    private String condition; // NEW, LIKE_NEW, EXCELLENT, GOOD, FAIR

    private String conditionDetails;
    private String brand;
    private String model;
    private Integer yearOfPurchase;

    @NotBlank(message = "Location is required")
    private String location;

    private String tags;

    private String sellerId;
    private String sellerName;
    private String sellerRole;
    private String sellerAvatarUrl;
    private Long shopId;

    private List<String> images = new ArrayList<>();

    // Getters and Setters
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getSport() { return sport; }
    public void setSport(String sport) { this.sport = sport; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public BigDecimal getOriginalPrice() { return originalPrice; }
    public void setOriginalPrice(BigDecimal originalPrice) { this.originalPrice = originalPrice; }

    public String getCondition() { return condition; }
    public void setCondition(String condition) { this.condition = condition; }

    public String getConditionDetails() { return conditionDetails; }
    public void setConditionDetails(String conditionDetails) { this.conditionDetails = conditionDetails; }

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public Integer getYearOfPurchase() { return yearOfPurchase; }
    public void setYearOfPurchase(Integer yearOfPurchase) { this.yearOfPurchase = yearOfPurchase; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }

    public String getSellerId() { return sellerId; }
    public void setSellerId(String sellerId) { this.sellerId = sellerId; }

    public String getSellerName() { return sellerName; }
    public void setSellerName(String sellerName) { this.sellerName = sellerName; }

    public String getSellerRole() { return sellerRole; }
    public void setSellerRole(String sellerRole) { this.sellerRole = sellerRole; }

    public String getSellerAvatarUrl() { return sellerAvatarUrl; }
    public void setSellerAvatarUrl(String sellerAvatarUrl) { this.sellerAvatarUrl = sellerAvatarUrl; }

    public Long getShopId() { return shopId; }
    public void setShopId(Long shopId) { this.shopId = shopId; }

    public List<String> getImages() { return images; }
    public void setImages(List<String> images) { this.images = images; }
}
