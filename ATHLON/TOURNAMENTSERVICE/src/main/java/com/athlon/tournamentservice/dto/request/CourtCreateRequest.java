package com.athlon.tournamentservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public class CourtCreateRequest {

    @NotNull(message = "Venue ID is required")
    private Long venueId;

    @NotNull(message = "Venue UUID is required")
    private UUID venueUuid;

    @NotBlank(message = "Court name is required")
    private String name;

    @NotBlank(message = "Sport type is required")
    private String sportType;

    private Long createdBy;

    public CourtCreateRequest() {
    }

    public Long getVenueId() { return venueId; }
    public void setVenueId(Long venueId) { this.venueId = venueId; }
    public UUID getVenueUuid() { return venueUuid; }
    public void setVenueUuid(UUID venueUuid) { this.venueUuid = venueUuid; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getSportType() { return sportType; }
    public void setSportType(String sportType) { this.sportType = sportType; }
    public Long getCreatedBy() { return createdBy; }
    public void setCreatedBy(Long createdBy) { this.createdBy = createdBy; }
}

