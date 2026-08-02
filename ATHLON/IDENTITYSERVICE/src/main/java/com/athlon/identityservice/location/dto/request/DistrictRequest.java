package com.athlon.identityservice.location.dto.request;
import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class DistrictRequest {

    @NotNull(message = "State UUID is required")
    private UUID stateUuid;

    @NotBlank(message = "District name is required")
    @Size(max = 100, message = "Name must not exceed 100 characters")
    private String name;

    public DistrictRequest() {
    }

    public UUID getStateUuid() {
        return stateUuid;
    }

    public void setStateUuid(UUID stateUuid) {
        this.stateUuid = stateUuid;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
