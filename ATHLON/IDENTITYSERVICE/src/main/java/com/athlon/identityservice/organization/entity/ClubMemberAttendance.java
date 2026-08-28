package com.athlon.identityservice.organization.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
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
@Table(name = "club_members_attendance")
public class ClubMemberAttendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "attendance_id", updatable = false, nullable = false)
    private Long attendanceId;

    @Column(name = "attendance_uuid", updatable = false, nullable = false, unique = true)
    private UUID attendanceUuid;

    @Column(name = "organization_id")
    private Long organizationId;

    @Column(name = "organization_uuid", nullable = false)
    private UUID organizationUuid;

    @Column(name = "organization_member_id")
    private Long organizationMemberId;

    @Column(name = "organization_member_uuid", nullable = false)
    private UUID organizationMemberUuid;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "user_uuid")
    private UUID userUuid;

    @Column(name = "attendance_date", nullable = false)
    private LocalDate attendanceDate;

    @Column(name = "status", nullable = false, length = 30)
    private String status; // PRESENT, ABSENT, LEAVE

    @Column(name = "check_in_time")
    private LocalTime checkInTime;

    @Column(name = "notes", length = 255)
    private String notes;

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

    @PrePersist
    public void prePersist() {
        if (this.attendanceUuid == null) {
            this.attendanceUuid = UUID.randomUUID();
        }
        if (this.status == null) {
            this.status = "PRESENT";
        }
    }

    public ClubMemberAttendance() {
    }

    public Long getAttendanceId() {
        return attendanceId;
    }

    public void setAttendanceId(Long attendanceId) {
        this.attendanceId = attendanceId;
    }

    public UUID getAttendanceUuid() {
        return attendanceUuid;
    }

    public void setAttendanceUuid(UUID attendanceUuid) {
        this.attendanceUuid = attendanceUuid;
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

    public Long getOrganizationMemberId() {
        return organizationMemberId;
    }

    public void setOrganizationMemberId(Long organizationMemberId) {
        this.organizationMemberId = organizationMemberId;
    }

    public UUID getOrganizationMemberUuid() {
        return organizationMemberUuid;
    }

    public void setOrganizationMemberUuid(UUID organizationMemberUuid) {
        this.organizationMemberUuid = organizationMemberUuid;
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

    public LocalDate getAttendanceDate() {
        return attendanceDate;
    }

    public void setAttendanceDate(LocalDate attendanceDate) {
        this.attendanceDate = attendanceDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalTime getCheckInTime() {
        return checkInTime;
    }

    public void setCheckInTime(LocalTime checkInTime) {
        this.checkInTime = checkInTime;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
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
        ClubMemberAttendance that = (ClubMemberAttendance) o;
        return Objects.equals(attendanceUuid, that.attendanceUuid);
    }

    @Override
    public int hashCode() {
        return Objects.hash(attendanceUuid);
    }
}
