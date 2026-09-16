package com.athlon.identityservice.organization.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

public class CoachAttendanceResponse {

    private Long attendanceId;
    private UUID attendanceUuid;
    private Long organizationId;
    private UUID organizationUuid;
    private Long traineeId;
    private UUID traineeUuid;
    private String traineeName;
    private String traineeAvatar;
    private UUID packageUuid;
    private String packageName;
    private LocalDate attendanceDate;
    private String status; // PRESENT, ABSENT, LATE, EXCUSED
    private LocalTime checkInTime;
    private LocalTime checkOutTime;
    private String focusDrills;
    private Integer performanceRating;
    private String coachNotes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public CoachAttendanceResponse() {
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
}
