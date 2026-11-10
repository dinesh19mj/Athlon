package com.athlon.identityservice.subscription.controller;

import com.athlon.identityservice.dto.response.ApiResponse;
import com.athlon.identityservice.subscription.dto.ClubEntitlementSummaryDto;
import com.athlon.identityservice.subscription.dto.ClubSubscriptionPlanDto;
import com.athlon.identityservice.subscription.dto.request.SubscribeClubPlanRequest;
import com.athlon.identityservice.subscription.service.ClubEntitlementService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/identity/subscriptions/club")
public class ClubSubscriptionController {

    private final ClubEntitlementService entitlementService;

    public ClubSubscriptionController(ClubEntitlementService entitlementService) {
        this.entitlementService = entitlementService;
    }

    @GetMapping("/plans")
    public ResponseEntity<ApiResponse<List<ClubSubscriptionPlanDto>>> getClubPlans() {
        List<ClubSubscriptionPlanDto> plans = entitlementService.getAllClubPlans();
        return ResponseEntity.ok(ApiResponse.success(plans));
    }

    @GetMapping("/{orgUuid}/entitlements")
    public ResponseEntity<ApiResponse<ClubEntitlementSummaryDto>> getEntitlements(@PathVariable("orgUuid") UUID orgUuid) {
        ClubEntitlementSummaryDto summary = entitlementService.getClubEntitlements(orgUuid);
        return ResponseEntity.ok(ApiResponse.success(summary));
    }

    @GetMapping("/by-id/{orgId}/entitlements")
    public ResponseEntity<ApiResponse<ClubEntitlementSummaryDto>> getEntitlementsById(@PathVariable("orgId") Long orgId) {
        ClubEntitlementSummaryDto summary = entitlementService.getClubEntitlements(orgId);
        return ResponseEntity.ok(ApiResponse.success(summary));
    }

    @PostMapping("/subscribe")
    public ResponseEntity<ApiResponse<ClubEntitlementSummaryDto>> subscribeClub(
            @Valid @RequestBody SubscribeClubPlanRequest request) {
        ClubEntitlementSummaryDto response = entitlementService.subscribeClubPlan(request);
        return ResponseEntity.ok(ApiResponse.success("Club subscription activated successfully", response));
    }

    @GetMapping("/{orgId}/validate-member")
    public ResponseEntity<ApiResponse<String>> validateMember(@PathVariable("orgId") Long orgId) {
        entitlementService.validateMemberCapacity(orgId);
        return ResponseEntity.ok(ApiResponse.success("Member capacity available"));
    }
}

