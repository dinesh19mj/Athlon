package com.athlon.tournamentservice.teamchampionship.dto.request;

public class ChampionshipMatchFormatDTO {
    private Long formatId;
    private String formatUuid;
    private String name;
    private String sport;
    private Integer playersPerSide;
    private Integer displayOrder;
    private Boolean isActive;

    public ChampionshipMatchFormatDTO() {}

    public Long getFormatId() { return formatId; }
    public void setFormatId(Long formatId) { this.formatId = formatId; }

    public String getFormatUuid() { return formatUuid; }
    public void setFormatUuid(String formatUuid) { this.formatUuid = formatUuid; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSport() { return sport; }
    public void setSport(String sport) { this.sport = sport; }

    public Integer getPlayersPerSide() { return playersPerSide; }
    public void setPlayersPerSide(Integer playersPerSide) { this.playersPerSide = playersPerSide; }

    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean active) { isActive = active; }
}
