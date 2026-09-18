package com.athlon.identityservice.venue.dto;

import com.athlon.identityservice.venue.enums.RecurrenceType;
import com.athlon.identityservice.venue.enums.ReservationType;

import java.time.LocalDate;
import java.time.LocalTime;

public class RecurringReservationCreateRequest {
    private Long venueId;
    private Long facilityId;
    private ReservationType reservationType = ReservationType.INTERNAL;
    private String referenceId;
    private String title;
    private RecurrenceType recurrenceType = RecurrenceType.WEEKLY;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer repeatInterval = 1;
    private String daysOfWeek; // e.g. "MONDAY,WEDNESDAY,FRIDAY"
    private Integer dayOfMonth;
    private Boolean untilCancelled = false;
    private String notes;

    public RecurringReservationCreateRequest() {}

    public Long getVenueId() { return venueId; }
    public void setVenueId(Long venueId) { this.venueId = venueId; }
    public Long getFacilityId() { return facilityId; }
    public void setFacilityId(Long facilityId) { this.facilityId = facilityId; }
    public ReservationType getReservationType() { return reservationType; }
    public void setReservationType(ReservationType reservationType) { this.reservationType = reservationType; }
    public String getReferenceId() { return referenceId; }
    public void setReferenceId(String referenceId) { this.referenceId = referenceId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
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
    public Integer getDayOfMonth() { return dayOfMonth; }
    public void setDayOfMonth(Integer dayOfMonth) { this.dayOfMonth = dayOfMonth; }
    public Boolean getUntilCancelled() { return untilCancelled; }
    public void setUntilCancelled(Boolean untilCancelled) { this.untilCancelled = untilCancelled; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
