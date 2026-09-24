package com.athlon.paymentservice.dto;

import java.math.BigDecimal;
import java.util.UUID;

import com.athlon.paymentservice.enums.OfflinePaymentMethod;
import com.athlon.paymentservice.enums.PaymentPurpose;

import jakarta.validation.constraints.NotNull;

public class OfflinePaymentSubmitRequest {

    @NotNull(message = "Organization ID is required")
    private UUID organizationId;

    @NotNull(message = "Payment purpose is required")
    private PaymentPurpose purpose;

    @NotNull(message = "Entity ID is required")
    private UUID entityId;

    private String entityName;

    @NotNull(message = "Payer ID is required")
    private UUID payerId;

    private String payerName;
    private String payerEmail;
    private String payerPhone;

    @NotNull(message = "Amount is required")
    private BigDecimal amount;

    private String currency = "INR";

    @NotNull(message = "Payment method is required")
    private OfflinePaymentMethod paymentMethod;

    private String utrNumber;
    private String receiptUrl;
    private String payerNotes;

    public OfflinePaymentSubmitRequest() {
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
}
