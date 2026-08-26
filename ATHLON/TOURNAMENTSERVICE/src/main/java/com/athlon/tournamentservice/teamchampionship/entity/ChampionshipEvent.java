package com.athlon.tournamentservice.teamchampionship.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "championship_events")
public class ChampionshipEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "event_id", updatable = false, nullable = false)
    private Long eventId;

    @Column(name = "event_uuid", updatable = false, nullable = false, unique = true)
    private UUID eventUuid;

    @Column(name = "championship_id", nullable = false)
    private Long championshipId;

    @Column(name = "championship_uuid", nullable = false)
    private UUID championshipUuid;

    @Column(name = "category_id", nullable = false)
    private Long categoryId;

    @Column(name = "category_name", nullable = false)
    private String categoryName; // e.g. "C Level"

    @Column(name = "format_id", nullable = false)
    private Long formatId;

    @Column(name = "format_name", nullable = false)
    private String formatName; // e.g. "Men's Doubles"

    @Column(name = "event_name", nullable = false)
    private String eventName; // e.g. "C Level Men's Doubles"

    @Column(name = "points_weight")
    private Integer pointsWeight = 1;

    @Column(name = "display_order")
    private Integer displayOrder = 0;

    @Column(name = "is_mandatory")
    private Boolean isMandatory = true;

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
        if (this.eventUuid == null) {
            this.eventUuid = UUID.randomUUID();
        }
        if (this.pointsWeight == null) {
            this.pointsWeight = 1;
        }
        if (this.displayOrder == null) {
            this.displayOrder = 0;
        }
        if (this.isMandatory == null) {
            this.isMandatory = true;
        }
        if (this.isActive == null) {
            this.isActive = true;
        }
        if (this.eventName == null && this.categoryName != null && this.formatName != null) {
            this.eventName = this.categoryName + " " + this.formatName;
        }
    }

    public ChampionshipEvent() {}

    public Long getEventId() {
        return eventId;
    }

    public void setEventId(Long eventId) {
        this.eventId = eventId;
    }

    public UUID getEventUuid() {
        return eventUuid;
    }

    public void setEventUuid(UUID eventUuid) {
        this.eventUuid = eventUuid;
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

    public Long getFormatId() {
        return formatId;
    }

    public void setFormatId(Long formatId) {
        this.formatId = formatId;
    }

    public String getFormatName() {
        return formatName;
    }

    public void setFormatName(String formatName) {
        this.formatName = formatName;
    }

    public String getEventName() {
        return eventName;
    }

    public void setEventName(String eventName) {
        this.eventName = eventName;
    }

    public Integer getPointsWeight() {
        return pointsWeight;
    }

    public void setPointsWeight(Integer pointsWeight) {
        this.pointsWeight = pointsWeight;
    }

    public Integer getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }

    public Boolean getIsMandatory() {
        return isMandatory;
    }

    public void setIsMandatory(Boolean mandatory) {
        isMandatory = mandatory;
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
