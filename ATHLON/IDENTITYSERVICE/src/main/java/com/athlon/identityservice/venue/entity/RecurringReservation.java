package com.athlon.identityservice.venue.entity;

import com.athlon.identityservice.venue.enums.RecurrenceType;
import com.athlon.identityservice.venue.enums.ReservationStatus;
import com.athlon.identityservice.venue.enums.ReservationType;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "recurring_reservations")
public class RecurringReservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "recurring_reservation_id", updatable = false, nullable = false)
    private Long recurringReservationId;

    @Column(name = "recurring_reservation_uuid", nullable = false, unique = true, updatable = false)
    private UUID recurringReservationUuid;

    @Column(name = "venue_id", nullable = false)
    private Long venueId;

    @Column(name = "facility_id", nullable = false)
    private Long facilityId;

    @Enumerated(EnumType.STRING)
    @Column(name = "reservation_type", nullable = false, length = 50)
    private ReservationType reservationType = ReservationType.INTERNAL;

    @Column(name = "reference_id", length = 100)
    private String referenceId;

    @Column(name = "title", nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "recurrence_type", nullable = false, length = 50)
    private RecurrenceType recurrenceType = RecurrenceType.WEEKLY;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "repeat_interval")
    private Integer repeatInterval = 1;

    @Column(name = "days_of_week", nullable = false, length = 100)
    private String daysOfWeek; // e.g. "MONDAY,WEDNESDAY,FRIDAY"

    @Column(name = "day_of_month")
    private Integer dayOfMonth;

    @Column(name = "until_cancelled")
    private Boolean untilCancelled = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private ReservationStatus status = ReservationStatus.ACTIVE;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "updated_by")
    private Long updatedBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (this.recurringReservationUuid == null) {
            this.recurringReservationUuid = UUID.randomUUID();
        }
        if (this.repeatInterval == null) {
            this.repeatInterval = 1;
        }
        if (this.untilCancelled == null) {
            this.untilCancelled = false;
        }
        if (this.status == null) {
            this.status = ReservationStatus.ACTIVE;
        }
    }

    public RecurringReservation() {
    }

    public Long getRecurringReservationId() {
        return recurringReservationId;
    }

    public void setRecurringReservationId(Long recurringReservationId) {
        this.recurringReservationId = recurringReservationId;
    }

    public UUID getRecurringReservationUuid() {
        return recurringReservationUuid;
    }

    public void setRecurringReservationUuid(UUID recurringReservationUuid) {
        this.recurringReservationUuid = recurringReservationUuid;
    }

    public Long getVenueId() {
        return venueId;
    }

    public void setVenueId(Long venueId) {
        this.venueId = venueId;
    }

    public Long getFacilityId() {
        return facilityId;
    }

    public void setFacilityId(Long facilityId) {
        this.facilityId = facilityId;
    }

    public ReservationType getReservationType() {
        return reservationType;
    }

    public void setReservationType(ReservationType reservationType) {
        this.reservationType = reservationType;
    }

    public String getReferenceId() {
        return referenceId;
    }

    public void setReferenceId(String referenceId) {
        this.referenceId = referenceId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public RecurrenceType getRecurrenceType() {
        return recurrenceType;
    }

    public void setRecurrenceType(RecurrenceType recurrenceType) {
        this.recurrenceType = recurrenceType;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
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

    public Integer getRepeatInterval() {
        return repeatInterval;
    }

    public void setRepeatInterval(Integer repeatInterval) {
        this.repeatInterval = repeatInterval;
    }

    public String getDaysOfWeek() {
        return daysOfWeek;
    }

    public void setDaysOfWeek(String daysOfWeek) {
        this.daysOfWeek = daysOfWeek;
    }

    public Integer getDayOfMonth() {
        return dayOfMonth;
    }

    public void setDayOfMonth(Integer dayOfMonth) {
        this.dayOfMonth = dayOfMonth;
    }

    public Boolean getUntilCancelled() {
        return untilCancelled;
    }

    public void setUntilCancelled(Boolean untilCancelled) {
        this.untilCancelled = untilCancelled;
    }

    public ReservationStatus getStatus() {
        return status;
    }

    public void setStatus(ReservationStatus status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Long getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(Long createdBy) {
        this.createdBy = createdBy;
    }

    public Long getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(Long updatedBy) {
        this.updatedBy = updatedBy;
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
