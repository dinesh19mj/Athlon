package com.athlon.marketplaceservice.repository;

import com.athlon.marketplaceservice.entity.MarketplaceShop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MarketplaceShopRepository extends JpaRepository<MarketplaceShop, Long> {

    Optional<MarketplaceShop> findBySlug(String slug);

    List<MarketplaceShop> findByOwnerUserId(String ownerUserId);

    List<MarketplaceShop> findByStatusOrderByCreatedAtDesc(String status);

    boolean existsBySlug(String slug);

    long countByIsVerifiedTrue();
}
