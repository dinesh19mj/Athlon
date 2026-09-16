package com.athlon.identityservice.organization.dto.request;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public class BulkCoachAttendanceRequest {

    @NotNull(message = "Organization UUID is required")
    private UUID organizationUuid;

    @NotNull(message = "Attendance date is required")
    private LocalDate attendanceDate;

    @NotEmpty(message = "Records list cannot be empty")
    private List<MarkCoachAttendanceRequest> records;

    public BulkCoachAttendanceRequest() {
    }

    public UUID getOrganizationUuid() {
        return organizationUuid;
    }

    public void setOrganizationUuid(UUID organizationUuid) {
        this.organizationUuid = organizationUuid;
    }

    public LocalDate getAttendanceDate() {
        return attendanceDate;
    }

    public void setAttendanceDate(LocalDate attendanceDate) {
        this.attendanceDate = attendanceDate;
    }

    public List<MarkCoachAttendanceRequest> getRecords() {
        return records;
    }

    public void setRecords(List<MarkCoachAttendanceRequest> records) {
        this.records = records;
    }
}
