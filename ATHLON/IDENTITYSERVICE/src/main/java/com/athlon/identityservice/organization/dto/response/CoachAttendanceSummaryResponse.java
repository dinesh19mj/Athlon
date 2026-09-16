package com.athlon.identityservice.organization.dto.response;

import java.time.LocalDate;
import java.util.UUID;

public class CoachAttendanceSummaryResponse {

    private UUID organizationUuid;
    private LocalDate date;
    private long totalTrainees;
    private long presentCount;
    private long absentCount;
    private long lateCount;
    private long excusedCount;
    private double attendancePercentage;

    public CoachAttendanceSummaryResponse() {
    }

    public UUID getOrganizationUuid() {
        return organizationUuid;
    }

    public void setOrganizationUuid(UUID organizationUuid) {
        this.organizationUuid = organizationUuid;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public long getTotalTrainees() {
        return totalTrainees;
    }

    public void setTotalTrainees(long totalTrainees) {
        this.totalTrainees = totalTrainees;
    }

    public long getPresentCount() {
        return presentCount;
    }

    public void setPresentCount(long presentCount) {
        this.presentCount = presentCount;
    }

    public long getAbsentCount() {
        return absentCount;
    }

    public void setAbsentCount(long absentCount) {
        this.absentCount = absentCount;
    }

    public long getLateCount() {
        return lateCount;
    }

    public void setLateCount(long lateCount) {
        this.lateCount = lateCount;
    }

    public long getExcusedCount() {
        return excusedCount;
    }

    public void setExcusedCount(long excusedCount) {
        this.excusedCount = excusedCount;
    }

    public double getAttendancePercentage() {
        return attendancePercentage;
    }

    public void setAttendancePercentage(double attendancePercentage) {
        this.attendancePercentage = attendancePercentage;
    }
}
