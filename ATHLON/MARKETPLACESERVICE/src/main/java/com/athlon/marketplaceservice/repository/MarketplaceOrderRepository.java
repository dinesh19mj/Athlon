package com.athlon.marketplaceservice.repository;

import com.athlon.marketplaceservice.entity.MarketplaceOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MarketplaceOrderRepository extends JpaRepository<MarketplaceOrder, Long> {

    Optional<MarketplaceOrder> findByOrderNumber(String orderNumber);

    List<MarketplaceOrder> findByBuyerUserIdOrderByCreatedAtDesc(String buyerUserId);

    List<MarketplaceOrder> findBySellerUserIdOrderByCreatedAtDesc(String sellerUserId);

    List<MarketplaceOrder> findByShopIdOrderByCreatedAtDesc(Long shopId);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM MarketplaceOrder o")
    java.math.BigDecimal getTotalGrossSales();

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(o.commissionAmount), 0) FROM MarketplaceOrder o")
    java.math.BigDecimal getTotalCommissions();
}
