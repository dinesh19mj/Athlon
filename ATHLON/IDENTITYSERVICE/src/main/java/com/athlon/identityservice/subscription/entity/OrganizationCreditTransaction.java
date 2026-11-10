package com.athlon.identityservice.subscription.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "organization_credit_transactions", indexes = {
        @Index(name = "idx_credit_tx_account_id", columnList = "account_id"),
        @Index(name = "idx_credit_tx_idempotency", columnList = "idempotency_key", unique = true)
})
public class OrganizationCreditTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "transaction_id", updatable = false, nullable = false)
    private Long transactionId;

    @Column(name = "account_id", nullable = false)
    private Long accountId;

    @Column(name = "credit_type", nullable = false, length = 32)
    private String creditType; // TOURNAMENT_CREDIT, AUCTION_ACTIVATION_CREDIT

    @Column(name = "amount", nullable = false)
    private Integer amount; // Positive = Grant/Refund, Negative = Deduction

    @Column(name = "transaction_type", nullable = false, length = 32)
    private String transactionType; // GRANT, RESERVATION, CONSUMPTION, REFUND, EXPIRY, ADMIN_ADJUSTMENT

    @Column(name = "reference_type", length = 32)
    private String referenceType; // TOURNAMENT, AUCTION, ORDER, ADMIN

    @Column(name = "reference_id", length = 128)
    private String referenceId; // Tournament UUID, Auction ID, Order ID

    @Column(name = "idempotency_key", length = 128, unique = true)
    private String idempotencyKey;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public OrganizationCreditTransaction() {
    }

    public OrganizationCreditTransaction(Long accountId, String creditType, Integer amount,
                                       String transactionType, String referenceType, String referenceId,
                                       String idempotencyKey, String notes) {
        this.accountId = accountId;
        this.creditType = creditType;
        this.amount = amount;
        this.transactionType = transactionType;
        this.referenceType = referenceType;
        this.referenceId = referenceId;
        this.idempotencyKey = idempotencyKey;
        this.notes = notes;
    }

    public Long getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(Long transactionId) {
        this.transactionId = transactionId;
    }

    public Long getAccountId() {
        return accountId;
    }

    public void setAccountId(Long accountId) {
        this.accountId = accountId;
    }

    public String getCreditType() {
        return creditType;
    }

    public void setCreditType(String creditType) {
        this.creditType = creditType;
    }

    public Integer getAmount() {
        return amount;
    }

    public void setAmount(Integer amount) {
        this.amount = amount;
    }

    public String getTransactionType() {
        return transactionType;
    }

    public void setTransactionType(String transactionType) {
        this.transactionType = transactionType;
    }

    public String getReferenceType() {
        return referenceType;
    }

    public void setReferenceType(String referenceType) {
        this.referenceType = referenceType;
    }

    public String getReferenceId() {
        return referenceId;
    }

    public void setReferenceId(String referenceId) {
        this.referenceId = referenceId;
    }

    public String getIdempotencyKey() {
        return idempotencyKey;
    }

    public void setIdempotencyKey(String idempotencyKey) {
        this.idempotencyKey = idempotencyKey;
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

