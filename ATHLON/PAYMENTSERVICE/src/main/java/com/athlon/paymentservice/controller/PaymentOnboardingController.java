package com.athlon.paymentservice.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.athlon.paymentservice.dto.OnboardingStatusResponse;
import com.athlon.paymentservice.enums.RecipientType;
import com.athlon.paymentservice.service.PaymentOnboardingService;

@RestController
@RequestMapping("/api/payments/onboarding")
public class PaymentOnboardingController {

    private final PaymentOnboardingService onboardingService;

    public PaymentOnboardingController(PaymentOnboardingService onboardingService) {
        this.onboardingService = onboardingService;
    }

    @PostMapping("/start")
    public ResponseEntity<?> startOnboarding(@RequestBody Map<String, Object> payload) {
        try {
            UUID organizationId = UUID.fromString(payload.get("organizationId").toString());
            RecipientType recipientType = payload.containsKey("recipientType")
                    ? RecipientType.valueOf(payload.get("recipientType").toString().toUpperCase())
                    : RecipientType.ORGANIZER;
            String businessName = (String) payload.get("businessName");
            String email = (String) payload.get("email");
            String phone = (String) payload.get("phone");

            OnboardingStatusResponse response = onboardingService.startOnboarding(
                    organizationId,
                    recipientType,
                    businessName,
                    email,
                    phone
            );

            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("data", response);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/status/{organizationId}")
    public ResponseEntity<?> getOnboardingStatus(@PathVariable("organizationId") UUID organizationId) {
        try {
            OnboardingStatusResponse response = onboardingService.getOnboardingStatus(organizationId);
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("data", response);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/toggle/{organizationId}")
    public ResponseEntity<?> togglePaymentsEnabled(
            @PathVariable("organizationId") UUID organizationId,
            @RequestParam("enabled") boolean enabled
    ) {
        try {
            OnboardingStatusResponse response = onboardingService.togglePaymentsEnabled(organizationId, enabled);
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("data", response);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
