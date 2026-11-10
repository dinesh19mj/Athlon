package com.athlon.identityservice.venue.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public class AssignMembershipRequest {

    @NotNull(message = "Organization UUID is required")
    private UUID organizationUuid;

    @NotNull(message = "Customer UUID is required")
    private UUID customerUuid;

    @NotNull(message = "Membership ID is required")
    private Long membershipId;

    public AssignMembershipRequest() {
    }

    public UUID getOrganizationUuid() {
        return organizationUuid;
    }

    public void setOrganizationUuid(UUID organizationUuid) {
        this.organizationUuid = organizationUuid;
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
}

