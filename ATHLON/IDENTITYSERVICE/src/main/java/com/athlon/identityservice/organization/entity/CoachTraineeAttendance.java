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
@Table(name = "coach_trainees_attendances")
public class CoachTraineeAttendance {

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

    @Column(name = "trainee_id")
    private Long traineeId;

    @Column(name = "trainee_uuid", nullable = false)
    private UUID traineeUuid;

    @Column(name = "trainee_name", length = 150)
    private String traineeName;

    @Column(name = "trainee_avatar", length = 255)
    private String traineeAvatar;

    @Column(name = "package_uuid")
    private UUID packageUuid;

    @Column(name = "package_name", length = 150)
    private String packageName;

    @Column(name = "attendance_date", nullable = false)
    private LocalDate attendanceDate;

    @Column(name = "status", nullable = false, length = 30)
    private String status = "PRESENT"; // PRESENT, ABSENT, LATE, EXCUSED

    @Column(name = "check_in_time")
    private LocalTime checkInTime;

    @Column(name = "check_out_time")
    private LocalTime checkOutTime;

    @Column(name = "focus_drills", length = 255)
    private String focusDrills;

    @Column(name = "performance_rating")
    private Integer performanceRating; // 1 to 5

    @Column(name = "coach_notes", length = 500)
    private String coachNotes;

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

    public CoachTraineeAttendance() {
    }

    @PrePersist
    public void prePersist() {
        if (this.attendanceUuid == null) {
            this.attendanceUuid = UUID.randomUUID();
        }
        if (this.attendanceDate == null) {
            this.attendanceDate = LocalDate.now();
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

    // Getters and Setters
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

    public Long getTraineeId() {
        return traineeId;
    }

    public void setTraineeId(Long traineeId) {
        this.traineeId = traineeId;
    }

    public UUID getTraineeUuid() {
        return traineeUuid;
    }

    public void setTraineeUuid(UUID traineeUuid) {
        this.traineeUuid = traineeUuid;
    }

    public String getTraineeName() {
        return traineeName;
    }

    public void setTraineeName(String traineeName) {
        this.traineeName = traineeName;
    }

    public String getTraineeAvatar() {
        return traineeAvatar;
    }

    public void setTraineeAvatar(String traineeAvatar) {
        this.traineeAvatar = traineeAvatar;
    }

    public UUID getPackageUuid() {
        return packageUuid;
    }

    public void setPackageUuid(UUID packageUuid) {
        this.packageUuid = packageUuid;
    }

    public String getPackageName() {
        return packageName;
    }

    public void setPackageName(String packageName) {
        this.packageName = packageName;
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

    public String getFocusDrills() {
        return focusDrills;
    }

    public void setFocusDrills(String focusDrills) {
        this.focusDrills = focusDrills;
    }

    public Integer getPerformanceRating() {
        return performanceRating;
    }

    public void setPerformanceRating(Integer performanceRating) {
        this.performanceRating = performanceRating;
    }

    public String getCoachNotes() {
        return coachNotes;
    }

    public void setCoachNotes(String coachNotes) {
        this.coachNotes = coachNotes;
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
        CoachTraineeAttendance that = (CoachTraineeAttendance) o;
        return Objects.equals(attendanceUuid, that.attendanceUuid);
    }

    @Override
    public int hashCode() {
        return Objects.hash(attendanceUuid);
    }
}
