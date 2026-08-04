package com.athlon.identityservice.subscription.controller;
import java.util.List;
import java.util.UUID;

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
import com.athlon.identityservice.subscription.dto.request.CreateSubscriptionPackageRequest;
import com.athlon.identityservice.subscription.dto.response.SubscriptionPackageResponse;
import com.athlon.identityservice.subscription.service.SubscriptionService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/identity/subscriptions")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    public SubscriptionController(SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    @PostMapping("/createPackage")
    public ResponseEntity<ApiResponse<SubscriptionPackageResponse>> createPackage(@Valid @RequestBody CreateSubscriptionPackageRequest request) {
        SubscriptionPackageResponse response = subscriptionService.createPackage(request);
        return ResponseEntity.ok(ApiResponse.success("Subscription Package created successfully", response));
    }

    @GetMapping("/getAllPackages")
    public ResponseEntity<ApiResponse<List<SubscriptionPackageResponse>>> getAllPackages() {
        List<SubscriptionPackageResponse> responses = subscriptionService.getAllPackages();
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @GetMapping("/getPackageByUuid/{uuid}")
    public ResponseEntity<ApiResponse<SubscriptionPackageResponse>> getPackageByUuid(@PathVariable("uuid") UUID uuid) {
        SubscriptionPackageResponse response = subscriptionService.getPackageByUuid(uuid);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/organizations/subscribe")
    public ResponseEntity<ApiResponse<OrganizationSubscriptionResponse>> subscribeOrganization(@Valid @RequestBody SubscribeOrganizationRequest request) {
        OrganizationSubscriptionResponse response = subscriptionService.subscribeOrganization(request);
        return ResponseEntity.ok(ApiResponse.success("Organization subscribed successfully", response));
    }

    @GetMapping("/organizations/{orgUuid}/active")
    public ResponseEntity<ApiResponse<OrganizationSubscriptionResponse>> getActiveSubscription(@PathVariable UUID orgUuid) {
        OrganizationSubscriptionResponse response = subscriptionService.getActiveSubscription(orgUuid);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
