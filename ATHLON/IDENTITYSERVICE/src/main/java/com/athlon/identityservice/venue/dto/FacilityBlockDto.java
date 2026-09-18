package com.athlon.identityservice.venue.dto;

import com.athlon.identityservice.venue.enums.BlockType;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

public class FacilityBlockDto {
    private Long id;
    private UUID blockUuid;
    private Long venueId;
    private Long facilityId;
    private String facilityName;
    private BlockType blockType;
    private LocalDate blockDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String reason;
    private String notes;
    private Long createdBy;
    private LocalDateTime createdAt;

    public FacilityBlockDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public UUID getBlockUuid() { return blockUuid; }
    public void setBlockUuid(UUID blockUuid) { this.blockUuid = blockUuid; }
    public Long getVenueId() { return venueId; }
    public void setVenueId(Long venueId) { this.venueId = venueId; }
    public Long getFacilityId() { return facilityId; }
    public void setFacilityId(Long facilityId) { this.facilityId = facilityId; }
    public String getFacilityName() { return facilityName; }
    public void setFacilityName(String facilityName) { this.facilityName = facilityName; }
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
    public Long getCreatedBy() { return createdBy; }
    public void setCreatedBy(Long createdBy) { this.createdBy = createdBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
