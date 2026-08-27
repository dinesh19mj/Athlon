package com.athlon.tournamentservice.auction.service;

import com.athlon.tournamentservice.auction.dto.request.PlaceBidRequest;
import com.athlon.tournamentservice.auction.entity.*;
import com.athlon.tournamentservice.auction.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AuctionBiddingService {

    private final AuctionConfigRepository configRepository;
    private final AuctionPlayerRepository playerRepository;
    private final AuctionTeamRepository teamRepository;
    private final AuctionBidRepository bidRepository;
    private final AuctionCategoryConfigRepository categoryConfigRepository;

    @Autowired
    public AuctionBiddingService(
            AuctionConfigRepository configRepository,
            AuctionPlayerRepository playerRepository,
            AuctionTeamRepository teamRepository,
            AuctionBidRepository bidRepository,
            AuctionCategoryConfigRepository categoryConfigRepository) {
        this.configRepository = configRepository;
        this.playerRepository = playerRepository;
        this.teamRepository = teamRepository;
        this.bidRepository = bidRepository;
        this.categoryConfigRepository = categoryConfigRepository;
    }

    @Transactional
    public synchronized AuctionBid placeBid(PlaceBidRequest request) {
        // 1. Fetch & Validate Auction
        AuctionConfig config = configRepository.findById(request.getAuctionId())
                .orElseThrow(() -> new IllegalArgumentException("Auction not found"));

        if (!"ACTIVE".equalsIgnoreCase(config.getStatus())) {
            throw new IllegalStateException("Auction is not active (status: " + config.getStatus() + ")");
        }

        // 2. Fetch & Validate Player
        AuctionPlayer player = playerRepository.findById(request.getAuctionPlayerId())
                .orElseThrow(() -> new IllegalArgumentException("Player not found in auction"));

        if (!"BIDDING".equalsIgnoreCase(player.getState()) && !"CALLED".equalsIgnoreCase(player.getState())) {
            throw new IllegalStateException("Player is not open for bidding (state: " + player.getState() + ")");
        }

        // 3. Fetch & Validate Team
        AuctionTeam team = teamRepository.findByAuctionIdAndTeamId(config.getAuctionId(), request.getTeamId())
                .orElseThrow(() -> new IllegalArgumentException("Team not registered in this auction"));

        if (!Boolean.TRUE.equals(team.getIsEligible())) {
            throw new IllegalStateException("Team is disqualified from bidding");
        }

        // Check squad capacity
        if (team.getPlayersAcquiredCount() + team.getReservedSlotsCount() >= team.getSquadCapacity()) {
            throw new IllegalStateException("Team squad is already full (" + team.getSquadCapacity() + " slots)");
        }

        // 4. Validate Bid Amount
        Double currentBid = config.getCurrentBid() != null && config.getCurrentBid() > 0 ? config.getCurrentBid() : player.getBasePrice();
        Double minIncrement = config.getBidIncrement();

        if (player.getCategoryId() != null) {
            categoryConfigRepository.findByAuctionIdAndCategoryId(config.getAuctionId(), player.getCategoryId())
                    .ifPresent(catConfig -> {
                        if (catConfig.getMinBidIncrement() != null) {
                            // Use category specific increment if configured
                        }
                    });
        }

        Double bidAmount = request.getBidAmount();
        if ("CALLED".equalsIgnoreCase(player.getState()) && (config.getCurrentBid() == null || config.getCurrentBid() == 0.0)) {
            // Opening bid can equal base price
            if (bidAmount < player.getBasePrice()) {
                throw new IllegalArgumentException("Opening bid must be at least the base price of " + player.getBasePrice());
            }
        } else {
            if (bidAmount <= config.getCurrentBid()) {
                throw new IllegalArgumentException("Bid amount (" + bidAmount + ") must be greater than current bid (" + config.getCurrentBid() + ")");
            }
            if ((bidAmount - config.getCurrentBid()) < minIncrement) {
                throw new IllegalArgumentException("Minimum bid increment is " + minIncrement + ". Expected at least " + (config.getCurrentBid() + minIncrement));
            }
        }

        // Check Team Budget
        if (team.getRemainingBudget() < bidAmount) {
            throw new IllegalStateException("Insufficient budget: Team remaining is " + team.getRemainingBudget() + ", bid is " + bidAmount);
        }

        // 5. Systematically Reset Countdown Timer on every new bid
        LocalDateTime now = LocalDateTime.now();
        int timerSec = (config.getTimerSeconds() != null && config.getTimerSeconds() > 0) ? config.getTimerSeconds() : 60;
        config.setTimerEndTime(now.plusSeconds(timerSec));

        // 6. Update Auction Config & Player Current Leader
        config.setCurrentBid(bidAmount);
        config.setWinningTeamId(team.getTeamId());
        configRepository.save(config);

        player.setState("BIDDING");
        player.setFinalBid(bidAmount);
        player.setWinningTeamId(team.getTeamId());
        player.setWinningTeamName(team.getTeamName());
        playerRepository.save(player);

        // 7. Save Bid Record
        AuctionBid bid = new AuctionBid();
        bid.setAuctionId(config.getAuctionId());
        bid.setAuctionPlayerId(player.getAuctionPlayerId());
        bid.setTeamId(team.getTeamId());
        bid.setTeamName(team.getTeamName());
        bid.setBidAmount(bidAmount);
        bid.setUserId(request.getUserId());
        bid.setIsWinningBid(true);

        return bidRepository.save(bid);
    }

    public List<AuctionBid> getBidsForPlayer(Long auctionPlayerId) {
        return bidRepository.findByAuctionPlayerIdOrderByBidAmountDesc(auctionPlayerId);
    }

    public List<AuctionBid> getRecentAuctionBids(Long auctionId) {
        return bidRepository.findByAuctionIdOrderByCreatedAtDesc(auctionId);
    }
}
