package com.athlon.tournamentservice.court.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "courts")
public class Court {

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "courtid", updatable = false, nullable = false)
    private Long courtId;

    @Column(name = "courtuuid", updatable = false, nullable = false, unique = true)
    private UUID courtUuid;

    @Column(name = "venueid", nullable = false)
    private Long venueId;

    @Column(name = "venueuuid", nullable = false)
    private UUID venueUuid;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "sporttype")
    private String sportType;

    @Column(name = "isactive", nullable = false)
    private boolean isActive = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "updated_by")
    private Long updatedBy;

    public Court() {
    }

    public Court(
            Long venueId,
            UUID venueUuid,
            String name,
            String sportType,
            Long createdBy) {

        this.venueId = venueId;
        this.venueUuid = venueUuid;
        this.name = name;
        this.sportType = sportType;
        this.createdBy = createdBy;
        this.isActive = true;
    }

    @PrePersist
    protected void onCreate() {

        if (this.courtUuid == null) {
            this.courtUuid = UUID.randomUUID();
        }

        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getCourtId() {
        return courtId;
    }

    public void setCourtId(Long courtId) {
        this.courtId = courtId;
    }

    public UUID getCourtUuid() {
        return courtUuid;
    }

    public void setCourtUuid(UUID courtUuid) {
        this.courtUuid = courtUuid;
    }

    public Long getVenueId() {
        return venueId;
    }

    public void setVenueId(Long venueId) {
        this.venueId = venueId;
    }

    public UUID getVenueUuid() {
        return venueUuid;
    }

    public void setVenueUuid(UUID venueUuid) {
        this.venueUuid = venueUuid;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSportType() {
        return sportType;
    }

    public void setSportType(String sportType) {
        this.sportType = sportType;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
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

    public Long getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(Long createdBy) {
        this.createdBy = createdBy;
    }

    public Long getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(Long updatedBy) {
        this.updatedBy = updatedBy;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }

        if (o == null || getClass() != o.getClass()) {
            return false;
        }

        Court court = (Court) o;

        return Objects.equals(courtId, court.courtId)
                && Objects.equals(courtUuid, court.courtUuid);
    }

    @Override
    public int hashCode() {
        return Objects.hash(courtId, courtUuid);
    }

    @Override
    public String toString() {
        return "Court{" +
                "courtId=" + courtId +
                ", courtUuid=" + courtUuid +
                ", venueId=" + venueId +
                ", venueUuid=" + venueUuid +
                ", name='" + name + '\'' +
                ", sportType='" + sportType + '\'' +
                ", isActive=" + isActive +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                ", createdBy=" + createdBy +
                ", updatedBy=" + updatedBy +
                '}';
    }
}
