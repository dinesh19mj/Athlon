package com.athlon.tournamentservice.teamchampionship.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "championship_match_formats")
public class ChampionshipMatchFormat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "format_id", updatable = false, nullable = false)
    private Long formatId;

    @Column(name = "format_uuid", updatable = false, nullable = false, unique = true)
    private UUID formatUuid;

    @Column(name = "championship_id", nullable = false)
    private Long championshipId;

    @Column(name = "championship_uuid", nullable = false)
    private UUID championshipUuid;

    @Column(name = "name", nullable = false)
    private String name; // e.g. "Men's Singles", "Men's Doubles", "Mixed Doubles", "T20", "7-a-side"

    @Column(name = "sport")
    private String sport; // e.g. "Badminton", "Cricket", "Football"

    @Column(name = "players_per_side")
    private Integer playersPerSide = 2;

    @Column(name = "display_order")
    private Integer displayOrder = 0;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (this.formatUuid == null) {
            this.formatUuid = UUID.randomUUID();
        }
        if (this.isActive == null) {
            this.isActive = true;
        }
        if (this.playersPerSide == null) {
            this.playersPerSide = 2;
        }
        if (this.displayOrder == null) {
            this.displayOrder = 0;
        }
    }

    public ChampionshipMatchFormat() {}

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

    public Long getChampionshipId() {
        return championshipId;
    }

    public void setChampionshipId(Long championshipId) {
        this.championshipId = championshipId;
    }

    public UUID getChampionshipUuid() {
        return championshipUuid;
    }

    public void setChampionshipUuid(UUID championshipUuid) {
        this.championshipUuid = championshipUuid;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSport() {
        return sport;
    }

    public void setSport(String sport) {
        this.sport = sport;
    }

    public Integer getPlayersPerSide() {
        return playersPerSide;
    }

    public void setPlayersPerSide(Integer playersPerSide) {
        this.playersPerSide = playersPerSide;
    }

    public Integer getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean active) {
        isActive = active;
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
}
