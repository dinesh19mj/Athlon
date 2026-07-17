package com.athlon.identityservice.dto.response;

import java.util.UUID;

public class CityResponse {

    private UUID uuid;
    private UUID districtUuid;
    private String name;
    private boolean isActive;

    public CityResponse() {
    }

    public UUID getUuid() {
        return uuid;
    }

    public void setUuid(UUID uuid) {
        this.uuid = uuid;
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

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
    }
}
