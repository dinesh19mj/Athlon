package com.athlon.marketplaceservice.dto;

import com.athlon.marketplaceservice.entity.MarketplaceProduct;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class MarketplaceProductDto {

    private Long id;
    private String title;
    private String description;
    private String sport;
    private String category;
    private BigDecimal price;
    private BigDecimal originalPrice;
    private String condition;
    private String conditionDetails;
    private String brand;
    private String model;
    private Integer yearOfPurchase;
    private String location;
    private String tags;
    private Boolean isVerified;
    private String verificationStatus;
    private String sellerId;
    private String sellerName;
    private String sellerRole;
    private String sellerAvatarUrl;
    private Long shopId;
    private String status;
    private Integer viewsCount;
    private Integer wishlistCount;
    private List<String> images;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public MarketplaceProductDto() {}

    public static MarketplaceProductDto fromEntity(MarketplaceProduct p) {
        if (p == null) return null;
        MarketplaceProductDto dto = new MarketplaceProductDto();
        dto.setId(p.getId());
        dto.setTitle(p.getTitle());
        dto.setDescription(p.getDescription());
        dto.setSport(p.getSport());
        dto.setCategory(p.getCategory());
        dto.setPrice(p.getPrice());
        dto.setOriginalPrice(p.getOriginalPrice());
        dto.setCondition(p.getCondition());
        dto.setConditionDetails(p.getConditionDetails());
        dto.setBrand(p.getBrand());
        dto.setModel(p.getModel());
        dto.setYearOfPurchase(p.getYearOfPurchase());
        dto.setLocation(p.getLocation());
        dto.setTags(p.getTags());
        dto.setIsVerified(p.getIsVerified());
        dto.setVerificationStatus(p.getVerificationStatus());
        dto.setSellerId(p.getSellerId());
        dto.setSellerName(p.getSellerName());
        dto.setSellerRole(p.getSellerRole());
        dto.setSellerAvatarUrl(p.getSellerAvatarUrl());
        dto.setShopId(p.getShopId());
        dto.setStatus(p.getStatus());
        dto.setViewsCount(p.getViewsCount());
        dto.setWishlistCount(p.getWishlistCount());
        dto.setImages(p.getImages());
        dto.setCreatedAt(p.getCreatedAt());
        dto.setUpdatedAt(p.getUpdatedAt());
        return dto;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

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

    public Boolean getIsVerified() { return isVerified; }
    public void setIsVerified(Boolean isVerified) { this.isVerified = isVerified; }

    public String getVerificationStatus() { return verificationStatus; }
    public void setVerificationStatus(String verificationStatus) { this.verificationStatus = verificationStatus; }

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

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getViewsCount() { return viewsCount; }
    public void setViewsCount(Integer viewsCount) { this.viewsCount = viewsCount; }

    public Integer getWishlistCount() { return wishlistCount; }
    public void setWishlistCount(Integer wishlistCount) { this.wishlistCount = wishlistCount; }

    public List<String> getImages() { return images; }
    public void setImages(List<String> images) { this.images = images; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
