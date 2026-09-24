package com.athlon.paymentservice.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "payment_transaction", indexes = {
    @Index(name = "idx_payment_txn_provider_id", columnList = "provider_payment_id", unique = true),
    @Index(name = "idx_payment_txn_order_id", columnList = "payment_order_id")
})
public class PaymentTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "payment_order_id", nullable = false)
    private PaymentOrder paymentOrder;

    @Column(name = "provider_payment_id", nullable = false, unique = true, length = 64)
    private String providerPaymentId; // pay_xxxx

    @Column(name = "amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(name = "payment_method", length = 32)
    private String paymentMethod; // UPI, CARD, NETBANKING, WALLET

    @Column(name = "status", nullable = false, length = 32)
    private String status; // AUTHORIZED, CAPTURED, FAILED

    @Column(name = "signature_verified", nullable = false)
    private Boolean signatureVerified = false;

    @Column(name = "failure_code", length = 64)
    private String failureCode;

    @Column(name = "failure_reason", length = 512)
    private String failureReason;

    @Column(name = "captured_at")
    private LocalDateTime capturedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public PaymentTransaction() {
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

    public String getProviderPaymentId() {
        return providerPaymentId;
    }

    public void setProviderPaymentId(String providerPaymentId) {
        this.providerPaymentId = providerPaymentId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Boolean getSignatureVerified() {
        return signatureVerified;
    }

    public void setSignatureVerified(Boolean signatureVerified) {
        this.signatureVerified = signatureVerified;
    }

    public String getFailureCode() {
        return failureCode;
    }

    public void setFailureCode(String failureCode) {
        this.failureCode = failureCode;
    }

    public String getFailureReason() {
        return failureReason;
    }

    public void setFailureReason(String failureReason) {
        this.failureReason = failureReason;
    }

    public LocalDateTime getCapturedAt() {
        return capturedAt;
    }

    public void setCapturedAt(LocalDateTime capturedAt) {
        this.capturedAt = capturedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
