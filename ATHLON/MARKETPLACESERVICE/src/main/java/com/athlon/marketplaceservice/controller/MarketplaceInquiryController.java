package com.athlon.marketplaceservice.controller;

import com.athlon.marketplaceservice.dto.MarketplaceInquiryDto;
import com.athlon.marketplaceservice.dto.MarketplaceInquiryRequest;
import com.athlon.marketplaceservice.service.MarketplaceInquiryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/marketplace/inquiries")
public class MarketplaceInquiryController {

    private final MarketplaceInquiryService inquiryService;

    public MarketplaceInquiryController(MarketplaceInquiryService inquiryService) {
        this.inquiryService = inquiryService;
    }

    @PostMapping
    public ResponseEntity<MarketplaceInquiryDto> createInquiry(
            @Valid @RequestBody MarketplaceInquiryRequest req,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestHeader(value = "X-User-Name", required = false) String headerUserName
    ) {
        MarketplaceInquiryDto created = inquiryService.createInquiry(req, headerUserId, headerUserName);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}/reply")
    public ResponseEntity<MarketplaceInquiryDto> replyToInquiry(
            @PathVariable("id") Long id,
            @RequestBody String reply,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId
    ) {
        return ResponseEntity.ok(inquiryService.replyToInquiry(id, reply, headerUserId));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<MarketplaceInquiryDto>> getInquiriesForProduct(@PathVariable("productId") Long productId) {
        return ResponseEntity.ok(inquiryService.getInquiriesForProduct(productId));
    }

    @GetMapping("/seller/{sellerUserId}")
    public ResponseEntity<List<MarketplaceInquiryDto>> getInquiriesForSeller(@PathVariable("sellerUserId") String sellerUserId) {
        return ResponseEntity.ok(inquiryService.getInquiriesForSeller(sellerUserId));
    }

    @GetMapping("/buyer/{buyerUserId}")
    public ResponseEntity<List<MarketplaceInquiryDto>> getInquiriesForBuyer(@PathVariable("buyerUserId") String buyerUserId) {
        return ResponseEntity.ok(inquiryService.getInquiriesForBuyer(buyerUserId));
    }
}
