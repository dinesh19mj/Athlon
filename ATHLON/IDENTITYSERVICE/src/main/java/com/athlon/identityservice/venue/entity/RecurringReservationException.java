package com.athlon.identityservice.venue.entity;

import com.athlon.identityservice.venue.enums.ExceptionType;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "recurring_reservation_exceptions")
public class RecurringReservationException {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false, nullable = false)
    private Long id;

    @Column(name = "recurring_reservation_id", nullable = false)
    private Long recurringReservationId;

    @Column(name = "occurrence_date", nullable = false)
    private LocalDate occurrenceDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "exception_type", nullable = false, length = 50)
    private ExceptionType exceptionType = ExceptionType.CANCELLED;

    @Column(name = "new_start_time")
    private LocalTime newStartTime;

    @Column(name = "new_end_time")
    private LocalTime newEndTime;

    @Column(name = "new_facility_id")
    private Long newFacilityId;

    @Column(name = "reason")
    private String reason;

    @Column(name = "created_by")
    private Long createdBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public RecurringReservationException() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getRecurringReservationId() {
        return recurringReservationId;
    }

    public void setRecurringReservationId(Long recurringReservationId) {
        this.recurringReservationId = recurringReservationId;
    }

    public LocalDate getOccurrenceDate() {
        return occurrenceDate;
    }

    public void setOccurrenceDate(LocalDate occurrenceDate) {
        this.occurrenceDate = occurrenceDate;
    }

    public ExceptionType getExceptionType() {
        return exceptionType;
    }

    public void setExceptionType(ExceptionType exceptionType) {
        this.exceptionType = exceptionType;
    }

    public LocalTime getNewStartTime() {
        return newStartTime;
    }

    public void setNewStartTime(LocalTime newStartTime) {
        this.newStartTime = newStartTime;
    }

    public LocalTime getNewEndTime() {
        return newEndTime;
    }

    public void setNewEndTime(LocalTime newEndTime) {
        this.newEndTime = newEndTime;
    }

    public Long getNewFacilityId() {
        return newFacilityId;
    }

    public void setNewFacilityId(Long newFacilityId) {
        this.newFacilityId = newFacilityId;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public Long getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(Long createdBy) {
        this.createdBy = createdBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
