package com.athlon.identityservice.organization.dto.response;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class AcademyDashboardSummaryResponse {

    private UUID organizationUuid;
    private String organizationName;

    // KPI Summary
    private Integer totalCentres = 0;
    private Integer totalFacilities = 0;
    private Integer totalSports = 0;
    private Integer activeStudents = 0;
    private Integer activeCoaches = 0;
    private Integer activeBatches = 0;
    private Integer todaysSessionsCount = 0;
    private Double todaysAttendancePercentage = 0.0;
    private BigDecimal feesCollected = BigDecimal.ZERO;
    private BigDecimal pendingFees = BigDecimal.ZERO;
    private Integer facilityUtilizationPercentage = 0;

    // Sub-lists
    private List<AcademyCentreResponse> centres = new ArrayList<>();
    private List<AcademyFacilityResponse> facilities = new ArrayList<>();
    private List<AcademySportConfigResponse> sports = new ArrayList<>();
    private List<AcademyBatchResponse> upcomingBatches = new ArrayList<>();
    private List<DashboardAlertItem> alerts = new ArrayList<>();

    public static class DashboardAlertItem {
        private String type; // WARNING, INFO, SUCCESS, ERROR
        private String title;
        private String description;
        private String actionLink;

        public DashboardAlertItem() {}

        public DashboardAlertItem(String type, String title, String description, String actionLink) {
            this.type = type;
            this.title = title;
            this.description = description;
            this.actionLink = actionLink;
        }

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public String getActionLink() {
            return actionLink;
        }

        public void setActionLink(String actionLink) {
            this.actionLink = actionLink;
        }
    }

    public UUID getOrganizationUuid() {
        return organizationUuid;
    }

    public void setOrganizationUuid(UUID organizationUuid) {
        this.organizationUuid = organizationUuid;
    }

    public String getOrganizationName() {
        return organizationName;
    }

    public void setOrganizationName(String organizationName) {
        this.organizationName = organizationName;
    }

    public Integer getTotalCentres() {
        return totalCentres;
    }

    public void setTotalCentres(Integer totalCentres) {
        this.totalCentres = totalCentres;
    }

    public Integer getTotalFacilities() {
        return totalFacilities;
    }

    public void setTotalFacilities(Integer totalFacilities) {
        this.totalFacilities = totalFacilities;
    }

    public Integer getTotalSports() {
        return totalSports;
    }

    public void setTotalSports(Integer totalSports) {
        this.totalSports = totalSports;
    }

    public Integer getActiveStudents() {
        return activeStudents;
    }

    public void setActiveStudents(Integer activeStudents) {
        this.activeStudents = activeStudents;
    }

    public Integer getActiveCoaches() {
        return activeCoaches;
    }

    public void setActiveCoaches(Integer activeCoaches) {
        this.activeCoaches = activeCoaches;
    }

    public Integer getActiveBatches() {
        return activeBatches;
    }

    public void setActiveBatches(Integer activeBatches) {
        this.activeBatches = activeBatches;
    }

    public Integer getTodaysSessionsCount() {
        return todaysSessionsCount;
    }

    public void setTodaysSessionsCount(Integer todaysSessionsCount) {
        this.todaysSessionsCount = todaysSessionsCount;
    }

    public Double getTodaysAttendancePercentage() {
        return todaysAttendancePercentage;
    }

    public void setTodaysAttendancePercentage(Double todaysAttendancePercentage) {
        this.todaysAttendancePercentage = todaysAttendancePercentage;
    }

    public BigDecimal getFeesCollected() {
        return feesCollected;
    }

    public void setFeesCollected(BigDecimal feesCollected) {
        this.feesCollected = feesCollected;
    }

    public BigDecimal getPendingFees() {
        return pendingFees;
    }

    public void setPendingFees(BigDecimal pendingFees) {
        this.pendingFees = pendingFees;
    }

    public Integer getFacilityUtilizationPercentage() {
        return facilityUtilizationPercentage;
    }

    public void setFacilityUtilizationPercentage(Integer facilityUtilizationPercentage) {
        this.facilityUtilizationPercentage = facilityUtilizationPercentage;
    }

    public List<AcademyCentreResponse> getCentres() {
        return centres;
    }

    public void setCentres(List<AcademyCentreResponse> centres) {
        this.centres = centres;
    }

    public List<AcademyFacilityResponse> getFacilities() {
        return facilities;
    }

    public void setFacilities(List<AcademyFacilityResponse> facilities) {
        this.facilities = facilities;
    }

    public List<AcademySportConfigResponse> getSports() {
        return sports;
    }

    public void setSports(List<AcademySportConfigResponse> sports) {
        this.sports = sports;
    }

    public List<AcademyBatchResponse> getUpcomingBatches() {
        return upcomingBatches;
    }

    public void setUpcomingBatches(List<AcademyBatchResponse> upcomingBatches) {
        this.upcomingBatches = upcomingBatches;
    }

    public List<DashboardAlertItem> getAlerts() {
        return alerts;
    }

    public void setAlerts(List<DashboardAlertItem> alerts) {
        this.alerts = alerts;
    }
}
