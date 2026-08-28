package com.athlon.identityservice.organization.dto.request;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public class MarkAttendanceRequest {

    private UUID organizationUuid;
    private UUID organizationMemberUuid;
    private LocalDate attendanceDate;
    private String status; // PRESENT, ABSENT, LEAVE
    private LocalTime checkInTime;
    private String notes;

    public MarkAttendanceRequest() {
    }

    public UUID getOrganizationUuid() {
        return organizationUuid;
    }

    public void setOrganizationUuid(UUID organizationUuid) {
        this.organizationUuid = organizationUuid;
    }

    public UUID getOrganizationMemberUuid() {
        return organizationMemberUuid;
    }

    public void setOrganizationMemberUuid(UUID organizationMemberUuid) {
        this.organizationMemberUuid = organizationMemberUuid;
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
}
