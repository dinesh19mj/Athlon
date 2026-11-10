package com.athlon.identityservice.venue.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.UUID;

public class VenueMembershipCreateRequest {

    @NotNull(message = "Organization UUID is required")
    private UUID organizationUuid;

    @NotBlank(message = "Name is required")
    private String name;

    private String description;
    private String membershipType = "PREPAID_HOURS";

    @NotNull(message = "Total credits (hours) is required")
    private BigDecimal totalCredits;

    @NotNull(message = "Price is required")
    private BigDecimal price;

    @NotNull(message = "Validity days is required")
    private Integer validityDays = 30;

    private String eligibleFacilities;

    public VenueMembershipCreateRequest() {
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
}

