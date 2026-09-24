package com.athlon.marketplaceservice.controller;

import com.athlon.marketplaceservice.dto.MarketplaceOfferDto;
import com.athlon.marketplaceservice.dto.MarketplaceOfferRequest;
import com.athlon.marketplaceservice.service.MarketplaceOfferService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/marketplace/offers")
public class MarketplaceOfferController {

    private final MarketplaceOfferService offerService;

    public MarketplaceOfferController(MarketplaceOfferService offerService) {
        this.offerService = offerService;
    }

    @PostMapping
    public ResponseEntity<MarketplaceOfferDto> createOffer(
            @Valid @RequestBody MarketplaceOfferRequest req,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestHeader(value = "X-User-Name", required = false) String headerUserName
    ) {
        MarketplaceOfferDto created = offerService.createOffer(req, headerUserId, headerUserName);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}/respond")
    public ResponseEntity<MarketplaceOfferDto> respondToOffer(
            @PathVariable("id") Long id,
            @RequestParam("status") String status,
            @RequestParam(name = "counterAmount", required = false) BigDecimal counterAmount,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId
    ) {
        return ResponseEntity.ok(offerService.respondToOffer(id, status, counterAmount, headerUserId));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<MarketplaceOfferDto>> getOffersForProduct(@PathVariable("productId") Long productId) {
        return ResponseEntity.ok(offerService.getOffersForProduct(productId));
    }

    @GetMapping("/seller/{sellerUserId}")
    public ResponseEntity<List<MarketplaceOfferDto>> getOffersForSeller(@PathVariable("sellerUserId") String sellerUserId) {
        return ResponseEntity.ok(offerService.getOffersForSeller(sellerUserId));
    }

    @GetMapping("/buyer/{buyerUserId}")
    public ResponseEntity<List<MarketplaceOfferDto>> getOffersForBuyer(@PathVariable("buyerUserId") String buyerUserId) {
        return ResponseEntity.ok(offerService.getOffersForBuyer(buyerUserId));
    }
}
