package com.athlon.tournamentservice.teamchampionship.dto.request;

public class ChampionshipCategoryDTO {
    private Long categoryId;
    private String categoryUuid;
    private String name;
    private String code;
    private String description;
    private Integer displayOrder;
    private Boolean isActive;
    private Double basePrice; // For category-based auction base price
    private Double registrationFee; // For per-category player fee
    private Integer maxPlayers; // Total number of players needed for this category

    public ChampionshipCategoryDTO() {}

    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }

    public String getCategoryUuid() { return categoryUuid; }
    public void setCategoryUuid(String categoryUuid) { this.categoryUuid = categoryUuid; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean active) { isActive = active; }

    public Double getBasePrice() { return basePrice; }
    public void setBasePrice(Double basePrice) { this.basePrice = basePrice; }

    public Double getRegistrationFee() { return registrationFee; }
    public void setRegistrationFee(Double registrationFee) { this.registrationFee = registrationFee; }

    public Integer getMaxPlayers() { return maxPlayers; }
    public void setMaxPlayers(Integer maxPlayers) { this.maxPlayers = maxPlayers; }
}
