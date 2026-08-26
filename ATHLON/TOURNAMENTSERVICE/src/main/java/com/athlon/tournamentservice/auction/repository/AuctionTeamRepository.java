package com.athlon.tournamentservice.auction.repository;

import com.athlon.tournamentservice.auction.entity.AuctionTeam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AuctionTeamRepository extends JpaRepository<AuctionTeam, Long> {
    Optional<AuctionTeam> findByTeamId(Long teamId);
    Optional<AuctionTeam> findByTeamUuid(UUID teamUuid);
    List<AuctionTeam> findByAuctionId(Long auctionId);
    List<AuctionTeam> findByAuctionUuid(UUID auctionUuid);
    Optional<AuctionTeam> findByAuctionIdAndTeamId(Long auctionId, Long teamId);
}
