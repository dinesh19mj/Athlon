package com.athlon.marketplaceservice.controller;

import com.athlon.marketplaceservice.dto.MarketplaceProductDto;
import com.athlon.marketplaceservice.dto.MarketplaceShopDto;
import com.athlon.marketplaceservice.service.MarketplaceAdminService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/marketplace/admin")
public class MarketplaceAdminController {

    private final MarketplaceAdminService adminService;

    public MarketplaceAdminController(MarketplaceAdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getPlatformStats() {
        return ResponseEntity.ok(adminService.getPlatformStats());
    }

    @GetMapping("/products")
    public ResponseEntity<Page<MarketplaceProductDto>> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(adminService.getAllProducts(pageRequest));
    }

    @PutMapping("/products/{id}/moderation")
    public ResponseEntity<MarketplaceProductDto> updateProductModeration(
            @PathVariable Long id,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Boolean isVerified,
            @RequestParam(required = false) String verificationStatus
    ) {
        return ResponseEntity.ok(adminService.updateProductModeration(id, status, isVerified, verificationStatus));
    }

    @PutMapping("/shops/{id}/verify")
    public ResponseEntity<MarketplaceShopDto> verifyShop(
            @PathVariable Long id,
            @RequestParam(defaultValue = "true") Boolean isVerified
    ) {
        return ResponseEntity.ok(adminService.verifyShop(id, isVerified));
    }
}
