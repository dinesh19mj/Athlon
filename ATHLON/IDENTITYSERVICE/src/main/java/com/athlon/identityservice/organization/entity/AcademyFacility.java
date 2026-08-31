package com.athlon.identityservice.organization.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "academy_facilities")
public class AcademyFacility {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "facility_id", updatable = false, nullable = false)
    private Long facilityId;

    @Column(name = "facility_uuid", updatable = false, nullable = false, unique = true)
    private UUID facilityUuid;

    @Column(name = "organization_id")
    private Long organizationId;

    @Column(name = "organization_uuid", nullable = false)
    private UUID organizationUuid;

    @Column(name = "centre_uuid")
    private UUID centreUuid;

    @Column(name = "centre_name", length = 150)
    private String centreName;

    @Column(name = "name", nullable = false, length = 150)
    private String name; // e.g. "Badminton Court 1", "Cricket Net A", "Football Turf Pro"

    @Column(name = "sport_type", length = 50)
    private String sportType; // BADMINTON, CRICKET, FOOTBALL, TENNIS, VOLLEYBALL, OTHER

    @Column(name = "facility_type", length = 50)
    private String facilityType; // BADMINTON_COURT, CRICKET_NET, FOOTBALL_TURF, TENNIS_COURT, GROUND, OTHER

    @Column(name = "surface_type", length = 100)
    private String surfaceType; // Synthetic BWF Mat, Wooden Flooring, AstroTurf, Clay, Hard Court

    @Column(name = "facility_number", length = 30)
    private String facilityNumber; // Court 1, Net A

    @Column(name = "location_details", length = 255)
    private String locationDetails; // Ground Floor, North Wing

    @Column(name = "capacity")
    private Integer capacity = 8;

    @Column(name = "hourly_rate", precision = 10, scale = 2)
    private BigDecimal hourlyRate;

    @Column(name = "operating_hours", length = 150)
    private String operatingHours;

    @Column(name = "is_available_for_booking")
    private Boolean isAvailableForBooking = true;

    @Column(name = "status", nullable = false, length = 30)
    private String status; // ACTIVE, MAINTENANCE, INACTIVE

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (this.facilityUuid == null) {
            this.facilityUuid = UUID.randomUUID();
        }
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.updatedAt == null) {
            this.updatedAt = LocalDateTime.now();
        }
        if (this.status == null) {
            this.status = "ACTIVE";
        }
        if (this.isAvailableForBooking == null) {
            this.isAvailableForBooking = true;
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getFacilityId() {
        return facilityId;
    }

    public void setFacilityId(Long facilityId) {
        this.facilityId = facilityId;
    }

    public UUID getFacilityUuid() {
        return facilityUuid;
    }

    public void setFacilityUuid(UUID facilityUuid) {
        this.facilityUuid = facilityUuid;
    }

    public Long getOrganizationId() {
        return organizationId;
    }

    public void setOrganizationId(Long organizationId) {
        this.organizationId = organizationId;
    }

    public UUID getOrganizationUuid() {
        return organizationUuid;
    }

    public void setOrganizationUuid(UUID organizationUuid) {
        this.organizationUuid = organizationUuid;
    }

    public UUID getCentreUuid() {
        return centreUuid;
    }

    public void setCentreUuid(UUID centreUuid) {
        this.centreUuid = centreUuid;
    }

    public String getCentreName() {
        return centreName;
    }

    public void setCentreName(String centreName) {
        this.centreName = centreName;
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

    public String getFacilityType() {
        return facilityType;
    }

    public void setFacilityType(String facilityType) {
        this.facilityType = facilityType;
    }

    public String getSurfaceType() {
        return surfaceType;
    }

    public void setSurfaceType(String surfaceType) {
        this.surfaceType = surfaceType;
    }

    public String getFacilityNumber() {
        return facilityNumber;
    }

    public void setFacilityNumber(String facilityNumber) {
        this.facilityNumber = facilityNumber;
    }

    public String getLocationDetails() {
        return locationDetails;
    }

    public void setLocationDetails(String locationDetails) {
        this.locationDetails = locationDetails;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public BigDecimal getHourlyRate() {
        return hourlyRate;
    }

    public void setHourlyRate(BigDecimal hourlyRate) {
        this.hourlyRate = hourlyRate;
    }

    public String getOperatingHours() {
        return operatingHours;
    }

    public void setOperatingHours(String operatingHours) {
        this.operatingHours = operatingHours;
    }

    public Boolean getIsAvailableForBooking() {
        return isAvailableForBooking;
    }

    public void setIsAvailableForBooking(Boolean isAvailableForBooking) {
        this.isAvailableForBooking = isAvailableForBooking;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
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
        if (o == null || getClass() != o.getClass()) return false;
        AcademyFacility that = (AcademyFacility) o;
        return Objects.equals(facilityUuid, that.facilityUuid);
    }

    @Override
    public int hashCode() {
        return Objects.hash(facilityUuid);
    }
}
