package com.athlon.marketplaceservice.repository;

import com.athlon.marketplaceservice.entity.MarketplaceInquiry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MarketplaceInquiryRepository extends JpaRepository<MarketplaceInquiry, Long> {

    List<MarketplaceInquiry> findByProductIdOrderByCreatedAtDesc(Long productId);

    List<MarketplaceInquiry> findByBuyerUserIdOrderByCreatedAtDesc(String buyerUserId);

    List<MarketplaceInquiry> findBySellerUserIdOrderByCreatedAtDesc(String sellerUserId);
}
