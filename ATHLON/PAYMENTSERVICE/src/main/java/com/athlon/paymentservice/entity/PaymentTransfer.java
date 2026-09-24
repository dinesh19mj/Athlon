package com.athlon.paymentservice.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.athlon.paymentservice.enums.TransferStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "payment_transfer", indexes = {
    @Index(name = "idx_payment_transfer_provider_id", columnList = "provider_transfer_id", unique = true),
    @Index(name = "idx_payment_transfer_order_id", columnList = "payment_order_id")
})
public class PaymentTransfer {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "payment_order_id", nullable = false)
    private PaymentOrder paymentOrder;

    @ManyToOne
    @JoinColumn(name = "payment_transaction_id")
    private PaymentTransaction paymentTransaction;

    @Column(name = "recipient_account_id", nullable = false, length = 64)
    private String recipientAccountId; // acc_xxxx

    @Column(name = "provider_transfer_id", length = 64, unique = true)
    private String providerTransferId; // trf_xxxx

    @Column(name = "amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(name = "currency", nullable = false, length = 3)
    private String currency = "INR";

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    private TransferStatus status = TransferStatus.PENDING;

    @Column(name = "settlement_id", length = 64)
    private String settlementId;

    @Column(name = "error_message", length = 512)
    private String errorMessage;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public PaymentTransfer() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public PaymentOrder getPaymentOrder() {
        return paymentOrder;
    }

    public void setPaymentOrder(PaymentOrder paymentOrder) {
        this.paymentOrder = paymentOrder;
    }

    public PaymentTransaction getPaymentTransaction() {
        return paymentTransaction;
    }

    public void setPaymentTransaction(PaymentTransaction paymentTransaction) {
        this.paymentTransaction = paymentTransaction;
    }

    public String getRecipientAccountId() {
        return recipientAccountId;
    }

    public void setRecipientAccountId(String recipientAccountId) {
        this.recipientAccountId = recipientAccountId;
    }

    public String getProviderTransferId() {
        return providerTransferId;
    }

    public void setProviderTransferId(String providerTransferId) {
        this.providerTransferId = providerTransferId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public TransferStatus getStatus() {
        return status;
    }

    public void setStatus(TransferStatus status) {
        this.status = status;
    }

    public String getSettlementId() {
        return settlementId;
    }

    public void setSettlementId(String settlementId) {
        this.settlementId = settlementId;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
