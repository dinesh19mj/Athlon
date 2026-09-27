package com.athlon.tournamentservice.dto.response;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import com.athlon.tournamentservice.tournament.entity.Sport;

public class SportResponse {

    private Long sportId;
    private UUID sportUuid;
    private String sportName;
    private String sportCode;
    private String emoji;
    private boolean isTeamSport;
    private boolean supportsMultiCategory;
    private String defaultFormat;
    private String defaultCategory;
    private List<String> categoryPresets = new ArrayList<>();
    private List<TournamentMatchFormatResponse> formats = new ArrayList<>();
    private Integer displayOrder;

    public SportResponse() {
    }

    public static SportResponse fromEntity(Sport entity) {
        if (entity == null) return null;
        SportResponse res = new SportResponse();
        res.setSportId(entity.getSportId());
        res.setSportUuid(entity.getSportUuid());
        res.setSportName(entity.getSportName());
        res.setSportCode(entity.getSportCode());
        res.setEmoji(entity.getEmoji());
        res.setTeamSport(entity.getIsTeamSport() != null && entity.getIsTeamSport() == 1);
        res.setSupportsMultiCategory(entity.getSupportsMultiCategory() != null && entity.getSupportsMultiCategory() == 1);
        res.setDefaultFormat(entity.getDefaultFormat());
        res.setDefaultCategory(entity.getDefaultCategory());
        res.setDisplayOrder(entity.getDisplayOrder());

        if (entity.getCategoryPresets() != null && !entity.getCategoryPresets().isBlank()) {
            res.setCategoryPresets(Arrays.stream(entity.getCategoryPresets().split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toList()));
        }

        return res;
    }

    public Long getSportId() {
        return sportId;
    }

    public void setSportId(Long sportId) {
        this.sportId = sportId;
    }

    public UUID getSportUuid() {
        return sportUuid;
    }

    public void setSportUuid(UUID sportUuid) {
        this.sportUuid = sportUuid;
    }

    public String getSportName() {
        return sportName;
    }

    public void setSportName(String sportName) {
        this.sportName = sportName;
    }

    public String getSportCode() {
        return sportCode;
    }

    public void setSportCode(String sportCode) {
        this.sportCode = sportCode;
    }

    public String getEmoji() {
        return emoji;
    }

    public void setEmoji(String emoji) {
        this.emoji = emoji;
    }

    public boolean isTeamSport() {
        return isTeamSport;
    }

    public void setTeamSport(boolean isTeamSport) {
        this.isTeamSport = isTeamSport;
    }

    public boolean isSupportsMultiCategory() {
        return supportsMultiCategory;
    }

    public void setSupportsMultiCategory(boolean supportsMultiCategory) {
        this.supportsMultiCategory = supportsMultiCategory;
    }

    public String getDefaultFormat() {
        return defaultFormat;
    }

    public void setDefaultFormat(String defaultFormat) {
        this.defaultFormat = defaultFormat;
    }

    public String getDefaultCategory() {
        return defaultCategory;
    }

    public void setDefaultCategory(String defaultCategory) {
        this.defaultCategory = defaultCategory;
    }

    public List<String> getCategoryPresets() {
        return categoryPresets;
    }

    public void setCategoryPresets(List<String> categoryPresets) {
        this.categoryPresets = categoryPresets;
    }

    public List<TournamentMatchFormatResponse> getFormats() {
        return formats;
    }

    public void setFormats(List<TournamentMatchFormatResponse> formats) {
        this.formats = formats;
    }

    public Integer getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }
}
