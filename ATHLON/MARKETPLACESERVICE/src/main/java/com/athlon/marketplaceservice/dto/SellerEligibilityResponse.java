package com.athlon.marketplaceservice.dto;

import java.math.BigDecimal;

public class SellerEligibilityResponse {

    private String userId;
    private boolean eligible;
    private String eligibilityType; // TOURNAMENT_PARTICIPATION, INDIVIDUAL_SUBSCRIPTION, SHOP_SUBSCRIPTION, NOT_ELIGIBLE
    private String sellerType;      // INDIVIDUAL_FREE, INDIVIDUAL_SUBSCRIBED, SHOP_OWNER, NOT_ELIGIBLE
    private String sellerCategory;  // INDIVIDUAL, SHOP, NONE
    private int verifiedTournamentsCount;
    private int requiredTournamentsCount = 3;
    private boolean hasActiveSubscription;
    private boolean hasActiveShopSubscription; // Backward compatibility
    private String subscriptionTier; // NONE, INDIVIDUAL_PASS, SHOP_STARTER, SHOP_PRO, SHOP_ENTERPRISE
    private String shopSubscriptionTier; // Backward compatibility
    private Integer maxActiveListings; // e.g. 5, 25, 50, -1 (unlimited)
    private BigDecimal commissionRatePercent;
    private String message;

    public SellerEligibilityResponse() {}

    public SellerEligibilityResponse(String userId, boolean eligible, String eligibilityType,
                                    String sellerType, String sellerCategory,
                                    int verifiedTournamentsCount, boolean hasActiveSubscription,
                                    String subscriptionTier, Integer maxActiveListings,
                                    BigDecimal commissionRatePercent, String message) {
        this.userId = userId;
        this.eligible = eligible;
        this.eligibilityType = eligibilityType;
        this.sellerType = sellerType;
        this.sellerCategory = sellerCategory;
        this.verifiedTournamentsCount = verifiedTournamentsCount;
        this.requiredTournamentsCount = 3;
        this.hasActiveSubscription = hasActiveSubscription;
        this.hasActiveShopSubscription = hasActiveSubscription && "SHOP".equalsIgnoreCase(sellerCategory);
        this.subscriptionTier = subscriptionTier;
        this.shopSubscriptionTier = subscriptionTier;
        this.maxActiveListings = maxActiveListings;
        this.commissionRatePercent = commissionRatePercent;
        this.message = message;
    }

    // Factory helper methods
    public static SellerEligibilityResponse shopOwner(String userId, String tier, int tournaments,
                                                      BigDecimal commission, int maxListings) {
        return new SellerEligibilityResponse(
            userId, true, "SHOP_SUBSCRIPTION", "SHOP_OWNER", "SHOP",
            tournaments, true, tier, maxListings, commission,
            "Verified Shop Merchant Active. Storefront & Pro Selling Enabled."
        );
    }

    public static SellerEligibilityResponse individualSubscribed(String userId, String tier, int tournaments,
                                                                 BigDecimal commission, int maxListings) {
        return new SellerEligibilityResponse(
            userId, true, "INDIVIDUAL_SUBSCRIPTION", "INDIVIDUAL_SUBSCRIBED", "INDIVIDUAL",
            tournaments, true, tier, maxListings, commission,
            "Athlete Seller Pass Active. Instant equipment listing enabled with lower commission."
        );
    }

    public static SellerEligibilityResponse tournamentEligible(String userId, int tournaments,
                                                               BigDecimal commission, int maxListings) {
        return new SellerEligibilityResponse(
            userId, true, "TOURNAMENT_PARTICIPATION", "INDIVIDUAL_FREE", "INDIVIDUAL",
            tournaments, false, "NONE", maxListings, commission,
            String.format("Eligible to sell! You completed %d tournaments. Commission-only mode (%.1f%%) applies.",
                    tournaments, commission.doubleValue())
        );
    }

    public static SellerEligibilityResponse notEligible(String userId, int tournaments, int needed) {
        return new SellerEligibilityResponse(
            userId, false, "NOT_ELIGIBLE", "NOT_ELIGIBLE", "NONE",
            tournaments, false, "NONE", 0, null,
            String.format("You have participated in %d of 3 required tournaments. Participate in %d more tournament%s or subscribe to Athlete Pass / Pro Shop to list gear immediately.",
                    tournaments, needed, needed > 1 ? "s" : "")
        );
    }

    // Getters and Setters
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public boolean isEligible() { return eligible; }
    public void setEligible(boolean eligible) { this.eligible = eligible; }

    public String getEligibilityType() { return eligibilityType; }
    public void setEligibilityType(String eligibilityType) { this.eligibilityType = eligibilityType; }

    public String getSellerType() { return sellerType; }
    public void setSellerType(String sellerType) { this.sellerType = sellerType; }

    public String getSellerCategory() { return sellerCategory; }
    public void setSellerCategory(String sellerCategory) { this.sellerCategory = sellerCategory; }

    public int getVerifiedTournamentsCount() { return verifiedTournamentsCount; }
    public void setVerifiedTournamentsCount(int verifiedTournamentsCount) { this.verifiedTournamentsCount = verifiedTournamentsCount; }

    public int getRequiredTournamentsCount() { return requiredTournamentsCount; }
    public void setRequiredTournamentsCount(int requiredTournamentsCount) { this.requiredTournamentsCount = requiredTournamentsCount; }

    public boolean isHasActiveSubscription() { return hasActiveSubscription; }
    public void setHasActiveSubscription(boolean hasActiveSubscription) {
        this.hasActiveSubscription = hasActiveSubscription;
        this.hasActiveShopSubscription = hasActiveSubscription && "SHOP".equalsIgnoreCase(this.sellerCategory);
    }

    public boolean isHasActiveShopSubscription() { return hasActiveShopSubscription; }
    public void setHasActiveShopSubscription(boolean hasActiveShopSubscription) { this.hasActiveShopSubscription = hasActiveShopSubscription; }

    public String getSubscriptionTier() { return subscriptionTier; }
    public void setSubscriptionTier(String subscriptionTier) {
        this.subscriptionTier = subscriptionTier;
        this.shopSubscriptionTier = subscriptionTier;
    }

    public String getShopSubscriptionTier() { return shopSubscriptionTier; }
    public void setShopSubscriptionTier(String shopSubscriptionTier) { this.shopSubscriptionTier = shopSubscriptionTier; }

    public Integer getMaxActiveListings() { return maxActiveListings; }
    public void setMaxActiveListings(Integer maxActiveListings) { this.maxActiveListings = maxActiveListings; }

    public BigDecimal getCommissionRatePercent() { return commissionRatePercent; }
    public void setCommissionRatePercent(BigDecimal commissionRatePercent) { this.commissionRatePercent = commissionRatePercent; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
