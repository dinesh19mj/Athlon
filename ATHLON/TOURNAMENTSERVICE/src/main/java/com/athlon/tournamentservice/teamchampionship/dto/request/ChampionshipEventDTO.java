package com.athlon.tournamentservice.teamchampionship.dto.request;

public class ChampionshipEventDTO {
    private Long eventId;
    private String eventUuid;
    private Long categoryId;
    private String categoryName;
    private Long formatId;
    private String formatName;
    private String eventName;
    private Integer pointsWeight;
    private Integer displayOrder;
    private Boolean isMandatory;
    private Boolean isActive;

    public ChampionshipEventDTO() {}

    public Long getEventId() { return eventId; }
    public void setEventId(Long eventId) { this.eventId = eventId; }

    public String getEventUuid() { return eventUuid; }
    public void setEventUuid(String eventUuid) { this.eventUuid = eventUuid; }

    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public Long getFormatId() { return formatId; }
    public void setFormatId(Long formatId) { this.formatId = formatId; }

    public String getFormatName() { return formatName; }
    public void setFormatName(String formatName) { this.formatName = formatName; }

    public String getEventName() { return eventName; }
    public void setEventName(String eventName) { this.eventName = eventName; }

    public Integer getPointsWeight() { return pointsWeight; }
    public void setPointsWeight(Integer pointsWeight) { this.pointsWeight = pointsWeight; }

    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }

    public Boolean getIsMandatory() { return isMandatory; }
    public void setIsMandatory(Boolean mandatory) { isMandatory = mandatory; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean active) { isActive = active; }
}
