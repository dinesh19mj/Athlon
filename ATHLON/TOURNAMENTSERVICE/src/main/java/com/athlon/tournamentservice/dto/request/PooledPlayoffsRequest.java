package com.athlon.tournamentservice.dto.request;

import java.util.List;

public class PooledPlayoffsRequest {
    private String categoryName;
    private Long categoryId;
    private String pairingMode; // "STANDARD_CROSS", "CUSTOM_MANUAL", "RANDOM_LOTTERY"
    private List<CustomPlayoffMatchDTO> customPairings;

    public static class CustomPlayoffMatchDTO {
        private int matchOrder;
        private Long player1PoolId;
        private Integer player1PoolRank;
        private Long player1RegistrationId;

        private Long player2PoolId;
        private Integer player2PoolRank;
        private Long player2RegistrationId;

        public int getMatchOrder() { return matchOrder; }
        public void setMatchOrder(int matchOrder) { this.matchOrder = matchOrder; }

        public Long getPlayer1PoolId() { return player1PoolId; }
        public void setPlayer1PoolId(Long player1PoolId) { this.player1PoolId = player1PoolId; }
        public Integer getPlayer1PoolRank() { return player1PoolRank; }
        public void setPlayer1PoolRank(Integer player1PoolRank) { this.player1PoolRank = player1PoolRank; }
        public Long getPlayer1RegistrationId() { return player1RegistrationId; }
        public void setPlayer1RegistrationId(Long player1RegistrationId) { this.player1RegistrationId = player1RegistrationId; }

        public Long getPlayer2PoolId() { return player2PoolId; }
        public void setPlayer2PoolId(Long player2PoolId) { this.player2PoolId = player2PoolId; }
        public Integer getPlayer2PoolRank() { return player2PoolRank; }
        public void setPlayer2PoolRank(Integer player2PoolRank) { this.player2PoolRank = player2PoolRank; }
        public Long getPlayer2RegistrationId() { return player2RegistrationId; }
        public void setPlayer2RegistrationId(Long player2RegistrationId) { this.player2RegistrationId = player2RegistrationId; }
    }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public String getPairingMode() { return pairingMode; }
    public void setPairingMode(String pairingMode) { this.pairingMode = pairingMode; }
    public List<CustomPlayoffMatchDTO> getCustomPairings() { return customPairings; }
    public void setCustomPairings(List<CustomPlayoffMatchDTO> customPairings) { this.customPairings = customPairings; }
}
