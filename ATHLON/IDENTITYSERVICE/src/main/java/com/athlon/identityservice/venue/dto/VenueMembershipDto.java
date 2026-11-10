package com.athlon.identityservice.venue.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public class VenueMembershipDto {
    private Long membershipId;
    private UUID membershipUuid;
    private UUID organizationUuid;
    private String name;
    private String description;
    private String membershipType;
    private BigDecimal totalCredits;
    private BigDecimal price;
    private Integer validityDays;
    private String eligibleFacilities;
    private Boolean isActive;
    private LocalDateTime createdAt;

    public VenueMembershipDto() {
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

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

