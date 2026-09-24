package com.athlon.marketplaceservice.service;

import com.athlon.marketplaceservice.dto.MarketplaceProductDto;
import com.athlon.marketplaceservice.dto.MarketplaceShopDto;
import com.athlon.marketplaceservice.entity.MarketplaceProduct;
import com.athlon.marketplaceservice.entity.MarketplaceShop;
import com.athlon.marketplaceservice.repository.MarketplaceOrderRepository;
import com.athlon.marketplaceservice.repository.MarketplaceProductRepository;
import com.athlon.marketplaceservice.repository.MarketplaceShopRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
public class MarketplaceAdminService {

    private final MarketplaceProductRepository productRepository;
    private final MarketplaceShopRepository shopRepository;
    private final MarketplaceOrderRepository orderRepository;

    public MarketplaceAdminService(MarketplaceProductRepository productRepository,
                                  MarketplaceShopRepository shopRepository,
                                  MarketplaceOrderRepository orderRepository) {
        this.productRepository = productRepository;
        this.shopRepository = shopRepository;
        this.orderRepository = orderRepository;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getPlatformStats() {
        Map<String, Object> stats = new HashMap<>();

        long totalProducts = productRepository.count();
        long availableProducts = productRepository.countByStatus("AVAILABLE");
        long soldProducts = productRepository.countByStatus("SOLD");

        long totalShops = shopRepository.count();
        long verifiedShops = shopRepository.countByIsVerifiedTrue();

        long totalOrders = orderRepository.count();
        BigDecimal grossSales = orderRepository.getTotalGrossSales();
        BigDecimal totalCommissions = orderRepository.getTotalCommissions();

        stats.put("totalProducts", totalProducts);
        stats.put("availableProducts", availableProducts);
        stats.put("soldProducts", soldProducts);
        stats.put("totalShops", totalShops);
        stats.put("verifiedShops", verifiedShops);
        stats.put("totalOrders", totalOrders);
        stats.put("grossSales", grossSales != null ? grossSales : BigDecimal.ZERO);
        stats.put("totalCommissions", totalCommissions != null ? totalCommissions : BigDecimal.ZERO);

        return stats;
    }

    @Transactional(readOnly = true)
    public Page<MarketplaceProductDto> getAllProducts(Pageable pageable) {
        return productRepository.findAll(pageable).map(MarketplaceProductDto::fromEntity);
    }

    @Transactional
    public MarketplaceProductDto updateProductModeration(Long productId, String status, Boolean isVerified, String verificationStatus) {
        MarketplaceProduct product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found: " + productId));

        if (status != null && !status.trim().isEmpty()) {
            product.setStatus(status.toUpperCase());
        }
        if (isVerified != null) {
            product.setIsVerified(isVerified);
        }
        if (verificationStatus != null && !verificationStatus.trim().isEmpty()) {
            product.setVerificationStatus(verificationStatus.toUpperCase());
        }

        MarketplaceProduct updated = productRepository.save(product);
        return MarketplaceProductDto.fromEntity(updated);
    }

    @Transactional
    public MarketplaceShopDto verifyShop(Long shopId, Boolean isVerified) {
        MarketplaceShop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new IllegalArgumentException("Shop not found: " + shopId));

        shop.setIsVerified(isVerified != null ? isVerified : true);
        MarketplaceShop updated = shopRepository.save(shop);
        return MarketplaceShopDto.fromEntity(updated);
    }
}
