package com.athlon.identityservice.dto.response;

import java.util.UUID;

public class DistrictResponse {

    private UUID uuid;
    private UUID stateUuid;
    private String name;
    private boolean isActive;

    public DistrictResponse() {
    }

    public UUID getUuid() {
        return uuid;
    }

    public void setUuid(UUID uuid) {
        this.uuid = uuid;
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

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
    }
}
