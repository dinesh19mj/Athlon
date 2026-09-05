package com.athlon.identityservice.organization.dto.request;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class AddAcademyStaffRequest {

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[0-9]{10,15}$", message = "Phone number must be between 10 to 15 digits")
    private String phone;

    private String role = "COACH"; // e.g. HEAD_COACH, COACH, MANAGER, RECEPTIONIST, etc.

    private String sportType; // e.g. Badminton, Tennis, etc.

    private UUID centreUuid; // assigned campus if applicable

    public AddAcademyStaffRequest() {
    }

    public AddAcademyStaffRequest(String phone, String role, String sportType, UUID centreUuid) {
        this.phone = phone;
        this.role = role != null ? role : "COACH";
        this.sportType = sportType;
        this.centreUuid = centreUuid;
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

    public String getSportType() {
        return sportType;
    }

    public void setSportType(String sportType) {
        this.sportType = sportType;
    }

    public UUID getCentreUuid() {
        return centreUuid;
    }

    public void setCentreUuid(UUID centreUuid) {
        this.centreUuid = centreUuid;
    }
}
