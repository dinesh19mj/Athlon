package com.athlon.tournamentservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public class TournamentCategoryCreateRequest {

	@NotNull(message = "Organization Id is required")
    private Long organizationId;

    @NotNull(message = "Organization UUID is required")
    private UUID organizationUuid;

    @NotBlank(message = "Sport Type is required")
    private String sportType;

    @NotBlank(message = "Category Name is required")
    private String categoryName;

    private Long createdBy;

    public TournamentCategoryCreateRequest() {
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

    public String getSportType() {
        return sportType;
    }

    public void setSportType(String sportType) {
        this.sportType = sportType;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public Long getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(Long createdBy) {
        this.createdBy = createdBy;
    }
}

