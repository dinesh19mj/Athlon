package com.athlon.identityservice.organization.dto.request;

import java.math.BigDecimal;
import java.util.UUID;

import jakarta.validation.constraints.NotNull;

public class UpdateCourtRequest {

    @NotNull(message = "Court UUID is required")
    private UUID courtUuid;

    private String name;
    private String sportType;
    private String surfaceType;
    private String courtNumber;
    private String location;
    private BigDecimal hourlyRate;
    private String status; // ACTIVE, MAINTENANCE, INACTIVE

    public UUID getCourtUuid() {
        return courtUuid;
    }

    public void setCourtUuid(UUID courtUuid) {
        this.courtUuid = courtUuid;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSportType() {
        return sportType;
    }

    public void setSportType(String sportType) {
        this.sportType = sportType;
    }

    public String getSurfaceType() {
        return surfaceType;
    }

    public void setSurfaceType(String surfaceType) {
        this.surfaceType = surfaceType;
    }

    public String getCourtNumber() {
        return courtNumber;
    }

    public void setCourtNumber(String courtNumber) {
        this.courtNumber = courtNumber;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public BigDecimal getHourlyRate() {
        return hourlyRate;
    }

    public void setHourlyRate(BigDecimal hourlyRate) {
        this.hourlyRate = hourlyRate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
