package com.athlon.tournamentservice.dto.response;

import java.util.UUID;

import com.athlon.tournamentservice.tournament.entity.TournamentMatchFormat;

public class TournamentMatchFormatResponse {

    private Long formatId;
    private UUID formatUuid;
    private String sportType;
    private String formatName;
    private Integer playersPerSide;
    private boolean isTeamFormat;
    private Integer displayOrder;

    public TournamentMatchFormatResponse() {
    }

    public static TournamentMatchFormatResponse fromEntity(TournamentMatchFormat entity) {
        if (entity == null) return null;
        TournamentMatchFormatResponse res = new TournamentMatchFormatResponse();
        res.setFormatId(entity.getFormatId());
        res.setFormatUuid(entity.getFormatUuid());
        res.setSportType(entity.getSportType());
        res.setFormatName(entity.getFormatName());
        res.setPlayersPerSide(entity.getPlayersPerSide());
        res.setTeamFormat(entity.getIsTeamFormat() != null && entity.getIsTeamFormat() == 1);
        res.setDisplayOrder(entity.getDisplayOrder());
        return res;
    }

    public Long getFormatId() {
        return formatId;
    }

    public void setFormatId(Long formatId) {
        this.formatId = formatId;
    }

    public UUID getFormatUuid() {
        return formatUuid;
    }

    public void setFormatUuid(UUID formatUuid) {
        this.formatUuid = formatUuid;
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

    public boolean isTeamFormat() {
        return isTeamFormat;
    }

    public void setTeamFormat(boolean isTeamFormat) {
        this.isTeamFormat = isTeamFormat;
    }

    public Integer getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }
}
