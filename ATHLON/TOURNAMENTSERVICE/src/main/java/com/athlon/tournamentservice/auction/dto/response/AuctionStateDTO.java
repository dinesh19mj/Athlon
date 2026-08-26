package com.athlon.tournamentservice.auction.dto.response;

import com.athlon.tournamentservice.auction.entity.AuctionBid;
import com.athlon.tournamentservice.auction.entity.AuctionConfig;
import com.athlon.tournamentservice.auction.entity.AuctionPlayer;
import com.athlon.tournamentservice.auction.entity.AuctionTeam;

import java.util.List;

public class AuctionStateDTO {
    private AuctionConfig config;
    private AuctionPlayer activePlayer;
    private Double currentBid;
    private Long winningTeamId;
    private String winningTeamName;
    private Integer remainingTimerSeconds;
    private List<AuctionBid> recentBids;
    private List<AuctionTeam> teams;
    private int totalPlayersInPool;
    private int soldPlayersCount;
    private int unsoldPlayersCount;

    public AuctionStateDTO() {}

    public AuctionConfig getConfig() { return config; }
    public void setConfig(AuctionConfig config) { this.config = config; }

    public AuctionPlayer getActivePlayer() { return activePlayer; }
    public void setActivePlayer(AuctionPlayer activePlayer) { this.activePlayer = activePlayer; }

    public Double getCurrentBid() { return currentBid; }
    public void setCurrentBid(Double currentBid) { this.currentBid = currentBid; }

    public Long getWinningTeamId() { return winningTeamId; }
    public void setWinningTeamId(Long winningTeamId) { this.winningTeamId = winningTeamId; }

    public String getWinningTeamName() { return winningTeamName; }
    public void setWinningTeamName(String winningTeamName) { this.winningTeamName = winningTeamName; }

    public Integer getRemainingTimerSeconds() { return remainingTimerSeconds; }
    public void setRemainingTimerSeconds(Integer remainingTimerSeconds) { this.remainingTimerSeconds = remainingTimerSeconds; }

    public List<AuctionBid> getRecentBids() { return recentBids; }
    public void setRecentBids(List<AuctionBid> recentBids) { this.recentBids = recentBids; }

    public List<AuctionTeam> getTeams() { return teams; }
    public void setTeams(List<AuctionTeam> teams) { this.teams = teams; }

    public int getTotalPlayersInPool() { return totalPlayersInPool; }
    public void setTotalPlayersInPool(int totalPlayersInPool) { this.totalPlayersInPool = totalPlayersInPool; }

    public int getSoldPlayersCount() { return soldPlayersCount; }
    public void setSoldPlayersCount(int soldPlayersCount) { this.soldPlayersCount = soldPlayersCount; }

    public int getUnsoldPlayersCount() { return unsoldPlayersCount; }
    public void setUnsoldPlayersCount(int unsoldPlayersCount) { this.unsoldPlayersCount = unsoldPlayersCount; }
}
