package com.athlon.identityservice.rewards.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

import com.athlon.identityservice.rewards.enums.CreditSourceType;
import com.athlon.identityservice.rewards.enums.TransactionType;

public class CreditTransactionResponse {

    private UUID transactionUuid;
    private TransactionType transactionType;
    private CreditSourceType sourceType;
    private Long amount;
    private Long balanceBefore;
    private Long balanceAfter;
    private String referenceId;
    private String description;
    private LocalDateTime createdAt;

    public CreditTransactionResponse() {
    }

    public UUID getTransactionUuid() {
        return transactionUuid;
    }

    public void setTransactionUuid(UUID transactionUuid) {
        this.transactionUuid = transactionUuid;
    }

    public TransactionType getTransactionType() {
        return transactionType;
    }

    public void setTransactionType(TransactionType transactionType) {
        this.transactionType = transactionType;
    }

    public CreditSourceType getSourceType() {
        return sourceType;
    }

    public void setSourceType(CreditSourceType sourceType) {
        this.sourceType = sourceType;
    }

    public Long getAmount() {
        return amount;
    }

    public void setAmount(Long amount) {
        this.amount = amount;
    }

    public Long getBalanceBefore() {
        return balanceBefore;
    }

    public void setBalanceBefore(Long balanceBefore) {
        this.balanceBefore = balanceBefore;
    }

    public Long getBalanceAfter() {
        return balanceAfter;
    }

    public void setBalanceAfter(Long balanceAfter) {
        this.balanceAfter = balanceAfter;
    }

    public String getReferenceId() {
        return referenceId;
    }

    public void setReferenceId(String referenceId) {
        this.referenceId = referenceId;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
