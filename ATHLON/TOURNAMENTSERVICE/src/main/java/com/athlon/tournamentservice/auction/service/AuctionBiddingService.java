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
        // 1. Fetch & Validate Auction (check both auctionId PK and championshipId)
        AuctionConfig config = null;
        if (request.getAuctionId() != null) {
            config = configRepository.findById(request.getAuctionId())
                    .or(() -> configRepository.findByChampionshipId(request.getAuctionId()))
                    .orElse(null);
        }
        if (config == null) {
            throw new IllegalArgumentException("Auction configuration not found for ID: " + request.getAuctionId());
        }

        if (!"ACTIVE".equalsIgnoreCase(config.getStatus()) && !"PAUSED".equalsIgnoreCase(config.getStatus()) && !"READY".equalsIgnoreCase(config.getStatus())) {
            throw new IllegalStateException("Auction is not active (status: " + config.getStatus() + ")");
        }

        if ("PAUSED".equalsIgnoreCase(config.getStatus()) || config.getTimerPausedRemainingSeconds() != null) {
            throw new IllegalStateException("Auction timer is currently paused by the organizer. Bidding is locked.");
        }

        // 2. Fetch & Validate Player
        AuctionPlayer player = playerRepository.findById(request.getAuctionPlayerId())
                .orElseThrow(() -> new IllegalArgumentException("Player not found in auction"));

        if (!"BIDDING".equalsIgnoreCase(player.getState()) && !"CALLED".equalsIgnoreCase(player.getState())) {
            throw new IllegalStateException("Player is not open for bidding (state: " + player.getState() + ")");
        }

        // 3. Fetch & Validate Team
        AuctionTeam team = teamRepository.findByAuctionIdAndTeamId(config.getAuctionId(), request.getTeamId())
                .or(() -> teamRepository.findByTeamId(request.getTeamId()))
                .orElseThrow(() -> new IllegalArgumentException("Team not registered in this auction"));

        if (!Boolean.TRUE.equals(team.getIsEligible())) {
            throw new IllegalStateException("Team is disqualified from bidding");
        }

        // Check squad capacity
        int acquired = team.getPlayersAcquiredCount() != null ? team.getPlayersAcquiredCount() : 0;
        int reserved = team.getReservedSlotsCount() != null ? team.getReservedSlotsCount() : 0;
        int capacity = team.getSquadCapacity() != null && team.getSquadCapacity() > 0 ? team.getSquadCapacity() : 100;
        if (acquired + reserved >= capacity) {
            throw new IllegalStateException("Team squad is already full (" + capacity + " slots)");
        }

        // 4. Validate Bid Amount
        double basePrice = player.getBasePrice() != null && player.getBasePrice() > 0 ? player.getBasePrice() : 100.0;
        double currentBid = config.getCurrentBid() != null && config.getCurrentBid() > 0 ? config.getCurrentBid() : 0.0;
        double minIncrement = config.getBidIncrement() != null && config.getBidIncrement() > 0 ? config.getBidIncrement() : 50.0;

        if (player.getCategoryId() != null) {
            categoryConfigRepository.findByAuctionIdAndCategoryId(config.getAuctionId(), player.getCategoryId())
                    .ifPresent(catConfig -> {
                        if (catConfig.getMinBidIncrement() != null && catConfig.getMinBidIncrement() > 0) {
                            // category override
                        }
                    });
        }

        Double bidAmount = request.getBidAmount();
        if (bidAmount == null || bidAmount <= 0) {
            throw new IllegalArgumentException("Bid amount must be a positive number.");
        }

        if (currentBid <= 0.0) {
            // Opening bid must be at least base price
            if (bidAmount < basePrice) {
                throw new IllegalArgumentException("Opening bid must be at least the base price of " + basePrice);
            }
        } else {
            if (bidAmount <= currentBid) {
                throw new IllegalArgumentException("Bid amount (" + bidAmount + ") must be greater than current high bid (" + currentBid + ")");
            }
        }

        // 5. Validate Team Remaining Purse / Budget
        double remainingBudget = team.getRemainingBudget() != null ? team.getRemainingBudget() : 0.0;
        if (remainingBudget < bidAmount) {
            throw new IllegalStateException("Insufficient purse balance: Team '" + team.getTeamName() + 
                    "' has " + remainingBudget + " pts remaining, which is less than the required bid of " + bidAmount + " pts.");
        }

        // 6. Systematically Activate and Reset Countdown Timer on every new bid
        LocalDateTime now = LocalDateTime.now();
        int timerSec = (config.getTimerSeconds() != null && config.getTimerSeconds() > 0) ? config.getTimerSeconds() : 60;
        config.setTimerEndTime(now.plusSeconds(timerSec));
        config.setTimerPausedRemainingSeconds(null);
        config.setStatus("ACTIVE");

        // 7. Update Auction Config & Player Current Leader
        config.setCurrentBid(bidAmount);
        config.setWinningTeamId(team.getTeamId());
        configRepository.save(config);

        player.setState("BIDDING");
        player.setFinalBid(bidAmount);
        player.setWinningTeamId(team.getTeamId());
        player.setWinningTeamName(team.getTeamName());
        playerRepository.save(player);

        // 8. Save Bid Record
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
