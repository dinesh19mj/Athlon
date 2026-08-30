package com.athlon.identityservice.organization.dto.response;

import java.util.Map;

public class AcademySummaryResponse {

    private long totalStudents;
    private long activeStudents;
    private long totalBatches;
    private long paidCount;
    private long pendingCount;
    private long overdueCount;
    private int feeCollectionPercentage;
    private Map<String, Long> studentsByLevel;
    private Map<String, Long> studentsByBatch;

    public long getTotalStudents() {
        return totalStudents;
    }

    public void setTotalStudents(long totalStudents) {
        this.totalStudents = totalStudents;
    }

    public long getActiveStudents() {
        return activeStudents;
    }

    public void setActiveStudents(long activeStudents) {
        this.activeStudents = activeStudents;
    }

    public long getTotalBatches() {
        return totalBatches;
    }

    public void setTotalBatches(long totalBatches) {
        this.totalBatches = totalBatches;
    }

    public long getPaidCount() {
        return paidCount;
    }

    public void setPaidCount(long paidCount) {
        this.paidCount = paidCount;
    }

    public long getPendingCount() {
        return pendingCount;
    }

    public void setPendingCount(long pendingCount) {
        this.pendingCount = pendingCount;
    }

    public long getOverdueCount() {
        return overdueCount;
    }

    public void setOverdueCount(long overdueCount) {
        this.overdueCount = overdueCount;
    }

    public int getFeeCollectionPercentage() {
        return feeCollectionPercentage;
    }

    public void setFeeCollectionPercentage(int feeCollectionPercentage) {
        this.feeCollectionPercentage = feeCollectionPercentage;
    }

    public Map<String, Long> getStudentsByLevel() {
        return studentsByLevel;
    }

    public void setStudentsByLevel(Map<String, Long> studentsByLevel) {
        this.studentsByLevel = studentsByLevel;
    }

    public Map<String, Long> getStudentsByBatch() {
        return studentsByBatch;
    }

    public void setStudentsByBatch(Map<String, Long> studentsByBatch) {
        this.studentsByBatch = studentsByBatch;
    }
}
