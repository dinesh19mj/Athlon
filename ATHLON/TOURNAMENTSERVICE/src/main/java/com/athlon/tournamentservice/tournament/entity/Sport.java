package com.athlon.tournamentservice.tournament.entity;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "sports")
public class Sport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "sport_id", updatable = false, nullable = false)
    private Long sportId;

    @Column(name = "sport_uuid", updatable = false, nullable = false, unique = true)
    private UUID sportUuid;

    @Column(name = "sport_name", nullable = false, unique = true)
    private String sportName;

    @Column(name = "sport_code", nullable = false)
    private String sportCode;

    @Column(name = "emoji")
    private String emoji;

    @Column(name = "is_team_sport")
    private Integer isTeamSport = 0;

    @Column(name = "supports_multi_category")
    private Integer supportsMultiCategory = 0;

    @Column(name = "default_format")
    private String defaultFormat;

    @Column(name = "default_category")
    private String defaultCategory;

    @Column(name = "category_presets", columnDefinition = "TEXT")
    private String categoryPresets;

    @Column(name = "display_order")
    private Integer displayOrder = 0;

    @Column(name = "is_active")
    private Integer isActive = 1;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (this.sportUuid == null) {
            this.sportUuid = UUID.randomUUID();
        }
        if (this.isActive == null) {
            this.isActive = 1;
        }
        if (this.isTeamSport == null) {
            this.isTeamSport = 0;
        }
        if (this.supportsMultiCategory == null) {
            this.supportsMultiCategory = 0;
        }
        if (this.displayOrder == null) {
            this.displayOrder = 0;
        }
    }

    public Sport() {
    }

    public Sport(String sportName, String sportCode, String emoji, Integer isTeamSport,
                 Integer supportsMultiCategory, String defaultFormat, String defaultCategory,
                 String categoryPresets, Integer displayOrder) {
        this.sportName = sportName;
        this.sportCode = sportCode;
        this.emoji = emoji;
        this.isTeamSport = isTeamSport;
        this.supportsMultiCategory = supportsMultiCategory;
        this.defaultFormat = defaultFormat;
        this.defaultCategory = defaultCategory;
        this.categoryPresets = categoryPresets;
        this.displayOrder = displayOrder;
        this.isActive = 1;
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

    public Integer getIsActive() {
        return isActive;
    }

    public void setIsActive(Integer isActive) {
        this.isActive = isActive;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Sport)) return false;
        Sport that = (Sport) o;
        return Objects.equals(sportId, that.sportId) && Objects.equals(sportUuid, that.sportUuid);
    }

    @Override
    public int hashCode() {
        return Objects.hash(sportId, sportUuid);
    }
}
