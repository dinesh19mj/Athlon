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
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size
    ) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(adminService.getAllProducts(pageRequest));
    }

    @PutMapping("/products/{id}/moderation")
    public ResponseEntity<MarketplaceProductDto> updateProductModeration(
            @PathVariable("id") Long id,
            @RequestParam(name = "status", required = false) String status,
            @RequestParam(name = "isVerified", required = false) Boolean isVerified,
            @RequestParam(name = "verificationStatus", required = false) String verificationStatus
    ) {
        return ResponseEntity.ok(adminService.updateProductModeration(id, status, isVerified, verificationStatus));
    }

    @PutMapping("/shops/{id}/verify")
    public ResponseEntity<MarketplaceShopDto> verifyShop(
            @PathVariable("id") Long id,
            @RequestParam(name = "isVerified", defaultValue = "true") Boolean isVerified
    ) {
        return ResponseEntity.ok(adminService.verifyShop(id, isVerified));
    }
}
