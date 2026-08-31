package com.athlon.identityservice.organization.entity;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "academy_sport_configs")
public class AcademySportConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "sport_id", updatable = false, nullable = false)
    private Long sportId;

    @Column(name = "sport_uuid", updatable = false, nullable = false, unique = true)
    private UUID sportUuid;

    @Column(name = "organization_uuid", nullable = false)
    private UUID organizationUuid;

    @Column(name = "sport_name", nullable = false, length = 100)
    private String sportName; // Badminton, Cricket, Football, Tennis, Volleyball, etc.

    @Column(name = "code", length = 50)
    private String code; // BADMINTON, CRICKET, FOOTBALL

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "icon", length = 100)
    private String icon; // 🏸, 🏏, ⚽, 🎾, 🏐

    @Column(name = "applicable_facility_types", length = 255)
    private String applicableFacilityTypes; // BADMINTON_COURT,MULTI_COURT

    @Column(name = "age_categories", length = 255)
    private String ageCategories; // U9,U11,U13,U15,U17,U19,SENIOR,MASTERS

    @Column(name = "status", nullable = false, length = 30)
    private String status; // ACTIVE, INACTIVE

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (this.sportUuid == null) {
            this.sportUuid = UUID.randomUUID();
        }
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.updatedAt == null) {
            this.updatedAt = LocalDateTime.now();
        }
        if (this.status == null) {
            this.status = "ACTIVE";
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

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

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        AcademySportConfig that = (AcademySportConfig) o;
        return Objects.equals(sportUuid, that.sportUuid);
    }

    @Override
    public int hashCode() {
        return Objects.hash(sportUuid);
    }
}
