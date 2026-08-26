package com.athlon.tournamentservice.auction.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "auction_players")
public class AuctionPlayer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "auction_player_id", updatable = false, nullable = false)
    private Long auctionPlayerId;

    @Column(name = "auction_player_uuid", updatable = false, nullable = false, unique = true)
    private UUID auctionPlayerUuid;

    @Column(name = "auction_id", nullable = false)
    private Long auctionId;

    @Column(name = "auction_uuid", nullable = false)
    private UUID auctionUuid;

    @Column(name = "player_id", nullable = false)
    private Long playerId;

    @Column(name = "player_uuid", nullable = false)
    private UUID playerUuid;

    @Column(name = "player_name", nullable = false)
    private String playerName;

    @Column(name = "category_id")
    private Long categoryId;

    @Column(name = "category_name")
    private String categoryName;

    @Column(name = "eligible_formats")
    private String eligibleFormats;

    @Column(name = "base_price", nullable = false)
    private Double basePrice = 1000.0;

    @Column(name = "state", nullable = false)
    private String state = "WAITING"; // "WAITING", "CALLED", "BIDDING", "SOLD", "UNSOLD", "ASSIGNED"

    @Column(name = "final_bid")
    private Double finalBid = 0.0;

    @Column(name = "winning_team_id")
    private Long winningTeamId;

    @Column(name = "winning_team_name")
    private String winningTeamName;

    @Column(name = "call_order")
    private Integer callOrder = 0;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (this.auctionPlayerUuid == null) {
            this.auctionPlayerUuid = UUID.randomUUID();
        }
        if (this.state == null) this.state = "WAITING";
        if (this.basePrice == null) this.basePrice = 1000.0;
        if (this.finalBid == null) this.finalBid = 0.0;
        if (this.callOrder == null) this.callOrder = 0;
    }

    public AuctionPlayer() {}

    public Long getAuctionPlayerId() {
        return auctionPlayerId;
    }

    public void setAuctionPlayerId(Long auctionPlayerId) {
        this.auctionPlayerId = auctionPlayerId;
    }

    public UUID getAuctionPlayerUuid() {
        return auctionPlayerUuid;
    }

    public void setAuctionPlayerUuid(UUID auctionPlayerUuid) {
        this.auctionPlayerUuid = auctionPlayerUuid;
    }

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

    public Long getPlayerId() {
        return playerId;
    }

    public void setPlayerId(Long playerId) {
        this.playerId = playerId;
    }

    public UUID getPlayerUuid() {
        return playerUuid;
    }

    public void setPlayerUuid(UUID playerUuid) {
        this.playerUuid = playerUuid;
    }

    public String getPlayerName() {
        return playerName;
    }

    public void setPlayerName(String playerName) {
        this.playerName = playerName;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public String getEligibleFormats() {
        return eligibleFormats;
    }

    public void setEligibleFormats(String eligibleFormats) {
        this.eligibleFormats = eligibleFormats;
    }

    public Double getBasePrice() {
        return basePrice;
    }

    public void setBasePrice(Double basePrice) {
        this.basePrice = basePrice;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public Double getFinalBid() {
        return finalBid;
    }

    public void setFinalBid(Double finalBid) {
        this.finalBid = finalBid;
    }

    public Long getWinningTeamId() {
        return winningTeamId;
    }

    public void setWinningTeamId(Long winningTeamId) {
        this.winningTeamId = winningTeamId;
    }

    public String getWinningTeamName() {
        return winningTeamName;
    }

    public void setWinningTeamName(String winningTeamName) {
        this.winningTeamName = winningTeamName;
    }

    public Integer getCallOrder() {
        return callOrder;
    }

    public void setCallOrder(Integer callOrder) {
        this.callOrder = callOrder;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
