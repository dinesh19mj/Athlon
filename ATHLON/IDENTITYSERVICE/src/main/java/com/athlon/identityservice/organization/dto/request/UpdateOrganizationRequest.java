package com.athlon.identityservice.organization.dto.request;
import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class UpdateOrganizationRequest {

    private UUID uuid;

    @NotBlank(message = "Organization name is required")
    @Size(max = 255, message = "Name must not exceed 255 characters")
    private String name;

    private String description;

    @Size(max = 100, message = "Type must not exceed 100 characters")
    private String type;

    private Long parentOrganizationId;

    public UpdateOrganizationRequest() {
    }

    public UUID getUuid() {
        return uuid;
    }

    public void setUuid(UUID uuid) {
        this.uuid = uuid;
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

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Long getParentOrganizationId() {
        return parentOrganizationId;
    }

    public void setParentOrganizationId(Long parentOrganizationId) {
        this.parentOrganizationId = parentOrganizationId;
    }
}
