package com.athlon.paymentservice.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import com.athlon.paymentservice.entity.OfflinePaymentRecord;
import com.athlon.paymentservice.enums.OfflinePaymentMethod;
import com.athlon.paymentservice.enums.OfflinePaymentStatus;
import com.athlon.paymentservice.enums.PaymentPurpose;

public class OfflinePaymentResponse {

    private UUID id;
    private UUID organizationId;
    private PaymentPurpose purpose;
    private UUID entityId;
    private String entityName;
    private UUID payerId;
    private String payerName;
    private String payerEmail;
    private String payerPhone;
    private BigDecimal amount;
    private String currency;
    private OfflinePaymentMethod paymentMethod;
    private String utrNumber;
    private String receiptUrl;
    private String payerNotes;
    private OfflinePaymentStatus status;
    private UUID verifiedByStaffId;
    private String verifiedByStaffName;
    private LocalDateTime verifiedAt;
    private String staffReceiptNumber;
    private String staffNotes;
    private String rejectionReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public OfflinePaymentResponse() {
    }

    public static OfflinePaymentResponse fromEntity(OfflinePaymentRecord record) {
        OfflinePaymentResponse res = new OfflinePaymentResponse();
        res.setId(record.getId());
        res.setOrganizationId(record.getOrganizationId());
        res.setPurpose(record.getPurpose());
        res.setEntityId(record.getEntityId());
        res.setEntityName(record.getEntityName());
        res.setPayerId(record.getPayerId());
        res.setPayerName(record.getPayerName());
        res.setPayerEmail(record.getPayerEmail());
        res.setPayerPhone(record.getPayerPhone());
        res.setAmount(record.getAmount());
        res.setCurrency(record.getCurrency());
        res.setPaymentMethod(record.getPaymentMethod());
        res.setUtrNumber(record.getUtrNumber());
        res.setReceiptUrl(record.getReceiptUrl());
        res.setPayerNotes(record.getPayerNotes());
        res.setStatus(record.getStatus());
        res.setVerifiedByStaffId(record.getVerifiedByStaffId());
        res.setVerifiedByStaffName(record.getVerifiedByStaffName());
        res.setVerifiedAt(record.getVerifiedAt());
        res.setStaffReceiptNumber(record.getStaffReceiptNumber());
        res.setStaffNotes(record.getStaffNotes());
        res.setRejectionReason(record.getRejectionReason());
        res.setCreatedAt(record.getCreatedAt());
        res.setUpdatedAt(record.getUpdatedAt());
        return res;
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

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
