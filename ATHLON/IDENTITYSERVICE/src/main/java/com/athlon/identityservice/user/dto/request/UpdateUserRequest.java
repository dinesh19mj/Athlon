package com.athlon.identityservice.user.dto.request;

import jakarta.validation.constraints.NotBlank;
import java.util.UUID;

public class UpdateUserRequest {

    private UUID uuid;

    @NotBlank(message = "First name is required")
    private String firstName;

    private String lastName;

    private String phone;

    public UpdateUserRequest() {
    }

    public UUID getUuid() {
        return uuid;
    }

    public void setUuid(UUID uuid) {
        this.uuid = uuid;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }
}
