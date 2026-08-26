package com.athlon.tournamentservice.auction.dto.request;

public class SelectReservedPlayerRequest {
    private Long championshipId;
    private Long teamId;
    private Long playerId;
    private String playerName;
    private Long categoryId;
    private String categoryName;

    public SelectReservedPlayerRequest() {}

    public Long getChampionshipId() { return championshipId; }
    public void setChampionshipId(Long championshipId) { this.championshipId = championshipId; }

    public Long getTeamId() { return teamId; }
    public void setTeamId(Long teamId) { this.teamId = teamId; }

    public Long getPlayerId() { return playerId; }
    public void setPlayerId(Long playerId) { this.playerId = playerId; }

    public String getPlayerName() { return playerName; }
    public void setPlayerName(String playerName) { this.playerName = playerName; }

    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
}
