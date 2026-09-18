package com.athlon.identityservice.venue.entity;

import com.athlon.identityservice.venue.enums.BookingStatus;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "booking_status_histories")
public class BookingStatusHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false, nullable = false)
    private Long id;

    @Column(name = "booking_id", nullable = false)
    private Long bookingId;

    @Enumerated(EnumType.STRING)
    @Column(name = "previous_status", length = 50)
    private BookingStatus previousStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "new_status", nullable = false, length = 50)
    private BookingStatus newStatus;

    @Column(name = "reason")
    private String reason;

    @Column(name = "changed_by")
    private Long changedBy;

    @CreationTimestamp
    @Column(name = "changed_at", updatable = false)
    private LocalDateTime changedAt;

    public BookingStatusHistory() {
    }

    public BookingStatusHistory(Long bookingId, BookingStatus previousStatus, BookingStatus newStatus, String reason, Long changedBy) {
        this.bookingId = bookingId;
        this.previousStatus = previousStatus;
        this.newStatus = newStatus;
        this.reason = reason;
        this.changedBy = changedBy;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getBookingId() {
        return bookingId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }

    public BookingStatus getPreviousStatus() {
        return previousStatus;
    }

    public void setPreviousStatus(BookingStatus previousStatus) {
        this.previousStatus = previousStatus;
    }

    public BookingStatus getNewStatus() {
        return newStatus;
    }

    public void setNewStatus(BookingStatus newStatus) {
        this.newStatus = newStatus;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public Long getChangedBy() {
        return changedBy;
    }

    public void setChangedBy(Long changedBy) {
        this.changedBy = changedBy;
    }

    public LocalDateTime getChangedAt() {
        return changedAt;
    }

    public void setChangedAt(LocalDateTime changedAt) {
        this.changedAt = changedAt;
    }
}
