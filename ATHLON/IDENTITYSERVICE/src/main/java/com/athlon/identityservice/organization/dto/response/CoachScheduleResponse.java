package com.athlon.identityservice.organization.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public class CoachScheduleResponse {

    private Long sessionId;
    private UUID sessionUuid;
    private Long organizationId;
    private UUID organizationUuid;
    private UUID traineeUuid;
    private String traineeName;
    private String traineeAvatar;
    private UUID packageUuid;
    private String packageName;
    private LocalDate sessionDate;
    private String timeSlot;
    private String venue;
    private String court;
    private String focusArea;
    private String status;
    private Boolean isCheckedIn;
    private LocalDateTime checkInTime;
    private String coachNotes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public CoachScheduleResponse() {
    }

    public Long getSessionId() {
        return sessionId;
    }

    public void setSessionId(Long sessionId) {
        this.sessionId = sessionId;
    }

    public UUID getSessionUuid() {
        return sessionUuid;
    }

    public void setSessionUuid(UUID sessionUuid) {
        this.sessionUuid = sessionUuid;
    }

    public Long getOrganizationId() {
        return organizationId;
    }

    public void setOrganizationId(Long organizationId) {
        this.organizationId = organizationId;
    }

    public UUID getOrganizationUuid() {
        return organizationUuid;
    }

    public void setOrganizationUuid(UUID organizationUuid) {
        this.organizationUuid = organizationUuid;
    }

    public UUID getTraineeUuid() {
        return traineeUuid;
    }

    public void setTraineeUuid(UUID traineeUuid) {
        this.traineeUuid = traineeUuid;
    }

    public String getTraineeName() {
        return traineeName;
    }

    public void setTraineeName(String traineeName) {
        this.traineeName = traineeName;
    }

    public String getTraineeAvatar() {
        return traineeAvatar;
    }

    public void setTraineeAvatar(String traineeAvatar) {
        this.traineeAvatar = traineeAvatar;
    }

    public UUID getPackageUuid() {
        return packageUuid;
    }

    public void setPackageUuid(UUID packageUuid) {
        this.packageUuid = packageUuid;
    }

    public String getPackageName() {
        return packageName;
    }

    public void setPackageName(String packageName) {
        this.packageName = packageName;
    }

    public LocalDate getSessionDate() {
        return sessionDate;
    }

    public void setSessionDate(LocalDate sessionDate) {
        this.sessionDate = sessionDate;
    }

    public String getTimeSlot() {
        return timeSlot;
    }

    public void setTimeSlot(String timeSlot) {
        this.timeSlot = timeSlot;
    }

    public String getVenue() {
        return venue;
    }

    public void setVenue(String venue) {
        this.venue = venue;
    }

    public String getCourt() {
        return court;
    }

    public void setCourt(String court) {
        this.court = court;
    }

    public String getFocusArea() {
        return focusArea;
    }

    public void setFocusArea(String focusArea) {
        this.focusArea = focusArea;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Boolean getIsCheckedIn() {
        return isCheckedIn;
    }

    public void setIsCheckedIn(Boolean isCheckedIn) {
        this.isCheckedIn = isCheckedIn;
    }

    public LocalDateTime getCheckInTime() {
        return checkInTime;
    }

    public void setCheckInTime(LocalDateTime checkInTime) {
        this.checkInTime = checkInTime;
    }

    public String getCoachNotes() {
        return coachNotes;
    }

    public void setCoachNotes(String coachNotes) {
        this.coachNotes = coachNotes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
