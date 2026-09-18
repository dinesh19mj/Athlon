package com.athlon.identityservice.venue.dto;

import com.athlon.identityservice.venue.enums.ExceptionType;

import java.time.LocalDate;
import java.time.LocalTime;

public class RecurringExceptionCreateRequest {
    private LocalDate occurrenceDate;
    private ExceptionType exceptionType = ExceptionType.CANCELLED;
    private LocalTime newStartTime;
    private LocalTime newEndTime;
    private Long newFacilityId;
    private String reason;

    public RecurringExceptionCreateRequest() {}

    public LocalDate getOccurrenceDate() { return occurrenceDate; }
    public void setOccurrenceDate(LocalDate occurrenceDate) { this.occurrenceDate = occurrenceDate; }
    public ExceptionType getExceptionType() { return exceptionType; }
    public void setExceptionType(ExceptionType exceptionType) { this.exceptionType = exceptionType; }
    public LocalTime getNewStartTime() { return newStartTime; }
    public void setNewStartTime(LocalTime newStartTime) { this.newStartTime = newStartTime; }
    public LocalTime getNewEndTime() { return newEndTime; }
    public void setNewEndTime(LocalTime newEndTime) { this.newEndTime = newEndTime; }
    public Long getNewFacilityId() { return newFacilityId; }
    public void setNewFacilityId(Long newFacilityId) { this.newFacilityId = newFacilityId; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
