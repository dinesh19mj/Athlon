package com.athlon.identityservice.venue.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "venue_customer_memberships")
public class VenueCustomerMembership {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "customer_membership_id", updatable = false, nullable = false)
    private Long customerMembershipId;

    @Column(name = "customer_membership_uuid", updatable = false, nullable = false, unique = true)
    private UUID customerMembershipUuid = UUID.randomUUID();

    @Column(name = "organization_uuid", nullable = false)
    private UUID organizationUuid;

    @Column(name = "customer_id", nullable = false)
    private Long customerId;

    @Column(name = "customer_uuid", nullable = false)
    private UUID customerUuid;

    @Column(name = "membership_id", nullable = false)
    private Long membershipId;

    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDateTime endDate;

    @Column(name = "remaining_credits", nullable = false, precision = 8, scale = 2)
    private BigDecimal remainingCredits = BigDecimal.ZERO;

    @Column(name = "status", nullable = false, length = 30)
    private String status = "ACTIVE"; // ACTIVE, EXHAUSTED, EXPIRED, CANCELLED

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public VenueCustomerMembership() {
    }

    public VenueCustomerMembership(UUID organizationUuid, Long customerId, UUID customerUuid, Long membershipId, LocalDateTime startDate, LocalDateTime endDate, BigDecimal initialCredits) {
        this.organizationUuid = organizationUuid;
        this.customerId = customerId;
        this.customerUuid = customerUuid;
        this.membershipId = membershipId;
        this.startDate = startDate;
        this.endDate = endDate;
        this.remainingCredits = initialCredits != null ? initialCredits : BigDecimal.ZERO;
        this.customerMembershipUuid = UUID.randomUUID();
        this.status = "ACTIVE";
    }

    @PrePersist
    protected void onCreate() {
        if (this.customerMembershipUuid == null) {
            this.customerMembershipUuid = UUID.randomUUID();
        }
        if (this.status == null) {
            this.status = "ACTIVE";
        }
    }

    public Long getCustomerMembershipId() {
        return customerMembershipId;
    }

    public void setCustomerMembershipId(Long customerMembershipId) {
        this.customerMembershipId = customerMembershipId;
    }

    public UUID getCustomerMembershipUuid() {
        return customerMembershipUuid;
    }

    public void setCustomerMembershipUuid(UUID customerMembershipUuid) {
        this.customerMembershipUuid = customerMembershipUuid;
    }

    public UUID getOrganizationUuid() {
        return organizationUuid;
    }

    public void setOrganizationUuid(UUID organizationUuid) {
        this.organizationUuid = organizationUuid;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public UUID getCustomerUuid() {
        return customerUuid;
    }

    public void setCustomerUuid(UUID customerUuid) {
        this.customerUuid = customerUuid;
    }

    public Long getMembershipId() {
        return membershipId;
    }

    public void setMembershipId(Long membershipId) {
        this.membershipId = membershipId;
    }

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }

    public LocalDateTime getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
    }

    public BigDecimal getRemainingCredits() {
        return remainingCredits;
    }

    public void setRemainingCredits(BigDecimal remainingCredits) {
        this.remainingCredits = remainingCredits;
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

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}

