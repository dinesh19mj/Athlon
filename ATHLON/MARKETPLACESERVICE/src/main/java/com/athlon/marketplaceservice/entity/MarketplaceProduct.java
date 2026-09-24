package com.athlon.marketplaceservice.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "marketplace_products")
public class MarketplaceProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String sport; // Badminton, Cricket, Football, Tennis, Fitness, Running, etc.

    @Column(nullable = false)
    private String category; // Racquets, Bats, Shoes, Apparel, Accessories, Protective, etc.

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(precision = 12, scale = 2)
    private BigDecimal originalPrice;

    @Column(nullable = false)
    private String condition; // NEW, LIKE_NEW, EXCELLENT, GOOD, FAIR

    @Column(columnDefinition = "TEXT")
    private String conditionDetails;

    private String brand;
    private String model;
    private Integer yearOfPurchase;

    @Column(nullable = false)
    private String location; // City, State

    private String tags; // Comma separated tags e.g. "yonex,carbon,strung"

    @Column(nullable = false)
    private Boolean isVerified = false;

    @Column(nullable = false)
    private String verificationStatus = "UNVERIFIED"; // UNVERIFIED, COMMUNITY_VERIFIED, PRO_VERIFIED

    @Column(nullable = false)
    private String sellerId; // User ID of seller

    private String sellerName;
    private String sellerRole = "Individual Seller"; // Individual Seller, Verified Shop, Pro Coach
    private String sellerAvatarUrl;

    private Long shopId; // Null if individual seller

    @Column(nullable = false)
    private String status = "AVAILABLE"; // AVAILABLE, RESERVED, SOLD, ARCHIVED

    private Integer viewsCount = 0;
    private Integer wishlistCount = 0;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "marketplace_product_images", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "image_url")
    private List<String> images = new ArrayList<>();

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.viewsCount == null) this.viewsCount = 0;
        if (this.wishlistCount == null) this.wishlistCount = 0;
        if (this.status == null) this.status = "AVAILABLE";
        if (this.verificationStatus == null) this.verificationStatus = "UNVERIFIED";
        if (this.isVerified == null) this.isVerified = false;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
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
