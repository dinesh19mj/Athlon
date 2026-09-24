package com.athlon.marketplaceservice.controller;

import com.athlon.marketplaceservice.dto.MarketplaceProductDto;
import com.athlon.marketplaceservice.dto.MarketplaceProductRequest;
import com.athlon.marketplaceservice.service.MarketplaceProductService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/marketplace/products")
public class MarketplaceProductController {

    private final MarketplaceProductService productService;

    public MarketplaceProductController(MarketplaceProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<Page<MarketplaceProductDto>> searchProducts(
            @RequestParam(required = false) String sport,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String condition,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Boolean isVerified,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String query,
            @RequestParam(required = false, defaultValue = "newest") String sortBy,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Page<MarketplaceProductDto> results = productService.searchProducts(
                sport, category, condition, minPrice, maxPrice, isVerified, location, query, sortBy, page, size
        );
        return ResponseEntity.ok(results);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MarketplaceProductDto> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @PostMapping
    public ResponseEntity<MarketplaceProductDto> createProduct(
            @Valid @RequestBody MarketplaceProductRequest req,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId
    ) {
        String userId = req.getSellerId() != null && !req.getSellerId().isEmpty() ? req.getSellerId() : headerUserId;
        MarketplaceProductDto created = productService.createProduct(req, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MarketplaceProductDto> updateProduct(
            @PathVariable Long id,
            @RequestBody MarketplaceProductRequest req,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId
    ) {
        return ResponseEntity.ok(productService.updateProduct(id, req, headerUserId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId
    ) {
        productService.deleteProduct(id, headerUserId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/wishlist")
    public ResponseEntity<MarketplaceProductDto> toggleWishlist(@PathVariable Long id) {
        return ResponseEntity.ok(productService.toggleWishlist(id));
    }

    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<List<MarketplaceProductDto>> getProductsBySeller(@PathVariable String sellerId) {
        return ResponseEntity.ok(productService.getProductsBySeller(sellerId));
    }

    @GetMapping("/shop/{shopId}")
    public ResponseEntity<List<MarketplaceProductDto>> getProductsByShop(@PathVariable Long shopId) {
        return ResponseEntity.ok(productService.getProductsByShop(shopId));
    }
}
