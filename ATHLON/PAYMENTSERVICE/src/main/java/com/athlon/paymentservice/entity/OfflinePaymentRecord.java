package com.athlon.paymentservice.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.athlon.paymentservice.enums.OfflinePaymentMethod;
import com.athlon.paymentservice.enums.OfflinePaymentStatus;
import com.athlon.paymentservice.enums.PaymentPurpose;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "offline_payment_records", indexes = {
    @Index(name = "idx_offline_pay_org", columnList = "organization_id"),
    @Index(name = "idx_offline_pay_entity", columnList = "entity_id, purpose"),
    @Index(name = "idx_offline_pay_payer", columnList = "payer_id"),
    @Index(name = "idx_offline_pay_status", columnList = "status")
})
public class OfflinePaymentRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;

    @Enumerated(EnumType.STRING)
    @Column(name = "purpose", nullable = false, length = 64)
    private PaymentPurpose purpose;

    @Column(name = "entity_id", nullable = false)
    private UUID entityId;

    @Column(name = "entity_name", length = 255)
    private String entityName;

    @Column(name = "payer_id", nullable = false)
    private UUID payerId;

    @Column(name = "payer_name", length = 128)
    private String payerName;

    @Column(name = "payer_email", length = 128)
    private String payerEmail;

    @Column(name = "payer_phone", length = 32)
    private String payerPhone;

    @Column(name = "amount", precision = 12, scale = 2, nullable = false)
    private BigDecimal amount;

    @Column(name = "currency", length = 8, nullable = false)
    private String currency = "INR";

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false, length = 32)
    private OfflinePaymentMethod paymentMethod;

    @Column(name = "utr_number", length = 128)
    private String utrNumber;

    @Column(name = "receipt_url", length = 512)
    private String receiptUrl;

    @Column(name = "payer_notes", columnDefinition = "TEXT")
    private String payerNotes;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    private OfflinePaymentStatus status = OfflinePaymentStatus.PENDING_VERIFICATION;

    @Column(name = "verified_by_staff_id")
    private UUID verifiedByStaffId;

    @Column(name = "verified_by_staff_name", length = 128)
    private String verifiedByStaffName;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @Column(name = "staff_receipt_number", length = 64)
    private String staffReceiptNumber;

    @Column(name = "staff_notes", columnDefinition = "TEXT")
    private String staffNotes;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public OfflinePaymentRecord() {
    }

    @PrePersist
    public void prePersist() {
        if (this.currency == null) {
            this.currency = "INR";
        }
        if (this.status == null) {
            this.status = OfflinePaymentStatus.PENDING_VERIFICATION;
        }
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getOrganizationId() {
        return organizationId;
    }

    public void setOrganizationId(UUID organizationId) {
        this.organizationId = organizationId;
    }

    public PaymentPurpose getPurpose() {
        return purpose;
    }

    public void setPurpose(PaymentPurpose purpose) {
        this.purpose = purpose;
    }

    public UUID getEntityId() {
        return entityId;
    }

    public void setEntityId(UUID entityId) {
        this.entityId = entityId;
    }

    public String getEntityName() {
        return entityName;
    }

    public void setEntityName(String entityName) {
        this.entityName = entityName;
    }

    public UUID getPayerId() {
        return payerId;
    }

    public void setPayerId(UUID payerId) {
        this.payerId = payerId;
    }

    public String getPayerName() {
        return payerName;
    }

    public void setPayerName(String payerName) {
        this.payerName = payerName;
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

    public OfflinePaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(OfflinePaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getUtrNumber() {
        return utrNumber;
    }

    public void setUtrNumber(String utrNumber) {
        this.utrNumber = utrNumber;
    }

    public String getReceiptUrl() {
        return receiptUrl;
    }

    public void setReceiptUrl(String receiptUrl) {
        this.receiptUrl = receiptUrl;
    }

    public String getPayerNotes() {
        return payerNotes;
    }

    public void setPayerNotes(String payerNotes) {
        this.payerNotes = payerNotes;
    }

    public OfflinePaymentStatus getStatus() {
        return status;
    }

    public void setStatus(OfflinePaymentStatus status) {
        this.status = status;
    }

    public UUID getVerifiedByStaffId() {
        return verifiedByStaffId;
    }

    public void setVerifiedByStaffId(UUID verifiedByStaffId) {
        this.verifiedByStaffId = verifiedByStaffId;
    }

    public String getVerifiedByStaffName() {
        return verifiedByStaffName;
    }

    public void setVerifiedByStaffName(String verifiedByStaffName) {
        this.verifiedByStaffName = verifiedByStaffName;
    }

    public LocalDateTime getVerifiedAt() {
        return verifiedAt;
    }

    public void setVerifiedAt(LocalDateTime verifiedAt) {
        this.verifiedAt = verifiedAt;
    }

    public String getStaffReceiptNumber() {
        return staffReceiptNumber;
    }

    public void setStaffReceiptNumber(String staffReceiptNumber) {
        this.staffReceiptNumber = staffReceiptNumber;
    }

    public String getStaffNotes() {
        return staffNotes;
    }

    public void setStaffNotes(String staffNotes) {
        this.staffNotes = staffNotes;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
