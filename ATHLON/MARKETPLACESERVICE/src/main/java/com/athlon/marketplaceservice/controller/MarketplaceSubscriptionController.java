package com.athlon.marketplaceservice.controller;

import com.athlon.marketplaceservice.entity.MarketplaceSellerProfile;
import com.athlon.marketplaceservice.repository.MarketplaceSellerProfileRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/marketplace/subscriptions")
public class MarketplaceSubscriptionController {

    private final MarketplaceSellerProfileRepository profileRepository;

    public MarketplaceSubscriptionController(MarketplaceSellerProfileRepository profileRepository) {
        this.profileRepository = profileRepository;
    }

    @GetMapping("/plans")
    public ResponseEntity<List<Map<String, Object>>> getSubscriptionPlans() {
        List<Map<String, Object>> plans = new ArrayList<>();

        Map<String, Object> p1 = new HashMap<>();
        p1.put("id", "SELLER_PASS");
        p1.put("name", "Athlete Seller Pass");
        p1.put("priceMonthly", 199);
        p1.put("commissionPercent", 5.0);
        p1.put("description", "Start selling used sports gear immediately without waiting to complete 3 tournaments.");
        p1.put("features", Arrays.asList("Instant selling clearance", "Up to 5 active listings", "Community Escrow Protection"));
        plans.add(p1);

        Map<String, Object> p2 = new HashMap<>();
        p2.put("id", "SHOP_PRO");
        p2.put("name", "Sports Shop Pro");
        p2.put("priceMonthly", 1499);
        p2.put("commissionPercent", 3.0);
        p2.put("description", "Dedicated storefront for authorized dealers and local sports retail shops.");
        p2.put("features", Arrays.asList("Verified Retailer Badge", "Unlimited listings", "Reduced 3% commission", "Custom store slug", "Customer inquiries desk"));
        plans.add(p2);

        Map<String, Object> p3 = new HashMap<>();
        p3.put("id", "SHOP_ENTERPRISE");
        p3.put("name", "Enterprise Sports Merchant");
        p3.put("priceMonthly", 3999);
        p3.put("commissionPercent", 2.0);
        p3.put("description", "For multi-brand distributors, academies, and premier pro equipment hubs.");
        p3.put("features", Arrays.asList("Top search prominence", "Lowest 2% commission", "Priority courier pickup", "Bulk CSV inventory upload"));
        plans.add(p3);

        return ResponseEntity.ok(plans);
    }

    @PostMapping("/activate")
    public ResponseEntity<Map<String, Object>> activateSubscription(
            @RequestBody Map<String, String> payload,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId
    ) {
        String userId = payload.get("userId") != null ? payload.get("userId") : headerUserId;
        if (userId == null || userId.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", "User ID is required"));
        }

        String plan = payload.getOrDefault("plan", "SHOP_PRO");

        MarketplaceSellerProfile profile = profileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    MarketplaceSellerProfile p = new MarketplaceSellerProfile();
                    p.setUserId(userId);
                    return p;
                });

        profile.setIsSubscriptionActive(true);
        profile.setSubscriptionTier(plan);
        profile.setSubscriptionExpiresAt(LocalDateTime.now().plusYears(1));

        if ("SHOP_ENTERPRISE".equalsIgnoreCase(plan)) {
            profile.setSellerType("VERIFIED_SHOP");
            profile.setCommissionRatePercent(BigDecimal.valueOf(2.0));
        } else if ("SHOP_PRO".equalsIgnoreCase(plan)) {
            profile.setSellerType("VERIFIED_SHOP");
            profile.setCommissionRatePercent(BigDecimal.valueOf(3.0));
        } else {
            profile.setSellerType("INDIVIDUAL");
            profile.setCommissionRatePercent(BigDecimal.valueOf(5.0));
        }

        profileRepository.save(profile);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("userId", userId);
        response.put("tier", profile.getSubscriptionTier());
        response.put("commissionRate", profile.getCommissionRatePercent());
        response.put("expiresAt", profile.getSubscriptionExpiresAt());
        response.put("message", "Subscription successfully activated. Selling privileges enabled!");

        return ResponseEntity.ok(response);
    }
}
