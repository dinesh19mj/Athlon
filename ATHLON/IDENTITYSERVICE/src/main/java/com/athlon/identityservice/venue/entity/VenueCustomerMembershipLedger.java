package com.athlon.identityservice.venue.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "venue_customer_membership_ledgers")
public class VenueCustomerMembershipLedger {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ledger_id", updatable = false, nullable = false)
    private Long ledgerId;

    @Column(name = "customer_membership_id", nullable = false)
    private Long customerMembershipId;

    @Column(name = "customer_id", nullable = false)
    private Long customerId;

    @Column(name = "booking_id")
    private Long bookingId;

    @Column(name = "transaction_type", nullable = false, length = 30)
    private String transactionType; // CREDIT_PURCHASE, HOURLY_DEDUCTION, REFUND, ADJUSTMENT

    @Column(name = "credits", nullable = false, precision = 8, scale = 2)
    private BigDecimal credits;

    @Column(name = "balance_after", nullable = false, precision = 8, scale = 2)
    private BigDecimal balanceAfter;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public VenueCustomerMembershipLedger() {
    }

    public VenueCustomerMembershipLedger(Long customerMembershipId, Long customerId, Long bookingId, String transactionType, BigDecimal credits, BigDecimal balanceAfter, String notes) {
        this.customerMembershipId = customerMembershipId;
        this.customerId = customerId;
        this.bookingId = bookingId;
        this.transactionType = transactionType;
        this.credits = credits;
        this.balanceAfter = balanceAfter;
        this.notes = notes;
    }

    public Long getLedgerId() {
        return ledgerId;
    }

    public void setLedgerId(Long ledgerId) {
        this.ledgerId = ledgerId;
    }

    public Long getCustomerMembershipId() {
        return customerMembershipId;
    }

    public void setCustomerMembershipId(Long customerMembershipId) {
        this.customerMembershipId = customerMembershipId;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public Long getBookingId() {
        return bookingId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }

    public String getTransactionType() {
        return transactionType;
    }

    public void setTransactionType(String transactionType) {
        this.transactionType = transactionType;
    }

    public BigDecimal getCredits() {
        return credits;
    }

    public void setCredits(BigDecimal credits) {
        this.credits = credits;
    }

    public BigDecimal getBalanceAfter() {
        return balanceAfter;
    }

    public void setBalanceAfter(BigDecimal balanceAfter) {
        this.balanceAfter = balanceAfter;
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
}

