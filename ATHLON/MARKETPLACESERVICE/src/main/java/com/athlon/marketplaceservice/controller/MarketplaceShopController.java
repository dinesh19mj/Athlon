package com.athlon.marketplaceservice.controller;

import com.athlon.marketplaceservice.dto.MarketplaceShopDto;
import com.athlon.marketplaceservice.service.MarketplaceShopService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/marketplace/shops")
public class MarketplaceShopController {

    private final MarketplaceShopService shopService;

    public MarketplaceShopController(MarketplaceShopService shopService) {
        this.shopService = shopService;
    }

    @GetMapping("/{slug}")
    public ResponseEntity<MarketplaceShopDto> getShopBySlug(@PathVariable("slug") String slug) {
        return ResponseEntity.ok(shopService.getShopBySlug(slug));
    }

    @GetMapping("/id/{id}")
    public ResponseEntity<MarketplaceShopDto> getShopById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(shopService.getShopById(id));
    }

    @GetMapping("/owner/{ownerUserId}")
    public ResponseEntity<List<MarketplaceShopDto>> getShopsByOwner(@PathVariable("ownerUserId") String ownerUserId) {
        return ResponseEntity.ok(shopService.getShopsByOwner(ownerUserId));
    }

    @PostMapping
    public ResponseEntity<MarketplaceShopDto> createShop(
            @RequestBody MarketplaceShopDto dto,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId
    ) {
        String ownerId = dto.getOwnerUserId() != null && !dto.getOwnerUserId().isEmpty() ? dto.getOwnerUserId() : headerUserId;
        MarketplaceShopDto created = shopService.createShop(dto, ownerId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MarketplaceShopDto> updateShop(
            @PathVariable("id") Long id,
            @RequestBody MarketplaceShopDto dto,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId
    ) {
        return ResponseEntity.ok(shopService.updateShop(id, dto, headerUserId));
    }
}
