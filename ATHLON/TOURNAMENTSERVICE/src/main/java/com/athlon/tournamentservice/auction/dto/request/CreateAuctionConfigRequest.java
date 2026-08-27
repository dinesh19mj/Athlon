package com.athlon.tournamentservice.auction.dto.request;

import java.util.List;

public class CreateAuctionConfigRequest {
    private Long championshipId;
    private String championshipUuid;
    private String auctionMode; // "FULL_AUCTION", "PARTIAL_AUCTION", "NO_AUCTION"
    private String currencyType; // "POINTS", "REAL_MONEY"
    private String currencySymbolOrLabel; // "pts", "₹", "$"
    private String basePriceStrategy; // "CATEGORY_BASED", "FIXED_GLOBAL", "CUSTOM"
    private Double defaultBasePrice;
    private Double bidIncrement;
    private Double teamBudget;
    private Integer reservedPlayersPerTeam;
    private Integer timerSeconds;
    private Integer antiSnipingSeconds;
    private String biddingMode; // "MANUAL", "AUTOMATIC"
    private String quickPointBumps; // "100,250,500,1000,2000"
    private List<CategoryPriceItem> categoryPrices;

    public CreateAuctionConfigRequest() {}

    public String getBiddingMode() { return biddingMode; }
    public void setBiddingMode(String biddingMode) { this.biddingMode = biddingMode; }

    public String getQuickPointBumps() { return quickPointBumps; }
    public void setQuickPointBumps(String quickPointBumps) { this.quickPointBumps = quickPointBumps; }

    public Long getChampionshipId() { return championshipId; }
    public void setChampionshipId(Long championshipId) { this.championshipId = championshipId; }

    public String getChampionshipUuid() { return championshipUuid; }
    public void setChampionshipUuid(String championshipUuid) { this.championshipUuid = championshipUuid; }

    public String getAuctionMode() { return auctionMode; }
    public void setAuctionMode(String auctionMode) { this.auctionMode = auctionMode; }

    public String getCurrencyType() { return currencyType; }
    public void setCurrencyType(String currencyType) { this.currencyType = currencyType; }

    public String getCurrencySymbolOrLabel() { return currencySymbolOrLabel; }
    public void setCurrencySymbolOrLabel(String currencySymbolOrLabel) { this.currencySymbolOrLabel = currencySymbolOrLabel; }

    public String getBasePriceStrategy() { return basePriceStrategy; }
    public void setBasePriceStrategy(String basePriceStrategy) { this.basePriceStrategy = basePriceStrategy; }

    public Double getDefaultBasePrice() { return defaultBasePrice; }
    public void setDefaultBasePrice(Double defaultBasePrice) { this.defaultBasePrice = defaultBasePrice; }

    public Double getBidIncrement() { return bidIncrement; }
    public void setBidIncrement(Double bidIncrement) { this.bidIncrement = bidIncrement; }

    public Double getTeamBudget() { return teamBudget; }
    public void setTeamBudget(Double teamBudget) { this.teamBudget = teamBudget; }

    public Integer getReservedPlayersPerTeam() { return reservedPlayersPerTeam; }
    public void setReservedPlayersPerTeam(Integer reservedPlayersPerTeam) { this.reservedPlayersPerTeam = reservedPlayersPerTeam; }

    public Integer getTimerSeconds() { return timerSeconds; }
    public void setTimerSeconds(Integer timerSeconds) { this.timerSeconds = timerSeconds; }

    public Integer getAntiSnipingSeconds() { return antiSnipingSeconds; }
    public void setAntiSnipingSeconds(Integer antiSnipingSeconds) { this.antiSnipingSeconds = antiSnipingSeconds; }

    public List<CategoryPriceItem> getCategoryPrices() { return categoryPrices; }
    public void setCategoryPrices(List<CategoryPriceItem> categoryPrices) { this.categoryPrices = categoryPrices; }

    public static class CategoryPriceItem {
        private Long categoryId;
        private String categoryName;
        private Double basePrice;
        private Double minIncrement;

        public CategoryPriceItem() {}

        public Long getCategoryId() { return categoryId; }
        public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }

        public String getCategoryName() { return categoryName; }
        public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

        public Double getBasePrice() { return basePrice; }
        public void setBasePrice(Double basePrice) { this.basePrice = basePrice; }

        public Double getMinIncrement() { return minIncrement; }
        public void setMinIncrement(Double minIncrement) { this.minIncrement = minIncrement; }
    }
}
