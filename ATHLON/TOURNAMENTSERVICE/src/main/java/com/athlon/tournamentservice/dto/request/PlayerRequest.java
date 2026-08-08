package com.athlon.tournamentservice.dto.request;

import java.util.UUID;

public class PlayerRequest {

    private Long playerId;
    private UUID playerUuid;
    private String playerName;
    private String phoneNumber;

    public PlayerRequest() {
    }

    public PlayerRequest(Long playerId, UUID playerUuid, String playerName, String phoneNumber) {
        this.playerId = playerId;
        this.playerUuid = playerUuid;
        this.playerName = playerName;
        this.phoneNumber = phoneNumber;
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

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }
}
