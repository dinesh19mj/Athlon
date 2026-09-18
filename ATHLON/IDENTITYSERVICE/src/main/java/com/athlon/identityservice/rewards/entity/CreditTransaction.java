package com.athlon.identityservice.rewards.entity;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;

import com.athlon.identityservice.rewards.enums.CreditSourceType;
import com.athlon.identityservice.rewards.enums.TransactionType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "credit_transactions")
public class CreditTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "transaction_id", updatable = false, nullable = false)
    private Long transactionId;

    @Column(name = "transaction_uuid", updatable = false, nullable = false, unique = true)
    private UUID transactionUuid;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "user_uuid", nullable = false)
    private UUID userUuid;

    @Column(name = "wallet_id", nullable = false)
    private Long walletId;

    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", nullable = false, length = 20)
    private TransactionType transactionType;

    @Enumerated(EnumType.STRING)
    @Column(name = "source_type", nullable = false, length = 50)
    private CreditSourceType sourceType;

    @Column(name = "amount", nullable = false)
    private Long amount;

    @Column(name = "balance_before", nullable = false)
    private Long balanceBefore;

    @Column(name = "balance_after", nullable = false)
    private Long balanceAfter;

    @Column(name = "reference_id", length = 100)
    private String referenceId;

    @Column(name = "description", length = 255)
    private String description;

    @Column(name = "metadata_json", columnDefinition = "TEXT")
    private String metadataJson;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "created_by")
    private Long createdBy;

    public CreditTransaction() {
    }

    public CreditTransaction(Long userId, UUID userUuid, Long walletId, TransactionType transactionType, CreditSourceType sourceType, Long amount, Long balanceBefore, Long balanceAfter, String referenceId, String description, Long createdBy) {
        this.userId = userId;
        this.userUuid = userUuid;
        this.walletId = walletId;
        this.transactionType = transactionType;
        this.sourceType = sourceType;
        this.amount = amount;
        this.balanceBefore = balanceBefore;
        this.balanceAfter = balanceAfter;
        this.referenceId = referenceId;
        this.description = description;
        this.createdBy = createdBy;
    }

    @PrePersist
    public void prePersist() {
        if (transactionUuid == null) {
            transactionUuid = UUID.randomUUID();
        }
    }

    public Long getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(Long transactionId) {
        this.transactionId = transactionId;
    }

    public UUID getTransactionUuid() {
        return transactionUuid;
    }

    public void setTransactionUuid(UUID transactionUuid) {
        this.transactionUuid = transactionUuid;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public UUID getUserUuid() {
        return userUuid;
    }

    public void setUserUuid(UUID userUuid) {
        this.userUuid = userUuid;
    }

    public Long getWalletId() {
        return walletId;
    }

    public void setWalletId(Long walletId) {
        this.walletId = walletId;
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

    public String getMetadataJson() {
        return metadataJson;
    }

    public void setMetadataJson(String metadataJson) {
        this.metadataJson = metadataJson;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Long getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(Long createdBy) {
        this.createdBy = createdBy;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof CreditTransaction)) return false;
        CreditTransaction that = (CreditTransaction) o;
        return Objects.equals(transactionId, that.transactionId) &&
               Objects.equals(transactionUuid, that.transactionUuid);
    }

    @Override
    public int hashCode() {
        return Objects.hash(transactionId, transactionUuid);
    }
}
