package com.athlon.tournamentservice.dto.request;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public class VenueCreateRequest {

    @NotNull(message = "Name is required")
    private String name;

    private String address;

    @NotNull(message = "City ID is required")
    private Long cityId;

    @NotNull(message = "City UUID is required")
    private UUID cityUuid;

    private Long createdBy;

    public VenueCreateRequest() {
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public Long getCityId() { return cityId; }
    public void setCityId(Long cityId) { this.cityId = cityId; }
    public UUID getCityUuid() { return cityUuid; }
    public void setCityUuid(UUID cityUuid) { this.cityUuid = cityUuid; }
    public Long getCreatedBy() { return createdBy; }
    public void setCreatedBy(Long createdBy) { this.createdBy = createdBy; }
}

