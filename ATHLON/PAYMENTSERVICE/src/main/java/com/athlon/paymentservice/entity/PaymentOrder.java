  package com.athlon.paymentservice.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.athlon.paymentservice.enums.PaymentPurpose;
import com.athlon.paymentservice.enums.PaymentStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;

@Entity
@Table(name = "payment_order", indexes = {
    @Index(name = "idx_payment_order_payment_number", columnList = "payment_number", unique = true),
    @Index(name = "idx_payment_order_idempotency_key", columnList = "idempotency_key", unique = true),
    @Index(name = "idx_payment_order_provider_order_id", columnList = "provider_order_id", unique = true),
    @Index(name = "idx_payment_order_reference", columnList = "reference_type, reference_id")
})
public class PaymentOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "payment_number", nullable = false, unique = true, length = 64)
    private String paymentNumber; // e.g. ATH-PAY-20260921-XXXX

    @Column(name = "payer_user_id", nullable = false, length = 128)
    private String payerUserId;

    @Column(name = "payer_user_uuid")
    private UUID payerUserUuid;

    @Column(name = "payer_email", length = 128)
    private String payerEmail;

    @Column(name = "payer_phone", length = 32)
    private String payerPhone;

    @Column(name = "payee_recipient_id")
    private UUID payeeRecipientId; // Organization UUID, NULL for direct ATHLON subscriptions

    @Enumerated(EnumType.STRING)
    @Column(name = "purpose", nullable = false, length = 64)
    private PaymentPurpose purpose;

    @Column(name = "reference_type", nullable = false, length = 64)
    private String referenceType; // e.g. TOURNAMENT_REGISTRATION, VENUE_BOOKING

    @Column(name = "reference_id", nullable = false, length = 128)
    private String referenceId; // e.g. registration-uuid, booking-id

    @Column(name = "amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(name = "currency", nullable = false, length = 3)
    private String currency = "INR";

    @Column(name = "provider", nullable = false, length = 32)
    private String provider = "RAZORPAY";

    @Column(name = "provider_order_id", length = 64, unique = true)
    private String providerOrderId; // e.g. order_xxxx

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    private PaymentStatus status = PaymentStatus.CREATED;

    @Column(name = "idempotency_key", nullable = false, unique = true, length = 128)
    private String idempotencyKey;

    @Column(name = "description", length = 512)
    private String description;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public PaymentOrder() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getPaymentNumber() {
        return paymentNumber;
    }

    public void setPaymentNumber(String paymentNumber) {
        this.paymentNumber = paymentNumber;
    }

    public String getPayerUserId() {
        return payerUserId;
    }

    public void setPayerUserId(String payerUserId) {
        this.payerUserId = payerUserId;
    }

    public UUID getPayerUserUuid() {
        return payerUserUuid;
    }

    public void setPayerUserUuid(UUID payerUserUuid) {
        this.payerUserUuid = payerUserUuid;
    }

    public String getPayerEmail() {
        return payerEmail;
    }

    public void setPayerEmail(String payerEmail) {
        this.payerEmail = payerEmail;
    }

    public String getPayerPhone() {
        return payerPhone;
    }

    public void setPayerPhone(String payerPhone) {
        this.payerPhone = payerPhone;
    }

    public UUID getPayeeRecipientId() {
        return payeeRecipientId;
    }

    public void setPayeeRecipientId(UUID payeeRecipientId) {
        this.payeeRecipientId = payeeRecipientId;
    }

    public PaymentPurpose getPurpose() {
        return purpose;
    }

    public void setPurpose(PaymentPurpose purpose) {
        this.purpose = purpose;
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

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public String getProviderOrderId() {
        return providerOrderId;
    }

    public void setProviderOrderId(String providerOrderId) {
        this.providerOrderId = providerOrderId;
    }

    public PaymentStatus getStatus() {
        return status;
    }

    public void setStatus(PaymentStatus status) {
        this.status = status;
    }

    public String getIdempotencyKey() {
        return idempotencyKey;
    }

    public void setIdempotencyKey(String idempotencyKey) {
        this.idempotencyKey = idempotencyKey;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
