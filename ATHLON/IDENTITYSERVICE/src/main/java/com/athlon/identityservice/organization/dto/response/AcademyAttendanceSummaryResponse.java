package com.athlon.identityservice.organization.dto.response;

import java.time.LocalDate;
import java.util.UUID;

public class AcademyAttendanceSummaryResponse {

    private UUID organizationUuid;
    private LocalDate attendanceDate;

    // Overall
    private int totalHeadcount;
    private int totalPresent;
    private int totalAbsent;
    private int totalLate;
    private int totalExcused;
    private double overallPercentage;

    // Students breakdown
    private int studentsTotal;
    private int studentsPresent;
    private int studentsAbsent;
    private double studentsPercentage;

    // Coaches breakdown
    private int coachesTotal;
    private int coachesPresent;
    private int coachesAbsent;
    private double coachesPercentage;

    // Operational Staff breakdown
    private int staffTotal;
    private int staffPresent;
    private int staffAbsent;
    private double staffPercentage;

    public AcademyAttendanceSummaryResponse() {
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

    public int getTotalHeadcount() {
        return totalHeadcount;
    }

    public void setTotalHeadcount(int totalHeadcount) {
        this.totalHeadcount = totalHeadcount;
    }

    public int getTotalPresent() {
        return totalPresent;
    }

    public void setTotalPresent(int totalPresent) {
        this.totalPresent = totalPresent;
    }

    public int getTotalAbsent() {
        return totalAbsent;
    }

    public void setTotalAbsent(int totalAbsent) {
        this.totalAbsent = totalAbsent;
    }

    public int getTotalLate() {
        return totalLate;
    }

    public void setTotalLate(int totalLate) {
        this.totalLate = totalLate;
    }

    public int getTotalExcused() {
        return totalExcused;
    }

    public void setTotalExcused(int totalExcused) {
        this.totalExcused = totalExcused;
    }

    public double getOverallPercentage() {
        return overallPercentage;
    }

    public void setOverallPercentage(double overallPercentage) {
        this.overallPercentage = overallPercentage;
    }

    public int getStudentsTotal() {
        return studentsTotal;
    }

    public void setStudentsTotal(int studentsTotal) {
        this.studentsTotal = studentsTotal;
    }

    public int getStudentsPresent() {
        return studentsPresent;
    }

    public void setStudentsPresent(int studentsPresent) {
        this.studentsPresent = studentsPresent;
    }

    public int getStudentsAbsent() {
        return studentsAbsent;
    }

    public void setStudentsAbsent(int studentsAbsent) {
        this.studentsAbsent = studentsAbsent;
    }

    public double getStudentsPercentage() {
        return studentsPercentage;
    }

    public void setStudentsPercentage(double studentsPercentage) {
        this.studentsPercentage = studentsPercentage;
    }

    public int getCoachesTotal() {
        return coachesTotal;
    }

    public void setCoachesTotal(int coachesTotal) {
        this.coachesTotal = coachesTotal;
    }

    public int getCoachesPresent() {
        return coachesPresent;
    }

    public void setCoachesPresent(int coachesPresent) {
        this.coachesPresent = coachesPresent;
    }

    public int getCoachesAbsent() {
        return coachesAbsent;
    }

    public void setCoachesAbsent(int coachesAbsent) {
        this.coachesAbsent = coachesAbsent;
    }

    public double getCoachesPercentage() {
        return coachesPercentage;
    }

    public void setCoachesPercentage(double coachesPercentage) {
        this.coachesPercentage = coachesPercentage;
    }

    public int getStaffTotal() {
        return staffTotal;
    }

    public void setStaffTotal(int staffTotal) {
        this.staffTotal = staffTotal;
    }

    public int getStaffPresent() {
        return staffPresent;
    }

    public void setStaffPresent(int staffPresent) {
        this.staffPresent = staffPresent;
    }

    public int getStaffAbsent() {
        return staffAbsent;
    }

    public void setStaffAbsent(int staffAbsent) {
        this.staffAbsent = staffAbsent;
    }

    public double getStaffPercentage() {
        return staffPercentage;
    }

    public void setStaffPercentage(double staffPercentage) {
        this.staffPercentage = staffPercentage;
    }
}
