package com.athlon.tournamentservice.auction.dto.request;

public class AssignPlayerRequest {
    private Long auctionId;
    private Long auctionPlayerId;
    private Long winningTeamId;
    private Double finalBidAmount;
    private Long organizerUserId;

    public AssignPlayerRequest() {}

    public Long getAuctionId() { return auctionId; }
    public void setAuctionId(Long auctionId) { this.auctionId = auctionId; }

    public Long getAuctionPlayerId() { return auctionPlayerId; }
    public void setAuctionPlayerId(Long auctionPlayerId) { this.auctionPlayerId = auctionPlayerId; }

    public Long getWinningTeamId() { return winningTeamId; }
    public void setWinningTeamId(Long winningTeamId) { this.winningTeamId = winningTeamId; }

    public Double getFinalBidAmount() { return finalBidAmount; }
    public void setFinalBidAmount(Double finalBidAmount) { this.finalBidAmount = finalBidAmount; }

    public Long getOrganizerUserId() { return organizerUserId; }
    public void setOrganizerUserId(Long organizerUserId) { this.organizerUserId = organizerUserId; }
}
