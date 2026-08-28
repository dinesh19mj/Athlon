package com.athlon.identityservice.organization.dto.response;

import java.time.LocalDate;

public class AttendanceSummaryResponse {

    private LocalDate date;
    private int totalMembers;
    private int presentCount;
    private int absentCount;
    private int leaveCount;
    private int unmarkedCount;
    private double attendancePercentage;

    public AttendanceSummaryResponse() {
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public int getTotalMembers() {
        return totalMembers;
    }

    public void setTotalMembers(int totalMembers) {
        this.totalMembers = totalMembers;
    }

    public int getPresentCount() {
        return presentCount;
    }

    public void setPresentCount(int presentCount) {
        this.presentCount = presentCount;
    }

    public int getAbsentCount() {
        return absentCount;
    }

    public void setAbsentCount(int absentCount) {
        this.absentCount = absentCount;
    }

    public int getLeaveCount() {
        return leaveCount;
    }

    public void setLeaveCount(int leaveCount) {
        this.leaveCount = leaveCount;
    }

    public int getUnmarkedCount() {
        return unmarkedCount;
    }

    public void setUnmarkedCount(int unmarkedCount) {
        this.unmarkedCount = unmarkedCount;
    }

    public double getAttendancePercentage() {
        return attendancePercentage;
    }

    public void setAttendancePercentage(double attendancePercentage) {
        this.attendancePercentage = attendancePercentage;
    }
}
