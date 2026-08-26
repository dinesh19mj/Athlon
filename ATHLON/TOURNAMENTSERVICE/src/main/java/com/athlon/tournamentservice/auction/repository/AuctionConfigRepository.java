package com.athlon.tournamentservice.auction.repository;

import com.athlon.tournamentservice.auction.entity.AuctionConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AuctionConfigRepository extends JpaRepository<AuctionConfig, Long> {
    Optional<AuctionConfig> findByAuctionUuid(UUID auctionUuid);
    Optional<AuctionConfig> findByChampionshipId(Long championshipId);
    Optional<AuctionConfig> findByChampionshipUuid(UUID championshipUuid);
}
