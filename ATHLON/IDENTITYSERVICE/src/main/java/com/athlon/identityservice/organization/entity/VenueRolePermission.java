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
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "venue_role_permissions")
public class VenueRolePermission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "permission_id", updatable = false, nullable = false)
    private Long permissionId;

    @Column(name = "permission_uuid", updatable = false, nullable = false, unique = true)
    private UUID permissionUuid;

    @Column(name = "organization_uuid", nullable = false)
    private UUID organizationUuid;

    @Column(name = "role", nullable = false, length = 100)
    private String role; // ADMIN, VENUE_MANAGER, FRONT_DESK, COURT_SUPERVISOR, FINANCE_MANAGER, MAINTENANCE_STAFF

    @Column(name = "module_id", nullable = false, length = 50)
    private String moduleId; // courts, calendar, bookings, blocks, pricing, finances, inventory, staff, settings

    @Column(name = "access_level", nullable = false, length = 20)
    private String accessLevel = "VIEW"; // MANAGE, VIEW, NONE

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (this.permissionUuid == null) {
            this.permissionUuid = UUID.randomUUID();
        }
        if (this.accessLevel == null) {
            this.accessLevel = "VIEW";
        }
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public VenueRolePermission() {
    }

    public VenueRolePermission(UUID organizationUuid, String role, String moduleId, String accessLevel) {
        this.organizationUuid = organizationUuid;
        this.role = role != null ? role.toUpperCase() : "FRONT_DESK";
        this.moduleId = moduleId != null ? moduleId.toLowerCase() : "courts";
        this.accessLevel = accessLevel != null ? accessLevel.toUpperCase() : "VIEW";
    }

    public Long getPermissionId() {
        return permissionId;
    }

    public void setPermissionId(Long permissionId) {
        this.permissionId = permissionId;
    }

    public UUID getPermissionUuid() {
        return permissionUuid;
    }

    public void setPermissionUuid(UUID permissionUuid) {
        this.permissionUuid = permissionUuid;
    }

    public UUID getOrganizationUuid() {
        return organizationUuid;
    }

    public void setOrganizationUuid(UUID organizationUuid) {
        this.organizationUuid = organizationUuid;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role != null ? role.toUpperCase() : "FRONT_DESK";
    }

    public String getModuleId() {
        return moduleId;
    }

    public void setModuleId(String moduleId) {
        this.moduleId = moduleId != null ? moduleId.toLowerCase() : "courts";
    }

    public String getAccessLevel() {
        return accessLevel;
    }

    public void setAccessLevel(String accessLevel) {
        this.accessLevel = accessLevel != null ? accessLevel.toUpperCase() : "VIEW";
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
        VenueRolePermission that = (VenueRolePermission) o;
        return Objects.equals(organizationUuid, that.organizationUuid) &&
                Objects.equals(role, that.role) &&
                Objects.equals(moduleId, that.moduleId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(organizationUuid, role, moduleId);
    }
}
