package com.athlon.paymentservice.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.athlon.paymentservice.service.PaymentWebhookService;

@RestController
@RequestMapping("/api/payments/webhooks")
public class PaymentWebhookController {

    private final PaymentWebhookService webhookService;

    public PaymentWebhookController(PaymentWebhookService webhookService) {
        this.webhookService = webhookService;
    }

    @PostMapping("/razorpay")
    public ResponseEntity<String> handleRazorpayWebhook(
            @RequestBody String payload,
            @RequestHeader(value = "X-Razorpay-Signature", required = false, defaultValue = "test_signature") String signature
    ) {
        boolean processed = webhookService.processWebhook(payload, signature);
        if (processed) {
            return ResponseEntity.ok("OK");
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid signature or processing failure");
        }
    }
}
