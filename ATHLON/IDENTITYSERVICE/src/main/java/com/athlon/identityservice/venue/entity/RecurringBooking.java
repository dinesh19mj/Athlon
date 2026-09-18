package com.athlon.identityservice.venue.entity;

import com.athlon.identityservice.venue.enums.RecurrenceType;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "recurring_bookings")
public class RecurringBooking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "recurring_booking_id", updatable = false, nullable = false)
    private Long recurringBookingId;

    @Column(name = "recurring_booking_uuid", nullable = false, unique = true, updatable = false)
    private UUID recurringBookingUuid;

    @Column(name = "booking_number", nullable = false, unique = true, length = 100)
    private String bookingNumber;

    @Column(name = "venue_id", nullable = false)
    private Long venueId;

    @Column(name = "facility_id", nullable = false)
    private Long facilityId;

    @Column(name = "customer_user_id")
    private Long customerUserId;

    @Column(name = "customer_user_uuid")
    private UUID customerUserUuid;

    @Column(name = "customer_name", nullable = false, length = 150)
    private String customerName;

    @Column(name = "customer_phone", nullable = false, length = 50)
    private String customerPhone;

    @Column(name = "customer_email", length = 150)
    private String customerEmail;

    @Enumerated(EnumType.STRING)
    @Column(name = "recurrence_type", nullable = false, length = 50)
    private RecurrenceType recurrenceType = RecurrenceType.WEEKLY;

    @Column(name = "days_of_week", nullable = false, length = 100)
    private String daysOfWeek; // e.g. "MONDAY,THURSDAY"

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "total_sessions", nullable = false)
    private Integer totalSessions;

    @Column(name = "price_per_session", nullable = false, precision = 12, scale = 2)
    private BigDecimal pricePerSession;

    @Column(name = "total_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "status", nullable = false, length = 50)
    private String status = "ACTIVE"; // ACTIVE, CANCELLED, COMPLETED

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_by")
    private Long createdBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (this.recurringBookingUuid == null) {
            this.recurringBookingUuid = UUID.randomUUID();
        }
        if (this.status == null) {
            this.status = "ACTIVE";
        }
    }

    public RecurringBooking() {
    }

    public Long getRecurringBookingId() {
        return recurringBookingId;
    }

    public void setRecurringBookingId(Long recurringBookingId) {
        this.recurringBookingId = recurringBookingId;
    }

    public UUID getRecurringBookingUuid() {
        return recurringBookingUuid;
    }

    public void setRecurringBookingUuid(UUID recurringBookingUuid) {
        this.recurringBookingUuid = recurringBookingUuid;
    }

    public String getBookingNumber() {
        return bookingNumber;
    }

    public void setBookingNumber(String bookingNumber) {
        this.bookingNumber = bookingNumber;
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

    public Long getCustomerUserId() {
        return customerUserId;
    }

    public void setCustomerUserId(Long customerUserId) {
        this.customerUserId = customerUserId;
    }

    public UUID getCustomerUserUuid() {
        return customerUserUuid;
    }

    public void setCustomerUserUuid(UUID customerUserUuid) {
        this.customerUserUuid = customerUserUuid;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCustomerPhone() {
        return customerPhone;
    }

    public void setCustomerPhone(String customerPhone) {
        this.customerPhone = customerPhone;
    }

    public String getCustomerEmail() {
        return customerEmail;
    }

    public void setCustomerEmail(String customerEmail) {
        this.customerEmail = customerEmail;
    }

    public RecurrenceType getRecurrenceType() {
        return recurrenceType;
    }

    public void setRecurrenceType(RecurrenceType recurrenceType) {
        this.recurrenceType = recurrenceType;
    }

    public String getDaysOfWeek() {
        return daysOfWeek;
    }

    public void setDaysOfWeek(String daysOfWeek) {
        this.daysOfWeek = daysOfWeek;
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

    public Integer getTotalSessions() {
        return totalSessions;
    }

    public void setTotalSessions(Integer totalSessions) {
        this.totalSessions = totalSessions;
    }

    public BigDecimal getPricePerSession() {
        return pricePerSession;
    }

    public void setPricePerSession(BigDecimal pricePerSession) {
        this.pricePerSession = pricePerSession;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
