package com.athlon.marketplaceservice.repository;

import com.athlon.marketplaceservice.entity.MarketplaceOffer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MarketplaceOfferRepository extends JpaRepository<MarketplaceOffer, Long> {

    List<MarketplaceOffer> findByProductIdOrderByCreatedAtDesc(Long productId);

    List<MarketplaceOffer> findByBuyerUserIdOrderByCreatedAtDesc(String buyerUserId);

    List<MarketplaceOffer> findBySellerUserIdOrderByCreatedAtDesc(String sellerUserId);
}
