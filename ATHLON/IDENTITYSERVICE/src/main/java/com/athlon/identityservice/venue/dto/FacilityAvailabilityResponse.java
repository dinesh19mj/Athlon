package com.athlon.identityservice.venue.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public class FacilityAvailabilityResponse {
    private Long facilityId;
    private UUID facilityUuid;
    private String facilityName;
    private Long venueId;
    private UUID venueUuid;
    private LocalDate date;
    private Integer slotDurationMinutes;
    private List<SlotDto> slots;

    public FacilityAvailabilityResponse() {}

    public FacilityAvailabilityResponse(Long facilityId, UUID facilityUuid, String facilityName, Long venueId, UUID venueUuid, LocalDate date, Integer slotDurationMinutes, List<SlotDto> slots) {
        this.facilityId = facilityId;
        this.facilityUuid = facilityUuid;
        this.facilityName = facilityName;
        this.venueId = venueId;
        this.venueUuid = venueUuid;
        this.date = date;
        this.slotDurationMinutes = slotDurationMinutes;
        this.slots = slots;
    }

    public Long getFacilityId() { return facilityId; }
    public void setFacilityId(Long facilityId) { this.facilityId = facilityId; }
    public UUID getFacilityUuid() { return facilityUuid; }
    public void setFacilityUuid(UUID facilityUuid) { this.facilityUuid = facilityUuid; }
    public String getFacilityName() { return facilityName; }
    public void setFacilityName(String facilityName) { this.facilityName = facilityName; }
    public Long getVenueId() { return venueId; }
    public void setVenueId(Long venueId) { this.venueId = venueId; }
    public UUID getVenueUuid() { return venueUuid; }
    public void setVenueUuid(UUID venueUuid) { this.venueUuid = venueUuid; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public Integer getSlotDurationMinutes() { return slotDurationMinutes; }
    public void setSlotDurationMinutes(Integer slotDurationMinutes) { this.slotDurationMinutes = slotDurationMinutes; }
    public List<SlotDto> getSlots() { return slots; }
    public void setSlots(List<SlotDto> slots) { this.slots = slots; }
}
