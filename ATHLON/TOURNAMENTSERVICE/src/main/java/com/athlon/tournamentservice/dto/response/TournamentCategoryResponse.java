package com.athlon.tournamentservice.dto.response;

import com.athlon.tournamentservice.tournament.entity.TournamentCategory;

import java.util.UUID;

public class TournamentCategoryResponse {

	private Long categoryId;
    private UUID categoryUuid;
    private Long organizationId;
    private UUID organizationUuid;
    private String sportType;
    private String categoryName;
    private Integer isActive;

    public TournamentCategoryResponse() {
    }

    public static TournamentCategoryResponse fromEntity(TournamentCategory category) {

        if (category == null) {
            return null;
        }

        TournamentCategoryResponse response = new TournamentCategoryResponse();

        response.setCategoryId(category.getCategoryId());
        response.setCategoryUuid(category.getCategoryUuid());
        response.setOrganizationId(category.getOrganizationId());
        response.setOrganizationUuid(category.getOrganizationUuid());
        response.setSportType(category.getSportType());
        response.setCategoryName(category.getCategoryName());
        response.setIsActive(category.getIsActive());

        return response;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public UUID getCategoryUuid() {
        return categoryUuid;
    }

    public void setCategoryUuid(UUID categoryUuid) {
        this.categoryUuid = categoryUuid;
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

    public Integer getIsActive() {
        return isActive;
    }

    public void setIsActive(Integer isActive) {
        this.isActive = isActive;
    }
}

