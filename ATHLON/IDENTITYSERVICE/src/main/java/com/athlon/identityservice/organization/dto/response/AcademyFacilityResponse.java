package com.athlon.identityservice.organization.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public class AcademyFacilityResponse {

    private Long facilityId;
    private UUID facilityUuid;
    private Long organizationId;
    private UUID organizationUuid;
    private UUID centreUuid;
    private String centreName;
    private String name;
    private String sportType;
    private String facilityType;
    private String surfaceType;
    private String facilityNumber;
    private String locationDetails;
    private Integer capacity = 8;
    private BigDecimal hourlyRate;
    private String operatingHours;
    private Boolean isAvailableForBooking = true;
    private String status;

    private Integer activeBatchesCount = 0;
    private Integer enrolledStudentsCount = 0;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Long getFacilityId() {
        return facilityId;
    }

    public void setFacilityId(Long facilityId) {
        this.facilityId = facilityId;
    }

    public UUID getFacilityUuid() {
        return facilityUuid;
    }

    public void setFacilityUuid(UUID facilityUuid) {
        this.facilityUuid = facilityUuid;
    }

    public Long getOrganizationId() {
        return organizationId;
    }

    public void setOrganizationId(Long organizationId) {
        this.organizationId = organizationId;
    }

    public UUID getOrganizationUuid() {
        return organizationUuid;
    }

    public void setOrganizationUuid(UUID organizationUuid) {
        this.organizationUuid = organizationUuid;
    }

    public UUID getCentreUuid() {
        return centreUuid;
    }

    public void setCentreUuid(UUID centreUuid) {
        this.centreUuid = centreUuid;
    }

    public String getCentreName() {
        return centreName;
    }

    public void setCentreName(String centreName) {
        this.centreName = centreName;
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

    public String getFacilityType() {
        return facilityType;
    }

    public void setFacilityType(String facilityType) {
        this.facilityType = facilityType;
    }

    public String getSurfaceType() {
        return surfaceType;
    }

    public void setSurfaceType(String surfaceType) {
        this.surfaceType = surfaceType;
    }

    public String getFacilityNumber() {
        return facilityNumber;
    }

    public void setFacilityNumber(String facilityNumber) {
        this.facilityNumber = facilityNumber;
    }

    public String getLocationDetails() {
        return locationDetails;
    }

    public void setLocationDetails(String locationDetails) {
        this.locationDetails = locationDetails;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public BigDecimal getHourlyRate() {
        return hourlyRate;
    }

    public void setHourlyRate(BigDecimal hourlyRate) {
        this.hourlyRate = hourlyRate;
    }

    public String getOperatingHours() {
        return operatingHours;
    }

    public void setOperatingHours(String operatingHours) {
        this.operatingHours = operatingHours;
    }

    public Boolean getIsAvailableForBooking() {
        return isAvailableForBooking;
    }

    public void setIsAvailableForBooking(Boolean isAvailableForBooking) {
        this.isAvailableForBooking = isAvailableForBooking;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getActiveBatchesCount() {
        return activeBatchesCount;
    }

    public void setActiveBatchesCount(Integer activeBatchesCount) {
        this.activeBatchesCount = activeBatchesCount;
    }

    public Integer getEnrolledStudentsCount() {
        return enrolledStudentsCount;
    }

    public void setEnrolledStudentsCount(Integer enrolledStudentsCount) {
        this.enrolledStudentsCount = enrolledStudentsCount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
