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

    /**
     * Get all active marketplace shops (optionally filter by ownerUserId)
     */
    @GetMapping
    public ResponseEntity<List<MarketplaceShopDto>> getAllShops(
            @RequestParam(value = "ownerUserId", required = false) String ownerUserId,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId
    ) {
        String filterUser = ownerUserId != null && !ownerUserId.isEmpty() ? ownerUserId : null;
        if (filterUser != null) {
            return ResponseEntity.ok(shopService.getShopsByOwner(filterUser));
        }
        return ResponseEntity.ok(shopService.getAllShops());
    }

    /**
     * Get shop details by numeric ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<MarketplaceShopDto> getShopById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(shopService.getShopById(id));
    }

    /**
     * Get shop details by unique storefront slug
     */
    @GetMapping("/slug/{slug}")
    public ResponseEntity<MarketplaceShopDto> getShopBySlug(@PathVariable("slug") String slug) {
        return ResponseEntity.ok(shopService.getShopBySlug(slug));
    }

    /**
     * Get all shops owned by a specific user
     */
    @GetMapping("/owner/{ownerUserId}")
    public ResponseEntity<List<MarketplaceShopDto>> getShopsByOwner(@PathVariable("ownerUserId") String ownerUserId) {
        return ResponseEntity.ok(shopService.getShopsByOwner(ownerUserId));
    }

    /**
     * Create / Register a new Sports Shop storefront
     */
    @PostMapping
    public ResponseEntity<MarketplaceShopDto> createShop(
            @RequestBody MarketplaceShopDto dto,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId
    ) {
        String ownerId = dto.getOwnerUserId() != null && !dto.getOwnerUserId().isEmpty() ? dto.getOwnerUserId() : headerUserId;
        MarketplaceShopDto created = shopService.createShop(dto, ownerId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Create / Register endpoint alias with explicit name
     */
    @PostMapping("/create")
    public ResponseEntity<MarketplaceShopDto> createShopExplicit(
            @RequestBody MarketplaceShopDto dto,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId
    ) {
        return createShop(dto, headerUserId);
    }

    /**
     * Update an existing Sports Shop profile (using POST mapping)
     */
    @PostMapping("/update/{id}")
    public ResponseEntity<MarketplaceShopDto> updateShop(
            @PathVariable("id") Long id,
            @RequestBody MarketplaceShopDto dto,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId
    ) {
        return ResponseEntity.ok(shopService.updateShop(id, dto, headerUserId));
    }
}
