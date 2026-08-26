package com.athlon.tournamentservice.teamchampionship.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "championship_squad_players")
public class ChampionshipSquad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "squad_id", updatable = false, nullable = false)
    private Long squadId;

    @Column(name = "squad_uuid", updatable = false, nullable = false, unique = true)
    private UUID squadUuid;

    @Column(name = "championship_id", nullable = false)
    private Long championshipId;

    @Column(name = "championship_uuid", nullable = false)
    private UUID championshipUuid;

    @Column(name = "team_id", nullable = false)
    private Long teamId;

    @Column(name = "team_uuid", nullable = false)
    private UUID teamUuid;

    @Column(name = "player_id", nullable = false)
    private Long playerId;

    @Column(name = "player_uuid", nullable = false)
    private UUID playerUuid;

    @Column(name = "player_name", nullable = false)
    private String playerName;

    @Column(name = "category_id")
    private Long categoryId;

    @Column(name = "category_name")
    private String categoryName;

    @Column(name = "eligible_formats")
    private String eligibleFormats;

    @Column(name = "acquisition_type")
    private String acquisitionType = "AUCTION"; // "AUCTION", "RESERVED", "DIRECT"

    @Column(name = "purchase_price")
    private Double purchasePrice = 0.0;

    @Column(name = "matches_played_count")
    private Integer matchesPlayedCount = 0;

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
        if (this.squadUuid == null) {
            this.squadUuid = UUID.randomUUID();
        }
        if (this.acquisitionType == null) this.acquisitionType = "AUCTION";
        if (this.purchasePrice == null) this.purchasePrice = 0.0;
        if (this.matchesPlayedCount == null) this.matchesPlayedCount = 0;
        if (this.isActive == null) this.isActive = true;
    }

    public ChampionshipSquad() {}

    public Long getSquadId() {
        return squadId;
    }

    public void setSquadId(Long squadId) {
        this.squadId = squadId;
    }

    public UUID getSquadUuid() {
        return squadUuid;
    }

    public void setSquadUuid(UUID squadUuid) {
        this.squadUuid = squadUuid;
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

    public Long getTeamId() {
        return teamId;
    }

    public void setTeamId(Long teamId) {
        this.teamId = teamId;
    }

    public UUID getTeamUuid() {
        return teamUuid;
    }

    public void setTeamUuid(UUID teamUuid) {
        this.teamUuid = teamUuid;
    }

    public Long getPlayerId() {
        return playerId;
    }

    public void setPlayerId(Long playerId) {
        this.playerId = playerId;
    }

    public UUID getPlayerUuid() {
        return playerUuid;
    }

    public void setPlayerUuid(UUID playerUuid) {
        this.playerUuid = playerUuid;
    }

    public String getPlayerName() {
        return playerName;
    }

    public void setPlayerName(String playerName) {
        this.playerName = playerName;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public String getEligibleFormats() {
        return eligibleFormats;
    }

    public void setEligibleFormats(String eligibleFormats) {
        this.eligibleFormats = eligibleFormats;
    }

    public String getAcquisitionType() {
        return acquisitionType;
    }

    public void setAcquisitionType(String acquisitionType) {
        this.acquisitionType = acquisitionType;
    }

    public Double getPurchasePrice() {
        return purchasePrice;
    }

    public void setPurchasePrice(Double purchasePrice) {
        this.purchasePrice = purchasePrice;
    }

    public Integer getMatchesPlayedCount() {
        return matchesPlayedCount;
    }

    public void setMatchesPlayedCount(Integer matchesPlayedCount) {
        this.matchesPlayedCount = matchesPlayedCount;
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
