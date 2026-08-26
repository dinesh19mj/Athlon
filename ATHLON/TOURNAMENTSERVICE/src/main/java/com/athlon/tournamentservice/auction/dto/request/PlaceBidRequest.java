package com.athlon.tournamentservice.auction.dto.request;

public class PlaceBidRequest {
    private Long auctionId;
    private Long auctionPlayerId;
    private Long teamId;
    private Double bidAmount;
    private Long userId;

    public PlaceBidRequest() {}

    public Long getAuctionId() { return auctionId; }
    public void setAuctionId(Long auctionId) { this.auctionId = auctionId; }

    public Long getAuctionPlayerId() { return auctionPlayerId; }
    public void setAuctionPlayerId(Long auctionPlayerId) { this.auctionPlayerId = auctionPlayerId; }

    public Long getTeamId() { return teamId; }
    public void setTeamId(Long teamId) { this.teamId = teamId; }

    public Double getBidAmount() { return bidAmount; }
    public void setBidAmount(Double bidAmount) { this.bidAmount = bidAmount; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
}
