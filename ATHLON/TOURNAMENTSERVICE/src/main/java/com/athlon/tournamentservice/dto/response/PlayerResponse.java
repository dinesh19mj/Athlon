package com.athlon.tournamentservice.dto.response;

import java.util.UUID;
import com.athlon.tournamentservice.registration.entity.RegistrationPlayer;

public class PlayerResponse {
    private Long playerId;
    private UUID playerUuid;
    private String playerName;
    private String phoneNumber;

    public PlayerResponse() {}

    public static PlayerResponse fromEntity(RegistrationPlayer player) {
        if (player == null) return null;
        PlayerResponse response = new PlayerResponse();
        response.setPlayerId(player.getPlayerId());
        response.setPlayerUuid(player.getPlayerUuid());
        response.setPlayerName(player.getPlayerName());
        response.setPhoneNumber(player.getPhoneNumber());
        return response;
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
