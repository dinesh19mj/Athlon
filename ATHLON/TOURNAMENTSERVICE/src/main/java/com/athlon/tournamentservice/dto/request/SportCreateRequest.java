package com.athlon.tournamentservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class SportCreateRequest {

    @NotBlank(message = "Sport name is required")
    @Size(max = 100, message = "Sport name cannot exceed 100 characters")
    private String sportName;

    @Size(max = 50, message = "Sport code cannot exceed 50 characters")
    private String sportCode;

    private String emoji;

    private Integer isTeamSport = 0;

    private Integer supportsMultiCategory = 0;

    private String defaultFormat;

    private String defaultCategory;

    private String categoryPresets;

    private Integer displayOrder = 0;

    public SportCreateRequest() {
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

    public Integer getIsTeamSport() {
        return isTeamSport;
    }

    public void setIsTeamSport(Integer isTeamSport) {
        this.isTeamSport = isTeamSport;
    }

    public Integer getSupportsMultiCategory() {
        return supportsMultiCategory;
    }

    public void setSupportsMultiCategory(Integer supportsMultiCategory) {
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

    public String getCategoryPresets() {
        return categoryPresets;
    }

    public void setCategoryPresets(String categoryPresets) {
        this.categoryPresets = categoryPresets;
    }

    public Integer getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }
}
