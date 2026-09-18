package com.athlon.identityservice.venue.dto;

import com.athlon.identityservice.venue.enums.BlockType;

import java.time.LocalDate;
import java.time.LocalTime;

public class FacilityBlockCreateRequest {
    private Long venueId;
    private Long facilityId;
    private BlockType blockType = BlockType.OWNER_BLOCK;
    private LocalDate blockDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String reason;
    private String notes;

    public FacilityBlockCreateRequest() {}

    public Long getVenueId() { return venueId; }
    public void setVenueId(Long venueId) { this.venueId = venueId; }
    public Long getFacilityId() { return facilityId; }
    public void setFacilityId(Long facilityId) { this.facilityId = facilityId; }
    public BlockType getBlockType() { return blockType; }
    public void setBlockType(BlockType blockType) { this.blockType = blockType; }
    public LocalDate getBlockDate() { return blockDate; }
    public void setBlockDate(LocalDate blockDate) { this.blockDate = blockDate; }
    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }
    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
