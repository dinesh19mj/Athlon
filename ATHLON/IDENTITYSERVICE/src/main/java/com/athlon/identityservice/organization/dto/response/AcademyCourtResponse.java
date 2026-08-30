package com.athlon.identityservice.organization.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public class AcademyCourtResponse {

    private Long courtId;
    private UUID courtUuid;
    private Long organizationId;
    private UUID organizationUuid;
    private String name;
    private String sportType;
    private String surfaceType;
    private String courtNumber;
    private String location;
    private BigDecimal hourlyRate;
    private String status;
    private Integer activeBatchesCount = 0;
    private Integer enrolledStudentsCount = 0;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Long getCourtId() {
        return courtId;
    }

    public void setCourtId(Long courtId) {
        this.courtId = courtId;
    }

    public UUID getCourtUuid() {
        return courtUuid;
    }

    public void setCourtUuid(UUID courtUuid) {
        this.courtUuid = courtUuid;
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
