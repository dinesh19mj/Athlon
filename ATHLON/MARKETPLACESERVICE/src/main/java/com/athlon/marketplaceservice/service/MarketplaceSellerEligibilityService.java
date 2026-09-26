package com.athlon.marketplaceservice.service;

import com.athlon.marketplaceservice.dto.SellerEligibilityResponse;
import com.athlon.marketplaceservice.entity.MarketplaceSellerProfile;
import com.athlon.marketplaceservice.repository.MarketplaceSellerProfileRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
public class MarketplaceSellerEligibilityService {

    private static final Logger log = LoggerFactory.getLogger(MarketplaceSellerEligibilityService.class);
    public static final int REQUIRED_TOURNAMENTS = 3;

    private final MarketplaceSellerProfileRepository profileRepository;

    public MarketplaceSellerEligibilityService(MarketplaceSellerProfileRepository profileRepository) {
        this.profileRepository = profileRepository;
    }

    @Transactional
    public SellerEligibilityResponse checkEligibility(String userId) {
        if (userId == null || userId.trim().isEmpty()) {
            return SellerEligibilityResponse.notEligible("", 0, REQUIRED_TOURNAMENTS);
        }

        MarketplaceSellerProfile profile = profileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    MarketplaceSellerProfile p = new MarketplaceSellerProfile();
                    p.setUserId(userId);
                    return profileRepository.save(p);
                });

        // Query real-time tournament count
        int tournamentsCount = 0;
        try {
            Long count = profileRepository.countVerifiedTournamentsForUser(userId);
            tournamentsCount = count != null ? count.intValue() : 0;
        } catch (Exception ex) {
            log.warn("Could not query tournament participation directly for user {}: {}", userId, ex.getMessage());
            tournamentsCount = profile.getVerifiedTournamentsCount() != null ? profile.getVerifiedTournamentsCount() : 0;
        }
        profile.setVerifiedTournamentsCount(tournamentsCount);

        // 1. Check if user has an active subscription
        boolean isSubscribed = profile.isSubscriptionValid();

        if (isSubscribed) {
            String tier = profile.getSubscriptionTier() != null ? profile.getSubscriptionTier().toUpperCase() : "INDIVIDUAL_PASS";
            BigDecimal rate = profile.getCommissionRatePercent();
            Integer maxListings = profile.getMaxActiveListings();

            if (tier.startsWith("SHOP_")) {
                if (rate == null) {
                    rate = "SHOP_ENTERPRISE".equals(tier) ? BigDecimal.valueOf(1.5) : BigDecimal.valueOf(2.0);
                }
                if (maxListings == null) {
                    maxListings = -1; // Unlimited for shops
                }
                profile.setSellerType("SHOP_OWNER");
                profile.setCommissionRatePercent(rate);
                profile.setMaxActiveListings(maxListings);
                profileRepository.save(profile);

                return SellerEligibilityResponse.shopOwner(userId, tier, tournamentsCount, rate, maxListings);
            } else {
                // Individual Athlete Paid Pass
                if (rate == null) {
                    rate = BigDecimal.valueOf(2.5);
                }
                if (maxListings == null) {
                    maxListings = 25;
                }
                profile.setSellerType("INDIVIDUAL_SUBSCRIBED");
                profile.setCommissionRatePercent(rate);
                profile.setMaxActiveListings(maxListings);
                profileRepository.save(profile);

                return SellerEligibilityResponse.individualSubscribed(userId, tier, tournamentsCount, rate, maxListings);
            }
        }

        // 2. Check 3 distinct tournament participations (Free Individual Tier)
        if (tournamentsCount >= REQUIRED_TOURNAMENTS) {
            profile.setTournamentEligibilityVerified(true);
            profile.setSellerType("INDIVIDUAL_FREE");
            profile.setSubscriptionTier("NONE");
            profile.setCommissionRatePercent(BigDecimal.valueOf(5.0)); // 5% commission for tournament veterans
            profile.setMaxActiveListings(10); // Up to 10 active items
            profileRepository.save(profile);

            return SellerEligibilityResponse.tournamentEligible(userId, tournamentsCount, BigDecimal.valueOf(5.0), 10);
        }

        // 3. Not eligible yet
        profile.setTournamentEligibilityVerified(false);
        profile.setSellerType("NOT_ELIGIBLE");
        profileRepository.save(profile);

        int needed = REQUIRED_TOURNAMENTS - tournamentsCount;
        return SellerEligibilityResponse.notEligible(userId, tournamentsCount, needed);
    }
}
