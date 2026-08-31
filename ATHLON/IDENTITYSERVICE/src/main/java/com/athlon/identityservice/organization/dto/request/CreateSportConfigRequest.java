package com.athlon.identityservice.organization.dto.request;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CreateSportConfigRequest {

    @NotNull(message = "organizationUuid is required")
    private UUID organizationUuid;

    @NotBlank(message = "Sport name is required")
    @Size(max = 100, message = "Sport name cannot exceed 100 characters")
    private String sportName;

    private String code;
    private String description;
    private String icon;
    private String applicableFacilityTypes;
    private String ageCategories;
    private String status = "ACTIVE";

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
}
