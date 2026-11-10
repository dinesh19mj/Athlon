package com.athlon.identityservice.subscription.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "organization_credit_grants", indexes = {
        @Index(name = "idx_credit_grants_account_id", columnList = "account_id"),
        @Index(name = "idx_credit_grants_status_expires", columnList = "status, expires_at")
})
public class OrganizationCreditGrant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "grant_id", updatable = false, nullable = false)
    private Long grantId;

    @Column(name = "account_id", nullable = false)
    private Long accountId;

    @Column(name = "credit_type", nullable = false, length = 32)
    private String creditType; // TOURNAMENT_CREDIT, AUCTION_ACTIVATION_CREDIT

    @Column(name = "initial_quantity", nullable = false)
    private Integer initialQuantity = 0;

    @Column(name = "remaining_quantity", nullable = false)
    private Integer remainingQuantity = 0;

    @Column(name = "source_type", nullable = false, length = 64)
    private String sourceType; // PACKAGE_PURCHASE, TOPUP, ADMIN_GRANT, PROMOTIONAL, SYSTEM_TRIAL

    @Column(name = "payment_order_id")
    private Long paymentOrderId;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "status", nullable = false, length = 32)
    private String status = "ACTIVE"; // ACTIVE, EXHAUSTED, EXPIRED, REVOKED

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public OrganizationCreditGrant() {
    }

    public OrganizationCreditGrant(Long accountId, String creditType, Integer initialQuantity, String sourceType, LocalDateTime expiresAt) {
        this.accountId = accountId;
        this.creditType = creditType;
        this.initialQuantity = initialQuantity;
        this.remainingQuantity = initialQuantity;
        this.sourceType = sourceType;
        this.expiresAt = expiresAt;
        this.status = "ACTIVE";
    }

    public Long getGrantId() {
        return grantId;
    }

    public void setGrantId(Long grantId) {
        this.grantId = grantId;
    }

    public Long getAccountId() {
        return accountId;
    }

    public void setAccountId(Long accountId) {
        this.accountId = accountId;
    }

    public String getCreditType() {
        return creditType;
    }

    public void setCreditType(String creditType) {
        this.creditType = creditType;
    }

    public Integer getInitialQuantity() {
        return initialQuantity;
    }

    public void setInitialQuantity(Integer initialQuantity) {
        this.initialQuantity = initialQuantity;
    }

    public Integer getRemainingQuantity() {
        return remainingQuantity;
    }

    public void setRemainingQuantity(Integer remainingQuantity) {
        this.remainingQuantity = remainingQuantity;
    }

    public String getSourceType() {
        return sourceType;
    }

    public void setSourceType(String sourceType) {
        this.sourceType = sourceType;
    }

    public Long getPaymentOrderId() {
        return paymentOrderId;
    }

    public void setPaymentOrderId(Long paymentOrderId) {
        this.paymentOrderId = paymentOrderId;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}

