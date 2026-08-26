package com.athlon.tournamentservice.teamchampionship.dto.request;

public class LineupEntryDTO {
    private Long eventId;
    private String eventName;
    private Long playerId;
    private String playerName;
    private Integer playerPosition; // 1 or 2
    private Boolean isSubstitute;

    public LineupEntryDTO() {}

    public Long getEventId() { return eventId; }
    public void setEventId(Long eventId) { this.eventId = eventId; }

    public String getEventName() { return eventName; }
    public void setEventName(String eventName) { this.eventName = eventName; }

    public Long getPlayerId() { return playerId; }
    public void setPlayerId(Long playerId) { this.playerId = playerId; }

    public String getPlayerName() { return playerName; }
    public void setPlayerName(String playerName) { this.playerName = playerName; }

    public Integer getPlayerPosition() { return playerPosition; }
    public void setPlayerPosition(Integer playerPosition) { this.playerPosition = playerPosition; }

    public Boolean getIsSubstitute() { return isSubstitute; }
    public void setIsSubstitute(Boolean substitute) { isSubstitute = substitute; }
}
