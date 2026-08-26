package com.athlon.tournamentservice.auction.repository;

import com.athlon.tournamentservice.auction.entity.AuctionBudgetTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuctionBudgetTransactionRepository extends JpaRepository<AuctionBudgetTransaction, Long> {
    List<AuctionBudgetTransaction> findByAuctionIdAndTeamIdOrderByCreatedAtDesc(Long auctionId, Long teamId);
    List<AuctionBudgetTransaction> findByAuctionIdOrderByCreatedAtDesc(Long auctionId);
}
