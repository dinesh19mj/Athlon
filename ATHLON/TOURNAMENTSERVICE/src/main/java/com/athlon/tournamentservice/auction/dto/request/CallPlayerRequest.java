package com.athlon.tournamentservice.auction.dto.request;

public class CallPlayerRequest {
    private Long auctionId;
    private Long auctionPlayerId;
    private Long organizerUserId;

    public CallPlayerRequest() {}

    public Long getAuctionId() { return auctionId; }
    public void setAuctionId(Long auctionId) { this.auctionId = auctionId; }

    public Long getAuctionPlayerId() { return auctionPlayerId; }
    public void setAuctionPlayerId(Long auctionPlayerId) { this.auctionPlayerId = auctionPlayerId; }

    public Long getOrganizerUserId() { return organizerUserId; }
    public void setOrganizerUserId(Long organizerUserId) { this.organizerUserId = organizerUserId; }
}
