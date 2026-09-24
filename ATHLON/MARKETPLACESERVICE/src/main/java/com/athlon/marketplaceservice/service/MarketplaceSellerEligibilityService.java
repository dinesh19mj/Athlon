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
    private static final int REQUIRED_TOURNAMENTS = 3;

    private final MarketplaceSellerProfileRepository profileRepository;

    public MarketplaceSellerEligibilityService(MarketplaceSellerProfileRepository profileRepository) {
        this.profileRepository = profileRepository;
    }

    @Transactional
    public SellerEligibilityResponse checkEligibility(String userId) {
        if (userId == null || userId.trim().isEmpty()) {
            return new SellerEligibilityResponse(
                userId, false, "NOT_ELIGIBLE", 0, false, null,
                BigDecimal.ZERO, "User ID is required to verify seller eligibility"
            );
        }

        MarketplaceSellerProfile profile = profileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    MarketplaceSellerProfile p = new MarketplaceSellerProfile();
                    p.setUserId(userId);
                    return profileRepository.save(p);
                });

        // 1. Check if user has an active shop subscription
        boolean isShopActive = Boolean.TRUE.equals(profile.getIsSubscriptionActive()) &&
                (profile.getSubscriptionExpiresAt() == null || profile.getSubscriptionExpiresAt().isAfter(LocalDateTime.now()));

        if (isShopActive) {
            return new SellerEligibilityResponse(
                userId,
                true,
                "VERIFIED_SHOP",
                profile.getVerifiedTournamentsCount() != null ? profile.getVerifiedTournamentsCount() : 0,
                true,
                profile.getSubscriptionTier(),
                profile.getCommissionRatePercent() != null ? profile.getCommissionRatePercent() : BigDecimal.valueOf(3.0),
                "Verified shop subscription active. Unlimited commercial marketplace selling enabled."
            );
        }

        // 2. Check 3 distinct tournament participations
        int tournamentsCount = 0;
        try {
            Long count = profileRepository.countVerifiedTournamentsForUser(userId);
            tournamentsCount = count != null ? count.intValue() : 0;
        } catch (Exception ex) {
            log.warn("Could not query tournament participation directly for user {}: {}", userId, ex.getMessage());
            tournamentsCount = profile.getVerifiedTournamentsCount() != null ? profile.getVerifiedTournamentsCount() : 0;
        }

        // Update profile with current count
        profile.setVerifiedTournamentsCount(tournamentsCount);

        if (tournamentsCount >= REQUIRED_TOURNAMENTS) {
            profile.setTournamentEligibilityVerified(true);
            profile.setCommissionRatePercent(BigDecimal.valueOf(5.0)); // 5% commission rate for verified individuals
            profileRepository.save(profile);

            return new SellerEligibilityResponse(
                userId,
                true,
                "TOURNAMENT_PARTICIPATION",
                tournamentsCount,
                false,
                null,
                BigDecimal.valueOf(5.0),
                String.format("Eligible to sell! You have participated in %d verified tournaments (minimum %d required). 5%% commission applies.",
                        tournamentsCount, REQUIRED_TOURNAMENTS)
            );
        } else {
            profile.setTournamentEligibilityVerified(false);
            profileRepository.save(profile);

            int needed = REQUIRED_TOURNAMENTS - tournamentsCount;
            return new SellerEligibilityResponse(
                userId,
                false,
                "NOT_ELIGIBLE",
                tournamentsCount,
                false,
                null,
                null,
                String.format("You have participated in %d of %d required tournaments. Participate in %d more tournament%s or upgrade to a Verified Shop to list items.",
                        tournamentsCount, REQUIRED_TOURNAMENTS, needed, needed > 1 ? "s" : "")
            );
        }
    }
}
