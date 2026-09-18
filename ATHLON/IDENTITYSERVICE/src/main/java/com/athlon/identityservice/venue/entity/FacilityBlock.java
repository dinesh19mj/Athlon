package com.athlon.identityservice.venue.entity;

import com.athlon.identityservice.venue.enums.BlockType;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "facility_blocks")
public class FacilityBlock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false, nullable = false)
    private Long id;

    @Column(name = "block_uuid", updatable = false, nullable = false, unique = true)
    private UUID blockUuid;

    @Column(name = "venue_id", nullable = false)
    private Long venueId;

    @Column(name = "facility_id", nullable = false)
    private Long facilityId;

    @Enumerated(EnumType.STRING)
    @Column(name = "block_type", nullable = false, length = 50)
    private BlockType blockType = BlockType.OWNER_BLOCK;

    @Column(name = "block_date", nullable = false)
    private LocalDate blockDate;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "reason", nullable = false)
    private String reason;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_by")
    private Long createdBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public FacilityBlock() {
    }

    public FacilityBlock(Long venueId, Long facilityId, BlockType blockType, LocalDate blockDate, LocalTime startTime, LocalTime endTime, String reason, Long createdBy) {
        this.venueId = venueId;
        this.facilityId = facilityId;
        this.blockType = blockType != null ? blockType : BlockType.OWNER_BLOCK;
        this.blockDate = blockDate;
        this.startTime = startTime;
        this.endTime = endTime;
        this.reason = reason;
        this.createdBy = createdBy;
    }

    @PrePersist
    public void prePersist() {
        if (blockUuid == null) {
            blockUuid = UUID.randomUUID();
        }
        if (blockType == null) {
            blockType = BlockType.OWNER_BLOCK;
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public UUID getBlockUuid() {
        return blockUuid;
    }

    public void setBlockUuid(UUID blockUuid) {
        this.blockUuid = blockUuid;
    }

    public Long getVenueId() {
        return venueId;
    }

    public void setVenueId(Long venueId) {
        this.venueId = venueId;
    }

    public Long getFacilityId() {
        return facilityId;
    }

    public void setFacilityId(Long facilityId) {
        this.facilityId = facilityId;
    }

    public BlockType getBlockType() {
        return blockType;
    }

    public void setBlockType(BlockType blockType) {
        this.blockType = blockType;
    }

    public LocalDate getBlockDate() {
        return blockDate;
    }

    public void setBlockDate(LocalDate blockDate) {
        this.blockDate = blockDate;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Long getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(Long createdBy) {
        this.createdBy = createdBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
