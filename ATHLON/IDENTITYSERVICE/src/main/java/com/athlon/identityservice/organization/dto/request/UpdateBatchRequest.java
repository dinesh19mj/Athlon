package com.athlon.identityservice.organization.dto.request;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.UUID;

import jakarta.validation.constraints.NotNull;

public class UpdateBatchRequest {

    @NotNull(message = "Batch UUID is required")
    private UUID batchUuid;

    private String batchName;
    private UUID centreUuid;
    private String centreName;
    private UUID facilityUuid;
    private UUID courtUuid;
    private String sportType;
    private String level;
    private String ageCategory;
    private String programFocus;
    private UUID coachUuid;
    private String coachName;
    private String daysOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer maxCapacity;
    private BigDecimal monthlyFee;
    private String status; // ACTIVE, FULL, ARCHIVED

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

    public UUID getFacilityUuid() {
        return facilityUuid;
    }

    public void setFacilityUuid(UUID facilityUuid) {
        this.facilityUuid = facilityUuid;
    }

    public String getAgeCategory() {
        return ageCategory;
    }

    public void setAgeCategory(String ageCategory) {
        this.ageCategory = ageCategory;
    }

    public String getProgramFocus() {
        return programFocus;
    }

    public void setProgramFocus(String programFocus) {
        this.programFocus = programFocus;
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

    public UUID getCourtUuid() {
        return courtUuid;
    }

    public void setCourtUuid(UUID courtUuid) {
        this.courtUuid = courtUuid;
    }

    public String getSportType() {
        return sportType;
    }

    public void setSportType(String sportType) {
        this.sportType = sportType;
    }

    public String getLevel() {
        return level;
    }

    public void setLevel(String level) {
        this.level = level;
    }

    public UUID getCoachUuid() {
        return coachUuid;
    }

    public void setCoachUuid(UUID coachUuid) {
        this.coachUuid = coachUuid;
    }

    public String getCoachName() {
        return coachName;
    }

    public void setCoachName(String coachName) {
        this.coachName = coachName;
    }

    public String getDaysOfWeek() {
        return daysOfWeek;
    }

    public void setDaysOfWeek(String daysOfWeek) {
        this.daysOfWeek = daysOfWeek;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }

    public Integer getMaxCapacity() {
        return maxCapacity;
    }

    public void setMaxCapacity(Integer maxCapacity) {
        this.maxCapacity = maxCapacity;
    }

    public BigDecimal getMonthlyFee() {
        return monthlyFee;
    }

    public void setMonthlyFee(BigDecimal monthlyFee) {
        this.monthlyFee = monthlyFee;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
