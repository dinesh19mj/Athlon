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
@Table(name = "payment_refund", indexes = {
    @Index(name = "idx_payment_refund_provider_id", columnList = "provider_refund_id", unique = true),
    @Index(name = "idx_payment_refund_order_id", columnList = "payment_order_id")
})
public class PaymentRefund {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "payment_order_id", nullable = false)
    private PaymentOrder paymentOrder;

    @Column(name = "provider_refund_id", length = 64, unique = true)
    private String providerRefundId; // rfn_xxxx

    @Column(name = "amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(name = "currency", nullable = false, length = 3)
    private String currency = "INR";

    @Column(name = "reason", length = 512)
    private String reason;

    @Column(name = "status", nullable = false, length = 32)
    private String status = "INITIATED"; // INITIATED, PROCESSED, FAILED

    @Column(name = "requested_by", nullable = false, length = 128)
    private String requestedBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public PaymentRefund() {
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

    public String getProviderRefundId() {
        return providerRefundId;
    }

    public void setProviderRefundId(String providerRefundId) {
        this.providerRefundId = providerRefundId;
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

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getRequestedBy() {
        return requestedBy;
    }

    public void setRequestedBy(String requestedBy) {
        this.requestedBy = requestedBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
