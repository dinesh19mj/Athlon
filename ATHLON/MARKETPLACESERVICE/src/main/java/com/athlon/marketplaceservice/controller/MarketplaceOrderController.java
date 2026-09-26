package com.athlon.marketplaceservice.controller;

import com.athlon.marketplaceservice.dto.MarketplaceOrderDto;
import com.athlon.marketplaceservice.dto.MarketplaceOrderRequest;
import com.athlon.marketplaceservice.service.MarketplaceOrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/marketplace/orders")
public class MarketplaceOrderController {

    private final MarketplaceOrderService orderService;

    public MarketplaceOrderController(MarketplaceOrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<MarketplaceOrderDto> createOrder(
            @Valid @RequestBody MarketplaceOrderRequest req,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestHeader(value = "X-User-Name", required = false) String headerUserName
    ) {
        MarketplaceOrderDto created = orderService.createOrder(req, headerUserId, headerUserName);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MarketplaceOrderDto> getOrderById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @GetMapping("/number/{orderNumber}")
    public ResponseEntity<MarketplaceOrderDto> getOrderByNumber(@PathVariable("orderNumber") String orderNumber) {
        return ResponseEntity.ok(orderService.getOrderByNumber(orderNumber));
    }

    @GetMapping("/buyer/{buyerUserId}")
    public ResponseEntity<List<MarketplaceOrderDto>> getOrdersForBuyer(@PathVariable("buyerUserId") String buyerUserId) {
        return ResponseEntity.ok(orderService.getOrdersForBuyer(buyerUserId));
    }

    @GetMapping("/seller/{sellerUserId}")
    public ResponseEntity<List<MarketplaceOrderDto>> getOrdersForSeller(@PathVariable("sellerUserId") String sellerUserId) {
        return ResponseEntity.ok(orderService.getOrdersForSeller(sellerUserId));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<MarketplaceOrderDto> updateOrderStatus(
            @PathVariable("id") Long id,
            @RequestParam("status") String status,
            @RequestParam(value = "trackingNumber", required = false) String trackingNumber,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId
    ) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, status, trackingNumber, headerUserId));
    }
}
