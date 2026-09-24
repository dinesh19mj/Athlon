package com.athlon.marketplaceservice.service;

import com.athlon.marketplaceservice.dto.MarketplaceProductDto;
import com.athlon.marketplaceservice.dto.MarketplaceProductRequest;
import com.athlon.marketplaceservice.dto.SellerEligibilityResponse;
import com.athlon.marketplaceservice.entity.MarketplaceProduct;
import com.athlon.marketplaceservice.repository.MarketplaceProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MarketplaceProductService {

    private final MarketplaceProductRepository productRepository;
    private final MarketplaceSellerEligibilityService eligibilityService;

    public MarketplaceProductService(MarketplaceProductRepository productRepository,
                                     MarketplaceSellerEligibilityService eligibilityService) {
        this.productRepository = productRepository;
        this.eligibilityService = eligibilityService;
    }

    @Transactional(readOnly = true)
    public Page<MarketplaceProductDto> searchProducts(
            String sport, String category, String condition,
            BigDecimal minPrice, BigDecimal maxPrice, Boolean isVerified,
            String location, String query, String sortBy, int page, int size
    ) {
        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        if ("price_asc".equalsIgnoreCase(sortBy)) {
            sort = Sort.by(Sort.Direction.ASC, "price");
        } else if ("price_desc".equalsIgnoreCase(sortBy)) {
            sort = Sort.by(Sort.Direction.DESC, "price");
        } else if ("popular".equalsIgnoreCase(sortBy)) {
            sort = Sort.by(Sort.Direction.DESC, "viewsCount");
        }

        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size), sort);

        String normalizedSport = (sport != null && !sport.equalsIgnoreCase("all") && !sport.trim().isEmpty())
                ? sport.trim().toLowerCase() : null;
        String normalizedCategory = (category != null && !category.equalsIgnoreCase("all") && !category.trim().isEmpty())
                ? category.trim().toLowerCase() : null;
        String normalizedCondition = (condition != null && !condition.equalsIgnoreCase("all") && !condition.trim().isEmpty())
                ? condition.trim().toLowerCase() : null;
        String normalizedQuery = (query != null && !query.trim().isEmpty())
                ? "%" + query.trim().toLowerCase() + "%" : null;
        String normalizedLocation = (location != null && !location.trim().isEmpty())
                ? "%" + location.trim().toLowerCase() + "%" : null;

        Page<MarketplaceProduct> products = productRepository.searchProducts(
                "AVAILABLE", normalizedSport, normalizedCategory, normalizedCondition,
                minPrice, maxPrice, isVerified, normalizedLocation, normalizedQuery, pageable
        );

        return products.map(MarketplaceProductDto::fromEntity);
    }

    @Transactional
    public MarketplaceProductDto getProductById(Long id) {
        MarketplaceProduct product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with ID: " + id));

        // Increment views
        product.setViewsCount(product.getViewsCount() != null ? product.getViewsCount() + 1 : 1);
        productRepository.save(product);

        return MarketplaceProductDto.fromEntity(product);
    }

    @Transactional
    public MarketplaceProductDto createProduct(MarketplaceProductRequest req, String authenticatedUserId) {
        String sellerId = req.getSellerId() != null && !req.getSellerId().isEmpty() ? req.getSellerId() : authenticatedUserId;
        if (sellerId == null || sellerId.trim().isEmpty()) {
            throw new IllegalArgumentException("Seller ID is required");
        }

        // Verify eligibility rule (unless creating under a verified shop)
        if (req.getShopId() == null) {
            SellerEligibilityResponse eligibility = eligibilityService.checkEligibility(sellerId);
            if (!eligibility.isEligible()) {
                throw new IllegalStateException("Seller is not eligible to list gear: " + eligibility.getMessage());
            }
        }

        MarketplaceProduct product = new MarketplaceProduct();
        product.setTitle(req.getTitle());
        product.setDescription(req.getDescription());
        product.setSport(req.getSport());
        product.setCategory(req.getCategory());
        product.setPrice(req.getPrice());
        product.setOriginalPrice(req.getOriginalPrice());
        product.setCondition(req.getCondition());
        product.setConditionDetails(req.getConditionDetails());
        product.setBrand(req.getBrand());
        product.setModel(req.getModel());
        product.setYearOfPurchase(req.getYearOfPurchase());
        product.setLocation(req.getLocation());
        product.setTags(req.getTags());
        product.setSellerId(sellerId);
        product.setSellerName(req.getSellerName() != null ? req.getSellerName() : "Athlon Athlete");
        product.setSellerRole(req.getSellerRole() != null ? req.getSellerRole() : "Individual Seller");
        product.setSellerAvatarUrl(req.getSellerAvatarUrl());
        product.setShopId(req.getShopId());
        product.setStatus("AVAILABLE");

        if (req.getImages() != null && !req.getImages().isEmpty()) {
            product.setImages(req.getImages());
        }

        // If from a verified shop, mark product as verified
        if (req.getShopId() != null) {
            product.setIsVerified(true);
            product.setVerificationStatus("PRO_VERIFIED");
            product.setSellerRole("Verified Shop");
        }

        MarketplaceProduct saved = productRepository.save(product);
        return MarketplaceProductDto.fromEntity(saved);
    }

    @Transactional
    public MarketplaceProductDto updateProduct(Long id, MarketplaceProductRequest req, String authenticatedUserId) {
        MarketplaceProduct product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with ID: " + id));

        if (authenticatedUserId != null && !authenticatedUserId.equals(product.getSellerId())) {
            throw new SecurityException("Unauthorized to modify this listing");
        }

        if (req.getTitle() != null) product.setTitle(req.getTitle());
        if (req.getDescription() != null) product.setDescription(req.getDescription());
        if (req.getSport() != null) product.setSport(req.getSport());
        if (req.getCategory() != null) product.setCategory(req.getCategory());
        if (req.getPrice() != null) product.setPrice(req.getPrice());
        if (req.getOriginalPrice() != null) product.setOriginalPrice(req.getOriginalPrice());
        if (req.getCondition() != null) product.setCondition(req.getCondition());
        if (req.getConditionDetails() != null) product.setConditionDetails(req.getConditionDetails());
        if (req.getBrand() != null) product.setBrand(req.getBrand());
        if (req.getModel() != null) product.setModel(req.getModel());
        if (req.getYearOfPurchase() != null) product.setYearOfPurchase(req.getYearOfPurchase());
        if (req.getLocation() != null) product.setLocation(req.getLocation());
        if (req.getTags() != null) product.setTags(req.getTags());
        if (req.getImages() != null && !req.getImages().isEmpty()) product.setImages(req.getImages());

        MarketplaceProduct updated = productRepository.save(product);
        return MarketplaceProductDto.fromEntity(updated);
    }

    @Transactional
    public void deleteProduct(Long id, String authenticatedUserId) {
        MarketplaceProduct product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with ID: " + id));

        if (authenticatedUserId != null && !authenticatedUserId.equals(product.getSellerId())) {
            throw new SecurityException("Unauthorized to delete this listing");
        }

        product.setStatus("ARCHIVED");
        productRepository.save(product);
    }

    @Transactional
    public MarketplaceProductDto toggleWishlist(Long id) {
        MarketplaceProduct product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with ID: " + id));

        int current = product.getWishlistCount() != null ? product.getWishlistCount() : 0;
        product.setWishlistCount(current + 1);
        MarketplaceProduct saved = productRepository.save(product);
        return MarketplaceProductDto.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<MarketplaceProductDto> getProductsBySeller(String sellerId) {
        return productRepository.findBySellerIdOrderByCreatedAtDesc(sellerId).stream()
                .map(MarketplaceProductDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MarketplaceProductDto> getProductsByShop(Long shopId) {
        return productRepository.findByShopIdOrderByCreatedAtDesc(shopId).stream()
                .map(MarketplaceProductDto::fromEntity)
                .collect(Collectors.toList());
    }
}
