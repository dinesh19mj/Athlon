package com.athlon.identityservice.organization.dto.request;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class AddVenueStaffRequest {

    @NotNull(message = "Organization UUID is required")
    private UUID organizationUuid;

    @NotBlank(message = "Phone number is required")
    private String phone;

    @NotBlank(message = "Role is required")
    private String role; // ADMIN, VENUE_MANAGER, FRONT_DESK, COURT_SUPERVISOR, FINANCE_MANAGER, MAINTENANCE_STAFF

    private String designation;
    private String assignedFacilities;
    private String notes;

    public AddVenueStaffRequest() {
    }

    public UUID getOrganizationUuid() {
        return organizationUuid;
    }

    public void setOrganizationUuid(UUID organizationUuid) {
        this.organizationUuid = organizationUuid;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
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
}
