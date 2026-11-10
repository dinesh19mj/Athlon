package com.athlon.identityservice.subscription.controller;

import com.athlon.identityservice.dto.response.ApiResponse;
import com.athlon.identityservice.subscription.dto.CoachEntitlementSummaryDto;
import com.athlon.identityservice.subscription.dto.CoachSubscriptionPlanDto;
import com.athlon.identityservice.subscription.dto.request.SubscribeCoachPlanRequest;
import com.athlon.identityservice.subscription.service.CoachEntitlementService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/identity/subscriptions/coach")
public class CoachSubscriptionController {

    private final CoachEntitlementService entitlementService;

    public CoachSubscriptionController(CoachEntitlementService entitlementService) {
        this.entitlementService = entitlementService;
    }

    @GetMapping("/plans")
    public ResponseEntity<ApiResponse<List<CoachSubscriptionPlanDto>>> getCoachPlans() {
        List<CoachSubscriptionPlanDto> plans = entitlementService.getAllCoachPlans();
        return ResponseEntity.ok(ApiResponse.success(plans));
    }

    @GetMapping("/{orgUuid}/entitlements")
    public ResponseEntity<ApiResponse<CoachEntitlementSummaryDto>> getEntitlements(@PathVariable("orgUuid") UUID orgUuid) {
        CoachEntitlementSummaryDto summary = entitlementService.getCoachEntitlements(orgUuid);
        return ResponseEntity.ok(ApiResponse.success(summary));
    }

    @GetMapping("/by-id/{orgId}/entitlements")
    public ResponseEntity<ApiResponse<CoachEntitlementSummaryDto>> getEntitlementsById(@PathVariable("orgId") Long orgId) {
        CoachEntitlementSummaryDto summary = entitlementService.getCoachEntitlements(orgId);
        return ResponseEntity.ok(ApiResponse.success(summary));
    }

    @PostMapping("/subscribe")
    public ResponseEntity<ApiResponse<CoachEntitlementSummaryDto>> subscribeCoach(
            @Valid @RequestBody SubscribeCoachPlanRequest request) {
        CoachEntitlementSummaryDto response = entitlementService.subscribeCoachPlan(request);
        return ResponseEntity.ok(ApiResponse.success("Coach subscription activated successfully", response));
    }

    @GetMapping("/{orgUuid}/validate-trainee")
    public ResponseEntity<ApiResponse<String>> validateTrainee(@PathVariable("orgUuid") UUID orgUuid) {
        entitlementService.validateTraineeCapacity(orgUuid);
        return ResponseEntity.ok(ApiResponse.success("Trainee admission capacity available"));
    }
}

