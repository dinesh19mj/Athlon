package com.athlon.identityservice.venue.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public class VenueDailyAvailabilityResponse {
    private Long venueId;
    private UUID venueUuid;
    private String venueName;
    private LocalDate date;
    private List<FacilityAvailabilityResponse> facilities;

    public VenueDailyAvailabilityResponse() {}

    public VenueDailyAvailabilityResponse(Long venueId, UUID venueUuid, String venueName, LocalDate date, List<FacilityAvailabilityResponse> facilities) {
        this.venueId = venueId;
        this.venueUuid = venueUuid;
        this.venueName = venueName;
        this.date = date;
        this.facilities = facilities;
    }

    public Long getVenueId() { return venueId; }
    public void setVenueId(Long venueId) { this.venueId = venueId; }
    public UUID getVenueUuid() { return venueUuid; }
    public void setVenueUuid(UUID venueUuid) { this.venueUuid = venueUuid; }
    public String getVenueName() { return venueName; }
    public void setVenueName(String venueName) { this.venueName = venueName; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public List<FacilityAvailabilityResponse> getFacilities() { return facilities; }
    public void setFacilities(List<FacilityAvailabilityResponse> facilities) { this.facilities = facilities; }
}
