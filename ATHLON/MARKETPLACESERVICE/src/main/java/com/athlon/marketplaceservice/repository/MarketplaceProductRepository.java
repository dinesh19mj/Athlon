package com.athlon.marketplaceservice.repository;

import com.athlon.marketplaceservice.entity.MarketplaceProduct;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface MarketplaceProductRepository extends JpaRepository<MarketplaceProduct, Long> {

    List<MarketplaceProduct> findByStatusOrderByCreatedAtDesc(String status);

    List<MarketplaceProduct> findBySellerIdOrderByCreatedAtDesc(String sellerId);

    List<MarketplaceProduct> findByShopIdOrderByCreatedAtDesc(Long shopId);

    @Query("SELECT p FROM MarketplaceProduct p WHERE " +
           "(:status IS NULL OR p.status = :status) AND " +
           "(:sport IS NULL OR LOWER(p.sport) = LOWER(:sport)) AND " +
           "(:category IS NULL OR LOWER(p.category) = LOWER(:category)) AND " +
           "(:condition IS NULL OR LOWER(p.condition) = LOWER(:condition)) AND " +
           "(:minPrice IS NULL OR p.price >= :minPrice) AND " +
           "(:maxPrice IS NULL OR p.price <= :maxPrice) AND " +
           "(:isVerified IS NULL OR p.isVerified = :isVerified) AND " +
           "(:location IS NULL OR LOWER(p.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
           "(:query IS NULL OR (" +
               "LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
               "LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
               "LOWER(p.brand) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
               "LOWER(p.tags) LIKE LOWER(CONCAT('%', :query, '%'))" +
           "))")
    Page<MarketplaceProduct> searchProducts(
            @Param("status") String status,
            @Param("sport") String sport,
            @Param("category") String category,
            @Param("condition") String condition,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("isVerified") Boolean isVerified,
            @Param("location") String location,
            @Param("query") String query,
            Pageable pageable
    );

    long countBySellerId(String sellerId);

    long countByStatus(String status);
}
