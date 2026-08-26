package com.athlon.tournamentservice.auction.repository;

import com.athlon.tournamentservice.auction.entity.AuctionReservedPlayer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AuctionReservedPlayerRepository extends JpaRepository<AuctionReservedPlayer, Long> {
    Optional<AuctionReservedPlayer> findByReservedUuid(UUID reservedUuid);
    List<AuctionReservedPlayer> findByAuctionId(Long auctionId);
    List<AuctionReservedPlayer> findByTeamId(Long teamId);
    List<AuctionReservedPlayer> findByChampionshipId(Long championshipId);
    Optional<AuctionReservedPlayer> findByChampionshipIdAndPlayerId(Long championshipId, Long playerId);
    int countByTeamId(Long teamId);
}
