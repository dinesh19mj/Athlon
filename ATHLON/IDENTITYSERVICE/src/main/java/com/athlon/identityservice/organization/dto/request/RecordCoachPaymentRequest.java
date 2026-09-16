package com.athlon.identityservice.organization.dto.request;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import jakarta.validation.constraints.NotNull;

public class RecordCoachPaymentRequest {

    @NotNull(message = "Transaction UUID is required")
    private UUID transactionUuid;

    private BigDecimal amount;
    private LocalDate paidDate;
    private String paymentMethod;
    private String paymentRef;
    private String notes;

    public RecordCoachPaymentRequest() {
    }

    public UUID getTransactionUuid() {
        return transactionUuid;
    }

    public void setTransactionUuid(UUID transactionUuid) {
        this.transactionUuid = transactionUuid;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public LocalDate getPaidDate() {
        return paidDate;
    }

    public void setPaidDate(LocalDate paidDate) {
        this.paidDate = paidDate;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getPaymentRef() {
        return paymentRef;
    }

    public void setPaymentRef(String paymentRef) {
        this.paymentRef = paymentRef;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
