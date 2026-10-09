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

    @com.fasterxml.jackson.annotation.JsonSetter("isTeamSport")
    public void setIsTeamSportFlexible(Object value) {
        if (value instanceof Boolean) {
            this.isTeamSport = ((Boolean) value) ? 1 : 0;
        } else if (value instanceof Number) {
            this.isTeamSport = ((Number) value).intValue();
        } else if (value != null) {
            this.isTeamSport = "true".equalsIgnoreCase(value.toString()) || "1".equals(value.toString()) ? 1 : 0;
        }
    }

    public Integer getSupportsMultiCategory() {
        return supportsMultiCategory;
    }

    public void setSupportsMultiCategory(Integer supportsMultiCategory) {
        this.supportsMultiCategory = supportsMultiCategory;
    }

    @com.fasterxml.jackson.annotation.JsonSetter("supportsMultiCategory")
    public void setSupportsMultiCategoryFlexible(Object value) {
        if (value instanceof Boolean) {
            this.supportsMultiCategory = ((Boolean) value) ? 1 : 0;
        } else if (value instanceof Number) {
            this.supportsMultiCategory = ((Number) value).intValue();
        } else if (value != null) {
            this.supportsMultiCategory = "true".equalsIgnoreCase(value.toString()) || "1".equals(value.toString()) ? 1 : 0;
        }
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

    @com.fasterxml.jackson.annotation.JsonSetter("categoryPresets")
    public void setCategoryPresetsFlexible(Object value) {
        if (value == null) {
            this.categoryPresets = null;
        } else if (value instanceof java.util.List) {
            this.categoryPresets = ((java.util.List<?>) value).stream()
                    .map(Object::toString)
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .collect(java.util.stream.Collectors.joining(", "));
        } else {
            this.categoryPresets = value.toString();
        }
    }

    private java.util.List<String> formats;

    public java.util.List<String> getFormats() {
        return formats;
    }

    public void setFormats(java.util.List<String> formats) {
        this.formats = formats;
    }

    public Integer getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }
}
