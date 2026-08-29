package com.athlon.identityservice.organization.dto.request;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonSetter;

import jakarta.validation.constraints.NotNull;

public class UpdateFinanceRequest {

    @NotNull(message = "Finance UUID is required")
    private UUID financeUuid;

    private String transactionType; // EXPENSE or INCOME

    private String category;

    private String title;

    private BigDecimal amount;

    private LocalDate transactionDate;

    private String paymentMethod;

    private String paidToOrBy;

    private UUID memberUuid;

    private String notes;

    private String receiptUrl;

    public UpdateFinanceRequest() {
    }

    public UUID getFinanceUuid() {
        return financeUuid;
    }

    @JsonSetter("financeUuid")
    public void setFinanceUuid(Object finUuidObj) {
        if (finUuidObj == null) {
            this.financeUuid = null;
        } else if (finUuidObj instanceof UUID) {
            this.financeUuid = (UUID) finUuidObj;
        } else {
            String str = finUuidObj.toString().trim();
            if (str.isEmpty() || "null".equalsIgnoreCase(str) || "undefined".equalsIgnoreCase(str)) {
                this.financeUuid = null;
            } else {
                try {
                    this.financeUuid = UUID.fromString(str);
                } catch (IllegalArgumentException e) {
                    this.financeUuid = null;
                }
            }
        }
    }

    public String getTransactionType() {
        return transactionType;
    }

    public void setTransactionType(String transactionType) {
        this.transactionType = transactionType;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public LocalDate getTransactionDate() {
        return transactionDate;
    }

    public void setTransactionDate(LocalDate transactionDate) {
        this.transactionDate = transactionDate;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getPaidToOrBy() {
        return paidToOrBy;
    }

    public void setPaidToOrBy(String paidToOrBy) {
        this.paidToOrBy = paidToOrBy;
    }

    public UUID getMemberUuid() {
        return memberUuid;
    }

    @JsonSetter("memberUuid")
    public void setMemberUuid(Object memberUuidObj) {
        if (memberUuidObj == null) {
            this.memberUuid = null;
        } else if (memberUuidObj instanceof UUID) {
            this.memberUuid = (UUID) memberUuidObj;
        } else {
            String str = memberUuidObj.toString().trim();
            if (str.isEmpty() || "null".equalsIgnoreCase(str) || "undefined".equalsIgnoreCase(str)) {
                this.memberUuid = null;
            } else {
                try {
                    this.memberUuid = UUID.fromString(str);
                } catch (IllegalArgumentException e) {
                    this.memberUuid = null;
                }
            }
        }
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getReceiptUrl() {
        return receiptUrl;
    }

    public void setReceiptUrl(String receiptUrl) {
        this.receiptUrl = receiptUrl;
    }
}
