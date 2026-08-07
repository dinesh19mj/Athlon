package com.athlon.tournamentservice.tournament.entity;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "tournament_category")
public class TournamentCategory {

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "categoryid", updatable = false, nullable = false)
    private Long categoryId;

    @Column(name = "categoryuuid", updatable = false, nullable = false, unique = true)
    private UUID categoryUuid;

    @Column(name = "organizationid", nullable = false)
    private Long organizationId;

    @Column(name = "organizationuuid", nullable = false)
    private UUID organizationUuid;

    @Column(name = "sporttype", nullable = false)
    private String sportType;

    @Column(name = "categoryname", nullable = false)
    private String categoryName;

    @Column(name = "isactive")
    private Integer isActive = 1;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "updated_by")
    private Long updatedBy;

    public TournamentCategory() {
    }

    public TournamentCategory(Long organizationId,
                              UUID organizationUuid,
                              String sportType,
                              String categoryName,
                              Long createdBy) {
        this.organizationId = organizationId;
        this.organizationUuid = organizationUuid;
        this.sportType = sportType;
        this.categoryName = categoryName;
        this.createdBy = createdBy;
        this.isActive = 1;
    }

    @PrePersist
    public void prePersist() {
        if (categoryUuid == null) {
            categoryUuid = UUID.randomUUID();
        }

        if (isActive == null) {
            isActive = 1;
        }
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

    public boolean isActive() {
        return isActive != null && isActive == 1;
    }

    public void setActive(boolean active) {
        this.isActive = active ? 1 : 0;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public Long getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(Long createdBy) {
        this.createdBy = createdBy;
    }

    public Long getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(Long updatedBy) {
        this.updatedBy = updatedBy;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof TournamentCategory)) return false;
        TournamentCategory that = (TournamentCategory) o;
        return Objects.equals(categoryId, that.categoryId) &&
               Objects.equals(categoryUuid, that.categoryUuid);
    }

    @Override
    public int hashCode() {
        return Objects.hash(categoryId, categoryUuid);
    }

    @Override
    public String toString() {
        return "TournamentCategory{" +
                "categoryId=" + categoryId +
                ", categoryUuid=" + categoryUuid +
                ", organizationId=" + organizationId +
                ", organizationUuid=" + organizationUuid +
                ", sportType='" + sportType + '\'' +
                ", categoryName='" + categoryName + '\'' +
                ", isActive=" + isActive +
                '}';
    }
}

