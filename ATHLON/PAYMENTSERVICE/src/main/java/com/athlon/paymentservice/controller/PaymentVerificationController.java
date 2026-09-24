package com.athlon.paymentservice.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.athlon.paymentservice.dto.VerifyPaymentRequest;
import com.athlon.paymentservice.dto.VerifyPaymentResponse;
import com.athlon.paymentservice.service.PaymentVerificationService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/payments/verify")
public class PaymentVerificationController {

    private final PaymentVerificationService verificationService;

    public PaymentVerificationController(PaymentVerificationService verificationService) {
        this.verificationService = verificationService;
    }

    @PostMapping
    public ResponseEntity<?> verifyPayment(@Valid @RequestBody VerifyPaymentRequest request) {
        try {
            VerifyPaymentResponse response = verificationService.verifyPayment(request);
            Map<String, Object> result = new HashMap<>();
            result.put("success", response.isVerified());
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
