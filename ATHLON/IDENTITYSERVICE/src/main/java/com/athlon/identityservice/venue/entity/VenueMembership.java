package com.athlon.identityservice.venue.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "venue_memberships")
public class VenueMembership {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "membership_id", updatable = false, nullable = false)
    private Long membershipId;

    @Column(name = "membership_uuid", updatable = false, nullable = false, unique = true)
    private UUID membershipUuid = UUID.randomUUID();

    @Column(name = "organization_uuid", nullable = false)
    private UUID organizationUuid;

    @Column(name = "name", nullable = false, length = 120)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "membership_type", nullable = false, length = 30)
    private String membershipType = "PREPAID_HOURS"; // PREPAID_HOURS, SUBSCRIPTION_PASS

    @Column(name = "total_credits", nullable = false, precision = 8, scale = 2)
    private BigDecimal totalCredits = BigDecimal.valueOf(10.00); // e.g. 10 hours

    @Column(name = "price", nullable = false, precision = 12, scale = 2)
    private BigDecimal price = BigDecimal.ZERO;

    @Column(name = "validity_days", nullable = false)
    private Integer validityDays = 30;

    @Column(name = "eligible_facilities", columnDefinition = "TEXT")
    private String eligibleFacilities; // Comma-separated or "ALL"

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public VenueMembership() {
    }

    public VenueMembership(UUID organizationUuid, String name, String description, String membershipType, BigDecimal totalCredits, BigDecimal price, Integer validityDays) {
        this.organizationUuid = organizationUuid;
        this.name = name;
        this.description = description;
        this.membershipType = membershipType != null ? membershipType : "PREPAID_HOURS";
        this.totalCredits = totalCredits != null ? totalCredits : BigDecimal.valueOf(10.00);
        this.price = price != null ? price : BigDecimal.ZERO;
        this.validityDays = validityDays != null ? validityDays : 30;
        this.membershipUuid = UUID.randomUUID();
        this.isActive = true;
    }

    @PrePersist
    protected void onCreate() {
        if (this.membershipUuid == null) {
            this.membershipUuid = UUID.randomUUID();
        }
        if (this.isActive == null) {
            this.isActive = true;
        }
    }

    public Long getMembershipId() {
        return membershipId;
    }

    public void setMembershipId(Long membershipId) {
        this.membershipId = membershipId;
    }

    public UUID getMembershipUuid() {
        return membershipUuid;
    }

    public void setMembershipUuid(UUID membershipUuid) {
        this.membershipUuid = membershipUuid;
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

    public String getMembershipType() {
        return membershipType;
    }

    public void setMembershipType(String membershipType) {
        this.membershipType = membershipType;
    }

    public BigDecimal getTotalCredits() {
        return totalCredits;
    }

    public void setTotalCredits(BigDecimal totalCredits) {
        this.totalCredits = totalCredits;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public Integer getValidityDays() {
        return validityDays;
    }

    public void setValidityDays(Integer validityDays) {
        this.validityDays = validityDays;
    }

    public String getEligibleFacilities() {
        return eligibleFacilities;
    }

    public void setEligibleFacilities(String eligibleFacilities) {
        this.eligibleFacilities = eligibleFacilities;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}

