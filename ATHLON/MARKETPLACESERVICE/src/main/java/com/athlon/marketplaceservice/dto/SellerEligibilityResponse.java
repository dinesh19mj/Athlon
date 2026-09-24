package com.athlon.marketplaceservice.dto;

import java.math.BigDecimal;

public class SellerEligibilityResponse {

    private String userId;
    private boolean eligible;
    private String eligibilityType; // TOURNAMENT_PARTICIPATION, VERIFIED_SHOP, NOT_ELIGIBLE
    private int verifiedTournamentsCount;
    private int requiredTournamentsCount = 3;
    private boolean hasActiveShopSubscription;
    private String shopSubscriptionTier;
    private BigDecimal commissionRatePercent;
    private String message;

    public SellerEligibilityResponse() {}

    public SellerEligibilityResponse(String userId, boolean eligible, String eligibilityType,
                                    int verifiedTournamentsCount, boolean hasActiveShopSubscription,
                                    String shopSubscriptionTier, BigDecimal commissionRatePercent,
                                    String message) {
        this.userId = userId;
        this.eligible = eligible;
        this.eligibilityType = eligibilityType;
        this.verifiedTournamentsCount = verifiedTournamentsCount;
        this.requiredTournamentsCount = 3;
        this.hasActiveShopSubscription = hasActiveShopSubscription;
        this.shopSubscriptionTier = shopSubscriptionTier;
        this.commissionRatePercent = commissionRatePercent;
        this.message = message;
    }

    // Getters and Setters
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public boolean isEligible() { return eligible; }
    public void setEligible(boolean eligible) { this.eligible = eligible; }

    public String getEligibilityType() { return eligibilityType; }
    public void setEligibilityType(String eligibilityType) { this.eligibilityType = eligibilityType; }

    public int getVerifiedTournamentsCount() { return verifiedTournamentsCount; }
    public void setVerifiedTournamentsCount(int verifiedTournamentsCount) { this.verifiedTournamentsCount = verifiedTournamentsCount; }

    public int getRequiredTournamentsCount() { return requiredTournamentsCount; }
    public void setRequiredTournamentsCount(int requiredTournamentsCount) { this.requiredTournamentsCount = requiredTournamentsCount; }

    public boolean isHasActiveShopSubscription() { return hasActiveShopSubscription; }
    public void setHasActiveShopSubscription(boolean hasActiveShopSubscription) { this.hasActiveShopSubscription = hasActiveShopSubscription; }

    public String getShopSubscriptionTier() { return shopSubscriptionTier; }
    public void setShopSubscriptionTier(String shopSubscriptionTier) { this.shopSubscriptionTier = shopSubscriptionTier; }

    public BigDecimal getCommissionRatePercent() { return commissionRatePercent; }
    public void setCommissionRatePercent(BigDecimal commissionRatePercent) { this.commissionRatePercent = commissionRatePercent; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
