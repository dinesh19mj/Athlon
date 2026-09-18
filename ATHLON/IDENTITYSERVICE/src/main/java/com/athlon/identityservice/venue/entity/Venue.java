package com.athlon.identityservice.venue.entity;

import com.athlon.identityservice.venue.enums.VenueStatus;
import com.athlon.identityservice.venue.enums.VenueType;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "venues")
public class Venue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "venue_id", updatable = false, nullable = false)
    private Long venueId;

    @Column(name = "venue_uuid", updatable = false, nullable = false, unique = true)
    private UUID venueUuid;

    @Column(name = "organization_id")
    private Long organizationId;

    @Column(name = "organization_uuid")
    private UUID organizationUuid;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "venue_type", nullable = false, length = 50)
    private VenueType venueType = VenueType.INDOOR;

    @Column(name = "address_line1")
    private String addressLine1;

    @Column(name = "address_line2")
    private String addressLine2;

    @Column(name = "city", length = 100)
    private String city;

    @Column(name = "district", length = 100)
    private String district;

    @Column(name = "state", length = 100)
    private String state;

    @Column(name = "country", length = 100)
    private String country = "India";

    @Column(name = "postal_code", length = 20)
    private String postalCode;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "contact_number", length = 50)
    private String contactNumber;

    @Column(name = "email", length = 150)
    private String email;

    @Column(name = "opening_status", length = 50)
    private String openingStatus = "OPEN";

    @Column(name = "booking_enabled")
    private Boolean bookingEnabled = true;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private VenueStatus status = VenueStatus.ACTIVE;

    @Column(name = "rules_and_regulations", columnDefinition = "TEXT")
    private String rulesAndRegulations;

    @Column(name = "cancellation_policy", columnDefinition = "TEXT")
    private String cancellationPolicy;

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

    public Venue() {
    }

    public Venue(Long organizationId, UUID organizationUuid, String name, VenueType venueType, Long createdBy) {
        this.organizationId = organizationId;
        this.organizationUuid = organizationUuid;
        this.name = name;
        this.venueType = venueType != null ? venueType : VenueType.INDOOR;
        this.createdBy = createdBy;
        this.status = VenueStatus.ACTIVE;
        this.bookingEnabled = true;
    }

    @PrePersist
    public void prePersist() {
        if (venueUuid == null) {
            venueUuid = UUID.randomUUID();
        }
        if (status == null) {
            status = VenueStatus.ACTIVE;
        }
        if (bookingEnabled == null) {
            bookingEnabled = true;
        }
        if (venueType == null) {
            venueType = VenueType.INDOOR;
        }
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

    public VenueType getVenueType() {
        return venueType;
    }

    public void setVenueType(VenueType venueType) {
        this.venueType = venueType;
    }

    public String getAddressLine1() {
        return addressLine1;
    }

    public void setAddressLine1(String addressLine1) {
        this.addressLine1 = addressLine1;
    }

    public String getAddressLine2() {
        return addressLine2;
    }

    public void setAddressLine2(String addressLine2) {
        this.addressLine2 = addressLine2;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getPostalCode() {
        return postalCode;
    }

    public void setPostalCode(String postalCode) {
        this.postalCode = postalCode;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public String getContactNumber() {
        return contactNumber;
    }

    public void setContactNumber(String contactNumber) {
        this.contactNumber = contactNumber;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getOpeningStatus() {
        return openingStatus;
    }

    public void setOpeningStatus(String openingStatus) {
        this.openingStatus = openingStatus;
    }

    public Boolean getBookingEnabled() {
        return bookingEnabled;
    }

    public void setBookingEnabled(Boolean bookingEnabled) {
        this.bookingEnabled = bookingEnabled;
    }

    public VenueStatus getStatus() {
        return status;
    }

    public void setStatus(VenueStatus status) {
        this.status = status;
    }

    public String getRulesAndRegulations() {
        return rulesAndRegulations;
    }

    public void setRulesAndRegulations(String rulesAndRegulations) {
        this.rulesAndRegulations = rulesAndRegulations;
    }

    public String getCancellationPolicy() {
        return cancellationPolicy;
    }

    public void setCancellationPolicy(String cancellationPolicy) {
        this.cancellationPolicy = cancellationPolicy;
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
        if (!(o instanceof Venue venue)) return false;
        return Objects.equals(venueId, venue.venueId) && Objects.equals(venueUuid, venue.venueUuid);
    }

    @Override
    public int hashCode() {
        return Objects.hash(venueId, venueUuid);
    }
}
