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
@Table(name = "venue_staff")
public class VenueStaff {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "staff_id", updatable = false, nullable = false)
    private Long staffId;

    @Column(name = "staff_uuid", updatable = false, nullable = false, unique = true)
    private UUID staffUuid;

    @Column(name = "organization_id", nullable = false)
    private Long organizationId;

    @Column(name = "organization_uuid", nullable = false)
    private UUID organizationUuid;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "user_uuid", nullable = false)
    private UUID userUuid;

    @Column(name = "role", nullable = false, length = 100)
    private String role; // ADMIN, VENUE_MANAGER, FRONT_DESK, COURT_SUPERVISOR, FINANCE_MANAGER, MAINTENANCE_STAFF

    @Column(name = "designation", length = 150)
    private String designation; // Custom title e.g. "Lead Turf Supervisor", "Senior Front Desk Executive"

    @Column(name = "assigned_facilities", length = 500)
    private String assignedFacilities; // Optional specific facility/court IDs or "ALL"

    @Column(name = "notes", length = 500)
    private String notes;

    @Column(name = "is_active", nullable = false)
    private Integer isActive = 1;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "updated_by")
    private Long updatedBy;

    @PrePersist
    protected void onCreate() {
        if (this.staffUuid == null) {
            this.staffUuid = UUID.randomUUID();
        }
        if (this.isActive == null) {
            this.isActive = 1;
        }
    }

    public VenueStaff() {
    }

    public VenueStaff(Long organizationId, UUID organizationUuid, Long userId, UUID userUuid, String role, String designation, Long createdBy) {
        this.organizationId = organizationId;
        this.organizationUuid = organizationUuid;
        this.userId = userId;
        this.userUuid = userUuid;
        this.role = role != null ? role.toUpperCase() : "FRONT_DESK";
        this.designation = designation;
        this.createdBy = createdBy;
        this.isActive = 1;
    }

    public Long getStaffId() {
        return staffId;
    }

    public void setStaffId(Long staffId) {
        this.staffId = staffId;
    }

    public UUID getStaffUuid() {
        return staffUuid;
    }

    public void setStaffUuid(UUID staffUuid) {
        this.staffUuid = staffUuid;
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

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role != null ? role.toUpperCase() : "FRONT_DESK";
    }

    public String getDesignation() {
        return designation;
    }

    public void setDesignation(String designation) {
        this.designation = designation;
    }

    public String getAssignedFacilities() {
        return assignedFacilities;
    }

    public void setAssignedFacilities(String assignedFacilities) {
        this.assignedFacilities = assignedFacilities;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Integer getIsActive() {
        return isActive;
    }

    public void setIsActive(Integer isActive) {
        this.isActive = isActive;
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
        if (o == null || getClass() != o.getClass()) return false;
        VenueStaff that = (VenueStaff) o;
        return Objects.equals(staffUuid, that.staffUuid);
    }

    @Override
    public int hashCode() {
        return Objects.hash(staffUuid);
    }
}
