package com.athlon.tournamentservice.auction.repository;

import com.athlon.tournamentservice.auction.entity.AuctionCategoryConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AuctionCategoryConfigRepository extends JpaRepository<AuctionCategoryConfig, Long> {
    List<AuctionCategoryConfig> findByAuctionId(Long auctionId);
    Optional<AuctionCategoryConfig> findByAuctionIdAndCategoryId(Long auctionId, Long categoryId);
    void deleteByAuctionId(Long auctionId);
}
