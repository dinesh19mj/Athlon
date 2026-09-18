package com.athlon.identityservice.venue.entity;

import com.athlon.identityservice.venue.enums.PaymentMethod;
import com.athlon.identityservice.venue.enums.PaymentStatus;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "booking_payments")
public class BookingPayment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payment_id", updatable = false, nullable = false)
    private Long paymentId;

    @Column(name = "payment_uuid", nullable = false, unique = true, updatable = false)
    private UUID paymentUuid;

    @Column(name = "booking_id", nullable = false)
    private Long bookingId;

    @Column(name = "amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false, length = 50)
    private PaymentMethod paymentMethod = PaymentMethod.UPI;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 50)
    private PaymentStatus paymentStatus = PaymentStatus.PAID;

    @Column(name = "transaction_reference", length = 150)
    private String transactionReference;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Column(name = "recorded_by")
    private Long recordedBy;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (this.paymentUuid == null) {
            this.paymentUuid = UUID.randomUUID();
        }
        if (this.paidAt == null) {
            this.paidAt = LocalDateTime.now();
        }
    }

    public BookingPayment() {
    }

    public Long getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(Long paymentId) {
        this.paymentId = paymentId;
    }

    public UUID getPaymentUuid() {
        return paymentUuid;
    }

    public void setPaymentUuid(UUID paymentUuid) {
        this.paymentUuid = paymentUuid;
    }

    public Long getBookingId() {
        return bookingId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public PaymentStatus getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(PaymentStatus paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public String getTransactionReference() {
        return transactionReference;
    }

    public void setTransactionReference(String transactionReference) {
        this.transactionReference = transactionReference;
    }

    public LocalDateTime getPaidAt() {
        return paidAt;
    }

    public void setPaidAt(LocalDateTime paidAt) {
        this.paidAt = paidAt;
    }

    public Long getRecordedBy() {
        return recordedBy;
    }

    public void setRecordedBy(Long recordedBy) {
        this.recordedBy = recordedBy;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
