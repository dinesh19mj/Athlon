package com.athlon.identityservice.organization.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

public class AcademyAttendanceResponse {

    private UUID attendanceUuid;
    private Long attendanceId;
    private UUID organizationUuid;
    private Long organizationId;
    private String attendeeType; // STUDENT, COACH, STAFF
    private UUID attendeeUuid;
    private String attendeeName;
    private String attendeePhoto;
    private String attendeePhone;
    private UUID batchUuid;
    private String batchName;
    private UUID centreUuid;
    private String centreName;
    private LocalDate attendanceDate;
    private String status; // PRESENT, ABSENT, LATE, EXCUSED
    private LocalTime checkInTime;
    private LocalTime checkOutTime;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public AcademyAttendanceResponse() {
    }

    public UUID getAttendanceUuid() {
        return attendanceUuid;
    }

    public void setAttendanceUuid(UUID attendanceUuid) {
        this.attendanceUuid = attendanceUuid;
    }

    public Long getAttendanceId() {
        return attendanceId;
    }

    public void setAttendanceId(Long attendanceId) {
        this.attendanceId = attendanceId;
    }

    public UUID getOrganizationUuid() {
        return organizationUuid;
    }

    public void setOrganizationUuid(UUID organizationUuid) {
        this.organizationUuid = organizationUuid;
    }

    public Long getOrganizationId() {
        return organizationId;
    }

    public void setOrganizationId(Long organizationId) {
        this.organizationId = organizationId;
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

    public String getAttendeePhoto() {
        return attendeePhoto;
    }

    public void setAttendeePhoto(String attendeePhoto) {
        this.attendeePhoto = attendeePhoto;
    }

    public String getAttendeePhone() {
        return attendeePhone;
    }

    public void setAttendeePhone(String attendeePhone) {
        this.attendeePhone = attendeePhone;
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

    public String getCentreName() {
        return centreName;
    }

    public void setCentreName(String centreName) {
        this.centreName = centreName;
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
}
