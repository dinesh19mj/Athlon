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
@Table(name = "tournament_match_format")
public class TournamentMatchFormat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "format_id", updatable = false, nullable = false)
    private Long formatId;

    @Column(name = "format_uuid", updatable = false, nullable = false, unique = true)
    private UUID formatUuid;

    @Column(name = "sport_type", nullable = false)
    private String sportType;

    @Column(name = "format_name", nullable = false)
    private String formatName;

    @Column(name = "players_per_side")
    private Integer playersPerSide = 1;

    @Column(name = "is_team_format")
    private Integer isTeamFormat = 0;

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

    public TournamentMatchFormat() {
    }

    public TournamentMatchFormat(String sportType, String formatName, Integer playersPerSide,
                                 Integer isTeamFormat, Integer displayOrder) {
        this.sportType = sportType;
        this.formatName = formatName;
        this.playersPerSide = playersPerSide != null ? playersPerSide : 1;
        this.isTeamFormat = isTeamFormat != null ? isTeamFormat : 0;
        this.displayOrder = displayOrder != null ? displayOrder : 0;
        this.isActive = 1;
    }

    @PrePersist
    public void prePersist() {
        if (formatUuid == null) {
            formatUuid = UUID.randomUUID();
        }
        if (isActive == null) {
            isActive = 1;
        }
        if (isTeamFormat == null) {
            isTeamFormat = 0;
        }
        if (playersPerSide == null) {
            playersPerSide = 1;
        }
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

    public Integer getIsActive() {
        return isActive;
    }

    public void setIsActive(Integer isActive) {
        this.isActive = isActive;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof TournamentMatchFormat)) return false;
        TournamentMatchFormat that = (TournamentMatchFormat) o;
        return Objects.equals(formatId, that.formatId) && Objects.equals(formatUuid, that.formatUuid);
    }

    @Override
    public int hashCode() {
        return Objects.hash(formatId, formatUuid);
    }
}
