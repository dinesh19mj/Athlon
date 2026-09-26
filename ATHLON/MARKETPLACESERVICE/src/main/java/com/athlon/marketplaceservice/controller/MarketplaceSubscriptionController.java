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
    public ResponseEntity<List<Map<String, Object>>> getSubscriptionPlans(
            @RequestParam(value = "category", required = false) String category
    ) {
        List<Map<String, Object>> plans = new ArrayList<>();

        // Individual Plans
        Map<String, Object> p1 = new HashMap<>();
        p1.put("id", "INDIVIDUAL_PASS");
        p1.put("category", "INDIVIDUAL");
        p1.put("name", "Athlete Seller Pass");
        p1.put("tagline", "For athletes & individual gear sellers");
        p1.put("priceMonthly", 199);
        p1.put("priceYearly", 1499);
        p1.put("commissionPercent", 2.5);
        p1.put("maxListings", 25);
        p1.put("description", "Start selling sports equipment immediately without needing 3 tournament participations, with lower commission fee.");
        p1.put("features", Arrays.asList(
            "Instant selling clearance (0 tournaments needed)",
            "Up to 25 active gear listings",
            "Low 2.5% transaction commission",
            "Direct in-app buyer negotiation chat",
            "Community Escrow payment protection"
        ));
        plans.add(p1);

        // Shop Plans
        Map<String, Object> p2 = new HashMap<>();
        p2.put("id", "SHOP_STARTER");
        p2.put("category", "SHOP");
        p2.put("name", "Shop Starter");
        p2.put("tagline", "For local sports clubs, restringing & stringers");
        p2.put("priceMonthly", 599);
        p2.put("priceYearly", 5499);
        p2.put("commissionPercent", 3.0);
        p2.put("maxListings", 50);
        p2.put("description", "Basic digital storefront for emerging sports clubs and specialty racket stringing/tuning businesses.");
        p2.put("features", Arrays.asList(
            "Dedicated Shop Storefront URL",
            "Up to 50 active inventory listings",
            "3.0% transaction commission",
            "Shop Inquiries desk & order manager",
            "Verified seller badge"
        ));
        plans.add(p2);

        Map<String, Object> p3 = new HashMap<>();
        p3.put("id", "SHOP_PRO");
        p3.put("category", "SHOP");
        p3.put("name", "Sports Shop Pro");
        p3.put("tagline", "For authorized dealers & brick-and-mortar sports shops");
        p3.put("priceMonthly", 1299);
        p3.put("priceYearly", 11999);
        p3.put("commissionPercent", 2.0);
        p3.put("maxListings", -1); // Unlimited
        p3.put("popular", true);
        p3.put("description", "Full commercial storefront for authorized dealers with unlimited listings and lowest fees.");
        p3.put("features", Arrays.asList(
            "Custom Storefront with branded banner & logo",
            "Unlimited product listings",
            "Lowest 2.0% transaction commission",
            "Verified Pro Retailer badge",
            "Customer inquiries & quotation desk",
            "Priority placement in market search"
        ));
        plans.add(p3);

        Map<String, Object> p4 = new HashMap<>();
        p4.put("id", "SHOP_ENTERPRISE");
        p4.put("category", "SHOP");
        p4.put("name", "Enterprise Sports Hub");
        p4.put("tagline", "For multi-brand distributors & equipment hubs");
        p4.put("priceMonthly", 2999);
        p4.put("priceYearly", 27999);
        p4.put("commissionPercent", 1.5);
        p4.put("maxListings", -1); // Unlimited
        p4.put("description", "Enterprise solution with bulk catalog management and dedicated market curation.");
        p4.put("features", Arrays.asList(
            "Top homepage banner & search spotlight",
            "Lowest 1.5% platform commission",
            "Bulk CSV catalog & inventory sync",
            "Multiple staff manager logins",
            "Priority logistics & courier pickup support"
        ));
        plans.add(p4);

        if (category != null && !category.trim().isEmpty()) {
            String catUpper = category.trim().toUpperCase();
            List<Map<String, Object>> filtered = new ArrayList<>();
            for (Map<String, Object> p : plans) {
                if (catUpper.equals(p.get("category"))) {
                    filtered.add(p);
                }
            }
            return ResponseEntity.ok(filtered);
        }

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

        String plan = payload.getOrDefault("plan", "SHOP_PRO").toUpperCase();
        String billingPeriod = payload.getOrDefault("billingPeriod", "MONTHLY");

        MarketplaceSellerProfile profile = profileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    MarketplaceSellerProfile p = new MarketplaceSellerProfile();
                    p.setUserId(userId);
                    return p;
                });

        profile.setIsSubscriptionActive(true);
        profile.setSubscriptionTier(plan);

        if ("YEARLY".equalsIgnoreCase(billingPeriod)) {
            profile.setSubscriptionExpiresAt(LocalDateTime.now().plusYears(1));
        } else {
            profile.setSubscriptionExpiresAt(LocalDateTime.now().plusMonths(1));
        }

        if ("SHOP_ENTERPRISE".equals(plan)) {
            profile.setSellerType("SHOP_OWNER");
            profile.setCommissionRatePercent(BigDecimal.valueOf(1.5));
            profile.setMaxActiveListings(-1);
        } else if ("SHOP_PRO".equals(plan)) {
            profile.setSellerType("SHOP_OWNER");
            profile.setCommissionRatePercent(BigDecimal.valueOf(2.0));
            profile.setMaxActiveListings(-1);
        } else if ("SHOP_STARTER".equals(plan)) {
            profile.setSellerType("SHOP_OWNER");
            profile.setCommissionRatePercent(BigDecimal.valueOf(3.0));
            profile.setMaxActiveListings(50);
        } else {
            // INDIVIDUAL_PASS
            profile.setSellerType("INDIVIDUAL_SUBSCRIBED");
            profile.setCommissionRatePercent(BigDecimal.valueOf(2.5));
            profile.setMaxActiveListings(25);
        }

        profileRepository.save(profile);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("userId", userId);
        response.put("tier", profile.getSubscriptionTier());
        response.put("sellerType", profile.getSellerType());
        response.put("commissionRate", profile.getCommissionRatePercent());
        response.put("maxListings", profile.getMaxActiveListings());
        response.put("expiresAt", profile.getSubscriptionExpiresAt());
        response.put("message", "Subscription successfully activated. Selling privileges enabled!");

        return ResponseEntity.ok(response);
    }
}
