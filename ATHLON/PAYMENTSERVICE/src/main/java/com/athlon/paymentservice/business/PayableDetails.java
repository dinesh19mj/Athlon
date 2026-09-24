package com.athlon.paymentservice.business;

import java.math.BigDecimal;
import java.util.UUID;

public class PayableDetails {

    private String referenceId;
    private String referenceType;
    private BigDecimal amount;
    private String currency = "INR";
    private UUID payeeRecipientId; // Organization UUID, null if ATHLON direct
    private String description;
    private String title;
    private String payerName;
    private String payerEmail;
    private String payerPhone;

    public PayableDetails() {
    }

    public PayableDetails(String referenceId, String referenceType, BigDecimal amount, String currency, UUID payeeRecipientId, String description) {
        this.referenceId = referenceId;
        this.referenceType = referenceType;
        this.amount = amount;
        this.currency = currency != null ? currency : "INR";
        this.payeeRecipientId = payeeRecipientId;
        this.description = description;
    }

    public String getReferenceId() {
        return referenceId;
    }

    public void setReferenceId(String referenceId) {
        this.referenceId = referenceId;
    }

    public String getReferenceType() {
        return referenceType;
    }

    public void setReferenceType(String referenceType) {
        this.referenceType = referenceType;
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

    public UUID getPayeeRecipientId() {
        return payeeRecipientId;
    }

    public void setPayeeRecipientId(UUID payeeRecipientId) {
        this.payeeRecipientId = payeeRecipientId;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
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
}
