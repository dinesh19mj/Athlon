package com.athlon.identityservice.venue.entity;

import com.athlon.identityservice.venue.enums.FacilityStatus;
import com.athlon.identityservice.venue.enums.FacilityType;
import com.athlon.identityservice.venue.enums.SurfaceType;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "venue_facilities")
public class VenueFacility {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "facility_id", updatable = false, nullable = false)
    private Long facilityId;

    @Column(name = "facility_uuid", updatable = false, nullable = false, unique = true)
    private UUID facilityUuid;

    @Column(name = "venue_id", nullable = false)
    private Long venueId;

    @Column(name = "venue_uuid", nullable = false)
    private UUID venueUuid;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "facility_type", nullable = false, length = 50)
    private FacilityType facilityType = FacilityType.COURT;

    @Column(name = "indoor_outdoor", nullable = false, length = 50)
    private String indoorOutdoor = "INDOOR";

    @Enumerated(EnumType.STRING)
    @Column(name = "surface_type", length = 50)
    private SurfaceType surfaceType;

    @Column(name = "capacity")
    private Integer capacity = 1;

    @Column(name = "booking_enabled")
    private Boolean bookingEnabled = true;

    @Column(name = "slot_duration_minutes", nullable = false)
    private Integer slotDurationMinutes = 60;

    @Column(name = "minimum_booking_minutes", nullable = false)
    private Integer minimumBookingMinutes = 60;

    @Column(name = "maximum_booking_minutes", nullable = false)
    private Integer maximumBookingMinutes = 180;

    @Column(name = "advance_booking_days", nullable = false)
    private Integer advanceBookingDays = 14;

    @Column(name = "cancellation_enabled")
    private Boolean cancellationEnabled = true;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private FacilityStatus status = FacilityStatus.ACTIVE;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "updated_by")
    private Long updatedBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public VenueFacility() {
    }

    public VenueFacility(Long venueId, UUID venueUuid, String name, FacilityType facilityType, Long createdBy) {
        this.venueId = venueId;
        this.venueUuid = venueUuid;
        this.name = name;
        this.facilityType = facilityType != null ? facilityType : FacilityType.COURT;
        this.createdBy = createdBy;
        this.status = FacilityStatus.ACTIVE;
        this.bookingEnabled = true;
    }

    @PrePersist
    public void prePersist() {
        if (facilityUuid == null) {
            facilityUuid = UUID.randomUUID();
        }
        if (status == null) {
            status = FacilityStatus.ACTIVE;
        }
        if (bookingEnabled == null) {
            bookingEnabled = true;
        }
        if (slotDurationMinutes == null) {
            slotDurationMinutes = 60;
        }
        if (minimumBookingMinutes == null) {
            minimumBookingMinutes = 60;
        }
        if (maximumBookingMinutes == null) {
            maximumBookingMinutes = 180;
        }
        if (advanceBookingDays == null) {
            advanceBookingDays = 14;
        }
        if (cancellationEnabled == null) {
            cancellationEnabled = true;
        }
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public FacilityType getFacilityType() {
        return facilityType;
    }

    public void setFacilityType(FacilityType facilityType) {
        this.facilityType = facilityType;
    }

    public String getIndoorOutdoor() {
        return indoorOutdoor;
    }

    public void setIndoorOutdoor(String indoorOutdoor) {
        this.indoorOutdoor = indoorOutdoor;
    }

    public SurfaceType getSurfaceType() {
        return surfaceType;
    }

    public void setSurfaceType(SurfaceType surfaceType) {
        this.surfaceType = surfaceType;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public Boolean getBookingEnabled() {
        return bookingEnabled;
    }

    public void setBookingEnabled(Boolean bookingEnabled) {
        this.bookingEnabled = bookingEnabled;
    }

    public Integer getSlotDurationMinutes() {
        return slotDurationMinutes;
    }

    public void setSlotDurationMinutes(Integer slotDurationMinutes) {
        this.slotDurationMinutes = slotDurationMinutes;
    }

    public Integer getMinimumBookingMinutes() {
        return minimumBookingMinutes;
    }

    public void setMinimumBookingMinutes(Integer minimumBookingMinutes) {
        this.minimumBookingMinutes = minimumBookingMinutes;
    }

    public Integer getMaximumBookingMinutes() {
        return maximumBookingMinutes;
    }

    public void setMaximumBookingMinutes(Integer maximumBookingMinutes) {
        this.maximumBookingMinutes = maximumBookingMinutes;
    }

    public Integer getAdvanceBookingDays() {
        return advanceBookingDays;
    }

    public void setAdvanceBookingDays(Integer advanceBookingDays) {
        this.advanceBookingDays = advanceBookingDays;
    }

    public Boolean getCancellationEnabled() {
        return cancellationEnabled;
    }

    public void setCancellationEnabled(Boolean cancellationEnabled) {
        this.cancellationEnabled = cancellationEnabled;
    }

    public FacilityStatus getStatus() {
        return status;
    }

    public void setStatus(FacilityStatus status) {
        this.status = status;
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
        if (!(o instanceof VenueFacility that)) return false;
        return Objects.equals(facilityId, that.facilityId) && Objects.equals(facilityUuid, that.facilityUuid);
    }

    @Override
    public int hashCode() {
        return Objects.hash(facilityId, facilityUuid);
    }
}
