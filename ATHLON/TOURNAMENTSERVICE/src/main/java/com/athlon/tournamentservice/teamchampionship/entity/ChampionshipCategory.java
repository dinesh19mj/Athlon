package com.athlon.tournamentservice.teamchampionship.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "championship_categories")
public class ChampionshipCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "category_id", updatable = false, nullable = false)
    private Long categoryId;

    @Column(name = "category_uuid", updatable = false, nullable = false, unique = true)
    private UUID categoryUuid;

    @Column(name = "championship_id", nullable = false)
    private Long championshipId;

    @Column(name = "championship_uuid", nullable = false)
    private UUID championshipUuid;

    @Column(name = "name", nullable = false)
    private String name; // e.g. "C Level", "Open", "Beginner", "70+", "80+", "Under 18"

    @Column(name = "code")
    private String code;

    @Column(name = "description")
    private String description;

    @Column(name = "display_order")
    private Integer displayOrder = 0;

    @Column(name = "max_players")
    private Integer maxPlayers;

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
        if (this.categoryUuid == null) {
            this.categoryUuid = UUID.randomUUID();
        }
        if (this.isActive == null) {
            this.isActive = true;
        }
        if (this.displayOrder == null) {
            this.displayOrder = 0;
        }
    }

    public ChampionshipCategory() {}

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public UUID getCategoryUuid() {
        return categoryUuid;
    }

    public void setCategoryUuid(UUID categoryUuid) {
        this.categoryUuid = categoryUuid;
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

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }

    public Integer getMaxPlayers() {
        return maxPlayers;
    }

    public void setMaxPlayers(Integer maxPlayers) {
        this.maxPlayers = maxPlayers;
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
