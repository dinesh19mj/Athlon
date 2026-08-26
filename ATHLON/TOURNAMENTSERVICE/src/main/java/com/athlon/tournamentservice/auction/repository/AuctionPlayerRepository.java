package com.athlon.tournamentservice.auction.repository;

import com.athlon.tournamentservice.auction.entity.AuctionPlayer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AuctionPlayerRepository extends JpaRepository<AuctionPlayer, Long> {
    Optional<AuctionPlayer> findByAuctionPlayerUuid(UUID auctionPlayerUuid);
    List<AuctionPlayer> findByAuctionId(Long auctionId);
    List<AuctionPlayer> findByAuctionUuid(UUID auctionUuid);
    List<AuctionPlayer> findByAuctionIdAndState(Long auctionId, String state);
    List<AuctionPlayer> findByAuctionIdAndCategoryId(Long auctionId, Long categoryId);
    Optional<AuctionPlayer> findByAuctionIdAndPlayerId(Long auctionId, Long playerId);
    Optional<AuctionPlayer> findByAuctionIdAndStateIn(Long auctionId, List<String> states);
    List<AuctionPlayer> findByAuctionIdAndWinningTeamId(Long auctionId, Long winningTeamId);
}
