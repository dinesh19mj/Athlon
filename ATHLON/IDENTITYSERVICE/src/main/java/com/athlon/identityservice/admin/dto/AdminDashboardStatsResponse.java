package com.athlon.identityservice.admin.dto;

import java.util.Map;

public class AdminDashboardStatsResponse {

    private long totalUsers;
    private long activeUsers;
    private long suspendedUsers;

    private long totalOrganizations;
    private long activeOrganizations;
    private Map<String, Long> organizationsByType;

    private long totalPackages;
    private long activeSubscriptions;
    private long pendingSubscriptionRequests;

    private long totalTournaments;

    public AdminDashboardStatsResponse() {
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getActiveUsers() {
        return activeUsers;
    }

    public void setActiveUsers(long activeUsers) {
        this.activeUsers = activeUsers;
    }

    public long getSuspendedUsers() {
        return suspendedUsers;
    }

    public void setSuspendedUsers(long suspendedUsers) {
        this.suspendedUsers = suspendedUsers;
    }

    public long getTotalOrganizations() {
        return totalOrganizations;
    }

    public void setTotalOrganizations(long totalOrganizations) {
        this.totalOrganizations = totalOrganizations;
    }

    public long getActiveOrganizations() {
        return activeOrganizations;
    }

    public void setActiveOrganizations(long activeOrganizations) {
        this.activeOrganizations = activeOrganizations;
    }

    public Map<String, Long> getOrganizationsByType() {
        return organizationsByType;
    }

    public void setOrganizationsByType(Map<String, Long> organizationsByType) {
        this.organizationsByType = organizationsByType;
    }

    public long getTotalPackages() {
        return totalPackages;
    }

    public void setTotalPackages(long totalPackages) {
        this.totalPackages = totalPackages;
    }

    public long getActiveSubscriptions() {
        return activeSubscriptions;
    }

    public void setActiveSubscriptions(long activeSubscriptions) {
        this.activeSubscriptions = activeSubscriptions;
    }

    public long getPendingSubscriptionRequests() {
        return pendingSubscriptionRequests;
    }

    public void setPendingSubscriptionRequests(long pendingSubscriptionRequests) {
        this.pendingSubscriptionRequests = pendingSubscriptionRequests;
    }

    public long getTotalTournaments() {
        return totalTournaments;
    }

    public void setTotalTournaments(long totalTournaments) {
        this.totalTournaments = totalTournaments;
    }
}
