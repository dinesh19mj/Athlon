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
@Table(name = "academy_staff")
public class AcademyStaff {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "staff_id", updatable = false, nullable = false)
    private Long staffId;

    @Column(name = "staff_uuid", updatable = false, nullable = false, unique = true)
    private UUID staffUuid;

    @Column(name = "organization_id")
    private Long organizationId;

    @Column(name = "organization_uuid", nullable = false)
    private UUID organizationUuid;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "user_uuid")
    private UUID userUuid;

    @Column(name = "centre_id")
    private Long centreId;

    @Column(name = "centre_uuid")
    private UUID centreUuid;

    @Column(name = "staff_type", nullable = false, length = 50)
    private String staffType = "COACH"; // COACH, OPERATIONAL, STAFF

    @Column(name = "role", nullable = false, length = 100)
    private String role; // HEAD_COACH, SENIOR_COACH, COACH, ASSISTANT_COACH, FITNESS_TRAINER, MANAGER, RECEPTIONIST, OPERATIONS, PHYSIOTHERAPIST, ACCOUNTANT, INVENTORY_MANAGER, SUPPORT_STAFF, STAFF

    @Column(name = "sport_type", length = 100)
    private String sportType; // Badminton, Tennis, Cricket, etc.

    @Column(name = "full_name", length = 150)
    private String fullName;

    @Column(name = "phone", length = 30)
    private String phone;

    @Column(name = "email", length = 150)
    private String email;

    @Column(name = "photo", length = 255)
    private String photo;

    @Column(name = "is_active")
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

    public AcademyStaff() {
    }

    public AcademyStaff(Long organizationId,
                        UUID organizationUuid,
                        Long userId,
                        UUID userUuid,
                        String staffType,
                        String role,
                        String sportType,
                        Long createdBy) {
        this.organizationId = organizationId;
        this.organizationUuid = organizationUuid;
        this.userId = userId;
        this.userUuid = userUuid;
        this.staffType = staffType != null ? staffType : "COACH";
        this.role = role != null ? role : "COACH";
        this.sportType = sportType;
        this.createdBy = createdBy;
        this.isActive = 1;
    }

    @PrePersist
    public void prePersist() {
        if (this.staffUuid == null) {
            this.staffUuid = UUID.randomUUID();
        }
        if (this.isActive == null) {
            this.isActive = 1;
        }
        if (this.staffType == null) {
            this.staffType = isCoachRole(this.role) ? "COACH" : "OPERATIONAL";
        }
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public static boolean isCoachRole(String role) {
        if (role == null) return true;
        String r = role.toUpperCase();
        return r.contains("COACH") || r.contains("TRAINER");
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

    public Long getCentreId() {
        return centreId;
    }

    public void setCentreId(Long centreId) {
        this.centreId = centreId;
    }

    public UUID getCentreUuid() {
        return centreUuid;
    }

    public void setCentreUuid(UUID centreUuid) {
        this.centreUuid = centreUuid;
    }

    public String getStaffType() {
        return staffType;
    }

    public void setStaffType(String staffType) {
        this.staffType = staffType;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getSportType() {
        return sportType;
    }

    public void setSportType(String sportType) {
        this.sportType = sportType;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhoto() {
        return photo;
    }

    public void setPhoto(String photo) {
        this.photo = photo;
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
        if (!(o instanceof AcademyStaff)) return false;
        AcademyStaff that = (AcademyStaff) o;
        return Objects.equals(staffId, that.staffId) && Objects.equals(staffUuid, that.staffUuid);
    }

    @Override
    public int hashCode() {
        return Objects.hash(staffId, staffUuid);
    }

    @Override
    public String toString() {
        return "AcademyStaff{" +
                "staffId=" + staffId +
                ", staffUuid=" + staffUuid +
                ", organizationUuid=" + organizationUuid +
                ", staffType='" + staffType + '\'' +
                ", role='" + role + '\'' +
                ", sportType='" + sportType + '\'' +
                ", fullName='" + fullName + '\'' +
                ", phone='" + phone + '\'' +
                '}';
    }
}
