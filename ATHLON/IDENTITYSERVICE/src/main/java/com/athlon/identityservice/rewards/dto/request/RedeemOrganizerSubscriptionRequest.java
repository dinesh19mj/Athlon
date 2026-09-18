package com.athlon.identityservice.rewards.dto.request;

import jakarta.validation.constraints.NotNull;

public class RedeemOrganizerSubscriptionRequest {

    @NotNull(message = "Organization ID is required")
    private Long organizationId;

    private Long packageId;

    private String notes;

    public RedeemOrganizerSubscriptionRequest() {
    }

    public RedeemOrganizerSubscriptionRequest(Long organizationId, Long packageId, String notes) {
        this.organizationId = organizationId;
        this.packageId = packageId;
        this.notes = notes;
    }

    public Long getOrganizationId() {
        return organizationId;
    }

    public void setOrganizationId(Long organizationId) {
        this.organizationId = organizationId;
    }

    public Long getPackageId() {
        return packageId;
    }

    public void setPackageId(Long packageId) {
        this.packageId = packageId;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
