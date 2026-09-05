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
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "academy_attendance")
public class AcademyAttendance {

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

    @Column(name = "attendee_type", nullable = false, length = 30)
    private String attendeeType; // STUDENT, COACH, STAFF

    @Column(name = "attendee_uuid", nullable = false)
    private UUID attendeeUuid; // studentUuid or staffUuid

    @Column(name = "attendee_name", length = 150)
    private String attendeeName;

    @Column(name = "batch_uuid")
    private UUID batchUuid;

    @Column(name = "batch_name", length = 150)
    private String batchName;

    @Column(name = "centre_uuid")
    private UUID centreUuid;

    @Column(name = "attendance_date", nullable = false)
    private LocalDate attendanceDate;

    @Column(name = "status", nullable = false, length = 30)
    private String status; // PRESENT, ABSENT, LATE, EXCUSED

    @Column(name = "check_in_time")
    private LocalTime checkInTime;

    @Column(name = "check_out_time")
    private LocalTime checkOutTime;

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

    public AcademyAttendance() {
    }

    public AcademyAttendance(Long organizationId,
                             UUID organizationUuid,
                             String attendeeType,
                             UUID attendeeUuid,
                             String attendeeName,
                             UUID batchUuid,
                             String batchName,
                             UUID centreUuid,
                             LocalDate attendanceDate,
                             String status,
                             LocalTime checkInTime,
                             String notes,
                             Long createdBy) {
        this.organizationId = organizationId;
        this.organizationUuid = organizationUuid;
        this.attendeeType = attendeeType;
        this.attendeeUuid = attendeeUuid;
        this.attendeeName = attendeeName;
        this.batchUuid = batchUuid;
        this.batchName = batchName;
        this.centreUuid = centreUuid;
        this.attendanceDate = attendanceDate;
        this.status = status != null ? status : "PRESENT";
        this.checkInTime = checkInTime;
        this.notes = notes;
        this.createdBy = createdBy;
    }

    @PrePersist
    public void prePersist() {
        if (this.attendanceUuid == null) {
            this.attendanceUuid = UUID.randomUUID();
        }
        if (this.status == null) {
            this.status = "PRESENT";
        }
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
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

    public String getAttendeeType() {
        return attendeeType;
    }

    public void setAttendeeType(String attendeeType) {
        this.attendeeType = attendeeType;
    }

    public UUID getAttendeeUuid() {
        return attendeeUuid;
    }

    public void setAttendeeUuid(UUID attendeeUuid) {
        this.attendeeUuid = attendeeUuid;
    }

    public String getAttendeeName() {
        return attendeeName;
    }

    public void setAttendeeName(String attendeeName) {
        this.attendeeName = attendeeName;
    }

    public UUID getBatchUuid() {
        return batchUuid;
    }

    public void setBatchUuid(UUID batchUuid) {
        this.batchUuid = batchUuid;
    }

    public String getBatchName() {
        return batchName;
    }

    public void setBatchName(String batchName) {
        this.batchName = batchName;
    }

    public UUID getCentreUuid() {
        return centreUuid;
    }

    public void setCentreUuid(UUID centreUuid) {
        this.centreUuid = centreUuid;
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

    public LocalTime getCheckOutTime() {
        return checkOutTime;
    }

    public void setCheckOutTime(LocalTime checkOutTime) {
        this.checkOutTime = checkOutTime;
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
        if (!(o instanceof AcademyAttendance)) return false;
        AcademyAttendance that = (AcademyAttendance) o;
        return Objects.equals(attendanceId, that.attendanceId) && Objects.equals(attendanceUuid, that.attendanceUuid);
    }

    @Override
    public int hashCode() {
        return Objects.hash(attendanceId, attendanceUuid);
    }
}
