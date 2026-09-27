package com.athlon.tournamentservice.dto.request;

import jakarta.validation.constraints.NotBlank;

public class TournamentMatchFormatCreateRequest {

    @NotBlank(message = "Sport type is required")
    private String sportType;

    @NotBlank(message = "Format name is required")
    private String formatName;

    private Integer playersPerSide = 1;
    private Integer isTeamFormat = 0;
    private Integer displayOrder = 0;

    public TournamentMatchFormatCreateRequest() {
    }

    public String getSportType() {
        return sportType;
    }

    public void setSportType(String sportType) {
        this.sportType = sportType;
    }

    public String getFormatName() {
        return formatName;
    }

    public void setFormatName(String formatName) {
        this.formatName = formatName;
    }

    public Integer getPlayersPerSide() {
        return playersPerSide;
    }

    public void setPlayersPerSide(Integer playersPerSide) {
        this.playersPerSide = playersPerSide;
    }

    public Integer getIsTeamFormat() {
        return isTeamFormat;
    }

    public void setIsTeamFormat(Integer isTeamFormat) {
        this.isTeamFormat = isTeamFormat;
    }

    public Integer getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }
}
