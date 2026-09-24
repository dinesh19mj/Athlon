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
            @RequestParam(name = "sport", required = false) String sport,
            @RequestParam(name = "category", required = false) String category,
            @RequestParam(name = "condition", required = false) String condition,
            @RequestParam(name = "minPrice", required = false) BigDecimal minPrice,
            @RequestParam(name = "maxPrice", required = false) BigDecimal maxPrice,
            @RequestParam(name = "isVerified", required = false) Boolean isVerified,
            @RequestParam(name = "location", required = false) String location,
            @RequestParam(name = "query", required = false) String query,
            @RequestParam(name = "sortBy", required = false, defaultValue = "newest") String sortBy,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size
    ) {
        Page<MarketplaceProductDto> results = productService.searchProducts(
                sport, category, condition, minPrice, maxPrice, isVerified, location, query, sortBy, page, size
        );
        return ResponseEntity.ok(results);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MarketplaceProductDto> getProductById(@PathVariable("id") Long id) {
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
            @PathVariable("id") Long id,
            @RequestBody MarketplaceProductRequest req,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId
    ) {
        return ResponseEntity.ok(productService.updateProduct(id, req, headerUserId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(
            @PathVariable("id") Long id,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId
    ) {
        productService.deleteProduct(id, headerUserId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/wishlist")
    public ResponseEntity<MarketplaceProductDto> toggleWishlist(@PathVariable("id") Long id) {
        return ResponseEntity.ok(productService.toggleWishlist(id));
    }

    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<List<MarketplaceProductDto>> getProductsBySeller(@PathVariable("sellerId") String sellerId) {
        return ResponseEntity.ok(productService.getProductsBySeller(sellerId));
    }

    @GetMapping("/shop/{shopId}")
    public ResponseEntity<List<MarketplaceProductDto>> getProductsByShop(@PathVariable("shopId") Long shopId) {
        return ResponseEntity.ok(productService.getProductsByShop(shopId));
    }
}
