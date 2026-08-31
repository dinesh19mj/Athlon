package com.athlon.identityservice.organization.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

public class AcademySportConfigResponse {

    private Long sportId;
    private UUID sportUuid;
    private UUID organizationUuid;
    private String sportName;
    private String code;
    private String description;
    private String icon;
    private String applicableFacilityTypes;
    private String ageCategories;
    private String status;

    private Integer activeBatchesCount = 0;
    private Integer enrolledStudentsCount = 0;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Long getSportId() {
        return sportId;
    }

    public void setSportId(Long sportId) {
        this.sportId = sportId;
    }

    public UUID getSportUuid() {
        return sportUuid;
    }

    public void setSportUuid(UUID sportUuid) {
        this.sportUuid = sportUuid;
    }

    public UUID getOrganizationUuid() {
        return organizationUuid;
    }

    public void setOrganizationUuid(UUID organizationUuid) {
        this.organizationUuid = organizationUuid;
    }

    public String getSportName() {
        return sportName;
    }

    public void setSportName(String sportName) {
        this.sportName = sportName;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public String getApplicableFacilityTypes() {
        return applicableFacilityTypes;
    }

    public void setApplicableFacilityTypes(String applicableFacilityTypes) {
        this.applicableFacilityTypes = applicableFacilityTypes;
    }

    public String getAgeCategories() {
        return ageCategories;
    }

    public void setAgeCategories(String ageCategories) {
        this.ageCategories = ageCategories;
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
