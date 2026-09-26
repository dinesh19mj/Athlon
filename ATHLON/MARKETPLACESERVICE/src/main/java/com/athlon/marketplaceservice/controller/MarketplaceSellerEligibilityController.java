package com.athlon.marketplaceservice.controller;

import com.athlon.marketplaceservice.dto.SellerEligibilityResponse;
import com.athlon.marketplaceservice.service.MarketplaceSellerEligibilityService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/marketplace/seller/eligibility")
public class MarketplaceSellerEligibilityController {

    private final MarketplaceSellerEligibilityService eligibilityService;

    public MarketplaceSellerEligibilityController(MarketplaceSellerEligibilityService eligibilityService) {
        this.eligibilityService = eligibilityService;
    }

    @GetMapping
    public ResponseEntity<SellerEligibilityResponse> checkEligibility(
            @RequestParam(value = "userId", required = false) String userId,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId
    ) {
        String effectiveUserId = userId != null && !userId.isEmpty() ? userId : headerUserId;
        SellerEligibilityResponse response = eligibilityService.checkEligibility(effectiveUserId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<SellerEligibilityResponse> checkEligibilityForUser(@PathVariable("userId") String userId) {
        SellerEligibilityResponse response = eligibilityService.checkEligibility(userId);
        return ResponseEntity.ok(response);
    }
}
