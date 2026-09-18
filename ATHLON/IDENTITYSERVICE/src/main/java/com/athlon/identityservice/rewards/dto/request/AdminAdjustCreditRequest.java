package com.athlon.identityservice.rewards.dto.request;

import com.athlon.identityservice.rewards.enums.TransactionType;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class AdminAdjustCreditRequest {

    @NotNull(message = "User ID cannot be null")
    private Long userId;

    @NotNull(message = "Transaction type cannot be null")
    private TransactionType transactionType;

    @NotNull(message = "Amount cannot be null")
    @Min(value = 1, message = "Amount must be at least 1")
    private Long amount;

    @NotBlank(message = "Reason / description is required")
    private String reason;

    public AdminAdjustCreditRequest() {
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public TransactionType getTransactionType() {
        return transactionType;
    }

    public void setTransactionType(TransactionType transactionType) {
        this.transactionType = transactionType;
    }

    public Long getAmount() {
        return amount;
    }

    public void setAmount(Long amount) {
        this.amount = amount;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
