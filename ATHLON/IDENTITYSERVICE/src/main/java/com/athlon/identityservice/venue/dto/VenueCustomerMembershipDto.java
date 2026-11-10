package com.athlon.identityservice.venue.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public class VenueCustomerMembershipDto {
    private Long customerMembershipId;
    private UUID customerMembershipUuid;
    private UUID organizationUuid;
    private Long customerId;
    private UUID customerUuid;
    private String customerName;
    private String customerPhone;
    private Long membershipId;
    private String membershipName;
    private String membershipType;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private BigDecimal remainingCredits;
    private String status;
    private LocalDateTime createdAt;

    public VenueCustomerMembershipDto() {
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

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCustomerPhone() {
        return customerPhone;
    }

    public void setCustomerPhone(String customerPhone) {
        this.customerPhone = customerPhone;
    }

    public Long getMembershipId() {
        return membershipId;
    }

    public void setMembershipId(Long membershipId) {
        this.membershipId = membershipId;
    }

    public String getMembershipName() {
        return membershipName;
    }

    public void setMembershipName(String membershipName) {
        this.membershipName = membershipName;
    }

    public String getMembershipType() {
        return membershipType;
    }

    public void setMembershipType(String membershipType) {
        this.membershipType = membershipType;
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

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

