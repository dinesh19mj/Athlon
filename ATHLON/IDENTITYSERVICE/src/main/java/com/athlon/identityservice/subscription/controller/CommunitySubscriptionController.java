package com.athlon.identityservice.subscription.controller;

import com.athlon.identityservice.dto.response.ApiResponse;
import com.athlon.identityservice.subscription.dto.CommunityEntitlementSummaryDto;
import com.athlon.identityservice.subscription.dto.CommunitySubscriptionPlanDto;
import com.athlon.identityservice.subscription.dto.request.SubscribeCommunityPlanRequest;
import com.athlon.identityservice.subscription.service.CommunityEntitlementService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/identity/subscriptions/community")
public class CommunitySubscriptionController {

    private final CommunityEntitlementService entitlementService;

    public CommunitySubscriptionController(CommunityEntitlementService entitlementService) {
        this.entitlementService = entitlementService;
    }

    @GetMapping("/plans")
    public ResponseEntity<ApiResponse<List<CommunitySubscriptionPlanDto>>> getCommunityPlans() {
        List<CommunitySubscriptionPlanDto> plans = entitlementService.getAllCommunityPlans();
        return ResponseEntity.ok(ApiResponse.success(plans));
    }

    @GetMapping("/{communityUuid}/entitlements")
    public ResponseEntity<ApiResponse<CommunityEntitlementSummaryDto>> getEntitlements(@PathVariable("communityUuid") UUID communityUuid) {
        CommunityEntitlementSummaryDto summary = entitlementService.getCommunityEntitlements(communityUuid);
        return ResponseEntity.ok(ApiResponse.success(summary));
    }

    @GetMapping("/by-id/{orgId}/entitlements")
    public ResponseEntity<ApiResponse<CommunityEntitlementSummaryDto>> getEntitlementsById(@PathVariable("orgId") Long orgId) {
        CommunityEntitlementSummaryDto summary = entitlementService.getCommunityEntitlements(orgId);
        return ResponseEntity.ok(ApiResponse.success(summary));
    }

    @PostMapping("/subscribe")
    public ResponseEntity<ApiResponse<CommunityEntitlementSummaryDto>> subscribeCommunity(
            @Valid @RequestBody SubscribeCommunityPlanRequest request) {
        CommunityEntitlementSummaryDto response = entitlementService.subscribeCommunityPlan(request);
        return ResponseEntity.ok(ApiResponse.success("Community subscription updated successfully", response));
    }

    @GetMapping("/{communityUuid}/validate-member")
    public ResponseEntity<ApiResponse<String>> validateMember(@PathVariable("communityUuid") UUID communityUuid) {
        entitlementService.validateMemberCapacity(communityUuid);
        return ResponseEntity.ok(ApiResponse.success("Member join capacity available"));
    }
}

