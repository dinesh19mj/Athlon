package com.athlon.identityservice.organization.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class AddMemberRequest {

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[0-9]{10,15}$", message = "Phone number must be between 10 to 15 digits")
    private String phone;

    private String role = "MEMBER";
    private String sportType;

    public AddMemberRequest() {
    }

    public AddMemberRequest(String phone, String role) {
        this.phone = phone;
        this.role = role != null ? role : "MEMBER";
    }

    public AddMemberRequest(String phone, String role, String sportType) {
        this.phone = phone;
        this.role = role != null ? role : "MEMBER";
        this.sportType = sportType;
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
}
