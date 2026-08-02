package com.athlon.identityservice.security.dto.request;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CreatePermissionRequest {

    @NotBlank(message = "Permission name is required")
    @Size(max = 100, message = "Name must not exceed 100 characters")
    private String name;

    private String description;

    public CreatePermissionRequest() {
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
}
