package com.athlon.identityservice.organization.dto.request;

import java.util.UUID;

import jakarta.validation.constraints.NotNull;

public class UpdateVenueStaffRequest {

    @NotNull(message = "Staff UUID is required")
    private UUID staffUuid;

    private String role;
    private String designation;
    private String assignedFacilities;
    private String notes;
    private Integer isActive;

    public UpdateVenueStaffRequest() {
    }

    public UUID getStaffUuid() {
        return staffUuid;
    }

    public void setStaffUuid(UUID staffUuid) {
        this.staffUuid = staffUuid;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getDesignation() {
        return designation;
    }

    public void setDesignation(String designation) {
        this.designation = designation;
    }

    public String getAssignedFacilities() {
        return assignedFacilities;
    }

    public void setAssignedFacilities(String assignedFacilities) {
        this.assignedFacilities = assignedFacilities;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Integer getIsActive() {
        return isActive;
    }

    public void setIsActive(Integer isActive) {
        this.isActive = isActive;
    }
}
