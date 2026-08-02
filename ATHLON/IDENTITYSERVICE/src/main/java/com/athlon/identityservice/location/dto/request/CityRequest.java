package com.athlon.identityservice.location.dto.request;
import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CityRequest {

    @NotNull(message = "District UUID is required")
    private UUID districtUuid;

    @NotBlank(message = "City name is required")
    @Size(max = 100, message = "Name must not exceed 100 characters")
    private String name;

    public CityRequest() {
    }

    public UUID getDistrictUuid() {
        return districtUuid;
    }

    public void setDistrictUuid(UUID districtUuid) {
        this.districtUuid = districtUuid;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
