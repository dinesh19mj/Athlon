package com.athlon.identityservice.subscription.controller;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.athlon.identityservice.subscription.dto.request.SaveSubscriptionPlanRequest;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.athlon.identityservice.dto.request.SubscribeOrganizationRequest;
import com.athlon.identityservice.dto.response.ApiResponse;
import com.athlon.identityservice.dto.response.OrganizationSubscriptionResponse;
import com.athlon.identityservice.subscription.dto.VenueEntitlementSummaryDto;
import com.athlon.identityservice.subscription.dto.VenueSubscriptionPlanDto;
import com.athlon.identityservice.subscription.service.SubscriptionEntitlementService;
import com.athlon.identityservice.subscription.service.SubscriptionService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/identity/subscriptions")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;
    private final SubscriptionEntitlementService entitlementService;

    public SubscriptionController(
            SubscriptionService subscriptionService,
            SubscriptionEntitlementService entitlementService
    ) {
        this.subscriptionService = subscriptionService;
        this.entitlementService = entitlementService;
    }

    @PostMapping("/organizations/subscribe")
    public ResponseEntity<ApiResponse<OrganizationSubscriptionResponse>> subscribeOrganization(@Valid @RequestBody SubscribeOrganizationRequest request) {
        OrganizationSubscriptionResponse response = subscriptionService.subscribeOrganization(request);
        return ResponseEntity.ok(ApiResponse.success("Organization subscribed successfully", response));
    }

    @GetMapping("/organizations/{orgUuid}/active")
    public ResponseEntity<ApiResponse<OrganizationSubscriptionResponse>> getActiveSubscription(@PathVariable("orgUuid") UUID orgUuid) {
        OrganizationSubscriptionResponse response = subscriptionService.getActiveSubscription(orgUuid);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/organizations/{orgUuid}/entitlements")
    public ResponseEntity<ApiResponse<VenueEntitlementSummaryDto>> getVenueEntitlements(@PathVariable("orgUuid") UUID orgUuid) {
        VenueEntitlementSummaryDto summary = entitlementService.getVenueEntitlements(orgUuid);
        return ResponseEntity.ok(ApiResponse.success(summary));
    }

    @GetMapping("/plans/venue")
    public ResponseEntity<ApiResponse<List<VenueSubscriptionPlanDto>>> getVenuePlans() {
        List<VenueSubscriptionPlanDto> plans = entitlementService.getAllVenuePlans();
        return ResponseEntity.ok(ApiResponse.success(plans));
    }

    @PostMapping("/plans/create")
    public ResponseEntity<ApiResponse<Object>> createPlan(@Valid @RequestBody SaveSubscriptionPlanRequest request) {
        Object response = entitlementService.createSubscriptionPlan(request);
        return ResponseEntity.ok(ApiResponse.success("Subscription plan created successfully", response));
    }

    @PostMapping("/plans/update")
    public ResponseEntity<ApiResponse<Object>> updatePlan(@Valid @RequestBody SaveSubscriptionPlanRequest request) {
        Object response = entitlementService.updateSubscriptionPlan(request);
        return ResponseEntity.ok(ApiResponse.success("Subscription plan updated successfully", response));
    }

    @PostMapping("/plans/toggle-status")
    public ResponseEntity<ApiResponse<Object>> togglePlanStatus(@RequestBody Map<String, Object> body) {
        String uuidStr = (String) body.get("planUuid");
        if (uuidStr == null) {
            throw new IllegalArgumentException("planUuid is required");
        }
        UUID uuid = UUID.fromString(uuidStr);
        Object response = entitlementService.togglePlanStatus(uuid);
        return ResponseEntity.ok(ApiResponse.success("Plan status updated successfully", response));
    }

    @PostMapping("/organizations/{orgUuid}/subscribe-plan")
    public ResponseEntity<ApiResponse<VenueEntitlementSummaryDto>> subscribeVenuePlan(
            @PathVariable("orgUuid") UUID orgUuid,
            @RequestBody Map<String, String> body
    ) {
        String planCodeOrUuid = body.get("planCode") != null ? body.get("planCode") : body.get("planUuid");
        if (planCodeOrUuid == null && body.get("packageUuid") != null) {
            planCodeOrUuid = body.get("packageUuid");
        }
        String billingCycle = body.getOrDefault("billingCycle", "MONTHLY");
        String paymentReference = body.get("paymentReference");

        VenueEntitlementSummaryDto summary = entitlementService.subscribeVenuePlan(orgUuid, planCodeOrUuid, billingCycle, paymentReference);
        return ResponseEntity.ok(ApiResponse.success("Plan updated successfully", summary));
    }
}
