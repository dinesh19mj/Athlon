package com.athlon.marketplaceservice.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "marketplace_seller_profiles")
public class MarketplaceSellerProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String userId;

    @Column(nullable = false)
    private String sellerType = "INDIVIDUAL"; // INDIVIDUAL, VERIFIED_SHOP

    @Column(nullable = false)
    private Boolean tournamentEligibilityVerified = false;

    @Column(nullable = false)
    private Integer verifiedTournamentsCount = 0;

    @Column(nullable = false)
    private Boolean isSubscriptionActive = false;

    private String subscriptionTier; // NONE, SHOP_STARTER, SHOP_PRO, SHOP_ENTERPRISE
    private LocalDateTime subscriptionExpiresAt;

    @Column(precision = 5, scale = 2)
    private BigDecimal commissionRatePercent = BigDecimal.valueOf(5.00); // 5% default for eligible individuals

    @Column(precision = 3, scale = 2)
    private BigDecimal rating = BigDecimal.valueOf(5.00);

    private Integer totalSales = 0;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.verifiedTournamentsCount == null) this.verifiedTournamentsCount = 0;
        if (this.tournamentEligibilityVerified == null) this.tournamentEligibilityVerified = false;
        if (this.isSubscriptionActive == null) this.isSubscriptionActive = false;
        if (this.commissionRatePercent == null) this.commissionRatePercent = BigDecimal.valueOf(5.00);
        if (this.rating == null) this.rating = BigDecimal.valueOf(5.00);
        if (this.totalSales == null) this.totalSales = 0;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getSellerType() { return sellerType; }
    public void setSellerType(String sellerType) { this.sellerType = sellerType; }

    public Boolean getTournamentEligibilityVerified() { return tournamentEligibilityVerified; }
    public void setTournamentEligibilityVerified(Boolean tournamentEligibilityVerified) { this.tournamentEligibilityVerified = tournamentEligibilityVerified; }

    public Integer getVerifiedTournamentsCount() { return verifiedTournamentsCount; }
    public void setVerifiedTournamentsCount(Integer verifiedTournamentsCount) { this.verifiedTournamentsCount = verifiedTournamentsCount; }

    public Boolean getIsSubscriptionActive() { return isSubscriptionActive; }
    public void setIsSubscriptionActive(Boolean isSubscriptionActive) { this.isSubscriptionActive = isSubscriptionActive; }

    public String getSubscriptionTier() { return subscriptionTier; }
    public void setSubscriptionTier(String subscriptionTier) { this.subscriptionTier = subscriptionTier; }

    public LocalDateTime getSubscriptionExpiresAt() { return subscriptionExpiresAt; }
    public void setSubscriptionExpiresAt(LocalDateTime subscriptionExpiresAt) { this.subscriptionExpiresAt = subscriptionExpiresAt; }

    public BigDecimal getCommissionRatePercent() { return commissionRatePercent; }
    public void setCommissionRatePercent(BigDecimal commissionRatePercent) { this.commissionRatePercent = commissionRatePercent; }

    public BigDecimal getRating() { return rating; }
    public void setRating(BigDecimal rating) { this.rating = rating; }

    public Integer getTotalSales() { return totalSales; }
    public void setTotalSales(Integer totalSales) { this.totalSales = totalSales; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
