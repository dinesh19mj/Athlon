package com.athlon.identityservice.venue.dto;

import com.athlon.identityservice.venue.enums.RecurrenceType;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public class RecurringConflictCheckRequest {
    private Long facilityId;
    private RecurrenceType recurrenceType = RecurrenceType.WEEKLY;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer repeatInterval = 1;
    private String daysOfWeek;

    public RecurringConflictCheckRequest() {}

    public Long getFacilityId() { return facilityId; }
    public void setFacilityId(Long facilityId) { this.facilityId = facilityId; }
    public RecurrenceType getRecurrenceType() { return recurrenceType; }
    public void setRecurrenceType(RecurrenceType recurrenceType) { this.recurrenceType = recurrenceType; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }
    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
    public Integer getRepeatInterval() { return repeatInterval; }
    public void setRepeatInterval(Integer repeatInterval) { this.repeatInterval = repeatInterval; }
    public String getDaysOfWeek() { return daysOfWeek; }
    public void setDaysOfWeek(String daysOfWeek) { this.daysOfWeek = daysOfWeek; }
}
