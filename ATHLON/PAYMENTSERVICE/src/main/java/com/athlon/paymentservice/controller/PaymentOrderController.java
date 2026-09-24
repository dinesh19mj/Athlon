package com.athlon.paymentservice.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.athlon.paymentservice.dto.CreateOrderRequest;
import com.athlon.paymentservice.dto.PaymentOrderResponse;
import com.athlon.paymentservice.service.PaymentOrderService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/payments/orders")
public class PaymentOrderController {

    private final PaymentOrderService paymentOrderService;

    public PaymentOrderController(PaymentOrderService paymentOrderService) {
        this.paymentOrderService = paymentOrderService;
    }

    @PostMapping
    public ResponseEntity<?> createOrder(
            @Valid @RequestBody CreateOrderRequest request,
            @RequestHeader(value = "X-User-Id", required = false, defaultValue = "user-anon") String userId
    ) {
        try {
            PaymentOrderResponse response = paymentOrderService.createPaymentOrder(request, userId);
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

    @GetMapping("/{paymentNumber}")
    public ResponseEntity<?> getOrderByNumber(@PathVariable("paymentNumber") String paymentNumber) {
        try {
            PaymentOrderResponse response = paymentOrderService.getPaymentOrderByNumber(paymentNumber);
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("data", response);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
}
