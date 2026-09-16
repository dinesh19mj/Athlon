package com.athlon.identityservice.organization.dto.request;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class AddOrganizerOfficialRequest {

    @NotNull(message = "Organization UUID is required")
    private UUID organizationUuid;

    @NotBlank(message = "Athlon registered phone number is required")
    private String phone;

    @NotBlank(message = "Official role is required")
    private String role; // ADMIN, TOURNAMENT_DIRECTOR, CHIEF_UMPIRE, DESK_OFFICIAL, FINANCE_OFFICER, LOGISTICS_COORDINATOR, MEDIA_MANAGER

    @Size(max = 150, message = "Designation cannot exceed 150 characters")
    private String designation;

    @Size(max = 500, message = "Assigned tournaments cannot exceed 500 characters")
    private String assignedTournaments;

    @Size(max = 500, message = "Notes cannot exceed 500 characters")
    private String notes;

    public AddOrganizerOfficialRequest() {
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

    public String getAssignedTournaments() {
        return assignedTournaments;
    }

    public void setAssignedTournaments(String assignedTournaments) {
        this.assignedTournaments = assignedTournaments;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
