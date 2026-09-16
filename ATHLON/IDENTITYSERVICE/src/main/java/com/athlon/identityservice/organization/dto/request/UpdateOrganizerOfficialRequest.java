package com.athlon.identityservice.organization.dto.request;

import java.util.UUID;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class UpdateOrganizerOfficialRequest {

    @NotNull(message = "Official UUID is required")
    private UUID officialUuid;

    private String role;

    @Size(max = 150, message = "Designation cannot exceed 150 characters")
    private String designation;

    @Size(max = 500, message = "Assigned tournaments cannot exceed 500 characters")
    private String assignedTournaments;

    @Size(max = 500, message = "Notes cannot exceed 500 characters")
    private String notes;

    private Integer isActive;

    public UpdateOrganizerOfficialRequest() {
    }

    public UUID getOfficialUuid() {
        return officialUuid;
    }

    public void setOfficialUuid(UUID officialUuid) {
        this.officialUuid = officialUuid;
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

    public Integer getIsActive() {
        return isActive;
    }

    public void setIsActive(Integer isActive) {
        this.isActive = isActive;
    }
}
