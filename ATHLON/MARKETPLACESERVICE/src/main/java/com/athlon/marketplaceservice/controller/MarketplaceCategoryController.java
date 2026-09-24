package com.athlon.marketplaceservice.controller;

import com.athlon.marketplaceservice.entity.MarketplaceCategory;
import com.athlon.marketplaceservice.repository.MarketplaceCategoryRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/marketplace/categories")
public class MarketplaceCategoryController {

    private final MarketplaceCategoryRepository categoryRepository;

    public MarketplaceCategoryController(MarketplaceCategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @GetMapping
    public ResponseEntity<List<MarketplaceCategory>> getAllCategories(@RequestParam(name = "sport", required = false) String sport) {
        if (sport != null && !sport.equalsIgnoreCase("all") && !sport.trim().isEmpty()) {
            return ResponseEntity.ok(categoryRepository.findBySportAndActiveTrueOrderByDisplayOrderAsc(sport));
        }
        return ResponseEntity.ok(categoryRepository.findByActiveTrueOrderByDisplayOrderAsc());
    }

    @GetMapping("/{slug}")
    public ResponseEntity<MarketplaceCategory> getCategoryBySlug(@PathVariable("slug") String slug) {
        return categoryRepository.findBySlug(slug)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
