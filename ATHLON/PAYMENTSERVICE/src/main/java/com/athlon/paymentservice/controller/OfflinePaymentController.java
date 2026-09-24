package com.athlon.paymentservice.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.athlon.paymentservice.dto.OfflinePaymentResponse;
import com.athlon.paymentservice.dto.OfflinePaymentSubmitRequest;
import com.athlon.paymentservice.dto.OfflinePaymentVerifyRequest;
import com.athlon.paymentservice.enums.OfflinePaymentStatus;
import com.athlon.paymentservice.enums.PaymentPurpose;
import com.athlon.paymentservice.service.OfflinePaymentService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/payments/offline")
public class OfflinePaymentController {

    private final OfflinePaymentService offlinePaymentService;

    public OfflinePaymentController(OfflinePaymentService offlinePaymentService) {
        this.offlinePaymentService = offlinePaymentService;
    }

    /**
     * Submit offline payment / register as pay at desk.
     */
    @PostMapping("/submit")
    public ResponseEntity<OfflinePaymentResponse> submitOfflinePayment(@Valid @RequestBody OfflinePaymentSubmitRequest request) {
        OfflinePaymentResponse response = offlinePaymentService.submitOfflinePayment(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Staff verifies, collects cash at desk, or rejects offline payment.
     */
    @PostMapping("/verify")
    public ResponseEntity<OfflinePaymentResponse> verifyOfflinePayment(@Valid @RequestBody OfflinePaymentVerifyRequest request) {
        OfflinePaymentResponse response = offlinePaymentService.verifyOfflinePayment(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Fetch offline ledger for an organization.
     */
    @GetMapping("/organization/{orgId}")
    public ResponseEntity<List<OfflinePaymentResponse>> getOrganizationLedger(
            @PathVariable("orgId") UUID orgId,
            @RequestParam(required = false) OfflinePaymentStatus status) {
        List<OfflinePaymentResponse> list = offlinePaymentService.getRecordsForOrganization(orgId, status);
        return ResponseEntity.ok(list);
    }

    /**
     * Fetch offline records for a specific tournament / batch / membership entity.
     */
    @GetMapping("/entity/{entityId}")
    public ResponseEntity<List<OfflinePaymentResponse>> getEntityRecords(
            @PathVariable("entityId") UUID entityId,
            @RequestParam(defaultValue = "TOURNAMENT_REGISTRATION") PaymentPurpose purpose) {
        List<OfflinePaymentResponse> list = offlinePaymentService.getRecordsForEntity(entityId, purpose);
        return ResponseEntity.ok(list);
    }

    /**
     * Fetch offline records for a specific payer.
     */
    @GetMapping("/payer/{payerId}")
    public ResponseEntity<List<OfflinePaymentResponse>> getPayerRecords(@PathVariable("payerId") UUID payerId) {
        List<OfflinePaymentResponse> list = offlinePaymentService.getRecordsForPayer(payerId);
        return ResponseEntity.ok(list);
    }
}
