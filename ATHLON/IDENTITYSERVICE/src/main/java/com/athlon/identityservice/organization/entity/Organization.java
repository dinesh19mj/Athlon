package com.athlon.identityservice.organization.entity;

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
@Table(name = "organizations")
public class Organization {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "organizationid", updatable = false, nullable = false)
    private Long organizationId;

    @Column(name = "organizationuuid", updatable = false, nullable = false, unique = true)
    private UUID organizationUuid;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "type", nullable = false, length = 100)
    private String type;

    @Column(name = "userid")
    private Long userId;

    @Column(name = "useruuid")
    private UUID userUuid;

    @Column(name = "description")
    private String description;

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

    public Organization() {
    }

    public Organization(String name,
                        String description,
                        String type,
                        Long userId,
                        UUID userUuid,
                        Long createdBy) {

        this.name = name;
        this.description = description;
        this.type = type != null ? type : "CLUB";
        this.userId = userId;
        this.userUuid = userUuid;
        this.createdBy = createdBy;
        this.isActive = 1;
    }

    @PrePersist
    public void prePersist() {

        if (organizationUuid == null) {
            organizationUuid = UUID.randomUUID();
        }

        if (isActive == null) {
            isActive = 1;
        }
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

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public UUID getUserUuid() {
        return userUuid;
    }

    public void setUserUuid(UUID userUuid) {
        this.userUuid = userUuid;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
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
        if (!(o instanceof Organization)) return false;
        Organization that = (Organization) o;
        return Objects.equals(organizationId, that.organizationId)
                && Objects.equals(organizationUuid, that.organizationUuid);
    }

    @Override
    public int hashCode() {
        return Objects.hash(organizationId, organizationUuid);
    }

    @Override
    public String toString() {
        return "Organization{" +
                "organizationId=" + organizationId +
                ", organizationUuid=" + organizationUuid +
                ", name='" + name + '\'' +
                ", type='" + type + '\'' +
                ", userId=" + userId +
                ", userUuid=" + userUuid +
                ", description='" + description + '\'' +
                ", isActive=" + isActive +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                ", createdBy=" + createdBy +
                ", updatedBy=" + updatedBy +
                '}';
    }
}