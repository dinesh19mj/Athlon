package com.athlon.tournamentservice.auction.repository;

import com.athlon.tournamentservice.auction.entity.AuctionBid;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuctionBidRepository extends JpaRepository<AuctionBid, Long> {
    List<AuctionBid> findByAuctionPlayerIdOrderByBidAmountDesc(Long auctionPlayerId);
    List<AuctionBid> findByAuctionIdOrderByCreatedAtDesc(Long auctionId);
    List<AuctionBid> findByAuctionIdAndTeamId(Long auctionId, Long teamId);
}
