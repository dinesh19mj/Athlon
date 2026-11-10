package com.athlon.identityservice.subscription.controller;

import com.athlon.identityservice.dto.request.SubscribeOrganizationRequest;
import com.athlon.identityservice.dto.response.ApiResponse;
import com.athlon.identityservice.dto.response.OrganizationSubscriptionResponse;
import com.athlon.identityservice.subscription.dto.AcademyEntitlementSummaryDto;
import com.athlon.identityservice.subscription.dto.AcademySubscriptionPlanDto;
import com.athlon.identityservice.subscription.dto.request.PurchaseAcademyAddonRequest;
import com.athlon.identityservice.subscription.service.AcademyEntitlementService;
import com.athlon.identityservice.subscription.service.SubscriptionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/identity/subscriptions/academy")
public class AcademySubscriptionController {

    private final AcademyEntitlementService entitlementService;
    private final SubscriptionService subscriptionService;

    public AcademySubscriptionController(
            AcademyEntitlementService entitlementService,
            SubscriptionService subscriptionService
    ) {
        this.entitlementService = entitlementService;
        this.subscriptionService = subscriptionService;
    }

    @GetMapping("/plans")
    public ResponseEntity<ApiResponse<List<AcademySubscriptionPlanDto>>> getAcademyPlans() {
        List<AcademySubscriptionPlanDto> plans = entitlementService.getAllAcademyPlans();
        return ResponseEntity.ok(ApiResponse.success(plans));
    }

    @GetMapping("/{orgUuid}/entitlements")
    public ResponseEntity<ApiResponse<AcademyEntitlementSummaryDto>> getEntitlements(@PathVariable("orgUuid") UUID orgUuid) {
        AcademyEntitlementSummaryDto summary = entitlementService.getAcademyEntitlements(orgUuid);
        return ResponseEntity.ok(ApiResponse.success(summary));
    }

    @GetMapping("/by-id/{orgId}/entitlements")
    public ResponseEntity<ApiResponse<AcademyEntitlementSummaryDto>> getEntitlementsById(@PathVariable("orgId") Long orgId) {
        AcademyEntitlementSummaryDto summary = entitlementService.getAcademyEntitlements(orgId);
        return ResponseEntity.ok(ApiResponse.success(summary));
    }

    @PostMapping("/subscribe")
    public ResponseEntity<ApiResponse<AcademyEntitlementSummaryDto>> subscribeAcademy(
            @Valid @RequestBody com.athlon.identityservice.subscription.dto.request.SubscribeAcademyPlanRequest request) {
        AcademyEntitlementSummaryDto response = entitlementService.subscribeAcademyPlan(request);
        return ResponseEntity.ok(ApiResponse.success("Academy subscription activated successfully", response));
    }

    @PostMapping("/addons/purchase")
    public ResponseEntity<ApiResponse<AcademyEntitlementSummaryDto>> purchaseAddon(
            @Valid @RequestBody PurchaseAcademyAddonRequest request) {
        AcademyEntitlementSummaryDto summary = entitlementService.purchaseAddon(request);
        return ResponseEntity.ok(ApiResponse.success("Capacity booster purchased successfully", summary));
    }

    @GetMapping("/{orgId}/validate-admission")
    public ResponseEntity<ApiResponse<String>> validateAdmission(@PathVariable("orgId") Long orgId) {
        entitlementService.validateStudentCapacity(orgId);
        return ResponseEntity.ok(ApiResponse.success("Admission capacity available"));
    }

    @GetMapping("/{orgId}/validate-coach")
    public ResponseEntity<ApiResponse<String>> validateCoach(@PathVariable("orgId") Long orgId) {
        entitlementService.validateCoachCapacity(orgId);
        return ResponseEntity.ok(ApiResponse.success("Coach seat available"));
    }

    @GetMapping("/{orgId}/validate-centre")
    public ResponseEntity<ApiResponse<String>> validateCentre(@PathVariable("orgId") Long orgId) {
        entitlementService.validateCentreCapacity(orgId);
        return ResponseEntity.ok(ApiResponse.success("Campus capacity available"));
    }
}
