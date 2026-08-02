package com.athlon.identityservice.location.dto.request;
import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class StateRequest {

    @NotNull(message = "Country UUID is required")
    private UUID countryUuid;

    @NotBlank(message = "State name is required")
    @Size(max = 100, message = "Name must not exceed 100 characters")
    private String name;

    public StateRequest() {
    }

    public UUID getCountryUuid() {
        return countryUuid;
    }

    public void setCountryUuid(UUID countryUuid) {
        this.countryUuid = countryUuid;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
