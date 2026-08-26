package com.athlon.tournamentservice.court.entity;

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
import jakarta.persistence.Table;

@Entity
@Table(name = "venues")
public class Venue {

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "venueid", updatable = false, nullable = false)
    private Long venueId;

    @Column(name = "venueuuid", updatable = false, nullable = false, unique = true)
    private UUID venueUuid;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "address", columnDefinition = "TEXT")
    private String address;

    @Column(name = "cityid")
    private Long cityId;

    @Column(name = "cityuuid")
    private UUID cityUuid;

    @Column(name = "isactive")
    private Integer isActive = 1;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "updated_by")
    private Long updatedBy;

    public Venue() {
    }

    public Venue(
            String name,
            String address,
            Long cityId,
            UUID cityUuid,
            Long createdBy) {

        this.name = name;
        this.address = address;
        this.cityId = cityId;
        this.cityUuid = cityUuid;
        this.createdBy = createdBy;
        this.isActive = 1;
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

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public Long getCityId() {
        return cityId;
    }

    public void setCityId(Long cityId) {
        this.cityId = cityId;
    }

    public UUID getCityUuid() {
        return cityUuid;
    }

    public void setCityUuid(UUID cityUuid) {
        this.cityUuid = cityUuid;
    }

    public Integer getIsActive() {
        return isActive;
    }

    public void setIsActive(Integer isActive) {
        this.isActive = isActive;
    }

    public boolean isActive() {
        return isActive != null && isActive == 1;
    }

    public void setActive(boolean active) {
        this.isActive = active ? 1 : 0;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
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

        Venue venue = (Venue) o;

        return Objects.equals(venueId, venue.venueId)
                && Objects.equals(venueUuid, venue.venueUuid);
    }

    @Override
    public int hashCode() {
        return Objects.hash(venueId, venueUuid);
    }

    @Override
    public String toString() {
        return "Venue{" +
                "venueId=" + venueId +
                ", venueUuid=" + venueUuid +
                ", name='" + name + '\'' +
                ", address='" + address + '\'' +
                ", cityId=" + cityId +
                ", cityUuid=" + cityUuid +
                ", isActive=" + isActive +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                ", createdBy=" + createdBy +
                ", updatedBy=" + updatedBy +
                '}';
    }
}

