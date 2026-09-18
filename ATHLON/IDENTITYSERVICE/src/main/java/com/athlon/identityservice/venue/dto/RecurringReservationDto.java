package com.athlon.identityservice.venue.dto;

import com.athlon.identityservice.venue.enums.ExceptionType;
import com.athlon.identityservice.venue.enums.RecurrenceType;
import com.athlon.identityservice.venue.enums.ReservationStatus;
import com.athlon.identityservice.venue.enums.ReservationType;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

public class RecurringReservationDto {
    private Long recurringReservationId;
    private UUID recurringReservationUuid;
    private Long venueId;
    private Long facilityId;
    private String facilityName;
    private ReservationType reservationType;
    private String referenceId;
    private String title;
    private RecurrenceType recurrenceType;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer repeatInterval;
    private String daysOfWeek;
    private Integer dayOfMonth;
    private Boolean untilCancelled;
    private ReservationStatus status;
    private String notes;
    private List<ExceptionDto> exceptions;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static class ExceptionDto {
        private Long id;
        private LocalDate occurrenceDate;
        private ExceptionType exceptionType;
        private LocalTime newStartTime;
        private LocalTime newEndTime;
        private Long newFacilityId;
        private String newFacilityName;
        private String reason;
        private LocalDateTime createdAt;

        public ExceptionDto() {}

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
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
        public String getNewFacilityName() { return newFacilityName; }
        public void setNewFacilityName(String newFacilityName) { this.newFacilityName = newFacilityName; }
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }

    public RecurringReservationDto() {}

    public Long getRecurringReservationId() { return recurringReservationId; }
    public void setRecurringReservationId(Long recurringReservationId) { this.recurringReservationId = recurringReservationId; }
    public UUID getRecurringReservationUuid() { return recurringReservationUuid; }
    public void setRecurringReservationUuid(UUID recurringReservationUuid) { this.recurringReservationUuid = recurringReservationUuid; }
    public Long getVenueId() { return venueId; }
    public void setVenueId(Long venueId) { this.venueId = venueId; }
    public Long getFacilityId() { return facilityId; }
    public void setFacilityId(Long facilityId) { this.facilityId = facilityId; }
    public String getFacilityName() { return facilityName; }
    public void setFacilityName(String facilityName) { this.facilityName = facilityName; }
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
    public ReservationStatus getStatus() { return status; }
    public void setStatus(ReservationStatus status) { this.status = status; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public List<ExceptionDto> getExceptions() { return exceptions; }
    public void setExceptions(List<ExceptionDto> exceptions) { this.exceptions = exceptions; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
