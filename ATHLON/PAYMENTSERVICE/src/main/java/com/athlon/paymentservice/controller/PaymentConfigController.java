package com.athlon.paymentservice.controller;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.athlon.paymentservice.dto.OrganizationPaymentConfigDTO;
import com.athlon.paymentservice.service.PaymentConfigService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/payments/config")
public class PaymentConfigController {

    private final PaymentConfigService configService;

    public PaymentConfigController(PaymentConfigService configService) {
        this.configService = configService;
    }

    /**
     * Get payment configuration for an organization (mode, online status, offline settings).
     */
    @GetMapping("/org/{orgId}")
    public ResponseEntity<OrganizationPaymentConfigDTO> getPaymentConfig(@PathVariable("orgId") UUID orgId) {
        OrganizationPaymentConfigDTO config = configService.getPaymentConfig(orgId);
        return ResponseEntity.ok(config);
    }

    /**
     * Update payment configuration for an organization.
     */
    @PutMapping("/org/{orgId}")
    public ResponseEntity<OrganizationPaymentConfigDTO> updatePaymentConfig(
            @PathVariable("orgId") UUID orgId,
            @Valid @RequestBody OrganizationPaymentConfigDTO dto) {
        OrganizationPaymentConfigDTO updated = configService.updatePaymentConfig(orgId, dto);
        return ResponseEntity.ok(updated);
    }
}
