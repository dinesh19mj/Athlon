package com.athlon.identityservice.venue.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "recurring_booking_occurrences")
public class RecurringBookingOccurrence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "occurrence_id", updatable = false, nullable = false)
    private Long occurrenceId;

    @Column(name = "recurring_booking_id", nullable = false)
    private Long recurringBookingId;

    @Column(name = "booking_id")
    private Long bookingId;

    @Column(name = "occurrence_date", nullable = false)
    private LocalDate occurrenceDate;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "status", nullable = false, length = 50)
    private String status = "SCHEDULED"; // SCHEDULED, ATTENDED, CANCELLED, NO_SHOW

    @Column(name = "price", nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(name = "is_paid")
    private Boolean isPaid = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (this.status == null) {
            this.status = "SCHEDULED";
        }
        if (this.isPaid == null) {
            this.isPaid = false;
        }
    }

    public RecurringBookingOccurrence() {
    }

    public Long getOccurrenceId() {
        return occurrenceId;
    }

    public void setOccurrenceId(Long occurrenceId) {
        this.occurrenceId = occurrenceId;
    }

    public Long getRecurringBookingId() {
        return recurringBookingId;
    }

    public void setRecurringBookingId(Long recurringBookingId) {
        this.recurringBookingId = recurringBookingId;
    }

    public Long getBookingId() {
        return bookingId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }

    public LocalDate getOccurrenceDate() {
        return occurrenceDate;
    }

    public void setOccurrenceDate(LocalDate occurrenceDate) {
        this.occurrenceDate = occurrenceDate;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public Boolean getIsPaid() {
        return isPaid;
    }

    public void setIsPaid(Boolean isPaid) {
        this.isPaid = isPaid;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
