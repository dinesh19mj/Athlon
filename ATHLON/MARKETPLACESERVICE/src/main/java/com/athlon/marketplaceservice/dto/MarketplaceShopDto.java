package com.athlon.marketplaceservice.dto;

import com.athlon.marketplaceservice.entity.MarketplaceShop;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class MarketplaceShopDto {

    private Long id;
    private String ownerUserId;
    private String shopName;
    private String slug;
    private String logoUrl;
    private String bannerUrl;
    private String description;
    private String address;
    private String city;
    private String state;
    private String contactPhone;
    private String contactEmail;
    private Boolean isVerified;
    private BigDecimal rating;
    private Integer totalReviews;
    private String status;
    private LocalDateTime createdAt;

    public MarketplaceShopDto() {}

    public static MarketplaceShopDto fromEntity(MarketplaceShop s) {
        if (s == null) return null;
        MarketplaceShopDto dto = new MarketplaceShopDto();
        dto.setId(s.getId());
        dto.setOwnerUserId(s.getOwnerUserId());
        dto.setShopName(s.getShopName());
        dto.setSlug(s.getSlug());
        dto.setLogoUrl(s.getLogoUrl());
        dto.setBannerUrl(s.getBannerUrl());
        dto.setDescription(s.getDescription());
        dto.setAddress(s.getAddress());
        dto.setCity(s.getCity());
        dto.setState(s.getState());
        dto.setContactPhone(s.getContactPhone());
        dto.setContactEmail(s.getContactEmail());
        dto.setIsVerified(s.getIsVerified());
        dto.setRating(s.getRating());
        dto.setTotalReviews(s.getTotalReviews());
        dto.setStatus(s.getStatus());
        dto.setCreatedAt(s.getCreatedAt());
        return dto;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getOwnerUserId() { return ownerUserId; }
    public void setOwnerUserId(String ownerUserId) { this.ownerUserId = ownerUserId; }

    public String getShopName() { return shopName; }
    public void setShopName(String shopName) { this.shopName = shopName; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }

    public String getBannerUrl() { return bannerUrl; }
    public void setBannerUrl(String bannerUrl) { this.bannerUrl = bannerUrl; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }

    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }

    public Boolean getIsVerified() { return isVerified; }
    public void setIsVerified(Boolean isVerified) { this.isVerified = isVerified; }

    public BigDecimal getRating() { return rating; }
    public void setRating(BigDecimal rating) { this.rating = rating; }

    public Integer getTotalReviews() { return totalReviews; }
    public void setTotalReviews(Integer totalReviews) { this.totalReviews = totalReviews; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
