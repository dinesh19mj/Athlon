package com.athlon.identityservice.venue.dto;

import com.athlon.identityservice.venue.enums.BookingSource;
import com.athlon.identityservice.venue.enums.BookingStatus;
import com.athlon.identityservice.venue.enums.PaymentMethod;
import com.athlon.identityservice.venue.enums.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

public class BookingDto {
    private Long bookingId;
    private UUID bookingUuid;
    private String bookingNumber;
    private Long venueId;
    private UUID venueUuid;
    private String venueName;
    private Long facilityId;
    private UUID facilityUuid;
    private String facilityName;
    private Long customerUserId;
    private UUID customerUserUuid;
    private String guestName;
    private String guestPhone;
    private String guestEmail;
    private LocalDate bookingDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer durationMinutes;
    private String sportName;
    private BigDecimal baseAmount;
    private BigDecimal discountAmount;
    private BigDecimal taxAmount;
    private BigDecimal totalAmount;
    private BookingStatus bookingStatus;
    private PaymentStatus paymentStatus;
    private BookingSource bookingSource;
    private LocalDateTime holdExpiresAt;
    private String cancellationReason;
    private Long cancelledBy;
    private LocalDateTime cancelledAt;
    private String notes;
    private List<BookingStatusHistoryDto> statusHistories;
    private List<BookingPaymentDto> payments;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static class BookingStatusHistoryDto {
        private Long id;
        private BookingStatus previousStatus;
        private BookingStatus newStatus;
        private String reason;
        private Long changedBy;
        private LocalDateTime changedAt;

        public BookingStatusHistoryDto() {}
        public BookingStatusHistoryDto(Long id, BookingStatus previousStatus, BookingStatus newStatus, String reason, Long changedBy, LocalDateTime changedAt) {
            this.id = id;
            this.previousStatus = previousStatus;
            this.newStatus = newStatus;
            this.reason = reason;
            this.changedBy = changedBy;
            this.changedAt = changedAt;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public BookingStatus getPreviousStatus() { return previousStatus; }
        public void setPreviousStatus(BookingStatus previousStatus) { this.previousStatus = previousStatus; }
        public BookingStatus getNewStatus() { return newStatus; }
        public void setNewStatus(BookingStatus newStatus) { this.newStatus = newStatus; }
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
        public Long getChangedBy() { return changedBy; }
        public void setChangedBy(Long changedBy) { this.changedBy = changedBy; }
        public LocalDateTime getChangedAt() { return changedAt; }
        public void setChangedAt(LocalDateTime changedAt) { this.changedAt = changedAt; }
    }

    public static class BookingPaymentDto {
        private Long paymentId;
        private UUID paymentUuid;
        private Long bookingId;
        private BigDecimal amount;
        private PaymentMethod paymentMethod;
        private PaymentStatus paymentStatus;
        private String transactionReference;
        private LocalDateTime paidAt;
        private Long recordedBy;
        private String notes;

        public BookingPaymentDto() {}

        public Long getPaymentId() { return paymentId; }
        public void setPaymentId(Long paymentId) { this.paymentId = paymentId; }
        public UUID getPaymentUuid() { return paymentUuid; }
        public void setPaymentUuid(UUID paymentUuid) { this.paymentUuid = paymentUuid; }
        public Long getBookingId() { return bookingId; }
        public void setBookingId(Long bookingId) { this.bookingId = bookingId; }
        public BigDecimal getAmount() { return amount; }
        public void setAmount(BigDecimal amount) { this.amount = amount; }
        public PaymentMethod getPaymentMethod() { return paymentMethod; }
        public void setPaymentMethod(PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; }
        public PaymentStatus getPaymentStatus() { return paymentStatus; }
        public void setPaymentStatus(PaymentStatus paymentStatus) { this.paymentStatus = paymentStatus; }
        public String getTransactionReference() { return transactionReference; }
        public void setTransactionReference(String transactionReference) { this.transactionReference = transactionReference; }
        public LocalDateTime getPaidAt() { return paidAt; }
        public void setPaidAt(LocalDateTime paidAt) { this.paidAt = paidAt; }
        public Long getRecordedBy() { return recordedBy; }
        public void setRecordedBy(Long recordedBy) { this.recordedBy = recordedBy; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }

    public BookingDto() {}

    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }
    public UUID getBookingUuid() { return bookingUuid; }
    public void setBookingUuid(UUID bookingUuid) { this.bookingUuid = bookingUuid; }
    public String getBookingNumber() { return bookingNumber; }
    public void setBookingNumber(String bookingNumber) { this.bookingNumber = bookingNumber; }
    public Long getVenueId() { return venueId; }
    public void setVenueId(Long venueId) { this.venueId = venueId; }
    public UUID getVenueUuid() { return venueUuid; }
    public void setVenueUuid(UUID venueUuid) { this.venueUuid = venueUuid; }
    public String getVenueName() { return venueName; }
    public void setVenueName(String venueName) { this.venueName = venueName; }
    public Long getFacilityId() { return facilityId; }
    public void setFacilityId(Long facilityId) { this.facilityId = facilityId; }
    public UUID getFacilityUuid() { return facilityUuid; }
    public void setFacilityUuid(UUID facilityUuid) { this.facilityUuid = facilityUuid; }
    public String getFacilityName() { return facilityName; }
    public void setFacilityName(String facilityName) { this.facilityName = facilityName; }
    public Long getCustomerUserId() { return customerUserId; }
    public void setCustomerUserId(Long customerUserId) { this.customerUserId = customerUserId; }
    public UUID getCustomerUserUuid() { return customerUserUuid; }
    public void setCustomerUserUuid(UUID customerUserUuid) { this.customerUserUuid = customerUserUuid; }
    public String getGuestName() { return guestName; }
    public void setGuestName(String guestName) { this.guestName = guestName; }
    public String getGuestPhone() { return guestPhone; }
    public void setGuestPhone(String guestPhone) { this.guestPhone = guestPhone; }
    public String getGuestEmail() { return guestEmail; }
    public void setGuestEmail(String guestEmail) { this.guestEmail = guestEmail; }
    public LocalDate getBookingDate() { return bookingDate; }
    public void setBookingDate(LocalDate bookingDate) { this.bookingDate = bookingDate; }
    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }
    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }
    public String getSportName() { return sportName; }
    public void setSportName(String sportName) { this.sportName = sportName; }
    public BigDecimal getBaseAmount() { return baseAmount; }
    public void setBaseAmount(BigDecimal baseAmount) { this.baseAmount = baseAmount; }
    public BigDecimal getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(BigDecimal discountAmount) { this.discountAmount = discountAmount; }
    public BigDecimal getTaxAmount() { return taxAmount; }
    public void setTaxAmount(BigDecimal taxAmount) { this.taxAmount = taxAmount; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public BookingStatus getBookingStatus() { return bookingStatus; }
    public void setBookingStatus(BookingStatus bookingStatus) { this.bookingStatus = bookingStatus; }
    public PaymentStatus getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(PaymentStatus paymentStatus) { this.paymentStatus = paymentStatus; }
    public BookingSource getBookingSource() { return bookingSource; }
    public void setBookingSource(BookingSource bookingSource) { this.bookingSource = bookingSource; }
    public LocalDateTime getHoldExpiresAt() { return holdExpiresAt; }
    public void setHoldExpiresAt(LocalDateTime holdExpiresAt) { this.holdExpiresAt = holdExpiresAt; }
    public String getCancellationReason() { return cancellationReason; }
    public void setCancellationReason(String cancellationReason) { this.cancellationReason = cancellationReason; }
    public Long getCancelledBy() { return cancelledBy; }
    public void setCancelledBy(Long cancelledBy) { this.cancelledBy = cancelledBy; }
    public LocalDateTime getCancelledAt() { return cancelledAt; }
    public void setCancelledAt(LocalDateTime cancelledAt) { this.cancelledAt = cancelledAt; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public List<BookingStatusHistoryDto> getStatusHistories() { return statusHistories; }
    public void setStatusHistories(List<BookingStatusHistoryDto> statusHistories) { this.statusHistories = statusHistories; }
    public List<BookingPaymentDto> getPayments() { return payments; }
    public void setPayments(List<BookingPaymentDto> payments) { this.payments = payments; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
