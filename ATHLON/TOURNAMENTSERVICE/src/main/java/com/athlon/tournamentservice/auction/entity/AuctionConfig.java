package com.athlon.tournamentservice.auction.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "auction_configs")
public class AuctionConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "auction_id", updatable = false, nullable = false)
    private Long auctionId;

    @Column(name = "auction_uuid", updatable = false, nullable = false, unique = true)
    private UUID auctionUuid;

    @Column(name = "championship_id", nullable = false, unique = true)
    private Long championshipId;

    @Column(name = "championship_uuid", nullable = false, unique = true)
    private UUID championshipUuid;

    @Column(name = "auction_mode", nullable = false)
    private String auctionMode = "FULL_AUCTION"; // "FULL_AUCTION", "PARTIAL_AUCTION", "NO_AUCTION"

    @Column(name = "currency_type")
    private String currencyType = "POINTS"; // "POINTS", "REAL_MONEY"

    @Column(name = "currency_symbol_or_label")
    private String currencySymbolOrLabel = "pts"; // "pts", "₹", "$", etc.

    @Column(name = "base_price_strategy")
    private String basePriceStrategy = "CATEGORY_BASED"; // "CATEGORY_BASED", "FIXED_GLOBAL", "CUSTOM"

    @Column(name = "default_base_price")
    private Double defaultBasePrice = 1000.0;

    @Column(name = "bid_increment")
    private Double bidIncrement = 500.0;

    @Column(name = "team_budget")
    private Double teamBudget = 50000.0;

    @Column(name = "reserved_players_per_team")
    private Integer reservedPlayersPerTeam = 0;

    @Column(name = "timer_seconds")
    private Integer timerSeconds = 30;

    @Column(name = "anti_sniping_seconds")
    private Integer antiSnipingSeconds = 10;

    @Column(name = "status")
    private String status = "DRAFT"; // "DRAFT", "READY", "ACTIVE", "PAUSED", "COMPLETED"

    @Column(name = "active_player_id")
    private Long activePlayerId;

    @Column(name = "current_bid")
    private Double currentBid = 0.0;

    @Column(name = "winning_team_id")
    private Long winningTeamId;

    @Column(name = "timer_end_time")
    private LocalDateTime timerEndTime;

    @Column(name = "bidding_mode")
    private String biddingMode = "MANUAL"; // "MANUAL", "AUTOMATIC"

    @Column(name = "quick_point_bumps")
    private String quickPointBumps = "100,250,500,1000,2000";

    @Column(name = "timer_paused_remaining_seconds")
    private Integer timerPausedRemainingSeconds;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (this.auctionUuid == null) {
            this.auctionUuid = UUID.randomUUID();
        }
        if (this.auctionMode == null) this.auctionMode = "FULL_AUCTION";
        if (this.currencyType == null) this.currencyType = "POINTS";
        if (this.currencySymbolOrLabel == null) this.currencySymbolOrLabel = "pts";
        if (this.basePriceStrategy == null) this.basePriceStrategy = "CATEGORY_BASED";
        if (this.defaultBasePrice == null) this.defaultBasePrice = 1000.0;
        if (this.bidIncrement == null) this.bidIncrement = 500.0;
        if (this.teamBudget == null) this.teamBudget = 50000.0;
        if (this.reservedPlayersPerTeam == null) this.reservedPlayersPerTeam = 0;
        if (this.timerSeconds == null) this.timerSeconds = 60;
        if (this.antiSnipingSeconds == null) this.antiSnipingSeconds = 10;
        if (this.biddingMode == null) this.biddingMode = "MANUAL";
        if (this.quickPointBumps == null) this.quickPointBumps = "100,250,500,1000,2000";
        if (this.status == null) this.status = "DRAFT";
    }

    public AuctionConfig() {}

    public Long getAuctionId() {
        return auctionId;
    }

    public void setAuctionId(Long auctionId) {
        this.auctionId = auctionId;
    }

    public UUID getAuctionUuid() {
        return auctionUuid;
    }

    public void setAuctionUuid(UUID auctionUuid) {
        this.auctionUuid = auctionUuid;
    }

    public Long getChampionshipId() {
        return championshipId;
    }

    public void setChampionshipId(Long championshipId) {
        this.championshipId = championshipId;
    }

    public UUID getChampionshipUuid() {
        return championshipUuid;
    }

    public void setChampionshipUuid(UUID championshipUuid) {
        this.championshipUuid = championshipUuid;
    }

    public String getAuctionMode() {
        return auctionMode;
    }

    public void setAuctionMode(String auctionMode) {
        this.auctionMode = auctionMode;
    }

    public String getCurrencyType() {
        return currencyType;
    }

    public void setCurrencyType(String currencyType) {
        this.currencyType = currencyType;
    }

    public String getCurrencySymbolOrLabel() {
        return currencySymbolOrLabel;
    }

    public void setCurrencySymbolOrLabel(String currencySymbolOrLabel) {
        this.currencySymbolOrLabel = currencySymbolOrLabel;
    }

    public String getBasePriceStrategy() {
        return basePriceStrategy;
    }

    public void setBasePriceStrategy(String basePriceStrategy) {
        this.basePriceStrategy = basePriceStrategy;
    }

    public Double getDefaultBasePrice() {
        return defaultBasePrice;
    }

    public void setDefaultBasePrice(Double defaultBasePrice) {
        this.defaultBasePrice = defaultBasePrice;
    }

    public Double getBidIncrement() {
        return bidIncrement;
    }

    public void setBidIncrement(Double bidIncrement) {
        this.bidIncrement = bidIncrement;
    }

    public Double getTeamBudget() {
        return teamBudget;
    }

    public void setTeamBudget(Double teamBudget) {
        this.teamBudget = teamBudget;
    }

    public Integer getReservedPlayersPerTeam() {
        return reservedPlayersPerTeam;
    }

    public void setReservedPlayersPerTeam(Integer reservedPlayersPerTeam) {
        this.reservedPlayersPerTeam = reservedPlayersPerTeam;
    }

    public Integer getTimerSeconds() {
        return timerSeconds;
    }

    public void setTimerSeconds(Integer timerSeconds) {
        this.timerSeconds = timerSeconds;
    }

    public Integer getAntiSnipingSeconds() {
        return antiSnipingSeconds;
    }

    public void setAntiSnipingSeconds(Integer antiSnipingSeconds) {
        this.antiSnipingSeconds = antiSnipingSeconds;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Long getActivePlayerId() {
        return activePlayerId;
    }

    public void setActivePlayerId(Long activePlayerId) {
        this.activePlayerId = activePlayerId;
    }

    public Double getCurrentBid() {
        return currentBid;
    }

    public void setCurrentBid(Double currentBid) {
        this.currentBid = currentBid;
    }

    public Long getWinningTeamId() {
        return winningTeamId;
    }

    public void setWinningTeamId(Long winningTeamId) {
        this.winningTeamId = winningTeamId;
    }

    public LocalDateTime getTimerEndTime() {
        return timerEndTime;
    }

    public void setTimerEndTime(LocalDateTime timerEndTime) {
        this.timerEndTime = timerEndTime;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getBiddingMode() {
        return biddingMode;
    }

    public void setBiddingMode(String biddingMode) {
        this.biddingMode = biddingMode;
    }

    public String getQuickPointBumps() {
        return quickPointBumps;
    }

    public void setQuickPointBumps(String quickPointBumps) {
        this.quickPointBumps = quickPointBumps;
    }

    public Integer getTimerPausedRemainingSeconds() {
        return timerPausedRemainingSeconds;
    }

    public void setTimerPausedRemainingSeconds(Integer timerPausedRemainingSeconds) {
        this.timerPausedRemainingSeconds = timerPausedRemainingSeconds;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
