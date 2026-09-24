package com.athlon.marketplaceservice.repository;

import com.athlon.marketplaceservice.entity.MarketplaceCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MarketplaceCategoryRepository extends JpaRepository<MarketplaceCategory, Long> {

    List<MarketplaceCategory> findByActiveTrueOrderByDisplayOrderAsc();

    Optional<MarketplaceCategory> findBySlug(String slug);

    List<MarketplaceCategory> findBySportAndActiveTrueOrderByDisplayOrderAsc(String sport);
}
