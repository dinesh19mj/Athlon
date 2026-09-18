package com.athlon.identityservice.venue.dto;

import java.time.LocalDateTime;

public class FacilityMaintenanceCreateRequest {
    private Long facilityId;
    private String maintenanceType = "ROUTINE";
    private LocalDateTime startDateTime;
    private LocalDateTime endDateTime;
    private String description;

    public FacilityMaintenanceCreateRequest() {}

    public Long getFacilityId() { return facilityId; }
    public void setFacilityId(Long facilityId) { this.facilityId = facilityId; }
    public String getMaintenanceType() { return maintenanceType; }
    public void setMaintenanceType(String maintenanceType) { this.maintenanceType = maintenanceType; }
    public LocalDateTime getStartDateTime() { return startDateTime; }
    public void setStartDateTime(LocalDateTime startDateTime) { this.startDateTime = startDateTime; }
    public LocalDateTime getEndDateTime() { return endDateTime; }
    public void setEndDateTime(LocalDateTime endDateTime) { this.endDateTime = endDateTime; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
