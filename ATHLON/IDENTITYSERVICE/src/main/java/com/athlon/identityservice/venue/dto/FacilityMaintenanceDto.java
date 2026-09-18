package com.athlon.identityservice.venue.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class FacilityMaintenanceDto {
    private Long id;
    private UUID maintenanceUuid;
    private Long facilityId;
    private String facilityName;
    private String maintenanceType;
    private LocalDateTime startDateTime;
    private LocalDateTime endDateTime;
    private String description;
    private String status;
    private Long createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public FacilityMaintenanceDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public UUID getMaintenanceUuid() { return maintenanceUuid; }
    public void setMaintenanceUuid(UUID maintenanceUuid) { this.maintenanceUuid = maintenanceUuid; }
    public Long getFacilityId() { return facilityId; }
    public void setFacilityId(Long facilityId) { this.facilityId = facilityId; }
    public String getFacilityName() { return facilityName; }
    public void setFacilityName(String facilityName) { this.facilityName = facilityName; }
    public String getMaintenanceType() { return maintenanceType; }
    public void setMaintenanceType(String maintenanceType) { this.maintenanceType = maintenanceType; }
    public LocalDateTime getStartDateTime() { return startDateTime; }
    public void setStartDateTime(LocalDateTime startDateTime) { this.startDateTime = startDateTime; }
    public LocalDateTime getEndDateTime() { return endDateTime; }
    public void setEndDateTime(LocalDateTime endDateTime) { this.endDateTime = endDateTime; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Long getCreatedBy() { return createdBy; }
    public void setCreatedBy(Long createdBy) { this.createdBy = createdBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
