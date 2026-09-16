package com.athlon.identityservice.organization.dto.response;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public class CoachDashboardSummaryResponse {

    private UUID organizationUuid;
    private Long activeTraineesCount;
    private Long totalSessionsToday;
    private Long completedSessionsToday;
    private BigDecimal monthlyRevenuePaid;
    private BigDecimal monthlyRevenuePending;
    private BigDecimal projectedMonthlyRevenue;
    private List<CoachScheduleResponse> todaySchedules;
    private List<CoachTraineeResponse> recentTrainees;
    private List<CoachFeePackageResponse> activePackages;

    public CoachDashboardSummaryResponse() {
    }

    public UUID getOrganizationUuid() {
        return organizationUuid;
    }

    public void setOrganizationUuid(UUID organizationUuid) {
        this.organizationUuid = organizationUuid;
    }

    public Long getActiveTraineesCount() {
        return activeTraineesCount;
    }

    public void setActiveTraineesCount(Long activeTraineesCount) {
        this.activeTraineesCount = activeTraineesCount;
    }

    public Long getTotalSessionsToday() {
        return totalSessionsToday;
    }

    public void setTotalSessionsToday(Long totalSessionsToday) {
        this.totalSessionsToday = totalSessionsToday;
    }

    public Long getCompletedSessionsToday() {
        return completedSessionsToday;
    }

    public void setCompletedSessionsToday(Long completedSessionsToday) {
        this.completedSessionsToday = completedSessionsToday;
    }

    public BigDecimal getMonthlyRevenuePaid() {
        return monthlyRevenuePaid;
    }

    public void setMonthlyRevenuePaid(BigDecimal monthlyRevenuePaid) {
        this.monthlyRevenuePaid = monthlyRevenuePaid;
    }

    public BigDecimal getMonthlyRevenuePending() {
        return monthlyRevenuePending;
    }

    public void setMonthlyRevenuePending(BigDecimal monthlyRevenuePending) {
        this.monthlyRevenuePending = monthlyRevenuePending;
    }

    public BigDecimal getProjectedMonthlyRevenue() {
        return projectedMonthlyRevenue;
    }

    public void setProjectedMonthlyRevenue(BigDecimal projectedMonthlyRevenue) {
        this.projectedMonthlyRevenue = projectedMonthlyRevenue;
    }

    public List<CoachScheduleResponse> getTodaySchedules() {
        return todaySchedules;
    }

    public void setTodaySchedules(List<CoachScheduleResponse> todaySchedules) {
        this.todaySchedules = todaySchedules;
    }

    public List<CoachTraineeResponse> getRecentTrainees() {
        return recentTrainees;
    }

    public void setRecentTrainees(List<CoachTraineeResponse> recentTrainees) {
        this.recentTrainees = recentTrainees;
    }

    public List<CoachFeePackageResponse> getActivePackages() {
        return activePackages;
    }

    public void setActivePackages(List<CoachFeePackageResponse> activePackages) {
        this.activePackages = activePackages;
    }
}
