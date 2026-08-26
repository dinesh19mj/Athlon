package com.athlon.tournamentservice.auction.dto.response;

import com.athlon.tournamentservice.auction.entity.AuctionPlayer;
import com.athlon.tournamentservice.auction.entity.AuctionReservedPlayer;
import com.athlon.tournamentservice.auction.entity.AuctionTeam;

import java.util.List;

public class AuctionTeamSummaryDTO {
    private AuctionTeam team;
    private List<AuctionPlayer> acquiredPlayers;
    private List<AuctionReservedPlayer> reservedPlayers;

    public AuctionTeamSummaryDTO() {}

    public AuctionTeamSummaryDTO(AuctionTeam team, List<AuctionPlayer> acquiredPlayers, List<AuctionReservedPlayer> reservedPlayers) {
        this.team = team;
        this.acquiredPlayers = acquiredPlayers;
        this.reservedPlayers = reservedPlayers;
    }

    public AuctionTeam getTeam() { return team; }
    public void setTeam(AuctionTeam team) { this.team = team; }

    public List<AuctionPlayer> getAcquiredPlayers() { return acquiredPlayers; }
    public void setAcquiredPlayers(List<AuctionPlayer> acquiredPlayers) { this.acquiredPlayers = acquiredPlayers; }

    public List<AuctionReservedPlayer> getReservedPlayers() { return reservedPlayers; }
    public void setReservedPlayers(List<AuctionReservedPlayer> reservedPlayers) { this.reservedPlayers = reservedPlayers; }
}
